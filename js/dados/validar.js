/* =========================================================
   VALIDAR E PROTEGER OS DADOS
   - Backup importado (arquivo .json ou cópia automática): confere tipos e valores e limpa
     HTML perigoso antes de gravar. O histórico e o caderno de erros guardam os desenhos das
     questões em HTML (contas armadas, gráficos), então o HTML não é bloqueado: só sai o que
     executa código (scripts, on..., javascript:).
   - Dados corrompidos no aparelho: guarda uma cópia do texto estragado e avisa a cópia
     automática pra oferecer a recuperação (em vez de zerar em silêncio).
   - Duas abas abertas: quando uma salva, a outra esquece o que tinha na memória e lê de novo,
     pra não apagar o progresso da primeira ao salvar.
   ========================================================= */

/* ---------- dados corrompidos ---------- */
let dataCorrupt = false; // virou true: algum dado da conta não pôde ser lido
function markCorrupt(key, raw){
  dataCorrupt = true;
  try{ localStorage.setItem(`${key}:corrompido`, String(raw).slice(0, 200000)); }catch(e){}
}

/* ---------- HTML sem código ---------- */
const SAFE_DROP_TAGS = 'script,iframe,frame,frameset,object,embed,link,meta,base,form,input,button,textarea,select,option,style,noscript,template,portal';
const SAFE_URL_ATTRS = ['href','xlink:href','src','action','formaction','data','srcdoc','background','poster'];
function safeUrl(v){
  const s = String(v).replace(/[\u0000- ]/g,'').toLowerCase();
  if(s.startsWith('javascript:') || s.startsWith('vbscript:')) return false;
  if(s.startsWith('data:') && !/^data:image\/(png|jpe?g|gif|webp);/.test(s)) return false;
  return true;
}
/* devolve o mesmo texto quando não há nada perigoso (assim nada muda à toa) */
function sanitizeHTMLString(s){
  if(typeof s !== 'string' || !/<[a-z!\/?]/i.test(s)) return s;
  const t = document.createElement('template'); // o conteúdo de um <template> não executa nada
  t.innerHTML = s;
  let changed = false;
  t.content.querySelectorAll(SAFE_DROP_TAGS).forEach(el=>{ el.remove(); changed = true; });
  t.content.querySelectorAll('*').forEach(el=>{
    const tag = el.tagName.toLowerCase();
    if((tag==='animate' || tag==='set' || tag==='animatetransform') && /href|^on/i.test(el.getAttribute('attributeName')||'')){ el.remove(); changed = true; return; }
    [...el.attributes].forEach(a=>{
      const n = a.name.toLowerCase();
      if(n.startsWith('on') || (SAFE_URL_ATTRS.includes(n) && !safeUrl(a.value)) || (n==='style' && /javascript:|expression\s*\(/i.test(a.value))){
        el.removeAttribute(a.name); changed = true;
      }
    });
  });
  return changed ? t.innerHTML : s;
}
/* limpa todos os textos de um objeto/lista, em qualquer profundidade */
function deepSanitize(v, depth){
  depth = depth || 0;
  if(depth > 30) return null;
  if(typeof v === 'string') return sanitizeHTMLString(v);
  if(typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if(Array.isArray(v)) return v.map(x=> deepSanitize(x, depth+1));
  if(v && typeof v === 'object'){
    const o = {};
    Object.keys(v).forEach(k=>{ if(k!=='__proto__' && k!=='constructor' && k!=='prototype') o[k] = deepSanitize(v[k], depth+1); });
    return o;
  }
  return v;
}
const isObj = v=> !!v && typeof v === 'object' && !Array.isArray(v);
const toCount = (v, max)=>{ const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max || Number.MAX_SAFE_INTEGER) : 0; }; // datas são números grandes (ms)

/* ---------- backup: confere cada parte ---------- */
function sanitizeProgress(p){
  if(!isObj(p)) return {};
  const out = {};
  Object.keys(p).forEach(id=>{
    const d = p[id];
    if(!isObj(d) || !/^[\w-]{1,40}$/.test(id)) return;
    const attempted = toCount(d.attempted), correct = Math.min(toCount(d.correct), attempted);
    const o = Object.assign({}, d, {attempted, correct});
    if('last' in d) o.last = toCount(d.last);
    o.recent = Array.isArray(d.recent) ? d.recent.slice(-10).filter(isObj).map(r=>({ok:!!r.ok, h:!!r.h})) : [];
    out[id] = o;
  });
  return out;
}
/* uma resposta do histórico / um erro do caderno: só campos conhecidos, com valores conhecidos
   (vários deles vão direto pro HTML, até dentro de atributos) */
function sanitizeEntry(e){
  if(!isObj(e) || typeof e.subjectId !== 'string' || !/^[\w-]{1,40}$/.test(e.subjectId)) return null;
  const subj = (typeof SUBJECTS !== 'undefined') ? SUBJECTS.find(s=>s.id===e.subjectId) : null;
  const o = {
    id: typeof e.id === 'string' ? e.id.replace(/[^\w.-]/g,'').slice(0,60) : `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    ts: toCount(e.ts), subjectId: e.subjectId, subjectName: subj ? subj.name : e.subjectId,
    difficulty: ['facil','medio','dificil'].includes(e.difficulty) ? e.difficulty : null,
    correct: !!e.correct,
    ex: isObj(e.ex) ? e.ex : null,
  };
  if(e.review) o.review = true;
  ['count','box','due','firstTs','lastWrong'].forEach(k=>{ if(k in e) o[k] = toCount(e[k]); });
  if('box' in o) o.box = Math.min(Math.max(o.box, 1), 3);
  return o;
}
const GAME_COUNTERS = ['xp','gems','streak','bestCombo','hits','hardHits','fixed','boltBest','errLearned','hearts'];
function sanitizeGame(g){
  if(!isObj(g)) return null;
  const o = Object.assign({}, g);
  GAME_COUNTERS.forEach(k=>{ if(k in o) o[k] = toCount(o[k], 1e9); });
  ['ach','subjectsHit','path','shop','friends','today','week','unlocks'].forEach(k=>{
    if(k in o && !(isObj(o[k]) || (k==='unlocks' && o[k]==='all'))) delete o[k];
  });
  if(o.week && (typeof o.week.k !== 'string' || !Number.isFinite(Number(o.week.xp)))) delete o.week; else if(o.week) o.week.xp = toCount(o.week.xp);
  // avatar: só emoji da lista, foto em formato de imagem e número de cor
  if('avatar' in o){
    const a = o.avatar, av = {};
    if(isObj(a)){
      if(typeof a.emo === 'string' && typeof AV_EMOJIS !== 'undefined' && AV_EMOJIS.includes(a.emo)) av.emo = a.emo;
      if(typeof a.img === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(a.img)) av.img = a.img;
      if(Number.isInteger(a.c) && a.c >= 0 && a.c < 100) av.c = a.c;
    }
    if(Object.keys(av).length) o.avatar = av; else delete o.avatar;
  }
  if('rankNick' in o) o.rankNick = String(o.rankNick).replace(/[^A-Za-z0-9]/g,'').slice(0,10);
  return o;
}
function sanitizeSettings(s){
  if(!isObj(s)) return null;
  const o = Object.assign({}, s);
  if(!['dark','light'].includes(o.theme)) o.theme = DEFAULT_SETTINGS.theme;
  if(![5,10,15,20,30].includes(Number(o.dailyGoal))) o.dailyGoal = DEFAULT_SETTINGS.dailyGoal; else o.dailyGoal = Number(o.dailyGoal);
  if(typeof TEXT_SCALES !== 'undefined' && !(o.textScale in TEXT_SCALES)) o.textScale = 'normal';
  if(!['baixo','medio','alto'].includes(o.volume)) o.volume = 'medio';
  if(o.schoolLevel != null && !['fund1','fund2','medio'].includes(o.schoolLevel)) o.schoolLevel = null;
  ['sound','vibration','tts'].forEach(k=>{ if(k in o) o[k] = o[k] !== false; });
  return o;
}
/* devolve o backup pronto pra gravar (ou null se não der pra aproveitar nada) */
function sanitizeBackup(data){
  if(!isObj(data)) return null;
  const d = deepSanitize(data);
  const out = {};
  if('progress' in d) out.progress = sanitizeProgress(d.progress);
  if(Array.isArray(d.history)) out.history = d.history.map(sanitizeEntry).filter(Boolean).slice(0, HISTORY_LIMIT);
  if(Array.isArray(d.errors)) out.errors = d.errors.map(sanitizeEntry).filter(Boolean).slice(0, ERRORS_LIMIT);
  if('settings' in d){ const s = sanitizeSettings(d.settings); if(s) out.settings = s; }
  if('game' in d){ const g = sanitizeGame(d.game); if(g) out.game = g; }
  if(isObj(d.notes) && Array.isArray(d.notes.index)) out.notes = {index: d.notes.index.filter(isObj), pages: isObj(d.notes.pages) ? d.notes.pages : {}};
  return out;
}

/* ---------- duas abas ao mesmo tempo ----------
   o evento "storage" só chega nas OUTRAS abas: esta aba esquece o que tinha guardado na memória
   e lê de novo na próxima vez, então não sobrescreve o que a outra salvou */
window.addEventListener('storage', e=>{
  const k = e.key || '';
  try{
    if(!k || k.startsWith(GAME_KEY_BASE + ':')){ gameCache = null; gameCacheUid = null; }
    if(!k || k.startsWith(PROGRESS_KEY_BASE + ':')){ progressCache = null; progressCacheUid = null; }
    if(!k || k.startsWith(HISTORY_KEY_BASE + ':')){ historyCache = null; historyCacheUid = null; }
    if(!k || k.startsWith(ERRORS_KEY_BASE + ':')){ errorsCache = null; errorsCacheUid = null; }
    if(!k || k === USERS_KEY) usersCache = null;
    if((!k || k.startsWith(SETTINGS_KEY_BASE + ':')) && currentUser){ settingsCache = null; settingsCacheUid = null; loadSettings(); }
  }catch(err){}
});
