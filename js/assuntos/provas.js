/* =========================================================
   PROVAS — o que mais cai em Matemática no ENEM, na ETEC e nos vestibulares
   Cada prova lista os assuntos do app em três faixas:
     muito    🔥 cai muito (quase toda edição)
     bastante ⭐ cai bastante
     vezes    ✓ às vezes cai
   e "extra": temas que caem mas ainda não têm assunto próprio no app.
   Fonte: levantamentos de provas anteriores publicados por cursinhos e sites de educação
   (ex.: Professor Ferretto, Aprova Total, Estratégia, Passaporte ETEC, CNN Brasil).
   É uma orientação de estudo, não uma regra: sempre vale conferir o edital de cada prova.
   Pra acrescentar uma prova: copie um bloco de EXAMS e troque os assuntos (ids de SUBJECTS).
   ========================================================= */
const EXAM_LEVELS = [
  {id:'muito',    ico:'🔥', name:'Cai muito',    sub:'Aparece em quase toda edição'},
  {id:'bastante', ico:'⭐', name:'Cai bastante', sub:'Aparece com frequência'},
  {id:'vezes',    ico:'✓',  name:'Às vezes cai', sub:'Vale revisar depois dos outros'},
];
const EXAMS = [
  {id:'enem', name:'ENEM', full:'Exame Nacional do Ensino Médio', ico:'🎓', color:'#4C7DFF', color2:'#2F55D4', level:'em',
    who:'Quem está terminando ou já terminou o Ensino Médio. A nota abre portas pro SISU, ProUni e Fies.',
    format:'45 questões de Matemática no 2º dia, todas com texto de apoio e 5 alternativas. A nota é calculada pela TRI: errar questões fáceis e acertar difíceis pesa contra.',
    tip:'Quase toda questão traz uma situação real com gráfico, tabela ou figura. Leia com calma, sublinhe os dados e confira as unidades. Porcentagem aparece dentro de muitas questões.',
    topics:{
      muito:['porcentagem','regra3','estatistica','graficos','espacial','geometria','fracoes'],
      bastante:['decimais','eq1','func1grau','funcquad','probabilidade','combinatoria','juros','dispersao'],
      vezes:['potenciacao','eq2','trigret','pa','pg','exponencial','logaritmo','analitica','sistemas'],
    },
    extra:['Escalas de mapas e plantas baixas','Conversão de unidades de medida','Teorema de Pitágoras','Leitura de infográficos']},
  {id:'etec', name:'ETEC', full:'Vestibulinho das Etecs (SP)', ico:'🏫', color:'#12B886', color2:'#0B8A64', level:'fund',
    who:'Quem está no 9º ano ou já terminou o Ensino Fundamental e quer fazer o Ensino Médio integrado ao técnico.',
    format:'Prova de 50 questões de várias matérias, com 5 alternativas. As questões misturam assuntos e trazem textos, gráficos e tabelas.',
    tip:'A Matemática da ETEC se repete muito: porcentagem, regra de três, frações e leitura de gráficos aparecem quase todo ano. Treine fazer as contas sem calculadora.',
    topics:{
      muito:['porcentagem','regra3','fracoes','decimais','estatistica','geometria','eq1'],
      bastante:['graficos','dinheiro','mmcmdc','potenciacao','expressoes'],
      vezes:['eq2','sistemas','multiplicacao','divisao','juros'],
    },
    extra:['Unidades de medida (km, m, L, mL, kg)','Escala de mapas','Teorema de Pitágoras','Juros simples']},
  {id:'fuvest', name:'Fuvest', full:'Vestibular da USP', ico:'🏛️', color:'#B23FE0', color2:'#7B2BB0', level:'em',
    who:'Quem quer entrar na USP (Universidade de São Paulo).',
    format:'1ª fase com questões de todas as matérias e 5 alternativas. 2ª fase com questões escritas (dissertativas), em que conta o raciocínio.',
    tip:'Matemática básica (porcentagem, proporção, equações) ainda é o que mais cai, mas a Fuvest cobra bem geometria espacial, funções e trigonometria. Na 2ª fase, mostre todas as contas.',
    topics:{
      muito:['porcentagem','regra3','eq1','func1grau','funcquad','espacial','geometria','trigret'],
      bastante:['ciclo','leis','probabilidade','combinatoria','analitica','pa','pg','logaritmo','exponencial'],
      vezes:['matrizes','determinantes','sistemas','modular','dispersao','juros','identidades'],
    },
    extra:['Polinômios','Números complexos','Inequações','Circunferência e polígonos regulares']},
  {id:'unicamp', name:'Unicamp', full:'Vestibular da Unicamp', ico:'🔬', color:'#FF7A00', color2:'#D35400', level:'em',
    who:'Quem quer entrar na Unicamp (Universidade Estadual de Campinas).',
    format:'1ª fase com questões objetivas de todas as matérias. 2ª fase com questões escritas por área.',
    tip:'Geometria plana, funções e geometria espacial lideram. Geometria analítica e matrizes aparecem mais aqui do que no ENEM.',
    topics:{
      muito:['geometria','func1grau','funcquad','espacial','analitica'],
      bastante:['eq2','sistemas','matrizes','determinantes','probabilidade','pa','pg'],
      vezes:['trigret','ciclo','juros','combinatoria','estatistica','regra3','exponencial','logaritmo'],
    },
    extra:['Polinômios','Números complexos']},
  {id:'unesp', name:'Unesp', full:'Vestibular da Unesp', ico:'📐', color:'#F06595', color2:'#C2255C', level:'em',
    who:'Quem quer entrar na Unesp (Universidade Estadual Paulista).',
    format:'1ª fase de conhecimentos gerais com questões objetivas. 2ª fase com questões escritas.',
    tip:'Proporcionalidade (razão, proporção e regra de três) é o tema campeão. Depois vêm geometria e funções.',
    topics:{
      muito:['regra3','porcentagem','geometria','espacial','func1grau'],
      bastante:['funcquad','trigret','probabilidade','combinatoria','estatistica','pa','pg'],
      vezes:['logaritmo','exponencial','analitica','matrizes','juros','eq2'],
    },
    extra:['Polinômios','Números complexos']},
  {id:'obmep', name:'OBMEP', full:'Olimpíada Brasileira de Matemática das Escolas Públicas', ico:'🏅', color:'#FFB800', color2:'#E09A00', level:'fund',
    who:'Alunos do 6º ano ao Ensino Médio. Nível 1 (6º e 7º ano), Nível 2 (8º e 9º ano) e Nível 3 (Ensino Médio).',
    format:'1ª fase com 20 questões de 5 alternativas. 2ª fase com questões discursivas pra quem passa.',
    tip:'A OBMEP cobra raciocínio mais do que fórmula: desenhe, teste casos pequenos e procure padrões. Frações, MMC/MDC, contagem e áreas aparecem muito.',
    topics:{
      muito:['fracoes','mmcmdc','geometria','combinatoria','eq1','porcentagem'],
      bastante:['decimais','regra3','sistemas','potenciacao','probabilidade','expressoes'],
      vezes:['eq2','estatistica','pa','divisao'],
    },
    extra:['Raciocínio lógico e padrões','Sequências','Ângulos e Teorema de Pitágoras','Paridade e divisibilidade']},
];
function examById(id){ return EXAMS.find(e=>e.id===id); }
/* assuntos da prova que existem no app, em ordem de importância */
function examTopicIds(exam, levels){
  return (levels || ['muito','bastante','vezes']).flatMap(l=> exam.topics[l]||[]).filter(id=> SUBJECTS.some(s=>s.id===id));
}
/* em quais provas um assunto cai: [{exam, lvl}] (mais importantes primeiro) */
function examsForSubject(sid){
  const order = {muito:0, bastante:1, vezes:2};
  const out = [];
  EXAMS.forEach(e=>{ for(const l of ['muito','bastante','vezes']) if((e.topics[l]||[]).includes(sid)){ out.push({exam:e, lvl:l}); break; } });
  return out.sort((a,b)=> order[a.lvl]-order[b.lvl]);
}
/* etiquetas curtas "ENEM 🔥 · ETEC" pras listas de assuntos */
function examTagsHTML(sid, max){
  const list = examsForSubject(sid);
  if(!list.length) return '';
  const shown = list.slice(0, max || 3);
  return `<span class="pv-tags">${shown.map(x=>`<i class="pv-tag ${x.lvl}" style="--c:${x.exam.color}">${x.exam.name}${x.lvl==='muito'?' 🔥':''}</i>`).join('')}${list.length>shown.length?`<i class="pv-tag more">+${list.length-shown.length}</i>`:''}</span>`;
}
/* quanto da prova a pessoa já domina: assuntos de "cai muito" e "cai bastante" com nível Proficiente ou Dominado */
function examReadiness(exam){
  const ids = examTopicIds(exam, ['muito','bastante']);
  const ready = ids.filter(id=> masterySync(id).lvl>=3).length;
  const started = ids.filter(id=> masterySync(id).lvl>=1).length;
  return {ids, ready, started, total:ids.length, pct: ids.length ? Math.round(ready/ids.length*100) : 0};
}
