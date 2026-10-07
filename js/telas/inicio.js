/* =========================================================
   TELA INÍCIO
   Cartão do jogador, avisos do dia (Desafio do Dia, revisão, plano), jogos e atalhos.
   ========================================================= */
/* ---------------- HOME ---------------- */
function homeScreen(){
  const wrap = document.createElement('div');
  const bar = topbar();
  const myAv = avatarOf(currentUser);
  const profileBtn = h(`<button class="auth-logout profile-btn-avatar ${myAv ? 'av-custom' : ''} ${avatarImg(myAv) ? 'is-img' : myAv && myAv.emo ? 'is-emo' : ''}" title="Perfil" aria-label="Abrir meu perfil">${avatarFace(currentUser)}</button>`);
  if(myAv) profileBtn.style.setProperty('--avbg', avatarColor(currentUser));
  profileBtn.onclick = ()=> go('profile');
  bar.appendChild(newsBellButton());
  bar.appendChild(profileBtn);
  wrap.appendChild(bar);

  // ordem da tela (só o essencial): saudação → cartão do jogador → Trilha → "Hoje" (meta, tarefas e missões).
  // Todo o resto mora nas abas de cada parte (Estudar, Arena, Progresso, Perfil).
  const firstName = currentUser ? currentUser.name.split(' ')[0] : '';
  const streakNow = gameStreakNow();
  const hr = new Date().getHours();
  const saud = hr<5 ? 'Boa noite' : hr<12 ? 'Bom dia' : hr<18 ? 'Boa tarde' : 'Boa noite';
  const who = firstName ? `, ${escHTML(firstName)}` : '';
  const hello = streakNow>0 && loadGame().lastDay!==dayKey()
    ? `${saud}${who}! Jogue uma fase hoje pra não perder sua ofensiva de ${streakNow} dia${streakNow===1?'':'s'}! 🔥`
    : `${saud}${who}! ` + pick(['Bora subir de nível hoje? 🚀', 'O palco é seu hoje! 🎤', 'Luzes, câmera... show! 🎬', 'Que tal uma fase da Trilha? ⭐']);
  wrap.appendChild(mascotBubble(hello, 'happy'));
  showStreakNote();
  wrap.appendChild(playerCard());
  wrap.appendChild(pathHero());

  // avisos que só aparecem uma vez na vida da conta
  const arenaOld = arenaV2Pending();
  if(arenaOld){
    const importCard = h(`<div class="card ar-import"><b>📦 Encontramos progresso do Matemática Show Arena</b><p>${arenaOld.answered} questões e ${arenaOld.xp} XP guardados neste aparelho. Quer juntar tudo nesta conta? (XP, estrelas, simulados, caderno de erros e conquistas)</p>
      <div class="cta-row"><button type="button" class="btn secondary" data-a="no">Agora não</button><button type="button" class="btn primary" data-a="yes">Trazer meu progresso</button></div></div>`);
    importCard.querySelector('[data-a=no]').onclick = ()=>{ arenaV2Dismiss(); importCard.remove(); };
    importCard.querySelector('[data-a=yes]').onclick = async ()=>{
      const r = await arenaV2Import();
      if(r){ queueToast('📦', 'Progresso do Arena trazido!', `+${r.xp} XP · ${r.answered} questões`); launchConfetti(120); }
      render();
    };
    wrap.appendChild(importCard);
  }

  // ---------- cartão "Hoje": meta + tarefas do dia + missões (recolhidas) ----------
  const card = missionsCard();               // .missions (o tour aponta pra ele)
  card.classList.add('hd-today');
  const GR = 24, GC = 2*Math.PI*GR;
  const head = h(`<div class="td-head">
      <div class="td-ring"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="${GR}" class="bg"/><circle cx="28" cy="28" r="${GR}" class="fg" stroke-dasharray="${GC}" stroke-dashoffset="${GC}" style="opacity:0"/></svg><b class="goal-num">0</b></div>
      <div class="td-head-t"><b>Hoje</b><small class="td-goal">Meta: 0 de 0 questões</small></div>
      <button type="button" class="td-edit">Mudar meta</button>
    </div>`);
  const goalEditRow = h(`<div class="diff-row td-goals" style="display:none"></div>`);
  [5,10,15,20,30].forEach(n=>{
    const chip = h(`<button type="button" class="diff-chip">${n}</button>`);
    chip.onclick = async ()=>{ const st = await loadSettings(); st.dailyGoal = n; await saveSettings(); goalEditRow.style.display='none'; refreshGoal(); };
    goalEditRow.appendChild(chip);
  });
  head.querySelector('.td-edit').onclick = ()=>{ goalEditRow.style.display = goalEditRow.style.display==='none' ? 'flex' : 'none'; };
  const list = h(`<div class="td-list"></div>`);
  const row = (ico, title, sub, done, fn)=>{
    const r = h(`<button type="button" class="td-row ${done?'done':''}"><span class="td-ico">${ico}</span><span class="td-t"><b></b><small></small></span><span class="td-st">${done?'✓':'›'}</span></button>`);
    r.querySelector('b').textContent = title; r.querySelector('small').textContent = sub;
    r.onclick = fn; list.appendChild(r); return r;
  };
  const dk = isoDay(), dailyDone = arenaData().daily[dk], mix = mixToday();
  if(!studyData().placement && totalAnswered() < 5) row('🧭', 'Descubra seu nível', '10 perguntas pra saber por onde começar', false, ()=> startPlacement());
  row('📅', `Desafio do Dia #${dailyNumber(dk)}`, dailyDone ? `Feito: ${dailyDone.ok}/${dailyDone.n} certas` : `${DAILY_N} perguntas · +${DAILY_BONUS_XP} XP${dailyStreak() ? ` · 🔥 ${dailyStreak()} dias` : ''}`, !!dailyDone, ()=> startDaily());
  row('🔀', 'Mistura do dia', mix ? `Feita: ${mix.ok}/${mix.n} certas` : `${MIX_QTY} questões misturadas · +${MIX_BONUS_XP} XP`, !!mix, ()=> startMix());
  // revisão: erros vencidos e assuntos pra relembrar (só aparece quando tem)
  Promise.all([loadErrors(), loadProgress()]).then(([errs, progress])=>{
    const dueErr = errs.filter(e=>errorIsDue(e)).length, dueSubj = dueReviewSubjects(progress);
    if(dueErr){ const r = row('🔁', 'Revisar meus erros', `${dueErr} ${dueErr===1?'questão errada':'questões erradas'} pra rever hoje`, false, ()=> go('errors')); list.insertBefore(r, list.querySelector('.td-extra')); }
    if(dueSubj.length){ const r = row('🧠', 'Relembrar assuntos', dueSubj.slice(0,2).map(s=>s.name).join(', ') + (dueSubj.length>2 ? ` e mais ${dueSubj.length-2}` : ''), false, ()=> startSpacedReview()); list.insertBefore(r, list.querySelector('.td-extra')); }
    paintAllSet();
  });
  // extras de quem usa: plano de estudos e "minha prova"
  const plan = studyData().plan, pt = planToday();
  if(plan){
    const left = Math.round((new Date(plan.examDate+'T12:00') - new Date(dk+'T12:00'))/864e5);
    const r = row('🗺️', left>0 ? `Plano: prova em ${left} dia${left===1?'':'s'}` : left===0 ? 'Plano: a prova é hoje!' : 'Plano de estudos', pt ? 'Hoje: ' + (pt.subjects.map(id=>(SUBJECTS.find(x=>x.id===id)||{}).name).filter(Boolean).join(' + ') || '') + (pt.exam ? (pt.subjects.length?' + ':'')+'simulado' : '') : 'Ver o plano', false, ()=> go('plan'));
    r.classList.add('td-extra');
  }
  const ex = examById(myExamId());
  if(ex){
    const rd = examReadiness(ex);
    const r = row(ex.ico, `Rumo ${ex.id==='enem'?'ao':'à'} ${ex.name}`, `${rd.ready} de ${rd.total} assuntos prontos`, false, ()=> go('examDetail', {examId:ex.id}));
    r.classList.add('td-extra');
  }
  const allSet = h(`<div class="td-allset" style="display:none">✅ Tudo em dia por hoje! Que tal uma fase da Trilha?</div>`);
  function paintAllSet(){ allSet.style.display = list.querySelector('.td-row:not(.done):not(.td-extra)') ? 'none' : ''; }
  function refreshGoal(){
    Promise.all([loadHistory(), loadSettings()]).then(([hist, st])=>{
      const todayStr = new Date().toDateString();
      const n = hist.filter(e=> new Date(e.ts).toDateString()===todayStr).length;
      const goal = st.dailyGoal || 10, pct = Math.min(100, Math.round(n/goal*100));
      head.querySelector('.goal-num').textContent = n;
      const fg = head.querySelector('.fg');
      fg.setAttribute('stroke-dashoffset', GC*(1-pct/100)); fg.style.opacity = n ? 1 : 0;
      head.classList.toggle('done', n>=goal);
      head.querySelector('.td-goal').textContent = n>=goal ? `🎉 Meta batida: ${n} de ${goal} questões` : `Meta: ${n} de ${goal} questões`;
      goalEditRow.querySelectorAll('.diff-chip').forEach(ch=> ch.classList.toggle('active', parseInt(ch.textContent)===goal));
    });
  }
  refreshGoal();
  // missões recolhidas no rodapé do cartão (abrem sozinhas quando tem prêmio pra pegar)
  const ms = missionState(), msDone = ms.filter(x=>x.claimed).length, msReady = ms.some(x=>x.done && !x.claimed);
  const mToggle = h(`<button type="button" class="m-toggle" aria-expanded="false"><span>📜 Missões do dia</span><b>${msDone}/${ms.length}${msReady ? ' · 🎁 prêmio!' : ''}</b><i>▾</i></button>`);
  card.querySelector('h3').replaceWith(mToggle);
  card.prepend(allSet); card.prepend(list); card.prepend(goalEditRow); card.prepend(head);
  const setOpen = open=>{ card.classList.toggle('collapsed', !open); mToggle.setAttribute('aria-expanded', String(open)); };
  setOpen(msReady || !!state.missionsOpen);
  mToggle.onclick = ()=>{ state.missionsOpen = card.classList.contains('collapsed'); setOpen(state.missionsOpen); };
  paintAllSet();
  wrap.appendChild(card);

  // depois de uma atualização mostra as Novidades; senão, talvez o lembrete de backup (nunca os dois juntos)
  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected && !document.querySelector('.gm-modal-bg')){ if(!showNewsSheet()) maybeAskFeedback().then(shown=>{ if(!shown) maybeAskBackup(); }); } }, 1200);
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
