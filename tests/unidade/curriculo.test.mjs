// Currículo (js/assuntos/curriculo.js): objetivos, pré-requisitos sem ciclo e códigos da BNCC conferidos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregarApp } from './carregar.mjs';
const app = carregarApp();
const SUBJECTS = app.$('SUBJECTS'), CUR = app.$('CURRICULO'), HAB = app.$('BNCC_HABILIDADES');
const ids = SUBJECTS.map(s=>s.id);
// códigos procurados e NÃO confirmados em 2 fontes: não podem entrar (ver docs/BNCC.md)
const REJEITADOS = ['EM13MAT406'];

test('todo assunto tem currículo com objetivo, e não há entradas sobrando', ()=>{
  assert.equal(ids.filter(id=> !CUR[id]).join(), '');
  assert.equal(Object.keys(CUR).filter(id=> !ids.includes(id)).join(), '');
  for(const id of ids) assert.ok(CUR[id].objetivo && CUR[id].objetivo.length > 30, id);
});
test('pré-requisitos existem, não apontam para si mesmos e não formam ciclos', ()=>{
  for(const id of ids){
    for(const p of CUR[id].prereqs){ assert.ok(ids.includes(p), `${id} → ${p} não existe`); assert.notEqual(p, id); }
  }
  const estado = {};
  const visita = (id, caminho)=>{
    if(estado[id]==='feito') return;
    assert.notEqual(estado[id], 'visitando', `ciclo: ${[...caminho, id].join(' → ')}`);
    estado[id] = 'visitando';
    for(const p of CUR[id].prereqs) visita(p, [...caminho, id]);
    estado[id] = 'feito';
  };
  ids.forEach(id=> visita(id, []));
});
test('códigos da BNCC: formato certo, ano coerente, 2+ fontes, todos usados', ()=>{
  const usados = new Set(ids.flatMap(id=> CUR[id].bncc));
  for(const code of usados) assert.ok(HAB[code], `${code} usado mas não conferido em BNCC_HABILIDADES`);
  for(const [code, h] of Object.entries(HAB)){
    assert.match(code, /^(EF0[1-9]MA\d{2}|EM13MAT[1-5]\d{2})$/);
    if(code.startsWith('EF')) assert.equal(h.ano, `${Number(code.slice(2,4))}º ano`, code);
    else assert.equal(h.ano, 'Ensino Médio', code);
    assert.ok(h.fontes.length >= 2, `${code} precisa de 2 ou mais fontes`);
    assert.ok(h.resumo.length > 30, code);
    assert.ok(usados.has(code), `${code} conferido mas não usado`);
    assert.ok(!REJEITADOS.includes(code), `${code} não foi confirmado`);
  }
});
test('assunto sem código da BNCC explica por quê (nada inventado)', ()=>{
  for(const id of ids) if(!CUR[id].bncc.length) assert.ok(CUR[id].nota, `${id} sem bncc e sem nota`);
});
