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
  stepSetup: stepSetupScreen,
  exams: examsScreen,
  examDetail: examDetailScreen,
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
  bankExamRun: bankExamRunScreen,
  bankExamResult: bankExamResultScreen,
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

// telas que carregam dados antes de desenhar (são async)
const ASYNC_SCREENS = {progress:()=>progressScreen(), profile:()=>profileScreen(), history:()=>historyScreen(),
  personalizedSetup:()=>personalizedSetupScreen(), report:()=>reportScreen(), settings:()=>settingsScreen()};
let _renderSeq = 0; // cada desenho ganha um número: resultado atrasado de uma tela antiga é descartado
function renderAsyncSafe(){
  const seq = ++_renderSeq;
  // guarda o estado atual (ex.: questão já corrigida) na entrada do histórico, senão
  // "voltar" + "avançar" restaurava a questão sem resposta e dava pra ganhar XP de novo
  if(currentUser) replaceHistoryState();
  if(_tourClose && state.screen !== 'home') _tourClose();
  app.innerHTML = '';
  const make = ASYNC_SCREENS[state.screen];
  if(make){
    app.appendChild(h(`<div class="content screen-loading" role="status" aria-live="polite">Carregando…</div>`));
    Promise.resolve().then(make).then(el=>{
      if(seq !== _renderSeq) return; // a pessoa já foi para outra tela
      app.innerHTML=''; app.appendChild(withSectionTabs(el)); app.appendChild(bottomNav());
    }).catch(err=>{
      if(seq !== _renderSeq) return;
      console.error('Erro ao abrir a tela', state.screen, err);
      app.innerHTML='';
      const box = h(`<div class="content screen-error" role="alert"><div class="se-ico">😕</div><h2>Não deu para abrir esta tela</h2>
        <p>Seus dados continuam salvos. Tente de novo; se continuar, volte ao Início.</p>
        <div class="cta-row"><button type="button" class="btn primary" data-a="retry">Tentar de novo</button><button type="button" class="btn secondary" data-a="home">Ir para o Início</button></div></div>`);
      box.querySelector('[data-a=retry]').onclick = ()=> render();
      box.querySelector('[data-a=home]').onclick = ()=> go('home');
      app.appendChild(box); app.appendChild(bottomNav());
    });
    return;
  }
  const fn = SCREENS[state.screen] || homeScreen;
  app.appendChild(withSectionTabs(fn()));
  // telas de prova/aula em andamento escondem o menu de baixo (um toque nele perderia a prova)
  if(!['lesson','notePage','examRun','bankExamRun'].includes(state.screen)) app.appendChild(bottomNav());
}
render = renderAsyncSafe;

boot();
