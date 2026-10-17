/* =========================================================
   RELATÓRIO SEMANAL — resumo para pais e professores
   ========================================================= */
/* ---------------- RELATÓRIO SEMANAL (para pais e professores) ----------------
   Resume os últimos 7 dias a partir do histórico de respostas e compara com os 7 dias
   anteriores. Dá pra compartilhar como texto ou imprimir / salvar em PDF. */
function reportData(hist, weeksBack){
  const DAY = 864e5, today0 = new Date(); today0.setHours(0,0,0,0);
  if(weeksBack) today0.setTime(today0.getTime() - weeksBack*7*DAY);
  const start = today0.getTime() - 6*DAY, prevStart = start - 7*DAY;
  const endT = today0.getTime() + DAY;
  const cur = hist.filter(e=>e.ts>=start && e.ts<endT), prev = hist.filter(e=>e.ts>=prevStart && e.ts<start);
  const days = [];
  for(let i=0;i<7;i++){
    const t0 = start + i*DAY, t1 = t0 + DAY;
    const list = cur.filter(e=>e.ts>=t0 && e.ts<t1);
    days.push({date:new Date(t0), n:list.length, ok:list.filter(e=>e.correct).length});
  }
  const bySubj = {};
  const add = (e, key)=>{ const b = bySubj[e.subjectId] = bySubj[e.subjectId] || {cur:{n:0,ok:0}, prev:{n:0,ok:0}}; b[key].n++; if(e.correct) b[key].ok++; };
  cur.forEach(e=>add(e,'cur')); prev.forEach(e=>add(e,'prev'));
  const acc = l=> l.length ? Math.round(l.filter(e=>e.correct).length/l.length*100) : null;
  const subjects = Object.keys(bySubj).filter(id=>bySubj[id].cur.n>0).map(id=>{
    const s = SUBJECTS.find(x=>x.id===id), b = bySubj[id];
    return {id, name: s ? s.name : id, sym: s ? s.sym : '', n:b.cur.n, pct:Math.round(b.cur.ok/b.cur.n*100), prevPct: b.prev.n ? Math.round(b.prev.ok/b.prev.n*100) : null};
  }).sort((a,b)=>b.n-a.n);
  // histórico guarda só as últimas HISTORY_LIMIT respostas: se ele começa depois do período anterior, a comparação pode estar incompleta
  const oldest = hist.length ? hist[hist.length-1].ts : Date.now();
  return {start:new Date(start), end:today0, days, cur, prev, subjects,
    activeDays: days.filter(d=>d.n>0).length, total:cur.length, pct:acc(cur), prevTotal:prev.length, prevPct:acc(prev),
    strong: subjects.filter(s=>s.n>=5 && s.pct>=80), weak: subjects.filter(s=>s.n>=3 && s.pct<60),
    partialPrev: hist.length>=HISTORY_LIMIT && oldest>prevStart, hasOlder: hist.some(e=>e.ts<start)};
}
function fmtDM(d){ return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
function reportTip(r){
  if(!r.total) return 'Nenhuma questão respondida nesta semana. Uma boa meta é praticar 10 minutos por dia: pouco, mas todo dia, funciona melhor do que muito de uma vez.';
  const parts = [];
  if(r.activeDays<=2) parts.push(`Estudou em ${r.activeDays} dia${r.activeDays===1?'':'s'}. Praticar um pouco todo dia ajuda mais a fixar do que estudar tudo de uma vez.`);
  else if(r.activeDays>=5) parts.push(`Ótima constância: estudou em ${r.activeDays} dos 7 dias! 👏`);
  if(r.weak.length) parts.push(`Vale reforçar ${r.weak.map(s=>s.name).join(', ')}: releia a explicação em "Aprender" e faça um Treino personalizado só com ${r.weak.length===1?'esse assunto':'esses assuntos'}.`);
  if(r.strong.length) parts.push(`Está indo muito bem em ${r.strong.map(s=>s.name).join(', ')}. Dá pra tentar o nível difícil.`);
  if(!parts.length) parts.push('Bom ritmo! Continue praticando e use a Revisão do dia pra não esquecer o que já aprendeu.');
  return parts.join(' ');
}
function reportText(r){
  const name = currentUser ? currentUser.name : '';
  const g = loadGame(), lv = levelInfo(g.xp);
  const lines = [
    `📊 Matemática Show — relatório semanal${name?` de ${name}`:''}`,
    `Período: ${fmtDM(r.start)} a ${fmtDM(r.end)}`,
    '',
    `• Dias estudados: ${r.activeDays} de 7`,
    `• Questões respondidas: ${r.total}${r.prevTotal?` (semana anterior: ${r.prevTotal})`:''}`,
    `• Acerto: ${r.pct===null?'—':r.pct+'%'}${r.prevPct!==null?` (semana anterior: ${r.prevPct}%)`:''}`,
    `• Nível ${lv.level} · ofensiva de ${gameStreakNow()} dia${gameStreakNow()===1?'':'s'}`,
  ];
  if(r.subjects.length){ lines.push('', 'Por assunto:'); r.subjects.forEach(s=>lines.push(`• ${s.name}: ${s.n} questões, ${s.pct}% de acerto`)); }
  if(r.strong.length) lines.push('', `✅ Pontos fortes: ${r.strong.map(s=>s.name).join(', ')}`);
  if(r.weak.length) lines.push(`⚠️ Precisa de atenção: ${r.weak.map(s=>s.name).join(', ')}`);
  lines.push('', `💡 ${reportTip(r)}`);
  return lines.join('\n');
}
/* selo da semana: resume a semana numa medalha */
function reportBadge(r){
  if(!r.total) return {ico:'😴', t:'Semana parada', d:'Bora voltar a praticar?'};
  if(r.activeDays>=5 && r.pct>=80) return {ico:'🏆', t:'Semana campeã', d:'Muita constância e ótimo acerto!'};
  if(r.activeDays>=4) return {ico:'🔥', t:'Semana constante', d:`Estudou em ${r.activeDays} dos 7 dias`};
  if(r.pct>=80) return {ico:'🎯', t:'Mira certeira', d:`${r.pct}% de acerto`};
  if(r.total>=30) return {ico:'💪', t:'Semana de treino', d:`${r.total} questões respondidas`};
  return {ico:'🌱', t:'Começando bem', d:'Cada questão conta!'};
}
async function reportScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Relatório semanal', true, ()=>go('progress')));
  const c = h(`<div class="content rp-wrap"></div>`);
  const hist = await loadHistory();
  const wb = Math.max(0, state.reportWeek||0);
  const r = reportData(hist, wb);
  const name = currentUser ? currentUser.name : '';
  const g = loadGame(), lv = levelInfo(g.xp);

  const now = new Date();
  const genAt = `${fmtDM(now)}/${now.getFullYear()}`;
  c.appendChild(h(`<div class="rp-print-only rp-print-top"><b>📊 Matemática Show</b><span>Relatório gerado em ${genAt}</span></div>`));

  // trocar de semana
  const nav = h(`<div class="rp-nav rp-actions">
      <button type="button" class="rp-nb" data-d="1" ${r.hasOlder?'':'disabled'} aria-label="Semana anterior">‹</button>
      <div class="rp-nt"><b>${wb===0 ? 'Esta semana' : wb===1 ? 'Semana passada' : `${wb} semanas atrás`}</b><small>${fmtDM(r.start)} a ${fmtDM(r.end)}</small></div>
      <button type="button" class="rp-nb" data-d="-1" ${wb===0?'disabled':''} aria-label="Próxima semana">›</button>
    </div>`);
  nav.querySelectorAll('.rp-nb').forEach(b=> b.onclick = ()=>{ state.reportWeek = Math.max(0, wb + Number(b.dataset.d)); render(); });
  c.appendChild(nav);

  const badge = reportBadge(r);
  const head = h(`<div class="rp-head rp-hero">
      <div class="rph-top"><div><div class="rp-k">Relatório para pais e professores</div><h2></h2><p>${wb===0?'Últimos 7 dias':'Semana'} · ${fmtDM(r.start)} a ${fmtDM(r.end)} · Nível ${lv.level}</p></div>
        <div class="rph-badge"><span>${badge.ico}</span><b>${badge.t}</b><small>${badge.d}</small></div></div>
    </div>`);
  head.querySelector('h2').textContent = name || 'Meu relatório';
  c.appendChild(head);

  const trend = (cur, before, unit)=>{
    if(cur===null || before===null || !r.prevTotal) return '';
    const d = cur - before;
    return `<div class="rp-trend ${d>0?'up':d<0?'down':'same'}">${d>0?'▲':d<0?'▼':'='} ${Math.abs(d)}${unit} vs. semana anterior</div>`;
  };
  const ring = (pct, cls)=> `<div class="rp-ring ${cls||''}" style="--p:${pct||0}"><b>${pct===null?'—':pct+'%'}</b></div>`;
  const grid = h(`<div class="stat-grid rp-stats"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="rp-dots">${r.days.map(d=>`<i class="${d.n?'on':''}"></i>`).join('')}</div><div class="num">${r.activeDays}/7</div><div class="lbl">Dias estudados</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.total}</div><div class="lbl">Questões</div>${trend(r.total, r.prevTotal, '')}</div>`));
  grid.appendChild(h(`<div class="stat-card acc">${ring(r.pct, r.pct===null?'':r.pct>=80?'good':r.pct>=60?'mid':'low')}<div class="lbl">Acerto</div>${trend(r.pct, r.prevPct, ' pts')}</div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🔥 ${gameStreakNow()}</div><div class="lbl">Ofensiva (dias)</div></div>`));
  c.appendChild(grid);

  c.appendChild(h(`<div class="rp-sec">Questões por dia</div>`));
  const max = Math.max(1, ...r.days.map(d=>d.n));
  const WD = ['dom','seg','ter','qua','qui','sex','sáb'];
  const best = r.days.reduce((a,d)=> d.n > (a?a.n:0) ? d : a, null);
  const todayKey = new Date().toDateString();
  const chart = h(`<div class="rp-days" role="img" aria-label="Questões respondidas por dia: ${r.days.map(d=>`${WD[d.date.getDay()]} ${d.n}`).join(', ')}"></div>`);
  r.days.forEach(d=>{
    const hOk = Math.round(d.ok/max*72), hBad = Math.round((d.n-d.ok)/max*72);
    chart.appendChild(h(`<div class="rp-day ${d.n?'':'zero'} ${d.date.toDateString()===todayKey?'today':''} ${best&&d===best?'best':''}" title="${fmtDM(d.date)}: ${d.n} questões, ${d.ok} certas"><span class="n">${d.n||''}</span><span class="stack"><span class="bar bad" style="height:${hBad}%"></span><span class="bar" style="height:${Math.max(d.n?3:0,hOk)}%"></span></span><span class="d">${WD[d.date.getDay()]}</span></div>`));
  });
  c.appendChild(chart);
  c.appendChild(h(`<div class="rp-legend"><span><i class="ok"></i>Certas</span><span><i class="bad"></i>Erradas</span>${best && best.n ? `<span>⭐ Melhor dia: ${WD[best.date.getDay()]} (${best.n})</span>` : ''}</div>`));

  c.appendChild(h(`<div class="rp-sec">Por assunto</div>`));
  if(!r.subjects.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma questão respondida nesta semana.</div>`));
  } else r.subjects.forEach(s=>{
    const cls = s.pct>=80 ? '' : s.pct>=60 ? 'mid' : 'low';
    const tr = s.prevPct===null ? '' : ` <span class="rp-trend ${s.pct>s.prevPct?'up':s.pct<s.prevPct?'down':'same'}" style="display:inline">${s.pct>s.prevPct?'▲':s.pct<s.prevPct?'▼':'='}</span>`;
    const row = h(`<div class="mastery-row"><div class="top"><span class="name">${s.sym} ${escHTML(s.name)}</span><span class="pct">${s.n} q · ${s.pct}%${tr}</span></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${s.pct}%"></div></div></div>`);
    if(s.pct<80){ const b = h(`<button type="button" class="rp-train rp-actions">Treinar</button>`); b.onclick = ()=> startSession(s.id, s.pct<60?'facil':'medio'); row.querySelector('.top .pct').after(b); }
    c.appendChild(row);
  });

  // conquistas ganhas na semana
  const t0 = r.start.getTime(), t1 = r.end.getTime() + 864e5;
  const achs = (typeof ACHIEVEMENTS!=='undefined' ? ACHIEVEMENTS : []).filter(a=> g.ach[a.id] && g.ach[a.id]>=t0 && g.ach[a.id]<t1);
  if(achs.length){
    c.appendChild(h(`<div class="rp-sec">Conquistas da semana</div>`));
    c.appendChild(h(`<div class="rp-achs">${achs.map(a=>`<div class="rp-ach"><span>${a.ico}</span><b>${escHTML(a.name)}</b></div>`).join('')}</div>`));
  }

  if(r.strong.length || r.weak.length){
    c.appendChild(h(`<div class="rp-sec">Destaques</div>`));
    const hl = h(`<div class="rp-hl"></div>`);
    if(r.strong.length) hl.appendChild(h(`<div class="rp-hl-c good"><b>✅ Pontos fortes</b><span>${r.strong.map(s=>`${s.sym} ${escHTML(s.name)}`).join(' · ')}</span></div>`));
    if(r.weak.length) hl.appendChild(h(`<div class="rp-hl-c weak"><b>⚠️ Precisa de atenção</b><span>${r.weak.map(s=>`${s.sym} ${escHTML(s.name)}`).join(' · ')}</span></div>`));
    c.appendChild(hl);
  }
  c.appendChild(h(`<div class="rp-sec">Sugestão</div>`));
  const tip = h(`<div class="rp-tip"></div>`); tip.textContent = '💡 ' + reportTip(r);
  c.appendChild(tip);
  if(r.weak.length){
    const b = h(`<button type="button" class="btn primary rp-actions rp-fix">🎯 Treinar os pontos de atenção</button>`);
    b.onclick = async ()=> startPersonalizedSession({subjectIds:r.weak.map(x=>x.id), difficultyMode:'adaptativa', qty:10, focusWeak:r.weak.length>1, progress: await loadProgress()});
    c.appendChild(b);
  }
  if(r.partialPrev) c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12px; margin-top:10px;">A comparação com a semana anterior pode estar incompleta: o app guarda só as últimas ${HISTORY_LIMIT} respostas.</p>`));

  c.appendChild(h(`<div class="rp-print-only rp-print-foot">Matemática Show · relatório de ${fmtDM(r.start)} a ${fmtDM(r.end)} · gerado em ${genAt}</div>`));
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:18px"></div>`);
  const shareBtn = h(`<button class="btn primary">📤 Compartilhar resumo</button>`);
  shareBtn.onclick = async ()=>{
    const text = reportText(r);
    try{ if(navigator.share){ await navigator.share({title:'Relatório semanal — Matemática Show', text}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); queueToast('📋', 'Resumo copiado!', 'Cole no WhatsApp, e-mail ou onde quiser'); }
    catch(e){ showConfirm({icon:'📋', title:'Copie o resumo', message:text, ok:'Ok', cancel:'Fechar'}); }
  };
  const printBtn = h(`<button class="btn secondary">🖨️ Imprimir / PDF</button>`);
  printBtn.onclick = ()=> printReport(r, {badge, achs, genAt});
  actions.appendChild(shareBtn); actions.appendChild(printBtn);
  c.appendChild(actions);

  wrap.appendChild(c);
  return wrap;
}

