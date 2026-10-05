/* =========================================================
   TELA PROGRESSO E HISTÓRICO
      Números gerais, atalhos (relatório, histórico, conquistas, certificados)
      e acertos por assunto.
   ========================================================= */
/* dias (AAAA-M-D do dayKey) dos últimos n dias, do mais antigo pro de hoje */
function progressLastDays(n){
  const out = [];
  for(let i=n-1;i>=0;i--){ const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-i); out.push(d); }
  return out;
}
async function progressScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📈 Meu progresso', true, ()=>go('home')));
  const c = h(`<div class="content pg-screen"></div>`);
  const p = await loadProgress(), hist = await loadHistory(), g = loadGame();
  const ids = Object.keys(p).filter(id=> SUBJECTS.some(s=>s.id===id));
  let totalAttempted=0, totalCorrect=0;
  ids.forEach(id=>{ totalAttempted += p[id].attempted; totalCorrect += p[id].correct; });
  const totalWrong = totalAttempted-totalCorrect;
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;
  const lv = levelInfo(g.xp||0), streak = gameStreakNow();
  const achN = Object.keys(g.ach||{}).filter(k=> ACHIEVEMENTS.some(a=>a.id===k)).length;
  const R = 36, C = 2*Math.PI*R;

  // topo: nível + XP
  c.appendChild(h(`<div class="pg-hero">
    <div class="pg-hero-top">
      <div class="pg-lv" aria-label="Nível ${lv.level}">
        <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" class="bg"/><circle cx="42" cy="42" r="${R}" class="fg" ${lv.into?'':'style="opacity:0"'} stroke-dasharray="${C}" stroke-dashoffset="${C*(1-lv.into/lv.need)}"/></svg>
        <div class="pg-lv-in"><small>NÍVEL</small><b>${lv.level}</b></div>
      </div>
      <div class="pg-hero-t">
        <small class="pg-kicker">${escHTML(currentUser && currentUser.name || 'Seu progresso')}</small>
        <h2>${lv.title}</h2>
        <div class="pg-xpbar"><i style="width:${lv.pct}%"></i></div>
        <p>${lv.into}/${lv.need} XP · faltam <b>${lv.need-lv.into} XP</b> pro nível ${lv.level+1}</p>
      </div>
    </div>
    <div class="pg-stats">
      <div><b>${totalAttempted.toLocaleString('pt-BR')}</b><span>questões</span></div>
      <div><b>${pct}%</b><span>de acerto</span></div>
      <div><b>🔥 ${streak}</b><span>ofensiva</span></div>
      <div><b>🏅 ${achN}</b><span>conquistas</span></div>
    </div>
  </div>`));

  // certas x erradas
  if(totalAttempted){
    c.appendChild(h(`<div class="pg-split">
      <div class="pg-split-bar"><i class="ok" style="width:${pct}%"></i><i class="bad" style="width:${100-pct}%"></i></div>
      <div class="pg-split-l"><span class="ok">✓ ${totalCorrect.toLocaleString('pt-BR')} certas</span><span class="bad">✕ ${totalWrong.toLocaleString('pt-BR')} erradas</span></div>
    </div>`));
  }

  // atividade dos últimos 14 dias (pelo histórico)
  const days = progressLastDays(14), per = {};
  hist.forEach(e=>{ const k = dayKey(new Date(e.ts)); (per[k] = per[k] || {n:0, ok:0}); per[k].n++; if(e.correct) per[k].ok++; });
  const vals = days.map(d=> per[dayKey(d)] || {n:0, ok:0}), max = Math.max(1, ...vals.map(v=>v.n));
  const today = vals[vals.length-1], week = vals.slice(7).reduce((a,v)=>a+v.n,0), activeDays = vals.filter(v=>v.n).length;
  const WD = ['D','S','T','Q','Q','S','S'];
  c.appendChild(h(`<h3 class="ar-label">Atividade · últimos 14 dias</h3>`));
  c.appendChild(h(`<div class="pg-act">
    <div class="pg-act-sum"><div><b>${today.n}</b><span>hoje</span></div><div><b>${week}</b><span>nos últimos 7 dias</span></div><div><b>${activeDays}/14</b><span>dias com estudo</span></div></div>
    <div class="pg-bars">${vals.map((v,i)=>`<div class="pg-bar ${i===13?'today':''} ${v.n?'':'zero'}" title="${days[i].toLocaleDateString('pt-BR')}: ${v.n} questões, ${v.ok} certas"><span class="pg-bar-n">${v.n||''}</span><div class="pg-bar-c"><i class="ok" style="height:${v.ok/max*100}%"></i><i class="bad" style="height:${(v.n-v.ok)/max*100}%"></i></div><small>${i===13?'hoje':WD[days[i].getDay()]}</small></div>`).join('')}</div>
  </div>`));

  // domínio dos assuntos
  const mcount = [0,0,0,0,0];
  SUBJECTS.forEach(s=> mcount[masteryOf(p[s.id]).lvl]++);
  const dom = mcount[3] + mcount[4];
  c.appendChild(h(`<h3 class="ar-label">Domínio dos assuntos</h3>`));
  c.appendChild(h(`<div class="pg-mst">
    <div class="pg-mst-t"><b>${dom}</b> de ${SUBJECTS.length} assuntos com nível Proficiente ou Dominado</div>
    <div class="pg-mst-bar">${[4,3,2,1,0].map(l=> mcount[l] ? `<i class="m${l}" style="flex:${mcount[l]}"></i>` : '').join('')}</div>
    <div class="pg-mst-leg">${[4,3,2,1,0].map(l=>`<span class="m${l}"><i></i>${MASTERY_LEVELS[l].ico} ${MASTERY_LEVELS[l].name} <b>${mcount[l]}</b></span>`).join('')}</div>
  </div>`));

  // assuntos praticados
  c.appendChild(h(`<h3 class="ar-label">Assuntos praticados${ids.length ? ` · ${ids.length}` : ''}</h3>`));
  if(ids.length===0){
    const e = h(`<div class="pg-empty"><div class="pg-empty-ico">🚀</div><b>Nenhum assunto praticado ainda</b><p>Resolva alguns exercícios e seu progresso aparece aqui.</p><button type="button" class="pg-empty-btn">Ir para Exercícios</button></div>`);
    e.querySelector('button').onclick = ()=> go('exercisesSubjects');
    c.appendChild(e);
  } else {
    const SORTS = [
      {id:'recent', name:'🕘 Recentes', fn:(a,b)=> (p[b].last||0)-(p[a].last||0)},
      {id:'best', name:'⭐ Melhores', fn:(a,b)=> masteryOf(p[b]).lvl-masteryOf(p[a]).lvl || acc(b)-acc(a)},
      {id:'weak', name:'🎯 Precisam de atenção', fn:(a,b)=> acc(a)-acc(b)},
      {id:'most', name:'🔢 Mais praticados', fn:(a,b)=> p[b].attempted-p[a].attempted},
    ];
    function acc(id){ return p[id].attempted ? p[id].correct/p[id].attempted : 0; }
    const chips = h(`<div class="ex-chips small pg-sort"></div>`);
    const list = h(`<div class="pg-subjs"></div>`);
    const paint = ()=>{
      const so = SORTS.find(x=>x.id===state.progressSort) || SORTS[0];
      chips.querySelectorAll('.ex-chip').forEach(b=> b.classList.toggle('on', b.dataset.s===so.id));
      list.innerHTML = '';
      ids.slice().sort(so.fn).forEach(id=>{
        const s = SUBJECTS.find(x=>x.id===id), d = p[id];
        const a = Math.round(acc(id)*100), mst = masteryOf(d);
        const barCls = a>=80? 'good' : a>=50? 'mid':'low';
        const row = h(`<button type="button" class="pg-subj">
          <span class="ar-sym">${s.sym}</span>
          <span class="pg-subj-t">
            <span class="pg-subj-h"><b>${s.name}</b><span class="pg-subj-pct ${barCls}">${a}%</span></span>
            <span class="pg-subj-bar"><i class="${barCls}" style="width:${a}%"></i></span>
            <span class="pg-subj-m">${masteryChip(mst)}<small>${d.correct}/${d.attempted} certas${d.last ? ` · ${formatHistoryDate(d.last).split(',')[0]}` : ''}</small></span>
          </span>
          <span class="chev">›</span></button>`);
        row.onclick = ()=> go('subjectDetail', {subjectId:id});
        list.appendChild(row);
      });
    };
    SORTS.forEach(so=>{ const b = h(`<button type="button" class="ex-chip" data-s="${so.id}">${so.name}</button>`); b.onclick = ()=>{ state.progressSort = so.id; paint(); }; chips.appendChild(b); });
    c.appendChild(chips);
    c.appendChild(list);
    paint();
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
  wrap.appendChild(topbar('🕘 Histórico', true, ()=>go('progress')));
  const c = h(`<div class="content hs-screen"></div>`);

  const hist = await loadHistory();
  if(!hist.length){
    c.appendChild(h(`<div class="pg-empty"><div class="pg-empty-ico">📝</div><b>Nenhuma resposta ainda</b><p>Assim que praticar, suas respostas aparecem aqui.</p></div>`));
    wrap.appendChild(c);
    return wrap;
  }

  const totalCorrect = hist.filter(e=>e.correct).length;
  const pct = Math.round(totalCorrect/hist.length*100);
  c.appendChild(h(`<div class="hs-sum">
    <div><b>${hist.length}</b><span>respostas salvas</span></div>
    <div class="ok"><b>${totalCorrect}</b><span>certas</span></div>
    <div class="bad"><b>${hist.length-totalCorrect}</b><span>erradas</span></div>
    <div><b>${pct}%</b><span>de acerto</span></div>
  </div>`));
  c.appendChild(h(`<p class="hs-note">Guardamos suas últimas ${HISTORY_LIMIT} respostas.</p>`));

  const FILTERS = [{id:'all', name:'Todas'}, {id:'ok', name:'✓ Certas'}, {id:'bad', name:'✕ Erradas'}];
  const chips = h(`<div class="ex-chips small hs-filter"></div>`);
  const list = h(`<div class="history-list"></div>`);
  const moreBtn = h(`<button class="btn secondary" style="margin-top:4px;width:100%;">Ver mais</button>`);
  c.appendChild(chips); c.appendChild(list); c.appendChild(moreBtn);

  const PAGE = 30;
  let shown = 0, items = hist, lastDay = null;
  const diffLabels = {facil:'Fácil', medio:'Médio', dificil:'Difícil'};
  function dayLabel(ts){
    const d = new Date(ts), now = new Date(), y = new Date(); y.setDate(now.getDate()-1);
    if(d.toDateString()===now.toDateString()) return 'Hoje';
    if(d.toDateString()===y.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'2-digit'});
  }
  function renderPage(){
    items.slice(shown, shown+PAGE).forEach(entry=>{
      const dl = dayLabel(entry.ts);
      if(dl!==lastDay){
        lastDay = dl;
        const k = new Date(entry.ts).toDateString(), same = items.filter(e=> new Date(e.ts).toDateString()===k);
        list.appendChild(h(`<div class="hs-day"><span>${dl}</span><small>${same.length} resposta${same.length===1?'':'s'} · ${same.filter(e=>e.correct).length} certa${same.filter(e=>e.correct).length===1?'':'s'}</small></div>`));
      }
      const qtxt = historyQuestionText(entry.ex);
      const row = h(`
        <div class="history-row ${entry.correct?'ok':'bad'}">
          <div class="history-icon">${entry.correct? '✓':'✕'}</div>
          <div class="history-info">
            <div class="history-top">
              <span class="subj">${escHTML(entry.subjectName)}</span>
              ${entry.difficulty? `<span class="ch-diff d-${entry.difficulty}">${diffLabels[entry.difficulty]||entry.difficulty}</span>`:''}
              ${entry.review? `<span class="diff">Revisão</span>`:''}
            </div>
            ${qtxt? `<div class="history-q">${qtxt}</div>` : ''}
            <div class="history-date">${formatHistoryDate(entry.ts).split(', ').pop()}</div>
          </div>
        </div>`);
      list.appendChild(row);
    });
    shown += Math.min(PAGE, items.length-shown);
    moreBtn.style.display = shown < items.length ? '' : 'none';
    if(!items.length) list.appendChild(h(`<div class="ar-empty">Nenhuma resposta aqui.</div>`));
  }
  const paint = ()=>{
    const f = state.historyFilter || 'all';
    chips.querySelectorAll('.ex-chip').forEach(b=> b.classList.toggle('on', b.dataset.f===f));
    items = f==='ok' ? hist.filter(e=>e.correct) : f==='bad' ? hist.filter(e=>!e.correct) : hist;
    shown = 0; lastDay = null; list.innerHTML = '';
    renderPage();
  };
  FILTERS.forEach(f=>{ const b = h(`<button type="button" class="ex-chip" data-f="${f.id}">${f.name}</button>`); b.onclick = ()=>{ state.historyFilter = f.id; paint(); }; chips.appendChild(b); });
  moreBtn.onclick = renderPage;
  paint();

  wrap.appendChild(c);
  return wrap;
}
