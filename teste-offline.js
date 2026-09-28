/* =========================================================
   Matemática Show — TESTE: PWA, offline real e atualização (P1.8 e P1.9)
   Como rodar:  node teste-offline.js
   Sobe um servidor local numa cópia do app (precisa de python3), instala o service worker,
   corta a internet e usa o app; depois publica uma "versão nova" e confere a atualização.
   ========================================================= */
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const { chromium } = require(cp.execSync('npm root -g').toString().trim() + '/playwright');
const SRC = __dirname;
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-offline-'));
fs.readdirSync(SRC).filter(f=> fs.statSync(path.join(SRC, f)).isFile() && !/^teste-|\.md$|\.zip$/.test(f)).forEach(f=> fs.copyFileSync(path.join(SRC, f), path.join(DIR, f)));
const PORT = 8800 + Math.floor(Math.random()*150);
const server = cp.spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd:DIR, stdio:'ignore'});
const URL = `http://127.0.0.1:${PORT}/index.html`;

(async()=>{
  await new Promise(r=>setTimeout(r, 800));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390, height:844}});
  const p = await ctx.newPage();
  const jsErr = []; p.on('pageerror', e=>jsErr.push(e.message));
  const external = []; p.on('request', r=>{ if(!r.url().startsWith(`http://127.0.0.1:${PORT}`) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  let fails = 0, n = 0;
  const ok = (c, m)=>{ n++; console.log((c ? '✅' : '❌') + ' ' + m); if(!c) fails++; };
  const W = ms=>p.waitForTimeout(ms);
  const clean = ()=>p.evaluate(()=>document.querySelectorAll('.gm-modal-bg,.tour-root,.gm-toast,#gm-confetti').forEach(x=>x.remove()));

  // versões iguais no index.html e no service worker
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(SRC, 'sw.js'), 'utf8');
  const v = /APP_VERSION = '(\d+)'/.exec(sw)[1];
  const tags = [...html.matchAll(/(?:src|href)="([a-z-]+\.(?:js|css))(\?v=(\d+))?"/g)];
  ok(tags.length >= 8 && tags.every(t=>t[3]===v), `index.html e sw.js na mesma versão (v${v}) em todos os ${tags.length} scripts/estilos`);
  const listed = [...sw.matchAll(/'\.\/([^'?]+)'/g)].map(m=>m[1]).concat([...sw.matchAll(/'([a-z-]+\.(?:js|css))'/g)].map(m=>m[1]));
  const needed = fs.readdirSync(SRC).filter(f=>/\.(js|css|png|woff2|json)$/.test(f) && !/^teste-|^sw\.js$|^antes-e-depois/.test(f));
  ok(needed.every(f=>listed.includes(f)), 'todo arquivo do app está na lista do service worker '+needed.filter(f=>!listed.includes(f)).join(','));

  await p.goto(URL); await W(1200);
  const nb = await p.$('.new-acc'); if(nb) await nb.click();
  await p.fill('.authName','Teste 1'); await p.fill('.authPass','Girafa7Azul'); await p.fill('.authPass2','Girafa7Azul'); await p.click('.auth-go'); await W(1200);
  await p.evaluate(()=>markTutorialDone()); await clean();
  await p.evaluate(async()=>{ await navigator.serviceWorker.ready; }); await W(800);
  const cache = await p.evaluate(async v=>{ const k = await caches.keys(); const c = await caches.open('mat-show-v'+v); const reqs = (await c.keys()).map(r=>new URL(r.url).pathname + new URL(r.url).search); return {keys:k, n:reqs.length, reqs}; }, v);
  ok(cache.keys.includes('mat-show-v'+v) && cache.n >= 21, `service worker instalado, cache mat-show-v${v} com ${cache.n} arquivos`);
  ok(await p.evaluate(()=>document.fonts.check('16px Inter') && [...document.fonts].some(f=>f.family.replace(/"/g,'')==='Inter' && f.status==='loaded')), 'fonte Inter carregada do próprio app');
  ok(!external.length, 'nenhum pedido para fora do app (fontes e tudo mais são locais) '+external.slice(0,3).join(' '));

  // ---------- sem internet ----------
  await ctx.setOffline(true);
  await p.reload(); await W(1500); await clean();
  ok(await p.evaluate(()=>state.screen==='home' && !!document.querySelector('.edu-continue')), 'sem internet: o app abre (Início)');
  ok(await p.evaluate(()=>!!document.getElementById('net-off')), 'sem internet: aparece o aviso "Você está sem internet"');
  await p.evaluate(()=>go('content')); await W(300);
  ok(await p.evaluate(()=>document.querySelectorAll('.pth-subj').length===18), 'sem internet: navega pela trilha (18 assuntos)');
  await p.evaluate(()=>go('subjectDetail',{subjectId:'fracoes'})); await W(300);
  ok(await p.evaluate(()=>document.querySelectorAll('.edu-lesson').length>5), 'sem internet: abre as lições de Frações');
  await p.evaluate(()=>startSession('fracoes','facil')); await W(300);
  const q = await p.evaluate(()=>state.session.current.question);
  ok(!!q, 'sem internet: gera questão ('+q+')');
  const before = await p.evaluate(()=>progressSync().fracoes ? progressSync().fracoes.attempted : 0);
  await p.evaluate(()=>{ const ex = state.session.current; document.querySelector('#ans1').value = ex.displayAnswer || String(ex.answer); document.querySelector('.check-btn').click(); }); await W(500);
  await p.reload(); await W(1200); await clean();
  ok(await p.evaluate(()=>progressSync().fracoes.attempted)===before+1, 'sem internet: responde e o progresso fica salvo (sobrevive ao recarregar)');
  await p.evaluate(()=>go('calculator')); await W(300);
  await p.evaluate(()=>{ const k = t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t).click(); k('7'); k('×'); k('8'); k('='); }); await W(200);
  ok(await p.evaluate(()=>/56/.test(document.querySelector('.calc-display, .calc-screen, [class*=calc]').textContent)), 'sem internet: calculadora funciona (7 × 8 = 56)');
  await p.evaluate(()=>go('errors')); await W(500);
  ok(await p.evaluate(()=>/Vamos revisar|Nada para revisar/.test(document.body.innerText)), 'sem internet: caderno de erros abre');
  await p.evaluate(()=>go('arena')); await W(300);
  ok(await p.evaluate(()=>state.screen==='arena' && !!document.querySelector('.ar-subj')), 'sem internet: Arena abre');
  await ctx.setOffline(false); await W(300);

  // ---------- versão nova publicada ----------
  const v2 = String(+v + 1);
  fs.writeFileSync(path.join(DIR, 'sw.js'), sw.replace(`APP_VERSION = '${v}'`, `APP_VERSION = '${v2}'`));
  fs.writeFileSync(path.join(DIR, 'index.html'), html.replace(/\?v=\d+/g, '?v='+v2).replace('<title>Matemática Show</title>', '<title>Matemática Show</title><meta name="versao-teste" content="nova">'));
  await p.evaluate(async()=>{ const r = await navigator.serviceWorker.getRegistration(); await r.update(); }); await W(2500);
  ok(await p.evaluate(()=>!!document.getElementById('net-upd')), 'versão nova: aparece "Nova versão disponível — Atualizar"');
  await p.evaluate(()=>document.querySelector('#net-upd button').click()); await W(1800);
  const up = await p.evaluate(async v2=>({keys:await caches.keys(), nova:!!document.querySelector('meta[name=versao-teste]'), user:currentUser && currentUser.name, att:progressSync().fracoes.attempted, scripts:[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean)}), v2);
  ok(up.nova && up.scripts.every(s=>s.endsWith('?v='+v2)), 'depois de "Atualizar": página e scripts da versão nova');
  ok(up.keys.length===1 && up.keys[0]==='mat-show-v'+v2, 'cache antigo apagado só depois que o novo ficou pronto ('+up.keys.join(',')+')');
  ok(up.user==='Teste 1' && up.att===before+1, 'a atualização não mexe nos dados do aluno (conta e progresso iguais)');

  // ---------- versão quebrada (arquivo faltando): a atual continua funcionando ----------
  const v3 = String(+v + 2);
  fs.writeFileSync(path.join(DIR, 'sw.js'), sw.replace(`APP_VERSION = '${v}'`, `APP_VERSION = '${v3}'`).replace("'./logo.png'", "'./nao-existe.png', './logo.png'"));
  await p.evaluate(async()=>{ const r = await navigator.serviceWorker.getRegistration(); try{ await r.update(); }catch(e){} }); await W(2500);
  const br = await p.evaluate(async()=>({keys:await caches.keys()}));
  await ctx.setOffline(true); await p.reload(); await W(1500); await clean();
  ok(br.keys.includes('mat-show-v'+v2) && await p.evaluate(()=>state.screen==='home'), 'versão nova com arquivo faltando não instala: a versão atual continua abrindo sem internet');
  await ctx.setOffline(false);

  console.log(`\n${n - fails}/${n} verificações OK | FALHAS: ${fails} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close(); server.kill(); fs.rmSync(DIR, {recursive:true, force:true});
  process.exit(fails || jsErr.length ? 1 : 0);
})().catch(e=>{ console.error(e); server.kill(); process.exit(1); });
