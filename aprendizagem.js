/* =========================================================
   Matemática Show — APRENDIZAGEM (interface educacional)
   O aprendizado no centro: Início, Aprender (áreas → assuntos → lições),
   página de estudo em etapas, Praticar, Mais e a correção que ensina.
   Usa os sistemas que já existem (SUBJECTS, recordAnswer, progresso, jogo...).
   Só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

/* trilha de aprendizagem: as etapas na ordem em que se aprende */
const LEARN_AREAS = [
  {id:'base', name:'Matemática básica', ico:'123', desc:'As quatro operações', ids:['adicao','subtracao','multiplicacao','divisao']},
  {id:'ops',  name:'Operações', ico:'±', desc:'Decimais, expressões, potências, MMC e MDC', ids:['decimais','expressoes','potenciacao','mmcmdc']},
  {id:'frac', name:'Frações', ico:'½', desc:'Somar, subtrair, multiplicar e dividir frações', ids:['fracoes']},
  {id:'pct',  name:'Porcentagem e proporção', ico:'%', desc:'Porcentagem e regra de três', ids:['porcentagem','regra3']},
  {id:'alg',  name:'Álgebra', ico:'x', desc:'Equação do 1º grau, sistemas e funções', ids:['eq1','sistemas','func1grau']},
  {id:'geo',  name:'Geometria e estatística', ico:'△', desc:'Área, perímetro, média, mediana e moda', ids:['geometria','estatistica']},
  {id:'eq',   name:'Equações do 2º grau', ico:'x²', desc:'Bhaskara e raízes', ids:['eq2']},
  {id:'prob', name:'Problemas do dia a dia', ico:'R$', desc:'Compras, troco e contas', ids:['dinheiro']},
];
function subjOf(id){ return SUBJECTS.find(s=>s.id===id); }
function areaOfSubject(id){ return LEARN_AREAS.find(a=>a.ids.includes(id)); }

/* ---------- lições de um assunto ----------
   c* = partes da explicação (o texto do assunto, dividido pelos subtítulos que ele já tem)
   e* = um exemplo resolvido passo a passo */
const _topicsCache = {};
function exampleTopicName(ex, i){
  const m = /\(([^)]+)\)/.exec(ex.title || '');
  const t = m ? m[1] : `Exemplo ${i+1}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function subjectTopics(s){
  if(_topicsCache[s.id]) return _topicsCache[s.id];
  const d = document.createElement('div'); d.innerHTML = s.learn;
  const parts = [{title:'O que é e como funciona', nodes:[]}];
  [...d.childNodes].forEach(n=>{
    if(n.nodeType===1 && n.classList.contains('section-title')) parts.push({title:n.textContent.trim().replace(/^Passo \d+ — /,''), nodes:[]});
    else parts[parts.length-1].nodes.push(n);
  });
  const concept = parts.filter(p=>p.nodes.some(n=>n.nodeType===1 || n.textContent.trim())).map((p,i)=>{
    const box = document.createElement('div'); p.nodes.forEach(n=>box.appendChild(n.cloneNode(true)));
    return {id:'c'+i, kind:'concept', title:p.title, html:box.innerHTML};
  });
  const examples = (s.examples || [s.example]).filter(Boolean).map((ex,i)=>({id:'e'+i, kind:'example', title:exampleTopicName(ex,i), ex}));
  return _topicsCache[s.id] = concept.concat(examples);
}

/* ---------- o que o aluno já estudou ---------- */
function studyRead(){ const st = studyData(); return st.read = st.read || {}; }
function markTopicRead(subjectId, topicId){
  const r = studyRead(), arr = r[subjectId] = r[subjectId] || [];
  if(!arr.includes(topicId)) arr.push(topicId);
  studyData().last = {subjectId, topicId, ts:Date.now()};
  saveGame();
}
/* caderno de erros sem esperar (mesma leitura do loadErrors) */
function errorsSync(){
  const uid = currentUserId();
  if(!(errorsCache && errorsCacheUid===uid)){
    errorsCache = storage.get(`${ERRORS_KEY_BASE}:${uid}`, []);
    if(!Array.isArray(errorsCache)) errorsCache = [];
    errorsCacheUid = uid;
  }
  return errorsCache;
}
/* progresso do assunto pelas 5 etapas da trilha (cada etapa vale 20%):
   Aprender (lições lidas) · Exemplos (exemplos vistos) · Praticar (5 exercícios) · Revisar (sem erros pendentes) · Dominar (nível Proficiente) */
function subjectProgress(id){
  const st = pathStages(id, progressSync(), errorsSync()); if(!st) return 0;
  const d = progressSync()[id] || {};
  const part = (a,b)=> b ? a/b : 1;
  return Math.round(20*part(st.readConcept, st.nConcept) + 20*part(st.readEx, st.nEx) + 20*Math.min(d.attempted||0, 5)/5 + (st.done.review ? 20 : 0) + 20*Math.min(st.mastery.lvl, 3)/3);
}
function overallProgress(){
  const ids = pathOrder(), pcts = ids.map(subjectProgress);
  return {pct:Math.round(pcts.reduce((a,b)=>a+b,0)/ids.length), done:pcts.filter(x=>x>=100).length, total:ids.length};
}
function nextTopic(id){
  const s = subjOf(id), tops = subjectTopics(s), read = studyRead()[id] || [];
  return tops.find(t=>!read.includes(t.id)) || null;
}
function timeAgo(ts){
  const min = Math.round((Date.now()-ts)/60000);
  if(min < 2) return 'agora há pouco';
  if(min < 60) return `há ${min} minutos`;
  const hrs = Math.round(min/60);
  if(hrs < 24) return hrs===1 ? 'há 1 hora' : `há ${hrs} horas`;
  const d = Math.round(hrs/24);
  return d===1 ? 'ontem' : `há ${d} dias`;
}
/* onde o aluno parou: o assunto mais recente entre "lição aberta" e "exercício respondido" */
function continueStudying(){
  const p = progressSync(), last = studyData().last;
  let best = last && subjOf(last.subjectId) ? {id:last.subjectId, ts:last.ts} : null;
  Object.entries(p).forEach(([id,d])=>{ if(subjOf(id) && d && d.last && (!best || d.last > best.ts)) best = {id, ts:d.last}; });
  if(!best) return null;
  return {subject:subjOf(best.id), ts:best.ts, topic:nextTopic(best.id), pct:subjectProgress(best.id)};
}
function firstSubjectToStudy(){
  const g = (studyData().grade || '');
  const pl = studyData().placement;
  if(pl && pl.weak && pl.weak.length) return subjOf(pl.weak[0]);
  return subjOf(g==='f3' ? 'eq1' : g==='f2' ? 'fracoes' : 'adicao');
}

/* ---------- pedacinhos de interface ---------- */
function eduBar(pct, label){ return `<div class="edu-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${label||'Progresso'}"><i style="width:${Math.max(0,Math.min(100,pct))}%"></i></div>`; }
function eduRow(o){
  const b = h(`<button type="button" class="edu-row ${o.cls||''}"><span class="edu-ico" aria-hidden="true">${o.ico}</span><span class="edu-row-t"><b></b>${o.sub?'<small></small>':''}</span>${o.end?`<span class="edu-end">${o.end}</span>`:''}<span class="edu-chev" aria-hidden="true">›</span></button>`);
  b.querySelector('b').textContent = o.title;
  if(o.sub) b.querySelector('small').textContent = o.sub;
  b.onclick = o.go;
  return b;
}
function eduSection(title, action){
  const s = h(`<section class="edu-sec"><div class="edu-sec-h"><h2></h2></div></section>`);
  s.querySelector('h2').textContent = title;
  if(action){ const a = h(`<button type="button" class="edu-link"></button>`); a.textContent = action.label; a.onclick = action.go; s.querySelector('.edu-sec-h').appendChild(a); }
  return s;
}

/* etapas do assunto (Aprender → Exemplos → Praticar → Revisar → Dominar) com texto, não só cor */
function stageStrip(st, small){
  return `<ol class="pth-st ${small?'sm':''}" aria-label="Etapas do assunto">${PATH_STEPS.map(x=>{
    const done = st && st.done[x.id], cur = st && st.current && st.current.id===x.id;
    return `<li class="${done?'done':cur?'cur':''}"><i aria-hidden="true">${done?'✓':''}</i><span>${x.name}</span><span class="sr-only">${done?': concluída':cur?': etapa atual':''}</span></li>`;
  }).join('')}</ol>${st ? `<div class="pth-cur">${st.current ? `Etapa atual: <b>${st.current.name}</b> · ${st.nDone} de 5 concluídas` : '<b>Todas as etapas concluídas ✓</b>'}</div>` : ''}`;
}
/* "Não sei o que estudar": uma recomendação só, com o motivo e um botão */
function showWhatToStudy(){
  const w = whatToStudy(progressSync(), errorsSync()), s = subjOf(w.subjectId);
  const bg = document.createElement('div'); bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal edu-sheet edu-sheet-light wts" role="dialog" aria-modal="true" aria-labelledby="wts-h"><div class="wts-ico" aria-hidden="true">🤔</div>
    <h2 id="wts-h">Hoje recomendamos estudar <span></span></h2><p class="wts-why"></p>
    <button type="button" class="btn primary wts-go"></button><button type="button" class="btn secondary edu-close">Agora não</button></div>`;
  bg.querySelector('h2 span').textContent = s.name;
  bg.querySelector('.wts-why').textContent = w.why;
  bg.querySelector('.wts-go').textContent = 'Começar';
  bg.querySelector('.wts-go').setAttribute('aria-label', `Começar: ${w.action.label}`);
  bg.querySelector('.wts-go').onclick = ()=>{ bg.remove(); w.action.go(); };
  bg.querySelector('.edu-close').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  bg.addEventListener('keydown', e=>{ if(e.key==='Escape') bg.remove(); });
  document.body.appendChild(bg);
  bg.querySelector('.wts-go').focus();
}
/* começa a prática de hoje (5 questões escolhidas pelos dados do aluno) */
function startTodaysPractice(){
  const t = todaysPractice(progressSync(), errorsSync());
  startSession(t.subjectId, t.difficulty);
}

