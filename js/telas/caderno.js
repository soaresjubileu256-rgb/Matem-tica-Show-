/* =========================================================
   CADERNO DIGITAL — escrever à mão como numa mesa digitalizadora
   - caneta com pressão (canetas stylus) ou pela velocidade (dedo/mouse)
   - "só caneta": quando uma caneta é detectada, o dedo passa a só mover a página
     (rejeição da palma da mão, como nas mesas digitalizadoras)
   - dois dedos: arrastar e dar zoom
   - ferramentas: caneta, marca-texto, borracha, linha, retângulo, círculo e texto
   - fundos: liso, pautado, quadriculado, pontilhado e plano cartesiano
   Cada página é guardada como traços (vetores), não como imagem: ocupa pouco
   espaço, fica nítida em qualquer zoom e permite desfazer/refazer.
   ========================================================= */
const NOTE_W = 1000, NOTE_H = 1414; // proporção de uma folha A4
const NOTES_KEY_BASE = 'mathstudy-notes-v1';   // índice das páginas (sem os traços)
const NOTE_KEY_BASE = 'mathstudy-note-v1';     // traços de cada página
const NOTE_COLORS = ['#1B1B2F','#E0405A','#2F6BFF','#12A150','#E09A00','#9B3FE0'];
const NOTE_HL_COLORS = ['#FFE14D','#7DF0A0','#7FD4FF','#FF9EC4'];
const NOTE_SIZES = {pen:[2.5,5,9], hl:[18,28,40], eraser:[12,24,44], shape:[2.5,5,9], text:[30,42,60]};
const NOTE_BGS = [['grid','Quadriculado'],['lines','Pautado'],['dots','Pontilhado'],['cartesian','Plano cartesiano'],['plain','Liso']];
const NOTE_TOOLS = [['pen','✒️','Caneta'],['hl','🖍️','Marca-texto'],['eraser','🧽','Borracha'],['line','📏','Linha reta'],['rect','▭','Retângulo'],['circle','◯','Círculo'],['text','T','Texto']];

function notesIndex(){ try{ return JSON.parse(localStorage.getItem(`${NOTES_KEY_BASE}:${currentUserId()}`)||'[]'); }catch(e){ return []; } }
function saveNotesIndex(list){ localStorage.setItem(`${NOTES_KEY_BASE}:${currentUserId()}`, JSON.stringify(list)); }
function loadNotePage(id){
  const meta = notesIndex().find(n=>n.id===id);
  if(!meta) return null;
  let strokes = [];
  try{ strokes = JSON.parse(localStorage.getItem(`${NOTE_KEY_BASE}:${currentUserId()}:${id}`)||'[]'); }catch(e){}
  return Object.assign({}, meta, {strokes});
}
/* salva traços + miniatura; avisa se o armazenamento do aparelho encheu */
function saveNotePage(page){
  try{
    localStorage.setItem(`${NOTE_KEY_BASE}:${currentUserId()}:${page.id}`, JSON.stringify(page.strokes));
    const list = notesIndex();
    const meta = {id:page.id, title:page.title, subjectId:page.subjectId||null, bg:page.bg, updated:Date.now(), created:page.created||Date.now(), thumb:noteThumb(page)};
    const i = list.findIndex(n=>n.id===page.id);
    if(i>=0) list[i] = meta; else list.unshift(meta);
    saveNotesIndex(list);
    return true;
  }catch(e){
    queueToast('⚠️', 'Não deu pra salvar', 'O armazenamento do aparelho está cheio. Apague páginas antigas.');
    return false;
  }
}
function deleteNotePage(id){
  try{ localStorage.removeItem(`${NOTE_KEY_BASE}:${currentUserId()}:${id}`); }catch(e){}
  saveNotesIndex(notesIndex().filter(n=>n.id!==id));
}
function newNotePage(opts){
  opts = opts || {};
  const subj = opts.subjectId ? SUBJECTS.find(s=>s.id===opts.subjectId) : null;
  const page = {id:`n${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`, title: opts.title || (subj ? `Anotações · ${subj.name}` : 'Nova página'),
    subjectId: opts.subjectId || null, bg: opts.bg || 'grid', strokes: opts.strokes || [], created: Date.now()};
  saveNotePage(page);
  return page;
}
/* tudo das anotações, pro backup */
function exportNotes(){
  const index = notesIndex();
  const pages = {};
  index.forEach(n=>{ try{ pages[n.id] = JSON.parse(localStorage.getItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`)||'[]'); }catch(e){} });
  return {index, pages};
}
function importNotes(data){
  if(!data || !Array.isArray(data.index)) return;
  notesIndex().forEach(n=>{ try{ localStorage.removeItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`); }catch(e){} });
  try{
    saveNotesIndex(data.index);
    data.index.forEach(n=>{ localStorage.setItem(`${NOTE_KEY_BASE}:${currentUserId()}:${n.id}`, JSON.stringify((data.pages||{})[n.id]||[])); });
  }catch(e){}
}

