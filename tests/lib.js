/* Utilidades comuns dos testes automáticos (não fazem parte do app).
   Cada teste abre o app num navegador de verdade (Chromium, via Playwright), como um aluno usaria. */
const path = require('path'), fs = require('fs');
function loadPlaywright(){
  try{ return require('playwright'); }catch(e){}
  // instalado globalmente (npm i -g playwright)
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const {chromium, devices} = loadPlaywright();
const URL0 = (process.env.TEST_URL || 'http://localhost:8790') + '/index.html';
const R = [];
const fileName = path.basename(process.argv[1] || 'teste');

/* registra um resultado: T('Área', 'o que deveria acontecer', true/false, 'detalhe se falhar') */
function T(area, nome, ok, det){ R.push({area, nome, ok: ok===true, det: det===undefined ? '' : String(det).slice(0,300)}); }

async function browser(){
  const exe = process.env.CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  return chromium.launch(exe ? {executablePath: exe} : {});
}
/* página com tamanho de celular; guarda os erros de JavaScript em p._errs */
async function newPage(b, opts){
  const ctx = await b.newContext(Object.assign({...devices['Pixel 7']}, opts||{}));
  const p = await ctx.newPage();
  p.setDefaultTimeout(8000);
  p._errs = [];
  p.on('pageerror', e=> p._errs.push(e.message));
  p.on('dialog', d=> d.dismiss().catch(()=>{}));
  return {ctx, p};
}
/* cria uma conta nova e cai no Início (sem o tour) */
async function register(p, name, pass){
  pass = pass || 'gato7lua';
  await p.goto(URL0 + '?t=' + Date.now()); await p.waitForTimeout(1200);
  const reg = await p.$('text=Criar nova conta'); if(reg){ await reg.click(); await p.waitForTimeout(300); }
  const ins = await p.$$('.auth-card input');
  await ins[0].fill(name); await ins[1].fill(pass); await ins[2].fill(pass);
  await p.click('text=Criar conta e começar'); await p.waitForTimeout(1800);
  await p.evaluate(()=>{ try{ markTutorialDone(); }catch(e){} try{ _tourActive = false; }catch(e){} document.querySelectorAll('.gm-modal-bg,.tour-root,.gm-toast').forEach(e=>e.remove()); });
}
/* fecha janelas, avisos e confete que atrapalham os cliques */
const clean = p=> p.evaluate(()=> document.querySelectorAll('.gm-modal-bg,.tour-root,.gm-toast,#gm-confetti').forEach(e=>e.remove()));
async function goScreen(p, screen, extra){ await p.evaluate(([s,e])=> go(s, e||{}), [screen, extra]); await p.waitForTimeout(600); await clean(p); }

/* imprime o resumo e devolve uma linha que o rodar.js entende */
function finish(){
  const fail = R.filter(r=>!r.ok);
  R.forEach(r=> console.log(`${r.ok ? '  ✓' : '  ✗'} [${r.area}] ${r.nome}${r.ok ? '' : `  →  ${r.det}`}`));
  console.log(`RESULTADO ${fileName}: ${R.length - fail.length}/${R.length}`);
  process.exitCode = fail.length ? 1 : 0;
}
/* roda o teste e garante que o navegador fecha mesmo se der erro */
function run(fn){
  (async()=>{
    const b = await browser();
    try{ await fn(b); }
    catch(e){ T('Erro', 'o teste rodou até o fim', false, e.message); }
    finally{ await b.close(); finish(); }
  })();
}
module.exports = {T, R, browser, newPage, register, clean, goScreen, run, URL0};
