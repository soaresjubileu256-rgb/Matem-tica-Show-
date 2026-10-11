/* =========================================================
   SIMULADO DA PROVA — 10 questões inéditas no estilo de cada prova
   (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP), com tempo, nota e
   resolução comentada. As questões ficam em js/assuntos/provas-questoes.js.
   - A ordem das questões e das alternativas é fixa: as resoluções citam as letras.
   - Notas guardadas em loadGame().bankExams[idDaProva] (últimas 20).
   ========================================================= */
const BANK_EXAM_MINS = {enem:30, etec:25, fuvest:40, unicamp:40, unesp:35, obmep:30};
const BANK_DIFF_CLS = {'fácil':'facil', 'média':'medio', 'difícil':'dificil'};

function bankExamHistory(examId){
  const g = loadGame();
  g.bankExams = g.bankExams || {};
  return g.bankExams[examId] = g.bankExams[examId] || [];
}
function bankExamQuestions(examId){ return (typeof EXAM_BANK!=='undefined' && EXAM_BANK[examId]) || []; }

/* cartão na aba da prova (js/telas/provas.js) */
function bankExamCardHTML(e){
  const qs = bankExamQuestions(e.id);
  if(!qs.length) return null;
  const hist = bankExamHistory(e.id);
  const best = hist.length ? Math.max(...hist.map(x=>x.grade)) : null;
  const card = h(`<button type="button" class="bq-card" style="--c:${e.color}; --c2:${e.color2}">
      <span class="bq-card-i">📘</span>
      <span class="bq-card-t"><b>Simulado ${escHTML(e.name)} · questões inéditas</b>
        <small>${qs.length} questões no estilo da prova · ${BANK_EXAM_MINS[e.id]||30} min · ${qs[0].opts.length} alternativas · resolução comentada</small>
        <small class="bq-card-note">Criadas pelo Matemática Show, não são questões oficiais da prova.</small></span>
      <span class="bq-card-g">${best===null ? 'Começar ▶' : `<b>${fmt(best)}</b><small>melhor nota</small>`}</span>
    </button>`);
  card.onclick = ()=> startBankExam(e.id);
  return card;
}

function startBankExam(examId){
  const qs = bankExamQuestions(examId);
  if(!qs.length) return;
  state.session = {kind:'bankExam', examId, Q: qs.map(()=>({pick:-1, flag:false})), cur:0, T0:Date.now(), limit:(BANK_EXAM_MINS[examId]||30)*60};
  go('bankExamRun');
}

