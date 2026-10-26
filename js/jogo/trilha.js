/* =========================================================
   Trilha do Show — episódios com fases, vidas (❤️), moedas (🪙),
   o mascote Pi (apresentador), fases de múltipla escolha e o
   Quiz do Show (cronômetro circular, pontos por velocidade).
   ========================================================= */
const HEARTS_MAX = 5;
const HEART_REGEN_MS = 20*60*1000;   // 1 vida a cada 20 min
const HEART_REFILL_COST = 50;        // recarga total com moedas
const PATH_NODES = [
  {type:'lesson', diff:'facil',   n:5, label:'Fase 1 · Fácil'},
  {type:'lesson', diff:'medio',   n:5, label:'Fase 2 · Médio'},
  {type:'chest',                        label:'Prêmio surpresa'},
  {type:'lesson', diff:'dificil', n:5, label:'Fase 3 · Difícil'},
  {type:'trophy',                 n:8, label:'Grande final'},
];
const UNIT_COLORS = [['#4C7DFF','#7B5CFF'],['#B23FE0','#E0409A'],['#1FB6D0','#2BE0A6'],['#FF5C7A','#FF8A4C'],['#E09A00','#FF7A00'],['#6A5CFF','#33D2E3'],['#E0306A','#B23FE0']];
function unitStyle(u){ const [a,b] = UNIT_COLORS[u % UNIT_COLORS.length]; return `--uc:${a};--uc2:${b}`; }
const QUIZ_SECONDS = 20;
const QUIZ_TOTAL = 10;

function allPathNodes(){
  const list = [];
  SUBJECTS.forEach((s,u)=> PATH_NODES.forEach((n,i)=> list.push(Object.assign({key:`${s.id}:${i}`, unit:u, idx:i, subject:s}, n))));
  return list;
}
function pathDone(){ const g = loadGame(); g.path = g.path || {}; return g.path; }
function pathCurrentIndex(){
  const done = pathDone(), all = allPathNodes();
  const i = all.findIndex(n=>!done[n.key]);
  return i<0 ? all.length : i;
}

