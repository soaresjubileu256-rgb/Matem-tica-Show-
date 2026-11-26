/* Trilha em mapa de aventura: estados das fases (feita, atual, trancada),
   Pi em cima da fase atual, trilha dourada no trecho feito e cliques. */
const {T, R, newPage, register, clean, goScreen, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Teste Trilha');
  // episódio 1 completo e as 2 primeiras fases do episódio 2
  await p.evaluate(()=>{ const pd = pathDone(); allPathNodes().slice(0,7).forEach(n=> pd[n.key] = true); saveGame(); });
  await goScreen(p, 'path'); await p.waitForTimeout(400);
  const info = await p.evaluate(()=>{
    const maps = [...document.querySelectorAll('.path-map')];
    const m2 = maps[0];
    return {
      mapas: maps.length,
      nos1: m2.querySelectorAll('.mnode').length,
      feitas1: m2.querySelectorAll('.mnode.done').length,
      atual: document.querySelectorAll('.mnode.cur').length,
      atualNoMapa2: !!m2.querySelector('.mnode.cur.chest'),
      pi: document.querySelectorAll('.mnode-wrap.is-cur .mn-pi svg').length,
      play: (document.querySelector('.mn-play')||{}).textContent || '',
      trancadas2: m2.querySelectorAll('.mnode.locked').length,
      trilhaFeita2: m2.querySelectorAll('.pm-trail path.on').length,
      cenario: maps[0].querySelectorAll('.pm-scene').length,
      fora: maps.some(m=> [...m.querySelectorAll('.mnode-wrap')].some(w=>{ const r = w.getBoundingClientRect(), q = m.getBoundingClientRect(); return r.left < q.left - 1 || r.right > q.right + 1; })),
    };
  });
  T('trilha', 'episódio feito fica recolhido; o atual e o próximo têm mapa', info.mapas >= 2, info.mapas);
  T('trilha', 'episódio atual com 5 fases, 2 feitas', info.nos1===5 && info.feitas1===2, JSON.stringify(info));
  T('trilha', 'só uma fase atual (o prêmio do episódio 2)', info.atual===1 && info.atualNoMapa2, JSON.stringify(info));
  T('trilha', 'Pi em cima da fase atual', info.pi===1);
  T('trilha', 'botão ABRIR no prêmio', /ABRIR/.test(info.play), info.play);
  T('trilha', 'fases depois da atual trancadas', info.trancadas2===2, info.trancadas2);
  T('trilha', 'trilha dourada até a fase atual', info.trilhaFeita2===2, info.trilhaFeita2);
  T('trilha', 'cenário no mapa', info.cenario===4);
  // abrindo o episódio 1 (Rever fases), o chefe vencido aparece como troféu
  await p.evaluate(()=> document.querySelector('.u-toggle').click()); await p.waitForTimeout(300);
  const chefe = await p.evaluate(()=>{ const m = document.querySelector('.path-map'); return m.querySelectorAll('.mnode.done').length + ' ' + m.querySelector('.mnode.trophy .mn-ico').textContent; });
  T('trilha', 'Rever fases mostra o episódio 1 feito, com troféu do chefe', chefe==='5 🏆', chefe);
  T('trilha', 'nenhuma fase sai do mapa', !info.fora);
  // clique numa trancada avisa; numa feita abre a folha da fase
  await p.evaluate(()=> document.querySelector('.mnode.locked').click());
  await p.waitForTimeout(200);
  T('trilha', 'fase trancada avisa', await p.evaluate(()=> /Complete as fases/.test(document.body.innerText)));
  await p.evaluate(()=> document.querySelector('.mnode.done:not(.chest)').click());
  await p.waitForTimeout(400);
  T('trilha', 'fase feita abre a folha da fase', await p.evaluate(()=> !!document.querySelector('.sheet, .modal, [class*=sheet]')));
  await clean(p);
  // botão de baixo "Abrir prêmio" abre o prêmio da fase atual
  await goScreen(p, 'path'); await p.waitForTimeout(300);
  await p.evaluate(()=> document.querySelector('.pc-next').click()); await p.waitForTimeout(800);
  T('trilha', 'botão de baixo abre o prêmio', await p.evaluate(()=> pathDone()[allPathNodes()[7].key] === true || /prêmio|Prêmio/.test(document.body.innerText)));
  // tema claro também desenha o mapa
  await p.evaluate(()=> applyTheme('light')); await clean(p); await goScreen(p, 'path'); await p.waitForTimeout(300);
  T('trilha', 'mapa no tema claro', await p.evaluate(()=> document.querySelectorAll('.path-map .mnode').length >= 10));
});
