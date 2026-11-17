/* Gera milhares de questões de todos os assuntos e níveis e confere cada uma:
   resposta é número válido (até 2 casas, ou fração), texto sem "undefined/NaN",
   passo a passo presente e 4 alternativas diferentes com só 1 certa.
   Também confere que o Desafio do Dia é igual pra mesma data. */
const {T, newPage, run, URL0} = require('./lib.js');
run(async b=>{
  const {p} = await newPage(b);
  await p.goto(URL0); await p.waitForTimeout(1200);
  const out = await p.evaluate(()=>{
    const probs = [];
    const bad = t=> /undefined|NaN|null|\[object|Infinity/.test(String(t));
    const check = (where, ex)=>{
      if(!ex || !ex.type) return probs.push(where+': sem questão');
      const txt = String(ex.question||'') + ' ' + (ex.steps||[]).join(' ');
      if(bad(txt)) probs.push(where+': texto quebrado → '+txt.slice(0,120));
      if(!ex.steps || !ex.steps.length) probs.push(where+': sem passo a passo');
      const ans = ex.type==='pair' ? ex.answer : ex.type==='xy' ? [ex.answer.x, ex.answer.y] : [ex.answer];
      ans.forEach(a=>{
        if(typeof a!=='number' || !isFinite(a)) probs.push(where+': resposta inválida '+a);
        else if(ex.displayAnswer===undefined && Math.abs(a*100-Math.round(a*100))>1e-6) probs.push(where+': resposta com mais de 2 casas '+a);
      });
      const opts = buildOptions(ex), labels = opts.map(o=>o.label);
      if(opts.length!==4 || new Set(labels).size!==4 || opts.filter(o=>o.ok).length!==1) probs.push(where+': alternativas ruins '+labels.join(' | '));
    };
    let total = 0;
    SUBJECTS.forEach(s=>['facil','medio','dificil'].forEach(lv=>{
      for(let k=0;k<120;k++){ try{ check(`${s.id}.${lv}`, s.gen[lv]()); total++; }catch(e){ probs.push(`${s.id}.${lv}: ERRO ${e.message}`); break; } }
    }));
    if(typeof MAIS_QUESTOES!=='undefined') Object.keys(MAIS_QUESTOES).forEach(id=>['facil','medio','dificil'].forEach(lv=>(MAIS_QUESTOES[id][lv]||[]).forEach((fn,i)=>{
      for(let k=0;k<80;k++){ try{ check(`${id}.${lv}[${i}]`, fn()); total++; }catch(e){ probs.push(`${id}.${lv}[${i}]: ERRO ${e.message}`); break; } }
    })));
    const sig = k=> dailyQuestions(k,'fund').map(q=>q.ex.question).join('|') + dailyQuestions(k,'em').map(q=>q.ex.question).join('|');
    const dias = ['2026-10-20','2026-11-07','2026-11-30'];
    const iguais = dias.every(k=> sig(k)===sig(k));
    return {probs:[...new Set(probs.map(x=>x.slice(0,140)))], total, assuntos:SUBJECTS.length, iguais};
  });
  T('Questões', `${out.total} questões de ${out.assuntos} assuntos sem problema`, out.probs.length===0, out.probs.slice(0,8).join(' ; '));
  T('Questões', 'Desafio do Dia: mesma data = mesmas perguntas', out.iguais);
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
