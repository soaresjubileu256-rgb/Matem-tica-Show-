/* =========================================================
   Matemática Show — ARENA
   Área de competição integrada ao app (veio do Matemática Show Arena V2):
   - Fases da Arena: cada assunto × dificuldade vale até 3 estrelas (10 perguntas, 3 vidas, relógio)
   - Desafio do Dia: as mesmas 7 perguntas para todo mundo no dia, uma tentativa, resultado para compartilhar
   - Simulado: prova com tempo, nota de 0 a 10 e correção comentada
   - atalhos para os jogos que já existiam: Relâmpago, Quiz do Show e Duelo a dois

   Tudo usa os sistemas únicos do app: perguntas (SUBJECTS / genQuestionAvoidingRepeat),
   resposta (recordAnswer → progresso, histórico, caderno de erros, XP e combo),
   XP extra (gameAddXP), moedas (addGems), conquistas (gameUnlock) e o motor do Quiz
   (tela 'lesson', kind 'quiz' com sess.mode = 'arena' | 'daily').
   Este arquivo só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

const ARENA_PHASE_Q = 10;
const ARENA_LIVES = 3;
const ARENA_DIFFS = ['facil','medio','dificil'];
const ARENA_DIFF_NAME = {facil:'Fácil', medio:'Médio', dificil:'Difícil', misturada:'Misturada'};
const DAILY_N = 7;
const DAILY_BONUS_XP = 30;
const ARENA_STAR_XP = 10;      // XP extra por estrela nova conquistada numa fase

/* dados da Arena ficam dentro do jogo da conta (mesmo XP, mesmo perfil) */
function arenaData(){
  const g = loadGame();
  const a = g.arena = g.arena || {};
  a.phases = a.phases || {};    // {subjectId:{facil:0-3, medio, dificil}}
  a.exams = a.exams || [];      // [{id, ts, n, ok, grade, secs, subjects}]
  a.daily = a.daily || {};      // {'2026-09-27': {ok, n, marks, secs, score}}
  return a;
}
function arenaStars(id, d){ return ((arenaData().phases[id]||{})[d]) || 0; }
function arenaUnlocked(id, d){ const i = ARENA_DIFFS.indexOf(d); return i <= 0 || arenaStars(id, ARENA_DIFFS[i-1]) > 0; }
function arenaTotalStars(){ return SUBJECTS.reduce((a,s)=> a + ARENA_DIFFS.reduce((b,d)=> b + arenaStars(s.id, d), 0), 0); }

