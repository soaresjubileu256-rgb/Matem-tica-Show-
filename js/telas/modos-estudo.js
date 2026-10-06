/* =========================================================
   MODOS DE ESTUDO (aba Exercícios)
   1. Qual o próximo passo?: exemplo resolvido em que o aluno tenta cada passo antes de ver.
      (tentar lembrar/prever o passo ajuda a fixar mais do que só ler a resolução)
   2. Mistura do dia: 10 questões de vários assuntos já estudados, intercalados
      (misturar assuntos ajuda mais do que treinar um de cada vez).
   Todas as respostas passam por recordAnswer: contam no progresso, no histórico, no XP e no caderno de erros.
   ========================================================= */

/* ---------------- 1. QUAL O PRÓXIMO PASSO? ---------------- */
const STEP_EXAMPLES = 3;
const OPT_LETTERS = ['A','B','C','D','E'];
const stepPlain = t=> String(t||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function stepSetupScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🪜 Qual o próximo passo?', true, ()=>go('exercisesSubjects')));
  const c = h(`<div class="content me-screen"></div>`);
  c.appendChild(h(`<div class="me-hero sg"><span class="me-hero-ico">🪜</span><div><b>Aprenda pelo exemplo resolvido</b><p>O Pi resolve uma questão com você, mas antes de cada passo <b>você tenta adivinhar qual vem a seguir</b>. Tentar lembrar o passo ajuda a fixar muito mais do que só ler a resolução. No fim, é sua vez de resolver uma parecida.</p></div></div>`));
  let diff = state.stepDiff || 'medio';
  c.appendChild(h(`<div class="st-lbl">Dificuldade</div>`));
  c.appendChild(stSeg([['facil','Fácil'],['medio','Médio'],['dificil','Difícil']], diff, v=>{ diff = v; state.stepDiff = v; }));
  c.appendChild(h(`<div class="st-lbl" style="margin-top:16px">Escolha o assunto</div>`));
  subjectListGrouped(c, (s,u)=>{
    const row = h(`<button class="subject-row" style="${unitStyle(u)}"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}</span><span class="subj-meta">${masteryChip(masterySync(s.id))}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=> startStepGuide(s.id, diff, 'stepSetup');
    return row;
  });
  wrap.appendChild(c);
  return wrap;
}
/* alternativas erradas de um passo, na MESMA questão (só pra passos de texto simples):
   - resultado da conta errado (o último número muda um pouco)
   - operação trocada (+ ↔ −, × ↔ ÷), o erro de sinal mais comum */
function stepMutations(txt){
  if(/</.test(txt)) return [];
  const out = [];
  const nums = [...txt.matchAll(/\d+(?:,\d+)?/g)];
  if(nums.length){
    const m = nums[nums.length-1], raw = m[0], dec = (raw.split(',')[1]||'').length;
    const v = Number(raw.replace(',','.'));
    const alts = dec ? [v*1.1, v*0.9, v+1] : [v+1, v-1, v+10, v*2];
    for(const a of alts){
      const val = dec ? a.toFixed(dec).replace('.',',') : String(Math.round(a));
      if(val!==raw && !val.startsWith('-')){ out.push(txt.slice(0, m.index) + val + txt.slice(m.index + raw.length)); break; }
    }
  }
  const swaps = [[' + ',' − '],[' − ',' + '],[' - ',' + '],[' × ',' ÷ '],[' ÷ ',' × ']];
  for(const [a,b] of swaps){ if(txt.includes(a)){ out.push(txt.replace(a,b)); break; } }
  return out;
}
/* prepara um exemplo: para cada passo, 2 alternativas erradas — primeiro erros plausíveis da própria
   questão (conta errada, sinal trocado); se não der, o mesmo passo de outras questões geradas
   (mesma forma, números diferentes). Passo sem alternativas boas é só mostrado. */
function stepBuildExample(s, diff){
  let ex = null;
  for(let t=0; t<10; t++){ ex = s.gen[diff](); if(ex && ex.steps && ex.steps.length) break; }
  if(!ex || !ex.steps || !ex.steps.length) return null;
  const others = [];
  for(let t=0; t<14; t++){ try{ const o = s.gen[diff](); if(o && o.steps) others.push(o); }catch(e){} }
  const steps = ex.steps.map((txt,i)=>{
    const right = stepPlain(txt), seen = new Set([right]), wrong = [];
    const cand = stepMutations(txt).concat(others.map(o=>o.steps[i]), others.map(o=>o.steps[Math.min(i+1, o.steps.length-1)]));
    cand.forEach(w=>{ const p = stepPlain(w); if(w && p && !seen.has(p) && wrong.length<2){ seen.add(p); wrong.push(w); } });
    return {txt, opts: wrong.length===2 ? shuffle([{html:txt, ok:true}, ...wrong.map(w=>({html:w, ok:false}))]) : null};
  });
  return {ex, steps};
}
function startStepGuide(subjectId, diff, back){
  const s = SUBJECTS.find(x=>x.id===subjectId); if(!s) return;
  state.session = {kind:'step', sid:subjectId, diff, back:back||'stepSetup', index:0, total:STEP_EXAMPLES, stepOk:0, stepAsked:0, tryOk:0, log:[]};
  stepNextExample(state.session);
  go('stepGuide');
}
function stepNextExample(sess){
  const s = SUBJECTS.find(x=>x.id===sess.sid);
  sess.cur = stepBuildExample(s, sess.diff);
  sess.si = 0; sess.marks = []; sess.lastPick = null; sess.phase = 'steps';
  sess.tryEx = null; sess.tryOpts = null; sess.tryPick = null;
}
function stepGuideScreen(){
  const sess = state.session;
  if(!sess || sess.kind!=='step' || !sess.cur){ setTimeout(()=>go('stepSetup'),0); return document.createElement('div'); }
  const s = SUBJECTS.find(x=>x.id===sess.sid);
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🪜 Qual o próximo passo?', true, ()=> go(sess.back==='subjectDetail' ? 'subjectDetail' : 'stepSetup', {subjectId:sess.sid})));
  const c = h(`<div class="content me-screen"></div>`);
  wrap.appendChild(c);

  if(sess.index >= sess.total){
    gameSessionEnd(c, sess.tryOk, sess.total, `Você acertou ${sess.stepOk} de ${sess.stepAsked} passos e resolveu ${sess.tryOk} de ${sess.total} questões sozinho.`);
    c.appendChild(h(`<div class="me-sum"><div><b>${sess.stepOk}/${sess.stepAsked}</b><span>passos adivinhados</span></div><div><b>${sess.tryOk}/${sess.total}</b><span>questões resolvidas</span></div></div>`));
    const acts = h(`<div class="pt-actions"></div>`);
    const more = h(`<button class="btn primary">🪜 Mais exemplos</button>`); more.onclick = ()=> startStepGuide(sess.sid, sess.diff, sess.back);
    const prac = h(`<button class="btn secondary">Praticar ${escHTML(s.name)}</button>`); prac.onclick = ()=> go('exerciseDifficulty', {subjectId:sess.sid});
    const other = h(`<button class="btn secondary">Outro assunto</button>`); other.onclick = ()=> go('stepSetup');
    acts.appendChild(more); acts.appendChild(prac); acts.appendChild(other); c.appendChild(acts);
    return wrap;
  }

  const {ex, steps} = sess.cur;
  c.appendChild(h(`<div class="ch-runhead"><span class="ch-qn">${sess.index+1}<small>/${sess.total}</small></span><span class="ch-subj">${s.sym} ${escHTML(s.name)}</span><span class="ch-diff d-${sess.diff}">${({facil:'Fácil',medio:'Médio',dificil:'Difícil'})[sess.diff]}</span></div>`));
  const qh = questionHTML(ex);
  c.appendChild(h(`<div class="me-q sg-q"><div class="me-tema">${sess.phase==='try' ? '✍️ Sua vez' : '📖 Exemplo resolvido'}</div><div class="sg-qbody ${qh.stacked?'stacked':''}">${qh.html}</div></div>`));

  if(sess.phase==='steps'){
    // passos já mostrados
    const tl = h(`<div class="sg-steps"></div>`);
    steps.slice(0, sess.si).forEach((st,i)=>{
      const m = sess.marks[i];
      tl.appendChild(h(`<div class="sg-step ${m}"><span class="sg-n">${m==='ok'?'✓':m==='miss'?'👀':i+1}</span><div class="sg-t">${st.txt}</div></div>`));
    });
    if(sess.si) c.appendChild(tl);
    if(sess.lastPick) c.appendChild(h(`<div class="sg-msg ${sess.lastPick}">${sess.lastPick==='ok' ? pick(['✓ Isso! Era esse o passo.','✓ Mandou bem!','✓ Exatamente!']) : '👀 Quase! O passo certo ficou marcado acima. Veja por que ele vem agora.'}</div>`));
    if(sess.si < steps.length){
      const st = steps[sess.si];
      if(st.opts){
        const box = h(`<div class="sg-ask"><div class="sg-ask-h">🤔 Qual é o <b>passo ${sess.si+1}</b>?</div></div>`);
        st.opts.forEach(o=>{
          const b = h(`<button type="button" class="sg-opt">${o.html}</button>`);
          b.onclick = ()=>{
            sess.stepAsked++; if(o.ok) sess.stepOk++;
            sess.marks[sess.si] = o.ok ? 'ok' : 'miss'; sess.lastPick = o.ok ? 'ok' : 'miss';
            try{ playFeedbackSound(o.ok); }catch(e){}
            sess.si++; render();
          };
          box.appendChild(b);
        });
        c.appendChild(box);
      } else {
        const box = h(`<div class="sg-ask"><div class="sg-ask-h">Passo ${sess.si+1}: pense um pouco antes de ver 💭</div><button type="button" class="st-btn">Mostrar o passo ${sess.si+1}</button></div>`);
        box.querySelector('button').onclick = ()=>{ sess.marks[sess.si] = 'seen'; sess.lastPick = null; sess.si++; render(); };
        c.appendChild(box);
      }
    } else {
      c.appendChild(h(`<div class="sg-answer">✅ Resposta: <b>${escHTML(answerLabel(ex))}</b></div>`));
      const nx = h(`<button type="button" class="st-btn">✍️ Agora é sua vez: resolva uma parecida</button>`);
      nx.onclick = ()=>{
        sess.tryEx = s.gen[sess.diff](); sess.tryOpts = buildOptions(sess.tryEx); sess.phase = 'try'; render(); window.scrollTo(0,0);
      };
      c.appendChild(nx);
    }
    return wrap;
  }

  // fase "sua vez": questão parecida, de múltipla escolha
  const te = sess.tryEx, tq = questionHTML(te);
  c.querySelector('.sg-qbody').innerHTML = tq.html;
  c.querySelector('.sg-qbody').classList.toggle('stacked', !!tq.stacked);
  const opts = h(`<div class="me-opts"></div>`);
  sess.tryOpts.forEach((o,i)=>{
    const b = h(`<button type="button" class="me-opt"><span class="me-l">${OPT_LETTERS[i]}</span><span class="me-t"></span></button>`);
    b.querySelector('.me-t').textContent = o.label;
    if(sess.tryPick!=null){ b.disabled = true; if(o.ok) b.classList.add('right'); else if(sess.tryPick===i) b.classList.add('wrong'); else b.classList.add('dim'); }
    b.onclick = async ()=>{
      if(sess.tryPick!=null) return;
      sess.tryPick = i; if(o.ok) sess.tryOk++;
      try{ playFeedbackSound(o.ok); playFeedbackVibration(o.ok); }catch(e){}
      await recordAnswer(sess.sid, o.ok, {difficulty:sess.diff, ex:te});
      render();
    };
    opts.appendChild(b);
  });
  c.appendChild(opts);
  if(sess.tryPick!=null){
    const ok = sess.tryOpts[sess.tryPick].ok;
    c.appendChild(h(`<div class="me-fb ${ok?'ok':'bad'}"><b>${ok ? '✓ Resolveu sozinho!' : '✗ Não foi dessa vez'}</b><div class="me-sol"><div class="me-sol-h">Resolução</div>${solutionHTML(te)}</div></div>`));
    const nx = h(`<button type="button" class="st-btn me-next">${sess.index+1<sess.total ? 'Próximo exemplo ›' : 'Ver resultado 🏁'}</button>`);
    nx.onclick = ()=>{ sess.index++; if(sess.index<sess.total) stepNextExample(sess); render(); window.scrollTo(0,0); };
    c.appendChild(nx);
  }
  return wrap;
}

/* ---------------- 2. MISTURA DO DIA ---------------- */
const MIX_QTY = 10, MIX_SUBJECTS = 5, MIX_BONUS_XP = 20;
function mixToday(){ const m = loadGame().mix; return m && m.day===isoDay() ? m : null; }
/* assuntos da mistura: os já estudados, priorizando os praticados há mais tempo e os com menos acerto.
   Pra quem estudou pouco, completa com os primeiros assuntos do seu nível. A escolha vale o dia todo. */
function mixPlan(progress){
  const now = Date.now();
  let ids = Object.keys(progress).filter(id=> progress[id] && progress[id].attempted>0 && SUBJECTS.some(s=>s.id===id));
  if(ids.length < 3){
    const base = levelIds(dailyDefaultTrack()==='em' ? 'em' : 'fund').filter(id=> SUBJECTS.some(s=>s.id===id));
    base.forEach(id=>{ if(ids.length<4 && !ids.includes(id)) ids.push(id); });
  }
  return withSeed(Number(isoDay().replace(/-/g,''))*7+3, ()=>{
    const score = id=>{
      const d = progress[id];
      if(!d || !d.attempted) return 3 + Math.random();
      const days = d.last ? (now-d.last)/864e5 : 10, acc = d.correct/d.attempted;
      return Math.min(days, 14)/2 + (1-acc)*4 + Math.random();
    };
    return ids.map(id=>({id, s:score(id)})).sort((a,b)=>b.s-a.s).slice(0, MIX_SUBJECTS).map(x=>x.id);
  });
}
async function startMix(){
  const progress = await loadProgress();
  const ids = mixPlan(progress);
  if(!ids.length) return;
  startPersonalizedSession({subjectIds:ids, difficultyMode:'adaptativa', qty:MIX_QTY, focusWeak:false, progress, isMix:true});
}
/* chamado no fim da sessão de Mistura: registra o dia e dá o bônus uma vez por dia */
function mixFinish(sess){
  if(sess.mixSaved) return;
  sess.mixSaved = true;
  const g = loadGame(), first = !(g.mix && g.mix.day===isoDay());
  g.mix = {day:isoDay(), ok:sess.correct, n:sess.total, subjects:sess.subjects.length};
  saveGame();
  if(first){ gameAddXP(MIX_BONUS_XP); queueToast('🔀', 'Mistura do dia feita!', `+${MIX_BONUS_XP} XP de bônus`); }
}
function mixBannerEl(){
  const m = mixToday();
  const b = h(`<button type="button" class="alert-banner ${m?'':'mix'}"><span class="sym">🔀</span><span class="txt"><span class="title">Mistura do dia</span><span class="sub">${m ? `Feita: ${m.ok}/${m.n} certas ✓` : `${MIX_QTY} questões de vários assuntos misturados · +${MIX_BONUS_XP} XP`}</span></span><span class="chev">${m?'✓':'›'}</span></button>`);
  b.onclick = ()=> startMix();
  return b;
}
