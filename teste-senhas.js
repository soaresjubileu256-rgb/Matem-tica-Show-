/* =========================================================
   Matemática Show — TESTE: senhas e "Esqueci minha senha" (P1.1 e P1.2)
   Como rodar:  node teste-senhas.js
   ========================================================= */
const path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = 'file://' + path.join(__dirname, 'index.html');

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:390, height:844}});
  const jsErr = []; p.on('pageerror', e=>jsErr.push(e.message));
  let fails = 0, n = 0;
  const ok = (c, m)=>{ n++; console.log((c ? '✅' : '❌') + ' ' + m); if(!c) fails++; };
  const W = ms=>p.waitForTimeout(ms);
  await p.goto(URL); await W(700);

  // PBKDF2 em JS dá o mesmo resultado do navegador (e do vetor de teste oficial RFC 7914)
  const kdf = await p.evaluate(async()=>{
    const web = await pbkdf2Hex('Girafa7Azul', '00112233445566778899aabbccddeeff', 1000);
    const js = toHex(pbkdf2Sha256Js(new TextEncoder().encode('Girafa7Azul'), fromHex('00112233445566778899aabbccddeeff'), 1000));
    const rfc = toHex(pbkdf2Sha256Js(new TextEncoder().encode('passwd'), new TextEncoder().encode('salt'), 1));
    const sha = toHex(sha256Bytes(new TextEncoder().encode('abc')));
    return {same: web===js, rfc, sha};
  });
  ok(kdf.same, 'PBKDF2 em JavaScript puro = PBKDF2 do navegador');
  ok(kdf.rfc.startsWith('55ac046e56e3089fec1691c22544b605'), 'PBKDF2-SHA256 confere com o vetor oficial (RFC 7914)');
  ok(kdf.sha==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 em JS confere com o vetor oficial');

  // conta nova: nada de senha em texto, salt próprio
  const nb = await p.$('.new-acc'); if(nb) await nb.click();
  await p.fill('.authName','Teste 1'); await p.fill('.authPass','Girafa7Azul'); await p.fill('.authPass2','Girafa7Azul'); await p.fill('.authHint','bicho + cor'); await p.click('.auth-go'); await W(1200);
  const u1 = await p.evaluate(()=>{ const raw = localStorage.getItem('mathstudy-users-v1'); return {raw, u:JSON.parse(raw)[0]}; });
  ok(u1.u.kdf==='pbkdf2-sha256' && u1.u.iter===100000 && /^[0-9a-f]{32}$/.test(u1.u.salt) && /^[0-9a-f]{64}$/.test(u1.u.passHash), 'conta nova: PBKDF2-SHA256, 100.000 repetições, salt de 16 bytes');
  ok(!u1.raw.includes('Girafa7Azul'), 'a senha nunca aparece no armazenamento');
  await p.evaluate(()=>{ markTutorialDone(); document.querySelectorAll('.gm-modal-bg').forEach(x=>x.remove()); doLogout(); }); await W(400);

  // duas contas com a mesma senha têm resumos diferentes
  await p.click('.new-acc'); await W(100);
  await p.fill('.authName','Teste 2'); await p.fill('.authPass','Girafa7Azul'); await p.fill('.authPass2','Girafa7Azul'); await p.click('.auth-go'); await W(1200);
  ok(await p.evaluate(()=>{ const l = JSON.parse(localStorage.getItem('mathstudy-users-v1')); return l[0].passHash !== l[1].passHash && l[0].salt !== l[1].salt; }), 'mesma senha em duas contas: salts e resumos diferentes');
  await p.evaluate(()=>{ markTutorialDone(); document.querySelectorAll('.gm-modal-bg').forEach(x=>x.remove()); doLogout(); }); await W(400);

  // conta antiga (SHA-256 sem salt) entra e é atualizada
  await p.evaluate(async()=>{
    const l = JSON.parse(localStorage.getItem('mathstudy-users-v1'));
    l.push({id:'teste 3', name:'Teste 3', passHash: await legacyPasswordHash('Velha5Senha')});
    l.push({id:'teste 4', name:'Teste 4', passHash: legacyFallbackHash('Outra8Senha')});
    localStorage.setItem('mathstudy-users-v1', JSON.stringify(l)); usersCache = null; doLogout();
  }); await W(500);
  const loginAs = async (name, pass)=>{
    await p.evaluate(nm=>[...document.querySelectorAll('.acc-card')].find(x=>x.querySelector('.acc-name').textContent===nm).click(), name); await W(150);
    await p.fill('.authPass', pass); await p.click('.auth-go'); await W(1200);
    return p.evaluate(()=>currentUser ? currentUser.name : (document.querySelector('.auth-error')||{}).textContent);
  };
  ok(await loginAs('Teste 3','Velha5Senha')==='Teste 3', 'conta antiga (SHA-256 sem salt) continua entrando');
  ok(await p.evaluate(()=>{ const u = JSON.parse(localStorage.getItem('mathstudy-users-v1')).find(x=>x.id==='teste 3'); return u.kdf==='pbkdf2-sha256' && !!u.salt; }), '…e no primeiro login o resumo é refeito no formato novo');
  await p.evaluate(()=>{ markTutorialDone(); document.querySelectorAll('.gm-modal-bg').forEach(x=>x.remove()); doLogout(); }); await W(400);
  ok(await loginAs('Teste 3','Velha5Senha')==='Teste 3', '…e continua entrando com a mesma senha depois da atualização');
  await p.evaluate(()=>{ doLogout(); }); await W(400);
  ok(await loginAs('Teste 4','Outra8Senha')==='Teste 4', 'conta antiga com o resumo simples "fb…" também entra e é atualizada');
  await p.evaluate(()=>{ doLogout(); }); await W(400);

  // senha errada
  const wrong = await loginAs('Teste 1','Errada9Senha');
  ok(/Senha incorreta/.test(wrong), 'senha errada é recusada: '+wrong);

  // "Esqueci minha senha"
  await p.click('.forgot'); await W(200);
  ok(await p.evaluate(()=>/bicho \+ cor/.test(document.querySelector('.gm-modal').textContent)), 'conta escolhida: mostra só a dica dela');
  await p.evaluate(()=>document.querySelector('.gm-confirm-cancel').click()); await W(200);
  await p.evaluate(()=>{ const b = document.querySelector('.back'); if(b) b.click(); }); await W(150);
  await p.click('.other-acc'); await W(150);
  await p.fill('.authName','Ninguém Aqui'); await p.click('.forgot'); await W(200);
  const g1 = await p.evaluate(()=>document.querySelector('.gm-modal p').textContent);
  await p.evaluate(()=>document.querySelector('.gm-confirm-ok').click()); await W(150);
  await p.fill('.authName','Teste 2'); await p.click('.forgot'); await W(200);
  const g2 = await p.evaluate(()=>document.querySelector('.gm-modal p').textContent);
  await p.evaluate(()=>document.querySelector('.gm-confirm-ok').click()); await W(150);
  ok(g1===g2, 'nome digitado sem conta e conta sem dica recebem a MESMA resposta (não confirma se o nome existe)');
  await p.fill('.authName','Ninguém Aqui'); await p.fill('.authPass','Qualquer1'); await p.click('.auth-go'); await W(600);
  ok(await p.evaluate(()=>/Nome ou senha incorretos/.test(document.querySelector('.auth-error').textContent)), 'login com nome digitado: mensagem genérica "Nome ou senha incorretos"');

  // trocar senha
  await p.fill('.authName','Teste 2'); await p.fill('.authPass','Girafa7Azul'); await p.click('.auth-go'); await W(1200);
  await p.evaluate(()=>{ markTutorialDone(); document.querySelectorAll('.gm-modal-bg').forEach(x=>x.remove()); });
  const ch = await p.evaluate(async()=>({bad:(await changeCurrentUserPassword('Errada1x','Nova9Senha')).ok, good:(await changeCurrentUserPassword('Girafa7Azul','Nova9Senha')).ok}));
  ok(ch.bad===false && ch.good===true, 'trocar senha: exige a senha atual correta');
  await p.evaluate(()=>doLogout()); await W(400);
  ok(await loginAs('Teste 2','Girafa7Azul')!=='Teste 2', 'senha antiga deixa de valer');
  await p.evaluate(()=>{ const b = document.querySelector('.back'); if(b) b.click(); }); await W(150);
  ok(await loginAs('Teste 2','Nova9Senha')==='Teste 2', 'senha nova funciona');

  console.log(`\n${n - fails}/${n} verificações OK | FALHAS: ${fails} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close();
  process.exit(fails || jsErr.length ? 1 : 0);
})();
