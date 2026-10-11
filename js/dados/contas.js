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
/* nome válido para conta: os dois-pontos são o separador das chaves do armazenamento */
function accountNameProblem(name){
  name = String(name||'').trim();
  if(!name) return 'Digite um nome.';
  if(name.length > 30) return 'Use um nome com até 30 letras.';
  if(/[:<>]/.test(name)) return 'O nome não pode ter os sinais : < >.';
  return null;
}

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

/* ---------- senhas ----------
   As contas ficam SÓ neste aparelho (não há servidor). A senha serve para separar os perfis de quem
   divide o celular; ela não criptografa os dados (quem tem o aparelho consegue ler o armazenamento).
   Mesmo assim, guardamos a senha do jeito certo para não expor a senha real (que a pessoa pode usar
   em outros lugares): PBKDF2-SHA-256 com sal aleatório por conta e muitas iterações.
   Contas antigas (SHA-256 sem sal) são convertidas na próxima entrada com a senha certa. */
const PW_ITER = 310000;          // custo do PBKDF2 (≈ 0,1–1 s); guardado por conta, dá para aumentar depois
const PW_ITER_FALLBACK = 20000;  // sem WebCrypto (site aberto por http:// num IP da rede): versão em JS, mais lenta
function bytesToHex(b){ return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function hexToBytes(h){ const a = new Uint8Array(h.length/2); for(let i=0;i<a.length;i++) a[i] = parseInt(h.substr(i*2,2),16); return a; }
function hasWebCrypto(){ return typeof crypto!=='undefined' && crypto && crypto.subtle && typeof crypto.subtle.deriveBits==='function'; }
function randomSalt(){
  const b = new Uint8Array(16);
  if(typeof crypto!=='undefined' && crypto.getRandomValues) crypto.getRandomValues(b);
  else for(let i=0;i<16;i++) b[i] = Math.floor(Math.random()*256);
  return b;
}
async function pbkdf2(pass, saltBytes, iter){
  const pw = new TextEncoder().encode(String(pass));
  if(hasWebCrypto()){
    const key = await crypto.subtle.importKey('raw', pw, 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:saltBytes, iterations:iter}, key, 256));
  }
  return pbkdf2Js(pw, saltBytes, iter);
}
/* cria o registro da senha de uma conta nova (ou de uma troca de senha) */
async function makePasswordRecord(pass){
  const salt = randomSalt(), iter = hasWebCrypto() ? PW_ITER : PW_ITER_FALLBACK;
  return {alg:'pbkdf2-sha256', iter, salt: bytesToHex(salt), hash: bytesToHex(await pbkdf2(pass, salt, iter))};
}
function sameHex(a, b){ if(typeof a!=='string' || typeof b!=='string' || a.length!==b.length) return false; let d = 0; for(let i=0;i<a.length;i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d===0; }
/* confere a senha de uma conta; se a conta usa o formato antigo e a senha está certa, já converte */
async function verifyPassword(user, pass){
  if(!user) return false;
  if(user.pw && user.pw.alg==='pbkdf2-sha256'){
    return sameHex(bytesToHex(await pbkdf2(pass, hexToBytes(user.pw.salt), user.pw.iter)), user.pw.hash);
  }
  if(user.passHash && sameHex(await hashPasswordLegacy(pass), user.passHash)){
    try{
      const list = await loadUsers(), u = list.find(x=>x.id===user.id);
      if(u){ u.pw = await makePasswordRecord(pass); delete u.passHash; await saveUsers(list); }
    }catch(e){}
    return true;
  }
  return false;
}
/* formato antigo (só para conferir contas criadas antes desta versão) */
async function hashPasswordLegacy(pw){
  try{
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return bytesToHex(new Uint8Array(buf));
  }catch(e){
    let hh=0; for(let i=0;i<pw.length;i++){ hh = (hh*31 + pw.charCodeAt(i))|0; }
    return 'fb'+hh;
  }
}
/* SHA-256 + HMAC + PBKDF2 em JavaScript puro, só para quando o navegador não oferece WebCrypto */
function sha256Js(bytes){
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const H = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80; const bits = l * 8; const dv = new DataView(m.buffer);
  dv.setUint32(n-4, bits >>> 0); dv.setUint32(n-8, Math.floor(bits / 4294967296));
  const W = new Uint32Array(64);
  for(let o=0; o<n; o+=64){
    for(let i=0;i<16;i++) W[i] = dv.getUint32(o + i*4);
    for(let i=16;i<64;i++){ const a = W[i-15], b = W[i-2]; W[i] = (W[i-16] + ((a>>>7|a<<25)^(a>>>18|a<<14)^(a>>>3)) + W[i-7] + ((b>>>17|b<<15)^(b>>>19|b<<13)^(b>>>10)))|0; }
    let [a,b,c,d,e,f,g,h] = H;
    for(let i=0;i<64;i++){
      const t1 = (h + ((e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7)) + ((e&f)^(~e&g)) + K[i] + W[i])|0;
      const t2 = (((a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10)) + ((a&b)^(a&c)^(b&c)))|0;
      h = g; g = f; f = e; e = (d + t1)|0; d = c; c = b; b = a; a = (t1 + t2)|0;
    }
    H[0]+=a; H[1]+=b; H[2]+=c; H[3]+=d; H[4]+=e; H[5]+=f; H[6]+=g; H[7]+=h;
  }
  const out = new Uint8Array(32), ov = new DataView(out.buffer); H.forEach((v,i)=> ov.setUint32(i*4, v)); return out;
}
function hmacSha256Js(key, msg){
  if(key.length > 64) key = sha256Js(key);
  const k = new Uint8Array(64); k.set(key);
  const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(64 + 32);
  for(let i=0;i<64;i++){ ip[i] = k[i]^0x36; op[i] = k[i]^0x5c; }
  ip.set(msg, 64); op.set(sha256Js(ip), 64);
  return sha256Js(op);
}
function pbkdf2Js(pw, salt, iter){
  const s1 = new Uint8Array(salt.length + 4); s1.set(salt); s1[salt.length+3] = 1; // bloco 1 (32 bytes bastam)
  let u = hmacSha256Js(pw, s1); const t = u.slice();
  for(let i=1;i<iter;i++){ u = hmacSha256Js(pw, u); for(let j=0;j<32;j++) t[j] ^= u[j]; }
  return t;
}
/* compatibilidade: código antigo que ainda chame hashPassword() */
async function hashPassword(pw){ return hashPasswordLegacy(pw); }

async function loadUsers(){
  if(usersCache !== null) return usersCache;
  usersCache = storeGetJSON(USERS_KEY, []);
  if(!Array.isArray(usersCache)) usersCache = [];
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
          if(oldProgress) storeSet(`${PROGRESS_KEY_BASE}:${migrated.id}`, oldProgress);
        }
      }
    }catch(e){}
  }
  return usersCache;
}
async function saveUsers(list){
  usersCache = list;
  return storeSetJSON(USERS_KEY, list);
}
async function setCurrentUserId(id){
  storeSet(CURRENT_USER_KEY, id, {quiet:true});
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
  newName = (newName||'').trim().replace(/\s+/g,' ');
  const bad = accountNameProblem(newName);
  if(bad) return {ok:false, error:bad};
  const users = await loadUsers();
  const oldId = currentUser.id;
  const newId = userIdFromName(newName);
  if(newId !== oldId && users.some(u=>u.id===newId)){
    return {ok:false, error:'Já existe uma conta com esse nome neste aparelho.'};
  }
  const idx = users.findIndex(u=>u.id===oldId);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  if(newId !== oldId){
    // move TODAS as chaves da conta (antes só 5 iam junto: caderno, tabuada, desafios… ficavam pra trás)
    const mv = moveUserStorage(oldId, newId);
    if(!mv.ok) return {ok:false, error:'Não há espaço no aparelho para renomear agora. Nada foi alterado.'};
    if(progressCacheUid===oldId) progressCacheUid = newId;
    if(historyCacheUid===oldId) historyCacheUid = newId;
    if(errorsCacheUid===oldId) errorsCacheUid = newId;
    if(settingsCacheUid===oldId) settingsCacheUid = newId;
    if(typeof gameCacheUid!=='undefined' && gameCacheUid===oldId) gameCacheUid = newId;
  }
  users[idx] = Object.assign({}, users[idx], {id:newId, name:newName});
  if(!await saveUsers(users)){
    if(newId !== oldId) moveUserStorage(newId, oldId);
    return {ok:false, error:'Não foi possível salvar o novo nome. Nada foi alterado.'};
  }
  currentUser = {id:newId, name:newName};
  await setCurrentUserId(newId);
  return {ok:true};
}

