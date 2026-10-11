# Auditoria técnica — Matemática Show (outubro de 2026)

Este documento registra:
- **o que foi encontrado:** cada item foi reproduzido, lido no código ou medido;
- **o que foi corrigido:** cada correção tem testes automatizados;
- **o que ficou como plano.**

Cada item diz se é um **defeito confirmado**, um **risco** (pode acontecer, mas não foi visto) ou uma **sugestão**.

## 1. O projeto hoje

| Item | Situação |
|---|---|
| Tipo | PWA estático: HTML, CSS e JavaScript puro, sem build e sem framework. Funciona offline com service worker. |
| Tamanho | 40 scripts (cerca de 14 mil linhas de JS) e um CSS de cerca de 3 800 linhas. |
| Carregamento | Todos os scripts dividem o mesmo escopo global, na ordem do `index.html`. O `iniciar.js` é o último. |
| Dados | `localStorage`, separado por conta (`chave:idDaConta`). Contas existem só no aparelho, sem servidor. |
| Dependências | Nenhuma em produção. Só o Google Fonts, que o service worker guarda para uso offline. |
| Testes | **Não havia nenhum.** Agora são 148 testes de unidade e 110 verificações em navegador (seção 4). |

## 2. Diagnóstico por prioridade

### P0 — perda de dados ou segurança

| # | Tipo | Onde | Problema e impacto | Situação |
|---|---|---|---|---|
| 1 | **Defeito** | `js/dados/contas.js` → `renameCurrentUser` | Renomear a conta movia só 5 das 16 chaves da conta. **Ficavam para trás:** Caderno (índice e páginas), tabuada, aulas lidas, desafios, recordes, último treino, buscas do "Resolver", histórico da calculadora, feedback e data do backup. **Impacto:** depois de renomear, esses dados "sumiam"; se outra pessoa criasse uma conta com o nome antigo, herdava o Caderno de quem saiu. | ✅ Corrigido. Novo registro único de chaves (`USER_KEY_BASES` em `js/dados/armazenamento.js`) e `moveUserStorage`, que copia tudo antes de apagar. Um teste garante que nenhuma chave nova fique de fora. |
| 2 | **Defeito** | Todas as gravações (`try{ localStorage.setItem(...) }catch(e){}`) | Com o armazenamento cheio (~5 MB; o Caderno é o que mais ocupa), o progresso **deixava de ser salvo em silêncio**. Além disso, `saveNotesIndex` não tratava o erro: apagar uma página com o armazenamento cheio quebrava a tela. | ✅ Corrigido. `storeSet` e `storeSetJSON` avisam a pessoa ("Armazenamento cheio", com atalho para os dados). Configurações mostram o espaço usado. O app pede ao navegador armazenamento persistente. |
| 3 | **Defeito** | `loadProgress`, `loadHistory`, `loadUsers`… | Se um JSON salvo estivesse corrompido, o app usava `{}` e **o próximo salvamento apagava o original** para sempre. Na lista de contas, isso apagaria todas as contas do aparelho. | ✅ Corrigido. `storeGetJSON` guarda o texto original em `<chave>::corrompido` antes de seguir. |
| 4 | **Defeito** | `importProgressData`, `importNotes` | Restaurar uma cópia substituía tudo, **sem desfazer**. O Caderno era apagado **antes** de gravar o novo, então uma falha no meio perdia as anotações. Também não avisava quando o arquivo era de outra conta. | ✅ Corrigido. Antes de importar, o app guarda um **ponto de restauração**, com o botão "Desfazer a última restauração". A aplicação é tudo ou nada: valida tudo e volta ao estado anterior se faltar espaço. A confirmação mostra de qual conta e de qual data é a cópia. |
| 5 | **Defeito** | `exportProgressData` | O backup não levava aulas lidas, tabuada, desafios, recordes, último treino nem os outros itens da conta: **restaurar perdia tudo isso**. | ✅ Corrigido. **Formato 2** com todas as chaves da conta. Continua trazendo os campos do formato 1 (versões antigas do app leem o arquivo), e arquivos antigos continuam sendo aceitos. |
| 6 | **Risco** (segurança) | `hashPassword` | Senhas guardadas com **SHA-256 sem sal**: rápido de testar em massa, e senhas iguais geram o mesmo hash. Sem WebCrypto (site aberto por `http://IP-da-rede`), o app usava um **hash de 32 bits** trivial de quebrar. | ✅ Corrigido. **PBKDF2-SHA-256 com sal aleatório por conta e 310 000 iterações** (parâmetros guardados por conta). Contas antigas são convertidas na próxima entrada com a senha certa. Sem WebCrypto, o mesmo algoritmo roda em JavaScript com 20 000 iterações. Argon2id exigiria uma biblioteca WebAssembly; para um bloqueio de perfil local, o PBKDF2 nativo é a escolha proporcional (ver seção 6). |
| 7 | **Risco** (segurança) | `index.html` | Sem Content-Security-Policy. Um backup adulterado com HTML malicioso poderia rodar script, porque as questões guardadas são desenhadas como HTML. | ✅ Corrigido. CSP com `script-src 'self'` (bloqueia scripts injetados e handlers inline). O único `<script>` embutido virou `js/registrar-sw.js`. Os nomes de conta já eram escapados em todas as telas (verificado). |

