/* =========================================================
   PÁGINAS QUE JUNTAM MODOS PARECIDOS
   - Estudar → Praticar: Exercícios, Treino, Desafios, Qual o próximo passo e Tabuada
   - Arena → Jogos: Relâmpago, Contra o relógio, Quiz, Duelo e Desafiar amigo
   Antes cada modo era uma aba (Estudar tinha 9 e a Arena 8); agora cada seção tem 4 abas
   e os modos parecidos ficam lado a lado numa página só.
   ========================================================= */
function hubCard(o){
  const b = h(`<button type="button" class="hub-card" style="--hc:${o.color}"><span class="hub-ico">${o.ico}</span><span class="hub-t"><b></b><small></small>${o.badge ? `<em></em>` : ''}</span><span class="hub-go" aria-hidden="true">›</span></button>`);
  b.querySelector('b').textContent = o.title;
  b.querySelector('small').textContent = o.desc;
  if(o.badge) b.querySelector('em').textContent = o.badge;
  b.onclick = o.go;
  return b;
}
function hubLabel(t){ return h(`<h3 class="ar-label hub-lbl">${t}</h3>`); }

function practiceScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('✎ Praticar', true, ()=>go('home')));
  const c = h(`<div class="content hub-screen"></div>`);
  wrap.appendChild(c);
  c.appendChild(h(`<p class="hub-intro">Escolha como quer treinar. Todos corrigem na hora e mostram o passo a passo.</p>`));
  const ch = (()=>{ try{ return chData(); }catch(e){ return null; } })();
  c.appendChild(hubLabel('Por assunto'));
  c.appendChild(hubCard({ico:'✎', color:'#4C7DFF', title:'Exercícios', desc:'Escolha o assunto e o nível. Responda digitando.', go:()=>go('exercisesSubjects')}));
  c.appendChild(hubCard({ico:'🪜', color:'#2BE0A6', title:'Qual o próximo passo?', desc:'O Pi resolve com você: antes de cada passo, você tenta.', go:()=>go('stepSetup')}));
  c.appendChild(hubCard({ico:'✖️', color:'#FF8A4C', title:'Tabuada', desc:'Treine as tabuadas até decorar.', go:()=>go('tabuada')}));
  c.appendChild(hubLabel('Vários assuntos'));
  c.appendChild(hubCard({ico:'🎯', color:'#B23FE0', title:'Treino personalizado', desc:'Monte um treino com os assuntos e níveis que quiser.', go:()=>go('personalizedSetup')}));
  c.appendChild(hubCard({ico:'🏆', color:'#FFB800', title:'Desafios', desc:'Questões sorteadas de vários assuntos, uma de cada vez.', badge: ch && ch.plays ? `${ch.plays} feito${ch.plays===1?'':'s'}` : '', go:()=>go('challengeDifficulty')}));
  return wrap;
}

function gamesScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎮 Jogos', true, ()=>go('arena')));
  const c = h(`<div class="content hub-screen"></div>`);
  wrap.appendChild(c);
  const g = loadGame();
  const quizBest = Math.max(0, ...Object.values(g.quizBest||{}));
  const fc = g.fc || {};
  c.appendChild(h(`<p class="hub-intro">Partidas rápidas pra jogar sozinho ou com os amigos.</p>`));
  c.appendChild(hubLabel('Sozinho'));
  c.appendChild(hubCard({ico:'⚡', color:'#FFB800', title:'Relâmpago', desc:'60 segundos de contas rápidas. Quantas você acerta?', badge: g.boltBest ? `Recorde: ${g.boltBest}` : '', go:()=>go('lightning')}));
  c.appendChild(hubCard({ico:'⏱️', color:'#33D2E3', title:'Contra o relógio', desc:'Questões de um assunto contra o tempo. Errou, perde segundos.', go:()=>go('speedRun')}));
  c.appendChild(hubCard({ico:'🎤', color:'#B23FE0', title:'Quiz do Show', desc:'10 perguntas com tempo. Quanto mais rápido, mais pontos.', badge: quizBest ? `Recorde: ${quizBest.toLocaleString('pt-BR')}` : '', go:()=>go('quizSetup')}));
  c.appendChild(hubLabel('Com amigos'));
  c.appendChild(hubCard({ico:'🎯', color:'#2BE0A6', title:'Desafiar amigo', desc:'As mesmas perguntas pros dois, por código. Quem acerta mais?', badge: fc.wins ? `${fc.wins} vitória${fc.wins===1?'':'s'}` : '', go:()=>go('friendChallenge')}));
  c.appendChild(hubCard({ico:'🤝', color:'#FF5C7A', title:'Duelo a dois', desc:'Dois jogadores no mesmo celular. Quem responde certo primeiro?', go:()=>go('duel')}));
  return wrap;
}
