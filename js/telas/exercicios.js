/* =========================================================
   ABA EXERCÍCIOS
   Lista de assuntos e modos de treino, sessões de exercícios, dicas,
   revisão de erros, Desafios e Treino personalizado.
   ========================================================= */

/* ---------------- EXERCISES: subject list ---------------- */
function exercisesSubjectsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Exercícios', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  // modos de treino (cada um mora aqui, na aba Exercícios)
  c.appendChild(h(`<h3 class="home-sec" style="margin:4px 0 10px">Modos de treino</h3>`));
  const modes = h(`<div class="quick-grid ex-modes" style="padding:0"></div>`);
  [
    {sym:'🎯', cls:'tile-train', label:'Treino personalizado', go:()=>go('personalizedSetup')},
    {sym:'🏆', cls:'challenge', label:'Desafios', go:()=>go('challengeDifficulty')},
    {sym:'×', cls:'tabuada', label:'Tabuada', go:()=>go('tabuada')},
    {sym:'🔁', cls:'tile-hist', label:'Caderno de erros', go:()=>go('errors')},
  ].forEach(m=>{ const t = h(`<button type="button" class="quick-tile ${m.cls}"><span class="sym">${m.sym}</span><span class="label">${m.label}</span></button>`); t.onclick = m.go; modes.appendChild(t); });
  c.appendChild(modes);
  c.appendChild(h(`<h3 class="home-sec" style="margin:18px 0 6px">Por assunto</h3>`));
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 8px;">Escolha um assunto para praticar.</p>`));
  subjectListGrouped(c, (s,u)=>{
    const row = h(`<button class="subject-row" style="${unitStyle(u)}"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${masteryChip(masterySync(s.id))}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=>go('exerciseDifficulty', {subjectId:s.id});
    return row;
  });
  wrap.appendChild(c);
  return wrap;
}

function exerciseDifficultyScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Escolha a dificuldade para começar 5 exercícios.</p>`));
  const row = h(`<div class="diff-row"></div>`);
  [['facil','Fácil'],['medio','Médio'],['dificil','Difícil']].forEach(([id,label])=>{
    const chip = h(`<button class="diff-chip" data-d="${id}">${label}</button>`);
    chip.onclick = ()=> startSession(s.id, id);
    row.appendChild(chip);
  });
  c.appendChild(row);
  wrap.appendChild(c);
  return wrap;
}

/* dica curta, por assunto: lembra o método geral, sem revelar o resultado da questão atual */
const HINTS = {
  conjuntos: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Raiz de quadrado perfeito é racional; raiz de número que não é quadrado perfeito (e o π) é irracional. Dízima com período de 2 algarismos: período sobre 99.',
  funcquad: 'Pra calcular f(x), troque x pelo número (com parênteses se for negativo). Vértice: <b>xᵥ = −b / 2a</b> e yᵥ = f(xᵥ). a > 0 → mínimo; a < 0 → máximo.',
  modular: 'O módulo tira o sinal: |−5| = 5. Em |x − a| = k, o que está dentro vale <b>k</b> ou <b>−k</b> — são duas equações.',
  exponencial: 'Escreva os dois lados como potência da <b>mesma base</b> (fatore os números) e iguale os expoentes.',
  logaritmo: 'logₐ b é o expoente que transforma a em b. Soma de logs = log do produto; diferença = log da divisão. log 2 ≈ 0,30 e log 3 ≈ 0,48.',
  functrig: 'sen e cos variam de −1 a 1. Em a + b·sen x: máximo = a + |b|, mínimo = a − |b|. Período de sen(cx) = 360° ÷ c.',
  pa: 'Razão r = um termo − o anterior. aₙ = a₁ + (n − 1)·r. Soma: Sₙ = (a₁ + aₙ)·n / 2.',
  pg: 'Razão q = um termo ÷ o anterior. aₙ = a₁ · qⁿ⁻¹. Soma: Sₙ = a₁·(qⁿ − 1)/(q − 1).',
  espacial: 'Prisma e cilindro: base × altura. Pirâmide e cone: base × altura ÷ 3. Esfera: 4πr³/3. Cilindro/cone têm base circular: π·r².',
  analitica: 'Distância: √(Δx² + Δy²). Coeficiente angular: Δy ÷ Δx. Circunferência x² + y² − 2ax − 2by + c = 0: centro (a, b) e r² = a² + b² − c.',
  trigret: 'Pitágoras: h² = c² + c². sen = oposto/hipotenusa, cos = adjacente/hipotenusa, tg = oposto/adjacente. sen 30° = cos 60° = 1/2 e tg 45° = 1.',
  ciclo: 'π rad = 180°: troque π por 180 e faça a conta. Pra achar a menor determinação, tire (ou some) 360° até cair entre 0° e 360°.',
  identidades: 'sen²x + cos²x = 1 (use pra achar um a partir do outro). tg = sen ÷ cos. sen 2x = 2·sen x·cos x.',
  leis: 'Lei dos senos: a/sen A = b/sen B = 2R. Lei dos cossenos: a² = b² + c² − 2bc·cos A (cos 60° = 1/2, cos 120° = −1/2).',
  combinatoria: 'Escolhas independentes: multiplique. Ordem importa (pódio, senha): arranjo. Ordem não importa (comissão, grupo): combinação. Anagramas: n!.',
  probabilidade: 'P = favoráveis ÷ possíveis. Dois dados: 36 resultados. Eventos independentes (“e”): multiplique as probabilidades.',
  dispersao: 'Amplitude = maior − menor. Variância: média dos quadrados das distâncias até a média. Desvio padrão = √variância.',
  graficos: 'Leia título, eixos e unidades antes de calcular. Variação % = (novo − antigo) ÷ antigo × 100. Pizza: 360° = 100%.',
  juros: 'Simples: J = C·i·t (i em decimal: 5% = 0,05) e M = C + J. Compostos: M = C·(1 + i)ᵗ.',
  descontos: 'Desconto de d%: multiplique por (1 − d). Descontos sucessivos: multiplique os fatores, não some as porcentagens.',
  inflacao: 'Taxas seguidas se multiplicam: (1 + i₁)(1 + i₂) − 1. Ganho real: (1 + rendimento) ÷ (1 + inflação) − 1.',
  matrizes: 'aᵢⱼ = linha i, coluna j. Soma: posição com posição. Produto: linha de A × coluna de B, multiplicando termo a termo e somando.',
  determinantes: '2×2: diagonal principal − diagonal secundária. 3×3 (Sarrus): repita as 2 primeiras colunas; descendo − subindo.',
  dinheiro: 'Transforme tudo em <b>centavos</b> (R$ 2,50 = 250), faça a conta com números inteiros e volte pra reais no fim. Troco = valor pago − total.<br><b>Exemplo:</b> pagou R$ 10 numa compra de R$ 6,30 → 1000 − 630 = 370 → troco R$ 3,70.',
  mmcmdc: 'Decomponha os dois números em fatores primos. <b>MMC</b>: pegue todos os fatores com o maior expoente. <b>MDC</b>: pegue só os fatores em comum com o menor expoente.<br><b>Exemplo:</b> 12 = 2² × 3 e 18 = 2 × 3² → MMC = 2² × 3² = 36 · MDC = 2 × 3 = 6.',
  geometria: 'Perímetro = soma de todos os lados. Área: retângulo = base × altura · triângulo = base × altura ÷ 2 · trapézio = (B + b) × h ÷ 2 · círculo = 3,14 × raio².<br><b>Exemplo:</b> triângulo de base 8 e altura 5 → 8 × 5 ÷ 2 = 20.',
  estatistica: '<b>Média</b>: some tudo e divida pela quantidade. <b>Mediana</b>: coloque em ordem e pegue o do meio (se forem 2 no meio, faça a média deles). <b>Moda</b>: o que mais se repete.<br><b>Exemplo:</b> 2, 5, 5, 8 → média 5 · mediana 5 · moda 5.',
  adicao: 'Alinhe os números pela direita e some coluna por coluna, começando pelas unidades. Se a soma de uma coluna passar de 9, escreva só o último dígito e "leve" o resto pra próxima coluna.<br><b>Exemplo:</b> 27 + 15 → unidades: 7 + 5 = 12, escreve 2, vai 1. Dezenas: 2 + 1 + 1 = 4. Resultado: 42.',
  subtracao: 'Escreva o maior número em cima e o menor embaixo, alinhados pela direita. Subtraia coluna por coluna, da direita pra esquerda; se o de cima for menor, empreste 1 dezena da coluna vizinha.<br><b>Exemplo:</b> 52 − 28 → unidades: 2 é menor que 8, empresta 1 dezena → 12 − 8 = 4. Dezenas: 4 − 2 = 2. Resultado: 24.',
  multiplicacao: 'Números de um dígito só: pense na tabuada. Números maiores: multiplique dígito por dígito da direita pra esquerda, guardando os "vai um", e depois some os resultados parciais.<br><b>Exemplo:</b> 23 × 4 → 3 × 4 = 12, escreve 2, vai 1. 2 × 4 = 8 + 1 = 9. Resultado: 92.',
  divisao: 'Pergunte "quantas vezes o divisor cabe?" começando pelo início do dividendo. Multiplique, subtraia, desça o próximo dígito e repita a pergunta.<br><b>Exemplo:</b> 84 ÷ 4 → o 4 cabe 2 vezes no 8 (2×4=8, resto 0). Desce o 4: cabe 1 vez. Resultado: 21.',
  fracoes: 'Denominadores iguais? Some (ou subtraia) só os numeradores. Diferentes? Primeiro ache o MMC dos denominadores, transforme as frações, e só depois some ou subtraia os numeradores.<br><b>Exemplo:</b> 1/5 + 2/5 = 3/5 — denominadores já iguais, então soma só o de cima.',
  decimais: 'Alinhe pela vírgula, como se ela fosse o "chão" — unidade sob unidade, décimo sob décimo. Pra multiplicar, ignore a vírgula, multiplique como se fossem inteiros e reposicione ela depois.<br><b>Exemplo:</b> 3,4 + 1,25 → complete com zero: 3,40 + 1,25 = 4,65.',
  porcentagem: 'Transforme a porcentagem numa fração sobre 100, multiplique pelo valor e divida por 100. Se for aumento, some esse valor ao total; se for desconto, subtraia.<br><b>Exemplo:</b> 10% de 50 → 50 × 10 ÷ 100 = 5.',
  regra3: 'Primeiro descubra se as grandezas andam juntas (direta) ou em sentidos opostos (inversa). Se direta, multiplique em cruz direto na tabela; se inversa, inverta uma das colunas antes de multiplicar em cruz.<br><b>Exemplo (direta):</b> 2 itens custam R$ 8. Quanto custam 5 itens? 2 × x = 5 × 8 → x = 20.',
  potenciacao: 'Potência é multiplicação repetida — o expoente diz quantas vezes multiplicar a base por ela mesma. Raiz é o caminho contrário: pergunte "que número, multiplicado por ele mesmo, dá esse valor?".<br><b>Exemplo:</b> 3² = 3 × 3 = 9. E √9 = 3, porque 3 × 3 = 9.',
  expressoes: 'Siga sempre esta ordem: parênteses primeiro, depois potências e raízes, depois multiplicação e divisão, e só por último soma e subtração.<br><b>Exemplo:</b> 5 + 2 × 3 → multiplica primeiro (2×3=6), depois soma: 5+6=11.',
  eq1: 'Junte os termos com x de um lado e os números sozinhos do outro. Todo termo que atravessa o sinal de igual troca de sinal. No fim, se x estiver sendo multiplicado por um número, divida os dois lados por ele.<br><b>Exemplo:</b> 3x + 2 = 11 → 3x = 11 − 2 = 9 → x = 9 ÷ 3 = 3.',
  eq2: 'Identifique a, b e c na equação ax² + bx + c = 0. Calcule Δ = b² − 4ac, depois substitua a, b e Δ na fórmula de Bhaskara pra achar as duas raízes.<br><b>Exemplo:</b> x² − 3x + 2 = 0 → a=1, b=−3, c=2 → Δ = 9 − 8 = 1 → raízes 1 e 2.',
  sistemas: 'Tente deixar uma das variáveis com coeficientes opostos nas duas equações (uma +, outra −). Some as equações pra ela se cancelar, resolva a que sobrou e substitua o valor de volta.<br><b>Exemplo:</b> x + y = 5 e x − y = 1 → somando: 2x = 6 → x = 3 → y = 2.',
  func1grau: 'Pra calcular f(x), troque o x da fórmula pelo número dado e resolva a conta. Pra achar a raiz, iguale a fórmula a zero e resolva como uma equação do 1º grau comum.<br><b>Exemplo:</b> f(x) = 2x + 1 → f(2) = 2×2 + 1 = 5.',
};

