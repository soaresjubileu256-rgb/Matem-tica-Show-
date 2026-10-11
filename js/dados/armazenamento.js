/* =========================================================
   ARMAZENAMENTO LOCAL — uma porta única para o localStorage
   - storeSet / storeGetJSON: gravam e leem com segurança.
       · armazenamento cheio → avisa a pessoa (antes falhava em silêncio e o progresso se perdia)
       · dado corrompido → guarda uma cópia em "<chave>::corrompido" antes de seguir em frente
         (antes o próximo salvamento apagava o original de vez)
   - USER_KEY_BASES: TODAS as chaves que pertencem a uma conta. Renomear, excluir, recomeçar e
     fazer backup usam esta lista. Chave nova por conta? Acrescente aqui (um teste confere).
   - Ponto de restauração: antes de importar um backup, guarda uma cópia da conta para "Desfazer".
   Formato das chaves por conta: `${base}:${idDaConta}`; páginas do caderno: `${NOTE}:${id}:${pagina}`.
   ========================================================= */
const USER_KEY_BASES = {
  // progresso de estudo (apagado em "Começar do zero")
  progresso: ['mathstudy-progress-v2', 'mathstudy-history-v1', 'mathstudy-errors-v1', 'mathstudy-game-v1', 'mathstudy-learn-v1',
              'mathstudy-tabuada-v1', 'mathstudy-exbest-v1', 'mathstudy-challenge-v1', 'mathstudy-ptrain-v1'],
  // conteúdo e preferências da pessoa (continuam em "Começar do zero")
  pessoal:   ['mathstudy-settings-v1', 'mathstudy-notes-v1', 'mathstudy-solve-recent', 'mathstudy-calc-hist',
              'mathstudy-news-seen', 'mathstudy-feedback', 'mathstudy-backup-v1'],
};
const NOTE_PAGE_BASE = 'mathstudy-note-v1';          // + `:${uid}:${idDaPagina}`
const NOTES_INDEX_BASE = 'mathstudy-notes-v1';
const RESTORE_POINT_BASE = 'mathstudy-restore-point-v1'; // + `:${uid}` (não entra no backup)
const ALL_USER_BASES = [...USER_KEY_BASES.progresso, ...USER_KEY_BASES.pessoal];

/* ---------- gravar / ler ---------- */
function isQuotaError(e){
  return !!e && (e.name==='QuotaExceededError' || e.name==='NS_ERROR_DOM_QUOTA_REACHED' || e.code===22 || e.code===1014);
}
let _storageWarnAt = 0;
function notifyStorageProblem(kind){
  const now = Date.now();
  if(now - _storageWarnAt < 60000) return; // no máximo um aviso por minuto
  _storageWarnAt = now;
  const msg = kind==='cheio'
    ? 'O espaço do aparelho para o app acabou e o seu último progresso pode não ter sido salvo. Apague páginas antigas do Caderno ou salve uma cópia em Configurações.'
    : 'O navegador não deixou salvar. Se estiver numa janela anônima, o progresso some ao fechar.';
  try{
    if(typeof showConfirm==='function' && typeof currentUser!=='undefined' && currentUser){
      showConfirm({icon:'⚠️', title: kind==='cheio' ? 'Armazenamento cheio' : 'Não foi possível salvar', message:msg, ok:'Ver meus dados', cancel:'Fechar'})
        .then(ok=>{ if(ok && typeof go==='function') go('settings'); });
    } else if(typeof queueToast==='function') queueToast('⚠️', 'Não foi possível salvar', msg);
    else console.warn(msg);
  }catch(e){ console.warn(msg); }
}
/* grava um texto; devolve true se gravou */
function storeSet(key, value, opts){
  try{ localStorage.setItem(key, value); return true; }
  catch(e){
    if(!(opts && opts.quiet)) notifyStorageProblem(isQuotaError(e) ? 'cheio' : 'bloqueado');
    return false;
  }
}
function storeSetJSON(key, obj, opts){
  let txt;
  try{ txt = JSON.stringify(obj); }catch(e){ console.warn('Não deu para converter em JSON:', key, e); return false; }
  return storeSet(key, txt, opts);
}
function storeGet(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } }
function storeRemove(key){ try{ localStorage.removeItem(key); return true; }catch(e){ return false; } }
/* lê JSON; se estiver corrompido, guarda o texto original em "<chave>::corrompido" e devolve o padrão */
const _corruptKeys = [];
function storeGetJSON(key, fallback){
  const raw = storeGet(key);
  if(raw===null || raw===undefined) return fallback;
  try{ return JSON.parse(raw); }
  catch(e){
    const q = key + '::corrompido';
    if(storeGet(q)===null) storeSet(q, raw, {quiet:true});
    _corruptKeys.push(key);
    console.warn('Dado corrompido guardado em', q);
    return fallback;
  }
}

