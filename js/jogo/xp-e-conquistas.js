/* =========================================================
   Camada de jogo — XP, níveis, combo, ofensiva de dias,
   missões diárias, conquistas e efeitos (confete, toasts).
   Tudo salvo por conta, como o resto do progresso.
   ========================================================= */
const GAME_KEY_BASE = 'mathstudy-game-v1';
const XP_BY_DIFFICULTY = {facil:10, medio:15, dificil:25};
const LEVEL_TITLES = [
  [1,'Aprendiz dos Números 🐣'], [3,'Contador Curioso 🔢'], [5,'Calculista Veloz ⚡'],
  [8,'Mestre das Contas 🧮'], [12,'Mago da Álgebra 🧙'], [16,'Gênio das Equações 🧠'],
  [20,'Lenda da Matemática 👑'],
];
const ACHIEVEMENTS = [
  {id:'first',     ico:'🌱', name:'Primeiro acerto',   desc:'Acerte sua 1ª questão'},
  {id:'combo5',    ico:'🔥', name:'Pegando fogo',      desc:'Combo de 5 acertos'},
  {id:'combo10',   ico:'☄️', name:'Imparável',         desc:'Combo de 10 acertos'},
  {id:'hits50',    ico:'🎯', name:'Mira certeira',     desc:'50 acertos no total'},
  {id:'hits200',   ico:'🏹', name:'Atirador de elite', desc:'200 acertos no total'},
  {id:'hits500',   ico:'💎', name:'Diamante',          desc:'500 acertos no total'},
  {id:'perfect',   ico:'⭐', name:'Perfeição',         desc:'Sessão com 100% de acerto'},
  {id:'streak3',   ico:'📅', name:'Constância',        desc:'3 dias seguidos jogando'},
  {id:'streak7',   ico:'🗓️', name:'Semana de fogo',    desc:'7 dias seguidos jogando'},
  {id:'streak14',  ico:'🌋', name:'Chama firme',       desc:'14 dias seguidos jogando'},
  {id:'streak30',  ico:'☀️', name:'Mês em chamas',     desc:'30 dias seguidos jogando'},
  {id:'level5',    ico:'🚀', name:'Decolando',         desc:'Chegue ao nível 5'},
  {id:'level10',   ico:'🏅', name:'Veterano',          desc:'Chegue ao nível 10'},
  {id:'hard10',    ico:'💪', name:'Sem medo',          desc:'10 acertos no difícil'},
  {id:'fixer',     ico:'🔧', name:'Conserta-tudo',     desc:'Corrija 10 erros na revisão'},
  {id:'explorer',  ico:'🧭', name:'Explorador',        desc:'Acerte em 6 assuntos diferentes'},
  {id:'bolt15',    ico:'⚡', name:'Relâmpago',         desc:'15 pontos no Modo Relâmpago'},
  {id:'bolt30',    ico:'🌩️', name:'Tempestade',        desc:'30 pontos no Modo Relâmpago'},
  {id:'missions',  ico:'📜', name:'Missão cumprida',   desc:'Complete as 3 missões do dia'},
  {id:'goal',      ico:'🏁', name:'Meta batida',       desc:'Bata a meta diária'},
  {id:'unit',      ico:'🗺️', name:'Desbravador',       desc:'Vença a grande final de um episódio'},
  {id:'chests',    ico:'🎁', name:'Caça-prêmios',      desc:'Abra 5 prêmios surpresa'},
  {id:'quiz5000',  ico:'🎤', name:'Estrela do Quiz',   desc:'Faça 10.000 pontos no Quiz do Show'},
  // --- fusão com o Arena: conquistas novas. As que têm check() são conferidas sozinhas
  //     (gameCheckAchievements); para criar outra basta acrescentar uma linha aqui.
  {id:'ans10',     ico:'✏️', name:'Aquecendo',         desc:'Responda 10 questões',       check:g=>totalAnswered()>=10},
  {id:'ans100',    ico:'💯', name:'Cem questões',      desc:'Responda 100 questões',      check:g=>totalAnswered()>=100},
  {id:'arenaWin',  ico:'⚔️', name:'Primeira vitória na Arena', desc:'Ganhe estrela numa fase da Arena'},
  {id:'arenaPerfect', ico:'🌟', name:'Fase perfeita',  desc:'3 estrelas numa fase da Arena'},
  {id:'arenaStars30', ico:'🌌', name:'Constelação',    desc:'Junte 30 estrelas na Arena', check:g=>arenaTotalStars()>=30},
  {id:'daily1',    ico:'📅', name:'Desafiante',        desc:'Complete um Desafio do Dia'},
  {id:'daily7',    ico:'🗓️', name:'Desafio da semana', desc:'Complete 7 Desafios do Dia'},
  {id:'exam1',     ico:'📝', name:'Primeira prova',    desc:'Faça um simulado'},
  {id:'exam10',    ico:'🏆', name:'Nota 10',           desc:'Tire 10 num simulado de 10+ questões'},
  {id:'notebook5', ico:'🩹', name:'Aprendi com o erro', desc:'Tire 5 questões do caderno de erros', check:g=>(g.errLearned||0)>=5},
  {id:'masterFrac', ico:'🍕', name:'Mestre das frações', desc:'Chegue a Dominado em Frações', check:g=>masteryOf(progressSync().fracoes).lvl>=4},
  {id:'placement', ico:'🧭', name:'Ponto de partida',  desc:'Faça o teste de nivelamento'},
  {id:'plan',      ico:'🗺️', name:'Estrategista',      desc:'Crie um plano de estudos'},
  {id:'solver10',  ico:'🔍', name:'Detetive',          desc:'Resolva 10 contas no Resolver', check:g=>(g.solves||0)>=10},
  {id:'duelist',   ico:'🤝', name:'Duelista',          desc:'Jogue um duelo a dois'},
];
function totalAnswered(){ return Object.values(progressSync()).reduce((a,d)=>a+((d&&d.attempted)||0),0); }
/* confere as conquistas automáticas (as que têm check) */
function gameCheckAchievements(){
  const g = loadGame();
  ACHIEVEMENTS.forEach(a=>{ if(a.check && !g.ach[a.id]){ try{ if(a.check(g)) gameUnlock(a.id); }catch(e){} } });
}
const DAILY_MISSIONS = [
  {id:'lesson', ico:'🗺️', reward:30, title:()=>'Complete 1 fase da trilha', progress:g=>[Math.min(g.today.lessons||0,1), 1]},
  {id:'goal',  ico:'🎯', reward:40, title:g=>`Responda ${g.goal} questões`,   progress:g=>[g.today.answered, g.goal]},
  {id:'combo', ico:'🔥', reward:30, title:()=>'Faça um combo de 5 acertos',   progress:g=>[Math.min(g.today.bestCombo,5), 5]},
  {id:'bolt',  ico:'⚡', reward:30, title:()=>'Jogue uma partida Relâmpago',  progress:g=>[Math.min(g.today.bolts,1), 1]},
];

