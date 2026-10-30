/* =========================================================
   EXPLICAÇÕES ANIMADAS (tela Aprender)
   Equação do 1º grau (balança), Frações (pizza) e Porcentagem (quadro de 100).
   Cada animação é uma lista de cenas: um desenho (SVG) e uma legenda. As cenas passam
   sozinhas, devagar, e dá pra pausar, voltar e avançar.
   ========================================================= */
const AN_C = {ink:'#1B1E45', soft:'#6B6F94', blue:'#4C7DFF', orange:'#FF9F1C', green:'#12B886', red:'#E0405E', purple:'#7C5CFF', line:'#C9CCE6'};
const anText = (x, y, t, o={})=> `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-family="Inter,sans-serif" font-weight="${o.w||800}" font-size="${o.s||16}" fill="${o.c||AN_C.ink}" ${o.cls?`class="${o.cls}"`:''} ${o.st?`style="${o.st}"`:''}>${t}</text>`;
const anSvg = inner=> `<svg viewBox="0 0 320 210" class="an-svg" role="img" aria-hidden="true">${inner}</svg>`;

/* ---------- balança ---------- */
function anBalance({left, right, tilt=0, note=''}){
  // left/right: {boxes, balls, out (bolinhas saindo), group (pinta em 2 grupos)}
  const beamY = 70, pivot = 160;
  const dy = tilt*12.5; // a ponta do braço, a 80px do meio, sobe/desce 80·sen(9°)
  const pan = (cx, py, side)=>{
    let s = `<line x1="${cx}" y1="${beamY + (cx<pivot?-dy:dy)}" x2="${cx-48}" y2="${py}" stroke="${AN_C.soft}" stroke-width="1.5"/><line x1="${cx}" y1="${beamY + (cx<pivot?-dy:dy)}" x2="${cx+48}" y2="${py}" stroke="${AN_C.soft}" stroke-width="1.5"/>`;
    s += `<path d="M${cx-58} ${py} h116 a58 14 0 0 1 -116 0z" fill="#E6E8F7" stroke="${AN_C.line}" stroke-width="2"/>`;
    const items = [];
    for(let i=0;i<(side.boxes||0);i++) items.push({t:'box', g: side.group ? (i < side.boxes/2 ? 0 : 1) : -1});
    for(let i=0;i<(side.balls||0);i++) items.push({t:'ball', g: side.group ? (i < side.balls/2 ? 0 : 1) : -1});
    for(let i=0;i<(side.out||0);i++) items.push({t:'ball', out:true});
    let x0 = cx-54, x = x0, y = py-4, rowH = 0, k = 0;
    items.forEach(it=>{
      const w = it.t==='box' ? 26 : 16;
      if(x + w > cx+58){ x = x0; y -= rowH + 3; rowH = 0; }
      const col = it.g===0 ? AN_C.blue : it.g===1 ? AN_C.orange : it.t==='box' ? AN_C.purple : AN_C.green;
      const cls = it.out ? 'an-out' : 'an-pop';
      const st = `animation-delay:${(k++)*0.06}s`;
      if(it.t==='box'){ s += `<g class="${cls}" style="${st}"><rect x="${x}" y="${y-26}" width="24" height="24" rx="5" fill="${col}"/>${anText(x+12, y-9, 'x', {c:'#fff', s:15})}</g>`; rowH = Math.max(rowH, 26); }
      else { s += `<circle class="${cls}" style="${st}" cx="${x+7}" cy="${y-8}" r="7" fill="${it.out ? AN_C.red : col}"/>`; rowH = Math.max(rowH, 16); }
      x += w;
    });
    return s;
  };
  let s = `<polygon points="${pivot-22},196 ${pivot+22},196 ${pivot},${beamY+6}" fill="${AN_C.soft}" opacity=".85"/>`;
  s += `<g class="an-beam" style="transform-origin:${pivot}px ${beamY}px; transform:rotate(${tilt*9}deg)"><line x1="40" y1="${beamY}" x2="280" y2="${beamY}" stroke="${AN_C.ink}" stroke-width="5" stroke-linecap="round"/></g>`;
  s += `<circle cx="${pivot}" cy="${beamY}" r="6" fill="${AN_C.ink}"/>`;
  s += pan(80, 150 - dy, left) + pan(240, 150 + dy, right);
  if(note) s += anText(160, 24, note, {s:19, c:AN_C.ink, cls:'an-fade'});
  return anSvg(s);
}

