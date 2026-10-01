/* =========================================================
   DUELO A DOIS — dois jogadores no mesmo celular
   ========================================================= */
/* ---------------- DUELO A DOIS (mesmo aparelho) ----------------
   Tela dividida: o jogador de cima vê tudo de cabeça pra baixo, pra jogar frente a frente
   com o celular deitado na mesa. Mesma conta pros dois; quem tocar primeiro na certa
   leva o ponto. Errou? Fica travado até a próxima conta. */
const DUEL_ROUNDS = 10;
function duelScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚔️ Duelo a dois', true, ()=>go('arena')));
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