let gameCache = null, gameCacheUid = null;
function dayKey(d){ d = d || new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function loadGame(){
  const uid = currentUserId();
  if(gameCache && gameCacheUid===uid) return gameCache;
  let g = null;
  try{ const raw = localStorage.getItem(`${GAME_KEY_BASE}:${uid}`); g = raw ? JSON.parse(raw) : null; }catch(e){}
  gameCache = Object.assign({xp:0, streak:0, lastDay:null, bestCombo:0, hits:0, hardHits:0, fixed:0, boltBest:0, subjectsHit:{}, ach:{}, today:null}, g||{});
  gameCacheUid = uid;
  gameEnsureToday();
  gameCheckStreak();
  return gameCache;
}
function saveGame(){
  try{ localStorage.setItem(`${GAME_KEY_BASE}:${gameCacheUid}`, JSON.stringify(gameCache)); }catch(e){}
}
function gameEnsureToday(){
  const g = gameCache, k = dayKey();
  if(!g.today || g.today.day !== k) g.today = {day:k, answered:0, bestCombo:0, bolts:0, claimed:{}};
}
/* ---------- ofensiva (dias seguidos) ----------
   - g.days guarda o histórico recente: 1 = jogou ('f' = dia salvo por protetor, só em dados antigos)
   - passou um dia inteiro sem jogar, a ofensiva volta pra zero (não existe mais protetor)
   - marcos (3, 7, 14, 30...) dão moedas e uma comemoração */
const STREAK_DAYS_KEEP = 70;
const STREAK_MILESTONES = [[3,10],[7,25],[14,40],[30,75],[50,100],[100,200],[200,300],[365,500]];
function keyToDate(k){ const [y,m,d] = String(k).split('-').map(Number); return new Date(y, m-1, d); }
function dayDiff(a, b){ return Math.round((keyToDate(b) - keyToDate(a)) / 864e5); } // b - a, em dias
function dayShift(n){ const d = new Date(); d.setDate(d.getDate()+n); return dayKey(d); }
/* ofensiva "viva" a partir dos dados salvos, sem alterar nada (serve pra outras contas também) */
function streakFromData(g){
  if(!g || !g.lastDay || !g.streak) return 0;
  const gap = dayDiff(g.lastDay, dayKey());
  return gap<=1 ? g.streak : 0; // jogou hoje ou ontem: vale; pulou um dia inteiro: zerou
}
/* ao abrir o jogo (e quando o dia vira): se pulou um dia inteiro, a ofensiva zera */
function gameCheckStreak(){
  const g = gameCache;
  if(g.days===undefined){
    // conta antiga: reconstrói o histórico a partir da ofensiva atual
    g.days = {};
    if(g.lastDay && g.streak){
      const last = keyToDate(g.lastDay);
      for(let i=0; i<Math.min(g.streak, STREAK_DAYS_KEEP); i++){ const d = new Date(last); d.setDate(d.getDate()-i); g.days[dayKey(d)] = 1; }
    }
  }
  if(g.bestStreak===undefined) g.bestStreak = g.streak||0;
  if(!g.lastDay || !g.streak) return;
  const gap = dayDiff(g.lastDay, dayKey());
  if(gap<=1) return;
  g.streakNote = {type:'lost', streak:g.streak};
  g.streak = 0;
  saveGame();
}
function streakNextMilestone(n){ return STREAK_MILESTONES.find(([d])=>d>n) || null; }
/* marca que jogou hoje e atualiza a ofensiva de dias seguidos */
function gameTouchDay(){
  const g = loadGame();
  gameEnsureToday();
  const k = dayKey();
  if(g.lastDay !== k){
    g.streak = (g.lastDay===dayShift(-1)) ? g.streak+1 : 1;
    g.lastDay = k;
    g.days[k] = 1;
    // mantém só o histórico recente
    Object.keys(g.days).forEach(d=>{ if(dayDiff(d, k) > STREAK_DAYS_KEEP) delete g.days[d]; });
    const record = g.streak > (g.bestStreak||0);
    if(record) g.bestStreak = g.streak;
    if(g.streak>=3) gameUnlock('streak3');
    if(g.streak>=7) gameUnlock('streak7');
    if(g.streak>=14) gameUnlock('streak14');
    if(g.streak>=30) gameUnlock('streak30');
    const ms = STREAK_MILESTONES.find(([d])=>d===g.streak);
    if(ms){
      g.gems = (g.gems||0) + ms[1];
      queueToast('🔥', `Ofensiva de ${g.streak} dias!`, `Marco alcançado: +${ms[1]} 🪙 moedas`);
      launchConfetti(140);
    } else {
      queueToast('🔥', g.streak===1 ? 'Ofensiva acesa!' : `${g.streak} dias seguidos!`,
        record && g.streak>1 ? 'Novo recorde de ofensiva! 🏆' : 'Volte amanhã pra manter a chama acesa');
    }
  }
}
/* ofensiva: vale se jogou hoje ou ontem; senão 0 */
function gameStreakNow(){ return streakFromData(loadGame()); }
function playedToday(){ return loadGame().lastDay===dayKey(); }
/* aviso pendente de ofensiva perdida, mostrado uma vez */
function showStreakNote(){
  const g = loadGame(), n = g.streakNote;
  if(!n) return;
  delete g.streakNote; saveGame();
  if(n.type==='lost' && n.streak>=2) queueToast('💔', 'A ofensiva apagou', `Você tinha ${n.streak} dias. Jogue hoje pra acender de novo!`);
}
/* o app pode ficar aberto de um dia pro outro: quando o dia muda, zera a meta e as missões
   do dia, confere a ofensiva e redesenha a tela (menos no meio de uma atividade) */
let _dayWatchKey = dayKey();
function checkDayChange(){
  const k = dayKey();
  if(k === _dayWatchKey) return;
  _dayWatchKey = k;
  if(!currentUser) return;
  loadGame(); gameEnsureToday(); gameCheckStreak(); saveGame();
  const busy = ['lesson','exerciseSession','challengeSession','personalizedSession','reviewErrorsSession','notePage','lightning','duel','examRun','placement','cardsDeck'].includes(state.screen);
  if(!busy && typeof render==='function') render();
  showStreakNote();
}
setInterval(checkDayChange, 30000);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) checkDayChange(); });
window.addEventListener('focus', checkDayChange);

