# Matemática Show — Redesign educacional (relatório curto)

Objetivo: o app parecer primeiro uma **plataforma para aprender matemática** e só depois um jogo.
A lógica matemática, o banco de questões e o armazenamento não foram reescritos.

## 1. O que mudou visualmente
- **Tema claro como padrão**, com fundo cinza bem claro, superfícies brancas e uma cor principal (azul). A mudança acontece uma vez só, para todas as contas. Quem preferir pode voltar ao **tema escuro** em Configurações, e ele também ficou calmo, sem neon.
- **Cores com função:**
  - azul: ações e informação;
  - verde: acerto;
  - vermelho: erro;
  - âmbar: só a ofensiva e as estrelas;
  - cinza: informação secundária.
- **Contraste:** todas as combinações de texto passam no nível AA (4,5:1). Verde e âmbar foram escurecidos para isso.
- **Fonte única e legível (Inter)** no lugar da fonte decorativa com serifa. A fonte mono continua nas contas.
- **Sem brilhos:** sem gradientes, sombras coloridas, blocos coloridos nem "vidro". Saiu uma camada decorativa de cerca de 220 linhas de CSS.
- **Menu de baixo simples**, preso à borda, com 5 itens.
- **Animações curtas:** entrada de tela com um esmaecer de 0,2 s. O confete ficou com 40% das partículas.
- **Avisos mais discretos:** o "+XP" virou uma etiqueta pequena perto do rodapé. Avisos e janelas ganharam um fundo escuro neutro.

## 2. O que mudou na experiência de aprendizagem
- **Início novo**, nesta ordem:
  1. saudação e "O que você vai aprender hoje?";
  2. **Continue de onde parou**: área, assunto, **próxima lição**, % concluído, última atividade e botão "Continuar estudando";
  3. Aprenda matemática, com as 4 áreas;
  4. Pratique;
  5. Desafio de hoje, compacto;
  6. Seu progresso, com 3 números.
- **Menu:** Início · Aprender · Praticar · Progresso · Mais.
- **Aprender:** os 18 assuntos estão agrupados em 4 áreas:
  - Números e operações;
  - Frações, porcentagem e proporção;
  - Álgebra;
  - Geometria e estatística.

  Cada assunto virou uma sequência de **lições** (de 4 a 13), montada com os subtítulos e os exemplos que o conteúdo já tinha.
- **Página de estudo em 5 etapas:**
  1. Explicação, com lições que abrem e fecham e marcação de "estudada";
  2. Exemplos resolvidos, com "Passo 1, Passo 2…";
  3. Como resolver;
  4. **Tente você**, uma questão com correção;
  5. Pratique.
- **Correção que ensina**, agora uma peça só usada em exercícios, desafios, treino personalizado, revisão de erros e "Tente você":
  - acertou: **"✓ Correto!"**, a resposta e a resolução opcional;
  - errou: **"Vamos entender o erro"**, com o que você marcou, a resposta certa, *o raciocínio passo a passo*, *a ideia principal* e o botão para **tentar questões parecidas**.
- **Questões sem distração:** o rótulo ficou claro ("Questão 1 de 5 · Frações · Fácil") e não há mais XP nem combo ao lado da questão.
- **Caderno de erros:** abre com "Vamos revisar", mostra "Você teve dificuldade em" com uma barra de acerto por assunto e tem o botão "Começar revisão".
- **Progresso:**
  - resumo: exercícios, acerto, assuntos estudados e dominados;
  - **evolução da semana** (gráfico por dia e comparação com a semana anterior);
  - **onde você tem dificuldade**;
  - domínio por assunto dentro de cada área;
  - por último, nível, XP e conquistas.
- **Praticar** reúne exercícios, revisão, simulado, plano, nivelamento e desafios. Trilha e Arena aparecem por último, em "Com jogo".
- **Mais** reúne as ferramentas, os jogos e a competição (Arena, Trilha, Relâmpago, Quiz, Duelo), o seu desempenho e a conta.
- **Tour guiado e guia "Como usar"** foram reescritos para a nova estrutura. O tour termina abrindo a primeira lição.

