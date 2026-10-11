# BNCC no Matemática Show: como os códigos foram conferidos

Cada assunto do app mostra, em **Aprender → (assunto) → Plano da aula**:
- o objetivo;
- o que é bom saber antes, com o seu nível em cada assunto;
- as habilidades da BNCC que correspondem diretamente ao assunto;
- como mostrar que domina.

Os dados ficam em `js/assuntos/curriculo.js`.

## Regra: nenhum código sem conferência

1. **Escolha pelo conteúdo.** Para cada assunto, escolhi a habilidade pelo **conteúdo** das questões que o app gera (veja os geradores em `js/assuntos/`), não pelo nome do assunto.
2. **Duas fontes no mínimo.** O site oficial do MEC (basenacionalcomum.mec.gov.br) **não pôde ser acessado** do ambiente de desenvolvimento (bloqueado pela rede). Por isso cada código só foi aceito quando **duas ou mais fontes independentes** mostraram o mesmo código com o mesmo conteúdo. As fontes foram planos de aula da Nova Escola, currículos estaduais (GO, CE, MG, SP), editoras, IBGE Educa e trabalhos acadêmicos (CAPES, UFMS, UFRGS, UFV…).
3. **Atenção ao Profez.** Uma das buscas indicou que páginas do **Profez** podem ser geradas por IA. Ele nunca foi usado como fonte única.
4. **O app mostra um resumo.** O texto exibido é um resumo do conteúdo, **não a redação oficial**. Para citação formal (plano de ensino, documento da escola), confira no documento oficial da BNCC.
5. **Sem correspondência, sem código.** Assunto sem habilidade correspondente fica **sem código** e com uma nota explicando o motivo.
6. **Testes.** `tests/unidade/curriculo.test.mjs` impede que alguém acrescente um código sem pelo menos 2 fontes, com formato errado, com ano incoerente, ou que esteja na lista de recusados.

## Divergências encontradas nas fontes (por isso a regra das 2 fontes)

- Um plano da Nova Escola atribui o texto da **EF06MA11** ao código EF06MA10. As demais fontes concordam com EF06MA11.
- Um plano atribui o texto da **EF07MA32** ao código EF07MA26.
- Um material de Goiás escreve **EM13MA308** (sem o T) e subdivide habilidades (EF07MA01-B, EF07MA02-A): são desdobramentos estaduais, não da BNCC.

## Habilidades usadas (38)

