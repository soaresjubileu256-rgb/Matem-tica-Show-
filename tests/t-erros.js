/* Errou 3 seguidas do mesmo assunto: aparece o aviso com a explicação; não fica repetindo; acerto zera. */
const {T, newPage, register, clean, run} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Gabi Erra');
  await p.evaluate(()=> startSession('fracoes', 'facil', 12)); await p.waitForTimeout(500);
  const responder = async certo=>{ await clean(p);
    await p.evaluate(certo=>{ const ex = state.session.current, f = document.querySelector('#ans1'), v = x=> String(Math.round(x*100)/100).replace('.',',');
      f.value = certo ? (ex.displayAnswer!==undefined ? String(ex.displayAnswer) : v(ex.answer)) : '98765'; const f2 = document.querySelector('#ans2'); if(f2) f2.value = '98765'; }, certo);
    await p.click('.check-btn'); await p.waitForTimeout(300);
    return p.evaluate(()=> !!document.querySelector('.rep-err')); };
  const proxima = async()=>{ await clean(p); await p.evaluate(()=>{ const n = document.querySelector('.next-btn'); if(n) n.click(); }); await p.waitForTimeout(300); };
  const a = await responder(false); await proxima(); const b2 = await responder(false); await proxima(); const c = await responder(false);
  T('Erro repetido', '1º e 2º erro sem aviso; 3º erro seguido mostra o aviso', !a && !b2 && c);
  await p.click('.rep-go'); await p.waitForTimeout(400);
  T('Erro repetido', '"Ver" abre a explicação por cima', await p.evaluate(()=> !!document.querySelector('.rep-sheet') && document.querySelector('.rep-sheet-c').innerText.length > 100));
  await p.click('.rep-back'); await p.waitForTimeout(300);
  T('Erro repetido', 'fechar volta pra mesma questão', await p.evaluate(()=> state.screen==='exerciseSession' && state.session.checked));
  await proxima(); const d = await responder(false); await proxima(); const e = await responder(false);
  T('Erro repetido', 'logo depois não repete o aviso', !d && !e);
  await proxima(); const f = await responder(false);
  T('Erro repetido', 'depois de mais 3 erros aparece de novo', f);
  await proxima(); await responder(true); await proxima(); const g = await responder(false);
  T('Erro repetido', 'acertou no meio: a sequência zera', !g);
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
