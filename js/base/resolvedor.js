/* =========================================================
   Resolvedor de questões livres ("Resolver questão")
   ========================================================= */

function normalizeExpr(raw){
  let s = raw.toLowerCase().trim();
  s = s.replace(/[?!]+$/,'').trim();
  // remove um "=" pendurado no final (ex: "11 + 16 = ?" já virou "11 + 16 =" acima) — isso é só
  // um jeito de perguntar "quanto dá", não uma equação de verdade, então não deve bloquear o
  // reconhecimento como conta simples.
  s = s.replace(/=\s*$/,'').trim();

  // remove common leading filler phrases (accented and unaccented), repeatedly
  const fillers = [
    /^por favor,?\s*/,
    /^me ajuda(?:\s+a)?\s*(?:resolver|calcular)?\s*/,
    /^ajuda(?:\s+a)?\s*(?:resolver|calcular)?\s*/,
    /^(?:quanto|qual)\s+(?:é|e|eh|vale|da|dá)\s+(?:o\s+resultado\s+de\s+)?/,
    /^qual\s+o\s+resultado\s+de\s*/,
    /^calcule?\s*/,
    /^calcula\s*/,
    /^resolva\s*/,
    /^resolve\s*/,
    /^resolver\s*/,
    /^a\s+equaç(?:a|ã)o\s*/,
    /^equaç(?:a|ã)o\s*/,
    /^o\s+resultado\s+de\s*/,
  ];
  let changed = true;
  while(changed){
    changed = false;
    for(const f of fillers){
      const before = s;
      s = s.replace(f, '');
      if(s !== before){ changed = true; }
    }
    s = s.trim();
  }

  // power / square phrases
  s = s.replace(/\belevado\s+a\b/g, '^');
  s = s.replace(/\bao\s+quadrado\b/g, '^2');
  s = s.replace(/\bao\s+cubo\b/g, '^3');
  s = s.replace(/quadrado\s+de\s+(-?\d+(?:[.,]\d+)?)/g, (m,n)=> `${n}^2`);
  s = s.replace(/cubo\s+de\s+(-?\d+(?:[.,]\d+)?)/g, (m,n)=> `${n}^3`);

  // operator words (Portuguese) -> symbols
  s = s.replace(/\bmultiplicado\s+por\b/g, '*');
  s = s.replace(/\bdividido\s+por\b/g, '/');
  s = s.replace(/\bdividido\b/g, '/');
  s = s.replace(/\bvezes\b/g, '*');
  s = s.replace(/\bmais\b/g, '+');
  s = s.replace(/\bmenos\b/g, '-');

  // symbols
  s = s.replace(/²/g,'^2').replace(/³/g,'^3');
  s = s.replace(/×/g,'*').replace(/÷/g,'/');
  s = s.replace(/√/g, ' sqrt ');
  s = s.replace(/[−–—]/g, '-'); // sinais de menos "tipográficos" (−, –, —) -> hífen normal

  // decimal commas -> dot
  s = s.replace(/,(?=\d)/g, '.');

  // "x" used as a multiplication sign (very common in PT-BR, e.g. "5 x 3")
  // Only when there's no equation and no function notation, since otherwise x is a variable.
  if(!s.includes('=') && !/f\s*\(/.test(s)){
    s = s.replace(/(\d)\s*x\s*(?=\d)/g, '$1*');
    s = s.replace(/\bx\b/g, '*');
  }

  return s.trim();
}

// --- tokenizer / parser for arithmetic with step logging ---
function tokenize(s){
  const toks=[]; let i=0;
  while(i<s.length){
    const c=s[i];
    if(/\s/.test(c)){ i++; continue; }
    if(/[0-9.]/.test(c)){ let j=i; while(j<s.length && /[0-9.]/.test(s[j])) j++; toks.push({t:'num', v:parseFloat(s.slice(i,j))}); i=j; continue; }
    if('+-*/^()'.includes(c)){ toks.push({t:c}); i++; continue; }
    i++; // skip unknown char
  }
  return toks;
}
function parseExprTokens(toks){
  let pos=0;
  function peek(){ return toks[pos]; }
  function next(){ return toks[pos++]; }
  function parseAdd(){
    let node = parseMul();
    while(peek() && (peek().t==='+' || peek().t==='-')){
      const op = next().t; const right = parseMul();
      node = {op, l:node, r:right};
    }
    return node;
  }
  function parseMul(){
    let node = parsePow();
    while(peek() && (peek().t==='*' || peek().t==='/' || peek().t==='(' || peek().t==='num')){
      let op = '*';
      if(peek().t==='*' || peek().t==='/'){ op = next().t; }
      const right = parsePow();
      node = {op, l:node, r:right};
    }
    return node;
  }
  function parsePow(){
    let node = parseUnary();
    if(peek() && peek().t==='^'){ next(); const right = parsePow(); node = {op:'^', l:node, r:right}; }
    return node;
  }
  function parseUnary(){
    if(peek() && peek().t==='-'){ next(); const n = parseUnary(); return {op:'neg', l:n}; }
    return parsePrimary();
  }
  function parsePrimary(){
    if(peek() && peek().t==='('){ next(); const n = parseAdd(); if(peek() && peek().t===')') next(); return n; }
    if(peek() && peek().t==='num'){ return {op:'num', v: next().v}; }
    return {op:'num', v:0};
  }
  return parseAdd();
}
function nodeText(node, parentPrec){
  parentPrec = parentPrec || 0;
  if(node.op==='num') return fmt(node.v);
  if(node.op==='neg') return `-${nodeText(node.l, 4)}`;
  const prec = {'+':1,'-':1,'*':2,'/':2,'^':3}[node.op];
  const sym = {'+':'+','-':'−','*':'×','/':'÷','^':'^'}[node.op];
  const txt = `${nodeText(node.l, prec)} ${sym} ${nodeText(node.r, prec+1)}`;
  return prec < parentPrec ? `(${txt})` : txt;
}
function evalNode(node, steps){
  if(node.op==='num') return node.v;
  if(node.op==='neg'){ const v=-evalNode(node.l, steps); return v; }
  const l = evalNode(node.l, steps);
  const r = evalNode(node.r, steps);
  let v;
  if(node.op==='+') v=l+r;
  else if(node.op==='-') v=l-r;
  else if(node.op==='*') v=l*r;
  else if(node.op==='/') v=r!==0? l/r : NaN;
  else if(node.op==='^') v=Math.pow(l,r);
  const sym = {'+':'+','-':'−','*':'×','/':'÷','^':'^'}[node.op];
  if(node.l.op!=='num' || node.r.op!=='num' || steps.length===0 || true){
    steps.push(`${fmt(l)} ${sym} ${fmt(r)} = ${fmt(v)}`);
  }
  return v;
}
function evalArithmeticWithSteps(exprStr){
  const toks = tokenize(exprStr);
  const ast = parseExprTokens(toks);
  const steps = [];
  const result = evalNode(ast, steps);
  return {result, steps};
}
// como evalArithmeticWithSteps, mas também retorna "stages": a expressão inteira reescrita a cada passo (pra mostrar como uma escada de reduções).
function cloneReplaceNode(node, target, value){
  if(node === target) return {op:'num', v:value};
  if(node.op==='num') return node;
  if(node.op==='neg') return {op:'neg', l:cloneReplaceNode(node.l, target, value)};
  return {op:node.op, l:cloneReplaceNode(node.l, target, value), r:cloneReplaceNode(node.r, target, value)};
}
function evalArithmeticWithStages(exprStr){
  const toks = tokenize(exprStr);
  const root = parseExprTokens(toks);
  const steps = [];
  const stages = [nodeText(root)];
  function evalRec(node){
    if(node.op==='num') return node.v;
    if(node.op==='neg'){ return -evalRec(node.l); }
    const l = evalRec(node.l), r = evalRec(node.r);
    let v;
    if(node.op==='+') v=l+r;
    else if(node.op==='-') v=l-r;
    else if(node.op==='*') v=l*r;
    else if(node.op==='/') v = r!==0 ? l/r : NaN;
    else if(node.op==='^') v=Math.pow(l,r);
    const sym = {'+':'+','-':'−','*':'×','/':'÷','^':'^'}[node.op];
    steps.push(`${fmt(l)} ${sym} ${fmt(r)} = ${fmt(v)}`);
    const reducedTxt = nodeText(cloneReplaceNode(root, node, v));
    if(stages[stages.length-1] !== reducedTxt) stages.push(reducedTxt);
    return v;
  }
  const result = evalRec(root);
  return {result, steps, stages};
}

function parseLinearSide(sideStr){
  // returns {coef, const} for expression like "2x + 3 - x"
  let s = sideStr.replace(/\s+/g,'').replace(/-/g,'+-').replace(/^\+/,'');
  const terms = s.split('+').map(t=>t.trim()).filter(t=>t.length);
  let coef=0, cst=0;
  for(const t of terms){
    if(/x$/.test(t)){
      let numPart = t.slice(0,-1);
      if(numPart==='' || numPart==='+') coef += 1;
      else if(numPart==='-') coef -= 1;
      else {
        if(!/^-?\d+(\.\d+)?$/.test(numPart)) throw new Error('invalid term: '+t);
        coef += parseFloat(numPart);
      }
    } else {
      if(!/^-?\d+(\.\d+)?$/.test(t)) throw new Error('invalid term: '+t);
      cst += parseFloat(t);
    }
  }
  return {coef, cst};
}

function trySolveLinear(text){
  if(!/x/.test(text) || /x\^2|x²|x\*x/.test(text)) return null;
  if(!text.includes('=')) return null;
  const [lhs, rhs] = text.split('=');
  try{
    const L = parseLinearSide(lhs), R = parseLinearSide(rhs);
    const coef = L.coef - R.coef;
    const cst = R.cst - L.cst;
    if(coef===0) return null;
    const x = cst/coef;
    const eqText = `${lhs.trim()} = ${rhs.trim()}`.replace(/\*/g,'');
    return {
      howTo: 'Esta é uma equação do 1º grau. Vamos isolar a variável x, passando os termos com x para um lado e os números para o outro.',
      steps: [
        `Termos com x: ${fmt(L.coef)}x  e  ${fmt(R.coef)}x  →  ${fmt(coef)}x de um lado`,
        `Termos numéricos: ${fmt(cst)} do outro lado`,
        `${fmt(coef)}x = ${fmt(cst)}`,
        `x = ${fmt(cst)} ÷ ${fmt(coef)}`
      ],
      simple: `Junte todos os "x" de um lado da igualdade e todos os números do outro. Depois divida para descobrir o valor de x.`,
      final: `x = ${fmt(x)}`,
      visual: stepChain([eqText, `${fmt(coef)}x = ${fmt(cst)}`, `x = ${fmt(x)}`])
    };
  }catch(e){ return null; }
}

function trySolveQuadratic(text){
  if(!/x\^2|x²/.test(text)) return null;
  const norm = text.replace(/²/g,'^2');
  if(!norm.includes('=')) return null;
  const [lhsRaw, rhsRaw] = norm.split('=');
  function parseQuad(sideStr){
    let s = sideStr.replace(/\s+/g,'').replace(/-/g,'+-').replace(/^\+/,'');
    const terms = s.split('+').map(t=>t.trim()).filter(t=>t.length);
    let a=0,b=0,c=0;
    for(const t of terms){
      if(/x\^2$/.test(t)){
        let n = t.slice(0,-3);
        if(n===''||n==='+') a += 1;
        else if(n==='-') a -= 1;
        else { if(!/^-?\d+(\.\d+)?$/.test(n)) throw new Error('invalid term: '+t); a += parseFloat(n); }
      } else if(/x$/.test(t)){
        let n = t.slice(0,-1);
        if(n===''||n==='+') b += 1;
        else if(n==='-') b -= 1;
        else { if(!/^-?\d+(\.\d+)?$/.test(n)) throw new Error('invalid term: '+t); b += parseFloat(n); }
      } else {
        if(!/^-?\d+(\.\d+)?$/.test(t)) throw new Error('invalid term: '+t);
        c += parseFloat(t);
      }
    }
    return {a,b,c};
  }
  try{
    const L = parseQuad(lhsRaw), R = parseQuad(rhsRaw);
    const a = L.a-R.a, b = L.b-R.b, c = L.c-R.c;
    if(a===0) return null;
    const D = b*b - 4*a*c;
    const steps = [
      `Forma padrão: a=${fmt(a)}, b=${fmt(b)}, c=${fmt(c)}`,
      `Δ = b² − 4ac = ${fmt(b*b)} − ${fmt(4*a*c)} = ${fmt(D)}`
    ];
    let final, visual;
    if(D<0){
      steps.push('Δ é negativo → não existem raízes reais.');
      final = 'Não há solução real (Δ < 0)';
      visual = bhaskaraCard(a,b,c);
    } else if(D===0){
      const x = -b/(2*a);
      steps.push(`x = −b / 2a = ${fmt(-b)} / ${fmt(2*a)}`);
      final = `x = ${fmt(x)} (raiz dupla)`;
      visual = bhaskaraCard(a,b,c);
    } else {
      const sq = Math.sqrt(D);
      const x1 = (-b+sq)/(2*a), x2=(-b-sq)/(2*a);
      steps.push(`x = (−b ± √Δ) / 2a = (${fmt(-b)} ± ${fmt(sq)}) / ${fmt(2*a)}`);
      steps.push(`x' = ${fmt(x1)}   e   x'' = ${fmt(x2)}`);
      final = `x' = ${fmt(x1)}  ou  x'' = ${fmt(x2)}`;
      visual = bhaskaraCard(a,b,c);
    }
    return {
      howTo: 'Esta é uma equação do 2º grau (tem x²). Vamos usar a fórmula de Bhaskara para encontrar as raízes.',
      steps,
      simple: 'Identifique a, b e c da equação, calcule o discriminante Δ, e use a fórmula de Bhaskara para achar os valores de x.',
      final,
      visual
    };
  }catch(e){ return null; }
}

function trySolvePercentage(text){
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:de)?\s*(\d+(?:[.,]\d+)?)/i);
  if(!m) return null;
  const p = parseFloat(m[1].replace(',','.'));
  const base = parseFloat(m[2].replace(',','.'));
  const result = base*p/100;
  return {
    howTo: `Calcular uma porcentagem é multiplicar o valor pela taxa e dividir por 100.`,
    steps: [
      `${fmt(p)}% equivale à fração ${fmt(p)}/100`,
      `${fmt(base)} × ${fmt(p)} = ${fmt(base*p)}`,
      `${fmt(base*p)} ÷ 100 = ${fmt(result)}`
    ],
    simple: `Multiplique o número pela porcentagem e divida por 100 para achar a parte correspondente.`,
    final: `${fmt(result)}`,
    visual: fracRow([{n:p,d:100}, '×', base, '=', fmt(result)])
  };
}

