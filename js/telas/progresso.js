/* =========================================================
   TELA PROGRESSO E HISTÓRICO
      Números gerais, atalhos (relatório, histórico, conquistas, certificados)
      e acertos por assunto.
   ========================================================= */
async function progressScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Meu progresso', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0;
  ids.forEach(id=>{ totalAttempted += p[id].attempted; totalCorrect += p[id].correct; });
  const totalWrong = totalAttempted-totalCorrect;
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalCorrect}</div><div class="lbl">Acertos</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalWrong}</div><div class="lbl">Erros</div></div>`));
  c.appendChild(grid);
  // tudo que é "seu progresso" fica aqui, na aba Progresso
  const pmenu = h(`<div class="quick-grid ex-modes" style="padding:0; margin-bottom:16px"></div>`);
  [
    {sym:'📝', cls:'tile-rep', label:'Relatório semanal', go:()=>go('report')},
    {sym:'🕘', cls:'tile-hist', label:'Histórico', go:()=>go('history')},
    {sym:'🏅', cls:'tile-ach', label:'Conquistas', go:()=>go('achievements')},
    {sym:'📜', cls:'tile-cert', label:'Certificados', go:()=>go('certificates')},
  ].forEach(m=>{ const t = h(`<button type="button" class="quick-tile ${m.cls}"><span class="sym">${m.sym}</span><span class="label">${m.label}</span></button>`); t.onclick = m.go; pmenu.appendChild(t); });
  c.appendChild(pmenu);

  c.appendChild(h(`<section class="block"><h3>Assuntos praticados</h3></section>`));
  if(ids.length===0){
    c.appendChild(h(`<div class="empty-note">Você ainda não praticou nenhum exercício.<br>Vá em "Exercícios" para começar! 🚀</div>`));
  } else {
    ids.forEach(id=>{
      const s = SUBJECTS.find(x=>x.id===id);
      if(!s) return;
      const d = p[id];
      const acc = d.attempted? Math.round(d.correct/d.attempted*100) : 0;
      const mst = masteryOf(d);
      const barCls = acc>=80? '' : acc>=50? 'mid':'low';
      const row = h(`
        <div class="mastery-row">
          <div class="top">
            <span class="name">${s.sym} &nbsp;${s.name} ${masteryChip(mst)}</span>
            <span class="pct">${acc}%</span>
          </div>
          <div class="bar-track"><div class="bar-fill ${barCls}" style="width:${acc}%"></div></div>
        </div>`);
      c.appendChild(row);
    });
  }

  if(totalAttempted>0){
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- HISTÓRICO DE QUESTÕES RESPONDIDAS ---------------- */
function formatHistoryDate(ts){
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const sameDay = d.toDateString() === now.toDateString();
  if(sameDay) return `Hoje, ${time}`;
  const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
  if(d.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
  return `${d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}, ${time}`;
}
function historyQuestionText(ex){
  if(!ex) return '';
  if(ex.question) return ex.question.replace(/\n/g,' ');
  return ''; // questões em formato visual (conta armada, fração, etc.) não têm um texto plano curto
}
async function historyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Histórico', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);

  const hist = await loadHistory();
  if(!hist.length){
    c.appendChild(h(`<div class="empty-note">Você ainda não respondeu nenhuma questão.<br>Assim que praticar, suas respostas aparecem aqui. 📝</div>`));
    wrap.appendChild(c);
    return wrap;
  }

  const totalCorrect = hist.filter(e=>e.correct).length;
  const pct = Math.round(totalCorrect/hist.length*100);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:13.5px; margin:2px 0 16px;">${hist.length} questões respondidas (últimas ${HISTORY_LIMIT}) · ${pct}% de acerto</p>`));

  const list = h(`<div class="history-list"></div>`);
  c.appendChild(list);
  const moreBtn = h(`<button class="btn secondary" style="margin-top:4px;width:100%;">Ver mais</button>`);
  c.appendChild(moreBtn);

  const PAGE = 30;
  let shown = 0;
  const diffLabels = {facil:'Fácil', medio:'Médio', dificil:'Difícil'};
  function renderPage(){
    hist.slice(shown, shown+PAGE).forEach(entry=>{
      const qtxt = historyQuestionText(entry.ex);
      const row = h(`
        <div class="history-row ${entry.correct?'ok':'bad'}">
          <div class="history-icon">${entry.correct? '✓':'✕'}</div>
          <div class="history-info">
            <div class="history-top">
              <span class="subj">${entry.subjectName}</span>
              ${entry.difficulty? `<span class="diff">${diffLabels[entry.difficulty]||entry.difficulty}</span>`:''}
              ${entry.review? `<span class="diff">Revisão</span>`:''}
            </div>
            ${qtxt? `<div class="history-q">${qtxt}</div>` : ''}
            <div class="history-date">${formatHistoryDate(entry.ts)}</div>
          </div>
        </div>`);
      list.appendChild(row);
    });
    shown += Math.min(PAGE, hist.length-shown);
    moreBtn.style.display = shown < hist.length ? '' : 'none';
  }
  moreBtn.onclick = renderPage;
  renderPage();

  wrap.appendChild(c);
  return wrap;
}
