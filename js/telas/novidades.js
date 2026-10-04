/* =========================================================
   NOVIDADES — avisa o que mudou no app
   - Ao abrir o Início depois de uma atualização, aparece uma janela
     "Novidades" com o que há de novo (uma vez por conta).
   - O sininho no Início fica com uma bolinha vermelha enquanto houver
     novidade que a pessoa não viu; a lista completa fica na tela Novidades
     (também no Perfil).
   - Contas novas já começam com tudo visto (não recebem a lista de cara).
   Pra anunciar algo novo: acrescente uma entrada NO TOPO de NEWS com um "v"
   maior que o anterior.
   ========================================================= */
const NEWS = [
  {v:11, date:'2026-10-05', title:'Certificados de cara nova', items:[
    {ico:'📜', t:'Certificados', d:'Sua coleção com galeria, o próximo certificado, a data em que cada um foi conquistado, filtros e botão de compartilhar. A impressão sai inteira numa folha só.', go:'certificates'},
  ]},
  {v:10, date:'2026-10-05', title:'Conquistas de cara nova', items:[
    {ico:'🏅', t:'Conquistas', d:'Sala de troféus com a próxima conquista, as recentes, medalhas por categoria com barra de progresso e a escada de títulos.', go:'achievements'},
  ]},
  {v:9, date:'2026-10-05', title:'Progresso de cara nova', items:[
    {ico:'📈', t:'Meu progresso', d:'Seu nível e XP, certas e erradas, atividade dos últimos 14 dias, domínio dos assuntos e lista de assuntos com ordenação.', go:'progress'},
    {ico:'🕘', t:'Histórico', d:'Respostas separadas por dia, com filtro de certas e erradas.', go:'history'},
  ]},
  {v:8, date:'2026-10-05', title:'Arena de cara nova', items:[
    {ico:'⚔️', t:'Arena', d:'Sua patente na Arena, Desafio do Dia com a semana e o relógio, atalho pra próxima fase, recorde de cada modo e filtros nas fases.', go:'arena'},
  ]},
  {v:7, date:'2026-10-05', title:'Relatório e Caderno de erros de cara nova', items:[
    {ico:'🔁', t:'Caderno de erros', d:'Veja suas questões erradas, as etapas até aprender, a resposta de cada uma e o que volta pra revisão.', go:'errors'},
    {ico:'📊', t:'Relatório semanal', d:'Veja semanas anteriores, o selo da semana, certas e erradas por dia, conquistas e botões pra treinar o que precisa.', go:'report'},
  ]},
  {v:6, date:'2026-10-05', title:'Fale com a gente', items:[
    {ico:'💬', t:'Sua opinião', d:'Dê uma nota pro app e mande sugestões ou avise de um erro. Fica no Perfil, em "Fale com a gente".', go:'profile'},
  ]},
  {v:5, date:'2026-10-05', title:'Desafios e Treino de cara nova', items:[
    {ico:'🏆', t:'Desafios', d:'Escolha os assuntos e quantas questões, bata seu recorde e reveja cada resposta no fim.', go:'challengeDifficulty'},
    {ico:'🎯', t:'Treino personalizado', d:'Atalhos (pontos fracos, meu nível, surpresa), dificuldade em cartões e revisão de cada resposta.', go:'personalizedSetup'},
  ]},
  {v:4, date:'2026-10-05', title:'Trilha de cara nova', items:[
    {ico:'⭐', t:'Trilha', d:'Resumo do seu progresso, episódios concluídos recolhidos, nome de cada fase, linha colorida mostrando até onde você chegou e botão pra voltar à fase atual.', go:'path'},
  ]},
  {v:3, date:'2026-10-04', title:'Ferramentas e jogos de cara nova', items:[
    {ico:'✏️', t:'Caderno', d:'Miniaturas nítidas, folha sobre a mesa, ícones novos e "✓ Salvo" no topo.', go:'notebook'},
    {ico:'🧮', t:'Calculadora', d:'Conta inteira com parênteses e ordem certa das operações, resultado enquanto digita e histórico.', go:'calculator'},
    {ico:'🔎', t:'Resolver questão', d:'Resolve equações com parênteses e frações, MMC, MDC, média e fatorial, com passo a passo em linha do tempo.', go:'solve'},
    {ico:'✖️', t:'Tabuada', d:'Estudar com dicas e bolinhas, Quadro de Pitágoras e Treinar com recorde.', go:'tabuada'},
    {ico:'⚔️', t:'Duelo a dois', d:'Cartão VS, placar entre vocês, tempo por conta e tipo de conta.', go:'duel'},
    {ico:'⚡', t:'Relâmpago', d:'Tipos de conta com recorde próprio, combo ×2 e a resposta certa quando você erra.', go:'lightning'},
    {ico:'🎤', t:'Quiz do Show', d:'Escolha os assuntos e use as ajudas 50:50, +10s e Pular. No fim, reveja todas as respostas.', go:'quizSetup'},
    {ico:'📝', t:'Simulado', d:'Modelos prontos, avisos de tempo e "Refazer as erradas" no resultado.', go:'examSetup'},
  ]},
  {v:2, date:'2026-10-04', title:'Login e certificado novos', items:[
    {ico:'👋', t:'Entrada mais fácil', d:'Contas em lista com cores, aviso de Caps Lock e "as senhas são iguais" no cadastro.'},
    {ico:'📜', t:'Certificado mais bonito', d:'Versões verde e roxa, selo, moldura e símbolos de matemática.', go:'certificates'},
    {ico:'🎬', t:'Pi, o apresentador', d:'"Luzes, câmera... show!"'},
  ]},
];
const NEWS_LATEST = NEWS[0].v;
const newsKey = ()=> `mathstudy-news-seen:${currentUserId()}`;
function newsSeen(){ try{ return Number(localStorage.getItem(newsKey())) || 0; }catch(e){ return NEWS_LATEST; } }
function markNewsSeen(){ try{ localStorage.setItem(newsKey(), String(NEWS_LATEST)); }catch(e){} }
function newsUnseen(){ const s = newsSeen(); return NEWS.filter(n=>n.v > s); }
let _newsShownThisRun = false;

