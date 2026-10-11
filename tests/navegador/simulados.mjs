// Simulados das provas (questões inéditas): figuras, navegação, revisão, teclado, cronômetro,
// entrega automática, nota, histórico, SALVAR E CONTINUAR, telas sem rolagem lateral; e o simulado gerado.
import { abrir, criarConta, placar } from './ajuda.mjs';
const t = placar();
const PROVAS = ['enem','etec','fuvest','unicamp','unesp','obmep'];
const inicio = async (p, k)=>{ await p.evaluate(k=>{ clearBankActive(); return startBankExam(k); }, k); await p.waitForTimeout(80); };

// 1) larguras de celular a computador: sem rolagem lateral, figuras legíveis, alternativas fáceis de tocar
for(const [w,h] of [[320,640],[390,844],[768,1024],[1280,800]]){
  const {page, fechar} = await abrir({viewport:{width:w, height:h}});
  await criarConta(page);
  const ruins = [];
  for(const k of PROVAS){
    for(let i=0;i<10;i++){
      await inicio(page, k); await page.evaluate(i=>{ state.session.cur=i; render(); }, i);
      const o = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth,
        fig:[...document.querySelectorAll('.pf-svg')].map(s=>s.getBoundingClientRect().width), alt:Math.min(...[...document.querySelectorAll('.bq-opts .mc-opt')].map(e=>e.getBoundingClientRect().height)),
        semFig:[...document.querySelectorAll('figure.bq-figure')].filter(f=>!f.querySelector('svg')).length}));
      if(o.sw > o.cw+1) ruins.push(`${k}${i+1}: rolagem lateral`);
      if(o.fig.some(x=>x<250)) ruins.push(`${k}${i+1}: figura estreita`);
      if(o.alt < 44) ruins.push(`${k}${i+1}: alternativa baixa`);
      if(o.semFig) ruins.push(`${k}${i+1}: figura não desenhada`);
    }
  }
  t.ok(`${w}px: 60 questões sem rolagem lateral, figuras ≥ 250px, alternativas ≥ 44px`, !ruins.length, ruins.slice(0,4).join('; '));
  await fechar();
}

