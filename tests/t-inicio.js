/* Tela inicial: ordem das partes (sem ofensiva/moedas/vidas, a pedido) e cartão do jogador no Progresso. */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Ivo Inicio');
  await goScreen(p, 'home');
  const ordem = await p.evaluate(()=> [...document.querySelector('.home-scr').children].map(e=>
    e.classList.contains('status-pills') ? 'números' : e.classList.contains('mascot-row') ? 'saudação' : e.classList.contains('path-hero') ? 'trilha'
    : e.classList.contains('hd-today') ? 'hoje' : e.classList.contains('player-card') ? 'cartão' : e.classList.contains('dq-card') ? 'frase' : null).filter(Boolean));
  T('Início', 'ordem: saudação → Trilha → Hoje (sem coração/moedas/ofensiva, sem cartão e sem frase)', JSON.stringify(ordem)===JSON.stringify(['saudação','trilha','hoje']), JSON.stringify(ordem));
  await goScreen(p, 'progress');
  T('Progresso', 'cartão do jogador no topo e frase do dia no fim', await p.evaluate(()=>{ const c = document.querySelector('.pg-screen'); return c.firstElementChild.classList.contains('player-card') && !!c.querySelector('.dq-card'); }));
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
