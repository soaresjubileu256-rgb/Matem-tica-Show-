/* =========================================================
   MAIS QUESTÕES — LOTE 2 (27/11/2026)
   Tipos novos de pergunta, com mais problemas do dia a dia (enunciados com
   contexto), pros assuntos que tinham poucos tipos. Entram no sorteio junto com
   o lote 1 (mais-questoes.js). Desafios do Dia de antes de MQ_LOTE2_DESDE são
   recriados sem este lote, pra correção bater com o que foi respondido.
   Usa MQ_NOMES, mqReais e mqTry de mais-questoes.js (só na hora de gerar).
   ========================================================= */
/* " + 3x", " − x", " − 5" (some quando o número é 0) */
const mqT = (c, v)=> c===0 ? '' : ` ${c<0?'−':'+'} ${Math.abs(c)===1 && v ? '' : Math.abs(c)}${v}`;
const MAIS_QUESTOES_2 = {
  /* ---------------- 1º ao 5º ano ---------------- */
  adicao:{
    medio:[
      ()=>{ const a=randInt(120,480), b=randInt(30,200), c=randInt(20,150);
        return mkSingle(`Uma biblioteca tinha ${a} livros. Recebeu ${b} de doação e comprou mais ${c}. Quantos livros tem agora?`, a+b+c, [`Junte tudo: ${a} + ${b} + ${c}.`, `${a} + ${b} = ${a+b}`, `${a+b} + ${c} = ${a+b+c}`]); },
      ()=>{ const m=randInt(150,450), t=randInt(120,420);
        return mkSingle(`Uma escola tem ${m} alunos de manhã e ${t} à tarde. Quantos alunos são ao todo?`, m+t, [`"Ao todo" é somar os dois turnos.`, `${m} + ${t} = ${m+t}`]); },
    ],
    dificil:[
      ()=>{ const n=randInt(10,90), s=3*n+3;
        return mkSingle(`A soma de três números consecutivos é ${s}. Qual é o maior deles?`, n+2, [`Chame os números de n, n + 1 e n + 2: a soma é 3n + 3.`, `3n + 3 = ${s} → 3n = ${s-3} → n = ${n}.`, `O maior é n + 2 = ${n+2}`]); },
      ()=>{ const nm=pick(MQ_NOMES), a=randInt(15,60), b=randInt(15,60);
        return mkSingle(`Num jogo, ${nm} fez ${a} pontos na 1ª rodada, ${b} na 2ª e, na 3ª, o dobro do que fez na 1ª. Quantos pontos fez no total?`, a+b+2*a, [`Na 3ª rodada: 2 × ${a} = ${2*a}.`, `Total: ${a} + ${b} + ${2*a} = ${3*a+b}`]); },
    ],
  },
  subtracao:{
    medio:[
      ()=>{ const nm=pick(MQ_NOMES), y=randInt(1950,2016);
        return mkSingle(`${nm} nasceu em ${y}. Quantos anos completa em 2026?`, 2026-y, [`Idade = ano atual − ano em que nasceu.`, `2026 − ${y} = ${2026-y}`]); },
      ()=>{ const p=randInt(150,480), l=randInt(40,p-20);
        return mkSingle(`Um livro tem ${p} páginas. Já li ${l}. Quantas páginas faltam?`, p-l, [`"Quanto falta" é tirar o que já foi lido do total.`, `${p} − ${l} = ${p-l}`]); },
    ],
    dificil:[
      ()=>{ const nm=pick(MQ_NOMES), x=randInt(150,500), a=randInt(20,90), b=randInt(20,x-a-10);
        return mkSingle(`${nm} tinha R$ ${x}. Gastou R$ ${a} no mercado e depois R$ ${b} na farmácia. Quantos reais sobraram?`, x-a-b, [`Tire um gasto de cada vez (ou some os gastos: ${a} + ${b} = ${a+b}).`, `${x} − ${a+b} = ${x-a-b}`]); },
      ()=>{ const M=randInt(60,300), d=randInt(10,M-10);
        return mkSingle(`A diferença entre dois números é ${d} e o maior deles é ${M}. Qual é a soma dos dois?`, M+(M-d), [`O menor é ${M} − ${d} = ${M-d}.`, `Soma: ${M} + ${M-d} = ${2*M-d}`]); },
    ],
  },
  multiplicacao:{
    medio:[
      ()=>{ const c=randInt(32,48), o=randInt(3,9);
        return mkSingle(`Cada ônibus leva ${c} passageiros. Quantos passageiros cabem em ${o} ônibus iguais?`, c*o, [`Grupos iguais: multiplique.`, `${c} × ${o} = ${c*o}`]); },
      ()=>{ const a=randInt(2,6), b=randInt(2,5), nm=pick(MQ_NOMES);
        return mkSingle(`${nm} tem ${a} camisetas e ${b} bermudas. Quantas roupas diferentes (camiseta + bermuda) dá pra montar?`, a*b, [`Cada camiseta combina com cada bermuda.`, `${a} × ${b} = ${a*b} combinações`]); },
    ],
    dificil:[
      ()=>{ const f=randInt(12,25), c=randInt(12,20), s=randInt(50,f*c-20);
        return mkSingle(`Um teatro tem ${f} fileiras com ${c} cadeiras cada. Já foram ocupadas ${s}. Quantas cadeiras estão vazias?`, f*c-s, [`Total de cadeiras: ${f} × ${c} = ${f*c}.`, `Vazias: ${f*c} − ${s} = ${f*c-s}`]); },
      ()=>{ const l=pick([12,18,24,30]), cx=randInt(11,25);
        return mkSingle(`Uma caixa tem ${l} latas de suco. Um mercado comprou ${cx} caixas. Quantas latas são?`, l*cx, [`${cx} caixas de ${l}: multiplique.`, `${cx} × ${l} = ${cx*l}`]); },
    ],
  },
  divisao:{
    medio:[
      ()=>{ const n=mqTry(()=>randInt(13,45), v=>v%4!==0);
        return mkSingle(`${n} pessoas vão viajar em carros de 4 lugares (sem contar o motorista). Quantos carros são necessários, no mínimo?`, Math.ceil(n/4), [`${n} ÷ 4 = ${Math.floor(n/4)} e sobram ${n%4} pessoas.`, `As que sobram precisam de mais um carro.`, `${Math.floor(n/4)} + 1 = ${Math.ceil(n/4)} carros`]); },
      ()=>{ const d=randInt(30,120);
        return mkSingle(`Quantas semanas completas há em ${d} dias?`, Math.floor(d/7), [`Uma semana tem 7 dias: divida ${d} por 7.`, `${d} ÷ 7 = ${Math.floor(d/7)} e sobram ${d%7} dias.`, `São ${Math.floor(d/7)} semanas completas`]); },
    ],
    dificil:[
      ()=>{ const d=randInt(3,9), q=randInt(12,60), r=randInt(1,d-1), n=d*q+r;
        return mkSingle(`Qual é o resto da divisão de ${n} por ${d}?`, r, [`${d} × ${q} = ${d*q}.`, `${n} − ${d*q} = ${r}. Esse é o resto.`]); },
      ()=>{ const k=randInt(3,8), cada=randInt(25,150), t=k*cada;
        return mkSingle(`Um prêmio de R$ ${t} foi dividido igualmente entre ${k} amigos. Quantos reais cada um recebeu?`, cada, [`Repartir igualmente: ${t} ÷ ${k}.`, `${t} ÷ ${k} = ${cada}`]); },
    ],
  },
  dinheiro:{
    facil:[
      ()=>{ const a=randInt(1,5), b=randInt(1,9);
        return mkSingle(`Tenho ${a} ${a>1?'notas':'nota'} de R$ 10 e ${b} ${b>1?'moedas':'moeda'} de R$ 1. Quantos reais tenho?`, 10*a+b, [`Notas: ${a} × 10 = ${10*a}.`, `${10*a} + ${b} = ${10*a+b} reais`]); },
      ()=>{ const p=randInt(3,9), q=randInt(2,5);
        return mkSingle(`Um sorvete custa R$ ${p}. Quanto pago por ${q} sorvetes? (em reais)`, p*q, [`${q} sorvetes iguais: multiplique.`, `${q} × ${p} = ${p*q} reais`]); },
      ()=>{ const p=randInt(6,18);
        return mkSingle(`Paguei um lanche de R$ ${p} com uma nota de R$ 20. Quanto recebi de troco? (em reais)`, 20-p, [`Troco = o que paguei − o preço.`, `20 − ${p} = ${20-p} reais`]); },
    ],
  },
  fracoes:{
    medio:[
      ()=>{ const nm=pick(MQ_NOMES), d=pick([6,8,10,12]), a=randInt(1,d-1);
        return mkFrac(`A pizza de ${nm} foi cortada em ${d} pedaços iguais e ${a} foram comidos. Que fração da pizza sobrou? (simplifique se der)`, d-a, d, [`Sobraram ${d} − ${a} = ${d-a} pedaços de ${d}.`, `Fração: ${d-a}/${d} = ${fracStr(d-a,d)}`]); },
      ()=>{ const d=pick([3,4,5,6]), n=randInt(1,d-1), k=randInt(3,15), t=d*k;
        return mkSingle(`Quanto é ${n}/${d} de ${t}?`, n*k, [`Primeiro ache 1/${d}: ${t} ÷ ${d} = ${k}.`, `Depois multiplique por ${n}: ${k} × ${n} = ${n*k}`]); },
    ],
    dificil:[
      ()=>{ const [a,b]=pick([[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6]]), l=a*b, r=l-b-a;
        return mkFrac(`Gastei 1/${a} do salário com aluguel e 1/${b} com comida. Que fração do salário sobrou?`, r, l, [`Gasto: 1/${a} + 1/${b} = ${b}/${l} + ${a}/${l} = ${a+b}/${l}.`, `Sobra: 1 − ${a+b}/${l} = ${r}/${l} = ${fracStr(r,l)}`]); },
      ()=>{ const a=randInt(1,5), b=randInt(2,7), c=randInt(1,5), d=randInt(2,7);
        return mkFrac(`${a}/${b} × ${c}/${d} = ? (simplifique se der)`, a*c, b*d, [`Multiplique em cima com em cima e embaixo com embaixo.`, `${a} × ${c} = ${a*c} e ${b} × ${d} = ${b*d}.`, `${a*c}/${b*d} = ${fracStr(a*c,b*d)}`]); },
    ],
  },
  decimais:{
    medio:[
      ()=>{ const c=randInt(120,890), q=randInt(2,6);
        return mkSingle(`Uma caneta custa ${mqReais(c/100)}. Quanto custam ${q} canetas? (em reais)`, c*q/100, [`Multiplique o preço pela quantidade.`, `${q} × ${mqReais(c/100)} = ${mqReais(c*q/100)}`]); },
      ()=>{ const a=randInt(11,99), b=randInt(2,9);
        return mkSingle(`${String(a/10).replace('.',',')} × ${b} = ?`, a*b/10, [`Faça ${a} × ${b} = ${a*b} sem a vírgula.`, `Como havia 1 casa depois da vírgula, a resposta também tem 1: ${String(a*b/10).replace('.',',')}`]); },
    ],
    dificil:[
      ()=>{ const k=randInt(2,5), cada=randInt(150,1200)*5, t=k*cada;
        return mkSingle(`Uma conta de ${mqReais(t/100)} foi dividida igualmente entre ${k} pessoas. Quanto cada uma pagou? (em reais)`, cada/100, [`Divida o total por ${k}.`, `${mqReais(t/100)} ÷ ${k} = ${mqReais(cada/100)}`]); },
      ()=>{ const [p,ps]=pick([[0.1,'0,1'],[0.2,'0,2'],[0.25,'0,25'],[0.5,'0,5'],[0.75,'0,75']]), n=20*randInt(2,15);
        return mkSingle(`Quanto é ${ps} de ${n}?`, Math.round(p*n*100)/100, [`"${ps} de" é multiplicar por ${ps}.`, `${ps} × ${n} = ${String(Math.round(p*n*100)/100).replace('.',',')}`]); },
    ],
  },
  porcentagem:{
    medio:[
      ()=>{ const p=10*randInt(4,30), d=pick([10,20,25,30,50]), f=p*(100-d)/100;
        return mkSingle(`Uma mochila custa R$ ${p} e está com ${d}% de desconto. Quanto vai custar? (em reais)`, f, [`Desconto: ${d}% de ${p} = ${p*d/100}.`, `${p} − ${p*d/100} = ${f} reais`]); },
      ()=>{ const y=pick([40,80,120,200]), pc=pick([10,20,25,40,50,75]), x=y*pc/100;
        return mkSingle(`${x} é quantos por cento de ${y}?`, pc, [`Divida a parte pelo todo: ${x} ÷ ${y} = ${pc/100}.`, `Vezes 100: ${pc}%`]); },
    ],
    dificil:[
      ()=>{ const p=100*randInt(2,15);
        return mkSingle(`Um produto de R$ ${p} subiu 10% e, depois, teve 10% de desconto. Qual é o preço final? (em reais)`, p*99/100, [`Depois do aumento: ${p} × 1,1 = ${p*11/10}.`, `Depois do desconto: ${p*11/10} × 0,9 = ${String(p*99/100).replace('.',',')}.`, `Repare: o preço final é menor que o inicial!`]); },
      ()=>{ const n=pick([20,25,40,50]), pc=pick([20,40,60,80]), g=n*pc/100;
        return mkSingle(`Numa turma de ${n} alunos, ${pc}% são meninas. Quantos são meninos?`, n-g, [`Meninas: ${pc}% de ${n} = ${g}.`, `Meninos: ${n} − ${g} = ${n-g}`]); },
    ],
  },
  unidades:{
    facil:[
      ()=>{ const [a,b,f]=pick([['metros','centímetros',100],['quilômetros','metros',1000],['quilos','gramas',1000],['litros','mililitros',1000],['horas','minutos',60],['minutos','segundos',60]]), n=randInt(2,9);
        return mkSingle(`Quantos ${b} há em ${n} ${a}?`, n*f, [`1 ${a.replace(/s$/,'')} = ${f} ${b}.`, `${n} × ${f} = ${n*f} ${b}`]); },
      ()=>{ const h=randInt(1,4), m=randInt(5,55);
        return mkSingle(`Um filme dura ${h} ${h>1?'horas':'hora'} e ${m} minutos. Quantos minutos são ao todo?`, 60*h+m, [`1 hora = 60 minutos: ${h} × 60 = ${60*h}.`, `${60*h} + ${m} = ${60*h+m} minutos`]); },
      ()=>{ const m=randInt(1,5), p=pick([10,20,25,50]);
        return mkSingle(`Um rolo tem ${m} ${m>1?'metros':'metro'} de fita. Quantos pedaços de ${p} cm dá pra cortar?`, m*100/p, [`${m} m = ${m*100} cm.`, `${m*100} ÷ ${p} = ${m*100/p} pedaços`]); },
    ],
  },
  geometria:{
    medio:[
      ()=>{ const c=randInt(5,20), l=randInt(4,15), p=randInt(8,25);
        return mkSingle(`Um quintal retangular mede ${c} m por ${l} m. A grama custa R$ ${p} o m². Quanto custa gramar o quintal todo? (em reais)`, c*l*p, [`Área: ${c} × ${l} = ${c*l} m².`, `Custo: ${c*l} × ${p} = ${c*l*p} reais`]); },
      ()=>{ const c=randInt(6,25), l=randInt(4,18), v=randInt(2,4), per=2*(c+l);
        return mkSingle(`Vou cercar um terreno retangular de ${c} m por ${l} m com ${v} voltas de arame. Quantos metros de arame preciso?`, per*v, [`Perímetro: 2 × (${c} + ${l}) = ${per} m.`, `${v} voltas: ${per} × ${v} = ${per*v} m`]); },
      ()=>{ const b=2*randInt(2,12), h=randInt(3,15);
        return mkSingle(`Qual é a área de um triângulo de base ${b} cm e altura ${h} cm? (em cm²)`, b*h/2, [`Área do triângulo = base × altura ÷ 2.`, `${b} × ${h} ÷ 2 = ${b*h/2} cm²`]); },
    ],
    dificil:[
      ()=>{ const P=4*randInt(3,20), l=P/4;
        return mkSingle(`Um quadrado tem perímetro ${P} cm. Qual é a sua área? (em cm²)`, l*l, [`Os 4 lados são iguais: ${P} ÷ 4 = ${l} cm.`, `Área: ${l} × ${l} = ${l*l} cm²`]); },
      ()=>{ const a=randInt(2,8), b=randInt(2,6);
        return mkSingle(`Uma sala mede ${a} m por ${b} m. Quantos pisos quadrados de 50 cm de lado são necessários pra cobrir o chão?`, (2*a)*(2*b), [`Em cada metro cabem 2 pisos de 50 cm.`, `${2*a} pisos num lado e ${2*b} no outro.`, `${2*a} × ${2*b} = ${4*a*b} pisos`]); },
      ()=>{ const C=randInt(8,15), L=randInt(6,12), c=randInt(2,C-3), l=randInt(2,L-3);
        return mkSingle(`De um terreno retangular de ${C} m por ${L} m, foi tirado um canto retangular de ${c} m por ${l} m para um jardim. Qual é a área que sobrou? (em m²)`, C*L-c*l, [`Área total: ${C} × ${L} = ${C*L} m².`, `Canto: ${c} × ${l} = ${c*l} m².`, `${C*L} − ${c*l} = ${C*L-c*l} m²`]); },
    ],
  },
  /* ---------------- 6º ao 9º ano ---------------- */
  mmcmdc:{
    medio:[
      ()=>{ const [a,b]=pick([[10,15],[12,18],[15,20],[6,8],[8,12],[20,30],[12,16]]), m=lcm(a,b);
        return mkSingle(`Dois ônibus saem juntos do terminal. Um sai a cada ${a} minutos e o outro a cada ${b}. Daqui a quantos minutos saem juntos de novo?`, m, [`Procure o primeiro múltiplo comum de ${a} e ${b}: é o MMC.`, `MMC(${a}, ${b}) = ${m}`, `Saem juntos de novo em ${m} minutos`]); },
    ],
    dificil:[
      ()=>{ const g=pick([4,5,6,8,10,12]), a=g*randInt(3,9), b=g*mqTry(()=>randInt(3,11), v=>gcd(v, a/g)===1 && v!==a/g), m=gcd(a,b);
        return mkSingle(`Tenho duas fitas, de ${a} cm e de ${b} cm. Quero cortar as duas em pedaços iguais, do maior tamanho possível, sem sobrar nada. Quantos cm terá cada pedaço?`, m, [`O tamanho tem que dividir ${a} e ${b}: é o MDC.`, `MDC(${a}, ${b}) = ${m} cm`]); },
    ],
  },
  regra3comp:{
    facil:[
      ()=>{ const v = mqTry(()=>{ const p1=randInt(2,6), p2=randInt(2,8), m1=randInt(1,4), m2=randInt(1,6), d=randInt(2,12); return {p1,p2,m1,m2,d,r:d*m2*p1/(m1*p2)}; }, o=> Number.isInteger(o.r) && o.r>0 && (o.p1!==o.p2 || o.m1!==o.m2));
        const {p1,p2,m1,m2,d,r} = v;
        return mkSingle(`${p1} pedreiros constroem ${m1} ${m1>1?'muros':'muro'} em ${d} dias. Em quantos dias ${p2} pedreiros constroem ${m2} ${m2>1?'muros':'muro'} iguais?`, r, [`Mais muros → mais dias (direta). Mais pedreiros → menos dias (inversa).`, `dias = ${d} × ${m2}/${m1} × ${p1}/${p2}`, `= ${r} dias`]); },
    ],
    medio:[
      ()=>{ const v = mqTry(()=>{ const x=randInt(2,6), y=10*randInt(3,30), h=randInt(2,8), z=randInt(2,9), k=randInt(2,10); return {x,y,h,z,k,r:y*z*k/(x*h)}; }, o=> Number.isInteger(o.r));
        const {x,y,h,z,k,r} = v;
        return mkSingle(`${x} máquinas fazem ${y} peças em ${h} horas. Quantas peças ${z} máquinas fazem em ${k} horas?`, r, [`Mais máquinas → mais peças; mais horas → mais peças (as duas diretas).`, `peças = ${y} × ${z}/${x} × ${k}/${h}`, `= ${r} peças`]); },
    ],
    dificil:[
      ()=>{ const v = mqTry(()=>{ const p=randInt(4,15), h=randInt(4,10), d=randInt(6,30), p2=randInt(4,18), h2=randInt(4,10); return {p,h,d,p2,h2,r:d*p*h/(p2*h2)}; }, o=> Number.isInteger(o.r) && o.r!==o.d);
        const {p,h,d,p2,h2,r} = v;
        return mkSingle(`${p} operários, trabalhando ${h} horas por dia, fazem uma obra em ${d} dias. Em quantos dias ${p2} operários, trabalhando ${h2} horas por dia, fazem a mesma obra?`, r, [`Mais operários ou mais horas por dia → menos dias (as duas inversas).`, `dias = ${d} × ${p}/${p2} × ${h}/${h2}`, `= ${r} dias`]); },
      ()=>{ const v = mqTry(()=>{ const a=randInt(2,10), d=randInt(3,15), k=5*randInt(2,40), a2=randInt(2,12), d2=randInt(3,20); return {a,d,k,a2,d2,r:k*a2*d2/(a*d)}; }, o=> Number.isInteger(o.r));
        const {a,d,k,a2,d2,r} = v;
        return mkSingle(`Para alimentar ${a} cavalos durante ${d} dias são necessários ${k} kg de ração. Quantos kg alimentam ${a2} cavalos durante ${d2} dias?`, r, [`Mais cavalos → mais ração; mais dias → mais ração (diretas).`, `kg = ${k} × ${a2}/${a} × ${d2}/${d}`, `= ${r} kg`]); },
    ],
  },
  conjuntos:{
    facil:[
      ()=>{ const a=randInt(2,9), b=randInt(3,12);
        return mkSingle(`Quantos números inteiros há no intervalo de −${a} até ${b}, contando os dois?`, a+b+1, [`De −${a} até 0 são ${a+1} números; de 1 até ${b} são ${b}.`, `${a+1} + ${b} = ${a+b+1}`]); },
    ],
    medio:[
      ()=>{ const k=randInt(3,9), n=randInt(40,150);
        return mkSingle(`Quantos múltiplos de ${k} há de 1 até ${n}?`, Math.floor(n/k), [`Divida ${n} por ${k} e fique com a parte inteira.`, `${n} ÷ ${k} = ${Math.floor(n/k)} (resto ${n%k})`, `São ${Math.floor(n/k)} múltiplos`]); },
      ()=>{ const a=randInt(10,30), b=randInt(10,30), ab=randInt(3,Math.min(a,b)-2);
        return mkSingle(`Numa sala, ${a} alunos gostam de futebol, ${b} gostam de vôlei e ${ab} gostam dos dois. Quantos gostam de pelo menos um dos esportes?`, a+b-ab, [`Quem gosta dos dois foi contado duas vezes.`, `${a} + ${b} − ${ab} = ${a+b-ab}`]); },
    ],
  },
  inequacoes:{
    facil:[
      ()=>{ const a=randInt(2,15), b=randInt(a+2,40);
        return mkSingle(`Qual é o menor número inteiro que satisfaz x + ${a} > ${b}?`, b-a+1, [`x > ${b} − ${a} → x > ${b-a}.`, `O menor inteiro maior que ${b-a} é ${b-a+1}`]); },
      ()=>{ const a=randInt(2,15), b=randInt(2,30);
        return mkSingle(`Qual é o maior número inteiro que satisfaz x − ${a} < ${b}?`, a+b-1, [`x < ${b} + ${a} → x < ${a+b}.`, `O maior inteiro menor que ${a+b} é ${a+b-1}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,7), b=randInt(1,20), c=b+randInt(5,60), q=Math.floor((c-b)/a);
        return mkSingle(`Qual é o maior número inteiro que satisfaz ${a}x + ${b} ≤ ${c}?`, q, [`${a}x ≤ ${c} − ${b} → ${a}x ≤ ${c-b}.`, `x ≤ ${c-b}/${a}${(c-b)%a? ` ≈ ${String(round2((c-b)/a)).replace('.',',')}` : ` = ${q}`}.`, `Maior inteiro: ${q}`]); },
      ()=>{ const F=pick([20,25,30,35,40]), p=pick([3,4,5,6]), T=F+randInt(10,60), g=Math.floor((T-F)/p);
        return mkSingle(`Um plano de internet custa R$ ${F} fixos mais R$ ${p} por GB extra. Com R$ ${T}, quantos GB extras inteiros dá pra comprar, no máximo?`, g, [`${F} + ${p}·x ≤ ${T} → ${p}·x ≤ ${T-F}.`, `x ≤ ${T-F}/${p} → no máximo ${g} GB`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(2,6), b=randInt(10,40), c=randInt(-20,b-1), t=(b-c)/a, r=Number.isInteger(t)?t-1:Math.floor(t);
        return mkSingle(`Qual é o maior número inteiro que satisfaz −${a}x + ${b} > ${c<0?'−'+(-c):c}?`, r, [`−${a}x > ${c} − ${b} = ${c-b}.`, `Dividindo por −${a}, o sinal vira: x < ${String(round2(t)).replace('.',',')}.`, `Maior inteiro: ${r}`]); },
      ()=>{ const a=randInt(-5,10), b=a+randInt(6,24); let n=0; for(let x=-200;x<=200;x++){ const v=2*x+1; if(v>a && v<=b) n++; }
        return mkSingle(`Quantos números inteiros satisfazem ${a<0?'−'+(-a):a} < 2x + 1 ≤ ${b}?`, n, [`Tire 1: ${a-1} < 2x ≤ ${b-1}.`, `Divida por 2: ${String((a-1)/2).replace('.',',')} < x ≤ ${String((b-1)/2).replace('.',',')}.`, `Contando os inteiros: ${n}`]); },
    ],
  },
  sistemas:{
    dificil:[
      ()=>{ const g=randInt(5,20), c=randInt(3,15);
        return mkSingle(`Num sítio há galinhas e coelhos: são ${g+c} cabeças e ${2*g+4*c} patas. Quantos coelhos há?`, c, [`Se todos fossem galinhas: ${g+c} × 2 = ${2*(g+c)} patas.`, `Sobram ${2*g+4*c} − ${2*(g+c)} = ${2*c} patas: cada coelho tem 2 a mais.`, `${2*c} ÷ 2 = ${c} coelhos`]); },
      ()=>{ const p=pick([20,30,40,50]), i=randInt(10,60), m=randInt(10,60), t=i*p+m*p/2;
        return mkSingle(`Num show, a inteira custa R$ ${p} e a meia, R$ ${p/2}. Foram vendidos ${i+m} ingressos e arrecadados R$ ${t}. Quantas inteiras foram vendidas?`, i, [`Inteiras = x, meias = ${i+m} − x.`, `${p}x + ${p/2}(${i+m} − x) = ${t} → ${p/2}x = ${t - (i+m)*p/2}.`, `x = ${i}`]); },
    ],
  },
  sistlin:{
    facil:[
      ()=>{ const x=randInt(2,30), y=randInt(1,x);
        return mkSingle(`x + y = ${x+y} e x − y = ${x-y}. Quanto vale x?`, x, [`Somando as duas: 2x = ${2*x}.`, `x = ${x}`]); },
    ],
    medio:[
      ()=>{ const x=randInt(1,15), y=randInt(1,15), z=randInt(1,15);
        return mkSingle(`x + y = ${x+y}, y + z = ${y+z} e x + z = ${x+z}. Quanto vale x + y + z?`, x+y+z, [`Somando as três: 2(x + y + z) = ${2*(x+y+z)}.`, `x + y + z = ${x+y+z}`]); },
    ],
    dificil:[
      ()=>{ const c=randInt(5,30), m=randInt(3,25);
        return mkSingle(`Num estacionamento há carros e motos: ${c+m} veículos e ${4*c+2*m} rodas. Quantas motos há?`, m, [`c + m = ${c+m} e 4c + 2m = ${4*c+2*m}.`, `Se todos fossem carros: ${4*(c+m)} rodas; sobram ${4*(c+m)} − ${4*c+2*m} = ${2*m} rodas a menos.`, `Cada moto tem 2 rodas a menos: ${2*m} ÷ 2 = ${m} motos`]); },
    ],
  },
  /* ---------------- Ensino médio ---------------- */
  funcquad:{
    facil:[
      ()=>{ const a=randInt(1,20), n=randInt(-6,8);
        return mkSingle(`Se f(x) = x² − ${a}, quanto vale f(${n})?`, n*n-a, [`Troque x por ${n}: (${n})² − ${a}.`, `${n*n} − ${a} = ${n*n-a}`]); },
      ()=>{ const a=randInt(1,5), b=randInt(-9,9)||4, c=randInt(-15,15)||7;
        return mkSingle(`Em f(x) = ${a===1?'':a}x²${mqT(b,'x')}${mqT(c,'')}, onde o gráfico corta o eixo y? (dê o valor de y)`, c, [`O gráfico corta o eixo y quando x = 0.`, `f(0) = ${c}`]); },
    ],
    medio:[
      ()=>{ const k=randInt(-8,8)||3, c=randInt(-10,20)||5;
        return mkSingle(`Qual é o x do vértice de f(x) = x²${mqT(-2*k,'x')}${mqT(c,'')}?`, k, [`x do vértice = −b / (2a).`, `−(${-2*k}) / 2 = ${k}`]); },
      ()=>{ const r1=randInt(-8,8), r2=mqTry(()=>randInt(-8,8), v=>v!==r1), s=r1+r2, p=r1*r2, [a,b]=r1>r2?[r1,r2]:[r2,r1];
        return mkPair(`Quais são as raízes de f(x) = x²${mqT(-s,'x')}${mqT(p,'')}?`, a, b, [`Procure dois números com soma ${s} e produto ${p}.`, `São ${a} e ${b}.`]); },
    ],
    dificil:[
      ()=>{ const k=randInt(1,10);
        return mkSingle(`Uma bola é chutada pra cima e sua altura (em metros) é h(t) = −t² + ${2*k}t, com t em segundos. Qual é a altura máxima?`, k*k, [`O ponto mais alto é o vértice: t = −${2*k} / (2 · (−1)) = ${k} s.`, `h(${k}) = −${k*k} + ${2*k*k} = ${k*k} m`]); },
      ()=>{ const l=randInt(3,25), P=4*l;
        return mkSingle(`Com ${P} m de cerca, quero fazer um cercado retangular. Qual é a maior área possível? (em m²)`, l*l, [`Lados x e ${P/2} − x: área = x(${P/2} − x).`, `A área máxima é no vértice: x = ${l} (um quadrado).`, `${l} × ${l} = ${l*l} m²`]); },
      ()=>{ const k=randInt(-6,6)||2, c=randInt(-10,30)||8;
        return mkSingle(`Qual é o valor mínimo de f(x) = x²${mqT(-2*k,'x')}${mqT(c,'')}?`, c-k*k, [`O mínimo é no vértice: x = ${k}.`, `f(${k}) = ${k*k} ${fmtSigned(-2*k*k)} ${fmtSigned(c)} = ${c-k*k}`]); },
    ],
  },
  functrig:{
    facil:[
      ()=>{ const a=randInt(-3,6), b=randInt(1,5);
        return mkSingle(`Qual é o valor máximo de f(x) = ${a} + ${b}·sen x?`, a+b, [`O seno vai de −1 a 1: o máximo é quando sen x = 1.`, `${a} + ${b} · 1 = ${a+b}`]); },
      ()=>{ const a=randInt(2,9);
        return mkSingle(`Se f(x) = ${a}·cos x, quanto vale f(0°)?`, a, [`cos 0° = 1.`, `${a} · 1 = ${a}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(-2,8), b=randInt(1,6);
        return mkSingle(`Qual é o valor mínimo de f(x) = ${a} + ${b}·cos x?`, a-b, [`O cosseno vai de −1 a 1: o mínimo é quando cos x = −1.`, `${a} − ${b} = ${a-b}`]); },
      ()=>{ const k=pick([2,3,4,5,6,8,9,10,12]);
        return mkSingle(`Qual é o período, em graus, de f(x) = sen(${k}x)?`, 360/k, [`O período de sen(kx) é 360° ÷ k.`, `360° ÷ ${k} = ${360/k}°`]); },
    ],
  },
  complexos:{
    facil:[
      ()=>{ const a=randInt(-9,9), b=randInt(1,9), c=randInt(-9,9), d=randInt(1,9);
        return mkSingle(`Qual é a parte real de (${a} + ${b}i) + (${c} + ${d}i)?`, a+c, [`Some parte real com parte real.`, `${a} + (${c}) = ${a+c}`]); },
      ()=>{ const a=randInt(1,9), b=randInt(-9,9)||2, c=randInt(1,9), d=randInt(-9,9)||5;
        return mkSingle(`Qual é a parte imaginária de (${a} ${fmtSigned(b)}i) − (${c} ${fmtSigned(d)}i)?`, b-d, [`Subtraia as partes imaginárias.`, `${b} − (${d}) = ${b-d}`]); },
    ],
    medio:[
      ()=>{ const [a,b,m]=pick([[3,4,5],[6,8,10],[5,12,13],[8,6,10],[12,5,13],[9,12,15],[8,15,17]]);
        return mkSingle(`Qual é o módulo de z = ${a} + ${b}i?`, m, [`|z| = √(a² + b²).`, `√(${a*a} + ${b*b}) = √${a*a+b*b} = ${m}`]); },
      ()=>{ const a=randInt(1,9), b=randInt(1,9);
        return mkSingle(`Quanto vale (${a} + ${b}i)(${a} − ${b}i)?`, a*a+b*b, [`(a + bi)(a − bi) = a² − b²i² = a² + b².`, `${a*a} + ${b*b} = ${a*a+b*b}`]); },
      ()=>{ const a=randInt(1,7), b=randInt(1,7);
        return mkSingle(`Qual é a parte real de (${a} + ${b}i)²?`, a*a-b*b, [`(a + bi)² = a² + 2abi + b²i² = (a² − b²) + 2abi.`, `${a*a} − ${b*b} = ${a*a-b*b}`]); },
    ],
  },
  polinomios:{
    medio:[
      ()=>{ const a=randInt(-6,6)||2, b=randInt(-10,10)||3, n=randInt(-4,5);
        return mkSingle(`Se P(x) = x²${mqT(a,'x')}${mqT(b,'')}, quanto vale P(${n})?`, n*n+a*n+b, [`Troque x por ${n}.`, `${n*n} ${fmtSigned(a*n)} ${fmtSigned(b)} = ${n*n+a*n+b}`]); },
      ()=>{ const a=randInt(-5,5)||1, b=randInt(-10,10)||4, n=randInt(-3,3)||2, r=n*n*n+a*n+b;
        return mkSingle(`Qual é o resto da divisão de P(x) = x³${mqT(a,'x')}${mqT(b,'')} por (x ${fmtSigned(-n)})?`, r, [`Teorema do resto: o resto é P(${n}).`, `${n*n*n} ${fmtSigned(a*n)} ${fmtSigned(b)} = ${r}`]); },
      ()=>{ const a=randInt(2,7), b=randInt(1,6);
        const sup = n=> String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
        return mkSingle(`Qual é o grau do polinômio (x${a>1?sup(a):''} + 1)(x${b>1?sup(b):''} − 2)?`, a+b, [`Na multiplicação, os graus se somam.`, `${a} + ${b} = ${a+b}`]); },
    ],
  },
  combinatoria:{
    medio:[
      ()=>{ const n=randInt(3,6), f=[1,1,2,6,24,120,720][n];
        return mkSingle(`De quantas maneiras ${n} amigos podem se organizar numa fila?`, f, [`É uma permutação: ${n}!.`, `${Array.from({length:n},(_,i)=>n-i).join(' × ')} = ${f}`]); },
      ()=>{ const e=randInt(2,4), p=randInt(2,5), s=randInt(2,4);
        return mkSingle(`Um restaurante tem ${e} entradas, ${p} pratos principais e ${s} sobremesas. Quantos cardápios diferentes (1 de cada) dá pra montar?`, e*p*s, [`Princípio multiplicativo.`, `${e} × ${p} × ${s} = ${e*p*s}`]); },
      ()=>{ const [w,r]=pick([['AMOR',24],['GATO',24],['LIVRO',120],['PRATO',120],['SOL',6],['CASA',12],['BOLA',24],['ARARA',10],['BANANA',60]]);
        return mkSingle(`Quantos anagramas tem a palavra ${w}?`, r, [`São ${w.length} letras: ${w.length}! se todas forem diferentes.`, `Letras repetidas: divida pelo fatorial de quantas vezes cada uma se repete.`, `Resposta: ${r}`]); },
    ],
  },
  probabilidade:{
    medio:[
      ()=>{ const k=randInt(1,4);
        return mkFrac(`Ao lançar um dado comum, qual é a probabilidade de sair um número maior que ${k}?`, 6-k, 6, [`Casos favoráveis: ${Array.from({length:6-k},(_,i)=>k+1+i).join(', ')} → ${6-k}.`, `${6-k}/6${gcd(6-k,6)>1?' = '+fracStr(6-k,6):''}`]); },
      ()=>{ const a=randInt(2,9), b=randInt(2,9);
        return mkFrac(`Uma caixa tem ${a} bolas azuis e ${b} vermelhas. Tirando uma sem olhar, qual é a probabilidade de ser vermelha?`, b, a+b, [`Total: ${a} + ${b} = ${a+b} bolas.`, `${b}/${a+b}${gcd(b,a+b)>1?' = '+fracStr(b,a+b):''}`]); },
      ()=>{ const S=randInt(3,11); let c=0; for(let i=1;i<=6;i++) for(let j=1;j<=6;j++) if(i+j===S) c++;
        return mkFrac(`Lançando dois dados, qual é a probabilidade de a soma ser ${S}?`, c, 36, [`São 6 × 6 = 36 resultados.`, `Dão soma ${S}: ${c} resultados.`, `${c}/36 = ${fracStr(c,36)}`]); },
    ],
  },
  condicional:{
    medio:[
      ()=>{ const g=randInt(6,20), m=randInt(1,g-1);
        return mkFrac(`Numa turma, ${g} alunos usam óculos e ${m} deles são meninas. Escolhendo ao acaso um aluno que usa óculos, qual é a probabilidade de ser menina?`, m, g, [`Sabendo que usa óculos, o total passa a ser ${g}.`, `${m}/${g}${gcd(m,g)>1?' = '+fracStr(m,g):''}`]); },
    ],
    dificil:[
      ()=>{ const conds = [['par', x=>x%2===0], ['ímpar', x=>x%2===1], ['maior que 2', x=>x>2], ['menor que 5', x=>x<5]];
        const evs = [['primo', x=>[2,3,5].includes(x)], ['múltiplo de 3', x=>x%3===0], ['maior que 3', x=>x>3], ['par', x=>x%2===0]];
        const [[cn,cf],[en,ef]] = mqTry(()=>[pick(conds), pick(evs)], ([c,e])=>{ const d=[1,2,3,4,5,6].filter(c[1]), f=d.filter(e[1]); return c[0]!==e[0] && f.length>0 && f.length<d.length; });
        const dado=[1,2,3,4,5,6].filter(cf), fav=dado.filter(ef);
        return mkFrac(`Um dado foi lançado e saiu um número ${cn}. Qual é a probabilidade de ele ser ${en}?`, fav.length, dado.length, [`Resultados possíveis (${cn}): ${dado.join(', ')} → ${dado.length}.`, `Desses, os que são ${en}: ${fav.join(', ')} → ${fav.length}.`, `${fav.length}/${dado.length} = ${fracStr(fav.length,dado.length)}`]); },
      ()=>{ const a=randInt(3,8), b=randInt(2,8);
        return mkFrac(`Uma urna tem ${a} bolas azuis e ${b} vermelhas. Tiramos duas, sem devolver. Sabendo que a primeira foi azul, qual é a probabilidade de a segunda também ser azul?`, a-1, a+b-1, [`Depois de tirar uma azul, sobram ${a-1} azuis num total de ${a+b-1}.`, `${a-1}/${a+b-1}${gcd(a-1,a+b-1)>1?' = '+fracStr(a-1,a+b-1):''}`]); },
    ],
  },
  dispersao:{
    facil:[
      ()=>{ const v=Array.from({length:5},()=>randInt(10,60)), mx=Math.max(...v), mn=Math.min(...v);
        return mkSingle(`As notas de um jogo foram ${v.join(', ')}. Qual é a amplitude (maior − menor)?`, mx-mn, [`Maior: ${mx}. Menor: ${mn}.`, `${mx} − ${mn} = ${mx-mn}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,20), d=randInt(1,8), b=a+2*d;
        return mkSingle(`Qual é o desvio padrão dos dados ${a}, ${a}, ${b}, ${b}?`, d, [`Média: ${a+d}. Todos ficam a ${d} da média.`, `Variância: ${d}² = ${d*d}.`, `Desvio padrão: √${d*d} = ${d}`]); },
    ],
  },
  juros:{
    medio:[
      ()=>{ const C=100*randInt(5,50), i=randInt(1,5), t=randInt(2,12), J=C*i*t/100;
        return mkSingle(`Apliquei R$ ${C} a juros simples de ${i}% ao mês durante ${t} meses. Qual é o montante no fim? (em reais)`, C+J, [`Juros: ${C} × ${i}/100 × ${t} = ${J}.`, `Montante: ${C} + ${J} = ${C+J} reais`]); },
      ()=>{ const C=100*randInt(5,50), i=randInt(1,5), t=randInt(2,12), J=C*i*t/100;
        return mkSingle(`Em quantos meses R$ ${C}, a juros simples de ${i}% ao mês, rendem R$ ${J} de juros?`, t, [`Por mês rende ${i}% de ${C} = ${C*i/100}.`, `${J} ÷ ${C*i/100} = ${t} meses`]); },
    ],
    dificil:[
      ()=>{ const C=100*randInt(2,50);
        return mkSingle(`Apliquei R$ ${C} a juros compostos de 10% ao mês. Quanto terei depois de 2 meses? (em reais)`, C*121/100, [`Cada mês multiplica por 1,1.`, `${C} × 1,1 × 1,1 = ${C} × 1,21 = ${String(C*121/100).replace('.',',')} reais`]); },
      ()=>{ const C=100*randInt(5,40), i=randInt(1,6), t=randInt(2,10), J=C*i*t/100;
        return mkSingle(`Um capital de R$ ${C} rendeu R$ ${J} de juros simples em ${t} meses. Qual foi a taxa mensal? (em %)`, i, [`Por mês rendeu ${J} ÷ ${t} = ${J/t}.`, `${J/t} ÷ ${C} = ${i/100} = ${i}% ao mês`]); },
    ],
  },
  parcelamento:{
    facil:[
      ()=>{ const n=pick([3,4,5,6,10,12]), p=randInt(30,200), V=n*p-randInt(10,n*10);
        return mkSingle(`Uma TV custa R$ ${V} à vista ou ${n} parcelas de R$ ${p}. Quanto se paga a mais no parcelado? (em reais)`, n*p-V, [`Parcelado: ${n} × ${p} = ${n*p}.`, `${n*p} − ${V} = ${n*p-V} reais a mais`]); },
    ],
    medio:[
      ()=>{ const E=10*randInt(5,50), n=pick([3,4,5,6,8,10]), p=randInt(40,250);
        return mkSingle(`Comprei uma bicicleta com R$ ${E} de entrada e mais ${n} parcelas de R$ ${p}. Quanto paguei no total? (em reais)`, E+n*p, [`Parcelas: ${n} × ${p} = ${n*p}.`, `Total: ${E} + ${n*p} = ${E+n*p} reais`]); },
    ],
    dificil:[
      ()=>{ const v = mqTry(()=>{ const V=100*randInt(8,40), e=pick([10,20,25,30,40,50]), n=pick([3,4,5,6,8,10]); return {V,e,n,r:V*(100-e)/100/n}; }, o=> Number.isInteger(o.r));
        const {V,e,n,r} = v;
        return mkSingle(`Um celular de R$ ${V} foi comprado com ${e}% de entrada e o resto em ${n} parcelas iguais sem juros. Qual é o valor de cada parcela? (em reais)`, r, [`Entrada: ${e}% de ${V} = ${V*e/100}.`, `Resto: ${V} − ${V*e/100} = ${V*(100-e)/100}.`, `${V*(100-e)/100} ÷ ${n} = ${r} reais`]); },
    ],
  },
  descontos:{
    medio:[
      ()=>{ const p=20*randInt(3,40), i=pick([5,10,15,20,25]), f=p*(100+i)/100;
        return mkSingle(`Um tênis de R$ ${p} teve aumento de ${i}%. Qual é o novo preço? (em reais)`, f, [`Aumento: ${i}% de ${p} = ${p*i/100}.`, `${p} + ${p*i/100} = ${f} reais`]); },
      ()=>{ const P=20*randInt(3,40), d=pick([10,20,25,50]), X=P*(100-d)/100;
        return mkSingle(`Depois de um desconto de ${d}%, paguei R$ ${X} num casaco. Qual era o preço sem desconto? (em reais)`, P, [`Paguei ${100-d}% do preço: ${X} = preço × ${(100-d)/100}.`.replace('.',','), `Preço = ${X} ÷ ${String((100-d)/100).replace('.',',')} = ${P} reais`]); },
    ],
    dificil:[
      ()=>{ const a=pick([10,20,30,50]), b=pick([10,20,30,40]), f=(100-a)*(100-b)/100;
        return mkSingle(`Dois descontos seguidos, de ${a}% e de ${b}%, equivalem a um único desconto de quantos por cento?`, 100-f, [`Sobra ${100-a}% e depois ${100-b}% disso: ${(100-a)/100} × ${(100-b)/100} = ${f/100}.`.replace(/(\d)\.(\d)/g,'$1,$2'), `Paga-se ${f}% → desconto de ${100-f}% (e não ${a+b}%!)`]); },
    ],
  },
  inflacao:{
    facil:[
      ()=>{ const P=10*randInt(2,50), i=pick([5,10,20]), f=P*(100+i)/100;
        return mkSingle(`Um produto custava R$ ${P} e a inflação no ano foi de ${i}%. Se o preço acompanhou a inflação, quanto passou a custar? (em reais)`, f, [`${i}% de ${P} = ${P*i/100}.`, `${P} + ${P*i/100} = ${f} reais`]); },
    ],
    medio:[
      ()=>{ const a=pick([10,20]), b=pick([10,20,30]), ac=(100+a)*(100+b)/100-100;
        return mkSingle(`A inflação foi de ${a}% num ano e de ${b}% no ano seguinte. Qual foi a inflação acumulada nos dois anos? (em %)`, ac, [`Multiplique os fatores: ${String((100+a)/100).replace('.',',')} × ${String((100+b)/100).replace('.',',')} = ${String((100+ac)/100).replace('.',',')}.`, `Acumulada: ${ac}% (não ${a+b}%)`]); },
    ],
    dificil:[
      ()=>{ const [s,i,g]=pick([[32,20,10],[21,10,10],[44,20,20],[26,5,20],[15,15,0],[10,10,0],[38,15,20]]);
        return mkSingle(`Um salário subiu ${s}% num ano em que a inflação foi de ${i}%. Qual foi o ganho real? (em %)`, g, [`Ganho real: (1 + aumento) ÷ (1 + inflação) − 1.`, `${String((100+s)/100).replace('.',',')} ÷ ${String((100+i)/100).replace('.',',')} = ${String((100+g)/100).replace('.',',')}.`, `Ganho real de ${g}%`]); },
    ],
  },
  matrizes:{
    dificil:[
      ()=>{ const [m,n,p]=[randInt(2,5),randInt(2,5),randInt(2,5)];
        return mkSingle(`A é uma matriz ${m}×${n} e B é ${n}×${p}. Quantos elementos tem o produto A·B?`, m*p, [`A·B tem as linhas de A e as colunas de B: ${m}×${p}.`, `${m} × ${p} = ${m*p} elementos`]); },
      ()=>{ const p=randInt(1,4), q=randInt(-3,4)||1, i=randInt(1,3), j=randInt(1,3), tq = q>0 ? `+ ${q===1?'':q}j` : `− ${q===-1?'':-q}j`;
        return mkSingle(`Na matriz A em que aᵢⱼ = ${p===1?'':p}i ${tq}, quanto vale a${i}${j}?`, p*i+q*j, [`Troque i por ${i} e j por ${j}.`, `${p} · ${i} ${fmtSigned(q)} · ${j} = ${p*i+q*j}`]); },
    ],
  },
  identidades:{
    dificil:[
      ()=>{ const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]);
        return mkFrac(`Se sen x = ${a}/${c} e x está no 1º quadrante, quanto vale cos x?`, b, c, [`sen²x + cos²x = 1 → cos²x = 1 − ${a*a}/${c*c} = ${c*c-a*a}/${c*c}.`, `cos x = ${b}/${c} (positivo no 1º quadrante)`]); },
      ()=>{ const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]);
        return mkFrac(`Se cos x = ${b}/${c} e x está no 1º quadrante, quanto vale tg x?`, a, b, [`sen x = √(1 − ${b*b}/${c*c}) = ${a}/${c}.`, `tg x = sen x / cos x = ${a}/${b}`]); },
    ],
  },
  trigret:{
    facil:[
      ()=>{ const h=2*randInt(2,15);
        return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${h} cm e um dos ângulos agudos é 30°. Quanto mede o cateto oposto a esse ângulo? (em cm)`, h/2, [`sen 30° = 1/2 = cateto oposto ÷ hipotenusa.`, `${h} × 1/2 = ${h/2} cm`]); },
      ()=>{ const c=2*randInt(2,6);
        return mkSingle(`Uma escada de ${c} m está encostada num muro e faz 60° com o chão. A que distância do muro está o pé da escada? (em m)`, c/2, [`A distância é o cateto adjacente ao ângulo de 60°.`, `cos 60° = 1/2 → ${c} × 1/2 = ${c/2} m`]); },
    ],
  },
  eqtrig:{
    facil:[
      ()=>{ const [e,r]=pick([['sen x = 1/2',30],['cos x = 1/2',60],['tg x = 1',45],['sen x = 1',90],['cos x = 1',0],['tg x = 0',0]]);
        return mkSingle(`Qual é o ângulo x, entre 0° e 90°, tal que ${e}? (em graus)`, r, [`Lembre a tabela dos ângulos notáveis (0°, 30°, 45°, 60°, 90°).`, `x = ${r}°`]); },
    ],
    medio:[
      ()=>{ const [e,s,sol]=pick([['sen x = 0',3,'0°, 180° e 360°'],['sen x = 1',1,'90°'],['cos x = 0',2,'90° e 270°'],['cos x = −1',1,'180°'],['sen x = 1/2',2,'30° e 150°'],['cos x = 1/2',2,'60° e 300°']]);
        return mkSingle(`Quantas soluções tem ${e} no intervalo [0°, 360°]?`, s, [`Olhe o ciclo trigonométrico.`, `Soluções: ${sol} → ${s}`]); },
    ],
  },
  leis:{
    facil:[
      ()=>{ const a=randInt(25,90), b=randInt(20,150-a);
        return mkSingle(`Num triângulo, dois ângulos medem ${a}° e ${b}°. Quanto mede o terceiro? (em graus)`, 180-a-b, [`A soma dos ângulos internos é 180°.`, `180 − ${a} − ${b} = ${180-a-b}°`]); },
    ],
    dificil:[
      ()=>{ const [a,b,c,ang]=pick([[3,8,7,60],[5,8,7,60],[7,15,13,60],[8,15,13,60],[5,21,19,60],[16,21,19,60],[3,5,7,120],[7,8,13,120],[5,16,19,120],[6,10,14,120]]);
        const cosv = ang===60 ? '1/2' : '−1/2', c2 = ang===60 ? a*a+b*b-a*b : a*a+b*b+a*b;
        return mkSingle(`Num triângulo, dois lados medem ${a} cm e ${b} cm e o ângulo entre eles é ${ang}°. Quanto mede o terceiro lado? (em cm)`, c, [`Lei dos cossenos: c² = a² + b² − 2ab·cos ${ang}° (cos ${ang}° = ${cosv}).`, `c² = ${a*a} + ${b*b} ${ang===60?'−':'+'} ${a*b} = ${c2}.`, `c = √${c2} = ${c} cm`]); },
    ],
  },
  espacial:{
    facil:[
      ()=>{ const a=randInt(2,12), b=randInt(2,10), c=randInt(2,10);
        return mkSingle(`Qual é o volume de uma caixa de ${a} cm × ${b} cm × ${c} cm? (em cm³)`, a*b*c, [`Volume = comprimento × largura × altura.`, `${a} × ${b} × ${c} = ${a*b*c} cm³`]); },
      ()=>{ const a=randInt(1,3);
        return mkSingle(`Uma caixa-d'água em forma de cubo tem ${a} m de aresta. Quantos litros cabem nela? (1 m³ = 1000 L)`, a*a*a*1000, [`Volume: ${a}³ = ${a*a*a} m³.`, `${a*a*a} × 1000 = ${a*a*a*1000} litros`]); },
    ],
    medio:[
      ()=>{ const a=10*randInt(3,8), b=10*randInt(2,5), c=10*randInt(2,5);
        return mkSingle(`Um aquário mede ${a} cm × ${b} cm × ${c} cm. Quantos litros de água cabem nele? (1 L = 1000 cm³)`, a*b*c/1000, [`Volume: ${a} × ${b} × ${c} = ${a*b*c} cm³.`, `${a*b*c} ÷ 1000 = ${a*b*c/1000} litros`]); },
      ()=>{ const r=randInt(1,6), h=randInt(2,12);
        return mkSingle(`Qual é o volume de um cilindro de raio ${r} cm e altura ${h} cm? Use π = 3. (em cm³)`, 3*r*r*h, [`V = π · r² · h.`, `3 × ${r*r} × ${h} = ${3*r*r*h} cm³`]); },
    ],
    dificil:[
      ()=>{ const r=randInt(1,6);
        return mkSingle(`Qual é o volume de uma esfera de raio ${r} cm? Use π = 3. (em cm³)`, 4*r*r*r, [`V = (4/3) · π · r³.`, `(4/3) × 3 × ${r*r*r} = 4 × ${r*r*r} = ${4*r*r*r} cm³`]); },
      ()=>{ const l=randInt(2,10), h=3*randInt(1,6);
        return mkSingle(`Qual é o volume de uma pirâmide de base quadrada com lado ${l} cm e altura ${h} cm? (em cm³)`, l*l*h/3, [`V = (área da base × altura) ÷ 3.`, `${l*l} × ${h} ÷ 3 = ${l*l*h/3} cm³`]); },
    ],
  },
  espacial2:{
    facil:[
      ()=>{ const n=randInt(3,8), [o,f,q]=pick([['arestas',n=>3*n,'Quantas'],['faces',n=>n+2,'Quantas'],['vértices',n=>2*n,'Quantos']]);
        return mkSingle(`${q} ${o} tem um prisma cuja base tem ${n} lados?`, f(n), [`Prisma de base com n lados: 3n arestas, n + 2 faces e 2n vértices.`, `${o}: ${f(n)}`]); },
      ()=>{ const n=randInt(3,8), [o,f,q]=pick([['arestas',n=>2*n,'Quantas'],['faces',n=>n+1,'Quantas'],['vértices',n=>n+1,'Quantos']]);
        return mkSingle(`${q} ${o} tem uma pirâmide cuja base tem ${n} lados?`, f(n), [`Pirâmide de base com n lados: 2n arestas, n + 1 faces e n + 1 vértices.`, `${o}: ${f(n)}`]); },
    ],
    dificil:[
      ()=>{ const n=randInt(3,9), V=2*n, A=3*n, F=n+2;
        return mkSingle(`Um poliedro convexo tem ${F} faces e ${A} arestas. Quantos vértices ele tem?`, V, [`Relação de Euler: V − A + F = 2.`, `V = 2 + A − F = 2 + ${A} − ${F} = ${V}`]); },
      ()=>{ const r=randInt(1,6), h=randInt(2,12);
        return mkSingle(`Qual é o volume de um cone de raio ${r} cm e altura ${h} cm? Use π = 3. (em cm³)`, r*r*h, [`V = (π · r² · h) ÷ 3.`, `3 × ${r*r} × ${h} ÷ 3 = ${r*r*h} cm³`]); },
    ],
  },
  modular:{
    medio:[
      ()=>{ const a=randInt(-6,8), b=randInt(1,9);
        return mkPair(`Resolva |x ${fmtSigned(-a)}| = ${b}.`, a+b, a-b, [`O que está dentro do módulo vale ${b} ou −${b}.`, `x ${fmtSigned(-a)} = ${b} → x = ${a+b}`, `x ${fmtSigned(-a)} = −${b} → x = ${a-b}`]); },
    ],
  },
};

/* acabamento dos textos do lote 2: sinal de menos (−) e vírgula decimal */
(function(){
  const arruma = t=> typeof t!=='string' ? t : t.replace(/(^|[\s(=:\[{,/])-(\d)/g, '$1−$2').replace(/(\d)\.(\d)/g, '$1,$2');
  Object.values(MAIS_QUESTOES_2).forEach(o=> ['facil','medio','dificil'].forEach(lv=>{
    if(o[lv]) o[lv] = o[lv].map(fn=> ()=>{ const ex = fn(); ex.question = arruma(ex.question); if(ex.steps) ex.steps = ex.steps.map(arruma); return ex; });
  }));
})();