function trySolveFractionPair(text){
  const m = text.match(/^\s*(-?\d+)\s*\/\s*(\d+)\s*([\+\-\*\/])\s*(-?\d+)\s*\/\s*(\d+)\s*$/);
  if(!m) return null;
  const [_, n1,d1,op,n2,d2] = m;
  const N1=parseFloat(n1), D1=parseFloat(d1), N2=parseFloat(n2), D2=parseFloat(d2);
  let numRes, denRes, opWord;
  if(op==='+'){ denRes=D1*D2; numRes=N1*D2+N2*D1; opWord='Some os numeradores depois de igualar os denominadores.'; }
  else if(op==='-'){ denRes=D1*D2; numRes=N1*D2-N2*D1; opWord='Subtraia os numeradores depois de igualar os denominadores.'; }
  else if(op==='*'){ denRes=D1*D2; numRes=N1*N2; opWord='Multiplique numerador por numerador e denominador por denominador.'; }
  else { denRes=D1*N2; numRes=N1*D2; opWord='Multiplique a primeira fração pelo inverso da segunda.'; }
  const [sn,sd] = simplifyFrac(numRes, denRes);
  const opSym = {'+':'+','-':'−','*':'×','/':'÷'}[op];
  const visual = fracRow([{n:N1,d:D1}, opSym, {n:N2,d:D2}, '=', sd===1?sn:{n:sn,d:sd}]);
  return {
    howTo: `Esta é uma operação entre frações. ${opWord}`,
    steps: op==='+'||op==='-' ? [
      `Denominador comum: ${D1} × ${D2} = ${denRes}`,
      `${n1}/${d1} = ${N1*D2}/${denRes}   e   ${n2}/${d2} = ${N2*D1}/${denRes}`,
      `${op==='+'?'Some':'Subtraia'}: ${N1*D2} ${op} ${N2*D1} = ${numRes}`
    ] : [
      `${op==='*' ? `Numeradores: ${N1} × ${N2} = ${numRes}` : `Multiplique pela fração invertida: ${n1}/${d1} × ${d2}/${n2}`}`,
      `${op==='*' ? `Denominadores: ${D1} × ${D2} = ${denRes}` : `Numerador: ${N1}×${D2}=${numRes}, Denominador: ${D1}×${N2}=${denRes}`}`
    ],
    simple: 'Frações precisam do mesmo denominador para somar ou subtrair. Para multiplicar, basta multiplicar em linha reta; para dividir, multiplique pela fração invertida.',
    final: `${sd===1? sn : sn+"/"+sd}  (≈ ${fmt(numRes/denRes)})`,
    visual
  };
}

