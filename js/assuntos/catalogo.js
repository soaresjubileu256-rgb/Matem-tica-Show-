/* =========================================================
   CATÁLOGO DE ASSUNTOS
   Ordem dos assuntos, ano escolar (BNCC), áreas do Ensino Médio e os
   formatos de questão (mkSingle, mkFrac, mkPair, mkXY).
   ========================================================= */
/* GRUPOS DE ASSUNTOS — a lista única que organiza o app inteiro.
   Cada assunto aparece em um grupo só, na ordem da escola. Aprender, Exercícios, Arena,
   Simulado, Treino e Trilha usam esta mesma ordem. */
const SUBJECT_GROUPS = [
  {id:'f1', level:'fund', name:'1º ao 5º ano', ids:['adicao','subtracao','multiplicacao','divisao','dinheiro']},
  {id:'f2', level:'fund', name:'6º e 7º ano', ids:['fracoes','decimais','porcentagem','geometria','angulos','unidades','mmcmdc','primos','restos','potenciacao','expressoes','estatistica','regra3','regra3comp','eq1']},
  {id:'f3', level:'fund', name:'8º e 9º ano', ids:['sistemas','prodnotaveis','eq2','pitagoras','semelhanca','func1grau','casapombos','logica']},
  {id:'em-alg',  level:'em', name:'Álgebra e Funções', ids:['conjuntos','funcquad','inequacoes','modular','exponencial','logaritmo','functrig']},
  {id:'em-seq',  level:'em', name:'Progressões e Sequências', ids:['pa','pg']},
  {id:'em-geo',  level:'em', name:'Geometria', ids:['espacial','analitica','circunferencia','conicas']},
  {id:'em-trig', level:'em', name:'Trigonometria', ids:['trigret','ciclo','identidades','leis']},
  {id:'em-est',  level:'em', name:'Estatística e Probabilidade', ids:['combinatoria','probabilidade','probcond','dispersao','graficos']},
  {id:'em-fin',  level:'em', name:'Matemática Financeira', ids:['juros','parcelamento','descontos','inflacao']},
  {id:'em-mat',  level:'em', name:'Matrizes e Determinantes', ids:['matrizes','determinantes']},
  {id:'em-pol',  level:'em', name:'Polinômios e Complexos', ids:['polinomios','complexos']},
];
const SUBJECT_LEVELS = [
  {id:'fund', name:'Ensino Fundamental', ico:'📘'},
  {id:'em', name:'Ensino Médio', ico:'🎓'},
];
const SUBJECT_ORDER = SUBJECT_GROUPS.flatMap(g=>g.ids);
function subjectGroupOf(id){ return SUBJECT_GROUPS.find(g=>g.ids.includes(id)); }
function levelIds(level){ return SUBJECT_GROUPS.filter(g=>g.level===level).flatMap(g=>g.ids); }
SUBJECTS.sort((a,b)=>{ const ia = SUBJECT_ORDER.indexOf(a.id), ib = SUBJECT_ORDER.indexOf(b.id); return (ia<0?99:ia) - (ib<0?99:ib); });

/* ano escolar em que cada assunto costuma aparecer, segundo a BNCC (referência aproximada) */
const BNCC_ANO = {adicao:'1º ao 5º ano', subtracao:'1º ao 5º ano', multiplicacao:'2º ao 5º ano', divisao:'3º ao 5º ano',
  fracoes:'4º ao 6º ano', decimais:'4º ao 6º ano', porcentagem:'5º ao 7º ano', regra3:'7º ano', potenciacao:'6º ao 9º ano',
  expressoes:'6º ano', eq1:'7º ano', eq2:'9º ano', sistemas:'8º ano', func1grau:'9º ano e 1º do EM', mmcmdc:'6º ano',
  geometria:'5º ao 7º ano', estatistica:'6º ao 8º ano', dinheiro:'2º ao 5º ano',
  conjuntos:'1º do EM', funcquad:'1º do EM', modular:'1º do EM', exponencial:'1º do EM', logaritmo:'1º do EM',
  functrig:'2º do EM', pa:'1º do EM', pg:'1º do EM', espacial:'2º do EM', analitica:'3º do EM', trigret:'9º ano e 1º do EM',
  ciclo:'2º do EM', identidades:'2º do EM', leis:'2º do EM', combinatoria:'2º do EM', probabilidade:'2º do EM',
  dispersao:'3º do EM', graficos:'6º ano ao EM', juros:'1º do EM', descontos:'1º do EM', inflacao:'1º do EM',
  matrizes:'2º do EM', determinantes:'2º do EM',
  primos:'6º ano', unidades:'5º ao 7º ano', prodnotaveis:'8º ano', pitagoras:'9º ano', semelhanca:'9º ano', casapombos:'6º ao 9º ano (OBMEP)',
  inequacoes:'1º do EM', circunferencia:'3º do EM', polinomios:'3º do EM', complexos:'3º do EM',
  restos:'6º ao 9º ano (OBMEP)', angulos:'6º ao 8º ano', regra3comp:'7º ao 9º ano', logica:'6º ao 9º ano (OBMEP)',
  conicas:'3º do EM', probcond:'2º do EM', parcelamento:'1º do EM'};

