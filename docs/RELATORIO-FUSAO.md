# Matemática Show — Relatório da fusão (Completo + Arena V2)

**Resultado:** um único app, o **Matemática Show**. O Completo foi a base, e do Arena V2 veio só o que ele não tinha.
Existe um só XP, um só progresso, um só caderno de erros, uma só lista de conquistas e um só banco de questões.

## 1. Inventário antes de mexer

| | Completo (base) | Arena V2 |
|---|---|---|
| Código | `app.js` (7.315 linhas), `style.css` | `engine.js` + `app.js` + `extras.js` |
| Banco de questões | 18 assuntos × 3 dificuldades | **cópia idêntica** do banco do Completo (103 funções iguais, conferido uma a uma) |
| Dados | por conta: `mathstudy-progress-v2`, `-history-v1`, `-errors-v1`, `-game-v1`, `-settings-v1` e outros | tudo em uma chave: `msarena-v1` |
| XP / nível | XP por dificuldade + combo, níveis com títulos, janela de subir de nível | XP próprio, títulos próprios |
| Ofensiva | com marcos e moedas, zera se pular um dia | contador simples |
| Conquistas | 23 | 20 (várias iguais às do Completo) |
| Só no Completo | contas com senha, Trilha com vidas e moedas, Aprender, Exercícios digitados, Resolver, Calculadora, Caderno à mão, Laboratório de Geometria, Tabuada, Treino personalizado, Desafios, Quiz do Show, Relâmpago, Duelo frente a frente, Missões, Certificados, Relatório, Backup, tema claro, voz | |
| Só no Arena V2 | | Fases com estrelas, Desafio do Dia (igual para todos, compartilhável), Simulado com nota, caderno de erros com caixas, Plano de estudos, Teste de nivelamento geral, Flashcards, "Praticar parecidas" |

## 2. O que foi preservado do Completo (tudo)

Aprender, Exercícios, Resolver, Calculadora, Trilha, Progresso, Histórico, Revisão de erros, Desafios, Treino personalizado, Quiz do Show, Relâmpago, Duelo, Tabuada, Caderno, Laboratório de Geometria, Conquistas, Missões, Certificados, Relatório, Perfil, Configurações, contas com senha, backup, PWA, tema claro/escuro, voz e visual.
Nenhuma funcionalidade do Completo foi removida ou trocada.

## 3. O que veio do Arena V2

| Recurso | Onde está agora |
|---|---|
| **Arena** (nova aba no menu de baixo) | reúne as Fases, o Desafio do Dia, o Simulado e os jogos que já existiam (Relâmpago, Quiz, Duelo) |
| **Fases da Arena com estrelas** | cada assunto × Fácil/Médio/Difícil: 10 perguntas, 3 vidas, relógio; 5/7/9 acertos = 1/2/3 estrelas; a estrela libera a próxima dificuldade |
| **Desafio do Dia** | 7 perguntas iguais para todo mundo no dia (sorteio com semente), uma tentativa, resultado 🟩🟥 para compartilhar ou copiar, +30 XP |
| **Simulado** | nível, assuntos, 10/20/30 questões, tempo, dificuldade; nota de 0 a 10, desempenho por assunto e correção comentada |
| **Teste de nivelamento** | 10 perguntas pelo ano escolar, com botão "Não sei"; mostra o nível e por onde começar. Sugerido no Início para contas novas |
| **Plano de estudos** | data da prova + assuntos → agenda diária começando pelos mais fracos, com simulados no caminho |
| **Cartões de revisão** | no assunto (Aprender): vira o cartão, "Eu sabia" / "Ainda não sabia"; o que errar volta no fim |
| **Praticar parecidas** | no Resolver, depois da resposta: leva para exercícios do mesmo assunto |
| **Compartilhar resultado** | Desafio do Dia (botão Compartilhar do celular ou Copiar) |

## 4. O que foi combinado (as duas versões juntas em uma)

- **Caderno de erros inteligente.** A base é o caderno do Completo, com a lógica de caixas do Arena:
  1. registra a questão, o assunto e a dificuldade;
  2. a mesma questão errada de novo **não duplica**: conta quantas vezes foi errada;
  3. caixa 1 = revisar já → acertou → volta em 3 dias → acertou → volta em 7 dias → acertou → sai do caderno ("aprendida");
  4. errou na revisão → volta para amanhã;
  5. a revisão começa pelos erros vencidos, no máximo 15 por vez;
  6. nova tela "Caderno de erros": total, para hoje, aprendidas, erros por assunto e dificuldade;
  7. **recomendação**: assuntos com mais erros (com peso pela repetição e pela dificuldade) e acerto recente baixo → botão "Treino recomendado".
- **Conquistas.** Uma lista só: as 23 do Completo e mais 15 novas (Aquecendo, Cem questões, Primeira vitória na Arena, Fase perfeita, Constelação, Desafiante, Desafio da semana, Primeira prova, Nota 10, Aprendi com o erro, Mestre das frações, Ponto de partida, Estrategista, Detetive, Duelista). As parecidas foram unidas: ofensiva de 3/7/30 dias, meta batida, explorador e primeiro acerto ficaram com a versão do Completo. Para criar uma conquista nova basta uma linha com `check`.
- **XP.** Tudo passa pelo XP do Completo: resposta (por dificuldade), combo, missões, marcos de ofensiva, **estrelas novas na Arena (+10 por estrela)** e **Desafio do Dia (+30)**.
- **Progresso.** Todas as respostas (Arena, Simulado, Desafio, Nivelamento, Cartões, Revisão) entram pela mesma função (`recordAnswer` → `bumpProgress`): acertos, domínio, revisão espaçada, histórico, caderno de erros, XP, ofensiva e meta do dia.

## 5. O que não foi trazido (e por quê)

