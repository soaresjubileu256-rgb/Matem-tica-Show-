/* =========================================================
   TABUADA — três partes:
   - Estudar: escolhe o número, vê a tabuada com uma dica e o desenho em bolinhas
     (dá pra esconder os resultados e ir revelando, pra se testar)
   - Quadro: a tábua de Pitágoras inteira, pintada com o que você já domina
   - Treinar: 10 perguntas rápidas com teclado grande, tempo, estrelas e recorde
   O que a pessoa acerta e erra fica salvo por conta (TAB_KEY_BASE).
   ========================================================= */
const TAB_KEY_BASE = 'mathstudy-tabuada-v1';
const TAB_TIPS = {
  1:'Todo número vezes 1 é ele mesmo.',
  2:'Vezes 2 é o <b>dobro</b>: some o número com ele mesmo (2 × 8 = 8 + 8).',
  3:'Vezes 3 é o dobro mais uma vez o número (3 × 7 = 14 + 7).',
  4:'Vezes 4 é o <b>dobro do dobro</b> (4 × 6 → 12 → 24).',
  5:'Vezes 5 sempre termina em <b>0 ou 5</b>. É a metade de vezes 10 (5 × 8 = 80 ÷ 2).',
  6:'Vezes 6 é vezes 5 mais uma vez o número (6 × 7 = 35 + 7).',
  7:'Vezes 7 é vezes 5 mais vezes 2 (7 × 8 = 40 + 16).',
  8:'Vezes 8 é o dobro do dobro do dobro (8 × 6 → 12 → 24 → 48).',
  9:'Vezes 9 é vezes 10 menos o número (9 × 7 = 70 − 7). E os algarismos do resultado somam 9!',
  10:'Vezes 10 é só colocar um <b>zero</b> no fim.',
};
const TAB_COLORS = ['#4C7DFF','#0CA678','#F76707','#AE3EC9','#E64980','#1098AD','#2F9E44','#E67700','#E03131','#7048E8'];

function tabData(){
  try{ const d = JSON.parse(localStorage.getItem(`${TAB_KEY_BASE}:${currentUserId()}`)||'{}'); d.facts = d.facts||{}; d.best = d.best||{}; return d; }
  catch(e){ return {facts:{}, best:{}}; }
}
function saveTabData(d){ try{ localStorage.setItem(`${TAB_KEY_BASE}:${currentUserId()}`, JSON.stringify(d)); }catch(e){} }
/* a conta a×b e b×a contam como o mesmo fato */
const tabFactKey = (a,b)=> a<=b ? `${a}x${b}` : `${b}x${a}`;
/* 'ok' = domina, 'bad' = precisa treinar, '' = ainda não treinou */
function tabMastery(d, a, b){
  const f = d.facts[tabFactKey(a,b)];
  if(!f) return '';
  if(f.bad > 0 && f.last===0) return 'bad';
  if(f.ok >= 2 && f.last===1) return 'ok';
  return f.bad > f.ok ? 'bad' : '';
}

function tabState(){
  if(!state.tab) state.tab = {mode:'study', n:2, hide:false, sel:[2], open:null, cell:null};
  return state.tab;
}

function tabuadaScreen(){
  const st = tabState();
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Tabuada', true, ()=>{ tabStopTrain(); go('exercisesSubjects'); }));
  const c = h(`<div class="content tab-wrap"></div>`);
  const seg = h(`<div class="tab-seg" role="tablist">
    <button type="button" data-m="study">📖 Estudar</button>
    <button type="button" data-m="grid">🔢 Quadro</button>
    <button type="button" data-m="train">⚡ Treinar</button></div>`);
  seg.querySelectorAll('button').forEach(b=>{
    b.classList.toggle('on', b.dataset.m===st.mode);
    b.onclick = ()=>{ tabStopTrain(); st.mode = b.dataset.m; render(); };
  });
  c.appendChild(seg);
  if(st.mode==='grid') c.appendChild(tabGridView());
  else if(st.mode==='train') c.appendChild(tabTrainSetup());
  else c.appendChild(tabStudyView());
  wrap.appendChild(c);
  return wrap;
}

