/* =========================================================
   TELAS: RESOLVER QUESTÃO E CALCULADORA
   ========================================================= */
/* ---------------- RESOLVER QUESTÃO ---------------- */
const SOLVE_EXAMPLES = [
  ['Conta', '(12 + 8) × 3'], ['Equação 1º grau', '3(x + 2) = 18'], ['Equação 2º grau', 'x² − 5x + 6 = 0'],
  ['Porcentagem', '25% de 300'], ['Frações', '1/2 + 1/3'], ['Fração de', '2/3 de 120'], ['Regra de três', '3/6 = 5/x'],
  ['MMC', 'mmc de 12 e 18'], ['MDC', 'mdc de 24 e 36'], ['Média', 'média de 7, 8 e 9'], ['Raiz', 'raiz de 144'],
  ['Potência', '2^10'], ['Fatorial', '5!'], ['Sistema', 'x + y = 10, x − y = 2'], ['Função', 'f(x) = 2x + 1, f(3)'],
];
const SOLVE_KEYS = ['x','²','√','(',')','×','÷','=','%','/'];
function solveRecentKey(){ return `mathstudy-solve-recent:${currentUserId()}`; }
function solveRecent(){ try{ return JSON.parse(localStorage.getItem(solveRecentKey())||'[]'); }catch(e){ return []; } }
function addSolveRecent(q){ try{ const l = solveRecent().filter(x=>x!==q); l.unshift(q); localStorage.setItem(solveRecentKey(), JSON.stringify(l.slice(0,6))); }catch(e){} }

function solveScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Resolver questão', true, ()=>go('home')));
  const c = h(`<div class="content solve-wrap"></div>`);
  const card = h(`<div class="solve-input-card">
      <div class="solve-head"><label for="solveInput">✍️ Digite a conta, equação ou problema</label><button type="button" class="solve-clear" hidden>Limpar</button></div>
      <textarea id="solveInput" rows="2" placeholder="Ex.: 2x + 5 = 15" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
      <div class="solve-keys">${SOLVE_KEYS.map(k=>`<button type="button" class="solve-key" data-k="${k}">${k}</button>`).join('')}</div>
      <button class="solve-btn">Resolver ▶</button>
    </div>`);
  const input = card.querySelector('#solveInput'), clear = card.querySelector('.solve-clear');
  const syncClear = ()=>{ clear.hidden = !input.value; };
  input.addEventListener('input', syncClear);
  clear.onclick = ()=>{ input.value = ''; syncClear(); result.innerHTML = ''; input.focus(); };
  card.querySelectorAll('.solve-key').forEach(b=> b.onclick = ()=>{
    const k = b.dataset.k, a = input.selectionStart ?? input.value.length, z = input.selectionEnd ?? a;
    const ins = (k==='=' ? ' = ' : k);
    input.value = input.value.slice(0,a) + ins + input.value.slice(z);
    input.focus(); input.selectionStart = input.selectionEnd = a + ins.length; syncClear();
  });
  // Enter resolve; Shift+Enter pula linha (pra sistemas)
  input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); solve(); } });
  card.querySelector('.solve-btn').onclick = ()=> solve();
  c.appendChild(card);

  const picks = h(`<div class="solve-picks"></div>`);
  function paintPicks(){
    picks.innerHTML = '';
    const rec = solveRecent();
    if(rec.length){
      picks.appendChild(h(`<div class="solve-sub">🕘 Recentes</div>`));
      const row = h(`<div class="solve-chips"></div>`);
      rec.forEach(q=>{ const b = h(`<button type="button" class="solve-chip recent"></button>`); b.textContent = q; b.onclick = ()=>{ input.value = q; syncClear(); solve(); }; row.appendChild(b); });
      picks.appendChild(row);
    }
    picks.appendChild(h(`<div class="solve-sub">✨ Exemplos — toque pra experimentar</div>`));
    const row = h(`<div class="solve-chips ex"></div>`);
    SOLVE_EXAMPLES.forEach(([cat,q])=>{
      const b = h(`<button type="button" class="solve-chip"><small></small><span></span></button>`);
      b.querySelector('small').textContent = cat; b.querySelector('span').textContent = q;
      b.onclick = ()=>{ input.value = q; syncClear(); solve(); };
      row.appendChild(b);
    });
    picks.appendChild(row);
  }
  paintPicks();
  c.appendChild(picks);

  const result = h(`<div id="solveResult"></div>`);
  c.appendChild(result);

  function solve(){
    const val = input.value.trim();
    result.innerHTML = '';
    if(!val){
      result.appendChild(h(`<div class="unrecognized">✏️ Digite uma conta ou equação primeiro, ou toque num dos exemplos.</div>`));
      input.focus(); return;
    }
    let r = null;
    try{ r = solveQuestion(val); }catch(e){ r = null; }
    if(!r){
      const box = h(`<div class="solve-unknown"><div class="t">🤔 Não consegui entender essa questão</div>
        <p>Tente escrever só a conta, sem palavras a mais. Eu sei resolver:</p><div class="solve-chips wrapc"></div></div>`);
      const row = box.querySelector('.solve-chips');
      SOLVE_EXAMPLES.forEach(([cat,q])=>{ const b = h(`<button type="button" class="solve-chip mini"></button>`); b.textContent = cat; b.title = q; b.onclick = ()=>{ input.value = q; syncClear(); solve(); }; row.appendChild(b); });
      result.appendChild(box);
      result.scrollIntoView({behavior:'smooth', block:'start'});
      return;
    }
    addSolveRecent(val);
    result.appendChild(h(`<div class="solve-answer">
        <div class="sa-top"><span class="sa-kind">${escHTML(r.kind||'Resolvido')}</span><span class="sa-q mono">${escHTML(val)}</span></div>
        <div class="sa-lbl">Resposta</div>
        <div class="sa-val mono">${r.final}</div>
      </div>`));
    const stepsSec = h(`<div class="result-section"><div class="sec-label"><span class="ico">🪜</span>Passo a passo</div><div class="result-card solve-steps"><p class="how">${r.howTo}</p></div></div>`);
    const stepsCard = stepsSec.querySelector('.result-card');
    if(r.visual) stepsCard.appendChild(h(`<div class="solve-visual">${r.visual}</div>`));
    const list = h(`<ol class="step-list"></ol>`);
    r.steps.forEach(st=> list.appendChild(h(`<li class="step-item"><span class="txt">${st}</span></li>`)));
    stepsCard.appendChild(list);
    result.appendChild(stepsSec);
    result.appendChild(h(`<div class="solve-tip"><span class="ico">💡</span><div><b>Dica</b><p>${r.simple}</p></div></div>`));
    const practice = solvePracticeCard(val);
    if(practice) result.appendChild(practice);
    const gs = loadGame(); gs.solves = (gs.solves||0) + 1; gameCheckAchievements(); saveGame();
    paintPicks();
    requestAnimationFrame(()=> result.scrollIntoView({behavior:'smooth', block:'start'}));
  }
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- CALCULADORA ----------------
   A conta inteira fica no visor, com parênteses e a ordem certa das operações
   (primeiro potência, depois × e ÷, depois + e −). O resultado aparece enquanto
   você digita; o "=" confirma e guarda no histórico. Funciona também com o
   teclado do computador. */
const CALC_FUNCS = ['sin(','cos(','tan(','ln(','log(','√('];
const CALC_HIST_MAX = 30;
function calcHistKey(){ return `mathstudy-calc-hist:${currentUserId()}`; }
function calcHistory(){ try{ return JSON.parse(localStorage.getItem(calcHistKey())||'[]'); }catch(e){ return []; } }
function saveCalcHistory(list){ try{ localStorage.setItem(calcHistKey(), JSON.stringify(list.slice(0, CALC_HIST_MAX))); }catch(e){} }

