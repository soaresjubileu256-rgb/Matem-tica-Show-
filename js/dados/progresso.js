/* =========================================================
   Progresso, histórico e erros — tudo separado por conta
   ========================================================= */
function currentUserId(){ return (currentUser && currentUser.id) ? currentUser.id : 'anon'; }

const PROGRESS_KEY_BASE = 'mathstudy-progress-v2';
const HISTORY_KEY_BASE = 'mathstudy-history-v1';
const ERRORS_KEY_BASE = 'mathstudy-errors-v1';
const HISTORY_LIMIT = 300; // guarda só as últimas N respostas por conta
const ERRORS_LIMIT = 150;  // guarda só os últimos N erros ainda não revisados

let progressCache = null, progressCacheUid = null;
let historyCache = null, historyCacheUid = null;
let errorsCache = null, errorsCacheUid = null;

async function loadProgress(){
  const uid = currentUserId();
  if(progressCache && progressCacheUid===uid) return progressCache;
  try{
    const raw = localStorage.getItem(`${PROGRESS_KEY_BASE}:${uid}`);
    progressCache = raw ? JSON.parse(raw) : {};
  }catch(e){ progressCache = {}; }
  progressCacheUid = uid;
  return progressCache;
}
async function saveProgress(){
  try{ localStorage.setItem(`${PROGRESS_KEY_BASE}:${progressCacheUid}`, JSON.stringify(progressCache)); }catch(e){}
}

async function loadHistory(){
  const uid = currentUserId();
  if(historyCache && historyCacheUid===uid) return historyCache;
  try{
    const raw = localStorage.getItem(`${HISTORY_KEY_BASE}:${uid}`);
    historyCache = raw ? JSON.parse(raw) : [];
  }catch(e){ historyCache = []; }
  historyCacheUid = uid;
  return historyCache;
}
async function saveHistory(){
  try{ localStorage.setItem(`${HISTORY_KEY_BASE}:${historyCacheUid}`, JSON.stringify(historyCache)); }catch(e){}
}

async function loadErrors(){
  const uid = currentUserId();
  if(errorsCache && errorsCacheUid===uid) return errorsCache;
  try{
    const raw = localStorage.getItem(`${ERRORS_KEY_BASE}:${uid}`);
    errorsCache = raw ? JSON.parse(raw) : [];
  }catch(e){ errorsCache = []; }
  errorsCacheUid = uid;
  return errorsCache;
}
async function saveErrors(){
  try{ localStorage.setItem(`${ERRORS_KEY_BASE}:${errorsCacheUid}`, JSON.stringify(errorsCache)); }catch(e){}
}

/* retrato leve e serializável da questão, pra poder mostrar de novo depois (histórico / revisão de erros) */
function snapshotExercise(ex){
  try{ return JSON.parse(JSON.stringify(ex)); }catch(e){ return null; }
}

/* única forma de somar uma resposta no progresso do assunto (exercícios, trilha, Arena,
   simulado, revisão de erros...): acertos, data da última prática e últimas 10 respostas */
function bumpProgress(p, subjectId, correct, difficulty){
  if(!p[subjectId]) p[subjectId] = {attempted:0, correct:0};
  const d = p[subjectId];
  d.attempted++;
  if(correct) d.correct++;
  d.last = Date.now(); // usado pela revisão espaçada
  // últimas 10 respostas (ok + se era difícil), usadas no nível de domínio
  d.recent = (d.recent || []).concat([{ok:!!correct, h:difficulty==='dificil'}]).slice(-10);
  return d;
}
async function recordAnswer(subjectId, correct, extra){
  extra = extra || {};
  const p = await loadProgress();
  bumpProgress(p, subjectId, correct, extra.difficulty);
  await saveProgress();
  gameOnAnswer(subjectId, correct, extra.difficulty);

  const subj = SUBJECTS.find(s=>s.id===subjectId);
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    ts: Date.now(),
    subjectId,
    subjectName: subj ? subj.name : subjectId,
    difficulty: extra.difficulty || null,
    correct,
    ex: extra.ex ? snapshotExercise(extra.ex) : null,
  };

  const hist = await loadHistory();
  hist.unshift(entry);
  if(hist.length > HISTORY_LIMIT) hist.length = HISTORY_LIMIT;
  await saveHistory();

  if(!correct && entry.ex) await noteError(entry);
}

/* ---------- caderno de erros inteligente (revisão espaçada por questão) ----------
   Cada erro guarda assunto, dificuldade, quantas vezes foi errado e uma "caixa":
   caixa 1 = revisar já; acertou na revisão → caixa 2 (volta em 3 dias) → caixa 3 (volta em 7 dias);
   acertou na caixa 3 → sai do caderno (aprendido). Errou de novo → volta pra caixa 1 (amanhã). */
