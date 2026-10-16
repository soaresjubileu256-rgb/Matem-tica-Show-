/* =========================================================
   CONTEÚDOS POR PROVA (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
   Uma aba por prova com o que estudar de Matemática pra ela.
   A aba aberta fica em state.examId.
   Pra mudar os conteúdos, é só editar a lista EXAM_CONTENTS.
   ========================================================= */
const EXAM_CONTENTS = [
  {id:'enem', name:'ENEM', full:'Exame Nacional do Ensino Médio', ico:'🎓', color:'#4C7DFF', color2:'#2F55D4', items:[
    'Matemática financeira (juros compostos, parcelamento), exponencial e logaritmo',
    'Funções (afim, quadrática, exponencial), leitura de gráficos e tabelas',
    'Estatística (média, mediana, desvio padrão), probabilidade condicional',
    'Geometria espacial (volumes, capacidade), escalas, grandezas e unidades',
    'PA/PG, trigonometria no triângulo retângulo, análise combinatória',
  ]},
  {id:'etec', name:'ETEC', full:'Vestibulinho das Etecs (SP)', ico:'🏫', color:'#12B886', color2:'#0B8A64', items:[
    'Equações e sistemas, produtos notáveis, fatoração',
    'Razão, proporção, porcentagem, regra de três composta',
    'Teorema de Pitágoras, semelhança e Tales, áreas e volumes',
    'Estatística e probabilidade básicas',
  ]},
  {id:'fuvest', name:'Fuvest', full:'Vestibular da USP', ico:'🏛️', color:'#B23FE0', color2:'#7B2BB0', items:[
    'Funções (modular, exponencial, logarítmica), inequações',
    'Trigonometria completa (equações, identidades, lei dos senos e cossenos)',
    'Geometria analítica (reta, circunferência, cônicas), geometria espacial avançada',
    'Polinômios, números complexos, matrizes, determinantes e sistemas lineares',
    'Combinatória, probabilidade, PA/PG',
  ]},
  {id:'unicamp', name:'Unicamp', full:'Vestibular da Unicamp', ico:'🔬', color:'#FF7A00', color2:'#D35400', items:[
    'Mesmos tópicos da Fuvest, com enunciados longos e contextualizados',
    'Muita combinatória e probabilidade, sequências, geometria plana e espacial',
    'Raciocínio e justificativa, não só cálculo',
  ]},
  {id:'unesp', name:'Unesp', full:'Vestibular da Unesp', ico:'📐', color:'#F06595', color2:'#C2255C', items:[
    'Funções, trigonometria, geometria plana, espacial e analítica',
    'Combinatória, probabilidade, complexos, polinômios, matrizes',
    '2ª fase dissertativa: é preciso mostrar o desenvolvimento',
  ]},
  {id:'obmep', name:'OBMEP', full:'Olimpíada Brasileira de Matemática das Escolas Públicas', ico:'🏅', color:'#FFB800', color2:'#E09A00', items:[
    'Teoria dos números (divisores, primos, MMC/MDC, paridade, congruências simples)',
    'Contagem, princípio da casa dos pombos, lógica e jogos',
    'Geometria (áreas, ângulos, construções), sequências e padrões',
    'Álgebra criativa, mais engenhosidade do que fórmulas',
  ]},
];

// o que está entre parênteses ou depois de ":" aparece mais clarinho, como detalhe
function examContentHTML(e){
  const fmt = x=> escHTML(x).replace(/\(([^)]*)\)/g, '<small>($1)</small>').replace(/^([^:]+):\s*(.+)$/, '$1: <small>$2</small>');
  return `<div class="pv-content" style="--c:${e.color}; --c2:${e.color2}">
    <div class="pv-content-h"><span>${e.ico}</span><div><b>${e.name}</b><small>${escHTML(e.full)}</small></div></div>
    <ol>${e.items.map((x,i)=>`<li><i>${i+1}</i><p>${fmt(x)}</p></li>`).join('')}</ol>
  </div>`;
}

function examsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🎓 Conteúdos por prova', true, ()=>go('content')));
  const e = EXAM_CONTENTS.find(x=>x.id===state.examId) || EXAM_CONTENTS[0];
  state.examId = e.id;
  const tabs = h(`<div class="pv-tabs" role="tablist"></div>`);
  const c = h(`<div class="content pv-screen">
    <div class="pv-body">${examContentHTML(e)}</div>
    <p class="pv-note">📌 É uma orientação de estudo. Confira sempre o edital da sua prova.</p>
  </div>`);
  // trocar de prova muda só o cartão e a aba acesa: redesenhar a tela inteira
  // fazia as barras de abas voltarem pro começo e piscarem
  EXAM_CONTENTS.forEach(x=>{
    const t = h(`<button type="button" role="tab" class="pv-tab ${x.id===e.id?'on':''}" aria-selected="${x.id===e.id}" style="--c:${x.color}"><span>${x.ico}</span><b>${x.name}</b></button>`);
    t.onclick = ()=>{
      if(state.examId===x.id) return;
      state.examId = x.id;
      replaceHistoryState();
      tabs.querySelectorAll('.pv-tab').forEach(b=>{ const on = b===t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      c.querySelector('.pv-body').innerHTML = examContentHTML(x);
      tabs.scrollTo({left: t.offsetLeft - (tabs.clientWidth - t.offsetWidth)/2, behavior:'smooth'});
    };
    tabs.appendChild(t);
  });
  wrap.appendChild(tabs);
  wrap.appendChild(c);
  // deixa a aba escolhida visível na barra ao abrir a tela
  requestAnimationFrame(()=>{ const on = tabs.querySelector('.pv-tab.on'); if(on) tabs.scrollLeft = on.offsetLeft - (tabs.clientWidth - on.offsetWidth)/2; });
  return wrap;
}