/* botão "Preciso de uma dica" — some/mostra um lembrete do método, sem revelar a resposta */
function renderHintButton(container, subjectId){
  const hintText = HINTS[subjectId];
  if(!hintText) return;
  const box = h(`<div class="hint-box" style="display:none">💡 ${hintText}</div>`);
  const btn = h(`<button type="button" class="hint-btn">💡 Preciso de uma dica</button>`);
  btn.onclick = ()=>{
    const showing = box.style.display !== 'none';
    box.style.display = showing ? 'none' : '';
    btn.textContent = showing ? '💡 Preciso de uma dica' : '💡 Esconder dica';
  };
  container.appendChild(btn);
  container.appendChild(box);
}

/* botão "Praticar mais esse tipo de questão" — treino focado (5 questões) no mesmo
   assunto + dificuldade do erro que acabou de acontecer */
function renderDrillButton(container, subjectId, difficulty){
  if(!difficulty) return;
  const subj = SUBJECTS.find(s=>s.id===subjectId);
  const btn = h(`<button type="button" class="drill-btn">🎯 Praticar mais ${subj? subj.name.toLowerCase() : 'esse assunto'} (5 questões)</button>`);
  btn.onclick = ()=> startSession(subjectId, difficulty);
  container.appendChild(btn);
}

function startSession(subjectId, difficulty){
  const subj = SUBJECTS.find(s=>s.id===subjectId);
  const {ex, signature} = genQuestionAvoidingRepeat(subj, difficulty, null);
  state.session = {subjectId, difficulty, index:0, total:5, correct:0, wrong:0, results:[], checked:false, wasCorrect:null, current: ex, lastSignature: signature};
  go('exerciseSession');
}

function checkAnswerValue(userVal, correctVal){
  return Math.abs(userVal - correctVal) < 0.02;
}
/* campo de resposta com um botão "/" do lado, pra quem digita fração e não acha a barra no teclado do celular */
function answerInputHTML(id, placeholder){
  return `<div class="ans-input-wrap"><input type="text" inputmode="decimal" id="${id}" placeholder="${placeholder}"><button type="button" class="slash-btn" data-target="${id}">/</button></div>`;
}
function wireSlashButtons(root){
  root.querySelectorAll('.slash-btn').forEach(btn=>{
    btn.onclick = ()=>{
      const input = root.querySelector('#'+btn.dataset.target);
      if(!input) return;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0,start) + '/' + input.value.slice(end);
      const pos = start+1;
      input.focus();
      input.setSelectionRange(pos,pos);
    };
  });
}
function parseUserNumber(str){
  if(str==null) return NaN;
  str = str.trim();
  if(str.includes('/')){
    // qualquer coisa com "/" é tratada como fração — se vier malformada (denominador
    // zero, texto no lugar de número, "5/" sem denominador etc.), o resultado é NaN,
    // pra contar como resposta errada em vez de "vazar" um número truncado sem querer.
    const parts = str.split('/');
    if(parts.length !== 2) return NaN;
    const n = Number(parts[0]);
    const d = Number(parts[1]);
    if(isNaN(n) || isNaN(d) || d===0) return NaN;
    return n/d;
  }
  // formato brasileiro: ponto separa milhar, vírgula é a casa decimal.
  // "1.234,56" -> 1234.56 | "1.234" -> 1234 (não 1,234!) | "12,5" -> 12.5 | "12.5" -> 12.5
  if(str.includes(',')){
    str = str.replace(/\./g, '').replace(',', '.');
  } else if(/^-?\d{1,3}(\.\d{3})+$/.test(str)){
    str = str.replace(/\./g, '');
  }
  return parseFloat(str);
}

