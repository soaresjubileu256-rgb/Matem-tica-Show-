/* App leve sem perder nada: a gravação agrupada (progresso, histórico, erros) não perde respostas
   ao recarregar ou trocar de conta; a cópia automática só copia quando algo mudou; o confete não acumula. */
const {T, newPage, register, clean, run, URL0} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await register(p, 'Leve Teste');
  // responde e recarrega na hora (sem esperar a fila gravar)
  const antes = await p.evaluate(async()=>{ for(let i=0;i<6;i++){ const s = SUBJECTS[i]; const {ex} = genQuestionAvoidingRepeat(s,'facil',null); await recordAnswer(s.id, i%2===0, {difficulty:'facil', ex}); }
    return {hist: (await loadHistory()).length, errs: (await loadErrors()).length, ans: totalAnswered(), naFila: _pendingSaves.size}; });
  await p.reload(); await p.waitForTimeout(1300); await clean(p);
  const depois = await p.evaluate(async()=>({hist: (await loadHistory()).length, errs: (await loadErrors()).length, ans: totalAnswered()}));
  T('Gravação', 'respondeu e recarregou na hora: nada se perde', antes.naFila>0 && depois.hist===antes.hist && depois.errs===antes.errs && depois.ans===antes.ans, JSON.stringify({antes, depois}));
  // sair da conta grava a fila
  await p.evaluate(async()=>{ const s = SUBJECTS[7]; const {ex} = genQuestionAvoidingRepeat(s,'facil',null); await recordAnswer(s.id, true, {difficulty:'facil', ex}); });
  const r = await p.evaluate(()=>{ const uid = currentUserId(); doLogout(); const raw = JSON.parse(localStorage.getItem(`mathstudy-history-v1:${uid}`)||'[]'); return {gravado: raw.length, fila: _pendingSaves.size}; });
  T('Gravação', 'sair da conta grava o que estava na fila', r.gravado===antes.hist+1 && r.fila===0, JSON.stringify(r));
  // cópia automática
  const {p:q} = await newPage(b);
  await register(q, 'Copia Teste');
  const c = await q.evaluate(async()=>{ const s = SUBJECTS[0]; const {ex} = genQuestionAvoidingRepeat(s,'facil',null); await recordAnswer(s.id, true, {difficulty:'facil', ex});
    const a = await autoBackupNow('teste'), b = await autoBackupNow('teste');
    const {ex:ex2} = genQuestionAvoidingRepeat(s,'facil',null); await recordAnswer(s.id, true, {difficulty:'facil', ex:ex2});
    const c2 = await autoBackupNow('teste'); return {primeira: a, igual: b, mudou: c2}; });
  T('Cópia automática', 'copia; sem mudança não copia de novo; com mudança copia', c.primeira===true && c.igual===false && c.mudou===true, JSON.stringify(c));
  // confete não acumula
  const f = await q.evaluate(()=>{ launchConfetti(120); launchConfetti(120); launchConfetti(120); return document.querySelectorAll('#gm-confetti').length; });
  T('Confete', 'vários confetes seguidos não se acumulam', f===1, f);
  await q.waitForTimeout(3200);
  T('Confete', 'o confete some sozinho', await q.evaluate(()=> !document.querySelector('#gm-confetti') && !_confettiOn));
  T('Geral', 'sem erros JS', p._errs.length===0 && q._errs.length===0, p._errs.concat(q._errs).join(' | '));
});
