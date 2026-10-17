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
  try{ const f = app.firstElementChild; if(f && !(typeof ASYNC_SCREENS!=='undefined' && ASYNC_SCREENS[screen]) && !['lesson','exerciseSession','challengeSession','personalizedSession','reviewErrorsSession','notePage'].includes(screen)) f.classList.add('screen-in'); }catch(e){}
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
  if(state.screen==='provaRun') return s.kind==='provaSim' && !s.submitted;
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

/* ---------------- abas no topo de cada seção ----------------
   Cada seção mostra suas páginas como abas logo abaixo do título. "match" diz em quais telas
   a aba fica acesa (ex.: o Desafio do Dia tem 3 telas). Telas de jogo/sessão não têm abas. */
const SECTION_TABS = [
  {id:'progress', tabs:[
    {screen:'progress', ico:'📈', label:'Resumo'},
    {screen:'report', ico:'📊', label:'Relatório'},
    {screen:'history', ico:'🕘', label:'Histórico'},
    {screen:'achievements', ico:'🏅', label:'Conquistas'},
    {screen:'certificates', ico:'📜', label:'Certificados'},
  ]},
  {id:'study', tabs:[
    {screen:'content', ico:'📖', label:'Aprender'},
    {screen:'exercisesSubjects', ico:'✎', label:'Exercícios'},
    {screen:'exams', ico:'🎓', label:'Provas'},
    {screen:'personalizedSetup', ico:'🎯', label:'Treino'},
    {screen:'challengeDifficulty', ico:'🏆', label:'Desafios'},
    {screen:'stepSetup', ico:'🪜', label:'Passo a passo'},
    {screen:'tabuada', ico:'✖️', label:'Tabuada'},
    {screen:'errors', ico:'🔁', label:'Erros'},
    {screen:'geoLab', ico:'🔺', label:'Laboratório', extra:{geoBack:'content'}},
  ]},
  {id:'arena', tabs:[
    {screen:'arena', ico:'⚔️', label:'Arena'},
    {screen:'dailyIntro', ico:'📅', label:'Desafio do Dia', match:['dailyIntro','arenaDaily','dailyReview']},
    {screen:'examSetup', ico:'📝', label:'Simulado', match:['examSetup','examResult']},
    {screen:'lightning', ico:'⚡', label:'Relâmpago'},
    {screen:'quizSetup', ico:'🎤', label:'Quiz'},
    {screen:'duel', ico:'🤝', label:'Duelo'},
  ]},
  {id:'tools', tabs:[
    {screen:'solve', ico:'🔎', label:'Resolver'},
    {screen:'calculator', ico:'🧮', label:'Calculadora'},
    {screen:'notebook', ico:'✏️', label:'Caderno'},
  ]},
  {id:'profile', tabs:[
    {screen:'profile', ico:'👤', label:'Perfil'},
    {screen:'settings', ico:'⚙️', label:'Configurações'},
    {screen:'news', ico:'🔔', label:'Novidades'},
    {screen:'help', ico:'📘', label:'Ajuda'},
  ]},
];
function sectionOf(screen){
  for(const sec of SECTION_TABS){ const t = sec.tabs.find(t=> (t.match||[t.screen]).includes(screen)); if(t) return {sec, tab:t}; }
  return null;
}
/* ---------- modos que vão sendo liberados ----------
   Pra quem chega agora o app mostra só o essencial; os outros modos aparecem nas abas
   quando a pessoa responde um certo número de questões (ou liga "Mostrar todos os modos").
   Um modo liberado nunca volta a ficar escondido. */