function exerciseSessionScreen(){
  const sess = state.session;
  const s = SUBJECTS.find(x=>x.id===sess.subjectId);
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('exerciseDifficulty', {subjectId:s.id})));
  const c = h(`<div class="content"></div>`);

  if(sess.index >= sess.total){
    const pct = Math.round((sess.correct/sess.total)*100);
    gameSessionEnd(c, sess.correct, sess.total, `Você acertou ${pct}% dos exercícios de ${s.name}.`);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    const again = h(`<button class="btn primary">Praticar de novo</button>`);
    again.onclick = ()=> startSession(sess.subjectId, sess.difficulty);
    const home = h(`<button class="btn secondary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(again); actions.appendChild(home);
    c.appendChild(actions);
    wrap.appendChild(c);
    return wrap;
  }

  const dots = h(`<div class="progress-dots"></div>`);
  for(let i=0;i<sess.total;i++){
    let cls='dot';
    if(i<sess.results.length) cls += sess.results[i] ? ' ok':' bad';
    else if(i===sess.index) cls += ' now';
    dots.appendChild(h(`<span class="${cls}"></span>`));
  }
  c.appendChild(dots);
  c.appendChild(sessionHud());

  const ex = sess.current;
  const qcard = h(`<div class="question-card"><div class="qlabel">QUESTÃO ${sess.index+1} DE ${sess.total} · ${({facil:'FÁCIL',medio:'MÉDIO',dificil:'DIFÍCIL'})[sess.difficulty]}</div><div class="qtext mono"></div></div>`);
  const qtextEl = qcard.querySelector('.qtext');
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(ex.columns){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`;
  } else if(ex.visual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = fracRow(ex.visual);
  } else if(ex.qVisual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = ex.qVisual;
  } else {
    qtextEl.innerHTML = ex.question.replace(/\n/g,'<br>');
  }
  c.appendChild(qcard);

  if(!sess.checked){
    const form = h(`<div class="answer-form"></div>`);
    if(ex.type==='single'){
      form.appendChild(h(`<div><label>Resposta</label>${answerInputHTML('ans1','Digite o valor')}</div>`));
    } else if(ex.type==='pair'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x'</label>${answerInputHTML('ans1','raiz 1')}</div><div style="flex:1"><label>x''</label>${answerInputHTML('ans2','raiz 2')}</div></div>`));
    } else if(ex.type==='xy'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x</label>${answerInputHTML('ans1','valor de x')}</div><div style="flex:1"><label>y</label>${answerInputHTML('ans2','valor de y')}</div></div>`));
    }
    const btn = h(`<button class="check-btn">Corrigir</button>`);
    btn.onclick = async ()=>{
      const v1 = parseUserNumber(form.querySelector('#ans1').value);
      let correct;
      if(ex.type==='single'){
        correct = checkAnswerValue(v1, ex.answer);
      } else if(ex.type==='pair'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        const [a,b] = ex.answer;
        correct = (checkAnswerValue(v1,a)&&checkAnswerValue(v2,b)) || (checkAnswerValue(v1,b)&&checkAnswerValue(v2,a));
      } else if(ex.type==='xy'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        correct = checkAnswerValue(v1, ex.answer.x) && checkAnswerValue(v2, ex.answer.y);
      }
      sess.checked = true; sess.wasCorrect = correct;
      giveAnswerFeedback(correct);
      sess.results.push(correct);
      if(correct) sess.correct++; else sess.wrong++;
      await recordAnswer(sess.subjectId, correct, {difficulty: sess.difficulty, ex});
      render();
    };
    { const tip = firstTimeTip('typed', 'Digite a resposta e toque em <b>Corrigir</b>. Use vírgula pra decimais (2,5) e o botão <b>/</b> pra frações (3/4).'); if(tip) form.prepend(tip); }
    renderHintButton(form, sess.subjectId);
    form.appendChild(btn);
    c.appendChild(form);
    wireSlashButtons(form);
  } else {
    const correct = sess.wasCorrect;
    const fb = h(`<div class="feedback ${correct?'correct':'wrong'}"><div class="fb-title">${correct? cheerLine() : '✕ Quase! Veja como resolver:'}</div><div class="fb-explain"></div></div>`);
    let stepsList = ex.steps;
    if(ex.columns){
      stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
    } else if(ex.visual){
      const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
      const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
      const visualWithResult = ex.visual.slice(0, -2).concat(['=', ansToken]);
      stepsList = [fracRow(visualWithResult), ...ex.steps];
    } else if(ex.solvedVisual){
      stepsList = [ex.solvedVisual, ...ex.steps];
    }
    const stepsHtml = stepsList.map(st=>`<div class="step">${st}</div>`).join('');
    const finalTxt = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${ex.answer[0]}  e  x'' = ${ex.answer[1]}` : ex.type==='xy'? `x = ${ex.answer.x}  e  y = ${ex.answer.y}` : fmt(ex.answer));
    fb.querySelector('.fb-explain').innerHTML = stepsHtml + `<div class="step" style="margin-top:8px"><b>Resposta: ${finalTxt}</b></div>`;
    c.appendChild(fb);
    if(!correct) renderDrillButton(c, sess.subjectId, sess.difficulty);
    const nextBtn = h(`<button class="next-btn">${sess.index+1<sess.total? 'Próxima questão':'Ver resultado'}</button>`);
    nextBtn.onclick = ()=>{
      sess.index++;
      sess.checked=false; sess.wasCorrect=null;
      if(sess.index < sess.total){
        const {ex, signature} = genQuestionAvoidingRepeat(s, sess.difficulty, sess.lastSignature);
        sess.current = ex;
        sess.lastSignature = signature;
      }
      render();
    };
    c.appendChild(nextBtn);
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- REVISAR MEUS ERROS ---------------- */
const REVIEW_ERRORS_MAX = 15;
async function startReviewErrors(opts){
  opts = opts || {};
  const errs = await loadErrors();
  if(!errs.length){ go('home'); return; }
  // primeiro os que venceram hoje (caixa menor = mais urgente), depois os demais se a pessoa pediu tudo
  const now = Date.now();
  let pool = errs.filter(e=>errorIsDue(e, now) && (!opts.subjectId || e.subjectId===opts.subjectId));
  if(!pool.length || opts.all) pool = errs.filter(e=>!opts.subjectId || e.subjectId===opts.subjectId);
  if(!pool.length){ go('home'); return; }
  pool = pool.slice().sort((a,b)=>(a.box||1)-(b.box||1) || (b.count||1)-(a.count||1)).slice(0, REVIEW_ERRORS_MAX);
  state.session = {
    errorQueue: pool.map(e=>({...e})),
    index:0, total: pool.length,
    correct:0, wrong:0, results:[], checked:false, wasCorrect:null,
  };
  go('reviewErrorsSession');
}

async function recordReviewAnswer(item, correct){
  const hist = await loadHistory();
  hist.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    ts: Date.now(), subjectId: item.subjectId, subjectName: item.subjectName,
    difficulty: item.difficulty, correct, ex: item.ex, review: true,
  });
  if(hist.length > HISTORY_LIMIT) hist.length = HISTORY_LIMIT;
  await saveHistory();

  const p = await loadProgress();
  bumpProgress(p, item.subjectId, correct, item.difficulty);
  await saveProgress();

  item.reviewResult = await reviewErrorResult(item.id, correct);
  gameOnAnswer(item.subjectId, correct, item.difficulty, {review:true});
}

function reviewErrorsSessionScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Revisar erros', true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content"></div>`);

  if(!sess || sess.index >= sess.total){
    const pct = (sess && sess.total)? Math.round((sess.correct/sess.total)*100) : 0;
    gameSessionEnd(c, sess? sess.correct : 0, sess? sess.total : 0, `Você acertou ${pct}% na revisão dos seus erros.`);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    const home = h(`<button class="btn primary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(home);
    c.appendChild(actions);
    wrap.appendChild(c);
    return wrap;
  }

  const item = sess.errorQueue[sess.index];
  const ex = item.ex;

  const dots = h(`<div class="progress-dots"></div>`);
  for(let i=0;i<sess.total;i++){
    let cls='dot';
    if(i<sess.results.length) cls += sess.results[i] ? ' ok':' bad';
    else if(i===sess.index) cls += ' now';
    dots.appendChild(h(`<span class="${cls}"></span>`));
  }
  c.appendChild(dots);
  c.appendChild(sessionHud());

  const diffLabel = ({facil:'FÁCIL',medio:'MÉDIO',dificil:'DIFÍCIL'})[item.difficulty] || '';
  const qcard = h(`<div class="question-card"><div class="qlabel">ERRO ${sess.index+1} DE ${sess.total} · ${item.subjectName}${diffLabel? ' · '+diffLabel : ''}${(item.count||1)>1? ` · ERRADA ${item.count}x` : ''}</div><div class="qtext mono"></div></div>`);
  const qtextEl = qcard.querySelector('.qtext');
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(ex.columns){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`;
  } else if(ex.visual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = fracRow(ex.visual);
  } else if(ex.qVisual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = ex.qVisual;
  } else {
    qtextEl.innerHTML = ex.question.replace(/\n/g,'<br>');
  }
  c.appendChild(qcard);

  if(!sess.checked){
    const form = h(`<div class="answer-form"></div>`);
    if(ex.type==='single'){
      form.appendChild(h(`<div><label>Resposta</label>${answerInputHTML('ans1','Digite o valor')}</div>`));
    } else if(ex.type==='pair'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x'</label>${answerInputHTML('ans1','raiz 1')}</div><div style="flex:1"><label>x''</label>${answerInputHTML('ans2','raiz 2')}</div></div>`));
    } else if(ex.type==='xy'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x</label>${answerInputHTML('ans1','valor de x')}</div><div style="flex:1"><label>y</label>${answerInputHTML('ans2','valor de y')}</div></div>`));
    }
    const btn = h(`<button class="check-btn">Corrigir</button>`);
    btn.onclick = async ()=>{
      const v1 = parseUserNumber(form.querySelector('#ans1').value);
      let correct;
      if(ex.type==='single'){
        correct = checkAnswerValue(v1, ex.answer);
      } else if(ex.type==='pair'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        const [a,b] = ex.answer;
        correct = (checkAnswerValue(v1,a)&&checkAnswerValue(v2,b)) || (checkAnswerValue(v1,b)&&checkAnswerValue(v2,a));
      } else if(ex.type==='xy'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        correct = checkAnswerValue(v1, ex.answer.x) && checkAnswerValue(v2, ex.answer.y);
      }
      sess.checked = true; sess.wasCorrect = correct;
      giveAnswerFeedback(correct);
      sess.results.push(correct);
      if(correct) sess.correct++; else sess.wrong++;
      await recordReviewAnswer(item, correct);
      render();
    };
    { const tip = firstTimeTip('typed', 'Digite a resposta e toque em <b>Corrigir</b>. Use vírgula pra decimais (2,5) e o botão <b>/</b> pra frações (3/4).'); if(tip) form.prepend(tip); }
    renderHintButton(form, item.subjectId);
    form.appendChild(btn);
    c.appendChild(form);
    wireSlashButtons(form);
  } else {
    const correct = sess.wasCorrect;
    const fb = h(`<div class="feedback ${correct?'correct':'wrong'}"><div class="fb-title">${correct? (item.reviewResult==='learned' ? '✓ Aprendido! Essa questão saiu do seu caderno de erros.' : `✓ Certinho! Ela volta em ${ERROR_BOX_DAYS[Math.min(3,(item.box||1)+1)]} dias pra fixar de vez.`) : '✕ Ainda não foi — ela volta amanhã pra você tentar de novo:'}</div><div class="fb-explain"></div></div>`);
    let stepsList = ex.steps;
    if(ex.columns){
      stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
    } else if(ex.visual){
      const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
      const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
      const visualWithResult = ex.visual.slice(0, -2).concat(['=', ansToken]);
      stepsList = [fracRow(visualWithResult), ...ex.steps];
    } else if(ex.solvedVisual){
      stepsList = [ex.solvedVisual, ...ex.steps];
    }
    const stepsHtml = stepsList.map(st=>`<div class="step">${st}</div>`).join('');
    const finalTxt = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${ex.answer[0]}  e  x'' = ${ex.answer[1]}` : ex.type==='xy'? `x = ${ex.answer.x}  e  y = ${ex.answer.y}` : fmt(ex.answer));
    fb.querySelector('.fb-explain').innerHTML = stepsHtml + `<div class="step" style="margin-top:8px"><b>Resposta: ${finalTxt}</b></div>`;
    c.appendChild(fb);
    if(!correct) renderDrillButton(c, item.subjectId, item.difficulty);
    const nextBtn = h(`<button class="next-btn">${sess.index+1<sess.total? 'Próximo erro':'Ver resultado'}</button>`);
    nextBtn.onclick = ()=>{
      sess.index++;
      sess.checked=false; sess.wasCorrect=null;
      render();
    };
    c.appendChild(nextBtn);
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- DESAFIOS (perguntas de todos os assuntos misturadas, por dificuldade) ----------------
   Escolhe os assuntos (Todos / Fundamental / Ensino Médio), a dificuldade e quantas questões.
   Cada combinação guarda o recorde (mais acertos); no fim há a revisão de cada questão. */
const CH_KEY_BASE = 'mathstudy-challenge-v1';
const CH_POOLS = [['all','🌎','Todos'], ['fund','📘','Fundamental'], ['em','🎓','Ensino Médio']];
const CH_DIFFS = [['facil','Fácil','🟢','Pra aquecer'], ['medio','Médio','🟡','O desafio certo'], ['dificil','Difícil','🔴','Pra quem é fera']];
const CH_SIZES = [5,10,15];
function chData(){ try{ const d = JSON.parse(localStorage.getItem(`${CH_KEY_BASE}:${currentUserId()}`)||'{}'); d.best = d.best||{}; d.cfg = d.cfg||{pool:'all', n:10}; d.plays = d.plays||0; return d; }catch(e){ return {best:{}, cfg:{pool:'all', n:10}, plays:0}; } }
function saveChData(d){ try{ localStorage.setItem(`${CH_KEY_BASE}:${currentUserId()}`, JSON.stringify(d)); }catch(e){} }
const chKey = (pool, diff, n)=> `${pool}:${diff}:${n}`;
function chPickSubject(sess){
  const ids = sess.pool && sess.pool!=='all' ? levelIds(sess.pool) : SUBJECTS.map(x=>x.id);
  const list = SUBJECTS.filter(x=> ids.includes(x.id) && x.id!==sess.currentSubjectId);
  return list.length ? pick(list) : pick(SUBJECTS);
}
function challengeDifficultyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Desafios', true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content ch-setup"></div>`);
  const d = chData(), cfg = d.cfg;
  const bestAll = Math.max(0, ...Object.values(d.best).map(x=>x.pct||0));
  c.appendChild(h(`<div class="ch-hero">
      <div class="chh-top"><div class="chh-ico">🏆</div><div><h2>Desafios</h2><p>Questões sorteadas de vários assuntos, uma de cada vez. Responda digitando e veja a resolução de cada uma.</p></div></div>
      <div class="chh-stats"><div><b>${d.plays}</b><span>desafios feitos</span></div><div><b>${bestAll}%</b><span>melhor acerto</span></div></div>
    </div>`));
  const body = h(`<div></div>`); c.appendChild(body);
  function paint(){
    body.innerHTML = '';
    const sec = t=> h(`<div class="ch-lbl">${t}</div>`);
    body.appendChild(sec('Assuntos'));
    const pools = h(`<div class="ch-pools"></div>`);
    CH_POOLS.forEach(([id,ico,label])=>{
      const b = h(`<button type="button" class="ch-pool ${cfg.pool===id?'on':''}"><span>${ico}</span>${label}</button>`);
      b.onclick = ()=>{ cfg.pool = id; saveChData(d); paint(); };
      pools.appendChild(b);
    });
    body.appendChild(pools);
    body.appendChild(sec('Quantas questões'));
    const sizes = h(`<div class="ch-sizes"></div>`);
    CH_SIZES.forEach(n=>{
      const b = h(`<button type="button" class="ch-size ${cfg.n===n?'on':''}">${n}</button>`);
      b.onclick = ()=>{ cfg.n = n; saveChData(d); paint(); };
      sizes.appendChild(b);
    });
    body.appendChild(sizes);
    body.appendChild(sec('Escolha a dificuldade pra começar'));
    CH_DIFFS.forEach(([id,label,dot,desc])=>{
      const best = d.best[chKey(cfg.pool, id, cfg.n)];
      const b = h(`<button type="button" class="ch-level ch-${id}"><span class="ch-dot">${dot}</span><span class="ch-t"><b>${label}</b><small>${desc}</small></span><span class="ch-best">${best ? `🏆 ${best.ok}/${cfg.n}` : 'Sem recorde'}</span><span class="ch-go">▶</span></button>`);
      b.onclick = ()=> startChallenge(id, cfg.pool, cfg.n);
      body.appendChild(b);
    });
    body.appendChild(h(`<div class="ch-rules">
        <div><span>⌨️</span><p>Você <b>digita</b> a resposta, sem alternativas.</p></div>
        <div><span>💡</span><p>Peça uma <b>dica</b> se travar.</p></div>
        <div><span>⭐</span><p>Até <b>3 estrelas</b> e XP de bônus no fim.</p></div>
        <div><span>📋</span><p>No fim, <b>reveja cada questão</b>.</p></div>
      </div>`));
  }
  paint();
  wrap.appendChild(c);
  return wrap;
}
function startChallenge(difficulty, pool, total){
  pool = pool || 'all'; total = total || 10;
  const sess = {mixed:true, kind:'challenge', difficulty, pool, index:0, total, correct:0, wrong:0, results:[], log:[], checked:false, wasCorrect:null, streak:0, bestStreak:0, t0:Date.now()};
  const first = chPickSubject(sess);
  const {ex, signature} = genQuestionAvoidingRepeat(first, difficulty, null);
  Object.assign(sess, {currentSubjectId:first.id, current:ex, lastSignature:signature});
  state.session = sess;
  go('challengeSession');
}
function challengeEnd(c, sess){
  const d = chData(), key = chKey(sess.pool||'all', sess.difficulty, sess.total);
  const pct = Math.round((sess.correct/sess.total)*100);
  if(!sess.saved){
    sess.saved = true;
    d.plays++;
    const prev = d.best[key];
    sess.record = !prev || sess.correct > prev.ok;
    if(sess.record) d.best[key] = {ok:sess.correct, pct, ts:Date.now()};
    sess.prevBest = prev ? prev.ok : null;
    saveChData(d);
  }
  gameSessionEnd(c, sess.correct, sess.total, `Você acertou ${pct}% do desafio ${({facil:'fácil',medio:'médio',dificil:'difícil'})[sess.difficulty]}.`);
  const secs = Math.round(((sess.tEnd = sess.tEnd || Date.now()) - sess.t0)/1000);
  c.appendChild(h(`<div class="ch-endstats">
      ${sess.record && sess.correct>0 ? '<div class="ch-rec">🏆 Novo recorde!</div>' : sess.prevBest!==null ? `<div class="ch-rec dim">Recorde: ${Math.max(sess.prevBest, sess.correct)}/${sess.total}</div>` : ''}
      <div class="ch-es"><div><b>${sess.correct}</b><span>certas</span></div><div><b>${sess.wrong}</b><span>erradas</span></div><div><b>${sess.bestStreak||0}</b><span>maior sequência</span></div><div><b>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</b><span>tempo</span></div></div>
    </div>`));
  const actions = h(`<div class="ch-actions"></div>`);
  const wrongs = (sess.log||[]).filter(x=>!x.ok);
  const again = h(`<button class="btn primary">🔁 Novo desafio</button>`);
  again.onclick = ()=> startChallenge(sess.difficulty, sess.pool, sess.total);
  const change = h(`<button class="btn secondary">Mudar dificuldade</button>`);
  change.onclick = ()=> go('challengeDifficulty');
  actions.appendChild(again); actions.appendChild(change);
  c.appendChild(actions);
  if(sess.log && sess.log.length){
    const rev = h(`<div class="ch-review"><div class="chr-h"><b>Suas respostas</b><span>${sess.correct} de ${sess.total} certas</span></div></div>`);
    sess.log.forEach((x,i)=>{
      const row = h(`<div class="chr-row ${x.ok?'ok':'bad'}"><span class="chr-n">${x.ok?'✓':'✗'}</span><div class="chr-b"><div class="chr-s"></div><div class="chr-q"></div><div class="chr-a"></div></div></div>`);
      row.querySelector('.chr-s').textContent = `${i+1}. ${x.subj}`;
      row.querySelector('.chr-q').textContent = x.q || 'Conta armada / desenho';
      row.querySelector('.chr-a').textContent = x.ok ? `Resposta: ${x.ans}` : `Certa: ${x.ans} · você respondeu ${x.typed || '(vazio)'}`;
      if(!x.ok){ const t = h(`<button type="button" class="chr-train">Treinar</button>`); t.onclick = ()=> startSession(x.sid, sess.difficulty); row.appendChild(t); }
      rev.appendChild(row);
    });
    c.appendChild(rev);
  }
  if(wrongs.length===0 && sess.total) c.appendChild(h(`<div class="ch-perfect">✨ Nenhum erro! Que tal subir a dificuldade?</div>`));
}
function challengeSessionScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏆 Desafio', true, ()=>go('challengeDifficulty')));
  const c = h(`<div class="content"></div>`);

  if(sess.index >= sess.total){
    c.classList.add('ch-end');
    challengeEnd(c, sess);
    wrap.appendChild(c);
    return wrap;
  }

  const s = SUBJECTS.find(x=>x.id===sess.currentSubjectId);

  const dots = h(`<div class="progress-dots"></div>`);
  for(let i=0;i<sess.total;i++){
    let cls='dot';
    if(i<sess.results.length) cls += sess.results[i] ? ' ok':' bad';
    else if(i===sess.index) cls += ' now';
    dots.appendChild(h(`<span class="${cls}"></span>`));
  }
  c.appendChild(dots);
  c.appendChild(sessionHud());

  const ex = sess.current;
  c.classList.add('ch-run');
  c.appendChild(h(`<div class="ch-runhead"><span class="ch-qn">${sess.index+1}<small>/${sess.total}</small></span><span class="ch-subj">${s.sym} ${escHTML(s.name)}</span><span class="ch-diff d-${sess.difficulty}">${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[sess.difficulty]}</span></div>`));
  const qcard = h(`<div class="question-card"><div class="qtext mono"></div></div>`);
  const qtextEl = qcard.querySelector('.qtext');
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(ex.columns){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`;
  } else if(ex.visual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = fracRow(ex.visual);
  } else if(ex.qVisual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = ex.qVisual;
  } else {
    qtextEl.innerHTML = ex.question.replace(/\n/g,'<br>');
  }
  c.appendChild(qcard);

  if(!sess.checked){
    const form = h(`<div class="answer-form"></div>`);
    if(ex.type==='single'){
      form.appendChild(h(`<div><label>Resposta</label>${answerInputHTML('ans1','Digite o valor')}</div>`));
    } else if(ex.type==='pair'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x'</label>${answerInputHTML('ans1','raiz 1')}</div><div style="flex:1"><label>x''</label>${answerInputHTML('ans2','raiz 2')}</div></div>`));
    } else if(ex.type==='xy'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x</label>${answerInputHTML('ans1','valor de x')}</div><div style="flex:1"><label>y</label>${answerInputHTML('ans2','valor de y')}</div></div>`));
    }
    const btn = h(`<button class="check-btn">Corrigir</button>`);
    btn.onclick = async ()=>{
      const v1 = parseUserNumber(form.querySelector('#ans1').value);
      let correct;
      if(ex.type==='single'){
        correct = checkAnswerValue(v1, ex.answer);
      } else if(ex.type==='pair'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        const [a,b] = ex.answer;
        correct = (checkAnswerValue(v1,a)&&checkAnswerValue(v2,b)) || (checkAnswerValue(v1,b)&&checkAnswerValue(v2,a));
      } else if(ex.type==='xy'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        correct = checkAnswerValue(v1, ex.answer.x) && checkAnswerValue(v2, ex.answer.y);
      }
      sess.checked = true; sess.wasCorrect = correct;
      giveAnswerFeedback(correct);
      sess.results.push(correct);
      if(correct) sess.correct++; else sess.wrong++;
      if(sess.kind==='challenge'){
        sess.streak = correct ? (sess.streak||0)+1 : 0; sess.bestStreak = Math.max(sess.bestStreak||0, sess.streak);
        const typed = [...form.querySelectorAll('input')].map(i=>i.value.trim()).filter(Boolean).join(' · ');
        const ansTxt = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${fmt(ex.answer[0])} e x'' = ${fmt(ex.answer[1])}` : ex.type==='xy'? `x = ${fmt(ex.answer.x)} e y = ${fmt(ex.answer.y)}` : fmt(ex.answer));
        sess.log.push({ok:correct, sid:sess.currentSubjectId, subj:`${s.sym} ${s.name}`, q:String(ex.question||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90), ans:ansTxt, typed});
      }
      await recordAnswer(sess.currentSubjectId, correct, {difficulty: sess.difficulty, ex});
      render();
    };
    { const tip = firstTimeTip('typed', 'Digite a resposta e toque em <b>Corrigir</b>. Use vírgula pra decimais (2,5) e o botão <b>/</b> pra frações (3/4).'); if(tip) form.prepend(tip); }
    renderHintButton(form, sess.currentSubjectId);
    form.appendChild(btn);
    c.appendChild(form);
    wireSlashButtons(form);
  } else {
    const correct = sess.wasCorrect;
    const fb = h(`<div class="feedback ${correct?'correct':'wrong'}"><div class="fb-title">${correct? cheerLine() : '✕ Quase! Veja como resolver:'}</div><div class="fb-explain"></div></div>`);
    let stepsList = ex.steps;
    if(ex.columns){
      stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
    } else if(ex.visual){
      const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
      const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
      const visualWithResult = ex.visual.slice(0, -2).concat(['=', ansToken]);
      stepsList = [fracRow(visualWithResult), ...ex.steps];
    } else if(ex.solvedVisual){
      stepsList = [ex.solvedVisual, ...ex.steps];
    }
    const stepsHtml = stepsList.map(st=>`<div class="step">${st}</div>`).join('');
    const finalTxt = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${ex.answer[0]}  e  x'' = ${ex.answer[1]}` : ex.type==='xy'? `x = ${ex.answer.x}  e  y = ${ex.answer.y}` : fmt(ex.answer));
    fb.querySelector('.fb-explain').innerHTML = stepsHtml + `<div class="step" style="margin-top:8px"><b>Resposta: ${finalTxt}</b></div>`;
    c.appendChild(fb);
    if(!correct) renderDrillButton(c, sess.currentSubjectId, sess.difficulty);
    const nextBtn = h(`<button class="next-btn">${sess.index+1<sess.total? 'Próxima questão':'Ver resultado'}</button>`);
    nextBtn.onclick = ()=>{
      sess.index++;
      sess.checked=false; sess.wasCorrect=null;
      if(sess.index < sess.total){
        const nextSubject = chPickSubject(sess);
        const {ex, signature} = genQuestionAvoidingRepeat(nextSubject, sess.difficulty, sess.lastSignature);
        sess.currentSubjectId = nextSubject.id;
        sess.current = ex;
        sess.lastSignature = signature;
      }
      render();
    };
    c.appendChild(nextBtn);
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- TREINO PERSONALIZADO (gerador de exercícios sob medida, todos os assuntos) ---------------- */
const PERSONALIZED_QTY_OPTIONS = [5,10,15,20,30];
const PTRAIN_KEY_BASE = 'mathstudy-ptrain-v1'; // últimas escolhas do treino, por conta
const PT_DIFFS = ['facil','medio','dificil'];
const PT_DIFF_MODES = [['adaptativa','Adaptativa'],['facil','Fácil'],['medio','Médio'],['dificil','Difícil'],['misturada','Misturada']];
const PT_WEAK_LIMIT = 0.7; // abaixo disso (em % de acerto) o assunto conta como ponto fraco

function accuracyFor(progress, subjectId){
  const d = progress[subjectId];
  if(!d || !d.attempted) return null; // ainda sem dados nesse assunto
  return d.correct/d.attempted;
}

/* escolhe a dificuldade certa pra um assunto no modo "adaptativa", com base no desempenho do aluno nele */
function adaptiveDifficultyFor(progress, subjectId){
  const acc = accuracyFor(progress, subjectId);
  if(acc===null) return 'medio'; // assunto novo: começa no meio
  if(acc < 0.5) return 'facil';
  if(acc < 0.8) return 'medio';
  return 'dificil';
}

function pickWeighted(items, weights){
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<items.length;i++){
    r -= weights[i];
    if(r<=0) return items[i];
  }
  return items[items.length-1];
}

/* último treino montado, pra já abrir a tela com as mesmas escolhas */
function loadLastTraining(){
  try{ const raw = localStorage.getItem(`${PTRAIN_KEY_BASE}:${currentUserId()}`); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function saveLastTraining(cfg){
  try{ localStorage.setItem(`${PTRAIN_KEY_BASE}:${currentUserId()}`, JSON.stringify({subjectIds:cfg.subjectIds, difficultyMode:cfg.difficultyMode, qty:cfg.qty, focusWeak:cfg.focusWeak})); }catch(e){}
}
function weakSubjectIds(progress){
  return SUBJECTS.filter(s=>{ const a = accuracyFor(progress, s.id); return a!==null && a < PT_WEAK_LIMIT; }).map(s=>s.id);
}
function accBadgeHTML(acc){
  if(acc===null) return `<span class="acc-badge new">novo</span>`;
  const cls = acc>=0.8 ? 'hi' : acc>=0.5 ? 'mid' : 'low';
  return `<span class="acc-badge ${cls}">${Math.round(acc*100)}%</span>`;
}

/* sorteia o próximo assunto.
   - normal: "saco embaralhado" — todos os assuntos escolhidos aparecem de forma equilibrada
   - focusWeak: assuntos com pior desempenho (ou nunca praticados) saem mais
   em ambos, evita repetir o mesmo assunto duas vezes seguidas quando há mais de um */
function pickSubjectForSession(sess){
  const subjects = sess.subjects;
  if(subjects.length<=1) return subjects[0];
  const last = sess.currentSubjectId;
  if(!sess.config.focusWeak){
    if(!sess.bag || !sess.bag.length){
      sess.bag = shuffle(subjects.map(x=>x.id));
      if(sess.bag[sess.bag.length-1]===last) sess.bag.unshift(sess.bag.pop()); // não começa o saco novo repetindo
    }
    const id = sess.bag.pop();
    return subjects.find(x=>x.id===id);
  }
  const progress = sess.config.progress;
  const pool = subjects.filter(x=>x.id!==last);
  const weights = pool.map(x=>{
    const acc = accuracyFor(progress, x.id);
    if(acc===null) return 2; // nunca praticado: peso médio-alto, pra incentivar a tentar
    return 1 + (1-acc)*3; // 100% acerto -> peso 1 · 0% acerto -> peso 4
  });
  return pickWeighted(pool, weights);
}

/* dificuldade da próxima questão. No modo adaptativo, cada assunto começa pelo desempenho
   histórico e se ajusta durante o treino: 2 acertos seguidos sobem um nível, 1 erro desce. */
function pickDifficultyForSubject(sess, subjectId){
  const mode = sess.config.difficultyMode;
  if(PT_DIFFS.includes(mode)) return mode;
  if(mode==='misturada') return pick(PT_DIFFS);
  sess.lvl = sess.lvl || {};
  if(!(subjectId in sess.lvl)) sess.lvl[subjectId] = {i: PT_DIFFS.indexOf(adaptiveDifficultyFor(sess.config.progress, subjectId)), run:0};
  return PT_DIFFS[sess.lvl[subjectId].i];
}
function ptAfterAnswer(sess, correct){
  sess.log = sess.log || [];
  sess.log.push({sid: sess.currentSubjectId, diff: sess.difficulty, ok: correct});
  sess.lvlMsg = '';
  if(sess.config.difficultyMode!=='adaptativa' || !sess.lvl) return;
  const L = sess.lvl[sess.currentSubjectId];
  if(!L) return;
  if(correct){
    L.run++;
    if(L.run>=2 && L.i<2){ L.i++; L.run=0; L.up = true; }
  } else {
    L.run = 0;
    if(L.i>0){ L.i--; L.down = true; }
  }
}
function ptNextQuestion(sess){
  const subject = pickSubjectForSession(sess);
  const difficulty = pickDifficultyForSubject(sess, subject.id);
  const L2 = sess.lvl && sess.lvl[subject.id];
  sess.lvlMsg = '';
  if(L2 && L2.up){ sess.lvlMsg = '⬆ subiu'; L2.up = false; }
  else if(L2 && L2.down){ sess.lvlMsg = '⬇ mais leve'; L2.down = false; }
  const {ex, signature} = genQuestionAvoidingRepeat(subject, difficulty, sess.lastSignature);
  sess.currentSubjectId = subject.id;
  sess.difficulty = difficulty;
  sess.current = ex;
  sess.lastSignature = signature;
}

/* "assinatura" de uma questão gerada — serve pra comparar se duas questões são idênticas
   (mesmo enunciado/números), não só do mesmo assunto/dificuldade */
function questionSignature(ex){
  try{ return JSON.stringify(ex); }catch(e){ return String(Math.random()); }
}
/* gera uma questão de [subject/difficulty] tentando não repetir a última pergunta exata.
   como os geradores são aleatórios, às vezes sorteiam os mesmos números de novo — aqui a
   gente tenta de novo (até um limite) até sair algo diferente do que apareceu por último. */
function genQuestionAvoidingRepeat(subject, difficulty, lastSignature){
  let ex, sig;
  let attempts = 0;
  do{
    ex = subject.gen[difficulty]();
    sig = questionSignature(ex);
    attempts++;
  } while(sig === lastSignature && attempts < 8);
  return {ex, signature: sig};
}

const PT_DIFF_INFO = {adaptativa:['🧠','Ajusta sozinha'], facil:['🟢','Pra aquecer'], medio:['🟡','O desafio certo'], dificil:['🔴','Pra quem é fera'], misturada:['🎲','Sorteia as três']};
async function personalizedSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Treino personalizado', true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content pt-setup"></div>`);

  const progress = await loadProgress();
  const settings = await loadSettings();
  const last = loadLastTraining();
  const validIds = new Set(SUBJECTS.map(s=>s.id));
  const lastIds = last && Array.isArray(last.subjectIds) ? last.subjectIds.filter(id=>validIds.has(id)) : [];
  const levelIds = settings.schoolLevel ? LEVEL_SUBJECTS[settings.schoolLevel] : null;
  const selected = new Set(lastIds.length ? lastIds : (levelIds || SUBJECTS.map(s=>s.id)));
  let difficultyMode = last && PT_DIFF_MODES.some(([id])=>id===last.difficultyMode) ? last.difficultyMode : 'adaptativa';
  let qty = last && PERSONALIZED_QTY_OPTIONS.includes(last.qty) ? last.qty : 10;
  let focusWeak = !!(last && last.focusWeak);
  const weakIds = weakSubjectIds(progress);
  const practiced = SUBJECTS.filter(s=> accuracyFor(progress, s.id)!==null);
  const tot = practiced.reduce((a,s)=>({ok:a.ok+progress[s.id].correct, n:a.n+progress[s.id].attempted}), {ok:0,n:0});
  let subjOpen = false;

  c.appendChild(h(`<div class="pt-hero">
      <div class="pth-top"><div class="pth-ico">🎯</div><div><h2>Treino personalizado</h2><p>Monte um treino sob medida: assuntos, dificuldade e quantas questões.${lastIds.length ? ' As escolhas do último treino já estão marcadas.' : ''}</p></div></div>
      <div class="pth-stats"><div><b>${practiced.length}</b><span>assuntos praticados</span></div><div><b>${tot.n ? Math.round(tot.ok/tot.n*100)+'%' : '—'}</b><span>acerto geral</span></div><div><b>${weakIds.length}</b><span>pontos fracos</span></div></div>
    </div>`));

  const body = h(`<div></div>`); c.appendChild(body);
  const sec = t=> h(`<div class="ch-lbl">${t}</div>`);
  function quick(){
    const box = h(`<div class="pt-quick"></div>`);
    const items = [];
    if(weakIds.length) items.push(['💪','Pontos fracos',`${weakIds.length} assunto${weakIds.length===1?'':'s'} abaixo de 70%`, ()=>{ selected.clear(); weakIds.forEach(id=>selected.add(id)); focusWeak = weakIds.length>1; difficultyMode = 'adaptativa'; }]);
    if(levelIds) items.push(['🎒','Meu nível', ({fund1:'Fundamental 1', fund2:'Fundamental 2', medio:'Ensino Médio'})[settings.schoolLevel], ()=>{ selected.clear(); levelIds.forEach(id=>selected.add(id)); }]);
    items.push(['🎲','Surpresa','5 assuntos sorteados', ()=>{ selected.clear(); shuffle(SUBJECTS.map(x=>x.id)).slice(0,5).forEach(id=>selected.add(id)); difficultyMode = 'misturada'; }]);
    items.push(['🌎','Tudo','todos os assuntos', ()=>{ SUBJECTS.forEach(x=>selected.add(x.id)); }]);
    items.forEach(([ico,t,d,fn])=>{
      const b = h(`<button type="button" class="pt-q"><span class="i">${ico}</span><b>${t}</b><small>${d}</small></button>`);
      b.onclick = ()=>{ fn(); paint(); };
      box.appendChild(b);
    });
    return box;
  }
  const errorBox = h(`<div class="authErrorBox"></div>`);
  const genBtn = h(`<button class="btn primary pt-go"></button>`);
  function paint(){
    body.innerHTML = '';
    body.appendChild(sec('Atalhos'));
    body.appendChild(quick());
    body.appendChild(sec('Assuntos'));
    const sb = h(`<button type="button" class="ex-subj-btn pt-subj-btn ${subjOpen?'open':''}"><span>📚 <b>${selected.size}</b> de ${SUBJECTS.length} assuntos escolhidos</span><i>${subjOpen?'Fechar ▲':'Escolher ▼'}</i></button>`);
    sb.onclick = ()=>{ subjOpen = !subjOpen; paint(); };
    body.appendChild(sb);
    if(selected.size && !subjOpen){
      const names = SUBJECTS.filter(x=>selected.has(x.id)).map(x=>`${x.sym} ${escHTML(x.name)}`);
      body.appendChild(h(`<div class="pt-picked">${names.slice(0,6).map(n=>`<span>${n}</span>`).join('')}${names.length>6?`<span class="more">+${names.length-6}</span>`:''}</div>`));
    }
    if(subjOpen){
      const box = h(`<div class="ex-subjs"></div>`);
      SUBJECT_GROUPS.forEach(g=>{
        const ids = g.ids.filter(id=> validIds.has(id));
        if(!ids.length) return;
        const all = ids.every(id=> selected.has(id));
        const gh = h(`<div class="ex-sg"><div class="ex-sg-h"><b>${g.level==='em'?'🎓':'📘'} ${g.name}</b><button type="button">${all?'Tirar todos':'Todos'}</button></div><div class="ex-chips small"></div></div>`);
        gh.querySelector('button').onclick = ()=>{ ids.forEach(id=> all ? selected.delete(id) : selected.add(id)); paint(); };
        const row = gh.querySelector('.ex-chips');
        ids.forEach(id=>{
          const s0 = SUBJECTS.find(x=>x.id===id);
          const b = h(`<button type="button" class="ex-chip ${selected.has(id)?'on':''}">${s0.sym} ${escHTML(s0.name)} ${accBadgeHTML(accuracyFor(progress, id))}</button>`);
          b.onclick = ()=>{ if(selected.has(id)) selected.delete(id); else selected.add(id); paint(); };
          row.appendChild(b);
        });
        box.appendChild(gh);
      });
      box.appendChild(h(`<p class="pt-tip">O selo mostra seu % de acerto em cada assunto.</p>`));
      body.appendChild(box);
    }
    body.appendChild(sec('Dificuldade'));
    const dg = h(`<div class="pt-diffs"></div>`);
    PT_DIFF_MODES.forEach(([id,label])=>{
      const [ico, desc] = PT_DIFF_INFO[id];
      const b = h(`<button type="button" class="pt-diff ${id===difficultyMode?'on':''} ${id==='adaptativa'?'wide':''}"><span class="i">${ico}</span><span class="t"><b>${label}</b><small>${desc}</small></span>${id==='adaptativa'?'<span class="rec">Recomendado</span>':''}</button>`);
      b.onclick = ()=>{ difficultyMode = id; paint(); };
      dg.appendChild(b);
    });
    body.appendChild(dg);
    if(difficultyMode==='adaptativa') body.appendChild(h(`<p class="pt-tip">Começa pelo seu desempenho em cada assunto. 2 acertos seguidos sobem o nível; um erro desce.</p>`));
    body.appendChild(sec('Quantidade de questões'));
    const qr = h(`<div class="pt-qty"></div>`);
    PERSONALIZED_QTY_OPTIONS.forEach(n=>{
      const b = h(`<button type="button" class="ch-size ${n===qty?'on':''}">${n}</button>`);
      b.onclick = ()=>{ qty = n; paint(); };
      qr.appendChild(b);
    });
    body.appendChild(qr);
    const wt = h(`<button type="button" class="pt-switch ${focusWeak?'on':''}"><span class="sw"></span><span class="t"><b>Priorizar meus pontos fracos</b><small>Mais questões nos assuntos onde você mais erra</small></span></button>`);
    wt.onclick = ()=>{ focusWeak = !focusWeak; paint(); };
    body.appendChild(wt);
    const n = selected.size;
    const modeLabel = PT_DIFF_MODES.find(([id])=>id===difficultyMode)[1];
    body.appendChild(h(`<div class="ex-summary pt-sum">
        <div><b>${n}</b><span>assunto${n===1?'':'s'}</span></div>
        <div><b>${qty}</b><span>questões</span></div>
        <div><b>${modeLabel}</b><span>dificuldade</span></div>
        <div><b>~${Math.max(1, Math.round(qty*0.6))} min</b><span>duração</span></div>
      </div>`));
    body.appendChild(errorBox);
    genBtn.textContent = n ? `Começar treino ▶` : 'Escolha pelo menos um assunto';
    genBtn.disabled = n===0;
    body.appendChild(genBtn);
  }
  genBtn.onclick = ()=>{
    if(selected.size===0){ errorBox.innerHTML = `<div class="auth-error">Escolha pelo menos um assunto.</div>`; return; }
    startPersonalizedSession({subjectIds: SUBJECTS.map(s=>s.id).filter(id=>selected.has(id)), difficultyMode, qty, focusWeak, progress});
  };
  paint();
  wrap.appendChild(c);
  return wrap;
}