| Do Arena V2 | Motivo |
|---|---|
| `engine.js` | é a mesma coisa que já existe no Completo; copiar criaria duas versões do banco de questões |
| XP, níveis, títulos e ofensiva próprios | o sistema do Completo é mais completo (títulos, marcos, moedas); ter dois criaria XP duplicado |
| Meta diária com bônus | o Completo já tem meta diária e missões |
| Relâmpago do Arena | o Completo já tem o seu; os dois contam pontos de jeitos diferentes |
| Duelo do Arena | o do Completo é melhor (tela dividida, jogador de cima com a tela virada) |
| Tela de boas-vindas obrigatória | o Completo já tem cadastro e tour com o Pi; o nivelamento virou um convite no Início e no Perfil |
| Configurações, Backup, Relatório, gráfico de progresso | o Completo já tem versões mais completas (o backup do Completo já leva os dados novos da Arena) |
| Opção "digitar respostas" | os Exercícios do Completo já são digitados |
| Teclado de símbolos do Resolvedor e botão para desligar a vibração | não trazidos nesta fusão: são melhorias pequenas, que podem vir numa próxima etapa |

## 6. Dados do usuário (migração)

- As chaves do Completo **não mudaram**: quem já usa o app não perde nada. Os dados novos (Arena, plano, nivelamento, cartões) ficam dentro do jogo de cada conta.
- Erros salvos no formato antigo (sem caixa) funcionam normalmente e aparecem como "para hoje".
- **Progresso do antigo Arena** (`msarena-v1`): se existir no aparelho, o Início oferece "Trazer meu progresso" **uma vez**. Ele junta na conta atual:
  - o XP;
  - acertos por assunto;
  - estrelas, simulados e desafios;
  - o caderno de erros (sem duplicar);
  - nivelamento e plano;
  - o recorde de ofensiva;
  - as conquistas equivalentes.

  Os dados antigos **não são apagados**. O recorde do Relâmpago do Arena não é importado, porque os pontos são contados de outro jeito.

## 7. Bugs corrigidos

1. A revisão de erros não atualizava o domínio do assunto nem a data da revisão espaçada (do Completo).
2. Acertar uma vez tirava o erro do caderno, e a mesma questão errada várias vezes aparecia repetida (do Completo).
3. "Revisar meus erros" abria todos de uma vez (podiam ser até 150). Agora são até 15, começando pelos mais urgentes.
4. Os avisos da tela Início ("Revisar erros", "Revisão do dia"...) passavam 20 px da tela e cortavam a seta (do Completo).
5. Proteções novas: voltar no navegador não reabre uma prova já entregue nem dá XP de novo; o Desafio do Dia não dá para refazer no mesmo dia; sair no meio do desafio conta o que já foi feito.

## 8. Arquivos

- **Criados:**
  - `arena.js`: Arena, Fases, Desafio do Dia e Simulado;
  - `estudo.js`: nivelamento, plano, cartões, tela do caderno de erros, "praticar parecidas" e importação do Arena;
  - este relatório.
- **Modificados:**
  - `app.js`: progresso único, caderno inteligente, ganchos no motor do Quiz, conquistas, Início, Perfil e menu;
  - `style.css`: estilos novos, que usam as mesmas cores e componentes nos temas claro e escuro;
  - `index.html`: carrega os dois arquivos novos;
  - `sw.js`: versão `mat-show-v18`, arquivos novos no cache offline;
  - `manifest.json`: descrição.
- Continua tudo na mesma pasta, sem subpastas.

## 9. Testes (navegador automático, conta "Teste 1")

| Teste | Resultado |
|---|---|
| Navegação (Início, Trilha, Aprender, Exercícios, Resolver, Calculadora, Arena, Desafios, Progresso, Conquistas, Perfil, Configurações) | [OK] |
| Exercícios (fácil, médio, difícil, acerto, erro, próxima, fim, explicação) | [OK] |
| Gerador de questões (18 assuntos × 3 níveis, sem erro) | [OK] |
| Calculadora | [OK] |
| XP (um único perfil; fase da Arena: 0 → 200 XP) | [OK] |
| Níveis | [OK] |
| Streak / ofensiva (virada do dia, pulou um dia = zera) | [OK] |
| Conquistas (novas desbloqueiam; importação sem avisos repetidos) | [OK] |
| Desafios (Desafios do Completo + Desafio do Dia igual para todos, uma tentativa, sem XP repetido) | [OK] |
| Arena (3 estrelas, libera Médio, 3 erros = acabou, Simulado nota 7,0 com 7/10) | [OK] |
| Progresso (todas as respostas entram no mesmo progresso) | [OK] |
| Revisão de erros (não duplica, caixas 3 e 7 dias, sai depois de 3 acertos, recomendação) | [OK] |
| Persistência (recarregar, sair e entrar de novo: tudo igual) | [OK] |
| Responsividade (28 telas × 360/768/1280 px × tema claro e escuro: nada sai da tela) | [OK] |
| PWA (manifest válido, service worker v18, arquivos novos no cache, abre offline com os dados) | [OK] |
| Acessibilidade (todos os botões com nome, cartão vira com Enter) | [OK] |
| Testes antigos do Completo (46 verificações + 482 botões) | [OK], sem nenhum problema novo |

**Observação sobre o teste de botões:** ele aponta 10 itens (por exemplo, "botão 15 não fez nada" em Configurações). Esses mesmos 10 aparecem no Completo original: são limitações do próprio teste (tocar num valor que já está escolhido, ou abrir o seletor de arquivo). Outro teste confirma que essas opções salvam normalmente.

**Não testado:** a instalação pelo botão "Instalar" de um celular de verdade, e o botão "Compartilhar", que precisa de celular e não existe no navegador automático. O botão "Copiar" foi testado.

## 7. Conteúdos do Ensino Médio (23 assuntos novos)

Os conteúdos da lista do ENEM/vestibulares entraram como **assuntos normais**, iguais aos outros: cada um tem explicação, exemplos resolvidos, exercícios Fácil/Médio/Difícil com passo a passo, dica, cartões de revisão, e aparece na Trilha, na Arena, no Simulado, no Treino personalizado e no Caderno de erros.

