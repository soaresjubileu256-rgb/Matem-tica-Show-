/* =========================================================
   GEOMETRIA VISUAL
   - geoFigure(): desenha a figura (SVG) com as medidas escritas nela,
     usada nas questões, nos exemplos e no laboratório
   - Laboratório de Geometria: mexer nas medidas e ver área/perímetro
     mudando; sólidos 3D com volume; triângulo com ângulos arrastáveis
   ========================================================= */
const GEO_W = 320, GEO_H = 210, GEO_PAD = 34;
function geoNum(v){ return fmt(Math.round(v*100)/100); }
/* d: medidas · o: {unit, ask:'area'|'perim'|null, grid, hl:'perim'|'area', q:{b:'?'}} (q troca o rótulo por "?") */
function geoFigure(shape, d, o){
  o = o || {};
  const u = o.unit || 'cm';
  const lab = (k, v)=> (o.q && o.q[k]) ? o.q[k] : `${geoNum(v)} ${u}`;
  // escala pra caber no quadro, mantendo a proporção
  let wU, hU;
  if(shape==='circle'){ wU = hU = 2*d.r; }
  else if(shape==='square'){ wU = hU = d.l; }
  else if(shape==='trapezoid'){ wU = d.B; hU = d.h; }
  else if(shape==='parallelogram'){ wU = d.b + (d.s||0); hU = d.h; }
  else if(shape==='rhombus'){ wU = d.D; hU = d.d; }
  else { wU = d.b + (shape==='triangle' ? Math.max(0, (d.a||0)-d.b) + Math.max(0, -(d.a||0)) : 0); hU = d.h; }
  const k = Math.min((GEO_W-2*GEO_PAD)/wU, (GEO_H-2*GEO_PAD)/hU);
  const W = wU*k, H = hU*k, x0 = (GEO_W-W)/2, y0 = (GEO_H-H)/2;
  let body = '', grid = '';
  const cls = 'geo-shape' + (o.hl==='area' ? ' fill-hl' : '') + (o.hl==='perim' ? ' stroke-hl' : '');
  const txt = (x, y, t, anchor, extra)=> `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor||'middle'}" class="geo-lbl ${extra||''}">${t}</text>`;
  // quadradinhos de 1×1 (mostra de onde vem a área)
  if(o.grid && shape!=='circle' && wU<=24 && hU<=24){
    for(let i=0;i<=Math.round(wU);i++) grid += `<line x1="${(x0+i*k).toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(x0+i*k).toFixed(1)}" y2="${(y0+H).toFixed(1)}" class="geo-grid"/>`;
    for(let j=0;j<=Math.round(hU);j++) grid += `<line x1="${x0.toFixed(1)}" y1="${(y0+j*k).toFixed(1)}" x2="${(x0+W).toFixed(1)}" y2="${(y0+j*k).toFixed(1)}" class="geo-grid"/>`;
  }
  if(shape==='rect' || shape==='square'){
    const b = shape==='square' ? d.l : d.b, h = shape==='square' ? d.l : d.h;
    body += `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="${cls}"/>`;
    body += `<path d="M${x0} ${y0+H-10}h10v10" class="geo-mark"/>`;
    body += txt(x0+W/2, y0+H+20, lab('b', b));
    body += txt(x0+W+8, y0+H/2+5, lab(shape==='square'?'b':'h', h), 'start');
  } else if(shape==='triangle'){
    const a = d.a==null ? d.b*0.35 : d.a; // onde fica o topo (em relação ao canto esquerdo da base)
    const left = Math.min(0, a), bx = x0 - left*k;
    const A = [bx, y0+H], B = [bx+d.b*k, y0+H], C = [bx+a*k, y0];
    body += `<polygon points="${A} ${B} ${C}" class="${cls}"/>`;
    if(o.showRect) body += `<rect x="${bx}" y="${y0}" width="${d.b*k}" height="${H}" class="geo-ghost"/>`;
    body += `<line x1="${C[0]}" y1="${C[1]}" x2="${C[0]}" y2="${y0+H}" class="geo-height"/>`;
    if(a<0 || a>d.b) body += `<line x1="${a<0?C[0]:B[0]}" y1="${y0+H}" x2="${a<0?A[0]:C[0]}" y2="${y0+H}" class="geo-height"/>`;
    body += `<path d="M${C[0]} ${y0+H-9}h${a>d.b?-9:9}v9" class="geo-mark"/>`;
    body += txt((A[0]+B[0])/2, y0+H+20, lab('b', d.b));
    body += txt(C[0]+(a>d.b?-8:8), y0+H/2+5, `h = ${lab('h', d.h)}`, a>d.b?'end':'start', 'geo-lbl-h');
  } else if(shape==='trapezoid'){
    const off = (d.B-d.b)/2*k;
    const P = [[x0, y0+H], [x0+W, y0+H], [x0+W-off, y0], [x0+off, y0]];
    body += `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="${cls}"/>`;
    body += `<line x1="${x0+off}" y1="${y0}" x2="${x0+off}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+W/2, y0+H+20, lab('B', d.B));
    body += txt(x0+W/2, y0-9, lab('b', d.b));
    body += txt(x0+off+7, y0+H/2+5, `h = ${lab('h', d.h)}`, 'start', 'geo-lbl-h');
  } else if(shape==='parallelogram'){
    const s = (d.s||0)*k;
    const P = [[x0, y0+H], [x0+d.b*k, y0+H], [x0+d.b*k+s, y0], [x0+s, y0]];
    body += `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="${cls}"/>`;
    if(o.showRect) body += `<polygon points="${x0},${y0+H} ${x0+s},${y0+H} ${x0+s},${y0}" class="geo-ghost"/><polygon points="${x0+d.b*k},${y0+H} ${x0+d.b*k+s},${y0+H} ${x0+d.b*k+s},${y0}" class="geo-ghost"/>`;
    body += `<line x1="${x0+s}" y1="${y0}" x2="${x0+s}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+d.b*k/2, y0+H+20, lab('b', d.b));
    body += txt(x0+s+7, y0+H/2+5, `h = ${lab('h', d.h)}`, 'start', 'geo-lbl-h');
  } else if(shape==='rhombus'){
    const cx = x0+W/2, cy = y0+H/2;
    body += `<polygon points="${cx},${y0} ${x0+W},${cy} ${cx},${y0+H} ${x0},${cy}" class="${cls}"/>`;
    body += `<line x1="${x0}" y1="${cy}" x2="${x0+W}" y2="${cy}" class="geo-height"/><line x1="${cx}" y1="${y0}" x2="${cx}" y2="${y0+H}" class="geo-height"/>`;
    body += txt(x0+W*0.72, cy-7, `D = ${lab('D', d.D)}`, 'middle', 'geo-lbl-h');
    body += txt(cx+7, y0+H*0.25, `d = ${lab('d', d.d)}`, 'start', 'geo-lbl-h');
  } else if(shape==='circle'){
    const R = d.r*k, cx = GEO_W/2, cy = GEO_H/2;
    body += `<circle cx="${cx}" cy="${cy}" r="${R}" class="${cls}"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="3" class="geo-dot"/>`;
    body += `<line x1="${cx}" y1="${cy}" x2="${cx+R}" y2="${cy}" class="geo-radius"/>`;
    body += txt(cx+R/2, cy-8, `r = ${lab('r', d.r)}`, 'middle', 'geo-lbl-h');
  }
  const ask = o.ask==='area' ? 'Área = ?' : o.ask==='perim' ? 'Perímetro = ?' : '';
  return `<svg class="geo-fig" viewBox="0 0 ${GEO_W} ${GEO_H+(ask?16:0)}" role="img" aria-label="Figura geométrica">${grid}${body}${ask?txt(GEO_W/2, GEO_H+10, ask, 'middle', 'geo-ask'):''}</svg>`;
}
/* enunciado + figura juntos (quando a questão tem figura, o app mostra só o visual) */
function geoQ(text, svg){ return `<div class="geo-qtext">${text}</div>${svg}`; }