/* número → texto do visor (vírgula decimal, até 12 algarismos, sem erro de 0,1+0,2) */
function calcNum(x){
  if(!isFinite(x)) return 'Erro';
  let r = Number(x.toPrecision(12));
  if(Object.is(r,-0)) r = 0;
  const a = Math.abs(r);
  let t = (a!==0 && (a>=1e15 || a<1e-9)) ? r.toExponential(6).replace(/\.?0+e/,'e').replace('e+','e') : String(r);
  return t.replace('.',',').replace(/-/g,'−');
}
/* resultado pra continuar a conta (sem a notação "e", que a calculadora não lê) */
function calcRaw(x){
  const t = calcNum(x);
  const m = t.match(/^(−?[\d,]+)e(−?\d+)$/);
  return m ? `(${m[1]}×10^(${m[2]}))` : (t.startsWith('−') ? `(${t})` : t);
}
/* separa milhares só na hora de mostrar: 1234567,5 → 1.234.567,5 */
function calcPretty(s){
  return escHTML(s).replace(/(^|[^\d,])(\d{4,})/g, (m,pre,d)=> pre + d.replace(/\B(?=(\d{3})+(?!\d))/g,'.'));
}
/* lê e calcula a conta (sem eval): erro vira uma mensagem que a criança entende */
function calcEval(expr, angle){
  const src = expr.replace(/\s+/g,'');
  let i = 0;
  const err = msg=>{ const e = new Error(msg); e.calc = true; throw e; };
  const toRad = x=> angle==='DEG' ? x*Math.PI/180 : x;
  const tiny = v=> Math.abs(v) < 1e-12 ? 0 : v; // sen 180° dá 0 certinho
  const peek = ()=> src[i];
  const startsFactor = ch=> ch!==undefined && /[\d,π(√esctl]/.test(ch);
  function sum(){
    let v = term();
    while(peek()==='+' || peek()==='−'){ const o = src[i++]; const r = term(); v = o==='+' ? v+r : v-r; }
    return v;
  }
  function term(){
    let v = unary();
    for(;;){
      const ch = peek();
      if(ch==='×' || ch==='÷'){ i++; const r = unary(); if(ch==='÷' && r===0) err('Não dá pra dividir por zero'); v = ch==='×' ? v*r : v/r; }
      else if(startsFactor(ch)) v = v*unary();   // 2π, 3(4+1), (2)(3)
      else return v;
    }
  }
  function unary(){
    if(peek()==='−'){ i++; return -unary(); }
    if(peek()==='+'){ i++; return unary(); }
    return power();
  }
  function power(){
    const b = postfix();
    if(peek()==='^'){ i++; if(i>=src.length) err('Falta o expoente'); const e = unary(); const r = Math.pow(b,e); if(isNaN(r)) err('Essa potência não existe nos reais'); return r; }
    return b;
  }
  function postfix(){
    let v = primary();
    for(;;){
      const ch = peek();
      if(ch==='²'){ i++; v = v*v; }
      else if(ch==='%'){ i++; v = v/100; }
      else if(ch==='!'){ i++; if(v<0 || v!==Math.floor(v)) err('Fatorial só de número natural'); if(v>170) err('Número grande demais'); let f = 1; for(let k=2;k<=v;k++) f *= k; v = f; }
      else return v;
    }
  }
  function group(){ // ( conta ) — o ")" que faltar no fim é fechado sozinho
    const v = sum();
    if(peek()===')') i++; else if(i<src.length) err('Conta incompleta');
    return v;
  }
  function primary(){
    const ch = peek();
    if(ch===undefined) err('Conta incompleta');
    const num = src.slice(i).match(/^\d*,?\d*/)[0];
    if(num && num!==','){ i += num.length; return parseFloat(num.replace(',','.')); }
    if(ch==='π'){ i++; return Math.PI; }
    if(ch==='e'){ i++; return Math.E; }
    if(ch==='('){ i++; return group(); }
    const fn = CALC_FUNCS.find(f=> src.startsWith(f, i));
    if(fn){
      i += fn.length;
      const x = group();
      if(fn==='sin(') return tiny(Math.sin(toRad(x)));
      if(fn==='cos(') return tiny(Math.cos(toRad(x)));
      if(fn==='tan('){ if(angle==='DEG' && Math.abs(((x%180)+180)%180 - 90) < 1e-9) err('tan de 90° não existe'); return tiny(Math.tan(toRad(x))); }
      if(fn==='√('){ if(x<0) err('Raiz de número negativo não existe nos reais'); return Math.sqrt(x); }
      if(x<=0) err('Logaritmo só de número maior que zero');
      return fn==='ln(' ? Math.log(x) : Math.log10(x);
    }
    err('Conta incompleta');
  }
  const v = sum();
  if(i < src.length) err('Conta incompleta');
  if(!isFinite(v)) err('Número grande demais');
  return v;
}

function calcState(){ return state.calc; }
const calcOpenParens = s=> (s.match(/\(/g)||[]).length - (s.match(/\)/g)||[]).length;
const calcEndsValue = s=> /[\d)π e!%²]$/.test(s) && !/[sctg]\($/.test(s);
const calcTrailingNum = s=> (s.match(/\d*,?\d*$/)||[''])[0];

/* o que acontece ao apertar cada tecla */
function calcInput(k){
  const st = calcState();
  st.err = '';
  const fresh = ()=>{ if(st.done){ st.expr = ''; st.done = false; st.prevLine = ''; } };
  const cont  = ()=>{ if(st.done){ st.expr = st.resRaw; st.done = false; st.prevLine = ''; } };
  let e = st.expr;
  if(k==='C'){ st.expr = ''; st.done = false; st.prevLine = ''; }
  else if(k==='⌫'){
    if(st.done){ st.expr = st.resRaw; st.done = false; st.prevLine = ''; }
    else { const fn = CALC_FUNCS.find(f=> st.expr.endsWith(f)); st.expr = st.expr.slice(0, -(fn ? fn.length : 1)); }
  }
  else if(/^\d$/.test(k)){
    fresh(); e = st.expr;
    const n = calcTrailingNum(e);
    st.expr = (n==='0') ? e.slice(0,-1) + k : e + k;
  }
  else if(k===','){
    fresh(); e = st.expr;
    const n = calcTrailingNum(e);
    if(n.includes(',')) return calcRefresh();
    st.expr = e + (n ? ',' : '0,');
  }
  else if(['+','−','×','÷','^'].includes(k)){
    cont(); e = st.expr;
    if(!e){ st.expr = k==='−' ? '−' : (k==='+' ? '' : '0'+k); }
    else if(/[+−×÷^]$/.test(e)){
      if(k==='−' && /[×÷^]$/.test(e)) st.expr = e + k;         // 3×−2
      else if(e.length>1 || k==='−') st.expr = e.replace(/[+−×÷^]+$/, '') + k; // troca o sinal
    }
    else if(/\($/.test(e)){ if(k==='−') st.expr = e + k; }
    else st.expr = e.replace(/,$/,'') + k;
  }
  else if(k==='()'){
    fresh(); e = st.expr;
    st.expr = e + ((calcOpenParens(e)>0 && calcEndsValue(e)) ? ')' : '(');
  }
  else if(k==='(' ){ fresh(); st.expr += '('; }
  else if(k===')'){ if(!st.done && calcOpenParens(st.expr)>0 && calcEndsValue(st.expr)) st.expr += ')'; }
  else if(['sin','cos','tan','ln','log','√'].includes(k)){
    if(st.done){ st.expr = `${k}(${st.resRaw})`; st.done = false; st.prevLine = ''; }
    else st.expr += k + '(';
  }
  else if(k==='²' || k==='%' || k==='!'){
    cont(); if(calcEndsValue(st.expr)) st.expr += k;
  }
  else if(k==='1/x'){
    if(st.done){ st.expr = `1÷${st.resRaw}`; st.done = false; st.prevLine = ''; }
    else { const n = calcTrailingNum(st.expr); if(n) st.expr = st.expr.slice(0, -n.length) + '1÷' + n; else if(calcEndsValue(st.expr)) st.expr += '^(−1)'; }
  }
  else if(k==='π' || k==='e'){ fresh(); st.expr += k; }
  else if(k==='±'){
    if(st.done){ st.expr = st.resRaw.startsWith('(−') ? st.resRaw.slice(2,-1) : `(−${st.resRaw})`; st.done = false; st.prevLine = ''; }
    else {
      e = st.expr; const n = calcTrailingNum(e); const pre = e.slice(0, e.length - n.length);
      if(pre.endsWith('(−')) st.expr = pre.slice(0,-2) + n;
      else st.expr = pre + '(−' + n;
    }
  }
  else if(k==='angle'){ st.angleMode = st.angleMode==='DEG' ? 'RAD' : 'DEG'; }
  else if(k==='='){
    if(st.done || !st.expr) return calcRefresh();
    try{
      const v = calcEval(st.expr, st.angleMode);
      const shown = st.expr + ')'.repeat(Math.max(0, calcOpenParens(st.expr)));
      st.prevLine = shown + ' ='; st.res = calcNum(v); st.resRaw = calcRaw(v); st.done = true;
      const hist = calcHistory(); hist.unshift({e: shown, r: st.res, raw: st.resRaw, a: st.angleMode}); saveCalcHistory(hist);
    }catch(ex){ st.err = ex.calc ? ex.message : 'Conta incompleta'; calcRefresh(true); return; }
  }
  calcRefresh();
}

/* atualiza só o visor (sem redesenhar a tela inteira a cada tecla) */
function calcRefresh(shake){
  const box = document.querySelector('.calc-display');
  if(!box){ render(); return; }
  const st = calcState();
  const prev = box.querySelector('.calc-prev'), big = box.querySelector('.calc-big'), pv = box.querySelector('.calc-preview');
  let bigTxt;
  if(st.done){
    prev.innerHTML = calcPretty(st.prevLine);
    bigTxt = st.res; big.innerHTML = calcPretty(st.res);
    pv.textContent = ''; pv.className = 'calc-preview';
  } else {
    prev.innerHTML = '';
    const open = Math.max(0, calcOpenParens(st.expr));
    bigTxt = st.expr || '0';
    big.innerHTML = st.expr ? calcPretty(st.expr) + (open ? `<span class="ghost">${')'.repeat(open)}</span>` : '') : '<span class="zero">0</span>';
    let p = '';
    if(st.err) p = st.err;
    else if(/[+−×÷^(²%!πe]|sin|cos|tan|ln|log|√/.test(st.expr.replace(/^−/,''))){
      try{ p = '= ' + calcNum(calcEval(st.expr, st.angleMode)); }catch(ex){ p = ''; }
    }
    pv.innerHTML = st.err ? escHTML(p) : calcPretty(p);
    pv.className = 'calc-preview' + (st.err ? ' err' : '');
  }
  big.classList.toggle('done', !!st.done);
  const L = bigTxt.length;
  big.classList.toggle('s1', L>9 && L<=14); big.classList.toggle('s2', L>14);
  const ang = document.querySelector('.calc-key[data-k="angle"]'); if(ang) ang.textContent = st.angleMode;
  const badge = box.querySelector('.calc-mode'); if(badge) badge.textContent = st.angleMode==='DEG' ? 'Graus' : 'Radianos';
  [prev, big].forEach(el=>{ el.scrollLeft = el.scrollWidth; });
  if(shake){ box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); }
}

function calcHistorySheet(){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  const paint = ()=>{
    const list = calcHistory();
    bg.innerHTML = `<div class="gm-modal calc-hist"><h2 style="font-size:20px">Histórico</h2>
      ${list.length ? `<div class="calc-hist-list">${list.map((h,i)=>`<button type="button" class="calc-hist-item" data-i="${i}"><span class="e">${calcPretty(h.e)} =</span><span class="r">${calcPretty(h.r)}</span></button>`).join('')}</div>
      <p class="calc-hist-tip">Toque numa conta pra usar o resultado.</p>
      <button type="button" class="nb-m calc-hist-clear">🗑️ Limpar histórico</button>` : `<p class="calc-hist-tip" style="margin:14px 0">As contas que você fizer aparecem aqui. 🧮</p>`}
      <button type="button" class="nb-cancel" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Fechar</button></div>`;
    bg.querySelectorAll('.calc-hist-item').forEach(b=> b.onclick = ()=>{
      const h = list[+b.dataset.i], st = calcState();
      const raw = h.raw || h.r;
      if(st.done || !st.expr){ st.expr = raw; st.done = false; st.prevLine = ''; }
      else if(calcEndsValue(st.expr)) st.expr += '×' + raw; else st.expr += raw;
      bg.remove(); calcRefresh();
    });
    const clr = bg.querySelector('.calc-hist-clear'); if(clr) clr.onclick = ()=>{ saveCalcHistory([]); paint(); };
    bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
  };
  paint();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}

function calculatorScreen(){
  const st = calcState();
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Calculadora', true, ()=>go('home')));
  const c = h(`<div class="content calc-wrap ${st.sciMode?'sci':''}"></div>`);

  const disp = h(`<div class="calc-display" aria-live="polite">
    <div class="calc-top">${st.sciMode ? '<span class="calc-mode"></span>' : '<span></span>'}<div class="calc-prev mono"></div></div>
    <div class="calc-big mono" title="Toque pra copiar o resultado"></div>
    <div class="calc-bottom"><button type="button" class="calc-bs" aria-label="Apagar">⌫</button><div class="calc-preview mono"></div></div>
  </div>`);
  disp.querySelector('.calc-bs').onclick = ()=> calcInput('⌫');
  disp.querySelector('.calc-big').onclick = ()=>{
    if(!st.done) return;
    try{ navigator.clipboard.writeText(st.res.replace('−','-')); showFloat('📋 Resultado copiado'); }catch(e){}
  };
  c.appendChild(disp);

  const bar = h(`<div class="calc-bar"><div class="calc-seg" role="tablist">
      <button type="button" class="${!st.sciMode?'on':''}" data-m="0">Básica</button>
      <button type="button" class="${st.sciMode?'on':''}" data-m="1">Científica</button>
    </div><button type="button" class="calc-hist-btn" aria-label="Histórico">🕘 Histórico</button></div>`);
  bar.querySelectorAll('.calc-seg button').forEach(b=> b.onclick = ()=>{ st.sciMode = b.dataset.m==='1'; render(); });
  bar.querySelector('.calc-hist-btn').onclick = calcHistorySheet;
  c.appendChild(bar);

  const key = (k, label, cls, aria)=> `<button type="button" class="calc-key ${cls||''}" data-k="${k}"${aria?` aria-label="${aria}"`:''}>${label}</button>`;
  if(st.sciMode){
    c.appendChild(h(`<div class="calc-sci-grid">${[
      key('angle', st.angleMode, 'sci mode', 'Graus ou radianos'), key('sin','sin','sci'), key('cos','cos','sci'), key('tan','tan','sci'), key('π','π','sci'),
      key('²','x<sup>2</sup>','sci','Ao quadrado'), key('^','x<sup>y</sup>','sci','Potência'), key('√','√','sci','Raiz quadrada'), key('ln','ln','sci'), key('log','log','sci'),
      key('1/x','1/x','sci','Inverso'), key('!','n!','sci','Fatorial'), key('(','(','sci'), key(')',')','sci'), key('e','e','sci'),
    ].join('')}</div>`));
  }
  c.appendChild(h(`<div class="calc-grid">${[
    key('C','C','fn','Limpar tudo'), key('()','( )','fn','Parênteses'), key('%','%','fn','Porcentagem'), key('÷','÷','op','Dividir'),
    key('7','7'), key('8','8'), key('9','9'), key('×','×','op','Vezes'),
    key('4','4'), key('5','5'), key('6','6'), key('−','−','op','Menos'),
    key('1','1'), key('2','2'), key('3','3'), key('+','+','op','Mais'),
    key('±','±','fn','Trocar o sinal'), key('0','0'), key(',',',','', 'Vírgula'), key('=','=','eq','Igual'),
  ].join('')}</div>`));
  c.querySelectorAll('.calc-key').forEach(b=> b.onclick = ()=> calcInput(b.dataset.k));
  wrap.appendChild(c);
  requestAnimationFrame(()=> calcRefresh());
  return wrap;
}

/* teclado do computador */
document.addEventListener('keydown', e=>{
  if(state.screen!=='calculator' || e.ctrlKey || e.metaKey || e.altKey) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||'') || document.querySelector('.gm-modal-bg')) return;
  const map = {'.':',', ',':',', '+':'+', '-':'−', '*':'×', 'x':'×', 'X':'×', '/':'÷', ':':'÷', '^':'^', '(':'(', ')':')', '%':'%', '!':'!',
    'Enter':'=', '=':'=', 'Backspace':'⌫', 'Escape':'C', 'Delete':'C', 'p':'π', 'P':'π'};
  const k = /^\d$/.test(e.key) ? e.key : map[e.key];
  if(!k) return;
  e.preventDefault();
  calcInput(k);
  const b = document.querySelector(`.calc-key[data-k="${CSS.escape(k)}"]`) || (k==='('||k===')' ? document.querySelector('.calc-key[data-k="()"]') : null);
  if(b){ b.classList.add('press'); setTimeout(()=>b.classList.remove('press'), 120); }
});