Em **Aprender** e **Exercícios** a lista agora é separada em *Ensino Fundamental* e *Ensino Médio*, e o Ensino Médio é dividido nas 7 áreas:

| Área | Assuntos (novos em negrito) |
|---|---|
| Álgebra e Funções | **Conjuntos numéricos**, Função do 1º grau, **Função quadrática**, **Função modular**, **Função exponencial**, **Logaritmo**, **Funções trigonométricas** |
| Progressões e Sequências | **Progressão aritmética (PA)**, **Progressão geométrica (PG)** |
| Geometria | Áreas e perímetros, **Geometria espacial**, **Geometria analítica** |
| Trigonometria | **Triângulo retângulo**, **Ciclo trigonométrico**, **Identidades trigonométricas**, **Leis dos senos e cossenos** |
| Estatística e Probabilidade | **Análise combinatória**, **Probabilidade**, Média, moda e mediana, **Desvio padrão**, **Análise de gráficos** |
| Matemática Financeira | Porcentagem, **Juros simples e compostos**, **Descontos e aumentos**, **Taxas de inflação** |
| Matrizes e Sistemas | **Matrizes**, **Determinantes**, Sistemas de equações |

- O Simulado ganhou o grupo **Ensino Médio**.
- Na Trilha, os assuntos novos vêm depois dos 18 que já existiam (a ordem antiga não mudou, então ninguém perde progresso).
- O service worker passou para `mat-show-v22`, pra todo mundo receber a versão nova.

## 8. Desafio do Dia melhorado

- **Tela de abertura** antes de começar: número do desafio, data, regras, assuntos de hoje (com a dificuldade de cada um) e a semana em bolinhas.
- **Um desafio por nível**: *Fundamental* ou *Ensino Médio*, cada um igual para todo mundo daquele nível no dia (o app sugere o nível pelas Configurações/nivelamento e lembra a última escolha).
- **Tempo por dificuldade**: 30 s (fácil), 45 s (médio) e 60 s (difícil), no lugar de 20 s para todas.
- **Sequência de dias 🔥** e bônus de XP: +30 pelo desafio, +20 se acertar as 7 e +5 por dia seguido (até +25).
- **Correção comentada**: cada pergunta com a sua resposta, a certa, a explicação e um botão para praticar o assunto errado. Dá para abrir também nos dias anteriores.
- **Tela de resultado** com contagem regressiva para o próximo desafio, estatísticas (sequência, melhor sequência, jogados, perfeitos, média) e os últimos 7 dias.
- O texto para compartilhar mostra o nível e a sequência.

## 9. Organização dos arquivos

O antigo `app.js` (8.300 linhas) foi dividido em arquivos por assunto dentro de `js/`, sem mudar nenhuma linha de código (juntando as partes na ordem do `index.html` dá exatamente o arquivo antigo). O CSS foi para `css/`, as imagens para `img/` e este relatório para `docs/`. O `LEIA-ME.md` explica o que tem em cada arquivo e como acrescentar um assunto.

## 10. Telas de entrada e Início mais enxutas

- **Entrada / criar conta:** o cartão fica centralizado e não tem mais a rolagem para um espaço vazio embaixo (o app reservava lugar para o menu inferior também nessa tela). A "Dica da senha" virou um link opcional, deixando o formulário mais curto.
- **Início:** a meta de hoje e as missões viraram um cartão só. As missões ficam recolhidas num resumo ("0/4") e abrem sozinhas quando tem prêmio para pegar. Os 15 atalhos viraram 6 (Treino personalizado, Desafios, Tabuada, Resolver questão, Calculadora e Caderno), mais dois atalhos para a **Arena** (simulado, duelo e fases) e o **Perfil** (conquistas, certificados, plano e relatório). Nada saiu do app: os outros itens já ficam na Arena, no Perfil, no Progresso ou no Aprender.

## 11. Sons mais agradáveis

- Novo "motor" de som (`playTones` em `js/jogo/xp-e-conquistas.js`): volume geral, limitador (não estoura quando vários sons tocam juntos) e filtro que tira o chiado agudo. Cada nota é um timbre suave, tipo sininho; os sons que usavam onda quadrada ou dente de serra (subir de nível, contagem do Relâmpago, erro no Caderno) deixaram de soar como alarme.
- Sem atropelo: uma fanfarra cala os bipes curtos logo em seguida, o mesmo som repetido é ignorado e sons diferentes tocam um depois do outro.
- Erro com duas notas descendo, baixinho, sem susto.
- Áudio "acordado" no primeiro toque (iPhone/Android começam com o áudio pausado) e nenhum som com o app em segundo plano.
- Configurações → Som e vibração: novo **Volume** (Baixo, Médio, Alto), com prévia ao tocar.

## 12. Tudo em ordem, cada coisa no seu lugar

- **Assuntos:** uma lista única (`SUBJECT_GROUPS` em `catalogo.js`) com os grupos 1º ao 5º ano, 6º e 7º, 8º e 9º e as 7 áreas do Ensino Médio. Cada assunto aparece em um grupo só. Aprender, Exercícios, Arena, Treino personalizado, Simulado e Trilha seguem a mesma ordem e mostram os mesmos títulos. O progresso da trilha é guardado pelo nome do assunto, então ninguém perde nada. O sorteio do Desafio do Dia usa listas fixas, então as perguntas e a correção dos dias já jogados não mudam.
- **Menus:** cada função mora num lugar só (tabela no `LEIA-ME.md`). Treinos foram para a aba Exercícios, os jogos ficam na Arena, conquistas, certificados, relatório e histórico na aba Progresso, e nivelamento, plano e configurações no Perfil. O botão voltar de cada tela leva para a sua aba, e o menu de baixo acende a aba certa.
- **Configurações:** Conta → Estudo → Som e vibração → Aparência → Leitura e acessibilidade → Dados.
- **Arquivos:** cada tela no seu arquivo (`progresso.js`, `perfil.js`, `configuracoes.js`, `relatorio.js`, `certificados.js`, `tabuada.js`, `duelo.js`) e todos os sons em `base/sons.js`. O código foi só movido, sem mudanças.