function trySolveSystem(text){
  const lines = text.split(/\n|;|,| e (?=\-?\d*[a-zA-Z])/).map(l=>l.trim()).filter(l=>l.includes('=') && /[xy]/.test(l));
  if(lines.length<2) return null;
  function parseXY(sideStr){
    let s = sideStr.replace(/\s+/g,'').replace(/-/g,'+-').replace(/^\+/,'');
    const terms = s.split('+').map(t=>t.trim()).filter(t=>t.length);
    let a=0,b=0,c=0;
    for(const t of terms){
      if(/x$/.test(t)){
        let n=t.slice(0,-1);
        if(n===''||n==='+') a+=1; else if(n==='-') a-=1;
        else { if(!/^-?\d+(\.\d+)?$/.test(n)) throw new Error('invalid term: '+t); a += parseFloat(n); }
      } else if(/y$/.test(t)){
        let n=t.slice(0,-1);
        if(n===''||n==='+') b+=1; else if(n==='-') b-=1;
        else { if(!/^-?\d+(\.\d+)?$/.test(n)) throw new Error('invalid term: '+t); b += parseFloat(n); }
      } else {
        if(!/^-?\d+(\.\d+)?$/.test(t)) throw new Error('invalid term: '+t);
        c += parseFloat(t);
      }
    }
    return {a,b,c};
  }
  try{
    const eqs = lines.slice(0,2).map(line=>{
      const [l,r] = line.split('=');
      const L = parseXY(l), R = parseXY(r);
      return {a:L.a-R.a, b:L.b-R.b, c:R.c-L.c};
    });
    const [e1,e2] = eqs;
    const det = e1.a*e2.b - e2.a*e1.b;
    if(det===0) return null;
    const x = (e1.c*e2.b - e2.c*e1.b)/det;
    const y = (e1.a*e2.c - e2.a*e1.c)/det;
    function coefX(n){ return n===1?'x':n===-1?'−x':`${fmt(n)}x`; }
    function coefY(n){ const abs=Math.abs(n); return `${n>=0?'+ ':'− '}${abs===1?'':fmt(abs)}y`; }
    const rows = [
      {x:coefX(e1.a), y:coefY(e1.b), c:fmt(e1.c)},
      {x:coefX(e2.a), y:coefY(e2.b), c:fmt(e2.c)}
    ];
    return {
      howTo: 'Este é um sistema de duas equações com duas incógnitas. Vamos resolver pelo método da adição/eliminação.',
      steps: [
        `Equação 1: ${fmt(e1.a)}x + ${fmt(e1.b)}y = ${fmt(e1.c)}`,
        `Equação 2: ${fmt(e2.a)}x + ${fmt(e2.b)}y = ${fmt(e2.c)}`,
        `Eliminando y: x = ${fmt(x)}`,
        `Substituindo na equação 1: y = ${fmt(y)}`
      ],
      simple: 'Combine as duas equações (multiplicando e somando/subtraindo) para eliminar uma variável, ache a outra e depois substitua para encontrar a primeira.',
      final: `x = ${fmt(x)}   e   y = ${fmt(y)}`,
      visual: sistemaArmado(rows)
    };
  }catch(e){ return null; }
}

