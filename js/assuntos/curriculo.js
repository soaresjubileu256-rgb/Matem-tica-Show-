/* =========================================================
   CURRÍCULO — objetivo, pré-requisitos e habilidades da BNCC de cada assunto
   - objetivo: o que a pessoa consegue fazer ao final (linguagem do aluno)
   - prereqs: ids de assuntos que ajudam a aprender este (sem ciclos; um teste confere)
   - bncc: códigos de habilidades da BNCC que correspondem DIRETAMENTE ao assunto.
     Só entra código conferido (ver BNCC_HABILIDADES e docs/BNCC.md). Assunto sem
     correspondência direta fica com lista vazia e uma nota explicando — nada inventado.
   O critério de domínio é o mesmo para todos (masteryOf, em js/telas/inicio.js).
   ========================================================= */

/* Habilidades usadas, com um RESUMO do conteúdo (não é a redação oficial) e as fontes onde o
   código e o texto foram conferidos (outubro de 2026). O site do MEC não pôde ser acessado
   deste ambiente: cada código foi aceito só com 2 ou mais fontes independentes concordando.
   Para citação formal, confira a redação no documento oficial da BNCC. */
const BNCC_HABILIDADES = {
  EF03MA05: {ano:'3º ano', resumo:'Usar procedimentos de cálculo mental e escrito em problemas de adição e subtração com números naturais.', fontes:['tudosaladeaula.com (habilidades do 3º ano)','propei.uerr.edu.br (produto educacional)']},
  EF03MA06: {ano:'3º ano', resumo:'Resolver e elaborar problemas de adição e subtração (juntar, acrescentar, separar, retirar, comparar, completar), com cálculo exato, aproximado ou mental.', fontes:['tudosaladeaula.com (habilidades do 3º ano)','novaescola.org.br (planos de aula do 3º ano)']},
  EF03MA24: {ano:'3º ano', resumo:'Resolver e elaborar problemas de comparação e equivalência de valores monetários do sistema brasileiro (compra, venda, troca).', fontes:['profez.com.br','novaescola.org.br (planos de aula do 3º ano)','tudosaladeaula.com']},
  EF04MA06: {ano:'4º ano', resumo:'Resolver e elaborar problemas de multiplicação (adição de parcelas iguais, organização retangular, proporcionalidade) com estimativa, cálculo mental e algoritmos.', fontes:['funes.uniandes.edu.co (Vieira, 2021)','novaescola.org.br (planos do 4º ano)','tudosaladeaula.com']},
  EF04MA07: {ano:'4º ano', resumo:'Resolver e elaborar problemas de divisão com divisor de até dois algarismos (repartição e medida), com estimativa, cálculo mental e algoritmos.', fontes:['novaescola.org.br (planos do 4º ano)','tudosaladeaula.com (habilidades do 4º ano)']},
  EF06MA07: {ano:'6º ano', resumo:'Compreender, comparar e ordenar frações (parte de inteiros e resultado de divisão) e identificar frações equivalentes.', fontes:['novaescola.org.br/planos-de-aula/habilidades/EF06MA07','profez.com.br','tudosaladeaula.com']},
  EF06MA10: {ano:'6º ano', resumo:'Resolver e elaborar problemas de adição e subtração com números racionais positivos na forma de fração.', fontes:['tudosaladeaula.com (habilidades do 6º ano)','projecao.br (documento curricular)']},
  EF06MA11: {ano:'6º ano', resumo:'Resolver e elaborar problemas com números racionais positivos na forma decimal, com as quatro operações e potenciação, usando estimativas e arredondamentos.', fontes:['seduc.ce.gov.br (correlação de Matemática 2023)','docs.google.com (plano de ensino)','tudosaladeaula.com']},
  EF06MA13: {ano:'6º ano', resumo:'Resolver e elaborar problemas de porcentagem pela ideia de proporcionalidade, sem regra de três, com estratégias pessoais, cálculo mental e calculadora.', fontes:['periodicos.uffs.edu.br','todamateria.com.br (planos do 6º ano)','anais-siiepe.ufpel.edu.br (2024)']},
  EF07MA01: {ano:'7º ano', resumo:'Resolver e elaborar problemas com números naturais envolvendo divisor e múltiplo (podendo incluir MDC e MMC) por estratégias diversas.', fontes:['profez.com.br','tudosaladeaula.com (habilidades do 7º ano)','novaescola.org.br (planos de MMC e MDC)']},
  EF07MA02: {ano:'7º ano', resumo:'Resolver e elaborar problemas de porcentagem, como acréscimos e decréscimos simples, com cálculo mental e calculadora (educação financeira).', fontes:['profez.com.br','novaescola.org.br (planos do 7º ano)','portal.educacao.go.gov.br']},
  EF07MA17: {ano:'7º ano', resumo:'Resolver e elaborar problemas de proporcionalidade direta e inversa entre duas grandezas, usando sentença algébrica.', fontes:['profez.com.br','novaescola.org.br (planos de proporcionalidade)']},
  EF07MA18: {ano:'7º ano', resumo:'Resolver e elaborar problemas representados por equações polinomiais de 1º grau redutíveis a ax + b = c, usando as propriedades da igualdade.', fontes:['profez.com.br','publicacoeseventos.unijui.edu.br','educapes.capes.gov.br (produto educacional)']},
  EF07MA31: {ano:'7º ano', resumo:'Estabelecer expressões de cálculo de área de triângulos e de quadriláteros.', fontes:['profez.com.br','tudosaladeaula.com (habilidades do 7º ano)','todamateria.com.br (plano de aula)']},
  EF07MA32: {ano:'7º ano', resumo:'Resolver e elaborar problemas de área de figuras planas que podem ser decompostas em quadrados, retângulos e/ou triângulos.', fontes:['profez.com.br','todamateria.com.br','tudosaladeaula.com']},
  EF08MA01: {ano:'8º ano', resumo:'Efetuar cálculos com potências de expoentes inteiros e usar notação científica.', fontes:['profez.com.br','novaescola.org.br (planos do 8º ano)']},
  EF08MA08: {ano:'8º ano', resumo:'Resolver e elaborar problemas representados por sistemas de equações de 1º grau com duas incógnitas e interpretar as soluções (plano cartesiano como recurso).', fontes:['tudosaladeaula.com (habilidades do 8º ano)','novaescola.org.br (planos de sistemas)','profez.com.br']},
  EF08MA25: {ano:'8º ano', resumo:'Obter média, moda e mediana de uma pesquisa estatística, compreender seus significados e relacioná-los com a dispersão (amplitude).', fontes:['editoradobrasil.com.br (MAT8)','educa.ibge.gov.br','profez.com.br']},
  EF09MA05: {ano:'9º ano', resumo:'Resolver e elaborar problemas com porcentagens sucessivas e determinação de taxas percentuais (educação financeira).', fontes:['profez.com.br','editoradobrasil.com.br (MAT9)','novaescola.org.br (planos do 9º ano)']},
  EF09MA06: {ano:'9º ano', resumo:'Compreender funções como relações de dependência unívoca entre duas variáveis, com representações numérica, algébrica e gráfica.', fontes:['editoradobrasil.com.br (MAT9)','novaescola.org.br (planos de funções)','planos.professormg.com.br']},
  EF09MA09: {ano:'9º ano', resumo:'Compreender a fatoração de expressões algébricas (produtos notáveis) para resolver problemas com equações polinomiais do 2º grau.', fontes:['educapes.capes.gov.br (plano de aula EF09MA09)','novaescola.org.br (planos de fatoração)','profez.com.br']},
  EF09MA14: {ano:'9º ano', resumo:'Resolver e elaborar problemas de aplicação do teorema de Pitágoras ou das relações de proporcionalidade entre retas paralelas cortadas por secantes.', fontes:['periodicos.ufms.br','editoradobrasil.com.br (MAT9)','novaescola.org.br']},
  EM13MAT102: {ano:'Ensino Médio', resumo:'Analisar tabelas, gráficos e amostras de pesquisas divulgadas na mídia, identificando inadequações que induzam a erros (escalas, amostras).', fontes:['profez.com.br','consed.org.br (análise da BNCC do EM)','jieem.pgsscogna.com.br']},
  EM13MAT104: {ano:'Ensino Médio', resumo:'Interpretar taxas e índices socioeconômicos (IDH, inflação…) investigando como são calculados.', fontes:['funes.uniandes.edu.co (Pavan, 2021)','revista.uepb.edu.br']},
  EM13MAT301: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com equações lineares simultâneas, com técnicas algébricas e gráficas.', fontes:['profez.com.br','seduc.ce.gov.br (Matemática Básica III)']},
  EM13MAT302: {ano:'Ensino Médio', resumo:'Construir modelos com funções polinomiais de 1º ou 2º graus para resolver problemas em contextos diversos.', fontes:['ufrgs.br (PIBID — avaliações do 1º ano)','portal.educacao.go.gov.br']},
  EM13MAT303: {ano:'Ensino Médio', resumo:'Interpretar e comparar juros simples e compostos (gráficos ou planilhas), destacando o crescimento linear ou exponencial.', fontes:['profez.com.br','revista.uepb.edu.br','funes.uniandes.edu.co']},
  EM13MAT304: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com funções exponenciais (ex.: Matemática Financeira, crescimento de micro-organismos).', fontes:['tedebc.ufma.br','educapes.capes.gov.br (PROFMAT)','consed.org.br']},
  EM13MAT305: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com funções logarítmicas (ex.: abalos sísmicos, pH, radioatividade, finanças).', fontes:['tedebc.ufma.br','profez.com.br','consed.org.br']},
  EM13MAT306: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com fenômenos periódicos reais e comparar com gráficos das funções seno e cosseno.', fontes:['www2.faccat.br (trigonometria)','profez.com.br','educapes.capes.gov.br']},
  EM13MAT308: {ano:'Ensino Médio', resumo:'Aplicar relações métricas, incluindo as leis do seno e do cosseno, ou congruência e semelhança, em problemas com triângulos.', fontes:['profez.com.br','www2.faccat.br','cempem.fe.unicamp.br (plano de aula)']},
  EM13MAT309: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com áreas totais e volumes de prismas, pirâmides e corpos redondos.', fontes:['profez.com.br','s.educacaoadventista.org.br (calendários avaliativos)']},
  EM13MAT310: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas de contagem (agrupamentos ordenáveis ou não) pelos princípios multiplicativo e aditivo.', fontes:['profez.com.br','docs.google.com (guia escolar)','educapes.capes.gov.br']},
  EM13MAT311: {ano:'Ensino Médio', resumo:'Identificar e descrever o espaço amostral de eventos aleatórios para resolver problemas de probabilidade.', fontes:['profez.com.br','educapes.capes.gov.br (recurso educacional)']},
  EM13MAT316: {ano:'Ensino Médio', resumo:'Resolver e elaborar problemas com medidas de tendência central (média, moda, mediana) e de dispersão (amplitude, variância, desvio padrão).', fontes:['raw.githack.com/estmat-ufv (UFV)','anec.org.br (BNCC EM comentada)','profez.com.br']},
  EM13MAT503: {ano:'Ensino Médio', resumo:'Investigar pontos de máximo ou de mínimo de funções quadráticas em contextos diversos.', fontes:['canaleducacao.tv (planos de aula)','portal.educacao.go.gov.br']},
  EM13MAT507: {ano:'Ensino Médio', resumo:'Identificar e associar progressões aritméticas (PA) a funções afins de domínio discreto.', fontes:['portal.educacao.go.gov.br (DC-GO)','educapes.capes.gov.br','planos.professormg.com.br']},
  EM13MAT508: {ano:'Ensino Médio', resumo:'Identificar e associar progressões geométricas (PG) a funções exponenciais de domínio discreto.', fontes:['educapes.capes.gov.br (UFMT)','profez.com.br']},
};

