/* =========================================================
   TELAS DE PROVAS (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
   - Provas: lista com o quanto você já domina do que cai em cada uma.
   - Prova: como é, quem faz, dica, o que cai (🔥 / ⭐ / ✓), treino e simulado só desses assuntos.
   - "Minha prova": a escolhida aparece no Início, em "Pra fazer hoje".
   Os dados ficam em js/assuntos/provas.js.
   ========================================================= */
function myExamId(){ return loadGame().targetExam || null; }

function examsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎓 Provas e vestibulares', true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content pv-screen"></div>`);
  c.appendChild(h(`<div class="pv-intro"><span>🎯</span><div><b>Estude o que cai na sua prova</b><p>Veja os assuntos de Matemática que mais caem no ENEM, na ETEC e nos principais vestibulares, e treine só eles.</p></div></div>`));
  const mine = myExamId();
  const sorted = EXAMS.slice().sort((a,b)=> (b.id===mine) - (a.id===mine));
  sorted.forEach(e=>{
    const r = examReadiness(e), hot = examTopicIds(e, ['muito']).length;
    const card = h(`<button type="button" class="pv-card ${e.id===mine?'mine':''}" style="--c:${e.color}; --c2:${e.color2}">
      <span class="pv-ico">${e.ico}</span>
      <span class="pv-t"><b>${e.name}${e.id===mine?' <em>⭐ minha prova</em>':''}</b><small>${escHTML(e.full)}</small>
        <span class="pv-bar"><i style="width:${r.pct}%"></i></span>
        <span class="pv-meta">${r.ready} de ${r.total} assuntos prontos · ${hot} que caem muito 🔥</span></span>
      <span class="chev">›</span></button>`);
    card.onclick = ()=> go('examDetail', {examId:e.id});
    c.appendChild(card);
  });
  c.appendChild(h(`<p class="pv-note">📊 Baseado em levantamentos de provas anteriores feitos por cursinhos e sites de educação. É uma orientação de estudo: confira sempre o edital da sua prova.</p>`));
  wrap.appendChild(c);
  return wrap;
}

function startExamTraining(e){
  loadProgress().then(progress=>{
    startPersonalizedSession({subjectIds: examTopicIds(e, ['muito','bastante']), difficultyMode:'adaptativa', qty:15, focusWeak:true, progress, examId:e.id, examName:e.name});
  });
}
function startExamSimulado(e){
  const ids = examTopicIds(e, ['muito','bastante']);
  // assuntos que caem muito entram duas vezes no sorteio: aparecem mais no simulado
  startExam({subjects: examTopicIds(e, ['muito']).concat(ids), n:20, mins:40, diff:'misturada'});
}