let _bankKeys = null;
function bankExamRunScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='bankExam' || sess.submitted){ setTimeout(()=>go('exams'), 0); return wrap; }
  const e = examById(sess.examId), qs = bankExamQuestions(sess.examId), N = qs.length, L = 'ABCDE';
  const leave = ()=> showConfirm({icon:'📝', title:'Abandonar o simulado?', message:'As respostas desta prova serão perdidas.', ok:'Abandonar', cancel:'Continuar a prova', danger:true})
    .then(ok=>{ if(ok){ sess.submitted = true; replaceHistoryState(); state.examId = sess.examId; go('exams'); } });
  const bar = topbar(`📘 Simulado ${e.name}`, true, leave);
  const clock = h(`<span class="ar-clock" role="timer" aria-live="off"></span>`);
  bar.appendChild(clock);
  wrap.appendChild(bar);
  const c = h(`<div class="content exam-run"></div>`);
  wrap.appendChild(c);

  const answered = sess.Q.filter(q=>q.pick>=0).length;
  const elapsed = ()=> (Date.now()-sess.T0)/1000;
  const head = h(`<div class="exr-head"><div class="exr-row"><span><b>${answered}</b> de ${N} respondidas</span><span class="exr-flags">${sess.Q.some(q=>q.flag) ? `★ ${sess.Q.filter(q=>q.flag).length} pra revisar` : ''}</span></div>
      <div class="exr-bar"><i style="width:${answered/N*100}%"></i></div><div class="exr-time"><i></i></div></div>`);
  c.appendChild(head);
  sess.warned = sess.warned || {};
  let first = true;
  const tick = ()=>{
    if(!first && (!wrap.isConnected || state.session!==sess || sess.submitted)) return false;
    first = false;
    const left = sess.limit - elapsed();
    clock.textContent = '⏱ ' + mmssA(left); clock.classList.toggle('low', left < 60);
    const tb = head.querySelector('.exr-time i'); if(tb){ tb.style.width = Math.max(0, left/sess.limit*100)+'%'; tb.classList.toggle('low', left < 60); }
    if(left <= 300 && left > 60 && !sess.warned.five){ sess.warned.five = true; queueToast('⏱', 'Faltam 5 minutos', 'Confira as questões em branco'); }
    if(left <= 60 && !sess.warned.one){ sess.warned.one = true; queueToast('⏰', 'Falta 1 minuto!', 'Ao acabar o tempo a prova é entregue'); }
    if(left <= 0){ bankExamSubmit(sess, true); return false; }
    return true;
  };
  tick();
  const timer = setInterval(()=>{ if(!tick()) clearInterval(timer); }, 1000);

  const grid = h(`<div class="ar-qgrid" role="navigation" aria-label="Questões da prova"></div>`);
  sess.Q.forEach((q,i)=>{
    const b = h(`<button type="button" class="${q.pick>=0?'ans':''} ${q.flag?'flag':''} ${i===sess.cur?'cur':''}" aria-label="Questão ${i+1}${q.pick>=0?', respondida':''}${q.flag?', marcada para revisar':''}" ${i===sess.cur?'aria-current="true"':''}>${i+1}</button>`);
    b.onclick = ()=>{ sess.cur = i; render(); };
    grid.appendChild(b);
  });
  c.appendChild(grid);

  const q = sess.Q[sess.cur], bq = qs[sess.cur];
  c.appendChild(h(`<div class="question-card exr-card bq-q"><div class="exr-qh"><span class="exr-n">${sess.cur+1}</span><span class="exr-s">${escHTML(bq.topic)}</span><span class="exr-d d-${BANK_DIFF_CLS[bq.diff]||'medio'}">${escHTML(bq.diff)}</span></div><div class="bq-origin">Questão inédita · estilo ${escHTML(e.name)}</div><div class="bq-text">${bq.html}</div></div>`));

  const pickOpt = i=>{
    q.pick = i; playTones([520], 0.03, 'sine', 0.05);
    const at = sess.cur;
    render();
    if(at < N-1) setTimeout(()=>{ if(state.session===sess && !sess.submitted && sess.cur===at && state.screen==='bankExamRun'){ sess.cur++; render(); } }, 420);
  };
  const opts = h(`<div class="mc-opts bq-opts"></div>`);
  bq.opts.forEach((o,i)=>{
    const b = h(`<button type="button" class="mc-opt ${q.pick===i?'sel':''}" aria-pressed="${q.pick===i}"><span class="key">${L[i]}</span><span class="lbl">${o}</span></button>`);
    b.onclick = ()=> pickOpt(i);
    opts.appendChild(b);
  });
  c.appendChild(opts);
  if(q.pick>=0){
    const cl = h(`<button type="button" class="exr-clear">Apagar resposta</button>`);
    cl.onclick = ()=>{ q.pick = -1; render(); };
    c.appendChild(cl);
  }
  const nav = h(`<div class="cta-row ar-exam-nav">
    <button type="button" class="btn secondary" data-a="prev" ${sess.cur===0?'disabled':''}>← Anterior</button>
    <button type="button" class="btn secondary ${q.flag?'flagged':''}" data-a="flag" aria-pressed="${q.flag}">${q.flag?'★ Marcada':'☆ Revisar depois'}</button>
    <button type="button" class="btn secondary" data-a="next" ${sess.cur===N-1?'disabled':''}>Próxima →</button></div>`);
  nav.querySelector('[data-a=prev]').onclick = ()=>{ if(sess.cur>0){ sess.cur--; render(); } };
  nav.querySelector('[data-a=next]').onclick = ()=>{ if(sess.cur<N-1){ sess.cur++; render(); } };
  nav.querySelector('[data-a=flag]').onclick = ()=>{ q.flag = !q.flag; render(); };
  c.appendChild(nav);
  const blank = sess.Q.filter(x=>x.pick<0).length;
  const sub = h(`<button type="button" class="btn primary ar-start ex-go ${blank?'':'ready'}">${blank ? `Entregar prova · ${blank} em branco` : '✓ Tudo respondido · Entregar prova'}</button>`);
  sub.onclick = ()=>{
    const bl = sess.Q.map((x,i)=> x.pick<0 ? i+1 : 0).filter(Boolean), fl = sess.Q.map((x,i)=> x.flag ? i+1 : 0).filter(Boolean);
    const msg = [bl.length ? `Em branco: questão ${bl.join(', ')} (conta como errada).` : 'Todas as questões estão respondidas.', fl.length ? `Marcadas pra revisar: ${fl.join(', ')}.` : ''].filter(Boolean).join(' ');
    showConfirm({icon:'📝', title:'Entregar a prova?', message: msg, ok:'Entregar', cancel:'Voltar à prova'})
      .then(ok=>{ if(ok) bankExamSubmit(sess, false); });
  };
  c.appendChild(sub);
  renderBankFigures(c);
  if(window.matchMedia && matchMedia('(pointer:fine)').matches) c.appendChild(h(`<p class="exr-keys">Atalhos: ${L.slice(0, bq.opts.length).split('').join(', ')} respondem · ← → trocam de questão · R marca pra revisar</p>`));
  // teclado do computador
  if(_bankKeys) document.removeEventListener('keydown', _bankKeys);
  _bankKeys = ev=>{
    if(state.screen!=='bankExamRun' || state.session!==sess || sess.submitted || document.querySelector('.gm-modal-bg')) return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test((ev.target||{}).tagName||'') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key.toLowerCase(), idx = 'abcde'.indexOf(k);
    if(k.length===1 && idx>=0 && idx < qs[sess.cur].opts.length){ ev.preventDefault(); const qq = sess.Q[sess.cur]; qq.pick = idx; playTones([520], 0.03, 'sine', 0.05); const at = sess.cur; render(); if(at < N-1) setTimeout(()=>{ if(state.session===sess && !sess.submitted && sess.cur===at && state.screen==='bankExamRun'){ sess.cur++; render(); } }, 420); }
    else if(ev.key==='ArrowLeft'){ ev.preventDefault(); if(sess.cur>0){ sess.cur--; render(); } }
    else if(ev.key==='ArrowRight'){ ev.preventDefault(); if(sess.cur<N-1){ sess.cur++; render(); } }
    else if(k==='r'){ ev.preventDefault(); sess.Q[sess.cur].flag = !sess.Q[sess.cur].flag; render(); }
  };
  document.addEventListener('keydown', _bankKeys);
  return wrap;
}

