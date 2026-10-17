/* =========================================================
   QUESTÕES DE INTERPRETAÇÃO NO ESTILO DE CADA PROVA
   Questões ORIGINAIS (não são cópias de provas), escritas no estilo de cada exame:
   ENEM (situação do dia a dia, tabela/gráfico, 5 alternativas), ETEC (figura com medidas,
   gráfico de barras), Fuvest (gráficos e funções), Unicamp (contexto com fórmula, 4 alternativas),
   Unesp (cotidiano com gráfico/tabela) e OBMEP (raciocínio e padrões).
   Cada modelo sorteia números, nomes e situações, então o simulado nunca se repete.

   Cada gerador devolve:
     {subj, topic, text, visual, ask, opts:[{label, ok, why}], steps:[...]}
   - subj: assunto do app (entra no progresso)
   - text/visual: enunciado e figura/tabela (HTML)
   - opts: alternativas; "why" explica o erro de quem marcou aquela alternativa
   ========================================================= */

/* ---------- ferramentas ---------- */
const IQ_NAMES = ['Ana','Bruno','Carla','Diego','Eduarda','Felipe','Gabriela','Heitor','Isabela','João','Larissa','Mateus','Natália','Otávio','Paula','Rafael','Sofia','Thiago','Vitória','Yuri'];
function iqName(){ return pick(IQ_NAMES); }
function iqMoney(v){ return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function iqNum(v, dec){ return v.toLocaleString('pt-BR', dec===undefined ? {maximumFractionDigits:2} : {minimumFractionDigits:dec, maximumFractionDigits:dec}); }
/* monta as alternativas: a certa + erros comuns (com o porquê), sem repetir; completa com valores
   próximos se faltar. o.n = quantas (5 ou 4); o.fmt formata; o.sort ordena do menor pro maior */
function iqMC(correct, wrongs, o){
  o = Object.assign({n:5, fmt:v=>String(v), sort:true}, o||{});
  const out = [{v:correct, label:o.fmt(correct), ok:true}], seen = new Set([out[0].label]);
  (wrongs||[]).forEach(([v, why])=>{
    if(out.length >= o.n || v===null || v===undefined || (typeof v==='number' && (!isFinite(v) || (o.positive!==false && v<=0)))) return;
    const label = o.fmt(v); if(seen.has(label)) return;
    seen.add(label); out.push({v, label, ok:false, why});
  });
  if(typeof correct==='number'){
    const step = o.step || (Math.abs(correct) >= 10 ? Math.max(1, Math.round(Math.abs(correct)*0.15)) : 1);
    for(let k=1; out.length<o.n && k<40; k++){
      [correct + k*step, correct - k*step].forEach(v=>{
        if(out.length>=o.n || (o.positive!==false && v<=0)) return;
        const label = o.fmt(v); if(seen.has(label)) return;
        seen.add(label); out.push({v, label, ok:false, why:'Esse valor não sai de nenhuma conta do problema. Releia o enunciado e veja os passos.'});
      });
    }
  }
  if(o.sort && typeof correct==='number') out.sort((a,b)=>a.v-b.v); else if(o.shuffle!==false) shuffle(out);
  return out;
}
/* tabela simples */
function iqTable(head, rows, cls){ return `<table class="mini-table iq-table ${cls||''}"><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table>`; }
/* cartões coloridos (como rótulos de produtos) */
function iqCards(items){ const cols = ['#4C7DFF','#12B886','#B23FE0','#FF7A00','#E0A000','#F06595']; return `<div class="iq-cards">${items.map((it,i)=>`<div style="--c:${cols[i%cols.length]}"><b>${it.t}</b>${it.lines.map(l=>`<span>${l}</span>`).join('')}</div>`).join('')}</div>`; }
/* gráfico de colunas (vertical) ou de barras (horizontal) */
function iqBarsSVG(labels, vals, o){
  o = o || {};
  const W = 320, max = Math.max(...vals) * 1.15;
  if(o.horizontal){
    const rowH = 26, H = 30 + labels.length*rowH + 10, x0 = 54, wMax = W - x0 - 20;
    let s = o.title ? cvT(W/2, 16, o.title).replace('class="geo-lbl', 'font-size="12" class="geo-lbl') : '';
    labels.forEach((l,i)=>{ const y = 26 + i*rowH, w = vals[i]/max*wMax;
      s += cvT(x0-6, y+15, l, '', 'end').replace('class="geo-lbl', 'font-size="12" class="geo-lbl');
      s += `<rect x="${x0}" y="${y}" width="${_f(w)}" height="${rowH-8}" rx="3" class="geo-face top"/>` + cvT(x0+w-4, y+14, iqNum(vals[i]), '', 'end').replace('class="geo-lbl', 'font-size="11.5" class="geo-lbl'); });
    return cvSVG(W, H, s, o.title || 'Gráfico de barras');
  }
  const H = 210, y0 = 170, x0 = 30, n = labels.length, bw = (W - x0 - 14)/n;
  let s = o.title ? cvT(W/2, 16, o.title).replace('class="geo-lbl', 'font-size="12" class="geo-lbl') : '';
  s += cvL(x0, y0, W-8, y0) + cvL(x0, 28, x0, y0);
  vals.forEach((v,i)=>{ const hh = v/max*(y0-34), x = x0 + i*bw + bw*0.18;
    s += `<rect x="${_f(x)}" y="${_f(y0-hh)}" width="${_f(bw*0.64)}" height="${_f(hh)}" rx="3" class="geo-face top"/>`;
    s += cvT(x+bw*0.32, y0-hh-5, iqNum(v)).replace('class="geo-lbl', 'font-size="11.5" class="geo-lbl');
    s += cvT(x+bw*0.32, y0+15, labels[i]).replace('class="geo-lbl', 'font-size="10.5" class="geo-lbl'); });
  return cvSVG(W, H, s, o.title || 'Gráfico de colunas');
}
/* gráfico de linha simples (pontos ligados) com rótulos nos eixos */
function iqLineSVG(xs, ys, o){
  o = o || {};
  const W = 320, H = 200, x0 = 36, y0 = 166, xm = W-14, ym = 24, maxY = Math.max(...ys)*1.12, minY = Math.min(0, ...ys);
  const X = i=> x0 + i*(xm-x0)/(xs.length-1), Y = v=> y0 - (v-minY)/(maxY-minY)*(y0-ym);
  let s = cvL(x0, y0, xm, y0) + cvL(x0, ym-6, x0, y0);
  s += `<polyline points="${ys.map((v,i)=>`${_f(X(i))},${_f(Y(v))}`).join(' ')}" fill="none" stroke="#FF8A4C" stroke-width="2.5"/>`;
  ys.forEach((v,i)=>{ s += cvDot(X(i), Y(v), 3.5) + cvT(X(i), y0+15, xs[i]).replace('class="geo-lbl', 'font-size="10.5" class="geo-lbl'); if(o.values) s += cvT(X(i), Y(v)-8, iqNum(v)).replace('class="geo-lbl', 'font-size="10.5" class="geo-lbl'); });
  if(o.yLabel) s += cvT(x0-4, ym-10, o.yLabel, '', 'start').replace('class="geo-lbl', 'font-size="10.5" class="geo-lbl');
  if(o.xLabel) s += cvT(xm, y0+30, o.xLabel, '', 'end').replace('class="geo-lbl', 'font-size="10.5" class="geo-lbl');
  return cvSVG(W, H + (o.xLabel?10:0), s, o.title || 'Gráfico de linha');
}

/* =================== ENEM =================== */
const IQ_ENEM = [
  // custo por quilo (melhor compra)
  ()=>{
    const prod = pick([['arroz','kg'],['feijão','kg'],['café','kg'],['sabão em pó','kg']]);
    const marcas = shuffle(['Marca Sol','Marca Lua','Marca Rio','Marca Mar','Marca Céu']).slice(0,4);
    let packs, best, bestIdx, cheapIdx;
    do{
      packs = marcas.map(m=>{ const kg = pick([0.5,1,2,3,5]); const perKg = randInt(60,140)/10; return {m, kg, price: Math.round(kg*perKg*100)/100}; });
      const per = packs.map(p=>p.price/p.kg); best = Math.min(...per); bestIdx = per.indexOf(best);
      cheapIdx = packs.map(p=>p.price).indexOf(Math.min(...packs.map(p=>p.price)));
    } while(packs.map(p=>p.price/p.kg).filter(v=>Math.abs(v-best)<0.05).length>1 || cheapIdx===bestIdx);
    const names = packs.map(p=>p.m);
    const opts = packs.map((p,i)=>({label:p.m, ok:i===bestIdx, why: i===cheapIdx ? 'Essa é a embalagem mais barata, mas não a mais econômica: o preço precisa ser comparado por quilo.' : `Por quilo, ${p.m} sai a ${iqMoney(p.price/p.kg)}, mais caro que ${packs[bestIdx].m}.`}));
    opts.push({label:'Todas custam o mesmo por quilo.', ok:false, why:'Dividindo cada preço pela quantidade, os valores por quilo são diferentes.'});
    return {subj:'regra3', topic:'Proporção', text:`<p>Num supermercado, o ${prod[0]} é vendido em embalagens de tamanhos diferentes. Os preços estão no quadro.</p>`,
      visual: iqCards(packs.map(p=>({t:p.m, lines:[`Embalagem de ${iqNum(p.kg)} ${prod[1]}`, iqMoney(p.price)]}))),
      ask:`Uma pessoa quer comprar o ${prod[0]} que sai mais barato por quilo. Qual marca ela deve escolher?`,
      opts, steps:[`Divida o preço pela quantidade: ${packs.map(p=>`${p.m}: ${iqMoney(p.price)} ÷ ${iqNum(p.kg)} = ${iqMoney(p.price/p.kg)}`).join(' · ')}`, `O menor preço por quilo é o da ${packs[bestIdx].m}.`]};
  },
  // diferença de tempos (decimais)
  ()=>{
    const ev = pick([['natação de 50 metros livre', 21, 22],['prova de 100 metros rasos', 9, 10],['prova de 200 metros rasos', 19, 20]]);
    const ref = ev[2], rec = Math.round((ev[1] + randInt(30,95)/100)*100)/100, d = Math.round((ref-rec)*100)/100;
    return {subj:'decimais', topic:'Números decimais', text:`<p>Na ${ev[0]}, completar a prova abaixo de ${iqNum(ref,2)} segundos é considerado uma marca de referência. Um atleta estabeleceu o recorde de uma competição com o tempo de ${iqNum(rec,2)} segundos.</p>`, visual:'',
      ask:'Qual é a diferença, em segundo, entre a marca de referência e o tempo do recorde?',
      opts: iqMC(d, [[Math.round((d+0.1)*100)/100,'Erro no "empresta 1" da subtração dos décimos.'],[Math.round((d-0.1)*100)/100,'Erro na subtração dos décimos.'],[Math.round((d+1)*100)/100,'Erro na parte inteira: 10 − 9 = 1, mas um inteiro foi emprestado pros décimos.'],[Math.round((ref+rec)*100)/100,'Isso é a soma dos tempos, não a diferença.']], {fmt:v=>iqNum(v,2), step:0.1}),
      steps:[`Alinhe pela vírgula: ${iqNum(ref,2)} − ${iqNum(rec,2)}`, `= ${iqNum(d,2)} segundo`]};
  },
  // conta de água/luz: taxa fixa + consumo
  ()=>{
    const fixa = pick([12,15,18,20,25]), tar = pick([0.6,0.75,0.8,0.9,1.2]), c = randInt(8,20)*10, tot = Math.round((fixa + tar*c)*100)/100;
    return {subj:'func1grau', topic:'Função afim', text:`<p>Uma companhia de energia cobra, todo mês, uma taxa fixa de ${iqMoney(fixa)} mais ${iqMoney(tar)} por kWh consumido. Em um mês, a família de ${iqName()} consumiu ${c} kWh.</p>`,
      visual: iqTable(['Item','Valor'], [['Taxa fixa', iqMoney(fixa)], ['Preço do kWh', iqMoney(tar)], ['Consumo do mês', `${c} kWh`]]),
      ask:'Qual foi o valor da conta desse mês?',
      opts: iqMC(tot, [[Math.round(tar*c*100)/100,'Faltou somar a taxa fixa.'],[Math.round((fixa*c)*100)/100,'A taxa fixa é cobrada uma vez só, não por kWh.'],[Math.round((fixa+tar)*c*100)/100,'Somou a taxa ao preço do kWh antes de multiplicar: a taxa não depende do consumo.'],[Math.round((fixa+tar*c/10)*100)/100,'Erro na multiplicação do consumo.']], {fmt:iqMoney}),
      steps:['Valor = taxa fixa + preço do kWh × consumo', `= ${iqMoney(fixa)} + ${iqMoney(tar)} × ${c} = ${iqMoney(fixa)} + ${iqMoney(tar*c)}`, `= ${iqMoney(tot)}`]};
  },
  // escala de mapa
  ()=>{
    const esc = pick([50000,100000,200000,250000,500000]), cm = pick([3,4,5,6,7.5,8]), km = esc*cm/100000;
    return {subj:'unidades', topic:'Escala', text:`<p>Um grupo de ciclistas planeja um passeio entre duas cidades. No mapa usado por eles, de escala 1 : ${esc.toLocaleString('pt-BR')}, a estrada reta que liga as cidades mede ${iqNum(cm)} cm.</p>`,
      visual: mapScaleSVG(Math.round(cm), esc).replace(`${Math.round(cm)} cm no mapa`, `${iqNum(cm)} cm no mapa`),
      ask:'Qual é a distância real, em quilômetro, entre as duas cidades?',
      opts: iqMC(km, [[km*10,'Erro na conversão: de centímetro pra quilômetro se divide por 100 000.'],[km/10,'Erro na conversão: de centímetro pra quilômetro se divide por 100 000.'],[esc*cm/1000,'Isso está em decâmetros, não em quilômetros.'],[km*100,'Converteu centímetro pra metro e chamou de quilômetro.']], {fmt:v=>iqNum(v)}),
      steps:[`Cada cm do mapa vale ${esc.toLocaleString('pt-BR')} cm reais: ${iqNum(cm)} × ${esc.toLocaleString('pt-BR')} = ${(cm*esc).toLocaleString('pt-BR')} cm`, `1 km = 100 000 cm → ${(cm*esc).toLocaleString('pt-BR')} ÷ 100 000 = ${iqNum(km)} km`]};
  },
  // leitura de gráfico de linha: comportamento
  ()=>{
    const kind = pick(['cai','sobe']);
    const xs = ['0','10','20','30','40','50','60'];
    const a = randInt(60,80), b = randInt(25,40);
    const ys = kind==='cai' ? [a,a,a-6,b+10,b,b,b] : [b,b,b+8,a-8,a,a,a];
    const what = pick([['batimentos cardíacos de uma pessoa em repouso que começa a ouvir música calma','batimentos por minuto'],['temperatura de um forno que é ligado','°C'],['nível de ruído numa sala de aula quando o professor pede silêncio','decibéis']]);
    const ysF = what[0].startsWith('temperatura') ? ys.map(v=> kind==='cai' ? v : v*3) : ys;
    const desc = kind==='cai' ? 'diminui a partir de um instante e depois se torna constante' : 'aumenta a partir de um instante e depois se torna constante';
    const opts = shuffle([
      {label: kind==='cai' ? 'diminui até certo instante, a partir do qual se torna constante.' : 'aumenta até certo instante, a partir do qual se torna constante.', ok:true},
      {label:'mantém-se constante durante todo o período.', ok:false, why:'O gráfico tem um trecho inclinado: a grandeza muda no meio do período.'},
      {label: kind==='cai' ? 'é diretamente proporcional ao tempo.' : 'é inversamente proporcional ao tempo.', ok:false, why:'Proporcionalidade exigiria uma reta passando pela origem (direta) ou uma curva que nunca fica constante (inversa).'},
      {label: kind==='cai' ? 'aumenta e depois diminui.' : 'diminui e depois aumenta.', ok:false, why:'Leia o gráfico da esquerda pra direita: ele só muda num sentido.'},
      {label: kind==='cai' ? 'diminui o tempo todo, sem parar.' : 'aumenta o tempo todo, sem parar.', ok:false, why:'No fim do gráfico a linha fica horizontal: a grandeza para de mudar.'},
    ]);
    return {subj:'graficos', topic:'Leitura de gráfico', text:`<p>O gráfico mostra, minuto a minuto, os ${what[0]} (em ${what[1]}).</p>`, visual: iqLineSVG(xs, ysF, {xLabel:'tempo (min)', yLabel:what[1]}),
      ask:'De acordo com o gráfico, a grandeza medida', opts, steps:['Leia da esquerda pra direita: no começo a linha é horizontal (constante).', `Depois ela ${kind==='cai'?'desce':'sobe'} e volta a ficar horizontal: ${desc}.`]};
  },
  // média de uma tabela
  ()=>{
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
    let v, m; do{ v = meses.map(()=> randInt(18,46)*10); m = v.reduce((a,b)=>a+b,0)/6; } while(m!==Math.round(m));
    const sorted = [...v].sort((a,b)=>a-b), med = (sorted[2]+sorted[3])/2;
    return {subj:'estatistica', topic:'Média', text:`<p>Uma pequena loja registrou o número de clientes atendidos em cada mês do primeiro semestre.</p>`, visual: iqBarsSVG(meses, v, {title:'Clientes atendidos por mês'}),
      ask:'Qual foi a média mensal de clientes atendidos nesse semestre?',
      opts: iqMC(m, [[med,'Essa é a mediana (o valor do meio), não a média.'],[(Math.max(...v)+Math.min(...v))/2,'Fez a média só entre o maior e o menor valor.'],[v.reduce((a,b)=>a+b,0)/5,'Dividiu por 5, mas são 6 meses.'],[Math.max(...v),'Esse é o maior valor, não a média.']], {fmt:v=>iqNum(v)}),
      steps:[`Some os 6 meses: ${v.join(' + ')} = ${v.reduce((a,b)=>a+b,0)}`, `Divida por 6: ${v.reduce((a,b)=>a+b,0)} ÷ 6 = ${iqNum(m)}`]};
  },
  // financiamento "sem juros" com taxa extra
  ()=>{
    const preco = pick([18000,24000,30000,36000,40000]), taxa = pick([540,600,720,900,1080,1200]), pc = taxa/preco*100;
    const n = pick([10,12,18,24]);
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Uma moto foi anunciada por ${iqMoney(preco)}, que poderiam ser pagos em ${n} parcelas iguais, "sem juros". Na hora de fechar o negócio, porém, o comprador soube que teria de pagar mais ${iqMoney(taxa)} de taxa de cadastro.</p>`, visual:'',
      ask:'Em relação ao valor anunciado, essa taxa representa um acréscimo de',
      opts: iqMC(Math.round(pc*100)/100, [[Math.round(taxa/preco*1000)/100,'Errou a posição da vírgula: multiplique por 100, não por 1 000.'],[Math.round(pc*n*100)/100,'A taxa é paga uma vez só, não em cada parcela.'],[Math.round(taxa/(preco/n)*100*100)/100,'Comparou a taxa com uma parcela, mas a pergunta é em relação ao valor total.'],[Math.round(taxa/(preco+taxa)*10000)/100,'Dividiu pelo total com a taxa; o certo é dividir pelo valor anunciado.']], {fmt:v=>iqNum(v)+'%', step:0.5}),
      steps:[`Acréscimo = taxa ÷ valor anunciado = ${iqMoney(taxa)} ÷ ${iqMoney(preco)}`, `= ${iqNum(taxa/preco, 4)} = ${iqNum(pc)}%`]};
  },
  // probabilidade com tabela
  ()=>{
    const t = [['Manhã', randInt(8,20), randInt(8,20)], ['Tarde', randInt(8,20), randInt(8,20)], ['Noite', randInt(5,15), randInt(5,15)]];
    const row = pick([0,1,2]), col = pick([1,2]), tot = t.reduce((a,r)=>a+r[1]+r[2],0), fav = t[row][col];
    const [p,q] = simplifyFrac(fav, tot);
    const turmaTot = t[row][1]+t[row][2], [p2,q2] = simplifyFrac(fav, turmaTot);
    const [p3,q3] = simplifyFrac(t[row][col], t.reduce((a,r)=>a+r[col],0));
    const lab = col===1 ? 'meninas' : 'meninos';
    return {subj:'probabilidade', topic:'Probabilidade', text:`<p>Uma escola vai sortear uma bolsa de estudos entre todos os alunos inscritos num projeto. A tabela mostra os inscritos por turno.</p>`,
      visual: iqTable(['Turno','Meninas','Meninos'], t.map(r=>[r[0], r[1], r[2]])),
      ask:`Qual é a probabilidade de o sorteado ser um${col===1?'a menina':' menino'} do turno da ${t[row][0].toLowerCase()}?`,
      opts: iqMC(`${p}/${q}`, [[`${p2}/${q2}`,'Dividiu só pelos alunos do turno; o sorteio é entre todos os inscritos.'],[`${p3}/${q3}`,`Dividiu só pelo total de ${lab}; o sorteio é entre todos.`],[`${fav}/${tot-fav}`,'O denominador é o total de inscritos, incluindo o sorteado.'],[`1/${tot}`,'Essa é a chance de um aluno específico ser sorteado.']], {sort:false}),
      steps:[`Total de inscritos: ${tot}`, `${col===1?'Meninas':'Meninos'} da ${t[row][0].toLowerCase()}: ${fav}`, `P = ${fav}/${tot}${q!==tot?` = ${p}/${q}`:''}`]};
  },
];

/* =================== ETEC =================== */
const IQ_ETEC = [
  // área de cerca (tela) com trechos
  ()=>{
    const L = pick([300,400,500,600,800]), h1 = pick([1.2,1.5,1.7,2]), h2 = pick([0.3,0.4,0.5]);
    const area = Math.round(L*(h1+h2));
    return {subj:'geometria', topic:'Área', text:`<p>Para proteger uma reserva, será construída uma cerca reta de ${L} m de comprimento. Cada trecho de cerca tem uma tela de malha grande e, embaixo dela, uma faixa de tela de malha pequena, como no esquema.</p>`,
      visual: cvSVG(320, 170, `<rect x="40" y="20" width="220" height="${_f(h1*60)}" class="geo-face top"/><rect x="40" y="${_f(20+h1*60)}" width="220" height="${_f(h2*60)}" class="geo-face front"/>${cvT(150, 20+h1*30+5, 'malha grande')}${cvT(150, 20+h1*60+h2*30+5, 'malha pequena').replace('class="geo-lbl','font-size="11" class="geo-lbl')}${cvT(268, 20+h1*30+5, iqNum(h1)+' m', 'geo-lbl-h', 'start')}${cvT(268, 20+h1*60+h2*30+5, iqNum(h2)+' m', 'geo-lbl-h', 'start')}${cvL(30, _f(20+(h1+h2)*60+6), 290, _f(20+(h1+h2)*60+6), 'geo-face')}`, 'Esquema da cerca'),
      ask:'Qual é a área total aproximada de tela usada na cerca?',
      opts: iqMC(area, [[Math.round(L*h1),'Faltou a faixa de malha pequena.'],[Math.round(L*h2),'Usou só a malha pequena.'],[Math.round(2*L*(h1+h2)),'A cerca tem um lado só de tela; não dobre a área.'],[Math.round(L+h1+h2),'Área é comprimento × altura, não soma.']], {fmt:v=>iqNum(v)+' m²'}),
      steps:[`Altura total da tela: ${iqNum(h1)} + ${iqNum(h2)} = ${iqNum(h1+h2)} m`, `Área = comprimento × altura = ${L} × ${iqNum(h1+h2)} = ${iqNum(area)} m²`]};
  },
  // média em gráfico de barras horizontais
  ()=>{
    const anos = ['2025','2026','2027','2028','2029','2030'];
    let v, m; do{ v = []; let x = randInt(12,20); anos.forEach(()=>{ v.push(x); x += randInt(1,6); }); m = v.reduce((a,b)=>a+b,0)/6; } while(m!==Math.round(m));
    const what = pick(['vendas de bicicletas elétricas (em milhares)','usuários de um aplicativo de transporte (em milhões)','produção de energia solar de uma cidade (em GWh)']);
    return {subj:'estatistica', topic:'Média', text:`<p>O gráfico mostra a previsão das ${what} para os próximos anos.</p>`, visual: iqBarsSVG(anos, v, {horizontal:true, title:'Previsão por ano'}),
      ask:'Qual é o valor médio previsto para o período de 2025 a 2030?',
      opts: iqMC(m, [[(v[0]+v[5])/2,'Fez a média só do primeiro e do último ano.'],[v[3],'Pegou o valor de um ano do meio, não a média.'],[v.reduce((a,b)=>a+b,0)/5,'Dividiu por 5, mas são 6 anos.'],[v[5]-v[0],'Isso é o crescimento total, não a média.']], {fmt:v=>iqNum(v)}),
      steps:[`Some os seis valores: ${v.join(' + ')} = ${v.reduce((a,b)=>a+b,0)}`, `Divida por 6: ${iqNum(m)}`]};
  },
  // receita (regra de três)
  ()=>{
    const p0 = pick([4,6,8]), p1 = p0*pick([2,3])/2*pick([1,2]), ing = pick([['farinha',300,'g'],['leite',400,'mL'],['açúcar',240,'g']]);
    const x = ing[1]*p1/p0;
    if(x!==Math.round(x) || p1===p0) return IQ_ETEC[2]();
    return {subj:'regra3', topic:'Regra de três', text:`<p>Uma receita de bolo que serve ${p0} pessoas usa ${ing[1]} ${ing[2]} de ${ing[0]}. ${iqName()} vai fazer o mesmo bolo para ${p1} pessoas, mantendo as proporções.</p>`, visual:'',
      ask:`Quantos ${ing[2]==='g'?'gramas':'mililitros'} de ${ing[0]} serão necessários?`,
      opts: iqMC(x, [[ing[1]*p0/p1,'A proporção é direta: mais pessoas, mais ingrediente.'],[ing[1]+(p1-p0),'Somou a diferença de pessoas em vez de manter a proporção.'],[ing[1]*p1,'Esqueceu de dividir pelo número de pessoas da receita original.'],[ing[1]*2,'Dobrou a receita sem conferir quantas vezes ela cresceu.']], {fmt:v=>iqNum(v)+' '+ing[2]}),
      steps:[`Proporção direta: ${p0} pessoas → ${ing[1]} ${ing[2]}`, `${p1} pessoas → x = ${ing[1]} × ${p1} ÷ ${p0} = ${iqNum(x)} ${ing[2]}`]};
  },
  // desconto em loja
  ()=>{
    const preco = pick([80,120,150,200,240,350]), d = pick([10,15,20,25,30]), fim = preco*(100-d)/100;
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Na semana do estudante, uma papelaria deu ${d}% de desconto em todas as mochilas. ${iqName()} escolheu uma mochila que custava ${iqMoney(preco)}.</p>`, visual:'',
      ask:'Quanto ela pagou pela mochila com o desconto?',
      opts: iqMC(fim, [[preco*d/100,'Esse é o valor do desconto, não o preço final.'],[preco-d,'Tirou o número da porcentagem como se fosse em reais.'],[preco*(100+d)/100,'Somou a porcentagem; desconto diminui o preço.'],[preco/(1+d/100),'Desconto de d% é multiplicar por (1 − d/100), não dividir.']], {fmt:iqMoney}),
      steps:[`Desconto: ${d}% de ${iqMoney(preco)} = ${iqMoney(preco*d/100)}`, `Preço final: ${iqMoney(preco)} − ${iqMoney(preco*d/100)} = ${iqMoney(fim)}`]};
  },
  // escada (Pitágoras)
  ()=>{
    const t = pick([[3,4,5],[6,8,10],[1.8,2.4,3],[2.1,2.8,3.5],[1.5,2,2.5]]);
    return {subj:'semelhanca', topic:'Teorema de Pitágoras', text:`<p>Uma escada de ${iqNum(t[2])} m está apoiada numa parede vertical. O pé da escada está a ${iqNum(t[0])} m da parede, sobre um chão plano.</p>`,
      visual: rightTriangleSVG(t[1], t[0], '', ['h = ?', iqNum(t[0])+' m', iqNum(t[2])+' m']),
      ask:'A que altura do chão está o topo da escada?',
      opts: iqMC(t[1], [[Math.round((t[2]-t[0])*100)/100,'Subtrair os lados não funciona: use Pitágoras.'],[Math.round(Math.hypot(t[2],t[0])*100)/100,'A escada é a hipotenusa: subtraia os quadrados, não some.'],[Math.round((t[2]*t[2]-t[0]*t[0])*100)/100,'Faltou tirar a raiz quadrada.'],[Math.round((t[2]+t[0])/2*100)/100,'Média dos lados não dá a altura.']], {fmt:v=>iqNum(v)+' m', step:0.5}),
      steps:[`A escada é a hipotenusa: ${iqNum(t[2])}² = ${iqNum(t[0])}² + h²`, `h² = ${iqNum(t[2]*t[2])} − ${iqNum(t[0]*t[0])} = ${iqNum(t[1]*t[1])}`, `h = ${iqNum(t[1])} m`]};
  },
  // caixa d'água em litros
  ()=>{
    const c = pick([1,1.5,2]), l = pick([1,1.2,1.5]), hh = pick([0.8,1,1.2]), V = Math.round(c*l*hh*1000);
    return {subj:'unidades', topic:'Volume e capacidade', text:`<p>Uma caixa-d'água tem a forma de um bloco retangular com ${iqNum(c)} m de comprimento, ${iqNum(l)} m de largura e ${iqNum(hh)} m de altura.</p>`, visual: poolSVG(c, l, hh),
      ask:'Quantos litros de água cabem nessa caixa quando ela está cheia?',
      opts: iqMC(V, [[V/1000,'Esse é o volume em m³; falta converter pra litros (× 1 000).'],[V*10,'1 m³ = 1 000 litros, não 10 000.'],[Math.round((c+l+hh)*1000),'Volume é comprimento × largura × altura, não soma.'],[V/10,'1 m³ = 1 000 litros, não 100.']], {fmt:v=>iqNum(v)+' L'}),
      steps:[`V = ${iqNum(c)} × ${iqNum(l)} × ${iqNum(hh)} = ${iqNum(V/1000)} m³`, `1 m³ = 1 000 L → ${iqNum(V)} litros`]};
  },
  // ingressos (sistema)
  ()=>{
    const pi = pick([20,24,30,40]), meia = pi/2, x = randInt(20,60), y = randInt(20,60), tot = x*pi + y*meia, n = x+y;
    return {subj:'sistemas', topic:'Sistemas', text:`<p>Num teatro, a entrada inteira custa ${iqMoney(pi)} e a meia-entrada custa a metade. Numa sessão, foram vendidos ${n} ingressos e arrecadados ${iqMoney(tot)}.</p>`, visual:'',
      ask:'Quantas meias-entradas foram vendidas nessa sessão?',
      opts: iqMC(y, [[x,'Essa é a quantidade de inteiras.'],[Math.round(n/2),'Dividir o total ao meio só daria certo se as quantidades fossem iguais.'],[Math.round(tot/meia),'Dividiu tudo pelo preço da meia, como se todos fossem meias.'],[n-Math.round(tot/pi),'Conta incompleta: monte o sistema com as duas equações.']], {fmt:v=>String(v)}),
      steps:[`x inteiras e y meias: x + y = ${n} e ${pi}x + ${meia}y = ${tot}`, `Trocando x = ${n} − y: ${pi}(${n} − y) + ${meia}y = ${tot} → ${pi*n} − ${meia}y = ${tot}`, `y = (${pi*n} − ${tot}) ÷ ${meia} = ${y}`]};
  },
];