function startPersonalizedSession(config){
  if(!config.isReview) saveLastTraining(config);
  const subjects = SUBJECTS.filter(s=>config.subjectIds.includes(s.id));
  state.session = {
    config, subjects,
    difficulty: null, // dificuldade da questão atual (pode mudar a cada questão)
    currentSubjectId: null,
    lastSignature: null, // assinatura da questão atual, pra evitar repetir ela na próxima
    index:0, total: config.qty,
    correct:0, wrong:0, results:[], log:[], checked:false, wasCorrect:null,
    current: null,
  };
  ptNextQuestion(state.session);
  go('personalizedSession');
}

/* resumo por assunto no fim do treino */
function ptBreakdown(sess){
  const by = {};
  (sess.log||[]).forEach(r=>{ const b = by[r.sid] = by[r.sid] || {ok:0, n:0}; b.n++; if(r.ok) b.ok++; });
  const box = h(`<div class="pt-breakdown"><h3>Seu desempenho por assunto</h3></div>`);
  sess.subjects.filter(s=>by[s.id]).sort((a,b)=>(by[a.id].ok/by[a.id].n)-(by[b.id].ok/by[b.id].n)).forEach(s=>{
    const b = by[s.id], pct = Math.round(b.ok/b.n*100);
    const cls = pct>=80 ? '' : pct>=50 ? 'mid' : 'low';
    box.appendChild(h(`<div class="mastery-row"><div class="top"><span class="name">${s.sym} ${s.name}</span><span class="pct">${b.ok}/${b.n}</span></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div></div>`));
  });
  return {box, missedIds: sess.subjects.filter(s=>by[s.id] && by[s.id].ok<by[s.id].n).map(s=>s.id)};
}

function personalizedSessionScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  // sair no meio do treino pede confirmação, pra não perder o progresso sem querer
  wrap.appendChild(topbar(sess.config.isReview ? '🧠 Revisão do dia' : '🎯 Treino personalizado', true, ()=>{
    if(sess.index>0 && sess.index<sess.total){
      showConfirm({icon:'🎯', title:'Sair do treino?', message:`Você já respondeu ${sess.index} de ${sess.total} questões. Os acertos ficam salvos, mas o treino não termina.`, ok:'Sair', cancel:'Continuar'})
        .then(ok=>{ if(ok) go('personalizedSetup'); });
    } else go('personalizedSetup');
  }));
  const c = h(`<div class="content"></div>`);

  if(sess.index >= sess.total){
    const pct = Math.round((sess.correct/sess.total)*100);
    gameSessionEnd(c, sess.correct, sess.total, sess.config.isReview ? `Você acertou ${pct}% da revisão. Os assuntos voltam pra revisão no tempo certo pra fixar de vez.` : `Você acertou ${pct}% do seu treino personalizado.`);
    const {box, missedIds} = ptBreakdown(sess);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    if(missedIds.length){
      const fix = h(`<button class="btn primary" style="flex:1 1 100%">🔁 Treinar o que errei (${missedIds.length} assunto${missedIds.length===1?'':'s'})</button>`);
      fix.onclick = async ()=> startPersonalizedSession(Object.assign({}, sess.config, {
        subjectIds: missedIds, focusWeak: missedIds.length>1, qty: Math.min(sess.config.qty, 10), progress: await loadProgress(),
      }));
      actions.appendChild(fix);
    }
    const again = h(`<button class="btn ${missedIds.length?'secondary':'primary'}">Repetir treino</button>`);
    again.onclick = async ()=> startPersonalizedSession(Object.assign({}, sess.config, {progress: await loadProgress()}));
    const setup = h(`<button class="btn secondary">Novo treino</button>`);
    setup.onclick = ()=>go('personalizedSetup');
    const home = h(`<button class="btn secondary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(again); actions.appendChild(setup); actions.appendChild(home);
    actions.className = 'pt-actions';
    c.classList.add('pt-end');
    c.appendChild(actions);
    c.appendChild(box);
    const lg = (sess.log||[]).filter(x=>x.ans!==undefined);
    if(lg.length){
      const rev = h(`<div class="ch-review"><div class="chr-h"><b>Suas respostas</b><span>${sess.correct} de ${sess.total} certas</span></div></div>`);
      lg.forEach((x,i)=>{
        const s0 = SUBJECTS.find(y=>y.id===x.sid);
        const row = h(`<div class="chr-row ${x.ok?'ok':'bad'}"><span class="chr-n">${x.ok?'✓':'✗'}</span><div class="chr-b"><div class="chr-s"></div><div class="chr-q"></div><div class="chr-a"></div></div></div>`);
        row.querySelector('.chr-s').textContent = `${i+1}. ${s0 ? s0.sym+' '+s0.name : ''} · ${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[x.diff]||''}`;
        row.querySelector('.chr-q').textContent = x.q || 'Conta armada / desenho';
        row.querySelector('.chr-a').textContent = x.ok ? `Resposta: ${x.ans}` : `Certa: ${x.ans} · você respondeu ${x.typed || '(vazio)'}`;
        rev.appendChild(row);
      });
      c.appendChild(rev);
    }
    wrap.appendChild(c);
    return wrap;
  }

  const s = SUBJECTS.find(x=>x.id===sess.currentSubjectId);

  const dots = h(`<div class="progress-dots"></div>`);
  for(let i=0;i<sess.total;i++){
    let cls='dot';
    if(i<sess.results.length) cls += sess.results[i] ? ' ok':' bad';
    else if(i===sess.index) cls += ' now';
    dots.appendChild(h(`<span class="${cls}"></span>`));
  }
  c.appendChild(dots);
  c.appendChild(sessionHud());

  const ex = sess.current;
  c.classList.add('pt-run');
  c.appendChild(h(`<div class="ch-runhead"><span class="ch-qn">${sess.index+1}<small>/${sess.total}</small></span><span class="ch-subj">${s.sym} ${escHTML(s.name)}</span><span class="ch-diff d-${sess.difficulty}">${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[sess.difficulty]||''}</span>${sess.lvlMsg?`<span class="pt-lvl">${sess.lvlMsg}</span>`:''}</div>`));
  const qcard = h(`<div class="question-card"><div class="qtext mono"></div></div>`);
  const qtextEl = qcard.querySelector('.qtext');
  addSpeakButton(qcard, ex); addScratchButton(qcard, ex);
  if(ex.columns){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`;
  } else if(ex.visual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = fracRow(ex.visual);
  } else if(ex.qVisual){
    qtextEl.classList.add('stacked');
    qtextEl.innerHTML = ex.qVisual;
  } else {
    qtextEl.innerHTML = ex.question.replace(/\n/g,'<br>');
  }
  c.appendChild(qcard);

  if(!sess.checked){
    const form = h(`<div class="answer-form"></div>`);
    if(ex.type==='single'){
      form.appendChild(h(`<div><label>Resposta</label>${answerInputHTML('ans1','Digite o valor')}</div>`));
    } else if(ex.type==='pair'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x'</label>${answerInputHTML('ans1','raiz 1')}</div><div style="flex:1"><label>x''</label>${answerInputHTML('ans2','raiz 2')}</div></div>`));
    } else if(ex.type==='xy'){
      form.appendChild(h(`<div class="pair-row"><div style="flex:1"><label>x</label>${answerInputHTML('ans1','valor de x')}</div><div style="flex:1"><label>y</label>${answerInputHTML('ans2','valor de y')}</div></div>`));
    }
    const btn = h(`<button class="check-btn">Corrigir</button>`);
    btn.onclick = async ()=>{
      const v1 = parseUserNumber(form.querySelector('#ans1').value);
      let correct;
      if(ex.type==='single'){
        correct = checkAnswerValue(v1, ex.answer);
      } else if(ex.type==='pair'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        const [a,b] = ex.answer;
        correct = (checkAnswerValue(v1,a)&&checkAnswerValue(v2,b)) || (checkAnswerValue(v1,b)&&checkAnswerValue(v2,a));
      } else if(ex.type==='xy'){
        const v2 = parseUserNumber(form.querySelector('#ans2').value);
        correct = checkAnswerValue(v1, ex.answer.x) && checkAnswerValue(v2, ex.answer.y);
      }
      sess.checked = true; sess.wasCorrect = correct;
      giveAnswerFeedback(correct);
      sess.results.push(correct);
      if(correct) sess.correct++; else sess.wrong++;
      ptAfterAnswer(sess, correct);
      { const L = sess.log[sess.log.length-1];
        L.typed = [...form.querySelectorAll('input')].map(i=>i.value.trim()).filter(Boolean).join(' · ');
        L.q = String(ex.question||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90);
        L.ans = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${fmt(ex.answer[0])} e x'' = ${fmt(ex.answer[1])}` : ex.type==='xy'? `x = ${fmt(ex.answer.x)} e y = ${fmt(ex.answer.y)}` : fmt(ex.answer)); }
      await recordAnswer(sess.currentSubjectId, correct, {difficulty: sess.difficulty, ex});
      sess.config.progress = await loadProgress(); // atualiza pra próxima questão já considerar essa resposta
      render();
    };
    { const tip = firstTimeTip('typed', 'Digite a resposta e toque em <b>Corrigir</b>. Use vírgula pra decimais (2,5) e o botão <b>/</b> pra frações (3/4).'); if(tip) form.prepend(tip); }
    renderHintButton(form, sess.currentSubjectId);
    form.appendChild(btn);
    c.appendChild(form);
    wireSlashButtons(form);
  } else {
    const correct = sess.wasCorrect;
    const fb = h(`<div class="feedback ${correct?'correct':'wrong'}"><div class="fb-title">${correct? cheerLine() : '✕ Quase! Veja como resolver:'}</div><div class="fb-explain"></div></div>`);
    let stepsList = ex.steps;
    if(ex.columns){
      stepsList = [contaArmada(ex.columns.nums, ex.columns.op, fmt(ex.answer), ex.columns.carries, ex.columns.marks), ...ex.steps];
    } else if(ex.visual){
      const [ansN, ansD] = String(ex.displayAnswer).includes('/') ? ex.displayAnswer.split('/') : [ex.displayAnswer, null];
      const ansToken = ansD ? {n:ansN, d:ansD} : ex.displayAnswer;
      const visualWithResult = ex.visual.slice(0, -2).concat(['=', ansToken]);
      stepsList = [fracRow(visualWithResult), ...ex.steps];
    } else if(ex.solvedVisual){
      stepsList = [ex.solvedVisual, ...ex.steps];
    }
    const stepsHtml = stepsList.map(st=>`<div class="step">${st}</div>`).join('');
    const finalTxt = ex.displayAnswer ? ex.displayAnswer : (ex.type==='pair'? `x' = ${ex.answer[0]}  e  x'' = ${ex.answer[1]}` : ex.type==='xy'? `x = ${ex.answer.x}  e  y = ${ex.answer.y}` : fmt(ex.answer));
    fb.querySelector('.fb-explain').innerHTML = stepsHtml + `<div class="step" style="margin-top:8px"><b>Resposta: ${finalTxt}</b></div>`;
    c.appendChild(fb);
    if(!correct) renderDrillButton(c, sess.currentSubjectId, sess.difficulty);
    const nextBtn = h(`<button class="next-btn">${sess.index+1<sess.total? 'Próxima questão':'Ver resultado'}</button>`);
    nextBtn.onclick = ()=>{
      sess.index++;
      sess.checked=false; sess.wasCorrect=null;
      if(sess.index < sess.total) ptNextQuestion(sess);
      render();
    };
    c.appendChild(nextBtn);
  }

  wrap.appendChild(c);
  return wrap;
}
