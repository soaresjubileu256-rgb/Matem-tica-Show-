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
function certificatesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📜 Certificados', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);
  const units = completedUnits();
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Vença a <b>Grande final</b> de um episódio da Trilha pra ganhar o certificado daquele assunto. Dá pra imprimir ou salvar em PDF.</p>`));
  SUBJECTS.forEach(s=>{
    const got = units.includes(s);
    const row = h(`<button class="subject-row" ${got?'':'disabled style="opacity:.5"'}><span class="sym">${got?'📜':'🔒'}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${got?'Certificado liberado · toque pra ver':'Complete o episódio na Trilha'}</span></span><span class="chev">›</span></button>`);
    if(got) row.onclick = ()=> go('certificate', {subjectId:s.id});
    c.appendChild(row);
  });
  wrap.appendChild(c);
  return wrap;
}
function certificateScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Certificado', true, ()=>go('certificates')));
  const c = h(`<div class="content"></div>`);
  const name = currentUser ? currentUser.name : '';
  const g = loadGame();
  const when = new Date(); const dt = `${String(when.getDate()).padStart(2,'0')}/${String(when.getMonth()+1).padStart(2,'0')}/${when.getFullYear()}`;
  const cert = h(`<div class="cert">
    <div class="cert-in">
      <img src="${LOGO_URI}" alt="" class="cert-logo">
      <div class="cert-k">Matemática Show</div>
      <h2>Certificado de Conclusão</h2>
      <p>Certificamos que</p>
      <div class="cert-name"></div>
      <p>concluiu com sucesso o episódio</p>
      <div class="cert-subj">${s.sym} ${escHTML(s.name)}</div>
      <p class="cert-small">passando pelas fases fácil, média e difícil e vencendo a Grande final.<br>Nível ${levelInfo(g.xp).level} · ${escHTML(levelInfo(g.xp).title)}</p>
      <div class="cert-foot"><span>${dt}</span><span>🎤 Pi, o apresentador</span></div>
    </div>
  </div>`);
  cert.querySelector('.cert-name').textContent = name || 'Estudante';
  c.appendChild(cert);
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:16px"></div>`);
  const pr = h(`<button class="btn primary">🖨️ Imprimir / PDF</button>`);
  pr.onclick = ()=> window.print();
  actions.appendChild(pr);
  c.appendChild(actions);
  wrap.appendChild(c);
  return wrap;
}
