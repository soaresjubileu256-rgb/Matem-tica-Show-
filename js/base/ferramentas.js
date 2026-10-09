/* =========================================================
   Matemática Show — FERRAMENTAS BÁSICAS
   Contas (MMC, conta armada, divisão pela chave), frações, potências e os
   desenhos usados nas explicações e questões (stepChain, fracRow, gráficos).
   ========================================================= */

/* ---------------- logo ---------------- */
const LOGO_URI = 'img/logo.png';

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
const PLACE_SING = ['unidade','dezena','centena','milhar','dezena de milhar','centena de milhar'];
const DECIMAL_SING = ['décimo','centésimo','milésimo'];
function placeSing(col, decimalPlaces){
  if(col < decimalPlaces){ const idx = decimalPlaces - 1 - col; return DECIMAL_SING[idx] || `casa decimal ${idx+1}`; }
  return PLACE_SING[col - decimalPlaces] || `casa ${col - decimalPlaces + 1}`;
}
// "as dezenas" / "os milhares" / "os décimos" (pra montar frases como "vai 1 para as dezenas")
function placeArt(name){ return /^(unidade|dezena|centena)/.test(name) ? 'as' : 'os'; }
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
  let explained = false; // o porquê do "vai um" aparece só na primeira vez
  for(let col=0; col<maxLen; col++){
    carries[col] = carry;
    const colDigits = digitArrays.map(d => d[col] || 0);
    const sum = colDigits.reduce((a,b)=>a+b,0) + carry;
    const digit = sum % 10;
    const newCarry = Math.floor(sum/10);
    const place = placeName(col, decimalPlaces);
    const terms = colDigits.join(' + ') + (carry ? ` + ${carry} (do vai um)` : '');
    let line = `${cap1(place)}: ${terms} = ${sum}`;
    if(newCarry>0){
      const next = placeName(col+1, decimalPlaces);
      line += ` → escreve ${digit} e vai ${newCarry} para ${placeArt(next)} ${next}`;
      // na primeira vez, explica o porquê do "vai um"
      if(!explained){ explained = true; line += ` (${sum} ${place} = ${newCarry} ${newCarry===1 ? placeSing(col+1, decimalPlaces) : next} e ${digit} ${digit===1 ? placeSing(col, decimalPlaces) : place})`; }
    } else line += ` → escreve ${digit}`;
    steps.push(line);
    resultDigits.push(digit);
    carry = newCarry;
  }
  if(carry>0){ steps.push(`Ainda tem o vai ${carry}: escreve ${carry} na frente do resultado.`); resultDigits.push(carry); }
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
    const name = cap1(place), next = placeName(col+1, decimalPlaces), isLast = col===maxLen-1;
    const askTo = `${placeArt(next)==='as'?'às':'aos'} ${next}`;
    if(top < 0){
      // um 0 que precisava emprestar: ele mesmo pede à casa vizinha (vira 10), empresta 1 e fica 9
      digit = top+10-bottom;
      steps.push(`${name}: o 0 precisava emprestar 1 para a casa da direita, mas não tinha. Ele pede 1 emprestado ${askTo} (vira 10), empresta 1 e fica com 9: 9 − ${bottom} = ${digit}`);
      borrowOut = 1;
    } else if(top < bottom){
      digit = top+10-bottom;
      steps.push(`${name}: ${borrowIn ? `o ${top0} emprestou 1 e ficou ${top}, que é menor que ${bottom}` : `${top0} é menor que ${bottom}, não dá pra tirar`}. Pede 1 emprestado ${askTo}: o ${top} vira ${top+10}. ${top+10} − ${bottom} = ${digit}`);
      borrowOut = 1;
    } else {
      digit = top-bottom;
      const zero = isLast && digit===0 && col>decimalPlaces ? ' (zero à esquerda não se escreve)' : '';
      const nothing = col >= db.length; // o número de baixo não tem essa casa
      if(borrowIn) steps.push(nothing ? `${name}: o ${top0} emprestou 1 e ficou ${top}. Embaixo não tem nada pra tirar: fica ${digit}${zero}` : `${name}: o ${top0} emprestou 1 e ficou ${top}. ${top} − ${bottom} = ${digit}${zero}`);
      else steps.push(nothing ? `${name}: embaixo não tem nada pra tirar, desce o ${top0}${zero}` : `${name}: ${top0} − ${bottom} = ${digit}${zero}`);
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
  if(a < 10) return {steps:[`É uma conta da tabuada do ${m}: ${a} × ${m} = ${a*m}`, `(${a} × ${m} é o mesmo que somar o ${m}, ${a} vez${a===1?'':'es'}${a>1 && a<=5 ? `: ${Array(a).fill(m).join(' + ')} = ${a*m}` : ''})`, `Resultado: ${a*m}`], result: a*m, carries:[0]};
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
    let line = `${cap1(place)} de ${a}: ${da[col]} × ${m} = ${da[col]*m}` + (carry? `, mais ${carry} do vai um = ${prod}`:'');
    if(newCarry>0){ const next = placeName(col+1, 0); line += ` → escreve ${digit} e vai ${newCarry} para ${placeArt(next)} ${next}`; }
    else line += ` → escreve ${digit}`;
    steps.push(line);
    resultDigits.push(digit);
    carry = newCarry;
  }
  if(carry>0){ steps.push(`Ainda tem o vai ${carry}: escreve ${carry} na frente do resultado.`); resultDigits.push(carry); }
  const result = resultDigits.reverse().join('').replace(/^0+(?=\d)/,'');
  steps.push(`Resultado: ${result}`);
  return {steps, result: Number(result), carries};
}
// multiplicação longa: a × b, com b de vários dígitos — produtos parciais deslocados e somados.
function mulLongSteps(a, b){
  const bDigits = String(b).split('').reverse();
  const steps = [];
  const partials = [];
  steps.push(`Separe o ${b} em casas: ${bDigits.slice().reverse().map((ch,i)=>{ const col = bDigits.length-1-i; return `${ch} ${Number(ch)<=1 ? placeSing(col,0) : placeName(col,0)}`; }).join(', ').replace(/, ([^,]*)$/, ' e $1')}. Multiplique o ${a} por cada parte e depois some.`);
  bDigits.forEach((chStr, i)=>{
    const d = Number(chStr);
    const partial = a*d*Math.pow(10,i);
    partials.push(partial);
    if(i===0) steps.push(`1ª linha (unidades): ${a} × ${d} = ${partial}`);
    else if(d===0) steps.push(`${i+1}ª linha (${placeName(i,0)}): o algarismo é 0, então essa linha dá 0.`);
    else steps.push(`${i+1}ª linha (${placeName(i,0)}): ${a} × ${d} = ${a*d}. Como esse ${d} vale ${d*Math.pow(10,i)}, coloque ${i===1?'um 0':`${i} zeros`} no fim: ${partial}`);
  });
  steps.push(`Some as linhas: ${partials.join(' + ')} = ${a*b}`);
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
  const bStr = b<0 ? `(${nm(b)})` : `${b}`;
  const cStr = c<0 ? `(${nm(c)})` : `${c}`;
  const fourAC = 4*a*c;
  const fourACLine = fourAC<0 ? `+ ${Math.abs(fourAC)}` : `− ${fourAC}`;
  const negB = -b;
  const negBStr = negB<0 ? `(${nm(negB)})` : `${negB}`;
  const steps = [
    `Identifique os coeficientes: a = ${nm(a)}, b = ${nm(b)}, c = ${nm(c)}`,
    `Calcule o discriminante: Δ = b² − 4ac = ${bStr}² − 4×${a}×${cStr} = ${b*b} ${fourACLine} = ${nm(D)}`,
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
  steps.push(`Calcule a 1ª raiz (usando +): x' = (−b + √Δ) / 2a = (${negBStr} + ${fmt(sqrtD)}) / ${2*a} = ${nm(xPlus)}`);
  steps.push(`Calcule a 2ª raiz (usando −): x'' = (−b − √Δ) / 2a = (${negBStr} − ${fmt(sqrtD)}) / ${2*a} = ${nm(xMinus)}`);
  steps.push(`Raízes: x' = ${nm(xPlus)}  e  x'' = ${nm(xMinus)}`);
  steps.push(`Conjunto solução: S = {${nm(xPlus)}, ${nm(xMinus)}}`);
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
  const bStr = b<0 ? `(${nm(b)})` : `${b}`;
  const cStr = c<0 ? `(${nm(c)})` : `${c}`;
  const fourAC = 4*a*c;
  const fourACLine = fourAC<0 ? `+ ${Math.abs(fourAC)}` : `− ${fourAC}`;
  const negB = -b;
  const negBStr = negB<0 ? `(${nm(negB)})` : `${negB}`;
  let html = `<div class="bhaskara-card">`;
  html += `<div class="bk-row">a = ${nm(a)}, &nbsp;&nbsp; b = ${nm(b)}, &nbsp;&nbsp; c = ${nm(c)}</div>`;
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

/* divisão que não é exata, com 2 casas depois da vírgula: continua a conta juntando 0 ao resto
   e arredonda olhando a 3ª casa. Devolve {steps, answer} (answer já arredondado). */
function divDecimalSteps(a, b){
  const q0 = Math.floor(a/b); let r = a - q0*b;
  const steps = [`${b} cabe ${q0} vez${q0===1?'':'es'} em ${a} (${b} × ${q0} = ${b*q0}) e sobram ${r}.`];
  if(r===0){ steps.push(`Não sobrou nada: ${a} ÷ ${b} = ${q0}`); return {steps, answer:q0}; }
  steps.push(`Sobrou ${r}: coloque a vírgula depois do ${q0} e continue, juntando um 0 ao resto.`);
  const ds = [];
  for(let k=0; k<3; k++){
    if(r===0){ ds.push(0); continue; }
    const cur = r*10, d = Math.floor(cur/b); r = cur - d*b; ds.push(d);
    steps.push(`${['1ª','2ª','3ª'][k]} casa: ${cur} ÷ ${b} = ${d}${r ? ` e sobram ${r}` : ' e não sobra nada'} → ${q0},${ds.join('')}`);
  }
  const up = ds[2] >= 5;
  const cents = q0*100 + ds[0]*10 + ds[1] + (up ? 1 : 0), answer = cents/100;
  steps.push(`Arredonde para 2 casas olhando a 3ª (${ds[2]}): ${up ? '5 ou mais, a 2ª casa sobe 1' : 'menor que 5, a 2ª casa fica igual'} → ${fmt(answer)}`);
  return {steps, answer};
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
