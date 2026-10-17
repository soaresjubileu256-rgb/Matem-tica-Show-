/* =========================================================
   INICIAR O APP
   Tabela de telas (SCREENS), desenho das telas que carregam dados e o boot().
   Precisa ser o último script da página.
   ========================================================= */
/* ---------------- router table ---------------- */
const SCREENS = {
  home: homeScreen,
  loja: lojaScreen,
  content: contentScreen,
  subjectDetail: subjectDetailScreen,
  exercisesSubjects: exercisesSubjectsScreen,
  exerciseDifficulty: exerciseDifficultyScreen,
  exerciseSession: exerciseSessionScreen,
  reviewErrorsSession: reviewErrorsSessionScreen,
  challengeDifficulty: challengeDifficultyScreen,
  challengeSession: challengeSessionScreen,
  personalizedSession: personalizedSessionScreen,
  stepSetup: stepSetupScreen,
  exams: examsScreen,
  provaRun: provaRunScreen,
  provaResult: provaResultScreen,
  stepGuide: stepGuideScreen,
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

// telas que carregam dados antes de aparecer (progresso, perfil, histórico...)
const ASYNC_SCREENS = {progress:()=>progressScreen(), profile:()=>profileScreen(), history:()=>historyScreen(),
  personalizedSetup:()=>personalizedSetupScreen(), report:()=>reportScreen(), settings:()=>settingsScreen()};
let renderToken = 0;
function renderAsyncSafe(){
  // guarda o estado atual (ex.: questão já corrigida) na entrada do histórico, senão
  // "voltar" + "avançar" restaurava a questão sem resposta e dava pra ganhar XP de novo
  if(currentUser){ replaceHistoryState(); applyShopLook(); }
  if(_tourClose && state.screen !== 'home') _tourClose();
  const token = ++renderToken; // uma tela que termina de carregar depois de outra ter aberto é descartada
  const load = ASYNC_SCREENS[state.screen];
  if(load){
    // a tela de antes continua até a nova ficar pronta (sem piscar "Carregando…" e as abas);
    // o aviso só aparece se demorar
    const wait = setTimeout(()=>{
      if(token !== renderToken) return;
      app.innerHTML = '';
      app.appendChild(h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`));
    }, 400);
    load().then(el=>{
      clearTimeout(wait);
      if(token !== renderToken) return;
      el.classList.add('screen-in'); // a animação de entrada vai na tela nova, não na que estava saindo
      app.innerHTML = ''; app.appendChild(withSectionTabs(el)); app.appendChild(bottomNav()); settleTabs();
    });
    return;
  }
  app.innerHTML = '';
  const fn = SCREENS[state.screen] || homeScreen;
  app.appendChild(withSectionTabs(fn()));
  settleTabs();
  if(!['lesson','notePage','examRun','provaRun'].includes(state.screen)) app.appendChild(bottomNav());
}
render = renderAsyncSafe;

boot();
