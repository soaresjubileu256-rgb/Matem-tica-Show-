/* =========================================================
   MAIS TIPOS DE QUESTÃO
   Cada assunto já tem o seu gerador por nível (fácil, médio, difícil), mas muitos
   sorteavam sempre o mesmo tipo de pergunta, só trocando os números. Aqui entram
   tipos novos de pergunta: o gerador de cada nível passa a sortear entre o tipo
   antigo e os novos (todos com a mesma chance).
   Toda resposta é um número (ou par de números), como no resto do app.
   ========================================================= */
const MQ_NOMES = ['Ana','Bruno','Carla','Davi','Lia','Caio','Júlia','Pedro','Bia','Theo','Lara','Rafa','Malu','Enzo','Sofia','Gael'];
const mqReais = v=> 'R$ ' + Number(v).toFixed(2).replace('.', ',');
/* sorteia números até a condição valer (pra garantir contas exatas) */
function mqTry(fn, ok, n){ for(let i=0;i<(n||80);i++){ const v = fn(); if(ok(v)) return v; } return null; }

const MAIS_QUESTOES = {
  /* ---------------- 1º ao 5º ano ---------------- */
  adicao:{
    facil:[
      ()=>{ const a=randInt(3,40), b=randInt(3,40), c=a+b;
        return mkSingle(`Que número somado a ${b} dá ${c}?`, a, [`Procure o número que falta: ? + ${b} = ${c}.`, `É o mesmo que ${c} − ${b}.`, `${c} − ${b} = ${a}`]); },
      ()=>{ const n=pick(MQ_NOMES), a=randInt(5,30), b=randInt(3,25);
        return mkSingle(`${n} tinha ${a} figurinhas e ganhou mais ${b}. Com quantas ficou?`, a+b, [`"Ganhou mais" é somar: ${a} + ${b}.`, `${a} + ${b} = ${a+b}`]); },
      ()=>{ const a=randInt(2,9), b=randInt(2,9), c=randInt(2,9);
        return mkSingle(`${a} + ${b} + ${c} = ?`, a+b+c, [`Some de dois em dois: ${a} + ${b} = ${a+b}.`, `${a+b} + ${c} = ${a+b+c}`]); },
    ],
  },
  subtracao:{
    facil:[
      ()=>{ const b=randInt(3,30), r=randInt(2,30), a=b+r;
        return mkSingle(`${a} − ? = ${r}`, b, [`O número que falta é o quanto foi tirado de ${a} pra sobrar ${r}.`, `${a} − ${r} = ${b}`]); },
      ()=>{ const a=randInt(5,40), b=a+randInt(3,30);
        return mkSingle(`Quanto falta pra ${a} chegar a ${b}?`, b-a, [`"Quanto falta" é a diferença: ${b} − ${a}.`, `${b} − ${a} = ${b-a}`]); },
      ()=>{ const n=pick(MQ_NOMES), a=randInt(10,40), b=randInt(2,a-2);
        return mkSingle(`${n} tinha ${a} balas e deu ${b} para os amigos. Quantas balas sobraram?`, a-b, [`"Sobrou" é tirar: ${a} − ${b}.`, `${a} − ${b} = ${a-b}`]); },
    ],
  },
  multiplicacao:{
    facil:[
      ()=>{ const k=pick([[2,'dobro'],[3,'triplo'],[4,'quádruplo']]), n=randInt(4,25);
        return mkSingle(`Qual é o ${k[1]} de ${n}?`, k[0]*n, [`O ${k[1]} é multiplicar por ${k[0]}.`, `${n} × ${k[0]} = ${k[0]*n}`]); },
      ()=>{ const a=randInt(2,9), b=randInt(2,9);
        return mkSingle(`? × ${b} = ${a*b}`, a, [`Que número vezes ${b} dá ${a*b}?`, `Divida: ${a*b} ÷ ${b} = ${a}`]); },
      ()=>{ const c=randInt(2,9), o=pick([6,10,12]);
        return mkSingle(`Uma loja tem ${c} caixas com ${o} ovos em cada. Quantos ovos são no total?`, c*o, [`Caixas iguais: multiplique ${c} × ${o}.`, `${c} × ${o} = ${c*o}`]); },
    ],
  },
  divisao:{
    facil:[
      ()=>{ const n=2*randInt(3,40);
        return mkSingle(`Qual é a metade de ${n}?`, n/2, [`Metade é dividir por 2.`, `${n} ÷ 2 = ${n/2}`]); },
      ()=>{ const b=randInt(2,9), r=randInt(2,9);
        return mkSingle(`? ÷ ${b} = ${r}`, b*r, [`O número dividido por ${b} dá ${r}.`, `Faça o contrário: ${r} × ${b} = ${b*r}`]); },
      ()=>{ const k=randInt(2,6), cada=randInt(2,9), tot=k*cada;
        return mkSingle(`${tot} balas foram divididas igualmente entre ${k} amigos. Quantas balas cada um ganhou?`, cada, [`Repartir igualmente é dividir: ${tot} ÷ ${k}.`, `${tot} ÷ ${k} = ${cada}`]); },
    ],
  },
  dinheiro:{
    medio:[
      ()=>{ const p=randInt(3,18)*100+pick([0,50]), q=randInt(2,4), tot=p*q, nota=tot<=2000?2000:tot<=5000?5000:10000;
        return mkSingle(`Comprei ${q} lanches de ${mqReais(p/100)} cada e paguei com uma nota de ${mqReais(nota/100)}. Quanto recebi de troco? (em reais)`, (nota-tot)/100, [`Gasto: ${q} × ${mqReais(p/100)} = ${mqReais(tot/100)}.`, `Troco: ${mqReais(nota/100)} − ${mqReais(tot/100)} = ${mqReais((nota-tot)/100)}`]); },
      ()=>{ const v=randInt(2,15);
        return mkSingle(`Quantas moedas de R$ 0,50 são necessárias para formar R$ ${v},00?`, v*2, [`Cada real tem 2 moedas de 50 centavos.`, `${v} × 2 = ${v*2} moedas`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>[randInt(4,9)*2, randInt(10,24)], v=>v[0]*2!==v[1], 40) || [6,13];
        const [p1,p2]=r, per1=p1*2, per2=p2;
        return mkSingle(`Um pacote de 500 g de café custa R$ ${p1},00 e o de 1 kg custa R$ ${p2},00. Comprando 1 kg do jeito mais barato, quanto você paga?`, Math.min(per1,per2), [`Dois pacotes de 500 g = 1 kg: 2 × ${p1} = R$ ${per1},00.`, `O pacote de 1 kg custa R$ ${per2},00.`, `O mais barato: R$ ${Math.min(per1,per2)},00.`]); },
      ()=>{ const s=randInt(4,12)*5, d=pick([10,20,25]), pago=s*(100-d)/100;
        return mkSingle(`Uma mochila de R$ ${s},00 está com ${d}% de desconto. Quanto você paga? (em reais)`, pago, [`Desconto: ${d}% de ${s} = ${fmt(s*d/100)}.`, `Paga: ${s} − ${fmt(s*d/100)} = ${fmt(pago)}`]); },
    ],
  },
  fracoes:{
    facil:[
      ()=>{ const d=pick([2,3,4,5]), n=d*randInt(2,9);
        return mkSingle(`Quanto é 1/${d} de ${n}?`, n/d, [`1/${d} de um número é dividir por ${d}.`, `${n} ÷ ${d} = ${n/d}`]); },
      ()=>{ const k=randInt(2,4), a=randInt(1,4), b=a+randInt(1,4), n=a*k, d=b*k;
        if(gcd(a,b)!==1) return mkFrac(`Simplifique a fração 2/4.`, 2, 4, ['Divida em cima e embaixo por 2: 1/2.']);
        return mkFrac(`Simplifique a fração ${n}/${d}.`, n, d, [`Divida o numerador e o denominador por ${k}.`, `${n} ÷ ${k} = ${a} e ${d} ÷ ${k} = ${b}.`, `Resposta: ${a}/${b}`]); },
      ()=>{ const d=pick([4,5,6,7,8,9]), a=randInt(1,d-2), b=randInt(1,d-1-a);
        return mkFrac(`${a}/${d} + ${b}/${d} = ? (simplifique se der)`, a+b, d, [`Denominadores iguais: some só os numeradores.`, `${a} + ${b} = ${a+b} → ${a+b}/${d}`, `Simplificando: ${fracStr(a+b,d)}`]); },
    ],
  },
  decimais:{
    facil:[
      ()=>{ const a=randInt(1,8), b=randInt(1,9-a);
        return mkSingle(`0,${a} + 0,${b} = ?`, (a+b)/10, [`Some os décimos: ${a} + ${b} = ${a+b} décimos.`, `= ${fmt((a+b)/10)}`]); },
      ()=>{ const n=randInt(1,9);
        return mkSingle(`Escreva ${n}/10 em número decimal.`, n/10, [`${n}/10 = ${n} décimos.`, `= 0,${n}`]); },
      ()=>{ const a=randInt(2,9)+0.5, k=2;
        return mkSingle(`${fmt(a)} × ${k} = ?`, a*k, [`${fmt(a)} = ${Math.floor(a)} + 0,5.`, `${Math.floor(a)} × 2 = ${Math.floor(a)*2} e 0,5 × 2 = 1.`, `${Math.floor(a)*2} + 1 = ${a*k}`]); },
    ],
  },
  porcentagem:{
    facil:[
      ()=>{ const n=2*randInt(5,60);
        return mkSingle(`Quanto é 50% de ${n}?`, n/2, [`50% é a metade.`, `${n} ÷ 2 = ${n/2}`]); },
      ()=>{ const n=4*randInt(3,30);
        return mkSingle(`Quanto é 25% de ${n}?`, n/4, [`25% é a quarta parte (1/4).`, `${n} ÷ 4 = ${n/4}`]); },
      ()=>{ const p=randInt(2,20)*10;
        return mkSingle(`Uma camiseta de R$ ${p},00 está com 10% de desconto. Quanto ela vai custar? (em reais)`, p*0.9, [`10% de ${p} = ${p/10}.`, `${p} − ${p/10} = ${fmt(p*0.9)}`]); },
    ],
  },
  geometria:{
    facil:[
      ()=>{ const l=randInt(2,15);
        return mkSingle(`Qual é o perímetro de um quadrado de lado ${l} cm? (em cm)`, 4*l, [`O quadrado tem 4 lados iguais.`, `4 × ${l} = ${4*l} cm`]); },
      ()=>{ const a=randInt(2,12), b=randInt(2,12);
        return mkSingle(`Qual é a área de um retângulo de ${a} m por ${b} m? (em m²)`, a*b, [`Área do retângulo = base × altura.`, `${a} × ${b} = ${a*b} m²`]); },
    ],
  },

  /* ---------------- 6º e 7º ano ---------------- */
  divisores:{
    facil:[
      ()=>{ const n=randInt(3,12), k=randInt(3,10);
        return mkSingle(`Qual é o ${k}º múltiplo de ${n}? (contando ${n} como o 1º)`, n*k, [`Os múltiplos de ${n} são ${n}, ${2*n}, ${3*n}, …`, `O ${k}º é ${n} × ${k} = ${n*k}`]); },
      ()=>{ const n=randInt(3,9), lim=n*randInt(6,12);
        return mkSingle(`Quantos múltiplos de ${n} existem de 1 até ${lim}?`, lim/n, [`Os múltiplos vão de ${n} × 1 até ${n} × ${lim/n} = ${lim}.`, `São ${lim/n} múltiplos.`]); },
      ()=>{ const ps=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53], n=randInt(2,50), p=ps.find(x=>x>n);
        return mkSingle(`Qual é o menor número primo maior que ${n}?`, p, [`Primo só é divisível por 1 e por ele mesmo.`, `Testando a partir de ${n+1}: o primeiro primo é ${p}.`]); },
    ],
    medio:[
      ()=>{ const n=pick([6,8,10,12,15,16,18,20,24,28]), ds=[]; for(let i=1;i<=n;i++) if(n%i===0) ds.push(i);
        return mkSingle(`Qual é a soma de todos os divisores positivos de ${n}?`, ds.reduce((a,b)=>a+b,0), [`Divisores de ${n}: ${ds.join(', ')}.`, `Soma: ${ds.join(' + ')} = ${ds.reduce((a,b)=>a+b,0)}`]); },
      ()=>{ const lim=pick([10,20,30,40,50]), ps=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47].filter(p=>p<=lim);
        return mkSingle(`Quantos números primos existem de 1 até ${lim}?`, ps.length, [`Primos até ${lim}: ${ps.join(', ')}.`, `(O 1 não é primo.) São ${ps.length}.`]); },
      ()=>{ const n=pick([12,18,20,28,30,42,44,45,50,63,66,70,75,84,90,98]), f=primeFactors(n), mx=Math.max(...Object.keys(f).map(Number));
        return mkSingle(`Qual é o maior fator primo de ${n}?`, mx, [`Fatorando: ${n} = ${factorsStr(f)}.`, `O maior primo da fatoração é ${mx}.`]); },
    ],
    dificil:[
      ()=>{ const set=pick([[2,3,4],[3,4,5],[4,5,6],[2,5,6],[3,5,6]]), r=pick([1,2]), m=set.reduce((a,b)=>lcm(a,b))+r;
        return mkSingle(`Qual é o menor número maior que ${r} que, dividido por ${set.join(', ')}, deixa sempre resto ${r}?`, m, [`Tire o resto: o número − ${r} tem que ser múltiplo de ${set.join(', ')}.`, `MMC(${set.join(', ')}) = ${m-r}.`, `Número = ${m-r} + ${r} = ${m}`]); },
      ()=>{ const a=pick([2,3,5]), b=pick([2,3,4]), p2=pick([[2,3],[2,5],[3,5]]), n=Math.pow(p2[0],a)*Math.pow(p2[1],b);
        return mkSingle(`O número ${n} = ${p2[0]}<sup>${a}</sup> × ${p2[1]}<sup>${b}</sup>. Quantos divisores positivos ele tem?`, (a+1)*(b+1), [`Some 1 a cada expoente e multiplique.`, `(${a} + 1) × (${b} + 1) = ${a+1} × ${b+1} = ${(a+1)*(b+1)}`]); },
      ()=>{ const n=pick([6,7,8,9,11,12,13]), lo=100, hi=pick([200,300]), first=Math.ceil(lo/n)*n, last=Math.floor(hi/n)*n, c=(last-first)/n+1;
        return mkSingle(`Quantos múltiplos de ${n} existem entre ${lo} e ${hi}?`, c, [`Primeiro múltiplo a partir de ${lo}: ${first}. Último até ${hi}: ${last}.`, `Quantidade: (${last} − ${first}) ÷ ${n} + 1 = ${c}`]); },
    ],
  },
  potenciacao:{
    facil:[
      ()=>{ const e=randInt(3,6);
        return mkSingle(`2<sup>${e}</sup> = ?`, Math.pow(2,e), [`2 multiplicado por ele mesmo ${e} vezes.`, `${Array(e).fill(2).join(' × ')} = ${Math.pow(2,e)}`]); },
      ()=>{ const e=randInt(2,5);
        return mkSingle(`10<sup>${e}</sup> = ?`, Math.pow(10,e), [`Potência de 10: o 1 seguido de ${e} zeros.`, `10<sup>${e}</sup> = ${Math.pow(10,e)}`]); },
      ()=>{ const b=randInt(2,30);
        return mkSingle(`${b}<sup>0</sup> = ?`, 1, [`Todo número (diferente de zero) elevado a 0 dá 1.`, `${b}<sup>0</sup> = 1`]); },
    ],
    medio:[
      ()=>{ const b=pick([2,3,4,5,10]);
        return mkSingle(`∛${b*b*b} = ? (raiz cúbica)`, b, [`Que número vezes ele mesmo 3 vezes dá ${b*b*b}?`, `${b} × ${b} × ${b} = ${b*b*b}, então a raiz cúbica é ${b}.`]); },
      ()=>{ const b=pick([2,3,5,10]), m=randInt(2,4), n=randInt(2,4);
        return mkSingle(`${b}<sup>${m}</sup> × ${b}<sup>${n}</sup> = ${b}<sup>?</sup> (qual é o expoente?)`, m+n, [`Multiplicação de mesma base: conserve a base e some os expoentes.`, `${m} + ${n} = ${m+n}`]); },
      ()=>{ const a=pick([4,9,16,25,36,49,64,81,100]), b=pick([4,9,16,25,36,49]), r=Math.sqrt(a)+Math.sqrt(b);
        return mkSingle(`√${a} + √${b} = ?`, r, [`√${a} = ${Math.sqrt(a)} e √${b} = ${Math.sqrt(b)}.`, `${Math.sqrt(a)} + ${Math.sqrt(b)} = ${r}`]); },
    ],
    dificil:[
      ()=>{ const b=pick([2,3]), m=randInt(6,10), n=randInt(2,m-2);
        return mkSingle(`${b}<sup>${m}</sup> ÷ ${b}<sup>${n}</sup> = ?`, Math.pow(b,m-n), [`Divisão de mesma base: subtraia os expoentes: ${b}<sup>${m}−${n}</sup> = ${b}<sup>${m-n}</sup>.`, `${b}<sup>${m-n}</sup> = ${Math.pow(b,m-n)}`]); },
      ()=>{ const b=pick([2,3]), m=pick([2,3]), n=2;
        return mkSingle(`(${b}<sup>${m}</sup>)<sup>${n}</sup> = ?`, Math.pow(b,m*n), [`Potência de potência: multiplique os expoentes: ${m} × ${n} = ${m*n}.`, `${b}<sup>${m*n}</sup> = ${Math.pow(b,m*n)}`]); },
      ()=>{ const b=pick([-2,-3,-4,-5]), e=pick([2,3]);
        return mkSingle(`(${nm(b)})<sup>${e}</sup> = ?`, Math.pow(b,e), [`Base negativa: expoente par dá positivo, ímpar dá negativo.`, `${Array(e).fill(np(b)).join(' × ')} = ${nm(Math.pow(b,e))}`]); },
    ],
  },
  expressoes:{
    facil:[
      ()=>{ const a=randInt(2,9), b=randInt(2,9), c=randInt(1,a*b-1);
        return mkSingle(`${a} × ${b} − ${c} = ?`, a*b-c, [`Primeiro a multiplicação: ${a} × ${b} = ${a*b}.`, `${a*b} − ${c} = ${a*b-c}`]); },
      ()=>{ const b=randInt(2,9), q=randInt(2,9), a=b*q, c=randInt(1,20);
        return mkSingle(`${a} ÷ ${b} + ${c} = ?`, q+c, [`Primeiro a divisão: ${a} ÷ ${b} = ${q}.`, `${q} + ${c} = ${q+c}`]); },
      ()=>{ const a=randInt(10,40), b=randInt(2,9), c=randInt(2,20);
        return mkSingle(`${a} − ${b} + ${c} = ?`, a-b+c, [`Só + e −: faça na ordem, da esquerda pra direita.`, `${a} − ${b} = ${a-b}`, `${a-b} + ${c} = ${a-b+c}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,9), c=randInt(1,8), b=c+randInt(1,9);
        return mkSingle(`${a} × (${b} − ${c}) = ?`, a*(b-c), [`Primeiro o parêntese: ${b} − ${c} = ${b-c}.`, `${a} × ${b-c} = ${a*(b-c)}`]); },
      ()=>{ const c=randInt(2,6), s=c*randInt(2,9), a=randInt(1,s-1), b=s-a;
        return mkSingle(`(${a} + ${b}) ÷ ${c} = ?`, s/c, [`Primeiro o parêntese: ${a} + ${b} = ${s}.`, `${s} ÷ ${c} = ${s/c}`]); },
      ()=>{ const a=randInt(5,20), b=randInt(2,6), c=randInt(2,6), d=randInt(1,a);
        return mkSingle(`${a} + ${b} × ${c} − ${d} = ?`, a+b*c-d, [`Primeiro a multiplicação: ${b} × ${c} = ${b*c}.`, `Depois da esquerda pra direita: ${a} + ${b*c} = ${a+b*c}`, `${a+b*c} − ${d} = ${a+b*c-d}`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const c=randInt(1,5), b=c+randInt(1,6), d=randInt(2,4), e=randInt(2,5), a=randInt(1,20); return {a,b,c,d,e,s:a+(b-c)*d}; }, v=>v.s%v.e===0);
        if(!r) return mkSingle('[2 + (5 − 1) × 2] ÷ 5 = ?', 2, ['Parêntese: 5 − 1 = 4', 'Colchete: 2 + 4 × 2 = 10', '10 ÷ 5 = 2']);
        const {a,b,c,d,e,s}=r;
        return mkSingle(`[${a} + (${b} − ${c}) × ${d}] ÷ ${e} = ?`, s/e, [`Parêntese: ${b} − ${c} = ${b-c}.`, `Colchete: ${a} + ${b-c} × ${d} = ${a} + ${(b-c)*d} = ${s}.`, `${s} ÷ ${e} = ${s/e}`]); },
      ()=>{ const a=randInt(3,9), b=randInt(2,6), c=randInt(2,6), d=randInt(1,10);
        return mkSingle(`${a}² − ${b} × ${c} + ${d} = ?`, a*a-b*c+d, [`Potência primeiro: ${a}² = ${a*a}.`, `Multiplicação: ${b} × ${c} = ${b*c}.`, `${a*a} − ${b*c} + ${d} = ${a*a-b*c+d}`]); },
      ()=>{ const r=mqTry(()=>{ const b=randInt(2,5), a=b*randInt(1,6), c=randInt(1,9); return {a,b,c,k:randInt(2,4)}; }, v=>true);
        const {a,b,c,k}=r, inner=c+a/b;
        return mkSingle(`${k} × {${c} + [${a} ÷ ${b}]} = ?`, k*inner, [`Colchete: ${a} ÷ ${b} = ${a/b}.`, `Chave: ${c} + ${a/b} = ${inner}.`, `${k} × ${inner} = ${k*inner}`]); },
    ],
  },
  regra3:{
    facil:[
      ()=>{ const ov=randInt(2,4), bo=pick([10,12]), k=randInt(2,4);
        return mkSingle(`Uma receita usa ${ov} ovos para fazer ${bo} bolinhos. Quantos ovos são necessários para ${bo*k} bolinhos?`, ov*k, [`${bo*k} bolinhos é ${k} vezes ${bo}.`, `Então os ovos também: ${ov} × ${k} = ${ov*k}`]); },
      ()=>{ const v=pick([40,50,60,70,80]), h=randInt(2,5);
        return mkSingle(`Um carro anda ${v} km em 1 hora. Mantendo a velocidade, quantos km ele anda em ${h} horas?`, v*h, [`Grandezas diretas: mais horas, mais km.`, `${v} × ${h} = ${v*h} km`]); },
      ()=>{ const q=randInt(2,6), u=randInt(2,9);
        return mkSingle(`${q} cadernos custam R$ ${q*u},00. Quanto custa 1 caderno? (em reais)`, u, [`Divida o preço pela quantidade.`, `${q*u} ÷ ${q} = ${u}`]); },
    ],
    medio:[
      ()=>{ const r=mqTry(()=>{ const v1=pick([60,80,90,100]), t1=randInt(2,6), v2=pick([40,60,80,100,120,150]); return {v1,t1,v2}; }, x=>x.v2!==x.v1 && (x.v1*x.t1)%x.v2===0);
        const {v1,t1,v2}=r;
        return mkSingle(`A ${v1} km/h, uma viagem leva ${t1} horas. Quanto tempo leva a ${v2} km/h? (em horas)`, v1*t1/v2, [`Grandezas inversas: mais rápido, menos tempo.`, `Distância: ${v1} × ${t1} = ${v1*t1} km.`, `Tempo: ${v1*t1} ÷ ${v2} = ${v1*t1/v2} h`]); },
      ()=>{ const cm=randInt(2,5), km=pick([20,25,50,100]), alvo=cm+randInt(1,8);
        return mkSingle(`Num mapa, ${cm} cm representam ${cm*km} km. Quantos km representam ${alvo} cm?`, alvo*km, [`1 cm = ${cm*km} ÷ ${cm} = ${km} km.`, `${alvo} cm = ${alvo} × ${km} = ${alvo*km} km`]); },
      ()=>{ const r=mqTry(()=>{ const g=pick([200,300,400,500]), p1=pick([4,6,8,10,12]), p2=pick([6,9,10,15,16,18,20]); return {g,p1,p2}; }, x=>x.p1!==x.p2 && (x.g*x.p2)%x.p1===0);
        const {g,p1,p2}=r;
        return mkSingle(`Uma receita usa ${g} g de farinha para ${p1} pessoas. Quantos gramas são necessários para ${p2} pessoas?`, g*p2/p1, [`Por pessoa: ${g} ÷ ${p1} = ${fmt(g/p1)} g.`, `Para ${p2}: ${fmt(g/p1)} × ${p2} = ${g*p2/p1} g`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const p1=randInt(3,10), d1=randInt(8,30), p2=randInt(2,12); return {p1,d1,p2}; }, x=>x.p1!==x.p2 && (x.p1*x.d1)%x.p2===0);
        const {p1,d1,p2}=r;
        return mkSingle(`${p1} pedreiros fazem uma obra em ${d1} dias. Em quantos dias ${p2} pedreiros fazem a mesma obra (mesmo ritmo)?`, p1*d1/p2, [`Inversa: mais pedreiros, menos dias.`, `Trabalho total: ${p1} × ${d1} = ${p1*d1} "dias-pedreiro".`, `${p1*d1} ÷ ${p2} = ${p1*d1/p2} dias`]); },
      ()=>{ const r=mqTry(()=>{ const c1=randInt(4,12), d1=randInt(10,30), c2=randInt(4,15); return {c1,d1,c2}; }, x=>x.c1!==x.c2 && (x.c1*x.d1)%x.c2===0);
        const {c1,d1,c2}=r;
        return mkSingle(`Um saco de ração dura ${d1} dias para ${c1} cães. Para ${c2} cães, quantos dias o mesmo saco dura?`, c1*d1/c2, [`Inversa: mais cães, menos dias.`, `${c1} × ${d1} = ${c1*d1}.`, `${c1*d1} ÷ ${c2} = ${c1*d1/c2} dias`]); },
      ()=>{ const r=mqTry(()=>{ const t=pick([20,25,40,50,60,80]), a=randInt(5,t-1); return {t,a}; }, x=>(x.a*100)%x.t===0);
        const {t,a}=r;
        return mkSingle(`Numa turma de ${t} alunos, ${a} passaram de ano. Que porcentagem passou? (use regra de três)`, a*100/t, [`${t} alunos ↔ 100%`, `${a} alunos ↔ x`, `x = ${a} × 100 ÷ ${t} = ${a*100/t}%`]); },
    ],
  },
  regra3comp:{
    facil:[
      ()=>{ const t=randInt(2,4), h=randInt(1,3), tq=t*h*randInt(1,3), k=randInt(2,3);
        return mkSingle(`${t} torneiras, em ${h} hora${h>1?'s':''}, enchem ${tq} baldes. Quantos baldes as mesmas ${t} torneiras enchem em ${h*k} horas?`, tq*k, [`O número de torneiras não muda; o tempo fica ${k} vezes maior.`, `Baldes: ${tq} × ${k} = ${tq*k}`]); },
    ],
    medio:[
      ()=>{ const r=mqTry(()=>{ const i1=randInt(2,6), m1=pick([4,6,8,10,12]), f1=i1*m1*randInt(5,20), i2=randInt(2,8), m2=pick([2,3,4,5,6,8]); return {i1,m1,f1,i2,m2,f2:f1*i2*m2/(i1*m1)}; }, x=>Number.isInteger(x.f2) && (x.i1!==x.i2 || x.m1!==x.m2));
        const {i1,m1,f1,i2,m2,f2}=r;
        return mkSingle(`${i1} impressoras imprimem ${f1} folhas em ${m1} minutos. Quantas folhas ${i2} impressoras imprimem em ${m2} minutos?`, f2, [`Folhas são diretamente proporcionais às impressoras e ao tempo.`, `${f1} × (${i2}/${i1}) × (${m2}/${m1}) = ${f2}`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const m1=randInt(4,10), h1=pick([5,6,8]), d1=randInt(3,8), p1=m1*h1*d1*randInt(2,10), m2=randInt(3,12), h2=pick([4,6,8,10]), d2=randInt(2,9); return {m1,h1,d1,p1,m2,h2,d2,p2:p1*m2*h2*d2/(m1*h1*d1)}; }, x=>Number.isInteger(x.p2));
        const {m1,h1,d1,p1,m2,h2,d2,p2}=r;
        return mkSingle(`${m1} máquinas, trabalhando ${h1} h por dia, fazem ${p1} peças em ${d1} dias. Quantas peças ${m2} máquinas fazem trabalhando ${h2} h por dia durante ${d2} dias?`, p2, [`Peças são diretamente proporcionais a máquinas, horas por dia e dias.`, `${p1} × (${m2}/${m1}) × (${h2}/${h1}) × (${d2}/${d1}) = ${p2}`]); },
    ],
  },
  eq1:{
    facil:[
      ()=>{ const a=randInt(2,9), r=randInt(2,12);
        return mkSingle(`x ÷ ${a} = ${r}. Quanto vale x?`, a*r, [`Faça a operação inversa: multiplique por ${a}.`, `x = ${r} × ${a} = ${a*r}`]); },
      ()=>{ const a=randInt(3,30), x=a+randInt(1,40);
        return mkSingle(`x − ${a} = ${x-a}. Quanto vale x?`, x, [`Passe o ${a} somando.`, `x = ${x-a} + ${a} = ${x}`]); },
      ()=>{ const k=randInt(3,15), x=randInt(2,30);
        return mkSingle(`Pensei num número, somei ${k} e deu ${x+k}. Que número pensei?`, x, [`x + ${k} = ${x+k}`, `x = ${x+k} − ${k} = ${x}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,6), b=randInt(1,8), x=randInt(-5,10);
        return mkSingle(`${a}(x + ${b}) = ${nm(a*(x+b))}. Quanto vale x?`, x, [`Divida os dois lados por ${a}: x + ${b} = ${nm(x+b)}.`, `x = ${x+b} − ${b} = ${nm(x)}`]); },
      ()=>{ const a=randInt(2,5), x=a*randInt(1,8), b=randInt(1,10);
        return mkSingle(`x/${a} + ${b} = ${x/a+b}. Quanto vale x?`, x, [`Tire ${b} dos dois lados: x/${a} = ${x/a}.`, `Multiplique por ${a}: x = ${x}`]); },
      ()=>{ const k=randInt(1,12), x=randInt(3,25);
        return mkSingle(`O dobro de um número, menos ${k}, é igual a ${2*x-k}. Que número é esse?`, x, [`2x − ${k} = ${2*x-k}`, `2x = ${2*x}`, `x = ${x}`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const a=randInt(2,6), c=randInt(1,5), x=randInt(-4,12), b=randInt(1,6), d=randInt(1,6); return {a,b,c,d,x}; }, v=>v.a!==v.c && v.a*(v.x-v.b)===v.c*(v.x+v.d));
        if(r){ const {a,b,c,d,x}=r; return mkSingle(`${a}(x − ${b}) = ${c}(x + ${d}). Quanto vale x?`, x, [`Distribua: ${a}x − ${a*b} = ${c}x + ${c*d}.`, `${a}x − ${c}x = ${c*d} + ${a*b} → ${a-c}x = ${c*d+a*b}.`, `x = ${c*d+a*b} ÷ ${a-c} = ${nm(x)}`]); }
        return mkSingle(`3(x − 2) = 2(x + 1). Quanto vale x?`, 8, ['3x − 6 = 2x + 2', 'x = 8']); },
      ()=>{ const ab=pick([[2,3],[3,4],[2,5],[3,6],[4,6]]), m=lcm(ab[0],ab[1]), x=m*randInt(1,4), s=x/ab[0]+x/ab[1];
        return mkSingle(`x/${ab[0]} + x/${ab[1]} = ${s}. Quanto vale x?`, x, [`MMC(${ab[0]}, ${ab[1]}) = ${m}. Multiplique tudo por ${m}.`, `${m/ab[0]}x + ${m/ab[1]}x = ${s*m} → ${m/ab[0]+m/ab[1]}x = ${s*m}`, `x = ${x}`]); },
      ()=>{ const f=randInt(5,15), k=pick([3,4]), soma=f*(k+1);
        return mkSingle(`Um pai tem ${k===3?'o triplo':'o quádruplo'} da idade do filho. Juntos, eles têm ${soma} anos. Quantos anos tem o filho?`, f, [`Filho: x. Pai: ${k}x.`, `x + ${k}x = ${soma} → ${k+1}x = ${soma}`, `x = ${f}`]); },
    ],
  },
  estatistica:{
    facil:[
      ()=>{ const m=randInt(2,9), outros=shuffle([1,2,3,4,5,6,7,8,9,10,11,12].filter(v=>v!==m)).slice(0,3), o=shuffle([m,m,m,...outros]);
        return mkSingle(`Qual é a moda de ${o.join(', ')}?`, m, [`Moda é o valor que mais aparece.`, `${m} aparece 3 vezes; os outros, só 1.`]); },
      ()=>{ const arr=Array.from({length:5},()=>randInt(1,30)), mx=Math.max(...arr), mn=Math.min(...arr);
        return mkSingle(`Qual é a amplitude (maior − menor) de ${arr.join(', ')}?`, mx-mn, [`Maior: ${mx}. Menor: ${mn}.`, `${mx} − ${mn} = ${mx-mn}`]); },
    ],
    medio:[
      ()=>{ const arr=Array.from({length:5},()=>randInt(1,40)), s=arr.slice().sort((a,b)=>a-b);
        return mkSingle(`Qual é a mediana de ${arr.join(', ')}?`, s[2], [`Coloque em ordem: ${s.join(', ')}.`, `O do meio (3º de 5) é ${s[2]}.`]); },
      ()=>{ const r=mqTry(()=>{ const n=[randInt(4,10),randInt(4,10),randInt(4,10)], alvo=pick([6,7,8]); return {n,alvo,x:alvo*4-n[0]-n[1]-n[2]}; }, v=>v.x>=0 && v.x<=10);
        const {n,alvo,x}=r;
        return mkSingle(`${pick(MQ_NOMES)} tirou ${n.join(', ')} nas três primeiras provas. Quanto precisa tirar na 4ª para a média das quatro ser ${alvo}?`, x, [`Soma necessária: ${alvo} × 4 = ${alvo*4}.`, `Já tem: ${n.join(' + ')} = ${n[0]+n[1]+n[2]}.`, `Falta: ${alvo*4} − ${n[0]+n[1]+n[2]} = ${x}`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const n1=randInt(4,10), n2=randInt(4,10), p1=pick([1,2,3]), p2=pick([2,3,4]); return {n1,n2,p1,p2,m:(n1*p1+n2*p2)/(p1+p2)}; }, v=>Number.isInteger(v.m*10));
        const {n1,n2,p1,p2,m}=r;
        return mkSingle(`A nota da prova tem peso ${p2} e a do trabalho tem peso ${p1}. Com ${n2} na prova e ${n1} no trabalho, qual é a média ponderada?`, m, [`Média ponderada = (nota × peso + nota × peso) ÷ (soma dos pesos).`, `(${n2} × ${p2} + ${n1} × ${p1}) ÷ ${p1+p2} = ${n2*p2+n1*p1} ÷ ${p1+p2} = ${fmt(m)}`]); },
      ()=>{ const r=mqTry(()=>{ const n=randInt(4,9), m=randInt(5,15), x=randInt(1,40); return {n,m,x,nm:(n*m+x)/(n+1)}; }, v=>Number.isInteger(v.nm));
        const {n,m,x,nm:nm2}=r;
        return mkSingle(`A média de ${n} números é ${m}. Acrescentando o número ${x}, qual passa a ser a média?`, nm2, [`Soma dos ${n} números: ${n} × ${m} = ${n*m}.`, `Nova soma: ${n*m} + ${x} = ${n*m+x}.`, `Nova média: ${n*m+x} ÷ ${n+1} = ${nm2}`]); },
    ],
  },
  angulos:{
    facil:[
      ()=>{ const a=randInt(10,170);
        return mkSingle(`Qual é o suplemento de um ângulo de ${a}°? (em graus)`, 180-a, [`Suplementares somam 180°.`, `180 − ${a} = ${180-a}°`]); },
      ()=>{ const a=randInt(15,165);
        return mkSingle(`Duas retas se cruzam e um dos ângulos mede ${a}°. Quanto mede o ângulo oposto pelo vértice? (em graus)`, a, [`Ângulos opostos pelo vértice são iguais.`, `= ${a}°`]); },
    ],
    medio:[
      ()=>{ const v=2*randInt(10,70);
        return mkSingle(`Num triângulo isósceles, o ângulo do vértice mede ${v}°. Quanto mede cada ângulo da base? (em graus)`, (180-v)/2, [`Os dois ângulos da base são iguais e os três somam 180°.`, `(180 − ${v}) ÷ 2 = ${(180-v)/2}°`]); },
      ()=>{ const a=randInt(30,80), b=randInt(30,80);
        return mkSingle(`Dois ângulos internos de um triângulo medem ${a}° e ${b}°. Quanto mede o ângulo externo do terceiro vértice? (em graus)`, a+b, [`O ângulo externo é a soma dos dois internos que não estão do lado dele.`, `${a} + ${b} = ${a+b}°`]); },
    ],
    dificil:[
      ()=>{ const n=pick([5,6,8,9,10,12]);
        return mkSingle(`Quanto mede cada ângulo interno de um polígono regular de ${n} lados? (em graus)`, (n-2)*180/n, [`Soma dos internos: (${n} − 2) × 180 = ${(n-2)*180}°.`, `Cada um: ${(n-2)*180} ÷ ${n} = ${(n-2)*180/n}°`]); },
      ()=>{ const n=randInt(5,14), S=(n-2)*180;
        return mkSingle(`A soma dos ângulos internos de um polígono é ${S}°. Quantos lados ele tem?`, n, [`(n − 2) × 180 = ${S}`, `n − 2 = ${S/180}`, `n = ${n}`]); },
      ()=>{ const h=pick([1,2,3,4,5,6,7,8,9,10,11]), a=Math.min(h*30, 360-h*30);
        return mkSingle(`Qual é o menor ângulo entre os ponteiros de um relógio às ${h} horas em ponto? (em graus)`, a, [`Cada "hora" do relógio vale 360 ÷ 12 = 30°.`, `${h} × 30 = ${h*30}°${h*30>180?`; o menor é 360 − ${h*30} = ${a}°`:''}`]); },
    ],
  },
  mmcmdc:{
    facil:[
      ()=>{ const [a,b]=pick([[2,3],[3,4],[4,6],[2,5],[3,5],[4,5],[6,8],[4,10]]);
        return mkSingle(`MMC(${a}, ${b}) = ?`, lcm(a,b), mmcSteps(a,b)); },
      ()=>{ const t=pick([[2,3,4],[2,3,5],[2,4,6],[3,4,6]]), m=t.reduce((x,y)=>lcm(x,y));
        return mkSingle(`Qual é o menor número (maior que zero) que é múltiplo de ${t.join(', ')} ao mesmo tempo?`, m, [`É o MMC(${t.join(', ')}).`, `MMC = ${m}`]); },
    ],
    medio:[
      ()=>{ const [a,b]=pick([[10,15],[12,18],[15,20],[20,30],[8,12],[6,9]]);
        return mkSingle(`Um ônibus passa no ponto a cada ${a} minutos e outro a cada ${b}. Se passaram juntos agora, daqui a quantos minutos passam juntos de novo?`, lcm(a,b), [`Repetições juntas: MMC.`, ...mmcSteps(a,b)]); },
      ()=>{ const t=pick([[12,18,24],[16,24,40],[20,30,50],[18,27,45]]), g=t.reduce((x,y)=>gcd(x,y));
        return mkSingle(`MDC(${t.join(', ')}) = ?`, g, [`Maior número que divide os três.`, `MDC(${t[0]}, ${t[1]}) = ${gcd(t[0],t[1])}; MDC(${gcd(t[0],t[1])}, ${t[2]}) = ${g}`]); },
    ],
    dificil:[
      ()=>{ const [a,b]=pick([[12,18],[8,20],[15,25],[14,21],[24,36]]), g=gcd(a,b);
        return mkSingle(`MDC(${a}, ${b}) = ${g}. Sabendo que MMC × MDC = ${a} × ${b}, quanto vale o MMC(${a}, ${b})?`, a*b/g, [`MMC = (${a} × ${b}) ÷ MDC`, `= ${a*b} ÷ ${g} = ${a*b/g}`]); },
      ()=>{ const [a,b]=pick([[240,180],[300,200],[360,240],[420,280],[150,90]]), g=gcd(a,b);
        return mkSingle(`Um piso de ${a} cm por ${b} cm será coberto com ladrilhos quadrados iguais, os maiores possíveis, sem cortar nenhum. Quanto mede o lado de cada ladrilho? (em cm)`, g, [`O lado tem que dividir ${a} e ${b}: é o MDC.`, ...mdcSteps(a,b)]); },
    ],
  },
  padroes:{
    facil:[
      ()=>{ const r=pick([2,3]), a=randInt(1,4), s=[a,a*r,a*r*r,a*r*r*r];
        return mkSingle(`Qual é o próximo número da sequência ${s.join(', ')}, …?`, a*r**4, [`Cada número é o anterior × ${r}.`, `${s[3]} × ${r} = ${a*r**4}`]); },
      ()=>{ const k=randInt(1,4), s=[k,k+1,k+2,k+3].map(v=>v*v);
        return mkSingle(`Qual é o próximo número da sequência ${s.join(', ')}, …?`, (k+4)*(k+4), [`São quadrados: ${k}², ${k+1}², ${k+2}², ${k+3}².`, `O próximo é ${k+4}² = ${(k+4)*(k+4)}`]); },
    ],
    medio:[
      ()=>{ const n=randInt(5,20);
        return mkSingle(`Com palitos, a figura 1 tem 4 palitos (um quadrado), a figura 2 tem 7, a figura 3 tem 10, e assim por diante. Quantos palitos tem a figura ${n}?`, 3*n+1, [`A cada figura entram 3 palitos: 4, 7, 10, …`, `Figura n: 3n + 1.`, `3 × ${n} + 1 = ${3*n+1}`]); },
      ()=>{ const n=randInt(8,40);
        return mkSingle(`Qual é o ${n}º número ímpar (1, 3, 5, 7, …)?`, 2*n-1, [`O n-ésimo ímpar é 2n − 1.`, `2 × ${n} − 1 = ${2*n-1}`]); },
    ],
    dificil:[
      ()=>{ const n=randInt(5,30);
        return mkSingle(`Quanto dá a soma dos ${n} primeiros números ímpares (1 + 3 + 5 + …)?`, n*n, [`1 = 1², 1 + 3 = 4 = 2², 1 + 3 + 5 = 9 = 3²…`, `A soma dos n primeiros ímpares é n².`, `${n}² = ${n*n}`]); },
      ()=>{ const n=randInt(6,20);
        return mkSingle(`Os números triangulares são 1, 3, 6, 10, 15, … Qual é o ${n}º número triangular?`, n*(n+1)/2, [`O n-ésimo triangular é n(n + 1) ÷ 2.`, `${n} × ${n+1} ÷ 2 = ${n*(n+1)/2}`]); },
      ()=>{ const a=randInt(2,9), r=randInt(3,7), k=randInt(15,40), v=a+(k-1)*r;
        return mkSingle(`Na sequência ${a}, ${a+r}, ${a+2*r}, ${a+3*r}, …, em que posição aparece o número ${v}?`, k, [`A sequência cresce de ${r} em ${r}.`, `(${v} − ${a}) ÷ ${r} = ${k-1} saltos.`, `Posição: ${k-1} + 1 = ${k}`]); },
    ],
  },
  unidades:{
    medio:[
      ()=>{ const m=randInt(1,9)+pick([0,0.5,0.25]);
        return mkSingle(`Quantos centímetros há em ${fmt(m)} m?`, Math.round(m*100), [`1 m = 100 cm.`, `${fmt(m)} × 100 = ${fmt(m*100)} cm`]); },
      ()=>{ const k=randInt(1,9)+pick([0.5,0.25,0.2]);
        return mkSingle(`Quantos gramas há em ${fmt(k)} kg?`, Math.round(k*1000), [`1 kg = 1000 g.`, `${fmt(k)} × 1000 = ${fmt(k*1000)} g`]); },
      ()=>{ const l=randInt(1,5)+pick([0.5,0.25,0.75]);
        return mkSingle(`Quantos mililitros há em ${fmt(l)} L?`, l*1000, [`1 L = 1000 mL.`, `${fmt(l)} × 1000 = ${fmt(l*1000)} mL`]); },
    ],
    dificil:[
      ()=>{ const v=pick([36,54,72,90,108,144]);
        return mkSingle(`Um carro está a ${v} km/h. Quanto é isso em m/s?`, Math.round(v*10/36), [`Para passar de km/h pra m/s, divida por 3,6.`, `${v} ÷ 3,6 = ${fmt(v/3.6)} m/s`]); },
      ()=>{ const a=randInt(1,4), b=randInt(1,3), c=pick([0.5,1,1.5]);
        return mkSingle(`Quantos litros cabem numa caixa d'água de ${a} m × ${b} m × ${fmt(c)} m?`, a*b*c*1000, [`Volume: ${a} × ${b} × ${fmt(c)} = ${fmt(a*b*c)} m³.`, `1 m³ = 1000 L → ${fmt(a*b*c)} × 1000 = ${fmt(a*b*c*1000)} L`]); },
      ()=>{ const h=randInt(1,3), m=pick([15,30,45]);
        return mkSingle(`Quantos minutos há em ${h} h e ${m} min?`, h*60+m, [`${h} h = ${h} × 60 = ${h*60} min.`, `${h*60} + ${m} = ${h*60+m} min`]); },
    ],
  },

  /* ---------------- 8º e 9º ano ---------------- */
  produtos:{
    facil:[
      ()=>{ const a=randInt(2,12);
        return mkSingle(`Desenvolvendo (x − ${a})², obtemos x² − bx + c. Quanto vale c?`, a*a, [`(x − a)² = x² − 2ax + a².`, `c = ${a}² = ${a*a}`]); },
      ()=>{ const a=randInt(2,12);
        return mkSingle(`(x + ${a})(x − ${a}) = x² − ?`, a*a, [`Produto da soma pela diferença: (x + a)(x − a) = x² − a².`, `a² = ${a*a}`]); },
    ],
    medio:[
      ()=>{ const a=pick([21,31,41,51,101,61,71]);
        return mkSingle(`Use (a + b)² pra calcular ${a}².`, a*a, [`${a} = ${a-1} + 1.`, `${a}² = ${a-1}² + 2 × ${a-1} × 1 + 1² = ${(a-1)*(a-1)} + ${2*(a-1)} + 1`, `= ${a*a}`]); },
      ()=>{ const a=randInt(3,12);
        return mkSingle(`x² − ${a*a} = (x + a)(x − a). Quanto vale a (positivo)?`, a, [`Diferença de quadrados: x² − a².`, `a² = ${a*a} → a = ${a}`]); },
      ()=>{ const a=randInt(2,10);
        return mkSingle(`x² + ${2*a}x + ${a*a} = (x + ?)²`, a, [`Trinômio quadrado perfeito: x² + 2ax + a².`, `2a = ${2*a} → a = ${a} (e a² = ${a*a} confere).`]); },
    ],
    dificil:[
      ()=>{ const r=mqTry(()=>{ const a=randInt(2,10), b=randInt(1,a-1); return {a,b}; }, v=>true);
        const {a,b}=r, d=a-b, p=a*b;
        return mkSingle(`Se a − b = ${d} e a · b = ${p}, quanto vale a² + b²?`, d*d+2*p, [`(a − b)² = a² − 2ab + b² → a² + b² = (a − b)² + 2ab.`, `${d}² + 2 × ${p} = ${d*d} + ${2*p} = ${d*d+2*p}`]); },
      ()=>{ const s=randInt(5,15), d=randInt(1,s-1);
        return mkSingle(`Se a + b = ${s} e a − b = ${d}, quanto vale a² − b²?`, s*d, [`a² − b² = (a + b)(a − b).`, `${s} × ${d} = ${s*d}`]); },
      ()=>{ const k=randInt(3,8);
        return mkSingle(`Se x + 1/x = ${k}, quanto vale x² + 1/x²?`, k*k-2, [`(x + 1/x)² = x² + 2 + 1/x².`, `x² + 1/x² = ${k}² − 2 = ${k*k-2}`]); },
    ],
  },
  sistemas:{
    facil:[
      ()=>{ const y=randInt(1,15), x=y+randInt(1,10);
        return mkXY(`A soma de dois números é ${x+y} e a diferença entre eles é ${x-y}. Quais são os números? (x é o maior)`, x, y, [`x + y = ${x+y} e x − y = ${x-y}.`, `Somando: 2x = ${2*x} → x = ${x}.`, `y = ${x+y} − ${x} = ${y}`]); },
      ()=>{ const k=pick([2,3]), x=randInt(2,12), y=k*x;
        return mkXY(`y = ${k}x e x + y = ${x+y}. Quanto valem x e y?`, x, y, [`Troque y por ${k}x: x + ${k}x = ${x+y} → ${k+1}x = ${x+y}.`, `x = ${x} e y = ${k} × ${x} = ${y}`]); },
    ],
    medio:[
      ()=>{ const g=randInt(3,15), c=randInt(2,12);
        return mkXY(`Num sítio há galinhas (x) e coelhos (y): ${g+c} cabeças e ${2*g+4*c} pés. Quantos são de cada?`, g, c, [`x + y = ${g+c} e 2x + 4y = ${2*g+4*c}.`, `Do 1º: x = ${g+c} − y. No 2º: 2(${g+c} − y) + 4y = ${2*g+4*c} → 2y = ${2*c} → y = ${c}.`, `x = ${g}`]); },
      ()=>{ const pa=pick([20,30,40]), pc=pa/2, a=randInt(2,8), c=randInt(2,10);
        return mkXY(`Um cinema vendeu ${a+c} ingressos: inteiras (x) de R$ ${pa} e meias (y) de R$ ${pc}, arrecadando R$ ${a*pa+c*pc}. Quantos de cada?`, a, c, [`x + y = ${a+c} e ${pa}x + ${pc}y = ${a*pa+c*pc}.`, `Multiplique o 1º por ${pc}: ${pc}x + ${pc}y = ${(a+c)*pc}. Subtraia: ${pa-pc}x = ${a*(pa-pc)} → x = ${a}.`, `y = ${c}`]); },
    ],
    dificil:[
      ()=>{ const x=randInt(2,9), y=randInt(1,8), a=randInt(2,4), b=randInt(2,3), c=1, d=randInt(1,3);
        const e1=a*x+b*y, e2=c*x+d*y;
        if(a*d-b*c===0) return mkXY(`3x + 2y = 26 e x + 2y = 14. Quanto valem x e y?`, 6, 4, ['Subtraindo: 2x = 12 → x = 6.', 'y = (14 − 6) ÷ 2 = 4']);
        return mkXY(`${a} cadernos e ${b} canetas custam R$ ${e1}. ${c} caderno e ${d} caneta${d>1?'s':''} custam R$ ${e2}. Qual o preço do caderno (x) e da caneta (y)?`, x, y, [`${a}x + ${b}y = ${e1} e x + ${d}y = ${e2}.`, `Do 2º: x = ${e2} − ${d}y. Substituindo e resolvendo: y = ${y}.`, `x = ${e2} − ${d} × ${y} = ${x}`]); },
    ],
  },
  semelhanca:{
    facil:[
      ()=>{ const k=pick([2,3,4]), l=randInt(2,9);
        return mkSingle(`Dois triângulos são semelhantes e a razão de semelhança é ${k} (o maior tem lados ${k} vezes maiores). Um lado do menor mede ${l} cm. Quanto mede o lado correspondente no maior? (em cm)`, k*l, [`Lados correspondentes ficam multiplicados pela razão.`, `${l} × ${k} = ${k*l} cm`]); },
      ()=>{ const t=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15]]);
        return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${t[2]} e um cateto mede ${t[0]}. Quanto mede o outro cateto?`, t[1], [`Pitágoras: c² = h² − a².`, `${t[2]}² − ${t[0]}² = ${t[2]**2} − ${t[0]**2} = ${t[1]**2}`, `√${t[1]**2} = ${t[1]}`]); },
    ],
    medio:[
      ()=>{ const t=pick([[3,4,5],[6,8,10],[5,12,13],[9,12,15]]);
        return mkSingle(`Uma escada de ${t[2]} m está encostada num muro, com o pé a ${t[0]} m do muro. A que altura do muro ela encosta? (em m)`, t[1], [`Escada, muro e chão formam um triângulo retângulo.`, `altura² = ${t[2]}² − ${t[0]}² = ${t[1]**2}`, `altura = ${t[1]} m`]); },
      ()=>{ const k=pick([2,3,4,5]);
        return mkSingle(`Dois polígonos semelhantes têm razão de semelhança ${k}. Quantas vezes a área do maior é maior que a do menor?`, k*k, [`A razão das áreas é o quadrado da razão de semelhança.`, `${k}² = ${k*k}`]); },
    ],
    dificil:[
      ()=>{ const [m,n]=pick([[4,9],[1,4],[2,8],[3,12],[4,16],[9,16]]);
        return mkSingle(`Num triângulo retângulo, a altura relativa à hipotenusa divide a hipotenusa em segmentos de ${m} e ${n}. Quanto mede essa altura?`, Math.sqrt(m*n), [`Relação métrica: h² = m · n.`, `h² = ${m} × ${n} = ${m*n}`, `h = ${Math.sqrt(m*n)}`]); },
      ()=>{ const k=pick([2,3]), lados=pick([[3,4,5],[4,5,6],[5,6,7],[3,5,7],[4,6,8],[5,5,6],[6,7,8],[4,7,9]]), p=lados.reduce((a,b)=>a+b);
        return mkSingle(`Um triângulo tem lados ${lados.join(', ')}. Um triângulo semelhante a ele tem lados ${k} vezes maiores. Qual é o perímetro do triângulo maior?`, p*k, [`Perímetro do menor: ${lados.join(' + ')} = ${p}.`, `O perímetro também fica ${k} vezes maior: ${p} × ${k} = ${p*k}`]); },
    ],
  },
  func1grau:{
    facil:[
      ()=>{ const a=randInt(2,9), b=pick([-9,-7,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9]);
        return mkSingle(`f(x) = ${a}x ${fmtSigned(b)}. Quanto vale f(0)?`, b, [`f(0) = ${a} × 0 ${fmtSigned(b)}.`, `= ${nm(b)}`]); },
      ()=>{ const a=randInt(2,6), b=randInt(1,9), x=randInt(1,8);
        return mkSingle(`f(x) = ${a}x + ${b}. Para qual valor de x temos f(x) = ${a*x+b}?`, x, [`${a}x + ${b} = ${a*x+b}`, `${a}x = ${a*x}`, `x = ${x}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,8), b=randInt(-5,10), x1=randInt(1,3), x2=x1+randInt(1,4);
        return mkSingle(`Uma função do 1º grau tem f(${x1}) = ${nm(a*x1+b)} e f(${x2}) = ${nm(a*x2+b)}. Qual é o coeficiente angular (a)?`, a, [`a = variação de y ÷ variação de x.`, `(${a*x2+b} − ${nm(a*x1+b)}) ÷ (${x2} − ${x1}) = ${a*(x2-x1)} ÷ ${x2-x1} = ${a}`]); },
      ()=>{ const fixo=pick([4,5,6]), km=pick([2,3]), d=randInt(3,15);
        return mkSingle(`Um táxi cobra R$ ${fixo},00 de bandeirada mais R$ ${km},00 por km. Quanto custa uma corrida de ${d} km? (em reais)`, fixo+km*d, [`Preço = ${fixo} + ${km} × km.`, `${fixo} + ${km} × ${d} = ${fixo+km*d}`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(2,6), b=randInt(-4,6), x=randInt(6,12);
        return mkSingle(`Uma função do 1º grau tem f(1) = ${nm(a+b)} e f(3) = ${nm(3*a+b)}. Quanto vale f(${x})?`, a*x+b, [`a = (${3*a+b} − ${nm(a+b)}) ÷ 2 = ${a}.`, `b = f(1) − a = ${nm(a+b)} − ${a} = ${nm(b)}.`, `f(${x}) = ${a} × ${x} ${fmtSigned(b)} = ${a*x+b}`]); },
      ()=>{ const r=mqTry(()=>{ const a=randInt(1,4), b=randInt(-3,5), c=-randInt(1,3), d=randInt(5,15); return {a,b,c,d}; }, v=>(v.d-v.b)%(v.a-v.c)===0);
        const {a,b,c,d}=r, x=(d-b)/(a-c);
        const fx=`${a===1?'':a}x ${fmtSigned(b)}`, gx=`${c===-1?'−':nm(c)}x + ${d}`;
        return mkSingle(`As retas f(x) = ${fx} e g(x) = ${gx} se cruzam num ponto. Qual é o x desse ponto?`, x, [`No encontro, f(x) = g(x): ${fx} = ${gx}.`, `${a-c}x = ${d-b}`, `x = ${x}`]); },
      ()=>{ const p=pick([10,12,15,20,25]), c=pick([200,300,450,600]), r=mqTry(()=>pick([10,12,15,20,25]), v=>c%v===0);
        return mkSingle(`O lucro de uma barraca é L(x) = ${r}x − ${c}, em que x é o número de produtos vendidos. Quantos produtos ela precisa vender para não ter prejuízo nem lucro (L = 0)?`, c/r, [`${r}x − ${c} = 0`, `x = ${c} ÷ ${r} = ${c/r}`]); },
    ],
  },
  logica:{
    facil:[
      ()=>{ const a=randInt(2,12), b=randInt(2,12);
        return mkSingle(`Numa fila, ${pick(MQ_NOMES)} é a ${a}ª pessoa contando da frente e a ${b}ª contando de trás. Quantas pessoas há na fila?`, a+b-1, [`Ela foi contada duas vezes.`, `${a} + ${b} − 1 = ${a+b-1}`]); },
      ()=>{ const y=randInt(4,12), d=randInt(1,6), o=y+d;
        return mkSingle(`A soma das idades de dois irmãos é ${y+o} anos e um tem ${d} ano${d>1?'s':''} a mais que o outro. Quantos anos tem o mais velho?`, o, [`Tire a diferença: ${y+o} − ${d} = ${2*y} → o mais novo tem ${y}.`, `O mais velho: ${y} + ${d} = ${o}`]); },
    ],
    medio:[
      ()=>{ const n=randInt(4,15);
        return mkSingle(`Numa reunião com ${n} pessoas, cada uma cumprimenta todas as outras uma única vez. Quantos apertos de mão acontecem?`, n*(n-1)/2, [`Cada pessoa aperta a mão de ${n-1} outras: ${n} × ${n-1} = ${n*(n-1)}.`, `Cada aperto foi contado duas vezes: ${n*(n-1)} ÷ 2 = ${n*(n-1)/2}`]); },
      ()=>{ const N=randInt(15,99), dig=N<10?N:9+2*(N-9);
        return mkSingle(`Um livro tem as páginas numeradas de 1 até ${N}. Quantos algarismos foram usados para numerar todas?`, dig, [`Páginas 1 a 9: 9 algarismos.`, `Páginas 10 a ${N}: ${N-9} páginas × 2 = ${2*(N-9)}.`, `Total: 9 + ${2*(N-9)} = ${dig}`]); },
    ],
    dificil:[
      ()=>{ const lim=pick([20,30,40,50]); let c=0; for(let i=1;i<=lim;i++) c+=String(i).split('').filter(x=>x==='1').length;
        const un=[]; for(let i=1;i<=lim;i+=10) un.push(i);
        return mkSingle(`Escrevendo os números de 1 até ${lim}, quantas vezes o algarismo 1 aparece?`, c, [`Nas unidades: ${un.join(', ')} → ${un.length} vezes.`, `Nas dezenas: 10 a 19 → 10 vezes.`, `Total: ${un.length} + 10 = ${c}`]); },
      ()=>{ const n=randInt(4,10);
        return mkSingle(`Quantas diagonais tem um polígono de ${n} lados?`, n*(n-3)/2, [`De cada vértice saem ${n} − 3 diagonais.`, `${n} × ${n-3} ÷ 2 = ${n*(n-3)/2} (cada uma foi contada duas vezes)`]); },
    ],
  },
  eq2:{
    facil:[
      ()=>{ const a=randInt(2,12);
        return mkPair(`x² = ${a*a}`, a, -a, [`x é um número que ao quadrado dá ${a*a}.`, `x = ${a} ou x = −${a}`]); },
      ()=>{ const a=randInt(2,12);
        return mkPair(`x² − ${a}x = 0`, 0, a, [`Coloque x em evidência: x(x − ${a}) = 0.`, `x = 0 ou x − ${a} = 0 → x = ${a}`]); },
      ()=>{ const a=randInt(1,9), b=randInt(1,9);
        return mkPair(`(x − ${a})(x + ${b}) = 0`, a, -b, [`Um produto é zero quando um dos fatores é zero.`, `x − ${a} = 0 → x = ${a}`, `x + ${b} = 0 → x = −${b}`]); },
    ],
    medio:[
      ()=>{ const r1=randInt(1,9), r2=randInt(1,9), s=r1+r2, p=r1*r2;
        return mkSingle(`Qual é a soma das raízes de x² − ${s}x + ${p} = 0?`, s, [`Soma das raízes = −b ÷ a.`, `= ${s} ÷ 1 = ${s}`]); },
      ()=>{ const r1=randInt(1,9), r2=randInt(1,9), s=r1+r2, p=r1*r2;
        return mkSingle(`Qual é o produto das raízes de x² − ${s}x + ${p} = 0?`, p, [`Produto das raízes = c ÷ a.`, `= ${p} ÷ 1 = ${p}`]); },
      ()=>{ const b=randInt(2,10), c=randInt(1,12);
        return mkSingle(`Qual é o valor de Δ (delta) em x² + ${b}x + ${c} = 0?`, b*b-4*c, [`Δ = b² − 4ac.`, `${b}² − 4 × 1 × ${c} = ${b*b} − ${4*c} = ${nm(b*b-4*c)}`]); },
    ],
    dificil:[
      ()=>{ const x=randInt(3,12);
        return mkSingle(`O quadrado de um número positivo, menos o dobro dele, é ${x*x-2*x}. Que número é esse?`, x, [`x² − 2x = ${x*x-2*x} → x² − 2x − ${x*x-2*x} = 0.`, `Raízes: ${x} e ${nm(2-x)}.`, `Positivo: x = ${x}`]); },
      ()=>{ const x=randInt(3,12), k=randInt(1,6);
        return mkSingle(`Um retângulo tem largura x e comprimento x + ${k}. A área é ${x*(x+k)}. Quanto vale x?`, x, [`x(x + ${k}) = ${x*(x+k)} → x² + ${k}x − ${x*(x+k)} = 0.`, `Raízes: ${x} e −${x+k}. Medida tem que ser positiva.`, `x = ${x}`]); },
      ()=>{ const r=randInt(2,9);
        return mkSingle(`Para qual valor positivo de k a equação x² − kx + ${r*r} = 0 tem duas raízes iguais?`, 2*r, [`Raízes iguais: Δ = 0.`, `k² − 4 × ${r*r} = 0 → k² = ${4*r*r}`, `k = ${2*r}`]); },
    ],
  },
};