/* ---------- desenho ---------- */
function drawNoteBg(ctx, bg){
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, NOTE_W, NOTE_H);
  ctx.lineWidth = 1;
  if(bg==='grid' || bg==='cartesian'){
    ctx.strokeStyle = bg==='cartesian' ? '#D7DEEC' : '#DCE3F0';
    ctx.beginPath();
    for(let x=0; x<=NOTE_W; x+=50){ ctx.moveTo(x,0); ctx.lineTo(x,NOTE_H); }
    for(let y=7; y<=NOTE_H; y+=50){ ctx.moveTo(0,y); ctx.lineTo(NOTE_W,y); }
    ctx.stroke();
  } else if(bg==='lines'){
    ctx.strokeStyle = '#C9D6EE';
    ctx.beginPath();
    for(let y=120; y<NOTE_H; y+=56){ ctx.moveTo(0,y); ctx.lineTo(NOTE_W,y); }
    ctx.stroke();
    ctx.strokeStyle = '#F2A3AE'; ctx.beginPath(); ctx.moveTo(90,0); ctx.lineTo(90,NOTE_H); ctx.stroke();
  } else if(bg==='dots'){
    ctx.fillStyle = '#B9C3D6';
    for(let x=25; x<NOTE_W; x+=50) for(let y=32; y<NOTE_H; y+=50){ ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill(); }
  }
  if(bg==='cartesian'){
    const cx = 500, cy = 707;
    ctx.strokeStyle = '#5A6680'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(20,cy); ctx.lineTo(NOTE_W-20,cy); ctx.moveTo(cx,20); ctx.lineTo(cx,NOTE_H-20); ctx.stroke();
    ctx.fillStyle = '#5A6680';
    ctx.beginPath(); ctx.moveTo(NOTE_W-20,cy); ctx.lineTo(NOTE_W-36,cy-8); ctx.lineTo(NOTE_W-36,cy+8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx,20); ctx.lineTo(cx-8,36); ctx.lineTo(cx+8,36); ctx.fill();
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.fillText('x', NOTE_W-34, cy-16); ctx.fillText('y', cx+14, 40);
    ctx.font = '16px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for(let i=-9; i<=9; i++){ if(!i) continue; ctx.fillText(String(i), cx+i*50, cy+6); ctx.fillRect(cx+i*50-1, cy-5, 2, 10); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for(let i=-13; i<=13; i++){ if(!i) continue; ctx.fillText(String(-i), cx-8, cy+i*50); ctx.fillRect(cx-5, cy+i*50-1, 10, 2); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('0', cx-18, cy+16);
  }
}
function drawNoteStroke(ctx, s){
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
  const p = s.p;
  if(s.t==='pen' || s.t==='hl'){
    if(s.t==='hl'){ ctx.globalAlpha = 0.38; ctx.lineCap = 'butt'; }
    const n = p.length/3;
    if(n===1){ // um toque só: um pontinho
      ctx.beginPath(); ctx.arc(p[0], p[1], s.w*(s.t==='hl'?0.5:0.35+0.6*p[2]/100), 0, Math.PI*2); ctx.fill();
    } else if(s.t==='hl'){
      ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(p[0],p[1]);
      for(let i=1;i<n;i++) ctx.lineTo(p[i*3], p[i*3+1]);
      ctx.stroke();
    } else {
      // largura muda com a pressão: desenha segmento por segmento, suavizando pelos pontos médios
      let px = p[0], py = p[1];
      for(let i=1;i<n;i++){
        const x0 = p[(i-1)*3], y0 = p[(i-1)*3+1], x1 = p[i*3], y1 = p[i*3+1];
        const mx = i<n-1 ? (x1+p[(i+1)*3])/2 : x1, my = i<n-1 ? (y1+p[(i+1)*3+1])/2 : y1;
        const pr = ((p[(i-1)*3+2]+p[i*3+2])/2)/100;
        ctx.lineWidth = s.w*(0.35+0.9*pr);
        ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(x1,y1,mx,my); ctx.stroke();
        px = mx; py = my;
      }
    }
  } else if(s.t==='line'){
    ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[2],p[3]); ctx.stroke();
  } else if(s.t==='rect'){
    ctx.lineWidth = s.w; ctx.strokeRect(Math.min(p[0],p[2]), Math.min(p[1],p[3]), Math.abs(p[2]-p[0]), Math.abs(p[3]-p[1]));
  } else if(s.t==='circle'){
    ctx.lineWidth = s.w; ctx.beginPath(); ctx.arc(p[0], p[1], Math.hypot(p[2]-p[0], p[3]-p[1]), 0, Math.PI*2); ctx.stroke();
  } else if(s.t==='text'){
    ctx.font = `600 ${s.w}px Inter, sans-serif`; ctx.textBaseline = 'top';
    String(s.txt).split('\n').forEach((ln,i)=> ctx.fillText(ln, p[0], p[1]+i*s.w*1.25));
  }
  ctx.restore();
}
/* borracha: o traço encosta no ponto (x,y) com raio r? */
function noteStrokeHit(s, x, y, r){
  const p = s.p;
  const segDist = (ax,ay,bx,by)=>{ const dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy; let t = L ? ((x-ax)*dx+(y-ay)*dy)/L : 0; t = Math.max(0,Math.min(1,t)); return Math.hypot(x-(ax+t*dx), y-(ay+t*dy)); };
  const pad = r + s.w/2;
  if(s.t==='pen' || s.t==='hl'){
    const n = p.length/3;
    if(n===1) return Math.hypot(x-p[0], y-p[1]) < pad;
    for(let i=1;i<n;i++) if(segDist(p[(i-1)*3],p[(i-1)*3+1],p[i*3],p[i*3+1]) < pad) return true;
    return false;
  }
  if(s.t==='line') return segDist(p[0],p[1],p[2],p[3]) < pad;
  if(s.t==='rect'){ const [a,b,c,d] = p; return [[a,b,c,b],[c,b,c,d],[c,d,a,d],[a,d,a,b]].some(q=>segDist(...q) < pad); }
  if(s.t==='circle') return Math.abs(Math.hypot(x-p[0],y-p[1]) - Math.hypot(p[2]-p[0],p[3]-p[1])) < pad;
  if(s.t==='text'){ const lines = String(s.txt).split('\n'); const w = Math.max(...lines.map(l=>l.length))*s.w*0.6, hh = lines.length*s.w*1.25; return x>p[0]-r && x<p[0]+w+r && y>p[1]-r && y<p[1]+hh+r; }
  return false;
}
function renderNotePage(ctx, page){ drawNoteBg(ctx, page.bg); page.strokes.forEach(s=>drawNoteStroke(ctx, s)); }
function noteThumb(page){
  try{
    const c = document.createElement('canvas'); c.width = 150; c.height = Math.round(150*NOTE_H/NOTE_W);
    const x = c.getContext('2d'); x.scale(150/NOTE_W, 150/NOTE_W); renderNotePage(x, page);
    return c.toDataURL('image/jpeg', 0.6);
  }catch(e){ return ''; }
}

/* caixinha pra digitar texto, com teclas de símbolos de matemática */
const MATH_KEYS = ['²','³','√','π','×','÷','−','±','≠','≤','≥','≈','½','¼','°','∞','Δ','∑','α','β','θ','→'];
function askMathText(initial){
  return new Promise(resolve=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg sheet';
    bg.innerHTML = `<div class="gm-modal nb-textbox"><h2 style="font-size:20px">Escrever texto</h2>
      <textarea rows="3" placeholder="Ex.: x² + 2x = 15"></textarea>
      <div class="nb-keys">${MATH_KEYS.map(k=>`<button type="button" class="nb-key">${k}</button>`).join('')}</div>
      <button type="button" class="nb-ok">Colocar na página</button>
      <button type="button" class="nb-cancel" style="margin-top:8px;background:rgba(255,255,255,.1);color:#fff">Cancelar</button></div>`;
    const ta = bg.querySelector('textarea'); ta.value = initial || '';
    bg.querySelectorAll('.nb-key').forEach(k=> k.onclick = ()=>{
      const a = ta.selectionStart, b = ta.selectionEnd;
      ta.value = ta.value.slice(0,a) + k.textContent + ta.value.slice(b);
      ta.focus(); ta.selectionStart = ta.selectionEnd = a + k.textContent.length;
    });
    const close = v=>{ bg.remove(); resolve(v); };
    bg.querySelector('.nb-ok').onclick = ()=> close(ta.value.trim());
    bg.querySelector('.nb-cancel').onclick = ()=> close('');
    bg.addEventListener('click', e=>{ if(e.target===bg) close(''); });
    document.body.appendChild(bg);
    setTimeout(()=>ta.focus(), 50);
  });
}

/* ---------- a "mesa digitalizadora": liga o canvas aos toques/caneta ----------
   host: elemento que o canvas vai preencher · page: {bg, strokes} · onChange: chamado a cada mudança */