function trySolveFunction(text){
  const m = text.match(/f\(x\)\s*=\s*([^,\.\n]+)[,\.\n].*f\(\s*(-?\d+(?:[.,]\d+)?)\s*\)/i);
  if(!m) return null;
  // protege a variável "x" antes de normalizar: normalizeExpr(), quando recebe só o corpo da
  // fórmula (sem o "f(" ou o "=" que davam contexto no texto original), interpreta um "x" isolado
  // como sinal de multiplicação e o apaga — isso corrompia fórmulas como "x² + 3x − 3" (coeficiente
  // 1 implícito) e fazia a conta dar um resultado errado sem avisar.
  const guarded = m[1].replace(/x/gi, 'QQVARQQ');
  const exprTemplate = normalizeExpr(guarded).replace(/qqvarqq/gi, 'x');
  const xVal = parseFloat(m[2].replace(',','.'));
  const substituted = exprTemplate.replace(/x/g, `(${xVal})`);
  try{
    const {result, steps} = evalArithmeticWithSteps(substituted);
    return {
      howTo: `Para calcular f(${fmt(xVal)}), substituímos x pelo valor ${fmt(xVal)} na fórmula da função.`,
      steps: [`f(${fmt(xVal)}) = ${exprTemplate.replace(/x/g, fmt(xVal))}`, ...steps.map(s=>s)],
      simple: 'Troque cada "x" da fórmula pelo número dado e resolva a expressão que sobrar.',
      final: `f(${fmt(xVal)}) = ${fmt(result)}`,
      visual: stepChain([`f(x) = ${exprTemplate}`, `f(${fmt(xVal)}) = ${exprTemplate.replace(/x/g, fmt(xVal))}`, `f(${fmt(xVal)}) = ${fmt(result)}`])
    };
  }catch(e){ return null; }
}