/* ---------- chaves de uma conta ---------- */
function notePageIds(uid){
  const idx = storeGetJSON(`${NOTES_INDEX_BASE}:${uid}`, []);
  return Array.isArray(idx) ? idx.map(n=>n && n.id).filter(Boolean) : [];
}
/* todas as chaves que existem para a conta (exatas, sem procurar por prefixo) */
function userStorageKeys(uid, opts){
  const bases = opts && opts.only ? opts.only : ALL_USER_BASES;
  const keys = bases.map(b=>`${b}:${uid}`).filter(k=> storeGet(k)!==null);
  if(!opts || !opts.only || opts.only.includes(NOTES_INDEX_BASE)){
    notePageIds(uid).forEach(id=>{ const k = `${NOTE_PAGE_BASE}:${uid}:${id}`; if(storeGet(k)!==null) keys.push(k); });
  }
  return keys;
}
/* move tudo de uma conta para outro id (usado ao renomear). Copia primeiro; só apaga o antigo se tudo deu certo. */
function moveUserStorage(oldId, newId){
  if(oldId===newId) return {ok:true, moved:0};
  const pairs = [];
  ALL_USER_BASES.forEach(b=>{ const from = `${b}:${oldId}`; if(storeGet(from)!==null) pairs.push([from, `${b}:${newId}`]); });
  notePageIds(oldId).forEach(id=>{ const from = `${NOTE_PAGE_BASE}:${oldId}:${id}`; if(storeGet(from)!==null) pairs.push([from, `${NOTE_PAGE_BASE}:${newId}:${id}`]); });
  const rp = `${RESTORE_POINT_BASE}:${oldId}`;
  if(storeGet(rp)!==null) pairs.push([rp, `${RESTORE_POINT_BASE}:${newId}`]);
  const written = [];
  for(const [from, to] of pairs){
    if(!storeSet(to, storeGet(from))){ written.forEach(storeRemove); return {ok:false, moved:0}; } // desfaz a cópia parcial
    written.push(to);
  }
  pairs.forEach(([from])=> storeRemove(from));
  return {ok:true, moved:pairs.length};
}
function removeUserStorage(uid, opts){
  const keys = userStorageKeys(uid, opts);
  if(!opts || !opts.only) keys.push(`${RESTORE_POINT_BASE}:${uid}`);
  keys.forEach(storeRemove);
  return keys.length;
}

/* ---------- retrato completo da conta (backup e ponto de restauração) ---------- */
function snapshotUser(uid){
  const chaves = {};
  ALL_USER_BASES.forEach(b=>{ const v = storeGet(`${b}:${uid}`); if(v!==null) chaves[b] = v; });
  const paginas = {};
  notePageIds(uid).forEach(id=>{ const v = storeGet(`${NOTE_PAGE_BASE}:${uid}:${id}`); if(v!==null) paginas[id] = v; });
  return {chaves, paginas};
}
/* aplica um retrato numa conta. Valida tudo ANTES de mexer em qualquer coisa. */
function applyUserSnapshot(uid, snap){
  if(!snap || typeof snap!=='object' || typeof snap.chaves!=='object') return {ok:false, error:'Cópia inválida.'};
  const writes = [];
  for(const [base, raw] of Object.entries(snap.chaves)){
    if(!ALL_USER_BASES.includes(base)) continue;            // só chaves conhecidas do app
    if(typeof raw!=='string') return {ok:false, error:`Dado inválido em ${base}.`};
    try{ JSON.parse(raw); }catch(e){ return {ok:false, error:`Dado corrompido em ${base}.`}; }
    writes.push([`${base}:${uid}`, raw]);
  }
  for(const [id, raw] of Object.entries(snap.paginas||{})){
    if(!/^[\w-]{1,40}$/.test(id) || typeof raw!=='string') continue;
    writes.push([`${NOTE_PAGE_BASE}:${uid}:${id}`, raw]);
  }
  // apaga o que existe hoje e grava o retrato; se faltar espaço no meio, volta ao estado anterior
  const before = snapshotUser(uid);
  removeUserStorage(uid, {only: ALL_USER_BASES});
  for(const [k, v] of writes){
    if(!storeSet(k, v, {quiet:true})){
      removeUserStorage(uid, {only: ALL_USER_BASES});
      Object.entries(before.chaves).forEach(([b, raw])=> storeSet(`${b}:${uid}`, raw, {quiet:true}));
      Object.entries(before.paginas).forEach(([id, raw])=> storeSet(`${NOTE_PAGE_BASE}:${uid}:${id}`, raw, {quiet:true}));
      return {ok:false, error:'Não há espaço suficiente no aparelho para restaurar essa cópia. Nada foi alterado.'};
    }
  }
  return {ok:true};
}
function saveRestorePoint(uid){
  return storeSetJSON(`${RESTORE_POINT_BASE}:${uid}`, Object.assign({ts:Date.now()}, snapshotUser(uid)), {quiet:true});
}
function restorePointInfo(uid){
  const rp = storeGetJSON(`${RESTORE_POINT_BASE}:${uid}`, null);
  return rp && rp.chaves ? {ts: rp.ts} : null;
}
function undoLastRestore(uid){
  const rp = storeGetJSON(`${RESTORE_POINT_BASE}:${uid}`, null);
  if(!rp) return {ok:false, error:'Não há restauração para desfazer.'};
  const r = applyUserSnapshot(uid, rp);
  if(r.ok) storeRemove(`${RESTORE_POINT_BASE}:${uid}`);
  return r;
}

/* ---------- espaço e persistência ---------- */
function storageUsageBytes(){
  let n = 0;
  try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); n += (k.length + (localStorage.getItem(k)||'').length) * 2; } }catch(e){}
  return n; // UTF-16: 2 bytes por caractere
}
/* pede ao navegador para não apagar os dados sozinho quando faltar espaço (quando ele permitir) */
let _persistAsked = false;
async function requestPersistentStorage(){
  if(_persistAsked) return null; _persistAsked = true;
  try{
    if(navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()) return true;
    if(navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  }catch(e){}
  return null;
}
