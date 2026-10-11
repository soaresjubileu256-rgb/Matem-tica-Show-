// Testa TODOS os geradores de questões (41 assuntos × 3 dificuldades) com muitas questões sorteadas:
// 1) estrutura: resposta válida, passos da resolução, 4 alternativas sem repetição e só uma correta;
// 2) conferência independente: quando o enunciado é uma conta/equação, o "Resolver questão"
//    (js/base/resolvedor.js, código separado dos geradores) precisa chegar à MESMA resposta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregarApp } from './carregar.mjs';

const app = carregarApp();
const SUBJECTS = app.$('SUBJECTS'), buildOptions = app.$('buildOptions'), solveQuestion = app.$('solveQuestion');
const N = Number(process.env.QTD_QUESTOES || 150);
const DIFS = ['facil','medio','dificil'];

function numerosDoTexto(t){
  const s = String(t).replace(/<[^>]+>/g,' ').replace(/−/g,'-').replace(/(\d)\.(\d{3})(?!\d)/g,'$1$2');
  const out = [];
  for(const m of s.matchAll(/-?\d+(?:,\d+)?(?:\s*\/\s*-?\d+(?:,\d+)?)?/g)){
    const p = m[0].replace(/\s/g,'').replace(/,/g,'.').split('/');
    const v = p.length===2 ? Number(p[0])/Number(p[1]) : Number(p[0]);
    if(isFinite(v)) out.push(v);
  }
  return out;
}
function esperado(ex){
  if(ex.type==='pair') return ex.answer.map(Number);
  if(ex.type==='xy') return [Number(ex.answer.x), Number(ex.answer.y)];
  return [Number(ex.answer)];
}
const perto = (a, b)=> Math.abs(a-b) <= 1e-6 * Math.max(1, Math.abs(b)) || Math.abs(a-b) < 0.006;

const conferidas = {total:0, comResolvedor:0};
for(const s of SUBJECTS){
  for(const d of DIFS){
    test(`${s.id} · ${d}`, ()=>{
      for(let i=0; i<N; i++){
        const ex = s.gen[d]();
        const ctx = `${s.id}/${d} #${i}: ${String(ex.question).slice(0,90)}`;
        assert.ok(['single','pair','xy'].includes(ex.type), `tipo desconhecido (${ex.type}) — ${ctx}`);
        assert.ok(String(ex.question||'').trim() || ex.qVisual, `sem enunciado — ${ctx}`);
        for(const v of esperado(ex)) assert.ok(Number.isFinite(v), `resposta não numérica (${JSON.stringify(ex.answer)}) — ${ctx}`);
        assert.ok(Array.isArray(ex.steps) && ex.steps.length > 0, `sem passo a passo — ${ctx}`);
        const ops = buildOptions(ex);
        const labels = ops.map(o=>o.label);
        assert.equal(ops.filter(o=>o.ok).length, 1, `precisa de exatamente 1 alternativa correta (${labels.join(' | ')}) — ${ctx}`);
        assert.equal(new Set(labels).size, labels.length, `alternativas repetidas (${labels.join(' | ')}) — ${ctx}`);
        assert.ok(ops.length >= 3, `poucas alternativas (${ops.length}) — ${ctx}`);
        conferidas.total++;
        // conferência independente pelo resolvedor (só quando ele entende o enunciado)
        if(typeof ex.question === 'string' && !ex.noSolverCheck){
          let r = null; try{ r = solveQuestion(ex.question); }catch(e){}
          if(r && r.final !== undefined && !/divis[aã]o por zero/i.test(r.kind||'')){
            const achados = numerosDoTexto(r.final);
            const faltando = esperado(ex).filter(v=> !achados.some(a=> perto(a, v)));
            if(achados.length){
              conferidas.comResolvedor++;
              assert.equal(faltando.length, 0, `gerador diz ${JSON.stringify(ex.answer)}, resolvedor diz "${r.final}" — ${ctx}`);
            }
          }
        }
      }
    });
  }
}
test('resumo', ()=>{ console.log(`   questões conferidas: ${conferidas.total}; também conferidas pelo resolvedor: ${conferidas.comResolvedor}`); });