function trySolveRoot(text){
  let m = text.match(/raiz\s+c[uú]bica\s+de\s+(-?\d+(?:\.\d+)?)/);
  if(m){
    const n = parseFloat(m[1]);
    const r = Math.cbrt(n);
    return {
      howTo: 'A raiz cúbica de um número é o valor que, multiplicado por si mesmo três vezes, dá esse número.',
      steps: [`Procure x tal que x × x × x = ${fmt(n)}`, `x = ${fmt(r)}`],
      simple: 'Pense em qual número elevado ao cubo resulta no valor dado.',
      final: `${fmt(r)}`,
      visual: potStage(potRow([{root:true,n,e:3},'=',fmt(r)]))
    };
  }
  m = text.match(/sqrt\s*\(?\s*(-?\d+(?:\.\d+)?)\)?/) || text.match(/raiz\s+(?:quadrada\s+)?de\s+(-?\d+(?:\.\d+)?)/);
  if(m){
    const n = parseFloat(m[1]);
    if(n<0){
      return {
        howTo: 'A raiz quadrada de um número negativo não existe dentro dos números reais.',
        steps: [`${fmt(n)} é negativo, então não há raiz quadrada real.`],
        simple: 'Não é possível calcular a raiz quadrada de um número negativo com números reais.',
        final: 'Não existe (número negativo)'
      };
    }
    const r = Math.sqrt(n);
    return {
      howTo: 'A raiz quadrada de um número é o valor que, multiplicado por si mesmo, dá esse número.',
      steps: [`Procure x tal que x × x = ${fmt(n)}`, `x = ${fmt(r)}`],
      simple: 'Pense em qual número multiplicado por ele mesmo resulta no valor dado.',
      final: `${fmt(r)}`,
      visual: potStage(potRow([{root:true,n,e:2},'=',fmt(r)]))
    };
  }
  return null;
}

