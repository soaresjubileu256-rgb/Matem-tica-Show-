/* Regras do jogo: vidas, revisar erros pra ganhar vida, protetor de ofensiva, presente de nível,
   prêmio surpresa, missão da semana, Loja (XP em dobro, baú misterioso) e conquistas. */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Jogo Teste');
  await p.evaluate(()=>{ const g = loadGame(); g.unlocks = 'all'; saveGame(); });
  let r;

  // ---------- ofensiva e protetor ----------
  r = await p.evaluate(()=>{ const g = loadGame(); g.streak = 5; g.lastDay = dayShift(-2); g.freezes = 1; g.days = {}; saveGame(); gameCheckStreak();
    const a = {streak: g.streak, fr: g.freezes, f: g.days[dayShift(-1)]}; gameTouchDay(); a.depois = loadGame().streak; return a; });
  T('Ofensiva', '1 dia sem jogar + 1 protetor: ofensiva salva e continua subindo', r.streak===5 && r.fr===0 && r.f==='f' && r.depois===6, JSON.stringify(r));
  r = await p.evaluate(()=>{ const g = loadGame(); g.streak = 8; g.lastDay = dayShift(-3); g.freezes = 1; saveGame(); gameCheckStreak(); return {streak: g.streak, fr: g.freezes}; });
  T('Ofensiva', '2 dias sem jogar e só 1 protetor: zera sem gastar o protetor', r.streak===0 && r.fr===1, JSON.stringify(r));
  r = await p.evaluate(()=>{ const g = loadGame(); g.freezes = 0; g.gems = 100; saveGame(); const a = buyStreakFreeze(), b = buyStreakFreeze(), c = buyStreakFreeze(); return {a, b, c, fr: loadGame().freezes, gems: loadGame().gems}; });
  T('Ofensiva', 'protetor custa 40 e dá pra guardar só 2', r.a && r.b && !r.c && r.fr===2 && r.gems===20, JSON.stringify(r));

  // ---------- vidas ----------
  await p.evaluate(async()=>{ const s = SUBJECTS[0]; for(let i=0;i<4;i++){ const {ex} = genQuestionAvoidingRepeat(s,'facil',null); ex.question += ' '.repeat(i); await recordAnswer(s.id, false, {difficulty:'facil', ex}); }
    const g = loadGame(); g.hearts = 0; g.heartTs = Date.now(); g.gems = 10; saveGame(); go('path'); });
  await p.waitForTimeout(600); await clean(p);
  await p.evaluate(()=> showNoHearts()); await p.waitForTimeout(500);
  T('Vidas', 'sem vidas: oferece revisar 3 erros (e recarga apagada sem moedas)', await p.evaluate(()=> /best/.test(document.querySelector('.nh-rv-go').className) && /off/.test(document.querySelector('.nh-refill').className)));
  await p.click('.nh-rv-go'); await p.waitForTimeout(600);
  const responder = async certo=>{ await clean(p); await p.evaluate(certo=>{ const ex = state.session.errorQueue[state.session.index].ex, v = x=> String(Math.round(x*100)/100).replace('.',',');
      const a = document.querySelector('#ans1'), b2 = document.querySelector('#ans2');
      if(!certo){ a.value = '98765'; if(b2) b2.value = '98765'; }
      else if(ex.type==='single') a.value = ex.displayAnswer!==undefined ? String(ex.displayAnswer) : v(ex.answer);
      else if(ex.type==='pair'){ a.value = v(ex.answer[0]); b2.value = v(ex.answer[1]); } else { a.value = v(ex.answer.x); b2.value = v(ex.answer.y); } }, certo);
    await p.click('.check-btn'); await p.waitForTimeout(300); await clean(p);
    await p.evaluate(()=>{ const n = document.querySelector('.next-btn'); if(n) n.click(); }); await p.waitForTimeout(300); };
  await responder(true); await responder(false); await responder(true);
  r = await p.evaluate(()=>({h: heartsNow(), t: (document.querySelector('.er-life')||{}).innerText||'', ach: !!loadGame().ach.comeback}));
  T('Vidas', 'acertou 2 de 3 na revisão: ganha 1 vida (e a conquista "Volta por cima")', r.h===1 && /\+1 vida/.test(r.t) && r.ach, JSON.stringify(r));

  // ---------- presente de nível ----------
  await clean(p);
  r = await p.evaluate(()=>{ const g = loadGame(); g.xp = 0; g.gems = 0; saveGame(); gameAddXP(100); return {lv: levelInfo(loadGame().xp).level, gems: loadGame().gems}; });
  T('Nível', 'subir pro nível 2 dá 30 moedas', r.lv===2 && r.gems===30, JSON.stringify(r));
  await p.waitForTimeout(1000); await clean(p); // fecha a janela do nível 2 antes do próximo
  r = await p.evaluate(()=>{ const g = loadGame(); const own0 = shopOwnedCount(), g0 = g.gems; let need = 0; for(let lv = levelInfo(g.xp).level; lv < 5; lv++) need += xpForLevel(lv); gameAddXP(need - levelInfo(g.xp).into);
    return {lv: levelInfo(loadGame().xp).level, d: loadGame().gems - g0, item: shopOwnedCount() - own0}; });
  T('Nível', 'níveis 3, 4 e 5: 35 + 40 + 45 moedas e 1 item no nível 5', r.lv===5 && r.d===120 && r.item===1, JSON.stringify(r));
  await p.waitForTimeout(1600);
  T('Nível', 'a janela do nível mostra o presente e o botão de usar o item', await p.evaluate(()=> !!document.querySelector('.rw-modal .rw-level') && document.querySelectorAll('.rw-prize').length===2 && !!document.querySelector('.rw-alt')));
  await clean(p);

  // ---------- prêmio surpresa ----------
  r = await p.evaluate(()=>{ const c = {}; for(let i=0;i<1500;i++){ const g = loadGame(); g.freezes = 0; g.boostUntil = 0; const z = rollChestPrize(); const k = z.kind + (z.big ? '-grande' : ''); c[k] = (c[k]||0) + 1; } return c; });
  T('Prêmio surpresa', 'sorteia moedas, baú cheio, protetor e XP em dobro', r.gems>600 && r['gems-grande']>100 && r.freeze>100 && r.boost>100, JSON.stringify(r));
  await goScreen(p, 'path');
  r = await p.evaluate(()=>{ const n = allPathNodes().find(x=> x.type==='chest' && !pathDone()[x.key]); openChest(n, false); return {aberto: !!pathDone()[n.key], janela: !!document.querySelector('.rw-modal')}; });
  T('Prêmio surpresa', 'abrir o baú da Trilha marca como aberto e mostra o prêmio', r.aberto && r.janela, JSON.stringify(r));
  await clean(p);

  // ---------- missão da semana ----------
  r = await p.evaluate(()=>{ const w = weekMissionData(); w.id = 'w_correct'; w.correct = 80; saveGame(); const g0 = loadGame().gems; const ok = claimWeekMission(); const de_novo = claimWeekMission();
    return {ok, de_novo, gems: loadGame().gems - g0, ach: !!loadGame().ach.weekDone}; });
  T('Semana', 'baú da semana dá 100 moedas uma vez só', r.ok && !r.de_novo && r.gems===100 && r.ach, JSON.stringify(r));
  await clean(p);

  // ---------- Loja ----------
  r = await p.evaluate(()=>{ const g = loadGame(); g.gems = 300; g.boostUntil = 0; saveGame(); const ok = buyXpBoost(); const x0 = loadGame().xp; state.session = null; gameOnAnswer(SUBJECTS[0].id, true, 'facil'); return {ok, ganho: loadGame().xp - x0, gems: loadGame().gems}; });
  T('Loja', 'XP em dobro custa 50 e dobra o XP do acerto', r.ok && r.ganho===20 && r.gems>=250, JSON.stringify(r));
  await p.waitForTimeout(900); await clean(p);
  r = await p.evaluate(()=>{ const n0 = mysteryCandidates().length, g0 = loadGame().gems; const it = openMysteryBox(); return {item: !!it, menos: n0 - mysteryCandidates().length, gasto: g0 - loadGame().gems}; });
  T('Loja', 'baú misterioso custa 70 e dá um item que ainda não tinha', r.item && r.menos===1 && r.gasto===70, JSON.stringify(r));
  await clean(p);

  // ---------- conquistas ----------
  await p.evaluate(()=>{ const pd = pathDone(); allPathNodes().filter(n=>n.type==='trophy').slice(0,5).forEach(n=> pd[n.key] = true); saveGame(); gameCheckAchievements(); });
  T('Conquistas', 'chefes derrotados viram "Caça-chefes" e "Domador de chefes"', await p.evaluate(()=> !!loadGame().ach.boss1 && !!loadGame().ach.boss5));
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