## 13. Logo nova

A logo do "M" com o capelo de formatura substitui a antiga em todos os lugares: topo do app, tela de entrada, certificados, ícone instalado no celular (192, 512 e "maskable" do Android), ícone do iPhone (180) e favicon (48). O mascote Pi também usa a logo nova como emblema na cartola (no lugar do "π"). Na logo do topo o fundo preto virou transparente, para ficar bonita nos temas escuro e claro; nos ícones o fundo preto foi mantido.

## 14. Prévia do certificado

Na tela de Certificados (aba Progresso), o topo mostra uma **prévia** de como vai ficar o certificado do próximo assunto, já com o nome da pessoa, marcada com a faixa "PRÉVIA". Os assuntos ainda bloqueados mostram quantas etapas da Trilha já foram feitas e, ao tocar, abrem a prévia daquele assunto com um botão "Ir para a Trilha". Só o certificado de verdade tem o botão de imprimir; a prévia não sai na impressão. O certificado mostra só o essencial: logo, nome, assunto e data (sem o "Pi, o apresentador" e sem o nível).

## 15. Certificado novo, em duas versões

O certificado agora é em paisagem, com fundo escuro e linhas onduladas, o nome em letras grandes e o número do episódio enorme em degradê do lado direito. Há duas versões de cor: **Versão 1 · Amarelo e verde** e **Versão 2 · Roxo**. Na tela do certificado dá pra trocar entre elas com os botões acima dele, e a escolha fica salva na conta. Sem escolha, o Ensino Fundamental usa a versão 1 e o Ensino Médio a versão 2. Na impressão o certificado sai sozinho numa folha A4 deitada. Nos episódios com 2 algarismos (10 a 41) o número fica um pouco menor, pra não encostar no nome.

## 16. Sem pergunta ao sair

A pergunta "Quer sair do app?" (botão voltar na tela Início) foi retirada. O "voltar" volta tela por tela até o Início e, no Início, sai do app/site direto.

## 17. Certificado mais bonito (verde e roxo)

As duas versões ganharam cores próprias: **Verde** (esmeralda com dourado) e **Roxo** (violeta com lilás). Também ganharam moldura dupla com cantos em losango, brilho atrás do número do episódio, "concedido a" acima do nome, um traço colorido sob o nome, um **selo** redondo com a logo e a frase "Episódio concluído", e uma **assinatura** do Matemática Show. Os textos de baixo ficaram maiores, e o número fica sempre dentro da moldura. No fundo há alguns símbolos de matemática bem clarinhos (π, √, ∑, ÷, ∞, x², Δ, %, =), só nos espaços vazios.

## 18. Login mais bonito e mais fácil

A tela de entrada ganhou a marca do app no topo ("Matemática Show · Seu professor de matemática digital") e o mascote menor logo abaixo. As contas aparecem numa lista, cada uma com uma cor própria, o nível, a ofensiva e uma setinha. Ao escolher a conta, ela aparece num cartão com o botão "Trocar". O campo de senha agora diz "Digite sua senha" (antes parecia já preenchido) e avisa quando o Caps Lock está ligado. No cadastro, o "Repita a senha" mostra na hora se as senhas são iguais.

## 19. Caderno mais bonito

- **Lista de páginas:** as miniaturas agora são nítidas e mostram o topo da página, com o assunto numa etiqueta. Cada cartão diz quando a página foi editada ("Hoje, 14:30", "Ontem…") e qual é o papel. Os filtros por assunto ficam numa faixa que rola para o lado. As páginas antigas ganham a miniatura nova sozinhas.
- **Caderno vazio:** aparece uma ilustração e atalhos para começar direto num papel (Quadriculado, Pautado, Pontilhado ou Plano cartesiano).
- **Escolha do papel:** as prévias agora mostram as linhas, os pontos e o plano cartesiano (antes pareciam em branco).
- **Página:** fica como uma folha sobre a mesa, com margem e sombra. No computador a folha não passa de uns 880px de largura. O topo mostra "Salvando…" e depois "✓ Salvo".
- **Ferramentas:** os ícones agora são desenhados, todos no mesmo estilo, e a ferramenta escolhida fica destacada em degradê. Os botões de espessura mostram a cor atual. Isso vale também para o Rascunho das questões.

## 20. Calculadora nova

- **Conta inteira no visor**, com **parênteses** e a **ordem certa das operações**: primeiro potência, depois × e ÷, depois + e −. Antes, 2 + 3 × 4 dava 20; agora dá 14.
- O **resultado aparece enquanto você digita** ("= 12.500"). O "=" confirma, e a conta sobe para a linha de cima.
- **Resultados precisos:** até 12 algarismos, sem erro de 0,1 + 0,2. Antes só mostrava 2 casas (1 ÷ 3 = 0,33).
- Números grandes com separador de milhar (1.250).
- **Mensagens claras** quando a conta não dá: "Não dá pra dividir por zero", "Raiz de número negativo não existe nos reais", "Conta incompleta"…
- **Histórico** das últimas 30 contas, salvo na conta de cada pessoa. Tocar numa conta usa o resultado.
- Tocar no resultado copia.
- **Científica** em 3 linhas: DEG/RAD, sen, cos, tan, π, x², xʸ, √, ln, log, 1/x, n! (fatorial), parênteses e e.
- **Teclado do computador** funciona: números, + − * /, ^, parênteses, %, Enter, Backspace e Esc.
- Visual novo: teclas com relevo e cores por tipo, "=" em degradê e resultado colorido.

## 21. Resolver questão melhor e mais bonito

