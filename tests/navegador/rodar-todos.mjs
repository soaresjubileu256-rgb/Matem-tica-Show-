// Roda, em sequência, todos os testes de navegador desta pasta (arquivos que não são utilitários).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const arquivos = fs.readdirSync(dir).filter(f=> f.endsWith('.mjs') && !['ajuda.mjs','rodar-todos.mjs'].includes(f)).sort();
let falhas = 0;
for(const f of arquivos){
  console.log(`\n▶ ${f}`);
  const r = spawnSync(process.execPath, [path.join(dir, f)], {stdio:'inherit'});
  if(r.status !== 0){ falhas++; console.log(`✗ ${f} falhou`); }
}
console.log(`\n${arquivos.length - falhas}/${arquivos.length} arquivos de teste de navegador passaram`);
process.exit(falhas ? 1 : 0);
