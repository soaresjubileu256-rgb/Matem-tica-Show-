/* =========================================================
   LIBERAR AOS POUCOS
   Conta nova começa só com o essencial (Trilha, Estudar, Ferramentas, Desafio do Dia).
   A Arena e os simulados das provas abrem conforme o aluno joga, e cada um que abre
   vira uma pequena comemoração. Contas que já tinham progresso continuam com tudo aberto.
   ========================================================= */
const UNLOCKS = [
  {id:'arena', ico:'⚔️', name:'Arena', what:'Relâmpago, Contra o relógio, Quiz, Duelo e Simulado',
   screens:['arena','lightning','speedRun','quizSetup','duel','examSetup'],
   goal:'Termine o Episódio 1 da Trilha ou responda 20 questões', pi:'Primeiro a gente esquenta na Trilha, depois o palco da Arena é seu! 🎤',
   check:()=>{ const n = totalAnswered(); return {open: n>=20 || unlockEpisodeDone(0), have:n, need:20}; }},
  {id:'provas', ico:'🎓', name:'Simulados das provas', what:'ENEM, ETEC, Fuvest, Unicamp, Unesp e OBMEP',
   screens:['exams'],
   goal:'Responda 60 questões ou chegue ao nível 3', pi:'Treine mais um pouquinho e os simulados das provas abrem pra você! 🎓',
   check:()=>{ const n = totalAnswered(); return {open: n>=60 || levelInfo(loadGame().xp).level>=3, have:n, need:60}; }},
];
function unlockEpisodeDone(u){
  const done = pathDone();
  const nodes = allPathNodes().filter(n=>n.unit===u);
  return nodes.length>0 && nodes.every(n=>done[n.key]);
}
/* {} = conta nova (vai liberando); 'all' = conta antiga (tudo aberto desde sempre) */
function unlocksData(){
  const g = loadGame();
  if(g.unlocks===undefined){ g.unlocks = (g.xp>0 || totalAnswered()>0) ? 'all' : {}; saveGame(); }
  return g.unlocks;
}
function featureOpen(id){
  const u = unlocksData();
  if(u==='all' || u[id]) return true;
  const f = UNLOCKS.find(x=>x.id===id);
  return !f || f.check().open;
}
function lockedFeatureFor(screen){
  const f = UNLOCKS.find(x=>x.screens.includes(screen));
  return f && !featureOpen(f.id) ? f : null;
}
/* chamado a cada troca de tela: o que acabou de abrir ganha comemoração (uma vez só) */
function checkUnlocks(){
  const u = unlocksData();
  if(u==='all') return;
  let changed = false;
  UNLOCKS.forEach(f=>{
    if(u[f.id] || !f.check().open) return;
    u[f.id] = Date.now(); changed = true;
    queueToast(f.ico, `${f.name} liberada!`, f.what);
    setTimeout(()=>launchConfetti(120), 300);
  });
  if(changed) saveGame();
}
/* tela no lugar de uma parte ainda fechada */
function lockedFeatureScreen(f, screen){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(f.name, true, ()=>go('home')));
  const st = f.check(), pct = Math.min(100, Math.round(st.have/st.need*100));
  const c = h(`<div class="content lockf">
    <div class="lockf-card">
      <div class="lockf-ico"><span>${f.ico}</span><i>🔒</i></div>
      <h2>${f.name} chega já já!</h2>
      <p>${f.what}.</p>
      <div class="lockf-goal"><b>Pra liberar:</b> ${f.goal}.</div>
      <div class="lockf-bar"><i style="width:${pct}%"></i></div>
      <small>${Math.min(st.have, st.need)} de ${st.need} questões respondidas</small>
      <div class="lockf-btns"></div>
    </div>
  </div>`);
  const btns = c.querySelector('.lockf-btns');
  const b1 = h(`<button type="button" class="btn primary">▶ Jogar na Trilha</button>`); b1.onclick = ()=> go('path');
  btns.appendChild(b1);
  if(screen!=='exams' && typeof startDaily==='function'){
    const b2 = h(`<button type="button" class="btn secondary">📅 Desafio do Dia</button>`); b2.onclick = ()=> go('dailyIntro');
    btns.appendChild(b2);
  }
  c.prepend(mascotBubble(f.pi, 'happy'));
  wrap.appendChild(c);
  return wrap;
}