| Código | Ano | Conteúdo (resumo, não é a redação oficial) | Assuntos do app | Fontes onde foi conferido |
|---|---|---|---|---|
| **EF03MA05** | 3º ano | Usar procedimentos de cálculo mental e escrito em problemas de adição e subtração com números naturais. | Adição, Subtração | tudosaladeaula.com (habilidades do 3º ano); propei.uerr.edu.br (produto educacional) |
| **EF03MA06** | 3º ano | Resolver e elaborar problemas de adição e subtração (juntar, acrescentar, separar, retirar, comparar, completar), com cálculo exato, aproximado ou mental. | Adição, Subtração | tudosaladeaula.com (habilidades do 3º ano); novaescola.org.br (planos de aula do 3º ano) |
| **EF03MA24** | 3º ano | Resolver e elaborar problemas de comparação e equivalência de valores monetários do sistema brasileiro (compra, venda, troca). | Dinheiro e troco | profez.com.br; novaescola.org.br (planos de aula do 3º ano); tudosaladeaula.com |
| **EF04MA06** | 4º ano | Resolver e elaborar problemas de multiplicação (adição de parcelas iguais, organização retangular, proporcionalidade) com estimativa, cálculo mental e algoritmos. | Multiplicação | funes.uniandes.edu.co (Vieira, 2021); novaescola.org.br (planos do 4º ano); tudosaladeaula.com |
| **EF04MA07** | 4º ano | Resolver e elaborar problemas de divisão com divisor de até dois algarismos (repartição e medida), com estimativa, cálculo mental e algoritmos. | Divisão | novaescola.org.br (planos do 4º ano); tudosaladeaula.com (habilidades do 4º ano) |
| **EF06MA07** | 6º ano | Compreender, comparar e ordenar frações (parte de inteiros e resultado de divisão) e identificar frações equivalentes. | Frações | novaescola.org.br/planos-de-aula/habilidades/EF06MA07; profez.com.br; tudosaladeaula.com |
| **EF06MA10** | 6º ano | Resolver e elaborar problemas de adição e subtração com números racionais positivos na forma de fração. | Frações | tudosaladeaula.com (habilidades do 6º ano); projecao.br (documento curricular) |
| **EF06MA11** | 6º ano | Resolver e elaborar problemas com números racionais positivos na forma decimal, com as quatro operações e potenciação, usando estimativas e arredondamentos. | Números decimais | seduc.ce.gov.br (correlação de Matemática 2023); docs.google.com (plano de ensino); tudosaladeaula.com |
| **EF06MA13** | 6º ano | Resolver e elaborar problemas de porcentagem pela ideia de proporcionalidade, sem regra de três, com estratégias pessoais, cálculo mental e calculadora. | Porcentagem | periodicos.uffs.edu.br; todamateria.com.br (planos do 6º ano); anais-siiepe.ufpel.edu.br (2024) |
| **EF07MA01** | 7º ano | Resolver e elaborar problemas com números naturais envolvendo divisor e múltiplo (podendo incluir MDC e MMC) por estratégias diversas. | MMC e MDC | profez.com.br; tudosaladeaula.com (habilidades do 7º ano); novaescola.org.br (planos de MMC e MDC) |
| **EF07MA02** | 7º ano | Resolver e elaborar problemas de porcentagem, como acréscimos e decréscimos simples, com cálculo mental e calculadora (educação financeira). | Porcentagem, Descontos e aumentos | profez.com.br; novaescola.org.br (planos do 7º ano); portal.educacao.go.gov.br |
| **EF07MA17** | 7º ano | Resolver e elaborar problemas de proporcionalidade direta e inversa entre duas grandezas, usando sentença algébrica. | Regra de três | profez.com.br; novaescola.org.br (planos de proporcionalidade) |
| **EF07MA18** | 7º ano | Resolver e elaborar problemas representados por equações polinomiais de 1º grau redutíveis a ax + b = c, usando as propriedades da igualdade. | Equações do 1º grau | profez.com.br; publicacoeseventos.unijui.edu.br; educapes.capes.gov.br (produto educacional) |
| **EF07MA31** | 7º ano | Estabelecer expressões de cálculo de área de triângulos e de quadriláteros. | Áreas e perímetros | profez.com.br; tudosaladeaula.com (habilidades do 7º ano); todamateria.com.br (plano de aula) |
| **EF07MA32** | 7º ano | Resolver e elaborar problemas de área de figuras planas que podem ser decompostas em quadrados, retângulos e/ou triângulos. | Áreas e perímetros | profez.com.br; todamateria.com.br; tudosaladeaula.com |
| **EF08MA01** | 8º ano | Efetuar cálculos com potências de expoentes inteiros e usar notação científica. | Potenciação e radiciação | profez.com.br; novaescola.org.br (planos do 8º ano) |
| **EF08MA08** | 8º ano | Resolver e elaborar problemas representados por sistemas de equações de 1º grau com duas incógnitas e interpretar as soluções (plano cartesiano como recurso). | Sistemas de equações | tudosaladeaula.com (habilidades do 8º ano); novaescola.org.br (planos de sistemas); profez.com.br |
| **EF08MA25** | 8º ano | Obter média, moda e mediana de uma pesquisa estatística, compreender seus significados e relacioná-los com a dispersão (amplitude). | Média, moda e mediana | editoradobrasil.com.br (MAT8); educa.ibge.gov.br; profez.com.br |
| **EF09MA05** | 9º ano | Resolver e elaborar problemas com porcentagens sucessivas e determinação de taxas percentuais (educação financeira). | Descontos e aumentos | profez.com.br; editoradobrasil.com.br (MAT9); novaescola.org.br (planos do 9º ano) |
| **EF09MA06** | 9º ano | Compreender funções como relações de dependência unívoca entre duas variáveis, com representações numérica, algébrica e gráfica. | Função do 1º grau | editoradobrasil.com.br (MAT9); novaescola.org.br (planos de funções); planos.professormg.com.br |
| **EF09MA09** | 9º ano | Compreender a fatoração de expressões algébricas (produtos notáveis) para resolver problemas com equações polinomiais do 2º grau. | Equações do 2º grau | educapes.capes.gov.br (plano de aula EF09MA09); novaescola.org.br (planos de fatoração); profez.com.br |
| **EF09MA14** | 9º ano | Resolver e elaborar problemas de aplicação do teorema de Pitágoras ou das relações de proporcionalidade entre retas paralelas cortadas por secantes. | Triângulo retângulo | periodicos.ufms.br; editoradobrasil.com.br (MAT9); novaescola.org.br |
| **EM13MAT102** | Ensino Médio | Analisar tabelas, gráficos e amostras de pesquisas divulgadas na mídia, identificando inadequações que induzam a erros (escalas, amostras). | Análise de gráficos | profez.com.br; consed.org.br (análise da BNCC do EM); jieem.pgsscogna.com.br |
| **EM13MAT104** | Ensino Médio | Interpretar taxas e índices socioeconômicos (IDH, inflação…) investigando como são calculados. | Taxas de inflação | funes.uniandes.edu.co (Pavan, 2021); revista.uepb.edu.br |
| **EM13MAT301** | Ensino Médio | Resolver e elaborar problemas com equações lineares simultâneas, com técnicas algébricas e gráficas. | Sistemas de equações | profez.com.br; seduc.ce.gov.br (Matemática Básica III) |
| **EM13MAT302** | Ensino Médio | Construir modelos com funções polinomiais de 1º ou 2º graus para resolver problemas em contextos diversos. | Função do 1º grau, Função quadrática | ufrgs.br (PIBID — avaliações do 1º ano); portal.educacao.go.gov.br |
| **EM13MAT303** | Ensino Médio | Interpretar e comparar juros simples e compostos (gráficos ou planilhas), destacando o crescimento linear ou exponencial. | Juros simples e compostos | profez.com.br; revista.uepb.edu.br; funes.uniandes.edu.co |
| **EM13MAT304** | Ensino Médio | Resolver e elaborar problemas com funções exponenciais (ex.: Matemática Financeira, crescimento de micro-organismos). | Função exponencial | tedebc.ufma.br; educapes.capes.gov.br (PROFMAT); consed.org.br |
| **EM13MAT305** | Ensino Médio | Resolver e elaborar problemas com funções logarítmicas (ex.: abalos sísmicos, pH, radioatividade, finanças). | Logaritmo | tedebc.ufma.br; profez.com.br; consed.org.br |
| **EM13MAT306** | Ensino Médio | Resolver e elaborar problemas com fenômenos periódicos reais e comparar com gráficos das funções seno e cosseno. | Funções trigonométricas | www2.faccat.br (trigonometria); profez.com.br; educapes.capes.gov.br |
| **EM13MAT308** | Ensino Médio | Aplicar relações métricas, incluindo as leis do seno e do cosseno, ou congruência e semelhança, em problemas com triângulos. | Triângulo retângulo, Leis dos senos e cossenos | profez.com.br; www2.faccat.br; cempem.fe.unicamp.br (plano de aula) |
| **EM13MAT309** | Ensino Médio | Resolver e elaborar problemas com áreas totais e volumes de prismas, pirâmides e corpos redondos. | Geometria espacial | profez.com.br; s.educacaoadventista.org.br (calendários avaliativos) |
| **EM13MAT310** | Ensino Médio | Resolver e elaborar problemas de contagem (agrupamentos ordenáveis ou não) pelos princípios multiplicativo e aditivo. | Análise combinatória | profez.com.br; docs.google.com (guia escolar); educapes.capes.gov.br |
| **EM13MAT311** | Ensino Médio | Identificar e descrever o espaço amostral de eventos aleatórios para resolver problemas de probabilidade. | Probabilidade | profez.com.br; educapes.capes.gov.br (recurso educacional) |
| **EM13MAT316** | Ensino Médio | Resolver e elaborar problemas com medidas de tendência central (média, moda, mediana) e de dispersão (amplitude, variância, desvio padrão). | Desvio padrão | raw.githack.com/estmat-ufv (UFV); anec.org.br (BNCC EM comentada); profez.com.br |
| **EM13MAT503** | Ensino Médio | Investigar pontos de máximo ou de mínimo de funções quadráticas em contextos diversos. | Função quadrática | canaleducacao.tv (planos de aula); portal.educacao.go.gov.br |
| **EM13MAT507** | Ensino Médio | Identificar e associar progressões aritméticas (PA) a funções afins de domínio discreto. | Progressão aritmética (PA) | portal.educacao.go.gov.br (DC-GO); educapes.capes.gov.br; planos.professormg.com.br |
| **EM13MAT508** | Ensino Médio | Identificar e associar progressões geométricas (PG) a funções exponenciais de domínio discreto. | Progressão geométrica (PG) | educapes.capes.gov.br (UFMT); profez.com.br |

