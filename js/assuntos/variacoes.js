/* =========================================================
   MAIS VARIEDADE DE QUESTÕES
   Modelos extras para cada assunto (problemas do dia a dia, "qual número falta",
   aplicações). O gerador de cada dificuldade passa a sortear entre o modelo
   original e os extras daqui, então as questões mudam de formato, não só de número.
   Pra acrescentar: coloque mais funções na lista do assunto/dificuldade.
   ========================================================= */
const VAR_NOMES = ['Ana','Pedro','Júlia','Lucas','Marina','Rafael','Beatriz','Gabriel','Sofia','Davi','Laura','Miguel'];
const vNome = ()=> pick(VAR_NOMES);
const vS = (q, a, steps)=> mkSingle(q, a, steps);
const vMoney = v=> 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});

const SUBJECT_VARIATIONS = {
  adicao:{
    facil:[()=>{ const n=vNome(), a=randInt(5,60), b=randInt(5,40);
      return vS(`${n} tinha ${a} figurinhas e ganhou mais ${b}. Com quantas figurinhas ${n} ficou?`, a+b, [`"Ganhou mais" é juntar: ${a} + ${b}`, ...addColumnSteps([a,b]).steps]); }],
    medio:[()=>{ const a=randInt(20,300), b=a+randInt(15,400);
      return vS(`Qual número somado a ${a} dá ${b}?`, b-a, [`Faça o caminho de volta: o número que falta é ${b} − ${a}`, ...subColumnSteps(b,a).steps, `Conferindo: ${a} + ${b-a} = ${b} ✓`]); }],
    dificil:[()=>{ const t=[randInt(22,38),randInt(22,38),randInt(22,38)], p=randInt(6,15);
      return vS(`Uma escola tem 3 turmas com ${t[0]}, ${t[1]} e ${t[2]} alunos, e ${p} professores. Quantas pessoas são ao todo?`, t[0]+t[1]+t[2]+p, [`Some tudo: ${t.join(' + ')} + ${p}`, ...addColumnSteps([...t,p]).steps]); }],
  },
  subtracao:{
    facil:[()=>{ const n=vNome(), a=randInt(15,60), b=randInt(3,a-2);
      return vS(`${n} tinha ${a} balas e deu ${b} para os amigos. Quantas balas sobraram?`, a-b, [`"Deu" é tirar: ${a} − ${b}`, ...subColumnSteps(a,b).steps]); }],
    medio:[()=>{ const y=randInt(1950,2015);
      return vS(`Uma pessoa nasceu em ${y}. Quantos anos ela completa em 2026?`, 2026-y, [`Idade = ano atual − ano em que nasceu: 2026 − ${y}`, ...subColumnSteps(2026,y).steps]); }],
    dificil:[()=>{ const a=randInt(300,2000), r=randInt(40,a-50);
      return vS(`Qual número, tirado de ${a}, deixa ${r}?`, a-r, [`${a} − ? = ${r} → o número é ${a} − ${r}`, ...subColumnSteps(a,r).steps, `Conferindo: ${a} − ${a-r} = ${r} ✓`]); }],
  },
  multiplicacao:{
    facil:[()=>{ const c=pick([6,10,12]), k=randInt(2,9);
      return vS(`Uma caixa tem ${c} ovos. Quantos ovos há em ${k} caixas?`, c*k, [`${k} caixas com ${c} ovos cada: ${k} × ${c}`, `${k} × ${c} = ${c*k}`]); }],
    medio:[()=>{ const r=randInt(8,25), c=randInt(3,9);
      return vS(`Um cinema tem ${r} fileiras com ${c} cadeiras em cada uma. Quantas cadeiras há no total?`, r*c, [`Fileiras × cadeiras por fileira: ${r} × ${c}`, ...mulSingleDigitSteps(r,c).steps]); }],
    dificil:[()=>{ const n=randInt(12,45), p=randInt(12,39);
      return vS(`Uma escola comprou ${n} livros de R$ ${p} cada. Quanto gastou, em reais?`, n*p, [`Total = quantidade × preço: ${n} × ${p}`, ...mulLongSteps(n,p).steps]); }],
  },
  divisao:{
    facil:[()=>{ const k=randInt(2,8), q=randInt(3,12);
      return vS(`${k*q} balas vão ser divididas igualmente entre ${k} amigos. Quantas balas cada um recebe?`, q, [`Dividir igualmente: ${k*q} ÷ ${k}`, `${k} × ${q} = ${k*q}, então ${k*q} ÷ ${k} = ${q}`]); }],
    medio:[()=>{ const cap=pick([40,45,50]), N=randInt(90,400);
      const q=Math.floor(N/cap), r=N%cap, ans=r?q+1:q;
      return vS(`Uma escola vai levar ${N} alunos a um passeio em ônibus de ${cap} lugares. Quantos ônibus, no mínimo, são necessários?`, ans, [`${N} ÷ ${cap} = ${q}${r?` e sobram ${r} alunos`:' exato'}`, r ? `Os ${r} alunos que sobram também precisam ir: mais 1 ônibus → ${q} + 1 = ${ans}` : `Cabem certinho em ${ans} ônibus.`]); }],
    dificil:[()=>{ const d=randInt(6,15), q=randInt(10,60), r=randInt(1,d-1), N=d*q+r;
      return vS(`Qual é o resto da divisão de ${N} por ${d}?`, r, [`Maior múltiplo de ${d} que cabe em ${N}: ${d} × ${q} = ${d*q}`, `Resto: ${N} − ${d*q} = ${r} (sempre menor que ${d})`]); }],
  },
  dinheiro:{
    facil:[()=>{ const r=randInt(1,9);
      return vS(`Quantas moedas de 25 centavos são necessárias para formar R$ ${r},00?`, r*4, [`R$ 1,00 = 4 moedas de 25 centavos (4 × 25 = 100 centavos)`, `${r} × 4 = ${r*4} moedas`]); }],
    medio:[()=>{ const a=randInt(3,15)+pick([0,0.25,0.5,0.75]), n=randInt(3,8);
      return vS(`${vNome()} guarda ${vMoney(a)} por semana. Quanto terá juntado depois de ${n} semanas (em reais)?`, Math.round(a*n*100)/100, [`${n} semanas de ${vMoney(a)}: ${n} × ${fmt(a)}`, `Em centavos: ${n} × ${Math.round(a*100)} = ${Math.round(a*n*100)} centavos`, `= ${vMoney(a*n)}`]); }],
    dificil:[()=>{ const p=randInt(4,25)+pick([0,0.5,0.9]), k=pick([2,3]);
      return vS(`Uma loja faz a promoção "leve 3, pague 2". Cada produto custa ${vMoney(p)}. Quanto custam ${3*k} produtos na promoção (em reais)?`, Math.round(2*k*p*100)/100, [`A cada 3 produtos, paga só 2. Em ${3*k} produtos há ${k} grupos de 3.`, `Paga ${k} × 2 = ${2*k} produtos`, `${2*k} × ${fmt(p)} = ${vMoney(2*k*p)}`]); }],
  },
  fracoes:{
    facil:[()=>{ const k=pick([2,3,4,5]), N=k*randInt(2,12);
      return vS(`Quanto é 1/${k} de ${N}?`, N/k, [`1/${k} de um número é dividir em ${k} partes iguais e pegar 1`, `${N} ÷ ${k} = ${N/k}`]); }],
    medio:[()=>{ const b=pick([3,4,5,6,8]), a=randInt(2,b-1), N=b*randInt(2,10);
      return vS(`Quanto é ${a}/${b} de ${N}?`, N/b*a, [`Divida em ${b} partes: ${N} ÷ ${b} = ${N/b}`, `Pegue ${a} partes: ${N/b} × ${a} = ${N/b*a}`]); }],
    dificil:[()=>{ const [a,b] = pick([[2,3],[3,4],[2,5],[3,5],[4,5],[2,4],[3,6]]); const [c,d] = pick([[1,3],[1,4],[1,6],[1,8],[1,5]]);
      const m=lcm(b,d), n1=a*m/b, n2=c*m/d; if(n1+n2>=m) return SUBJECT_VARIATIONS.fracoes.dificil[0]();
      return mkFrac(`${vNome()} comeu ${c}/${d} de uma pizza e o irmão comeu ${a}/${b}. Que fração da pizza sobrou?`, m-n1-n2, m, [`A pizza inteira é 1. Primeiro some o que comeram: ${c}/${d} + ${a}/${b}`, `MMC(${d}, ${b}) = ${m}: ${c}/${d} = ${n2}/${m} e ${a}/${b} = ${n1}/${m}`, `Comeram ${n1+n2}/${m}. Sobrou 1 − ${n1+n2}/${m} = ${m}/${m} − ${n1+n2}/${m} = ${m-n1-n2}/${m}${gcd(m-n1-n2,m)>1?` = ${fracStr(m-n1-n2,m)}`:''}`]); }],
  },
  decimais:{
    facil:[()=>{ const v=randInt(11,999)/100, p=pick([10,100,1000]);
      return vS(`Quanto é ${fmt(v)} × ${p}?`, Math.round(v*p*100)/100, [`Multiplicar por ${p} é andar com a vírgula ${String(p).length-1} casa${p>10?'s':''} para a direita.`, `${fmt(v)} × ${p} = ${fmt(v*p)}`]); }],
    medio:[()=>{ const vi=randInt(1000,99999), v=vi/1000; // em milésimos, pra não ter erro de arredondamento
      const third=Math.floor(vi/10)%10, r=(Math.floor(vi/100) + (third>=5?1:0))/10;
      return vS(`Arredonde ${fmt4(v)} para uma casa decimal (décimos).`, r, [`Olhe a 2ª casa depois da vírgula (centésimos): ${third}.`, third>=5 ? `É 5 ou mais: a casa dos décimos sobe 1.` : `É menor que 5: a casa dos décimos fica igual.`, `${fmt4(v)} ≈ ${fmt(r)}`]); }],
    dificil:[()=>{ const n=pick([2,3,4,5,8]), each=randInt(250,2500)/100*1, tot=Math.round(each*n*100)/100;
      return vS(`Uma conta de ${vMoney(tot)} vai ser dividida igualmente entre ${n} amigos. Quanto cada um paga (em reais)?`, Math.round(tot/n*100)/100, [`${fmt(tot)} ÷ ${n}`, `Em centavos: ${Math.round(tot*100)} ÷ ${n} = ${Math.round(tot*100/n)} centavos`, `Cada um paga ${vMoney(tot/n)}`]); }],
  },
  porcentagem:{
    facil:[()=>{ const N=pick([20,25,30,40,50]), p=pick([10,20,40,50,60,80]);
      return vS(`Numa turma de ${N} alunos, ${p}% são meninas. Quantas meninas há na turma?`, N*p/100, [`${p}% de ${N} = ${N} × ${p} ÷ 100`, `${N} × ${p} = ${N*p}; ÷ 100 = ${N*p/100}`]); }],
    medio:[()=>{ const P=pick([50,80,120,150,200,250,400]), p=pick([5,10,15,20,25,30]), D=P*p/100;
      return vS(`Um produto de R$ ${P} foi vendido com R$ ${fmt(D)} de desconto. Qual foi a porcentagem de desconto?`, p, [`Porcentagem = parte ÷ total × 100`, `${fmt(D)} ÷ ${P} = ${fmt(D/P)}`, `${fmt(D/P)} × 100 = ${p}%`]); }],
    dificil:[()=>{ const P=pick([80,100,120,150,200,250,300,400]), p=pick([10,20,25,50]), X=P*(1+p/100);
      return vS(`Depois de um aumento de ${p}%, um produto passou a custar R$ ${fmt(X)}. Qual era o preço antes do aumento?`, P, [`Aumentar ${p}% é multiplicar por ${fmt(1+p/100)}: preço antigo × ${fmt(1+p/100)} = ${fmt(X)}`, `Faça o caminho de volta, dividindo: ${fmt(X)} ÷ ${fmt(1+p/100)} = ${P}`, `Conferindo: ${p}% de ${P} = ${fmt(P*p/100)}; ${P} + ${fmt(P*p/100)} = ${fmt(X)} ✓`]); }],
  },
  geometria:{
    facil:[()=>{ const a=randInt(3,15), b=randInt(3,15), c=randInt(Math.abs(a-b)+1, a+b-1);
      return vS(`Um triângulo tem lados de ${a} cm, ${b} cm e ${c} cm. Qual é o perímetro (em cm)?`, a+b+c, [`Perímetro = soma de todos os lados`, `${a} + ${b} + ${c} = ${a+b+c} cm`]); }],
    medio:[()=>{ const a=randInt(2,8), b=randInt(2,6);
      return vS(`Uma sala retangular mede ${a} m por ${b} m. Quantos pisos quadrados de 50 cm de lado são necessários para cobrir o chão?`, (a*2)*(b*2), [`50 cm = 0,5 m: em cada metro cabem 2 pisos.`, `No comprimento: ${a} × 2 = ${a*2} pisos; na largura: ${b} × 2 = ${b*2} pisos`, `Total: ${a*2} × ${b*2} = ${a*b*4} pisos`]); }],
    dificil:[()=>{ const b=randInt(4,15), h=randInt(2,12), P=2*(b+h);
      return vS(`Um retângulo tem perímetro de ${P} cm e base de ${b} cm. Qual é a sua área (em cm²)?`, b*h, [`Perímetro = 2 × (base + altura) → base + altura = ${P} ÷ 2 = ${P/2}`, `Altura = ${P/2} − ${b} = ${h} cm`, `Área = ${b} × ${h} = ${b*h} cm²`]); }],
  },
  mmcmdc:{
    facil:[()=>{ const a=randInt(2,9), b=randInt(2,9);
      return vS(`Qual é o menor número maior que zero que é múltiplo de ${a} e de ${b} ao mesmo tempo?`, lcm(a,b), [`É o MMC(${a}, ${b}).`, ...mmcSteps(a,b)]); }],
    medio:[()=>{ const g=randInt(2,9), a=g*randInt(2,7), b=g*randInt(2,7); if(a===b) return SUBJECT_VARIATIONS.mmcmdc.medio[0]();
      return vS(`Duas fitas medem ${a} cm e ${b} cm. Quero cortá-las em pedaços todos do mesmo tamanho, o maior possível, sem sobrar nada. Qual é o tamanho de cada pedaço (em cm)?`, gcd(a,b), [`O tamanho tem que dividir ${a} e ${b}, e ser o maior possível: é o MDC.`, ...mdcSteps(a,b)]); }],
    dificil:[()=>{ const [a,b,c] = pick([[2,3,4],[3,4,6],[4,6,8],[2,5,6],[3,5,6],[4,5,6],[6,8,12]]); const m=lcm(lcm(a,b),c);
      return vS(`Qual é o MMC de ${a}, ${b} e ${c}?`, m, [`MMC é o menor número que está na tabuada dos três.`, `MMC(${a}, ${b}) = ${lcm(a,b)}`, `MMC(${lcm(a,b)}, ${c}) = ${m}`, `Confira: ${m} ÷ ${a} = ${m/a}, ${m} ÷ ${b} = ${m/b}, ${m} ÷ ${c} = ${m/c}`]); }],
  },
  potenciacao:{
    facil:[()=>{ const n=randInt(2,6);
      return vS(`Quanto é 10${supTxt(n)}?`, 10**n, [`10${supTxt(n)} é o 1 seguido de ${n} zeros.`, `10${supTxt(n)} = ${(10**n).toLocaleString('pt-BR')}`]); }],
    medio:[()=>{ const b=pick([2,3,5]), x=randInt(2, b===2?8:4);
      return vS(`Qual é o valor de x em ${b}ˣ = ${b**x}?`, x, [`Pergunte: quantas vezes multiplico o ${b} por ele mesmo pra chegar em ${b**x}?`, Array.from({length:x},(_,i)=>`${b}${supTxt(i+1)} = ${b**(i+1)}`).join(' · '), `x = ${x}`]); }],
    dificil:[()=>{ const a=pick([2,3,5,7]), m=randInt(2,9), n=randInt(2,9), mult=Math.random()<0.5;
      return mult ? vS(`Escrevendo ${a}${supTxt(m)} · ${a}${supTxt(n)} como uma só potência de ${a}, qual é o expoente?`, m+n, [`Multiplicação de mesma base: conserva a base e SOMA os expoentes.`, `${m} + ${n} = ${m+n} → ${a}${supTxt(m+n)}`])
                  : vS(`Escrevendo (${a}${supTxt(m)})${supTxt(n)} como uma só potência de ${a}, qual é o expoente?`, m*n, [`Potência de potência: conserva a base e MULTIPLICA os expoentes.`, `${m} × ${n} = ${m*n} → ${a}${supTxt(m*n)}`]); }],
  },
  expressoes:{
    facil:[()=>{ const a=randInt(2,9), b=randInt(5,15), c=randInt(1,b-1);
      return vS(`${a} × (${b} − ${c}) = ?`, a*(b-c), [`Primeiro o parênteses: ${b} − ${c} = ${b-c}`, `Depois a multiplicação: ${a} × ${b-c} = ${a*(b-c)}`]); }],
    medio:[()=>{ const a=randInt(2,20), b=randInt(2,9), c=randInt(2,9), e=randInt(2,6), d=e*randInt(1,8);
      const r=a+b*c-d/e;
      return vS(`${a} + ${b} × ${c} − ${d} ÷ ${e} = ?`, r, [`Ordem: × e ÷ antes de + e −.`, `${b} × ${c} = ${b*c} e ${d} ÷ ${e} = ${d/e}`, `Agora da esquerda pra direita: ${a} + ${b*c} = ${a+b*c}; ${a+b*c} − ${d/e} = ${r}`]); }],
    dificil:[()=>{ let a,b,c,d,e,in1,tot; do{ a=randInt(2,20); b=randInt(5,15); c=randInt(1,b-1); d=randInt(2,6); e=randInt(2,9); in1=a+(b-c)*d; tot=in1; }while(tot%e!==0);
      return vS(`[${a} + (${b} − ${c}) × ${d}] ÷ ${e} = ?`, tot/e, [`De dentro para fora: primeiro o ( ): ${b} − ${c} = ${b-c}`, `Dentro do [ ], a multiplicação antes da soma: ${b-c} × ${d} = ${(b-c)*d}; ${a} + ${(b-c)*d} = ${in1}`, `Por último a divisão: ${in1} ÷ ${e} = ${tot/e}`]); }],
  },
  estatistica:{
    facil:[()=>{ const v=Array.from({length:5},()=>randInt(1,30)), s=[...v].sort((x,y)=>x-y);
      return vS(`Qual é a mediana de ${v.join(', ')}?`, s[2], [`Coloque em ordem: ${s.join(', ')}`, `São 5 números: a mediana é o do meio (o 3º).`, `Mediana = ${s[2]}`]); }],
    medio:[()=>{ const M=randInt(5,20), a=randInt(1,M*2-1), b=randInt(1,M*2-1), c=3*M-a-b; if(c<=0) return SUBJECT_VARIATIONS.estatistica.medio[0]();
      return vS(`A média de três números é ${M}. Dois deles são ${a} e ${b}. Qual é o terceiro?`, c, [`Média ${M} com 3 números → a soma é ${M} × 3 = ${3*M}`, `Já temos ${a} + ${b} = ${a+b}`, `Falta: ${3*M} − ${a+b} = ${c}`]); }],
    dificil:[()=>{ const p1=pick([1,2,3]), p2=pick([1,2,3]), n1=randInt(4,10), n2=randInt(4,10); const tot=p1*n1+p2*n2, m=tot/(p1+p2);
      return vS(`Numa escola, a prova vale peso ${p1} e o trabalho peso ${p2}. ${vNome()} tirou ${n1} na prova e ${n2} no trabalho. Qual é a média ponderada?`, Math.round(m*100)/100, [`Média ponderada: multiplique cada nota pelo peso, some e divida pela soma dos pesos.`, `${n1} × ${p1} + ${n2} × ${p2} = ${p1*n1} + ${p2*n2} = ${tot}`, `Soma dos pesos: ${p1} + ${p2} = ${p1+p2}`, `${tot} ÷ ${p1+p2} = ${fmt(m)}`]); }],
  },
  regra3:{
    facil:[()=>{ const o=randInt(2,4), b=randInt(1,3), k=randInt(2,5);
      return vS(`Uma receita usa ${o} ovos para fazer ${b} bolo${b>1?'s':''}. Quantos ovos são necessários para ${b*k} bolos?`, o*k, [`Mais bolos → mais ovos: direta.`, `${b*k} bolos é ${k} vezes ${b}: ${o} × ${k} = ${o*k} ovos`]); }],
    medio:[()=>{ const km=randInt(8,15), L=randInt(5,40);
      return vS(`Um carro faz ${km} km com 1 litro de gasolina. Quantos litros ele gasta para andar ${km*L} km?`, L, [`Cada litro dá ${km} km: divida a distância por ${km}`, `${km*L} ÷ ${km} = ${L} litros`]); }],
    dificil:[()=>{ let v1,t1,v2; do{ v1=pick([40,50,60,80,90,100]); t1=randInt(2,6); v2=pick([40,50,60,80,100,120]); }while(v1===v2 || (v1*t1)%v2!==0);
      return vS(`A ${v1} km/h, uma viagem leva ${t1} horas. Quanto tempo leva a ${v2} km/h (em horas)?`, v1*t1/v2, [`${v2>v1?'Mais':'Menos'} velocidade → ${v2>v1?'menos':'mais'} tempo: inversa.`, `A distância não muda: ${v1} × ${t1} = ${v1*t1} km`, `Tempo = ${v1*t1} ÷ ${v2} = ${fmt(v1*t1/v2)} h`]); }],
  },
  eq1:{
    facil:[()=>{ const x=randInt(2,20), b=randInt(1,15);
      return vS(`O dobro de um número mais ${b} é igual a ${2*x+b}. Qual é esse número?`, x, [`Chame o número de x: 2x + ${b} = ${2*x+b}`, `2x = ${2*x+b} − ${b} = ${2*x}`, `x = ${2*x} ÷ 2 = ${x}`]); }],
    medio:[()=>{ const x=randInt(2,15), a=randInt(3,7), b=randInt(1,20);
      return vS(`Pensei num número, multipliquei por ${a} e subtraí ${b}. Deu ${a*x-b}. Em que número pensei?`, x, [`Equação: ${a}x − ${b} = ${a*x-b}`, `Desfaça de trás pra frente: some ${b} → ${a}x = ${a*x}`, `Divida por ${a} → x = ${x}`]); }],
    dificil:[()=>{ const x=randInt(-6,10), a=randInt(2,6), b=randInt(1,9);
      return vS(`Resolva: ${a}(x + ${b}) = ${nm(a*(x+b))}`, x, [`Distributiva: ${a}x + ${a*b} = ${nm(a*(x+b))}`, `${a}x = ${nm(a*(x+b))} − ${a*b} = ${nm(a*x)}`, `x = ${nm(a*x)} ÷ ${a} = ${nm(x)}`, `Atalho: dividir os dois lados por ${a} → x + ${b} = ${nm(x+b)} → x = ${nm(x)}`]); }],
  },
  sistemas:{
    facil:[()=>{ const a=randInt(10,40), b=randInt(1,a-1);
      return vS(`A soma de dois números é ${a+b} e a diferença entre eles é ${a-b}. Qual é o maior?`, a, [`x + y = ${a+b} e x − y = ${a-b}`, `Somando as duas: 2x = ${2*a} → x = ${a}`, `(O menor é ${a+b} − ${a} = ${b})`]); }],
    medio:[()=>{ const c=randInt(5,30), m=randInt(3,20);
      return vS(`Num estacionamento há carros e motos, ${c+m} veículos ao todo e ${4*c+2*m} rodas. Quantas motos há?`, m, [`Se todos fossem motos: ${c+m} × 2 = ${2*(c+m)} rodas.`, `Sobram ${4*c+2*m} − ${2*(c+m)} = ${2*c} rodas: cada carro tem 2 rodas a mais que uma moto → ${2*c} ÷ 2 = ${c} carros`, `Motos: ${c+m} − ${c} = ${m}`]); }],
    dificil:[()=>{ const p=pick([20,30,40,50,60]), i=randInt(10,80), mh=randInt(10,80), X=i*p+mh*p/2;
      return vS(`Um show vendeu ${i+mh} ingressos: inteira a R$ ${p} e meia-entrada a R$ ${p/2}. Arrecadou R$ ${X}. Quantas inteiras foram vendidas?`, i, [`Chame inteiras de x e meias de y: x + y = ${i+mh} e ${p}x + ${p/2}y = ${X}`, `Se todos pagassem meia: ${i+mh} × ${p/2} = ${(i+mh)*p/2}`, `A diferença ${X} − ${(i+mh)*p/2} = ${X-(i+mh)*p/2} vem das inteiras, que pagam R$ ${p/2} a mais cada`, `x = ${X-(i+mh)*p/2} ÷ ${p/2} = ${i}`]); }],
  },
  eq2:{
    facil:[()=>{ const r=randInt(2,12);
      return mkPair(`Resolva: x² = ${r*r}`, r, -r, [`Que números, ao quadrado, dão ${r*r}?`, `${r} × ${r} = ${r*r} e (−${r}) × (−${r}) = ${r*r}`, `x = ${r} ou x = −${r}`]); }],
    medio:[()=>{ const n=randInt(3,20);
      return vS(`O produto de dois números inteiros positivos consecutivos é ${n*(n+1)}. Qual é o menor deles?`, n, [`Números consecutivos: x e x + 1 → x(x + 1) = ${n*(n+1)}`, `x² + x − ${n*(n+1)} = 0`, ...bhaskaraSteps(1,1,-n*(n+1)).slice(1,4), `Como é positivo: x = ${n} (e o outro é ${n+1})`]); }],
    dificil:[()=>{ const x=randInt(2,12), k=randInt(1,6);
      return vS(`Um retângulo tem lados x e x + ${k} (em metros) e área de ${x*(x+k)} m². Quanto vale x?`, x, [`Área: x(x + ${k}) = ${x*(x+k)} → x² + ${k}x − ${x*(x+k)} = 0`, ...bhaskaraSteps(1,k,-x*(x+k)).slice(1,5), `Medida não pode ser negativa: x = ${x} m`]); }],
  },
  func1grau:{
    facil:[()=>{ const b=pick([4,5,6]), c=randInt(2,4), d=randInt(3,20);
      return vS(`Um táxi cobra R$ ${b} fixos mais R$ ${c} por km. Quanto custa uma corrida de ${d} km, em reais?`, b+c*d, [`Função: f(x) = ${c}x + ${b}`, `f(${d}) = ${c} × ${d} + ${b} = ${c*d} + ${b} = ${b+c*d}`]); }],
    medio:[()=>{ const a=randInt(2,7), b=randInt(-10,10), x=randInt(-5,10), y=a*x+b;
      return vS(`Dada f(x) = ${a}x ${b>=0?'+':'−'} ${Math.abs(b)}, para qual valor de x temos f(x) = ${nm(y)}?`, x, [`${a}x ${b>=0?'+':'−'} ${Math.abs(b)} = ${nm(y)}`, `${a}x = ${nm(y)} ${b>=0?'−':'+'} ${Math.abs(b)} = ${nm(y-b)}`, `x = ${nm(y-b)} ÷ ${a} = ${nm(x)}`]); }],
    dificil:[()=>{ const a=randInt(-5,6)||2, x1=randInt(-5,3), x2=x1+randInt(1,5), b=randInt(-8,8), y1=a*x1+b, y2=a*x2+b;
      return vS(`Uma reta passa pelos pontos (${nm(x1)}, ${nm(y1)}) e (${nm(x2)}, ${nm(y2)}). Qual é o coeficiente angular dela?`, a, [`a = (variação de y) ÷ (variação de x)`, `Δy = ${nm(y2)} − ${np(y1)} = ${nm(y2-y1)} e Δx = ${nm(x2)} − ${np(x1)} = ${x2-x1}`, `a = ${nm(y2-y1)} ÷ ${x2-x1} = ${nm(a)}`]); }],
  },
  conjuntos:{
    facil:[()=>{ const a=randInt(1,20)*2, b=a+randInt(5,30)*2;
      return vS(`Quantos números pares existem de ${a} até ${b}, contando os dois?`, (b-a)/2+1, [`Os pares andam de 2 em 2: (último − primeiro) ÷ 2 + 1`, `(${b} − ${a}) ÷ 2 + 1 = ${(b-a)/2} + 1 = ${(b-a)/2+1}`]); }],
    medio:[()=>{ const both=randInt(3,12), f=both+randInt(5,20), v=both+randInt(5,20);
      return vS(`Numa turma, ${f} alunos gostam de futebol, ${v} gostam de vôlei e ${both} gostam dos dois. Quantos gostam de pelo menos um dos esportes?`, f+v-both, [`Somando ${f} + ${v}, quem gosta dos dois foi contado duas vezes.`, `Tire uma vez: ${f} + ${v} − ${both} = ${f+v-both}`]); }],
    dificil:[()=>{ const both=randInt(3,10), f=both+randInt(5,15), v=both+randInt(5,15), none=randInt(2,10), T=f+v-both+none;
      return vS(`Numa pesquisa com ${T} pessoas, ${f} leem jornal, ${v} leem revista e ${both} leem os dois. Quantas não leem nenhum dos dois?`, none, [`Leem pelo menos um: ${f} + ${v} − ${both} = ${f+v-both}`, `Nenhum: ${T} − ${f+v-both} = ${none}`]); }],
  },
  funcquad:{
    facil:[()=>{ const r1=randInt(-6,6), r2=randInt(-6,6), S=r1+r2, P=r1*r2;
      return vS(`Qual é a soma das raízes de ${quadStr(1,-S,P)} = 0?`, S, [`Em x² + bx + c = 0, a soma das raízes é −b ÷ a.`, `b = ${nm(-S)} → soma = ${nm(S)}`, `(As raízes são ${nm(r1)} e ${nm(r2)}: ${nm(r1)} + ${np(r2)} = ${nm(S)} ✓)`]); }],
    medio:[()=>{ const v=pick([10,20,30,40]);
      return vS(`Uma bola é lançada para cima e sua altura (em metros) após t segundos é h(t) = −5t² + ${v}t. Qual é a altura máxima?`, v*v/20, [`A altura máxima é no vértice: t = −b ÷ 2a = ${v} ÷ 10 = ${v/10} s`, `h(${v/10}) = −5 × ${fmt((v/10)**2)} + ${v} × ${v/10} = ${nm(-5*(v/10)**2)} + ${v*v/10} = ${v*v/20} m`]); }],
    dificil:[()=>{ const r=randInt(1,9);
      return vS(`Para qual valor positivo de k a equação x² + kx + ${r*r} = 0 tem duas raízes iguais?`, 2*r, [`Raízes iguais quando Δ = 0: k² − 4 × 1 × ${r*r} = 0`, `k² = ${4*r*r} → k = ${2*r} (positivo)`]); }],
  },
  modular:{
    facil:[()=>{ const a=randInt(-15,15), b=randInt(-15,15);
      return vS(`Qual é a distância entre ${nm(a)} e ${nm(b)} na reta numérica? (calcule |${nm(a)} − ${np(b)}|)`, Math.abs(a-b), [`Distância = |a − b|`, `${nm(a)} − ${np(b)} = ${nm(a-b)} → |${nm(a-b)}| = ${Math.abs(a-b)}`]); }],
    medio:[()=>{ const k=randInt(1,9);
      return vS(`Quantos números inteiros satisfazem |x| ≤ ${k}?`, 2*k+1, [`|x| ≤ ${k} quer dizer −${k} ≤ x ≤ ${k}`, `De −${k} a ${k}: ${k} negativos, o zero e ${k} positivos = ${2*k+1}`]); }],
    dificil:[()=>{ const a=randInt(-8,8), b=randInt(1,9);
      return vS(`Qual é a soma das soluções de |x ${a>=0?'−':'+'} ${Math.abs(a)}| = ${b}?`, 2*a, [`x ${a>=0?'−':'+'} ${Math.abs(a)} = ${b} → x = ${nm(a+b)}`, `x ${a>=0?'−':'+'} ${Math.abs(a)} = −${b} → x = ${nm(a-b)}`, `Soma: ${nm(a+b)} + ${np(a-b)} = ${nm(2*a)}`]); }],
  },
  exponencial:{
    facil:[()=>{ const N=pick([10,50,100,200,500]), h=randInt(2,6);
      return vS(`Uma colônia de bactérias dobra a cada hora. Começando com ${N} bactérias, quantas haverá depois de ${h} horas?`, N*2**h, [`Dobrar ${h} vezes é multiplicar por 2${supTxt(h)} = ${2**h}`, `${N} × ${2**h} = ${(N*2**h).toLocaleString('pt-BR')}`]); }],
    medio:[()=>{ const N=pick([5,10,20,100]), d=randInt(2,5);
      return vS(`Uma população triplica a cada dia. Em quantos dias passa de ${N} para ${(N*3**d).toLocaleString('pt-BR')} indivíduos?`, d, [`N × 3ᵈ = ${N*3**d} → 3ᵈ = ${3**d}`, Array.from({length:d},(_,i)=>`3${supTxt(i+1)} = ${3**(i+1)}`).join(' · '), `d = ${d} dias`]); }],
    dificil:[()=>{ const [b,B,e1] = pick([[4,2,2],[9,3,2],[8,2,3],[27,3,3],[25,5,2]]), k=randInt(1,7);
      return mkFrac(`Resolva: ${b}ˣ = ${B}${supTxt(k)}`, k, e1, [`Escreva ${b} como potência de ${B}: ${b} = ${B}${supTxt(e1)}`, `(${B}${supTxt(e1)})ˣ = ${B}${supTxt(k)} → ${e1}x = ${k}`, `x = ${fracStr(k,e1)}`]); }],
  },
  logaritmo:{
    facil:[()=>{ const n=randInt(1,6);
      return vS(`Quanto vale log ${(10**n).toLocaleString('pt-BR')}? (base 10)`, n, [`log na base 10 pergunta: 10 elevado a quanto dá ${(10**n).toLocaleString('pt-BR')}?`, `10${supTxt(n)} = ${(10**n).toLocaleString('pt-BR')} → log = ${n}`]); }],
    medio:[()=>{ const b=pick([2,3,5]), k=randInt(2, b===2?6:3);
      return vS(`Se log${subTxt(b)} x = ${k}, quanto vale x?`, b**k, [`Pela definição: log${subTxt(b)} x = ${k} quer dizer ${b}${supTxt(k)} = x`, `x = ${b**k}`]); }],
    dificil:[()=>{ const [a,b,c,ans] = pick([[2,3,8,3],[2,5,32,5],[3,2,9,2],[2,7,16,4],[3,5,27,3],[5,2,25,2]]);
      return vS(`Quanto vale log${subTxt(a)} ${b} · log${subTxt(b)} ${c}?`, ans, [`Regra da "cadeia": log${subTxt(a)} ${b} · log${subTxt(b)} ${c} = log${subTxt(a)} ${c} (o ${b} "cancela")`, `log${subTxt(a)} ${c}: ${a} elevado a quanto dá ${c}? ${a}${supTxt(ans)} = ${c}`, `Resultado: ${ans}`]); }],
  },
  functrig:{
    facil:[()=>{ const k=randInt(2,9), fn=pick([['sen 30°',0.5],['cos 60°',0.5],['sen 90°',1],['cos 0°',1]]);
      return vS(`Quanto vale ${k} · ${fn[0]}?`, k*fn[1], [`Tabela: ${fn[0]} = ${fmt(fn[1])}`, `${k} × ${fmt(fn[1])} = ${fmt(k*fn[1])}`]); }],
    medio:[()=>{ const a=randInt(-3,5), b=randInt(1,6)*pick([1,-1]), fn=pick(['sen','cos']);
      return vS(`Qual é a amplitude da função f(x) = ${a?nm(a)+' ':''}${b>0?(a?'+ ':''):'− '}${Math.abs(b)}·${fn} x?`, Math.abs(b), [`Amplitude é o quanto a onda sobe ou desce a partir do meio: |b|`, `${fn} x vai de −1 a 1; multiplicado por ${nm(b)}, vai de −${Math.abs(b)} a ${Math.abs(b)}`, `Amplitude = ${Math.abs(b)}`]); }],
    dificil:[()=>{ const a=randInt(-3,5), b=randInt(1,6);
      return vS(`Quantos números inteiros pertencem à imagem de f(x) = ${a?nm(a)+' + ':''}${b}·cos x?`, 2*b+1, [`cos x vai de −1 a 1 → f vai de ${nm(a-b)} a ${nm(a+b)}`, `Inteiros de ${nm(a-b)} a ${nm(a+b)}: ${nm(a+b)} − ${np(a-b)} + 1 = ${2*b+1}`]); }],
  },
  pa:{
    facil:[()=>{ const d=pick([500,800,1000,1200]), r=pick([100,200,250,300]), n=randInt(4,10);
      return vS(`Uma pessoa caminhou ${d} m no 1º dia e, a cada dia, ${r} m a mais que no dia anterior. Quantos metros caminhou no ${n}º dia?`, d+(n-1)*r, [`É uma PA com a₁ = ${d} e r = ${r}`, `a${subTxt(n)} = ${d} + (${n} − 1) × ${r} = ${d} + ${(n-1)*r} = ${d+(n-1)*r} m`]); }],
    medio:[()=>{ const a=randInt(-10,20), r=randInt(2,7), n=randInt(8,40), an=a+(n-1)*r;
      return vS(`Quantos termos tem a PA (${nm(a)}, ${nm(a+r)}, ${nm(a+2*r)}, …, ${nm(an)})?`, n, [`Razão: ${nm(a+r)} − ${np(a)} = ${r}`, `aₙ = a₁ + (n − 1)·r → ${nm(an)} = ${nm(a)} + (n − 1) × ${r}`, `(n − 1) × ${r} = ${nm(an-a)} → n − 1 = ${n-1} → n = ${n}`]); }],
    dificil:[()=>{ const n=randInt(5,50);
      return vS(`Qual é a soma dos ${n} primeiros números ímpares (1 + 3 + 5 + …)?`, n*n, [`É uma PA: a₁ = 1, r = 2, a${subTxt(n)} = 1 + (${n} − 1) × 2 = ${2*n-1}`, `S = (1 + ${2*n-1}) × ${n} ÷ 2 = ${2*n} × ${n} ÷ 2 = ${n*n}`, `(Curiosidade: a soma dos n primeiros ímpares é sempre n²)`]); }],
  },
  pg:{
    facil:[()=>{ const n=randInt(4,10);
      return vS(`Um cofrinho recebe R$ 1 no 1º dia, R$ 2 no 2º, R$ 4 no 3º, sempre o dobro. Quanto recebe no ${n}º dia (em reais)?`, 2**(n-1), [`PG com a₁ = 1 e q = 2`, `a${subTxt(n)} = 1 × 2${supTxt(n-1)} = ${2**(n-1)}`]); }],
    medio:[()=>{ const a=randInt(1,6), q=pick([2,3,4,5,-2,-3]);
      return vS(`Qual é a razão da PG (${nm(a)}, ${nm(a*q)}, ${nm(a*q*q)}, …)?`, q, [`Razão da PG = termo ÷ anterior`, `${nm(a*q)} ÷ ${np(a)} = ${nm(q)}`, `Confira: ${nm(a*q)} × ${np(q)} = ${nm(a*q*q)} ✓`]); }],
    dificil:[()=>{ const q=pick([2,3,4,5]), a=(q-1)*randInt(1,6)*q;
      return vS(`Qual é a soma infinita da PG (${a}, ${a/q}, ${fmt(a/q/q)}, …)?`, a*q/(q-1), [`PG infinita com |q| < 1: S = a₁ ÷ (1 − q)`, `q = ${a/q} ÷ ${a} = 1/${q}`, `S = ${a} ÷ (1 − 1/${q}) = ${a} ÷ ${q-1}/${q} = ${a} × ${q}/${q-1} = ${fmt(a*q/(q-1))}`]); }],
  },
  espacial:{
    facil:[()=>{ const a=pick([10,20,30]), b=pick([10,20,30,40]), c=pick([10,20,25,50]);
      return vS(`Uma caixa tem ${a} cm × ${b} cm × ${c} cm. Quantos litros cabem nela? (1 L = 1.000 cm³)`, a*b*c/1000, [`V = ${a} × ${b} × ${c} = ${(a*b*c).toLocaleString('pt-BR')} cm³`, `÷ 1.000 = ${fmt(a*b*c/1000)} L`]); }],
    medio:[()=>{ const a=randInt(2,12);
      return vS(`Qual é a área total (em cm²) de um cubo de aresta ${a} cm?`, 6*a*a, [`O cubo tem 6 faces quadradas iguais.`, `Cada face: ${a} × ${a} = ${a*a} cm²`, `Total: 6 × ${a*a} = ${6*a*a} cm²`]); }],
    dificil:[()=>{ const s=pick([2,3]), x=s*randInt(2,6), y=s*randInt(2,5), z=s*randInt(1,4);
      return vS(`Quantos cubinhos de ${s} cm de aresta cabem numa caixa de ${x} cm × ${y} cm × ${z} cm?`, (x/s)*(y/s)*(z/s), [`Em cada direção: ${x} ÷ ${s} = ${x/s}, ${y} ÷ ${s} = ${y/s}, ${z} ÷ ${s} = ${z/s}`, `Total: ${x/s} × ${y/s} × ${z/s} = ${(x/s)*(y/s)*(z/s)} cubinhos`]); }],
  },
  analitica:{
    facil:[()=>{ const x1=randInt(-8,8), y1=randInt(-8,8), x2=x1+2*randInt(-5,5), y2=y1+2*randInt(-5,5);
      return mkXY(`Qual é o ponto médio (x, y) entre A(${nm(x1)}, ${nm(y1)}) e B(${nm(x2)}, ${nm(y2)})?`, (x1+x2)/2, (y1+y2)/2, [`Ponto médio: média dos x e média dos y`, `x = (${nm(x1)} + ${np(x2)}) ÷ 2 = ${nm((x1+x2)/2)}`, `y = (${nm(y1)} + ${np(y2)}) ÷ 2 = ${nm((y1+y2)/2)}`]); }],
    medio:[()=>{ const m=randInt(-4,5)||1, x=randInt(-5,5), n=randInt(-9,9), y=m*x+n;
      return vS(`A reta y = ${nm(m)}x + n passa pelo ponto (${nm(x)}, ${nm(y)}). Quanto vale n?`, n, [`Troque x e y pelo ponto: ${nm(y)} = ${nm(m)} × ${np(x)} + n`, `${nm(y)} = ${nm(m*x)} + n → n = ${nm(y)} − ${np(m*x)} = ${nm(n)}`]); }],
    dificil:[()=>{ const a=randInt(2,12), b=randInt(2,12);
      return vS(`Qual é a área do triângulo com vértices em (0, 0), (${a}, 0) e (0, ${b})?`, a*b/2, [`É um triângulo retângulo com catetos nos eixos: base ${a} e altura ${b}`, `Área = ${a} × ${b} ÷ 2 = ${fmt(a*b/2)}`]); }],
  },
  trigret:{
    facil:[()=>{ const [a,b,c] = pick([[3,4,5],[5,12,13],[8,15,17],[6,8,10]]);
      return mkFrac(`Num triângulo retângulo de catetos ${a} e ${b} e hipotenusa ${c}, quanto vale o seno do ângulo oposto ao cateto ${a}?`, a, c, [`sen = cateto oposto ÷ hipotenusa`, `sen = ${a}/${c}${gcd(a,c)>1?` = ${fracStr(a,c)}`:''}`]); }],
    medio:[()=>{ const L=randInt(2,20)*2;
      return vS(`Uma rampa de ${L} m de comprimento faz um ângulo de 30° com o chão. Qual é a altura que ela alcança (em m)?`, L/2, [`A rampa é a hipotenusa; a altura é o cateto oposto ao 30°`, `sen 30° = altura ÷ ${L} → altura = ${L} × 0,5 = ${L/2} m`]); }],
    dificil:[()=>{ const s=randInt(5,30);
      return vS(`Quando o sol está a 60° acima do horizonte, um prédio faz uma sombra de ${s} m. Qual é a altura aproximada do prédio? (use √3 ≈ 1,73)`, Math.round(s*1.73*100)/100, [`tg 60° = altura ÷ sombra`, `tg 60° = √3 ≈ 1,73`, `altura = ${s} × 1,73 = ${fmt(s*1.73)} m`]); }],
  },
  ciclo:{
    facil:[()=>{ const [g,n,d] = pick([[30,1,6],[45,1,4],[60,1,3],[90,1,2],[120,2,3],[135,3,4],[150,5,6],[270,3,2],[210,7,6]]);
      return mkFrac(`${g}° em radianos é k·π. Quanto vale k? (fração)`, n, d, [`180° = π rad → k = ${g} ÷ 180`, `${g}/180 = ${fracStr(n,d)}`, `${g}° = ${fracStr(n,d)}π rad`]); }],
    medio:[()=>{ const a=randInt(1,359); if(a%90===0) return SUBJECT_VARIATIONS.ciclo.medio[0](); const q=Math.floor(a/90)+1;
      return vS(`Em qual quadrante está o ângulo de ${a}°? (responda 1, 2, 3 ou 4)`, q, [`1º: 0° a 90° · 2º: 90° a 180° · 3º: 180° a 270° · 4º: 270° a 360°`, `${a}° está no ${q}º quadrante`]); }],
    dificil:[()=>{ const [ang,val,txt] = pick([[210,-0.5,'sen 210° = −sen 30°'],[150,0.5,'sen 150° = sen 30°'],[330,-0.5,'sen 330° = −sen 30°'],[240,-0.5,'cos 240° = −cos 60°'],[120,-0.5,'cos 120° = −cos 60°'],[300,0.5,'cos 300° = cos 60°']]);
      const fn = txt.slice(0,3);
      return vS(`Quanto vale ${fn} ${ang}°?`, val, [`Reduza ao 1º quadrante: ${txt}`, `${fn} de 30° ou 60° vale 0,5; o sinal depende do quadrante de ${ang}°`, `Resultado: ${nm(val)}`]); }],
  },
  identidades:{
    facil:[()=>{ const [s,c] = pick([[0.6,0.8],[0.8,0.6],[0.28,0.96],[0.96,0.28]]);
      return vS(`Se sen x = ${fmt(s)} e x está no 1º quadrante, quanto vale cos x?`, c, [`sen²x + cos²x = 1 → cos²x = 1 − ${fmt4(s*s)} = ${fmt4(1-s*s)}`, `cos x = √${fmt4(1-s*s)} = ${fmt(c)} (positivo no 1º quadrante)`]); }],
    medio:[()=>{ const [a,b,c] = pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]);
      return mkFrac(`Se tg x = ${a}/${b} e x está no 1º quadrante, quanto vale sen x? (fração)`, a, c, [`Pense num triângulo com cateto oposto ${a} e adjacente ${b}`, `Hipotenusa: √(${a*a} + ${b*b}) = ${c}`, `sen x = ${a}/${c}`]); }],
    dificil:[()=>{ const [n,d] = pick([[3,5],[4,5],[5,13],[12,13]]);
      return mkFrac(`Se cos x = ${n}/${d}, quanto vale cos 2x? (fração)`, 2*n*n-d*d, d*d, [`cos 2x = 2cos²x − 1`, `= 2 × ${n*n}/${d*d} − 1 = ${2*n*n}/${d*d} − ${d*d}/${d*d}`, `= ${nm(2*n*n-d*d)}/${d*d}`]); }],
  },
  leis:{
    facil:[()=>{ const A=randInt(20,90), B=randInt(20,160-A);
      return vS(`Num triângulo, dois ângulos medem ${A}° e ${B}°. Quanto mede o terceiro (em graus)?`, 180-A-B, [`A soma dos ângulos de um triângulo é 180°`, `180° − ${A}° − ${B}° = ${180-A-B}°`]); }],
    medio:[()=>{ const [b,c,a] = pick([[3,8,7],[5,8,7],[7,15,13],[5,21,19],[8,15,13]]);
      return vS(`Num triângulo, dois lados medem ${b} cm e ${c} cm e formam um ângulo de 60°. Quanto mede o terceiro lado (em cm)?`, a, [`Lei dos cossenos: a² = b² + c² − 2bc · cos 60°`, `cos 60° = 1/2 → a² = ${b*b} + ${c*c} − ${b*c} = ${a*a}`, `a = √${a*a} = ${a} cm`]); }],
    dificil:[()=>{ const a=randInt(2,12), b=randInt(2,12)*2, C=pick([30,150]);
      return vS(`Num triângulo, dois lados medem ${a} cm e ${b} cm e o ângulo entre eles é ${C}°. Qual é a área (em cm²)?`, a*b/4, [`Área = (1/2) · a · b · sen(ângulo entre eles)`, `sen ${C}° = 0,5`, `Área = 0,5 × ${a} × ${b} × 0,5 = ${fmt(a*b/4)} cm²`]); }],
  },
  combinatoria:{
    facil:[()=>{ const n=randInt(3,9);
      return vS(`Usando só os algarismos de 1 a ${n}, quantos números de 2 algarismos diferentes podemos formar?`, n*(n-1), [`1º algarismo: ${n} opções. 2º: ${n-1} (não pode repetir)`, `${n} × ${n-1} = ${n*(n-1)}`]); }],
    medio:[()=>{ const k=randInt(3,4), d=10;
      const r = Array.from({length:k},(_,i)=>d-i).reduce((a,b)=>a*b,1);
      return vS(`Quantas senhas de ${k} dígitos (0 a 9) existem sem repetir nenhum dígito?`, r, [`Cada posição tem uma opção a menos que a anterior: ${Array.from({length:k},(_,i)=>d-i).join(' × ')}`, `= ${r.toLocaleString('pt-BR')}`]); }],
    dificil:[()=>{ const [w,r,txt] = pick([['ARARA',10,'5! ÷ (3! × 2!) — 3 A e 2 R'],['BANANA',60,'6! ÷ (3! × 2!) — 3 A e 2 N'],['CASA',12,'4! ÷ 2! — 2 A'],['PAPAI',30,'5! ÷ (2! × 2!) — 2 P e 2 A'],['MALA',12,'4! ÷ 2! — 2 A'],['ESCOLA',720,'6! — todas diferentes']]);
      return vS(`Quantos anagramas tem a palavra ${w}?`, r, [`Letras repetidas trocadas entre si não mudam a palavra: divida pelos fatoriais das repetições.`, `${txt}`, `= ${r}`]); }],
  },
  probabilidade:{
    facil:[()=>{ const N=pick([10,12,20,30]), k=pick([2,3,4,5]), f=Math.floor(N/k);
      return mkFrac(`Sorteando um número de 1 a ${N}, qual é a probabilidade de ele ser múltiplo de ${k}? (fração)`, f, N, [`Múltiplos de ${k} até ${N}: ${Array.from({length:f},(_,i)=>k*(i+1)).join(', ')} → ${f}`, `P = ${f}/${N}${gcd(f,N)>1?` = ${fracStr(f,N)}`:''}`]); }],
    medio:[()=>{ const S=randInt(3,11), ways=6-Math.abs(7-S);
      return mkFrac(`Jogando dois dados, qual é a probabilidade de a soma ser ${S}? (fração)`, ways, 36, [`Total de resultados: 6 × 6 = 36`, `Pares que somam ${S}: ${Array.from({length:6},(_,i)=>i+1).filter(a=>S-a>=1&&S-a<=6).map(a=>`(${a},${S-a})`).join(' ')} → ${ways}`, `P = ${ways}/36${gcd(ways,36)>1?` = ${fracStr(ways,36)}`:''}`]); }],
    dificil:[()=>{ const a=randInt(2,8), v=randInt(2,8), g=randInt(1,6), t=a+v+g;
      return mkFrac(`Uma urna tem ${a} bolas azuis, ${v} vermelhas e ${g} verdes. Tirando uma ao acaso, qual é a probabilidade de ela NÃO ser azul? (fração)`, v+g, t, [`Jeito 1: não azul = vermelhas + verdes = ${v+g} de ${t}`, `Jeito 2 (complementar): 1 − P(azul) = 1 − ${a}/${t} = ${v+g}/${t}`, `P = ${fracStr(v+g,t)}`]); }],
  },
  dispersao:{
    facil:[()=>{ const v=Array.from({length:4},()=>randInt(2,20)); const s=v.reduce((a,b)=>a+b,0); if(s%4) return SUBJECT_VARIATIONS.dispersao.facil[0]();
      return vS(`Qual é a média dos dados ${v.join(', ')}?`, s/4, [`Some: ${v.join(' + ')} = ${s}`, `Divida por 4: ${s} ÷ 4 = ${s/4}`]); }],
    medio:[()=>{ const sd=randInt(2,9), k=randInt(2,10);
      return vS(`Um conjunto de dados tem desvio padrão ${sd}. Se somarmos ${k} a todos os valores, qual será o novo desvio padrão?`, sd, [`Somar o mesmo número a todos desloca os dados, mas não muda o quanto eles se espalham.`, `O desvio padrão continua ${sd}.`]); }],
    dificil:[()=>{ const sd=randInt(2,9), k=randInt(2,5);
      return vS(`Um conjunto de dados tem desvio padrão ${sd}. Se multiplicarmos todos os valores por ${k}, qual será o novo desvio padrão?`, sd*k, [`Multiplicar todos por ${k} estica as distâncias entre eles ${k} vezes.`, `Novo desvio padrão: ${sd} × ${k} = ${sd*k} (a variância fica × ${k*k})`]); }],
  },
  juros:{
    facil:[()=>{ const C=randInt(2,20)*100, i=randInt(1,5), t=randInt(2,12), J=C*i*t/100;
      return vS(`Um capital de R$ ${C} rendeu R$ ${fmt(J)} de juros simples a ${i}% ao mês. Por quantos meses ficou aplicado?`, t, [`Juros por mês: ${i}% de ${C} = ${fmt(C*i/100)}`, `Meses: ${fmt(J)} ÷ ${fmt(C*i/100)} = ${t}`]); }],
    medio:[()=>{ const C=randInt(2,20)*100, i=randInt(1,8), t=randInt(2,10), J=C*i*t/100;
      return vS(`Um capital de R$ ${C} rendeu R$ ${fmt(J)} de juros simples em ${t} meses. Qual foi a taxa mensal (em %)?`, i, [`Juros por mês: ${fmt(J)} ÷ ${t} = ${fmt(J/t)}`, `Taxa: ${fmt(J/t)} ÷ ${C} = ${fmt(J/t/C)} → ${i}%`]); }],
    dificil:[()=>{ const C=randInt(1,20)*1000, i=pick([10,20]), t=2, M=C*(1+i/100)**t;
      return vS(`Quanto rende de juros (só os juros) um capital de R$ ${C} a juros compostos de ${i}% ao mês, durante ${t} meses?`, Math.round((M-C)*100)/100, [`M = ${C} × ${fmt(1+i/100)}² = ${C} × ${fmt4((1+i/100)**2)} = ${fmt(M)}`, `Juros = M − C = ${fmt(M)} − ${C} = ${fmt(M-C)}`]); }],
  },
  descontos:{
    facil:[()=>{ const P=pick([40,60,80,100,120,150,200]), d=pick([10,20,25,30,50]);
      return vS(`Um produto de R$ ${P} está com ${d}% de desconto. Quantos reais você economiza?`, P*d/100, [`${d}% de ${P} = ${P} × ${d} ÷ 100 = ${fmt(P*d/100)}`]); }],
    medio:[()=>{ const a=pick([10,20,30,40,50]);
      return vS(`Um preço teve aumento de ${a}% e depois desconto de ${a}%. Qual foi a variação final, em %? (use sinal negativo para queda)`, -a*a/100, [`Fatores: ${fmt(1+a/100)} e ${fmt(1-a/100)}`, `${fmt(1+a/100)} × ${fmt(1-a/100)} = ${fmt4((1+a/100)*(1-a/100))}`, `Ficou ${fmt(a*a/100)}% abaixo do original: ${nm(-a*a/100)}%`]); }],
    dificil:[()=>{ const P=pick([80,100,120,150,200,250,400]), d=pick([5,10,15,20,25,30,40]), Y=P*(1-d/100);
      return vS(`Um produto passou de R$ ${P} para R$ ${fmt(Y)}. De quantos por cento foi o desconto?`, d, [`Desconto em reais: ${P} − ${fmt(Y)} = ${fmt(P-Y)}`, `Em %: ${fmt(P-Y)} ÷ ${P} = ${fmt(d/100)} → ${d}%`]); }],
  },
  inflacao:{
    facil:[()=>{ const A=pick([100,200,250,400,500]), p=pick([2,4,5,8,10,12]), B=A*(1+p/100);
      return vS(`Um produto passou de R$ ${A} para R$ ${fmt(B)} em um ano. Qual foi a inflação desse produto (em %)?`, p, [`Aumento: ${fmt(B)} − ${A} = ${fmt(B-A)}`, `${fmt(B-A)} ÷ ${A} = ${fmt(p/100)} → ${p}%`]); }],
    medio:[()=>{ const p=pick([25,100]), v=100/(1+p/100);
      return vS(`Com uma inflação de ${p}%, R$ 100 hoje compram o que antes custava quantos reais?`, v, [`O que custava R$ X agora custa X × ${fmt(1+p/100)}`, `X × ${fmt(1+p/100)} = 100 → X = 100 ÷ ${fmt(1+p/100)} = ${fmt(v)}`]); }],
    dificil:[()=>{ const s=pick([1000,1500,2000,2500,3000]), p=pick([4,5,8,10]);
      return vS(`Um salário de R$ ${s} precisa ser corrigido por uma inflação de ${p}% para manter o poder de compra. Qual deve ser o novo salário (em reais)?`, s*(1+p/100), [`Corrigir ${p}% é multiplicar por ${fmt(1+p/100)}`, `${s} × ${fmt(1+p/100)} = ${fmt(s*(1+p/100))}`]); }],
  },
  matrizes:{
    facil:[()=>{ const m=randInt(2,6), n=randInt(2,6);
      return vS(`Quantos elementos tem uma matriz de ordem ${m} × ${n}?`, m*n, [`Ordem ${m} × ${n}: ${m} linhas e ${n} colunas`, `${m} × ${n} = ${m*n} elementos`]); }],
    medio:[()=>{ const M=Array.from({length:2},()=>Array.from({length:3},()=>randInt(-9,9))), i=randInt(1,3), j=randInt(1,2), q=`Sendo Aᵗ a transposta de A, qual é o elemento a${subTxt(i)}${subTxt(j)} de Aᵗ?`;
      return mkSingle(q, M[j-1][i-1], [`Na transposta, linhas viram colunas: o elemento (${i}, ${j}) de Aᵗ é o (${j}, ${i}) de A`, `Linha ${j}, coluna ${i} de A: ${nm(M[j-1][i-1])}`], null, matQ(q, [matHTML(M,'A')]), matHTML(M,'A')); }],
    dificil:[()=>{ const n=pick([2,3]), [f,txt] = pick([[(i,j)=>i+j,'i + j'],[(i,j)=>2*i-j,'2i − j'],[(i,j)=>i*j,'i · j'],[(i,j)=>i-j,'i − j']]);
      const M=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>f(i+1,j+1))), s=M.flat().reduce((a,b)=>a+b,0);
      return vS(`A matriz A, de ordem ${n}, tem elementos aᵢⱼ = ${txt}. Qual é a soma de todos os elementos?`, s, [`Monte a matriz: ${M.map(r=>`[${r.map(nm).join(', ')}]`).join(' ')}`, `Soma: ${M.flat().map(nm).join(' + ')} = ${nm(s)}`]); }],
  },
  determinantes:{
    facil:[()=>{ const k=randInt(2,9);
      return vS(`Qual é o determinante da matriz 2×2 que tem ${k} na diagonal principal e 0 nos outros lugares?`, k*k, [`Diagonal principal: ${k} × ${k} = ${k*k}; secundária: 0 × 0 = 0`, `det = ${k*k} − 0 = ${k*k}`]); }],
    medio:[()=>{ const c=pick([2,3,4,5,6]), x=randInt(-6,8), a=randInt(1,6)*pick([1,-1]); const b=c*x/a; if(!Number.isInteger(b)||b===0) return SUBJECT_VARIATIONS.determinantes.medio[0]();
      const q=`Para qual valor de x o determinante da matriz é zero?`;
      return mkSingle(q, x, [`det = x · ${c} − ${np(a)} · ${np(b)} = ${c}x − ${np(a*b)}`, `${c}x − ${np(a*b)} = 0 → ${c}x = ${nm(a*b)} → x = ${nm(x)}`], null, matQ(q, [`<span class="mat-wrap"><span class="mat"><table><tr><td>x</td><td>${nm(a)}</td></tr><tr><td>${nm(b)}</td><td>${c}</td></tr></table></span></span>`]), null); }],
    dificil:[()=>{ const D=randInt(-9,9)||3, k=randInt(2,5);
      return vS(`Uma matriz A, 2×2, tem determinante ${nm(D)}. Qual é o determinante de ${k}A?`, k*k*D, [`Multiplicar a matriz por ${k} multiplica cada uma das 2 linhas por ${k}: o det fica × ${k}² = ${k*k}`, `det(${k}A) = ${k*k} × ${np(D)} = ${nm(k*k*D)}`]); }],
  },
};
function supTxt(n){ return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]||d).join(''); }
function subTxt(n){ return String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[d]||d).join(''); }
/* troca o gerador de cada dificuldade por um sorteio entre o original e os extras */
SUBJECTS.forEach(s=>{
  const extra = SUBJECT_VARIATIONS[s.id];
  if(!extra || !s.gen) return;
  ['facil','medio','dificil'].forEach(d=>{
    const orig = s.gen[d], list = (orig ? [orig] : []).concat(extra[d] || []);
    if(list.length > 1) s.gen[d] = ()=> pick(list)();
  });
});
