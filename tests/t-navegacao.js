/* Menu de baixo, abas de cada seção e páginas que juntam modos (Praticar e Jogos):
   cada aba abre a tela certa, acende a aba e o menu certos, e o "voltar" de cada modo volta pra página dele. */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Nina Navega');
  const tabs = ()=> p.evaluate(()=> [...document.querySelectorAll('.sec-tab')].map(t=> t.textContent.replace(/^[^A-Za-zÀ-ú]+/,'').trim() + (t.classList.contains('on') ? '*' : '')));
  const nav = ()=> p.evaluate(()=> (document.querySelector('.bn-item.active .bn-label')||{}).textContent);

  // conta nova: a Arena (e os Jogos) abre aos poucos
  await goScreen(p, 'games');
  T('Liberar', 'conta nova: Jogos fica trancado junto com a Arena', await p.evaluate(()=> !document.querySelector('.hub-card')));
  await p.evaluate(()=>{ const g = loadGame(); g.unlocks = 'all'; saveGame(); });

  const secoes = [['content', ['Aprender*','Praticar','Provas','Erros'], 'Estudar'], ['arena', ['Fases*','Desafio do Dia','Jogos','Simulado'], 'Arena'],
    ['calculator', ['Resolver','Calculadora*','Caderno','Laboratório'], 'Ferramentas'], ['progress', ['Resumo*','Ranking','Relatório','Histórico','Conquistas','Certificados'], 'Progresso']];
  for(const [tela, esperado, menu] of secoes){
    await goScreen(p, tela);
    const t = await tabs();
    T('Abas', `${menu}: ${esperado.length} abas na ordem certa`, JSON.stringify(t)===JSON.stringify(esperado), JSON.stringify(t));
    T('Abas', `${menu}: menu de baixo aceso`, (await nav())===menu, await nav());
  }
  const hubs = [['practice', ['exercisesSubjects','stepSetup','tabuada','personalizedSetup','challengeDifficulty'], 'Estudar', 'Praticar'],
    ['games', ['lightning','speedRun','quizSetup','friendChallenge','duel'], 'Arena', 'Jogos']];
  for(const [hub, telas, menu, aba] of hubs){
    await goScreen(p, hub);
    T('Páginas', `${aba} mostra ${telas.length} modos`, await p.evaluate(()=> document.querySelectorAll('.hub-card').length)===telas.length);
    const ruins = [];
    for(const [i, tela] of telas.entries()){
      await goScreen(p, hub);
      await p.evaluate(i=> document.querySelectorAll('.hub-card')[i].click(), i); await p.waitForTimeout(600); await clean(p);
      const r = await p.evaluate(()=>({s: state.screen, aba: (document.querySelector('.sec-tab.on')||{}).textContent || ''}));
      const n = await nav();
      await p.evaluate(()=>{ const bt = document.querySelector('.topbar button'); if(bt) bt.click(); }); await p.waitForTimeout(600); await clean(p);
      const volta = await p.evaluate(()=> state.screen);
      if(r.s!==tela || !r.aba.includes(aba) || n!==menu || volta!==hub) ruins.push(`${tela}: abriu ${r.s}, aba "${r.aba.trim()}", menu ${n}, voltou pra ${volta}`);
    }
    T('Páginas', `${aba}: cada modo abre, acende "${aba}" e "${menu}", e o voltar volta`, ruins.length===0, ruins.join(' ; '));
  }
  await goScreen(p, 'geoLab', {geoBack:'calculator'});
  T('Abas', 'Laboratório fica em Ferramentas', (await nav())==='Ferramentas');
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
