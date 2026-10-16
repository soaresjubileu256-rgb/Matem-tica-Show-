/* =========================================================
   FIGURAS DOS ASSUNTOS QUE CAEM NAS PROVAS
   Desenhos (SVG ou HTML) usados nos exemplos de complementares.js.
   Seguem as mesmas classes das figuras de geometria (geo-fig, geo-face, geo-lbl...),
   então ficam certas no tema claro e no escuro.
   ========================================================= */
const _f = v=> (+v).toFixed(1);
function cvSVG(w, h, body, label){ return `<svg class="geo-fig" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`; }
function cvT(x, y, t, cls, anchor){ return `<text x="${_f(x)}" y="${_f(y)}" text-anchor="${anchor||'middle'}" class="geo-lbl ${cls||''}">${t}</text>`; }
function cvL(x1, y1, x2, y2, cls){ return `<line x1="${_f(x1)}" y1="${_f(y1)}" x2="${_f(x2)}" y2="${_f(y2)}" class="${cls||'geo-face'}"/>`; }
function cvDot(x, y, r){ return `<circle cx="${_f(x)}" cy="${_f(y)}" r="${r||3.5}" class="geo-dot"/>`; }
function cvArrowDefs(id){ return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#FF8A4C"/></marker></defs>`; }
let _cvId = 0;

/* ---------- Grandezas e unidades ---------- */
/* escadinha km → mm: cada degrau pra baixo × 10; destaca o caminho de "from" até "to" */
function unitStairsSVG(from, to){
  const U = ['km','hm','dam','m','dm','cm','mm'], i0 = U.indexOf(from), i1 = U.indexOf(to);
  const W = 320, H = 220, sw = 42, sh = 21, x0 = 13, y0 = 30;
  let s = '';
  U.forEach((u,i)=>{
    const x = x0 + i*sw, y = y0 + i*sh, on = i>=Math.min(i0,i1) && i<=Math.max(i0,i1);
    s += `<rect x="${x}" y="${y}" width="${sw}" height="${H-20-y}" rx="4" class="geo-face ${on?'top':'side'}" ${on?'style="stroke:#FF8A4C"':''}/>`;
    s += cvT(x+sw/2, y+17, u, on?'geo-lbl-h':'');
  });
  for(let i=Math.min(i0,i1); i<Math.max(i0,i1); i++){
    const x = x0 + (i+1)*sw, y = y0 + i*sh + 2;
    s += cvT(x+2, y-4, i0<i1 ? '×10' : '÷10', 'geo-lbl-h', 'middle').replace('class="geo-lbl', 'font-size="11" class="geo-lbl');
  }
  return cvSVG(W, H, s, `Escada de unidades de ${from} a ${to}`);
}
/* caixa (piscina, caixa-d'água) com medidas em metros */
function poolSVG(c, l, h){ return geoSolid('box', {c, l, h}).replace(/ cm</g, ' m<'); }
/* mapa com duas cidades, régua entre elas e a escala */
function mapScaleSVG(cm, scale){
  const W = 320, H = 200, x1 = 50, x2 = 270, y = 92, k = (x2-x1)/cm;
  let s = `<rect x="14" y="14" width="${W-28}" height="${H-28}" rx="14" class="geo-face side"/>`;
  s += `<path d="M24 168 C 90 150, 120 182, 190 164 S 270 150, 296 166" fill="none" class="geo-hidden"/>`;
  for(let i=0;i<=cm;i++) s += cvL(x1+i*k, y+16, x1+i*k, y+(i%cm===0?28:24), 'geo-radius');
  s += cvL(x1, y+22, x2, y+22, 'geo-radius');
  s += cvL(x1, y, x2, y, 'geo-height');
  s += cvDot(x1, y, 6) + cvDot(x2, y, 6);
  s += cvT(x1, y-14, 'A') + cvT(x2, y-14, 'B') + cvT((x1+x2)/2, y+48, `${cm} cm no mapa`, 'geo-lbl-h');
  s += cvT(W/2, 38, `Escala 1 : ${scale.toLocaleString('pt-BR')}`);
  return cvSVG(W, H, s, 'Mapa com escala');
}

/* ---------- Regra de três composta ---------- */
/* tabela com as grandezas e setas: ↓ na coluna do x; a mesma seta = direta, seta ao contrário = inversa */
function compTableHTML(heads, r1, r2, kinds){
  const arrow = k=> k==='x' ? '↓' : k==='direta' ? '↓' : '↑';
  const tag = k=> k==='x' ? 'tem o x' : k;
  return `<table class="mini-table cv-comp"><tr>${heads.map(x=>`<th>${x}</th>`).join('')}</tr>
    <tr>${r1.map(x=>`<td>${x}</td>`).join('')}</tr><tr>${r2.map(x=>`<td>${x}</td>`).join('')}</tr>
    <tr>${kinds.map(k=>`<td class="cv-arrow ${k==='inversa'?'inv':''}"><b>${arrow(k)}</b><small>${tag(k)}</small></td>`).join('')}</tr></table>`;
}

/* ---------- Divisores ---------- */
/* algarismos em fichas somando */
function digitChipsHTML(n, div){
  const d = String(n).split(''), sum = d.reduce((t,x)=>t+ +x, 0);
  return `<div class="cv-chips">${d.map(x=>`<span>${x}</span>`).join('<i>+</i>')}<i>=</i><span class="hit">${sum}</span><em>${sum%div===0 ? `✓ está na tabuada do ${div}` : `✗ não está na tabuada do ${div}`}</em></div>`;
}
/* todos os retângulos que dá pra montar com n quadradinhos: cada um mostra um par de divisores */
function divisorRectsSVG(n){
  const pairs = []; for(let a=1;a*a<=n;a++) if(n%a===0) pairs.push([a, n/a]);
  const u = Math.min(14, 220/n*1.0 > 8 ? 12 : 9), W = 320;
  let y = 16, s = '';
  pairs.forEach(([a,b])=>{
    const w = b*u, h = a*u, x = 16;
    for(let i=0;i<a;i++) for(let j=0;j<b;j++) s += `<rect x="${x+j*u}" y="${y+i*u}" width="${u-1.5}" height="${u-1.5}" rx="2" class="geo-face top" style="stroke-width:1"/>`;
    s += cvT(x+w+12, y+h/2+5, `${a} × ${b}`, 'geo-lbl-h', 'start');
    y += h + 16;
  });
  const div = pairs.flatMap(([a,b])=> a===b ? [a] : [a,b]).sort((p,q)=>p-q);
  s += cvT(16, y+8, `Divisores: ${div.join(', ')}`, '', 'start');
  return cvSVG(W, y+20, s, `Retângulos com ${n} quadradinhos`);
}
/* ciclo dos últimos algarismos (repete como um relógio) */
function cycleSVG(vals, hi, base){
  const W = 320, H = 200, cx = 160, cy = 100, R = 66, n = vals.length, id = 'cva'+(++_cvId);
  let s = cvArrowDefs(id);
  vals.forEach((v,i)=>{
    const a = -Math.PI/2 + i*2*Math.PI/n, x = cx+R*Math.cos(a), y = cy+R*Math.sin(a), a2 = a + 2*Math.PI/n;
    const m1 = a + 0.35, m2 = a2 - 0.35;
    s += `<path d="M${_f(cx+R*Math.cos(m1))} ${_f(cy+R*Math.sin(m1))} A${R} ${R} 0 0 1 ${_f(cx+R*Math.cos(m2))} ${_f(cy+R*Math.sin(m2))}" fill="none" stroke="#FF8A4C" stroke-width="2" marker-end="url(#${id})"/>`;
    s += `<circle cx="${_f(x)}" cy="${_f(y)}" r="19" class="geo-face ${i===hi?'top':'side'}" ${i===hi?'style="stroke:#FF8A4C;stroke-width:3"':''}/>`;
    s += cvT(x, y+6, v, i===hi?'geo-lbl-h':'');
    s += cvT(x + (Math.cos(a)>0.3?34:Math.cos(a)<-0.3?-34:0), y + (Math.sin(a)<-0.3?-26:Math.sin(a)>0.3?34:5), `${base}${['¹','²','³','⁴'][i]}`, '', 'middle').replace('class="geo-lbl', 'font-size="12" opacity=".7" class="geo-lbl');
  });
  s += cvT(cx, cy+5, 'repete');
  return cvSVG(W, H, s, 'Ciclo dos últimos algarismos');
}

/* ---------- Sequências ---------- */
/* reta com pulos iguais: 4, 9, 14, 19… */
function jumpsSVG(start, step, count){
  const W = 320, H = 120, x0 = 24, dx = (W-48)/(count-1), y = 82, id = 'cva'+(++_cvId);
  let s = cvArrowDefs(id) + cvL(10, y, W-10, y, 'geo-face');
  for(let i=0;i<count;i++){
    const x = x0+i*dx;
    s += cvL(x, y-6, x, y+6, 'geo-face') + cvDot(x, y) + cvT(x, y+26, start+i*step);
    if(i<count-1) s += `<path d="M${_f(x+4)} ${y-8} Q ${_f(x+dx/2)} ${y-46} ${_f(x+dx-4)} ${y-8}" fill="none" stroke="#FF8A4C" stroke-width="2" marker-end="url(#${id})"/>` + cvT(x+dx/2, y-38, `+${step}`, 'geo-lbl-h');
  }
  return cvSVG(W, H, s, 'Sequência com passo constante');
}
/* padrão de cores que se repete, separado em blocos; destaca uma posição */
function colorPatternSVG(colors, total, hi){
  const W = 320, k = colors.length, r = 9, gap = 22, perRow = 12, rows = Math.ceil(total/perRow);
  const H = 30 + rows*34 + 26;
  let s = '';
  for(let i=0;i<total;i++){
    const row = Math.floor(i/perRow), col = i%perRow, x = 22 + col*gap + Math.floor(col/k)*0, y = 30 + row*34;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${colors[i%k]}" ${i+1===hi?'stroke="#FF8A4C" stroke-width="4"':''}/>`;
    if(i%k===k-1 && i<total-1) s += cvL(x+gap/2, y-12, x+gap/2, y+12, 'geo-hidden');
  }
  s += cvT(W/2, H-12, `blocos de ${k} · ${hi} ÷ ${k} deixa resto ${hi%k}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Padrão de cores que se repete');
}
/* quadradinhos de palito em fila: 1, 2 e 3 quadrados */
function matchSquaresSVG(){
  const W = 320, H = 130, u = 30, y = 30;
  let s = '', x = 14;
  [1,2,3].forEach(n=>{
    for(let i=0;i<=n;i++) s += cvL(x+i*u, y, x+i*u, y+u, 'geo-radius');
    for(let i=0;i<n;i++) s += cvL(x+i*u+2, y, x+(i+1)*u-2, y, 'geo-radius') + cvL(x+i*u+2, y+u, x+(i+1)*u-2, y+u, 'geo-radius');
    s += cvT(x+n*u/2, y+u+26, `${n} → ${3*n+1}`);
    x += n*u + 34;
  });
  s += cvT(W/2, H-10, 'cada quadrado novo: +3 palitos', 'geo-lbl-h');
  return cvSVG(W, H, s, 'Quadrados feitos de palitos');
}

/* ---------- Ângulos ---------- */
function arcPath(cx, cy, r, a1, a2){ // ângulos em graus, sentido anti-horário a partir do eixo x
  const p = a=> [cx + r*Math.cos(a*Math.PI/180), cy - r*Math.sin(a*Math.PI/180)];
  const [x1,y1] = p(a1), [x2,y2] = p(a2);
  return `M${_f(x1)} ${_f(y1)} A${r} ${r} 0 ${a2-a1>180?1:0} 0 ${_f(x2)} ${_f(y2)}`;
}
/* arco no vértice V entre os lados que vão pra A e pra B */
function cornerArc(V, A, B, r){
  const u = P=>{ const dx = P[0]-V[0], dy = P[1]-V[1], l = Math.hypot(dx,dy); return [dx/l, dy/l]; };
  const a = u(A), b = u(B), sweep = a[0]*b[1] - a[1]*b[0] > 0 ? 1 : 0;
  return `M${_f(V[0]+a[0]*r)} ${_f(V[1]+a[1]*r)} A${r} ${r} 0 0 ${sweep} ${_f(V[0]+b[0]*r)} ${_f(V[1]+b[1]*r)}`;
}
/* reta com um raio saindo: ângulo a e o suplemento */
function supplementSVG(a){
  const W = 320, H = 170, cx = 160, cy = 140, L = 130;
  let s = cvL(cx-L, cy, cx+L, cy) + cvL(cx, cy, cx + L*Math.cos(a*Math.PI/180), cy - L*Math.sin(a*Math.PI/180));
  s += `<path d="${arcPath(cx, cy, 34, 0, a)}" fill="none" stroke="#FF8A4C" stroke-width="2.5"/>`;
  s += `<path d="${arcPath(cx, cy, 26, a, 180)}" fill="none" class="geo-face"/>`;
  const m1 = a/2*Math.PI/180, m2 = (a+180)/2*Math.PI/180;
  s += cvT(cx + 60*Math.cos(m1), cy - 60*Math.sin(m1) + 5, `${a}°`, 'geo-lbl-h') + cvT(cx + 58*Math.cos(m2), cy - 58*Math.sin(m2) + 5, `${180-a}°`);
  s += cvDot(cx, cy) + cvT(W/2, 22, `${a}° + ${180-a}° = 180°`);
  return cvSVG(W, H, s, 'Ângulos suplementares');
}
/* triângulo com os três ângulos (A embaixo à esquerda, B embaixo à direita) */
function triangleAnglesSVG(A, B, labels){
  const W = 320, H = 190, x1 = 40, x2 = 280, yb = 165;
  const tA = Math.tan(A*Math.PI/180), tB = Math.tan(B*Math.PI/180), xt = (tB*x2 + tA*x1)/(tA+tB), yt = yb - tA*(xt-x1);
  const k = Math.min(1, (yb-20)/(yb-yt)), X = x=> W/2 + (x-W/2)*k, Y = y=> yb - (yb-y)*k;
  const P = [[X(x1),yb],[X(x2),yb],[X(xt),Y(yt)]];
  let s = `<polygon points="${P.map(p=>p.map(_f).join(',')).join(' ')}" class="geo-face front"/>`;
  const C = 180-A-B, lab = labels || [`${A}°`, `${B}°`, `${C}°`];
  s += `<path d="${arcPath(P[0][0], P[0][1], 26, 0, A)}" fill="none" class="geo-face"/>`;
  s += `<path d="${arcPath(P[1][0], P[1][1], 26, 180-B, 180)}" fill="none" class="geo-face"/>`;
  s += `<path d="${cornerArc(P[2], P[0], P[1], 24)}" fill="none" stroke="#FF8A4C" stroke-width="2.5"/>`;
  s += cvT(P[0][0]+44, P[0][1]-8, lab[0]) + cvT(P[1][0]-44, P[1][1]-8, lab[1]) + cvT(P[2][0], P[2][1]+44, lab[2], 'geo-lbl-h');
  return cvSVG(W, H, s, 'Ângulos de um triângulo');
}
/* polígono regular dividido em triângulos a partir de um vértice */
function polygonSplitSVG(n, angleLabel){
  const W = 320, H = 210, cx = 160, cy = 108, R = 90;
  const P = Array.from({length:n}, (_,i)=>{ const a = Math.PI/2 + Math.PI/n + i*2*Math.PI/n; return [cx+R*Math.cos(a), cy+R*Math.sin(a)]; });
  let s = '';
  for(let i=1;i<n-1;i++) s += `<polygon points="${[P[0],P[i],P[i+1]].map(p=>p.map(_f).join(',')).join(' ')}" class="geo-face ${i%2?'top':'side'}"/>`;
  s += `<polygon points="${P.map(p=>p.map(_f).join(',')).join(' ')}" fill="none" class="geo-face"/>`;
  s += cvDot(P[0][0], P[0][1]);
  for(let i=1;i<n-1;i++){ const m = [(P[0][0]+P[i][0]+P[i+1][0])/3, (P[0][1]+P[i][1]+P[i+1][1])/3]; s += cvT(m[0], m[1]+5, '180°').replace('class="geo-lbl', 'font-size="12" class="geo-lbl'); }
  if(angleLabel) s += cvT(P[Math.floor(n/2)][0], P[Math.floor(n/2)][1] + (P[Math.floor(n/2)][1]>cy?20:-8), angleLabel, 'geo-lbl-h');
  return cvSVG(W, H, s, `Polígono de ${n} lados dividido em ${n-2} triângulos`);
}

/* ---------- Produtos notáveis ---------- */
/* quadrado de lado a + b dividido em a², ab, ab, b² */
function squareOfSumSVG(aL, bL, a, b){
  const W = 320, H = 230, S = 170, k = S/(a+b), A = a*k, x0 = (W-S)/2, y0 = 26;
  let s = '';
  s += `<rect x="${x0}" y="${y0}" width="${A}" height="${A}" class="geo-face top"/>`;
  s += `<rect x="${x0+A}" y="${y0}" width="${S-A}" height="${A}" class="geo-face side" style="fill:rgba(255,138,76,.18)"/>`;
  s += `<rect x="${x0}" y="${y0+A}" width="${A}" height="${S-A}" class="geo-face side" style="fill:rgba(255,138,76,.18)"/>`;
  s += `<rect x="${x0+A}" y="${y0+A}" width="${S-A}" height="${S-A}" class="geo-face front"/>`;
  s += cvT(x0+A/2, y0+A/2+6, `${aL}²`) + cvT(x0+A+(S-A)/2, y0+A/2+6, `${aL}·${bL}`, 'geo-lbl-h') + cvT(x0+A/2, y0+A+(S-A)/2+6, `${aL}·${bL}`, 'geo-lbl-h') + cvT(x0+A+(S-A)/2, y0+A+(S-A)/2+6, `${bL}²`);
  s += cvT(x0+A/2, y0-8, aL) + cvT(x0+A+(S-A)/2, y0-8, bL) + cvT(x0-10, y0+A/2+5, aL, '', 'end') + cvT(x0-10, y0+A+(S-A)/2+5, bL, '', 'end');
  s += cvT(W/2, y0+S+24, `(${aL} + ${bL})² = ${aL}² + 2·${aL}·${bL} + ${bL}²`);
  return cvSVG(W, H, s, 'Quadrado da soma');
}
/* quadrado a × a sem o cantinho b × b: sobra a² − b², que vira o retângulo (a + b) × (a − b) */
function diffSquaresSVG(aL, bL, a, b){
  const W = 320, H = 220, S = 140, k = S/a, B = b*k, x0 = (W-S)/2, y0 = 30;
  let s = `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" class="geo-face top"/>`;
  s += `<rect x="${x0+S-B}" y="${y0+S-B}" width="${B}" height="${B}" class="geo-hidden" style="fill:rgba(255,138,76,.25)"/>`;
  s += cvT(x0+S/2, y0-10, aL) + cvT(x0-10, y0+S/2+5, aL, '', 'end') + cvT(x0+S-B/2, y0+S+20, bL, 'geo-lbl-h') + cvT(x0+S+10, y0+S-B/2+5, bL, 'geo-lbl-h', 'start');
  s += cvT(x0+(S-B)/2, y0+(S-B)/2+6, `${aL}² − ${bL}²`);
  s += cvT(W/2, H-10, `tira o quadradinho ${bL}² do quadrado ${aL}²`).replace('class="geo-lbl', 'font-size="12" class="geo-lbl');
  return cvSVG(W, H, s, 'Diferença de quadrados');
}

/* ---------- Pitágoras, semelhança e Tales ---------- */
function rightTriangleSVG(a, b, cL, labels){
  const W = 320, H = 200, k = Math.min(220/b, 140/a), x0 = 60, y0 = 170, A = a*k, B = b*k;
  let s = `<polygon points="${x0},${y0} ${_f(x0+B)},${y0} ${x0},${_f(y0-A)}" class="geo-face front"/>`;
  s += `<path d="M${x0+14} ${y0} L${x0+14} ${y0-14} L${x0} ${y0-14}" fill="none" class="geo-face"/>`;
  const L = labels || [a, b, cL];
  s += cvT(x0-10, y0-A/2+5, L[0], '', 'end') + cvT(x0+B/2, y0+22, L[1]) + cvT(x0+B/2+14, y0-A/2-8, L[2], 'geo-lbl-h', 'start');
  return cvSVG(W, H, s, 'Triângulo retângulo');
}
/* sombra: uma pessoa e uma árvore com o sol inclinado → triângulos semelhantes */
function shadowSVG(p, sp, S, tL){
  const W = 320, H = 200, yb = 172, k = 18, x1 = 30, x2 = 150;
  const ph = p*k*1.3, ps = sp*k*1.3, th = 130, ts = th*sp/p;
  let s = cvL(10, yb, W-10, yb, 'geo-face');
  s += `<polygon points="${x1},${yb} ${x1},${_f(yb-ph)} ${_f(x1+ps)},${yb}" class="geo-face top"/>`;
  s += `<polygon points="${x2},${yb} ${x2},${_f(yb-th)} ${_f(x2+ts)},${yb}" class="geo-face front"/>`;
  s += cvL(x1, _f(yb-ph), x1+ps, yb, 'geo-height') + cvL(x2, yb-th, x2+ts, yb, 'geo-height');
  s += cvT(x1-6, yb-ph/2+5, `${fmt(p)}`, '', 'end') + cvT(x1+ps/2, yb+20, `${fmt(sp)}`);
  s += cvT(x2-6, yb-th/2+5, tL, 'geo-lbl-h', 'end') + cvT(x2+ts/2, yb+20, `${fmt(S)}`);
  s += `<circle cx="${W-30}" cy="30" r="14" fill="#FFB800"/>`;
  return cvSVG(W, H, s, 'Sombras e triângulos semelhantes');
}
/* três paralelas cortando duas transversais */
function talesSVG(a, b, c, xL){
  const W = 320, H = 200, ys = [36, 36+a*14, 36+(a+b)*14].map(y=> 36 + (y-36)*Math.min(1, 140/((a+b)*14)));
  let s = '';
  ys.forEach(y=> s += cvL(14, y, W-14, y, 'geo-hidden'));
  const tx = y=> [70 + (y-36)*0.15, 180 + (y-36)*0.75];
  s += cvL(tx(20)[0], 20, tx(190)[0], 190) + cvL(tx(20)[1], 20, tx(190)[1], 190);
  ys.forEach(y=>{ s += cvDot(tx(y)[0], y) + cvDot(tx(y)[1], y); });
  s += cvT(tx((ys[0]+ys[1])/2)[0]-12, (ys[0]+ys[1])/2+5, a, '', 'end') + cvT(tx((ys[1]+ys[2])/2)[0]-12, (ys[1]+ys[2])/2+5, b, '', 'end');
  s += cvT(tx((ys[0]+ys[1])/2)[1]+12, (ys[0]+ys[1])/2+5, c, '', 'start') + cvT(tx((ys[1]+ys[2])/2)[1]+12, (ys[1]+ys[2])/2+5, xL, 'geo-lbl-h', 'start');
  s += cvT(W-20, ys[0]-6, 'paralelas', '', 'end').replace('class="geo-lbl', 'font-size="11" opacity=".7" class="geo-lbl');
  return cvSVG(W, H, s, 'Teorema de Tales');
}

/* ---------- Contagem e lógica ---------- */
function comboHTML(items){
  return `<div class="cv-combo">${items.map(([ico,n,t])=>`<div><span>${ico.repeat(Math.min(n,4))}</span><b>${n}</b><small>${t}</small></div>`).join('<i>×</i>')}<i>=</i><div class="hit"><b>${items.reduce((p,x)=>p*x[1],1)}</b><small>combos</small></div></div>`;
}
/* pior caso das meias: as primeiras todas diferentes, a próxima repete */
function socksSVG(colors){
  const W = 320, H = 130, n = colors.length;
  let s = '';
  const sock = (x, c, q)=> q ? `<rect x="${x}" y="34" width="34" height="50" rx="10" class="geo-hidden"/>` + cvT(x+17, 66, '?', 'geo-lbl-h')
    : `<path d="M${x+6} 34 h20 v30 q0 18 -18 18 h-6 q-8 0 -8 -8 q0 -8 10 -10 z" fill="${c}" stroke="#6B8CFF" stroke-width="1.5"/>`;
  let x = 30;
  colors.forEach(c=>{ s += sock(x, c); x += 52; });
  s += cvT(x-14, 66, '→') + sock(x+4, null, true);
  s += cvT(W/2, 112, `pior caso: ${n} diferentes · a ${n+1}ª repete`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Pior caso das meias');
}
/* jogo dos palitos: tira os primeiros e deixa grupos de 4 */
function sticksSVG(n, take){
  const W = 320, H = 120, gap = 14, groupGap = 10;
  let s = '', x = (W - (n*gap + (1 + Math.ceil((n-take)/4))*groupGap))/2;
  for(let i=0;i<n;i++){
    const taken = i<take, inGroup = i>=take ? (i-take)%4 : 0;
    if(i===take || (i>take && inGroup===0)) x += groupGap;
    s += `<rect x="${x}" y="24" width="6" height="56" rx="3" fill="${taken?'#FF8A4C':'#6B8CFF'}" ${taken?'opacity=".9"':''}/>`;
    if(taken) s += cvL(x-4, 28, x+10, 76, 'geo-radius');
    x += gap;
  }
  s += cvT(W/2, 104, `tire ${take} → sobram ${n-take} (grupos de 4)`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Jogo dos palitos');
}

/* ---------- Inequações ---------- */
/* reta numérica com a solução pintada. kind: 'ge' (x ≥ a), 'gt', 'le', 'lt' ou 'between' (a < x < b) */
function numberLineSVG(kind, a, b){
  const W = 320, H = 92, y = 48, lo = (kind==='between' ? a : a) - 4, hi = (kind==='between' ? b : a) + 4, X = v=> 20 + (v-lo)*(W-40)/(hi-lo), id = 'cva'+(++_cvId);
  let s = cvArrowDefs(id) + `<line x1="12" y1="${y}" x2="${W-10}" y2="${y}" class="geo-face" marker-end="url(#${id})"/>`;
  for(let v=Math.ceil(lo); v<=hi; v++) s += cvL(X(v), y-5, X(v), y+5, 'geo-face') + cvT(X(v), y+24, nm(v)).replace('class="geo-lbl', 'font-size="12" class="geo-lbl');
  const seg = (x1, x2)=> `<line x1="${_f(x1)}" y1="${y}" x2="${_f(x2)}" y2="${y}" stroke="#FF8A4C" stroke-width="6" stroke-linecap="round" opacity=".85"/>`;
  const pt = (v, closed)=> `<circle cx="${_f(X(v))}" cy="${y}" r="7" ${closed ? 'fill="#FF8A4C"' : 'class="cv-open"'} stroke="#FF8A4C" stroke-width="3"/>`;
  if(kind==='ge' || kind==='gt') s += seg(X(a), W-16) + pt(a, kind==='ge');
  else if(kind==='le' || kind==='lt') s += seg(16, X(a)) + pt(a, kind==='le');
  else s += seg(X(a), X(b)) + pt(a, false) + pt(b, false);
  return cvSVG(W, H, s, 'Solução na reta numérica');
}
/* parábola com a parte negativa (entre as raízes) destacada */
function parabolaSignSVG(r1, r2){
  const W = 320, H = 190, lo = r1-2.5, hi = r2+2.5, X = v=> 20 + (v-lo)*(W-40)/(hi-lo), f = v=> (v-r1)*(v-r2);
  const fmin = f((r1+r2)/2), fmax = Math.max(f(lo), f(hi)), yAxis = 30 + (fmax/(fmax-fmin))*130, Y = v=> yAxis - v*130/(fmax-fmin);
  let pts = [], neg = [];
  for(let i=0;i<=60;i++){ const v = lo + (hi-lo)*i/60; pts.push(`${_f(X(v))},${_f(Y(f(v)))}`); if(v>=r1 && v<=r2) neg.push(`${_f(X(v))},${_f(Y(f(v)))}`); }
  let s = cvL(10, yAxis, W-10, yAxis, 'geo-face');
  s += `<polygon points="${_f(X(r1))},${_f(yAxis)} ${neg.join(' ')} ${_f(X(r2))},${_f(yAxis)}" fill="rgba(255,138,76,.3)"/>`;
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#6B8CFF" stroke-width="2.5"/>`;
  s += cvDot(X(r1), yAxis, 4.5) + cvDot(X(r2), yAxis, 4.5) + cvT(X(r1)-8, yAxis-8, nm(r1), '', 'end') + cvT(X(r2)+8, yAxis-8, nm(r2), '', 'start');
  s += cvT((X(r1)+X(r2))/2, Math.min(H-4, Y(fmin)+20), 'negativo', 'geo-lbl-h') + cvT(X(lo+0.6), Y(f(lo+0.6))+18, '+', '', 'middle') + cvT(X(hi-0.6), Y(f(hi-0.6))+18, '+', '', 'middle');
  return cvSVG(W, H, s, 'Sinal da parábola');
}

/* ---------- Polinômios ---------- */
/* "máquina": entra um número, sai o valor do polinômio */
function machineSVG(inp, name, out){
  const W = 320, H = 120, id = 'cva'+(++_cvId);
  let s = cvArrowDefs(id);
  s += `<rect x="110" y="26" width="100" height="62" rx="14" class="geo-face top"/>` + cvT(160, 63, name);
  s += `<line x1="40" y1="57" x2="104" y2="57" stroke="#FF8A4C" stroke-width="2.5" marker-end="url(#${id})"/>` + cvT(36, 62, inp, 'geo-lbl-h', 'end');
  s += `<line x1="216" y1="57" x2="278" y2="57" stroke="#FF8A4C" stroke-width="2.5" marker-end="url(#${id})"/>` + cvT(284, 62, out, 'geo-lbl-h', 'start');
  s += cvT(160, 110, 'troque o x pelo número que entra').replace('class="geo-lbl', 'font-size="11" opacity=".75" class="geo-lbl');
  return cvSVG(W, H, s, 'Valor numérico do polinômio');
}
/* coeficientes em fichas, destacando os que entram na conta */
function coefChipsHTML(terms, hiIdx, note){
  return `<div class="cv-chips">${terms.map((t,i)=>`<span class="${hiIdx.includes(i)?'hit':''}">${t}</span>`).join('')}<em>${note}</em></div>`;
}

/* ---------- Números complexos ---------- */
/* plano com eixo real (x) e imaginário (y); pts: [{a, b, label, hi}]; tri: desenha os catetos do último ponto */
function complexPlaneSVG(pts, o){
  o = o || {};
  const W = 320, H = 230, m = Math.max(6, ...pts.flatMap(p=>[Math.abs(p.a), Math.abs(p.b)])) + 1, k = Math.min(140/m, 95/m);
  const ox = W/2, oy = H/2, X = a=> ox + a*k, Y = b=> oy - b*k, id = 'cva'+(++_cvId);
  let s = `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6B8CFF"/></marker><marker id="${id}h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#FF8A4C"/></marker></defs>`;
  for(let v=-m+1; v<m; v++){ s += cvL(X(v), Y(-m+1), X(v), Y(m-1), 'geo-unit') + cvL(X(-m+1), Y(v), X(m-1), Y(v), 'geo-unit'); }
  s += cvL(X(-m+0.5), oy, X(m-0.3), oy, 'geo-face') + cvL(ox, Y(-m+0.5), ox, Y(m-0.3), 'geo-face');
  s += cvT(W-2, oy-6, 'real', '', 'end').replace('class="geo-lbl', 'font-size="11" class="geo-lbl') + cvT(ox+6, 12, 'imag.', '', 'start').replace('class="geo-lbl', 'font-size="11" class="geo-lbl');
  pts.forEach(p=>{
    s += `<line x1="${ox}" y1="${oy}" x2="${_f(X(p.a))}" y2="${_f(Y(p.b))}" stroke="${p.hi?'#FF8A4C':'#6B8CFF'}" stroke-width="2.5" marker-end="url(#${id}${p.hi?'h':''})"/>`;
    s += cvDot(X(p.a), Y(p.b)) + cvT(X(p.a) + (p.a>=0?8:-8), Y(p.b) + (p.b>=0?-8:18), p.label, p.hi?'geo-lbl-h':'', p.a>=0?'start':'end').replace('class="geo-lbl', 'font-size="12.5" class="geo-lbl');
  });
  if(o.tri){ const p = pts[pts.length-1];
    s += cvL(X(0), oy, X(p.a), oy, 'geo-height') + cvL(X(p.a), oy, X(p.a), Y(p.b), 'geo-height');
    s += cvT(X(p.a/2), oy+18, Math.abs(p.a)) + cvT(X(p.a)+8, Y(p.b/2)+5, Math.abs(p.b), '', 'start'); }
  return cvSVG(W, H, s, 'Plano dos números complexos');
}

/* ---------- Sistemas lineares ---------- */
/* equações em escada, resolvidas de baixo pra cima */
function stairEqHTML(lines, notes){
  return `<div class="cv-stair">${lines.map((l,i)=>`<div style="margin-left:${(lines.length-1-i)*0}px; padding-left:${i*18}px"><span>${l}</span>${notes&&notes[i]?`<em>${notes[i]}</em>`:''}</div>`).join('')}<small>↑ comece por baixo e vá subindo</small></div>`;
}
/* equações empilhadas e somadas, como uma conta armada */
function sumEqHTML(lines, total){
  return `<div class="cv-sum">${lines.map((l,i)=>`<div><i>${i===lines.length-1?'+':''}</i><span>${l}</span></div>`).join('')}<div class="tot"><i></i><span>${total}</span></div></div>`;
}

/* ---------- Cônicas ---------- */
function ellipseSVG(a, b, o){
  o = o || {};
  const W = 320, H = 210, k = Math.min(130/a, 80/b), cx = W/2, cy = H/2 - 6, A = a*k, B = b*k, c = Math.sqrt(Math.max(a*a-b*b,0))*k;
  let s = cvL(cx-A-14, cy, cx+A+14, cy, 'geo-hidden') + cvL(cx, cy-B-14, cx, cy+B+14, 'geo-hidden');
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${_f(A)}" ry="${_f(B)}" class="geo-face front"/>`;
  s += cvL(cx, cy, cx+A, cy, 'geo-radius') + cvT(cx+A/2+ (o.foci?18:0), cy-8, `a = ${a}`, 'geo-lbl-h');
  s += cvL(cx, cy, cx, cy-B, 'geo-height') + cvT(cx-8, cy-B/2+5, `b = ${b}`, '', 'end');
  if(o.foci){ s += cvDot(cx-c, cy, 5) + cvDot(cx+c, cy, 5) + cvT(cx-c, cy+22, 'F₁') + cvT(cx+c, cy+22, 'F₂');
    s += `<line x1="${_f(cx-c)}" y1="${cy+34}" x2="${_f(cx+c)}" y2="${cy+34}" stroke="#FF8A4C" stroke-width="2"/>` + cvT(cx, cy+52, `2c = ${2*Math.round(c/k)}`, 'geo-lbl-h'); }
  else s += cvT(cx, cy+B+34, `eixo maior = 2a = ${2*a}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Elipse');
}
function hyperbolaSVG(a, b){
  const W = 320, H = 210, c = Math.sqrt(a*a+b*b), k = 120/(c+2.5), cx = W/2, cy = H/2 - 6;
  let s = cvL(14, cy, W-14, cy, 'geo-hidden') + cvL(cx, 14, cx, H-30, 'geo-hidden');
  const ex = Math.min((c+2.5)*k, 88*a/b);
  s += cvL(cx-ex, cy+ex*b/a, cx+ex, cy-ex*b/a, 'geo-unit') + cvL(cx-ex, cy-ex*b/a, cx+ex, cy+ex*b/a, 'geo-unit');
  [1,-1].forEach(sg=>{ const pts = []; for(let t=-1.6;t<=1.6;t+=0.08){ const x = sg*a*Math.cosh(t), y = b*Math.sinh(t); if(Math.abs(y*k) < 90) pts.push(`${_f(cx+x*k)},${_f(cy-y*k)}`); }
    s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#6B8CFF" stroke-width="2.5"/>`; });
  s += cvDot(cx-c*k, cy, 5) + cvDot(cx+c*k, cy, 5) + cvT(cx-c*k, cy+22, 'F₁') + cvT(cx+c*k, cy+22, 'F₂');
  s += cvL(cx, cy, cx+a*k, cy, 'geo-radius') + cvT(cx+a*k/2, cy-8, `a = ${a}`, 'geo-lbl-h');
  s += `<line x1="${_f(cx)}" y1="${cy+36}" x2="${_f(cx+c*k)}" y2="${cy+36}" stroke="#FF8A4C" stroke-width="2"/>` + cvT(cx+c*k/2, cy+54, `c = ${Math.round(c)}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Hipérbole');
}

/* ---------- Probabilidade condicional ---------- */
/* faces do dado: o novo universo fica contornado, os favoráveis pintados */
function diceUniverseSVG(universe, fav){
  const W = 320, H = 120, u = 40, gap = 10, x0 = (W - (6*u + 5*gap))/2;
  let s = '';
  for(let v=1; v<=6; v++){
    const x = x0 + (v-1)*(u+gap), inU = universe.includes(v), f = fav.includes(v);
    s += `<rect x="${x}" y="24" width="${u}" height="${u}" rx="9" class="geo-face ${f?'':'side'}" style="${f?'fill:rgba(255,138,76,.35);':''}${inU?'stroke:#FF8A4C;stroke-width:3;':'opacity:.35;'}"/>`;
    s += cvT(x+u/2, 24+u/2+6, v);
  }
  s += cvT(W/2, 96, `universo: ${universe.length} casos · favoráveis: ${fav.length}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Dado com o novo universo');
}
/* barra dividida em partes (ex.: 25 homens e 15 mulheres entre 40 fãs) */
function splitBarHTML(parts, hi){
  const tot = parts.reduce((t,p)=>t+p[1],0);
  return `<div class="cv-bar">${parts.map(([t,n],i)=>`<div class="${i===hi?'hit':''}" style="flex:${n}"><b>${n}</b><small>${t}</small></div>`).join('')}</div><p class="cv-bar-cap">novo universo: os ${tot} · favoráveis: ${parts[hi][1]}</p>`;
}

/* ---------- Equações trigonométricas ---------- */
/* ciclo com a reta do valor: fn 'sen' (reta horizontal) ou 'cos' (reta vertical) e os dois ângulos */
function trigCircleSVG(fn, value, valueLabel, angles){
  const W = 320, H = 240, cx = 160, cy = 112, R = 86;
  let s = cvL(cx-R-18, cy, cx+R+18, cy, 'geo-hidden') + cvL(cx, cy-R-14, cx, cy+R+14, 'geo-hidden');
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" class="geo-face"/>`;
  if(fn==='sen') s += cvL(cx-R-10, cy-value*R, cx+R+10, cy-value*R, 'geo-height');
  else s += cvL(cx+value*R, cy-R-10, cx+value*R, cy+R+10, 'geo-height');
  s += cvT(cx, H-4, `${fn} x = ${valueLabel} (linha tracejada)`, 'geo-lbl-h').replace('class="geo-lbl', 'font-size="12.5" class="geo-lbl');
  angles.forEach(g=>{
    const a = g*Math.PI/180, x = cx+R*Math.cos(a), y = cy-R*Math.sin(a);
    s += cvL(cx, cy, x, y, 'geo-radius') + cvDot(x, y, 5);
    s += cvT(x + Math.cos(a)*24, y - Math.sin(a)*18 + 5, `${g}°`, 'geo-lbl-h');
  });
  s += cvT(cx+R+6, cy+16, '0°', '', 'start').replace('class="geo-lbl', 'font-size="11" class="geo-lbl') + cvT(cx-R-6, cy+16, '180°', '', 'end').replace('class="geo-lbl', 'font-size="11" class="geo-lbl');
  return cvSVG(W, H, s, 'Ciclo trigonométrico');
}

/* ---------- Parcelamento ---------- */
/* barras: à vista × a prazo, com os juros destacados */
function priceBarsSVG(cash, total, label){
  const W = 320, H = 150, k = 230/total, y1 = 30, y2 = 86;
  let s = `<rect x="70" y="${y1}" width="${_f(cash*k)}" height="34" rx="6" class="geo-face top"/>` + cvT(64, y1+22, 'à vista', '', 'end').replace('class="geo-lbl', 'font-size="12" class="geo-lbl') + cvT(70+cash*k/2, y1+22, `R$ ${cash}`);
  s += `<rect x="70" y="${y2}" width="${_f(cash*k)}" height="34" rx="6" class="geo-face top"/><rect x="${_f(70+cash*k)}" y="${y2}" width="${_f((total-cash)*k)}" height="34" rx="6" style="fill:rgba(255,138,76,.55)"/>`;
  s += cvT(64, y2+22, 'a prazo', '', 'end').replace('class="geo-lbl', 'font-size="12" class="geo-lbl') + cvT(70+cash*k/2, y2+22, label);
  s += cvT(70+cash*k+(total-cash)*k/2, y2+56, `juros: R$ ${total-cash}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'À vista e a prazo');
}
/* linha do tempo das parcelas: hoje e daqui a 1 mês */
function payTimelineSVG(cash, now, later){
  const W = 320, H = 150, y = 70, id = 'cva'+(++_cvId);
  let s = cvArrowDefs(id) + `<line x1="20" y1="${y}" x2="${W-16}" y2="${y}" class="geo-face" marker-end="url(#${id})"/>`;
  s += cvDot(70, y, 6) + cvDot(250, y, 6) + cvT(70, y+24, 'hoje') + cvT(250, y+24, '1 mês');
  s += cvT(70, y-14, `paga R$ ${now}`) + cvT(250, y-14, `paga R$ ${later}`, 'geo-lbl-h');
  s += `<path d="M78 ${y-34} Q 160 ${y-64} 242 ${y-34}" fill="none" stroke="#FF8A4C" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += cvT(160, y-54, `deve R$ ${cash-now}`).replace('class="geo-lbl', 'font-size="12" class="geo-lbl');
  s += cvT(W/2, H-12, `juros: ${later} − ${cash-now} = R$ ${later-(cash-now)}`, 'geo-lbl-h');
  return cvSVG(W, H, s, 'Linha do tempo das parcelas');
}
