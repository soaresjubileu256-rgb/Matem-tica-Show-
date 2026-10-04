/* =========================================================
   TELA PERFIL
      Nome, nível e números da conta + menu: nivelamento, plano de estudos, ajuda,
      configurações e sair.
   ========================================================= */
/* janelinha pra escolher o avatar: emoji (ou a inicial) e a cor */
function showAvatarSheet(onDone){
  const g = loadGame(), cur = Object.assign({emo:'', c:-1}, g.avatar||{});
  const ini = (currentUser && currentUser.name) ? escHTML(currentUser.name.trim().charAt(0).toUpperCase()) : '?';
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="gm-modal pf-sheet" role="dialog" aria-label="Escolher avatar">
      <div class="pf-sheet-prev"><span class="pf-av big"></span><div><h2>Seu avatar</h2><p>Escolha um bichinho ou símbolo e a cor. Ele aparece no Perfil, no Início e na tela de entrada.</p></div></div>
      <div class="pf-sl">Rosto</div>
      <div class="pf-emos"><button type="button" data-e="" class="ini">${ini}</button>${AV_EMOJIS.map(e=>`<button type="button" data-e="${e}">${e}</button>`).join('')}</div>
      <div class="pf-sl">Cor</div>
      <div class="pf-colors">${AV_GRADS.map(([x,y],i)=>`<button type="button" data-c="${i}" style="background:linear-gradient(135deg,${x},${y})" aria-label="Cor ${i+1}"></button>`).join('')}</div>
      <button type="button" class="pf-save">Salvar avatar</button>
      <button type="button" class="pf-cancel">Cancelar</button>
    </div>`;
  const prev = bg.querySelector('.pf-av');
  let c = cur.c >= 0 ? cur.c : AV_GRADS.findIndex(([x,y])=> avatarColor(currentUser).includes(x));
  if(c < 0) c = 0;
  let emo = cur.emo || '';
  const paint = ()=>{
    const [x,y] = AV_GRADS[c];
    prev.style.background = `linear-gradient(135deg,${x},${y})`;
    prev.innerHTML = emo || ini; prev.classList.toggle('is-emo', !!emo);
    bg.querySelectorAll('.pf-emos button').forEach(b=> b.classList.toggle('on', b.dataset.e===emo));
    bg.querySelectorAll('.pf-colors button').forEach(b=> b.classList.toggle('on', +b.dataset.c===c));
  };
  bg.querySelectorAll('.pf-emos button').forEach(b=> b.onclick = ()=>{ emo = b.dataset.e; paint(); playTones([660], 0.04, 'triangle', 0.04); });
  bg.querySelectorAll('.pf-colors button').forEach(b=> b.onclick = ()=>{ c = +b.dataset.c; paint(); playTones([520], 0.04, 'triangle', 0.04); });
  bg.querySelector('.pf-save').onclick = ()=>{ const gg = loadGame(); gg.avatar = {emo, c}; saveGame(); bg.remove(); showFloat('✨ Avatar salvo!'); if(onDone) onDone(); };
  bg.querySelector('.pf-cancel').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
  paint();
}

async function profileScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('👤 Perfil', true, ()=>go('home')));
  const c = h(`<div class="content pf-screen"></div>`);

  const name = (currentUser && currentUser.name) ? currentUser.name : '';
  const g = loadGame(), lv = levelInfo(g.xp||0), av = avatarOf(currentUser);
  const streak = gameStreakNow();
  const achN = ACHIEVEMENTS.filter(a=> g.ach && g.ach[a.id]).length;
  const certN = completedUnits().length;

  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0, mastered=0;
  ids.forEach(id=>{
    totalAttempted += p[id].attempted; totalCorrect += p[id].correct;
    if(masteryOf(p[id]).lvl>=3) mastered++;
  });
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;
  const daysN = Object.keys(g.days||{}).filter(k=>g.days[k]===1).length;

  // cartão do jogador
  const hero = h(`<div class="pf-hero">
    <div class="pf-hero-bg" aria-hidden="true"><span>+</span><span>×</span><span>π</span><span>÷</span><span>√</span></div>
    <button type="button" class="pf-av-btn" aria-label="Trocar avatar"><span class="pf-av ${av && av.emo ? 'is-emo' : ''}" style="background:${avatarColor(currentUser)}">${avatarFace(currentUser)}</span><span class="pf-edit">✏️</span></button>
    <div class="pf-name"></div>
    <div class="pf-title">${lv.title}</div>
    <div class="pf-lv"><span class="pf-lv-b">NÍVEL ${lv.level}</span><div class="pf-xp"><i style="width:${lv.pct}%"></i></div><small>${lv.into}/${lv.need} XP</small></div>
    <div class="pf-chips">
      <span>🔥 ${streak} dia${streak===1?'':'s'}</span><span>💎 ${(g.gems||0).toLocaleString('pt-BR')}</span><span>⚡ ${(g.xp||0).toLocaleString('pt-BR')} XP</span>
    </div>
  </div>`);
  hero.querySelector('.pf-name').textContent = name;
  hero.querySelector('.pf-av-btn').onclick = ()=> showAvatarSheet(()=> render());
  c.appendChild(hero);

  // números
  const stats = h(`<div class="pf-stats">
    <div class="s1"><b>${totalAttempted.toLocaleString('pt-BR')}</b><span>questões resolvidas</span></div>
    <div class="s2"><b>${pct}%</b><span>de acerto geral</span></div>
    <div class="s3"><b>${mastered}</b><span>assunto${mastered===1?'':'s'} proficiente${mastered===1?'':'s'} ou dominado${mastered===1?'':'s'}</span></div>
    <div class="s4"><b>${g.bestCombo||0}</b><span>maior combo de acertos</span></div>
  </div>`);
  c.appendChild(stats);

  // atalhos de conquistas
  const links = h(`<div class="pf-links"></div>`);
  [
    {ico:'🏅', n:`${achN}/${ACHIEVEMENTS.length}`, l:'Conquistas', go:'achievements'},
    {ico:'📜', n:`${certN}`, l:`Certificado${certN===1?'':'s'}`, go:'certificates'},
    {ico:'📅', n:`${daysN}`, l:'Dias de estudo', go:'progress'},
    {ico:'🏆', n:`${g.bestStreak||0}`, l:'Maior ofensiva', go:'achievements'},
  ].forEach(x=>{ const b = h(`<button type="button" class="pf-link"><span>${x.ico}</span><b>${x.n}</b><small>${x.l}</small></button>`); b.onclick = ()=> go(x.go); links.appendChild(b); });
  c.appendChild(links);

  // medalhas recentes
  const recent = ACHIEVEMENTS.filter(a=> g.ach && typeof g.ach[a.id]==='number').sort((x,y)=> g.ach[y.id]-g.ach[x.id]).slice(0,4);
  if(recent.length){
    const box = h(`<button type="button" class="pf-medals"><div class="pf-medals-h"><b>Medalhas recentes</b><span>Ver todas ›</span></div><div class="pf-medals-r">${recent.map(a=>`<div><span>${a.ico}</span><small>${a.name}</small></div>`).join('')}</div></button>`);
    box.onclick = ()=> go('achievements');
    c.appendChild(box);
  }

  // menu em lista (antes era uma fileira de botões que ficava mais larga que a tela
  // e deixava a página dar zoom / arrastar pro lado)
  const menu = h(`<div class="profile-menu"></div>`);
  const item = (ico, label, sub, fn, cls, tint)=>{
    const b = h(`<button type="button" class="pm-item ${cls||''}" style="--pt:${tint||'#8C7BFF'}"><span class="pm-ico">${ico}</span><span class="pm-txt"><span class="pm-l"></span>${sub?`<span class="pm-s"></span>`:''}</span><span class="pm-chev">›</span></button>`);
    b.querySelector('.pm-l').textContent = label;
    if(sub) b.querySelector('.pm-s').textContent = sub;
    b.onclick = fn;
    menu.appendChild(b);
  };
  const group = t=> menu.appendChild(h(`<div class="pm-group">${t}</div>`));
  group('Personalizar');
  item('🎨', 'Trocar avatar', 'Escolha um bichinho ou símbolo e a cor', ()=> showAvatarSheet(()=> render()), '', '#B23FE0');
  group('Estudo');
  item('🧭', 'Teste de nivelamento', studyData().placement ? `Último: ${studyData().placement.ok}/${studyData().placement.n}` : 'Descubra por onde começar', ()=> startPlacement(), '', '#33D2E3');
  item('🗺️', 'Plano de estudos', studyData().plan ? `Prova em ${studyData().plan.examDate.split('-').reverse().join('/')}` : 'Monte um plano até o dia da prova', ()=> go('plan'), '', '#12B886');
  group('Ajuda e conta');
  item('🔔', 'Novidades', newsUnseen().length ? '✨ Tem novidade pra você!' : 'O que mudou no app', ()=> go('news'), newsUnseen().length ? 'has-news' : '', '#FFB800');
  item('📘', 'Como usar o app', 'Guia e tour guiado', ()=> go('help'), '', '#4C7DFF');
  if(feedbackEnabled()) item('💬', 'Fale com a gente', 'Dê sua nota, sugestões ou avise de um erro', ()=> showFeedbackSheet(false), '', '#F06595');
  item('⚙️', 'Configurações', 'Tema, som, meta, senha e backup', ()=> go('settings'), '', '#94A3B8');
  item('🚪', 'Sair da conta', '', ()=> showConfirm({
    icon:'🚪', title:'Sair da conta?', message:'Seu progresso continua salvo neste aparelho. É só entrar de novo com seu nome e senha.',
    ok:'Sair da conta', cancel:'Cancelar', danger:true,
  }).then(ok=>{ if(ok) doLogout(); }), 'danger');
  c.appendChild(menu);
  c.appendChild(h(`<p class="pf-foot">🎬 Matemática Show · feito pra aprender brincando</p>`));

  wrap.appendChild(c);
  return wrap;
}