/* =========================================================
   INÍCIO
   ========================================================= */
function eduHomeScreen(){
  const wrap = document.createElement('div');
  wrap.className = 'edu-home';
  const bar = topbar();
  const initial = (currentUser && currentUser.name) ? currentUser.name.trim().charAt(0).toUpperCase() : '?';
  const helpBtn = h(`<button type="button" class="auth-logout tut-help-btn" title="Como usar" aria-label="Como usar o app">?</button>`);
  helpBtn.onclick = ()=> go('help');
  const profileBtn = h(`<button type="button" class="auth-logout profile-btn-avatar" title="Perfil" aria-label="Abrir meu perfil">${escHTML(initial)}</button>`);
  profileBtn.onclick = ()=> go('profile');
  bar.appendChild(helpBtn); bar.appendChild(profileBtn);
  wrap.appendChild(bar);
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);

  const p = progressSync(), errs = errorsSync();
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const name = currentUser ? currentUser.name.split(' ')[0] : '';
  const streak = gameStreakNow(), ov = overallProgress();
  const head = h(`<div class="edu-hello"><h1>${hello}${name ? ', '+escHTML(name) : ''}!</h1><p>O que você vai aprender hoje?</p>
    <div class="edu-overall"><div class="edu-small"><span>Progresso geral na trilha</span><b>${ov.pct}%</b></div>${eduBar(ov.pct, `Progresso geral: ${ov.pct}%`)}<small>${ov.done} de ${ov.total} assuntos concluídos</small></div></div>`);
  c.appendChild(head);
  showStreakNote();

  // progresso do antigo Arena neste aparelho (uma vez só)
  const arenaOld = arenaV2Pending();
  if(arenaOld){
    const ic = h(`<div class="edu-card edu-note ar-import"><b>Encontramos progresso do Matemática Show Arena</b><p>${arenaOld.answered} questões e ${arenaOld.xp} XP neste aparelho. Quer juntar nesta conta?</p>
      <div class="cta-row"><button type="button" class="btn secondary" data-a="no">Agora não</button><button type="button" class="btn primary" data-a="yes">Trazer meu progresso</button></div></div>`);
    ic.querySelector('[data-a=no]').onclick = ()=>{ arenaV2Dismiss(); ic.remove(); };
    ic.querySelector('[data-a=yes]').onclick = async ()=>{ const r = await arenaV2Import(); if(r) queueToast('📦', 'Progresso do Arena trazido!', `+${r.xp} XP · ${r.answered} questões`); render(); };
    c.appendChild(ic);
  }

  // continue de onde você parou (o próximo passo real da trilha)
  const cont = continueStudying();
  const curId = pathCurrentSubject(p, errs) || (cont ? cont.subject.id : firstSubjectToStudy().id);
  const cs = subjOf(curId), st = pathStages(curId, p, errs), act = pathNextAction(curId, st), pct = subjectProgress(curId);
  const area = areaOfSubject(curId), areaN = LEARN_AREAS.indexOf(area) + 1;
  const sec1 = eduSection(cont ? 'Continue de onde você parou' : 'Comece por aqui');
  const card = h(`<div class="edu-card edu-continue">
    <div class="edu-kicker">Etapa ${areaN} de ${LEARN_AREAS.length} · ${escHTML(area.name)}</div>
    <h3>📚 ${escHTML(cs.name)}</h3>
    <p class="edu-now"></p>
    ${stageStrip(st, true)}
    ${eduBar(pct, `${cs.name}: ${pct}% concluído`)}
    <div class="edu-small"><span>${pct}% concluído</span>${cont ? `<span>Última atividade: ${timeAgo(cont.ts)}</span>` : ''}</div>
    <button type="button" class="btn primary edu-go"></button>
    ${cont ? '' : `<button type="button" class="edu-link edu-place">Não sabe por onde começar? Descubra seu nível</button>`}</div>`);
  card.querySelector('.edu-now').textContent = act.sub;
  card.querySelector('.edu-go').textContent = cont ? 'Continuar' : 'Começar a estudar';
  card.querySelector('.edu-go').setAttribute('aria-label', `${cont ? 'Continuar' : 'Começar'}: ${act.label} de ${cs.name}`);
  card.querySelector('.edu-go').onclick = act.go;
  if(!cont) card.querySelector('.edu-place').onclick = ()=> startPlacement();
  sec1.appendChild(card);
  c.appendChild(sec1);

  // atalhos
  const quick = h(`<nav class="edu-quick" aria-label="Atalhos">
    <button type="button" data-a="pr"><span aria-hidden="true">🎯</span>Prática recomendada</button>
    <button type="button" data-a="le"><span aria-hidden="true">📖</span>Aprender</button>
    <button type="button" data-a="pg"><span aria-hidden="true">📊</span>Meu progresso</button></nav>`);
  quick.querySelector('[data-a=pr]').onclick = ()=> startTodaysPractice();
  quick.querySelector('[data-a=le]').onclick = ()=> go('content');
  quick.querySelector('[data-a=pg]').onclick = ()=> go('progress');
  c.appendChild(quick);
  const lost = h(`<button type="button" class="btn secondary edu-lost-btn">🤔 Não sei o que estudar</button>`);
  lost.onclick = ()=> showWhatToStudy();
  c.appendChild(lost);

  // prática de hoje (com o motivo real)
  const tp = todaysPractice(p, errs), ts = subjOf(tp.subjectId);
  const sec2 = eduSection('Prática de hoje');
  const pc = h(`<div class="edu-card edu-practice-today"><div class="edu-kicker">🎯 Prática de hoje · ${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[tp.difficulty]}</div>
    <h3>Selecionamos 5 questões para reforçar ${escHTML(ts.name)}.</h3><p class="edu-now"></p><button type="button" class="btn primary">Começar</button></div>`);
  pc.querySelector('.edu-now').textContent = tp.reason;
  pc.querySelector('.btn').onclick = ()=> startSession(tp.subjectId, tp.difficulty);
  sec2.appendChild(pc);
  c.appendChild(sec2);

  // assuntos para reforçar
  const rec = recommendSubjects(p, errs, 3), due = errs.filter(e=>errorIsDue(e));
  if(rec.length || errs.length){
    const sec3 = eduSection('Precisa de reforço', {label:'Caderno de erros', go:()=>go('errors')});
    const list = h(`<div class="edu-list edu-reforco"></div>`);
    rec.forEach(id=>{
      const s = subjOf(id), d = p[id], acc = d && d.attempted ? Math.round(d.correct/d.attempted*100) : null, ne = errs.filter(e=>e.subjectId===id).length;
      list.appendChild(eduRow({ico:s.sym, title:s.name, sub:`${acc!==null ? acc+'% de acerto' : 'Ainda sem exercícios'}${ne ? ` · ${ne} erro(s) no caderno` : ''}`, go:()=> go('subjectDetail', {subjectId:id})}));
    });
    if(errs.length) list.appendChild(eduRow({ico:'↻', title:'Revisar meus erros', sub:`${due.length} para revisar hoje · ${errs.length} no caderno`, cls:'edu-row-main', go:()=> go('errors')}));
    sec3.appendChild(list);
    c.appendChild(sec3);
  }

  // desafio de hoje (discreto): meta, sequência, missões e Desafio do Dia
  const g = loadGame(); gameEnsureToday();
  const goal = currentSettingsSync().dailyGoal || 10, done = Math.min(g.today.answered||0, goal);
  const ms = missionState(), msDone = ms.filter(x=>x.claimed||x.done).length;
  const k = isoDay(), dd = arenaData().daily[k], L = levelInfo(g.xp);
  const sec4 = eduSection('Sua rotina');
  const dc = h(`<div class="edu-card edu-today">
    <div class="edu-today-row"><div><b>Meta do dia</b><small class="goal-num">${done}/${goal} questões</small></div><button type="button" class="edu-link" data-a="goal">Mudar</button></div>
    ${eduBar(Math.round(done/goal*100), 'Meta do dia')}
    <div class="edu-meta"><button type="button" class="edu-pill" data-a="fire" aria-label="${streak} dias seguidos estudando">🔥 ${streak} dia${streak===1?'':'s'} seguido${streak===1?'':'s'}</button><button type="button" class="edu-pill" data-a="lvl" aria-label="Nível ${L.level}, ${g.xp} XP, ver conquistas">Nível ${L.level} · ${g.xp} XP</button></div>
    <div class="edu-today-links"><button type="button" class="edu-link" data-a="ms">Missões do dia · ${msDone}/${ms.length}</button><button type="button" class="edu-link" data-a="dd">Desafio do Dia ${dd ? '✓' : `#${dailyNumber(k)}`}</button></div></div>`);
  dc.querySelector('[data-a=goal]').onclick = ()=> chooseDailyGoal();
  dc.querySelector('[data-a=fire]').onclick = ()=> showStreakPanel();
  dc.querySelector('[data-a=lvl]').onclick = ()=> go('achievements');
  dc.querySelector('[data-a=ms]').onclick = ()=> showMissionsSheet();
  dc.querySelector('[data-a=dd]').onclick = ()=> startDaily();
  sec4.appendChild(dc);
  c.appendChild(sec4);

  const all = h(`<button type="button" class="edu-link edu-all">Ver todas as funções do app</button>`);
  all.onclick = ()=> go('more');
  c.appendChild(all);

  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected) maybeAskBackup(); }, 1500);
  else if(isFreshAccount()) setTimeout(()=>{ if(state.screen==='home' && !tutorialDone() && wrap.isConnected && !document.querySelector('.welcome-bg')) showWelcome(); }, 400);
  else setTimeout(()=>{ if(state.screen==='home' && !tutorialDone() && wrap.isConnected) startTour(); }, 700);
  return wrap;
}