/* ---------- sólidos em perspectiva ---------- */
/* o.units: risca os cubinhos de 1 cm nas faces do cubo e do paralelepípedo (laboratório) */
function geoSolid(kind, d, o){
  o = o || {};
  const W = 320, H = 230;
  let s = '';
  const txt = (x, y, t, a)=> `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${a||'middle'}" class="geo-lbl">${t}</text>`;
  if(kind==='cube' || kind==='box'){
    const a = kind==='cube' ? d.a : d.c, b = kind==='cube' ? d.a : d.l, c = kind==='cube' ? d.a : d.h; // comprimento, largura, altura
    const depthK = 0.5; // perspectiva cavaleira: profundidade pela metade, a 45°
    const wU = a + b*depthK*0.71, hU = c + b*depthK*0.71;
    const k = Math.min((W-80)/wU, (H-60)/hU);
    const dx = b*depthK*0.71*k, dy = b*depthK*0.71*k;
    const x0 = (W-(a*k+dx))/2, y0 = (H-(c*k+dy))/2 + dy;
    const F = [[x0,y0],[x0+a*k,y0],[x0+a*k,y0+c*k],[x0,y0+c*k]];
    const T = F.map(([x,y])=>[x+dx,y-dy]);
    s += `<polygon points="${[F[0],F[1],T[1],T[0]].join(' ')}" class="geo-face top"/>`;
    s += `<polygon points="${[F[1],T[1],T[2],F[2]].join(' ')}" class="geo-face side"/>`;
    s += `<polygon points="${F.join(' ')}" class="geo-face front"/>`;
    if(o.units && a<=12 && b<=12 && c<=12){
      const ln = (x1,y1,x2,y2)=> `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="geo-unit"/>`;
      for(let i=1;i<a;i++){ s += ln(x0+i*k, y0, x0+i*k, y0+c*k) + ln(x0+i*k, y0, x0+i*k+dx, y0-dy); }
      for(let j=1;j<c;j++){ s += ln(x0, y0+j*k, x0+a*k, y0+j*k) + ln(x0+a*k, y0+j*k, x0+a*k+dx, y0+j*k-dy); }
      for(let j=1;j<b;j++){ const t = j/b; s += ln(x0+t*dx, y0-t*dy, x0+a*k+t*dx, y0-t*dy) + ln(x0+a*k+t*dx, y0-t*dy, x0+a*k+t*dx, y0+c*k-t*dy); }
    }
    s += `<polyline points="${[F[3],T[3],T[2]].join(' ')}" class="geo-hidden"/><line x1="${T[3][0]}" y1="${T[3][1]}" x2="${T[0][0]}" y2="${T[0][1]}" class="geo-hidden"/>`;
    s += txt(x0+a*k/2, y0+c*k+20, `${geoNum(a)} cm`);
    s += txt(x0-8, y0+c*k/2+5, `${geoNum(c)} cm`, 'end');
    s += txt(F[2][0]+dx/2+8, F[2][1]-dy/2+14, `${geoNum(b)} cm`, 'start');
  } else if(kind==='cylinder'){
    const k = Math.min((W-90)/(2*d.r), (H-70)/(d.h + d.r*0.6));
    const R = d.r*k, ry = R*0.3, Hh = d.h*k, cx = W/2, top = (H-Hh)/2;
    s += `<path d="M${cx-R} ${top} L${cx-R} ${top+Hh} A${R} ${ry} 0 0 0 ${cx+R} ${top+Hh} L${cx+R} ${top} Z" class="geo-face front"/>`;
    s += `<path d="M${cx-R} ${top+Hh} A${R} ${ry} 0 0 1 ${cx+R} ${top+Hh}" class="geo-hidden"/>`;
    s += `<ellipse cx="${cx}" cy="${top}" rx="${R}" ry="${ry}" class="geo-face top"/>`;
    s += `<line x1="${cx}" y1="${top}" x2="${cx+R}" y2="${top}" class="geo-radius"/><circle cx="${cx}" cy="${top}" r="2.5" class="geo-dot"/>`;
    s += txt(cx+R/2, top-6, `r = ${geoNum(d.r)} cm`);
    s += txt(cx+R+8, top+Hh/2+5, `h = ${geoNum(d.h)} cm`, 'start');
  } else if(kind==='cone'){
    const k = Math.min((W-90)/(2*d.r), (H-60)/(d.h + d.r*0.3));
    const R = d.r*k, ry = R*0.3, Hh = d.h*k, cx = W/2, top = (H-Hh-ry)/2, by = top+Hh;
    s += `<path d="M${cx-R} ${by} L${cx} ${top} L${cx+R} ${by} A${R} ${ry} 0 0 1 ${cx-R} ${by} Z" class="geo-face front"/>`;
    s += `<path d="M${cx-R} ${by} A${R} ${ry} 0 0 1 ${cx+R} ${by}" class="geo-hidden"/>`;
    s += `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${by}" class="geo-height"/>`;
    s += `<line x1="${cx}" y1="${by}" x2="${cx+R}" y2="${by}" class="geo-radius"/><circle cx="${cx}" cy="${by}" r="2.5" class="geo-dot"/>`;
    s += txt(cx+R/2, by+ry+18, `r = ${geoNum(d.r)} cm`);
    s += txt(cx+6, top+Hh*0.55, `h = ${geoNum(d.h)} cm`, 'start');
  } else if(kind==='sphere'){
    const R = Math.min(W-100, H-50)/2, cx = W/2, cy = H/2, ry = R*0.28;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" class="geo-face front"/>`;
    s += `<path d="M${cx-R} ${cy} A${R} ${ry} 0 0 1 ${cx+R} ${cy}" class="geo-hidden"/>`;
    s += `<path d="M${cx-R} ${cy} A${R} ${ry} 0 0 0 ${cx+R} ${cy}" fill="none" class="geo-face"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx+R}" y2="${cy}" class="geo-radius"/><circle cx="${cx}" cy="${cy}" r="3" class="geo-dot"/>`;
    s += txt(cx+R/2, cy-8, `r = ${geoNum(d.r)} cm`);
  }
  return `<svg class="geo-fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sólido geométrico">${s}</svg>`;
}