## Recusadas

| Código | Motivo |
|---|---|
| EM13MAT406 | Candidata para "Análise de gráficos" (construção de tabelas e gráficos de frequência). **Nenhuma fonte encontrada mostrou o texto**, então não foi usada. Em seu lugar, o assunto usa a EM13MAT102 (análise crítica de gráficos), que foi conferida. |

## Assuntos sem habilidade correspondente (8)

| Assunto | Por que não tem código |
|---|---|
| Expressões numéricas | A ordem das operações aparece dentro de várias habilidades de cálculo; não há uma habilidade da BNCC só para expressões numéricas. |
| Conjuntos numéricos | Os conjuntos numéricos não têm uma habilidade específica na BNCC do Ensino Médio; aparecem como base de outras habilidades. |
| Função modular | A função modular não é citada diretamente nas habilidades da BNCC do Ensino Médio; é cobrada em vestibulares. |
| Geometria analítica | A geometria analítica não aparece como habilidade específica na BNCC do Ensino Médio; é cobrada em vestibulares (Fuvest, Unicamp, Unesp). |
| Ciclo trigonométrico | O ciclo trigonométrico é base para a habilidade EM13MAT306 (funções seno e cosseno), mas não tem uma habilidade própria. |
| Identidades trigonométricas | As identidades trigonométricas não aparecem como habilidade específica na BNCC do Ensino Médio. |
| Matrizes | Matrizes não aparecem como conteúdo explícito na BNCC do Ensino Médio (relacionam-se a sistemas lineares, EM13MAT301); são cobradas em vestibulares. |
| Determinantes | Determinantes não aparecem como conteúdo explícito na BNCC do Ensino Médio (relacionam-se a sistemas lineares, EM13MAT301); são cobrados em vestibulares. |

## Observações em assuntos com código

| Assunto | Observação |
|---|---|
| Potenciação e radiciação | A BNCC trata potências em várias habilidades (6º ao 9º ano). Raízes quadradas exatas não têm uma habilidade só para elas. |

## Pendências para revisão humana

- **Redação oficial:** conferir os 38 códigos no PDF oficial do MEC. Isso confirma as correspondências e permite trocar o resumo pela redação literal.
- **Anos iniciais:** avaliar se o 1º e o 2º ano merecem habilidades próprias. Exemplos: EF01MA06 e EF02MA05 (fatos básicos de adição e subtração) e EF02MA20 (cédulas e moedas). Elas **não foram verificadas**.
- **Média nos anos finais:** avaliar a EF07MA35 (média) como complemento da EF08MA25. Também **não foi verificada**.

## Como acrescentar ou mudar um código

1. Confirme o código e o conteúdo no documento oficial da BNCC (ou em 2 fontes independentes, como acima).
2. Acrescente a habilidade em `BNCC_HABILIDADES` (`js/assuntos/curriculo.js`) com `ano`, `resumo` e `fontes`.
3. Use o código no `bncc` do assunto.
4. Rode `npm run test:unidade`.
