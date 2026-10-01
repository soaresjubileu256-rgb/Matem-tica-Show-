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

/* volta ao estado inicial (tela Início) já registrando essa entrada no histórico do navegador,
   pra que "voltar" a partir de qualquer tela funcione mesmo vindo direto do login. */
function enterApp(){
  state.screen = 'home';
  // entrada "raiz" embaixo da tela Início: quando o botão voltar chega nela,
  // em vez de fechar o app direto, perguntamos se a pessoa quer mesmo sair
  try{ history.replaceState({__root:true}, '', location.pathname + location.search); }catch(e){}
  pushHistoryState();
  render();
}

/* aviso "quer sair do aplicativo?" (botão voltar do celular na tela Início) */
let _exitAsking = false;
function askExitApp(){
  if(_exitAsking) return;
  _exitAsking = true;
  const streak = gameStreakNow();
  showConfirm({
    icon:'👋', title:'Quer sair do app?',
    message: streak>0 ? `Seu progresso fica salvo. Volte amanhã pra manter sua ofensiva de ${streak} dia${streak===1?'':'s'}! 🔥` : 'Seu progresso fica salvo neste aparelho. Volte logo pra continuar o show! 🎬',
    ok:'Sair', cancel:'Ficar',
  }).then(ok=>{
    _exitAsking = false;
    if(!ok){ pushHistoryState(); render(); return; }
    // tenta sair de verdade (volta pra página anterior / fecha o app instalado);
    // se o navegador não deixar, mostra a tela de despedida
    app.innerHTML = '';
    const bye = h(`<div class="content lesson-end"><div class="le-mascot">${mascotSVG('joy',120)}</div><h2 class="le-title">Até logo! 👋</h2><p class="le-sub">Seu progresso está salvo. Pode fechar o app.</p><div class="lesson-footer static"><button class="show-btn">Voltar pro app</button></div></div>`);
    bye.querySelector('button').onclick = ()=>{ pushHistoryState(); render(); };
    app.appendChild(bye);
    try{ history.back(); }catch(e){}
    setTimeout(()=>{ try{ window.close(); }catch(e){} }, 250);
  });
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
  if(!currentUser) return; // ainda na tela de login/cadastro — nada pra restaurar
  if(e.state && e.state.__root){ askExitApp(); return; }
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
