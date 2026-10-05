/* =========================================================
   TELA APRENDER
      Lista de assuntos (agrupada por série e área) e a explicação de cada assunto.
   ========================================================= */
/* ---------------- CONTENT LIST ---------------- */
function contentScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Aprender', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Escolha um assunto para estudar a teoria e ver exemplos.</p>`));
  subjectListGrouped(c, (s,u)=>{
    const row = h(`<button class="subject-row" style="${unitStyle(u)}"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${BNCC_ANO[s.id]?`📚 ${BNCC_ANO[s.id]} · `:''}${masteryChip(masterySync(s.id))}${examTagsHTML(s.id, 2)}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=>go('subjectDetail', {subjectId:s.id});
    return row;
  });
  wrap.appendChild(c);
  return wrap;
}

function renderExampleBody(ex){
  return ex.columns
    ? contaArmada(ex.columns.nums, ex.columns.op, ex.columns.result, ex.columns.carries, ex.columns.marks)
    : ex.visual
    ? fracRow(ex.visual)
    : ex.qVisual
    ? ex.qVisual
    : `<div class="mono">${ex.text}</div>`;
}
function subjectDetailScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('content')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<div class="learn-hero" style="${unitStyle(Math.max(0, SUBJECTS.indexOf(s)))}"><span class="sym-big mono">${s.sym}</span><h2>${s.name}</h2></div>`));
  { const m = masterySync(s.id);
    c.appendChild(h(`<div class="mst-box"><div>${masteryChip(m)}${BNCC_ANO[s.id]?`<span class="bncc-tag">📚 BNCC · ${BNCC_ANO[s.id]}</span>`:''}</div><p>${m.next}</p></div>`)); }
  { const ex = examsForSubject(s.id);
    if(ex.length){
      const box = h(`<div class="pv-subj"><div class="pv-subj-h">🎓 Cai nas provas</div><div class="pv-subj-l">${ex.map(x=>`<button type="button" class="pv-chip ${x.lvl}" style="--c:${x.exam.color}" data-e="${x.exam.id}">${x.exam.ico} ${x.exam.name}<small>${x.lvl==='muito'?'🔥 cai muito':x.lvl==='bastante'?'⭐ cai bastante':'✓ às vezes'}</small></button>`).join('')}</div></div>`);
      box.querySelectorAll('[data-e]').forEach(b=> b.onclick = ()=> go('examDetail', {examId:b.dataset.e}));
      c.appendChild(box);
    } }
  const explain = h(`<div class="explain-card"></div>`);
  const examplesList = s.examples || [s.example];
  const boxesHtml = examplesList.map(ex=>{
    const stepsHtml = ex.steps ? `<div class="example-steps">${ex.steps.map((st,i)=>`<div class="ex-step"><span class="num">${i+1}</span><span class="txt">${st}</span></div>`).join('')}</div>` : '';
    return `<div class="example-box"><div class="lbl">${ex.title}</div>${renderExampleBody(ex)}${stepsHtml}</div>`;
  }).join('');
  explain.innerHTML = s.learn + boxesHtml;
  c.appendChild(explain);
  const cta = h(`<div class="cta-row"><button class="btn primary sd-practice">Praticar este assunto</button><button class="btn secondary sd-step">🪜 Exemplo guiado</button><button class="btn secondary sd-cards">🃏 Cartões de revisão</button><button class="btn secondary sd-note">✏️ Anotar no caderno</button></div>`);
  cta.querySelector('.sd-practice').onclick = ()=>go('exerciseDifficulty', {subjectId:s.id});
  cta.querySelector('.sd-cards').onclick = ()=> chooseCardsLevel(s.id);
  cta.querySelector('.sd-step').onclick = ()=> startStepGuide(s.id, adaptiveDifficultyFor(progressSync(), s.id) || 'medio', 'subjectDetail');
  if(s.id==='geometria'){
    const labBtn = h(`<button class="btn secondary sd-lab" style="flex-basis:100%">🔺 Abrir o Laboratório de Geometria</button>`);
    labBtn.onclick = ()=> go('geoLab', {geoBack:'subjectDetail'});
    cta.prepend(labBtn);
  }
  // cada botão pelo seu próprio nome (antes o ".secondary" pegava o do Laboratório e abria o caderno)
  cta.querySelector('.sd-note').onclick = ()=>{
    const mine = notesIndex().filter(n=>n.subjectId===s.id);
    if(mine.length){ state.noteFilter = s.id; go('notebook'); } else chooseNewPage(s.id);
  };
  c.appendChild(cta);
  wrap.appendChild(c);
  return wrap;
}
