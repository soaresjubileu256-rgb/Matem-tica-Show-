/* =========================================================
   BNCC e QUESTÕES CONTEXTUALIZADAS (estilo ENEM/SAEB)
   - BNCC_HAB: principais habilidades da BNCC de cada assunto (código + resumo com nossas palavras).
     É uma referência aproximada pra orientar estudante, família e professor; o texto oficial
     está no documento da BNCC (basenacionalcomum.mec.gov.br).
   - CTX_QUESTIONS: modelos de questões com uma situação do dia a dia, 5 alternativas (A–E)
     e alternativas erradas que vêm de erros comuns (ex.: esquecer de multiplicar, usar o perímetro
     no lugar da área). Cada modelo gera números novos a cada vez.
   ========================================================= */
const BNCC_DESC = {
  EF02MA05:'Fatos básicos da adição e da subtração para o cálculo mental',
  EF03MA05:'Cálculo mental e escrito de adição e subtração',
  EF03MA06:'Problemas de juntar, retirar, comparar e completar quantidades',
  EF03MA07:'Problemas de multiplicação (por 2, 3, 4, 5 e 10)',
  EF03MA08:'Divisão com resto zero e com resto diferente de zero',
  EF03MA24:'Comparação e equivalência de valores em reais',
  EF04MA06:'Diferentes significados da multiplicação',
  EF04MA07:'Divisão com divisor de até dois algarismos',
  EF04MA25:'Compra e venda, troco e desconto',
  EF05MA02:'Ler, escrever e ordenar números decimais',
  EF05MA03:'Identificar e representar frações',
  EF05MA06:'10%, 25%, 50%, 75% e 100% como partes do inteiro',
  EF05MA07:'Adição e subtração com naturais e decimais',
  EF05MA08:'Multiplicação e divisão com naturais e decimais',
  EF06MA03:'Cálculos com números naturais por estratégias variadas',
  EF06MA05:'Primos, compostos, múltiplos e divisores',
  EF06MA06:'Problemas com as ideias de múltiplo e divisor (MMC e MDC)',
  EF06MA07:'Comparar e ordenar frações',
  EF06MA08:'Frações e decimais: duas formas do mesmo número',
  EF06MA09:'Fração de uma quantidade',
  EF06MA10:'Adição e subtração de frações',
  EF06MA11:'As quatro operações com números decimais',
  EF06MA13:'Porcentagem com a ideia de proporcionalidade',
  EF06MA24:'Grandezas e medidas: comprimento, massa, tempo, capacidade',
  EF06MA29:'Perímetro e área ao ampliar ou reduzir figuras',
  EF06MA32:'Interpretar dados em tabelas e gráficos',
  EF07MA02:'Acréscimos e decréscimos percentuais',
  EF07MA04:'Operações com números inteiros',
  EF07MA17:'Proporcionalidade direta e inversa (regra de três)',
  EF07MA18:'Problemas com equação do 1º grau',
  EF07MA31:'Fórmulas da área de triângulos e quadriláteros',
  EF07MA32:'Problemas de área de figuras planas',
  EF07MA35:'Média aritmética e seu significado',
  EF08MA01:'Potências e notação científica',
  EF08MA08:'Problemas com sistemas de equações do 1º grau',
  EF08MA09:'Equações do 2º grau do tipo ax² = b',
  EF08MA22:'Probabilidade a partir do espaço amostral',
  EF08MA25:'Média, moda e mediana',
  EF09MA03:'Cálculos com números reais e potências',
  EF09MA05:'Porcentagens sucessivas e educação financeira',
  EF09MA06:'Funções como relação de dependência entre variáveis',
  EF09MA07:'Razão entre grandezas diferentes (velocidade, densidade)',
  EF09MA08:'Proporcionalidade entre duas ou mais grandezas',
  EF09MA09:'Problemas com equação do 2º grau',
  EM13MAT102:'Analisar tabelas e gráficos de pesquisas divulgadas na mídia',
  EM13MAT104:'Interpretar taxas e índices, como a inflação',
  EM13MAT302:'Modelar situações com funções do 1º e do 2º grau',
  EM13MAT303:'Comparar juros simples e compostos',
  EM13MAT304:'Problemas com funções exponenciais',
  EM13MAT305:'Problemas com funções logarítmicas',
  EM13MAT306:'Fenômenos periódicos e funções trigonométricas',
  EM13MAT308:'Triângulos: semelhança, leis do seno e do cosseno',
  EM13MAT309:'Áreas e volumes de prismas, pirâmides e corpos redondos',
  EM13MAT310:'Problemas de contagem (princípio multiplicativo, combinações)',
  EM13MAT311:'Espaço amostral e cálculo de probabilidade',
  EM13MAT312:'Probabilidade em experimentos sucessivos',
  EM13MAT316:'Medidas de tendência central e de dispersão',
  EM13MAT402:'Gráfico e forma algébrica da função do 2º grau',
  EM13MAT403:'Relação entre funções exponencial e logarítmica',
  EM13MAT406:'Construir e interpretar tabelas e gráficos de frequência',
  EM13MAT504:'Volume de prismas, pirâmides, cilindros e cones',
  EM13MAT507:'Progressão aritmética e função afim',
  EM13MAT508:'Progressão geométrica e função exponencial',
};
/* habilidades principais de cada assunto (assunto sem código próprio na BNCC fica de fora) */
const BNCC_HAB = {
  adicao:['EF02MA05','EF03MA05','EF05MA07'], subtracao:['EF02MA05','EF03MA06','EF05MA07'],
  multiplicacao:['EF03MA07','EF04MA06','EF05MA08'], divisao:['EF03MA08','EF04MA07','EF05MA08'],
  dinheiro:['EF03MA24','EF04MA25','EF05MA07'],
  fracoes:['EF05MA03','EF06MA07','EF06MA09','EF06MA10'], decimais:['EF05MA02','EF06MA08','EF06MA11'],
  porcentagem:['EF05MA06','EF06MA13','EF07MA02'], geometria:['EF06MA29','EF07MA31','EF07MA32'],
  mmcmdc:['EF06MA05','EF06MA06'], potenciacao:['EF08MA01','EF09MA03'], expressoes:['EF06MA03','EF07MA04'],
  estatistica:['EF06MA32','EF07MA35','EF08MA25'], regra3:['EF07MA17','EF09MA08'], eq1:['EF07MA18'],
  sistemas:['EF08MA08'], eq2:['EF08MA09','EF09MA09'], func1grau:['EF09MA06','EM13MAT302'],
  funcquad:['EM13MAT302','EM13MAT402'], exponencial:['EM13MAT304','EM13MAT403'], logaritmo:['EM13MAT305','EM13MAT403'],
  functrig:['EM13MAT306'], ciclo:['EM13MAT306'], pa:['EM13MAT507'], pg:['EM13MAT508'],
  espacial:['EM13MAT309','EM13MAT504'], trigret:['EM13MAT308'], leis:['EM13MAT308'],
  combinatoria:['EM13MAT310'], probabilidade:['EF08MA22','EM13MAT311','EM13MAT312'],
  dispersao:['EM13MAT316'], graficos:['EM13MAT102','EM13MAT406'],
  juros:['EF09MA05','EM13MAT303'], descontos:['EF07MA02','EM13MAT303'], inflacao:['EM13MAT104'],
};
function bnccFor(subjectId){ return (BNCC_HAB[subjectId]||[]).filter(c=>BNCC_DESC[c]); }
/* bloco com as habilidades de um assunto (usado no Aprender) */
function bnccBoxHTML(subjectId){
  const list = bnccFor(subjectId);
  if(!list.length) return '';
  return `<div class="bncc-box"><div class="bncc-h">📋 Habilidades da BNCC</div>${list.map(c=>`<div class="bncc-row"><b>${c}</b><span>${BNCC_DESC[c]}</span></div>`).join('')}<small>Referência aproximada. O texto oficial está no documento da BNCC.</small></div>`;
}

