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
