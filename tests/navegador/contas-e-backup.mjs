// Contas, senha, backup, restauração, desfazer e exclusão — pela interface, num perfil de teste isolado.
import fs from 'node:fs';
import { abrir, criarConta, placar } from './ajuda.mjs';
const t = placar();
const {page, erros, fechar} = await abrir();
const okModal = async ()=>{ await page.waitForSelector('.gm-confirm-ok'); await page.click('.gm-confirm-ok'); };

// 1) cadastro grava senha com PBKDF2 + sal
await criarConta(page, 'Luna Teste', 'gato7lua9');
const conta = await page.evaluate(()=> JSON.parse(localStorage.getItem('mathstudy-users-v1'))[0]);
t.ok('conta nova usa PBKDF2 com sal (sem senha nem SHA-256 simples guardados)', conta.pw && conta.pw.alg==='pbkdf2-sha256' && conta.pw.salt.length===32 && !conta.passHash && !JSON.stringify(conta).includes('gato7lua9'));

// 2) gera progresso, sai e entra de novo (senha errada e certa)
await page.evaluate(async ()=>{ for(let i=0;i<6;i++) await recordAnswer('fracoes', i%2===0, {difficulty:'medio'}); const g = loadGame(); g.xp = 777; saveGame(); saveTabData({facts:{'6x7':{ok:2}}, best:{}}); newNotePage({title:'Página do teste'}); });
await page.evaluate(()=> doLogout());
await page.waitForSelector('.acc-name, .authName');
const sel = await page.$('.acc-pick, .acc-card, button:has(.acc-name)'); if(sel) await sel.click();
await page.waitForSelector('.authPass');
await page.fill('.authPass', 'errada123'); await page.click('.auth-go');
await page.waitForFunction(()=> /incorreta/i.test(document.querySelector('.authErrorBox')?.innerText||''));
t.ok('senha errada é recusada', await page.evaluate(()=> !currentUser));
await page.fill('.authPass', 'gato7lua9'); await page.click('.auth-go');
await page.waitForFunction(()=> !!currentUser, null, {timeout:15000});
t.ok('senha certa entra e o progresso continua', await page.evaluate(()=> loadGame().xp===777));

// 3) conta do formato antigo (SHA-256 sem sal) entra e é convertida
await page.evaluate(async ()=>{
  const list = await loadUsers();
  list.push({id:'conta antiga', name:'Conta Antiga', passHash: await hashPasswordLegacy('pizza42azul')});
  await saveUsers(list); doLogout();
});
await page.waitForSelector('.acc-name');
await page.evaluate(()=>{ const b = [...document.querySelectorAll('.acc-name')].find(x=>x.textContent==='Conta Antiga'); b.closest('button, .acc-card, [role=button]').click(); });
await page.waitForSelector('.authPass'); await page.fill('.authPass', 'pizza42azul'); await page.click('.auth-go');
await page.waitForFunction(()=> currentUser && currentUser.id==='conta antiga', null, {timeout:15000});
const conv = await page.evaluate(()=> JSON.parse(localStorage.getItem('mathstudy-users-v1')).find(u=>u.id==='conta antiga'));
t.ok('conta antiga entra com a senha e é convertida para PBKDF2', conv.pw && !conv.passHash);
await page.evaluate(()=>{ document.querySelectorAll('.gm-modal-bg').forEach(n=>n.remove()); doLogout(); });
await page.waitForSelector('.acc-name');
await page.evaluate(()=>{ const b = [...document.querySelectorAll('.acc-name')].find(x=>x.textContent==='Luna Teste'); b.closest('button, .acc-card, [role=button]').click(); });
await page.waitForSelector('.authPass'); await page.fill('.authPass', 'gato7lua9'); await page.click('.auth-go');
await page.waitForFunction(()=> currentUser && currentUser.id==='luna teste', null, {timeout:15000});
await page.evaluate(()=> document.querySelectorAll('.gm-modal-bg').forEach(n=>n.remove()));

// 4) salvar uma cópia (download) — o arquivo traz TODAS as chaves da conta
await page.evaluate(()=> go('settings')); await page.waitForSelector('.st-act');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.st-act:has-text("Salvar uma cópia")')]);
const arq = await dl.path(); const backup = JSON.parse(fs.readFileSync(arq, 'utf8'));
t.ok('backup formato 2 com caderno, tabuada e jogo', backup.formato===2 && backup.conta.chaves['mathstudy-tabuada-v1'] && backup.conta.chaves['mathstudy-notes-v1'] && Object.keys(backup.conta.paginas).length===1 && backup.progress);

// 5) muda tudo e restaura o arquivo
await page.evaluate(async ()=>{ await resetCurrentUserProgress(); });
t.ok('"Começar do zero" apagou o XP', await page.evaluate(()=> loadGame().xp===0));
await page.evaluate(()=> go('settings')); await page.waitForSelector('input[type=file]', {state:'attached'});
await page.setInputFiles('input[type=file]', arq);
await page.waitForSelector('.gm-confirm-ok');
const msg = await page.$eval('.gm-modal p', e=>e.innerText);
t.ok('confirmação diz de qual conta é a cópia e que dá para desfazer', /Luna Teste/.test(msg) && /desfazer/i.test(msg));
await okModal();
await page.waitForFunction(()=> loadGame().xp===777, null, {timeout:5000}).catch(()=>{});
t.ok('restaurar trouxe XP, tabuada e caderno de volta', await page.evaluate(()=> loadGame().xp===777 && Object.keys(tabData().facts).includes('6x7') && notesIndex().length===1));

// 6) desfazer a restauração
await page.evaluate(()=> go('settings')); await page.waitForSelector('.st-undo');
await page.click('.st-undo'); await okModal();
await page.waitForFunction(()=> loadGame().xp===0, null, {timeout:5000}).catch(()=>{});
t.ok('"Desfazer a última restauração" volta ao estado anterior', await page.evaluate(()=> loadGame().xp===0));

// 7) renomear leva tudo junto

const ren = await page.evaluate(async (b)=>{ await importProgressData(b); const r = await renameCurrentUser('Luna Nova'); return r.ok && loadGame().xp===777 && notesIndex().length===1 && userStorageKeys('luna teste').length===0; }, backup);
t.ok('renomear leva XP, caderno e todas as chaves', ren);

// 8) excluir a conta pela tela (pede a senha)
await page.evaluate(()=> go('settings')); await page.waitForSelector('.st-del');
await page.click('.st-del summary'); await page.fill('#stDelPass', 'senhaerrada1'); await page.click('.st-del .st-reset'); await okModal();
await page.waitForFunction(()=> /incorreta/i.test(document.querySelector('.st-del .authErrorBox').innerText));
t.ok('excluir com senha errada é recusado', await page.evaluate(()=> !!currentUser));
await page.fill('#stDelPass', 'gato7lua9'); await page.click('.st-del .st-reset'); await okModal();
await page.waitForFunction(()=> !currentUser, null, {timeout:15000});
const sobrou = await page.evaluate(()=>({contas: JSON.parse(localStorage.getItem('mathstudy-users-v1')).map(u=>u.id), chaves: Object.keys(localStorage).filter(k=>k.includes('luna'))}));
t.ok('conta excluída sem deixar dados; a outra conta continua', sobrou.chaves.length===0 && sobrou.contas.join()==='conta antiga', JSON.stringify(sobrou));

t.ok('sem erros de JavaScript', erros.length===0, erros.join(' | '));
await fechar();
process.exit(t.fim() ? 1 : 0);
