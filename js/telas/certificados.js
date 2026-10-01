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
/* o certificado em si (usado no de verdade e na prévia) */
function certificateEl(s, preview){
  const g = loadGame(), lv = levelInfo(g.xp);
  const when = new Date(); const dt = `${String(when.getDate()).padStart(2,'0')}/${String(when.getMonth()+1).padStart(2,'0')}/${when.getFullYear()}`;
  const cert = h(`<div class="cert ${preview?'preview':''}">
    <div class="cert-in">
      <img src="${LOGO_URI}" alt="" class="cert-logo">
      <div class="cert-k">Matemática Show</div>
      <h2>Certificado de Conclusão</h2>
      <p>Certificamos que</p>
      <div class="cert-name"></div>
      <p>concluiu com sucesso o episódio</p>
      <div class="cert-subj">${s.sym} ${escHTML(s.name)}</div>
      <p class="cert-small">passando pelas fases fácil, média e difícil e vencendo a Grande final.<br>Nível ${lv.level} · ${escHTML(lv.title)}</p>
      <div class="cert-foot"><span>${dt}</span><span>🎤 Pi, o apresentador</span></div>
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
  c.appendChild(certificateEl(s, preview));
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
