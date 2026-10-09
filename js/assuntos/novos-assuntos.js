/* =========================================================
   ASSUNTOS QUE CAEM NAS PROVAS (ENEM, ETEC, vestibulares, OBMEP)
   Números primos e divisores, Grandezas e unidades, Produtos notáveis,
   Teorema de Pitágoras, Semelhança e Tales, Casa dos pombos (Fundamental)
   e Inequações, Circunferência, Polinômios, Números complexos (Ensino Médio).
   Mesmo formato dos outros assuntos: learn, examples e gen fácil/médio/difícil.
   ========================================================= */
function isPrime(n){ if(n<2) return false; for(let d=2; d*d<=n; d++) if(n%d===0) return false; return true; }
function divisorsOf(n){ const out = []; for(let d=1; d<=n; d++) if(n%d===0) out.push(d); return out; }
function primeFactorsText(n){
  const parts = []; let m = n;
  for(let p=2; p<=m; p++){ let e = 0; while(m%p===0){ m/=p; e++; } if(e) parts.push(e>1 ? `${p}${supNum(e)}` : `${p}`); }
  return parts.join(' × ');
}
function supNum(n){ return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join(''); }
/* triângulo retângulo com os lados escritos (o "?" marca o que a questão pede) */
function pitFig(lc1, lc2, lh){
  return `<svg class="geo-fig" viewBox="0 0 320 200" role="img" aria-label="Triângulo retângulo">
    <polygon points="60,170 260,170 60,40" class="geo-shape"/>
    <path d="M60 156h14v14" class="geo-mark"/>
    <text x="160" y="192" text-anchor="middle" class="geo-lbl">${lc1}</text>
    <text x="50" y="110" text-anchor="end" class="geo-lbl">${lc2}</text>
    <text x="172" y="96" text-anchor="start" class="geo-lbl geo-lbl-h">${lh}</text>
  </svg>`;
}
/* escreve um polinômio a partir dos coeficientes (do maior grau pro menor), sem "+ 0x" nem "1x" */
function polyFromCoefs(coefs){
  const deg = coefs.length-1; let out = '';
  coefs.forEach((c,i)=>{
    if(c===0) return;
    const e = deg-i, abs = Math.abs(c);
    const body = e===0 ? `${abs}` : `${abs===1?'':abs}x${e>1?supNum(e):''}`;
    out += out ? ` ${c<0?'−':'+'} ${body}` : `${c<0?'−':''}${body}`;
  });
  return out || '0';
}
const PIT_TRIPLES = [[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20],[7,24,25],[20,21,29],[15,20,25]];

