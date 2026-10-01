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

/* ---------- sons (Web Audio, sem arquivos) ----------
   Tudo passa por um volume geral + limitador (não estoura quando vários sons tocam juntos)
   e um filtro que tira o chiado agudo. Cada nota é uma onda suave com um harmônico leve,
   parecido com um sininho. Pedidos de onda "quadrada"/"dente de serra" (ásperas) viram esse
   mesmo timbre suave, então nenhum som do app soa como alarme. */
const SOUND_VOLUMES = {baixo:0.45, medio:0.8, alto:1.15};
let _sfx = null;
const _sfxLast = {t:0, big:0, key:''};
function sfxOut(){
  _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const ctx = _audioCtx;
  if(ctx.state === 'suspended') ctx.resume().catch(()=>{}); // iPhone/Android começam com o áudio pausado
  if(!_sfx || _sfx.ctx !== ctx){
    const master = ctx.createGain(), lp = ctx.createBiquadFilter(), comp = ctx.createDynamicsCompressor();
    lp.type = 'lowpass'; lp.frequency.value = 5000;
    comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    _sfx = {ctx, master};
  }
  _sfx.master.gain.value = SOUND_VOLUMES[currentSettingsSync().volume] || SOUND_VOLUMES.medio;
  return _sfx;
}
function playTones(freqs, step, type, vol){
  if(!currentSettingsSync().sound || document.hidden) return;
  // sem atropelo: uma fanfarra (4+ notas) cala os bipes curtos que viriam logo depois,
  // o mesmo som repetido em seguida é ignorado e sons diferentes tocam um depois do outro
  const now = performance.now(), big = freqs.length >= 4, key = freqs.join(',');
  if(!big && now - _sfxLast.big < 400) return;
  if(key === _sfxLast.key && now - _sfxLast.t < 90) return;
  const delay = (!big && now - _sfxLast.t < 120) ? 0.13 : 0;
  _sfxLast.t = now; _sfxLast.key = key; if(big) _sfxLast.big = now;
  try{
    const {ctx, master} = sfxOut(), t0 = ctx.currentTime + 0.01 + delay;
    const peak = Math.min(0.16, vol || 0.12);
    freqs.forEach((f,i)=>{
      const s = t0 + i*step, dur = step + 0.24;
      const g = ctx.createGain(); g.connect(master);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(peak, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      const o = ctx.createOscillator(); o.type = type === 'sine' ? 'sine' : 'triangle'; o.frequency.value = f; o.connect(g);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain(); // harmônico leve: dá brilho sem ficar estridente
      o2.type = 'sine'; o2.frequency.value = f*2; g2.gain.value = 0.16; o2.connect(g2); g2.connect(g);
      o.start(s); o2.start(s); o.stop(s + dur + 0.02); o2.stop(s + dur + 0.02);
    });
  }catch(e){}
}
function playComboSound(combo){
  const up = Math.min(combo,10)*40;
  playTones([660+up, 880+up, 1100+up], 0.06, 'triangle', 0.08);
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
function achievementsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏅 Conquistas', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const g = loadGame();
  const lv = levelInfo(g.xp);
  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${lv.level}</div><div class="lbl">Nível atual</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${g.xp}</div><div class="lbl">XP total</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${g.bestCombo}</div><div class="lbl">Maior combo</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${g.boltBest}</div><div class="lbl">Recorde Relâmpago</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🔥 ${gameStreakNow()}</div><div class="lbl">Ofensiva atual</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🏆 ${g.bestStreak||0}</div><div class="lbl">Maior ofensiva</div></div>`));
  c.appendChild(grid);
  c.appendChild(h(`<section class="block"><h3>Medalhas (${Object.keys(g.ach).length}/${ACHIEVEMENTS.length})</h3></section>`));
  const ag = h(`<div class="ach-grid"></div>`);
  ACHIEVEMENTS.forEach(a=>{
    ag.appendChild(h(`<div class="ach ${g.ach[a.id]?'got':'locked'}"><div class="ico">${a.ico}</div><div class="nm">${a.name}</div><div class="ds">${a.desc}</div></div>`));
  });
  c.appendChild(ag);
  c.appendChild(h(`<section class="block" style="margin-top:20px"><h3>Títulos</h3></section>`));
  LEVEL_TITLES.forEach(([min,t])=>{
    const on = lv.level>=min;
    c.appendChild(h(`<div class="mastery-row" style="opacity:${on?1:.5}"><div class="top"><span class="name">${on?'':'🔒 '}${t}</span><span class="pct">Nível ${min}</span></div></div>`));
  });
  wrap.appendChild(c);
  return wrap;
}
