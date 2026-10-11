/* =========================================================
   FIGURAS E GRÁFICOS DAS QUESTÕES INÉDITAS (SVG)
   Cada figura do banco (js/assuntos/provas-questoes.js) aparece no texto como
   <figure class="bq-figure" data-fig="ID"> e é desenhada aqui, em SVG.
   - As medidas e os dados são exatamente os do enunciado.
   - "escala": true quando o desenho respeita as proporções reais;
     senão a legenda avisa "fora de escala".
   - As cores vêm de classes .pf-* (style.css), que funcionam nos temas claro e escuro.
   Também preenche as contas armadas (.bq-conta) das resoluções.
   ========================================================= */
const PF = {
  n: v => (Math.round(v*10)/10).toFixed(1).replace(/\.0$/, ''),
  svg(w, h, body, label){ return `<svg class="pf-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>`; },
  t(x, y, s, cls, anchor){ return `<text x="${PF.n(x)}" y="${PF.n(y)}" class="pf-t ${cls||''}" text-anchor="${anchor||'middle'}">${s}</text>`; },
  line(x1, y1, x2, y2, cls){ return `<line x1="${PF.n(x1)}" y1="${PF.n(y1)}" x2="${PF.n(x2)}" y2="${PF.n(y2)}" class="${cls||'pf-stroke'}"/>`; },
  // cota (linha de medida) com traços nas pontas e o rótulo no meio, deslocado para o lado "off"
  dim(x1, y1, x2, y2, label, off, cls){
    const dx = x2-x1, dy = y2-y1, L = Math.hypot(dx, dy), nx = -dy/L, ny = dx/L, k = 5;
    let s = PF.line(x1, y1, x2, y2, 'pf-dim') + PF.line(x1+nx*k, y1+ny*k, x1-nx*k, y1-ny*k, 'pf-dim') + PF.line(x2+nx*k, y2+ny*k, x2-nx*k, y2-ny*k, 'pf-dim');
    const o = off || 14;
    // cota vertical: rótulo ao lado da linha (à esquerda se o < 0... conforme o lado pedido), sem cobrir a linha
    if(Math.abs(dx) < 0.5){ const side = Math.sign(nx*o) || 1; return s + PF.t(x1 + side*8, (y1+y2)/2 + 4.5, label, 'b ' + (cls||''), side < 0 ? 'end' : 'start'); }
    const mx = (x1+x2)/2 + nx*o, my = (y1+y2)/2 + ny*o + 4.5;
    return s + PF.t(mx, my, label, 'b ' + (cls||''));
  },
  // marca de ângulo reto no vértice (x,y), com os lados indo nas direções (ax,ay) e (bx,by) (vetores unitários)
  right(x, y, ax, ay, bx, by, k){ k = k || 10; return `<path d="M${PF.n(x+ax*k)} ${PF.n(y+ay*k)} L${PF.n(x+ax*k+bx*k)} ${PF.n(y+ay*k+by*k)} L${PF.n(x+bx*k)} ${PF.n(y+by*k)}" class="pf-mark"/>`; },
  // arco de ângulo com vértice (x,y), do ângulo a1 ao a2 (graus, sentido anti-horário, 0° = para a direita)
  arc(x, y, r, a1, a2, cls){
    const p = a=> [x + r*Math.cos(a*Math.PI/180), y - r*Math.sin(a*Math.PI/180)], [x1,y1] = p(a1), [x2,y2] = p(a2);
    return `<path d="M${PF.n(x1)} ${PF.n(y1)} A${r} ${r} 0 ${a2-a1>180?1:0} 0 ${PF.n(x2)} ${PF.n(y2)}" class="${cls||'pf-acc'}"/>`;
  },
};

