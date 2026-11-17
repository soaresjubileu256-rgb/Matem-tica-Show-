# Matemática Show — instruções para o assistente

App de matemática (PWA em JavaScript puro, sem build), publicado no GitHub Pages e usado também dentro de um APK.
A dona do projeto escreve em português: **responda sempre em português**.

## Regras combinadas

1. **Toda funcionalidade nova atualiza o tutorial junto, na mesma mudança:**
   - o **tour do Pi** (`TOUR_STEPS` em `js/telas/ajuda.js`): o passo da parte do app onde a novidade aparece;
   - a tela **Como usar** (`HELP_TOPICS` e `HELP_GROUPS` em `js/telas/ajuda.js`): tópico novo ou texto ajustado;
   - o aviso em **Novidades** (`NEWS` em `js/telas/novidades.js`, entrada nova no topo com `v` maior).
   Se algo mudou de lugar, corrija também os textos que dizem onde fica (tour, Ajuda e a própria tela).
2. **Toda mudança aumenta `CACHE_VERSION` em `sw.js`.** Arquivo JS/CSS novo entra em `index.html` e na lista `APP_SHELL` do `sw.js`.
3. **Fluxo de entrega:** commit no branch de trabalho → push → pull request para `main` → merge.
4. **Não mude o visual (cores, logo, fontes) sem pedido.** Mudanças assim já foram recusadas antes.
5. **Teste antes de entregar:** abra o app no navegador (Playwright com o Chromium em `/opt/pw-browsers/chromium`), confira a tela mexida no celular e no computador, e veja se não há erros de JavaScript. Diga o que foi testado de verdade e o que não foi.

## Onde fica cada coisa

- Telas: `js/telas/` · jogo (Trilha, Arena, Loja, XP, conquistas): `js/jogo/` · questões por assunto: `js/assuntos/` (tipos extras em `mais-questoes.js`) · dados e contas: `js/dados/` · navegação e abas: `js/base/navegacao.js` · lista de telas: `SCREENS` em `js/iniciar.js`.
- Desafio do Dia e Desafiar amigo recriam as perguntas por semente: mudar geradores de questões muda as perguntas de datas futuras (as antigas são protegidas por `MQ_DESDE` em `mais-questoes.js`).
