/* =========================================================
   SIMULADO DE CADA PROVA (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
   Questões de interpretação no estilo da prova (js/assuntos/interpretacao.js),
   com tempo, alternativas A–E (A–D na Unicamp), nota e correção comentada:
   cada alternativa errada explica o engano mais comum por trás dela.
   As notas ficam em g.provaSims[prova] (últimas 20).
   ========================================================= */
const IQ_LETTERS = 'ABCDE';
function provaSimHistory(examId){ const g = loadGame(); g.provaSims = g.provaSims || {}; return g.provaSims[examId] || []; }

function startProvaSim(examId){
  const cfg = IQ_EXAMS[examId], exam = EXAM_CONTENTS.find(e=>e.id===examId);
  if(!cfg || !exam) return;
  const gens = shuffle(cfg.bank.slice()).slice(0, Math.min(cfg.n, cfg.bank.length));
  const Q = gens.map(gen=> iqMake(examId, gen)).filter(Boolean).map(q=>({q, pick:-1, flag:false}));
  state.session = {kind:'provaSim', examId, id:`p${Date.now().toString(36)}`, Q, cur:0, T0:Date.now(), limit:cfg.mins*60};
  go('provaRun');
}

/* enunciado completo da questão (texto + figura + pergunta) */
function iqQuestionHTML(q){
  return `<div class="iq-q">${q.text}${q.visual ? `<div class="iq-vis">${q.visual}</div>` : ''}<p class="iq-ask">${q.ask}</p></div>`;
}

function provaRunScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='provaSim' || sess.submitted){ setTimeout(()=>go('exams'), 0); return wrap; }
  const exam = EXAM_CONTENTS.find(e=>e.id===sess.examId);
  const leave = ()=> showConfirm({icon:'📝', title:'Sair do simulado?', message:'As respostas desta prova serão perdidas.', ok:'Sair', cancel:'Continuar a prova', danger:true})
    .then(ok=>{ if(ok){ sess.submitted = true; replaceHistoryState(); go('exams', {examId:sess.examId}); } });
  const bar = topbar(`${exam.ico} Simulado ${exam.name}`, true, leave);
  const clock = h(`<span class="ar-clock" role="timer" aria-live="off"></span>`);
  bar.appendChild(clock);
  wrap.appendChild(bar);
  const c = h(`<div class="content exam-run iq-run" style="--c:${exam.color}"></div>`);
  wrap.appendChild(c);
  const N = sess.Q.length, answered = sess.Q.filter(x=>x.pick>=0).length;
  const elapsed = ()=> (Date.now()-sess.T0)/1000;
  const head = h(`<div class="exr-head"><div class="exr-row"><span><b>${answered}</b> de ${N} respondidas</span><span class="exr-flags">${sess.Q.some(x=>x.flag) ? `★ ${sess.Q.filter(x=>x.flag).length} pra revisar` : ''}</span></div>
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
    if(left <= 0){ provaSubmit(sess, true); return false; }
    return true;
  };
  tick();
  const timer = setInterval(()=>{ if(!tick()) clearInterval(timer); }, 1000);

  const grid = h(`<div class="ar-qgrid" role="navigation" aria-label="Questões da prova"></div>`);
  sess.Q.forEach((x,i)=>{
    const b = h(`<button type="button" class="${x.pick>=0?'ans':''} ${x.flag?'flag':''} ${i===sess.cur?'cur':''}" aria-label="Questão ${i+1}" ${i===sess.cur?'aria-current="true"':''}>${i+1}</button>`);
    b.onclick = ()=>{ sess.cur = i; render(); };
    grid.appendChild(b);
  });
  c.appendChild(grid);
  const it = sess.Q[sess.cur], q = it.q;
  c.appendChild(h(`<div class="question-card exr-card iq-card"><div class="exr-qh"><span class="exr-n">${sess.cur+1}</span><span class="exr-s">QUESTÃO ${sess.cur+1} · ${escHTML(q.topic)}</span></div>${iqQuestionHTML(q)}</div>`));
  const opts = h(`<div class="mc-opts iq-opts"></div>`);
  q.opts.forEach((o,i)=>{
    const b = h(`<button type="button" class="mc-opt ${it.pick===i?'sel':''}" aria-pressed="${it.pick===i}"><span class="key">${IQ_LETTERS[i]}</span><span class="lbl"></span></button>`);
    b.querySelector('.lbl').textContent = o.label;
    b.onclick = ()=>{ it.pick = i; playTones([520], 0.03, 'sine', 0.05); render(); };
    opts.appendChild(b);
  });
  c.appendChild(opts);
  const nav = h(`<div class="cta-row ar-exam-nav">
    <button type="button" class="btn secondary" data-a="prev" ${sess.cur===0?'disabled':''}>← Anterior</button>
    <button type="button" class="btn secondary ${it.flag?'flagged':''}" data-a="flag" aria-pressed="${it.flag}">${it.flag?'★ Marcada':'☆ Revisar depois'}</button>
    <button type="button" class="btn secondary" data-a="next" ${sess.cur===N-1?'disabled':''}>Próxima →</button></div>`);
  nav.querySelector('[data-a=prev]').onclick = ()=>{ if(sess.cur>0){ sess.cur--; render(); window.scrollTo(0,0); } };
  nav.querySelector('[data-a=next]').onclick = ()=>{ if(sess.cur<N-1){ sess.cur++; render(); window.scrollTo(0,0); } };
  nav.querySelector('[data-a=flag]').onclick = ()=>{ it.flag = !it.flag; render(); };
  c.appendChild(nav);
  const blank = sess.Q.filter(x=>x.pick<0).length;
  const sub = h(`<button type="button" class="btn primary ar-start ex-go ${blank?'':'ready'}">${blank ? `Entregar prova · ${blank} em branco` : '✓ Tudo respondido · Entregar prova'}</button>`);
  sub.onclick = ()=>{
    const bl = sess.Q.map((x,i)=> x.pick<0 ? i+1 : 0).filter(Boolean);
    showConfirm({icon:'📝', title:'Entregar a prova?', message: bl.length ? `Em branco: questão ${bl.join(', ')} (conta como errada).` : 'Todas as questões estão respondidas.', ok:'Entregar', cancel:'Voltar à prova'})
      .then(ok=>{ if(ok) provaSubmit(sess, false); });
  };
  c.appendChild(sub);
  return wrap;
}

async function provaSubmit(sess, timeUp){
  if(sess.submitted) return;
  sess.submitted = true;
  replaceHistoryState();
  const secs = Math.round(Math.min(sess.limit, (Date.now()-sess.T0)/1000));
  let ok = 0;
  sess.Q.forEach(x=>{ x.right = x.pick>=0 && x.q.opts[x.pick].ok; if(x.right) ok++; });
  const grade = Math.round(100*ok/sess.Q.length)/10;
  const hist = provaSimHistory(sess.examId), prev = hist.length ? hist[hist.length-1].grade : null;
  // cada questão entra no progresso do assunto (sem combo e sem avisos de XP no meio)
  const quiet = {kind:'quiz', combo:0};
  state.session = quiet;
  for(const x of sess.Q){ quiet.combo = 0; if(SUBJECTS.some(s=>s.id===x.q.subj)) await recordAnswer(x.q.subj, x.right, {difficulty:'medio'}); }
  const g = loadGame(); g.provaSims = g.provaSims || {};
  const list = g.provaSims[sess.examId] = g.provaSims[sess.examId] || [];
  list.push({ts:Date.now(), n:sess.Q.length, ok, grade, secs});
  if(list.length > 20) list.splice(0, list.length-20);
  gameUnlock('exam1');
  saveGame();
  state.session = {kind:'provaResult', examId:sess.examId, Q:sess.Q, ok, grade, secs, timeUp:!!timeUp, prevGrade:prev};
  go('provaResult');
}

function provaResultScreen(){
  const r = state.session;
  const wrap = document.createElement('div');
  if(!r || r.kind!=='provaResult'){ setTimeout(()=>go('exams'), 0); return wrap; }
  const exam = EXAM_CONTENTS.find(e=>e.id===r.examId);
  wrap.appendChild(topbar(`Resultado · ${exam.name}`, true, ()=>go('exams', {examId:r.examId})));
  const c = h(`<div class="content exam-result" style="--c:${exam.color}"></div>`);
  wrap.appendChild(c);
  const N = r.Q.length, blank = r.Q.filter(x=>x.pick<0).length;
  const msg = r.grade >= 9 ? `Excelente! Você está pronto pro estilo ${exam.name}.` : r.grade >= 7 ? 'Muito bom! Veja a correção das que errou.' : r.grade >= 5 ? 'Na média. A correção mostra onde cada pegadinha estava.' : 'Vamos treinar mais. Leia a correção com calma: cada alternativa errada tem uma explicação.';
  const diff = r.prevGrade===null ? null : Math.round((r.grade - r.prevGrade)*10)/10;
  c.appendChild(h(`<div class="exres-hero ${gradeCls(r.grade)}">
      <div class="ar-ring ${gradeCls(r.grade)}" style="--p:${r.grade*10}"><b>${fmt(r.grade)}</b><small>nota</small></div>
      <h2>${r.timeUp ? 'Tempo esgotado' : 'Prova entregue'}</h2><p>${msg}</p>
      ${diff===null ? '' : `<span class="exres-diff ${diff>0?'up':diff<0?'down':''}">${diff>0?`▲ +${fmt(diff)}`:diff<0?`▼ ${fmt(diff)}`:'='} em relação ao último</span>`}
    </div>`));
  c.appendChild(h(`<div class="exres-stats">
      <div class="g"><b>${r.ok}</b><span>certas</span></div>
      <div class="b"><b>${N - r.ok - blank}</b><span>erradas</span></div>
      <div class="w"><b>${blank}</b><span>em branco</span></div>
      <div class="t"><b>${mmssA(r.secs)}</b><span>tempo</span></div>
    </div>`));
  if(r.grade >= 7 && !r.celebrated){ r.celebrated = true; replaceHistoryState(); setTimeout(()=>launchConfetti(r.grade>=10?180:100), 250); }
  const acts = h(`<div class="exres-acts"></div>`);
  const again = h(`<button type="button" class="btn primary">📝 Novo simulado ${exam.name}</button>`);
  again.onclick = ()=> startProvaSim(r.examId);
  acts.appendChild(again);
  c.appendChild(acts);
  c.appendChild(h(`<h3 class="ar-label">Correção comentada</h3>`));
  r.Q.forEach((x,i)=>{
    const q = x.q, ci = q.opts.findIndex(o=>o.ok);
    const it = h(`<div class="card ar-review iq-review ${x.right?'ok':'bad'}"><div class="ar-rv-h"><span><b class="rv-n">${i+1}</b> ${escHTML(q.topic)}</span><b class="${x.right?'ok':'bad'}">${x.right?'✓ Certa':x.pick<0?'⬜ Em branco':'✗ Errada'}</b></div>
      ${iqQuestionHTML(q)}<div class="ar-rv-opts"></div>
      ${!x.right && x.pick>=0 && q.opts[x.pick].why ? `<div class="iq-why">💡 <b>Por que a ${IQ_LETTERS[x.pick]} está errada:</b> ${q.opts[x.pick].why}</div>` : ''}
      <details class="ar-sol" ${x.right?'':'open'}><summary>Resolução passo a passo</summary><ol class="iq-steps">${q.steps.map(s=>`<li>${s}</li>`).join('')}</ol></details></div>`);
    const ob = it.querySelector('.ar-rv-opts');
    q.opts.forEach((o,j)=>{
      const d = h(`<div class="rv-opt ${j===ci?'right':j===x.pick?'wrong':''}"><span class="k">${IQ_LETTERS[j]}</span><span class="l"></span>${j===x.pick ? '<small>sua resposta</small>' : j===ci && !x.right ? '<small>correta</small>' : ''}</div>`);
      d.querySelector('.l').textContent = o.label;
      ob.appendChild(d);
    });
    c.appendChild(it);
  });
  return wrap;
}

/* bloco "Simulado" dentro da aba de cada prova (Conteúdos por prova) */
function provaSimBlockHTML(e){
  const cfg = IQ_EXAMS[e.id]; if(!cfg) return '';
  const hist = provaSimHistory(e.id), best = hist.length ? Math.max(...hist.map(x=>x.grade)) : null;
  return `<div class="iq-start" style="--c:${e.color}; --c2:${e.color2}">
    <div class="iq-start-t"><b>📝 Simulado ${e.name}</b><small>${Math.min(cfg.n, cfg.bank.length)} questões de interpretação no estilo da prova · ${cfg.mins} min · alternativas ${IQ_LETTERS.slice(0,cfg.alts).split('').join(', ')}</small></div>
    ${hist.length ? `<div class="iq-start-h">${hist.length} feito${hist.length>1?'s':''} · melhor nota <b>${fmt(best)}</b> · última <b>${fmt(hist[hist.length-1].grade)}</b></div>` : ''}
    <button type="button" class="btn primary iq-go">Começar simulado ▶</button>
    <small class="iq-note">Questões originais, inspiradas no estilo da prova. Os números mudam a cada simulado.</small>
  </div>`;
}
