/* =========================================================
   LEVAR A CONTA PRA OUTRO CELULAR (sem servidor)
   O progresso vira um "código de transferência": um texto compactado que a pessoa
   manda pra ela mesma (WhatsApp, e-mail…). No outro celular, na tela de entrada,
   ela cola a mensagem, escolhe uma senha e a conta aparece com tudo.
   Formato: "MS1G." + base64url(gzip(JSON))  ·  sem gzip no aparelho: "MS1P." + base64url(JSON)
   A senha NÃO vai no código: no celular novo a pessoa cria (ou repete) a senha.
   ========================================================= */
const TRANSFER_HISTORY_KEEP = 80; // o histórico completo é grande; as últimas respostas bastam

function tfB64(bytes){
  let s = '';
  for(let i=0; i<bytes.length; i+=0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i+0x8000));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function tfUnB64(str){
  str = str.replace(/-/g,'+').replace(/_/g,'/');
  while(str.length % 4) str += '=';
  const bin = atob(str), out = new Uint8Array(bin.length);
  for(let i=0; i<bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function tfStream(bytes, Kind, fmt){
  const stream = new Blob([bytes]).stream().pipeThrough(new Kind(fmt));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function buildTransferCode(){
  const data = await buildBackupPayload();
  if(Array.isArray(data.history)) data.history = data.history.slice(0, TRANSFER_HISTORY_KEEP);
  data.transfer = 1;
  const json = new TextEncoder().encode(JSON.stringify(data));
  if(typeof CompressionStream === 'function'){
    try{ return 'MS1G.' + tfB64(await tfStream(json, CompressionStream, 'gzip')); }catch(e){}
  }
  return 'MS1P.' + tfB64(json);
}

/* aceita a mensagem inteira colada (com texto em volta e quebras de linha) */
async function decodeTransferCode(text){
  const clean = String(text||'').replace(/\s+/g,'');
  const m = clean.match(/MS1([GP])\.([A-Za-z0-9_-]+)/);
  if(!m) return {ok:false, error:'Não achei o código na mensagem. Cole a mensagem inteira que você mandou do outro celular.'};
  let bytes;
  try{ bytes = tfUnB64(m[2]); }catch(e){ return {ok:false, error:'O código está incompleto. Copie a mensagem inteira de novo.'}; }
  if(m[1]==='G'){
    if(typeof DecompressionStream !== 'function') return {ok:false, error:'Este celular é antigo demais pra abrir o código. Atualize o navegador ou o app.'};
    try{ bytes = await tfStream(bytes, DecompressionStream, 'gzip'); }catch(e){ return {ok:false, error:'O código está incompleto ou foi alterado. Copie a mensagem inteira de novo.'}; }
  }
  let data;
  try{ data = JSON.parse(new TextDecoder().decode(bytes)); }catch(e){ return {ok:false, error:'O código está incompleto ou foi alterado. Copie a mensagem inteira de novo.'}; }
  if(!data || typeof data!=='object' || (!data.progress && !data.game)) return {ok:false, error:'Esse código não é de uma conta do Matemática Show.'};
  return {ok:true, data};
}

/* resumo pra mostrar antes de trazer a conta */
function transferSummary(data){
  const g = data.game || {}, lv = levelInfo(g.xp||0);
  const answered = Object.values(data.progress||{}).reduce((a,p)=>a+(p.attempted||0), 0);
  return {name: data.account || '', level: lv.level, xp: g.xp||0, answered, streak: g.streak||0};
}

/* janela "Levar pra outro celular" (Configurações) */
async function showTransferOut(){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal tf-modal">
    <div class="big" style="font-size:52px">📲</div>
    <h2>Levar pra outro celular</h2>
    <p>Gerando o código da sua conta…</p>
  </div>`;
  document.body.appendChild(bg);
  let code;
  try{ code = await buildTransferCode(); }catch(e){ code = null; }
  const box = bg.querySelector('.tf-modal');
  if(!code){ box.querySelector('p').textContent = 'Não deu pra gerar o código. Tente de novo.'; box.appendChild(h(`<button type="button">Fechar</button>`)).onclick = ()=> bg.remove(); return; }
  saveBackupInfo({last: Date.now()});
  const kb = Math.max(1, Math.round(code.length/1024));
  const msg = `Minha conta do Matemática Show 📲 Pra trazer pro outro celular: abra o app, toque em "Trazer conta de outro celular" e cole esta mensagem inteira.\n\n${code}`;
  box.innerHTML = `<div class="big" style="font-size:52px">📲</div>
    <h2>Levar pra outro celular</h2>
    <ol class="tf-steps">
      <li><b>Envie o código pra você mesmo</b> (WhatsApp, e-mail ou Telegram).</li>
      <li>No outro celular, abra o app e toque em <b>“Trazer conta de outro celular”</b>.</li>
      <li><b>Cole a mensagem inteira</b> e crie uma senha.</li>
    </ol>
    <div class="tf-code mono" aria-label="Código de transferência"></div>
    <small class="tf-size">Código com ${kb} KB · tem o progresso, as conquistas, a loja, o caderno e os erros</small>
    <button type="button" class="tf-send">📤 Enviar pra mim</button>
    <button type="button" class="tf-copy">📋 Copiar</button>
    <button type="button" class="tf-close">Fechar</button>
    <p class="tf-warn">🔒 Quem tiver esse código consegue criar uma cópia da sua conta. Mande só pra você.</p>`;
  box.querySelector('.tf-code').textContent = code.slice(0, 64) + '…';
  const copy = async ()=>{
    try{ await navigator.clipboard.writeText(msg); showFloat('Copiado! Cole na conversa 📋'); return true; }
    catch(e){
      try{ const ta = document.createElement('textarea'); ta.value = msg; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); if(ok){ showFloat('Copiado! Cole na conversa 📋'); return true; } }catch(e2){}
      showFloat('Não deu pra copiar neste aparelho 😕', true); return false;
    }
  };
  box.querySelector('.tf-send').onclick = async ()=>{
    try{ if(navigator.share){ await navigator.share({text: msg}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    copy();
  };
  box.querySelector('.tf-copy').onclick = copy;
  box.querySelector('.tf-close').onclick = ()=> bg.remove();
}
