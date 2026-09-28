# Matemática Show — Estabilização e qualidade (relatório)

**Base usada:** a versão mais recente do projeto (plataforma de aprendizagem). Ela já contém tudo o que estava no `matematica-show-educacional.zip` e também o que veio depois.

**Como o trabalho foi feito:**
- a auditoria veio primeiro;
- as alterações foram pequenas e localizadas;
- depois de cada grupo de mudanças, os testes rodaram de novo;
- não houve redesign;
- nenhuma função do app foi removida.

## Etapa 1 — Mapa da auditoria

| Arquivo | Responsabilidade | Depende de | Dados que usa | Riscos encontrados |
|---|---|---|---|---|
| `index.html` | Carrega estilos e scripts em ordem; registra o service worker; mostra avisos de rede | todos | — | `maximum-scale=1.0` impedia o zoom; fontes vindas do Google faltavam sem internet |
| `app.js` (7,3 mil linhas) | Núcleo do app (ver detalhe abaixo da tabela) | os demais | todas as chaves da conta | ver seção 1 |
| `arena.js` | Arena: fases com estrelas, Desafio do Dia, Simulado | app.js | jogo (arena) | grava pelo `saveGame` |
| `estudo.js` | Nivelamento, plano, cartões, tela do caderno de erros, importação do Arena V2 | app.js | jogo (estudo), erros | leitura e gravação direta, com erro silencioso |
| `ensino.js` | Trilha, etapas, domínio por parte do assunto, prática de hoje, explicação em 5 passos | app.js, aprendizagem.js | progresso, histórico, erros | — |
| `aprendizagem.js` | Telas de Início, Aprender, Praticar, Desafios, página de estudo e correção | app.js, ensino.js | leitura de tudo | leitura direta do caderno de erros |
| `sw.js` | Funcionamento sem internet e atualização | — | só arquivos do app | apagava o cache antigo sem conferir o novo; um HTML novo podia usar JS velho |
| `style.css` (2,3 mil linhas) | Visual (tema claro e escuro) | fontes | — | camadas de redesigns anteriores: 330 `!important` e 136 seletores repetidos |

O `app.js` concentra quase tudo:
- assuntos e geradores de questões;
- contas e senhas;
- progresso, histórico e caderno de erros;
- jogo: XP, ofensiva, missões, conquistas, vidas e moedas;
- Trilha, Quiz, Relâmpago e Duelo;
- caderno à mão, calculadora e Resolver;
- configurações, backup e navegação.

**Como os dados funcionam:** cada conta tem chaves próprias no armazenamento do navegador, no formato `mathstudy-<tipo>:<id da conta>`. São 11 chaves fixas por conta, mais uma chave por página do caderno à mão. O id da conta vem do nome, então renomear a conta muda o id.

## 1. Corrigido

**P0.1 — Renomear a conta perdia dados.** Confirmei o bug na versão anterior: depois de renomear, as anotações, o treino personalizado e a informação de backup sumiam. O cache do jogo também continuava apontando para o id antigo.
- Agora existe `getUserStorageKeys(uid)`, uma lista única de todas as chaves de uma conta: progresso, histórico, erros, configurações, jogo, índice de anotações, backup, treino, nomes do duelo e cada página do caderno.
- A renomeação move tudo de uma vez, numa transação: ou move tudo, ou nada.

**P0.2 — Nenhuma gravação falha em silêncio.**
- O arquivo novo `storage.js` concentra as operações: `get`, `set`, `remove`, `has`, `keys`, `migrate` e `transaction`.
- Se uma gravação falha, a pessoa vê: "Não conseguimos salvar seu progresso neste aparelho. Verifique o espaço disponível ou faça um backup."
- Os detalhes técnicos vão para o console só em desenvolvimento (arquivo local ou localhost).
- Um dado corrompido não é sobrescrito: antes, o app guarda uma cópia (`…:corrompido`).

**P0.3 — Operações críticas são "tudo ou nada".**
- Responder uma questão atualiza progresso, XP, histórico, erro, missões, ofensiva e conquistas numa única transação. A revisão de erros funciona do mesmo jeito.
- Salvar uma anotação grava a página e o índice juntos.
- Se o aparelho encher no meio, o que já tinha sido gravado é desfeito, e a memória do app volta a ler o que está salvo.

**Bugs de duplicação encontrados:**
- clique duplo em "Corrigir" contava a resposta duas vezes (em Exercícios, Desafio, Treino e Revisão);
- clique duplo no baú da Trilha dava moedas duas vezes.

