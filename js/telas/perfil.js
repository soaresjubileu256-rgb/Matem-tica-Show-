/* =========================================================
   TELA PERFIL
      Nome, nível e números da conta + menu: nivelamento, plano de estudos, ajuda,
      configurações e sair.
   ========================================================= */
async function profileScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Perfil', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);

  const name = (currentUser && currentUser.name) ? currentUser.name : '';
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  c.appendChild(h(`
    <div class="profile-card">
      <div class="profile-avatar">${escHTML(initial)}</div>
      <div class="profile-name">${escHTML(name)}</div>
      <div class="profile-sub">Nível ${levelInfo(loadGame().xp).level} · ${levelInfo(loadGame().xp).title}</div>
    </div>`));

  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0, mastered=0;
  ids.forEach(id=>{
    totalAttempted += p[id].attempted; totalCorrect += p[id].correct;
    const acc = p[id].attempted? (p[id].correct/p[id].attempted*100) : 0;
    if(masteryOf(p[id]).lvl>=3) mastered++;
  });
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;
  const errs = await loadErrors();

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${mastered}</div><div class="lbl">Assuntos proficientes ou dominados</div></div>`));
  c.appendChild(grid);

  // menu em lista (antes era uma fileira de botões que ficava mais larga que a tela
  // e deixava a página dar zoom / arrastar pro lado)
  const menu = h(`<div class="profile-menu"></div>`);
  const item = (ico, label, sub, fn, cls)=>{
    const b = h(`<button type="button" class="pm-item ${cls||''}"><span class="pm-ico">${ico}</span><span class="pm-txt"><span class="pm-l"></span>${sub?`<span class="pm-s"></span>`:''}</span><span class="pm-chev">›</span></button>`);
    b.querySelector('.pm-l').textContent = label;
    if(sub) b.querySelector('.pm-s').textContent = sub;
    b.onclick = fn;
    menu.appendChild(b);
  };
  const group = t=> menu.appendChild(h(`<div class="pm-group">${t}</div>`));
  group('Estudo');
  item('🧭', 'Teste de nivelamento', studyData().placement ? `Último: ${studyData().placement.ok}/${studyData().placement.n}` : 'Descubra por onde começar', ()=> startPlacement());
  item('🗺️', 'Plano de estudos', studyData().plan ? `Prova em ${studyData().plan.examDate.split('-').reverse().join('/')}` : 'Monte um plano até o dia da prova', ()=> go('plan'));
  group('Ajuda e conta');
  item('🔔', 'Novidades', newsUnseen().length ? '✨ Tem novidade pra você!' : 'O que mudou no app', ()=> go('news'), newsUnseen().length ? 'has-news' : '');
  item('📘', 'Como usar o app', 'Guia e tour guiado', ()=> go('help'));
  if(feedbackEnabled()) item('💬', 'Fale com a gente', 'Dê sua nota, sugestões ou avise de um erro', ()=> showFeedbackSheet(false));
  item('⚙️', 'Configurações', 'Tema, som, meta, senha e backup', ()=> go('settings'));
  item('🚪', 'Sair da conta', '', ()=> showConfirm({
    icon:'🚪', title:'Sair da conta?', message:'Seu progresso continua salvo neste aparelho. É só entrar de novo com seu nome e senha.',
    ok:'Sair da conta', cancel:'Cancelar', danger:true,
  }).then(ok=>{ if(ok) doLogout(); }), 'danger');
  c.appendChild(menu);

  wrap.appendChild(c);
  return wrap;
}