- **Resolve mais tipos de questão:**
  - equações com parênteses e frações ("3(x + 2) = 18", "x/2 + 3 = 7", "x(x − 3) = 0");
  - "2/3 de 120";
  - MMC e MDC pela fatoração em primos ("mmc de 12 e 18", "mdc 24 36");
  - média ("média de 7, 8 e 9");
  - fatorial ("5!", que antes dava 5 por engano);
  - divisão por zero, agora explicada em vez de "não entendi".
- **Resposta em destaque logo no topo:** cartão colorido com o tipo da questão ("Equação do 1º grau", "MMC e MDC"…) e a resposta grande.
- **Passo a passo em linha do tempo:** passos numerados e ligados, com o desenho da resolução (conta armada, cadeia de reduções, Bhaskara…) e uma **Dica** separada. Antes, "Como resolver" e "Explicação simples" repetiam a mesma ideia.
- **Teclas de símbolos** embaixo do campo (x, ², √, parênteses, ×, ÷, =, %, /), para não precisar procurar no teclado do celular. Enter resolve, Shift+Enter pula linha.
- **Recentes:** as últimas 6 questões ficam salvas na conta.
- **Exemplos:** 15 exemplos por tipo numa faixa que rola para o lado; tocar já resolve.
- **Quando não entende:** mostra os tipos que sabe resolver, e tocar num tipo resolve um exemplo dele.
- O "Praticar parecidas" agora usa o assunto certo também nos tipos novos (MMC → MMC e MDC, média → Estatística, fatorial → Combinatória).

## 22. Tabuada nova

A Tabuada agora tem três partes (antes era só a lista de 1 a 10):

- **📖 Estudar:**
  - Cada número de 1 a 10 tem uma cor.
  - Cada tabuada tem uma **dica** para lembrar (vezes 4 é o dobro do dobro, vezes 9 é vezes 10 menos o número…).
  - Tocar numa conta mostra ela em **bolinhas** ("7 grupos de 3").
  - Dá para **esconder os resultados** e ir revelando, para se testar.
  - As contas que a pessoa já domina ganham ✓, e as que vale treinar ganham !.
- **🔢 Quadro:**
  - A tábua de Pitágoras inteira (1 a 10). Tocar numa casa destaca a linha e a coluna e mostra a conta e quantas vezes você acertou.
  - Verde = já domina, vermelho = vale treinar, contorno dourado = quadrados.
  - Barra "Você domina X de 55 contas" (3 × 7 e 7 × 3 contam como uma só).
- **⚡ Treinar:**
  - Escolha uma ou várias tabuadas (atalhos "Todas", "1, 2, 5 e 10" e "6, 7, 8 e 9").
  - São 10 perguntas com **teclado numérico grande**, que também funciona com o teclado do computador, e cronômetro.
  - As contas que você erra aparecem mais vezes.
  - No fim aparecem estrelas, tempo, XP (2 por acerto), **recorde** (só com 10/10) e os erros para revisar, com o botão **Treinar os erros**.
- O que a pessoa acerta e erra fica salvo na conta dela.

## 23. Duelo novo

- **Tela inicial:**
  - Cartão com os dois jogadores frente a frente: inicial colorida (azul embaixo, roxo em cima), nome e "VS". O botão ⇅ troca os dois de lugar.
  - **Placar histórico** entre os dois ("Ana 3 × 2 João"), guardado mesmo se trocarem de lado.
  - **Tipo de conta:** Misturadas, Tabuada, + e −, × e ÷.
  - **Nível** e **número de rodadas** (5, 10 ou 15).
  - As regras aparecem em 4 cartõezinhos.
  - O app lembra as escolhas para o próximo duelo.
- **Partida:**
  - Começa com uma contagem **3, 2, 1**.
  - Cada metade tem a sua cor e uma barrinha com os pontos.
  - No meio ficam o placar dos dois, a rodada e a **barra de tempo** (10, 9 ou 8 segundos, conforme o nível). Se o tempo acaba, ninguém pontua e aparece a resposta.
  - Quem acerta primeiro ganha um "+1" grande e a metade fica verde. O outro lado vê de quem foi o ponto e a resposta certa.
  - 3 acertos seguidos mostram "🔥 3 seguidas!".
  - **Quem erra fica travado de verdade até a próxima conta.** Antes destravava depois de 1 segundo. Se os dois erram, a resposta aparece e passa para a próxima.
  - A mesma conta não se repete na partida.
  - O toque responde na hora (os dois podem tocar ao mesmo tempo).
  - Para sair é preciso tocar duas vezes no ✕ ("Sair?"), para ninguém sair sem querer.
- **Final:** troféu, aperto de mão ou "Quase!", placar, quantas certas e erradas cada um teve, a resposta mais rápida, e os botões **Revanche** e **Sair**.

## 24. Relâmpago novo

- **Tela inicial:**
  - Cartão laranja com o recorde.
  - **Tipo de conta:** Misturadas, Tabuada, + e −, × e ÷. Cada tipo tem o **seu próprio recorde**; o recorde antigo virou o de Misturadas.
  - Regras em cartõezinhos.
  - O app lembra o tipo escolhido.
- **Partida:**
  - O tempo fica num **anel** que vai esvaziando e fica vermelho nos últimos 10 segundos. Aparece "+1s" ou "−3s" a cada resposta.
  - **Combo:** com 5 acertos seguidos aparece "🔥 COMBO ×2", e cada acerto passa a valer 2 pontos.
  - **Quando erra, mostra a resposta certa** (contorno verde e "Era 24") antes da próxima conta. Antes passava direto, sem mostrar.
  - A mesma conta não aparece duas vezes seguidas.
  - No computador dá para responder com as teclas 1, 2, 3 e 4.
  - O toque responde na hora.
- **Final:**
  - Pontos grandes e recorde do tipo jogado.
  - XP, acertos, **precisão**, **maior sequência** e **contas por minuto**.
  - Lista das contas erradas para revisar, com o que a pessoa marcou.
  - Botões **Jogar de novo** e **Trocar tipo**.