/* data no formato AAAA-MM-DD (o dayKey do app não tem zero à esquerda) */
function isoDay(d){ d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

/* sorteio com semente: as mesmas perguntas para a mesma semente (Desafio do Dia igual para todos) */
function seededRandom(seed){
  let a = seed >>> 0;
  return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function withSeed(seed, fn){
  const orig = Math.random; Math.random = seededRandom(seed);
  try{ return fn(); } finally { Math.random = orig; }
}

/* =========================================================
   TELA DA ARENA
   ========================================================= */
function arenaScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Arena', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const g = loadGame(), a = arenaData();
  const total = SUBJECTS.length * 9, stars = arenaTotalStars();
  const quizBest = Math.max(0, ...Object.values(g.quizBest||{}));
  c.appendChild(h(`<div class="ar-hero">
    <div class="ar-hero-t"><h2>Arena</h2><p>Jogue contra o relógio, ganhe estrelas e dispute com os amigos. Tudo aqui soma no seu XP, na ofensiva e no progresso.</p></div>
    <div class="ar-hero-stats">
      <div><b>⭐ ${stars}</b><span>de ${total} estrelas</span></div>
      <div><b>⚡ ${g.boltBest||0}</b><span>recorde relâmpago</span></div>
      <div><b>🎤 ${quizBest.toLocaleString('pt-BR')}</b><span>recorde do quiz</span></div>
    </div></div>`));

  // desafio do dia
  const k = isoDay(), done = a.daily[k];
  const daily = h(`<button type="button" class="alert-banner ${done?'':'purple'} ar-daily">
    <span class="sym">📅</span>
    <span class="txt"><span class="title">Desafio do Dia #${dailyNumber(k)}</span><span class="sub">${done ? `${done.marks} · ${done.ok}/${done.n} em ${mmssA(done.secs)}` : `${DAILY_N} perguntas do seu nível · +${DAILY_BONUS_XP} XP${dailyStreak() ? ` · 🔥 ${dailyStreak()} dias` : ''}`}</span></span>
    <span class="chev">${done ? '✓' : '›'}</span></button>`);
  daily.onclick = ()=> startDaily();
  c.appendChild(daily);

  // modos
  c.appendChild(h(`<h3 class="ar-label">Modos de jogo</h3>`));
  const grid = h(`<div class="quick-grid ar-modes" style="padding:0"></div>`);
  [
    {sym:'⚡', cls:'ar-bolt', label:'Relâmpago', sub:'60 segundos', go:()=>go('lightning')},
    {sym:'🎤', cls:'ar-quiz', label:'Quiz do Show', sub:'10 perguntas', go:()=>go('quizSetup')},
    {sym:'📝', cls:'ar-exam', label:'Simulado', sub:'nota de 0 a 10', go:()=>go('examSetup')},
    {sym:'⚔️', cls:'ar-duel', label:'Duelo a dois', sub:'no mesmo celular', go:()=>go('duel')},
  ].forEach(m=>{
    const t = h(`<button type="button" class="quick-tile ${m.cls}"><span class="sym">${m.sym}</span><span class="label">${m.label}</span><small class="ar-sub">${m.sub}</small></button>`);
    t.onclick = m.go; grid.appendChild(t);
  });
  c.appendChild(grid);

  // fases com estrelas
  c.appendChild(h(`<h3 class="ar-label">Fases da Arena</h3>`));
  c.appendChild(h(`<p class="ar-muted" style="margin:-4px 0 10px">${ARENA_PHASE_Q} perguntas por fase · ${ARENA_LIVES} vidas · ${QUIZ_SECONDS}s por pergunta · acerte 5, 7 ou 9 para ganhar 1, 2 ou 3 estrelas</p>`));
  const list = h(`<div class="ar-phases"></div>`);
  SUBJECTS.forEach(s=>{
    const nextD = ARENA_DIFFS.find(d=> arenaUnlocked(s.id,d) && !arenaStars(s.id,d));
    const got = ARENA_DIFFS.reduce((x,d)=> x + arenaStars(s.id,d), 0);
    const row = h(`<div class="ar-subj ${got===9?'full':''}"><div class="ar-subj-h"><span class="ar-sym">${s.sym}</span><b>${s.name}</b><small>⭐ ${got}/9</small></div>
      <div class="ar-diffs">${ARENA_DIFFS.map(d=>{
        const un = arenaUnlocked(s.id,d), st = arenaStars(s.id,d);
        return `<button type="button" class="ar-diff ${un?'':'locked'} ${d===nextD?'next':''}" data-d="${d}" ${un?'':'disabled aria-disabled="true"'} aria-label="${s.name} ${ARENA_DIFF_NAME[d]}${un?`, ${st} de 3 estrelas`:', bloqueada'}">
          <span>${un?'':'🔒 '}${ARENA_DIFF_NAME[d]}</span><span class="ar-st">${[0,1,2].map(i=>`<i class="${i<st?'on':''}">★</i>`).join('')}</span></button>`;
      }).join('')}</div></div>`);
    row.querySelectorAll('.ar-diff').forEach(b=> b.onclick = ()=>{ if(arenaUnlocked(s.id, b.dataset.d)) startArenaPhase(s.id, b.dataset.d); });
    list.appendChild(row);
  });
  c.appendChild(list);
  return wrap;
}

/* =========================================================
   FASES DA ARENA e DESAFIO DO DIA (motor do Quiz do Show)
   ========================================================= */
function arenaBaseSession(extra){
  return Object.assign({kind:'quiz', asked:0, cleared:0, correct:0, wrong:0, score:0, qStreak:0, combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs:Date.now(), lastSignature:null, lastPoints:0, exitTo:'arena',
    id:`${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`}, extra);
}
function startArenaPhase(subjectId, diff){
  const sess = arenaBaseSession({mode:'arena', subjectId, diff, needed:ARENA_PHASE_Q, lives:ARENA_LIVES});
  sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
  state.session = sess;
  go('lesson');
}
/* ---------- Desafio do Dia ----------
   Um desafio por nível (Fundamental ou Ensino Médio), igual para todo mundo daquele nível no dia.
   Tempo por pergunta conforme a dificuldade, bônus por acertar tudo e por jogar dias seguidos,
   correção comentada no fim (as perguntas são geradas de novo pela semente, então só guardamos
   as respostas escolhidas). */
const DAILY_TRACKS = [
  {id:'fund', name:'Ensino Fundamental', short:'Fundamental', ico:'📘', groups:['f1','f2','f3']},
  {id:'em', name:'Ensino Médio', short:'Ensino Médio', ico:'🎓', groups:['em']},
];
const DAILY_SECS = {facil:30, medio:45, dificil:60};
const DAILY_PERFECT_XP = 20;   // acertou as 7
const DAILY_STREAK_XP = 5;     // por dia seguido de desafio (a partir do 2º)
const DAILY_STREAK_MAX = 25;
function dailyTrack(id){ return DAILY_TRACKS.find(t=>t.id===id) || DAILY_TRACKS[0]; }
function dailyTrackIds(id){ return [...new Set(dailyTrack(id).groups.flatMap(g=> examGroupIds(EXAM_GROUPS.find(x=>x.id===g))))]; }
function dailyDefaultTrack(){
  const a = arenaData();
  if(a.dailyTrack) return a.dailyTrack;
  const lvl = settingsCache && settingsCache.schoolLevel, gr = (loadGame().study||{}).grade;
  return (lvl==='medio' || gr==='em') ? 'em' : 'fund';
}
function dailySeed(k){ return Number(k.replace(/-/g,'')); }
function dailyNumber(k){ return Math.round((new Date(k+'T12:00') - new Date('2026-01-01T12:00'))/864e5) + 1; }
function dailyQuestions(k, track){
  track = track || 'fund';
  return withSeed(dailySeed(k)*10 + (track==='em' ? 1 : 0), ()=>{
    const ids = shuffle(dailyTrackIds(track)).slice(0, DAILY_N);
    const diffs = ['facil','facil','medio','medio','medio','dificil','dificil'];
    return ids.map((id,i)=>{ const s = SUBJECTS.find(x=>x.id===id); const ex = s.gen[diffs[i]](); return {ex, subjectId:id, diff:diffs[i], secs:DAILY_SECS[diffs[i]], opts:buildOptions(ex)}; });
  });
}
/* dias seguidos com desafio feito (termina hoje, ou ontem se hoje ainda não jogou) */
function dailyDayShift(k, n){ const d = new Date(k+'T12:00'); d.setDate(d.getDate()+n); return isoDay(d); }
function dailyStreak(){
  const a = arenaData(); let k = isoDay();
  if(!a.daily[k]) k = dailyDayShift(k, -1);
  let n = 0; while(a.daily[k]){ n++; k = dailyDayShift(k, -1); }
  return n;
}
function dailyBestStreak(){
  const ks = Object.keys(arenaData().daily).sort(); let best = 0, cur = 0, prev = null;
  ks.forEach(k=>{ cur = (prev && dailyDayShift(prev, 1)===k) ? cur+1 : 1; best = Math.max(best, cur); prev = k; });
  return Math.max(best, arenaData().dailyBest||0);
}
function dailyUntilMidnight(){
  const now = new Date(), m = new Date(now); m.setHours(24,0,0,0);
  const s = Math.max(0, Math.round((m-now)/1000));
  return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}
function dailyCountdown(prefix){
  const el = h(`<span class="dl-count">${prefix}${dailyUntilMidnight()}</span>`);
  const t = setInterval(()=>{ if(!el.isConnected){ clearInterval(t); return; } el.textContent = prefix + dailyUntilMidnight(); }, 1000);
  return el;
}
/* últimos 7 dias em bolinhas: verde (acertou 5+), amarela (jogou), vazia (não jogou) */
function dailyWeekStrip(){
  const a = arenaData(), today = isoDay(), names = ['D','S','T','Q','Q','S','S'];
  let html = '';
  for(let i=6;i>=0;i--){
    const k = dailyDayShift(today, -i), r = a.daily[k], d = new Date(k+'T12:00');
    const cls = r ? (r.ok===r.n ? 'perfect' : r.ok>=5 ? 'good' : 'played') : (k===today ? 'today' : '');
    html += `<div class="dl-day ${cls}"><span class="dl-dot">${r ? r.ok : k===today ? '?' : ''}</span><small>${names[d.getDay()]}</small></div>`;
  }
  return h(`<div class="dl-week">${html}</div>`);
}
function dailyStatsRow(){
  const a = arenaData(), all = Object.values(a.daily), played = all.length;
  const avg = played ? all.reduce((s,r)=>s+r.ok,0)/played : 0, perf = all.filter(r=>r.ok===r.n).length;
  return h(`<div class="dl-stats">
    <div><b>🔥 ${dailyStreak()}</b><span>sequência</span></div>
    <div><b>🏆 ${dailyBestStreak()}</b><span>melhor</span></div>
    <div><b>📅 ${played}</b><span>jogados</span></div>
    <div><b>⭐ ${perf}</b><span>perfeitos</span></div>
    <div><b>🎯 ${fmt(Math.round(avg*10)/10)}</b><span>média</span></div>
  </div>`);
}

function startDaily(){
  if(arenaData().daily[isoDay()]){ go('arenaDaily'); return; }
  go('dailyIntro');
}
function beginDaily(track){
  const k = isoDay(), a = arenaData();
  if(a.daily[k]){ go('arenaDaily'); return; }
  a.dailyTrack = track; saveGame();
  const plan = dailyQuestions(k, track);
  const sess = arenaBaseSession({mode:'daily', dayIso:k, track, plan, marks:[], picks:[], needed:DAILY_N, diff:'misturada'});
  sess.q = JSON.parse(JSON.stringify(plan[0])); sess.subjectId = sess.q.subjectId; sess.asked++; sess.qStart = Date.now();
  state.session = sess;
  go('lesson');
}

/* tela de abertura: regras, nível, assuntos de hoje e sequência */
function dailyIntroScreen(){
  const k = isoDay();
  if(arenaData().daily[k]){ setTimeout(()=>go('arenaDaily'), 0); return document.createElement('div'); }
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📅 Desafio do Dia', true, ()=>go('arena')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  let track = state.dailyTrack || dailyDefaultTrack();
  const [y,m,d] = k.split('-'), streak = dailyStreak();
  c.appendChild(h(`<div class="dl-hero">
    <div class="dl-hero-num">#${dailyNumber(k)}</div>
    <div class="dl-hero-t"><h2>Desafio do Dia</h2><p>${d}/${m}/${y} · as mesmas perguntas para todo mundo do seu nível</p></div>
    ${streak ? `<div class="dl-hero-streak">🔥 ${streak} dia${streak===1?'':'s'} seguido${streak===1?'':'s'}! Não quebre a sequência.</div>` : ''}
  </div>`));
  c.appendChild(h(`<h3 class="ar-label">Escolha o nível</h3>`));
  const tr = h(`<div class="dl-tracks"></div>`);
  c.appendChild(tr);
  const topics = h(`<div class="dl-topics"></div>`);
  const paintTopics = ()=>{
    tr.querySelectorAll('.dl-track').forEach(b=> b.classList.toggle('on', b.dataset.t===track));
    const plan = dailyQuestions(k, track);
    topics.innerHTML = `<h3 class="ar-label">Assuntos de hoje</h3><div class="dl-chips">${plan.map((q,i)=>{ const s = SUBJECTS.find(x=>x.id===q.subjectId); return `<span class="dl-chip d-${q.diff}"><i>${i+1}</i>${s.sym} ${s.name}</span>`; }).join('')}</div>`;
  };
  DAILY_TRACKS.forEach(t=>{
    const b = h(`<button type="button" class="dl-track" data-t="${t.id}"><span class="dl-track-ico">${t.ico}</span><b>${t.short}</b></button>`);
    b.onclick = ()=>{ track = t.id; state.dailyTrack = t.id; paintTopics(); };
    tr.appendChild(b);
  });
  c.appendChild(topics);
  paintTopics();
  c.appendChild(h(`<div class="card dl-rules">
    <div><span>🧩</span><p><b>${DAILY_N} perguntas</b>: 2 fáceis, 3 médias e 2 difíceis</p></div>
    <div><span>⏱️</span><p><b>${DAILY_SECS.facil}s, ${DAILY_SECS.medio}s e ${DAILY_SECS.dificil}s</b> por pergunta, conforme a dificuldade. Mais rápido = mais pontos</p></div>
    <div><span>🎯</span><p><b>Uma tentativa só</b>: se sair no meio, vale o que já respondeu</p></div>
    <div><span>⚡</span><p><b>+${DAILY_BONUS_XP} XP</b> · acertou todas: <b>+${DAILY_PERFECT_XP} XP</b> · dias seguidos: <b>+${DAILY_STREAK_XP} XP por dia</b> (até +${DAILY_STREAK_MAX})</p></div>
    <div><span>📖</span><p>No fim tem a <b>correção comentada</b> de cada pergunta</p></div>
  </div>`));
  c.appendChild(h(`<h3 class="ar-label">Sua semana</h3>`));
  c.appendChild(dailyWeekStrip());
  const foot = h(`<div class="lesson-footer static"><button class="show-btn">COMEÇAR O DESAFIO</button></div>`);
  foot.querySelector('button').onclick = ()=> beginDaily(track);
  c.appendChild(foot);
  return wrap;
}

/* correção comentada de um dia */
function dailyReviewScreen(){
  const k = state.reviewDay || isoDay(), r = arenaData().daily[k];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(`📖 Correção · #${dailyNumber(k)}`, true, ()=>go('arenaDaily')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  if(!r || !r.picks){ c.appendChild(h(`<p class="ar-muted">A correção só existe para os desafios feitos a partir desta versão do app.</p>`)); return wrap; }
  const plan = dailyQuestions(k, r.track);
  c.appendChild(h(`<div class="dl-rev-top"><span class="ar-marks" style="font-size:22px; margin:0">${r.marks}</span><b>${r.ok}/${r.n}</b><small>${dailyTrack(r.track).ico} ${dailyTrack(r.track).short}</small></div>`));
  plan.forEach((q,i)=>{
    // pk: índice da alternativa · -1 = o tempo acabou · -2 = saiu antes de responder
    const s = SUBJECTS.find(x=>x.id===q.subjectId), pk = r.picks[i] ?? -2, ok = pk>=0 && !!q.opts[pk] && q.opts[pk].ok;
    const status = ok ? 'ok' : pk===-2 ? 'skip' : 'bad';
    const mine = pk===-2 ? 'não respondeu (saiu antes)' : pk===-1 ? '⏰ o tempo acabou' : q.opts[pk].label;
    const qv = questionHTML(q.ex);
    const card = h(`<div class="dl-rev ${status}">
      <div class="dl-rev-h"><span class="dl-rev-n">${i+1}</span><span class="dl-rev-s">${s.sym} ${s.name} · ${ARENA_DIFF_NAME[q.diff]}</span><span class="dl-rev-i">${ok?'✅':status==='skip'?'⬜':'❌'}</span></div>
      <div class="dl-rev-q qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div>
      <div class="dl-rev-a"><div><small>Sua resposta</small><span class="mono ${ok?'good':'wrong'}"></span></div>${ok?'':`<div><small>Resposta certa</small><span class="mono good"></span></div>`}</div>
      <button type="button" class="fb-why">📖 Ver explicação</button>
      <div class="fb-steps" style="display:none">${solutionHTML(q.ex)}</div>
    </div>`);
    const spans = card.querySelectorAll('.dl-rev-a span');
    spans[0].textContent = mine; if(spans[1]) spans[1].textContent = answerLabel(q.ex);
    card.querySelector('.fb-why').onclick = e=>{ const st = card.querySelector('.fb-steps'), open = st.style.display==='none'; st.style.display = open?'':'none'; e.currentTarget.textContent = open ? '📖 Esconder explicação' : '📖 Ver explicação'; };
    if(!ok){
      const pr = h(`<button type="button" class="drill-btn">🎯 Praticar ${s.name.toLowerCase()} (5 questões)</button>`);
      pr.onclick = ()=> startSession(q.subjectId, q.diff);
      card.appendChild(pr);
    }
    c.appendChild(card);
  });
  return wrap;
}

/* próxima pergunta dentro do motor do quiz (chamado por lessonAdvance) */
function arenaNextQuestion(sess){
  if(sess.mode === 'daily'){ sess.q = JSON.parse(JSON.stringify(sess.plan[sess.asked])); sess.subjectId = sess.q.subjectId; }
  else sess.q = newLessonQuestion(sess);
  sess.asked++; sess.qStart = Date.now();
}
/* depois de corrigir cada pergunta (chamado por lessonCheck) */
function arenaAfterCheck(sess, ok){
  if(sess.mode === 'daily'){ sess.marks.push(ok ? '🟩' : '🟥'); sess.picks.push(sess.selected===null ? -1 : sess.selected); }
  if(sess.mode === 'arena' && !ok){ sess.lives--; if(sess.lives <= 0) sess.outOfLives = true; }
}
/* saiu no meio do Desafio do Dia: vale uma tentativa, então guarda o que já fez */
function arenaQuit(sess){
  if(sess && sess.mode === 'daily' && !sess.finished) arenaSaveDaily(sess);
}
function arenaSaveDaily(sess){
  const a = arenaData();
  if(a.daily[sess.dayIso]) return a.daily[sess.dayIso];
  const marks = sess.marks.slice(); while(marks.length < sess.needed) marks.push('⬜');
  const picks = (sess.picks||[]).slice(); while(picks.length < sess.needed) picks.push(-2);
  const r = {ok:sess.correct, n:sess.needed, marks:marks.join(''), secs:Math.round((Date.now()-sess.startTs)/1000), score:sess.score, id:sess.id, track:sess.track||'fund', picks};
  a.daily[sess.dayIso] = r;
  const ks = Object.keys(a.daily).sort(); while(ks.length > 90) delete a.daily[ks.shift()];
  // XP: base + bônus por acertar todas + bônus pelos dias seguidos
  const streak = dailyStreak();
  a.dailyBest = Math.max(a.dailyBest||0, streak);
  r.streak = streak;
  r.bonus = {base:DAILY_BONUS_XP, perfect: r.ok===r.n ? DAILY_PERFECT_XP : 0, streak: Math.min(DAILY_STREAK_MAX, Math.max(0, streak-1)*DAILY_STREAK_XP)};
  const xp = r.bonus.base + r.bonus.perfect + r.bonus.streak;
  gameAddXP(xp); sess.xp = (sess.xp||0) + xp;
  gameUnlock('daily1');
  if(Object.keys(a.daily).length >= 7) gameUnlock('daily7');
  saveGame();
  return r;
}
function mmssA(s){ s = Math.max(0, Math.round(s||0)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* fim de uma fase da Arena ou do Desafio do Dia (chamado por lessonEnd) */
function arenaQuizEnd(c, sess){
  const g = loadGame(), a = arenaData();
  const secs = Math.round((Date.now()-sess.startTs)/1000);
  const isDaily = sess.mode === 'daily';
  if(!sess.endDone){
    sess.endDone = true;
    gameEnsureToday();
    if(isDaily){
      arenaSaveDaily(sess);
      sess.gems = Math.floor(sess.correct/2);
    } else {
      const st = sess.outOfLives ? 0 : sess.correct >= 9 ? 3 : sess.correct >= 7 ? 2 : sess.correct >= 5 ? 1 : 0;
      const p = a.phases[sess.subjectId] = a.phases[sess.subjectId] || {};
      const prev = p[sess.diff] || 0;
      sess.stars = st; sess.prevStars = prev;
      if(st > prev){
        p[sess.diff] = st;
        const bonus = (st - prev) * ARENA_STAR_XP;
        gameAddXP(bonus); sess.xp = (sess.xp||0) + bonus; sess.starBonus = bonus;
        const nextD = ARENA_DIFFS[ARENA_DIFFS.indexOf(sess.diff)+1];
        if(!prev && nextD) sess.unlockedNext = nextD;
      }
      if(st >= 1) gameUnlock('arenaWin');
      if(st >= 3) gameUnlock('arenaPerfect');
      if(arenaTotalStars() >= 30) gameUnlock('arenaStars30');
      sess.gems = st ? Math.floor(sess.correct/2) : 0;
    }
    saveGame();
    if(sess.gems) addGems(sess.gems);
    replaceHistoryState();
    const win = isDaily ? sess.correct >= 4 : sess.stars >= 1;
    if(win){ setTimeout(()=>launchConfetti(sess.correct===sess.needed ? 180 : 100), 200); playTones([523,659,784,1047,1319], 0.11, 'triangle', 0.09); }
    else playTones([392,330,262], 0.14, 'sine', 0.08);
  }
  const s = SUBJECTS.find(x=>x.id===sess.subjectId);
  if(isDaily){
    const r = a.daily[sess.dayIso];
    c.appendChild(h(`<div class="le-mascot">${mascotSVG(r.ok>=4?'joy':'happy',120)}</div>`));
    c.appendChild(h(`<h2 class="le-title">${r.ok===r.n ? 'Perfeito! 🏆' : r.ok>=5 ? 'Mandou bem!' : r.ok>=3 ? 'Boa tentativa!' : 'Amanhã tem mais!'}</h2>`));
    c.appendChild(h(`<div class="ar-marks" aria-label="${r.ok} certas de ${r.n}">${r.marks}</div>`));
    if(r.streak) c.appendChild(h(`<p class="le-sub dl-streak-msg">🔥 ${r.streak} dia${r.streak===1?'':'s'} seguido${r.streak===1?'':'s'} de desafio${r.streak>1?'!':''}</p>`));
  } else {
    const st = sess.stars||0;
    c.appendChild(h(`<div class="ar-bigstars" aria-label="${st} de 3 estrelas">${[0,1,2].map(i=>`<span class="${i<st?'on':''}" style="--k:${i}">★</span>`).join('')}</div>`));
    c.appendChild(h(`<h2 class="le-title" ${st?'':'style="color:#FF4B4B"'}>${sess.outOfLives ? 'Acabaram as vidas!' : st===3 ? 'Fase perfeita! 🌟' : st ? 'Fase vencida!' : 'Quase lá!'}</h2>`));
    c.appendChild(h(`<p class="le-sub">${s.name} · ${ARENA_DIFF_NAME[sess.diff]}${sess.unlockedNext ? ` · <b>${ARENA_DIFF_NAME[sess.unlockedNext]} liberado!</b>` : ''}${!st ? '<br>Acerte pelo menos 5 das 10 (sem perder as 3 vidas) para ganhar estrela.' : ''}</p>`));
  }
  c.appendChild(h(`<div class="le-bigscore">${(sess.score||0).toLocaleString('pt-BR')} <small>pontos</small></div>`));
  c.appendChild(h(`<div class="le-stats">
      <div class="le-stat gold"><div class="k">TOTAL DE XP</div><div class="v">⚡ ${sess.xp||0}</div></div>
      <div class="le-stat green"><div class="k">ACERTOS</div><div class="v">🎯 ${sess.correct}/${sess.needed}</div></div>
      <div class="le-stat blue"><div class="k">TEMPO</div><div class="v">⏱ ${mmssA(secs)}</div></div>
    </div>`));
  if(sess.gems) c.appendChild(h(`<div class="le-gems">+${sess.gems} 🪙 moedas</div>`));
  if(sess.starBonus) c.appendChild(h(`<p class="le-sub">+${sess.starBonus} XP pelas estrelas novas</p>`));
  if(isDaily){
    const r = a.daily[sess.dayIso];
    const b = r.bonus || {base:DAILY_BONUS_XP, perfect:0, streak:0};
    c.appendChild(h(`<div class="card dl-bonus"><div><span>Desafio concluído</span><b>+${b.base} XP</b></div>${b.perfect?`<div><span>🏆 Acertou todas</span><b>+${b.perfect} XP</b></div>`:''}${b.streak?`<div><span>🔥 ${r.streak} dias seguidos</span><b>+${b.streak} XP</b></div>`:''}</div>`));
    const rv = h(`<button type="button" class="show-btn ghost dl-review-btn">📖 VER CORREÇÃO</button>`);
    rv.onclick = ()=> go('dailyReview', {reviewDay:sess.dayIso});
    c.appendChild(rv);
    c.appendChild(dailyShareBox(sess.dayIso, r));
    c.appendChild(h(`<p class="le-sub">${r.ok<r.n ? 'As perguntas que você errou foram para o seu caderno de erros. ' : ''}Próximo desafio em </p>`)).appendChild(dailyCountdown(''));
  }
  const foot = h(`<div class="lesson-footer static"></div>`);
  const cont = h(`<button class="show-btn">CONTINUAR</button>`);
  cont.onclick = ()=> go('arena');
  foot.appendChild(cont);
  if(!isDaily){
    const nextD = sess.unlockedNext;
    const again = h(`<button class="show-btn ghost">${nextD ? `JOGAR NO ${ARENA_DIFF_NAME[nextD].toUpperCase()}` : 'JOGAR DE NOVO'}</button>`);
    again.onclick = ()=> startArenaPhase(sess.subjectId, nextD || sess.diff);
    foot.appendChild(again);
  }
  c.appendChild(foot);
}

/* ---------- compartilhar o resultado do Desafio do Dia ---------- */
function dailyShareText(k, r){
  const [y,m,d] = k.split('-');
  const t = dailyTrack(r.track), st = r.streak > 1 ? `\n🔥 ${r.streak} dias seguidos` : '';
  return `Desafio do Dia #${dailyNumber(k)} · Matemática Show\n${t.ico} ${t.short} · ${d}/${m}/${y}\n${r.marks} ${r.ok}/${r.n} em ${mmssA(r.secs)}${st}`;
}
function dailyShareBox(k, r){
  const box = h(`<div class="card ar-share"><div class="ar-share-t">Compartilhe seu resultado</div><pre class="ar-share-txt"></pre>
    <div class="cta-row"><button type="button" class="btn primary" data-a="share">Compartilhar</button><button type="button" class="btn secondary" data-a="copy">Copiar</button></div></div>`);
  const txt = dailyShareText(k, r);
  box.querySelector('pre').textContent = txt;
  const sh = box.querySelector('[data-a=share]');
  if(!navigator.share) sh.remove();
  else sh.onclick = async ()=>{ try{ await navigator.share({title:'Desafio do Dia — Matemática Show', text:txt}); }catch(e){} };
  box.querySelector('[data-a=copy]').onclick = async e=>{
    const b = e.currentTarget;
    try{ await navigator.clipboard.writeText(txt); b.textContent = 'Copiado! ✓'; }
    catch(err){ const sel = window.getSelection(), rg = document.createRange(); rg.selectNodeContents(box.querySelector('pre')); sel.removeAllRanges(); sel.addRange(rg); b.textContent = 'Texto selecionado: copie pelo menu'; }
  };
  return box;
}
/* tela do Desafio do Dia já feito hoje */
function arenaDailyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📅 Desafio do Dia', true, ()=>go('arena')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const k = isoDay(), a = arenaData(), r = a.daily[k];
  if(!r){ setTimeout(()=>startDaily(), 0); return wrap; }
  const t = dailyTrack(r.track);
  const hero = h(`<div class="dl-hero done">
    <div class="dl-hero-num">#${dailyNumber(k)}</div>
    <div class="dl-hero-t"><h2>${r.ok===r.n ? 'Perfeito! 🏆' : 'Desafio feito ✓'}</h2><p>${t.ico} ${t.short} · ${r.ok} de ${r.n} certas em ${mmssA(r.secs)}</p></div>
    <div class="ar-marks">${r.marks}</div>
    <div class="dl-next">Próximo desafio em </div>
  </div>`);
  hero.querySelector('.dl-next').appendChild(dailyCountdown(''));
  c.appendChild(hero);
  if(r.picks){
    const rv = h(`<button type="button" class="alert-banner purple" style="margin:0 0 14px; width:100%"><span class="sym">📖</span><span class="txt"><span class="title">Ver correção comentada</span><span class="sub">Cada pergunta com a sua resposta, a certa e a explicação</span></span><span class="chev">›</span></button>`);
    rv.onclick = ()=> go('dailyReview', {reviewDay:k});
    c.appendChild(rv);
  }
  c.appendChild(h(`<h3 class="ar-label">Suas estatísticas</h3>`));
  c.appendChild(dailyStatsRow());
  c.appendChild(h(`<h3 class="ar-label">Últimos 7 dias</h3>`));
  c.appendChild(dailyWeekStrip());
  c.appendChild(dailyShareBox(k, r));
  const hist = Object.entries(a.daily).sort((x,y)=> y[0].localeCompare(x[0])).filter(([dk])=>dk!==k).slice(0, 10);
  if(hist.length){
    c.appendChild(h(`<h3 class="ar-label" style="text-align:left">Dias anteriores</h3>`));
    const l = h(`<div class="ar-dlist"></div>`);
    hist.forEach(([dk, x])=>{
      const row = h(`<${x.picks?'button type="button"':'div'} class="ar-drow ${x.picks?'tap':''}"><span>#${dailyNumber(dk)} · ${dk.split('-').reverse().slice(0,2).join('/')}${x.track?` · ${dailyTrack(x.track).ico}`:''}</span><span class="ar-dm">${x.marks}</span><b>${x.ok}/${x.n}</b>${x.picks?'<i class="chev">›</i>':''}</${x.picks?'button':'div'}>`);
      if(x.picks) row.onclick = ()=> go('dailyReview', {reviewDay:dk});
      l.appendChild(row);
    });
    c.appendChild(l);
  }
  const b = h(`<div class="lesson-footer static"><button class="show-btn">VOLTAR À ARENA</button></div>`);
  b.querySelector('button').onclick = ()=> go('arena');
  c.appendChild(b);
  return wrap;
}

/* =========================================================
   SIMULADO — prova com tempo, nota e correção
   ========================================================= */
const EXAM_GROUPS = [
  {id:'f1', name:'1º ao 5º ano', ids:['adicao','subtracao','multiplicacao','divisao','dinheiro']},
  {id:'f2', name:'6º e 7º ano', ids:['fracoes','decimais','porcentagem','geometria','mmcmdc','potenciacao','expressoes','estatistica','regra3','eq1']},
  {id:'f3', name:'8º e 9º ano', ids:['potenciacao','regra3','eq1','sistemas','eq2','func1grau']},
  {id:'em', name:'Ensino Médio', ids:['conjuntos','func1grau','funcquad','modular','exponencial','logaritmo','functrig','pa','pg','geometria','espacial','analitica','trigret','ciclo','identidades','leis','combinatoria','probabilidade','estatistica','dispersao','graficos','porcentagem','juros','descontos','inflacao','matrizes','determinantes','sistemas']},
  {id:'all', name:'Tudo', ids:null},
];
function examGroupIds(gr){ const ids = gr.ids || SUBJECTS.map(s=>s.id); return ids.filter(id=> SUBJECTS.some(s=>s.id===id)); }
function examCfgNow(){
  const a = arenaData();
  const cfg = a.examCfg = a.examCfg || {group:'all', subjects:SUBJECTS.map(s=>s.id), n:10, mins:15, diff:'misturada'};
  cfg.subjects = cfg.subjects.filter(id=> SUBJECTS.some(s=>s.id===id));
  return cfg;
}
function examSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📝 Simulado', true, ()=>go('arena')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const cfg = examCfgNow();
  c.appendChild(h(`<div class="greeting" style="margin-bottom:6px"><h2>Monte sua prova</h2><p>As questões são sorteadas dos assuntos escolhidos. No fim você recebe a nota de 0 a 10 e a correção comentada de cada questão.</p></div>`));
  const sec = t=> h(`<h3 class="ar-label">${t}</h3>`);
  const chipRow = (items, isOn, onPick)=>{
    const row = h(`<div class="diff-row ar-wrap"></div>`);
    items.forEach(([v,l])=>{ const b = h(`<button type="button" class="diff-chip ${isOn(v)?'active':''}" aria-pressed="${isOn(v)}"></button>`); b.textContent = l; b.onclick = ()=>{ onPick(v); paint(); }; row.appendChild(b); });
    return row;
  };
  const body = h(`<div></div>`); c.appendChild(body);
  function paint(){
    body.innerHTML = '';
    body.appendChild(sec('Nível'));
    body.appendChild(chipRow(EXAM_GROUPS.map(g=>[g.id,g.name]), v=>cfg.group===v, v=>{ cfg.group = v; cfg.subjects = examGroupIds(EXAM_GROUPS.find(g=>g.id===v)); }));
    body.appendChild(sec('Assuntos'));
    body.appendChild(chipRow(SUBJECTS.map(s=>[s.id,s.name]), v=>cfg.subjects.includes(v), v=>{ cfg.group = null; cfg.subjects = cfg.subjects.includes(v) ? cfg.subjects.filter(x=>x!==v) : [...cfg.subjects, v]; }));
    body.appendChild(sec('Número de questões'));
    body.appendChild(chipRow([[10,'10'],[20,'20'],[30,'30']], v=>cfg.n===v, v=>{ cfg.n = v; }));
    body.appendChild(sec('Tempo'));
    body.appendChild(chipRow([[10,'10 min'],[15,'15 min'],[30,'30 min'],[45,'45 min'],[0,'Sem tempo']], v=>cfg.mins===v, v=>{ cfg.mins = v; }));
    body.appendChild(sec('Dificuldade'));
    body.appendChild(chipRow(['facil','medio','dificil','misturada'].map(d=>[d, ARENA_DIFF_NAME[d]]), v=>cfg.diff===v, v=>{ cfg.diff = v; }));
    const st = h(`<button type="button" class="btn primary ar-start"></button>`);
    st.disabled = !cfg.subjects.length;
    st.textContent = cfg.subjects.length ? `Começar simulado · ${cfg.n} questões` : 'Escolha pelo menos um assunto';
    st.onclick = ()=>{ saveGame(); startExam(cfg); };
    body.appendChild(st);
    const ex = arenaData().exams;
    if(ex.length){
      body.appendChild(sec('Seus últimos simulados'));
      const l = h(`<div class="ar-dlist"></div>`);
      ex.slice().reverse().slice(0,8).forEach(e=> l.appendChild(h(`<div class="ar-drow"><span>${new Date(e.ts).toLocaleDateString('pt-BR')} · ${e.ok}/${e.n} certas · ${mmssA(e.secs)}</span><b class="ar-grade ${e.grade>=7?'good':e.grade>=5?'mid':'low'}">${fmt(e.grade)}</b></div>`)));
      body.appendChild(l);
    }
  }
  paint();
  return wrap;
}
function startExam(cfg){
  const ids = shuffle([...cfg.subjects]);
  const Q = [], sigs = new Set();
  for(let i=0;i<cfg.n;i++){
    const s = SUBJECTS.find(x=>x.id===ids[i % ids.length]);
    const d = cfg.diff === 'misturada' ? ARENA_DIFFS[i % 3] : cfg.diff;
    let g, tries = 0;
    do{ g = genQuestionAvoidingRepeat(s, d, null); tries++; } while(sigs.has(g.signature) && tries < 8);
    sigs.add(g.signature);
    Q.push({subjectId:s.id, diff:d, ex:g.ex, opts:buildOptions(g.ex), pick:-1, flag:false});
  }
  shuffle(Q);
  state.session = {kind:'exam', id:`${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`, Q, cur:0, T0:Date.now(), limit:cfg.mins*60, subjects:[...cfg.subjects]};
  go('examRun');
}
function examRunScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='exam' || sess.submitted){ setTimeout(()=>go('arena'), 0); return wrap; }
  const leave = ()=> showConfirm({icon:'📝', title:'Abandonar o simulado?', message:'As respostas desta prova serão perdidas.', ok:'Abandonar', cancel:'Continuar a prova', danger:true}).then(ok=>{ if(ok){ sess.submitted = true; replaceHistoryState(); go('arena'); } });
  const bar = topbar('Simulado', true, leave);
  const clock = h(`<span class="ar-clock" role="timer" aria-live="off"></span>`);
  bar.appendChild(clock);
  wrap.appendChild(bar);
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const elapsed = ()=> (Date.now()-sess.T0)/1000;
  const tick = ()=>{
    if(!wrap.isConnected || state.session!==sess || sess.submitted) return false;
    if(sess.limit){ const left = sess.limit - elapsed(); clock.textContent = '⏱ ' + mmssA(left); clock.classList.toggle('low', left < 60); if(left <= 0){ examSubmit(sess, true); return false; } }
    else clock.textContent = '⏱ ' + mmssA(elapsed());
    return true;
  };
  tick();
  const timer = setInterval(()=>{ if(!tick()) clearInterval(timer); }, 1000);

  const grid = h(`<div class="ar-qgrid" role="navigation" aria-label="Questões da prova"></div>`);
  sess.Q.forEach((q,i)=>{
    const b = h(`<button type="button" class="${q.pick>=0?'ans':''} ${q.flag?'flag':''} ${i===sess.cur?'cur':''}" aria-label="Questão ${i+1}${q.pick>=0?', respondida':''}${q.flag?', marcada para revisar':''}" ${i===sess.cur?'aria-current="true"':''}>${i+1}</button>`);
    b.onclick = ()=>{ sess.cur = i; render(); };
    grid.appendChild(b);
  });
  c.appendChild(grid);
  const q = sess.Q[sess.cur], ex = q.ex, s = SUBJECTS.find(x=>x.id===q.subjectId);
  const qv = questionHTML(ex);
  const qcard = h(`<div class="question-card"><div class="qlabel">QUESTÃO ${sess.cur+1} DE ${sess.Q.length} · ${s.name.toUpperCase()}</div><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  c.appendChild(qcard);
  const opts = h(`<div class="mc-opts"></div>`);
  q.opts.forEach((o,i)=>{
    const b = h(`<button type="button" class="mc-opt ${q.pick===i?'sel':''}" aria-pressed="${q.pick===i}"><span class="key">${'ABCD'[i]}</span><span class="lbl mono"></span></button>`);
    b.querySelector('.lbl').textContent = o.label;
    b.onclick = ()=>{
      q.pick = i; playTones([520], 0.03, 'sine', 0.05);
      const at = sess.cur;
      render();
      if(at < sess.Q.length-1) setTimeout(()=>{ if(state.session===sess && !sess.submitted && sess.cur===at && state.screen==='examRun'){ sess.cur++; render(); } }, 420);
    };
    opts.appendChild(b);
  });
  c.appendChild(opts);
  const nav = h(`<div class="cta-row ar-exam-nav">
    <button type="button" class="btn secondary" data-a="prev" ${sess.cur===0?'disabled':''}>← Anterior</button>
    <button type="button" class="btn secondary" data-a="flag" aria-pressed="${q.flag}">${q.flag?'★ Marcada':'☆ Revisar depois'}</button>
    <button type="button" class="btn secondary" data-a="next" ${sess.cur===sess.Q.length-1?'disabled':''}>Próxima →</button></div>`);
  nav.querySelector('[data-a=prev]').onclick = ()=>{ if(sess.cur>0){ sess.cur--; render(); } };
  nav.querySelector('[data-a=next]').onclick = ()=>{ if(sess.cur<sess.Q.length-1){ sess.cur++; render(); } };
  nav.querySelector('[data-a=flag]').onclick = ()=>{ q.flag = !q.flag; render(); };
  c.appendChild(nav);
  const sub = h(`<button type="button" class="btn primary ar-start">Entregar prova</button>`);
  sub.onclick = ()=>{
    const blank = sess.Q.filter(x=>x.pick<0).length;
    showConfirm({icon:'📝', title:'Entregar a prova?', message: blank ? `Você ainda tem ${blank} questão(ões) em branco. Em branco conta como errada.` : 'Todas as questões estão respondidas.', ok:'Entregar', cancel:'Voltar à prova'})
      .then(ok=>{ if(ok) examSubmit(sess, false); });
  };
  c.appendChild(sub);
  return wrap;
}
async function examSubmit(sess, timeUp){
  if(sess.submitted) return;
  sess.submitted = true;
  replaceHistoryState(); // voltar no navegador não reabre a prova (nem conta XP de novo)
  const a = arenaData();
  const secs = Math.round(Math.min(sess.limit || Infinity, (Date.now()-sess.T0)/1000));
  let ok = 0;
  sess.Q.forEach(q=>{ q.right = q.pick>=0 && q.opts[q.pick].ok; if(q.right) ok++; });
  const grade = Math.round(100*ok/sess.Q.length)/10;
  if(!a.exams.some(e=>e.id===sess.id)){
    // cada questão entra no progresso, histórico, caderno de erros e XP como qualquer resposta
    // sessão "muda" enquanto soma: sem combo de sequência numa prova e sem 30 avisos de +XP na tela
    const quiet = {kind:'quiz', combo:0};
    state.session = quiet;
    for(const q of sess.Q){ quiet.combo = 0; await recordAnswer(q.subjectId, q.right, {difficulty:q.diff, ex:q.ex}); }
    a.exams.push({id:sess.id, ts:Date.now(), n:sess.Q.length, ok, grade, secs, subjects:sess.subjects});
    if(a.exams.length > 30) a.exams.splice(0, a.exams.length-30);
    gameUnlock('exam1');
    if(grade >= 10 && sess.Q.length >= 10) gameUnlock('exam10');
    saveGame();
  }
  const Q = sess.Q.map(q=>({subjectId:q.subjectId, diff:q.diff, ex:q.ex, opts:q.opts, pick:q.pick, right:q.right}));
  state.session = {kind:'examResult', Q, ok, grade, secs, timeUp:!!timeUp};
  go('examResult');
}
function examResultScreen(){
  const r = state.session;
  const wrap = document.createElement('div');
  if(!r || r.kind!=='examResult'){ setTimeout(()=>go('arena'), 0); return wrap; }
  wrap.appendChild(topbar('Resultado do simulado', true, ()=>go('arena')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const msg = r.grade >= 9 ? 'Excelente! Você domina esses assuntos.' : r.grade >= 7 ? 'Muito bom! Revise as que errou e vai longe.' : r.grade >= 5 ? 'Na média. Veja a correção e treine os pontos fracos.' : 'Vamos treinar mais. A correção abaixo mostra o caminho de cada questão.';
  c.appendChild(h(`<div class="ar-grade-box"><div class="ar-ring ${r.grade>=7?'good':r.grade>=5?'mid':'low'}" style="--p:${r.grade*10}"><b>${fmt(r.grade)}</b><small>nota</small></div>
    <h2 class="le-title">${r.timeUp ? 'Tempo esgotado' : 'Prova entregue'}</h2><p class="le-sub">${msg}</p></div>`));
  c.appendChild(h(`<div class="le-stats">
    <div class="le-stat green"><div class="k">ACERTOS</div><div class="v">🎯 ${r.ok}/${r.Q.length}</div></div>
    <div class="le-stat blue"><div class="k">TEMPO</div><div class="v">⏱ ${mmssA(r.secs)}</div></div>
    <div class="le-stat gold"><div class="k">EM BRANCO</div><div class="v">⬜ ${r.Q.filter(q=>q.pick<0).length}</div></div></div>`));
  if(r.grade >= 7 && !r.celebrated){ r.celebrated = true; replaceHistoryState(); setTimeout(()=>launchConfetti(r.grade>=10?180:100), 250); }
  // por assunto
  const by = {};
  r.Q.forEach(q=>{ const b = by[q.subjectId] = by[q.subjectId] || {n:0, ok:0}; b.n++; if(q.right) b.ok++; });
  c.appendChild(h(`<h3 class="ar-label">Por assunto</h3>`));
  const bars = h(`<div class="card ar-bars"></div>`);
  Object.entries(by).sort((x,y)=> x[1].ok/x[1].n - y[1].ok/y[1].n).forEach(([id,b])=>{
    const s = SUBJECTS.find(x=>x.id===id), acc = b.ok/b.n;
    bars.appendChild(h(`<div class="ar-bar ${acc>=.8?'good':acc>=.5?'mid':'low'}"><div class="ar-bar-l"><b>${s.name}</b><span>${b.ok}/${b.n}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,Math.round(acc*100))}%"></div></div></div>`));
  });
  c.appendChild(bars);
  // correção
  c.appendChild(h(`<h3 class="ar-label">Correção comentada</h3>`));
  const grid = h(`<div class="ar-qgrid result" aria-label="Ir para a questão"></div>`);
  r.Q.forEach((q,i)=>{ const b = h(`<button type="button" class="${q.right?'ok':'bad'}" aria-label="Questão ${i+1}: ${q.right?'certa':'errada'}">${i+1}</button>`); b.onclick = ()=>{ const el = document.getElementById('arrv'+i); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }; grid.appendChild(b); });
  c.appendChild(grid);
  r.Q.forEach((q,i)=>{
    const s = SUBJECTS.find(x=>x.id===q.subjectId), qv = questionHTML(q.ex);
    const ci = q.opts.findIndex(o=>o.ok);
    const it = h(`<div class="card ar-review" id="arrv${i}"><div class="ar-rv-h"><span>Questão ${i+1} · ${s.name}</span><b class="${q.right?'ok':'bad'}">${q.right?'✓ Certa':'✗ Errada'}</b></div>
      <div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div>
      <div class="ar-rv-a"></div>
      <details class="ar-sol" ${q.right?'':'open'}><summary>Resolução passo a passo</summary><div class="fb-steps"></div></details></div>`);
    const ans = it.querySelector('.ar-rv-a');
    ans.textContent = `Sua resposta: ${q.pick>=0 ? `${'ABCD'[q.pick]}) ${q.opts[q.pick].label}` : 'em branco'}`;
    if(!q.right){ const cr = document.createElement('div'); cr.className = 'ar-rv-c'; cr.textContent = `Correta: ${'ABCD'[ci]}) ${q.opts[ci].label}`; ans.appendChild(cr); }
    it.querySelector('.fb-steps').innerHTML = solutionHTML(q.ex);
    c.appendChild(it);
  });
  const foot = h(`<div class="cta-row" style="margin-top:16px"><button type="button" class="btn secondary" data-a="a">Arena</button><button type="button" class="btn primary" data-a="n">Novo simulado</button></div>`);
  foot.querySelector('[data-a=a]').onclick = ()=> go('arena');
  foot.querySelector('[data-a=n]').onclick = ()=> go('examSetup');
  c.appendChild(foot);
  return wrap;
}
