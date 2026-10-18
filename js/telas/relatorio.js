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
/* recado curto: o que está indo bem e o que precisa treinar */
function reportNote(r){
  if(!r.total) return 'Nenhuma questão nesta semana. Que tal 10 minutos por dia?';
  const names = l=> l.slice(0,2).map(s=>s.name).join(' e ');
  const parts = [];
  if(r.strong.length) parts.push(`Indo bem em ${names(r.strong)}.`);
  if(r.weak.length) parts.push(`Precisa treinar ${names(r.weak)}.`);
  if(!parts.length) parts.push(r.pct>=70 ? 'Bom ritmo! Continue praticando.' : 'Continue praticando um pouco todo dia.');
  return parts.join(' ');
}
function reportText(r){
  const name = currentUser ? currentUser.name : '';
  return [
    `📊 Matemática Show — relatório${name?` de ${name}`:''} (${fmtDM(r.start)} a ${fmtDM(r.end)})`,
    `• Dias estudados: ${r.activeDays} de 7`,
    `• Questões: ${r.total}`,
    `• Acerto: ${r.pct===null?'—':r.pct+'%'}`,
    `💬 ${reportNote(r)}`,
  ].join('\n');
}
/* gráfico de barras por dia (certas embaixo, erradas em cima): usado na tela e no PDF */
function reportChartSVG(r){
  const WD = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const W = 420, H = 176, base = 134, top = 22, max = Math.max(1, ...r.days.map(d=>d.n));
  const bw = 38, gap = (W - 7*bw) / 7, today = new Date().toDateString();
  const bars = r.days.map((d,i)=>{
    const x = gap/2 + i*(bw+gap), hOk = d.ok/max*(base-top), hBad = (d.n-d.ok)/max*(base-top);
    const isToday = d.date.toDateString()===today;
    return `${d.n ? `<rect x="${x}" y="${base-hOk}" width="${bw}" height="${hOk}" rx="6" fill="#12B886"/>
        <rect x="${x}" y="${base-hOk-hBad}" width="${bw}" height="${hBad}" rx="6" fill="#FF5C7A"/>
        <text x="${x+bw/2}" y="${base-hOk-hBad-8}" text-anchor="middle" class="v">${d.n}</text>`
      : `<rect x="${x}" y="${base-4}" width="${bw}" height="4" rx="2" class="z"/>`}
      <text x="${x+bw/2}" y="${base+22}" text-anchor="middle" class="l ${isToday?'t':''}">${WD[d.date.getDay()]}</text>
      <text x="${x+bw/2}" y="${base+36}" text-anchor="middle" class="s">${fmtDM(d.date)}</text>`;
  }).join('');
  return `<svg class="rps-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Questões por dia: ${r.days.map(d=>`${WD[d.date.getDay()]} ${d.n}`).join(', ')}">${bars}</svg>
    <div class="rps-leg"><span><i style="background:#12B886"></i>Certas</span><span><i style="background:#FF5C7A"></i>Erradas</span></div>`;
}
function reportNums(r){
  const cls = r.pct===null ? '' : r.pct>=80 ? 'good' : r.pct>=60 ? 'mid' : 'low';
  return `<div class="rps-nums">
      <div class="rps-num"><b>${r.activeDays}<i> de 7</i></b><span>dias estudados</span></div>
      <div class="rps-num"><b>${r.total}</b><span>questões</span></div>
      <div class="rps-num"><b class="${cls}">${r.pct===null?'—':r.pct+'%'}</b><span>de acerto</span></div>
    </div>`;
}
async function reportScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Relatório semanal', true, ()=>go('progress')));
  const c = h(`<div class="content rp-wrap rps"></div>`);
  const hist = await loadHistory();
  const wb = Math.max(0, state.reportWeek||0);
  const r = reportData(hist, wb);
  const name = currentUser ? currentUser.name : '';
  const now = new Date(), genAt = `${fmtDM(now)}/${now.getFullYear()}`;

  // trocar de semana
  const nav = h(`<div class="rp-nav rp-actions">
      <button type="button" class="rp-nb" data-d="1" ${r.hasOlder?'':'disabled'} aria-label="Semana anterior">‹</button>
      <div class="rp-nt"><b>${wb===0 ? 'Esta semana' : wb===1 ? 'Semana passada' : `${wb} semanas atrás`}</b><small>${fmtDM(r.start)} a ${fmtDM(r.end)}</small></div>
      <button type="button" class="rp-nb" data-d="-1" ${wb===0?'disabled':''} aria-label="Próxima semana">›</button>
    </div>`);
  nav.querySelectorAll('.rp-nb').forEach(b=> b.onclick = ()=>{ state.reportWeek = Math.max(0, wb + Number(b.dataset.d)); render(); });
  c.appendChild(nav);

  const card = h(`<div class="rps-card">
      <div class="rps-who"><h2></h2><small>${fmtDM(r.start)} a ${fmtDM(r.end)}</small></div>
      ${reportNums(r)}
      <div class="rps-sec">Questões por dia</div>
      ${reportChartSVG(r)}
      <div class="rps-note">💬 <span></span></div>
    </div>`);
  card.querySelector('h2').textContent = name || 'Meu relatório';
  card.querySelector('.rps-note span').textContent = reportNote(r);
  c.appendChild(card);

  const actions = h(`<div class="cta-row rp-actions" style="margin-top:16px"></div>`);
  const shareBtn = h(`<button class="btn primary">📤 Compartilhar</button>`);
  shareBtn.onclick = async ()=>{
    const text = reportText(r);
    try{ if(navigator.share){ await navigator.share({title:'Relatório semanal — Matemática Show', text}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); queueToast('📋', 'Resumo copiado!', 'Cole no WhatsApp, e-mail ou onde quiser'); }
    catch(e){ showConfirm({icon:'📋', title:'Copie o resumo', message:text, ok:'Ok', cancel:'Fechar'}); }
  };
  const printBtn = h(`<button class="btn secondary">🖨️ Imprimir / PDF</button>`);
  printBtn.onclick = ()=> printReport(r, {genAt});
  actions.appendChild(shareBtn); actions.appendChild(printBtn);
  c.appendChild(actions);

  wrap.appendChild(c);
  return wrap;
}