/* ---------- vidas e moedas ---------- */
function heartsNow(){
  const g = loadGame();
  if(g.hearts===undefined){ g.hearts = HEARTS_MAX; g.heartTs = Date.now(); }
  if(g.gems===undefined) g.gems = 20;
  if(g.hearts < HEARTS_MAX){
    const n = Math.floor((Date.now() - (g.heartTs||Date.now())) / HEART_REGEN_MS);
    if(n>0){ g.hearts = Math.min(HEARTS_MAX, g.hearts+n); g.heartTs += n*HEART_REGEN_MS; saveGame(); }
  }
  return g.hearts;
}
function loseHeart(){
  const g = loadGame(); heartsNow();
  if(g.hearts===HEARTS_MAX) g.heartTs = Date.now();
  g.hearts = Math.max(0, g.hearts-1);
  saveGame();
}
function nextHeartIn(){
  const g = loadGame(); heartsNow();
  if(g.hearts>=HEARTS_MAX) return 0;
  return Math.max(0, HEART_REGEN_MS - (Date.now()-g.heartTs));
}
function gemsNow(){ heartsNow(); return loadGame().gems; }
function addGems(n){ const g = loadGame(); heartsNow(); g.gems += n; saveGame(); }
function refillHeartsWithGems(){
  const g = loadGame(); heartsNow();
  if(g.gems < HEART_REFILL_COST) return false;
  g.gems -= HEART_REFILL_COST; g.hearts = HEARTS_MAX; g.heartTs = Date.now();
  saveGame(); playTones([523,784,1047], 0.08, 'triangle', 0.1);
  return true;
}
function fmtMinSec(ms){ const s = Math.ceil(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* ---------- mascote: Pi, o apresentador do show (cartola com a logo + gravata-borboleta) ---------- */
let _mascotSeq = 0;
/* look = {hat, acc} mostra o Pi com outros itens (prévia da Loja); sem ele usa os itens em uso */
function mascotSVG(mood, size, look){
  mood = mood || 'happy'; size = size || 88; look = look || {};
  const id = 'pi' + (++_mascotSeq);
  const eyes = mood==='sad'
    ? `<ellipse cx="39" cy="56" rx="6" ry="7" fill="#fff"/><ellipse cx="61" cy="56" rx="6" ry="7" fill="#fff"/><circle cx="39" cy="58" r="3.4" fill="#1B1E45"/><circle cx="61" cy="58" r="3.4" fill="#1B1E45"/>
       <path d="M31 47 l12 3 M69 47 l-12 3" stroke="#1B1E45" stroke-width="2.6" stroke-linecap="round"/>`
    : mood==='joy'
    ? `<path d="M32 57 q7 -9 14 0" stroke="#1B1E45" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M54 57 q7 -9 14 0" stroke="#1B1E45" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="39" cy="55" rx="7" ry="8.5" fill="#fff"/><ellipse cx="61" cy="55" rx="7" ry="8.5" fill="#fff"/><circle cx="40" cy="56" r="4" fill="#1B1E45"/><circle cx="62" cy="56" r="4" fill="#1B1E45"/><circle cx="41.5" cy="54" r="1.4" fill="#fff"/><circle cx="63.5" cy="54" r="1.4" fill="#fff"/>`;
  const mouth = mood==='sad'
    ? `<path d="M43 72 q7 -5 14 0" stroke="#1B1E45" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : mood==='joy'
    ? `<path d="M40 66 q10 13 20 0 Z" fill="#1B1E45"/><path d="M45 71 q5 4 10 0" fill="#FF7A9A"/>`
    : `<path d="M42 67 q8 8 16 0" stroke="#1B1E45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<svg class="mascot ${mood}" viewBox="0 0 100 104" width="${size}" height="${size}" aria-hidden="true">
    <defs>
      <radialGradient id="${id}b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#7FE8F2"/><stop offset=".55" stop-color="#33D2E3"/><stop offset="1" stop-color="#4C7DFF"/></radialGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A9E"/><stop offset="1" stop-color="#1B1E45"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="99" rx="24" ry="4" fill="rgba(0,0,0,.25)"/>
    <path d="M22 70 q-10 -2 -10 -12" stroke="#33D2E3" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M78 70 q10 -4 12 -16" stroke="#33D2E3" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="90" cy="52" r="5" fill="#33D2E3"/><path d="M90 47 l2 -8 l-4 0 Z" fill="#FFB800"/><circle cx="90" cy="37" r="4" fill="#FFB800"/>
    <circle cx="50" cy="62" r="32" fill="url(#${id}b)"/>
    <ellipse cx="38" cy="46" rx="8" ry="5" fill="rgba(255,255,255,.35)" transform="rotate(-25 38 46)"/>
    <circle cx="30" cy="68" r="4.5" fill="#FF7A9A" opacity=".55"/><circle cx="70" cy="68" r="4.5" fill="#FF7A9A" opacity=".55"/>
    ${eyes}
    ${mouth}
    <path d="M40 90 l10 4 l-10 4 Z M60 90 l-10 4 l10 4 Z" fill="#FF5C7A"/><circle cx="50" cy="94" r="3" fill="#FFB800"/>
    ${mascotAccSVG(look.acc)}
    ${mascotHatSVG(id, look.hat)}
  </svg>`;
}
function mascotBubble(text, mood){
  return h(`<div class="mascot-row">${mascotSVG(mood||'happy', 78)}<div class="bubble">${text}</div></div>`);
}

/* ---------- múltipla escolha a partir de qualquer questão ---------- */
function answerLabel(ex){
  if(ex.type==='pair') return `x' = ${fmt(ex.answer[0])}  ·  x'' = ${fmt(ex.answer[1])}`;
  if(ex.type==='xy') return `x = ${fmt(ex.answer.x)}  ·  y = ${fmt(ex.answer.y)}`;
  return ex.displayAnswer!==undefined ? String(ex.displayAnswer) : fmt(ex.answer);
}
function buildOptions(ex){
  const correct = answerLabel(ex);
  const cands = [];
  if(ex.type==='pair'){
    const [a,b] = ex.answer;
    [[-a,-b],[a+1,b-1],[a-1,b+1],[a*2,b],[a,b+2],[-a,b],[a+2,b+1]].forEach(([p,q])=>{
      if([p,q].sort().join()!==[a,b].sort().join()) cands.push(`x' = ${fmt(p)}  ·  x'' = ${fmt(q)}`);
    });
  } else if(ex.type==='xy'){
    const {x,y} = ex.answer;
    [[y,x],[x+1,y],[x,y-1],[-x,y],[x+2,y+1],[x-1,y+1],[x,-y]].forEach(([p,q])=>{
      if(p!==x || q!==y) cands.push(`x = ${fmt(p)}  ·  y = ${fmt(q)}`);
    });
  } else if(typeof ex.displayAnswer==='string' && ex.displayAnswer.includes('/')){
    const [n,d] = ex.displayAnswer.split('/').map(Number);
    [[d,n],[n+1,d],[n,d+1],[n-1,d],[n+d,d],[n,d*2],[n*2,d+1]].forEach(([p,q])=>{
      if(q>0 && p>0 && Math.abs(p/q - n/d)>1e-9) cands.push(fracStr(p,q));
    });
  } else {
    const a = Number(ex.answer);
    const dec = (String(a).split('.')[1]||'').length;
    const st = Math.pow(10,-dec);
    const r = v=> Math.round(v*1e6)/1e6;
    [a+1,a-1,a+st,a-st,a+10*st,a-10*st,a*10,a/10,a+2,a-2,-a,a+10,a-10,a*2].forEach(v=>{
      v = r(v);
      if(v!==a && (a<0 || v>=0)) cands.push(ex.displayAnswer!==undefined && Number.isInteger(v) ? String(v) : fmt(v));
    });
  }
  const uniq = [...new Set(cands)].filter(l=>l!==correct);
  const picked = uniq.sort(()=>Math.random()-.5).slice(0,3);
  let k = 3;
  while(picked.length<3 && k<60){
    const d = (k++)*3;
    const extra = ex.type==='pair' ? `x' = ${fmt(ex.answer[0]+d)}  ·  x'' = ${fmt(ex.answer[1])}`
      : ex.type==='xy' ? `x = ${fmt(ex.answer.x+d)}  ·  y = ${fmt(ex.answer.y)}`
      : fmt(Number(ex.answer)+d);
    if(extra!==correct && !picked.includes(extra)) picked.push(extra);
  }
  return [correct, ...picked].sort(()=>Math.random()-.5).map(l=>({label:l, ok:l===correct}));
}
function questionHTML(ex){
  if(ex.columns) return {stacked:true, html: contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`};
  if(ex.visual) return {stacked:true, html: fracRow(ex.visual)};
  if(ex.qVisual) return {stacked:true, html: ex.qVisual};
  return {stacked:false, html: ex.question.replace(/\n/g,'<br>')};
}
/* ---------- correção animada: o passo a passo aparece um de cada vez, com o Pi narrando ----------
   Mostra o enunciado em cima; cada passo entra animado (sozinho a cada ~2,6 s ou tocando em Próximo);
   no fim aparece a conta resolvida e a resposta. Dá pra ouvir em voz alta se o "ouvir" estiver ligado. */
function solutionFinalVisual(ex){
  if(ex.columns) return contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks);
  if(ex.visual){
    const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
    return fracRow(ex.visual.slice(0, -2).concat(['=', ansD ? {n:ansN, d:ansD} : ex.displayAnswer]));
  }
  return ex.solvedVisual || '';
}
function stepPlayerButton(ex, wrong){
  const b = h(`<button type="button" class="sp-open ${wrong?'wrong':''}"><span class="sp-open-i">▶</span><span>Ver a correção animada</span></button>`);
  b.onclick = e=>{ e.stopPropagation(); showStepPlayer(ex); };
  return b;
}
/* quadro da conta que vai se montando ao vivo, junto com os passos do Pi:
   - conta armada de + e − (ex.columns) ou qualquer conta armada / divisão na chave pronta (ex.liveHTML);
   - o resultado começa escondido e cada passo revela só o que aquele passo calculou. */
function liveBoardEl(ex){
  let html = '';
  if(ex.liveHTML) html = ex.liveHTML;
  else if(ex.columns && ['+','−','-'].includes(ex.columns.op)) html = contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks);
  if(!html) return null;
  const el = h(`<div class="lv-board">${html}</div>`);
  const ca = el.querySelector('.conta-armada'), dc = el.querySelector('.divisao-chave');
  if(ca){
    // linhas abaixo do 1º traço: produtos parciais (multiplicação com 2+ algarismos) e o resultado
    const kids = [...ca.children]; const firstLine = kids.findIndex(k=>k.classList.contains('ca-line'));
    el._partials = kids.slice(firstLine+1).filter(k=>k.classList.contains('ca-row') && !k.classList.contains('ca-result'));
    ca.querySelectorAll('.ca-row').forEach(row=>{
      const cells = [...row.querySelectorAll('.ca-cell:not(.ca-sign):not(.ca-comma)')].reverse();
      cells.forEach((cell,k)=>{ cell.dataset.c = k; });
      const hide = row.classList.contains('ca-result') || row.classList.contains('ca-carry-row') || el._partials.includes(row);
      if(hide) [...row.querySelectorAll('.ca-cell')].forEach(cell=>{
        // vai um de várias linhas (1|2): cada pedaço aparece com a sua linha
        if(cell.querySelector('.ca-cp')){ cell.querySelectorAll('.ca-cp, .ca-cpsep').forEach(x=> x.classList.add('lv-hide')); return; }
        if(cell.textContent.trim()) cell.classList.add('lv-hide');
      });
    });
    ca.querySelectorAll('.ca-strike').forEach(cell=>{ cell.classList.remove('ca-strike'); cell.classList.add('lv-strike-later'); });
    el._kind = 'armada';
  } else if(dc){
    const q = dc.querySelector('.dc-quotient');
    q.innerHTML = [...q.textContent.trim()].map(ch=>`<span class="lv-q lv-hide">${ch}</span>`).join('');
    const left = dc.querySelector('.dc-left');
    el._rows = [...left.children].slice(1); // a 1ª linha é o dividendo: fica sempre
    el._rows.forEach(r=> r.classList.add('lv-hide'));
    el._kind = 'chave';
  }
  return el;
}
/* mostra no quadro tudo o que os passos 0..i já calcularam (refaz do zero a cada passo) */
function liveBoardStep(el, i, done, steps){
  if(!el) return;
  const plain = t=> String(t||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const show = node=>{ if(node.classList.contains('lv-hide')){ node.classList.remove('lv-hide'); node.classList.add('lv-pop'); } };
  el.querySelectorAll('.lv-now').forEach(x=>x.classList.remove('lv-now'));
  if(el._kind==='chave'){
    const qd = [...el.querySelectorAll('.lv-q')];
    let qn = 0, ptr = 0;
    const rows = el._rows;
    for(let k=0; k<=i && k<steps.length; k++){
      const t = plain(steps[k]);
      if(/cabe/i.test(t)){ if(qd[qn]) show(qd[qn]); qn++; while(ptr<rows.length && !rows[ptr].classList.contains('dc-sub')) ptr++; if(rows[ptr]){ show(rows[ptr]); if(k===i) rows[ptr].classList.add('lv-now'); ptr++; } if(rows[ptr] && rows[ptr].classList.contains('dc-line')){ show(rows[ptr]); ptr++; } }
      else if(/^Desça|desce/i.test(t)){ if(rows[ptr] && !rows[ptr].classList.contains('dc-sub')){ show(rows[ptr]); if(k===i) rows[ptr].classList.add('lv-now'); ptr++; } }
      else if(/−|-/.test(t) && /=/.test(t)){ const fin = rows.find(r=>r.classList.contains('dc-final')); if(fin && !rows.slice(ptr).some(r=>r.classList.contains('dc-sub'))){ show(fin); if(k===i) fin.classList.add('lv-now'); } }
    }
    if(done){ qd.forEach(show); rows.forEach(show); }
    return;
  }
  // conta armada
  const partials = el._partials || [];
  const byColumn = steps.slice(0, Math.max(1, steps.length)).some(t=> /^(Unidades|Dezenas|Centenas|Milhares|Décimos|Centésimos|Milésimos|Ainda tem)/i.test(plain(t)));
  if(partials.length && !steps.some(t=> /Multiplique|produto/i.test(plain(t)))){
    // a explicação faz a conta inteira de uma vez (ex.: decimais "ignore as vírgulas: 25 × 12 = 300")
    el.querySelectorAll('.lv-hide').forEach(show);
    return;
  }
  if(partials.length){
    // um produto parcial por passo; o resultado no passo da soma
    partials.forEach((row,k)=>{ if(done || k<=i){ row.querySelectorAll('.lv-hide').forEach(show); if(k===i && !done) row.classList.add('lv-now'); } });
    el.querySelectorAll('.ca-cp').forEach(sp=>{ if(done || Number(sp.dataset.p)<=i) show(sp); });
    el.querySelectorAll('.ca-cpsep').forEach(sep=>{ const l = sep.previousElementSibling; if(l && !l.classList.contains('lv-hide')) show(sep); });
    if(done || i>=partials.length) el.querySelectorAll('.ca-result .lv-hide, .ca-carry-row .lv-hide').forEach(show);
    return;
  }
  if(!byColumn){ if(done) el.querySelectorAll('.lv-hide').forEach(show); el.querySelectorAll('.lv-strike-later').forEach(c=>{ if(done){ c.classList.remove('lv-strike-later'); c.classList.add('ca-strike'); } }); return; }
  el.querySelectorAll('[data-c]').forEach(cell=>{
    const c = Number(cell.dataset.c);
    const row = cell.closest('.ca-row');
    const isRes = row.classList.contains('ca-result'), isTop = row.classList.contains('ca-carry-row');
    const vis = done || (isRes ? c <= i : isTop ? c <= i+1 : true);
    if(vis) show(cell);
    if(cell.classList.contains('lv-strike-later') && (done || c <= i+1)){ cell.classList.remove('lv-strike-later'); cell.classList.add('ca-strike'); }
    if(!done && c===i && !isTop) cell.classList.add('lv-now');
  });
}
/* pergunta no meio: passos que terminam numa conta "… = número" viram pergunta antes de aparecer */
function stepQuizOf(stepHtml){
  const t = String(stepHtml).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const m = t.match(/^(.*\S)\s*=\s*(−?-?\d+(?:[.,]\d+)?)(\s*(?:→.*)?)$/);
  if(!m) return null;
  const val = Number(m[2].replace('−','-').replace(',','.'));
  if(!isFinite(val) || m[1].length < 3 || !/\d/.test(m[1])) return null;
  const dec = (m[2].split(/[.,]/)[1]||'').length, st = dec ? Math.pow(10,-dec) : 1;
  const r = v=> Math.round(v*1e6)/1e6;
  const cands = [...new Set([val+st, val-st, val+10*st, val+2*st, val-2*st, val*2].map(r))].filter(v=> v!==val && (val<0 || v>=0));
  const opts = shuffle([val, ...shuffle(cands).slice(0,2)]);
  const show = v=> fmt(v);
  return {ask: `${m[1]} = ?`, opts: opts.map(v=>({label:show(v), ok:v===val})), rest: m[3]||''};
}
function showStepPlayer(ex, o){
  o = o || {};
  const steps = (ex.steps||[]).filter(Boolean);
  const finalVis = solutionFinalVisual(ex);
  const total = steps.length + 1; // + o slide final com a resposta
  const canTalk = ('speechSynthesis' in window) && currentSettingsSync().tts!==false;
  const board = liveBoardEl(ex);
  // até 2 perguntas no meio, nos passos com conta (nunca no primeiro passo nem no "Resultado")
  const quizIdx = steps.map((s,k)=> k>0 && !/^Resultado/i.test(String(s).replace(/<[^>]*>/g,'').trim()) && stepQuizOf(s) ? k : -1).filter(k=>k>=0);
  // o.noQuiz: só mostra a conta sendo feita, sem perguntas (exemplos de Aprender)
  const asks = new Set(o.noQuiz ? [] : quizIdx.length<=2 ? quizIdx : [quizIdx[Math.floor(quizIdx.length/3)], quizIdx[Math.floor(quizIdx.length*2/3)]]);
  const answered = {};
  let i = -1, playing = true, timer = null, talk = false, score = 0;
  const qv = questionHTML(ex);
  const bg = document.createElement('div');
  bg.className = 'sp-full';
  bg.innerHTML = `<div class="sp-card" role="dialog" aria-label="Correção animada">
      <div class="sp-head"><button type="button" class="sp-x" aria-label="Fechar">✕</button><div class="sp-bar"><i></i></div><span class="sp-count"></span></div>${o.title ? `<div class="sp-title">${o.title}</div>` : ''}
      <div class="sp-top">${board ? '' : `<div class="sp-q mono ${qv.stacked?'stacked':''}">${qv.html}</div>`}</div>
      <div class="sp-stage" aria-live="polite"></div>
      <div class="sp-pi"><div class="sp-pi-av"></div><div class="sp-pi-b"></div></div>
      <div class="sp-ctrl">
        <button type="button" class="sp-b sp-prev" aria-label="Passo anterior">◀</button>
        <button type="button" class="sp-b sp-play" aria-label="Pausar">⏸</button>
        <button type="button" class="sp-b sp-next" aria-label="Próximo passo">▶</button>
        ${canTalk ? '<button type="button" class="sp-b sp-talk" aria-label="Ouvir em voz alta">🔇</button>' : ''}
      </div>
    </div>`;
  if(board) bg.querySelector('.sp-top').appendChild(board);
  const stage = bg.querySelector('.sp-stage'), bar = bg.querySelector('.sp-bar i'), piB = bg.querySelector('.sp-pi-b'), pi = bg.querySelector('.sp-pi-av');
  const lines = ['Agora o próximo passo…', 'Olha só…', 'Quase lá…', 'Mais um passo…', 'Presta atenção aqui…'];
  const plain = html=> String(html).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const say = (txt, mood)=>{ piB.textContent = txt; pi.innerHTML = mascotSVG(mood||'happy', 76); };
  function paint(){
    bar.style.width = `${(i+1)/total*100}%`;
    bg.querySelector('.sp-count').textContent = `${Math.min(i+1,total)}/${total}`;
    stage.innerHTML = '';
    const pendingQuiz = i < steps.length && asks.has(i) && !answered[i];
    for(let k=0; k<=Math.min(i, steps.length-1); k++){
      if(k===i && pendingQuiz){
        const q = stepQuizOf(steps[k]);
        const box = h(`<div class="sp-step now sp-quiz"><span class="sp-n">${k+1}</span><div class="sp-t"><div class="sp-qa"></div><div class="sp-qo"></div></div></div>`);
        box.querySelector('.sp-qa').textContent = q.ask;
        q.opts.forEach(o=>{
          const b = h(`<button type="button" class="sp-opt mono"></button>`); b.textContent = o.label;
          b.onclick = ()=>{
            box.querySelectorAll('.sp-opt').forEach(x=>{ x.disabled = true; if(x.textContent===q.opts.find(y=>y.ok).label) x.classList.add('ok'); });
            if(o.ok){ score++; answered[k] = 'ok'; playTones([660,880], 0.06, 'triangle', 0.07); say(pick(['Isso! Você acertou! 🎉','Mandou bem! 👏','Exatamente! ⭐']), 'joy'); }
            else { b.classList.add('bad'); answered[k] = 'bad'; playTones([300,220], 0.08, 'sine', 0.06); say('Quase! Olha qual era a certa 👀', 'happy'); }
            setTimeout(()=>{ if(bg.isConnected){ playing = true; paint(); schedule(); } }, 1300);
          };
          box.querySelector('.sp-qo').appendChild(b);
        });
        stage.appendChild(box);
        continue;
      }
      const d = h(`<div class="sp-step ${k===i?'now':'past'} ${answered[k]==='ok'?'got':''}"><span class="sp-n">${answered[k]==='ok'?'★':k+1}</span><div class="sp-t">${steps[k]}</div></div>`);
      stage.appendChild(d);
    }
    if(board){
      // na pergunta, a coluna fica destacada mas o resultado dela só aparece depois da resposta
      const kk = pendingQuiz ? i-1 : Math.min(i, steps.length-1);
      liveBoardStep(board, kk, !pendingQuiz && (i >= steps.length || (i === steps.length-1 && /^Resultado|Resto final|Quociente/i.test(plain(steps[i]))) || /^Resultado/i.test(plain(steps[Math.max(0,i)]))), steps);
      if(pendingQuiz) board.querySelectorAll('.lv-now').forEach(x=>x.classList.remove('lv-now'));
      if(pendingQuiz) board.querySelectorAll(`[data-c="${i}"]`).forEach(cell=>{ if(!cell.closest('.ca-carry-row')) cell.classList.add('lv-now'); });
    }
    if(i >= steps.length){
      stage.appendChild(h(`<div class="sp-final">${finalVis && !board ? `<div class="sp-fv">${finalVis}</div>` : ''}<div class="sp-ans"><small>Resposta</small><b class="mono"></b></div>${asks.size ? `<div class="sp-score">Você acertou ${score} de ${asks.size} no caminho ${score===asks.size?'🌟':''}</div>` : ''}</div>`));
      if(ex.conclusion!==undefined){ stage.querySelector('.sp-ans small').textContent = 'Conclusão'; stage.querySelector('.sp-ans b').className = 'sp-concl'; stage.querySelector('.sp-ans b').innerHTML = ex.conclusion; }
      else stage.querySelector('.sp-ans b').textContent = answerLabel(ex);
      say('Pronto! Agora você já sabe o caminho. 🌟', 'joy');
      playTones([523,659,784], 0.07, 'triangle', 0.06);
    } else if(pendingQuiz){
      say('E agora, quanto dá? Tenta você! 🤔', 'happy');
    } else if(!answered[i]){
      say(i<=0 ? 'Vamos resolver juntos, passo a passo!' : lines[i % lines.length], 'happy');
    }
    const now = stage.querySelector('.sp-step.now, .sp-final');
    // rola só a lista dos passos (scrollIntoView rolava a tela inteira e escondia o quadro da conta)
    if(now) stage.scrollTo({top: now.offsetTop - stage.offsetTop - 8, behavior:'smooth'});
    bg.querySelector('.sp-prev').disabled = i<=0;
    bg.querySelector('.sp-next').disabled = i>=total-1 || pendingQuiz;
    if(talk && !pendingQuiz){ speak(i>=steps.length ? (ex.conclusion!==undefined ? plain(ex.conclusion) : `A resposta é ${plain(answerLabel(ex))}`) : plain(steps[i])); }
    else if(talk && pendingQuiz){ speak('E agora, quanto dá?'); }
  }
  function go_(k){ i = Math.max(0, Math.min(total-1, k)); paint(); schedule(); }
  function schedule(){
    clearTimeout(timer);
    const pb = bg.querySelector('.sp-play');
    const waiting = i < steps.length && asks.has(i) && !answered[i];
    if(i>=total-1) playing = false;
    pb.textContent = waiting ? '⏳' : playing ? '⏸' : (i>=total-1 ? '↺' : '▶');
    pb.disabled = waiting;
    if(playing && !waiting){
      const len = i>=0 && i<steps.length ? plain(steps[i]).length : 0;
      timer = setTimeout(()=>{ if(bg.isConnected) go_(i+1); }, Math.min(6500, 2200 + len*45 + (talk ? len*40 : 0)));
    }
  }
  function close(){ clearTimeout(timer); try{ speechSynthesis.cancel(); }catch(e){} bg.remove(); document.documentElement.classList.remove('sp-open-lock'); }
  bg.querySelector('.sp-x').onclick = close;
  bg.querySelector('.sp-prev').onclick = ()=>{ playing = false; go_(i-1); };
  bg.querySelector('.sp-next').onclick = ()=>{ playing = false; go_(i+1); };
  bg.querySelector('.sp-play').onclick = ()=>{
    if(i>=total-1){ playing = true; Object.keys(answered).forEach(k=>delete answered[k]); score = 0; if(board){ const nb = liveBoardEl(ex); board.replaceWith(nb); } go_(0); return; }
    playing = !playing; schedule();
  };
  const tb = bg.querySelector('.sp-talk');
  if(tb) tb.onclick = ()=>{ talk = !talk; tb.textContent = talk ? '🔊' : '🔇'; if(!talk) try{ speechSynthesis.cancel(); }catch(e){} else speak(plain(piB.textContent)); };
  document.documentElement.classList.add('sp-open-lock');
  document.body.appendChild(bg);
  go_(0);
}
function solutionHTML(ex){
  let stepsList = ex.steps;
  if(ex.columns){
    stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
  } else if(ex.visual){
    const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
    const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
    stepsList = [fracRow(ex.visual.slice(0, -2).concat(['=', ansToken])), ...ex.steps];
  } else if(ex.solvedVisual){
    stepsList = [ex.solvedVisual, ...ex.steps];
  }
  return stepsList.map(st=>`<div class="step">${st}</div>`).join('');
}

/* ---------- iniciar lições / quiz ---------- */
function newLessonQuestion(sess){
  const subj = SUBJECTS.find(s=>s.id===sess.subjectId) || pick(SUBJECTS);
  let diff = sess.diff;
  if(diff==='mix') diff = (sess.asked % 2) ? 'dificil' : 'medio';
  const {ex, signature} = genQuestionAvoidingRepeat(subj, diff, sess.lastSignature);
  sess.lastSignature = signature;
  return {ex, subjectId:subj.id, diff, opts: buildOptions(ex)};
}
function startPathLesson(node, jump){
  if(!jump && heartsNow()<=0){ showNoHearts(); return; }
  const sess = {
    kind:'lesson', nodeKey: jump ? null : node.key, jumpUnit: jump ? node.unit : null,
    subjectId: node.subject.id, diff: jump ? 'mix' : (node.type==='trophy' ? 'mix' : node.diff),
    needed: jump ? 6 : node.n, maxWrong: jump ? 2 : null,
    asked:0, cleared:0, correct:0, wrong:0, retry:[], combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs: Date.now(), lastSignature:null,
  };
  sess.q = newLessonQuestion(sess); sess.asked++;
  state.session = sess;
  go('lesson');
}
/* Quiz do Show: de quais assuntos vêm as perguntas */
const QUIZ_POOLS = [['all','🌎','Todos'], ['fund','📘','Fundamental'], ['em','🎓','Ensino Médio']];
const QUIZ_HELPS = [['fifty','½','50:50','Tira 2 erradas'], ['time','⏱','+10s','Mais tempo'], ['skip','⏭','Pular','Troca a pergunta']];
/* recorde por dificuldade; "Todos" usa a mesma chave de antes (não perde o recorde antigo) */
const quizBestKey = (pool, diff)=> (!pool || pool==='all') ? diff : `${pool}:${diff}`;
function quizPickSubject(sess){
  const ids = sess.pool && sess.pool!=='all' ? levelIds(sess.pool) : SUBJECTS.map(s=>s.id);
  const list = SUBJECTS.filter(s=> ids.includes(s.id) && s.id!==sess.subjectId);
  return (list.length ? pick(list) : pick(SUBJECTS)).id;
}
function startQuiz(difficulty, pool){
  pool = pool || 'all';
  const sess = {kind:'quiz', diff:difficulty, pool, needed:QUIZ_TOTAL, asked:0, cleared:0, correct:0, wrong:0, score:0, qStreak:0, bestStreak:0, combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs:Date.now(), lastSignature:null, lastPoints:0,
    helps:{fifty:true, time:true, skip:true}, log:[]};
  sess.subjectId = quizPickSubject(sess);
  sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
  state.session = sess;
  go('lesson');
}
function lessonAdvance(sess){
  sess.selected = null; sess.checked = false; sess.wasCorrect = null; sess.tryAgain = false;
  if(sess.kind==='quiz'){
    if(sess.asked >= sess.needed || sess.outOfLives){ sess.finished = true; return; }
    if(sess.mode){ arenaNextQuestion(sess); return; } // Arena: fase de um assunto ou Desafio do Dia
    sess.subjectId = quizPickSubject(sess);
    sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
    return;
  }
  if(sess.maxWrong!==null && sess.wrong > sess.maxWrong){ sess.failed = true; return; }
  if(sess.cleared >= sess.needed){ sess.finished = true; return; }
  const newLeft = sess.needed - sess.cleared - sess.retry.length;
  if(newLeft > 0){ sess.q = newLessonQuestion(sess); sess.asked++; }
  else { const q = sess.retry.shift(); q.opts = buildOptions(q.ex); q.out = []; q.cut = null; q.retry = true; sess.q = q; }
}

/* ---------- tela da fase / quiz ---------- */
function lessonScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.className = 'lesson-wrap';
  if(!sess || (sess.kind!=='lesson' && sess.kind!=='quiz')){ setTimeout(()=>go('home'),0); return wrap; }
  const isQuiz = sess.kind==='quiz';
  if(sess.finished || sess.failed){ lessonEnd(wrap, sess); return wrap; }

  const exitTo = sess.exitTo || (isQuiz ? 'quizSetup' : 'path');
  const top = h(`<div class="lesson-top"><button class="lesson-x" aria-label="Sair">✕</button><div class="lesson-prog"><i style="width:${Math.round((isQuiz? (sess.asked-1+(sess.checked?1:0)) : sess.cleared)/sess.needed*100)}%"></i></div>${
    isQuiz ? `${sess.lives!==undefined ? `<span class="lesson-hearts" aria-label="${sess.lives} vidas">❤️ ${sess.lives}</span>` : ''}<span class="lesson-score">🏅 ${sess.score}</span>` : sess.maxWrong!==null ? `<span class="lesson-hearts">🛡️ ${Math.max(0,sess.maxWrong+1-sess.wrong)}</span>` : `<span class="lesson-hearts">❤️ ${heartsNow()}</span>`
  }</div>`);
  top.querySelector('.lesson-x').onclick = ()=>{
    showConfirm({
      icon:'🚪', title: sess.mode==='daily' ? 'Sair do desafio?' : isQuiz && !sess.mode ? 'Sair do quiz?' : 'Sair da fase?',
      message: sess.mode==='daily' ? 'O Desafio do Dia vale uma tentativa: se sair agora, conta só o que você já respondeu.' : isQuiz && !sess.mode ? 'Sua pontuação desta partida será perdida.' : 'Você vai perder o progresso desta fase.',
      ok:'Sair', cancel: isQuiz ? 'Continuar jogando' : 'Continuar a fase', danger:true,
    }).then(ok=>{ if(ok){ if(sess.mode) arenaQuit(sess); go(exitTo); } });
  };
  wrap.appendChild(top);
  const c = h(`<div class="content lesson-body"></div>`);
  wrap.appendChild(c);

  const q = sess.q, ex = q.ex;
  const subj = SUBJECTS.find(s=>s.id===q.subjectId);
  if(isQuiz){
    const meta = h(`<div class="quiz-meta"><div class="qm-t">${sess.mode==='daily' ? `DESAFIO DO DIA · ${sess.asked}/${sess.needed}` : `PERGUNTA ${sess.asked} DE ${sess.needed}`}<br>${subj.sym} ${subj.name}${sess.mode==='arena' ? ` · ${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[sess.diff]}` : ''}</div>
      <div class="quiz-ring"><svg viewBox="0 0 58 58"><defs><linearGradient id="qr-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C7DFF"/><stop offset="1" stop-color="#B23FE0"/></linearGradient></defs>
      <circle class="trk" cx="29" cy="29" r="25" fill="none" stroke-width="6"/><circle class="bar" cx="29" cy="29" r="25" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="157.08"/></svg><span></span></div></div>`);
    c.appendChild(meta);
    const tb = meta.querySelector('.quiz-ring');
    const paint = ()=>{
      const QS = q.secs || QUIZ_SECONDS; // o Desafio do Dia dá mais tempo pras perguntas difíceis
      const left = sess.checked ? (sess.timeLeft||0) : Math.max(0, QS - (Date.now()-sess.qStart)/1000);
      tb.querySelector('.bar').style.strokeDashoffset = 157.08*(1 - left/QS);
      tb.querySelector('span').textContent = Math.ceil(left);
      tb.classList.toggle('low', left<=5);
      return left;
    };
    paint();
    if(!sess.checked){
      const timer = setInterval(()=>{
        if(!wrap.isConnected || state.session!==sess || sess.checked){ clearInterval(timer); return; }
        if(paint()<=0){ clearInterval(timer); lessonCheck(sess, null); }
      }, 100);
    }
    if(sess.helps && !sess.mode){
      const hb = h(`<div class="quiz-helps"></div>`);
      QUIZ_HELPS.forEach(([id,ico,label,tip])=>{
        const used = !sess.helps[id];
        const b = h(`<button type="button" class="qh ${used?'used':''}" title="${tip}" aria-label="${label}: ${tip}"><span class="qh-i">${ico}</span><span class="qh-l">${label}</span></button>`);
        b.disabled = used || sess.checked;
        b.onclick = ()=>{ if(sess.checked || !sess.helps[id]) return; sess.helps[id] = false; quizUseHelp(sess, id); };
        hb.appendChild(b);
      });
      c.appendChild(hb);
    }
  } else {
    c.appendChild(h(`<div class="lesson-kicker">${q.retry ? '🔁 ERRO ANTERIOR' : sess.jumpUnit!==null ? '⏩ TESTE DE NIVELAMENTO' : `${subj.sym} ${subj.name.toUpperCase()}`}</div>`));
    c.appendChild(h(`<h2 class="lesson-title">Escolha a resposta certa</h2>`));
  }
  const qv = questionHTML(ex);
  const qcard = h(`<div class="question-card lesson-q"><div class="qtext mono ${qv.stacked?'stacked':''}">${qv.html}</div></div>`);
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(!isQuiz){
    const row = h(`<div class="lesson-q-row"></div>`);
    row.appendChild(h(`<div class="lesson-mascot">${mascotSVG(sess.checked ? (sess.wasCorrect?'joy':'sad') : (sess.tryAgain ? 'sad' : 'happy'), 64)}</div>`));
    row.appendChild(qcard);
    c.appendChild(row);
  } else c.appendChild(qcard);

  const opts = h(`<div class="${isQuiz?'quiz-opts':'mc-opts'}"></div>`);
  const shapes = ['A','B','C','D'];
  q.opts.forEach((o,i)=>{
    let cls = isQuiz ? 'quiz-opt' : 'mc-opt';
    if(sess.selected===i) cls += ' sel';
    const isOut = (q.cut||[]).includes(i) || (!isQuiz && (q.out||[]).includes(i));
    if(isOut) cls += ' out';
    if(sess.checked){ if(o.ok) cls += ' right'; else if(sess.selected===i) cls += ' wrongpick'; else if(!isOut) cls += ' dim'; }
    const b = h(`<button type="button" class="${cls}">${isQuiz ? `<span class="shape">${shapes[i]}</span>` : `<span class="key">${shapes[i]}</span>`}<span class="lbl mono"></span></button>`);
    b.querySelector('.lbl').textContent = o.label;
    b.disabled = sess.checked || isOut;
    b.onclick = ()=>{
      if(sess.checked || isOut) return;
      if(isQuiz){ lessonCheck(sess, i); return; }
      sess.selected = i;
      playTones([520], 0.03, 'sine', 0.05);
      opts.querySelectorAll('.mc-opt').forEach((el,j)=> el.classList.toggle('sel', j===i));
      checkBtn.disabled = false;
    };
    opts.appendChild(b);
  });
  if(!sess.checked){
    const tip = isQuiz
      ? firstTimeTip('quiz', 'Responda rápido! O círculo mostra o tempo que falta — quanto mais rápido acertar, mais pontos. 🏅')
      : firstTimeTip('lesson', 'Toque na resposta que você acha certa e depois em <b>CONFIRMAR</b>. Errou? Sem problema: tente de novo, e se precisar peça uma dica 💡');
    if(tip) c.appendChild(tip);
  }
  c.appendChild(opts);
  if(paidHelpsAllowed(sess)) c.appendChild(paidHelpsBar(sess));
  if(!isQuiz && sess.tryAgain && !sess.checked){
    const tries = (q.out||[]).length;
    const hintHtml = HINTS[q.subjectId];
    const box = h(`<div class="try-again">
      <div class="ta-head"><span class="ta-ico">🤔</span><div><div class="ta-t">${tries>=2 ? 'Ainda não! Continue tentando' : 'Não é essa! Tente de novo'}</div><div class="ta-s">A alternativa riscada está errada. Pense de novo com calma.</div></div></div>
      ${hintHtml ? `<button type="button" class="ta-hint-btn">💡 Ver dica</button><div class="ta-hint" style="display:none">${hintHtml}</div>` : ''}
    </div>`);
    const hb = box.querySelector('.ta-hint-btn');
    if(hb){
      if(tries>=2){ box.querySelector('.ta-hint').style.display=''; hb.textContent = '💡 Esconder dica'; }
      hb.onclick = ()=>{ const d = box.querySelector('.ta-hint'); const open = d.style.display==='none'; d.style.display = open?'':'none'; hb.textContent = open ? '💡 Esconder dica' : '💡 Ver dica'; };
    }
    c.appendChild(box);
  }

  let checkBtn = null;
  if(!sess.checked){
    if(!isQuiz){
      const bar = h(`<div class="lesson-footer"><button class="show-btn" ${sess.selected===null?'disabled':''}>CONFIRMAR</button></div>`);
      checkBtn = bar.querySelector('button');
      checkBtn.onclick = ()=>{ if(sess.selected!==null) lessonCheck(sess, sess.selected); };
      wrap.appendChild(bar);
    }
  } else {
    const ok = sess.wasCorrect;
    const praise = isQuiz
      ? (ok ? `+${sess.lastPoints.toLocaleString('pt-BR')} pontos!${sess.qStreak>=2?` 🔥 ${sess.qStreak} seguidas`:''}` : (sess.selected===null ? '⏰ Tempo esgotado!' : 'Não foi dessa vez!'))
      : (ok ? (q.missed ? pick(['Isso aí, conseguiu! 💪','Acertou! Persistência é tudo! 🌟','Boa! Não desistiu! 👏']) : pick(['Aplausos! 👏','Na mosca! 🎯','Show de bola!','Brilhou! ✨','Que talento! 🌟'])) : 'Quase! A resposta era:');
    const sheet = h(`
      <div class="fb-sheet ${ok?'ok':'bad'}">
        <div class="fb-head"><span class="fb-ico">${ok?'👏':'🤔'}</span><div><div class="fb-t">${praise}</div>${!ok || isQuiz ? `<div class="fb-ans mono"></div>`:''}</div></div>
        <div class="fb-why-row"><button type="button" class="fb-why">📖 Ver explicação</button></div>
        <div class="fb-steps" style="display:none"></div>
        <button class="show-btn ${ok?'ok':'bad'}">PRÓXIMA ›</button>
      </div>`);
    const ansEl = sheet.querySelector('.fb-ans');
    if(ansEl) ansEl.textContent = ok ? `Resposta: ${answerLabel(ex)}` : answerLabel(ex);
    sheet.querySelector('.fb-steps').innerHTML = solutionHTML(ex);
    sheet.querySelector('.fb-why-row').appendChild(stepPlayerButton(ex, !ok));
    sheet.querySelector('.fb-why').onclick = (e)=>{
      const st = sheet.querySelector('.fb-steps');
      const open = st.style.display==='none';
      st.style.display = open ? '' : 'none';
      e.target.textContent = open ? '📖 Esconder explicação' : '📖 Ver explicação';
    };
    sheet.querySelector('.show-btn').onclick = ()=>{
      if(!isQuiz && sess.kind==='lesson' && sess.maxWrong===null && heartsNow()<=0 && !sess.finished){
        showNoHearts(()=>{ lessonAdvance(sess); render(); });
        return;
      }
      lessonAdvance(sess); render(); window.scrollTo(0,0);
    };
    wrap.appendChild(sheet);
  }
  return wrap;
}
function quizUseHelp(sess, id){
  const q = sess.q;
  playTones([523,784], 0.06, 'triangle', 0.07);
  if(id==='fifty'){
    const wrong = q.opts.map((o,i)=> o.ok ? -1 : i).filter(i=>i>=0).sort(()=>Math.random()-.5);
    q.cut = wrong.slice(0,2);
  } else if(id==='time'){
    q.secs = (q.secs || QUIZ_SECONDS) + 10;
  } else if(id==='skip'){
    sess.subjectId = quizPickSubject(sess);
    sess.q = newLessonQuestion(sess); sess.qStart = Date.now();
  }
  render();
}
async function lessonCheck(sess, idx){
  if(sess.checked) return;
  const q = sess.q;
  const ok = idx!==null && q.opts[idx].ok;
  // Trilha: errou → não mostra a resposta; risca a alternativa e deixa tentar de novo
  if(sess.kind!=='quiz' && !ok){
    giveAnswerFeedback(false);
    q.out = (q.out||[]).concat(idx);
    sess.selected = null; sess.tryAgain = true;
    if(!q.missed){
      q.missed = true; sess.wrong++;
      if(sess.maxWrong===null) loseHeart();
      await recordAnswer(q.subjectId, false, {difficulty: q.diff, ex: q.ex});
    }
    if(sess.maxWrong!==null && sess.wrong > sess.maxWrong){ sess.failed = true; render(); return; }
    render();
    if(sess.maxWrong===null && heartsNow()<=0) showNoHearts(()=> render());
    return;
  }
  sess.selected = idx; sess.checked = true; sess.wasCorrect = ok; sess.tryAgain = false;
  giveAnswerFeedback(ok);
  if(sess.kind==='quiz'){
    const QS = q.secs || QUIZ_SECONDS;
    const left = Math.max(0, QS - (Date.now()-sess.qStart)/1000);
    sess.timeLeft = left;
    if(ok){ sess.qStreak++; sess.lastPoints = Math.round(500 + 500*left/QS) + Math.min(sess.qStreak-1,5)*100; sess.score += sess.lastPoints; sess.correct++; }
    else { sess.qStreak = 0; sess.lastPoints = 0; sess.wrong++; }
    sess.bestStreak = Math.max(sess.bestStreak||0, sess.qStreak);
    if(sess.log){
      const s0 = SUBJECTS.find(s=>s.id===q.subjectId);
      sess.log.push({ok, pts:sess.lastPoints, secs:Math.round((QS-left)*10)/10, subj: s0 ? `${s0.sym} ${s0.name}` : '',
        q: String(q.ex.question || '').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90),
        ans: answerLabel(q.ex), picked: idx===null ? null : q.opts[idx].label});
    }
    sess.cleared++;
    if(sess.mode) arenaAfterCheck(sess, ok);
  } else {
    // acertou: conta como resolvida; só conta "de primeira" (e dá XP) se não tinha errado antes
    sess.cleared++;
    if(!q.missed) sess.correct++;
  }
  if(!q.missed) await recordAnswer(q.subjectId, ok, {difficulty: q.diff, ex: q.ex});
  render();
}
function lessonEnd(wrap, sess){
  const c = h(`<div class="content lesson-end"></div>`);
  wrap.appendChild(c);
  if(sess.kind==='quiz' && sess.mode){ arenaQuizEnd(c, sess); return; }
  const secs = Math.round((Date.now()-sess.startTs)/1000);
  const answered = sess.correct + sess.wrong;
  const acc = answered ? Math.round(sess.correct/answered*100) : 0;
  const g = loadGame();
  if(sess.failed){
    c.appendChild(h(`<div class="le-mascot">${mascotSVG('sad',130)}</div>`));
    c.appendChild(h(`<h2 class="le-title" style="color:#FF4B4B">Não foi dessa vez!</h2>`));
    c.appendChild(h(`<p class="le-sub">Tudo bem — continue a trilha no seu ritmo e tente de novo depois. 💪</p>`));
    const b = h(`<div class="lesson-footer static"><button class="show-btn">VOLTAR À TRILHA</button></div>`);
    b.querySelector('button').onclick = ()=> go('path');
    c.appendChild(b);
    return;
  }
  let gems = 0, extra = '';
  if(!sess.endDone){
    sess.endDone = true;
    gameEnsureToday();
    if(sess.kind==='quiz'){
      g.quizBest = g.quizBest || {};
      const bk = quizBestKey(sess.pool, sess.diff);
      sess.record = sess.score > (g.quizBest[bk]||0);
      if(sess.record) g.quizBest[bk] = sess.score;
      if(sess.score>=10000) gameUnlock('quiz5000');
      gems = Math.floor(sess.correct/2);
    } else {
      g.today.lessons = (g.today.lessons||0) + 1;
      if(sess.jumpUnit!==null){
        allPathNodes().forEach(n=>{ if(n.unit < sess.jumpUnit) pathDone()[n.key] = true; });
        gems = 15;
      } else {
        pathDone()[sess.nodeKey] = true;
        const node = allPathNodes().find(n=>n.key===sess.nodeKey);
        if(node && node.type==='trophy'){ gameUnlock('unit'); queueToast('📜', 'Certificado liberado!', `${node.subject.name}: veja em Certificados`); }
        gems = sess.wrong===0 ? 15 : 10;
      }
      g.lessonsDone = (g.lessonsDone||0) + 1;
    }
    sess.gems = gems;
    saveGame();
    if(gems) addGems(gems);
    replaceHistoryState();
    setTimeout(()=>launchConfetti(sess.wrong===0 || sess.record ? 180 : 100), 200);
    playTones([523,659,784,1047,1319], 0.11, 'triangle', 0.09);
  }
  gems = sess.gems||0;
  const isQuiz = sess.kind==='quiz';
  c.appendChild(h(`<div class="le-mascot">${mascotSVG('joy',130)}</div>`));
  c.appendChild(h(`<h2 class="le-title">${isQuiz ? (sess.record ? 'Novo recorde! 🏆' : 'Quiz concluído!') : sess.jumpUnit!==null ? 'Episódio liberado! ⏩' : sess.wrong===0 ? 'Fase perfeita! 🌟' : 'Fase concluída!'}</h2>`));
  if(isQuiz) c.appendChild(h(`<div class="le-bigscore">${sess.score.toLocaleString('pt-BR')} <small>pontos</small></div>`));
  c.appendChild(h(`
    <div class="le-stats">
      <div class="le-stat gold"><div class="k">TOTAL DE XP</div><div class="v">⚡ ${sess.xp||0}</div></div>
      <div class="le-stat green"><div class="k">${isQuiz?'ACERTOS':'PRECISÃO'}</div><div class="v">🎯 ${isQuiz? `${sess.correct}/${sess.needed}` : acc+'%'}</div></div>
      <div class="le-stat blue"><div class="k">TEMPO</div><div class="v">⏱ ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</div></div>
    </div>`));
  if(gems) c.appendChild(h(`<div class="le-gems">+${gems} 🪙 moedas</div>`));
  if(isQuiz){
    const poolName = (QUIZ_POOLS.find(x=>x[0]===(sess.pool||'all'))||[])[2] || 'Todos';
    c.appendChild(h(`<p class="le-sub">🏆 Recorde no ${({facil:'fácil',medio:'médio',dificil:'difícil'})[sess.diff]} · ${poolName}: <b>${(g.quizBest[quizBestKey(sess.pool, sess.diff)]||0).toLocaleString('pt-BR')}</b> pontos${sess.bestStreak>=2 ? ` · 🔥 maior sequência: ${sess.bestStreak}` : ''}</p>`));
    if(sess.log && sess.log.length){
      const rev = h(`<div class="quiz-review"><div class="qr-head"><b>Suas respostas</b><span>${sess.log.filter(x=>x.ok).length} de ${sess.log.length} certas</span></div></div>`);
      sess.log.forEach((x,i)=>{
        const row = h(`<div class="qr-row ${x.ok?'ok':'bad'}"><span class="qr-n">${x.ok?'✓':'✗'}</span><div class="qr-b"><div class="qr-s"></div><div class="qr-q"></div><div class="qr-a"></div></div><span class="qr-p">${x.ok ? '+'+x.pts.toLocaleString('pt-BR') : (x.picked===null ? '⏰' : '0')}</span></div>`);
        row.querySelector('.qr-s').textContent = `${i+1}. ${x.subj}`;
        row.querySelector('.qr-q').textContent = x.q || 'Conta armada / desenho';
        row.querySelector('.qr-a').textContent = x.ok ? `Resposta: ${x.ans} · ${String(x.secs).replace('.',',')}s` : `Certa: ${x.ans}${x.picked!==null ? ` · você marcou ${x.picked}` : ' · acabou o tempo'}`;
        rev.appendChild(row);
      });
      c.appendChild(rev);
    }
  }
  const foot = h(`<div class="lesson-footer static"></div>`);
  const cont = h(`<button class="show-btn">CONTINUAR</button>`);
  cont.onclick = ()=> go(isQuiz ? 'quizSetup' : 'path');
  foot.appendChild(cont);
  if(isQuiz){
    const again = h(`<button class="show-btn ghost">JOGAR DE NOVO</button>`);
    again.onclick = ()=> startQuiz(sess.diff, sess.pool);
    foot.appendChild(again);
  }
  c.appendChild(foot);
}

/* ---------- confirmação dentro do app (substitui o confirm() do navegador,
   que alguns celulares, apps instalados e navegadores embutidos bloqueiam) ---------- */
function showConfirm(opts){
  return new Promise(resolve=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg';
    bg.innerHTML = `<div class="gm-modal">
      <div class="big" style="font-size:52px">${opts.icon || '🤔'}</div>
      <h2></h2><p></p>
      <button type="button" class="show-btn ${opts.danger?'bad':''} gm-confirm-ok"></button>
      <button type="button" class="show-btn ghost gm-confirm-cancel" style="color:#fff;border-color:rgba(255,255,255,.3)"></button>
    </div>`;
    bg.querySelector('h2').textContent = opts.title || 'Tem certeza?';
    bg.querySelector('p').textContent = opts.message || '';
    bg.querySelector('.gm-confirm-ok').textContent = opts.ok || 'Sim';
    bg.querySelector('.gm-confirm-cancel').textContent = opts.cancel || 'Cancelar';
    const close = v=>{ bg.remove(); resolve(v); };
    bg.querySelector('.gm-confirm-ok').onclick = ()=> close(true);
    bg.querySelector('.gm-confirm-cancel').onclick = ()=> close(false);
    bg.addEventListener('click', e=>{ if(e.target===bg) close(false); });
    document.body.appendChild(bg);
  });
}

/* ---------- sem vidas ---------- */
function showNoHearts(onRefill){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  const gems = gemsNow();
  bg.innerHTML = `<div class="gm-modal">
    <div>${mascotSVG('sad',100)}</div>
    <h2 style="color:#FF4B4B">Sem vidas! 💔</h2>
    <p>Próxima vida em <b class="nh-t">${fmtMinSec(nextHeartIn())}</b>.<br>Enquanto isso, você pode praticar livremente em Exercícios, Relâmpago ou Quiz.</p>
    <button type="button" class="nh-refill" ${gems<HEART_REFILL_COST?'disabled':''}>Recarregar ❤️ por ${HEART_REFILL_COST} 🪙 (você tem ${gems})</button>
    <button type="button" class="nh-close" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Voltar</button>
  </div>`;
  const tick = setInterval(()=>{ if(!bg.isConnected) return clearInterval(tick); const t = bg.querySelector('.nh-t'); if(t) t.textContent = fmtMinSec(nextHeartIn()); }, 1000);
  bg.querySelector('.nh-refill').onclick = ()=>{
    if(refillHeartsWithGems()){ bg.remove(); if(onRefill) onRefill(); else render(); }
  };
  bg.querySelector('.nh-close').onclick = ()=>{ bg.remove(); if(onRefill) go('path'); };
  document.body.appendChild(bg);
}

/* ---------- barra de status (🔥 🪙 ❤️) ---------- */
function statusPills(){
  const hearts = heartsNow();
  const bar = h(`<div class="status-pills">
    <button type="button" class="sp fire ${gameStreakNow()?'':'off'}" aria-label="Ver ofensiva">🔥 ${gameStreakNow()}</button>
    <span class="sp gem">🪙 ${gemsNow()}</span>
    <button type="button" class="sp heart" aria-label="Vidas">❤️ ${hearts}${hearts<HEARTS_MAX?` <small>${fmtMinSec(nextHeartIn())}</small>`:''}</button>
  </div>`);
  bar.querySelector('.heart').onclick = ()=>{ if(heartsNow()<HEARTS_MAX) showNoHearts(); else showFloat('Vidas cheias ❤️'); };
  bar.querySelector('.fire').onclick = ()=> showStreakPanel();
  return bar;
}

/* ---------- home: continuar trilha + jogos ---------- */
function pathHero(){
  const all = allPathNodes(), cur = pathCurrentIndex();
  const n = all[Math.min(cur, all.length-1)];
  const color = unitStyle(n.unit);
  const finished = cur>=all.length;
  const el = h(`<div class="path-hero" style="${color}">
    <div class="ph-body">
      <div class="ph-k">${finished ? 'TEMPORADA COMPLETA' : `EPISÓDIO ${n.unit+1} · ${n.idx+1}/${PATH_NODES.length}`}</div>
      <h2>${finished ? 'Você zerou a trilha! 👑' : n.subject.name}</h2>
      <p>${finished ? 'Continue praticando pra ganhar XP.' : n.label}</p>
      ${finished ? '' : `<div class="ph-prog" aria-label="Fase ${n.idx+1} de ${PATH_NODES.length}">${PATH_NODES.map((_,i)=>`<i class="${i<n.idx?'on':i===n.idx?'cur':''}"></i>`).join('')}</div>`}
      <button class="show-btn light">${cur===0 ? '▶ COMEÇAR O SHOW' : '▶ CONTINUAR'}</button>
    </div>
    <div>${mascotSVG('joy', 86)}</div>
  </div>`);
  el.querySelector('button').onclick = ()=> go('path');
  return el;
}

/* ---------- tela da trilha ---------- */
/* Trilha: os episódios já concluídos ficam recolhidos (só o cartão), pra lista não ficar enorme.
   Tocar no cartão abre/fecha as fases. */
function pathOpenSet(){ state.pathOpen = state.pathOpen || {}; return state.pathOpen; }
/* Trilha em tabuleiro: cada episódio é um tabuleiro de losangos (casas em diagonal), as fases são
   ladrilhos 3D em zigue-zague encaixados nas casas, com símbolos de matemática enfeitando as casas vazias.
   No topo o Pi diz o que vem a seguir; embaixo, a lista de episódios e o botão "Próxima fase". */
const PATH_ZIG = [0, -1, 0, 1];             // posição de cada fase: centro, esquerda, centro, direita
/* objetos de escola desenhados (enfeitam as casas vazias do tabuleiro) */
const PATH_DECO = ['lapis', 'dado', 'calculadora', 'livros', 'regua', 'compasso', 'transferidor', 'abaco', 'globo', 'esquadro', 'cubo', 'borracha', 'caderno', 'apontador'];
let _decoSeq = 0;
/* o objeto vira uma imagem (data URI) feita uma vez só e reaproveitada: muito mais leve que desenhar o SVG toda vez */
const _decoCache = {};
function pathDecoURI(kind){
  if(!_decoCache[kind]) _decoCache[kind] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pathDecoSVG(kind).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  return _decoCache[kind];
}
function pathDecoSVG(kind){
  const id = 'dc' + (++_decoSeq);
  const shadow = `<ellipse cx="50" cy="90" rx="30" ry="6" fill="rgba(0,0,0,.35)"/>`;
  if(kind==='lapis') return `<svg viewBox="0 0 100 100"><defs>
      <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset=".35" stop-color="#FFD03D"/><stop offset=".36" stop-color="#F5B921"/><stop offset=".68" stop-color="#F5B921"/><stop offset=".69" stop-color="#D99A12"/><stop offset="1" stop-color="#C98A0C"/></linearGradient>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F7"/><stop offset=".5" stop-color="#B9C0CA"/><stop offset="1" stop-color="#8E96A3"/></linearGradient></defs>
    ${shadow}<g transform="rotate(-38 50 52)">
      <rect x="8" y="43" width="11" height="17" rx="5" fill="#FF8FA8"/><rect x="8" y="43" width="11" height="6" rx="3" fill="#FFB3C4"/>
      <rect x="17" y="42" width="9" height="19" rx="1.5" fill="url(#${id}b)"/><path d="M19.5 42v19M23 42v19" stroke="#8E96A3" stroke-width="1"/>
      <rect x="26" y="42" width="47" height="19" fill="url(#${id}a)"/>
      <path d="M73 42 L90 51.5 L73 61 Z" fill="#F4CFA0"/><path d="M73 42 L90 51.5 L73 47 Z" fill="#FBE0BC"/>
      <path d="M85 48.7 L90 51.5 L85 54.3 Z" fill="#3B3F46"/></g></svg>`;
  if(kind==='regua') return `<svg viewBox="0 0 100 100">${shadow}<g transform="rotate(-24 50 54)">
      <rect x="6" y="50" width="88" height="20" rx="3" fill="#C9962B"/>
      <rect x="6" y="44" width="88" height="20" rx="3" fill="#F3C969"/><rect x="6" y="44" width="88" height="5" rx="2.5" fill="#FADB8C"/>
      ${Array.from({length:17},(_,i)=>`<path d="M${11+i*5} 44v${i%2?4:7}" stroke="#7A5A16" stroke-width="1.2"/>`).join('')}
      <text x="12" y="61" font-size="6" font-family="Inter,Arial" font-weight="700" fill="#7A5A16">0</text><text x="58" y="61" font-size="6" font-family="Inter,Arial" font-weight="700" fill="#7A5A16">10</text></g></svg>`;
  if(kind==='calculadora') return `<svg viewBox="0 0 100 100">${shadow}
      <rect x="27" y="14" width="48" height="74" rx="9" fill="#262A33"/>
      <rect x="25" y="10" width="48" height="74" rx="9" fill="#3E4553"/><rect x="25" y="10" width="48" height="10" rx="5" fill="#4C5464"/>
      <rect x="31" y="17" width="36" height="15" rx="3" fill="#BFEFD0"/><text x="64" y="28.5" text-anchor="end" font-size="10" font-family="Inter,Arial" font-weight="800" fill="#1F4D31">3,14</text>
      ${[0,1,2,3].map(r=>[0,1,2,3].map(cI=>`<rect x="${31+cI*9.3}" y="${38+r*10.5}" width="7.4" height="8" rx="2" fill="${cI===3 ? (r===3?'#2BC6A8':'#FF9F43') : '#DDE1E7'}"/>`).join('')).join('')}</svg>`;
  if(kind==='transferidor') return `<svg viewBox="0 0 100 100">${shadow}
      <path d="M12 74 A38 38 0 0 1 88 74 Z" fill="#2F6FD6" opacity=".9"/>
      <path d="M12 70 A38 38 0 0 1 88 70 Z" fill="rgba(110,175,255,.75)" stroke="#CFE4FF" stroke-width="1.5"/>
      <path d="M26 70 A24 24 0 0 1 74 70" fill="none" stroke="#E8F2FF" stroke-width="1.2" opacity=".9"/>
      ${Array.from({length:13},(_,i)=>{ const a = Math.PI - i*Math.PI/12, x1 = 50+38*Math.cos(a), y1 = 70-38*Math.sin(a), x2 = 50+(i%3?33:29)*Math.cos(a), y2 = 70-(i%3?33:29)*Math.sin(a); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#F4F9FF" stroke-width="1.3"/>`; }).join('')}
      <circle cx="50" cy="70" r="3" fill="#F4F9FF"/><path d="M50 70 L71 49" stroke="#FF5C7A" stroke-width="2" stroke-linecap="round"/></svg>`;
  if(kind==='dado'){
    const face = (A,B,D,pts,col)=> pts.map(([u,v])=>{ const x = A[0]+u*(B[0]-A[0])+v*(D[0]-A[0]), y = A[1]+u*(B[1]-A[1])+v*(D[1]-A[1]); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.3" fill="${col}"/>`; }).join('');
    return `<svg viewBox="0 0 100 100">${shadow}
      <g stroke-linejoin="round" stroke-width="4">
      <polygon points="50,16 80,31 50,46 20,31" fill="#FFFFFF" stroke="#FFFFFF"/>
      <polygon points="20,31 50,46 50,82 20,67" fill="#E1E5EB" stroke="#E1E5EB"/>
      <polygon points="50,46 80,31 80,67 50,82" fill="#C2C8D1" stroke="#C2C8D1"/></g>
      <circle cx="50" cy="31" r="4.2" fill="#E5484D"/>
      ${face([20,31],[50,46],[20,67],[[.28,.25],[.72,.75]],'#3A3F48')}
      ${face([50,46],[80,31],[50,82],[[.25,.25],[.5,.5],[.75,.75]],'#3A3F48')}</svg>`;
  }
  if(kind==='compasso') return `<svg viewBox="0 0 100 100">${shadow}
      <path d="M50 22 L30 84" stroke="#9AA3AF" stroke-width="5" stroke-linecap="round"/><path d="M50 22 L30 84" stroke="#DDE2E8" stroke-width="2" stroke-linecap="round"/>
      <path d="M50 22 L70 80" stroke="#9AA3AF" stroke-width="5" stroke-linecap="round"/><path d="M50 22 L70 80" stroke="#DDE2E8" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 84 L28 90" stroke="#555C66" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="66" y="72" width="8" height="12" rx="2" transform="rotate(-19 70 78)" fill="#F5B921"/><path d="M71 85 L72 91" stroke="#3B3F46" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M38 58 Q50 54 62 58" stroke="#7E8794" stroke-width="2.5" fill="none"/>
      <circle cx="50" cy="20" r="7" fill="#E5484D"/><circle cx="50" cy="20" r="3" fill="#FFB3B6"/><rect x="47.5" y="5" width="5" height="10" rx="2" fill="#B8323A"/></svg>`;
  if(kind==='livros') return `<svg viewBox="0 0 100 100">${shadow}
      <rect x="16" y="66" width="68" height="18" rx="3" fill="#2F6FD6"/><rect x="20" y="69" width="62" height="12" fill="#F4F1E8"/><rect x="16" y="66" width="8" height="18" rx="2" fill="#2457AE"/>
      <rect x="22" y="48" width="58" height="18" rx="3" fill="#E5484D"/><rect x="26" y="51" width="52" height="12" fill="#F4F1E8"/><rect x="22" y="48" width="8" height="18" rx="2" fill="#B8323A"/>
      <path d="M40 57h28" stroke="#E5484D" stroke-width="1.5" opacity=".5"/>
      <g transform="rotate(-8 50 40)"><rect x="18" y="31" width="60" height="17" rx="3" fill="#2BC6A8"/><rect x="22" y="34" width="54" height="11" fill="#F4F1E8"/><rect x="18" y="31" width="8" height="17" rx="2" fill="#178C78"/>
      <text x="52" y="43" text-anchor="middle" font-size="8" font-family="Inter,Arial" font-weight="800" fill="#178C78">π</text></g></svg>`;
  if(kind==='abaco'){
    const cols = ['#E5484D','#F5B921','#2BC6A8','#4C7DFF'];
    return `<svg viewBox="0 0 100 100">${shadow}
      <rect x="14" y="18" width="72" height="66" rx="6" fill="#A06A32"/><rect x="21" y="25" width="58" height="52" rx="2" fill="#2A2D33"/>
      ${[0,1,2,3].map(r=>`<path d="M21 ${33+r*12.5}h58" stroke="#C9CED6" stroke-width="1.6"/>`+[0,1,2,3,4].map(b=>{ const off = (r*2+b)%3===0 ? 22 : 0; return `<ellipse cx="${27+b*7+off}" cy="${33+r*12.5}" rx="3.6" ry="4.6" fill="${cols[r]}"/>`; }).join('')).join('')}
      <rect x="14" y="18" width="72" height="5" rx="2" fill="#C08548"/></svg>`;
  }
  if(kind==='globo') return `<svg viewBox="0 0 100 100">${shadow}
      <path d="M38 86 h24 l-4 -6 h-16 Z" fill="#7A5418"/><rect x="47.5" y="68" width="5" height="13" fill="#B07800"/>
      <path d="M22 44 A28 28 0 0 0 66 70" fill="none" stroke="#C9962B" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="48" cy="42" r="24" fill="#3C8DE8"/>
      <path d="M36 26 q8 -4 12 2 q-2 6 4 8 q6 2 2 10 q-6 4 -10 -2 q-6 -2 -10 -8 Z M54 50 q6 -2 10 4 q-2 8 -8 10 q-4 -6 -2 -14 Z" fill="#45C46A"/>
      <circle cx="40" cy="34" r="9" fill="rgba(255,255,255,.18)"/></svg>`;
  if(kind==='cubo'){
    const C = ['#E5484D','#F5B921','#2BC6A8','#4C7DFF','#FF9F43','#FFFFFF'];
    let t='';
    const quad=(o,u,v,i,j,col)=>{ const p=(a,b)=>[o[0]+u[0]*a+v[0]*b, o[1]+u[1]*a+v[1]*b]; const pts=[p(i+.08,j+.08),p(i+.92,j+.08),p(i+.92,j+.92),p(i+.08,j+.92)]; return `<polygon points="${pts.map(q=>q.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="${col}"/>`; };
    for(let i=0;i<3;i++) for(let j=0;j<3;j++){
      t += quad([50,14],[10,5],[-10,5],i,j,C[(i+j*2)%6]);
      t += quad([20,29],[10,5],[0,12],i,j,C[(i*2+j+1)%6]);
      t += quad([50,44],[10,-5],[0,12],i,j,C[(i+j+3)%6]);
    }
    return `<svg viewBox="0 0 100 100">${shadow}<polygon points="50,12 82,28 82,66 50,82 18,66 18,28" fill="#1C1F24"/>${t}</svg>`;
  }
  if(kind==='borracha') return `<svg viewBox="0 0 100 100">${shadow}<g transform="rotate(-14 50 60)">
      <polygon points="18,52 62,52 78,64 34,64" fill="#FFB3C4"/>
      <polygon points="18,52 34,64 34,78 18,66" fill="#E87C96"/>
      <polygon points="34,64 78,64 78,78 34,78" fill="#FF8FA8"/>
      <polygon points="44,64 64,64 64,78 44,78" fill="#4C7DFF"/><polygon points="38,52 58,52 64,64 44,64" fill="#7DA2FF"/></g></svg>`;
  if(kind==='caderno') return `<svg viewBox="0 0 100 100">${shadow}<g transform="rotate(8 50 50)">
      <rect x="26" y="16" width="52" height="68" rx="5" fill="#B23FE0"/><rect x="30" y="16" width="48" height="68" rx="5" fill="#C866F0"/>
      ${[0,1,2,3,4,5,6].map(i=>`<circle cx="30" cy="${23+i*9}" r="3.2" fill="none" stroke="#DDE2E8" stroke-width="2"/>`).join('')}
      <rect x="40" y="28" width="30" height="16" rx="3" fill="#F4F1E8"/><path d="M44 34h22M44 39h15" stroke="#B23FE0" stroke-width="2" stroke-linecap="round"/>
      <text x="55" y="68" text-anchor="middle" font-size="13" font-family="Inter,Arial" font-weight="800" fill="#F4E9FF">x²</text></g></svg>`;
  if(kind==='apontador') return `<svg viewBox="0 0 100 100">${shadow}
      <path d="M26 46 h40 l8 10 v22 a4 4 0 0 1 -4 4 h-44 a4 4 0 0 1 -4 -4 v-28 a4 4 0 0 1 4 -4 Z" fill="#1F9E85"/>
      <path d="M22 50 a4 4 0 0 1 4 -4 h40 l8 10 h-48 a4 4 0 0 1 -4 -4 Z" fill="#2BC6A8"/>
      <circle cx="46" cy="68" r="8" fill="#14695A"/><circle cx="46" cy="68" r="4.5" fill="#0B3E35"/>
      <rect x="54" y="60" width="16" height="5" rx="1" fill="#C9CED6"/><circle cx="66" cy="62.5" r="1.4" fill="#7E8794"/></svg>`;
  // esquadro
  return `<svg viewBox="0 0 100 100">${shadow}
      <path d="M22 86 L22 18 L88 86 Z M31 77 L31 46 L61 77 Z" fill="#1A8F77" fill-rule="evenodd"/>
      <path d="M20 82 L20 14 L86 82 Z M29 73 L29 42 L59 73 Z" fill="rgba(70,215,180,.82)" fill-rule="evenodd" stroke="#C9FFF0" stroke-width="1.4"/>
      ${Array.from({length:8},(_,i)=>`<path d="M20 ${20+i*8}h${i%2?4:6}" stroke="#E9FFF8" stroke-width="1.3"/>`).join('')}</svg>`;
}
function pathCoachText(n){
  if(!n) return 'Você completou todos os episódios! Você é a estrela do show! 🌟';
  const nome = n.subject.name;
  if(n.type==='chest') return `Abra o prêmio surpresa do episódio de ${nome}! 🎁`;
  if(n.type==='trophy') return `Hora da Grande final de ${nome}. Vença e ganhe o certificado! 🎤`;
  return `Aprenda ${nome.charAt(0).toLowerCase()+nome.slice(1)}: ${n.label.replace(' · ', ', ').toLowerCase()}.`;
}
function pathScreen(){
  const wrap = document.createElement('div');
  const bar = topbar('Trilha', true, ()=>go('home'));
  bar.appendChild(statusPills());
  bar.classList.add('sticky-top');
  wrap.appendChild(bar);
  const c = h(`<div class="content path path-iso"></div>`);
  wrap.appendChild(c);
  const done = pathDone();
  const all = allPathNodes();
  const cur = pathCurrentIndex();
  const open = pathOpenSet();
  const doneUnits = SUBJECTS.filter((s,u)=> all.filter(n=>n.unit===u).every(n=>done[n.key])).length;
  const doneNodes = all.filter(n=>done[n.key]).length;
  const curNode = all[cur];
  const pct = Math.round(doneNodes/all.length*100);
  // o Pi diz o que vem a seguir
  const coach = h(`<div class="pi-coach"><div class="pi-coach-av">${mascotSVG(curNode?'happy':'joy', 70)}</div><div class="pi-bubble"></div></div>`);
  coach.querySelector('.pi-bubble').textContent = pathCoachText(curNode);
  c.appendChild(coach);
  const sum = h(`<div class="path-sum">
      <div class="ps-ring" style="--p:${pct}"><b>${pct}%</b></div>
      <div class="ps-txt"><b>${doneUnits} de ${SUBJECTS.length} episódios</b><small>${curNode ? `Agora: Episódio ${curNode.unit+1} · ${escHTML(curNode.subject.name)}` : 'Trilha completa! 🌟'}</small></div>
    </div>`);
  c.appendChild(sum);
  let currentEl = null;
  const banners = [];
  SUBJECTS.forEach((s,u)=>{
    const color = unitStyle(u);
    const unitNodes = all.filter(n=>n.unit===u);
    const unitLocked = all.indexOf(unitNodes[0]) > cur && !unitNodes.some(n=>done[n.key]);
    const unitDone = unitNodes.every(n=>done[n.key]);
    const isCurUnit = curNode && curNode.unit===u;
    const nDone = unitNodes.filter(n=>done[n.key]).length;
    const collapsed = unitDone && !open[s.id];
    const grp = subjectGroupOf(s.id);
    if(grp && grp.ids[0]===s.id){
      const lv = SUBJECT_LEVELS.find(l=>l.id===grp.level);
      c.appendChild(h(`<div class="path-group"><small>${lv.ico} ${lv.name}</small><b>${grp.name}</b></div>`));
    }
    const dots = unitNodes.map(n=>`<i class="${done[n.key]?'on':''} ${n.type}"></i>`).join('');
    const banner = h(`<div class="unit-banner ${unitLocked?'locked':''} ${unitDone?'done':''} ${isCurUnit?'cur':''} ${collapsed?'collapsed':''}" style="${color}">
      <span class="u-num">${unitDone ? '✓' : u+1}</span>
      <div class="u-body"><div class="u-k">EPISÓDIO ${u+1}${unitLocked?' · 🔒':''}${unitDone?' · CONCLUÍDO':''}${isCurUnit?' · VOCÊ ESTÁ AQUI':''}</div><div class="u-n">${s.sym} ${escHTML(s.name)}</div>
        <div class="u-prog"><span class="u-dots">${dots}</span><small>${nDone}/${unitNodes.length} fases${BNCC_ANO[s.id] ? ` · ${BNCC_ANO[s.id]}` : ''}</small></div></div>
      <button type="button" class="u-guide" title="Ver conteúdo" aria-label="Ver conteúdo de ${escHTML(s.name)}">📖</button></div>`);
    banners[u] = banner;
    banner.querySelector('.u-guide').onclick = e=>{ e.stopPropagation(); go('subjectDetail', {subjectId:s.id}); };
    if(unitDone){
      banner.classList.add('tap');
      banner.appendChild(h(`<span class="u-toggle">${collapsed ? 'Rever fases ▾' : 'Recolher ▴'}</span>`));
      banner.onclick = ()=>{ open[s.id] = !open[s.id]; render(); };
    }
    if(unitLocked){
      const jump = h(`<button type="button" class="u-jump">Já sei esse assunto · Pular pra cá ⏩</button>`);
      jump.onclick = e=>{
        e.stopPropagation();
        showConfirm({icon:'⏩', title:'Teste de nivelamento', message:`Acerte 6 questões de ${s.name} errando no máximo 2 para liberar este episódio. Vamos?`, ok:'Fazer o teste', cancel:'Agora não'})
          .then(ok=>{ if(ok) startPathLesson(unitNodes[0], true); });
      };
      banner.appendChild(jump);
    }
    c.appendChild(banner);
    if(collapsed) return;
    // episódios bloqueados mais à frente aparecem só com a faixa: desenhar os 58 tabuleiros de uma vez travava o celular
    if(unitLocked && (!curNode || u > curNode.unit + 1)) return;
    // tabuleiro do episódio: as fases ficam nas casas, uma por linha, em zigue-zague
    const col = h(`<div class="path-board ${unitLocked?'locked':''}" style="${color}"></div>`);
    unitNodes.forEach((n,k)=>{
      const gi = all.indexOf(n);
      const isDone = !!done[n.key], isCur = gi===cur, locked = gi>cur && !isDone;
      const ico = locked ? '🔒' : n.type==='chest' ? (isDone?'✨':'🎁') : n.type==='trophy' ? '🎤' : escHTML(n.subject.sym);
      const z = PATH_ZIG[k % PATH_ZIG.length];
      const wrapN = h(`<div class="pnode-wrap ${isCur?'is-cur':''}" style="--z:${z}"></div>`);
      const btn = h(`<button type="button" class="pnode ${n.type} ${isDone?'done':''} ${isCur?'cur':''} ${locked?'locked':''}" aria-label="${n.label}${isDone?', concluída':locked?', bloqueada':''}">
          <span class="pd-side"></span><span class="pd-top"></span><span class="pd-ico">${ico}</span>${isDone && n.type!=='chest' ? '<span class="pd-ok">✓</span>' : ''}</button>`);
      wrapN.appendChild(btn);
      if(isCur) wrapN.appendChild(h(`<button type="button" class="pnode-play">${n.type==='chest'?'🎁 ABRIR':'▶ JOGAR'}</button>`));
      // enfeite: um objeto de escola desenhado na casa vazia do outro lado
      if(z !== 0) wrapN.appendChild(h(`<img class="pd-deco" alt="" aria-hidden="true" decoding="async" src="${pathDecoURI(PATH_DECO[(u*5 + (k>2?3:0)) % PATH_DECO.length])}">`));
      btn.onclick = ()=>{
        if(locked){ showFloat('🔒 Complete as fases anteriores', true); return; }
        if(n.type==='chest') openChest(n, isDone);
        else nodeSheet(n, color, isDone);
      };
      const play = wrapN.querySelector('.pnode-play'); if(play) play.onclick = ()=> btn.onclick();
      col.appendChild(wrapN);
      if(isCur) currentEl = wrapN;
    });
    c.appendChild(col);
  });
  // barra de baixo: lista dos episódios e "Próxima fase"
  if(curNode){
    const cta = h(`<div class="path-cta"><button type="button" class="pc-list" aria-label="Lista de episódios"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/><path d="M9.5 6h10M9.5 12h10M9.5 18h10"/></svg></button>
      <button type="button" class="pc-next">${curNode.type==='chest' ? 'Abrir prêmio' : curNode.type==='trophy' ? 'Grande final' : 'Próxima fase'}</button></div>`);
    cta.querySelector('.pc-next').onclick = ()=>{ const b = currentEl && currentEl.querySelector('.pnode'); if(b) b.onclick(); };
    cta.querySelector('.pc-list').onclick = ()=> pathListSheet(all, done, cur, u=>{ const el = banners[u]; if(el) el.scrollIntoView({block:'start', behavior:'smooth'}); });
    wrap.appendChild(cta);
  }
  // seta que leva até a fase atual quando ela sai da tela (aponta pra cima ou pra baixo)
  if(currentEl){
    const fab = h(`<button type="button" class="path-fab" hidden aria-label="Ir para a fase atual"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>`);
    const goCur = ()=>{ try{ currentEl.scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){} };
    fab.onclick = goCur;
    wrap.appendChild(fab);
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver(es=>{ es.forEach(e=>{
        fab.hidden = e.isIntersecting;
        fab.classList.toggle('down', !e.isIntersecting && e.boundingClientRect.top > 0);
      }); });
      io.observe(currentEl);
    }
    setTimeout(goCur, 120);
  }
  return wrap;
}
/* lista dos episódios (botão ao lado de "Próxima fase") */
function pathListSheet(all, done, cur, onPick){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="node-sheet path-list"><h3>Episódios da Trilha</h3><div class="pl-items"></div></div>`;
  const box = bg.querySelector('.pl-items');
  SUBJECTS.forEach((s,u)=>{
    const ns = all.filter(n=>n.unit===u), nd = ns.filter(n=>done[n.key]).length;
    const locked = all.indexOf(ns[0]) > cur && !nd, isCur = all[cur] && all[cur].unit===u;
    const it = h(`<button type="button" class="pl-it ${locked?'locked':''} ${isCur?'cur':''}" style="${unitStyle(u)}"><span class="pl-n">${nd===ns.length ? '✓' : u+1}</span><span class="pl-t"><b></b><small>${locked ? '🔒 Bloqueado' : `${nd}/${ns.length} fases`}${isCur ? ' · você está aqui' : ''}</small></span></button>`);
    it.querySelector('b').textContent = `${s.sym} ${s.name}`;
    it.onclick = ()=>{ bg.remove(); onPick(u); };
    box.appendChild(it);
  });
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
  const c = box.querySelector('.pl-it.cur'); if(c) c.scrollIntoView({block:'center'});
}
function nodeSheet(n, color, isDone){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  const q = n.type==='trophy' ? 8 : n.n;
  const diffName = n.type==='trophy' ? 'Misturada' : ({facil:'Fácil', medio:'Médio', dificil:'Difícil'})[n.diff];
  const unitNodes = allPathNodes().filter(x=>x.unit===n.unit), done = pathDone();
  bg.innerHTML = `<div class="node-sheet" style="${color}">
    <div class="ns-k">Episódio ${n.unit+1} · ${n.subject.sym} ${escHTML(n.subject.name)}</div>
    <h3>${n.type==='trophy' ? '🎤 ' : ''}${n.label}</h3>
    <div class="ns-steps">${unitNodes.map(x=>`<i class="${done[x.key]?'on':''} ${x.key===n.key?'me':''}"></i>`).join('')}</div>
    <div class="ns-facts">
      <span>❓ ${q} perguntas</span><span>📊 ${diffName}</span><span>⭐ +XP</span><span>🪙 ${n.type==='trophy' ? 'certificado' : 'moedas'}</span>
    </div>
    <p>${isDone ? 'Você já completou esta fase. Praticar de novo dá mais XP!' : n.type==='trophy' ? 'A Grande final mistura tudo do episódio. Vencendo, você libera o certificado! 📜' : 'Errou? Tente de novo até acertar, e peça uma dica se precisar. 💡'}</p>
    <button class="show-btn light ns-go">${isDone?'PRATICAR DE NOVO':'COMEÇAR'} ▶</button>
    <button type="button" class="ns-learn">📖 Rever a explicação de ${escHTML(n.subject.name)}</button>
  </div>`;
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  bg.querySelector('.ns-go').onclick = ()=>{ bg.remove(); startPathLesson(n, false); };
  bg.querySelector('.ns-learn').onclick = ()=>{ bg.remove(); go('subjectDetail', {subjectId:n.subject.id}); };
  document.body.appendChild(bg);
}
function openChest(n, isDone){
  if(isDone){ showFloat('✨ Prêmio já aberto!'); return; }
  const gems = randInt(20,40);
  pathDone()[n.key] = true;
  const g = loadGame();
  g.chests = (g.chests||0) + 1;
  if(g.chests>=5) gameUnlock('chests');
  saveGame(); addGems(gems);
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg';
  bg.innerHTML = `<div class="gm-modal"><div class="big chest-open">🎁</div><h2>Prêmio surpresa!</h2><p>Você ganhou <b style="color:#FFD45C">${gems} 🪙 moedas</b></p><button type="button">Pegar!</button></div>`;
  bg.querySelector('button').onclick = ()=>{ bg.remove(); render(); };
  document.body.appendChild(bg);
  playTones([392,523,659,784,1047], 0.09, 'triangle', 0.1);
  launchConfetti(120);
}

/* ---------- escolha do quiz ---------- */
function quizSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎤 Quiz do Show', true, ()=>go('arena')));
  const c = h(`<div class="content quiz-setup"></div>`);
  const g = loadGame(); const best = g.quizBest || {};
  let pool = 'all';
  try{ pool = localStorage.getItem('mathstudy-quiz-pool') || 'all'; }catch(e){}
  if(!QUIZ_POOLS.some(x=>x[0]===pool)) pool = 'all';
  const top = Math.max(0, ...Object.values(best).map(Number).filter(n=>!isNaN(n)));
  c.appendChild(h(`<div class="quiz-hero"><span class="beam l"></span><span class="beam r"></span>
      <div class="qh-row"><div class="mic">🎤</div><div class="qh-best"><small>Seu recorde</small><b>${top.toLocaleString('pt-BR')}</b></div></div>
      <h2>Quiz do Show</h2>
      <p>${QUIZ_TOTAL} perguntas, <b>${QUIZ_SECONDS}s</b> cada. Quanto mais rápido acertar, mais pontos! 🏅</p></div>`));
  const poolSec = h(`<div class="qs-sec"><div class="qs-lbl">Assuntos</div><div class="qs-pools"></div></div>`);
  const levels = h(`<div class="qs-sec"><div class="qs-lbl">Escolha a dificuldade pra começar</div><div class="qs-levels"></div></div>`);
  function paintLevels(){
    const box = levels.querySelector('.qs-levels'); box.innerHTML = '';
    [['facil','Fácil','🟢','Contas pra aquecer'],['medio','Médio','🟡','O desafio certo'],['dificil','Difícil','🔴','Pra quem é fera']].forEach(([id,label,dot,desc])=>{
      const b = h(`<button type="button" class="quiz-level ql-${id}"><span class="ql-dot">${dot}</span><span class="ql-t"><b>${label}</b><small>${desc}</small></span><span class="ql-b">🏆 ${(best[quizBestKey(pool,id)]||0).toLocaleString('pt-BR')}</span><span class="ql-go">▶</span></button>`);
      b.onclick = ()=> startQuiz(id, pool);
      box.appendChild(b);
    });
  }
  QUIZ_POOLS.forEach(([id,ico,label])=>{
    const b = h(`<button type="button" class="qs-pool ${id===pool?'on':''}"><span>${ico}</span>${label}</button>`);
    b.onclick = ()=>{ pool = id; try{ localStorage.setItem('mathstudy-quiz-pool', id); }catch(e){} poolSec.querySelectorAll('.qs-pool').forEach(x=>x.classList.toggle('on', x===b)); paintLevels(); };
    poolSec.querySelector('.qs-pools').appendChild(b);
  });
  c.appendChild(poolSec);
  paintLevels();
  c.appendChild(levels);
  c.appendChild(h(`<div class="qs-sec"><div class="qs-lbl">Como funciona</div><div class="qs-rules">
      <div><span>⚡</span><p><b>Até 1.000 pontos</b> por acerto: quanto mais rápido, mais.</p></div>
      <div><span>🔥</span><p><b>Acertos seguidos</b> dão até +500 de bônus.</p></div>
      <div><span>🆘</span><p><b>3 ajudas</b> por partida: ${QUIZ_HELPS.map(x=>`${x[1]} ${x[2]}`).join(', ')}.</p></div>
      <div><span>📋</span><p>No fim você <b>revê todas as respostas</b>.</p></div>
    </div></div>`));
  wrap.appendChild(c);
  return wrap;
}