## 25. Quiz do Show novo

- **Tela inicial:**
  - Cartão com o **seu recorde** (o maior de todos).
  - **Assuntos:** Todos, Fundamental ou Ensino Médio. O app lembra a escolha.
  - Dificuldade em cartões com descrição, recorde e botão ▶ na cor do nível. Cada combinação (assuntos + dificuldade) tem o seu recorde; os recordes antigos continuam valendo em "Todos".
  - "Como funciona" em 4 cartõezinhos.
- **Ajudas do Show** (uma vez cada por partida):
  - **50:50** risca duas alternativas erradas.
  - **+10s** dá mais 10 segundos.
  - **Pular** troca a pergunta por outra, sem contar como pergunta.
  - As ajudas não aparecem no Desafio do Dia nem nas fases da Arena, que continuam iguais.
- As perguntas não repetem o mesmo assunto duas vezes seguidas.
- **Final:**
  - Recorde do nível com os assuntos escolhidos e **maior sequência** de acertos.
  - **Revisão de todas as respostas**: assunto, pergunta, resposta certa, o que a pessoa marcou (ou "acabou o tempo"), o tempo que levou e os pontos de cada uma.

## 26. Simulado novo

- **Montar a prova:**
  - Cartão azul com quantos simulados você fez, a melhor nota e a média recente.
  - **Modelos prontos:** Rápido (10 questões, 10 min), Prova (20, 30 min) e Maratona (30, 45 min).
  - Os 41 assuntos ficam escondidos atrás de um botão ("41 de 41 assuntos escolhidos"). Abertos, aparecem **agrupados por série/área**, com "Todos / Tirar todos" em cada grupo.
  - Resumo da prova antes de começar: questões, tempo (e segundos por questão), assuntos e dificuldade.
  - **Gráfico de barras** com as notas dos últimos 10 simulados.
- **Durante a prova:**
  - "X de N respondidas" com barra de progresso e uma **barra de tempo**.
  - Avisos quando faltam 5 minutos e 1 minuto.
  - Cada questão mostra número, assunto e dificuldade colorida.
  - **"Apagar resposta"** para deixar em branco de novo.
  - O botão de entregar mostra quantas estão em branco e fica verde quando tudo foi respondido.
  - A confirmação lista **quais** questões estão em branco e quais foram marcadas para revisar.
  - **Atalhos no computador:** A–D (ou 1–4) respondem, ← → trocam de questão e R marca para revisar.
  - O relógio aparece na hora (antes levava 1 segundo para surgir a cada troca de questão).
- **Resultado:**
  - Nota no anel com a cor do resultado e **comparação com o último simulado** (▲ +1,5).
  - Certas, erradas, em branco e tempo.
  - **"Refazer as erradas":** uma revisão sem tempo só com as questões que você errou. Ela não entra no histórico de notas.
  - Botão **Treinar** nos assuntos com menos de 80% de acerto.
  - Correção com filtro **Todas / Erradas / Certas**. Cada questão mostra as 4 alternativas, com a correta em verde e a sua em vermelho quando errou.

## 27. Novidades (notificação de atualizações)

- **Janela "Novidades":** ao abrir o Início depois de uma atualização, aparece uma janela com tudo o que mudou. Cada item tem um botão **Ver ›** que leva direto para a tela nova. Aparece **uma vez por conta**: depois de "Entendi!" não volta.
- **Sininho 🔔** no topo do Início. Fica com uma bolinha vermelha piscando enquanto houver novidade não vista e abre a tela **Novidades**, com todas as atualizações, das mais novas para as mais antigas, e a etiqueta "NOVO".
- **Perfil:** novo item "🔔 Novidades", que diz "✨ Tem novidade pra você!" quando houver.
- **Contas novas** não recebem a lista antiga logo de cara.
- **Nunca junto com outro aviso:** a janela não aparece por cima do tour do primeiro acesso nem junto com o lembrete de backup.
- **Versão nova com o app aberto:** quando o app recebe uma versão nova enquanto está aberto, aparece a barra "🎉 Saiu uma versão nova do app! **Atualizar**".
- Para anunciar algo no futuro, basta acrescentar uma entrada no topo de `NEWS` em `js/telas/novidades.js`.

## 28. Trilha nova

- **Resumo no topo:** anel com a % da trilha concluída, quantos episódios já foram feitos, em qual você está agora e o botão **▶ Continuar**.
- **Cartões dos episódios:**
  - Número do episódio (ou ✓), símbolo e nome do assunto.
  - Barrinhas com as fases feitas ("2/5 fases") e o ano escolar.
  - O episódio atual ganha contorno dourado e "VOCÊ ESTÁ AQUI".
  - Os bloqueados ficam apagados, com o botão "Já sei esse assunto · Pular pra cá".
- **Episódios concluídos ficam recolhidos** (só o cartão), para a trilha não ficar enorme. Tocar em "Rever fases" abre de novo.
- **Fases:**
  - Cada fase mostra o nome ao lado (Fase 1 · Fácil, Prêmio surpresa, Grande final).
  - A linha entre elas fica **colorida até onde você chegou**.
  - A fase atual fica maior, com o balão "▶ JOGAR". A Grande final é maior que as outras.
- **Botão "📍 Fase atual"** aparece quando a fase atual sai da tela.
- **Janela da fase:**
  - Barrinhas com a posição da fase no episódio.
  - Cartões com o número de perguntas, a dificuldade, o XP e as moedas (ou o certificado, na Grande final).
  - Link "Rever a explicação".
- **A barra do topo** (ofensiva, moedas e vidas) agora fica presa ao rolar. Antes ela sumia, por causa de um ajuste da página que impedia barras fixas.
- A Trilha também entrou nas **Novidades**.
- **Correção:** o balão "▶ JOGAR" (e o "🎁 ABRIR" do prêmio) não respondia ao toque; só o hexágono funcionava. Agora o balão e o nome da fase abrem a fase. O "▶ Continuar" do topo abre direto a fase atual.

