// Abre TODAS as telas do app com uma conta de teste e confere: sem erro de JavaScript,
// a tela desenha algo e não fica presa em "Carregando…".
import { abrir, criarConta, placar } from './ajuda.mjs';
const t = placar();
const {page, erros, fechar} = await abrir();
await criarConta(page);
t.ok('cadastro pela tela cria a conta e entra no app', await page.evaluate(()=> !!currentUser && state.screen==='home'));
const telas = await page.evaluate(()=> Object.keys(SCREENS));
const sid = 'fracoes';
for(const tela of telas){
  const antes = erros.length;
  await page.evaluate(([tela, sid])=>{ try{ go(tela, {subjectId:sid, difficulty:'medio', examId:'enem'}); }catch(e){ console.error('go('+tela+'): '+e.message); } }, [tela, sid]);
  await page.waitForTimeout(350);
  const info = await page.evaluate(()=>({tela: state.screen, txt: document.querySelector('#app').innerText.trim()}));
  const preso = /^Carregando…$/.test(info.txt);
  t.ok(`tela ${tela}`, erros.length===antes && info.txt.length>0 && !preso, erros.slice(antes).join(' | ') || (preso ? 'presa em Carregando…' : 'vazia'));
  await page.evaluate(()=>{ document.querySelectorAll('.gm-modal-bg').forEach(n=>n.remove()); });
}
// "Plano da aula" em todos os assuntos: objetivo, BNCC (ou nota) e pré-requisitos que levam ao assunto
const planos = await page.evaluate(async ()=>{
  const ruins = [];
  for(const s of SUBJECTS){
    go('subjectDetail', {subjectId:s.id});
    const card = document.querySelector('.lp-card');
    if(!card || !/Objetivo/i.test(card.innerText) || !(card.querySelector('.lp-bncc') || card.querySelector('.lp-nota'))) ruins.push(s.id);
  }
  return ruins;
});
t.ok('"Plano da aula" nos 41 assuntos (objetivo + BNCC ou nota)', planos.length===0, planos.join(', '));
await page.evaluate(()=> go('subjectDetail', {subjectId:'porcentagem'}));
await page.click('.lp-pre[data-s="fracoes"]');
t.ok('tocar num pré-requisito abre aquele assunto', await page.evaluate(()=> state.screen==='subjectDetail' && state.subjectId==='fracoes'));
await fechar();
process.exit(t.fim() ? 1 : 0);
