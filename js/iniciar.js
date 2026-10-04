/* =========================================================
   INICIAR O APP
   Tabela de telas (SCREENS), desenho das telas que carregam dados e o boot().
   Precisa ser o último script da página.
   ========================================================= */
/* ---------------- router table ---------------- */
const SCREENS = {
  home: homeScreen,
  content: contentScreen,
  subjectDetail: subjectDetailScreen,
  exercisesSubjects: exercisesSubjectsScreen,
  exerciseDifficulty: exerciseDifficultyScreen,
  exerciseSession: exerciseSessionScreen,
  reviewErrorsSession: reviewErrorsSessionScreen,
  challengeDifficulty: challengeDifficultyScreen,
  challengeSession: challengeSessionScreen,
  personalizedSession: personalizedSessionScreen,
  achievements: achievementsScreen,
  duel: duelScreen,
  geoLab: geoLabScreen,
  notebook: notebookScreen,
  notePage: notePageScreen,
  certificates: certificatesScreen,
  certificate: certificateScreen,
  lightning: lightningScreen,
  path: pathScreen,
  lesson: lessonScreen,
  quizSetup: quizSetupScreen,
  help: helpScreen,
  news: newsScreen,
  tabuada: tabuadaScreen,
  solve: solveScreen,
  calculator: calculatorScreen,
  arena: arenaScreen,
  arenaDaily: arenaDailyScreen,
  dailyIntro: dailyIntroScreen,
  dailyReview: dailyReviewScreen,
  examSetup: examSetupScreen,
  examRun: examRunScreen,
  examResult: examResultScreen,
  placement: placementScreen,
  plan: planScreen,
  cardsDeck: cardsDeckScreen,
  errors: errorsScreen,
  profile: null, // async, handled specially below
  progress: null, // async, handled specially below
  history: null, // async, handled specially below
  personalizedSetup: null, // async, handled specially below
  settings: null, // async, handled specially below
  report: null, // async, handled specially below
};

// wrap async progress/profile/history screens
function renderAsyncSafe(){
  // guarda o estado atual (ex.: questão já corrigida) na entrada do histórico, senão
  // "voltar" + "avançar" restaurava a questão sem resposta e dava pra ganhar XP de novo
  if(currentUser) replaceHistoryState();
  if(_tourClose && state.screen !== 'home') _tourClose();
  app.innerHTML = '';
  if(state.screen === 'progress'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    progressScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'profile'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    profileScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'history'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    historyScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'personalizedSetup'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    personalizedSetupScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'report'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    reportScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'settings'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    settingsScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  const fn = SCREENS[state.screen] || homeScreen;
  app.appendChild(fn());
  if(!['lesson','notePage','examRun'].includes(state.screen)) app.appendChild(bottomNav());
}
render = renderAsyncSafe;

boot();