function createBoard(host, page, onChange){
  const canvas = document.createElement('canvas');
  canvas.className = 'nb-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const cache = document.createElement('canvas'), cctx = cache.getContext('2d');
  const st = {tool:'pen', color:NOTE_COLORS[0], hlColor:NOTE_HL_COLORS[0], size:1, penOnly:false, zoom:1, ox:0, oy:0};
  let cssW = 0, cssH = 0, dpr = 1, fit = 1;
  let cur = null, erasing = null, pinch = null, pan = null, raf = 0;
  const undo = [], redo = [];
  const pointers = new Map();

  function scale(){ return fit*st.zoom; }
  function toPage(cx, cy){ const r = canvas.getBoundingClientRect(); return [(cx-r.left-st.ox)/scale(), (cy-r.top-st.oy)/scale()]; }
  function clampView(){
    const pw = NOTE_W*scale(), ph = NOTE_H*scale();
    st.ox = pw <= cssW ? (cssW-pw)/2 : Math.min(0, Math.max(cssW-pw, st.ox));
    st.oy = ph <= cssH ? 0 : Math.min(0, Math.max(cssH-ph, st.oy));
  }
  function resize(){
    const r = host.getBoundingClientRect();
    if(!r.width || !r.height) return;
    cssW = r.width; cssH = r.height; dpr = Math.min(window.devicePixelRatio||1, 2.5);
    canvas.width = cache.width = Math.round(cssW*dpr); canvas.height = cache.height = Math.round(cssH*dpr);
    canvas.style.width = cssW+'px'; canvas.style.height = cssH+'px';
    fit = cssW/NOTE_W;
    clampView(); rebuild();
  }
  function applyView(c){ c.setTransform(dpr*scale(), 0, 0, dpr*scale(), dpr*st.ox, dpr*st.oy); }
  function rebuild(){
    cctx.setTransform(1,0,0,1,0,0);
    cctx.fillStyle = '#C9CEDA'; cctx.fillRect(0,0,cache.width,cache.height);
    applyView(cctx);
    cctx.save(); cctx.beginPath(); cctx.rect(0,0,NOTE_W,NOTE_H); cctx.clip();
    renderNotePage(cctx, page);
    cctx.restore();
    frame();
  }
  function frame(){
    raf = 0;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(cache, 0, 0);
    if(cur){ applyView(ctx); drawNoteStroke(ctx, cur); }
    if(erasing && erasing.at){ applyView(ctx); ctx.strokeStyle = '#8891A6'; ctx.lineWidth = 1.5/scale(); ctx.beginPath(); ctx.arc(erasing.at[0], erasing.at[1], erasing.r, 0, Math.PI*2); ctx.stroke(); }
  }
  function schedule(){ if(!raf) raf = requestAnimationFrame(frame); }
  function snapshot(){ undo.push(page.strokes.slice()); if(undo.length>60) undo.shift(); redo.length = 0; }
  function changed(){ rebuild(); onChange && onChange(); }

  function startStroke(e){
    const [x,y] = toPage(e.clientX, e.clientY);
    const key = ['line','rect','circle'].includes(st.tool) ? 'shape' : st.tool;
    const size = (NOTE_SIZES[key] || [5,5,5])[st.size];
    if(st.tool==='eraser'){
      snapshot(); erasing = {r:size, removed:false, at:[x,y]}; eraseAt(x,y); return;
    }
    if(st.tool==='text'){
      askMathText().then(txt=>{ if(!txt) return; snapshot(); page.strokes.push({t:'text', c:st.color, w:NOTE_SIZES.text[st.size], p:[Math.round(x),Math.round(y)], txt}); changed(); });
      return;
    }
    const color = st.tool==='hl' ? st.hlColor : st.color;
    if(st.tool==='pen' || st.tool==='hl') cur = {t:st.tool, c:color, w:size, p:[], _last:null};
    else cur = {t:st.tool, c:color, w:size, p:[Math.round(x),Math.round(y),Math.round(x),Math.round(y)]};
    addPoint(e);
  }
  function pressureOf(e){
    if(e.pointerType==='pen' && e.pressure>0) return e.pressure;
    // dedo/mouse não têm pressão: usa a velocidade (rápido = traço mais fino, como tinta de verdade)
    const now = e.timeStamp || performance.now();
    if(cur._last){ const dt = Math.max(1, now-cur._last.t); const v = Math.hypot(e.clientX-cur._last.x, e.clientY-cur._last.y)/dt;
      cur._pr = (cur._pr==null?0.6:cur._pr)*0.7 + Math.max(0.25, Math.min(0.85, 0.9 - v*0.35))*0.3; }
    cur._last = {x:e.clientX, y:e.clientY, t:now};
    return cur._pr==null ? 0.6 : cur._pr;
  }
  function addPoint(e){
    if(!cur) return;
    const [x,y] = toPage(e.clientX, e.clientY);
    if(cur.t==='pen' || cur.t==='hl'){
      const n = cur.p.length;
      if(n && Math.hypot(x-cur.p[n-3], y-cur.p[n-2]) < 0.8/st.zoom) return;
      cur.p.push(Math.round(x*10)/10, Math.round(y*10)/10, Math.round(pressureOf(e)*100));
    } else {
      let x2 = x, y2 = y;
      if(cur.t==='line'){ // ímã pra ficar reta na horizontal, vertical ou 45°
        const dx = x-cur.p[0], dy = y-cur.p[1], ang = Math.atan2(dy,dx), L = Math.hypot(dx,dy);
        const snap = Math.round(ang/(Math.PI/4))*(Math.PI/4);
        if(Math.abs(ang-snap) < 0.09){ x2 = cur.p[0]+Math.cos(snap)*L; y2 = cur.p[1]+Math.sin(snap)*L; }
      }
      cur.p[2] = Math.round(x2); cur.p[3] = Math.round(y2);
    }
    schedule();
  }
  function endStroke(){
    if(!cur) return;
    const s = cur; cur = null;
    delete s._last; delete s._pr;
    const tiny = s.t!=='pen' && s.t!=='hl' && Math.hypot(s.p[2]-s.p[0], s.p[3]-s.p[1]) < 4;
    if(s.p.length && !tiny){ snapshot(); page.strokes.push(s); changed(); } else frame();
  }
  function eraseAt(x,y){
    // apaga ao longo do caminho desde o último ponto (movimento rápido não "pula" traços)
    const [lx,ly] = erasing.at || [x,y];
    const steps = Math.max(1, Math.ceil(Math.hypot(x-lx, y-ly)/(erasing.r/2)));
    const pts = []; for(let i=1;i<=steps;i++) pts.push([lx+(x-lx)*i/steps, ly+(y-ly)*i/steps]);
    erasing.at = [x,y];
    const before = page.strokes.length;
    page.strokes = page.strokes.filter(s=>!pts.some(([px,py])=>noteStrokeHit(s, px, py, erasing.r)));
    if(page.strokes.length !== before){ erasing.removed = true; rebuild(); } else schedule();
  }

  function onDown(e){
    if(e.pointerType==='pen' && !st.penOnly){ st.penOnly = true; ui.onPenDetected && ui.onPenDetected(); }
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY, type:e.pointerType});
    const touches = [...pointers.values()].filter(p=>p.type==='touch');
    if(e.pointerType==='touch' && (st.penOnly || touches.length>=2)){
      // gesto: 1 dedo no modo só-caneta arrasta; 2 dedos arrastam e dão zoom
      if(cur && touches.length>=2 && cur.p.length < 30) cur = null; // era o começo de um toque de 2 dedos, não um traço
      if(touches.length>=2){
        const [a,b] = touches;
        pinch = {d:Math.hypot(a.x-b.x, a.y-b.y), zoom:st.zoom, mx:(a.x+b.x)/2, my:(a.y+b.y)/2, ox:st.ox, oy:st.oy};
        pan = null;
      } else pan = {x:e.clientX, y:e.clientY, ox:st.ox, oy:st.oy};
      frame();
      return;
    }
    if(pointers.size>1) return;
    startStroke(e);
  }
  function onMove(e){
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY, type:e.pointerType});
    if(pinch){
      const t = [...pointers.values()].filter(p=>p.type==='touch');
      if(t.length<2) return;
      const [a,b] = t, d = Math.hypot(a.x-b.x, a.y-b.y), mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
      const r = canvas.getBoundingClientRect();
      const z = Math.max(1, Math.min(5, pinch.zoom*d/pinch.d));
      // mantém fixo o ponto da página que estava entre os dedos
      const px = (pinch.mx-r.left-pinch.ox)/(fit*pinch.zoom), py = (pinch.my-r.top-pinch.oy)/(fit*pinch.zoom);
      st.zoom = z; st.ox = mx-r.left-px*fit*z; st.oy = my-r.top-py*fit*z;
      clampView(); rebuild(); ui.onZoom && ui.onZoom(st.zoom);
      return;
    }
    if(pan){ st.ox = pan.ox + e.clientX-pan.x; st.oy = pan.oy + e.clientY-pan.y; clampView(); rebuild(); return; }
    if(erasing){ const [x,y] = toPage(e.clientX, e.clientY); eraseAt(x,y); return; }
    if(cur){
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (evs.length ? evs : [e]).forEach(addPoint);
    }
  }
  function onUp(e){
    pointers.delete(e.pointerId);
    const touches = [...pointers.values()].filter(p=>p.type==='touch');
    if(pinch && touches.length<2){ pinch = null; if(touches.length===1 && st.penOnly){ const t = touches[0]; pan = {x:t.x, y:t.y, ox:st.ox, oy:st.oy}; } return; }
    if(pan && !touches.length){ pan = null; return; }
    if(erasing){ if(!erasing.removed) undo.pop(); else onChange && onChange(); erasing = null; frame(); return; }
    endStroke();
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', e=>{ pointers.delete(e.pointerId); cur = null; pinch = null; pan = null; erasing = null; frame(); });
  canvas.addEventListener('wheel', e=>{
    e.preventDefault();
    if(e.ctrlKey){ const r = canvas.getBoundingClientRect(), z0 = st.zoom, z = Math.max(1, Math.min(5, z0*(e.deltaY<0?1.1:0.9)));
      const px = (e.clientX-r.left-st.ox)/(fit*z0), py = (e.clientY-r.top-st.oy)/(fit*z0);
      st.zoom = z; st.ox = e.clientX-r.left-px*fit*z; st.oy = e.clientY-r.top-py*fit*z; ui.onZoom && ui.onZoom(z); }
    else { st.ox -= e.deltaX; st.oy -= e.deltaY; }
    clampView(); rebuild();
  }, {passive:false});
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(()=>resize()) : null;
  if(ro) ro.observe(host); else window.addEventListener('resize', resize);
  requestAnimationFrame(resize);

  const ui = {
    state: st,
    setTool(t){ st.tool = t; },
    setColor(c){ if(st.tool==='hl') st.hlColor = c; else st.color = c; },
    setSize(i){ st.size = i; },
    setPenOnly(v){ st.penOnly = v; },
    setBg(bg){ snapshot(); page.bg = bg; changed(); },
    undo(){ if(!undo.length) return false; redo.push(page.strokes); page.strokes = undo.pop(); changed(); return true; },
    redo(){ if(!redo.length) return false; undo.push(page.strokes); page.strokes = redo.pop(); changed(); return true; },
    clear(){ if(!page.strokes.length) return; snapshot(); page.strokes = []; changed(); },
    resetZoom(){ st.zoom = 1; st.ox = 0; st.oy = 0; clampView(); rebuild(); },
    canUndo(){ return undo.length>0; }, canRedo(){ return redo.length>0; },
    destroy(){ if(ro) ro.disconnect(); else window.removeEventListener('resize', resize); },
  };
  return ui;
}

