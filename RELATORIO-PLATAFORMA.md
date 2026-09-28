# Matemática Show — Plataforma de aprendizagem (relatório)

O app agora segue o caminho **Aprender → Entender → Praticar → Corrigir → Reforçar → Dominar**.
Tudo o que já existia continua funcionando. XP, conquistas, Arena e jogos continuam no app, mas ficam em segundo plano.

## 1. O que a análise encontrou (antes de mudar)
- **Início:** mostrava a próxima lição, mas não o próximo passo real. Não havia prática escolhida pelo desempenho nem ajuda para quem não sabe o que estudar.
- **Aprender:** 4 áreas soltas, sem ordem de estudo nem "onde estou".
- **Correção:** mostrava a conta resolvida, mas não o raciocínio (o que a questão pede, que dados usar, qual operação). Também não havia saída para quem continuava sem entender.
- **Caderno de erros:** só uma lista por assunto. Não mostrava cada questão, a data nem o que já tinha sido recuperado.
- **Domínio:** um nível por assunto inteiro. Não dava para ver *qual parte* do assunto estava fraca.
- **Menu:** Arena, Trilha e jogos ficavam escondidos em "Mais".
- **Primeiro acesso:** um tour, sem perguntar o ano escolar nem oferecer o nivelamento.
- **PWA:** sem aviso de versão nova e sem aviso de "sem internet".
- **Conteúdo:** 9 problemas nos geradores de questões (lista no item 5).

## 2. O que mudou na aprendizagem
- **Início**, nesta ordem:
  1. saudação e **progresso geral na trilha**;
  2. **"Continue de onde você parou"**, com etapa, assunto, "Lição 3 de 7", as 5 etapas, % e o botão **Continuar**;
  3. atalhos 🎯 Prática recomendada · 📖 Aprender · 📊 Meu progresso;
  4. botão **🤔 Não sei o que estudar**;
  5. **🎯 Prática de hoje**: "Selecionamos 5 questões para reforçar Frações", sempre com o motivo;
  6. **Precisa de reforço**;
  7. **Sua rotina** (meta, 🔥 sequência, nível/XP, missões, Desafio do Dia).
- **Trilha de aprendizagem** (em Aprender), na ordem: Matemática básica → Operações → Frações → Porcentagem e proporção → Álgebra → Geometria e estatística → Equações do 2º grau → Problemas do dia a dia.
  - Cada assunto tem 5 etapas: **Aprender, Exemplos, Praticar, Revisar, Dominar**.
  - O **📍 Você está aqui** marca o assunto atual, e o topo da tela mostra o próximo passo.
  - O % de cada assunto vem dessas etapas.
- **Correção em 5 passos** (em exercícios, desafios, treino, revisão e "Tente você"):
  1. O que a questão está pedindo?
  2. Quais informações vamos usar?
  3. Qual operação devemos fazer?
  4. Resolvendo (4.1, 4.2…)
  5. Conferindo o resultado, com a conta de verificação.

  Depois vêm **💡 Dica** e o botão **Tentar uma questão parecida**. Quando a pessoa acerta, aparece "✓ Correto!" com a conferência, e o raciocínio completo fica opcional.
- **🆘 Não entendi**, em toda correção de erro:
  - explicação de outro jeito (analogias do dia a dia, como pizza, dinheiro ou balança);
  - "vamos por partes", mostrando um passo de cada vez;
  - **questão mais fácil** do mesmo assunto;
  - atalho para rever a lição.

  Nas lições há também **"🆘 Não entendi esta parte"**.
- **Caderno de erros:**
  - cada questão aparece com assunto, quantas vezes errou, desde quando e a etapa da revisão;
  - botões **Tentar de novo** (só aquela questão) e **Entender de novo** (explicação em 5 passos);
  - lista **✅ Conteúdo recuperado** com as questões que saíram do caderno.
- **Domínio por parte do assunto** (53 partes, cada uma calculada com as últimas respostas):
  - 🟢 Dominado;
  - 🟡 Em aprendizado;
  - 🔴 Precisa praticar.

  Exemplo em Adição: "Somas simples", "Somas com vai um" e "Somar três números". Aparece na página do assunto e no Progresso.
- **Primeiro acesso** (contas novas):
  1. o que o app faz;
  2. em que ano o aluno está;
  3. como começar: **Descobrir meu nível**, começar pelo assunto indicado ou escolher na trilha. O tour fica opcional.

