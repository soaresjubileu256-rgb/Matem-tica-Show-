/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — FUVEST
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */

/* ---------- ferramentas só deste arquivo ---------- */
/* expressão a partir de termos [coeficiente, 'x²'], pulando os zeros: [[1,'x²'],[-4,'x'],[3,'']] → "x² − 4x + 3" */
function fvPoly(terms){
  let s = '';
  terms.forEach(([c, v])=>{
    if(!c) return;
    const a = Math.abs(c), body = v ? ((a===1 ? '' : iqNum(a)) + v) : iqNum(a);
    s += s ? (c<0 ? ' − ' : ' + ') + body : (c<0 ? '−' : '') + body;
  });
  return s || '0';
}
/* k·√N simplificado (tira os quadrados de dentro da raiz) */
function fvRad(k, N){
  for(let f=Math.floor(Math.sqrt(N)); f>1; f--) if(N%(f*f)===0){ k *= f; N /= f*f; break; }
  return N===1 ? String(k) : (k===1 ? '' : k) + '√' + N;
}
/* fração simplificada com o sinal de menos tipográfico */
function fvFrac(p, q){ const [a,b] = simplifyFrac(p, q); return b===1 ? nm(a) : (a<0?'−':'') + Math.abs(a) + '/' + b; }
/* expoente em sobrescrito */
function fvSup(n){ return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join(''); }
/* combinação C(n, k) */
function fvC(n, k){ if(k<0 || k>n) return 0; let r = 1; for(let i=1;i<=k;i++) r = r*(n-k+i)/i; return Math.round(r); }
/* cos e sen de um ângulo notável (múltiplo de 30° ou de 45°), como [fator, radical], valendo fator·radical/2 */
function fvTrig(phi){
  phi = ((phi%360)+360)%360;
  const T = {0:[[2,''],[0,'']], 30:[[1,'√3'],[1,'']], 45:[[1,'√2'],[1,'√2']], 60:[[1,''],[1,'√3']]};
  let [c, s] = T[phi%90];
  for(let i=0; i<Math.floor(phi/90); i++) [c, s] = [[-s[0], s[1]], c]; // gira 90°: cos → −sen, sen → cos
  return [c, s];
}
/* R·(cos φ + i·sen φ) na forma algébrica (R par) */
function fvCis(R, phi){
  const [c, s] = fvTrig(phi), h = R/2, re = c[0]*h, im = s[0]*h;
  const reS = re ? nm(re) + c[1] : '', ia = Math.abs(im), imS = im ? (ia===1 ? '' : ia) + 'i' + s[1] : '';
  if(re && im) return reS + (im<0 ? ' − ' : ' + ') + imS;
  return re ? reS : (im<0 ? '−' : '') + imS;
}

