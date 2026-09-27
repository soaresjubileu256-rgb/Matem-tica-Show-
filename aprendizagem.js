/* =========================================================
   Matemática Show — APRENDIZAGEM (interface educacional)
   O aprendizado no centro: Início, Aprender (áreas → assuntos → lições),
   página de estudo em etapas, Praticar, Mais e a correção que ensina.
   Usa os sistemas que já existem (SUBJECTS, recordAnswer, progresso, jogo...).
   Só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

const LEARN_AREAS = [
  {id:'num',  name:'Números e operações', ico:'123', ids:['adicao','subtracao','multiplicacao','divisao','decimais','potenciacao','expressoes','mmcmdc','dinheiro']},
  {id:'frac', name:'Frações, porcentagem e proporção', ico:'½', ids:['fracoes','porcentagem','regra3']},
  {id:'alg',  name:'Álgebra', ico:'x', ids:['eq1','eq2','sistemas','func1grau']},
  {id:'geo',  name:'Geometria e estatística', ico:'△', ids:['geometria','estatistica']},
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
/* progresso do assunto = metade pelas lições lidas + metade pelo domínio nos exercícios */
function subjectProgress(id){
  const s = subjOf(id); if(!s) return 0;
  const tops = subjectTopics(s), read = (studyRead()[id]||[]).filter(t=>tops.some(x=>x.id===t)).length;
  const m = masterySync(id).lvl;
  return Math.round(100 * (0.5 * read/tops.length + 0.5 * m/4));
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

/* =========================================================
   INÍCIO
   ========================================================= */
function eduHomeScreen(){
  const wrap = document.createElement('div');
  wrap.className = 'edu-home';
  const bar = topbar();
  const initial = (currentUser && currentUser.name) ? currentUser.name.trim().charAt(0).toUpperCase() : '?';
  const helpBtn = h(`<button class="auth-logout tut-help-btn" title="Como usar" aria-label="Como usar o app">?</button>`);
  helpBtn.onclick = ()=> go('help');
  const profileBtn = h(`<button class="auth-logout profile-btn-avatar" title="Perfil" aria-label="Abrir meu perfil">${escHTML(initial)}</button>`);
  profileBtn.onclick = ()=> go('profile');
  bar.appendChild(helpBtn); bar.appendChild(profileBtn);
  wrap.appendChild(bar);
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);

  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const name = currentUser ? currentUser.name.split(' ')[0] : '';
  const L = levelInfo(loadGame().xp), streak = gameStreakNow();
  const head = h(`<div class="edu-hello"><h1>${hello}${name ? ', '+escHTML(name) : ''}!</h1><p>O que você vai aprender hoje?</p>
    <div class="edu-meta"><button type="button" class="edu-pill" data-a="lvl" aria-label="Nível ${L.level}, ver perfil">Nível ${L.level}</button><button type="button" class="edu-pill" data-a="fire" aria-label="${streak} dias seguidos estudando">🔥 ${streak} dia${streak===1?'':'s'}</button></div></div>`);
  head.querySelector('[data-a=lvl]').onclick = ()=> go('profile');
  head.querySelector('[data-a=fire]').onclick = ()=> showStreakPanel();
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

  // continue de onde parou
  const cont = continueStudying();
  const sec1 = eduSection(cont ? 'Continue de onde parou' : 'Comece por aqui');
  if(cont){
    const t = cont.topic;
    const card = h(`<div class="edu-card edu-continue">
      <div class="edu-kicker">${escHTML(areaOfSubject(cont.subject.id) ? areaOfSubject(cont.subject.id).name : '')}</div>
      <h3>${escHTML(cont.subject.name)}</h3>
      <p class="edu-now">${t ? `Próxima lição: <b>${escHTML(t.title)}</b>` : 'Você já viu todas as lições. Agora é praticar para dominar.'}</p>
      ${eduBar(cont.pct, `${cont.subject.name}: ${cont.pct}% concluído`)}
      <div class="edu-small"><span>${cont.pct}% concluído</span><span>Última atividade: ${timeAgo(cont.ts)}</span></div>
      <button type="button" class="btn primary edu-go">${t ? 'Continuar estudando' : 'Praticar este assunto'}</button></div>`);
    card.querySelector('.edu-go').onclick = ()=> t ? go('subjectDetail', {subjectId:cont.subject.id, topicId:t.id}) : go('exerciseDifficulty', {subjectId:cont.subject.id});
    sec1.appendChild(card);
  } else {
    const s = firstSubjectToStudy(), t = subjectTopics(s)[0];
    const card = h(`<div class="edu-card edu-continue"><div class="edu-kicker">Primeira lição</div><h3>${escHTML(s.name)}</h3>
      <p class="edu-now">${escHTML(t.title)}</p><button type="button" class="btn primary edu-go">Começar a estudar</button>
      <button type="button" class="edu-link edu-place">Não sabe por onde começar? Faça o teste de nivelamento</button></div>`);
    card.querySelector('.edu-go').onclick = ()=> go('subjectDetail', {subjectId:s.id, topicId:t.id});
    card.querySelector('.edu-place').onclick = ()=> startPlacement();
    sec1.appendChild(card);
  }
  c.appendChild(sec1);

  // aprenda matemática
  const sec2 = eduSection('Aprenda matemática', {label:'Ver todos', go:()=>go('content')});
  const grid = h(`<div class="edu-areas"></div>`);
  LEARN_AREAS.forEach(a=>{
    const pct = Math.round(a.ids.reduce((x,id)=>x+subjectProgress(id),0)/a.ids.length);
    const b = h(`<button type="button" class="edu-area"><span class="edu-area-ico" aria-hidden="true">${a.ico}</span><b></b><small>${a.ids.length} assuntos · ${pct}%</small>${eduBar(pct, a.name)}</button>`);
    b.querySelector('b').textContent = a.name;
    b.onclick = ()=> go('content', {areaId:a.id});
    grid.appendChild(b);
  });
  sec2.appendChild(grid);
  c.appendChild(sec2);

  // pratique
  const sec3 = eduSection('Pratique', {label:'Mais opções', go:()=>go('practice')});
  const list = h(`<div class="edu-list"></div>`);
  const recId = (()=>{ const r = recommendSubjects(progressSync(), (errorsCache && errorsCacheUid===currentUserId()) ? errorsCache : [], 1); return r[0] || (cont ? cont.subject.id : firstSubjectToStudy().id); })();
  list.appendChild(eduRow({ico:'✎', title:'Exercício rápido', sub:`5 questões de ${subjOf(recId).name}`, go:()=> startSession(recId, masterySync(recId).lvl>=3 ? 'medio' : 'facil')}));
  const rv = eduRow({ico:'↻', title:'Revisar erros', sub:'Aprenda com as questões que você errou', go:()=> go('errors')});
  list.appendChild(rv);
  loadErrors().then(errs=>{ const due = errs.filter(e=>errorIsDue(e)).length; const sm = rv.querySelector('small'); if(sm) sm.textContent = errs.length ? `${due} para revisar hoje · ${errs.length} no caderno` : 'Nenhum erro guardado por enquanto'; });
  loadProgress().then(pr=>{ const due = dueReviewSubjects(pr); if(!due.length || !list.isConnected) return;
    list.appendChild(eduRow({ico:'🧠', title:'Revisão do dia', sub:`Relembre: ${due.slice(0,3).map(s=>s.name).join(', ')}`, go:()=> startSpacedReview()})); });
  list.appendChild(eduRow({ico:'?', title:'Resolver uma questão', sub:'Digite a conta e veja o passo a passo', go:()=> go('solve')}));
  sec3.appendChild(list);
  c.appendChild(sec3);

  // desafio de hoje (discreto)
  const g = loadGame(); gameEnsureToday();
  const goal = currentSettingsSync().dailyGoal || 10, done = Math.min(g.today.answered||0, goal);
  const ms = missionState(), msDone = ms.filter(x=>x.claimed||x.done).length;
  const k = isoDay(), dd = arenaData().daily[k];
  const sec4 = eduSection('Desafio de hoje');
  const dc = h(`<div class="edu-card edu-today">
    <div class="edu-today-row"><div><b>Meta do dia</b><small class="goal-num">${done}/${goal} questões</small></div><button type="button" class="edu-link" data-a="goal">Mudar</button></div>
    ${eduBar(Math.round(done/goal*100), 'Meta do dia')}
    <div class="edu-today-links"><button type="button" class="edu-link" data-a="ms">Missões do dia · ${msDone}/${ms.length}</button><button type="button" class="edu-link" data-a="dd">Desafio do Dia ${dd ? '✓' : `#${dailyNumber(k)}`}</button></div></div>`);
  dc.querySelector('[data-a=goal]').onclick = ()=> chooseDailyGoal();
  dc.querySelector('[data-a=ms]').onclick = ()=> showMissionsSheet();
  dc.querySelector('[data-a=dd]').onclick = ()=> startDaily();
  sec4.appendChild(dc);
  c.appendChild(sec4);

  // seu progresso
  const p = progressSync(); let att = 0, ok = 0; Object.values(p).forEach(d=>{ att += d.attempted||0; ok += d.correct||0; });
  const sec5 = eduSection('Seu progresso', {label:'Ver detalhes', go:()=>go('progress')});
  sec5.appendChild(h(`<div class="edu-stats"><div><b>${att}</b><span>exercícios</span></div><div><b>${att ? Math.round(ok/att*100)+'%' : '—'}</b><span>de acerto</span></div><div><b>${streak}</b><span>dia${streak===1?'':'s'} seguido${streak===1?'':'s'}</span></div></div>`));
  c.appendChild(sec5);

  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected) maybeAskBackup(); }, 1500);
  if(!tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && !tutorialDone() && wrap.isConnected) startTour(); }, 700);
  return wrap;
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
   APRENDER — áreas → assuntos → lições
   ========================================================= */
function eduContentScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Aprender', true, ()=>go('home')));
  const c = h(`<div class="content edu-content"></div>`);
  wrap.appendChild(c);
  c.appendChild(h(`<p class="edu-lead">Escolha um assunto. Cada um tem explicação, exemplos resolvidos passo a passo e exercícios.</p>`));
  const focus = state.areaId;
  LEARN_AREAS.forEach(a=>{
    const sec = h(`<section class="edu-sec edu-area-sec" id="area-${a.id}"><div class="edu-sec-h"><h2></h2></div></section>`);
    sec.querySelector('h2').textContent = a.name;
    a.ids.forEach(id=>{
      const s = subjOf(id); if(!s) return;
      const tops = subjectTopics(s), pct = subjectProgress(id), m = masterySync(id);
      const row = h(`<button type="button" class="subject-row edu-subj"><span class="sym">${s.sym}</span><span class="txt"><span class="name"></span><span class="desc"></span>${eduBar(pct, s.name)}</span><span class="chev" aria-hidden="true">›</span></button>`);
      row.querySelector('.name').textContent = s.name;
      const named = tops.filter(t=>!/^Exemplo \d/.test(t.title) && t.id!=='c0').map(t=>t.title);
      const nEx = tops.filter(t=>t.kind==='example').length;
      row.querySelector('.desc').textContent = named.length ? `${named.slice(0,3).join(' · ')}${named.length>3?' …':''}` : `Explicação e ${nEx} exemplos resolvidos`;
      row.setAttribute('aria-label', `${s.name}: ${pct}% concluído, nível ${m.name}`);
      row.onclick = ()=> go('subjectDetail', {subjectId:id, topicId:null});
      sec.appendChild(row);
    });
    c.appendChild(sec);
  });
  const lab = eduRow({ico:'△', title:'Laboratório de Geometria', sub:'Mexa nas figuras e veja área e perímetro mudarem', go:()=>go('geoLab', {geoBack:'content'})});
  const tools = eduSection('Ferramentas de estudo'); const l = h(`<div class="edu-list"></div>`); l.appendChild(lab);
  l.appendChild(eduRow({ico:'✏', title:'Caderno', sub:'Suas anotações escritas à mão', go:()=>go('notebook')}));
  tools.appendChild(l); c.appendChild(tools);
  if(focus) setTimeout(()=>{ const el = document.getElementById('area-'+focus); if(el) el.scrollIntoView({block:'start'}); state.areaId = null; }, 30);
  return wrap;
}