/* =========================================================
   PRIMEIRO ACESSO — o que é o app, ano escolar e por onde começar
   ========================================================= */
function isFreshAccount(){
  const p = progressSync();
  return !Object.values(p).some(d=>d && d.attempted) && !Object.keys(studyRead()).length && !(loadGame().xp > 0);
}
function showWelcome(){
  const bg = document.createElement('div'); bg.className = 'gm-modal-bg welcome-bg';
  bg.innerHTML = `<div class="gm-modal edu-sheet edu-sheet-light welcome" role="dialog" aria-modal="true" aria-labelledby="wl-h"></div>`;
  const box = bg.querySelector('.welcome');
  const close = ()=>{ bg.remove(); studyData().welcomed = Date.now(); saveGame(); };
  const finish = fn=>{ markTutorialDone(); close(); fn && fn(); };
  const dots = n=> `<div class="wl-dots" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i===n?'on':''}"></i>`).join('')}</div>`;
  function step1(){
    box.innerHTML = `${dots(0)}<h2 id="wl-h">Bem-vindo ao Matemática Show</h2><p>Um lugar para <b>aprender matemática de verdade</b>, no seu ritmo.</p>
      <ol class="wl-how"><li><b>📖 Aprenda</b><span>Explicação simples e exemplos resolvidos passo a passo.</span></li>
      <li><b>✏️ Pratique</b><span>Exercícios com correção na hora.</span></li>
      <li><b>↻ Corrija</b><span>Errou? O app explica o raciocínio e guarda a questão para você revisar.</span></li>
      <li><b>📊 Domine</b><span>Veja o que você já domina e o que precisa praticar.</span></li></ol>
      <button type="button" class="btn primary" data-a="next">Começar</button><button type="button" class="edu-link" data-a="skip">Pular apresentação</button>`;
    box.querySelector('[data-a=next]').onclick = step2;
    box.querySelector('[data-a=skip]').onclick = ()=> finish();
    box.querySelector('[data-a=next]').focus();
  }
  function step2(){
    const cur = studyData().grade;
    box.innerHTML = `${dots(1)}<h2 id="wl-h">Em que ano você está?</h2><p>Assim sugerimos os assuntos certos para você.</p>
      <div class="wl-grades">${GRADES.map(g=>`<button type="button" class="btn ${g.id===cur?'primary':'secondary'}" data-g="${g.id}">${g.name}</button>`).join('')}</div>
      <button type="button" class="edu-link" data-a="skip">Prefiro não dizer</button>`;
    box.querySelectorAll('[data-g]').forEach(b=> b.onclick = ()=>{ studyData().grade = b.dataset.g; saveGame(); step3(); });
    box.querySelector('[data-a=skip]').onclick = step3;
    box.querySelector('[data-g]').focus();
  }
  function step3(){
    const s = firstSubjectToStudy(), t = subjectTopics(s)[0];
    box.innerHTML = `${dots(2)}<h2 id="wl-h">Como você quer começar?</h2>
      <div class="edu-list wl-start">
        <button type="button" class="edu-row edu-row-main" data-a="place"><span class="edu-ico" aria-hidden="true">🧭</span><span class="edu-row-t"><b>Descobrir meu nível</b><small>10 questões rápidas. Mostramos o que você já sabe e por onde começar.</small></span><span class="edu-chev" aria-hidden="true">›</span></button>
        <button type="button" class="edu-row" data-a="basic"><span class="edu-ico" aria-hidden="true">📖</span><span class="edu-row-t"><b>Começar por ${escHTML(s.name)}</b><small>Primeira lição da trilha recomendada.</small></span><span class="edu-chev" aria-hidden="true">›</span></button>
        <button type="button" class="edu-row" data-a="pick"><span class="edu-ico" aria-hidden="true">🗺</span><span class="edu-row-t"><b>Escolher o assunto</b><small>Veja a trilha completa.</small></span><span class="edu-chev" aria-hidden="true">›</span></button>
      </div>
      <p class="wl-note">Seu progresso fica salvo e aparece em <b>📊 Progresso</b>. Na tela inicial, o botão <b>Continuar</b> sempre leva ao seu próximo passo.</p>
      <button type="button" class="edu-link" data-a="tour">Ver um tour rápido do app (1 minuto)</button>`;
    box.querySelector('[data-a=place]').onclick = ()=> finish(()=> startPlacement());
    box.querySelector('[data-a=basic]').onclick = ()=> finish(()=> go('subjectDetail', {subjectId:s.id, topicId:t.id}));
    box.querySelector('[data-a=pick]').onclick = ()=> finish(()=> go('content'));
    box.querySelector('[data-a=tour]').onclick = ()=>{ close(); startTour(); };
    box.querySelector('[data-a=place]').focus();
  }
  step1();
  document.body.appendChild(bg);
}
function chooseDailyGoal(){
  const cur = currentSettingsSync().dailyGoal || 10;
  const bg = document.createElement('div'); bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal edu-sheet" role="dialog" aria-label="Meta do dia"><h2>Meta do dia</h2><p>Quantas questões por dia você quer responder?</p>
    <div class="edu-sheet-grid">${[5,10,15,20,30].map(n=>`<button type="button" class="btn ${n===cur?'primary':'secondary'}" data-n="${n}">${n}</button>`).join('')}</div>
    <button type="button" class="btn secondary edu-close">Fechar</button></div>`;
  bg.querySelectorAll('[data-n]').forEach(b=> b.onclick = async ()=>{ const st = await loadSettings(); st.dailyGoal = +b.dataset.n; await saveSettings(); bg.remove(); render(); });
  bg.querySelector('.edu-close').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}