### P1 — aprendizagem e funções principais

| # | Tipo | Onde | Problema | Situação |
|---|---|---|---|---|
| 8 | **Defeito** | `js/base/resolvedor.js` | **"Resolver questão" dava resposta errada.** `−x²` era calculado como `(−x)²`, então f(3) = 16 em vez de −2. Módulo `|…|` era ignorado: f(0) = −15 em vez de 15. Achado pelo teste que confere cada questão gerada com o resolvedor. | ✅ Corrigido. O sinal de menos agora vale menos que a potência (`−3² = −9`), e `|…|` é calculado. Casos extremos estão em `tests/unidade/resolvedor.test.mjs`. |
| 9 | **Defeito** | `js/iniciar.js` | As 6 telas que carregam dados (Progresso, Perfil, Histórico, Relatório, Configurações, Treino personalizado) **não tratavam erros**: ficavam em "Carregando…" para sempre. Se a pessoa trocasse de tela antes de terminar, a tela antiga **cobria a nova**. | ✅ Corrigido. Desenho numerado (o resultado atrasado é descartado) e tela de erro com "Tentar de novo". |
| 10 | **Defeito** | `js/telas/simulado-prova.js` | Durante o simulado das provas, o menu de baixo aparecia: um toque **perdia a prova**. Não dava para sair e continuar depois. | ✅ Corrigido. Menu escondido; respostas salvas a cada toque; **"Continuar o simulado"** com o tempo pausado fora do app; aviso antes de descartar um simulado pausado. |
| 11 | **Defeito pedagógico** | `masteryOf` (`js/telas/inicio.js`) | "Dominado" era possível com 10 acertos seguidos **no mesmo dia**: não diferenciava desempenho de retenção. | ✅ Corrigido. Dominado também exige acertos em **pelo menos 2 dias diferentes**. Com menos de 5 respostas o nível fica em "Aprendendo" (acerto casual). Dados antigos mantêm o nível. |
| 12 | **Defeito** | `resetCurrentUserProgress` | "Começar do zero" dizia apagar o progresso, mas deixava aulas lidas, tabuada, desafios e recordes. | ✅ Corrigido. Apaga todo o progresso de estudo; o texto diz exatamente o que fica (Caderno e configurações). |
| 13 | **Falta** | Configurações | Não havia como **excluir uma conta** e os dados dela. | ✅ Implementado: pede a senha e apaga só os dados dela. Testado que "ana" não apaga os dados de "anabela". |

### P2 — robustez, arquitetura, desempenho, acessibilidade

