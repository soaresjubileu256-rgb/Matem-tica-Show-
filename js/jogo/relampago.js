/* =========================================================
   Modo Relâmpago — 60 segundos, múltipla escolha, contas rápidas.
   Cada acerto vale 1 ponto (+1s); com 5 seguidos vira combo ×2.
   Erro tira 3s e mostra a resposta certa. Fica mais difícil conforme a
   pontuação sobe. Dá pra escolher o tipo de conta; cada tipo tem seu recorde
   (g.boltBests) e g.boltBest guarda o maior de todos (usado em Conquistas/Arena).
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
const BOLT_TYPES = [['mix','🎲','Misturadas'], ['tab','✖️','Tabuada'], ['addsub','➕','+ e −'], ['muldiv','➗','× e ÷']];
/* a conta do Relâmpago: "Misturadas" usa boltQuestion; os outros tipos usam as do Duelo, ficando mais difíceis com a pontuação */
function boltQuestionOf(type, score){
  if(type==='mix') return boltQuestion(score);
  return duelQuestion(type, score<8 ? 0 : score<18 ? 1 : 2, score);
}
function boltBests(g){
  g.boltBests = g.boltBests || {};
  if(g.boltBests.mix==null) g.boltBests.mix = g.boltBest||0;
  return g.boltBests;
}
function lightningScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚡ Modo Relâmpago', true, ()=>go('arena')));
  const c = h(`<div class="content bolt-wrap"></div>`);
  wrap.appendChild(c);
  let type = 'mix';
  try{ type = localStorage.getItem('mathstudy-bolt-type') || 'mix'; }catch(e){}
  if(!BOLT_TYPES.some(t=>t[0]===type)) type = 'mix';

  function intro(){
    const g = loadGame(), bests = boltBests(g);
    c.innerHTML = '';
    const box = h(`<div class="bolt-intro">
        <div class="bi-hero">
          <div class="bi-bolt">⚡</div>
          <div class="bi-txt"><h2>Modo Relâmpago</h2><p>Quantas contas você acerta em ${BOLT_SECONDS} segundos?</p></div>
          <div class="bi-best"><small>Recorde</small><b>${bests[type]||0}</b></div>
        </div>
        <div class="bi-lbl">Tipo de conta</div>
        <div class="bi-types"></div>
        <div class="bi-rules">
          <div><span>✅</span><p><b>Acertou:</b> +1 ponto e +1 segundo</p></div>
          <div><span>❌</span><p><b>Errou:</b> −3 segundos</p></div>
          <div><span>🔥</span><p><b>5 seguidos:</b> combo, cada acerto vale 2</p></div>
          <div><span>📈</span><p>Fica mais difícil a cada acerto</p></div>
        </div>
        <button class="btn primary bi-start">Começar! 🚀</button>
        <p class="bi-keys">No computador, use as teclas 1, 2, 3 e 4.</p>
      </div>`);
    const tbox = box.querySelector('.bi-types');
    BOLT_TYPES.forEach(([id,ico,label])=>{
      const b = h(`<button type="button" class="bi-type ${id===type?'on':''}"><span>${ico}</span><b>${label}</b><small>🏆 ${bests[id]||0}</small></button>`);
      b.onclick = ()=>{ type = id; try{ localStorage.setItem('mathstudy-bolt-type', id); }catch(e){} intro(); };
      tbox.appendChild(b);
    });
    box.querySelector('.bi-start').onclick = countdown;
    c.appendChild(box);
  }
  function countdown(){
    let n = 3;
    const tick = ()=>{
      if(!wrap.isConnected) return;
      c.innerHTML = '';
      c.appendChild(h(`<div class="lt-count ${n>0?'':'go'}">${n>0?n:'VAI!'}</div>`));
      playTones([n>0?440:880], 0.12, 'triangle', 0.06);
      if(n-- > 0) setTimeout(tick, 700); else setTimeout(play, 500);
    };
    tick();
  }
  function play(){
    if(!wrap.isConnected) return;
    const R = 34, CIRC = 2*Math.PI*R;
    const st = {time:BOLT_SECONDS, score:0, streak:0, best:0, right:0, wrong:0, mistakes:[], locked:false, last:'', t0:Date.now()};
    let q = null;
    c.innerHTML = '';
    const ui = h(`<div class="bolt-play">
        <div class="bp-hud">
          <div class="bp-ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="bg"/><circle cx="40" cy="40" r="${R}" class="fg" stroke-dasharray="${CIRC}" stroke-dashoffset="0"/></svg><span class="bp-sec">60</span><i class="bp-delta"></i></div>
          <div class="bp-mid"><div class="bp-combo"></div><div class="bp-streak"></div></div>
          <div class="bp-score"><small>pontos</small><b>0</b></div>
        </div>
        <div class="bp-card"><div class="bp-q mono"></div><div class="bp-fb"></div></div>
        <div class="lt-opts"></div>
      </div>`);
    c.appendChild(ui);
    const $ = s=> ui.querySelector(s);
    const optsEl = $('.lt-opts');
    function paintTime(){
      const t = Math.max(0, st.time);
      $('.bp-sec').textContent = Math.ceil(t);
      $('.bp-ring .fg').style.strokeDashoffset = CIRC * (1 - Math.min(1, t/BOLT_SECONDS));
      ui.classList.toggle('low', t<=10);
    }
    function delta(txt, good){
      const d = $('.bp-delta'); d.textContent = txt; d.className = 'bp-delta ' + (good ? 'good' : 'bad');
      void d.offsetWidth; d.classList.add('show');
    }
    function paintHud(){
      $('.bp-score b').textContent = st.score;
      $('.bp-combo').innerHTML = st.streak>=5 ? '<span>🔥 COMBO ×2</span>' : '';
      $('.bp-streak').innerHTML = st.streak>=2 ? `${st.streak} seguidos` : (st.streak===0 && st.right ? '' : '');
    }
    function newQ(){
      let guard = 0;
      do{ q = boltQuestionOf(type, st.score); }while(q.text===st.last && guard++<10);
      st.last = q.text;
      $('.bp-q').textContent = q.text + ' = ?';
      optsEl.innerHTML = '';
      q.opts.forEach((v,i)=>{
        const b = h(`<button type="button" class="lt-opt"><small>${i+1}</small>${v}</button>`);
        b.addEventListener('pointerdown', e=>{ e.preventDefault(); answer(v, b); });
        b.onclick = e=> e.preventDefault();
        optsEl.appendChild(b);
      });
    }
    function answer(v, btn){
      if(st.locked) return;
      const ok = v===q.ans, card = $('.bp-card');
      card.classList.remove('ok','bad'); void card.offsetWidth; card.classList.add(ok?'ok':'bad');
      if(ok){
        const pts = st.streak>=5 ? 2 : 1;
        st.score += pts; st.streak++; st.right++; st.best = Math.max(st.best, st.streak); st.time += 1;
        delta('+1s', true);
        $('.bp-fb').innerHTML = pts>1 ? '<span class="good">+2 🔥</span>' : '<span class="good">+1</span>';
        playTones([660+Math.min(st.streak,12)*30, 990+Math.min(st.streak,12)*30], 0.05, 'triangle', 0.07);
        playFeedbackVibration(true);
        paintHud(); paintTime(); newQ();
      } else {
        st.streak = 0; st.wrong++; st.time -= 3;
        if(st.mistakes.length<8) st.mistakes.push({q:q.text, ans:q.ans, got:v});
        delta('−3s', false);
        btn.classList.add('bad');
        optsEl.querySelectorAll('.lt-opt').forEach(b=>{ if(Number(b.lastChild.textContent)===q.ans) b.classList.add('right'); });
        $('.bp-fb').innerHTML = `<span class="bad">Era ${q.ans}</span>`;
        playFeedbackSound(false); playFeedbackVibration(false);
        paintHud(); paintTime();
        st.locked = true;
        setTimeout(()=>{ st.locked = false; if(st.time>0 && wrap.isConnected) newQ(); }, 650);
      }
    }
    const onKey = e=>{
      if(!wrap.isConnected || st.time<=0){ document.removeEventListener('keydown', onKey); return; }
      const n = Number(e.key);
      if(n>=1 && n<=4){ const b = optsEl.children[n-1]; if(b){ e.preventDefault(); b.classList.add('press'); setTimeout(()=>b.classList.remove('press'),120); answer(q.opts[n-1], b); } }
    };
    document.addEventListener('keydown', onKey);
    paintTime(); paintHud(); newQ();
    const timer = setInterval(()=>{
      if(!wrap.isConnected){ clearInterval(timer); document.removeEventListener('keydown', onKey); return; }
      st.time -= 0.25;
      paintTime();
      if(st.time<=0){ clearInterval(timer); st.locked = true; document.removeEventListener('keydown', onKey); finish(st); }
    }, 250);
  }
  function finish(st){
    const gg = loadGame(), bests = boltBests(gg);
    const score = st.score;
    gameTouchDay();
    gg.today.bolts++;
    const record = score > (bests[type]||0);
    if(record) bests[type] = score;
    if(score > gg.boltBest) gg.boltBest = score;
    const gain = score*3 + (record && score>0 ? 20 : 0);
    if(score>=15) gameUnlock('bolt15');
    if(score>=30) gameUnlock('bolt30');
    if(gain) gameAddXP(gain);
    saveGame();
    if(record && score>0) launchConfetti(160);
    playTones(record ? [523,659,784,1047,1319] : [523,659,784], 0.12, 'triangle', 0.09);
    const total = st.right + st.wrong, acc = total ? Math.round(st.right/total*100) : 0;
    const mins = (Date.now()-st.t0)/60000, perMin = mins>0 ? Math.round(st.right/mins) : 0;
    const label = (BOLT_TYPES.find(t=>t[0]===type)||[])[2] || '';
    c.innerHTML = '';
    const end = h(`<div class="bolt-end">
        <div class="be-ico">${record && score>0 ? '🏆' : score>=10 ? '⚡' : '⏱️'}</div>
        <div class="be-title">${record && score>0 ? 'NOVO RECORDE!' : 'Tempo esgotado!'}</div>
        <div class="be-score"><b>${score}</b><span>pontos · ${escHTML(label)}</span></div>
        <div class="be-best">🏆 Seu recorde: <b>${bests[type]}</b> · ⭐ +${gain} XP</div>
        <div class="be-stats">
          <div><b>${st.right}</b><span>acertos</span></div>
          <div><b>${acc}%</b><span>precisão</span></div>
          <div><b>${st.best}</b><span>maior sequência</span></div>
          <div><b>${perMin}</b><span>contas/min</span></div>
        </div>
        ${st.mistakes.length ? `<div class="be-wrong"><div class="bi-lbl">Pra revisar</div>${st.mistakes.map(m=>`<div class="bw-row"><span class="mono">${escHTML(m.q)} = <b>${m.ans}</b></span><small>você marcou ${m.got}</small></div>`).join('')}</div>` : (total ? '<div class="be-perfect">✨ Nenhum erro! Mandou bem!</div>' : '')}
        <div class="be-btns"><button class="btn primary" data-a="again">Jogar de novo ⚡</button><button class="btn secondary" data-a="types">Trocar tipo</button></div>
      </div>`);
    end.querySelector('[data-a=again]').onclick = countdown;
    end.querySelector('[data-a=types]').onclick = intro;
    c.appendChild(end);
  }
  intro();
  return wrap;
}