function showMissionsSheet(){
  const bg = document.createElement('div'); bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal edu-sheet edu-sheet-light" role="dialog" aria-label="Missões do dia"><h2>Missões do dia</h2><p>Pequenos objetivos que dão XP extra.</p><div class="edu-ms"></div><button type="button" class="btn secondary edu-close">Fechar</button></div>`;
  const paint = ()=>{ const box = bg.querySelector('.edu-ms'); box.innerHTML = ''; const card = missionsCard(); card.querySelectorAll('.m-claim').forEach(b=>{ const old = b.onclick; b.onclick = ()=>{ old && old(); setTimeout(paint, 50); }; }); box.appendChild(card); };
  paint();
  bg.querySelector('.edu-close').onclick = ()=>{ bg.remove(); render(); };
  bg.addEventListener('click', e=>{ if(e.target===bg){ bg.remove(); render(); } });
  document.body.appendChild(bg);
}

/* =========================================================
   APRENDER — trilha de aprendizagem: etapas → assuntos → lições
   ========================================================= */
function eduContentScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Aprender', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);
  const p = progressSync(), errs = errorsSync();
  const curId = pathCurrentSubject(p, errs);

  // onde o aluno está e o próximo passo
  const top = h(`<div class="edu-card edu-continue pth-here-card"><div class="edu-kicker">Sua trilha de aprendizagem</div><h3></h3><p class="edu-now"></p><button type="button" class="btn primary edu-go"></button>
    <button type="button" class="edu-link edu-lost-link">🤔 Não sei o que estudar</button></div>`);
  if(curId){
    const st = pathStages(curId, p, errs), act = pathNextAction(curId, st);
    top.querySelector('h3').textContent = `Você está em: ${subjOf(curId).name}`;
    top.querySelector('.edu-now').textContent = `Próximo passo: ${act.sub}`;
    top.querySelector('.edu-go').textContent = act.label;
    top.querySelector('.edu-go').onclick = act.go;
  } else {
    top.querySelector('h3').textContent = 'Você concluiu toda a trilha! 🎉';
    top.querySelector('.edu-now').textContent = 'Continue praticando para não esquecer. Os desafios ajudam a manter o ritmo.';
    top.querySelector('.edu-go').textContent = 'Revisão do dia';
    top.querySelector('.edu-go').onclick = ()=> startSpacedReview();
  }
  top.querySelector('.edu-lost-link').onclick = ()=> showWhatToStudy();
  c.appendChild(top);
  c.appendChild(h(`<p class="edu-lead">Cada assunto segue 5 etapas: <b>Aprender → Exemplos → Praticar → Revisar → Dominar</b>. Você pode abrir qualquer assunto quando quiser.</p>`));

  const focus = state.areaId;
  LEARN_AREAS.forEach((a, ai)=>{
    const pcts = a.ids.map(subjectProgress), nDone = pcts.filter(x=>x>=100).length;
    const here = a.ids.includes(curId);
    const sec = h(`<section class="edu-sec edu-area-sec pth-area ${here?'here':''} ${nDone===a.ids.length?'done':''}" id="area-${a.id}">
      <div class="pth-area-h"><span class="pth-num" aria-hidden="true">${nDone===a.ids.length ? '✓' : ai+1}</span><div><div class="edu-kicker">Etapa ${ai+1}</div><h2></h2><small></small></div></div></section>`);
    sec.querySelector('h2').textContent = a.name;
    sec.querySelector('small').textContent = `${a.desc} · ${nDone} de ${a.ids.length} concluído${a.ids.length===1?'':'s'}`;
    a.ids.forEach((id, k)=>{
      const s = subjOf(id); if(!s) return;
      const st = pathStages(id, p, errs), pct = pcts[k], isHere = id===curId;
      const row = h(`<button type="button" class="subject-row edu-subj pth-subj ${isHere?'here':''}"><span class="sym">${s.sym}</span><span class="txt">${isHere?'<span class="pth-you">📍 Você está aqui</span>':''}<span class="name"></span>${stageStrip(st, true)}${eduBar(pct, s.name)}<span class="desc"></span></span><span class="chev" aria-hidden="true">›</span></button>`);
      row.querySelector('.name').textContent = s.name;
      row.querySelector('.desc').textContent = pct>=100 ? 'Concluído ✓' : st.current ? `${pct}% · próxima etapa: ${st.current.name}` : `${pct}%`;
      row.setAttribute('aria-label', `${s.name}: ${pct}% concluído${st.current ? `, próxima etapa: ${st.current.name}` : ', concluído'}${isHere ? '. Você está aqui' : ''}`);
      row.onclick = ()=> go('subjectDetail', {subjectId:id, topicId:null});
      sec.appendChild(row);
    });
    c.appendChild(sec);
  });
  const tools = eduSection('Ferramentas de estudo'); const l = h(`<div class="edu-list"></div>`);
  l.appendChild(eduRow({ico:'△', title:'Laboratório de Geometria', sub:'Mexa nas figuras e veja área e perímetro mudarem', go:()=>go('geoLab', {geoBack:'content'})}));
  l.appendChild(eduRow({ico:'✏', title:'Caderno', sub:'Suas anotações escritas à mão', go:()=>go('notebook')}));
  tools.appendChild(l); c.appendChild(tools);
  const target = focus ? 'area-'+focus : null;
  if(target) setTimeout(()=>{ const el = document.getElementById(target); if(el) el.scrollIntoView({block:'start'}); state.areaId = null; }, 30);
  return wrap;
}