| # | Tipo | Problema | Situação |
|---|---|---|---|
| 14 | Defeito | `exerciseSession`, `challengeSession` e `personalizedSession` deixavam a **tela em branco** quando abertas sem sessão (por exemplo, histórico do navegador restaurado sem ela). | ✅ Voltam para a lista. |
| 15 | Acessibilidade | `maximum-scale=1.0` **impedia ampliar a tela com os dedos**. | ✅ Removido. Os botões de jogo já usam `touch-action: manipulation`. |
| 16 | Desempenho | O service worker esperava a rede sem limite: com sinal fraco, o app podia demorar muito para abrir, mesmo com tudo guardado. | ✅ Usa a cópia guardada se a rede passar de 4 s e atualiza em segundo plano. |
| 17 | Risco (por desenho) | Ao abrir, o app **entra direto na última conta, sem pedir senha**. A senha só protege a troca de conta. | 📝 Documentado. Sugestão: opção "pedir senha ao abrir". |
| 18 | Arquitetura | 40 scripts no mesmo escopo global; a ordem do `index.html` importa; nomes podem colidir. | 📝 Plano (seção 5). Não migrei para módulos ES agora: a mudança é grande e arriscada, e o ganho imediato é pequeno. Os testes novos são a rede de segurança para essa migração. |
| 19 | Código repetido | `iniciar.js` repetia o mesmo bloco 6 vezes. | ✅ Um único `ASYNC_SCREENS`. |
| 20a | Defeito | Configurações: depois de restaurar ou desfazer, um temporizador de 0,9 s levava ao Perfil "se a pessoa ainda estivesse em Configurações". Se ela saísse e voltasse nesse intervalo, era **tirada da tela no meio de outra ação** (achado no teste de exclusão de conta). | ✅ O temporizador só age se a mesma tela ainda estiver aberta. |
| 20 | Baixo impacto | Gravações de preferências do aparelho (nomes do Duelo, filtros) continuam silenciosas. | Deixado como está: não são progresso. |

### P3 — refinamentos e conteúdo

| # | Tipo | Situação |
|---|---|---|
| 21 | Tela inicial | Avaliada com captura de tela, sem redesenho. Ela já prioriza a próxima ação ("Começar o show" continua a trilha) e mostra meta, Desafio do Dia, Mistura e missões. O menu leva a Trilha, Estudar (prática, simulados e provas), Arena (jogos) e Progresso. Redesenhar agora seria só cosmético. Sugestão: o cartão "Continuar" poderia apontar para o assunto que a pessoa estava estudando, não só para a trilha. |
| 22 | BNCC | ✅ **Etapa 1 feita** (ver `docs/BNCC.md`). Cada um dos 41 assuntos ganhou objetivo, pré-requisitos e as habilidades da BNCC correspondentes: 38 códigos, cada um conferido em 2 ou mais fontes independentes. 8 assuntos ficaram sem código, com nota explicando. O site do MEC não pôde ser acessado: falta conferir a redação oficial. |
| 23 | Estrutura da aula | Cada assunto já tem explicação, exemplos, geradores em 3 níveis, passo a passo e dicas. **Faltam campos explícitos:** objetivo de aprendizagem, pré-requisitos e critério de domínio por assunto (hoje o critério é o geral, item 11). Plano na seção 5. |
| 24 | Jogos e XP | O XP vem da dificuldade da questão e de um bônus de sequência de acertos. Velocidade só conta no Relâmpago, que é opcional. Sugestões: XP extra por **subir de nível de domínio** e por **revisão no dia certo**, e missões ligadas aos assuntos fracos. |
| 25 | Simulados | Ainda faltam: relatório por assunto das questões inéditas (cada questão tem um assunto só) e filtros por assunto ou dificuldade no banco. Ver plano. |

## 3. O que foi alterado (arquivos)