/* =================== FUVEST =================== */
const IQ_FUVEST = [
  // gráfico de dispersão com médias: qual afirmação é correta
  ()=>{
    const names = shuffle(['País A','País B','País C','País D','País E','País F']);
    const mx = 50, my = 50;
    const pts = names.map(n=>({n, x:randInt(10,90), y:randInt(10,90)})).filter(p=>Math.abs(p.x-mx)>8 && Math.abs(p.y-my)>8);
    if(pts.length<5) return IQ_FUVEST[0]();
    const quad = p=> (p.x>mx?'acima':'abaixo') + '/' + (p.y>my?'acima':'abaixo');
    const sc = 2.4, X = v=> 30 + v*sc, Y = v=> 190 - v*1.6;
    let s = cvL(30, 190, 290, 190) + cvL(30, 20, 30, 190) + cvL(X(mx), 24, X(mx), 190, 'geo-hidden') + cvL(30, Y(my), 290, Y(my), 'geo-hidden');
    s += cvT(X(mx)+4, 30, 'média', '', 'start').replace('class="geo-lbl','font-size="10.5" class="geo-lbl') + cvT(286, Y(my)-5, 'média', '', 'end').replace('class="geo-lbl','font-size="10.5" class="geo-lbl');
    pts.forEach(p=>{ s += `<circle cx="${_f(X(p.x))}" cy="${_f(Y(p.y))}" r="${randInt(5,11)}" fill="rgba(76,125,255,.35)" stroke="#6B8CFF"/>` + cvT(X(p.x)+12, Y(p.y)+4, p.n, '', 'start').replace('class="geo-lbl','font-size="11" class="geo-lbl'); });
    s += cvT(160, 208, 'renda por pessoa →').replace('class="geo-lbl','font-size="10.5" class="geo-lbl') + cvT(36, 14, '↑ anos de estudo', '', 'start').replace('class="geo-lbl','font-size="10.5" class="geo-lbl');
    const say = p=> `${p.n} tem renda por pessoa ${p.x>mx?'acima':'abaixo'} da média e anos de estudo ${p.y>my?'acima':'abaixo'} da média.`;
    const truth = pick(pts), lies = shuffle(pts.filter(p=>p!==truth)).slice(0,4);
    const flip = p=> `${p.n} tem renda por pessoa ${p.x>mx?'abaixo':'acima'} da média e anos de estudo ${p.y>my?'acima':'abaixo'} da média.`;
    const flip2 = p=> `${p.n} tem renda por pessoa ${p.x>mx?'acima':'abaixo'} da média e anos de estudo ${p.y>my?'abaixo':'acima'} da média.`;
    const opts = shuffle([{label:say(truth), ok:true}, ...lies.map((p,i)=>({label: i%2 ? flip(p) : flip2(p), ok:false, why:`No gráfico, ${p.n} fica ${p.x>mx?'à direita':'à esquerda'} da linha vertical (renda ${p.x>mx?'acima':'abaixo'} da média) e ${p.y>my?'acima':'abaixo'} da linha horizontal.`}))]);
    return {subj:'graficos', topic:'Leitura de gráfico', text:`<p>O gráfico relaciona a renda por pessoa e a média de anos de estudo da população de alguns países. As linhas tracejadas indicam a média de cada grandeza no grupo; o tamanho de cada círculo é proporcional à população.</p>`, visual: cvSVG(320, 214, s, 'Gráfico de dispersão'),
      ask:'A partir do gráfico, é correto afirmar que', opts, steps:['Linha vertical tracejada: média da renda. À direita dela, renda acima da média.', 'Linha horizontal tracejada: média dos anos de estudo. Acima dela, estudo acima da média.', `${truth.n} está ${truth.x>mx?'à direita':'à esquerda'} e ${truth.y>my?'acima':'abaixo'}: ${say(truth)}`]};
  },
  // mínimo da quadrática em contexto
  ()=>{
    const v = randInt(2,9), k = randInt(2,20), a = 1, b = -2*v, c = v*v + k;
    return {subj:'funcquad', topic:'Função quadrática', text:`<p>O custo diário C, em milhares de reais, para uma fábrica produzir x centenas de peças é dado por C(x) = x² − ${-b}x + ${c}.</p>`, visual:'',
      ask:'Qual é o menor custo diário possível, em milhares de reais?',
      opts: iqMC(k, [[v,'Esse é o x do vértice (a produção), não o custo.'],[c,'Esse é o custo com produção zero (o termo independente).'],[c - v,'Erro ao calcular C no vértice.'],[k + v,'Erro ao calcular C no vértice: x² − ' + (-b) + 'x com x = ' + v + ' dá ' + (v*v + b*v) + '.']], {fmt:v=>String(v)}),
      steps:[`O mínimo está no vértice: x = −b/2a = ${-b}/2 = ${v}`, `C(${v}) = ${v*v} − ${-b*v} + ${c} = ${k}`]};
  },
  // decaimento exponencial com log (resposta em expressão)
  ()=>{
    const C0 = pick([800,1000,1200]), fin = pick([200,250,300]).valueOf(), h = pick([2,3,4,6]);
    const r = C0/fin;
    if(r!==Math.round(r)) return IQ_FUVEST[2]();
    const opts = shuffle([
      {label:`${h} · log₂(${r}) horas`, ok:true},
      {label:`${h} · log₂(${fin}) horas`, ok:false, why:'O logaritmo é da razão entre as quantidades, não da quantidade final.'},
      {label:`log₂(${r}) ÷ ${h} horas`, ok:false, why:`Isolando t em ${r} = 2^(t/${h}), o ${h} multiplica o logaritmo.`},
      {label:`${h} · ${r} horas`, ok:false, why:'Faltou o logaritmo: o tempo cresce devagar, não na mesma proporção.'},
      {label:`${h} · log₂(${C0}) horas`, ok:false, why:'O logaritmo é da razão C₀/C, não de C₀.'},
    ]);
    return {subj:'logaritmo', topic:'Logaritmo', text:`<p>A quantidade de um medicamento no sangue de um paciente diminui com o tempo segundo a função Q(t) = ${C0} · 2^(−t/${h}), com Q em miligramas e t em horas a partir da aplicação.</p>`, visual:'',
      ask:`O tempo necessário para que a quantidade chegue a ${fin} mg é`, opts,
      steps:[`${fin} = ${C0} · 2^(−t/${h}) → 2^(−t/${h}) = ${fin}/${C0} = 1/${r}`, `2^(t/${h}) = ${r} → t/${h} = log₂(${r})`, `t = ${h} · log₂(${r}) horas`]};
  },
  // combinatória: senhas
  ()=>{
    const L = pick([2,3]), D = pick([2,3,4]), letters = 26, rep = Math.random()<0.5;
    const ans = rep ? Math.pow(letters, L)*Math.pow(10, D) : [...Array(L)].reduce((p,_,i)=>p*(letters-i),1)*[...Array(D)].reduce((p,_,i)=>p*(10-i),1);
    const alt = !rep ? Math.pow(letters, L)*Math.pow(10, D) : [...Array(L)].reduce((p,_,i)=>p*(letters-i),1)*[...Array(D)].reduce((p,_,i)=>p*(10-i),1);
    const f = v=> v.toLocaleString('pt-BR');
    return {subj:'combinatoria', topic:'Análise combinatória', text:`<p>Um sistema cria códigos de acesso formados por ${L} letras (entre as 26 do alfabeto) seguidas de ${D} algarismos. ${rep ? 'Letras e algarismos podem se repetir.' : 'Não pode haver letras repetidas nem algarismos repetidos.'}</p>`, visual:'',
      ask:'Quantos códigos diferentes podem ser criados?',
      opts: iqMC(ans, [[alt, rep ? 'Esse cálculo proíbe repetições, mas o enunciado permite.' : 'Esse cálculo permite repetições, mas o enunciado proíbe.'],[letters*L + 10*D,'As escolhas são em sequência: multiplique, não some.'],[Math.pow(36, L+D),'Letras e algarismos têm posições fixas; não misture os 36 símbolos.'],[ans/2,'Não há motivo pra dividir: a ordem dos símbolos importa.']], {fmt:f, sort:true}),
      steps:[rep ? `Cada letra: 26 opções; cada algarismo: 10 opções` : `Letras: 26 × 25${L===3?' × 24':''}; algarismos: 10 × 9${D>=3?' × 8':''}${D===4?' × 7':''}`, `Total = ${f(ans)}`]};
  },
  // geometria analítica: área de triângulo com coordenadas (retângulo)
  ()=>{
    const ax = randInt(-3,2), ay = randInt(-3,2), b = randInt(3,8), hh = randInt(2,7);
    const A = [ax,ay], B = [ax+b, ay], C = [ax+randInt(0,b), ay+hh], area = b*hh/2;
    const pts = [{a:A[0],b:A[1],label:'A'},{a:B[0],b:B[1],label:'B'},{a:C[0],b:C[1],label:'C',hi:true}];
    return {subj:'analitica', topic:'Geometria analítica', text:`<p>No plano cartesiano, um terreno triangular tem vértices A(${nm(A[0])}, ${nm(A[1])}), B(${nm(B[0])}, ${nm(B[1])}) e C(${nm(C[0])}, ${nm(C[1])}), com as medidas em quilômetros.</p>`,
      visual: complexPlaneSVG(pts).replace(/>real</,'>x<').replace(/>imag\.</,'>y<'),
      ask:'Qual é a área desse terreno, em km²?',
      opts: iqMC(area, [[b*hh,'Faltou dividir por 2: a área do triângulo é base × altura ÷ 2.'],[(b+hh)/2,'Área é produto, não soma.'],[b*hh/4,'Dividiu por 2 duas vezes.'],[b+hh+Math.round(Math.hypot(b,hh)),'Isso parece um perímetro, não uma área.']], {fmt:v=>iqNum(v)}),
      steps:[`A e B têm o mesmo y: base AB = ${b}`, `Altura = distância de C até a reta AB = ${hh}`, `Área = ${b} × ${hh} ÷ 2 = ${iqNum(area)} km²`]};
  },
  // PG: população dobrando
  ()=>{
    const p0 = pick([500,800,1000,1500]), r = pick([2,3]), per = pick([['hora','horas'],['dia','dias']]), n = randInt(4,7), pn = p0*Math.pow(r, n);
    return {subj:'pg', topic:'Progressão geométrica', text:`<p>Em um laboratório, uma colônia de bactérias começou com ${p0.toLocaleString('pt-BR')} indivíduos e ${r===2?'dobra':'triplica'} a cada ${per[0]}.</p>`, visual:'',
      ask:`Quantas bactérias haverá depois de ${n} ${per[1]}?`,
      opts: iqMC(pn, [[p0*Math.pow(r, n-1),`Contou um ${per[0]} a menos: depois de ${n} ${per[1]} a população foi multiplicada ${n} vezes.`],[p0*r*n,`Isso seria crescer sempre a mesma quantidade (PA); aqui ela é multiplicada a cada ${per[0]}.`],[p0*Math.pow(r, n+1),`Contou um ${per[0]} a mais.`],[p0 + Math.pow(r,n),'A população inicial multiplica, não soma.']], {fmt:v=>v.toLocaleString('pt-BR')}),
      steps:[`PG de razão ${r}: depois de n ${per[1]}, P = ${p0.toLocaleString('pt-BR')} × ${r}ⁿ`, `P = ${p0.toLocaleString('pt-BR')} × ${r}^${n} = ${pn.toLocaleString('pt-BR')}`]};
  },
  // probabilidade condicional (tabela)
  ()=>{
    const a = randInt(10,30), b = randInt(10,30), c = randInt(10,30), d = randInt(10,30);
    const [p,q] = simplifyFrac(a, a+c), [p2,q2] = simplifyFrac(a, a+b), [p3,q3] = simplifyFrac(a, a+b+c+d);
    return {subj:'condicional', topic:'Probabilidade condicional', text:`<p>Numa pesquisa com moradores de um bairro, cada pessoa respondeu se pratica atividade física e se dorme pelo menos 7 horas por noite.</p>`,
      visual: iqTable(['','Dorme 7 h ou mais','Dorme menos de 7 h'], [['Pratica atividade', a, b], ['Não pratica', c, d]]),
      ask:'Escolhendo ao acaso um entrevistado que dorme 7 horas ou mais, a probabilidade de ele praticar atividade física é',
      opts: iqMC(`${p}/${q}`, [[`${p2}/${q2}`,'Trocou a condição: o universo são os que dormem 7 h ou mais, não os que praticam atividade.'],[`${p3}/${q3}`,'Usou o total de entrevistados; com "sabendo que", o universo diminui.'],[`${c}/${a+c}`.split('/').map(Number).length && `${simplifyFrac(c,a+c).join('/')}`,'Essa é a chance de NÃO praticar atividade.'],[`${a}/${c}`,'O denominador é o total do novo universo, não só os que não praticam.']], {sort:false}),
      steps:[`Novo universo: quem dorme 7 h ou mais = ${a} + ${c} = ${a+c}`, `Desses, praticam atividade: ${a}`, `P = ${a}/${a+c}${q!==a+c?` = ${p}/${q}`:''}`]};
  },
];

