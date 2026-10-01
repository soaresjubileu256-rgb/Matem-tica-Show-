/* =========================================================
   TELA INÍCIO
   Cartão do jogador, avisos do dia (Desafio do Dia, revisão, plano), jogos e atalhos.
   ========================================================= */
/* ---------------- HOME ---------------- */
function homeScreen(){
  const wrap = document.createElement('div');
  const bar = topbar();
  const initial = (currentUser && currentUser.name) ? currentUser.name.trim().charAt(0).toUpperCase() : '?';
  const profileBtn = h(`<button class="auth-logout profile-btn-avatar" title="Perfil" aria-label="Abrir meu perfil">${escHTML(initial)}</button>`);
  profileBtn.onclick = ()=> go('profile');
  const helpBtn = h(`<button class="auth-logout tut-help-btn" title="Como usar" aria-label="Como usar o app">?</button>`);
  helpBtn.onclick = ()=> go('help');
  bar.appendChild(helpBtn);
  bar.appendChild(profileBtn);
  wrap.appendChild(bar);
  const firstName = currentUser ? currentUser.name.split(' ')[0] : '';
  const streakNow = gameStreakNow();
  const hello = streakNow>0 && loadGame().lastDay!==dayKey()
    ? `Olá${firstName? ', '+escHTML(firstName) : ''}! Jogue uma fase hoje pra não perder sua ofensiva de ${streakNow} dia${streakNow===1?'':'s'}! 🔥`
    : pick([`Olá${firstName? ', '+escHTML(firstName) : ''}! Bora subir de nível hoje? 🚀`, `E aí${firstName? ', '+escHTML(firstName) : ''}! O palco é seu hoje! 🎤`, `Oi${firstName? ', '+escHTML(firstName) : ''}! Luzes, câmera... matemática! 🎬`]);
  wrap.appendChild(mascotBubble(hello, 'happy'));
  showStreakNote();
  wrap.appendChild(playerCard());
  wrap.appendChild(pathHero());

  // meta diária de questões — editável direto aqui, sem precisar ir em Configurações
  const goalRow = h(`
    <div class="mastery-row" style="display:none; margin:0 20px 16px;">
      <div class="top">
        <span class="name">🎯 Meta de hoje</span>
        <span class="pct goal-num">0/0</span>
      </div>
      <div class="bar-track"><div class="bar-fill goal-bar" style="width:0%"></div></div>
    </div>`);
  const goalEditBtn = h(`<button type="button" class="link-btn" style="margin-top:8px; font-size:11.5px;">Mudar meta</button>`);
  const goalEditRow = h(`<div class="diff-row" style="display:none; margin-top:8px; flex-wrap:wrap;"></div>`);
  [5,10,15,20,30].forEach(n=>{
    const chip = h(`<button type="button" class="diff-chip" style="flex:1 1 auto; padding:8px 14px; font-size:12.5px;">${n}</button>`);
    chip.onclick = async ()=>{
      const settings = await loadSettings();
      settings.dailyGoal = n;
      await saveSettings();
      refreshGoal();
      goalEditRow.style.display='none'; goalEditBtn.textContent='Mudar meta';
    };
    goalEditRow.appendChild(chip);
  });
  goalEditBtn.onclick = ()=>{
    const open = goalEditRow.style.display==='none';
    goalEditRow.style.display = open ? 'flex' : 'none';
    goalEditBtn.textContent = open ? 'Fechar' : 'Mudar meta';
  };
  goalRow.appendChild(goalEditBtn);
  goalRow.appendChild(goalEditRow);
  wrap.appendChild(goalRow);
  wrap.appendChild(missionsCard());
  function refreshGoal(){
    Promise.all([loadHistory(), loadSettings()]).then(([hist, settings])=>{
      const todayStr = new Date().toDateString();
      const doneToday = hist.filter(e=> new Date(e.ts).toDateString()===todayStr).length;
      const goal = settings.dailyGoal || 10;
      const pct = Math.max(0, Math.min(100, Math.round(doneToday/goal*100)));
      goalRow.style.display = '';
      goalRow.querySelector('.goal-num').textContent = `${doneToday}/${goal}`;
      goalRow.querySelector('.goal-bar').style.width = pct+'%';
      goalRow.querySelector('.name').textContent = doneToday>=goal ? '🎉 Meta de hoje concluída!' : '🎯 Meta de hoje';
      goalEditRow.querySelectorAll('.diff-chip').forEach(ch=>{
        ch.classList.toggle('active', parseInt(ch.textContent)===goal);
      });
    });
  }
  refreshGoal();

  // aviso de erros pendentes — banner compacto, só aparece quando existem, logo no topo por ser acionável
  const reviewBanner = h(`
    <button type="button" class="alert-banner danger" style="display:none">
      <span class="sym">🔁</span>
      <span class="txt"><span class="title">Revisar meus erros</span><span class="sub review-count-text">Volte nas questões que você errou e tente de novo.</span></span>
      <span class="chev">›</span>
    </button>`);
  reviewBanner.onclick = ()=> go('errors');
  wrap.appendChild(reviewBanner);
  loadErrors().then(errs=>{
    // só aparece quando tem erro "vencido" hoje (os outros esperam o dia certo no caderno)
    const due = errs.filter(e=>errorIsDue(e)).length;
    if(due>0){
      reviewBanner.style.display = '';
      reviewBanner.querySelector('.title').textContent = 'Caderno de erros';
      reviewBanner.querySelector('.review-count-text').textContent =
        due===1 ? '1 questão errada pra revisar hoje.' : `${due} questões erradas pra revisar hoje.`;
    }
  });

  // Arena: Desafio do Dia (igual pra todo mundo) e plano de estudos até a prova
  const dk = isoDay(), dailyDone = arenaData().daily[dk];
  const dailyBanner = h(`<button type="button" class="alert-banner ${dailyDone?'':'purple'}"><span class="sym">📅</span>
    <span class="txt"><span class="title">Desafio do Dia #${dailyNumber(dk)}</span><span class="sub">${dailyDone ? `Feito: ${dailyDone.marks} ${dailyDone.ok}/${dailyDone.n}${dailyStreak()>1 ? ` · 🔥 ${dailyStreak()} dias` : ''}` : `${DAILY_N} perguntas do seu nível · +${DAILY_BONUS_XP} XP${dailyStreak() ? ` · 🔥 ${dailyStreak()} dias seguidos` : ''}`}</span></span><span class="chev">${dailyDone?'✓':'›'}</span></button>`);
  dailyBanner.onclick = ()=> startDaily();
  const pt = planToday(), plan = studyData().plan;
  let planBanner = null;
  if(plan){
    const left = Math.round((new Date(plan.examDate+'T12:00') - new Date(dk+'T12:00'))/864e5);
    planBanner = h(`<button type="button" class="alert-banner"><span class="sym">🗺️</span><span class="txt"><span class="title">${left>0 ? `Prova em ${left} dia${left===1?'':'s'}` : left===0 ? 'A prova é hoje!' : 'Plano de estudos'}</span>
      <span class="sub">${pt ? 'Hoje: ' + (pt.subjects.map(id=>(SUBJECTS.find(x=>x.id===id)||{}).name).filter(Boolean).join(' + ') || '') + (pt.exam ? (pt.subjects.length?' + ':'')+'simulado' : '') : 'Ver o plano'}</span></span><span class="chev">›</span></button>`);
    planBanner.onclick = ()=> go('plan');
  }
  // conta nova: sugere o teste de nivelamento; aparelho com o antigo Arena: oferece trazer o progresso
  let placementCard = null;
  if(!studyData().placement && totalAnswered() < 5){
    placementCard = h(`<button type="button" class="alert-banner purple"><span class="sym">🧭</span><span class="txt"><span class="title">Descubra seu nível</span><span class="sub">Teste de nivelamento com 10 perguntas: mostra por onde começar</span></span><span class="chev">›</span></button>`);
    placementCard.onclick = ()=> startPlacement();
  }
  let importCard = null;
  const arenaOld = arenaV2Pending();
  if(arenaOld){
    importCard = h(`<div class="card ar-import"><b>📦 Encontramos progresso do Matemática Show Arena</b><p>${arenaOld.answered} questões e ${arenaOld.xp} XP guardados neste aparelho. Quer juntar tudo nesta conta? (XP, estrelas, simulados, caderno de erros e conquistas)</p>
      <div class="cta-row"><button type="button" class="btn secondary" data-a="no">Agora não</button><button type="button" class="btn primary" data-a="yes">Trazer meu progresso</button></div></div>`);
    importCard.querySelector('[data-a=no]').onclick = ()=>{ arenaV2Dismiss(); importCard.remove(); };
    importCard.querySelector('[data-a=yes]').onclick = async ()=>{
      const r = await arenaV2Import();
      if(r){ queueToast('📦', 'Progresso do Arena trazido!', `+${r.xp} XP · ${r.answered} questões`); launchConfetti(120); }
      render();
    };
  }

  // revisão espaçada — assuntos que já "venceram" e precisam ser relembrados
  const spacedBanner = h(`
    <button type="button" class="alert-banner purple" style="display:none">
      <span class="sym">🧠</span>
      <span class="txt"><span class="title">Revisão do dia</span><span class="sub spaced-text"></span></span>
      <span class="chev">›</span>
    </button>`);
  spacedBanner.onclick = ()=> startSpacedReview();
  wrap.appendChild(spacedBanner);
  loadProgress().then(progress=>{
    const due = dueReviewSubjects(progress);
    if(!due.length) return;
    spacedBanner.style.display = '';
    const names = due.slice(0,3).map(s=>s.name).join(', ');
    spacedBanner.querySelector('.spaced-text').textContent = `Hora de relembrar: ${names}${due.length>3?` e mais ${due.length-3}`:''}.`;
  });
  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected) maybeAskBackup(); }, 1500);

  // ordem da tela: continuar a trilha → pra fazer hoje → ferramentas.
  // Cada coisa mora na sua aba: treinos em Exercícios, jogos na Arena, conquistas/relatório/histórico em Progresso,
  // nivelamento/plano/configurações no Perfil.
  const secTitle = t=> h(`<h3 class="home-sec">${t}</h3>`);
  const tileGrid = items=>{
    const grid = h(`<div class="quick-grid six"></div>`);
    items.forEach(item=>{
      const tile = h(`<button type="button" class="quick-tile ${item.cls}"><span class="sym">${item.sym}</span><span class="label">${item.label}</span></button>`);
      tile.onclick = ()=> item.screen==='placement' ? startPlacement() : go(item.screen, item.screen==='geoLab' ? {geoBack:'home'} : {});
      grid.appendChild(tile);
    });
    return grid;
  };
  // "Pra fazer hoje": avisos (quando existem), meta e missões — appendChild move os blocos já criados pra cá
  wrap.appendChild(secTitle('Pra fazer hoje'));
  if(importCard) wrap.appendChild(importCard);
  if(placementCard) wrap.appendChild(placementCard);
  wrap.appendChild(dailyBanner);
  if(planBanner) wrap.appendChild(planBanner);
  wrap.appendChild(reviewBanner);
  wrap.appendChild(spacedBanner);
  // meta do dia + missões num cartão só; as missões ficam recolhidas (abrem sozinhas quando tem prêmio pra pegar)
  const missions = wrap.querySelector('.missions');
  const ms = missionState(), msDone = ms.filter(x=>x.claimed).length, msReady = ms.some(x=>x.done && !x.claimed);
  goalRow.classList.add('in-missions');
  missions.prepend(goalRow);
  const mTitle = missions.querySelector('h3');
  const mToggle = h(`<button type="button" class="m-toggle" aria-expanded="false"><span>📜 Missões do dia</span><b>${msDone}/${ms.length}${msReady ? ' · 🎁 prêmio!' : ''}</b><i>▾</i></button>`);
  mTitle.replaceWith(mToggle);
  const setOpen = open=>{ missions.classList.toggle('collapsed', !open); mToggle.setAttribute('aria-expanded', String(open)); };
  setOpen(msReady || !!state.missionsOpen);
  mToggle.onclick = ()=>{ state.missionsOpen = missions.classList.contains('collapsed'); setOpen(state.missionsOpen); };
  wrap.appendChild(missions);
  wrap.appendChild(secTitle('Ferramentas'));
  wrap.appendChild(tileGrid([
    {sym:'?', cls:'solve', label:'Resolver questão', screen:'solve'},
    {sym:'#', cls:'tile-calc', label:'Calculadora', screen:'calculator'},
    {sym:'✏️', cls:'tile-report', label:'Caderno', screen:'notebook'},
  ]));

  wrap.appendChild(h(`<div class="footer-note">Seu professor de matemática digital 📐</div>`));
  // primeiro acesso: tour guiado pelo Pi
  if(!tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && !tutorialDone() && wrap.isConnected) startTour(); }, 700);
  return wrap;
}