SUBJECTS.push(
  /* ---------------- FUNDAMENTAL ---------------- */
  {
    id:'primos', name:'Números primos e divisores', sym:'p',
    learn:`<p>Um <b>divisor</b> de um número é outro número que divide ele <b>sem sobrar resto</b>. Os divisores de 12 são 1, 2, 3, 4, 6 e 12.</p>
    <p>Um número é <b>primo</b> quando tem <b>exatamente 2 divisores</b>: o 1 e ele mesmo. Os primeiros primos são 2, 3, 5, 7, 11, 13, 17, 19, 23, 29… O <b>1 não é primo</b> (só tem 1 divisor) e o <b>2 é o único primo par</b>.</p>
    <p><b>Como descobrir se um número é primo:</b></p>
    <ol>
      <li>Tente dividir pelos primos 2, 3, 5, 7, 11…</li>
      <li>Só precisa testar até chegar num primo que, multiplicado por ele mesmo, passe do número (para 97, basta testar até 7, porque 11 × 11 = 121).</li>
      <li>Se nenhum dividiu, o número é primo.</li>
    </ol>
    <p><b>Decomposição em fatores primos:</b> todo número maior que 1 vira uma multiplicação de primos, de um jeito só. Exemplo: 60 = 2² × 3 × 5.</p>
    <p><b>Quantos divisores tem um número?</b> Decomponha, some 1 a cada expoente e multiplique. 60 = 2² × 3¹ × 5¹ → (2+1)·(1+1)·(1+1) = 12 divisores.</p>
    <p><b>Paridade:</b> par + par = par, ímpar + ímpar = par, par + ímpar = ímpar. Ímpar × ímpar = ímpar; se tiver um fator par, o produto é par. Isso ajuda muito na OBMEP!</p>`,
    examples:[
      {title:'Exemplo 1 (divisores)', text:'Divisores de 18', steps:['Teste de 1 até 18 quem divide sem resto.', '18 ÷ 1, 18 ÷ 2, 18 ÷ 3, 18 ÷ 6, 18 ÷ 9 e 18 ÷ 18 dão exato.', 'Divisores: 1, 2, 3, 6, 9, 18 → 6 divisores.']},
      {title:'Exemplo 2 (é primo?)', text:'91 é primo?', steps:['Teste os primos até 9 (porque 11 × 11 = 121 passa de 91).', '91 ÷ 2, ÷ 3, ÷ 5 não dão exato.', '91 ÷ 7 = 13 → dá exato!', '91 = 7 × 13, então NÃO é primo.']},
      {title:'Exemplo 3 (quantidade de divisores)', text:'Quantos divisores tem 72?', steps:['Decomponha: 72 = 2³ × 3²', 'Some 1 a cada expoente: (3+1) e (2+1)', 'Multiplique: 4 × 3 = 12 divisores']},
    ],
    gen:{
      facil:()=>{ const n = pick([6,8,10,12,14,15,16,18,20,21,24,28,30,36]); const ds = divisorsOf(n);
        return mkSingle(`Quantos divisores positivos tem o número ${n}?`, ds.length, [`Teste quem divide ${n} sem sobrar resto.`, `Divisores: ${ds.join(', ')}`, `São ${ds.length} divisores.`]); },
      medio:()=>{ const a = randInt(2,40), b = a + randInt(10,25); const ps = []; for(let k=a; k<=b; k++) if(isPrime(k)) ps.push(k);
        return mkSingle(`Quantos números primos existem de ${a} até ${b} (incluindo os dois)?`, ps.length, [`Primo tem só 2 divisores: 1 e ele mesmo.`, `Testando cada número de ${a} a ${b}, os primos são: ${ps.join(', ') || 'nenhum'}`, `Total: ${ps.length}`]); },
      dificil:()=>{ const e2 = randInt(1,4), e3 = randInt(0,3), e5 = randInt(0,2); const n = 2**e2 * 3**e3 * 5**e5; const ex = [[2,e2],[3,e3],[5,e5]].filter(x=>x[1]>0); const tot = ex.reduce((m,x)=>m*(x[1]+1),1);
        return mkSingle(`Quantos divisores positivos tem o número ${fmt(n)}?`, tot, [`Decomponha em primos: ${fmt(n)} = ${primeFactorsText(n)}`, `Some 1 a cada expoente: ${ex.map(x=>`(${x[1]}+1)`).join(' · ')}`, `Multiplique: ${ex.map(x=>x[1]+1).join(' × ')} = ${tot} divisores`]); },
    }
  },
  {
    id:'unidades', name:'Grandezas, unidades e escalas', sym:'km',
    learn:`<p>Medir é comparar com uma <b>unidade</b>. Pra trocar de unidade, é só multiplicar ou dividir pelo número certo.</p>
    <p><b>Comprimento:</b> km → hm → dam → <b>m</b> → dm → cm → mm. Cada degrau pra direita, <b>× 10</b>; pra esquerda, <b>÷ 10</b>. Por isso 1 km = 1.000 m e 1 m = 100 cm.</p>
    <p><b>Massa e capacidade</b> funcionam igual: 1 kg = 1.000 g e 1 L = 1.000 mL.</p>
    <p><b>Área</b> (m²) anda de <b>100 em 100</b>: 1 m² = 10.000 cm². <b>Volume</b> (m³) anda de <b>1.000 em 1.000</b>: 1 m³ = 1.000 L e 1 dm³ = 1 L.</p>
    <p><b>Velocidade:</b> km/h ÷ 3,6 = m/s (e m/s × 3,6 = km/h). 72 km/h = 20 m/s.</p>
    <p><b>Escala</b> é a razão entre o desenho e o real. Na escala <b>1 : 50.000</b>, 1 cm no mapa vale 50.000 cm (= 500 m) de verdade.</p>
    <ol>
      <li>Multiplique a medida do mapa pelo número da escala.</li>
      <li>O resultado sai em cm: converta pra m ou km.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (comprimento)', text:'3,5 km = 3.500 m', steps:['De km pra m são 3 degraus pra direita: × 1.000', '3,5 × 1.000 = 3.500 m']},
      {title:'Exemplo 2 (escala)', text:'Escala 1 : 200.000, 3 cm no mapa', steps:['Real = 3 × 200.000 = 600.000 cm', '600.000 cm ÷ 100 = 6.000 m', '6.000 m ÷ 1.000 = 6 km']},
      {title:'Exemplo 3 (volume)', text:'Caixa d’água de 2 m³', steps:['1 m³ = 1.000 litros', '2 × 1.000 = 2.000 litros']},
    ],
    gen:{
      facil:()=>{ const t = pick([['km','m',1000],['m','cm',100],['L','mL',1000],['kg','g',1000],['m','mm',1000]]); const v = pick([1.5,2,2.5,3,3.2,4.5,0.8,0.25,7]); const r = Math.round(v*t[2]*1000)/1000;
        return mkSingle(`Quanto é ${fmt(v)} ${t[0]} em ${t[1]}?`, r, [`1 ${t[0]} = ${fmt(t[2])} ${t[1]}`, `${fmt(v)} × ${fmt(t[2])} = ${fmt(r)} ${t[1]}`]); },
      medio:()=>{ const esc = pick([10000,25000,50000,100000,200000,500000]); const cm = pick([2,3,4,5,6,8,1.5,2.5]); const km = cm*esc/100000;
        return mkSingle(`Num mapa de escala 1 : ${fmt(esc)}, uma distância de ${fmt(cm)} cm no papel vale quantos km na realidade?`, km, [`Real = ${fmt(cm)} × ${fmt(esc)} = ${fmt(cm*esc)} cm`, `cm → km: divida por 100.000 (100 cm = 1 m e 1.000 m = 1 km)`, `${fmt(cm*esc)} ÷ 100.000 = ${fmt(km)} km`]); },
      dificil:()=>{ const k = randInt(0,2);
        if(k===0){ const v = pick([36,54,72,90,108,126]); return mkSingle(`Um carro anda a ${v} km/h. Quanto é isso em m/s?`, v/3.6, [`km/h → m/s: divida por 3,6`, `(1 km = 1.000 m e 1 h = 3.600 s → 1.000/3.600 = 1/3,6)`, `${v} ÷ 3,6 = ${fmt(v/3.6)} m/s`]); }
        if(k===1){ const a = randInt(2,6), b = randInt(2,5), c = randInt(1,3); const L = a*b*c*1000; return mkSingle(`Uma piscina tem ${a} m de comprimento, ${b} m de largura e ${c} m de profundidade. Quantos litros cabem nela?`, L, [`Volume = ${a} × ${b} × ${c} = ${a*b*c} m³`, `1 m³ = 1.000 L`, `${a*b*c} × 1.000 = ${fmt(L)} L`]); }
        const m2 = pick([1.5,2,3,0.5,2.5]); return mkSingle(`Quanto é ${fmt(m2)} m² em cm²?`, m2*10000, [`Área anda de 100 em 100: 1 m = 100 cm, então 1 m² = 100 × 100 = 10.000 cm²`, `${fmt(m2)} × 10.000 = ${fmt(m2*10000)} cm²`]); },
    }
  },
  {
    id:'prodnotaveis', name:'Produtos notáveis e fatoração', sym:'(a+b)²',
    learn:`<p><b>Produtos notáveis</b> são multiplicações que aparecem tanto que vale a pena decorar o resultado:</p>
    <ol>
      <li><b>Quadrado da soma:</b> (a + b)² = a² + <b>2ab</b> + b²</li>
      <li><b>Quadrado da diferença:</b> (a − b)² = a² − <b>2ab</b> + b²</li>
      <li><b>Produto da soma pela diferença:</b> (a + b)(a − b) = a² − b²</li>
    </ol>
    <p>Cuidado: (a + b)² <b>não</b> é a² + b². Falta o termo do meio, 2ab! Teste: (3 + 2)² = 25, mas 3² + 2² = 13.</p>
    <p><b>Fatorar</b> é o caminho de volta: transformar uma soma numa multiplicação.</p>
    <ol>
      <li><b>Fator comum:</b> 6x + 9 = 3(2x + 3)</li>
      <li><b>Diferença de quadrados:</b> x² − 49 = (x + 7)(x − 7)</li>
      <li><b>Trinômio quadrado perfeito:</b> x² + 10x + 25 = (x + 5)²</li>
    </ol>
    <p><b>Truque de conta:</b> 47 × 53 = (50 − 3)(50 + 3) = 50² − 3² = 2.500 − 9 = 2.491.</p>`,
    examples:[
      {title:'Exemplo 1 (quadrado da soma)', text:'(x + 4)² = x² + 8x + 16', steps:['a = x e b = 4', 'a² = x², 2ab = 2·x·4 = 8x, b² = 16', '(x + 4)² = x² + 8x + 16']},
      {title:'Exemplo 2 (conta de cabeça)', text:'102² = 10.404', steps:['102 = 100 + 2', '(100 + 2)² = 100² + 2·100·2 + 2²', '= 10.000 + 400 + 4 = 10.404']},
      {title:'Exemplo 3 (fatoração)', text:'x² − 36 = (x + 6)(x − 6)', steps:['É diferença de quadrados: x² − 6²', 'a² − b² = (a + b)(a − b)', 'x² − 36 = (x + 6)(x − 6)']},
    ],
    gen:{
      facil:()=>{ const k = randInt(2,12), sg = pick([1,-1]);
        return mkSingle(`Desenvolvendo (x ${sg>0?'+':'−'} ${k})², qual é o número que multiplica o x (o termo do meio)?`, 2*k*sg, [`(a ${sg>0?'+':'−'} b)² = a² ${sg>0?'+':'−'} 2ab + b²`, `Termo do meio: ${sg>0?'':'−'}2 · x · ${k} = ${nm(2*k*sg)}x`, `(x ${sg>0?'+':'−'} ${k})² = x² ${sg>0?'+':'−'} ${2*k}x + ${k*k} → resposta ${nm(2*k*sg)}`]); },
      medio:()=>{ const m = pick([20,30,40,50,60,70,100]), d = randInt(1,9), a = m-d, b = m+d;
        return mkSingle(`Use (a + b)(a − b) = a² − b² para calcular ${a} × ${b}.`, a*b, [`${a} = ${m} − ${d} e ${b} = ${m} + ${d}`, `${a} × ${b} = ${m}² − ${d}²`, `= ${fmt(m*m)} − ${d*d} = ${fmt(a*b)}`]); },
      dificil:()=>{ const x = randInt(1,9), y = randInt(1,9), s = x+y, p = x*y;
        return mkSingle(`Se x + y = ${s} e x · y = ${p}, quanto vale x² + y²?`, s*s-2*p, [`(x + y)² = x² + 2xy + y²  →  x² + y² = (x + y)² − 2xy`, `x² + y² = ${s}² − 2 · ${p}`, `= ${s*s} − ${2*p} = ${s*s-2*p}`]); },
    }
  },
  {
    id:'pitagoras', name:'Teorema de Pitágoras', sym:'a²+b²',
    learn:`<p>Num <b>triângulo retângulo</b> (que tem um ângulo de 90°), o lado maior, oposto ao ângulo reto, é a <b>hipotenusa</b>. Os outros dois são os <b>catetos</b>.</p>
    <p><b>Teorema de Pitágoras:</b> o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.</p>
    <p style="text-align:center; font-size:18px"><b>hipotenusa² = cateto² + cateto²</b></p>
    <ol>
      <li><b>Achar a hipotenusa:</b> eleve os catetos ao quadrado, some e tire a raiz.</li>
      <li><b>Achar um cateto:</b> hipotenusa² menos o outro cateto², depois tire a raiz.</li>
    </ol>
    <p><b>Trios famosos</b> (decore!): 3-4-5, 5-12-13, 8-15-17, 7-24-25. Os múltiplos também valem: 6-8-10, 9-12-15…</p>
    <p><b>Onde aparece:</b> escada encostada na parede, diagonal da TV, distância em linha reta, diagonal do quadrado (lado × √2).</p>`,
    examples:[
      {title:'Exemplo 1 (hipotenusa)', text:'Catetos 6 e 8', qVisual: pitFig('6 cm','8 cm','? cm'), steps:['h² = 6² + 8²', 'h² = 36 + 64 = 100', 'h = √100 = 10 cm']},
      {title:'Exemplo 2 (cateto)', text:'Hipotenusa 13, cateto 5', qVisual: pitFig('? cm','5 cm','13 cm'), steps:['13² = 5² + x²', '169 = 25 + x²', 'x² = 144 → x = 12 cm']},
      {title:'Exemplo 3 (escada)', text:'Escada de 5 m, pé a 3 m da parede', steps:['A escada é a hipotenusa (5 m); o chão é um cateto (3 m).', 'altura² = 5² − 3² = 25 − 9 = 16', 'altura = 4 m']},
    ],
    gen:{
      facil:()=>{ const [a,b,c] = pick(PIT_TRIPLES);
        return mkSingle(`Um triângulo retângulo tem catetos ${a} cm e ${b} cm. Quanto mede a hipotenusa?`, c, [`h² = ${a}² + ${b}²`, `h² = ${a*a} + ${b*b} = ${c*c}`, `h = √${c*c} = ${c} cm`], null, geoQ('Quanto mede a hipotenusa?', pitFig(`${a} cm`, `${b} cm`, '? cm'))); },
      medio:()=>{ const [a,b,c] = pick(PIT_TRIPLES);
        return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${c} cm e um cateto mede ${a} cm. Quanto mede o outro cateto?`, b, [`${c}² = ${a}² + x²`, `${c*c} = ${a*a} + x²`, `x² = ${c*c} − ${a*a} = ${b*b}`, `x = √${b*b} = ${b} cm`], null, geoQ('Quanto mede o outro cateto?', pitFig(`${a} cm`, '? cm', `${c} cm`))); },
      dificil:()=>{ const [a,b,c] = pick(PIT_TRIPLES), k = randInt(0,1);
        if(k===0) return mkSingle(`Uma escada de ${c} m está encostada numa parede, com o pé a ${a} m da parede. A que altura ela toca a parede?`, b, [`A escada é a hipotenusa (${c} m) e a distância no chão é um cateto (${a} m).`, `altura² = ${c}² − ${a}² = ${c*c} − ${a*a} = ${b*b}`, `altura = √${b*b} = ${b} m`]);
        return mkSingle(`Uma tela retangular mede ${a} cm por ${b} cm. Quanto mede a sua diagonal?`, c, [`A diagonal divide o retângulo em dois triângulos retângulos.`, `d² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}`, `d = √${c*c} = ${c} cm`]); },
    }
  },
  {
    id:'semelhanca', name:'Semelhança e Teorema de Tales', sym:'∼',
    learn:`<p>Duas figuras são <b>semelhantes</b> quando uma é a <b>ampliação ou redução</b> da outra: mesma forma, tamanhos diferentes. Os ângulos são iguais e os lados correspondentes são <b>proporcionais</b>.</p>
    <p>A <b>razão de semelhança</b> é o número que multiplica todos os lados. Se um triângulo tem lados 3, 4, 5 e outro tem 6, 8, 10, a razão é 2.</p>
    <p><b>Como resolver:</b></p>
    <ol>
      <li>Ache dois lados <b>correspondentes</b> que você conhece (um em cada figura).</li>
      <li>Monte a proporção: lado da figura 1 / lado da figura 2 = outro lado 1 / outro lado 2.</li>
      <li>Multiplique cruzado e resolva.</li>
    </ol>
    <p><b>Teorema de Tales:</b> quando retas <b>paralelas</b> cortam duas retas transversais, os segmentos formados são proporcionais: a/b = c/d.</p>
    <p><b>Sombras:</b> no mesmo horário, objeto e sombra formam triângulos semelhantes. altura₁ / sombra₁ = altura₂ / sombra₂.</p>
    <p><b>Atenção:</b> se os lados multiplicam por k, a <b>área</b> multiplica por k² e o <b>volume</b> por k³.</p>`,
    examples:[
      {title:'Exemplo 1 (triângulos)', text:'Lados 4, 6, 8 e o maior do outro é 12', steps:['Correspondentes: 8 ↔ 12, razão = 12 ÷ 8 = 1,5', 'Lado que corresponde ao 4: 4 × 1,5 = 6', 'Lado que corresponde ao 6: 6 × 1,5 = 9']},
      {title:'Exemplo 2 (Tales)', text:'2/3 = 4/x', steps:['As paralelas cortam as transversais em partes proporcionais.', '2/3 = 4/x → 2x = 12', 'x = 6']},
      {title:'Exemplo 3 (sombra)', text:'Pessoa de 1,8 m com sombra 1,2 m; poste com sombra 6 m', steps:['altura/sombra igual pros dois: 1,8/1,2 = h/6', '1,2 · h = 1,8 · 6 = 10,8', 'h = 10,8 ÷ 1,2 = 9 m']},
    ],
    gen:{
      facil:()=>{ const [a,b,c] = pick([[3,4,5],[2,3,4],[4,6,8],[5,7,9],[6,8,10]]), k = randInt(2,4);
        return mkSingle(`Um triângulo tem lados ${a}, ${b} e ${c}. Um triângulo semelhante a ele tem o maior lado medindo ${c*k}. Quanto mede o menor lado do triângulo maior?`, a*k, [`Correspondentes: ${c} ↔ ${c*k}. Razão = ${c*k} ÷ ${c} = ${k}`, `Menor lado: ${a} × ${k} = ${a*k}`]); },
      medio:()=>{ const a = randInt(2,6), b = randInt(2,8), k = pick([2,3,1.5,2.5]); const c = a*k, x = b*k;
        return mkSingle(`Três retas paralelas cortam duas transversais. Numa delas, os segmentos medem ${a} cm e ${b} cm. Na outra, o segmento correspondente ao de ${a} cm mede ${fmt(c)} cm. Quanto mede o correspondente ao de ${b} cm?`, x, [`Teorema de Tales: ${a}/${b} = ${fmt(c)}/x`, `${a} · x = ${b} · ${fmt(c)} = ${fmt(b*c)}`, `x = ${fmt(b*c)} ÷ ${a} = ${fmt(x)} cm`]); },
      dificil:()=>{ const p = pick([1.5,1.6,1.8,2]), s = pick([0.5,0.8,1,1.2,2]), S = pick([3,4,5,6,8,10]); const H = p*S/s;
        if(Math.abs(H*100-Math.round(H*100))>1e-6) return SUBJECTS.find(x=>x.id==='semelhanca').gen.dificil();
        return mkSingle(`No mesmo horário, uma pessoa de ${fmt(p)} m faz uma sombra de ${fmt(s)} m, e um prédio faz uma sombra de ${S} m. Qual é a altura do prédio, em metros?`, H, [`Os raios de sol formam triângulos semelhantes: altura/sombra é igual.`, `${fmt(p)}/${fmt(s)} = h/${S}`, `${fmt(s)} · h = ${fmt(p)} · ${S} = ${fmt(p*S)}`, `h = ${fmt(p*S)} ÷ ${fmt(s)} = ${fmt(H)} m`]); },
    }
  },
  {
    id:'casapombos', name:'Contagem e casa dos pombos', sym:'n+1',
    learn:`<p><b>Princípio da casa dos pombos:</b> se você colocar <b>mais pombos do que casinhas</b>, alguma casinha vai ficar com pelo menos 2 pombos. Parece óbvio, mas resolve muita questão de olimpíada!</p>
    <p><b>Como usar:</b> pense no <b>pior caso</b>, quando tudo dá "azar" e você demora o máximo pra conseguir o que quer.</p>
    <ol>
      <li>Identifique quem são as <b>casinhas</b> (cores, meses, restos…).</li>
      <li>Distribua os pombos o mais espalhado possível (o pior caso).</li>
      <li>Mais <b>um</b> pombo e a repetição é garantida.</li>
    </ol>
    <p><b>Versão geral:</b> com N pombos e c casinhas, alguma casinha tem pelo menos N ÷ c pombos, <b>arredondando pra cima</b>.</p>
    <p><b>Exemplos clássicos:</b> numa sala com 13 pessoas, duas fazem aniversário no mesmo mês (12 meses + 1). Numa gaveta com meias de 4 cores, tirando 5 meias no escuro, duas são da mesma cor.</p>
    <p><b>Dica:</b> pra "garantir uma cor específica", o pior caso é tirar <b>todas</b> as outras primeiro.</p>`,
    examples:[
      {title:'Exemplo 1 (meias)', text:'Meias de 3 cores: quantas tirar pra garantir um par?', steps:['Casinhas: as 3 cores.', 'Pior caso: 1 meia de cada cor (3 meias, nenhum par).', 'A próxima repete uma cor: 3 + 1 = 4 meias.']},
      {title:'Exemplo 2 (aniversários)', text:'40 alunos: no mínimo quantos fazem aniversário no mesmo mês?', steps:['Casinhas: 12 meses. Pombos: 40 alunos.', '40 ÷ 12 = 3,33…', 'Arredonda pra cima: pelo menos 4 alunos no mesmo mês.']},
      {title:'Exemplo 3 (cor específica)', text:'5 bolas azuis e 7 vermelhas: quantas tirar pra garantir 2 azuis?', steps:['Pior caso: sair todas as 7 vermelhas primeiro.', 'Depois, mais 2 azuis.', '7 + 2 = 9 bolas.']},
    ],
    gen:{
      facil:()=>{ const c = randInt(2,7);
        return mkSingle(`Uma gaveta tem meias de ${c} cores diferentes, misturadas. No escuro, quantas meias você precisa tirar, no mínimo, para ter certeza de pegar duas da mesma cor?`, c+1, [`Casinhas: as ${c} cores.`, `Pior caso: ${c} meias, uma de cada cor (ainda sem par).`, `A próxima meia repete alguma cor: ${c} + 1 = ${c+1}`]); },
      medio:()=>{ const n = randInt(25,90), r = Math.ceil(n/12);
        return mkSingle(`Numa escola há ${n} alunos numa sala de eventos. No mínimo, quantos deles com certeza fazem aniversário no mesmo mês?`, r, [`Casinhas: 12 meses. Pombos: ${n} alunos.`, `${n} ÷ 12 = ${fmt(Math.round(n/12*100)/100)}`, `Arredondando pra cima: pelo menos ${r} alunos no mesmo mês.`]); },
      dificil:()=>{ const a = randInt(4,10), v = randInt(4,10), k = randInt(2,4), t = randInt(0,1);
        if(t===0) return mkSingle(`Uma caixa tem ${a} bolas azuis e ${v} vermelhas. Sem olhar, quantas bolas você precisa tirar, no mínimo, para garantir ${k} bolas azuis?`, v+k, [`Pior caso: saem todas as ${v} vermelhas primeiro.`, `Depois disso, só restam azuis: mais ${k}.`, `${v} + ${k} = ${v+k}`]);
        const kk = Math.min(k, a, v);
        return mkSingle(`Uma caixa tem ${a} bolas azuis e ${v} vermelhas. Sem olhar, quantas bolas você precisa tirar, no mínimo, para garantir ${kk} bolas da mesma cor?`, 2*(kk-1)+1, [`Casinhas: 2 cores.`, `Pior caso: ${kk-1} de cada cor, sem completar ${kk} de nenhuma (${2*(kk-1)} bolas).`, `A próxima completa ${kk} de uma cor: ${2*(kk-1)} + 1 = ${2*(kk-1)+1}`]); },
    }
  },

  /* ---------------- ENSINO MÉDIO ---------------- */
  {
    id:'inequacoes', name:'Inequações', sym:'<',
    learn:`<p>Uma <b>inequação</b> é parecida com uma equação, mas com <b>&lt;, &gt;, ≤ ou ≥</b> no lugar do =. A resposta não é um número só, é um <b>intervalo</b> de números.</p>
    <p><b>Inequação do 1º grau:</b> resolva como uma equação, com <b>uma regra a mais</b>:</p>
    <ol>
      <li>Passe os números pra um lado e o x pro outro.</li>
      <li>Ao <b>multiplicar ou dividir por um número negativo</b>, <b>inverta o sinal</b> (&lt; vira &gt;).</li>
    </ol>
    <p>Exemplo: −2x &gt; 8 → x &lt; −4 (dividiu por −2, inverteu).</p>
    <p><b>Inequação do 2º grau</b> (ax² + bx + c &lt; 0):</p>
    <ol>
      <li>Ache as raízes (Bhaskara ou soma e produto).</li>
      <li>Se a &gt; 0, a parábola é "sorriso": fica <b>negativa entre as raízes</b> e positiva fora delas.</li>
      <li>Escolha o pedaço que o sinal pede.</li>
    </ol>
    <p>Exemplo: x² − 5x + 6 &lt; 0 → raízes 2 e 3 → solução 2 &lt; x &lt; 3.</p>`,
    examples:[
      {title:'Exemplo 1 (1º grau)', text:'3x − 4 ≤ 11', steps:['3x ≤ 11 + 4', '3x ≤ 15', 'x ≤ 5']},
      {title:'Exemplo 2 (inverte o sinal)', text:'−2x + 1 > 9', steps:['−2x > 9 − 1 = 8', 'Divide por −2 e INVERTE: x < −4']},
      {title:'Exemplo 3 (2º grau)', text:'x² − 7x + 10 ≤ 0', steps:['Raízes: soma 7 e produto 10 → 2 e 5', 'a = 1 > 0: a parábola é negativa entre as raízes', 'Solução: 2 ≤ x ≤ 5']},
    ],
    gen:{
      facil:()=>{ const a = randInt(2,6), x0 = randInt(2,9), b = randInt(1,10), c = a*x0 + b;
        return mkSingle(`Qual é o maior número inteiro x que satisfaz ${a}x + ${b} < ${c}?`, x0-1, [`${a}x < ${c} − ${b} = ${c-b}`, `x < ${c-b} ÷ ${a} = ${x0}`, `x tem que ser menor que ${x0}: o maior inteiro é ${x0-1}`]); },
      medio:()=>{ const a = randInt(2,5), x0 = randInt(-4,6), b = randInt(1,12), c = -a*x0 + b;
        return mkSingle(`Qual é o maior número inteiro x que satisfaz −${a}x + ${b} ≥ ${nm(c)}?`, x0, [`−${a}x ≥ ${nm(c)} − ${b} = ${nm(c-b)}`, `Dividindo por −${a}, INVERTE o sinal: x ≤ ${nm(c-b)} ÷ (−${a})`, `x ≤ ${nm(x0)} → o maior inteiro é ${nm(x0)}`]); },
      dificil:()=>{ const r1 = randInt(-4,3), r2 = r1 + randInt(2,6), s = r1+r2, p = r1*r2;
        const eq = `${polyFromCoefs([1,-s,p])} ≤ 0`;
        return mkSingle(`Quantos números inteiros satisfazem ${eq}?`, r2-r1+1, [`Raízes: soma = ${nm(s)} e produto = ${nm(p)} → x = ${nm(r1)} e x = ${nm(r2)}`, `a = 1 > 0: a parábola fica ≤ 0 entre as raízes`, `${nm(r1)} ≤ x ≤ ${nm(r2)} → de ${nm(r1)} a ${nm(r2)} são ${r2-r1+1} inteiros`]); },
    }
  },
  {
    id:'circunferencia', name:'Circunferência', sym:'⊙',
    learn:`<p>A <b>circunferência</b> é o conjunto de pontos que estão à <b>mesma distância (o raio r)</b> de um ponto fixo (o <b>centro C(a, b)</b>).</p>
    <p><b>Equação reduzida:</b></p>
    <p style="text-align:center; font-size:18px"><b>(x − a)² + (y − b)² = r²</b></p>
    <p>Repare nos sinais: em (x − 3)² + (y + 2)² = 25, o centro é <b>(3, −2)</b> (o sinal troca!) e o raio é <b>√25 = 5</b>.</p>
    <p><b>Equação geral:</b> x² + y² + Dx + Ey + F = 0. Pra achar centro e raio:</p>
    <ol>
      <li>Centro: a = −D/2 e b = −E/2.</li>
      <li>Raio: r² = a² + b² − F.</li>
    </ol>
    <p><b>Posição de um ponto:</b> calcule a distância até o centro. Menor que r → dentro; igual → em cima; maior → fora.</p>
    <p><b>Cônicas:</b> a circunferência é uma das cônicas, junto com a elipse, a hipérbole e a parábola — todas aparecem cortando um cone com um plano.</p>`,
    examples:[
      {title:'Exemplo 1 (reduzida)', text:'(x − 1)² + (y − 4)² = 9', steps:['Centro: troque os sinais → C(1, 4)', 'Raio: √9 = 3']},
      {title:'Exemplo 2 (montar a equação)', text:'Centro (−2, 5) e raio 4', steps:['(x − (−2))² + (y − 5)² = 4²', '(x + 2)² + (y − 5)² = 16']},
      {title:'Exemplo 3 (geral)', text:'x² + y² − 6x + 4y − 12 = 0', steps:['a = −(−6)/2 = 3 e b = −4/2 = −2 → C(3, −2)', 'r² = 3² + (−2)² − (−12) = 9 + 4 + 12 = 25', 'r = 5']},
    ],
    gen:{
      facil:()=>{ const a = randInt(-6,6), b = randInt(-6,6), r = randInt(1,9);
        const tx = a===0 ? 'x²' : `(x ${a>0?'−':'+'} ${Math.abs(a)})²`, ty = b===0 ? 'y²' : `(y ${b>0?'−':'+'} ${Math.abs(b)})²`;
        return mkSingle(`Qual é o raio da circunferência ${tx} + ${ty} = ${r*r}?`, r, [`A equação reduzida é (x − a)² + (y − b)² = r²`, `r² = ${r*r}`, `r = √${r*r} = ${r}`]); },
      medio:()=>{ const a = randInt(-7,7), b = randInt(-7,7), r = randInt(1,8);
        const tx = a===0 ? 'x²' : `(x ${a>0?'−':'+'} ${Math.abs(a)})²`, ty = b===0 ? 'y²' : `(y ${b>0?'−':'+'} ${Math.abs(b)})²`;
        return mkXY(`Qual é o centro (x, y) da circunferência ${tx} + ${ty} = ${r*r}?`, a, b, [`Compare com (x − a)² + (y − b)² = r²`, `Troque os sinais de dentro dos parênteses`, `Centro: (${nm(a)}, ${nm(b)})`]); },
      dificil:()=>{ const a = randInt(-5,5), b = randInt(-5,5), r = randInt(2,7); const D = -2*a, E = -2*b, F = a*a + b*b - r*r;
        const t = (v, s)=> v===0 ? '' : ` ${v>0?'+':'−'} ${Math.abs(v)}${s}`;
        return mkSingle(`Qual é o raio da circunferência x² + y²${t(D,'x')}${t(E,'y')}${t(F,'')} = 0?`, r, [`Centro: a = −D/2 = ${nm(a)} e b = −E/2 = ${nm(b)}`, `r² = a² + b² − F = ${a*a} + ${b*b} − ${np(F)} = ${r*r}`, `r = √${r*r} = ${r}`]); },
    }
  },
  {
    id:'polinomios', name:'Polinômios', sym:'P(x)',
    learn:`<p>Um <b>polinômio</b> é uma soma de termos com x elevado a expoentes naturais, como P(x) = 2x³ − x² + 5x − 7. O maior expoente é o <b>grau</b> (aqui, 3).</p>
    <p><b>Valor numérico:</b> P(2) é o que dá quando você troca x por 2. Em P(x) = x² + 3x − 1: P(2) = 4 + 6 − 1 = 9.</p>
    <p><b>Raiz</b> é o número que faz o polinômio dar zero: P(r) = 0.</p>
    <p><b>Teorema do resto:</b> o resto da divisão de P(x) por (x − a) é <b>P(a)</b>. Não precisa fazer a divisão!</p>
    <p><b>Relações de Girard</b> (para x³ + bx² + cx + d = 0, com raízes r₁, r₂, r₃):</p>
    <ol>
      <li>Soma das raízes: r₁ + r₂ + r₃ = −b</li>
      <li>Soma dos produtos dois a dois: c</li>
      <li>Produto das raízes: r₁·r₂·r₃ = −d</li>
    </ol>
    <p><b>Dispositivo de Briot-Ruffini:</b> um jeito rápido de dividir P(x) por (x − a), usando só os coeficientes.</p>`,
    examples:[
      {title:'Exemplo 1 (valor numérico)', text:'P(x) = 2x² − 3x + 1, P(3)', steps:['Troque x por 3: 2·3² − 3·3 + 1', '= 18 − 9 + 1', 'P(3) = 10']},
      {title:'Exemplo 2 (teorema do resto)', text:'Resto de x³ − 2x + 5 por (x − 2)', steps:['O resto é P(2)', 'P(2) = 8 − 4 + 5', 'Resto = 9']},
      {title:'Exemplo 3 (Girard)', text:'x³ − 6x² + 11x − 6 = 0', steps:['Soma das raízes = −(−6) = 6', 'Produto das raízes = −(−6) = 6', '(As raízes são 1, 2 e 3: soma 6, produto 6 ✓)']},
    ],
    gen:{
      facil:()=>{ const a = randInt(1,4), b = randInt(-6,6), c = randInt(-9,9), k = randInt(-3,4); const v = a*k*k + b*k + c;
        const P = polyFromCoefs([a,b,c]);
        return mkSingle(`Dado P(x) = ${P}, quanto vale P(${nm(k)})?`, v, [`Troque x por ${np(k)} em cada termo.`, `${a}·${np(k)}² = ${nm(a*k*k)}, ${nm(b)}·${np(k)} = ${nm(b*k)} e o termo sem x é ${nm(c)}`, `P(${nm(k)}) = ${nm(a*k*k)} + ${np(b*k)} + ${np(c)} = ${nm(v)}`]); },
      medio:()=>{ const b = randInt(-4,4), c = randInt(-6,6), d = randInt(-9,9), k = randInt(-2,3); const v = k**3 + b*k*k + c*k + d;
        const P = polyFromCoefs([1,b,c,d]), div = k===0 ? 'x' : `(x ${k>0?'−':'+'} ${Math.abs(k)})`;
        return mkSingle(`Qual é o resto da divisão de P(x) = ${P} por ${div}?`, v, [`Teorema do resto: o resto da divisão por (x − a) é P(a). Aqui a = ${nm(k)}.`, `Termos: ${np(k)}³ = ${nm(k**3)}, ${nm(b)}·${np(k)}² = ${nm(b*k*k)}, ${nm(c)}·${np(k)} = ${nm(c*k)}, termo sem x: ${nm(d)}`, `P(${nm(k)}) = ${nm(k**3)} + ${np(b*k*k)} + ${np(c*k)} + ${np(d)} = ${nm(v)}`]); },
      dificil:()=>{ const r = [randInt(-4,4), randInt(-4,4), randInt(1,5)]; const S = r[0]+r[1]+r[2], Q = r[0]*r[1]+r[0]*r[2]+r[1]*r[2], Pr = r[0]*r[1]*r[2];
        const eq = `${polyFromCoefs([1,-S,Q,-Pr])} = 0`;
        if(randInt(0,1)) return mkSingle(`Qual é a soma das raízes da equação ${eq}?`, S, [`Girard: soma das raízes = −b (b é o número que multiplica x²)`, `b = ${nm(-S)}`, `Soma = −(${nm(-S)}) = ${nm(S)}`]);
        return mkSingle(`Qual é o produto das raízes da equação ${eq}?`, Pr, [`Girard: produto das raízes = −d (d é o termo sem x)`, `d = ${nm(-Pr)}`, `Produto = −(${nm(-Pr)}) = ${nm(Pr)}`]); },
    }
  },
  {
    id:'complexos', name:'Números complexos', sym:'a+bi',
    learn:`<p>Não existe número real que, ao quadrado, dê negativo. Pra resolver isso, criou-se a <b>unidade imaginária i</b>, com <b>i² = −1</b>.</p>
    <p>Um <b>número complexo</b> tem a forma <b>z = a + bi</b>: a é a <b>parte real</b> e b é a <b>parte imaginária</b>.</p>
    <ol>
      <li><b>Somar/subtrair:</b> real com real, imaginário com imaginário. (2 + 3i) + (1 − 5i) = 3 − 2i</li>
      <li><b>Multiplicar:</b> faça a distributiva e troque i² por −1. (1 + 2i)(3 + i) = 3 + i + 6i + 2i² = 1 + 7i</li>
      <li><b>Conjugado:</b> troca o sinal da parte imaginária. O conjugado de 4 − 3i é 4 + 3i.</li>
      <li><b>Módulo</b> (distância até a origem): |z| = √(a² + b²). |3 + 4i| = 5.</li>
    </ol>
    <p><b>Potências de i</b> se repetem de 4 em 4: i⁰ = 1, i¹ = i, i² = −1, i³ = −i. Pra iⁿ, use o resto de n ÷ 4.</p>
    <p><b>Plano de Argand-Gauss:</b> z = a + bi vira o ponto (a, b) — eixo x real, eixo y imaginário.</p>`,
    examples:[
      {title:'Exemplo 1 (soma)', text:'(4 + 2i) + (−1 + 5i)', steps:['Real: 4 + (−1) = 3', 'Imaginária: 2 + 5 = 7', 'Resultado: 3 + 7i']},
      {title:'Exemplo 2 (produto)', text:'(2 + 3i)(1 − i)', steps:['Distributiva: 2 − 2i + 3i − 3i²', 'i² = −1 → −3i² = +3', '= (2 + 3) + (−2 + 3)i = 5 + i']},
      {title:'Exemplo 3 (módulo)', text:'|6 − 8i|', steps:['|z| = √(a² + b²)', '= √(36 + 64) = √100', '= 10']},
    ],
    gen:{
      facil:()=>{ const a = randInt(-6,8), b = randInt(-6,8), c = randInt(-6,8), d = randInt(-6,8);
        const z = (x,y)=> `${nm(x)} ${y>=0?'+':'−'} ${Math.abs(y)}i`;
        return mkXY(`Calcule (${z(a,b)}) + (${z(c,d)}) e escreva como x + yi. Quanto valem x e y?`, a+c, b+d, [`Real com real: ${nm(a)} + ${np(c)} = ${nm(a+c)}`, `Imaginário com imaginário: ${nm(b)} + ${np(d)} = ${nm(b+d)}`, `Resultado: ${z(a+c,b+d)}`]); },
      medio:()=>{ const a = randInt(-4,5), b = randInt(-4,5), c = randInt(-4,5), d = randInt(-4,5); const re = a*c - b*d, im = a*d + b*c;
        const z = (x,y)=> `${nm(x)} ${y>=0?'+':'−'} ${Math.abs(y)}i`;
        return mkXY(`Calcule (${z(a,b)}) · (${z(c,d)}) e escreva como x + yi. Quanto valem x e y?`, re, im, [`Distributiva: ${np(a)}·${np(c)} + ${np(a)}·${np(d)}i + ${np(b)}·${np(c)}i + ${np(b)}·${np(d)}i²`, `i² = −1 → parte real: ${nm(a*c)} − ${np(b*d)} = ${nm(re)}`, `Parte imaginária: ${nm(a*d)} + ${np(b*c)} = ${nm(im)}`, `Resultado: ${z(re,im)}`]); },
      dificil:()=>{ const [p,q,r] = pick(PIT_TRIPLES), sa = pick([1,-1]), sb = pick([1,-1]); const a = p*sa, b = q*sb;
        if(randInt(0,1)) return mkSingle(`Qual é o módulo do número complexo z = ${nm(a)} ${b>=0?'+':'−'} ${Math.abs(b)}i?`, r, [`|z| = √(a² + b²)`, `= √(${a*a} + ${b*b}) = √${r*r}`, `|z| = ${r}`]);
        return mkSingle(`Seja z = ${nm(a)} ${b>=0?'+':'−'} ${Math.abs(b)}i e z̄ o seu conjugado. Quanto vale z · z̄?`, r*r, [`z̄ = ${nm(a)} ${b>=0?'−':'+'} ${Math.abs(b)}i`, `z · z̄ = a² + b² (os termos com i se cancelam)`, `= ${a*a} + ${b*b} = ${r*r}`]); },
    }
  },
);
