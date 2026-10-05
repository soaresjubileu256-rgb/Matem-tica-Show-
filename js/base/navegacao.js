/* =========================================================
   Estado & roteamento
   ========================================================= */
const state = {
  screen: 'home',
  subjectId: null,
  difficulty: null,
  session: null, // {index, total, correct, wrong, current, checked, wasCorrect}
  calc: {expr:'', done:false, res:'', resRaw:'', prevLine:'', err:'', sciMode:false, angleMode:'DEG'},
};

function go(screen, extra={}){
  Object.assign(state, {screen}, extra);
  pushHistoryState();
  render();
  try{ const f = app.firstElementChild; if(f && !['lesson','exerciseSession','challengeSession','personalizedSession','reviewErrorsSession','notePage'].includes(screen)) f.classList.add('screen-in'); }catch(e){}
  window.scrollTo(0,0);
}

/* volta ao estado inicial (tela Início): a tela Início vira a primeira entrada do histórico,
   então o "voltar" a partir dela sai do app/site direto, sem pergunta. */
function enterApp(){
  state.screen = 'home';
  replaceHistoryState();
  render();
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
  {screen:'home', icon:'⌂', label:'Início', group:['home','calculator','solve','notebook','notePage','help','news','profile','settings','placement','plan']},
  {screen:'path', icon:'★', label:'Trilha', group:['path']},
  {screen:'content', icon:'∑', label:'Aprender', group:['content','subjectDetail','geoLab','cardsDeck']},
  {screen:'exercisesSubjects', icon:'✎', label:'Exercícios', group:['exercisesSubjects','exerciseDifficulty','exerciseSession','personalizedSetup','personalizedSession','challengeDifficulty','challengeSession','tabuada','errors','reviewErrorsSession','enemSetup','enemRun','stepSetup','stepGuide']},
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