| Arquivo | Mudança |
|---|---|
| `js/dados/armazenamento.js` (novo) | Registro de chaves por conta; `storeSet` e `storeGetJSON` seguros; aviso de armazenamento cheio; mover, apagar e retratar uma conta; ponto de restauração; espaço usado; armazenamento persistente. |
| `js/dados/contas.js` | PBKDF2 com sal e migração; renomear com todas as chaves; backup formato 2; importação com ponto de restauração e desfazer; recomeçar completo; excluir conta; validação de nome. |
| `js/dados/progresso.js`, `configuracoes.js`, `js/jogo/xp-e-conquistas.js` | Leitura e gravação pelo módulo novo; o dia de cada resposta é guardado. |
| `js/telas/entrada.js` | Login com `verifyPassword`; cadastro com PBKDF2 e conferência de que a conta foi salva. |
| `js/telas/configuracoes.js` | Confirmação de restauração com conta e data; "Desfazer a última restauração"; espaço usado; excluir conta. |
| `js/telas/caderno.js`, `aprender.js`, `tabuada.js`, `exercicios.js` | Gravação segura; importação do Caderno sem apagar antes; telas de sessão sem tela branca. |
| `js/telas/simulado-prova.js` | Salvar e continuar o simulado, tempo pausado, menu escondido. |
| `js/telas/inicio.js` | Domínio com retenção (2 dias). |
| `js/base/resolvedor.js` | Precedência do sinal de menos e módulo. |
| `js/iniciar.js` | Telas assíncronas com erro tratado e sem corrida. |
| `js/base/navegacao.js` | Pede armazenamento persistente ao entrar. |
| `js/registrar-sw.js` (novo), `index.html`, `sw.js` | CSP, zoom liberado, registro do service worker em arquivo próprio, cache v80, rede com limite de 4 s. |
| `js/telas/novidades.js` | Entrada v16 explicando as mudanças para quem usa o app. |
| `tests/`, `package.json` | Testes (seção 4). |

## 4. Testes

Rodar: `npm install` (instala só o Playwright, para os testes de navegador) e depois `npm test`. Resultados **executados** nesta versão:

| Conjunto | Arquivo | Resultado |
|---|---|---|
| Geradores de questões | `tests/unidade/geradores.test.mjs` | ✅ 123 testes. **18 450 questões** (41 assuntos × 3 níveis × 150): resposta numérica válida, passo a passo, 4 alternativas sem repetição e só uma correta. **6 000 delas também conferidas pelo resolvedor**, que é um código independente. |
| Resolver questão | `tests/unidade/resolvedor.test.mjs` | ✅ 6 testes (precedência, módulo, divisão por zero, funções, equações). |
| Dados e contas | `tests/unidade/dados.test.mjs` | ✅ 12 testes: registro de chaves, renomear, nomes inválidos, backup v2 e v1, ponto de restauração e desfazer, arquivo inválido, armazenamento cheio, dado corrompido, exclusão isolada, recomeçar, PBKDF2 com migração, PBKDF2 em JS igual ao nativo (com vetor SHA-256 conhecido). |
| Aprendizagem | `tests/unidade/aprendizagem.test.mjs` | ✅ 6 testes de nível de domínio (casual × consistente × retenção; dados antigos). |
| Banco de questões inéditas | (sessão anterior) | ✅ 60 respostas recalculadas e 13 contas armadas conferidas. |
| Todas as telas | `tests/navegador/telas.mjs` | ✅ 50/50: cadastro pela tela e as 49 telas abrem sem erro e sem ficar presas. |
| Contas e backup | `tests/navegador/contas-e-backup.mjs` | ✅ 13/13: senha errada e certa, conta antiga convertida, download do backup, restaurar, desfazer, renomear, excluir. |
| Segurança e offline | `tests/navegador/seguranca-offline.mjs` | ✅ 7/7: CSP sem nenhuma violação em todas as telas, zoom liberado, service worker e app abrindo **sem internet**. |
| Simulados | `tests/navegador/simulados.mjs` | ✅ 40/40: 60 questões em 4 larguras (320 a 1280 px), navegação, revisão, teclado, ampliar, **pausar e continuar** (inclusive fechando o app), cronômetro, entrega automática, nota, histórico, simulado gerado e telas assíncronas. |

