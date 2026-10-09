/* =========================================================
   QUESTÕES NO ESTILO DE CADA PROVA (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
   Modelos inspirados em questões reais de cada prova, com números sorteados
   a cada vez. Cada gerador devolve {subjectId, diff, ex}, em que ex traz o
   enunciado (com tabela/gráfico quando precisa), a resolução e as alternativas
   prontas em ex.mcOptions — no formato da prova (A–E, ou a–d na Unicamp).
   Usadas só na área de Provas: "Questões no estilo" e dentro do simulado de cada prova.
   ========================================================= */
const PV_LETTERS = 'ABCDE';
function pvNum(v, dec){ return Number(v).toLocaleString('pt-BR', {minimumFractionDigits:dec||0, maximumFractionDigits:dec||0}); }
/* monta a questão: options na ordem em que aparecem; correct = índice da certa */
function pvQ({subjectId, diff, text, visual, options, correct, steps}){
  const plain = String(text).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  return {subjectId, diff: diff||'medio', ex:{
    type:'single', styleQ:true, question: plain, answer: correct,
    qVisual: `<div class="geo-qtext pv-qtext">${text}</div>${visual||''}`,
    displayAnswer: `(${PV_LETTERS[correct]}) ${options[correct]}`,
    steps, mcOptions: options.map((l,i)=>({label:String(l), ok:i===correct}))}};
}
/* alternativas numéricas: certa + distratores, sem repetir, em ordem crescente (ou decrescente) */
function pvNumOpts(right, cands, n, fmtFn, desc){
  const key = v=> Math.round(v*10000);
  const seen = new Set([key(right)]), list = [right];
  for(const c of cands){ if(list.length>=n) break; if(c>0 && !seen.has(key(c))){ seen.add(key(c)); list.push(c); } }
  let k = 1; while(list.length<n){ const c = right + k*(Math.abs(right)>=10 ? Math.ceil(Math.abs(right)/10) : 1); k++; if(!seen.has(key(c))){ seen.add(key(c)); list.push(c); } }
  list.sort((a,b)=> desc ? b-a : a-b);
  return {options: list.map(fmtFn), correct: list.findIndex(v=>key(v)===key(right))};
}
function pvShuffleOpts(options, correctLabel){ const o = shuffle(options.slice()); return {options:o, correct:o.indexOf(correctLabel)}; }
/* gráfico de barras deitadas (ETEC/Unesp) */
function pvBarsH(title, labels, values, unit){
  const max = Math.max(...values), W = 320, rowH = 26, H = labels.length*rowH + 30;
  let s = `<text x="${W/2}" y="14" text-anchor="middle" class="pv-ch-t">${title}</text>`;
  labels.forEach((l,i)=>{ const y = 24 + i*rowH, w = values[i]/max*210;
    s += `<text x="56" y="${y+16}" text-anchor="end" class="pv-ch-l">${l}</text><rect x="62" y="${y+3}" width="${w.toFixed(1)}" height="18" rx="3" class="pv-ch-bar"/><text x="${(62+w-5).toFixed(1)}" y="${y+16}" text-anchor="end" class="pv-ch-v">${values[i]}${unit||''}</text>`; });
  return `<svg class="geo-fig pv-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${s}</svg>`;
}
function pvBarsV(title, labels, values){
  const max = Math.max(...values), W = 320, H = 200, bw = 230/labels.length;
  let s = `<text x="${W/2}" y="14" text-anchor="middle" class="pv-ch-t">${title}</text><line x1="40" y1="170" x2="300" y2="170" class="pv-ch-ax"/>`;
  labels.forEach((l,i)=>{ const x = 50 + i*bw, h = values[i]/max*130;
    s += `<rect x="${(x+bw*0.15).toFixed(1)}" y="${(170-h).toFixed(1)}" width="${(bw*0.7).toFixed(1)}" height="${h.toFixed(1)}" class="pv-ch-bar"/><text x="${(x+bw/2).toFixed(1)}" y="${(165-h).toFixed(1)}" text-anchor="middle" class="pv-ch-v2">${values[i]}</text><text x="${(x+bw/2).toFixed(1)}" y="186" text-anchor="middle" class="pv-ch-l2">${l}</text>`; });
  return `<svg class="geo-fig pv-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${s}</svg>`;
}
/* alternativa com palavras usa a letra normal; só números ficam na letra de conta */
function pvLblClass(l){ return /[A-Za-zÀ-ú]{3,}/.test(l) ? 'long' : 'mono'; }
function pvTable(head, rows){ return `<table class="pv-tbl"><thead><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }

const EXAM_STYLE = {
  /* ---------------- ENEM: situação do dia a dia, 5 alternativas ---------------- */
  enem:[
    ()=>{ // menor quantidade total de sódio por pacote
      const foods = ['Batata chips','Palitos salgados','Biscoito multigrãos','Biscoito de polvilho','Biscoito de água e sal'];
      let d, tot;
      do{ d = foods.map(()=>({n:randInt(3,8), g:pick([15,20,25,30,40,50]), mg:randInt(120,520)})); tot = d.map(x=>x.n*x.mg); }
      while(tot.filter(t=>t===Math.min(...tot)).length>1 || Math.min(...tot) > tot.slice().sort((a,b)=>a-b)[1] - 20);
      const best = tot.indexOf(Math.min(...tot));
      const cards = `<div class="pv-cards">${foods.map((f,i)=>`<div class="pv-card pv-c${i}"><b>${f}</b><span>Pacote com ${d[i].n} porções de ${d[i].g} g</span><span>${d[i].mg} mg de sódio por porção</span></div>`).join('')}</div>`;
      return pvQ({subjectId:'multiplicacao', diff:'medio',
        text:`Na cantina de uma escola, há cinco alimentos vendidos em pacotes com diferentes quantidades de porções. As informações nutricionais estão indicadas abaixo.<br><br>Uma estudante opta sempre pelo alimento com a <b>menor quantidade total de sódio por pacote</b>. Qual desses produtos deve ser escolhido?`,
        visual: cards, options: foods.map(f=>f+'.'), correct: best,
        steps:[`Sódio no pacote = número de porções × sódio por porção. O peso da porção (em gramas) não importa aqui!`,
          ...foods.map((f,i)=>`${f}: ${d[i].n} × ${d[i].mg} = ${pvNum(tot[i])} mg`),
          `O menor total é ${pvNum(tot[best])} mg: ${foods[best]}.`]}); },
    ()=>{ // leitura de gráfico: comportamento a partir de t1
      const down = Math.random()<0.5;
      const ctx = down
        ? {t:'A prática de meditação diminui a frequência respiratória de praticantes avançados. O gráfico mostra a frequência respiratória (em respirações por minuto) ao longo do tempo: f₁ é a frequência no instante t₁, quando começa a meditação, e f₂ é a frequência a partir do instante t₂, quando ela se estabiliza.', y:'Frequência (rpm)', ev:'Início da meditação'}
        : {t:'Durante uma corrida leve, os batimentos cardíacos de um atleta aumentam até se estabilizarem. O gráfico mostra os batimentos por minuto ao longo do tempo: b₁ é o valor no instante t₁, quando começa a corrida, e b₂ é o valor a partir do instante t₂, quando eles se estabilizam.', y:'Batimentos (bpm)', ev:'Início da corrida'};
      const y1 = down ? 50 : 120, y2 = down ? 120 : 50;
      const svg = `<svg class="geo-fig pv-chart" viewBox="0 0 320 200" role="img" aria-label="Gráfico"><line x1="40" y1="170" x2="305" y2="170" class="pv-ch-ax"/><line x1="40" y1="170" x2="40" y2="20" class="pv-ch-ax"/>
        <path d="M40 ${y1} H130 C165 ${y1}, 170 ${y2}, 205 ${y2} H295" class="pv-ch-line"/>
        <line x1="130" y1="${y1}" x2="130" y2="170" class="pv-ch-dash"/><line x1="205" y1="${y2}" x2="205" y2="170" class="pv-ch-dash"/><line x1="40" y1="${y2}" x2="205" y2="${y2}" class="pv-ch-dash"/>
        <text x="130" y="186" text-anchor="middle" class="pv-ch-l2">t₁</text><text x="205" y="186" text-anchor="middle" class="pv-ch-l2">t₂</text><text x="300" y="186" text-anchor="end" class="pv-ch-l2">Tempo (min)</text>
        <text x="34" y="${y1+4}" text-anchor="end" class="pv-ch-l2">${down?'f₁':'b₁'}</text><text x="34" y="${y2+4}" text-anchor="end" class="pv-ch-l2">${down?'f₂':'b₂'}</text>
        <text x="46" y="16" class="pv-ch-l2">${ctx.y}</text></svg>`;
      const right = down ? 'diminui até o instante t₂, a partir do qual se torna constante.' : 'aumenta até o instante t₂, a partir do qual se torna constante.';
      const o = pvShuffleOpts(['mantém-se constante.','é diretamente proporcional ao tempo.','é inversamente proporcional ao tempo.', right, `${down?'diminui':'aumenta'} de forma proporcional ao tempo, tanto entre t₁ e t₂ quanto após t₂.`], right);
      return pvQ({subjectId:'graficos', diff:'facil',
        text:`${ctx.t}<br><br>A partir do instante t₁, o comportamento ${down?'da frequência respiratória':'dos batimentos'}, em relação ao tempo,`,
        visual: svg, options:o.options, correct:o.correct,
        steps:[`Leia o gráfico por partes. Até t₁ a linha é reta e horizontal: o valor não muda.`, `Entre t₁ e t₂ a linha ${down?'desce':'sobe'}, mas fazendo curva (não é uma reta inclinada): não é proporcional ao tempo.`, `Depois de t₂ a linha volta a ficar horizontal: o valor fica constante.`, `Resposta: ${right}`]}); },
    ()=>{ // poliedro: quantas cores (faces congruentes = mesma cor)
      const n = pick([5,6]), nome = n===5 ? 'pentagonal' : 'hexagonal', tronco = Math.random()<0.6;
      const right = tronco ? 4 : 3;
      const o = pvNumOpts(right, [9,8,6,5,3,4], 5, v=>String(v), true);
      return pvQ({subjectId:'espacial', diff:'medio',
        text:`Uma fábrica usou uma impressora 3D para produzir o protótipo de uma peça, com forma de poliedro convexo, obtido juntando dois sólidos: um <b>prisma ${nome} regular reto</b> e ${tronco ? `um <b>tronco de pirâmide ${nome} reta</b>. A base maior do tronco coincide com uma das bases do prisma` : `uma <b>pirâmide ${nome} regular</b>. A base da pirâmide coincide com uma das bases do prisma`}.<br><br>Para pintar a superfície, faces congruentes entre si devem ter a mesma cor, e faces não congruentes devem ter cores diferentes. Qual é a quantidade de cores utilizadas?`,
        options:o.options, correct:o.correct,
        steps:[`A face onde os dois sólidos se encostam fica escondida: não é pintada.`, `Prisma: as ${n} faces laterais são retângulos iguais → 1 cor. A outra base (um ${nome==='pentagonal'?'pentágono':'hexágono'}) aparece → 1 cor.`,
          tronco ? `Tronco: as ${n} faces laterais são trapézios iguais → 1 cor. A base menor é um ${nome==='pentagonal'?'pentágono':'hexágono'} menor que a base do prisma (não é congruente) → 1 cor.` : `Pirâmide: as ${n} faces laterais são triângulos iguais → 1 cor.`,
          `Total: ${tronco ? '1 + 1 + 1 + 1 = 4' : '1 + 1 + 1 = 3'} cores.`]}); },
    ()=>{ // diferença entre marcas de tempo (decimais)
      const fem = Math.random()<0.4, ref = fem ? 11 : 10, rec = fem ? randInt(1049,1089)/100 : randInt(958,989)/100, dif = Math.round((ref-rec)*100)/100;
      const o = pvNumOpts(dif, [Math.round((dif>0.4 ? dif-0.4 : dif+0.2)*100)/100, Math.round((dif+0.1)*100)/100, Math.round((dif+0.6)*100)/100, Math.round((dif+1)*100)/100], 5, v=>pvNum(v,2));
      return pvQ({subjectId:'decimais', diff:'facil',
        text:`No atletismo, um grande desafio da prova de 100 metros rasos ${fem?'feminina':'masculina'} é terminar abaixo da marca de referência de ${pvNum(ref,2)} segundos. Um atleta estabeleceu um recorde com o tempo de ${pvNum(rec,2)} segundos.<br><br>Qual é a diferença, em segundo, entre a marca de referência e o recorde?`,
        options:o.options, correct:o.correct,
        steps:[`Diferença = maior − menor = ${pvNum(ref,2)} − ${pvNum(rec,2)}`, `Arme a conta com as vírgulas alinhadas (${pvNum(ref,2)} tem as mesmas 2 casas):`, ...subColumnSteps(Math.round(ref*100), Math.round(rec*100), 2).steps]}); },
  ],

  /* ---------------- ETEC: texto + figura, contas sem calculadora ---------------- */
  etec:[
    ()=>{ // área da cerca
      const L = pick([300,400,500,600,700,800]), H = pick([1.5,1.6,1.7,1.8,2]), p = pick([0.4,0.5,0.6]), c = Math.round(L*H);
      const o = pvNumOpts(c, [2*c, Math.round(c*1.65), Math.round(L*(H-0.2)), Math.round(L*(H-0.4)), Math.round(L*(H+p))], 5, v=>`${pvNum(v)} m²`, true);
      const svg = `<svg class="geo-fig" viewBox="0 0 320 200" role="img" aria-label="Esquema da cerca"><rect x="40" y="30" width="220" height="${110}" class="pv-fence"/><rect x="40" y="${140-110*p/H}" width="220" height="${110*p/H}" class="pv-fence2"/><rect x="40" y="140" width="220" height="16" class="pv-base"/><rect x="34" y="24" width="8" height="140" class="pv-post"/><rect x="258" y="24" width="8" height="140" class="pv-post"/>
        <text x="150" y="${30+(110-110*p/H)/2+5}" text-anchor="middle" class="pv-ch-t">Malha grande</text><text x="150" y="${140-110*p/H/2+5}" text-anchor="middle" class="pv-ch-t">Malha pequena</text><text x="150" y="152" text-anchor="middle" class="pv-ch-l2">Base de concreto</text>
        <path d="M274 30 h6 v110 h-6" class="geo-mark"/><text x="284" y="${90}" class="pv-ch-t">${pvNum(H,2)} m</text><path d="M268 ${140-110*p/H} h4 v${110*p/H} h-4" class="geo-mark"/><text x="284" y="${140-110*p/H/2+18}" class="pv-ch-l2">${pvNum(p,1)} m</text></svg>`;
      return pvQ({subjectId:'geometria', diff:'medio',
        text:`Para reduzir atropelamentos de animais silvestres, recomenda-se construir cercas que levam os animais até as passagens de fauna. Cada lado da passagem deve ter <b>${pvNum(L)} m</b> de cercamento. O esquema mostra como cada trecho de cerca é construído (a altura total da tela é de ${pvNum(H,2)} m, já contando a malha pequena).<br><br>Qual é a área total aproximada de cercamento a ser construído para cada lado da passagem?`,
        visual: svg, options:o.options, correct:o.correct,
        steps:[`A tela é um retângulo: área = comprimento × altura.`, `A altura de ${pvNum(H,2)} m já inclui os ${pvNum(p,1)} m da malha pequena: não some de novo!`, `Área = ${pvNum(L)} × ${pvNum(H,2)} = ${pvNum(c)} m²`]}); },
    ()=>{ // média dos valores de um gráfico de barras
      let v; do{ const s = randInt(10,22); v = [s]; for(let i=1;i<6;i++) v.push(v[i-1] + randInt(1,5)); }while(v.reduce((a,b)=>a+b,0) % 6 !== 0);
      const sum = v.reduce((a,b)=>a+b,0), m = sum/6, med = (v[2]+v[3])/2;
      const o = pvNumOpts(m, [m-8, med, (v[0]+v[5])/2, m+1, m-2, v[5]-2], 5, x=>pvNum(x, Number.isInteger(x)?0:1));
      return pvQ({subjectId:'estatistica', diff:'medio',
        text:`Estima-se que o mercado de um medicamento deverá crescer nos próximos anos, conforme o gráfico (valores em bilhões de dólares).<br><br>Assinale a alternativa que contém o <b>valor médio</b> do tamanho desse mercado durante o período de 2025 a 2030.`,
        visual: pvBarsH('Crescimento previsto (bilhões de dólares)', ['2025','2026','2027','2028','2029','2030'], v),
        options:o.options, correct:o.correct,
        steps:[`Média = soma dos valores ÷ quantidade de valores.`, `Soma: ${v.join(' + ')} = ${sum}`, `São 6 anos (2025 a 2030): ${sum} ÷ 6 = ${pvNum(m)}`]}); },
    ()=>{ // porcentagem de desconto (estilo ETEC)
      const P = pick([80,120,150,200,240,300,360]), d = pick([10,15,20,25,30]), fim = P*(1-d/100);
      const o = pvNumOpts(fim, [P-d, P*d/100, P*(1-d/100)-10, P*(1+d/100), P*(1-2*d/100)], 5, x=>`R$ ${pvNum(x,2)}`);
      return pvQ({subjectId:'porcentagem', diff:'facil',
        text:`Uma loja anunciou: "Toda a loja com <b>${d}% de desconto</b> no pagamento à vista". Uma mochila custava R$ ${pvNum(P,2)} antes da promoção.<br><br>Pagando à vista, o valor da mochila será`,
        options:o.options, correct:o.correct,
        steps:[`${d}% de ${P} = ${P} × ${d} ÷ 100 = ${pvNum(P*d/100,2)}`, `Desconto: tire do preço → ${P} − ${pvNum(P*d/100,2)} = ${pvNum(fim,2)}`, `Jeito rápido: pagar ${100-d}% do preço → ${P} × ${pvNum(1-d/100,2)} = R$ ${pvNum(fim,2)}`]}); },
  ],

  /* ---------------- FUVEST: análise de dados e funções, 5 alternativas ---------------- */
  fuvest:[
    ()=>{ // tabela de PIB e publicações: qual afirmação é correta
      const names = shuffle(['País A','País B','País C','País D','País E','País F']).slice(0,5).sort();
      const M1 = 12000, M2 = 400;
      let data; do{ data = names.map(n=>({n, pib: Math.random()<0.5 ? randInt(3,11)*1000 : randInt(14,60)*1000, pub: Math.random()<0.5 ? randInt(30,350) : randInt(450,3000)})); }
      while(!data.some((a,i)=> data.some((b,j)=> j>i && (a.pib>M1)===(b.pib>M1) && (a.pub>M2)===(b.pub>M2))));
      const q = x=> [x.pib>M1, x.pub>M2], desc = ([p,u])=> `PIB por pessoa ${p?'acima':'abaixo'} da média mundial e número de publicações por milhão de habitantes ${u?'acima':'abaixo'} da média mundial`;
      let pair; for(let i=0;i<5 && !pair;i++) for(let j=i+1;j<5;j++){ if(q(data[i]).join()===q(data[j]).join()){ pair=[i,j]; break; } }
      const right = `${data[pair[0]].n} e ${data[pair[1]].n} possuem ${desc(q(data[pair[0]]))}.`;
      const wrong = new Set();
      let guard = 0;
      while(wrong.size<4 && guard++<200){ const i = randInt(0,4); let j = randInt(0,4); if(i===j) continue; const [a,b] = i<j?[i,j]:[j,i]; const claim = [Math.random()<0.5, Math.random()<0.5];
        const ok = q(data[a]).join()===claim.join() && q(data[b]).join()===claim.join(); if(ok) continue; const s = `${data[a].n} e ${data[b].n} possuem ${desc(claim)}.`; if(s!==right) wrong.add(s); }
      const o = pvShuffleOpts([right, ...wrong], right);
      return pvQ({subjectId:'graficos', diff:'dificil',
        text:`A tabela apresenta o PIB por pessoa (em dólares) e o número de publicações científicas por milhão de habitantes de cinco países. A média mundial é de US$ ${pvNum(M1)} de PIB por pessoa e de ${M2} publicações por milhão de habitantes.<br><br>A partir da análise dos dados, é correto afirmar:`,
        visual: pvTable(['País','PIB por pessoa (US$)','Publicações por milhão'], data.map(x=>[x.n, pvNum(x.pib), pvNum(x.pub)])),
        options:o.options, correct:o.correct,
        steps:[`Compare cada país com as duas médias (US$ ${pvNum(M1)} e ${M2}):`, ...data.map(x=>`${x.n}: PIB ${x.pib>M1?'acima':'abaixo'} (${pvNum(x.pib)}) e publicações ${x.pub>M2?'acima':'abaixo'} (${pvNum(x.pub)})`), `Só a afirmação sobre ${data[pair[0]].n} e ${data[pair[1]].n} combina com os dois países.`]}); },
    ()=>{ // função com módulo: valor num ponto entre as raízes
      let r1, r2; do{ r1 = -randInt(1,6); r2 = randInt(1,6); }while(r2-r1<3);
      const b = -(r1+r2), c = r1*r2, k = randInt(r1+1, r2-1), qk = k*k + b*k + c, fk = Math.abs(qk) - b*k - c;
      const poly = polyFromCoefs([1,b,c]), lin = polyFromCoefs([-b,-c]);
      const o = pvNumOpts(fk, [k*k, -k*k, qk, Math.abs(qk), fk+2*Math.abs(qk), -fk], 5, v=>nm(v));
      return pvQ({subjectId:'modular', diff:'dificil',
        text:`No plano cartesiano, considere a função f(x) = |${poly}| ${lin.startsWith('−')?'− '+lin.slice(1):'+ '+lin}.<br><br>O valor de f(${nm(k)}) é`,
        options:o.options, correct:o.correct,
        steps:[`O que está dentro do módulo: ${poly}, que tem raízes ${nm(r1)} e ${nm(r2)} (soma ${nm(-b)}, produto ${nm(c)}).`, `Entre as raízes, essa parábola é negativa; fora delas, positiva. Por isso, fora de [${nm(r1)}, ${nm(r2)}] a função vira f(x) = x², e dentro vira f(x) = −(${poly}) ${lin.startsWith('−')?'− '+lin.slice(1):'+ '+lin}.`,
          `Para x = ${nm(k)} (entre as raízes): ${poly.replace(/x/g, `(${nm(k)})`)} = ${nm(qk)}, e |${nm(qk)}| = ${nm(Math.abs(qk))}`, `f(${nm(k)}) = ${nm(Math.abs(qk))} ${-b*k-c>=0?'+':'−'} ${Math.abs(-b*k-c)} = ${nm(fk)}`]}); },
  ],

  /* ---------------- UNICAMP: contexto longo, 4 alternativas (a–d) ---------------- */
  unicamp:[
    ()=>{ // "taxa zero" com despesa de cadastro
      const P = randInt(18,60)*1000, faixa = randInt(0,3), lim = [[1.2,2.3],[2.7,3.3],[3.7,4.3],[4.7,6]][faixa];
      let F, pct; do{ F = Math.round(P*(lim[0] + Math.random()*(lim[1]-lim[0]))/100/10)*10; pct = F/P*100; }while(!(faixa===0 ? pct<2.5 : faixa===1 ? pct>2.5 && pct<3.5 : faixa===2 ? pct>3.5 && pct<4.5 : pct>4.5));
      const opts = ['inferior a 2,5%.','entre 2,5% e 3,5%.','entre 3,5% e 4,5%.','superior a 4,5%.'];
      return pvQ({subjectId:'porcentagem', diff:'medio',
        text:`Um automóvel foi anunciado com um financiamento "taxa zero" por R$ ${pvNum(P,2)}, que poderiam ser pagos em doze parcelas iguais e sem entrada. Para efetivar a compra parcelada, no entanto, o consumidor precisaria pagar R$ ${pvNum(F,2)} para cobrir despesas do cadastro.<br><br>Dessa forma, em relação ao valor anunciado, o comprador pagará um acréscimo`,
        options:opts, correct:faixa,
        steps:[`Acréscimo em % = valor a mais ÷ valor anunciado × 100`, `${pvNum(F)} ÷ ${pvNum(P)} = ${pvNum(F/P,4)}`, `× 100 = ${pvNum(pct,2)}%`, `${pvNum(pct,2)}% está ${opts[faixa].replace('.','')}`]}); },
    ()=>{ // decolagem: altura = d · tg θ
      const d = pick([2,2.5,3,3.8,4.2,5]), t = pick([10,12,15,18,20]);
      const right = `${pvNum(d,1)} · tg(${t}°) km.`;
      const o = pvShuffleOpts([right, `${pvNum(d,1)} · sen(${t}°) km.`, `${pvNum(d,1)} · cos(${t}°) km.`, `${pvNum(d,1)} · sec(${t}°) km.`], right);
      const svg = `<svg class="geo-fig" viewBox="0 0 320 170" role="img" aria-label="Decolagem"><line x1="20" y1="140" x2="300" y2="140" class="pv-ch-ax"/><line x1="40" y1="140" x2="270" y2="60" class="geo-height"/><path d="M270 140 C 250 80, 285 50, 300 140" class="geo-shape"/><line x1="270" y1="60" x2="270" y2="140" class="geo-radius"/>
        <path d="M80 140 A40 40 0 0 0 78 127" class="geo-mark"/><text x="88" y="134" class="geo-lbl pv-lbl">${t}°</text><text x="155" y="160" text-anchor="middle" class="geo-lbl pv-lbl">${pvNum(d,1)} km</text><text x="276" y="100" class="geo-lbl geo-lbl-h pv-lbl">h</text><text x="30" y="132" class="pv-ch-l2">Aeroporto</text></svg>`;
      return pvQ({subjectId:'trigret', diff:'medio',
        text:`Ao decolar, um avião deixa o solo com um ângulo constante de ${t}°. A ${pvNum(d,1)} km da cabeceira da pista existe um morro íngreme. A figura ilustra a decolagem, fora de escala.<br><br>Podemos concluir que o avião ultrapassa o morro a uma altura, a partir da sua base, de`,
        visual:svg, options:o.options, correct:o.correct,
        steps:[`Forma-se um triângulo retângulo: a distância ${pvNum(d,1)} km é o cateto adjacente ao ângulo de ${t}° e a altura h é o cateto oposto.`, `A razão que liga oposto e adjacente é a tangente: tg(${t}°) = h ÷ ${pvNum(d,1)}`, `h = ${pvNum(d,1)} · tg(${t}°) km`]}); },
    ()=>{ // resfriamento com logaritmo
      const Tar = pick([20,30,40]), m = pick([2,3,5,7]), dd = pick([60,80,100,120,150]), T0 = Tar + m*dd, T1 = Tar + dd, k = pick([10,12,15,20]);
      const right = `${k} · log(${m}) minutos.`;
      const o = pvShuffleOpts([`${k} · [log(${m}) − 1] minutos.`, `${k} · [1 − log(${m})] minutos.`, right, `[1 − log(${m})] / ${k} minutos.`], right);
      return pvQ({subjectId:'logaritmo', diff:'dificil',
        text:`Uma barra cilíndrica é aquecida a uma temperatura de ${T0} °C. Em seguida, é exposta a uma corrente de ar a ${Tar} °C. A temperatura no centro do cilindro varia de acordo com a função<br><b>T(t) = (T₀ − T<sub>AR</sub>) × 10<sup>−t/${k}</sup> + T<sub>AR</sub></b>,<br>sendo t o tempo em minutos, T₀ a temperatura inicial e T<sub>AR</sub> a temperatura do ar.<br><br>O tempo para que a temperatura no centro atinja ${T1} °C é dado por (log na base 10):`,
        options:o.options, correct:o.correct,
        steps:[`Substitua: ${T1} = (${T0} − ${Tar}) × 10<sup>−t/${k}</sup> + ${Tar}`, `${T1-Tar} = ${T0-Tar} × 10<sup>−t/${k}</sup> → 10<sup>−t/${k}</sup> = ${T1-Tar}/${T0-Tar} = 1/${m}`, `Aplique log dos dois lados: −t/${k} = log(1/${m}) = −log(${m})`, `t = ${k} · log(${m}) minutos`]}); },
    ()=>{ // triângulos isósceles semelhantes: comprimento CE
      const t = pick([30,45,60]), ans = {30:'a√(7/3)', 45:'a√(5/2)', 60:'a√3'}[t];
      const sets = {30:['a√(5/3)','a√(8/3)','a√(7/3)','a√2'], 45:['a√2','a√(5/2)','a√3','a√(3/2)'], 60:['a√2','a√(5/2)','a√3','a√(7/3)']}[t];
      const tg2 = {30:'1/3', 45:'1', 60:'3'}[t];
      const svg = `<svg class="geo-fig" viewBox="0 0 320 150" role="img" aria-label="Triângulos"><polygon points="20,120 200,120 110,${120-90*Math.tan(t*Math.PI/180)}" class="geo-shape"/><polygon points="200,120 290,120 245,${120-45*Math.tan(t*Math.PI/180)}" class="geo-shape"/><line x1="110" y1="${120-90*Math.tan(t*Math.PI/180)}" x2="245" y2="${120-45*Math.tan(t*Math.PI/180)}" class="geo-height"/>
        <text x="12" y="132" class="geo-lbl pv-lbl">A</text><text x="196" y="138" class="geo-lbl pv-lbl">B</text><text x="292" y="132" class="geo-lbl pv-lbl">D</text><text x="104" y="${112-90*Math.tan(t*Math.PI/180)}" class="geo-lbl pv-lbl">C</text><text x="246" y="${112-45*Math.tan(t*Math.PI/180)}" class="geo-lbl pv-lbl">E</text><text x="110" y="140" text-anchor="middle" class="geo-lbl pv-lbl">2a</text><text x="245" y="140" text-anchor="middle" class="geo-lbl pv-lbl">a</text><text x="40" y="114" class="pv-ch-l2">${t}°</text></svg>`;
      return pvQ({subjectId:'trigret', diff:'dificil',
        text:`Na figura, ABC e BDE são triângulos isósceles semelhantes, de bases 2a e a, respectivamente, e o ângulo CÂB = ${t}°. Portanto, o comprimento do segmento CE é:`,
        visual:svg, options:sets, correct:sets.indexOf(ans),
        steps:[`Coloque A na origem: A(0, 0), B(2a, 0), D(3a, 0).`, `A altura de ABC sai do meio da base: C(a, a·tg ${t}°). Em BDE, a base é a, então E(2,5a; 0,5a·tg ${t}°).`, `Diferenças: Δx = 2,5a − a = 1,5a e Δy = 0,5a·tg ${t}°.`, `CE² = (1,5a)² + (0,5a·tg ${t}°)² = 2,25a² + 0,25a²·tg² ${t}° (tg² ${t}° = ${tg2})`, `CE = ${ans}`]}); },
  ],

  /* ---------------- UNESP: geometria e porcentagem com figura, 5 alternativas ---------------- */
  unesp:[
    ()=>{ // largura da borda da colcha
      let a, b, x, R; do{ a = pick([2,2.5,3,1.5]); b = a + pick([0.5,1]); x = pick([0.1,0.15,0.2,0.25,0.3]); R = Math.round(((a+2*x)*(b+2*x) - a*b)*10000)/10000; }while(Math.abs(R*100 - Math.round(R*100))>1e-6);
      const all = [0.1,0.15,0.2,0.25,0.3], o = pvShuffleOpts(all.map(v=>`${pvNum(v,2)} m.`), `${pvNum(x,2)} m.`);
      return pvQ({subjectId:'eq2', diff:'dificil',
        text:`Dona Maria fez uma colcha retangular de medida ${pvNum(a,1)} m por ${pvNum(b,1)} m. Ela quer adicionar uma borda de mesma largura em todos os lados da colcha, usando exatamente <b>${pvNum(R,2)} metros quadrados</b> de renda.<br><br>Qual deve ser a largura da borda?`,
        options:o.options, correct:o.correct,
        steps:[`Com borda de largura x, a colcha fica (${pvNum(a,1)} + 2x) por (${pvNum(b,1)} + 2x).`, `Área da borda = área nova − área antiga: (${pvNum(a,1)} + 2x)(${pvNum(b,1)} + 2x) − ${pvNum(a*b,2)} = ${pvNum(R,2)}`, `Distribuindo: 4x² + ${pvNum(2*(a+b),1)}x = ${pvNum(R,2)}`, `Testando x = ${pvNum(x,2)}: 4 × ${pvNum(x*x,4)} + ${pvNum(2*(a+b),1)} × ${pvNum(x,2)} = ${pvNum(4*x*x,2)} + ${pvNum(2*(a+b)*x,2)} = ${pvNum(R,2)} ✓`, `A largura é ${pvNum(x,2)} m.`]}); },
    ()=>{ // folha quadrada com cantos cortados
      const L = pick([20,24,30,36,40]); const c = randInt(Math.ceil(L/6), Math.floor(L/3)); const A = L*L - 2*c*c;
      const o = pvShuffleOpts([A, L*L-c*c, L*L-4*c*c, L*L-c*c/2, L*L-3*c*c].filter((v,i,arr)=>v>0 && arr.indexOf(v)===i).slice(0,5).map(v=>`${pvNum(v,1).replace(',0','')} cm².`), `${pvNum(A)} cm².`);
      const s = 200/L, cc = c*s;
      const svg = `<svg class="geo-fig" viewBox="0 0 320 240" role="img" aria-label="Folha com cantos cortados"><rect x="60" y="20" width="200" height="200" class="geo-ghost"/><polygon points="${60+cc},20 ${260-cc},20 260,${20+cc} 260,${220-cc} ${260-cc},220 ${60+cc},220 60,${220-cc} 60,${20+cc}" class="geo-shape"/>
        <text x="${60+cc/2}" y="14" text-anchor="middle" class="geo-lbl pv-lbl">${c} cm</text><text x="54" y="${20+cc/2+5}" text-anchor="end" class="geo-lbl pv-lbl">${c} cm</text><text x="160" y="236" text-anchor="middle" class="geo-lbl pv-lbl">${L} cm</text></svg>`;
      return pvQ({subjectId:'geometria', diff:'medio',
        text:`Uma folha quadrada de lado ${L} cm teve seus quatro cantos igualmente cortados, como representado na figura (cada corte tira um triângulo com dois lados de ${c} cm).<br><br>Após os cortes, a área do que restou da folha é`,
        visual:svg, options:o.options, correct:o.correct,
        steps:[`Área da folha inteira: ${L} × ${L} = ${L*L} cm²`, `Cada canto é um triângulo retângulo com catetos de ${c} cm: área = ${c} × ${c} ÷ 2 = ${pvNum(c*c/2,1).replace(',0','')} cm²`, `4 cantos: 4 × ${pvNum(c*c/2,1).replace(',0','')} = ${2*c*c} cm²`, `Sobrou: ${L*L} − ${2*c*c} = ${A} cm²`]}); },
    ()=>{ // votação: porcentagem de uma porcentagem
      let T, V, p, vals, ans; do{ T = pick([200,300,400,500]); p = pick([20,25,30,40,50]); V = randInt(6,20)*5; vals = [randInt(3,8)*5, randInt(6,14)*5, randInt(8,18)*5, randInt(3,8)*5, V]; ans = V*p/100/T*100; }while(vals.reduce((a,b)=>a+b,0)>T || (V*p)%100!==0 || Math.abs(ans*10-Math.round(ans*10))>1e-6);
      const colors = [['CINZA',p]], rest = 100-p, a1 = Math.round(rest*0.55/5)*5, a2 = Math.round((rest-a1)*0.75/5)*5; colors.push(['AMARELO',a1],['LARANJA',a2],['VERDE',rest-a1-a2]);
      const o = pvNumOpts(ans, [ans/2, V*p/100, ans*3, V/T*100, p], 5, v=>`${pvNum(v,1)}%.`);
      return pvQ({subjectId:'porcentagem', diff:'medio',
        text:`Em um condomínio com ${T} apartamentos, cada apartamento votou uma única vez no que deveria ser melhorado no prédio (gráfico). Depois, só os ${V} apartamentos que escolheram o <b>Tratamento da Fachada</b> votaram na cor da nova pintura (tabela).<br><br>Em relação ao total de apartamentos do condomínio, o número de votos na cor Cinza corresponde a qual porcentagem?`,
        visual: pvBarsV('Preferência de melhoria', ['Brinq.','Jogos','Acad.','Festas','Fachada'], vals) + pvTable(['Paleta de cores','Votos'], colors.map(c=>[c[0], `${c[1]}%`])),
        options:o.options, correct:o.correct,
        steps:[`Votaram na cor só os ${V} apartamentos da Fachada.`, `Cinza teve ${p}% desses ${V}: ${V} × ${p} ÷ 100 = ${V*p/100} votos`, `Em relação aos ${T} apartamentos: ${V*p/100} ÷ ${T} = ${pvNum(V*p/100/T,4)} → ${pvNum(ans,1)}%`]}); },
  ],

  /* ---------------- OBMEP: raciocínio, 5 alternativas ---------------- */
  obmep:[
    ()=>{ // canudinho cortado ao meio 4 vezes
      const L = pick([8,12,16,20,24,32,40,48]);
      const o = pvNumOpts(L/8, [L/32, L/16, 3*L/16, L/4], 5, v=>`${fmt(v)} cm`);
      return pvQ({subjectId:'fracoes', diff:'medio',
        text:`Rafael fez 4 cortes em seu canudinho de ${L} cm de comprimento. No primeiro corte ele dividiu o canudinho ao meio e, em cada um dos outros três cortes, dividiu ao meio um pedaço já cortado. Ao terminar, percebeu que ficaram pedaços de apenas <b>dois comprimentos diferentes</b>.<br><br>Qual é o comprimento dos pedaços menores?`,
        options:o.options, correct:o.correct,
        steps:[`1º corte: ${L/2} e ${L/2}.`, `Pra sobrarem só 2 tamanhos, os cortes seguintes cortam os pedaços maiores: ${L/2} → ${L/4} + ${L/4}, e o outro ${L/2} → ${L/4} + ${L/4} (agora são 4 pedaços de ${L/4}).`, `O 4º corte divide um pedaço de ${L/4}: ${pvNum(L/8,1).replace(',0','')} + ${pvNum(L/8,1).replace(',0','')}.`, `Ficam pedaços de ${L/4} cm e ${pvNum(L/8,1).replace(',0','')} cm: os menores medem ${pvNum(L/8,1).replace(',0','')} cm.`]}); },
    ()=>{ // mochila: no máximo 12% do peso
      let P, p, tot, R, M; do{ P = randInt(30,70); p = pick([10,12,15]); tot = P*p/100; R = Math.floor(tot - 0.3); M = Math.round((tot-R)*1000); }while(M<300 || M>1500 || R<2);
      const o = pvNumOpts(R, [R-2,R-1,R+1,R+2], 5, v=>`${v} quilogramas`);
      return pvQ({subjectId:'porcentagem', diff:'medio',
        text:`É recomendável que o peso total da mochila com o material escolar de um estudante não ultrapasse ${p}% do peso do estudante. Ana pesa ${P} quilogramas e sua mochila vazia pesa ${pvNum(M)} gramas.<br><br>Qual é o peso máximo recomendado para o material escolar que Ana pode levar na mochila?`,
        options:o.options, correct:o.correct,
        steps:[`Peso máximo da mochila cheia: ${p}% de ${P} = ${P} × ${p} ÷ 100 = ${pvNum(tot,2)} kg`, `A mochila vazia já pesa ${pvNum(M)} g = ${pvNum(M/1000,2)} kg`, `Sobra para o material: ${pvNum(tot,2)} − ${pvNum(M/1000,2)} = ${R} kg`]}); },
    ()=>{ // folha dobrada ao meio de dois jeitos
      let a, b; do{ a = randInt(5,12)*2; b = randInt(2,a/2-1)*2; }while(a===b);
      const P = 2*(a+b), f1 = a + 2*b, f2 = 2*a + b, giveFirst = Math.random()<0.5, given = giveFirst ? f1 : f2, ans = giveFirst ? f2 : f1;
      const o = pvNumOpts(ans, [P/2, P-given, given, ans+5, ans-5], 5, v=>`${v} cm`);
      return pvQ({subjectId:'geometria', diff:'dificil',
        text:`Uma folha retangular de papel, de perímetro igual a ${P} cm, foi dobrada ao meio de duas maneiras diferentes (uma vez dobrando o lado maior, outra vez o lado menor). Em uma delas, o perímetro da folha dobrada é ${given} cm.<br><br>Qual é o perímetro da folha dobrada da outra maneira?`,
        options:o.options, correct:o.correct,
        steps:[`Chame os lados de x (maior) e y (menor): 2x + 2y = ${P} → x + y = ${P/2}.`, `Dobrando o lado maior ao meio, a folha fica x/2 por y: perímetro x + 2y. Dobrando o menor, fica x por y/2: perímetro 2x + y.`, `Somando as duas: (x + 2y) + (2x + y) = 3(x + y) = 3 × ${P/2} = ${3*P/2}`, `A outra dobra: ${3*P/2} − ${given} = ${ans} cm`]}); },
    ()=>{ // temperaturas: mais alta / mais baixa
      const T = randInt(18,32), d1 = randInt(2,6), d2 = randInt(3,8), seg = T - d1, qua = seg - d2;
      const o = pvNumOpts(qua, [seg, T - d2, qua + 2*d1, seg + d2, T + d1 - d2], 5, v=>`${v} °C`);
      return pvQ({subjectId:'eq1', diff:'facil',
        text:`A temperatura máxima de terça-feira foi ${d1} °C mais alta do que a de segunda-feira. A temperatura máxima de quarta-feira foi ${d2} °C mais baixa do que a de segunda-feira. Na terça-feira, a temperatura máxima foi de ${T} °C.<br><br>Qual foi a temperatura máxima de quarta-feira?`,
        options:o.options, correct:o.correct,
        steps:[`Comece pelo que você conhece: terça = ${T} °C.`, `Terça foi ${d1} °C mais alta que segunda → segunda = ${T} − ${d1} = ${seg} °C`, `Quarta foi ${d2} °C mais baixa que segunda → quarta = ${seg} − ${d2} = ${qua} °C`]}); },
  ],
};
function examStyleCount(examId){ return (EXAM_STYLE[examId] || []).length; }
/* n questões no estilo da prova, passando por todos os modelos antes de repetir */
function examStyleQuestions(examId, n){
  const gens = EXAM_STYLE[examId] || [];
  if(!gens.length) return [];
  const out = []; let order = [];
  for(let i=0;i<n;i++){ if(!order.length) order = shuffle(gens.slice()); out.push(order.pop()()); }
  return out;
}