/* imagem da página em alta resolução (pra salvar/compartilhar) */
function notePageBlob(page){
  return new Promise(resolve=>{
    const c = document.createElement('canvas'); c.width = NOTE_W*1.6; c.height = NOTE_H*1.6;
    const x = c.getContext('2d'); x.scale(1.6,1.6); renderNotePage(x, page);
    c.toBlob(b=>resolve(b), 'image/png');
  });
}
async function shareNotePage(page){
  const blob = await notePageBlob(page);
  if(!blob) return;
  const name = `${(page.title||'pagina').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`;
  try{
    const file = new File([blob], name, {type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:page.title}); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); }, 1500);
}

/* ---------- barra de ferramentas (usada no caderno e no rascunho) ---------- */
function boardToolbar(board, opts){
  opts = opts || {};
  const tools = opts.tools || NOTE_TOOLS.map(t=>t[0]);
  const bar = h(`<div class="nb-toolbar">
    <div class="nb-row nb-tools"></div>
    <div class="nb-row nb-style"><div class="nb-colors"></div><div class="nb-sizes"></div></div>
  </div>`);
  const toolsBox = bar.querySelector('.nb-tools'), colorsBox = bar.querySelector('.nb-colors'), sizesBox = bar.querySelector('.nb-sizes');
  function paintColors(){
    colorsBox.innerHTML = '';
    const isHl = board.state.tool==='hl';
    const list = isHl ? NOTE_HL_COLORS : (opts.colors || NOTE_COLORS);
    const curC = isHl ? board.state.hlColor : board.state.color;
    const hide = ['eraser'].includes(board.state.tool);
    colorsBox.style.visibility = hide ? 'hidden' : '';
    list.forEach(c=>{
      const b = h(`<button type="button" class="nb-color ${c===curC?'on':''}" style="--c:${c}" aria-label="Cor ${c}"></button>`);
      b.onclick = ()=>{ board.setColor(c); paintColors(); };
      colorsBox.appendChild(b);
    });
  }
  function paintSizes(){
    sizesBox.innerHTML = '';
    [0,1,2].forEach(i=>{
      const b = h(`<button type="button" class="nb-size ${board.state.size===i?'on':''}" aria-label="Espessura ${i+1}"><i style="width:${5+i*5}px;height:${5+i*5}px"></i></button>`);
      b.onclick = ()=>{ board.setSize(i); paintSizes(); };
      sizesBox.appendChild(b);
    });
  }
  NOTE_TOOLS.filter(t=>tools.includes(t[0])).forEach(([id,ico,label])=>{
    const b = h(`<button type="button" class="nb-tool ${board.state.tool===id?'on':''}" data-t="${id}" title="${label}" aria-label="${label}"><span>${ico}</span><small>${label.split(' ')[0]}</small></button>`);
    b.onclick = ()=>{ board.setTool(id); toolsBox.querySelectorAll('.nb-tool').forEach(x=>x.classList.toggle('on', x.dataset.t===id)); paintColors(); };
    toolsBox.appendChild(b);
  });
  paintColors(); paintSizes();
  return bar;
}

