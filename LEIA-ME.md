# Matemática Show

Seu professor de matemática digital. É um app que funciona no navegador e pode ser instalado no celular (PWA). Funciona sem internet e não precisa de servidor: o progresso fica guardado no próprio aparelho.

## Como abrir

- **No computador:** rode um servidor simples na pasta, por exemplo `python3 -m http.server`, e abra `http://localhost:8000`.
- **Publicar:** envie a pasta inteira para qualquer hospedagem de site estático (GitHub Pages, Netlify…).

Dá para abrir o `index.html` direto, mas aí o modo offline não funciona.

## Pastas

```
index.html          página do app (carrega o CSS e os scripts na ordem certa)
manifest.json       dados para instalar como app (nome, cores, ícones)
sw.js               service worker: guarda os arquivos para funcionar offline
LEIA-ME.md          este guia

css/
  style.css         todo o visual (tema escuro e claro)

img/                logo e ícones do app

docs/
  RELATORIO-FUSAO.md  histórico das mudanças (fusão, Ensino Médio, Desafio do Dia)

js/
  base/
    ferramentas.js    contas, frações, potências e desenhos das explicações
    geometria.js      figuras, sólidos e Laboratório de Geometria
    resolvedor.js     "Resolver questão": entende e resolve contas digitadas
    navegacao.js      estado do app, troca de telas, botão voltar, menu de baixo
  assuntos/
    fundamental.js         os 18 assuntos do Ensino Fundamental
    ensino-medio-visual.js desenhos e ajudantes usados pelo Ensino Médio
    ensino-medio.js        os 23 assuntos do Ensino Médio
    catalogo.js            ordem dos assuntos, ano (BNCC) e áreas do Ensino Médio
  dados/
    progresso.js      acertos, histórico e caderno de erros (por conta)
    configuracoes.js  tema, som, meta diária, nível escolar
    contas.js         várias contas no mesmo aparelho, senha e backup
  telas/
    entrada.js        "Quem vai jogar hoje?"
    inicio.js         tela Início
    aprender.js       Tabuada, Aprender e lista de Exercícios
    exercicios.js     sessões de exercícios, dicas, revisão de erros, desafios, treino
    ferramentas.js    Resolver questão e Calculadora
    caderno.js        caderno escrito à mão e rascunho
    perfil.js         Perfil, Configurações e Histórico
    estudo.js         nivelamento, plano de estudos, cartões e caderno de erros
    ajuda.js          tour guiado e tela "Como usar"
  jogo/
    xp-e-conquistas.js  XP, níveis, ofensiva, missões, conquistas, sons e efeitos
    relampago.js        modo Relâmpago (60 segundos)
    trilha.js           Trilha do Show, vidas, moedas, mascote Pi e Quiz
    arena.js            Arena: fases com estrelas, Desafio do Dia e Simulado
  iniciar.js          lista de telas e início do app (sempre o último)
```

## Regras importantes

- **Ordem dos scripts:** os arquivos de `js/` dividem as mesmas variáveis e funções. Eles precisam ser carregados na ordem do `index.html`, e o `iniciar.js` é sempre o último.
- **Arquivo novo:** coloque o `<script>` no `index.html` e o caminho na lista `APP_SHELL` do `sw.js`.
- **Depois de qualquer mudança:** aumente o `CACHE_VERSION` no `sw.js` (ex.: `mat-show-v24` → `mat-show-v25`). Assim quem já instalou recebe a versão nova.

## Como acrescentar um assunto

1. Copie um assunto parecido em `js/assuntos/fundamental.js` ou `js/assuntos/ensino-medio.js`. Mude o `id`, o `name`, o `sym`, a explicação (`learn`), os `examples` e os geradores (`gen.facil`, `gen.medio`, `gen.dificil`).
2. Em `js/assuntos/catalogo.js`, acrescente o `id` em `SUBJECT_ORDER` e em `BNCC_ANO`. Se for do Ensino Médio, acrescente também na área certa de `SUBJECT_AREAS`.
3. Em `js/telas/exercicios.js`, acrescente uma dica em `HINTS`.
