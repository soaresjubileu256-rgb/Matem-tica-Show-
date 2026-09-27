/* =========================================================
   Matemática Show — ESTUDO (recursos que vieram do Arena V2)
   - Teste de nivelamento geral (10 perguntas → nível e por onde começar)
   - Plano de estudos até a prova
   - Cartões de revisão (flashcards) por assunto
   - Tela do Caderno de erros (visão por assunto + recomendação)
   - "Praticar parecidas" depois de resolver uma conta no Resolver
   - Importação única do progresso do antigo Matemática Show Arena
   Usa só os sistemas únicos do app (recordAnswer, noteError, loadGame/saveGame, SUBJECTS...).
   Este arquivo só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

const GRADES = [
  {id:'f1', name:'1º ao 5º ano', group:'f1'},
  {id:'f2', name:'6º e 7º ano', group:'f2'},
  {id:'f3', name:'8º e 9º ano', group:'f3'},
  {id:'em', name:'Ensino Médio / adulto', group:'all'},
];
function studyData(){
  const g = loadGame();
  const st = g.study = g.study || {};
  return st; // {grade, placement:{ts, ok, n, weak, strong}, plan:{examDate, subjects, created, schedule}, cards:{subj:{seen,known}}}
}
function gradeSubjects(){
  const gr = GRADES.find(x=>x.id===studyData().grade);
  const grp = EXAM_GROUPS.find(x=>x.id===(gr ? gr.group : 'all'));
  return examGroupIds(grp);
}
function subjById(id){ return SUBJECTS.find(s=>s.id===id); }

/* =========================================================
   TESTE DE NIVELAMENTO
   ========================================================= */
