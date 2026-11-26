# Testes automáticos do Matemática Show

Abrem o app num navegador de verdade (Chromium) e usam como um aluno usaria: criam conta, jogam fases, abrem baús, trocam de aba…
Servem pra conferir, antes de publicar, que nada do que já funcionava quebrou.

## Como rodar

Precisa do [Node.js](https://nodejs.org) e do Playwright:

```
npm install playwright      (só na primeira vez)
npx playwright install chromium
node tests/rodar.js
```

- `node tests/rodar.js` roda tudo (uns 3 minutos) e termina com **✓ TUDO CERTO** ou **✗ ALGUM TESTE FALHOU**.
- `node tests/rodar.js jogo tour` roda só os arquivos com esses nomes.
- O `rodar.js` sobe sozinho um servidor local (`tests/servidor.js`); não precisa abrir nada antes.

## O que cada arquivo confere

| Arquivo | O que testa |
|---|---|
| `t-telas.js` | Abre as 36 telas no celular (tema escuro e claro) e no computador: sem erro, com conteúdo e sem nada saindo pra fora |
| `t-questoes.js` | Gera ~60 mil questões de todos os assuntos (incluindo o lote 2 de `mais-questoes-2.js`): resposta válida, texto sem defeito, 4 alternativas com 1 certa; Desafio do Dia igual pra mesma data e os de antes do lote 2 sem mudar |
| `t-navegacao.js` | Menu de baixo, abas de cada seção, páginas Praticar e Jogos, botão voltar |
| `t-inicio.js` | Ordem do Início (sem coração, moedas e ofensiva) e cartão do jogador no Progresso |
| `t-jogo.js` | Protetor de ofensiva, vidas e revisão de erros, presente de nível, prêmio surpresa, missão da semana, Loja e conquistas |
| `t-conta.js` | Criar conta, senha certa/errada e levar a conta pra outro celular |
| `t-erros.js` | Aviso de "errou 3 seguidas" com a explicação |
| `t-amigo.js` | Desafiar amigo: código, mesmas perguntas e partida completa entre duas contas |
| `t-leve.js` | Gravação agrupada não perde respostas (recarregar, sair da conta), cópia automática só quando muda, confete não acumula |
| `t-trilha.js` | Trilha em mapa de aventura: fase feita, atual (com o Pi) e trancada, trilha dourada, Rever fases, cliques e tema claro |
| `t-tour.js` | Tour do Pi e tela Como usar sem passo ou tópico faltando |

## Quando mexer no app

Toda funcionalidade nova ganha (ou atualiza) um teste aqui, do mesmo jeito que atualiza o tour, a Ajuda e as Novidades.