function trySolveArithmetic(text){
  if(text.includes('=') || /[a-zA-Z]/.test(text)) return null;
  if(!/[0-9]/.test(text)) return null;
  // caso especial: conta simples de dois números (A op B) — usa a conta armada / chave / vai um, igual aos exercícios
  const simple = text.match(/^\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*$/);
  if(simple){
    const [, aStr, op, bStr] = simple;
    const aIsInt = !aStr.includes('.'), bIsInt = !bStr.includes('.');
    if(aIsInt && bIsInt){
      const a = parseInt(aStr,10), b = parseInt(bStr,10);
      if(op==='+'){
        const {steps, result, carries} = addColumnSteps([a,b]);
        return { howTo:'Essa é uma soma. Vamos montar a conta armada, alinhando as casas, e somar coluna por coluna.', steps, simple:'Some coluna por coluna começando pelas unidades. Quando a soma passar de 9, escreve o último dígito e "vai um" para a próxima coluna.', final: result, visual: contaArmada([a,b],'+',result,carries) };
      }
      if(op==='-' && a>=b){
        const {steps, result, marks} = subColumnSteps(a,b);
        return { howTo:'Essa é uma subtração. Vamos montar a conta armada, com o maior número em cima, e subtrair coluna por coluna.', steps, simple:'Subtraia coluna por coluna começando pelas unidades. Quando o número de cima for menor, "empreste" 1 da casa vizinha.', final: result, visual: contaArmada([a,b],'−',result,null,marks) };
      }
      if(op==='-' && a<b){
        const {steps, result, marks} = subColumnSteps(b,a);
        return { howTo:'O primeiro número é menor que o segundo, então o resultado é negativo. Calculamos a diferença entre os dois e invertemos o sinal.', steps:[...steps, `Como ${a} é menor que ${b}, o resultado é negativo: −${result}`], simple:'Quando o número de cima seria menor que zero, calcule a diferença dos dois números normalmente e coloque o sinal de menos no resultado.', final: `−${result}`, visual: contaArmada([b,a],'−',result,null,marks) };
      }
      if(op==='*'){
        const bDigits = String(b).length;
        if(bDigits===1){
          const {steps, result, carries} = mulSingleDigitSteps(a,b);
          return { howTo:'Essa é uma multiplicação. Vamos montar a conta armada e multiplicar coluna por coluna, com "vai" quando passar de 9.', steps, simple:'Multiplique cada dígito de cima pelo número de baixo, da direita pra esquerda, "levando" quando o resultado passar de 9.', final: result, visual: multArmada(a,b,true,carries) };
        } else {
          const {steps, result} = mulLongSteps(a,b);
          return { howTo:'Essa é uma multiplicação por um número de mais de um dígito. Vamos multiplicar por cada dígito separadamente (produtos parciais) e depois somar.', steps, simple:'Multiplique o primeiro número por cada dígito do segundo, deslocando uma casa a cada vez, e some tudo no final.', final: result, visual: multArmada(a,b,true) };
        }
      }
      if(op==='/' && b>0){
        const {quotient, remainder} = longDivisionSteps(a,b);
        const steps = divisaoNarrativa(a,b);
        return { howTo:'Essa é uma divisão. Vamos montar a conta pelo método da chave, perguntando quantas vezes o divisor cabe em cada pedaço do dividendo.', steps, simple:'Veja quantas vezes o divisor cabe no começo do dividendo, multiplique e subtraia; desça o próximo dígito e repita até não sobrarem mais dígitos.', final: remainder>0 ? `${quotient} (resto ${remainder})` : `${quotient}`, visual: divisaoChave(a,b,true) };
      }
    } else {
      // pelo menos um dos números tem casas decimais
      const a = parseFloat(aStr), b = parseFloat(bStr);
      const decA = aStr.includes('.') ? aStr.split('.')[1].length : 0;
      const decB = bStr.includes('.') ? bStr.split('.')[1].length : 0;
      const fmtNum = (v,dp) => dp>0 ? v.toFixed(dp).replace('.',',') : String(v);
      if(op==='+'){
        const dp = Math.max(decA, decB);
        const intA = Math.round(a*Math.pow(10,dp)), intB = Math.round(b*Math.pow(10,dp));
        const {steps, result, carries} = addColumnSteps([intA,intB], dp);
        // "result" mantém as casas decimais alinhadas (ex: "6,00") para o visual da conta armada;
        // a resposta final exibida usa fmt() pra simplificar (ex: "6" em vez de "6,00").
        return { howTo:'Essa é uma soma com números decimais. Vamos alinhar pela vírgula e somar coluna por coluna.', steps, simple:'Alinhe as vírgulas uma embaixo da outra e some normalmente, descendo a vírgula no resultado.', final: fmt(parseFloat(result.replace(',','.'))), visual: contaArmada([fmtNum(a,decA),fmtNum(b,decB)],'+',result,carries) };
      }
      if(op==='-'){
        const dp = Math.max(decA, decB);
        const intA = Math.round(a*Math.pow(10,dp)), intB = Math.round(b*Math.pow(10,dp));
        if(intA>=intB){
          const {steps, result, marks} = subColumnSteps(intA,intB,dp);
          return { howTo:'Essa é uma subtração com números decimais. Vamos alinhar pela vírgula e subtrair coluna por coluna.', steps, simple:'Alinhe as vírgulas, subtraia normalmente e "empreste" quando precisar, descendo a vírgula no resultado.', final: fmt(parseFloat(result.replace(',','.'))), visual: contaArmada([fmtNum(a,decA),fmtNum(b,decB)],'−',result,null,marks) };
        }
      }
      if(op==='*'){
        const intA = Math.round(a*Math.pow(10,decA)), intB = Math.round(b*Math.pow(10,decB));
        const totalDec = decA+decB;
        const rawProduct = intA*intB;
        const finalResult = insertComma(String(rawProduct), totalDec);
        const mulRes = String(intB).length===1 ? mulSingleDigitSteps(intA,intB) : mulLongSteps(intA,intB);
        return {
          howTo:'Essa é uma multiplicação com números decimais. Vamos multiplicar ignorando as vírgulas e depois reposicioná-la.',
          steps:[...mulRes.steps, `Reposicione a vírgula, contando ${totalDec} casa(s) decimal(is) ao todo: ${finalResult}`],
          simple:'Multiplique os números como se fossem inteiros, ignorando a vírgula. Depois conte quantas casas decimais os dois tinham juntos, e reposicione a vírgula no resultado.',
          final: fmt(parseFloat(finalResult.replace(',','.'))),
          visual: potStage(multArmada(intA,intB,true, String(intB).length===1?mulRes.carries:undefined)) + potStage(chainRow([String(rawProduct),'→',finalResult]))
        };
      }
    }
  }
  try{
    const {result, steps, stages} = evalArithmeticWithStages(text);
    if(isNaN(result)) return null;
    return {
      howTo: 'Vamos resolver essa expressão numérica seguindo a ordem das operações: primeiro potências, depois multiplicação/divisão, e por último adição/subtração (respeitando parênteses).',
      steps: steps.length? steps : [`Resultado: ${fmt(result)}`],
      simple: 'Resolva primeiro o que está dentro dos parênteses e as potências, depois as multiplicações e divisões, e por último as somas e subtrações, sempre da esquerda para a direita.',
      final: `${fmt(result)}`,
      visual: stages.length>1 ? stepChain(stages) : undefined
    };
  }catch(e){ return null; }
}

