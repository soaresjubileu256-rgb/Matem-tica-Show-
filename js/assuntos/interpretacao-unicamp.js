/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — UNICAMP
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */
IQ_UNICAMP.push(
  // regra de três: dose de xarope pela massa da criança
  ()=>{
    let m, k, n, c, dia, mg, ml;
    do{ m = pick([10,12,14,15,16,18,20,24,25,30]); k = pick([10,15,20,25,30,40,50]); n = pick([2,3,4]); c = pick([10,20,25,40,50]);
      dia = m*k; mg = dia/n; ml = mg/c; } while(mg!==Math.round(mg) || Math.round(ml*10)!==ml*10 || ml<1 || ml>20);
    const med = pick(['um antitérmico','um antibiótico','um anti-inflamatório','um antialérgico']);
    const r1 = v=> Math.round(v*10)/10;
    return {subj:'regra3', topic:'Proporção (dose por massa)', text:`<p>Para crianças, a dose diária de ${med} é calculada pela fórmula D = ${k} · m, em que D é a dose em miligramas por dia e m é a massa da criança em quilogramas. A dose diária deve ser dividida em ${n} tomadas iguais. O remédio é vendido como xarope, com ${c} mg do princípio ativo em cada mililitro.</p>`,
      visual: iqTable(['Informação','Valor'], [['Dose diária', `D = ${k} · m (mg)`], ['Tomadas por dia', n], ['Concentração do xarope', `${c} mg/mL`]]),
      ask:`Uma criança tem ${m} kg. Quantos mililitros do xarope ela deve tomar em cada tomada?`,
      opts: iqMC(ml, [[r1(dia/c),'Esse é o volume do dia inteiro; falta dividir pelo número de tomadas.'],[mg,'Essa é a dose por tomada em miligramas; falta dividir pela concentração para obter mililitros.'],[r1(dia*n/c),'Multiplicou pelo número de tomadas, mas a dose do dia é dividida entre elas.'],[k/(n*c)>=0.5 ? r1(k/(n*c)) : null,'Esqueceu de multiplicar pela massa da criança: a fórmula dá a dose por quilograma.']], {n:4, fmt:v=>iqNum(v)+' mL', step:0.5}),
      steps:[`Dose diária: D = ${k} × ${m} = ${dia} mg`, `Por tomada: ${dia} ÷ ${n} = ${mg} mg`, `Volume: cada mL tem ${c} mg → ${mg} ÷ ${c} = ${iqNum(ml)} mL`]};
  },
  // unidades: gasolina x etanol numa viagem
  ()=>{
    const [g, e, L] = pick([[10,7,70],[12,8,24],[15,10,30],[14,10,70],[12,9,36]]);
    let D, pg, pe, cg, ce;
    do{ D = L*randInt(1,12); pg = pick([5.8,6,6.2,6.4,6.5]); pe = pick([3.8,3.9,4,4.2,4.4,4.5]);
      cg = Math.round(D/g*pg*100)/100; ce = Math.round(D/e*pe*100)/100; } while(D<200 || D>800 || Math.abs(cg-ce)<5);
    const best = cg<ce ? 'gasolina' : 'etanol', eco = Math.round(Math.abs(cg-ce)*100)/100, Lg = D/g, Le = D/e;
    const r2 = v=> Math.round(v*100)/100;
    return {subj:'unidades', topic:'Razão e consumo', text:`<p>O carro flex de ${iqName()} faz ${g} km por litro com gasolina e ${e} km por litro com etanol. Os preços no posto estão na tabela. A próxima viagem terá ${D} km, e a ideia é escolher o combustível que deixa a viagem mais barata.</p>`,
      visual: iqTable(['Combustível','Rendimento','Preço do litro'], [['Gasolina', `${g} km/L`, iqMoney(pg)], ['Etanol', `${e} km/L`, iqMoney(pe)]]),
      ask:'Escolhendo o combustível mais vantajoso, a economia na viagem, em relação ao outro combustível, será de',
      opts: iqMC(eco, [[r2((pg-pe)*Lg),'Multiplicou a diferença de preço pelos litros de gasolina, mas com etanol o carro gasta mais litros.'],[r2((pg-pe)*Le),'Multiplicou a diferença de preço pelos litros de etanol, mas com gasolina o carro gasta menos litros.'],[Math.min(cg,ce),'Esse é o custo da viagem com o combustível mais vantajoso, não a economia.'],[r2(Math.abs(Le-Lg)*pe),'Multiplicou a diferença de litros por um só preço; calcule o custo total de cada combustível.']], {n:4, fmt:iqMoney}),
      steps:[`Gasolina: ${D} ÷ ${g} = ${iqNum(Lg)} L → ${iqNum(Lg)} × ${iqMoney(pg)} = ${iqMoney(cg)}`, `Etanol: ${D} ÷ ${e} = ${iqNum(Le)} L → ${iqNum(Le)} × ${iqMoney(pe)} = ${iqMoney(ce)}`, `Mais vantajoso: ${best}. Economia: ${iqMoney(Math.max(cg,ce))} − ${iqMoney(Math.min(cg,ce))} = ${iqMoney(eco)}`]};
  },
  // regra de três composta: solução nutritiva numa estufa (concentração)
  ()=>{
    let A1, H1, D1, r, A2, H2, D2, c, V1, V2, kg;
    do{ A1 = pick([4,5,6,8]); H1 = pick([2,3,4,5]); D1 = pick([5,6,10]); r = pick([2,3,4,5]);
      A2 = randInt(3,12); H2 = randInt(2,6); D2 = pick([7,12,15,20,30]); c = pick([2,3,4,5]);
      V1 = A1*H1*D1*r; V2 = A2*H2*D2*r; kg = V2*c/1000; } while(A2===A1 || H2===H1 || D2===D1 || Math.round(kg*10)!==kg*10 || kg<1);
    const r1 = v=> Math.round(v*10)/10;
    return {subj:'regra3comp', topic:'Regra de três composta', text:`<p>Numa estufa de hortaliças, as plantas recebem uma solução nutritiva por aspersores, todos iguais. Com ${A1} aspersores funcionando ${H1} horas por dia, a estufa gasta ${V1.toLocaleString('pt-BR')} litros de solução em ${D1} dias. Cada litro da solução contém ${c} g de fertilizante dissolvido.</p>`,
      visual: iqTable(['','Aspersores','Horas por dia','Dias','Solução (L)'], [['Hoje', A1, H1, D1, V1.toLocaleString('pt-BR')], ['Plano', A2, H2, D2, '?']]),
      ask:`O produtor vai passar a usar ${A2} aspersores, funcionando ${H2} horas por dia, durante ${D2} dias. A massa de fertilizante necessária para preparar a solução desse período é de`,
      opts: iqMC(kg, [[r1(V1*(A2/A1)*(H1/H2)*(D2/D1)*c/1000),'Inverteu a razão das horas: mais horas por dia gastam mais solução (proporção direta).'],[r1(V1*(A2/A1)*(H2/H1)*c/1000),'Esqueceu de ajustar o número de dias.'],[r1(V2/1000),'Esse é o volume de solução em m³; falta multiplicar pela concentração de '+c+' g/L.'],[r1(V1*c/1000),'Essa é a massa da situação atual, não a do plano.']], {n:4, fmt:v=>iqNum(v)+' kg', step:0.5}),
      steps:['As três grandezas são diretamente proporcionais ao volume de solução.', `V = ${V1.toLocaleString('pt-BR')} × (${A2}/${A1}) × (${H2}/${H1}) × (${D2}/${D1}) = ${V2.toLocaleString('pt-BR')} L`, `Fertilizante: ${V2.toLocaleString('pt-BR')} × ${c} g = ${(V2*c).toLocaleString('pt-BR')} g = ${iqNum(kg)} kg`]};
  },
  // função exponencial: bactérias do iogurte
  ()=>{
    const T = pick([15,20,30,40]), N0 = pick([1000,1500,2000,2500,3000,5000]), k = randInt(3,8), N = N0*Math.pow(2,k), t = k*T;
    const f = v=> v.toLocaleString('pt-BR');
    return {subj:'exponencial', topic:'Função exponencial', text:`<p>Na fabricação de iogurte, uma cultura de bactérias é mantida a 42 °C. Nessas condições, o número de bactérias em uma amostra é dado por N(t) = N₀ · 2<sup>t/${T}</sup>, em que N₀ é o número inicial de bactérias e t é o tempo em minutos.</p>`, visual:'',
      ask:`Uma amostra começou com ${f(N0)} bactérias. Depois de quantos minutos ela terá ${f(N)} bactérias?`,
      opts: iqMC(t, [[k,`Esse é o valor de t/${T}; falta multiplicar por ${T}.`],[N/N0*T,`A razão ${f(N/N0)} é uma potência de 2: o expoente é ${k}, não ${f(N/N0)}.`],[(k+1)*T,'Contou uma duplicação a mais.'],[(k-1)*T,'Contou uma duplicação a menos.']], {n:4, fmt:v=>f(v)+' minutos'}),
      steps:[`${f(N)} = ${f(N0)} · 2<sup>t/${T}</sup> → 2<sup>t/${T}</sup> = ${f(N)} ÷ ${f(N0)} = ${f(N/N0)}`, `${f(N/N0)} = 2<sup>${k}</sup> → t/${T} = ${k}`, `t = ${k} × ${T} = ${t} minutos`]};
  },
  // logaritmo: escala de pH
  ()=>{
    const liq = [['suco de limão',2,'no'],['vinagre',3,'no'],['suco de tomate',4,'no'],['café',5,'no'],['leite',6,'no'],['água pura',7,'na'],['água do mar',8,'na'],['bicarbonato de sódio',9,'no'],['leite de magnésia',10,'no']];
    let a, b; do{ [a, b] = shuffle(liq).slice(0,2); } while(Math.abs(a[1]-b[1])<2);
    if(a[1]>b[1]) [a, b] = [b, a];
    const d = b[1]-a[1], ans = Math.pow(10,d);
    const scale = (()=>{ const x0 = 20, w = 20; let s = '';
      for(let i=0;i<=14;i++){ s += `<rect x="${x0+i*w}" y="60" width="${w}" height="22" fill="hsl(${i*18},75%,55%)" fill-opacity=".8"/>` + iqT(x0+i*w+w/2, 98, i, 10, 'iq-tick'); }
      s += iqT(x0, 116, '← mais ácido', 10.5, '', 'start') + iqT(x0+15*w, 116, 'mais básico →', 10.5, '', 'end');
      [[a,22],[b,40]].forEach(([l,y])=>{ const x = x0 + l[1]*w + w/2; s += cvL(x, y+4, x, 60, 'geo-height') + iqT(x, y, `${l[0]} (pH ${l[1]})`, 11, 'geo-lbl-h', x<90 ? 'start' : x>240 ? 'end' : 'middle'); });
      return cvSVG(340, 124, s, 'Escala de pH'); })();
    return {subj:'logaritmo', topic:'Logaritmo (pH)', text:`<p>A acidez de uma solução é medida pelo pH, definido por pH = −log[H⁺], em que [H⁺] é a concentração de íons hidrogênio, em mol/L, e o log é na base 10. A figura mostra o pH aproximado de dois líquidos.</p>`, visual: scale,
      ask:`A concentração de íons H⁺ ${a[2]} ${a[0]} é quantas vezes a concentração ${b[2]} ${b[0]}?`,
      opts: iqMC(ans, [[d,'A diferença de pH é o expoente, não a razão: cada unidade de pH multiplica a concentração por 10.'],[10*d,'Multiplicou 10 pela diferença; o certo é elevar 10 à diferença.'],[Math.pow(10,d-1),'Errou o expoente: a diferença de pH é '+d+'.'],[Math.pow(10,d+1),'Errou o expoente: a diferença de pH é '+d+'.'],[b[1]/a[1],'Dividir os valores de pH não serve: o pH é um logaritmo.']], {n:4, fmt:v=>v.toLocaleString('pt-BR')+' vezes'}),
      steps:[`[H⁺] = 10^(−pH): ${a[0]} → 10^(−${a[1]}); ${b[0]} → 10^(−${b[1]})`, `Razão: 10^(−${a[1]}) ÷ 10^(−${b[1]}) = 10^(${b[1]} − ${a[1]}) = 10^${d}`, `= ${ans.toLocaleString('pt-BR')} vezes`]};
  },
  // geometria espacial: latas cilíndricas para envasar um tanque
  ()=>{
    const [r, h] = pick([[4,10],[4,12.5],[5,10],[5,12],[3,10],[6,10],[4,15],[5,8]]), V = 3*r*r*h;
    const k = randInt(3,12)*100, T = V*k/1000;
    const f = v=> v.toLocaleString('pt-BR');
    const fig = (()=>{ const cx = 150, rx = 60, ry = 16, yT = 30, yB = 150;
      return cvSVG(320, 180, `<path d="M${cx-rx} ${yT} L${cx-rx} ${yB} A${rx} ${ry} 0 0 0 ${cx+rx} ${yB} L${cx+rx} ${yT}" class="geo-face front"/><ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${ry}" class="geo-face top"/><path d="M${cx-rx} ${yB} A${rx} ${ry} 0 0 1 ${cx+rx} ${yB}" class="geo-hidden"/>${cvL(cx, yT, cx+rx, yT, 'geo-radius')}${cvDot(cx, yT, 3)}${iqT(cx+rx/2, yT-5, iqNum(r)+' cm', 12, 'geo-lbl-h')}${cvL(cx+rx+18, yT, cx+rx+18, yB, 'geo-height')}${iqT(cx+rx+24, (yT+yB)/2+4, iqNum(h)+' cm', 12, 'geo-lbl-h', 'start')}`, 'Lata cilíndrica'); })();
    return {subj:'espacial', topic:'Volume do cilindro', text:`<p>Uma indústria envasa suco em latas cilíndricas cujas medidas internas são as da figura. Um tanque com ${f(T)} litros de suco será totalmente envasado nessas latas. Use π = 3 e lembre que 1 L = 1 000 cm³.</p>`, visual: fig,
      ask:'Quantas latas cheias serão obtidas?',
      opts: iqMC(k, [[Math.round(k/4),'Usou o diâmetro no lugar do raio: o volume ficou 4 vezes maior.'],[Math.round(k/10),'Erro na conversão: 1 L = 1 000 cm³, não 100 cm³.'],[Math.round(k*r),'Esqueceu de elevar o raio ao quadrado no volume.'],[Math.round(k*r/2),'Calculou a área lateral (2πrh), não o volume.']], {n:4, fmt:v=>f(v)}),
      steps:[`Volume de uma lata: π · r² · h = 3 × ${r}² × ${iqNum(h)} = ${f(V)} cm³ = ${f(V)} mL`, `Tanque: ${f(T)} L = ${f(T*1000)} cm³`, `Latas: ${f(T*1000)} ÷ ${f(V)} = ${f(k)}`]};
  },
  // probabilidade condicional: resultado positivo num exame
  ()=>{
    const [p, s, fp, P] = pick([[2,98,2,50],[4,80,5,40],[4,80,10,25],[4,96,1,80],[4,96,4,50],[5,95,5,50],[10,80,5,64],[10,90,10,50],[20,80,5,80],[20,96,1,96]]);
    const N = 10000, D = N*p/100, VP = D*s/100, FP = (N-D)*fp/100, f = v=> v.toLocaleString('pt-BR');
    const doenca = pick(['uma doença na tireoide','um tipo de anemia','uma infecção viral','o diabetes tipo 2']);
    return {subj:'condicional', topic:'Probabilidade condicional', text:`<p>Numa cidade, ${p}% da população tem ${doenca}. Um exame de sangue usado para detectar o problema dá resultado positivo em ${s}% das pessoas que têm a doença, mas também dá positivo, por engano, em ${fp}% das pessoas que não a têm.</p>`,
      visual: iqTable(['Dado','Valor'], [['Pessoas com a doença', p+'%'], ['Positivo entre quem tem a doença', s+'%'], ['Positivo entre quem não tem a doença', fp+'%']]),
      ask:'Uma pessoa dessa cidade, escolhida ao acaso, fez o exame e o resultado foi positivo. A probabilidade de ela ter a doença é de',
      opts: iqMC(P, [[s,'Essa é a chance de dar positivo sabendo que a pessoa está doente; a pergunta inverte a condição.'],[Math.round(VP/N*10000)/100,'Dividiu pela população inteira; o universo são só os resultados positivos.'],[100-P,'Essa é a chance de a pessoa NÃO ter a doença, mesmo com o positivo.'],[100-fp,'Essa é a chance de dar negativo para quem não tem a doença.'],[p,'Essa é a chance antes do exame; o resultado positivo muda o universo.']], {n:4, fmt:v=>iqNum(v)+'%', step:5}),
      steps:[`Imagine ${f(N)} pessoas: ${f(D)} têm a doença e ${f(N-D)} não têm.`, `Positivos verdadeiros: ${s}% de ${f(D)} = ${f(VP)}. Positivos falsos: ${fp}% de ${f(N-D)} = ${f(FP)}.`, `P = ${f(VP)} ÷ (${f(VP)} + ${f(FP)}) = ${f(VP)} ÷ ${f(VP+FP)} = ${P}%`]};
  },
  // velocidade média: subida e descida de uma serra de bicicleta
  ()=>{
    let v1, v2, d, t1, t2, pa, vm;
    do{ [v1, v2, d] = pick([[8,24,24],[10,15,30],[12,24,24],[10,40,40],[9,18,18],[12,36,36],[15,30,30],[20,30,60]]);
      t1 = d/v1; t2 = d/v2; pa = pick([0,0.5,1]); vm = 2*d/(t1+t2+pa); } while(Math.round(vm*10)!==vm*10);
    const r1 = v=> Math.round(v*10)/10, paTxt = pa ? ` No alto, parou ${pa===1?'1 hora':'30 minutos'} num mirante antes de voltar pelo mesmo caminho.` : ' Chegando ao alto, voltou imediatamente pelo mesmo caminho.';
    const fig = cvSVG(320, 150, `<path d="M20 125 L160 30 L300 125 Z" class="geo-face side"/>${cvL(10,125,310,125,'iq-axis')}${iqT(80, 66, 'subida', 12, '', 'end')}${iqT(80, 82, v1+' km/h', 12, 'geo-lbl-h', 'end')}${iqT(240, 66, 'descida', 12, '', 'start')}${iqT(240, 82, v2+' km/h', 12, 'geo-lbl-h', 'start')}${iqT(160, 22, 'mirante', 11)}${iqT(160, 142, d+' km em cada sentido', 11, 'iq-tick')}`, 'Perfil da serra');
    return {subj:'unidades', topic:'Velocidade média', text:`<p>Um ciclista subiu uma serra por uma estrada de ${d} km, com velocidade média de ${v1} km/h.${paTxt} Na descida, a velocidade média foi de ${v2} km/h.</p>`, visual: fig,
      ask:'A velocidade média do ciclista no passeio todo (ida, volta e eventuais paradas) foi de',
      opts: iqMC(vm, [[r1((v1+v2)/2),'A média das velocidades só vale quando os tempos são iguais; aqui ele passa mais tempo subindo.'],[pa ? r1(2*d/(t1+t2)) : null,'Esqueceu de contar o tempo parado no mirante.'],[r1(d/(t1+t2+pa)),'Usou só uma vez a distância; ida e volta somam '+(2*d)+' km.'],[v1+v2,'Somou as duas velocidades; a velocidade média é a distância total dividida pelo tempo total.']], {n:4, fmt:v=>iqNum(v)+' km/h', step:2}),
      steps:[`Subida: ${d} ÷ ${v1} = ${iqNum(t1)} h. Descida: ${d} ÷ ${v2} = ${iqNum(t2)} h.${pa?` Parada: ${iqNum(pa)} h.`:''}`, `Tempo total: ${iqNum(t1+t2+pa)} h. Distância total: ${2*d} km.`, `v = ${2*d} ÷ ${iqNum(t1+t2+pa)} = ${iqNum(vm)} km/h`]};
  },
  // função quadrática: foguete de garrafa PET lançado de uma plataforma
  ()=>{
    let T, s; do{ T = randInt(3,6); s = pick([1,2]); } while(T-s<2);
    const b = 5*(T-s), c = 5*T*s, tv = (T-s)/2;
    const H = c + b*b/20;
    const fig = (()=>{ const X = t=> 40 + t/T*250, top = Math.ceil(H/5)*5 + 5, Y = h=> 150 - h/top*120;
      let pts = []; for(let i=0;i<=40;i++){ const t = T*i/40; pts.push(`${_f(X(t))},${_f(Y(-5*t*t + b*t + c))}`); }
      return cvSVG(320, 180, `${cvL(30,150,305,150,'iq-axis')}${cvL(40,20,40,150,'iq-axis')}<rect x="28" y="${_f(Y(c))}" width="12" height="${_f(150-Y(c))}" class="geo-face front"/><polyline points="${pts.join(' ')}" fill="none" stroke="#FF8A4C" stroke-width="2.5" stroke-dasharray="6 4"/>${cvDot(X(0), Y(c), 3.5)}${iqT(46, Y(c)+14, c+' m', 11, 'geo-lbl-h', 'start')}${iqT(305, 168, 'tempo (s)', 10.5, 'iq-tick', 'end')}${iqT(44, 16, 'altura (m)', 10.5, 'iq-tick', 'start')}`, 'Trajetória do foguete (fora de escala)'); })();
    return {subj:'funcquad', topic:'Função quadrática', text:`<p>Numa feira de ciências, um foguete de garrafa PET foi lançado verticalmente do alto de uma plataforma. Desprezando a resistência do ar, a altura do foguete em relação ao solo, em metros, é dada por h(t) = −5t² + ${b}t + ${c}, com t em segundos a partir do lançamento.</p>`, visual: fig,
      ask:'Quanto tempo depois do lançamento o foguete atinge o solo?',
      opts: iqMC(T, [[tv,'Esse é o instante da altura máxima (o vértice), não o da chegada ao solo.'],[T-s,'Nesse instante o foguete volta à altura da plataforma (h = '+c+'), não ao solo.'],[s,'Trocou o sinal da raiz negativa; tempo negativo não serve, mas a outra raiz é a resposta.'],[T+s,'Somou as duas raízes em módulo; o foguete chega ao solo na raiz positiva.']], {n:4, fmt:v=>iqNum(v)+' s', step:0.5}),
      steps:[`No solo, h(t) = 0: −5t² + ${b}t + ${c} = 0 → t² − ${T-s}t − ${T*s} = 0`, `Raízes: t = ${T} ou t = −${s} (fatorando: (t − ${T})(t + ${s}) = 0)`, `O tempo é positivo: t = ${T} s`]};
  },
  // geometria analítica: reta de tendência do CO₂ na atmosfera
  ()=>{
    let y0, r, Yr, Y; do{ y0 = randInt(366,374); r = pick([1.5,2,2.5]); Yr = 2020 + 2*randInt(5,20); Y = y0 + r*(Yr-2000); } while(Y!==Math.round(Y));
    const y1 = y0 + 20*r;
    const fig = (()=>{ const X = a=> 46 + (a-2000)/(Yr+4-2000)*260, Yp = v=> 130 - (v-y0)/(Y-y0)*100;
      let s = cvL(40,160,312,160,'iq-axis') + cvL(46,16,46,166,'iq-axis');
      s += `<line x1="${_f(X(2000))}" y1="${_f(Yp(y0))}" x2="${_f(X(2020))}" y2="${_f(Yp(y1))}" stroke="#FF8A4C" stroke-width="2.5"/>`;
      s += `<line x1="${_f(X(2020))}" y1="${_f(Yp(y1))}" x2="${_f(X(Yr+4))}" y2="${_f(Yp(y0 + r*(Yr+4-2000)))}" stroke="#FF8A4C" stroke-width="2" stroke-dasharray="6 4"/>`;
      s += cvDot(X(2000), Yp(y0), 4) + cvDot(X(2020), Yp(y1), 4) + iqT(X(2000)+8, Yp(y0)+16, `(2000; ${y0})`, 11, 'geo-lbl-h', 'start') + iqT(X(2020)+8, Yp(y1)+16, `(2020; ${y1})`, 11, 'geo-lbl-h', 'start');
      s += iqT(X(2000), 174, '2000', 10, 'iq-tick') + iqT(X(2020), 174, '2020', 10, 'iq-tick') + iqT(312, 174, 'ano', 10.5, 'iq-tick', 'end') + iqT(50, 12, 'CO₂ (ppm)', 10.5, 'iq-tick', 'start');
      return cvSVG(320, 182, s, 'Reta de tendência do CO₂'); })();
    return {subj:'analitica', topic:'Equação da reta', text:`<p>Um modelo simplificado descreve a concentração de gás carbônico (CO₂) na atmosfera, em partes por milhão (ppm), por uma reta. Pelo modelo, a concentração era de ${y0} ppm no ano 2000 e de ${y1} ppm em 2020, como no gráfico.</p>`, visual: fig,
      ask:`Mantida essa tendência linear, em que ano a concentração de CO₂ atingirá ${Y} ppm?`,
      opts: iqMC(Yr, [[Yr+20,'Calculou o tempo a partir de 2000, mas somou a 2020.'],[2000 + (Yr-2000)/2,'Usou o dobro da taxa anual de crescimento.'],[2000 + 2*(Yr-2000),'Usou a metade da taxa anual de crescimento.'],[Math.round(2000 + (Y-y0)/(y1-y0)),'Tratou o aumento de 20 anos como se fosse de 1 ano: a taxa por ano é '+iqNum(r)+' ppm.']], {n:4, fmt:v=>String(v), step:2}),
      steps:[`Taxa: (${y1} − ${y0}) ÷ (2020 − 2000) = ${iqNum(20*r)} ÷ 20 = ${iqNum(r)} ppm por ano`, `Reta: C(x) = ${y0} + ${iqNum(r)} · (x − 2000)`, `${Y} = ${y0} + ${iqNum(r)} · (x − 2000) → x − 2000 = ${iqNum(Y-y0)} ÷ ${iqNum(r)} = ${Yr-2000} → x = ${Yr}`]};
  }
);