const MODE_UNLOCKS = {
  stepSetup:10, errors:10, lightning:15, personalizedSetup:20, geoLab:30, examSetup:30,
  challengeDifficulty:40, quizSetup:50, duel:60,
};
function modesSeenData(){
  const g = loadGame();
  if(!g.modesSeen){ // primeira vez: o que a pessoa já alcançou fica liberado em silêncio
    const n = totalAnswered(); g.modesSeen = {};
    Object.entries(MODE_UNLOCKS).forEach(([k,need])=>{ if(n >= need) g.modesSeen[k] = Date.now(); });
    saveGame();
  }
  return g.modesSeen;
}
function showAllModes(){ return !!(currentSettingsSync() || {}).showAllModes; }
function modeUnlocked(screen){
  const need = MODE_UNLOCKS[screen];
  if(!need || showAllModes()) return true;
  return !!modesSeenData()[screen] || totalAnswered() >= need;
}
/* chamado depois de cada resposta: avisa quando um modo novo é liberado */
function checkModeUnlocks(){
  const seen = modesSeenData(), n = totalAnswered();
  Object.entries(MODE_UNLOCKS).forEach(([k,need])=>{
    if(!seen[k] && n >= need){
      seen[k] = Date.now(); saveGame();
      const t = SECTION_TABS.flatMap(s=>s.tabs).find(t=>t.screen===k);
      if(t && !showAllModes()) queueToast('🔓', 'Modo novo liberado!', `${t.ico} ${t.label}`);
    }
  });
}
function lockedModesList(sec){
  const n = totalAnswered();
  return sec.tabs.filter(t=> !modeUnlocked(t.screen)).map(t=>({t, left: MODE_UNLOCKS[t.screen] - n}));
}

const secTabsScroll = {}; // posição de cada barra de abas, pra não voltar pro começo ao trocar de aba
function sectionTabsEl(){
  const found = sectionOf(state.screen);
  if(!found) return null;
  const bar = h(`<nav class="sec-tabs" role="tablist" aria-label="Páginas desta seção"></nav>`);
  found.sec.tabs.forEach(t=>{
    const on = t===found.tab;
    if(!on && !modeUnlocked(t.screen)) return; // ainda não liberado (a aba aberta sempre aparece)
    const b = h(`<button type="button" role="tab" class="sec-tab ${on?'on':''}" aria-selected="${on}"><span>${t.ico}</span>${t.label}</button>`);
    b.onclick = ()=>{ if(!on) go(t.screen, t.extra||{}); };
    bar.appendChild(b);
  });
  // modos escondidos: um botão com cadeado mostra o que falta pra liberar cada um
  const locked = lockedModesList(found.sec).filter(x=> x.t !== found.tab);
  if(locked.length){
    const b = h(`<button type="button" class="sec-tab sec-lock" aria-label="${locked.length} modos ainda bloqueados"><span>🔒</span>+${locked.length}</button>`);
    b.onclick = ()=> showConfirm({icon:'🔓', title:'Mais modos vêm aí!',
      message: 'Eles aparecem aqui conforme você responde questões:\n\n' + locked.sort((a,b)=>a.left-b.left).map(x=>`${x.t.ico} ${x.t.label}: faltam ${x.left} questão${x.left===1?'':'ões'}`.replace('questãoões','questões')).join('\n'),
      ok:'Continuar estudando', cancel:'Mostrar todos agora', backdropValue:null}).then(ok=>{ if(ok===false){ loadSettings().then(st=>{ st.showAllModes = true; return saveSettings(); }).then(()=>{ queueToast('🔓', 'Todos os modos liberados', 'Dá pra mudar em Configurações'); render(); }); } });
    bar.appendChild(b);
  }
  // a barra nova abre na mesma posição da anterior (da mesma seção) e só anda se a aba acesa
  // ficar escondida; a posição é aplicada antes de a tela ser pintada, então nada pula
  const memo = secTabsScroll[found.sec.id];
  let settled = false;
  bar._settle = ()=>{
    if(settled || !bar.isConnected) return;
    settled = true;
    if(memo != null) bar.scrollLeft = memo;
    const o = bar.querySelector('.sec-tab.on');
    if(o && bar.scrollWidth > bar.clientWidth && (o.offsetLeft < bar.scrollLeft || o.offsetLeft + o.offsetWidth > bar.scrollLeft + bar.clientWidth)){
      const to = o.offsetLeft - (bar.clientWidth - o.offsetWidth)/2;
      if(memo != null) bar.scrollTo({left:to, behavior:'smooth'}); else bar.scrollLeft = to;
    }
    secTabsScroll[found.sec.id] = bar.scrollLeft;
    bar.addEventListener('scroll', ()=>{ secTabsScroll[found.sec.id] = bar.scrollLeft; }, {passive:true});
  };
  requestAnimationFrame(bar._settle); // reserva: render() já chama _settle logo depois de pôr a tela
  return bar;
}
/* acerta a posição das barras de abas logo depois de a tela entrar na página */
function settleTabs(){ app.querySelectorAll('.sec-tabs').forEach(b=> b._settle && b._settle()); }
/* coloca as abas logo depois da barra de título da tela */
function withSectionTabs(el){
  const bar = sectionTabsEl();
  if(!bar || !el) return el;
  const top = el.querySelector(':scope > .topbar');
  if(top) top.after(bar); else el.prepend(bar);
  return el;
}