function examDetailScreen(){
  const e = examById(state.examId) || EXAMS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(`${e.ico} ${e.name}`, true, ()=>go('exams')));
  const c = h(`<div class="content pv-screen"></div>`);
  const r = examReadiness(e), mine = myExamId()===e.id;
  const R = 34, C = 2*Math.PI*R;
  const hero = h(`<div class="pv-hero" style="--c:${e.color}; --c2:${e.color2}">
    <div class="pv-hero-top">
      <div class="pv-ring" aria-label="${r.pct}% pronto"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="bg"/><circle cx="40" cy="40" r="${R}" class="fg" ${r.ready?'':'style="opacity:0"'} stroke-dasharray="${C}" stroke-dashoffset="${C*(1-r.pct/100)}"/></svg><div class="pv-ring-in"><b>${r.pct}%</b><small>pronto</small></div></div>
      <div class="pv-hero-t"><small>${escHTML(e.full.toUpperCase())}</small><h2>${e.ico} ${e.name}</h2><p>${r.ready} de ${r.total} assuntos importantes com nível Proficiente ou Dominado</p></div>
    </div>
    <button type="button" class="pv-mine ${mine?'on':''}">${mine ? '⭐ Esta é a minha prova' : '☆ Marcar como minha prova'}</button>
  </div>`);
  hero.querySelector('.pv-mine').onclick = ()=>{
    const g = loadGame(); g.targetExam = mine ? null : e.id; saveGame();
    showFloat(mine ? 'Prova desmarcada' : `⭐ ${e.name} vai aparecer no Início`);
    render();
  };
  c.appendChild(hero);

  const acts = h(`<div class="pv-acts"></div>`);
  const tr = h(`<button type="button" class="pv-act main"><span>🎯</span><b>Treinar o que mais cai</b><small>15 questões, dificuldade que se ajusta, mais dos seus pontos fracos</small></button>`);
  tr.onclick = ()=> startExamTraining(e);
  const sim = h(`<button type="button" class="pv-act"><span>📝</span><b>Simulado ${e.name}</b><small>20 questões em 40 minutos, nota de 0 a 10</small></button>`);
  sim.onclick = ()=> startExamSimulado(e);
  acts.appendChild(tr); acts.appendChild(sim);
  c.appendChild(acts);

  c.appendChild(h(`<div class="pv-info">
    <div><span>👥</span><div><b>Quem faz</b><p>${escHTML(e.who)}</p></div></div>
    <div><span>📄</span><div><b>Como é a prova</b><p>${escHTML(e.format)}</p></div></div>
    <div><span>💡</span><div><b>Dica</b><p>${escHTML(e.tip)}</p></div></div>
  </div>`));

  c.appendChild(h(`<h3 class="ar-label">O que cai de Matemática</h3>`));
  EXAM_LEVELS.forEach(L=>{
    const ids = examTopicIds(e, [L.id]);
    if(!ids.length) return;
    c.appendChild(h(`<div class="pv-lvl ${L.id}"><span>${L.ico} ${L.name}</span><small>${L.sub}</small></div>`));
    ids.forEach(id=>{
      const s = SUBJECTS.find(x=>x.id===id), m = masterySync(id);
      const row = h(`<div class="pv-row ${L.id}">
        <span class="ar-sym">${s.sym}</span>
        <span class="pv-row-t"><b>${escHTML(s.name)}</b>${masteryChip(m)}</span>
        <button type="button" class="pv-btn" data-a="learn" aria-label="Estudar ${escHTML(s.name)}">📖</button>
        <button type="button" class="pv-btn go" data-a="train">Treinar</button>
      </div>`);
      row.querySelector('[data-a=learn]').onclick = ()=> go('subjectDetail', {subjectId:id});
      row.querySelector('[data-a=train]').onclick = ()=> startSession(id, adaptiveDifficultyFor(progressSync(), id));
      c.appendChild(row);
    });
  });
  if(e.extra && e.extra.length){
    c.appendChild(h(`<div class="pv-extra"><b>📌 Também cai</b><p>Temas que aparecem nessa prova e você pode revisar no caderno ou no livro:</p><div>${e.extra.map(x=>`<span>${escHTML(x)}</span>`).join('')}</div></div>`));
  }
  c.appendChild(h(`<p class="pv-note">📊 Baseado em levantamentos de provas anteriores. Confira sempre o edital da sua prova.</p>`));
  wrap.appendChild(c);
  return wrap;
}

/* aviso no Início quando a pessoa marcou "minha prova" */
function examHomeBanner(){
  const e = examById(myExamId());
  if(!e) return null;
  const r = examReadiness(e);
  const b = h(`<button type="button" class="alert-banner pv-home" style="--c:${e.color}"><span class="sym">${e.ico}</span><span class="txt"><span class="title">Rumo ${e.id==='enem'?'ao':'à'} ${e.name}</span><span class="sub">${r.ready} de ${r.total} assuntos prontos · treine o que mais cai</span></span><span class="chev">›</span></button>`);
  b.onclick = ()=> go('examDetail', {examId:e.id});
  return b;
}