/* =========================================================
   PÁGINA DE ESTUDO — Explicação → Exemplos → Como resolver → Tente você → Pratique
   ========================================================= */
function stepsListHTML(steps){
  return `<ol class="edu-steps">${(steps||[]).map((st,i)=>`<li><span class="edu-step-n">Passo ${i+1}</span><div class="edu-step-t">${st}</div></li>`).join('')}</ol>`;
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
    <p class="edu-next">${escHTML(m.next)}</p></div>`);
  c.appendChild(head);

  // etapa 1 e 2: lições (explicação e exemplos)
  const stepBlock = (n, title, sub)=>{ const b = h(`<section class="edu-step-sec"><div class="edu-step-h"><span class="edu-num">${n}</span><div><h2></h2>${sub?`<p></p>`:''}</div></div></section>`); b.querySelector('h2').textContent = title; if(sub) b.querySelector('p').textContent = sub; return b; };
  const concept = tops.filter(t=>t.kind==='concept'), examples = tops.filter(t=>t.kind==='example');
  const lesson = t=>{
    const done = read.includes(t.id);
    const d = h(`<details class="edu-lesson ${done?'done':''}" id="lesson-${t.id}"><summary><span class="edu-check" aria-hidden="true">${done?'✓':''}</span><span class="edu-lesson-t"></span><span class="sr-only">${done?'(estudada)':''}</span></summary><div class="edu-lesson-b"></div></details>`);
    d.querySelector('.edu-lesson-t').textContent = t.title;
    const body = d.querySelector('.edu-lesson-b');
    if(t.kind==='concept') body.innerHTML = t.html;
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
        const fb = learnFeedback(ex, ok, s.id, {picked:o.label});
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
  const ans = finalAnswerText(ex), steps = exerciseSteps(ex);
  const fb = h(`<div class="feedback ${correct?'correct':'wrong'}" role="status" aria-live="polite"></div>`);
  if(correct){
    fb.innerHTML = `<div class="fb-title">✓ ${opts.okTitle || 'Correto!'}</div>
      <p class="fb-short">Resposta: <b class="mono"></b></p>
      <details class="fb-more"><summary>Ver a resolução</summary><div class="fb-explain">${stepsListHTML(steps)}</div></details>`;
    fb.querySelector('.fb-short b').textContent = ans;
  } else {
    const concept = HINTS[subjectId];
    fb.innerHTML = `<div class="fb-title">${opts.badTitle || 'Vamos entender o erro'}</div>
      <p class="fb-short">${opts.picked ? `Você marcou <b class="mono fb-pick"></b>. ` : ''}A resposta certa é <b class="mono fb-right"></b>.</p>
      <div class="fb-sec">O raciocínio, passo a passo</div>
      <div class="fb-explain">${stepsListHTML(steps)}</div>
      ${concept ? `<div class="fb-sec">A ideia principal</div><div class="fb-concept">${concept}</div>` : ''}`;
    fb.querySelector('.fb-right').textContent = ans;
    if(opts.picked) fb.querySelector('.fb-pick').textContent = opts.picked;
  }
  return fb;
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
  const rec = recommendSubjects(progressSync(), (errorsCache && errorsCacheUid===currentUserId()) ? errorsCache : [], 3);
  const recId = rec[0] || (continueStudying() ? continueStudying().subject.id : firstSubjectToStudy().id);
  const top = h(`<div class="edu-card edu-continue"><div class="edu-kicker">Recomendado para você</div><h3>${escHTML(subjOf(recId).name)}</h3>
    <p class="edu-now">${rec.length ? 'É onde você mais tem errado ultimamente.' : 'Continue praticando o que está estudando.'}</p><button type="button" class="btn primary">Começar 5 exercícios</button></div>`);
  top.querySelector('.btn').onclick = ()=> startSession(recId, masterySync(recId).lvl>=3 ? 'medio' : 'facil');
  c.appendChild(top);
  const grp = (title, rows)=>{ const sec = eduSection(title), l = h(`<div class="edu-list"></div>`); rows.forEach(r=>l.appendChild(eduRow(r))); sec.appendChild(l); c.appendChild(sec); };
  grp('Exercícios', [
    {ico:'✎', title:'Por assunto', sub:'Escolha o assunto e a dificuldade', go:()=>go('exercisesSubjects')},
    {ico:'🎯', title:'Treino personalizado', sub:'Misture assuntos e foque nos pontos fracos', go:()=>go('personalizedSetup')},
    {ico:'×', title:'Tabuada', sub:'Treine a tabuada do 1 ao 10', go:()=>go('tabuada')},
  ]);
  grp('Revisar', [
    {ico:'↻', title:'Caderno de erros', sub:'Entenda e refaça o que errou', go:()=>go('errors')},
    {ico:'🧠', title:'Revisão do dia', sub:'Assuntos que já está na hora de relembrar', go:()=>startSpacedReview()},
  ]);
  grp('Provas e planejamento', [
    {ico:'📝', title:'Simulado', sub:'Prova com tempo, nota e correção comentada', go:()=>go('examSetup')},
    {ico:'🗺', title:'Plano de estudos', sub:'Organize os dias até a prova', go:()=>go('plan')},
    {ico:'🧭', title:'Teste de nivelamento', sub:'Descubra por onde começar', go:()=>startPlacement()},
    {ico:'🏆', title:'Desafios', sub:'10 questões de todos os assuntos', go:()=>go('challengeDifficulty')},
  ]);
  grp('Com jogo', [
    {ico:'★', title:'Trilha', sub:'Episódios com fases, vidas e prêmios', go:()=>go('path')},
    {ico:'⚔', title:'Arena', sub:'Fases com estrelas, Desafio do Dia, quiz e duelo', go:()=>go('arena')},
  ]);
  return wrap;
}

/* =========================================================
   MAIS
   ========================================================= */
function moreScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Mais', true, ()=>go('home')));
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
    {ico:'⚔', title:'Arena', sub:'Fases com estrelas, Desafio do Dia e simulados', go:()=>go('arena')},
    {ico:'★', title:'Trilha', sub:'Episódios com fases e vidas', go:()=>go('path')},
    {ico:'⚡', title:'Relâmpago', sub:'60 segundos de contas', go:()=>go('lightning')},
    {ico:'🎤', title:'Quiz do Show', sub:'10 perguntas contra o relógio', go:()=>go('quizSetup')},
    {ico:'⚔', title:'Duelo a dois', sub:'Dois jogadores no mesmo celular', go:()=>go('duel')},
  ]);
  grp('Seu desempenho', [
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
