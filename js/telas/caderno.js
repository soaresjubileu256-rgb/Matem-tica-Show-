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