**P1.1 — Senhas.** O arquivo novo `seguranca.js` passa a usar PBKDF2-SHA256 com salt próprio de cada conta e 100 mil repetições.
- Contas antigas (SHA-256 sem salt, ou o formato simples "fb…") continuam entrando. No primeiro login, o resumo da senha é refeito no formato novo.
- Sem `crypto.subtle` (página aberta por http fora do localhost), o mesmo cálculo roda em JavaScript puro. O resultado é idêntico ao do navegador e confere com o vetor de teste oficial.
- A limitação de um app 100% local está documentada no próprio arquivo.

**P1.2 — "Esqueci minha senha".**
- Mostra só a dica da conta escolhida.
- Um nome digitado que não existe recebe a mesma resposta de "conta sem dica". O login por nome digitado responde "Nome ou senha incorretos". Assim, a tela não confirma se um nome tem conta.

**P1.3 — Isolamento entre contas.**
- Cada entrada do histórico do navegador agora guarda o id da conta. "Voltar" não abre mais a tela, nem a questão em andamento, de outra conta que usou o aparelho.
- Sair da conta limpa tudo o que estava em memória.
- Os nomes do duelo, que eram do aparelho, passaram a ser de cada conta. Os nomes antigos continuam sendo lidos.

**P1.4 — Backup.**
- O backup agora tem `backupVersion: 1` e inclui o treino personalizado.
- Tudo é validado antes de gravar qualquer coisa.
- Um backup inválido é recusado com o aviso "Seus dados atuais não foram alterados". Um backup de versão mais nova do app também é recusado.
- Backups antigos continuam aceitos.
- A restauração é uma transação.
- O reset também usa a lista única de chaves.

**P1.8 — Service worker.**
- HTML: rede primeiro, com a cópia guardada como reserva.
- JS, CSS, imagens e fontes: cache primeiro. JS e CSS levam a versão no endereço (`?v=24`), então um HTML novo nunca usa um script velho.
- A instalação baixa os arquivos sem usar o cache do navegador.
- O cache antigo só é apagado depois que o novo está pronto.
- Uma versão com arquivo faltando não é instalada, e a atual continua funcionando.
- Dados do aluno nunca passam pelo service worker.

**P1.9 — Offline real.** As fontes Inter e JetBrains Mono agora ficam dentro do app (licença livre SIL OFL). O app não faz nenhum pedido para fora.

**P2.1 — Acessibilidade.**
- Zoom liberado.
- Mensagens de erro do cadastro e do login são anunciadas pelo leitor de tela (`role="alert"`).
- Todas as janelas viraram diálogos acessíveis. O arquivo novo `ui.js` cuida disso: dá um nome a cada janela, leva o foco para dentro, mantém o Tab dentro dela, fecha com Esc usando o botão de fechar da própria janela e devolve o foco ao sair.

**P2.2 — Botões.** 63 botões ganharam `type="button"`. O único botão de formulário continua como `submit`.

**P2.3 — Camada de interface:** o `ui.js` (janelas). Outros componentes não foram criados porque não havia ganho real.

**P2.7 — Métricas educacionais.** O app agora registra, por dia:
- questões, acertos e revisões;
- tempo de estudo estimado (intervalo entre respostas, no máximo 3 minutos por intervalo);
- acertos por assunto.

A função `learningMetrics()` já devolve tempo, taxa de acerto, assuntos fortes e fracos, erros recorrentes e evolução. Os dados ficam só no aparelho e entram no backup.

**Outro ajuste:** o guia "Como usar" foi atualizado.

## 2. Testado (navegador automático, contas "Teste 1", "Teste 2"…)

✓ criação de conta ✓ login ✓ troca de conta (A → B → A mostra só os dados de A) ✓ renomeação (11 tipos de dado e cada página do caderno) ✓ senha errada, espera após muitas tentativas, troca de senha ✓ contas com senha antiga ✓ anotações ✓ progresso ✓ histórico ✓ caderno de erros (sem duplicar, contador, caixas de 3 e 7 dias, recuperado, datas, recarregar) ✓ XP sem duplicar (clique triplo, Enter, voltar/avançar, recarregar, reenvio) ✓ vidas ✓ moedas ✓ ofensiva ✓ conquistas ✓ missões ✓ estrelas da Arena ✓ baú ✓ backup e restauração (8 backups inválidos recusados, falha no meio, versão antiga) ✓ reset ✓ dado corrompido ✓ aparelho sem espaço ✓ offline (abrir, navegar, gerar, responder, salvar, lições, calculadora, caderno de erros, Arena) ✓ atualização de versão ✓ geradores matemáticos (54 mil questões resolvidas de novo sem usar a resposta do app, nos 18 assuntos e 3 níveis) ✓ Arena, Desafio do Dia, Simulado, Trilha, Quiz, Relâmpago, Duelo ✓ tema escuro ✓ mobile (35 telas × 360, 768 e 1280 px × dois temas) ✓ zoom a 200% ✓ teclado e leitor de tela nas janelas ✓ 599 botões apertados um por um

