// Regras pedagógicas: nível de domínio (acerto casual × consistência × retenção) e revisão do caderno de erros.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregarApp } from './carregar.mjs';
const app = carregarApp();
const masteryOf = app.$('masteryOf');
const resp = (n, ok, h, d)=> Array.from({length:n}, (_, i)=>({ok: typeof ok==='function' ? ok(i) : ok, h: typeof h==='function' ? h(i) : h, d}));
const nivel = rec=> masteryOf({attempted:rec.length, correct:rec.filter(r=>r.ok).length, recent:rec}).lvl;

test('sem respostas → Não iniciado; menos de 5 → Aprendendo mesmo acertando tudo (acerto casual)', ()=>{
  assert.equal(masteryOf(undefined).lvl, 0);
  assert.equal(nivel(resp(4, true, true, 100)), 1);
});
test('faixas de acerto: 60% → Praticando, 80% → Proficiente', ()=>{
  assert.equal(nivel(resp(10, i=> i<5, false, 100)), 1);   // 50%
  assert.equal(nivel(resp(10, i=> i<6, false, 100)), 2);   // 60%
  assert.equal(nivel(resp(10, i=> i<8, false, 100)), 3);   // 80%
});
test('Dominado exige acertos em 2 dias diferentes (retenção), não 10 seguidas num dia só', ()=>{
  const umDia = resp(10, true, i=> i<2, 100);
  assert.equal(nivel(umDia), 3);
  assert.match(masteryOf({attempted:10, correct:10, recent:umDia}).next, /outro dia/);
  const doisDias = umDia.map((r, i)=> Object.assign({}, r, {d: i<5 ? 99 : 100}));
  assert.equal(nivel(doisDias), 4);
});
test('Dominado também exige 2 acertos no difícil', ()=>{
  const r = resp(10, true, false, 100).map((x, i)=> Object.assign({}, x, {d: i<5 ? 99 : 100}));
  assert.equal(nivel(r), 3);
});
test('dados antigos (sem dia guardado) continuam valendo: quem era Dominado continua', ()=>{
  const antigo = resp(10, true, i=> i<2, undefined);
  assert.equal(nivel(antigo), 4);
});
test('cada resposta registrada guarda o dia', async ()=>{
  const a = carregarApp();
  a.$('currentUser = {id:"t", name:"T"}');
  await a.$('recordAnswer')('fracoes', true, {difficulty:'dificil'});
  const d = (await a.$('loadProgress')()).fracoes.recent[0];
  assert.equal(d.d, a.$('localDayNumber()'));
  assert.equal(d.h, true);
});