const PROVA_FIGS = {
  /* ENEM 4 — caixa-d'água cilíndrica: r = 1 m, h = 1,5 m (proporção real 2 : 1,5) */
  'enem-cilindro': ()=>{
    const cx = 160, top = 44, rx = 90, ry = 20, H = 135, bot = top + H;
    let s = `<path d="M${cx-rx} ${top} V${bot} A${rx} ${ry} 0 0 0 ${cx+rx} ${bot} V${top}" class="pf-fill"/>`;
    s += `<path d="M${cx-rx} ${bot} A${rx} ${ry} 0 0 1 ${cx+rx} ${bot}" class="pf-stroke pf-dash pf-soft"/>`;
    s += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" class="pf-fill top"/>`;
    s += PF.line(cx, top, cx+rx, top, 'pf-acc') + `<circle cx="${cx}" cy="${top}" r="3" class="pf-dot"/>`;
    s += PF.t(cx+rx/2, top-6, 'r = 1 m', 'b acc');
    s += PF.dim(cx+rx+22, top, cx+rx+22, bot, '1,5 m', -26);
    return {svg: PF.svg(320, 215, s, 'Cilindro de raio 1 metro e altura 1,5 metro'), cap:'Caixa-d’água cilíndrica (medidas internas)', escala:true};
  },
  /* ETEC 1 — parede 6 m × 2,8 m com porta 0,8 m × 2,1 m (40 px por metro) */
  'etec-parede': ()=>{
    const k = 45, x0 = 24, y0 = 18, W = 6*k, Hh = 2.8*k, dx = x0 + 2.2*k, dw = 0.8*k, dh = 2.1*k, base = y0 + Hh;
    let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${Hh}" class="pf-fill"/>`;
    s += `<rect x="${dx}" y="${base-dh}" width="${dw}" height="${dh}" class="pf-fill2"/>`;
    s += `<circle cx="${dx+dw-7}" cy="${base-dh/2}" r="2.4" class="pf-dot2"/>` + PF.t(dx+dw/2, base-dh/2-14, 'porta', 's');
    s += PF.dim(x0, base+16, x0+W, base+16, '6 m', 15);
    s += PF.dim(x0+W+16, y0, x0+W+16, base, '2,8 m', -26);
    s += PF.dim(dx, base-dh-12, dx+dw, base-dh-12, '0,8 m', -11);
    s += PF.dim(dx-12, base-dh, dx-12, base, '2,1 m', 25);
    return {svg: PF.svg(372, 192, s, 'Parede de 6 por 2,8 metros com uma porta de 0,8 por 2,1 metros'), cap:'Parede a ser pintada (a porta não será pintada)', escala:true};
  },
  /* ETEC 2 — gráfico de colunas da chuva (mm) */
  'etec-chuva': ()=>{
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun'], v = [240, 210, 180, 90, 60, 30];
    const x0 = 50, x1 = 330, y0 = 200, y1 = 36, max = 250, sy = val=> y0 - val/max*(y0-y1);
    let s = '';
    for(let g=0; g<=max; g+=50){ s += PF.line(x0, sy(g), x1, sy(g), g ? 'pf-grid' : 'pf-axis') + PF.t(x0-8, sy(g)+4.5, g, 's', 'end'); }
    const slot = (x1-x0)/v.length, bw = slot*0.58;
    v.forEach((val,i)=>{
      const x = x0 + slot*i + (slot-bw)/2;
      s += `<rect x="${PF.n(x)}" y="${PF.n(sy(val))}" width="${PF.n(bw)}" height="${PF.n(y0-sy(val))}" rx="3" class="pf-bar"/>`;
      s += PF.t(x+bw/2, sy(val)-6, val, 'b') + PF.t(x+bw/2, y0+17, meses[i], 's');
    });
    s += PF.t(14, 118, 'Chuva (mm)', 's', 'middle').replace('<text', '<text transform="rotate(-90 14 118)"');
    s += PF.t((x0+x1)/2, 18, 'Chuva acumulada por mês — 1º semestre', 'b');
    s += PF.t((x0+x1)/2, 234, 'Mês', 's');
    return {svg: PF.svg(340, 242, s, 'Gráfico de colunas: janeiro 240, fevereiro 210, março 180, abril 90, maio 60, junho 30 milímetros'), cap:'Chuva acumulada em cada mês, em milímetros', escala:true};
  },
  /* ETEC 4 — escada de 5 m, pé a 1,4 m do muro (alcança 4,8 m) */
  'etec-escada': ()=>{
    const k = 30, gx = 96, gy = 186, top = gy - 4.8*k, foot = gx + 1.4*k;
    let s = `<rect x="${gx-14}" y="${top-14}" width="14" height="${gy-top+14}" class="pf-wall"/>` + PF.t(gx-7, top-20, 'muro', 's');
    s += PF.line(20, gy, 240, gy, 'pf-ground');
    s += PF.line(foot, gy, gx, top, 'pf-ladder');
    s += PF.right(gx, gy, 1, 0, 0, -1, 11);
    s += PF.t((foot+gx)/2 + 22, (gy+top)/2, '5 m', 'b acc', 'start');
    s += PF.dim(gx, gy+15, foot, gy+15, '1,4 m', 15);
    s += PF.dim(gx-30, top, gx-30, gy, 'h', 14);
    return {svg: PF.svg(250, 222, s, 'Escada de 5 metros apoiada no muro, com o pé a 1,4 metro do muro; altura h'), cap:'Escada apoiada no muro', escala:true};
  },
  /* ETEC 7 — terrenos quadrados de 103 m e 97 m de lado */
  'etec-terrenos': ()=>{
    const k = 1.35, a = 103*k, b = 97*k, by = 172, x1 = 24, x2 = x1 + a + 26;
    let s = `<rect x="${x1}" y="${PF.n(by-a)}" width="${PF.n(a)}" height="${PF.n(a)}" class="pf-fill"/>`;
    s += `<rect x="${PF.n(x2)}" y="${PF.n(by-b)}" width="${PF.n(b)}" height="${PF.n(b)}" class="pf-fill2"/>`;
    s += PF.dim(x1, by+14, x1+a, by+14, '103 m', 15) + PF.dim(x2, by+14, x2+b, by+14, '97 m', 15);
    return {svg: PF.svg(Math.ceil(x2+b+18), 208, s, 'Dois terrenos quadrados, de 103 metros e de 97 metros de lado'), cap:'Os dois terrenos quadrados', escala:true};
  },
  /* ETEC 8 — poste com sombra de 6 m; pessoa de 1,6 m com sombra de 1,2 m (mesma inclinação dos raios) */
  'etec-sombra': ()=>{
    const k = 18, gy = 186, px = 52, ptop = gy - 8*k, ps = px + 6*k, hx = 236, htop = gy - 1.6*k, hs = hx + 1.2*k;
    let s = PF.line(16, gy, 300, gy, 'pf-ground');
    s += `<rect x="${px}" y="${gy-2}" width="${6*k}" height="5" class="pf-shadow"/><rect x="${hx}" y="${gy-2}" width="${PF.n(1.2*k)}" height="5" class="pf-shadow"/>`;
    s += PF.line(px, gy, px, ptop, 'pf-pole');
    s += PF.line(px, ptop, ps, gy, 'pf-acc pf-dash') + PF.line(hx, htop, hs, gy, 'pf-acc pf-dash');
    // pessoa (altura total 1,6 m, até o alto da cabeça)
    const hr = 3.2;
    s += `<circle cx="${hx}" cy="${PF.n(htop+hr)}" r="${hr}" class="pf-person"/>` + PF.line(hx, htop+2*hr, hx, gy-9, 'pf-person-l') + PF.line(hx, gy-9, hx-3.5, gy, 'pf-person-l') + PF.line(hx, gy-9, hx+3.5, gy, 'pf-person-l') + PF.line(hx-5, htop+11, hx+5, htop+11, 'pf-person-l');
    s += `<circle cx="280" cy="30" r="11" class="pf-sun"/>` + PF.t(272, 56, 'raios de sol', 's');
    s += PF.dim(px-18, ptop, px-18, gy, '?', 12);
    s += PF.dim(px, gy+16, ps, gy+16, '6 m', 15) + PF.dim(hx, gy+16, hs, gy+16, '1,2 m', 15);
    s += PF.dim(hx-14, htop, hx-14, gy, '1,6 m', 24);
    return {svg: PF.svg(312, 222, s, 'Poste de altura desconhecida com sombra de 6 metros; pessoa de 1,6 metro com sombra de 1,2 metro'), cap:'Poste e pessoa no mesmo instante: os raios de sol são paralelos', escala:true};
  },
  /* FUVEST 2 — eixos em escala logarítmica, reta por A(100; 50) e B(10 000; 5) */
  'fuvest-loglog': ()=>{
    const x0 = 58, x1 = 318, y0 = 196, y1 = 26, L = Math.log10;
    const sx = v=> x0 + (L(v)-1)/4*(x1-x0), sy = v=> y0 - L(v)/2*(y0-y1);
    let s = '';
    for(let d=10; d<=100000; d*=10){ for(let m=2; m<=9 && d<100000; m++) s += PF.line(sx(d*m), y0, sx(d*m), y1, 'pf-grid-minor'); s += PF.line(sx(d), y0, sx(d), y1, 'pf-grid'); }
    for(let d=1; d<=100; d*=10){ for(let m=2; m<=9 && d<100; m++) s += PF.line(x0, sy(d*m), x1, sy(d*m), 'pf-grid-minor'); s += PF.line(x0, sy(d), x1, sy(d), 'pf-grid'); s += PF.t(x0-7, sy(d)+4.5, d, 's', 'end'); }
    ['10','100','1 000','10 000','100 000'].forEach((t,i)=>{ s += PF.t(x0 + i*(x1-x0)/4, y0+16, t, 's'); });
    s += PF.line(x0, y0, x1, y0, 'pf-axis') + PF.line(x0, y0, x0, y1, 'pf-axis');
    // reta: log y = log 50 − ½ (log x − 2), desenhada de y = 100 até x = 100 000
    const f = x=> 50*Math.pow(x/100, -0.5), xa = 25;
    s += `<line x1="${PF.n(sx(xa))}" y1="${PF.n(sy(f(xa)))}" x2="${PF.n(sx(100000))}" y2="${PF.n(sy(f(100000)))}" class="pf-curve"/>`;
    s += `<circle cx="${PF.n(sx(100))}" cy="${PF.n(sy(50))}" r="5" class="pf-pt"/>` + PF.t(sx(100)+9, sy(50)-8, 'A (100; 50)', 'b acc', 'start');
    s += `<circle cx="${PF.n(sx(10000))}" cy="${PF.n(sy(5))}" r="5" class="pf-pt"/>` + PF.t(sx(10000)-6, sy(5)-14, 'B (10 000; 5)', 'b acc', 'middle');
    s += PF.t((x0+x1)/2, y0+34, 'x (escala logarítmica)', 's');
    s += PF.t(16, (y0+y1)/2, 'y (escala log.)', 's').replace('<text', `<text transform="rotate(-90 16 ${(y0+y1)/2})"`);
    return {svg: PF.svg(350, 240, s, 'Gráfico com os dois eixos em escala logarítmica: reta passando por A, x 100 e y 50, e por B, x 10 000 e y 5'), cap:'Eixos em escala logarítmica de base 10: cada linha principal vale 10 vezes a anterior; as linhas finas marcam 2, 3, …, 9 vezes a potência de 10', escala:true};
  },
  /* UNICAMP 3 — torre de altura 10√3 m, observações a 30 m (30°) e a 10 m (60°) da base */
  'unicamp-torre': ()=>{
    const k = 8.4, gy = 180, bx = 300, h = 10*Math.sqrt(3)*k, ty = gy - h, p1 = bx - 30*k, p2 = bx - 10*k;
    let s = PF.line(20, gy, 326, gy, 'pf-ground');
    s += `<rect x="${bx}" y="${PF.n(ty)}" width="9" height="${PF.n(h)}" class="pf-tower"/>`;
    s += PF.line(p1, gy, bx, ty, 'pf-sight') + PF.line(p2, gy, bx, ty, 'pf-sight');
    s += PF.arc(p1, gy, 34, 0, 30) + PF.t(p1+40, gy-7, '30°', 'b acc', 'start');
    s += PF.arc(p2, gy, 24, 0, 60) + PF.t(p2+24, gy-22, '60°', 'b acc', 'start');
    s += `<circle cx="${PF.n(p1)}" cy="${gy}" r="4" class="pf-dot"/><circle cx="${PF.n(p2)}" cy="${gy}" r="4" class="pf-dot"/>`;
    s += PF.t(p1, gy+17, '1ª posição', 's') + PF.t(p2, gy+17, '2ª posição', 's');
    s += PF.dim(p1, gy+30, p2, gy+30, '20 m', 15);
    s += PF.right(bx, gy, -1, 0, 0, -1, 9);
    s += PF.dim(bx+24, ty, bx+24, gy, 'h', -12);
    s += PF.t(bx+4, ty-8, 'topo', 's');
    return {svg: PF.svg(342, 236, s, 'Torre vista sob 30 graus e, 20 metros mais perto, sob 60 graus'), cap:'Linhas de visada até o topo da torre (altura da pessoa desprezada)', escala:true};
  },
  /* UNICAMP 7 — taça cônica, vértice para baixo, líquido até a metade da altura */
  'unicamp-cone': ()=>{
    const cx = 140, top = 34, vy = 194, rx = 88, ry = 15, mid = (top+vy)/2;
    let s = `<path d="M${cx-rx} ${top} L${cx} ${vy} L${cx+rx} ${top}" class="pf-glass"/>`;
    s += `<path d="M${cx-rx/2} ${mid} L${cx} ${vy} L${cx+rx/2} ${mid} Z" class="pf-liquid"/><ellipse cx="${cx}" cy="${mid}" rx="${rx/2}" ry="${ry/2}" class="pf-liquid top"/>`;
    s += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" class="pf-glass-rim"/>`;
    s += PF.line(cx, vy, cx, vy+28, 'pf-stroke') + `<ellipse cx="${cx}" cy="${vy+30}" rx="34" ry="6" class="pf-glass-rim"/>`;
    s += PF.t(cx, mid+30, '50 mL', 'b');
    s += PF.dim(cx+rx+20, top, cx+rx+20, vy, 'H', -14);
    s += PF.dim(cx+rx/2+22, mid, cx+rx/2+22, vy, 'H/2', -22);
    return {svg: PF.svg(290, 240, s, 'Taça em forma de cone com o vértice para baixo, cheia até a metade da altura, com 50 mililitros'), cap:'Taça cônica cheia até a metade da altura H', escala:false};
  },
  /* UNESP 2 — placa quadrada de 12 cm sem quatro quartos de círculo de raio 3 cm */
  'unesp-placa': ()=>{
    const k = 17, L = 12*k, r = 3*k, x = 70, y = 18;
    const d = `M${x+r} ${y} H${x+L-r} A${r} ${r} 0 0 0 ${x+L} ${y+r} V${y+L-r} A${r} ${r} 0 0 0 ${x+L-r} ${y+L} H${x+r} A${r} ${r} 0 0 0 ${x} ${y+L-r} V${y+r} A${r} ${r} 0 0 0 ${x+r} ${y} Z`;
    let s = `<rect x="${x}" y="${y}" width="${L}" height="${L}" class="pf-ghost"/>`;
    [[x,y,0],[x+L,y,1],[x+L,y+L,2],[x,y+L,3]].forEach(([cx,cy])=>{ s += `<circle cx="${cx}" cy="${cy}" r="${r}" class="pf-removed" clip-path="url(#pfClipPlaca)"/>`; });
    s = `<defs><clipPath id="pfClipPlaca"><rect x="${x}" y="${y}" width="${L}" height="${L}"/></clipPath></defs>` + s;
    s += `<path d="${d}" class="pf-fill"/>`;
    s += PF.line(x, y, x + r*Math.cos(Math.PI/4), y + r*Math.sin(Math.PI/4), 'pf-acc') + `<circle cx="${x}" cy="${y}" r="3" class="pf-dot"/>`;
    s += PF.t(x + r*0.9 + 4, y + r*0.62 + 10, '3 cm', 'b acc', 'start');
    s += PF.dim(x, y+L+16, x+L, y+L+16, '12 cm', 15) + PF.dim(x-16, y, x-16, y+L, '12 cm', 20);
    return {svg: PF.svg(296, 266, s, 'Placa quadrada de 12 centímetros de lado sem um quarto de círculo de raio 3 centímetros em cada canto'), cap:'Em azul, a placa que restou; tracejado, o quadrado original e os cantos retirados', escala:true};
  },
  /* UNESP 9 — gráfico de P(x) = 2(x + 1)(x − 2)(x − 4): raízes −1, 2, 4 e P(0) = 16 */
  'unesp-polinomio': ()=>{
    const P = x=> 2*(x+1)*(x-2)*(x-4), xa = -1.55, xb = 4.6, ya = -26, yb = 22;
    const X0 = 22, X1 = 322, Y0 = 18, Y1 = 238, sx = x=> X0 + (x-xa)/(xb-xa)*(X1-X0), sy = y=> Y1 - (y-ya)/(yb-ya)*(Y1-Y0);
    let s = PF.line(X0-6, sy(0), X1+6, sy(0), 'pf-axis') + PF.line(sx(0), Y1, sx(0), Y0-4, 'pf-axis');
    s += `<path d="M${X1+6} ${PF.n(sy(0))} l-7 -4 v8 z M${PF.n(sx(0))} ${Y0-6} l-4 7 h8 z" class="pf-arrow"/>`;
    s += PF.t(X1+4, sy(0)+18, 'x', 's') + PF.t(sx(0)+10, Y0+4, 'y', 's', 'start');
    let d = '';
    for(let i=0; i<=240; i++){ const x = xa + (xb-xa)*i/240, y = Math.max(ya, Math.min(yb+3, P(x))); d += `${i?'L':'M'}${PF.n(sx(x))} ${PF.n(sy(y))} `; }
    s += `<path d="${d}" class="pf-curve"/>`;
    [-1, 2, 4].forEach(r=>{ s += `<circle cx="${PF.n(sx(r))}" cy="${PF.n(sy(0))}" r="4.5" class="pf-pt"/>` + PF.t(sx(r) + (r===-1 ? -10 : r===2 ? -10 : 10), sy(0)+18, r===-1 ? '−1' : r, 'b'); });
    s += `<circle cx="${PF.n(sx(0))}" cy="${PF.n(sy(16))}" r="4.5" class="pf-pt"/>` + PF.t(sx(0)-9, sy(16)+4.5, '16', 'b', 'end');
    s += PF.t(sx(0)-6, sy(0)+16, '0', 's', 'end');
    return {svg: PF.svg(340, 252, s, 'Gráfico de um polinômio de grau 3 que corta o eixo x em −1, 2 e 4 e o eixo y em 16'), cap:'Gráfico de P(x). Só estão marcados os valores do enunciado: não é preciso (nem se deve) medir nada no desenho', escala:false};
  },
  /* OBMEP 1 — hexágonos de palitos, vizinhos dividindo um lado (6, 11 e 16 palitos) */
  'obmep-hexagonos': ()=>{
    const a = 20, w = a*Math.sqrt(3), cy = 70;
    let s = '', x = 22;
    [1,2,3].forEach((n, fi)=>{
      const seen = new Set(), sticks = [];
      for(let i=0; i<n; i++){
        const cx = x + w/2 + i*w;
        const v = [[cx, cy-a], [cx+w/2, cy-a/2], [cx+w/2, cy+a/2], [cx, cy+a], [cx-w/2, cy+a/2], [cx-w/2, cy-a/2]];
        for(let j=0; j<6; j++){
          const p = v[j], q = v[(j+1)%6], key = [p, q].map(z=>z.map(c=>c.toFixed(1)).join(',')).sort().join('|');
          if(!seen.has(key)){ seen.add(key); sticks.push([p, q]); }
        }
      }
      sticks.forEach(([p, q])=>{
        const ux = (q[0]-p[0]), uy = (q[1]-p[1]), g = 0.1;
        s += PF.line(p[0]+ux*g, p[1]+uy*g, q[0]-ux*g, q[1]-uy*g, 'pf-stick') + `<circle cx="${PF.n(q[0]-ux*g)}" cy="${PF.n(q[1]-uy*g)}" r="2.6" class="pf-head"/>`;
      });
      const mid = x + n*w/2;
      s += PF.t(mid, cy+a+26, `Figura ${fi+1}`, 'b') + PF.t(mid, cy+a+43, `${sticks.length} palitos`, 's');
      x += n*w + 26;
    });
    return {svg: PF.svg(Math.ceil(x), 140, s, 'Figura 1 com 1 hexágono e 6 palitos, Figura 2 com 2 hexágonos e 11 palitos, Figura 3 com 3 hexágonos e 16 palitos'), cap:'Cada traço é um palito. Hexágonos vizinhos dividem o palito vertical entre eles', escala:true};
  },
  /* OBMEP 6 — quadrado de 8 cm e três quadrados pelos pontos médios */
  'obmep-quadrados': ()=>{
    const L = 200, x = 66, y = 16, c = [x+L/2, y+L/2];
    let sq = [[x,y],[x+L,y],[x+L,y+L],[x,y+L]], s = '';
    for(let i=0; i<=3; i++){
      const pts = sq.map(p=>p.map(PF.n).join(',')).join(' ');
      s += `<polygon points="${pts}" class="${i===3 ? 'pf-fill2' : i===0 ? 'pf-fill' : 'pf-stroke-only'}"/>`;
      if(i<3) sq.forEach((p, j)=>{ const q = sq[(j+1)%4]; s += `<circle cx="${PF.n((p[0]+q[0])/2)}" cy="${PF.n((p[1]+q[1])/2)}" r="2.6" class="pf-dot"/>`; });
      sq = sq.map((p, j)=>{ const q = sq[(j+1)%4]; return [(p[0]+q[0])/2, (p[1]+q[1])/2]; });
    }
    s += PF.t(c[0], c[1]+4.5, 'último', 'b');
    s += PF.dim(x, y+L+16, x+L, y+L+16, '8 cm', 15) + PF.dim(x-16, y, x-16, y+L, '8 cm', 20);
    return {svg: PF.svg(282, 254, s, 'Quadrado de 8 centímetros com três quadrados desenhados ligando pontos médios; o último em destaque'), cap:'Os pontos marcam os pontos médios usados. Em laranja, o último quadrado desenhado', escala:true};
  },
  /* OBMEP 8 — relógio às 5 h 10 min (ponteiro das horas a 155°, dos minutos a 60°, a partir do 12) */
  'obmep-relogio': ()=>{
    const cx = 120, cy = 112, R = 92, pt = (deg, r)=> [cx + r*Math.sin(deg*Math.PI/180), cy - r*Math.cos(deg*Math.PI/180)];
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="pf-clock"/>`;
    for(let m=0; m<60; m++){ const [a1,b1] = pt(m*6, R-4), [a2,b2] = pt(m*6, R-(m%5 ? 9 : 15)); s += PF.line(a1, b1, a2, b2, m%5 ? 'pf-tick' : 'pf-tick-b'); }
    for(let hh=1; hh<=12; hh++){ const [a,b] = pt(hh*30, R-29); s += PF.t(a, b+5, hh, 'b clock'); }
    const [hx, hy] = pt(155, 50), [mx, my] = pt(60, 74);
    s += PF.line(cx, cy, hx, hy, 'pf-hand-h') + PF.line(cx, cy, mx, my, 'pf-hand-m') + `<circle cx="${cx}" cy="${cy}" r="5" class="pf-dot"/>`;
    return {svg: PF.svg(240, 224, s, 'Relógio marcando 5 horas e 10 minutos'), cap:'5 h 10 min: o ponteiro curto (horas) já passou um pouco do 5; o longo (minutos) está no 2', escala:true};
  },
};

/* coloca as figuras e as contas armadas dentro de um elemento já na página */
function renderBankFigures(root){
  root.querySelectorAll('figure.bq-figure[data-fig]').forEach(fig=>{
    if(fig.dataset.done) return;
    const make = PROVA_FIGS[fig.dataset.fig];
    if(!make){ fig.innerHTML = `<figcaption class="bq-cap">Figura indisponível (${escHTML(fig.dataset.fig)})</figcaption>`; return; }
    const f = make();
    fig.dataset.done = '1';
    fig.innerHTML = `<div class="bq-fig-box">${f.svg}</div>
      <figcaption class="bq-cap-row"><span class="bq-cap">${f.cap}${f.escala===false ? ' <em>(figura fora de escala)</em>' : ''}</span><button type="button" class="bq-zoom" aria-label="Ampliar figura">⤢ Ampliar</button></figcaption>`;
    fig.querySelector('.bq-zoom').onclick = ()=> openFigureZoom(f.svg, f.cap);
  });
  root.querySelectorAll('.bq-conta[data-n]').forEach(el=>{
    if(el.dataset.done) return;
    el.dataset.done = '1';
    const nums = el.dataset.n.split('|').map(x=>x.replace(/\s/g, '')), op = el.dataset.op;
    el.innerHTML = contaArmada(nums, op, contaResultado(nums, op));
  });
}
/* resultado exato de uma soma/subtração com vírgula decimal (mesma quantidade de casas das parcelas) */
function contaResultado(nums, op){
  const dec = Math.max(...nums.map(n=>(n.split(',')[1]||'').length));
  const ints = nums.map(n=> Math.round(parseFloat(n.replace(',', '.')) * Math.pow(10, dec)));
  const r = op==='+' ? ints.reduce((a,b)=>a+b, 0) : ints.slice(1).reduce((a,b)=>a-b, ints[0]);
  const s = String(Math.abs(r)).padStart(dec+1, '0');
  return (r<0?'−':'') + (dec ? s.slice(0, -dec) + ',' + s.slice(-dec) : s);
}
/* figura ampliada (tela cheia, com rolagem e zoom do próprio navegador) */
function openFigureZoom(svg, cap){
  const bg = h(`<div class="bq-zoom-bg" role="dialog" aria-modal="true" aria-label="Figura ampliada">
      <div class="bq-zoom-box"><button type="button" class="bq-zoom-x" aria-label="Fechar">✕</button>${svg}<p class="bq-cap">${cap}</p></div></div>`);
  const close = ()=>{ bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e=>{ if(e.key==='Escape') close(); };
  bg.onclick = e=>{ if(e.target===bg) close(); };
  bg.querySelector('.bq-zoom-x').onclick = close;
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  bg.querySelector('.bq-zoom-x').focus();
}
