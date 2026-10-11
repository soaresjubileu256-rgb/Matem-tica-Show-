// CSP sem violações em todas as telas, zoom liberado, e o app funcionando sem internet (service worker).
import { abrir, criarConta, placar } from './ajuda.mjs';
const t = placar();
const {page, ctx, erros, fechar} = await abrir({sw:true});
const violacoes = [];
page.on('console', m=>{ if(/Content Security Policy|Refused to/i.test(m.text())) violacoes.push(m.text()); });
await page.evaluate(()=> document.addEventListener('securitypolicyviolation', e=> console.error('Refused to ' + e.violatedDirective + ' ' + e.blockedURI)));
await criarConta(page);
const csp = await page.$eval('meta[http-equiv="Content-Security-Policy"]', m=>m.content).catch(()=>null);
t.ok('index.html tem Content-Security-Policy sem scripts embutidos', csp && /script-src 'self'(;|$)/.test(csp) && !(await page.$('script:not([src])')));
const vp = await page.$eval('meta[name=viewport]', m=>m.content);
t.ok('zoom com os dedos liberado (sem maximum-scale)', !/maximum-scale|user-scalable=no/.test(vp));
// passa por todas as telas procurando violação de CSP
const telas = await page.evaluate(()=> Object.keys(SCREENS));
for(const tela of telas){ await page.evaluate(tl=>{ try{ go(tl, {subjectId:'fracoes', examId:'enem'}); }catch(e){} }, tela); await page.waitForTimeout(120); }
await page.evaluate(()=>{ startBankExam('etec'); state.session.cur=1; render(); }); await page.waitForTimeout(200);
t.ok('nenhuma violação de CSP em todas as telas', violacoes.length===0, violacoes.slice(0,3).join(' | '));
// offline: espera o service worker assumir e recarrega sem rede
await page.waitForFunction(()=> navigator.serviceWorker && navigator.serviceWorker.controller, null, {timeout:15000}).catch(()=>{});
const temSW = await page.evaluate(()=> !!(navigator.serviceWorker && navigator.serviceWorker.controller));
t.ok('service worker ativo', temSW);
await page.waitForTimeout(1500); // instalação guarda os arquivos
await ctx.setOffline(true);
await page.reload({waitUntil:'domcontentloaded'}).catch(()=>{});
await page.waitForFunction(()=> typeof boot==='function' && !!currentUser, null, {timeout:15000}).catch(()=>{});
t.ok('sem internet: o app abre, com a conta e o progresso', await page.evaluate(()=> typeof boot==='function' && !!currentUser).catch(()=>false));
await page.evaluate(()=>{ clearBankActive(); return startBankExam('enem'); }).catch(()=>{}); await page.waitForTimeout(150);
t.ok('sem internet: simulado com figuras funciona', await page.evaluate(()=> state.screen==='bankExamRun').catch(()=>false));
await ctx.setOffline(false);
t.ok('sem erros de JavaScript', erros.length===0, erros.join(' | '));
await fechar();
process.exit(t.fim() ? 1 : 0);
