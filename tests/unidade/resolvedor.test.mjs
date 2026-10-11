// "Resolver questão" (js/base/resolvedor.js): contas com resultado conhecido, inclusive casos que
// já deram errado (sinal de menos antes de potência, módulo) e casos extremos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregarApp } from './carregar.mjs';
const app = carregarApp();
const conta = app.$('evalArithmeticWithSteps'), etapas = app.$('evalArithmeticWithStages'), resolver = app.$('solveQuestion');
const v = e => conta(e).result;

test('precedência: potência antes do sinal de menos (−3² = −9)', ()=>{
  assert.equal(v('-3^2'), -9);
  assert.equal(v('(-3)^2'), 9);
  assert.equal(v('2^-1'), 0.5);
  assert.equal(v('-2^2+7'), 3);
  assert.equal(v('10 - -3'), 13);
  assert.equal(v('6 / -2'), -3);
  assert.equal(v('2*-3'), -6);
  assert.equal(etapas('-3^2').result, -9);
});
test('ordem das operações e parênteses', ()=>{
  assert.equal(v('2+3*4'), 14);
  assert.equal(v('(2+3)*4'), 20);
  assert.equal(v('2(3+4)'), 14);
  assert.equal(v('2^3^2'), 512);       // potência é associativa à direita
  assert.equal(v('100/10/2'), 5);       // divisão é associativa à esquerda
  assert.equal(v('8-3-2'), 3);
  assert.equal(v('1.5*4'), 6);
});
test('módulo |x|', ()=>{
  assert.equal(v('|4*0-15|'), 15);
  assert.equal(v('|-7| + |3-5|'), 9);
  assert.equal(v('2|-3|'), 6);
  assert.equal(etapas('|2-9|*2').result, 14);
});
test('divisão por zero não vira número', ()=>{ assert.ok(Number.isNaN(v('5/0'))); });
test('funções: f(x) com sinal e módulo', ()=>{
  assert.match(resolver('f(x) = −x² + 7. Calcule f(3).').final, /f\(3\) = -2$/);
  assert.match(resolver('f(x) = |4x − 15|. Calcule f(0).').final, /f\(0\) = 15$/);
  assert.match(resolver('f(x) = x² + 3x − 3. Calcule f(2).').final, /f\(2\) = 7$/);
});
test('equações e outros tipos', ()=>{
  assert.equal(resolver('2x + 3 = 7').final, 'x = 2');
  assert.match(resolver('x² - 5x + 6 = 0').final, /3.*2|2.*3/);
  assert.equal(String(resolver('15% de 200').final), '30');
  assert.equal(String(resolver('12 × 3').final), '36');
});
