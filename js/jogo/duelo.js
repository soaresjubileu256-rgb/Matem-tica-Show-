/* =========================================================
   DUELO A DOIS — dois jogadores no mesmo celular
   Tela dividida: o jogador de cima vê tudo de cabeça pra baixo, pra jogar frente a frente
   com o celular deitado na mesa. Mesma conta pros dois; quem tocar primeiro na certa
   leva o ponto. Errou? Fica travado até a próxima conta. Cada conta tem um tempo:
   se ninguém acertar, ninguém pontua.
   ========================================================= */
const DUEL_TYPES = [
  ['mix','🎲','Misturadas'], ['tab','✖️','Tabuada'], ['addsub','➕','+ e −'], ['muldiv','➗','× e ÷'],
];
const DUEL_LEVELS = [['Fácil',0],['Médio',1],['Difícil',2]];
const DUEL_ROUND_OPTS = [5,10,15];
const DUEL_SECS = [10, 9, 8];          // tempo por conta em cada nível
const DUEL_KEY = 'mathstudy-duel-v2';  // nomes, últimas escolhas e placar entre os jogadores

function duelData(){
  let d = {};
  try{ d = JSON.parse(localStorage.getItem(DUEL_KEY)||'{}'); }catch(e){}
  if(!Array.isArray(d.names)){
    let old = null; try{ old = JSON.parse(localStorage.getItem('mathstudy-duel-names')||'null'); }catch(e){}
    d.names = Array.isArray(old) ? old : ['Jogador 1','Jogador 2'];
  }
  d.type = d.type || 'mix'; d.level = d.level ?? 0; d.rounds = d.rounds || 10; d.record = d.record || {};
  return d;
}
function saveDuelData(d){ try{ localStorage.setItem(DUEL_KEY, JSON.stringify(d)); }catch(e){} }
/* placar entre os dois, não importa quem ficou em cima ou embaixo */
const duelPairKey = names=> names.map(n=>n.trim().toLowerCase()).sort().join('|');

/* opções erradas parecidas com a certa (pra ninguém acertar no chute) */
function duelOptions(ans, spread){
  const opts = new Set([ans]);
  const deltas = [1,-1,2,-2,spread,-spread,10,-10,3,-3,5,-5];
  let guard = 0;
  while(opts.size<4 && guard++<60){ const v = ans + pick(deltas); if(v>=0 && v!==ans) opts.add(v); }
  while(opts.size<4) opts.add(ans + opts.size*7);
  return [...opts].sort(()=>Math.random()-.5);
}
function duelQuestion(type, level, round){
  if(type==='mix') return boltQuestion([0,8,16][level] + round);
  let a, b, op, ans;
  if(type==='tab'){
    const [lo,hi] = [[1,5],[2,9],[3,12]][level];
    a = randInt(lo,hi); b = randInt(lo,hi); op = '×'; ans = a*b;
    return {text:`${a} × ${b}`, ans, opts:duelOptions(ans, Math.max(a,b))};
  }
  if(type==='addsub'){
    const M = [20,100,500][level];
    op = pick(['+','−']);
    if(op==='+'){ a = randInt(1,M); b = randInt(1,M); ans = a+b; } else { a = randInt(2,M); b = randInt(1,a); ans = a-b; }
    return {text:`${a} ${op} ${b}`, ans, opts:duelOptions(ans, 10)};
  }
  const T = [5,9,12][level];
  if(pick([0,1])){ a = randInt(2,T); b = randInt(2,T); return {text:`${a} × ${b}`, ans:a*b, opts:duelOptions(a*b, a)}; }
  b = randInt(2,T); ans = randInt(2,T); a = b*ans;
  return {text:`${a} ÷ ${b}`, ans, opts:duelOptions(ans, 1)};
}

function duelScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Duelo a dois', true, ()=>go('arena')));
  const c = h(`<div class="content duel-setup"></div>`);
  wrap.appendChild(c);
  const d = duelData();

  const vs = h(`<div class="dv-card">
      <div class="dv-p p0"><span class="dv-av"></span><label>Jogador de baixo</label><input class="dv-in" data-p="0" maxlength="14" aria-label="Nome do jogador de baixo"></div>
      <div class="dv-mid"><span class="dv-vs">VS</span><button type="button" class="dv-swap" aria-label="Trocar de lugar" title="Trocar de lugar">⇅</button></div>
      <div class="dv-p p1"><span class="dv-av"></span><label>Jogador de cima</label><input class="dv-in" data-p="1" maxlength="14" aria-label="Nome do jogador de cima"></div>
    </div>`);
  const ins = [...vs.querySelectorAll('.dv-in')];
  const recBox = h(`<div class="dv-record"></div>`);
  const paintAv = p=>{ vs.querySelector(`.p${p} .dv-av`).textContent = (d.names[p].trim()[0]||'?').toUpperCase(); };
  const paintRecord = ()=>{
    const rec = d.record[duelPairKey(d.names)];
    if(!rec){ recBox.innerHTML = '⚔️ Primeiro duelo entre vocês!'; return; }
    const k = d.names.map(n=>n.trim().toLowerCase());
    recBox.innerHTML = `🏆 Placar entre vocês: <b>${escHTML(d.names[0])} ${rec[k[0]]||0}</b> × <b>${rec[k[1]]||0} ${escHTML(d.names[1])}</b>${rec.draws?` · ${rec.draws} empate${rec.draws>1?'s':''}`:''}`;
  };
  const paintNames = ()=>{ ins.forEach((inp,p)=>{ inp.value = d.names[p]; paintAv(p); }); paintRecord(); };
  ins.forEach(inp=> inp.addEventListener('input', ()=>{ const p = +inp.dataset.p; d.names[p] = inp.value.trim() || `Jogador ${p+1}`; paintAv(p); paintRecord(); }));
  vs.querySelector('.dv-swap').onclick = ()=>{ d.names.reverse(); paintNames(); };
  c.appendChild(vs);
  c.appendChild(recBox);
  paintNames();

  const opt = (title, items, cur, set, cls)=>{
    const sec = h(`<div class="dv-sec"><div class="dv-lbl">${title}</div><div class="dv-opts ${cls||''}"></div></div>`);
    const box = sec.querySelector('.dv-opts');
    items.forEach(([label, val])=>{
      const b = h(`<button type="button" class="dv-opt ${val===cur?'on':''}">${label}</button>`);
      b.onclick = ()=>{ set(val); box.querySelectorAll('.dv-opt').forEach(x=>x.classList.remove('on')); b.classList.add('on'); };
      box.appendChild(b);
    });
    return sec;
  };
  c.appendChild(opt('Tipo de conta', DUEL_TYPES.map(([id,ico,l])=>[`<span>${ico}</span>${l}`, id]), d.type, v=>d.type=v, 'types'));
  c.appendChild(opt('Nível', DUEL_LEVELS, d.level, v=>d.level=v));
  c.appendChild(opt('Rodadas', DUEL_ROUND_OPTS.map(n=>[`${n}`, n]), d.rounds, v=>d.rounds=v));
  c.appendChild(h(`<div class="dv-rules">
      <div><span>📱</span><p>Deite o celular na mesa, cada um de um lado.</p></div>
      <div><span>⚡</span><p>Quem tocar primeiro na resposta certa leva o ponto.</p></div>
      <div><span>🔒</span><p>Errou? Fica travado até a próxima conta.</p></div>
      <div><span>⏱</span><p>Cada conta tem um tempo. Se ninguém acertar, ninguém pontua.</p></div>
    </div>`));
  const start = h(`<button class="btn primary dv-start">Começar duelo ⚔️</button>`);
  start.onclick = ()=>{
    d.names = ins.map((inp,p)=> inp.value.trim() || `Jogador ${p+1}`);
    saveDuelData(d);
    runDuel(d.names, {type:d.type, level:d.level, rounds:d.rounds});
  };
  c.appendChild(start);
  return wrap;
}

