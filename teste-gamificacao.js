/* =========================================================
   Matemática Show — TESTE: XP e gamificação sem duplicação (P1.6)
   Como rodar:  node teste-gamificacao.js
   Tenta ganhar a mesma recompensa duas vezes: clique rápido, Enter repetido, voltar,
   recarregar, repetir em outro modo. Confere XP, moedas, vidas, ofensiva, conquistas,
   missões, estrelas e prêmios.
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
  const clean = ()=>p.evaluate(()=>document.querySelectorAll('.gm-modal-bg,.tour-root,.gm-toast,#gm-confetti').forEach(x=>x.remove()));
  const G = ()=>p.evaluate(()=>{ const g = loadGame(); return {xp:g.xp, gems:g.gems||0, hearts:heartsNow(), streak:g.streak, ach:Object.keys(g.ach).length, att:totalAnswered(), hist:(historyCache||[]).length}; });

  await p.goto(URL); await W(700);
  const nb = await p.$('.new-acc'); if(nb) await nb.click();
  await p.fill('.authName','Teste 1'); await p.fill('.authPass','Girafa7Azul'); await p.fill('.authPass2','Girafa7Azul'); await p.click('.auth-go'); await W(1100);
  await p.evaluate(()=>{ markTutorialDone(); }); await clean();

  // --- exercícios, desafio e treino: clique triplo e Enter repetido ---
  for(const [label, code] of [['Exercícios', "startSession('adicao','facil')"], ['Desafio misto', "startChallenge('facil')"], ['Treino personalizado', "startPersonalizedSession({subjectIds:['adicao'], difficultyMode:'facil', qty:5, focusWeak:false, progress:progressSync()})"]]){
    const ok0 = await p.evaluate(code).then(()=>true).catch(e=>{ console.log('   erro ao começar:', e.message); return false; });
    await W(300); await clean();
    const g0 = await G();
    await p.evaluate(()=>{ const s = state.session, ex = s.current; document.querySelector('#ans1').value = ex.displayAnswer || String(ex.type==='pair' ? ex.answer[0] : ex.type==='xy' ? ex.answer.x : ex.answer); const i2 = document.querySelector('#ans2'); if(i2) i2.value = String(ex.type==='pair' ? ex.answer[1] : ex.answer.y); const bt = document.querySelector('.check-btn'); bt.click(); bt.click(); bt.click(); });
    await p.keyboard.press('Enter'); await W(500);
    const g1 = await G();
    ok(ok0 && g1.att===g0.att+1 && g1.hist===g0.hist+1 && g1.xp>g0.xp && await p.evaluate(()=>state.session.results.length===1), `${label}: clique triplo + Enter contam uma resposta só (XP +${g1.xp-g0.xp})`);
    await p.goBack(); await W(300); await p.goForward(); await W(300); await clean();
    ok((await G()).xp===g1.xp, `${label}: voltar e avançar não repete o XP`);
  }
  await p.reload(); await W(900); await clean();
  const afterReload = await G();

  // --- Trilha: clique duplo em CONFIRMAR, vida perdida uma vez ---
  await p.evaluate(()=>{ const g = loadGame(); g.hearts = 5; g.heartTs = Date.now(); saveGame(); startPathLesson(allPathNodes()[0], false); }); await W(400); await clean();
  const h0 = await G();
  await p.evaluate(()=>{ const s = state.session, wrong = s.q.opts.findIndex(o=>!o.ok); document.querySelectorAll('.mc-opt')[wrong].click(); const c = document.querySelector('.lesson-footer .show-btn'); c.click(); c.click(); }); await W(400);
  const h1 = await G();
  ok(h1.hearts===h0.hearts-1 && h1.att===h0.att+1, `Trilha: errar com clique duplo tira 1 vida só (${h0.hearts}→${h1.hearts}) e registra 1 resposta`);
  await p.evaluate(()=>{ const s = state.session, w2 = s.q.opts.findIndex((o,i)=>!o.ok && !(s.q.out||[]).includes(i)); if(w2>=0){ document.querySelectorAll('.mc-opt')[w2].click(); document.querySelector('.lesson-footer .show-btn').click(); } }); await W(400);
  ok((await G()).hearts===h1.hearts, 'Trilha: segundo erro na mesma pergunta não tira outra vida');
  await p.evaluate(()=>{ const s = state.session, r = s.q.opts.findIndex(o=>o.ok); document.querySelectorAll('.mc-opt')[r].click(); const c = document.querySelector('.lesson-footer .show-btn'); c.click(); c.click(); }); await W(400);
  const h2 = await G();
  ok(h2.att===h1.att, 'Trilha: acertar depois de errar não conta a pergunta de novo');
  await p.evaluate(()=>{ const n = document.querySelector('.fb-sheet .show-btn'); if(n) n.click(); }); await W(200);

  // --- baú da Trilha: clique duplo ---
  const chest = await p.evaluate(()=>{ const node = allPathNodes().find(x=>x.type==='chest' || /chest/i.test(x.kind||'')) || allPathNodes().find(x=>x.key && /chest|bau/i.test(x.key)); return node ? node.key : null; });
  if(chest){
    const c0 = await G();
    await p.evaluate(k=>{ const node = allPathNodes().find(x=>x.key===k); openChest(node, false); openChest(node, false); }, chest); await W(200); await clean();
    const c1 = await G();
    ok(c1.gems > c0.gems && c1.gems - c0.gems <= 40, `baú aberto com clique duplo: moedas uma vez só (+${c1.gems-c0.gems})`);
  } else ok(true, 'baú da Trilha: nenhum baú no mapa (pulado)');

  // --- missões: pegar a recompensa duas vezes ---
  const m = await p.evaluate(()=>{ const g = loadGame(); g.today.answered = 99; g.today.bestCombo = 9; g.today.bolts = 1; g.today.lessons = 1; saveGame();
    const st = missionState().find(x=>x.done && !x.claimed); if(!st) return null; const x0 = g.xp; claimMission(st.m.id); const x1 = loadGame().xp; claimMission(st.m.id); claimMission(st.m.id); return {gain:x1-x0, again:loadGame().xp-x1, reward:st.m.reward}; });
  ok(m && m.gain===m.reward && m.again===0, `missão: recompensa entregue uma vez só (+${m && m.gain} XP)`);
  await clean();

  // --- conquistas ---
  const a = await p.evaluate(()=>{ const g = loadGame(); delete g.ach.duelist; const n0 = Object.keys(g.ach).length; gameUnlock('duelist'); gameUnlock('duelist'); return Object.keys(loadGame().ach).length - n0; });
  ok(a===1, 'conquista desbloqueada duas vezes conta uma só');
  await clean();

  // --- ofensiva: várias respostas no mesmo dia ---
  const st = await p.evaluate(async()=>{ const g = loadGame(); g.streak = 4; g.lastDay = dayShift(-1); g.days = {}; saveGame(); dropUserCaches(); loadGame();
    for(let i=0;i<4;i++) await recordAnswer('adicao', true, {difficulty:'facil', ex:{question:`${i} + 1 = ?`, answer:i+1, type:'single'}});
    return loadGame().streak; });
  ok(st===5, `ofensiva: 4 respostas no mesmo dia somam 1 dia (4 → ${st})`);
  await p.reload(); await W(900); await clean();
  ok(await p.evaluate(()=>loadGame().streak)===5, 'ofensiva: recarregar não soma outro dia');
  await clean();

  // --- Arena: estrelas e XP de fase ---
  const ar = await p.evaluate(()=>{ const x0 = loadGame().xp; arenaData().phases.adicao = {facil:2}; saveGame(); return {x0}; });
  await p.evaluate(()=>go('arena')); await W(300); await clean();
  await p.evaluate(()=>document.querySelector('.ar-subj .ar-diff[data-d=facil]').click()); await W(300); await clean();
  for(let i=0;i<30;i++){
    const s = await p.evaluate(()=>state.session && {fin:state.session.finished, chk:state.session.checked, scr:state.screen});
    if(!s || s.fin || s.scr!=='lesson') break;
    if(s.chk){ await p.evaluate(()=>document.querySelector('.fb-sheet .show-btn').click()); await W(80); continue; }
    await p.evaluate(()=>{ const i = state.session.q.opts.findIndex(o=>o.ok); const el = document.querySelectorAll('.quiz-opt')[i]; el.click(); el.click(); }); await W(120); await clean();
  }
  await W(400); await clean();
  const ar1 = await p.evaluate(()=>({stars:arenaStars('adicao','facil'), xp:loadGame().xp}));
  await p.reload(); await W(900); await clean();
  const ar2 = await p.evaluate(()=>({stars:arenaStars('adicao','facil'), xp:loadGame().xp}));
  ok(ar1.stars===3 && ar2.xp===ar1.xp && ar2.stars===3, `Arena: fase perfeita dá 3 estrelas; recarregar a tela de resultado não repete XP (${ar1.xp}=${ar2.xp})`);

  // --- "Tente você" na página do assunto ---
  await p.evaluate(()=>go('subjectDetail',{subjectId:'adicao'})); await W(400); await clean();
  const tv0 = await G();
  await p.evaluate(()=>{ const o = document.querySelectorAll('.edu-try .mc-opt')[0]; o.click(); o.click(); document.querySelectorAll('.edu-try .mc-opt')[1].click(); }); await W(300);
  ok((await G()).att===tv0.att+1, '"Tente você": cliques repetidos nas alternativas contam uma resposta');

  console.log(`\n${n - fails}/${n} verificações OK | FALHAS: ${fails} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close();
  process.exit(fails || jsErr.length ? 1 : 0);
})();