/* ---------- tela: lista de páginas do caderno ---------- */
function notebookScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('✏️ Caderno', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const list = notesIndex();
  let filter = state.noteFilter || 'all';
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 14px;">Escreva à mão como numa mesa digitalizadora: com o dedo ou com uma caneta (stylus). Use dois dedos pra mover e dar zoom.</p>`));
  const newBtn = h(`<button class="btn primary" style="width:100%; margin-bottom:14px">＋ Nova página</button>`);
  newBtn.onclick = ()=> chooseNewPage();
  c.appendChild(newBtn);

  const used = [...new Set(list.map(n=>n.subjectId).filter(Boolean))];
  if(used.length){
    const chips = h(`<div class="subj-chip-grid" style="margin-bottom:14px"></div>`);
    [['all','Todas'], ['none','Sem assunto'], ...used.map(id=>{ const s = SUBJECTS.find(x=>x.id===id); return [id, s ? s.name : id]; })].forEach(([id,label])=>{
      const b = h(`<button type="button" class="subj-chip ${filter===id?'active':''}" style="padding:7px 12px"></button>`);
      b.textContent = label;
      b.onclick = ()=>{ state.noteFilter = id; render(); };
      chips.appendChild(b);
    });
    c.appendChild(chips);
  }
  const shown = list.filter(n=> filter==='all' ? true : filter==='none' ? !n.subjectId : n.subjectId===filter)
    .sort((a,b)=>(b.updated||0)-(a.updated||0));
  if(!shown.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma página ainda.<br>Toque em <b>Nova página</b> pra começar a anotar. 📝</div>`));
  } else {
    const grid = h(`<div class="nb-grid"></div>`);
    shown.forEach(n=>{
      const s = n.subjectId ? SUBJECTS.find(x=>x.id===n.subjectId) : null;
      const d = new Date(n.updated||n.created||Date.now());
      const card = h(`<button type="button" class="nb-card"><div class="nb-thumb">${n.thumb?`<img src="${n.thumb}" alt="">`:''}</div><div class="nb-t"></div><div class="nb-s">${s?`${s.sym} ${escHTML(s.name)} · `:''}${fmtDM(d)}</div></button>`);
      card.querySelector('.nb-t').textContent = n.title || 'Sem título';
      card.onclick = ()=> go('notePage', {noteId:n.id});
      grid.appendChild(card);
    });
    c.appendChild(grid);
  }
  wrap.appendChild(c);
  return wrap;
}
function chooseNewPage(subjectId){
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="gm-modal"><h2 style="font-size:20px">Escolha o papel</h2><div class="nb-papers"></div>
    <button type="button" class="nb-cancel" style="margin-top:12px;background:rgba(255,255,255,.1);color:#fff">Cancelar</button></div>`;
  const box = bg.querySelector('.nb-papers');
  NOTE_BGS.forEach(([id,label])=>{
    const b = h(`<button type="button" class="nb-paper"><canvas width="90" height="127"></canvas><span>${label}</span></button>`);
    const cx = b.querySelector('canvas').getContext('2d'); cx.scale(90/NOTE_W, 90/NOTE_W); drawNoteBg(cx, id);
    b.onclick = ()=>{ bg.remove(); const p = newNotePage({bg:id, subjectId}); go('notePage', {noteId:p.id}); };
    box.appendChild(b);
  });
  bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}

/* ---------- tela: editar uma página ---------- */
let _noteBoard = null;
function notePageScreen(){
  if(_noteBoard){ _noteBoard.destroy(); _noteBoard = null; }
  const page = loadNotePage(state.noteId);
  const wrap = h(`<div class="nb-editor"></div>`);
  if(!page){ setTimeout(()=>go('notebook'), 0); return wrap; }
  let saveTimer = 0;
  const saveSoon = ()=>{ clearTimeout(saveTimer); saveTimer = setTimeout(()=>saveNotePage(page), 500); paintUndo(); };

  const head = h(`<div class="nb-head">
    <button class="back-btn" aria-label="Voltar">‹</button>
    <input class="nb-title" maxlength="60" aria-label="Título da página">
    <button type="button" class="nb-icon nb-undo" aria-label="Desfazer" title="Desfazer">↶</button>
    <button type="button" class="nb-icon nb-redo" aria-label="Refazer" title="Refazer">↷</button>
    <button type="button" class="nb-icon nb-more" aria-label="Mais opções" title="Mais opções">⋯</button>
  </div>`);
  const title = head.querySelector('.nb-title'); title.value = page.title;
  title.oninput = ()=>{ page.title = title.value.trim() || 'Sem título'; saveSoon(); };
  head.querySelector('.back-btn').onclick = ()=>{ clearTimeout(saveTimer); saveNotePage(page); go('notebook'); };
  wrap.appendChild(head);

  const area = h(`<div class="nb-area"></div>`);
  const hint = h(`<div class="nb-hint"></div>`);
  const board = createBoard(area, page, saveSoon);
  _noteBoard = board;
  const toolbar = boardToolbar(board);
  wrap.appendChild(toolbar);
  wrap.appendChild(area);
  area.appendChild(hint);
  function showHint(t){ hint.textContent = t; hint.classList.add('on'); clearTimeout(showHint._t); showHint._t = setTimeout(()=>hint.classList.remove('on'), 2200); }
  board.onPenDetected = ()=> showHint('✒️ Caneta detectada: agora o dedo só move a página');
  board.onZoom = z=> showHint(`🔍 ${Math.round(z*100)}%`);
  function paintUndo(){ head.querySelector('.nb-undo').disabled = !board.canUndo(); head.querySelector('.nb-redo').disabled = !board.canRedo(); }
  head.querySelector('.nb-undo').onclick = ()=>{ board.undo(); saveSoon(); };
  head.querySelector('.nb-redo').onclick = ()=>{ board.redo(); saveSoon(); };
  paintUndo();

  head.querySelector('.nb-more').onclick = ()=>{
    const bg = document.createElement('div');
    bg.className = 'gm-modal-bg sheet';
    const s = page.subjectId ? SUBJECTS.find(x=>x.id===page.subjectId) : null;
    bg.innerHTML = `<div class="gm-modal nb-menu"><h2 style="font-size:20px">Opções da página</h2>
      <div class="nb-sec">Papel</div><div class="nb-bgs"></div>
      <div class="nb-sec">Assunto</div><select class="nb-subj"><option value="">Sem assunto</option>${SUBJECTS.map(x=>`<option value="${x.id}" ${s&&s.id===x.id?'selected':''}>${escHTML(x.name)}</option>`).join('')}</select>
      <button type="button" class="nb-m nb-pen ${board.state.penOnly?'on':''}">✒️ Só caneta (o dedo só move a página): ${board.state.penOnly?'ligado':'desligado'}</button>
      <button type="button" class="nb-m nb-zoom">🔍 Voltar o zoom ao normal</button>
      <button type="button" class="nb-m nb-share">📤 Salvar / compartilhar como imagem</button>
      <button type="button" class="nb-m nb-clear">🧹 Limpar a página</button>
      <button type="button" class="nb-m nb-del">🗑️ Excluir a página</button>
      <button type="button" class="nb-cancel" style="margin-top:10px;background:rgba(255,255,255,.1);color:#fff">Fechar</button></div>`;
    const bgs = bg.querySelector('.nb-bgs');
    NOTE_BGS.forEach(([id,label])=>{
      const b = h(`<button type="button" class="nb-chip ${page.bg===id?'on':''}">${label}</button>`);
      b.onclick = ()=>{ board.setBg(id); bgs.querySelectorAll('.nb-chip').forEach(x=>x.classList.remove('on')); b.classList.add('on'); saveSoon(); };
      bgs.appendChild(b);
    });
    bg.querySelector('.nb-subj').onchange = e=>{ page.subjectId = e.target.value || null; saveSoon(); };
    bg.querySelector('.nb-pen').onclick = e=>{ board.setPenOnly(!board.state.penOnly); e.target.textContent = `✒️ Só caneta (o dedo só move a página): ${board.state.penOnly?'ligado':'desligado'}`; };
    bg.querySelector('.nb-zoom').onclick = ()=>{ board.resetZoom(); bg.remove(); };
    bg.querySelector('.nb-share').onclick = ()=>{ saveNotePage(page); shareNotePage(page); };
    bg.querySelector('.nb-clear').onclick = ()=>{ bg.remove(); showConfirm({icon:'🧹', title:'Limpar a página?', message:'Tudo o que está escrito nela vai sumir (dá pra desfazer com ↶).', ok:'Limpar', cancel:'Cancelar', danger:true}).then(ok=>{ if(ok){ board.clear(); saveSoon(); } }); };
    bg.querySelector('.nb-del').onclick = ()=>{ bg.remove(); showConfirm({icon:'🗑️', title:'Excluir a página?', message:'Ela some do caderno e não dá pra desfazer.', ok:'Excluir', cancel:'Cancelar', danger:true}).then(ok=>{ if(ok){ clearTimeout(saveTimer); deleteNotePage(page.id); go('notebook'); } }); };
    bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
    bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
    document.body.appendChild(bg);
  };
  return wrap;
}

/* ---------- rascunho rápido durante as questões ---------- */
function openScratchPad(ex){
  const page = {bg:'grid', strokes:[]};
  const root = h(`<div class="nb-scratch" role="dialog" aria-label="Rascunho">
    <div class="nb-head">
      <div class="nb-sq"></div>
      <button type="button" class="nb-icon nb-undo" aria-label="Desfazer">↶</button>
      <button type="button" class="nb-icon nb-clr" aria-label="Limpar">🧹</button>
      <button type="button" class="nb-icon nb-keep" aria-label="Salvar no caderno" title="Salvar no caderno">💾</button>
      <button type="button" class="nb-icon nb-x" aria-label="Fechar rascunho">✕</button>
    </div>
  </div>`);
  root.querySelector('.nb-sq').textContent = '✏️ Rascunho · ' + (speechText(ex) ? String(ex.question||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,80) : '');
  const area = h(`<div class="nb-area"></div>`);
  document.body.appendChild(root);
  const board = createBoard(area, page, ()=>{});
  root.appendChild(boardToolbar(board, {tools:['pen','eraser','line','text'], colors:NOTE_COLORS.slice(0,4)}));
  root.appendChild(area);
  const close = ()=>{ board.destroy(); root.remove(); };
  root.querySelector('.nb-x').onclick = close;
  root.querySelector('.nb-undo').onclick = ()=> board.undo();
  root.querySelector('.nb-clr').onclick = ()=> board.clear();
  root.querySelector('.nb-keep').onclick = ()=>{
    if(!page.strokes.length){ showFloat('O rascunho está vazio'); return; }
    const sid = state.session && (state.session.currentSubjectId || state.session.subjectId);
    newNotePage({title:'Rascunho · ' + fmtDM(new Date()), subjectId: sid || null, bg:'grid', strokes: page.strokes.slice()});
    queueToast('💾', 'Salvo no caderno!', 'Veja em Caderno, nos atalhos do Início');
  };
}
function questionTools(card){
  let box = card.querySelector('.qc-tools');
  if(!box){ box = h(`<div class="qc-tools"></div>`); card.appendChild(box); card.classList.add('has-tools'); }
  return box;
}
function addScratchButton(card, ex){
  const b = h(`<button type="button" class="tts-btn" aria-label="Abrir rascunho" title="Rascunho: faça a conta à mão">✏️</button>`);
  b.onclick = e=>{ e.stopPropagation(); openScratchPad(ex); };
  questionTools(card).appendChild(b);
}

/* ---------------- DUELO A DOIS (mesmo aparelho) ----------------
   Tela dividida: o jogador de cima vê tudo de cabeça pra baixo, pra jogar frente a frente
   com o celular deitado na mesa. Mesma conta pros dois; quem tocar primeiro na certa
   leva o ponto. Errou? Fica travado até a próxima conta. */
const DUEL_ROUNDS = 10;
function duelScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Duelo a dois', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  let level = 0, names = ['Jogador 1','Jogador 2'];
  try{ const saved = JSON.parse(localStorage.getItem('mathstudy-duel-names')||'null'); if(Array.isArray(saved)) names = saved; }catch(e){}

  c.appendChild(h(`<div class="lt-start"><div class="big">⚔️</div><h2>Duelo a dois</h2><p>Dois jogadores no mesmo celular, frente a frente. Deite o aparelho na mesa: cada um fica com uma metade da tela. Quem acertar primeiro leva o ponto! São ${DUEL_ROUNDS} contas.</p></div>`));
  const form = h(`<div class="answer-form">
    <div><label>Jogador de baixo</label><input class="duel-n1" maxlength="14" aria-label="Nome do jogador de baixo"></div>
    <div><label>Jogador de cima</label><input class="duel-n2" maxlength="14" aria-label="Nome do jogador de cima"></div>
  </div>`);
  form.querySelector('.duel-n1').value = names[0]; form.querySelector('.duel-n2').value = names[1];
  c.appendChild(form);
  c.appendChild(h(`<h3 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-soft);font-weight:600;margin:6px 0 8px;letter-spacing:.08em;">Nível das contas</h3>`));
  const lvRow = h(`<div class="diff-row"></div>`);
  [['Fácil',0],['Médio',8],['Difícil',16]].forEach(([label,v],i)=>{
    const chip = h(`<button type="button" class="diff-chip ${i===0?'active':''}">${label}</button>`);
    chip.onclick = ()=>{ level = v; lvRow.querySelectorAll('.diff-chip').forEach(x=>x.classList.remove('active')); chip.classList.add('active'); };
    lvRow.appendChild(chip);
  });
  c.appendChild(lvRow);
  const start = h(`<button class="btn primary" style="width:100%">Começar duelo ⚔️</button>`);
  start.onclick = ()=>{
    names = [form.querySelector('.duel-n1').value.trim()||'Jogador 1', form.querySelector('.duel-n2').value.trim()||'Jogador 2'];
    try{ localStorage.setItem('mathstudy-duel-names', JSON.stringify(names)); }catch(e){}
    runDuel(names, level);
  };
  c.appendChild(start);
  return wrap;
}
function runDuel(names, level){
  const score = [0,0];
  let round = 0, q = null, locked = [false,false], done = false;
  const root = h(`<div class="duel-root" role="application">
    <div class="duel-half top" data-p="1"></div>
    <div class="duel-mid"><span class="duel-sc"></span><button type="button" class="duel-quit" aria-label="Sair do duelo">✕</button></div>
    <div class="duel-half bottom" data-p="0"></div>
  </div>`);
  const halves = [root.querySelector('.bottom'), root.querySelector('.top')];
  const sc = root.querySelector('.duel-sc');
  root.querySelector('.duel-quit').onclick = ()=>{ done = true; root.remove(); };
  document.body.appendChild(root);

  function paintScore(){ sc.textContent = `${names[0]} ${score[0]} × ${score[1]} ${names[1]} · ${Math.min(round+1,DUEL_ROUNDS)}/${DUEL_ROUNDS}`; }
  function next(){
    if(done) return;
    if(round >= DUEL_ROUNDS) return finish();
    q = boltQuestion(level + round); locked = [false,false];
    paintScore();
    halves.forEach((el,p)=>{
      el.innerHTML = `<div class="duel-name">${escHTML(names[p])} · ${score[p]} pts</div><div class="duel-q mono">${q.text} = ?</div><div class="duel-opts"></div>`;
      const box = el.querySelector('.duel-opts');
      q.opts.forEach(v=>{
        const b = h(`<button type="button" class="duel-opt mono">${v}</button>`);
        b.onclick = ()=> answer(p, v, b);
        box.appendChild(b);
      });
    });
  }
  function answer(p, v, btn){
    if(done || locked[p] || locked[2]) return;
    if(v === q.ans){
      locked[2] = true; score[p]++; paintScore();
      btn.classList.add('ok');
      halves[p].classList.add('win'); halves[1-p].classList.add('lose');
      playTones([660,990], 0.06, 'triangle', 0.08);
      halves[1-p].querySelectorAll('.duel-opt').forEach(b=>{ if(Number(b.textContent)===q.ans) b.classList.add('ok'); });
      setTimeout(()=>{ halves.forEach(x=>x.classList.remove('win','lose')); round++; next(); }, 1100);
    } else {
      locked[p] = true; btn.classList.add('bad'); halves[p].classList.add('lock');
      playTones([220], 0.12, 'sawtooth', 0.05);
      if(locked[0] && locked[1]){ locked[2] = true; setTimeout(()=>{ halves.forEach(x=>x.classList.remove('lock')); round++; next(); }, 1100); }
      else setTimeout(()=> halves[p].classList.remove('lock'), 1100);
    }
  }
  function finish(){
    const w = score[0]===score[1] ? -1 : (score[0]>score[1] ? 0 : 1);
    halves.forEach((el,p)=>{
      el.innerHTML = `<div class="duel-end"><div class="big">${w===-1?'🤝':w===p?'🏆':'💪'}</div><div class="duel-q">${w===-1?'Empate!':w===p?'Você venceu!':'Quase! Revanche?'}</div><div class="duel-name">${score[p]} × ${score[1-p]}</div><div class="duel-actions"><button type="button" class="duel-opt again">Revanche</button><button type="button" class="duel-opt exit">Sair</button></div></div>`;
      el.querySelector('.again').onclick = ()=>{ score[0]=score[1]=0; round=0; next(); };
      el.querySelector('.exit').onclick = ()=>{ done = true; root.remove(); };
    });
    sc.textContent = w===-1 ? 'Empate!' : `${names[w]} venceu!`;
    launchConfetti(140);
    gameTouchDay();
    const gd = loadGame(); gd.duels = (gd.duels||0) + 1; gameUnlock('duelist');
    saveGame();
  }
  next();
}