const CURRICULO = {
  // ---- 1º ao 5º ano
  adicao:       {objetivo:'Somar números naturais de cabeça e com a conta armada (com "vai um") e resolver problemas de juntar e acrescentar.', prereqs:[], bncc:['EF03MA05','EF03MA06']},
  subtracao:    {objetivo:'Subtrair números naturais, com e sem empréstimo, e resolver problemas de tirar, comparar e completar.', prereqs:['adicao'], bncc:['EF03MA05','EF03MA06']},
  multiplicacao:{objetivo:'Multiplicar números naturais (tabuada e conta armada) e reconhecer quando um problema pede multiplicação.', prereqs:['adicao'], bncc:['EF04MA06']},
  divisao:      {objetivo:'Dividir números naturais, entender o resto e usar a divisão para repartir e para medir quantas vezes cabe.', prereqs:['multiplicacao','subtracao'], bncc:['EF04MA07']},
  dinheiro:     {objetivo:'Fazer contas com reais e centavos: somar preços, calcular troco e dividir uma conta.', prereqs:['adicao','subtracao'], bncc:['EF03MA24']},
  // ---- 6º e 7º ano
  fracoes:      {objetivo:'Comparar frações, encontrar frações equivalentes e somar e subtrair frações.', prereqs:['multiplicacao','divisao'], bncc:['EF06MA07','EF06MA10']},
  decimais:     {objetivo:'Ler, comparar e fazer as quatro operações com números decimais, alinhando vírgula com vírgula.', prereqs:['divisao','fracoes'], bncc:['EF06MA11']},
  porcentagem:  {objetivo:'Calcular porcentagens de um valor e resolver problemas de aumento e desconto.', prereqs:['fracoes','decimais'], bncc:['EF06MA13','EF07MA02']},
  geometria:    {objetivo:'Calcular perímetro e área de retângulos, triângulos, trapézios e figuras formadas por eles, com a unidade certa.', prereqs:['multiplicacao','divisao'], bncc:['EF07MA31','EF07MA32']},
  mmcmdc:       {objetivo:'Encontrar múltiplos e divisores, o MMC e o MDC, e usá-los em problemas de encontros e de repartir em partes iguais.', prereqs:['multiplicacao','divisao'], bncc:['EF07MA01']},
  potenciacao:  {objetivo:'Calcular potências e raízes quadradas exatas e usar as propriedades das potências.', prereqs:['multiplicacao'], bncc:['EF08MA01'], nota:'A BNCC trata potências em várias habilidades (6º ao 9º ano). Raízes quadradas exatas não têm uma habilidade só para elas.'},
  expressoes:   {objetivo:'Resolver expressões numéricas na ordem certa: parênteses, potências, multiplicações e divisões, depois somas e subtrações.', prereqs:['adicao','subtracao','multiplicacao','divisao','potenciacao'], bncc:[], nota:'A ordem das operações aparece dentro de várias habilidades de cálculo; não há uma habilidade da BNCC só para expressões numéricas.'},
  estatistica:  {objetivo:'Calcular média, moda e mediana e dizer o que cada uma conta sobre os dados.', prereqs:['adicao','divisao'], bncc:['EF08MA25']},
  regra3:       {objetivo:'Reconhecer grandezas direta e inversamente proporcionais e resolver problemas com regra de três.', prereqs:['fracoes','multiplicacao','divisao'], bncc:['EF07MA17']},
  eq1:          {objetivo:'Resolver equações do 1º grau mantendo a igualdade equilibrada e montar a equação de um problema.', prereqs:['expressoes'], bncc:['EF07MA18']},
  // ---- 8º e 9º ano
  sistemas:     {objetivo:'Resolver sistemas de duas equações do 1º grau (substituição ou adição) e conferir a solução nas duas equações.', prereqs:['eq1'], bncc:['EF08MA08','EM13MAT301']},
  eq2:          {objetivo:'Resolver equações do 2º grau por fatoração ou pela fórmula de Bhaskara e interpretar quantas soluções existem.', prereqs:['eq1','potenciacao'], bncc:['EF09MA09']},
  func1grau:    {objetivo:'Entender a função afim como relação entre duas grandezas: calcular valores, achar a raiz e ler o gráfico.', prereqs:['eq1'], bncc:['EF09MA06','EM13MAT302']},
  // ---- Ensino Médio
  conjuntos:    {objetivo:'Reconhecer naturais, inteiros, racionais e irracionais e transformar dízimas periódicas em fração.', prereqs:['fracoes','decimais','potenciacao'], bncc:[], nota:'Os conjuntos numéricos não têm uma habilidade específica na BNCC do Ensino Médio; aparecem como base de outras habilidades.'},
  funcquad:     {objetivo:'Calcular valores, raízes e o vértice da função do 2º grau e usar o vértice em problemas de máximo e mínimo.', prereqs:['eq2','func1grau'], bncc:['EM13MAT302','EM13MAT503']},
  modular:      {objetivo:'Calcular módulos, avaliar funções com módulo e resolver equações como |x − a| = b.', prereqs:['func1grau'], bncc:[], nota:'A função modular não é citada diretamente nas habilidades da BNCC do Ensino Médio; é cobrada em vestibulares.'},
  exponencial:  {objetivo:'Resolver equações exponenciais simples e usar a função exponencial em crescimento e decrescimento.', prereqs:['potenciacao','func1grau'], bncc:['EM13MAT304']},
  logaritmo:    {objetivo:'Calcular logaritmos, usar suas propriedades e resolver problemas que pedem log (como tempo de crescimento).', prereqs:['exponencial'], bncc:['EM13MAT305']},
  functrig:     {objetivo:'Ler período, amplitude e valores das funções seno e cosseno e relacioná-las a fenômenos que se repetem.', prereqs:['ciclo'], bncc:['EM13MAT306']},
  pa:           {objetivo:'Encontrar termos e a soma de uma progressão aritmética e reconhecer a PA como uma função afim.', prereqs:['func1grau'], bncc:['EM13MAT507']},
  pg:           {objetivo:'Encontrar termos e a soma de uma progressão geométrica e reconhecer a PG como uma função exponencial.', prereqs:['potenciacao','pa'], bncc:['EM13MAT508']},
  espacial:     {objetivo:'Calcular área da superfície e volume de prismas, pirâmides, cilindros, cones e esferas.', prereqs:['geometria','potenciacao'], bncc:['EM13MAT309']},
  analitica:    {objetivo:'Calcular distância entre pontos, ponto médio, coeficiente angular e o centro e o raio de uma circunferência.', prereqs:['func1grau','trigret','sistemas'], bncc:[], nota:'A geometria analítica não aparece como habilidade específica na BNCC do Ensino Médio; é cobrada em vestibulares (Fuvest, Unicamp, Unesp).'},
  trigret:      {objetivo:'Usar o teorema de Pitágoras e as razões seno, cosseno e tangente para achar lados e ângulos de triângulos retângulos.', prereqs:['potenciacao','fracoes','eq1'], bncc:['EF09MA14','EM13MAT308']},
  ciclo:        {objetivo:'Converter graus em radianos, localizar ângulos no ciclo trigonométrico e achar a menor determinação positiva.', prereqs:['trigret'], bncc:[], nota:'O ciclo trigonométrico é base para a habilidade EM13MAT306 (funções seno e cosseno), mas não tem uma habilidade própria.'},
  identidades:  {objetivo:'Usar sen² x + cos² x = 1, a tangente e o arco duplo para calcular valores trigonométricos.', prereqs:['ciclo'], bncc:[], nota:'As identidades trigonométricas não aparecem como habilidade específica na BNCC do Ensino Médio.'},
  leis:         {objetivo:'Usar a lei dos senos e a lei dos cossenos para resolver triângulos quaisquer.', prereqs:['trigret'], bncc:['EM13MAT308']},
  combinatoria: {objetivo:'Contar possibilidades com o princípio multiplicativo, arranjos, permutações e combinações, sabendo quando a ordem importa.', prereqs:['multiplicacao'], bncc:['EM13MAT310']},
  probabilidade:{objetivo:'Descrever o espaço amostral e calcular probabilidades, inclusive de eventos combinados.', prereqs:['fracoes','combinatoria'], bncc:['EM13MAT311']},
  dispersao:    {objetivo:'Calcular amplitude, variância e desvio padrão e comparar a regularidade de conjuntos de dados.', prereqs:['estatistica','potenciacao'], bncc:['EM13MAT316']},
  graficos:     {objetivo:'Ler e interpretar gráficos e tabelas, calcular totais e variações percentuais e desconfiar de escalas enganosas.', prereqs:['porcentagem','estatistica'], bncc:['EM13MAT102']},
  juros:        {objetivo:'Calcular juros simples e compostos e comparar o crescimento linear com o exponencial.', prereqs:['porcentagem','potenciacao'], bncc:['EM13MAT303']},
  descontos:    {objetivo:'Calcular descontos e aumentos, inclusive sucessivos, e a taxa equivalente a eles.', prereqs:['porcentagem'], bncc:['EF07MA02','EF09MA05']},
  inflacao:     {objetivo:'Calcular o efeito da inflação nos preços, a inflação acumulada e o ganho real de um investimento.', prereqs:['porcentagem'], bncc:['EM13MAT104']},
  matrizes:     {objetivo:'Localizar elementos de uma matriz e fazer soma, multiplicação por número e multiplicação de matrizes.', prereqs:['expressoes'], bncc:[], nota:'Matrizes não aparecem como conteúdo explícito na BNCC do Ensino Médio (relacionam-se a sistemas lineares, EM13MAT301); são cobradas em vestibulares.'},
  determinantes:{objetivo:'Calcular determinantes de matrizes 2×2 e 3×3 (regra de Sarrus) e usá-los para analisar sistemas.', prereqs:['matrizes'], bncc:[], nota:'Determinantes não aparecem como conteúdo explícito na BNCC do Ensino Médio (relacionam-se a sistemas lineares, EM13MAT301); são cobrados em vestibulares.'},
};

/* como a pessoa mostra que domina um assunto (o mesmo para todos — ver masteryOf) */
const CRITERIO_DOMINIO = [
  'Responder pelo menos 5 questões (antes disso, um acerto pode ser sorte).',
  'Proficiente: acertar 80% ou mais das últimas questões.',
  'Dominado: acertar 9 das últimas 10, com pelo menos 2 no nível difícil, em dois dias diferentes.',
];

function curriculoDe(id){ return CURRICULO[id] || null; }
/* pré-requisitos que ainda não estão em "Praticando" ou acima (para sugerir revisar antes) */
function prereqsPendentes(id){
  const c = curriculoDe(id);
  if(!c) return [];
  return c.prereqs.filter(p=> typeof masterySync==='function' && masterySync(p).lvl < 2);
}