/* ---------- Laboratório de Geometria ---------- */
const GEO_SHAPES = {
  square:{name:'Quadrado', dims:[['l','Lado',1,12,5]],
    area:d=>d.l*d.l, perim:d=>4*d.l,
    fa:d=>[`Área = lado × lado`, `${d.l} × ${d.l} = ${d.l*d.l} cm²`], fp:d=>[`Perímetro = 4 × lado`, `4 × ${d.l} = ${4*d.l} cm`],
    why:'Cabem exatamente lado × lado quadradinhos de 1 cm² dentro dele. Conte!'},
  rect:{name:'Retângulo', dims:[['b','Base',1,14,7],['h','Altura',1,10,4]],
    area:d=>d.b*d.h, perim:d=>2*(d.b+d.h),
    fa:d=>[`Área = base × altura`, `${d.b} × ${d.h} = ${d.b*d.h} cm²`], fp:d=>[`Perímetro = 2 × (base + altura)`, `2 × (${d.b} + ${d.h}) = ${2*(d.b+d.h)} cm`],
    why:'São "altura" fileiras com "base" quadradinhos cada: base × altura quadradinhos.'},
  triangle:{name:'Triângulo', dims:[['b','Base',2,14,8],['h','Altura',1,10,5],['a','Posição do topo',-4,18,3]],
    area:d=>d.b*d.h/2, perim:d=>d.b + Math.hypot(d.a, d.h) + Math.hypot(d.b-d.a, d.h),
    fa:d=>[`Área = base × altura ÷ 2`, `${d.b} × ${d.h} ÷ 2 = ${geoNum(d.b*d.h/2)} cm²`],
    fp:d=>{ const l1 = Math.hypot(d.a,d.h), l2 = Math.hypot(d.b-d.a,d.h); return [`Perímetro = soma dos 3 lados`, `${d.b} + ${geoNum(l1)} + ${geoNum(l2)} ≈ ${geoNum(d.b+l1+l2)} cm`]; },
    why:'O triângulo é sempre metade do retângulo pontilhado (base × altura). Mexa no topo: a área não muda!', rect:true},
  parallelogram:{name:'Paralelogramo', dims:[['b','Base',2,12,7],['h','Altura',1,9,4],['s','Inclinação',0,6,2]],
    area:d=>d.b*d.h, perim:d=>2*(d.b+Math.hypot(d.s,d.h)),
    fa:d=>[`Área = base × altura`, `${d.b} × ${d.h} = ${d.b*d.h} cm²`], fp:d=>{ const l = Math.hypot(d.s,d.h); return [`Perímetro = 2 × (base + lado)`, `2 × (${d.b} + ${geoNum(l)}) ≈ ${geoNum(2*(d.b+l))} cm`]; },
    why:'Corte o triângulo pontilhado da esquerda e encaixe na direita: vira um retângulo de base × altura.', rect:true},
  trapezoid:{name:'Trapézio', dims:[['B','Base maior',3,14,10],['b','Base menor',1,13,5],['h','Altura',1,9,4]],
    area:d=>(d.B+d.b)*d.h/2, perim:d=>d.B+d.b+2*Math.hypot((d.B-d.b)/2, d.h),
    fa:d=>[`Área = (B + b) × h ÷ 2`, `(${d.B} + ${d.b}) × ${d.h} ÷ 2 = ${geoNum((d.B+d.b)*d.h/2)} cm²`],
    fp:d=>{ const l = Math.hypot((d.B-d.b)/2, d.h); return [`Perímetro = B + b + 2 lados`, `${d.B} + ${d.b} + 2 × ${geoNum(l)} ≈ ${geoNum(d.B+d.b+2*l)} cm`]; },
    why:'Dois trapézios iguais, um de cabeça pra baixo, formam um paralelogramo de base (B + b). Por isso divide por 2.'},
  rhombus:{name:'Losango', dims:[['D','Diagonal maior',2,14,10],['d','Diagonal menor',1,10,6]],
    area:d=>d.D*d.d/2, perim:d=>4*Math.hypot(d.D/2, d.d/2),
    fa:d=>[`Área = D × d ÷ 2`, `${d.D} × ${d.d} ÷ 2 = ${geoNum(d.D*d.d/2)} cm²`], fp:d=>{ const l = Math.hypot(d.D/2,d.d/2); return [`Perímetro = 4 × lado`, `4 × ${geoNum(l)} ≈ ${geoNum(4*l)} cm`]; },
    why:'O losango ocupa exatamente metade do retângulo formado pelas duas diagonais.'},
  circle:{name:'Círculo', dims:[['r','Raio',1,8,3]],
    area:d=>3.14*d.r*d.r, perim:d=>2*3.14*d.r,
    fa:d=>[`Área = π × r² (π ≈ 3,14)`, `3,14 × ${d.r} × ${d.r} = ${geoNum(3.14*d.r*d.r)} cm²`], fp:d=>[`Comprimento = 2 × π × r`, `2 × 3,14 × ${d.r} = ${geoNum(6.28*d.r)} cm`],
    why:'Dá a volta em qualquer círculo e divida pelo diâmetro: sempre dá ≈ 3,14. Esse número é o π.'},
};
const GEO_SOLIDS = {
  cube:{name:'Cubo', dims:[['a','Aresta',1,10,4]],
    vol:d=>d.a**3, surf:d=>6*d.a*d.a,
    fv:d=>[`Volume = a × a × a`, `${d.a} × ${d.a} × ${d.a} = ${d.a**3} cm³`], fs:d=>[`Área total = 6 faces × a²`, `6 × ${d.a*d.a} = ${6*d.a*d.a} cm²`],
    why:'Conte os cubinhos: uma camada tem a × a, e são a camadas empilhadas.'},
  box:{name:'Paralelepípedo', dims:[['c','Comprimento',1,12,6],['l','Largura',1,10,3],['h','Altura',1,10,4]],
    vol:d=>d.c*d.l*d.h, surf:d=>2*(d.c*d.l+d.c*d.h+d.l*d.h),
    fv:d=>[`Volume = comprimento × largura × altura`, `${d.c} × ${d.l} × ${d.h} = ${d.c*d.l*d.h} cm³`],
    fs:d=>[`Área total = 2 × (c·l + c·h + l·h)`, `2 × (${d.c*d.l} + ${d.c*d.h} + ${d.l*d.h}) = ${2*(d.c*d.l+d.c*d.h+d.l*d.h)} cm²`],
    why:'O fundo tem comprimento × largura cubinhos, e são "altura" camadas iguais a ele.'},
  cylinder:{name:'Cilindro', dims:[['r','Raio',1,6,2],['h','Altura',1,10,5]],
    vol:d=>3.14*d.r*d.r*d.h, surf:d=>2*3.14*d.r*d.r + 2*3.14*d.r*d.h,
    fv:d=>[`Volume = área da base × altura = π × r² × h`, `3,14 × ${d.r*d.r} × ${d.h} = ${geoNum(3.14*d.r*d.r*d.h)} cm³`],
    fs:d=>[`Área total = 2 bases + lateral = 2πr² + 2πr·h`, `${geoNum(6.28*d.r*d.r)} + ${geoNum(6.28*d.r*d.h)} = ${geoNum(6.28*d.r*d.r + 6.28*d.r*d.h)} cm²`],
    why:'O cilindro é uma pilha de círculos iguais: área do círculo da base × altura.'},
  cone:{name:'Cone', dims:[['r','Raio',1,6,3],['h','Altura',1,10,6]],
    vol:d=>3.14*d.r*d.r*d.h/3, surf:d=>3.14*d.r*d.r + 3.14*d.r*Math.hypot(d.r,d.h),
    fv:d=>[`Volume = π × r² × h ÷ 3`, `3,14 × ${d.r*d.r} × ${d.h} ÷ 3 = ${geoNum(3.14*d.r*d.r*d.h/3)} cm³`],
    fs:d=>{ const g = Math.hypot(d.r, d.h); return [`Área total = base + lateral = πr² + πr·g (g = geratriz ≈ ${geoNum(g)} cm)`, `${geoNum(3.14*d.r*d.r)} + ${geoNum(3.14*d.r*g)} ≈ ${geoNum(3.14*d.r*d.r + 3.14*d.r*g)} cm²`]; },
    why:'Um cone cabe 3 vezes dentro do cilindro de mesma base e mesma altura. Por isso divide por 3!'},
  sphere:{name:'Esfera', dims:[['r','Raio',1,8,3]],
    vol:d=>4*3.14*d.r**3/3, surf:d=>4*3.14*d.r*d.r,
    fv:d=>[`Volume = 4 × π × r³ ÷ 3`, `4 × 3,14 × ${d.r**3} ÷ 3 = ${geoNum(4*3.14*d.r**3/3)} cm³`],
    fs:d=>[`Área = 4 × π × r²`, `4 × 3,14 × ${d.r*d.r} = ${geoNum(4*3.14*d.r*d.r)} cm²`],
    why:'A casca da esfera tem exatamente a área de 4 círculos do mesmo raio.'},
};
/* desenhinhos dos botões de figura (mesmo traço pra todos) */
const GEO_ICONS = {
  square:'<rect x="10" y="4" width="24" height="24" rx="1"/>',
  rect:'<rect x="4" y="8" width="36" height="17" rx="1"/>',
  triangle:'<polygon points="5,27 39,27 17,5"/>',
  parallelogram:'<polygon points="3,26 30,26 41,6 14,6"/>',
  trapezoid:'<polygon points="3,26 41,26 32,6 12,6"/>',
  rhombus:'<polygon points="22,2 40,16 22,30 4,16"/>',
  circle:'<circle cx="22" cy="16" r="13"/>',
  cube:'<path d="M8 12h20v16H8z M8 12l7-7h20l-7 7 M28 28l7-7V5"/>',
  box:'<path d="M3 15h28v13H3z M3 15l8-8h30l-8 8 M31 28l8-8V7"/>',
  cylinder:'<ellipse cx="22" cy="7" rx="12" ry="4"/><path d="M10 7v18a12 4 0 0 0 24 0V7"/>',
  cone:'<path d="M10 25L22 3l12 22"/><ellipse cx="22" cy="25" rx="12" ry="4"/>',
  sphere:'<circle cx="22" cy="16" r="13"/><path d="M9 16a13 4 0 0 0 26 0" />',
};
function geoPicker(list, current, onPick){
  const row = h(`<div class="gl-pick" role="group" aria-label="Escolha a figura"></div>`);
  Object.entries(list).forEach(([k,sh])=>{
    const b = h(`<button type="button" class="gl-pick-b ${k===current?'active':''}" aria-pressed="${k===current}"><svg viewBox="0 0 44 32" aria-hidden="true">${GEO_ICONS[k]||''}</svg><span>${sh.name}</span></button>`);
    b.onclick = ()=>onPick(k);
    row.appendChild(b);
  });
  // deixa a figura escolhida à vista quando a lista rola de lado
  requestAnimationFrame(()=>{ const a = row.querySelector('.active'); if(a) row.scrollLeft = a.offsetLeft - row.clientWidth/2 + a.offsetWidth/2; });
  return row;
}
/* controles de medida: barra com preenchimento + botões − e + pra ajustar de 1 em 1 */
function geoSliders(dims, values, onChange){
  const box = h(`<div class="gl-sliders"></div>`);
  const rows = [];
  dims.forEach(([key,label,min,max])=>{
    const row = h(`<div class="gl-sl">
      <div class="gl-sl-top"><span>${label}</span><b></b></div>
      <div class="gl-sl-row"><button type="button" class="gl-step" aria-label="Diminuir ${label}">−</button><input type="range" min="${min}" max="${max}" step="1" aria-label="${label}"><button type="button" class="gl-step" aria-label="Aumentar ${label}">+</button></div>
    </div>`);
    const inp = row.querySelector('input'), out = row.querySelector('b'), [minus, plus] = row.querySelectorAll('.gl-step');
    const paint = ()=>{
      inp.value = values[key];
      out.textContent = `${values[key]} cm`;
      inp.style.setProperty('--p', `${(values[key]-min)/(max-min)*100}%`);
      minus.disabled = values[key] <= min; plus.disabled = values[key] >= max;
    };
    const set = v=>{ values[key] = Math.max(min, Math.min(max, v)); onChange(); rows.forEach(r=>r()); };
    inp.oninput = ()=> set(Number(inp.value));
    minus.onclick = ()=> set(values[key]-1);
    plus.onclick = ()=> set(values[key]+1);
    rows.push(paint);
    box.appendChild(row);
  });
  rows.forEach(r=>r());
  return box;
}
/* cartão de resultado: título + valor grandão, fórmula e a conta.
   O valor sai do fim da conta (depois do último "=" ou "≈"). */
