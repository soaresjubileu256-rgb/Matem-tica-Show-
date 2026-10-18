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
/* as versões do certificado: preto com dourado (padrão), preto com prata e azul-marinho com dourado.
   Mesmo desenho nas três: faixas nos cantos, moldura fina, "CERTIFICADO" em letras clássicas,
   medalha com fita à direita, assinatura e o selo do nível embaixo. */
const CERT_STYLES = [
  {id:'v1', name:'Preto e ouro'},
  {id:'v2', name:'Preto e prata'},
  {id:'v3', name:'Azul e ouro'},
];
function certStyleFor(s){
  const st = currentSettingsSync().certStyle;
  return CERT_STYLES.some(x=>x.id===st) ? st : 'v1';
}
let _certSeq = 0;
/* degradê dourado (ou prateado) dentro de cada desenho */
function certGradDefs(gid){
  return `<defs><linearGradient id="${gid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="g1"/><stop offset=".45" class="g2"/><stop offset=".7" class="g3"/><stop offset="1" class="g4"/></linearGradient>
    <radialGradient id="${gid}d" cx="50%" cy="40%" r="60%"><stop offset="0" class="g3"/><stop offset="1" class="g4"/></radialGradient></defs>`;
}
/* faixas diagonais nos cantos (em cima à esquerda e embaixo à direita) */
function certCornersSVG(gid){
  gid += 'c';
  return `<svg class="cert-corners" viewBox="0 0 1000 707" preserveAspectRatio="none" aria-hidden="true">${certGradDefs(gid)}
    <polygon points="0,0 230,0 0,150" fill="#000" opacity=".55"/>
    <polygon points="0,118 182,0 214,0 0,140" fill="url(#${gid}g)"/>
    <polygon points="0,150 244,0 252,0 0,156" fill="url(#${gid}g)" opacity=".6"/>
    <polygon points="1000,707 820,707 1000,600" fill="#000" opacity=".6"/>
    <polygon points="1000,628 1000,650 878,707 836,707" fill="url(#${gid}g)"/>
    <polygon points="1000,596 1000,602 786,707 774,707" fill="url(#${gid}g)" opacity=".55"/>
  </svg>`;
}
/* a medalha: roseta com louros, o M do show com capelo, e as duas pontas da fita */
function certMedalSVG(gid){
  gid += 'm';
  const R = 78, r = 70, pts = [];
  for(let i=0;i<48;i++){ const a = i/48*Math.PI*2, rr = i%2 ? r : R; pts.push(`${(100+rr*Math.cos(a)).toFixed(1)},${(100+rr*Math.sin(a)).toFixed(1)}`); }
  let laurel = '';
  [-1,1].forEach(side=>{
    for(let k=0;k<7;k++){
      const a = (200 - k*17) * Math.PI/180, x = 100 + side*46*Math.cos(a)*-1, y = 104 - 46*Math.sin(a)*-1;
      const rot = side>0 ? (k*17 - 20) : (20 - k*17);
      laurel += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.2" ry="7.5" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#${gid}g)"/>`;
    }
  });
  return `<svg class="cert-medal" viewBox="0 0 200 300" aria-hidden="true">${certGradDefs(gid)}
    <path d="M62 150 L40 285 L66 262 L84 292 L100 168 Z" fill="#111" stroke="url(#${gid}g)" stroke-width="2.5"/>
    <path d="M138 150 L160 285 L134 262 L116 292 L100 168 Z" fill="#161616" stroke="url(#${gid}g)" stroke-width="2.5"/>
    <polygon points="${pts.join(' ')}" fill="url(#${gid}g)"/>
    <circle cx="100" cy="100" r="64" fill="url(#${gid}d)"/>
    <circle cx="100" cy="100" r="58" fill="#0d0d0f" stroke="url(#${gid}g)" stroke-width="3"/>
    <circle cx="100" cy="100" r="52" fill="none" stroke="url(#${gid}g)" stroke-width=".8" opacity=".7"/>
    ${laurel}
    <path d="M100 68 L124 77 L100 86 L76 77 Z" fill="url(#${gid}g)"/><path d="M86 81 v7 q14 7 28 0 v-7 l-14 5 Z" fill="url(#${gid}g)"/><path d="M121 78 v11" stroke="url(#${gid}g)" stroke-width="1.6"/><circle cx="121" cy="91" r="2" fill="url(#${gid}g)"/>
    <text x="100" y="128" text-anchor="middle" class="cert-medal-m" fill="url(#${gid}g)">M</text>
    <path d="M100 136 l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9 -2.7 -4.9 2.7 1.1 -5.3 -4 -3.7 5.4 -.6 Z" fill="url(#${gid}g)"/>
  </svg>`;
}
/* selinho do nível (canto de baixo) */
function certBadgeSVG(gid){
  gid += 'b';
  let teeth = '';
  for(let i=0;i<36;i++){ const a = i/36*Math.PI*2; teeth += `<circle cx="${(50+44*Math.cos(a)).toFixed(1)}" cy="${(50+44*Math.sin(a)).toFixed(1)}" r="3.4" fill="url(#${gid}g)"/>`; }
  return `<svg class="cert-badge" viewBox="0 0 100 100" aria-hidden="true">${certGradDefs(gid)}${teeth}
    <circle cx="50" cy="50" r="43" fill="#0d0d0f" stroke="url(#${gid}g)" stroke-width="2"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="url(#${gid}g)" stroke-width=".8"/>
    <path d="M50 36 L72 45 L50 54 L28 45 Z" fill="url(#${gid}g)"/><path d="M37 49 v8 q13 7 26 0 v-8 l-13 5 Z" fill="url(#${gid}g)"/><path d="M69 46 v10" stroke="url(#${gid}g)" stroke-width="1.6"/></svg>`;
}
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
/* o certificado em si (usado no de verdade e na prévia) */
function certificateEl(s, preview, style){
  style = style || certStyleFor(s);
  const dt = fmtCertDate(preview ? Date.now() : certEarnedTs(s));
  const num = SUBJECT_ORDER.indexOf(s.id) + 1 || SUBJECTS.indexOf(s) + 1;
  const g = subjectGroupOf(s.id), lv = g && SUBJECT_LEVELS.find(l=>l.id===g.level);
  const gid = 'crt' + (++_certSeq);
  const name = (currentUser && currentUser.name) || 'Estudante';
  const nameCls = name.length > 30 ? 'xs' : name.length > 20 ? 'sm' : '';
  const levelTxt = lv ? `do ${escHTML(lv.name)}${g ? ` · ${escHTML(g.name)}` : ''}, ` : '';
  const cert = h(`<div class="cert cert-${style} ${preview?'preview':''}">
    <div class="cert-in">
      ${certCornersSVG(gid)}
      <div class="cert-frame" aria-hidden="true"></div>
      <div class="cert-ribbon-v" aria-hidden="true"></div>
      <div class="cert-medal-wrap">${certMedalSVG(gid)}</div>
      <div class="cert-top">
        <img src="${LOGO_URI}" alt="" class="cert-logo">
        <div><div class="cert-brand">Matemática Show</div><div class="cert-slogan">Aprender também é uma vitória</div></div>
      </div>
      <div class="cert-date">${dt}</div>
      <div class="cert-main">
        <div class="cert-title">Certificado</div>
        <div class="cert-k"><i></i><span>de conclusão</span><i></i></div>
        <div class="cert-to">Certificamos que</div>
        <div class="cert-name ${nameCls}"></div>
        <p class="cert-subj">concluiu com êxito o <b>Episódio ${num} · ${escHTML(s.name)}</b> ${levelTxt}promovido pelo <em>Matemática Show</em>.</p>
        <p class="cert-msg">Seu esforço, dedicação e compromisso com o aprendizado fazem toda a diferença. Continue assim!</p>
      </div>
      <div class="cert-motto">Matemática<br>é mais que números,<br>é conquista.</div>
      <div class="cert-sign"><span class="cert-sig">Matemática Show</span><span class="cert-sig-n">Matemática Show</span><span class="cert-sig-l">Emitido pelo app Matemática Show</span></div>
      <div class="cert-lvl">${certBadgeSVG(gid)}<div><b>${lv ? escHTML(lv.name) : 'Matemática Show'}</b><span>${g ? escHTML(g.name) : ''}</span></div></div>
    </div>
    ${preview ? '<div class="cert-ribbon">PRÉVIA</div>' : ''}
  </div>`);
  cert.querySelector('.cert-name').textContent = name;
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
  const copy = certEl.cloneNode(true);
  // a cópia ganha ids novos nos degradês: com o mesmo id, ela pintaria com os do original, que some na impressão
  copy.querySelectorAll('[id]').forEach(el=>{
    const old = el.id, nu = old + 'p';
    el.id = nu;
    copy.querySelectorAll('[fill], [stroke]').forEach(n=>{
      ['fill','stroke'].forEach(a=>{ if(n.getAttribute(a)===`url(#${old})`) n.setAttribute(a, `url(#${nu})`); });
    });
  });
  root.appendChild(copy);
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