/* lista de assuntos com títulos (nível → grupo), igual em todas as telas que listam assuntos.
   makeRow(subject, index) devolve o elemento de cada assunto; index é a posição em SUBJECTS (dá a cor). */
function subjectListGrouped(container, makeRow, onlyIds){
  SUBJECT_LEVELS.forEach(lv=>{
    const groups = SUBJECT_GROUPS.filter(g=>g.level===lv.id)
      .map(g=>({g, list:g.ids.filter(id=> (!onlyIds || onlyIds.includes(id)) && SUBJECTS.some(s=>s.id===id))}))
      .filter(x=>x.list.length);
    if(!groups.length) return;
    container.appendChild(h(`<div class="subj-level">${lv.ico} ${lv.name}</div>`));
    groups.forEach(({g, list})=>{
      container.appendChild(h(`<div class="subj-area"><span>${g.name}</span><small>${list.length} assunto${list.length===1?'':'s'}</small></div>`));
      list.forEach(id=>{ const i = SUBJECTS.findIndex(s=>s.id===id); container.appendChild(makeRow(SUBJECTS[i], i)); });
    });
  });
}

/* lista agrupada com busca em cima: esconde os assuntos que não batem e os títulos
   de grupo que ficaram vazios (a busca ignora acentos: "fracao" acha "Frações") */
function subjectSearchList(container, makeRow){
  const search = h(`<label class="ex-search"><span aria-hidden="true">🔎</span><input type="search" placeholder="Procurar assunto (ex.: fração, porcentagem)" aria-label="Procurar assunto"></label>`);
  const list = h(`<div class="ex-list"></div>`);
  const empty = h(`<p class="ex-empty" hidden>Nenhum assunto com esse nome. Tente outra palavra.</p>`);
  subjectListGrouped(list, (s,u)=>{ const row = makeRow(s,u); row.dataset.name = s.name; return row; });
  container.appendChild(search); container.appendChild(list); container.appendChild(empty);
  const norm = t=> t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  search.querySelector('input').oninput = e=>{
    const q = norm(e.target.value.trim());
    let any = false, area = null, areaHas = false, level = null, levelHas = false;
    const closeArea = ()=>{ if(area) area.hidden = !areaHas; };
    const closeLevel = ()=>{ if(level) level.hidden = !levelHas; };
    [...list.children].forEach(el=>{
      if(el.classList.contains('subj-level')){ closeArea(); closeLevel(); level = el; levelHas = false; area = null; }
      else if(el.classList.contains('subj-area')){ closeArea(); area = el; areaHas = false; }
      else { const ok = !q || norm(el.dataset.name||'').includes(q); el.hidden = !ok; if(ok){ areaHas = levelHas = any = true; } }
    });
    closeArea(); closeLevel();
    empty.hidden = any;
  };
  return list;
}

function fmtSigned(n){ return n>=0? `+ ${n}` : `− ${Math.abs(n)}`; }

function mkSingle(question, answer, steps, columns, qVisual, solvedVisual){ return {type:'single', question, answer, steps, columns, qVisual, solvedVisual}; }
function mkFrac(question, num, den, steps, visual){ return {type:'single', question, answer: num/den, displayAnswer: fracStr(num,den), steps, visual}; }
function mkPair(question, a, b, steps, qVisual, solvedVisual){ return {type:'pair', question, answer:[a,b], steps, qVisual, solvedVisual}; }
function mkXY(question, x, y, steps, qVisual, solvedVisual){ return {type:'xy', question, answer:{x,y}, steps, qVisual, solvedVisual}; }
