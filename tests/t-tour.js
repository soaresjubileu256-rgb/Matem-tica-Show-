/* Tour do Pi e tela "Como usar": o tour passa por todos os passos, cada passo aponta pra algo
   que existe na tela, e todo tópico da Ajuda está num grupo.
   Regra do projeto: toda novidade atualiza o tour, a Ajuda e as Novidades (veja CLAUDE.md). */
const {T, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Tina Tour');
  await goScreen(p, 'home');
  await p.evaluate(()=>{ _tourActive = false; startTour(); }); await p.waitForTimeout(600);
  const n = await p.evaluate(()=> TOUR_STEPS.length), vistos = [], sem = [];
  for(let i=0;i<n;i++){
    const r = await p.evaluate(()=>{ const t = document.querySelector('.tour-card h3').textContent; return {t, sel: (TOUR_STEPS.find(s=>s.title===t)||{}).sel}; });
    vistos.push(r.t);
    if(r.sel && !(await p.evaluate(s=> !!document.querySelector(s), r.sel))) sem.push(r.sel);
    const fim = await p.evaluate(()=>{ const nx = document.querySelector('.tc-next'); if(nx){ nx.click(); return false; } return true; });
    await p.waitForTimeout(400); if(fim) break;
  }
  T('Tour', `passa pelos ${n} passos`, vistos.length===n, vistos.join(' | '));
  T('Tour', 'todo passo destaca algo que existe na tela', sem.length===0, sem.join(', '));
  await p.evaluate(()=>{ document.querySelectorAll('.tour-root').forEach(e=>e.remove()); _tourActive = false; });
  await goScreen(p, 'help');
  const r = await p.evaluate(()=>({faltam: HELP_GROUPS.flatMap(g=>g[1]).filter(t=> !HELP_TOPICS.some(x=>x.t===t)),
    soltos: HELP_TOPICS.filter(x=> !HELP_GROUPS.flatMap(g=>g[1]).includes(x.t)).map(x=>x.t), n: document.querySelectorAll('.help-topic, details, .hp-item').length}));
  T('Ajuda', 'todo tópico dos grupos existe', r.faltam.length===0, r.faltam.join(', '));
  T('Ajuda', 'todo tópico está num grupo', r.soltos.length===0, r.soltos.join(', '));
  T('Novidades', 'a entrada mais nova tem número maior que as outras', await p.evaluate(()=> NEWS[0].v === Math.max(...NEWS.map(x=>x.v))));
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