function placementQuestions(){
  const ids = gradeSubjects();
  const base = studyData().grade === 'f1' ? [] : examGroupIds(EXAM_GROUPS[0]);
  const pool = shuffle([...ids]);
  const out = [];
  for(let i=0;i<10;i++){
    const useBase = base.length && i < 2;
    const sid = useBase ? pick(base) : pool[i % pool.length];
    const d = useBase ? 'medio' : (i < 6 ? 'facil' : 'medio');
    const g = genQuestionAvoidingRepeat(subjById(sid), d, null);
    out.push({subjectId:sid, diff:d, ex:g.ex, opts:buildOptions(g.ex)});
  }
  return out;
}
function startPlacement(){
  state.session = {kind:'placement', step:'intro', Q:null, i:0, res:[]};
  go('placement');
}
function placementScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='placement'){ setTimeout(()=>startPlacement(), 0); return wrap; }
  const st = studyData();
  const quit = ()=>{
    if(sess.step!=='run') return go('home');
    showConfirm({icon:'🧭', title:'Sair do teste?', message:'Você pode refazer o teste de nivelamento quando quiser.', ok:'Sair', cancel:'Continuar'}).then(ok=>{ if(ok) go('home'); });
  };
  wrap.appendChild(topbar('🧭 Teste de nivelamento', true, quit));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);

  if(sess.step === 'intro'){
    let grade = st.grade || 'f2';
    c.appendChild(h(`<div class="greeting"><h2>Descubra seu nível</h2><p>São 10 perguntas rápidas. No fim o app mostra por quais assuntos começar, e as questões que você errar vão para o seu caderno de erros para revisar.</p></div>`));
    c.appendChild(h(`<h3 class="ar-label">Em que ano você está?</h3>`));
    const row = h(`<div class="diff-row ar-wrap"></div>`);
    const paint = ()=> row.querySelectorAll('.diff-chip').forEach(b=>{ const on = b.dataset.g===grade; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    GRADES.forEach(gr=>{ const b = h(`<button type="button" class="diff-chip" data-g="${gr.id}">${gr.name}</button>`); b.onclick = ()=>{ grade = gr.id; paint(); }; row.appendChild(b); });
    c.appendChild(row); paint();
    const go1 = h(`<button type="button" class="btn primary ar-start">Começar o teste (10 perguntas)</button>`);
    go1.onclick = ()=>{ st.grade = grade; saveGame(); sess.Q = placementQuestions(); sess.step = 'run'; sess.i = 0; sess.res = []; replaceHistoryState(); render(); };
    c.appendChild(go1);
    if(st.placement) c.appendChild(h(`<p class="ar-muted" style="text-align:center;margin-top:12px">Último teste: ${st.placement.ok}/${st.placement.n} em ${new Date(st.placement.ts).toLocaleDateString('pt-BR')}</p>`));
    return wrap;
  }
  if(sess.step === 'run'){
    const q = sess.Q[sess.i], s = subjById(q.subjectId);
    c.appendChild(h(`<div class="lesson-prog ar-prog" aria-hidden="true"><i style="width:${Math.round(100*sess.i/sess.Q.length)}%"></i></div>`));
    const qv = questionHTML(q.ex);
    const qcard = h(`<div class="question-card"><div class="qlabel">PERGUNTA ${sess.i+1} DE ${sess.Q.length} · ${s.name.toUpperCase()}</div><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
    addSpeakButton(qcard, q.ex); addScratchButton(qcard, q.ex);
    c.appendChild(qcard);
    c.appendChild(h(`<p class="ar-muted">Responda sem pressa. Se não souber, toque em "Não sei": isso ajuda a acertar seu nível.</p>`));
    const opts = h(`<div class="mc-opts"></div>`);
    let busy = false;
    const answer = async (i)=>{
      if(busy) return; busy = true;
      const ok = i >= 0 && q.opts[i].ok;
      sess.res.push({subjectId:q.subjectId, ok});
      if(i >= 0) await recordAnswer(q.subjectId, ok, {difficulty:q.diff, ex:q.ex});
      else await noteError({id:`${Date.now()}_${Math.random().toString(36).slice(2,8)}`, ts:Date.now(), subjectId:q.subjectId, subjectName:s.name, difficulty:q.diff, correct:false, ex:snapshotExercise(q.ex)});
      sess.i++;
      if(sess.i >= sess.Q.length) placementFinish(sess);
      replaceHistoryState(); render(); window.scrollTo(0,0);
    };
    q.opts.forEach((o,i)=>{ const b = h(`<button type="button" class="mc-opt"><span class="key">${'ABCD'[i]}</span><span class="lbl mono"></span></button>`); b.querySelector('.lbl').textContent = o.label; b.onclick = ()=> answer(i); opts.appendChild(b); });
    c.appendChild(opts);
    const idk = h(`<button type="button" class="btn secondary ar-start">Não sei</button>`);
    idk.onclick = ()=> answer(-1);
    c.appendChild(idk);
    return wrap;
  }
  // resultado
  const r = st.placement;
  const lvl = r.ok >= 8 ? 'Avançado' : r.ok >= 5 ? 'Intermediário' : 'Iniciante';
  c.appendChild(h(`<div class="lesson-end" style="padding:0"><div class="le-mascot">${mascotSVG(r.ok>=5?'joy':'happy',110)}</div><h2 class="le-title">Seu nível: ${lvl}</h2>
    <div class="le-bigscore">${r.ok}/${r.n} <small>certas</small></div>
    <p class="le-sub">${r.ok>=8 ? 'Você está bem! As fases Difíceis da Arena e os simulados vão te desafiar.' : r.ok>=5 ? 'Boa base. Vamos reforçar os assuntos abaixo.' : 'Sem problema: começar do começo é o jeito mais rápido de aprender. Os assuntos abaixo são seu ponto de partida.'}</p></div>`));
  if(r.weak.length){
    c.appendChild(h(`<h3 class="ar-label">Comece por aqui</h3>`));
    r.weak.forEach(id=>{ const s = subjById(id); const it = h(`<button type="button" class="subject-row ar-row"><span class="ar-sym">${s.sym}</span><span class="ar-row-t"><b>${s.name}</b><small>Ver a explicação e praticar</small></span><span class="chev">›</span></button>`); it.onclick = ()=> go('subjectDetail', {subjectId:id}); c.appendChild(it); });
  }
  if(r.strong.length){
    c.appendChild(h(`<h3 class="ar-label">Você já manda bem em</h3>`));
    c.appendChild(h(`<div class="diff-row ar-wrap">${r.strong.map(id=>`<span class="diff-chip active">${subjById(id).name}</span>`).join('')}</div>`));
  }
  const foot = h(`<div class="cta-row" style="margin-top:16px"><button type="button" class="btn secondary" data-a="plan">Montar plano de estudos</button><button type="button" class="btn primary" data-a="home">Começar</button></div>`);
  foot.querySelector('[data-a=plan]').onclick = ()=> go('plan');
  foot.querySelector('[data-a=home]').onclick = ()=> go('home');
  c.appendChild(foot);
  return wrap;
}
function placementFinish(sess){
  const by = {};
  sess.res.forEach(x=>{ const b = by[x.subjectId] = by[x.subjectId] || {n:0, ok:0}; b.n++; if(x.ok) b.ok++; });
  const ok = sess.res.filter(x=>x.ok).length;
  studyData().placement = {ts:Date.now(), ok, n:sess.res.length,
    weak: Object.entries(by).filter(([,b])=>b.ok < b.n).map(([id])=>id),
    strong: Object.entries(by).filter(([,b])=>b.ok === b.n).map(([id])=>id)};
  sess.step = 'done';
  gameUnlock('placement');
  saveGame();
}

/* =========================================================
   PLANO DE ESTUDOS ATÉ A PROVA
   ========================================================= */
function buildSchedule(examDate, ids, progress){
  const out = []; const d0 = new Date(); d0.setHours(12,0,0,0); const end = new Date(examDate+'T12:00');
  const days = Math.max(1, Math.min(60, Math.round((end - d0)/864e5)));
  const acc = id=>{ const d = progress[id]; return d && d.attempted ? d.correct/d.attempted : .4; };
  const order = [...ids].sort((a,b)=> acc(a) - acc(b)); // primeiro os mais fracos
  let k = 0;
  for(let i=0;i<days;i++){
    const d = new Date(d0); d.setDate(d0.getDate()+i);
    const isLast = i === days-1 && days > 1;
    const perDay = order.length > days ? 2 : 1;
    const subs = isLast ? [] : Array.from({length:perDay}, ()=> order[(k++) % order.length]);
    out.push({day:isoDay(d), subjects:[...new Set(subs)], exam: isLast || (days>=7 && i>0 && i%7===6)});
  }
  return out;
}
/* respostas por dia e assunto, tiradas do histórico (fonte única) */
function answersByDay(hist){
  const out = {};
  (hist||[]).forEach(e=>{ const k = isoDay(new Date(e.ts)); const x = out[k] = out[k] || {}; x[e.subjectId] = (x[e.subjectId]||0) + 1; });
  return out;
}
const PLAN_PER_SUBJECT = 5;
function planDayDone(p, byDay){
  const x = byDay[p.day] || {};
  const subsOk = p.subjects.every(id=> (x[id]||0) >= PLAN_PER_SUBJECT);
  const examOk = !p.exam || arenaData().exams.some(e=> isoDay(new Date(e.ts)) === p.day);
  return subsOk && examOk;
}
function planToday(){ const P = studyData().plan; return P ? (P.schedule.find(p=>p.day===isoDay()) || null) : null; }
function planScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🗺️ Plano de estudos', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const st = studyData();
  if(!st.plan){
    const d = new Date(); d.setDate(d.getDate()+14);
    let sel = [...((st.placement && st.placement.weak.length) ? st.placement.weak : gradeSubjects())];
    c.appendChild(h(`<div class="greeting"><h2>Tem prova chegando?</h2><p>Diga a data e o que vai cair. O app divide os assuntos pelos dias que faltam, começando pelos que você mais erra, e coloca simulados no caminho.</p></div>`));
    const f = h(`<form class="ar-form"><label class="ar-label" for="pDate">Data da prova</label><input type="date" id="pDate" class="ar-input" value="${isoDay(d)}" min="${isoDay()}">
      <h3 class="ar-label">O que vai cair</h3><div class="diff-row ar-wrap" id="pSubs"></div>
      <button class="btn primary ar-start" type="submit">Criar meu plano</button></form>`);
    const row = f.querySelector('#pSubs');
    const paint = ()=>{ row.querySelectorAll('.diff-chip').forEach(b=>{ const on = sel.includes(b.dataset.s); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); }); f.querySelector('[type=submit]').disabled = !sel.length; };
    SUBJECTS.forEach(s=>{ const b = h(`<button type="button" class="diff-chip" data-s="${s.id}">${s.name}</button>`); b.onclick = ()=>{ sel = sel.includes(s.id) ? sel.filter(x=>x!==s.id) : [...sel, s.id]; paint(); }; row.appendChild(b); });
    f.onsubmit = async e=>{
      e.preventDefault();
      const dt = f.querySelector('#pDate').value;
      if(!dt || dt < isoDay()){ showFloat('Escolha uma data de hoje em diante', true); return; }
      const progress = await loadProgress();
      st.plan = {examDate:dt, subjects:sel, created:Date.now(), schedule:buildSchedule(dt, sel, progress)};
      gameUnlock('plan'); saveGame(); render();
    };
    paint(); c.appendChild(f);
    return wrap;
  }
  const P = st.plan, today = isoDay();
  const left = Math.round((new Date(P.examDate+'T12:00') - new Date(today+'T12:00'))/864e5);
  const head = h(`<div class="greeting"><h2>${left > 0 ? `Faltam ${left} dia${left>1?'s':''}` : left === 0 ? 'A prova é hoje!' : 'A prova já passou'}</h2><p class="ar-plan-sub"></p></div>`);
  c.appendChild(head);
  const list = h(`<div class="ar-plan"></div>`);
  c.appendChild(list);
  loadHistory().then(hist=>{
    if(!wrap.isConnected) return;
    const byDay = answersByDay(hist);
    const doneN = P.schedule.filter(p=>planDayDone(p, byDay)).length;
    head.querySelector('.ar-plan-sub').textContent = `Prova em ${new Date(P.examDate+'T12:00').toLocaleDateString('pt-BR',{weekday:'long', day:'2-digit', month:'long'})} · ${doneN} de ${P.schedule.length} dias cumpridos. Um dia conta como feito quando você responde ${PLAN_PER_SUBJECT} questões de cada assunto dele.`;
    P.schedule.forEach(p=>{
      const isToday = p.day === today, past = p.day < today, done = planDayDone(p, byDay), x = byDay[p.day] || {};
      const it = h(`<div class="ar-pday ${isToday?'today':''} ${done?'done':''} ${past&&!done?'missed':''}"><div class="ar-pday-h"><b>${isToday ? 'Hoje' : new Date(p.day+'T12:00').toLocaleDateString('pt-BR',{weekday:'short', day:'2-digit', month:'2-digit'})}</b><span>${done ? '✓ feito' : past ? 'não feito' : ''}</span></div></div>`);
      p.subjects.forEach(id=>{
        const s = subjById(id); if(!s) return;
        const r = h(`<div class="ar-pitem"><span>${s.name} <small>${Math.min(x[id]||0, PLAN_PER_SUBJECT)}/${PLAN_PER_SUBJECT}</small></span>${!past?`<button type="button" class="btn secondary">Treinar</button>`:''}</div>`);
        const bt = r.querySelector('button'); if(bt) bt.onclick = ()=> startSession(id, 'medio');
        it.appendChild(r);
      });
      if(p.exam){
        const r = h(`<div class="ar-pitem"><span>📝 Simulado com os assuntos da prova</span>${!past?`<button type="button" class="btn secondary">Fazer</button>`:''}</div>`);
        const bt = r.querySelector('button'); if(bt) bt.onclick = ()=>{ const cfg = examCfgNow(); cfg.group = null; cfg.subjects = [...P.subjects]; cfg.n = 10; saveGame(); go('examSetup'); };
        it.appendChild(r);
      }
      list.appendChild(it);
    });
  });
  const del = h(`<button type="button" class="btn secondary ar-start">Apagar plano</button>`);
  del.onclick = ()=> showConfirm({icon:'🗺️', title:'Apagar o plano?', message:'Você pode criar outro quando quiser.', ok:'Apagar', cancel:'Cancelar', danger:true}).then(ok=>{ if(ok){ st.plan = null; saveGame(); render(); } });
  c.appendChild(del);
  return wrap;
}

/* =========================================================
   CARTÕES DE REVISÃO (flashcards)
   ========================================================= */
const DECK_SIZE = 10;
function startCards(subjectId, diff){
  const s = subjById(subjectId);
  const deck = []; let last = null;
  for(let i=0;i<DECK_SIZE;i++){
    const d = diff === 'misturada' ? ['facil','medio','dificil'][i%3] : diff;
    const g = genQuestionAvoidingRepeat(s, d, last); last = g.signature;
    deck.push({diff:d, ex:g.ex, tries:0});
  }
  state.session = {kind:'cards', subjectId, diff, deck, total:deck.length, first:0, done:0, flipped:false, combo:0};
  go('cardsDeck');
}
function cardsDeckScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='cards'){ setTimeout(()=>go('content'), 0); return wrap; }
  const s = subjById(sess.subjectId);
  const leave = ()=>{
    if(!sess.deck.length) return go('subjectDetail', {subjectId:s.id});
    showConfirm({icon:'🃏', title:'Parar a revisão?', message:'Os cartões que faltam não serão contados.', ok:'Parar', cancel:'Continuar'}).then(ok=>{ if(ok) go('subjectDetail', {subjectId:s.id}); });
  };
  const bar = topbar(`🃏 ${s.name}`, true, leave);
  bar.appendChild(h(`<span class="ar-clock">${sess.deck.length ? `${sess.deck.length} restantes` : 'fim'}</span>`));
  wrap.appendChild(bar);
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  c.appendChild(h(`<div class="lesson-prog ar-prog" aria-hidden="true"><i style="width:${Math.round(100*sess.done/sess.total)}%"></i></div>`));
  if(!sess.deck.length){
    const all = sess.first === sess.total;
    c.appendChild(h(`<div class="lesson-end" style="padding:0"><div class="le-mascot">${mascotSVG(all?'joy':'happy',110)}</div><h2 class="le-title">Baralho concluído</h2>
      <div class="le-bigscore">${sess.first}/${sess.total} <small>de primeira</small></div>
      <p class="le-sub">${all ? `Você sabia todos os ${sess.total} de primeira!` : `Você sabia ${sess.first} de ${sess.total} de primeira. Os outros você revisou até acertar, e foram para o caderno de erros.`}</p></div>`));
    if(!sess.celebrated){ sess.celebrated = true; replaceHistoryState(); if(sess.first >= sess.total*.8) setTimeout(()=>launchConfetti(all?160:90), 200); }
    const foot = h(`<div class="cta-row"><button type="button" class="btn secondary" data-a="b">Voltar ao assunto</button><button type="button" class="btn primary" data-a="n">Outro baralho</button></div>`);
    foot.querySelector('[data-a=b]').onclick = ()=> go('subjectDetail', {subjectId:s.id});
    foot.querySelector('[data-a=n]').onclick = ()=> startCards(s.id, sess.diff);
    c.appendChild(foot);
    return wrap;
  }
  const card = sess.deck[0];
  const qv = questionHTML(card.ex);
  const f = h(`<div class="ar-flip ${sess.flipped?'on':''}" tabindex="0" role="button" aria-label="${sess.flipped?'Cartão virado: resposta':'Virar o cartão e ver a resposta'}"><div class="ar-flip-in">
    <div class="ar-face front"><div class="ar-tag"><span>${s.name}</span><span>${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[card.diff]}${card.tries?' · de novo':''}</span></div><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div><div class="ar-tap">Pense na resposta e toque para virar</div></div>
    <div class="ar-face back"><div class="ar-tag"><span>Resposta</span><span>${s.name}</span></div><div class="ar-ans mono"></div><div class="fb-steps"></div></div>
  </div></div>`);
  f.querySelector('.ar-ans').textContent = answerLabel(card.ex);
  f.querySelector('.fb-steps').innerHTML = solutionHTML(card.ex);
  c.appendChild(f);
  requestAnimationFrame(()=>{
    let hgt = 280;
    f.querySelectorAll('.ar-face').forEach(fc=>{ fc.style.position='relative'; hgt = Math.max(hgt, fc.scrollHeight + 16); fc.style.position=''; });
    f.querySelector('.ar-flip-in').style.minHeight = hgt + 'px';
  });
  const acts = h(`<div class="cta-row" style="margin-top:14px"></div>`);
  c.appendChild(acts);
  const flip = ()=>{ sess.flipped = !sess.flipped; f.classList.toggle('on', sess.flipped); paintActs(); replaceHistoryState(); };
  f.onclick = flip;
  f.onkeydown = e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); flip(); } };
  let busy = false;
  const rate = async ok=>{
    if(busy) return; busy = true;
    const cur = sess.deck.shift();
    if(cur.tries === 0){
      if(ok) sess.first++;
      const cs = studyData().cards = studyData().cards || {};
      const x = cs[s.id] = cs[s.id] || {seen:0, known:0}; x.seen++; if(ok) x.known++;
      await recordAnswer(s.id, ok, {difficulty:cur.diff, ex:cur.ex});
    }
    giveAnswerFeedback(ok);
    if(ok) sess.done++;
    else { cur.tries++; sess.deck.splice(Math.min(sess.deck.length, 3), 0, cur); } // volta daqui a pouco
    sess.flipped = false;
    saveGame(); render(); window.scrollTo(0,0);
  };
  function paintActs(){
    acts.innerHTML = '';
    if(!sess.flipped){ const b = h(`<button type="button" class="btn primary">Virar cartão</button>`); b.onclick = flip; acts.appendChild(b); return; }
    const no = h(`<button type="button" class="btn secondary">✗ Ainda não sabia</button>`), yes = h(`<button type="button" class="btn primary">✓ Eu sabia!</button>`);
    no.onclick = ()=> rate(false); yes.onclick = ()=> rate(true);
    acts.appendChild(no); acts.appendChild(yes);
  }
  paintActs();
  return wrap;
}
/* escolha do nível dos cartões (chamada pela tela do assunto) */
function chooseCardsLevel(subjectId){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal ar-sheet" role="dialog" aria-label="Nível dos cartões"><div class="big">🃏</div><h2>Cartões de revisão</h2><p>Vire o cartão, confira a resolução e diga se você sabia. O que não souber volta no fim do baralho.</p>
    <div class="ar-sheet-btns">${['facil','medio','dificil','misturada'].map(d=>`<button type="button" class="btn ${d==='facil'?'primary':'secondary'}" data-d="${d}">${ARENA_DIFF_NAME[d]}</button>`).join('')}</div>
    <button type="button" class="btn secondary ar-close">Cancelar</button></div>`;
  bg.querySelectorAll('[data-d]').forEach(b=> b.onclick = ()=>{ bg.remove(); startCards(subjectId, b.dataset.d); });
  bg.querySelector('.ar-close').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}

/* =========================================================
   CADERNO DE ERROS (visão geral)
   ========================================================= */
function errorsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Caderno de erros', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"><div class="ar-muted" style="padding:20px 0;text-align:center">Carregando…</div></div>`);
  wrap.appendChild(c);
  Promise.all([loadErrors(), loadProgress()]).then(([errs, progress])=>{
    if(!wrap.isConnected) return;
    c.innerHTML = '';
    const now = Date.now(), due = errs.filter(e=>errorIsDue(e, now)), learned = loadGame().errLearned || 0;
    if(!errs.length){
      c.appendChild(h(`<div class="edu-hello"><h1>Nada para revisar</h1><p>Quando você errar uma questão em qualquer parte do app, ela aparece aqui com a explicação, para você aprender com ela.</p></div>`));
      if(learned) c.appendChild(h(`<p class="edu-lead">Você já aprendeu ${learned} questão(ões) que tinha errado. 👏</p>`));
      return;
    }
    c.appendChild(h(`<div class="edu-hello"><h1>Vamos revisar</h1><p>Errar faz parte de aprender. Estes são os assuntos em que você teve mais dificuldade.</p></div>`));
    const by = {};
    errs.forEach(e=>{ (by[e.subjectId] = by[e.subjectId] || []).push(e); });
    const sec = eduSection('Você teve dificuldade em');
    const l = h(`<div class="edu-list"></div>`);
    Object.entries(by).sort((a,b)=> b[1].reduce((x,e)=>x+(e.count||1),0) - a[1].reduce((x,e)=>x+(e.count||1),0)).forEach(([id,arr])=>{
      const s = subjById(id); if(!s) return;
      const d = progress[id], acc = d && d.attempted ? Math.round(d.correct/d.attempted*100) : 0;
      const dn = arr.filter(e=>errorIsDue(e, now)).length, times = arr.reduce((x,e)=>x+(e.count||1),0);
      const r = h(`<button type="button" class="edu-row edu-row-bar"><span class="edu-ico">${s.sym}</span><span class="edu-row-t"><b></b><small>${acc}% de acerto · ${arr.length} questão(ões) para rever${times>arr.length?` · errou ${times}x`:''}${dn?` · ${dn} hoje`:''}</small>${eduBar(acc, `${s.name}: ${acc}% de acerto`)}</span><span class="edu-chev">›</span></button>`);
      r.querySelector('b').textContent = s.name;
      r.setAttribute('aria-label', `Revisar ${s.name}: ${arr.length} questões, ${acc}% de acerto`);
      r.onclick = ()=> startReviewErrors({subjectId:id, all:!dn});
      l.appendChild(r);
    });
    sec.appendChild(l);
    c.appendChild(sec);
    const acts = h(`<div class="edu-actions"></div>`);
    const rv = h(`<button type="button" class="btn primary">${due.length ? 'Começar revisão' : 'Revisar mesmo assim'}</button>`);
    rv.onclick = ()=> startReviewErrors({all: !due.length});
    acts.appendChild(rv);
    const rec = recommendSubjects(progress, errs, 3);
    if(rec.length){
      const tr = h(`<button type="button" class="btn secondary">Praticar questões novas desses assuntos</button>`);
      tr.onclick = ()=> startPersonalizedSession({subjectIds:rec, difficultyMode:'adaptativa', qty:10, focusWeak:rec.length>1, progress});
      acts.appendChild(tr);
    }
    c.appendChild(acts);
    c.appendChild(h(`<p class="edu-lead edu-small-note">${due.length} para revisar hoje · ${errs.length} no caderno · ${learned} já aprendida(s).<br>Como funciona: acertou na revisão, a questão volta em 3 dias e depois em 7 para fixar; acertou de novo, sai do caderno.</p>`));
  });
  return wrap;
}

/* =========================================================
   RESOLVER → PRATICAR QUESTÕES PARECIDAS
   ========================================================= */
const SOLVER_SUBJECT = [['trySolveFunction','func1grau'],['trySolveSystem','sistemas'],['trySolveQuadratic','eq2'],['trySolveLinear','eq1'],['trySolveProportion','regra3'],
  ['trySolveRoot','potenciacao'],['trySolvePercentage','porcentagem'],['trySolveFractionPair','fracoes'],['trySolveArithmetic','expressoes']];
function subjectForProblem(raw){
  let t; try{ t = normalizeExpr(raw); }catch(e){ return null; }
  for(const [fn,id] of SOLVER_SUBJECT){ try{ if(typeof window[fn]==='function' && window[fn](t)) return id; }catch(e){} }
  return null;
}
function solvePracticeCard(raw){
  const sid = subjectForProblem(raw); if(!sid) return null;
  const s = subjById(sid); if(!s) return null;
  const card = h(`<div class="result-section"><div class="sec-label"><span class="n">5</span>Agora é sua vez</div><div class="result-card"><p>Entender a resolução é o primeiro passo. Resolva sozinho questões parecidas de <b>${s.name}</b> para fixar.</p>
    <div class="cta-row"><button type="button" class="btn secondary" data-a="t">Ver explicação</button><button type="button" class="btn primary" data-a="p">Praticar parecidas</button></div></div></div>`);
  card.querySelector('[data-a=t]').onclick = ()=> go('subjectDetail', {subjectId:sid});
  card.querySelector('[data-a=p]').onclick = ()=> startSession(sid, 'medio');
  return card;
}

/* =========================================================
   IMPORTAR O PROGRESSO DO ANTIGO "MATEMÁTICA SHOW ARENA"
   Os dados do Arena ficavam em 'msarena-v1'. Na primeira vez que alguém entra
   depois da fusão, oferecemos juntar esse progresso na conta atual (uma vez só
   por aparelho). Os dados antigos não são apagados.
   ========================================================= */
const ARENA_V2_KEY = 'msarena-v1';
const ARENA_IMPORT_FLAG = 'mathstudy-arena-import-v1';
function arenaV2Raw(){ try{ const raw = localStorage.getItem(ARENA_V2_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
function arenaV2Pending(){
  try{ if(localStorage.getItem(ARENA_IMPORT_FLAG)) return null; }catch(e){ return null; }
  const d = arenaV2Raw();
  if(!d) return null;
  const answered = Object.values(d.stats||{}).reduce((a,s)=>a+(s.total||0),0);
  if(!answered && !(d.xp>0)) return null;
  return {xp:d.xp||0, answered};
}
function arenaV2Dismiss(){ try{ localStorage.setItem(ARENA_IMPORT_FLAG, JSON.stringify({skipped:true, ts:Date.now()})); }catch(e){} }
async function arenaV2Import(){
  const d = arenaV2Raw(); if(!d) return null;
  const valid = id=> SUBJECTS.some(s=>s.id===id);
  const g = loadGame(), a = arenaData(), st = studyData();
  // progresso por assunto
  const p = await loadProgress();
  Object.entries(d.stats||{}).forEach(([id,s])=>{
    if(!valid(id) || !s.total) return;
    const x = p[id] = p[id] || {attempted:0, correct:0};
    x.attempted += s.total; x.correct += s.ok||0;
    x.last = Math.max(x.last||0, Date.now() - 864e5);
  });
  await saveProgress();
  // caderno de erros (sem duplicar)
  const errs = await loadErrors();
  const keys = new Set(errs.map(errorQuestionKey));
  (d.errors||[]).forEach(e=>{
    if(!valid(e.subj) || !e.ex) return;
    const entry = {id:`arena_${e.id}`, ts:e.ts||Date.now(), subjectId:e.subj, subjectName:subjById(e.subj).name, difficulty:e.diff||null, correct:false, ex:e.ex, box:e.box||1, due:e.due||Date.now(), count:1, firstTs:e.ts};
    const k = errorQuestionKey(entry); if(keys.has(k)) return; keys.add(k); errs.push(entry);
  });
  if(errs.length > ERRORS_LIMIT) errs.length = ERRORS_LIMIT;
  await saveErrors();
  // Arena: estrelas, simulados, desafios
  Object.entries(d.phases||{}).forEach(([id,ph])=>{ if(!valid(id)) return; const t = a.phases[id] = a.phases[id] || {}; ['facil','medio','dificil'].forEach(k=>{ if((ph[k]||0) > (t[k]||0)) t[k] = ph[k]; }); });
  (d.exams||[]).forEach((e,i)=>{ a.exams.push({id:`arena_${e.ts||i}`, ts:e.ts||Date.now(), n:e.n, ok:e.ok, grade:e.grade, secs:e.secs||0, subjects:(e.subjects||[]).filter(valid)}); });
  a.exams.sort((x,y)=>x.ts-y.ts); if(a.exams.length > 30) a.exams.splice(0, a.exams.length-30);
  Object.entries(d.dailyChallenge||{}).forEach(([k,r])=>{ if(!a.daily[k]) a.daily[k] = r; });
  // estudo
  if(d.grade && !st.grade) st.grade = d.grade;
  if(d.placement && !st.placement) st.placement = {ts:d.placement.ts, ok:d.placement.ok, n:d.placement.n, weak:(d.placement.weak||[]).filter(valid), strong:(d.placement.strong||[]).filter(valid)};
  if(d.plan && !st.plan && d.plan.schedule) st.plan = {examDate:d.plan.examDate, subjects:(d.plan.subjects||[]).filter(valid), created:d.plan.created, schedule:d.plan.schedule};
  if(d.cards){ const cs = st.cards = st.cards || {}; Object.entries(d.cards).forEach(([id,x])=>{ if(!valid(id)) return; const t = cs[id] = cs[id] || {seen:0, known:0}; t.seen += x.seen||0; t.known += x.known||0; }); }
  // jogo: recorde de ofensiva, erros aprendidos, conquistas equivalentes (sem avisos em série)
  g.bestStreak = Math.max(g.bestStreak||0, (d.streak && d.streak.best) || 0);
  g.errLearned = (g.errLearned||0) + (d.mastered||0);
  g.solves = (g.solves||0) + (d.solveCount||0);
  g.duels = (g.duels||0) + (d.duels||0);
  const MAP = {first:'first', s3:'streak3', s7:'streak7', s30:'streak30', star3:'arenaPerfect', daily:'daily1', daily7:'daily7', exam10:'exam10', exam3:'exam1', solver:'solver10', duel:'duelist', plan:'plan', q100:'ans100', goal:'goal', fixer:'notebook5'};
  Object.entries(d.badges||{}).forEach(([id,ts])=>{ const to = MAP[id]; if(to && !g.ach[to]) g.ach[to] = ts || Date.now(); });
  saveGame();
  if(d.xp > 0) gameAddXP(d.xp);   // XP entra no único XP da conta (pode subir de nível)
  saveGame();
  try{ localStorage.setItem(ARENA_IMPORT_FLAG, JSON.stringify({uid:currentUserId(), ts:Date.now(), xp:d.xp||0})); }catch(e){}
  return {xp:d.xp||0, answered:Object.values(d.stats||{}).reduce((x,s)=>x+(s.total||0),0), errors:(d.errors||[]).length};
}