/* ---------- impressão / PDF do relatório ----------
   Monta uma folha A4 própria (documento limpo, cabe numa página) em #rp-print e imprime só ela,
   do mesmo jeito que o certificado. */
function reportPrintHTML(r, o){
  const name = currentUser ? currentUser.name : '';
  const lv = levelInfo(loadGame().xp), streak = gameStreakNow();
  const WD = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const delta = (cur, before, unit)=>{
    if(cur===null || before===null || !r.prevTotal) return '<small class="rpp-d same">sem comparação</small>';
    const d = cur - before;
    return `<small class="rpp-d ${d>0?'up':d<0?'down':'same'}">${d>0?'▲':d<0?'▼':'='} ${Math.abs(d)}${unit} vs. semana anterior</small>`;
  };
  // gráfico de barras: certas (verde) embaixo e erradas (vermelho) em cima
  const W = 700, H = 150, base = 122, top = 18, max = Math.max(1, ...r.days.map(d=>d.n));
  const bw = 54, gap = (W - 7*bw) / 7;
  const bars = r.days.map((d,i)=>{
    const x = gap/2 + i*(bw+gap), hOk = d.ok/max*(base-top), hBad = (d.n-d.ok)/max*(base-top);
    return `${d.n ? `<rect x="${x}" y="${base-hOk}" width="${bw}" height="${hOk}" rx="4" fill="#12B886"/>
        <rect x="${x}" y="${base-hOk-hBad}" width="${bw}" height="${hBad}" rx="4" fill="#FF5C7A"/>
        <text x="${x+bw/2}" y="${base-hOk-hBad-6}" text-anchor="middle" class="v">${d.n}</text>`
      : `<rect x="${x}" y="${base-3}" width="${bw}" height="3" rx="1.5" fill="#D9D9E6"/>`}
      <text x="${x+bw/2}" y="${base+16}" text-anchor="middle" class="l">${WD[d.date.getDay()]}</text>
      <text x="${x+bw/2}" y="${base+28}" text-anchor="middle" class="s">${fmtDM(d.date)}</text>`;
  }).join('');
  const chart = `<svg class="rpp-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><line x1="0" y1="${base+.5}" x2="${W}" y2="${base+.5}" stroke="#C9C9D6"/>${bars}</svg>`;
  const rows = r.subjects.map(s=>{
    const st = s.pct>=80 ? ['good','Ótimo'] : s.pct>=60 ? ['mid','Bom'] : ['low','Reforçar'];
    const tr = s.prevPct===null ? '—' : s.pct>s.prevPct ? `<span class="up">▲ ${s.pct-s.prevPct}</span>` : s.pct<s.prevPct ? `<span class="down">▼ ${s.prevPct-s.pct}</span>` : '<span class="same">=</span>';
    return `<tr><td class="nm"><span class="sym">${s.sym}</span>${escHTML(s.name)}</td><td class="c">${s.n}</td>
      <td><div class="rpp-bar"><i class="${st[0]}" style="width:${s.pct}%"></i></div></td><td class="c b">${s.pct}%</td><td class="c">${tr}</td><td class="c"><span class="rpp-tag ${st[0]}">${st[1]}</span></td></tr>`;
  }).join('');
  return `<div class="rpp">
    <header class="rpp-head">
      <div class="rpp-brand"><img src="${LOGO_URI}" alt=""><div><b>Matemática Show</b><small>Relatório semanal de matemática</small></div></div>
      <div class="rpp-meta"><small>Gerado em</small><b>${o.genAt}</b></div>
    </header>
    <section class="rpp-who">
      <div><small>Aluno(a)</small><h1>${escHTML(name || '—')}</h1><p>Período: <b>${fmtDM(r.start)} a ${fmtDM(r.end)}/${r.end.getFullYear()}</b> · Nível <b>${lv.level}</b> (${escHTML(lv.title)})</p></div>
      <div class="rpp-badge"><span>${o.badge.ico}</span><div><b>${o.badge.t}</b><small>${o.badge.d}</small></div></div>
    </section>
    <section class="rpp-kpis">
      <div class="rpp-kpi"><small>Dias estudados</small><b>${r.activeDays}<i>/7</i></b><div class="rpp-dots">${r.days.map(d=>`<span class="${d.n?'on':''}"></span>`).join('')}</div></div>
      <div class="rpp-kpi"><small>Questões respondidas</small><b>${r.total}</b>${delta(r.total, r.prevTotal, '')}</div>
      <div class="rpp-kpi"><small>Acerto</small><b class="${r.pct===null?'':r.pct>=80?'good':r.pct>=60?'mid':'low'}">${r.pct===null?'—':r.pct+'%'}</b>${delta(r.pct, r.prevPct, ' pts')}</div>
      <div class="rpp-kpi"><small>Ofensiva</small><b>${streak}<i> dia${streak===1?'':'s'}</i></b><small class="rpp-d same">seguidos estudando</small></div>
    </section>
    <h2 class="rpp-h">Questões por dia</h2>
    <div class="rpp-box">${chart}<div class="rpp-leg"><span><i style="background:#12B886"></i>Certas</span><span><i style="background:#FF5C7A"></i>Erradas</span></div></div>
    <h2 class="rpp-h">Desempenho por assunto</h2>
    ${r.subjects.length ? `<table class="rpp-tab"><thead><tr><th>Assunto</th><th class="c">Questões</th><th>Acerto</th><th class="c"></th><th class="c">Semana ant.</th><th class="c">Situação</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="rpp-empty">Nenhuma questão respondida nesta semana.</p>'}
    <div class="rpp-cols">
      <div class="rpp-col"><h2 class="rpp-h">Destaques</h2>
        <p><b class="good">✓ Pontos fortes:</b> ${r.strong.length ? r.strong.map(s=>escHTML(s.name)).join(', ') : '—'}</p>
        <p><b class="low">! Precisa de atenção:</b> ${r.weak.length ? r.weak.map(s=>escHTML(s.name)).join(', ') : '—'}</p>
        ${o.achs.length ? `<p><b>🏅 Conquistas da semana:</b> ${o.achs.map(a=>`${a.ico} ${escHTML(a.name)}`).join(', ')}</p>` : ''}
      </div>
      <div class="rpp-col"><h2 class="rpp-h">Sugestão</h2><p>${escHTML(reportTip(r))}</p></div>
    </div>
    ${r.partialPrev ? `<p class="rpp-note">A comparação com a semana anterior pode estar incompleta: o app guarda só as últimas ${HISTORY_LIMIT} respostas.</p>` : ''}
    <footer class="rpp-foot">
      <div class="rpp-sign"><span></span><small>Assinatura do responsável</small></div>
      <div class="rpp-sign"><span></span><small>Assinatura do professor(a)</small></div>
    </footer>
    <div class="rpp-end">Matemática Show · relatório de ${fmtDM(r.start)} a ${fmtDM(r.end)} · gerado em ${o.genAt}</div>
  </div>`;
}
function printReport(r, o){
  document.getElementById('rp-print')?.remove();
  document.getElementById('rp-print-page')?.remove();
  const root = document.createElement('div');
  root.id = 'rp-print';
  root.innerHTML = reportPrintHTML(r, o);
  document.body.appendChild(root);
  const st = document.createElement('style');
  st.id = 'rp-print-page';
  st.textContent = '@page{size:A4 portrait; margin:10mm 12mm;}';
  document.head.appendChild(st);
  document.documentElement.classList.add('rp-printing');
  const done = ()=>{ document.documentElement.classList.remove('rp-printing'); root.remove(); st.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(()=> window.print(), 60); // limpeza só no 'afterprint' (no Android a impressão abre depois)
}
