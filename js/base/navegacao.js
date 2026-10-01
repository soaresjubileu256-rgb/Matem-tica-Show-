/* =========================================================
   Estado & roteamento
   ========================================================= */
const state = {
  screen: 'home',
  subjectId: null,
  difficulty: null,
  session: null, // {index, total, correct, wrong, current, checked, wasCorrect}
  calc: {cur:'0', prev:'', op:null, waiting:false, sciMode:false, angleMode:'DEG'},
};

function go(screen, extra={}){
  Object.assign(state, {screen}, extra);
  pushHistoryState();
  render();
  try{ const f = app.firstElementChild; if(f && !['lesson','exerciseSession','challengeSession','personalizedSession','reviewErrorsSession','notePage'].includes(screen)) f.classList.add('screen-in'); }catch(e){}
  window.scrollTo(0,0);
}

/* Rodando como APLICATIVO (APK / app instalado na tela inicial)? Só nesse caso o "voltar" pergunta
   "Tem certeza que quer sair?" e o Perfil mostra "Sair do aplicativo". No site (aba do navegador), não. */
const IS_APP = (()=>{
  try{
    if(sessionStorage.getItem('ms-app') === '1') return true;
    const ua = navigator.userAgent || '';
    const yes = /; wv\)|\bwv\b/.test(ua)                                  // WebView do Android (conversores de site → APK)
      || (document.referrer || '').startsWith('android-app://')                // TWA (PWABuilder / Bubblewrap)
      || matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches
      || navigator.standalone === true                                         // iPhone, app na tela inicial
      || new URLSearchParams(location.search).has('app');                      // o conversor pode abrir index.html?app=1
    if(yes) sessionStorage.setItem('ms-app', '1');
    return yes;
  }catch(e){ return false; }
})();
/* entrada "raiz" no histórico: quando o "voltar" chega nela, o app pergunta se quer sair (só no aplicativo) */
function armExitGuard(){
  if(!IS_APP) return;
  try{ history.replaceState({__root:true}, '', location.pathname + location.search); }catch(e){}
  try{ history.pushState(currentUser ? cloneState(state) : {__auth:true}, '', currentUser ? hashForState(state) : location.pathname + location.search); }catch(e){}
}

/* volta ao estado inicial (tela Início) já registrando essa entrada no histórico do navegador,
   pra que "voltar" a partir de qualquer tela funcione mesmo vindo direto do login. */
function enterApp(){
  state.screen = 'home';
  // no aplicativo: entrada "raiz" embaixo da tela Início — quando o botão voltar chega nela,
  // em vez de fechar o app direto, perguntamos se a pessoa quer mesmo sair
  if(IS_APP) armExitGuard(); else pushHistoryState();
  render();
}

/* "Tem certeza que quer sair?" — botão voltar na tela Início (ou na entrada) e botão "Sair do aplicativo".
   Só existe no aplicativo; no site o voltar funciona normal. */
let _exitAsking = false, _exitConfirmed = false;
function askExitApp(fromButton){
  if(_exitAsking) return;
  _exitAsking = true;
  const streak = currentUser ? gameStreakNow() : 0;
  showConfirm({
    icon:'👋', title:'Tem certeza que quer sair?',
    message: streak>0 ? `Seu progresso fica salvo. Volte amanhã pra manter sua ofensiva de ${streak} dia${streak===1?'':'s'}! 🔥` : 'Seu progresso fica salvo neste aparelho. Volte logo pra continuar o show! 🎬',
    ok:'Sair', cancel:'Ficar',
  }).then(ok=>{
    _exitAsking = false;
    if(!ok){
      // continua no app: devolve a entrada que o "voltar" consumiu
      if(!fromButton){ if(currentUser){ pushHistoryState(); render(); } else { try{ history.pushState({__auth:true}, '', location.pathname + location.search); }catch(e){} } }
      return;
    }
    _exitConfirmed = true;
    exitApp();
  });
}
function exitApp(){
  // 1) pontes que alguns conversores de APK oferecem para fechar o app
  try{ if(navigator.app && navigator.app.exitApp) return navigator.app.exitApp(); }catch(e){}
  try{ if(window.Android && typeof window.Android.exitApp === 'function') return window.Android.exitApp(); }catch(e){}
  try{ if(window.AndroidInterface && typeof window.AndroidInterface.exitApp === 'function') return window.AndroidInterface.exitApp(); }catch(e){}
  // 2) tela de despedida; o próximo "voltar" fecha o app (já não há mais nada no histórico)
  app.innerHTML = '';
  const bye = h(`<div class="content lesson-end"><div class="le-mascot">${mascotSVG('joy',120)}</div><h2 class="le-title">Até logo! 👋</h2><p class="le-sub">Seu progresso está salvo.<br>Toque em <b>voltar</b> no celular pra fechar o app.</p><div class="lesson-footer static"><button class="show-btn">Voltar pro app</button></div></div>`);
  bye.querySelector('button').onclick = ()=>{ _exitConfirmed = false; if(currentUser){ armExitGuard(); render(); } else { armExitGuard(); boot(); } };
  app.appendChild(bye);
  try{ history.go(-(history.length)); }catch(e){}
  setTimeout(()=>{ try{ window.close(); }catch(e){} }, 250);
}

