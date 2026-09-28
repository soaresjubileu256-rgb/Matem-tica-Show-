/* =========================================================
   Matemática Show — ARMAZENAMENTO
   Única porta de entrada para o localStorage nas operações importantes.
   - storage.get / set / remove / has / keys / migrate
   - storage.transaction(fn): tudo o que for gravado dentro de fn é gravado junto no fim;
     se qualquer gravação falhar, as que já tinham ido são desfeitas (nada fica pela metade)
   - falha de gravação nunca é silenciosa: aparece um aviso amigável para a pessoa e,
     em desenvolvimento (arquivo local ou localhost), os detalhes vão para o console
   Carregado antes de todos os outros scripts; só declara `storage`.
   ========================================================= */
const storage = (()=>{
  const DEV = (()=>{ try{ return location.protocol==='file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname); }catch(e){ return false; } })();
  const SAVE_FAIL_MSG = 'Não conseguimos salvar seu progresso neste aparelho. Verifique o espaço disponível ou faça um backup.';
  const READ_FAIL_MSG = 'Não conseguimos ler parte dos seus dados neste aparelho. Nada foi apagado. Se o problema continuar, faça um backup.';
  let batch = null;          // Map(key → string | null) enquanto uma transação está aberta
  let depth = 0;             // transações dentro de transações viram uma só
  const rollbackHooks = [];  // quem guarda cópia em memória limpa a cópia quando algo é desfeito
  const failHooks = [];
  let lastNotice = 0;
  const stats = {writeFails:0, readFails:0, rollbacks:0};

  function devLog(kind, key, err){ if(DEV) console.warn(`[storage] falha ao ${kind} "${key}":`, err && (err.name || err.message) || err); }
  function notify(msg){
    failHooks.forEach(fn=>{ try{ fn(msg); }catch(e){ devLog('avisar', '-', e); } });
    const now = Date.now();
    if(now - lastNotice < 8000) return; // não repete o aviso em sequência
    lastNotice = now;
    try{
      let el = document.getElementById('store-fail');
      if(!el){ el = document.createElement('div'); el.id = 'store-fail'; el.className = 'net-notice store-fail'; el.setAttribute('role', 'alert'); document.body.appendChild(el); }
      el.innerHTML = '<span></span><button type="button" class="net-x" aria-label="Fechar aviso">✕</button>';
      el.querySelector('span').textContent = msg;
      el.querySelector('button').onclick = ()=> el.remove();
    }catch(e){ devLog('mostrar aviso', '-', e); }
  }
  function writeFailed(key, err){ stats.writeFails++; devLog('gravar', key, err); notify(SAVE_FAIL_MSG); }

  function getRaw(key){
    if(batch && batch.has(key)) return batch.get(key);
    try{ return localStorage.getItem(key); }
    catch(e){ stats.readFails++; devLog('ler', key, e); notify(READ_FAIL_MSG); return null; }
  }
  /* lê e interpreta JSON; se o conteúdo estiver corrompido devolve `fallback` sem apagar o original */
  function get(key, fallback){
    const raw = getRaw(key);
    if(raw === null || raw === undefined) return fallback;
    try{ return JSON.parse(raw); }
    catch(e){
      stats.readFails++; devLog('interpretar', key, e);
      // guarda uma cópia do conteúdo estragado antes que alguém grave por cima (pode ser recuperado depois)
      try{ const bak = key + ':corrompido'; if(localStorage.getItem(bak) === null) localStorage.setItem(bak, raw); }catch(e2){ devLog('copiar', key, e2); }
      notify(READ_FAIL_MSG); return fallback;
    }
  }
  function has(key){ return getRaw(key) !== null; }
  function writeNow(key, raw){
    try{ if(raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw); return true; }
    catch(e){ writeFailed(key, e); return false; }
  }
  function setRaw(key, raw){
    raw = raw === null ? null : String(raw);
    if(batch){ batch.set(key, raw); return true; }
    return writeNow(key, raw);
  }
  /* grava um valor (convertido para JSON). Devolve false se não conseguiu gravar. */
  function set(key, value){
    let raw;
    try{ raw = JSON.stringify(value); }catch(e){ writeFailed(key, e); return false; }
    return setRaw(key, raw);
  }
  function remove(key){ return setRaw(key, null); }
  function keys(prefix){
    const out = [];
    try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(k && (!prefix || k.startsWith(prefix))) out.push(k); } }
    catch(e){ devLog('listar', prefix||'*', e); }
    if(batch) batch.forEach((v,k)=>{ if((!prefix || k.startsWith(prefix)) && v!==null && !out.includes(k)) out.push(k); });
    return out;
  }

  function begin(){ if(depth++ === 0) batch = new Map(); }
  /* grava tudo o que ficou pendente; se algo falhar, desfaz o que já tinha sido gravado */
  function commit(){
    if(--depth > 0) return true;
    const pending = batch; batch = null;
    if(!pending || !pending.size) return true;
    const before = new Map();
    for(const [k, raw] of pending){
      let old = null;
      try{ old = localStorage.getItem(k); }catch(e){ old = null; }
      before.set(k, old);
      let ok = true;
      try{ if(raw === null) localStorage.removeItem(k); else localStorage.setItem(k, raw); }
      catch(e){ ok = false; devLog('gravar', k, e); }
      if(!ok){
        before.forEach((v, key)=>{ try{ if(v === null) localStorage.removeItem(key); else localStorage.setItem(key, v); }catch(e){ devLog('desfazer', key, e); } });
        stats.writeFails++; stats.rollbacks++;
        rollbackHooks.forEach(fn=>{ try{ fn([...pending.keys()]); }catch(e){ devLog('recarregar', '-', e); } });
        notify(SAVE_FAIL_MSG);
        return false;
      }
    }
    return true;
  }
  function abort(){
    if(--depth > 0) return;
    const pending = batch; batch = null;
    if(pending && pending.size) rollbackHooks.forEach(fn=>{ try{ fn([...pending.keys()]); }catch(e){ devLog('recarregar', '-', e); } });
  }
  /* executa fn (pode ser async) como uma operação só: ou grava tudo, ou nada.
     Devolve {ok, value}. Se fn lançar erro, nada é gravado e o erro segue adiante. */
  async function transaction(fn){
    begin();
    let value;
    try{ value = await fn(); }
    catch(e){ abort(); throw e; }
    return {ok: commit(), value};
  }
  /* move o conteúdo de uma chave para outra (usado ao renomear conta). Dentro de uma transação. */
  function migrate(fromKey, toKey){
    if(fromKey === toKey) return true;
    const raw = getRaw(fromKey);
    if(raw === null) return true;
    return setRaw(toKey, raw) && setRaw(fromKey, null);
  }

  return {get, getRaw, set, setRaw, remove, has, keys, migrate, transaction, begin, commit, abort,
    onRollback:fn=>rollbackHooks.push(fn), onFail:fn=>failHooks.push(fn),
    inTransaction:()=>!!batch, stats, DEV, SAVE_FAIL_MSG};
})();
