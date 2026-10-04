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
    sons.js           todos os sons (motor de som, acerto/erro) e a vibração
    geometria.js      figuras, sólidos e Laboratório de Geometria
    resolvedor.js     "Resolver questão": entende e resolve contas digitadas
    navegacao.js      estado do app, troca de telas, botão voltar, menu de baixo
  assuntos/
    fundamental.js         os 18 assuntos do Ensino Fundamental
    ensino-medio-visual.js desenhos e ajudantes usados pelo Ensino Médio
    ensino-medio.js        os 23 assuntos do Ensino Médio
    catalogo.js            GRUPOS DE ASSUNTOS (a ordem única do app), ano (BNCC)
  dados/
    progresso.js      acertos, histórico, caderno de erros e revisão espaçada
    configuracoes.js  configurações salvas (tema, som, volume, meta, nível)
    contas.js         várias contas no aparelho, senha, backup e lembrete de backup
  jogo/
    xp-e-conquistas.js  XP, níveis, ofensiva, missões, conquistas e efeitos
    trilha.js           Trilha do Show, vidas, moedas, mascote Pi e motor do Quiz
    arena.js            Arena: fases com estrelas, Desafio do Dia e Simulado
    relampago.js        modo Relâmpago (60 segundos)
    duelo.js            Duelo a dois
  telas/              (uma tela ou aba por arquivo)
    entrada.js        "Quem vai jogar hoje?" / criar conta
    inicio.js         aba Início
    aprender.js       aba Aprender
    exercicios.js     aba Exercícios: modos de treino, sessões, dicas, Desafios, Treino personalizado
    tabuada.js        Tabuada (Estudar, Quadro e Treinar)
    estudo.js         nivelamento, plano de estudos, cartões de revisão e Caderno de erros
    ferramentas.js    Resolver questão e Calculadora (com parênteses, ordem das operações e histórico)
    caderno.js        caderno escrito à mão e rascunho
    progresso.js      aba Progresso e Histórico
    relatorio.js      Relatório semanal
    certificados.js   Certificados
    perfil.js         Perfil
    configuracoes.js  tela de Configurações
    ajuda.js          tour guiado e "Como usar"
    feedback.js       "Fale com a gente": nota e Formulário Google (link em FEEDBACK_FORM_URL)
    novidades.js      Novidades: janela depois de cada atualização, sininho no Início e aviso de versão nova
  iniciar.js          lista de telas e início do app (sempre o último)
```

## Onde fica cada coisa no app

| Aba / lugar | O que tem |
|---|---|
| **Início** | o que fazer hoje (avisos, meta e missões), continuar a trilha, ferramentas (Resolver questão, Calculadora, Caderno) |
| **Trilha** | episódios de todos os assuntos, na ordem da escola |
| **Aprender** | explicação de cada assunto e Laboratório de Geometria |
| **Exercícios** | Treino personalizado, Desafios, Tabuada, Caderno de erros e exercícios por assunto |
| **Arena** | Desafio do Dia, Relâmpago, Quiz do Show, Simulado, Duelo e fases com estrelas |
| **Progresso** | números gerais, Relatório semanal, Histórico, Conquistas e Certificados |
| **Perfil** (bolinha no topo) | Teste de nivelamento, Plano de estudos, Como usar, Configurações e Sair |

Os assuntos aparecem sempre na mesma ordem e nos mesmos grupos (1º ao 5º ano, 6º e 7º, 8º e 9º e as 7 áreas do Ensino Médio). Essa ordem vem de `SUBJECT_GROUPS` em `js/assuntos/catalogo.js`.

## Regras importantes

- **Ordem dos scripts:** os arquivos de `js/` dividem as mesmas variáveis e funções. Eles precisam ser carregados na ordem do `index.html`, e o `iniciar.js` é sempre o último.
- **Arquivo novo:** coloque o `<script>` no `index.html` e o caminho na lista `APP_SHELL` do `sw.js`.
- **Lançou algo novo pras pessoas verem?** Acrescente uma entrada no topo de `NEWS` em `js/telas/novidades.js` (com um `v` maior que o anterior). Quem já usa o app vê a janela "Novidades" ao abrir o Início.
- **Depois de qualquer mudança:** aumente o `CACHE_VERSION` no `sw.js` (ex.: `mat-show-v64` → `mat-show-v65`). Assim quem já instalou recebe a versão nova.

## Como acrescentar um assunto

1. Copie um assunto parecido em `js/assuntos/fundamental.js` ou `js/assuntos/ensino-medio.js`. Mude o `id`, o `name`, o `sym`, a explicação (`learn`), os `examples` e os geradores (`gen.facil`, `gen.medio`, `gen.dificil`).
2. Em `js/assuntos/catalogo.js`, acrescente o `id` no grupo certo de `SUBJECT_GROUPS` (é isso que define a ordem e o lugar dele em todas as telas) e em `BNCC_ANO`.
3. Em `js/telas/exercicios.js`, acrescente uma dica em `HINTS`.