/* sessão em andamento? (usado no aviso ao fechar/recarregar a aba) */
function sessionInProgress(){
  const s = state.session;
  if(!s) return false;
  if(state.screen==='lesson') return !s.finished && !s.failed && (s.asked>1 || s.checked);
  if(['exerciseSession','challengeSession','personalizedSession','reviewErrorsSession'].includes(state.screen))
    return s.index < s.total && (s.index>0 || s.checked);
  if(state.screen==='examRun') return s.kind==='exam' && !s.submitted;
  return false;
}
window.addEventListener('beforeunload', (e)=>{
  if(currentUser && sessionInProgress()){ e.preventDefault(); e.returnValue = ''; }
});

/* =========================================================
   Navegação com URL real (History API): cada tela vira uma entrada
   no histórico do navegador, com hash próprio (#tela/param) e o
   estado completo salvo junto — assim "voltar"/"avançar" no navegador
   restauram a tela exatamente como estava (inclusive sessão em
   andamento, calculadora, etc.), sem depender só da URL.
   ========================================================= */
function hashForState(s){
  let hash = '#' + s.screen;
  if(s.subjectId) hash += '/' + s.subjectId;
  if(s.difficulty) hash += '/' + s.difficulty;
  return hash;
}
function cloneState(s){
  try{ return JSON.parse(JSON.stringify(s)); }catch(e){ return null; }
}
function pushHistoryState(){
  try{ history.pushState(cloneState(state), '', hashForState(state)); }catch(e){}
}
function replaceHistoryState(){
  try{ history.replaceState(cloneState(state), '', hashForState(state)); }catch(e){}
}
window.addEventListener('popstate', (e)=>{
  if(e.state && e.state.__root && IS_APP && !_exitConfirmed){ askExitApp(); return; }
  if(!currentUser) return; // ainda na tela de login/cadastro — nada pra restaurar
  if(e.state){
    Object.assign(state, e.state);
  } else {
    state.screen = 'home';
  }
  render();
  window.scrollTo(0,0);
});

const app = document.getElementById('app');
function render(){
  app.innerHTML = '';
  const el = SCREENS[state.screen] ? SCREENS[state.screen]() : SCREENS.home();
  app.appendChild(el);
}
function h(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

function topbar(title, showBack, onBack){
  const bar = h(`<div class="topbar"></div>`);
  if(showBack){
    const b = h(`<button class="back-btn" aria-label="Voltar">‹</button>`);
    b.onclick = onBack || (()=>go('home'));
    bar.appendChild(b);
    const t = h(`<div class="screen-title"></div>`); t.textContent = title;
    bar.appendChild(t);
  } else {
    const brand = h(`<div class="brand"><span class="mark"><img src="${LOGO_URI}" alt="Matemática Show"></span><h1>Matemática Show</h1></div>`);
    bar.appendChild(brand);
  }
  return bar;
}

/* ---------------- barra de navegação inferior ---------------- */
const BOTTOM_NAV_ITEMS = [
  {screen:'home', icon:'⌂', label:'Início', group:['home','calculator','solve','notebook','notePage','help','profile','settings','placement','plan']},
  {screen:'path', icon:'★', label:'Trilha', group:['path']},
  {screen:'content', icon:'∑', label:'Aprender', group:['content','subjectDetail','geoLab','cardsDeck']},
  {screen:'exercisesSubjects', icon:'✎', label:'Exercícios', group:['exercisesSubjects','exerciseDifficulty','exerciseSession','personalizedSetup','personalizedSession','challengeDifficulty','challengeSession','tabuada','errors','reviewErrorsSession']},
  {screen:'arena', icon:'⚔', label:'Arena', group:['arena','arenaDaily','dailyIntro','dailyReview','examSetup','examResult','lightning','quizSetup','duel']},
  {screen:'progress', icon:'↑', label:'Progresso', group:['progress','report','history','achievements','certificates','certificate']},
];
function bottomNav(){
  const bar = h(`<div class="bottom-nav"></div>`);
  BOTTOM_NAV_ITEMS.forEach(item=>{
    const active = item.group.includes(state.screen);
    const btn = h(`<button class="bn-item ${active?'active':''}"><span class="bn-icon">${item.icon}</span><span class="bn-label">${item.label}</span></button>`);
    btn.onclick = ()=>{ if(state.screen !== item.screen) go(item.screen); };
    bar.appendChild(btn);
  });
  return bar;
}
