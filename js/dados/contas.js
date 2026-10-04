/* =========================================================
   Autenticação — várias contas no mesmo aparelho, cada uma com
   seu próprio progresso/histórico/erros (ver PROGRESS_KEY_BASE etc.)
   ========================================================= */
const USERS_KEY = 'mathstudy-users-v1';        // [{id, name, passHash}, ...]
const CURRENT_USER_KEY = 'mathstudy-current-user-v1'; // id da última conta usada neste aparelho
const LEGACY_AUTH_KEY = 'mathstudy-auth-v1';   // conta única de versões antigas do app
const LEGACY_PROGRESS_KEY = 'mathstudy-progress-v1';

let usersCache = null;
let currentUser = null; // {id, name} quando logado

function userIdFromName(name){ return name.trim().toLowerCase(); }

/* ---------- senha forte: regras, lista de senhas famosas e medidor ---------- */
const COMMON_PASSWORDS = new Set(['123456','1234567','12345678','123456789','1234567890','654321','111111','000000','123123','112233','121212','123321',
  '102030','101010','159753','147258','741852','963852','abc123','abcdef','abcd1234','abc12345','a12345','12345a','123456a','1234abcd','1q2w3e','1q2w3e4r',
  'q1w2e3r4','a1b2c3','qwerty','qwerty1','qwerty123','asdfgh','zxcvbn','senha','senha1','senha12','senha123','senha1234','password','password1','iloveyou',
  'teamo','teamo123','amor123','admin','admin123','mudar123','minhasenha','matematica','matematica1','matematica123','aaaaaa','abc','x1y2z3']);
const COMMON_WORDS = ['senha','password','brasil','flamengo','corinthians','palmeiras','vasco','santos','gremio','cruzeiro','botafogo','fluminense',
  'saopaulo','internacional','amor','teamo','iloveyou','jesus','deus','familia','futebol','estrela','princesa','pokemon','naruto','goku','minecraft',
  'roblox','freefire','matematica','escola','admin','qwerty','abc','abcd','mudar','minhasenha','neymar','messi'];
