/* Desafiar amigo: código ida e volta, mesmo código = mesmas perguntas, partida completa entre duas contas. */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Enzo Amigo');
  await p.evaluate(()=>{ const g = loadGame(); g.unlocks = 'all'; saveGame(); });
  let r = await p.evaluate(()=>{ const c = fcEncode({opt:5, seed:123456, ok:6, secs:83, name:'Ana'}), d = fcDecode(c);
    const errado = fcDecode(c.replace(/^./, x=> x==='0' ? '1' : '0'));
    const plano = ()=> fcPlan(5,123456).map(q=> q.ex.question + '|' + q.opts.map(o=>o.label).join(','));
    return {d, errado, iguais: JSON.stringify(plano())===JSON.stringify(plano()), n: plano().length}; });
  T('Desafiar amigo', 'código ida e volta guarda assunto, semente, acertos, tempo e nome', r.d && r.d.opt===5 && r.d.seed===123456 && r.d.ok===6 && r.d.secs===83 && r.d.name==='Ana', JSON.stringify(r.d));
  T('Desafiar amigo', 'código alterado é recusado', r.errado===null);
  T('Desafiar amigo', 'mesmo código = mesmas 7 perguntas', r.iguais && r.n===7);

  const jogar = async (pg, errarUma)=>{ for(let i=0;i<7;i++){ await clean(pg);
    const idx = await pg.evaluate(e=>{ const q = state.session.q; return e ? q.opts.findIndex(o=>!o.ok) : q.opts.findIndex(o=>o.ok); }, errarUma && i===3);
    await pg.evaluate(i=> lessonCheck(state.session, i), idx); await pg.waitForTimeout(150); await clean(pg);
    await pg.evaluate(()=>{ lessonAdvance(state.session); render(); }); await pg.waitForTimeout(150); }
    await pg.waitForTimeout(600); await clean(pg); };
  await goScreen(p, 'friendChallenge'); await p.click('.fc-go'); await p.waitForTimeout(500);
  await jogar(p, true);
  const code = await p.evaluate(()=> document.querySelector('.fc-code').textContent);
  T('Desafiar amigo', 'quem cria joga 7 e recebe o código', /^[0-9A-Z]{5}-[0-9A-Z]{5}-Enzo$/.test(code), code);

  const {p:q} = await newPage(b);
  await register(q, 'Bia Rival');
  await q.evaluate(()=>{ const g = loadGame(); g.unlocks = 'all'; saveGame(); });
  await goScreen(q, 'friendChallenge'); await q.fill('#fc-in', code); await q.click('.fc-accept'); await q.waitForTimeout(400);
  await q.click('.gm-confirm-ok'); await q.waitForTimeout(500);
  await jogar(q, false);
  r = await q.evaluate(()=>({t: document.querySelector('.le-title').textContent, gems: (document.querySelector('.le-gems')||{}).textContent||'', code: document.querySelector('.fc-code').textContent}));
  T('Desafiar amigo', 'amigo faz 7/7 contra 6/7: vence e ganha 20 moedas', /Você venceu/.test(r.t) && /\+20/.test(r.gems), JSON.stringify(r));
  await goScreen(p, 'friendChallenge'); await p.fill('#fc-in', r.code); await p.click('.fc-accept'); await p.waitForTimeout(400);
  T('Desafiar amigo', 'quem criou digita o código de volta e vê o resultado sem jogar', await p.evaluate(()=> state.screen==='friendChallenge' && /Bia venceu/.test(document.querySelector('.fc-result').innerText)));
  T('Geral', 'sem erros JS', p._errs.length===0 && q._errs.length===0, p._errs.concat(q._errs).join(' | '));
});
