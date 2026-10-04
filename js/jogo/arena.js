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
   Este arquivo só declara funções e constantes: é carregado antes dos outros scripts (veja index.html).
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
/* patente da Arena conforme a fração de estrelas conquistadas */
const ARENA_RANKS = [
  {f:0,   ico:'🌱', name:'Estreante'},
  {f:.05, ico:'🥉', name:'Desafiante'},
  {f:.2,  ico:'🥈', name:'Competidor'},
  {f:.4,  ico:'🥇', name:'Craque'},
  {f:.65, ico:'🏆', name:'Campeão'},
  {f:.9,  ico:'👑', name:'Lenda da Arena'},
];
function arenaRank(stars, total){
  const need = r=> Math.ceil(r.f * total);
  let i = 0; ARENA_RANKS.forEach((r,k)=>{ if(stars >= need(r)) i = k; });
  const next = ARENA_RANKS[i+1];
  return {i, cur:ARENA_RANKS[i], next, toNext: next ? need(next) - stars : 0};
}
/* próxima fase sugerida: continua um assunto começado; senão o primeiro do nível da pessoa */
function arenaNextPhase(){
  const lvl = dailyDefaultTrack()==='em' ? 'em' : 'fund';
  const order = [...levelIds(lvl), ...levelIds(lvl==='em'?'fund':'em')].filter(id=> SUBJECTS.some(s=>s.id===id));
  const nextD = id=> ARENA_DIFFS.find(d=> arenaUnlocked(id,d) && !arenaStars(id,d));
  const got = id=> ARENA_DIFFS.reduce((x,d)=> x + arenaStars(id,d), 0);
  let id = order.find(x=> got(x) > 0 && nextD(x)) || order.find(x=> nextD(x));
  if(!id){ // tudo jogado: melhora a fase com menos estrelas
    let best = null;
    order.forEach(x=> ARENA_DIFFS.forEach(d=>{ const st = arenaStars(x,d); if(st<3 && (!best || st<best.st)) best = {id:x, d, st}; }));
    return best ? {s:SUBJECTS.find(q=>q.id===best.id), d:best.d, improve:true} : null;
  }
  return {s:SUBJECTS.find(q=>q.id===id), d:nextD(id), improve:false};
}

function arenaScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Arena', true, ()=>go('home')));
  const c = h(`<div class="content ar-screen"></div>`);
  wrap.appendChild(c);
  const g = loadGame(), a = arenaData();
  const total = SUBJECTS.length * 9, stars = arenaTotalStars();
  const quizBest = Math.max(0, ...Object.values(g.quizBest||{}));
  const fullSubj = SUBJECTS.filter(s=> ARENA_DIFFS.every(d=> arenaStars(s.id,d)===3)).length;
  const rk = arenaRank(stars, total), pct = total ? stars/total : 0;
  const R = 34, C = 2*Math.PI*R;

  // topo: anel de estrelas + patente
  c.appendChild(h(`<div class="ar-hero">
    <div class="ar-hero-top">
      <div class="ar-sring" aria-label="${stars} de ${total} estrelas">
        <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="bg"/><circle cx="40" cy="40" r="${R}" class="fg" ${stars?'':'style="opacity:0"'} stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg>
        <div class="ar-sring-in"><b>${stars}</b><small>⭐</small></div>
      </div>
      <div class="ar-hero-t">
        <small class="ar-kicker">ARENA DO SHOW</small>
        <h2>${rk.cur.ico} ${rk.cur.name}</h2>
        <p>${rk.next ? `Faltam <b>${rk.toNext} estrela${rk.toNext===1?'':'s'}</b> para ${rk.next.ico} ${rk.next.name}` : 'Você chegou ao topo da Arena! 🎉'}</p>
        <div class="ar-ranks">${ARENA_RANKS.map((r,i)=>`<i class="${i<=rk.i?'on':''} ${i===rk.i?'cur':''}" title="${r.name}">${r.ico}</i>`).join('')}</div>
      </div>
    </div>
    <div class="ar-hero-stats">
      <div><b>⭐ ${stars}<em>/${total}</em></b><span>estrelas</span></div>
      <div><b>🏅 ${fullSubj}</b><span>assunto${fullSubj===1?'':'s'} completo${fullSubj===1?'':'s'}</span></div>
      <div><b>🔥 ${dailyStreak()}</b><span>dias de desafio</span></div>
    </div></div>`));

  // desafio do dia
  const k = isoDay(), done = a.daily[k], streak = dailyStreak();
  const daily = h(`<div class="ar-daily ${done?'done':''}">
    <div class="ar-daily-h">
      <span class="ar-daily-cal"><small>${['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][new Date().getDay()]}</small><b>${new Date().getDate()}</b></span>
      <div class="ar-daily-t"><small>DESAFIO DO DIA #${dailyNumber(k)}</small><b>${done ? `Feito! ${done.ok}/${done.n} em ${mmssA(done.secs)}` : `${DAILY_N} perguntas, as mesmas pra todo mundo`}</b>
        <span>${done ? escHTML(done.marks||'') : `+${DAILY_BONUS_XP} XP${streak ? ` · 🔥 ${streak} dia${streak===1?'':'s'} seguido${streak===1?'':'s'}` : ' · comece uma sequência!'}`}</span></div>
    </div>
    <div class="ar-daily-f"></div>
  </div>`);
  daily.querySelector('.ar-daily-h').after(dailyWeekStrip());
  const df = daily.querySelector('.ar-daily-f');
  if(done){
    df.appendChild(dailyCountdown('Próximo desafio em '));
    const b = h(`<button type="button" class="ar-daily-btn ghost">Ver resultado ›</button>`); b.onclick = ()=> startDaily(); df.appendChild(b);
  } else {
    df.appendChild(dailyCountdown('Termina em '));
    const b = h(`<button type="button" class="ar-daily-btn">Jogar agora ▶</button>`); b.onclick = ()=> startDaily(); df.appendChild(b);
  }
  c.appendChild(daily);

  // continuar: próxima fase sugerida
  const nx = arenaNextPhase();
  if(nx){
    const st = arenaStars(nx.s.id, nx.d);
    const cont = h(`<button type="button" class="ar-next">
      <span class="ar-sym">${nx.s.sym}</span>
      <span class="ar-next-t"><small>${nx.improve ? 'BUSQUE AS 3 ESTRELAS' : 'PRÓXIMA FASE'}</small><b>${nx.s.name}</b><span class="ch-diff d-${nx.d}">${ARENA_DIFF_NAME[nx.d]}</span>${nx.improve ? ` <span class="ar-st">${[0,1,2].map(i=>`<i class="${i<st?'on':''}">★</i>`).join('')}</span>` : ''}</span>
      <span class="ar-next-go">▶</span></button>`);
    cont.onclick = ()=> startArenaPhase(nx.s.id, nx.d);
    c.appendChild(cont);
  }

  // modos com recordes
  c.appendChild(h(`<h3 class="ar-label">Modos de jogo</h3>`));
  const lastExam = a.exams.length ? a.exams[a.exams.length-1] : null;
  const grid = h(`<div class="ar-modes"></div>`);
  [
    {sym:'⚡', cls:'ar-bolt', label:'Relâmpago', sub:'Quantas contas em 60s?', rec: g.boltBest ? `🏆 ${g.boltBest} acertos` : 'sem recorde ainda', go:()=>go('lightning')},
    {sym:'🎤', cls:'ar-quiz', label:'Quiz do Show', sub:'10 perguntas com ajudas', rec: quizBest ? `🏆 ${quizBest.toLocaleString('pt-BR')} pts` : 'sem recorde ainda', go:()=>go('quizSetup')},
    {sym:'📝', cls:'ar-exam', label:'Simulado', sub:'Prova com nota de 0 a 10', rec: lastExam ? `última nota ${fmt(lastExam.grade)}` : 'nenhum feito ainda', go:()=>go('examSetup')},
    {sym:'⚔️', cls:'ar-duel', label:'Duelo a dois', sub:'No mesmo celular', rec: g.duels ? `${g.duels} duelo${g.duels===1?'':'s'}` : 'chame um amigo', go:()=>go('duel')},
  ].forEach(m=>{
    const t = h(`<button type="button" class="ar-mode ${m.cls}"><span class="ar-mode-sym">${m.sym}</span><b>${m.label}</b><small>${m.sub}</small><span class="ar-mode-rec">${m.rec}</span></button>`);
    t.onclick = m.go; grid.appendChild(t);
  });
  c.appendChild(grid);

  // fases com estrelas
  c.appendChild(h(`<h3 class="ar-label">Fases da Arena</h3>`));
  c.appendChild(h(`<div class="ar-rules"><span>❓ ${ARENA_PHASE_Q} perguntas</span><span>❤️ ${ARENA_LIVES} vidas</span><span>⏱️ ${QUIZ_SECONDS}s cada</span><span>⭐ 5 · ⭐⭐ 7 · ⭐⭐⭐ 9 acertos</span></div>`));
  const got = id=> ARENA_DIFFS.reduce((x,d)=> x + arenaStars(id,d), 0);
  const FILTERS = [
    {id:'all', name:'Todas', ids:()=> null},
    {id:'fund', name:'📘 Fundamental', ids:()=> levelIds('fund')},
    {id:'em', name:'🎓 Médio', ids:()=> levelIds('em')},
    {id:'going', name:'Em andamento', ids:()=> SUBJECTS.filter(s=>{ const n = got(s.id); return n>0 && n<9; }).map(s=>s.id)},
    {id:'full', name:'Completas', ids:()=> SUBJECTS.filter(s=> got(s.id)===9).map(s=>s.id)},
  ];
  const chips = h(`<div class="ex-chips small ar-filter" role="tablist"></div>`);
  const list = h(`<div class="ar-phases"></div>`);
  const paint = ()=>{
    const f = FILTERS.find(x=>x.id===(state.arenaFilter || dailyDefaultTrack())) || FILTERS[0];
    chips.querySelectorAll('.ex-chip').forEach(b=> b.classList.toggle('on', b.dataset.f===f.id));
    list.innerHTML = '';
    const only = f.ids();
    if(only && !only.some(id=> SUBJECTS.some(s=>s.id===id))){
      list.appendChild(h(`<div class="ar-empty">${f.id==='full' ? '🏅 Nenhum assunto com as 9 estrelas ainda. Você consegue!' : '🎯 Nenhuma fase começada ainda. Escolha um assunto e jogue a primeira!'}</div>`));
      return;
    }
    subjectListGrouped(list, s=>{
      const nextD = ARENA_DIFFS.find(d=> arenaUnlocked(s.id,d) && !arenaStars(s.id,d));
      const n = got(s.id);
      const row = h(`<div class="ar-subj ${n===9?'full':''}"><div class="ar-subj-h"><span class="ar-sym">${s.sym}</span><div class="ar-subj-n"><b>${s.name}</b><span class="ar-bar"><i style="width:${n/9*100}%"></i></span></div><small>${n===9?'🏅 ':'⭐ '}${n}/9</small></div>
        <div class="ar-diffs">${ARENA_DIFFS.map(d=>{
          const un = arenaUnlocked(s.id,d), st = arenaStars(s.id,d);
          return `<button type="button" class="ar-diff d-${d} ${un?'':'locked'} ${d===nextD?'next':''} ${st===3?'max':''}" data-d="${d}" ${un?'':'disabled aria-disabled="true"'} aria-label="${s.name} ${ARENA_DIFF_NAME[d]}${un?`, ${st} de 3 estrelas`:', bloqueada'}">
            <span class="ar-dn">${un?'':'🔒 '}${ARENA_DIFF_NAME[d]}</span><span class="ar-st">${[0,1,2].map(i=>`<i class="${i<st?'on':''}">★</i>`).join('')}</span>${d===nextD?'<span class="ar-play">JOGAR</span>':''}</button>`;
        }).join('')}</div></div>`);
      row.querySelectorAll('.ar-diff').forEach(b=> b.onclick = ()=>{ if(arenaUnlocked(s.id, b.dataset.d)) startArenaPhase(s.id, b.dataset.d); });
      return row;
    }, only || undefined);
  };
  FILTERS.forEach(f=>{
    const b = h(`<button type="button" class="ex-chip" data-f="${f.id}">${f.name}</button>`);
    b.onclick = ()=>{ state.arenaFilter = f.id; paint(); };
    chips.appendChild(b);
  });
  c.appendChild(chips);
  c.appendChild(list);
  paint();
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
// listas fixas do sorteio: não mudam quando a ordem dos assuntos no app muda, assim as perguntas
// (e a correção comentada) de qualquer dia continuam as mesmas
const DAILY_POOLS = {
  fund: ['adicao','subtracao','multiplicacao','divisao','dinheiro','fracoes','decimais','porcentagem','geometria','mmcmdc','potenciacao','expressoes','estatistica','regra3','eq1','sistemas','eq2','func1grau'],
  em: ['conjuntos','func1grau','funcquad','modular','exponencial','logaritmo','functrig','pa','pg','geometria','espacial','analitica','trigret','ciclo','identidades','leis','combinatoria','probabilidade','estatistica','dispersao','graficos','porcentagem','juros','descontos','inflacao','matrizes','determinantes','sistemas'],
};
function dailyTrackIds(id){ return (DAILY_POOLS[id] || DAILY_POOLS.fund).filter(x=> SUBJECTS.some(s=>s.id===x)); }
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
// grupos do Simulado, tirados da lista única de assuntos (catalogo.js)
const EXAM_GROUPS = [
  ...SUBJECT_GROUPS.filter(g=>g.level==='fund').map(g=>({id:g.id, name:g.name, ids:g.ids})),
  {id:'em', name:'Ensino Médio', ids:levelIds('em')},
  {id:'all', name:'Tudo', ids:null},
];
function examGroupIds(gr){ const ids = gr.ids || SUBJECTS.map(s=>s.id); return ids.filter(id=> SUBJECTS.some(s=>s.id===id)); }
function examCfgNow(){
  const a = arenaData();
  const cfg = a.examCfg = a.examCfg || {group:'all', subjects:SUBJECTS.map(s=>s.id), n:10, mins:15, diff:'misturada'};
  cfg.subjects = cfg.subjects.filter(id=> SUBJECTS.some(s=>s.id===id));
  return cfg;
}
const EXAM_PRESETS = [
  {id:'quick', ico:'⚡', name:'Rápido', n:10, mins:10, diff:'misturada'},
  {id:'test',  ico:'📝', name:'Prova', n:20, mins:30, diff:'misturada'},
  {id:'mara',  ico:'🏃', name:'Maratona', n:30, mins:45, diff:'misturada'},
];
const gradeCls = g=> g>=7 ? 'good' : g>=5 ? 'mid' : 'low';
function examSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📝 Simulado', true, ()=>go('arena')));
  const c = h(`<div class="content exam-setup"></div>`);
  wrap.appendChild(c);
  const cfg = examCfgNow();
  const ex = arenaData().exams;
  const best = ex.length ? Math.max(...ex.map(e=>e.grade)) : null;
  const avg = ex.length ? Math.round(ex.slice(-5).reduce((x,e)=>x+e.grade,0)/Math.min(5,ex.length)*10)/10 : null;
  c.appendChild(h(`<div class="ex-hero">
      <div class="exh-top"><div class="exh-ico">📝</div><div><h2>Simulado</h2><p>Monte sua prova, responda no seu ritmo e receba a nota de 0 a 10 com a correção comentada.</p></div></div>
      <div class="exh-stats">
        <div><b>${ex.length}</b><span>feitos</span></div>
        <div><b>${best===null?'—':fmt(best)}</b><span>melhor nota</span></div>
        <div><b>${avg===null?'—':fmt(avg)}</b><span>média recente</span></div>
      </div></div>`));
  const sec = (t, extra)=> h(`<div class="ex-lbl"><span>${t}</span>${extra||''}</div>`);
  const chipRow = (items, isOn, onPick, cls)=>{
    const row = h(`<div class="ex-chips ${cls||''}"></div>`);
    items.forEach(([v,l])=>{ const b = h(`<button type="button" class="ex-chip ${isOn(v)?'on':''}" aria-pressed="${isOn(v)}"></button>`); b.innerHTML = l; b.onclick = ()=>{ onPick(v); paint(); }; row.appendChild(b); });
    return row;
  };
  const body = h(`<div></div>`); c.appendChild(body);
  let subjOpen = false;
  function paint(){
    body.innerHTML = '';
    body.appendChild(sec('Modelos prontos'));
    const pre = h(`<div class="ex-presets"></div>`);
    EXAM_PRESETS.forEach(pr=>{
      const on = cfg.n===pr.n && cfg.mins===pr.mins && cfg.diff===pr.diff;
      const b = h(`<button type="button" class="ex-preset ${on?'on':''}"><span class="i">${pr.ico}</span><b>${pr.name}</b><small>${pr.n} questões · ${pr.mins} min</small></button>`);
      b.onclick = ()=>{ cfg.n = pr.n; cfg.mins = pr.mins; cfg.diff = pr.diff; paint(); };
      pre.appendChild(b);
    });
    body.appendChild(pre);
    body.appendChild(sec('Nível'));
    body.appendChild(chipRow(EXAM_GROUPS.map(g=>[g.id,g.name]), v=>cfg.group===v, v=>{ cfg.group = v; cfg.subjects = examGroupIds(EXAM_GROUPS.find(g=>g.id===v)); }));
    // assuntos: escondidos atrás de um botão, agrupados como no resto do app
    const subjBtn = h(`<button type="button" class="ex-subj-btn ${subjOpen?'open':''}"><span>📚 <b>${cfg.subjects.length}</b> de ${SUBJECTS.length} assuntos escolhidos</span><i>${subjOpen?'Fechar ▲':'Escolher ▼'}</i></button>`);
    subjBtn.onclick = ()=>{ subjOpen = !subjOpen; paint(); };
    body.appendChild(subjBtn);
    if(subjOpen){
      const box = h(`<div class="ex-subjs"></div>`);
      SUBJECT_GROUPS.forEach(g=>{
        const ids = g.ids.filter(id=> SUBJECTS.some(s=>s.id===id));
        if(!ids.length) return;
        const all = ids.every(id=> cfg.subjects.includes(id));
        const gh = h(`<div class="ex-sg"><div class="ex-sg-h"><b>${g.name}</b><button type="button">${all?'Tirar todos':'Todos'}</button></div></div>`);
        gh.querySelector('button').onclick = ()=>{ cfg.group = null; cfg.subjects = all ? cfg.subjects.filter(x=>!ids.includes(x)) : [...new Set([...cfg.subjects, ...ids])]; paint(); };
        gh.appendChild(chipRow(ids.map(id=>{ const s0 = SUBJECTS.find(s=>s.id===id); return [id, `${s0.sym} ${escHTML(s0.name)}`]; }), v=>cfg.subjects.includes(v), v=>{ cfg.group = null; cfg.subjects = cfg.subjects.includes(v) ? cfg.subjects.filter(x=>x!==v) : [...cfg.subjects, v]; }, 'small'));
        box.appendChild(gh);
      });
      body.appendChild(box);
    }
    const grid2 = h(`<div class="ex-2col"></div>`);
    const col = (t, row)=>{ const d = h(`<div></div>`); d.appendChild(sec(t)); d.appendChild(row); return d; };
    grid2.appendChild(col('Questões', chipRow([[10,'10'],[20,'20'],[30,'30']], v=>cfg.n===v, v=>{ cfg.n = v; })));
    grid2.appendChild(col('Dificuldade', chipRow(['facil','medio','dificil','misturada'].map(d=>[d, ARENA_DIFF_NAME[d]]), v=>cfg.diff===v, v=>{ cfg.diff = v; })));
    body.appendChild(grid2);
    body.appendChild(sec('Tempo'));
    body.appendChild(chipRow([[10,'10 min'],[15,'15 min'],[30,'30 min'],[45,'45 min'],[0,'Sem tempo']], v=>cfg.mins===v, v=>{ cfg.mins = v; }));
    const per = cfg.mins ? Math.round(cfg.mins*60/cfg.n) : 0;
    body.appendChild(h(`<div class="ex-summary">
        <div><b>${cfg.n}</b><span>questões</span></div>
        <div><b>${cfg.mins ? cfg.mins+' min' : '∞'}</b><span>${cfg.mins ? `~${per}s por questão` : 'sem tempo'}</span></div>
        <div><b>${cfg.subjects.length}</b><span>assunto${cfg.subjects.length===1?'':'s'}</span></div>
        <div><b>${ARENA_DIFF_NAME[cfg.diff]}</b><span>dificuldade</span></div>
      </div>`));
    const st = h(`<button type="button" class="btn primary ar-start ex-go"></button>`);
    st.disabled = !cfg.subjects.length;
    st.textContent = cfg.subjects.length ? `Começar simulado ▶` : 'Escolha pelo menos um assunto';
    st.onclick = ()=>{ saveGame(); startExam(cfg); };
    body.appendChild(st);
    if(ex.length){
      body.appendChild(sec('Seus últimos simulados'));
      const last = ex.slice(-10);
      body.appendChild(h(`<div class="ex-chart" aria-label="Notas dos últimos simulados">${last.map(e=>`<div class="exc-col" title="${fmt(e.grade)}"><span>${fmt(e.grade)}</span><i class="${gradeCls(e.grade)}" style="height:${Math.max(4, e.grade*10)}%"></i></div>`).join('')}</div>`));
      const l = h(`<div class="ar-dlist"></div>`);
      ex.slice().reverse().slice(0,6).forEach(e=> l.appendChild(h(`<div class="ar-drow"><span>${new Date(e.ts).toLocaleDateString('pt-BR')} · ${e.ok}/${e.n} certas · ⏱ ${mmssA(e.secs)}</span><b class="ar-grade ${gradeCls(e.grade)}">${fmt(e.grade)}</b></div>`)));
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
/* refazer só as questões erradas, sem tempo (não entra no histórico de notas) */
function startExamRedo(wrongQ){
  const Q = shuffle(wrongQ.map(q=>({subjectId:q.subjectId, diff:q.diff, ex:q.ex, opts:buildOptions(q.ex), pick:-1, flag:false})));
  state.session = {kind:'exam', redo:true, id:`r${Date.now().toString(36)}`, Q, cur:0, T0:Date.now(), limit:0, subjects:[...new Set(Q.map(q=>q.subjectId))]};
  go('examRun');
}
let _examKeys = null;
function examRunScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  if(!sess || sess.kind!=='exam' || sess.submitted){ setTimeout(()=>go('arena'), 0); return wrap; }
  const leave = ()=> showConfirm({icon:'📝', title:'Abandonar o simulado?', message:'As respostas desta prova serão perdidas.', ok:'Abandonar', cancel:'Continuar a prova', danger:true}).then(ok=>{ if(ok){ sess.submitted = true; replaceHistoryState(); go('arena'); } });
  const bar = topbar(sess.redo ? 'Refazendo as erradas' : 'Simulado', true, leave);
  const clock = h(`<span class="ar-clock" role="timer" aria-live="off"></span>`);
  bar.appendChild(clock);
  wrap.appendChild(bar);
  const c = h(`<div class="content exam-run"></div>`);
  wrap.appendChild(c);
  const answered = sess.Q.filter(q=>q.pick>=0).length, N = sess.Q.length;
  const elapsed = ()=> (Date.now()-sess.T0)/1000;
  const head = h(`<div class="exr-head"><div class="exr-row"><span><b>${answered}</b> de ${N} respondidas</span><span class="exr-flags">${sess.Q.some(q=>q.flag) ? `★ ${sess.Q.filter(q=>q.flag).length} pra revisar` : ''}</span></div>
      <div class="exr-bar"><i style="width:${answered/N*100}%"></i></div>${sess.limit ? '<div class="exr-time"><i></i></div>' : ''}</div>`);
  c.appendChild(head);
  sess.warned = sess.warned || {};
  let first = true; // na primeira chamada a tela ainda não está na página: só desenha o relógio
  const tick = ()=>{
    if(!first && (!wrap.isConnected || state.session!==sess || sess.submitted)) return false;
    const isFirst = first; first = false;
    if(sess.limit){
      const left = sess.limit - elapsed();
      clock.textContent = '⏱ ' + mmssA(left); clock.classList.toggle('low', left < 60);
      if(isFirst){ const tb = head.querySelector('.exr-time i'); if(tb) tb.style.width = Math.max(0, left/sess.limit*100)+'%'; return true; }
      const tb = head.querySelector('.exr-time i'); if(tb){ tb.style.width = Math.max(0, left/sess.limit*100)+'%'; tb.classList.toggle('low', left < 60); }
      if(left <= 300 && left > 60 && !sess.warned.five && sess.limit > 300){ sess.warned.five = true; queueToast('⏱', 'Faltam 5 minutos', 'Confira as questões em branco'); }
      if(left <= 60 && !sess.warned.one){ sess.warned.one = true; queueToast('⏰', 'Falta 1 minuto!', 'Ao acabar o tempo a prova é entregue'); }
      if(left <= 0){ examSubmit(sess, true); return false; }
    } else clock.textContent = '⏱ ' + mmssA(elapsed());
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
  const qcard = h(`<div class="question-card exr-card"><div class="exr-qh"><span class="exr-n">${sess.cur+1}</span><span class="exr-s">${s.sym} ${escHTML(s.name)}</span><span class="exr-d d-${q.diff}">${ARENA_DIFF_NAME[q.diff]}</span></div><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  c.appendChild(qcard);
  const opts = h(`<div class="mc-opts"></div>`);
  const pickOpt = i=>{
    q.pick = i; playTones([520], 0.03, 'sine', 0.05);
    const at = sess.cur;
    render();
    if(at < sess.Q.length-1) setTimeout(()=>{ if(state.session===sess && !sess.submitted && sess.cur===at && state.screen==='examRun'){ sess.cur++; render(); } }, 420);
  };
  q.opts.forEach((o,i)=>{
    const b = h(`<button type="button" class="mc-opt ${q.pick===i?'sel':''}" aria-pressed="${q.pick===i}"><span class="key">${'ABCD'[i]}</span><span class="lbl mono"></span></button>`);
    b.querySelector('.lbl').textContent = o.label;
    b.onclick = ()=> pickOpt(i);
    opts.appendChild(b);
  });
  c.appendChild(opts);
  if(q.pick>=0){
    const cl = h(`<button type="button" class="exr-clear">Apagar resposta</button>`);
    cl.onclick = ()=>{ q.pick = -1; render(); };
    c.appendChild(cl);
  }
  const nav = h(`<div class="cta-row ar-exam-nav">
    <button type="button" class="btn secondary" data-a="prev" ${sess.cur===0?'disabled':''}>← Anterior</button>
    <button type="button" class="btn secondary ${q.flag?'flagged':''}" data-a="flag" aria-pressed="${q.flag}">${q.flag?'★ Marcada':'☆ Revisar depois'}</button>
    <button type="button" class="btn secondary" data-a="next" ${sess.cur===sess.Q.length-1?'disabled':''}>Próxima →</button></div>`);
  const prev = ()=>{ if(sess.cur>0){ sess.cur--; render(); } }, next = ()=>{ if(sess.cur<sess.Q.length-1){ sess.cur++; render(); } };
  nav.querySelector('[data-a=prev]').onclick = prev;
  nav.querySelector('[data-a=next]').onclick = next;
  nav.querySelector('[data-a=flag]').onclick = ()=>{ q.flag = !q.flag; render(); };
  c.appendChild(nav);
  const blank = sess.Q.filter(x=>x.pick<0).length;
  const sub = h(`<button type="button" class="btn primary ar-start ex-go ${blank?'':'ready'}">${blank ? `Entregar prova · ${blank} em branco` : '✓ Tudo respondido · Entregar prova'}</button>`);
  sub.onclick = ()=>{
    const bl = sess.Q.map((x,i)=> x.pick<0 ? i+1 : 0).filter(Boolean), fl = sess.Q.map((x,i)=> x.flag ? i+1 : 0).filter(Boolean);
    const msg = [bl.length ? `Em branco: questão ${bl.slice(0,12).join(', ')}${bl.length>12?'…':''} (conta como errada).` : 'Todas as questões estão respondidas.', fl.length ? `Marcadas pra revisar: ${fl.join(', ')}.` : ''].filter(Boolean).join(' ');
    showConfirm({icon:'📝', title:'Entregar a prova?', message: msg, ok:'Entregar', cancel:'Voltar à prova'})
      .then(ok=>{ if(ok) examSubmit(sess, false); });
  };
  c.appendChild(sub);
  if(window.matchMedia && matchMedia('(pointer:fine)').matches) c.appendChild(h(`<p class="exr-keys">Atalhos: A, B, C, D (ou 1–4) respondem · ← → trocam de questão · R marca pra revisar</p>`));
  // teclado do computador
  if(_examKeys) document.removeEventListener('keydown', _examKeys);
  _examKeys = e=>{
    if(state.screen!=='examRun' || state.session!==sess || sess.submitted || document.querySelector('.gm-modal-bg')){ return; }
    if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||'') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase(), idx = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : ['1','2','3','4'].indexOf(k);
    if(idx>=0 && idx < sess.Q[sess.cur].opts.length){ e.preventDefault(); const qq = sess.Q[sess.cur]; qq.pick = idx; playTones([520], 0.03, 'sine', 0.05); const at = sess.cur; render(); if(at < sess.Q.length-1) setTimeout(()=>{ if(state.session===sess && !sess.submitted && sess.cur===at && state.screen==='examRun'){ sess.cur++; render(); } }, 420); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); if(sess.cur>0){ sess.cur--; render(); } }
    else if(e.key==='ArrowRight'){ e.preventDefault(); if(sess.cur<sess.Q.length-1){ sess.cur++; render(); } }
    else if(k==='r'){ e.preventDefault(); sess.Q[sess.cur].flag = !sess.Q[sess.cur].flag; render(); }
  };
  document.addEventListener('keydown', _examKeys);
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
  const prevExam = a.exams.length ? a.exams[a.exams.length-1] : null;
  if(!sess.redo && !a.exams.some(e=>e.id===sess.id)){
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
  if(sess.redo){ const quiet = {kind:'quiz', combo:0}; state.session = quiet; for(const q of sess.Q){ quiet.combo = 0; await recordAnswer(q.subjectId, q.right, {difficulty:q.diff, ex:q.ex}); } saveGame(); }
  state.session = {kind:'examResult', Q, ok, grade, secs, timeUp:!!timeUp, redo:!!sess.redo, prevGrade: (!sess.redo && prevExam) ? prevExam.grade : null, filter:'all'};
  go('examResult');
}
function examResultScreen(){
  const r = state.session;
  const wrap = document.createElement('div');
  if(!r || r.kind!=='examResult'){ setTimeout(()=>go('arena'), 0); return wrap; }
  wrap.appendChild(topbar(r.redo ? 'Resultado da revisão' : 'Resultado do simulado', true, ()=>go('arena')));
  const c = h(`<div class="content exam-result"></div>`);
  wrap.appendChild(c);
  const N = r.Q.length, blank = r.Q.filter(q=>q.pick<0).length, wrongQ = r.Q.filter(q=>!q.right);
  const msg = r.grade >= 9 ? 'Excelente! Você domina esses assuntos.' : r.grade >= 7 ? 'Muito bom! Revise as que errou e vai longe.' : r.grade >= 5 ? 'Na média. Veja a correção e treine os pontos fracos.' : 'Vamos treinar mais. A correção abaixo mostra o caminho de cada questão.';
  const diff = r.prevGrade===null || r.prevGrade===undefined ? null : Math.round((r.grade - r.prevGrade)*10)/10;
  c.appendChild(h(`<div class="exres-hero ${gradeCls(r.grade)}">
      <div class="ar-ring ${gradeCls(r.grade)}" style="--p:${r.grade*10}"><b>${fmt(r.grade)}</b><small>nota</small></div>
      <h2>${r.redo ? 'Revisão concluída' : r.timeUp ? 'Tempo esgotado' : 'Prova entregue'}</h2>
      <p>${msg}</p>
      ${diff===null ? '' : `<span class="exres-diff ${diff>0?'up':diff<0?'down':''}">${diff>0?`▲ +${fmt(diff)}`:diff<0?`▼ ${fmt(diff)}`:'='} em relação ao último</span>`}
    </div>`));
  c.appendChild(h(`<div class="exres-stats">
      <div class="g"><b>${r.ok}</b><span>certas</span></div>
      <div class="b"><b>${N - r.ok - blank}</b><span>erradas</span></div>
      <div class="w"><b>${blank}</b><span>em branco</span></div>
      <div class="t"><b>${mmssA(r.secs)}</b><span>tempo</span></div>
    </div>`));
  if(r.grade >= 7 && !r.celebrated){ r.celebrated = true; replaceHistoryState(); setTimeout(()=>launchConfetti(r.grade>=10?180:100), 250); }
  const acts = h(`<div class="exres-acts"></div>`);
  if(wrongQ.length){
    const redo = h(`<button type="button" class="btn primary">🔁 Refazer as ${wrongQ.length} erradas</button>`);
    redo.onclick = ()=> startExamRedo(wrongQ);
    acts.appendChild(redo);
  }
  const nw = h(`<button type="button" class="btn ${wrongQ.length?'secondary':'primary'}">📝 Novo simulado</button>`);
  nw.onclick = ()=> go('examSetup');
  acts.appendChild(nw);
  c.appendChild(acts);
  // por assunto
  const by = {};
  r.Q.forEach(q=>{ const b = by[q.subjectId] = by[q.subjectId] || {n:0, ok:0}; b.n++; if(q.right) b.ok++; });
  c.appendChild(h(`<h3 class="ar-label">Por assunto</h3>`));
  const bars = h(`<div class="card ar-bars"></div>`);
  Object.entries(by).sort((x,y)=> x[1].ok/x[1].n - y[1].ok/y[1].n).forEach(([id,b])=>{
    const s = SUBJECTS.find(x=>x.id===id), acc = b.ok/b.n;
    const row = h(`<div class="ar-bar ${acc>=.8?'good':acc>=.5?'mid':'low'}"><div class="ar-bar-l"><b>${s.sym} ${escHTML(s.name)}</b><span>${b.ok}/${b.n}${acc<.8 ? ' <button type="button" class="exr-train">Treinar</button>' : ''}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,Math.round(acc*100))}%"></div></div></div>`);
    const tb = row.querySelector('.exr-train'); if(tb) tb.onclick = ()=> startSession(id, 'medio');
    bars.appendChild(row);
  });
  c.appendChild(bars);
  // correção
  c.appendChild(h(`<h3 class="ar-label">Correção comentada</h3>`));
  const fil = h(`<div class="ex-chips exres-filter"></div>`);
  [['all',`Todas (${N})`],['bad',`Erradas (${N-r.ok})`],['ok',`Certas (${r.ok})`]].forEach(([v,l])=>{
    const b = h(`<button type="button" class="ex-chip ${r.filter===v?'on':''}">${l}</button>`);
    b.onclick = ()=>{ r.filter = v; render(); };
    fil.appendChild(b);
  });
  c.appendChild(fil);
  const grid = h(`<div class="ar-qgrid result" aria-label="Ir para a questão"></div>`);
  r.Q.forEach((q,i)=>{ const b = h(`<button type="button" class="${q.right?'ok':'bad'}" aria-label="Questão ${i+1}: ${q.right?'certa':'errada'}">${i+1}</button>`); b.onclick = ()=>{ if(r.filter!=='all' && (r.filter==='ok') !== q.right){ r.filter = 'all'; render(); } setTimeout(()=>{ const el = document.getElementById('arrv'+i); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }, 30); }; grid.appendChild(b); });
  c.appendChild(grid);
  r.Q.forEach((q,i)=>{
    if(r.filter==='ok' && !q.right) return;
    if(r.filter==='bad' && q.right) return;
    const s = SUBJECTS.find(x=>x.id===q.subjectId), qv = questionHTML(q.ex);
    const ci = q.opts.findIndex(o=>o.ok);
    const it = h(`<div class="card ar-review ${q.right?'ok':'bad'}" id="arrv${i}"><div class="ar-rv-h"><span><b class="rv-n">${i+1}</b> ${s.sym} ${escHTML(s.name)} · ${ARENA_DIFF_NAME[q.diff]}</span><b class="${q.right?'ok':'bad'}">${q.right?'✓ Certa':q.pick<0?'⬜ Em branco':'✗ Errada'}</b></div>
      <div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div>
      <div class="ar-rv-opts"></div>
      <details class="ar-sol" ${q.right?'':'open'}><summary>Resolução passo a passo</summary><div class="fb-steps"></div></details></div>`);
    const ob = it.querySelector('.ar-rv-opts');
    q.opts.forEach((o,j)=>{
      const cls = j===ci ? 'right' : j===q.pick ? 'wrong' : '';
      const d = h(`<div class="rv-opt ${cls}"><span class="k">${'ABCD'[j]}</span><span class="l mono"></span>${j===q.pick ? '<small>sua resposta</small>' : j===ci && !q.right ? '<small>correta</small>' : ''}</div>`);
      d.querySelector('.l').textContent = o.label;
      ob.appendChild(d);
    });
    it.querySelector('.fb-steps').innerHTML = solutionHTML(q.ex);
    c.appendChild(it);
  });
  const foot = h(`<div class="cta-row" style="margin-top:16px"><button type="button" class="btn secondary" data-a="a">Voltar à Arena</button></div>`);
  foot.querySelector('[data-a=a]').onclick = ()=> go('arena');
  c.appendChild(foot);
  return wrap;
}