/* ---------- escolher o número (1 a 10) ---------- */
function tabPicker(selected, multi, onPick){
  const box = h(`<div class="tab-picker"></div>`);
  for(let n=1;n<=10;n++){
    const b = h(`<button type="button" class="tab-num" style="--c:${TAB_COLORS[n-1]}">${n}</button>`);
    b.classList.toggle('on', selected.includes(n));
    b.onclick = ()=> onPick(n);
    box.appendChild(b);
  }
  return box;
}

/* ---------- Estudar ---------- */
function tabStudyView(){
  const st = tabState(), n = st.n, d = tabData();
  const v = h(`<div class="tab-study"></div>`);
  v.appendChild(tabPicker([n], false, k=>{ st.n = k; st.open = null; render(); }));
  v.appendChild(h(`<div class="tab-hero" style="--c:${TAB_COLORS[n-1]}">
      <div class="th-n">${n}</div>
      <div class="th-txt"><b>Tabuada do ${n}</b><p>💡 ${TAB_TIPS[n]}</p></div>
    </div>`));
  const tools = h(`<div class="tab-tools">
      <label class="tab-switch"><input type="checkbox" ${st.hide?'checked':''}><span class="sw"></span>Esconder resultados</label>
      <span class="tab-hint">${st.hide ? 'Toque pra revelar' : 'Toque numa conta pra ver em bolinhas'}</span></div>`);
  tools.querySelector('input').onchange = e=>{ st.hide = e.target.checked; st.open = null; render(); };
  v.appendChild(tools);
  const list = h(`<div class="tab-list"></div>`);
  for(let k=1;k<=10;k++){
    const m = tabMastery(d, n, k);
    const row = h(`<button type="button" class="tab-row ${m}" style="--c:${TAB_COLORS[n-1]}">
        <span class="tr-q">${n} <i>×</i> ${k} <i>=</i></span>
        <span class="tr-r">${st.hide ? '?' : n*k}</span>
        ${m==='ok' ? '<span class="tr-m" title="Você já domina">✓</span>' : m==='bad' ? '<span class="tr-m" title="Vale treinar">!</span>' : ''}
      </button>`);
    row.onclick = ()=>{
      if(st.hide){ const r = row.querySelector('.tr-r'); if(r.textContent==='?'){ r.textContent = n*k; row.classList.add('shown'); } return; }
      st.open = st.open===k ? null : k; render();
    };
    list.appendChild(row);
    if(!st.hide && st.open===k) list.appendChild(tabDots(n, k));
  }
  v.appendChild(list);
  const go2 = h(`<button type="button" class="btn primary tab-cta">⚡ Treinar a tabuada do ${n}</button>`);
  go2.onclick = ()=>{ st.mode = 'train'; st.sel = [n]; render(); };
  v.appendChild(go2);
  return v;
}
/* n × k em bolinhas: n grupos de k */
function tabDots(n, k){
  const rows = Array.from({length:n}, ()=> `<div class="td-row">${'<i></i>'.repeat(k)}</div>`).join('');
  return h(`<div class="tab-dots" style="--c:${TAB_COLORS[n-1]}">
      <div class="td-grid">${rows}</div>
      <p><b>${n}</b> grupo${n===1?'':'s'} de <b>${k}</b> = ${Array.from({length:n},()=>k).join(' + ')} = <b>${n*k}</b></p>
    </div>`);
}

