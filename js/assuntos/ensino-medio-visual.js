/* =========================================================
   ENSINO MÉDIO — AJUDANTES E DESENHOS
   Números com sinal, matrizes, gráfico de colunas, gráficos de função,
   triângulos, ciclo trigonométrico, pirâmide, pizza, tabela dos dados etc.
   ========================================================= */
/* ---------------- ajudantes dos assuntos do Ensino Médio ---------------- */
// número com o sinal de menos "de verdade" (−) e vírgula decimal
function nm(n){ return fmt(n).replace('-', '−'); }
// número entre parênteses quando é negativo: 3 → 3 · −3 → (−3)
function np(n){ return n<0 ? `(${nm(n)})` : nm(n); }
function round2(v){ return Math.round(v*100)/100; }
// polinômio ax² + bx + c escrito do jeito que a gente escreve no caderno
function quadStr(a,b,c){
  const coef = (k, v)=> Math.abs(k)===1 ? v : `${Math.abs(k)}${v}`;
  let s = (a<0?'−':'') + coef(a,'x²');
  if(b) s += ` ${b>0?'+':'−'} ${coef(b,'x')}`;
  if(c) s += ` ${c>0?'+':'−'} ${Math.abs(c)}`;
  return s;
}
// matriz com colchetes: [[1,2],[3,4]]
// cls(i, j) opcional: classe de destaque de cada célula ('hl-a', 'hl-b', 'hl-soft', 'dim')
function matHTML(M, name, cls){
  const rows = M.map((r,i)=>`<tr>${r.map((v,j)=>{ const c = cls ? cls(i,j) : ''; return `<td${c?` class="${c}"`:''}>${nm(v)}</td>`; }).join('')}</tr>`).join('');
  return `<span class="mat-wrap">${name?`<span class="mat-name">${name} =</span>`:''}<span class="mat"><table>${rows}</table></span></span>`;
}
function matQ(text, mats){ return `<div class="geo-qtext">${text}</div><div class="mat-row">${mats.join('')}</div>`; }
const SUBD = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
function subN(n){ return String(n).split('').map(d=>SUBD[d]).join(''); }
const SUPD = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
function supN(n){ return String(n).split('').map(d=>SUPD[d]).join(''); }
function reais(v){ return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: Number.isInteger(v)?0:2, maximumFractionDigits:2}); }
// gráfico de colunas simples (as cores seguem o tema)
function barChartSVG(title, labels, values){
  const W = 300, H = 180, top = 26, base = 150, max = Math.max(...values) * 1.15;
  const bw = 34, gap = (W - 30 - labels.length*bw) / (labels.length+1);
  let bars = '';
  labels.forEach((l,i)=>{
    const x = 30 + gap + i*(bw+gap), hgt = (values[i]/max) * (base-top), y = base - hgt;
    bars += `<rect x="${x}" y="${y}" width="${bw}" height="${hgt}" rx="5" fill="var(--pine)" opacity=".85"/>
      <text x="${x+bw/2}" y="${y-5}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">${values[i]}</text>
      <text x="${x+bw/2}" y="${base+15}" text-anchor="middle" font-size="11" fill="var(--ink-soft)">${l}</text>`;
  });
  return `<svg class="bar-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
    <text x="${W/2}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${title}</text>
    <line x1="26" y1="${base}" x2="${W-4}" y2="${base}" stroke="var(--ink-soft)" stroke-width="1"/>${bars}</svg>`;
}
function fmtPct(v){ return nm(round2(v)) + '%'; }

