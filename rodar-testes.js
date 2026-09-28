/* =========================================================
   Matemática Show — roda todos os testes automáticos do projeto
   Como rodar:  node rodar-testes.js
   Precisa: Node.js, Playwright com Chromium (npm i -g playwright) e python3 (teste offline).
   ========================================================= */
const {spawnSync} = require('child_process'), path = require('path');
const TESTES = [
  ['teste-regressao.js',     'Contas, dados, transações, backup e caderno de erros'],
  ['teste-senhas.js',        'Senhas e "Esqueci minha senha"'],
  ['teste-geradores.js',     'Matemática dos geradores de questões'],
  ['teste-gamificacao.js',   'XP e recompensas sem duplicação'],
  ['teste-offline.js',       'PWA, sem internet e atualização'],
  ['teste-acessibilidade.js','Acessibilidade, botões e métricas'],
];
let falhou = 0;
for(const [arq, nome] of TESTES){
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, arq)], {encoding:'utf8', timeout:600000});
  const saida = (r.stdout||'') + (r.stderr||'');
  const resumo = saida.trim().split('\n').pop();
  const ok = r.status === 0;
  if(!ok){ falhou++; console.log(saida.split('\n').filter(l=>/❌|Error|erro/i.test(l)).slice(0,15).join('\n')); }
  console.log(`${ok ? '✅' : '❌'} ${nome.padEnd(52)} ${((Date.now()-t0)/1000).toFixed(0).padStart(3)} s  ${resumo}`);
}
console.log(falhou ? `\n${falhou} suíte(s) com falha.` : '\nTodas as suítes passaram.');
process.exit(falhou ? 1 : 0);
