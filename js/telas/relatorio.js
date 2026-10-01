/* =========================================================
   RELATÓRIO SEMANAL — resumo para pais e professores
   ========================================================= */
/* ---------------- RELATÓRIO SEMANAL (para pais e professores) ----------------
   Resume os últimos 7 dias a partir do histórico de respostas e compara com os 7 dias
   anteriores. Dá pra compartilhar como texto ou imprimir / salvar em PDF. */
function reportData(hist){
  const DAY = 864e5, today0 = new Date(); today0.setHours(0,0,0,0);
  const start = today0.getTime() - 6*DAY, prevStart = start - 7*DAY;
  const cur = hist.filter(e=>e.ts>=start), prev = hist.filter(e=>e.ts>=prevStart && e.ts<start);
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
    partialPrev: hist.length>=HISTORY_LIMIT && oldest>prevStart};
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
async function reportScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Relatório semanal', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);
  const r = reportData(await loadHistory());
  const name = currentUser ? currentUser.name : '';

  const now = new Date();
  const genAt = `${fmtDM(now)}/${now.getFullYear()}`;
  c.appendChild(h(`<div class="rp-print-only rp-print-top"><b>📊 Matemática Show</b><span>Relatório gerado em ${genAt}</span></div>`));
  const head = h(`<div class="rp-head"><div class="rp-k">Relatório para pais e professores</div><h2></h2><p>Últimos 7 dias · ${fmtDM(r.start)} a ${fmtDM(r.end)}</p></div>`);
  head.querySelector('h2').textContent = name || 'Meu relatório';
  c.appendChild(head);

  const trend = (now, before, unit)=>{
    if(now===null || before===null || !r.prevTotal) return '';
    const d = now - before;
    return `<div class="rp-trend ${d>0?'up':d<0?'down':'same'}">${d>0?'▲':d<0?'▼':'='} ${Math.abs(d)}${unit} vs. semana anterior</div>`;
  };
  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.activeDays}/7</div><div class="lbl">Dias estudados</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.total}</div><div class="lbl">Questões</div>${trend(r.total, r.prevTotal, '')}</div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${r.pct===null?'—':r.pct+'%'}</div><div class="lbl">Acerto</div>${trend(r.pct, r.prevPct, ' pts')}</div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🔥 ${gameStreakNow()}</div><div class="lbl">Ofensiva (dias)</div></div>`));
  c.appendChild(grid);

  c.appendChild(h(`<div class="rp-sec">Questões por dia</div>`));
  const max = Math.max(1, ...r.days.map(d=>d.n));
  const WD = ['dom','seg','ter','qua','qui','sex','sáb'];
  const chart = h(`<div class="rp-days" role="img" aria-label="Questões respondidas por dia: ${r.days.map(d=>`${WD[d.date.getDay()]} ${d.n}`).join(', ')}"></div>`);
  r.days.forEach(d=>{
    chart.appendChild(h(`<div class="rp-day ${d.n?'':'zero'}" title="${fmtDM(d.date)}: ${d.n} questões, ${d.ok} certas"><span class="n">${d.n||''}</span><span class="bar" style="height:${Math.round(d.n/max*72)}%"></span><span class="d">${WD[d.date.getDay()]}</span></div>`));
  });
  c.appendChild(chart);

  c.appendChild(h(`<div class="rp-sec">Por assunto</div>`));
  if(!r.subjects.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma questão respondida nesta semana.</div>`));
  } else r.subjects.forEach(s=>{
    const cls = s.pct>=80 ? '' : s.pct>=60 ? 'mid' : 'low';
    const tr = s.prevPct===null ? '' : ` <span class="rp-trend ${s.pct>s.prevPct?'up':s.pct<s.prevPct?'down':'same'}" style="display:inline">${s.pct>s.prevPct?'▲':s.pct<s.prevPct?'▼':'='}</span>`;
    c.appendChild(h(`<div class="mastery-row"><div class="top"><span class="name">${s.sym} ${escHTML(s.name)}</span><span class="pct">${s.n} q · ${s.pct}%${tr}</span></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${s.pct}%"></div></div></div>`));
  });

  if(r.strong.length || r.weak.length){
    c.appendChild(h(`<div class="rp-sec">Destaques</div>`));
    const ul = h(`<ul class="rp-list"></ul>`);
    if(r.strong.length) ul.appendChild(h(`<li>✅ <b>Pontos fortes:</b> ${r.strong.map(s=>escHTML(s.name)).join(', ')}</li>`));
    if(r.weak.length) ul.appendChild(h(`<li>⚠️ <b>Precisa de atenção:</b> ${r.weak.map(s=>escHTML(s.name)).join(', ')}</li>`));
    c.appendChild(ul);
  }
  c.appendChild(h(`<div class="rp-sec">Sugestão</div>`));
  const tip = h(`<div class="rp-tip"></div>`); tip.textContent = '💡 ' + reportTip(r);
  c.appendChild(tip);
  if(r.partialPrev) c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12px; margin-top:10px;">A comparação com a semana anterior pode estar incompleta: o app guarda só as últimas ${HISTORY_LIMIT} respostas.</p>`));

  c.appendChild(h(`<div class="rp-print-only rp-print-foot">Matemática Show · relatório dos últimos 7 dias (${fmtDM(r.start)} a ${fmtDM(r.end)}) · gerado em ${genAt}</div>`));
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:18px"></div>`);
  const shareBtn = h(`<button class="btn primary">📤 Compartilhar resumo</button>`);
  shareBtn.onclick = async ()=>{
    const text = reportText(r);
    try{ if(navigator.share){ await navigator.share({title:'Relatório semanal — Matemática Show', text}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); queueToast('📋', 'Resumo copiado!', 'Cole no WhatsApp, e-mail ou onde quiser'); }
    catch(e){ showConfirm({icon:'📋', title:'Copie o resumo', message:text, ok:'Ok', cancel:'Fechar'}); }
  };
  const printBtn = h(`<button class="btn secondary">🖨️ Imprimir / PDF</button>`);
  printBtn.onclick = ()=> window.print();
  actions.appendChild(shareBtn); actions.appendChild(printBtn);
  c.appendChild(actions);

  wrap.appendChild(c);
  return wrap;
}
