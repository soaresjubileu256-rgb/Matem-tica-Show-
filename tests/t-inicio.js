/* Tela inicial: ordem das partes, números (ofensiva, moedas, vidas) e cartão do jogador no Progresso. */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Ivo Inicio');
  await goScreen(p, 'home');
  const ordem = await p.evaluate(()=> [...document.querySelector('.home-scr').children].map(e=>
    e.classList.contains('home-pills') ? 'números' : e.classList.contains('mascot-row') ? 'saudação' : e.classList.contains('path-hero') ? 'trilha'
    : e.classList.contains('hd-today') ? 'hoje' : e.classList.contains('player-card') ? 'cartão' : e.classList.contains('dq-card') ? 'frase' : null).filter(Boolean));
  T('Início', 'ordem: números → saudação → Trilha → Hoje (sem cartão e sem frase)', JSON.stringify(ordem)===JSON.stringify(['números','saudação','trilha','hoje']), JSON.stringify(ordem));
  const r = await p.evaluate(()=>({t: document.querySelector('.home-pills').innerText.replace(/\s+/g,' '), g: loadGame().gems}));
  T('Início', 'mostra ofensiva, moedas (20 na conta nova) e vidas', /🔥/.test(r.t) && /🪙 20/.test(r.t) && /❤️ 5/.test(r.t) && r.g===20, JSON.stringify(r));
  await p.click('.home-pills .gem'); await p.waitForTimeout(600); await clean(p);
  T('Início', 'tocar nas moedas abre a Loja', await p.evaluate(()=> state.screen==='loja'));
  await goScreen(p, 'home'); await p.click('.home-pills .fire'); await p.waitForTimeout(400);
  T('Início', 'tocar no 🔥 abre o painel da ofensiva', await p.evaluate(()=> !!document.querySelector('.sk-modal')));
  await clean(p);
  await goScreen(p, 'progress');
  T('Progresso', 'cartão do jogador no topo e frase do dia no fim', await p.evaluate(()=>{ const c = document.querySelector('.pg-screen'); return c.firstElementChild.classList.contains('player-card') && !!c.querySelector('.dq-card'); }));
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
