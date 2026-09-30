/* =========================================================
   TELAS: RESOLVER QUESTÃO E CALCULADORA
   ========================================================= */
/* ---------------- SOLVE ---------------- */
function solveScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Resolver questão', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const card = h(`
    <div>
      <div class="solve-input-card">
        <label style="font-size:12px;font-weight:700;color:var(--ink-soft);display:block;margin-bottom:8px;">Digite sua conta, equação ou problema</label>
        <textarea id="solveInput" placeholder="Ex: 2x + 5 = 15"></textarea>
        <div class="solve-examples">
          <span class="ex-chip">(12 + 8) × 3</span>
          <span class="ex-chip">2x + 5 = 15</span>
          <span class="ex-chip">x² − 5x + 6 = 0</span>
          <span class="ex-chip">25% de 300</span>
          <span class="ex-chip">1/2 + 1/3</span>
          <span class="ex-chip">3/6 = 5/x</span>
        </div>
        <button class="solve-btn">Resolver</button>
      </div>
      <div id="solveResult"></div>
    </div>
  `);
  card.querySelectorAll('.ex-chip').forEach(chip=>{
    chip.onclick = ()=>{ card.querySelector('#solveInput').value = chip.textContent; };
  });
  card.querySelector('.solve-btn').onclick = ()=>{
    const val = card.querySelector('#solveInput').value.trim();
    const resultBox = card.querySelector('#solveResult');
    resultBox.innerHTML = '';
    if(!val){
      resultBox.appendChild(h(`<div class="unrecognized">✏️ Digite uma conta ou equação primeiro, ou toque num dos exemplos acima.</div>`));
      card.querySelector('#solveInput').focus();
      return;
    }
    const r = solveQuestion(val);
    if(!r){
      resultBox.appendChild(h(`<div class="unrecognized">Não consegui entender essa questão. 🤔<br>Tente reescrever de forma mais simples, como nos exemplos acima.</div>`));
      return;
    }
    resultBox.appendChild(h(`
      <div class="result-section">
        <div class="sec-label"><span class="n">1</span>Como resolver</div>
        <div class="result-card"><p>${r.howTo}</p></div>
      </div>`));
    const stepsSec = h(`<div class="result-section"><div class="sec-label"><span class="n">2</span>Passo a passo</div><div class="result-card"></div></div>`);
    const stepsCard = stepsSec.querySelector('.result-card');
    if(r.visual){ stepsCard.appendChild(h(`<div class="solve-visual">${r.visual}</div>`)); }
    r.steps.forEach((st,i)=>{
      stepsCard.appendChild(h(`<div class="step-item"><span class="num">${i+1}</span><span class="txt">${st}</span></div>`));
    });
    resultBox.appendChild(stepsSec);
    resultBox.appendChild(h(`
      <div class="result-section">
        <div class="sec-label"><span class="n">3</span>Explicação simples</div>
        <div class="result-card"><p>${r.simple}</p></div>
      </div>`));
    resultBox.appendChild(h(`
      <div class="result-section">
        <div class="sec-label"><span class="n">4</span>Resposta final</div>
        <div class="final-answer-box"><div class="lbl">RESULTADO</div><div class="val">${r.final}</div></div>
      </div>`));
    const practice = solvePracticeCard(val);
    if(practice) resultBox.appendChild(practice);
    const gs = loadGame(); gs.solves = (gs.solves||0) + 1; gameCheckAchievements(); saveGame();
  };
  c.appendChild(card);
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- CALCULATOR ---------------- */
function calculatorScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Calculadora', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const st = state.calc;
  const disp = h(`<div class="calc-display"><div class="prev mono">${st.prev}</div><div class="cur mono">${st.cur}</div></div>`);
  c.appendChild(disp);

  const toggleRow = h(`<div class="calc-toggle-row"></div>`);
  const basicChip = h(`<button class="calc-toggle-chip ${!st.sciMode?'active':''}">🔢 Básica</button>`);
  basicChip.onclick = ()=>{ st.sciMode=false; render(); };
  const sciChip = h(`<button class="calc-toggle-chip ${st.sciMode?'active':''}">🔬 Científica</button>`);
  sciChip.onclick = ()=>{ st.sciMode=true; render(); };
  toggleRow.appendChild(basicChip); toggleRow.appendChild(sciChip);
  c.appendChild(toggleRow);

  if(st.sciMode){
    const sciGrid = h(`<div class="calc-sci-grid"></div>`);
    const angleBtn = h(`<button class="calc-key sci active-mode">${st.angleMode}</button>`);
    angleBtn.onclick = ()=>{ st.angleMode = st.angleMode==='DEG' ? 'RAD' : 'DEG'; render(); };
    sciGrid.appendChild(angleBtn);
    const sciKeys1 = ['π','e','xʸ','±'];
    sciKeys1.forEach(label=>{
      const btn = h(`<button class="calc-key sci">${label}</button>`);
      btn.onclick = ()=> calcPress(label);
      sciGrid.appendChild(btn);
    });
    const sciKeys2 = ['sin','cos','tan','√'];
    sciKeys2.forEach(label=>{
      const btn = h(`<button class="calc-key sci">${label}</button>`);
      btn.onclick = ()=> calcPress(label);
      sciGrid.appendChild(btn);
    });
    const sciKeys3 = ['x²','1/x','ln','log'];
    sciKeys3.forEach(label=>{
      const btn = h(`<button class="calc-key sci">${label}</button>`);
      btn.onclick = ()=> calcPress(label);
      sciGrid.appendChild(btn);
    });
    c.appendChild(sciGrid);
  }

  const grid = h(`<div class="calc-grid"></div>`);
  const keys = [
    ['C','fn'],['⌫','fn'],['%','fn'],['÷','op'],
    ['7',''],['8',''],['9',''],['×','op'],
    ['4',''],['5',''],['6',''],['−','op'],
    ['1',''],['2',''],['3',''],['+','op'],
    ['0',''],[',',''],['=','eq'],[' ','ghost'],
  ];
  keys.forEach(([label,cls])=>{
    if(cls==='ghost'){ grid.appendChild(h(`<div></div>`)); return; }
    const CALC_NAMES = {'⌫':'Apagar','%':'Porcentagem','÷':'Dividir','×':'Multiplicar','−':'Menos','+':'Mais',',':'Vírgula','=':'Igual','C':'Limpar tudo'};
    const btn = h(`<button class="calc-key ${cls}"${CALC_NAMES[label]?` aria-label="${CALC_NAMES[label]}"`:''}>${label}</button>`);
    btn.onclick = ()=> calcPress(label);
    grid.appendChild(btn);
  });
  c.appendChild(grid);
  wrap.appendChild(c);
  return wrap;
}
/* aplica uma função de um só número (ex: seno, raiz, quadrado) direto no valor mostrado no visor */
function applyUnary(st, fn, prevLabel){
  const x = parseFloat(st.cur.replace(',','.'));
  if(isNaN(x)) return;
  let r;
  try { r = fn(x); } catch(e){ r = NaN; }
  st.prev = `${prevLabel}(${fmt(x)})`;
  st.cur = (r===undefined || isNaN(r) || !isFinite(r)) ? 'Erro' : fmt(r);
  st.waiting = true;
}
function calcPress(label){
  const st = state.calc;
  const toRad = x => st.angleMode==='DEG' ? x*Math.PI/180 : x;
  if(label==='C'){ st.cur='0'; st.prev=''; st.op=null; st.waiting=false; }
  else if(label==='⌫'){ st.cur = st.cur.length>1? st.cur.slice(0,-1) : '0'; }
  else if(/^[0-9]$/.test(label)){ st.cur = (st.waiting || st.cur==='0') ? label : st.cur+label; st.waiting=false; }
  else if(label===','){
    if(st.waiting || st.cur==='0'){ st.cur='0,'; }
    else if(!st.cur.includes(',')){ st.cur += ','; }
    st.waiting=false;
  }
  else if(label==='%'){ st.cur = String(parseFloat(st.cur.replace(',','.'))/100).replace('.',','); }
  else if(label==='±'){ if(st.cur!=='0'){ st.cur = st.cur.startsWith('-') ? st.cur.slice(1) : '-'+st.cur; } }
  else if(label==='π'){ st.cur = fmt(Math.PI); st.waiting=true; }
  else if(label==='e'){ st.cur = fmt(Math.E); st.waiting=true; }
  else if(label==='sin'){ applyUnary(st, x=>Math.sin(toRad(x)), 'sin'); }
  else if(label==='cos'){ applyUnary(st, x=>Math.cos(toRad(x)), 'cos'); }
  else if(label==='tan'){ applyUnary(st, x=>Math.tan(toRad(x)), 'tan'); }
  else if(label==='√'){ applyUnary(st, x=> x<0 ? NaN : Math.sqrt(x), '√'); }
  else if(label==='x²'){ applyUnary(st, x=>x*x, 'sqr'); }
  else if(label==='1/x'){ applyUnary(st, x=> x===0 ? NaN : 1/x, '1/'); }
  else if(label==='ln'){ applyUnary(st, x=> x<=0 ? NaN : Math.log(x), 'ln'); }
  else if(label==='log'){ applyUnary(st, x=> x<=0 ? NaN : Math.log10(x), 'log'); }
  else if(['÷','×','−','+','xʸ'].includes(label)){
    if(st.op && !st.waiting){ calcPress('='); }
    st.prev = `${st.cur} ${label}`; st.op = label; st.waiting=true;
  }
  else if(label==='='){
    if(!st.op) return;
    const a = parseFloat(st.prev.split(' ')[0].replace(',','.'));
    const b = parseFloat(st.cur.replace(',','.'));
    let r;
    if(st.op==='÷') r = b!==0? a/b : NaN;
    else if(st.op==='×') r = a*b;
    else if(st.op==='−') r = a-b;
    else if(st.op==='+') r = a+b;
    else if(st.op==='xʸ') r = Math.pow(a,b);
    st.prev = `${fmt(a)} ${st.op} ${fmt(b)} =`;
    st.cur = (r===undefined || isNaN(r) || !isFinite(r)) ? 'Erro' : fmt(r);
    st.op = null; st.waiting = true;
  }
  render();
}
