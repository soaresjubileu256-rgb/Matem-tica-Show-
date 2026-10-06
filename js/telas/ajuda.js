/* =========================================================
   Tutorial — tour guiado pelo Pi no primeiro acesso, dicas de
   primeira vez nas fases/quiz e a tela "Como usar".
   ========================================================= */
const TOUR_STEPS = [
  {sel:null, mood:'joy', title:'Bem-vindo ao Matemática Show! 🎬',
   text:'Eu sou o Pi, o apresentador do show! Vou te mostrar rapidinho como tudo funciona. Leva menos de 1 minuto.'},
  {sel:'.player-card', title:'Seu cartão de jogador',
   text:'Aqui ficam seu <b>nível</b> e sua barra de <b>XP</b>. Cada acerto dá XP e faz você subir de nível. Embaixo: 🔥 <b>ofensiva</b> (dias seguidos jogando), 🪙 <b>moedas</b>, ❤️ <b>vidas</b> e 🏅 <b>medalhas</b>.'},
  {sel:'.path-hero', title:'A Trilha 🗺️',
   text:'O caminho principal! Cada assunto é um <b>episódio</b> com fases do fácil ao difícil, um prêmio surpresa e uma grande final. Complete uma fase pra liberar a próxima.'},
  {sel:'.missions', title:'Hoje 📋',
   text:'Aqui fica o seu dia: a <b>meta</b> de questões, o <b>Desafio do Dia</b>, a <b>Mistura do dia</b> e as revisões. Embaixo, as <b>Missões do dia</b>: quando completar uma, toque em <b>Pegar</b> pra ganhar XP extra!'},
  {sel:'.bottom-nav', title:'Menu principal',
   text:'<b>Trilha</b> leva direto pros episódios. <b>Estudar</b> tem a explicação de cada assunto, os exercícios e as provas, em abas. Na <b>Arena</b> ficam os jogos, e o <b>Progresso</b> mostra como você está indo.'},
  {sel:'.profile-btn-avatar', title:'Seu perfil 👤',
   text:'Toque na sua foto pra abrir o <b>Perfil</b>. Lá ficam as abas <b>Configurações</b>, <b>Novidades</b> e <b>Ajuda</b>, onde você pode rever este tour.'},
  {sel:null, mood:'joy', title:'Tudo pronto! 🌟', final:true,
   text:'Que tal começar pela primeira fase da Trilha? Errar faz parte — você pode tentar de novo e pedir uma dica sempre que precisar.'},
];
let _tourActive = false;
let _tourClose = null; // fecha o tour se a tela mudar (ex.: botão voltar do celular)
function tutorialDone(){ return !!loadGame().tutorialDone; }
function markTutorialDone(){ const g = loadGame(); g.tutorialDone = true; saveGame(); }

function startTour(){
  if(_tourActive) return;
  // vai pro Início e começa o tour lá — mas só se a pessoa ainda estiver no Início
  // (antes, se ela trocasse de tela nesse meio-tempo, era puxada de volta à força)
  if(state.screen!=='home'){ go('home'); setTimeout(()=>{ if(state.screen==='home' && !_tourActive) startTour(); }, 400); return; }
  _tourActive = true;
  let i = 0;
  const root = document.createElement('div');
  root.className = 'tour-root';
  root.innerHTML = `<div class="tour-catch"></div><div class="tour-hole"></div><div class="tour-card"></div>`;
  document.body.appendChild(root);
  const hole = root.querySelector('.tour-hole'), card = root.querySelector('.tour-card');
  function finish(goPath, keepPending){
    _tourActive = false; _tourClose = null;
    if(!keepPending) markTutorialDone();
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place);
    root.remove();
    if(goPath) go('path');
  }
  function place(){
    const st = TOUR_STEPS[i];
    const el = st.sel ? document.querySelector(st.sel) : null;
    const vw = window.innerWidth, vh = window.innerHeight;
    if(!el){
      hole.style.cssText = `left:${vw/2}px;top:${vh/2}px;width:0;height:0;`;
      card.style.cssText = `left:50%;top:50%;transform:translate(-50%,-50%);`;
      return;
    }
    const r = el.getBoundingClientRect(), pad = 6;
    hole.style.cssText = `left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px;`;
    const ch = card.offsetHeight || 220;
    const below = r.bottom + 14, above = r.top - 14 - ch;
    let top = (below + ch <= vh - 8) ? below : (above >= 8 ? above : Math.max(8, vh - ch - 8));
    card.style.cssText = `left:50%;top:${top}px;transform:translateX(-50%);`;
  }
  function show(){
    const st = TOUR_STEPS[i];
    const el = st.sel ? document.querySelector(st.sel) : null;
    const dots = TOUR_STEPS.map((_,k)=>`<span class="${k===i?'on':''}"></span>`).join('');
    card.innerHTML = `
      <div class="tc-head">${mascotSVG(st.mood||'happy', 58)}<h3>${st.title}</h3></div>
      <p>${st.text}</p>
      <div class="tc-dots">${dots}</div>
      <div class="tc-actions">
        ${st.final
          ? `<button type="button" class="show-btn tc-go">▶ Começar primeira fase</button><button type="button" class="show-btn ghost tc-skip">Explorar sozinho</button>`
          : `${i>0?`<button type="button" class="tc-back">‹ Voltar</button>`:`<button type="button" class="tc-skip-link">Pular tour</button>`}<button type="button" class="show-btn tc-next">${i===0?'Vamos lá!':'Próximo ›'}</button>`}
      </div>`;
    const on = (s,f)=>{ const b = card.querySelector(s); if(b) b.onclick = f; };
    on('.tc-next', ()=>{ i++; show(); });
    on('.tc-back', ()=>{ i--; show(); });
    on('.tc-skip-link', ()=> finish(false));
    on('.tc-skip', ()=> finish(false));
    on('.tc-go', ()=> finish(true));
    if(el && el.getBoundingClientRect && getComputedStyle(el).position!=='fixed'){
      const r = el.getBoundingClientRect();
      if(r.top < 70 || r.bottom > window.innerHeight - 250){
        window.scrollTo({top: window.scrollY + r.top - 90, behavior:'instant'});
      }
    }
    place();
    requestAnimationFrame(place);
  }
  _tourClose = (keepPending)=> finish(false, keepPending);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, {passive:true});
  show();
}

