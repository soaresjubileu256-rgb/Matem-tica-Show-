/* =========================================================
   CÓPIAS AUTOMÁTICAS DO PROGRESSO (IndexedDB)
      - banco "mathshow-backup", store "snaps": fica separado do localStorage, então
        protege se o localStorage encher, corromper ou for limpo
      - uma cópia por dia por conta (a do mesmo dia é substituída); guarda as 7 mais novas
      - feita ao entrar na conta, quando a página vai pro fundo (no máx. 1x a cada 10 min)
        e a cada 15 min de app aberto
      - se a conta abrir zerada e houver cópia com XP, oferece recuperar
      Tudo em try/catch: sem IndexedDB, nada quebra (só não há cópias).
   ========================================================= */
const AUTO_BK_DB = 'mathshow-backup', AUTO_BK_STORE = 'snaps', AUTO_BK_KEEP = 7;
const AUTO_BK_HIDDEN_GAP = 10*60*1000, AUTO_BK_EVERY = 15*60*1000;
let _autoBkDbP = null, _autoBkLast = 0;

function autoBkOpen(){
  if(_autoBkDbP) return _autoBkDbP;
  _autoBkDbP = new Promise((resolve, reject)=>{
    try{
      if(typeof indexedDB === 'undefined' || !indexedDB){ reject(new Error('sem IndexedDB')); return; }
      const req = indexedDB.open(AUTO_BK_DB, 1);
      req.onupgradeneeded = ()=>{
        const db = req.result;
        if(!db.objectStoreNames.contains(AUTO_BK_STORE)){
          const st = db.createObjectStore(AUTO_BK_STORE, {keyPath:'id'});
          st.createIndex('uid', 'uid', {unique:false});
        }
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
      req.onblocked = ()=> reject(new Error('IndexedDB bloqueado'));
    }catch(e){ reject(e); }
  });
  _autoBkDbP.catch(()=>{ _autoBkDbP = null; }); // deixa tentar de novo depois
  return _autoBkDbP;
}
function autoBkReq(req){ return new Promise((res, rej)=>{ req.onsuccess = ()=> res(req.result); req.onerror = ()=> rej(req.error); }); }
function autoBkDay(d){ d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function autoBkAnswered(progress){ return Object.values(progress||{}).reduce((a,d)=> a+((d && d.attempted)||0), 0); }

/* cópias da conta (da mais nova pra mais velha); [] se não der pra ler */
async function listAutoBackups(uid){
  try{
    uid = uid || currentUserId();
    const db = await autoBkOpen();
    const st = db.transaction(AUTO_BK_STORE, 'readonly').objectStore(AUTO_BK_STORE);
    const all = await autoBkReq(st.index('uid').getAll(uid));
    return (all||[]).sort((a,b)=> b.ts - a.ts);
  }catch(e){ return []; }
}

/* salva a cópia de hoje (substitui a de hoje, se já houver) e apaga as mais velhas */
async function autoBackupNow(reason){
  try{
    if(!currentUser) return false;
    const uid = currentUserId();
    const payload = JSON.parse(JSON.stringify(await buildBackupPayload()));
    const xp = (payload.game && payload.game.xp) || 0;
    const answered = autoBkAnswered(payload.progress);
    // progresso zerado não vira cópia: assim um apagão não substitui a cópia boa do dia
    if(!xp && !answered) return false;
    const day = autoBkDay(), ts = Date.now();
    const snap = {id:`${uid}|${day}`, uid, day, ts, xp, level: levelInfo(xp).level, answered, reason: reason||'', payload};
    const db = await autoBkOpen();
    await new Promise((res, rej)=>{
      const tx = db.transaction(AUTO_BK_STORE, 'readwrite');
      const st = tx.objectStore(AUTO_BK_STORE);
      tx.oncomplete = res; tx.onerror = ()=> rej(tx.error); tx.onabort = ()=> rej(tx.error);
      st.put(snap);
      // tudo por callback, dentro da mesma transação: apaga as mais velhas além das 7
      st.index('uid').getAll(uid).onsuccess = ev=>{
        (ev.target.result||[]).sort((a,b)=> b.ts - a.ts).slice(AUTO_BK_KEEP).forEach(old=> st.delete(old.id));
      };
    });
    _autoBkLast = ts;
    return true;
  }catch(e){ return false; }
}

/* restaura uma cópia na conta logada */
async function restoreAutoBackup(snap){
  try{
    if(!snap || !snap.payload) return {ok:false, error:'Cópia inválida.'};
    const file = new File([JSON.stringify(snap.payload)], 'auto.json', {type:'application/json'});
    return await importProgressData(file);
  }catch(e){ return {ok:false, error:'Não foi possível restaurar essa cópia.'}; }
}
function autoBkWhen(snap){
  const d = new Date(snap.ts);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
}
async function autoBkRestoreFlow(snap, opts){
  opts = opts || {};
  const ok = opts.skipConfirm ? true : await showConfirm({icon:'🛟', title:'Restaurar esta cópia?',
    message:`Seu progresso atual será substituído pela cópia de ${autoBkWhen(snap)} (nível ${snap.level}, ${snap.xp} XP).`,
    ok:'Restaurar', cancel:'Cancelar', danger:true});
  if(!ok) return false;
  const res = await restoreAutoBackup(snap);
  if(!res.ok){ queueToast('⚠️', 'Ops', res.error || 'Não foi possível restaurar'); return false; }
  queueToast('🛟', 'Progresso restaurado', `Nível ${snap.level} · ${snap.xp} XP`);
  render();
  return true;
}

/* janela com a lista de cópias (aberta pela tela de Configurações) */
async function showAutoBackups(){
  const snaps = await listAutoBackups();
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg ab-bg';
  const box = h(`<div class="gm-modal ab-modal" role="dialog" aria-modal="true" aria-label="Cópias automáticas">
    <div class="ab-head"><span class="ab-ico">🛟</span><h2>Cópias automáticas</h2></div>
    <p class="ab-intro">O app guarda sozinho uma cópia do seu progresso por dia (as últimas ${AUTO_BK_KEEP}).</p>
    <div class="ab-list"></div>
    <p class="ab-note">As cópias ficam neste aparelho. Se o app for desinstalado ou o celular trocar, use Exportar progresso (o botão “Salvar uma cópia”) para guardar um arquivo.</p>
    <button type="button" class="ab-close">Fechar</button></div>`);
  const list = box.querySelector('.ab-list');
  if(!snaps.length){
    list.appendChild(h(`<div class="ab-empty"><span>🌱</span><p>Ainda não há cópias. Elas são feitas sozinhas todo dia em que você usa o app — é só continuar estudando!</p></div>`));
  }
  const today = autoBkDay();
  snaps.forEach(s=>{
    const item = h(`<div class="ab-item">
      <div class="ab-txt"><b></b><small></small></div>
      <button type="button" class="ab-restore">Restaurar</button></div>`);
    item.querySelector('b').textContent = (s.day===today ? 'Hoje, ' : '') + autoBkWhen(s);
    item.querySelector('small').textContent = `⭐ Nível ${s.level} · ⚡ ${s.xp} XP · ✏️ ${s.answered} questões`;
    item.querySelector('.ab-restore').onclick = async ()=>{
      bg.remove();
      await autoBkRestoreFlow(s);
    };
    list.appendChild(item);
  });
  const close = ()=> bg.remove();
  box.querySelector('.ab-close').onclick = close;
  bg.addEventListener('click', e=>{ if(e.target===bg) close(); });
  bg.appendChild(box);
  document.body.appendChild(bg);
  return bg;
}

/* ao entrar: se a conta está zerada e há cópia com XP, oferece recuperar; senão, faz a cópia */
let _autoBkEnterTimer = null;
async function autoBackupCheckRecovery(){
  try{
    if(!currentUser) return false;
    const xp = (loadGame().xp)||0;
    const answered = autoBkAnswered(await loadProgress());
    const hist = await loadHistory();
    if(xp || answered || (hist && hist.length)) return false;
    const snap = (await listAutoBackups()).find(s=> s.xp > 0);
    if(!snap) return false;
    const ok = await showConfirm({icon:'🛟', title:'Recuperar progresso?',
      message:`Encontramos uma cópia do seu progresso de ${new Date(snap.ts).toLocaleDateString('pt-BR')} (nível ${snap.level}). Quer recuperar?`,
      ok:'Recuperar', cancel:'Agora não'});
    if(ok) await autoBkRestoreFlow(snap, {skipConfirm:true});
    return true;
  }catch(e){ return false; }
}
function autoBackupOnEnter(){
  try{
    clearTimeout(_autoBkEnterTimer);
    const uid = currentUserId();
    _autoBkEnterTimer = setTimeout(async ()=>{
      try{
        if(!currentUser || currentUserId()!==uid) return;
        await autoBackupCheckRecovery();
        await autoBackupNow('enter');
      }catch(e){}
    }, 3000);
  }catch(e){}
}
try{
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden' && currentUser && Date.now() - _autoBkLast >= AUTO_BK_HIDDEN_GAP) autoBackupNow('hidden');
  });
  setInterval(()=>{ if(currentUser) autoBackupNow('timer'); }, AUTO_BK_EVERY);
}catch(e){}