## 29. Desafios novos

- **Tela inicial:**
  - Cartão com quantos desafios você fez e o seu melhor acerto.
  - **Assuntos:** Todos, Fundamental ou Ensino Médio.
  - **Quantas questões:** 5, 10 ou 15.
  - Dificuldade em cartões com o **recorde** de cada combinação.
  - Regras em cartõezinhos.
  - O app lembra as escolhas.
- **Durante:** número da questão, assunto e dificuldade coloridos. A mesma matéria não se repete em seguida.
- **Final:**
  - Estrelas e XP, como antes.
  - **Novo recorde**, certas, erradas, maior sequência e tempo.
  - **Revisão de cada questão**, com a resposta certa e o que a pessoa digitou, e o botão **Treinar** nas que errou.
  - Botões **Novo desafio** e **Mudar dificuldade**.
- Os Desafios entraram nas **Novidades**.

## 30. Treino personalizado novo

- **Cartão verde no topo:** quantos assuntos você já praticou, o acerto geral e quantos pontos fracos tem.
- **Atalhos:**
  - **Pontos fracos**: assuntos abaixo de 70%, já com prioridade nos fracos.
  - **Meu nível**: a série escolhida nas Configurações.
  - **Surpresa**: 5 assuntos sorteados, com dificuldade misturada.
  - **Tudo**: todos os assuntos.
- **Assuntos:**
  - Ficam atrás de um botão ("41 de 41 assuntos escolhidos") e mostram uma prévia dos escolhidos.
  - Abertos, aparecem agrupados por série/área, com "Todos / Tirar todos" e o % de acerto de cada um.
- **Dificuldade em cartões,** com descrição. A Adaptativa é marcada como **Recomendado**.
- **Quantidade** em botões e "Priorizar meus pontos fracos" em chave liga/desliga.
- **Resumo** antes de começar: assuntos, questões, dificuldade e duração.
- **Durante:** número da questão, assunto e dificuldade coloridos (com "⬆ subiu / ⬇ mais leve" na Adaptativa).
- **Final:** desempenho por assunto, como antes, mais a **revisão de cada resposta**, com a certa e o que foi digitado.
- O Treino entrou nas **Novidades**.

## 31. Fale com a gente (feedback)

- **No Perfil:** item "💬 Fale com a gente". Abre uma janela com uma **nota de 1 a 5 ⭐** e o botão **"Escrever uma mensagem"**, que abre o Formulário Google do Matemática Show. As respostas caem na planilha ligada ao formulário.
- **Pedido automático:** aparece **uma única vez** por conta, depois de 50 questões respondidas. Nunca aparece junto com as Novidades nem com o lembrete de backup.
- A frase muda conforme a nota (alta: "Que bom!"; baixa: "Conta o que podemos melhorar").
- Para trocar o formulário, basta mudar `FEEDBACK_FORM_URL` em `js/telas/feedback.js`. Se o link ficar vazio, nada aparece.
- Entrou nas **Novidades**.

## 32. Impressão do certificado em uma folha só

- No celular (Android) a impressão vinha em **folha em pé**: o certificado ficava pequeno no topo e um pedaço ia para uma 2ª página.
- Agora o botão "Imprimir / PDF" imprime **só o certificado, numa folha só**:
  - Se a impressora aceitar folha deitada, o certificado ocupa a folha inteira deitado.
  - Se a folha vier em pé, como no Android, o certificado é **girado** para ocupar a folha inteira, sem 2ª página.

## 33. Relatório semanal novo

- **Trocar de semana:** botões ‹ › para ver as semanas anteriores (enquanto houver histórico salvo).
- **Cartão do topo** colorido, com nome, período, nível e o **selo da semana**: Semana campeã, Semana constante, Mira certeira, Semana de treino, Começando bem ou Semana parada.
- **Números da semana:**
  - Bolinhas dos 7 dias mostrando quais foram estudados.
  - Questões.
  - **Anel de acerto** colorido (verde, amarelo ou vermelho).
  - Ofensiva.
- **Questões por dia:** barras com **certas (verde) e erradas (vermelho)**, o dia de hoje marcado, o ⭐ melhor dia e a legenda.
- **Por assunto:** botão **Treinar** nos assuntos abaixo de 80%.
- **Conquistas da semana:** as medalhas ganhas no período.
- **Destaques** em dois cartões (pontos fortes e precisa de atenção) e o botão **"Treinar os pontos de atenção"**, que monta um Treino personalizado com eles.
- A **impressão / PDF** continua limpa, em fundo branco e sem os botões.
- O Relatório entrou nas **Novidades**.

## 34. Caderno de erros novo

- **Cartão do topo:** anel com o % já aprendido e quantas questões há para revisar hoje. Fica rosa quando tem revisão e verde quando está tudo em dia.
- **Etapas até aprender** (a revisão espaçada, agora visível): Etapa 1 (revisar já), Etapa 2 (volta em 3 dias), Etapa 3 (volta em 7 dias) e Aprendida, com quantas questões há em cada uma.
- Botão grande **"Revisar N agora"** e cartão de **Treino recomendado**.
- **Suas questões:**
  - Lista com filtro por assunto.
  - Cada questão mostra o assunto, a dificuldade, quando volta ("Revisar hoje", "Volta em 3 dias"), a etapa e quantas vezes foi errada.
  - **"Ver resposta"** mostra a resposta, e a lixeira **tira a questão do caderno**, com confirmação.
  - Filtrando por assunto, aparecem "Ver explicação" e "Revisar" daquele assunto.
- **Revisão:**
  - Cabeçalho com o número, o assunto, a dificuldade e a etapa da questão.
  - No fim aparece quantas foram **aprendidas**, quantas **subiram de etapa** e quantas **voltam amanhã**, com o botão **Voltar ao caderno**.

## 35. Arena nova