/* dica de primeira vez: um balão do Pi que aparece uma única vez por conta */
function firstTimeTip(key, html){
  const g = loadGame();
  g.tips = g.tips || {};
  if(g.tips[key]) return null;
  const tip = h(`<div class="ft-tip">${mascotSVG('happy', 44)}<div class="ft-body">${html}</div><button type="button" class="ft-ok">Entendi</button></div>`);
  tip.querySelector('.ft-ok').onclick = ()=>{ g.tips[key] = true; saveGame(); tip.remove(); };
  return tip;
}

/* ---------- tela "Como usar" ---------- */
const HELP_TOPICS = [
  {ico:'🗺️', t:'Trilha, episódios e fases', d:'Cada assunto é um episódio com 5 etapas: Fase 1 (fácil), Fase 2 (médio), Prêmio surpresa 🎁, Fase 3 (difícil) e a Grande final 🎤. Cada fase tem perguntas de múltipla escolha: toque numa resposta e depois em <b>CONFIRMAR</b>. Se errar, a resposta <b>não</b> é revelada: a alternativa errada fica riscada e você tenta de novo (tem o botão 💡 <b>Ver dica</b>). A explicação completa aparece quando você acertar. Já sabe um assunto? Use <b>Pular pra cá ⏩</b> e faça um teste de nivelamento.'},
  {ico:'❤️', t:'Vidas e moedas', d:'Você tem 5 vidas. Errar uma pergunta da Trilha gasta uma (só o primeiro erro de cada pergunta — tentar de novo não gasta mais), e elas voltam sozinhas (1 a cada 20 minutos). Sem vidas? Recarregue com 50 🪙 moedas, ou continue treinando em Exercícios, Quiz e Relâmpago, que não gastam vidas. Você ganha moedas completando fases e abrindo prêmios.'},
  {ico:'⭐', t:'XP e níveis', d:'Todo acerto dá XP (fácil 10, médio 15, difícil 25). Acertos seguidos formam um <b>combo 🔥</b> que aumenta o XP. Junte XP pra subir de nível e ganhar títulos novos, de "Aprendiz dos Números" até "Lenda da Matemática".'},
  {ico:'🔥', t:'Ofensiva', d:'É quantos dias seguidos você jogou. Responda pelo menos uma pergunta por dia (ou jogue uma partida do Relâmpago) pra manter a chama acesa. <b>Se passar um dia inteiro sem jogar, a ofensiva volta pra zero.</b> Toque no 🔥 pra ver sua semana, seu recorde e o próximo marco: 3, 7, 14, 30 dias e além dão 🪙 moedas.'},
  {ico:'🧠', t:'Revisão do dia', d:'O app lembra quando você praticou cada assunto. Depois de um tempo (1 dia se você ainda erra muito, até 7 dias se já domina), o assunto aparece em <b>Revisão do dia</b> na tela inicial. Revisar no momento certo é o que faz a matéria ficar na cabeça.'},
  {ico:'📝', t:'Relatório semanal', d:'Em Progresso → <b>Relatório semanal</b> você vê um resumo dos últimos 7 dias: dias estudados, questões, % de acerto, comparação com a semana anterior e sugestões. Dá pra <b>compartilhar</b> (WhatsApp, e-mail) ou <b>imprimir / salvar em PDF</b> pra mostrar a pais e professores.'},
  {ico:'👑', t:'Nível de domínio', d:'Cada assunto mostra seu nível: 🌱 Aprendendo, 📘 Praticando, ⭐ Proficiente e 👑 Dominado. Ele olha as suas <b>últimas 10 respostas</b>, então mostra o que você sabe hoje. Pra chegar em Dominado, acerte 9 de 10 com pelo menos 2 no difícil.'},
  {ico:'🔊', t:'Ouvir a questão e tamanho do texto', d:'Toque no 🔊 no canto da questão pra ouvir em voz alta. Em Configurações → <b>Leitura e acessibilidade</b> você aumenta o tamanho do texto (A, A+, A++) ou desliga o botão de ouvir.'},
  {ico:'✏️', t:'Caderno (escrever à mão)', d:'Funciona como uma mesa digitalizadora: escreva com o dedo ou com uma caneta stylus (ela sente a pressão: aperte mais pra um traço mais grosso). Com caneta, o dedo passa a só mover a página, então você pode apoiar a mão na tela. Dois dedos movem e dão zoom. Tem caneta, marca-texto, borracha, linha reta (fica reta sozinha na horizontal/vertical), retângulo, círculo, texto com símbolos (², √, π...) e papel quadriculado, pautado, pontilhado ou <b>plano cartesiano</b>. Nas questões, o botão ✏️ abre um <b>rascunho</b> pra fazer a conta à mão.'},
  {ico:'🔺', t:'Laboratório de Geometria', d:'Em Aprender → <b>Laboratório de Geometria</b>. <b>Áreas</b>: escolha a figura (quadrado, retângulo, triângulo, paralelogramo, trapézio, losango, círculo), mexa nas medidas e veja os quadradinhos de 1 cm², a área e o perímetro mudando, com a explicação de onde vem cada fórmula. <b>Sólidos</b>: cubo, paralelepípedo e cilindro com volume e área total. <b>Ângulos</b>: arraste os cantos do triângulo e veja que os ângulos sempre somam 180°.'},
  {ico:'⚔️', t:'Duelo a dois', d:'Dois jogadores no mesmo celular, frente a frente: deite o aparelho na mesa e cada um fica com metade da tela. Quem acertar primeiro leva o ponto; errou, fica travado até a próxima conta.'},
  {ico:'📜', t:'Certificados', d:'Venceu a Grande final de um episódio? Ganha um certificado com seu nome, que dá pra imprimir ou salvar em PDF. Veja em Progresso → <b>Certificados</b>.'},
  {ico:'💾', t:'Backup do progresso', d:'Seu progresso fica salvo só neste aparelho. De vez em quando o app lembra você de salvar uma cópia. Você também pode fazer isso quando quiser em Configurações → <b>Exportar progresso</b>, e depois restaurar com <b>Importar</b>.'},
  {ico:'📜', t:'Missões e meta do dia', d:'Todo dia aparecem missões novas na tela inicial (toque em "Missões do dia" pra abrir a lista). Quando completar uma, toque em <b>Pegar</b> pra receber o XP. A meta diária (quantas questões responder) você pode mudar ali mesmo, em "Mudar meta".'},
  {ico:'🎤', t:'Quiz do Show', d:'10 perguntas de todos os assuntos, com 20 segundos cada. Quanto mais rápido você responde certo, mais pontos ganha, e acertos seguidos dão bônus. Pra sair no meio, toque no ✕ lá em cima.'},
  {ico:'⚡', t:'Relâmpago', d:'Você tem 60 segundos pra acertar o máximo de contas. Acertou: +1 ponto e +1 segundo. Errou: perde 3 segundos. Tente bater seu recorde!'},
  {ico:'∑', t:'Aprender', d:'A explicação de cada assunto, em linguagem simples e com exemplos resolvidos passo a passo. Também dá pra abrir pelo botão 📖 de cada episódio da Trilha.'},
  {ico:'✎', t:'Exercícios, Desafios e Treino personalizado', d:'<b>Exercícios</b>: 5 questões de um assunto, você escolhe a dificuldade. <b>Desafios</b>: 10 questões misturadas. <b>Treino personalizado</b>: você escolhe os assuntos (cada um mostra seu % de acerto), a dificuldade e a quantidade; o app lembra suas últimas escolhas. No fim, veja seu desempenho por assunto e use <b>Treinar o que errei</b>. Aqui você digita a resposta (use o botão <b>/</b> pra frações). Tudo isso fica na aba <b>Exercícios</b>, junto com a Tabuada e o Caderno de erros.'},
  {ico:'💡', t:'Dicas e explicações', d:'Travou? Toque em "💡 Preciso de uma dica" pra lembrar o método. Depois de responder, sempre aparece a resolução passo a passo, e na Trilha é só tocar em "📖 Ver explicação".'},
  {ico:'🔁', t:'Revisar meus erros', d:'As questões que você errou ficam guardadas. Quando tiver alguma, aparece um aviso na tela inicial pra você tentar de novo. A lista completa fica em Exercícios → <b>Caderno de erros</b>. Acertou na revisão? Ela sai da lista.'},
  {ico:'?', t:'Resolver questão', d:'Digite uma conta, equação ou problema (ex.: <i>2x + 5 = 15</i> ou <i>25% de 300</i>) e o app mostra a resolução completa, passo a passo.'},
  {ico:'🏅', t:'Conquistas', d:'Medalhas que você desbloqueia jogando: combos, dias seguidos, recordes e muito mais. Veja todas em Progresso → <b>Conquistas</b>.'},
  {ico:'⚙️', t:'Perfil e configurações', d:'No Perfil (o círculo com sua inicial, lá em cima) você vê suas estatísticas. Em Configurações dá pra trocar entre tema claro e escuro, ligar/desligar som e vibração, e <b>exportar/importar</b> seu progresso pra não perder nada ao trocar de celular.'},
];
/* grupos do "Como usar", na ordem em que a pessoa usa o app */
const HELP_GROUPS = [
  ['🚀 Começando', ['Trilha, episódios e fases','Vidas e moedas','XP e níveis','Ofensiva','Missões e meta do dia']],
  ['📚 Estudar', ['Aprender','Dicas e explicações','Exercícios, Desafios e Treino personalizado','Revisar meus erros','Revisão do dia','Nível de domínio']],
  ['🎮 Jogar', ['Quiz do Show','Relâmpago','Duelo a dois']],
  ['🧰 Ferramentas', ['Resolver questão','Laboratório de Geometria','Caderno (escrever à mão)','Ouvir a questão e tamanho do texto']],
  ['🏆 Seu progresso', ['Conquistas','Certificados','Relatório semanal']],
  ['⚙️ Conta e dados', ['Perfil e configurações','Backup do progresso']],
];
function helpScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('📘 Como usar', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  c.appendChild(h(`<div class="help-hero">${mascotSVG('joy', 84)}<div><h2>Guia do Show</h2><p>Tudo que você precisa saber pra aproveitar o Matemática Show. Toque num tópico pra abrir.</p></div></div>`));
  const tourBtn = h(`<button type="button" class="show-btn" style="margin-bottom:18px">🎬 Rever o tour guiado</button>`);
  tourBtn.onclick = ()=> startTour();
  c.appendChild(tourBtn);
  // em grupos; algum tópico fora dos grupos entra no fim, pra nada sumir
  const placed = new Set(HELP_GROUPS.flatMap(g=>g[1]));
  const groups = HELP_GROUPS.map(([g,ts])=>[g, ts.map(t=>HELP_TOPICS.find(x=>x.t===t)).filter(Boolean)]);
  const rest = HELP_TOPICS.filter(x=>!placed.has(x.t));
  if(rest.length) groups.push(['Outros', rest]);
  groups.flatMap(([g,list])=>[{group:g}, ...list]).forEach((tp, idx)=>{
    if(tp.group){ c.appendChild(h(`<div class="help-group">${tp.group}</div>`)); return; }
    const item = h(`<div class="help-item"><button type="button" class="hi-head"><span class="hi-ico">${tp.ico}</span><span class="hi-t">${tp.t}</span><span class="hi-chev">›</span></button><div class="hi-body">${tp.d}</div></div>`);
    item.querySelector('.hi-head').onclick = ()=> item.classList.toggle('open');
    if(idx===0) item.classList.add('open');
    c.appendChild(item);
  });
  const reset = h(`<button type="button" class="link-btn" style="margin:18px auto 0;display:block;font-size:12.5px">Mostrar de novo as dicas de primeira vez</button>`);
  reset.onclick = ()=>{ const g = loadGame(); g.tips = {}; saveGame(); showFloat('💡 Dicas reativadas!'); };
  c.appendChild(reset);
  wrap.appendChild(c);
  return wrap;
}