/* =========================================================
   PÁGINA DE ESTUDO — Explicação → Exemplos → Como resolver → Tente você → Pratique
   ========================================================= */
function stepsListHTML(steps, sub){
  // sub = número do passo "pai" (dentro do "Resolvendo" da correção: 4.1, 4.2...)
  return `<ol class="edu-steps">${(steps||[]).map((st,i)=>`<li><span class="edu-step-n">${sub ? `${sub}.${i+1}` : `Passo ${i+1}`}</span><div class="edu-step-t">${st}</div></li>`).join('')}</ol>`;
}
function studyScreen(){
  const s = subjOf(state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('content')));
  const c = h(`<div class="content edu-content edu-study"></div>`);
  wrap.appendChild(c);
  const tops = subjectTopics(s), read = studyRead()[s.id] || [], m = masterySync(s.id), pct = subjectProgress(s.id);
  const nRead = tops.filter(t=>read.includes(t.id)).length;
  const head = h(`<div class="edu-study-head"><div class="edu-kicker">${escHTML((areaOfSubject(s.id)||{}).name||'')}${BNCC_ANO[s.id] ? ' · '+BNCC_ANO[s.id] : ''}</div>
    <h1>${escHTML(s.name)}</h1>${eduBar(pct, `${s.name}: ${pct}% concluído`)}
    <div class="edu-small"><span>${pct}% concluído · ${nRead} de ${tops.length} lições</span><span>${m.ico} ${m.name}</span></div>
    <div class="pth-head-st"></div>
    <p class="edu-next"></p><button type="button" class="btn primary edu-go sd-next"></button></div>`);
  c.appendChild(head);
  function paintStage(){
    const st = pathStages(s.id, progressSync(), errorsSync()), act = pathNextAction(s.id, st);
    head.querySelector('.pth-head-st').innerHTML = stageStrip(st);
    head.querySelector('.edu-next').textContent = st.current ? `Próximo passo: ${act.sub}` : act.sub;
    const nb = head.querySelector('.sd-next'); nb.textContent = act.label; nb.onclick = act.go;
  }
  paintStage();

  // domínio de cada parte do assunto (🟢 Dominado · 🟡 Em aprendizado · 🔴 Precisa praticar)
  const sk = h(`<details class="edu-card sk-card"><summary><b>Seu domínio neste assunto</b><small></small></summary><ul class="sk-list"></ul></details>`);
  loadHistory().then(hist=>{
    const rows = skillMastery(hist, s.id); if(!rows.length || !sk.isConnected) return;
    const good = rows.filter(r=>r.state.key==='good').length;
    sk.querySelector('small').textContent = `${good} de ${rows.length} partes dominadas`;
    sk.querySelector('.sk-list').innerHTML = rows.map(r=>`<li class="sk-${r.state.key}"><span class="sk-ico" aria-hidden="true">${r.state.ico}</span><span class="sk-name">${escHTML(r.name)}</span><span class="sk-st">${r.state.name}${r.n ? ` · ${r.ok}/${r.n}` : ''}</span></li>`).join('');
  });
  c.appendChild(sk);

  // etapa 1 e 2: lições (explicação e exemplos)
  const stepBlock = (n, title, sub)=>{ const b = h(`<section class="edu-step-sec"><div class="edu-step-h"><span class="edu-num">${n}</span><div><h2></h2>${sub?`<p></p>`:''}</div></div></section>`); b.querySelector('h2').textContent = title; if(sub) b.querySelector('p').textContent = sub; return b; };
  const concept = tops.filter(t=>t.kind==='concept'), examples = tops.filter(t=>t.kind==='example');
  const lesson = t=>{
    const done = read.includes(t.id);
    const d = h(`<details class="edu-lesson ${done?'done':''}" id="lesson-${t.id}"><summary><span class="edu-check" aria-hidden="true">${done?'✓':''}</span><span class="edu-lesson-t"></span><span class="sr-only">${done?'(estudada)':''}</span></summary><div class="edu-lesson-b"></div></details>`);
    d.querySelector('.edu-lesson-t').textContent = t.title;
    const body = d.querySelector('.edu-lesson-b');
    if(t.kind==='concept'){
      body.innerHTML = t.html;
      if(SIMPLE[s.id]){
        const nb = h(`<button type="button" class="edu-link edu-lost" aria-expanded="false">🆘 Não entendi esta parte</button>`);
        const box = h(`<div class="fb-concept edu-lost-box" hidden><b>Explicando de outro jeito:</b> <span></span><div class="edu-lost-go"></div></div>`);
        box.querySelector('span').textContent = SIMPLE[s.id];
        const ex0 = examples[0];
        if(ex0){ const eb = h(`<button type="button" class="edu-link">Ver um exemplo resolvido</button>`); eb.onclick = ()=>{ const el = document.getElementById('lesson-'+ex0.id); if(el){ el.open = true; el.scrollIntoView({behavior:'smooth', block:'start'}); } }; box.querySelector('.edu-lost-go').appendChild(eb); }
        nb.onclick = ()=>{ box.hidden = !box.hidden; nb.setAttribute('aria-expanded', !box.hidden); };
        body.appendChild(nb); body.appendChild(box);
      }
    }
    else { body.innerHTML = `<div class="edu-ex-body">${renderExampleBody(t.ex)}</div>${stepsListHTML(t.ex.steps)}`; }
    const done2 = h(`<button type="button" class="btn secondary edu-done">${done ? 'Próxima lição' : 'Entendi, próxima lição'}</button>`);
    done2.onclick = ()=>{
      markTopicRead(s.id, t.id); d.classList.add('done'); d.querySelector('.edu-check').textContent = '✓';
      d.open = false;
      const nx = nextTopic(s.id);
      const target = nx ? document.getElementById('lesson-'+nx.id) : document.getElementById('try-it');
      if(target){ if(target.tagName==='DETAILS') target.open = true; target.scrollIntoView({behavior:'smooth', block:'start'}); }
      refreshHead();
    };
    body.appendChild(done2);
    d.addEventListener('toggle', ()=>{ if(d.open){ studyData().last = {subjectId:s.id, topicId:t.id, ts:Date.now()}; saveGame(); } });
    return d;
  };
  function refreshHead(){
    const p2 = subjectProgress(s.id), n2 = tops.filter(t=>(studyRead()[s.id]||[]).includes(t.id)).length;
    head.querySelector('.edu-bar i').style.width = p2+'%';
    head.querySelector('.edu-bar').setAttribute('aria-valuenow', p2);
    head.querySelector('.edu-small span').textContent = `${p2}% concluído · ${n2} de ${tops.length} lições`;
    paintStage();
  }
  const s1 = stepBlock(1, 'Explicação', 'Leia com calma. Toque em cada parte para abrir.');
  concept.forEach(t=> s1.appendChild(lesson(t)));
  c.appendChild(s1);
  const s2 = stepBlock(2, 'Exemplos resolvidos', 'Veja o raciocínio passo a passo.');
  examples.forEach(t=> s2.appendChild(lesson(t)));
  c.appendChild(s2);

  // etapa 3: como resolver
  if(HINTS[s.id]){
    const s3 = stepBlock(3, 'Como resolver');
    s3.appendChild(h(`<div class="edu-method">${HINTS[s.id]}</div>`));
    c.appendChild(s3);
  }

  // etapa 4: tente você
  const s4 = stepBlock(HINTS[s.id] ? 4 : 3, 'Tente você', 'Uma questão para conferir se entendeu.');
  s4.id = 'try-it';
  const tryBox = h(`<div class="edu-try"></div>`);
  s4.appendChild(tryBox);
  c.appendChild(s4);
  let tryDiff = m.lvl >= 3 ? 'medio' : 'facil', lastSig = null;
  function newTry(){
    const g = genQuestionAvoidingRepeat(s, tryDiff, lastSig); lastSig = g.signature;
    const ex = g.ex, opts = buildOptions(ex);
    tryBox.innerHTML = '';
    const qv = questionHTML(ex);
    const qc = h(`<div class="question-card"><div class="qlabel">${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[tryDiff]}</div><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
    addSpeakButton(qc, ex);
    tryBox.appendChild(qc);
    const list = h(`<div class="mc-opts" role="group" aria-label="Alternativas"></div>`);
    let picked = null;
    opts.forEach((o,i)=>{ const b = h(`<button type="button" class="mc-opt"><span class="key">${'ABCD'[i]}</span><span class="lbl mono"></span></button>`); b.querySelector('.lbl').textContent = o.label;
      b.onclick = ()=>{ if(picked!==null) return; picked = i; list.querySelectorAll('.mc-opt').forEach((x,k)=>{ x.disabled = true; if(opts[k].ok) x.classList.add('right'); else if(k===i) x.classList.add('wrongpick'); else x.classList.add('dim'); });
        const ok = opts[i].ok;
        giveAnswerFeedback(ok);
        recordAnswer(s.id, ok, {difficulty:tryDiff, ex});
        const fb = learnFeedback(ex, ok, s.id, {picked:o.label, difficulty:tryDiff, onEasier:(d)=>{ tryDiff = d; newTry(); tryBox.scrollIntoView({behavior:'smooth', block:'start'}); }});
        tryBox.appendChild(fb);
        const again = h(`<button type="button" class="btn ${ok?'secondary':'primary'} edu-again">${ok ? 'Tentar outra questão' : 'Tentar uma questão parecida'}</button>`);
        again.onclick = ()=>{ newTry(); tryBox.scrollIntoView({behavior:'smooth', block:'start'}); };
        tryBox.appendChild(again);
        fb.scrollIntoView({behavior:'smooth', block:'nearest'});
      };
      list.appendChild(b); });
    tryBox.appendChild(list);
  }
  newTry();

  // etapa 5: pratique
  const s5 = stepBlock(HINTS[s.id] ? 5 : 4, 'Pratique', 'Faça exercícios para dominar o assunto.');
  const pr = h(`<div class="edu-list"></div>`);
  pr.appendChild(eduRow({ico:'✎', title:'Praticar este assunto', sub:'5 exercícios · escolha a dificuldade', cls:'edu-row-main sd-practice', go:()=>go('exerciseDifficulty', {subjectId:s.id})}));
  pr.appendChild(eduRow({ico:'🃏', title:'Cartões de revisão', sub:'Vire o cartão e confira se sabia', cls:'sd-cards', go:()=>chooseCardsLevel(s.id)}));
  const errRow = eduRow({ico:'↻', title:'Revisar meus erros deste assunto', sub:'Questões guardadas no caderno de erros', cls:'sd-errs', go:()=>startReviewErrors({subjectId:s.id, all:true})});
  loadErrors().then(errs=>{ const n = errs.filter(e=>e.subjectId===s.id).length; if(n && pr.isConnected){ errRow.querySelector('small').textContent = `${n} questão(ões) guardada(s) no caderno`; pr.insertBefore(errRow, pr.children[1]); } });
  if(s.id==='geometria') pr.appendChild(eduRow({ico:'△', title:'Laboratório de Geometria', sub:'Mexa nas figuras', cls:'sd-lab', go:()=>go('geoLab', {geoBack:'subjectDetail'})}));
  pr.appendChild(eduRow({ico:'✏', title:'Anotar no caderno', sub:'Escreva à mão o que aprendeu', cls:'sd-note', go:()=>{ const mine = notesIndex().filter(n=>n.subjectId===s.id); if(mine.length){ state.noteFilter = s.id; go('notebook'); } else chooseNewPage(s.id); }}));
  s5.appendChild(pr);
  c.appendChild(s5);

  // abre a lição pedida (ex.: "Continuar estudando")
  const want = state.topicId || null;
  state.topicId = null; // vale só para esta abertura
  if(want){ setTimeout(()=>{ const d = document.getElementById('lesson-'+want); if(d){ d.open = true; d.scrollIntoView({block:'start'}); } }, 30); }
  return wrap;
}

/* =========================================================
   CORREÇÃO QUE ENSINA (usada em todos os exercícios)
   acertou → "Correto!" + resposta + resolução opcional
   errou   → "Vamos entender o erro" + resposta certa + raciocínio passo a passo + a ideia principal
   ========================================================= */
function exerciseSteps(ex){
  let steps = (ex.steps||[]).slice();
  if(ex.columns) steps = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...steps];
  else if(ex.visual){
    const [n, d] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
    steps = [fracRow(ex.visual.slice(0,-2).concat(['=', d ? {n, d} : ex.displayAnswer])), ...steps];
  } else if(ex.solvedVisual) steps = [ex.solvedVisual, ...steps];
  return steps;
}
function finalAnswerText(ex){
  return ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair' ? `x' = ${ex.answer[0]}  e  x'' = ${ex.answer[1]}` : ex.type==='xy' ? `x = ${ex.answer.x}  e  y = ${ex.answer.y}` : fmt(ex.answer));
}
function learnFeedback(ex, correct, subjectId, opts){
  opts = opts || {};
  const ans = finalAnswerText(ex), steps = exerciseSteps(ex), parts = reasoningParts(ex, subjectId);
  const partsHTML = `<ol class="rz-parts">${parts.map((pt,i)=>`<li><span class="rz-n">Passo ${i+1}</span><b class="rz-t">${pt.t}</b>${pt.steps ? stepsListHTML(steps, i+1) : `<div class="rz-b">${pt.b}</div>`}</li>`).join('')}</ol>`;
  const check = parts.find(x=>x.t==='Conferindo o resultado');
  const fb = h(`<div class="feedback ${correct?'correct':'wrong'}" role="status" aria-live="polite"></div>`);
  if(correct){
    fb.innerHTML = `<div class="fb-title">✓ ${opts.okTitle || 'Correto!'}</div>
      <p class="fb-short">Resposta: <b class="mono fb-right"></b></p>
      ${check ? `<p class="fb-why">${check.b}</p>` : ''}
      <details class="fb-more"><summary>Ver o raciocínio completo</summary><div class="fb-explain">${partsHTML}</div></details>`;
  } else {
    fb.innerHTML = `<div class="fb-title">${opts.badTitle || 'Vamos entender'}</div>
      <p class="fb-short">${opts.picked ? `Você respondeu <b class="mono fb-pick"></b>. ` : ''}A resposta certa é <b class="mono fb-right"></b>.</p>
      <div class="fb-explain">${partsHTML}</div>
      ${HINTS[subjectId] ? `<div class="fb-sec">💡 Dica</div><div class="fb-concept">${HINTS[subjectId]}</div>` : ''}
      <button type="button" class="btn secondary fb-help" aria-expanded="false">🆘 Não entendi</button>
      <div class="fb-simple" hidden></div>`;
    if(opts.picked) fb.querySelector('.fb-pick').textContent = opts.picked;
    const btn = fb.querySelector('.fb-help'), box = fb.querySelector('.fb-simple');
    btn.onclick = ()=>{
      const open = box.hidden; box.hidden = !open; btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Fechar a explicação simples' : '🆘 Não entendi';
      if(open && !box.childElementCount) fillSimpleHelp(box, ex, subjectId, opts, steps);
      if(open) box.scrollIntoView({behavior:'smooth', block:'nearest'});
    };
  }
  fb.querySelector('.fb-right').textContent = ans;
  return fb;
}
/* "Não entendi": outro jeito de explicar + passo a passo um de cada vez + questão mais fácil */
function fillSimpleHelp(box, ex, subjectId, opts, steps){
  const s = subjOf(subjectId);
  box.innerHTML = `<div class="fb-sec">Explicando de outro jeito</div><div class="fb-concept">${escHTML(SIMPLE[subjectId] || '')}</div>
    <div class="fb-sec">Vamos por partes</div><div class="sp-steps"></div>
    <div class="sp-actions"></div>`;
  const list = box.querySelector('.sp-steps'); let k = 0;
  const nextBtn = h(`<button type="button" class="btn secondary sp-next"></button>`);
  const show = ()=>{
    list.appendChild(h(`<div class="sp-step"><span class="edu-step-n">Parte ${k+1} de ${steps.length}</span><div class="edu-step-t">${steps[k]}</div></div>`));
    k++;
    if(k >= steps.length){ nextBtn.remove(); list.appendChild(h(`<p class="sp-end">Pronto! A resposta é <b class="mono"></b>.</p>`)).querySelector('b').textContent = finalAnswerText(ex); }
    else nextBtn.textContent = `Entendi, mostrar a parte ${k+1}`;
  };
  if(steps.length){ show(); if(nextBtn.isConnected===false && k < steps.length) list.after(nextBtn); nextBtn.onclick = show; }
  const acts = box.querySelector('.sp-actions');
  const easier = opts.difficulty==='dificil' ? 'medio' : 'facil';
  const e1 = h(`<button type="button" class="btn primary">Tentar uma questão ${opts.difficulty && opts.difficulty!=='facil' ? 'mais fácil' : 'parecida'}</button>`);
  e1.onclick = ()=> opts.onEasier ? opts.onEasier(easier) : startSession(subjectId, easier);
  const e2 = h(`<button type="button" class="btn secondary">Rever a explicação de ${escHTML(s ? s.name : 'assunto')}</button>`);
  e2.onclick = ()=> go('subjectDetail', {subjectId});
  acts.appendChild(e1); acts.appendChild(e2);
}

/* =========================================================
   PRATICAR
   ========================================================= */
function practiceScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Praticar', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);
  c.appendChild(h(`<p class="edu-lead">Pratique com exercícios, revise seus erros e prepare-se para as provas.</p>`));
  const p = progressSync(), errs = errorsSync(), tp = todaysPractice(p, errs), ts = subjOf(tp.subjectId);
  const top = h(`<div class="edu-card edu-continue edu-practice-today"><div class="edu-kicker">🎯 Prática recomendada</div><h3>Selecionamos 5 questões para reforçar ${escHTML(ts.name)}.</h3>
    <p class="edu-now"></p><button type="button" class="btn primary">Começar</button></div>`);
  top.querySelector('.edu-now').textContent = tp.reason;
  top.querySelector('.btn').onclick = ()=> startSession(tp.subjectId, tp.difficulty);
  c.appendChild(top);
  const lost = h(`<button type="button" class="btn secondary edu-lost-btn">🤔 Não sei o que estudar</button>`);
  lost.onclick = ()=> showWhatToStudy();
  c.appendChild(lost);
  const grp = (title, rows)=>{ const sec = eduSection(title), l = h(`<div class="edu-list"></div>`); rows.forEach(r=>l.appendChild(eduRow(r))); sec.appendChild(l); c.appendChild(sec); };
  const due = errs.filter(e=>errorIsDue(e)).length;
  grp('Exercícios', [
    {ico:'✎', title:'Por assunto', sub:'Escolha o assunto e a dificuldade', go:()=>go('exercisesSubjects')},
    {ico:'🎯', title:'Treino personalizado', sub:'Misture assuntos e foque nos pontos fracos', go:()=>go('personalizedSetup')},
    {ico:'×', title:'Tabuada', sub:'Treine a tabuada do 1 ao 10', go:()=>go('tabuada')},
  ]);
  grp('Corrigir e reforçar', [
    {ico:'↻', title:'Caderno de erros', sub: errs.length ? `${due} para revisar hoje · ${errs.length} no caderno` : 'Entenda e refaça o que errou', go:()=>go('errors')},
    {ico:'🧠', title:'Revisão do dia', sub:'Assuntos que já está na hora de relembrar', go:()=>startSpacedReview()},
  ]);
  grp('Provas e planejamento', [
    {ico:'📝', title:'Simulado', sub:'Prova com tempo, nota e correção comentada', go:()=>go('examSetup')},
    {ico:'🗺', title:'Plano de estudos', sub:'Organize os dias até a prova', go:()=>go('plan')},
    {ico:'🧭', title:'Teste de nivelamento', sub:'Descubra por onde começar', go:()=>startPlacement()},
  ]);
  grp('Ferramentas', [
    {ico:'?', title:'Resolver questão', sub:'Digite a conta e veja o passo a passo', go:()=>go('solve')},
    {ico:'#', title:'Calculadora', sub:'Básica e científica', go:()=>go('calculator')},
  ]);
  grp('Com jogo', [
    {ico:'🎮', title:'Desafios e jogos', sub:'Arena, Trilha, Quiz, Relâmpago e Duelo', go:()=>go('challenges')},
  ]);
  return wrap;
}