## 3. O que foi preservado
Banco de questões e geradores (sem mudança), Resolver, Calculadora, Caderno à mão, Laboratório de Geometria, Tabuada, Treino personalizado, Desafios, Simulado, Plano, Nivelamento, Cartões, Trilha com vidas e moedas, Arena (fases, Desafio do Dia, Quiz, Relâmpago, Duelo), XP, níveis, títulos, ofensiva, missões, meta diária, conquistas, certificados, relatório, histórico, caderno de erros com caixas, contas com senha, backup, voz, tamanho do texto, PWA e offline.
Os dados continuam nas mesmas chaves do `localStorage`. O que é novo (lições estudadas e última lição aberta) fica dentro dos dados de jogo de cada conta, então entra no backup.

## 4. O que foi removido ou reduzido
- **Do Início:** o cartão grande do jogador (XP, moedas, vidas, medalhas), o destaque colorido da Trilha, os blocos coloridos dos jogos e as duas grades com 15 atalhos. Tudo isso continua acessível em Mais, Praticar ou Perfil.
- **Missões do dia:** agora abrem numa janela, a partir do "Desafio de hoje".
- **Código morto removido:** as funções antigas do Início, do Aprender e da página do assunto, e os componentes do cartão do jogador e dos blocos de jogos. As quatro cópias do bloco de correção viraram uma só.
- **XP e combo** saíram de cima da questão. Só aparece "3 acertos seguidos" quando acontece.

## 5. Bugs encontrados
- Em telas pequenas, vários botões ficavam abaixo de 40 px (voltar, ajuda, ouvir, "/", links) e o texto do menu tinha 11 px. Agora são 44 px e 12 px.
- Verde de acerto e âmbar tinham contraste abaixo de 4,5:1. Foram escurecidos.
- No tema escuro, texto branco sobre o azul claro dos botões ficava com contraste 2,9:1. Os botões ganharam uma cor própria (5,5:1).
- Os testes antigos procuravam elementos que mudaram de propósito (cartão do jogador, texto do botão do Laboratório, marcação dos passos). Foram atualizados e não indicam defeito no app.

## 6. Testes realizados (navegador automático, contas "Teste 1" e "Teste 2")
| Teste | Resultado |
|---|---|
| Home (seções, "Continue de onde parou", menu com 5 itens, sem XP grande) | OK |
| Aprender (4 áreas, 18 assuntos, de 4 a 13 lições cada) | OK |
| Conteúdos e explicações (5 etapas, lição marcada, abre a próxima) | OK |
| Exercícios e resolução (rótulo claro, correção que ensina, questões parecidas) | OK |
| Revisão de erros (não duplica, caixas de 3 e 7 dias, "Vamos revisar") | OK |
| Progresso (evolução, dificuldades, domínio) | OK |
| XP, níveis, streak, conquistas, missões e meta (incluindo a virada do dia) | OK |
| Desafios, Arena, Simulado, Trilha, Quiz, Duelo | OK (48 verificações da fusão) |
| Calculadora, Resolver, Perfil, Configurações | OK |
| Dados e localStorage (tema escuro antigo vira claro uma vez; quem escolher o escuro depois continua nele; recarregar mantém tudo) | OK |
| PWA (service worker v19, arquivos novos no cache, abre sem internet) | OK |
| Responsividade (32 telas × 360, 768 e 1280 px × tema claro e escuro: nada sai da tela) | OK |
| Acessibilidade (botões com nome, alvos de 40 px ou mais, contraste AA, teclado) | OK |
| Testes antigos (55 verificações) e verificação de 480+ botões | OK, sem erros de JavaScript |

## 7. O que ainda recomendo melhorar
1. **Explicação do erro específico:** hoje o app mostra o raciocínio certo. O próximo passo é reconhecer erros comuns (por exemplo, somar os denominadores numa soma de frações) e dizer isso.
2. **Tempo de estudo:** o app ainda não mede. Seria útil no Progresso e no relatório.
3. **Lições dos assuntos sem subtítulos:** 14 dos 18 assuntos têm só a explicação geral e os exemplos. Dividir o texto em partes menores deixaria o "Continue de onde parou" ainda mais preciso.
4. **Ícones:** os símbolos de texto e emojis funcionam, mas um conjunto de ícones desenhados deixaria o visual mais uniforme.
5. **Ranking na Arena:** precisa de um servidor. Hoje tudo fica só no aparelho.
