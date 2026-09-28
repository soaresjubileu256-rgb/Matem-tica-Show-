/* =========================================================
   Matemática Show — TESTE: acessibilidade, botões e métricas (P2.1, P2.2, P2.7)
   Como rodar:  node teste-acessibilidade.js
   ========================================================= */
const path = require('path'), fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = 'file://' + path.join(__dirname, 'index.html');

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:390, height:844}});
  const jsErr = []; p.on('pageerror', e=>jsErr.push(e.message));
  let fails = 0, n = 0;
  const ok = (c, m)=>{ n++; console.log((c ? '✅' : '❌') + ' ' + m); if(!c) fails++; };
  const W = ms=>p.waitForTimeout(ms);

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  ok(!/maximum-scale|user-scalable\s*=\s*no/.test(html), 'viewport permite zoom (sem maximum-scale)');
  const noType = ['app.js','aprendizagem.js','arena.js','estudo.js','ensino.js'].flatMap(f=> (fs.readFileSync(path.join(__dirname, f), 'utf8').match(/<button(?![^>]*\btype=)[\s>][^>]*>/g)||[]).map(x=>f+': '+x));
  ok(!noType.length, 'todo <button> no código tem type (' + (noType.length ? noType.slice(0,3).join(' ') : 'ok') + ')');

  await p.goto(URL); await W(700);
  const nb = await p.$('.new-acc'); if(nb) await nb.click();
  await p.fill('.authName','Teste 1'); await p.fill('.authPass','123'); await p.click('.auth-go'); await W(300);
  ok(await p.evaluate(()=>{ const e = document.querySelector('.auth-error'); return e && e.getAttribute('role')==='alert'; }), 'erro no cadastro é anunciado pelo leitor de tela (role="alert")');
  await p.fill('.authPass','Girafa7Azul'); await p.fill('.authPass2','Girafa7Azul'); await p.click('.auth-go'); await W(1200);

  // janela de boas-vindas (primeiro acesso)
  const wl = await p.evaluate(()=>{ const box = document.querySelector('.welcome'); return {role:box.getAttribute('role'), modal:box.getAttribute('aria-modal'), label:!!(box.getAttribute('aria-labelledby')||box.getAttribute('aria-label')), focusIn:box.contains(document.activeElement)}; });
  ok(wl.role==='dialog' && wl.modal==='true' && wl.label && wl.focusIn, 'boas-vindas: diálogo com nome, e o foco vai para dentro');
  await p.keyboard.press('Escape'); await W(300);
  ok(await p.evaluate(()=>!document.querySelector('.welcome') && tutorialDone()), 'Esc fecha as boas-vindas (como "Pular apresentação")');

  // janela de confirmação: foco, Tab preso, Esc, foco volta
  await p.evaluate(()=>{ go('settings'); }); await W(600);
  await p.evaluate(()=>{ const b = document.querySelector('.settingsNameInput'); b.focus(); window.__res = null; showConfirm({title:'Teste', message:'Confirma?', ok:'Sim', cancel:'Não'}).then(r=> window.__res = r); }); await W(200);
  const cf = await p.evaluate(()=>{ const box = document.querySelector('.gm-modal-bg .gm-modal'); return {role:box.getAttribute('role'), modal:box.getAttribute('aria-modal'), label:document.getElementById(box.getAttribute('aria-labelledby')||'x') ? document.getElementById(box.getAttribute('aria-labelledby')).textContent : '', focus:document.activeElement.textContent}; });
  ok(cf.role==='dialog' && cf.modal==='true' && cf.label==='Teste' && cf.focus==='Sim', 'confirmação: diálogo nomeado pelo título, foco no primeiro botão');
  for(let i=0;i<5;i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(()=>document.querySelector('.gm-modal-bg').contains(document.activeElement)), 'Tab fica dentro da janela aberta');
  await p.keyboard.press('Escape'); await W(300);
  ok(await p.evaluate(()=>window.__res===false && !document.querySelector('.gm-modal-bg')), 'Esc = "Não" (a janela responde como se tivesse tocado em cancelar)');
  ok(await p.evaluate(()=>document.activeElement && document.activeElement.classList.contains('settingsNameInput')), 'o foco volta para onde estava');

  // "Não sei o que estudar" e meta do dia
  await p.evaluate(()=>{ go('home'); }); await W(400);
  await p.evaluate(()=>document.querySelector('.edu-lost-btn').focus()); await p.keyboard.press('Enter'); await W(300);
  ok(await p.evaluate(()=>document.querySelector('.wts').contains(document.activeElement)), 'teclado: Enter abre "Não sei o que estudar" com o foco dentro');
  await p.keyboard.press('Escape'); await W(300);
  ok(await p.evaluate(()=>!document.querySelector('.wts') && document.activeElement.classList.contains('edu-lost-btn')), 'Esc fecha e devolve o foco ao botão');

  // zoom: a página continua usável com o texto grande
  await p.evaluate(()=>{ document.documentElement.style.fontSize = '200%'; }); await W(200);
  ok(await p.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth + 1), 'com a fonte em 200% nada sai da tela na horizontal');
  await p.evaluate(()=>{ document.documentElement.style.fontSize = ''; });

  // métricas educacionais
  const mt = await p.evaluate(async()=>{
    const ex = i=>({question:`${i} + 2 = ?`, answer:i+2, type:'single'});
    for(let i=0;i<6;i++) await recordAnswer('adicao', i<5, {difficulty:'facil', ex:ex(i)});
    for(let i=0;i<5;i++) await recordAnswer('fracoes', i<2, {difficulty:'facil', ex:{question:`${i}/5 + 1/5 = ?`, answer:(i+1)/5, type:'single'}});
    const m = learningMetrics(7);
    return {answered:m.total.answered, correct:m.total.correct, days:m.days.length, strong:m.strong, weak:m.weak, minutes:m.total.minutes};
  });
  ok(mt.answered===11 && mt.correct===7 && mt.days===1, 'métricas: 11 respostas e 7 acertos registrados hoje');
  ok(mt.strong.includes('adicao') && mt.weak.includes('fracoes'), 'métricas: Adição como assunto forte, Frações como fraco');
  ok(await p.evaluate(async()=>{ const pl = await buildBackupPayload(); return !!(pl.game.metrics && pl.game.metrics.days); }), 'métricas entram no backup da conta');

  console.log(`\n${n - fails}/${n} verificações OK | FALHAS: ${fails} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close();
  process.exit(fails || jsErr.length ? 1 : 0);
})();