**Ainda precisa de verificação manual ou de testes futuros:**
- Celulares de verdade (Android e iPhone), inclusive o tempo do PBKDF2 em aparelho barato (estimativa: cerca de 1 s ao entrar).
- Leitor de tela (TalkBack e VoiceOver) e navegação só por teclado em todas as telas.
- **Atualização do app instalado de uma versão antiga para esta.** O fluxo do service worker foi revisto, mas a troca de versão não tem teste automático.
- Jogos (Relâmpago, Duelo, Quiz) e a Trilha: abrem sem erro (teste de telas), mas o fluxo completo de cada um não tem teste próprio.

## 5. Plano de evolução (próximas etapas)

| Etapa | O que fazer | Depende de | Pronto quando |
|---|---|---|---|
| 1 ✅ | **(Feito: `js/assuntos/curriculo.js`, `docs/BNCC.md`; falta conferir no PDF do MEC)** **Metadados pedagógicos por assunto:** objetivo, pré-requisitos (ids), habilidade BNCC **conferida** e critério de domínio, em `catalogo.js`. | Revisão humana dos códigos BNCC | Cada assunto do Fundamental tem código conferido; um teste garante que todo pré-requisito existe. |
| 2 | **Recomendação do próximo passo pelos pré-requisitos:** só sugerir o assunto quando os pré-requisitos estiverem Proficiente; revisar quando o domínio cair. | 1 | Teste de unidade com cenários de aluno. |
| 3 | **Erros classificados:** registrar o tipo de erro (sinal, ordem das operações, unidade…) nos geradores que já conhecem as alternativas erradas, e explicação dirigida a cada tipo. | — | Cada gerador marca o motivo de cada alternativa errada. |
| 4 | **XP por domínio e revisão:** bônus ao subir de nível de domínio e ao revisar no dia agendado; limite diário de XP por repetição do mesmo conteúdo. | 2 | Teste de que repetir a mesma questão não rende XP ilimitado. |
| 5 | **Simulados:** relatório por assunto, filtros por assunto e dificuldade, plano de estudo a partir dos erros. Questões **oficiais** só com fonte e licença verificadas, marcadas como "oficial". | 1 | Cada questão traz a origem (oficial, adaptada ou inédita). |
| 6 | **Módulos ES, aos poucos:** começar por `dados/` (já isolado) e `base/resolvedor.js`, com `import`/`export`; os testes atuais garantem que nada muda. TypeScript só depois, via JSDoc + `// @ts-check`, sem build. | Testes atuais | `npm test` verde a cada arquivo migrado. |
| 7 | **Opção "pedir senha ao abrir"** e bloqueio automático depois de um tempo sem uso. | — | Teste de navegador. |
| 8 | **Sincronização entre aparelhos (opcional):** exige servidor (seção 6). | Decisão sobre custo e privacidade | — |

## 6. Segurança: o que a senha protege e o que não protege

- As contas ficam **só no aparelho**, e a senha **não criptografa os dados**: quem tem acesso ao navegador consegue ler o armazenamento. Ela serve para separar perfis de quem divide o celular.
- O PBKDF2 com sal protege a **senha em si**: se o armazenamento vazar, descobrir a senha (que a pessoa pode usar em outros lugares) fica caro.
- **Por que não Argon2id:** exigiria uma biblioteca em WebAssembly (dependência nova, cerca de 30 KB) para um caso local, sem servidor. Se um dia houver login em servidor, o hash deve ser feito **no servidor**, com Argon2id (m ≥ 19 MiB, t ≥ 2, p = 1).
- **Sincronização entre aparelhos** (não implementada) exigiria:
  - backend com autenticação (sessão em cookie `HttpOnly`/`Secure`, ou OAuth);
  - autorização por conta e validação de todo dado no servidor;
  - TLS e backups do banco;
  - cuidado especial com dados de menores (LGPD: consentimento dos responsáveis, mínimo de dados, exclusão a pedido).

  Isso tem custo de hospedagem e manutenção: decisão sua antes de qualquer implementação.