/* =========================================================
   DESAFIOS — jogos, missões, competição e recompensas
   ========================================================= */
function challengesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Desafios', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);
  c.appendChild(h(`<p class="edu-lead">Teste o que você aprendeu jogando. Cada acerto também conta no seu progresso.</p>`));
  const g = loadGame(); gameEnsureToday();
  const L = levelInfo(g.xp), streak = gameStreakNow(), nAch = Object.keys(g.ach||{}).length;
  const k = isoDay(), dd = arenaData().daily[k];
  const ms = missionState(), msDone = ms.filter(x=>x.claimed||x.done).length;
  const card = h(`<div class="edu-card ch-me"><div class="ch-me-row"><div><div class="edu-kicker">Nível ${L.level} · ${escHTML(L.title||'')}</div><b>${g.xp} XP</b></div><div class="ch-fire" aria-label="${streak} dias seguidos">🔥 ${streak}</div></div>
    ${eduBar(L.pct!=null ? L.pct : 0, 'Progresso até o próximo nível')}</div>`);
  c.appendChild(card);
  const grp = (title, rows)=>{ const sec = eduSection(title), l = h(`<div class="edu-list"></div>`); rows.forEach(r=>l.appendChild(eduRow(r))); sec.appendChild(l); c.appendChild(sec); return l; };
  grp('Hoje', [
    {ico:'📅', title:`Desafio do Dia #${dailyNumber(k)}`, sub: dd ? 'Feito hoje ✓ · volte amanhã para o próximo' : '5 questões, as mesmas para todo mundo', cls:'edu-row-main', go:()=>startDaily()},
    {ico:'✓', title:'Missões do dia', sub:`${msDone} de ${ms.length} concluídas · dão XP extra`, go:()=>showMissionsSheet()},
  ]);
  grp('Jogos', [
    {ico:'⚔', title:'Arena', sub:'Fases com estrelas por assunto', go:()=>go('arena')},
    {ico:'★', title:'Trilha', sub:'Episódios com fases, vidas e prêmios', go:()=>go('path')},
    {ico:'🏆', title:'Desafio misto', sub:'10 questões de todos os assuntos', go:()=>go('challengeDifficulty')},
    {ico:'🎤', title:'Quiz do Show', sub:'10 perguntas contra o relógio', go:()=>go('quizSetup')},
    {ico:'⚡', title:'Relâmpago', sub:'60 segundos de contas', go:()=>go('lightning')},
    {ico:'👥', title:'Duelo a dois', sub:'Dois jogadores no mesmo celular', go:()=>go('duel')},
  ]);
  grp('Recompensas', [
    {ico:'🏅', title:'Conquistas', sub:`${nAch} medalha${nAch===1?'':'s'} conquistada${nAch===1?'':'s'}`, go:()=>go('achievements')},
    {ico:'📜', title:'Certificados', sub:'Episódios concluídos na Trilha', go:()=>go('certificates')},
  ]);
  return wrap;
}

