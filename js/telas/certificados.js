/* =========================================================
   CERTIFICADOS — um por episódio da trilha concluído
   ========================================================= */
/* ---------------- CERTIFICADOS ----------------
   Cada episódio da trilha concluído (grande final vencida) libera um certificado
   que dá pra imprimir ou salvar em PDF. */
function completedUnits(){
  const done = pathDone(), all = allPathNodes();
  return SUBJECTS.filter(s=>all.filter(n=>n.subject.id===s.id).every(n=>done[n.key]));
}
/* etapas da trilha concluídas num assunto: {done, total} */
function unitProgress(subjectId){
  const done = pathDone(), nodes = allPathNodes().filter(n=>n.subject.id===subjectId);
  return {done: nodes.filter(n=>done[n.key]).length, total: nodes.length};
}
/* as duas versões do certificado: fundo escuro com linhas onduladas e o número do episódio
   grandão em degradê. Sem escolha salva, o Fundamental usa a 1 e o Ensino Médio a 2. */
const CERT_STYLES = [
  {id:'v1', name:'Versão 1 · Amarelo e verde'},
  {id:'v2', name:'Versão 2 · Roxo'},
];
function certStyleFor(s){
  const st = currentSettingsSync().certStyle;
  if(CERT_STYLES.some(x=>x.id===st)) return st;
  const g = subjectGroupOf(s.id);
  return g && g.level==='em' ? 'v2' : 'v1';
}
/* linhas onduladas do fundo (tipo curva de nível), em SVG */
function certWavesSVG(){
  let paths = '';
  for(let i=0;i<26;i++){
    const y0 = -40 + i*26, ph = i*0.55, amp = 26 + 14*Math.sin(i*0.7);
    let d = '';
    for(let x=0;x<=1000;x+=25){
      const y = y0 + amp*Math.sin(x/140 + ph) + 18*Math.sin(x/53 - ph*1.3);
      d += (x? ' L':'M') + x + ' ' + y.toFixed(1);
    }
    paths += `<path d="${d}"/>`;
  }
  for(let i=0;i<34;i++){
    const x0 = -30 + i*32, ph = i*0.4;
    let d = '';
    for(let y=0;y<=710;y+=25){
      const x = x0 + 30*Math.sin(y/120 + ph) + 10*Math.sin(y/41 + ph*2);
      d += (y? ' L':'M') + x.toFixed(1) + ' ' + y;
    }
    paths += `<path d="${d}"/>`;
  }
  return `<svg class="cert-waves" viewBox="0 0 1000 707" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1">${paths}</g></svg>`;
}
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
/* o certificado em si (usado no de verdade e na prévia) */
function certificateEl(s, preview, style){
  style = style || certStyleFor(s);
  const when = new Date();
  const dt = `${when.getDate()} de ${MESES[when.getMonth()]} de ${when.getFullYear()}`;
  const num = SUBJECT_ORDER.indexOf(s.id) + 1 || SUBJECTS.indexOf(s) + 1;
  const g = subjectGroupOf(s.id), lv = g && SUBJECT_LEVELS.find(l=>l.id===g.level);
  const cert = h(`<div class="cert cert-${style} ${preview?'preview':''}">
    <div class="cert-in">
      ${certWavesSVG()}
      <div class="cert-top">
        <div class="cert-brand"><img src="${LOGO_URI}" alt="" class="cert-logo"><span>Matemática Show</span></div>
        <div class="cert-date">${dt}</div>
      </div>
      <div class="cert-num" aria-hidden="true">${num}</div>
      <div class="cert-main">
        <div class="cert-tags"><span class="cert-tag">Certificado</span><span class="cert-k">de conclusão</span></div>
        <div class="cert-name"></div>
        <div class="cert-subj">Episódio ${num} · ${escHTML(s.name)}</div>
        <div class="cert-lvl">${lv ? escHTML(lv.name) : ''}${g ? ` · ${escHTML(g.name)}` : ''}</div>
      </div>
      <div class="cert-bottom">
        <span>Fases fácil, média e difícil concluídas<br>e Grande final vencida.</span>
        <em>Este certificado de progresso em matemática é emitido pelo app Matemática Show.</em>
      </div>
    </div>
    ${preview ? '<div class="cert-ribbon">PRÉVIA</div>' : ''}
  </div>`);
  cert.querySelector('.cert-name').textContent = (currentUser && currentUser.name) || 'Estudante';
  return cert;
}
function certificatesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📜 Certificados', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);
  const units = completedUnits();
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Vença a <b>Grande final</b> de um episódio da Trilha pra ganhar o certificado daquele assunto. Dá pra imprimir ou salvar em PDF.</p>`));
  // prévia: como vai ficar o certificado do próximo assunto a concluir
  const nextS = SUBJECTS.find(s=>!units.includes(s));
  if(nextS){
    const box = h(`<div class="cert-preview-box"><div class="cpb-h"><b>👀 Veja como vai ficar</b><small>Prévia do seu certificado de ${escHTML(nextS.name)}</small></div></div>`);
    const mini = h(`<button type="button" class="cert-mini" aria-label="Ver a prévia em tamanho grande"></button>`);
    mini.appendChild(certificateEl(nextS, true));
    mini.onclick = ()=> go('certificate', {subjectId:nextS.id, certPreview:true});
    box.appendChild(mini);
    c.appendChild(box);
  }
  c.appendChild(h(`<div class="cert-count">${units.length} de ${SUBJECTS.length} certificados conquistados</div>`));
  subjectListGrouped(c, s=>{
    const got = units.includes(s), up = unitProgress(s.id);
    const row = h(`<button class="subject-row ${got?'':'cert-locked'}"><span class="sym">${got?'📜':'🔒'}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${got?'Certificado liberado · toque pra ver':`${up.done} de ${up.total} etapas na Trilha · toque pra ver a prévia`}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=> go('certificate', {subjectId:s.id, certPreview:!got});
    return row;
  });
  wrap.appendChild(c);
  return wrap;
}
function certificateScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const preview = !!state.certPreview || !completedUnits().includes(s);
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(preview ? 'Prévia do certificado' : 'Certificado', true, ()=>go('certificates')));
  const c = h(`<div class="content"></div>`);
  if(preview){
    const up = unitProgress(s.id), left = up.total - up.done;
    c.appendChild(h(`<div class="cert-note">🔒 Esta é uma <b>prévia</b>. Vença a <b>Grande final</b> de ${escHTML(s.name)} na Trilha pra ganhar o certificado de verdade${left>0?` — faltam ${left} etapa${left===1?'':'s'}`:''}.</div>`));
  }
  const picker = h(`<div class="cert-styles" role="group" aria-label="Escolha a versão do certificado"></div>`);
  const holder = h(`<div></div>`);
  const draw = ()=>{
    const cur = certStyleFor(s);
    holder.innerHTML = '';
    holder.appendChild(certificateEl(s, preview, cur));
    picker.querySelectorAll('button').forEach(b=> b.setAttribute('aria-pressed', b.dataset.st===cur));
  };
  CERT_STYLES.forEach(st=>{
    const b = h(`<button type="button" class="cert-style-btn" data-st="${st.id}"><i class="cs-dot cs-${st.id}"></i>${st.name}</button>`);
    b.onclick = async ()=>{ const set = await loadSettings(); set.certStyle = st.id; await saveSettings(); draw(); };
    picker.appendChild(b);
  });
  c.appendChild(picker);
  c.appendChild(holder);
  draw();
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:16px"></div>`);
  if(preview){
    const tr = h(`<button class="btn primary">🗺️ Ir para a Trilha</button>`);
    tr.onclick = ()=> go('path');
    actions.appendChild(tr);
  } else {
    const pr = h(`<button class="btn primary">🖨️ Imprimir / PDF</button>`);
    pr.onclick = ()=> window.print();
    actions.appendChild(pr);
  }
  c.appendChild(actions);
  wrap.appendChild(c);
  return wrap;
}
