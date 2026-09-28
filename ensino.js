/* =========================================================
   Matemática Show — ENSINO
   O "cérebro" pedagógico do app:
   - habilidades de cada assunto e o domínio de cada uma (🟢 🟡 🔴), calculado das respostas reais
   - trilha de aprendizagem: ordem dos assuntos e as etapas de cada um
     (Aprender → Exemplos → Praticar → Revisar → Dominar)
   - prática de hoje e "não sei o que estudar", a partir do progresso real
   - explicação em 5 partes (o que a questão pede, informações, operação, resolvendo, conferindo)
   - "Não entendi": explicação mais simples de cada assunto
   Só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

/* ---------- habilidades (subtemas) de cada assunto ----------
   Cada questão é classificada por uma regra simples sobre o próprio enunciado
   (ou pela dificuldade, quando cada nível pratica uma habilidade diferente). */
const SKILLS = {
  adicao:        {facil:'Somas simples', medio:'Somas com "vai um"', dificil:'Somar três números'},
  subtracao:     {facil:'Subtrações simples', medio:'Subtração com empréstimo', dificil:'Subtração com números grandes'},
  multiplicacao: {facil:'Tabuada', medio:'Multiplicar por um algarismo', dificil:'Multiplicar por dois algarismos'},
  divisao:       {facil:'Divisão exata (tabuada)', medio:'Divisão com números maiores', dificil:'Divisão com resultado decimal'},
  dinheiro:      {rules:[[/troco/i,'Calcular troco'],[/cada um|igualmente/i,'Dividir a conta'],[/juntos/i,'Somar preços']], other:'Compras com várias unidades'},
  fracoes:       {rules:[[/÷/,'Divisão de frações'],[/×/,'Multiplicação de frações'],[q=>fracSameDen(q),'Frações com o mesmo denominador'],[/[+−-]/,'Frações com denominadores diferentes']], other:'Frações'},
  decimais:      {rules:[[/×/,'Multiplicação de decimais'],[/−|-/,'Subtração de decimais'],[/\+/,'Adição de decimais']], other:'Decimais'},
  porcentagem:   {rules:[[/aumento|desconto/i,'Aumentos e descontos'],[/^(10|20|25|50)%/,'Porcentagens simples']], other:'Porcentagem de um número'},
  geometria:     {rules:[[/perímetro/i,'Perímetro'],[/círculo/i,'Área do círculo'],[/qual é a altura|qual é a base/i,'Achar uma medida pela área'],[/área/i,'Área de figuras']], other:'Geometria'},
  mmcmdc:        {rules:[[/^MMC/,'MMC'],[/^MDC/,'MDC']], other:'Problemas de MMC e MDC'},
  potenciacao:   {rules:[[/√/,'Raiz quadrada'],[/³/,'Cubo'],[/²/,'Quadrado']], other:'Potências'},
  expressoes:    {facil:'Ordem das operações', medio:'Parênteses', dificil:'Potência dentro da expressão'},
  estatistica:   {rules:[[/média/i,'Média'],[/mediana/i,'Mediana'],[/moda/i,'Moda']], other:'Estatística'},
  regra3:        {rules:[[/inversa/i,'Regra de três inversa']], other:'Regra de três direta'},
  eq1:           {facil:'Equação simples', medio:'Com números negativos', dificil:'x dos dois lados'},
  sistemas:      {facil:'Sistema simples', medio:'Coeficientes diferentes', dificil:'Multiplicar antes de somar'},
  eq2:           {facil:'Com a = 1', medio:'Com a diferente de 1', dificil:'Bhaskara completa'},
  func1grau:     {rules:[[/Calcule f\(/,'Calcular f(x)'],[/raiz/i,'Raiz da função']], other:'Função do 1º grau'},
};
function fracSameDen(q){ const m = /(\d+)\/(\d+)\s*[+−-]\s*(\d+)\/(\d+)/.exec(q); return !!(m && m[2]===m[4]); }
function skillOf(subjectId, ex, difficulty){
  const def = SKILLS[subjectId]; if(!def || !ex) return null;
  const q = String(ex.question||'');
  if(def.rules){ for(const [r,label] of def.rules){ if(typeof r==='function' ? r(q) : r.test(q)) return label; } return def.other; }
  return def[difficulty] || null;
}
/* ordem de aprendizagem das habilidades que os geradores realmente produzem
   (conferido gerando 900 questões de cada assunto) */
const SKILL_ORDER = {
  dinheiro:['Somar preços','Calcular troco','Dividir a conta'],
  fracoes:['Frações com o mesmo denominador','Frações com denominadores diferentes','Multiplicação de frações'],
  decimais:['Adição de decimais','Subtração de decimais','Multiplicação de decimais'],
  porcentagem:['Porcentagens simples','Porcentagem de um número','Aumentos e descontos'],
  geometria:['Perímetro','Área de figuras','Área do círculo','Achar uma medida pela área'],
  mmcmdc:['MMC','MDC','Problemas de MMC e MDC'],
  potenciacao:['Quadrado','Cubo','Raiz quadrada'],
  estatistica:['Média','Mediana','Moda'],
  regra3:['Regra de três direta','Regra de três inversa'],
  func1grau:['Calcular f(x)','Raiz da função'],
};
function skillOrder(subjectId){
  const def = SKILLS[subjectId]; if(!def) return [];
  return SKILL_ORDER[subjectId] || (def.rules ? def.rules.map(r=>r[1]) : [def.facil, def.medio, def.dificil]);
}
/* estado de uma habilidade (não depende só de cor: sempre tem texto e símbolo) */
function skillState(n, ok){
  if(!n) return {key:'none', ico:'○', name:'Ainda não praticado'};
  const acc = ok/n;
  if(n >= 4 && acc >= .85) return {key:'good', ico:'🟢', name:'Dominado'};
  if(n < 3) return {key:'start', ico:'🟡', name:'Começando'};
  if(acc >= .6) return {key:'mid', ico:'🟡', name:'Em aprendizado'};
  return {key:'bad', ico:'🔴', name:'Precisa praticar'};
}
/* domínio de cada habilidade a partir do histórico (as 300 últimas respostas guardadas) */
function skillMastery(hist, subjectId){
  const map = {};
  skillOrder(subjectId).forEach(l=> map[l] = {n:0, ok:0});
  (hist||[]).forEach(e=>{
    if(e.subjectId!==subjectId || !e.ex) return;
    const sk = skillOf(subjectId, e.ex, e.difficulty); if(!sk) return;
    const m = map[sk] = map[sk] || {n:0, ok:0};
    if(m.n < 10){ m.n++; if(e.correct) m.ok++; } // últimas 10 de cada habilidade (o histórico vem do mais novo pro mais antigo)
  });
  return Object.entries(map).map(([name, m])=>({name, n:m.n, ok:m.ok, state:skillState(m.n, m.ok)}));
}

/* ---------- trilha de aprendizagem ---------- */
const PATH_STEPS = [
  {id:'learn',    name:'Aprender'},
  {id:'examples', name:'Exemplos'},
  {id:'practice', name:'Praticar'},
  {id:'review',   name:'Revisar'},
  {id:'master',   name:'Dominar'},
];
/* etapas de um assunto, olhando o que o aluno já fez de verdade */
function pathStages(subjectId, progress, errs){
  const s = SUBJECTS.find(x=>x.id===subjectId); if(!s) return null;
  const tops = subjectTopics(s), read = (studyRead()[subjectId]||[]);
  const concept = tops.filter(t=>t.kind==='concept'), exs = tops.filter(t=>t.kind==='example');
  const d = (progress||{})[subjectId] || {attempted:0, correct:0};
  const m = masteryOf(d);
  const pendingErrs = (errs||[]).filter(e=>e.subjectId===subjectId).length;
  const done = {
    learn: concept.every(t=>read.includes(t.id)),
    examples: exs.every(t=>read.includes(t.id)),
    practice: (d.attempted||0) >= 5,
    review: (d.attempted||0) >= 5 && pendingErrs === 0,
    master: m.lvl >= 3,
  };
  const current = PATH_STEPS.find(st=>!done[st.id]) || null;
  const nDone = PATH_STEPS.filter(st=>done[st.id]).length;
  return {done, current, nDone, pct:Math.round(nDone/PATH_STEPS.length*100), pendingErrs, mastery:m,
    readConcept:concept.filter(t=>read.includes(t.id)).length, nConcept:concept.length,
    readEx:exs.filter(t=>read.includes(t.id)).length, nEx:exs.length};
}
/* o próximo passo concreto dentro do assunto */
function pathNextAction(subjectId, st){
  const s = SUBJECTS.find(x=>x.id===subjectId);
  if(!st || !st.current) return {label:'Praticar para manter', sub:'Você concluiu todas as etapas deste assunto.', go:()=> startSession(subjectId, 'dificil')};
  const tops = subjectTopics(s), read = studyRead()[subjectId]||[];
  const next = kind=> tops.find(t=>t.kind===kind && !read.includes(t.id));
  switch(st.current.id){
    case 'learn': { const t = next('concept'); return {label:'Continuar aprendendo', sub:`Lição ${st.readConcept+1} de ${st.nConcept}: ${t.title}`, go:()=> go('subjectDetail', {subjectId, topicId:t.id})}; }
    case 'examples': { const t = next('example'); return {label:'Ver o próximo exemplo', sub:`Exemplo resolvido ${st.readEx+1} de ${st.nEx}${/^Exemplo \d/.test(t.title) ? '' : ': '+t.title}`, go:()=> go('subjectDetail', {subjectId, topicId:t.id})}; }
    case 'practice': return {label:'Praticar', sub:'Resolva 5 exercícios para fixar', go:()=> startSession(subjectId, 'facil')};
    case 'review': return {label:'Revisar meus erros', sub:`${st.pendingErrs} questão(ões) para entender e refazer`, go:()=> startReviewErrors({subjectId, all:true})};
    default: return {label:'Praticar até dominar', sub:`Nível atual: ${st.mastery.name}. ${st.mastery.next}`, go:()=> startSession(subjectId, st.mastery.lvl>=2 ? 'dificil' : 'medio')};
  }
}
/* em que assunto da trilha o aluno está: o último que ele mexeu (se ainda não concluiu);
   senão o próximo não concluído na ordem da trilha, a partir dali. Conta nova: o assunto sugerido
   pelo nivelamento / ano escolar. */
function pathOrder(){ return LEARN_AREAS.flatMap(a=>a.ids); }
function pathCurrentSubject(progress, errs){
  const order = pathOrder();
  const cs = (typeof continueStudying==='function') ? continueStudying() : null;
  if(cs){ const st = pathStages(cs.subject.id, progress, errs); if(st && st.current) return cs.subject.id; }
  const start = cs ? cs.subject.id : firstSubjectToStudy().id;
  const i0 = Math.max(0, order.indexOf(start));
  for(let k=0; k<order.length; k++){ const id = order[(i0+k) % order.length]; const st = pathStages(id, progress, errs); if(st && st.current) return id; }
  return null;
}

/* ---------- prática de hoje: sempre com um motivo real ---------- */
function todaysPractice(progress, errs){
  const p = progress || {}, e = errs || [];
  const diffFor = id=>{ const lvl = masteryOf(p[id]).lvl; return lvl>=3 ? 'dificil' : lvl>=2 ? 'medio' : 'facil'; };
  const due = e.filter(x=>errorIsDue(x));
  if(due.length){
    const by = {}; due.forEach(x=> by[x.subjectId] = (by[x.subjectId]||0) + (x.count||1));
    const id = Object.entries(by).sort((a,b)=>b[1]-a[1])[0][0];
    return {subjectId:id, difficulty:diffFor(id), reason:`Você errou questões de ${subjById(id).name} e elas estão prontas para revisão. Vamos reforçar esse assunto.`, kind:'errors'};
  }
  const weak = recommendSubjects(p, e, 1)[0];
  if(weak) return {subjectId:weak, difficulty:diffFor(weak), reason:`Seu acerto recente em ${subjById(weak).name} está abaixo do esperado.`, kind:'weak'};
  const spaced = dueReviewSubjects(p)[0];
  if(spaced) return {subjectId:spaced.id, difficulty:diffFor(spaced.id), reason:`Faz alguns dias que você não pratica ${spaced.name}. Revisar agora ajuda a não esquecer.`, kind:'spaced'};
  const cur = pathCurrentSubject(p, e);
  if(cur) return {subjectId:cur, difficulty:diffFor(cur), reason:`É o assunto que você está estudando agora.`, kind:'current'};
  const any = SUBJECTS[0].id;
  return {subjectId:any, difficulty:'facil', reason:'Um bom começo para aquecer.', kind:'start'};
}
/* "não sei o que estudar": prioriza aprender (etapas da trilha) e usa a prática como plano B */
function whatToStudy(progress, errs){
  const p = progress || {}, e = errs || [];
  const due = e.filter(x=>errorIsDue(x));
  const cur = pathCurrentSubject(p, e);
  if(due.length >= 3){
    const t = todaysPractice(p, e);
    return {subjectId:t.subjectId, why:`Você tem ${due.length} erros para revisar, principalmente em ${subjById(t.subjectId).name}. Entender esses erros agora é o que mais vai te ajudar.`, action:{label:'Revisar agora', go:()=> startReviewErrors({subjectId:t.subjectId, all:true})}};
  }
  if(cur){
    const st = pathStages(cur, p, e), act = pathNextAction(cur, st);
    const fresh = !Object.keys(p).length && !Object.keys(studyRead()).length;
    return {subjectId:cur, why: fresh ? `É o primeiro assunto da trilha. Comece pela explicação.` : `É o próximo passo da sua trilha: ${act.sub}.`, action:act};
  }
  const t = todaysPractice(p, e);
  return {subjectId:t.subjectId, why:t.reason, action:{label:'Praticar', go:()=> startSession(t.subjectId, t.difficulty)}};
}

/* ---------- explicação em 5 partes ---------- */
function nums(q){ return (String(q).match(/\d+(?:,\d+)?(?:\/\d+)?/g)||[]); }
function listPt(a){ return a.length<=1 ? (a[0]||'') : a.slice(0,-1).join(', ') + ' e ' + a[a.length-1]; }
function brNum(v){ return fmt(Math.round(v*1000)/1000); }
function toNum(t){ return parseFloat(String(t).replace(/\./g,'').replace(',', '.')); }
/* lê um lado de equação do 1º/2º grau ou de sistema: "3x² − 6x + 2", "x + 2y", "5" */
function parsePoly(str){
  const t = String(str).replace(/−/g,'-').replace(/\s+/g,'');
  const out = {x2:0, x:0, y:0, c:0};
  const terms = t.match(/[+-]?[^+-]+/g) || [];
  for(const term of terms){
    const m = /^([+-]?)(\d*(?:\.\d+)?)(x²|x|y)?$/.exec(term); if(!m) return null;
    const sign = m[1]==='-' ? -1 : 1, k = m[2]==='' ? 1 : parseFloat(m[2]);
    const v = sign * k;
    if(m[3]==='x²') out.x2 += v; else if(m[3]==='x') out.x += v; else if(m[3]==='y') out.y += v; else { if(m[2]==='') return null; out.c += v; }
  }
  return out;
}
function evalPoly(p, x, y){ return p.x2*x*x + p.x*x + p.y*(y||0) + p.c; }
function showPoly(sideText, x, y){ // "3x + 8" com x = 3 → "3·3 + 8"
  return String(sideText).replace(/(\d*)x²/g, (m,k)=>`${k?k+'·':''}(${brNum(x)})²`).replace(/(\d*)x/g, (m,k)=>`${k?k+'·':''}(${brNum(x)})`).replace(/(\d*)y/g, (m,k)=>`${k?k+'·':''}(${brNum(y)})`);
}
const OK_MARK = ' ✓';
const EXPLAIN = {
  adicao: {ask:()=>'O total: quanto dá quando juntamos todos os números.', op:()=>'Adição. Some coluna por coluna, da direita para a esquerda, levando o "vai um" quando passar de 9.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2) return null; const last = n[n.length-1]; return `Tirando o último número do total, sobra a soma dos outros: ${brNum(ex.answer)} − ${brNum(last)} = ${brNum(ex.answer-last)}, e ${n.slice(0,-1).map(brNum).join(' + ')} = ${brNum(n.slice(0,-1).reduce((a,b)=>a+b,0))}.${OK_MARK}`; }},
  subtracao: {ask:()=>'A diferença: quanto sobra quando tiramos o segundo número do primeiro.', op:()=>'Subtração. Subtraia coluna por coluna, da direita para a esquerda, pedindo emprestado quando o número de cima for menor.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2) return null; return `Somando o resultado com o número que foi tirado, voltamos ao primeiro: ${brNum(ex.answer)} + ${brNum(n[1])} = ${brNum(ex.answer+n[1])}.${OK_MARK}`; }},
  multiplicacao: {ask:()=>'O produto: o resultado de repetir um número várias vezes.', op:()=>'Multiplicação. Use a tabuada; em números maiores, multiplique algarismo por algarismo e some as partes.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2 || !n[1]) return null; return `A divisão desfaz a multiplicação: ${brNum(ex.answer)} ÷ ${brNum(n[1])} = ${brNum(ex.answer/n[1])}.${OK_MARK}`; }},
  divisao: {ask:ex=> /arredonde/i.test(ex.question) ? 'O quociente (resultado da divisão), com até 2 casas depois da vírgula.' : 'O quociente: quanto fica em cada parte ao repartir igualmente.', op:()=>'Divisão. Pergunte "quantas vezes o divisor cabe?", multiplique, subtraia e desça o próximo algarismo.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2) return null; const back = ex.answer*n[1]; const exact = Math.abs(back-n[0])<1e-9; return `A multiplicação desfaz a divisão: ${brNum(ex.answer)} × ${brNum(n[1])} = ${brNum(back)}${exact ? '' : `, bem perto de ${brNum(n[0])} (a diferença vem do arredondamento)`}.${exact?OK_MARK:''}`; }},
  dinheiro: {ask:ex=> /troco/i.test(ex.question) ? 'O troco: quanto volta depois de pagar.' : /cada um/i.test(ex.question) ? 'Quanto cada pessoa paga.' : 'O valor total da compra, em reais.',
    op:ex=> /troco/i.test(ex.question) ? 'Subtração: troco = valor pago − total da compra. Dica: pense em centavos.' : /cada um/i.test(ex.question) ? 'Divisão: total ÷ número de pessoas.' : /cada/i.test(ex.question) ? 'Multiplicação (preço × quantidade) e depois, se tiver, subtração do troco.' : 'Adição dos preços. Dica: pense em centavos.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(/troco/i.test(ex.question) && n.length===2) return `Troco + preço tem que dar o valor pago: ${brNum(ex.answer)} + ${brNum(n[0])} = ${brNum(ex.answer+n[0])}.${OK_MARK}`;
      if(/cada um/i.test(ex.question) && n.length===2) return `Cada parte vezes o número de pessoas volta ao total: ${brNum(ex.answer)} × ${brNum(n[1])} = ${brNum(ex.answer*n[1])}.${OK_MARK}`;
      if(/troco/i.test(ex.question) && /cada/i.test(ex.question) && n.length===3){ const [q,pr,paid] = n; return `Troco + o que foi gasto tem que dar o valor pago: ${brNum(ex.answer)} + ${brNum(q)} × ${brNum(pr)} = ${brNum(ex.answer + q*pr)}.${Math.abs(ex.answer+q*pr-paid)<1e-9?OK_MARK:''}`; }
      if(/juntos/i.test(ex.question) && n.length===2) return `Total menos um dos preços dá o outro: ${brNum(ex.answer)} − ${brNum(n[1])} = ${brNum(ex.answer-n[1])}.${OK_MARK}`; return null; }},
  fracoes: {ask:ex=> /÷/.test(ex.question) ? 'O resultado da divisão das frações, na forma mais simples.' : /×/.test(ex.question) ? 'O resultado da multiplicação das frações, na forma mais simples.' : 'O resultado da conta com frações, na forma mais simples.',
    op:ex=> /÷/.test(ex.question) ? 'Divisão de frações: mantenha a primeira, troque ÷ por × e inverta a segunda.' : /×/.test(ex.question) ? 'Multiplicação de frações: numerador vezes numerador e denominador vezes denominador.' : fracSameDen(ex.question) ? 'Os denominadores são iguais: some (ou subtraia) só os numeradores.' : 'Os denominadores são diferentes: primeiro deixe as frações com o mesmo denominador (MMC).',
    check:ex=>{ const m = /^(\d+)\/(\d+)$/.exec(String(ex.displayAnswer||'')); if(!m) return `O resultado é um número inteiro: ${ex.displayAnswer}.`; const g = gcdE(+m[1], +m[2]); return g===1 ? `${m[1]}/${m[2]} já está na forma mais simples: nenhum número maior que 1 divide ${m[1]} e ${m[2]} ao mesmo tempo.${OK_MARK}` : `Ainda dá para dividir ${m[1]} e ${m[2]} por ${g}.`; }},
  decimais: {ask:()=>'O resultado da conta com números decimais.', op:ex=> /×/.test(ex.question) ? 'Multiplicação: ignore as vírgulas, multiplique e depois conte as casas decimais para pôr a vírgula.' : 'Alinhe as vírgulas (complete com zeros) e faça a conta coluna por coluna.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2) return null; if(/\+/.test(ex.question)) return `${brNum(ex.answer)} − ${brNum(n[1])} = ${brNum(ex.answer-n[1])}, o primeiro número.${OK_MARK}`; if(/−|-/.test(ex.question)) return `${brNum(ex.answer)} + ${brNum(n[1])} = ${brNum(ex.answer+n[1])}, o primeiro número.${OK_MARK}`; return `Estimativa: ${brNum(Math.round(n[0]))} × ${brNum(n[1])} = ${brNum(Math.round(n[0])*n[1])}, perto de ${brNum(ex.answer)} — o resultado faz sentido.`; }},
  porcentagem: {ask:ex=> /aumento/i.test(ex.question) ? 'O novo preço, depois do aumento.' : /desconto/i.test(ex.question) ? 'O preço depois do desconto.' : 'Quanto vale essa porcentagem do número.',
    op:ex=> /aumento|desconto/i.test(ex.question) ? 'Calcule a porcentagem (valor × taxa ÷ 100) e depois some (aumento) ou subtraia (desconto).' : 'Multiplique o número pela porcentagem e divida por 100.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<2) return null;
      if(/aumento/i.test(ex.question)){ const base = n[0], pct = n[1]; return `O aumento foi ${brNum(ex.answer-base)}, e ${brNum(pct)}% de ${brNum(base)} = ${brNum(base*pct/100)}.${OK_MARK}`; }
      if(/desconto/i.test(ex.question)){ const base = n[0], pct = n[1]; return `O desconto foi ${brNum(base-ex.answer)}, e ${brNum(pct)}% de ${brNum(base)} = ${brNum(base*pct/100)}.${OK_MARK}`; }
      if(/%/.test(ex.question)){ const pct = n[0], base = n[1]; return `${brNum(pct)}% é menos que 100%, então o resultado tem que ser menor que ${brNum(base)}: ${brNum(ex.answer)} < ${brNum(base)}.${OK_MARK}`; } return null; }},
  geometria: {ask:ex=> /perímetro/i.test(ex.question) ? 'O perímetro: o comprimento da volta inteira da figura.' : /altura|base de/i.test(ex.question) && /área de/i.test(ex.question) ? 'A medida que está faltando, sabendo a área.' : 'A área: o tamanho da parte de dentro da figura.',
    op:ex=> /perímetro/i.test(ex.question) ? 'Some todos os lados (no quadrado, 4 × lado; no retângulo, 2 × (base + altura)).' : /círculo/i.test(ex.question) ? 'Área do círculo = 3,14 × raio × raio.' : /triângulo/i.test(ex.question) ? 'Área do triângulo = base × altura ÷ 2.' : /trapézio/i.test(ex.question) ? 'Área do trapézio = (base maior + base menor) × altura ÷ 2.' : 'Use a fórmula da área da figura (retângulo e paralelogramo: base × altura).',
    check:ex=> /perímetro/i.test(ex.question) ? 'Perímetro é um comprimento: a resposta fica em cm (ou m), sem o "²".' : 'Área mede superfície: a resposta fica em cm² (ou m²), com o "²".'},
  mmcmdc: {ask:ex=> /^MMC/.test(ex.question) || /juntos|de novo/i.test(ex.question) ? 'O MMC: o menor número que é múltiplo dos dois.' : 'O MDC: o maior número que divide os dois sem sobrar.',
    op:()=>'Liste os múltiplos (MMC) ou os divisores (MDC), ou fatore os números em primos.',
    check:ex=>{ const n = nums(ex.question).map(toNum).slice(0,2); if(n.length<2) return null; const isMMC = /^MMC/.test(ex.question) || /juntos|de novo/i.test(ex.question);
      return isMMC ? `${brNum(ex.answer)} ÷ ${n[0]} = ${brNum(ex.answer/n[0])} e ${brNum(ex.answer)} ÷ ${n[1]} = ${brNum(ex.answer/n[1])}: é múltiplo dos dois.${OK_MARK}` : `${n[0]} ÷ ${brNum(ex.answer)} = ${brNum(n[0]/ex.answer)} e ${n[1]} ÷ ${brNum(ex.answer)} = ${brNum(n[1]/ex.answer)}: divide os dois sem sobrar.${OK_MARK}`; }},
  potenciacao: {ask:ex=> /√/.test(ex.question) ? 'A raiz quadrada: o número que, multiplicado por ele mesmo, dá o valor.' : /³/.test(ex.question) ? 'O cubo: o número multiplicado por ele mesmo 3 vezes.' : 'O quadrado: o número multiplicado por ele mesmo.',
    op:ex=> /√/.test(ex.question) ? 'Procure o número que vezes ele mesmo dá o valor dentro da raiz.' : 'Multiplique a base por ela mesma quantas vezes o expoente mandar.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(!n.length) return null; if(/√/.test(ex.question)) return `${brNum(ex.answer)} × ${brNum(ex.answer)} = ${brNum(ex.answer*ex.answer)}.${OK_MARK}`; return /³/.test(ex.question) ? `${brNum(n[0])} × ${brNum(n[0])} × ${brNum(n[0])} = ${brNum(n[0]**3)}.${OK_MARK}` : `${brNum(n[0])} × ${brNum(n[0])} = ${brNum(n[0]**2)}.${OK_MARK}`; }},
  expressoes: {ask:()=>'O valor da expressão.', op:()=>'Siga a ordem: parênteses, depois potências, depois × e ÷, e por último + e −.', check:()=>'Confira se você não fez uma soma antes de uma multiplicação: a ordem muda o resultado.'},
  estatistica: {ask:ex=> /mediana/i.test(ex.question) ? 'A mediana: o valor do meio, com os números em ordem.' : /moda/i.test(ex.question) ? 'A moda: o valor que mais se repete.' : 'A média: o valor que cada um teria se tudo fosse dividido igualmente.',
    op:ex=> /mediana/i.test(ex.question) ? 'Coloque em ordem e pegue o do meio (se forem dois no meio, faça a média deles).' : /moda/i.test(ex.question) ? 'Conte quantas vezes cada número aparece.' : 'Some todos e divida pela quantidade de números.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(!n.length) return null; if(/média/i.test(ex.question)) return `Média × quantidade tem que dar a soma: ${brNum(ex.answer)} × ${n.length} = ${brNum(ex.answer*n.length)} e a soma é ${brNum(n.reduce((a,b)=>a+b,0))}.${OK_MARK}`;
      if(/moda/i.test(ex.question)){ const c = n.filter(v=>Math.abs(v-ex.answer)<1e-9).length, others = Math.max(0, ...n.filter(v=>Math.abs(v-ex.answer)>=1e-9).map(v=>n.filter(w=>w===v).length)); return `${brNum(ex.answer)} aparece ${c} vezes; nenhum outro número aparece tanto (o que mais se repete aparece ${others} vez${others===1?'':'es'}).${c>others?OK_MARK:''}`; }
      if(/mediana/i.test(ex.question)){ const below = n.filter(v=>v<ex.answer).length, above = n.filter(v=>v>ex.answer).length; return `Há ${below} números abaixo de ${brNum(ex.answer)} e ${above} acima: ele fica no meio.${OK_MARK}`; } return null; }},
  regra3: {ask:()=>'O valor desconhecido (x) da proporção.', op:ex=> /inversa/i.test(ex.question) ? 'Proporção inversa: quando uma grandeza aumenta, a outra diminui. Multiplique as grandezas da mesma linha: a × b = c × x.' : 'Proporção direta: as duas grandezas aumentam juntas. Multiplique em cruz.',
    check:ex=>{ const n = nums(ex.question).map(toNum); if(n.length<3) return null; const [a,b,c] = n;
      return /inversa/i.test(ex.question) ? `Na inversa o produto se mantém: ${brNum(a)} × ${brNum(b)} = ${brNum(a*b)} e ${brNum(c)} × ${brNum(ex.answer)} = ${brNum(c*ex.answer)}.${OK_MARK}` : `Na direta a razão se mantém: ${brNum(b)} ÷ ${brNum(a)} = ${brNum(b/a)} e ${brNum(ex.answer)} ÷ ${brNum(c)} = ${brNum(ex.answer/c)}.${OK_MARK}`; }},
  eq1: {ask:()=>'O valor de x que deixa os dois lados da igualdade iguais.', op:()=>'Isole o x: passe os números para um lado e os termos com x para o outro (trocando o sinal) e divida pelo número que multiplica o x.',
    check:ex=>{ const [L,R] = String(ex.question).split('='); const pl = parsePoly(L), pr = parsePoly(R); if(!pl || !pr) return null; const x = ex.answer;
      return `Trocando x por ${brNum(x)}: ${showPoly(L.trim(),x)} = ${brNum(evalPoly(pl,x))} e ${showPoly(R.trim(),x)} = ${brNum(evalPoly(pr,x))}. Os dois lados ficam iguais.${OK_MARK}`; }},
  sistemas: {ask:()=>'Os valores de x e de y que servem para as duas equações ao mesmo tempo.', op:()=>'Some ou subtraia as equações para sumir uma letra, resolva a que sobrar e substitua o valor na outra.',
    check:ex=>{ const {x,y} = ex.answer || {}; const lines = String(ex.question).split('\n'); const parts = [];
      for(const ln of lines){ const [L,R] = ln.split('='); const pl = parsePoly(L), pr = parsePoly(R); if(!pl || !pr) return null; parts.push(`${showPoly(L.trim(),x,y)} = ${brNum(evalPoly(pl,x,y))}`); }
      return `Com x = ${brNum(x)} e y = ${brNum(y)}: ${parts.join(' e ')} — as duas equações conferem.${OK_MARK}`; }},
  eq2: {ask:()=>'As raízes: os valores de x que fazem a equação dar 0.', op:()=>'Ache a, b e c, calcule Δ = b² − 4ac e use a fórmula de Bhaskara.',
    check:ex=>{ const [L] = String(ex.question).split('='); const p = parsePoly(L); if(!p || !Array.isArray(ex.answer)) return null; const rs = [...new Set(ex.answer)];
      return rs.map(r=>`para x = ${brNum(r)}: ${showPoly(L.trim(), r)} = ${brNum(evalPoly(p,r))}`).join('; ') + '.' + OK_MARK; }},
  func1grau: {ask:ex=> /raiz/i.test(ex.question) ? 'A raiz: o valor de x que faz f(x) dar 0.' : 'O valor da função para o x indicado.', op:ex=> /raiz/i.test(ex.question) ? 'Iguale a fórmula a 0 e resolva como uma equação do 1º grau.' : 'Troque o x pelo número dado e faça as contas.',
    check:ex=>{ const m = /f\(x\) = ([^.]+)\./.exec(ex.question); if(!m) return null; const p = parsePoly(m[1]); if(!p) return null;
      if(/raiz/i.test(ex.question)){ const v = evalPoly(p, ex.answer); return `f(${brNum(ex.answer)}) = ${showPoly(m[1], ex.answer)} = ${brNum(v)}${Math.abs(v)<1e-9 ? '' : ' (quase 0, por causa do arredondamento)'}.${Math.abs(v)<1e-9?OK_MARK:''}`; }
      const k = /f\((-?\d+)\)/.exec(ex.question); if(!k) return null; const xv = +k[1]; return `Refazendo: ${showPoly(m[1], xv)} = ${brNum(evalPoly(p, xv))}.${OK_MARK}`; }},
};
function gcdE(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; }
/* monta as 5 partes; as que não fizerem sentido para a questão ficam de fora (nunca inventamos) */
function reasoningParts(ex, subjectId){
  const E = EXPLAIN[subjectId] || {};
  const safe = f=>{ try{ return f ? f(ex) : null; }catch(e){ return null; } };
  const info = nums(ex.question);
  const parts = [];
  const ask = safe(E.ask); if(ask) parts.push({t:'O que a questão está pedindo?', b:escHTML(ask)});
  if(info.length) parts.push({t:'Quais informações vamos usar?', b:`Os números da questão: <b class="mono">${escHTML(listPt(info))}</b>.`});
  const op = safe(E.op); if(op) parts.push({t:'Qual operação devemos fazer?', b:escHTML(op)});
  parts.push({t:'Resolvendo', steps:true});
  const ck = safe(E.check); if(ck) parts.push({t:'Conferindo o resultado', b:escHTML(ck)});
  return parts;
}

/* ---------- "Não entendi": explicação mais simples de cada assunto ---------- */
const SIMPLE = {
  adicao:'Somar é juntar. Se você tem 7 figurinhas e ganha mais 5, junta tudo: 7 + 5 = 12. Nas contas grandes, junte primeiro as unidades (as moedas de 1), depois as dezenas (as notas de 10) e depois as centenas (as notas de 100). Quando juntar 10 moedas de 1, troque por uma nota de 10: esse é o "vai um".',
  subtracao:'Subtrair é tirar. Se você tem 12 balas e come 5, sobram 12 − 5 = 7. Nas contas grandes, tire primeiro as unidades. Se não tiver unidades suficientes, "destroque" uma nota de 10 por 10 moedas de 1: isso é pedir emprestado.',
  multiplicacao:'Multiplicar é somar o mesmo número várias vezes. 4 × 3 são 3 pacotes com 4 balas: 4 + 4 + 4 = 12. Para 23 × 4, separe: 20 × 4 = 80 e 3 × 4 = 12, e junte: 80 + 12 = 92.',
  divisao:'Dividir é repartir igualmente. 12 ÷ 3 é repartir 12 balas entre 3 amigos: cada um fica com 4, porque 3 × 4 = 12. Para descobrir, pergunte: "que número vezes 3 dá 12?".',
  dinheiro:'Pense em centavos: R$ 2,50 são 250 centavos. Faça a conta com números inteiros e, no fim, volte a pôr a vírgula duas casas antes do final. Troco é quanto você deu menos quanto custou.',
  fracoes:'Uma fração é um pedaço de algo dividido em partes iguais. 3/8 é "3 pedaços de uma pizza cortada em 8". Só dá para somar pedaços do mesmo tamanho: 3/8 + 1/8 = 4/8. Se os pedaços forem de tamanhos diferentes (1/2 e 1/4), primeiro corte a pizza de novo para os pedaços ficarem iguais: 1/2 = 2/4, e aí 2/4 + 1/4 = 3/4.',
  decimais:'A vírgula separa os inteiros dos pedaços. Em 3,7 temos 3 inteiros e 7 décimos. Para somar ou subtrair, coloque vírgula embaixo de vírgula, como dinheiro: R$ 3,70 + R$ 8,40 = R$ 12,10.',
  porcentagem:'Porcentagem é "de cada 100". 10% de 80 é pegar 10 de cada 100: o mesmo que dividir por 10, dá 8. 50% é a metade e 25% é a quarta parte. Para qualquer porcentagem: multiplique pelo número e divida por 100.',
  geometria:'Perímetro é o caminho da volta: imagine uma formiga andando pela borda da figura e some tudo o que ela anda. Área é o chão de dentro: quantos quadradinhos de 1 cm cabem na figura. Num retângulo de 4 por 2, cabem 2 fileiras de 4 quadradinhos: 8 cm².',
  mmcmdc:'MMC responde "quando acontecem juntos de novo?": o menor número que aparece na tabuada dos dois. MDC responde "qual o maior grupo igual que dá para montar sem sobrar?": o maior número que divide os dois.',
  potenciacao:'O expoente diz quantas vezes multiplicar. 3² = 3 × 3 = 9 e 2³ = 2 × 2 × 2 = 8. A raiz faz o caminho de volta: √9 pergunta "que número vezes ele mesmo dá 9?" e a resposta é 3.',
  expressoes:'Uma expressão tem uma ordem, como uma receita: primeiro o que está entre parênteses, depois as potências, depois as multiplicações e divisões e por último as somas e subtrações. Em 3 + 2 × 4, a multiplicação vem antes: 3 + 8 = 11.',
  estatistica:'A média divide tudo igualmente: se três amigos têm 2, 4 e 6 balas e juntam tudo (12), cada um fica com 4. A mediana é quem fica no meio da fila, com os números em ordem. A moda é o valor que mais aparece.',
  regra3:'Pergunte: se uma coisa aumenta, a outra aumenta junto? Se 2 cadernos custam R$ 10, 4 cadernos custam o dobro, R$ 20 (direta). Se 2 pintores levam 6 dias, 4 pintores levam a metade do tempo, 3 dias (inversa).',
  eq1:'Pense numa balança em equilíbrio: 2x + 3 = 11. Tire 3 dos dois lados e ela continua equilibrada: 2x = 8. Agora divida os dois lados por 2: x = 4. Tudo o que fizer de um lado, faça do outro.',
  sistemas:'São duas pistas sobre dois números escondidos. Ex.: "os dois somam 10" (x + y = 10) e "a diferença é 2" (x − y = 2). Juntando as duas pistas (somando), o y some: 2x = 12, então x = 6, e sobra y = 4.',
  eq2:'Numa equação com x², procuramos os números que fazem tudo dar zero. Em x² − 5x + 6 = 0, teste x = 2: 4 − 10 + 6 = 0 ✓. Teste x = 3: 9 − 15 + 6 = 0 ✓. A fórmula de Bhaskara é o jeito de achar esses números sem precisar adivinhar.',
  func1grau:'A função é uma máquina: entra um número x e sai outro, sempre pela mesma regra. Em f(x) = 2x + 1, se entra 3, sai 2 × 3 + 1 = 7. A raiz é o número que, entrando na máquina, faz sair 0.',
};