/* ---------- questões contextualizadas ---------- */
const ctxBrl = v=> 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
const ctxNum = (v, d)=> Number(v).toLocaleString('pt-BR', {maximumFractionDigits: d==null ? 2 : d});
const ctxR2 = v=> Math.round(v*100)/100;
function ctxGcd(a,b){ return b ? ctxGcd(b, a%b) : a; }

/* cada modelo devolve {q, ans, f (formata), wrong:[erros comuns], steps} */
const CTX_QUESTIONS = [
  // ---------------- Ensino Fundamental ----------------
  {id:'troco', sid:'dinheiro', lvl:'fund', bncc:'EF04MA25', tema:'Compras', gen:()=>{
    const k = randInt(2,5), p = pick([3.5,4.25,6.5,7.9,8.75,12.5]), nota = k*p < 20 ? 20 : k*p < 50 ? 50 : 100;
    const total = ctxR2(k*p), ans = ctxR2(nota-total);
    return {q:`Na papelaria, Júlia comprou ${k} cadernos de ${ctxBrl(p)} cada um e pagou com uma nota de ${ctxBrl(nota)}. Quanto ela recebeu de troco?`,
      ans, f:ctxBrl, wrong:[ctxR2(nota-p), total, ctxR2(nota-(k+1)*p), ctxR2(ans+1)],
      steps:[`Valor da compra: ${k} × ${ctxBrl(p)} = ${ctxBrl(total)}`, `Troco: ${ctxBrl(nota)} − ${ctxBrl(total)} = ${ctxBrl(ans)}`]};
  }},
  {id:'desconto', sid:'porcentagem', lvl:'fund', bncc:'EF07MA02', tema:'Promoção', gen:()=>{
    const P = pick([80,120,150,200,240,350,480]), d = pick([10,15,20,25,30,40]);
    const desc = ctxR2(P*d/100), ans = ctxR2(P-desc);
    return {q:`Um tênis custa ${ctxBrl(P)}. Na liquidação, a loja dá ${d}% de desconto. Por quanto o tênis vai sair?`,
      ans, f:ctxBrl, wrong:[desc, ctxR2(P-d), ctxR2(P+desc), ctxR2(P-desc/10)],
      steps:[`Desconto: ${d}% de ${ctxBrl(P)} = ${P} × ${d} ÷ 100 = ${ctxBrl(desc)}`, `Preço final: ${ctxBrl(P)} − ${ctxBrl(desc)} = ${ctxBrl(ans)}`]};
  }},
  {id:'fracao-turma', sid:'fracoes', lvl:'fund', bncc:'EF06MA09', tema:'Pesquisa na escola', gen:()=>{
    const b = pick([3,4,5,6,8]), a = randInt(1,b-1), N = b*randInt(4,8);
    const ans = N*a/b;
    return {q:`Numa turma de ${N} alunos, ${a}/${b} disseram que preferem futebol. Quantos alunos preferem futebol?`,
      ans, f:v=>ctxNum(v), wrong:[N/b, N-ans, N*b/a % 1 ? N+a : N*b/a, ans+a],
      steps:[`1/${b} da turma: ${N} ÷ ${b} = ${N/b}`, `${a}/${b} da turma: ${N/b} × ${a} = ${ans}`]};
  }},
  {id:'receita', sid:'regra3', lvl:'fund', bncc:'EF07MA17', tema:'Cozinha', gen:()=>{
    const n = pick([4,6,8]), m = pick([n/2, n*2, n*3, n*1.5]), q = pick([200,300,240,360]);
    const ans = q*m/n;
    return {q:`Uma receita de bolo para ${n} pessoas usa ${q} g de farinha. Quantos gramas de farinha são necessários para fazer o bolo para ${m} pessoas, mantendo a proporção?`,
      ans, f:v=>`${ctxNum(v)} g`, wrong:[q*n/m, q+m-n, q*m, ans/2],
      steps:[`É proporção direta: mais pessoas, mais farinha.`, `${n}/${q} = ${m}/x → x = ${q} × ${m} ÷ ${n}`, `x = ${ctxNum(ans)} g`]};
  }},
  {id:'pedreiros', sid:'regra3', lvl:'fund', bncc:'EF07MA17', tema:'Obra', gen:()=>{
    const t = pick([2,3,4,6]), d = pick([12,18,24,30]), w = pick([t*2, t*3]);
    const ans = t*d/w;
    return {q:`${t} pedreiros constroem um muro em ${d} dias. Trabalhando no mesmo ritmo, em quantos dias ${w} pedreiros constroem o mesmo muro?`,
      ans, f:v=>`${ctxNum(v)} dias`, wrong:[d*w/t, d, d-(w-t), ans*2],
      steps:[`É proporção inversa: mais pedreiros, menos dias.`, `${t} × ${d} = ${w} × x → x = ${t*d} ÷ ${w}`, `x = ${ctxNum(ans)} dias`]};
  }},
  {id:'media-notas', sid:'estatistica', lvl:'fund', bncc:'EF07MA35', tema:'Boletim', gen:()=>{
    let ns; do{ ns = [0,0,0,0].map(()=>randInt(4,10)); }while(ns.reduce((a,b)=>a+b,0)%4);
    const s = ns.reduce((a,b)=>a+b,0), ans = s/4, sorted = [...ns].sort((a,b)=>a-b);
    const med = (sorted[1]+sorted[2])/2;
    return {q:`Pedro tirou as notas ${ns.join(', ')} nos quatro bimestres. Qual foi a média das notas dele no ano?`,
      ans, f:v=>ctxNum(v,1), wrong:[s, med===ans ? ans+0.5 : med, ctxR2(s/3), Math.max(...ns)],
      steps:[`Some as notas: ${ns.join(' + ')} = ${s}`, `Divida pela quantidade de notas: ${s} ÷ 4 = ${ctxNum(ans,1)}`]};
  }},
  {id:'grama', sid:'geometria', lvl:'fund', bncc:'EF07MA32', tema:'Jardim', gen:()=>{
    const a = randInt(4,12), b = randInt(3,9), c = pick([8,10,12,15]);
    const area = a*b, ans = area*c;
    return {q:`Um jardim retangular mede ${a} m por ${b} m. A grama custa ${ctxBrl(c)} o metro quadrado. Quanto vai custar gramar o jardim inteiro?`,
      ans, f:ctxBrl, wrong:[2*(a+b)*c, area, (a+b)*c, ans/2],
      steps:[`Área do jardim: ${a} × ${b} = ${area} m²`, `Custo: ${area} × ${ctxBrl(c)} = ${ctxBrl(ans)}`]};
  }},
  {id:'velocidade', sid:'func1grau', lvl:'fund', bncc:'EF09MA07', tema:'Viagem', gen:()=>{
    const T = pick([2,3,4,5]), v = pick([60,70,75,80,90]), D = v*T;
    return {q:`Um ônibus percorreu ${D} km em ${T} horas. Qual foi a velocidade média do ônibus?`,
      ans:v, f:x=>`${ctxNum(x)} km/h`, wrong:[D*T, D-T, v+10, Math.round(D/(T+1))],
      steps:[`Velocidade média = distância ÷ tempo`, `${D} ÷ ${T} = ${v} km/h`]};
  }},
  {id:'idades', sid:'eq1', lvl:'fund', bncc:'EF07MA18', tema:'Idades', gen:()=>{
    const k = pick([2,3,4]), filho = randInt(6,14), S = filho*(k+1);
    return {q:`Hoje, a idade de Carla é ${k===2?'o dobro':k===3?'o triplo':'o quádruplo'} da idade do filho dela. Somando as duas idades, dá ${S} anos. Quantos anos tem o filho?`,
      ans:filho, f:v=>`${ctxNum(v)} anos`, wrong:[S/k % 1 ? filho+1 : S/k, filho*k, S/2 % 1 ? filho+2 : S/2, filho-1],
      steps:[`Idade do filho: x. Idade de Carla: ${k}x`, `x + ${k}x = ${S} → ${k+1}x = ${S}`, `x = ${S} ÷ ${k+1} = ${filho}`]};
  }},
  {id:'ingressos', sid:'sistemas', lvl:'fund', bncc:'EF08MA08', tema:'Cinema', gen:()=>{
    const pa = pick([20,24,30]), pc = pa/2, ad = randInt(10,40), cr = randInt(10,40), N = ad+cr, R = ad*pa+cr*pc;
    return {q:`Uma sessão de cinema vendeu ${N} ingressos: inteira a ${ctxBrl(pa)} e meia a ${ctxBrl(pc)}. A bilheteria arrecadou ${ctxBrl(R)}. Quantas meias-entradas foram vendidas?`,
      ans:cr, f:v=>`${ctxNum(v)} ingressos`, wrong:[ad, Math.round(N/2)===cr ? cr+2 : Math.round(N/2), cr+5, Math.abs(cr-3)],
      steps:[`Inteiras: x. Meias: y. Então x + y = ${N} e ${pa}x + ${pc}y = ${R}`, `De x = ${N} − y: ${pa}(${N} − y) + ${pc}y = ${R} → ${pa*N} − ${pc}y = ${R}`, `${pc}y = ${pa*N-R} → y = ${cr}`]};
  }},
  {id:'onibus-mmc', sid:'mmcmdc', lvl:'fund', bncc:'EF06MA06', tema:'Transporte', gen:()=>{
    let a, b; do{ a = pick([6,8,10,12,15]); b = pick([9,10,12,18,20]); }while(a===b);
    const g = ctxGcd(a,b), ans = a*b/g;
    return {q:`Dois ônibus saem juntos do terminal às 7h. Um sai a cada ${a} minutos e o outro a cada ${b} minutos. Depois de quantos minutos eles vão sair juntos de novo?`,
      ans, f:v=>`${ctxNum(v)} min`, wrong:[a*b===ans ? ans+a : a*b, a+b, g, Math.max(a,b)],
      steps:[`Procuramos o menor múltiplo comum de ${a} e ${b} (MMC).`, `MDC(${a}, ${b}) = ${g}, então MMC = ${a} × ${b} ÷ ${g}`, `MMC = ${ans} minutos`]};
  }},
  {id:'combustivel', sid:'decimais', lvl:'fund', bncc:'EF06MA11', tema:'Posto de gasolina', gen:()=>{
    const p = pick([5.49,5.89,6.19,6.35]), L = pick([10,20,25,30,40]);
    const ans = ctxR2(p*L);
    return {q:`O litro da gasolina custa ${ctxBrl(p)}. Quanto custa encher ${L} litros?`,
      ans, f:ctxBrl, wrong:[ctxR2(p*L/10), ctxR2(p+L), ctxR2(Math.floor(p)*L), ctxR2(ans+p)],
      steps:[`Multiplique o preço do litro pela quantidade: ${ctxNum(p)} × ${L}`, `${ctxNum(p)} × ${L} = ${ctxBrl(ans)}`]};
  }},
  {id:'garrafa-copos', sid:'decimais', lvl:'fund', bncc:'EF06MA24', tema:'Festa', gen:()=>{
    const L = pick([1.5,2,2.5,3]), c = pick([200,250,300]);
    const ml = L*1000, ans = Math.floor(ml/c);
    return {q:`Para uma festa, cada garrafa de suco tem ${ctxNum(L)} litros. Quantos copos de ${c} mL dá para encher completamente com uma garrafa?`,
      ans, f:v=>`${ctxNum(v)} copos`, wrong:[Math.floor(L*100/c) || ans+2, Math.round(L*c/100), ans+1, ans*2],
      steps:[`Converta litros em mililitros: ${ctxNum(L)} L = ${ml} mL`, `${ml} ÷ ${c} = ${ctxNum(ml/c)} → ${ans} copos cheios`]};
  }},
  {id:'aumentos', sid:'porcentagem', lvl:'fund', bncc:'EF09MA05', tema:'Preços', gen:()=>{
    const P = pick([100,200,400,500]), a = pick([10,20]), b = pick([10,20,25]);
    const ans = ctxR2(P*(1+a/100)*(1+b/100));
    return {q:`Um produto custava ${ctxBrl(P)}. Em janeiro subiu ${a}% e, em fevereiro, subiu mais ${b}% sobre o novo preço. Qual é o preço agora?`,
      ans, f:ctxBrl, wrong:[ctxR2(P*(1+(a+b)/100)), ctxR2(P*(a+b)/100), ctxR2(P*(1+a/100)), ctxR2(ans+P*0.05)],
      steps:[`Depois de janeiro: ${ctxBrl(P)} × ${ctxNum(1+a/100)} = ${ctxBrl(P*(1+a/100))}`, `Depois de fevereiro: ${ctxBrl(P*(1+a/100))} × ${ctxNum(1+b/100)} = ${ctxBrl(ans)}`, `Atenção: não é só somar ${a}% + ${b}%!`]};
  }},
  // ---------------- Ensino Médio ----------------
  {id:'juros-compostos', sid:'juros', lvl:'em', bncc:'EM13MAT303', tema:'Investimento', gen:()=>{
    const C = pick([1000,2000,5000]), i = pick([2,5,10]), t = pick([2,3]);
    const ans = ctxR2(C*Math.pow(1+i/100, t));
    return {q:`Ana aplicou ${ctxBrl(C)} a juros compostos de ${i}% ao mês, sem fazer retiradas. Quanto ela terá depois de ${t} meses?`,
      ans, f:ctxBrl, wrong:[ctxR2(C*(1+i*t/100)), ctxR2(C*i*t/100), ctxR2(C*(1+i/100)*t), ctxR2(ans+C*0.01*t)],
      steps:[`Juros compostos: M = C × (1 + i)ᵗ`, `M = ${C} × (1 + ${ctxNum(i/100)})${t===2?'²':'³'} = ${C} × ${ctxNum(Math.pow(1+i/100,t),4)}`, `M = ${ctxBrl(ans)}`]};
  }},
  {id:'urna', sid:'probabilidade', lvl:'em', bncc:'EM13MAT311', tema:'Sorteio', gen:()=>{
    const T = pick([20,25,40,50]), v = randInt(3, T-5), a = T-v;
    const ans = ctxR2(v/T*100);
    return {q:`Uma urna tem ${v} bolas vermelhas e ${a} bolas azuis, todas iguais ao toque. Sorteando uma bola ao acaso, qual é a probabilidade de sair vermelha?`,
      ans, f:x=>`${ctxNum(x,1)}%`, wrong:[ctxR2(a/T*100), ctxR2(v/a*100) > 100 ? ctxR2(100-ans+5) : ctxR2(v/a*100), v, 50===ans ? 40 : 50],
      steps:[`Total de bolas: ${v} + ${a} = ${T}`, `P = casos favoráveis ÷ casos possíveis = ${v}/${T}`, `${v} ÷ ${T} = ${ctxNum(v/T,3)} = ${ctxNum(ans,1)}%`]};
  }},
  {id:'cardapio', sid:'combinatoria', lvl:'em', bncc:'EM13MAT310', tema:'Restaurante', gen:()=>{
    const e = randInt(2,4), p = randInt(3,6), s = randInt(2,4);
    const ans = e*p*s;
    return {q:`Um restaurante oferece ${e} entradas, ${p} pratos principais e ${s} sobremesas. Quantas refeições diferentes dá para montar escolhendo 1 entrada, 1 prato e 1 sobremesa?`,
      ans, f:v=>`${ctxNum(v)} refeições`, wrong:[e+p+s, e*p+s, ans*2, e*p],
      steps:[`Princípio multiplicativo: multiplique as opções de cada etapa.`, `${e} × ${p} × ${s} = ${ans}`]};
  }},
  {id:'apertos', sid:'combinatoria', lvl:'em', bncc:'EM13MAT310', tema:'Reunião', gen:()=>{
    const n = randInt(5,12), ans = n*(n-1)/2;
    return {q:`Numa reunião com ${n} pessoas, cada uma cumprimenta todas as outras com um aperto de mão, uma única vez. Quantos apertos de mão acontecem?`,
      ans, f:v=>`${ctxNum(v)} apertos`, wrong:[n*(n-1), n*n, 2*n, n-1],
      steps:[`Cada aperto junta 2 pessoas, e a ordem não importa: é uma combinação C(${n}, 2).`, `C(${n}, 2) = ${n} × ${n-1} ÷ 2`, `= ${ans} apertos de mão`]};
  }},
  {id:'mesada-pa', sid:'pa', lvl:'em', bncc:'EM13MAT507', tema:'Poupança', gen:()=>{
    const a = pick([20,30,50]), r = pick([5,10,15]), n = randInt(6,12);
    const ans = a+(n-1)*r;
    return {q:`Lucas guardou ${ctxBrl(a)} no 1º mês e decidiu guardar ${ctxBrl(r)} a mais a cada mês. Quanto ele vai guardar no ${n}º mês?`,
      ans, f:ctxBrl, wrong:[a+n*r, a*n, a+(n-2)*r, r*n],
      steps:[`É uma PA com a₁ = ${a} e razão r = ${r}`, `aₙ = a₁ + (n − 1) × r = ${a} + ${n-1} × ${r}`, `No ${n}º mês: ${ctxBrl(ans)}`]};
  }},
  {id:'taxi', sid:'func1grau', lvl:'em', bncc:'EM13MAT302', tema:'Táxi', gen:()=>{
    const B = pick([4.5,5,6]), k = pick([2.5,3,3.5]), x = randInt(4,15);
    const ans = ctxR2(B+k*x);
    return {q:`Num táxi, a corrida custa uma bandeirada de ${ctxBrl(B)} mais ${ctxBrl(k)} por quilômetro rodado. Quanto custa uma corrida de ${x} km?`,
      ans, f:ctxBrl, wrong:[ctxR2(k*x), ctxR2((B+k)*x), ctxR2(B*x+k), ctxR2(B+k)],
      steps:[`Preço = bandeirada + valor por km × distância: P(x) = ${ctxNum(B)} + ${ctxNum(k)}x`, `P(${x}) = ${ctxNum(B)} + ${ctxNum(k)} × ${x} = ${ctxBrl(ans)}`]};
  }},
  {id:'piscina', sid:'espacial', lvl:'em', bncc:'EM13MAT309', tema:'Piscina', gen:()=>{
    const a = randInt(4,10), b = randInt(2,5), hh = pick([1,1.5,2]);
    const vol = a*b*hh, ans = vol*1000;
    return {q:`Uma piscina tem a forma de um bloco retangular com ${a} m de comprimento, ${b} m de largura e ${ctxNum(hh)} m de profundidade. Quantos litros de água cabem nela? (1 m³ = 1000 L)`,
      ans, f:v=>`${ctxNum(v)} L`, wrong:[vol, vol*100, 2*(a*b+a*hh+b*hh)*1000, a*b*1000],
      steps:[`Volume do bloco: comprimento × largura × altura = ${a} × ${b} × ${ctxNum(hh)} = ${ctxNum(vol)} m³`, `Em litros: ${ctxNum(vol)} × 1000 = ${ctxNum(ans)} L`]};
  }},
  {id:'mediana', sid:'dispersao', lvl:'em', bncc:'EM13MAT316', tema:'Esportes', gen:()=>{
    let vals; do{ vals = [0,0,0,0,0,0,0].map(()=>randInt(10,30)); }while(new Set(vals).size<7);
    const sorted = [...vals].sort((a,b)=>a-b), ans = sorted[3], mean = ctxR2(vals.reduce((a,b)=>a+b,0)/7);
    return {q:`Um time marcou, em 7 jogos, os seguintes pontos: ${vals.join(', ')}. Qual é a mediana desses pontos?`,
      ans, f:v=>ctxNum(v,2), wrong:[vals[3]===ans ? sorted[2] : vals[3], mean===ans ? ans+1 : mean, sorted[4], sorted[6]-sorted[0]],
      steps:[`Coloque em ordem: ${sorted.join(', ')}`, `Com 7 valores, a mediana é o 4º: ${ans}`]};
  }},
  {id:'bacterias', sid:'exponencial', lvl:'em', bncc:'EM13MAT304', tema:'Laboratório', gen:()=>{
    const N = pick([100,200,500]), hh = pick([1,2,3]), k = randInt(3,6), t = hh*k;
    const ans = N*Math.pow(2,k);
    return {q:`Uma colônia começa com ${N} bactérias e dobra a cada ${hh} hora${hh>1?'s':''}. Quantas bactérias haverá depois de ${t} horas?`,
      ans, f:v=>ctxNum(v), wrong:[N*2*k, N*k, N*Math.pow(2,t)===ans ? ans*2 : N*Math.pow(2,t), N+N*k],
      steps:[`Em ${t} horas, a colônia dobra ${t} ÷ ${hh} = ${k} vezes.`, `N = ${N} × 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]} = ${N} × ${Math.pow(2,k)}`, `N = ${ctxNum(ans)} bactérias`]};
  }},
  {id:'inflacao', sid:'inflacao', lvl:'em', bncc:'EM13MAT104', tema:'Supermercado', gen:()=>{
    const P = pick([200,300,400,600]), i = pick([4,5,6,8,10]);
    const ans = ctxR2(P*(1+i/100));
    return {q:`Uma cesta de compras custava ${ctxBrl(P)}. No último ano, a inflação desses produtos foi de ${i}%. Quanto custa agora a mesma cesta?`,
      ans, f:ctxBrl, wrong:[ctxR2(P*i/100), ctxR2(P+i), ctxR2(P*(1-i/100)), ctxR2(P*(1+i/10))],
      steps:[`Aumento: ${i}% de ${ctxBrl(P)} = ${ctxBrl(P*i/100)}`, `Novo preço: ${ctxBrl(P)} + ${ctxBrl(P*i/100)} = ${ctxBrl(ans)}`]};
  }},
];
const CTX_LETTERS = ['A','B','C','D','E'];
/* gera uma questão pronta: enunciado, 5 alternativas (1 certa + erros comuns) e a resolução */
function ctxBuild(model){
  for(let tries=0; tries<20; tries++){
    const g = model.gen();
    const right = g.f(g.ans);
    const labels = [];
    g.wrong.concat([g.ans*1.1, g.ans*0.9, g.ans+2, g.ans-2, g.ans*2, g.ans/2]).forEach(v=>{
      if(!(Number.isFinite(v)) || v<0) return;
      const l = g.f(ctxR2(v));
      if(l!==right && !labels.includes(l) && labels.length<4) labels.push(l);
    });
    if(labels.length<4) continue;
    const opts = shuffle([{label:right, ok:true}, ...labels.map(l=>({label:l, ok:false}))]);
    const s = SUBJECTS.find(x=>x.id===model.sid);
    return {model, subjectId:model.sid, subjectName: s ? s.name : model.sid, q:g.q, opts, right, steps:g.steps,
      ex: mkSingle(g.q, ctxR2(g.ans), g.steps)};
  }
  return null;
}
function ctxModelsFor(lvl){ return CTX_QUESTIONS.filter(m=> SUBJECTS.some(s=>s.id===m.sid) && (lvl==='all' || m.lvl===lvl)); }