function fmtNewsDate(d){ const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}`; }
function newsItemsHTML(items){
  return items.map((it,i)=>`<div class="nw-item"><span class="nw-ico">${it.ico}</span><div class="nw-txt"><b>${it.t}</b><p>${it.d}</p></div>${it.go ? `<button type="button" class="nw-go" data-i="${i}">Ver ›</button>` : ''}</div>`).join('');
}
function wireNewsGo(root, items, before){
  root.querySelectorAll('.nw-go').forEach(b=> b.onclick = ()=>{ const it = items[+b.dataset.i]; if(before) before(); markNewsSeen(); go(it.go); });
}

/* janela que aparece sozinha depois de uma atualização */
function showNewsSheet(){
  const list = newsUnseen();
  if(!list.length || _newsShownThisRun) return false;
  _newsShownThisRun = true;
  const items = list.flatMap(n=>n.items);
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="gm-modal nw-sheet" role="dialog" aria-label="Novidades">
      <div class="nw-hero"><span class="nw-confetti" aria-hidden="true">🎉</span><small>ATUALIZAÇÃO</small><h2>Novidades no Matemática Show!</h2><p>${list[0].title}${list.length>1 ? ` e mais ${list.length-1} atualização${list.length>2?'ões':''}` : ''}</p></div>
      <div class="nw-list">${newsItemsHTML(items)}</div>
      <button type="button" class="nw-ok">Entendi! 🚀</button>
      <button type="button" class="nw-all">Ver todas as novidades</button>
    </div>`;
  const close = ()=>{ markNewsSeen(); bg.remove(); const b = document.querySelector('.news-bell'); if(b) b.classList.remove('dot'); };
  wireNewsGo(bg, items, ()=> bg.remove());
  bg.querySelector('.nw-ok').onclick = close;
  bg.querySelector('.nw-all').onclick = ()=>{ close(); go('news'); };
  bg.addEventListener('click', e=>{ if(e.target===bg) close(); });
  document.body.appendChild(bg);
  playTones([523,659,784], 0.08, 'triangle', 0.06);
  return true;
}

/* sininho do topo do Início */
function newsBellButton(){
  const b = h(`<button class="auth-logout news-bell ${newsUnseen().length?'dot':''}" title="Novidades" aria-label="Novidades do app">🔔</button>`);
  b.onclick = ()=> go('news');
  return b;
}

/* tela com todas as novidades */
function newsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🔔 Novidades', true, ()=>go('home')));
  const c = h(`<div class="content nw-screen"></div>`);
  const unseen = new Set(newsUnseen().map(n=>n.v));
  c.appendChild(h(`<p class="nw-intro">Tudo o que mudou no app, das atualizações mais novas para as mais antigas.</p>`));
  NEWS.forEach(n=>{
    const card = h(`<div class="nw-card ${unseen.has(n.v)?'new':''}">
        <div class="nw-card-h"><div><b>${n.title}</b><small>${fmtNewsDate(n.date)}</small></div>${unseen.has(n.v) ? '<span class="nw-badge">NOVO</span>' : ''}</div>
        <div class="nw-list">${newsItemsHTML(n.items)}</div>
      </div>`);
    wireNewsGo(card, n.items);
    c.appendChild(card);
  });
  markNewsSeen();
  wrap.appendChild(c);
  return wrap;
}

/* o service worker trocou de versão com o app aberto: oferece recarregar */
(function watchAppUpdate(){
  if(!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    if(!hadController || document.querySelector('.upd-bar')) return;
    const bar = h(`<div class="upd-bar" role="status"><span>🎉 Saiu uma versão nova do app!</span><button type="button">Atualizar</button><button type="button" class="x" aria-label="Fechar">✕</button></div>`);
    bar.querySelector('button').onclick = ()=> location.reload();
    bar.querySelector('.x').onclick = ()=> bar.remove();
    document.body.appendChild(bar);
  });
})();