function runDuel(names, cfg){
  const N = cfg.rounds, SECS = DUEL_SECS[cfg.level];
  const st = {score:[0,0], streak:[0,0], right:[0,0], wrong:[0,0], fast:[null,null], round:0, q:null, locked:[false,false], over:false, done:false, used:new Set(), t0:0, timer:0, quitArm:0};
  const root = h(`<div class="duel-root" role="application">
    <div class="duel-half top p1"></div>
    <div class="duel-mid">
      <span class="dm-sc p0"><b>0</b><small></small></span>
      <div class="dm-c"><span class="dm-round"></span><div class="dm-time"><i></i></div></div>
      <span class="dm-sc p1"><b>0</b><small></small></span>
      <button type="button" class="duel-quit" aria-label="Sair do duelo">✕</button>
    </div>
    <div class="duel-half bottom p0"></div>
  </div>`);
  const halves = [root.querySelector('.bottom'), root.querySelector('.top')];
  const $ = s=> root.querySelector(s);
  root.querySelectorAll('.dm-sc small').forEach((el,i)=> el.textContent = names[i]);
  const quit = $('.duel-quit');
  quit.onclick = ()=>{
    if(st.quitArm && Date.now()-st.quitArm < 2500){ stop(); root.remove(); return; }
    st.quitArm = Date.now(); quit.classList.add('arm'); quit.textContent = 'Sair?';
    setTimeout(()=>{ quit.classList.remove('arm'); quit.textContent = '✕'; }, 2500);
  };
  document.body.appendChild(root);
  const stop = ()=>{ st.done = true; clearInterval(st.timer); };

  function paintScore(){
    root.querySelectorAll('.dm-sc b').forEach((el,i)=> el.textContent = st.score[i]);
    $('.dm-round').textContent = `${Math.min(st.round+1, N)}/${N}`;
  }
  function header(p){
    const pips = Array.from({length:N}, (_,i)=> `<i class="${i<st.score[p]?'on':''}"></i>`).join('');
    return `<div class="dh-top"><span class="dh-name">${escHTML(names[p])}</span><span class="dh-pts">${st.score[p]} pt${st.score[p]===1?'':'s'}</span></div><div class="dh-pips">${pips}</div>`;
  }
  /* contagem 3, 2, 1 antes de começar */
  function countdown(then){
    paintScore();
    let n = 3;
    const tick = ()=>{
      if(st.done) return;
      halves.forEach((el,p)=>{ el.className = `duel-half ${p?'top p1':'bottom p0'}`; el.innerHTML = `<div class="dh-wrap">${header(p)}<div class="duel-count">${n || 'Já!'}</div><div class="duel-tip">${n ? 'Prepare-se…' : ''}</div></div>`; });
      if(n===0){ setTimeout(then, 500); return; }
      playTones([n===1?660:520], 0.08, 'triangle', 0.06);
      n--; setTimeout(tick, 750);
    };
    tick();
  }
  function next(){
    if(st.done) return;
    if(st.round >= N) return finish();
    let q, guard = 0;
    do{ q = duelQuestion(cfg.type, cfg.level, st.round); }while(st.used.has(q.text) && guard++<30);
    st.used.add(q.text); st.q = q; st.locked = [false,false]; st.over = false;
    paintScore();
    halves.forEach((el,p)=>{
      el.className = `duel-half ${p?'top p1':'bottom p0'}`;
      el.innerHTML = `<div class="dh-wrap">${header(p)}<div class="duel-q mono">${q.text} = ?</div><div class="duel-opts"></div><div class="duel-flag"></div></div>`;
      const box = el.querySelector('.duel-opts');
      q.opts.forEach(v=>{
        const b = h(`<button type="button" class="duel-opt mono">${v}</button>`);
        b.addEventListener('pointerdown', e=>{ e.preventDefault(); answer(p, v, b); });
        b.onclick = e=> e.preventDefault();
        box.appendChild(b);
      });
    });
    st.t0 = Date.now();
    const bar = $('.dm-time i'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
    bar.style.transition = `width ${SECS}s linear`; bar.style.width = '0%';
    clearInterval(st.timer);
    st.timer = setInterval(()=>{ if(!document.body.contains(root)){ stop(); return; } if(!st.over && Date.now()-st.t0 >= SECS*1000) timeUp(); }, 200);
  }
  function reveal(){ halves.forEach(el=> el.querySelectorAll('.duel-opt').forEach(b=>{ if(Number(b.textContent)===st.q.ans) b.classList.add('ok'); })); }
  function endRound(delay){
    st.over = true; clearInterval(st.timer);
    const bar = $('.dm-time i'); bar.style.transition = 'none'; bar.style.width = getComputedStyle(bar).width;
    setTimeout(()=>{ if(st.done) return; st.round++; next(); }, delay);
  }
  function timeUp(){
    if(st.over) return;
    reveal();
    halves.forEach(el=>{ el.classList.add('lose'); el.querySelector('.duel-flag').innerHTML = `⏱ Acabou o tempo! Era <b>${st.q.ans}</b>`; });
    st.streak = [0,0];
    endRound(1500);
  }
  function answer(p, v, btn){
    if(st.done || st.over || st.locked[p]) return;
    const ms = Date.now() - st.t0;
    if(v === st.q.ans){
      st.score[p]++; st.right[p]++; st.streak[p]++; st.streak[1-p] = 0;
      if(st.fast[p]===null || ms < st.fast[p]) st.fast[p] = ms;
      btn.classList.add('ok'); reveal();
      halves[p].classList.add('win'); halves[1-p].classList.add('lose');
      const fire = st.streak[p]>=3 ? ` · 🔥 ${st.streak[p]} seguidas!` : '';
      halves[p].querySelector('.duel-flag').innerHTML = `<span class="plus">+1</span> Ponto seu! ⚡${fire}`;
      halves[1-p].querySelector('.duel-flag').innerHTML = `Ponto de ${escHTML(names[p])} · era <b>${st.q.ans}</b>`;
      halves[p].querySelector('.dh-wrap').insertAdjacentHTML('beforeend', '<div class="duel-burst">+1</div>');
      paintScore();
      playTones([660,990], 0.06, 'triangle', 0.08);
      try{ currentSettingsSync().vibration && navigator.vibrate && navigator.vibrate(30); }catch(e){}
      endRound(1300);
    } else {
      st.locked[p] = true; st.wrong[p]++; st.streak[p] = 0;
      btn.classList.add('bad'); halves[p].classList.add('lock');
      halves[p].querySelector('.duel-flag').innerHTML = '🔒 Errou! Travado até a próxima conta';
      playTones([300,240], 0.1, 'sine', 0.06);
      if(st.locked[0] && st.locked[1]){
        reveal();
        halves.forEach(el=> el.querySelector('.duel-flag').innerHTML = `Os dois erraram · era <b>${st.q.ans}</b>`);
        endRound(1500);
      }
    }
  }
  function finish(){
    clearInterval(st.timer);
    const [a,b] = st.score;
    const w = a===b ? -1 : (a>b ? 0 : 1);
    const d = duelData(), key = duelPairKey(names);
    const rec = d.record[key] = d.record[key] || {};
    if(w===-1) rec.draws = (rec.draws||0) + 1; else { const k = names[w].trim().toLowerCase(); rec[k] = (rec[k]||0) + 1; }
    saveDuelData(d);
    const fmtMs = ms=> ms===null ? '—' : `${(ms/1000).toFixed(1).replace('.',',')}s`;
    halves.forEach((el,p)=>{
      el.className = `duel-half ${p?'top p1':'bottom p0'} ${w===p?'champ':''}`;
      el.innerHTML = `<div class="dh-wrap duel-end">
        <div class="big">${w===-1?'🤝':w===p?'🏆':'💪'}</div>
        <div class="de-title">${w===-1?'Empate!':w===p?'Você venceu!':'Quase! Revanche?'}</div>
        <div class="de-score"><b>${st.score[p]}</b><span>×</span><b>${st.score[1-p]}</b></div>
        <div class="de-stats"><span>✓ ${st.right[p]} certas</span><span>✗ ${st.wrong[p]} erradas</span><span>⚡ mais rápida: ${fmtMs(st.fast[p])}</span></div>
        <div class="duel-actions"><button type="button" class="duel-opt again">🔁 Revanche</button><button type="button" class="duel-opt exit">Sair</button></div>
      </div>`;
      el.querySelector('.again').onclick = ()=>{ Object.assign(st, {score:[0,0], streak:[0,0], right:[0,0], wrong:[0,0], fast:[null,null], round:0, used:new Set()}); countdown(next); };
      el.querySelector('.exit').onclick = ()=>{ stop(); root.remove(); render(); };
    });
    $('.dm-round').textContent = w===-1 ? 'Empate!' : `${names[w]} venceu!`;
    $('.dm-time i').style.width = '0%';
    launchConfetti(140);
    gameTouchDay();
    const gd = loadGame(); gd.duels = (gd.duels||0) + 1; gameUnlock('duelist');
    saveGame();
  }
  countdown(next);
}