/* ---------------- desenhos dos exemplos do Ensino Médio (mesmo estilo dos gráficos e figuras do app) ---------------- */
// gráfico de função: o = {f, xmin, xmax, ymin, ymax, color, label, pts:[{x,y,t,c}], segs:[[x1,y1,x2,y2]], grid}
function funcGraph(o){
  const W = 220, H = o.square ? Math.round((o.ymax-o.ymin)/(o.xmax-o.xmin)*(W-24)+24) : 170, sx = x=> 12 + (x-o.xmin)/(o.xmax-o.xmin)*(W-24), sy = y=> H-12 - (y-o.ymin)/(o.ymax-o.ymin)*(H-24);
  let s = '';
  if(o.grid){
    for(let x=Math.ceil(o.xmin); x<=o.xmax; x++) s += `<line x1="${sx(x)}" y1="${sy(o.ymin)}" x2="${sx(x)}" y2="${sy(o.ymax)}" class="fg-grid"/>`;
    for(let y=Math.ceil(o.ymin); y<=o.ymax; y++) s += `<line x1="${sx(o.xmin)}" y1="${sy(y)}" x2="${sx(o.xmax)}" y2="${sy(y)}" class="fg-grid"/>`;
  }
  if(o.ymin<=0 && o.ymax>=0) s += `<line x1="4" y1="${sy(0)}" x2="${W-4}" y2="${sy(0)}" class="lg-axis"/>`;
  if(o.xmin<=0 && o.xmax>=0) s += `<line x1="${sx(0)}" y1="${H-4}" x2="${sx(0)}" y2="4" class="lg-axis"/>`;
  if(o.f){
    let path = '', pen = false;
    for(let i=0;i<=160;i++){
      const x = o.xmin + (o.xmax-o.xmin)*i/160, y = o.f(x);
      if(!isFinite(y) || y<o.ymin-0.5 || y>o.ymax+0.5){ pen = false; continue; }
      path += `${pen?'L':'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)} `; pen = true;
    }
    s += `<path d="${path}" class="lg-line" style="stroke:${o.color||'var(--pine)'}"/>`;
  }
  (o.segs||[]).forEach(([x1,y1,x2,y2])=>{ s += `<line x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}" class="lg-line" style="stroke:${o.color||'var(--pine)'}"/>`; });
  (o.dash||[]).forEach(([x1,y1,x2,y2])=>{ s += `<line x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}" class="geo-height"/>`; });
  (o.pts||[]).forEach(p=>{
    s += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="4" class="lg-dot" style="fill:${p.c||'var(--coral)'}"/>`;
    if(p.t) s += `<text x="${sx(p.x)+(p.dx||6)}" y="${sy(p.y)+(p.dy||-8)}" class="lg-text" style="fill:${p.c||'var(--coral)'}" text-anchor="${p.anchor||'start'}">${p.t}</text>`;
  });
  return `<div class="lin-graph-wrap"><div class="lin-graph">${o.label?`<div class="lin-graph-label">${o.label}</div>`:''}<svg class="lin-graph-svg" viewBox="0 0 ${W} ${H}">${s}</svg></div></div>`;
}
// triângulo retângulo: ângulo θ embaixo à esquerda, ângulo reto embaixo à direita.
// o = {bw, bh (proporção), base, alt, hip (rótulos), ang (rótulo do ângulo), ask: 'base'|'alt'|'hip'}
function rightTriSVG(o){
  const W = 300, k = Math.min(200/o.bw, 130/o.bh), w = o.bw*k, h = o.bh*k, x0 = (W-w)/2 - 10, y0 = h + 16, H = y0 + 30;
  const A = [x0, y0], B = [x0+w, y0], C = [x0+w, y0-h];
  const lbl = (key, x, y, anchor)=> `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${o.ask===key?'geo-ask':'geo-lbl'}">${o[key]}</text>`;
  const ang = Math.atan2(h, w), r = 30;
  return `<svg class="geo-fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triângulo retângulo">
    <polygon points="${A} ${B} ${C}" class="geo-shape"/>
    <path d="M${B[0]-12} ${B[1]}v-12h12" class="geo-mark"/>
    ${o.ang?`<path d="M${A[0]+r} ${A[1]} A${r} ${r} 0 0 0 ${(A[0]+r*Math.cos(ang)).toFixed(1)} ${(A[1]-r*Math.sin(ang)).toFixed(1)}" class="geo-radius" fill="none"/>
    <text x="${A[0]+r+6}" y="${A[1]-8}" class="geo-lbl geo-lbl-h" font-size="13">${o.ang}</text>`:''}
    ${lbl('base', (A[0]+B[0])/2, y0+22, 'middle')}
    ${lbl('alt', B[0]+10, y0-h/2+5, 'start')}
    ${lbl('hip', (A[0]+C[0])/2-10, (A[1]+C[1])/2-6, 'end')}
  </svg>`;
}
// triângulo qualquer com o ângulo A entre os lados b e c (lei dos senos/cossenos)
function triAngleSVG(o){
  const W = 300, rad = o.A*Math.PI/180;
  const P = [[0,0],[o.c,0],[o.b*Math.cos(rad), o.b*Math.sin(rad)]];
  const xs = P.map(p=>p[0]), ys = P.map(p=>p[1]), minx = Math.min(...xs), maxx = Math.max(...xs), maxy = Math.max(...ys);
  const k = Math.min(220/(maxx-minx), 130/maxy), ox = (W-(maxx-minx)*k)/2 - minx*k, oy = maxy*k + 16;
  const q = P.map(([x,y])=>[+(ox+x*k).toFixed(1), +(oy-y*k).toFixed(1)]);
  const r = 26, mid = rad/2, H = oy + 32;
  const t = (x,y,txt,cls,anchor)=> `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor||'middle'}" class="${cls}">${txt}</text>`;
  return `<svg class="geo-fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triângulo">
    <polygon points="${q.map(p=>p.join(',')).join(' ')}" class="geo-shape"/>
    <path d="M${q[0][0]+r} ${q[0][1]} A${r} ${r} 0 0 0 ${(q[0][0]+r*Math.cos(rad)).toFixed(1)} ${(q[0][1]-r*Math.sin(rad)).toFixed(1)}" class="geo-radius" fill="none"/>
    ${t(q[0][0]+(r+16)*Math.cos(mid), q[0][1]-(r+10)*Math.sin(mid)+4, o.Alabel||`${o.A}°`, 'geo-lbl geo-lbl-h')}
    ${t((q[0][0]+q[1][0])/2, q[0][1]+22, o.cl, o.ask==='c'?'geo-ask':'geo-lbl')}
    ${t((q[0][0]+q[2][0])/2-10, (q[0][1]+q[2][1])/2, o.bl, o.ask==='b'?'geo-ask':'geo-lbl', 'end')}
    ${t((q[1][0]+q[2][0])/2+10, (q[1][1]+q[2][1])/2, o.al, o.ask==='a'?'geo-ask':'geo-lbl', 'start')}
  </svg>`;
}
// ciclo trigonométrico com um ângulo marcado (em graus)
function unitCircleSVG(deg, label){
  const W = 300, H = 200, cx = 150, cy = 100, R = 72, a = deg*Math.PI/180, px = cx+R*Math.cos(a), py = cy-R*Math.sin(a);
  const big = (deg%360) > 180 ? 1 : 0, r = 20;
  return `<svg class="geo-fig" style="max-width:320px" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ciclo trigonométrico">
    <line x1="${cx-R-18}" y1="${cy}" x2="${cx+R+18}" y2="${cy}" class="lg-axis"/><line x1="${cx}" y1="${cy+R+18}" x2="${cx}" y2="${cy-R-18}" class="lg-axis"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" class="geo-shape" style="fill:rgba(76,125,255,.08)"/>
    <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${cy}" class="geo-height"/>
    <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" class="geo-radius"/>
    <path d="M${cx+r} ${cy} A${r} ${r} 0 ${big} 0 ${(cx+r*Math.cos(a)).toFixed(1)} ${(cy-r*Math.sin(a)).toFixed(1)}" fill="none" stroke="var(--pine)" stroke-width="2.5"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" class="geo-dot"/>
    <text x="${(px+(Math.cos(a)>=0?8:-8)).toFixed(1)}" y="${(py+(Math.sin(a)>=0?-8:16)).toFixed(1)}" text-anchor="${Math.cos(a)>=0?'start':'end'}" class="geo-lbl" style="font-size:13px">${label||deg+'°'}</text>
    <text x="${cx+R+18}" y="${cy+16}" class="lg-text" fill="var(--ink-soft)" text-anchor="end">cos</text>
    <text x="${cx+6}" y="${cy-R-8}" class="lg-text" fill="var(--ink-soft)">sen</text>
  </svg>`;
}
// pirâmide de base quadrada em perspectiva
function pyramidSVG(l, h){
  const W = 320, H = 220, k = Math.min(170/l, 140/h), w = l*k, d = w*0.35, x0 = (W-w-d)/2, y0 = 185;
  const F1 = [x0, y0], F2 = [x0+w, y0], B2 = [x0+w+d, y0-d], B1 = [x0+d, y0-d], cx = x0+(w+d)/2, cy = y0-d/2, T = [cx, cy-h*k];
  return `<svg class="geo-fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pirâmide">
    <polyline points="${F1} ${B1} ${B2}" class="geo-hidden"/><line x1="${B1[0]}" y1="${B1[1]}" x2="${T[0]}" y2="${T[1]}" class="geo-hidden"/>
    <polygon points="${F1} ${F2} ${T}" class="geo-face front"/><polygon points="${F2} ${B2} ${T}" class="geo-face side"/>
    <line x1="${T[0]}" y1="${T[1]}" x2="${cx}" y2="${cy}" class="geo-height"/><circle cx="${cx}" cy="${cy}" r="2.5" class="geo-dot"/>
    <text x="${cx+7}" y="${(T[1]+cy)/2+5}" class="geo-lbl geo-lbl-h">h = ${h} cm</text>
    <text x="${x0+w/2}" y="${y0+20}" text-anchor="middle" class="geo-lbl">${l} cm</text>
  </svg>`;
}
// gráfico de setores com uma fatia destacada
function pieSVG(deg, label){
  const cx = 110, cy = 95, R = 72, a = deg*Math.PI/180, x = cx+R*Math.sin(a), y = cy-R*Math.cos(a);
  return `<svg class="geo-fig" style="max-width:240px" viewBox="0 0 220 190" role="img" aria-label="Gráfico de setores">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(76,125,255,.14)" stroke="#6B8CFF" stroke-width="2"/>
    <path d="M${cx} ${cy} L${cx} ${cy-R} A${R} ${R} 0 ${deg>180?1:0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="var(--pine)" opacity=".85" stroke="#6B8CFF" stroke-width="2"/>
    <text x="${(cx+R*0.5*Math.sin(a/2)).toFixed(1)}" y="${(cy-R*0.5*Math.cos(a/2)+5).toFixed(1)}" text-anchor="middle" class="geo-lbl" font-size="13">${label||deg+'°'}</text>
  </svg>`;
}
// tabela dos 36 resultados de dois dados, destacando os que somam "sum"
function diceGrid(sum){
  let rows = `<tr><th>+</th>${[1,2,3,4,5,6].map(j=>`<th>${j}</th>`).join('')}</tr>`;
  for(let i=1;i<=6;i++) rows += `<tr><th>${i}</th>${[1,2,3,4,5,6].map(j=>`<td class="${i+j===sum?'hit':''}">${i+j}</td>`).join('')}</tr>`;
  return `<table class="mini-table dice-grid">${rows}</table>`;
}
// sequência com o "passo" escrito em cada seta: 5 →(+3) 8 →(+3) 11
function seqRow(terms, steps){
  return `<div class="seq-row">${terms.map((t,i)=> `<span class="seq-t">${t}</span>` + (i<terms.length-1 ? `<span class="seq-a"><small>${Array.isArray(steps)?steps[i]:steps}</small>→</span>` : '')).join('')}</div>`;
}
// tabela pequena: head = ['x', 'x − média', ...], rows = [[...], ...]
function miniTable(head, rows, foot){
  return `<table class="mini-table"><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}${foot?`<tr class="foot">${foot.map(x=>`<td>${x}</td>`).join('')}</tr>`:''}</table>`;
}
// conjuntos numéricos um dentro do outro
function numberSetsSVG(){
  const box = (x,y,w,h,c,t,ex)=> `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>
    <text x="${x+10}" y="${y+20}" class="geo-lbl" style="fill:${c}">${t}</text>${ex?`<text x="${x+w-10}" y="${y+20}" text-anchor="end" class="lg-text" fill="var(--ink-soft)">${ex}</text>`:''}`;
  return `<svg class="geo-fig" viewBox="0 0 320 200" role="img" aria-label="Conjuntos numéricos">
    ${box(4,4,312,192,'#6B8CFF','ℝ reais','')}
    ${box(16,32,196,154,'#33D2E3','ℚ racionais','½  0,25')}
    ${box(28,62,160,114,'#B23FE0','ℤ inteiros','−2  −1')}
    ${box(40,92,120,74,'#FF8A4C','ℕ naturais','')}
    <text x="100" y="150" text-anchor="middle" class="lg-text" fill="var(--ink-soft)">0  1  2  3 …</text>
    ${box(222,32,84,154,'#FF5C7A','𝕀','')}
    <text x="264" y="95" text-anchor="middle" class="lg-text" fill="var(--ink-soft)">√2</text>
    <text x="264" y="120" text-anchor="middle" class="lg-text" fill="var(--ink-soft)">π</text>
    <text x="264" y="145" text-anchor="middle" class="lg-text" fill="var(--ink-soft)">√5</text>
  </svg>`;
}