async function changeCurrentUserPassword(currentPass, newPass){
  const users = await loadUsers();
  const idx = users.findIndex(u=>u.id===currentUser.id);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  if(!await verifyPassword(users[idx], currentPass)) return {ok:false, error:'Senha atual incorreta.'};
  const weak = passwordProblem(newPass, currentUser.name);
  if(weak) return {ok:false, error:weak};
  if(newPass === currentPass) return {ok:false, error:'A nova senha precisa ser diferente da atual.'};
  const fresh = await loadUsers(), j = fresh.findIndex(u=>u.id===currentUser.id); // verifyPassword pode ter convertido a conta
  fresh[j] = Object.assign({}, fresh[j], {pw: await makePasswordRecord(newPass)});
  delete fresh[j].passHash;
  if(!await saveUsers(fresh)) return {ok:false, error:'Não foi possível salvar a nova senha.'};
  return {ok:true};
}

/* baixa um .json com progresso, histórico, erros e configurações da conta logada */
async function exportProgressData(){
  saveBackupInfo({last: Date.now()});
  const [progress, history, errors, settings] = await Promise.all([loadProgress(), loadHistory(), loadErrors(), loadSettings()]);
  const payload = {
    app: 'matematica-show',
    formato: 2,                                   // formato 2: "conta" traz TODAS as chaves da conta
    exportedAt: new Date().toISOString(),
    account: currentUser ? currentUser.name : null,
    conta: snapshotUser(currentUserId()),
    // campos do formato 1, para versões antigas do app conseguirem ler este arquivo
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

/* lê um .json exportado pelo próprio app e restaura na conta logada (substitui o que existe).
   Antes de mexer, guarda um PONTO DE RESTAURAÇÃO da conta: dá para desfazer em Configurações. */
async function readBackupFile(file){
  let data;
  try{ data = JSON.parse(await file.text()); }
  catch(e){ return {ok:false, error:'Não foi possível ler esse arquivo. Confira se é um .json exportado pelo Matemática Show.'}; }
  if(!data || typeof data !== 'object' || (!data.conta && !data.progress && !data.history && !data.errors && !data.settings)){
    return {ok:false, error:'Esse arquivo não parece ser um backup do Matemática Show.'};
  }
  return {ok:true, data};
}
async function importProgressData(file, opts){
  const rd = file && file.text ? await readBackupFile(file) : {ok:true, data:file};
  if(!rd.ok) return rd;
  const data = rd.data, uid = currentUserId();
  if(!(opts && opts.semPontoDeRestauracao) && !saveRestorePoint(uid)){
    return {ok:false, error:'Não há espaço no aparelho para guardar uma cópia de segurança antes de restaurar. Salve uma cópia do progresso atual e apague páginas antigas do Caderno.'};
  }
  let res;
  if(data.formato >= 2 && data.conta && typeof data.conta==='object'){
    res = applyUserSnapshot(uid, data.conta);
  } else {
    res = importLegacyBackup(uid, data);
  }
  invalidateUserCaches();
  await loadSettings(); applyTheme(settingsCache.theme); applyTextScale(settingsCache.textScale);
  return res;
}
/* formato 1 (antes desta versão): campos soltos */
function importLegacyBackup(uid, data){
  const snap = {chaves:{}, paginas:{}};
  const put = (base, v)=>{ try{ snap.chaves[base] = JSON.stringify(v); }catch(e){} };
  if(data.progress && typeof data.progress === 'object') put(PROGRESS_KEY_BASE, data.progress);
  if(Array.isArray(data.history)) put(HISTORY_KEY_BASE, data.history);
  if(Array.isArray(data.errors)) put(ERRORS_KEY_BASE, data.errors);
  if(data.settings && typeof data.settings === 'object') put(SETTINGS_KEY_BASE, Object.assign({}, DEFAULT_SETTINGS, data.settings));
  if(data.game && typeof data.game === 'object') put(GAME_KEY_BASE, data.game);
  if(data.notes && Array.isArray(data.notes.index)){
    const idx = data.notes.index.filter(n=> n && /^[\w-]{1,40}$/.test(String(n.id)));
    put(NOTES_KEY_BASE, idx);
    idx.forEach(n=>{ try{ snap.paginas[n.id] = JSON.stringify((data.notes.pages||{})[n.id]||[]); }catch(e){} });
  }
  // o formato 1 não tinha as outras chaves: mantém as atuais (aulas lidas, tabuada, desafios…)
  const atual = snapshotUser(uid);
  Object.entries(atual.chaves).forEach(([b, raw])=>{ if(!(b in snap.chaves)) snap.chaves[b] = raw; });
  if(!data.notes) Object.assign(snap.paginas, atual.paginas);
  return applyUserSnapshot(uid, snap);
}
function invalidateUserCaches(){
  progressCache = null; historyCache = null; errorsCache = null; settingsCache = null;
  if(typeof gameCache!=='undefined'){ gameCache = null; gameCacheUid = null; }
}
async function undoLastRestoreForCurrentUser(){
  const r = undoLastRestore(currentUserId());
  invalidateUserCaches();
  await loadSettings(); applyTheme(settingsCache.theme); applyTextScale(settingsCache.textScale);
  return r;
}

/* apaga progresso/histórico/erros da conta logada — a conta em si (nome/senha) continua existindo */
async function resetCurrentUserProgress(){
  const uid = currentUserId();
  const keepAvatar = (()=>{ try{ return loadGame().avatar || null; }catch(e){ return null; } })(); // o avatar não é progresso: continua
  // apaga TODO o progresso de estudo (antes ficavam aulas lidas, tabuada, desafios e recordes)
  removeUserStorage(uid, {only: USER_KEY_BASES.progresso});
  gameCache = null;
  if(keepAvatar){ const g = loadGame(); g.avatar = keepAvatar; saveGame(); }
  progressCache = {}; progressCacheUid = uid;
  historyCache = []; historyCacheUid = uid;
  errorsCache = []; errorsCacheUid = uid;
  await saveProgress(); await saveHistory(); await saveErrors();
}


/* exclui a conta logada e TODOS os dados dela neste aparelho (pede a senha) */
async function deleteCurrentUser(pass){
  if(!currentUser) return {ok:false, error:'Nenhuma conta aberta.'};
  const users = await loadUsers(), acc = users.find(u=>u.id===currentUser.id);
  if(!acc) return {ok:false, error:'Conta não encontrada.'};
  if(!await verifyPassword(acc, pass)) return {ok:false, error:'Senha incorreta.'};
  const uid = acc.id;
  if(!await saveUsers((await loadUsers()).filter(u=>u.id!==uid))) return {ok:false, error:'Não foi possível excluir agora.'};
  removeUserStorage(uid);
  invalidateUserCaches();
  return {ok:true};
}

/* ---------- lembrete de backup ----------
   o progresso fica só neste aparelho; de tempos em tempos lembramos de exportar uma cópia */
const BACKUP_KEY_BASE = 'mathstudy-backup-v1';
const BACKUP_EVERY_DAYS = 14, BACKUP_MIN_ANSWERS = 30;
function backupInfo(){ try{ return JSON.parse(localStorage.getItem(`${BACKUP_KEY_BASE}:${currentUserId()}`)||'{}'); }catch(e){ return {}; } }
function saveBackupInfo(o){ storeSetJSON(`${BACKUP_KEY_BASE}:${currentUserId()}`, Object.assign(backupInfo(), o), {quiet:true}); }
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