/* =========================================================
   TODAS AS FUNÇÕES (acessível pelo Início, Perfil e Progresso)
   ========================================================= */
function moreScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Todas as funções', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);
  const grp = (title, rows)=>{ const sec = eduSection(title), l = h(`<div class="edu-list"></div>`); rows.forEach(r=>l.appendChild(eduRow(r))); sec.appendChild(l); c.appendChild(sec); };
  grp('Ferramentas', [
    {ico:'?', title:'Resolver questão', sub:'Passo a passo de qualquer conta', go:()=>go('solve')},
    {ico:'#', title:'Calculadora', sub:'Básica e científica', go:()=>go('calculator')},
    {ico:'✏', title:'Caderno', sub:'Anotações à mão', go:()=>go('notebook')},
    {ico:'△', title:'Laboratório de Geometria', sub:'Figuras interativas', go:()=>go('geoLab', {geoBack:'more'})},
  ]);
  grp('Jogos e competição', [
    {ico:'🎮', title:'Desafios', sub:'Desafio do Dia, missões e todos os jogos', go:()=>go('challenges')},
    {ico:'⚔', title:'Arena', sub:'Fases com estrelas, Desafio do Dia e simulados', go:()=>go('arena')},
    {ico:'★', title:'Trilha', sub:'Episódios com fases e vidas', go:()=>go('path')},
    {ico:'⚡', title:'Relâmpago', sub:'60 segundos de contas', go:()=>go('lightning')},
    {ico:'🎤', title:'Quiz do Show', sub:'10 perguntas contra o relógio', go:()=>go('quizSetup')},
    {ico:'👥', title:'Duelo a dois', sub:'Dois jogadores no mesmo celular', go:()=>go('duel')},
  ]);
  grp('Seu desempenho', [
    {ico:'📊', title:'Progresso', sub:'Domínio por assunto e por parte', go:()=>go('progress')},
    {ico:'🏅', title:'Conquistas', sub:'Medalhas e títulos', go:()=>go('achievements')},
    {ico:'📜', title:'Certificados', sub:'Episódios concluídos', go:()=>go('certificates')},
    {ico:'🕘', title:'Histórico', sub:'Todas as questões respondidas', go:()=>go('history')},
    {ico:'📝', title:'Relatório semanal', sub:'Para pais e professores', go:()=>go('report')},
  ]);
  grp('Conta', [
    {ico:'👤', title:'Perfil', sub:'Nome, nível e dados', go:()=>go('profile')},
    {ico:'⚙', title:'Configurações', sub:'Tema, som, tamanho do texto', go:()=>go('settings')},
    {ico:'ℹ', title:'Como usar', sub:'Guia do aplicativo', go:()=>go('help')},
  ]);
  return wrap;
}