const {page, erros, fechar} = await abrir();
await criarConta(page);
// 2) cartão em cada prova, com aviso de que não são oficiais
for(const k of PROVAS){
  await page.evaluate(k=>{ state.examId=k; go('exams'); }, k);
  t.ok(`aba ${k}: cartão do simulado inédito (não oficial)`, /não são questões oficiais/.test(await page.$eval('.bq-card', e=>e.innerText)));
}
// 3) navegação, revisão, resposta, teclado, ampliar
await page.evaluate(()=>{ state.examId='etec'; go('exams'); }); await page.click('.bq-card'); await page.waitForTimeout(150);
t.ok('menu de baixo escondido durante a prova', !(await page.$('.bottom-nav, nav.bnav, .bnav')) || await page.evaluate(()=> !document.querySelector('#app > nav')));
const t1 = await page.$eval('.bq-text', e=>e.innerText.slice(0,40)); await page.click('[data-a=next]'); await page.waitForTimeout(100);
t.ok('"Próxima" troca o enunciado e mostra o gráfico da questão 2', (await page.$eval('.bq-text', e=>e.innerText.slice(0,40)))!==t1 && await page.$eval('figure.bq-figure', f=>f.dataset.fig)==='etec-chuva');
await page.click('[data-a=prev]'); t.ok('"Anterior" volta', (await page.$eval('.bq-text', e=>e.innerText.slice(0,40)))===t1);
await page.click('.ar-qgrid button:nth-child(4)'); await page.waitForTimeout(100);
t.ok('grade de números vai para a questão 4 (figura da escada)', await page.evaluate(()=> state.session.cur===3 && !!document.querySelector('figure[data-fig="etec-escada"] svg')));
await page.click('[data-a=flag]'); t.ok('"Revisar depois" marca', await page.evaluate(()=> state.session.Q[3].flag===true));
await page.click('.bq-opts .mc-opt:nth-child(2)'); await page.waitForTimeout(550);
t.ok('escolher alternativa grava e avança', await page.evaluate(()=> state.session.Q[3].pick===1 && state.session.cur===4));
await page.evaluate(()=>{ state.session.cur=3; render(); }); await page.click('.exr-clear'); t.ok('"Apagar resposta"', await page.evaluate(()=> state.session.Q[3].pick===-1));
await page.keyboard.press('c'); await page.waitForTimeout(550); t.ok('tecla C responde', await page.evaluate(()=> state.session.Q[3].pick===2));
await page.keyboard.press('ArrowLeft'); t.ok('seta ← navega', await page.evaluate(()=> state.session.cur===3));
await page.evaluate(()=>{ state.session.cur=1; render(); });
await page.click('.bq-zoom'); t.ok('"Ampliar" abre a figura', !!(await page.$('.bq-zoom-bg svg'))); await page.keyboard.press('Escape'); t.ok('Esc fecha a figura', !(await page.$('.bq-zoom-bg')));
// 4) sair e continuar depois: respostas guardadas e tempo pausado
await page.evaluate(()=>{ state.session.Q[0].pick = 4; state.session.Q[5].flag = true; render(); });
const usado1 = await page.evaluate(()=> (Date.now()-state.session.T0)/1000);
await page.click('.topbar .back, .topbar button'); await page.click('.gm-confirm-ok'); await page.waitForTimeout(150);
t.ok('"Sair e continuar depois" volta para a prova com o cartão "Continuar"', await page.evaluate(()=> state.screen==='exams') && /Continuar o simulado/.test(await page.$eval('.bq-resume', e=>e.innerText)));
await page.waitForTimeout(2200); // tempo fora da prova não conta
await page.click('.bq-resume .bq-card'); await page.waitForTimeout(150);
const r = await page.evaluate(()=>({p0:state.session.Q[0].pick, f5:state.session.Q[5].flag, p3:state.session.Q[3].pick, usado:(Date.now()-state.session.T0)/1000}));
t.ok('continuar traz respostas e marcações de volta', r.p0===4 && r.f5===true && r.p3===2, JSON.stringify(r));
t.ok('o tempo fora do simulado não foi contado', r.usado < usado1 + 1.5, `${usado1.toFixed(1)}s → ${r.usado.toFixed(1)}s`);
// recarregar a página (app fechado) e continuar
await page.reload(); await page.waitForFunction(()=> !!currentUser);
await page.evaluate(()=>{ state.examId='etec'; go('exams'); });
t.ok('após fechar e abrir o app, o simulado continua salvo', !!(await page.$('.bq-resume')));
// começar outro simulado pede para descartar o pausado
await page.evaluate(()=>{ state.examId='enem'; go('exams'); }); await page.click('.bq-card');
t.ok('começar outro simulado avisa que o pausado será descartado', !!(await page.waitForSelector('.gm-confirm-ok', {timeout:2000}).catch(()=>null)));
await page.click('.gm-confirm-ok'); await page.waitForTimeout(150);
t.ok('...e o novo começa do zero', await page.evaluate(()=> state.session.examId==='enem' && state.session.Q.every(q=>q.pick<0)));
// 5) cronômetro e entrega automática
const c1 = await page.$eval('.ar-clock', e=>e.innerText); await page.waitForTimeout(2100);
t.ok('cronômetro corre', c1 !== await page.$eval('.ar-clock', e=>e.innerText));
await page.evaluate(()=>{ state.session.T0 = Date.now() - state.session.limit*1000 + 1500; }); await page.waitForTimeout(3000);
t.ok('tempo esgotado entrega a prova sozinho e limpa o simulado pausado', await page.evaluate(()=> state.screen==='bankExamResult' && state.session.timeUp===true && !loadGame().bankActive));
// 6) nota = contagem de acertos (respostas sorteadas)
for(const k of ['enem','unicamp','obmep']){
  await inicio(page, k);
  const esperado = await page.evaluate(k=>{ let ok=0; state.session.Q.forEach((q,i)=>{ const n = EXAM_BANK[k][i].opts.length; const r = Math.floor(Math.random()*(n+1))-1; q.pick=r; if(r===EXAM_BANK[k][i].ans) ok++; }); bankExamSubmit(state.session,false); return ok; }, k);
  await page.waitForTimeout(150);
  const got = await page.evaluate(()=>({ok:state.session.ok, g:state.session.grade}));
  t.ok(`nota ${k}: ${got.ok} certas (esperado ${esperado}) → ${got.g}`, got.ok===esperado && got.g===esperado && +(await page.$eval('.exres-stats .g b', e=>e.innerText))===esperado);
}
await page.click('.exres-filter .ex-chip:nth-child(2)'); t.ok('filtro "Erradas" esconde as certas', (await page.$$('.bq-review.ok')).length===0);
t.ok('histórico de tentativas por prova', await page.evaluate(()=> loadGame().bankExams.enem.length>=1 && loadGame().bankExams.unicamp.length>=1));
// 7) simulado gerado (o que já existia) continua funcionando
await page.evaluate(()=> startExamSimulado(examById('enem'))); await page.waitForTimeout(200);
t.ok('simulado gerado abre', await page.evaluate(()=> state.screen==='examRun' && state.session.Q.length===20));
await page.evaluate(()=>{ state.session.Q.forEach(q=>q.pick=0); examSubmit(state.session,false); }); await page.waitForTimeout(800);
t.ok('simulado gerado corrige', await page.evaluate(()=> state.screen==='examResult'));
// 8) telas que carregam: resultado atrasado não cobre a tela nova; erro mostra "Tentar de novo"
await page.evaluate(()=>{ window.__orig = ASYNC_SCREENS.report; ASYNC_SCREENS.report = ()=> new Promise(r=> setTimeout(()=> r(h('<div>RELATORIO_ATRASADO</div>')), 400)); go('report'); go('home'); });
await page.waitForTimeout(700);
t.ok('tela que carregou atrasada não cobre a tela atual', !(await page.evaluate(()=> document.body.innerText.includes('RELATORIO_ATRASADO'))) && await page.evaluate(()=> state.screen==='home'));
await page.evaluate(()=>{ ASYNC_SCREENS.report = ()=> Promise.reject(new Error('falha de teste')); go('report'); }); await page.waitForTimeout(200);
t.ok('erro ao abrir tela mostra mensagem e "Tentar de novo"', !!(await page.$('.screen-error [data-a=retry]')));
// fecha janelas que podem ter aparecido (ex.: "subiu de nível" pelo XP do simulado gerado)
await page.evaluate(()=>{ ASYNC_SCREENS.report = window.__orig; document.querySelectorAll('.gm-modal-bg').forEach(n=>n.remove()); }); await page.click('.screen-error [data-a=retry]'); await page.waitForTimeout(300);
t.ok('"Tentar de novo" abre a tela', !(await page.$('.screen-error')));
const reais = erros.filter(e=> !/falha de teste|Erro ao abrir a tela/.test(e));
t.ok('sem erros de JavaScript', reais.length===0, reais.join(' | '));
await fechar();
process.exit(t.fim() ? 1 : 0);
