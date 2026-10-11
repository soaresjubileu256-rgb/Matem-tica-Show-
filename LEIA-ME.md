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
  AUDITORIA.md        auditoria técnica: problemas (P0–P3), correções, testes e plano
  BNCC.md             como os códigos da BNCC foram conferidos, fontes e pendências
  questoes-ineditas.md + gerar-banco-questoes.py   fonte das 60 questões inéditas

tests/              testes automáticos (veja "Como testar")
package.json        só para rodar os testes (o app não precisa de npm)

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
    curriculo.js           objetivo, pré-requisitos e habilidades da BNCC (conferidas) de cada assunto — veja docs/BNCC.md
    provas.js              o que cai em cada prova (ENEM, ETEC, Fuvest, Unicamp, Unesp, OBMEP)
    provas-questoes.js     60 questões inéditas (10 por prova) — GERADO a partir de docs/questoes-ineditas.md
    provas-figuras.js      figuras e gráficos em SVG dessas questões + contas armadas das resoluções
  dados/
    armazenamento.js  porta única do localStorage: chaves de cada conta, aviso de espaço cheio, backup e "desfazer"
    progresso.js      acertos, histórico, caderno de erros e revisão espaçada
    configuracoes.js  configurações salvas (tema, som, volume, meta, nível)
    contas.js         várias contas no aparelho, senha (PBKDF2), backup, restaurar/desfazer e excluir conta
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
    modos-estudo.js   Qual o próximo passo? e Mistura do dia
    provas.js         Provas e vestibulares: lista, tela de cada prova e "minha prova"
    simulado-prova.js Simulado com as questões inéditas: cronômetro, revisão, nota, gabarito e resolução
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
  registrar-sw.js     registra o service worker (fora do index.html por causa da política de segurança)
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
- **Arquivo novo:** coloque o `<script>` no `index.html` e o caminho na lista `APP_SHELL` do `sw.js`. Não use `<script>` embutido nem `onclick="..."` no HTML: a política de segurança (CSP) do `index.html` bloqueia.
- **Guardar dados:** use `storeSetJSON` / `storeGetJSON` (`js/dados/armazenamento.js`), não `localStorage` direto. Chave nova de uma conta (`algo:${currentUserId()}`)? Acrescente a base em `USER_KEY_BASES`, senão ela não entra no backup nem ao renomear ou excluir a conta (um teste avisa).
- **Lançou algo novo pras pessoas verem?** Acrescente uma entrada no topo de `NEWS` em `js/telas/novidades.js` (com um `v` maior que o anterior). Quem já usa o app vê a janela "Novidades" ao abrir o Início.
- **Depois de qualquer mudança:** aumente o `CACHE_VERSION` no `sw.js` (ex.: `mat-show-v67` → `mat-show-v68`). Assim quem já instalou recebe a versão nova.

## Como acrescentar um assunto

1. Copie um assunto parecido em `js/assuntos/fundamental.js` ou `js/assuntos/ensino-medio.js`. Mude o `id`, o `name`, o `sym`, a explicação (`learn`), os `examples` e os geradores (`gen.facil`, `gen.medio`, `gen.dificil`).
2. Em `js/assuntos/catalogo.js`, acrescente o `id` no grupo certo de `SUBJECT_GROUPS` (é isso que define a ordem e o lugar dele em todas as telas) e em `BNCC_ANO`.
3. Em `js/assuntos/curriculo.js`, acrescente o objetivo, os pré-requisitos e os códigos da BNCC **conferidos** (veja `docs/BNCC.md`). Um teste avisa se faltar.
3. Em `js/telas/exercicios.js`, acrescente uma dica em `HINTS`.

## Questões inéditas das provas

As 60 questões do "Simulado · questões inéditas" (aba de cada prova) são escritas em
`docs/questoes-ineditas.md`, que é a fonte única com enunciados, alternativas, gabarito e resoluções.
Depois de editar, gere o arquivo do app (precisa de Python 3):

    python3 docs/gerar-banco-questoes.py docs/questoes-ineditas.md js/assuntos/provas-questoes.js

Blocos especiais no .md:
- ` ```fig ID ``` ` → figura SVG (desenhada em `js/assuntos/provas-figuras.js`)
- ` ```conta + ``` ` com um número por linha → conta armada; o resultado é calculado pelo app
- ` ```sistema ``` `, ` ```matriz A ``` `, ` ```det ``` ` → notação matemática

São questões criadas pelo Matemática Show no estilo de cada prova, e o app avisa que não são oficiais.
Mude `CACHE_VERSION` em `sw.js` depois de alterar arquivos, para quem já instalou o app receber a versão nova.

## Como testar

Precisa do Node.js 18 ou mais novo. Na pasta do projeto:

    npm install          # instala só o Playwright (para os testes de navegador)
    npx playwright install chromium   # se o navegador do Playwright ainda não estiver instalado
    npm test             # roda tudo

- `npm run test:unidade`: contas, senha, backup, armazenamento cheio, nível de domínio, "Resolver questão" e **todos os geradores de questões** (18 mil questões conferidas, 6 mil também pelo resolvedor). Não precisa de navegador.
- `npm run test:navegador`: abre o app num navegador sem janela, num perfil novo (**nunca usa seus dados reais**), e testa todas as telas, contas e backup, segurança e offline, e os simulados.

O resultado da última execução está em `docs/AUDITORIA.md`.

## Backup e recuperação dos dados

- **Fazer backup:** Perfil → Configurações → "Salvar uma cópia". Baixa (ou compartilha, no celular) um `.json` com **tudo** da conta: progresso, histórico, caderno de erros, Caderno, tabuada, aulas lidas, desafios, recordes, XP e configurações.
- **Restaurar:** Configurações → "Restaurar uma cópia". A confirmação mostra de qual conta e de qual data é o arquivo. Antes de restaurar, o app guarda como estava.
- **Desfazer uma restauração:** Configurações → "Desfazer a última restauração".
- **Armazenamento cheio:** o app avisa. Configurações mostra o espaço usado (o navegador dá cerca de 5 MB). O que mais ocupa são as páginas do Caderno.
- **Dado corrompido:** o app guarda o texto original em `<chave>::corrompido` (no `localStorage`) e continua funcionando. Dá para recuperar esse texto pelas ferramentas de desenvolvedor do navegador.
- **Trocar de celular:** salve uma cópia no aparelho antigo, crie a conta no novo e restaure.

## Como atualizar o app publicado

1. Troque os arquivos na hospedagem.
2. Aumente `CACHE_VERSION` no `sw.js` (ex.: `mat-show-v80` → `mat-show-v81`).
3. Quem tem o app instalado recebe a versão nova ao abrir (o app busca a rede primeiro e usa a cópia guardada se a rede falhar ou demorar mais de 4 s).

Os dados das contas não são apagados numa atualização.

## Limitações conhecidas

- **Contas só no aparelho:** não há servidor nem sincronização. A senha separa os perfis de quem divide o aparelho, mas **não criptografa** os dados. Ao abrir, o app entra direto na última conta usada.
- **Limpar os dados do navegador apaga as contas.** Só o backup traz de volta.
- **Questões dos simulados das provas:** são inéditas, criadas no estilo de cada prova, e não são questões oficiais.
- Veja a lista completa de pendências e o plano em `docs/AUDITORIA.md`.

