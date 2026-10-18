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
/* data em que o certificado foi liberado: guardada na 1ª vez que o app vê o episódio concluído
   (certificados antigos, de antes desta data existir, ficam com a data em que foram vistos de novo) */
function certEarnedTs(s){
  const g = loadGame(); g.certDates = g.certDates || {};
  if(!g.certDates[s.id]){ g.certDates[s.id] = Date.now(); saveGame(); }
  return g.certDates[s.id];
}
function syncCertDates(units){
  const g = loadGame(); g.certDates = g.certDates || {}; let ch = false;
  units.forEach(s=>{ if(!g.certDates[s.id]){ g.certDates[s.id] = Date.now(); ch = true; } });
  if(ch) saveGame();
  return g.certDates;
}
function fmtCertDate(ts){ const d = new Date(ts); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; }
/* as versões do certificado (verde, roxo e azul): fundo escuro com linhas onduladas e o número do episódio
   grandão em degradê. Sem escolha salva, o Fundamental usa a 1 e o Ensino Médio a 2. */
const CERT_STYLES = [
  {id:'v1', name:'Versão 1 · Verde'},
  {id:'v2', name:'Versão 2 · Roxo'},
  {id:'v3', name:'Versão 3 · Azul'},
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
/* selo redondo: borda serrilhada, logo no meio e o texto em volta, letra por letra.
   Vai como imagem (<img> com o SVG dentro): desenhado direto na página, o navegador some com as
   letrinhas quando o certificado é reduzido na tela. Por ser imagem, as cores vêm prontas por versão. */
const CERT_SEAL_COLORS = {v1:['#2FD68A','#F2C14E','#12392A'], v2:['#A77BFF','#E2D2FF','#2C2148'], v3:['#4FA8FF','#CFE6FF','#162C4D']};
function certSealSVG(style){
  const [acc, acc2, ring] = CERT_SEAL_COLORS[style] || CERT_SEAL_COLORS.v1;
  const txt = '★ MATEMÁTICA SHOW ★ EPISÓDIO CONCLUÍDO ', n = txt.length, rr = 42;
  let letters = '';
  [...txt].forEach((ch,i)=>{
    if(ch===' ') return;
    const ang = i/n*360 - 90, rad = ang*Math.PI/180, x = 60 + rr*Math.cos(rad), y = 60 + rr*Math.sin(rad);
    letters += `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" transform="rotate(${(ang+90).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" text-anchor="middle" dominant-baseline="central">${ch}</text>`;
  });
  const teeth = [];
  for(let i=0;i<60;i++){ const a2 = i/60*Math.PI*2, r2 = i%2 ? 55 : 59; teeth.push(`${(60+r2*Math.cos(a2)).toFixed(1)},${(60+r2*Math.sin(a2)).toFixed(1)}`); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
    <polygon points="${teeth.join(' ')}" fill="${acc2}"/>
    <circle cx="60" cy="60" r="51" fill="${ring}" stroke="${acc2}" stroke-opacity=".7" stroke-width="1"/>
    <g font-family="Inter, Arial, Helvetica, sans-serif" font-weight="800" font-size="7.2" fill="${acc2}">${letters}</g>
    <circle cx="60" cy="60" r="33" fill="#0b0b10" stroke="${acc}" stroke-width="1.5"/>
  </svg>`;
  // o logo vai por cima, fora da imagem (imagem dentro de imagem SVG não carrega)
  return `<span class="cert-seal"><img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"><img class="cert-seal-logo" alt="" src="${LOGO_URI}"></span>`;
}
/* alguns símbolos de matemática bem clarinhos no fundo, só nos espaços vazios
   (texto, posição x/y e tamanho em cqw, giro em graus) */
const CERT_SYMS = [
  ['π', 47, 12.5, 4.2, -12], ['√', 62, 9, 3.4, 8], ['∑', 88.5, 9.5, 3.2, -6],
  ['÷', 57, 33, 2.8, 10], ['∞', 40, 47, 3.6, -8], ['x²', 64, 46, 2.9, 6],
  ['Δ', 9.5, 41.5, 2.6, -10], ['%', 52.5, 62, 2.6, 12], ['=', 31.5, 7.8, 2.6, 0],
];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
/* o certificado em si (usado no de verdade e na prévia) */
function certificateEl(s, preview, style){
  style = style || certStyleFor(s);
  const dt = fmtCertDate(preview ? Date.now() : certEarnedTs(s));
  const num = SUBJECT_ORDER.indexOf(s.id) + 1 || SUBJECTS.indexOf(s) + 1;
  const g = subjectGroupOf(s.id), lv = g && SUBJECT_LEVELS.find(l=>l.id===g.level);
  const cert = h(`<div class="cert cert-${style} ${preview?'preview':''}">
    <div class="cert-in">
      ${certWavesSVG()}
      <div class="cert-glow" aria-hidden="true"></div>
      <div class="cert-syms" aria-hidden="true">${CERT_SYMS.map(([t,x,y,sz,r])=>`<span style="left:${x}cqw;top:${y}cqw;font-size:${sz}cqw;transform:rotate(${r}deg)">${t}</span>`).join('')}</div>
      <div class="cert-frame" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
      <div class="cert-top">
        <div class="cert-brand"><img src="${LOGO_URI}" alt="" class="cert-logo"><span>Matemática Show</span></div>
        <div class="cert-date">${dt}</div>
      </div>
      <div class="cert-num-wrap ${num>=10?'two':''}" aria-hidden="true"><span class="cert-num-l">Episódio</span><div class="cert-num">${num}</div></div>
      <div class="cert-main">
        <div class="cert-title">Certificado</div><div class="cert-k"><span>de conclusão</span><i></i></div>
        <div class="cert-to">concedido a</div>
        <div class="cert-name"></div>
        <div class="cert-bar" aria-hidden="true"></div>
        <div class="cert-subj">por concluir o <b>Episódio ${num} · ${escHTML(s.name)}</b></div>
        <div class="cert-lvl">${lv ? escHTML(lv.name) : ''}${g ? ` · ${escHTML(g.name)}` : ''}</div>
        <div class="cert-steps"><span>✓ Fase fácil</span><span>✓ Fase média</span><span>✓ Fase difícil</span><span class="gf">🏆 Grande final</span></div>
      </div>
      <div class="cert-bottom">
        ${certSealSVG(style)}
        <div class="cert-feat"><b>Episódio concluído</b>Todas as fases da Trilha vencidas<br>no app Matemática Show.</div>
        <div class="cert-sign"><span class="cert-sig">Matemática Show</span><span class="cert-sig-l">Emitido pelo app Matemática Show</span></div>
      </div>
    </div>
    ${preview ? '<div class="cert-ribbon">PRÉVIA</div>' : ''}
  </div>`);
  cert.querySelector('.cert-name').textContent = (currentUser && currentUser.name) || 'Estudante';
  return cert;
}
/* mostra o certificado na tela: ele é desenhado sempre com 1000px de largura e reduzido por inteiro
   (transform), em vez de encolher as letras — no Android, letra muito pequena é aumentada pelo
   navegador e o texto encavalava nas miniaturas */
function certFit(cert){
  const box = document.createElement('div');
  box.className = 'cert-fit';
  box.appendChild(cert);
  const fit = ()=>{ const w = box.clientWidth; if(w) box.style.setProperty('--cs', w/1000); };
  if(window.ResizeObserver) new ResizeObserver(fit).observe(box);
  requestAnimationFrame(fit);
  return box;
}
function certificatesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📜 Certificados', true, ()=>go('progress')));
  const c = h(`<div class="content ct-screen"></div>`);
  const units = completedUnits(), dates = syncCertDates(units);
  const total = SUBJECTS.length, got = units.length;
  const R = 36, C = 2*Math.PI*R;
  const lvCount = SUBJECT_LEVELS.map(l=>{ const ids = levelIds(l.id).filter(id=>SUBJECTS.some(s=>s.id===id)); return {l, n:ids.length, got:units.filter(s=>ids.includes(s.id)).length}; });

  // topo: coleção
  c.appendChild(h(`<div class="ct-hero">
    <div class="ct-hero-top">
      <div class="ct-ring" aria-label="${got} de ${total} certificados">
        <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" class="bg"/><circle cx="42" cy="42" r="${R}" class="fg" ${got?'':'style="opacity:0"'} stroke-dasharray="${C}" stroke-dashoffset="${C*(1-got/total)}"/></svg>
        <div class="ct-ring-in">📜<b>${got}<small>/${total}</small></b></div>
      </div>
      <div class="ct-hero-t">
        <small class="ct-kicker">SUA COLEÇÃO</small>
        <h2>${got ? `${got} certificado${got===1?'':'s'} conquistado${got===1?'':'s'}` : 'Seu 1º certificado te espera'}</h2>
        <p>Vença a <b>Grande final</b> de um episódio da Trilha e ganhe o certificado do assunto, pronto pra imprimir ou salvar em PDF.</p>
      </div>
    </div>
    <div class="ct-levels">${lvCount.map(x=>`<div><span>${x.l.ico} ${x.l.name.replace(/^Ensino /,'')}</span><b>${x.got}/${x.n}</b><i><em style="width:${x.n ? x.got/x.n*100 : 0}%"></em></i></div>`).join('')}</div>
  </div>`));

  // quase lá: assunto começado mais perto do fim
  const cand = SUBJECTS.filter(s=>!units.includes(s)).map(s=>({s, up:unitProgress(s.id)})).filter(x=>x.up.total && x.up.done>0).sort((a,b)=> b.up.done/b.up.total - a.up.done/a.up.total);
  const near = cand[0] || (()=>{ const s = SUBJECTS.find(x=>!units.includes(x)); return s ? {s, up:unitProgress(s.id)} : null; })();
  if(near){
    const left = near.up.total - near.up.done;
    const card = h(`<div class="ct-near">
      <div class="ct-near-h"><span class="ar-sym">${near.s.sym}</span><div><small>${near.up.done ? 'QUASE LÁ · PRÓXIMO CERTIFICADO' : 'COMECE POR AQUI'}</small><b>${escHTML(near.s.name)}</b><span>${left} etapa${left===1?'':'s'} na Trilha até o certificado</span></div></div>
      <div class="ct-pbar"><i style="width:${near.up.total ? near.up.done/near.up.total*100 : 0}%"></i></div>
      <div class="ct-near-b"><button type="button" class="ct-btn ghost" data-a="prev">👀 Ver prévia</button><button type="button" class="ct-btn" data-a="go">🗺️ Ir para a Trilha</button></div>
    </div>`);
    card.querySelector('[data-a=prev]').onclick = ()=> go('certificate', {subjectId:near.s.id, certPreview:true});
    card.querySelector('[data-a=go]').onclick = ()=> go('path');
    c.appendChild(card);
  }

  // galeria dos conquistados
  if(got){
    c.appendChild(h(`<h3 class="ar-label">Meus certificados</h3>`));
    const gal = h(`<div class="ct-gallery"></div>`);
    units.slice().sort((a,b)=> (dates[b.id]||0)-(dates[a.id]||0)).forEach(s=>{
      const it = h(`<button type="button" class="ct-item" aria-label="Abrir o certificado de ${escHTML(s.name)}"><div class="ct-thumb"></div><b>${escHTML(s.name)}</b><small>✓ ${new Date(dates[s.id]).toLocaleDateString('pt-BR')}</small></button>`);
      it.querySelector('.ct-thumb').appendChild(certFit(certificateEl(s, false)));
      it.onclick = ()=> go('certificate', {subjectId:s.id, certPreview:false});
      gal.appendChild(it);
    });
    c.appendChild(gal);
  } else {
    const nextS = near ? near.s : SUBJECTS[0];
    const box = h(`<div class="cert-preview-box"><div class="cpb-h"><b>👀 Veja como vai ficar</b><small>Prévia do seu certificado de ${escHTML(nextS.name)}</small></div></div>`);
    const mini = h(`<button type="button" class="cert-mini" aria-label="Ver a prévia em tamanho grande"></button>`);
    mini.appendChild(certFit(certificateEl(nextS, true)));
    mini.onclick = ()=> go('certificate', {subjectId:nextS.id, certPreview:true});
    box.appendChild(mini);
    c.appendChild(box);
  }

  // todos os assuntos, com filtro
  c.appendChild(h(`<h3 class="ar-label">Todos os assuntos</h3>`));
  const FILTERS = [
    {id:'all', name:'Todos', ids:()=>null},
    {id:'going', name:'🗺️ Em andamento', ids:()=> SUBJECTS.filter(s=>!units.includes(s) && unitProgress(s.id).done>0).map(s=>s.id)},
    {id:'got', name:'📜 Conquistados', ids:()=> units.map(s=>s.id)},
    {id:'lock', name:'🔒 Não começados', ids:()=> SUBJECTS.filter(s=>!units.includes(s) && !unitProgress(s.id).done).map(s=>s.id)},
  ];
  const chips = h(`<div class="ex-chips small ct-filter"></div>`);
  const list = h(`<div class="ct-list"></div>`);
  const paint = ()=>{
    const f = FILTERS.find(x=>x.id===state.certFilter) || FILTERS[0];
    chips.querySelectorAll('.ex-chip').forEach(b=> b.classList.toggle('on', b.dataset.f===f.id));
    list.innerHTML = '';
    const only = f.ids();
    if(only && !only.length){ list.appendChild(h(`<div class="ar-empty">${f.id==='got' ? '📜 Nenhum certificado ainda. Vença a Grande final de um episódio!' : f.id==='going' ? '🗺️ Nenhum episódio começado. Vá para a Trilha!' : '🎉 Você já começou todos os assuntos!'}</div>`)); return; }
    subjectListGrouped(list, s=>{
      const ok = units.includes(s), up = unitProgress(s.id), pct = up.total ? Math.round(up.done/up.total*100) : 0;
      const row = h(`<button type="button" class="ct-row ${ok?'got':up.done?'going':'lock'}">
        <span class="ct-row-ico">${ok?'📜':up.done?s.sym:'🔒'}</span>
        <span class="ct-row-t"><b>${escHTML(s.name)}</b>
          ${ok ? `<small class="ct-ok">✓ Conquistado em ${new Date(dates[s.id]).toLocaleDateString('pt-BR')}</small>`
               : `<span class="ct-rbar"><i style="width:${pct}%"></i></span><small>${up.done} de ${up.total} etapas na Trilha · ver prévia</small>`}</span>
        <span class="chev">›</span></button>`);
      row.onclick = ()=> go('certificate', {subjectId:s.id, certPreview:!ok});
      return row;
    }, only || undefined);
  };
  FILTERS.forEach(f=>{ const b = h(`<button type="button" class="ex-chip" data-f="${f.id}">${f.name}</button>`); b.onclick = ()=>{ state.certFilter = f.id; paint(); }; chips.appendChild(b); });
  c.appendChild(chips); c.appendChild(list); paint();

  wrap.appendChild(c);
  return wrap;
}
function certificateScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const units = completedUnits();
  const preview = !!state.certPreview || !units.includes(s);
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(preview ? '👀 Prévia do certificado' : '📜 Certificado', true, ()=>go('certificates')));
  const c = h(`<div class="content ct-one"></div>`);

  // status
  if(preview){
    const up = unitProgress(s.id), left = up.total - up.done;
    const st = h(`<div class="ct-status lock">
      <span class="ct-st-ico">🔒</span>
      <div class="ct-st-t"><b>Prévia · ${escHTML(s.name)}</b><span>Vença a <b>Grande final</b> na Trilha pra ganhar este certificado${left>0?` · falta${left===1?'':'m'} ${left} etapa${left===1?'':'s'}`:''}.</span>
        <div class="ct-pbar"><i style="width:${up.total ? up.done/up.total*100 : 0}%"></i></div><small>${up.done} de ${up.total} etapas</small></div>
    </div>`);
    c.appendChild(st);
  } else {
    c.appendChild(h(`<div class="ct-status ok">
      <span class="ct-st-ico">🏆</span>
      <div class="ct-st-t"><b>Parabéns! Certificado conquistado</b><span>${escHTML(s.name)} · em ${fmtCertDate(certEarnedTs(s))}</span></div>
    </div>`));
  }

  // versões
  c.appendChild(h(`<div class="ct-lbl">Escolha a versão</div>`));
  const picker = h(`<div class="cert-styles ct-styles" role="group" aria-label="Escolha a versão do certificado"></div>`);
  const holder = h(`<div class="ct-holder"></div>`);
  const draw = ()=>{
    const cur = certStyleFor(s);
    holder.innerHTML = '';
    holder.appendChild(certFit(certificateEl(s, preview, cur)));
    picker.querySelectorAll('button').forEach(b=> b.setAttribute('aria-pressed', b.dataset.st===cur));
  };
  CERT_STYLES.forEach(st=>{
    const b = h(`<button type="button" class="cert-style-btn ct-sw" data-st="${st.id}"><i class="cs-dot cs-${st.id}"></i><span>${st.name}</span><em>✓</em></button>`);
    b.onclick = async ()=>{ const set = await loadSettings(); set.certStyle = st.id; await saveSettings(); draw(); };
    picker.appendChild(b);
  });
  c.appendChild(picker);
  c.appendChild(holder);
  draw();

  // ações
  const actions = h(`<div class="ct-actions"></div>`);
  if(preview){
    const tr = h(`<button type="button" class="ct-btn big">🗺️ Ir para a Trilha</button>`);
    tr.onclick = ()=> go('path');
    actions.appendChild(tr);
  } else {
    const pr = h(`<button type="button" class="ct-btn big">🖨️ Imprimir ou salvar em PDF</button>`);
    pr.onclick = ()=>{ const el = holder.querySelector('.cert'); if(el) printCertificate(el); };
    actions.appendChild(pr);
    const txt = `🏆 Ganhei o certificado de ${s.name} no Matemática Show!`;
    const sh = h(`<button type="button" class="ct-btn ghost">📣 Compartilhar a conquista</button>`);
    sh.onclick = async ()=>{
      if(navigator.share){ try{ await navigator.share({title:'Matemática Show', text:txt}); }catch(e){} return; }
      try{ await navigator.clipboard.writeText(txt); showFloat('📋 Texto copiado!'); }catch(e){ showFloat('Não deu pra copiar'); }
    };
    actions.appendChild(sh);
    actions.appendChild(h(`<p class="ct-tip">💡 Na tela de impressão, escolha <b>Salvar como PDF</b> pra guardar o arquivo, ou a sua impressora. O certificado sai inteiro numa folha deitada.</p>`));
  }
  c.appendChild(actions);

  // navegar entre os conquistados
  if(!preview && units.length>1){
    const i = units.indexOf(s), prev = units[(i-1+units.length)%units.length], next = units[(i+1)%units.length];
    const nav = h(`<div class="ct-nav"><button type="button" data-d="-1">‹ ${escHTML(prev.name)}</button><span>${i+1} de ${units.length}</span><button type="button" data-d="1">${escHTML(next.name)} ›</button></div>`);
    nav.querySelector('[data-d="-1"]').onclick = ()=> go('certificate', {subjectId:prev.id, certPreview:false});
    nav.querySelector('[data-d="1"]').onclick = ()=> go('certificate', {subjectId:next.id, certPreview:false});
    c.appendChild(nav);
  }
  wrap.appendChild(c);
  return wrap;
}

/* imprime só o certificado, numa folha só.
   Copia o certificado pra uma área própria (#cert-print) e pede folha A4 deitada.
   O tamanho na folha é em mm (veja o CSS "impressão do certificado"): nunca corta nem gira. */
function printCertificate(certEl){
  document.getElementById('cert-print')?.remove();
  document.getElementById('cert-print-page')?.remove();
  const root = document.createElement('div');
  root.id = 'cert-print';
  root.appendChild(certEl.cloneNode(true));
  document.body.appendChild(root);
  const st = document.createElement('style');
  st.id = 'cert-print-page';
  st.textContent = '@page{size:A4 landscape; margin:0;}';
  document.head.appendChild(st);
  document.documentElement.classList.add('cert-printing');
  const done = ()=>{ document.documentElement.classList.remove('cert-printing'); root.remove(); st.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  // a limpeza só acontece no 'afterprint' (no Android a janela de impressão abre depois do print() voltar);
  // fora da impressão o #cert-print fica escondido, então não atrapalha a tela
  setTimeout(()=> window.print(), 60);
}

