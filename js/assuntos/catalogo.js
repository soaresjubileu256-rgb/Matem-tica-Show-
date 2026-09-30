/* =========================================================
   CATÁLOGO DE ASSUNTOS
   Ordem dos assuntos, ano escolar (BNCC), áreas do Ensino Médio e os
   formatos de questão (mkSingle, mkFrac, mkPair, mkXY).
   ========================================================= */
/* ordem dos assuntos no app (Trilha, Aprender, Exercícios...): a ordem em que aparecem na escola */
const SUBJECT_ORDER = ['adicao','subtracao','multiplicacao','divisao','dinheiro','fracoes','decimais','porcentagem','geometria',
  'mmcmdc','potenciacao','expressoes','estatistica','regra3','eq1','sistemas','eq2','func1grau',
  // Ensino Médio
  'conjuntos','funcquad','modular','exponencial','logaritmo','pa','pg','juros','descontos','inflacao','trigret','espacial',
  'ciclo','functrig','identidades','leis','combinatoria','probabilidade','graficos','dispersao','matrizes','determinantes','analitica'];
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
  matrizes:'2º do EM', determinantes:'2º do EM'};

/* como os assuntos aparecem agrupados em Aprender e Exercícios */
const SUBJECT_AREAS = [
  {name:'Álgebra e Funções', ids:['conjuntos','func1grau','funcquad','modular','exponencial','logaritmo','functrig']},
  {name:'Progressões e Sequências', ids:['pa','pg']},
  {name:'Geometria', ids:['geometria','espacial','analitica']},
  {name:'Trigonometria', ids:['trigret','ciclo','identidades','leis']},
  {name:'Estatística e Probabilidade', ids:['combinatoria','probabilidade','estatistica','dispersao','graficos']},
  {name:'Matemática Financeira', ids:['porcentagem','juros','descontos','inflacao']},
  {name:'Matrizes e Sistemas', ids:['matrizes','determinantes','sistemas']},
];
/* lista de assuntos com títulos: primeiro o Fundamental (o que não está em nenhuma área), depois as áreas do Ensino Médio */
function subjectListWithAreas(container, makeRow){
  const inArea = new Set(SUBJECT_AREAS.flatMap(a=>a.ids));
  const idx = id=> SUBJECTS.findIndex(s=>s.id===id);
  const sec = (title, sub)=> container.appendChild(h(`<div class="subj-area"><span>${title}</span>${sub?`<small>${sub}</small>`:''}</div>`));
  container.appendChild(h(`<div class="subj-level">📘 Ensino Fundamental</div>`));
  SUBJECTS.filter(s=>!inArea.has(s.id)).forEach(s=> container.appendChild(makeRow(s, idx(s.id))));
  container.appendChild(h(`<div class="subj-level">🎓 Ensino Médio</div>`));
  SUBJECT_AREAS.forEach(a=>{
    const list = a.ids.filter(id=>idx(id)>=0);
    sec(a.name, `${list.length} assunto${list.length===1?'':'s'}`);
    list.forEach(id=> container.appendChild(makeRow(SUBJECTS[idx(id)], idx(id))));
  });
}

function fmtSigned(n){ return n>=0? `+ ${n}` : `− ${Math.abs(n)}`; }

function mkSingle(question, answer, steps, columns, qVisual, solvedVisual){ return {type:'single', question, answer, steps, columns, qVisual, solvedVisual}; }
function mkFrac(question, num, den, steps, visual){ return {type:'single', question, answer: num/den, displayAnswer: fracStr(num,den), steps, visual}; }
function mkPair(question, a, b, steps, qVisual, solvedVisual){ return {type:'pair', question, answer:[a,b], steps, qVisual, solvedVisual}; }
function mkXY(question, x, y, steps, qVisual, solvedVisual){ return {type:'xy', question, answer:{x,y}, steps, qVisual, solvedVisual}; }