| Suíte | Resultado |
|---|---|
| `teste-regressao.js` (contas, dados, transações, backup, caderno de erros) | 42/42 |
| `teste-senhas.js` | 17/17 |
| `teste-geradores.js` | 54.000 questões conferidas, nenhum problema |
| `teste-gamificacao.js` | 16/16 |
| `teste-offline.js` | 19/19 |
| `teste-acessibilidade.js` | 15/15 |
| Testes antigos (plataforma, redesign, fusão com a Arena, fluxos, Trilha, tour, cadastro…) | todos OK, sem erros de JavaScript |

**Prova de que os testes pegam erro de verdade:**
- o teste de renomeação falha na versão anterior;
- sabotei de propósito 10% das respostas de dois assuntos, e o teste dos geradores apontou exatamente esses casos.

## 3. Não resolvido

- **P2.4 — Dividir o `app.js`:** fiz só a primeira separação (`storage.js`, `seguranca.js` e `ui.js`). Dividir o resto (geradores, contas, jogo, telas) é seguro agora que existem testes, mas é trabalho para etapas próprias, uma área por vez.
- **P2.5 — CSS:** não mexi, porque esta fase não inclui mudança visual. Ficam 330 `!important` e 136 seletores repetidos, sobras dos redesigns anteriores. A limpeza deve ser feita com comparação de capturas de tela antes e depois.
- **P2.6 — Lições menores:** 14 dos 18 assuntos ainda têm uma explicação longa só. Frações já tem 7 lições. Faltam também geradores de subtração e divisão de frações (a explicação existe).
- **Tela de métricas:** a estrutura existe, mas ainda não aparece para o aluno.
- **Excluir conta:** o app não tem essa função, só "resetar progresso", que foi testado. Não criei uma função nova sem pedido.

## 4. Riscos restantes

- **App 100% local:** quem tem acesso técnico ao aparelho consegue copiar ou apagar os dados. A senha separa quem usa o mesmo aparelho, mas não protege contra esse tipo de acesso.
- **Senha sem `crypto.subtle`:** o cálculo em JavaScript leva cerca de 1,8 s aqui; num celular lento, pode passar de 5 s. Só acontece fora de https/localhost.
- **Atualizações:** a cada versão publicada é preciso mudar o número em `sw.js` e no `index.html`. O `teste-offline.js` confere se os dois estão iguais.
- **Avisos antes de gravar:** se uma gravação falhar, um aviso de conquista pode já ter aparecido antes de os dados serem desfeitos. Os dados ficam certos; só o aviso fica errado.

## 5. Arquivos alterados

- **Alterados:** `app.js`, `aprendizagem.js`, `arena.js`, `estudo.js`, `ensino.js`, `index.html`, `sw.js`, `style.css` (só as fontes locais no início).
- **Novos (código):** `storage.js`, `seguranca.js`, `ui.js`.
- **Novos (fontes):** `inter-latin.woff2`, `inter-latin-ext.woff2`, `jetbrains-mono-latin.woff2`, `jetbrains-mono-latin-ext.woff2`.

## 6. Testes adicionados

- `teste-regressao.js`
- `teste-senhas.js`
- `teste-geradores.js`
- `teste-gamificacao.js`
- `teste-offline.js`
- `teste-acessibilidade.js`
- `rodar-testes.js`: roda todos com `node rodar-testes.js` (precisa de Playwright com Chromium e python3)

## 7. Possíveis regressões

- **Login e criação de conta** ficaram cerca de 0,1 s mais lentos, por causa do PBKDF2.
- **Esc nas janelas** agora aperta o botão de fechar/cancelar da própria janela. Nas boas-vindas, isso equivale a "Pular apresentação".
- **Resposta repetida:** a mesma questão enviada de novo em menos de 2 s conta uma vez só. Nenhum modo do app reenvia a mesma questão tão rápido de propósito; os cartões de revisão levam mais tempo que isso.
- **Nomes do duelo:** quem já tinha nomes salvos continua vendo os mesmos, lidos da chave antiga. Os novos ficam na conta.
- **Primeira abertura depois de atualizar:** o service worker baixa todos os arquivos de novo, cerca de 1 MB.