/* =================== UNICAMP (4 alternativas) =================== */
const IQ_UNICAMP = [
  // acréscimo em faixa de porcentagem
  ()=>{
    const v = pick([12000,15000,18000,20000,32000]), f = pick([240,360,450,600,800,960]), pc = f/v*100;
    const faixas = [[0,2.5],[2.5,3.5],[3.5,4.5],[4.5,100]];
    const fx = faixas.findIndex(([a,b])=> pc>=a && pc<b);
    const labels = ['inferior a 2,5%.','entre 2,5% e 3,5%.','entre 3,5% e 4,5%.','superior a 4,5%.'];
    const opts = labels.map((l,i)=>({label:l, ok:i===fx, why:`O acréscimo é ${iqNum(pc)}%, que fica na faixa "${labels[fx]}"`}));
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Uma loja anunciou um curso de idiomas por ${iqMoney(v)}, pago em parcelas "sem juros". Ao se matricular, o aluno descobriu que teria de pagar também ${iqMoney(f)} de material obrigatório.</p>`, visual:'',
      ask:'Em relação ao valor anunciado, o aluno pagará um acréscimo', opts, sortKeep:true,
      steps:[`Acréscimo = ${iqMoney(f)} ÷ ${iqMoney(v)} = ${iqNum(f/v,4)}`, `= ${iqNum(pc)}% → ${labels[fx]}`]};
  },
  // trigonometria: subida de rampa/avião (resposta em expressão)
  ()=>{
    const ang = pick([10,12,15,18,20]), d = pick([1.5,2.4,3.8,4.2]);
    const what = pick([['Um avião decola com ângulo constante de','Uma torre fica a','A altura do avião ao passar sobre a torre é'],['Um drone sobe em linha reta com ângulo constante de','Um prédio fica a','A altura do drone ao passar sobre o prédio é']]);
    const opts = shuffle([
      {label:`${iqNum(d)} · tg(${ang}°) km.`, ok:true},
      {label:`${iqNum(d)} · sen(${ang}°) km.`, ok:false, why:'O seno usa a hipotenusa (a trajetória), mas a distância dada é o cateto adjacente (no chão).'},
      {label:`${iqNum(d)} · cos(${ang}°) km.`, ok:false, why:'O cosseno daria a distância no chão a partir da trajetória, não a altura.'},
      {label:`${iqNum(d)} ÷ tg(${ang}°) km.`, ok:false, why:'tg = oposto ÷ adjacente → altura = adjacente × tg, não dividido.'},
    ]);
    return {subj:'trigret', topic:'Trigonometria', text:`<p>${what[0]} ${ang}° com o solo. ${what[1]} ${iqNum(d)} km do ponto de partida, medidos no solo, como na figura (fora de escala).</p>`,
      visual: (()=>{ const hp = Math.min(100, 240*Math.tan(ang*Math.PI/180)*1.6), ap = Math.atan(hp/240)*180/Math.PI;
        return cvSVG(320, 150, `${cvL(20,120,300,120,'geo-face')}${cvL(40,120,280,_f(120-hp),'geo-height')}<path d="${arcPath(40,120,44,0,ap)}" fill="none" stroke="#FF8A4C" stroke-width="2"/>${cvT(96,_f(116-Math.tan(ap*Math.PI/360)*56),ang+'°','geo-lbl-h','start')}${cvL(280,120,280,_f(120-hp),'geo-radius')}${cvT(286,_f(120-hp/2+5),'h','geo-lbl-h','start')}${cvT(160,140,iqNum(d)+' km')}`, 'Esquema da subida (fora de escala)'); })(),
      ask: what[2], opts, steps:['A distância no solo é o cateto adjacente ao ângulo; a altura é o cateto oposto.', `tg(${ang}°) = h ÷ ${iqNum(d)} → h = ${iqNum(d)} · tg(${ang}°) km`]};
  },
  // resfriamento/aquecimento com fórmula e log (expressão)
  ()=>{
    const T0 = pick([600,740,900]), Tar = pick([20,25,40]), alvo = Tar + (T0-Tar)/pick([5,7,10]);
    const k = Math.round((T0-Tar)/(alvo-Tar));
    const m = pick([10,12,15]);
    const opts = shuffle([
      {label:`${m} · log(${k}) minutos.`, ok:true},
      {label:`${m} · [1 − log(${k})] minutos.`, ok:false, why:'Não aparece o 1: depois de isolar a potência, fica 10^(t/'+m+') = '+k+'.'},
      {label:`log(${k}) ÷ ${m} minutos.`, ok:false, why:`t/${m} = log(${k}) → o ${m} multiplica.`},
      {label:`${m} · [log(${k}) − 1] minutos.`, ok:false, why:'Não sobra o −1: a temperatura do ar já foi descontada dos dois lados.'},
    ]);
    return {subj:'logaritmo', topic:'Função exponencial e logaritmo', text:`<p>Uma peça metálica sai de um forno a ${T0} °C e é colocada num ambiente a ${Tar} °C. A temperatura da peça, em °C, varia segundo T(t) = (T₀ − T_amb) · 10^(−t/${m}) + T_amb, com t em minutos, T₀ a temperatura inicial e T_amb a do ambiente.</p>`, visual:'',
      ask:`O tempo para que a peça chegue a ${iqNum(Tar + (T0-Tar)/k)} °C é dado por (log na base 10)`, opts,
      steps:[`${iqNum(Tar + (T0-Tar)/k)} = ${T0-Tar} · 10^(−t/${m}) + ${Tar} → 10^(−t/${m}) = ${iqNum((T0-Tar)/k)}/${T0-Tar} = 1/${k}`, `10^(t/${m}) = ${k} → t/${m} = log(${k})`, `t = ${m} · log(${k}) minutos`]};
  },
  // PA: fileiras de um teatro
  ()=>{
    const a1 = randInt(12,24), r = pick([2,3,4]), n = randInt(12,20), an = a1+(n-1)*r, S = (a1+an)*n/2;
    return {subj:'pa', topic:'Progressão aritmética', text:`<p>A primeira fileira de um auditório tem ${a1} cadeiras e cada fileira seguinte tem ${r} cadeiras a mais que a anterior. O auditório tem ${n} fileiras.</p>`, visual:'',
      ask:'Quantas cadeiras há no auditório?',
      opts: iqMC(S, [[an,`Essa é a quantidade da última fileira, não o total.`],[a1*n,'Assim todas as fileiras teriam o mesmo número de cadeiras.'],[(a1+a1+n*r)*n/2,'A última fileira tem (n − 1) acréscimos, não n.'],[S - an,'Faltou somar a última fileira.']], {n:4, fmt:v=>String(v)}),
      steps:[`Última fileira: a${n} = ${a1} + ${n-1} × ${r} = ${an}`, `Soma da PA: (${a1} + ${an}) × ${n} ÷ 2 = ${S}`]};
  },
  // semelhança: triângulos com sombra (numérico)
  ()=>{
    const b = pick([1.2,1.5,1.6,1.8]), sb = pick([0.8,1,1.2]), k = pick([5,6,8,10,12]), S = Math.round(sb*k*100)/100, H = Math.round(b*k*100)/100;
    return {subj:'semelhanca', topic:'Semelhança', text:`<p>No mesmo instante, uma estudante de ${iqNum(b)} m de altura projeta uma sombra de ${iqNum(sb)} m, e um poste vertical projeta uma sombra de ${iqNum(S)} m.</p>`, visual: shadowSVG(b, sb, S, 'H'),
      ask:'A altura H do poste é',
      opts: iqMC(H, [[Math.round(S*sb/b*100)/100,'Inverteu a proporção: altura/sombra deve ser igual nos dois triângulos.'],[Math.round((S+b-sb)*100)/100,'Somar a diferença não preserva a forma dos triângulos.'],[Math.round(S*b*100)/100,'Faltou dividir pela sombra da estudante.']], {n:4, fmt:v=>iqNum(v)+' m'}),
      steps:['Os raios de sol são paralelos: os triângulos são semelhantes.', `H/${iqNum(S)} = ${iqNum(b)}/${iqNum(sb)} → H = ${iqNum(S)} × ${iqNum(b)} ÷ ${iqNum(sb)} = ${iqNum(H)} m`]};
  },
];

/* =================== UNESP =================== */
const IQ_UNESP = [
  // borda numa toalha (equação do 2º grau)
  ()=>{
    const a = pick([1.5,2,2.5]), b = pick([2,2.5,3]), x = pick([0.1,0.15,0.2,0.25]);
    const A = Math.round(((a+2*x)*(b+2*x) - a*b)*1000)/1000;
    return {subj:'eq2', topic:'Equação do 2º grau', text:`<p>${iqName()} fez uma toalha retangular de ${iqNum(a)} m por ${iqNum(b)} m. Ela quer costurar uma borda de mesma largura em todos os lados, usando exatamente ${iqNum(A)} m² de tecido.</p>`,
      visual: cvSVG(320, 190, `<rect x="40" y="20" width="240" height="150" class="geo-face front" style="fill:rgba(255,138,76,.25)"/><rect x="62" y="42" width="196" height="106" class="geo-face top"/>${cvT(160,100,iqNum(b)+' m × '+iqNum(a)+' m')}${cvT(51,100,'x','geo-lbl-h')}${cvT(160,34,'x','geo-lbl-h')}`, 'Toalha com borda'),
      ask:'Qual deve ser a largura x da borda?',
      opts: iqMC(x, [[x*2,'Essa é a soma das bordas dos dois lados; cada lado tem x.'],[Math.round(A/(2*(a+b))*1000)/1000 === x ? null : Math.round(A/(2*(a+b))*1000)/1000,'Faltou contar os quatro cantinhos x × x da borda.'],[x+0.05,'Confira substituindo na área da borda.'],[Math.round(x/2*1000)/1000,'Confira substituindo na área da borda.']], {fmt:v=>iqNum(v,2)+' m', step:0.05}),
      steps:[`Área com a borda: (${iqNum(a)} + 2x)(${iqNum(b)} + 2x). Área da borda = essa área − ${iqNum(a*b)}`, `4x² + ${iqNum(2*(a+b))}x = ${iqNum(A)}`, `Testando ou resolvendo a equação: x = ${iqNum(x,2)} m`]};
  },
  // folha com cantos cortados
  ()=>{
    const L = pick([20,24,30,40]), c = pick([5,6,8,10].filter(v=>v<L/2)), area = L*L - 4*(c*c/2);
    return {subj:'geometria', topic:'Área', text:`<p>Uma folha quadrada de lado ${L} cm teve seus quatro cantos cortados igualmente: em cada canto, foi retirado um triângulo retângulo com catetos de ${c} cm, como na figura.</p>`,
      visual: cvSVG(320, 200, `<polygon points="${[[110+c*140/L/1,20],[250-c*140/L,20],[250,20+c*140/L],[250,160-c*140/L],[250-c*140/L,160],[110+c*140/L,160],[110,160-c*140/L],[110,20+c*140/L]].map(p=>p.map(_f).join(',')).join(' ')}" class="geo-face top"/><rect x="110" y="20" width="140" height="140" fill="none" class="geo-hidden"/>${cvT(180,184,L+' cm')}${cvT(110+c*70/L,14,c+' cm','geo-lbl-h')}`, 'Folha com os cantos cortados'),
      ask:'Após os cortes, a área do que restou da folha é',
      opts: iqMC(area, [[L*L - 4*c*c,'Cada canto é um triângulo: área = c × c ÷ 2, não c × c.'],[L*L - c*c/2,'Foram cortados quatro cantos, não um.'],[L*L - 2*c*c/2,'Foram cortados quatro cantos, não dois.'],[L*L,'Faltou tirar os cantos.']], {fmt:v=>iqNum(v)+' cm²'}),
      steps:[`Área da folha: ${L} × ${L} = ${L*L} cm²`, `Cada canto: ${c} × ${c} ÷ 2 = ${c*c/2} cm²; quatro cantos: ${2*c*c} cm²`, `Restou: ${L*L} − ${2*c*c} = ${area} cm²`]};
  },
  // votação em duas etapas (gráfico + tabela)
  ()=>{
    const N = pick([200,300,400,500]), labels = ['Parquinho','Quadra','Academia','Horta','Fachada'];
    let v; do{ v = labels.map(()=> randInt(2,12)*5); } while(v.reduce((a,b)=>a+b,0) !== N && (v[4] = N - v.slice(0,4).reduce((a,b)=>a+b,0)) <= 0);
    const win = v.indexOf(Math.max(...v)), wl = labels[win];
    const pcs = [40,35,20,5], cor = pick([0,1,2]), cores = ['Cinza','Azul','Bege','Verde'];
    const votos = v[win]*pcs[cor]/100, resp = votos/N*100;
    if(votos!==Math.round(votos)) return IQ_UNESP[2]();
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Num condomínio com ${N} apartamentos, cada apartamento votou uma vez no que deveria ser melhorado. Depois, só os apartamentos que votaram na opção vencedora (${wl}) escolheram a cor da reforma.</p>`,
      visual: iqBarsSVG(labels, v, {title:'Votos por melhoria'}) + iqTable(['Cor','Votos'], cores.map((c,i)=>[c, pcs[i]+'%'])),
      ask:`Em relação ao total de apartamentos do condomínio, os votos na cor ${cores[cor]} correspondem a que porcentagem?`,
      opts: iqMC(Math.round(resp*10)/10, [[pcs[cor],'Essa porcentagem é só entre quem votou na segunda etapa, não do condomínio todo.'],[Math.round(votos*10)/10,'Esse é o número de votos, não a porcentagem.'],[Math.round(v[win]/N*1000)/10,'Essa é a porcentagem dos que votaram na opção vencedora.'],[Math.round(pcs[cor]*N/100/v[win]*1000)/10,'Inverteu a conta: primeiro ache os votos na cor e depois divida pelo total.']], {fmt:v=>iqNum(v,1)+'%', step:1.5}),
      steps:[`Votaram em ${wl}: ${v[win]} apartamentos`, `${cores[cor]}: ${pcs[cor]}% de ${v[win]} = ${votos} votos`, `${votos} ÷ ${N} = ${iqNum(resp,1)}% do condomínio`]};
  },
  // média ponderada
  ()=>{
    const pesos = [pick([1,2]), pick([2,3]), pick([3,4])], notas = pesos.map(()=> randInt(4,10));
    const S = notas.reduce((a,n,i)=>a+n*pesos[i],0), P = pesos.reduce((a,b)=>a+b,0), m = Math.round(S/P*100)/100;
    return {subj:'estatistica', topic:'Média ponderada', text:`<p>Num concurso, a nota final é a média ponderada de três provas. ${iqName()} tirou as notas abaixo.</p>`,
      visual: iqTable(['Prova','Peso','Nota'], [['Português', pesos[0], notas[0]], ['Matemática', pesos[1], notas[1]], ['Redação', pesos[2], notas[2]]]),
      ask:'A nota final foi',
      opts: iqMC(m, [[Math.round(notas.reduce((a,b)=>a+b,0)/3*100)/100,'Essa é a média simples; o enunciado pede a ponderada.'],[Math.round(S/3*100)/100,'Divida pela soma dos pesos, não por 3.'],[S,'Faltou dividir pela soma dos pesos.'],[Math.round(S/P*10)/100,'Erro na divisão.']], {fmt:v=>iqNum(v,2), step:0.5}),
      steps:[`Some nota × peso: ${notas.map((n,i)=>`${n}×${pesos[i]}`).join(' + ')} = ${S}`, `Divida pela soma dos pesos (${P}): ${S} ÷ ${P} = ${iqNum(m,2)}`]};
  },
  // táxi (função afim) — achar a distância
  ()=>{
    const band = pick([4.5,5,5.5,6]), km = pick([2.5,2.8,3,3.2]), d = randInt(6,25), tot = Math.round((band+km*d)*100)/100;
    return {subj:'func1grau', topic:'Função afim', text:`<p>Numa cidade, uma corrida de táxi custa ${iqMoney(band)} de bandeirada mais ${iqMoney(km)} por quilômetro rodado. Uma passageira pagou ${iqMoney(tot)} numa corrida.</p>`, visual:'',
      ask:'Quantos quilômetros teve essa corrida?',
      opts: iqMC(d, [[Math.round(tot/km*10)/10,'Faltou descontar a bandeirada antes de dividir.'],[Math.round((tot+band)/km*10)/10,'A bandeirada se subtrai, não se soma.'],[Math.round((tot-band)/band*10)/10,'Dividiu pela bandeirada em vez do preço por km.'],[d+1,'Confira: '+iqMoney(band)+' + '+iqMoney(km)+' × '+(d+1)+' passa do valor pago.']], {fmt:v=>iqNum(v)+' km'}),
      steps:[`Preço = ${iqMoney(band)} + ${iqMoney(km)} × d`, `${iqMoney(tot)} − ${iqMoney(band)} = ${iqMoney(tot-band)} → d = ${iqMoney(tot-band)} ÷ ${iqMoney(km)} = ${d} km`]};
  },
  // juros compostos x simples
  ()=>{
    const C = pick([1000,2000,5000]), i = pick([5,10]), n = pick([2,3]), M = Math.round(C*Math.pow(1+i/100, n)*100)/100, Ms = C*(1+i*n/100);
    return {subj:'juros', topic:'Juros compostos', text:`<p>${iqName()} aplicou ${iqMoney(C)} a juros compostos de ${i}% ao mês, sem fazer retiradas.</p>`, visual:'',
      ask:`Qual será o montante depois de ${n} meses?`,
      opts: iqMC(M, [[Ms,'Esse é o montante com juros simples; compostos rendem juros sobre juros.'],[C*i*n/100,'Esse é só o juro simples, sem o capital.'],[Math.round(C*Math.pow(1+i/100, n-1)*100)/100,`Contou ${n-1} meses em vez de ${n}.`],[Math.round(C*Math.pow(1+i/100, n+1)*100)/100,`Contou ${n+1} meses.`]], {fmt:iqMoney}),
      steps:[`M = C × (1 + i)ⁿ = ${iqMoney(C)} × ${iqNum(1+i/100,2)}^${n}`, `= ${iqMoney(M)}`]};
  },
];