/* ---------------- CERTIFICADOS ----------------
   Cada episódio da trilha concluído (grande final vencida) libera um certificado
   que dá pra imprimir ou salvar em PDF. */
function completedUnits(){
  const done = pathDone(), all = allPathNodes();
  return SUBJECTS.filter(s=>all.filter(n=>n.subject.id===s.id).every(n=>done[n.key]));
}
function certificatesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📜 Certificados', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const units = completedUnits();
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:14px; margin:2px 0 16px;">Vença a <b>Grande final</b> de um episódio da Trilha pra ganhar o certificado daquele assunto. Dá pra imprimir ou salvar em PDF.</p>`));
  SUBJECTS.forEach(s=>{
    const got = units.includes(s);
    const row = h(`<button class="subject-row" ${got?'':'disabled style="opacity:.5"'}><span class="sym">${got?'📜':'🔒'}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${got?'Certificado liberado · toque pra ver':'Complete o episódio na Trilha'}</span></span><span class="chev">›</span></button>`);
    if(got) row.onclick = ()=> go('certificate', {subjectId:s.id});
    c.appendChild(row);
  });
  wrap.appendChild(c);
  return wrap;
}
function certificateScreen(){
  const s = SUBJECTS.find(x=>x.id===state.subjectId) || SUBJECTS[0];
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Certificado', true, ()=>go('certificates')));
  const c = h(`<div class="content"></div>`);
  const name = currentUser ? currentUser.name : '';
  const g = loadGame();
  const when = new Date(); const dt = `${String(when.getDate()).padStart(2,'0')}/${String(when.getMonth()+1).padStart(2,'0')}/${when.getFullYear()}`;
  const cert = h(`<div class="cert">
    <div class="cert-in">
      <img src="${LOGO_URI}" alt="" class="cert-logo">
      <div class="cert-k">Matemática Show</div>
      <h2>Certificado de Conclusão</h2>
      <p>Certificamos que</p>
      <div class="cert-name"></div>
      <p>concluiu com sucesso o episódio</p>
      <div class="cert-subj">${s.sym} ${escHTML(s.name)}</div>
      <p class="cert-small">passando pelas fases fácil, média e difícil e vencendo a Grande final.<br>Nível ${levelInfo(g.xp).level} · ${escHTML(levelInfo(g.xp).title)}</p>
      <div class="cert-foot"><span>${dt}</span><span>🎤 Pi, o apresentador</span></div>
    </div>
  </div>`);
  cert.querySelector('.cert-name').textContent = name || 'Estudante';
  c.appendChild(cert);
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:16px"></div>`);
  const pr = h(`<button class="btn primary">🖨️ Imprimir / PDF</button>`);
  pr.onclick = ()=> window.print();
  actions.appendChild(pr);
  c.appendChild(actions);
  wrap.appendChild(c);
  return wrap;
}