/* ---------- Quadro (tábua de Pitágoras) ---------- */
function tabGridView(){
  const st = tabState(), d = tabData();
  const v = h(`<div class="tab-gridview"></div>`);
  const info = h(`<div class="tab-info"></div>`);
  const paintInfo = ()=>{
    if(!st.cell){ info.innerHTML = '<span class="ti-muted">Toque numa casa pra ver a conta 👆</span>'; return; }
    const [a,b] = st.cell, f = d.facts[tabFactKey(a,b)];
    info.innerHTML = `<span class="ti-q">${a} × ${b} = <b>${a*b}</b></span>${f ? `<span class="ti-s">Você acertou ${f.ok} de ${f.ok+f.bad}</span>` : '<span class="ti-s">Ainda não treinou</span>'}`;
  };
  v.appendChild(info);
  const grid = h(`<div class="tab-grid"></div>`);
  grid.appendChild(h(`<span class="tg-corner">×</span>`));
  for(let b=1;b<=10;b++) grid.appendChild(h(`<span class="tg-h" data-c="${b}">${b}</span>`));
  for(let a=1;a<=10;a++){
    grid.appendChild(h(`<span class="tg-h" data-r="${a}">${a}</span>`));
    for(let b=1;b<=10;b++){
      const cell = h(`<button type="button" class="tg-c ${tabMastery(d,a,b)} ${a===b?'sq':''}" data-r="${a}" data-c="${b}">${a*b}</button>`);
      cell.onclick = ()=>{ st.cell = [a,b]; paint(); };
      grid.appendChild(cell);
    }
  }
  function paint(){
    const [ra, cb] = st.cell || [0,0];
    grid.querySelectorAll('[data-r],[data-c]').forEach(el=>{
      const r = +el.dataset.r||0, cc = +el.dataset.c||0;
      el.classList.toggle('hl', (r && r===ra && (!cc || cc<=cb)) || (cc && cc===cb && (!r || r<=ra)));
      el.classList.toggle('pick', r===ra && cc===cb);
    });
    paintInfo();
  }
  paint();
  v.appendChild(grid);
  const total = 55, facts = Object.keys(d.facts).filter(k=>{ const [a,b] = k.split('x').map(Number); return tabMastery(d,a,b)==='ok'; }).length;
  v.appendChild(h(`<div class="tab-legend"><span><i class="lg ok"></i>Já domina</span><span><i class="lg bad"></i>Vale treinar</span><span><i class="lg sq"></i>Quadrados</span></div>`));
  v.appendChild(h(`<div class="tab-progress"><div class="tp-top"><b>Você domina ${facts} de ${total} contas</b><span>${Math.round(facts/total*100)}%</span></div><div class="tp-bar"><i style="width:${Math.round(facts/total*100)}%"></i></div><p>Cada conta vale nos dois sentidos: 3 × 7 é o mesmo que 7 × 3.</p></div>`));
  return v;
}