/* ---------- impressão / PDF do relatório ----------
   Monta uma folha A4 própria em #rp-print e imprime só ela, do mesmo jeito que o certificado. */
function reportPrintHTML(r, o){
  const name = currentUser ? currentUser.name : '';
  return `<div class="rpp">
    <header class="rpp-head">
      <div class="rpp-brand"><img src="${LOGO_URI}" alt=""><div><b>Matemática Show</b><small>Relatório semanal</small></div></div>
      <div class="rpp-meta"><small>Gerado em</small><b>${o.genAt}</b></div>
    </header>
    <section class="rpp-who"><h1>${escHTML(name || '—')}</h1><p>Semana de ${fmtDM(r.start)} a ${fmtDM(r.end)}/${r.end.getFullYear()}</p></section>
    ${reportNums(r)}
    <h2 class="rpp-h">Questões por dia</h2>
    <div class="rpp-box">${reportChartSVG(r)}</div>
    <div class="rps-note rpp-note">💬 ${escHTML(reportNote(r))}</div>
    <div class="rpp-end">Matemática Show · relatório de ${fmtDM(r.start)} a ${fmtDM(r.end)}</div>
  </div>`;
}
function printReport(r, o){
  clearPrintSheets(); // a folha fica até trocar de tela (veja clearPrintSheets)
  const root = document.createElement('div');
  root.id = 'rp-print';
  root.innerHTML = reportPrintHTML(r, o);
  document.body.appendChild(root);
  const st = document.createElement('style');
  st.id = 'rp-print-page';
  // margem zero na folha e a margem vai dentro do .rpp: alguns celulares ignoram a margem do @page
  st.textContent = '@page{size:A4 portrait; margin:0;}';
  document.head.appendChild(st);
  document.documentElement.classList.add('rp-printing');
  setTimeout(()=> window.print(), 60);
}
