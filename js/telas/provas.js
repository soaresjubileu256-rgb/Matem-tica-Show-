/* =========================================================
   TELAS DE PROVAS (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
   - Provas: lista com o quanto você já domina do que cai em cada uma.
   - Prova: como é, quem faz, dica, o que cai (🔥 / ⭐ / ✓), treino e simulado só desses assuntos.
   - "Minha prova": a escolhida aparece no Início, em "Pra fazer hoje".
   Os dados ficam em js/assuntos/provas.js.
   ========================================================= */
function myExamId(){ return loadGame().targetExam || null; }

/* uma aba por prova: ENEM | ETEC | Fuvest | Unicamp | Unesp | OBMEP.
   A aba aberta fica em state.examId (a "minha prova" abre primeiro). */
function examsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎓 Provas e vestibulares', true, ()=>go('exercisesSubjects')));
  const mine = myExamId();
  const e = examById(state.examId) || examById(mine) || EXAMS[0];
  state.examId = e.id;
  const tabs = h(`<div class="pv-tabs" role="tablist"></div>`);
  EXAMS.forEach(x=>{
    const r = examReadiness(x);
    const t = h(`<button type="button" role="tab" class="pv-tab ${x.id===e.id?'on':''}" aria-selected="${x.id===e.id}" style="--c:${x.color}"><span>${x.ico}</span><b>${x.name}${x.id===mine?' ⭐':''}</b><small>${r.pct}%</small></button>`);
    t.onclick = ()=>{ if(state.examId===x.id) return; state.examId = x.id; render(); };
    tabs.appendChild(t);
  });
  wrap.appendChild(tabs);
  const c = h(`<div class="content pv-screen"></div>`);
  examTabBody(e, c);
  wrap.appendChild(c);
  // deixa a aba escolhida visível na barra
  setTimeout(()=>{ const on = tabs.querySelector('.pv-tab.on'); if(on) tabs.scrollLeft = on.offsetLeft - (tabs.clientWidth - on.offsetWidth)/2; }, 0);
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

function examTabBody(e, c){
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
        <button type="button" class="pv-row-t" data-a="learn" aria-label="Estudar ${escHTML(s.name)}"><b>${escHTML(s.name)}</b>${masteryChip(m)}</button>
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
}
/* rota antiga (links de "Cai nas provas", botão voltar do treino): abre a aba da prova */
function examDetailScreen(){ return examsScreen(); }