/* ---------- nível de domínio por assunto ----------
   Olha as últimas 10 respostas (não o histórico inteiro), pra refletir o que a pessoa sabe hoje. */
const MASTERY_LEVELS = [
  {lvl:0, ico:'⚪', name:'Não iniciado', next:'Responda 5 questões pra descobrir seu nível.'},
  {lvl:1, ico:'🌱', name:'Aprendendo',   next:'Chegue a 60% de acerto nas últimas questões.'},
  {lvl:2, ico:'📘', name:'Praticando',   next:'Chegue a 80% de acerto nas últimas questões.'},
  {lvl:3, ico:'⭐', name:'Proficiente',  next:'Acerte 9 das últimas 10, com pelo menos 2 no difícil.'},
  {lvl:4, ico:'👑', name:'Dominado',     next:'Você domina este assunto! Revise de vez em quando pra não esquecer.'},
];
function masteryOf(d){
  if(!d || !d.attempted) return MASTERY_LEVELS[0];
  const rec = d.recent || [];
  const n = rec.length >= 5 ? rec.length : d.attempted;
  const ok = rec.length >= 5 ? rec.filter(r=>r.ok).length : d.correct;
  if(n < 5) return MASTERY_LEVELS[1];
  const acc = ok/n;
  const hardOk = rec.filter(r=>r.ok && r.h).length;
  if(rec.length>=10 && acc>=0.9 && hardOk>=2) return MASTERY_LEVELS[4];
  if(acc>=0.8) return MASTERY_LEVELS[3];
  if(acc>=0.6) return MASTERY_LEVELS[2];
  return MASTERY_LEVELS[1];
}
/* versão síncrona pras telas que desenham na hora: se o progresso ainda não foi carregado
   na memória, lê direto do armazenamento (antes aparecia "Não iniciado" pra tudo) */