/* ---------- pizza ---------- */
function anSlice(cx, cy, r, a0, a1){
  const p = a=> [cx + r*Math.cos((a-90)*Math.PI/180), cy + r*Math.sin((a-90)*Math.PI/180)];
  const [x0,y0] = p(a0), [x1,y1] = p(a1);
  return `M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`;
}
function anPizza(cx, cy, r, parts, colors, label){
  let s = `<circle cx="${cx}" cy="${cy}" r="${r+4}" fill="#F3D9A4"/>`;
  if(!parts){ s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFE8B8" stroke="#E2B867" stroke-width="2"/>`; }
  else for(let i=0;i<parts;i++){
    const col = colors[i] || '#FFF6E0';
    s += `<path class="${colors[i] ? 'an-pop' : ''}" style="animation-delay:${i*0.35}s" d="${anSlice(cx,cy,r,i*360/parts,(i+1)*360/parts)}" fill="${col}" stroke="#E2B867" stroke-width="2.5"/>`;
  }
  if(label) s += anText(cx, cy + r + 26, label, {s:20});
  return s;
}

/* ---------- quadro de 100 ---------- */
function anGrid(n, color){
  let s = '';
  for(let i=0;i<100;i++){
    const r = Math.floor(i/10), c = i%10, on = i < n;
    s += `<rect class="${on?'an-pop':''}" style="${on?`animation-delay:${i*0.035}s`:''}" x="${85 + c*15}" y="${18 + r*15}" width="13" height="13" rx="2.5" fill="${on ? color : '#E6E8F7'}"/>`;
  }
  return s;
}
function anBar(total, parts, takeOut){
  const x0 = 20, w = 280, y = 86, pw = w/parts;
  let s = anText(160, 60, `100% = R$ ${total}`, {s:17});
  for(let i=0;i<parts;i++){
    const first = i===0, cls = first && takeOut ? 'an-out' : first ? 'an-pop' : '';
    s += `<g class="${cls}"><rect x="${x0+i*pw+2}" y="${y}" width="${pw-4}" height="46" rx="8" fill="${first ? AN_C.orange : '#DCE4FF'}"/>${anText(x0+i*pw+pw/2, y+29, `R$ ${total/parts}`, {s:16, c: first ? '#fff' : AN_C.ink})}</g>`;
  }
  s += anText(x0+pw/2, y+70, '25%', {s:16, c:AN_C.orange, cls: takeOut ? 'an-out' : 'an-fade'});
  if(takeOut) s += anText(160, 190, `Paga: R$ ${total - total/parts}`, {s:22, c:AN_C.green, cls:'an-fade'});
  return anSvg(s);
}

const CONCEPT_ANIMS = {
  eq1:{title:'A equação é uma balança', scenes:[
    {cap:'A equação 2x + 3 = 11 é uma balança equilibrada: de um lado, 2 caixas (x) e 3 bolinhas; do outro, 11 bolinhas.', svg:()=> anBalance({left:{boxes:2, balls:3}, right:{balls:11}, note:'2x + 3 = 11'})},
    {cap:'Pra descobrir o x, a gente tira a MESMA coisa dos dois lados. Tirando 3 bolinhas de cada lado...', svg:()=> anBalance({left:{boxes:2, out:3}, right:{balls:8, out:3}, note:'2x + 3 − 3 = 11 − 3'})},
    {cap:'...a balança continua equilibrada! Agora sobrou: 2 caixas = 8 bolinhas.', svg:()=> anBalance({left:{boxes:2}, right:{balls:8}, note:'2x = 8'})},
    {cap:'Duas caixas iguais valem 8. Divida os dois lados em 2 grupos iguais: cada caixa fica com 4 bolinhas.', svg:()=> anBalance({left:{boxes:2, group:true}, right:{balls:8, group:true}, note:'2x ÷ 2 = 8 ÷ 2'})},
    {cap:'Então x = 4! Confira: 2 × 4 + 3 = 8 + 3 = 11. ✓', svg:()=> anBalance({left:{boxes:1}, right:{balls:4}, note:'x = 4'})},
    {cap:'Se colocar peso diferente de cada lado, a balança entorta: por isso tudo que fizer de um lado, faça do outro também!', svg:()=> anBalance({left:{boxes:1, balls:2}, right:{balls:4}, tilt:-1, note:'Desequilibrou!'})},
  ]},
  fracoes:{title:'Frações com pizza', scenes:[
    {cap:'Esta pizza inteira é 1 inteiro.', svg:()=> anSvg(anPizza(160, 92, 70, 0, [], '1 inteiro'))},
    {cap:'Cortando em 4 pedaços IGUAIS, cada pedaço é 1/4 (um quarto). O número de baixo, o denominador, diz em quantos pedaços cortamos.', svg:()=> anSvg(anPizza(160, 92, 70, 4, [AN_C.orange], '1/4'))},
    {cap:'Pegando 3 pedaços, temos 3/4. O número de cima, o numerador, diz quantos pedaços pegamos.', svg:()=> anSvg(anPizza(160, 92, 70, 4, [AN_C.orange, AN_C.orange, AN_C.orange], '3/4'))},
    {cap:'2/4 e 1/2 são a MESMA quantidade de pizza: são frações equivalentes. Dá pra simplificar 2/4 dividindo em cima e embaixo por 2.', svg:()=> anSvg(anPizza(88, 88, 58, 4, [AN_C.blue, AN_C.blue], '2/4') + anText(160, 96, '=', {s:30}) + anPizza(232, 88, 58, 2, [AN_C.blue], '1/2'))},
    {cap:'Somando com o mesmo denominador: 1/4 + 2/4 = 3/4. Os pedaços são do mesmo tamanho, então é só somar os de cima!', svg:()=> anSvg(anPizza(160, 92, 70, 4, [AN_C.blue, AN_C.orange, AN_C.orange], '1/4 + 2/4 = 3/4'))},
  ]},
  porcentagem:{title:'Porcentagem = de cada 100', scenes:[
    {cap:'"Por cento" quer dizer "de cada 100". Este quadro tem 100 quadradinhos.', svg:()=> anSvg(anGrid(0, AN_C.blue) + anText(160, 196, '100 quadradinhos = 100%', {s:15}))},
    {cap:'Pintando 25 dos 100, pintamos 25% do quadro, que é a quarta parte (1/4).', svg:()=> anSvg(anGrid(25, AN_C.orange) + anText(160, 196, '25 de 100 = 25%', {s:15, c:AN_C.orange}))},
    {cap:'Pintando 50, temos 50%: a metade.', svg:()=> anSvg(anGrid(50, AN_C.blue) + anText(160, 196, '50 de 100 = 50% = metade', {s:15, c:AN_C.blue}))},
    {cap:'E na loja? Uma camiseta de R$ 80 com 25% de desconto. 25% é 1/4: divida os R$ 80 em 4 partes iguais. Cada parte vale R$ 20.', svg:()=> anBar(80, 4, false)},
    {cap:'O desconto tira uma parte: 80 − 20 = 60. Você paga R$ 60!', svg:()=> anBar(80, 4, true)},
  ]},
};

/* cartão do Aprender com a animação do assunto (ou null se não tiver) */
function conceptAnimCard(subjectId){
  const A = CONCEPT_ANIMS[subjectId];
  if(!A) return null;
  const card = h(`<section class="lr-card an-card" id="lr-anim"><div class="lr-sec-h"><span>🎬</span><b>${A.title}</b><small>Explicação animada</small></div>
    <div class="an-stage"></div><p class="an-cap"></p>
    <div class="an-ctrl"><button type="button" class="an-prev" aria-label="Voltar">‹</button><div class="an-dots"></div><button type="button" class="an-play">▶ Ver animação</button><button type="button" class="an-next" aria-label="Avançar">›</button></div></section>`);
  const stage = card.querySelector('.an-stage'), cap = card.querySelector('.an-cap'), dots = card.querySelector('.an-dots'), play = card.querySelector('.an-play');
  let i = 0, timer = null, playing = false;
  A.scenes.forEach((_,k)=>{ const d = h(`<i></i>`); d.onclick = ()=>{ stop(); show(k); }; dots.appendChild(d); });
  function show(k){
    i = Math.max(0, Math.min(A.scenes.length-1, k));
    stage.innerHTML = A.scenes[i].svg();
    cap.textContent = A.scenes[i].cap;
    [...dots.children].forEach((d,n)=> d.classList.toggle('on', n===i));
  }
  function stop(){ playing = false; clearTimeout(timer); play.textContent = i>=A.scenes.length-1 ? '↺ Ver de novo' : '▶ Continuar'; }
  function next(){
    if(!card.isConnected){ clearTimeout(timer); return; }
    if(i >= A.scenes.length-1){ stop(); return; }
    show(i+1); schedule();
  }
  // devagar: tempo pra ler a legenda com calma
  function schedule(){ clearTimeout(timer); timer = setTimeout(next, Math.max(5500, cap.textContent.length*75)); }
  play.onclick = ()=>{
    if(playing){ stop(); return; }
    if(i >= A.scenes.length-1) show(0); else if(play.textContent.startsWith('▶ Ver')) show(0);
    playing = true; play.textContent = '⏸ Pausar'; schedule();
  };
  card.querySelector('.an-prev').onclick = ()=>{ stop(); show(i-1); };
  card.querySelector('.an-next').onclick = ()=>{ stop(); show(i+1); };
  show(0);
  return card;
}
