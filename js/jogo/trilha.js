/* =========================================================
   Trilha do Show — episódios com fases, vidas (❤️), moedas (🪙),
   o mascote Pi (apresentador), fases de múltipla escolha e o
   Quiz do Show (cronômetro circular, pontos por velocidade).
   ========================================================= */
const HEARTS_MAX = 5;
const HEART_REGEN_MS = 20*60*1000;   // 1 vida a cada 20 min
const HEART_REFILL_COST = 50;        // recarga total com moedas
const PATH_NODES = [
  {type:'lesson', diff:'facil',   n:5, label:'Fase 1 · Fácil'},
  {type:'lesson', diff:'medio',   n:5, label:'Fase 2 · Médio'},
  {type:'chest',                        label:'Prêmio surpresa'},
  {type:'lesson', diff:'dificil', n:5, label:'Fase 3 · Difícil'},
  {type:'trophy',                 n:8, label:'Grande final'},
];
const UNIT_COLORS = [['#4C7DFF','#7B5CFF'],['#B23FE0','#E0409A'],['#1FB6D0','#2BE0A6'],['#FF5C7A','#FF8A4C'],['#E09A00','#FF7A00'],['#6A5CFF','#33D2E3'],['#E0306A','#B23FE0']];
function unitStyle(u){ const [a,b] = UNIT_COLORS[u % UNIT_COLORS.length]; return `--uc:${a};--uc2:${b}`; }
const PATH_OFFSETS = [0, 48, 76, 48, 0, -48, -76, -48];
const QUIZ_SECONDS = 20;
const QUIZ_TOTAL = 10;

function allPathNodes(){
  const list = [];
  SUBJECTS.forEach((s,u)=> PATH_NODES.forEach((n,i)=> list.push(Object.assign({key:`${s.id}:${i}`, unit:u, idx:i, subject:s}, n))));
  return list;
}
function pathDone(){ const g = loadGame(); g.path = g.path || {}; return g.path; }
function pathCurrentIndex(){
  const done = pathDone(), all = allPathNodes();
  const i = all.findIndex(n=>!done[n.key]);
  return i<0 ? all.length : i;
}

