/* =========================================================
   QUESTÕES INÉDITAS POR PROVA — 10 por prova, no estilo de cada uma
   Usadas no "Simulado da prova" (js/telas/simulado-prova.js).
   Campos: topic (assunto), diff (fácil/média/difícil), html (enunciado),
   opts (alternativas), ans (índice da correta), solHead + sol (resolução).
   ========================================================= */
const EXAM_BANK = {
 "enem": [
  {
   "n": 1,
   "topic": "porcentagem e comparação de preços",
   "diff": "fácil",
   "html": "<p>Uma pessoa precisa comprar <b>3 frascos</b> de um mesmo xampu. Ela pesquisou em cinco lojas:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Loja</th><th>Preço da unidade</th><th>Promoção</th></tr></thead><tbody><tr><td>Bom Preço</td><td>R$ 16,50</td><td>nenhuma</td></tr><tr><td>Central</td><td>R$ 18,00</td><td>30% de desconto em cada unidade</td></tr><tr><td>Família</td><td>R$ 17,00</td><td>a 2ª unidade sai pela metade do preço (só a 2ª)</td></tr><tr><td>Kit</td><td>—</td><td>kit com 3 frascos por R$ 39,90</td></tr><tr><td>Econômica</td><td>R$ 18,00</td><td>leve 3, pague 2</td></tr></tbody></table></div><p>Ela vai comprar os 3 frascos na loja em que gastar menos.</p><p>Em qual loja ela deve comprar?</p>",
   "opts": [
    "Bom Preço",
    "Central",
    "Família",
    "Kit",
    "Econômica"
   ],
   "ans": 4,
   "solHead": "E (Econômica)",
   "sol": "<p>Calcule o gasto com 3 frascos em cada loja:</p><ul><li>Bom Preço: 3 × 16,50 = <b>R$ 49,50</b></li><li>Central: 30% de desconto → 18 × 0,70 = 12,60 por unidade; 3 × 12,60 = <b>R$ 37,80</b></li><li>Família: 17 + 8,50 (2ª pela metade) + 17 = <b>R$ 42,50</b></li><li>Kit: <b>R$ 39,90</b></li><li>Econômica: leve 3, pague 2 → 2 × 18 = <b>R$ 36,00</b></li></ul><p>A menor é a da Econômica.<br><i>Erro comum:</i> escolher a Central só porque \"30% de desconto\" parece o maior desconto. \"Leve 3, pague 2\" equivale a 33,3% de desconto.<br>✔️ Verificação: 36,00 &lt; 37,80 &lt; 39,90 &lt; 42,50 &lt; 49,50.</p>"
  },
  {
   "n": 2,
   "topic": "escala e velocidade média",
   "diff": "média",
   "html": "<p>Um ciclista planeja um passeio entre duas cidades. No mapa rodoviário, que está na escala <b>1 : 200 000</b>, a estrada entre elas mede <b>9 cm</b>. Ele pretende pedalar a uma velocidade média de <b>24 km/h</b>.</p><p>Mantida essa velocidade, quanto tempo ele levará no trajeto?</p>",
   "opts": [
    "7,5 min",
    "45 min",
    "54 min",
    "75 min",
    "1 h 45 min"
   ],
   "ans": 1,
   "solHead": "B (45 min)",
   "sol": "<ul><li>Escala 1 : 200 000: 1 cm no mapa vale 200 000 cm (2 km) na realidade.</li><li>Distância real: 9 × 2 = <b>18 km</b>.</li><li>Tempo = distância ÷ velocidade = 18 ÷ 24 = <b>0,75 h</b>.</li><li>0,75 h = 0,75 × 60 = <b>45 min</b>.</li></ul><p><i>Erros comuns:</i> ler 0,75 h como \"75 min\" (D); dividir por 20 em vez de 24 (C, 54 min).<br>✔️ Verificação: a 24 km/h, em 45 min (3/4 de hora) se percorrem 24 × 3/4 = 18 km.</p>"
  },
  {
   "n": 3,
   "topic": "estatística (média e mediana)",
   "diff": "média",
   "html": "<p>Um aplicativo de saúde dá um selo de \"Semana Ativa\" quando a <b>mediana</b> dos passos diários da semana é de, no mínimo, <b>8 000 passos</b>. Os passos de um usuário foram:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Dia</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th><th>Sáb</th><th>Dom</th></tr></thead><tbody><tr><td>Passos</td><td>7 000</td><td>9 500</td><td>6 500</td><td>12 000</td><td>8 000</td><td>5 500</td><td>7 500</td></tr></tbody></table></div><p>O usuário comemorou, pois calculou que a <b>média</b> foi de exatamente 8 000 passos.</p><p>Qual foi a mediana de passos dessa semana? O selo foi concedido?</p>",
   "opts": [
    "7 500; não.",
    "7 500; sim.",
    "8 000; sim.",
    "8 000; não.",
    "7 000; não."
   ],
   "ans": 0,
   "solHead": "A (7 500; não)",
   "sol": "<ul><li>A mediana é o valor do meio com os dados <b>em ordem</b>: 5 500 · 6 500 · 7 000 · <b>7 500</b> · 8 000 · 9 500 · 12 000.</li><li>Com 7 valores, o do meio é o 4º: <b>7 500</b>. Como 7 500 &lt; 8 000, o selo <b>não</b> foi concedido.</li><li>A média dá mesmo 8 000 (56 000 ÷ 7), mas ela é \"puxada\" pelo dia de 12 000 passos. Por isso o app usa a mediana.</li></ul><p><i>Erros comuns:</i> confundir média com mediana (C, D); pegar o 4º valor da tabela sem ordenar (12 000) ou o valor do meio errado (E).<br>✔️ Verificação: há 3 valores abaixo de 7 500 e 3 acima.</p>"
  },
  {
   "n": 4,
   "topic": "geometria espacial (volume e capacidade)",
   "diff": "média",
   "html": "<p>Uma família de 4 pessoas tem uma caixa-d'água <b>cilíndrica</b>, com <b>1 m de raio</b> e <b>1,5 m de altura</b> internos. Cada pessoa consome, em média, <b>150 litros</b> de água por dia.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">      ___________\n     /     r=1 m \\\n    |‾‾‾‾‾‾‾‾‾‾‾‾‾|\n    |             |  h = 1,5 m\n    |             |\n     \\___________/</pre><p>Use π = 3 e 1 m³ = 1 000 L.</p><p>Com a caixa cheia e sem reabastecimento, por quantos <b>dias completos</b> a família terá água?</p>",
   "opts": [
    "3",
    "7",
    "8",
    "15",
    "30"
   ],
   "ans": 1,
   "solHead": "B (7 dias)",
   "sol": "<ul><li>Volume do cilindro: V = π · r² · h = 3 · 1² · 1,5 = <b>4,5 m³</b> = <b>4 500 L</b>.</li><li>Consumo diário: 4 × 150 = <b>600 L</b>.</li><li>4 500 ÷ 600 = <b>7,5 dias</b>. Ou seja, <b>7 dias completos</b>: no 8º dia a água acaba no meio do dia.</li></ul><p><i>Erros comuns:</i> arredondar para cima (C, 8); usar a área lateral 2πrh no lugar do volume (D, 15); usar o diâmetro como raio (E, 30).<br>✔️ Verificação: 7 × 600 = 4 200 ≤ 4 500, mas 8 × 600 = 4 800 &gt; 4 500.</p>"
  },
  {
   "n": 5,
   "topic": "função afim",
   "diff": "fácil",
   "html": "<p>Em uma cidade, duas empresas de táxi cobram assim:</p><ul><li><b>Empresa A:</b> bandeirada de R$ 6,00 mais R$ 2,50 por quilômetro rodado.</li><li><b>Empresa B:</b> bandeirada de R$ 9,00 mais R$ 2,00 por quilômetro rodado.</li></ul><p>Um passageiro quer saber quando vale mais a pena chamar a empresa B.</p><p>A empresa B é mais barata</p>",
   "opts": [
    "para corridas de até 3 km.",
    "para corridas de até 6 km.",
    "para corridas com mais de 6 km.",
    "para corridas com mais de 15 km.",
    "para corridas de qualquer distância."
   ],
   "ans": 2,
   "solHead": "C (mais de 6 km)",
   "sol": "<ul><li>Preço em função dos quilômetros x: A(x) = 6 + 2,5x e B(x) = 9 + 2x.</li><li>B é mais barata quando 9 + 2x &lt; 6 + 2,5x, ou seja, 3 &lt; 0,5x, ou seja, <b>x &gt; 6</b>.</li><li>Em 6 km as duas cobram R$ 21,00. Depois disso a tarifa por km menor de B compensa a bandeirada mais cara.</li></ul><p>✔️ Verificação: com 10 km, A = 31,00 e B = 29,00 (B mais barata); com 2 km, A = 11,00 e B = 13,00 (A mais barata).</p>"
  },
  {
   "n": 6,
   "topic": "matemática financeira (parcelamento e juros)",
   "diff": "média",
   "html": "<p>Uma bicicleta é vendida de duas formas:</p><ul><li><b>à vista:</b> R$ 1 900,00;</li><li><b>a prazo:</b> duas parcelas de R$ 1 000,00, a primeira no ato da compra e a segunda 30 dias depois.</li></ul><p>Quem escolhe a forma a prazo está, na prática, pegando emprestada a diferença entre o preço à vista e a entrada, e devolvendo R$ 1 000,00 após um mês.</p><p>A taxa mensal de juros embutida nessa venda a prazo é, aproximadamente,</p>",
   "opts": [
    "5,0%.",
    "5,3%.",
    "10,0%.",
    "11,1%.",
    "20,0%."
   ],
   "ans": 3,
   "solHead": "D (11,1%)",
   "sol": "<ul><li>Na compra a prazo, paga-se R$ 1 000,00 na hora. A dívida que fica é 1 900 − 1 000 = <b>R$ 900,00</b>.</li><li>Um mês depois, devolve-se R$ 1 000,00. Os juros são 1 000 − 900 = <b>R$ 100,00</b>.</li><li>Taxa = 100 ÷ 900 ≈ <b>0,111 = 11,1%</b> ao mês.</li></ul><p><i>Erros comuns:</i> dividir por 2 000 (A), por 1 900 (B) ou por 1 000 (C).<br>✔️ Verificação: 900 × 1,111 ≈ 1 000.</p>"
  },
  {
   "n": 7,
   "topic": "probabilidade condicional (leitura de tabela)",
   "diff": "média",
   "html": "<p>Uma escola fez uma pesquisa com 200 alunos sobre a prática de esportes:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Turno</th><th>Pratica esporte</th><th>Não pratica</th><th>Total</th></tr></thead><tbody><tr><td>Manhã</td><td>48</td><td>72</td><td>120</td></tr><tr><td>Tarde</td><td>32</td><td>48</td><td>80</td></tr><tr><td><b>Total</b></td><td><b>80</b></td><td><b>120</b></td><td><b>200</b></td></tr></tbody></table></div><p>Um aluno do turno da <b>manhã</b> será sorteado para representar a escola num evento.</p><p>Qual a probabilidade de o sorteado praticar esporte?</p>",
   "opts": [
    "24%",
    "40%",
    "48%",
    "60%",
    "80%"
   ],
   "ans": 1,
   "solHead": "B (40%)",
   "sol": "<ul><li>O sorteio é só entre os alunos da <b>manhã</b>. O espaço amostral tem <b>120</b> alunos.</li><li>Desses, 48 praticam esporte: P = 48 ÷ 120 = <b>0,40 = 40%</b>.</li></ul><p><i>Erros comuns:</i> dividir pelo total da escola (48/200 = 24%, A); dividir pelo total de praticantes (48/80 = 60%, D).<br>✔️ Verificação: 40% de 120 = 48.</p>"
  },
  {
   "n": 8,
   "topic": "função exponencial e logaritmo",
   "diff": "difícil",
   "html": "<p>Um estudo prevê que a população de uma cidade, hoje com <b>40 000 habitantes</b>, vai crescer <b>20% a cada década</b>. O modelo é</p><p>P(t) = 40 000 · (1,2)ᵗ, com t em décadas.</p><p>Use log 2 = 0,30 e log 3 = 0,48.</p><p>Segundo esse modelo, a população chegará a 160 000 habitantes em aproximadamente</p>",
   "opts": [
    "7,5 anos.",
    "15 anos.",
    "30 anos.",
    "75 anos.",
    "150 anos."
   ],
   "ans": 3,
   "solHead": "D (75 anos)",
   "sol": "<ul><li>Quer-se 40 000 · 1,2ᵗ = 160 000, ou seja, <b>1,2ᵗ = 4</b>.</li><li>Aplicando log: t · log 1,2 = log 4.</li><li>log 4 = 2 · log 2 = <b>0,60</b>.</li><li>log 1,2 = log(12/10) = log(2² · 3) − log 10 = 0,60 + 0,48 − 1 = <b>0,08</b>.</li><li>t = 0,60 ÷ 0,08 = <b>7,5 décadas = 75 anos</b>.</li></ul><p><i>Erros comuns:</i> esquecer de converter décadas em anos (A); pensar em crescimento linear de 8 000 por década, que daria 15 décadas = 150 anos (E).<br>✔️ Verificação: 1,2⁷ ≈ 3,58 e 1,2⁸ ≈ 4,30. A população passa de 4 vezes entre 7 e 8 décadas, como achamos.</p>"
  },
  {
   "n": 9,
   "topic": "função definida por partes (tarifa)",
   "diff": "média",
   "html": "<p>A conta de luz de uma cidade é calculada por faixas de consumo mensal:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Faixa de consumo</th><th>Preço por kWh</th></tr></thead><tbody><tr><td>até 100 kWh</td><td>R$ 0,80</td></tr><tr><td>o que passar de 100 kWh</td><td>R$ 1,20</td></tr></tbody></table></div><p>Assim, quem consome 130 kWh paga 100 kWh a R$ 0,80 e 30 kWh a R$ 1,20.</p><p>Uma residência consumiu <b>160 kWh</b> no mês. Quanto ela pagará, sem contar impostos?</p>",
   "opts": [
    "R$ 72,00",
    "R$ 120,00",
    "R$ 128,00",
    "R$ 140,00",
    "R$ 152,00"
   ],
   "ans": 4,
   "solHead": "E (R$ 152,00)",
   "sol": "<ul><li>Os primeiros 100 kWh custam 100 × 0,80 = <b>R$ 80,00</b>.</li><li>O excedente é 160 − 100 = 60 kWh, que custa 60 × 1,20 = <b>R$ 72,00</b>.</li><li>Total: 80 + 72 = <b>R$ 152,00</b>.</li></ul><p><i>Erros comuns:</i> cobrar só o excedente (A); cobrar tudo a R$ 0,80 (C, R$ 128,00).<br>✔️ Verificação: o valor fica entre 160 × 0,80 = 128 e 160 × 1,20 = 192, como deve ser.</p>"
  },
  {
   "n": 10,
   "topic": "análise combinatória (princípio multiplicativo)",
   "diff": "média",
   "html": "<p>Um cofre usa senhas de 5 caracteres:</p><ul><li>os <b>3 primeiros</b> são letras escolhidas entre A, B, C, D e E, <b>sem repetir</b>;</li><li>os <b>2 últimos</b> são algarismos de 0 a 9, que <b>podem se repetir</b>.</li></ul><p>Exemplo de senha válida: <b>CAE07</b>.</p><p>Quantas senhas diferentes podem ser criadas?</p>",
   "opts": [
    "600",
    "1 200",
    "6 000",
    "12 500",
    "60 000"
   ],
   "ans": 2,
   "solHead": "C (6 000)",
   "sol": "<ul><li>Letras sem repetição: 5 × 4 × 3 = <b>60</b> possibilidades.</li><li>Algarismos com repetição: 10 × 10 = <b>100</b> possibilidades.</li><li>Pelo princípio multiplicativo: 60 × 100 = <b>6 000</b>.</li></ul><p><i>Erros comuns:</i> permitir repetir letras, 5³ × 100 = 12 500 (D); somar os algarismos em vez de multiplicar, 60 × 20 = 1 200 (B).<br>✔️ Verificação: a ordem das letras importa (CAE ≠ ACE), então é arranjo e não combinação.</p>"
  }
 ],
 "etec": [
  {
   "n": 1,
   "topic": "área e medidas",
   "diff": "média",
   "html": "<p>Paulo vai pintar uma parede retangular de <b>6 m</b> de largura por <b>2,8 m</b> de altura. Nela há uma porta de <b>0,8 m × 2,1 m</b>, que não será pintada. Ele vai dar <b>duas demãos</b> de tinta. Cada litro de tinta cobre <b>12 m²</b> por demão. A tinta é vendida em latas de <b>0,9 L</b>.</p><p><b>Figura (esquema em texto, fora de escala; as medidas estão no enunciado):</b></p><pre class=\"bq-fig\"> ┌──────────────────────────────┐ ─┬─\n │                              │  │\n │        ┌──────┐              │  │\n │        │      │              │  2,8 m\n │        │porta │  2,1 m       │  │\n │        │      │              │  │\n └────────┴──────┴──────────────┘ ─┴─\n          ← 0,8 m →\n ←──────────── 6 m ─────────────→</pre><p>Qual é o menor número de latas que Paulo precisa comprar?</p>",
   "opts": [
    "2",
    "3",
    "4",
    "5",
    "6"
   ],
   "ans": 1,
   "solHead": "(B) 3 latas",
   "sol": "<ul><li>Área da parede: 6 × 2,8 = <b>16,8 m²</b>.</li><li>Área da porta: 0,8 × 2,1 = <b>1,68 m²</b>.</li><li>Área a pintar: 16,8 − 1,68 = <b>15,12 m²</b>. Com duas demãos: 2 × 15,12 = <b>30,24 m²</b>.</li><li>Tinta necessária: 30,24 ÷ 12 = <b>2,52 L</b>.</li><li>Latas: 2,52 ÷ 0,9 = 2,8. Como não se compra lata quebrada, são <b>3 latas</b> (2,7 L).</li></ul><p><i>Erros comuns:</i> esquecer de descontar a porta. Aí são 33,6 m² ÷ 12 = 2,8 L, e 2,8 ÷ 0,9 ≈ 3,1, o que leva a 4 latas (C). Arredondar 2,8 latas para baixo dá (A).<br>✔️ Verificação: 3 latas = 2,7 L ≥ 2,52 L, e 2 latas = 1,8 L não bastam.</p>"
  },
  {
   "n": 2,
   "topic": "média aritmética (leitura de gráfico de barras)",
   "diff": "fácil",
   "html": "<p>O gráfico mostra a chuva acumulada, em milímetros, em uma cidade no primeiro semestre:</p><p><b>Gráfico (em texto; os valores de cada barra estão escritos ao lado dela):</b></p><pre class=\"bq-fig\">Chuva (mm)\nJan │██████████████████████████  240\nFev │███████████████████████  210\nMar │████████████████████  180\nAbr │██████████  90\nMai │███████  60\nJun │████  30</pre><p>Qual foi a média mensal de chuva nesse semestre?</p>",
   "opts": [
    "105 mm",
    "135 mm",
    "140 mm",
    "162 mm",
    "205 mm"
   ],
   "ans": 1,
   "solHead": "(B) 135 mm",
   "sol": "<ul><li>Soma: 240 + 210 + 180 + 90 + 60 + 30 = <b>810 mm</b>.</li><li>Média: 810 ÷ 6 = <b>135 mm</b>.</li></ul><p><i>Erro comum:</i> tirar a média só do maior e do menor valor, (240 + 30) ÷ 2 = 135. Aqui coincide, mas é um método errado. A alternativa (D) vem de dividir por 5 em vez de 6.<br>✔️ Verificação: 135 × 6 = 810.</p>"
  },
  {
   "n": 3,
   "topic": "regra de três composta",
   "diff": "média",
   "html": "<p>Numa fábrica, <b>4 máquinas</b> iguais, funcionando <b>6 horas por dia</b>, produzem <b>1 200 peças</b> em <b>5 dias</b>.</p><p>Em quantos dias <b>6 máquinas</b> iguais a essas, funcionando <b>8 horas por dia</b>, produzirão <b>2 400 peças</b>?</p>",
   "opts": [
    "3",
    "4",
    "5",
    "6",
    "10"
   ],
   "ans": 2,
   "solHead": "(C) 5 dias",
   "sol": "<p>Um jeito simples é calcular quanto <b>1 máquina</b> faz em <b>1 hora</b>:</p><ul><li>Horas-máquina gastas: 4 × 6 × 5 = 120. Produção: 1 200 ÷ 120 = <b>10 peças por máquina por hora</b>.</li><li>Nova situação: 6 máquinas × 8 h × 10 peças = <b>480 peças por dia</b>.</li><li>Dias: 2 400 ÷ 480 = <b>5 dias</b>.</li></ul><p><i>Pela regra de três composta:</i> mais máquinas e mais horas significam <b>menos</b> dias (inversamente proporcionais). Mais peças significam <b>mais</b> dias (diretamente proporcional):<br>dias = 5 × (4/6) × (6/8) × (2 400/1 200) = 5 × 2/3 × 3/4 × 2 = <b>5</b>.<br>✔️ Verificação: 6 × 8 × 5 × 10 = 2 400.</p>"
  },
  {
   "n": 4,
   "topic": "Teorema de Pitágoras",
   "diff": "fácil",
   "html": "<p>Uma escada de <b>5 m</b> está apoiada em um muro vertical. O pé da escada fica a <b>1,4 m</b> da base do muro, num chão plano.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">   muro\n    │\\\n    │ \\  escada = 5 m\n  h │  \\\n    │   \\\n    └────\\\n     1,4 m</pre><p>A que altura do chão a escada toca o muro?</p>",
   "opts": [
    "3,6 m",
    "4,2 m",
    "4,6 m",
    "4,8 m",
    "5,2 m"
   ],
   "ans": 3,
   "solHead": "(D) 4,8 m",
   "sol": "<p>A escada é a hipotenusa: h² + 1,4² = 5².</p><ul><li>h² = 25 − 1,96 = <b>23,04</b>.</li><li>h = √23,04 = <b>4,8 m</b>.</li></ul><p>✔️ Verificação: 4,8² + 1,4² = 23,04 + 1,96 = 25. Os números são o triângulo 7–24–25 multiplicado por 0,2.</p>"
  },
  {
   "n": 5,
   "topic": "porcentagem (aumentos e descontos sucessivos)",
   "diff": "média",
   "html": "<p>Um tênis custava <b>R$ 80,00</b>. A loja aumentou o preço em <b>20%</b>. Semanas depois, numa liquidação, deu <b>20% de desconto</b> sobre o novo preço.</p><p>Qual o preço do tênis na liquidação?</p>",
   "opts": [
    "R$ 76,80",
    "R$ 78,00",
    "R$ 80,00",
    "R$ 83,20",
    "R$ 96,00"
   ],
   "ans": 0,
   "solHead": "(A) R$ 76,80",
   "sol": "<ul><li>Depois do aumento: 80 × 1,20 = <b>R$ 96,00</b>.</li><li>Depois do desconto: 96 × 0,80 = <b>R$ 76,80</b>.</li><li>Em um passo só: 80 × 1,2 × 0,8 = 80 × 0,96.</li></ul><p><i>Erro comum:</i> achar que +20% e −20% se anulam (C). O desconto incide sobre um valor <b>maior</b>, então tira mais do que o aumento colocou.<br>✔️ Verificação: o preço final é 96% do original, ou seja, 4% menor.</p>"
  },
  {
   "n": 6,
   "topic": "sistema de equações do 1º grau",
   "diff": "fácil",
   "html": "<p>Num estacionamento há apenas carros e motos: são <b>42 veículos</b> e <b>136 rodas</b> no total. Nenhum veículo tem estepe à mostra.</p><p>Quantas motos há no estacionamento?</p>",
   "opts": [
    "12",
    "16",
    "20",
    "26",
    "28"
   ],
   "ans": 1,
   "solHead": "(B) 16 motos",
   "sol": "<p>Sejam c os carros e m as motos:</p><ul><li>c + m = 42</li><li>4c + 2m = 136</li></ul><p>Multiplicando a 1ª por 2: 2c + 2m = 84. Subtraindo da 2ª: 2c = 52, então <b>c = 26</b> e <b>m = 16</b>.<br><i>Erro comum:</i> responder o número de carros (D).<br>✔️ Verificação: 26 × 4 + 16 × 2 = 104 + 32 = 136 rodas.</p>"
  },
  {
   "n": 7,
   "topic": "produtos notáveis e fatoração",
   "diff": "média",
   "html": "<p>Dois terrenos quadrados ficam lado a lado: um tem <b>103 m</b> de lado e o outro, <b>97 m</b>. Um corretor quer saber quantos metros quadrados o maior tem a mais que o menor, sem calculadora.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\"> ┌─────────────┐ ┌───────────┐\n │             │ │           │\n │   103 m     │ │   97 m    │\n │             │ │           │\n └─────────────┘ └───────────┘</pre><p>A diferença entre as áreas dos dois terrenos é</p>",
   "opts": [
    "6 m².",
    "36 m².",
    "200 m².",
    "600 m².",
    "1 200 m²."
   ],
   "ans": 4,
   "solHead": "(E) 1 200 m²",
   "sol": "<p>Use a diferença de quadrados: a² − b² = (a + b)(a − b).</p><ul><li>103² − 97² = (103 + 97)(103 − 97) = 200 × 6 = <b>1 200 m²</b>.</li></ul><p><i>Erro comum:</i> fazer (103 − 97)² = 36 (B), o que é errado porque a² − b² ≠ (a − b)².<br>✔️ Verificação: 103² = 10 609 e 97² = 9 409; a diferença é 1 200.</p>"
  },
  {
   "n": 8,
   "topic": "semelhança de triângulos",
   "diff": "fácil",
   "html": "<p>Num fim de tarde, um poste vertical projeta uma sombra de <b>6 m</b> no chão plano. No mesmo instante, uma pessoa de <b>1,6 m</b> de altura, em pé ao lado do poste, projeta uma sombra de <b>1,2 m</b>.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">  │                    \n  │ poste ?            \n  │                     │ 1,6 m\n  │                     │\n  └──────────── 6 m     └──── 1,2 m</pre><p>Qual é a altura do poste?</p>",
   "opts": [
    "2,25 m",
    "4,5 m",
    "6,0 m",
    "7,2 m",
    "8,0 m"
   ],
   "ans": 4,
   "solHead": "(E) 8,0 m",
   "sol": "<p>Os raios de sol são paralelos, então os triângulos poste–sombra e pessoa–sombra são <b>semelhantes</b>:</p><ul><li>altura do poste / 6 = 1,6 / 1,2</li><li>altura = 6 × 1,6 ÷ 1,2 = <b>8 m</b>.</li></ul><p><i>Erro comum:</i> inverter a proporção, 6 × 1,2 ÷ 1,6 = 4,5 (B).<br>✔️ Verificação: nos dois casos a altura é 4/3 da sombra (1,6/1,2 = 8/6).</p>"
  },
  {
   "n": 9,
   "topic": "probabilidade básica",
   "diff": "média",
   "html": "<p>Numa rifa da escola, os bilhetes são numerados de <b>1 a 30</b>. Ganha um brinde extra quem tiver um número que seja <b>múltiplo de 3 ou múltiplo de 5</b>.</p><p>Sorteando-se um bilhete ao acaso, qual a probabilidade de ele dar direito ao brinde?</p>",
   "opts": [
    "1/5",
    "1/3",
    "7/15",
    "8/15",
    "3/5"
   ],
   "ans": 2,
   "solHead": "(C) 7/15",
   "sol": "<ul><li>Múltiplos de 3 de 1 a 30: 3, 6, …, 30 → <b>10</b> números.</li><li>Múltiplos de 5: 5, 10, …, 30 → <b>6</b> números.</li><li>Múltiplos de 3 <b>e</b> de 5 (de 15): 15 e 30 → <b>2</b> números, contados duas vezes.</li><li>Casos favoráveis: 10 + 6 − 2 = <b>14</b>. P = 14/30 = <b>7/15</b>.</li></ul><p><i>Erro comum:</i> esquecer de tirar os repetidos: 16/30 = 8/15 (D).<br>✔️ Verificação: a lista é 3, 5, 6, 9, 10, 12, 15, 18, 20, 21, 24, 25, 27, 30, que dá 14 números.</p>"
  },
  {
   "n": 10,
   "topic": "volume e capacidade",
   "diff": "fácil",
   "html": "<p>Um aquário em forma de paralelepípedo tem medidas internas de <b>60 cm</b> de comprimento, <b>30 cm</b> de largura e <b>40 cm</b> de altura. Ele foi enchido até <b>3/4 da altura</b>.</p><p>Lembre que 1 L = 1 000 cm³.</p><p>Quantos litros de água há no aquário?</p>",
   "opts": [
    "5,4 L",
    "36 L",
    "40,5 L",
    "54 L",
    "72 L"
   ],
   "ans": 3,
   "solHead": "(D) 54 L",
   "sol": "<ul><li>Altura da água: 3/4 × 40 = <b>30 cm</b>.</li><li>Volume: 60 × 30 × 30 = <b>54 000 cm³</b> = <b>54 L</b>.</li></ul><p><i>Erros comuns:</i> calcular o aquário cheio, 72 L (E); tirar 3/4 duas vezes, 40,5 L (C).<br>✔️ Verificação: o aquário cheio tem 72 L, e 3/4 de 72 = 54.</p>"
  }
 ],
 "fuvest": [
  {
   "n": 1,
   "topic": "equação modular",
   "diff": "média",
   "html": "<p>Considere a equação, com x real:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>x² − 4x</th><th>= 3</th></tr></thead><tbody></tbody></table></div><p>A soma de todas as soluções reais dessa equação é</p>",
   "opts": [
    "0",
    "4",
    "6",
    "8",
    "12"
   ],
   "ans": 3,
   "solHead": "(D) 8",
   "sol": "<div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>A</th><th>= 3 significa A = 3 <b>ou</b> A = −3:</th></tr></thead><tbody></tbody></table></div><ul><li><b>x² − 4x = 3</b> → x² − 4x − 3 = 0. Δ = 16 + 12 = 28 &gt; 0, então há 2 raízes reais (2 ± √7), de soma <b>4</b> (pela soma das raízes, −b/a).</li><li><b>x² − 4x = −3</b> → x² − 4x + 3 = 0 → x = 1 ou x = 3, de soma <b>4</b>.</li></ul><p>As quatro soluções são distintas. Soma total: 4 + 4 = <b>8</b>.<br><i>Erro comum:</i> resolver só o caso positivo e responder 4 (B).<br>✔️ Verificação: |1 − 4| = 3 e |9 − 12| = 3. Para 2 + √7 ≈ 4,65: 21,6 − 18,6 ≈ 3.</p>"
  },
  {
   "n": 2,
   "topic": "funções e escala logarítmica",
   "diff": "difícil",
   "html": "<p>Em um gráfico, <b>os dois eixos estão em escala logarítmica de base 10</b>: as marcas 1, 10, 100, 1 000, … ficam igualmente espaçadas. Os pontos que relacionam duas grandezas positivas x e y ficam todos sobre <b>uma mesma reta</b> nesse gráfico. Dois desses pontos são:</p><ul><li>x = 100, y = 50</li><li>x = 10 000, y = 5</li></ul><p><b>Figura (esquema em texto, fora de escala; use as coordenadas dadas):</b></p><pre class=\"bq-fig\"> y (escala log)\n 100 ┤\n     │  ● A(100 ; 50)\n     │     ╲\n  10 ┤        ╲\n     │           ╲\n     │              ● B(10 000 ; 5)\n   1 ┤\n     └──┬───────────┬──────────► x (escala log)\n       100        10 000</pre><p>Na figura, A fica entre as marcas 10 e 100 do eixo y, e B entre as marcas 1 e 10.</p><p>Mantida essa relação, qual o valor de y quando x = 400?</p>",
   "opts": [
    "12,5",
    "20",
    "25",
    "37,5",
    "45"
   ],
   "ans": 2,
   "solHead": "(C) 25",
   "sol": "<p>Uma reta num gráfico log × log significa log y = a · log x + b, ou seja, <b>y = c · xᵃ</b> (uma função potência).</p><ul><li>Inclinação: a = (log 5 − log 50) / (log 10 000 − log 100) = (−1) / 2 = <b>−1/2</b>.</li><li>Então y = c · x^(−1/2) = c / √x. Com (100, 50): 50 = c / 10, logo <b>c = 500</b>.</li><li>Para x = 400: y = 500 / √400 = 500 / 20 = <b>25</b>.</li></ul><p><i>Erro comum:</i> supor y inversamente proporcional a x (expoente −1): 50 × 100/400 = 12,5 (A).<br>✔️ Verificação: em x = 10 000, 500/100 = 5 ✓. Como x vai de 100 a 400 (×4), y fica dividido por √4 = 2: 50 → 25.</p>"
  },
  {
   "n": 3,
   "topic": "lei dos cossenos e área do triângulo",
   "diff": "média",
   "html": "<p>Um terreno triangular tem lados de <b>5 m</b>, <b>7 m</b> e <b>8 m</b>.</p><p>A área desse terreno, em m², é</p>",
   "opts": [
    "10",
    "12",
    "10√2",
    "10√3",
    "20"
   ],
   "ans": 3,
   "solHead": "(D) 10√3",
   "sol": "<ul><li>Lei dos cossenos no ângulo θ oposto ao lado 7: 7² = 5² + 8² − 2·5·8·cos θ.</li><li>49 = 89 − 80 cos θ, então cos θ = 1/2 e <b>θ = 60°</b>.</li><li>Área = ½ · 5 · 8 · sen 60° = 20 · (√3/2) = <b>10√3 m²</b> ≈ 17,3 m².</li></ul><p>✔️ Verificação por Heron: s = 10, A = √(10 · 5 · 3 · 2) = √300 = 10√3 ✓.</p>"
  },
  {
   "n": 4,
   "topic": "equação trigonométrica",
   "diff": "média",
   "html": "<p>Considere a equação</p><p>2 sen²x − 3 sen x + 1 = 0, com 0 ≤ x ≤ 2π.</p><p>A soma de todas as soluções dessa equação é</p>",
   "opts": [
    "π/2",
    "π",
    "3π/2",
    "2π",
    "5π/2"
   ],
   "ans": 2,
   "solHead": "(C) 3π/2",
   "sol": "<ul><li>Faça sen x = t: 2t² − 3t + 1 = 0, então t = (3 ± 1)/4, ou seja, <b>t = 1</b> ou <b>t = 1/2</b>.</li><li>sen x = 1 → x = <b>π/2</b>.</li><li>sen x = 1/2 → x = <b>π/6</b> ou x = <b>5π/6</b>.</li><li>Soma: π/6 + π/2 + 5π/6 = (π + 3π + 5π)/6 = 9π/6 = <b>3π/2</b>.</li></ul><p><i>Erro comum:</i> esquecer a solução 5π/6 do 2º quadrante, o que dá 2π/3 (não aparece nas alternativas).<br>✔️ Verificação: em x = 5π/6, 2·(1/4) − 3·(1/2) + 1 = 0 ✓.</p>"
  },
  {
   "n": 5,
   "topic": "geometria analítica (circunferência e reta tangente)",
   "diff": "difícil",
   "html": "<p>Considere a circunferência de equação x² + y² − 6x + 4y − 12 = 0 e a família de retas 3x + 4y + k = 0, com k real.</p><p>A soma dos valores de k para os quais a reta é <b>tangente</b> à circunferência é</p>",
   "opts": [
    "−50",
    "−2",
    "0",
    "2",
    "50"
   ],
   "ans": 1,
   "solHead": "(B) −2",
   "sol": "<ul><li>Complete quadrados: (x − 3)² + (y + 2)² = 12 + 9 + 4 = 25. Centro <b>(3, −2)</b>, raio <b>5</b>.</li><li>A reta é tangente quando a distância do centro a ela é igual ao raio:</li></ul><p>  |3·3 + 4·(−2) + k| / √(3² + 4²) = 5 → |1 + k| = 25.</p><ul><li>k = <b>24</b> ou k = <b>−26</b>. Soma: <b>−2</b>.</li></ul><p>✔️ Verificação: com k = 24, a distância é |9 − 8 + 24|/5 = 25/5 = 5 ✓.</p>"
  },
  {
   "n": 6,
   "topic": "polinômios (divisibilidade e relações de Girard)",
   "diff": "média",
   "html": "<p>O polinômio P(x) = 2x³ − 3x² + kx + 6, com k real, é divisível por (x − 2).</p><p>A soma dos <b>quadrados</b> das três raízes de P(x) é</p>",
   "opts": [
    "9/4",
    "13/4",
    "17/4",
    "25/4",
    "29/4"
   ],
   "ans": 4,
   "solHead": "(E) 29/4",
   "sol": "<ul><li>Divisível por (x − 2) significa P(2) = 0: 16 − 12 + 2k + 6 = 0, logo <b>k = −5</b>.</li><li>Pelas relações de Girard em 2x³ − 3x² − 5x + 6:</li><li>soma das raízes = 3/2;</li><li>soma dos produtos dois a dois = −5/2.</li><li>Soma dos quadrados = (soma)² − 2·(produtos 2 a 2) = 9/4 + 5 = <b>29/4</b>.</li></ul><p>✔️ Verificação direta: dividindo por (x − 2) sobra 2x² + x − 3 = (2x + 3)(x − 1). As raízes são 2, 1 e −3/2: 4 + 1 + 9/4 = 29/4 ✓.</p>"
  },
  {
   "n": 7,
   "topic": "números complexos (potências)",
   "diff": "média",
   "html": "<p>Sendo i a unidade imaginária (i² = −1), o valor de</p><p>(1 + i)¹⁰ / (1 − i)²</p><p>é</p>",
   "opts": [
    "−16",
    "−16i",
    "16",
    "16i",
    "32"
   ],
   "ans": 0,
   "solHead": "(A) −16",
   "sol": "<ul><li>(1 + i)² = 1 + 2i + i² = <b>2i</b>, então (1 + i)¹⁰ = (2i)⁵ = 32 · i⁵ = <b>32i</b>.</li><li>(1 − i)² = 1 − 2i + i² = <b>−2i</b>.</li><li>32i / (−2i) = <b>−16</b>.</li></ul><p>✔️ Verificação: |1 + i|¹⁰ / |1 − i|² = (√2)¹⁰ / 2 = 32/2 = 16. O módulo bate e o sinal vem do quociente i/(−i) = −1.</p>"
  },
  {
   "n": 8,
   "topic": "sistemas lineares e determinantes",
   "diff": "média",
   "html": "<p>Considere o sistema, em que a e b são reais:</p><pre class=\"bq-fig\">⎧  x +  y +  z = 6\n⎨  x + 2y + 3z = 14\n⎩ 2x +  y + az = b</pre><p>O sistema <b>não</b> é possível e determinado (não tem solução única) exatamente quando</p>",
   "opts": [
    "a = 0",
    "a = 1",
    "a = 2",
    "a = 3",
    "a = 6"
   ],
   "ans": 0,
   "solHead": "(A) a = 0",
   "sol": "<p>O sistema tem solução única exatamente quando o determinante dos coeficientes é diferente de zero:</p><pre class=\"bq-fig\">| 1  1  1 |\n| 1  2  3 | = 1(2a − 3) − 1(a − 6) + 1(1 − 4) = a\n| 2  1  a |</pre><p>Então det = <b>a</b>. Com a ≠ 0 há solução única; com <b>a = 0</b>, o sistema é impossível ou indeterminado (depende de b).<br>✔️ Verificação: com a = 0, os coeficientes da 3ª linha (2, 1, 0) são 3 × (1, 1, 1) − (1, 2, 3). A 3ª equação é uma combinação das outras duas, e por isso não há solução única. Se b = 3·6 − 14 = 4, o sistema é indeterminado; se b ≠ 4, é impossível.</p>"
  },
  {
   "n": 9,
   "topic": "combinatória e probabilidade (anagramas)",
   "diff": "média",
   "html": "<p>Escolhe-se ao acaso um anagrama da palavra <b>FUVEST</b>. Todos os anagramas têm a mesma chance.</p><p>Qual a probabilidade de as vogais <b>U</b> e <b>E</b> aparecerem <b>juntas</b>, em qualquer ordem?</p>",
   "opts": [
    "1/12",
    "1/6",
    "1/5",
    "1/4",
    "1/3"
   ],
   "ans": 4,
   "solHead": "(E) 1/3",
   "sol": "<ul><li>FUVEST tem 6 letras distintas: <b>6! = 720</b> anagramas.</li><li>Junte U e E num bloco: são 5 \"objetos\", 5! = 120 arranjos, vezes 2 ordens dentro do bloco (UE ou EU) = <b>240</b>.</li><li>P = 240/720 = <b>1/3</b>.</li></ul><p><i>Erro comum:</i> esquecer a ordem dentro do bloco, 120/720 = 1/6 (B).<br>✔️ Verificação: o par (U, E) ocupa uma de C(6,2) = 15 duplas de posições, e 5 delas são vizinhas: 5/15 = 1/3 ✓.</p>"
  },
  {
   "n": 10,
   "topic": "progressões aritmética e geométrica",
   "diff": "difícil",
   "html": "<p>Uma progressão aritmética tem primeiro termo <b>1</b> e razão <b>r ≠ 0</b>. Seu 2º, seu 5º e seu 14º termos, nessa ordem, formam uma progressão geométrica.</p><p>A razão dessa progressão geométrica é</p>",
   "opts": [
    "2",
    "3",
    "4",
    "9",
    "13"
   ],
   "ans": 1,
   "solHead": "(B) 3",
   "sol": "<ul><li>Termos: a₂ = 1 + r, a₅ = 1 + 4r, a₁₄ = 1 + 13r.</li><li>Condição de PG: (1 + 4r)² = (1 + r)(1 + 13r), ou seja, 1 + 8r + 16r² = 1 + 14r + 13r².</li><li>Simplificando: 3r² − 6r = 0, logo r = 0 (excluído) ou <b>r = 2</b>.</li><li>Termos: 3, 9, 27. Razão da PG: <b>3</b>.</li></ul><p><i>Erro comum:</i> responder a razão da PA (A).<br>✔️ Verificação: 9/3 = 27/9 = 3 ✓.</p>"
  }
 ],
 "unicamp": [
  {
   "n": 1,
   "topic": "semelhança e porcentagem (razão entre áreas)",
   "diff": "fácil",
   "html": "<p>Um fabricante lançou um novo modelo de televisor. A tela nova é um retângulo <b>semelhante</b> à tela do modelo antigo (mesma proporção entre largura e altura), mas a sua <b>diagonal é 20% maior</b>.</p><p><b>Figura:</b> não é necessária. Todos os dados estão no texto.</p><p>Em relação à tela antiga, a área da tela nova é maior em</p>",
   "opts": [
    "exatamente 20%.",
    "entre 20% e 40%.",
    "entre 40% e 50%.",
    "mais de 50%."
   ],
   "ans": 2,
   "solHead": "c) entre 40% e 50%",
   "sol": "<ul><li>Em figuras semelhantes, <b>todas</b> as medidas de comprimento são multiplicadas pelo mesmo fator. Se a diagonal aumenta 20%, a largura e a altura também ficam multiplicadas por <b>k = 1,2</b>.</li><li>A área é largura × altura, então fica multiplicada por k² = 1,2² = <b>1,44</b>.</li><li>O aumento da área é <b>44%</b> (resultado exato), que fica entre 40% e 50%.</li></ul><p><i>Erro comum:</i> achar que a área cresce os mesmos 20% da diagonal (a).<br>✔️ Verificação com números: uma tela antiga de 40 cm × 30 cm (diagonal 50 cm, área 1 200 cm²) vira 48 cm × 36 cm (diagonal 60 cm, área 1 728 cm²). E 1 728 ÷ 1 200 = 1,44 ✓.</p>"
  },
  {
   "n": 2,
   "topic": "modelagem exponencial e logaritmo",
   "diff": "média",
   "html": "<p>Após uma dose, a concentração de um medicamento no sangue, em mg/L, é</p><p>C(t) = 50 · (0,8)ᵗ, com t em horas.</p><p>O efeito do remédio passa quando a concentração fica abaixo de <b>10 mg/L</b>.</p><p>Usando log na base 10, o tempo, em horas, até a concentração chegar a 10 mg/L é dado por</p>",
   "opts": [
    "(1 − log 2) / (1 − 3 log 2)",
    "(1 − 3 log 2) / (1 − log 2)",
    "5 (1 − log 2)",
    "log 2 / (3 log 2 − 1)"
   ],
   "ans": 0,
   "solHead": "a) (1 − log 2) / (1 − 3 log 2)",
   "sol": "<ul><li>50 · 0,8ᵗ = 10, então <b>0,8ᵗ = 0,2</b>.</li><li>Aplicando log: t · log 0,8 = log 0,2.</li><li>log 0,8 = log(8/10) = 3 log 2 − 1 e log 0,2 = log(2/10) = log 2 − 1.</li><li>t = (log 2 − 1) / (3 log 2 − 1) = <b>(1 − log 2) / (1 − 3 log 2)</b>. Basta multiplicar o numerador e o denominador por −1.</li></ul><p><i>Erro comum:</i> inverter a fração (b).<br>✔️ Verificação numérica: com log 2 ≈ 0,301, t ≈ 0,699 / 0,097 ≈ 7,2 h, e 0,8⁷ ≈ 0,21 (quase 0,2) ✓.</p>"
  },
  {
   "n": 3,
   "topic": "trigonometria no triângulo retângulo",
   "diff": "média",
   "html": "<p>Uma pessoa avista o topo de uma torre vertical sob um ângulo de <b>30°</b> com a horizontal. Ela caminha <b>20 m</b> em linha reta em direção à base da torre e passa a ver o topo sob um ângulo de <b>60°</b>. Despreze a altura da pessoa.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">                         ● topo\n                       ╱╱│\n                    ╱╱   │\n                 ╱╱      │ h\n              ╱╱  ╱      │\n           ╱╱30° ╱60°    │\n          ●─────●────────┘\n          ← 20 m→</pre><p>A altura da torre é</p>",
   "opts": [
    "10 m.",
    "15 m.",
    "10√3 m.",
    "20 m."
   ],
   "ans": 2,
   "solHead": "c) 10√3 m",
   "sol": "<p>Seja x a distância do 2º ponto até a base:</p><ul><li>tg 60° = h/x, então h = x√3.</li><li>tg 30° = h/(x + 20), então h = (x + 20)/√3.</li><li>Igualando: x√3 = (x + 20)/√3, logo 3x = x + 20 e <b>x = 10 m</b>.</li><li>h = 10√3 ≈ <b>17,3 m</b>.</li></ul><p>✔️ Verificação: o triângulo formado pelos dois pontos de observação e o topo é isósceles (ângulos de 30° e 30°). Por isso a distância do 2º ponto ao topo é 20 m, e h = 20 · sen 60° = 10√3 ✓.</p>"
  },
  {
   "n": 4,
   "topic": "análise combinatória (contagem com restrição)",
   "diff": "média",
   "html": "<p>Um grupo de 5 rapazes, entre eles Bruno, e 4 moças, entre elas Ana, vai formar uma comissão com <b>2 rapazes e 2 moças</b>. Ana e Bruno pediram para <b>não</b> estarem juntos na mesma comissão.</p><p>Respeitando o pedido, o número de comissões possíveis é</p>",
   "opts": [
    "48.",
    "54.",
    "60.",
    "72."
   ],
   "ans": 0,
   "solHead": "a) 48",
   "sol": "<ul><li>Sem restrição: C(5,2) · C(4,2) = 10 · 6 = <b>60</b> comissões.</li><li>Comissões com Ana <b>e</b> Bruno juntos: Bruno + 1 dos outros 4 rapazes (4 modos) e Ana + 1 das outras 3 moças (3 modos), ou seja, 4 · 3 = <b>12</b>.</li><li>Permitidas: 60 − 12 = <b>48</b>.</li></ul><p>✔️ Verificação por casos: sem Bruno, C(4,2) · 6 = 36; com Bruno e sem Ana, 4 · C(3,2) = 12; total 48 ✓.</p>"
  },
  {
   "n": 5,
   "topic": "probabilidade condicional (teste diagnóstico)",
   "diff": "difícil",
   "html": "<p>Um teste para uma doença tem estas características:</p><ul><li>a doença atinge <b>2%</b> da população;</li><li>o teste dá <b>positivo em 90%</b> dos doentes;</li><li>o teste dá <b>positivo em 5%</b> das pessoas saudáveis (falso positivo).</li></ul><p>Uma pessoa escolhida ao acaso fez o teste e o resultado foi <b>positivo</b>.</p><p>A probabilidade de ela realmente ter a doença é</p>",
   "opts": [
    "inferior a 10%.",
    "entre 10% e 30%.",
    "entre 30% e 90%.",
    "superior a 90%."
   ],
   "ans": 1,
   "solHead": "b) entre 10% e 30%",
   "sol": "<p>Imagine <b>10 000</b> pessoas:</p><ul><li>doentes: 2% = 200, e destes, 90% dão positivo, ou seja, <b>180</b>;</li><li>saudáveis: 9 800, e destes, 5% dão positivo, ou seja, <b>490</b>.</li><li>Positivos ao todo: 180 + 490 = 670. Doentes entre os positivos: 180 / 670 ≈ <b>26,9%</b>.</li></ul><p>A intuição falha aqui: como a doença é rara, a maior parte dos positivos vem dos saudáveis.<br><i>Erro comum:</i> responder 90% (d), que é P(positivo | doente), e não P(doente | positivo).<br>✔️ Verificação: 0,02·0,9 / (0,02·0,9 + 0,98·0,05) = 0,018 / 0,067 ≈ 0,269 ✓.</p>"
  },
  {
   "n": 6,
   "topic": "sequências (PA × PG)",
   "diff": "difícil",
   "html": "<p>Uma empresa oferece duas opções de reajuste salarial anual a quem ganha hoje <b>R$ 3 000,00</b>:</p><ul><li><b>Opção 1:</b> aumento fixo de R$ 200,00 por ano.</li><li><b>Opção 2:</b> aumento de 5% ao ano sobre o salário do ano anterior.</li></ul><p>Use: 1,05¹² ≈ 1,796 e 1,05¹³ ≈ 1,886.</p><p>O salário da opção 2 supera o da opção 1, pela primeira vez, no</p>",
   "opts": [
    "9º ano.",
    "13º ano.",
    "15º ano.",
    "20º ano."
   ],
   "ans": 1,
   "solHead": "b) 13º ano",
   "sol": "<ul><li>Opção 1 (PA): S₁(n) = 3 000 + 200n.</li><li>Opção 2 (PG): S₂(n) = 3 000 · 1,05ⁿ.</li><li>n = 12: S₁ = 5 400 e S₂ ≈ 3 000 × 1,796 = <b>5 388</b>. Ainda é menor.</li><li>n = 13: S₁ = 5 600 e S₂ ≈ 3 000 × 1,886 = <b>5 658</b>. Agora é maior.</li></ul><p>O crescimento da PG acelera, enquanto o da PA é constante. Depois que a PG ultrapassa, não volta mais para trás.<br>✔️ Verificação: no 1º ano, 3 200 &gt; 3 150, e a PA segue à frente até o 12º ano (5 400 &gt; 5 388).</p>"
  },
  {
   "n": 7,
   "topic": "geometria espacial (semelhança de sólidos)",
   "diff": "média",
   "html": "<p>Uma taça tem a forma de um <b>cone</b> com o vértice para baixo. Ela foi enchida até a <b>metade da altura</b> e contém <b>50 mL</b> de bebida.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">   \\‾‾‾‾‾‾‾‾‾‾‾/\n    \\         /\n     \\~~~~~~~/   ← metade da altura\n      \\░░░░░/\n       \\░░░/\n        \\░/\n         V</pre><p>Quantos mililitros ainda cabem na taça?</p>",
   "opts": [
    "50 mL",
    "200 mL",
    "350 mL",
    "400 mL"
   ],
   "ans": 2,
   "solHead": "c) 350 mL",
   "sol": "<ul><li>O líquido forma um cone <b>semelhante</b> à taça, com razão de semelhança 1/2.</li><li>Volumes de sólidos semelhantes seguem o <b>cubo</b> da razão: (1/2)³ = 1/8.</li><li>Capacidade total: 50 × 8 = 400 mL. Falta: 400 − 50 = <b>350 mL</b>.</li></ul><p><i>Erros comuns:</i> achar que a metade da altura é a metade do volume (a); responder a capacidade total (d).<br>✔️ Verificação: 50 é 1/8 de 400 ✓.</p>"
  },
  {
   "n": 8,
   "topic": "função quadrática (modelagem e inequação)",
   "diff": "média",
   "html": "<p>A altura de uma bola chutada para cima, em metros, é</p><p>h(t) = −5t² + 20t, com t em segundos.</p><p>Por quanto tempo a bola permanece <b>acima de 15 m</b> de altura?</p>",
   "opts": [
    "0,5 s",
    "1 s",
    "1,5 s",
    "2 s"
   ],
   "ans": 3,
   "solHead": "d) 2 s",
   "sol": "<ul><li>−5t² + 20t &gt; 15. Dividindo por −5 (e invertendo a desigualdade): t² − 4t + 3 &lt; 0.</li><li>As raízes são t = 1 e t = 3. A parábola é negativa entre elas: <b>1 &lt; t &lt; 3</b>.</li><li>Duração: 3 − 1 = <b>2 s</b>.</li></ul><p>✔️ Verificação: h(1) = 15 e h(3) = 15; h(2) = 20 (altura máxima) &gt; 15 ✓.</p>"
  },
  {
   "n": 9,
   "topic": "geometria analítica (área de região)",
   "diff": "fácil",
   "html": "<p>No plano cartesiano, considere o triângulo limitado pelas retas y = 2x, y = −x + 6 e pelo eixo x.</p><p>A área desse triângulo é</p>",
   "opts": [
    "6.",
    "12.",
    "18.",
    "24."
   ],
   "ans": 1,
   "solHead": "b) 12",
   "sol": "<ul><li>y = 2x corta o eixo x em (0, 0).</li><li>y = −x + 6 corta o eixo x em (6, 0).</li><li>As retas se cruzam onde 2x = −x + 6, ou seja, x = 2 e y = 4: ponto <b>(2, 4)</b>.</li><li>Base = 6 e altura = 4. Área = 6 · 4 / 2 = <b>12</b>.</li></ul><p>✔️ Verificação pelo determinante: ½ |0(0 − 4) + 6(4 − 0) + 2(0 − 0)| = ½ · 24 = 12 ✓.</p>"
  },
  {
   "n": 10,
   "topic": "estatística (média ponderada e argumentação)",
   "diff": "média",
   "html": "<p>Uma turma de <b>20 alunos</b> teve média <b>6,5</b> numa prova. Cinco alunos novos fizeram a mesma prova e, com eles, a média dos <b>25 alunos</b> passou a ser <b>7,0</b>.</p><p>A média dos cinco alunos novos foi</p>",
   "opts": [
    "7,5.",
    "8,0.",
    "8,5.",
    "9,0."
   ],
   "ans": 3,
   "solHead": "d) 9,0",
   "sol": "<ul><li>Soma das notas dos 20 alunos: 20 × 6,5 = <b>130</b>.</li><li>Soma das notas dos 25 alunos: 25 × 7,0 = <b>175</b>.</li><li>Soma dos 5 novos: 175 − 130 = 45. Média: 45 / 5 = <b>9,0</b>.</li></ul><p><i>Argumento qualitativo:</i> para \"puxar\" a média de 6,5 para 7,0, os novos precisam estar bem acima de 7. Isso já descarta (a).<br>✔️ Verificação: (130 + 45) / 25 = 7 ✓.</p>"
  }
 ],
 "unesp": [
  {
   "n": 1,
   "topic": "equação do 2º grau e Teorema de Pitágoras",
   "diff": "média",
   "html": "<p>Um terreno retangular tem <b>perímetro de 46 m</b> e <b>área de 120 m²</b>. O dono quer passar um cano em linha reta entre dois cantos opostos do terreno.</p><p>Qual o comprimento desse cano?</p>",
   "opts": [
    "13 m",
    "15 m",
    "17 m",
    "19 m",
    "23 m"
   ],
   "ans": 2,
   "solHead": "(C) 17 m",
   "sol": "<ul><li>Lados x e y: 2x + 2y = 46, então x + y = 23; e x · y = 120.</li><li>x e y são as raízes de t² − 23t + 120 = 0: t = (23 ± √(529 − 480))/2 = (23 ± 7)/2, ou seja, <b>15 e 8</b>.</li><li>Diagonal: √(15² + 8²) = √(225 + 64) = √289 = <b>17 m</b>.</li></ul><p><i>Atalho:</i> d² = x² + y² = (x + y)² − 2xy = 529 − 240 = 289, sem achar os lados.<br>✔️ Verificação: 8 + 15 = 23 e 8 · 15 = 120 ✓.</p>"
  },
  {
   "n": 2,
   "topic": "área de figuras planas (círculo)",
   "diff": "fácil",
   "html": "<p>Uma placa quadrada de <b>12 cm</b> de lado teve os quatro cantos arredondados: de cada canto foi retirado um <b>quarto de círculo de raio 3 cm</b>, com centro no vértice do quadrado.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\">   ╭───────────────╮\n  ╱                 ╲      ← cada canto: ¼ de círculo\n │                   │       de raio 3 cm retirado\n │       12 cm       │\n │                   │\n  ╲                 ╱\n   ╰───────────────╯</pre><p>Usando π = 3, a área da placa que restou é</p>",
   "opts": [
    "108 cm².",
    "117 cm².",
    "126 cm².",
    "135 cm².",
    "141 cm²."
   ],
   "ans": 1,
   "solHead": "(B) 117 cm²",
   "sol": "<ul><li>Os quatro quartos de círculo formam <b>um círculo inteiro</b> de raio 3: área π · 3² = 3 · 9 = 27 cm².</li><li>Restou: 12² − 27 = 144 − 27 = <b>117 cm²</b>.</li></ul><p><i>Erro comum:</i> tirar só um quarto de círculo, 144 − 6,75 (não aparece), ou tirar 4 círculos inteiros, 144 − 108 = 36.<br>✔️ Verificação: 27 cm² é menos de 1/5 da placa, então a área restante deve ficar perto de 115 ✓.</p>"
  },
  {
   "n": 3,
   "topic": "estatística (média, mediana e moda)",
   "diff": "média",
   "html": "<p>Numa turma de 25 alunos, perguntou-se quantos livros cada um leu nas férias:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Livros lidos</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead><tbody><tr><td>Nº de alunos</td><td>3</td><td>5</td><td>8</td><td>6</td><td>3</td></tr></tbody></table></div><p>A média, a mediana e a moda do número de livros lidos são, respectivamente,</p>",
   "opts": [
    "2,04; 2; 2.",
    "2; 2,04; 2.",
    "2,04; 3; 2.",
    "2,5; 2; 8.",
    "2; 2; 3."
   ],
   "ans": 0,
   "solHead": "(A) 2,04; 2; 2",
   "sol": "<ul><li><b>Média:</b> (0·3 + 1·5 + 2·8 + 3·6 + 4·3) / 25 = (0 + 5 + 16 + 18 + 12) / 25 = 51/25 = <b>2,04</b>.</li><li><b>Mediana:</b> com 25 dados, é o 13º. As posições acumuladas são: 0 livros → 1ª a 3ª; 1 livro → 4ª a 8ª; 2 livros → 9ª a 16ª. O 13º é <b>2</b>.</li><li><b>Moda:</b> o valor mais frequente, 2 livros (8 alunos), ou seja, <b>2</b>.</li></ul><p><i>Erro comum:</i> dar a frequência 8 como moda (D). A moda é o <b>valor</b>, não quantas vezes ele aparece.<br>✔️ Verificação: 3 + 5 + 8 + 6 + 3 = 25 alunos ✓.</p>"
  },
  {
   "n": 4,
   "topic": "função quadrática (máximo)",
   "diff": "fácil",
   "html": "<p>O lucro mensal de uma pequena fábrica, em reais, ao produzir x unidades de um produto é</p><p>L(x) = −2x² + 120x − 1 000.</p><p>O lucro máximo que a fábrica pode ter num mês é</p>",
   "opts": [
    "R$ 600,00.",
    "R$ 800,00.",
    "R$ 1 000,00.",
    "R$ 1 800,00.",
    "R$ 3 600,00."
   ],
   "ans": 1,
   "solHead": "(B) R$ 800,00",
   "sol": "<ul><li>A parábola tem a &lt; 0, então tem ponto de máximo no vértice: x = −b/(2a) = −120/(−4) = <b>30 unidades</b>.</li><li>L(30) = −2·900 + 3 600 − 1 000 = −1 800 + 3 600 − 1 000 = <b>800</b>.</li></ul><p><i>Erro comum:</i> responder o valor de x, ou esquecer o custo fixo (D, R$ 1 800).<br>✔️ Verificação: L(29) = L(31) = 798 &lt; 800 ✓.</p>"
  },
  {
   "n": 5,
   "topic": "função trigonométrica (modelagem)",
   "diff": "média",
   "html": "<p>Num dia de verão, a temperatura de uma cidade, em °C, foi modelada por</p><p>T(t) = 22 − 6 · cos(πt/12),</p><p>em que t é o número de horas após a meia-noite (0 ≤ t ≤ 24).</p><p>A temperatura atingiu <b>25 °C</b> pela primeira vez no dia às</p>",
   "opts": [
    "4 h.",
    "6 h.",
    "8 h.",
    "10 h.",
    "12 h."
   ],
   "ans": 2,
   "solHead": "(C) 8 h",
   "sol": "<ul><li>22 − 6 cos(πt/12) = 25, então <b>cos(πt/12) = −1/2</b>.</li><li>O primeiro ângulo positivo com cosseno −1/2 é 2π/3: πt/12 = 2π/3, logo <b>t = 8</b>.</li><li>Faz sentido: à meia-noite T = 16 °C (mínima) e ao meio-dia T = 28 °C (máxima). Os 25 °C chegam no meio da manhã.</li></ul><p>✔️ Verificação: T(8) = 22 − 6 · cos(2π/3) = 22 − 6 · (−1/2) = 25 ✓.</p>"
  },
  {
   "n": 6,
   "topic": "geometria analítica (distância e área)",
   "diff": "fácil",
   "html": "<p>No plano cartesiano, os pontos A(1, 2), B(7, 2) e C(4, 6) são vértices de um triângulo.</p><p>Esse triângulo é</p>",
   "opts": [
    "equilátero, de área 12.",
    "isósceles, de área 24.",
    "retângulo, de área 15.",
    "escaleno, de área 12.",
    "isósceles, de área 12."
   ],
   "ans": 4,
   "solHead": "(E) isósceles, de área 12",
   "sol": "<ul><li>AB = 7 − 1 = <b>6</b> (horizontal).</li><li>AC = √((4−1)² + (6−2)²) = √(9 + 16) = <b>5</b>.</li><li>BC = √((4−7)² + (6−2)²) = √(9 + 16) = <b>5</b>.</li><li>Dois lados iguais: <b>isósceles</b>. Base AB = 6 e altura = 6 − 2 = 4 (C fica acima do meio de AB). Área = 6·4/2 = <b>12</b>.</li></ul><p><i>Erro comum:</i> esquecer de dividir por 2 (B, área 24).<br>✔️ Verificação: 5² + 5² = 50 ≠ 36, então não é retângulo ✓.</p>"
  },
  {
   "n": 7,
   "topic": "matrizes e determinantes",
   "diff": "média",
   "html": "<p>Seja A a matriz</p><pre class=\"bq-fig\">A = ⎡ 2  1 ⎤\n    ⎣ 3  4 ⎦</pre><p>e Aᵀ a sua transposta. O determinante da matriz 2A · Aᵀ é</p>",
   "opts": [
    "20",
    "25",
    "50",
    "100",
    "200"
   ],
   "ans": 3,
   "solHead": "(D) 100",
   "sol": "<p>Propriedades de determinantes, com A de ordem 2:</p><ul><li>det(A) = 2·4 − 1·3 = <b>5</b>.</li><li>det(2A) = 2² · det(A) = 4 · 5 = <b>20</b>, pois cada uma das 2 linhas é multiplicada por 2.</li><li>det(Aᵀ) = det(A) = 5.</li><li>det(2A · Aᵀ) = det(2A) · det(Aᵀ) = 20 · 5 = <b>100</b>.</li></ul><p><i>Erro comum:</i> fazer det(2A) = 2 · det(A) = 10, o que daria 50 (C).<br>✔️ Verificação: 2A·Aᵀ = [[10, 20], [20, 50]], e 10·50 − 20·20 = 100 ✓.</p>"
  },
  {
   "n": 8,
   "topic": "números complexos (operações e conjugado)",
   "diff": "fácil",
   "html": "<p>Sendo z = 3 + 4i e z̄ o conjugado de z, o número z² + z · z̄ é</p>",
   "opts": [
    "18 + 24i",
    "−7 + 24i",
    "25",
    "32 + 24i",
    "18 − 24i"
   ],
   "ans": 0,
   "solHead": "(A) 18 + 24i",
   "sol": "<ul><li>z² = (3 + 4i)² = 9 + 24i + 16i² = 9 + 24i − 16 = <b>−7 + 24i</b>.</li><li>z · z̄ = |z|² = 3² + 4² = <b>25</b>.</li><li>Soma: −7 + 25 + 24i = <b>18 + 24i</b>.</li></ul><p>✔️ Verificação: z(z + z̄) = (3 + 4i)·6 = 18 + 24i ✓ (um atalho elegante).</p>"
  },
  {
   "n": 9,
   "topic": "polinômios (forma fatorada e raízes)",
   "diff": "média",
   "html": "<p>O gráfico de um polinômio P(x) de <b>grau 3</b>, com coeficientes reais, corta o eixo x <b>exatamente</b> nos pontos de abscissas <b>−1</b>, <b>2</b> e <b>4</b>. Ele corta o eixo y no ponto <b>(0, 16)</b>.</p><p><b>Figura (descrição em texto):</b> da esquerda para a direita, o gráfico vem de baixo e cruza o eixo x em x = −1. Ele fica <b>acima</b> do eixo x entre −1 e 2, passando pelo ponto (0, 16). Cruza o eixo x em x = 2 e fica <b>abaixo</b> do eixo entre 2 e 4. Cruza de novo em x = 4 e depois sobe. Não é preciso medir nada no gráfico: os dados necessários estão no texto.</p><p>O valor de P(1) é</p>",
   "opts": [
    "4",
    "6",
    "8",
    "12",
    "16"
   ],
   "ans": 3,
   "solHead": "(D) 12",
   "sol": "<ul><li>Um polinômio de grau 3 com raízes −1, 2 e 4 tem a forma P(x) = <b>a(x + 1)(x − 2)(x − 4)</b>, com a ≠ 0.</li><li>Usando o ponto (0, 16): P(0) = a · 1 · (−2) · (−4) = 8a = 16, então <b>a = 2</b>.</li><li>P(1) = 2 · (1 + 1) · (1 − 2) · (1 − 4) = 2 · 2 · (−1) · (−3) = <b>12</b> (valor exato).</li></ul><p><i>Erros comuns:</i> esquecer o coeficiente a, ou seja, usar a = 1 e achar 6 (B); responder P(0) = 16 (E).<br>✔️ Verificação: P(x) = 2(x + 1)(x − 2)(x − 4) = 2x³ − 10x² + 4x + 16. Então P(0) = 16 ✓ e P(1) = 2 − 10 + 4 + 16 = 12 ✓.</p>"
  },
  {
   "n": 10,
   "topic": "probabilidade e combinatória",
   "diff": "média",
   "html": "<p>Um grupo de <b>10 voluntários</b>, sendo <b>4 mulheres</b> e <b>6 homens</b>, vai sortear <b>3 pessoas</b> para uma tarefa.</p><p>A probabilidade de serem sorteadas <b>exatamente 2 mulheres</b> é</p>",
   "opts": [
    "1/30",
    "1/10",
    "1/6",
    "1/5",
    "3/10"
   ],
   "ans": 4,
   "solHead": "(E) 3/10",
   "sol": "<ul><li>Total de grupos de 3: C(10,3) = <b>120</b>.</li><li>Exatamente 2 mulheres e 1 homem: C(4,2) · C(6,1) = 6 · 6 = <b>36</b>.</li><li>P = 36/120 = <b>3/10</b>.</li></ul><p>✔️ Verificação: somando os casos com 0, 1, 2 e 3 mulheres: 20 + 60 + 36 + 4 = 120 ✓.</p>"
  }
 ],
 "obmep": [
  {
   "n": 1,
   "topic": "padrões e sequências",
   "diff": "fácil",
   "html": "<p>Lia monta figuras com palitos de fósforo, formando hexágonos lado a lado em fila. Hexágonos vizinhos <b>dividem um lado</b>.</p><p><b>Figura (esquema em texto):</b> cada hexágono tem 6 palitos (2 em cima, 2 nas laterais e 2 embaixo). Dois hexágonos vizinhos dividem o palito vertical entre eles.</p><pre class=\"bq-fig\">Figura 1    Figura 2         Figura 3\n  /\\          /\\   /\\          /\\   /\\   /\\\n /  \\        /  \\ /  \\        /  \\ /  \\ /  \\\n|    |      |    |    |      |    |    |    |\n \\  /        \\  / \\  /        \\  / \\  / \\  /\n  \\/          \\/   \\/          \\/   \\/   \\/\n6 palitos   11 palitos       16 palitos</pre><p>Quantos palitos ela usará na <b>Figura 20</b>?</p>",
   "opts": [
    "101",
    "106",
    "110",
    "120",
    "121"
   ],
   "ans": 0,
   "solHead": "(A) 101",
   "sol": "<ul><li>O 1º hexágono usa 6 palitos. Cada hexágono novo aproveita 1 lado do anterior, então acrescenta só <b>5 palitos</b>: 6, 11, 16, 21, …</li><li>Figura n: 6 + 5·(n − 1) = <b>5n + 1</b>.</li><li>Figura 20: 5·20 + 1 = <b>101</b>.</li></ul><p><i>Erros comuns:</i> contar 6 por hexágono, 120 (D); ou 6 + 5·20 = 106 (B), errando a quantidade de hexágonos novos.<br>✔️ Verificação: a fórmula dá 6, 11, 16 para n = 1, 2, 3 ✓.</p>"
  },
  {
   "n": 2,
   "topic": "divisibilidade e MMC",
   "diff": "fácil",
   "html": "<p>Qual é o <b>maior</b> número de três algarismos que é divisível ao mesmo tempo por 2, 3, 4, 5 e 6?</p>",
   "opts": [
    "900",
    "940",
    "960",
    "990",
    "999"
   ],
   "ans": 2,
   "solHead": "(C) 960",
   "sol": "<ul><li>Ser divisível por 2, 3, 4, 5 e 6 é o mesmo que ser divisível pelo MMC deles: MMC = 4 · 3 · 5 = <b>60</b>.</li><li>Maior múltiplo de 60 com 3 algarismos: 999 ÷ 60 = 16,6…, então <b>60 × 16 = 960</b>.</li></ul><p><i>Erro comum:</i> pegar 990, que é divisível por 2, 3, 5 e 6, mas <b>não</b> por 4 (990 ÷ 4 = 247,5).<br>✔️ Verificação: 60 × 17 = 1 020 já tem 4 algarismos ✓.</p>"
  },
  {
   "n": 3,
   "topic": "lógica",
   "diff": "média",
   "html": "<p>Um dos três amigos, Ana, Bia ou Caio, quebrou um vaso. Eles disseram:</p><ul><li><b>Ana:</b> \"Foi a Bia.\"</li><li><b>Bia:</b> \"Não fui eu.\"</li><li><b>Caio:</b> \"Não fui eu.\"</li></ul><p>Sabe-se que <b>apenas um</b> deles disse a verdade.</p><p>Quem quebrou o vaso?</p>",
   "opts": [
    "Ana",
    "Bia",
    "Caio",
    "Ana ou Bia, não dá para saber qual",
    "Não é possível descobrir"
   ],
   "ans": 2,
   "solHead": "(C) Caio",
   "sol": "<p>Teste cada suspeito e conte quantas frases ficam verdadeiras:</p><div class=\"bq-tw\"><table class=\"bq-table\"><thead><tr><th>Culpado</th><th>Ana (\"foi a Bia\")</th><th>Bia (\"não fui eu\")</th><th>Caio (\"não fui eu\")</th><th>Verdades</th></tr></thead><tbody><tr><td>Ana</td><td>F</td><td>V</td><td>V</td><td>2</td></tr><tr><td>Bia</td><td>V</td><td>F</td><td>V</td><td>2</td></tr><tr><td><b>Caio</b></td><td>F</td><td>V</td><td>F</td><td><b>1</b> ✓</td></tr></tbody></table></div><p>Só com o Caio culpado há exatamente uma verdade.<br>✔️ Verificação: Caio culpado → Ana mente, Bia fala a verdade, Caio mente ✓.</p>"
  },
  {
   "n": 4,
   "topic": "contagem",
   "diff": "média",
   "html": "<p>Quantos números de <b>três algarismos</b> têm a soma dos algarismos igual a <b>4</b>?</p>",
   "opts": [
    "6",
    "8",
    "9",
    "10",
    "12"
   ],
   "ans": 3,
   "solHead": "(D) 10",
   "sol": "<p>O primeiro algarismo não pode ser 0. Liste pelo algarismo das centenas:</p><ul><li><b>1</b>: 103, 112, 121, 130 → 4</li><li><b>2</b>: 202, 211, 220 → 3</li><li><b>3</b>: 301, 310 → 2</li><li><b>4</b>: 400 → 1</li></ul><p>Total: 4 + 3 + 2 + 1 = <b>10</b>.<br>✔️ Verificação: o padrão 4, 3, 2, 1 aparece porque, fixada a centena c, os outros dois algarismos somam 4 − c, e há 4 − c + 1 jeitos de fazer isso ✓.</p>"
  },
  {
   "n": 5,
   "topic": "princípio da casa dos pombos",
   "diff": "média",
   "html": "<p>Numa gaveta há <b>6 meias vermelhas</b>, <b>8 azuis</b> e <b>10 brancas</b>, todas misturadas. Está escuro e não dá para ver as cores.</p><p>Qual o <b>menor</b> número de meias que é preciso tirar para ter <b>certeza</b> de que pelo menos uma delas é <b>azul</b>?</p>",
   "opts": [
    "2",
    "3",
    "9",
    "11",
    "17"
   ],
   "ans": 4,
   "solHead": "(E) 17",
   "sol": "<p>Pense no <b>pior azar</b>: tirar todas as meias que não são azuis antes de qualquer azul.</p><ul><li>Não azuis: 6 vermelhas + 10 brancas = <b>16</b>.</li><li>Mesmo tirando essas 16, a próxima é obrigatoriamente azul: 16 + 1 = <b>17</b>.</li></ul><p><i>Erro comum:</i> responder 3 ou 4, que vale para \"duas meias da <b>mesma cor</b>\", outra pergunta.<br>✔️ Verificação: com 16 meias pode não haver nenhuma azul, então 16 não basta ✓.</p>"
  },
  {
   "n": 6,
   "topic": "geometria (áreas)",
   "diff": "média",
   "html": "<p>Rui desenhou um quadrado de <b>8 cm</b> de lado. Ligando os <b>pontos médios</b> dos lados, desenhou um quadrado menor dentro dele. Depois repetiu o procedimento no quadrado menor, e de novo no seguinte. Ao todo, fez esse procedimento <b>três vezes</b>, sempre no quadrado mais recente.</p><p><b>Figura (esquema em texto, fora de escala; todas as medidas estão no enunciado):</b></p><pre class=\"bq-fig\"> ┌───────◆───────┐\n │     ╱   ╲     │\n │   ╱  ┌─┐  ╲   │\n ◆  ╱   │◇│   ╲  ◆      (só os primeiros passos)\n │   ╲  └─┘  ╱   │\n │     ╲   ╱     │\n └───────◆───────┘</pre><p>Qual a área do <b>último</b> quadrado desenhado?</p>",
   "opts": [
    "8 cm²",
    "12 cm²",
    "16 cm²",
    "24 cm²",
    "32 cm²"
   ],
   "ans": 0,
   "solHead": "(A) 8 cm²",
   "sol": "<p>Ligando os pontos médios, o quadrado novo tem <b>metade da área</b> do anterior. Dobre o quadrado: os 4 triângulos dos cantos cobrem exatamente o quadrado do meio.</p><ul><li>Original: 8 × 8 = 64 cm².</li><li>1ª vez: 32 cm². 2ª vez: 16 cm². 3ª vez: <b>8 cm²</b>.</li></ul><p><i>Erros comuns:</i> parar na 2ª vez (C); dividir o lado por 2 em vez da área.<br>✔️ Verificação: o 3º quadrado tem lado √8 ≈ 2,83 cm, e 2,83² ≈ 8 ✓.</p>"
  },
  {
   "n": 7,
   "topic": "frações",
   "diff": "média",
   "html": "<p>Júlia gastou <b>1/3</b> do seu dinheiro num livro. Depois gastou <b>1/4 do que sobrou</b> num lanche. No fim, ficou com <b>R$ 36,00</b>.</p><p>Quanto Júlia tinha no começo?</p>",
   "opts": [
    "R$ 48,00",
    "R$ 54,00",
    "R$ 60,00",
    "R$ 72,00",
    "R$ 96,00"
   ],
   "ans": 3,
   "solHead": "(D) R$ 72,00",
   "sol": "<p>Pensando \"de trás para frente\":</p><ul><li>Depois do lanche ficou 3/4 do que havia sobrado. Se 3/4 valem R$ 36, o que sobrou do livro era 36 ÷ 3 × 4 = <b>R$ 48</b>.</li><li>Depois do livro ficou 2/3 do total. Se 2/3 valem R$ 48, o total era 48 ÷ 2 × 3 = <b>R$ 72</b>.</li></ul><p><i>Erro comum:</i> somar as frações (1/3 + 1/4 = 7/12) como se as duas fossem do total. Isso daria 36 ÷ (5/12) = 86,40.<br>✔️ Verificação: 72 − 24 (livro) = 48; 48 − 12 (lanche) = 36 ✓.</p>"
  },
  {
   "n": 8,
   "topic": "ângulos (relógio)",
   "diff": "média",
   "html": "<p>Qual é o <b>menor</b> ângulo formado pelos ponteiros de um relógio às <b>5 h 10 min</b>?</p><p><b>Figura:</b> não é necessária. Considere um relógio analógico comum, de 12 horas, em que os <b>dois ponteiros andam sem parar</b> (o das horas também se move entre um número e outro).</p>",
   "opts": [
    "90°",
    "95°",
    "100°",
    "105°",
    "120°"
   ],
   "ans": 1,
   "solHead": "(B) 95°",
   "sol": "<p>O relógio tem 360°. Cada número fica a 30° do seguinte.</p><ul><li><b>Ponteiro dos minutos</b> às 10 min: está no 2, ou seja, 2 × 30° = <b>60°</b> a partir do 12.</li><li><b>Ponteiro das horas</b>: anda 30° por hora, ou 0,5° por minuto. Às 5 h 10 min, está em 5 × 30° + 10 × 0,5° = 150° + 5° = <b>155°</b>.</li><li>Diferença: 155° − 60° = <b>95°</b>.</li></ul><p><i>Erro comum:</i> deixar o ponteiro das horas parado no 5, o que dá 150° − 60° = 90° (A).<br>✔️ Verificação: 95° &lt; 180°, então é mesmo o menor ângulo ✓.</p>"
  },
  {
   "n": 9,
   "topic": "sequências e padrões (resto da divisão)",
   "diff": "fácil",
   "html": "<p>Pedro escreveu a palavra <b>OBMEP</b> várias vezes seguidas, sem espaços:</p><p>OBMEPOBMEPOBMEPOBMEP…</p><p>Qual é a <b>2025ª</b> letra que ele escreveu?</p>",
   "opts": [
    "O",
    "B",
    "M",
    "E",
    "P"
   ],
   "ans": 4,
   "solHead": "(E) P",
   "sol": "<ul><li>A palavra tem 5 letras e se repete. A letra na posição n depende do <b>resto de n por 5</b>: resto 1 → O, 2 → B, 3 → M, 4 → E, 0 → P.</li><li>2025 = 5 × 405, com <b>resto 0</b>, então a letra é <b>P</b>.</li></ul><p>✔️ Verificação: as posições 5, 10, 15, … são todas P, e 2025 é múltiplo de 5 ✓.</p>"
  },
  {
   "n": 10,
   "topic": "jogos e estratégia",
   "diff": "difícil",
   "html": "<p>Num jogo há <b>14 palitos</b> sobre a mesa. Dois jogadores se alternam e, na sua vez, cada um tira <b>1, 2 ou 3 palitos</b>. Quem tirar o <b>último palito vence</b>.</p><p>Quantos palitos o primeiro jogador deve tirar na primeira jogada para <b>garantir</b> a vitória, não importa como o outro jogue?</p>",
   "opts": [
    "1",
    "2",
    "3",
    "Qualquer quantidade serve",
    "Não há como garantir a vitória"
   ],
   "ans": 1,
   "solHead": "(B) 2",
   "sol": "<p>A ideia é deixar o adversário sempre diante de um <b>múltiplo de 4</b>:</p><ul><li>Com 4 palitos na mesa, quem joga perde: se tirar 1, 2 ou 3, o outro tira o resto (3, 2 ou 1).</li><li>Então o 1º jogador tira <b>2</b> e deixa <b>12</b>.</li><li>A cada rodada, se o adversário tira k palitos, ele tira 4 − k. A mesa passa por 12 → 8 → 4 → 0, e ele pega o último.</li></ul><p><i>Erro comum:</i> tirar 3 (o máximo) e deixar 11. Aí o adversário pode tirar 3, deixar 8 e usar a mesma estratégia contra você.<br>✔️ Verificação: 14 = 4 × 3 + 2. O resto 2 é exatamente o que se deve tirar na primeira jogada ✓.</p>"
  }
 ]
};