/* ---------- Treinar ---------- */
let _tabTrain = null;
function tabStopTrain(){ if(_tabTrain){ clearInterval(_tabTrain.timer); _tabTrain = null; } }
function tabTrainSetup(){
  const st = tabState(), d = tabData();
  const v = h(`<div class="tab-train"></div>`);
  if(!st.sel || !st.sel.length) st.sel = [st.n];
  v.appendChild(h(`<div class="tab-sub">Quais tabuadas você quer treinar?</div>`));
  v.appendChild(tabPicker(st.sel, true, n=>{
    const i = st.sel.indexOf(n);
    if(i>=0){ if(st.sel.length>1) st.sel.splice(i,1); } else st.sel.push(n);
    render();
  }));
  const quick = h(`<div class="tab-quick">
      <button type="button" data-q="all">Todas</button><button type="button" data-q="easy">1, 2, 5 e 10</button><button type="button" data-q="hard">6, 7, 8 e 9</button></div>`);
  quick.querySelectorAll('button').forEach(b=> b.onclick = ()=>{
    st.sel = b.dataset.q==='all' ? [1,2,3,4,5,6,7,8,9,10] : b.dataset.q==='easy' ? [1,2,5,10] : [6,7,8,9]; render();
  });
  v.appendChild(quick);
  const key = [...st.sel].sort((a,b)=>a-b).join(',');
  const best = d.best[key];
  v.appendChild(h(`<div class="tab-start-card">
      <div class="ts-ico">⚡</div>
      <div class="ts-txt"><b>10 perguntas rápidas</b><p>Tabuada${st.sel.length>1?'s':''} do ${[...st.sel].sort((a,b)=>a-b).join(', ')}${best ? ` · 🏆 recorde: ${best}s` : ''}</p></div>
    </div>`));
  const start = h(`<button type="button" class="btn primary tab-cta">Começar ▶</button>`);
  start.onclick = ()=> tabStartTrain(v, st.sel.slice());
  v.appendChild(start);
  return v;
}
/* sorteia as perguntas, com mais chance pras contas que a pessoa erra */
function tabMakeQuestions(sel, only){
  const d = tabData(), pool = [];
  if(only) only.forEach(([a,b])=> pool.push([a,b,1]));
  else sel.forEach(a=>{ for(let b=1;b<=10;b++){ const f = d.facts[tabFactKey(a,b)]; const w = f ? 1 + Math.min(4, f.bad*2) - (f.ok>=3 && !f.bad ? 0.5 : 0) : 1.5; pool.push([a,b,w]); } });
  const qs = [], want = only ? Math.min(10, Math.max(3, only.length*2)) : 10;
  let last = '';
  while(qs.length < want){
    const total = pool.reduce((s,p)=>s+p[2],0);
    let r = Math.random()*total, pick = pool[0];
    for(const p of pool){ r -= p[2]; if(r<=0){ pick = p; break; } }
    const k = `${pick[0]}x${pick[1]}`;
    if(k===last && pool.length>1) continue;
    last = k;
    // às vezes inverte a ordem (7 × 3 / 3 × 7), pra treinar dos dois jeitos
    qs.push(Math.random()<0.3 && !only ? [pick[1], pick[0]] : [pick[0], pick[1]]);
  }
  return qs;
}
function tabStartTrain(host, sel, only){
  tabStopTrain();
  const t = _tabTrain = {sel, qs:tabMakeQuestions(sel, only), i:0, ok:0, wrong:[], typed:'', t0:Date.now(), locked:false, only:!!only};
  host.innerHTML = '';
  const ui = h(`<div class="tab-play">
      <div class="tp-head"><span class="tp-count"></span><span class="tp-time">⏱ 0s</span></div>
      <div class="tp-bar"><i></i></div>
      <div class="tp-card"><div class="tp-q"></div><div class="tp-a"></div><div class="tp-fb"></div></div>
      <div class="tp-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-k="${n}">${n}</button>`).join('')}<button type="button" data-k="⌫" class="fn" aria-label="Apagar">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="ok">OK</button></div>
    </div>`);
  host.appendChild(ui);
  const $ = s=> ui.querySelector(s);
  t.timer = setInterval(()=>{ if(!document.body.contains(ui)){ tabStopTrain(); return; } $('.tp-time').textContent = `⏱ ${Math.floor((Date.now()-t.t0)/1000)}s`; }, 250);
  const paint = ()=>{
    const [a,b] = t.qs[t.i];
    $('.tp-count').textContent = `Pergunta ${t.i+1} de ${t.qs.length}`;
    $('.tp-bar i').style.width = `${t.i/t.qs.length*100}%`;
    $('.tp-q').innerHTML = `${a} <i>×</i> ${b} <i>=</i>`;
    $('.tp-a').textContent = t.typed || '?';
    $('.tp-a').classList.toggle('empty', !t.typed);
  };
  const press = k=>{
    if(t.locked || _tabTrain!==t) return;
    if(k==='⌫') t.typed = t.typed.slice(0,-1);
    else if(k==='ok'){ if(t.typed) check(); return; }
    else if(t.typed.length < 3) t.typed += k;
    paint();
  };
  const check = ()=>{
    const [a,b] = t.qs[t.i], right = a*b, ok = +t.typed===right;
    const d = tabData(), key = tabFactKey(a,b), f = d.facts[key] = d.facts[key] || {ok:0, bad:0, last:0};
    if(ok){ f.ok++; f.last = 1; t.ok++; } else { f.bad++; f.last = 0; t.wrong.push([a,b]); }
    saveTabData(d);
    giveAnswerFeedback(ok);
    const card = $('.tp-card');
    card.classList.remove('good','bad'); void card.offsetWidth; card.classList.add(ok ? 'good' : 'bad');
    $('.tp-fb').innerHTML = ok ? '✓ Isso!' : `A resposta é <b>${right}</b>`;
    t.locked = true;
    setTimeout(()=>{
      if(_tabTrain!==t) return;
      t.locked = false; t.typed = ''; t.i++;
      card.classList.remove('good','bad'); $('.tp-fb').textContent = '';
      if(t.i >= t.qs.length) tabFinishTrain(host, t); else paint();
    }, ok ? 550 : 1500);
  };
  ui.querySelectorAll('.tp-pad button').forEach(b=> b.onclick = ()=> press(b.dataset.k));
  t.key = e=>{
    if(_tabTrain!==t || !document.body.contains(ui)){ document.removeEventListener('keydown', t.key); return; }
    if(/^\d$/.test(e.key)) press(e.key); else if(e.key==='Backspace') press('⌫'); else if(e.key==='Enter') press('ok'); else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', t.key);
  paint();
}
function tabFinishTrain(host, t){
  tabStopTrain();
  document.removeEventListener('keydown', t.key);
  const secs = Math.max(1, Math.round((Date.now()-t.t0)/1000));
  const N = t.qs.length, frac = t.ok/N;
  const stars = t.ok===N ? (secs <= N*4 ? 3 : 2) : frac>=0.7 ? 2 : frac>=0.4 ? 1 : 0;
  const d = tabData(), key = [...t.sel].sort((a,b)=>a-b).join(',');
  let record = false;
  if(!t.only && t.ok===N && (!d.best[key] || secs < d.best[key])){ d.best[key] = secs; record = true; saveTabData(d); }
  const xp = t.ok*2;
  if(xp){ gameAddXP(xp); saveGame(); }
  const msg = t.ok===N ? 'Perfeito! 🎉' : frac>=0.7 ? 'Muito bem! 👏' : frac>=0.4 ? 'Bom treino! 💪' : 'Continue treinando! 🌱';
  host.innerHTML = '';
  const res = h(`<div class="tab-result">
      <div class="tr-stars">${[1,2,3].map(i=>`<span class="${i<=stars?'on':''}" style="--k:${i}">★</span>`).join('')}</div>
      <h2>${msg}</h2>
      <div class="tr-stats">
        <div><b>${t.ok}/${N}</b><span>acertos</span></div>
        <div><b>${secs}s</b><span>tempo</span></div>
        <div><b>+${xp}</b><span>XP</span></div>
      </div>
      ${record ? '<div class="tr-record">🏆 Novo recorde!</div>' : ''}
      ${t.wrong.length ? `<div class="tr-wrong"><div class="tab-sub">Pra revisar</div>${t.wrong.map(([a,b])=>`<span>${a} × ${b} = <b>${a*b}</b></span>`).join('')}</div>` : ''}
      <div class="tr-btns">
        ${t.wrong.length ? '<button type="button" class="btn primary" data-a="wrong">🔁 Treinar os erros</button>' : ''}
        <button type="button" class="btn ${t.wrong.length?'secondary':'primary'}" data-a="again">⚡ Treinar de novo</button>
        <button type="button" class="btn secondary" data-a="back">Escolher outras tabuadas</button>
      </div>
    </div>`);
  res.querySelector('[data-a=again]').onclick = ()=> tabStartTrain(host, t.sel);
  res.querySelector('[data-a=back]').onclick = ()=> render();
  const w = res.querySelector('[data-a=wrong]'); if(w) w.onclick = ()=> tabStartTrain(host, t.sel, t.wrong.slice());
  host.appendChild(res);
  if(t.ok===N && typeof launchConfetti==='function') launchConfetti(120);
}