/* ---------------- RELATÓRIO SEMANAL (para pais e professores) ----------------
   Resume os últimos 7 dias a partir do histórico de respostas e compara com os 7 dias
   anteriores. Dá pra compartilhar como texto ou imprimir / salvar em PDF. */
function reportData(hist){
  const DAY = 864e5, today0 = new Date(); today0.setHours(0,0,0,0);
  const start = today0.getTime() - 6*DAY, prevStart = start - 7*DAY;
  const cur = hist.filter(e=>e.ts>=start), prev = hist.filter(e=>e.ts>=prevStart && e.ts<start);
  const days = [];
  for(let i=0;i<7;i++){
    const t0 = start + i*DAY, t1 = t0 + DAY;
    const list = cur.filter(e=>e.ts>=t0 && e.ts<t1);
    days.push({date:new Date(t0), n:list.length, ok:list.filter(e=>e.correct).length});
  }
  const bySubj = {};
  const add = (e, key)=>{ const b = bySubj[e.subjectId] = bySubj[e.subjectId] || {cur:{n:0,ok:0}, prev:{n:0,ok:0}}; b[key].n++; if(e.correct) b[key].ok++; };
  cur.forEach(e=>add(e,'cur')); prev.forEach(e=>add(e,'prev'));
  const acc = l=> l.length ? Math.round(l.filter(e=>e.correct).length/l.length*100) : null;
  const subjects = Object.keys(bySubj).filter(id=>bySubj[id].cur.n>0).map(id=>{
    const s = SUBJECTS.find(x=>x.id===id), b = bySubj[id];
    return {id, name: s ? s.name : id, sym: s ? s.sym : '', n:b.cur.n, pct:Math.round(b.cur.ok/b.cur.n*100), prevPct: b.prev.n ? Math.round(b.prev.ok/b.prev.n*100) : null};
  }).sort((a,b)=>b.n-a.n);
  // histórico guarda só as últimas HISTORY_LIMIT respostas: se ele começa depois do período anterior, a comparação pode estar incompleta
  const oldest = hist.length ? hist[hist.length-1].ts : Date.now();
  return {start:new Date(start), end:today0, days, cur, prev, subjects,
    activeDays: days.filter(d=>d.n>0).length, total:cur.length, pct:acc(cur), prevTotal:prev.length, prevPct:acc(prev),
    strong: subjects.filter(s=>s.n>=5 && s.pct>=80), weak: subjects.filter(s=>s.n>=3 && s.pct<60),
    partialPrev: hist.length>=HISTORY_LIMIT && oldest>prevStart};
}
function fmtDM(d){ return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
function reportTip(r){
  if(!r.total) return 'Nenhuma questão respondida nesta semana. Uma boa meta é praticar 10 minutos por dia: pouco, mas todo dia, funciona melhor do que muito de uma vez.';
  const parts = [];
  if(r.activeDays<=2) parts.push(`Estudou em ${r.activeDays} dia${r.activeDays===1?'':'s'}. Praticar um pouco todo dia ajuda mais a fixar do que estudar tudo de uma vez.`);
  else if(r.activeDays>=5) parts.push(`Ótima constância: estudou em ${r.activeDays} dos 7 dias! 👏`);
  if(r.weak.length) parts.push(`Vale reforçar ${r.weak.map(s=>s.name).join(', ')}: releia a explicação em "Aprender" e faça um Treino personalizado só com ${r.weak.length===1?'esse assunto':'esses assuntos'}.`);
  if(r.strong.length) parts.push(`Está indo muito bem em ${r.strong.map(s=>s.name).join(', ')}. Dá pra tentar o nível difícil.`);
  if(!parts.length) parts.push('Bom ritmo! Continue praticando e use a Revisão do dia pra não esquecer o que já aprendeu.');
  return parts.join(' ');
}
function reportText(r){
  const name = currentUser ? currentUser.name : '';
  const g = loadGame(), lv = levelInfo(g.xp);
  const lines = [
    `📊 Matemática Show — relatório semanal${name?` de ${name}`:''}`,
    `Período: ${fmtDM(r.start)} a ${fmtDM(r.end)}`,
    '',
    `• Dias estudados: ${r.activeDays} de 7`,
    `• Questões respondidas: ${r.total}${r.prevTotal?` (semana anterior: ${r.prevTotal})`:''}`,
    `• Acerto: ${r.pct===null?'—':r.pct+'%'}${r.prevPct!==null?` (semana anterior: ${r.prevPct}%)`:''}`,
    `• Nível ${lv.level} · ofensiva de ${gameStreakNow()} dia${gameStreakNow()===1?'':'s'}`,
  ];
  if(r.subjects.length){ lines.push('', 'Por assunto:'); r.subjects.forEach(s=>lines.push(`• ${s.name}: ${s.n} questões, ${s.pct}% de acerto`)); }
  if(r.strong.length) lines.push('', `✅ Pontos fortes: ${r.strong.map(s=>s.name).join(', ')}`);
  if(r.weak.length) lines.push(`⚠️ Precisa de atenção: ${r.weak.map(s=>s.name).join(', ')}`);
  lines.push('', `💡 ${reportTip(r)}`);
  return lines.join('\n');
}
async function reportScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Relatório semanal', true, ()=>go('profile')));
  const c = h(`<div class="content"></div>`);
  const r = reportData(await loadHistory());
  const name = currentUser ? currentUser.name : '';

  const now = new Date();
  const genAt = `${fmtDM(now)}/${now.getFullYear()}`;
  c.appendChild(h(`<div class="rp-print-only rp-print-top"><b>📊 Matemática Show</b><span>Relatório gerado em ${genAt}</span></div>`));
  const head = h(`<div class="rp-head"><div class="rp-k">Relatório para pais e professores</div><h2></h2><p>Últimos 7 dias · ${fmtDM(r.start)} a ${fmtDM(r.end)}</p></div>`);
  head.querySelector('h2').textContent = name || 'Meu relatório';
  c.appendChild(head);

  const trend = (now, before, unit)=>{
    if(now===null || before===null || !r.prevTotal) return '';
    const d = now - before;
    return `<div class="rp-trend ${d>0?'up':d<0?'down':'same'}">${d>0?'▲':d<0?'▼':'='} ${Math.abs(d)}${unit} vs. semana anterior</div>`;
  };
  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.activeDays}/7</div><div class="lbl">Dias estudados</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${r.total}</div><div class="lbl">Questões</div>${trend(r.total, r.prevTotal, '')}</div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${r.pct===null?'—':r.pct+'%'}</div><div class="lbl">Acerto</div>${trend(r.pct, r.prevPct, ' pts')}</div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">🔥 ${gameStreakNow()}</div><div class="lbl">Ofensiva (dias)</div></div>`));
  c.appendChild(grid);

  c.appendChild(h(`<div class="rp-sec">Questões por dia</div>`));
  const max = Math.max(1, ...r.days.map(d=>d.n));
  const WD = ['dom','seg','ter','qua','qui','sex','sáb'];
  const chart = h(`<div class="rp-days" role="img" aria-label="Questões respondidas por dia: ${r.days.map(d=>`${WD[d.date.getDay()]} ${d.n}`).join(', ')}"></div>`);
  r.days.forEach(d=>{
    chart.appendChild(h(`<div class="rp-day ${d.n?'':'zero'}" title="${fmtDM(d.date)}: ${d.n} questões, ${d.ok} certas"><span class="n">${d.n||''}</span><span class="bar" style="height:${Math.round(d.n/max*72)}%"></span><span class="d">${WD[d.date.getDay()]}</span></div>`));
  });
  c.appendChild(chart);

  c.appendChild(h(`<div class="rp-sec">Por assunto</div>`));
  if(!r.subjects.length){
    c.appendChild(h(`<div class="empty-note">Nenhuma questão respondida nesta semana.</div>`));
  } else r.subjects.forEach(s=>{
    const cls = s.pct>=80 ? '' : s.pct>=60 ? 'mid' : 'low';
    const tr = s.prevPct===null ? '' : ` <span class="rp-trend ${s.pct>s.prevPct?'up':s.pct<s.prevPct?'down':'same'}" style="display:inline">${s.pct>s.prevPct?'▲':s.pct<s.prevPct?'▼':'='}</span>`;
    c.appendChild(h(`<div class="mastery-row"><div class="top"><span class="name">${s.sym} ${escHTML(s.name)}</span><span class="pct">${s.n} q · ${s.pct}%${tr}</span></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${s.pct}%"></div></div></div>`));
  });

  if(r.strong.length || r.weak.length){
    c.appendChild(h(`<div class="rp-sec">Destaques</div>`));
    const ul = h(`<ul class="rp-list"></ul>`);
    if(r.strong.length) ul.appendChild(h(`<li>✅ <b>Pontos fortes:</b> ${r.strong.map(s=>escHTML(s.name)).join(', ')}</li>`));
    if(r.weak.length) ul.appendChild(h(`<li>⚠️ <b>Precisa de atenção:</b> ${r.weak.map(s=>escHTML(s.name)).join(', ')}</li>`));
    c.appendChild(ul);
  }
  c.appendChild(h(`<div class="rp-sec">Sugestão</div>`));
  const tip = h(`<div class="rp-tip"></div>`); tip.textContent = '💡 ' + reportTip(r);
  c.appendChild(tip);
  if(r.partialPrev) c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12px; margin-top:10px;">A comparação com a semana anterior pode estar incompleta: o app guarda só as últimas ${HISTORY_LIMIT} respostas.</p>`));

  c.appendChild(h(`<div class="rp-print-only rp-print-foot">Matemática Show · relatório dos últimos 7 dias (${fmtDM(r.start)} a ${fmtDM(r.end)}) · gerado em ${genAt}</div>`));
  const actions = h(`<div class="cta-row rp-actions" style="margin-top:18px"></div>`);
  const shareBtn = h(`<button class="btn primary">📤 Compartilhar resumo</button>`);
  shareBtn.onclick = async ()=>{
    const text = reportText(r);
    try{ if(navigator.share){ await navigator.share({title:'Relatório semanal — Matemática Show', text}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); queueToast('📋', 'Resumo copiado!', 'Cole no WhatsApp, e-mail ou onde quiser'); }
    catch(e){ showConfirm({icon:'📋', title:'Copie o resumo', message:text, ok:'Ok', cancel:'Fechar'}); }
  };
  const printBtn = h(`<button class="btn secondary">🖨️ Imprimir / PDF</button>`);
  printBtn.onclick = ()=> window.print();
  actions.appendChild(shareBtn); actions.appendChild(printBtn);
  c.appendChild(actions);

  wrap.appendChild(c);
  return wrap;
}

