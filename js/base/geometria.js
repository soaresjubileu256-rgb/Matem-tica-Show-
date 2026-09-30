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
function geoSolid(kind, d){
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
    fv:d=>[`Volume = a × a × a`, `${d.a} × ${d.a} × ${d.a} = ${d.a**3} cm³`], fs:d=>[`Área total = 6 faces × a²`, `6 × ${d.a*d.a} = ${6*d.a*d.a} cm²`]},
  box:{name:'Paralelepípedo', dims:[['c','Comprimento',1,12,6],['l','Largura',1,10,3],['h','Altura',1,10,4]],
    vol:d=>d.c*d.l*d.h, surf:d=>2*(d.c*d.l+d.c*d.h+d.l*d.h),
    fv:d=>[`Volume = comprimento × largura × altura`, `${d.c} × ${d.l} × ${d.h} = ${d.c*d.l*d.h} cm³`],
    fs:d=>[`Área total = 2 × (c·l + c·h + l·h)`, `2 × (${d.c*d.l} + ${d.c*d.h} + ${d.l*d.h}) = ${2*(d.c*d.l+d.c*d.h+d.l*d.h)} cm²`]},
  cylinder:{name:'Cilindro', dims:[['r','Raio',1,6,2],['h','Altura',1,10,5]],
    vol:d=>3.14*d.r*d.r*d.h, surf:d=>2*3.14*d.r*d.r + 2*3.14*d.r*d.h,
    fv:d=>[`Volume = área da base × altura = π × r² × h`, `3,14 × ${d.r*d.r} × ${d.h} = ${geoNum(3.14*d.r*d.r*d.h)} cm³`],
    fs:d=>[`Área total = 2 bases + lateral = 2πr² + 2πr·h`, `${geoNum(6.28*d.r*d.r)} + ${geoNum(6.28*d.r*d.h)} = ${geoNum(6.28*d.r*d.r + 6.28*d.r*d.h)} cm²`]},
};
function geoSliders(dims, values, onChange){
  const box = h(`<div class="geo-sliders"></div>`);
  dims.forEach(([key,label,min,max])=>{
    const row = h(`<label class="geo-sl"><span class="geo-sl-l">${label}</span><input type="range" min="${min}" max="${max}" step="1" value="${values[key]}"><b></b></label>`);
    const inp = row.querySelector('input'), out = row.querySelector('b');
    const paint = ()=>{ out.textContent = `${values[key]} cm`; };
    inp.oninput = ()=>{ values[key] = Number(inp.value); paint(); onChange(); };
    paint();
    box.appendChild(row);
  });
  return box;
}
function geoFormulaBox(title, lines, ico){
  return `<div class="geo-res"><div class="geo-res-t">${ico} ${title}</div>${lines.map((l,i)=>`<div class="${i===lines.length-1?'geo-res-v':'geo-res-f'}">${l}</div>`).join('')}</div>`;
}
function geoLabScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🔺 Laboratório de Geometria', true, ()=>go(state.geoBack || 'content')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const tab = state.geoTab || 'area';
  const tabs = h(`<div class="diff-row geo-tabs"></div>`);
  [['area','📐 Áreas'],['solid','🧊 Sólidos'],['angle','📏 Ângulos']].forEach(([id,label])=>{
    const b = h(`<button type="button" class="diff-chip ${tab===id?'active':''}">${label}</button>`);
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
  const chips = h(`<div class="subj-chip-grid geo-shapes"></div>`);
  Object.entries(GEO_SHAPES).forEach(([k,sh])=>{
    const b = h(`<button type="button" class="subj-chip ${k===id?'active':''}" style="padding:7px 12px">${sh.name}</button>`);
    b.onclick = ()=>{ state.geoShape = k; render(); };
    chips.appendChild(b);
  });
  c.appendChild(chips);
  const fig = h(`<div class="geo-stage"></div>`);
  const res = h(`<div class="geo-results"></div>`);
  const why = h(`<div class="rp-tip" style="margin-top:12px"></div>`);
  function paint(){
    if(id==='trapezoid' && vals.b >= vals.B) vals.b = vals.B-1; // base menor precisa ser menor
    fig.innerHTML = geoFigure(id, vals, {grid:showGrid, showRect:S.rect});
    res.innerHTML = geoFormulaBox('Área', S.fa(vals), '🟦') + geoFormulaBox(id==='circle'?'Comprimento (perímetro)':'Perímetro', S.fp(vals), '📏');
  }
  c.appendChild(fig);
  const gridT = h(`<button type="button" class="weak-toggle ${showGrid?'active':''}" style="margin:10px 0"><span class="check">✓</span><span>Mostrar os quadradinhos de 1 cm²</span></button>`);
  gridT.onclick = ()=>{ showGrid = !showGrid; state.geoGrid = showGrid; gridT.classList.toggle('active', showGrid); paint(); };
  if(id!=='circle') c.appendChild(gridT);
  c.appendChild(geoSliders(S.dims, vals, ()=>{ paint(); syncSliders(); }));
  function syncSliders(){ if(id==='trapezoid'){ const inp = c.querySelectorAll('.geo-sl input')[1]; if(inp && Number(inp.value)!==vals.b){ inp.value = vals.b; inp.parentNode.querySelector('b').textContent = `${vals.b} cm`; } } }
  c.appendChild(res);
  why.textContent = '💡 ' + S.why;
  c.appendChild(why);
  paint();
}
function geoSolidTab(c){
  const id = state.geoSolid || 'cube';
  const S = GEO_SOLIDS[id];
  const key = 'solid_'+id;
  const vals = state.geoVals && state.geoVals[key] ? state.geoVals[key] : Object.fromEntries(S.dims.map(d=>[d[0], d[4]]));
  state.geoVals = Object.assign(state.geoVals||{}, {[key]:vals});
  const chips = h(`<div class="subj-chip-grid geo-shapes"></div>`);
  Object.entries(GEO_SOLIDS).forEach(([k,sh])=>{
    const b = h(`<button type="button" class="subj-chip ${k===id?'active':''}" style="padding:7px 12px">${sh.name}</button>`);
    b.onclick = ()=>{ state.geoSolid = k; render(); };
    chips.appendChild(b);
  });
  c.appendChild(chips);
  const fig = h(`<div class="geo-stage"></div>`), res = h(`<div class="geo-results"></div>`);
  function paint(){
    fig.innerHTML = geoSolid(id, vals);
    res.innerHTML = geoFormulaBox('Volume (quanto cabe dentro)', S.fv(vals), '🧊') + geoFormulaBox('Área total (quanto papel pra embrulhar)', S.fs(vals), '🎁');
  }
  c.appendChild(fig);
  c.appendChild(geoSliders(S.dims, vals, paint));
  c.appendChild(res);
  c.appendChild(h(`<div class="rp-tip" style="margin-top:12px">💡 Volume é quantos cubinhos de 1 cm³ cabem dentro. 1.000 cm³ = 1 litro!</div>`));
  paint();
}
/* triângulo com cantos arrastáveis: os ângulos mudam, a soma fica sempre 180° */
function geoAngleTab(c){
  const W = 320, H = 240;
  const P = state.geoTri || [[60,200],[270,200],[140,50]];
  state.geoTri = P;
  const stage = h(`<div class="geo-stage"><svg class="geo-fig geo-drag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triângulo com cantos que podem ser arrastados"></svg></div>`);
  const svg = stage.querySelector('svg');
  const info = h(`<div class="geo-results"></div>`);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:13.5px; margin:4px 0 10px">Arraste as bolinhas dos cantos. Os ângulos mudam, mas a soma é sempre <b>180°</b>.</p>`));
  c.appendChild(stage);
  c.appendChild(info);
  const COL = ['#FF5C7A','#33D2E3','#FFB800'];
  const angleAt = (i)=>{ const A = P[i], B = P[(i+1)%3], C = P[(i+2)%3];
    const v1 = [B[0]-A[0], B[1]-A[1]], v2 = [C[0]-A[0], C[1]-A[1]];
    return Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))))*180/Math.PI; };
  function paint(){
    const ang = [0,1,2].map(angleAt);
    const rounded = ang.map(a=>Math.round(a));
    const diff = 180 - rounded.reduce((a,b)=>a+b,0); // ajusta o arredondamento pra somar 180 na tela
    if(diff){ const i = ang.map((a,i)=>[a-Math.floor(a), i]).sort((x,y)=>diff>0? y[0]-x[0] : x[0]-y[0])[0][1]; rounded[i] += diff; }
    let s = `<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="geo-shape"/>`;
    P.forEach((A,i)=>{
      const B = P[(i+1)%3], C = P[(i+2)%3], r = 26;
      const a1 = Math.atan2(B[1]-A[1], B[0]-A[0]), a2 = Math.atan2(C[1]-A[1], C[0]-A[0]);
      let da = a2 - a1; while(da <= -Math.PI) da += 2*Math.PI; while(da > Math.PI) da -= 2*Math.PI;
      const x1 = A[0]+r*Math.cos(a1), y1 = A[1]+r*Math.sin(a1), x2 = A[0]+r*Math.cos(a2), y2 = A[1]+r*Math.sin(a2);
      s += `<path d="M${A[0]} ${A[1]} L${x1} ${y1} A${r} ${r} 0 0 ${da>0?1:0} ${x2} ${y2} Z" fill="${COL[i]}" fill-opacity=".35" stroke="${COL[i]}" stroke-width="2"/>`;
      const mid = a1 + da/2, lx = A[0]+(r+20)*Math.cos(mid), ly = A[1]+(r+20)*Math.sin(mid);
      s += `<text x="${lx}" y="${ly+5}" text-anchor="middle" class="geo-lbl" style="fill:${COL[i]}">${rounded[i]}°</text>`;
    });
    P.forEach((p,i)=>{ s += `<circle cx="${p[0]}" cy="${p[1]}" r="13" class="geo-handle" data-i="${i}" style="stroke:${COL[i]}"/>`; });
    svg.innerHTML = s;
    const sides = [0,1,2].map(i=>Math.hypot(P[(i+1)%3][0]-P[i][0], P[(i+1)%3][1]-P[i][1]));
    const eq = (a,b)=> Math.abs(a-b) < Math.max(a,b)*0.04;
    const bySides = eq(sides[0],sides[1]) && eq(sides[1],sides[2]) ? 'Equilátero (3 lados iguais)' : (eq(sides[0],sides[1])||eq(sides[1],sides[2])||eq(sides[0],sides[2])) ? 'Isósceles (2 lados iguais)' : 'Escaleno (3 lados diferentes)';
    const maxA = Math.max(...rounded);
    const byAng = maxA===90 ? 'Retângulo (tem um ângulo de 90°)' : maxA>90 ? 'Obtusângulo (tem um ângulo maior que 90°)' : 'Acutângulo (todos menores que 90°)';
    info.innerHTML = `<div class="geo-res"><div class="geo-res-t">📏 Soma dos ângulos</div><div class="geo-res-f"><span style="color:${COL[0]}">${rounded[0]}°</span> + <span style="color:${COL[1]}">${rounded[1]}°</span> + <span style="color:${COL[2]}">${rounded[2]}°</span></div><div class="geo-res-v">= 180°</div></div>
      <div class="geo-res"><div class="geo-res-t">🔎 Que triângulo é esse?</div><div class="geo-res-f">Pelos lados: <b>${bySides}</b></div><div class="geo-res-f">Pelos ângulos: <b>${byAng}</b></div></div>`;
  }
  let drag = -1;
  const toSvg = e=>{ const r = svg.getBoundingClientRect(); return [Math.max(12, Math.min(W-12, (e.clientX-r.left)*W/r.width)), Math.max(12, Math.min(H-12, (e.clientY-r.top)*H/r.height))]; };
  svg.addEventListener('pointerdown', e=>{
    const [x,y] = toSvg(e);
    let best = -1, bd = 30;
    P.forEach((p,i)=>{ const d = Math.hypot(p[0]-x, p[1]-y); if(d<bd){ bd = d; best = i; } });
    if(best<0) return;
    drag = best; svg.setPointerCapture(e.pointerId); e.preventDefault();
  });
  svg.addEventListener('pointermove', e=>{
    if(drag<0) return;
    const np = toSvg(e), others = P.filter((_,i)=>i!==drag);
    if(others.some(o=>Math.hypot(o[0]-np[0], o[1]-np[1]) < 24)) return; // não deixa dois cantos se encostarem
    P[drag] = np.map(v=>Math.round(v)); paint();
  });
  const end = ()=>{ drag = -1; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  const presets = h(`<div class="cta-row" style="margin-top:12px"></div>`);
  [['Equilátero',[[60,205],[260,205],[160,32]]],['Retângulo',[[70,200],[250,200],[70,60]]],['Obtusângulo',[[40,190],[280,190],[90,120]]]].forEach(([n,pts])=>{
    const b = h(`<button class="btn secondary" style="flex:1; padding:10px 6px; font-size:13px">${n}</button>`);
    b.onclick = ()=>{ pts.forEach((p,i)=>{ P[i] = p.slice(); }); paint(); };
    presets.appendChild(b);
  });
  c.appendChild(presets);
  paint();
}