/* ---------------- Ensino Médio ---------------- */
/* matriz com células de texto (aceita "x") */
function mqMat(M){ return `<span class="mat-wrap"><span class="mat"><table>${M.map(r=>`<tr>${r.map(v=>`<td>${typeof v==='number'?nm(v):v}</td>`).join('')}</tr>`).join('')}</table></span></span>`; }
function mqSup(n){ return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join(''); }
Object.assign(MAIS_QUESTOES, {
  exponencial:{
    facil:[
      ()=>{ const b=pick([2,3,5]), n=b===5?randInt(1,3):randInt(2,5);
        return mkSingle(`f(x) = ${b}ˣ. Quanto vale f(${n})?`, Math.pow(b,n), [`f(${n}) = ${b}${mqSup(n)}`, `= ${Math.pow(b,n)}`]); },
      ()=>{ const c=pick([50,100,200,500]), h=randInt(2,5);
        return mkSingle(`Uma colônia de bactérias dobra a cada hora. Começando com ${c} bactérias, quantas haverá depois de ${h} horas?`, c*Math.pow(2,h), [`Depois de ${h} horas: ${c} × 2${mqSup(h)}.`, `${c} × ${Math.pow(2,h)} = ${c*Math.pow(2,h)}`]); },
    ],
    medio:[
      ()=>{ const c=pick([100,200,300]), h=randInt(3,6), f=c*Math.pow(2,h);
        return mkSingle(`Uma população de ${c} bactérias dobra a cada hora. Em quantas horas ela chega a ${f}?`, h, [`${c} × 2ʰ = ${f} → 2ʰ = ${f/c}.`, `2${mqSup(h)} = ${f/c} → h = ${h}`]); },
      ()=>{ const [k0,k1,base,e1,e2]=pick([[9,27,3,2,3],[4,8,2,2,3],[25,125,5,2,3],[4,32,2,2,5],[16,8,2,4,3],[8,32,2,3,5]]), k=[k0,k1];
        if(!Number.isInteger(e2/e1*100)) return mkSingle(`Resolva: 4ˣ = 8`, 1.5, ['4 = 2² e 8 = 2³: 2²ˣ = 2³', '2x = 3 → x = 1,5']);
        return mkSingle(`Resolva: ${k[0]}ˣ = ${k[1]}`, e2/e1, [`Escreva na mesma base: ${k[0]} = ${base}${mqSup(e1)} e ${k[1]} = ${base}${mqSup(e2)}.`, `${e1}x = ${e2} → x = ${fmt(e2/e1)}`]); },
    ],
    dificil:[
      ()=>{ const x=randInt(1,5), v=3*Math.pow(2,x);
        return mkSingle(`Resolva: 2ˣ⁺¹ + 2ˣ = ${v}`, x, [`2ˣ⁺¹ = 2 · 2ˣ. Então 2 · 2ˣ + 2ˣ = 3 · 2ˣ.`, `3 · 2ˣ = ${v} → 2ˣ = ${v/3}`, `x = ${x}`]); },
      ()=>{ const p=pick([1000,2000,5000,10000]), t=pick([10,20]);
        return mkSingle(`Uma cidade tem ${p.toLocaleString('pt-BR')} habitantes e cresce ${t}% ao ano. Quantos habitantes terá daqui a 2 anos?`, Math.round(p*Math.pow(1+t/100,2)), [`P = ${p} × (1 + ${t/100})² = ${p} × ${fmt(Math.pow(1+t/100,2))}.`, `= ${Math.round(p*Math.pow(1+t/100,2))}`]); },
    ],
  },
  logaritmo:{
    facil:[
      ()=>{ const b=pick([2,3,5]), k=b===2?randInt(2,6):randInt(1,4), n=Math.pow(b,k);
        return mkSingle(`Quanto vale log${subN(b)} ${n}?`, k, [`log${subN(b)} ${n} é o expoente que leva ${b} a ${n}.`, `${b}${mqSup(k)} = ${n} → ${k}`]); },
      ()=>{ const b=randInt(2,20);
        return mkSingle(`Quanto vale log${subN(b)} 1?`, 0, [`Todo número (positivo, diferente de 1) elevado a 0 dá 1.`, `log${subN(b)} 1 = 0`]); },
    ],
    medio:[
      ()=>{ const a=randInt(4,7), b=randInt(1,a-2);
        return mkSingle(`Quanto vale log₂ ${Math.pow(2,a)} − log₂ ${Math.pow(2,b)}?`, a-b, [`log₂ ${Math.pow(2,a)} = ${a} e log₂ ${Math.pow(2,b)} = ${b}.`, `${a} − ${b} = ${a-b}`]); },
      ()=>{ const b=pick([2,3,5,10]), k=randInt(2,3);
        return mkSingle(`Se log${subN(b)} x = ${k}, quanto vale x?`, Math.pow(b,k), [`Pela definição: x = ${b}${mqSup(k)}.`, `x = ${Math.pow(b,k)}`]); },
    ],
    dificil:[
      ()=>{ const k=randInt(2,5), a=randInt(1,5);
        return mkSingle(`Resolva: log₂(x − ${a}) = ${k}`, Math.pow(2,k)+a, [`x − ${a} = 2${mqSup(k)} = ${Math.pow(2,k)}.`, `x = ${Math.pow(2,k)+a}`]); },
      ()=>mkSingle(`Use log 2 = 0,30. Quanto vale log 5?`, 0.7, [`5 = 10 ÷ 2 → log 5 = log 10 − log 2.`, `1 − 0,30 = 0,70`]),
      ()=>{ const [b,n,r]=pick([[4,8,1.5],[8,4,null],[9,27,1.5],[4,32,2.5],[25,125,1.5]]);
        if(r===null) return mkFrac(`Quanto vale log₈ 4?`, 2, 3, ['8 = 2³ e 4 = 2²: 8ˣ = 4 → 2³ˣ = 2² → x = 2/3']);
        return mkSingle(`Quanto vale log${subN(b)} ${n}?`, r, [`Escreva na mesma base e iguale os expoentes.`, `${b}ˣ = ${n} → x = ${fmt(r)}`]); },
    ],
  },
  pa:{
    facil:[
      ()=>{ const a=randInt(-10,20), r=pick([-5,-3,-2,2,3,4,5,6,7]);
        return mkSingle(`Qual é a razão da PA (${nm(a)}, ${nm(a+r)}, ${nm(a+2*r)}, …)?`, r, [`Razão = um termo menos o anterior.`, `${nm(a+r)} − ${np(a)} = ${nm(r)}`]); },
      ()=>{ const a=randInt(1,20), r=randInt(1,10), b=a+2*r;
        return mkSingle(`Os números ${a}, x e ${b} formam uma PA. Quanto vale x?`, a+r, [`Numa PA, o termo do meio é a média dos vizinhos.`, `x = (${a} + ${b}) ÷ 2 = ${a+r}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(1,10), r=randInt(2,6), n=randInt(10,40), an=a+(n-1)*r;
        return mkSingle(`Quantos termos tem a PA (${a}, ${a+r}, ${a+2*r}, …, ${an})?`, n, [`aₙ = a₁ + (n − 1)·r → ${an} = ${a} + (n − 1)·${r}.`, `n − 1 = ${(an-a)/r} → n = ${n}`]); },
      ()=>{ const r=randInt(2,7), a3=randInt(1,20), a7=a3+4*r;
        return mkSingle(`Numa PA, a₃ = ${a3} e a₇ = ${a7}. Qual é a razão?`, r, [`De a₃ até a₇ são 4 saltos: 4r = ${a7} − ${a3} = ${4*r}.`, `r = ${r}`]); },
    ],
    dificil:[
      ()=>{ const n=pick([50,100,200,40,60]);
        return mkSingle(`Quanto dá a soma 1 + 2 + 3 + … + ${n}?`, n*(n+1)/2, [`PA com a₁ = 1, aₙ = ${n} e ${n} termos.`, `S = (1 + ${n}) × ${n} ÷ 2 = ${n*(n+1)/2}`]); },
      ()=>{ const a=randInt(1,9), r=randInt(2,5), n=pick([10,15,20,25]), an=a+(n-1)*r;
        return mkSingle(`Uma PA de ${n} termos tem a₁ = ${a} e a${subN(n)} = ${an}. Qual é a soma dos termos?`, (a+an)*n/2, [`S = (a₁ + aₙ)·n ÷ 2`, `(${a} + ${an}) × ${n} ÷ 2 = ${(a+an)*n/2}`]); },
    ],
  },
  pg:{
    facil:[
      ()=>{ const a=randInt(1,5), q=pick([2,3,4,5]);
        return mkSingle(`Qual é a razão da PG (${a}, ${a*q}, ${a*q*q}, …)?`, q, [`Razão = um termo dividido pelo anterior.`, `${a*q} ÷ ${a} = ${q}`]); },
      ()=>{ const a=pick([64,128,256,81,243]), q=a%3===0?3:2;
        return mkSingle(`Qual é o próximo termo da PG (${a}, ${a/q}, ${a/q/q}, …)?`, a/q/q/q, [`Cada termo é o anterior dividido por ${q}.`, `${a/q/q} ÷ ${q} = ${a/q/q/q}`]); },
    ],
    medio:[
      ()=>{ const a1=randInt(1,6), q=pick([2,3,4]);
        return mkSingle(`Numa PG, a₂ = ${a1*q} e a₃ = ${a1*q*q}. Quanto vale a₁?`, a1, [`Razão: ${a1*q*q} ÷ ${a1*q} = ${q}.`, `a₁ = a₂ ÷ q = ${a1*q} ÷ ${q} = ${a1}`]); },
      ()=>{ const [a,b]=pick([[4,16],[2,8],[3,27],[2,18],[4,36],[5,20],[1,49]]);
        return mkSingle(`Os números ${a}, x e ${b} formam uma PG de termos positivos. Quanto vale x?`, Math.sqrt(a*b), [`Na PG, o termo do meio ao quadrado é o produto dos vizinhos: x² = ${a} × ${b} = ${a*b}.`, `x = ${Math.sqrt(a*b)}`]); },
    ],
    dificil:[
      ()=>{ const a=pick([2,4,6,8,10,12]);
        return mkSingle(`Quanto vale a soma infinita ${a} + ${fmt(a/2)} + ${fmt(a/4)} + ${fmt(a/8)} + …?`, 2*a, [`PG infinita com a₁ = ${a} e q = 1/2.`, `S = a₁ ÷ (1 − q) = ${a} ÷ 1/2 = ${2*a}`]); },
      ()=>{ const h=pick([81,243,162]), n=pick([2,3]);
        return mkSingle(`Uma bola cai de ${h} m e, a cada batida no chão, sobe 1/3 da altura anterior. Que altura ela atinge depois da ${n}ª batida? (em m)`, h/Math.pow(3,n), [`PG com razão 1/3.`, `${h} × (1/3)${mqSup(n)} = ${h} ÷ ${Math.pow(3,n)} = ${h/Math.pow(3,n)} m`]); },
    ],
  },
  conicas:{
    facil:[
      ()=>{ const r=randInt(2,12);
        return mkSingle(`Qual é o raio da circunferência x² + y² = ${r*r}?`, r, [`x² + y² = r² → r² = ${r*r}.`, `r = ${r}`]); },
      ()=>{ const a=randInt(1,9)*pick([1,-1]), b=randInt(1,9)*pick([1,-1]), r=randInt(2,8);
        return mkSingle(`A circunferência (x ${a<0?'+':'−'} ${Math.abs(a)})² + (y ${b<0?'+':'−'} ${Math.abs(b)})² = ${r*r} tem centro (a, b). Quanto vale a?`, a, [`Forma (x − a)² + (y − b)² = r².`, `(x ${a<0?'+':'−'} ${Math.abs(a)}) = (x − (${nm(a)})) → a = ${nm(a)}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(1,6), b=randInt(1,6), r=randInt(2,9);
        return mkSingle(`Qual é o raio da circunferência (x − ${a})² + (y + ${b})² = ${r*r}?`, r, [`Na forma (x − a)² + (y − b)² = r², r² = ${r*r}.`, `r = ${r}`]); },
      ()=>{ const a=randInt(2,10), b=randInt(2,10);
        return mkSingle(`Qual é a medida do eixo real da hipérbole x²/${a*a} − y²/${b*b} = 1?`, 2*a, [`a² = ${a*a} → a = ${a}.`, `Eixo real = 2a = ${2*a}`]); },
    ],
    dificil:[
      ()=>{ const [a,b,c]=pick([[5,4,3],[5,3,4],[10,6,8],[10,8,6],[13,12,5],[13,5,12]]);
        return mkFrac(`Qual é a excentricidade da elipse x²/${a*a} + y²/${b*b} = 1? (responda em fração)`, c, a, [`a² = b² + c² → c² = ${a*a} − ${b*b} = ${c*c} → c = ${c}.`, `e = c/a = ${fracStr(c,a)}`]); },
      ()=>{ const p=randInt(1,6);
        return mkSingle(`A parábola y² = ${4*p}x tem foco no ponto (p, 0). Quanto vale p?`, p, [`Forma y² = 4px.`, `4p = ${4*p} → p = ${p}`]); },
    ],
  },
  ciclo:{
    facil:[
      ()=>{ const a=randInt(1,359), q=a<90?1:a<180?2:a<270?3:4;
        if(a%90===0) return mkSingle(`Em que quadrante está o ângulo de 135°?`, 2, ['Entre 90° e 180°: 2º quadrante.']);
        return mkSingle(`Em que quadrante está o ângulo de ${a}°? (responda 1, 2, 3 ou 4)`, q, [`1º: 0° a 90° · 2º: 90° a 180° · 3º: 180° a 270° · 4º: 270° a 360°.`, `${a}° está no ${q}º quadrante.`]); },
      ()=>{ const [t,f,v]=pick([[90,'sen',1],[180,'cos',-1],[0,'cos',1],[270,'sen',-1],[90,'cos',0],[180,'sen',0]]);
        return mkSingle(`Quanto vale ${f} ${t}°?`, v, [`No ciclo, ${t}° fica no ponto (${nm(Math.round(Math.cos(t*Math.PI/180)))}, ${nm(Math.round(Math.sin(t*Math.PI/180)))}).`, `${f==='sen'?'Seno é o y':'Cosseno é o x'}: ${nm(v)}`]); },
    ],
    medio:[
      ()=>{ const [t,f,v]=pick([[150,'sen',0.5],[210,'sen',-0.5],[120,'cos',-0.5],[300,'cos',0.5],[330,'sen',-0.5],[240,'cos',-0.5]]);
        return mkSingle(`Quanto vale ${f} ${t}°? (em decimal)`, v, [`Reduza ao 1º quadrante: o ângulo de referência é ${[30,60].find(r=>[180-r,180+r,360-r].includes(t))}°.`, `${f} ${t}° = ${fmt(v)} (o sinal vem do quadrante)`]); },
      ()=>{ const r=pick([30,45,60]), q=pick([2,3,4]), t=q===2?180-r:q===3?180+r:360-r;
        return mkSingle(`O ângulo de ${t}° tem qual ângulo de referência no 1º quadrante? (em graus)`, r, [`${q===2?`180° − ${t}°`:q===3?`${t}° − 180°`:`360° − ${t}°`} = ${r}°`]); },
    ],
    dificil:[
      ()=>{ const v=randInt(2,6), r=randInt(10,350);
        return mkSingle(`Quantas voltas completas há no arco de ${v*360+r}°?`, v, [`${v*360+r} ÷ 360 = ${v} e sobram ${r}°.`, `${v} voltas completas`]); },
      ()=>{ const k=pick([[13,6,30],[9,4,45],[7,3,60],[25,6,30],[17,4,45]]);
        return mkSingle(`Qual é a menor determinação positiva, em graus, do arco ${k[0]}π/${k[1]} rad?`, k[2], [`${k[0]}π/${k[1]} = ${k[0]*180/k[1]}°.`, `${k[0]*180/k[1]} − 360${k[0]*180/k[1]>720?' − 360':''} = ${k[2]}°`]); },
    ],
  },
  leis:{
    facil:[
      ()=>{ const a=randInt(2,10)*2, b=randInt(2,10)*2;
        return mkSingle(`Dois lados de um triângulo medem ${a} cm e ${b} cm e formam um ângulo de 30°. Qual é a área? (sen 30° = 0,5)`, a*b/4, [`Área = (a · b · sen θ) ÷ 2.`, `${a} × ${b} × 0,5 ÷ 2 = ${a*b/4} cm²`]); },
    ],
    medio:[
      ()=>{ const a=pick([5,6,8,10,12,15]);
        return mkSingle(`Num triângulo, o lado a mede ${a} cm e o ângulo oposto mede 30°. Qual é o raio da circunferência circunscrita? (a ÷ sen A = 2R)`, a, [`${a} ÷ 0,5 = 2R → 2R = ${2*a}.`, `R = ${a} cm`]); },
      ()=>{ const a=randInt(2,10)*2, b=randInt(2,10);
        return mkSingle(`Dois lados de um triângulo medem ${a} cm e ${b} cm e formam um ângulo de 150°. Qual é a área? (sen 150° = 0,5)`, a*b/4, [`Área = (a · b · sen θ) ÷ 2.`, `${a} × ${b} × 0,5 ÷ 2 = ${fmt(a*b/4)} cm²`]); },
    ],
    dificil:[
      ()=>{ const [a,b,c,ang]=pick([[5,8,7,60],[3,8,7,60],[3,5,7,120],[5,3,7,120]]);
        return mkSingle(`Um triângulo tem lados ${a}, ${b} e ${c}. Quanto mede, em graus, o ângulo oposto ao lado ${c}?`, ang, [`Lei dos cossenos: ${c}² = ${a}² + ${b}² − 2·${a}·${b}·cos θ.`, `${c*c} = ${a*a+b*b} − ${2*a*b}·cos θ → cos θ = ${fmt((a*a+b*b-c*c)/(2*a*b))}.`, `θ = ${ang}°`]); },
    ],
  },
  condicional:{
    facil:[
      ()=>mkFrac(`Uma moeda foi lançada duas vezes e sabe-se que saiu pelo menos uma cara. Qual a probabilidade de terem saído duas caras?`, 1, 3, ['Casos com pelo menos uma cara: CC, CK, KC (3 casos).', 'Só um deles é CC: 1/3']),
      ()=>{ const n=pick([10,12,20]), pares=n/2, lim=pick([4,6]), maiores=[]; for(let i=2;i<=n;i+=2) if(i>lim) maiores.push(i);
        return mkFrac(`Sorteou-se um número de 1 a ${n} e ele é par. Qual a probabilidade de ser maior que ${lim}?`, maiores.length, pares, [`Pares de 1 a ${n}: ${pares} números.`, `Maiores que ${lim}: ${maiores.join(', ')} (${maiores.length}).`, `P = ${maiores.length}/${pares} = ${fracStr(maiores.length,pares)}`]); },
    ],
    medio:[
      ()=>{ const v=randInt(3,7), a=randInt(2,6), t=v+a;
        return mkFrac(`Uma urna tem ${v} bolas vermelhas e ${a} azuis. Tirando 2 bolas, sem reposição, qual a probabilidade de as duas serem vermelhas?`, v*(v-1), t*(t-1), [`1ª vermelha: ${v}/${t}. Dado isso, 2ª vermelha: ${v-1}/${t-1}.`, `P = ${v}/${t} × ${v-1}/${t-1} = ${v*(v-1)}/${t*(t-1)} = ${fracStr(v*(v-1),t*(t-1))}`]); },
    ],
    dificil:[
      ()=>{ const [b1,p1]=pick([[3,1],[2,2],[4,1],[3,2]]), [b2,p2]=pick([[1,3],[1,4],[2,3],[1,2]]);
        const n=b1*(b2+p2), d=b1*(b2+p2)+b2*(b1+p1);
        return mkFrac(`A caixa A tem ${b1} bolas brancas e ${p1} preta${p1>1?'s':''}; a caixa B tem ${b2} branca${b2>1?'s':''} e ${p2} pretas. Escolhe-se uma caixa ao acaso e tira-se uma bola: é branca. Qual a probabilidade de ter vindo da caixa A?`, n, d, [`P(branca e A) = 1/2 × ${b1}/${b1+p1}. P(branca e B) = 1/2 × ${b2}/${b2+p2}.`, `P(A | branca) = (${b1}/${b1+p1}) ÷ (${b1}/${b1+p1} + ${b2}/${b2+p2}).`, `= ${fracStr(n,d)}`]); },
    ],
  },
  juros:{
    facil:[
      ()=>{ const c=pick([500,1000,2000,4000]), i=randInt(1,8), t=randInt(2,10), j=c*i*t/100;
        return mkSingle(`Um capital de R$ ${c} rendeu R$ ${j} de juros simples em ${t} meses. Qual foi a taxa mensal (em %)?`, i, [`J = C · i · t → ${j} = ${c} · i · ${t}.`, `i = ${j} ÷ ${c*t} = ${fmt(i/100)} = ${i}%`]); },
      ()=>{ const i=pick([2,5,10]);
        return mkSingle(`A juros simples de ${i}% ao mês, em quantos meses um capital rende juros iguais à metade dele?`, 50/i, [`Juros = 50% do capital.`, `${i}% × t = 50% → t = ${50/i} meses`]); },
    ],
    medio:[
      ()=>{ const i=randInt(2,6), t=randInt(2,10), c=pick([1000,2000,5000]), j=c*i*t/100;
        return mkSingle(`Qual capital, aplicado a juros simples de ${i}% ao mês por ${t} meses, rende R$ ${j} de juros? (em reais)`, c, [`J = C · i · t → ${j} = C × ${i/100} × ${t}.`, `C = ${j} ÷ ${fmt(i*t/100)} = ${c}`]); },
    ],
    dificil:[
      ()=>{ const c=pick([1000,2000,5000]), i=pick([5,10,20]);
        const m=c*Math.pow(1+i/100,2);
        return mkSingle(`Quanto de juros (não o montante) rende R$ ${c} a juros compostos de ${i}% ao mês, em 2 meses? (em reais)`, Math.round((m-c)*100)/100, [`Montante: ${c} × ${fmt(1+i/100)}² = ${fmt(m)}.`, `Juros: ${fmt(m)} − ${c} = ${fmt(m-c)}`]); },
    ],
  },
  parcelamento:{
    facil:[
      ()=>{ const n=pick([2,3,4,5,6,8,10,12]), p=randInt(5,40)*10;
        return mkSingle(`Um produto de R$ ${n*p} será pago em ${n} parcelas iguais, sem juros. Qual é o valor de cada parcela? (em reais)`, p, [`${n*p} ÷ ${n} = ${p}`]); },
    ],
    medio:[
      ()=>{ const v=randInt(5,30)*100, d=pick([5,10]), n=pick([3,4,5]);
        return mkSingle(`Um produto custa R$ ${v} em ${n}x sem juros ou à vista com ${d}% de desconto. Quantos reais economiza quem paga à vista?`, v*d/100, [`Desconto: ${d}% de ${v} = ${v*d/100}.`, `Economia = R$ ${v*d/100}`]); },
    ],
    dificil:[
      ()=>{ const ent=randInt(2,10)*100, i=pick([5,10]), rest=randInt(2,10)*100, par=rest*(1+i/100), vista=ent+rest;
        return mkSingle(`À vista, um produto custa R$ ${vista}. A prazo: R$ ${ent} de entrada e mais R$ ${par} um mês depois. Qual é a taxa de juros mensal (em %)?`, i, [`Depois da entrada, ficaram devendo ${vista} − ${ent} = ${rest}.`, `Pagaram ${par} por esses ${rest}: juros de ${par-rest}.`, `${par-rest} ÷ ${rest} = ${i}%`]); },
    ],
  },
  descontos:{
    facil:[
      ()=>{ const p=randInt(4,30)*10, d=pick([10,20,25,50]);
        return mkSingle(`Um produto de R$ ${p} está com ${d}% de desconto. De quantos reais é o desconto?`, p*d/100, [`${d}% de ${p} = ${p} × ${d} ÷ 100 = ${fmt(p*d/100)}`]); },
      ()=>{ const p=pick([50,80,100,200,250]), d=pick([10,20,25,40]), f=p*(100-d)/100;
        return mkSingle(`Um produto que custava R$ ${p} passou a custar R$ ${fmt(f)}. De quantos por cento foi o desconto?`, d, [`Desconto em reais: ${p} − ${fmt(f)} = ${fmt(p-f)}.`, `${fmt(p-f)} ÷ ${p} = ${fmt(d/100)} = ${d}%`]); },
    ],
    medio:[
      ()=>{ const t=pick([10,20,25,50]), p=pick([100,200,400]), f=p*(1+t/100)*(1-t/100);
        return mkSingle(`Um produto de R$ ${p} teve aumento de ${t}% e depois desconto de ${t}%. Quanto custa agora? (em reais)`, Math.round(f*100)/100, [`Aumento: ${p} × ${fmt(1+t/100)} = ${fmt(p*(1+t/100))}.`, `Desconto: ${fmt(p*(1+t/100))} × ${fmt(1-t/100)} = ${fmt(f)}`, `Não volta ao preço original!`]); },
    ],
    dificil:[
      ()=>{ const d=pick([10,20,25,40]), o=randInt(2,20)*20, f=o*(100-d)/100;
        if(!Number.isInteger(f*100)) return mkSingle('Depois de 20% de desconto, um produto custa R$ 240. Qual era o preço original?', 300, ['240 = 0,8 × P → P = 300']);
        return mkSingle(`Depois de um desconto de ${d}%, um produto passou a custar R$ ${fmt(f)}. Qual era o preço original? (em reais)`, o, [`Preço com desconto = ${fmt(1-d/100)} × original.`, `Original = ${fmt(f)} ÷ ${fmt(1-d/100)} = ${o}`]); },
    ],
  },
  inflacao:{
    facil:[
      ()=>{ const p=pick([20,40,50,80,100,200]), i=pick([5,10,20,25]), n=p*(1+i/100);
        return mkSingle(`Um produto passou de R$ ${p} para R$ ${fmt(n)}. Qual foi a inflação desse produto (em %)?`, i, [`Aumento: ${fmt(n)} − ${p} = ${fmt(n-p)}.`, `${fmt(n-p)} ÷ ${p} = ${fmt(i/100)} = ${i}%`]); },
    ],
    medio:[
      ()=>{ const i=pick([25,100]), v=i===25?80:50;
        return mkSingle(`Com uma inflação de ${i}%, o que custava R$ 100 passa a custar R$ ${100+i}. Com R$ 100, você compra quantos por cento do que comprava antes?`, v, [`100 ÷ ${100+i} = ${fmt(100/(100+i))}.`, `= ${v}%`]); },
    ],
    dificil:[
      ()=>{ const i=pick([25,100,60]), perda=Math.round(i/(100+i)*10000)/100;
        if(!Number.isInteger(perda*100)) return mkSingle('Com inflação de 25%, quanto o dinheiro perde de poder de compra (em %)?', 20, ['1 ÷ 1,25 = 0,8 → perde 20%']);
        return mkSingle(`Com uma inflação de ${i}%, quanto o dinheiro perde de poder de compra (em %)?`, perda, [`O que custava 100 passa a custar ${100+i}.`, `Poder de compra: 100 ÷ ${100+i} = ${fmt(100/(100+i))}.`, `Perda: 100% − ${fmt(10000/(100+i))}% = ${fmt(perda)}%`]); },
    ],
  },
  determinantes:{
    facil:[
      ()=>{ const b=randInt(1,6), c=randInt(1,6), d=randInt(2,6), x=randInt(1,8), det=x*d-b*c, q=`Para que valor de x o determinante da matriz é ${nm(det)}?`;
        return mkSingle(q, x, [`det = x · ${d} − ${b} · ${c} = ${d}x − ${b*c}.`, `${d}x − ${b*c} = ${nm(det)} → ${d}x = ${det+b*c}`, `x = ${x}`], null, matQ(q, [mqMat([['x',b],[c,d]])]), mqMat([[x,b],[c,d]])); },
      ()=>{ const a=randInt(2,9), d=randInt(2,9), q='Qual é o determinante desta matriz diagonal?';
        return mkSingle(q, a*d, [`Matriz diagonal: o determinante é o produto da diagonal.`, `${a} × ${d} = ${a*d}`], null, matQ(q, [matHTML([[a,0],[0,d]])]), matHTML([[a,0],[0,d]])); },
    ],
    medio:[
      ()=>{ const d=randInt(-6,8)||3, k=pick([2,3]);
        return mkSingle(`A é uma matriz 2×2 com det A = ${nm(d)}. Quanto vale det(${k}A)?`, k*k*d, [`Multiplicar a matriz n×n por k multiplica o det por kⁿ.`, `det(${k}A) = ${k}² × ${np(d)} = ${nm(k*k*d)}`]); },
      ()=>{ const a=randInt(-5,6)||2, b=randInt(-5,6)||3;
        return mkSingle(`det A = ${nm(a)} e det B = ${nm(b)}. Quanto vale det(A · B)?`, a*b, [`det(A · B) = det A × det B.`, `${np(a)} × ${np(b)} = ${nm(a*b)}`]); },
    ],
    dificil:[
      ()=>{ const M=[[randInt(1,5),randInt(-5,5),randInt(-5,5)],[0,randInt(1,5),randInt(-5,5)],[0,0,randInt(-4,5)||2]], d=M[0][0]*M[1][1]*M[2][2], q='Qual é o determinante desta matriz triangular?';
        return mkSingle(q, d, [`Matriz triangular: o determinante é o produto da diagonal principal.`, `${np(M[0][0])} × ${np(M[1][1])} × ${np(M[2][2])} = ${nm(d)}`], null, matQ(q, [matHTML(M)]), matHTML(M)); },
      ()=>{ const d=pick([2,4,5,8,-2,-4,-5]);
        return mkFrac(`A é uma matriz invertível com det A = ${nm(d)}. Quanto vale det(A⁻¹)?`, 1, d, [`det(A⁻¹) = 1 ÷ det A.`, `= 1/${nm(d)}`]); },
    ],
  },
  sistlin:{
    facil:[
      ()=>{ const x=randInt(1,9), y=randInt(1,9), z=randInt(1,9);
        return mkSingle(`Três amigos: x + y = ${x+y}, y + z = ${y+z} e x + z = ${x+z}. Quanto vale x + y + z?`, x+y+z, [`Some as três equações: 2x + 2y + 2z = ${2*(x+y+z)}.`, `x + y + z = ${x+y+z}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(1,5), b=randInt(1,5), c=randInt(1,5), d=-randInt(1,5);
        return mkSingle(`No sistema ${a}x + ${b}y = 7 e ${c}x ${fmtSigned(d)}y = 1, quanto vale o determinante D dos coeficientes?`, a*d-b*c, [`D = | ${a} ${b} ; ${c} ${nm(d)} | = ${a}·${np(d)} − ${b}·${c}`, `= ${nm(a*d)} − ${b*c} = ${nm(a*d-b*c)}`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(1,4), b=randInt(1,4), m=randInt(2,4);
        return mkSingle(`Para qual valor de k o sistema ${a}x + ${b}y = 3 e ${a*m}x + ky = 5 NÃO tem solução única?`, b*m, [`Não tem solução única quando D = 0.`, `D = ${a}k − ${b}·${a*m} = 0 → k = ${b*m}`]); },
    ],
  },
  analitica:{
    facil:[
      ()=>{ const x1=randInt(-8,8), x2=x1+2*randInt(-5,5), y1=randInt(-8,8), y2=randInt(-8,8);
        return mkSingle(`Qual é a coordenada x do ponto médio entre A(${nm(x1)}, ${nm(y1)}) e B(${nm(x2)}, ${nm(y2)})?`, (x1+x2)/2, [`x do ponto médio = (x_A + x_B) ÷ 2.`, `(${nm(x1)} + ${np(x2)}) ÷ 2 = ${nm((x1+x2)/2)}`]); },
      ()=>{ const t=pick([[3,4,5],[6,8,10],[5,12,13],[8,6,10]]);
        return mkSingle(`Qual é a distância do ponto P(${t[0]}, ${t[1]}) até a origem?`, t[2], [`d = √(${t[0]}² + ${t[1]}²) = √${t[0]**2+t[1]**2}`, `= ${t[2]}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(1,6), c=randInt(1,12);
        return mkSingle(`Qual é o coeficiente linear (onde corta o eixo y) da reta ${a}x + y − ${c} = 0?`, c, [`Isole y: y = −${a}x + ${c}.`, `Coeficiente linear = ${c}`]); },
      ()=>{ const m=randInt(-4,5)||2, b=randInt(-6,6), k=randInt(1,6);
        return mkSingle(`A reta tem coeficiente angular ${nm(m)} e passa por (0, ${nm(b)}). Qual é o valor de y quando x = ${k}?`, m*k+b, [`y = ${nm(m)}x ${fmtSigned(b)}`, `y = ${nm(m)} × ${k} ${fmtSigned(b)} = ${nm(m*k+b)}`]); },
    ],
    dificil:[
      ()=>{ const [x0,y0,c]=pick([[1,2,4],[2,1,-5],[3,3,9],[0,0,10],[1,1,-2],[4,2,5]]), d=Math.abs(3*x0+4*y0+c)/5;
        return mkSingle(`Qual é a distância do ponto P(${x0}, ${y0}) até a reta 3x + 4y ${fmtSigned(c)} = 0?`, d, [`d = |3·${x0} + 4·${y0} ${fmtSigned(c)}| ÷ √(3² + 4²)`, `= ${Math.abs(3*x0+4*y0+c)} ÷ 5 = ${fmt(d)}`]); },
      ()=>{ const a=randInt(2,12), b=randInt(2,12);
        return mkSingle(`Qual é a área do triângulo de vértices (0, 0), (${a}, 0) e (0, ${b})?`, a*b/2, [`É um triângulo retângulo com catetos ${a} e ${b}.`, `Área = ${a} × ${b} ÷ 2 = ${fmt(a*b/2)}`]); },
    ],
  },
  trigret:{
    facil:[
      ()=>{ const h=2*randInt(2,15);
        return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${h} cm. Quanto mede o cateto oposto ao ângulo de 30°? (sen 30° = 0,5)`, h/2, [`sen 30° = oposto ÷ hipotenusa.`, `oposto = ${h} × 0,5 = ${h/2} cm`]); },
    ],
    medio:[
      ()=>{ const d=randInt(3,30);
        return mkSingle(`Um poste projeta uma sombra de ${d} m quando os raios do sol fazem 45° com o chão. Qual é a altura do poste? (tg 45° = 1)`, d, [`tg 45° = altura ÷ sombra.`, `altura = ${d} × 1 = ${d} m`]); },
      ()=>{ const c=2*randInt(2,15);
        return mkSingle(`Uma rampa de ${c} m de comprimento faz 30° com o chão. Que altura ela alcança? (sen 30° = 0,5)`, c/2, [`altura = comprimento × sen 30°`, `${c} × 0,5 = ${c/2} m`]); },
    ],
    dificil:[
      ()=>{ const d=randInt(10,40), o=pick([1.5,1.6,1.7,1.8]);
        return mkSingle(`Uma pessoa com os olhos a ${fmt(o)} m do chão está a ${d} m de um prédio e vê o topo sob um ângulo de 45°. Qual é a altura do prédio? (em m)`, d+o, [`tg 45° = 1 → a parte acima dos olhos mede ${d} m.`, `Altura = ${d} + ${fmt(o)} = ${fmt(d+o)} m`]); },
      ()=>{ const e=pick([4,6,8,10]);
        return mkSingle(`Uma escada de ${e} m está apoiada num muro, fazendo 60° com o chão. A que distância do muro está o pé da escada? (cos 60° = 0,5)`, e/2, [`cos 60° = distância ÷ escada.`, `${e} × 0,5 = ${e/2} m`]); },
    ],
  },
  identidades:{
    facil:[
      ()=>{ const x=randInt(10,80);
        return mkSingle(`Quanto vale sen² ${x}° + cos² ${x}°?`, 1, [`Relação fundamental: sen² x + cos² x = 1 para qualquer x.`, `= 1`]); },
      ()=>{ const [c,s]=pick([[0.6,0.8],[0.8,0.6]]);
        return mkSingle(`Se cos x = ${fmt(c)} e x está no 1º quadrante, quanto vale sen x?`, s, [`sen² x = 1 − ${fmt(c)}² = 1 − ${fmt(c*c)} = ${fmt(1-c*c)}.`, `sen x = ${fmt(s)}`]); },
    ],
    medio:[
      ()=>{ const c=pick([0.5,0.25,0.2,0.8]);
        return mkSingle(`Se cos x = ${fmt(c)}, quanto vale sec x?`, 1/c, [`sec x = 1 ÷ cos x.`, `1 ÷ ${fmt(c)} = ${fmt(1/c)}`]); },
      ()=>{ const s=pick([0.6,0.8,0.5]);
        return mkSingle(`Se sen x = ${fmt(s)}, quanto vale cos 2x? (use cos 2x = 1 − 2·sen² x)`, Math.round((1-2*s*s)*100)/100, [`sen² x = ${fmt(s*s)}.`, `cos 2x = 1 − 2 × ${fmt(s*s)} = ${fmt(1-2*s*s)}`]); },
    ],
    dificil:[
      ()=>{ const [o,a,h]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17]]);
        return mkFrac(`Se tg x = ${o}/${a} e x está no 1º quadrante, quanto vale sen x?`, o, h, [`Monte o triângulo: oposto ${o}, adjacente ${a}.`, `Hipotenusa: √(${o}² + ${a}²) = ${h}.`, `sen x = ${o}/${h}`]); },
    ],
  },
  matrizes:{
    facil:[
      ()=>{ const m=randInt(2,5), n=randInt(2,5);
        return mkSingle(`Quantos elementos tem uma matriz ${m}×${n}?`, m*n, [`${m} linhas × ${n} colunas.`, `= ${m*n} elementos`]); },
      ()=>{ const n=randInt(2,6);
        return mkSingle(`Quanto dá a soma de todos os elementos da matriz identidade ${n}×${n}?`, n, [`A identidade tem 1 na diagonal principal e 0 no resto.`, `São ${n} uns: soma = ${n}`]); },
    ],
    medio:[
      ()=>{ const m=randInt(2,5), n=randInt(2,5), p=randInt(2,5);
        return mkSingle(`A é ${m}×${n} e B é ${n}×${p}. Quantas colunas tem a matriz A · B?`, p, [`(${m}×${n}) · (${n}×${p}) = ${m}×${p}.`, `${p} colunas`]); },
      ()=>{ const m=randInt(2,5), n=randInt(2,5);
        return mkSingle(`A matriz A é ${m}×${n}. Quantas linhas tem a transposta Aᵗ?`, n, [`Na transposta, linhas viram colunas.`, `Aᵗ é ${n}×${m}: ${n} linhas`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(-3,4), b=randInt(-3,4), c=randInt(-3,4), d=randInt(-3,4), v=a*a+b*c, q='Sendo A esta matriz, qual é o elemento da linha 1, coluna 1 de A²?';
        return mkSingle(q, v, [`(A²)₁₁ = linha 1 de A · coluna 1 de A.`, `${np(a)}·${np(a)} + ${np(b)}·${np(c)} = ${nm(v)}`], null, matQ(q, [matHTML([[a,b],[c,d]],'A')]), matHTML([[a,b],[c,d]],'A')); },
    ],
  },
  eqtrig:{
    facil:[
      ()=>{ const [f,v,x]=pick([['sen','1/2',30],['tg','1',45],['sen','1',90],['cos','1/2',60],['tg','√3',60],['cos','0',90]]);
        return mkSingle(`Qual é o ângulo x, entre 0° e 90°, com ${f} x = ${v}?`, x, [`Valor notável: ${f} ${x}° = ${v}.`, `x = ${x}°`]); },
    ],
    medio:[
      ()=>{ const [f,v,a,b]=pick([['cos','1/2',60,300],['tg','1',45,225],['sen','1/2',30,150],['cos','√3/2',30,330]]);
        return mkPair(`Resolva ${f} x = ${v} para 0° ≤ x < 360°. (Dê as duas soluções, em graus.)`, a, b, [`No 1º quadrante: ${a}°.`, `${f==='sen'?'Seno positivo também no 2º quadrante':f==='cos'?'Cosseno positivo também no 4º quadrante':'Tangente positiva também no 3º quadrante'}: ${b}°.`]); },
    ],
    dificil:[
      ()=>{ const [eq,a,b]=pick([['2·sen x − 1 = 0',30,150],['2·cos x − 1 = 0',60,300],['2·sen x + 1 = 0',210,330],['tg x + 1 = 0',135,315]]);
        return mkPair(`Resolva ${eq} para 0° ≤ x < 360°. (Dê as duas soluções, em graus.)`, a, b, [`Isole a função trigonométrica.`, `Soluções: ${a}° e ${b}°`]); },
      ()=>mkSingle(`Quantas soluções tem sen x = 0 para 0° ≤ x ≤ 360°?`, 3, ['sen x = 0 em 0°, 180° e 360°.', 'São 3 soluções.']),
    ],
  },
  inequacoes:{
    facil:[
      ()=>{ const a=randInt(2,5), b=randInt(5,30);
        return mkSingle(`Quantos números inteiros positivos satisfazem ${a}x < ${b}?`, Math.ceil(b/a)-1, [`x < ${fmt(b/a)}.`, `Inteiros positivos: 1 até ${Math.ceil(b/a)-1} → ${Math.ceil(b/a)-1}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,5), x0=randInt(1,8), b=a*x0+randInt(1,a-1);
        return mkSingle(`Qual é o maior número inteiro que satisfaz −${a}x + ${b} > 0?`, Math.floor(b/a), [`−${a}x > −${b} → x < ${fmt(b/a)} (o sinal inverte ao dividir por negativo).`, `Maior inteiro: ${Math.floor(b/a)}`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(-5,2), b=a+randInt(2,8);
        return mkSingle(`Quantos números inteiros satisfazem (x ${a<0?'+':'−'} ${Math.abs(a)})(x − ${b}) ≤ 0?`, b-a+1, [`As raízes são ${nm(a)} e ${b}; o produto é ≤ 0 entre elas.`, `Inteiros de ${nm(a)} até ${b}: ${b-a+1}`]); },
    ],
  },
  modular:{
    facil:[
      ()=>{ const a=randInt(1,15), b=randInt(1,15);
        return mkSingle(`Quanto vale |−${a}| − |${b}|?`, a-b, [`|−${a}| = ${a} e |${b}| = ${b}.`, `${a} − ${b} = ${nm(a-b)}`]); },
      ()=>{ const a=randInt(-10,10), b=randInt(-10,10);
        return mkSingle(`Qual é a distância entre ${nm(a)} e ${nm(b)} na reta numérica?`, Math.abs(a-b), [`Distância = |${nm(a)} − ${np(b)}|.`, `= |${nm(a-b)}| = ${Math.abs(a-b)}`]); },
    ],
    medio:[
      ()=>{ const a=randInt(2,10);
        return mkSingle(`Quantos números inteiros satisfazem |x| ≤ ${a}?`, 2*a+1, [`−${a} ≤ x ≤ ${a}.`, `De −${a} até ${a}: ${2*a+1} inteiros`]); },
    ],
    dificil:[
      ()=>{ const a=randInt(1,9), b=randInt(2,8);
        return mkSingle(`Quantos números inteiros satisfazem |x − ${a}| < ${b}?`, 2*b-1, [`−${b} < x − ${a} < ${b} → ${a-b} < x < ${a+b}.`, `Inteiros de ${a-b+1} até ${a+b-1}: ${2*b-1}`]); },
      ()=>{ const b=randInt(2,9), a=randInt(1,9), x1=(a+b)/2;
        if(!Number.isInteger(x1)) return mkSingle(`Resolva |2x − 4| = 6. Qual é a maior solução?`, 5, ['2x − 4 = 6 → x = 5', '2x − 4 = −6 → x = −1', 'Maior: 5']);
        return mkSingle(`Resolva |2x − ${a}| = ${b}. Qual é a maior solução?`, x1, [`2x − ${a} = ${b} → x = ${fmt(x1)}`, `2x − ${a} = −${b} → x = ${fmt((a-b)/2)}`, `Maior: ${fmt(x1)}`]); },
    ],
  },
  dispersao:{
    facil:[
      ()=>{ const r=mqTry(()=>Array.from({length:4},()=>randInt(2,20)), v=>v.reduce((a,b)=>a+b)%4===0) || [2,4,6,8];
        const t=r.reduce((a,b)=>a+b);
        return mkSingle(`Qual é a média dos dados ${r.join(', ')}?`, t/4, [`Soma: ${r.join(' + ')} = ${t}.`, `${t} ÷ 4 = ${t/4}`]); },
    ],
    medio:[
      ()=>{ const k=randInt(2,9), n=randInt(3,6);
        return mkSingle(`Qual é a variância dos dados ${Array(n).fill(k).join(', ')}?`, 0, [`Todos os valores são iguais à média (${k}).`, `Não há variação: variância = 0`]); },
    ],
    dificil:[
      ()=>{ const d=randInt(2,9), k=randInt(2,20);
        return mkSingle(`Um conjunto de dados tem desvio padrão ${d}. Se somarmos ${k} a todos os valores, qual será o novo desvio padrão?`, d, [`Somar a mesma constante desloca todos os dados, mas não muda a distância entre eles.`, `O desvio padrão continua ${d}`]); },
      ()=>{ const d=randInt(2,9), k=pick([2,3,5,10]);
        return mkSingle(`Um conjunto de dados tem desvio padrão ${d}. Se multiplicarmos todos os valores por ${k}, qual será o novo desvio padrão?`, d*k, [`Multiplicar os dados por ${k} multiplica o desvio padrão por ${k}.`, `${d} × ${k} = ${d*k}`]); },
    ],
  },
  probabilidade:{
    facil:[
      ()=>{ const v=randInt(1,6), a=randInt(1,6);
        return mkFrac(`Uma urna tem ${v} bolas vermelhas e ${a} azuis. Tirando uma ao acaso, qual a probabilidade de ser azul?`, a, a+v, [`Casos favoráveis: ${a}. Total: ${a+v}.`, `P = ${a}/${a+v} = ${fracStr(a,a+v)}`]); },
      ()=>mkFrac(`Lançando uma moeda, qual a probabilidade de sair cara?`, 1, 2, ['2 resultados possíveis, 1 favorável: 1/2']),
    ],
    dificil:[
      ()=>{ const n=pick([2,3,4]);
        return mkFrac(`Lançando uma moeda ${n} vezes, qual a probabilidade de sair cara em todas?`, 1, Math.pow(2,n), [`Cada lançamento: 1/2. São independentes.`, `(1/2)${mqSup(n)} = 1/${Math.pow(2,n)}`]); },
      ()=>mkFrac(`Lançando um dado duas vezes, qual a probabilidade de NÃO sair 6 em nenhuma?`, 25, 36, ['Não sair 6 num lançamento: 5/6.', '5/6 × 5/6 = 25/36']),
    ],
  },
  polinomios:{
    facil:[
      ()=>{ const g=randInt(2,6), c=randInt(1,9);
        return mkSingle(`Qual é o grau de P(x) = ${c}x${mqSup(g)} − x + ${randInt(1,9)}?`, g, [`O grau é o maior expoente de x (com coeficiente diferente de zero).`, `Grau ${g}`]); },
      ()=>{ const a=randInt(1,5), b=pick([-5,-4,-3,-2,-1,1,2,3,4,5]), c=pick([-5,-4,-3,-2,-1,1,2,3,4,5]), d=randInt(1,9);
        return mkSingle(`Qual é a soma dos coeficientes de P(x) = ${a}x³ ${fmtSigned(b)}x² ${fmtSigned(c)}x + ${d}?`, a+b+c+d, [`A soma dos coeficientes é P(1).`, `${a} ${fmtSigned(b)} ${fmtSigned(c)} + ${d} = ${a+b+c+d}`]); },
    ],
    dificil:[
      ()=>{ const r=[randInt(1,4),randInt(1,4),randInt(1,5)], s=r[0]+r[1]+r[2], p2=r[0]*r[1]+r[0]*r[2]+r[1]*r[2], p=r[0]*r[1]*r[2];
        return mkSingle(`Qual é a soma das raízes de x³ − ${s}x² + ${p2}x − ${p} = 0?`, s, [`Girard: soma das raízes = −b ÷ a.`, `= ${s} ÷ 1 = ${s}`]); },
      ()=>{ const r=[randInt(1,4),randInt(1,4),randInt(1,5)], s=r[0]+r[1]+r[2], p2=r[0]*r[1]+r[0]*r[2]+r[1]*r[2], p=r[0]*r[1]*r[2];
        return mkSingle(`Qual é o produto das raízes de x³ − ${s}x² + ${p2}x − ${p} = 0?`, p, [`Girard (grau 3): produto = −d ÷ a.`, `= −(−${p}) ÷ 1 = ${p}`]); },
    ],
  },
  complexos:{
    dificil:[
      ()=>{ const k=randInt(5,60), e=4*k+pick([0,2]);
        return mkSingle(`Quanto vale i${String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')}?`, e%4===0?1:-1, [`As potências de i se repetem de 4 em 4: i⁰ = 1, i¹ = i, i² = −1, i³ = −i.`, `${e} ÷ 4 deixa resto ${e%4} → i${'⁰¹²³'[e%4]} = ${e%4===0?'1':'−1'}`]); },
      ()=>{ const a=randInt(1,9), b=randInt(1,9);
        return mkSingle(`Quanto vale (${a} + ${b}i)(${a} − ${b}i)?`, a*a+b*b, [`z · z̄ = a² + b².`, `${a}² + ${b}² = ${a*a+b*b}`]); },
    ],
  },
  conjuntos:{
    facil:[
      ()=>{ const ab=randInt(1,8), a=ab+randInt(2,10), b=ab+randInt(2,10);
        return mkSingle(`n(A) = ${a}, n(B) = ${b} e n(A ∩ B) = ${ab}. Quanto vale n(A ∪ B)?`, a+b-ab, [`n(A ∪ B) = n(A) + n(B) − n(A ∩ B).`, `${a} + ${b} − ${ab} = ${a+b-ab}`]); },
    ],
    dificil:[
      ()=>{ const ab=randInt(5,30), a=ab+randInt(10,50), b=ab+randInt(10,50);
        return mkSingle(`Numa pesquisa, ${a} pessoas gostam de futebol, ${b} de vôlei e ${ab} dos dois. Todo mundo gosta de pelo menos um. Quantas pessoas foram pesquisadas?`, a+b-ab, [`Os ${ab} foram contados duas vezes.`, `${a} + ${b} − ${ab} = ${a+b-ab}`]); },
      ()=>{ const n=randInt(2,7);
        return mkSingle(`Quantos subconjuntos tem um conjunto com ${n} elementos?`, Math.pow(2,n), [`Cada elemento entra ou não entra: 2 possibilidades.`, `2${'⁰¹²³⁴⁵⁶⁷'[n]} = ${Math.pow(2,n)}`]); },
    ],
  },
  espacial:{
    facil:[
      ()=>{ const a=randInt(2,10), b=randInt(2,10), c=randInt(2,10);
        return mkSingle(`Qual é o volume (em cm³) de uma caixa de ${a} cm × ${b} cm × ${c} cm?`, a*b*c, [`Volume = comprimento × largura × altura.`, `${a} × ${b} × ${c} = ${a*b*c} cm³`]); },
    ],
    medio:[
      ()=>{ const r=randInt(1,6), h=randInt(2,10);
        return mkSingle(`Qual é o volume (em cm³) de um cilindro de raio ${r} cm e altura ${h} cm? Use π = 3.`, 3*r*r*h, [`V = π · r² · h.`, `3 × ${r*r} × ${h} = ${3*r*r*h} cm³`]); },
    ],
    dificil:[
      ()=>{ const r=pick([3,6,9]);
        return mkSingle(`Qual é o volume (em cm³) de uma esfera de raio ${r} cm? Use π = 3.`, 4*r*r*r, [`V = (4/3) · π · r³.`, `(4/3) × 3 × ${r*r*r} = 4 × ${r*r*r} = ${4*r*r*r} cm³`]); },
    ],
  },
  combinatoria:{
    facil:[
      ()=>{ const n=pick([3,4]);
        return mkSingle(`Quantos anagramas tem a palavra ${n===3?pick(['SOL','MAR','LUA','CÉU']):pick(['GATO','BOLA','RIMA','PATO'])}?`, n===3?6:24, [`Letras diferentes: ${n}! = ${n===3?'3 × 2 × 1':'4 × 3 × 2 × 1'}.`, `= ${n===3?6:24}`]); },
      ()=>{ const d=pick([2,3]);
        return mkSingle(`Quantas senhas de ${d} dígitos (de 0 a 9, podendo repetir) existem?`, Math.pow(10,d), [`Cada dígito tem 10 opções.`, `${Array(d).fill(10).join(' × ')} = ${Math.pow(10,d)}`]); },
    ],
    dificil:[
      ()=>{ const n=randInt(5,10);
        return mkSingle(`De um grupo de ${n} pessoas, quantas comissões de 3 pessoas podem ser formadas?`, n*(n-1)*(n-2)/6, [`C(${n}, 3) = ${n} × ${n-1} × ${n-2} ÷ 3!`, `= ${n*(n-1)*(n-2)} ÷ 6 = ${n*(n-1)*(n-2)/6}`]); },
      ()=>{ const [w,v]=pick([['ARARA',10],['BANANA',60],['OSSO',6],['CASA',12],['ARROZ',60]]);
        return mkSingle(`Quantos anagramas tem a palavra ${w}?`, v, [`Permutação com letras repetidas: divida pelos fatoriais das repetições.`, `= ${v}`]); },
    ],
  },
  functrig:{
    dificil:[
      ()=>{ const k=pick([2,3,4,6]);
        return mkSingle(`Qual é o período, em graus, de f(x) = sen(${k}x)?`, 360/k, [`O período de sen(kx) é 360° ÷ k.`, `360 ÷ ${k} = ${360/k}°`]); },
      ()=>{ const a=randInt(2,8), b=randInt(1,a);
        return mkSingle(`f(x) = ${a} + ${b}·cos x. Qual é o valor mínimo de f?`, a-b, [`cos x varia de −1 a 1.`, `Mínimo: ${a} + ${b} × (−1) = ${a-b}`]); },
    ],
  },
  espacial2:{
    medio:[
      ()=>{ const a=randInt(2,10);
        return mkSingle(`Um cubo tem volume ${a*a*a} cm³. Quanto mede a aresta? (em cm)`, a, [`V = a³ → a = ∛${a*a*a}.`, `a = ${a} cm`]); },
      ()=>{ const r=randInt(1,6), h=randInt(2,10);
        return mkSingle(`Qual é a área lateral (em cm²) de um cilindro de raio ${r} cm e altura ${h} cm? Use π = 3.`, 2*3*r*h, [`Área lateral = 2 · π · r · h.`, `2 × 3 × ${r} × ${h} = ${6*r*h} cm²`]); },
    ],
  },
});

/* O Desafio do Dia recria as perguntas pela semente (data) pra mostrar a correção.
   Pros dias anteriores aos tipos novos, a geração tem que ser igual à antiga: com
   MQ_DESLIGADO = true os geradores usam só o tipo antigo (sem gastar sorteio). */
const MQ_DESDE = '2026-11-08';
let MQ_DESLIGADO = false;

/* liga os tipos novos aos geradores de cada assunto */
SUBJECTS.forEach(s=>{
  const extra = MAIS_QUESTOES[s.id];
  if(!extra || !s.gen) return;
  ['facil','medio','dificil'].forEach(lv=>{
    const list = extra[lv], base = s.gen[lv];
    if(!list || !list.length || !base) return;
    s.gen[lv] = ()=>{
      if(MQ_DESLIGADO) return base();
      const k = randInt(0, list.length); // 0..n: o último é o gerador antigo
      if(k === list.length) return base();
      try{ return list[k](); }catch(e){ return base(); }
    };
  });
});