function progressSync(){
  const uid = currentUserId();
  if(!(progressCache && progressCacheUid===uid)){
    try{ const raw = localStorage.getItem(`${PROGRESS_KEY_BASE}:${uid}`); progressCache = raw ? JSON.parse(raw) : {}; }catch(e){ progressCache = {}; }
    progressCacheUid = uid;
  }
  return progressCache;
}
function masterySync(subjectId){ return masteryOf(progressSync()[subjectId]); }
function masteryChip(m){ return `<span class="mst-chip mst-${m.lvl}" title="${m.name}">${m.ico} ${m.name}</span>`; }

/* ---------- ouvir a questão (leitura em voz alta) ---------- */
function speechText(ex){
  let t = String((ex && (ex.question || ex.text)) || '').replace(/<[^>]+>/g,' ');
  t = t.replace(/(\d+)\/(\d+)/g, '$1 sobre $2')
       .replace(/×/g,' vezes ').replace(/÷/g,' dividido por ').replace(/−/g,' menos ').replace(/\+/g,' mais ')
       .replace(/²/g,' ao quadrado').replace(/³/g,' ao cubo').replace(/√/g,' raiz quadrada de ')
       .replace(/=\s*\?/g,' é igual a quanto?').replace(/=/g,' igual a ').replace(/R\$\s*/g,'').replace(/\s+/g,' ');
  return t.trim();
}
function speak(text){
  try{
    if(!('speechSynthesis' in window) || !text) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v=>/pt[-_]BR/i.test(v.lang));
    if(v) u.voice = v;
    speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}
function addSpeakButton(card, ex){
  if(!('speechSynthesis' in window) || currentSettingsSync().tts===false) return;
  const text = speechText(ex);
  if(!text) return;
  const b = h(`<button type="button" class="tts-btn" aria-label="Ouvir a questão" title="Ouvir a questão">🔊</button>`);
  b.onclick = e=>{ e.stopPropagation(); speak(text); };
  questionTools(card).appendChild(b);
}
/* tamanho do texto das questões/explicações: normal, grande, enorme */
const TEXT_SCALES = {normal:1, grande:1.15, enorme:1.3};
function applyTextScale(v){ document.documentElement.style.setProperty('--fs', TEXT_SCALES[v] || 1); }
