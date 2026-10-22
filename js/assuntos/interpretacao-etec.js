/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — ETEC
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */
IQ_ETEC.push(
  // frações (as horas de um dia)
  ()=>{
    const nome = iqName();
    const sono = pick([[1,3],[3,8]]), escola = pick([[1,4],[5,24]]);
    const outra = pick([['estudando em casa',[1,12]],['no treino de futebol',[1,8]],['no celular',[1,6]],['no transporte até a escola',[1,24]],['ajudando nas tarefas de casa',[1,12]]]);
    const acts = [['dormindo', sono], ['na escola', escola], [outra[0], outra[1]]];
    const hs = acts.map(a=> 24*a[1][0]/a[1][1]), usadas = hs.reduce((a,b)=>a+b,0), sobra = 24 - usadas;
    const nS = acts.reduce((a,x)=>a+x[1][0],0), dS = acts.reduce((a,x)=>a+x[1][1],0), ing = 24*(1 - nS/dS);
    return {subj:'fracoes', topic:'Frações', text:`<p>${nome} anotou como costuma usar as 24 horas de um dia de semana. O quadro mostra a fração do dia que ${nome} passa em cada atividade.</p>`,
      visual: iqTable(['Atividade','Fração do dia'], acts.map(a=>[a[0].charAt(0).toUpperCase()+a[0].slice(1), `${a[1][0]}/${a[1][1]}`])),
      ask:'Quantas horas por dia sobram para as outras atividades (lazer, banho, refeições etc.)?',
      opts: iqMC(sobra, [[usadas,'Essas são as horas gastas nas três atividades do quadro; falta tirar esse valor das 24 horas.'],[ing===Math.round(ing) ? ing : null,'Somou numeradores com numeradores e denominadores com denominadores; frações se somam com o mesmo denominador.'],[24 - hs[0] - hs[1],`Esqueceu de descontar o tempo ${acts[2][0]}.`],[(sobra/2)===Math.round(sobra/2) ? sobra/2 : null,'O dia tem 24 horas, não 12.'],[24 - hs[1] - hs[2],'Esqueceu de descontar as horas de sono.']], {fmt:v=>iqNum(v)+' h'}),
      steps:[...acts.map((a,i)=>`${a[0].charAt(0).toUpperCase()+a[0].slice(1)}: ${a[1][0]}/${a[1][1]} de 24 h = 24 ÷ ${a[1][1]}${a[1][0]>1?` × ${a[1][0]}`:''} = ${hs[i]} h`), `Horas usadas: ${hs.join(' + ')} = ${usadas} h`, `Sobram: 24 − ${usadas} = ${sobra} h`]};
  },
  // MMC (horários que coincidem)
  ()=>{
    const [a,b] = pick([[12,18],[15,20],[20,30],[18,24],[16,24],[10,25],[12,20],[30,45],[15,25]]);
    const start = randInt(5,8)*60 + pick([0,15,30]), m = lcm(a,b), g = gcd(a,b);
    const hm = v=> `${Math.floor(v/60)}h${String(v%60).padStart(2,'0')}`;
    const mult = x=> [...Array(Math.min(6, m/x + 1))].map((_,i)=> (i+1)*x).join(', ');
    return {subj:'mmcmdc', topic:'MMC', text:`<p>Num terminal, os ônibus da Linha Azul saem a cada ${a} minutos e os da Linha Verde saem a cada ${b} minutos. Às ${hm(start)}, um ônibus de cada linha saiu ao mesmo tempo.</p>`,
      visual: iqCards([{t:'Linha Azul', lines:[`sai a cada ${a} min`]}, {t:'Linha Verde', lines:[`sai a cada ${b} min`]}, {t:'Saída juntos', lines:[hm(start)]}]),
      ask:'A que horas os ônibus das duas linhas voltarão a sair juntos pela primeira vez?',
      opts: iqMC(start + m, [[start + a*b,'Multiplicou os intervalos: o produto é um múltiplo comum, mas não o menor.'],[start + a + b,'Somou os intervalos; o certo é achar o menor múltiplo comum (MMC).'],[start + g,`Usou o MDC (${g}); os horários coincidem no MMC.`],[start + 2*m,'Esse é o segundo encontro; a pergunta pede o primeiro.'],[start + Math.max(a,b),'Essa é só a próxima saída da linha mais demorada.']], {fmt:hm, step:5}),
      steps:[`Múltiplos de ${a}: ${mult(a)}…`, `Múltiplos de ${b}: ${mult(b)}…`, `O menor múltiplo comum é MMC(${a}, ${b}) = ${m} minutos`, `${hm(start)} + ${m} min = ${hm(start+m)}`]};
  },
  // ângulos (ponteiros do relógio)
  ()=>{
    const h = randInt(1,11), m = pick([0,30]);
    const aH = 30*h + m/2, aM = 6*m, d = Math.abs(aH - aM), ang = Math.min(d, 360-d);
    const d0 = Math.abs(30*h - aM), parado = Math.min(d0, 360-d0);
    const hora = `${h}h${m?'30':'00'}`;
    const cx = 160, cy = 100, R = 82, P = (r,t)=>[cx + r*Math.sin(t*Math.PI/180), cy - r*Math.cos(t*Math.PI/180)];
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="geo-face side"/>`;
    for(let i=0;i<60;i++){ const [x1,y1] = P(R, i*6), [x2,y2] = P(i%5 ? R-5 : R-10, i*6); s += cvL(x1, y1, x2, y2, i%5 ? 'iq-grid' : 'iq-axis'); }
    for(let i=1;i<=12;i++){ const [x,y] = P(R-22, i*30); s += iqT(x, y+4.5, i, 13); }
    const [mx,my] = P(66, aM), [hx,hy] = P(44, aH);
    s += `<line x1="${cx}" y1="${cy}" x2="${_f(mx)}" y2="${_f(my)}" stroke="#6B8CFF" stroke-width="3" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${_f(hx)}" y2="${_f(hy)}" stroke="#FF8A4C" stroke-width="5" stroke-linecap="round"/>` + cvDot(cx, cy, 4.5);
    return {subj:'angulos', topic:'Ângulos', text:`<p>O relógio de ponteiros da sala de aula marca exatamente ${hora}, como na figura.</p>`, visual: cvSVG(320, 200, s, 'Relógio de ponteiros'),
      ask:'Qual é a medida do menor ângulo formado pelos dois ponteiros?',
      opts: iqMC(ang, [[360-ang,'Esse é o ângulo maior; a pergunta pede o menor.'],[m ? parado : null,'O ponteiro das horas não fica parado em cima do número: em meia hora ele anda 15°.'],[ang/5,'Usou 6° entre dois números do relógio; entre dois números vizinhos são 360° ÷ 12 = 30°.'],[m ? ang + 15 : ang + 30,'Confira quantos graus o ponteiro das horas já andou.']], {fmt:v=>iqNum(v)+'°', step:15}),
      steps:['O relógio é uma volta de 360°, dividida em 12 partes: cada número fica a 30° do seguinte.', `Ponteiro dos minutos: ${m} min × 6° = ${aM}° (a partir do 12)`, `Ponteiro das horas: ${h} × 30°${m?' + 15° (meia hora anda meio espaço)':''} = ${aH}°`, `Diferença: |${aH}° − ${aM}°| = ${d}°${d>180?` → menor ângulo: 360° − ${d}° = ${ang}°`:''}`]};
  },
  // ângulos (ladrilhos em volta de um vértice)
  ()=>{
    const cfg = pick([
      {known:[['quadrado',90]], k:2, nome:'octógono'},
      {known:[['triângulo equilátero',60]], k:2, nome:'dodecágono'},
      {known:[['triângulo equilátero',60],['triângulo equilátero',60]], k:2, nome:'hexágono'},
      {known:[['triângulo equilátero',60],['triângulo equilátero',60],['triângulo equilátero',60]], k:2, nome:'quadrado'},
      {known:[['quadrado',90],['quadrado',90]], k:3, nome:'triângulo equilátero'},
      {known:[['hexágono',120],['triângulo equilátero',60]], k:2, nome:'quadrado'},
      {known:[['hexágono',120]], k:2, nome:'hexágono'},
    ]);
    const S = cfg.known.reduce((a,x)=>a+x[1],0), x = (360 - S)/cfg.k;
    const conta = {}; cfg.known.forEach(([n])=> conta[n] = (conta[n]||0)+1);
    const plural = {'quadrado':'quadrados','triângulo equilátero':'triângulos equiláteros','hexágono':'hexágonos'};
    const lista = Object.keys(conta).map(n=> conta[n]===1 ? `um ${n}` : `${conta[n]===2?'dois':'três'} ${plural[n]}`).join(' e ');
    const secs = [...cfg.known.map(k=>({a:k[1], t:k[1]+'°', known:true})), ...[...Array(cfg.k)].map(()=>({a:x, t:'x', known:false}))];
    const cx = 160, cy = 100, R = 86, P = (r,t)=>[cx + r*Math.sin(t*Math.PI/180), cy - r*Math.cos(t*Math.PI/180)];
    let s = '', t0 = -90 + randInt(0,3)*15;
    secs.forEach(sc=>{ const [x1,y1] = P(R,t0), [x2,y2] = P(R,t0+sc.a), [lx,ly] = P(sc.a<70 ? 58 : 50, t0+sc.a/2);
      s += `<path d="M${cx} ${cy} L${_f(x1)} ${_f(y1)} A${R} ${R} 0 0 1 ${_f(x2)} ${_f(y2)} Z" class="geo-face ${sc.known?'side':'front'}" style="${sc.known?'':'fill:rgba(255,138,76,.25)'}"/>`;
      s += iqT(lx, ly+5, sc.t, 14, sc.known ? '' : 'geo-lbl-h'); t0 += sc.a; });
    s += cvDot(cx, cy, 4);
    return {subj:'angulos', topic:'Ângulos', text:`<p>Um piso foi coberto com ladrilhos em forma de polígonos regulares, encaixados sem deixar buracos. Em um dos vértices encontram-se ${lista} e mais ${cfg.k===2?'dois':'três'} ladrilhos iguais entre si, como mostra o esquema (fora de escala).</p>`,
      visual: cvSVG(320, 200, s, 'Ladrilhos em volta de um vértice'),
      ask:'Qual é a medida do ângulo x de cada um desses ladrilhos iguais?',
      opts: iqMC(x, [[360 - S,`Esse é o espaço que sobra para os ${cfg.k} ladrilhos juntos; falta dividir por ${cfg.k}.`],[(180 - S)/cfg.k,'Usou 180°, mas em volta de um ponto a soma dos ângulos é 360°.'],[Math.round(360/(cfg.known.length+cfg.k)),'Dividiu 360° pelo número de ladrilhos, mas os ladrilhos não têm todos o mesmo ângulo.'],[cfg.known[0][1] !== x ? cfg.known[0][1] : null,`Esse é o ângulo do ${cfg.known[0][0]}, não o dos ladrilhos iguais.`],[(360 + S)/cfg.k,'Os ângulos já conhecidos devem ser subtraídos de 360°, não somados.']], {fmt:v=>iqNum(v)+'°', step:15}),
      steps:['Em volta de um ponto, os ângulos somam 360°.', cfg.known.length>1 ? `Ângulos conhecidos: ${cfg.known.map(k=>k[1]+'°').join(' + ')} = ${S}°` : `Ângulo conhecido: ${S}°`, `${cfg.k}x = 360° − ${S}° = ${360-S}° → x = ${360-S}° ÷ ${cfg.k} = ${x}°`, `(É o ângulo interno do ${cfg.nome}${/quadrado|equilátero/.test(cfg.nome) ? '' : ' regular'}.)`]};
  },
  // área em planta de casa (caixas de piso)
  ()=>{
    let w1, w2, h1, h2, c, A;
    do{ w1 = pick([3,3.5,4,4.5,5]); w2 = pick([2.5,3,3.5,4]); h1 = pick([3,3.5,4]); h2 = pick([2,2.5,3]); c = pick([1.5,2,2.5]); A = w2*(h1+h2); }
    while(Math.abs(A/c - Math.round(A/c)) < 1e-9);
    const cx = Math.ceil(A/c), tot = (w1+w2)*(h1+h2);
    const W = w1+w2, H = h1+h2, k = Math.min(220/W, 140/H), x0 = 64, y0 = 30;
    const room = (x, y, w, h, nome, hi)=> `<rect x="${_f(x0+x*k)}" y="${_f(y0+y*k)}" width="${_f(w*k)}" height="${_f(h*k)}" class="geo-face ${hi?'front':'side'}" style="${hi?'fill:rgba(255,138,76,.28)':''}"/>` + iqT(x0+(x+w/2)*k, y0+(y+h/2)*k+4, nome, 11.5);
    let s = room(0,0,w1,h1,'Sala') + room(w1,0,w2,h1,'Cozinha',true) + room(0,h1,w1,h2,'Quarto') + room(w1,h1,w2,h2,'Banheiro',true);
    s += iqT(x0+w1*k/2, y0-8, iqNum(w1)+' m', 11.5, 'geo-lbl-h') + iqT(x0+(w1+w2/2)*k, y0-8, iqNum(w2)+' m', 11.5, 'geo-lbl-h');
    s += iqT(x0-6, y0+h1*k/2+4, iqNum(h1)+' m', 11.5, 'geo-lbl-h', 'end') + iqT(x0-6, y0+(h1+h2/2)*k+4, iqNum(h2)+' m', 11.5, 'geo-lbl-h', 'end');
    return {subj:'geometria', topic:'Área', text:`<p>A planta abaixo mostra uma casa retangular dividida em quatro cômodos. A cozinha e o banheiro (em destaque) vão receber piso novo. O piso é vendido em caixas fechadas, e cada caixa cobre ${iqNum(c)} m².</p>`,
      visual: cvSVG(320, _f(y0 + H*k + 14), s, 'Planta da casa'),
      ask:'Qual é o menor número de caixas que precisa ser comprado para cobrir a cozinha e o banheiro?',
      opts: iqMC(cx, [[Math.floor(A/c),'Arredondou para baixo: com essa quantidade faltaria piso.'],[Math.ceil(tot/c - 1e-9),'Calculou o piso da casa inteira, não só da cozinha e do banheiro.'],[Math.ceil(w2*h1/c - 1e-9),'Calculou só o piso da cozinha; o banheiro também vai receber piso.'],[Math.ceil(2*(w2+h1+h2)/c - 1e-9),'Usou o perímetro (contorno), mas piso cobre a área.']], {fmt:v=>v+' caixas'}),
      steps:[`Cozinha: ${iqNum(w2)} × ${iqNum(h1)} = ${iqNum(w2*h1)} m²; banheiro: ${iqNum(w2)} × ${iqNum(h2)} = ${iqNum(w2*h2)} m²`, `Área a cobrir: ${iqNum(w2*h1)} + ${iqNum(w2*h2)} = ${iqNum(A)} m²`, `${iqNum(A)} ÷ ${iqNum(c)} ≈ ${iqNum(A/c)} → como não se compra caixa pela metade, são ${cx} caixas`]};
  },
  // porcentagem de pesquisa (gráfico de colunas)
  ()=>{
    const tema = pick([
      {t:'o esporte preferido', l:['Futebol','Vôlei','Basquete','Natação','Skate']},
      {t:'o lanche preferido da cantina', l:['Pizza','Pastel','Misto','Salada','Tapioca']},
      {t:'o estilo de música preferido', l:['Funk','Pop','Rock','Sertanejo','Rap']},
    ]);
    let v; do{ v = [...Array(4)].map(()=> randInt(1,7)); v.push(20 - v.reduce((a,b)=>a+b,0)); }
    while(v[4]<1 || v[4]>9 || v.filter(x=>x===Math.max(...v)).length>1 || v.filter(x=>x===Math.min(...v)).length>1);
    v = v.map(x=>x*5);
    const N = pick([200,300,400,500,600,800]), iMax = v.indexOf(Math.max(...v)), iMin = v.indexOf(Math.min(...v));
    const pM = v[iMax], pm = v[iMin], ans = (pM - pm)*N/100;
    return {subj:'porcentagem', topic:'Porcentagem', text:`<p>Uma escola perguntou a ${N} alunos qual é ${tema.t}. Cada aluno escolheu uma única opção. O gráfico mostra a porcentagem de alunos que escolheu cada opção.</p>`,
      visual: iqBarsSVG(tema.l, v, {title:'Escolha dos alunos (em %)'}),
      ask:'Quantos alunos a mais escolheram a opção mais votada em relação à menos votada?',
      opts: iqMC(ans, [[pM - pm,'Essa é a diferença em pontos percentuais; falta calcular quantos alunos isso representa.'],[pM*N/100,`Esse é o número de alunos que escolheram ${tema.l[iMax]}, não a diferença.`],[(pM + pm)*N/100,'Somou as duas porcentagens; a pergunta pede a diferença.'],[pm*N/100,`Esse é o número de alunos que escolheram ${tema.l[iMin]}.`]], {fmt:v=>iqNum(v)+' alunos'}),
      steps:[`Mais votada: ${tema.l[iMax]} (${pM}%); menos votada: ${tema.l[iMin]} (${pm}%)`, `Diferença: ${pM}% − ${pm}% = ${pM-pm}%`, `${pM-pm}% de ${N} = ${pM-pm} × ${N} ÷ 100 = ${ans} alunos`]};
  },
  // equação do 1º grau (divisão de dinheiro)
  ()=>{
    const [n1,n2,n3] = shuffle(IQ_NAMES.slice()).slice(0,3);
    const x = randInt(6,30)*5, a = randInt(2,8)*5, T = 4*x + a;
    const by = (y,h,label,w,cls)=> `<rect x="${y}" y="${h}" width="${w}" height="26" rx="3" class="geo-face ${cls}"/>` + iqT(y+w/2, h+18, label, 12);
    let s = '';
    [[n1,['x']],[n2,['x','+'+a]],[n3,['x','x']]].forEach(([n,parts],i)=>{ const y = 14 + i*40; s += iqT(74, y+18, n, 12, '', 'end'); let xx = 82;
      parts.forEach(p=>{ const w = p==='x' ? 70 : 46; s += by(xx, y, p==='x' ? 'x' : 'R$ '+a, w, p==='x' ? 'top' : 'front'); xx += w; }); });
    s += iqT(300, 82, 'total:', 11, 'iq-tick', 'end') + iqT(300, 98, iqMoney(T), 12, 'geo-lbl-h', 'end');
    return {subj:'eq1', topic:'Equação do 1º grau', text:`<p>Três irmãos, ${n1}, ${n2} e ${n3}, dividiram ${iqMoney(T)} que ganharam vendendo bolos na feira. ${n2} recebeu ${iqMoney(a)} a mais que ${n1}, e ${n3} recebeu o dobro do que ${n1} recebeu.</p>`,
      visual: cvSVG(320, 136, s, 'Esquema da divisão do dinheiro'),
      ask:`Quanto ${n1} recebeu?`,
      opts: iqMC(x, [[T%3===0 ? T/3 : null,'Dividiu o total igualmente entre os três, mas as partes são diferentes.'],[(T-a)%3===0 ? (T-a)/3 : null,'Montou x + x + x; quem recebeu o dobro conta como 2x.'],[(T+a)%4===0 ? (T+a)/4 : null,`Os ${iqMoney(a)} a mais devem ser subtraídos do total, não somados.`],[2*x,`Esse é o valor de ${n3}.`],[x + a,`Esse é o valor de ${n2}.`]], {fmt:iqMoney}),
      steps:[`${n1}: x · ${n2}: x + ${a} · ${n3}: 2x`, `x + (x + ${a}) + 2x = ${T} → 4x + ${a} = ${T}`, `4x = ${T - a} → x = ${T - a} ÷ 4 = ${x}`, `${n1} recebeu ${iqMoney(x)}`]};
  },
  // sequência de figuras (palitos)
  ()=>{
    const tipo = pick(['quadrados','triângulos','casinhas']);
    const b = {quadrados:3, triângulos:2, casinhas:5}[tipo], um = {quadrados:4, triângulos:3, casinhas:6}[tipo];
    const f = n=> b*n + 1, N = randInt(12,40), ans = f(N);
    const u = 26, base = 84;
    let s = '', x0 = 14;
    [1,2,3].forEach(n=>{ const E = new Map(), add = (x1,y1,x2,y2)=>{ const key = [[x1,y1],[x2,y2]].map(p=>p.map(v=>v.toFixed(1)).join(',')).sort().join('|'); E.set(key,[x1,y1,x2,y2]); };
      let w;
      if(tipo==='triângulos'){ const hh = u*0.87, B = i=>[x0+i*u, base], Tp = i=>[x0+u/2+i*u, base-hh];
        for(let k=0;k<n;k++){ const tri = k%2===0 ? [B(k/2), B(k/2+1), Tp(k/2)] : [Tp((k-1)/2), Tp((k+1)/2), B((k+1)/2)];
          for(let e=0;e<3;e++) add(...tri[e], ...tri[(e+1)%3]); }
        w = (n+1)/2*u;
      } else {
        const top = base - u;
        for(let k=0;k<n;k++){ const a = x0+k*u; add(a,base,a+u,base); add(a+u,base,a+u,top); add(a+u,top,a,top); add(a,top,a,base);
          if(tipo==='casinhas'){ add(a,top,a+u/2,top-u*0.6); add(a+u/2,top-u*0.6,a+u,top); } }
        w = n*u;
      }
      E.forEach(([x1,y1,x2,y2])=>{ s += `<line x1="${_f(x1)}" y1="${_f(y1)}" x2="${_f(x2)}" y2="${_f(y2)}" stroke="#FF8A4C" stroke-width="3" stroke-linecap="round"/>`; });
      s += iqT(x0 + w/2, base+20, `Figura ${n}`, 11) + iqT(x0 + w/2, base+34, `${E.size} palitos`, 10, 'iq-tick');
      x0 += w + 34; });
    s += iqT(x0-16, base-8, '…', 16);
    const nome = {quadrados:'quadrados', triângulos:'triângulos', casinhas:'casinhas (um quadrado com um telhado)'}[tipo];
    return {subj:'padroes', topic:'Sequências e padrões', text:`<p>Usando palitos de fósforo, ${iqName()} monta uma sequência de figuras formadas por ${nome} lado a lado. Desenhos vizinhos dividem o palito que fica entre eles. As três primeiras figuras estão desenhadas abaixo.</p>`,
      visual: cvSVG(320, 128, s, 'Sequência de figuras com palitos'),
      ask:`Mantendo o mesmo padrão, quantos palitos serão usados na Figura ${N}?`,
      opts: iqMC(ans, [[um*N,`Contou cada um dos ${N} desenhos com ${um} palitos separados, mas vizinhos dividem um palito.`],[b*N,'Faltou o primeiro palito, que não é dividido com ninguém (o "+1").'],[f(N-1),`Esse é o número de palitos da Figura ${N-1}.`],[(f(3)*N)%3===0 ? f(3)*N/3 : null,'Usou proporção (regra de três) com a Figura 3, mas o padrão tem um palito fixo e não é proporcional.'],[f(N)+b,`Esse é o número de palitos da Figura ${N+1}.`]], {fmt:v=>v+' palitos'}),
      steps:[`Figuras 1, 2 e 3: ${f(1)}, ${f(2)} e ${f(3)} palitos → a cada figura nova entram mais ${b} palitos`, `Figura n: ${b} × n + 1`, `Figura ${N}: ${b} × ${N} + 1 = ${ans} palitos`]};
  },
  // unidades de medida (torneira pingando)
  ()=>{
    let r, d, L;
    do{ r = pick([20,25,30,40,50,60,75,125]); d = pick([1,7,30]); L = r*1440*d/1000; } while(L!==Math.round(L));
    const per = {1:'em um dia inteiro (24 horas)', 7:'em uma semana', 30:'em um mês de 30 dias'}[d];
    return {subj:'unidades', topic:'Unidades de medida', text:`<p>Uma torneira com defeito fica pingando sem parar. Para saber quanto ela desperdiça, ${iqName()} colocou uma jarra embaixo dela e anotou o volume de água acumulado.</p>`,
      visual: iqTable(['Tempo','Água na jarra'], [['0 min','0 mL'], ['5 min', iqNum(5*r)+' mL'], ['10 min', iqNum(10*r)+' mL']]),
      ask:`Mantendo esse ritmo, quantos litros de água a torneira desperdiça ${per}?`,
      opts: iqMC(L, [[10*L,`Usou os ${iqNum(10*r)} mL de 10 minutos como se fossem de 1 minuto.`],[L*1000,'Esse valor está em mililitros; 1 L = 1 000 mL.'],[d>1 ? L/d : null,'Essa é a perda de um dia só.'],[L/10,'Dividiu demais na conversão: 1 L = 1 000 mL.'],[Math.round(L/60) > 0 && L/60===Math.round(L/60) ? L/60 : null,'Esqueceu que cada hora tem 60 minutos.']], {fmt:v=>iqNum(v)+' L'}),
      steps:[`Por minuto: ${iqNum(10*r)} mL ÷ 10 = ${r} mL`, `Minutos ${d===1?'no dia':'no período'}: 24 × 60${d>1?` × ${d}`:''} = ${iqNum(1440*d)} min`, `${r} × ${iqNum(1440*d)} = ${iqNum(r*1440*d)} mL = ${iqNum(L)} L`]};
  },
  // velocidade e tempo (dois trechos)
  ()=>{
    let v1, t1, v2, t2, d1, d2;
    do{ v1 = pick([60,80,90,100]); t1 = pick([30,45,60,75,90,120]); v2 = pick([20,30,40]); t2 = pick([15,20,30,45]); d1 = v1*t1/60; d2 = v2*t2/60; }
    while(d1!==Math.round(d1) || d2!==Math.round(d2));
    const T = t1 + t2, dur = v=> v<60 ? `${v} min` : `${Math.floor(v/60)} h${v%60 ? ` ${v%60} min` : ''}`;
    const hDec = T/60, cents = Math.round((hDec - Math.floor(hDec))*100), lido = cents>0 && cents<60 ? Math.floor(hDec)*60 + cents : null;
    const r5 = v=> Math.round(v/5)*5, media = r5((d1+d2)/((v1+v2)/2)*60), soV1 = r5((d1+d2)/v1*60);
    const dest = pick(['à praia','ao sítio dos avós','ao parque estadual','à casa da tia']);
    let s = cvL(30, 130, 200, 60, 'geo-radius') + cvL(200, 60, 292, 60, 'geo-height');
    s += cvDot(30, 130, 5) + cvDot(200, 60, 5) + cvDot(292, 60, 5);
    s += iqT(30, 150, 'saída', 11) + iqT(200, 46, 'entrada da cidade', 11) + iqT(294, 46, 'chegada', 11);
    s += iqT(104, 84, `${d1} km`, 12, 'geo-lbl-h', 'end') + iqT(128, 116, `estrada: ${v1} km/h`, 10.5, 'iq-tick', 'start');
    s += iqT(246, 78, `${d2} km`, 12, 'geo-lbl-h') + iqT(246, 92, `cidade: ${v2} km/h`, 10.5, 'iq-tick');
    return {subj:'regra3', topic:'Velocidade e tempo', text:`<p>Uma família vai de carro ${dest}. O caminho tem um trecho de estrada, feito a ${v1} km/h, e um trecho dentro da cidade, feito a ${v2} km/h, como no esquema. Considere que o carro mantém essas velocidades o tempo todo.</p>`,
      visual: cvSVG(320, 160, s, 'Esquema do caminho'),
      ask:'Quanto tempo dura a viagem inteira?',
      opts: iqMC(T, [[lido,`A viagem leva ${iqNum(hDec)} h, mas ${iqNum(hDec - Math.floor(hDec))} h não é ${cents} minutos: 1 h = 60 min.`],[media,'Fez a média das duas velocidades; o tempo de cada trecho precisa ser calculado separadamente.'],[t1,'Faltou o tempo do trecho dentro da cidade.'],[soV1,'Usou a velocidade da estrada no caminho todo.'],[r5(60*(d1+d2)/v2),'Usou a velocidade da cidade no caminho todo.']], {fmt:dur, step:15}),
      steps:[`Tempo = distância ÷ velocidade`, `Estrada: ${d1} ÷ ${v1} = ${iqNum(t1/60)} h = ${t1} min`, `Cidade: ${d2} ÷ ${v2} = ${iqNum(t2/60)} h = ${t2} min`, `Total: ${t1} + ${t2} = ${T} min = ${dur(T)}`]};
  },
  // razão e escala (maquete)
  ()=>{
    let k, a, b; do{ k = pick([50,100,200]); a = randInt(12,30); b = randInt(8,a-2); } while(k===50 && (a%2 || b%2));
    const A = a*k/100, B = b*k/100, area = A*B;
    const W = 230, px = Math.min(W/a, 120/b), w = a*px, h = b*px, x0 = (320-w)/2, y0 = 22;
    let s = `<rect x="${_f(x0)}" y="${y0}" width="${_f(w)}" height="${_f(h)}" class="geo-face top"/>` + cvL(x0+w/2, y0, x0+w/2, y0+h, 'geo-face') + `<circle cx="${_f(x0+w/2)}" cy="${_f(y0+h/2)}" r="${_f(Math.min(h,w)/6)}" fill="none" stroke="#6B8CFF" stroke-width="2"/>`;
    s += iqT(160, y0+h+18, `${a} cm`, 12, 'geo-lbl-h') + iqT(x0-6, y0+h/2+4, `${b} cm`, 12, 'geo-lbl-h', 'end') + iqT(160, 14, `escala 1 : ${k}`, 11, 'iq-tick');
    return {subj:'semelhanca', topic:'Razão e escala', text:`<p>Os alunos de uma escola fizeram uma maquete do colégio na escala 1 : ${k}. Na maquete, a quadra poliesportiva é um retângulo de ${a} cm por ${b} cm.</p>`,
      visual: cvSVG(320, _f(y0+h+28), s, 'Quadra na maquete'),
      ask:'Qual é a área real da quadra, em metros quadrados?',
      opts: iqMC(area, [[Math.round(a*b*k/10000*100)/100,`A escala vale para cada comprimento; a área real fica ${k} × ${k} vezes maior, não só ${k} vezes.`],[a*b,'Essa é a área da maquete, em cm²; falta usar a escala.'],[2*(A+B),'Esse é o perímetro real da quadra, não a área.'],[a*b*k*k,'Essa área está em cm²; falta converter para m² (1 m² = 10 000 cm²).'],[Math.round(A*B/100*100)/100,'Erro na conversão de centímetro para metro.']], {fmt:v=>iqNum(v)+' m²'}),
      steps:[`Cada 1 cm da maquete vale ${k} cm reais.`, `Comprimento real: ${a} × ${k} = ${iqNum(a*k)} cm = ${iqNum(A)} m; largura real: ${b} × ${k} = ${iqNum(b*k)} cm = ${iqNum(B)} m`, `Área = ${iqNum(A)} × ${iqNum(B)} = ${iqNum(area)} m²`]};
  },
  // probabilidade simples (roleta da festa junina)
  ()=>{
    const n = pick([8,10,12]), nomes = ['Bala','Pirulito','Chaveiro','Tente de novo'], cores = ['#4C7DFF','#12B886','#B23FE0','#FF7A00'];
    const fr = (p,q)=>{ const [x,y] = simplifyFrac(p,q); return `${x}/${y}`; };
    let c, alvo, fav, label, opts;
    do{
      do{ c = [...Array(3)].map(()=> randInt(1, n/2)); c.push(n - c.reduce((a,b)=>a+b,0)); } while(c[3]<1);
      alvo = randInt(0,3); // 3 = ganhar algum prêmio
      fav = alvo===3 ? n - c[3] : c[alvo];
      label = alvo===3 ? 'ganhar algum prêmio' : `sair ${nomes[alvo].toLowerCase()}`;
      const outros = [0,1,2].filter(i=>i!==alvo).map(i=>[fr(c[i],n), `Essa é a chance de sair ${nomes[i].toLowerCase()}.`]);
      opts = (fav<2 || fav>=n) ? [] : iqMC(fr(fav,n), [[fr(fav, n-fav),'O denominador é o total de setores da roleta, não só os que não servem.'],[fr(n-fav, n), alvo===3 ? 'Essa é a chance de sair "Tente de novo".' : `Essa é a chance de NÃO sair ${nomes[alvo].toLowerCase()}.`],[fr(1,n),'Essa é a chance de parar num setor específico.'],[alvo===3 ? '3/4' : '1/4', alvo===3 ? 'Contou as cores (3 de 4), mas os prêmios não ocupam a mesma quantidade de setores.' : 'Contou 1 cor entre 4, mas as cores não ocupam a mesma quantidade de setores.'], ...outros], {sort:false});
    } while(opts.length < 5);
    const order = shuffle(c.flatMap((q,i)=> Array(q).fill(i)));
    const cx = 100, cy = 106, R = 86, P = t=>[cx + R*Math.sin(t*Math.PI/180), cy - R*Math.cos(t*Math.PI/180)];
    let s = '';
    order.forEach((ci,i)=>{ const [x1,y1] = P(i*360/n), [x2,y2] = P((i+1)*360/n);
      s += `<path d="M${cx} ${cy} L${_f(x1)} ${_f(y1)} A${R} ${R} 0 0 1 ${_f(x2)} ${_f(y2)} Z" fill="${cores[ci]}" fill-opacity=".8" stroke="#fff" stroke-width="1.5"/>`; });
    s += cvDot(cx, cy, 5) + `<polygon points="${cx-8},6 ${cx+8},6 ${cx},20" fill="#FF8A4C"/>`;
    nomes.forEach((nm_,i)=>{ const y = 60 + i*28; s += `<rect x="204" y="${y-11}" width="14" height="14" rx="3" fill="${cores[i]}" fill-opacity=".8"/>` + iqT(224, y+1, nm_, 11.5, '', 'start'); });
    return {subj:'probabilidade', topic:'Probabilidade', text:`<p>Numa festa junina, uma roleta dividida em ${n} setores iguais decide o prêmio de cada jogador. Cada cor indica um resultado, como mostra a legenda.</p>`,
      visual: cvSVG(320, 200, s, 'Roleta de prêmios'),
      ask:`Girando a roleta uma vez, qual é a probabilidade de ${label}?`,
      opts, steps:[`Total de setores (casos possíveis): ${n}`, alvo===3 ? `Setores com prêmio: ${c[0]} + ${c[1]} + ${c[2]} = ${fav}` : `Setores de ${nomes[alvo].toLowerCase()} (casos favoráveis): ${fav}`, `P = ${fav}/${n}${fr(fav,n)!==`${fav}/${n}` ? ` = ${fr(fav,n)}` : ''}`]};
  },
  // potenciação (corrente de mensagens)
  ()=>{
    const k = pick([2,3,4,5]), n = randInt(4, {2:10, 3:8, 4:6, 5:5}[k]), ans = Math.pow(k, n);
    const soma = [...Array(n)].reduce((a,_,i)=> a + Math.pow(k, i+1), 0), nome = iqName();
    const f = v=> v.toLocaleString('pt-BR');
    let s = cvDot(170, 22, 6) + iqT(184, 26, nome, 11.5, '', 'start');
    const lv = (cnt, y)=> [...Array(cnt)].map((_,i)=> [60 + (i+0.5)*250/cnt, y]);
    const L1 = lv(k, 78), L2 = lv(k*k, 138);
    L1.forEach(([x,y])=>{ s += cvL(170, 22, x, y, 'iq-grid'); });
    L2.forEach(([x,y],i)=>{ s += cvL(L1[Math.floor(i/k)][0], 78, x, y, 'iq-grid'); });
    L1.forEach(([x,y])=>{ s += cvDot(x, y, 5); }); L2.forEach(([x,y])=>{ s += cvDot(x, y, k>3 ? 3 : 4); });
    s += iqT(6, 82, 'Dia 1', 11, 'iq-tick', 'start') + iqT(6, 142, 'Dia 2', 11, 'iq-tick', 'start') + iqT(185, 172, '⋮', 16);
    return {subj:'potenciacao', topic:'Potenciação', text:`<p>${nome} criou uma mensagem de campanha contra o desperdício de água. No dia 1, enviou a mensagem para ${k} amigos. A partir daí, cada pessoa que recebe a mensagem num dia a envia, no dia seguinte, para ${k} pessoas novas, como no esquema.</p>`,
      visual: cvSVG(320, 182, s, 'Esquema da corrente de mensagens'),
      ask:`Quantas pessoas receberão a mensagem no dia ${n}?`,
      opts: iqMC(ans, [[k*n,`Multiplicou ${k} × ${n}; na verdade, o número de pessoas é multiplicado por ${k} a cada dia.`],[Math.pow(k, n-1),'Contou um dia a menos.'],[Math.pow(n, k),'Trocou a base com o expoente.'],[soma,`Esse é o total de pessoas que receberam do dia 1 até o dia ${n}, não só no dia ${n}.`],[Math.pow(k, n+1),'Contou um dia a mais.']], {fmt:f}),
      steps:[`Dia 1: ${k} = ${k}¹ · Dia 2: ${k} × ${k} = ${k}² = ${k*k} · Dia 3: ${k}³ = ${k*k*k}`, `No dia n, recebem ${k}ⁿ pessoas`, `Dia ${n}: ${k}<sup>${n}</sup> = ${f(ans)} pessoas`]};
  },
  // conjuntos (pesquisa com diagrama)
  ()=>{
    const tema = pick([['Futebol','Vôlei','praticam futebol','praticam vôlei','não praticam nenhum dos dois'],['Livros','Games','leem livros por diversão','jogam videogame','não fazem nenhuma das duas coisas'],['Cinema','Teatro','foram ao cinema no mês','foram ao teatro no mês','não foram a nenhum dos dois']]);
    const c = randInt(10,40), a = c + randInt(10,60), b = c + randInt(10,60), d = randInt(5,30), tipo = pick(['total','soUm']);
    const ans = tipo==='total' ? a + b - c + d : a + b - 2*c;
    const wr = tipo==='total'
      ? [[a+b+d,`Quem está nos dois grupos foi contado duas vezes; subtraia os ${c} uma vez.`],[a+b-c,`Faltaram os ${d} que ${tema[4]}.`],[a+b+c+d,'Quem está nos dois grupos já foi contado em cada um deles; não some de novo.'],[a+b-2*c+d,'Tirou os que estão nos dois grupos duas vezes; eles precisam ser contados uma vez.']]
      : [[a+b-c,`Incluiu os ${c} que estão nos dois grupos.`],[a+b,'Somou os dois grupos sem tirar quem está nos dois.'],[a+b-2*c+d,`Os ${d} que ${tema[4]} não entram nessa conta.`],[a-c,`Contou só quem é apenas do grupo "${tema[0]}".`],[b-c,`Contou só quem é apenas do grupo "${tema[1]}".`]];
    let s = `<rect x="14" y="10" width="292" height="170" rx="10" fill="none" class="iq-axis"/>` + iqT(24, 28, 'Entrevistados', 11, 'iq-tick', 'start');
    s += `<circle cx="122" cy="100" r="62" class="geo-face front" style="fill-opacity:.6"/><circle cx="198" cy="100" r="62" class="geo-face front" style="fill:rgba(255,138,76,.22);stroke:#FF8A4C"/>`;
    s += iqT(96, 104, tema[0], 12.5) + iqT(224, 104, tema[1], 12.5);
    return {subj:'conjuntos', topic:'Conjuntos', text:`<p>Numa pesquisa feita com os estudantes do 9º ano de uma escola, cada um respondeu às duas perguntas. O quadro resume as respostas.</p>`,
      visual: iqTable(['Resposta','Estudantes'], [[`${tema[2].charAt(0).toUpperCase()+tema[2].slice(1)}`, a], [`${tema[3].charAt(0).toUpperCase()+tema[3].slice(1)}`, b], ['Fazem as duas coisas', c], [`${tema[4].charAt(0).toUpperCase()+tema[4].slice(1)}`, d]]) + cvSVG(320, 190, s, 'Diagrama dos grupos'),
      ask: tipo==='total' ? 'Quantos estudantes participaram da pesquisa?' : `Quantos estudantes estão em apenas um dos grupos (só ${tema[0].toLowerCase()} ou só ${tema[1].toLowerCase()})?`,
      opts: iqMC(ans, wr, {fmt:v=>v+' estudantes'}),
      steps:[`Nos dois grupos (meio do diagrama): ${c}`, `Só ${tema[0].toLowerCase()}: ${a} − ${c} = ${a-c}; só ${tema[1].toLowerCase()}: ${b} − ${c} = ${b-c}`, tipo==='total' ? `Total: ${a-c} + ${b-c} + ${c} + ${d} (nenhum) = ${ans}` : `Apenas um grupo: ${a-c} + ${b-c} = ${ans}`]};
  }
);