IQ_FUVEST.push(
  // semelhança de sólidos: taça cônica parcialmente cheia
  ()=>{
    const [p,q] = pick([[1,2],[2,3],[3,4],[2,5],[3,5]]), u = pick([3,4,5,6]), H = q*u, h = p*u;
    const k = pick(p===1 ? [20,25,30,40,50] : p===2 ? [3,4,5,6,8] : [1,2,3]);
    const V = k*p*p*p, Vt = k*q*q*q, falta = Vt - V;
    return {subj:'espacial2', topic:'Semelhança de sólidos', text:`<p>Uma taça tem a forma de um cone circular reto, com o vértice para baixo e altura interna de ${H} cm. Com a taça na vertical, o suco colocado nela atinge ${h} cm de altura e ocupa ${iqNum(V)} mL.</p>`,
      visual: (()=>{ const ax = 160, ay = 176, ty = 30, R = 78, t = h/H, ly = ay - (ay-ty)*t, lr = R*t;
        let s = `<polygon points="${ax},${ay} ${_f(ax-lr)},${_f(ly)} ${_f(ax+lr)},${_f(ly)}" fill="rgba(255,138,76,.35)" stroke="none"/>`;
        s += `<ellipse cx="${ax}" cy="${_f(ly)}" rx="${_f(lr)}" ry="${_f(10*t)}" fill="rgba(255,138,76,.45)" stroke="#FF8A4C" stroke-width="1.5"/>`;
        s += cvL(ax, ay, ax-R, ty) + cvL(ax, ay, ax+R, ty) + `<ellipse cx="${ax}" cy="${ty}" rx="${R}" ry="10" class="geo-face side"/>`;
        s += cvL(ax+R+22, ty, ax+R+22, ay, 'geo-height') + iqT(ax+R+28, (ty+ay)/2+4, H+' cm', 12, 'geo-lbl-h', 'start');
        s += cvL(ax-R-22, ly, ax-R-22, ay, 'geo-height') + iqT(ax-R-28, (ly+ay)/2+4, h+' cm', 12, 'geo-lbl-h', 'end');
        return cvSVG(320, 190, s, 'Taça cônica com suco'); })(),
      ask:'Quantos mililitros de suco ainda cabem na taça até enchê-la completamente?',
      opts: iqMC(falta, [[Vt,'Esse é o volume da taça cheia; a pergunta é quanto ainda falta.'],[V*q/p - V,'Os volumes não seguem a razão das alturas: em sólidos semelhantes, a razão dos volumes é o cubo da razão de semelhança.'],[V*q*q/(p*p) - V,'Elevou a razão ao quadrado (isso vale para áreas); para volumes, use o cubo.'],[Vt*(q-p)/q,`Falta ${q-p}/${q} da altura, mas não ${q-p}/${q} do volume: a parte de cima, mais larga, guarda muito mais suco.`]], {fmt:v=>iqNum(v)+' mL'}),
      steps:[`O suco forma um cone semelhante à taça, com razão de semelhança ${h}/${H} = ${p}/${q}.`, `A razão dos volumes é o cubo: (${p}/${q})³ = ${p*p*p}/${q*q*q} → volume da taça = ${iqNum(V)} × ${q*q*q}/${p*p*p} = ${iqNum(Vt)} mL`, `Falta: ${iqNum(Vt)} − ${iqNum(V)} = ${iqNum(falta)} mL`]};
  },
  // volume de cilindro e de prisma: copos para encher um aquário
  ()=>{
    let r, hc, a, b, X, V, n;
    do{ r = pick([3,4,5]); hc = pick([8,10,12,15]); a = pick([30,40,50,60]); b = pick([20,25,30,40]); X = randInt(10,30); V = 3*r*r*hc; n = a*b*X/V; }
    while(n!==Math.round(n) || n<10 || n>150);
    const c = X + pick([10,15,20]), D = 2*r;
    const viaC = a*b*c/V, viaLat = a*b*X/(6*r*hc);
    return {subj:'espacial', topic:'Volume de prisma e cilindro', text:`<p>Um aquário tem a forma de um paralelepípedo reto-retângulo, com base de ${a} cm por ${b} cm e altura de ${c} cm. Para colocar água nele, usa-se um copo cilíndrico de ${D} cm de diâmetro interno e ${hc} cm de altura, sempre completamente cheio.</p>`,
      visual: (()=>{ const bx = 44, by = 56, bw = 170, bh = 118, dx = 28, dy = -20, wl = by + bh - bh*X/c;
        let s = `<rect x="${bx}" y="${_f(wl)}" width="${bw}" height="${_f(by+bh-wl)}" fill="rgba(76,125,255,.28)"/>`;
        s += `<polygon points="${bx},${_f(wl)} ${bx+bw},${_f(wl)} ${bx+bw+dx},${_f(wl+dy)} ${bx+dx},${_f(wl+dy)}" fill="rgba(76,125,255,.4)"/>`;
        s += `<polygon points="${bx+bw},${_f(wl)} ${bx+bw+dx},${_f(wl+dy)} ${bx+bw+dx},${by+bh+dy} ${bx+bw},${by+bh}" fill="rgba(76,125,255,.18)"/>`;
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" class="geo-face" fill="none"/>` + `<polygon points="${bx},${by} ${bx+dx},${by+dy} ${bx+bw+dx},${by+dy} ${bx+bw},${by}" class="geo-face" fill="none"/>` + cvL(bx+bw+dx, by+dy, bx+bw+dx, by+bh+dy) + cvL(bx+bw+dx, by+bh+dy, bx+bw, by+bh);
        s += iqT(bx+bw/2, by+bh+16, a+' cm', 12) + iqT(bx+bw+dx/2+8, by+bh+dy/2+14, b+' cm', 11, '', 'start') + iqT(bx-5, by+bh/2+4, c+' cm', 11, '', 'end');
        s += cvL(bx+10, wl, bx+10, by+bh, 'geo-height') + iqT(bx+14, (wl+by+bh)/2+4, X+' cm?', 11, 'geo-lbl-h', 'start');
        const cx = 290, ct = 66, cb = 132, cr = 18;
        s += `<rect x="${cx-cr}" y="${ct}" width="${2*cr}" height="${cb-ct}" class="geo-face front"/><ellipse cx="${cx}" cy="${cb}" rx="${cr}" ry="6" class="geo-face front"/><ellipse cx="${cx}" cy="${ct}" rx="${cr}" ry="6" class="geo-face top"/>`;
        s += iqT(cx, ct-12, '⌀ '+D+' cm', 11) + iqT(cx, cb+22, 'h = '+hc+' cm', 10.5);
        return cvSVG(320, 196, s, 'Aquário e copo cilíndrico'); })(),
      ask:`Usando π = 3, quantos copos cheios são necessários para que a água atinja ${X} cm de altura no aquário vazio?`,
      opts: iqMC(n, [[n%4===0 ? n/4 : undefined,'Usou o diâmetro como raio: o volume do copo ficou 4 vezes maior.'],[3*n,'Esqueceu o π no volume do cilindro: V = π · r² · h.'],[viaC===Math.round(viaC) ? viaC : undefined,`Essa quantidade enche o aquário até a borda (${c} cm), mas a água deve chegar só a ${X} cm.`],[viaLat===Math.round(viaLat) ? viaLat : undefined,'Usou 2πr · h (a área lateral) no lugar do volume π · r² · h.']], {fmt:v=>iqNum(v)}),
      steps:[`Raio do copo: ${D} ÷ 2 = ${r} cm → volume = π · r² · h = 3 × ${r*r} × ${hc} = ${iqNum(V)} cm³`, `Água no aquário: ${a} × ${b} × ${X} = ${iqNum(a*b*X)} cm³`, `Copos: ${iqNum(a*b*X)} ÷ ${iqNum(V)} = ${n}`]};
  },
  // lei dos cossenos: dois barcos saindo do mesmo porto
  ()=>{
    let [a,b,c,th] = pick([[3,5,7,120],[7,8,13,120],[5,16,19,120],[3,8,7,60],[5,8,7,60],[8,15,13,60],[5,21,19,60]]);
    if(Math.random()<0.5) [a,b] = [b,a];
    const m = pick([2,3,4,5].filter(v=> Math.max(a,b)*v <= 60)), t = pick([2,3]), A = a*m*t, B = b*m*t, d = c*m*t, cosS = th===120 ? '−1/2' : '1/2';
    const Nsign = a*a + b*b + (th===120 ? -a*b : a*b);
    return {subj:'leis', topic:'Lei dos cossenos', text:`<p>Dois barcos partem ao mesmo tempo de um porto P e navegam em linha reta, com velocidades constantes, em direções que formam um ângulo de ${th}°. Um deles navega a ${a*m} km/h e o outro, a ${b*m} km/h.</p>`,
      visual: (()=>{ const rad = th*Math.PI/180, Bx = B*Math.cos(rad), By = B*Math.sin(rad), mnx = Math.min(0, Bx), mxx = Math.max(A, Bx);
        const k = Math.min(230/(mxx-mnx), 120/By), X = v=> 44 + (v-mnx)*k, Y = v=> 156 - v*k;
        let s = cvL(X(0), Y(0), X(A), Y(0)) + cvL(X(0), Y(0), X(Bx), Y(By)) + cvL(X(A), Y(0), X(Bx), Y(By), 'geo-height');
        s += `<path d="${arcPath(X(0), Y(0), 20, 0, th)}" fill="none" stroke="#FF8A4C" stroke-width="2"/>` + iqT(X(0) + 30*Math.cos(rad/2), Y(0) - 30*Math.sin(rad/2) + 4, th+'°', 11, 'geo-lbl-h');
        s += cvDot(X(0), Y(0), 4) + cvDot(X(A), Y(0), 4) + cvDot(X(Bx), Y(By), 4) + iqT(X(0)-8, Y(0)+14, 'P', 12, '', 'end');
        s += iqT((X(0)+X(A))/2, Y(0)+18, A+' km', 11.5) + iqT((X(0)+X(Bx))/2 + (th===120 ? -10 : -12), (Y(0)+Y(By))/2, B+' km', 11.5, '', 'end') + iqT((X(A)+X(Bx))/2 + 8, (Y(0)+Y(By))/2, 'd = ?', 12, 'geo-lbl-h', 'start');
        return cvSVG(320, 182, s, 'Trajetórias dos barcos (fora de escala)'); })(),
      ask:`Depois de ${t} horas, a distância entre os dois barcos é`,
      opts: iqMC(`${d} km`, [[`${fvRad(m*t, Nsign)} km`,`Errou o sinal: cos ${th}° = ${cosS}, então o termo −2·a·b·cos ${th}° fica ${th===120?'positivo':'negativo'}.`],[`${fvRad(m*t, a*a+b*b)} km`,`Usou Pitágoras, mas o ângulo entre as trajetórias é ${th}°, não 90°.`],[`${(a+b)*m*t} km`,'Somou as distâncias; isso só valeria se os barcos fossem em sentidos opostos (180°).'],[`${Math.abs(a-b)*m*t} km`,'Subtraiu as distâncias; isso só valeria se os barcos seguissem a mesma direção (0°).'],[`${c*m} km`,`Usou as velocidades como se fossem distâncias: em ${t} horas, cada barco percorre ${t} vezes a velocidade.`]], {sort:false}),
      steps:[`Distâncias percorridas: ${a*m} × ${t} = ${A} km e ${b*m} × ${t} = ${B} km`, `Lei dos cossenos: d² = ${A}² + ${B}² − 2 · ${A} · ${B} · cos ${th}°, com cos ${th}° = ${cosS}`, `d² = ${A*A} + ${B*B} ${th===120?'+':'−'} ${A*B} = ${d*d}`, `d = ${d} km`]};
  },
  // PA: quantos dias de treino para atingir um total
  ()=>{
    const a1 = randInt(3,8), r = randInt(1,3), n = randInt(8,16), S = n*(2*a1+(n-1)*r)/2, an = a1 + (n-1)*r;
    const B = 2*a1 - r, D = B*B + 8*r*S, sq = Math.sqrt(D);
    const sem2 = (-B + Math.sqrt(B*B + 4*r*S))/(2*r);
    return {subj:'pa', topic:'Progressão aritmética', text:`<p>Para se preparar para uma corrida, ${iqName()} montou um treino: no 1º dia, correu ${a1} km e, a cada dia seguinte, ${r} km a mais que no dia anterior.</p>`, visual:'',
      ask:`Ao final de quantos dias de treino a distância total percorrida terá sido de ${S} km?`,
      opts: iqMC(n, [[S%a1===0 ? S/a1 : undefined,`Assim todos os dias teriam ${a1} km; a distância aumenta a cada dia.`],[(S-a1)%r===0 ? (S-a1)/r + 1 : undefined,`Tratou ${S} km como a distância do último dia; ${S} km é a soma de todos os dias.`],[n-1,`Em ${n-1} dias o total ainda é ${S-an} km.`],[n+1,`Em ${n+1} dias o total já seria ${S+an+r} km.`],[sem2===Math.round(sem2) ? sem2 : undefined,'Esqueceu de dividir por 2 na fórmula da soma da PA.']], {fmt:v=>v+' dias'}),
      steps:[`As distâncias formam uma PA com a₁ = ${a1} e r = ${r}: Sₙ = n · [2 · ${a1} + (n − 1) · ${r}] ÷ 2`, `n · (${fvPoly([[r,'n'],[B,'']])}) = ${2*S} → ${fvPoly([[r,'n²'],[B,'n'],[-2*S,'']])} = 0`, `Δ = ${B}² + 8 · ${r} · ${S} = ${D} = ${sq}² → n = (−${B} + ${sq}) ÷ ${2*r} = ${n} (a outra raiz é negativa)`]};
  },
  // produto de matrizes em contexto (custos)
  ()=>{
    const rec = ['Bolo','Torta'], ing = ['Farinha','Açúcar','Manteiga'], mk = ['Mercado X','Mercado Y'];
    const Q = rec.map(()=> [randInt(1,5), randInt(1,4), randInt(1,3)]);
    const P = [[randInt(4,8), randInt(4,8)], [randInt(3,7), randInt(3,7)], [randInt(25,40), randInt(25,40)]];
    const C = [0,1].map(i=> [0,1].map(j=> Q[i].reduce((s,v,k)=> s + v*P[k][j], 0)));
    const i = randInt(0,1), j = randInt(0,1), ans = C[i][j];
    const tot = Q[i].reduce((a,b)=>a+b,0) * P.reduce((a,row)=>a+row[j],0);
    return {subj:'matrizes', topic:'Produto de matrizes', text:`<p>Uma confeitaria organiza seus dados em duas matrizes. Na matriz Q, cada linha é um produto e cada coluna, a quantidade (em kg) de um ingrediente usada em uma fornada. Na matriz P, cada linha é um ingrediente e cada coluna, o preço do quilo (em reais) em um mercado.</p>`,
      visual: iqTable(['Q (kg)', ...ing], rec.map((r,a)=> [r, ...Q[a]])) + iqTable(['P (R$/kg)', ...mk], ing.map((g,a)=> [g, ...P[a]])),
      ask:`O elemento c${i+1}${j+1} da matriz C = Q · P representa o custo de uma fornada de ${rec[i].toLowerCase()} com os ingredientes comprados no ${mk[j]}. Esse custo é`,
      opts: iqMC(ans, [[C[1-i][j],`Usou a linha da outra receita (${rec[1-i].toLowerCase()}).`],[C[i][1-j],`Usou a coluna do outro mercado (${mk[1-j]}).`],[tot,'Multiplicou o total de quilos pela soma dos preços; cada ingrediente deve ser multiplicado pelo seu próprio preço.'],[C[i][0]+C[i][1],'Somou os custos nos dois mercados; a compra é feita num só.']], {fmt:iqMoney}),
      steps:[`c${i+1}${j+1} = linha ${i+1} de Q (${rec[i].toLowerCase()}) × coluna ${j+1} de P (${mk[j]})`, `= ${Q[i].map((v,k)=>`${v} × ${P[k][j]}`).join(' + ')}`, `= ${Q[i].map((v,k)=>v*P[k][j]).join(' + ')} = ${iqMoney(ans)}`]};
  },
  // sistema linear 3×3: somar as equações
  ()=>{
    let x, y, z, s; do{ x = randInt(14,30); y = randInt(5,12); z = randInt(8,18); s = x+y+z; } while(s%3!==0 || x===y || y===z || x===z);
    const A = 2*x+y+z, B = x+2*y+z, Cc = x+y+2*z, T = A+B+Cc;
    return {subj:'sistlin', topic:'Sistema linear', text:`<p>Uma lanchonete vende sanduíches, sucos e sobremesas, cada item sempre pelo mesmo preço. O quadro mostra três pedidos feitos num mesmo dia.</p>`,
      visual: iqTable(['Pedido','Sanduíches','Sucos','Sobremesas','Total'], [['1', 2, 1, 1, iqMoney(A)], ['2', 1, 2, 1, iqMoney(B)], ['3', 1, 1, 2, iqMoney(Cc)]]),
      ask:'Quanto custa um pedido com um sanduíche, um suco e uma sobremesa?',
      opts: iqMC(s, [[T/3,'Somou os três pedidos e dividiu por 3, mas na soma cada item aparece 4 vezes.'],[T/2,'Na soma dos três pedidos, cada item aparece 4 vezes, não 2.'],[T,'Essa é a soma dos três pedidos.'],[x,'Esse é o preço de um sanduíche só.']], {fmt:iqMoney}),
      steps:[`Com x, y e z os preços: 2x + y + z = ${A}; x + 2y + z = ${B}; x + y + 2z = ${Cc}`, `Somando as três equações: 4x + 4y + 4z = ${T}`, `x + y + z = ${T} ÷ 4 = ${iqMoney(s)}`]};
  },
  // circunferência: corda determinada por uma reta
  ()=>{
    const [r,d,hf] = pick([[5,3,4],[5,4,3],[10,6,8],[10,8,6],[13,5,12],[13,12,5],[15,9,12],[17,8,15],[17,15,8]]);
    let a, b; do{ a = randInt(-4,4); b = randInt(-4,4); } while(!a || !b);
    const [p,q] = pick([[3,4],[4,3],[3,-4],[4,-3]]), cc = pick([1,-1])*5*d - (p*a + q*b);
    const circ = fvPoly([[1,'x²'],[1,'y²'],[-2*a,'x'],[-2*b,'y'],[a*a+b*b-r*r,'']]) + ' = 0', reta = fvPoly([[p,'x'],[q,'y'],[cc,'']]) + ' = 0';
    const sq = (v, w)=> `(${w} ${v>0?'−':'+'} ${Math.abs(v)})²`;
    return {subj:'conicas', topic:'Circunferência', text:`<p>No plano cartesiano, a reta s: ${reta} corta a circunferência λ: ${circ} nos pontos A e B.</p>`,
      visual: (()=>{ const cx = 160, cy = 96, R = 74, ly = cy + R*d/r, hx = R*hf/r;
        let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="geo-face side"/>` + cvL(24, ly, 296, ly, 'geo-face') + cvL(cx-hx, ly, cx+hx, ly, 'geo-radius');
        s += cvL(cx, cy, cx, ly, 'geo-height') + cvL(cx, cy, cx+hx, ly, 'geo-hidden') + cvDot(cx, cy, 3.5) + cvDot(cx-hx, ly, 4) + cvDot(cx+hx, ly, 4);
        s += iqT(cx-8, cy-6, 'C', 12) + iqT(cx-hx-6, ly+16, 'A', 12, '', 'end') + iqT(cx+hx+6, ly+16, 'B', 12, '', 'start') + iqT(290, ly-6, 's', 12, 'geo-lbl-h', 'end');
        return cvSVG(320, 192, s, 'Circunferência e reta secante (fora de escala)'); })(),
      ask:'O comprimento da corda AB é',
      opts: iqMC(2*hf, [[hf,'Essa é só a metade da corda: a perpendicular do centro divide AB ao meio.'],[2*r,'Esse é o diâmetro; a corda só teria esse tamanho se s passasse pelo centro.'],[2*d,'Dobrou a distância do centro à reta, não a meia-corda.'],[d,'Essa é a distância do centro à reta s.'],[r*r-d*d,'Esse é r² − d²; falta tirar a raiz e dobrar.']], {fmt:v=>String(v)}),
      steps:[`Completando quadrados: ${sq(a,'x')} + ${sq(b,'y')} = ${r*r} → centro C(${nm(a)}, ${nm(b)}) e raio ${r}`, `Distância de C a s: |${p} · (${nm(a)}) ${q<0?'−':'+'} ${Math.abs(q)} · (${nm(b)}) ${cc<0?'−':'+'} ${Math.abs(cc)}| ÷ √(${p*p} + ${q*q}) = ${5*d} ÷ 5 = ${d}`, `Meia-corda (Pitágoras): √(${r}² − ${d}²) = √${r*r-d*d} = ${hf}`, `AB = 2 × ${hf} = ${2*hf}`]};
  },
  // números complexos: potência pela fórmula de De Moivre
  ()=>{
    const z = pick([
      {z:'1 + i', rho:'√2', rho2:2, th:45, ns:[4,6,8,10]},
      {z:'1 − i', rho:'√2', rho2:2, th:315, ns:[4,6,8,10]},
      {z:'1 + i√3', rho:'2', rho2:4, th:60, ns:[3,4,5,6,8,9]},
      {z:'−1 + i√3', rho:'2', rho2:4, th:120, ns:[3,5,6,8,9]},
      {z:'√3 + i', rho:'2', rho2:4, th:30, ns:[3,4,5,6,8,9]},
      {z:'√3 − i', rho:'2', rho2:4, th:330, ns:[3,4,5,6,8,9]},
    ]);
    const n = pick(z.ns), R = Math.round(Math.pow(Math.sqrt(z.rho2), n)), R2 = Math.pow(z.rho2, n), ang = n*z.th, phi = ang%360;
    const ok = fvCis(R, ang);
    return {subj:'complexos', topic:'Números complexos', text:`<p>Considere o número complexo z = ${z.z}, em que i é a unidade imaginária.</p>`, visual:'',
      ask:`O número z${fvSup(n)} é igual a`,
      opts: iqMC(ok, [[fvCis(R, z.th),'Elevou o módulo, mas esqueceu de multiplicar o argumento por '+n+'.'],[fvCis(R2, ang),`O módulo de z é ${z.rho}, não ${z.rho2}: |z| = √(a² + b²).`],[fvCis(R, -ang),'Trocou o sinal do argumento: esse é o conjugado de z'+fvSup(n)+'.'],[fvCis(R, ang+180),`Errou o quadrante: ${ang}° corresponde a ${phi}° no ciclo, não a ${(phi+180)%360}°.`],[fvCis(R, 90-ang),'Trocou o cosseno pelo seno ao voltar para a forma algébrica.']], {sort:false}),
      steps:[`|z| = ${z.rho} e arg(z) = ${z.th}°`, `De Moivre: z${fvSup(n)} = ${z.rho==='2' ? '2' : '(√2)'}${fvSup(n)} · [cos(${n} · ${z.th}°) + i · sen(${n} · ${z.th}°)] = ${R} · [cos ${ang}° + i · sen ${ang}°]`, `${ang}° corresponde a ${phi}° no ciclo → z${fvSup(n)} = ${ok}`]};
  },
  // polinômios: resto da divisão por um produto de fatores do 1º grau
  ()=>{
    let u, v, m, n, A, B;
    do{ u = randInt(-3,4); v = randInt(-3,4); m = pick([-5,-4,-3,-2,2,3,4,5]); n = randInt(-7,7); A = m*u+n; B = m*v+n; }
    while(u===v || !u || !v || !n || m===n || Math.abs(m)===Math.abs(n) || !A || !B || (A===m && B===n));
    const lin = w=> fvPoly([[1,'x'],[-w,'']]), prod = fvPoly([[1,'x²'],[-(u+v),'x'],[u*v,'']]), ok = fvPoly([[m,'x'],[n,'']]);
    return {subj:'polinomios', topic:'Polinômios', text:`<p>Um polinômio P(x) deixa resto ${nm(A)} na divisão por ${lin(u)} e resto ${nm(B)} na divisão por ${lin(v)}.</p>`, visual:'',
      ask:`O resto da divisão de P(x) por ${prod} é`,
      opts: iqMC(ok, [[fvPoly([[n,'x'],[m,'']]),'Trocou os coeficientes: confira R('+nm(u)+') = '+nm(A)+'.'],[fvPoly([[A,'x'],[B,'']]),'Usou os restos dados como coeficientes; o resto R(x) = ax + b deve valer '+nm(A)+' em x = '+nm(u)+' e '+nm(B)+' em x = '+nm(v)+'.'],[fvPoly([[m,'x'],[-n,'']]),'Erro de sinal ao calcular b.'],[fvPoly([[-m,'x'],[n,'']]),`Erro de sinal ao calcular a = (${nm(A)} − (${nm(B)})) ÷ (${nm(u)} − (${nm(v)})).`],[nm(A+B),'Somou os restos; o resto da divisão por um polinômio de grau 2 tem grau até 1.']], {sort:false}),
      steps:[`P(x) = (${prod}) · Q(x) + R(x), com R de grau menor que 2: R(x) = ax + b`, `x = ${nm(u)}: P(${nm(u)}) = R(${nm(u)}) → ${fvPoly([[u,'a'],[1,'b']])} = ${nm(A)}; x = ${nm(v)}: ${fvPoly([[v,'a'],[1,'b']])} = ${nm(B)}`, `Subtraindo: ${fvPoly([[u-v,'a']])} = ${nm(A-B)} → a = ${nm(m)}; daí b = ${nm(n)}`, `R(x) = ${ok}`]};
  },
  // arco duplo com o quadrante no ciclo
  ()=>{
    let [s,c,h] = pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]); if(Math.random()<0.5) [s,c] = [c,s];
    const Q = pick([2,3,4]), ss = (Q===2 ? 1 : -1)*s, cs = (Q===4 ? 1 : -1)*c, H2 = h*h;
    const giv = pick(['sen','cos']), gv = giv==='sen' ? ss : cs, other = giv==='sen' ? 'cos' : 'sen', ov = giv==='sen' ? cs : ss;
    const iv = {2:'π/2 &lt; x &lt; π', 3:'π &lt; x &lt; 3π/2', 4:'3π/2 &lt; x &lt; 2π'}[Q], askSen = Math.random()<0.5;
    const sin2 = fvFrac(2*ss*cs, H2), cos2 = fvFrac(cs*cs-ss*ss, H2);
    const opts = askSen
      ? iqMC(sin2, [[fvFrac(-2*ss*cs, H2),`Errou um sinal: no ${Q}º quadrante, sen x é ${ss>0?'positivo':'negativo'} e cos x é ${cs>0?'positivo':'negativo'}.`],[fvFrac(ss*cs, H2),'Esqueceu o 2: sen 2x = 2 · sen x · cos x.'],[cos2,'Esse é o valor de cos 2x.'],[fvFrac(2*gv, h),`sen 2x não é 2 · ${giv} x: use sen 2x = 2 · sen x · cos x.`]], {sort:false})
      : iqMC(cos2, [[fvFrac(ss*ss-cs*cs, H2),'Trocou a ordem: cos 2x = cos² x − sen² x.'],[sin2,'Esse é o valor de sen 2x.'],['1','Somou os quadrados (isso sempre dá 1); em cos 2x é a diferença.'],[fvFrac(2*cs, h),'cos 2x não é 2 · cos x: use cos 2x = cos² x − sen² x.']], {sort:false});
    return {subj:'identidades', topic:'Arco duplo', text:`<p>Sabe-se que ${giv} x = ${fvFrac(gv, h)}, com ${iv}.</p>`,
      visual: (()=>{ const cx = 160, cy = 100, R = 76, a = Math.atan2(ss, cs), px = cx + R*Math.cos(a), py = cy - R*Math.sin(a);
        let g = cvL(60, cy, 260, cy, 'iq-axis') + cvL(cx, 12, cx, 188, 'iq-axis') + `<circle cx="${cx}" cy="${cy}" r="${R}" class="geo-face side"/>`;
        g += cvL(cx, cy, px, py, 'geo-radius') + cvL(px, py, px, cy, 'geo-hidden') + cvL(px, py, cx, py, 'geo-hidden') + cvDot(px, py, 4) + iqT(px + (cs>0?10:-10), py + (ss>0?-6:14), 'x', 12, 'geo-lbl-h', cs>0 ? 'start' : 'end');
        g += iqT(256, cy-6, 'cos', 10, 'iq-tick', 'end') + iqT(cx+6, 20, 'sen', 10, 'iq-tick', 'start');
        return cvSVG(320, 200, g, 'Arco x no ciclo trigonométrico'); })(),
      ask:`O valor de ${askSen ? 'sen 2x' : 'cos 2x'} é`, opts,
      steps:[`sen² x + cos² x = 1 → ${other}² x = 1 − ${Math.abs(gv)*Math.abs(gv)}/${H2} = ${Math.abs(ov)*Math.abs(ov)}/${H2} → ${other} x = ±${Math.abs(ov)}/${h}`, `No ${Q}º quadrante, ${other} x é ${ov>0?'positivo':'negativo'}: ${other} x = ${fvFrac(ov, h)}`, askSen ? `sen 2x = 2 · sen x · cos x = 2 · (${fvFrac(ss,h)}) · (${fvFrac(cs,h)}) = ${sin2}` : `cos 2x = cos² x − sen² x = ${cs*cs}/${H2} − ${ss*ss}/${H2} = ${cos2}`]};
  },
  // inequação quociente: inteiros positivos que satisfazem
  ()=>{
    const a = randInt(2,5), c = a + randInt(2,4), b = c + randInt(2,5), ans = a + (b - c);
    const num = fvPoly([[1,'x²'],[-(a+b),'x'],[a*b,'']]);
    return {subj:'inequacoes', topic:'Inequação quociente', text:`<p>Considere a inequação</p><p style="text-align:center"><b>(${num}) / (x − ${c}) ≤ 0</b></p>`, visual:'',
      ask:'Quantos números inteiros positivos satisfazem essa inequação?',
      opts: iqMC(ans, [[ans+1,`Incluiu x = ${c}, que anula o denominador.`],[b-a+1,`Resolveu só o numerador ≤ 0 (de ${a} a ${b}); o sinal do denominador também conta.`],[a,`Esqueceu o intervalo de ${c} (exclusive) a ${b}.`],[b-c,`Esqueceu os inteiros positivos menores ou iguais a ${a}.`],[a-1+b-c-1,`Excluiu x = ${a} e x = ${b}, que zeram o numerador e satisfazem o "≤".`]], {fmt:v=>String(v)}),
      steps:[`Numerador: raízes ${a} e ${b} (soma ${a+b}, produto ${a*b}). Denominador: zera em x = ${c}, que não pode entrar.`, `Sinais: x &lt; ${a} → (+)/(−) &lt; 0 ✓; ${a} &lt; x &lt; ${c} → (−)/(−) &gt; 0; ${c} &lt; x &lt; ${b} → (−)/(+) &lt; 0 ✓; x &gt; ${b} → (+)/(+) &gt; 0`, `Solução: x ≤ ${a} ou ${c} &lt; x ≤ ${b}`, `Inteiros positivos: 1 a ${a} (${a} números) e ${c+1} a ${b} (${b-c} números) → ${ans}`]};
  },
  // função modular: soma de distâncias até três pontos
  ()=>{
    let a, b, c, mean; do{ a = randInt(2,12); b = a + randInt(4,20); c = b + randInt(4,20); mean = (a+b+c)/3; } while(mean!==Math.round(mean) || mean===b);
    const f = x=> Math.abs(x-a) + Math.abs(x-b) + Math.abs(x-c), D = c - a;
    const opts = [
      {label:`No km ${b}, e a soma das distâncias será ${D} km.`, ok:true},
      {label:`No km ${mean}, e a soma das distâncias será ${f(mean)} km.`, ok:false, why:`O km ${mean} é a média das posições, mas a média não minimiza a soma das distâncias: f(${b}) = ${D} é menor que f(${mean}) = ${f(mean)}.`},
      {label:`No km ${mean}, e a soma das distâncias será ${D} km.`, ok:false, why:`No km ${mean} a soma vale f(${mean}) = ${f(mean)}, não ${D}.`},
      {label:`Em qualquer ponto entre os km ${a} e ${c}, e a soma será ${D} km.`, ok:false, why:`Com só duas escolas isso seria verdade; com três, sair do km ${b} aumenta a distância até a escola do meio.`},
      {label:`No km ${a}, e a soma das distâncias será ${f(a)} km.`, ok:false, why:`No km ${a} a soma é f(${a}) = ${f(a)}, maior que f(${b}) = ${D}.`},
    ];
    return {subj:'modular', topic:'Função modular', text:`<p>Três escolas ficam à beira de uma estrada retilínea, nos quilômetros ${a}, ${b} e ${c}. Uma unidade de saúde será construída no km x dessa estrada, e a soma das distâncias dela até as três escolas é f(x) = |x − ${a}| + |x − ${b}| + |x − ${c}|.</p>`,
      visual: (()=>{ const X = v=> 40 + (v-a)/(c-a)*240;
        let s = cvL(14, 70, 306, 70, 'iq-axis');
        [[a,'A'],[b,'B'],[c,'C']].forEach(([v,l])=>{ s += cvDot(X(v), 70, 5) + iqT(X(v), 54, 'Escola '+l, 11) + iqT(X(v), 90, 'km '+v, 11, 'iq-tick'); });
        return cvSVG(320, 104, s, 'Escolas na estrada'); })(),
      ask:'Para que a soma das distâncias seja a menor possível, a unidade deve ficar', opts: shuffle(opts),
      steps:[`Para x entre ${a} e ${c}: |x − ${a}| + |x − ${c}| = ${c} − ${a} = ${D} (constante); fora desse trecho essa parte é maior.`, `Então f(x) = ${D} + |x − ${b}|, que é mínima quando |x − ${b}| = 0, ou seja, x = ${b}.`, `Mínimo: f(${b}) = ${D} km`]};
  },
  // combinatória: equipe com pelo menos um de cada grupo
  ()=>{
    const H = randInt(5,8), M = randInt(3,6), k = pick([3,4]), n = H + M;
    const tot = fvC(n,k), cH = fvC(H,k), cM = fvC(M,k), ans = tot - cH - cM, f = v=> v.toLocaleString('pt-BR');
    return {subj:'combinatoria', topic:'Combinações com restrição', text:`<p>Uma escola vai formar uma equipe de ${k} estudantes para uma olimpíada de ciências, escolhidos entre ${H} alunos do 2º ano e ${M} alunos do 3º ano. A equipe deve ter pelo menos um aluno de cada ano.</p>`, visual:'',
      ask:'De quantas maneiras diferentes a equipe pode ser formada?',
      opts: iqMC(ans, [[H*M*fvC(n-2,k-2),'Escolheu primeiro "um de cada ano" e completou com quaisquer alunos: a mesma equipe acaba contada mais de uma vez.'],[tot,'Esse é o total de equipes sem a restrição.'],[tot-cH,`Tirou só as equipes formadas apenas por alunos do 2º ano; faltou tirar as só do 3º ano.`],[tot-cM,'Tirou só as equipes formadas apenas por alunos do 3º ano; faltou tirar as só do 2º ano.'],[H*M,'Isso conta só a escolha de um aluno de cada ano; faltam os demais membros.']], {fmt:f}),
      steps:[`Sem restrição: C(${n}, ${k}) = ${f(tot)}`, `Equipes só do 2º ano: C(${H}, ${k}) = ${f(cH)}; só do 3º ano: C(${M}, ${k}) = ${f(cM)}`, `Pelo menos um de cada: ${f(tot)} − ${f(cH)} − ${f(cM)} = ${f(ans)}`]};
  },
  // desvio padrão de um conjunto de medidas
  ()=>{
    const [dv, sd0] = pick([[[-3,-1,0,1,3],2],[[-5,-1,-1,1,1,5],3],[[-1,-1,-1,-1,4],2],[[-2,-2,-2,2,2,2],2]]);
    const k = pick([1,2,3]), m = randInt(20,60), vals = shuffle(dv.map(d=> m + k*d)), N = vals.length, sd = sd0*k, va = sd*sd;
    const sum = vals.reduce((a,b)=>a+b,0), sq = vals.reduce((a,v)=>a+(v-m)*(v-m),0), mad = vals.reduce((a,v)=>a+Math.abs(v-m),0)/N;
    const ctx = pick([['o tempo, em minutos, que cada entregador de uma equipe levou para fazer uma mesma entrega','min','entregador'],['a massa, em gramas, de alguns pães escolhidos ao acaso numa fornada','g','pão'],['o número de pontos que um time marcou em cada jogo de um torneio','pontos','jogo']]);
    return {subj:'dispersao', topic:'Desvio padrão', text:`<p>A tabela mostra ${ctx[0]}.</p>`,
      visual: iqTable(vals.map((_,i)=> `${ctx[2][0].toUpperCase()+ctx[2].slice(1)} ${i+1}`), [vals]),
      ask:'O desvio padrão desses valores é',
      opts: iqMC(sd, [[va,'Essa é a variância; o desvio padrão é a raiz quadrada dela.'],[Number.isInteger(mad*100) ? mad : undefined,'Esse é o desvio médio (a média dos desvios em módulo), não o desvio padrão.'],[Math.max(...vals)-Math.min(...vals),'Essa é a amplitude (maior valor − menor valor).'],[m,'Essa é a média dos valores, não uma medida de dispersão.']], {fmt:v=>iqNum(v)+' '+ctx[1]}),
      steps:[`Média: ${sum} ÷ ${N} = ${m}`, `Desvios: ${vals.map(v=>nm(v-m)).join(', ')} → quadrados: ${vals.map(v=>(v-m)*(v-m)).join(' + ')} = ${sq}`, `Variância: ${sq} ÷ ${N} = ${va} → desvio padrão = √${va} = ${sd} ${ctx[1]}`]};
  }
);