/* ---------------- barra de navegação inferior ----------------
   5 botões: Início, Trilha, Estudar (Aprender + Exercícios, em abas), Arena e Progresso.
   "Estudar" volta pra última aba usada. A Arena mostra uma bolinha se o Desafio do Dia não foi feito. */
const BN_ICONS = {
  home:'<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  path:'<path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4z"/><path d="M9 4v14M15 6.5v14"/>',
  study:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8.5 7.5h7M8.5 11h5"/>',
  arena:'<path d="M8 3.5h8v5.5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.6 4.4M16 5.5h2.5a2.5 2.5 0 0 1-2.6 4.4M12 13v3.5M8.5 20.5h7M10 16.5h4"/>',
  progress:'<path d="M3.5 20.5h17"/><path d="M6.5 20.5v-6M11.5 20.5V6M16.5 20.5v-9.5"/><path d="m5 10.5 5-5 4 3 5.5-5"/>',
};
const STUDY_SCREENS = ['content','subjectDetail','geoLab','cardsDeck','exercisesSubjects','exerciseDifficulty','exerciseSession','personalizedSetup','personalizedSession','challengeDifficulty','challengeSession','tabuada','errors','reviewErrorsSession','stepSetup','stepGuide','exams'];
const BOTTOM_NAV_ITEMS = [
  {id:'home', screen:'home', label:'Início', group:['home','calculator','solve','notebook','notePage','help','news','profile','settings','placement','plan']},
  {id:'path', screen:'path', label:'Trilha', group:['path']},
  {id:'study', screen:'content', label:'Estudar', group:STUDY_SCREENS},
  {id:'arena', screen:'arena', label:'Arena', group:['arena','arenaDaily','dailyIntro','dailyReview','examSetup','examResult','lightning','quizSetup','duel']},
  {id:'progress', screen:'progress', label:'Progresso', group:['progress','report','history','achievements','certificates','certificate']},
];
function bottomNav(){
  const bar = h(`<nav class="bottom-nav" aria-label="Menu principal"></nav>`);
  // lembra a última aba de Estudar pra voltar nela
  const sec = typeof sectionOf==='function' ? sectionOf(state.screen) : null;
  if(sec && sec.sec.id==='study') state.lastStudy = sec.tab.screen;
  let dailyPending = false;
  try{ dailyPending = typeof arenaData==='function' && !arenaData().daily[isoDay()]; }catch(e){}
  BOTTOM_NAV_ITEMS.forEach(item=>{
    const active = item.group.includes(state.screen);
    const dot = item.id==='arena' && dailyPending && !active;
    const btn = h(`<button class="bn-item ${active?'active':''}" ${active?'aria-current="page"':''}><span class="bn-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${BN_ICONS[item.id]}</svg>${dot?'<i class="bn-dot" title="Desafio do Dia esperando"></i>':''}</span><span class="bn-label">${item.label}</span></button>`);
    const target = item.id==='study' ? (state.lastStudy || item.screen) : item.screen;
    btn.onclick = ()=>{ if(state.screen !== target) go(target, target==='geoLab' ? {geoBack:'content'} : {}); };
    bar.appendChild(btn);
  });
  return bar;
}
