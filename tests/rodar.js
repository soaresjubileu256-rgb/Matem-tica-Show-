/* Roda todos os testes automáticos do app e mostra um resumo.
   Uso:  node tests/rodar.js            (todos)
         node tests/rodar.js jogo tour  (só os arquivos com esses nomes)
   Sobe um servidor local, roda cada tests/t-*.js um de cada vez e termina com erro se algum falhar. */
const {spawn} = require('child_process'), fs = require('fs'), path = require('path');
const PORT = 8790 + Math.floor(Math.random()*100);
const server = require('./servidor.js').start(PORT);
const filtro = process.argv.slice(2);
const arquivos = fs.readdirSync(__dirname).filter(f=> /^t-.*\.js$/.test(f)).filter(f=> !filtro.length || filtro.some(x=> f.includes(x))).sort();

function rodarArquivo(f){
  return new Promise(resolve=>{
    const t0 = Date.now(); let out = '';
    const ch = spawn(process.execPath, [path.join(__dirname, f)], {env: Object.assign({}, process.env, {TEST_URL: `http://localhost:${PORT}`})});
    const timer = setTimeout(()=> ch.kill('SIGKILL'), 6*60*1000);
    const take = d=>{ const s = d.toString(); out += s; process.stdout.write(s.split('\n').filter(l=> !/agent-proxy|connect_rejected|For details|^- \S+:443/.test(l)).join('\n')); };
    ch.stdout.on('data', take); ch.stderr.on('data', take);
    ch.on('close', code=>{ clearTimeout(timer); resolve({code, out, secs: Math.round((Date.now()-t0)/1000)}); });
  });
}
(async()=>{
  const resumo = []; let falhou = false;
  for(const f of arquivos){
    console.log(`\n▶ ${f}`);
    const r = await rodarArquivo(f);
    const m = r.out.match(/RESULTADO .*?: (\d+)\/(\d+)/);
    const ok = r.code === 0 && m && m[1] === m[2];
    if(!ok) falhou = true;
    resumo.push(`${ok ? '✓' : '✗'} ${f.padEnd(24)} ${m ? `${m[1]}/${m[2]}` : 'não terminou'}  (${r.secs} s)`);
  }
  console.log('\n================ RESUMO ================');
  resumo.forEach(l=> console.log(l));
  console.log(falhou ? '\n✗ ALGUM TESTE FALHOU' : '\n✓ TUDO CERTO');
  server.close();
  process.exitCode = falhou ? 1 : 0;
})();
