/* =========================================================
   ASSUNTOS DO ENSINO FUNDAMENTAL (18)
   Cria a lista SUBJECTS. Cada assunto tem explicação (learn), exemplos
   e gerador de questões fácil/médio/difícil (gen).
   ========================================================= */
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
          return mkSingle(`Nas 3 primeiras provas, um aluno tirou ${known.join(', ')}. Que nota ele precisa tirar na 4ª prova pra ficar com média ${target}?`, need,
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