/* =================== OBMEP =================== */
const IQ_OBMEP = [
  // figuras que crescem: qual pode ser o perímetro
  ()=>{
    const p1 = pick([8,10,12]), inc = pick([6,8,10]);
    const n = randInt(150,300), right = p1 + (n-1)*inc;
    const wrongs = [right+2, right-2, right+4, right-4].filter(v=> (v-p1)%inc!==0);
    const opts = shuffle([{label:`${right} cm`, ok:true}, ...wrongs.slice(0,4).map(v=>({label:`${v} cm`, ok:false, why:`Os perímetros são ${p1}, ${p1+inc}, ${p1+2*inc}, …: deixam resto ${p1%inc} na divisão por ${inc}. ${v} deixa resto ${((v%inc)+inc)%inc}.`}))]).sort((a,b)=>parseInt(a.label)-parseInt(b.label));
    const u = 14;
    let s = '', x = 14;
    [1,2,3].forEach(k=>{ for(let i=0;i<k;i++) s += `<rect x="${x+i*u}" y="${70-i*u}" width="${u*2}" height="${u*2}" class="geo-face top"/>`; s += cvT(x+u*(k+1)/2+u/2, 120, `Figura ${k}`).replace('class="geo-lbl','font-size="11" class="geo-lbl'); x += u*(k+1)+u+30; });
    return {subj:'padroes', topic:'Sequências e padrões', text:`<p>Pedro desenha figuras encaixando quadrados em degrau. O contorno da Figura 1 mede ${p1} cm, e cada figura nova tem o contorno ${inc} cm maior que a anterior.</p>`, visual: cvSVG(320, 130, s, 'Figuras em degrau'),
      ask:'Qual das alternativas pode ser o comprimento do contorno de alguma figura desenhada por Pedro?', opts,
      steps:[`Contorno da figura n: ${p1} + (n − 1) × ${inc}`, `Todos deixam o mesmo resto (${p1%inc}) na divisão por ${inc}.`, `Só ${right} cm tem esse resto (é a figura ${n}).`]};
  },
  // limite de peso por porcentagem
  ()=>{
    const peso = pick([40,45,48,50,55,60]), pc = pick([10,12,15]), vazio = pick([500,600,750,800]), max = peso*pc/100 - vazio/1000;
    if(Math.abs(max*2-Math.round(max*2))>1e-9) return IQ_OBMEP[1]();
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Recomenda-se que o peso total de uma mochila escolar não passe de ${pc}% do peso do estudante. ${iqName()} pesa ${peso} quilogramas e sua mochila vazia pesa ${vazio} gramas.</p>`, visual:'',
      ask:'Qual é o peso máximo de material que cabe na mochila, seguindo a recomendação?',
      opts: iqMC(max, [[peso*pc/100,'Esse é o peso total permitido; falta descontar a mochila vazia.'],[peso*pc/100 + vazio/1000,'A mochila vazia se desconta, não se soma.'],[peso*pc/100 - vazio/100,'Erro na conversão: 1 kg = 1 000 g.'],[peso/pc,'Porcentagem é multiplicar por '+pc+'/100, não dividir.']], {fmt:v=>iqNum(v)+' kg', step:0.5}),
      steps:[`${pc}% de ${peso} kg = ${iqNum(peso*pc/100)} kg (peso total permitido)`, `Mochila vazia: ${vazio} g = ${iqNum(vazio/1000)} kg`, `Material: ${iqNum(peso*pc/100)} − ${iqNum(vazio/1000)} = ${iqNum(max)} kg`]};
  },
  // folha dobrada: perímetros
  ()=>{
    let a, b; do{ a = randInt(6,20); b = randInt(4,18); } while(a===b);
    const P = 2*(a+b), Q = a + 2*b, R = 2*a + b;
    return {subj:'logica', topic:'Raciocínio', text:`<p>Uma folha retangular de papel, de perímetro ${P} cm, foi dobrada ao meio de duas maneiras diferentes. Dobrada de uma maneira, a folha ficou com perímetro ${Q} cm.</p>`,
      visual: cvSVG(320, 120, `<rect x="20" y="20" width="110" height="70" class="geo-face top"/>${cvL(75,20,75,90,'geo-hidden')}${cvL(20,55,130,55,'geo-hidden')}${cvT(150,60,'→')}<rect x="170" y="20" width="55" height="70" class="geo-face top"/><rect x="245" y="37" width="70" height="35" class="geo-face top"/>`, 'Folha dobrada de duas maneiras'),
      ask:'Qual é o perímetro da folha dobrada da outra maneira?',
      opts: iqMC(R, [[P/2,'Dobrar ao meio não divide o perímetro por 2: um dos lados fica inteiro.'],[P-Q,'Faltou ver que um dos lados aparece duas vezes.'],[Q,'Esse é o perímetro da primeira dobra.'],[P+Q-R===R?null:Math.round((P+Q)/2),'Média dos perímetros não resolve: monte as equações.']], {fmt:v=>v+' cm'}),
      steps:[`Lados a e b: 2a + 2b = ${P} → a + b = ${P/2}`, `Uma dobra deixa a + 2b = ${Q} → b = ${Q-P/2}, a = ${P-Q}`, `A outra dobra: 2a + b = ${2*a} + ${b} = ${R} cm`]};
  },
  // temperaturas (variações)
  ()=>{
    const ter = randInt(18,32), up = randInt(2,7), down = randInt(3,9), seg = ter - up, qua = seg - down;
    const dias = ['segunda','terça','quarta'];
    return {subj:'expressoes', topic:'Raciocínio', text:`<p>A temperatura máxima de terça-feira foi ${up} °C mais alta que a de segunda-feira. A máxima de quarta-feira foi ${down} °C mais baixa que a de segunda-feira. Na terça-feira, a máxima foi de ${ter} °C.</p>`, visual:'',
      ask:'Qual foi a temperatura máxima de quarta-feira?',
      opts: iqMC(qua, [[ter-down,'A quarta é comparada com a segunda, não com a terça.'],[ter+up-down,'Se a terça foi mais quente, a segunda foi mais fria: subtraia.'],[seg,'Essa é a máxima de segunda-feira.'],[ter-up+down,'A quarta foi mais fria que a segunda: subtraia.']], {fmt:v=>v+' °C'}),
      steps:[`Segunda: ${ter} − ${up} = ${seg} °C`, `Quarta: ${seg} − ${down} = ${qua} °C`]};
  },
  // cortes ao meio de um pedaço
  ()=>{
    const L = pick([16,24,32,48]), k = pick([3,4]);
    const menor = L/Math.pow(2,k);
    return {subj:'fracoes', topic:'Frações', text:`<p>Rita tem uma fita de ${L} cm. No primeiro corte, dividiu a fita ao meio. Em cada um dos cortes seguintes, ela dividiu ao meio um dos pedaços menores que tinha. Ao todo, fez ${k} cortes e ficou com pedaços de apenas dois comprimentos diferentes.</p>`, visual:'',
      ask:'Qual é o comprimento dos pedaços menores?',
      opts: iqMC(menor, [[L/k,'Os cortes dividem pedaços ao meio; não dividem a fita em partes iguais a cada corte.'],[L/(k+1),'Os pedaços não ficam todos iguais.'],[menor*2,'Esse é o comprimento do pedaço maior que sobrou do último corte.'],[L/Math.pow(2,k+1),'Foram '+k+' cortes ao meio, não '+(k+1)+'.']], {fmt:v=>iqNum(v)+' cm', step:0.5}),
      steps:['Cada corte divide ao meio o menor pedaço: o tamanho cai pela metade a cada corte.', `${L} → ${[...Array(k)].map((_,i)=>iqNum(L/Math.pow(2,i+1))).join(' → ')}`, `Menores: ${iqNum(menor)} cm`]};
  },
  // casa dos pombos
  ()=>{
    const cores = randInt(3,6), n = pick([2,3]);
    const ans = cores*(n-1)+1;
    return {subj:'logica', topic:'Casa dos pombos', text:`<p>Numa caixa há bolas de ${cores} cores diferentes, com muitas bolas de cada cor. Lucas vai tirar bolas sem olhar.</p>`, visual:'',
      ask:`Qual é a menor quantidade de bolas que ele precisa tirar para ter certeza de pegar ${n} bolas da mesma cor?`,
      opts: iqMC(ans, [[cores*n,'Basta uma bola a mais que o pior caso.'],[cores+1, n===2 ? null : 'Assim só se garante 2 da mesma cor.'],[n,'Com essa quantidade elas podem sair todas de cores diferentes.'],[cores*(n-1),'No pior caso ainda não houve repetição suficiente: falta uma bola.']], {fmt:v=>String(v)}),
      steps:[`Pior caso: ${n-1} bola${n>2?'s':''} de cada cor sem completar ${n}: ${cores} × ${n-1} = ${cores*(n-1)}`, `A próxima bola completa ${n} de uma cor: ${ans}`]};
  },
  // múltiplos num intervalo
  ()=>{
    const k = pick([3,4,6,7,9]), a = randInt(10,60), b = a + randInt(60,200);
    const cnt = Math.floor(b/k) - Math.floor((a-1)/k);
    return {subj:'divisores', topic:'Divisibilidade', text:`<p>Numa rifa, os bilhetes são numerados de ${a} a ${b}. Ganha um brinde quem tiver bilhete com número múltiplo de ${k}.</p>`, visual:'',
      ask:'Quantos bilhetes dão brinde?',
      opts: iqMC(cnt, [[Math.floor((b-a)/k),'Conte com cuidado as pontas: use ⌊'+b+'/'+k+'⌋ − ⌊'+(a-1)+'/'+k+'⌋.'],[Math.floor(b/k),'Contou os múltiplos desde 1, mas os bilhetes começam em '+a+'.'],[cnt+1,'Confira as pontas do intervalo.'],[Math.round((b-a+1)/k)+2,'Confira as pontas do intervalo.']], {fmt:v=>String(v)}),
      steps:[`Múltiplos de ${k} até ${b}: ⌊${b}/${k}⌋ = ${Math.floor(b/k)}`, `Até ${a-1}: ⌊${a-1}/${k}⌋ = ${Math.floor((a-1)/k)}`, `De ${a} a ${b}: ${Math.floor(b/k)} − ${Math.floor((a-1)/k)} = ${cnt}`]};
  },
];

/* provas e como é o simulado de cada uma (n questões, minutos, alternativas) */
const IQ_EXAMS = {
  enem:    {bank:IQ_ENEM,    n:8, mins:24, alts:5},
  etec:    {bank:IQ_ETEC,    n:7, mins:18, alts:5},
  fuvest:  {bank:IQ_FUVEST,  n:7, mins:24, alts:5},
  unicamp: {bank:IQ_UNICAMP, n:5, mins:18, alts:4},
  unesp:   {bank:IQ_UNESP,   n:6, mins:18, alts:5},
  obmep:   {bank:IQ_OBMEP,   n:7, mins:21, alts:5},
};
/* gera uma questão já com o número certo de alternativas da prova */
function iqMake(examId, gen){
  const alts = IQ_EXAMS[examId].alts;
  for(let t=0; t<20; t++){
    let q; try{ q = gen(); }catch(e){ continue; }
    if(!q || !q.opts) continue;
    let opts = q.opts.slice();
    const right = opts.find(o=>o.ok);
    if(!right) continue;
    if(opts.length > alts){
      const wrong = opts.filter(o=>!o.ok).slice(0, alts-1);
      opts = q.sortKeep ? opts.filter(o=> o.ok || wrong.includes(o)) : (typeof right.v==='number' ? [right, ...wrong].sort((a,b)=>a.v-b.v) : shuffle([right, ...wrong]));
    }
    if(opts.length !== alts) continue;
    return Object.assign({}, q, {opts});
  }
  return null;
}
