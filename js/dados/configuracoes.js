/* =========================================================
   Configurações — também separadas por conta
   ========================================================= */
const SETTINGS_KEY_BASE = 'mathstudy-settings-v1';
const DEFAULT_SETTINGS = { theme:'dark', sound:true, vibration:true, dailyGoal:10, schoolLevel:null, tts:true, textScale:'normal' };
/* assuntos "esperados" pra cada nível escolar — cumulativo (médio inclui tudo, fund2 inclui fund1).
   Usado só pra pré-selecionar os assuntos no Treino personalizado, nunca esconde nada: o
   usuário sempre pode marcar/desmarcar qualquer assunto depois. */
const LEVEL_SUBJECTS = {
  fund1: ['adicao','subtracao','multiplicacao','divisao','dinheiro'],
  fund2: ['adicao','subtracao','multiplicacao','divisao','fracoes','decimais','potenciacao','expressoes','regra3','porcentagem','eq1','mmcmdc','geometria','estatistica','dinheiro'],
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

/* toca um bipe curtinho (certo = agudo, errado = grave) usando Web Audio, sem precisar de arquivo de áudio */
let _audioCtx = null;
function playFeedbackSound(correct){
  if(!currentSettingsSync().sound) return;
  if(correct){ playTones([784,1175], 0.07, 'triangle', 0.12); return; }
  try{
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = correct ? 880 : 220;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }catch(e){}
}
function playFeedbackVibration(correct){
  if(!currentSettingsSync().vibration) return;
  try{ navigator.vibrate && navigator.vibrate(correct ? 40 : [40,60,40]); }catch(e){}
}
/* chamada única pra disparar som + vibração juntos, sempre que uma resposta é corrigida */
function giveAnswerFeedback(correct){
  playFeedbackSound(correct);
  playFeedbackVibration(correct);
}