/* ---------- vidas e moedas ---------- */
function heartsNow(){
  const g = loadGame();
  if(g.hearts===undefined){ g.hearts = HEARTS_MAX; g.heartTs = Date.now(); }
  if(g.gems===undefined) g.gems = 20;
  if(g.hearts < HEARTS_MAX){
    const n = Math.floor((Date.now() - (g.heartTs||Date.now())) / HEART_REGEN_MS);
    if(n>0){ g.hearts = Math.min(HEARTS_MAX, g.hearts+n); g.heartTs += n*HEART_REGEN_MS; saveGame(); }
  }
  return g.hearts;
}
function loseHeart(){
  const g = loadGame(); heartsNow();
  if(g.hearts===HEARTS_MAX) g.heartTs = Date.now();
  g.hearts = Math.max(0, g.hearts-1);
  saveGame();
}
function nextHeartIn(){
  const g = loadGame(); heartsNow();
  if(g.hearts>=HEARTS_MAX) return 0;
  return Math.max(0, HEART_REGEN_MS - (Date.now()-g.heartTs));
}
function gemsNow(){ heartsNow(); return loadGame().gems; }
function addGems(n){ const g = loadGame(); heartsNow(); g.gems += n; saveGame(); }
function refillHeartsWithGems(){
  const g = loadGame(); heartsNow();
  if(g.gems < HEART_REFILL_COST) return false;
  g.gems -= HEART_REFILL_COST; g.hearts = HEARTS_MAX; g.heartTs = Date.now();
  saveGame(); playTones([523,784,1047], 0.08, 'triangle', 0.1);
  return true;
}
function fmtMinSec(ms){ const s = Math.ceil(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* ---------- mascote: Pi, o apresentador do show (cartola com a logo + gravata-borboleta) ---------- */
let _mascotSeq = 0;
function mascotSVG(mood, size){
  mood = mood || 'happy'; size = size || 88;
  const id = 'pi' + (++_mascotSeq);
  const eyes = mood==='sad'
    ? `<ellipse cx="39" cy="56" rx="6" ry="7" fill="#fff"/><ellipse cx="61" cy="56" rx="6" ry="7" fill="#fff"/><circle cx="39" cy="58" r="3.4" fill="#1B1E45"/><circle cx="61" cy="58" r="3.4" fill="#1B1E45"/>
       <path d="M31 47 l12 3 M69 47 l-12 3" stroke="#1B1E45" stroke-width="2.6" stroke-linecap="round"/>`
    : mood==='joy'
    ? `<path d="M32 57 q7 -9 14 0" stroke="#1B1E45" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M54 57 q7 -9 14 0" stroke="#1B1E45" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="39" cy="55" rx="7" ry="8.5" fill="#fff"/><ellipse cx="61" cy="55" rx="7" ry="8.5" fill="#fff"/><circle cx="40" cy="56" r="4" fill="#1B1E45"/><circle cx="62" cy="56" r="4" fill="#1B1E45"/><circle cx="41.5" cy="54" r="1.4" fill="#fff"/><circle cx="63.5" cy="54" r="1.4" fill="#fff"/>`;
  const mouth = mood==='sad'
    ? `<path d="M43 72 q7 -5 14 0" stroke="#1B1E45" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : mood==='joy'
    ? `<path d="M40 66 q10 13 20 0 Z" fill="#1B1E45"/><path d="M45 71 q5 4 10 0" fill="#FF7A9A"/>`
    : `<path d="M42 67 q8 8 16 0" stroke="#1B1E45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<svg class="mascot ${mood}" viewBox="0 0 100 104" width="${size}" height="${size}" aria-hidden="true">
    <defs>
      <radialGradient id="${id}b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#7FE8F2"/><stop offset=".55" stop-color="#33D2E3"/><stop offset="1" stop-color="#4C7DFF"/></radialGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A9E"/><stop offset="1" stop-color="#1B1E45"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="99" rx="24" ry="4" fill="rgba(0,0,0,.25)"/>
    <path d="M22 70 q-10 -2 -10 -12" stroke="#33D2E3" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M78 70 q10 -4 12 -16" stroke="#33D2E3" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="90" cy="52" r="5" fill="#33D2E3"/><path d="M90 47 l2 -8 l-4 0 Z" fill="#FFB800"/><circle cx="90" cy="37" r="4" fill="#FFB800"/>
    <circle cx="50" cy="62" r="32" fill="url(#${id}b)"/>
    <ellipse cx="38" cy="46" rx="8" ry="5" fill="rgba(255,255,255,.35)" transform="rotate(-25 38 46)"/>
    <circle cx="30" cy="68" r="4.5" fill="#FF7A9A" opacity=".55"/><circle cx="70" cy="68" r="4.5" fill="#FF7A9A" opacity=".55"/>
    ${eyes}
    ${mouth}
    <path d="M40 90 l10 4 l-10 4 Z M60 90 l-10 4 l10 4 Z" fill="#FF5C7A"/><circle cx="50" cy="94" r="3" fill="#FFB800"/>
    <g transform="rotate(-8 50 30)">
      <ellipse cx="50" cy="32" rx="25" ry="5" fill="url(#${id}h)"/>
      <rect x="36" y="6" width="28" height="26" rx="4" fill="url(#${id}h)"/>
      <rect x="36" y="23" width="28" height="5" fill="#B23FE0"/>
      <image href="${LOGO_URI}" x="40.5" y="5" width="19" height="19" preserveAspectRatio="xMidYMid meet"/>
    </g>
  </svg>`;
}
function mascotBubble(text, mood){
  return h(`<div class="mascot-row">${mascotSVG(mood||'happy', 78)}<div class="bubble">${text}</div></div>`);
}

/* ---------- múltipla escolha a partir de qualquer questão ---------- */
function answerLabel(ex){
  if(ex.type==='pair') return `x' = ${fmt(ex.answer[0])}  ·  x'' = ${fmt(ex.answer[1])}`;
  if(ex.type==='xy') return `x = ${fmt(ex.answer.x)}  ·  y = ${fmt(ex.answer.y)}`;
  return ex.displayAnswer!==undefined ? String(ex.displayAnswer) : fmt(ex.answer);
}
function buildOptions(ex){
  const correct = answerLabel(ex);
  const cands = [];
  if(ex.type==='pair'){
    const [a,b] = ex.answer;
    [[-a,-b],[a+1,b-1],[a-1,b+1],[a*2,b],[a,b+2],[-a,b],[a+2,b+1]].forEach(([p,q])=>{
      if([p,q].sort().join()!==[a,b].sort().join()) cands.push(`x' = ${fmt(p)}  ·  x'' = ${fmt(q)}`);
    });
  } else if(ex.type==='xy'){
    const {x,y} = ex.answer;
    [[y,x],[x+1,y],[x,y-1],[-x,y],[x+2,y+1],[x-1,y+1],[x,-y]].forEach(([p,q])=>{
      if(p!==x || q!==y) cands.push(`x = ${fmt(p)}  ·  y = ${fmt(q)}`);
    });
  } else if(typeof ex.displayAnswer==='string' && ex.displayAnswer.includes('/')){
    const [n,d] = ex.displayAnswer.split('/').map(Number);
    [[d,n],[n+1,d],[n,d+1],[n-1,d],[n+d,d],[n,d*2],[n*2,d+1]].forEach(([p,q])=>{
      if(q>0 && p>0 && Math.abs(p/q - n/d)>1e-9) cands.push(fracStr(p,q));
    });
  } else {
    const a = Number(ex.answer);
    const dec = (String(a).split('.')[1]||'').length;
    const st = Math.pow(10,-dec);
    const r = v=> Math.round(v*1e6)/1e6;
    [a+1,a-1,a+st,a-st,a+10*st,a-10*st,a*10,a/10,a+2,a-2,-a,a+10,a-10,a*2].forEach(v=>{
      v = r(v);
      if(v!==a && (a<0 || v>=0)) cands.push(ex.displayAnswer!==undefined && Number.isInteger(v) ? String(v) : fmt(v));
    });
  }
  const uniq = [...new Set(cands)].filter(l=>l!==correct);
  const picked = uniq.sort(()=>Math.random()-.5).slice(0,3);
  let k = 3;
  while(picked.length<3 && k<60){
    const d = (k++)*3;
    const extra = ex.type==='pair' ? `x' = ${fmt(ex.answer[0]+d)}  ·  x'' = ${fmt(ex.answer[1])}`
      : ex.type==='xy' ? `x = ${fmt(ex.answer.x+d)}  ·  y = ${fmt(ex.answer.y)}`
      : fmt(Number(ex.answer)+d);
    if(extra!==correct && !picked.includes(extra)) picked.push(extra);
  }
  return [correct, ...picked].sort(()=>Math.random()-.5).map(l=>({label:l, ok:l===correct}));
}
function questionHTML(ex){
  if(ex.columns) return {stacked:true, html: contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`};
  if(ex.visual) return {stacked:true, html: fracRow(ex.visual)};
  if(ex.qVisual) return {stacked:true, html: ex.qVisual};
  return {stacked:false, html: ex.question.replace(/\n/g,'<br>')};
}
function solutionHTML(ex){
  let stepsList = ex.steps;
  if(ex.columns){
    stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
  } else if(ex.visual){
    const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
    const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
    stepsList = [fracRow(ex.visual.slice(0, -2).concat(['=', ansToken])), ...ex.steps];
  } else if(ex.solvedVisual){
    stepsList = [ex.solvedVisual, ...ex.steps];
  }
  return stepsList.map(st=>`<div class="step">${st}</div>`).join('');
}

/* ---------- iniciar lições / quiz ---------- */
function newLessonQuestion(sess){
  const subj = SUBJECTS.find(s=>s.id===sess.subjectId) || pick(SUBJECTS);
  let diff = sess.diff;
  if(diff==='mix') diff = (sess.asked % 2) ? 'dificil' : 'medio';
  const {ex, signature} = genQuestionAvoidingRepeat(subj, diff, sess.lastSignature);
  sess.lastSignature = signature;
  return {ex, subjectId:subj.id, diff, opts: buildOptions(ex)};
}
function startPathLesson(node, jump){
  if(!jump && heartsNow()<=0){ showNoHearts(); return; }
  const sess = {
    kind:'lesson', nodeKey: jump ? null : node.key, jumpUnit: jump ? node.unit : null,
    subjectId: node.subject.id, diff: jump ? 'mix' : (node.type==='trophy' ? 'mix' : node.diff),
    needed: jump ? 6 : node.n, maxWrong: jump ? 2 : null,
    asked:0, cleared:0, correct:0, wrong:0, retry:[], combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs: Date.now(), lastSignature:null,
  };
  sess.q = newLessonQuestion(sess); sess.asked++;
  state.session = sess;
  go('lesson');
}
/* Quiz do Show: de quais assuntos vêm as perguntas */
const QUIZ_POOLS = [['all','🌎','Todos'], ['fund','📘','Fundamental'], ['em','🎓','Ensino Médio']];
const QUIZ_HELPS = [['fifty','½','50:50','Tira 2 erradas'], ['time','⏱','+10s','Mais tempo'], ['skip','⏭','Pular','Troca a pergunta']];
/* recorde por dificuldade; "Todos" usa a mesma chave de antes (não perde o recorde antigo) */
const quizBestKey = (pool, diff)=> (!pool || pool==='all') ? diff : `${pool}:${diff}`;
function quizPickSubject(sess){
  const ids = sess.pool && sess.pool!=='all' ? levelIds(sess.pool) : SUBJECTS.map(s=>s.id);
  const list = SUBJECTS.filter(s=> ids.includes(s.id) && s.id!==sess.subjectId);
  return (list.length ? pick(list) : pick(SUBJECTS)).id;
}
function startQuiz(difficulty, pool){
  pool = pool || 'all';
  const sess = {kind:'quiz', diff:difficulty, pool, needed:QUIZ_TOTAL, asked:0, cleared:0, correct:0, wrong:0, score:0, qStreak:0, bestStreak:0, combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs:Date.now(), lastSignature:null, lastPoints:0,
    helps:{fifty:true, time:true, skip:true}, log:[]};
  sess.subjectId = quizPickSubject(sess);
  sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
  state.session = sess;
  go('lesson');
}
function lessonAdvance(sess){
  sess.selected = null; sess.checked = false; sess.wasCorrect = null; sess.tryAgain = false;
  if(sess.kind==='quiz'){
    if(sess.asked >= sess.needed || sess.outOfLives){ sess.finished = true; return; }
    if(sess.mode){ arenaNextQuestion(sess); return; } // Arena: fase de um assunto ou Desafio do Dia
    sess.subjectId = quizPickSubject(sess);
    sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
    return;
  }
  if(sess.maxWrong!==null && sess.wrong > sess.maxWrong){ sess.failed = true; return; }
  if(sess.cleared >= sess.needed){ sess.finished = true; return; }
  const newLeft = sess.needed - sess.cleared - sess.retry.length;
  if(newLeft > 0){ sess.q = newLessonQuestion(sess); sess.asked++; }
  else { const q = sess.retry.shift(); q.opts = buildOptions(q.ex); q.retry = true; sess.q = q; }
}

/* ---------- tela da fase / quiz ---------- */
function lessonScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.className = 'lesson-wrap';
  if(!sess || (sess.kind!=='lesson' && sess.kind!=='quiz')){ setTimeout(()=>go('home'),0); return wrap; }
  const isQuiz = sess.kind==='quiz';
  if(sess.finished || sess.failed){ lessonEnd(wrap, sess); return wrap; }

  const exitTo = sess.exitTo || (isQuiz ? 'quizSetup' : 'path');
  const top = h(`<div class="lesson-top"><button class="lesson-x" aria-label="Sair">✕</button><div class="lesson-prog"><i style="width:${Math.round((isQuiz? (sess.asked-1+(sess.checked?1:0)) : sess.cleared)/sess.needed*100)}%"></i></div>${
    isQuiz ? `${sess.lives!==undefined ? `<span class="lesson-hearts" aria-label="${sess.lives} vidas">❤️ ${sess.lives}</span>` : ''}<span class="lesson-score">🏅 ${sess.score}</span>` : sess.maxWrong!==null ? `<span class="lesson-hearts">🛡️ ${Math.max(0,sess.maxWrong+1-sess.wrong)}</span>` : `<span class="lesson-hearts">❤️ ${heartsNow()}</span>`
  }</div>`);
  top.querySelector('.lesson-x').onclick = ()=>{
    showConfirm({
      icon:'🚪', title: sess.mode==='daily' ? 'Sair do desafio?' : isQuiz && !sess.mode ? 'Sair do quiz?' : 'Sair da fase?',
      message: sess.mode==='daily' ? 'O Desafio do Dia vale uma tentativa: se sair agora, conta só o que você já respondeu.' : isQuiz && !sess.mode ? 'Sua pontuação desta partida será perdida.' : 'Você vai perder o progresso desta fase.',
      ok:'Sair', cancel: isQuiz ? 'Continuar jogando' : 'Continuar a fase', danger:true,
    }).then(ok=>{ if(ok){ if(sess.mode) arenaQuit(sess); go(exitTo); } });
  };
  wrap.appendChild(top);
  const c = h(`<div class="content lesson-body"></div>`);
  wrap.appendChild(c);

  const q = sess.q, ex = q.ex;
  const subj = SUBJECTS.find(s=>s.id===q.subjectId);
  if(isQuiz){
    const meta = h(`<div class="quiz-meta"><div class="qm-t">${sess.mode==='daily' ? `DESAFIO DO DIA · ${sess.asked}/${sess.needed}` : `PERGUNTA ${sess.asked} DE ${sess.needed}`}<br>${subj.sym} ${subj.name}${sess.mode==='arena' ? ` · ${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[sess.diff]}` : ''}</div>
      <div class="quiz-ring"><svg viewBox="0 0 58 58"><defs><linearGradient id="qr-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C7DFF"/><stop offset="1" stop-color="#B23FE0"/></linearGradient></defs>
      <circle class="trk" cx="29" cy="29" r="25" fill="none" stroke-width="6"/><circle class="bar" cx="29" cy="29" r="25" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="157.08"/></svg><span></span></div></div>`);
    c.appendChild(meta);
    const tb = meta.querySelector('.quiz-ring');
    const paint = ()=>{
      const QS = q.secs || QUIZ_SECONDS; // o Desafio do Dia dá mais tempo pras perguntas difíceis
      const left = sess.checked ? (sess.timeLeft||0) : Math.max(0, QS - (Date.now()-sess.qStart)/1000);
      tb.querySelector('.bar').style.strokeDashoffset = 157.08*(1 - left/QS);
      tb.querySelector('span').textContent = Math.ceil(left);
      tb.classList.toggle('low', left<=5);
      return left;
    };
    paint();
    if(!sess.checked){
      const timer = setInterval(()=>{
        if(!wrap.isConnected || state.session!==sess || sess.checked){ clearInterval(timer); return; }
        if(paint()<=0){ clearInterval(timer); lessonCheck(sess, null); }
      }, 100);
    }
    if(sess.helps && !sess.mode){
      const hb = h(`<div class="quiz-helps"></div>`);
      QUIZ_HELPS.forEach(([id,ico,label,tip])=>{
        const used = !sess.helps[id];
        const b = h(`<button type="button" class="qh ${used?'used':''}" title="${tip}" aria-label="${label}: ${tip}"><span class="qh-i">${ico}</span><span class="qh-l">${label}</span></button>`);
        b.disabled = used || sess.checked;
        b.onclick = ()=>{ if(sess.checked || !sess.helps[id]) return; sess.helps[id] = false; quizUseHelp(sess, id); };
        hb.appendChild(b);
      });
      c.appendChild(hb);
    }
  } else {
    c.appendChild(h(`<div class="lesson-kicker">${q.retry ? '🔁 ERRO ANTERIOR' : sess.jumpUnit!==null ? '⏩ TESTE DE NIVELAMENTO' : `${subj.sym} ${subj.name.toUpperCase()}`}</div>`));
    c.appendChild(h(`<h2 class="lesson-title">Escolha a resposta certa</h2>`));
  }
  const qv = questionHTML(ex);
  const qcard = h(`<div class="question-card lesson-q"><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(!isQuiz){
    const row = h(`<div class="lesson-q-row"></div>`);
    row.appendChild(h(`<div class="lesson-mascot">${mascotSVG(sess.checked ? (sess.wasCorrect?'joy':'sad') : (sess.tryAgain ? 'sad' : 'happy'), 64)}</div>`));
    row.appendChild(qcard);
    c.appendChild(row);
  } else c.appendChild(qcard);

  const opts = h(`<div class="${isQuiz?'quiz-opts':'mc-opts'}"></div>`);
  const shapes = ['A','B','C','D'];
  q.opts.forEach((o,i)=>{
    let cls = isQuiz ? 'quiz-opt' : 'mc-opt';
    if(sess.selected===i) cls += ' sel';
    const isOut = isQuiz ? (q.cut||[]).includes(i) : (q.out||[]).includes(i);
    if(isOut) cls += ' out';
    if(sess.checked){ if(o.ok) cls += ' right'; else if(sess.selected===i) cls += ' wrongpick'; else if(!isOut) cls += ' dim'; }
    const b = h(`<button type="button" class="${cls}">${isQuiz ? `<span class="shape">${shapes[i]}</span>` : `<span class="key">${shapes[i]}</span>`}<span class="lbl mono"></span></button>`);
    b.querySelector('.lbl').textContent = o.label;
    b.disabled = sess.checked || isOut;
    b.onclick = ()=>{
      if(sess.checked || isOut) return;
      if(isQuiz){ lessonCheck(sess, i); return; }
      sess.selected = i;
      playTones([520], 0.03, 'sine', 0.05);
      opts.querySelectorAll('.mc-opt').forEach((el,j)=> el.classList.toggle('sel', j===i));
      checkBtn.disabled = false;
    };
    opts.appendChild(b);
  });
  if(!sess.checked){
    const tip = isQuiz
      ? firstTimeTip('quiz', 'Responda rápido! O círculo mostra o tempo que falta — quanto mais rápido acertar, mais pontos. 🏅')
      : firstTimeTip('lesson', 'Toque na resposta que você acha certa e depois em <b>CONFIRMAR</b>. Errou? Sem problema: tente de novo, e se precisar peça uma dica 💡');
    if(tip) c.appendChild(tip);
  }
  c.appendChild(opts);
  if(!isQuiz && sess.tryAgain && !sess.checked){
    const tries = (q.out||[]).length;
    const hintHtml = HINTS[q.subjectId];
    const box = h(`<div class="try-again">
      <div class="ta-head"><span class="ta-ico">🤔</span><div><div class="ta-t">${tries>=2 ? 'Ainda não! Continue tentando' : 'Não é essa! Tente de novo'}</div><div class="ta-s">A alternativa riscada está errada. Pense de novo com calma.</div></div></div>
      ${hintHtml ? `<button type="button" class="ta-hint-btn">💡 Ver dica</button><div class="ta-hint" style="display:none">${hintHtml}</div>` : ''}
    </div>`);
    const hb = box.querySelector('.ta-hint-btn');
    if(hb){
      if(tries>=2){ box.querySelector('.ta-hint').style.display=''; hb.textContent = '💡 Esconder dica'; }
      hb.onclick = ()=>{ const d = box.querySelector('.ta-hint'); const open = d.style.display==='none'; d.style.display = open?'':'none'; hb.textContent = open ? '💡 Esconder dica' : '💡 Ver dica'; };
    }
    c.appendChild(box);
  }

  let checkBtn = null;
  if(!sess.checked){
    if(!isQuiz){
      const bar = h(`<div class="lesson-footer"><button class="show-btn" ${sess.selected===null?'disabled':''}>CONFIRMAR</button></div>`);
      checkBtn = bar.querySelector('button');
      checkBtn.onclick = ()=>{ if(sess.selected!==null) lessonCheck(sess, sess.selected); };
      wrap.appendChild(bar);
    }
  } else {
    const ok = sess.wasCorrect;
    const praise = isQuiz
      ? (ok ? `+${sess.lastPoints.toLocaleString('pt-BR')} pontos!${sess.qStreak>=2?` 🔥 ${sess.qStreak} seguidas`:''}` : (sess.selected===null ? '⏰ Tempo esgotado!' : 'Não foi dessa vez!'))
      : (ok ? (q.missed ? pick(['Isso aí, conseguiu! 💪','Acertou! Persistência é tudo! 🌟','Boa! Não desistiu! 👏']) : pick(['Aplausos! 👏','Na mosca! 🎯','Show de bola!','Brilhou! ✨','Que talento! 🌟'])) : 'Quase! A resposta era:');
    const sheet = h(`
      <div class="fb-sheet ${ok?'ok':'bad'}">
        <div class="fb-head"><span class="fb-ico">${ok?'👏':'🤔'}</span><div><div class="fb-t">${praise}</div>${!ok || isQuiz ? `<div class="fb-ans mono"></div>`:''}</div></div>
        <button type="button" class="fb-why">📖 Ver explicação</button>
        <div class="fb-steps" style="display:none"></div>
        <button class="show-btn ${ok?'ok':'bad'}">PRÓXIMA ›</button>
      </div>`);
    const ansEl = sheet.querySelector('.fb-ans');
    if(ansEl) ansEl.textContent = ok ? `Resposta: ${answerLabel(ex)}` : answerLabel(ex);
    sheet.querySelector('.fb-steps').innerHTML = solutionHTML(ex);
    sheet.querySelector('.fb-why').onclick = (e)=>{
      const st = sheet.querySelector('.fb-steps');
      const open = st.style.display==='none';
      st.style.display = open ? '' : 'none';
      e.target.textContent = open ? '📖 Esconder explicação' : '📖 Ver explicação';
    };
    sheet.querySelector('.show-btn').onclick = ()=>{
      if(!isQuiz && sess.kind==='lesson' && sess.maxWrong===null && heartsNow()<=0 && !sess.finished){
        showNoHearts(()=>{ lessonAdvance(sess); render(); });
        return;
      }
      lessonAdvance(sess); render(); window.scrollTo(0,0);
    };
    wrap.appendChild(sheet);
  }
  return wrap;
}
function quizUseHelp(sess, id){
  const q = sess.q;
  playTones([523,784], 0.06, 'triangle', 0.07);
  if(id==='fifty'){
    const wrong = q.opts.map((o,i)=> o.ok ? -1 : i).filter(i=>i>=0).sort(()=>Math.random()-.5);
    q.cut = wrong.slice(0,2);
  } else if(id==='time'){
    q.secs = (q.secs || QUIZ_SECONDS) + 10;
  } else if(id==='skip'){
    sess.subjectId = quizPickSubject(sess);
    sess.q = newLessonQuestion(sess); sess.qStart = Date.now();
  }
  render();
}
async function lessonCheck(sess, idx){
  if(sess.checked) return;
  const q = sess.q;
  const ok = idx!==null && q.opts[idx].ok;
  // Trilha: errou → não mostra a resposta; risca a alternativa e deixa tentar de novo
  if(sess.kind!=='quiz' && !ok){
    giveAnswerFeedback(false);
    q.out = (q.out||[]).concat(idx);
    sess.selected = null; sess.tryAgain = true;
    if(!q.missed){
      q.missed = true; sess.wrong++;
      if(sess.maxWrong===null) loseHeart();
      await recordAnswer(q.subjectId, false, {difficulty: q.diff, ex: q.ex});
    }
    if(sess.maxWrong!==null && sess.wrong > sess.maxWrong){ sess.failed = true; render(); return; }
    render();
    if(sess.maxWrong===null && heartsNow()<=0) showNoHearts(()=> render());
    return;
  }
  sess.selected = idx; sess.checked = true; sess.wasCorrect = ok; sess.tryAgain = false;
  giveAnswerFeedback(ok);
  if(sess.kind==='quiz'){
    const QS = q.secs || QUIZ_SECONDS;
    const left = Math.max(0, QS - (Date.now()-sess.qStart)/1000);
    sess.timeLeft = left;
    if(ok){ sess.qStreak++; sess.lastPoints = Math.round(500 + 500*left/QS) + Math.min(sess.qStreak-1,5)*100; sess.score += sess.lastPoints; sess.correct++; }
    else { sess.qStreak = 0; sess.lastPoints = 0; sess.wrong++; }
    sess.bestStreak = Math.max(sess.bestStreak||0, sess.qStreak);
    if(sess.log){
      const s0 = SUBJECTS.find(s=>s.id===q.subjectId);
      sess.log.push({ok, pts:sess.lastPoints, secs:Math.round((QS-left)*10)/10, subj: s0 ? `${s0.sym} ${s0.name}` : '',
        q: String(q.ex.question || '').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90),
        ans: answerLabel(q.ex), picked: idx===null ? null : q.opts[idx].label});
    }
    sess.cleared++;
    if(sess.mode) arenaAfterCheck(sess, ok);
  } else {
    // acertou: conta como resolvida; só conta "de primeira" (e dá XP) se não tinha errado antes
    sess.cleared++;
    if(!q.missed) sess.correct++;
  }
  if(!q.missed) await recordAnswer(q.subjectId, ok, {difficulty: q.diff, ex: q.ex});
  render();
}
function lessonEnd(wrap, sess){
  const c = h(`<div class="content lesson-end"></div>`);
  wrap.appendChild(c);
  if(sess.kind==='quiz' && sess.mode){ arenaQuizEnd(c, sess); return; }
  const secs = Math.round((Date.now()-sess.startTs)/1000);
  const answered = sess.correct + sess.wrong;
  const acc = answered ? Math.round(sess.correct/answered*100) : 0;
  const g = loadGame();
  if(sess.failed){
    c.appendChild(h(`<div class="le-mascot">${mascotSVG('sad',130)}</div>`));
    c.appendChild(h(`<h2 class="le-title" style="color:#FF4B4B">Não foi dessa vez!</h2>`));
    c.appendChild(h(`<p class="le-sub">Tudo bem — continue a trilha no seu ritmo e tente de novo depois. 💪</p>`));
    const b = h(`<div class="lesson-footer static"><button class="show-btn">VOLTAR À TRILHA</button></div>`);
    b.querySelector('button').onclick = ()=> go('path');
    c.appendChild(b);
    return;
  }
  let gems = 0, extra = '';
  if(!sess.endDone){
    sess.endDone = true;
    gameEnsureToday();
    if(sess.kind==='quiz'){
      g.quizBest = g.quizBest || {};
      const bk = quizBestKey(sess.pool, sess.diff);
      sess.record = sess.score > (g.quizBest[bk]||0);
      if(sess.record) g.quizBest[bk] = sess.score;
      if(sess.score>=10000) gameUnlock('quiz5000');
      gems = Math.floor(sess.correct/2);
    } else {
      g.today.lessons = (g.today.lessons||0) + 1;
      if(sess.jumpUnit!==null){
        allPathNodes().forEach(n=>{ if(n.unit < sess.jumpUnit) pathDone()[n.key] = true; });
        gems = 15;
      } else {
        pathDone()[sess.nodeKey] = true;
        const node = allPathNodes().find(n=>n.key===sess.nodeKey);
        if(node && node.type==='trophy'){ gameUnlock('unit'); queueToast('📜', 'Certificado liberado!', `${node.subject.name}: veja em Certificados`); }
        gems = sess.wrong===0 ? 15 : 10;
      }
      g.lessonsDone = (g.lessonsDone||0) + 1;
    }
    sess.gems = gems;
    saveGame();
    if(gems) addGems(gems);
    replaceHistoryState();
    setTimeout(()=>launchConfetti(sess.wrong===0 || sess.record ? 180 : 100), 200);
    playTones([523,659,784,1047,1319], 0.11, 'triangle', 0.09);
  }
  gems = sess.gems||0;
  const isQuiz = sess.kind==='quiz';
  c.appendChild(h(`<div class="le-mascot">${mascotSVG('joy',130)}</div>`));
  c.appendChild(h(`<h2 class="le-title">${isQuiz ? (sess.record ? 'Novo recorde! 🏆' : 'Quiz concluído!') : sess.jumpUnit!==null ? 'Episódio liberado! ⏩' : sess.wrong===0 ? 'Fase perfeita! 🌟' : 'Fase concluída!'}</h2>`));
  if(isQuiz) c.appendChild(h(`<div class="le-bigscore">${sess.score.toLocaleString('pt-BR')} <small>pontos</small></div>`));
  c.appendChild(h(`
    <div class="le-stats">
      <div class="le-stat gold"><div class="k">TOTAL DE XP</div><div class="v">⚡ ${sess.xp||0}</div></div>
      <div class="le-stat green"><div class="k">${isQuiz?'ACERTOS':'PRECISÃO'}</div><div class="v">🎯 ${isQuiz? `${sess.correct}/${sess.needed}` : acc+'%'}</div></div>
      <div class="le-stat blue"><div class="k">TEMPO</div><div class="v">⏱ ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</div></div>
    </div>`));
  if(gems) c.appendChild(h(`<div class="le-gems">+${gems} 🪙 moedas</div>`));
  if(isQuiz){
    const poolName = (QUIZ_POOLS.find(x=>x[0]===(sess.pool||'all'))||[])[2] || 'Todos';
    c.appendChild(h(`<p class="le-sub">🏆 Recorde no ${({facil:'fácil',medio:'médio',dificil:'difícil'})[sess.diff]} · ${poolName}: <b>${(g.quizBest[quizBestKey(sess.pool, sess.diff)]||0).toLocaleString('pt-BR')}</b> pontos${sess.bestStreak>=2 ? ` · 🔥 maior sequência: ${sess.bestStreak}` : ''}</p>`));
    if(sess.log && sess.log.length){
      const rev = h(`<div class="quiz-review"><div class="qr-head"><b>Suas respostas</b><span>${sess.log.filter(x=>x.ok).length} de ${sess.log.length} certas</span></div></div>`);
      sess.log.forEach((x,i)=>{
        const row = h(`<div class="qr-row ${x.ok?'ok':'bad'}"><span class="qr-n">${x.ok?'✓':'✗'}</span><div class="qr-b"><div class="qr-s"></div><div class="qr-q"></div><div class="qr-a"></div></div><span class="qr-p">${x.ok ? '+'+x.pts.toLocaleString('pt-BR') : (x.picked===null ? '⏰' : '0')}</span></div>`);
        row.querySelector('.qr-s').textContent = `${i+1}. ${x.subj}`;
        row.querySelector('.qr-q').textContent = x.q || 'Conta armada / desenho';
        row.querySelector('.qr-a').textContent = x.ok ? `Resposta: ${x.ans} · ${String(x.secs).replace('.',',')}s` : `Certa: ${x.ans}${x.picked!==null ? ` · você marcou ${x.picked}` : ' · acabou o tempo'}`;
        rev.appendChild(row);
      });
      c.appendChild(rev);
    }
  }
  const foot = h(`<div class="lesson-footer static"></div>`);
  const cont = h(`<button class="show-btn">CONTINUAR</button>`);
  cont.onclick = ()=> go(isQuiz ? 'quizSetup' : 'path');
  foot.appendChild(cont);
  if(isQuiz){
    const again = h(`<button class="show-btn ghost">JOGAR DE NOVO</button>`);
    again.onclick = ()=> startQuiz(sess.diff, sess.pool);
    foot.appendChild(again);
  }
  c.appendChild(foot);
}

/* ---------- confirmação dentro do app (substitui o confirm() do navegador,
   que alguns celulares, apps instalados e navegadores embutidos bloqueiam) ---------- */
function showConfirm(opts){
  return new Promise(resolve=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg';
    bg.innerHTML = `<div class="gm-modal">
      <div class="big" style="font-size:52px">${opts.icon || '🤔'}</div>
      <h2></h2><p></p>
      <button type="button" class="show-btn ${opts.danger?'bad':''} gm-confirm-ok"></button>
      <button type="button" class="show-btn ghost gm-confirm-cancel" style="color:#fff;border-color:rgba(255,255,255,.3)"></button>
    </div>`;
    bg.querySelector('h2').textContent = opts.title || 'Tem certeza?';
    bg.querySelector('p').textContent = opts.message || '';
    bg.querySelector('.gm-confirm-ok').textContent = opts.ok || 'Sim';
    bg.querySelector('.gm-confirm-cancel').textContent = opts.cancel || 'Cancelar';
    const close = v=>{ bg.remove(); resolve(v); };
    bg.querySelector('.gm-confirm-ok').onclick = ()=> close(true);
    bg.querySelector('.gm-confirm-cancel').onclick = ()=> close(false);
    bg.addEventListener('click', e=>{ if(e.target===bg) close(false); });
    document.body.appendChild(bg);
  });
}

/* ---------- sem vidas ---------- */
function showNoHearts(onRefill){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  const gems = gemsNow();
  bg.innerHTML = `<div class="gm-modal">
    <div>${mascotSVG('sad',100)}</div>
    <h2 style="color:#FF4B4B">Sem vidas! 💔</h2>
    <p>Próxima vida em <b class="nh-t">${fmtMinSec(nextHeartIn())}</b>.<br>Enquanto isso, você pode praticar livremente em Exercícios, Relâmpago ou Quiz.</p>
    <button type="button" class="nh-refill" ${gems<HEART_REFILL_COST?'disabled':''}>Recarregar ❤️ por ${HEART_REFILL_COST} 🪙 (você tem ${gems})</button>
    <button type="button" class="nh-close" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Voltar</button>
  </div>`;
  const tick = setInterval(()=>{ if(!bg.isConnected) return clearInterval(tick); const t = bg.querySelector('.nh-t'); if(t) t.textContent = fmtMinSec(nextHeartIn()); }, 1000);
  bg.querySelector('.nh-refill').onclick = ()=>{
    if(refillHeartsWithGems()){ bg.remove(); if(onRefill) onRefill(); else render(); }
  };
  bg.querySelector('.nh-close').onclick = ()=>{ bg.remove(); if(onRefill) go('path'); };
  document.body.appendChild(bg);
}

/* ---------- barra de status (🔥 🪙 ❤️) ---------- */
function statusPills(){
  const hearts = heartsNow();
  const bar = h(`<div class="status-pills">
    <button type="button" class="sp fire ${gameStreakNow()?'':'off'}" aria-label="Ver ofensiva">🔥 ${gameStreakNow()}</button>
    <span class="sp gem">🪙 ${gemsNow()}</span>
    <button type="button" class="sp heart" aria-label="Vidas">❤️ ${hearts}${hearts<HEARTS_MAX?` <small>${fmtMinSec(nextHeartIn())}</small>`:''}</button>
  </div>`);
  bar.querySelector('.heart').onclick = ()=>{ if(heartsNow()<HEARTS_MAX) showNoHearts(); else showFloat('Vidas cheias ❤️'); };
  bar.querySelector('.fire').onclick = ()=> showStreakPanel();
  return bar;
}

/* ---------- home: continuar trilha + jogos ---------- */
function pathHero(){
  const all = allPathNodes(), cur = pathCurrentIndex();
  const n = all[Math.min(cur, all.length-1)];
  const color = unitStyle(n.unit);
  const finished = cur>=all.length;
  const el = h(`<div class="path-hero" style="${color}">
    <div class="ph-body">
      <div class="ph-k">${finished ? 'TEMPORADA COMPLETA' : `EPISÓDIO ${n.unit+1} · ${n.idx+1}/${PATH_NODES.length}`}</div>
      <h2>${finished ? 'Você zerou a trilha! 👑' : n.subject.name}</h2>
      <p>${finished ? 'Continue praticando pra ganhar XP.' : n.label}</p>
      <button class="show-btn light">${cur===0 ? '▶ COMEÇAR O SHOW' : '▶ CONTINUAR'}</button>
    </div>
    <div>${mascotSVG('joy', 86)}</div>
  </div>`);
  el.querySelector('button').onclick = ()=> go('path');
  return el;
}

/* ---------- tela da trilha ---------- */
function pathScreen(){
  const wrap = document.createElement('div');
  const bar = topbar('Trilha', true, ()=>go('home'));
  bar.appendChild(statusPills());
  bar.classList.add('sticky-top');
  wrap.appendChild(bar);
  const c = h(`<div class="content path"></div>`);
  wrap.appendChild(c);
  const done = pathDone();
  const all = allPathNodes();
  const cur = pathCurrentIndex();
  let currentEl = null;
  SUBJECTS.forEach((s,u)=>{
    const color = unitStyle(u);
    const unitNodes = all.filter(n=>n.unit===u);
    const unitLocked = all.indexOf(unitNodes[0]) > cur && !unitNodes.some(n=>done[n.key]);
    const unitDone = unitNodes.every(n=>done[n.key]);
    const banner = h(`<div class="unit-banner" style="${color}">
      <div><div class="u-k">EPISÓDIO ${u+1}${unitDone?' · ✓ CONCLUÍDO':''}</div><div class="u-n">${s.name}</div></div>
      <button type="button" class="u-guide" title="Ver conteúdo" aria-label="Ver conteúdo de ${s.name}">📖</button></div>`);
    banner.querySelector('.u-guide').onclick = ()=> go('subjectDetail', {subjectId:s.id});
    if(unitLocked){
      const jump = h(`<button type="button" class="u-jump">Pular pra cá ⏩</button>`);
      jump.onclick = ()=>{
        showConfirm({icon:'⏩', title:'Teste de nivelamento', message:`Acerte 6 questões de ${s.name} errando no máximo 2 para liberar este episódio. Vamos?`, ok:'Fazer o teste', cancel:'Agora não'})
          .then(ok=>{ if(ok) startPathLesson(unitNodes[0], true); });
      };
      banner.appendChild(jump);
    }
    const grp = subjectGroupOf(s.id);
    if(grp && grp.ids[0]===s.id){
      const lv = SUBJECT_LEVELS.find(l=>l.id===grp.level);
      c.appendChild(h(`<div class="path-group"><small>${lv.ico} ${lv.name}</small><b>${grp.name}</b></div>`));
    }
    c.appendChild(banner);
    const col = h(`<div class="path-col"></div>`);
    unitNodes.forEach(n=>{
      const gi = all.indexOf(n);
      const isDone = !!done[n.key], isCur = gi===cur, locked = gi>cur && !isDone;
      const ico = locked ? '🔒' : n.type==='chest' ? (isDone?'✨':'🎁') : n.type==='trophy' ? '🎤' : (isDone?'✓':'★');
      const wrapN = h(`<div class="pnode-wrap ${isCur?'is-cur':''}" style="transform:translateX(${PATH_OFFSETS[gi % PATH_OFFSETS.length]}px)"></div>`);
      const btn = h(`<button type="button" class="pnode ${n.type} ${isDone?'done':''} ${isCur?'cur':''} ${locked?'locked':''}" style="${color}" aria-label="${n.label}">${ico}</button>`);
      if(isCur) wrapN.appendChild(h(`<div class="pnode-tip">${n.type==='chest'?'🎁 ABRIR':'▶ JOGAR'}</div>`));
      wrapN.appendChild(btn);
      if(n.idx===2 && u%2===0){
        const off = PATH_OFFSETS[gi % PATH_OFFSETS.length];
        wrapN.appendChild(h(`<div class="path-mascot" style="${off>0?'right:auto;left:-104px':''}">${mascotSVG(isDone?'joy':'happy',70)}</div>`));
      }
      btn.onclick = ()=>{
        if(locked){ showFloat('🔒 Complete as fases anteriores', true); return; }
        if(n.type==='chest') openChest(n, isDone);
        else nodeSheet(n, color, isDone);
      };
      col.appendChild(wrapN);
      if(isCur) currentEl = wrapN;
    });
    c.appendChild(col);
  });
  if(cur>=all.length) c.appendChild(mascotBubble('Você completou todos os episódios! Você é a estrela do show! 🌟', 'joy'));
  if(currentEl) setTimeout(()=>{ try{ currentEl.scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){} }, 120);
  return wrap;
}
function nodeSheet(n, color, isDone){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  const q = n.type==='trophy' ? 8 : n.n;
  bg.innerHTML = `<div class="node-sheet" style="${color}">
    <div class="ns-k">${n.subject.sym} ${n.subject.name}</div>
    <h3>${n.label}</h3>
    <p>${isDone ? 'Você já completou — praticar de novo dá mais XP!' : `${q} perguntas de múltipla escolha. Errou? Tente de novo até acertar — e peça uma dica se precisar. 💡`}</p>
    <button class="show-btn light">${isDone?'PRATICAR DE NOVO':'COMEÇAR'} +XP</button>
  </div>`;
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  bg.querySelector('button').onclick = ()=>{ bg.remove(); startPathLesson(n, false); };
  document.body.appendChild(bg);
}
function openChest(n, isDone){
  if(isDone){ showFloat('✨ Prêmio já aberto!'); return; }
  const gems = randInt(20,40);
  pathDone()[n.key] = true;
  const g = loadGame();
  g.chests = (g.chests||0) + 1;
  if(g.chests>=5) gameUnlock('chests');
  saveGame(); addGems(gems);
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal"><div class="big chest-open">🎁</div><h2>Prêmio surpresa!</h2><p>Você ganhou <b style="color:#FFD45C">${gems} 🪙 moedas</b></p><button type="button">Pegar!</button></div>`;
  bg.querySelector('button').onclick = ()=>{ bg.remove(); render(); };
  document.body.appendChild(bg);
  playTones([392,523,659,784,1047], 0.09, 'triangle', 0.1);
  launchConfetti(120);
}

/* ---------- escolha do quiz ---------- */
function quizSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎤 Quiz do Show', true, ()=>go('arena')));
  const c = h(`<div class="content quiz-setup"></div>`);
  const g = loadGame(); const best = g.quizBest || {};
  let pool = 'all';
  try{ pool = localStorage.getItem('mathstudy-quiz-pool') || 'all'; }catch(e){}
  if(!QUIZ_POOLS.some(x=>x[0]===pool)) pool = 'all';
  const top = Math.max(0, ...Object.values(best).map(Number).filter(n=>!isNaN(n)));
  c.appendChild(h(`<div class="quiz-hero"><span class="beam l"></span><span class="beam r"></span>
      <div class="qh-row"><div class="mic">🎤</div><div class="qh-best"><small>Seu recorde</small><b>${top.toLocaleString('pt-BR')}</b></div></div>
      <h2>Quiz do Show</h2>
      <p>${QUIZ_TOTAL} perguntas, <b>${QUIZ_SECONDS}s</b> cada. Quanto mais rápido acertar, mais pontos! 🏅</p></div>`));
  const poolSec = h(`<div class="qs-sec"><div class="qs-lbl">Assuntos</div><div class="qs-pools"></div></div>`);
  const levels = h(`<div class="qs-sec"><div class="qs-lbl">Escolha a dificuldade pra começar</div><div class="qs-levels"></div></div>`);
  function paintLevels(){
    const box = levels.querySelector('.qs-levels'); box.innerHTML = '';
    [['facil','Fácil','🟢','Contas pra aquecer'],['medio','Médio','🟡','O desafio certo'],['dificil','Difícil','🔴','Pra quem é fera']].forEach(([id,label,dot,desc])=>{
      const b = h(`<button type="button" class="quiz-level ql-${id}"><span class="ql-dot">${dot}</span><span class="ql-t"><b>${label}</b><small>${desc}</small></span><span class="ql-b">🏆 ${(best[quizBestKey(pool,id)]||0).toLocaleString('pt-BR')}</span><span class="ql-go">▶</span></button>`);
      b.onclick = ()=> startQuiz(id, pool);
      box.appendChild(b);
    });
  }
  QUIZ_POOLS.forEach(([id,ico,label])=>{
    const b = h(`<button type="button" class="qs-pool ${id===pool?'on':''}"><span>${ico}</span>${label}</button>`);
    b.onclick = ()=>{ pool = id; try{ localStorage.setItem('mathstudy-quiz-pool', id); }catch(e){} poolSec.querySelectorAll('.qs-pool').forEach(x=>x.classList.toggle('on', x===b)); paintLevels(); };
    poolSec.querySelector('.qs-pools').appendChild(b);
  });
  c.appendChild(poolSec);
  paintLevels();
  c.appendChild(levels);
  c.appendChild(h(`<div class="qs-sec"><div class="qs-lbl">Como funciona</div><div class="qs-rules">
      <div><span>⚡</span><p><b>Até 1.000 pontos</b> por acerto: quanto mais rápido, mais.</p></div>
      <div><span>🔥</span><p><b>Acertos seguidos</b> dão até +500 de bônus.</p></div>
      <div><span>🆘</span><p><b>3 ajudas</b> por partida: ${QUIZ_HELPS.map(x=>`${x[1]} ${x[2]}`).join(', ')}.</p></div>
      <div><span>📋</span><p>No fim você <b>revê todas as respostas</b>.</p></div>
    </div></div>`));
  wrap.appendChild(c);
  return wrap;
}
