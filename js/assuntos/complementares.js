/* =========================================================
   ASSUNTOS QUE CAEM NAS PROVAS (16)
   Conteúdos da área "Conteúdos por prova" que ainda não tinham página em Aprender.
   A explicação é pensada pra quem nunca viu o assunto: começa do zero, com exemplos
   do dia a dia, e só depois mostra a fórmula.
   Cada assunto tem explicação (learn), exemplos e gerador fácil/médio/difícil (gen),
   igual aos de fundamental.js e ensino-medio.js. O lugar de cada um na lista fica
   em SUBJECT_GROUPS (catalogo.js).
   ========================================================= */
/* R$ com duas casas quando tem centavos: 62,5 → 62,50 */
function reais2(v){ return Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','); }

SUBJECTS.push(
  /* =================== FUNDAMENTAL =================== */
  {
    id:'unidades', name:'Grandezas, unidades e escalas', sym:'km',
    learn:`<p><b>Grandeza</b> é tudo o que dá pra medir: comprimento, massa ("peso"), tempo, volume. Pra medir, a gente usa uma <b>unidade</b>: metro, quilo, hora, litro. O mesmo tamanho pode ser escrito em unidades diferentes — 1 metro é a mesma coisa que 100 centímetros. Converter é só trocar a unidade sem mudar o tamanho.</p>
    <div class="section-title">A escadinha do metro</div>
    <p>Imagine uma escada. Cada degrau pra <b>baixo</b> multiplica por 10; cada degrau pra <b>cima</b> divide por 10.</p>
    <div class="example-box mono">km → hm → dam → m → dm → cm → mm</div>
    <p>De metro pra centímetro são 2 degraus pra baixo: × 10 × 10 = <b>× 100</b>. Então 3 m = 300 cm. De metro pra quilômetro são 3 degraus pra cima: ÷ 1000. Então 2500 m = 2,5 km.</p>
    <p>A mesma escada vale pro grama (kg, g, mg) e pro litro (L, mL): 1 kg = 1000 g e 1 L = 1000 mL.</p>
    <div class="section-title">Área e volume</div>
    <p>Na área (m², cm²) cada degrau vale <b>× 100</b>; no volume (m³, cm³) vale <b>× 1000</b>. Uma ligação muito útil: <b>1 dm³ = 1 litro</b> e <b>1 m³ = 1000 litros</b>. Uma caixa-d'água de 2 m³ guarda 2000 litros.</p>
    <div class="section-title">Tempo não é de 10 em 10!</div>
    <p>1 hora = 60 minutos e 1 minuto = 60 segundos. Então 2,5 horas = 2 h e meia = 150 minutos (e não 250).</p>
    <div class="section-title">Escala de mapa</div>
    <p>Escala <b>1 : 100 000</b> quer dizer: 1 cm no mapa vale 100 000 cm na vida real. Pra ler em quilômetros, corte 5 zeros: 100 000 cm = 1 km. Então 4 cm no mapa = 4 km de verdade.</p>`,
    examples:[
      {title:'Exemplo 1 (comprimento)', text:'Quantos centímetros tem 2,4 m?', qVisual: stepChain(['m → cm: 2 degraus pra baixo', '× 10 × 10 = × 100', '2,4 × 100 = 240 cm']), steps:['De m pra cm são 2 degraus pra baixo: × 100.', '2,4 × 100 = 240 cm.']},
      {title:'Exemplo 2 (volume em litros)', text:'Uma piscina tem 12 m³. Quantos litros cabem nela?', qVisual: stepChain(['1 m³ = 1000 L', '12 × 1000 = 12 000 L']), steps:['Cada m³ guarda 1000 litros.', '12 × 1000 = 12 000 litros.']},
      {title:'Exemplo 3 (escala)', text:'Num mapa de escala 1 : 50 000, duas cidades estão a 6 cm. Qual a distância real?', qVisual: stepChain(['6 cm × 50 000 = 300 000 cm', '300 000 cm ÷ 100 000 = 3 km']), steps:['Cada cm do mapa vale 50 000 cm de verdade: 6 × 50 000 = 300 000 cm.', 'Pra virar km, divida por 100 000: 3 km.']},
    ],
    gen:{
      facil:()=>{
        const t = pick([['m','cm',100],['km','m',1000],['kg','g',1000],['L','mL',1000],['cm','mm',10]]);
        const v = pick([1.5,2,2.5,3,4,0.5,0.8,1.2,6,7]), r = Math.round(v*t[2]*100)/100;
        return mkSingle(`Quantos ${t[1]} há em ${fmt(v)} ${t[0]}?`, r, [`De ${t[0]} pra ${t[1]}: multiplique por ${t[2]}.`, `${fmt(v)} × ${t[2]} = ${fmt(r)} ${t[1]}`]); },
      medio:()=>{
        if(Math.random()<0.5){ const v = pick([1,2,3,5,8,12]); const q = pick([['m³','litros',1000]]);
          return mkSingle(`Uma caixa-d'água tem volume de ${v} ${q[0]}. Quantos ${q[1]} cabem nela?`, v*1000, ['1 m³ = 1000 litros.', `${v} × 1000 = ${v*1000} litros`]); }
        const hh = pick([1.5,2.5,0.75,1.25,3.5,0.25]), m = hh*60;
        return mkSingle(`Quantos minutos há em ${fmt(hh)} horas?`, m, ['1 hora = 60 minutos (o tempo não é de 10 em 10).', `${fmt(hh)} × 60 = ${fmt(m)} minutos`]); },
      dificil:()=>{
        const e = pick([25000,50000,100000,200000,500000]), d = pick([2,3,4,5,6,8]), km = e*d/100000;
        return mkSingle(`Num mapa de escala 1 : ${e.toLocaleString('pt-BR')}, duas cidades estão a ${d} cm uma da outra. Qual a distância real, em km?`, km,
          [`Cada cm do mapa vale ${e.toLocaleString('pt-BR')} cm de verdade: ${d} × ${e.toLocaleString('pt-BR')} = ${(d*e).toLocaleString('pt-BR')} cm`, `1 km = 100 000 cm, então divida por 100 000: ${fmt(km)} km`]); },
    }
  },
  {
    id:'regra3comp', name:'Regra de três composta', sym:'∝∝',
    learn:`<p>Na regra de três simples aparecem <b>duas</b> grandezas (ex.: lápis e preço). Na <b>composta</b> aparecem <b>três ou mais</b>: "4 pedreiros, em 6 dias, fazem 12 m de muro. Quantos metros 6 pedreiros fazem em 8 dias?".</p>
    <div class="section-title">Passo 1 — compare cada grandeza só com a do x</div>
    <p>Pegue a grandeza onde está o x (aqui, <b>metros de muro</b>) e pergunte, uma de cada vez, fingindo que as outras não mudam:</p>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Mais pedreiros → mais metros? <b>Sim</b> → direta.</li>
      <li>Mais dias → mais metros? <b>Sim</b> → direta.</li>
    </ul>
    <div class="section-title">Passo 2 — monte a conta com "fatores de mudança"</div>
    <p>Comece pelo valor conhecido da coluna do x e multiplique por uma fração pra cada grandeza:</p>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Se é <b>direta</b>: fração <b>novo ÷ antigo</b>.</li>
      <li>Se é <b>inversa</b>: fração <b>antigo ÷ novo</b> (de cabeça pra baixo).</li>
    </ul>
    <div class="example-box mono">x = 12 × (6/4) × (8/6) = 12 × 1,5 × 1,333… = 24 m</div>
    <p>Faz sentido: mais gente trabalhando por mais dias faz mais muro. Sempre confira se o resultado "faz sentido" — isso pega muito erro.</p>
    <div class="section-title">Quando é inversa?</div>
    <p>Quando uma sobe e a outra desce. Ex.: mais máquinas → <b>menos</b> horas pra fazer o mesmo serviço. Mais horas trabalhadas por dia → <b>menos</b> dias.</p>`,
    examples:[
      {title:'Exemplo 1 (tudo direto)', text:'3 costureiras, em 2 dias, fazem 12 camisas. Quantas camisas 6 costureiras fazem em 4 dias?', qVisual: stepChain(['Mais costureiras → mais camisas (direta): 6/3', 'Mais dias → mais camisas (direta): 4/2', 'x = 12 × 6/3 × 4/2 = 12 × 2 × 2 = 48']), steps:['Compare cada grandeza com "camisas": as duas são diretas.', 'x = 12 × (6/3) × (4/2) = 48 camisas.']},
      {title:'Exemplo 2 (uma inversa)', text:'4 máquinas fazem 100 peças em 6 horas. Em quantas horas 8 máquinas fazem 200 peças?', qVisual: stepChain(['Mais máquinas → menos horas (inversa): 4/8', 'Mais peças → mais horas (direta): 200/100', 'x = 6 × 4/8 × 200/100 = 6 × 0,5 × 2 = 6 horas']), steps:['A coluna do x é "horas".', 'Máquinas: inversa → 4/8. Peças: direta → 200/100.', 'x = 6 × 0,5 × 2 = 6 horas.']},
    ],
    gen:{
      facil:()=>{ const a = pick([2,3,4,5]), d = pick([2,3,4,5]), k = pick([2,3,4]), p = a*d*k, b = a*pick([1,2,3]), e = d*pick([1,2]);
        const x = p*b/a*e/d;
        return mkSingle(`${a} operários, em ${d} dias, constroem ${p} m de muro. Quantos metros ${b} operários constroem em ${e} dias?`, x,
          [`Mais operários → mais metros (direta): ${b}/${a}. Mais dias → mais metros (direta): ${e}/${d}.`, `x = ${p} × ${b}/${a} × ${e}/${d}`, `x = ${fmt(x)} m`]); },
      medio:()=>{ const a = pick([2,3,4,6]), b = a*pick([2,3]), hr = b*pick([1,2,3]), p = pick([50,100,120,200]), q = p*pick([1,2,3]);
        const x = hr*a/b*q/p;
        return mkSingle(`${a} máquinas fazem ${p} peças em ${hr} horas. Em quantas horas ${b} máquinas fazem ${q} peças?`, x,
          [`Mais máquinas → menos horas (inversa): ${a}/${b}. Mais peças → mais horas (direta): ${q}/${p}.`, `x = ${hr} × ${a}/${b} × ${q}/${p}`, `x = ${fmt(x)} horas`]); },
      dificil:()=>{ const a = pick([4,6,8,10,12]), h1 = pick([6,8]), h2 = pick([4,6,8,12].filter(v=>v!==h1)), b = pick([2,3,4,6,8].filter(v=>v!==a)), dd = (b*h2)*pick([1,2]);
        const x = dd*a/b*h1/h2;
        if(Math.abs(x-Math.round(x))>1e-9) return SUBJECTS.find(s=>s.id==='regra3comp').gen.dificil();
        return mkSingle(`${a} pessoas, trabalhando ${h1} horas por dia, pintam um prédio em ${dd} dias. Em quantos dias ${b} pessoas, trabalhando ${h2} horas por dia, pintam o mesmo prédio?`, x,
          [`Mais pessoas → menos dias (inversa): ${a}/${b}. Mais horas por dia → menos dias (inversa): ${h1}/${h2}.`, `x = ${dd} × ${a}/${b} × ${h1}/${h2}`, `x = ${fmt(x)} dias`]); },
    }
  },
  {
    id:'divisores', name:'Divisores, primos e restos', sym:'p',
    learn:`<p>Um número é <b>divisor</b> de outro quando a divisão dá certinho, sem sobrar nada. 3 é divisor de 12 porque 12 ÷ 3 = 4 com resto 0. Do outro lado, 12 é <b>múltiplo</b> de 3 (está na tabuada do 3).</p>
    <div class="section-title">Truques pra saber se divide (critérios)</div>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>por 2:</b> termina em 0, 2, 4, 6 ou 8 (é par).</li>
      <li><b>por 3:</b> a soma dos algarismos dá um número da tabuada do 3. (171 → 1+7+1 = 9 ✓)</li>
      <li><b>por 5:</b> termina em 0 ou 5.</li>
      <li><b>por 9:</b> a soma dos algarismos dá um número da tabuada do 9.</li>
      <li><b>por 10:</b> termina em 0.</li>
    </ul>
    <div class="section-title">Números primos</div>
    <p>Primo é o número maior que 1 que só tem <b>dois</b> divisores: o 1 e ele mesmo. Os primeiros: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29… O 2 é o único primo par. Todo número pode ser montado multiplicando primos (é a "decomposição": 60 = 2 × 2 × 3 × 5).</p>
    <div class="section-title">Contar divisores</div>
    <p>Decomponha, some 1 em cada expoente e multiplique. 12 = 2² × 3¹ → (2+1) × (1+1) = <b>6 divisores</b> (1, 2, 3, 4, 6, 12).</p>
    <div class="section-title">Par e ímpar</div>
    <p>par + par = par · ímpar + ímpar = <b>par</b> · par + ímpar = ímpar · qualquer coisa × par = par · ímpar × ímpar = ímpar.</p>
    <div class="section-title">Restos andam em círculo (como o relógio)</div>
    <p>O resto de uma divisão por 4 só pode ser 0, 1, 2 ou 3, e depois volta pro 0 — igual ao relógio, que depois do 12 volta pro 1. Isso ajuda a achar, por exemplo, o <b>último algarismo</b> de uma potência enorme: as potências de 3 terminam em 3, 9, 7, 1, 3, 9, 7, 1… (repete de 4 em 4). Pra 3²⁰²⁶, divida 2026 por 4: resto 2 → termina igual a 3², em <b>9</b>.</p>`,
    examples:[
      {title:'Exemplo 1 (critério do 3)', text:'O número 4 512 é divisível por 3?', qVisual: stepChain(['4 + 5 + 1 + 2 = 12', '12 está na tabuada do 3 → sim!']), steps:['Some os algarismos: 4 + 5 + 1 + 2 = 12.', '12 é múltiplo de 3, então 4 512 também é.']},
      {title:'Exemplo 2 (quantos divisores)', text:'Quantos divisores tem 18?', qVisual: stepChain(['18 = 2¹ × 3²', '(1+1) × (2+1) = 2 × 3 = 6']), steps:['Decomponha: 18 = 2 × 3 × 3 = 2¹ × 3².', 'Some 1 em cada expoente e multiplique: 2 × 3 = 6 divisores (1, 2, 3, 6, 9, 18).']},
      {title:'Exemplo 3 (último algarismo)', text:'Em que algarismo termina 7¹⁰³?', qVisual: stepChain(['7, 49, 343, 2401 → terminam em 7, 9, 3, 1', '103 ÷ 4 = 25, resto 3', 'termina igual a 7³ → 3']), steps:['As potências de 7 terminam em 7, 9, 3, 1 e repetem de 4 em 4.', '103 dividido por 4 deixa resto 3, então termina igual à 3ª da lista: 3.']},
    ],
    gen:{
      facil:()=>{ const b = randInt(3,9), q = randInt(5,30), r = randInt(1,b-1), a = b*q+r;
        return mkSingle(`Qual é o resto da divisão de ${a} por ${b}?`, r, [`Maior múltiplo de ${b} que cabe em ${a}: ${b} × ${q} = ${b*q}`, `Resto: ${a} − ${b*q} = ${r}`]); },
      medio:()=>{ const n = pick([12,18,20,24,28,30,36,40,45,48,50,60,72,80,90,100]);
        const f = primeFactors(n), ks = Object.keys(f), d = ks.reduce((t,k)=>t*(f[k]+1),1);
        return mkSingle(`Quantos divisores positivos tem o número ${n}?`, d, [`Decomponha: ${n} = ${factorsStr(f).replace(/<sup>(\d+)<\/sup>/g,'^$1')}`, `Some 1 em cada expoente e multiplique: ${ks.map(k=>`(${f[k]}+1)`).join(' × ')} = ${d}`]); },
      dificil:()=>{ const b = pick([2,3,7,8]), e = randInt(21,2026);
        const cyc = {2:[2,4,8,6], 3:[3,9,7,1], 7:[7,9,3,1], 8:[8,4,2,6]}[b], r = e%4, d = cyc[(r+3)%4];
        return mkSingle(`Qual é o algarismo das unidades (o último algarismo) de ${b}^${e}?`, d,
          [`As potências de ${b} terminam em ${cyc.join(', ')} e repetem de 4 em 4.`, `${e} ÷ 4 deixa resto ${r}${r===0?' (resto 0 = a 4ª da lista)':''}.`, `Então termina em ${d}.`]); },
    }
  },
  {
    id:'padroes', name:'Sequências e padrões', sym:'…',
    learn:`<p>Uma <b>sequência</b> é uma fila de números (ou figuras) que segue uma regra. Descobrir a regra é como ser detetive: olhe de um termo pro seguinte e pergunte "o que aconteceu?".</p>
    <div class="section-title">1. Somou sempre o mesmo?</div>
    <p>2, 5, 8, 11, … → sempre <b>+3</b>. O próximo é 14. Pra achar um termo lá na frente sem escrever todos: termo da posição n = primeiro + (n − 1) × passo. O 20º termo é 2 + 19 × 3 = 59.</p>
    <div class="section-title">2. Multiplicou sempre pelo mesmo?</div>
    <p>3, 6, 12, 24, … → sempre <b>× 2</b>. O próximo é 48.</p>
    <div class="section-title">3. Padrão que se repete</div>
    <p>A, B, C, A, B, C, … repete de 3 em 3. Pra saber a letra da posição 100, divida 100 por 3: dá 33 e sobra <b>1</b> → é a 1ª do bloco: A. Se sobrar 0, é a última do bloco.</p>
    <div class="section-title">4. Figuras que crescem</div>
    <p>Quadradinhos de palito em fila: 1 quadrado usa 4 palitos, 2 usam 7, 3 usam 10… cada quadrado novo aproveita um lado e só pede <b>3</b> palitos. Com n quadrados: 3n + 1 palitos.</p>
    <div class="section-title">Dica</div>
    <p>Se a diferença entre os termos não é sempre igual, olhe as <b>diferenças das diferenças</b>: 1, 4, 9, 16 (diferenças 3, 5, 7 → sobem de 2 em 2): são os quadrados 1², 2², 3², 4².</p>`,
    examples:[
      {title:'Exemplo 1 (passo constante)', text:'Qual é o 15º termo de 4, 9, 14, 19, …?', qVisual: stepChain(['passo: +5', '15º = 4 + 14 × 5', '= 4 + 70 = 74']), steps:['De um termo pro outro soma 5.', 'Do 1º ao 15º são 14 passos: 4 + 14 × 5 = 74.']},
      {title:'Exemplo 2 (repetição)', text:'Na sequência 🔴🟢🔵🟡🔴🟢🔵🟡…, qual a cor da posição 50?', qVisual: stepChain(['o bloco tem 4 cores', '50 ÷ 4 = 12, resto 2', '2ª cor do bloco: 🟢']), steps:['O padrão repete de 4 em 4.', '50 ÷ 4 sobra 2 → é a 2ª cor: verde.']},
      {title:'Exemplo 3 (palitos)', text:'Quantos palitos formam 10 quadradinhos em fila?', qVisual: stepChain(['1 → 4, 2 → 7, 3 → 10', 'cada quadrado novo: +3', '3 × 10 + 1 = 31']), steps:['O primeiro quadrado usa 4 palitos e cada novo usa mais 3.', 'Com n quadrados: 3n + 1 = 31 palitos.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(1,20), r = randInt(2,9), seq = [0,1,2,3].map(i=>a+i*r);
        return mkSingle(`Qual é o próximo número da sequência ${seq.join(', ')}, …?`, a+4*r, [`De um termo pro outro soma ${r}.`, `${seq[3]} + ${r} = ${a+4*r}`]); },
      medio:()=>{ const a = randInt(1,12), r = randInt(2,8), n = randInt(12,40), seq = [0,1,2,3].map(i=>a+i*r), t = a+(n-1)*r;
        return mkSingle(`Qual é o ${n}º termo da sequência ${seq.join(', ')}, …?`, t, [`Passo: +${r}. Do 1º ao ${n}º são ${n-1} passos.`, `${a} + ${n-1} × ${r} = ${t}`]); },
      dificil:()=>{ const k = randInt(3,6), blk = Array.from({length:k},(_,i)=>i+1), n = randInt(40,250), r = n%k, v = r===0 ? k : r;
        return mkSingle(`A sequência ${blk.join(', ')}, ${blk.join(', ')}, ${blk.join(', ')}, … repete sempre o mesmo bloco. Qual número aparece na posição ${n}?`, v,
          [`O bloco tem ${k} números.`, `${n} ÷ ${k} = ${Math.floor(n/k)}, resto ${r}.`, r===0 ? `Resto 0 = último do bloco: ${v}` : `Resto ${r} = ${r}º número do bloco: ${v}`]); },
    }
  },
  {
    id:'angulos', name:'Ângulos', sym:'∠',
    learn:`<p><b>Ângulo</b> é a "abertura" entre duas linhas que saem do mesmo ponto — como a abertura de uma tesoura ou dos ponteiros do relógio. Medimos em <b>graus (°)</b>. Uma volta inteira tem <b>360°</b>.</p>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Reto (90°):</b> o canto de uma folha de papel.</li>
      <li><b>Raso (180°):</b> uma linha reta (meia volta).</li>
      <li><b>Agudo:</b> menor que 90° · <b>Obtuso:</b> entre 90° e 180°.</li>
    </ul>
    <div class="section-title">Pares que "se completam"</div>
    <p><b>Complementares</b> somam 90° (o complemento de 30° é 60°). <b>Suplementares</b> somam 180° (o suplemento de 30° é 150°).</p>
    <div class="section-title">Opostos pelo vértice</div>
    <p>Quando duas retas se cruzam, formam um "X". Os ângulos de frente um pro outro são <b>iguais</b>.</p>
    <div class="section-title">Dentro do triângulo: sempre 180°</div>
    <p>Recorte os três cantos de um triângulo de papel e junte: eles formam uma linha reta. Por isso a soma dos ângulos internos é <b>180°</b>. Se dois medem 50° e 60°, o terceiro mede 180 − 50 − 60 = 70°.</p>
    <div class="section-title">Polígonos</div>
    <p>Um polígono de n lados pode ser cortado em (n − 2) triângulos, então a soma dos ângulos internos é <b>(n − 2) × 180°</b>. Quadrado: 2 × 180 = 360°. Hexágono: 4 × 180 = 720°. Se o polígono é <b>regular</b> (todos iguais), cada ângulo é essa soma ÷ n.</p>
    <div class="section-title">Retas paralelas</div>
    <p>Uma reta cortando duas paralelas forma ângulos que se repetem: os que estão "na mesma posição" em cada cruzamento são iguais.</p>`,
    examples:[
      {title:'Exemplo 1 (suplemento)', text:'Qual o suplemento de 35°?', qVisual: stepChain(['suplementares somam 180°', '180 − 35 = 145°']), steps:['Suplementares somam 180°.', '180 − 35 = 145°.']},
      {title:'Exemplo 2 (triângulo)', text:'Um triângulo tem ângulos de 40° e 75°. Quanto mede o terceiro?', qVisual: stepChain(['soma no triângulo = 180°', '180 − 40 − 75 = 65°']), steps:['Os três somam 180°.', '180 − 40 − 75 = 65°.']},
      {title:'Exemplo 3 (polígono regular)', text:'Quanto mede cada ângulo interno de um hexágono regular?', qVisual: stepChain(['soma = (6 − 2) × 180 = 720°', '720 ÷ 6 = 120°']), steps:['Soma: (n − 2) × 180 = 4 × 180 = 720°.', 'São 6 ângulos iguais: 720 ÷ 6 = 120°.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(10,80);
        return Math.random()<0.5
          ? mkSingle(`Qual é o complemento de um ângulo de ${a}°? (responda em graus)`, 90-a, ['Complementares somam 90°.', `90 − ${a} = ${90-a}°`])
          : mkSingle(`Qual é o suplemento de um ângulo de ${a}°? (responda em graus)`, 180-a, ['Suplementares somam 180°.', `180 − ${a} = ${180-a}°`]); },
      medio:()=>{ const a = randInt(25,85), b = randInt(25,150-a), c = 180-a-b;
        return mkSingle(`Dois ângulos de um triângulo medem ${a}° e ${b}°. Quanto mede o terceiro, em graus?`, c, ['A soma dos ângulos de um triângulo é 180°.', `180 − ${a} − ${b} = ${c}°`]); },
      dificil:()=>{ const n = pick([5,6,8,9,10,12]), s = (n-2)*180;
        return Math.random()<0.5
          ? mkSingle(`Qual é a soma dos ângulos internos de um polígono de ${n} lados, em graus?`, s, [`Soma = (n − 2) × 180°`, `(${n} − 2) × 180 = ${s}°`])
          : mkSingle(`Quanto mede cada ângulo interno de um polígono regular de ${n} lados, em graus?`, s/n, [`Soma = (${n} − 2) × 180 = ${s}°`, `Todos iguais: ${s} ÷ ${n} = ${fmt(s/n)}°`]); },
    }
  },
  {
    id:'produtos', name:'Produtos notáveis e fatoração', sym:'(+)²',
    learn:`<p>Algumas multiplicações com letras aparecem tanto que ganharam nome: <b>produtos notáveis</b>. Saber de cabeça economiza muita conta.</p>
    <div class="section-title">1. Quadrado da soma</div>
    <p>(a + b)² quer dizer (a + b) × (a + b). Pense num quadrado de lado a + b: ele se divide em um quadrado a × a, um quadrado b × b e <b>dois</b> retângulos a × b.</p>
    <div class="example-box mono">(a + b)² = a² + 2ab + b²</div>
    <p>Cuidado com o erro mais comum: (a + b)² <b>não</b> é a² + b². Teste com números: (2 + 3)² = 25, mas 2² + 3² = 13. Faltou o 2ab = 12.</p>
    <div class="section-title">2. Quadrado da diferença</div>
    <div class="example-box mono">(a − b)² = a² − 2ab + b²</div>
    <div class="section-title">3. Soma vezes diferença</div>
    <div class="example-box mono">(a + b)(a − b) = a² − b²</div>
    <p>Truque de conta de cabeça: 52 × 48 = (50 + 2)(50 − 2) = 2500 − 4 = 2496.</p>
    <div class="section-title">Fatorar = fazer o caminho de volta</div>
    <p>Fatorar é transformar uma soma numa multiplicação:</p>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Fator comum:</b> 6x + 9 = 3(2x + 3) — o 3 estava nos dois.</li>
      <li><b>Diferença de quadrados:</b> x² − 25 = (x + 5)(x − 5).</li>
      <li><b>Trinômio quadrado perfeito:</b> x² + 10x + 25 = (x + 5)².</li>
    </ul>`,
    examples:[
      {title:'Exemplo 1 (desenvolver)', text:'Desenvolva (x + 4)²', qVisual: stepChain(['a = x, b = 4', 'x² + 2·x·4 + 4²', 'x² + 8x + 16']), steps:['Use a² + 2ab + b² com a = x e b = 4.', 'x² + 8x + 16.']},
      {title:'Exemplo 2 (conta de cabeça)', text:'Quanto é 31 × 29?', qVisual: stepChain(['(30 + 1)(30 − 1)', '30² − 1²', '900 − 1 = 899']), steps:['31 = 30 + 1 e 29 = 30 − 1.', 'Soma vezes diferença: 30² − 1² = 899.']},
      {title:'Exemplo 3 (fatorar)', text:'Fatore x² − 49', qVisual: stepChain(['x² − 7²', '(x + 7)(x − 7)']), steps:['49 = 7², então é diferença de quadrados.', 'x² − 49 = (x + 7)(x − 7).']},
    ],
    gen:{
      facil:()=>{ const a = randInt(2,12);
        return mkSingle(`Desenvolvendo (x + ${a})², obtemos x² + bx + c. Quanto vale b?`, 2*a, ['(a + b)² = a² + 2ab + b²', `O termo do meio é 2 · x · ${a} = ${2*a}x`, `b = ${2*a}`]); },
      medio:()=>{ const m = pick([20,30,40,50,60,70,80,100]), d = randInt(1,4);
        return mkSingle(`Use soma vezes diferença pra calcular ${m+d} × ${m-d}.`, m*m-d*d, [`${m+d} × ${m-d} = (${m} + ${d})(${m} − ${d})`, `= ${m}² − ${d}² = ${m*m} − ${d*d}`, `= ${m*m-d*d}`]); },
      dificil:()=>{ const a = randInt(1,9), b = randInt(1,9), s = a+b, p = a*b;
        return mkSingle(`Se a + b = ${s} e a · b = ${p}, quanto vale a² + b²?`, a*a+b*b, ['(a + b)² = a² + 2ab + b², então a² + b² = (a + b)² − 2ab', `= ${s}² − 2 · ${p} = ${s*s} − ${2*p}`, `= ${a*a+b*b}`]); },
    }
  },
  {
    id:'semelhanca', name:'Pitágoras, semelhança e Tales', sym:'∼',
    learn:`<p>Três ideias de geometria que aparecem juntas nas provas.</p>
    <div class="section-title">1. Teorema de Pitágoras</div>
    <p>Vale só pro <b>triângulo retângulo</b> (o que tem um canto de 90°). O lado maior, de frente pro canto reto, é a <b>hipotenusa</b>; os outros dois são os <b>catetos</b>.</p>
    <div class="example-box mono">hipotenusa² = cateto² + cateto²</div>
    <p>O exemplo clássico é o 3, 4, 5: 3² + 4² = 9 + 16 = 25 = 5². Os "múltiplos" dele também funcionam (6, 8, 10).</p>
    <div class="section-title">2. Semelhança</div>
    <p>Duas figuras são <b>semelhantes</b> quando têm a <b>mesma forma</b>, mas tamanhos diferentes — como uma foto e a mesma foto ampliada. Os ângulos são iguais e os lados crescem na mesma proporção.</p>
    <p>Exemplo da sombra: no mesmo horário, o sol faz triângulos semelhantes. Se uma pessoa de 1,8 m faz sombra de 1,2 m, um poste com sombra de 4 m tem altura x: x/4 = 1,8/1,2 → x = 6 m.</p>
    <div class="section-title">3. Teorema de Tales</div>
    <p>Quando várias retas <b>paralelas</b> cortam duas retas transversais, os pedaços ficam proporcionais. Se numa transversal os pedaços são 2 e 3, e na outra são 4 e x, então 2/3 = 4/x → x = 6.</p>`,
    examples:[
      {title:'Exemplo 1 (Pitágoras)', text:'Catetos de 6 e 8. Qual a hipotenusa?', qVisual: stepChain(['h² = 6² + 8²', 'h² = 36 + 64 = 100', 'h = 10']), steps:['h² = 36 + 64 = 100.', 'h = √100 = 10.']},
      {title:'Exemplo 2 (sombra)', text:'Um menino de 1,5 m faz sombra de 2 m. Uma árvore faz sombra de 8 m. Qual a altura dela?', qVisual: fracRow([{n:'x',d:8}, '=', {n:'1,5',d:2}]) + stepChain(['2x = 8 × 1,5 = 12', 'x = 6 m']), steps:['Os triângulos são semelhantes: altura/sombra é igual nos dois.', 'x/8 = 1,5/2 → x = 6 m.']},
      {title:'Exemplo 3 (Tales)', text:'Paralelas cortam duas retas. Numa, os pedaços medem 3 e 5; na outra, 6 e x.', qVisual: fracRow([{n:3,d:5}, '=', {n:6,d:'x'}]) + stepChain(['3x = 30', 'x = 10']), steps:['Pedaços proporcionais: 3/5 = 6/x.', '3x = 30 → x = 10.']},
    ],
    gen:{
      facil:()=>{ const t = pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20]]);
        return mkSingle(`Um triângulo retângulo tem catetos ${t[0]} e ${t[1]}. Quanto mede a hipotenusa?`, t[2], [`h² = ${t[0]}² + ${t[1]}² = ${t[0]**2} + ${t[1]**2} = ${t[2]**2}`, `h = √${t[2]**2} = ${t[2]}`]); },
      medio:()=>{ const p = pick([1.5,1.6,1.8,2]), s = pick([1,2,2.5,3,4]), k = pick([2,3,4,5]), S = s*k, x = p*k;
        return mkSingle(`Uma pessoa de ${fmt(p)} m de altura faz uma sombra de ${fmt(s)} m. No mesmo horário, uma árvore faz sombra de ${fmt(S)} m. Qual a altura da árvore, em metros?`, x,
          [`Triângulos semelhantes: altura/sombra é igual. x/${fmt(S)} = ${fmt(p)}/${fmt(s)}`, `x = ${fmt(S)} × ${fmt(p)} ÷ ${fmt(s)} = ${fmt(x)} m`]); },
      dificil:()=>{ const a = randInt(2,6), b = randInt(3,9), k = pick([2,3,4]), c = a*k, x = b*k;
        return mkSingle(`Retas paralelas cortam duas transversais. Numa delas, os segmentos medem ${a} cm e ${b} cm; na outra, os segmentos correspondentes medem ${c} cm e x cm. Quanto vale x?`, x,
          [`Teorema de Tales: ${a}/${b} = ${c}/x`, `${a}x = ${b} × ${c} = ${b*c}`, `x = ${x}`]); },
    }
  },
  {
    id:'logica', name:'Contagem, casa dos pombos e lógica', sym:'∴',
    learn:`<p>Nas olimpíadas (como a OBMEP) muitas questões não pedem fórmula: pedem <b>raciocínio</b>. Estas ideias resolvem boa parte delas.</p>
    <div class="section-title">1. Princípio multiplicativo (contar escolhas)</div>
    <p>Se você tem 3 camisas e 2 bermudas, cada camisa combina com cada bermuda: 3 × 2 = <b>6 roupas</b>. Quando as escolhas são feitas uma depois da outra, <b>multiplique</b>.</p>
    <div class="section-title">2. Casa dos pombos</div>
    <p>Se 5 pombos entram em 4 casinhas, pelo menos uma casinha fica com 2 pombos — não tem como evitar! Ex.: num grupo de 13 pessoas, com certeza duas fazem aniversário no mesmo mês (só existem 12 meses).</p>
    <div class="section-title">3. Pense no pior caso</div>
    <p>"Quantas meias preciso tirar no escuro pra <b>garantir</b> um par da mesma cor, se há meias de 3 cores?" Imagine o azar máximo: as 3 primeiras saem todas diferentes. A 4ª, com certeza, repete uma cor. Resposta: <b>4</b> (número de cores + 1).</p>
    <div class="section-title">4. Jogos de estratégia</div>
    <p>Jogo dos palitos: cada um tira 1, 2 ou 3 palitos; quem tira o último ganha. O segredo é sempre deixar pro adversário um número da tabuada do <b>4</b> (4, 8, 12…): o que ele tirar, você completa 4. Se começar com 10 palitos, tire 2 (sobram 8).</p>
    <div class="section-title">5. Lógica</div>
    <p>Em questões de "quem está mentindo", teste uma hipótese de cada vez ("e se o João mente?") e veja se dá contradição. Se der, aquela hipótese está errada.</p>`,
    examples:[
      {title:'Exemplo 1 (multiplicar escolhas)', text:'Um lanche tem 4 tipos de pão, 3 recheios e 2 sucos. Quantos combos diferentes?', qVisual: stepChain(['4 × 3 × 2', '= 24 combos']), steps:['Cada escolha é independente: multiplique.', '4 × 3 × 2 = 24.']},
      {title:'Exemplo 2 (pior caso)', text:'Uma gaveta tem 10 meias pretas e 10 brancas. Quantas tirar no escuro pra garantir duas da mesma cor?', qVisual: stepChain(['pior caso: 1 preta, 1 branca', 'a próxima repete', '2 + 1 = 3']), steps:['No pior caso, as 2 primeiras são de cores diferentes.', 'A 3ª com certeza forma par: 3 meias.']},
      {title:'Exemplo 3 (jogo)', text:'Há 15 palitos; cada um tira 1, 2 ou 3; quem pega o último ganha. Quantos você tira primeiro?', qVisual: stepChain(['deixe um múltiplo de 4', '15 − 12 = 3']), steps:['Você quer deixar 12 (múltiplo de 4).', 'Tire 3 palitos. Depois, sempre complete 4 com o adversário.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(2,6), b = randInt(2,5), c = randInt(2,4);
        return mkSingle(`Uma pessoa tem ${a} camisetas, ${b} calças e ${c} pares de tênis. De quantas formas diferentes ela pode se vestir usando uma peça de cada?`, a*b*c, ['Escolhas independentes: multiplique.', `${a} × ${b} × ${c} = ${a*b*c}`]); },
      medio:()=>{ const k = randInt(3,7);
        if(Math.random()<0.5) return mkSingle(`Uma gaveta tem meias de ${k} cores diferentes (muitas de cada). Quantas meias é preciso tirar, no escuro, pra garantir duas da mesma cor?`, k+1, [`Pior caso: as ${k} primeiras saem todas de cores diferentes.`, `A próxima com certeza repete: ${k} + 1 = ${k+1}`]);
        return mkSingle(`Uma gaveta tem meias de ${k} cores diferentes (muitas de cada). Quantas meias é preciso tirar, no escuro, pra garantir três da mesma cor?`, 2*k+1, [`Pior caso: 2 de cada cor sem formar trio: ${k} × 2 = ${2*k}`, `A próxima completa um trio: ${2*k} + 1 = ${2*k+1}`]); },
      dificil:()=>{
        if(Math.random()<0.5){ const a = randInt(5,15), b = randInt(5,15), c = randInt(2,4);
          return mkSingle(`Uma caixa tem ${a} bolas vermelhas e ${b} azuis. Sem olhar, quantas bolas é preciso tirar pra ter certeza de pegar ${c} azuis?`, a+c, [`Pior caso: saem primeiro todas as ${a} vermelhas.`, `Depois disso, só restam azuis: ${a} + ${c} = ${a+c}`]); }
        let n; do{ n = randInt(9,30); }while(n%4===0);
        return mkSingle(`Num jogo há ${n} palitos. Cada jogador, na sua vez, tira 1, 2 ou 3 palitos, e quem tira o último ganha. Você começa. Quantos palitos deve tirar agora pra garantir a vitória?`, n%4,
          ['A estratégia é sempre deixar um múltiplo de 4 pro adversário.', `O maior múltiplo de 4 abaixo de ${n} é ${n-n%4}.`, `Tire ${n} − ${n-n%4} = ${n%4}`]); },
    }
  },

  /* =================== ENSINO MÉDIO =================== */
  {
    id:'inequacoes', name:'Inequações', sym:'<',
    learn:`<p>Uma <b>equação</b> usa "=" e procura um valor exato. Uma <b>inequação</b> usa <b>&gt;</b> (maior), <b>&lt;</b> (menor), <b>≥</b> ou <b>≤</b>, e a resposta é um <b>monte de valores</b> — um intervalo. "Tenho R$ 50 e cada lanche custa R$ 8: quantos lanches posso comprar?" vira 8x ≤ 50.</p>
    <div class="section-title">Resolve quase igual à equação</div>
    <p>Você pode somar, subtrair, multiplicar e dividir dos dois lados, como na equação:</p>
    <div class="example-box mono">2x + 3 &gt; 11 → 2x &gt; 8 → x &gt; 4</div>
    <div class="section-title">A única regra nova</div>
    <p>Multiplicou ou dividiu por um número <b>negativo</b>? <b>Vire o sinal</b>. Por quê? 2 &lt; 5, mas −2 &gt; −5 (no negativo a ordem inverte).</p>
    <div class="example-box mono">−3x ≤ 12 → x ≥ −4 (dividiu por −3, virou)</div>
    <div class="section-title">Inequação do 2º grau</div>
    <p>Ex.: x² − 5x + 6 &lt; 0. Ache as raízes (onde dá zero): 2 e 3. Desenhe a parábola: com o x² positivo ela é uma "boca pra cima" — fica <b>negativa entre as raízes</b> e positiva fora delas. Então a resposta é 2 &lt; x &lt; 3.</p>`,
    examples:[
      {title:'Exemplo 1 (1º grau)', text:'Resolva 3x − 4 ≥ 11', qVisual: stepChain(['3x ≥ 15', 'x ≥ 5']), steps:['Some 4 dos dois lados: 3x ≥ 15.', 'Divida por 3 (positivo, não vira): x ≥ 5.']},
      {title:'Exemplo 2 (vira o sinal)', text:'Resolva 10 − 2x > 4', qVisual: stepChain(['−2x > −6', 'x < 3 (dividiu por −2: virou)']), steps:['Tire 10 dos dois lados: −2x > −6.', 'Divida por −2 e vire o sinal: x < 3.']},
      {title:'Exemplo 3 (2º grau)', text:'Resolva x² − 4 < 0', qVisual: stepChain(['raízes: −2 e 2', 'boca pra cima: negativa entre as raízes', '−2 < x < 2']), steps:['x² − 4 = 0 → x = −2 ou x = 2.', 'A parábola é negativa entre as raízes: −2 < x < 2.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(2,6), x0 = randInt(1,10), b = randInt(1,15), c = a*x0+b;
        return mkSingle(`Qual é o menor número inteiro que satisfaz ${a}x + ${b} > ${c}?`, x0+1, [`${a}x > ${c} − ${b} = ${c-b}`, `x > ${x0}`, `O menor inteiro maior que ${x0} é ${x0+1}`]); },
      medio:()=>{ const a = randInt(2,6), x0 = randInt(-5,8), b = randInt(1,20), c = b - a*x0;
        return mkSingle(`Qual é o maior número inteiro que satisfaz ${b} − ${a}x ≥ ${nm(c)}?`, x0, [`−${a}x ≥ ${nm(c)} − ${b} = ${nm(c-b)}`, `Dividindo por −${a}, o sinal vira: x ≤ ${nm(x0)}`, `O maior inteiro é ${nm(x0)}`]); },
      dificil:()=>{ const r1 = randInt(-4,3), r2 = r1 + randInt(3,7), S = r1+r2, P = r1*r2, n = r2-r1-1;
        const poly = `x² ${S>=0?'−':'+'} ${Math.abs(S)===1?'':Math.abs(S)}x ${P>=0?'+':'−'} ${Math.abs(P)}`.replace(' − 0x','').replace(' + 0x','').replace(/ [+−] 0$/,'');
        return mkSingle(`Quantos números inteiros satisfazem ${poly} < 0?`, n, [`Raízes: ${nm(r1)} e ${nm(r2)}`, `Parábola com boca pra cima: negativa entre as raízes → ${nm(r1)} < x < ${nm(r2)}`, `Inteiros de ${nm(r1+1)} a ${nm(r2-1)}: ${n}`]); },
    }
  },
  {
    id:'polinomios', name:'Polinômios', sym:'P(x)',
    learn:`<p><b>Polinômio</b> é uma "expressão com x" formada por somas de potências de x multiplicadas por números, como P(x) = 2x³ − x + 5. Os números que multiplicam (2, −1, 5) são os <b>coeficientes</b>. O maior expoente é o <b>grau</b> (aqui, 3).</p>
    <div class="section-title">Valor numérico</div>
    <p>P(2) quer dizer "troque o x por 2": P(2) = 2·8 − 2 + 5 = 19. Truque: <b>P(1) = soma dos coeficientes</b> (2 − 1 + 5 = 6).</p>
    <div class="section-title">Raiz</div>
    <p>Raiz é o valor de x que faz o polinômio dar <b>zero</b>. Se 3 é raiz, então P(3) = 0, e o polinômio "tem" o pedaço (x − 3) dentro dele.</p>
    <div class="section-title">Teorema do resto (o atalho mais cobrado)</div>
    <p>O resto da divisão de P(x) por (x − a) é simplesmente <b>P(a)</b>. Não precisa fazer a divisão!</p>
    <div class="example-box mono">resto de (x² + 3x − 1) ÷ (x − 2) = P(2) = 4 + 6 − 1 = 9</div>
    <div class="section-title">Soma e produto das raízes (Girard)</div>
    <p>Pra ax² + bx + c: soma = −b/a e produto = c/a. Pra ax³ + bx² + cx + d: soma = −b/a e produto = −d/a.</p>`,
    examples:[
      {title:'Exemplo 1 (valor numérico)', text:'P(x) = x² − 3x + 4. Quanto é P(5)?', qVisual: stepChain(['5² − 3·5 + 4', '25 − 15 + 4 = 14']), steps:['Troque x por 5.', '25 − 15 + 4 = 14.']},
      {title:'Exemplo 2 (resto)', text:'Resto de x³ − 2x + 1 dividido por (x + 1)?', qVisual: stepChain(['x + 1 = x − (−1) → a = −1', 'P(−1) = −1 + 2 + 1 = 2']), steps:['x + 1 = x − (−1), então use a = −1.', 'P(−1) = (−1)³ − 2(−1) + 1 = 2.']},
      {title:'Exemplo 3 (soma das raízes)', text:'Soma das raízes de 2x³ − 8x² + x − 3', qVisual: stepChain(['soma = −b/a', '= −(−8)/2 = 4']), steps:['Soma = −b/a, com a = 2 e b = −8.', '8/2 = 4.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(1,3), b = randInt(-6,6) || 1, c = randInt(-9,9) || 2, k = randInt(-3,4), v = a*k*k+b*k+c;
        return mkSingle(`Se P(x) = ${a===1?'':a}x² ${b<0?'−':'+'} ${Math.abs(b)}x ${c<0?'−':'+'} ${Math.abs(c)}, quanto vale P(${nm(k)})?`, v,
          [`Troque x por ${nm(k)}: ${a}·${np(k)}² ${b<0?'−':'+'} ${Math.abs(b)}·${np(k)} ${c<0?'−':'+'} ${Math.abs(c)}`, `= ${nm(a*k*k)} ${b*k<0?'−':'+'} ${Math.abs(b*k)} ${c<0?'−':'+'} ${Math.abs(c)} = ${nm(v)}`]); },
      medio:()=>{ const b = randInt(-5,5), c = randInt(-6,6), d = randInt(-9,9), a = randInt(-3,3) || 2, v = a**3+b*a*a+c*a+d;
        const term = (k,s)=> k===0 ? '' : ` ${k<0?'−':'+'} ${Math.abs(k)===1&&s?'':Math.abs(k)}${s}`;
        return mkSingle(`Qual é o resto da divisão de P(x) = x³${term(b,'x²')}${term(c,'x')}${term(d,'')} por (x ${a<0?'+':'−'} ${Math.abs(a)})?`, v,
          [`Teorema do resto: o resto é P(${nm(a)}).`, `P(${nm(a)}) = ${nm(a**3)} ${b*a*a<0?'−':'+'} ${Math.abs(b*a*a)} ${c*a<0?'−':'+'} ${Math.abs(c*a)} ${d<0?'−':'+'} ${Math.abs(d)} = ${nm(v)}`]); },
      dificil:()=>{ const r = pick([1,2,3,-1,-2]), c = r*randInt(-4,4), m = (r**3 + c)/r;
        return mkSingle(`Para que valor de m o número ${nm(r)} é raiz de P(x) = x³ − mx ${c<0?'−':'+'} ${Math.abs(c)}?`, m,
          [`Raiz → P(${nm(r)}) = 0: ${np(r)}³ − m·${np(r)} ${c<0?'−':'+'} ${Math.abs(c)} = 0`, `${nm(r**3)} ${c<0?'−':'+'} ${Math.abs(c)} = ${nm(r)}m → ${nm(r**3+c)} = ${nm(r)}m`, `m = ${nm(m)}`]); },
    }
  },
  {
    id:'complexos', name:'Números complexos', sym:'i',
    learn:`<p>Nenhum número real elevado ao quadrado dá negativo: 3² = 9 e (−3)² = 9. Então √−1 "não existe" nos reais. Os matemáticos resolveram isso <b>inventando</b> um número novo, o <b>i</b> (de "imaginário"), com a regra:</p>
    <div class="example-box mono">i² = −1</div>
    <p>Com ele, √−9 = 3i. Um <b>número complexo</b> é escrito como <b>z = a + bi</b>: o <b>a</b> é a parte real e o <b>b</b> é a parte imaginária. Ex.: 3 + 2i.</p>
    <div class="section-title">Somar</div>
    <p>Real com real, imaginário com imaginário: (3 + 2i) + (1 + 5i) = 4 + 7i.</p>
    <div class="section-title">Multiplicar</div>
    <p>Faça o chuveirinho e troque i² por −1: (2 + i)(3 + 4i) = 6 + 8i + 3i + 4i² = 6 + 11i − 4 = <b>2 + 11i</b>.</p>
    <div class="section-title">Potências de i (repetem de 4 em 4)</div>
    <p>i¹ = i · i² = −1 · i³ = −i · i⁴ = 1, e depois volta: i⁵ = i… Pra i¹⁰³: 103 ÷ 4 sobra 3 → i¹⁰³ = i³ = −i.</p>
    <div class="section-title">Módulo e conjugado</div>
    <p>Desenhe a + bi como o ponto (a, b). O <b>módulo</b> |z| é a distância até a origem — Pitágoras! |3 + 4i| = √(9 + 16) = 5. O <b>conjugado</b> troca o sinal da parte imaginária: o de 3 + 4i é 3 − 4i.</p>`,
    examples:[
      {title:'Exemplo 1 (somar)', text:'(5 − 2i) + (−1 + 6i)', qVisual: stepChain(['real: 5 + (−1) = 4', 'imaginária: −2 + 6 = 4', '4 + 4i']), steps:['Some as partes reais: 4.', 'Some as imaginárias: 4i. Resultado: 4 + 4i.']},
      {title:'Exemplo 2 (multiplicar)', text:'(1 + 2i)(3 − i)', qVisual: stepChain(['3 − i + 6i − 2i²', '3 + 5i − 2(−1)', '5 + 5i']), steps:['Distribua: 3 − i + 6i − 2i².', 'Como i² = −1: 3 + 5i + 2 = 5 + 5i.']},
      {title:'Exemplo 3 (módulo)', text:'|6 + 8i|', qVisual: stepChain(['√(6² + 8²)', '√(36 + 64) = √100 = 10']), steps:['Módulo = √(a² + b²).', '√100 = 10.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(-9,9) || 3, b = randInt(-9,9) || 2, c = randInt(-9,9) || -1, d = randInt(-9,9) || 4, real = Math.random()<0.5;
        const z = (x,y)=> `${nm(x)} ${y<0?'−':'+'} ${Math.abs(y)===1?'':Math.abs(y)}i`;
        return mkSingle(`Qual é a parte ${real?'real':'imaginária'} de (${z(a,b)}) + (${z(c,d)})?`, real ? a+c : b+d,
          ['Some real com real e imaginário com imaginário.', `Parte real: ${nm(a)} + ${np(c)} = ${nm(a+c)} · parte imaginária: ${nm(b)} + ${np(d)} = ${nm(b+d)}`]); },
      medio:()=>{ const a = randInt(-5,5) || 2, b = randInt(1,5), c = randInt(-5,5) || -1, d = randInt(1,5), real = Math.random()<0.5;
        const z = (x,y)=> `${nm(x)} + ${y===1?'':y}i`, R = a*c-b*d, I = a*d+b*c;
        return mkSingle(`Qual é a parte ${real?'real':'imaginária'} de (${z(a,b)})(${z(c,d)})?`, real ? R : I,
          [`Distribua: ${nm(a*c)} + ${nm(a*d)}i + ${nm(b*c)}i + ${b*d}i²`, `Como i² = −1: ${nm(a*c)} − ${b*d} + (${nm(a*d)} + ${nm(b*c)})i`, `= ${nm(R)} ${I<0?'−':'+'} ${Math.abs(I)}i`]); },
      dificil:()=>{ const t = pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15]]), sa = pick([1,-1]), sb = pick([1,-1]);
        return mkSingle(`Qual é o módulo de z = ${nm(sa*t[0])} ${sb<0?'−':'+'} ${t[1]}i?`, t[2], ['|z| = √(a² + b²)', `√(${t[0]**2} + ${t[1]**2}) = √${t[2]**2} = ${t[2]}`]); },
    }
  },
  {
    id:'sistlin', name:'Sistemas lineares', sym:'{ }',
    learn:`<p>Você já viu sistemas com 2 equações e 2 incógnitas (x e y). Nos vestibulares aparecem com <b>3</b>: x, y e z. A ideia é a mesma — achar os números que deixam <b>todas</b> as equações verdadeiras ao mesmo tempo.</p>
    <div class="section-title">Estratégia: ir eliminando letras</div>
    <p>Some ou subtraia equações pra uma letra sumir. Repita até sobrar só uma letra. Depois volte substituindo.</p>
    <div class="example-box mono">x + y + z = 6<br>x − y + z = 2<br>x + y − z = 0</div>
    <p>Somando a 1ª com a 2ª: 2x + 2z = 8. Somando a 2ª com a 3ª: 2x = 2 → <b>x = 1</b>. Volta: z = 3 e, na 1ª, y = 2.</p>
    <div class="section-title">Formato "escada" (escalonado)</div>
    <p>Quando o sistema já vem em escada — a última equação só com z, a de cima com y e z… — resolva de baixo pra cima. É o que o método de <b>escalonamento</b> faz: transforma qualquer sistema numa escada.</p>
    <div class="section-title">Classificação</div>
    <ul style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>SPD</b> (possível e determinado): uma solução só.</li>
      <li><b>SPI</b> (possível e indeterminado): infinitas soluções.</li>
      <li><b>SI</b> (impossível): nenhuma solução — aparece algo absurdo como 0 = 5.</li>
    </ul>
    <p>Atalho: se o determinante dos coeficientes é diferente de 0, o sistema é SPD.</p>`,
    examples:[
      {title:'Exemplo 1 (escada)', text:'z = 2 · y + z = 5 · x + y + z = 9', qVisual: stepChain(['z = 2', 'y = 5 − 2 = 3', 'x = 9 − 3 − 2 = 4']), steps:['Comece de baixo: z = 2.', 'y + 2 = 5 → y = 3.', 'x + 3 + 2 = 9 → x = 4.']},
      {title:'Exemplo 2 (somando equações)', text:'x + y = 7 · y + z = 9 · x + z = 8. Quanto é x + y + z?', qVisual: stepChain(['somando tudo: 2x + 2y + 2z = 24', 'x + y + z = 12']), steps:['Somando as três: cada letra aparece 2 vezes.', '2(x + y + z) = 24 → x + y + z = 12.']},
    ],
    gen:{
      facil:()=>{ const x = randInt(-5,9), y = randInt(-5,9), z = randInt(-5,9);
        return mkSingle(`Resolva o sistema e diga o valor de x:\nz = ${nm(z)}\ny + z = ${nm(y+z)}\nx + y + z = ${nm(x+y+z)}`, x,
          [`De baixo pra cima: z = ${nm(z)}`, `y = ${nm(y+z)} − ${np(z)} = ${nm(y)}`, `x = ${nm(x+y+z)} − ${np(y)} − ${np(z)} = ${nm(x)}`]); },
      medio:()=>{ const x = randInt(1,9), y = randInt(1,9), z = randInt(1,9), A = x+y+z, B = x+y, C = y+z;
        return mkSingle(`Resolva o sistema e diga o valor de y:\nx + y + z = ${A}\nx + y = ${B}\ny + z = ${C}`, y,
          [`Da 1ª menos a 2ª: z = ${A} − ${B} = ${z}`, `Na 3ª: y = ${C} − ${z} = ${y}`]); },
      dificil:()=>{ const x = randInt(-4,8), y = randInt(-4,8), z = randInt(-4,8), A = x+y+z, B = x-y+z, C = x+y-z;
        return mkSingle(`Resolva o sistema e diga o valor de x:\nx + y + z = ${nm(A)}\nx − y + z = ${nm(B)}\nx + y − z = ${nm(C)}`, x,
          [`Some a 2ª com a 3ª: o y e o z somem → 2x = ${nm(B)} + ${np(C)} = ${nm(B+C)}`, `x = ${nm(x)}`]); },
    }
  },
  {
    id:'conicas', name:'Cônicas', sym:'⬭',
    learn:`<p>Pegue um cone de sorvete e corte com uma faca reta. Dependendo da inclinação do corte, aparece uma curva diferente — por isso se chamam <b>cônicas</b>: <b>circunferência</b> (corte reto), <b>elipse</b> (corte inclinado, uma "bola achatada"), <b>parábola</b> e <b>hipérbole</b> (cortes que "abrem").</p>
    <div class="section-title">Elipse</div>
    <p>É o caminho dos planetas em volta do Sol. Tem dois pontos especiais, os <b>focos</b>. A regra: de qualquer ponto da elipse, a soma das distâncias até os dois focos é sempre a mesma (= 2a). Dá pra desenhar com um barbante preso em dois pregos!</p>
    <div class="example-box mono">x²/a² + y²/b² = 1   ·   a² = b² + c²</div>
    <p>O <b>a</b> é metade do eixo maior, o <b>b</b> é metade do eixo menor e o <b>c</b> é a distância do centro até cada foco. Eixo maior = 2a; distância focal = 2c.</p>
    <div class="section-title">Hipérbole</div>
    <p>Duas curvas "abertas", de costas uma pra outra. A <b>diferença</b> das distâncias aos focos é sempre a mesma.</p>
    <div class="example-box mono">x²/a² − y²/b² = 1   ·   c² = a² + b²</div>
    <div class="section-title">Parábola</div>
    <p>A curva do chute de uma bola. Cada ponto dela fica à mesma distância de um ponto (o foco) e de uma reta (a diretriz). As antenas parabólicas usam essa forma: todo sinal que chega reflete pro foco.</p>
    <div class="section-title">Como reconhecer pela equação</div>
    <p>x² e y² com sinais <b>iguais</b> e números diferentes embaixo → elipse. Sinais <b>diferentes</b> → hipérbole. Só um deles ao quadrado → parábola.</p>`,
    examples:[
      {title:'Exemplo 1 (eixo maior)', text:'Elipse x²/25 + y²/9 = 1. Qual o eixo maior?', qVisual: stepChain(['a² = 25 → a = 5', 'eixo maior = 2a = 10']), steps:['O maior número embaixo é a² = 25, então a = 5.', 'Eixo maior = 2a = 10.']},
      {title:'Exemplo 2 (focos da elipse)', text:'Na mesma elipse, qual a distância focal?', qVisual: stepChain(['a² = b² + c² → 25 = 9 + c²', 'c² = 16 → c = 4', '2c = 8']), steps:['25 = 9 + c² → c = 4.', 'Distância entre os focos = 2c = 8.']},
      {title:'Exemplo 3 (hipérbole)', text:'Hipérbole x²/9 − y²/16 = 1. Qual o c?', qVisual: stepChain(['c² = a² + b² = 9 + 16 = 25', 'c = 5']), steps:['Na hipérbole, c² = a² + b².', 'c² = 25 → c = 5.']},
    ],
    gen:{
      facil:()=>{ const a = randInt(3,12); let b; do{ b = randInt(2,11); }while(b>=a);
        return mkSingle(`Qual é a medida do eixo maior da elipse x²/${a*a} + y²/${b*b} = 1?`, 2*a, [`O maior número embaixo é a² = ${a*a}, então a = ${a}.`, `Eixo maior = 2a = ${2*a}`]); },
      medio:()=>{ const t = pick([[5,4,3],[10,8,6],[13,12,5],[15,12,9],[17,15,8]]);
        return mkSingle(`Qual é a distância entre os focos (distância focal) da elipse x²/${t[0]**2} + y²/${t[1]**2} = 1?`, 2*t[2],
          [`Na elipse: a² = b² + c² → ${t[0]**2} = ${t[1]**2} + c²`, `c² = ${t[2]**2} → c = ${t[2]}`, `Distância focal = 2c = ${2*t[2]}`]); },
      dificil:()=>{ const t = pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15]]);
        return mkSingle(`Qual é a distância focal da hipérbole x²/${t[0]**2} − y²/${t[1]**2} = 1?`, 2*t[2],
          [`Na hipérbole: c² = a² + b² = ${t[0]**2} + ${t[1]**2} = ${t[2]**2}`, `c = ${t[2]}`, `Distância focal = 2c = ${2*t[2]}`]); },
    }
  },
  {
    id:'condicional', name:'Probabilidade condicional', sym:'A|B',
    learn:`<p>Probabilidade condicional é a chance de algo acontecer <b>sabendo</b> que outra coisa já aconteceu. A palavra-chave nas questões é <b>"sabendo que"</b> ou <b>"dado que"</b>.</p>
    <div class="section-title">A ideia: o universo diminui</div>
    <p>Um dado é lançado. A chance de sair 6 é 1/6. Mas e se alguém espiar e disser "saiu um número par"? Agora só sobram 2, 4 e 6 — <b>3 casos</b>. A chance de ser 6 passa a ser <b>1/3</b>.</p>
    <div class="example-box mono">P(A dado B) = casos em que acontecem A e B ÷ casos de B</div>
    <div class="section-title">Tabelas (o jeito mais comum no ENEM)</div>
    <p>Numa turma, 12 meninas e 18 meninos; 5 meninas e 3 meninos usam óculos. Sorteando alguém <b>que usa óculos</b>, qual a chance de ser menina? O universo agora são só os 8 de óculos, e 5 deles são meninas: <b>5/8</b>.</p>
    <div class="section-title">Cuidado</div>
    <p>"Chance de ser menina, sabendo que usa óculos" (5/8) é diferente de "chance de usar óculos, sabendo que é menina" (5/12). Sempre pergunte: <b>quem é o novo universo?</b> É o que vem depois do "sabendo que".</p>`,
    examples:[
      {title:'Exemplo 1 (dado)', text:'Saiu número ímpar num dado. Qual a chance de ser maior que 2?', qVisual: stepChain(['universo: 1, 3, 5', 'maiores que 2: 3, 5', 'P = 2/3']), steps:['Sabendo que é ímpar, sobram 1, 3 e 5.', 'Desses, 3 e 5 são maiores que 2: 2/3.']},
      {title:'Exemplo 2 (tabela)', text:'Num grupo, 40 pessoas gostam de futebol: 25 homens e 15 mulheres. Sorteando um fã de futebol, chance de ser mulher?', qVisual: stepChain(['universo: 40 fãs', 'mulheres: 15', '15/40 = 3/8']), steps:['O novo universo são os 40 fãs.', '15 são mulheres: 15/40 = 3/8.']},
    ],
    gen:{
      facil:()=>{
        const conds = [['par',[2,4,6]],['ímpar',[1,3,5]],['maior que 2',[3,4,5,6]],['menor que 5',[1,2,3,4]]];
        const evs = [['maior que 3',v=>v>3],['menor que 4',v=>v<4],['igual a 1 ou 6',v=>v===1||v===6],['múltiplo de 3',v=>v%3===0],['primo',v=>[2,3,5].includes(v)]];
        let c, e, fav; do{ c = pick(conds); e = pick(evs); fav = c[1].filter(e[1]); }while(!fav.length || fav.length===c[1].length);
        const [p,q] = simplifyFrac(fav.length, c[1].length);
        return mkFrac(`Um dado comum foi lançado e sabe-se que saiu um número ${c[0]}. Qual a probabilidade de o número ser ${e[0]}? (responda como fração)`, p, q,
          [`Novo universo (${c[0]}): ${c[1].join(', ')} → ${c[1].length} casos`, `Desses, ${e[0]}: ${fav.join(', ')} → ${fav.length} casos`, `P = ${fav.length}/${c[1].length}${q!==c[1].length?` = ${p}/${q}`:''}`]); },
      medio:()=>{ const f = randInt(10,20), m = randInt(10,20), fo = randInt(2,f-2), mo = randInt(2,m-2), [p,q] = simplifyFrac(fo, fo+mo);
        return mkFrac(`Numa turma há ${f} meninas e ${m} meninos. Usam óculos ${fo} meninas e ${mo} meninos. Sorteando um aluno que usa óculos, qual a probabilidade de ser menina? (responda como fração)`, p, q,
          [`Novo universo: quem usa óculos → ${fo} + ${mo} = ${fo+mo}`, `Meninas de óculos: ${fo}`, `P = ${fo}/${fo+mo}${q!==fo+mo?` = ${p}/${q}`:''}`]); },
      dificil:()=>{ const s = randInt(4,10), pairs = []; for(let a=1;a<=6;a++) for(let b=1;b<=6;b++) if(a+b===s) pairs.push([a,b]);
        const eq = pairs.filter(([a,b])=>a===b).length;
        if(!eq) return SUBJECTS.find(x=>x.id==='condicional').gen.dificil();
        const [p,q] = simplifyFrac(eq, pairs.length);
        return mkFrac(`Dois dados foram lançados e a soma deu ${s}. Qual a probabilidade de os dois dados mostrarem o mesmo número? (responda como fração)`, p, q,
          [`Pares com soma ${s}: ${pairs.map(([a,b])=>`(${a},${b})`).join(' ')} → ${pairs.length} casos`, `Números iguais: ${pairs.filter(([a,b])=>a===b).map(([a,b])=>`(${a},${b})`).join(' ')} → ${eq}`, `P = ${eq}/${pairs.length}${q!==pairs.length?` = ${p}/${q}`:''}`]); },
    }
  },
  {
    id:'eqtrig', name:'Equações trigonométricas', sym:'x°',
    learn:`<p>Uma equação trigonométrica pergunta: <b>que ângulo</b> tem esse seno (ou cosseno, ou tangente)? Ex.: sen x = 1/2. Um ângulo é fácil: 30°. Mas no ciclo trigonométrico (a volta de 0° a 360°) quase sempre existem <b>dois</b> ângulos com o mesmo valor.</p>
    <div class="section-title">Tabela dos ângulos notáveis (decore!)</div>
    <table class="mini-table">
      <tr><th></th><th>30°</th><th>45°</th><th>60°</th></tr>
      <tr><th>sen</th><td>1/2</td><td>√2/2</td><td>√3/2</td></tr>
      <tr><th>cos</th><td>√3/2</td><td>√2/2</td><td>1/2</td></tr>
      <tr><th>tg</th><td>√3/3</td><td>1</td><td>√3</td></tr>
    </table>
    <div class="section-title">Seno: espelho na vertical</div>
    <p>O seno é a "altura" no ciclo. A mesma altura aparece em x e em <b>180° − x</b>. Então sen x = 1/2 tem x = 30° e x = 150°.</p>
    <div class="section-title">Cosseno: espelho na horizontal</div>
    <p>O cosseno é o "lado" no ciclo. O mesmo valor aparece em x e em <b>360° − x</b>. Então cos x = 1/2 tem x = 60° e x = 300°.</p>
    <div class="section-title">Valores negativos</div>
    <p>Seno negativo fica "embaixo" (3º e 4º quadrantes): sen x = −1/2 → 180° + 30° = 210° e 360° − 30° = 330°. Cosseno negativo fica "à esquerda" (2º e 3º): cos x = −1/2 → 180° − 60° = 120° e 180° + 60° = 240°.</p>
    <div class="section-title">Passo a passo</div>
    <p>1) Ache o ângulo "base" no 1º quadrante usando a tabela. 2) Use o espelho certo pra achar o outro. 3) Se pedir todas as voltas, some 360° quantas vezes quiser.</p>`,
    examples:[
      {title:'Exemplo 1 (seno)', text:'sen x = √2/2, com 0° ≤ x < 360°', qVisual: stepChain(['base: 45°', 'espelho do seno: 180° − 45° = 135°', 'x = 45° ou 135°']), steps:['Na tabela, sen 45° = √2/2.', 'O outro é 180° − 45° = 135°.']},
      {title:'Exemplo 2 (cosseno negativo)', text:'cos x = −√3/2, com 0° ≤ x < 360°', qVisual: stepChain(['base: cos 30° = √3/2', 'negativo: 2º e 3º quadrantes', '180 − 30 = 150° e 180 + 30 = 210°']), steps:['O ângulo base é 30°.', 'Cosseno negativo: 150° e 210°.']},
    ],
    gen:{
      facil:()=>{ const t = pick([['sen','1/2',30],['sen','√2/2',45],['sen','√3/2',60],['cos','1/2',60],['cos','√2/2',45],['cos','√3/2',30],['tg','1',45],['tg','√3',60]]);
        return mkSingle(`Qual é o menor ângulo positivo x (em graus) tal que ${t[0]} x = ${t[1]}?`, t[2], [`Pela tabela dos ângulos notáveis, ${t[0]} ${t[2]}° = ${t[1]}`, `x = ${t[2]}°`]); },
      medio:()=>{ const t = pick([['1/2',30],['√2/2',45],['√3/2',60]]), fn = pick(['sen','cos']);
        const b = fn==='sen' ? 180-t[1] : 360-t[1];
        return mkPair(`Resolva ${fn} x = ${t[0]} para 0° ≤ x < 360°. (Dê as duas soluções, em graus.)`, t[1], b,
          [`Ângulo base: ${t[1]}°`, fn==='sen' ? `Seno: o outro é 180° − ${t[1]}° = ${b}°` : `Cosseno: o outro é 360° − ${t[1]}° = ${b}°`, `x = ${t[1]}° ou ${b}°`]); },
      dificil:()=>{ const t = pick([['1/2',30,60],['√2/2',45,45],['√3/2',60,30]]), fn = pick(['sen','cos']);
        let a, b, base;
        if(fn==='sen'){ base = t[1]; a = 180+base; b = 360-base; } else { base = t[2]; a = 180-base; b = 180+base; }
        return mkPair(`Resolva ${fn} x = −${t[0]} para 0° ≤ x < 360°. (Dê as duas soluções, em graus.)`, a, b,
          [`Ângulo base (sem o sinal): ${fn} ${base}° = ${t[0]}`, fn==='sen' ? 'Seno negativo: 3º e 4º quadrantes (embaixo).' : 'Cosseno negativo: 2º e 3º quadrantes (à esquerda).',
           fn==='sen' ? `180° + ${base}° = ${a}° e 360° − ${base}° = ${b}°` : `180° − ${base}° = ${a}° e 180° + ${base}° = ${b}°`]); },
    }
  },
  {
    id:'parcelamento', name:'Parcelamento e financiamento', sym:'12×',
    learn:`<p>Quase toda loja oferece: "R$ 1 000 à vista ou 12 × de R$ 100". Parece a mesma coisa, mas não é. Saber comparar protege o seu bolso — e cai muito no ENEM.</p>
    <div class="section-title">1. Some tudo o que vai pagar</div>
    <p>12 × R$ 100 = <b>R$ 1 200</b>. Comparando com R$ 1 000 à vista, você paga <b>R$ 200 de juros</b> escondidos no parcelamento. Em porcentagem: 200 ÷ 1 000 = 20% a mais.</p>
    <div class="section-title">2. Com entrada</div>
    <p>"Entrada de R$ 300 + 4 × R$ 200": total = 300 + 800 = R$ 1 100. A entrada é paga na hora, então só o resto é <b>financiado</b>.</p>
    <div class="section-title">3. A taxa de juros de verdade</div>
    <p>Exemplo: à vista R$ 500, ou duas parcelas de R$ 270 (uma agora e outra daqui a 1 mês). Pagando a primeira agora, você fica devendo 500 − 270 = <b>R$ 230</b>, e daqui a um mês paga R$ 270 por essa dívida. Juros: 270 − 230 = 40. Taxa: 40 ÷ 230 ≈ 17,4% ao mês — bem caro!</p>
    <div class="section-title">4. Financiamento (Tabela Price)</div>
    <p>Em financiamentos longos (carro, casa) as parcelas são iguais e cada uma paga juros compostos. A fórmula da parcela é:</p>
    <div class="example-box mono">parcela = valor × i ÷ (1 − (1 + i)⁻ⁿ)</div>
    <p>Não se assuste: nas provas ela costuma vir pronta no enunciado, e o que importa é saber que <b>quanto mais parcelas, mais juros você paga no total</b>.</p>`,
    examples:[
      {title:'Exemplo 1 (quanto de juros)', text:'TV: R$ 2 000 à vista ou 10 × R$ 230. Quanto se paga de juros?', qVisual: stepChain(['10 × 230 = 2 300', '2 300 − 2 000 = R$ 300']), steps:['Total a prazo: 10 × 230 = R$ 2 300.', 'Juros: 2 300 − 2 000 = R$ 300 (15% a mais).']},
      {title:'Exemplo 2 (taxa mensal)', text:'À vista R$ 400, ou R$ 220 agora + R$ 198 daqui a 1 mês. Qual a taxa?', qVisual: stepChain(['dívida: 400 − 220 = 180', 'juros: 198 − 180 = 18', '18 ÷ 180 = 10% ao mês']), steps:['Depois da 1ª parcela você deve R$ 180.', 'Paga 198 por ela: juros de 18, que é 10% de 180.']},
    ],
    gen:{
      facil:()=>{ const n = pick([3,4,5,6,10,12]), v = pick([600,800,1000,1200,1500,2000,2400,3000]), j = pick([5,10,15,20,25])*v/100, p = (v+j)/n;
        if(Math.abs(p-Math.round(p*100)/100)>1e-9) return SUBJECTS.find(s=>s.id==='parcelamento').gen.facil();
        return mkSingle(`Um celular custa R$ ${v} à vista ou ${n} parcelas de R$ ${reais2(p)}. Quantos reais de juros paga quem parcela?`, j, [`Total a prazo: ${n} × ${reais2(p)} = R$ ${fmt(n*p)}`, `Juros: ${fmt(n*p)} − ${v} = R$ ${fmt(j)}`]); },
      medio:()=>{ const v = pick([500,800,1000,1200,2000]), pc = pick([5,8,10,12,20,25]), tot = v*(100+pc)/100, e = pick([100,200,300].filter(x=>x<tot)), n = pick([2,4,5]), p = (tot-e)/n;
        if(Math.abs(p-Math.round(p*100)/100)>1e-9) return SUBJECTS.find(s=>s.id==='parcelamento').gen.medio();
        return mkSingle(`Uma geladeira custa R$ ${v} à vista, ou R$ ${e} de entrada mais ${n} parcelas de R$ ${reais2(p)}. Quantos por cento a mais paga quem compra a prazo?`, pc,
          [`Total a prazo: ${e} + ${n} × ${reais2(p)} = R$ ${fmt(tot)}`, `A mais: ${fmt(tot)} − ${v} = R$ ${fmt(tot-v)}`, `${fmt(tot-v)} ÷ ${v} = ${pc}%`]); },
      dificil:()=>{ const f = pick([100,200,300,400,500]), i = pick([5,10,20,25]), p = f*(100+i)/100, v = f+p;
        return mkSingle(`Um produto custa R$ ${fmt(v)} à vista, ou 2 parcelas de R$ ${reais2(p)}: uma no ato da compra e outra 1 mês depois. Qual é a taxa de juros mensal cobrada, em %?`, i,
          [`Pagando a 1ª parcela agora, você fica devendo ${fmt(v)} − ${fmt(p)} = R$ ${fmt(f)}`, `Um mês depois paga R$ ${fmt(p)} por essa dívida: juros de ${fmt(p-f)}`, `${fmt(p-f)} ÷ ${fmt(f)} = ${i}% ao mês`]); },
    }
  },
);