function isSequence(p){
  const seqs = ['01234567890','abcdefghijklmnopqrstuvwxyz','qwertyuiopasdfghjklzxcvbnm'];
  return p.length>=4 && seqs.some(q=> q.includes(p) || q.split('').reverse().join('').includes(p));
}
/* devolve o primeiro motivo pelo qual a senha é fraca (ou null se estiver ok) */
function passwordProblem(pass, name){
  const p = String(pass||'');
  const low = p.toLowerCase();
  const plain = low.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(p.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  const letters = plain.replace(/[^a-z]/g,''), digits = plain.replace(/[^0-9]/g,'');
  if(COMMON_PASSWORDS.has(plain) || /^(.)\1+$/.test(plain) || isSequence(plain) || (COMMON_WORDS.includes(letters) && digits.length<=4))
    return 'Essa senha é muito fácil de adivinhar — é uma das mais usadas no mundo. Invente outra!';
  const first = String(name||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/)[0] || '';
  if((first.length>=4 && plain.includes(first)) || (first.length===3 && plain.startsWith(first))) return 'Não use seu nome na senha — é a primeira coisa que alguém tentaria.';
  if(!letters.length || !digits.length) return 'Misture letras e números (exemplo: gato7lua ou Pizza42azul).';
  return null;
}
function passwordStrength(pass, name){
  if(!pass) return {score:0, label:'', cls:''};
  if(passwordProblem(pass, name)) return {score:1, label:'Fraca', cls:'weak'};
  let sc = 2;
  if(pass.length>=10) sc++;
  if(/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) sc++;
  return sc>=4 ? {score:4, label:'Muito forte 💪', cls:'vstrong'} : sc===3 ? {score:3, label:'Forte', cls:'strong'} : {score:2, label:'Média', cls:'mid'};
}
/* medidor ao vivo embaixo do campo de senha */
function attachStrengthMeter(input, getName){
  const box = h(`<div class="pw-meter"><div class="pw-bar"><i></i><i></i><i></i><i></i></div><div class="pw-txt">Use 6+ caracteres misturando letras e números.</div></div>`);
  const upd = ()=>{
    const st = passwordStrength(input.value, getName ? getName() : '');
    box.className = 'pw-meter ' + st.cls;
    box.querySelectorAll('.pw-bar i').forEach((b,i)=> b.classList.toggle('on', i < st.score));
    const prob = input.value ? passwordProblem(input.value, getName ? getName() : '') : null;
    box.querySelector('.pw-txt').textContent = !input.value ? 'Use 6+ caracteres misturando letras e números.' : prob ? `Fraca: ${prob}` : `Senha ${st.label.toLowerCase()} ✓`;
  };
  input.addEventListener('input', upd);
  box.refresh = upd;
  return box;
}

async function hashPassword(pw){
  try{
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){
    let hh=0; for(let i=0;i<pw.length;i++){ hh = (hh*31 + pw.charCodeAt(i))|0; }
    return 'fb'+hh;
  }
}

async function loadUsers(){
  if(usersCache !== null) return usersCache;
  try{
    const raw = localStorage.getItem(USERS_KEY);
    usersCache = raw ? JSON.parse(raw) : [];
  }catch(e){ usersCache = []; }
  // migração de versões antigas: uma única conta guardada sem lista.
  if(usersCache.length===0){
    try{
      const oldRaw = localStorage.getItem(LEGACY_AUTH_KEY);
      if(oldRaw){
        const old = JSON.parse(oldRaw);
        if(old && old.name && old.passHash){
          const migrated = {id: userIdFromName(old.name), name: old.name, passHash: old.passHash};
          usersCache = [migrated];
          await saveUsers(usersCache);
          const oldProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
          if(oldProgress) localStorage.setItem(`${PROGRESS_KEY_BASE}:${migrated.id}`, oldProgress);
        }
      }
    }catch(e){}
  }
  return usersCache;
}
async function saveUsers(list){
  usersCache = list;
  try{ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }catch(e){}
}
async function setCurrentUserId(id){
  try{ localStorage.setItem(CURRENT_USER_KEY, id); }catch(e){}
}
async function getSavedCurrentUserId(){
  try{ return localStorage.getItem(CURRENT_USER_KEY); }catch(e){ return null; }
}
function doLogout(){
  // fecha tour/janelas abertas da conta que está saindo (o tour continua pendente pra ela)
  if(typeof _tourClose==='function') _tourClose(true);
  document.querySelectorAll('.gm-modal-bg, .tour-root, .gm-toast').forEach(n=>n.remove());
  if(typeof _toastQueue!=='undefined') _toastQueue.length = 0;
  currentUser = null;
  settingsCache = null; settingsCacheUid = null;
  applyTheme('dark'); applyTextScale('normal');
  try{ localStorage.removeItem(CURRENT_USER_KEY); }catch(e){}
  boot();
}

/* =========================================================
   Gerenciamento de conta — usado na tela de Configurações
   ========================================================= */
/* troca o nome da conta logada; se o novo nome gerar um id diferente (quase sempre gera,
   já que o id vem do nome), migra progresso/histórico/erros/configurações pro novo id
   sem perder nada. */
async function renameCurrentUser(newName){
  newName = (newName||'').trim();
  if(!newName) return {ok:false, error:'Digite um nome.'};
  const users = await loadUsers();
  const oldId = currentUser.id;
  const newId = userIdFromName(newName);
  if(newId !== oldId && users.some(u=>u.id===newId)){
    return {ok:false, error:'Já existe uma conta com esse nome neste aparelho.'};
  }
  const idx = users.findIndex(u=>u.id===oldId);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  users[idx] = Object.assign({}, users[idx], {id:newId, name:newName});
  await saveUsers(users);
  if(newId !== oldId){
    [PROGRESS_KEY_BASE, HISTORY_KEY_BASE, ERRORS_KEY_BASE, SETTINGS_KEY_BASE, GAME_KEY_BASE].forEach(base=>{
      const oldKey = `${base}:${oldId}`, newKey = `${base}:${newId}`;
      const val = localStorage.getItem(oldKey);
      if(val!==null){ localStorage.setItem(newKey, val); localStorage.removeItem(oldKey); }
    });
    if(progressCacheUid===oldId) progressCacheUid = newId;
    if(historyCacheUid===oldId) historyCacheUid = newId;
    if(errorsCacheUid===oldId) errorsCacheUid = newId;
    if(settingsCacheUid===oldId) settingsCacheUid = newId;
  }
  currentUser = {id:newId, name:newName};
  await setCurrentUserId(newId);
  return {ok:true};
}

async function changeCurrentUserPassword(currentPass, newPass){
  const users = await loadUsers();
  const idx = users.findIndex(u=>u.id===currentUser.id);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  const currentHash = await hashPassword(currentPass);
  if(users[idx].passHash !== currentHash) return {ok:false, error:'Senha atual incorreta.'};
  const weak = passwordProblem(newPass, currentUser.name);
  if(weak) return {ok:false, error:weak};
  if(newPass === currentPass) return {ok:false, error:'A nova senha precisa ser diferente da atual.'};
  users[idx] = Object.assign({}, users[idx], {passHash: await hashPassword(newPass)});
  await saveUsers(users);
  return {ok:true};
}

/* baixa um .json com progresso, histórico, erros e configurações da conta logada */
async function exportProgressData(){
  saveBackupInfo({last: Date.now()});
  const [progress, history, errors, settings] = await Promise.all([loadProgress(), loadHistory(), loadErrors(), loadSettings()]);
  const payload = {
    exportedAt: new Date().toISOString(),
    account: currentUser ? currentUser.name : null,
    progress, history, errors, settings,
    game: loadGame(),
    notes: exportNotes(),
  };
  const safeName = (currentUser && currentUser.name ? currentUser.name : 'progresso').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const filename = `matematica-show-${safeName}-${new Date().toISOString().slice(0,10)}.json`;
  const jsonStr = JSON.stringify(payload, null, 2);

  // 1) compartilhamento nativo — no celular (principalmente iPhone/PWA instalado), é o que
  //    funciona de forma mais confiável, porque o download por link muitas vezes é bloqueado.
  try{
    if(navigator.share && navigator.canShare && typeof File !== 'undefined'){
      const file = new File([jsonStr], filename, {type:'application/json'});
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file], title:'Progresso — Matemática Show'});
        return true;
      }
    }
  }catch(e){
    // usuário cancelou o compartilhamento — não é um erro real, encerra aqui sem cair nos outros métodos
    if(e && e.name === 'AbortError') return true;
  }

  // 2) baixa como arquivo via link temporário (funciona bem no computador e em boa parte do celular)
  try{
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // espera um pouco antes de limpar: revogar a URL cedo demais pode cancelar o download
    setTimeout(()=>{
      try{ document.body.removeChild(a); }catch(e){}
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  }catch(e){}

  // 3) último recurso: abre o JSON numa aba nova, pro usuário salvar manualmente
  try{
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank');
    setTimeout(()=> URL.revokeObjectURL(url), 60000);
    return !!opened;
  }catch(e){ return false; }
}

/* lê um .json exportado pelo próprio app e restaura progresso/histórico/erros/configurações
   pra conta logada agora — substitui o que já existia (é uma restauração, não uma mescla). */
async function importProgressData(file){
  let data;
  try{
    const text = await file.text();
    data = JSON.parse(text);
  }catch(e){
    return {ok:false, error:'Não foi possível ler esse arquivo. Confira se é um .json exportado pelo Matemática Show.'};
  }
  if(!data || typeof data !== 'object' || (!data.progress && !data.history && !data.errors && !data.settings)){
    return {ok:false, error:'Esse arquivo não parece ser um backup do Matemática Show.'};
  }
  const uid = currentUserId();
  if(data.progress && typeof data.progress === 'object'){
    progressCache = data.progress; progressCacheUid = uid; await saveProgress();
  }
  if(Array.isArray(data.history)){
    historyCache = data.history; historyCacheUid = uid; await saveHistory();
  }
  if(Array.isArray(data.errors)){
    errorsCache = data.errors; errorsCacheUid = uid; await saveErrors();
  }
  if(data.settings && typeof data.settings === 'object'){
    settingsCache = Object.assign({}, DEFAULT_SETTINGS, data.settings); settingsCacheUid = uid; await saveSettings();
    applyTheme(settingsCache.theme); applyTextScale(settingsCache.textScale);
  }
  if(data.notes) importNotes(data.notes);
  if(data.game && typeof data.game === 'object'){
    gameCache = null; gameCacheUid = null;
    try{ localStorage.setItem(`${GAME_KEY_BASE}:${uid}`, JSON.stringify(data.game)); }catch(e){}
  }
  return {ok:true};
}

/* apaga progresso/histórico/erros da conta logada — a conta em si (nome/senha) continua existindo */
async function resetCurrentUserProgress(){
  const uid = currentUserId();
  const keepAvatar = (()=>{ try{ return loadGame().avatar || null; }catch(e){ return null; } })(); // o avatar não é progresso: continua
  [PROGRESS_KEY_BASE, HISTORY_KEY_BASE, ERRORS_KEY_BASE, GAME_KEY_BASE].forEach(base=>{
    try{ localStorage.removeItem(`${base}:${uid}`); }catch(e){}
  });
  gameCache = null;
  if(keepAvatar){ const g = loadGame(); g.avatar = keepAvatar; saveGame(); }
  progressCache = {}; progressCacheUid = uid;
  historyCache = []; historyCacheUid = uid;
  errorsCache = []; errorsCacheUid = uid;
  await saveProgress(); await saveHistory(); await saveErrors();
}


/* ---------- lembrete de backup ----------
   o progresso fica só neste aparelho; de tempos em tempos lembramos de exportar uma cópia */
const BACKUP_KEY_BASE = 'mathstudy-backup-v1';
const BACKUP_EVERY_DAYS = 14, BACKUP_MIN_ANSWERS = 30;
function backupInfo(){ try{ return JSON.parse(localStorage.getItem(`${BACKUP_KEY_BASE}:${currentUserId()}`)||'{}'); }catch(e){ return {}; } }
function saveBackupInfo(o){ try{ localStorage.setItem(`${BACKUP_KEY_BASE}:${currentUserId()}`, JSON.stringify(Object.assign(backupInfo(), o))); }catch(e){} }
let _backupAskedThisRun = false;
async function maybeAskBackup(){
  if(_backupAskedThisRun || !currentUser) return;
  const progress = await loadProgress();
  const total = Object.values(progress).reduce((a,d)=>a+(d.attempted||0), 0);
  if(total < BACKUP_MIN_ANSWERS) return;
  const info = backupInfo(), now = Date.now();
  if(!info.since){ saveBackupInfo({since: now}); return; } // começa a contar a partir de agora
  const ref = Math.max(info.last||0, info.since||0, info.snooze||0);
  if(now - ref < BACKUP_EVERY_DAYS*864e5) return;
  _backupAskedThisRun = true;
  const ok = await showConfirm({icon:'💾', title:'Guarde uma cópia do seu progresso',
    message:`Você já respondeu ${total} questões! Seu progresso fica salvo só neste aparelho: se limpar o navegador ou trocar de celular, ele se perde. Quer salvar uma cópia agora?`,
    ok:'Salvar cópia', cancel:'Depois'});
  if(ok) exportProgressData(); else saveBackupInfo({snooze: now});
}