/* ---------- revisão espaçada ----------
   Cada assunto já praticado "vence" depois de um intervalo que cresce com o % de acerto:
   quem erra muito revê amanhã; quem domina, só daqui a uma semana. */
const REVIEW_MIN_ATTEMPTS = 3;
function reviewIntervalDays(acc){ return acc>=0.9 ? 7 : acc>=0.75 ? 4 : acc>=0.5 ? 2 : 1; }
function dueReviewSubjects(progress){
  const now = Date.now();
  return SUBJECTS.filter(s=>{
    const d = progress[s.id];
    if(!d || d.attempted < REVIEW_MIN_ATTEMPTS) return false;
    const acc = d.correct/d.attempted;
    if(!d.last) return acc < 0.75; // dados antigos, sem data: revisa só o que ainda está fraco
    return now - d.last >= reviewIntervalDays(acc)*864e5;
  }).sort((a,b)=>(progress[a.id].correct/progress[a.id].attempted)-(progress[b.id].correct/progress[b.id].attempted));
}
async function startSpacedReview(){
  const progress = await loadProgress();
  const due = dueReviewSubjects(progress).slice(0,4);
  if(!due.length) return;
  startPersonalizedSession({subjectIds: due.map(s=>s.id), difficultyMode:'adaptativa', qty: Math.min(10, Math.max(5, due.length*3)), focusWeak: due.length>1, progress, isReview:true});
}

/* ---------- lembrete de backup ----------
   o progresso fica só neste aparelho; de tempos em tempos lembramos de exportar uma cópia */
const BACKUP_KEY_BASE = 'mathstudy-backup-v1';
const BACKUP_EVERY_DAYS = 14, BACKUP_MIN_ANSWERS = 30;
function backupInfo(){ try{ return JSON.parse(localStorage.getItem(`${BACKUP_KEY_BASE}:${currentUserId()}`)||'{}'); }catch(e){ return {}; } }
function saveBackupInfo(o){ try{ localStorage.setItem(`${BACKUP_KEY_BASE}:${currentUserId()}`, JSON.stringify(Object.assign(backupInfo(), o))); }catch(e){} }
let _backupAskedThisRun = false;
async function maybeAskBackup(){
  if(_backupAskedThisRun || !currentUser) return;
  const progress = await loadProgress();
  const total = Object.values(progress).reduce((a,d)=>a+(d.attempted||0), 0);
  if(total < BACKUP_MIN_ANSWERS) return;
  const info = backupInfo(), now = Date.now();
  if(!info.since){ saveBackupInfo({since: now}); return; } // começa a contar a partir de agora
  const ref = Math.max(info.last||0, info.since||0, info.snooze||0);
  if(now - ref < BACKUP_EVERY_DAYS*864e5) return;
  _backupAskedThisRun = true;
  const ok = await showConfirm({icon:'💾', title:'Guarde uma cópia do seu progresso',
    message:`Você já respondeu ${total} questões! Seu progresso fica salvo só neste aparelho: se limpar o navegador ou trocar de celular, ele se perde. Quer salvar uma cópia agora?`,
    ok:'Salvar cópia', cancel:'Depois'});
  if(ok) exportProgressData(); else saveBackupInfo({snooze: now});
}
