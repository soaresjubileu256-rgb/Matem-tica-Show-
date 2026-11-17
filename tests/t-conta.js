/* Contas: criar, sair, entrar com a senha certa/errada e levar a conta pra outro celular (código de transferência). */
const {T, newPage, register, clean, goScreen, run, URL0} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Lucas Silva', 'gato7lua');
  T('Conta', 'criar conta cai no Início com 20 moedas', await p.evaluate(()=> state.screen==='home' && loadGame().gems===20));
  await p.evaluate(()=> doLogout()); await p.waitForTimeout(800);
  await p.click('.acc-card'); await p.waitForTimeout(300);
  await p.fill('.authPass', 'errada9x'); await p.click('.auth-go'); await p.waitForTimeout(800);
  T('Conta', 'senha errada não entra', await p.evaluate(()=> !currentUser));
  await p.fill('.authPass', 'gato7lua'); await p.click('.auth-go'); await p.waitForTimeout(1200);
  T('Conta', 'senha certa entra', await p.evaluate(()=> !!currentUser && currentUser.name==='Lucas Silva'));
  await clean(p);

  // celular antigo com progresso
  const info = await p.evaluate(async()=>{
    for(let i=0;i<120;i++){ const s = SUBJECTS[i % SUBJECTS.length]; const {ex} = genQuestionAvoidingRepeat(s,'medio',null); await recordAnswer(s.id, i%3!==0, {difficulty:'medio', ex}); }
    const g = loadGame(); g.gems = 777; saveGame(); shopData().owned['coroa'] = 1; shopData().equip.hat = 'coroa'; saveGame();
    const code = await buildTransferCode();
    return {code, xp: loadGame().xp, errs: (await loadErrors()).length, ans: totalAnswered()};
  });
  T('Outro celular', 'gera o código (cabe numa mensagem)', /^MS1[GP]\./.test(info.code) && info.code.length < 65000, info.code.length + ' caracteres');
  await p.waitForTimeout(1000); await clean(p); // janelas de "subiu de nível" aparecem com atraso
  await goScreen(p, 'settings'); await p.click('.tf-act'); await p.waitForTimeout(900);
  T('Outro celular', 'Configurações abre a janela com o código', await p.evaluate(()=> !!document.querySelector('.tf-modal .tf-code')));

  // celular novo
  const {p:q} = await newPage(b);
  await q.goto(URL0 + '?n=' + Date.now()); await q.waitForTimeout(1200);
  await q.click('.auth-transfer'); await q.waitForTimeout(300);
  await q.fill('.tf-in', 'texto sem código'); await q.click('.auth-go'); await q.waitForTimeout(400);
  T('Outro celular', 'mensagem sem código mostra aviso', await q.evaluate(()=> /Não achei o código/.test(document.querySelector('.authErrorBox').innerText)));
  const msg = `Minha conta do Matemática Show 📲 cole no outro celular\n\n${info.code.slice(0,3000)}\n${info.code.slice(3000)}`;
  await q.fill('.tf-in', msg); await q.click('.auth-go'); await q.waitForTimeout(800);
  T('Outro celular', 'mensagem inteira é lida e mostra a conta', await q.evaluate(()=> document.querySelector('.authName').value==='Lucas Silva'));
  await q.fill('.authPass', 'novaSenha9'); await q.fill('.authPass2', 'novaSenha9'); await q.click('.auth-go'); await q.waitForTimeout(1800); await clean(q);
  const r = await q.evaluate(async()=>({u: currentUser && currentUser.name, xp: loadGame().xp, gems: loadGame().gems, hat: shopData().equip.hat, errs: (await loadErrors()).length, ans: totalAnswered()}));
  T('Outro celular', 'a conta chega com XP, moedas, loja, erros e respostas', r.u==='Lucas Silva' && r.xp===info.xp && r.gems===777 && r.hat==='coroa' && r.errs===info.errs && r.ans===info.ans, JSON.stringify(r));
  T('Geral', 'sem erros JS', p._errs.length===0 && q._errs.length===0, p._errs.concat(q._errs).join(' | '));
});