function geoFormulaBox(title, lines, ico, kind, active){
  const last = lines[lines.length-1];
  const m = last.match(/([=≈])\s*([^=≈]+)$/);
  const val = m ? (m[1]==='≈' ? '≈ ' : '') + m[2].trim() : '';
  const tag = kind ? 'button type="button"' : 'div';
  return `<${tag} class="gl-res ${kind?'gl-res-'+kind:''} ${active?'active':''}" ${kind?`data-hl="${kind}" aria-pressed="${!!active}"`:''}>
    <div class="gl-res-top"><span class="gl-res-ico" aria-hidden="true">${ico}</span><span class="gl-res-t">${title}</span><b class="gl-res-v">${val}</b></div>
    ${lines.slice(0,-1).map(l=>`<div class="gl-res-f">${l}</div>`).join('')}
    <div class="gl-res-c">${last}</div>
  </${tag.split(' ')[0]}>`;
}
function geoTip(text){ return h(`<div class="gl-tip"><span aria-hidden="true">💡</span><p>${text}</p></div>`); }
function geoLabScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🔺 Laboratório de Geometria', true, ()=>go(state.geoBack || 'content')));
  const c = h(`<div class="content gl"></div>`);
  wrap.appendChild(c);
  const tab = state.geoTab || 'area';
  const tabs = h(`<div class="gl-tabs" role="tablist"></div>`);
  [['area','📐','Áreas'],['solid','🧊','Sólidos'],['angle','📏','Ângulos']].forEach(([id,ico,label])=>{
    const b = h(`<button type="button" role="tab" aria-selected="${tab===id}" class="gl-tab ${tab===id?'active':''}"><span aria-hidden="true">${ico}</span>${label}</button>`);
    b.onclick = ()=>{ state.geoTab = id; render(); };
    tabs.appendChild(b);
  });
  c.appendChild(tabs);
  if(tab==='area') geoAreaTab(c);
  else if(tab==='solid') geoSolidTab(c);
  else geoAngleTab(c);
  return wrap;
}
function geoAreaTab(c){
  const id = state.geoShape || 'rect';
  const S = GEO_SHAPES[id];
  const vals = state.geoVals && state.geoVals[id] ? state.geoVals[id] : Object.fromEntries(S.dims.map(d=>[d[0], d[4]]));
  state.geoVals = Object.assign(state.geoVals||{}, {[id]:vals});
  let showGrid = state.geoGrid !== false;
  let hl = state.geoHl || 'area';
  c.appendChild(geoPicker(GEO_SHAPES, id, k=>{ state.geoShape = k; render(); }));
  const stage = h(`<div class="gl-stage">
    <div class="gl-stage-head"><b>${S.name}</b>${id!=='circle' ? `<button type="button" class="gl-switch ${showGrid?'on':''}" aria-pressed="${showGrid}"><i></i>Quadradinhos de 1 cm²</button>` : ''}</div>
    <div class="gl-fig"></div><div class="gl-count"></div>
  </div>`);
  const fig = stage.querySelector('.gl-fig'), count = stage.querySelector('.gl-count');
  const res = h(`<div class="gl-results"></div>`);
  const sw = stage.querySelector('.gl-switch');
  if(sw) sw.onclick = ()=>{ showGrid = !showGrid; state.geoGrid = showGrid; sw.classList.toggle('on', showGrid); sw.setAttribute('aria-pressed', showGrid); paint(); };
  res.onclick = e=>{ const b = e.target.closest('[data-hl]'); if(!b) return; hl = b.dataset.hl; state.geoHl = hl; paint(); };
  function paint(){
    if(id==='trapezoid' && vals.b >= vals.B) vals.b = vals.B-1; // base menor precisa ser menor
    fig.innerHTML = geoFigure(id, vals, {grid:showGrid, showRect:S.rect, hl});
    const n = (id==='rect'||id==='square') && showGrid ? S.area(vals) : 0;
    count.textContent = n ? `Conte: ${n} quadradinhos = ${n} cm²` : '';
    count.hidden = !n;
    res.innerHTML = geoFormulaBox('Área', S.fa(vals), '🟦', 'area', hl==='area') + geoFormulaBox(id==='circle'?'Comprimento':'Perímetro', S.fp(vals), '📏', 'perim', hl==='perim');
  }
  c.appendChild(stage);
  c.appendChild(geoSliders(S.dims, vals, paint));
  c.appendChild(h(`<p class="gl-hint">Toque em um resultado para destacar na figura.</p>`));
  c.appendChild(res);
  c.appendChild(geoTip(S.why));
  paint();
}
function geoSolidTab(c){
  const id = GEO_SOLIDS[state.geoSolid] ? state.geoSolid : 'cube';
  const S = GEO_SOLIDS[id];
  const key = 'solid_'+id;
  const vals = state.geoVals && state.geoVals[key] ? state.geoVals[key] : Object.fromEntries(S.dims.map(d=>[d[0], d[4]]));
  state.geoVals = Object.assign(state.geoVals||{}, {[key]:vals});
  const units = id==='cube' || id==='box';
  let showUnits = state.geoUnits !== false;
  c.appendChild(geoPicker(GEO_SOLIDS, id, k=>{ state.geoSolid = k; render(); }));
  const stage = h(`<div class="gl-stage">
    <div class="gl-stage-head"><b>${S.name}</b>${units ? `<button type="button" class="gl-switch ${showUnits?'on':''}" aria-pressed="${showUnits}"><i></i>Cubinhos de 1 cm³</button>` : ''}</div>
    <div class="gl-fig"></div>
  </div>`);
  const fig = stage.querySelector('.gl-fig'), res = h(`<div class="gl-results"></div>`);
  const sw = stage.querySelector('.gl-switch');
  if(sw) sw.onclick = ()=>{ showUnits = !showUnits; state.geoUnits = showUnits; sw.classList.toggle('on', showUnits); sw.setAttribute('aria-pressed', showUnits); paint(); };
  function paint(){
    fig.innerHTML = geoSolid(id, vals, {units:showUnits});
    res.innerHTML = geoFormulaBox('Volume · quanto cabe dentro', S.fv(vals), '🧊') + geoFormulaBox(id==='sphere' ? 'Área · a casca da bola' : 'Área total · papel pra embrulhar', S.fs(vals), '🎁');
  }
  c.appendChild(stage);
  c.appendChild(geoSliders(S.dims, vals, paint));
  c.appendChild(res);
  c.appendChild(geoTip(S.why + ' E lembre: 1.000 cm³ = 1 litro.'));
  paint();
}
/* triângulo com cantos arrastáveis: os ângulos mudam, a soma fica sempre 180° */
function geoAngleTab(c){
  const W = 320, H = 240;
  const P = state.geoTri || [[60,200],[270,200],[140,50]];
  state.geoTri = P;
  const stage = h(`<div class="gl-stage">
    <div class="gl-stage-head"><b>Arraste as bolinhas dos cantos</b></div>
    <svg class="geo-fig geo-drag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triângulo com cantos que podem ser arrastados"></svg>
  </div>`);
  const svg = stage.querySelector('svg');
  const proof = h(`<div class="gl-stage gl-proof"><div class="gl-stage-head"><b>Junte os 3 ângulos</b></div><svg class="geo-fig" viewBox="0 0 320 132" role="img" aria-label="Os três ângulos juntos formam meia-volta"></svg><p class="gl-proof-t">Colados lado a lado, eles sempre formam meia-volta: uma linha reta, que mede <b>180°</b>.</p></div>`);
  const psvg = proof.querySelector('svg');
  const info = h(`<div class="gl-results"></div>`);
  c.appendChild(stage);
  const presets = h(`<div class="gl-presets"></div>`);
  c.appendChild(presets);
  c.appendChild(info);
  c.appendChild(proof);
  const COL = ['#FF5C7A','#33D2E3','#FFB800'];
  const angleAt = (i)=>{ const A = P[i], B = P[(i+1)%3], C = P[(i+2)%3];
    const v1 = [B[0]-A[0], B[1]-A[1]], v2 = [C[0]-A[0], C[1]-A[1]];
    return Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))))*180/Math.PI; };
  function paint(){
    const ang = [0,1,2].map(angleAt);
    const rounded = ang.map(a=>Math.round(a));
    const diff = 180 - rounded.reduce((a,b)=>a+b,0); // ajusta o arredondamento pra somar 180 na tela
    if(diff){ const i = ang.map((a,i)=>[a-Math.floor(a), i]).sort((x,y)=>diff>0? y[0]-x[0] : x[0]-y[0])[0][1]; rounded[i] += diff; }
    let s = `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="geo-shape gl-tri"/>`;
    P.forEach((A,i)=>{
      const B = P[(i+1)%3], C = P[(i+2)%3], r = 26;
      const a1 = Math.atan2(B[1]-A[1], B[0]-A[0]), a2 = Math.atan2(C[1]-A[1], C[0]-A[0]);
      let da = a2 - a1; while(da <= -Math.PI) da += 2*Math.PI; while(da > Math.PI) da -= 2*Math.PI;
      const x1 = A[0]+r*Math.cos(a1), y1 = A[1]+r*Math.sin(a1), x2 = A[0]+r*Math.cos(a2), y2 = A[1]+r*Math.sin(a2);
      s += `<path d="M${A[0]} ${A[1]} L${x1} ${y1} A${r} ${r} 0 0 ${da>0?1:0} ${x2} ${y2} Z" fill="${COL[i]}" fill-opacity=".35" stroke="${COL[i]}" stroke-width="2"/>`;
      if(rounded[i]===90) s += `<path d="M${A[0]+12*Math.cos(a1)} ${A[1]+12*Math.sin(a1)} l${12*Math.cos(a2)} ${12*Math.sin(a2)} l${-12*Math.cos(a1)} ${-12*Math.sin(a1)}" fill="none" stroke="${COL[i]}" stroke-width="2"/>`;
      const mid = a1 + da/2, lx = A[0]+(r+20)*Math.cos(mid), ly = A[1]+(r+20)*Math.sin(mid);
      s += `<text x="${lx}" y="${ly+5}" text-anchor="middle" class="geo-lbl" style="fill:${COL[i]}">${rounded[i]}°</text>`;
    });
    P.forEach((p,i)=>{ s += `<circle cx="${p[0]}" cy="${p[1]}" r="13" class="geo-handle" data-i="${i}" style="stroke:${COL[i]}"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${COL[i]}" pointer-events="none"/>`; });
    svg.innerHTML = s;
    // prova: as três fatias coladas em volta do mesmo ponto, sobre uma reta
    const cx = 160, cy = 112, R = 92;
    let ps = `<line x1="${cx-R-18}" y1="${cy}" x2="${cx+R+18}" y2="${cy}" class="gl-proof-line"/>`, t0 = Math.PI;
    rounded.forEach((g,i)=>{
      const t1 = t0 + g*Math.PI/180, tm = (t0+t1)/2;
      ps += `<path d="M${cx} ${cy} L${(cx+R*Math.cos(t0)).toFixed(1)} ${(cy+R*Math.sin(t0)).toFixed(1)} A${R} ${R} 0 0 1 ${(cx+R*Math.cos(t1)).toFixed(1)} ${(cy+R*Math.sin(t1)).toFixed(1)} Z" fill="${COL[i]}" fill-opacity=".3" stroke="${COL[i]}" stroke-width="2"/>`;
      if(g>=14) ps += `<text x="${(cx+R*0.64*Math.cos(tm)).toFixed(1)}" y="${(cy+R*0.64*Math.sin(tm)+5).toFixed(1)}" text-anchor="middle" class="geo-lbl" style="fill:${COL[i]}">${g}°</text>`;
      t0 = t1;
    });
    ps += `<circle cx="${cx}" cy="${cy}" r="3.5" class="geo-dot"/><text x="${cx}" y="${cy+18}" text-anchor="middle" class="geo-lbl gl-proof-sum">180°</text>`;
    psvg.innerHTML = ps;
    const sides = [0,1,2].map(i=>Math.hypot(P[(i+1)%3][0]-P[i][0], P[(i+1)%3][1]-P[i][1]));
    const eq = (a,b)=> Math.abs(a-b) < Math.max(a,b)*0.04;
    const bySides = eq(sides[0],sides[1]) && eq(sides[1],sides[2]) ? 'Equilátero (3 lados iguais)' : (eq(sides[0],sides[1])||eq(sides[1],sides[2])||eq(sides[0],sides[2])) ? 'Isósceles (2 lados iguais)' : 'Escaleno (3 lados diferentes)';
    const maxA = Math.max(...rounded);
    const byAng = maxA===90 ? 'Retângulo (tem um ângulo de 90°)' : maxA>90 ? 'Obtusângulo (tem um ângulo maior que 90°)' : 'Acutângulo (todos menores que 90°)';
    info.innerHTML = `<div class="gl-res"><div class="gl-res-top"><span class="gl-res-ico" aria-hidden="true">📏</span><span class="gl-res-t">Soma dos ângulos</span><b class="gl-res-v">180°</b></div><div class="gl-res-c gl-sum"><span style="color:${COL[0]}">${rounded[0]}°</span> + <span style="color:${COL[1]}">${rounded[1]}°</span> + <span style="color:${COL[2]}">${rounded[2]}°</span> = 180°</div></div>
      <div class="gl-res"><div class="gl-res-top"><span class="gl-res-ico" aria-hidden="true">🔎</span><span class="gl-res-t">Que triângulo é esse?</span></div><div class="gl-kind"><span>Pelos lados</span><b>${bySides}</b></div><div class="gl-kind"><span>Pelos ângulos</span><b>${byAng}</b></div></div>`;
  }
  let drag = -1;
  const toSvg = e=>{ const r = svg.getBoundingClientRect(); return [Math.max(12, Math.min(W-12, (e.clientX-r.left)*W/r.width)), Math.max(12, Math.min(H-12, (e.clientY-r.top)*H/r.height))]; };
  svg.addEventListener('pointerdown', e=>{
    const [x,y] = toSvg(e);
    let best = -1, bd = 30;
    P.forEach((p,i)=>{ const d = Math.hypot(p[0]-x, p[1]-y); if(d<bd){ bd = d; best = i; } });
    if(best<0) return;
    drag = best; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); e.preventDefault();
  });
  svg.addEventListener('pointermove', e=>{
    if(drag<0) return;
    const np = toSvg(e), others = P.filter((_,i)=>i!==drag);
    if(others.some(o=>Math.hypot(o[0]-np[0], o[1]-np[1]) < 24)) return; // não deixa dois cantos se encostarem
    P[drag] = np.map(v=>Math.round(v)); paint();
  });
  const end = ()=>{ drag = -1; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  [['Equilátero',[[60,205],[260,205],[160,32]]],['Isósceles',[[90,205],[230,205],[160,40]]],['Retângulo',[[70,200],[250,200],[70,60]]],['Obtusângulo',[[40,190],[280,190],[90,120]]]].forEach(([n,pts])=>{
    const b = h(`<button type="button" class="gl-preset">${n}</button>`);
    b.onclick = ()=>{ pts.forEach((p,i)=>{ P[i] = p.slice(); }); paint(); };
    presets.appendChild(b);
  });
  paint();
}
