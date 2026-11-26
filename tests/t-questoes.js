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
    if(typeof MAIS_QUESTOES_2!=='undefined') Object.keys(MAIS_QUESTOES_2).forEach(id=>{
      if(!SUBJECTS.find(s=>s.id===id)) probs.push('lote 2: assunto não existe '+id);
      ['facil','medio','dificil'].forEach(lv=>(MAIS_QUESTOES_2[id][lv]||[]).forEach((fn,i)=>{
        for(let k=0;k<150;k++){ try{ check(`lote2 ${id}.${lv}[${i}]`, fn()); total++; }catch(e){ probs.push(`lote2 ${id}.${lv}[${i}]: ERRO ${e.message}`); break; } }
      }));
    });
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
  // Desafios do Dia de antes do lote 2 têm que sair iguais aos de um app sem o lote 2
  const dias = ['2026-10-20','2026-11-10','2026-11-20','2026-11-26'];
  const sigs = pg=> pg.evaluate(ds=> ds.map(k=> dailyQuestions(k,'fund').map(q=>q.ex.question+'='+q.ex.answer).join('|') + dailyQuestions(k,'em').map(q=>q.ex.question+'='+q.ex.answer).join('|')), dias);
  const {p: p1} = await newPage(b); await p1.goto(URL0); await p1.waitForTimeout(1200);
  const com = await sigs(p1);   // página nova: o sorteio pesado acima não interfere
  const {p: p2} = await newPage(b);
  await p2.route('**/mais-questoes-2.js*', r=> r.fulfill({status:200, contentType:'application/javascript', body:'/* sem lote 2 */'}));
  await p2.goto(URL0); await p2.waitForTimeout(1200);
  const sem = await sigs(p2);
  T('Questões', 'Desafios do Dia antigos não mudam com as questões novas', com.every((x,i)=> x===sem[i]), dias.filter((d,i)=> com[i]!==sem[i]).join(', '));
  const novos = await p.evaluate(()=>{ const n = Object.values(MAIS_QUESTOES_2).reduce((t,o)=> t + ['facil','medio','dificil'].reduce((u,l)=> u + (o[l]||[]).length, 0), 0); return n; });
  T('Questões', `lote 2 com ${novos} tipos novos de pergunta`, novos >= 100, novos);
  T('Geral', 'sem erros JS', p._errs.length===0, p._errs.join(' | '));
});