// proporção explícita "a/b = c/d" com um dos quatro números sendo a incógnita "x" — regra de três.
function trySolveProportion(text){
  const m = text.match(/^\s*([\w.]+)\s*\/\s*([\w.]+)\s*=\s*([\w.]+)\s*\/\s*([\w.]+)\s*$/);
  if(!m) return null;
  const parts = [m[1], m[2], m[3], m[4]];
  const xIdx = parts.findIndex(p => p.toLowerCase()==='x');
  if(xIdx===-1) return null;
  const nums = parts.map(p => p.toLowerCase()==='x' ? null : parseFloat(p));
  if(nums.filter(n=>n===null).length !== 1 || nums.some(n=>n!==null && isNaN(n))) return null;
  const [a,b,c,d] = nums;
  let x;
  if(xIdx===0) x = (b*c)/d;
  else if(xIdx===1) x = (a*d)/c;
  else if(xIdx===2) x = (a*d)/b;
  else x = (b*c)/a;
  if(!isFinite(x)) return null;
  const shown = parts.map((p,i)=> i===xIdx ? fmt(x) : p);
  return {
    howTo: 'Isso é uma proporção — duas razões iguais. Vamos descobrir o valor que falta multiplicando cruzado.',
    steps: [
      `Multiplique cruzado: ${parts[0]} × ${parts[3]} = ${parts[1]} × ${parts[2]}`,
      `Isole a incógnita nessa igualdade`,
      `x = ${fmt(x)}`
    ],
    simple: 'Numa proporção a/b = c/d, o produto dos extremos é igual ao produto dos meios: a × d = b × c. Isole o valor que falta e resolva a divisão.',
    final: `x = ${fmt(x)}`,
    visual: proporcaoTable(null, [shown[0],shown[1]], [shown[2],shown[3]])
  };
}

function solveQuestion(raw){
  const text = normalizeExpr(raw);
  const attempts = [trySolveFunction, trySolveSystem, trySolveQuadratic, trySolveLinear, trySolveProportion, trySolveRoot, trySolvePercentage, trySolveFractionPair, trySolveArithmetic];
  for(const fn of attempts){
    const r = fn(text);
    if(r) return r;
  }
  return null;
}
