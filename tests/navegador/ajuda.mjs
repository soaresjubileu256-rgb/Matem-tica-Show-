// Utilidades dos testes de navegador: abre o app num perfil novo e isolado (sem dados reais).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iniciarServidor } from '../servidor.mjs';
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pw;
try{ pw = await import('playwright'); }catch(e){
  console.error('Playwright não encontrado. Instale com:  npm install  (e, se preciso,  npx playwright install chromium)'); process.exit(2);
}
export async function abrir(opts={}){
  const {srv, url} = await iniciarServidor(RAIZ);
  const exe = process.env.CHROMIUM_PATH;
  const browser = await pw.chromium.launch(exe ? {executablePath: exe} : {});
  const ctx = await browser.newContext({viewport: opts.viewport || {width:390, height:844}, serviceWorkers: opts.sw ? 'allow' : 'block'});
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e=> erros.push('pageerror: ' + e.message));
  page.on('console', m=>{ if(m.type()==='error') erros.push('console: ' + m.text()); });
  await page.goto(url);
  await page.waitForFunction(()=> typeof boot === 'function' && document.querySelector('#app').children.length);
  return {browser, ctx, page, erros, url, fechar: async ()=>{ await browser.close(); srv.close(); }};
}
/* cria uma conta pela própria tela de cadastro */
export async function criarConta(page, nome='Teste Automatico', senha='gato7lua9'){
  await page.waitForSelector('.authName');
  await page.fill('.authName', nome);
  await page.fill('.authPass', senha);
  await page.fill('.authPass2', senha);
  await page.click('.auth-go');
  await page.waitForFunction(()=> !!currentUser, null, {timeout:15000});
  await page.evaluate(()=>{ document.querySelectorAll('.gm-modal-bg, .tour-root').forEach(n=>n.remove()); if(typeof _tourClose==='function') _tourClose(true); });
}
/* placar simples */
export function placar(){
  const r = [];
  return {
    ok(nome, cond, extra){ r.push({nome, ok:!!cond, extra}); console.log(`${cond ? '  ✓' : '  ✗'} ${nome}${!cond && extra ? '  →  ' + extra : ''}`); },
    fim(){ const f = r.filter(x=>!x.ok); console.log(`\n${r.length - f.length}/${r.length} verificações passaram`); return f.length; },
  };
}