## 3. O que mudou visualmente
- **Menu:** 🏠 Início · 📚 Aprender · ✏️ Praticar · 📊 Progresso · 🎮 Desafios. Os ícones ficam em cinza e só o ativo fica colorido.
- **Nova aba Desafios:** Desafio do Dia, missões, Arena, Trilha, Desafio misto, Quiz, Relâmpago, Duelo, conquistas e certificados.
- **"Todas as funções do app"** (no fim do Início) substitui a antiga aba Mais e reúne tudo em um só lugar.
- **Etapas do assunto:** barras de 5 etapas com texto (não só cor) e a linha "Etapa atual: Exemplos · 1 de 5 concluídas".
- **Janelas claras** para as boas-vindas e para o "Não sei o que estudar".
- **Avisos no rodapé:** "Nova versão disponível — Atualizar" e "Você está sem internet (o progresso continua salvo)".
- Os botões de voltar levam à aba certa. Por exemplo, a Arena volta para Desafios e a Calculadora volta para Praticar.

## 4. O que foi preservado
Nada foi removido do app:
- banco de questões, Resolver, Calculadora, Caderno, Laboratório, Tabuada, Treino personalizado, Simulado, Plano, Nivelamento e Cartões;
- Trilha com vidas, Arena, Desafio do Dia, Quiz, Relâmpago e Duelo;
- XP, níveis, sequência, missões, meta, conquistas, certificados, relatório e histórico;
- contas, backup, voz, tamanho do texto e PWA.

Os dados continuam nas mesmas chaves do aparelho. O que é novo (ano escolar, boas-vindas, conteúdos recuperados) fica nos dados de jogo da conta e entra no backup.

## 5. Bugs corrigidos
**Conteúdo matemático (geradores de questões):**
- sinal de menos com hífen ("-3") virou "−3" nas questões e nos passos;
- equação do 2º grau aparecia com "1x²", "+ 0x" ou "+ 0";
- sistema difícil mostrava "1y";
- regra de três média podia gerar resposta igual a um dado;
- regra de três difícil podia ter resposta não inteira;
- função difícil tinha raiz com dízima sem avisar ("Arredonde para 2 casas");
- a explicação do empréstimo em cascata na subtração estava confusa;
- o exemplo do MMC na dica estava errado;
- a habilidade "Frações" genérica era contada, mas nunca aparecia.

**App:**
- rótulos das etapas cortados em telas pequenas;
- textos de 11 px (mínimo agora é 12 px);
- o guia "Como usar" ainda mandava para "Mais".

**Código:** CSS sem uso do antigo grid de áreas removido; a correção de erro usava o botão "questões parecidas" duplicado.

**Verificação do conteúdo:** 8.100 questões geradas, com o resultado conferido nos 18 assuntos (450 de 450 em cada), e 900 questões por assunto para confirmar as partes de cada domínio.

## 6. Testes realizados (navegador automático, contas "Teste 1" e "Teste 2")
| Teste | Resultado |
|---|---|
| Novas funções (boas-vindas, Início, "Não sei o que estudar", etapas, domínio, 5 passos, "Não entendi", questão mais fácil, caderno, recuperado, trilha, Desafios, offline, recarregar) | 31 de 31 OK |
| Redesign anterior (atualizado para a nova estrutura) | 28 de 28 OK |
| Fusão Arena V2 (Arena, Desafio do Dia, Simulado, importação, backup) | 48 de 48 OK |
| Geradores de questões | Nenhum problema |
| Fluxos antigos (lições, vidas, contas, dicas, rascunho, tour, Trilha, alternativas, cadastro) | OK |
| 599 botões de 30 telas, um por um | OK, sem erros de JavaScript (os únicos alertas são falsos: "caderno" em "Caderno de erros", opções que já estavam marcadas e o seletor de arquivo) |
| Responsividade (35 telas × 360, 768 e 1280 px × tema claro e escuro) | Nada sai da tela |
| Rótulos cortados (320, 360 e 390 px) | Nenhum |
| Acessibilidade (botões com nome, alvos de 44 px, texto ≥ 12 px, teclado, `aria-current` no menu, janelas com `aria-modal`) | OK |
| PWA (cache v21, abre sem internet, aviso de nova versão testado trocando a versão, cache novo depois de "Atualizar") | OK |
| Erros de JavaScript em todos os testes | Nenhum |

## 7. O que ainda recomendo
1. **Reconhecer erros comuns:** por exemplo, dizer "você somou os denominadores" quando o aluno marca 4/9 em 1/4 + 3/5.
2. **Mais lições curtas:** 14 dos 18 assuntos têm só uma explicação longa. Dividir em 3 ou 4 lições deixaria o "Lição X de Y" mais útil.
3. **Tempo de estudo:** medir e mostrar no Progresso e no relatório.
4. **Subtração e divisão de frações:** o gerador ainda não cria esses dois tipos de questão (as explicações e os exemplos existem).
5. **Sincronizar entre aparelhos:** hoje tudo fica só no aparelho (o backup ajuda).
