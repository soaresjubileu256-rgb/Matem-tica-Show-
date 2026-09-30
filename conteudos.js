/* =========================================================
   Matemática Show — CONTEÚDOS DO ENSINO MÉDIO
   A lista de conteúdos (ENEM / vestibulares) organizada em 7 áreas.
   Cada tópico tem um resumo, as fórmulas principais, um exemplo curto e,
   quando o app já tem aquele assunto, um atalho para estudar ou praticar.
   O "já estudei" fica salvo no jogo de cada conta (loadGame/saveGame).
   Este arquivo só declara funções e constantes: é carregado antes do app.js.
   ========================================================= */

const SYLLABUS = [
  {
    id:'algebra', ico:'ƒ', name:'Álgebra e Funções',
    desc:'Conjuntos numéricos e os principais tipos de função',
    topics:[
      {id:'conjuntos', name:'Conjuntos numéricos',
        sum:'Os números são organizados em conjuntos, um dentro do outro: cada conjunto novo resolve uma conta que o anterior não resolvia.',
        f:['ℕ = {0, 1, 2, 3, …} — naturais', 'ℤ = {…, −2, −1, 0, 1, 2, …} — inteiros', 'ℚ = frações a/b, com b ≠ 0 — racionais', '𝕀 = decimais infinitos sem repetição (√2, π) — irracionais', 'ℝ = ℚ ∪ 𝕀 — reais', 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ'],
        ex:'0,333… = 1/3 é racional; √2 = 1,4142… é irracional.'},
      {id:'afim', name:'Função afim (1º grau)', subject:'func1grau',
        sum:'O gráfico é uma reta. <b>a</b> é a inclinação (quanto y muda quando x anda 1) e <b>b</b> é onde a reta corta o eixo y.',
        f:['f(x) = ax + b, com a ≠ 0', 'a > 0 → crescente · a < 0 → decrescente', 'Raiz (zero): x = −b/a', 'a = (y₂ − y₁)/(x₂ − x₁)'],
        ex:'f(x) = 2x − 6 → raiz em x = 3; corta o eixo y em −6.'},
      {id:'quadratica', name:'Função quadrática (2º grau)', subject:'eq2',
        sum:'O gráfico é uma parábola. Se a > 0 ela abre para cima (tem valor mínimo); se a < 0, abre para baixo (tem valor máximo).',
        f:['f(x) = ax² + bx + c, com a ≠ 0', 'Δ = b² − 4ac', 'x = (−b ± √Δ) / 2a  (Bhaskara)', 'Vértice: xᵥ = −b/2a · yᵥ = −Δ/4a', 'Soma das raízes = −b/a · Produto = c/a'],
        ex:'x² − 5x + 6 = 0 → Δ = 1 → x = 2 ou x = 3.'},
      {id:'modular', name:'Função modular',
        sum:'O módulo é a distância até o zero, por isso nunca é negativo. O gráfico de |x| tem formato de “V”.',
        f:['|x| = x, se x ≥ 0', '|x| = −x, se x < 0', '|x| = k (k > 0) → x = k ou x = −k', '|x| < k → −k < x < k'],
        ex:'|x − 3| = 5 → x − 3 = 5 ou x − 3 = −5 → x = 8 ou x = −2.'},
      {id:'exponencial', name:'Função exponencial',
        sum:'A variável fica no expoente. Aparece em crescimento de populações, juros compostos e decaimento radioativo.',
        f:['f(x) = aˣ, com a > 0 e a ≠ 1', 'a > 1 → crescente · 0 < a < 1 → decrescente', 'Sempre passa por (0, 1) e f(x) > 0', 'aᵐ = aⁿ ⇔ m = n'],
        ex:'2ˣ = 32 → 2ˣ = 2⁵ → x = 5.'},
      {id:'logaritmica', name:'Função logarítmica',
        sum:'O logaritmo é o expoente que falta: é a operação inversa da exponencial.',
        f:['logₐ b = x ⇔ aˣ = b  (a > 0, a ≠ 1, b > 0)', 'log(m·n) = log m + log n', 'log(m/n) = log m − log n', 'log mᵏ = k · log m', 'Mudança de base: logₐ b = log b / log a'],
        ex:'log₂ 8 = 3, porque 2³ = 8.'},
      {id:'funcoes-trig', name:'Funções trigonométricas',
        sum:'Seno e cosseno são funções periódicas: o gráfico se repete como uma onda. Usadas para descrever marés, som e movimentos circulares.',
        f:['f(x) = sen x e f(x) = cos x → período 2π, imagem [−1, 1]', 'f(x) = tg x → período π', 'f(x) = a + b·sen(cx + d) → período 2π/|c|, amplitude |b|'],
        ex:'f(x) = 3 + 2·sen x varia entre 1 e 5.'},
    ]
  },
  {
    id:'progressoes', ico:'aₙ', name:'Progressões e Sequências',
    desc:'Sequências que crescem somando (PA) ou multiplicando (PG)',
    topics:[
      {id:'pa', name:'Progressão Aritmética (PA)',
        sum:'Cada termo é o anterior <b>mais</b> um valor fixo, a razão r.',
        f:['aₙ = a₁ + (n − 1)·r', 'Sₙ = (a₁ + aₙ)·n / 2', 'Termo do meio: b = (a + c)/2'],
        ex:'(3, 7, 11, …): r = 4 → a₁₀ = 3 + 9·4 = 39.'},
      {id:'pg', name:'Progressão Geométrica (PG)',
        sum:'Cada termo é o anterior <b>vezes</b> um valor fixo, a razão q.',
        f:['aₙ = a₁ · qⁿ⁻¹', 'Sₙ = a₁·(qⁿ − 1)/(q − 1), q ≠ 1', 'PG infinita (−1 < q < 1): S = a₁/(1 − q)', 'Termo do meio: b² = a·c'],
        ex:'(2, 6, 18, …): q = 3 → a₅ = 2·3⁴ = 162.'},
    ]
  },
  {
    id:'geometria', ico:'△', name:'Geometria',
    desc:'Plana, espacial e analítica',
    topics:[
      {id:'plana', name:'Geometria plana (áreas e perímetros)', subject:'geometria',
        sum:'Perímetro é a soma dos lados (o contorno). Área é o espaço ocupado pela figura.',
        f:['Retângulo: A = b·h', 'Triângulo: A = b·h/2', 'Trapézio: A = (B + b)·h/2', 'Losango: A = D·d/2', 'Círculo: A = πr² · C = 2πr'],
        ex:'Círculo de raio 3 → A = 9π ≈ 28,3.'},
      {id:'espacial', name:'Geometria espacial (prismas, pirâmides, cilindros, cones e esferas)', lab:true,
        sum:'Sólidos têm três dimensões. O volume mede quanto cabe dentro; a área total é a soma de todas as faces.',
        f:['Prisma e cilindro: V = A_base · h', 'Pirâmide e cone: V = A_base · h / 3', 'Cilindro: V = πr²h', 'Cone: V = πr²h / 3', 'Esfera: V = 4πr³/3 · A = 4πr²'],
        ex:'Cilindro com r = 2 e h = 5 → V = π·4·5 = 20π.'},
      {id:'analitica', name:'Geometria analítica (ponto, reta e circunferência)',
        sum:'Estuda as figuras no plano cartesiano, usando coordenadas (x, y) e equações.',
        f:['Distância: d = √[(x₂ − x₁)² + (y₂ − y₁)²]', 'Ponto médio: M = ((x₁ + x₂)/2, (y₁ + y₂)/2)', 'Reta: y − y₀ = m(x − x₀), m = Δy/Δx', 'Circunferência: (x − a)² + (y − b)² = r²'],
        ex:'Entre (1, 2) e (4, 6): d = √(9 + 16) = 5.'},
    ]
  },
  {
    id:'trigonometria', ico:'θ', name:'Trigonometria',
    desc:'Relações entre ângulos e lados',
    topics:[
      {id:'triangulo-ret', name:'Triângulo retângulo',
        sum:'Num triângulo com um ângulo de 90°, os lados se relacionam pelo Teorema de Pitágoras e pelas razões trigonométricas.',
        f:['a² = b² + c²  (Pitágoras)', 'sen θ = cateto oposto / hipotenusa', 'cos θ = cateto adjacente / hipotenusa', 'tg θ = oposto / adjacente', '30°: sen ½ · cos √3/2 — 45°: √2/2 — 60°: sen √3/2 · cos ½'],
        ex:'Catetos 6 e 8 → hipotenusa = √100 = 10.'},
      {id:'ciclo', name:'Ciclo trigonométrico',
        sum:'Circunferência de raio 1: o cosseno é a coordenada x do ponto, e o seno é a coordenada y.',
        f:['π rad = 180°', 'graus → rad: multiplique por π/180', '1º quadrante: sen +, cos + · 2º: sen + · 3º: tg + · 4º: cos +', 'sen(180° − x) = sen x'],
        ex:'sen 150° = sen 30° = ½; 120° = 2π/3 rad.'},
      {id:'identidades', name:'Identidades trigonométricas',
        sum:'Igualdades que valem para qualquer ângulo. Servem para simplificar expressões e resolver equações.',
        f:['sen²x + cos²x = 1  (relação fundamental)', 'tg x = sen x / cos x', 'sen 2x = 2·sen x·cos x', 'cos 2x = cos²x − sen²x', 'sen(a ± b) = sen a·cos b ± sen b·cos a'],
        ex:'Se sen x = 3/5 (1º quadrante), então cos x = 4/5.'},
      {id:'leis', name:'Leis dos senos e dos cossenos',
        sum:'Valem em <b>qualquer</b> triângulo, não só no retângulo.',
        f:['Lei dos senos: a/sen A = b/sen B = c/sen C = 2R', 'Lei dos cossenos: a² = b² + c² − 2bc·cos A'],
        ex:'b = 3, c = 5, A = 60° → a² = 9 + 25 − 15 = 19 → a = √19.'},
    ]
  },
  {
    id:'estatistica', ico:'%', name:'Estatística e Probabilidade',
    desc:'Contagem, chances e leitura de dados',
    topics:[
      {id:'combinatoria', name:'Análise combinatória',
        sum:'Técnicas para contar possibilidades sem listar uma por uma. Se a ordem importa, é arranjo; se não importa, é combinação.',
        f:['Princípio multiplicativo: m · n', 'n! = n·(n − 1)·…·1', 'Permutação: Pₙ = n!', 'Arranjo: A(n,p) = n!/(n − p)!', 'Combinação: C(n,p) = n!/[p!(n − p)!]'],
        ex:'Escolher 2 de 5 pessoas: C(5,2) = 10.'},
      {id:'probabilidade', name:'Probabilidade',
        sum:'A chance de algo acontecer, de 0 (impossível) a 1 (certeza).',
        f:['P(A) = casos favoráveis / casos possíveis', 'P(não A) = 1 − P(A)', 'P(A ou B) = P(A) + P(B) − P(A e B)', 'Independentes: P(A e B) = P(A)·P(B)'],
        ex:'Tirar número par num dado: 3/6 = ½ = 50%.'},
      {id:'descritiva', name:'Estatística descritiva (média, moda, mediana e desvio padrão)', subject:'estatistica',
        sum:'Resume um conjunto de dados num número. O desvio padrão mostra o quanto os dados se espalham em torno da média.',
        f:['Média: x̄ = soma / quantidade', 'Moda: o valor que mais aparece', 'Mediana: o valor do meio, com os dados em ordem', 'Variância: σ² = Σ(xᵢ − x̄)² / n', 'Desvio padrão: σ = √σ²'],
        ex:'{2, 4, 4, 6}: média 4, moda 4, mediana 4, σ = √2 ≈ 1,41.'},
      {id:'graficos', name:'Análise de gráficos',
        sum:'Cai muito no ENEM: antes de calcular, leia o título, a legenda e as unidades dos eixos.',
        f:['Barras/colunas → comparar quantidades', 'Linhas → ver evolução no tempo', 'Setores (pizza) → partes de um todo: 1% = 3,6°', 'Histograma → dados agrupados em faixas'],
        ex:'Um setor de 90° representa 90/360 = 25% do total.'},
    ]
  },
  {
    id:'financeira', ico:'R$', name:'Matemática Financeira',
    desc:'Porcentagem, juros, descontos e inflação',
    topics:[
      {id:'porcentagem', name:'Porcentagem', subject:'porcentagem',
        sum:'Porcentagem é uma fração de denominador 100. Aumentos e descontos viram multiplicações.',
        f:['x% = x/100', 'Aumento de i%: multiplique por (1 + i)', 'Desconto de i%: multiplique por (1 − i)', 'Variação = (novo − antigo) / antigo'],
        ex:'R$ 80 com aumento de 15% → 80 × 1,15 = R$ 92.'},
      {id:'juros', name:'Juros simples e compostos',
        sum:'No simples, os juros são sempre sobre o valor inicial. No composto, é “juros sobre juros”.',
        f:['Simples: J = C·i·t · M = C·(1 + i·t)', 'Composto: M = C·(1 + i)ᵗ', 'J = M − C', 'i e t na mesma unidade (mês com mês, ano com ano)'],
        ex:'R$ 1.000 a 10% ao mês por 2 meses: simples R$ 1.200; composto R$ 1.210.'},
      {id:'descontos', name:'Descontos',
        sum:'Descontos sucessivos não se somam: cada um é aplicado sobre o valor que sobrou.',
        f:['Valor final = V · (1 − d₁) · (1 − d₂) · …', 'Desconto simples comercial: D = N·i·t'],
        ex:'Descontos de 10% e depois 20% → 0,9 × 0,8 = 0,72 → desconto total de 28% (não 30%).'},
      {id:'inflacao', name:'Taxas de inflação',
        sum:'A inflação mede a perda de poder de compra. Para saber o ganho real, desconte a inflação da taxa de rendimento.',
        f:['Acumulada: (1 + i₁)(1 + i₂)… − 1', 'Taxa real: (1 + i_aparente) / (1 + i_inflação) − 1'],
        ex:'Rendeu 10% com inflação de 4% → 1,10/1,04 − 1 ≈ 5,8% de ganho real.'},
    ]
  },
  {
    id:'matrizes', ico:'[ ]', name:'Matrizes e Sistemas',
    desc:'Tabelas de números e sistemas lineares',
    topics:[
      {id:'matrizes', name:'Matrizes',
        sum:'Tabela de números com m linhas e n colunas. O elemento aᵢⱼ está na linha i e na coluna j.',
        f:['Soma: elemento a elemento (mesma ordem)', 'Produto A·B: só se colunas de A = linhas de B', 'Transposta Aᵗ: troca linhas por colunas', 'Identidade I: 1 na diagonal, 0 no resto'],
        ex:'Uma matriz 2×3 vezes uma 3×4 dá uma matriz 2×4.'},
      {id:'determinantes', name:'Determinantes',
        sum:'Número associado a uma matriz quadrada. Se det = 0, a matriz não tem inversa.',
        f:['2×2: det = ad − bc', '3×3: regra de Sarrus', 'det(A·B) = det A · det B', 'det(k·A) = kⁿ · det A  (A de ordem n)'],
        ex:'| 3 1 ; 2 4 | → det = 3·4 − 1·2 = 10.'},
      {id:'sistemas-lineares', name:'Resolução de sistemas lineares', subject:'sistemas',
        sum:'Várias equações que precisam valer ao mesmo tempo. Resolva por substituição, adição (escalonamento) ou pela regra de Cramer.',
        f:['SPD: uma única solução (det ≠ 0)', 'SPI: infinitas soluções', 'SI: nenhuma solução', 'Cramer: x = Dₓ/D, y = Dᵧ/D'],
        ex:'x + y = 10 e x − y = 2 → somando: 2x = 12 → x = 6, y = 4.'},
    ]
  },
];

function syllabusAllTopics(){ return SYLLABUS.flatMap(a=>a.topics); }
function syllabusDone(){ const g = loadGame(); return g.syllabus = g.syllabus || {}; }
function syllabusToggle(topicId){
  const done = syllabusDone();
  if(done[topicId]) delete done[topicId]; else done[topicId] = Date.now();
  saveGame();
}

function syllabusScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Conteúdos do Ensino Médio', true, ()=>go('content')));
  const c = h(`<div class="content syl"></div>`);
  const all = syllabusAllTopics();
  const done = syllabusDone();
  c.appendChild(h(`<div class="syl-hero">
    <div class="syl-hero-top"><span class="syl-hero-ico">🎓</span><div><h2>O que cai na prova</h2><p>${SYLLABUS.length} áreas · ${all.length} tópicos, com resumo, fórmulas e exemplo</p></div></div>
    <div class="syl-bar"><span></span></div>
    <div class="syl-hero-count"></div>
  </div>`));
  // contadores (barra do topo e "x/y" de cada área): atualizados sem redesenhar a tela
  const paintCounts = ()=>{
    const count = all.filter(t=>done[t.id]).length, pct = Math.round(count / all.length * 100);
    c.querySelector('.syl-bar span').style.width = pct + '%';
    c.querySelector('.syl-hero-count').innerHTML = `<b>${count}</b> de ${all.length} estudados · ${pct}%`;
    SYLLABUS.forEach(a=>{
      const el = c.querySelector(`[data-area="${a.id}"]`), n = a.topics.filter(t=>done[t.id]).length;
      if(el){ el.textContent = `${n}/${a.topics.length}`; el.classList.toggle('full', n===a.topics.length); }
    });
  };

  // índice rápido: um chip por área, pula direto para ela
  const idx = h(`<div class="syl-index"></div>`);
  SYLLABUS.forEach((a,u)=>{
    const chip = h(`<button type="button" class="syl-chip" style="${unitStyle(u)}"><span class="mono">${a.ico}</span>${a.name}</button>`);
    chip.onclick = ()=>{ const el = c.querySelector(`#syl-${a.id}`); if(el){ el.open = true; el.scrollIntoView({behavior:'smooth', block:'start'}); } };
    idx.appendChild(chip);
  });
  c.appendChild(idx);

  SYLLABUS.forEach((a,u)=>{
    const area = h(`<details class="syl-area" id="syl-${a.id}" style="${unitStyle(u)}"${state.sylOpen===a.id?' open':''}>
      <summary><span class="syl-num">${u+1}</span><span class="syl-area-t"><b>${a.name}</b><small>${a.desc}</small></span><span class="syl-area-n" data-area="${a.id}"></span></summary>
      <div class="syl-topics"></div>
    </details>`);
    area.addEventListener('toggle', ()=>{ if(area.open) state.sylOpen = a.id; });
    const list = area.querySelector('.syl-topics');
    a.topics.forEach(t=>{
      const s = t.subject && SUBJECTS.find(x=>x.id===t.subject);
      const item = h(`<details class="syl-topic${done[t.id]?' done':''}">
        <summary><span class="syl-check">${done[t.id]?'✓':''}</span><span class="syl-topic-name">${t.name}</span>${s||t.lab?'<span class="syl-tag">no app</span>':''}</summary>
        <div class="syl-body">
          <p>${t.sum}</p>
          <div class="syl-formulas">${t.f.map(x=>`<div class="mono">${x}</div>`).join('')}</div>
          <div class="syl-ex"><span>Exemplo</span>${t.ex}</div>
          <div class="cta-row"></div>
        </div>
      </details>`);
      const cta = item.querySelector('.cta-row');
      if(s){
        const learn = h(`<button type="button" class="btn secondary">📖 Estudar “${s.name}”</button>`);
        learn.onclick = ()=> go('subjectDetail', {subjectId:s.id, subjectBack:'syllabus', sylOpen:a.id});
        const practice = h(`<button type="button" class="btn secondary">✍️ Praticar</button>`);
        practice.onclick = ()=> go('exerciseDifficulty', {subjectId:s.id});
        cta.append(learn, practice);
      }
      if(t.lab){
        const lab = h(`<button type="button" class="btn secondary">🔺 Laboratório de Geometria</button>`);
        lab.onclick = ()=> go('geoLab', {geoBack:'syllabus', sylOpen:a.id});
        cta.appendChild(lab);
      }
      const mark = h(`<button type="button" class="btn"></button>`);
      const paint = ()=>{
        const on = !!done[t.id];
        item.classList.toggle('done', on);
        item.querySelector('.syl-check').textContent = on ? '✓' : '';
        mark.className = 'btn ' + (on ? 'secondary' : 'primary');
        mark.textContent = on ? 'Desmarcar' : '✓ Já estudei';
      };
      mark.onclick = ()=>{ syllabusToggle(t.id); paint(); paintCounts(); };
      paint();
      cta.appendChild(mark);
      list.appendChild(item);
    });
    c.appendChild(area);
  });
  paintCounts();
  c.appendChild(h(`<p class="syl-foot">Toque num tópico para ver o resumo. Os marcados com <span class="syl-tag">no app</span> têm explicação completa e exercícios aqui no Matemática Show.</p>`));
  wrap.appendChild(c);
  return wrap;
}
