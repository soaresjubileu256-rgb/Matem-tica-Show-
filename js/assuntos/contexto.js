/* =========================================================
   PROBLEMAS DO DIA A DIA (Ensino Fundamental)
   Nos níveis médio e difícil, parte das questões de Adição, Subtração, Multiplicação,
   Divisão, Frações, Decimais e Porcentagem vira uma situação do dia a dia (mercado,
   escola, jogo, viagem...). A conta armada aparece só na correção: na pergunta, o aluno
   precisa descobrir qual conta fazer, como na prova.
   ========================================================= */
const STORY_CHANCE = {medio:0.35, dificil:0.4};
const STORY_NAMES = ['Ana','Bruno','Carla','Davi','Lia','Caio','Júlia','Pedro','Bia','Theo','Lara','Rafa','Malu','Enzo','Sofia','Gael'];
const storyReais = v=> `R$ ${fmt(Math.round(v*100)/100).replace(/^(\d+)$/,'$1,00').replace(/,(\d)$/,',$10')}`;

/* cada história devolve a questão pronta; o nível vem em "hard" (true = difícil) */
const STORIES = {
  adicao:[
    hard=>{ const a=randInt(hard?300:40,hard?900:300), b=randInt(hard?200:30,hard?800:280), r=a+b, {steps,carries}=addColumnSteps([a,b]);
      return mkSingle(`Numa gincana, a turma do 6º A juntou ${a} latinhas e a do 6º B juntou ${b}. Quantas latinhas as duas turmas juntaram?`, r, [`"Juntar" é somar: ${a} + ${b}.`, ...steps], null, null, contaArmada([a,b],'+',String(r),carries)); },
    hard=>{ const n=pick(STORY_NAMES), a=randInt(hard?120:30,hard?480:150), b=randInt(hard?100:20,hard?450:140), c=hard?randInt(50,300):0, nums=c?[a,b,c]:[a,b], r=a+b+c, {steps,carries}=addColumnSteps(nums);
      return mkSingle(`${n} está lendo um livro. Leu ${a} páginas na primeira semana${c?`, ${b} na segunda e ${c} na terceira`:` e ${b} na segunda`}. Quantas páginas leu ao todo?`, r, [`Some as páginas de cada semana: ${nums.join(' + ')}.`, ...steps], null, null, contaArmada(nums,'+',String(r),carries)); },
    hard=>{ const a=randInt(hard?1200:200,hard?4800:900), b=randInt(hard?900:100,hard?3900:800), r=a+b, {steps,carries}=addColumnSteps([a,b]);
      return mkSingle(`Num jogo de celular, você fez ${a} pontos na fase 1 e ${b} pontos na fase 2. Quantos pontos fez nas duas fases?`, r, [`Total = ${a} + ${b}.`, ...steps], null, null, contaArmada([a,b],'+',String(r),carries)); },
    hard=>{ const a=randInt(hard?20:12,hard?45:30), b=randInt(hard?15:8,hard?40:25), c=randInt(hard?10:5,hard?35:20), nums=[a,b,c], r=a+b+c, {steps,carries}=addColumnSteps(nums);
      return mkSingle(`Um ônibus saiu do terminal com ${a} passageiros. No primeiro ponto subiram ${b} e no segundo subiram mais ${c}. Ninguém desceu. Quantos passageiros há no ônibus?`, r, [`Ninguém desceu: é só juntar tudo, ${a} + ${b} + ${c}.`, ...steps], null, null, contaArmada(nums,'+',String(r),carries)); },
  ],
  subtracao:[
    hard=>{ const a=randInt(hard?1000:200,hard?3000:600), b=randInt(hard?300:50,a-20), r=a-b, {steps,marks}=subColumnSteps(a,b);
      return mkSingle(`A biblioteca da escola tinha ${a} livros e emprestou ${b} para os alunos. Quantos livros ficaram na biblioteca?`, r, [`"Ficaram" é o que sobra: ${a} − ${b}.`, ...steps], null, null, contaArmada([a,b],'−',String(r),null,marks)); },
    hard=>{ const n=pick(STORY_NAMES), a=randInt(hard?400:150,hard?900:400), b=randInt(hard?120:40,a-30), r=a-b, {steps,marks}=subColumnSteps(a,b);
      return mkSingle(`O livro de ${n} tem ${a} páginas. ${n} já leu ${b}. Quantas páginas faltam pra terminar?`, r, [`Falta = total − já lido: ${a} − ${b}.`, ...steps], null, null, contaArmada([a,b],'−',String(r),null,marks)); },
    hard=>{ const a=pick(hard?[4500,6000,8000,12000]:[500,800,1000]), b=randInt(Math.round(a*0.3),a-50), r=a-b, {steps,marks}=subColumnSteps(a,b);
      return mkSingle(`Um ${hard?'estádio':'teatro'} tem ${a} lugares. Num dia de ${hard?'jogo':'show'}, ${b} lugares foram ocupados. Quantos lugares ficaram vazios?`, r, [`Vazios = lugares − ocupados: ${a} − ${b}.`, ...steps], null, null, contaArmada([a,b],'−',String(r),null,marks)); },
    hard=>{ const y=pick([2025,2026]), b=randInt(hard?1950:1990,hard?2010:2016), r=y-b, {steps,marks}=subColumnSteps(y,b);
      return mkSingle(`Uma pessoa nasceu em ${b}. Quantos anos ela faz em ${y}?`, r, [`Idade = ano atual − ano em que nasceu: ${y} − ${b}.`, ...steps], null, null, contaArmada([y,b],'−',String(r),null,marks)); },
  ],
  multiplicacao:[
    hard=>{ const a=hard?randInt(12,30):12, b=hard?randInt(11,25):randInt(3,9), r=a*b, st=hard?mulLongSteps(a,b):mulSingleDigitSteps(a,b);
      return mkSingle(hard ? `Um auditório tem ${b} fileiras com ${a} cadeiras em cada uma. Quantas cadeiras há no auditório?` : `Uma caixa tem 12 ovos. Quantos ovos há em ${b} caixas?`, r, [`Mesma quantidade repetida várias vezes: multiplique ${a} × ${b}.`, ...st.steps], null, null, multArmada(a,b,true,hard?undefined:st.carries)); },
    hard=>{ const p=hard?randInt(15,48):randInt(5,9), q=hard?randInt(11,19):randInt(3,8), r=p*q, st=hard?mulLongSteps(p,q):mulSingleDigitSteps(p,q);
      return mkSingle(`O ingresso do cinema custa R$ ${p},00. Quanto os ${q} amigos vão pagar juntos?`, r, [`${q} ingressos de R$ ${p}: ${p} × ${q}.`, ...st.steps, `Eles pagam R$ ${r},00.`], null, null, multArmada(p,q,true,hard?undefined:st.carries)); },
    hard=>{ const n=pick(STORY_NAMES), a=hard?randInt(12,35):randInt(11,25), b=hard?randInt(12,30):7, r=a*b, st=hard?mulLongSteps(a,b):mulSingleDigitSteps(a,b);
      return mkSingle(hard ? `${n} economiza R$ ${a} por semana. Quanto terá juntado depois de ${b} semanas?` : `${n} resolve ${a} exercícios por dia. Quantos exercícios resolve em uma semana (7 dias)?`, r, [`${hard?'Cada semana':'Cada dia'} tem a mesma quantidade: ${a} × ${b}.`, ...st.steps], null, null, multArmada(a,b,true,hard?undefined:st.carries)); },
  ],
  divisao:[
    hard=>{ const b=hard?randInt(6,12):randInt(3,8), q=hard?randInt(12,30):randInt(6,15), a=b*q;
      return mkSingle(`${a} balas vão ser repartidas igualmente entre ${b} crianças. Quantas balas cada criança vai ganhar?`, q, [`Repartir igualmente é dividir: ${a} ÷ ${b}.`, ...divisaoNarrativa(a,b)], null, null, divisaoChave(a,b,true)); },
    hard=>{ const b=hard?randInt(5,9):randInt(3,6), q=hard?randInt(15,40):randInt(5,14), a=b*q;
      return mkSingle(`A conta da pizzaria deu R$ ${a},00 e ${b} amigos vão dividir igualmente. Quanto cada um paga?`, q, [`Dividir a conta: ${a} ÷ ${b}.`, ...divisaoNarrativa(a,b), `Cada um paga R$ ${q},00.`], null, null, divisaoChave(a,b,true)); },
    hard=>{ const b=hard?randInt(8,15):randInt(4,6), q=hard?randInt(8,20):randInt(4,9), a=b*q;
      return mkSingle(`O professor quer montar equipes com ${b} alunos cada. A escola tem ${a} alunos inscritos no torneio. Quantas equipes vão ser formadas?`, q, [`Quantos grupos de ${b} cabem em ${a}? É uma divisão: ${a} ÷ ${b}.`, ...divisaoNarrativa(a,b)], null, null, divisaoChave(a,b,true)); },
    hard=>{ const n=pick(STORY_NAMES), b=hard?randInt(8,15):randInt(4,7), q=hard?randInt(12,25):randInt(5,12), a=b*q;
      return mkSingle(`${n} quer ler um livro de ${a} páginas em ${b} dias, lendo a mesma quantidade por dia. Quantas páginas por dia?`, q, [`Mesma quantidade por dia: ${a} ÷ ${b}.`, ...divisaoNarrativa(a,b)], null, null, divisaoChave(a,b,true)); },
  ],
  decimais:[
    hard=>{ const a=pick([3.5,4.25,6.9,7.5,12.8,15.4]), b=pick([1.75,2.5,3.2,4.9,5.6]), c=hard?pick([2.3,3.75,8.5]):0, r=Math.round((a+b+c)*100)/100;
      return mkSingle(`Na papelaria, você comprou um caderno de ${storyReais(a)}${c?',':' e'} uma caneta de ${storyReais(b)}${c?` e uma régua de ${storyReais(c)}`:''}. Quanto gastou ao todo?`, r, [`Some os preços alinhando a vírgula: ${[a,b,c].filter(Boolean).map(fmt).join(' + ')}.`, `Total: ${storyReais(r)}.`]); },
    hard=>{ const pago=pick(hard?[50,100]:[10,20,50]), preco=Math.floor(pago*randInt(30,85)/100)+pick([0.25,0.5,0.75,0.9,0.35]), r=Math.round((pago-preco)*100)/100;
      return mkSingle(`Um lanche custou ${storyReais(preco)}. Você pagou com uma nota de R$ ${pago},00. Quanto recebe de troco?`, r, [`Troco = valor pago − preço: ${pago},00 − ${fmt(preco)}.`, `Alinhe a vírgula e subtraia: ${storyReais(r)}.`]); },
    hard=>{ const p=pick([2.5,3.8,4.25,5.9,6.45]), q=hard?randInt(4,9):randInt(2,4), r=Math.round(p*q*100)/100;
      return mkSingle(`Um suco custa ${storyReais(p)}. Quanto custam ${q} sucos?`, r, [`Multiplique o preço pela quantidade: ${fmt(p)} × ${q}.`, `Faça a conta sem a vírgula e coloque a vírgula de volta no fim: ${storyReais(r)}.`]); },
    hard=>{ const d=pick([1.2,2.5,3.4,4.8]), e=pick([0.75,1.6,2.35]), r=Math.round((d+e)*100)/100;
      return mkSingle(`${pick(STORY_NAMES)} correu ${fmt(d)} km de manhã e ${fmt(e)} km à tarde. Quantos km correu no dia?`, r, [`Some alinhando a vírgula: ${fmt(d)} + ${fmt(e)}.`, `Total: ${fmt(r)} km.`]); },
  ],
  porcentagem:[
    hard=>{ const base=pick(hard?[120,150,180,240,320]:[40,60,80,100,200]), p=pick(hard?[15,30,35,40]:[10,20,25,50]), d=base*p/100, r=base-d;
      return mkSingle(`Uma camiseta custa R$ ${base},00 e está com ${p}% de desconto. Quanto você vai pagar?`, r, [`Desconto: ${p}% de ${base} = ${base} × ${p} ÷ 100 = ${fmt(d)}.`, `Preço final: ${base} − ${fmt(d)} = ${fmt(r)}.`, `Você paga R$ ${fmt(r)}.`]); },
    hard=>{ const t=pick([20,25,30,40,50]), p=pick(hard?[15,30,35,45,60]:[10,20,40,50]), r=t*p/100;
      if(!Number.isInteger(r)) return STORIES.porcentagem[0](hard);
      return mkSingle(`Numa turma de ${t} alunos, ${p}% usam óculos. Quantos alunos usam óculos?`, r, [`${p}% de ${t} = ${t} × ${p} ÷ 100.`, `${t*p} ÷ 100 = ${r} alunos.`]); },
    hard=>{ const tot=pick([20,25,40,50]), ok=hard?randInt(Math.round(tot*0.4),tot-1):pick([tot/2, tot/4*3, tot/5*4]), r=Math.round(ok/tot*100*100)/100;
      if(!Number.isInteger(ok)) return STORIES.porcentagem[0](hard);
      return mkSingle(`Numa prova com ${tot} questões, ${pick(STORY_NAMES)} acertou ${ok}. Qual foi a porcentagem de acertos?`, r, [`Porcentagem = acertos ÷ total × 100.`, `${ok} ÷ ${tot} = ${fmt(ok/tot)}`, `${fmt(ok/tot)} × 100 = ${fmt(r)}%`]); },
    hard=>{ const s=pick(hard?[1500,1800,2200,2500]:[200,500,800,1000]), p=pick(hard?[5,8,12]:[10,20,25]), au=s*p/100, r=s+au;
      return mkSingle(hard ? `Um salário de R$ ${s},00 teve reajuste de ${p}%. Qual é o novo salário?` : `A mesada de R$ ${s},00 de um ano teve aumento de ${p}% no ano seguinte. Qual o novo valor?`, r, [`Aumento: ${s} × ${p} ÷ 100 = ${fmt(au)}.`, `Novo valor: ${s} + ${fmt(au)} = ${fmt(r)}.`]); },
  ],
  fracoes:[
    hard=>{ const d=pick([6,8,10,12]), c=randInt(1,d-2), left=d-c;
      return mkFrac(`Uma pizza foi cortada em ${d} pedaços iguais e a família comeu ${c}. Que fração da pizza sobrou? (simplifique se der)`, left, d, [`Sobraram ${d} − ${c} = ${left} pedaços de ${d}: ${left}/${d}.`, `Simplificando: ${fracStr(left,d)}.`]); },
    hard=>{ const d=pick([3,4,5]), n=randInt(1,d-1), t=d*randInt(hard?6:3,hard?12:6), r=t/d*n;
      return mkSingle(`Numa turma de ${t} alunos, ${n}/${d} vão de ônibus pra escola. Quantos alunos vão de ônibus?`, r, [`${n}/${d} de ${t}: divida ${t} em ${d} partes iguais → ${t/d}.`, `Pegue ${n} dessas partes: ${t/d} × ${n} = ${r}.`]); },
    hard=>{ const d=pick([4,5,8]), n=randInt(1,d-1), tot=d*randInt(hard?20:5,hard?60:15), r=tot/d*n;
      return mkSingle(`${pick(STORY_NAMES)} ganhou R$ ${tot},00 e gastou ${n}/${d} num jogo. Quanto gastou?`, r, [`1/${d} de ${tot} = ${tot} ÷ ${d} = ${tot/d}.`, `${n}/${d} = ${tot/d} × ${n} = ${r}.`, `Gastou R$ ${r},00.`]); },
  ],
};

/* troca o gerador médio/difícil por um que às vezes sorteia uma história */
SUBJECTS.forEach(s=>{
  const list = STORIES[s.id];
  if(!list || !s.gen) return;
  ['medio','dificil'].forEach(lv=>{
    const base = s.gen[lv];
    if(!base) return;
    s.gen[lv] = ()=>{
      if(Math.random() >= STORY_CHANCE[lv]) return base();
      try{ const q = pick(list)(lv==='dificil'); q.story = true; return q; }catch(e){ return base(); }
    };
  });
});
