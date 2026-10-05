/* =========================================================
   TELA INÍCIO
   Cartão do jogador, avisos do dia (Desafio do Dia, revisão, plano), jogos e atalhos.
   ========================================================= */
/* dicas e curiosidades do Pi (uma por dia, em rodízio) */
const PI_TIPS = [
  ['Truque do 9 na tabuada', 'Em 9 × 7, abaixe o 7º dedo: ficam 6 dedos de um lado e 3 do outro. Resposta: 63!'],
  ['Divisível por 3?', 'Some os algarismos: se a soma for múltiplo de 3, o número também é. Ex.: 471 → 4+7+1 = 12 ✓'],
  ['Porcentagem de cabeça', '10% é só andar uma casa com a vírgula. 10% de 250 = 25, e 5% é a metade disso: 12,5.'],
  ['Multiplicar por 5', 'Multiplique por 10 e divida por 2. Ex.: 48 × 5 = 480 ÷ 2 = 240.'],
  ['O número π', 'π ≈ 3,14159… é a razão entre o comprimento e o diâmetro de qualquer círculo. Ele nunca termina!'],
  ['Frações equivalentes', '1/2, 2/4 e 50/100 valem a mesma coisa: multiplique ou divida em cima e embaixo pelo mesmo número.'],
  ['Quadrados terminados em 5', '35² = 3 × 4 = 12, e põe 25 no final: 1225. Funciona com 15, 25, 45…'],
  ['Ordem das operações', 'Primeiro parênteses, depois potências, depois × e ÷, e por último + e −.'],
  ['Ângulos do triângulo', 'Em qualquer triângulo, os três ângulos somam sempre 180°.'],
  ['Números primos', 'Primo só se divide por 1 e por ele mesmo: 2, 3, 5, 7, 11, 13… O 2 é o único primo par!'],
  ['Multiplicar por 11', 'Com 2 algarismos, some os dois e ponha no meio: 53 × 11 → 5 (5+3) 3 = 583.'],
  ['Regra de sinais', 'Sinais iguais dão +, sinais diferentes dão −. (−3) × (−4) = +12.'],
  ['Média', 'Some tudo e divida pela quantidade. A média de 6, 8 e 10 é 24 ÷ 3 = 8.'],
  ['Área do retângulo', 'Base × altura. Um quarto de 4 m por 3 m tem 12 m² de área.'],
  ['Equação é balança', 'O que você faz de um lado do = faz do outro também, e ela continua equilibrada.'],
  ['Revise os erros', 'Rever uma questão errada uns dias depois ajuda a guardar de vez. Use o Caderno de erros!'],
  ['Zero no denominador', 'Não existe divisão por zero: nenhum número vezes 0 dá 5, por exemplo.'],
  ['Potência de 10', '10³ = 1000: o expoente diz quantos zeros vêm depois do 1.'],
  ['Estimar antes', 'Arredonde antes de calcular: 49 × 21 é perto de 50 × 20 = 1000. Ajuda a conferir a resposta.'],
  ['Pouquinho todo dia', '10 minutos por dia ensinam mais que 2 horas de uma vez só. Por isso a ofensiva 🔥 conta!'],
];
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

  // meta diária de questões — anel com o progresso de hoje e os números do dia; editável aqui mesmo
  const GR = 30, GC = 2*Math.PI*GR;
  const goalRow = h(`
    <div class="hd-goal" style="display:none">
      <div class="hd-ring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="${GR}" class="bg"/><circle cx="36" cy="36" r="${GR}" class="fg" stroke-dasharray="${GC}" stroke-dashoffset="${GC}"/></svg><div class="hd-ring-in"><b class="goal-num">0</b><small class="goal-of">de 0</small></div></div>
      <div class="hd-goal-t">
        <div class="name">🎯 Meta de hoje</div>
        <small class="hd-left"></small>
        <div class="hd-chips"><span class="c-ok">✅ 0 certas</span><span class="c-acc">🎯 –</span><span class="c-combo">🔥 0</span></div>
      </div>
    </div>`);
  const goalEditBtn = h(`<button type="button" class="link-btn hd-edit">Mudar meta</button>`);
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
  goalRow.querySelector('.hd-goal-t').appendChild(goalEditBtn);
  const goalWrap = h(`<div class="hd-goal-wrap"></div>`);
  goalWrap.appendChild(goalRow); goalWrap.appendChild(goalEditRow);
  wrap.appendChild(goalWrap);
  wrap.appendChild(missionsCard());
  function refreshGoal(){
    Promise.all([loadHistory(), loadSettings()]).then(([hist, settings])=>{
      const todayStr = new Date().toDateString();
      const today = hist.filter(e=> new Date(e.ts).toDateString()===todayStr);
      const doneToday = today.length, okToday = today.filter(e=>e.correct).length;
      const goal = settings.dailyGoal || 10;
      const pct = Math.max(0, Math.min(100, Math.round(doneToday/goal*100)));
      const done = doneToday>=goal;
      goalRow.style.display = '';
      goalRow.classList.toggle('done', done);
      goalRow.querySelector('.goal-num').textContent = doneToday;
      goalRow.querySelector('.goal-of').textContent = `de ${goal}`;
      goalRow.querySelector('.fg').setAttribute('stroke-dashoffset', GC*(1-pct/100));
      goalRow.querySelector('.fg').style.opacity = doneToday ? 1 : 0;
      goalRow.querySelector('.name').textContent = done ? '🎉 Meta de hoje concluída!' : '🎯 Meta de hoje';
      const left = goal - doneToday;
      goalRow.querySelector('.hd-left').textContent = done ? `Você respondeu ${doneToday} questões hoje. Mandou bem!` : doneToday ? `Faltam ${left} ${left===1?'questão':'questões'} pra bater a meta` : `Responda ${goal} questões hoje`;
      goalRow.querySelector('.c-ok').textContent = `✅ ${okToday} cert${okToday===1?'a':'as'}`;
      goalRow.querySelector('.c-acc').textContent = doneToday ? `🎯 ${Math.round(okToday/doneToday*100)}%` : '🎯 –';
      goalRow.querySelector('.c-combo').textContent = `🔥 combo ${(loadGame().today||{}).bestCombo||0}`;
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
  // depois de uma atualização mostra as Novidades; senão, talvez o lembrete de backup (nunca os dois juntos)
  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected && !document.querySelector('.gm-modal-bg')){ if(!showNewsSheet()) maybeAskFeedback().then(shown=>{ if(!shown) maybeAskBackup(); }); } }, 1200);

  // ordem da tela: continuar a trilha → pra fazer hoje → ferramentas.
  // Cada coisa mora na sua aba: treinos em Exercícios, jogos na Arena, conquistas/relatório/histórico em Progresso,
  // nivelamento/plano/configurações no Perfil.
  const secTitle = t=> h(`<h3 class="home-sec">${t}</h3>`);
  const tileGrid = items=>{
    const grid = h(`<div class="quick-grid six"></div>`);
    items.forEach(item=>{
      const tile = h(`<button type="button" class="quick-tile ${item.cls}"><span class="sym">${item.sym}</span><span class="label">${item.label}</span>${item.sub?`<small class="qt-sub">${item.sub}</small>`:''}</button>`);
      tile.onclick = ()=> item.screen==='placement' ? startPlacement() : go(item.screen, item.screen==='geoLab' ? {geoBack:'home'} : {});
      grid.appendChild(tile);
    });
    return grid;
  };
  // "Pra fazer hoje": avisos (quando existem), meta e missões — appendChild move os blocos já criados pra cá
  wrap.appendChild(secTitle('Pra fazer hoje'));
  if(importCard) wrap.appendChild(importCard);
  if(placementCard) wrap.appendChild(placementCard);
  { const eb = examHomeBanner(); if(eb) wrap.appendChild(eb); }
  wrap.appendChild(dailyBanner);
  wrap.appendChild(mixBannerEl());
  if(planBanner) wrap.appendChild(planBanner);
  wrap.appendChild(reviewBanner);
  wrap.appendChild(spacedBanner);
  // nada pendente (desafio feito, sem revisão vencida): um aviso de "tudo em dia" no lugar
  if(dailyDone && mixToday() && !planBanner && !placementCard && !importCard){
    const allSet = h(`<div class="hd-allset" style="display:none"><span>✅</span><div><b>Tudo em dia por hoje!</b><small>Desafio e Mistura feitos, e nenhuma revisão pendente. Que tal uma fase da Trilha?</small></div></div>`);
    spacedBanner.after(allSet);
    Promise.all([loadErrors(), loadProgress()]).then(([errs, progress])=>{
      if(!errs.some(e=>errorIsDue(e)) && !dueReviewSubjects(progress).length) allSet.style.display = '';
    });
  }
  // meta do dia + missões num cartão só; as missões ficam recolhidas (abrem sozinhas quando tem prêmio pra pegar)
  const missions = wrap.querySelector('.missions');
  const ms = missionState(), msDone = ms.filter(x=>x.claimed).length, msReady = ms.some(x=>x.done && !x.claimed);
  goalWrap.classList.add('in-missions');
  missions.prepend(goalWrap);
  const mTitle = missions.querySelector('h3');
  const mToggle = h(`<button type="button" class="m-toggle" aria-expanded="false"><span>📜 Missões do dia</span><b>${msDone}/${ms.length}${msReady ? ' · 🎁 prêmio!' : ''}</b><i>▾</i></button>`);
  mTitle.replaceWith(mToggle);
  const setOpen = open=>{ missions.classList.toggle('collapsed', !open); mToggle.setAttribute('aria-expanded', String(open)); };
  setOpen(msReady || !!state.missionsOpen);
  mToggle.onclick = ()=>{ state.missionsOpen = missions.classList.contains('collapsed'); setOpen(state.missionsOpen); };
  wrap.appendChild(missions);
  // ferramentas: uma entrada só; Resolver, Calculadora e Caderno ficam nas abas lá dentro
  const tools = h(`<div class="quick-grid tools-one"><button type="button" class="tools-btn"><span class="tools-ico">🧰</span><span class="tools-t"><b>Ferramentas</b><small>Resolver questão · Calculadora · Caderno</small></span><span class="chev">›</span></button></div>`);
  tools.querySelector('button').onclick = ()=> go('solve');
  wrap.appendChild(tools);
  // dica do Pi: uma curiosidade por dia (muda à meia-noite)
  const tip = PI_TIPS[Math.floor(new Date(isoDay()+'T12:00').getTime()/864e5) % PI_TIPS.length];
  wrap.appendChild(h(`<div class="hd-tip"><div class="hd-tip-m">${mascotSVG('joy', 54)}</div><div><small>💡 DICA DO PI · HOJE</small><b>${tip[0]}</b><p>${tip[1]}</p></div></div>`));

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