const ERROR_BOX_DAYS = [0, 0, 3, 7];
function errorQuestionKey(e){ return e && e.ex ? `${e.subjectId}|${e.ex.question}|${JSON.stringify(e.ex.answer)}` : ''; }
function errorIsDue(e, now){ return !e.due || e.due <= (now || Date.now()); }
async function noteError(entry){
  const errs = await loadErrors();
  const key = errorQuestionKey(entry);
  const i = errs.findIndex(e=>errorQuestionKey(e)===key);
  if(i >= 0){
    // mesma questão errada de novo: não duplica, só conta mais um erro e volta pra caixa 1
    const old = errs.splice(i,1)[0];
    entry.count = (old.count||1) + 1;
    entry.firstTs = old.firstTs || old.ts;
  } else { entry.count = 1; entry.firstTs = entry.ts; }
  entry.box = 1; entry.due = Date.now();
  errs.unshift(entry);
  if(errs.length > ERRORS_LIMIT) errs.length = ERRORS_LIMIT;
  await saveErrors();
}
/* resultado da revisão de um erro. Devolve 'learned' (saiu do caderno), 'up' (subiu de caixa) ou 'again' */
async function reviewErrorResult(errorId, correct){
  const errs = await loadErrors();
  const idx = errs.findIndex(e=>e.id===errorId);
  if(idx < 0) return correct ? 'learned' : 'again';
  const e = errs[idx];
  let res;
  if(correct){
    const box = e.box || 1;
    if(box >= 3){ errs.splice(idx,1); res = 'learned'; const g = loadGame(); g.errLearned = (g.errLearned||0) + 1; saveGame(); }
    else { e.box = box + 1; e.due = Date.now() + ERROR_BOX_DAYS[e.box]*864e5; res = 'up'; }
  } else {
    e.box = 1; e.due = Date.now() + 864e5; e.count = (e.count||1) + 1; e.lastWrong = Date.now(); res = 'again';
  }
  await saveErrors();
  return res;
}
/* recomendação: assuntos que mais precisam de treino, somando erros guardados (com peso pelas
   vezes que a questão foi errada e pela dificuldade) e o % de acerto recente */
function recommendSubjects(progress, errs, n){
  const score = {};
  (errs||[]).forEach(e=>{ score[e.subjectId] = (score[e.subjectId]||0) + (e.count||1) * (e.difficulty==='dificil' ? 1.5 : 1); });
  Object.entries(progress||{}).forEach(([id,d])=>{
    if(!d || !d.attempted) return;
    const rec = d.recent && d.recent.length>=5 ? d.recent.filter(r=>r.ok).length/d.recent.length : d.correct/d.attempted;
    if(d.attempted >= 3 && rec < .75) score[id] = (score[id]||0) + (1-rec)*6;
  });
  return Object.entries(score).filter(([id])=>SUBJECTS.some(s=>s.id===id)).sort((a,b)=>b[1]-a[1]).slice(0, n||3).map(([id])=>id);
}


/* ---------- revisão espaçada ----------
   Cada assunto já praticado "vence" depois de um intervalo que cresce com o % de acerto:
   quem erra muito revê amanhã; quem domina, só daqui a uma semana. */
const REVIEW_MIN_ATTEMPTS = 3;
function reviewIntervalDays(acc){ return acc>=0.9 ? 7 : acc>=0.75 ? 4 : acc>=0.5 ? 2 : 1; }
function dueReviewSubjects(progress){
  const now = Date.now();
  return SUBJECTS.filter(s=>{
    const d = progress[s.id];
    if(!d || d.attempted < REVIEW_MIN_ATTEMPTS) return false;
    const acc = d.correct/d.attempted;
    if(!d.last) return acc < 0.75; // dados antigos, sem data: revisa só o que ainda está fraco
    return now - d.last >= reviewIntervalDays(acc)*864e5;
  }).sort((a,b)=>(progress[a.id].correct/progress[a.id].attempted)-(progress[b.id].correct/progress[b.id].attempted));
}
async function startSpacedReview(){
  const progress = await loadProgress();
  const due = dueReviewSubjects(progress).slice(0,4);
  if(!due.length) return;
  startPersonalizedSession({subjectIds: due.map(s=>s.id), difficultyMode:'adaptativa', qty: Math.min(10, Math.max(5, due.length*3)), focusWeak: due.length>1, progress, isReview:true});
}
