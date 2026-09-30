/* =========================================================
   Modo Relâmpago — 60 segundos, múltipla escolha, contas rápidas.
   Cada acerto vale 1 ponto (+1s); erro tira 3s. Fica mais difícil
   conforme a pontuação sobe.
   ========================================================= */
const BOLT_SECONDS = 60;
function boltQuestion(score){
  const tier = score<5 ? 0 : score<12 ? 1 : score<20 ? 2 : 3;
  const ops = tier===0 ? ['+','−'] : tier===1 ? ['+','−','×'] : ['+','−','×','÷'];
  const op = pick(ops);
  const M = [10,20,50,100][tier], T = [5,9,12,15][tier];
  let a, b, ans;
  if(op==='+'){ a=randInt(1,M); b=randInt(1,M); ans=a+b; }
  else if(op==='−'){ a=randInt(2,M); b=randInt(1,a); ans=a-b; }
  else if(op==='×'){ a=randInt(2,T); b=randInt(2,T); ans=a*b; }
  else { b=randInt(2,T); ans=randInt(2,T); a=b*ans; }
  const opts = new Set([ans]);
  let guard = 0;
  while(opts.size<4 && guard++<50){
    const delta = pick([1,2,3,5,10,b,-1,-2,-3,-5,-10,-b]);
    const v = ans + delta;
    if(v>=0) opts.add(v);
  }
  while(opts.size<4) opts.add(ans+opts.size*7);
  return {text:`${a} ${op} ${b}`, ans, opts:[...opts].sort(()=>Math.random()-.5)};
}
function lightningScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚡ Modo Relâmpago', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  wrap.appendChild(c);
  const g = loadGame();

  function intro(){
    c.innerHTML = '';
    const box = h(`
      <div class="lt-start">
        <div class="big">⚡</div>
        <h2 style="font-size:26px;margin:14px 0 4px">Modo Relâmpago</h2>
        <p style="color:var(--ink-soft);margin:0">Recorde: <b style="color:#E0A000">${g.boltBest} pontos</b></p>
        <div class="lt-rules">⏱️ Você tem <b>${BOLT_SECONDS} segundos</b><br>✅ Acertou: <b>+1 ponto</b> e <b>+1s</b><br>❌ Errou: <b>−3 segundos</b><br>📈 Fica mais difícil a cada acerto!</div>
        <button class="btn primary" style="width:100%;padding:16px;font-size:16px">Começar! 🚀</button>
      </div>`);
    box.querySelector('button').onclick = countdown;
    c.appendChild(box);
  }
  function countdown(){
    let n = 3;
    const tick = ()=>{
      if(!wrap.isConnected) return;
      c.innerHTML = '';
      c.appendChild(h(`<div class="lt-count">${n>0?n:'VAI!'}</div>`));
      playTones([n>0?440:880], 0.12, 'square', 0.06);
      if(n-- > 0) setTimeout(tick, 700); else setTimeout(play, 500);
    };
    tick();
  }
  function play(){
    if(!wrap.isConnected) return;
    let timeLeft = BOLT_SECONDS, score = 0, streak = 0, q = boltQuestion(0), locked = false;
    c.innerHTML = '';
    const top = h(`<div class="lt-top"><span class="lt-timer">⏱ ${timeLeft}s</span><span class="lt-score">⭐ 0</span></div>`);
    const bar = h(`<div class="lt-bar"><i style="width:100%"></i></div>`);
    const qEl = h(`<div class="lt-q"></div>`);
    const optsEl = h(`<div class="lt-opts"></div>`);
    const streakEl = h(`<div class="lt-streak"></div>`);
    c.appendChild(top); c.appendChild(bar); c.appendChild(qEl); c.appendChild(optsEl); c.appendChild(streakEl);
    function paintTime(){
      const t = top.querySelector('.lt-timer');
      t.textContent = `⏱ ${Math.max(0,Math.ceil(timeLeft))}s`;
      t.classList.toggle('low', timeLeft<=10);
      bar.querySelector('i').style.width = Math.max(0, Math.min(100, timeLeft/BOLT_SECONDS*100))+'%';
    }
    function paintQ(){
      qEl.textContent = q.text + ' = ?';
      optsEl.innerHTML = '';
      q.opts.forEach(v=>{
        const b = h(`<button type="button" class="lt-opt">${v}</button>`);
        b.onclick = ()=> answer(v);
        optsEl.appendChild(b);
      });
    }
    function answer(v){
      if(locked) return;
      const ok = v===q.ans;
      qEl.classList.remove('ok','bad'); void qEl.offsetWidth;
      qEl.classList.add(ok?'ok':'bad');
      if(ok){
        score++; streak++; timeLeft += 1;
        playTones([660+Math.min(streak,12)*30, 990+Math.min(streak,12)*30], 0.05, 'triangle', 0.07);
        playFeedbackVibration(true);
      } else {
        streak = 0; timeLeft -= 3;
        playFeedbackSound(false); playFeedbackVibration(false);
      }
      top.querySelector('.lt-score').textContent = `⭐ ${score}`;
      streakEl.textContent = streak>=3 ? `🔥 ${streak} seguidos!` : '';
      paintTime();
      q = boltQuestion(score);
      paintQ();
    }
    paintTime(); paintQ();
    const timer = setInterval(()=>{
      if(!wrap.isConnected){ clearInterval(timer); return; }
      timeLeft -= 0.25;
      paintTime();
      if(timeLeft<=0){ clearInterval(timer); locked = true; finish(score); }
    }, 250);
  }
  function finish(score){
    const gg = loadGame();
    gameTouchDay();
    gg.today.bolts++;
    const record = score > gg.boltBest;
    if(record) gg.boltBest = score;
    const gain = score*3 + (record && score>0 ? 20 : 0);
    if(score>=15) gameUnlock('bolt15');
    if(score>=30) gameUnlock('bolt30');
    if(gain) gameAddXP(gain);
    saveGame();
    if(record && score>0) launchConfetti(160);
    playTones(record ? [523,659,784,1047,1319] : [523,659,784], 0.12, 'triangle', 0.09);
    c.innerHTML = '';
    const end = h(`
      <div class="session-end">
        <div class="gm-stars" style="font-size:58px">${record && score>0 ? '🏆' : score>=10 ? '⚡' : '⏱️'}</div>
        <div class="gm-end-title">${record && score>0 ? 'NOVO RECORDE!' : 'Tempo esgotado!'}</div>
        <div class="big-num">${score} pts</div>
        <p>Seu recorde: ${gg.boltBest} pontos</p>
        <div class="gm-rewards"><span>⭐ +${gain} XP</span></div>
      </div>`);
    c.appendChild(end);
    const actions = h(`<div class="cta-row" style="margin-top:14px"></div>`);
    const again = h(`<button class="btn primary">Jogar de novo ⚡</button>`);
    again.onclick = countdown;
    const home = h(`<button class="btn secondary">Início</button>`);
    home.onclick = ()=> go('home');
    actions.appendChild(again); actions.appendChild(home);
    c.appendChild(actions);
  }
  intro();
  return wrap;
}
