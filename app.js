/* =========================================================
   Matemática Show — dados, lógica de exercícios e resolvedor
   ========================================================= */

/* ---------------- logo ---------------- */
const LOGO_URI = 'logo.png';

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[randInt(0,arr.length-1)]; }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }
function simplifyFrac(n,d){ if(d<0){n=-n;d=-d;} const g=gcd(n,d); return [n/g, d/g]; }
function fmt(n){
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return (Math.round(n*100)/100).toString().replace('.', ',');
}
function shuffle(arr){
  for(let i=arr.length-1; i>0; i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
/* decomposição em fatores primos: 12 → {2:2, 3:1} */
function primeFactors(n){ const f = {}; let d = 2; while(n>1){ while(n%d===0){ f[d]=(f[d]||0)+1; n/=d; } d++; } return f; }
function factorsStr(f){ const ks = Object.keys(f); return ks.length ? ks.map(k=>f[k]>1?`${k}<sup>${f[k]}</sup>`:k).join(' × ') : '1'; }
function mmcSteps(a,b){
  const fa = primeFactors(a), fb = primeFactors(b), keys = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].sort((x,y)=>x-y);
  const used = keys.map(k=>{ const e = Math.max(fa[k]||0, fb[k]||0); return e>1?`${k}<sup>${e}</sup>`:k; });
  return [`Fatore: ${a} = ${factorsStr(fa)} · ${b} = ${factorsStr(fb)}`, `Pegue todos os fatores, cada um com o maior expoente: ${used.join(' × ')}`, `MMC(${a}, ${b}) = ${lcm(a,b)}`];
}
function mdcSteps(a,b){
  const fa = primeFactors(a), fb = primeFactors(b), common = Object.keys(fa).filter(k=>fb[k]).sort((x,y)=>x-y);
  const used = common.map(k=>{ const e = Math.min(fa[k], fb[k]); return e>1?`${k}<sup>${e}</sup>`:k; });
  return [`Fatore: ${a} = ${factorsStr(fa)} · ${b} = ${factorsStr(fb)}`,
    common.length ? `Pegue só os fatores em comum, cada um com o menor expoente: ${used.join(' × ')}` : 'Eles não têm fator primo em comum.',
    `MDC(${a}, ${b}) = ${gcd(a,b)}`];
}
function brl(cents){ return 'R$ ' + (cents/100).toFixed(2).replace('.', ','); }
function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
function fracStr(n,d){ const [a,b]=simplifyFrac(n,d); return b===1? String(a) : (a+"/"+b); }

/* ---------------- MMC: lista os múltiplos de cada número lado a lado até achar o comum ---------------- */
// mostra o MMC dos denominadores junto com a fração equivalente que nasce de cada um —
// cada coluna reúne "múltiplos deste denominador" + "a fração que ele virou", lado a lado
// com a outra fração, pra ficar claro que cada lista pertence à fração ao seu lado.
function mmcFracVisual(n1, d1, n2, d2){
  const L = lcm(d1, d2);
  const f1 = L/d1, f2 = L/d2;
  const maxCount = Math.max(f1, f2);
  function col(n, d, f){
    let chips = '';
    // preenche o topo da coluna mais curta com espaços invisíveis, pra o número destacado
    // (o MMC) ficar na mesma altura nas duas colunas — mais fácil de comparar de relance.
    for(let p=0; p<maxCount-f; p++){ chips += `<div class="mmc-chip ghost"></div>`; }
    for(let i=1;i<=f;i++){
      chips += `<div class="mmc-chip${i===f?' hit':''}">${d*i}</div>`;
    }
    return `<div class="mmc-col">
      <div class="mmc-col-label">Múltiplos de ${d}</div>
      <div class="mmc-chips">${chips}</div>
      <div class="mmc-col-arrow">↓</div>
      <div class="mmc-col-frac">${fracRow([{n,d}, '×', {n:f,d:f}, '=', {n:n*f,d:L}])}</div>
    </div>`;
  }
  return `<div class="mmc-block">
    <div class="mmc-cols">${col(n1,d1,f1)}${col(n2,d2,f2)}</div>
    <div class="mmc-result">MMC(${d1}, ${d2}) = ${L}</div>
  </div>`;
}
// fatoração em coluna (método da "escadinha"): divide os dois números ao mesmo tempo pelo menor
// número primo que couber em pelo menos um deles. Quem não for divisível "repete" na linha de
// baixo. Termina quando os dois números da esquerda chegam a 1; o MMC é o produto de todos os
// primos usados na coluna da direita.
function fatoracaoColuna(a, b){
  function divides(n, d){ return n > 1 && n % d === 0; }
  let x = a, y = b, divisor = 2;
  const rows = [];
  while(x > 1 || y > 1){
    while(!divides(x, divisor) && !divides(y, divisor)){ divisor++; }
    const xDiv = divides(x, divisor), yDiv = divides(y, divisor);
    rows.push({x, y, divisor, xDiv, yDiv});
    x = xDiv ? x/divisor : x;
    y = yDiv ? y/divisor : y;
  }
  rows.push({x, y, divisor:null});
  const primes = rows.filter(r=>r.divisor).map(r=>r.divisor);
  const L = primes.reduce((p,c)=>p*c, 1);
  const rowsHtml = rows.map(r=>`
    <div class="fat-row">
      <div class="fat-nums">
        <span class="fat-num${r.divisor && !r.xDiv ? ' same':''}">${r.x}</span>
        <span class="fat-num${r.divisor && !r.yDiv ? ' same':''}">${r.y}</span>
      </div>
      <div class="fat-div">${r.divisor||''}</div>
    </div>`).join('');
  const html = `<div class="fat-table">${rowsHtml}</div>
    <div class="fat-mult">${primes.join(' × ')} = ${L}</div>
    <div class="mmc-result">MMC(${a}, ${b}) = ${L}</div>`;
  return {html, primes, L};
}
// depois de achar o MMC (por qualquer método), usa esse número pra mostrar em quê cada fração se
// transforma — lado a lado, pra ficar claro que o MMC vira o novo denominador das duas.
function fracTransformPair(n1, d1, n2, d2, L){
  const f1 = L/d1, f2 = L/d2;
  function col(n, d, f){
    return `<div class="mmc-col">
      <div class="mmc-col-label">${n}/${d} vira</div>
      <div class="mmc-col-frac">${fracRow([{n,d}, '×', {n:f,d:f}, '=', {n:n*f,d:L}])}</div>
    </div>`;
  }
  return `<div class="mmc-cols">${col(n1,d1,f1)}${col(n2,d2,f2)}</div>`;
}
// fatoração em coluna pra 2 OU MAIS números ao mesmo tempo (estilo "escadinha" clássico de sala de
// aula): divide todos os números pelo menor primo que couber em pelo menos um deles a cada linha;
// quem não for divisível "repete" (desce igual). Termina quando todos chegam a 1.
function mmcColuna(nums){
  function divides(n, d){ return n > 1 && n % d === 0; }
  let cur = nums.slice();
  const rows = [cur.slice()];
  const primes = [];
  let divisor = 2;
  while(cur.some(n=>n>1)){
    while(!cur.some(n=>divides(n,divisor))){ divisor++; }
    primes.push(divisor);
    cur = cur.map(n => divides(n,divisor) ? n/divisor : n);
    rows.push(cur.slice());
  }
  const L = primes.reduce((p,c)=>p*c, 1);
  const numsColHtml = rows.map(r=>
    `<div class="mfat-nums-row">${r.map(v=>`<span class="mfat-num">${v}</span>`).join('')}</div>`
  ).join('');
  const primesColHtml = rows.map((r,i)=>{
    const isFinal = i === rows.length-1;
    const content = isFinal
      ? `<span class="mfat-result">${L}</span>`
      : `<span class="mfat-prime">${i===0?'':'×'}${primes[i]}</span>`;
    return `<div class="mfat-primes-row${isFinal?' mfat-final-row':''}">${content}</div>`;
  }).join('');
  const html = `<div class="mfat-table"><div class="mfat-nums-col">${numsColHtml}</div><div class="mfat-primes-col">${primesColHtml}</div></div>`;
  return { html, primes, L };
}
// soma (ou subtrai) uma cadeia de 2+ frações com denominadores diferentes: mostra a equação
// original, o resultado (numeradores já transformados, em cima; o MMC, embaixo, como numa fração
// só), e a fatoração em coluna que achou esse MMC — igual ao método do quadro de aula.
// terms: [{n,d}, ...]. ops: sinais entre os termos ('+' ou '−'), tamanho terms.length-1.
function fracChainMMC(terms, ops){
  const denoms = terms.map(t=>t.d);
  const {html: mfatHtml, L} = mmcColuna(denoms);
  const factors = denoms.map(d => L/d);
  const newNums = terms.map((t,i)=> t.n*factors[i]);
  const chainParts = [];
  terms.forEach((t,i)=>{
    if(i>0) chainParts.push(ops[i-1]);
    chainParts.push({n:t.n, d:t.d});
  });
  chainParts.push('=');
  const eqHtml = fracRow(chainParts);
  let numChain = String(newNums[0]);
  for(let i=1;i<newNums.length;i++){ numChain += ` ${ops[i-1]} ${newNums[i]}`; }
  const finalFracHtml = `<div class="mmc-final-frac"><div class="num-chain">${numChain}</div><div class="den-val">${L}</div></div>`;
  return `<div class="frac-mmc-block">
    <div class="frac-mmc-eq">${eqHtml}${finalFracHtml}</div>
    <div class="frac-mmc-link">↓ de onde vem o ${L}? Veja o MMC calculado aqui embaixo:</div>
    ${mfatHtml}
  </div>`;
}
// mostra a divisão de simplificação só quando o resultado realmente pode ser simplificado —
// assim a explicação não fica pesada nos casos em que já está na forma mais simples.
function fracSimplifyStep(num, den){
  const g = gcd(num, den);
  if(g<=1) return [`Resultado: ${fracStr(num,den)}`];
  return [
    potStage(fracRow([{n:num,d:den}, '÷', {n:g,d:g}, '=', {n:num/g,d:den/g}])),
    `Simplificado: ${fracStr(num,den)}`
  ];
}

/* ---------------- conta armada: unidade sob unidade, dezena sob dezena ---------------- */
// nums: array de números/strings (operandos, de cima para baixo). op: '+', '−' ou '×'.
// result: string opcional do resultado, mostrado abaixo do traço.
/* ---------------- passo a passo real de contas armadas (com "vai um" / "empresta") ---------------- */
const PLACE_NAMES = ['unidades','dezenas','centenas','milhares','dezenas de milhar','centenas de milhar'];
const DECIMAL_NAMES = ['décimos','centésimos','milésimos'];
function cap1(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function placeName(col, decimalPlaces){
  if(col < decimalPlaces){
    const idx = decimalPlaces - 1 - col; // idx 0 = décimos (casa mais à esquerda das decimais), 1 = centésimos, ...
    return DECIMAL_NAMES[idx] || `casa decimal ${idx+1}`;
  }
  const i = col - decimalPlaces;
  return PLACE_NAMES[i] || `casa ${i+1}`;
}
function toDigitsInt(n){ return String(Math.abs(Math.round(n))).split('').reverse().map(Number); }
function insertComma(numStr, decimals){
  if(decimals<=0) return numStr;
  let neg = numStr.startsWith('-'); if(neg) numStr = numStr.slice(1);
  while(numStr.length <= decimals) numStr = '0'+numStr;
  const ip = numStr.slice(0, numStr.length-decimals) || '0';
  const dp = numStr.slice(numStr.length-decimals);
  return (neg?'-':'') + ip + ',' + dp;
}
// soma coluna por coluna, com "vai um". nums: inteiros (já escalados se decimais). decimalPlaces: nº de casas decimais representadas.
function addColumnSteps(nums, decimalPlaces){
  decimalPlaces = decimalPlaces||0;
  const digitArrays = nums.map(toDigitsInt);
  const maxLen = Math.max(...digitArrays.map(d=>d.length));
  let carry = 0;
  const steps = [];
  const resultDigits = [];
  const carries = []; // carries[col] = "vai" recebido na coluna col (carries[0] sempre 0)
  for(let col=0; col<maxLen; col++){
    carries[col] = carry;
    const colDigits = digitArrays.map(d => d[col] || 0);
    const sum = colDigits.reduce((a,b)=>a+b,0) + carry;
    const digit = sum % 10;
    const newCarry = Math.floor(sum/10);
    const place = placeName(col, decimalPlaces);
    const terms = colDigits.join(' + ') + (carry ? ` + ${carry} (transporte)` : '');
    let line = `${cap1(place)}: ${terms} = ${sum}`;
    line += newCarry>0 ? ` → escreve ${digit}, vai ${newCarry}` : ` → escreve ${digit}`;
    steps.push(line);
    resultDigits.push(digit);
    carry = newCarry;
  }
  if(carry>0){ steps.push(`Sobrou ${carry} do transporte: escreve ${carry} na casa seguinte.`); resultDigits.push(carry); }
  const resultRaw = resultDigits.reverse().join('').replace(/^0+(?=\d)/,'');
  const result = insertComma(resultRaw, decimalPlaces);
  steps.push(`Resultado: ${result}`);
  return {steps, result, carries};
}
// subtrai a - b, coluna por coluna, com "empresta". a deve ser ≥ b.
function subColumnSteps(a, b, decimalPlaces){
  decimalPlaces = decimalPlaces||0;
  const da = toDigitsInt(a), db = toDigitsInt(b);
  const maxLen = Math.max(da.length, db.length);
  let borrow = 0;
  const steps = [];
  const resultDigits = [];
  const marks = []; // marks[col] = {type:'lend', value} (dígito riscado, mostra o valor reduzido) | {type:'receive'} (pequeno "1" — emprestou) | null
  for(let col=0; col<maxLen; col++){
    const borrowIn = borrow;
    const top0 = da[col]||0;
    const bottom = db[col]||0;
    const place = placeName(col, decimalPlaces);
    let top = top0 - borrowIn;
    let borrowOut, digit;
    if(top < bottom){
      digit = top+10-bottom;
      steps.push(`${cap1(place)}: ${top0}${borrowIn?` (já emprestou, ficou ${top})`:''} é menor que ${bottom} → empresta 1 da casa vizinha: ${top+10} − ${bottom} = ${digit}`);
      borrowOut = 1;
    } else {
      digit = top-bottom;
      steps.push(`${cap1(place)}: ${top} − ${bottom} = ${digit}`);
      borrowOut = 0;
    }
    if(borrowIn){ marks[col] = {type:'lend', value: top0 - borrowIn + 10*borrowOut}; }
    else if(borrowOut){ marks[col] = {type:'receive'}; }
    else { marks[col] = null; }
    resultDigits.push(digit);
    borrow = borrowOut;
  }
  const resultRaw = resultDigits.reverse().join('').replace(/^0+(?=\d)/,'') || '0';
  const result = insertComma(resultRaw, decimalPlaces);
  steps.push(`Resultado: ${result}`);
  return {steps, result, marks};
}
// multiplica a (inteiro) por m (dígito único 0-9), coluna por coluna, com "vai".
function mulSingleDigitSteps(a, m){
  const da = toDigitsInt(a);
  let carry = 0;
  const steps = [];
  const resultDigits = [];
  const carries = [];
  for(let col=0; col<da.length; col++){
    carries[col] = carry;
    const prod = da[col]*m + carry;
    const digit = prod % 10;
    const newCarry = Math.floor(prod/10);
    const place = placeName(col, 0);
    let line = `${cap1(place)} de ${a}: ${da[col]} × ${m}` + (carry? ` + ${carry} (transporte)`:'') + ` = ${prod}`;
    line += newCarry>0 ? ` → escreve ${digit}, vai ${newCarry}` : ` → escreve ${digit}`;
    steps.push(line);
    resultDigits.push(digit);
    carry = newCarry;
  }
  if(carry>0){ steps.push(`Sobrou ${carry} do transporte: escreve ${carry} na próxima casa.`); resultDigits.push(carry); }
  const result = resultDigits.reverse().join('').replace(/^0+(?=\d)/,'');
  steps.push(`Resultado: ${result}`);
  return {steps, result: Number(result), carries};
}
// multiplicação longa: a × b, com b de vários dígitos — produtos parciais deslocados e somados.
function mulLongSteps(a, b){
  const bDigits = String(b).split('').reverse();
  const steps = [];
  const partials = [];
  bDigits.forEach((chStr, i)=>{
    const d = Number(chStr);
    const partial = a*d*Math.pow(10,i);
    partials.push(partial);
    const label = i===0 ? `unidade de ${b} (${d})` : i===1 ? `dezena de ${b} (${d}, vale ${d*10})` : `${placeName(i,0)} de ${b} (${d}, vale ${d*Math.pow(10,i)})`;
    steps.push(`Multiplique ${a} pela ${label}: ${a} × ${d*Math.pow(10,i)} = ${partial}`);
  });
  steps.push(`Some os produtos parciais: ${partials.join(' + ')} = ${a*b}`);
  return {steps, partials, result: a*b};
}
// conta armada de multiplicação: opera armando a×b, com produtos parciais deslocados quando b tem 2+ dígitos.
function multArmada(a, b, solved, carries){
  function parse(v){
    let s = String(v).trim();
    let neg = s.startsWith('-') || s.startsWith('−');
    if(neg) s = s.slice(1);
    const [ip, dp] = s.split(',');
    return {neg, ip: ip || '0', dp: dp || ''};
  }
  const bDigits = String(b).split('');
  const multiDigit = bDigits.length > 1;
  const partials = multiDigit ? bDigits.slice().reverse().map((ch,i)=> a*Number(ch)*Math.pow(10,i)) : [];
  const result = a*b;
  const allValues = [a, b].concat(solved ? [result, ...partials] : []);
  const parsedAll = allValues.map(parse);
  const maxIp = Math.max(...parsedAll.map(p=>p.ip.length));
  function rowCells(p, sign){
    let out = `<span class="ca-cell ca-sign">${sign||''}</span>`;
    const ip = p.ip.padStart(maxIp, '\u00A0');
    for(const ch of ip) out += `<span class="ca-cell">${ch}</span>`;
    return out;
  }
  let rows = '';
  if(solved && !multiDigit && carries && carries.some(c=>c>0)){
    const ipChars = new Array(maxIp).fill('');
    for(let col=1; col<maxIp; col++){
      const val = carries[col];
      if(val) ipChars[maxIp-1-col] = String(val);
    }
    let carryRow = `<span class="ca-cell ca-sign">\u00A0</span>`;
    ipChars.forEach(ch=>{ carryRow += `<span class="ca-cell">${ch||'\u00A0'}</span>`; });
    rows += `<div class="ca-row ca-carry-row">${carryRow}</div>`;
  }
  rows += `<div class="ca-row">${rowCells(parse(a), '')}</div>`;
  rows += `<div class="ca-row">${rowCells(parse(b), '×')}</div>`;
  rows += `<div class="ca-line"></div>`;
  if(solved){
    if(multiDigit){
      partials.forEach(p=>{ rows += `<div class="ca-row">${rowCells(parse(p), '')}</div>`; });
      rows += `<div class="ca-line"></div>`;
    }
    rows += `<div class="ca-row ca-result">${rowCells(parse(result), '')}</div>`;
  }
  return `<div class="conta-armada">${rows}</div>`;
}

function contaArmada(nums, op, result, carries, topMarks){
  function parse(v){
    let s = String(v).trim();
    let neg = s.startsWith('-') || s.startsWith('−');
    if(neg) s = s.slice(1);
    const [ip, dp] = s.split(',');
    return {neg, ip: ip || '0', dp: dp || ''};
  }
  const parsedNums = nums.map(parse);
  const parsedResult = (result!=null && result!=='') ? parse(result) : null;
  const all = parsedResult ? parsedNums.concat([parsedResult]) : parsedNums;
  const maxIp = Math.max(...all.map(p=>p.ip.length));
  const maxDp = Math.max(...all.map(p=>p.dp.length));
  const hasDp = maxDp > 0;

  function rowCells(p, sign, strike){
    let out = `<span class="ca-cell ca-sign">${sign||''}</span>`;
    const ip = p.ip.padStart(maxIp, '\u00A0');
    [...ip].forEach((ch,idx)=>{
      out += `<span class="ca-cell${strike && strike.has('ip'+idx) ? ' ca-strike':''}">${ch}</span>`;
    });
    if(hasDp){
      out += `<span class="ca-cell ca-comma">${p.dp ? ',' : '\u00A0'}</span>`;
      const dp = p.dp.padEnd(maxDp, '\u00A0');
      [...dp].forEach((ch,idx)=>{
        out += `<span class="ca-cell${strike && strike.has('dp'+idx) ? ' ca-strike':''}">${ch}</span>`;
      });
    }
    return out;
  }

  let rows = '';
  if(carries && carries.some(c=>c>0)){
    const dpChars = new Array(maxDp).fill('');
    const ipChars = new Array(maxIp).fill('');
    for(let col=1; col<maxDp+maxIp; col++){
      const val = carries[col];
      if(!val) continue;
      if(col < maxDp) dpChars[maxDp-1-col] = String(val);
      else { const c2 = col-maxDp; if(c2 < maxIp) ipChars[maxIp-1-c2] = String(val); }
    }
    let carryRow = `<span class="ca-cell ca-sign">\u00A0</span>`;
    ipChars.forEach(ch=>{ carryRow += `<span class="ca-cell">${ch||'\u00A0'}</span>`; });
    if(hasDp){
      carryRow += `<span class="ca-cell ca-comma">\u00A0</span>`;
      dpChars.forEach(ch=>{ carryRow += `<span class="ca-cell">${ch||'\u00A0'}</span>`; });
    }
    rows += `<div class="ca-row ca-carry-row">${carryRow}</div>`;
  }
  let strikeSet = null;
  if(topMarks && topMarks.some(m=>m)){
    const dpAnn = new Array(maxDp).fill(null);
    const ipAnn = new Array(maxIp).fill(null);
    for(let col=0; col<maxDp+maxIp; col++){
      const m = topMarks[col];
      if(!m) continue;
      if(col < maxDp) dpAnn[maxDp-1-col] = m;
      else { const c2 = col-maxDp; if(c2 < maxIp) ipAnn[maxIp-1-c2] = m; }
    }
    strikeSet = new Set();
    let markRow = `<span class="ca-cell ca-sign">\u00A0</span>`;
    ipAnn.forEach((m,idx)=>{
      if(m && m.type==='lend'){ markRow += `<span class="ca-cell ca-borrow-mark">${m.value}</span>`; strikeSet.add('ip'+idx); }
      else if(m && m.type==='receive'){ markRow += `<span class="ca-cell ca-borrow-mark">1</span>`; }
      else markRow += `<span class="ca-cell">\u00A0</span>`;
    });
    if(hasDp){
      markRow += `<span class="ca-cell ca-comma">\u00A0</span>`;
      dpAnn.forEach((m,idx)=>{
        if(m && m.type==='lend'){ markRow += `<span class="ca-cell ca-borrow-mark">${m.value}</span>`; strikeSet.add('dp'+idx); }
        else if(m && m.type==='receive'){ markRow += `<span class="ca-cell ca-borrow-mark">1</span>`; }
        else markRow += `<span class="ca-cell">\u00A0</span>`;
      });
    }
    rows += `<div class="ca-row ca-carry-row">${markRow}</div>`;
  }
  rows += parsedNums.map((p,i)=>{
    const sign = p.neg ? '−' : (i===parsedNums.length-1 ? op : '');
    return `<div class="ca-row">${rowCells(p, sign, i===0 ? strikeSet : null)}</div>`;
  }).join('');
  rows += `<div class="ca-line"></div>`;
  if(parsedResult){
    rows += `<div class="ca-row ca-result">${rowCells(parsedResult, '')}</div>`;
  }
  return `<div class="conta-armada">${rows}</div>`;
}

/* ---------------- fração visual: numerador sobre denominador ---------------- */
// parts: array de itens — {n, d} vira uma fração empilhada; string vira operador/texto (+, −, ×, =, ?).
function fracRow(parts){
  const html = parts.map(p=>{
    if(p && typeof p === 'object'){
      return `<span class="frac-item"><span class="num">${p.n}</span><span class="bar"></span><span class="den">${p.d}</span></span>`;
    }
    return `<span class="frac-op">${p}</span>`;
  }).join('');
  return `<div class="frac-row">${html}</div>`;
}

/* ---------------- cadeia de termos: base × base × base = ?, a + b × c = ? ---------------- */
function chainRow(tokens){
  const ops = ['+','−','×','÷','=','∝',':'];
  const html = tokens.map(t=>{
    const s = String(t);
    return `<span class="${ops.includes(s)?'chain-op':'chain-val'}">${s}</span>`;
  }).join('');
  return `<div class="chain-row">${html}</div>`;
}

/* ---------------- escada de passos: cada linha é um estágio da resolução ---------------- */
function stepChain(lines){
  const rows = lines.map((l,i)=> `<div class="eq-line">${l}</div>` + (i<lines.length-1 ? `<div class="eq-arrow">↓</div>` : '')).join('');
  return `<div class="step-chain">${rows}</div>`;
}
// passo a passo completo da fórmula de Bhaskara: mostra a substituição de cada valor (com
// parênteses no b negativo, pra não confundir na hora de elevar ao quadrado), a raiz do
// discriminante calculada à parte, e as duas raízes resolvidas uma de cada vez — em vez de
// pular direto da fórmula pro resultado final.
function bhaskaraSteps(a,b,c){
  const D = b*b - 4*a*c;
  const bStr = b<0 ? `(${b})` : `${b}`;
  const cStr = c<0 ? `(${c})` : `${c}`;
  const fourAC = 4*a*c;
  const fourACLine = fourAC<0 ? `+ ${Math.abs(fourAC)}` : `− ${fourAC}`;
  const negB = -b;
  const negBStr = negB<0 ? `(${negB})` : `${negB}`;
  const steps = [
    `Identifique os coeficientes: a = ${a}, b = ${b}, c = ${c}`,
    `Calcule o discriminante: Δ = b² − 4ac = ${bStr}² − 4×${a}×${cStr} = ${b*b} ${fourACLine} = ${D}`,
  ];
  if(D < 0){
    steps.push(`Δ é negativo (${D}) — não existe raiz quadrada de número negativo, então essa equação não tem solução real.`);
    steps.push(`Conjunto solução: S = { } (conjunto vazio)`);
    return steps;
  }
  const sqrtD = Math.sqrt(D);
  steps.push(`Calcule a raiz do discriminante: √Δ = √${D} = ${fmt(sqrtD)}`);
  const xPlus = (negB + sqrtD) / (2*a), xMinus = (negB - sqrtD) / (2*a);
  if(D === 0){
    steps.push(`Como Δ = 0, as duas raízes são iguais: x = −b / 2a = ${negBStr} / ${2*a} = ${fmt(xPlus)}`);
    steps.push(`Conjunto solução: S = {${fmt(xPlus)}}`);
    return steps;
  }
  steps.push(`Calcule a 1ª raiz (usando +): x' = (−b + √Δ) / 2a = (${negBStr} + ${fmt(sqrtD)}) / ${2*a} = ${fmt(xPlus)}`);
  steps.push(`Calcule a 2ª raiz (usando −): x'' = (−b − √Δ) / 2a = (${negBStr} − ${fmt(sqrtD)}) / ${2*a} = ${fmt(xMinus)}`);
  steps.push(`Raízes: x' = ${fmt(xPlus)}  e  x'' = ${fmt(xMinus)}`);
  steps.push(`Conjunto solução: S = {${fmt(xPlus)}, ${fmt(xMinus)}}`);
  return steps;
}

/* ---------------- cartão de resolução estilo "caderno": a,b,c / Δ em caixa / frações das raízes / S em caixa ---------------- */
/* ---------------- fórmula geral de Bhaskara (reutilizável): x = -b±√Δ/2a, ou seja x = -b±√(b²-4ac)/2a ---------------- */
function bhaskaraFormulaBox(){
  return `<div class="bk-formula-box">
    <div class="bk-formula-row">x = ${fracRow([{n:'−b ± √Δ', d:'2a'}])}</div>
    <div class="bk-formula-sep">ou seja</div>
    <div class="bk-formula-row">x = ${fracRow([{n:'−b ± √(b² − 4ac)', d:'2a'}])}</div>
  </div>`;
}
function bhaskaraCard(a,b,c,skipFormula){
  const D = b*b - 4*a*c;
  const bStr = b<0 ? `(${b})` : `${b}`;
  const cStr = c<0 ? `(${c})` : `${c}`;
  const fourAC = 4*a*c;
  const fourACLine = fourAC<0 ? `+ ${Math.abs(fourAC)}` : `− ${fourAC}`;
  const negB = -b;
  const negBStr = negB<0 ? `(${negB})` : `${negB}`;
  let html = `<div class="bhaskara-card">`;
  html += `<div class="bk-row">a = ${a}, &nbsp;&nbsp; b = ${b}, &nbsp;&nbsp; c = ${c}</div>`;
  html += `<div class="bk-row">Δ = b² − 4ac = ${bStr}² − 4·${a}·${cStr} = ${b*b} ${fourACLine} <span class="bk-badge">Δ = ${D}</span></div>`;
  if(D < 0){
    html += `<div class="bk-row">Não existe raiz quadrada de número negativo — não há solução real.</div>`;
    html += `<div class="bk-final"><span class="bk-badge bk-badge-final">S = { }</span></div></div>`;
    return html;
  }
  const sqrtD = Math.sqrt(D);
  if(!skipFormula) html += `<div class="bk-row">x = (−b ± √Δ) / 2a</div>`;
  if(D === 0){
    const x0 = negB/(2*a);
    html += `<div class="bk-row">x = ${fracRow([{n:negBStr, d:`2·${a}`}])}</div>`;
    html += `<div class="bk-roots"><div class="bk-root-item"><span>x =</span> ${fracRow([{n:negBStr, d:`${2*a}`}])} <span>= ${fmt(x0)}</span></div></div>`;
    html += `<div class="bk-final"><span class="bk-badge bk-badge-final">S = {${fmt(x0)}}</span></div></div>`;
    return html;
  }
  const xPlus = (negB+sqrtD)/(2*a), xMinus = (negB-sqrtD)/(2*a);
  html += `<div class="bk-row">x = ${fracRow([{n:`${negBStr} ± √${D}`, d:`2·${a}`}])}</div>`;
  html += `<div class="bk-row">x = ${fracRow([{n:`${negBStr} ± ${fmt(sqrtD)}`, d:`${2*a}`}])}</div>`;
  html += `<div class="bk-roots">
    <div class="bk-root-item"><span>x₁ =</span> ${fracRow([{n:fmt(negB+sqrtD), d:`${2*a}`}])} <span>= ${fmt(xPlus)}</span></div>
    <div class="bk-root-item"><span>x₂ =</span> ${fracRow([{n:fmt(negB-sqrtD), d:`${2*a}`}])} <span>= ${fmt(xMinus)}</span></div>
  </div>`;
  html += `<div class="bk-final"><span class="bk-badge bk-badge-final">S = {${fmt(xMinus)}, ${fmt(xPlus)}}</span></div></div>`;
  return html;
}

/* ---------------- selo visual: proporção direta ou inversa ---------------- */
function proporcaoTag(tipo){
  const isDireta = tipo==='direta';
  return `<div class="prop-tag ${isDireta?'direta':'inversa'}">${isDireta ? '↑ ↑ Direta — as duas aumentam juntas' : '↑ ↓ Inversa — uma aumenta, a outra diminui'}</div>`;
}
/* ---------------- tabela de proporção: duas grandezas, duas linhas ---------------- */
function proporcaoTable(headers, row1, row2){
  const cell = v => `<div class="prop-cell ${String(v)==='?'||String(v)==='x'?'unknown':''}">${v}</div>`;
  const head = headers ? `<div class="prop-cell prop-head">${headers[0]}</div><div class="prop-cell prop-head">${headers[1]}</div>` : '';
  return `<div class="prop-table">${head}${cell(row1[0])}${cell(row1[1])}${cell(row2[0])}${cell(row2[1])}</div>`;
}
/* ---------------- multiplicação em cruz: mesma tabela, com as diagonais ligadas por linhas vermelhas ---------------- */
function cruzVisual(headers, row1, row2){
  const cell = (v,pos) => `<div class="ch-cell ${pos} ${String(v)==='?'||String(v)==='x'?'unknown':''}">${v}</div>`;
  const heads = headers ? `<div class="ch-heads"><div class="ch-head">${headers[0]}</div><div class="ch-head">${headers[1]}</div></div>` : '';
  return `<div class="cruz-box">${heads}<div class="ch-data">${cell(row1[0],'tl')}${cell(row1[1],'tr')}${cell(row2[0],'bl')}${cell(row2[1],'br')}<svg viewBox="0 0 220 104" preserveAspectRatio="none"><line x1="35" y1="17" x2="185" y2="87"/><line x1="35" y1="87" x2="185" y2="17"/></svg></div></div>`;
}
/* ---------------- mini-gráfico de reta: mostra visualmente a função crescente ou decrescente, com b e a raiz marcados ---------------- */
function linearGraphSVG(kind){
  const isCres = kind==='crescente';
  const lineColor = isCres ? 'var(--pine)' : 'var(--coral)';
  const p1 = isCres ? '15,150' : '15,40';
  const p2 = isCres ? '200,55' : '200,150';
  const bPoint = isCres ? {x:40,y:145} : {x:40,y:48};
  const raizPoint = isCres ? {x:112,y:120} : {x:128,y:120};
  return `<div class="lin-graph">
    <div class="lin-graph-label">${isCres ? 'Se a > 0 — crescente' : 'Se a < 0 — decrescente'}</div>
    <svg class="lin-graph-svg" viewBox="0 0 220 170">
      <line x1="10" y1="120" x2="212" y2="120" class="lg-axis"/>
      <line x1="40" y1="162" x2="40" y2="8" class="lg-axis"/>
      <polyline points="${p1} ${p2}" class="lg-line" style="stroke:${lineColor}"/>
      <circle cx="${bPoint.x}" cy="${bPoint.y}" r="4" class="lg-dot lg-dot-b"/>
      <circle cx="${raizPoint.x}" cy="${raizPoint.y}" r="4" class="lg-dot lg-dot-raiz"/>
      <text x="${bPoint.x-14}" y="${bPoint.y+(isCres?16:-8)}" class="lg-text lg-text-b">b</text>
      <text x="${raizPoint.x-8}" y="${raizPoint.y-10}" class="lg-text lg-text-raiz">raiz</text>
    </svg>
  </div>`;
}

/* ---------------- sistema empilhado: equações alinhadas coluna a coluna ---------------- */
// rows: [{x,y,c}, {x,y,c}, ...] cada termo já formatado como string (ex: '2x', '+ y', '= 7').
// sumRow: opcional, linha do resultado após o traço (soma/eliminação).
function sistemaArmado(rows, sumRow){
  const rowHtml = r => `<div class="sis-row"><span class="sis-term">${r.x}</span><span class="sis-term">${r.y}</span><span class="sis-eq">=</span><span class="sis-term">${r.c}</span></div>`;
  let out = rows.map(rowHtml).join('');
  if(sumRow){ out += `<div class="sis-line"></div>${rowHtml(sumRow)}`; }
  return `<div class="sis-stack">${out}</div>`;
}

/* ---------------- divisão pela chave: calcula os blocos do algoritmo ---------------- */
// dividend, divisor: inteiros positivos. Retorna {quotient, remainder, blocks}.
// cada block = {current, q, product, newRemainder} — o "current" é o pedaço do dividendo sendo dividido naquele passo.
function longDivisionSteps(dividend, divisor){
  const digits = String(dividend).split('').map(Number);
  let remainder = 0;
  const blocks = [];
  const quotientDigits = [];
  let started = false;
  for(let i=0;i<digits.length;i++){
    remainder = remainder*10 + digits[i];
    if(!started && remainder < divisor && i < digits.length-1){ continue; }
    started = true;
    const q = Math.floor(remainder/divisor);
    const product = q*divisor;
    blocks.push({current: remainder, q, product, newRemainder: remainder-product, endIdx: i});
    quotientDigits.push(q);
    remainder = remainder - product;
  }
  const quotient = quotientDigits.length ? Number(quotientDigits.join('')) : 0;
  return {quotient, remainder, blocks};
}
// monta o visual da "chave": dividendo à esquerda com os passos de subtração, divisor e quociente à direita.
// solved=false mostra só a "casinha" montada (dividendo e divisor), sem os passos nem o quociente — usado na pergunta, sem entregar a resposta.
function divisaoChave(dividend, divisor, solved){
  const totalCols = String(dividend).length;
  function cellsRow(value, endIdx, signChar){
    const s = String(value);
    const cells = new Array(totalCols).fill('\u00A0');
    for(let k=0;k<s.length;k++){
      const col = endIdx - (s.length-1-k);
      if(col>=0 && col<totalCols) cells[col]=s[k];
    }
    let out = `<span class="dc-cell dc-sign">${signChar||''}</span>`;
    cells.forEach(c=>{ out += `<span class="dc-cell">${c}</span>`; });
    return out;
  }
  if(solved===false){
    return `<div class="divisao-chave">
      <div class="dc-left"><div class="dc-row">${cellsRow(dividend, totalCols-1)}</div></div>
      <div class="dc-right">
        <div class="dc-divisor">${divisor}</div>
        <div class="dc-bracket-line"></div>
        <div class="dc-quotient">?</div>
      </div>
    </div>`;
  }
  const {quotient, blocks} = longDivisionSteps(dividend, divisor);
  let leftRows = `<div class="dc-row">${cellsRow(dividend, totalCols-1)}</div>`;
  blocks.forEach((b,i)=>{
    if(i>0){
      leftRows += `<div class="dc-row">${cellsRow(b.current, b.endIdx)}</div>`;
    }
    leftRows += `<div class="dc-row dc-sub">${cellsRow(b.product, b.endIdx, '−')}</div>`;
    leftRows += `<div class="dc-line"></div>`;
  });
  const lastBlock = blocks[blocks.length-1];
  const lastRemainder = lastBlock ? lastBlock.newRemainder : 0;
  const lastEndIdx = lastBlock ? lastBlock.endIdx : totalCols-1;
  leftRows += `<div class="dc-row dc-final">${cellsRow(lastRemainder, lastEndIdx)}</div>`;
  return `<div class="divisao-chave">
    <div class="dc-left">${leftRows}</div>
    <div class="dc-right">
      <div class="dc-divisor">${divisor}</div>
      <div class="dc-bracket-line"></div>
      <div class="dc-quotient">${quotient}</div>
    </div>
  </div>`;
}
// narra o passo a passo em linguagem simples, bloco por bloco.
function divisaoNarrativa(dividend, divisor){
  const {quotient, remainder, blocks} = longDivisionSteps(dividend, divisor);
  const steps = [];
  blocks.forEach((b,i)=>{
    if(i===0){
      steps.push(`Comece olhando o início do dividendo: ${b.current}.`);
    } else {
      steps.push(`Desça o próximo dígito e junte com o resto: forma ${b.current}.`);
    }
    steps.push(`${divisor} cabe ${b.q} ${b.q===1?'vez':'vezes'} em ${b.current}, porque ${b.q} × ${divisor} = ${b.product}.`);
    steps.push(`${b.current} − ${b.product} = ${b.newRemainder}`);
  });
  if(remainder===0) steps.push(`Não sobra nada — a divisão é exata. Quociente: ${quotient}.`);
  else steps.push(`Não há mais dígitos pra descer. Resto final: ${remainder}. Quociente: ${quotient}.`);
  return steps;
}

/* ---------------- potência e raiz: {b,e} vira base com expoente; {root:true,n,e} vira radical ---------------- */
function potRow(parts){
  const ops = ['+','−','×','÷','=','∝',':'];
  const html = parts.map(p=>{
    if(p && typeof p === 'object'){
      if(p.root){
        return `<span class="pot-item root"><span class="pot-index">${p.e && p.e!==2 ? p.e : ''}</span><span class="pot-radical">√</span><span class="pot-under">${p.n}</span></span>`;
      }
      return `<span class="pot-item"><span class="pot-base">${p.b}</span><span class="pot-exp">${p.e}</span></span>`;
    }
    const s = String(p);
    return `<span class="${ops.includes(s)?'chain-op':'chain-val'}">${s}</span>`;
  }).join('');
  return `<div class="chain-row">${html}</div>`;
}
function potStage(html){ return `<div class="pot-stage">${html}</div>`; }

/* ---------------- catálogo de assuntos ---------------- */
/* =========================================================
   GEOMETRIA VISUAL
   - geoFigure(): desenha a figura (SVG) com as medidas escritas nela,
     usada nas questões, nos exemplos e no laboratório
   - Laboratório de Geometria: mexer nas medidas e ver área/perímetro
     mudando; sólidos 3D com volume; triângulo com ângulos arrastáveis
   ========================================================= */
const GEO_W = 320, GEO_H = 210, GEO_PAD = 34;
function geoNum(v){ return fmt(Math.round(v*100)/100); }
/* d: medidas · o: {unit, ask:'area'|'perim'|null, grid, hl:'perim'|'area', q:{b:'?'}} (q troca o rótulo por "?") */
function geoFigure(shape, d, o){
  o = o || {};
  const u = o.unit || 'cm';
  const lab = (k, v)=> (o.q && o.q[k]) ? o.q[k] : `${geoNum(v)} ${u}`;
  // escala pra caber no quadro, mantendo a proporção
  let wU, hU;
  if(shape==='circle'){ wU = hU = 2*d.r; }
  else if(shape==='square'){ wU = hU = d.l; }
  else if(shape==='trapezoid'){ wU = d.B; hU = d.h; }
  else if(shape==='parallelogram'){ wU = d.b + (d.s||0); hU = d.h; }
  else if(shape==='rhombus'){ wU = d.D; hU = d.d; }
  else { wU = d.b + (shape==='triangle' ? Math.max(0, (d.a||0)-d.b) + Math.max(0, -(d.a||0)) : 0); hU = d.h; }
  const k = Math.min((GEO_W-2*GEO_PAD)/wU, (GEO_H-2*GEO_PAD)/hU);
  const W = wU*k, H = hU*k, x0 = (GEO_W-W)/2, y0 = (GEO_H-H)/2;
  let body = '', grid = '';
  const cls = 'geo-shape' + (o.hl==='area' ? ' fill-hl' : '') + (o.hl==='perim' ? ' stroke-hl' : '');
  const txt = (x, y, t, anchor, extra)=> `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor||'middle'}" class="geo-lbl ${extra||''}">${t}</text>`;
  // quadradinhos de 1×1 (mostra de onde vem a área)
  if(o.grid && shape!=='circle' && wU<=24 && hU<=24){
    for(let i=0;i<=Math.round(wU);i++) grid += `<line x1="${(x0+i*k).toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(x0+i*k).toFixed(1)}" y2="${(y0+H).toFixed(1)}" class="geo-grid"/>`;
    for(let j=0;j<=Math.round(hU);j++) grid += `<line x1="${x0.toFixed(1)}" y1="${(y0+j*k).toFixed(1)}" x2="${(x0+W).toFixed(1)}" y2="${(y0+j*k).toFixed(1)}" class="geo-grid"/>`;
  }
  if(shape==='rect' || shape==='square'){
    const b = shape==='square' ? d.l : d.b, h = shape==='square' ? d.l : d.h;
    body += `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="${cls}"/>`;
    body += `<path d="M${x0} ${y0+H-10}h10v10" class="geo-mark"/>`;
    body += txt(x0+W/2, y0+H+20, lab('b', b));
    body += txt(x0+W+8, y0+H/2+5, lab(shape==='square'?'b':'h', h), 'start');
  } else if(shape==='triangle'){
    const a = d.a==null ? d.b*0.35 : d.a; // onde fica o topo (em relação ao canto esquerdo da base)
    const left = Math.min(0, a), bx = x0 - left*k;
    const A = [bx, y0+H], B = [bx+d.b*k, y0+H], C = [bx+a*k, y0];
    body += `<polygon points="${A} ${B} ${C}" class="${cls}"/>`;
    if(o.showRect) body += `<rect x="${bx}" y="${y0}" width="${d.b*k}" height="${H}" class="geo-ghost"/>`;
    body += `<line x1="${C[0]}" y1="${C[1]}" x2="${C[0]}" y2="${y0+H}" class="geo-height"/>`;
    if(a<0 || a>d.b) body += `<line x1="${a<0?C[0]:B[0]}" y1="${y0+H}" x2="${a<0?A[0]:C[0]}" y2="${y0+H}" class="geo-height"/>`;
    body += `<path d="M${C[0]} ${y0+H-9}h${a>d.b?-9:9}v9" class="geo-mark"/>`;
    body += txt((A[0]+B[0])/2, y0+H+20, lab('b', d.b));
    body += txt(C[0]+(a>d.b?-8:8), y0+H/2+5, `h = ${lab('h', d.h)}`, a>d.b?'end':'start', 'geo-lbl-h');
  } else if(shape==='trapezoid'){
    const off = (d.B-d.b)/2*k;
    const P = [[x0, y0+H], [x0+W, y0+H], [x0+W-off, y0], [x0+off, y0]];
    body += `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="${cls}"/>`;
    body += `<line x1="${x0+off}" y1="${y0}" x2="${x0+off}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+W/2, y0+H+20, lab('B', d.B));
    body += txt(x0+W/2, y0-9, lab('b', d.b));
    body += txt(x0+off+7, y0+H/2+5, `h = ${lab('h', d.h)}`, 'start', 'geo-lbl-h');
  } else if(shape==='parallelogram'){
    const s = (d.s||0)*k;
    const P = [[x0, y0+H], [x0+d.b*k, y0+H], [x0+d.b*k+s, y0], [x0+s, y0]];
    body += `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="${cls}"/>`;
    if(o.showRect) body += `<polygon points="${x0},${y0+H} ${x0+s},${y0+H} ${x0+s},${y0}" class="geo-ghost"/><polygon points="${x0+d.b*k},${y0+H} ${x0+d.b*k+s},${y0+H} ${x0+d.b*k+s},${y0}" class="geo-ghost"/>`;
    body += `<line x1="${x0+s}" y1="${y0}" x2="${x0+s}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+d.b*k/2, y0+H+20, lab('b', d.b));
    body += txt(x0+s+7, y0+H/2+5, `h = ${lab('h', d.h)}`, 'start', 'geo-lbl-h');
  } else if(shape==='rhombus'){
    const cx = x0+W/2, cy = y0+H/2;
    body += `<polygon points="${cx},${y0} ${x0+W},${cy} ${cx},${y0+H} ${x0},${cy}" class="${cls}"/>`;
    body += `<line x1="${x0}" y1="${cy}" x2="${x0+W}" y2="${cy}" class="geo-height"/><line x1="${cx}" y1="${y0}" x2="${cx}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+W*0.72, cy-7, `D = ${lab('D', d.D)}`, 'middle', 'geo-lbl-h');
    body += txt(cx+7, y0+H*0.25, `d = ${lab('d', d.d)}`, 'start', 'geo-lbl-h');
  } else if(shape==='circle'){
    const R = d.r*k, cx = GEO_W/2, cy = GEO_H/2;
    body += `<circle cx="${cx}" cy="${cy}" r="${R}" class="${cls}"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="3" class="geo-dot"/>`;
    body += `<line x1="${cx}" y1="${cy}" x2="${cx+R}" y2="${cy}" class="geo-radius"/>`;
    body += txt(cx+R/2, cy-8, `r = ${lab('r', d.r)}`, 'middle', 'geo-lbl-h');
  }
  const ask = o.ask==='area' ? 'Área = ?' : o.ask==='perim' ? 'Perímetro = ?' : '';
  return `<svg class="geo-fig" viewBox="0 0 ${GEO_W} ${GEO_H+(ask?16:0)}" role="img" aria-label="Figura geométrica">${grid}${body}${ask?txt(GEO_W/2, GEO_H+10, ask, 'middle', 'geo-ask'):''}</svg>`;
}
/* enunciado + figura juntos (quando a questão tem figura, o app mostra só o visual) */
function geoQ(text, svg){ return `<div class="geo-qtext">${text}</div>${svg}`; }

/* ---------- sólidos em perspectiva ---------- */
function geoSolid(kind, d){
  const W = 320, H = 230;
  let s = '';
  const txt = (x, y, t, a)=> `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${a||'middle'}" class="geo-lbl">${t}</text>`;
  if(kind==='cube' || kind==='box'){
    const a = kind==='cube' ? d.a : d.c, b = kind==='cube' ? d.a : d.l, c = kind==='cube' ? d.a : d.h; // comprimento, largura, altura
    const depthK = 0.5; // perspectiva cavaleira: profundidade pela metade, a 45°
    const wU = a + b*depthK*0.71, hU = c + b*depthK*0.71;
    const k = Math.min((W-80)/wU, (H-60)/hU);
    const dx = b*depthK*0.71*k, dy = b*depthK*0.71*k;
    const x0 = (W-(a*k+dx))/2, y0 = (H-(c*k+dy))/2 + dy;
    const F = [[x0,y0],[x0+a*k,y0],[x0+a*k,y0+c*k],[x0,y0+c*k]];
    const T = F.map(([x,y])=>[x+dx,y-dy]);
    s += `<polygon points="${[F[0],F[1],T[1],T[0]].join(' ')}" class="geo-face top"/>`;
    s += `<polygon points="${[F[1],T[1],T[2],F[2]].join(' ')}" class="geo-face side"/>`;
    s += `<polygon points="${F.join(' ')}" class="geo-face front"/>`;
    s += `<polyline points="${[F[3],T[3],T[2]].join(' ')}" class="geo-hidden"/><line x1="${T[3][0]}" y1="${T[3][1]}" x2="${T[0][0]}" y2="${T[0][1]}" class="geo-hidden"/>`;
    s += txt(x0+a*k/2, y0+c*k+20, `${geoNum(a)} cm`);
    s += txt(x0-8, y0+c*k/2+5, `${geoNum(c)} cm`, 'end');
    s += txt(F[2][0]+dx/2+8, F[2][1]-dy/2+14, `${geoNum(b)} cm`, 'start');
  } else if(kind==='cylinder'){
    const k = Math.min((W-90)/(2*d.r), (H-70)/(d.h + d.r*0.6));
    const R = d.r*k, ry = R*0.3, Hh = d.h*k, cx = W/2, top = (H-Hh)/2;
    s += `<path d="M${cx-R} ${top} L${cx-R} ${top+Hh} A${R} ${ry} 0 0 0 ${cx+R} ${top+Hh} L${cx+R} ${top} Z" class="geo-face front"/>`;
    s += `<path d="M${cx-R} ${top+Hh} A${R} ${ry} 0 0 1 ${cx+R} ${top+Hh}" class="geo-hidden"/>`;
    s += `<ellipse cx="${cx}" cy="${top}" rx="${R}" ry="${ry}" class="geo-face top"/>`;
    s += `<line x1="${cx}" y1="${top}" x2="${cx+R}" y2="${top}" class="geo-radius"/><circle cx="${cx}" cy="${top}" r="2.5" class="geo-dot"/>`;
    s += txt(cx+R/2, top-6, `r = ${geoNum(d.r)} cm`);
    s += txt(cx+R+8, top+Hh/2+5, `h = ${geoNum(d.h)} cm`, 'start');
  }
  return `<svg class="geo-fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sólido geométrico">${s}</svg>`;
}

/* ---------- Laboratório de Geometria ---------- */
const GEO_SHAPES = {
  square:{name:'Quadrado', dims:[['l','Lado',1,12,5]],
    area:d=>d.l*d.l, perim:d=>4*d.l,
    fa:d=>[`Área = lado × lado`, `${d.l} × ${d.l} = ${d.l*d.l} cm²`], fp:d=>[`Perímetro = 4 × lado`, `4 × ${d.l} = ${4*d.l} cm`],
    why:'Cabem exatamente lado × lado quadradinhos de 1 cm² dentro dele. Conte!'},
  rect:{name:'Retângulo', dims:[['b','Base',1,14,7],['h','Altura',1,10,4]],
    area:d=>d.b*d.h, perim:d=>2*(d.b+d.h),
    fa:d=>[`Área = base × altura`, `${d.b} × ${d.h} = ${d.b*d.h} cm²`], fp:d=>[`Perímetro = 2 × (base + altura)`, `2 × (${d.b} + ${d.h}) = ${2*(d.b+d.h)} cm`],
    why:'São "altura" fileiras com "base" quadradinhos cada: base × altura quadradinhos.'},
  triangle:{name:'Triângulo', dims:[['b','Base',2,14,8],['h','Altura',1,10,5],['a','Posição do topo',-4,18,3]],
    area:d=>d.b*d.h/2, perim:d=>d.b + Math.hypot(d.a, d.h) + Math.hypot(d.b-d.a, d.h),
    fa:d=>[`Área = base × altura ÷ 2`, `${d.b} × ${d.h} ÷ 2 = ${geoNum(d.b*d.h/2)} cm²`],
    fp:d=>{ const l1 = Math.hypot(d.a,d.h), l2 = Math.hypot(d.b-d.a,d.h); return [`Perímetro = soma dos 3 lados`, `${d.b} + ${geoNum(l1)} + ${geoNum(l2)} ≈ ${geoNum(d.b+l1+l2)} cm`]; },
    why:'O triângulo é sempre metade do retângulo pontilhado (base × altura). Mexa no topo: a área não muda!', rect:true},
  parallelogram:{name:'Paralelogramo', dims:[['b','Base',2,12,7],['h','Altura',1,9,4],['s','Inclinação',0,6,2]],
    area:d=>d.b*d.h, perim:d=>2*(d.b+Math.hypot(d.s,d.h)),
    fa:d=>[`Área = base × altura`, `${d.b} × ${d.h} = ${d.b*d.h} cm²`], fp:d=>{ const l = Math.hypot(d.s,d.h); return [`Perímetro = 2 × (base + lado)`, `2 × (${d.b} + ${geoNum(l)}) ≈ ${geoNum(2*(d.b+l))} cm`]; },
    why:'Corte o triângulo pontilhado da esquerda e encaixe na direita: vira um retângulo de base × altura.', rect:true},
  trapezoid:{name:'Trapézio', dims:[['B','Base maior',3,14,10],['b','Base menor',1,13,5],['h','Altura',1,9,4]],
    area:d=>(d.B+d.b)*d.h/2, perim:d=>d.B+d.b+2*Math.hypot((d.B-d.b)/2, d.h),
    fa:d=>[`Área = (B + b) × h ÷ 2`, `(${d.B} + ${d.b}) × ${d.h} ÷ 2 = ${geoNum((d.B+d.b)*d.h/2)} cm²`],
    fp:d=>{ const l = Math.hypot((d.B-d.b)/2, d.h); return [`Perímetro = B + b + 2 lados`, `${d.B} + ${d.b} + 2 × ${geoNum(l)} ≈ ${geoNum(d.B+d.b+2*l)} cm`]; },
    why:'Dois trapézios iguais, um de cabeça pra baixo, formam um paralelogramo de base (B + b). Por isso divide por 2.'},
  rhombus:{name:'Losango', dims:[['D','Diagonal maior',2,14,10],['d','Diagonal menor',1,10,6]],
    area:d=>d.D*d.d/2, perim:d=>4*Math.hypot(d.D/2, d.d/2),
    fa:d=>[`Área = D × d ÷ 2`, `${d.D} × ${d.d} ÷ 2 = ${geoNum(d.D*d.d/2)} cm²`], fp:d=>{ const l = Math.hypot(d.D/2,d.d/2); return [`Perímetro = 4 × lado`, `4 × ${geoNum(l)} ≈ ${geoNum(4*l)} cm`]; },
    why:'O losango ocupa exatamente metade do retângulo formado pelas duas diagonais.'},
  circle:{name:'Círculo', dims:[['r','Raio',1,8,3]],
    area:d=>3.14*d.r*d.r, perim:d=>2*3.14*d.r,
    fa:d=>[`Área = π × r² (π ≈ 3,14)`, `3,14 × ${d.r} × ${d.r} = ${geoNum(3.14*d.r*d.r)} cm²`], fp:d=>[`Comprimento = 2 × π × r`, `2 × 3,14 × ${d.r} = ${geoNum(6.28*d.r)} cm`],
    why:'Dá a volta em qualquer círculo e divida pelo diâmetro: sempre dá ≈ 3,14. Esse número é o π.'},
};
const GEO_SOLIDS = {
  cube:{name:'Cubo', dims:[['a','Aresta',1,10,4]],
    vol:d=>d.a**3, surf:d=>6*d.a*d.a,
    fv:d=>[`Volume = a × a × a`, `${d.a} × ${d.a} × ${d.a} = ${d.a**3} cm³`], fs:d=>[`Área total = 6 faces × a²`, `6 × ${d.a*d.a} = ${6*d.a*d.a} cm²`]},
  box:{name:'Paralelepípedo', dims:[['c','Comprimento',1,12,6],['l','Largura',1,10,3],['h','Altura',1,10,4]],
    vol:d=>d.c*d.l*d.h, surf:d=>2*(d.c*d.l+d.c*d.h+d.l*d.h),
    fv:d=>[`Volume = comprimento × largura × altura`, `${d.c} × ${d.l} × ${d.h} = ${d.c*d.l*d.h} cm³`],
    fs:d=>[`Área total = 2 × (c·l + c·h + l·h)`, `2 × (${d.c*d.l} + ${d.c*d.h} + ${d.l*d.h}) = ${2*(d.c*d.l+d.c*d.h+d.l*d.h)} cm²`]},
  cylinder:{name:'Cilindro', dims:[['r','Raio',1,6,2],['h','Altura',1,10,5]],
    vol:d=>3.14*d.r*d.r*d.h, surf:d=>2*3.14*d.r*d.r + 2*3.14*d.r*d.h,
    fv:d=>[`Volume = área da base × altura = π × r² × h`, `3,14 × ${d.r*d.r} × ${d.h} = ${geoNum(3.14*d.r*d.r*d.h)} cm³`],
    fs:d=>[`Área total = 2 bases + lateral = 2πr² + 2πr·h`, `${geoNum(6.28*d.r*d.r)} + ${geoNum(6.28*d.r*d.h)} = ${geoNum(6.28*d.r*d.r + 6.28*d.r*d.h)} cm²`]},
};
function geoSliders(dims, values, onChange){
  const box = h(`<div class="geo-sliders"></div>`);
  dims.forEach(([key,label,min,max])=>{
    const row = h(`<label class="geo-sl"><span class="geo-sl-l">${label}</span><input type="range" min="${min}" max="${max}" step="1" value="${values[key]}"><b></b></label>`);
    const inp = row.querySelector('input'), out = row.querySelector('b');
    const paint = ()=>{ out.textContent = `${values[key]} cm`; };
    inp.oninput = ()=>{ values[key] = Number(inp.value); paint(); onChange(); };
    paint();
    box.appendChild(row);
  });
  return box;
}
function geoFormulaBox(title, lines, ico){
  return `<div class="geo-res"><div class="geo-res-t">${ico} ${title}</div>${lines.map((l,i)=>`<div class="${i===lines.length-1?'geo-res-v':'geo-res-f'}">${l}</div>`).join('')}</div>`;
}
function geoLabScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🔺 Laboratório de Geometria', true, ()=>go(state.geoBack || 'content')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const tab = state.geoTab || 'area';
  const tabs = h(`<div class="diff-row geo-tabs"></div>`);
  [['area','📐 Áreas'],['solid','🧊 Sólidos'],['angle','📏 Ângulos']].forEach(([id,label])=>{
    const b = h(`<button type="button" class="diff-chip ${tab===id?'active':''}">${label}</button>`);
    b.onclick = ()=>{ state.geoTab = id; render(); };
    tabs.appendChild(b);
  });
  c.appendChild(tabs);
  if(tab==='area') geoAreaTab(c);
  else if(tab==='solid') geoSolidTab(c);
  else geoAngleTab(c);
  return wrap;
}
function geoAreaTab(c){
  const id = state.geoShape || 'rect';
  const S = GEO_SHAPES[id];
  const vals = state.geoVals && state.geoVals[id] ? state.geoVals[id] : Object.fromEntries(S.dims.map(d=>[d[0], d[4]]));
  state.geoVals = Object.assign(state.geoVals||{}, {[id]:vals});
  let showGrid = state.geoGrid !== false;
  const chips = h(`<div class="subj-chip-grid geo-shapes"></div>`);
  Object.entries(GEO_SHAPES).forEach(([k,sh])=>{
    const b = h(`<button type="button" class="subj-chip ${k===id?'active':''}" style="padding:7px 12px">${sh.name}</button>`);
    b.onclick = ()=>{ state.geoShape = k; render(); };
    chips.appendChild(b);
  });
  c.appendChild(chips);
  const fig = h(`<div class="geo-stage"></div>`);
  const res = h(`<div class="geo-results"></div>`);
  const why = h(`<div class="rp-tip" style="margin-top:12px"></div>`);
  function paint(){
    if(id==='trapezoid' && vals.b >= vals.B) vals.b = vals.B-1; // base menor precisa ser menor
    fig.innerHTML = geoFigure(id, vals, {grid:showGrid, showRect:S.rect});
    res.innerHTML = geoFormulaBox('Área', S.fa(vals), '🟦') + geoFormulaBox(id==='circle'?'Comprimento (perímetro)':'Perímetro', S.fp(vals), '📏');
  }
  c.appendChild(fig);
  const gridT = h(`<button type="button" class="weak-toggle ${showGrid?'active':''}" style="margin:10px 0"><span class="check">✓</span><span>Mostrar os quadradinhos de 1 cm²</span></button>`);
  gridT.onclick = ()=>{ showGrid = !showGrid; state.geoGrid = showGrid; gridT.classList.toggle('active', showGrid); paint(); };
  if(id!=='circle') c.appendChild(gridT);
  c.appendChild(geoSliders(S.dims, vals, ()=>{ paint(); syncSliders(); }));
  function syncSliders(){ if(id==='trapezoid'){ const inp = c.querySelectorAll('.geo-sl input')[1]; if(inp && Number(inp.value)!==vals.b){ inp.value = vals.b; inp.parentNode.querySelector('b').textContent = `${vals.b} cm`; } } }
  c.appendChild(res);
  why.textContent = '💡 ' + S.why;
  c.appendChild(why);
  paint();
}
function geoSolidTab(c){
  const id = state.geoSolid || 'cube';
  const S = GEO_SOLIDS[id];
  const key = 'solid_'+id;
  const vals = state.geoVals && state.geoVals[key] ? state.geoVals[key] : Object.fromEntries(S.dims.map(d=>[d[0], d[4]]));
  state.geoVals = Object.assign(state.geoVals||{}, {[key]:vals});
  const chips = h(`<div class="subj-chip-grid geo-shapes"></div>`);
  Object.entries(GEO_SOLIDS).forEach(([k,sh])=>{
    const b = h(`<button type="button" class="subj-chip ${k===id?'active':''}" style="padding:7px 12px">${sh.name}</button>`);
    b.onclick = ()=>{ state.geoSolid = k; render(); };
    chips.appendChild(b);
  });
  c.appendChild(chips);
  const fig = h(`<div class="geo-stage"></div>`), res = h(`<div class="geo-results"></div>`);
  function paint(){
    fig.innerHTML = geoSolid(id, vals);
    res.innerHTML = geoFormulaBox('Volume (quanto cabe dentro)', S.fv(vals), '🧊') + geoFormulaBox('Área total (quanto papel pra embrulhar)', S.fs(vals), '🎁');
  }
  c.appendChild(fig);
  c.appendChild(geoSliders(S.dims, vals, paint));
  c.appendChild(res);
  c.appendChild(h(`<div class="rp-tip" style="margin-top:12px">💡 Volume é quantos cubinhos de 1 cm³ cabem dentro. 1.000 cm³ = 1 litro!</div>`));
  paint();
}
/* triângulo com cantos arrastáveis: os ângulos mudam, a soma fica sempre 180° */
function geoAngleTab(c){
  const W = 320, H = 240;
  const P = state.geoTri || [[60,200],[270,200],[140,50]];
  state.geoTri = P;
  const stage = h(`<div class="geo-stage"><svg class="geo-fig geo-drag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triângulo com cantos que podem ser arrastados"></svg></div>`);
  const svg = stage.querySelector('svg');
  const info = h(`<div class="geo-results"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:13.5px; margin:4px 0 10px">Arraste as bolinhas dos cantos. Os ângulos mudam, mas a soma é sempre <b>180°</b>.</p>`));
  c.appendChild(stage);
  c.appendChild(info);
  const COL = ['#FF5C7A','#33D2E3','#FFB800'];
  const angleAt = (i)=>{ const A = P[i], B = P[(i+1)%3], C = P[(i+2)%3];
    const v1 = [B[0]-A[0], B[1]-A[1]], v2 = [C[0]-A[0], C[1]-A[1]];
    return Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))))*180/Math.PI; };
  function paint(){
    const ang = [0,1,2].map(angleAt);
    const rounded = ang.map(a=>Math.round(a));
    const diff = 180 - rounded.reduce((a,b)=>a+b,0); // ajusta o arredondamento pra somar 180 na tela
    if(diff){ const i = ang.map((a,i)=>[a-Math.floor(a), i]).sort((x,y)=>diff>0? y[0]-x[0] : x[0]-y[0])[0][1]; rounded[i] += diff; }
    let s = `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="geo-shape"/>`;
    P.forEach((A,i)=>{
      const B = P[(i+1)%3], C = P[(i+2)%3], r = 26;
      const a1 = Math.atan2(B[1]-A[1], B[0]-A[0]), a2 = Math.atan2(C[1]-A[1], C[0]-A[0]);
      let da = a2 - a1; while(da <= -Math.PI) da += 2*Math.PI; while(da > Math.PI) da -= 2*Math.PI;
      const x1 = A[0]+r*Math.cos(a1), y1 = A[1]+r*Math.sin(a1), x2 = A[0]+r*Math.cos(a2), y2 = A[1]+r*Math.sin(a2);
      s += `<path d="M${A[0]} ${A[1]} L${x1} ${y1} A${r} ${r} 0 0 ${da>0?1:0} ${x2} ${y2} Z" fill="${COL[i]}" fill-opacity=".35" stroke="${COL[i]}" stroke-width="2"/>`;
      const mid = a1 + da/2, lx = A[0]+(r+20)*Math.cos(mid), ly = A[1]+(r+20)*Math.sin(mid);
      s += `<text x="${lx}" y="${ly+5}" text-anchor="middle" class="geo-lbl" style="fill:${COL[i]}">${rounded[i]}°</text>`;
    });
    P.forEach((p,i)=>{ s += `<circle cx="${p[0]}" cy="${p[1]}" r="13" class="geo-handle" data-i="${i}" style="stroke:${COL[i]}"/>`; });
    svg.innerHTML = s;
    const sides = [0,1,2].map(i=>Math.hypot(P[(i+1)%3][0]-P[i][0], P[(i+1)%3][1]-P[i][1]));
    const eq = (a,b)=> Math.abs(a-b) < Math.max(a,b)*0.04;
    const bySides = eq(sides[0],sides[1]) && eq(sides[1],sides[2]) ? 'Equilátero (3 lados iguais)' : (eq(sides[0],sides[1])||eq(sides[1],sides[2])||eq(sides[0],sides[2])) ? 'Isósceles (2 lados iguais)' : 'Escaleno (3 lados diferentes)';
    const maxA = Math.max(...rounded);
    const byAng = maxA===90 ? 'Retângulo (tem um ângulo de 90°)' : maxA>90 ? 'Obtusângulo (tem um ângulo maior que 90°)' : 'Acutângulo (todos menores que 90°)';
    info.innerHTML = `<div class="geo-res"><div class="geo-res-t">📏 Soma dos ângulos</div><div class="geo-res-f"><span style="color:${COL[0]}">${rounded[0]}°</span> + <span style="color:${COL[1]}">${rounded[1]}°</span> + <span style="color:${COL[2]}">${rounded[2]}°</span></div><div class="geo-res-v">= 180°</div></div>
      <div class="geo-res"><div class="geo-res-t">🔎 Que triângulo é esse?</div><div class="geo-res-f">Pelos lados: <b>${bySides}</b></div><div class="geo-res-f">Pelos ângulos: <b>${byAng}</b></div></div>`;
  }
  let drag = -1;
  const toSvg = e=>{ const r = svg.getBoundingClientRect(); return [Math.max(12, Math.min(W-12, (e.clientX-r.left)*W/r.width)), Math.max(12, Math.min(H-12, (e.clientY-r.top)*H/r.height))]; };
  svg.addEventListener('pointerdown', e=>{
    const [x,y] = toSvg(e);
    let best = -1, bd = 30;
    P.forEach((p,i)=>{ const d = Math.hypot(p[0]-x, p[1]-y); if(d<bd){ bd = d; best = i; } });
    if(best<0) return;
    drag = best; svg.setPointerCapture(e.pointerId); e.preventDefault();
  });
  svg.addEventListener('pointermove', e=>{
    if(drag<0) return;
    const np = toSvg(e), others = P.filter((_,i)=>i!==drag);
    if(others.some(o=>Math.hypot(o[0]-np[0], o[1]-np[1]) < 24)) return; // não deixa dois cantos se encostarem
    P[drag] = np.map(v=>Math.round(v)); paint();
  });
  const end = ()=>{ drag = -1; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  const presets = h(`<div class="cta-row" style="margin-top:12px"></div>`);
  [['Equilátero',[[60,205],[260,205],[160,32]]],['Retângulo',[[70,200],[250,200],[70,60]]],['Obtusângulo',[[40,190],[280,190],[90,120]]]].forEach(([n,pts])=>{
    const b = h(`<button class="btn secondary" style="flex:1; padding:10px 6px; font-size:13px">${n}</button>`);
    b.onclick = ()=>{ pts.forEach((p,i)=>{ P[i] = p.slice(); }); paint(); };
    presets.appendChild(b);
  });
  c.appendChild(presets);
  paint();
}

const SUBJECTS = [
  {
    id:'adicao', name:'Adição', sym:'+',
    learn:`<p>Imagina que você tem 3 balas numa mão e 5 na outra. Se juntar tudo numa mão só, quantas balas você tem? Isso é <b>somar</b>: é só juntar quantidades. O resultado de uma soma se chama <b>total</b>.</p>
    <p><b>Quando os números são grandes, dá pra somar em pé (uma conta "armada"). Veja como:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Escreva um número embaixo do outro, alinhando pela <b>direita</b> — como se estivesse enfileirando moedinhas: unidade sob unidade, dezena sob dezena, centena sob centena.</li>
      <li>Comece somando a coluna mais à direita, a das <b>unidades</b>, e vá andando para a esquerda, uma coluna de cada vez.</li>
      <li>Se a soma de uma coluna passar de 9, ela não cabe sozinha ali: escreva só o último dígito e "empreste" o resto pra próxima coluna. Esse empréstimo é o famoso <b>"vai um"</b>.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'234 + 158 = 392', columns:{nums:['234','158'], op:'+', result:'392', carries:addColumnSteps([234,158]).carries}, steps:addColumnSteps([234,158]).steps},
      {title:'Exemplo 2', text:'47 + 38 = 85', columns:{nums:['47','38'], op:'+', result:'85', carries:addColumnSteps([47,38]).carries}, steps:addColumnSteps([47,38]).steps},
      {title:'Exemplo 3 (três números)', text:'123 + 456 + 89 = 668', columns:{nums:['123','456','89'], op:'+', result:'668', carries:addColumnSteps([123,456,89]).carries}, steps:addColumnSteps([123,456,89]).steps},
    ],
    gen:{
      facil:()=>{ const a=randInt(2,20), b=randInt(2,20); const {steps, carries} = addColumnSteps([a,b]); return mkSingle(`${a} + ${b} = ?`, a+b, steps, {nums:[a,b], op:'+', carries}); },
      medio:()=>{ const a=randInt(20,300), b=randInt(20,300); const {steps, carries} = addColumnSteps([a,b]); return mkSingle(`${a} + ${b} = ?`, a+b, steps, {nums:[a,b], op:'+', carries}); },
      dificil:()=>{ const a=randInt(100,900), b=randInt(100,900), c=randInt(10,300); const {steps, carries} = addColumnSteps([a,b,c]); return mkSingle(`${a} + ${b} + ${c} = ?`, a+b+c, steps, {nums:[a,b,c], op:'+', carries}); },
    }
  },
  {
    id:'subtracao', name:'Subtração', sym:'−',
    learn:`<p>Se você tem 8 figurinhas e dá 3 pro seu amigo, quantas sobram? Isso é <b>subtrair</b>: é tirar uma quantidade de outra. O número de onde se tira chama-se <b>minuendo</b>, o que se tira é o <b>subtraendo</b>, e o que sobra é a <b>diferença</b>.</p>
    <p><b>Passo a passo pra montar a conta:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Escreva o maior número em cima e o menor embaixo, alinhados pela direita: unidade sob unidade, dezena sob dezena.</li>
      <li>Subtraia coluna por coluna, começando pela coluna da direita, as <b>unidades</b>.</li>
      <li>Quando o número de cima for menor que o de baixo numa coluna, não dá pra subtrair direto — você precisa <b>"pedir emprestado"</b> 1 dezena da casa vizinha à esquerda. Esse empréstimo soma 10 ao número de cima da coluna atual, e desconta 1 da casa que emprestou.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'520 − 137 = 383', columns:{nums:['520','137'], op:'−', result:'383', marks:subColumnSteps(520,137).marks}, steps:subColumnSteps(520,137).steps},
      {title:'Exemplo 2 (sem emprestar)', text:'68 − 23 = 45', columns:{nums:['68','23'], op:'−', result:'45', marks:subColumnSteps(68,23).marks}, steps:subColumnSteps(68,23).steps},
      {title:'Exemplo 3 (empresta em cascata)', text:'300 − 156 = 144', columns:{nums:['300','156'], op:'−', result:'144', marks:subColumnSteps(300,156).marks}, steps:subColumnSteps(300,156).steps},
    ],
    gen:{
      facil:()=>{ let a=randInt(10,30), b=randInt(1,a); const {steps, marks} = subColumnSteps(a,b); return mkSingle(`${a} − ${b} = ?`, a-b, steps, {nums:[a,b], op:'−', marks}); },
      medio:()=>{ let a=randInt(100,500), b=randInt(20,a); const {steps, marks} = subColumnSteps(a,b); return mkSingle(`${a} − ${b} = ?`, a-b, steps, {nums:[a,b], op:'−', marks}); },
      dificil:()=>{ let a=randInt(1000,9999), b=randInt(100,a); const {steps, marks} = subColumnSteps(a,b); return mkSingle(`${a} − ${b} = ?`, a-b, steps, {nums:[a,b], op:'−', marks}); },
    }
  },
  {
    id:'multiplicacao', name:'Multiplicação', sym:'×',
    learn:`<p>Se você tem 3 pacotinhos com 4 balas cada, quantas balas tem ao todo? Dá pra somar 4+4+4, mas existe um jeito mais rápido: <b>multiplicar</b> é somar o mesmo número várias vezes de uma vez só. 4 × 3 quer dizer "4, três vezes": 4+4+4 = 12. O resultado se chama <b>produto</b>.</p>
    <p><b>Passo a passo pra multiplicar:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Para números de um dígito, o jeito mais rápido é saber a <b>tabuada</b> de cor.</li>
      <li>Para números maiores, escreva um embaixo do outro, alinhados pela direita, e multiplique dígito por dígito, começando pela direita — igual à soma, com "vai um" quando o resultado passar de 9.</li>
      <li>Se o número de baixo também tiver mais de um dígito, você multiplica por cada dígito dele separadamente (cada resultado parcial "anda" uma casa pra esquerda) e depois soma tudo.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'23 × 4 = 92', qVisual: multArmada(23,4,true,mulSingleDigitSteps(23,4).carries), steps:mulSingleDigitSteps(23,4).steps},
      {title:'Exemplo 2 (tabuada)', text:'6 × 7 = 42', qVisual: multArmada(6,7,true,mulSingleDigitSteps(6,7).carries), steps:mulSingleDigitSteps(6,7).steps},
      {title:'Exemplo 3 (dois dígitos)', text:'34 × 12 = 408', qVisual: multArmada(34,12,true), steps:mulLongSteps(34,12).steps},
    ],
    gen:{
      facil:()=>{ const a=randInt(2,9), b=randInt(2,9); const {steps, carries} = mulSingleDigitSteps(a,b); return mkSingle(`${a} × ${b} = ?`, a*b, steps, null, multArmada(a,b,false), multArmada(a,b,true,carries)); },
      medio:()=>{ const a=randInt(11,30), b=randInt(2,9); const {steps, carries} = mulSingleDigitSteps(a,b); return mkSingle(`${a} × ${b} = ?`, a*b, steps, null, multArmada(a,b,false), multArmada(a,b,true,carries)); },
      dificil:()=>{ const a=randInt(12,45), b=randInt(11,25); const {steps} = mulLongSteps(a,b); return mkSingle(`${a} × ${b} = ?`, a*b, steps, null, multArmada(a,b,false), multArmada(a,b,true)); },
    }
  },
  {
    id:'divisao', name:'Divisão', sym:'÷',
    learn:`<p>Imagina 12 balas pra repartir igualmente entre 3 amigos. Quantas cada um leva? Isso é <b>dividir</b>: repartir em partes iguais. 12 ÷ 3 pergunta exatamente isso: "repartindo 12 em 3 grupos iguais, quanto fica em cada grupo?"</p>
    <p><b>Cada número da conta tem um nome:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Dividendo</b>: o número que vai ser repartido (fica dentro da "casinha" da divisão).</li>
      <li><b>Divisor</b>: em quantas partes vamos repartir (fica fora da "casinha").</li>
      <li><b>Quociente</b>: o resultado — quanto fica em cada parte.</li>
    </ol>
    <p><b>Como montar a "chave" (o formato clássico da divisão):</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Desenhe um traço vertical e um horizontal formando um "L" deitado: o dividendo fica à esquerda do traço vertical, e o divisor fica em cima, à direita.</li>
      <li>Olhe o começo do dividendo e pergunte: "quantas vezes o divisor cabe aí?" Esse número é o primeiro dígito do quociente, e vai embaixo do divisor.</li>
      <li>Multiplique esse dígito pelo divisor, escreva o resultado embaixo com um traço, e subtraia — assim como numa subtração comum.</li>
      <li>Desça o próximo dígito do dividendo, "encoste" no resto que sobrou, e repita a pergunta "quantas vezes cabe?" até não sobrarem mais dígitos.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'84 ÷ 4 = 21', qVisual: divisaoChave(84,4), steps: divisaoNarrativa(84,4)},
      {title:'Exemplo 2 (com resto)', text:'17 ÷ 5 = 3, resto 2', qVisual: divisaoChave(17,5), steps: divisaoNarrativa(17,5)},
      {title:'Exemplo 3', text:'96 ÷ 8 = 12', qVisual: divisaoChave(96,8), steps: divisaoNarrativa(96,8)},
    ],
    gen:{
      facil:()=>{ const b=randInt(2,9), q=randInt(2,9), a=b*q; return mkSingle(`${a} ÷ ${b} = ?`, q, divisaoNarrativa(a,b), null, divisaoChave(a,b,false), divisaoChave(a,b,true)); },
      medio:()=>{ const b=randInt(3,12), q=randInt(6,20), a=b*q; return mkSingle(`${a} ÷ ${b} = ?`, q, divisaoNarrativa(a,b), null, divisaoChave(a,b,false), divisaoChave(a,b,true)); },
      dificil:()=>{ const b=randInt(4,16); const q=randInt(4,25)+randInt(1,3)/4; const a=Math.round(b*q); const real=a/b; return mkSingle(`${a} ÷ ${b} = ? (arredonde para 2 casas)`, Math.round(real*100)/100, [`${a} ÷ ${b} não é exato.`, `Resultado aproximado: ${fmt(Math.round(real*100)/100)}`]); },
    }
  },
  {
    id:'fracoes', name:'Frações', sym:'½',
    learn:`<p>Vamos começar do zero! Imagina uma pizza cortada em pedaços iguais. Se ela foi cortada em 4 pedaços e você comeu 1, dizemos que você comeu 1/4 (um quarto) da pizza.</p>
    <p>Toda fração tem duas partes: o número de cima é o <b>numerador</b> (quantos pedaços você tem) e o número de baixo é o <b>denominador</b> (em quantas partes o inteiro foi cortado).</p>
    <div class="section-title">Frações equivalentes</div>
    <p>Se você multiplicar (ou dividir) o numerador e o denominador de uma fração pelo mesmo número, ela continua valendo a mesma coisa — é só cortar os pedaços em partes menores. Por exemplo, 1/2 é igual a 2/4. Guarda essa ideia: ela é a chave pra somar e subtrair frações.</p>
    <div class="section-title">Somando ou subtraindo — denominadores iguais</div>
    <p>Se as duas frações já têm o mesmo denominador, é fácil: some (ou subtraia) só os numeradores, e o denominador fica do mesmo jeito. (Exemplo 1)</p>
    <div class="section-title">Somando ou subtraindo — denominadores diferentes</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Quando os denominadores são diferentes, as frações estão "cortadas de jeitos diferentes" e não dá pra somar direto. Primeiro, calcule o <b>MMC (mínimo múltiplo comum)</b> dos dois denominadores — ele vira o novo denominador dos dois.</li>
      <li>Pra números pequenos, o jeito mais rápido de achar o MMC é <b>listar os múltiplos</b> de cada um até achar o primeiro que aparece nas duas listas. Pra números maiores (ou quando há 3 ou mais frações), o jeito mais eficiente é a <b>fatoração em coluna</b> (Exemplos 2 e 3 — funciona na soma ou na subtração).</li>
      <li>Depois de achar o MMC: divida ele pelo denominador antigo de cada fração — esse número é o que você multiplica em cima <b>e</b> embaixo daquela fração, pra transformar ela sem mudar seu valor.</li>
      <li>Com os denominadores já iguais, some (ou subtraia) só os <b>numeradores</b>. Se for subtração, o processo é idêntico — só troca o + pelo −.</li>
    </ol>
    <div class="section-title">Como simplificar o resultado</div>
    <p>Depois de somar (ou multiplicar, ou dividir), o resultado às vezes ainda pode ficar mais simples. Ache um número que divida o numerador e o denominador ao mesmo tempo, e divida os dois por ele. Repita até não existir mais nenhum número que divida os dois — aí a fração está na forma mais simples. (Exemplo 4)</p>
    <div class="section-title">Como multiplicar</div>
    <p>É mais direto — não precisa de MMC: multiplique numerador por numerador e denominador por denominador.</p>
    <div class="section-title">Como dividir</div>
    <p>Mantenha a primeira fração como está, troque a divisão por uma multiplicação, e inverta a segunda fração (o numerador vira denominador e vice-versa). Ou seja: multiplique pela fração invertida.</p>`,
    examples:[
      {title:'Exemplo 1 (mesmo denominador)', text:'1/4 + 2/4 = 3/4', visual:[{n:1,d:4}, '+', {n:2,d:4}, '=', {n:3,d:4}], steps:['Os denominadores já são iguais (4) — pode ir direto para a soma.', 'Some só os numeradores: 1 + 2 = 3', 'Resultado: 3/4']},
      {title:'Exemplo 2 (MMC pela fatoração em coluna — soma)', text:'3/2 + 3/4 + 4/8 = 12/8 + 6/8 + 4/8 = 22/8 = 11/4', qVisual: fracChainMMC([{n:3,d:2},{n:3,d:4},{n:4,d:8}], ['+','+']), steps:['Escreva todos os denominadores lado a lado com uma linha vertical à direita — ali entram os números primos.', 'Divida todos pelo menor primo possível; quem não for divisível "repete" na linha de baixo. Continue até todos chegarem a 1: 2 × 2 × 2 = 8 → esse é o MMC.', 'Use esse MMC pra transformar cada fração: 3/2 × 4/4 = 12/8,  3/4 × 2/2 = 6/8,  e 4/8 × 1/1 = 4/8.', 'Some só os numeradores: 12 + 6 + 4 = 22 → 22/8', potStage(fracRow([{n:22,d:8}, '÷', {n:2,d:2}, '=', {n:11,d:4}])), 'Simplificado: 11/4']},
      {title:'Exemplo 3 (MMC pela fatoração em coluna — subtração)', text:'5/6 − 3/10 = 25/30 − 9/30 = 16/30 = 8/15', qVisual: fracChainMMC([{n:5,d:6},{n:3,d:10}], ['−']), steps:['O método é o mesmo, só troca o + pelo −: fatore os denominadores em coluna até achar o MMC.', 'MMC(6, 10) = 30 (2 × 3 × 5).', 'Transforme cada fração: 5/6 × 5/5 = 25/30  e  3/10 × 3/3 = 9/30.', 'Subtraia só os numeradores: 25 − 9 = 16 → 16/30', potStage(fracRow([{n:16,d:30}, '÷', {n:2,d:2}, '=', {n:8,d:15}])), 'Simplificado: 8/15']},
      {title:'Exemplo 4 (como simplificar)', text:'8/12 = 2/3', qVisual: fracRow([{n:8,d:12}, '÷', {n:4,d:4}, '=', {n:2,d:3}]), steps:['Ache um número que divida o numerador e o denominador ao mesmo tempo (aqui, o 4 divide os dois).', 'Divida os dois pelo mesmo número: 8 ÷ 4 = 2  e  12 ÷ 4 = 3.', 'Fração simplificada: 2/3 — não dá mais pra dividir por nenhum número igual.']},
      {title:'Exemplo 5 (multiplicação)', text:'2/3 × 3/5 = 6/15 = 2/5', visual:[{n:2,d:3}, '×', {n:3,d:5}, '=', {n:2,d:5}], steps:['Multiplicação não precisa de MMC — multiplique direto.', 'Multiplique os numeradores: 2 × 3 = 6', 'Multiplique os denominadores: 3 × 5 = 15', 'Fica 6/15 — simplifique dividindo por 3: 2/5']},
      {title:'Exemplo 6 (divisão)', text:'1/2 ÷ 3/4 = 1/2 × 4/3 = 4/6 = 2/3', visual:[{n:1,d:2}, '÷', {n:3,d:4}, '=', {n:2,d:3}], steps:['Mantenha a primeira fração igual: 1/2', 'Troque ÷ por × e inverta a segunda fração: 3/4 vira 4/3', 'Multiplique: 1/2 × 4/3 = 4/6', 'Simplifique dividindo por 2: 2/3']},
    ],
    gen:{
      facil:()=>{ const d=pick([4,5,6,8]); const n1=randInt(1,d-1), n2=randInt(1,d-1-n1); return mkFrac(`${n1}/${d} + ${n2}/${d} = ?`, (n1+n2), d, [`Os denominadores já são iguais (${d}).`, `Some os numeradores: ${n1} + ${n2} = ${n1+n2}`, ...fracSimplifyStep(n1+n2, d)], [{n:n1,d}, '+', {n:n2,d}, '=', '?']); },
      medio:()=>{ const d1=pick([2,3,4,6]), d2=pick([3,4,5,6,8].filter(x=>x!==d1)); const n1=randInt(1,d1-1), n2=randInt(1,d2-1); const L=lcm(d1,d2); const f1=L/d1, f2=L/d2; const num=n1*f1+n2*f2; return mkFrac(`${n1}/${d1} + ${n2}/${d2} = ?`, num, L, [`Denominadores diferentes — o MMC entre eles vira o novo denominador dos dois:`, mmcFracVisual(n1,d1,n2,d2), `Some os numeradores: ${n1*f1} + ${n2*f2} = ${num}`, ...fracSimplifyStep(num, L)], [{n:n1,d:d1}, '+', {n:n2,d:d2}, '=', '?']); },
      dificil:()=>{ const n1=randInt(1,6), d1=randInt(n1+1,9); const n2=randInt(1,6), d2=randInt(n2+1,9); const num=n1*n2, den=d1*d2; return mkFrac(`${n1}/${d1} × ${n2}/${d2} = ?`, num, den, [`Multiplique numerador por numerador: ${n1} × ${n2} = ${num}`, `Multiplique denominador por denominador: ${d1} × ${d2} = ${den}`, ...fracSimplifyStep(num, den)], [{n:n1,d:d1}, '×', {n:n2,d:d2}, '=', '?']); },
    }
  },
  {
    id:'decimais', name:'Números decimais', sym:'0,1',
    learn:`<p>Já reparou que o preço de um lanche pode ser R$ 7,50? Aquele número depois da vírgula também é uma quantidade — só que menor que 1 inteiro. Números decimais são assim: representam partes que não são inteiras. 3,25 se lê "três inteiros e vinte e cinco centésimos".</p>
    <p><b>Passo a passo pra fazer as contas:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Para somar ou subtrair, empilhe os números alinhando a <b>vírgula</b> — como se ela fosse o "chão" de referência. Assim, unidade fica sob unidade, décimo sob décimo, centésimo sob centésimo. Complete com zero as casas que faltarem, sem medo, isso não muda o valor.</li>
      <li>Some ou subtraia normalmente, coluna por coluna, e desça a vírgula pro resultado, exatamente na mesma posição.</li>
      <li>Para multiplicar, o truque é: ignore a vírgula e multiplique como se fossem números inteiros; depois conte quantas casas decimais os dois números tinham juntos, e reposicione a vírgula no resultado contando essa quantidade de casas a partir da direita.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (multiplicação)', text:'2,5 × 1,2 = 3,00 = 3', qVisual: potStage(multArmada(25,12,true)) + potStage(chainRow(['300','→','3,00','=','3'])), steps:['Ignore as vírgulas: 25 × 12 = 300', '2,5 tem 1 casa decimal, 1,2 tem 1 casa: 2 casas ao todo', 'Reposicione a vírgula, contando 2 da direita: 3,00, ou seja, 3']},
      {title:'Exemplo 2 (soma)', text:'4,25 + 1,70 = 5,95', columns:{nums:['4,25','1,70'], op:'+', result:'5,95', carries:addColumnSteps([425,170],2).carries}, steps:addColumnSteps([425,170],2).steps},
      {title:'Exemplo 3 (subtração)', text:'10,00 − 3,45 = 6,55', columns:{nums:['10,00','3,45'], op:'−', result:'6,55', marks:subColumnSteps(1000,345,2).marks}, steps:subColumnSteps(1000,345,2).steps},
    ],
    gen:{
      facil:()=>{ let a=randInt(1,9)+ (pick([0.1,0.2,0.5,0.7])), b=randInt(1,9)+(pick([0.1,0.3,0.4,0.6])); a=Math.round(a*10)/10; b=Math.round(b*10)/10; const {steps, result, carries} = addColumnSteps([Math.round(a*10), Math.round(b*10)], 1); return mkSingle(`${fmt(a)} + ${fmt(b)} = ?`, parseFloat(result.replace(',','.')), steps, {nums:[fmt(a),fmt(b)], op:'+', carries}); },
      medio:()=>{ let a=Math.round((randInt(2,20)+Math.random())*100)/100, b=Math.round((randInt(1,10)+Math.random())*100)/100; if(a<b){ [a,b]=[b,a]; } const {steps, result, marks} = subColumnSteps(Math.round(a*100), Math.round(b*100), 2); return mkSingle(`${fmt(a)} − ${fmt(b)} = ?`, parseFloat(result.replace(',','.')), steps, {nums:[fmt(a),fmt(b)], op:'−', marks}); },
      dificil:()=>{ const a=Math.round((randInt(1,9)+pick([0.2,0.5,0.4]))*10)/10, b=randInt(2,9); const intA=Math.round(a*10); const r=Math.round(a*b*100)/100; const mulRes=mulSingleDigitSteps(intA,b); const steps=[`Multiplique ignorando a vírgula: ${intA} × ${b} = ${intA*b}`, `Reposicione a vírgula (1 casa decimal, pois ${fmt(a)} tem 1 casa): ${fmt(r)}`]; return mkSingle(`${fmt(a)} × ${b} = ?`, r, steps, null, multArmada(intA,b,false), potStage(multArmada(intA,b,true,mulRes.carries)) + potStage(chainRow([intA,'×',b,'=',intA*b,'→',fmt(r)]))); },
    }
  },
  {
    id:'porcentagem', name:'Porcentagem', sym:'%',
    learn:`<p>Você já viu uma placa de loja dizendo "50% de desconto"? Porcentagem é só um jeito de falar "de cada 100". 25% quer dizer 25 em cada 100 — ou, em número, 0,25 (é só dividir por 100). É uma forma de comparar partes sem precisar saber o total exato.</p>
    <p><b>Para calcular X% de um valor:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Multiplique o valor pela taxa X.</li>
      <li>Divida o resultado por 100.</li>
    </ol>
    <p><b>Para aumentos e descontos:</b> primeiro calcule a porcentagem normalmente, do jeito de cima. Depois, some esse valor ao total (se for aumento) ou subtraia (se for desconto).</p>`,
    examples:[
      {title:'Exemplo 1', text:'20% de 150 = 150 × 20 ÷ 100 = 30', qVisual: fracRow([{n:20,d:100}, '×', 150, '=', 30]), steps:['Monte a fração: 20% = 20/100', 'Multiplique pelo valor: 150 × 20 = 3000', 'Divida por 100: 3000 ÷ 100 = 30']},
      {title:'Exemplo 2', text:'50% de 80 = 40', qVisual: fracRow([{n:50,d:100}, '×', 80, '=', 40]), steps:['50% é metade — dá pra ir direto: 80 ÷ 2 = 40', 'Conferindo pela fórmula: 80 × 50 ÷ 100 = 40']},
      {title:'Exemplo 3 (desconto)', text:'Um produto de R$ 200 com 15% de desconto sai por R$ 170', qVisual: fracRow([{n:15,d:100}, '×', 200, '=', 30]), steps:['Calcule os 15%: 200 × 15 ÷ 100 = 30', 'Como é desconto, subtraia do preço original: 200 − 30 = 170']},
    ],
    gen:{
      facil:()=>{ const p=pick([10,20,25,50]); const base=pick([20,40,60,80,100,200]); const r=base*p/100; return mkSingle(`${p}% de ${base} = ?`, r, [`${p}% = ${p}/100`, `${base} × ${p} ÷ 100 = ${r}`], null, fracRow([{n:p,d:100}, '×', base, '=', '?']), fracRow([{n:p,d:100}, '×', base, '=', fmt(r)])); },
      medio:()=>{ const p=randInt(5,60); const base=randInt(50,400); const r=Math.round(base*p/100*100)/100; return mkSingle(`${p}% de ${base} = ?`, r, [`Multiplique ${base} por ${p} e divida por 100.`, `${base} × ${p} ÷ 100 = ${fmt(r)}`], null, fracRow([{n:p,d:100}, '×', base, '=', '?']), fracRow([{n:p,d:100}, '×', base, '=', fmt(r)])); },
      dificil:()=>{ const base=randInt(80,500); const p=randInt(5,40); const aumento=Math.round(base*p/100*100)/100; const r=Math.round(base*(1+p/100)*100)/100; return mkSingle(`Um produto de R$ ${base} teve aumento de ${p}%. Qual o novo preço?`, r, [`Aumento: ${base} × ${p} ÷ 100 = ${fmt(aumento)}`, `Novo preço: ${base} + ${fmt(aumento)} = ${fmt(r)}`], null, fracRow([{n:p,d:100}, '×', base, '=', '?']), stepChain([`${fmt(p)}% × ${base} = ${fmt(aumento)}`, `${base} + ${fmt(aumento)} = ${fmt(r)}`])); },
    }
  },
  {
    id:'regra3', name:'Regra de três', sym:'∝',
    learn:`<p>"Regra de três" tem nome de bicho de sete cabeças, mas a ideia é simples: é um jeito organizado de responder perguntas do tipo "se 3 lápis custam 6 reais, quanto custam 5 lápis?". Você tem duas coisas que variam juntas (aqui, "quantidade de lápis" e "preço em reais"). Você já sabe 3 dos 4 números da conta — só falta um, que a gente chama de <b>x</b>.</p>
    <div class="section-title">Passo 1 — as duas coisas andam no mesmo sentido, ou em sentidos opostos?</div>
    <p><b>Diretamente proporcional:</b> as duas grandezas andam juntas, no mesmo sentido — se uma aumenta, a outra também aumenta; se uma diminui, a outra também diminui.</p>
    <p><b>Inversamente proporcional:</b> as duas andam em sentidos opostos — se uma aumenta, a outra diminui. Exemplo: quanto mais pedreiros numa obra, menos dias ela demora.</p>
    <div class="section-title">Passo 2 — se for diretamente proporcional: multiplique em cruz</div>
    <p>Monte a tabelinha com as duas grandezas, uma coluna pra cada. Veja este exemplo: uma calça gasta um tanto de tecido — se a quantidade de calças diminui, a quantidade de tecido gasto também diminui. Como quanto <b>menor</b> a quantidade de calças, <b>menor</b> a quantidade de tecido, as grandezas são diretamente proporcionais, e assim, basta multiplicar em cruz.</p>
    ${cruzVisual(['Calças','Tecido (m)'], [16,24], [10,'x'])}
    <p>"Multiplicar em cruz" quer dizer: multiplique os dois números ligados pela mesma linha vermelha, e iguale os dois resultados. Aqui: 16 × x = 10 × 24, ou seja 16x = 240. Para achar o x sozinho, divida os dois lados por 16: x = 240 ÷ 16 = 15.</p>
    <div class="section-title">Passo 3 — se for inversamente proporcional: monte com o x na fração da esquerda</div>
    <p>Quando é inversa, <b>não</b> se multiplica em cruz direto na tabela — primeiro você monta a proporção de um jeito diferente. Ache a coluna onde está o x: ela vira a fração da <b>esquerda</b>, com o número da primeira linha em cima e o x embaixo. A outra coluna vira a fração da direita, mas <b>trocada de ordem</b>: o número da segunda linha em cima, o da primeira embaixo.</p>
    ${proporcaoTable(['Costureiras','Dias'], [4,12], ['x',8])}
    <p>Aqui o x está na coluna "Costureiras", então a fração da esquerda é 4/x. A coluna "Dias" entra invertida: 8 em cima, 12 embaixo. Fica: ${fracRow([{n:4,d:'x'}, '=', {n:8,d:12}])} Agora sim multiplique em cruz normalmente: 4 × 12 = x × 8, ou seja 48 = 8x, logo x = 48 ÷ 8 = 6.</p>`,
    examples:[
      {title:'Exemplo 1 (direta)', text:'3 lápis custam 6 reais. Quanto custam 5 lápis?', qVisual: proporcaoTag('direta') + cruzVisual(['Itens','Reais'], [3,6], [5,'x']), steps:['Mais lápis custam mais: como quanto maior a quantidade de itens, maior o preço, é proporção direta', 'Multiplique em cruz: 3 × x = 5 × 6', 'x = 30 ÷ 3 = 10 reais']},
      {title:'Exemplo 2 (direta)', text:'4 páginas em 8 minutos. Quantas páginas em 12 minutos?', qVisual: proporcaoTag('direta') + cruzVisual(['Minutos','Páginas'], [8,4], [12,'x']), steps:['Mais tempo, mais páginas: proporção direta', 'Multiplique em cruz: 8 × x = 12 × 4', 'x = 48 ÷ 8 = 6 páginas']},
      {title:'Exemplo 3 (inversa)', text:'2 pedreiros fazem um muro em 10 dias. 5 pedreiros fazem em quantos dias?', qVisual: proporcaoTag('inversa') + proporcaoTable(['Pedreiros','Dias'], [2,10], [5,'x']) + fracRow([{n:10,d:'x'}, '=', {n:5,d:2}]), steps:['Mais pedreiros, menos dias: proporção inversa', 'O x está na coluna Dias, então a fração da esquerda é 10/x. A coluna Pedreiros entra invertida: 5/2', 'Multiplicando em cruz: 10 × 2 = 5 × x, então x = 4 dias']},
    ],
    gen:{
      facil:()=>{ const a=pick([2,3,4,5]), b=a*pick([2,3,4]); const c=a*pick([2,3]); const x=c*b/a; return mkSingle(`Se ${a} itens custam R$ ${b}, quanto custam ${c} itens (mesma proporção)?`, x, [`Proporção direta — multiplique em cruz: ${a} × x = ${c} × ${b}`, `x = ${c} × ${b} ÷ ${a}`, `x = ${x}`], null, proporcaoTag('direta') + cruzVisual(['Itens','R$'], [a,b], [c,'?']), proporcaoTag('direta') + cruzVisual(['Itens','R$'], [a,b], [c,fmt(x)])); },
      medio:()=>{ const a=randInt(3,10), b=randInt(10,60); const c=randInt(3,20); const x=Math.round(c*b/a*100)/100; return mkSingle(`${a} máquinas produzem ${b} peças. Quantas peças ${c} máquinas produzem (mesma proporção)?`, x, [`Proporção direta: ${a}/${b} = ${c}/x`, `Multiplique em cruz: x = ${c} × ${b} ÷ ${a}`, `x = ${fmt(x)}`], null, proporcaoTag('direta') + cruzVisual(['Máquinas','Peças'], [a,b], [c,'?']), proporcaoTag('direta') + cruzVisual(['Máquinas','Peças'], [a,b], [c,fmt(x)])); },
      dificil:()=>{ const a=randInt(2,8), b=randInt(4,20); const c=randInt(2,8); const x=Math.round(a*b/c*100)/100; return mkSingle(`${a} torneiras enchem uma caixa em ${b} horas. Em quantas horas ${c} torneiras enchem a mesma caixa (proporção inversa)?`, x, [`Proporção inversa — o x está na coluna Horas, então a fração da esquerda é ${b}/x. A coluna Torneiras entra invertida: ${c}/${a}`, `Multiplicando em cruz: ${b} × ${a} = ${c} × x`, `x = ${a} × ${b} ÷ ${c} = ${fmt(x)}`], null, proporcaoTag('inversa') + proporcaoTable(['Torneiras','Horas'], [a,b], [c,'?']), proporcaoTag('inversa') + proporcaoTable(['Torneiras','Horas'], [a,b], [c,fmt(x)])); },
    }
  },
  {
    id:'potenciacao', name:'Potenciação e radiciação', sym:'xⁿ',
    learn:`<p>Assim como a multiplicação é uma soma repetida, a <b>potenciação</b> é uma multiplicação repetida: 2³ quer dizer "multiplique 2 por ele mesmo, 3 vezes": 2 × 2 × 2 = 8. O número que se repete (2) é a <b>base</b>, e o número de vezes (3) é o <b>expoente</b>.</p>
    <p><b>Radiciação</b> é o caminho contrário — desfaz uma potenciação:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>√9 pergunta: "que número, multiplicado por ele mesmo, dá 9?" Como 3 × 3 = 9, então √9 = 3.</li>
      <li>Para a raiz cúbica (∛), a pergunta muda um pouco: "que número multiplicado três vezes por ele mesmo dá esse valor?"</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'5² = 25   e   √25 = 5', qVisual: potStage(potRow([{b:5,e:2},'=',25])) + potStage(potRow([{root:true,n:25,e:2},'=',5])), steps:['5² é 5 multiplicado por ele mesmo: 5 × 5 = 25', 'De volta: √25 pergunta "que número × ele mesmo dá 25?" — é o 5']},
      {title:'Exemplo 2 (cubo)', text:'2³ = 8', qVisual: potStage(potRow([{b:2,e:3},'=',8])), steps:['O expoente 3 diz: multiplique o 2 por ele mesmo, 3 vezes', '2 × 2 = 4, depois 4 × 2 = 8']},
      {title:'Exemplo 3 (raiz)', text:'√16 = 4, pois 4² = 16', qVisual: potStage(potRow([{root:true,n:16,e:2},'=',4])), steps:['Pergunta: que número × ele mesmo dá 16?', 'Testando: 4 × 4 = 16 — achou! Logo √16 = 4']},
    ],
    gen:{
      facil:()=>{ const b=randInt(2,9), e=2; const r=Math.pow(b,e); return mkSingle(`${b}² = ?`, r, [`${b}² = ${b} × ${b}`, `Resultado: ${r}`], null, potRow([{b,e},'=','?']), potStage(potRow([{b,e},'=',r])) + potStage(chainRow([b,'×',b,'=',r]))); },
      medio:()=>{ const roots=[4,9,16,25,36,49,64,81,100,121,144]; const r=pick(roots); const raiz=Math.sqrt(r); return mkSingle(`√${r} = ?`, raiz, [`Pergunte: que número multiplicado por ele mesmo dá ${r}?`, `√${r} = ${raiz}`], null, potRow([{root:true,n:r,e:2},'=','?']), potStage(potRow([{root:true,n:r,e:2},'=',raiz])) + potStage(chainRow([raiz,'×',raiz,'=',r]))); },
      dificil:()=>{ const b=randInt(2,6), e=3; const r=Math.pow(b,e); return mkSingle(`${b}³ = ?`, r, [`${b}³ = ${b} × ${b} × ${b}`, `${b} × ${b} = ${b*b}`, `${b*b} × ${b} = ${r}`], null, potRow([{b,e},'=','?']), potStage(potRow([{b,e},'=',r])) + potStage(chainRow([b,'×',b,'×',b,'=',r]))); },
    }
  },
  {
    id:'expressoes', name:'Expressões numéricas', sym:'( )',
    learn:`<p>Se uma conta tem várias operações misturadas, tipo 10 − 2 × 3, não dá pra resolver simplesmente na ordem que aparece — assim como numa receita de bolo, existe uma ordem certa a seguir. Essa ordem é sempre a mesma:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Parênteses, colchetes e chaves</b> primeiro — resolva o que está dentro deles antes de mais nada.</li>
      <li><b>Potências e raízes</b> em seguida.</li>
      <li><b>Multiplicação e divisão</b> depois, na ordem em que aparecem, da esquerda pra direita.</li>
      <li><b>Adição e subtração</b> por último, também da esquerda pra direita.</li>
    </ol>
    <p>Uma forma de lembrar: parênteses "protegem" o que tem dentro, potência é a operação mais "forte", e soma/subtração são sempre as últimas a acontecer.</p>`,
    examples:[
      {title:'Exemplo 1 (parênteses)', text:'(2 + 3) × 4 = 5 × 4 = 20', qVisual: stepChain(['(2 + 3) × 4', '5 × 4', '20']), steps:['Resolva o parênteses primeiro: 2 + 3 = 5', 'Agora multiplique: 5 × 4 = 20']},
      {title:'Exemplo 2 (multiplicação primeiro)', text:'10 − 2 × 3 = 10 − 6 = 4', qVisual: stepChain(['10 − 2 × 3', '10 − 6', '4']), steps:['Mesmo vindo depois, a multiplicação resolve primeiro: 2 × 3 = 6', 'Só agora a subtração: 10 − 6 = 4']},
      {title:'Exemplo 3 (potência primeiro)', text:'3² + 4 = 9 + 4 = 13', qVisual: stepChain(['3² + 4', '9 + 4', '13']), steps:['A potência vem antes da soma: 3² = 9', 'Agora some: 9 + 4 = 13']},
    ],
    gen:{
      facil:()=>{ const a=randInt(2,9), b=randInt(2,9), c=randInt(2,9); const r=a+b*c; return mkSingle(`${a} + ${b} × ${c} = ?`, r, [`Primeiro a multiplicação: ${b} × ${c} = ${b*c}`, `Depois a soma: ${a} + ${b*c} = ${r}`], null, chainRow([a,'+',b,'×',c,'=','?']), stepChain([`${a} + ${b} × ${c}`, `${a} + ${b*c}`, `${r}`])); },
      medio:()=>{ const a=randInt(2,9), b=randInt(2,9), c=randInt(2,6); const r=(a+b)*c; return mkSingle(`(${a} + ${b}) × ${c} = ?`, r, [`Resolva o parênteses: ${a} + ${b} = ${a+b}`, `Multiplique: ${a+b} × ${c} = ${r}`], null, chainRow([`(${a} + ${b})`,'×',c,'=','?']), stepChain([`(${a} + ${b}) × ${c}`, `${a+b} × ${c}`, `${r}`])); },
      dificil:()=>{ const a=randInt(2,9), b=randInt(2,6), c=randInt(2,9), d=randInt(2,5); const r=a*b - c + d*d; return mkSingle(`${a} × ${b} − ${c} + ${d}² = ?`, r, [`Potência: ${d}² = ${d*d}`, `Multiplicação: ${a} × ${b} = ${a*b}`, `Some/subtraia da esquerda p/ direita: ${a*b} − ${c} + ${d*d} = ${r}`], null, chainRow([a,'×',b,'−',c,'+',`${d}²`,'=','?']), stepChain([`${a} × ${b} − ${c} + ${d}²`, `${a*b} − ${c} + ${d*d}`, `${r}`])); },
    }
  },
  {
    id:'eq1', name:'Equações do 1º grau', sym:'x=',
    learn:`<p>Pense numa equação como uma balança equilibrada: os dois lados do sinal de igual "pesam" a mesma coisa. Uma equação do 1º grau tem a forma ax + b = c, onde x é um número escondido que você precisa descobrir. Resolver a equação é achar o valor de x que deixa os dois lados equilibrados.</p>
    <p><b>Passo a passo pra descobrir o x:</b></p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Junte todos os termos com x de um lado da igualdade, e os números sozinhos (sem x) do outro lado.</li>
      <li>Aqui vai o truque: sempre que um termo "atravessa" o sinal de igual pra trocar de lado, ele <b>troca de sinal</b> também — quem tava somando passa subtraindo, e quem tava multiplicando passa dividindo.</li>
      <li>No fim, x deve estar sozinho de um lado. Se ele ainda estiver sendo multiplicado por um número, divida os dois lados por esse número.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'2x + 3 = 11 → 2x = 8 → x = 4', qVisual: stepChain(['2x + 3 = 11', '2x = 8', 'x = 4']), steps:['O +3 atravessa o igual e vira −3: 2x = 11 − 3 = 8', 'Agora 2 está multiplicando x — divida os dois lados por 2: x = 4']},
      {title:'Exemplo 2 (subtração)', text:'5x − 4 = 16 → 5x = 20 → x = 4', qVisual: stepChain(['5x − 4 = 16', '5x = 20', 'x = 4']), steps:['O −4 atravessa o igual e vira +4: 5x = 16 + 4 = 20', 'Divida os dois lados por 5: x = 4']},
      {title:'Exemplo 3 (x nos dois lados)', text:'3x + 2 = x + 10 → 2x = 8 → x = 4', qVisual: stepChain(['3x + 2 = x + 10', '2x = 8', 'x = 4']), steps:['Passe o x da direita pra esquerda (troca de sinal): 3x − x + 2 = 10', 'Junte os x: 2x + 2 = 10, e o +2 vira −2: 2x = 8', 'Divida por 2: x = 4']},
    ],
    gen:{
      facil:()=>{ const x=randInt(1,10), a=randInt(2,5), b=randInt(1,10); const c=a*x+b; const eqText=`${a}x + ${b} = ${c}`; return mkSingle(eqText, x, [`Isole o termo com x: ${a}x = ${c} − ${b} = ${c-b}`, `Divida por ${a}: x = ${c-b} ÷ ${a}`, `x = ${x}`], null, stepChain([eqText]), stepChain([eqText, `${a}x = ${c-b}`, `x = ${x}`])); },
      medio:()=>{ const x=randInt(-8,10), a=randInt(2,6), b=randInt(1,15); const c=a*x-b; const eqText=`${a}x − ${b} = ${c}`; return mkSingle(eqText, x, [`Isole: ${a}x = ${c} + ${b} = ${c+b}`, `Divida por ${a}: x = ${c+b} ÷ ${a}`, `x = ${x}`], null, stepChain([eqText]), stepChain([eqText, `${a}x = ${c+b}`, `x = ${x}`])); },
      dificil:()=>{
        const x=randInt(-6,8);
        let a=randInt(2,5), d=randInt(2,5);
        while(d===a) d=randInt(2,5);
        const b=randInt(1,10);
        const e=(a-d)*x+b;
        const eqText = `${a}x + ${b} = ${d}x ${fmtSigned(e)}`;
        return mkSingle(eqText, x,
          [`Passe os termos com x para um lado: (${a} − ${d})x = ${e} − ${b}`, `${a-d}x = ${e-b}`, `x = ${e-b} ÷ ${a-d} = ${x}`],
          null,
          stepChain([eqText]),
          stepChain([eqText, `(${a} − ${d})x = ${e} − ${b}`, `${a-d}x = ${e-b}`, `x = ${x}`])
        );
      },
    }
  },
  {
    id:'eq2', name:'Equações do 2º grau', sym:'x²',
    learn:`<p>Uma equação do 2º grau é parecida com as equações que você já resolveu antes, só que agora aparece um <b>x²</b> (x multiplicado por ele mesmo). Essa diferença muda o resultado: em vez de uma única resposta, ela costuma ter <b>duas respostas possíveis</b>, chamadas de <b>raízes</b> da equação. Toda equação desse tipo pode ser escrita neste formato: <b>ax² + bx + c = 0</b>, onde a, b e c são apenas números (o a nunca pode ser 0, senão o x² some e a equação deixa de ser do 2º grau).</p>
    <div class="section-title">A fórmula de Bhaskara — um "molde" que resolve qualquer uma delas</div>
    <p>Existe uma fórmula pronta que funciona pra qualquer equação do 2º grau, sem você precisar adivinhar os números. Ela parece complicada de cara, mas é só seguir o passo a passo com calma:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Ache a, b e c.</b> Olhe a equação: <b>a</b> é o número que multiplica x², <b>b</b> é o número que multiplica o x sozinho, e <b>c</b> é o número que aparece sem nenhum x. Se x² ou x aparecerem sozinhos (sem número na frente), o coeficiente é 1; se algum termo não aparecer na equação, ele vale 0.</li>
      <li><b>Calcule o Δ (delta).</b> Delta é só o nome que damos a um número auxiliar, que vamos usar no passo seguinte: Δ = b² − 4ac.</li>
      <li><b>Confira o Δ antes de continuar.</b> Se Δ for negativo, pare por aí: não existe raiz quadrada de número negativo, então essa equação não tem solução real. Se Δ for zero ou positivo, siga para o próximo passo normalmente.</li>
      <li><b>Substitua a, b e Δ na fórmula abaixo.</b> O sinal <b>±</b> (lê-se "mais ou menos") é o motivo de existirem duas respostas: numa conta você soma a raiz de Δ, na outra você subtrai — o resto da fórmula é igual nas duas.</li>
    </ol>
    <div class="example-box" style="margin-top:8px">${bhaskaraFormulaBox()}</div>
    <div class="section-title">Escrevendo a resposta final: o conjunto solução (S)</div>
    <p>Depois de achar as raízes, a resposta se escreve reunindo todas elas dentro de chaves { }, separadas por vírgula. Esse conjunto de respostas se chama <b>conjunto solução</b>, e se representa pela letra <b>S</b>. Se a equação não tiver solução real (Δ negativo), escrevemos S = { } (um conjunto vazio, sem nenhum elemento).</p>
    <div class="section-title">Vendo o passo a passo completo num exemplo</div>
    <p>Vamos resolver x² − 5x + 6 = 0 do começo ao fim, exatamente na ordem que você vai usar em qualquer equação do 2º grau — com o Δ e o conjunto solução S destacados em caixa, do jeitinho que costuma aparecer no caderno:</p>
    ${bhaskaraCard(1,-5,6)}`,
    examples:[
      {title:'Exemplo 1', text:'x² − 5x + 6 = 0 → S = {2, 3}', qVisual: bhaskaraFormulaBox() + '<div class="bk-divider">Substituindo os valores</div>' + bhaskaraCard(1,-5,6,true), steps: bhaskaraSteps(1,-5,6)},
      {title:'Exemplo 2 (Δ = 0, raiz dupla)', text:'x² − 4x + 4 = 0 → S = {2}', qVisual: bhaskaraFormulaBox() + '<div class="bk-divider">Substituindo os valores</div>' + bhaskaraCard(1,-4,4,true), steps: bhaskaraSteps(1,-4,4)},
      {title:'Exemplo 3 (a ≠ 1)', text:'2x² − 8x + 6 = 0 → S = {1, 3}', qVisual: bhaskaraFormulaBox() + '<div class="bk-divider">Substituindo os valores</div>' + bhaskaraCard(2,-8,6,true), steps: bhaskaraSteps(2,-8,6)},
    ],
    gen:{
      facil:()=>{ const r1=randInt(1,6), r2=randInt(1,6); const b=-(r1+r2), c=r1*r2; const eqText=`x² ${fmtSigned(b)}x ${fmtSigned(c)} = 0`; return mkPair(eqText, r1, r2, bhaskaraSteps(1,b,c), stepChain([eqText]), bhaskaraCard(1,b,c)); },
      medio:()=>{ const a=pick([1,2]); const r1=randInt(-5,5)||1, r2=randInt(-5,5)||2; const b=-a*(r1+r2), c=a*r1*r2; const eqText=`${a>1?a:''}x² ${fmtSigned(b)}x ${fmtSigned(c)} = 0`; return mkPair(eqText, r1, r2, bhaskaraSteps(a,b,c), stepChain([eqText]), bhaskaraCard(a,b,c)); },
      dificil:()=>{ const a=pick([1,2,3]); const r1=randInt(-6,6)||1, r2=randInt(-6,6)||-2; const b=-a*(r1+r2), c=a*r1*r2; const eqText=`${a>1?a:''}x² ${fmtSigned(b)}x ${fmtSigned(c)} = 0`; return mkPair(eqText, r1, r2, bhaskaraSteps(a,b,c), stepChain([eqText]), bhaskaraCard(a,b,c)); },
    }
  },
  {
    id:'sistemas', name:'Sistemas de equações', sym:'{x,y}',
    learn:`<p>Imagina duas pistas de um mistério que precisam bater ao mesmo tempo: "x + y = 7" e "x − y = 1". Um sistema é isso — duas (ou mais) equações que compartilham as mesmas incógnitas (x e y). Resolver o sistema é achar os valores de x e y que deixam <b>todas</b> as equações verdadeiras ao mesmo tempo.</p>
    <p><b>Método da adição</b> (um dos jeitos mais diretos de resolver):</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Se precisar, multiplique uma ou as duas equações por números, de forma que uma das variáveis fique com coeficientes opostos (por exemplo, +2x numa equação e −2x na outra).</li>
      <li>Some as duas equações, coluna por coluna — essa variável se cancela sozinha, e sobra uma equação simples, só com uma incógnita.</li>
      <li>Resolva essa equação simples, e depois substitua o valor encontrado em qualquer uma das equações originais para descobrir a outra incógnita.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1', text:'x + y = 7,  x − y = 1  →  x = 4, y = 3', qVisual: sistemaArmado([{x:'x',y:'+ y',c:'7'},{x:'x',y:'− y',c:'1'}], {x:'2x',y:'',c:'8'}), steps:['O y já tem sinais opostos (+y e −y) — pode somar direto', 'Somando: 2x = 8, então x = 4', 'Substituindo na 1ª equação: 4 + y = 7, então y = 3']},
      {title:'Exemplo 2', text:'x + y = 9,  x − y = 3  →  x = 6, y = 3', qVisual: sistemaArmado([{x:'x',y:'+ y',c:'9'},{x:'x',y:'− y',c:'3'}], {x:'2x',y:'',c:'12'}), steps:['O y de novo tem sinais opostos — soma direto', 'Somando: 2x = 12, então x = 6', 'Substituindo: 6 + y = 9, então y = 3']},
      {title:'Exemplo 3 (com coeficientes)', text:'3x − y = 5,  x + y = 7  →  x = 3, y = 4', qVisual: sistemaArmado([{x:'3x',y:'− y',c:'5'},{x:'x',y:'+ y',c:'7'}], {x:'4x',y:'',c:'12'}), steps:['O y já tem sinais opostos (−y e +y) — soma direto', 'Somando: 4x = 12, então x = 3', 'Substituindo na 2ª equação: 3 + y = 7, então y = 4']},
    ],
    gen:{
      facil:()=>{ const x=randInt(1,10), y=randInt(1,10); const a1=x+y, a2=x-y; const rows=[{x:'x',y:'+ y',c:`${a1}`},{x:'x',y:'− y',c:`${a2}`}]; const sum={x:'2x',y:'',c:`${a1+a2}`}; return mkXY(`x + y = ${a1}\nx − y = ${a2}`, x, y, [`Some as duas equações: 2x = ${a1+a2}`, `x = ${a1+a2}/2 = ${x}`, `Substitua na 1ª: y = ${a1} − ${x} = ${y}`], sistemaArmado(rows), sistemaArmado(rows, sum)); },
      medio:()=>{ const x=randInt(1,8), y=randInt(1,8); const a=randInt(2,3), b=randInt(2,3); const e1=a*x+y, e2=x+b*y; const rows=[{x:`${a}x`,y:'+ y',c:`${e1}`},{x:'x',y:`+ ${b}y`,c:`${e2}`}]; return mkXY(`${a}x + y = ${e1}\nx + ${b}y = ${e2}`, x, y, [`Isole y na 1ª: y = ${e1} − ${a}x`, `Substitua na 2ª: x + ${b}(${e1} − ${a}x) = ${e2}`, `Resolvendo: x = ${x}`, `y = ${e1} − ${a}×${x} = ${y}`], sistemaArmado(rows), sistemaArmado(rows)); },
      dificil:()=>{ const x=randInt(-5,8), y=randInt(-5,8); const a=randInt(2,4), b=randInt(2,4), c=randInt(1,3), d=randInt(1,3); const e1=a*x+c*y, e2=b*x-d*y; const rows=[{x:`${a}x`,y:`+ ${c}y`,c:`${e1}`},{x:`${b}x`,y:`− ${d}y`,c:`${e2}`}]; return mkXY(`${a}x + ${c}y = ${e1}\n${b}x − ${d}y = ${e2}`, x, y, [`Multiplique as equações para igualar coeficientes de uma variável.`, `Some/subtraia para eliminar essa variável.`, `x = ${x}`, `y = ${y}`], sistemaArmado(rows), sistemaArmado(rows)); },
    }
  },
  {
    id:'func1grau', name:'Função do 1º grau', sym:'ax+b',
    learn:`<p>Pense numa função como uma máquina: você põe um número (x) numa ponta, e sai outro número (f(x)) do outro lado — sempre seguindo a mesma receita. A <b>função do 1º grau</b> é a mais simples desse tipo: sua receita tem essa forma:</p>
    <div class="example-box mono" style="margin-top:8px">f(x) = ax + b</div>
    <p>Às vezes você vai ver escrita de outro jeito: <b>y = mx + b</b>. É exatamente a mesma coisa — só trocam os nomes: <b>y</b> no lugar de f(x), e <b>m</b> no lugar de a.</p>
    <div class="section-title">Passo 1 — o que são a e b</div>
    <p><b>a</b> é o <b>coeficiente angular</b>: ele diz o quanto a reta sobe (ou desce) conforme x anda para a direita. Quanto maior o valor de a (ignorando o sinal), mais "em pé" fica a reta.</p>
    <p><b>b</b> é o <b>coeficiente linear</b>: é o valor de f(x) quando x = 0, ou seja, é o ponto exato onde a reta corta o eixo vertical (eixo y) do gráfico.</p>
    <p style="color:var(--ink-soft); font-size:13px;">Curiosidade: como essa função aceita qualquer número real como entrada (x) e sempre devolve outro número real como saída (f(x)), dizemos que ela "vai de R em R" — R é como chamamos o conjunto de todos os números reais. E o a nunca pode ser 0, senão o x desaparece da fórmula e ela deixa de ser do 1º grau.</p>
    <div class="section-title">Passo 2 — calcular f(x) para um número</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Troque o x da fórmula pelo número que você quer "colocar na máquina", mantendo parênteses ao redor dele (isso ajuda bastante quando o número é negativo).</li>
      <li>Resolva a conta: primeiro a multiplicação, depois a soma ou subtração.</li>
    </ol>
    <div class="section-title">Passo 3 — achar a raiz da função</div>
    <p>A <b>raiz</b> (também chamada de <b>zero</b> da função) é o valor de x que faz f(x) dar exatamente 0 — é o ponto onde o gráfico da função cruza o eixo horizontal. Pra achar, iguale a fórmula a zero e resolva a equação como uma equação do 1º grau comum:</p>
    <div class="example-box" style="margin-top:8px">
      <div style="font-family:'JetBrains Mono',monospace; font-size:15px;">ax + b = 0</div>
      <div style="color:var(--ink-soft); font-size:16px; margin:4px 0;">↓</div>
      <div style="display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:6px; font-family:'JetBrains Mono',monospace; font-size:15px;">x = ${fracRow([{n:'−b', d:'a'}])}</div>
    </div>
    <div class="section-title">Passo 4 — o gráfico: sempre uma reta</div>
    <p>O gráfico de uma função do 1º grau é sempre uma <b>linha reta</b>. Só olhando o sinal do a, você já sabe pra qual lado ela vai:</p>
    <div class="lin-graph-wrap">${linearGraphSVG('crescente')}${linearGraphSVG('decrescente')}</div>
    <p>Se a for <b>positivo</b>, a reta sobe da esquerda pra direita — a função é <b>crescente</b> (quanto maior o x, maior o f(x)). Se a for <b>negativo</b>, a reta desce — a função é <b>decrescente</b> (quanto maior o x, menor o f(x)). Em ambos os casos, o b marca onde a reta corta o eixo y, e a raiz marca onde ela corta o eixo x.</p>
    <div class="section-title">Casos especiais</div>
    <p>Se <b>a = 0</b>, a função vira uma <b>constante</b> (f(x) = b pra qualquer x) — o gráfico é uma reta parada, paralela ao eixo x. Se <b>b = 0</b>, a reta passa exatamente pela origem, no ponto (0, 0).</p>
    <div class="section-title">Bônus — descobrindo o a a partir de dois pontos do gráfico</div>
    <p>Se você não tem a fórmula, mas sabe dois pontos (x₁, y₁) e (x₂, y₂) por onde a reta passa, ainda dá pra achar o a: divida "quanto a reta subiu" (a diferença entre os y) por "quanto ela andou pro lado" (a diferença entre os x).</p>
    <div class="example-box" style="margin-top:8px">
      <div style="display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:6px; font-family:'JetBrains Mono',monospace; font-size:15px;">a = ${fracRow([{n:'y₂ − y₁', d:'x₂ − x₁'}])}</div>
    </div>`,
    examples:[
      {title:'Exemplo 1 (calcular f(x))', text:'f(x) = 2x + 1 → f(3) = 2×3 + 1 = 7', qVisual: stepChain(['f(x) = 2x + 1', 'f(3) = 2×3 + 1', 'f(3) = 7']), steps:['Troque x por 3 na fórmula: f(3) = 2×3 + 1', 'Resolva a multiplicação primeiro: 2×3 = 6', 'Agora some: 6 + 1 = 7']},
      {title:'Exemplo 2 (achar a raiz)', text:'f(x) = 3x − 6 → raiz em x = 2', qVisual: stepChain(['3x − 6 = 0', '3x = 6', 'x = 2']), steps:['Iguale a fórmula a zero: 3x − 6 = 0', 'Isole o x: 3x = 6', 'x = 6 ÷ 3 = 2 — essa é a raiz da função']},
      {title:'Exemplo 3 (crescente ou decrescente)', text:'f(x) = −2x + 4 → decrescente, raiz em x = 2', qVisual: stepChain(['f(x) = −2x + 4', '−2x + 4 = 0', 'x = 2']), steps:['O a é −2, que é negativo — a função é decrescente', 'Achando a raiz: −2x + 4 = 0, então −2x = −4', 'x = −4 ÷ (−2) = 2']},
    ],
    gen:{
      facil:()=>{ const a=randInt(2,6), b=randInt(1,10), x=randInt(1,10); const r=a*x+b; return mkSingle(`f(x) = ${a}x + ${b}. Calcule f(${x}).`, r, [`Substitua x por ${x}: f(${x}) = ${a}×${x} + ${b}`, `f(${x}) = ${a*x} + ${b} = ${r}`], null, stepChain([`f(x) = ${a}x + ${b}`, `f(${x}) = ?`]), stepChain([`f(x) = ${a}x + ${b}`, `f(${x}) = ${a}×${x} + ${b}`, `f(${x}) = ${r}`])); },
      medio:()=>{ const a=randInt(2,6); const root=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]); const b=-a*root; const fx=`f(x) = ${a}x ${fmtSigned(b)}`; return mkSingle(`${fx}. Qual é a raiz da função (valor de x que faz f(x) = 0)?`, root, [`Iguale a fórmula a 0: ${a}x ${fmtSigned(b)} = 0`, `Isole o x: ${a}x = ${-b}`, `x = ${-b} ÷ ${a} = ${root}`], null, stepChain([fx, 'f(x) = 0 → ?']), stepChain([fx, `${a}x ${fmtSigned(b)} = 0`, `x = ${root}`])); },
      dificil:()=>{ const a=randInt(2,9); let b=randInt(-40,40); if(b===0) b=7; const root=Math.round((-b/a)*100)/100; const fx=`f(x) = ${a}x ${fmtSigned(b)}`; return mkSingle(`${fx}. Qual é a raiz da função (valor de x que faz f(x) = 0)?`, root, [`Iguale a fórmula a 0: ${a}x ${fmtSigned(b)} = 0`, `Isole o x: ${a}x = ${-b}`, `x = ${-b} ÷ ${a} = ${fmt(root)}`], null, stepChain([fx, 'f(x) = 0 → ?']), stepChain([fx, `${a}x ${fmtSigned(b)} = 0`, `x = ${fmt(root)}`])); },
    }
  },
  {
    id:'mmcmdc', name:'MMC e MDC', sym:'mmc',
    learn:`<p>Dois ônibus saem juntos do terminal: um volta a cada 4 minutos e o outro a cada 6. Depois de quanto tempo eles saem juntos de novo? Essa é uma pergunta de <b>MMC</b> (mínimo múltiplo comum): o <b>menor número</b> que está na tabuada dos dois. Resposta: 12 minutos.</p>
    <p>Já o <b>MDC</b> (máximo divisor comum) é o <b>maior número</b> que divide os dois sem sobrar nada. Ex.: tenho 12 balas e 18 pirulitos e quero montar saquinhos iguais, sem sobrar nada. Quantos saquinhos, no máximo? MDC(12, 18) = 6.</p>
    <p><b>Jeito rápido: decomponha em fatores primos</b> (divida por 2, 3, 5, 7... até chegar em 1).</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>MMC:</b> multiplique <b>todos</b> os fatores que aparecem, cada um com a <b>maior</b> quantidade de vezes em que aparece.</li>
      <li><b>MDC:</b> multiplique só os fatores <b>em comum</b>, cada um com a <b>menor</b> quantidade de vezes.</li>
    </ol>
    <p><b>Dica:</b> MMC × MDC = produto dos dois números. Ex.: 12 × 6 = 4 × 18 = 72.</p>`,
    examples:[
      {title:'Exemplo 1 (MMC)', text:'MMC(4, 6) = 12', steps:['Múltiplos de 4: 4, 8, <b>12</b>, 16...', 'Múltiplos de 6: 6, <b>12</b>, 18...', 'O primeiro que aparece nas duas listas é 12.']},
      {title:'Exemplo 2 (MDC)', text:'MDC(12, 18) = 6', steps:mdcSteps(12,18)},
      {title:'Exemplo 3 (por fatoração)', text:'MMC(12, 18) = 36', steps:mmcSteps(12,18)},
    ],
    gen:{
      facil:()=>{ const g=randInt(2,6), a=g*randInt(1,5), b=g*randInt(2,6); const [x,y]=a===b?[a,b+g]:[a,b]; return mkSingle(`MDC(${x}, ${y}) = ?`, gcd(x,y), mdcSteps(x,y)); },
      medio:()=>{ let a=randInt(2,12), b=randInt(3,15); if(a===b) b++; return mkSingle(`MMC(${a}, ${b}) = ?`, lcm(a,b), mmcSteps(a,b)); },
      dificil:()=>{
        if(Math.random()<0.5){ const a=pick([4,5,6,8,9,10,12,15]); let b=pick([6,8,10,12,14,15,18,20]); if(a===b) b+=2; const m=lcm(a,b);
          return mkSingle(`Dois ônibus saem juntos do terminal. Um volta a cada ${a} minutos e o outro a cada ${b} minutos. Depois de quantos minutos eles saem juntos de novo?`, m, ['Queremos o primeiro momento em que os dois coincidem: é o <b>MMC</b>.', ...mmcSteps(a,b), `Eles saem juntos de novo depois de ${m} minutos.`]); }
        const g=randInt(3,8), a=g*randInt(2,6); let b=g*randInt(3,7); if(a===b) b+=g;
        return mkSingle(`Tenho ${a} balas e ${b} pirulitos e quero montar saquinhos iguais, sem sobrar nada. Qual é o maior número de saquinhos possível?`, gcd(a,b), ['Queremos o maior número que divide os dois ao mesmo tempo: é o <b>MDC</b>.', ...mdcSteps(a,b), `Dá pra montar ${gcd(a,b)} saquinhos.`]);
      },
    }
  },
  {
    id:'geometria', name:'Áreas e perímetros', sym:'▭',
    learn:`<p>O <b>perímetro</b> é o tamanho do "contorno" de uma figura: é o que você andaria dando uma volta completa nela. Pra calcular, some todos os lados.</p>
    <p>A <b>área</b> é o tamanho da "parte de dentro": quanto de chão a figura cobre. Ela é medida em quadradinhos (cm², m²...).</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Retângulo:</b> área = base × altura · perímetro = 2 × (base + altura)</li>
      <li><b>Quadrado:</b> área = lado × lado · perímetro = 4 × lado</li>
      <li><b>Triângulo:</b> área = base × altura ÷ 2 (é metade de um retângulo)</li>
      <li><b>Trapézio:</b> área = (base maior + base menor) × altura ÷ 2</li>
      <li><b>Círculo:</b> área = π × raio², usando π ≈ 3,14</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (perímetro)', text:'Retângulo 8 cm × 3 cm → perímetro 22 cm', qVisual: geoFigure('rect',{b:8,h:3},{hl:'perim'}), steps:['Some todos os lados: 8 + 3 + 8 + 3 = 22', 'Ou use a fórmula: 2 × (8 + 3) = 22 cm']},
      {title:'Exemplo 2 (área do triângulo)', text:'Base 10 cm, altura 6 cm → área 30 cm²', qVisual: geoFigure('triangle',{b:10,h:6,a:3.5},{hl:'area', showRect:true}), steps:['Área = base × altura ÷ 2 (o triângulo é metade do retângulo pontilhado)', '10 × 6 = 60', '60 ÷ 2 = 30 cm²']},
      {title:'Exemplo 3 (círculo)', text:'Raio 5 cm → área 78,5 cm²', qVisual: geoFigure('circle',{r:5},{hl:'area'}), steps:['Área = π × r²', 'r² = 5 × 5 = 25', '3,14 × 25 = 78,5 cm²']},
    ],
    gen:{
      facil:()=>{
        if(Math.random()<0.5){ const b=randInt(3,15), a=randInt(2,12); const q=`Um retângulo tem ${b} cm de base e ${a} cm de altura. Qual é o perímetro (em cm)?`;
          return mkSingle(q, 2*(a+b), ['Perímetro é a soma de todos os lados.', `${b} + ${a} + ${b} + ${a} = ${2*(a+b)} cm`], null, geoQ(q, geoFigure('rect',{b,h:a},{ask:'perim'})), geoFigure('rect',{b,h:a},{hl:'perim'})); }
        const l=randInt(2,15); const q=`Um quadrado tem ${l} cm de lado. Qual é o perímetro (em cm)?`;
        return mkSingle(q, 4*l, ['O quadrado tem 4 lados iguais.', `4 × ${l} = ${4*l} cm`], null, geoQ(q, geoFigure('square',{l},{ask:'perim'})), geoFigure('square',{l},{hl:'perim'}));
      },
      medio:()=>{
        const r = Math.random();
        if(r<0.4){ const b=randInt(3,20), a=randInt(2,15); const q=`Qual é a área (em m²) de um terreno retangular de ${b} m por ${a} m?`;
          return mkSingle(q, a*b, ['Área do retângulo = base × altura', `${b} × ${a} = ${a*b} m²`], null, geoQ(q, geoFigure('rect',{b,h:a},{unit:'m', ask:'area'})), geoFigure('rect',{b,h:a},{unit:'m', hl:'area', grid:true})); }
        if(r<0.75){ const b=2*randInt(2,10), a=randInt(3,14), top=randInt(0,b); const q=`Um triângulo tem base ${b} cm e altura ${a} cm. Qual é a área (em cm²)?`;
          return mkSingle(q, b*a/2, ['Área do triângulo = base × altura ÷ 2', `${b} × ${a} = ${b*a}`, `${b*a} ÷ 2 = ${b*a/2} cm²`], null, geoQ(q, geoFigure('triangle',{b,h:a,a:top},{ask:'area'})), geoFigure('triangle',{b,h:a,a:top},{hl:'area', showRect:true})); }
        const b=randInt(4,14), a=randInt(2,9), sl=randInt(1,4); const q=`Um paralelogramo tem base ${b} cm e altura ${a} cm. Qual é a área (em cm²)?`;
        return mkSingle(q, b*a, ['Área do paralelogramo = base × altura (a altura é a reta pontilhada, não o lado inclinado)', `${b} × ${a} = ${b*a} cm²`], null, geoQ(q, geoFigure('parallelogram',{b,h:a,s:sl},{ask:'area'})), geoFigure('parallelogram',{b,h:a,s:sl},{hl:'area', showRect:true}));
      },
      dificil:()=>{
        const r = Math.random();
        if(r<0.3){ const rad=randInt(2,10); const A=Math.round(3.14*rad*rad*100)/100; const q=`Qual é a área (em cm²) de um círculo de raio ${rad} cm? Use π = 3,14.`;
          return mkSingle(q, A, ['Área do círculo = π × r²', `r² = ${rad} × ${rad} = ${rad*rad}`, `3,14 × ${rad*rad} = ${fmt(A)} cm²`], null, geoQ(q, geoFigure('circle',{r:rad},{ask:'area'})), geoFigure('circle',{r:rad},{hl:'area'})); }
        if(r<0.55){ const h=2*randInt(2,6), B=randInt(8,20), b=randInt(3,B-2); const A=(B+b)*h/2; const q=`Um trapézio tem base maior ${B} cm, base menor ${b} cm e altura ${h} cm. Qual é a área (em cm²)?`;
          return mkSingle(q, A, ['Área do trapézio = (base maior + base menor) × altura ÷ 2', `${B} + ${b} = ${B+b}`, `${B+b} × ${h} = ${(B+b)*h}`, `${(B+b)*h} ÷ 2 = ${A} cm²`], null, geoQ(q, geoFigure('trapezoid',{B,b,h},{ask:'area'})), geoFigure('trapezoid',{B,b,h},{hl:'area'})); }
        if(r<0.8){ const D=2*randInt(3,8), d=randInt(2,D-1); const q=`Um losango tem diagonal maior ${D} cm e diagonal menor ${d} cm. Qual é a área (em cm²)?`;
          return mkSingle(q, D*d/2, ['Área do losango = D × d ÷ 2', `${D} × ${d} = ${D*d}`, `${D*d} ÷ 2 = ${D*d/2} cm²`], null, geoQ(q, geoFigure('rhombus',{D,d},{ask:'area'})), geoFigure('rhombus',{D,d},{hl:'area'})); }
        // descobrir a medida que falta
        const b=randInt(3,12), a=randInt(2,10); const q=`Um retângulo tem área de ${a*b} cm² e base de ${b} cm. Qual é a altura (em cm)?`;
        return mkSingle(q, a, ['Área = base × altura, então altura = área ÷ base', `${a*b} ÷ ${b} = ${a} cm`], null, geoQ(q, geoFigure('rect',{b,h:a},{q:{h:'?'}})), geoFigure('rect',{b,h:a},{hl:'area', grid:true}));
      },
    }
  },
  {
    id:'estatistica', name:'Média, moda e mediana', sym:'x̄',
    learn:`<p>Quando temos uma lista de números (notas, idades, gols...), às vezes queremos <b>um número só</b> que resuma todos eles. Existem três jeitos comuns:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Média:</b> some todos os números e divida pela quantidade deles. É o "se fosse tudo igual, quanto daria pra cada um".</li>
      <li><b>Mediana:</b> coloque os números em ordem e pegue o do <b>meio</b>. Se a quantidade for par, faça a média dos dois do meio.</li>
      <li><b>Moda:</b> o número que <b>mais se repete</b> na lista.</li>
    </ol>
    <p><b>Dica:</b> a mediana não se deixa levar por um valor muito diferente dos outros. Em 2, 3, 3, 4, 100 a média é 22,4, mas a mediana é 3.</p>`,
    examples:[
      {title:'Exemplo 1 (média)', text:'Média de 6, 8 e 10 = 8', steps:['Some: 6 + 8 + 10 = 24', 'Divida pela quantidade (3): 24 ÷ 3 = 8']},
      {title:'Exemplo 2 (mediana)', text:'Mediana de 7, 2, 9, 4, 5 = 5', steps:['Coloque em ordem: 2, 4, <b>5</b>, 7, 9', 'São 5 números, então o do meio é o 3º: 5']},
      {title:'Exemplo 3 (moda)', text:'Moda de 3, 5, 3, 8, 5, 3 = 3', steps:['Conte quantas vezes cada um aparece: 3 → 3 vezes · 5 → 2 vezes · 8 → 1 vez', 'O que mais aparece é o 3.']},
    ],
    gen:{
      facil:()=>{ const n=3, avg=randInt(3,20); const d=randInt(1,Math.min(5,avg-1)); const nums=shuffle([avg-d, avg, avg+d]); const sum=avg*n;
        return mkSingle(`Qual é a média de ${nums.join(', ')}?`, avg, [`Some: ${nums.join(' + ')} = ${sum}`, `Divida pela quantidade (${n}): ${sum} ÷ ${n} = ${avg}`]); },
      medio:()=>{
        if(Math.random()<0.5){ const nums=Array.from({length:5},()=>randInt(1,30)); const sorted=[...nums].sort((a,b)=>a-b);
          return mkSingle(`Qual é a mediana de ${nums.join(', ')}?`, sorted[2], [`Coloque em ordem: ${sorted.map((v,i)=>i===2?`<b>${v}</b>`:v).join(', ')}`, `São 5 números: o do meio é o 3º, ou seja, ${sorted[2]}.`]); }
        const mode=randInt(1,12); const others=shuffle([...Array(12).keys()].map(i=>i+1).filter(v=>v!==mode)).slice(0,3);
        const nums=shuffle([mode,mode,mode,others[0],others[0],others[1],others[2]]);
        return mkSingle(`Qual é a moda de ${nums.join(', ')}?`, mode, [`Conte as repetições: ${mode} aparece 3 vezes, ${others[0]} aparece 2 vezes e os outros só 1.`, `O que mais aparece é o ${mode}.`]);
      },
      dificil:()=>{
        if(Math.random()<0.5){ const target=randInt(6,8); const known=[randInt(4,10),randInt(4,10),randInt(4,10)]; const need=4*target-known.reduce((a,b)=>a+b,0);
          if(need<0 || need>10) return SUBJECTS.find(x=>x.id==='estatistica').gen.dificil();
          return mkSingle(`Nas 3 primeiras provas, Ana tirou ${known.join(', ')}. Que nota ela precisa tirar na 4ª prova pra ficar com média ${target}?`, need,
            [`Pra ter média ${target} em 4 provas, a soma das notas precisa ser ${target} × 4 = ${4*target}.`, `Ela já tem ${known.join(' + ')} = ${4*target-need}.`, `Falta: ${4*target} − ${4*target-need} = ${need}.`]); }
        const nums=Array.from({length:6},()=>randInt(1,20)); const sorted=[...nums].sort((a,b)=>a-b); const med=(sorted[2]+sorted[3])/2;
        return mkSingle(`Qual é a mediana de ${nums.join(', ')}?`, med, [`Coloque em ordem: ${sorted.map((v,i)=>(i===2||i===3)?`<b>${v}</b>`:v).join(', ')}`, `São 6 números (quantidade par): faça a média dos dois do meio.`, `(${sorted[2]} + ${sorted[3]}) ÷ 2 = ${fmt(med)}`]);
      },
    }
  },
  {
    id:'dinheiro', name:'Dinheiro e troco', sym:'R$',
    learn:`<p>Fazer compras, conferir o troco, dividir a conta da pizza... o dinheiro é a matemática que a gente mais usa no dia a dia! No Brasil, a moeda é o <b>real (R$)</b>, e cada real tem <b>100 centavos</b>. Por isso R$ 2,50 é "2 reais e 50 centavos".</p>
    <p><b>Truque pra não errar:</b> pense tudo em <b>centavos</b>, faça a conta com números inteiros e só no fim volte pra reais.</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Total da compra:</b> some os preços (ou multiplique preço × quantidade).</li>
      <li><b>Troco:</b> valor pago − total da compra.</li>
      <li><b>Dividir a conta:</b> total ÷ número de pessoas.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (somar preços)', text:'R$ 3,50 + R$ 2,75 = R$ 6,25', steps:['Em centavos: 350 + 275 = 625', '625 centavos = R$ 6,25']},
      {title:'Exemplo 2 (troco)', text:'Pagou R$ 20 numa compra de R$ 13,40 → troco R$ 6,60', steps:['Em centavos: 2000 − 1340 = 660', 'Troco: R$ 6,60']},
      {title:'Exemplo 3 (várias unidades)', text:'3 cadernos de R$ 7,90 = R$ 23,70', steps:['Em centavos: 3 × 790 = 2370', 'Total: R$ 23,70']},
    ],
    gen:{
      facil:()=>{ const itens=shuffle(['um lápis','uma borracha','um suco','um pão','uma bala','um picolé']).slice(0,2);
        const a=randInt(2,20)*25, b=randInt(2,20)*25;
        return mkSingle(`${cap(itens[0])} custa ${brl(a)} e ${itens[1]} custa ${brl(b)}. Quanto custam os dois juntos (em reais)?`, (a+b)/100, [`Em centavos: ${a} + ${b} = ${a+b}`, `${a+b} centavos = ${brl(a+b)}`]); },
      medio:()=>{ const nota=pick([1000,2000,5000]); const preco=randInt(Math.round(nota*0.3/10), Math.round(nota*0.95/10))*10;
        return mkSingle(`Você comprou algo de ${brl(preco)} e pagou com uma nota de ${brl(nota)}. Qual é o troco (em reais)?`, (nota-preco)/100, ['Troco = valor pago − preço', `Em centavos: ${nota} − ${preco} = ${nota-preco}`, `Troco: ${brl(nota-preco)}`]); },
      dificil:()=>{
        if(Math.random()<0.5){ const q=randInt(2,5), preco=randInt(15,120)*10, total=q*preco; const pago=Math.ceil((total+1)/5000)*5000;
          return mkSingle(`Você comprou ${q} cadernos de ${brl(preco)} cada e pagou com ${brl(pago)}. Qual é o troco (em reais)?`, (pago-total)/100, [`Total: ${q} × ${brl(preco)} = ${brl(total)}`, `Troco: ${brl(pago)} − ${brl(total)} = ${brl(pago-total)}`]); }
        const n=randInt(2,6), each=randInt(8,40)*50, total=n*each;
        return mkSingle(`A conta da pizzaria deu ${brl(total)} e vai ser dividida igualmente entre ${n} amigos. Quanto cada um paga (em reais)?`, each/100, ['Cada um paga = total ÷ número de pessoas', `Em centavos: ${total} ÷ ${n} = ${each}`, `Cada um paga ${brl(each)}`]);
      },
    }
  },
];

/* ano escolar em que cada assunto costuma aparecer, segundo a BNCC (referência aproximada) */
const BNCC_ANO = {adicao:'1º ao 5º ano', subtracao:'1º ao 5º ano', multiplicacao:'2º ao 5º ano', divisao:'3º ao 5º ano',
  fracoes:'4º ao 6º ano', decimais:'4º ao 6º ano', porcentagem:'5º ao 7º ano', regra3:'7º ano', potenciacao:'6º ao 9º ano',
  expressoes:'6º ano', eq1:'7º ano', eq2:'9º ano', sistemas:'8º ano', func1grau:'9º ano e 1º do EM', mmcmdc:'6º ano',
  geometria:'5º ao 7º ano', estatistica:'6º ao 8º ano', dinheiro:'2º ao 5º ano'};

function fmtSigned(n){ return n>=0? `+ ${n}` : `− ${Math.abs(n)}`; }

function mkSingle(question, answer, steps, columns, qVisual, solvedVisual){ return {type:'single', question, answer, steps, columns, qVisual, solvedVisual}; }
function mkFrac(question, num, den, steps, visual){ return {type:'single', question, answer: num/den, displayAnswer: fracStr(num,den), steps, visual}; }
function mkPair(question, a, b, steps, qVisual, solvedVisual){ return {type:'pair', question, answer:[a,b], steps, qVisual, solvedVisual}; }
function mkXY(question, x, y, steps, qVisual, solvedVisual){ return {type:'xy', question, answer:{x,y}, steps, qVisual, solvedVisual}; }

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

/* =========================================================
   Progresso, histórico e erros — tudo separado por conta
   ========================================================= */
function currentUserId(){ return (currentUser && currentUser.id) ? currentUser.id : 'anon'; }

const PROGRESS_KEY_BASE = 'mathstudy-progress-v2';
const HISTORY_KEY_BASE = 'mathstudy-history-v1';
const ERRORS_KEY_BASE = 'mathstudy-errors-v1';
const HISTORY_LIMIT = 300; // guarda só as últimas N respostas por conta
const ERRORS_LIMIT = 150;  // guarda só os últimos N erros ainda não revisados

let progressCache = null, progressCacheUid = null;
let historyCache = null, historyCacheUid = null;
let errorsCache = null, errorsCacheUid = null;

async function loadProgress(){
  const uid = currentUserId();
  if(progressCache && progressCacheUid===uid) return progressCache;
  try{
    const raw = localStorage.getItem(`${PROGRESS_KEY_BASE}:${uid}`);
    progressCache = raw ? JSON.parse(raw) : {};
  }catch(e){ progressCache = {}; }
  progressCacheUid = uid;
  return progressCache;
}
async function saveProgress(){
  try{ localStorage.setItem(`${PROGRESS_KEY_BASE}:${progressCacheUid}`, JSON.stringify(progressCache)); }catch(e){}
}

async function loadHistory(){
  const uid = currentUserId();
  if(historyCache && historyCacheUid===uid) return historyCache;
  try{
    const raw = localStorage.getItem(`${HISTORY_KEY_BASE}:${uid}`);
    historyCache = raw ? JSON.parse(raw) : [];
  }catch(e){ historyCache = []; }
  historyCacheUid = uid;
  return historyCache;
}
async function saveHistory(){
  try{ localStorage.setItem(`${HISTORY_KEY_BASE}:${historyCacheUid}`, JSON.stringify(historyCache)); }catch(e){}
}

async function loadErrors(){
  const uid = currentUserId();
  if(errorsCache && errorsCacheUid===uid) return errorsCache;
  try{
    const raw = localStorage.getItem(`${ERRORS_KEY_BASE}:${uid}`);
    errorsCache = raw ? JSON.parse(raw) : [];
  }catch(e){ errorsCache = []; }
  errorsCacheUid = uid;
  return errorsCache;
}
async function saveErrors(){
  try{ localStorage.setItem(`${ERRORS_KEY_BASE}:${errorsCacheUid}`, JSON.stringify(errorsCache)); }catch(e){}
}

/* retrato leve e serializável da questão, pra poder mostrar de novo depois (histórico / revisão de erros) */
function snapshotExercise(ex){
  try{ return JSON.parse(JSON.stringify(ex)); }catch(e){ return null; }
}

async function recordAnswer(subjectId, correct, extra){
  extra = extra || {};
  const p = await loadProgress();
  if(!p[subjectId]) p[subjectId] = {attempted:0, correct:0};
  p[subjectId].attempted++;
  if(correct) p[subjectId].correct++;
  p[subjectId].last = Date.now(); // usado pela revisão espaçada
  // últimas 10 respostas (ok + se era difícil), usadas no nível de domínio
  p[subjectId].recent = (p[subjectId].recent || []).concat([{ok:!!correct, h:extra.difficulty==='dificil'}]).slice(-10);
  await saveProgress();
  gameOnAnswer(subjectId, correct, extra.difficulty);

  const subj = SUBJECTS.find(s=>s.id===subjectId);
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    ts: Date.now(),
    subjectId,
    subjectName: subj ? subj.name : subjectId,
    difficulty: extra.difficulty || null,
    correct,
    ex: extra.ex ? snapshotExercise(extra.ex) : null,
  };

  const hist = await loadHistory();
  hist.unshift(entry);
  if(hist.length > HISTORY_LIMIT) hist.length = HISTORY_LIMIT;
  await saveHistory();

  if(!correct && entry.ex){
    const errs = await loadErrors();
    errs.unshift(entry);
    if(errs.length > ERRORS_LIMIT) errs.length = ERRORS_LIMIT;
    await saveErrors();
  }
}

async function resolveError(errorId){
  const errs = await loadErrors();
  const idx = errs.findIndex(e=>e.id===errorId);
  if(idx>=0){ errs.splice(idx,1); await saveErrors(); }
}

/* =========================================================
   Configurações — também separadas por conta
   ========================================================= */
const SETTINGS_KEY_BASE = 'mathstudy-settings-v1';
const DEFAULT_SETTINGS = { theme:'dark', sound:true, vibration:true, dailyGoal:10, schoolLevel:null, tts:true, textScale:'normal' };
/* assuntos "esperados" pra cada nível escolar — cumulativo (médio inclui tudo, fund2 inclui fund1).
   Usado só pra pré-selecionar os assuntos no Treino personalizado, nunca esconde nada: o
   usuário sempre pode marcar/desmarcar qualquer assunto depois. */
const LEVEL_SUBJECTS = {
  fund1: ['adicao','subtracao','multiplicacao','divisao','dinheiro'],
  fund2: ['adicao','subtracao','multiplicacao','divisao','fracoes','decimais','potenciacao','expressoes','regra3','porcentagem','eq1','mmcmdc','geometria','estatistica','dinheiro'],
  medio: SUBJECTS.map(s=>s.id),
};
let settingsCache = null, settingsCacheUid = null;

async function loadSettings(){
  const uid = currentUserId();
  if(settingsCache && settingsCacheUid===uid) return settingsCache;
  try{
    const raw = localStorage.getItem(`${SETTINGS_KEY_BASE}:${uid}`);
    settingsCache = raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : Object.assign({}, DEFAULT_SETTINGS);
  }catch(e){ settingsCache = Object.assign({}, DEFAULT_SETTINGS); }
  settingsCacheUid = uid;
  return settingsCache;
}
async function saveSettings(){
  try{ localStorage.setItem(`${SETTINGS_KEY_BASE}:${settingsCacheUid}`, JSON.stringify(settingsCache)); }catch(e){}
}
/* leitura síncrona pra usar dentro de handlers de clique (nas sessões de exercício), sem precisar
   de await ali; settings já foram carregadas no boot/login, então o cache está pronto. */
function currentSettingsSync(){
  return (settingsCache && settingsCacheUid===currentUserId()) ? settingsCache : DEFAULT_SETTINGS;
}

function applyTheme(theme){
  try{ document.documentElement.classList.toggle('theme-light', theme==='light'); }catch(e){}
}

/* toca um bipe curtinho (certo = agudo, errado = grave) usando Web Audio, sem precisar de arquivo de áudio */
let _audioCtx = null;
function playFeedbackSound(correct){
  if(!currentSettingsSync().sound) return;
  if(correct){ playTones([784,1175], 0.07, 'triangle', 0.12); return; }
  try{
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = correct ? 880 : 220;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }catch(e){}
}
function playFeedbackVibration(correct){
  if(!currentSettingsSync().vibration) return;
  try{ navigator.vibrate && navigator.vibrate(correct ? 40 : [40,60,40]); }catch(e){}
}
/* chamada única pra disparar som + vibração juntos, sempre que uma resposta é corrigida */
function giveAnswerFeedback(correct){
  playFeedbackSound(correct);
  playFeedbackVibration(correct);
}

/* =========================================================
   Autenticação — várias contas no mesmo aparelho, cada uma com
   seu próprio progresso/histórico/erros (ver PROGRESS_KEY_BASE etc.)
   ========================================================= */
const USERS_KEY = 'mathstudy-users-v1';        // [{id, name, passHash}, ...]
const CURRENT_USER_KEY = 'mathstudy-current-user-v1'; // id da última conta usada neste aparelho
const LEGACY_AUTH_KEY = 'mathstudy-auth-v1';   // conta única de versões antigas do app
const LEGACY_PROGRESS_KEY = 'mathstudy-progress-v1';

let usersCache = null;
let currentUser = null; // {id, name} quando logado

function userIdFromName(name){ return name.trim().toLowerCase(); }

/* ---------- senha forte: regras, lista de senhas famosas e medidor ---------- */
const COMMON_PASSWORDS = new Set(['123456','1234567','12345678','123456789','1234567890','654321','111111','000000','123123','112233','121212','123321',
  '102030','101010','159753','147258','741852','963852','abc123','abcdef','abcd1234','abc12345','a12345','12345a','123456a','1234abcd','1q2w3e','1q2w3e4r',
  'q1w2e3r4','a1b2c3','qwerty','qwerty1','qwerty123','asdfgh','zxcvbn','senha','senha1','senha12','senha123','senha1234','password','password1','iloveyou',
  'teamo','teamo123','amor123','admin','admin123','mudar123','minhasenha','matematica','matematica1','matematica123','aaaaaa','abc','x1y2z3']);
const COMMON_WORDS = ['senha','password','brasil','flamengo','corinthians','palmeiras','vasco','santos','gremio','cruzeiro','botafogo','fluminense',
  'saopaulo','internacional','amor','teamo','iloveyou','jesus','deus','familia','futebol','estrela','princesa','pokemon','naruto','goku','minecraft',
  'roblox','freefire','matematica','escola','admin','qwerty','abc','abcd','mudar','minhasenha','neymar','messi'];
function isSequence(p){
  const seqs = ['01234567890','abcdefghijklmnopqrstuvwxyz','qwertyuiopasdfghjklzxcvbnm'];
  return p.length>=4 && seqs.some(q=> q.includes(p) || q.split('').reverse().join('').includes(p));
}
/* devolve o primeiro motivo pelo qual a senha é fraca (ou null se estiver ok) */
function passwordProblem(pass, name){
  const p = String(pass||'');
  const low = p.toLowerCase();
  const plain = low.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(p.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  const letters = plain.replace(/[^a-z]/g,''), digits = plain.replace(/[^0-9]/g,'');
  if(COMMON_PASSWORDS.has(plain) || /^(.)\1+$/.test(plain) || isSequence(plain) || (COMMON_WORDS.includes(letters) && digits.length<=4))
    return 'Essa senha é muito fácil de adivinhar — é uma das mais usadas no mundo. Invente outra!';
  const first = String(name||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/)[0] || '';
  if((first.length>=4 && plain.includes(first)) || (first.length===3 && plain.startsWith(first))) return 'Não use seu nome na senha — é a primeira coisa que alguém tentaria.';
  if(!letters.length || !digits.length) return 'Misture letras e números (exemplo: gato7lua ou Pizza42azul).';
  return null;
}
function passwordStrength(pass, name){
  if(!pass) return {score:0, label:'', cls:''};
  if(passwordProblem(pass, name)) return {score:1, label:'Fraca', cls:'weak'};
  let sc = 2;
  if(pass.length>=10) sc++;
  if(/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) sc++;
  return sc>=4 ? {score:4, label:'Muito forte 💪', cls:'vstrong'} : sc===3 ? {score:3, label:'Forte', cls:'strong'} : {score:2, label:'Média', cls:'mid'};
}
/* medidor ao vivo embaixo do campo de senha */
function attachStrengthMeter(input, getName){
  const box = h(`<div class="pw-meter"><div class="pw-bar"><i></i><i></i><i></i><i></i></div><div class="pw-txt">Use 6+ caracteres misturando letras e números.</div></div>`);
  const upd = ()=>{
    const st = passwordStrength(input.value, getName ? getName() : '');
    box.className = 'pw-meter ' + st.cls;
    box.querySelectorAll('.pw-bar i').forEach((b,i)=> b.classList.toggle('on', i < st.score));
    const prob = input.value ? passwordProblem(input.value, getName ? getName() : '') : null;
    box.querySelector('.pw-txt').textContent = !input.value ? 'Use 6+ caracteres misturando letras e números.' : prob ? `Fraca: ${prob}` : `Senha ${st.label.toLowerCase()} ✓`;
  };
  input.addEventListener('input', upd);
  box.refresh = upd;
  return box;
}

async function hashPassword(pw){
  try{
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){
    let hh=0; for(let i=0;i<pw.length;i++){ hh = (hh*31 + pw.charCodeAt(i))|0; }
    return 'fb'+hh;
  }
}

async function loadUsers(){
  if(usersCache !== null) return usersCache;
  try{
    const raw = localStorage.getItem(USERS_KEY);
    usersCache = raw ? JSON.parse(raw) : [];
  }catch(e){ usersCache = []; }
  // migração de versões antigas: uma única conta guardada sem lista.
  if(usersCache.length===0){
    try{
      const oldRaw = localStorage.getItem(LEGACY_AUTH_KEY);
      if(oldRaw){
        const old = JSON.parse(oldRaw);
        if(old && old.name && old.passHash){
          const migrated = {id: userIdFromName(old.name), name: old.name, passHash: old.passHash};
          usersCache = [migrated];
          await saveUsers(usersCache);
          const oldProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
          if(oldProgress) localStorage.setItem(`${PROGRESS_KEY_BASE}:${migrated.id}`, oldProgress);
        }
      }
    }catch(e){}
  }
  return usersCache;
}
async function saveUsers(list){
  usersCache = list;
  try{ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }catch(e){}
}
async function setCurrentUserId(id){
  try{ localStorage.setItem(CURRENT_USER_KEY, id); }catch(e){}
}
async function getSavedCurrentUserId(){
  try{ return localStorage.getItem(CURRENT_USER_KEY); }catch(e){ return null; }
}
function doLogout(){
  // fecha tour/janelas abertas da conta que está saindo (o tour continua pendente pra ela)
  if(typeof _tourClose==='function') _tourClose(true);
  document.querySelectorAll('.gm-modal-bg, .tour-root, .gm-toast').forEach(n=>n.remove());
  if(typeof _toastQueue!=='undefined') _toastQueue.length = 0;
  currentUser = null;
  settingsCache = null; settingsCacheUid = null;
  applyTheme('dark'); applyTextScale('normal');
  try{ localStorage.removeItem(CURRENT_USER_KEY); }catch(e){}
  boot();
}

/* =========================================================
   Gerenciamento de conta — usado na tela de Configurações
   ========================================================= */
/* troca o nome da conta logada; se o novo nome gerar um id diferente (quase sempre gera,
   já que o id vem do nome), migra progresso/histórico/erros/configurações pro novo id
   sem perder nada. */
async function renameCurrentUser(newName){
  newName = (newName||'').trim();
  if(!newName) return {ok:false, error:'Digite um nome.'};
  const users = await loadUsers();
  const oldId = currentUser.id;
  const newId = userIdFromName(newName);
  if(newId !== oldId && users.some(u=>u.id===newId)){
    return {ok:false, error:'Já existe uma conta com esse nome neste aparelho.'};
  }
  const idx = users.findIndex(u=>u.id===oldId);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  users[idx] = Object.assign({}, users[idx], {id:newId, name:newName});
  await saveUsers(users);
  if(newId !== oldId){
    [PROGRESS_KEY_BASE, HISTORY_KEY_BASE, ERRORS_KEY_BASE, SETTINGS_KEY_BASE, GAME_KEY_BASE].forEach(base=>{
      const oldKey = `${base}:${oldId}`, newKey = `${base}:${newId}`;
      const val = localStorage.getItem(oldKey);
      if(val!==null){ localStorage.setItem(newKey, val); localStorage.removeItem(oldKey); }
    });
    if(progressCacheUid===oldId) progressCacheUid = newId;
    if(historyCacheUid===oldId) historyCacheUid = newId;
    if(errorsCacheUid===oldId) errorsCacheUid = newId;
    if(settingsCacheUid===oldId) settingsCacheUid = newId;
  }
  currentUser = {id:newId, name:newName};
  await setCurrentUserId(newId);
  return {ok:true};
}

async function changeCurrentUserPassword(currentPass, newPass){
  const users = await loadUsers();
  const idx = users.findIndex(u=>u.id===currentUser.id);
  if(idx<0) return {ok:false, error:'Conta não encontrada.'};
  const currentHash = await hashPassword(currentPass);
  if(users[idx].passHash !== currentHash) return {ok:false, error:'Senha atual incorreta.'};
  const weak = passwordProblem(newPass, currentUser.name);
  if(weak) return {ok:false, error:weak};
  if(newPass === currentPass) return {ok:false, error:'A nova senha precisa ser diferente da atual.'};
  users[idx] = Object.assign({}, users[idx], {passHash: await hashPassword(newPass)});
  await saveUsers(users);
  return {ok:true};
}

/* baixa um .json com progresso, histórico, erros e configurações da conta logada */
async function exportProgressData(){
  saveBackupInfo({last: Date.now()});
  const [progress, history, errors, settings] = await Promise.all([loadProgress(), loadHistory(), loadErrors(), loadSettings()]);
  const payload = {
    exportedAt: new Date().toISOString(),
    account: currentUser ? currentUser.name : null,
    progress, history, errors, settings,
    game: loadGame(),
    notes: exportNotes(),
  };
  const safeName = (currentUser && currentUser.name ? currentUser.name : 'progresso').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const filename = `matematica-show-${safeName}-${new Date().toISOString().slice(0,10)}.json`;
  const jsonStr = JSON.stringify(payload, null, 2);

  // 1) compartilhamento nativo — no celular (principalmente iPhone/PWA instalado), é o que
  //    funciona de forma mais confiável, porque o download por link muitas vezes é bloqueado.
  try{
    if(navigator.share && navigator.canShare && typeof File !== 'undefined'){
      const file = new File([jsonStr], filename, {type:'application/json'});
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file], title:'Progresso — Matemática Show'});
        return true;
      }
    }
  }catch(e){
    // usuário cancelou o compartilhamento — não é um erro real, encerra aqui sem cair nos outros métodos
    if(e && e.name === 'AbortError') return true;
  }

  // 2) baixa como arquivo via link temporário (funciona bem no computador e em boa parte do celular)
  try{
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // espera um pouco antes de limpar: revogar a URL cedo demais pode cancelar o download
    setTimeout(()=>{
      try{ document.body.removeChild(a); }catch(e){}
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  }catch(e){}

  // 3) último recurso: abre o JSON numa aba nova, pro usuário salvar manualmente
  try{
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank');
    setTimeout(()=> URL.revokeObjectURL(url), 60000);
    return !!opened;
  }catch(e){ return false; }
}

/* lê um .json exportado pelo próprio app e restaura progresso/histórico/erros/configurações
   pra conta logada agora — substitui o que já existia (é uma restauração, não uma mescla). */
async function importProgressData(file){
  let data;
  try{
    const text = await file.text();
    data = JSON.parse(text);
  }catch(e){
    return {ok:false, error:'Não foi possível ler esse arquivo. Confira se é um .json exportado pelo Matemática Show.'};
  }
  if(!data || typeof data !== 'object' || (!data.progress && !data.history && !data.errors && !data.settings)){
    return {ok:false, error:'Esse arquivo não parece ser um backup do Matemática Show.'};
  }
  const uid = currentUserId();
  if(data.progress && typeof data.progress === 'object'){
    progressCache = data.progress; progressCacheUid = uid; await saveProgress();
  }
  if(Array.isArray(data.history)){
    historyCache = data.history; historyCacheUid = uid; await saveHistory();
  }
  if(Array.isArray(data.errors)){
    errorsCache = data.errors; errorsCacheUid = uid; await saveErrors();
  }
  if(data.settings && typeof data.settings === 'object'){
    settingsCache = Object.assign({}, DEFAULT_SETTINGS, data.settings); settingsCacheUid = uid; await saveSettings();
    applyTheme(settingsCache.theme); applyTextScale(settingsCache.textScale);
  }
  if(data.notes) importNotes(data.notes);
  if(data.game && typeof data.game === 'object'){
    gameCache = null; gameCacheUid = null;
    try{ localStorage.setItem(`${GAME_KEY_BASE}:${uid}`, JSON.stringify(data.game)); }catch(e){}
  }
  return {ok:true};
}

/* apaga progresso/histórico/erros da conta logada — a conta em si (nome/senha) continua existindo */
async function resetCurrentUserProgress(){
  const uid = currentUserId();
  [PROGRESS_KEY_BASE, HISTORY_KEY_BASE, ERRORS_KEY_BASE, GAME_KEY_BASE].forEach(base=>{
    try{ localStorage.removeItem(`${base}:${uid}`); }catch(e){}
  });
  gameCache = null;
  progressCache = {}; progressCacheUid = uid;
  historyCache = []; historyCacheUid = uid;
  errorsCache = []; errorsCacheUid = uid;
  await saveProgress(); await saveHistory(); await saveErrors();
}

/* =========================================================
   Tela de entrada — "Quem vai jogar hoje?"
   Cartões das contas do aparelho (inicial, nível, ofensiva), senha só
   depois de escolher a conta, dica de senha no cadastro,
   "Esqueci minha senha" e espera após várias tentativas erradas.
   ========================================================= */
const LOGIN_MAX_TRIES = 5, LOGIN_WAIT_MS = 30000;
const _loginFails = {}; // {userId: {n, until}}
function avatarHTML(u, cls){
  const ini = u && u.name ? escHTML(u.name.trim().charAt(0).toUpperCase()) : '?';
  return `<span class="${cls||'av'}">${ini}</span>`;
}
/* lê o XP/ofensiva de uma conta sem precisar estar logado nela */
function peekGame(uid){
  try{
    const g = JSON.parse(localStorage.getItem(`${GAME_KEY_BASE}:${uid}`) || '{}');
    return {level: levelInfo(g.xp||0).level, streak: streakFromData(g)};
  }catch(e){ return {level:1, streak:0}; }
}
function authStageBg(){
  const syms = ['+','−','×','÷','π','√','%','=','x²','½','∑','∞'];
  return `<div class="auth-stage" aria-hidden="true"><span class="beam l"></span><span class="beam r"></span>${
    syms.map((s,i)=>`<span class="fsym" style="left:${(i*83)%100}%;animation-delay:${-(i*1.7)}s;animation-duration:${12+(i%5)*3}s;font-size:${18+(i%4)*8}px">${s}</span>`).join('')
  }</div>`;
}

function authScreen(mode, users){
  users = users || [];
  const wrap = h(`<div class="auth-wrap"></div>`);
  wrap.appendChild(h(authStageBg()));
  let selected = null;      // conta escolhida no modo login
  let typedName = false;    // login digitando o nome (conta não listada)

  const card = h(`<div class="auth-card"></div>`);
  wrap.appendChild(card);

  function header(bubble, mood){
    return `<div class="auth-hero">${mascotSVG(mood||'happy', 86)}<div class="auth-bubble">${bubble}</div></div>
      <div class="auth-brandline"><img src="${LOGO_URI}" alt=""><span>Matemática Show</span></div>`;
  }
  function showError(msg){
    const box = card.querySelector('.authErrorBox');
    if(box) box.innerHTML = `<div class="auth-error">${msg}</div>`;
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
  }
  function wirePassToggles(){
    card.querySelectorAll('.pass-toggle').forEach(btn=>{
      btn.onclick = ()=>{
        const input = btn.previousElementSibling;
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.textContent = showing ? '👁' : '🙈';
      };
    });
  }
  function wireEnter(fn){
    card.querySelectorAll('input').forEach(inp=> inp.addEventListener('keydown', e=>{ if(e.key==='Enter') fn(); }));
  }
  const passField = (cls, label, ac)=> `<div class="auth-field"><label>${label}</label><div class="pass-wrap"><input type="password" class="${cls}" placeholder="••••••" autocomplete="${ac}"><button type="button" class="pass-toggle" aria-label="Mostrar senha">👁</button></div></div>`;

  /* ---- escolher conta ---- */
  function paintPicker(){
    card.innerHTML = header('Oi! Quem vai jogar hoje? 🎬') + `<h2 class="auth-title">Escolha sua conta</h2><div class="acc-grid"></div>
      <button type="button" class="auth-link other-acc">Minha conta não está aqui</button>
      <div class="auth-divider"><span>ou</span></div>
      <button type="button" class="show-btn ghost new-acc">＋ Criar nova conta</button>`;
    const grid = card.querySelector('.acc-grid');
    users.forEach(u=>{
      const info = peekGame(u.id);
      const b = h(`<button type="button" class="acc-card">${avatarHTML(u,'acc-av')}<span class="acc-name"></span><span class="acc-meta">Nível ${info.level}${info.streak?` · 🔥 ${info.streak}`:''}</span></button>`);
      b.querySelector('.acc-name').textContent = u.name;
      b.onclick = ()=>{ selected = u; typedName = false; paintLogin(); };
      grid.appendChild(b);
    });
    card.querySelector('.other-acc').onclick = ()=>{ selected = null; typedName = true; paintLogin(); };
    card.querySelector('.new-acc').onclick = ()=> paintRegister();
  }

  /* ---- digitar senha ---- */
  function paintLogin(){
    const who = selected;
    card.innerHTML = header(who ? `Que bom te ver de novo, <b>${escHTML(who.name.split(' ')[0])}</b>! 👋` : 'Digite seu nome e sua senha pra entrar.') + `
      ${who ? `<div class="login-who">${avatarHTML(who,'who-av')}<div class="who-name"></div></div>` : `<div class="auth-field"><label>Nome</label><input type="text" class="authName" placeholder="Seu nome" autocomplete="username"></div>`}
      <div class="authErrorBox"></div>
      ${passField('authPass','Senha','current-password')}
      <button type="button" class="show-btn auth-go">Entrar ▶</button>
      <div class="auth-row"><button type="button" class="auth-link forgot">Esqueci minha senha</button>${users.length ? `<button type="button" class="auth-link back">‹ Trocar de conta</button>` : `<button type="button" class="auth-link new-acc">Criar conta</button>`}</div>`;
    if(who) card.querySelector('.who-name').textContent = who.name;
    wirePassToggles();
    const back = card.querySelector('.back'); if(back) back.onclick = paintPicker;
    const na = card.querySelector('.new-acc'); if(na) na.onclick = paintRegister;
    card.querySelector('.forgot').onclick = forgot;
    card.querySelector('.auth-go').onclick = doLogin;
    wireEnter(doLogin);
    setTimeout(()=>{ const f = card.querySelector(who ? '.authPass' : '.authName'); if(f) f.focus(); }, 60);
  }
  function findAccount(){
    if(selected) return selected;
    const nm = (card.querySelector('.authName')||{}).value || '';
    return users.find(u=>u.id===userIdFromName(nm)) || null;
  }
  function forgot(){
    const acc = findAccount();
    const hint = acc && acc.hint;
    showConfirm({
      icon:'🔑', title: hint ? 'Sua dica de senha' : 'Esqueceu a senha?',
      message: hint
        ? `💡 "${hint}"`
        : (acc ? 'Essa conta não tem dica de senha. ' : '') + 'A senha fica guardada só neste aparelho, então não dá pra recuperar pela internet. Tente lembrar com calma, ou peça ajuda a quem criou a conta. Se não tiver jeito, crie uma conta nova.',
      ok:'Tentar de novo', cancel: hint ? 'Fechar' : 'Criar conta nova',
    }).then(ok=>{ if(!ok && !hint) paintRegister(); else { const f = card.querySelector('.authPass'); if(f) f.focus(); } });
  }
  async function doLogin(){
    const name = selected ? selected.name : (card.querySelector('.authName').value||'').trim();
    const pass = card.querySelector('.authPass').value;
    if(!name){ showError('Digite seu nome.'); return; }
    if(!pass){ showError('Digite sua senha.'); return; }
    const list = await loadUsers();
    const id = userIdFromName(name);
    const f = _loginFails[id];
    if(f && f.until > Date.now()){ showError(`Muitas tentativas. Espere ${Math.ceil((f.until-Date.now())/1000)} segundos e tente de novo.`); return; }
    const acc = list.find(u=>u.id===id);
    const btn = card.querySelector('.auth-go'); btn.disabled = true; btn.textContent = 'Entrando…';
    const passHash = await hashPassword(pass);
    if(!acc || acc.passHash!==passHash){
      btn.disabled = false; btn.textContent = 'Entrar ▶';
      const rec = _loginFails[id] = _loginFails[id] || {n:0, until:0};
      rec.n++;
      if(rec.n >= LOGIN_MAX_TRIES){ rec.n = 0; rec.until = Date.now() + LOGIN_WAIT_MS; showError('Senha errada muitas vezes. Espere 30 segundos. 💡 Toque em "Esqueci minha senha" pra ver sua dica.'); }
      else showError(acc ? `Senha incorreta. Tente de novo${rec.n>=2 ? ' — ou veja sua dica em "Esqueci minha senha"' : ''}.` : 'Não achei nenhuma conta com esse nome neste aparelho.');
      const pf = card.querySelector('.authPass'); pf.value = ''; pf.focus();
      return;
    }
    delete _loginFails[id];
    currentUser = {id: acc.id, name: acc.name};
    await setCurrentUserId(acc.id);
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
    const st = gameStreakNow();
    queueToast('👋', 'Bem-vindo de volta!', `${acc.name}${st?` · 🔥 ${st} dia${st===1?'':'s'}`:''}`);
    if(passwordProblem(pass, acc.name)){
      setTimeout(()=> showConfirm({icon:'🔐', title:'Sua senha está fraca',
        message:'Ela é fácil de adivinhar. Que tal trocar por uma mais forte? Leva 1 minutinho.',
        ok:'Trocar agora', cancel:'Depois'}).then(ok=>{ if(ok) go('settings'); }), 900);
    }
  }

  /* ---- criar conta ---- */
  function paintRegister(){
    card.innerHTML = header(users.length ? 'Uma conta nova? Bora! 😄' : 'Bem-vindo ao <b>Matemática Show</b>! Vamos criar sua conta? 🎤', 'joy') + `
      <h2 class="auth-title">Criar conta</h2>
      <div class="authErrorBox"></div>
      <div class="auth-field"><label>Seu nome</label><input type="text" class="authName" placeholder="Como quer ser chamado?" autocomplete="username" maxlength="30"></div>
      ${passField('authPass','Crie uma senha','new-password')}
      ${passField('authPass2','Repita a senha','new-password')}
      <div class="auth-field"><label>Dica da senha <small>(opcional — ajuda se você esquecer)</small></label><input type="text" class="authHint" placeholder="Ex.: meu bicho favorito + número da camisa" maxlength="60"></div>
      <button type="button" class="show-btn auth-go">Criar conta e começar ▶</button>
      <p class="auth-note">🔒 Tudo fica salvo só neste aparelho. Cada conta tem seu próprio progresso.</p>
      ${users.length ? `<div class="auth-row center"><button type="button" class="auth-link back">‹ Já tenho conta</button></div>` : ''}`;
    const passInput = card.querySelector('.authPass');
    passInput.closest('.auth-field').appendChild(attachStrengthMeter(passInput, ()=> card.querySelector('.authName').value));
    card.querySelector('.authName').addEventListener('input', ()=>{ const m = card.querySelector('.pw-meter'); if(m && m.refresh) m.refresh(); });
    wirePassToggles();
    const back = card.querySelector('.back'); if(back) back.onclick = paintPicker;
    card.querySelector('.auth-go').onclick = doRegister;
    wireEnter(doRegister);
  }
  async function doRegister(){
    const name = card.querySelector('.authName').value.trim().replace(/\s+/g,' ');
    const pass = card.querySelector('.authPass').value;
    const pass2 = card.querySelector('.authPass2').value;
    const hint = card.querySelector('.authHint').value.trim();
    if(!name){ showError('Digite seu nome.'); return; }
    if(name.length < 2){ showError('O nome precisa ter pelo menos 2 letras.'); return; }
    if(!pass){ showError('Crie uma senha.'); return; }
    const weak = passwordProblem(pass, name);
    if(weak){ showError(weak); return; }
    if(pass!==pass2){ showError('As senhas não são iguais. Digite de novo.'); return; }
    if(hint && hint.toLowerCase().includes(pass.toLowerCase())){ showError('A dica não pode conter a própria senha! 😅'); return; }
    const id = userIdFromName(name);
    const list = await loadUsers();
    if(list.some(u=>u.id===id)){ showError('Já existe uma conta com esse nome neste aparelho. Escolha outro nome ou entre na conta.'); return; }
    const btn = card.querySelector('.auth-go'); btn.disabled = true; btn.textContent = 'Criando…';
    const passHash = await hashPassword(pass);
    const newUser = {id, name, passHash};
    if(hint) newUser.hint = hint;
    list.push(newUser);
    await saveUsers(list);
    currentUser = {id, name};
    await setCurrentUserId(id);
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
  }

  if(mode==='register' || !users.length) paintRegister();
  else paintPicker();
  return wrap;
}


function renderAuth(mode, users){
  app.innerHTML='';
  app.appendChild(authScreen(mode, users));
}

async function boot(){
  app.innerHTML = '<div class="content" style="padding-top:60px;text-align:center;color:var(--ink-soft)">Carregando…</div>';
  const users = await loadUsers();
  const savedId = await getSavedCurrentUserId();
  const saved = savedId ? users.find(u=>u.id===savedId) : null;
  if(saved){
    currentUser = {id: saved.id, name: saved.name};
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
  } else if(users.length){
    renderAuth('login', users);
  } else {
    renderAuth('register', []);
  }
}

/* =========================================================
   Estado & roteamento
   ========================================================= */
const state = {
  screen: 'home',
  subjectId: null,
  difficulty: null,
  session: null, // {index, total, correct, wrong, current, checked, wasCorrect}
  calc: {cur:'0', prev:'', op:null, waiting:false, sciMode:false, angleMode:'DEG'},
};

function go(screen, extra={}){
  Object.assign(state, {screen}, extra);
  pushHistoryState();
  render();
  window.scrollTo(0,0);
}

/* volta ao estado inicial (tela Início) já registrando essa entrada no histórico do navegador,
   pra que "voltar" a partir de qualquer tela funcione mesmo vindo direto do login. */
function enterApp(){
  state.screen = 'home';
  // entrada "raiz" embaixo da tela Início: quando o botão voltar chega nela,
  // em vez de fechar o app direto, perguntamos se a pessoa quer mesmo sair
  try{ history.replaceState({__root:true}, '', location.pathname + location.search); }catch(e){}
  pushHistoryState();
  render();
}

/* aviso "quer sair do aplicativo?" (botão voltar do celular na tela Início) */
let _exitAsking = false;
function askExitApp(){
  if(_exitAsking) return;
  _exitAsking = true;
  const streak = gameStreakNow();
  showConfirm({
    icon:'👋', title:'Quer sair do app?',
    message: streak>0 ? `Seu progresso fica salvo. Volte amanhã pra manter sua ofensiva de ${streak} dia${streak===1?'':'s'}! 🔥` : 'Seu progresso fica salvo neste aparelho. Volte logo pra continuar o show! 🎬',
    ok:'Sair', cancel:'Ficar',
  }).then(ok=>{
    _exitAsking = false;
    if(!ok){ pushHistoryState(); render(); return; }
    // tenta sair de verdade (volta pra página anterior / fecha o app instalado);
    // se o navegador não deixar, mostra a tela de despedida
    app.innerHTML = '';
    const bye = h(`<div class="content lesson-end"><div class="le-mascot">${mascotSVG('joy',120)}</div><h2 class="le-title">Até logo! 👋</h2><p class="le-sub">Seu progresso está salvo. Pode fechar o app.</p><div class="lesson-footer static"><button class="show-btn">Voltar pro app</button></div></div>`);
    bye.querySelector('button').onclick = ()=>{ pushHistoryState(); render(); };
    app.appendChild(bye);
    try{ history.back(); }catch(e){}
    setTimeout(()=>{ try{ window.close(); }catch(e){} }, 250);
  });
}

/* sessão em andamento? (usado no aviso ao fechar/recarregar a aba) */
function sessionInProgress(){
  const s = state.session;
  if(!s) return false;
  if(state.screen==='lesson') return !s.finished && !s.failed && (s.asked>1 || s.checked);
  if(['exerciseSession','challengeSession','personalizedSession','reviewErrorsSession'].includes(state.screen))
    return s.index < s.total && (s.index>0 || s.checked);
  return false;
}
window.addEventListener('beforeunload', (e)=>{
  if(currentUser && sessionInProgress()){ e.preventDefault(); e.returnValue = ''; }
});

/* =========================================================
   Navegação com URL real (History API): cada tela vira uma entrada
   no histórico do navegador, com hash próprio (#tela/param) e o
   estado completo salvo junto — assim "voltar"/"avançar" no navegador
   restauram a tela exatamente como estava (inclusive sessão em
   andamento, calculadora, etc.), sem depender só da URL.
   ========================================================= */
function hashForState(s){
  let hash = '#' + s.screen;
  if(s.subjectId) hash += '/' + s.subjectId;
  if(s.difficulty) hash += '/' + s.difficulty;
  return hash;
}
function cloneState(s){
  try{ return JSON.parse(JSON.stringify(s)); }catch(e){ return null; }
}
function pushHistoryState(){
  try{ history.pushState(cloneState(state), '', hashForState(state)); }catch(e){}
}
function replaceHistoryState(){
  try{ history.replaceState(cloneState(state), '', hashForState(state)); }catch(e){}
}
window.addEventListener('popstate', (e)=>{
  if(!currentUser) return; // ainda na tela de login/cadastro — nada pra restaurar
  if(e.state && e.state.__root){ askExitApp(); return; }
  if(e.state){
    Object.assign(state, e.state);
  } else {
    state.screen = 'home';
  }
  render();
  window.scrollTo(0,0);
});

const app = document.getElementById('app');
function render(){
  app.innerHTML = '';
  const el = SCREENS[state.screen] ? SCREENS[state.screen]() : SCREENS.home();
  app.appendChild(el);
}
function h(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

function topbar(title, showBack, onBack){
  const bar = h(`<div class="topbar"></div>`);
  if(showBack){
    const b = h(`<button class="back-btn" aria-label="Voltar">‹</button>`);
    b.onclick = onBack || (()=>go('home'));
    bar.appendChild(b);
    const t = h(`<div class="screen-title"></div>`); t.textContent = title;
    bar.appendChild(t);
  } else {
    const brand = h(`<div class="brand"><span class="mark"><img src="${LOGO_URI}" alt="Matemática Show"></span><h1>Matemática Show</h1></div>`);
    bar.appendChild(brand);
  }
  return bar;
}

/* ---------------- barra de navegação inferior ---------------- */
const BOTTOM_NAV_ITEMS = [
  {screen:'home', icon:'⌂', label:'Início', group:['home','achievements','lightning','quizSetup','calculator','help','duel','certificates','certificate','notebook','notePage']},
  {screen:'path', icon:'★', label:'Trilha', group:['path']},
  {screen:'content', icon:'∑', label:'Aprender', group:['content','subjectDetail','geoLab']},
  {screen:'exercisesSubjects', icon:'✎', label:'Exercícios', group:['exercisesSubjects','exerciseDifficulty','exerciseSession']},
  {screen:'progress', icon:'↑', label:'Progresso', group:['progress','report']},
];
function bottomNav(){
  const bar = h(`<div class="bottom-nav"></div>`);
  BOTTOM_NAV_ITEMS.forEach(item=>{
    const active = item.group.includes(state.screen);
    const btn = h(`<button class="bn-item ${active?'active':''}"><span class="bn-icon">${item.icon}</span><span class="bn-label">${item.label}</span></button>`);
    btn.onclick = ()=>{ if(state.screen !== item.screen) go(item.screen); };
    bar.appendChild(btn);
  });
  return bar;
}

/* ---------------- HOME ---------------- */
/* tela inicial minimalista: poucos blocos, tudo o que existia continua acessível
   (status → toque abre detalhes; missões e meta ficam no cartão "Hoje";
   todas as ferramentas ficam em "Tudo") */
const HOME_TOOLS = [
  {ico:'🎤', label:'Quiz do Show', screen:'quizSetup'},
  {ico:'⚡', label:'Relâmpago', screen:'lightning'},
  {ico:'🎯', label:'Treino personalizado', screen:'personalizedSetup'},
  {ico:'✏️', label:'Caderno', screen:'notebook'},
  {ico:'🏆', label:'Desafios', screen:'challengeDifficulty'},
  {ico:'✖️', label:'Tabuada', screen:'tabuada'},
  {ico:'❓', label:'Resolver questão', screen:'solve'},
  {ico:'🧮', label:'Calculadora', screen:'calculator'},
  {ico:'⚔️', label:'Duelo a dois', screen:'duel'},
  {ico:'🔺', label:'Laboratório de Geometria', screen:'geoLab'},
  {ico:'🏅', label:'Conquistas', screen:'achievements'},
  {ico:'📜', label:'Certificados', screen:'certificates'},
  {ico:'📝', label:'Relatório semanal', screen:'report'},
];
function showAllTools(){
  const g = loadGame(), qb = g.quizBest || {};
  const best = {quizSetup: Math.max(0, ...Object.values(qb)), lightning: g.boltBest};
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="home-sheet" role="dialog" aria-label="Todas as formas de praticar"><div class="hs-grab"></div><div class="hs-title">Tudo</div><div class="hs-grid"></div></div>`;
  const grid = bg.querySelector('.hs-grid');
  HOME_TOOLS.forEach(t=>{
    const b = h(`<button type="button" class="hs-item"><span class="hs-ico">${t.ico}</span><span class="hs-l">${t.label}</span>${best[t.screen]?`<span class="hs-best">🏆 ${best[t.screen].toLocaleString('pt-BR')}</span>`:''}</button>`);
    b.onclick = ()=>{ bg.remove(); go(t.screen, t.screen==='geoLab' ? {geoBack:'home'} : {}); };
    grid.appendChild(b);
  });
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}
function homeScreen(){
  const wrap = document.createElement('div');
  wrap.className = 'home-min';
  const bar = topbar();
  const initial = (currentUser && currentUser.name) ? currentUser.name.trim().charAt(0).toUpperCase() : '?';
  const profileBtn = h(`<button class="auth-logout profile-btn-avatar" title="Perfil" aria-label="Abrir meu perfil">${escHTML(initial)}</button>`);
  profileBtn.onclick = ()=> go('profile');
  const helpBtn = h(`<button class="auth-logout tut-help-btn" title="Como usar" aria-label="Como usar o app">?</button>`);
  helpBtn.onclick = ()=> go('help');
  bar.appendChild(helpBtn);
  bar.appendChild(profileBtn);
  wrap.appendChild(bar);

  const g = loadGame(), lv = levelInfo(g.xp);
  const firstName = currentUser ? currentUser.name.split(' ')[0] : '';
  const streakNow = gameStreakNow();
  const sub = streakNow>0 && !playedToday()
    ? `Jogue hoje pra manter sua ofensiva de ${streakNow} dia${streakNow===1?'':'s'} 🔥`
    : streakNow>0 ? 'Ofensiva garantida hoje. Bora continuar? ✨' : 'Bora aprender algo novo hoje?';
  const hello = h(`<div class="home-hello"><h2></h2><p></p></div>`);
  hello.querySelector('h2').textContent = firstName ? `Olá, ${firstName}` : 'Olá!';
  hello.querySelector('p').textContent = sub;
  wrap.appendChild(hello);
  showStreakNote();

  // status: nível + ofensiva, moedas, vidas, medalhas (cada um abre seus detalhes)
  const hearts = heartsNow();
  const stats = h(`<div class="home-stats">
    <button type="button" class="hs-level" aria-label="Nível ${lv.level}: ver conquistas">
      <span class="hl-top"><b>Nível ${lv.level}</b><span>${escHTML(lv.title)}</span><small>${lv.into}/${lv.need} XP</small></span>
      <span class="hl-bar"><i style="width:${lv.pct}%"></i></span>
    </button>
    <div class="hs-chips">
      <button type="button" class="hs-chip fire ${streakNow?'':'off'} ${streakNow && !playedToday()?'warn':''}" aria-label="Ofensiva: ${streakNow} dias">🔥 <b>${streakNow}</b></button>
      <button type="button" class="hs-chip gem" aria-label="Moedas: ${gemsNow()}">🪙 <b>${gemsNow()}</b></button>
      <button type="button" class="hs-chip heart" aria-label="Vidas: ${hearts}">❤️ <b>${hearts}</b>${hearts<HEARTS_MAX?` <small>${fmtMinSec(nextHeartIn())}</small>`:''}</button>
      <button type="button" class="hs-chip medal" aria-label="Medalhas: ${Object.keys(g.ach).length}">🏅 <b>${Object.keys(g.ach).length}</b></button>
    </div>
  </div>`);
  stats.querySelector('.hs-level').onclick = ()=> go('achievements');
  stats.querySelector('.fire').onclick = ()=> showStreakPanel();
  stats.querySelector('.gem').onclick = ()=> go('achievements');
  stats.querySelector('.heart').onclick = ()=>{ if(heartsNow()<HEARTS_MAX) showNoHearts(); else showFloat('Vidas cheias ❤️'); };
  stats.querySelector('.medal').onclick = ()=> go('achievements');
  wrap.appendChild(stats);

  // continuar a trilha
  const all = allPathNodes(), cur = pathCurrentIndex();
  const n = all[Math.min(cur, all.length-1)], finished = cur>=all.length;
  const cont = h(`<button type="button" class="home-continue" style="${unitStyle(n.unit)}">
    <span class="hc-txt"><span class="hc-k">${finished ? 'TEMPORADA COMPLETA' : `EPISÓDIO ${n.unit+1} · ${n.idx+1}/${PATH_NODES.length}`}</span>
    <span class="hc-t">${finished ? 'Você zerou a trilha! 👑' : escHTML(n.subject.name)}</span>
    <span class="hc-s">${finished ? 'Continue praticando pra ganhar XP' : n.label}</span></span>
    <span class="hc-play" aria-hidden="true">▶</span>
  </button>`);
  cont.setAttribute('aria-label', finished ? 'Abrir a trilha' : `${cur===0?'Começar':'Continuar'} a trilha: ${n.subject.name}, ${n.label}`);
  cont.onclick = ()=> go('path');
  wrap.appendChild(cont);

  // avisos (só aparecem quando existem)
  const alerts = h(`<div class="home-alerts"></div>`);
  wrap.appendChild(alerts);
  const alertRow = (ico, title, subtxt, fn)=>{
    const r = h(`<button type="button" class="home-alert"><span class="ha-ico">${ico}</span><span class="ha-t"><b></b><small></small></span><span class="ha-chev">›</span></button>`);
    r.querySelector('b').textContent = title; r.querySelector('small').textContent = subtxt;
    r.onclick = fn; alerts.appendChild(r);
  };
  loadErrors().then(errs=>{
    if(errs.length) alertRow('🔁', 'Revisar meus erros', errs.length===1 ? '1 questão pra refazer' : `${errs.length} questões pra refazer`, ()=>startReviewErrors());
    return loadProgress();
  }).then(progress=>{
    const due = dueReviewSubjects(progress);
    if(due.length) alertRow('🧠', 'Revisão do dia', due.slice(0,2).map(s=>s.name).join(', ') + (due.length>2?` e mais ${due.length-2}`:''), ()=>startSpacedReview());
  });

  // hoje: meta diária + missões (recolhidas)
  const today = h(`<div class="home-today">
    <div class="ht-head"><span class="ht-t">Hoje</span><span class="ht-n goal-num">0/0</span></div>
    <div class="bar-track"><div class="bar-fill goal-bar" style="width:0%"></div></div>
    <div class="ht-foot"><button type="button" class="link-btn ht-miss"></button><button type="button" class="link-btn ht-goal">Mudar meta</button></div>
    <div class="ht-goal-row diff-row" style="display:none; margin-top:10px; flex-wrap:wrap;"></div>
    <div class="ht-missions" style="display:none"></div>
  </div>`);
  const goalRow = today.querySelector('.ht-goal-row');
  [5,10,15,20,30].forEach(v=>{
    const chip = h(`<button type="button" class="diff-chip" style="flex:1 1 auto; padding:8px 12px; font-size:12.5px;">${v}</button>`);
    chip.onclick = async ()=>{ const st = await loadSettings(); st.dailyGoal = v; await saveSettings(); goalRow.style.display = 'none'; refreshGoal(); };
    goalRow.appendChild(chip);
  });
  today.querySelector('.ht-goal').onclick = ()=>{ goalRow.style.display = goalRow.style.display==='none' ? 'flex' : 'none'; };
  const missBox = today.querySelector('.ht-missions'), missBtn = today.querySelector('.ht-miss');
  const ms = missionState(), doneCount = ms.filter(m=>m.claimed).length, claimable = ms.filter(m=>m.done && !m.claimed).length;
  missBtn.innerHTML = `📜 Missões ${doneCount}/${ms.length}${claimable?` <span class="ht-badge">${claimable} prêmio${claimable===1?'':'s'}!</span>`:''}`;
  missBox.appendChild(missionsCard());
  const openMissions = open=>{ missBox.style.display = open ? '' : 'none'; missBtn.classList.toggle('open', open); };
  missBtn.onclick = ()=> openMissions(missBox.style.display==='none');
  if(claimable) openMissions(true);
  function refreshGoal(){
    Promise.all([loadHistory(), loadSettings()]).then(([hist, settings])=>{
      const todayStr = new Date().toDateString();
      const doneToday = hist.filter(e=> new Date(e.ts).toDateString()===todayStr).length;
      const goal = settings.dailyGoal || 10;
      today.querySelector('.goal-num').textContent = doneToday>=goal ? `🎉 ${doneToday}/${goal} questões` : `${doneToday}/${goal} questões`;
      today.querySelector('.goal-bar').style.width = Math.max(0, Math.min(100, Math.round(doneToday/goal*100)))+'%';
      goalRow.querySelectorAll('.diff-chip').forEach(ch=> ch.classList.toggle('active', parseInt(ch.textContent)===goal));
    });
  }
  refreshGoal();
  wrap.appendChild(today);

  // praticar: 4 atalhos + "Tudo" (todas as ferramentas)
  const quick = h(`<div class="home-quick"><div class="hq-head"><span>Praticar</span><button type="button" class="link-btn hq-all">Tudo ›</button></div><div class="hq-row"></div></div>`);
  HOME_TOOLS.slice(0,4).forEach(t=>{
    const b = h(`<button type="button" class="hq-item"><span class="hq-ico">${t.ico}</span><span class="hq-l">${t.label.replace(' personalizado','').replace(' do Show','')}</span></button>`);
    b.onclick = ()=> go(t.screen);
    quick.querySelector('.hq-row').appendChild(b);
  });
  quick.querySelector('.hq-all').onclick = showAllTools;
  wrap.appendChild(quick);

  if(tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && wrap.isConnected) maybeAskBackup(); }, 1500);
  // primeiro acesso: tour guiado pelo Pi
  if(!tutorialDone()) setTimeout(()=>{ if(state.screen==='home' && !tutorialDone() && wrap.isConnected) startTour(); }, 700);
  return wrap;
}

/* ---------- nível de domínio por assunto ----------
   Olha as últimas 10 respostas (não o histórico inteiro), pra refletir o que a pessoa sabe hoje. */
const MASTERY_LEVELS = [
  {lvl:0, ico:'⚪', name:'Não iniciado', next:'Responda 5 questões pra descobrir seu nível.'},
  {lvl:1, ico:'🌱', name:'Aprendendo',   next:'Chegue a 60% de acerto nas últimas questões.'},
  {lvl:2, ico:'📘', name:'Praticando',   next:'Chegue a 80% de acerto nas últimas questões.'},
  {lvl:3, ico:'⭐', name:'Proficiente',  next:'Acerte 9 das últimas 10, com pelo menos 2 no difícil.'},
  {lvl:4, ico:'👑', name:'Dominado',     next:'Você domina este assunto! Revise de vez em quando pra não esquecer.'},
];
function masteryOf(d){
  if(!d || !d.attempted) return MASTERY_LEVELS[0];
  const rec = d.recent || [];
  const n = rec.length >= 5 ? rec.length : d.attempted;
  const ok = rec.length >= 5 ? rec.filter(r=>r.ok).length : d.correct;
  if(n < 5) return MASTERY_LEVELS[1];
  const acc = ok/n;
  const hardOk = rec.filter(r=>r.ok && r.h).length;
  if(rec.length>=10 && acc>=0.9 && hardOk>=2) return MASTERY_LEVELS[4];
  if(acc>=0.8) return MASTERY_LEVELS[3];
  if(acc>=0.6) return MASTERY_LEVELS[2];
  return MASTERY_LEVELS[1];
}
function masterySync(subjectId){ return masteryOf(progressCache && progressCacheUid===currentUserId() ? progressCache[subjectId] : null); }
function masteryChip(m){ return `<span class="mst-chip mst-${m.lvl}" title="${m.name}">${m.ico} ${m.name}</span>`; }

/* ---------- ouvir a questão (leitura em voz alta) ---------- */
function speechText(ex){
  let t = String((ex && (ex.question || ex.text)) || '').replace(/<[^>]+>/g,' ');
  t = t.replace(/(\d+)\/(\d+)/g, '$1 sobre $2')
       .replace(/×/g,' vezes ').replace(/÷/g,' dividido por ').replace(/−/g,' menos ').replace(/\+/g,' mais ')
       .replace(/²/g,' ao quadrado').replace(/³/g,' ao cubo').replace(/√/g,' raiz quadrada de ')
       .replace(/=\s*\?/g,' é igual a quanto?').replace(/=/g,' igual a ').replace(/R\$\s*/g,'').replace(/\s+/g,' ');
  return t.trim();
}
function speak(text){
  try{
    if(!('speechSynthesis' in window) || !text) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v=>/pt[-_]BR/i.test(v.lang));
    if(v) u.voice = v;
    speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}
function addSpeakButton(card, ex){
  if(!('speechSynthesis' in window) || currentSettingsSync().tts===false) return;
  const text = speechText(ex);
  if(!text) return;
  const b = h(`<button type="button" class="tts-btn" aria-label="Ouvir a questão" title="Ouvir a questão">🔊</button>`);
  b.onclick = e=>{ e.stopPropagation(); speak(text); };
  questionTools(card).appendChild(b);
}
/* tamanho do texto das questões/explicações: normal, grande, enorme */
const TEXT_SCALES = {normal:1, grande:1.15, enorme:1.3};
function applyTextScale(v){ document.documentElement.style.setProperty('--fs', TEXT_SCALES[v] || 1); }

/* =========================================================
   CADERNO DIGITAL — escrever à mão como numa mesa digitalizadora
   - caneta com pressão (canetas stylus) ou pela velocidade (dedo/mouse)
   - "só caneta": quando uma caneta é detectada, o dedo passa a só mover a página
     (rejeição da palma da mão, como nas mesas digitalizadoras)
   - dois dedos: arrastar e dar zoom
   - ferramentas: caneta, marca-texto, borracha, linha, retângulo, círculo e texto
   - fundos: liso, pautado, quadriculado, pontilhado e plano cartesiano
   Cada página é guardada como traços (vetores), não como imagem: ocupa pouco
   espaço, fica nítida em qualquer zoom e permite desfazer/refazer.
   ========================================================= */
const NOTE_W = 1000, NOTE_H = 1414; // proporção de uma folha A4
const NOTES_KEY_BASE = 'mathstudy-notes-v1';   // índice das páginas (sem os traços)
const NOTE_KEY_BASE = 'mathstudy-note-v1';     // traços de cada página
const NOTE_COLORS = ['#1B1B2F','#E0405A','#2F6BFF','#12A150','#E09A00','#9B3FE0'];
const NOTE_HL_COLORS = ['#FFE14D','#7DF0A0','#7FD4FF','#FF9EC4'];
const NOTE_SIZES = {pen:[2.5,5,9], hl:[18,28,40], eraser:[12,24,44], shape:[2.5,5,9], text:[30,42,60]};
const NOTE_BGS = [['grid','Quadriculado'],['lines','Pautado'],['dots','Pontilhado'],['cartesian','Plano cartesiano'],['plain','Liso']];
const NOTE_TOOLS = [['pen','✒️','Caneta'],['hl','🖍️','Marca-texto'],['eraser','🧽','Borracha'],['line','📏','Linha reta'],['rect','▭','Retângulo'],['circle','◯','Círculo'],['text','T','Texto']];

function notesIndex(){ try{ return JSON.parse(localStorage.getItem(`${NOTES_KEY_BASE}:${currentUserId()}`)||'[]'); }catch(e){ return []; } }
function saveNotesIndex(list){ localStorage.setItem(`${NOTES_KEY_BASE}:${currentUserId()}`, JSON.stringify(list)); }
function loadNotePage(id){
  const meta = notesIndex().find(n=>n.id===id);
  if(!meta) return null;
  let strokes = [];
  try{ strokes = JSON.parse(localStorage.getItem(`${NOTE_KEY_BASE}:${currentUserId()}:${id}`)||'[]'); }catch(e){}
  return Object.assign({}, meta, {strokes});
}
/* salva traços + miniatura; avisa se o armazenamento do aparelho encheu */
function saveNotePage(page){
  try{
    localStorage.setItem(`${NOTE_KEY_BASE}:${currentUserId()}:${page.id}`, JSON.stringify(page.strokes));
    const list = notesIndex();
    const meta = {id:page.id, title:page.title, subjectId:page.subjectId||null, bg:page.bg, updated:Date.now(), created:page.created||Date.now(), thumb:noteThumb(page)};
    const i = list.findIndex(n=>n.id===page.id);
    if(i>=0) list[i] = meta; else list.unshift(meta);
    saveNotesIndex(list);
    return true;
  }catch(e){
    queueToast('⚠️', 'Não deu pra salvar', 'O armazenamento do aparelho está cheio. Apague páginas antigas.');
    return false;
  }
}
function deleteNotePage(id){
  try{ localStorage.removeItem(`${NOTE_KEY_BASE}:${currentUserId()}:${id}`); }catch(e){}
  saveNotesIndex(notesIndex().filter(n=>n.id!==id));
}
function newNotePage(opts){
  opts = opts || {};
  const subj = opts.subjectId ? SUBJECTS.find(s=>s.id===opts.subjectId) : null;
  const page = {id:`n${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`, title: opts.title || (subj ? `Anotações · ${subj.name}` : 'Nova página'),
    subjectId: opts.subjectId || null, bg: opts.bg || 'grid', strokes: opts.strokes || [], created: Date.now()};
  saveNotePage(page);
  return page;
}
/* tudo das anotações, pro backup */
function exportNotes(){
  const index = notesIndex();
  const pages = {};
  index.forEach(n=>{ try{ pages[n.id] = JSON.parse(localStorage.getItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`)||'[]'); }catch(e){} });
  return {index, pages};
}
function importNotes(data){
  if(!data || !Array.isArray(data.index)) return;
  notesIndex().forEach(n=>{ try{ localStorage.removeItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`); }catch(e){} });
  try{
    saveNotesIndex(data.index);
    data.index.forEach(n=>{ localStorage.setItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`, JSON.stringify((data.pages||{})[n.id]||[])); });
  }catch(e){}
}

/* ---------- desenho ---------- */
function drawNoteBg(ctx, bg){
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, NOTE_W, NOTE_H);
  ctx.lineWidth = 1;
  if(bg==='grid' || bg==='cartesian'){
    ctx.strokeStyle = bg==='cartesian' ? '#D7DEEC' : '#DCE3F0';
    ctx.beginPath();
    for(let x=0; x<=NOTE_W; x+=50){ ctx.moveTo(x,0); ctx.lineTo(x,NOTE_H); }
    for(let y=7; y<=NOTE_H; y+=50){ ctx.moveTo(0,y); ctx.lineTo(NOTE_W,y); }
    ctx.stroke();
  } else if(bg==='lines'){
    ctx.strokeStyle = '#C9D6EE';
    ctx.beginPath();
    for(let y=120; y<NOTE_H; y+=56){ ctx.moveTo(0,y); ctx.lineTo(NOTE_W,y); }
    ctx.stroke();
    ctx.strokeStyle = '#F2A3AE'; ctx.beginPath(); ctx.moveTo(90,0); ctx.lineTo(90,NOTE_H); ctx.stroke();
  } else if(bg==='dots'){
    ctx.fillStyle = '#B9C3D6';
    for(let x=25; x<NOTE_W; x+=50) for(let y=32; y<NOTE_H; y+=50){ ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill(); }
  }
  if(bg==='cartesian'){
    const cx = 500, cy = 707;
    ctx.strokeStyle = '#5A6680'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(20,cy); ctx.lineTo(NOTE_W-20,cy); ctx.moveTo(cx,20); ctx.lineTo(cx,NOTE_H-20); ctx.stroke();
    ctx.fillStyle = '#5A6680';
    ctx.beginPath(); ctx.moveTo(NOTE_W-20,cy); ctx.lineTo(NOTE_W-36,cy-8); ctx.lineTo(NOTE_W-36,cy+8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx,20); ctx.lineTo(cx-8,36); ctx.lineTo(cx+8,36); ctx.fill();
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.fillText('x', NOTE_W-34, cy-16); ctx.fillText('y', cx+14, 40);
    ctx.font = '16px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for(let i=-9; i<=9; i++){ if(!i) continue; ctx.fillText(String(i), cx+i*50, cy+6); ctx.fillRect(cx+i*50-1, cy-5, 2, 10); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for(let i=-13; i<=13; i++){ if(!i) continue; ctx.fillText(String(-i), cx-8, cy+i*50); ctx.fillRect(cx-5, cy+i*50-1, 10, 2); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('0', cx-18, cy+16);
  }
}
function drawNoteStroke(ctx, s){
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
  const p = s.p;
  if(s.t==='pen' || s.t==='hl'){
    if(s.t==='hl'){ ctx.globalAlpha = 0.38; ctx.lineCap = 'butt'; }
    const n = p.length/3;
    if(n===1){ // um toque só: um pontinho
      ctx.beginPath(); ctx.arc(p[0], p[1], s.w*(s.t==='hl'?0.5:0.35+0.6*p[2]/100), 0, Math.PI*2); ctx.fill();
    } else if(s.t==='hl'){
      ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(p[0],p[1]);
      for(let i=1;i<n;i++) ctx.lineTo(p[i*3], p[i*3+1]);
      ctx.stroke();
    } else {
      // largura muda com a pressão: desenha segmento por segmento, suavizando pelos pontos médios
      let px = p[0], py = p[1];
      for(let i=1;i<n;i++){
        const x0 = p[(i-1)*3], y0 = p[(i-1)*3+1], x1 = p[i*3], y1 = p[i*3+1];
        const mx = i<n-1 ? (x1+p[(i+1)*3])/2 : x1, my = i<n-1 ? (y1+p[(i+1)*3+1])/2 : y1;
        const pr = ((p[(i-1)*3+2]+p[i*3+2])/2)/100;
        ctx.lineWidth = s.w*(0.35+0.9*pr);
        ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(x1,y1,mx,my); ctx.stroke();
        px = mx; py = my;
      }
    }
  } else if(s.t==='line'){
    ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[2],p[3]); ctx.stroke();
  } else if(s.t==='rect'){
    ctx.lineWidth = s.w; ctx.strokeRect(Math.min(p[0],p[2]), Math.min(p[1],p[3]), Math.abs(p[2]-p[0]), Math.abs(p[3]-p[1]));
  } else if(s.t==='circle'){
    ctx.lineWidth = s.w; ctx.beginPath(); ctx.arc(p[0], p[1], Math.hypot(p[2]-p[0], p[3]-p[1]), 0, Math.PI*2); ctx.stroke();
  } else if(s.t==='text'){
    ctx.font = `600 ${s.w}px Inter, sans-serif`; ctx.textBaseline = 'top';
    String(s.txt).split('\n').forEach((ln,i)=> ctx.fillText(ln, p[0], p[1]+i*s.w*1.25));
  }
  ctx.restore();
}
/* borracha: o traço encosta no ponto (x,y) com raio r? */
function noteStrokeHit(s, x, y, r){
  const p = s.p;
  const segDist = (ax,ay,bx,by)=>{ const dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy; let t = L ? ((x-ax)*dx+(y-ay)*dy)/L : 0; t = Math.max(0,Math.min(1,t)); return Math.hypot(x-(ax+t*dx), y-(ay+t*dy)); };
  const pad = r + s.w/2;
  if(s.t==='pen' || s.t==='hl'){
    const n = p.length/3;
    if(n===1) return Math.hypot(x-p[0], y-p[1]) < pad;
    for(let i=1;i<n;i++) if(segDist(p[(i-1)*3],p[(i-1)*3+1],p[i*3],p[i*3+1]) < pad) return true;
    return false;
  }
  if(s.t==='line') return segDist(p[0],p[1],p[2],p[3]) < pad;
  if(s.t==='rect'){ const [a,b,c,d] = p; return [[a,b,c,b],[c,b,c,d],[c,d,a,d],[a,d,a,b]].some(q=>segDist(...q) < pad); }
  if(s.t==='circle') return Math.abs(Math.hypot(x-p[0],y-p[1]) - Math.hypot(p[2]-p[0],p[3]-p[1])) < pad;
  if(s.t==='text'){ const lines = String(s.txt).split('\n'); const w = Math.max(...lines.map(l=>l.length))*s.w*0.6, hh = lines.length*s.w*1.25; return x>p[0]-r && x<p[0]+w+r && y>p[1]-r && y<p[1]+hh+r; }
  return false;
}
function renderNotePage(ctx, page){ drawNoteBg(ctx, page.bg); page.strokes.forEach(s=>drawNoteStroke(ctx, s)); }
function noteThumb(page){
  try{
    const c = document.createElement('canvas'); c.width = 150; c.height = Math.round(150*NOTE_H/NOTE_W);
    const x = c.getContext('2d'); x.scale(150/NOTE_W, 150/NOTE_W); renderNotePage(x, page);
    return c.toDataURL('image/jpeg', 0.6);
  }catch(e){ return ''; }
}

/* caixinha pra digitar texto, com teclas de símbolos de matemática */
const MATH_KEYS = ['²','³','√','π','×','÷','−','±','≠','≤','≥','≈','½','¼','°','∞','Δ','∑','α','β','θ','→'];
function askMathText(initial){
  return new Promise(resolve=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg sheet';
    bg.innerHTML = `<div class="gm-modal nb-textbox"><h2 style="font-size:20px">Escrever texto</h2>
      <textarea rows="3" placeholder="Ex.: x² + 2x = 15"></textarea>
      <div class="nb-keys">${MATH_KEYS.map(k=>`<button type="button" class="nb-key">${k}</button>`).join('')}</div>
      <button type="button" class="nb-ok">Colocar na página</button>
      <button type="button" class="nb-cancel" style="margin-top:8px;background:rgba(255,255,255,.1);color:#fff">Cancelar</button></div>`;
    const ta = bg.querySelector('textarea'); ta.value = initial || '';
    bg.querySelectorAll('.nb-key').forEach(k=> k.onclick = ()=>{
      const a = ta.selectionStart, b = ta.selectionEnd;
      ta.value = ta.value.slice(0,a) + k.textContent + ta.value.slice(b);
      ta.focus(); ta.selectionStart = ta.selectionEnd = a + k.textContent.length;
    });
    const close = v=>{ bg.remove(); resolve(v); };
    bg.querySelector('.nb-ok').onclick = ()=> close(ta.value.trim());
    bg.querySelector('.nb-cancel').onclick = ()=> close('');
    bg.addEventListener('click', e=>{ if(e.target===bg) close(''); });
    document.body.appendChild(bg);
    setTimeout(()=>ta.focus(), 50);
  });
}

/* ---------- a "mesa digitalizadora": liga o canvas aos toques/caneta ----------
   host: elemento que o canvas vai preencher · page: {bg, strokes} · onChange: chamado a cada mudança */
function createBoard(host, page, onChange){
  const canvas = document.createElement('canvas');
  canvas.className = 'nb-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const cache = document.createElement('canvas'), cctx = cache.getContext('2d');
  const st = {tool:'pen', color:NOTE_COLORS[0], hlColor:NOTE_HL_COLORS[0], size:1, penOnly:false, zoom:1, ox:0, oy:0};
  let cssW = 0, cssH = 0, dpr = 1, fit = 1;
  let cur = null, erasing = null, pinch = null, pan = null, raf = 0;
  const undo = [], redo = [];
  const pointers = new Map();

  function scale(){ return fit*st.zoom; }
  function toPage(cx, cy){ const r = canvas.getBoundingClientRect(); return [(cx-r.left-st.ox)/scale(), (cy-r.top-st.oy)/scale()]; }
  function clampView(){
    const pw = NOTE_W*scale(), ph = NOTE_H*scale();
    st.ox = pw <= cssW ? (cssW-pw)/2 : Math.min(0, Math.max(cssW-pw, st.ox));
    st.oy = ph <= cssH ? 0 : Math.min(0, Math.max(cssH-ph, st.oy));
  }
  function resize(){
    const r = host.getBoundingClientRect();
    if(!r.width || !r.height) return;
    cssW = r.width; cssH = r.height; dpr = Math.min(window.devicePixelRatio||1, 2.5);
    canvas.width = cache.width = Math.round(cssW*dpr); canvas.height = cache.height = Math.round(cssH*dpr);
    canvas.style.width = cssW+'px'; canvas.style.height = cssH+'px';
    fit = cssW/NOTE_W;
    clampView(); rebuild();
  }
  function applyView(c){ c.setTransform(dpr*scale(), 0, 0, dpr*scale(), dpr*st.ox, dpr*st.oy); }
  function rebuild(){
    cctx.setTransform(1,0,0,1,0,0);
    cctx.fillStyle = '#C9CEDA'; cctx.fillRect(0,0,cache.width,cache.height);
    applyView(cctx);
    cctx.save(); cctx.beginPath(); cctx.rect(0,0,NOTE_W,NOTE_H); cctx.clip();
    renderNotePage(cctx, page);
    cctx.restore();
    frame();
  }
  function frame(){
    raf = 0;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(cache, 0, 0);
    if(cur){ applyView(ctx); drawNoteStroke(ctx, cur); }
    if(erasing && erasing.at){ applyView(ctx); ctx.strokeStyle = '#8891A6'; ctx.lineWidth = 1.5/scale(); ctx.beginPath(); ctx.arc(erasing.at[0], erasing.at[1], erasing.r, 0, Math.PI*2); ctx.stroke(); }
  }
  function schedule(){ if(!raf) raf = requestAnimationFrame(frame); }
  function snapshot(){ undo.push(page.strokes.slice()); if(undo.length>60) undo.shift(); redo.length = 0; }
  function changed(){ rebuild(); onChange && onChange(); }

  function startStroke(e){
    const [x,y] = toPage(e.clientX, e.clientY);
    const key = ['line','rect','circle'].includes(st.tool) ? 'shape' : st.tool;
    const size = (NOTE_SIZES[key] || [5,5,5])[st.size];
    if(st.tool==='eraser'){
      snapshot(); erasing = {r:size, removed:false, at:[x,y]}; eraseAt(x,y); return;
    }
    if(st.tool==='text'){
      askMathText().then(txt=>{ if(!txt) return; snapshot(); page.strokes.push({t:'text', c:st.color, w:NOTE_SIZES.text[st.size], p:[Math.round(x),Math.round(y)], txt}); changed(); });
      return;
    }
    const color = st.tool==='hl' ? st.hlColor : st.color;
    if(st.tool==='pen' || st.tool==='hl') cur = {t:st.tool, c:color, w:size, p:[], _last:null};
    else cur = {t:st.tool, c:color, w:size, p:[Math.round(x),Math.round(y),Math.round(x),Math.round(y)]};
    addPoint(e);
  }
  function pressureOf(e){
    if(e.pointerType==='pen' && e.pressure>0) return e.pressure;
    // dedo/mouse não têm pressão: usa a velocidade (rápido = traço mais fino, como tinta de verdade)
    const now = e.timeStamp || performance.now();
    if(cur._last){ const dt = Math.max(1, now-cur._last.t); const v = Math.hypot(e.clientX-cur._last.x, e.clientY-cur._last.y)/dt;
      cur._pr = (cur._pr==null?0.6:cur._pr)*0.7 + Math.max(0.25, Math.min(0.85, 0.9 - v*0.35))*0.3; }
    cur._last = {x:e.clientX, y:e.clientY, t:now};
    return cur._pr==null ? 0.6 : cur._pr;
  }
  function addPoint(e){
    if(!cur) return;
    const [x,y] = toPage(e.clientX, e.clientY);
    if(cur.t==='pen' || cur.t==='hl'){
      const n = cur.p.length;
      if(n && Math.hypot(x-cur.p[n-3], y-cur.p[n-2]) < 0.8/st.zoom) return;
      cur.p.push(Math.round(x*10)/10, Math.round(y*10)/10, Math.round(pressureOf(e)*100));
    } else {
      let x2 = x, y2 = y;
      if(cur.t==='line'){ // ímã pra ficar reta na horizontal, vertical ou 45°
        const dx = x-cur.p[0], dy = y-cur.p[1], ang = Math.atan2(dy,dx), L = Math.hypot(dx,dy);
        const snap = Math.round(ang/(Math.PI/4))*(Math.PI/4);
        if(Math.abs(ang-snap) < 0.09){ x2 = cur.p[0]+Math.cos(snap)*L; y2 = cur.p[1]+Math.sin(snap)*L; }
      }
      cur.p[2] = Math.round(x2); cur.p[3] = Math.round(y2);
    }
    schedule();
  }
  function endStroke(){
    if(!cur) return;
    const s = cur; cur = null;
    delete s._last; delete s._pr;
    const tiny = s.t!=='pen' && s.t!=='hl' && Math.hypot(s.p[2]-s.p[0], s.p[3]-s.p[1]) < 4;
    if(s.p.length && !tiny){ snapshot(); page.strokes.push(s); changed(); } else frame();
  }
  function eraseAt(x,y){
    // apaga ao longo do caminho desde o último ponto (movimento rápido não "pula" traços)
    const [lx,ly] = erasing.at || [x,y];
    const steps = Math.max(1, Math.ceil(Math.hypot(x-lx, y-ly)/(erasing.r/2)));
    const pts = []; for(let i=1;i<=steps;i++) pts.push([lx+(x-lx)*i/steps, ly+(y-ly)*i/steps]);
    erasing.at = [x,y];
    const before = page.strokes.length;
    page.strokes = page.strokes.filter(s=>!pts.some(([px,py])=>noteStrokeHit(s, px, py, erasing.r)));
    if(page.strokes.length !== before){ erasing.removed = true; rebuild(); } else schedule();
  }

  function onDown(e){
    if(e.pointerType==='pen' && !st.penOnly){ st.penOnly = true; ui.onPenDetected && ui.onPenDetected(); }
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY, type:e.pointerType});
    const touches = [...pointers.values()].filter(p=>p.type==='touch');
    if(e.pointerType==='touch' && (st.penOnly || touches.length>=2)){
      // gesto: 1 dedo no modo só-caneta arrasta; 2 dedos arrastam e dão zoom
      if(cur && touches.length>=2 && cur.p.length < 30) cur = null; // era o começo de um toque de 2 dedos, não um traço
      if(touches.length>=2){
        const [a,b] = touches;
        pinch = {d:Math.hypot(a.x-b.x, a.y-b.y), zoom:st.zoom, mx:(a.x+b.x)/2, my:(a.y+b.y)/2, ox:st.ox, oy:st.oy};
        pan = null;
      } else pan = {x:e.clientX, y:e.clientY, ox:st.ox, oy:st.oy};
      frame();
      return;
    }
    if(pointers.size>1) return;
    startStroke(e);
  }
  function onMove(e){
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY, type:e.pointerType});
    if(pinch){
      const t = [...pointers.values()].filter(p=>p.type==='touch');
      if(t.length<2) return;
      const [a,b] = t, d = Math.hypot(a.x-b.x, a.y-b.y), mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
      const r = canvas.getBoundingClientRect();
      const z = Math.max(1, Math.min(5, pinch.zoom*d/pinch.d));
      // mantém fixo o ponto da página que estava entre os dedos
      const px = (pinch.mx-r.left-pinch.ox)/(fit*pinch.zoom), py = (pinch.my-r.top-pinch.oy)/(fit*pinch.zoom);
      st.zoom = z; st.ox = mx-r.left-px*fit*z; st.oy = my-r.top-py*fit*z;
      clampView(); rebuild(); ui.onZoom && ui.onZoom(st.zoom);
      return;
    }
    if(pan){ st.ox = pan.ox + e.clientX-pan.x; st.oy = pan.oy + e.clientY-pan.y; clampView(); rebuild(); return; }
    if(erasing){ const [x,y] = toPage(e.clientX, e.clientY); eraseAt(x,y); return; }
    if(cur){
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (evs.length ? evs : [e]).forEach(addPoint);
    }
  }
  function onUp(e){
    pointers.delete(e.pointerId);
    const touches = [...pointers.values()].filter(p=>p.type==='touch');
    if(pinch && touches.length<2){ pinch = null; if(touches.length===1 && st.penOnly){ const t = touches[0]; pan = {x:t.x, y:t.y, ox:st.ox, oy:st.oy}; } return; }
    if(pan && !touches.length){ pan = null; return; }
    if(erasing){ if(!erasing.removed) undo.pop(); else onChange && onChange(); erasing = null; frame(); return; }
    endStroke();
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', e=>{ pointers.delete(e.pointerId); cur = null; pinch = null; pan = null; erasing = null; frame(); });
  canvas.addEventListener('wheel', e=>{
    e.preventDefault();
    if(e.ctrlKey){ const r = canvas.getBoundingClientRect(), z0 = st.zoom, z = Math.max(1, Math.min(5, z0*(e.deltaY<0?1.1:0.9)));
      const px = (e.clientX-r.left-st.ox)/(fit*z0), py = (e.clientY-r.top-st.oy)/(fit*z0);
      st.zoom = z; st.ox = e.clientX-r.left-px*fit*z; st.oy = e.clientY-r.top-py*fit*z; ui.onZoom && ui.onZoom(z); }
    else { st.ox -= e.deltaX; st.oy -= e.deltaY; }
    clampView(); rebuild();
  }, {passive:false});
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(()=>resize()) : null;
  if(ro) ro.observe(host); else window.addEventListener('resize', resize);
  requestAnimationFrame(resize);

  const ui = {
    state: st,
    setTool(t){ st.tool = t; },
    setColor(c){ if(st.tool==='hl') st.hlColor = c; else st.color = c; },
    setSize(i){ st.size = i; },
    setPenOnly(v){ st.penOnly = v; },
    setBg(bg){ snapshot(); page.bg = bg; changed(); },
    undo(){ if(!undo.length) return false; redo.push(page.strokes); page.strokes = undo.pop(); changed(); return true; },
    redo(){ if(!redo.length) return false; undo.push(page.strokes); page.strokes = redo.pop(); changed(); return true; },
    clear(){ if(!page.strokes.length) return; snapshot(); page.strokes = []; changed(); },
    resetZoom(){ st.zoom = 1; st.ox = 0; st.oy = 0; clampView(); rebuild(); },
    canUndo(){ return undo.length>0; }, canRedo(){ return redo.length>0; },
    destroy(){ if(ro) ro.disconnect(); else window.removeEventListener('resize', resize); },
  };
  return ui;
}

/* imagem da página em alta resolução (pra salvar/compartilhar) */
function notePageBlob(page){
  return new Promise(resolve=>{
    const c = document.createElement('canvas'); c.width = NOTE_W*1.6; c.height = NOTE_H*1.6;
    const x = c.getContext('2d'); x.scale(1.6,1.6); renderNotePage(x, page);
    c.toBlob(b=>resolve(b), 'image/png');
  });
}
async function shareNotePage(page){
  const blob = await notePageBlob(page);
  if(!blob) return;
  const name = `${(page.title||'pagina').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`;
  try{
    const file = new File([blob], name, {type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:page.title}); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); }, 1500);
}

/* ---------- barra de ferramentas (usada no caderno e no rascunho) ---------- */
function boardToolbar(board, opts){
  opts = opts || {};
  const tools = opts.tools || NOTE_TOOLS.map(t=>t[0]);
  const bar = h(`<div class="nb-toolbar">
    <div class="nb-row nb-tools"></div>
    <div class="nb-row nb-style"><div class="nb-colors"></div><div class="nb-sizes"></div></div>
  </div>`);
  const toolsBox = bar.querySelector('.nb-tools'), colorsBox = bar.querySelector('.nb-colors'), sizesBox = bar.querySelector('.nb-sizes');
  function paintColors(){
    colorsBox.innerHTML = '';
    const isHl = board.state.tool==='hl';
    const list = isHl ? NOTE_HL_COLORS : (opts.colors || NOTE_COLORS);
    const curC = isHl ? board.state.hlColor : board.state.color;
    const hide = ['eraser'].includes(board.state.tool);
    colorsBox.style.visibility = hide ? 'hidden' : '';
    list.forEach(c=>{
      const b = h(`<button type="button" class="nb-color ${c===curC?'on':''}" style="--c:${c}" aria-label="Cor ${c}"></button>`);
      b.onclick = ()=>{ board.setColor(c); paintColors(); };
      colorsBox.appendChild(b);
    });
  }
  function paintSizes(){
    sizesBox.innerHTML = '';
    [0,1,2].forEach(i=>{
      const b = h(`<button type="button" class="nb-size ${board.state.size===i?'on':''}" aria-label="Espessura ${i+1}"><i style="width:${5+i*5}px;height:${5+i*5}px"></i></button>`);
      b.onclick = ()=>{ board.setSize(i); paintSizes(); };
      sizesBox.appendChild(b);
    });
  }
  NOTE_TOOLS.filter(t=>tools.includes(t[0])).forEach(([id,ico,label])=>{
    const b = h(`<button type="button" class="nb-tool ${board.state.tool===id?'on':''}" data-t="${id}" title="${label}" aria-label="${label}"><span>${ico}</span><small>${label.split(' ')[0]}</small></button>`);
    b.onclick = ()=>{ board.setTool(id); toolsBox.querySelectorAll('.nb-tool').forEach(x=>x.classList.toggle('on', x.dataset.t===id)); paintColors(); };
    toolsBox.appendChild(b);
  });
  paintColors(); paintSizes();
  return bar;
}

/* ---------- tela: lista de páginas do caderno ---------- */
function notebookScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('✏️ Caderno', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const list = notesIndex();
  let filter = state.noteFilter || 'all';
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 14px;">Escreva à mão como numa mesa digitalizadora: com o dedo ou com uma caneta (stylus). Use dois dedos pra mover e dar zoom.</p>`));
  const newBtn = h(`<button class="btn primary" style="width:100%; margin-bottom:14px">＋ Nova página</button>`);
  newBtn.onclick = ()=> chooseNewPage();
  c.appendChild(newBtn);

  const used = [...new Set(list.map(n=>n.subjectId).filter(Boolean))];
  if(used.length){
    const chips = h(`<div class="subj-chip-grid" style="margin-bottom:14px"></div>`);
    [['all','Todas'], ['none','Sem assunto'], ...used.map(id=>{ const s = SUBJECTS.find(x=>x.id===id); return [id, s ? s.name : id]; })].forEach(([id,label])=>{
      const b = h(`<button type="button" class="subj-chip ${filter===id?'active':''}" style="padding:7px 12px"></button>`);
      b.textContent = label;
      b.onclick = ()=>{ state.noteFilter = id; render(); };
      chips.appendChild(b);
    });
    c.appendChild(chips);
  }
  const shown = list.filter(n=> filter==='all' ? true : filter==='none' ? !n.subjectId : n.subjectId===filter)
    .sort((a,b)=>(b.updated||0)-(a.updated||0));
  if(!shown.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma página ainda.<br>Toque em <b>Nova página</b> pra começar a anotar. 📝</div>`));
  } else {
    const grid = h(`<div class="nb-grid"></div>`);
    shown.forEach(n=>{
      const s = n.subjectId ? SUBJECTS.find(x=>x.id===n.subjectId) : null;
      const d = new Date(n.updated||n.created||Date.now());
      const card = h(`<button type="button" class="nb-card"><div class="nb-thumb">${n.thumb?`<img src="${n.thumb}" alt="">`:''}</div><div class="nb-t"></div><div class="nb-s">${s?`${s.sym} ${escHTML(s.name)} · `:''}${fmtDM(d)}</div></button>`);
      card.querySelector('.nb-t').textContent = n.title || 'Sem título';
      card.onclick = ()=> go('notePage', {noteId:n.id});
      grid.appendChild(card);
    });
    c.appendChild(grid);
  }
  wrap.appendChild(c);
  return wrap;
}
function chooseNewPage(subjectId){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="gm-modal"><h2 style="font-size:20px">Escolha o papel</h2><div class="nb-papers"></div>
    <button type="button" class="nb-cancel" style="margin-top:12px;background:rgba(255,255,255,.1);color:#fff">Cancelar</button></div>`;
  const box = bg.querySelector('.nb-papers');
  NOTE_BGS.forEach(([id,label])=>{
    const b = h(`<button type="button" class="nb-paper"><canvas width="90" height="127"></canvas><span>${label}</span></button>`);
    const cx = b.querySelector('canvas').getContext('2d'); cx.scale(90/NOTE_W, 90/NOTE_W); drawNoteBg(cx, id);
    b.onclick = ()=>{ bg.remove(); const p = newNotePage({bg:id, subjectId}); go('notePage', {noteId:p.id}); };
    box.appendChild(b);
  });
  bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}

/* ---------- tela: editar uma página ---------- */
let _noteBoard = null;
function notePageScreen(){
  if(_noteBoard){ _noteBoard.destroy(); _noteBoard = null; }
  const page = loadNotePage(state.noteId);
  const wrap = h(`<div class="nb-editor"></div>`);
  if(!page){ setTimeout(()=>go('notebook'), 0); return wrap; }
  let saveTimer = 0;
  const saveSoon = ()=>{ clearTimeout(saveTimer); saveTimer = setTimeout(()=>saveNotePage(page), 500); paintUndo(); };

  const head = h(`<div class="nb-head">
    <button class="back-btn" aria-label="Voltar">‹</button>
    <input class="nb-title" maxlength="60" aria-label="Título da página">
    <button type="button" class="nb-icon nb-undo" aria-label="Desfazer" title="Desfazer">↶</button>
    <button type="button" class="nb-icon nb-redo" aria-label="Refazer" title="Refazer">↷</button>
    <button type="button" class="nb-icon nb-more" aria-label="Mais opções" title="Mais opções">⋯</button>
  </div>`);
  const title = head.querySelector('.nb-title'); title.value = page.title;
  title.oninput = ()=>{ page.title = title.value.trim() || 'Sem título'; saveSoon(); };
  head.querySelector('.back-btn').onclick = ()=>{ clearTimeout(saveTimer); saveNotePage(page); go('notebook'); };
  wrap.appendChild(head);

  const area = h(`<div class="nb-area"></div>`);
  const hint = h(`<div class="nb-hint"></div>`);
  const board = createBoard(area, page, saveSoon);
  _noteBoard = board;
  const toolbar = boardToolbar(board);
  wrap.appendChild(toolbar);
  wrap.appendChild(area);
  area.appendChild(hint);
  function showHint(t){ hint.textContent = t; hint.classList.add('on'); clearTimeout(showHint._t); showHint._t = setTimeout(()=>hint.classList.remove('on'), 2200); }
  board.onPenDetected = ()=> showHint('✒️ Caneta detectada: agora o dedo só move a página');
  board.onZoom = z=> showHint(`🔍 ${Math.round(z*100)}%`);
  function paintUndo(){ head.querySelector('.nb-undo').disabled = !board.canUndo(); head.querySelector('.nb-redo').disabled = !board.canRedo(); }
  head.querySelector('.nb-undo').onclick = ()=>{ board.undo(); saveSoon(); };
  head.querySelector('.nb-redo').onclick = ()=>{ board.redo(); saveSoon(); };
  paintUndo();

  head.querySelector('.nb-more').onclick = ()=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg sheet';
    const s = page.subjectId ? SUBJECTS.find(x=>x.id===page.subjectId) : null;
    bg.innerHTML = `<div class="gm-modal nb-menu"><h2 style="font-size:20px">Opções da página</h2>
      <div class="nb-sec">Papel</div><div class="nb-bgs"></div>
      <div class="nb-sec">Assunto</div><select class="nb-subj"><option value="">Sem assunto</option>${SUBJECTS.map(x=>`<option value="${x.id}" ${s&&s.id===x.id?'selected':''}>${escHTML(x.name)}</option>`).join('')}</select>
      <button type="button" class="nb-m nb-pen ${board.state.penOnly?'on':''}">✒️ Só caneta (o dedo só move a página): ${board.state.penOnly?'ligado':'desligado'}</button>
      <button type="button" class="nb-m nb-zoom">🔍 Voltar o zoom ao normal</button>
      <button type="button" class="nb-m nb-share">📤 Salvar / compartilhar como imagem</button>
      <button type="button" class="nb-m nb-clear">🧹 Limpar a página</button>
      <button type="button" class="nb-m nb-del">🗑️ Excluir a página</button>
      <button type="button" class="nb-cancel" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Fechar</button></div>`;
    const bgs = bg.querySelector('.nb-bgs');
    NOTE_BGS.forEach(([id,label])=>{
      const b = h(`<button type="button" class="nb-chip ${page.bg===id?'on':''}">${label}</button>`);
      b.onclick = ()=>{ board.setBg(id); bgs.querySelectorAll('.nb-chip').forEach(x=>x.classList.remove('on')); b.classList.add('on'); saveSoon(); };
      bgs.appendChild(b);
    });
    bg.querySelector('.nb-subj').onchange = e=>{ page.subjectId = e.target.value || null; saveSoon(); };
    bg.querySelector('.nb-pen').onclick = e=>{ board.setPenOnly(!board.state.penOnly); e.target.textContent = `✒️ Só caneta (o dedo só move a página): ${board.state.penOnly?'ligado':'desligado'}`; };
    bg.querySelector('.nb-zoom').onclick = ()=>{ board.resetZoom(); bg.remove(); };
    bg.querySelector('.nb-share').onclick = ()=>{ saveNotePage(page); shareNotePage(page); };
    bg.querySelector('.nb-clear').onclick = ()=>{ bg.remove(); showConfirm({icon:'🧹', title:'Limpar a página?', message:'Tudo o que está escrito nela vai sumir (dá pra desfazer com ↶).', ok:'Limpar', cancel:'Cancelar', danger:true}).then(ok=>{ if(ok){ board.clear(); saveSoon(); } }); };
    bg.querySelector('.nb-del').onclick = ()=>{ bg.remove(); showConfirm({icon:'🗑️', title:'Excluir a página?', message:'Ela some do caderno e não dá pra desfazer.', ok:'Excluir', cancel:'Cancelar', danger:true}).then(ok=>{ if(ok){ clearTimeout(saveTimer); deleteNotePage(page.id); go('notebook'); } }); };
    bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
    bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
    document.body.appendChild(bg);
  };
  return wrap;
}

/* ---------- rascunho rápido durante as questões ---------- */
function openScratchPad(ex){
  const page = {bg:'grid', strokes:[]};
  const root = h(`<div class="nb-scratch" role="dialog" aria-label="Rascunho">
    <div class="nb-head">
      <div class="nb-sq"></div>
      <button type="button" class="nb-icon nb-undo" aria-label="Desfazer">↶</button>
      <button type="button" class="nb-icon nb-clr" aria-label="Limpar">🧹</button>
      <button type="button" class="nb-icon nb-keep" aria-label="Salvar no caderno" title="Salvar no caderno">💾</button>
      <button type="button" class="nb-icon nb-x" aria-label="Fechar rascunho">✕</button>
    </div>
  </div>`);
  root.querySelector('.nb-sq').textContent = '✏️ Rascunho · ' + (speechText(ex) ? String(ex.question||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,80) : '');
  const area = h(`<div class="nb-area"></div>`);
  document.body.appendChild(root);
  const board = createBoard(area, page, ()=>{});
  root.appendChild(boardToolbar(board, {tools:['pen','eraser','line','text'], colors:NOTE_COLORS.slice(0,4)}));
  root.appendChild(area);
  const close = ()=>{ board.destroy(); root.remove(); };
  root.querySelector('.nb-x').onclick = close;
  root.querySelector('.nb-undo').onclick = ()=> board.undo();
  root.querySelector('.nb-clr').onclick = ()=> board.clear();
  root.querySelector('.nb-keep').onclick = ()=>{
    if(!page.strokes.length){ showFloat('O rascunho está vazio'); return; }
    const sid = state.session && (state.session.currentSubjectId || state.session.subjectId);
    newNotePage({title:'Rascunho · ' + fmtDM(new Date()), subjectId: sid || null, bg:'grid', strokes: page.strokes.slice()});
    queueToast('💾', 'Salvo no caderno!', 'Veja em Caderno, na tela inicial');
  };
}
function questionTools(card){
  let box = card.querySelector('.qc-tools');
  if(!box){ box = h(`<div class="qc-tools"></div>`); card.appendChild(box); card.classList.add('has-tools'); }
  return box;
}
function addScratchButton(card, ex){
  const b = h(`<button type="button" class="tts-btn" aria-label="Abrir rascunho" title="Rascunho: faça a conta à mão">✏️</button>`);
  b.onclick = e=>{ e.stopPropagation(); openScratchPad(ex); };
  questionTools(card).appendChild(b);
}

/* ---------------- DUELO A DOIS (mesmo aparelho) ----------------
   Tela dividida: o jogador de cima vê tudo de cabeça pra baixo, pra jogar frente a frente
   com o celular deitado na mesa. Mesma conta pros dois; quem tocar primeiro na certa
   leva o ponto. Errou? Fica travado até a próxima conta. */
const DUEL_ROUNDS = 10;
function duelScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Duelo a dois', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  let level = 0, names = ['Jogador 1','Jogador 2'];
  try{ const saved = JSON.parse(localStorage.getItem('mathstudy-duel-names')||'null'); if(Array.isArray(saved)) names = saved; }catch(e){}

  c.appendChild(h(`<div class="lt-start"><div class="big">⚔️</div><h2>Duelo a dois</h2><p>Dois jogadores no mesmo celular, frente a frente. Deite o aparelho na mesa: cada um fica com uma metade da tela. Quem acertar primeiro leva o ponto! São ${DUEL_ROUNDS} contas.</p></div>`));
  const form = h(`<div class="answer-form">
    <div><label>Jogador de baixo</label><input class="duel-n1" maxlength="14"></div>
    <div><label>Jogador de cima</label><input class="duel-n2" maxlength="14"></div>
  </div>`);
  form.querySelector('.duel-n1').value = names[0]; form.querySelector('.duel-n2').value = names[1];
  c.appendChild(form);
  c.appendChild(h(`<h3 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-soft);font-weight:600;margin:6px 0 8px;letter-spacing:.08em;">Nível das contas</h3>`));
  const lvRow = h(`<div class="diff-row"></div>`);
  [['Fácil',0],['Médio',8],['Difícil',16]].forEach(([label,v],i)=>{
    const chip = h(`<button type="button" class="diff-chip ${i===0?'active':''}">${label}</button>`);
    chip.onclick = ()=>{ level = v; lvRow.querySelectorAll('.diff-chip').forEach(x=>x.classList.remove('active')); chip.classList.add('active'); };
    lvRow.appendChild(chip);
  });
  c.appendChild(lvRow);
  const start = h(`<button class="btn primary" style="width:100%">Começar duelo ⚔️</button>`);
  start.onclick = ()=>{
    names = [form.querySelector('.duel-n1').value.trim()||'Jogador 1', form.querySelector('.duel-n2').value.trim()||'Jogador 2'];
    try{ localStorage.setItem('mathstudy-duel-names', JSON.stringify(names)); }catch(e){}
    runDuel(names, level);
  };
  c.appendChild(start);
  return wrap;
}
function runDuel(names, level){
  const score = [0,0];
  let round = 0, q = null, locked = [false,false], done = false;
  const root = h(`<div class="duel-root" role="application">
    <div class="duel-half top" data-p="1"></div>
    <div class="duel-mid"><span class="duel-sc"></span><button type="button" class="duel-quit" aria-label="Sair do duelo">✕</button></div>
    <div class="duel-half bottom" data-p="0"></div>
  </div>`);
  const halves = [root.querySelector('.bottom'), root.querySelector('.top')];
  const sc = root.querySelector('.duel-sc');
  root.querySelector('.duel-quit').onclick = ()=>{ done = true; root.remove(); };
  document.body.appendChild(root);

  function paintScore(){ sc.textContent = `${names[0]} ${score[0]} × ${score[1]} ${names[1]} · ${Math.min(round+1,DUEL_ROUNDS)}/${DUEL_ROUNDS}`; }
  function next(){
    if(done) return;
    if(round >= DUEL_ROUNDS) return finish();
    q = boltQuestion(level + round); locked = [false,false];
    paintScore();
    halves.forEach((el,p)=>{
      el.innerHTML = `<div class="duel-name">${escHTML(names[p])} · ${score[p]} pts</div><div class="duel-q mono">${q.text} = ?</div><div class="duel-opts"></div>`;
      const box = el.querySelector('.duel-opts');
      q.opts.forEach(v=>{
        const b = h(`<button type="button" class="duel-opt mono">${v}</button>`);
        b.onclick = ()=> answer(p, v, b);
        box.appendChild(b);
      });
    });
  }
  function answer(p, v, btn){
    if(done || locked[p] || locked[2]) return;
    if(v === q.ans){
      locked[2] = true; score[p]++; paintScore();
      btn.classList.add('ok');
      halves[p].classList.add('win'); halves[1-p].classList.add('lose');
      playTones([660,990], 0.06, 'triangle', 0.08);
      halves[1-p].querySelectorAll('.duel-opt').forEach(b=>{ if(Number(b.textContent)===q.ans) b.classList.add('ok'); });
      setTimeout(()=>{ halves.forEach(x=>x.classList.remove('win','lose')); round++; next(); }, 1100);
    } else {
      locked[p] = true; btn.classList.add('bad'); halves[p].classList.add('lock');
      playTones([220], 0.12, 'sawtooth', 0.05);
      if(locked[0] && locked[1]){ locked[2] = true; setTimeout(()=>{ halves.forEach(x=>x.classList.remove('lock')); round++; next(); }, 1100); }
      else setTimeout(()=> halves[p].classList.remove('lock'), 1100);
    }
  }
  function finish(){
    const w = score[0]===score[1] ? -1 : (score[0]>score[1] ? 0 : 1);
    halves.forEach((el,p)=>{
      el.innerHTML = `<div class="duel-end"><div class="big">${w===-1?'🤝':w===p?'🏆':'💪'}</div><div class="duel-q">${w===-1?'Empate!':w===p?'Você venceu!':'Quase! Revanche?'}</div><div class="duel-name">${score[p]} × ${score[1-p]}</div><div class="duel-actions"><button type="button" class="duel-opt again">Revanche</button><button type="button" class="duel-opt exit">Sair</button></div></div>`;
      el.querySelector('.again').onclick = ()=>{ score[0]=score[1]=0; round=0; next(); };
      el.querySelector('.exit').onclick = ()=>{ done = true; root.remove(); };
    });
    sc.textContent = w===-1 ? 'Empate!' : `${names[w]} venceu!`;
    launchConfetti(140);
    gameTouchDay(); saveGame();
  }
  next();
}

/* ---------------- CERTIFICADOS ----------------
   Cada episódio da trilha concluído (grande final vencida) libera um certificado
   que dá pra imprimir ou salvar em PDF. */
function completedUnits(){
  const done = pathDone(), all = allPathNodes();
  return SUBJECTS.filter(s=>all.filter(n=>n.subject.id===s.id).every(n=>done[n.key]));
}
function certificatesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📜 Certificados', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const units = completedUnits();
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Vença a <b>Grande final</b> de um episódio da Trilha pra ganhar o certificado daquele assunto. Dá pra imprimir ou salvar em PDF.</p>`));
  SUBJECTS.forEach(s=>{
    const got = units.includes(s);
    const row = h(`<button class="subject-row" ${got?'':'disabled style="opacity:.5"'}><span class="sym">${got?'📜':'🔒'}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${got?'Certificado liberado · toque pra ver':'Complete o episódio na Trilha'}</span></span><span class="chev">›</span></button>`);
    if(got) row.onclick = ()=> go('certificate', {subjectId:s.id});
    c.appendChild(row);
  });
  wrap.appendChild(c);
  return wrap;
}
function certificateScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Certificado', true, ()=>go('certificates')));
  const c = h(`<div class="content"></div>`);
  const name = currentUser ? currentUser.name : '';
  const g = loadGame();
  const when = new Date(); const dt = `${String(when.getDate()).padStart(2,'0')}/${String(when.getMonth()+1).padStart(2,'0')}/${when.getFullYear()}`;
  const cert = h(`<div class="cert">
    <div class="cert-in">
      <img src="${LOGO_URI}" alt="" class="cert-logo">
      <div class="cert-k">Matemática Show</div>
      <h2>Certificado de Conclusão</h2>
      <p>Certificamos que</p>
      <div class="cert-name"></div>
      <p>concluiu com sucesso o episódio</p>
      <div class="cert-subj">${s.sym} ${escHTML(s.name)}</div>
      <p class="cert-small">passando pelas fases fácil, média e difícil e vencendo a Grande final.<br>Nível ${levelInfo(g.xp).level} · ${escHTML(levelInfo(g.xp).title)}</p>
      <div class="cert-foot"><span>${dt}</span><span>🎤 Pi, o apresentador</span></div>
    </div>
  </div>`);
  cert.querySelector('.cert-name').textContent = name || 'Estudante';
  c.appendChild(cert);
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:16px"></div>`);
  const pr = h(`<button class="btn primary">🖨️ Imprimir / PDF</button>`);
  pr.onclick = ()=> window.print();
  actions.appendChild(pr);
  c.appendChild(actions);
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- RELATÓRIO SEMANAL (para pais e professores) ----------------
   Resume os últimos 7 dias a partir do histórico de respostas e compara com os 7 dias
   anteriores. Dá pra compartilhar como texto ou imprimir / salvar em PDF. */
function reportData(hist){
  const DAY = 864e5, today0 = new Date(); today0.setHours(0,0,0,0);
  const start = today0.getTime() - 6*DAY, prevStart = start - 7*DAY;
  const cur = hist.filter(e=>e.ts>=start), prev = hist.filter(e=>e.ts>=prevStart && e.ts<start);
  const days = [];
  for(let i=0;i<7;i++){
    const t0 = start + i*DAY, t1 = t0 + DAY;
    const list = cur.filter(e=>e.ts>=t0 && e.ts<t1);
    days.push({date:new Date(t0), n:list.length, ok:list.filter(e=>e.correct).length});
  }
  const bySubj = {};
  const add = (e, key)=>{ const b = bySubj[e.subjectId] = bySubj[e.subjectId] || {cur:{n:0,ok:0}, prev:{n:0,ok:0}}; b[key].n++; if(e.correct) b[key].ok++; };
  cur.forEach(e=>add(e,'cur')); prev.forEach(e=>add(e,'prev'));
  const acc = l=> l.length ? Math.round(l.filter(e=>e.correct).length/l.length*100) : null;
  const subjects = Object.keys(bySubj).filter(id=>bySubj[id].cur.n>0).map(id=>{
    const s = SUBJECTS.find(x=>x.id===id), b = bySubj[id];
    return {id, name: s ? s.name : id, sym: s ? s.sym : '', n:b.cur.n, pct:Math.round(b.cur.ok/b.cur.n*100), prevPct: b.prev.n ? Math.round(b.prev.ok/b.prev.n*100) : null};
  }).sort((a,b)=>b.n-a.n);
  // histórico guarda só as últimas HISTORY_LIMIT respostas: se ele começa depois do período anterior, a comparação pode estar incompleta
  const oldest = hist.length ? hist[hist.length-1].ts : Date.now();
  return {start:new Date(start), end:today0, days, cur, prev, subjects,
    activeDays: days.filter(d=>d.n>0).length, total:cur.length, pct:acc(cur), prevTotal:prev.length, prevPct:acc(prev),
    strong: subjects.filter(s=>s.n>=5 && s.pct>=80), weak: subjects.filter(s=>s.n>=3 && s.pct<60),
    partialPrev: hist.length>=HISTORY_LIMIT && oldest>prevStart};
}
function fmtDM(d){ return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
function reportTip(r){
  if(!r.total) return 'Nenhuma questão respondida nesta semana. Uma boa meta é praticar 10 minutos por dia: pouco, mas todo dia, funciona melhor do que muito de uma vez.';
  const parts = [];
  if(r.activeDays<=2) parts.push(`Estudou em ${r.activeDays} dia${r.activeDays===1?'':'s'}. Praticar um pouco todo dia ajuda mais a fixar do que estudar tudo de uma vez.`);
  else if(r.activeDays>=5) parts.push(`Ótima constância: estudou em ${r.activeDays} dos 7 dias! 👏`);
  if(r.weak.length) parts.push(`Vale reforçar ${r.weak.map(s=>s.name).join(', ')}: releia a explicação em "Aprender" e faça um Treino personalizado só com ${r.weak.length===1?'esse assunto':'esses assuntos'}.`);
  if(r.strong.length) parts.push(`Está indo muito bem em ${r.strong.map(s=>s.name).join(', ')}. Dá pra tentar o nível difícil.`);
  if(!parts.length) parts.push('Bom ritmo! Continue praticando e use a Revisão do dia pra não esquecer o que já aprendeu.');
  return parts.join(' ');
}
function reportText(r){
  const name = currentUser ? currentUser.name : '';
  const g = loadGame(), lv = levelInfo(g.xp);
  const lines = [
    `📊 Matemática Show — relatório semanal${name?` de ${name}`:''}`,
    `Período: ${fmtDM(r.start)} a ${fmtDM(r.end)}`,
    '',
    `• Dias estudados: ${r.activeDays} de 7`,
    `• Questões respondidas: ${r.total}${r.prevTotal?` (semana anterior: ${r.prevTotal})`:''}`,
    `• Acerto: ${r.pct===null?'—':r.pct+'%'}${r.prevPct!==null?` (semana anterior: ${r.prevPct}%)`:''}`,
    `• Nível ${lv.level} · ofensiva de ${gameStreakNow()} dia${gameStreakNow()===1?'':'s'}`,
  ];
  if(r.subjects.length){ lines.push('', 'Por assunto:'); r.subjects.forEach(s=>lines.push(`• ${s.name}: ${s.n} questões, ${s.pct}% de acerto`)); }
  if(r.strong.length) lines.push('', `✅ Pontos fortes: ${r.strong.map(s=>s.name).join(', ')}`);
  if(r.weak.length) lines.push(`⚠️ Precisa de atenção: ${r.weak.map(s=>s.name).join(', ')}`);
  lines.push('', `💡 ${reportTip(r)}`);
  return lines.join('\n');
}
async function reportScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Relatório semanal', true, ()=>go('profile')));
  const c = h(`<div class="content"></div>`);
  const r = reportData(await loadHistory());
  const name = currentUser ? currentUser.name : '';

  const now = new Date();
  const genAt = `${fmtDM(now)}/${now.getFullYear()}`;
  c.appendChild(h(`<div class="rp-print-only rp-print-top"><b>📊 Matemática Show</b><span>Relatório gerado em ${genAt}</span></div>`));
  const head = h(`<div class="rp-head"><div class="rp-k">Relatório para pais e professores</div><h2></h2><p>Últimos 7 dias · ${fmtDM(r.start)} a ${fmtDM(r.end)}</p></div>`);
  head.querySelector('h2').textContent = name || 'Meu relatório';
  c.appendChild(head);

  const trend = (now, before, unit)=>{
    if(now===null || before===null || !r.prevTotal) return '';
    const d = now - before;
    return `<div class="rp-trend ${d>0?'up':d<0?'down':'same'}">${d>0?'▲':d<0?'▼':'='} ${Math.abs(d)}${unit} vs. semana anterior</div>`;
  };
  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.activeDays}/7</div><div class="lbl">Dias estudados</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.total}</div><div class="lbl">Questões</div>${trend(r.total, r.prevTotal, '')}</div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${r.pct===null?'—':r.pct+'%'}</div><div class="lbl">Acerto</div>${trend(r.pct, r.prevPct, ' pts')}</div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🔥 ${gameStreakNow()}</div><div class="lbl">Ofensiva (dias)</div></div>`));
  c.appendChild(grid);

  c.appendChild(h(`<div class="rp-sec">Questões por dia</div>`));
  const max = Math.max(1, ...r.days.map(d=>d.n));
  const WD = ['dom','seg','ter','qua','qui','sex','sáb'];
  const chart = h(`<div class="rp-days" role="img" aria-label="Questões respondidas por dia: ${r.days.map(d=>`${WD[d.date.getDay()]} ${d.n}`).join(', ')}"></div>`);
  r.days.forEach(d=>{
    chart.appendChild(h(`<div class="rp-day ${d.n?'':'zero'}" title="${fmtDM(d.date)}: ${d.n} questões, ${d.ok} certas"><span class="n">${d.n||''}</span><span class="bar" style="height:${Math.round(d.n/max*72)}%"></span><span class="d">${WD[d.date.getDay()]}</span></div>`));
  });
  c.appendChild(chart);

  c.appendChild(h(`<div class="rp-sec">Por assunto</div>`));
  if(!r.subjects.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma questão respondida nesta semana.</div>`));
  } else r.subjects.forEach(s=>{
    const cls = s.pct>=80 ? '' : s.pct>=60 ? 'mid' : 'low';
    const tr = s.prevPct===null ? '' : ` <span class="rp-trend ${s.pct>s.prevPct?'up':s.pct<s.prevPct?'down':'same'}" style="display:inline">${s.pct>s.prevPct?'▲':s.pct<s.prevPct?'▼':'='}</span>`;
    c.appendChild(h(`<div class="mastery-row"><div class="top"><span class="name">${s.sym} ${escHTML(s.name)}</span><span class="pct">${s.n} q · ${s.pct}%${tr}</span></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${s.pct}%"></div></div></div>`));
  });

  if(r.strong.length || r.weak.length){
    c.appendChild(h(`<div class="rp-sec">Destaques</div>`));
    const ul = h(`<ul class="rp-list"></ul>`);
    if(r.strong.length) ul.appendChild(h(`<li>✅ <b>Pontos fortes:</b> ${r.strong.map(s=>escHTML(s.name)).join(', ')}</li>`));
    if(r.weak.length) ul.appendChild(h(`<li>⚠️ <b>Precisa de atenção:</b> ${r.weak.map(s=>escHTML(s.name)).join(', ')}</li>`));
    c.appendChild(ul);
  }
  c.appendChild(h(`<div class="rp-sec">Sugestão</div>`));
  const tip = h(`<div class="rp-tip"></div>`); tip.textContent = '💡 ' + reportTip(r);
  c.appendChild(tip);
  if(r.partialPrev) c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12px; margin-top:10px;">A comparação com a semana anterior pode estar incompleta: o app guarda só as últimas ${HISTORY_LIMIT} respostas.</p>`));

  c.appendChild(h(`<div class="rp-print-only rp-print-foot">Matemática Show · relatório dos últimos 7 dias (${fmtDM(r.start)} a ${fmtDM(r.end)}) · gerado em ${genAt}</div>`));
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:18px"></div>`);
  const shareBtn = h(`<button class="btn primary">📤 Compartilhar resumo</button>`);
  shareBtn.onclick = async ()=>{
    const text = reportText(r);
    try{ if(navigator.share){ await navigator.share({title:'Relatório semanal — Matemática Show', text}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); queueToast('📋', 'Resumo copiado!', 'Cole no WhatsApp, e-mail ou onde quiser'); }
    catch(e){ showConfirm({icon:'📋', title:'Copie o resumo', message:text, ok:'Ok', cancel:'Fechar'}); }
  };
  const printBtn = h(`<button class="btn secondary">🖨️ Imprimir / PDF</button>`);
  printBtn.onclick = ()=> window.print();
  actions.appendChild(shareBtn); actions.appendChild(printBtn);
  c.appendChild(actions);

  wrap.appendChild(c);
  return wrap;
}

/* ---------- revisão espaçada ----------
   Cada assunto já praticado "vence" depois de um intervalo que cresce com o % de acerto:
   quem erra muito revê amanhã; quem domina, só daqui a uma semana. */
const REVIEW_MIN_ATTEMPTS = 3;
function reviewIntervalDays(acc){ return acc>=0.9 ? 7 : acc>=0.75 ? 4 : acc>=0.5 ? 2 : 1; }
function dueReviewSubjects(progress){
  const now = Date.now();
  return SUBJECTS.filter(s=>{
    const d = progress[s.id];
    if(!d || d.attempted < REVIEW_MIN_ATTEMPTS) return false;
    const acc = d.correct/d.attempted;
    if(!d.last) return acc < 0.75; // dados antigos, sem data: revisa só o que ainda está fraco
    return now - d.last >= reviewIntervalDays(acc)*864e5;
  }).sort((a,b)=>(progress[a.id].correct/progress[a.id].attempted)-(progress[b.id].correct/progress[b.id].attempted));
}
async function startSpacedReview(){
  const progress = await loadProgress();
  const due = dueReviewSubjects(progress).slice(0,4);
  if(!due.length) return;
  startPersonalizedSession({subjectIds: due.map(s=>s.id), difficultyMode:'adaptativa', qty: Math.min(10, Math.max(5, due.length*3)), focusWeak: due.length>1, progress, isReview:true});
}

/* ---------- lembrete de backup ----------
   o progresso fica só neste aparelho; de tempos em tempos lembramos de exportar uma cópia */
const BACKUP_KEY_BASE = 'mathstudy-backup-v1';
const BACKUP_EVERY_DAYS = 14, BACKUP_MIN_ANSWERS = 30;
function backupInfo(){ try{ return JSON.parse(localStorage.getItem(`${BACKUP_KEY_BASE}:${currentUserId()}`)||'{}'); }catch(e){ return {}; } }
function saveBackupInfo(o){ try{ localStorage.setItem(`${BACKUP_KEY_BASE}:${currentUserId()}`, JSON.stringify(Object.assign(backupInfo(), o))); }catch(e){} }
let _backupAskedThisRun = false;
async function maybeAskBackup(){
  if(_backupAskedThisRun || !currentUser) return;
  const progress = await loadProgress();
  const total = Object.values(progress).reduce((a,d)=>a+(d.attempted||0), 0);
  if(total < BACKUP_MIN_ANSWERS) return;
  const info = backupInfo(), now = Date.now();
  if(!info.since){ saveBackupInfo({since: now}); return; } // começa a contar a partir de agora
  const ref = Math.max(info.last||0, info.since||0, info.snooze||0);
  if(now - ref < BACKUP_EVERY_DAYS*864e5) return;
  _backupAskedThisRun = true;
  const ok = await showConfirm({icon:'💾', title:'Guarde uma cópia do seu progresso',
    message:`Você já respondeu ${total} questões! Seu progresso fica salvo só neste aparelho: se limpar o navegador ou trocar de celular, ele se perde. Quer salvar uma cópia agora?`,
    ok:'Salvar cópia', cancel:'Depois'});
  if(ok) exportProgressData(); else saveBackupInfo({snooze: now});
}

/* ---------------- TABUADA (tela própria) ---------------- */
function tabuadaScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Tabuada', true, ()=>go('home')));
  wrap.appendChild(buildTabuadaSection());
  return wrap;
}

/* ---------------- TABUADA (tela inicial) ---------------- */
function buildTabuadaSection(){
  const section = h(`
    <section class="block tabuada-block">
      <h3>Tabuada</h3>
      <div class="card tabuada-card">
        <div class="tabuada-chips" id="tabuadaChips"></div>
        <div class="tabuada-list" id="tabuadaList"></div>
      </div>
    </section>`);
  const chipsWrap = section.querySelector('#tabuadaChips');
  const list = section.querySelector('#tabuadaList');
  let current = 1;

  for(let n=1;n<=10;n++){
    const chip = h(`<button class="tabuada-chip">${n}</button>`);
    chip.onclick = ()=> selectN(n);
    chipsWrap.appendChild(chip);
  }

  function selectN(n){
    current = n;
    chipsWrap.querySelectorAll('.tabuada-chip').forEach((c,idx)=>{
      c.classList.toggle('active', idx+1===n);
    });
    list.innerHTML = '';
    for(let k=1;k<=10;k++){
      list.appendChild(h(`
        <div class="tabuada-row">
          <span>${n} <span class="eq">×</span> ${k} <span class="eq">=</span></span>
          <span class="res">${n*k}</span>
        </div>`));
    }
  }

  selectN(1);
  return section;
}

/* ---------------- CONTENT LIST ---------------- */
function contentScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Aprender', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Escolha um assunto para estudar a teoria e ver exemplos.</p>`));
  const lab = h(`<button type="button" class="alert-banner" style="margin:0 0 14px"><span class="sym">🔺</span><span class="txt"><span class="title">Laboratório de Geometria</span><span class="sub">Mexa nas figuras e veja área, perímetro, volume e ângulos mudando</span></span><span class="chev">›</span></button>`);
  lab.onclick = ()=> go('geoLab', {geoBack:'content'});
  c.appendChild(lab);
  SUBJECTS.forEach(s=>{
    const row = h(`<button class="subject-row"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${BNCC_ANO[s.id]?`📚 ${BNCC_ANO[s.id]} · `:''}${masteryChip(masterySync(s.id))}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=>go('subjectDetail', {subjectId:s.id});
    c.appendChild(row);
  });
  wrap.appendChild(c);
  return wrap;
}

function renderExampleBody(ex){
  return ex.columns
    ? contaArmada(ex.columns.nums, ex.columns.op, ex.columns.result, ex.columns.carries, ex.columns.marks)
    : ex.visual
    ? fracRow(ex.visual)
    : ex.qVisual
    ? ex.qVisual
    : `<div class="mono">${ex.text}</div>`;
}
function subjectDetailScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('content')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<div class="learn-hero"><span class="sym-big mono">${s.sym}</span><h2>${s.name}</h2></div>`));
  { const m = masterySync(s.id);
    c.appendChild(h(`<div class="mst-box"><div>${masteryChip(m)}${BNCC_ANO[s.id]?`<span class="bncc-tag">📚 BNCC · ${BNCC_ANO[s.id]}</span>`:''}</div><p>${m.next}</p></div>`)); }
  const explain = h(`<div class="explain-card"></div>`);
  const examplesList = s.examples || [s.example];
  const boxesHtml = examplesList.map(ex=>{
    const stepsHtml = ex.steps ? `<div class="example-steps">${ex.steps.map((st,i)=>`<div class="ex-step"><span class="num">${i+1}</span><span class="txt">${st}</span></div>`).join('')}</div>` : '';
    return `<div class="example-box"><div class="lbl">${ex.title}</div>${renderExampleBody(ex)}${stepsHtml}</div>`;
  }).join('');
  explain.innerHTML = s.learn + boxesHtml;
  c.appendChild(explain);
  const cta = h(`<div class="cta-row"><button class="btn primary">Praticar este assunto</button><button class="btn secondary">✏️ Anotar no caderno</button></div>`);
  cta.querySelector('.primary').onclick = ()=>go('exerciseDifficulty', {subjectId:s.id});
  if(s.id==='geometria'){
    const labBtn = h(`<button class="btn secondary" style="flex-basis:100%">🔺 Abrir o Laboratório de Geometria</button>`);
    labBtn.onclick = ()=> go('geoLab', {geoBack:'subjectDetail'});
    cta.prepend(labBtn);
  }
  cta.querySelector('.secondary').onclick = ()=>{
    const mine = notesIndex().filter(n=>n.subjectId===s.id);
    if(mine.length){ state.noteFilter = s.id; go('notebook'); } else chooseNewPage(s.id);
  };
  c.appendChild(cta);
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- EXERCISES: subject list ---------------- */
function exercisesSubjectsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Exercícios', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Escolha um assunto para praticar.</p>`));
  SUBJECTS.forEach(s=>{
    const row = h(`<button class="subject-row"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${masteryChip(masterySync(s.id))}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=>go('exerciseDifficulty', {subjectId:s.id});
    c.appendChild(row);
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

/* =========================================================
   Dicas e explicação alternativa (Fase 2 — aprendizado)
   ========================================================= */
/* dica curta, por assunto: lembra o método geral, sem revelar o resultado da questão atual */
const HINTS = {
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
async function startReviewErrors(){
  const errs = await loadErrors();
  if(!errs.length){ go('home'); return; }
  state.session = {
    errorQueue: errs.map(e=>({...e})),
    index:0, total: errs.length,
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
  if(!p[item.subjectId]) p[item.subjectId] = {attempted:0, correct:0};
  p[item.subjectId].attempted++;
  if(correct) p[item.subjectId].correct++;
  await saveProgress();

  if(correct) await resolveError(item.id);
  gameOnAnswer(item.subjectId, correct, item.difficulty, {review:true});
}

function reviewErrorsSessionScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Revisar erros', true, ()=>go('home')));
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
  const qcard = h(`<div class="question-card"><div class="qlabel">ERRO ${sess.index+1} DE ${sess.total} · ${item.subjectName}${diffLabel? ' · '+diffLabel : ''}</div><div class="qtext mono"></div></div>`);
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
    const fb = h(`<div class="feedback ${correct?'correct':'wrong'}"><div class="fb-title">${correct? '✓ Certinho! Esse erro foi resolvido.' : '✕ Ainda não foi — continua salvo pra tentar de novo depois:'}</div><div class="fb-explain"></div></div>`);
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

/* ---------------- DESAFIOS (perguntas de todos os assuntos misturadas, por dificuldade) ---------------- */
function challengeDifficultyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Desafios', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<div class="greeting" style="margin-bottom:4px"><h2>🏆 Desafios</h2><p>10 questões sorteadas de todos os assuntos. Escolha a dificuldade.</p></div>`));
  const row = h(`<div class="diff-row"></div>`);
  [['facil','Fácil'],['medio','Médio'],['dificil','Difícil']].forEach(([id,label])=>{
    const chip = h(`<button class="diff-chip" data-d="${id}">${label}</button>`);
    chip.onclick = ()=> startChallenge(id);
    row.appendChild(chip);
  });
  c.appendChild(row);
  wrap.appendChild(c);
  return wrap;
}
function startChallenge(difficulty){
  const total = 10;
  const first = pick(SUBJECTS);
  const {ex, signature} = genQuestionAvoidingRepeat(first, difficulty, null);
  state.session = {
    mixed:true, difficulty, index:0, total,
    correct:0, wrong:0, results:[], checked:false, wasCorrect:null,
    currentSubjectId: first.id,
    current: ex,
    lastSignature: signature,
  };
  go('challengeSession');
}
function challengeSessionScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏆 Desafio', true, ()=>go('challengeDifficulty')));
  const c = h(`<div class="content"></div>`);

  if(sess.index >= sess.total){
    const pct = Math.round((sess.correct/sess.total)*100);
    gameSessionEnd(c, sess.correct, sess.total, `Você acertou ${pct}% do desafio ${({facil:'fácil',medio:'médio',dificil:'difícil'})[sess.difficulty]}.`);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    const again = h(`<button class="btn primary">Novo desafio</button>`);
    again.onclick = ()=> startChallenge(sess.difficulty);
    const home = h(`<button class="btn secondary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(again); actions.appendChild(home);
    c.appendChild(actions);
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
  const qcard = h(`<div class="question-card"><div class="qlabel">QUESTÃO ${sess.index+1} DE ${sess.total} · ${({facil:'FÁCIL',medio:'MÉDIO',dificil:'DIFÍCIL'})[sess.difficulty]} · ${s.sym} ${s.name}</div><div class="qtext mono"></div></div>`);
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
        const nextSubject = pick(SUBJECTS);
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

async function personalizedSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Treino personalizado', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 18px;">Monte um treino sob medida: escolha os assuntos, a dificuldade e quantas questões quer praticar.</p>`));

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

  if(lastIds.length){
    c.appendChild(h(`<p class="pt-note" style="color:var(--pine);">Suas escolhas do último treino já estão marcadas — ajuste à vontade.</p>`));
  } else if(levelIds){
    const levelLabel = {fund1:'Fundamental 1', fund2:'Fundamental 2', medio:'Ensino Médio'}[settings.schoolLevel];
    c.appendChild(h(`<p class="pt-note" style="color:var(--pine);">Pré-selecionado pro seu nível (${levelLabel}) — ajuste à vontade abaixo.</p>`));
  }

  c.appendChild(h(`<h3 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-soft);font-weight:600;margin-bottom:8px;letter-spacing:.08em;">Assuntos</h3>`));
  const selLinks = h(`<div style="margin-bottom:10px;"><button type="button" class="link-btn">Todos</button> <span style="color:var(--border);">·</span> <button type="button" class="link-btn">Nenhum</button>${weakIds.length?` <span style="color:var(--border);">·</span> <button type="button" class="link-btn">Só pontos fracos (${weakIds.length})</button>`:''}</div>`);
  c.appendChild(selLinks);
  const subjGrid = h(`<div class="subj-chip-grid"></div>`);
  const chips = {};
  SUBJECTS.forEach(s=>{
    const chip = h(`<button type="button" class="subj-chip ${selected.has(s.id)?'active':''}"><span class="sym">${s.sym}</span>${s.name}${accBadgeHTML(accuracyFor(progress, s.id))}</button>`);
    chip.onclick = ()=>{
      if(selected.has(s.id)) selected.delete(s.id); else selected.add(s.id);
      paintChips();
    };
    chips[s.id] = chip;
    subjGrid.appendChild(chip);
  });
  c.appendChild(subjGrid);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12px; margin:-12px 0 18px;">O selo mostra seu % de acerto em cada assunto.</p>`));
  const [selAllBtn, selNoneBtn, selWeakBtn] = selLinks.querySelectorAll('button');
  selAllBtn.onclick = ()=>{ SUBJECTS.forEach(s=>selected.add(s.id)); paintChips(); };
  selNoneBtn.onclick = ()=>{ selected.clear(); paintChips(); };
  if(selWeakBtn) selWeakBtn.onclick = ()=>{ selected.clear(); weakIds.forEach(id=>selected.add(id)); paintChips(); };

  c.appendChild(h(`<h3 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-soft);font-weight:600;margin-bottom:8px;letter-spacing:.08em;">Dificuldade</h3>`));
  const diffRow = h(`<div class="diff-row" style="flex-wrap:wrap;"></div>`);
  PT_DIFF_MODES.forEach(([id,label])=>{
    const dAttr = PT_DIFFS.includes(id) ? id : '';
    const chip = h(`<button type="button" class="diff-chip" data-d="${dAttr}" style="flex:1 1 28%;">${label}</button>`);
    if(id===difficultyMode) chip.classList.add('active');
    chip.onclick = ()=>{
      difficultyMode = id;
      diffRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
      paintSummary();
    };
    diffRow.appendChild(chip);
  });
  c.appendChild(diffRow);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:-10px 0 18px;">"Adaptativa" começa pelo seu desempenho em cada assunto e se ajusta durante o treino: 2 acertos seguidos sobem o nível, um erro desce. "Misturada" sorteia entre as três.</p>`));

  c.appendChild(h(`<h3 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-soft);font-weight:600;margin-bottom:8px;letter-spacing:.08em;">Quantidade de questões</h3>`));
  const qtyRow = h(`<div class="diff-row"></div>`);
  PERSONALIZED_QTY_OPTIONS.forEach(n=>{
    const chip = h(`<button type="button" class="diff-chip">${n}</button>`);
    if(n===qty) chip.classList.add('active');
    chip.onclick = ()=>{
      qty = n;
      qtyRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
      paintSummary();
    };
    qtyRow.appendChild(chip);
  });
  c.appendChild(qtyRow);

  const weakToggle = h(`<button type="button" class="weak-toggle ${focusWeak?'active':''}"><span class="check">✓</span><span>Priorizar meus pontos fracos (mais questões nos assuntos onde eu mais erro)</span></button>`);
  weakToggle.onclick = ()=>{
    focusWeak = !focusWeak;
    weakToggle.classList.toggle('active', focusWeak);
  };
  c.appendChild(weakToggle);

  const summary = h(`<div class="pt-summary"></div>`);
  c.appendChild(summary);
  const errorBox = h(`<div class="authErrorBox"></div>`);
  c.appendChild(errorBox);

  const genBtn = h(`<button class="btn primary" style="width:100%;"></button>`);
  function paintSummary(){
    const n = selected.size;
    const modeLabel = PT_DIFF_MODES.find(([id])=>id===difficultyMode)[1];
    summary.innerHTML = n
      ? `📋 <b>${n}</b> assunto${n===1?'':'s'} · <b>${modeLabel}</b> · <b>${qty}</b> questões · ~${Math.max(1, Math.round(qty*0.6))} min`
      : 'Escolha pelo menos um assunto pra montar o treino.';
    genBtn.textContent = `Gerar treino (${qty} questões)`;
    genBtn.disabled = n===0;
    genBtn.style.opacity = n ? '' : '.5';
    if(n) errorBox.innerHTML = '';
  }
  function paintChips(){
    SUBJECTS.forEach(s=>chips[s.id].classList.toggle('active', selected.has(s.id)));
    paintSummary();
  }
  paintSummary();

  genBtn.onclick = ()=>{
    if(selected.size===0){
      errorBox.innerHTML = `<div class="auth-error">Escolha pelo menos um assunto.</div>`;
      return;
    }
    // mantém a ordem da lista de assuntos
    startPersonalizedSession({
      subjectIds: SUBJECTS.map(s=>s.id).filter(id=>selected.has(id)),
      difficultyMode, qty, focusWeak, progress,
    });
  };
  c.appendChild(genBtn);

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
    c.appendChild(actions);
    c.appendChild(box);
    wrap.appendChild(c);
    return wrap;
  }

  const s = SUBJECTS.find(x=>x.id===sess.currentSubjectId);
  const diffLabel = ({facil:'FÁCIL',medio:'MÉDIO',dificil:'DIFÍCIL'})[sess.difficulty] || '';

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
  const qcard = h(`<div class="question-card"><div class="qlabel">QUESTÃO ${sess.index+1} DE ${sess.total} · ${diffLabel}${sess.lvlMsg?`<span class="pt-lvl">${sess.lvlMsg}</span>`:''} · ${s.sym} ${s.name}</div><div class="qtext mono"></div></div>`);
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
    if(!val){ return; }
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
    const btn = h(`<button class="calc-key ${cls}">${label}</button>`);
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

/* ---------------- PROGRESS ---------------- */
/* ---------------- PROFILE ---------------- */
async function profileScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Perfil', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);

  const name = (currentUser && currentUser.name) ? currentUser.name : '';
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  c.appendChild(h(`
    <div class="profile-card">
      <div class="profile-avatar">${escHTML(initial)}</div>
      <div class="profile-name">${escHTML(name)}</div>
      <div class="profile-sub">Nível ${levelInfo(loadGame().xp).level} · ${levelInfo(loadGame().xp).title}</div>
    </div>`));

  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0, mastered=0;
  ids.forEach(id=>{
    totalAttempted += p[id].attempted; totalCorrect += p[id].correct;
    const acc = p[id].attempted? (p[id].correct/p[id].attempted*100) : 0;
    if(masteryOf(p[id]).lvl>=3) mastered++;
  });
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;
  const errs = await loadErrors();

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${mastered}</div><div class="lbl">Assuntos proficientes ou dominados</div></div>`));
  c.appendChild(grid);

  // menu em lista (antes era uma fileira de botões que ficava mais larga que a tela
  // e deixava a página dar zoom / arrastar pro lado)
  const menu = h(`<div class="profile-menu"></div>`);
  const item = (ico, label, sub, fn, cls)=>{
    const b = h(`<button type="button" class="pm-item ${cls||''}"><span class="pm-ico">${ico}</span><span class="pm-txt"><span class="pm-l"></span>${sub?`<span class="pm-s"></span>`:''}</span><span class="pm-chev">›</span></button>`);
    b.querySelector('.pm-l').textContent = label;
    if(sub) b.querySelector('.pm-s').textContent = sub;
    b.onclick = fn;
    menu.appendChild(b);
  };
  item('📊', 'Ver progresso detalhado', 'Acertos por assunto e histórico', ()=> go('progress'));
  item('📝', 'Relatório semanal', 'Resumo pra pais e professores', ()=> go('report'));
  if(errs.length) item('🔁', `Revisar ${errs.length} erro${errs.length===1?'':'s'}`, 'Tente de novo as questões que errou', ()=> startReviewErrors());
  item('✏️', 'Caderno', 'Suas anotações escritas à mão', ()=> go('notebook'));
  item('🏅', 'Conquistas', 'Suas medalhas e títulos', ()=> go('achievements'));
  item('📘', 'Como usar o app', 'Guia e tour guiado', ()=> go('help'));
  item('⚙️', 'Configurações', 'Tema, som, meta, senha e backup', ()=> go('settings'));
  item('🚪', 'Sair da conta', '', ()=> showConfirm({
    icon:'🚪', title:'Sair da conta?', message:'Seu progresso continua salvo neste aparelho. É só entrar de novo com seu nome e senha.',
    ok:'Sair da conta', cancel:'Cancelar', danger:true,
  }).then(ok=>{ if(ok) doLogout(); }), 'danger');
  c.appendChild(menu);

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- CONFIGURAÇÕES ---------------- */
async function settingsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Configurações', true, ()=>go('profile')));
  const c = h(`<div class="content"></div>`);

  const settings = await loadSettings();

  // --- Aparência ---
  c.appendChild(h(`<section class="block"><h3>Aparência</h3></section>`));
  const themeRow = h(`<div class="diff-row"></div>`);
  [['dark','🌙 Escuro'],['light','☀️ Claro']].forEach(([id,label])=>{
    const chip = h(`<button type="button" class="diff-chip">${label}</button>`);
    if(settings.theme===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.theme = id;
      await saveSettings();
      applyTheme(id);
      themeRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    themeRow.appendChild(chip);
  });
  c.appendChild(themeRow);

  // --- Acessibilidade ---
  c.appendChild(h(`<section class="block"><h3>Leitura e acessibilidade</h3></section>`));
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:-6px 0 8px;">Tamanho do texto das questões e explicações</p>`));
  const scaleRow = h(`<div class="diff-row"></div>`);
  [['normal','A'],['grande','A+'],['enorme','A++']].forEach(([id,label],i)=>{
    const chip = h(`<button type="button" class="diff-chip" style="font-size:${13+i*3}px" aria-label="Texto ${id}">${label}</button>`);
    if((settings.textScale||'normal')===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.textScale = id; await saveSettings(); applyTextScale(id);
      scaleRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active')); chip.classList.add('active');
    };
    scaleRow.appendChild(chip);
  });
  c.appendChild(scaleRow);
  if('speechSynthesis' in window){
    const ttsToggle = h(`<button type="button" class="weak-toggle ${settings.tts!==false?'active':''}"><span class="check">✓</span><span>🔊 Botão de ouvir as questões em voz alta</span></button>`);
    ttsToggle.onclick = async ()=>{
      settings.tts = settings.tts===false; await saveSettings();
      ttsToggle.classList.toggle('active', settings.tts);
      if(settings.tts) speak('Pronto! Agora você pode ouvir as questões.');
    };
    c.appendChild(ttsToggle);
  }

  // --- Som e vibração ---
  c.appendChild(h(`<section class="block"><h3>Som e vibração</h3></section>`));
  const soundToggle = h(`<button type="button" class="weak-toggle"><span class="check">✓</span><span>Sons ao responder</span></button>`);
  if(settings.sound) soundToggle.classList.add('active');
  soundToggle.onclick = async ()=>{
    settings.sound = !settings.sound;
    await saveSettings();
    soundToggle.classList.toggle('active', settings.sound);
    if(settings.sound) playFeedbackSound(true);
  };
  c.appendChild(soundToggle);

  const vibToggle = h(`<button type="button" class="weak-toggle"><span class="check">✓</span><span>Vibração ao responder</span></button>`);
  if(settings.vibration) vibToggle.classList.add('active');
  vibToggle.onclick = async ()=>{
    settings.vibration = !settings.vibration;
    await saveSettings();
    vibToggle.classList.toggle('active', settings.vibration);
    if(settings.vibration) playFeedbackVibration(true);
  };
  c.appendChild(vibToggle);

  // --- Estudo ---
  c.appendChild(h(`<section class="block"><h3>Estudo</h3></section>`));
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:-6px 0 8px;">Meta diária de questões</p>`));
  const goalRow = h(`<div class="diff-row"></div>`);
  [5,10,15,20,30].forEach(n=>{
    const chip = h(`<button type="button" class="diff-chip">${n}</button>`);
    if(settings.dailyGoal===n) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.dailyGoal = n;
      await saveSettings();
      goalRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    goalRow.appendChild(chip);
  });
  c.appendChild(goalRow);

  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:14px 0 8px;">Nível escolar</p>`));
  const levelRow = h(`<div class="diff-row" style="flex-wrap:wrap;"></div>`);
  [['fund1','Fundamental 1'],['fund2','Fundamental 2'],['medio','Ensino Médio']].forEach(([id,label])=>{
    const chip = h(`<button type="button" class="diff-chip" style="flex:1 1 30%;">${label}</button>`);
    if(settings.schoolLevel===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.schoolLevel = id;
      await saveSettings();
      levelRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    levelRow.appendChild(chip);
  });
  c.appendChild(levelRow);

  // --- Conta ---
  c.appendChild(h(`<section class="block" style="margin-top:22px"><h3>Conta</h3></section>`));
  const nameBox = h(`<div class="auth-field"><label>Nome</label><input type="text" class="settingsNameInput" value="${escHTML((currentUser&&currentUser.name)||'')}"></div>`);
  c.appendChild(nameBox);
  const nameErrBox = h(`<div class="authErrorBox"></div>`);
  c.appendChild(nameErrBox);
  const saveNameBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:20px;">Salvar nome</button>`);
  saveNameBtn.onclick = async ()=>{
    const newName = nameBox.querySelector('.settingsNameInput').value;
    const res = await renameCurrentUser(newName);
    if(!res.ok){ nameErrBox.innerHTML = `<div class="auth-error">${res.error}</div>`; return; }
    nameErrBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Nome atualizado!</div>`;
  };
  c.appendChild(saveNameBtn);

  c.appendChild(h(`<div class="auth-field"><label>Senha atual</label><input type="password" class="settingsCurPass"></div>`));
  const newPassField = h(`<div class="auth-field"><label>Nova senha</label><input type="password" class="settingsNewPass" autocomplete="new-password"></div>`);
  const newPassMeter = attachStrengthMeter(newPassField.querySelector('input'), ()=> currentUser ? currentUser.name : '');
  newPassField.appendChild(newPassMeter);
  c.appendChild(newPassField);
  c.appendChild(h(`<div class="auth-field"><label>Confirmar nova senha</label><input type="password" class="settingsNewPass2"></div>`));
  const passErrBox = h(`<div class="authErrorBox"></div>`);
  c.appendChild(passErrBox);
  const savePassBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:20px;">Alterar senha</button>`);
  savePassBtn.onclick = async ()=>{
    const cur = c.querySelector('.settingsCurPass').value;
    const n1 = c.querySelector('.settingsNewPass').value;
    const n2 = c.querySelector('.settingsNewPass2').value;
    if(!cur || !n1){ passErrBox.innerHTML = `<div class="auth-error">Preencha todos os campos.</div>`; return; }
    if(n1 !== n2){ passErrBox.innerHTML = `<div class="auth-error">As novas senhas não coincidem.</div>`; return; }
    const res = await changeCurrentUserPassword(cur, n1);
    if(!res.ok){ passErrBox.innerHTML = `<div class="auth-error">${res.error}</div>`; return; }
    c.querySelector('.settingsCurPass').value = '';
    c.querySelector('.settingsNewPass').value = '';
    c.querySelector('.settingsNewPass2').value = '';
    newPassMeter.refresh();
    passErrBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Senha alterada!</div>`;
  };
  c.appendChild(savePassBtn);

  // --- Dados ---
  c.appendChild(h(`<section class="block"><h3>Dados</h3></section>`));
  const exportBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:10px;">Exportar progresso</button>`);
  exportBtn.onclick = async ()=>{
    const ok = await exportProgressData();
    exportBtn.textContent = ok ? 'Exportado! ✓' : 'Não foi possível exportar';
    setTimeout(()=>{ exportBtn.textContent = 'Exportar progresso'; }, 2500);
  };
  c.appendChild(exportBtn);

  const importInput = h(`<input type="file" accept="application/json,.json" style="display:none">`);
  c.appendChild(importInput);
  const importBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:10px;">Importar progresso</button>`);
  const importMsgBox = h(`<div class="authErrorBox"></div>`);
  importBtn.onclick = ()=> importInput.click();
  importInput.onchange = async ()=>{
    const file = importInput.files[0];
    importInput.value = '';
    if(!file) return;
    const ok = await showConfirm({icon:'📥', title:'Importar progresso?', message:'Isso vai substituir seu progresso, histórico e configurações atuais pelos dados desse arquivo.', ok:'Importar', cancel:'Cancelar', danger:true});
    if(!ok) return;
    const res = await importProgressData(file);
    if(!res.ok){
      importMsgBox.innerHTML = `<div class="auth-error">${res.error}</div>`;
    } else {
      importMsgBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Progresso importado! Atualizando…</div>`;
      setTimeout(()=> go('profile'), 900);
    }
  };
  c.appendChild(importBtn);
  c.appendChild(importMsgBox);

  const resetBtn = h(`<button class="btn secondary" style="width:100%; border-color:rgba(255,92,122,.3); color:var(--coral-deep, #FF5C7A);">Resetar progresso</button>`);
  let confirmingReset = false;
  resetBtn.onclick = async ()=>{
    if(!confirmingReset){
      confirmingReset = true;
      resetBtn.textContent = 'Tem certeza? Toque de novo pra confirmar';
      return;
    }
    await resetCurrentUserProgress();
    resetBtn.textContent = 'Progresso resetado ✓';
    resetBtn.disabled = true;
  };
  c.appendChild(resetBtn);

  wrap.appendChild(c);
  return wrap;
}

async function progressScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Meu progresso', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0;
  ids.forEach(id=>{ totalAttempted += p[id].attempted; totalCorrect += p[id].correct; });
  const totalWrong = totalAttempted-totalCorrect;
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalCorrect}</div><div class="lbl">Acertos</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalWrong}</div><div class="lbl">Erros</div></div>`));
  c.appendChild(grid);
  const reportBtn = h(`<button type="button" class="alert-banner" style="margin:0 0 16px"><span class="sym">📝</span><span class="txt"><span class="title">Relatório semanal</span><span class="sub">Resumo dos últimos 7 dias pra pais e professores</span></span><span class="chev">›</span></button>`);
  reportBtn.onclick = ()=> go('report');
  c.appendChild(reportBtn);

  c.appendChild(h(`<section class="block"><h3>Assuntos praticados</h3></section>`));
  if(ids.length===0){
    c.appendChild(h(`<div class="empty-note">Você ainda não praticou nenhum exercício.<br>Vá em "Exercícios" para começar! 🚀</div>`));
  } else {
    ids.forEach(id=>{
      const s = SUBJECTS.find(x=>x.id===id);
      if(!s) return;
      const d = p[id];
      const acc = d.attempted? Math.round(d.correct/d.attempted*100) : 0;
      const mst = masteryOf(d);
      const barCls = acc>=80? '' : acc>=50? 'mid':'low';
      const row = h(`
        <div class="mastery-row">
          <div class="top">
            <span class="name">${s.sym} &nbsp;${s.name} ${masteryChip(mst)}</span>
            <span class="pct">${acc}%</span>
          </div>
          <div class="bar-track"><div class="bar-fill ${barCls}" style="width:${acc}%"></div></div>
        </div>`);
      c.appendChild(row);
    });
  }

  if(totalAttempted>0){
    const histBtn = h(`<button class="btn secondary" style="margin-top:6px;width:100%;">Ver histórico de questões respondidas</button>`);
    histBtn.onclick = ()=> go('history');
    c.appendChild(histBtn);
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- HISTÓRICO DE QUESTÕES RESPONDIDAS ---------------- */
function formatHistoryDate(ts){
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const sameDay = d.toDateString() === now.toDateString();
  if(sameDay) return `Hoje, ${time}`;
  const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
  if(d.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
  return `${d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}, ${time}`;
}
function historyQuestionText(ex){
  if(!ex) return '';
  if(ex.question) return ex.question.replace(/\n/g,' ');
  return ''; // questões em formato visual (conta armada, fração, etc.) não têm um texto plano curto
}
async function historyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Histórico', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);

  const hist = await loadHistory();
  if(!hist.length){
    c.appendChild(h(`<div class="empty-note">Você ainda não respondeu nenhuma questão.<br>Assim que praticar, suas respostas aparecem aqui. 📝</div>`));
    wrap.appendChild(c);
    return wrap;
  }

  const totalCorrect = hist.filter(e=>e.correct).length;
  const pct = Math.round(totalCorrect/hist.length*100);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:13.5px; margin:2px 0 16px;">${hist.length} questões respondidas (últimas ${HISTORY_LIMIT}) · ${pct}% de acerto</p>`));

  const list = h(`<div class="history-list"></div>`);
  c.appendChild(list);
  const moreBtn = h(`<button class="btn secondary" style="margin-top:4px;width:100%;">Ver mais</button>`);
  c.appendChild(moreBtn);

  const PAGE = 30;
  let shown = 0;
  const diffLabels = {facil:'Fácil', medio:'Médio', dificil:'Difícil'};
  function renderPage(){
    hist.slice(shown, shown+PAGE).forEach(entry=>{
      const qtxt = historyQuestionText(entry.ex);
      const row = h(`
        <div class="history-row ${entry.correct?'ok':'bad'}">
          <div class="history-icon">${entry.correct? '✓':'✕'}</div>
          <div class="history-info">
            <div class="history-top">
              <span class="subj">${entry.subjectName}</span>
              ${entry.difficulty? `<span class="diff">${diffLabels[entry.difficulty]||entry.difficulty}</span>`:''}
              ${entry.review? `<span class="diff">Revisão</span>`:''}
            </div>
            ${qtxt? `<div class="history-q">${qtxt}</div>` : ''}
            <div class="history-date">${formatHistoryDate(entry.ts)}</div>
          </div>
        </div>`);
      list.appendChild(row);
    });
    shown += Math.min(PAGE, hist.length-shown);
    moreBtn.style.display = shown < hist.length ? '' : 'none';
  }
  moreBtn.onclick = renderPage;
  renderPage();

  wrap.appendChild(c);
  return wrap;
}
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
];
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
   - g.days guarda o histórico recente: 1 = jogou, 'f' = protegido por um protetor 🧊
   - protetores (máx. STREAK_FREEZE_MAX) são gastos sozinhos quando a pessoa
     pula dia(s); se não houver protetores suficientes, a ofensiva zera
   - marcos (3, 7, 14, 30...) dão moedas e uma comemoração */
const STREAK_FREEZE_MAX = 2, STREAK_FREEZE_COST = 50, STREAK_DAYS_KEEP = 70;
const STREAK_MILESTONES = [[3,10],[7,25],[14,40],[30,75],[50,100],[100,200],[200,300],[365,500]];
function keyToDate(k){ const [y,m,d] = String(k).split('-').map(Number); return new Date(y, m-1, d); }
function dayDiff(a, b){ return Math.round((keyToDate(b) - keyToDate(a)) / 864e5); } // b - a, em dias
function dayShift(n){ const d = new Date(); d.setDate(d.getDate()+n); return dayKey(d); }
/* ofensiva "viva" a partir dos dados salvos, sem alterar nada (serve pra outras contas também) */
function streakFromData(g){
  if(!g || !g.lastDay || !g.streak) return 0;
  const gap = dayDiff(g.lastDay, dayKey());
  if(gap<=1) return g.streak;
  return (g.freezes||0) >= gap-1 ? g.streak : 0;
}
/* ao abrir o jogo: cobre dias pulados com protetores ou zera a ofensiva */
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
  if(g.freezes===undefined) g.freezes = 1; // todo mundo começa com 1 protetor de presente
  if(g.bestStreak===undefined) g.bestStreak = g.streak||0;
  if(!g.lastDay || !g.streak) return;
  const gap = dayDiff(g.lastDay, dayKey());
  if(gap<=1) return;
  const missed = gap-1;
  if(g.freezes >= missed){
    for(let i=1; i<=missed; i++) g.days[dayShift(-i)] = 'f';
    g.freezes -= missed;
    g.lastDay = dayShift(-1);
    g.streakNote = {type:'freeze', n:missed, streak:g.streak};
  } else {
    g.streakNote = {type:'lost', streak:g.streak};
    g.streak = 0;
  }
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
/* ofensiva: vale se jogou hoje ou ontem (ou se os protetores cobrem o intervalo); senão 0 */
function gameStreakNow(){ return streakFromData(loadGame()); }
function playedToday(){ return loadGame().lastDay===dayKey(); }
function buyStreakFreeze(){
  const g = loadGame(); heartsNow();
  if(g.freezes >= STREAK_FREEZE_MAX || g.gems < STREAK_FREEZE_COST) return false;
  g.gems -= STREAK_FREEZE_COST; g.freezes++;
  saveGame(); playTones([523,784,1047], 0.08, 'triangle', 0.1);
  return true;
}
/* avisos pendentes (protetor usado / ofensiva perdida), mostrados uma vez */
function showStreakNote(){
  const g = loadGame(), n = g.streakNote;
  if(!n) return;
  delete g.streakNote; saveGame();
  if(n.type==='freeze') queueToast('🧊', n.n===1 ? 'Protetor usado!' : `${n.n} protetores usados!`, `Sua ofensiva de ${n.streak} dia${n.streak===1?'':'s'} foi salva`);
  else if(n.streak>=2) queueToast('💔', 'A ofensiva apagou', `Você tinha ${n.streak} dias. Jogue hoje pra acender de novo!`);
}
/* painel da ofensiva: dias da semana, recorde, próximo marco e protetores */
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
      : streak ? 'Responda 1 pergunta hoje pra não perder sua ofensiva!'
      : 'Responda 1 pergunta pra acender sua ofensiva!'}</p>
    <div class="sk-week">${week}</div>
    <div class="sk-stats">
      <div><b>🏆 ${g.bestStreak||0}</b><span>recorde</span></div>
      <div><b>🧊 <i class="sk-fz">${g.freezes}</i>/${STREAK_FREEZE_MAX}</b><span>protetores</span></div>
    </div>
    ${next ? `<div class="sk-goal"><div class="sk-goal-t">Próximo marco: <b>${next[0]} dias</b> · +${next[1]} 🪙</div><div class="sk-bar"><i style="width:${pct}%"></i></div><small>faltam ${next[0]-streak} dia${next[0]-streak===1?'':'s'}</small></div>` : ''}
    <p class="sk-help">O protetor 🧊 salva sua ofensiva sozinho se você ficar um dia sem jogar.</p>
    <button type="button" class="sk-buy"></button>
    <button type="button" class="sk-close" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Fechar</button>
  </div>`;
  const buy = bg.querySelector('.sk-buy');
  function paintBuy(){
    const full = g.freezes >= STREAK_FREEZE_MAX, gems = gemsNow();
    buy.disabled = full || gems < STREAK_FREEZE_COST;
    buy.textContent = full ? 'Protetores no máximo 🧊' : `Comprar protetor 🧊 por ${STREAK_FREEZE_COST} 🪙 (você tem ${gems})`;
    bg.querySelector('.sk-fz').textContent = g.freezes;
  }
  paintBuy();
  let bought = false;
  buy.onclick = ()=>{ if(buyStreakFreeze()){ bought = true; paintBuy(); showFloat('+1 protetor 🧊'); } };
  // só redesenha a tela se as moedas mudaram (e só nas telas que mostram moedas/ofensiva)
  const close = ()=>{ bg.remove(); if(bought && ['home','path','achievements'].includes(state.screen)) render(); };
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
    const inLesson = sess && (sess.kind==='lesson' || sess.kind==='quiz');
    if(!inLesson) showFloat(`+${gain} XP${combo>=2? ` · 🔥x${combo}`:''}`);
    if(combo>=3) playComboSound(combo);
  } else if(prevCombo>=2 && !(sess && (sess.kind==='lesson' || sess.kind==='quiz'))){
    showFloat('Combo perdido 💔', true);
  }
  const goal = (currentSettingsSync().dailyGoal)||10;
  if(g.today.answered>=goal) gameUnlock('goal');
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

/* ---------- sons (Web Audio, sem arquivos) ---------- */
function playTones(freqs, step, type, vol){
  if(!currentSettingsSync().sound) return;
  try{
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx, t0 = ctx.currentTime;
    freqs.forEach((f,i)=>{
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type || 'sine';
      osc.frequency.value = f;
      const s = t0 + i*step;
      gain.gain.setValueAtTime(0.0001, s);
      gain.gain.exponentialRampToValueAtTime(vol || 0.14, s+0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, s+step+0.18);
      osc.start(s); osc.stop(s+step+0.2);
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

/* =========================================================
   Modo Relâmpago — 60 segundos, múltipla escolha, contas rápidas.
   Cada acerto vale 1 ponto (+1s); erro tira 3s. Fica mais difícil
   conforme a pontuação sobe.
   ========================================================= */
const BOLT_SECONDS = 60;
function boltQuestion(score){
  const tier = score<5 ? 0 : score<12 ? 1 : score<20 ? 2 : 3;
  const ops = tier===0 ? ['+','−'] : tier===1 ? ['+','−','×'] : ['+','−','×','÷'];
  const op = pick(ops);
  const M = [10,20,50,100][tier], T = [5,9,12,15][tier];
  let a, b, ans;
  if(op==='+'){ a=randInt(1,M); b=randInt(1,M); ans=a+b; }
  else if(op==='−'){ a=randInt(2,M); b=randInt(1,a); ans=a-b; }
  else if(op==='×'){ a=randInt(2,T); b=randInt(2,T); ans=a*b; }
  else { b=randInt(2,T); ans=randInt(2,T); a=b*ans; }
  const opts = new Set([ans]);
  let guard = 0;
  while(opts.size<4 && guard++<50){
    const delta = pick([1,2,3,5,10,b,-1,-2,-3,-5,-10,-b]);
    const v = ans + delta;
    if(v>=0) opts.add(v);
  }
  while(opts.size<4) opts.add(ans+opts.size*7);
  return {text:`${a} ${op} ${b}`, ans, opts:[...opts].sort(()=>Math.random()-.5)};
}
function lightningScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚡ Modo Relâmpago', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const g = loadGame();

  function intro(){
    c.innerHTML = '';
    const box = h(`
      <div class="lt-start">
        <div class="big">⚡</div>
        <h2 style="font-size:26px;margin:14px 0 4px">Modo Relâmpago</h2>
        <p style="color:var(--ink-soft);margin:0">Recorde: <b style="color:#E0A000">${g.boltBest} pontos</b></p>
        <div class="lt-rules">⏱️ Você tem <b>${BOLT_SECONDS} segundos</b><br>✅ Acertou: <b>+1 ponto</b> e <b>+1s</b><br>❌ Errou: <b>−3 segundos</b><br>📈 Fica mais difícil a cada acerto!</div>
        <button class="btn primary" style="width:100%;padding:16px;font-size:16px">Começar! 🚀</button>
      </div>`);
    box.querySelector('button').onclick = countdown;
    c.appendChild(box);
  }
  function countdown(){
    let n = 3;
    const tick = ()=>{
      if(!wrap.isConnected) return;
      c.innerHTML = '';
      c.appendChild(h(`<div class="lt-count">${n>0?n:'VAI!'}</div>`));
      playTones([n>0?440:880], 0.12, 'square', 0.06);
      if(n-- > 0) setTimeout(tick, 700); else setTimeout(play, 500);
    };
    tick();
  }
  function play(){
    if(!wrap.isConnected) return;
    let timeLeft = BOLT_SECONDS, score = 0, streak = 0, q = boltQuestion(0), locked = false;
    c.innerHTML = '';
    const top = h(`<div class="lt-top"><span class="lt-timer">⏱ ${timeLeft}s</span><span class="lt-score">⭐ 0</span></div>`);
    const bar = h(`<div class="lt-bar"><i style="width:100%"></i></div>`);
    const qEl = h(`<div class="lt-q"></div>`);
    const optsEl = h(`<div class="lt-opts"></div>`);
    const streakEl = h(`<div class="lt-streak"></div>`);
    c.appendChild(top); c.appendChild(bar); c.appendChild(qEl); c.appendChild(optsEl); c.appendChild(streakEl);
    function paintTime(){
      const t = top.querySelector('.lt-timer');
      t.textContent = `⏱ ${Math.max(0,Math.ceil(timeLeft))}s`;
      t.classList.toggle('low', timeLeft<=10);
      bar.querySelector('i').style.width = Math.max(0, Math.min(100, timeLeft/BOLT_SECONDS*100))+'%';
    }
    function paintQ(){
      qEl.textContent = q.text + ' = ?';
      optsEl.innerHTML = '';
      q.opts.forEach(v=>{
        const b = h(`<button type="button" class="lt-opt">${v}</button>`);
        b.onclick = ()=> answer(v);
        optsEl.appendChild(b);
      });
    }
    function answer(v){
      if(locked) return;
      const ok = v===q.ans;
      qEl.classList.remove('ok','bad'); void qEl.offsetWidth;
      qEl.classList.add(ok?'ok':'bad');
      if(ok){
        score++; streak++; timeLeft += 1;
        playTones([660+Math.min(streak,12)*30, 990+Math.min(streak,12)*30], 0.05, 'triangle', 0.07);
        playFeedbackVibration(true);
      } else {
        streak = 0; timeLeft -= 3;
        playFeedbackSound(false); playFeedbackVibration(false);
      }
      top.querySelector('.lt-score').textContent = `⭐ ${score}`;
      streakEl.textContent = streak>=3 ? `🔥 ${streak} seguidos!` : '';
      paintTime();
      q = boltQuestion(score);
      paintQ();
    }
    paintTime(); paintQ();
    const timer = setInterval(()=>{
      if(!wrap.isConnected){ clearInterval(timer); return; }
      timeLeft -= 0.25;
      paintTime();
      if(timeLeft<=0){ clearInterval(timer); locked = true; finish(score); }
    }, 250);
  }
  function finish(score){
    const gg = loadGame();
    gameTouchDay();
    gg.today.bolts++;
    const record = score > gg.boltBest;
    if(record) gg.boltBest = score;
    const gain = score*3 + (record && score>0 ? 20 : 0);
    if(score>=15) gameUnlock('bolt15');
    if(score>=30) gameUnlock('bolt30');
    if(gain) gameAddXP(gain);
    saveGame();
    if(record && score>0) launchConfetti(160);
    playTones(record ? [523,659,784,1047,1319] : [523,659,784], 0.12, 'triangle', 0.09);
    c.innerHTML = '';
    const end = h(`
      <div class="session-end">
        <div class="gm-stars" style="font-size:58px">${record && score>0 ? '🏆' : score>=10 ? '⚡' : '⏱️'}</div>
        <div class="gm-end-title">${record && score>0 ? 'NOVO RECORDE!' : 'Tempo esgotado!'}</div>
        <div class="big-num">${score} pts</div>
        <p>Seu recorde: ${gg.boltBest} pontos</p>
        <div class="gm-rewards"><span>⭐ +${gain} XP</span></div>
      </div>`);
    c.appendChild(end);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    const again = h(`<button class="btn primary">Jogar de novo ⚡</button>`);
    again.onclick = countdown;
    const home = h(`<button class="btn secondary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(again); actions.appendChild(home);
    c.appendChild(actions);
  }
  intro();
  return wrap;
}

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
const PATH_OFFSETS = [0, 48, 76, 48, 0, -48, -76, -48];
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

/* ---------- mascote: Pi, o apresentador do show (cartola + gravata-borboleta) ---------- */
let _mascotSeq = 0;
function mascotSVG(mood, size){
  mood = mood || 'happy'; size = size || 88;
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
    <g transform="rotate(-8 50 30)">
      <ellipse cx="50" cy="32" rx="25" ry="5" fill="url(#${id}h)"/>
      <rect x="36" y="6" width="28" height="26" rx="4" fill="url(#${id}h)"/>
      <rect x="36" y="23" width="28" height="5" fill="#B23FE0"/>
      <text x="50" y="20" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="13" fill="#FFB800">π</text>
    </g>
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
function startQuiz(difficulty){
  const sess = {kind:'quiz', diff:difficulty, needed:QUIZ_TOTAL, asked:0, cleared:0, correct:0, wrong:0, score:0, qStreak:0, combo:0, xp:0,
    selected:null, checked:false, wasCorrect:null, startTs:Date.now(), lastSignature:null, lastPoints:0};
  const subj = pick(SUBJECTS);
  sess.subjectId = subj.id;
  sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
  state.session = sess;
  go('lesson');
}
function lessonAdvance(sess){
  sess.selected = null; sess.checked = false; sess.wasCorrect = null; sess.tryAgain = false;
  if(sess.kind==='quiz'){
    if(sess.asked >= sess.needed){ sess.finished = true; return; }
    sess.subjectId = pick(SUBJECTS).id;
    sess.q = newLessonQuestion(sess); sess.asked++; sess.qStart = Date.now();
    return;
  }
  if(sess.maxWrong!==null && sess.wrong > sess.maxWrong){ sess.failed = true; return; }
  if(sess.cleared >= sess.needed){ sess.finished = true; return; }
  const newLeft = sess.needed - sess.cleared - sess.retry.length;
  if(newLeft > 0){ sess.q = newLessonQuestion(sess); sess.asked++; }
  else { const q = sess.retry.shift(); q.opts = buildOptions(q.ex); q.retry = true; sess.q = q; }
}

/* ---------- tela da fase / quiz ---------- */
function lessonScreen(){
  const sess = state.session;
  const wrap = document.createElement('div');
  wrap.className = 'lesson-wrap';
  if(!sess || (sess.kind!=='lesson' && sess.kind!=='quiz')){ setTimeout(()=>go('home'),0); return wrap; }
  const isQuiz = sess.kind==='quiz';
  if(sess.finished || sess.failed){ lessonEnd(wrap, sess); return wrap; }

  const exitTo = isQuiz ? 'quizSetup' : 'path';
  const top = h(`<div class="lesson-top"><button class="lesson-x" aria-label="Sair">✕</button><div class="lesson-prog"><i style="width:${Math.round((isQuiz? (sess.asked-1+(sess.checked?1:0)) : sess.cleared)/sess.needed*100)}%"></i></div>${
    isQuiz ? `<span class="lesson-score">🏅 ${sess.score}</span>` : sess.maxWrong!==null ? `<span class="lesson-hearts">🛡️ ${Math.max(0,sess.maxWrong+1-sess.wrong)}</span>` : `<span class="lesson-hearts">❤️ ${heartsNow()}</span>`
  }</div>`);
  top.querySelector('.lesson-x').onclick = ()=>{
    showConfirm({
      icon:'🚪', title: isQuiz ? 'Sair do quiz?' : 'Sair da fase?',
      message: isQuiz ? 'Sua pontuação desta partida será perdida.' : 'Você vai perder o progresso desta fase.',
      ok:'Sair', cancel: isQuiz ? 'Continuar jogando' : 'Continuar a fase', danger:true,
    }).then(ok=>{ if(ok) go(exitTo); });
  };
  wrap.appendChild(top);
  const c = h(`<div class="content lesson-body"></div>`);
  wrap.appendChild(c);

  const q = sess.q, ex = q.ex;
  const subj = SUBJECTS.find(s=>s.id===q.subjectId);
  if(isQuiz){
    const meta = h(`<div class="quiz-meta"><div class="qm-t">PERGUNTA ${sess.asked} DE ${sess.needed}<br>${subj.sym} ${subj.name}</div>
      <div class="quiz-ring"><svg viewBox="0 0 58 58"><defs><linearGradient id="qr-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C7DFF"/><stop offset="1" stop-color="#B23FE0"/></linearGradient></defs>
      <circle class="trk" cx="29" cy="29" r="25" fill="none" stroke-width="6"/><circle class="bar" cx="29" cy="29" r="25" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="157.08"/></svg><span></span></div></div>`);
    c.appendChild(meta);
    const tb = meta.querySelector('.quiz-ring');
    const paint = ()=>{
      const left = sess.checked ? (sess.timeLeft||0) : Math.max(0, QUIZ_SECONDS - (Date.now()-sess.qStart)/1000);
      tb.querySelector('.bar').style.strokeDashoffset = 157.08*(1 - left/QUIZ_SECONDS);
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
    const isOut = !isQuiz && (q.out||[]).includes(i);
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
      ? (ok ? `+${sess.lastPoints} pontos!${sess.qStreak>=2?` 🔥 ${sess.qStreak} seguidas`:''}` : (sess.selected===null ? '⏰ Tempo esgotado!' : 'Não foi dessa vez!'))
      : (ok ? (q.missed ? pick(['Isso aí, conseguiu! 💪','Acertou! Persistência é tudo! 🌟','Boa! Não desistiu! 👏']) : pick(['Aplausos! 👏','Na mosca! 🎯','Show de bola!','Brilhou! ✨','Que talento! 🌟'])) : 'Quase! A resposta era:');
    const sheet = h(`
      <div class="fb-sheet ${ok?'ok':'bad'}">
        <div class="fb-head"><span class="fb-ico">${ok?'👏':'🤔'}</span><div><div class="fb-t">${praise}</div>${!ok || isQuiz ? `<div class="fb-ans mono"></div>`:''}</div></div>
        <button type="button" class="fb-why">📖 Ver explicação</button>
        <div class="fb-steps" style="display:none"></div>
        <button class="show-btn ${ok?'ok':'bad'}">PRÓXIMA ›</button>
      </div>`);
    const ansEl = sheet.querySelector('.fb-ans');
    if(ansEl) ansEl.textContent = ok ? `Resposta: ${answerLabel(ex)}` : answerLabel(ex);
    sheet.querySelector('.fb-steps').innerHTML = solutionHTML(ex);
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
    const left = Math.max(0, QUIZ_SECONDS - (Date.now()-sess.qStart)/1000);
    sess.timeLeft = left;
    if(ok){ sess.qStreak++; sess.lastPoints = Math.round(500 + 500*left/QUIZ_SECONDS) + Math.min(sess.qStreak-1,5)*100; sess.score += sess.lastPoints; sess.correct++; }
    else { sess.qStreak = 0; sess.lastPoints = 0; sess.wrong++; }
    sess.cleared++;
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
      sess.record = sess.score > (g.quizBest[sess.diff]||0);
      if(sess.record) g.quizBest[sess.diff] = sess.score;
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
  if(isQuiz) c.appendChild(h(`<p class="le-sub">Recorde no ${({facil:'fácil',medio:'médio',dificil:'difícil'})[sess.diff]}: ${(g.quizBest[sess.diff]||0).toLocaleString('pt-BR')} pontos</p>`));
  const foot = h(`<div class="lesson-footer static"></div>`);
  const cont = h(`<button class="show-btn">CONTINUAR</button>`);
  cont.onclick = ()=> go(isQuiz ? 'quizSetup' : 'path');
  foot.appendChild(cont);
  if(isQuiz){
    const again = h(`<button class="show-btn ghost">JOGAR DE NOVO</button>`);
    again.onclick = ()=> startQuiz(sess.diff);
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
  bar.querySelector('.heart').onclick = ()=>{ if(heartsNow()<HEARTS_MAX) showNoHearts(); };
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
      <button class="show-btn light">${cur===0 ? '▶ COMEÇAR O SHOW' : '▶ CONTINUAR'}</button>
    </div>
    <div>${mascotSVG('joy', 86)}</div>
  </div>`);
  el.querySelector('button').onclick = ()=> go('path');
  return el;
}
function gameDuo(){
  const g = loadGame(); const qb = g.quizBest || {};
  const best = Math.max(0, ...Object.values(qb));
  const el = h(`<div class="game-duo">
    <button type="button" class="game-card quiz"><span class="gc-best">🏆 ${best.toLocaleString('pt-BR')}</span><div class="gc-ico">🎤</div><div class="gc-t">Quiz do Show</div><div class="gc-s">Responda rápido, ganhe mais pontos!</div></button>
    <button type="button" class="game-card bolt"><span class="gc-best">🏆 ${g.boltBest}</span><div class="gc-ico">⚡</div><div class="gc-t">Relâmpago</div><div class="gc-s">60 segundos de contas sem parar!</div></button>
  </div>`);
  el.querySelector('.quiz').onclick = ()=> go('quizSetup');
  el.querySelector('.bolt').onclick = ()=> go('lightning');
  return el;
}

/* ---------- tela da trilha ---------- */
function pathScreen(){
  const wrap = document.createElement('div');
  const bar = topbar('Trilha', true, ()=>go('home'));
  bar.appendChild(statusPills());
  bar.classList.add('sticky-top');
  wrap.appendChild(bar);
  const c = h(`<div class="content path"></div>`);
  wrap.appendChild(c);
  const done = pathDone();
  const all = allPathNodes();
  const cur = pathCurrentIndex();
  let currentEl = null;
  SUBJECTS.forEach((s,u)=>{
    const color = unitStyle(u);
    const unitNodes = all.filter(n=>n.unit===u);
    const unitLocked = all.indexOf(unitNodes[0]) > cur;
    const unitDone = unitNodes.every(n=>done[n.key]);
    const banner = h(`<div class="unit-banner" style="${color}">
      <div><div class="u-k">EPISÓDIO ${u+1}${unitDone?' · ✓ CONCLUÍDO':''}</div><div class="u-n">${s.name}</div></div>
      <button type="button" class="u-guide" title="Ver conteúdo" aria-label="Ver conteúdo de ${s.name}">📖</button></div>`);
    banner.querySelector('.u-guide').onclick = ()=> go('subjectDetail', {subjectId:s.id});
    if(unitLocked){
      const jump = h(`<button type="button" class="u-jump">Pular pra cá ⏩</button>`);
      jump.onclick = ()=>{
        showConfirm({icon:'⏩', title:'Teste de nivelamento', message:`Acerte 6 questões de ${s.name} errando no máximo 2 para liberar este episódio. Vamos?`, ok:'Fazer o teste', cancel:'Agora não'})
          .then(ok=>{ if(ok) startPathLesson(unitNodes[0], true); });
      };
      banner.appendChild(jump);
    }
    c.appendChild(banner);
    const col = h(`<div class="path-col"></div>`);
    unitNodes.forEach(n=>{
      const gi = all.indexOf(n);
      const isDone = !!done[n.key], isCur = gi===cur, locked = gi>cur;
      const ico = locked ? '🔒' : n.type==='chest' ? (isDone?'✨':'🎁') : n.type==='trophy' ? '🎤' : (isDone?'✓':'★');
      const wrapN = h(`<div class="pnode-wrap ${isCur?'is-cur':''}" style="transform:translateX(${PATH_OFFSETS[gi % PATH_OFFSETS.length]}px)"></div>`);
      const btn = h(`<button type="button" class="pnode ${n.type} ${isDone?'done':''} ${isCur?'cur':''} ${locked?'locked':''}" style="${color}" aria-label="${n.label}">${ico}</button>`);
      if(isCur) wrapN.appendChild(h(`<div class="pnode-tip">${n.type==='chest'?'🎁 ABRIR':'▶ JOGAR'}</div>`));
      wrapN.appendChild(btn);
      if(n.idx===2 && u%2===0){
        const off = PATH_OFFSETS[gi % PATH_OFFSETS.length];
        wrapN.appendChild(h(`<div class="path-mascot" style="${off>0?'right:auto;left:-104px':''}">${mascotSVG(isDone?'joy':'happy',70)}</div>`));
      }
      btn.onclick = ()=>{
        if(locked){ showFloat('🔒 Complete as fases anteriores', true); return; }
        if(n.type==='chest') openChest(n, isDone);
        else nodeSheet(n, color, isDone);
      };
      col.appendChild(wrapN);
      if(isCur) currentEl = wrapN;
    });
    c.appendChild(col);
  });
  if(cur>=all.length) c.appendChild(mascotBubble('Você completou todos os episódios! Você é a estrela do show! 🌟', 'joy'));
  if(currentEl) setTimeout(()=>{ try{ currentEl.scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){} }, 120);
  return wrap;
}
function nodeSheet(n, color, isDone){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  const q = n.type==='trophy' ? 8 : n.n;
  bg.innerHTML = `<div class="node-sheet" style="${color}">
    <div class="ns-k">${n.subject.sym} ${n.subject.name}</div>
    <h3>${n.label}</h3>
    <p>${isDone ? 'Você já completou — praticar de novo dá mais XP!' : `${q} perguntas de múltipla escolha. Errou? Tente de novo até acertar — e peça uma dica se precisar. 💡`}</p>
    <button class="show-btn light">${isDone?'PRATICAR DE NOVO':'COMEÇAR'} +XP</button>
  </div>`;
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  bg.querySelector('button').onclick = ()=>{ bg.remove(); startPathLesson(n, false); };
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
  wrap.appendChild(topbar('🎤 Quiz do Show', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const g = loadGame(); const best = g.quizBest || {};
  c.appendChild(h(`<div class="quiz-hero"><span class="beam l"></span><span class="beam r"></span><div class="mic">🎤</div><h2>Quiz do Show</h2><p>${QUIZ_TOTAL} perguntas de todos os assuntos. Você tem <b>${QUIZ_SECONDS}s</b> por pergunta — quanto mais rápido, mais pontos! Acertos seguidos dão bônus. 🔥</p></div>`));
  [['facil','Fácil','🟢'],['medio','Médio','🟡'],['dificil','Difícil','🔴']].forEach(([id,label,dot])=>{
    const b = h(`<button type="button" class="quiz-level"><span class="ql-dot">${dot}</span><span class="ql-t">${label}</span><span class="ql-b">🏆 ${(best[id]||0).toLocaleString('pt-BR')}</span></button>`);
    b.onclick = ()=> startQuiz(id);
    c.appendChild(b);
  });
  wrap.appendChild(c);
  return wrap;
}

/* =========================================================
   Tutorial — tour guiado pelo Pi no primeiro acesso, dicas de
   primeira vez nas fases/quiz e a tela "Como usar".
   ========================================================= */
const TOUR_STEPS = [
  {sel:null, mood:'joy', title:'Bem-vindo ao Matemática Show! 🎬',
   text:'Eu sou o Pi, o apresentador do show! Vou te mostrar rapidinho como tudo funciona. Leva menos de 1 minuto.'},
  {sel:'.home-stats', title:'Seu nível e seus pontos',
   text:'Aqui ficam seu <b>nível</b> e sua barra de <b>XP</b>. Cada acerto dá XP e faz você subir de nível. Embaixo: 🔥 <b>ofensiva</b> (dias seguidos jogando), 🪙 <b>moedas</b>, ❤️ <b>vidas</b> e 🏅 <b>medalhas</b>. Toque em qualquer um pra ver os detalhes.'},
  {sel:'.home-continue', title:'A Trilha 🗺️',
   text:'O caminho principal! Cada assunto é um <b>episódio</b> com fases do fácil ao difícil, um prêmio surpresa e uma grande final. Complete uma fase pra liberar a próxima.'},
  {sel:'.home-quick', title:'Praticar',
   text:'🎤 <b>Quiz do Show</b>: 10 perguntas com cronômetro.<br>⚡ <b>Relâmpago</b>: 60 segundos de contas.<br>Toque em <b>Tudo</b> pra ver todas as ferramentas: desafios, tabuada, calculadora, duelo, caderno, geometria e mais.'},
  {sel:'.home-today', title:'Hoje: meta e missões 📜',
   text:'A barra mostra sua meta de questões do dia. Toque em <b>Missões</b> pra ver as missões novas de hoje e em <b>Pegar</b> pra ganhar XP extra!'},
  {sel:'.bottom-nav', title:'Menu principal',
   text:'<b>Trilha</b> leva direto pros episódios. <b>Aprender</b> tem a explicação de cada assunto com exemplos. <b>Exercícios</b> é pra treinar um assunto específico. <b>Progresso</b> mostra como você está indo.'},
  {sel:'.tut-help-btn', title:'Precisa de ajuda?',
   text:'Toque no <b>?</b> a qualquer momento pra abrir o guia "Como usar" ou rever este tour.'},
  {sel:null, mood:'joy', title:'Tudo pronto! 🌟', final:true,
   text:'Que tal começar pela primeira fase da Trilha? Errar faz parte — você pode tentar de novo e pedir uma dica sempre que precisar.'},
];
let _tourActive = false;
let _tourClose = null; // fecha o tour se a tela mudar (ex.: botão voltar do celular)
function tutorialDone(){ return !!loadGame().tutorialDone; }
function markTutorialDone(){ const g = loadGame(); g.tutorialDone = true; saveGame(); }

function startTour(){
  if(_tourActive) return;
  if(state.screen!=='home'){ go('home'); setTimeout(startTour, 400); return; }
  _tourActive = true;
  let i = 0;
  const root = document.createElement('div');
  root.className = 'tour-root';
  root.innerHTML = `<div class="tour-catch"></div><div class="tour-hole"></div><div class="tour-card"></div>`;
  document.body.appendChild(root);
  const hole = root.querySelector('.tour-hole'), card = root.querySelector('.tour-card');
  function finish(goPath, keepPending){
    _tourActive = false; _tourClose = null;
    if(!keepPending) markTutorialDone();
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place);
    root.remove();
    if(goPath) go('path');
  }
  function place(){
    const st = TOUR_STEPS[i];
    const el = st.sel ? document.querySelector(st.sel) : null;
    const vw = window.innerWidth, vh = window.innerHeight;
    if(!el){
      hole.style.cssText = `left:${vw/2}px;top:${vh/2}px;width:0;height:0;`;
      card.style.cssText = `left:50%;top:50%;transform:translate(-50%,-50%);`;
      return;
    }
    const r = el.getBoundingClientRect(), pad = 6;
    hole.style.cssText = `left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px;`;
    const ch = card.offsetHeight || 220;
    const below = r.bottom + 14, above = r.top - 14 - ch;
    let top = (below + ch <= vh - 8) ? below : (above >= 8 ? above : Math.max(8, vh - ch - 8));
    card.style.cssText = `left:50%;top:${top}px;transform:translateX(-50%);`;
  }
  function show(){
    const st = TOUR_STEPS[i];
    const el = st.sel ? document.querySelector(st.sel) : null;
    const dots = TOUR_STEPS.map((_,k)=>`<span class="${k===i?'on':''}"></span>`).join('');
    card.innerHTML = `
      <div class="tc-head">${mascotSVG(st.mood||'happy', 58)}<h3>${st.title}</h3></div>
      <p>${st.text}</p>
      <div class="tc-dots">${dots}</div>
      <div class="tc-actions">
        ${st.final
          ? `<button type="button" class="show-btn tc-go">▶ Começar primeira fase</button><button type="button" class="show-btn ghost tc-skip">Explorar sozinho</button>`
          : `${i>0?`<button type="button" class="tc-back">‹ Voltar</button>`:`<button type="button" class="tc-skip-link">Pular tour</button>`}<button type="button" class="show-btn tc-next">${i===0?'Vamos lá!':'Próximo ›'}</button>`}
      </div>`;
    const on = (s,f)=>{ const b = card.querySelector(s); if(b) b.onclick = f; };
    on('.tc-next', ()=>{ i++; show(); });
    on('.tc-back', ()=>{ i--; show(); });
    on('.tc-skip-link', ()=> finish(false));
    on('.tc-skip', ()=> finish(false));
    on('.tc-go', ()=> finish(true));
    if(el && el.getBoundingClientRect && getComputedStyle(el).position!=='fixed'){
      const r = el.getBoundingClientRect();
      if(r.top < 70 || r.bottom > window.innerHeight - 250){
        window.scrollTo({top: window.scrollY + r.top - 90, behavior:'instant'});
      }
    }
    place();
    requestAnimationFrame(place);
  }
  _tourClose = (keepPending)=> finish(false, keepPending);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, {passive:true});
  show();
}

/* dica de primeira vez: um balão do Pi que aparece uma única vez por conta */
function firstTimeTip(key, html){
  const g = loadGame();
  g.tips = g.tips || {};
  if(g.tips[key]) return null;
  const tip = h(`<div class="ft-tip">${mascotSVG('happy', 44)}<div class="ft-body">${html}</div><button type="button" class="ft-ok">Entendi</button></div>`);
  tip.querySelector('.ft-ok').onclick = ()=>{ g.tips[key] = true; saveGame(); tip.remove(); };
  return tip;
}

/* ---------- tela "Como usar" ---------- */
const HELP_TOPICS = [
  {ico:'🗺️', t:'Trilha, episódios e fases', d:'Cada assunto é um episódio com 5 etapas: Fase 1 (fácil), Fase 2 (médio), Prêmio surpresa 🎁, Fase 3 (difícil) e a Grande final 🎤. Cada fase tem perguntas de múltipla escolha: toque numa resposta e depois em <b>CONFIRMAR</b>. Se errar, a resposta <b>não</b> é revelada: a alternativa errada fica riscada e você tenta de novo (tem o botão 💡 <b>Ver dica</b>). A explicação completa aparece quando você acertar. Já sabe um assunto? Use <b>Pular pra cá ⏩</b> e faça um teste de nivelamento.'},
  {ico:'❤️', t:'Vidas e moedas', d:'Você tem 5 vidas. Errar uma pergunta da Trilha gasta uma (só o primeiro erro de cada pergunta — tentar de novo não gasta mais), e elas voltam sozinhas (1 a cada 20 minutos). Sem vidas? Recarregue com 50 🪙 moedas, ou continue treinando em Exercícios, Quiz e Relâmpago, que não gastam vidas. Você ganha moedas completando fases e abrindo prêmios.'},
  {ico:'⭐', t:'XP e níveis', d:'Todo acerto dá XP (fácil 10, médio 15, difícil 25). Acertos seguidos formam um <b>combo 🔥</b> que aumenta o XP. Junte XP pra subir de nível e ganhar títulos novos, de "Aprendiz dos Números" até "Lenda da Matemática".'},
  {ico:'🔥', t:'Ofensiva', d:'É quantos dias seguidos você jogou. Responda pelo menos uma pergunta por dia (ou jogue uma partida do Relâmpago) pra manter a chama acesa! Toque no 🔥 pra ver sua semana, seu recorde e o próximo marco: 3, 7, 14, 30 dias e além dão 🪙 moedas. O <b>protetor 🧊</b> salva sua ofensiva sozinho se você ficar um dia sem jogar (você começa com 1 e pode ter até 2; compre mais por 50 🪙).'},
  {ico:'🧠', t:'Revisão do dia', d:'O app lembra quando você praticou cada assunto. Depois de um tempo (1 dia se você ainda erra muito, até 7 dias se já domina), o assunto aparece em <b>Revisão do dia</b> na tela inicial. Revisar no momento certo é o que faz a matéria ficar na cabeça.'},
  {ico:'📝', t:'Relatório semanal', d:'Em Perfil → <b>Relatório semanal</b> você vê um resumo dos últimos 7 dias: dias estudados, questões, % de acerto, comparação com a semana anterior e sugestões. Dá pra <b>compartilhar</b> (WhatsApp, e-mail) ou <b>imprimir / salvar em PDF</b> pra mostrar a pais e professores.'},
  {ico:'👑', t:'Nível de domínio', d:'Cada assunto mostra seu nível: 🌱 Aprendendo, 📘 Praticando, ⭐ Proficiente e 👑 Dominado. Ele olha as suas <b>últimas 10 respostas</b>, então mostra o que você sabe hoje. Pra chegar em Dominado, acerte 9 de 10 com pelo menos 2 no difícil.'},
  {ico:'🔊', t:'Ouvir a questão e tamanho do texto', d:'Toque no 🔊 no canto da questão pra ouvir em voz alta. Em Configurações → <b>Leitura e acessibilidade</b> você aumenta o tamanho do texto (A, A+, A++) ou desliga o botão de ouvir.'},
  {ico:'✏️', t:'Caderno (escrever à mão)', d:'Funciona como uma mesa digitalizadora: escreva com o dedo ou com uma caneta stylus (ela sente a pressão: aperte mais pra um traço mais grosso). Com caneta, o dedo passa a só mover a página, então você pode apoiar a mão na tela. Dois dedos movem e dão zoom. Tem caneta, marca-texto, borracha, linha reta (fica reta sozinha na horizontal/vertical), retângulo, círculo, texto com símbolos (², √, π...) e papel quadriculado, pautado, pontilhado ou <b>plano cartesiano</b>. Nas questões, o botão ✏️ abre um <b>rascunho</b> pra fazer a conta à mão.'},
  {ico:'🔺', t:'Laboratório de Geometria', d:'Em Aprender → <b>Laboratório de Geometria</b>. <b>Áreas</b>: escolha a figura (quadrado, retângulo, triângulo, paralelogramo, trapézio, losango, círculo), mexa nas medidas e veja os quadradinhos de 1 cm², a área e o perímetro mudando, com a explicação de onde vem cada fórmula. <b>Sólidos</b>: cubo, paralelepípedo e cilindro com volume e área total. <b>Ângulos</b>: arraste os cantos do triângulo e veja que os ângulos sempre somam 180°.'},
  {ico:'⚔️', t:'Duelo a dois', d:'Dois jogadores no mesmo celular, frente a frente: deite o aparelho na mesa e cada um fica com metade da tela. Quem acertar primeiro leva o ponto; errou, fica travado até a próxima conta.'},
  {ico:'📜', t:'Certificados', d:'Venceu a Grande final de um episódio? Ganha um certificado com seu nome, que dá pra imprimir ou salvar em PDF. Veja em <b>Certificados</b>, na tela inicial.'},
  {ico:'💾', t:'Backup do progresso', d:'Seu progresso fica salvo só neste aparelho. De vez em quando o app lembra você de salvar uma cópia. Você também pode fazer isso quando quiser em Configurações → <b>Exportar progresso</b>, e depois restaurar com <b>Importar</b>.'},
  {ico:'📜', t:'Missões e meta do dia', d:'Todo dia aparecem missões novas na tela inicial. Quando completar uma, toque em <b>Pegar</b> pra receber o XP. A meta diária (quantas questões responder) você pode mudar ali mesmo, em "Mudar meta".'},
  {ico:'🎤', t:'Quiz do Show', d:'10 perguntas de todos os assuntos, com 20 segundos cada. Quanto mais rápido você responde certo, mais pontos ganha, e acertos seguidos dão bônus. Pra sair no meio, toque no ✕ lá em cima.'},
  {ico:'⚡', t:'Relâmpago', d:'Você tem 60 segundos pra acertar o máximo de contas. Acertou: +1 ponto e +1 segundo. Errou: perde 3 segundos. Tente bater seu recorde!'},
  {ico:'∑', t:'Aprender', d:'A explicação de cada assunto, em linguagem simples e com exemplos resolvidos passo a passo. Também dá pra abrir pelo botão 📖 de cada episódio da Trilha.'},
  {ico:'✎', t:'Exercícios, Desafios e Treino personalizado', d:'<b>Exercícios</b>: 5 questões de um assunto, você escolhe a dificuldade. <b>Desafios</b>: 10 questões misturadas. <b>Treino personalizado</b>: você escolhe os assuntos (cada um mostra seu % de acerto), a dificuldade e a quantidade; o app lembra suas últimas escolhas. No fim, veja seu desempenho por assunto e use <b>Treinar o que errei</b>. Aqui você digita a resposta (use o botão <b>/</b> pra frações).'},
  {ico:'💡', t:'Dicas e explicações', d:'Travou? Toque em "💡 Preciso de uma dica" pra lembrar o método. Depois de responder, sempre aparece a resolução passo a passo, e na Trilha é só tocar em "📖 Ver explicação".'},
  {ico:'🔁', t:'Revisar meus erros', d:'As questões que você errou ficam guardadas. Quando tiver alguma, aparece um aviso na tela inicial pra você tentar de novo. Acertou na revisão? Ela sai da lista.'},
  {ico:'?', t:'Resolver questão', d:'Digite uma conta, equação ou problema (ex.: <i>2x + 5 = 15</i> ou <i>25% de 300</i>) e o app mostra a resolução completa, passo a passo.'},
  {ico:'🏅', t:'Conquistas', d:'Medalhas que você desbloqueia jogando: combos, dias seguidos, recordes e muito mais. Veja todas na tela de Conquistas.'},
  {ico:'⚙️', t:'Perfil e configurações', d:'No Perfil (o círculo com sua inicial, lá em cima) você vê suas estatísticas. Em Configurações dá pra trocar entre tema claro e escuro, ligar/desligar som e vibração, e <b>exportar/importar</b> seu progresso pra não perder nada ao trocar de celular.'},
];
function helpScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📘 Como usar', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<div class="help-hero">${mascotSVG('joy', 84)}<div><h2>Guia do Show</h2><p>Tudo que você precisa saber pra aproveitar o Matemática Show. Toque num tópico pra abrir.</p></div></div>`));
  const tourBtn = h(`<button type="button" class="show-btn" style="margin-bottom:18px">🎬 Rever o tour guiado</button>`);
  tourBtn.onclick = ()=> startTour();
  c.appendChild(tourBtn);
  HELP_TOPICS.forEach((tp, idx)=>{
    const item = h(`<div class="help-item"><button type="button" class="hi-head"><span class="hi-ico">${tp.ico}</span><span class="hi-t">${tp.t}</span><span class="hi-chev">›</span></button><div class="hi-body">${tp.d}</div></div>`);
    item.querySelector('.hi-head').onclick = ()=> item.classList.toggle('open');
    if(idx===0) item.classList.add('open');
    c.appendChild(item);
  });
  const reset = h(`<button type="button" class="link-btn" style="margin:18px auto 0;display:block;font-size:12.5px">Mostrar de novo as dicas de primeira vez</button>`);
  reset.onclick = ()=>{ const g = loadGame(); g.tips = {}; saveGame(); showFloat('💡 Dicas reativadas!'); };
  c.appendChild(reset);
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- router table ---------------- */
const SCREENS = {
  home: homeScreen,
  content: contentScreen,
  subjectDetail: subjectDetailScreen,
  exercisesSubjects: exercisesSubjectsScreen,
  exerciseDifficulty: exerciseDifficultyScreen,
  exerciseSession: exerciseSessionScreen,
  reviewErrorsSession: reviewErrorsSessionScreen,
  challengeDifficulty: challengeDifficultyScreen,
  challengeSession: challengeSessionScreen,
  personalizedSession: personalizedSessionScreen,
  achievements: achievementsScreen,
  duel: duelScreen,
  geoLab: geoLabScreen,
  notebook: notebookScreen,
  notePage: notePageScreen,
  certificates: certificatesScreen,
  certificate: certificateScreen,
  lightning: lightningScreen,
  path: pathScreen,
  lesson: lessonScreen,
  quizSetup: quizSetupScreen,
  help: helpScreen,
  tabuada: tabuadaScreen,
  solve: solveScreen,
  calculator: calculatorScreen,
  profile: null, // async, handled specially below
  progress: null, // async, handled specially below
  history: null, // async, handled specially below
  personalizedSetup: null, // async, handled specially below
  settings: null, // async, handled specially below
  report: null, // async, handled specially below
};

// wrap async progress/profile/history screens
function renderAsyncSafe(){
  // guarda o estado atual (ex.: questão já corrigida) na entrada do histórico, senão
  // "voltar" + "avançar" restaurava a questão sem resposta e dava pra ganhar XP de novo
  if(currentUser) replaceHistoryState();
  if(_tourClose && state.screen !== 'home') _tourClose();
  app.innerHTML = '';
  if(state.screen === 'progress'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    progressScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'profile'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    profileScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'history'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    historyScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'personalizedSetup'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    personalizedSetupScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'report'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    reportScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  if(state.screen === 'settings'){
    const placeholder = h(`<div class="content" style="padding-top:40px;text-align:center;color:var(--ink-soft)">Carregando…</div>`);
    app.appendChild(placeholder);
    settingsScreen().then(el=>{ app.innerHTML=''; app.appendChild(el); app.appendChild(bottomNav()); });
    return;
  }
  const fn = SCREENS[state.screen] || homeScreen;
  app.appendChild(fn());
  if(state.screen !== 'lesson' && state.screen !== 'notePage') app.appendChild(bottomNav());
}
render = renderAsyncSafe;

boot();
