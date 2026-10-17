/* =========================================================
   Configurações — também separadas por conta
   ========================================================= */
const SETTINGS_KEY_BASE = 'mathstudy-settings-v1';
const DEFAULT_SETTINGS = { theme:'dark', sound:true, vibration:true, dailyGoal:10, schoolLevel:null, tts:true, textScale:'normal', volume:'medio', certStyle:null };
/* assuntos "esperados" pra cada nível escolar — cumulativo (médio inclui tudo, fund2 inclui fund1).
   Usado só pra pré-selecionar os assuntos no Treino personalizado, nunca esconde nada: o
   usuário sempre pode marcar/desmarcar qualquer assunto depois. */
const LEVEL_SUBJECTS = {
  fund1: SUBJECT_GROUPS.find(g=>g.id==='f1').ids,
  fund2: ['f1','f2'].flatMap(id=> SUBJECT_GROUPS.find(g=>g.id===id).ids),
  medio: SUBJECTS.map(s=>s.id),
};
let settingsCache = null, settingsCacheUid = null;

async function loadSettings(){
  const uid = currentUserId();
  if(settingsCache && settingsCacheUid===uid) return settingsCache;
  try{
    const raw = localStorage.getItem(`${SETTINGS_KEY_BASE}:${uid}`);
    settingsCache = raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : Object.assign({}, DEFAULT_SETTINGS);
  }catch(e){ settingsCache = Object.assign({}, DEFAULT_SETTINGS); }
  settingsCacheUid = uid;
  return settingsCache;
}
async function saveSettings(){
  try{ localStorage.setItem(`${SETTINGS_KEY_BASE}:${settingsCacheUid}`, JSON.stringify(settingsCache)); }catch(e){}
}
/* leitura síncrona pra usar dentro de handlers de clique (nas sessões de exercício), sem precisar
   de await ali; settings já foram carregadas no boot/login, então o cache está pronto. */
function currentSettingsSync(){
  return (settingsCache && settingsCacheUid===currentUserId()) ? settingsCache : DEFAULT_SETTINGS;
}

/* troca o tema. Com opts.animate, a troca é suave: o tema novo se espalha num círculo a partir
   de opts.x/opts.y (View Transitions); onde não existe, as cores esmaecem de uma pra outra.
   Quem pediu "reduzir movimento" no aparelho recebe a troca instantânea. */
function applyTheme(theme, opts){
  const root = document.documentElement, light = theme==='light';
  const flip = ()=>{
    root.classList.toggle('theme-light', light);
    const m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', light ? '#F3F3FA' : '#07070F');
  };
  try{
    if(root.classList.contains('theme-light') === light){ flip(); return; }
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!opts || !opts.animate || reduce){ flip(); return; }
    const x = opts.x != null ? opts.x : innerWidth/2, y = opts.y != null ? opts.y : innerHeight/2;
    if(document.startViewTransition){
      root.style.setProperty('--tx', x+'px'); root.style.setProperty('--ty', y+'px');
      root.classList.add('theme-vt');
      const t = document.startViewTransition(flip);
      t.finished.finally(()=> root.classList.remove('theme-vt'));
    } else {
      root.classList.add('theme-fade'); flip();
      setTimeout(()=> root.classList.remove('theme-fade'), 500);
    }
  }catch(e){ flip(); }
}
