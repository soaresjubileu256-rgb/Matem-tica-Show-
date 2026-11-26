/* =========================================================
   Tutorial — tour guiado pelo Pi no primeiro acesso, dicas de
   primeira vez nas fases/quiz e a tela "Como usar".
   ========================================================= */
const TOUR_STEPS = [
  {sel:null, mood:'joy', title:'Bem-vindo ao Matemática Show! 🎬',
   text:'Eu sou o Pi, o apresentador do show! Vou te mostrar rapidinho onde fica cada coisa. Leva só 1 minutinho.'},
  {sel:'.path-hero', title:'A Trilha 🗺️',
   text:'O caminho principal! Cada assunto é um <b>episódio</b>, um mapa de aventura com cenário próprio: o Pi fica em cima da fase atual e a trilha dourada mostra o que você já percorreu. São fases do fácil ao difícil, um <b>🎁 prêmio surpresa</b> (moedas, protetor, XP em dobro ou até um item) e a <b>👾 luta contra o chefe</b>. Cada erro gasta uma ❤️ vida; acabou? Revise 3 erros e ganhe uma de volta.'},
  {sel:'.missions', title:'Hoje 📋',
   text:'O seu dia: a <b>meta</b> de questões, o <b>Desafio do Dia</b> e as revisões. Nas <b>Missões do dia</b>, quando completar uma, toque em <b>Pegar</b>. E toda semana tem uma <b>🧰 Missão da semana</b> que abre um baú com 100 moedas!'},
  {sel:'.bottom-nav .bn-item[data-nav="study"]', title:'Estudar 📚',
   text:'Quatro abas: <b>Aprender</b> (a explicação de cada assunto), <b>Praticar</b> (Exercícios, Treino, Desafios, Qual o próximo passo e Tabuada), <b>Provas</b> (ENEM, ETEC, Fuvest e outras) e seus <b>Erros</b> pra revisar.'},
  {sel:'.bottom-nav .bn-item[data-nav="arena"]', title:'Arena ⚔️',
   text:'Quatro abas: as <b>Fases</b> com estrelas, o <b>Desafio do Dia</b>, os <b>Jogos</b> rápidos (Relâmpago, Contra o relógio, Quiz, Duelo e Desafiar amigo) e o <b>Simulado</b> no estilo de cada prova.'},
  {sel:'.bottom-nav .bn-item[data-nav="tools"]', title:'Ferramentas 🧰',
   text:'Sempre à mão: o <b>Resolver questão</b> (mostra a conta passo a passo), a <b>Calculadora</b>, o <b>Caderno digital</b> pra escrever com o dedo ou caneta e o <b>Laboratório</b> de geometria.'},
  {sel:'.bottom-nav .bn-item[data-nav="progress"]', title:'Progresso 📈',
   text:'Seu <b>cartão de jogador</b> (nível, 🔥 ofensiva, 🪙 moedas, ❤️ vidas e 🏅 medalhas) e como você está indo: <b>Resumo</b>, <b>Ranking</b>, <b>Relatório</b> (dá pra mandar pros pais), <b>Histórico</b>, <b>Conquistas</b> e <b>Certificados</b>. Cada nível novo dá um 🎁 <b>presente</b>!'},
  {sel:'.profile-btn-avatar', title:'Seu perfil 👤',
   text:'Toque na sua foto pra abrir o <b>Perfil</b>. Lá ficam a <b>Loja</b> (visual do Pi, 🧊 protetor de ofensiva, ⚡ XP em dobro e 🎁 baú misterioso), as <b>Configurações</b> (tema, som e 📲 <b>levar sua conta pra outro celular</b>), as <b>Novidades</b> e a <b>Ajuda</b>, onde você pode rever este tour.'},
  {sel:null, mood:'joy', title:'Tudo pronto! 🌟', final:true,
   text:'Que tal começar pela primeira fase da Trilha? Errar faz parte: você pode tentar de novo e pedir uma dica sempre que precisar.'},
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
  {ico:'⏱️', t:'Contra o relógio', d:'Em Arena → <b>Jogos</b>. Escolha um assunto e o nível e responda o máximo que der antes do tempo acabar. Errou, perde segundos. Cada assunto e nível guarda seu recorde.'},
  {ico:'🎯', t:'Desafiar amigo', d:'Em Arena → <b>Jogos</b>. Você joga 7 perguntas e ganha um <b>código</b>. Mande pro amigo: ele digita o código, joga <b>as mesmas perguntas</b> e vê quem ganhou (mais acertos vence; empate, o mais rápido). Mande o código dele de volta pra você ver o resultado sem jogar de novo. Vitória dá 20 🪙 (até 3 por dia).'},
  {ico:'📲', t:'Levar a conta pra outro celular', d:'No celular antigo: Configurações → Seus dados → <b>Levar pra outro celular</b> e toque em <b>Enviar pra mim</b> (WhatsApp, e-mail…). No celular novo, na tela de entrada, toque em <b>Trazer conta de outro celular</b>, cole a mensagem inteira e escolha a senha. O progresso, as moedas, a loja e as conquistas vêm junto. Mande o código só pra você.'},
  {ico:'🎁', t:'Prêmios e baús', d:'<b>Prêmio surpresa</b> da Trilha: moedas, baú cheio, protetor, XP em dobro ou um item raro. <b>Presente de nível</b>: moedas a cada nível e um item a cada 5. <b>Baú da semana</b>: ao completar a Missão da semana. <b>Medalha de episódio</b>: +50 moedas ao derrotar um chefe. <b>Baú misterioso</b>: na Loja, por 70 moedas.'},
  {ico:'🗺️', t:'Trilha, episódios e fases', d:'Cada assunto é um episódio com 5 etapas: Fase 1 (fácil), Fase 2 (médio), Prêmio surpresa 🎁, Fase 3 (difícil) e a Grande final, uma luta contra o <b>👾 chefe do episódio</b> (cada acerto tira vida dele). Cada episódio é um <b>mapa de aventura</b>: as fases são pontos ligados por uma trilha pontilhada (o trecho feito fica dourado), o Pi fica em cima da fase atual e as fases trancadas mostram 🔒. Toque numa resposta e depois em <b>CONFIRMAR</b>. Se errar, a alternativa errada fica riscada e você tenta de novo (tem o botão 💡 <b>Ver dica</b>). As fases se adaptam: acertou 3 seguidas, vem uma <b>pergunta bônus mais difícil</b>; errou 2, vem uma <b>de reforço</b>. Já sabe um assunto? Use <b>Pular pra cá ⏩</b> e faça um teste de nivelamento.'},
  {ico:'❤️', t:'Vidas e moedas', d:'Você tem 5 vidas. Errar uma pergunta da Trilha gasta uma (só o primeiro erro de cada pergunta), e elas voltam sozinhas (1 a cada 20 minutos). Sem vidas? <b>Revise 3 erros</b> do seu caderno e acerte 2 pra ganhar 1 vida (até 3 vezes por dia), recarregue tudo com 50 🪙, ou continue treinando em Exercícios, Quiz e Relâmpago, que não gastam vidas. Você ganha moedas completando fases, abrindo prêmios, subindo de nível e nas missões.'},
  {ico:'🛍️', t:'Loja do Pi e ajudas', d:'Fica em Perfil → <b>Loja</b> (ou toque nas 🪙 moedas do seu cartão, em Progresso). Itens de visual: chapéus e acessórios pro Pi, molduras do avatar, fundos do cartão e efeitos de comemoração. Extras: <b>🧊 Protetor de ofensiva</b> (40, guarda até 2), <b>⚡ XP em dobro</b> por 15 minutos (50) e <b>🎁 Baú misterioso</b> (70, sai um item que você ainda não tem). Nas fases da Trilha e da Arena: <b>✂️ 50/50</b> (15 moedas, 3 por dia) e <b>❤️ +1 vida</b> (20 moedas, 2 por dia).'},
  {ico:'⭐', t:'XP e níveis', d:'Todo acerto dá XP (fácil 10, médio 15, difícil 25). Acertos seguidos formam um <b>combo 🔥</b> que aumenta o XP. Junte XP pra subir de nível e ganhar títulos novos, de "Aprendiz dos Números" até "Lenda da Matemática". Cada nível novo dá um <b>🎁 presente de nível</b> (moedas, e a cada 5 níveis um item de visual).'},
  {ico:'🔥', t:'Ofensiva', d:'É quantos dias seguidos você jogou. Responda pelo menos uma pergunta por dia pra manter a chama acesa. Se passar um dia inteiro sem jogar, a ofensiva volta pra zero, <b>a não ser que você tenha um 🧊 protetor</b> (compre na Loja ou no painel do 🔥): ele é gasto sozinho e salva seus dias. Toque no 🔥 pra ver sua semana, seu recorde e o próximo marco: 3, 7, 14, 30 dias e além dão 🪙 moedas.'},
  {ico:'🧠', t:'Revisão do dia', d:'O app lembra quando você praticou cada assunto. Depois de um tempo (1 dia se você ainda erra muito, até 7 dias se já domina), o assunto aparece em <b>Revisão do dia</b> na tela inicial. Revisar no momento certo é o que faz a matéria ficar na cabeça.'},
  {ico:'📝', t:'Relatório semanal', d:'Em Progresso → <b>Relatório semanal</b> você vê a semana de forma simples: dias estudados, questões, % de acerto, um gráfico por dia e um recadinho do que está indo bem e do que precisa treinar. Dá pra <b>compartilhar</b> (WhatsApp, e-mail) ou <b>imprimir / salvar em PDF</b> pra mostrar a pais e professores.'},
  {ico:'👑', t:'Nível de domínio', d:'Cada assunto mostra seu nível: 🌱 Aprendendo, 📘 Praticando, ⭐ Proficiente e 👑 Dominado. Ele olha as suas <b>últimas 10 respostas</b>, então mostra o que você sabe hoje. Pra chegar em Dominado, acerte 9 de 10 com pelo menos 2 no difícil.'},
  {ico:'🔊', t:'Ouvir a questão e tamanho do texto', d:'Toque no 🔊 no canto da questão pra ouvir em voz alta. Em Configurações → <b>Leitura e acessibilidade</b> você aumenta o tamanho do texto (A, A+, A++) ou desliga o botão de ouvir.'},
  {ico:'✏️', t:'Caderno (escrever à mão)', d:'Funciona como uma mesa digitalizadora: escreva com o dedo ou com uma caneta stylus (ela sente a pressão: aperte mais pra um traço mais grosso). Com caneta, o dedo passa a só mover a página, então você pode apoiar a mão na tela. Dois dedos movem e dão zoom. Tem caneta, marca-texto, borracha, linha reta (fica reta sozinha na horizontal/vertical), retângulo, círculo, texto com símbolos (², √, π...) e papel quadriculado, pautado, pontilhado ou <b>plano cartesiano</b>. Nas questões, o botão ✏️ abre um <b>rascunho</b> pra fazer a conta à mão.'},
  {ico:'🔺', t:'Laboratório de Geometria', d:'Em Ferramentas → <b>Laboratório</b> (e também nos assuntos de geometria, em Aprender). <b>Áreas</b>: escolha a figura (quadrado, retângulo, triângulo, paralelogramo, trapézio, losango, círculo), mexa nas medidas e veja os quadradinhos de 1 cm², a área e o perímetro mudando, com a explicação de onde vem cada fórmula. <b>Sólidos</b>: cubo, paralelepípedo, cilindro, cone e esfera com volume e área total (no cubo e no paralelepípedo dá pra ver os cubinhos de 1 cm³). <b>Ângulos</b>: arraste os cantos do triângulo e veja os 3 ângulos juntos formando uma linha reta: sempre 180°.'},
  {ico:'⚔️', t:'Duelo a dois', d:'Em Arena → <b>Jogos</b>. Dois jogadores no mesmo celular, frente a frente: deite o aparelho na mesa e cada um fica com metade da tela. Quem acertar primeiro leva o ponto; errou, fica travado até a próxima conta.'},
  {ico:'📜', t:'Certificados', d:'Venceu a Grande final de um episódio? Ganha um certificado com seu nome, que dá pra imprimir ou salvar em PDF. Veja em Progresso → <b>Certificados</b>.'},
  {ico:'💾', t:'Backup do progresso', d:'Seu progresso fica salvo só neste aparelho, e o app guarda sozinho uma cópia por dia (Configurações → <b>Cópias automáticas</b>). Trocou de celular? Use <b>📲 Levar pra outro celular</b>: veja o tópico "Levar a conta pra outro celular". Também dá pra salvar um arquivo com <b>Salvar uma cópia</b> e abrir depois com <b>Restaurar uma cópia</b>.'},
  {ico:'📜', t:'Missões e meta do dia', d:'Todo dia aparecem missões novas na tela inicial (toque em "Missões do dia" pra abrir a lista). Quando completar uma, toque em <b>Pegar</b> pra receber o XP. Embaixo fica a <b>🧰 Missão da semana</b>: uma missão maior (ex.: acertar 80 questões) que abre um baú com moedas e XP. A meta diária você muda ali mesmo, em "Mudar meta".'},
  {ico:'🎤', t:'Quiz do Show', d:'Em Arena → <b>Jogos</b>. 10 perguntas de todos os assuntos, com 20 segundos cada. Quanto mais rápido você responde certo, mais pontos ganha, e acertos seguidos dão bônus. Pra sair no meio, toque no ✕ lá em cima.'},
  {ico:'⚡', t:'Relâmpago', d:'Em Arena → <b>Jogos</b>. Você tem 60 segundos pra acertar o máximo de contas. Acertou: +1 ponto e +1 segundo. Errou: perde 3 segundos. Tente bater seu recorde!'},
  {ico:'∑', t:'Aprender', d:'A explicação de cada assunto, em linguagem simples e com exemplos resolvidos passo a passo. Também dá pra abrir pelo botão 📖 de cada episódio da Trilha.'},
  {ico:'✎', t:'Exercícios, Desafios e Treino personalizado', d:'Ficam em Estudar → <b>Praticar</b>. <b>Exercícios</b>: 5 questões de um assunto, você escolhe a dificuldade. <b>Desafios</b>: 10 questões misturadas. <b>Treino personalizado</b>: você escolhe os assuntos (cada um mostra seu % de acerto), a dificuldade e a quantidade; o app lembra suas últimas escolhas. No fim, veja seu desempenho por assunto e use <b>Treinar o que errei</b>. Aqui você digita a resposta (use o botão <b>/</b> pra frações). Tudo isso fica na aba <b>Exercícios</b>, junto com a Tabuada e o Caderno de erros.'},
  {ico:'💡', t:'Dicas e explicações', d:'Travou? Toque em "💡 Preciso de uma dica" pra lembrar o método. Depois de responder, sempre aparece a resolução passo a passo, e na Trilha é só tocar em "📖 Ver explicação".'},
  {ico:'🔁', t:'Revisar meus erros', d:'As questões que você errou ficam guardadas. Quando tiver alguma, aparece um aviso na tela inicial pra você tentar de novo. A lista completa fica em Estudar → <b>Erros</b>. Acertou na revisão? Ela sai da lista. E se você errar <b>3 seguidas do mesmo assunto</b>, o app oferece a explicação na hora, sem sair da questão.'},
  {ico:'?', t:'Resolver questão', d:'Fica no botão <b>Ferramentas</b> da barra de baixo, junto com a Calculadora e o Caderno. Digite uma conta, equação ou problema (ex.: <i>2x + 5 = 15</i> ou <i>25% de 300</i>) e o app mostra a resolução completa, passo a passo.'},
  {ico:'🏅', t:'Conquistas', d:'Medalhas que você desbloqueia jogando: combos, dias seguidos, chefes derrotados, desafios vencidos, recordes e muito mais. Também tem as <b>medalhas de episódio</b> (uma por chefe derrotado). Veja todas em Progresso → <b>Conquistas</b>.'},
  {ico:'⚙️', t:'Perfil e configurações', d:'No Perfil (o círculo com sua inicial, lá em cima) você vê suas estatísticas e troca o avatar. Em Configurações dá pra trocar entre tema claro e escuro, ligar/desligar som e vibração, mudar o tamanho do texto e cuidar dos seus dados (cópias e <b>📲 levar pra outro celular</b>).'},
];
/* grupos do "Como usar", na ordem em que a pessoa usa o app */
const HELP_GROUPS = [
  ['🚀 Começando', ['Trilha, episódios e fases','Vidas e moedas','Loja do Pi e ajudas','XP e níveis','Ofensiva','Missões e meta do dia','Prêmios e baús']],
  ['📚 Estudar', ['Aprender','Dicas e explicações','Exercícios, Desafios e Treino personalizado','Revisar meus erros','Revisão do dia','Nível de domínio']],
  ['🎮 Jogar', ['Relâmpago','Contra o relógio','Quiz do Show','Desafiar amigo','Duelo a dois']],
  ['🧰 Ferramentas', ['Resolver questão','Laboratório de Geometria','Caderno (escrever à mão)','Ouvir a questão e tamanho do texto']],
  ['🏆 Seu progresso', ['Conquistas','Certificados','Relatório semanal']],
  ['⚙️ Conta e dados', ['Perfil e configurações','Levar a conta pra outro celular','Backup do progresso']],
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
