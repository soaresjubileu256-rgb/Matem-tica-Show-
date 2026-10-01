/* =========================================================
   Configurações — também separadas por conta
   ========================================================= */
const SETTINGS_KEY_BASE = 'mathstudy-settings-v1';
const DEFAULT_SETTINGS = { theme:'dark', sound:true, vibration:true, dailyGoal:10, schoolLevel:null, tts:true, textScale:'normal', volume:'medio' };
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

function applyTheme(theme){
  try{ document.documentElement.classList.toggle('theme-light', theme==='light'); }catch(e){}
}
