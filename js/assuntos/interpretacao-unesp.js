/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — UNESP
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */
IQ_UNESP.push(
  // porcentagem: variação da produção agrícola (gráfico de colunas)
  ()=>{
    const crop = pick([['soja','mil toneladas'],['milho','mil toneladas'],['café','mil sacas'],['laranja','mil caixas'],['cana-de-açúcar','mil toneladas']]);
    const anos = ['2021','2022','2023','2024','2025'];
    const i = randInt(0,2), j = randInt(i+2,4);
    const b = randInt(8,20)*20, p = pick([10,15,20,25,30,35,40,50,-10,-15,-20,-25,-30]), vj = b*(100+p)/100, d = vj - b;
    const v = anos.map(()=> Math.round(b*randInt(80,125)/1000)*10);
    v[i] = b; v[j] = vj;
    const up = p > 0, ap = Math.abs(p), ad = Math.abs(d);
    const prev = j-1 !== i && v[j-1] ? Math.round(Math.abs(v[j]-v[j-1])/v[j-1]*100) : null;
    return {subj:'porcentagem', topic:'Variação percentual', text:`<p>Uma cooperativa agrícola do interior paulista acompanha a sua produção anual de ${crop[0]}. O gráfico mostra essa produção, em ${crop[1]}, de 2021 a 2025.</p>`,
      visual: iqBarsSVG(anos, v, {title:`Produção de ${crop[0]} (${crop[1]})`}),
      ask:`De ${anos[i]} para ${anos[j]}, a produção de ${crop[0]} da cooperativa ${up?'aumentou':'diminuiu'}`,
      opts: iqMC(ap, [
        [Math.round(ad/vj*100), `Dividiu a diferença pela produção de ${anos[j]}; a base da variação é o ano inicial, ${anos[i]}.`],
        [ad, `Esse número é a diferença em ${crop[1]}, não a porcentagem.`],
        [Math.round(vj/b*100), `Essa é a produção de ${anos[j]} como porcentagem da de ${anos[i]}; a variação é a distância até 100%.`],
        [prev, `Comparou só ${anos[j-1]} com ${anos[j]}; a pergunta parte de ${anos[i]}.`],
        [Math.round(ap/(j-i)), 'Dividiu a variação pelo número de anos; a pergunta é a variação total no período.'],
      ], {fmt:v=>iqNum(v)+'%'}),
      steps:[`Leia no gráfico: ${anos[i]} → ${b}; ${anos[j]} → ${vj} (${crop[1]})`, `Diferença: ${vj} − ${b} = ${up?'':'−'}${ad}`, `Variação: ${ad} ÷ ${b} = ${iqNum(ap/100,2)} = ${ap}% de ${up?'aumento':'redução'}`]};
  },
  // função afim: dois planos de celular e o ponto de empate (gráfico com duas retas)
  ()=>{
    let dc, x; do{ dc = pick([10,15,20,25]); x = pick([60,80,100,120,150,200]); } while(dc*x < 900);
    const pB = pick([10,15,20,25,30]), pA = pB + dc, FA = pick([2990,3490,3990,4490]), FB = FA + dc*x; // tudo em centavos
    const m = c=> iqMoney(c/100);
    return {subj:'func1grau', topic:'Função afim', text:`<p>Uma operadora oferece dois planos de telefonia. Nos dois, paga-se uma mensalidade fixa e mais um valor por minuto de ligação. O gráfico mostra o custo mensal de cada plano em função dos minutos usados.</p>`,
      visual: iqCards([{t:'Plano A', lines:[`Mensalidade: ${m(FA)}`, `${m(pA)} por minuto`]}, {t:'Plano B', lines:[`Mensalidade: ${m(FB)}`, `${m(pB)} por minuto`]}]) + (()=>{
        const W = 320, x0 = 44, x1 = W-14, y0 = 172, yT = 22, xm = 2*x, fA = t=>(FA+pA*t)/100, fB = t=>(FB+pB*t)/100;
        const ymax = Math.max(fA(xm), fB(xm)), st = iqNiceStep(ymax), top = Math.ceil(ymax*1.05/st)*st, X = t=> x0 + t/xm*(x1-x0), Y = v=> y0 - v/top*(y0-yT);
        let s = '';
        for(let v=0; v<=top+1e-9; v+=st) s += cvL(x0, Y(v), x1, Y(v), v ? 'iq-grid' : 'iq-axis') + iqT(x0-5, Y(v)+3.5, iqNum(v), 10, 'iq-tick', 'end');
        s += cvL(x0, yT-6, x0, y0, 'iq-axis');
        for(let k=0; k<=4; k++) s += iqT(X(xm*k/4), y0+14, iqNum(xm*k/4), 10, 'iq-tick');
        s += `<line x1="${_f(X(0))}" y1="${_f(Y(fA(0)))}" x2="${_f(X(xm))}" y2="${_f(Y(fA(xm)))}" stroke="#FF8A4C" stroke-width="2.5"/>`;
        s += `<line x1="${_f(X(0))}" y1="${_f(Y(fB(0)))}" x2="${_f(X(xm))}" y2="${_f(Y(fB(xm)))}" stroke="#6B8CFF" stroke-width="2.5"/>`;
        s += iqT(X(0)+6, Y(fA(0))+15, 'Plano A', 11, '', 'start') + iqT(X(xm)-4, Y(fB(xm))+15, 'Plano B', 11, '', 'end');
        s += iqT(x0-34, 12, 'custo (R$)', 11, '', 'start') + iqT(x1, y0+30, 'minutos no mês', 11, '', 'end');
        return cvSVG(W, 208, s, 'Custo mensal dos planos');
      })(),
      ask:'Para quantos minutos de ligação por mês os dois planos têm exatamente o mesmo custo?',
      opts: iqMC(x, [
        [Math.round((FB-FA)/pA), 'Dividiu a diferença das mensalidades só pelo preço do minuto do plano A; divida pela diferença entre os preços do minuto.'],
        [Math.round((FB-FA)/pB), 'Dividiu a diferença das mensalidades só pelo preço do minuto do plano B; divida pela diferença entre os preços do minuto.'],
        [Math.round((FB+FA)/dc), 'Somou as mensalidades; no empate, é a diferença entre elas que é compensada.'],
        [Math.round((FB-FA)/(pA+pB)), 'Somou os preços do minuto em vez de subtrair.'],
      ], {fmt:v=>iqNum(v)+' minutos'}),
      steps:[`Plano A: C = ${m(FA)} + ${m(pA)}·t · Plano B: C = ${m(FB)} + ${m(pB)}·t`, `Empate: ${m(FA)} + ${m(pA)}·t = ${m(FB)} + ${m(pB)}·t → ${m(dc)}·t = ${m(FB-FA)}`, `t = ${m(FB-FA)} ÷ ${m(dc)} = ${x} minutos (no gráfico, é onde as retas se cruzam)`, `Acima de ${x} minutos, o plano B passa a ser mais barato.`]};
  },
  // geometria espacial: capacidade de um silo (cilindro + cone)
  ()=>{
    const r = pick([2,3,4,5]), h = pick([6,8,10,12]), hc = pick([2,3,4]), Vc = 3*r*r*h, Vk = r*r*hc, V = Vc + Vk;
    return {subj:'espacial', topic:'Volume de cilindro e cone', text:`<p>Uma cooperativa vai construir um silo para armazenar grãos. Ele é formado por um cilindro circular reto de ${2*r} m de diâmetro e ${h} m de altura, coberto por um cone de mesma base e ${hc} m de altura, como na figura (fora de escala). Use π = 3.</p>`,
      visual: (()=>{ const cx = 150, rx = 52, ry = 11, yTop = 64, yBot = 168, apex = 20, xr = cx+rx+18;
        let s = `<path d="M${cx-rx} ${yTop} L${cx-rx} ${yBot} A${rx} ${ry} 0 0 0 ${cx+rx} ${yBot} L${cx+rx} ${yTop} Z" class="geo-face front"/>`;
        s += `<path d="M${cx-rx} ${yBot} A${rx} ${ry} 0 0 1 ${cx+rx} ${yBot}" class="geo-hidden"/>`;
        s += `<polygon points="${cx-rx},${yTop} ${cx},${apex} ${cx+rx},${yTop}" class="geo-face top"/>`;
        s += `<path d="M${cx-rx} ${yTop} A${rx} ${ry} 0 0 0 ${cx+rx} ${yTop}" fill="none" class="geo-face"/><path d="M${cx-rx} ${yTop} A${rx} ${ry} 0 0 1 ${cx+rx} ${yTop}" class="geo-hidden"/>`;
        s += cvL(cx, apex, cx, yTop, 'geo-height') + iqT(cx+6, (apex+yTop)/2-2, hc+' m', 12, 'geo-lbl-h', 'start');
        s += cvL(xr, yTop, xr, yBot, 'geo-radius') + cvL(xr-5, yTop, xr+5, yTop, 'geo-radius') + cvL(xr-5, yBot, xr+5, yBot, 'geo-radius') + iqT(xr+8, (yTop+yBot)/2+4, h+' m', 12, 'geo-lbl-h', 'start');
        s += cvL(cx-rx, yBot+26, cx+rx, yBot+26, 'geo-radius') + iqT(cx, yBot+42, 'diâmetro: '+(2*r)+' m', 12, 'geo-lbl-h');
        return cvSVG(320, 220, s, 'Silo: cilindro com cobertura cônica'); })(),
      ask:'A capacidade total desse silo é',
      opts: iqMC(V, [
        [3*r*r*(h+hc), 'Calculou o cone como se fosse cilindro; o volume do cone é um terço do volume do cilindro de mesma base e altura.'],
        [Vc, 'Faltou somar o volume do cone da cobertura.'],
        [3*4*r*r*h + 4*r*r*hc, 'Usou o diâmetro no lugar do raio; o raio é a metade do diâmetro.'],
        [r*r*(h+hc), 'Dividiu o volume todo por 3; só o cone tem o fator 1/3.'],
        [3*r*h + r*hc, 'Esqueceu de elevar o raio ao quadrado.'],
      ], {fmt:v=>iqNum(v)+' m³'}),
      steps:[`Raio = ${2*r} ÷ 2 = ${r} m`, `Cilindro: π·r²·h = 3 × ${r*r} × ${h} = ${Vc} m³`, `Cone: π·r²·h ÷ 3 = 3 × ${r*r} × ${hc} ÷ 3 = ${Vk} m³`, `Total: ${Vc} + ${Vk} = ${V} m³`]};
  },
  // PA: economia mensal até juntar o valor de uma compra
  ()=>{
    const a1 = pick([40,50,60,80,100]), r = pick([10,15,20,25]), n = randInt(8,14), an = a1 + (n-1)*r, S = n*(a1+an)/2;
    const item = pick(['uma bicicleta','um notebook','uma geladeira nova','um celular']), nome = iqName();
    const Sm = k=> k*(2*a1+(k-1)*r)/2;
    return {subj:'pa', topic:'Progressão aritmética', text:`<p>Para comprar ${item} que custa ${iqMoney(S)} à vista, ${nome} começou a guardar dinheiro: no 1º mês guardou ${iqMoney(a1)} e, a cada mês seguinte, guarda ${iqMoney(r)} a mais que no mês anterior. A tabela mostra o começo do planejamento.</p>`,
      visual: iqTable(['Mês','Valor guardado no mês','Total acumulado'], [1,2,3,4].map(k=>[`${k}º`, iqMoney(a1+(k-1)*r), iqMoney(Sm(k))]).concat([['…','…','…']])),
      ask:`Mantido esse padrão, ao final de quantos meses o total acumulado será exatamente ${iqMoney(S)}?`,
      opts: iqMC(n, [
        [Math.round(S/a1), `Considerou que ela guarda sempre ${iqMoney(a1)}; os valores aumentam ${iqMoney(r)} por mês.`],
        [n+1, `Em ${n+1} meses o total seria ${iqMoney(Sm(n+1))}, acima do preço.`],
        [n-1, `Em ${n-1} meses o total é só ${iqMoney(Sm(n-1))}.`],
        [Math.round(S/an), `Dividiu o preço pelo valor do último depósito; os depósitos não são todos iguais.`],
        [Math.round((S-a1)/r), 'Dividiu pelo aumento mensal, mas o total é a soma de todos os depósitos (soma da PA).'],
      ], {fmt:v=>v+' meses'}),
      steps:[`Os depósitos formam uma PA: a₁ = ${iqMoney(a1)} e razão ${iqMoney(r)}`, `Total em n meses: Sₙ = (a₁ + aₙ)·n ÷ 2, com aₙ = ${a1} + (n − 1)·${r}`, `Para n = ${n}: a${n} = ${a1} + ${n-1} × ${r} = ${an}`, `S${n} = (${a1} + ${an}) × ${n} ÷ 2 = ${S} → ${n} meses`]};
  },
  // probabilidade: dois dados numa quermesse
  ()=>{
    const hi = pick([9,10,11]), lo = pick([3,4,5]), cnt = s=> 6 - Math.abs(s-7);
    const sumR = (a,b)=>{ let t = 0; for(let s=a; s<=b; s++) t += cnt(s); return t; };
    const nHi = sumR(hi,12), nLo = sumR(2,lo), which = pick(['hi','lo','any']);
    const fav = which==='hi' ? nHi : which==='lo' ? nLo : nHi+nLo, nSums = which==='hi' ? 13-hi : which==='lo' ? lo-1 : 13-hi+lo-1;
    const F = (a,b)=> simplifyFrac(a,b).join('/'), ans = F(fav,36);
    const range = which==='hi' ? [[hi,12]] : which==='lo' ? [[2,lo]] : [[2,lo],[hi,12]];
    const list = []; range.forEach(([a,b])=>{ for(let s=a; s<=b; s++) list.push(`soma ${s}: ${cnt(s)}`); });
    const what = which==='hi' ? 'ganhar a camiseta' : which==='lo' ? 'ganhar o boné' : 'ganhar algum prêmio';
    const die = (x, y, n)=>{ const P = {1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[2,0],[0,2],[2,2]],5:[[0,0],[2,0],[1,1],[0,2],[2,2]],6:[[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]]}[n];
      return `<rect x="${x}" y="${y}" width="54" height="54" rx="10" class="geo-face top"/>` + P.map(([a,b])=>`<circle cx="${x+11+a*16}" cy="${y+11+b*16}" r="4.5" fill="#FF8A4C"/>`).join(''); };
    return {subj:'probabilidade', topic:'Probabilidade', text:`<p>Numa quermesse, cada participante lança dois dados comuns, de seis faces, e soma os números obtidos. O prêmio depende da soma, como no quadro.</p>`,
      visual: cvSVG(320, 78, die(100, 12, randInt(1,6)) + die(166, 12, randInt(1,6)), 'Dois dados') + iqTable(['Soma dos dois dados','Prêmio'], [[`${lo} ou menos`,'Boné'], [`de ${lo+1} a ${hi-1}`,'Não ganha'], [`${hi} ou mais`,'Camiseta']]),
      ask:`A probabilidade de um participante ${what} em um lançamento é`,
      opts: iqMC(ans, [
        [F(nSums,11), 'Considerou as 11 somas possíveis (de 2 a 12) igualmente prováveis; elas não são.'],
        [fav<12 ? F(fav,12) : null, 'O total de resultados é 6 × 6 = 36, não 6 + 6 = 12.'],
        [F(36-fav,36), `Essa é a probabilidade de não ${what}.`],
        [which==='hi' ? F(nLo,36) : F(nHi,36), which==='hi' ? 'Essa é a probabilidade do boné.' : which==='lo' ? 'Essa é a probabilidade da camiseta.' : 'Essa é só a probabilidade da camiseta; o boné também é prêmio.'],
        [which==='any' ? F(nLo,36) : null, 'Essa é só a probabilidade do boné; a camiseta também é prêmio.'],
        [F(fav,72), 'Não há motivo para dividir por 2: o total de resultados é 36.'],
        [F(1,36), 'Essa é a probabilidade de um resultado específico, como (1, 1); é preciso contar todos os favoráveis.'],
      ], {sort:false}),
      steps:['Dois dados: 6 × 6 = 36 resultados igualmente prováveis.', `Resultados favoráveis: ${list.join(' · ')} → ${fav} no total`, `P = ${fav}/36${ans!==fav+'/36' ? ' = '+ans : ''}`]};
  },
  // escala de planta baixa: área real e custo do piso
  ()=>{
    const E = pick([50,100,200]), opt = {50:[6,7,8,9,10,12], 100:[2.5,3,3.5,4,4.5,5], 200:[1.5,2,2.5,3]}[E];
    let a, b; do{ a = pick(opt); b = pick(opt); } while(a===b);
    const A = a*E/100, B = b*E/100, area = A*B, pr = pick([40,60,80,120]), cost = Math.round(area*pr*100)/100;
    const rm = pick([['quarto',['banheiro','closet']], ['sala',['cozinha','lavabo']], ['escritório',['banheiro','depósito']]]), piso = pick(['piso laminado','porcelanato','piso vinílico']);
    return {subj:'geometria', topic:'Escala e área', text:`<p>A planta baixa de parte de um apartamento foi desenhada na escala 1 : ${E}. Nela, o ${rm[0]} é um retângulo de ${iqNum(a)} cm por ${iqNum(b)} cm. O proprietário vai revestir todo o piso do ${rm[0]} com ${piso}, que custa ${iqMoney(pr)} o metro quadrado.</p>`,
      visual: (()=>{ const k = Math.min(160/a, 130/b), w = a*k, hh = b*k, x0 = 44, y0 = 28, w2 = 90;
        let s = `<rect x="${x0}" y="${y0}" width="${_f(w)}" height="${_f(hh)}" class="geo-face top"/>`;
        s += `<rect x="${_f(x0+w)}" y="${y0}" width="${w2}" height="${_f(hh/2)}" class="geo-face side"/><rect x="${_f(x0+w)}" y="${_f(y0+hh/2)}" width="${w2}" height="${_f(hh/2)}" class="geo-face side"/>`;
        s += iqT(x0+w/2, y0+hh/2+4, rm[0], 12.5) + iqT(x0+w+w2/2, y0+hh/4+4, rm[1][0], 10.5, 'iq-tick') + iqT(x0+w+w2/2, y0+3*hh/4+4, rm[1][1], 10.5, 'iq-tick');
        s += iqT(x0+w/2, y0-8, iqNum(a)+' cm', 11.5, 'geo-lbl-h') + iqT(x0-6, y0+hh/2+4, iqNum(b)+' cm', 11.5, 'geo-lbl-h', 'end');
        s += iqT(160, y0+hh+22, 'Escala 1 : '+E, 11.5, 'iq-tick');
        return cvSVG(320, y0+hh+34, s, 'Planta baixa'); })(),
      ask:`O custo do ${piso} para revestir o ${rm[0]} será de`,
      opts: iqMC(cost, [
        [Math.round(a*b*E/10000*pr*100)/100, `Aplicou a escala uma vez só na área; cada medida é ampliada ${E} vezes, então a área fica ${E}² vezes maior.`],
        [Math.round(2*(A+B)*pr*100)/100, 'Calculou o perímetro do cômodo, não a área.'],
        [Math.round(a*b*pr*100)/100, 'Usou as medidas da planta sem aplicar a escala.'],
        [Math.round(area*100*pr*100)/100, 'Errou a conversão: de centímetro para metro se divide por 100.'],
      ], {fmt:iqMoney}),
      steps:[`Medidas reais: ${iqNum(a)} × ${E} = ${iqNum(a*E)} cm = ${iqNum(A)} m e ${iqNum(b)} × ${E} = ${iqNum(b*E)} cm = ${iqNum(B)} m`, `Área real: ${iqNum(A)} × ${iqNum(B)} = ${iqNum(area)} m²`, `Custo: ${iqNum(area)} × ${iqMoney(pr)} = ${iqMoney(cost)}`]};
  },
  // semelhança: razão entre áreas (tinta para placas de trânsito)
  ()=>{
    const L1 = pick([30,40,50,60]), k = pick([1.5,2,2.5,3]), L2 = L1*k, m = pick([40,60,80,120]), M = m*k*k;
    return {subj:'semelhanca', topic:'Razão entre áreas', text:`<p>A prefeitura de uma cidade vai trocar as placas triangulares de "Dê a preferência" de uma avenida por placas maiores, semelhantes às antigas. O lado da placa antiga mede ${L1} cm, e o da nova, ${L2} cm. Para pintar a face de uma placa antiga, gastam-se ${m} mL de tinta.</p>`,
      visual: (()=>{ const wB = 150, wS = wB/k, yT = 30, xS = 24, xB = 300-wB, tri = (x, w)=> `${_f(x)},${yT} ${_f(x+w)},${yT} ${_f(x+w/2)},${_f(yT+w*0.866)}`;
        let s = `<polygon points="${tri(xS, wS)}" class="geo-face top" style="stroke:#E03131;stroke-width:3"/><polygon points="${tri(xB, wB)}" class="geo-face top" style="stroke:#E03131;stroke-width:3"/>`;
        s += iqT(xS+wS/2, yT-8, L1+' cm', 12, 'geo-lbl-h') + iqT(xB+wB/2, yT-8, L2+' cm', 12, 'geo-lbl-h');
        s += iqT(xS+wS/2, yT+wS*0.866+20, 'antiga', 11, 'iq-tick') + iqT(xB+wB/2, yT+wB*0.866+20, 'nova', 11, 'iq-tick');
        return cvSVG(320, yT+wB*0.866+30, s, 'Placa antiga e placa nova'); })(),
      ask:'Mantendo a mesma espessura de tinta, a quantidade de tinta para pintar a face de uma placa nova é',
      opts: iqMC(M, [
        [m*k, 'Usou a razão entre os lados; a tinta acompanha a área, que cresce com o quadrado dessa razão.'],
        [m*k*k*k, 'Elevou a razão ao cubo, como se fosse volume; a pintura cobre uma superfície.'],
        [m + (L2-L1), 'Somou a diferença dos lados; a relação entre figuras semelhantes é multiplicativa.'],
        [m*2*k, 'Multiplicou a razão por 2 em vez de elevá-la ao quadrado.'],
      ], {fmt:v=>iqNum(v)+' mL'}),
      steps:[`Razão de semelhança: ${L2} ÷ ${L1} = ${iqNum(k)}`, `Razão entre as áreas: ${iqNum(k)}² = ${iqNum(k*k)}`, `Tinta: ${m} × ${iqNum(k*k)} = ${iqNum(M)} mL`]};
  },
  // inequação: orçamento de uma excursão
  ()=>{
    let F, p, B, profs, q, xmax;
    do{ F = pick([1200,1500,1800,2100]); p = pick([35,40,45,55,60]); B = randInt(30,60)*100; profs = pick([2,3,4]); q = Math.floor((B-F)/p); xmax = q - profs; } while((B-F)%p===0 || xmax<25 || xmax>50);
    const lugar = pick(['um parque ecológico','um museu de ciências','um zoológico','uma fazenda histórica']);
    return {subj:'inequacoes', topic:'Inequação do 1º grau', text:`<p>Uma escola vai levar alunos a ${lugar}. O ônibus é alugado por um preço fixo e cada pessoa paga ingresso, inclusive os ${profs} professores que acompanharão o grupo. Todos os gastos serão pagos com a verba indicada no quadro, que não pode ser ultrapassada.</p>`,
      visual: iqTable(['Item','Valor'], [['Aluguel do ônibus (ida e volta)', iqMoney(F)], ['Ingresso por pessoa', iqMoney(p)], ['Verba disponível', iqMoney(B)]]),
      ask:'O número máximo de alunos que podem participar da excursão é',
      opts: iqMC(xmax, [
        [xmax+1, `Arredondou para cima: com ${xmax+1} alunos o gasto seria ${iqMoney(F + p*(xmax+1+profs))}, acima da verba.`],
        [q, 'Esqueceu de descontar os professores, que também pagam ingresso.'],
        [Math.floor(B/p) - profs, 'Esqueceu de descontar o aluguel do ônibus da verba.'],
        [Math.floor((B+F)/p) - profs, 'O aluguel do ônibus é um gasto: ele se subtrai da verba, não se soma.'],
      ], {fmt:v=>v+' alunos'}),
      steps:[`Com x alunos: ${F} + ${p}·(x + ${profs}) ≤ ${B}`, `${p}·(x + ${profs}) ≤ ${B-F}`, `${p} × ${q} = ${p*q} cabe na verba, mas ${p} × ${q+1} = ${p*(q+1)} passa de ${B-F} → x + ${profs} ≤ ${q}`, `x ≤ ${xmax}: no máximo ${xmax} alunos`]};
  },
  // gráfico de setores: pesquisa numa unidade de saúde
  ()=>{
    const cats = ['Nenhum dia','1 a 2 dias','3 a 4 dias','5 a 6 dias','Todos os dias'];
    let ps; do{ ps = [0,1,2,3].map(()=> randInt(1,8)*5); ps.push(100 - ps.reduce((a,b)=>a+b,0)); } while(ps[4]<5 || ps[4]>40);
    const N = pick([400,600,800,1200,1500,2000]), u = randInt(0,4), ans = N*ps[u]/100, S = 100 - ps[u];
    const cols = ['#4C7DFF','#12B886','#B23FE0','#FF7A00','#E0A000'];
    return {subj:'graficos', topic:'Gráfico de setores', text:`<p>Uma unidade básica de saúde entrevistou ${N.toLocaleString('pt-BR')} pacientes adultos, perguntando em quantos dias por semana cada um pratica pelo menos 30 minutos de atividade física. O gráfico mostra o resultado, mas o percentual de um dos setores foi apagado.</p>`,
      visual: (()=>{ const cx = 98, cy = 104, R = 80; let s = '', a0 = 0;
        const pt = (ang, r)=> [cx + r*Math.sin(ang*Math.PI/180), cy - r*Math.cos(ang*Math.PI/180)];
        ps.forEach((p,i)=>{ const a1 = a0 + p*3.6, [x1,y1] = pt(a0,R), [x2,y2] = pt(a1,R), mid = (a0+a1)/2, rl = p>=10 ? R*0.62 : R+13, [lx,ly] = pt(mid, rl);
          s += `<path d="M${cx} ${cy} L${_f(x1)} ${_f(y1)} A${R} ${R} 0 ${p>50?1:0} 1 ${_f(x2)} ${_f(y2)} Z" fill="${cols[i]}" fill-opacity=".8" stroke="#fff" stroke-width="1.5"/>`;
          s += iqT(lx, ly+4, i===u ? '?' : p+'%', p>=10 ? 12 : 10.5, p>=10 ? '' : 'iq-tick');
          a0 = a1; });
        cats.forEach((c,i)=>{ const y = 44 + i*26; s += `<rect x="204" y="${y-10}" width="12" height="12" rx="2" fill="${cols[i]}" fill-opacity=".8"/>` + iqT(222, y, c, 11, '', 'start'); });
        return cvSVG(320, 208, s, 'Gráfico de setores'); })(),
      ask:`Quantos entrevistados responderam "${cats[u].toLowerCase()}"?`,
      opts: iqMC(ans, [
        [ps[u], 'Esse é o percentual do setor, não o número de pessoas.'],
        [N*S/100, 'Esse é o número de pessoas de todos os outros setores juntos.'],
        [N/5, 'Dividiu os entrevistados igualmente entre as 5 respostas, mas os setores têm tamanhos diferentes.'],
        [Math.round(ps[u]*3.6), 'Esse é o ângulo central do setor, em graus, não o número de pessoas.'],
      ], {fmt:v=>v.toLocaleString('pt-BR')+' pessoas'}),
      steps:[`Some os percentuais que aparecem: ${ps.filter((_,i)=>i!==u).map(p=>p+'%').join(' + ')} = ${S}%`, `O setor apagado vale 100% − ${S}% = ${ps[u]}%`, `${ps[u]}% de ${N.toLocaleString('pt-BR')} = ${ans.toLocaleString('pt-BR')} pessoas`]};
  },
  // dispersão: desvio padrão de duas turmas com a mesma média
  ()=>{
    const sets = [[[-3,-1,0,1,3],2],[[-1,-1,-1,-1,4],2],[[-6,-2,0,2,6],4],[[-2,-2,-2,-2,8],4],[[-9,-3,0,3,9],6]];
    let A, B, kA, kB; do{ A = pick(sets); B = pick(sets); kA = pick([1,2]); kB = pick([1,2]); } while(A[1]*kA === B[1]*kB);
    const m = randInt(11,15)*5, va = shuffle(A[0].map(d=> m + d*kA)), vb = shuffle(B[0].map(d=> m + d*kB));
    const dA = A[1]*kA, dB = B[1]*kB, ds = Math.min(dA,dB), dl = Math.max(dA,dB), tur = dA<dB ? 'A' : 'B';
    const H = dA<dB ? va : vb, mad = Math.round(H.reduce((s,v)=>s+Math.abs(v-m),0)/5*100)/100;
    const sq = vs=> vs.reduce((s,v)=>s+(v-m)*(v-m),0), dev = vs=> vs.map(v=> v-m>0 ? '+'+(v-m) : nm(v-m)).join(', ');
    return {subj:'dispersao', topic:'Desvio padrão', text:`<p>Para comparar o desempenho de duas turmas numa mesma prova, valendo de 0 a 100 pontos, uma professora sorteou cinco alunos de cada turma. As notas estão na tabela.</p><p>Considere: desvio padrão = √(soma dos quadrados dos desvios em relação à média ÷ número de notas).</p>`,
      visual: iqTable(['Aluno','Turma A','Turma B'], [0,1,2,3,4].map(i=>[`${i+1}º`, va[i], vb[i]])),
      ask:'O desvio padrão das notas da turma mais homogênea (de menor dispersão) é',
      opts: iqMC(ds, [
        [dl, 'Esse é o desvio padrão da turma menos homogênea, a de maior dispersão.'],
        [ds*ds, 'Essa é a variância; o desvio padrão é a raiz quadrada dela.'],
        [mad, 'Essa é a média dos desvios em valor absoluto (desvio médio), não o desvio padrão.'],
        [m, 'Essa é a média das notas, que é igual nas duas turmas; ela não mede dispersão.'],
      ], {fmt:v=>iqNum(v)}),
      steps:[`Média das duas turmas: ${va.join(' + ')} = ${m*5}; ${m*5} ÷ 5 = ${m} (a turma B também tem média ${m})`, `Turma A: desvios ${dev(va)}; soma dos quadrados = ${sq(va)}; ${sq(va)} ÷ 5 = ${sq(va)/5}; desvio padrão = √${sq(va)/5} = ${dA}`, `Turma B: desvios ${dev(vb)}; soma dos quadrados = ${sq(vb)}; ${sq(vb)} ÷ 5 = ${sq(vb)/5}; desvio padrão = √${sq(vb)/5} = ${dB}`, `Mais homogênea é a de menor desvio padrão: turma ${tur}, com ${ds}`]};
  },
  // sistema linear: mistura de soluções de álcool
  ()=>{
    let c1, c2, t, V, x; do{ c1 = pick([80,90,96]); c2 = pick([20,30,40,46,50]); V = pick([10,20,25,50,100]); x = randInt(1, V-1); t = (c1*x + c2*(V-x))/V; } while(t!==Math.round(t) || t<c2+10 || t>c1-10 || x*2===V);
    const y = V - x;
    return {subj:'sistemas', topic:'Sistema linear', text:`<p>Uma indústria de produtos de limpeza vai preparar ${V} litros de uma solução de álcool com ${t}% de álcool, misturando duas soluções que já tem em estoque, descritas nos cartões.</p>`,
      visual: iqCards([{t:'Solução 1', lines:[`${c1}% de álcool`]}, {t:'Solução 2', lines:[`${c2}% de álcool`]}, {t:'Mistura desejada', lines:[`${V} litros`, `${t}% de álcool`]}]),
      ask:`Quantos litros da solução 1 (${c1}%) devem ser usados?`,
      opts: iqMC(x, [
        [y, `Essa é a quantidade da solução 2 (${c2}%).`],
        [V/2, `Metade de cada solução daria ${iqNum((c1+c2)/2)}% de álcool, e não ${t}%.`],
        [Math.round(V*t/c1*10)/10, 'Considerou só o álcool vindo da solução 1; a solução 2 também tem álcool.'],
        [V*t/100, 'Essa é a quantidade de álcool puro na mistura, não o volume da solução 1.'],
      ], {fmt:v=>iqNum(v)+' L'}),
      steps:[`x litros da solução 1 e y litros da solução 2: x + y = ${V}`, `Álcool: ${c1}% de x + ${c2}% de y = ${t}% de ${V} = ${iqNum(t*V/100)} L → ${c1}x + ${c2}y = ${t*V}`, `Com y = ${V} − x: ${c1}x + ${c2}·(${V} − x) = ${t*V} → ${c1-c2}x = ${t*V - c2*V}`, `x = ${x} L (e y = ${y} L)`]};
  },
  // parcelamento com entrada: taxa de juros embutida
  ()=>{
    const P = pick([800,1000,1200,1500,2000,2400,3000]), E = P*pick([20,25,30,40,50])/100, i = pick([2,3,4,5,6,8,10]), F = P - E, Q = Math.round(F*(100+i))/100, J = Math.round((Q-F)*100)/100;
    const prod = pick(['uma geladeira','um notebook','uma bicicleta elétrica','um televisor','uma máquina de lavar']);
    const r1 = v=> Math.round(v*10)/10;
    return {subj:'parcelamento', topic:'Juros no parcelamento', text:`<p>Uma loja vende ${prod} por ${iqMoney(P)} à vista. Também é possível pagar em duas vezes: uma entrada no ato da compra e uma parcela um mês depois, como no anúncio.</p>`,
      visual: iqCards([{t:'À vista', lines:[iqMoney(P)]}, {t:'A prazo', lines:[`Entrada: ${iqMoney(E)}`, `+ 1 parcela de ${iqMoney(Q)}`, 'paga 30 dias depois']}]),
      ask:'A taxa mensal de juros cobrada no pagamento a prazo é',
      opts: iqMC(i, [
        [r1(J/P*100), `Calculou os juros sobre o preço à vista inteiro; a entrada já foi paga, então o financiado é só ${iqMoney(F)}.`],
        [r1(J/(E+Q)*100), 'Dividiu pelo total pago a prazo; a base dos juros é o valor financiado.'],
        [r1((Q-P/2)/(P/2)*100), 'Supôs que cada pagamento corresponde à metade do preço, mas a entrada e a parcela têm valores diferentes.'],
        [i*2, 'Contou dois meses de juros, mas a parcela é paga só um mês depois.'],
        [r1(J/E*100), 'Dividiu os juros pela entrada; a base é o valor financiado.'],
      ], {fmt:v=>iqNum(v)+'%'}),
      steps:[`Valor financiado: ${iqMoney(P)} − ${iqMoney(E)} = ${iqMoney(F)}`, `Juros: ${iqMoney(Q)} − ${iqMoney(F)} = ${iqMoney(J)}`, `Taxa: ${iqMoney(J)} ÷ ${iqMoney(F)} = ${iqNum(i/100,2)} = ${i}% ao mês`]};
  }
);