function bankExamSubmit(sess, timeUp){
  if(sess.submitted) return;
  sess.submitted = true;
  replaceHistoryState(); // voltar no navegador não reabre a prova
  const qs = bankExamQuestions(sess.examId);
  const secs = Math.round(Math.min(sess.limit, (Date.now()-sess.T0)/1000));
  const picks = sess.Q.map(q=>q.pick);
  const ok = picks.filter((p,i)=> p===qs[i].ans).length;
  const grade = Math.round(100*ok/qs.length)/10;
  const hist = bankExamHistory(sess.examId);
  const prev = hist.length ? hist[hist.length-1].grade : null;
  hist.push({ts:Date.now(), n:qs.length, ok, grade, secs});
  if(hist.length > 20) hist.splice(0, hist.length-20);
  gameUnlock('exam1');
  saveGame();
  state.session = {kind:'bankExamResult', examId:sess.examId, picks, ok, grade, secs, timeUp:!!timeUp, prevGrade:prev, filter:'all'};
  go('bankExamResult');
}

function bankExamResultScreen(){
  const r = state.session;
  const wrap = document.createElement('div');
  if(!r || r.kind!=='bankExamResult'){ setTimeout(()=>go('exams'), 0); return wrap; }
  const e = examById(r.examId), qs = bankExamQuestions(r.examId), N = qs.length, L = 'ABCDE';
  const back = ()=>{ state.examId = r.examId; go('exams'); };
  wrap.appendChild(topbar(`Resultado · ${e.name}`, true, back));
  const c = h(`<div class="content exam-result"></div>`);
  wrap.appendChild(c);
  const right = i=> r.picks[i]===qs[i].ans;
  const blank = r.picks.filter(p=>p<0).length;
  const msg = r.grade >= 9 ? `Excelente! Você está pronto pro estilo do ${e.name}.` : r.grade >= 7 ? 'Muito bom! Revise as que errou e vai longe.' : r.grade >= 5 ? 'Na média. Leia as resoluções e treine os assuntos que errou.' : 'Vamos treinar mais. As resoluções abaixo mostram o caminho de cada questão.';
  const diff = r.prevGrade===null ? null : Math.round((r.grade - r.prevGrade)*10)/10;
  c.appendChild(h(`<div class="exres-hero ${gradeCls(r.grade)}">
      <div class="ar-ring ${gradeCls(r.grade)}" style="--p:${r.grade*10}"><b>${fmt(r.grade)}</b><small>nota</small></div>
      <h2>${r.timeUp ? 'Tempo esgotado' : 'Prova entregue'}</h2>
      <p>${msg}</p>
      ${diff===null ? '' : `<span class="exres-diff ${diff>0?'up':diff<0?'down':''}">${diff>0?`▲ +${fmt(diff)}`:diff<0?`▼ ${fmt(diff)}`:'='} em relação à última vez</span>`}
    </div>`));
  c.appendChild(h(`<div class="exres-stats">
      <div class="g"><b>${r.ok}</b><span>certas</span></div>
      <div class="b"><b>${N - r.ok - blank}</b><span>erradas</span></div>
      <div class="w"><b>${blank}</b><span>em branco</span></div>
      <div class="t"><b>${mmssA(r.secs)}</b><span>tempo</span></div>
    </div>`));
  if(r.grade >= 7 && !r.celebrated){ r.celebrated = true; replaceHistoryState(); setTimeout(()=>launchConfetti(r.grade>=10?180:100), 250); }
  const acts = h(`<div class="exres-acts"></div>`);
  const again = h(`<button type="button" class="btn primary">🔁 Fazer de novo</button>`);
  again.onclick = ()=> startBankExam(r.examId);
  const bk = h(`<button type="button" class="btn secondary">🎓 Voltar para ${escHTML(e.name)}</button>`);
  bk.onclick = back;
  acts.appendChild(again); acts.appendChild(bk);
  c.appendChild(acts);

  c.appendChild(h(`<h3 class="ar-label">Gabarito e resolução comentada</h3>`));
  const fil = h(`<div class="ex-chips exres-filter"></div>`);
  [['all',`Todas (${N})`],['bad',`Erradas (${N-r.ok})`],['ok',`Certas (${r.ok})`]].forEach(([v,l])=>{
    const b = h(`<button type="button" class="ex-chip ${r.filter===v?'on':''}">${l}</button>`);
    b.onclick = ()=>{ r.filter = v; replaceHistoryState(); render(); };
    fil.appendChild(b);
  });
  c.appendChild(fil);
  const grid = h(`<div class="ar-qgrid result" aria-label="Ir para a questão"></div>`);
  qs.forEach((q,i)=>{
    const b = h(`<button type="button" class="${right(i)?'ok':'bad'}" aria-label="Questão ${i+1}: ${right(i)?'certa':'errada'}">${i+1}</button>`);
    b.onclick = ()=>{ if(r.filter!=='all' && (r.filter==='ok') !== right(i)){ r.filter = 'all'; render(); } setTimeout(()=>{ const el = document.getElementById('bqrv'+i); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }, 30); };
    grid.appendChild(b);
  });
  c.appendChild(grid);
  qs.forEach((q,i)=>{
    const ok = right(i), pick = r.picks[i];
    if(r.filter==='ok' && !ok) return;
    if(r.filter==='bad' && ok) return;
    const it = h(`<div class="card ar-review bq-review ${ok?'ok':'bad'}" id="bqrv${i}"><div class="ar-rv-h"><span><b class="rv-n">${i+1}</b> ${escHTML(q.topic)} · ${escHTML(q.diff)}</span><b class="${ok?'ok':'bad'}">${ok?'✓ Certa':pick<0?'⬜ Em branco':'✗ Errada'}</b></div>
      <div class="bq-text">${q.html}</div>
      <div class="ar-rv-opts"></div>
      <details class="ar-sol bq-sol" ${ok?'':'open'}><summary>Resolução comentada</summary><div class="bq-sol-h">Resposta: ${q.solHead}</div><div class="bq-text">${q.sol}</div></details></div>`);
    const ob = it.querySelector('.ar-rv-opts');
    q.opts.forEach((o,j)=>{
      const cls = j===q.ans ? 'right' : j===pick ? 'wrong' : '';
      ob.appendChild(h(`<div class="rv-opt ${cls}"><span class="k">${L[j]}</span><span class="l">${o}</span>${j===pick ? `<small>${ok ? '✓' : '✗'} sua resposta</small>` : j===q.ans && !ok ? '<small>✓ correta</small>' : ''}</div>`));
    });
    c.appendChild(it);
  });
  const foot = h(`<div class="cta-row" style="margin-top:16px"><button type="button" class="btn secondary">Voltar para ${escHTML(e.name)}</button></div>`);
  foot.querySelector('button').onclick = back;
  c.appendChild(foot);
  renderBankFigures(c);
  return wrap;
}
