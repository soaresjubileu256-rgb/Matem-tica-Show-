/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — ENEM
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */
IQ_ENEM.push(
  // porcentagem: aumento e redução sucessivos de preço
  ()=>{
    const item = pick(['o litro da gasolina','o litro do etanol','o botijão de gás','a passagem de ônibus intermunicipal','o quilo do tomate']);
    let a, b, v, prod;
    do{ a = pick([10,15,20,25,30,40]); b = pick([10,15,20,25,30]); prod = Math.round((1+a/100)*(1-b/100)*10000)/10000; v = Math.round((prod-1)*10000)/100; } while(Math.abs(v)<0.01);
    const upFirst = Math.random()<0.5, meses = pick([['março','abril'],['maio','junho'],['agosto','setembro'],['outubro','novembro']]);
    const f4 = x=> x.toLocaleString('pt-BR', {maximumFractionDigits:4});
    const lab = x=> x>0 ? `aumento de ${iqNum(x)}%` : x<0 ? `redução de ${iqNum(-x)}%` : 'nenhuma variação: o preço voltou ao inicial';
    const fa = iqNum(1+a/100), fb = iqNum(1-b/100);
    const txt = upFirst ? `Em ${meses[0]}, ${item} subiu ${a}%. Em ${meses[1]}, o novo preço caiu ${b}%.` : `Em ${meses[0]}, ${item} caiu ${b}%. Em ${meses[1]}, o novo preço subiu ${a}%.`;
    return {subj:'porcentagem', topic:'Porcentagens sucessivas', text:`<p>Uma pesquisa acompanhou os preços de uma cidade durante dois meses. ${txt}</p>`, visual:'',
      ask:`Comparando com o preço do início de ${meses[0]}, ao final de ${meses[1]} o preço teve`,
      opts: iqMC(v, [[a-b, 'Porcentagens sucessivas não se somam nem se subtraem direto: a segunda variação incide sobre o preço já alterado.'],[Math.round((a-b+a*b/100)*100)/100, `Errou o sinal do produto: ${fa} × ${fb} = ${f4(prod)}.`],[a, 'Considerou só o aumento e esqueceu a redução.'],[-b, 'Considerou só a redução e esqueceu o aumento.']], {fmt:lab, positive:false}),
      steps:[`Aumento de ${a}% → multiplica por ${fa}; redução de ${b}% → multiplica por ${fb}`, `${upFirst ? fa+' × '+fb : fb+' × '+fa} = ${f4(prod)}`, `Ex.: R$ 100,00 viraria ${iqMoney(Math.round(100*prod*100)/100)}`, `${f4(prod)} ${prod>1?'> 1':'< 1'} → ${lab(v)}`]};
  },
  // estatística: mediana lida num gráfico de colunas (frequências)
  ()=>{
    const ctx = pick([
      {who:'alunos', q:'quantos', what:'livros lidos nas férias', un:'livros', intro:'Numa turma, cada aluno contou quantos livros leu nas férias.'},
      {who:'partidas', q:'quantas', what:'gols marcados', un:'gols', intro:'Um time anotou quantos gols marcou em cada partida do campeonato.'},
      {who:'famílias', q:'quantas', what:'pessoas que moram na casa além do entrevistado', un:'pessoas', intro:'Numa pesquisa de rua, cada família informou quantas pessoas moram na casa além do entrevistado.'},
      {who:'dias', q:'quantos', what:'atendimentos de emergência por dia', un:'atendimentos', intro:'Um posto de saúde registrou, durante algumas semanas, quantos atendimentos de emergência fez por dia.'}]);
    let f, n, med, moda;
    for(;;){
      f = [0,1,2,3,4,5].map(()=> randInt(1,9)); n = f.reduce((a,b)=>a+b,0);
      const mx = Math.max(...f); if(f.filter(x=>x===mx).length>1) continue;
      moda = f.indexOf(mx);
      const data = []; f.forEach((c,k)=>{ for(let j=0;j<c;j++) data.push(k); });
      med = n%2 ? data[(n-1)/2] : (data[n/2-1]+data[n/2])/2;
      if(med!==moda && med>0) break;
    }
    const soma = f.reduce((a,c,k)=>a+c*k,0), media = Math.round(soma/n*100)/100;
    const fs = [...f].sort((a,b)=>a-b), medF = (fs[2]+fs[3])/2;
    let acc = 0; const cum = f.map((c,k)=>{ acc += c; return `até ${k}: ${acc}`; });
    const pos = n%2 ? `${(n+1)/2}º valor` : `média do ${n/2}º e do ${n/2+1}º valores`;
    return {subj:'estatistica', topic:'Mediana', text:`<p>${ctx.intro} O gráfico mostra ${ctx.q} ${ctx.who} tiveram cada quantidade de ${ctx.un} (eixo horizontal: número de ${ctx.what}; altura da coluna: número de ${ctx.who}).</p>`,
      visual: iqBarsSVG(['0','1','2','3','4','5'], f, {title:`Número de ${ctx.who} por quantidade de ${ctx.un}`}),
      ask:`A mediana do número de ${ctx.what} é`,
      opts: iqMC(med, [[moda, `Esse é o valor mais frequente (a moda), não o valor do meio da lista ordenada.`],[media, 'Essa é a média, não a mediana.'],[medF, 'Calculou a mediana das alturas das colunas (as frequências), não dos valores do eixo horizontal.'],[2.5, 'Pegou o meio do eixo horizontal; a mediana depende de quantos dados há em cada coluna.']], {fmt:v=>iqNum(v), step:0.5}),
      steps:[`Total de dados: ${f.join(' + ')} = ${n}`, `Com ${n} valores em ordem, a mediana é o ${pos}.`, `Frequências acumuladas: ${cum.join(' · ')}`, `Mediana = ${iqNum(med)}`]};
  },
  // gráfico de setores: material reciclável e quanto rende a venda
  ()=>{
    const mats = ['Papel','Plástico','Vidro','Metal','Outros'];
    let p; do{ p = [0,0,0,0].map(()=> randInt(1,8)*5); p.push(100 - p.reduce((a,b)=>a+b,0)); } while(p[4]<5 || p[4]>40);
    const T = pick([20,40,60,80,120,200]), idx = randInt(0,3), mat = mats[idx];
    const precos = {Papel:[0.4,0.5,0.6], 'Plástico':[1.2,1.5,2], Vidro:[0.1,0.2,0.25], Metal:[3,4,5]}, pr = pick(precos[mat]);
    const ton = T*p[idx]/100, rec = Math.round(ton*1000*pr*100)/100;
    const cols = ['#4C7DFF','#12B886','#B23FE0','#FF7A00','#E0A000'], cx = 92, cy = 98, R = 78;
    let s = '', ang = 0;
    const P = a=> [cx + R*Math.sin(a*Math.PI/180), cy - R*Math.cos(a*Math.PI/180)];
    p.forEach((v,i)=>{ const a0 = ang, a1 = ang + v*3.6; ang = a1; const [x0,y0] = P(a0), [x1,y1] = P(a1);
      s += `<path d="M${cx} ${cy} L${_f(x0)} ${_f(y0)} A${R} ${R} 0 ${a1-a0>180?1:0} 1 ${_f(x1)} ${_f(y1)} Z" fill="${cols[i]}" fill-opacity=".8" stroke="var(--white)" stroke-width="1.5"/>`;
      s += `<rect x="192" y="${38+i*26}" width="14" height="14" rx="3" fill="${cols[i]}" fill-opacity=".85"/>` + iqT(212, 50+i*26, `${mats[i]}: ${v}%`, 12, '', 'start'); });
    return {subj:'graficos', topic:'Gráfico de setores', text:`<p>Uma cooperativa de reciclagem recolheu ${T} toneladas de material em um mês. O gráfico mostra como esse total se divide. A cooperativa vende o ${mat.toLowerCase()} por ${iqMoney(pr)} o quilograma.</p>`,
      visual: cvSVG(320, 196, s, 'Gráfico de setores do material recolhido'),
      ask:`Quanto a cooperativa arrecada vendendo todo o ${mat.toLowerCase()} recolhido nesse mês? (1 tonelada = 1 000 kg)`,
      opts: iqMC(rec, [[Math.round(ton*pr*100)/100, 'Faltou converter toneladas em quilogramas (× 1 000): o preço é por quilo.'],[Math.round(T*1000*pr*100)/100, `Usou as ${T} toneladas inteiras; só ${p[idx]}% do material é ${mat.toLowerCase()}.`],[Math.round(ton*100*pr*100)/100, '1 tonelada tem 1 000 kg, não 100 kg.'],[Math.round(p[idx]*1000*pr*100)/100, 'Usou a porcentagem como se fosse a quantidade em toneladas.']], {fmt:iqMoney}),
      steps:[`${mat}: ${p[idx]}% de ${T} t = ${iqNum(ton)} t`, `${iqNum(ton)} t = ${iqNum(ton*1000)} kg`, `${iqNum(ton*1000)} × ${iqMoney(pr)} = ${iqMoney(rec)}`]};
  },
  // unidades: franquia de dados do celular e horas de vídeo
  ()=>{
    const r = pick([[5,'em qualidade baixa'],[10,'em qualidade média'],[12.5,'em qualidade média'],[25,'em alta definição']]), rate = r[0]*60/1000;
    let h, rem, P; do{ h = randInt(4,20); rem = Math.round(h*rate*100)/100; P = pick([10,15,20,25,30,50]); } while(rem > P-1);
    const U = Math.round((P-rem)*100)/100, nome = iqName();
    const H = x=> Math.round(x*100)/100;
    return {subj:'unidades', topic:'Unidades de informação', text:`<p>O plano de celular de ${nome} tem franquia de ${P} GB por mês. Faltando alguns dias para a renovação, o aplicativo da operadora mostra que já foram usados ${iqNum(U)} GB. Assistindo a vídeos ${r[1]}, o aplicativo de vídeos consome ${iqNum(r[0])} MB por minuto.</p>`,
      visual: iqTable(['Informação','Valor'], [['Franquia mensal', P+' GB'], ['Já usado', iqNum(U)+' GB'], ['Consumo do vídeo', iqNum(r[0])+' MB/min']]),
      ask:'Considerando 1 GB = 1 000 MB, quantas horas de vídeo ainda podem ser assistidas sem passar da franquia?',
      opts: iqMC(h, [[H(P*1000/r[0]/60), 'Usou a franquia inteira; falta descontar o que já foi usado.'],[h*60, 'Esse resultado está em minutos; divida por 60 para ter horas.'],[H(rem*100/r[0]/60), 'Erro de conversão: 1 GB = 1 000 MB, não 100 MB.'],[H(U*1000/r[0]/60), 'Fez a conta com o que já foi usado, e não com o que sobrou.']], {fmt:v=>iqNum(v)+' h'}),
      steps:[`Sobra: ${P} − ${iqNum(U)} = ${iqNum(rem)} GB = ${iqNum(rem*1000)} MB`, `Minutos: ${iqNum(rem*1000)} ÷ ${iqNum(r[0])} = ${iqNum(h*60)} min`, `Horas: ${iqNum(h*60)} ÷ 60 = ${h} h`]};
  },
  // área: piso de um quarto e caixas de porcelanato
  ()=>{
    const s = pick([40,50,60]), nC = randInt(6,12), nL = randInt(5,10), C = Math.round(nC*s)/100, L = Math.round(nL*s)/100, cnt = nC*nL;
    let k; do{ k = pick([6,8,10,12,15]); } while(cnt%k===0);
    const cx = Math.ceil(cnt/k), nome = iqName(), aP = Math.round(s*s/100)/100;
    const sc = Math.min(230/C, 130/L), w = C*sc, hh = L*sc, t = s/100*sc;
    const vis = cvSVG(320, hh+56, `<rect x="40" y="16" width="${_f(w)}" height="${_f(hh)}" class="geo-face side"/><rect x="40" y="16" width="${_f(t)}" height="${_f(t)}" class="geo-face top"/>${iqT(40+w/2, hh+34, iqNum(C)+' m', 12, 'geo-lbl-h')}${iqT(46+w, 16+hh/2+4, iqNum(L)+' m', 12, 'geo-lbl-h', 'start')}${iqT(40+t+6, 16+t/2+4, `peça ${s} cm × ${s} cm`, 10.5, 'iq-tick', 'start')}`, 'Planta do quarto');
    return {subj:'geometria', topic:'Área', text:`<p>${nome} vai trocar o piso de um quarto retangular de ${iqNum(C)} m por ${iqNum(L)} m. Serão usadas peças quadradas de porcelanato de ${s} cm de lado, encaixadas sem espaço entre elas e sem cortes (as medidas do quarto são múltiplas do lado da peça). O porcelanato é vendido apenas em caixas fechadas com ${k} peças.</p>`,
      visual: vis,
      ask:'Qual é a quantidade mínima de caixas que deve ser comprada?',
      opts: iqMC(cx, [[Math.floor(cnt/k), 'Arredondou para baixo: faltariam peças, e as caixas não são vendidas abertas.'],[cnt, 'Esse é o número de peças, não de caixas.'],[Math.ceil(C*L/k), `Dividiu a área em m² pelas peças da caixa, mas cada peça cobre só ${iqNum(aP)} m².`],[Math.ceil(C*L/(s/100)/k), 'Dividiu a área pelo lado da peça; o certo é dividir pela área da peça.']], {fmt:v=>String(v)}),
      steps:[`Peças no comprimento: ${iqNum(C)} m ÷ ${iqNum(s/100)} m = ${nC}; na largura: ${iqNum(L)} ÷ ${iqNum(s/100)} = ${nL}`, `Total de peças: ${nC} × ${nL} = ${cnt}`, `${cnt} ÷ ${k} = ${iqNum(Math.floor(cnt/k))} e sobra ${cnt%k} → é preciso mais uma caixa: ${cx} caixas`]};
  },
  // volume do cilindro: tempo para encher uma cisterna
  ()=>{
    let D, r, Hc, Lt, Q, t;
    for(;;){
      D = pick([1.6,2,2.4,3]); r = D/2; Hc = pick([1,1.5,2,2.5]); Lt = Math.round(3*r*r*Hc*1000);
      const qs = [20,24,25,30,32,40,48,50,60,80,100,120].filter(q=>{ const x = Lt/(60*q); return x>=1 && x<=16 && Math.abs(x*2-Math.round(x*2))<1e-9; });
      if(qs.length){ Q = pick(qs); t = Lt/(60*Q); break; }
    }
    const H = x=> Math.round(x*100)/100;
    const vis = cvSVG(320, 176, `<path d="M90 40 L90 148 A70 16 0 0 0 230 148 L230 40" class="geo-face front"/><path d="M90 148 A70 16 0 0 1 230 148" class="geo-hidden"/><ellipse cx="160" cy="40" rx="70" ry="16" class="geo-face top"/>${cvL(90,40,230,40,'geo-radius')}${iqT(160,34,`diâmetro ${iqNum(D)} m`,11.5,'geo-lbl-h')}${cvL(248,40,248,148,'geo-height')}${iqT(254,98,iqNum(Hc)+' m',12,'geo-lbl-h','start')}`, 'Cisterna cilíndrica');
    return {subj:'espacial', topic:'Volume do cilindro', text:`<p>Uma escola rural instalou uma cisterna em forma de cilindro reto, com ${iqNum(D)} m de diâmetro interno e ${iqNum(Hc)} m de altura, para guardar água. Uma bomba enche a cisterna, vazia, com vazão constante de ${Q} litros por minuto.</p>`,
      visual: vis,
      ask:'Use π = 3 e 1 m³ = 1 000 L. Em quantas horas a cisterna ficará cheia?',
      opts: iqMC(t, [[H(4*t), 'Usou o diâmetro no lugar do raio: o raio é a metade do diâmetro.'],[H(3*r*Hc*1000/(60*Q)), 'Esqueceu de elevar o raio ao quadrado no volume (π · r² · h).'],[H(Lt/Q), 'Esse é o tempo em minutos; divida por 60.'],[H(2*3*r*Hc*1000/(60*Q)), 'Usou a área lateral (2 · π · r · h), que não é volume.']], {fmt:v=>iqNum(v)+' h', step:0.5}),
      steps:[`Raio: ${iqNum(D)} ÷ 2 = ${iqNum(r)} m`, `V = π · r² · h = 3 × ${iqNum(r*r)} × ${iqNum(Hc)} = ${iqNum(Lt/1000)} m³ = ${iqNum(Lt)} L`, `Tempo: ${iqNum(Lt)} ÷ ${Q} = ${iqNum(Lt/Q)} min = ${iqNum(t)} h`]};
  },
  // combinatória: montar o lanche com bebida opcional
  ()=>{
    const a = randInt(2,4), b = randInt(3,5), c = randInt(2,4);
    const paes = shuffle(['Pão francês','Pão de forma','Pão integral','Pão australiano','Ciabatta']).slice(0,a);
    const rech = shuffle(['Frango','Queijo branco','Presunto e queijo','Atum','Ovo','Carne desfiada','Legumes']).slice(0,b);
    const beb = shuffle(['Suco de laranja','Suco de uva','Água de coco','Chá gelado','Achocolatado']).slice(0,c);
    const tot = a*b*(c+1);
    return {subj:'combinatoria', topic:'Princípio multiplicativo', text:`<p>Na cantina de uma escola, o aluno monta o lanche escolhendo exatamente um tipo de pão e um recheio. A bebida é opcional: ele pode escolher uma das bebidas do cardápio ou não pegar nenhuma.</p>`,
      visual: iqCards([{t:'Pães', lines:paes}, {t:'Recheios', lines:rech}, {t:'Bebidas (opcional)', lines:beb}]),
      ask:'Quantos pedidos diferentes podem ser feitos?',
      opts: iqMC(tot, [[a*b*c, 'Esqueceu a opção de não pegar bebida: são '+(c+1)+' escolhas para a bebida.'],[a*b*c+1, 'A opção "sem bebida" vale para cada combinação de pão e recheio, não só uma vez.'],[a+b+c+1, 'As escolhas são feitas em sequência: multiplique, não some.'],[a*b+c+1, 'A bebida também se combina com cada lanche: multiplique as três escolhas.']], {fmt:v=>String(v)}),
      steps:[`Pão: ${a} opções · Recheio: ${b} opções · Bebida: ${c} + 1 (sem bebida) = ${c+1} opções`, `Total: ${a} × ${b} × ${c+1} = ${tot}`]};
  },
  // inequação: quando um plano de aluguel de carro passa a compensar
  ()=>{
    let FA, D, vA, dv, x;
    do{ FA = pick([60,70,80,90,100]); D = pick([30,40,45,50,60,80]); vA = pick([1.2,1.5,1.8,2,2.4]); dv = pick([0.2,0.25,0.3,0.4,0.5,0.6]); x = D*100/Math.round(dv*100); } while(x!==Math.round(x) || vA-dv<0.5 || x<40 || x>400);
    const FB = FA + D, vB = Math.round((vA-dv)*100)/100;
    return {subj:'inequacoes', topic:'Inequação do 1º grau', text:`<p>Uma pessoa vai alugar um carro por um dia e pesquisou duas locadoras. Cada uma cobra um valor fixo pela diária mais um valor por quilômetro rodado.</p>`,
      visual: iqTable(['Locadora','Diária fixa','Por km rodado'], [['A', iqMoney(FA), iqMoney(vA)], ['B', iqMoney(FB), iqMoney(vB)]]),
      ask:'A locadora B fica mais barata que a A quando a distância rodada no dia, em quilômetro, for maior que',
      opts: iqMC(x, [[Math.round(D/vA), 'Dividiu a diferença das diárias pelo preço por km de A; o certo é dividir pela diferença dos preços por km.'],[Math.round(D/vB), 'Dividiu a diferença das diárias pelo preço por km de B; o certo é dividir pela diferença dos preços por km.'],[Math.round((FA+FB)/dv), 'Somou as diárias; o que importa é a diferença entre elas.'],[Math.round(FB/dv), 'Usou a diária inteira de B; compare só a diferença entre as diárias.']], {fmt:v=>v+' km'}),
      steps:[`A: ${iqMoney(FA)} + ${iqMoney(vA)}·x · B: ${iqMoney(FB)} + ${iqMoney(vB)}·x`, `B < A → ${iqMoney(FB)} − ${iqMoney(FA)} < (${iqMoney(vA)} − ${iqMoney(vB)})·x → ${iqMoney(D)} < ${iqMoney(dv)}·x`, `x > ${iqNum(D)} ÷ ${iqNum(dv)} = ${x} km`]};
  },
  // juros simples: conta paga com atraso (multa + juros por dia)
  ()=>{
    const V = pick([120,150,180,200,240,250,300,350,400]), d = randInt(3,25), j = pick([0.1,0.2]), nome = iqName();
    const conta = pick(['de internet','de água','do plano de celular','da academia']);
    const R = x=> Math.round(x*100)/100, tot = R(V*(1 + 0.02 + j/100*d));
    return {subj:'juros', topic:'Juros simples', text:`<p>A conta ${conta} de ${nome}, no valor de ${iqMoney(V)}, foi paga com ${d} dias de atraso. Para pagamentos atrasados, a empresa cobra uma multa de 2% e juros simples de ${iqNum(j)}% por dia de atraso, ambos calculados sobre o valor original da conta.</p>`,
      visual: iqTable(['Item','Regra'], [['Valor da conta', iqMoney(V)], ['Multa (cobrada uma vez)', '2%'], ['Juros por dia de atraso', iqNum(j)+'%'], ['Dias de atraso', d]]),
      ask:'Qual foi o valor pago?',
      opts: iqMC(tot, [[R(V*1.02), 'Faltaram os juros dos dias de atraso.'],[R(V*(1+j/100*d)), 'Faltou a multa de 2%.'],[R(V*(1+0.02*d+j/100*d)), 'A multa é cobrada uma vez só, não por dia.'],[R(V*(1+0.02+j/10*d)), `Errou a vírgula: ${iqNum(j)}% = ${iqNum(j/100,3)}, não ${iqNum(j/10)}.`]], {fmt:iqMoney}),
      steps:[`Multa: 2% de ${iqMoney(V)} = ${iqMoney(R(V*0.02))}`, `Juros: ${iqNum(j)}% × ${d} dias = ${iqNum(R(j*d))}% de ${iqMoney(V)} = ${iqMoney(R(V*j/100*d))}`, `Total: ${iqMoney(V)} + ${iqMoney(R(V*0.02))} + ${iqMoney(R(V*j/100*d))} = ${iqMoney(tot)}`]};
  },
  // regra de três inversa: mais trabalhadores, menos tempo
  ()=>{
    const c = pick([['pedreiros','dias','construir o muro de uma escola'],['máquinas colheitadeiras','dias','colher toda a plantação de uma fazenda'],['funcionários','horas','separar o material de um galpão de reciclagem'],['torneiras iguais','minutos','encher o tanque de uma lavanderia']]);
    let P, Q, D; do{ P = randInt(2,8); Q = randInt(2,12); D = randInt(4,30); } while(P===Q || (P*D)%Q || (D*Q)%P);
    const x = P*D/Q;
    return {subj:'regra3', topic:'Regra de três inversa', text:`<p>Trabalhando no mesmo ritmo, ${P} ${c[0]} levam ${D} ${c[1]} para ${c[2]}. ${Q>P ? 'Para adiantar o serviço' : 'Por causa de um imprevisto'}, a tarefa será feita por ${Q} ${c[0]}, todos com o mesmo ritmo dos anteriores.</p>`, visual:'',
      ask:`Em quantos ${c[1]} a tarefa ficará pronta?`,
      opts: iqMC(x, [[D*Q/P, `Usou proporção direta, mas as grandezas são inversas: com ${Q>P?'mais':'menos'} ${c[0]}, o tempo ${Q>P?'diminui':'aumenta'}.`],[P*D, `Esse é o total de trabalho (${c[0]} × ${c[1]}); falta dividir por ${Q}.`],[D-(Q-P), `Somar ou subtrair a diferença de ${c[0]} não mantém a proporção.`]], {fmt:v=>iqNum(v)+' '+c[1]}),
      steps:[`Grandezas inversamente proporcionais: ${c[0]} × tempo é constante.`, `${P} × ${D} = ${P*D}`, `${P*D} ÷ ${Q} = ${iqNum(x)} ${c[1]}`]};
  },
  // descontos: "leve 3, pague 2" x desconto percentual
  ()=>{
    const prod = pick(['pacote de biscoito','iogurte','sabonete','lata de molho de tomate','caderno']), q = pick([6,9,12]), p = pick([4.5,6,7.5,8,9,12,15]), x = pick([20,25,30,40,50]);
    const R = v=> Math.round(v*100)/100, A = R(q/3*2*p), B = R(q*p*(100-x)/100), eco = R(Math.abs(A-B)), best = A<B ? 'X' : 'Y', nome = iqName();
    return {subj:'descontos', topic:'Descontos e promoções', text:`<p>Dois mercados vendem o mesmo ${prod} pelo mesmo preço, ${iqMoney(p)} a unidade, mas com promoções diferentes. ${nome} vai comprar ${q} unidades.</p>`,
      visual: iqCards([{t:'Mercado X', lines:['Leve 3, pague 2', `${iqMoney(p)} a unidade`]}, {t:'Mercado Y', lines:[`${x}% de desconto em cada unidade`, `${iqMoney(p)} a unidade`]}]),
      ask:'Escolhendo o mercado mais vantajoso, quanto será economizado em relação ao que seria pago no outro?',
      opts: iqMC(eco, [[Math.min(A,B), 'Esse é o valor pago no mercado mais vantajoso, não a economia.'],[R(q*p-Math.min(A,B)), 'Essa é a economia em relação ao preço sem promoção, e não em relação ao outro mercado.'],[R(Math.abs(2*p/3-p*(100-x)/100)), `Essa é a diferença por unidade; ${nome} compra ${q} unidades.`],[Math.max(A,B), 'Esse é o valor pago no mercado menos vantajoso.']], {fmt:iqMoney}),
      steps:[`Mercado X: em ${q} unidades, paga ${q/3*2} → ${q/3*2} × ${iqMoney(p)} = ${iqMoney(A)}`, `Mercado Y: ${q} × ${iqMoney(p)} × ${iqNum((100-x)/100)} = ${iqMoney(B)}`, `Mais vantajoso: Mercado ${best}. Economia: ${iqMoney(Math.max(A,B))} − ${iqMoney(Math.min(A,B))} = ${iqMoney(eco)}`]};
  },
  // PA: treino de corrida que aumenta toda semana
  ()=>{
    const a = pick([3,4,5,6]), r = pick([0.5,1,1.5]), n = randInt(8,16), X = Math.round((a + (n-1)*r)*100)/100, nome = iqName();
    return {subj:'pa', topic:'Progressão aritmética', text:`<p>${nome} está treinando para uma corrida de rua. No treino longo da 1ª semana, correu ${iqNum(a)} km e, a cada semana seguinte, o treino longo aumenta ${iqNum(r)} km em relação ao da semana anterior.</p>`,
      visual: iqTable(['Semana','1ª','2ª','3ª','…'], [['Treino longo', iqNum(a)+' km', iqNum(a+r)+' km', iqNum(a+2*r)+' km', '…']]),
      ask:`Em que semana o treino longo terá ${iqNum(X)} km?`,
      opts: iqMC(n, [[n-1, `Esqueceu de somar 1: na 1ª semana ainda não houve aumento, então são ${n-1} aumentos até a ${n}ª semana.`],[Math.round(X/r), `Dividiu a distância final pelo aumento, sem descontar os ${iqNum(a)} km iniciais.`],[n+1, 'Contou um aumento a mais: aₙ = a₁ + (n − 1)·r.'],[Math.round(X/a), 'A distância não é multiplicada a cada semana: ela cresce sempre a mesma quantidade.']], {fmt:v=>v+'ª semana'}),
      steps:[`PA com a₁ = ${iqNum(a)} e r = ${iqNum(r)}: aₙ = ${iqNum(a)} + (n − 1) × ${iqNum(r)}`, `${iqNum(X)} = ${iqNum(a)} + (n − 1) × ${iqNum(r)} → n − 1 = ${iqNum(X-a)} ÷ ${iqNum(r)} = ${n-1}`, `n = ${n}ª semana`]};
  },
  // dispersão: maior amplitude térmica numa tabela
  ()=>{
    const cid = shuffle(['Curitiba','Porto Alegre','São Joaquim','Brasília','Cuiabá','Goiânia','Belo Horizonte','Campos do Jordão','Teresina','Campo Grande']).slice(0,5);
    let mn, mx, amp, best, hot, cold;
    for(;;){
      mn = cid.map(()=> randInt(-4,20)); mx = mn.map(v=> v + randInt(5,17)); amp = mx.map((v,i)=> v-mn[i]);
      const A = Math.max(...amp); if(amp.filter(v=>v===A).length>1) continue;
      best = amp.indexOf(A); hot = mx.indexOf(Math.max(...mx)); cold = mn.indexOf(Math.min(...mn));
      if(hot!==best && cold!==best && hot!==cold && mx.filter(v=>v===mx[hot]).length===1 && mn.filter(v=>v===mn[cold]).length===1) break;
    }
    const opts = shuffle(cid.map((c,i)=>({label:c, ok:i===best, why: i===hot ? `${c} teve a maior temperatura máxima, mas amplitude é máxima − mínima: lá foi ${amp[i]} °C.` : i===cold ? `${c} teve a menor temperatura mínima, mas amplitude é máxima − mínima: lá foi ${amp[i]} °C.` : `Em ${c}, a amplitude foi ${nm(mx[i])} − ${np(mn[i])} = ${amp[i]} °C, menor que ${amp[best]} °C.`})));
    return {subj:'dispersao', topic:'Amplitude', text:`<p>Amplitude térmica é a diferença entre a temperatura máxima e a temperatura mínima registradas em um mesmo dia. A tabela mostra as temperaturas de algumas cidades em um dia de inverno.</p>`,
      visual: iqTable(['Cidade','Mínima','Máxima'], cid.map((c,i)=>[c, nm(mn[i])+' °C', nm(mx[i])+' °C'])),
      ask:'Qual cidade teve a maior amplitude térmica nesse dia?', opts,
      steps:[`Amplitude = máxima − mínima: ${cid.map((c,i)=>`${c}: ${nm(mx[i])} − ${np(mn[i])} = ${amp[i]} °C`).join(' · ')}`, `A maior é a de ${cid[best]}: ${amp[best]} °C.`]};
  },
  // MMC: próximo horário em que dois ônibus saem juntos
  ()=>{
    const ints = [10,12,15,18,20,24,25,30,40,45];
    let a, b, L, g; do{ a = pick(ints); b = pick(ints); g = gcd(a,b); L = a*b/g; } while(a>=b || g===1 || b%a===0 || L>240 || a*b>900);
    const h0 = pick([5,6,7]), m0 = pick([0,15,30]), linha = pick([['ônibus','linhas','saem do terminal rodoviário','ônibus'],['trens','linhas de trem','partem da estação central','trem'],['barcos','travessias','saem do porto','barco']]);
    const hora = v=>{ const t = h0*60 + m0 + v, hh = Math.floor(t/60)%24, mm = t%60; return `${hh}h${String(mm).padStart(2,'0')}`; };
    return {subj:'mmcmdc', topic:'MMC', text:`<p>Os ${linha[0]} de duas ${linha[1]} ${linha[2]} em intervalos regulares: os da primeira a cada ${a} minutos e os da segunda a cada ${b} minutos. Às ${hora(0)}, saiu um ${linha[3]} de cada, ao mesmo tempo.</p>`, visual:'',
      ask:'A próxima vez em que sairão juntos novamente será às',
      opts: iqMC(L, [[a*b, `Multiplicou os intervalos, mas ${a} e ${b} têm fatores em comum: o primeiro encontro é no MMC.`],[g, 'Esse é o MDC; o encontro acontece num múltiplo comum dos dois intervalos.'],[a+b, 'Somar os intervalos não dá um múltiplo de cada um.'],[2*L, 'Essa é a segunda vez que saem juntos depois das '+hora(0)+'.']], {fmt:hora}),
      steps:[`Múltiplos de ${a}: ${[1,2,3,4,5,6].map(k=>a*k).join(', ')}, …`, `Múltiplos de ${b}: ${[1,2,3,4].map(k=>b*k).join(', ')}, …`, `MMC(${a}, ${b}) = ${L} min → ${hora(0)} + ${L} min = ${hora(L)}`]};
  },
  // frações: marcador de combustível e reserva
  ()=>{
    const fr = pick([[3,'3/8'],[4,'1/2'],[5,'5/8'],[6,'3/4'],[7,'7/8']]), e = fr[0], T = pick([40,48,56,64]), c = pick([9,10,11,12,13,14]);
    const lit = (e-1)*T/8, km = lit*c;
    const cx = 160, cy = 120, Rr = 90, ang = 180 - e/8*180, Pt = (a, r)=> [cx + r*Math.cos(a*Math.PI/180), cy - r*Math.sin(a*Math.PI/180)];
    let s = `<path d="${arcPath(cx, cy, Rr, 0, 180)}" fill="none" class="geo-face"/><path d="${arcPath(cx, cy, Rr, 157.5, 180)}" fill="none" stroke="#F06595" stroke-width="7"/>`;
    [[0,'0'],[2,'1/4'],[4,'1/2'],[6,'3/4'],[8,'1']].forEach(([k,l])=>{ const a = 180 - k/8*180, [x1,y1] = Pt(a, Rr-8), [x2,y2] = Pt(a, Rr+4), [tx,ty] = Pt(a, Rr+16); s += cvL(x1,y1,x2,y2,'iq-axis') + iqT(tx, ty+4, l, 11, 'iq-tick'); });
    const [nx,ny] = Pt(ang, Rr-18);
    s += `<line x1="${cx}" y1="${cy}" x2="${_f(nx)}" y2="${_f(ny)}" stroke="#FF8A4C" stroke-width="3.5" stroke-linecap="round"/>` + cvDot(cx, cy, 5) + iqT(cx-Rr+26, cy-6, 'reserva', 10, 'iq-tick', 'start') + iqT(cx, cy+22, 'marcador do tanque', 11, 'iq-tick');
    return {subj:'fracoes', topic:'Frações', text:`<p>O tanque de combustível de um carro tem capacidade de ${T} litros. O marcador indica que o tanque está com ${fr[1]} da capacidade. A luz da reserva acende quando resta 1/8 do tanque, e o carro percorre ${c} km com cada litro.</p>`,
      visual: cvSVG(320, 150, s, 'Marcador de combustível'),
      ask:'Quantos quilômetros o carro pode rodar até a luz da reserva acender?',
      opts: iqMC(km, [[e*T/8*c, 'Não descontou a reserva: a luz acende quando ainda resta 1/8 do tanque.'],[(e+1)*T/8*c, 'A reserva é descontada, não somada.'],[(8-e)*T/8*c, 'Calculou com a parte vazia do tanque.'],[lit, 'Esse é o volume em litros; multiplique pelo consumo para ter quilômetros.']], {fmt:v=>iqNum(v)+' km'}),
      steps:[`Combustível até a reserva: ${fr[1]} − 1/8 = ${e}/8 − 1/8 = ${e-1}/8 do tanque`, `${e-1}/8 de ${T} L = ${iqNum(lit)} L`, `${iqNum(lit)} L × ${c} km/L = ${iqNum(km)} km`]};
  },
  // fórmula: IMC e quanto perder para chegar à faixa normal
  ()=>{
    const h = pick([1.5,1.6,1.7,1.8,1.9]), h2 = Math.round(h*h*100)/100, lim = Math.round(25*h2*100)/100;
    let w; do{ w = Math.round(lim) + randInt(3,12); } while(w/h2 >= 30 || w-lim<1);
    const R = x=> Math.round(x*100)/100, ans = R(w-lim), imc = Math.round(w/h2*10)/10, nome = iqName();
    return {subj:'expressoes', topic:'Fórmula (IMC)', text:`<p>O índice de massa corporal (IMC) de um adulto é calculado por IMC = m ÷ h², com a massa m em quilograma e a altura h em metro. A tabela mostra a classificação usada por um posto de saúde. ${nome} tem ${iqNum(h,2)} m de altura e ${w} kg.</p>`,
      visual: iqTable(['IMC','Classificação'], [['menor que 18,5','Abaixo do peso'], ['de 18,5 a menos de 25','Peso normal'], ['de 25 a menos de 30','Sobrepeso'], ['30 ou mais','Obesidade']]),
      ask:'Mantendo a altura, quantos quilogramas precisam ser perdidos, no mínimo, para o IMC ficar igual a 25?',
      opts: iqMC(ans, [[R(w-18.5*h2), 'Usou o limite 18,5 (abaixo do peso); a pergunta pede IMC igual a 25.'],[R(w/h2-25), 'Essa é a diferença no IMC, não em quilogramas.'],[R(w-25*h), 'Esqueceu de elevar a altura ao quadrado.'],[lim, 'Essa é a massa que dá IMC 25; a pergunta é quanto precisa perder.']], {fmt:v=>iqNum(v)+' kg'}),
      steps:[`IMC atual: ${w} ÷ ${iqNum(h2)} ≈ ${iqNum(imc)} (sobrepeso)`, `Massa com IMC 25: m = 25 × ${iqNum(h,2)}² = 25 × ${iqNum(h2)} = ${iqNum(lim)} kg`, `Perder: ${w} − ${iqNum(lim)} = ${iqNum(ans)} kg`]};
  }
);