/* painel da ofensiva: dias da semana, recorde e próximo marco */
function showStreakPanel(){
  const g = loadGame(), streak = gameStreakNow(), today = playedToday();
  const WD = ['D','S','T','Q','Q','S','S'];
  let week = '';
  for(let i=-6; i<=0; i++){
    const k = dayShift(i), v = g.days[k], wd = WD[keyToDate(k).getDay()];
    const cls = v===1 ? 'on' : v==='f' ? 'frz' : i===0 ? 'today' : '';
    const ico = v===1 ? '🔥' : v==='f' ? '🧊' : i===0 ? '⏳' : '·';
    week += `<div class="sk-day ${cls}"><small>${wd}</small><span>${ico}</span></div>`;
  }
  const next = streakNextMilestone(streak);
  const prev = [...STREAK_MILESTONES].reverse().find(([d])=>d<=streak);
  const from = prev ? prev[0] : 0;
  const pct = next ? Math.round((streak-from)/(next[0]-from)*100) : 100;
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal sk-modal">
    <div class="big ${streak?'':'sk-off'}">🔥</div>
    <h2>${streak} dia${streak===1?'':'s'} de ofensiva</h2>
    <p>${today ? 'Você já jogou hoje. A chama está garantida! ✅'
      : streak ? 'Responda 1 pergunta hoje! Se passar o dia sem jogar, a ofensiva volta pra zero.'
      : 'Responda 1 pergunta pra acender sua ofensiva!'}</p>
    <div class="sk-week">${week}</div>
    <div class="sk-stats">
      <div><b>🏆 ${g.bestStreak||0}</b><span>recorde</span></div>
      <div><b>📅 ${Object.keys(g.days||{}).filter(k=>g.days[k]===1 && dayDiff(k, dayKey())<7).length}/7</b><span>dias nesta semana</span></div>
    </div>
    ${next ? `<div class="sk-goal"><div class="sk-goal-t">Próximo marco: <b>${next[0]} dias</b> · +${next[1]} 🪙</div><div class="sk-bar"><i style="width:${pct}%"></i></div><small>faltam ${next[0]-streak} dia${next[0]-streak===1?'':'s'}</small></div>` : ''}
    <p class="sk-help">Jogue pelo menos 1 pergunta todo dia. Ficou um dia inteiro sem jogar, a ofensiva volta pra zero.</p>
    <button type="button" class="sk-close" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Fechar</button>
  </div>`;
  const close = ()=> bg.remove();
  bg.querySelector('.sk-close').onclick = close;
  bg.addEventListener('click', e=>{ if(e.target===bg) close(); });
  document.body.appendChild(bg);
}
function xpForLevel(lv){ return 100 + (lv-1)*50; } // XP pra ir do nível lv pro lv+1
function levelInfo(xp){
  let lv = 1, rest = xp;
  while(rest >= xpForLevel(lv)){ rest -= xpForLevel(lv); lv++; }
  let title = LEVEL_TITLES[0][1];
  LEVEL_TITLES.forEach(([min,t])=>{ if(lv>=min) title = t; });
  return {level:lv, into:rest, need:xpForLevel(lv), pct:Math.round(rest/xpForLevel(lv)*100), title};
}
function escHTML(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* dá XP e verifica se subiu de nível */
function gameAddXP(amount){
  const g = loadGame();
  const before = levelInfo(g.xp).level;
  g.xp += amount;
  const after = levelInfo(g.xp);
  if(after.level > before){
    if(after.level>=5) gameUnlock('level5');
    if(after.level>=10) gameUnlock('level10');
    setTimeout(()=>showLevelUp(after), 700);
  }
}
function gameUnlock(id){
  const g = loadGame();
  if(g.ach[id]) return;
  g.ach[id] = Date.now();
  const a = ACHIEVEMENTS.find(x=>x.id===id);
  if(a) queueToast(a.ico, 'Conquista desbloqueada!', a.name);
}

/* chamado a cada resposta corrigida (exercícios, desafios, treino, revisão) */
function gameOnAnswer(subjectId, correct, difficulty, opts){
  opts = opts || {};
  const g = loadGame();
  gameTouchDay();
  g.today.answered++;
  const sess = state.session;
  const prevCombo = sess ? (sess.combo||0) : 0;
  let gain = 0;
  if(sess){ sess.combo = correct ? (sess.combo||0)+1 : 0; }
  const combo = sess ? sess.combo : (correct?1:0);
  if(correct){
    g.hits++;
    if(difficulty==='dificil') g.hardHits++;
    g.subjectsHit[subjectId] = true;
    if(opts.review) g.fixed++;
    // XP base pela dificuldade + bônus de combo (até +100%)
    const base = XP_BY_DIFFICULTY[difficulty] || 10;
    gain = Math.round(base * (1 + Math.min(combo-1, 5)*0.2));
    if(combo > g.bestCombo) g.bestCombo = combo;
    if(combo > g.today.bestCombo) g.today.bestCombo = combo;
    gameUnlock('first');
    if(combo>=5) gameUnlock('combo5');
    if(combo>=10) gameUnlock('combo10');
    if(g.hits>=50) gameUnlock('hits50');
    if(g.hits>=200) gameUnlock('hits200');
    if(g.hits>=500) gameUnlock('hits500');
    if(g.hardHits>=10) gameUnlock('hard10');
    if(g.fixed>=10) gameUnlock('fixer');
    if(Object.keys(g.subjectsHit).length>=6) gameUnlock('explorer');
    if(sess) sess.xp = (sess.xp||0) + gain;
    gameAddXP(gain);
    const inLesson = sess && (sess.kind==='lesson' || sess.kind==='quiz' || sess.kind==='placement');
    if(!inLesson) showFloat(`+${gain} XP${combo>=2? ` · 🔥x${combo}`:''}`);
    if(combo>=3) playComboSound(combo);
  } else if(prevCombo>=2 && !(sess && (sess.kind==='lesson' || sess.kind==='quiz' || sess.kind==='placement'))){
    showFloat('Combo perdido 💔', true);
  }
  const goal = (currentSettingsSync().dailyGoal)||10;
  if(g.today.answered>=goal) gameUnlock('goal');
  gameCheckAchievements();
  saveGame();
}

/* ---------- missões diárias ---------- */
function missionState(){
  const g = loadGame();
  gameEnsureToday();
  const ctx = {today:g.today, goal:(currentSettingsSync().dailyGoal)||10};
  return DAILY_MISSIONS.map(m=>{
    const [cur,max] = m.progress(ctx);
    return {m, cur:Math.min(cur,max), max, done:cur>=max, claimed:!!g.today.claimed[m.id], title:m.title(ctx)};
  });
}
function claimMission(id){
  const g = loadGame();
  const st = missionState().find(x=>x.m.id===id);
  if(!st || !st.done || st.claimed) return;
  g.today.claimed[id] = true;
  gameAddXP(st.m.reward);
  showFloat(`+${st.m.reward} XP 📜`);
  playComboSound(5);
  if(DAILY_MISSIONS.every(m=>g.today.claimed[m.id])){ gameUnlock('missions'); launchConfetti(); }
  saveGame();
}

/* ---------- efeitos visuais ---------- */
function showFloat(text, bad){
  try{
    const el = document.createElement('div');
    el.className = 'gm-float' + (bad?' bad':'');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1400);
  }catch(e){}
}
const _toastQueue = []; let _toastBusy = false;
function queueToast(ico, t1, t2){ _toastQueue.push([ico,t1,t2]); if(!_toastBusy) nextToast(); }
function nextToast(){
  const item = _toastQueue.shift();
  if(!item){ _toastBusy = false; return; }
  _toastBusy = true;
  const el = document.createElement('div');
  el.className = 'gm-toast';
  el.innerHTML = `<span class="ico">${item[0]}</span><div><div class="t1">${escHTML(item[1])}</div><div class="t2">${escHTML(item[2])}</div></div>`;
  document.body.appendChild(el);
  playTones([784,1047,1319], 0.09, 'triangle');
  setTimeout(()=>{ el.remove(); nextToast(); }, 2800);
}
function showLevelUp(info){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal"><div class="big">🏆</div><h2>Nível ${info.level}!</h2><p>Você subiu de nível e agora é<br><b style="color:#fff">${escHTML(info.title)}</b></p><button type="button">Bora continuar! 🚀</button></div>`;
  bg.querySelector('button').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
  playTones([523,659,784,1047,1319], 0.12, 'square', 0.07);
  launchConfetti(160);
}
function launchConfetti(count){
  try{
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    count = count || 110;
    const cv = document.createElement('canvas');
    cv.id = 'gm-confetti';
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth*dpr; cv.height = innerHeight*dpr;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
    const colors = ['#FFB800','#FF5C7A','#33D2E3','#4C7DFF','#B23FE0','#7CFF6B'];
    const parts = Array.from({length:count}, ()=>({
      x: innerWidth/2 + (Math.random()-.5)*80, y: innerHeight*0.35,
      vx: (Math.random()-.5)*14, vy: -Math.random()*14-4,
      w: 6+Math.random()*6, h: 8+Math.random()*8, r: Math.random()*6, vr: (Math.random()-.5)*.4,
      c: colors[Math.floor(Math.random()*colors.length)],
    }));
    const start = performance.now();
    (function frame(t){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      parts.forEach(p=>{
        p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if(t-start < 3200) requestAnimationFrame(frame); else cv.remove();
    })(start);
  }catch(e){}
}

/* ---------- pedaços de interface reutilizados nas sessões ---------- */
const CHEERS = ['✓ Mandou bem!','✓ Show de bola!','✓ Certinho!','✓ Genial!','✓ Arrasou!','✓ Na mosca! 🎯'];
function cheerLine(){
  const sess = state.session || {};
  const combo = sess.combo || 0;
  if(combo>=10) return `☄️ IMPARÁVEL! Combo x${combo}`;
  if(combo>=5) return `🔥 Pegando fogo! Combo x${combo}`;
  if(combo>=3) return `⚡ Sequência de ${combo}! Continua!`;
  return CHEERS[(sess.index||0) % CHEERS.length];
}
function sessionHud(){
  const sess = state.session || {};
  const combo = sess.combo || 0;
  return h(`<div class="sess-hud"><span class="combo ${combo>=2?'hot':''}">${combo>=2? `<span class="flame">🔥</span> Combo x${combo}` : '🔥 Combo x0'}</span><span class="xp">⭐ +${sess.xp||0} XP</span></div>`);
}
/* card de fim de sessão com estrelas, título e recompensas (substitui o placar simples) */
function gameSessionEnd(c, correct, total, msg){
  const sess = state.session || {};
  const pct = total ? correct/total : 0;
  const stars = pct>=1 ? 3 : pct>=0.7 ? 2 : pct>=0.4 ? 1 : 0;
  const titles = ['Não desista! 💪','Bom começo! 👍','Muito bem! 🎉','PERFEITO! 🏆'];
  let bonus = 0;
  if(state.session && !sess.endDone){
    sess.endDone = true;
    bonus = stars*10;
    if(bonus){ sess.endBonus = bonus; gameAddXP(bonus); }
    if(pct>=1 && total>=5) gameUnlock('perfect');
    saveGame();
    replaceHistoryState();
    if(stars>=2) setTimeout(()=>launchConfetti(stars===3?180:90), 250);
    playTones(stars>=2 ? [523,659,784,1047] : [392,330], 0.13, 'triangle', 0.09);
  }
  const starHtml = [0,1,2].map(i=>`<span class="${i<stars?'':'off'}">⭐</span>`).join('');
  const lv = levelInfo(loadGame().xp);
  c.appendChild(h(`
    <div class="session-end">
      <div class="gm-stars">${starHtml}</div>
      <div class="gm-end-title">${titles[stars]}</div>
      <div class="big-num">${correct}/${total}</div>
      <p>${msg}</p>
      <div class="gm-rewards">
        <span>⭐ +${(sess.xp||0)+(sess.endBonus||0)} XP</span>
        ${sess.endBonus? `<span>🌟 Bônus de estrelas +${sess.endBonus}</span>`:''}
        <span>🎖️ Nível ${lv.level} · ${lv.pct}%</span>
      </div>
    </div>`));
}

/* ---------- cartão do jogador + missões (home) ---------- */
function playerCard(){
  const g = loadGame();
  const lv = levelInfo(g.xp);
  const streak = gameStreakNow();
  const name = currentUser ? currentUser.name : '';
  const got = Object.keys(g.ach).length;
  const card = h(`
    <button type="button" class="player-card" aria-label="Meu nível e conquistas">
      <div class="pc-top">
        <div class="pc-level" style="--lv-pct:${lv.pct}%"><span>${lv.level}</span><small>NÍVEL</small></div>
        <div class="pc-info">
          <div class="pc-name">${escHTML(name)}</div>
          <div class="pc-title">${escHTML(lv.title)}</div>
          <div class="pc-xpbar"><i style="width:${lv.pct}%"></i></div>
          <div class="pc-xptext">${lv.into}/${lv.need} XP pro nível ${lv.level+1}</div>
        </div>
      </div>
      <div class="pc-stats four">
        <div class="pc-stat pc-streak ${streak?'':'off'} ${streak && !playedToday()?'warn':''}"><b><span class="flame">🔥</span> ${streak}</b><span>${streak && !playedToday()?'jogue hoje!':'ofensiva'}</span></div>
        <div class="pc-stat"><b>🪙 ${gemsNow()}</b><span>moedas</span></div>
        <div class="pc-stat"><b>❤️ ${heartsNow()}</b><span>vidas</span></div>
        <div class="pc-stat"><b>🏅 ${got}</b><span>medalhas</span></div>
      </div>
    </button>`);
  card.onclick = ()=> go('achievements');
  card.querySelector('.pc-streak').onclick = e=>{ e.stopPropagation(); showStreakPanel(); };
  return card;
}
function missionsCard(){
  const box = h(`<div class="missions"><h3>📜 Missões do dia</h3></div>`);
  function paint(){
    box.querySelectorAll('.mission').forEach(n=>n.remove());
    missionState().forEach(st=>{
      const row = h(`
        <div class="mission ${st.claimed?'done':''}">
          <span class="m-ico">${st.claimed?'✅':st.m.ico}</span>
          <div class="m-body">
            <div class="m-title">${st.title}</div>
            <div class="m-track"><i style="width:${Math.round(st.cur/st.max*100)}%"></i></div>
          </div>
        </div>`);
      if(st.done && !st.claimed){
        const b = h(`<button type="button" class="m-claim">Pegar +${st.m.reward}</button>`);
        b.onclick = ()=>{ claimMission(st.m.id); render(); };
        row.appendChild(b);
      } else {
        row.appendChild(h(`<span class="m-reward">${st.claimed?'feito!':`+${st.m.reward} XP`}</span>`));
      }
      box.appendChild(row);
    });
  }
  paint();
  return box;
}

/* ---------- tela de conquistas ---------- */
/* categorias e progresso de cada conquista (só pra mostrar na tela; quem desbloqueia é o código do jogo) */
const ACH_GROUPS = [
  {id:'hits',   ico:'🎯', name:'Acertos e combos', ids:['first','ans10','ans100','hits50','hits200','hits500','combo5','combo10','hard10','perfect','explorer']},
  {id:'streak', ico:'🔥', name:'Constância',       ids:['streak3','streak7','streak14','streak30','goal','missions','level5','level10']},
  {id:'arena',  ico:'⚔️', name:'Arena e jogos',    ids:['arenaWin','arenaPerfect','arenaStars30','daily1','daily7','exam1','exam10','bolt15','bolt30','quiz5000','duelist']},
  {id:'study',  ico:'📚', name:'Estudo',           ids:['fixer','notebook5','masterFrac','unit','chests','placement','plan','solver10']},
];
function achProgress(id, g){
  const a = (typeof arenaData==='function') ? arenaData() : {daily:{}, exams:[]};
  const st = Math.max(g.bestStreak||0, gameStreakNow());
  const P = {
    first:[g.hits,1], ans10:[totalAnswered(),10], ans100:[totalAnswered(),100],
    hits50:[g.hits,50], hits200:[g.hits,200], hits500:[g.hits,500],
    combo5:[g.bestCombo,5], combo10:[g.bestCombo,10], hard10:[g.hardHits,10],
    explorer:[Object.keys(g.subjectsHit||{}).length,6],
    streak3:[st,3], streak7:[st,7], streak14:[st,14], streak30:[st,30],
    level5:[levelInfo(g.xp).level,5], level10:[levelInfo(g.xp).level,10],
    arenaStars30:[(typeof arenaTotalStars==='function') ? arenaTotalStars() : 0,30],
    daily7:[Object.keys(a.daily||{}).length,7], exam1:[(a.exams||[]).length,1],
    bolt15:[g.boltBest||0,15], bolt30:[g.boltBest||0,30],
    quiz5000:[Math.max(0, ...Object.values(g.quizBest||{})),10000],
    fixer:[g.fixed||0,10], notebook5:[g.errLearned||0,5], chests:[g.chests||0,5], solver10:[g.solves||0,10],
    duelist:[g.duels||0,1], daily1:[Object.keys(a.daily||{}).length,1],
  };
  const r = P[id];
  return r ? [Math.min(r[0]||0, r[1]), r[1]] : null;
}
function fmtAchDate(ts){ const d = new Date(ts); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'}); }

function achievementsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏅 Conquistas', true, ()=>go('progress')));
  const c = h(`<div class="content ac-screen"></div>`);
  const g = loadGame();
  const lv = levelInfo(g.xp);
  const has = id=> !!g.ach[id];
  const got = ACHIEVEMENTS.filter(a=>has(a.id)).length, total = ACHIEVEMENTS.length;
  const R = 36, C = 2*Math.PI*R;

  // próxima conquista: a bloqueada com mais progresso
  let next = null;
  ACHIEVEMENTS.forEach(a=>{ if(has(a.id)) return; const pr = achProgress(a.id, g); if(!pr) return; const f = pr[0]/pr[1]; if(!next || f > next.f) next = {a, pr, f}; });
  const recent = ACHIEVEMENTS.filter(a=>has(a.id) && typeof g.ach[a.id]==='number').sort((x,y)=> g.ach[y.id]-g.ach[x.id]).slice(0,3);

  c.appendChild(h(`<div class="ac-hero">
    <div class="ac-hero-top">
      <div class="ac-ring" aria-label="${got} de ${total} conquistas">
        <svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" class="bg"/><circle cx="42" cy="42" r="${R}" class="fg" ${got?'':'style="opacity:0"'} stroke-dasharray="${C}" stroke-dashoffset="${C*(1-got/total)}"/></svg>
        <div class="ac-ring-in">🏆<b>${got}<small>/${total}</small></b></div>
      </div>
      <div class="ac-hero-t">
        <small class="ac-kicker">SALA DE TROFÉUS</small>
        <h2>${got ? `${Math.round(got/total*100)}% das medalhas` : 'Sua estante está vazia'}</h2>
        <p>${got===total ? 'Você conquistou todas! 🎉' : got ? `Faltam ${total-got} para completar a coleção.` : 'Acerte questões e jogue para ganhar a primeira!'}</p>
      </div>
    </div>
    <div class="ac-stats">
      <div><b>⭐ ${lv.level}</b><span>nível</span></div>
      <div><b>${(g.xp||0).toLocaleString('pt-BR')}</b><span>XP total</span></div>
      <div><b>⚡ ${g.bestCombo||0}</b><span>maior combo</span></div>
      <div><b>🔥 ${gameStreakNow()}</b><span>ofensiva</span></div>
      <div><b>🏆 ${g.bestStreak||0}</b><span>maior ofensiva</span></div>
      <div><b>🌩️ ${g.boltBest||0}</b><span>relâmpago</span></div>
    </div>
  </div>`));

  if(next){
    c.appendChild(h(`<div class="ac-next">
      <div class="ac-next-ico">${next.a.ico}</div>
      <div class="ac-next-t"><small>QUASE LÁ · PRÓXIMA CONQUISTA</small><b>${next.a.name}</b><span>${next.a.desc}</span>
        <div class="ac-pbar"><i style="width:${Math.round(next.f*100)}%"></i></div><em>${next.pr[0].toLocaleString('pt-BR')} / ${next.pr[1].toLocaleString('pt-BR')}</em></div>
    </div>`));
  }
  if(recent.length){
    c.appendChild(h(`<h3 class="ar-label">Conquistas recentes</h3>`));
    c.appendChild(h(`<div class="ac-recent">${recent.map(a=>`<div class="ac-rc"><span>${a.ico}</span><b>${a.name}</b><small>${fmtAchDate(g.ach[a.id])}</small></div>`).join('')}</div>`));
  }

  // medalhas por categoria, com filtro
  c.appendChild(h(`<h3 class="ar-label">Medalhas</h3>`));
  const FILTERS = [{id:'all', name:'Todas', n:total}, {id:'got', name:'🏅 Conquistadas', n:got}, {id:'todo', name:'🔒 Faltam', n:total-got}];
  const chips = h(`<div class="ex-chips small ac-filter"></div>`);
  const list = h(`<div class="ac-list"></div>`);
  const known = new Set(ACH_GROUPS.flatMap(x=>x.ids));
  const groups = ACH_GROUPS.concat([{id:'other', ico:'✨', name:'Outras', ids:ACHIEVEMENTS.map(a=>a.id).filter(id=>!known.has(id))}]);
  const paint = ()=>{
    const f = state.achFilter || 'all';
    chips.querySelectorAll('.ex-chip').forEach(b=> b.classList.toggle('on', b.dataset.f===f));
    list.innerHTML = '';
    groups.forEach(gr=>{
      const items = gr.ids.map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean).filter(a=> f==='all' || (f==='got') === has(a.id));
      if(!items.length) return;
      const gn = gr.ids.filter(id=>has(id) && ACHIEVEMENTS.some(a=>a.id===id)).length, gt = gr.ids.filter(id=>ACHIEVEMENTS.some(a=>a.id===id)).length;
      list.appendChild(h(`<div class="ac-group"><span>${gr.ico} ${gr.name}</span><small>${gn}/${gt}</small></div>`));
      const grid = h(`<div class="ac-grid"></div>`);
      items.forEach(a=>{
        const on = has(a.id), pr = on ? null : achProgress(a.id, g);
        grid.appendChild(h(`<div class="ac-card ${on?'got':'locked'}">
          <div class="ac-medal"><span>${a.ico}</span>${on?'':'<i class="ac-lock">🔒</i>'}</div>
          <b>${a.name}</b><small>${a.desc}</small>
          ${on ? `<span class="ac-date">✓ ${typeof g.ach[a.id]==='number' ? fmtAchDate(g.ach[a.id]) : 'conquistada'}</span>`
               : pr && pr[1]>1 ? `<div class="ac-pbar sm"><i style="width:${Math.round(pr[0]/pr[1]*100)}%"></i></div><span class="ac-pn">${pr[0].toLocaleString('pt-BR')}/${pr[1].toLocaleString('pt-BR')}</span>` : ''}
        </div>`));
      });
      list.appendChild(grid);
    });
    if(!list.children.length) list.appendChild(h(`<div class="ar-empty">${f==='got' ? '🌱 Nenhuma ainda. Acerte sua primeira questão!' : '🎉 Você conquistou todas!'}</div>`));
  };
  FILTERS.forEach(fl=>{ const b = h(`<button type="button" class="ex-chip" data-f="${fl.id}">${fl.name} <small>${fl.n}</small></button>`); b.onclick = ()=>{ state.achFilter = fl.id; paint(); }; chips.appendChild(b); });
  c.appendChild(chips); c.appendChild(list); paint();

  // títulos em escada
  c.appendChild(h(`<h3 class="ar-label">Títulos</h3>`));
  const lad = h(`<div class="ac-titles"></div>`);
  let curIdx = 0; LEVEL_TITLES.forEach(([min],i)=>{ if(lv.level>=min) curIdx = i; });
  LEVEL_TITLES.forEach(([min,t],i)=>{
    const st = i<curIdx ? 'done' : i===curIdx ? 'cur' : 'lock';
    const falta = min - lv.level;
    lad.appendChild(h(`<div class="ac-title ${st}"><span class="ac-tdot">${st==='lock'?'🔒':st==='cur'?'★':'✓'}</span><div><b>${t}</b><small>${st==='cur' ? 'Seu título atual' : st==='done' ? `Nível ${min} · conquistado` : `Nível ${min} · faltam ${falta} ${falta===1?'nível':'níveis'}`}</small></div></div>`));
  });
  c.appendChild(lad);

  wrap.appendChild(c);
  return wrap;
}