- **Topo:**
  - Anel com as estrelas conquistadas.
  - A **patente** de quem joga: Estreante, Desafiante, Competidor, Craque, Campeão ou Lenda da Arena, conforme a fração de estrelas.
  - Quantas estrelas faltam para a próxima patente, com a fileira de patentes.
  - Estrelas, assuntos completos (9⭐) e dias seguidos de desafio.
- **Desafio do Dia em cartão:**
  - Calendário com a data, as bolinhas dos últimos 7 dias e o relógio ("Termina em" / "Próximo desafio em").
  - Botão **Jogar agora** ou **Ver resultado**, que fica verde quando o desafio do dia já foi feito.
- **Próxima fase:** atalho para a próxima fase a jogar. Continua um assunto começado ou, se tudo já foi jogado, sugere a fase com menos estrelas.
- **Modos de jogo em cartões:** cada um mostra o recorde ou a situação (acertos do Relâmpago, pontos do Quiz, última nota do Simulado, duelos jogados).
- **Fases da Arena:**
  - Regras em etiquetas e filtros: Todas, Fundamental, Médio, Em andamento e Completas. O filtro começa no nível da pessoa.
  - Cada assunto tem uma barra de progresso.
  - As dificuldades têm cor e a próxima fase está marcada com **JOGAR**.
- **Correção:** as estrelas conquistadas apareciam apagadas no tema escuro.
- A Arena entrou nas **Novidades**.

## 36. Progresso e Histórico novos

- **Topo do Progresso:**
  - Anel com o **nível**, o título do nível e a barra de XP até o próximo nível.
  - Questões resolvidas, % de acerto, ofensiva e conquistas.
- **Certas × erradas** numa barra só.
- **Atividade dos últimos 14 dias:** questões de hoje, dos últimos 7 dias e dias com estudo, com barras por dia (certas em verde, erradas em vermelho) e o dia de hoje marcado.
- **Domínio dos assuntos:** quantos assuntos estão em cada nível (Dominado, Proficiente, Praticando, Aprendendo, Não iniciado), numa barra colorida com legenda.
- **Seus registros:** Relatório semanal, Histórico, Conquistas (com barra) e Certificados em cartões, cada um com uma informação.
- **Assuntos praticados:**
  - Ordenação: Recentes, Melhores, Precisam de atenção e Mais praticados.
  - Cada assunto mostra o % com barra colorida, o nível de domínio, as certas e quando foi praticado. Tocar abre o assunto.
  - Sem prática ainda, aparece um aviso com o botão "Ir para Exercícios".
- **Histórico:**
  - Resumo em cartões e filtro Todas / Certas / Erradas.
  - As respostas ficam separadas por dia (Hoje, Ontem, dia da semana), e a dificuldade aparece colorida.
- Entrou nas **Novidades**.

## 37. Conquistas novas

- **Sala de troféus (topo):**
  - Anel com quantas medalhas já foram conquistadas e o % da coleção.
  - Nível, XP, maior combo, ofensiva, maior ofensiva e recorde do Relâmpago.
- **Quase lá:** mostra a conquista bloqueada mais perto de sair, com barra e números (ex.: 8/10).
- **Conquistas recentes:** as 3 últimas, com a data.
- **Medalhas:**
  - Separadas por categoria (Acertos e combos, Constância, Arena e jogos, Estudo), com o total de cada uma.
  - Filtro Todas / Conquistadas / Faltam.
  - As conquistadas aparecem como medalha dourada com a data.
  - As bloqueadas têm cadeado e, quando dá pra medir, barra de progresso (ex.: 138/200 acertos). O progresso é calculado só pra mostrar; quem desbloqueia continua sendo o jogo.
- **Títulos em escada:** os títulos já conquistados, o atual em destaque e quantos níveis faltam para os próximos.
- Entrou nas **Novidades**.

## 38. Impressão do certificado sem cortes

- **Problema:** a impressão decidia se girava o certificado olhando a posição da **tela** (celular em pé), e não a da folha. Com o celular em pé e a folha deitada, o certificado saía girado e pequeno, ou cortado e passando para uma 2ª folha. O tamanho também dependia da tela (`vw`/`vh`).
- **Correção:**
  - O certificado agora é impresso em medidas de papel: 250 mm de largura, centralizado e sem girar. Assim cabe com folga numa folha A4 ou Carta deitada, mesmo com as margens da impressora.
  - Se a folha vier em pé, ele só fica menor, nunca cortado.
  - As cores de fundo são mantidas na impressão.
- Testado gerando o PDF em A4 (pelo próprio app, deitada, em pé e com margens de 10–12 mm) e em Carta, com tela de celular e de computador: sempre 1 página, com o certificado inteiro.

## 39. Certificados novos

- **Sua coleção (topo):** anel com quantos certificados foram conquistados e uma barra por nível (Fundamental e Médio).
- **Quase lá:** o assunto começado mais perto do certificado (ou o primeiro, se nada foi começado), com barra de etapas e os botões **Ver prévia** e **Ir para a Trilha**.
- **Meus certificados:** galeria com a miniatura de cada certificado conquistado, o nome e a data. Sem nenhum ainda, aparece a prévia "Veja como vai ficar".
- **Todos os assuntos:** filtro Todos / Em andamento / Conquistados / Não começados. Cada assunto mostra a barra de etapas da Trilha ou "Conquistado em dd/mm/aaaa".
- **Data de conquista:** o certificado passa a guardar a data em que foi liberado (`g.certDates`), em vez de mostrar sempre a data de hoje. Os certificados que já existiam ficam com a data em que forem vistos de novo.
- **Tela do certificado:**
  - Faixa "Parabéns! Certificado conquistado" com a data, ou, na prévia, a barra de etapas que faltam.
  - Versões em cartões.
  - Botões **Imprimir ou salvar em PDF** e **Compartilhar a conquista** (no computador, copia o texto), com uma dica de impressão.
  - Botões pra passar ao certificado anterior ou ao próximo.
- Entrou nas **Novidades**.
