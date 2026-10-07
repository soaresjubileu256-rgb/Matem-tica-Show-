/* =========================================================
   TELA APRENDER
      Lista de assuntos (agrupada por série e área, com busca e "continuar estudando")
      e a explicação de cada assunto: explicação, exemplos passo a passo,
      teste rápido e atalhos para praticar.
   ========================================================= */
/* assuntos já abertos e o último estudado (por conta) */
const LEARN_KEY_BASE = 'mathstudy-learn-v1';
function learnData(){ try{ const d = JSON.parse(localStorage.getItem(`${LEARN_KEY_BASE}:${currentUserId()}`)||'{}'); d.read = d.read||{}; return d; }catch(e){ return {read:{}}; } }
function saveLearnData(d){ try{ localStorage.setItem(`${LEARN_KEY_BASE}:${currentUserId()}`, JSON.stringify(d)); }catch(e){} }

/* ---------------- CONTENT LIST ---------------- */
function contentScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Aprender', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const d = learnData();
  const total = SUBJECTS.length, read = SUBJECTS.filter(s=>d.read[s.id]).length;
  c.appendChild(h(`<div class="lr-summary">
    <div class="lr-summary-txt"><b>${read ? `Você já estudou ${read} de ${total} assuntos` : 'Comece por qualquer assunto'}</b>
      <small>Leia a explicação, veja os exemplos e faça o teste rápido.</small></div>
    <div class="lr-ring" style="--p:${Math.round(read/total*100)}"><span>${Math.round(read/total*100)}%</span></div>
  </div>`));
  const last = d.last && SUBJECTS.find(s=>s.id===d.last);
  if(last){
    const cont = h(`<button type="button" class="ex-continue"><span class="ex-continue-sym">${last.sym}</span><span class="ex-continue-txt"><small>Continuar estudando</small><b>${last.name}</b></span><span class="ex-continue-go">▶</span></button>`);
    cont.onclick = ()=> go('subjectDetail', {subjectId:last.id});
    c.appendChild(cont);
  }
  c.appendChild(h(`<h3 class="home-sec" style="margin:14px 0 8px">Assuntos</h3>`));
  subjectSearchList(c, (s,u)=>{
    const row = h(`<button class="subject-row ${d.read[s.id]?'lr-read':''}" style="${unitStyle(u)}"><span class="sym">${s.sym}</span><span class="txt"><span class="name">${s.name}${d.read[s.id]?'<em class="lr-done" title="Já estudado">✓</em>':''}</span><span class="subj-meta">${BNCC_ANO[s.id]?`📚 ${BNCC_ANO[s.id]} · `:''}${masteryChip(masterySync(s.id))}${examTagsHTML(s.id, 2)}</span></span><span class="chev">›</span></button>`);
    row.onclick = ()=>go('subjectDetail', {subjectId:s.id});
    return row;
  });
  wrap.appendChild(c);
  return wrap;
}

function renderExampleBody(ex){
  return ex.columns
    ? contaArmada(ex.columns.nums, ex.columns.op, ex.columns.result, ex.columns.carries, ex.columns.marks)
    : ex.visual
    ? fracRow(ex.visual)
    : ex.qVisual
    ? ex.qVisual
    : `<div class="mono">${ex.text}</div>`;
}
/* exemplo que abre e fecha; os passos aparecem um de cada vez */
function learnExampleEl(ex, i, open){
  const steps = ex.steps || [];
  const box = h(`<div class="lr-ex ${open?'open':''}">
    <button type="button" class="lr-ex-head" aria-expanded="${!!open}"><span class="lr-ex-n">${i+1}</span><span class="lr-ex-t"><b>${ex.title}</b>${ex.text?`<small>${ex.text}</small>`:''}</span><span class="lr-ex-chev" aria-hidden="true">⌄</span></button>
    <div class="lr-ex-body example-box"><div class="lr-ex-vis">${renderExampleBody(ex)}</div>
      ${steps.length ? `<div class="lr-steps">${steps.map((st,k)=>`<div class="lr-step" ${k?'hidden':''}><span class="num">${k+1}</span><span class="txt">${st}</span></div>`).join('')}</div>
      <div class="lr-step-ctl"><button type="button" class="lr-next">Próximo passo</button><button type="button" class="lr-all">Ver tudo</button></div>` : ''}
    </div>
  </div>`);
  const head = box.querySelector('.lr-ex-head');
  head.onclick = ()=>{ const on = box.classList.toggle('open'); head.setAttribute('aria-expanded', on); };
  const items = [...box.querySelectorAll('.lr-step')];
  const ctl = box.querySelector('.lr-step-ctl');
  if(ctl){
    let shown = 1;
    const paint = ()=>{
      items.forEach((el,k)=>{ el.hidden = k>=shown; });
      const nb = ctl.querySelector('.lr-next');
      nb.textContent = `Próximo passo (${shown+1}/${items.length})`;
      ctl.hidden = shown >= items.length;
    };
    ctl.querySelector('.lr-next').onclick = ()=>{ shown++; paint(); };
    ctl.querySelector('.lr-all').onclick = ()=>{ shown = items.length; paint(); };
    paint();
  }
  return box;
}
/* teste rápido: uma questão fácil do assunto, sem contar no progresso */
function learnQuickCheck(s){
  const box = h(`<div class="lr-quick" id="lr-quick"><div class="lr-sec-h"><span>✅</span><b>Teste rápido</b><small>Não vale ponto: é só pra ver se entendeu.</small></div><div class="lr-quick-in"></div></div>`);
  const inner = box.querySelector('.lr-quick-in');
  let tries = 0;
  const gen = ()=>{
    for(let k=0;k<8;k++){ try{ const ex = s.gen.facil(); if(ex && ex.type==='single') return ex; }catch(e){ return null; } }
    return null;
  };
  function draw(){
    const ex = gen();
    if(!ex){ box.remove(); return; }
    tries = 0;
    let q;
    if(ex.columns) q = contaArmada(ex.columns.nums, ex.columns.op) + `<div class="ca-caption">= ?</div>`;
    else if(ex.visual) q = fracRow(ex.visual);
    else if(ex.qVisual) q = ex.qVisual;
    else q = `<div class="lr-quick-q">${ex.question.replace(/\n/g,'<br>')}</div>`;
    inner.innerHTML = `<div class="lr-quick-vis qtext stacked mono">${q}</div>
      <div class="lr-quick-row"><input type="text" inputmode="decimal" placeholder="Sua resposta" aria-label="Sua resposta"><button type="button" class="lr-quick-ok">Conferir</button></div>
      <div class="lr-quick-fb" hidden></div>`;
    const inp = inner.querySelector('input'), fb = inner.querySelector('.lr-quick-fb'), ok = inner.querySelector('.lr-quick-ok');
    const answer = ex.displayAnswer || fmt(ex.answer);
    const check = ()=>{
      if(!inp.value.trim()){ inp.classList.remove('ex-shake'); void inp.offsetWidth; inp.classList.add('ex-shake'); inp.focus(); return; }
      const right = checkAnswerValue(parseUserNumber(inp.value), ex.answer);
      tries++;
      fb.hidden = false;
      if(right){
        giveAnswerFeedback(true);
        fb.className = 'lr-quick-fb ok';
        fb.innerHTML = `<b>🎉 Acertou! ${answer} está certo.</b><div class="lr-quick-act"><button type="button" class="lr-again">Outra questão</button><button type="button" class="lr-go">Praticar de verdade ›</button></div>`;
        ok.disabled = true; inp.disabled = true;
      } else if(tries<2){
        giveAnswerFeedback(false);
        fb.className = 'lr-quick-fb bad';
        fb.innerHTML = `<b>Ainda não. Confira a conta e tente de novo!</b>`;
        inp.select();
      } else {
        giveAnswerFeedback(false);
        fb.className = 'lr-quick-fb bad';
        fb.innerHTML = `<b>A resposta é ${answer}. Veja como:</b><div class="lr-quick-steps">${(ex.steps||[]).map(st=>`<div>${st}</div>`).join('')}</div><div class="lr-quick-act"><button type="button" class="lr-again">Tentar outra</button></div>`;
        ok.disabled = true; inp.disabled = true;
      }
      const again = fb.querySelector('.lr-again'); if(again) again.onclick = draw;
      const goB = fb.querySelector('.lr-go'); if(goB) goB.onclick = ()=> go('exerciseDifficulty', {subjectId:s.id});
    };
    ok.onclick = check;
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
  }
  draw();
  return box;
}
function subjectDetailScreen(){
  const si = Math.max(0, SUBJECTS.findIndex(x=>x.id===state.subjectId));
  const s = SUBJECTS[si];
  { const d = learnData(); d.read[s.id] = d.read[s.id] || Date.now(); d.last = s.id; saveLearnData(d); }
  const wrap = document.createElement('div');
  wrap.appendChild(topbar(s.name, true, ()=>go('content')));
  const c = h(`<div class="content lr"></div>`);
  const examplesList = (s.examples || [s.example]).filter(Boolean);
  const words = String(s.learn||'').replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words/160 + examplesList.length*0.7));
  const m = masterySync(s.id);
  const hero = h(`<div class="lr-hero" style="${unitStyle(si)}">
    <span class="lr-hero-sym mono">${s.sym}</span>
    <div class="lr-hero-txt"><small>${BNCC_ANO[s.id] ? `📚 ${BNCC_ANO[s.id]}` : 'Aprender'}</small><h2>${s.name}</h2>
      <div class="lr-hero-meta"><span>⏱ ${mins} min</span><span>🧩 ${examplesList.length} exemplo${examplesList.length===1?'':'s'}</span>${masteryChip(m)}</div></div>
    <p class="lr-hero-next">${m.next}</p>
  </div>`);
  c.appendChild(hero);
  // atalhos pras partes da página
  const hasQuick = !!(s.gen && s.gen.facil);
  const nav = h(`<div class="lr-nav">${[['lr-explain','📖','Explicação'],['lr-examples','🧩','Exemplos'],hasQuick?['lr-quick','✅','Teste']:null,['lr-practice','🚀','Praticar']].filter(Boolean).map(([id,ico,t])=>`<button type="button" data-to="${id}"><span>${ico}</span>${t}</button>`).join('')}</div>`);
  nav.querySelectorAll('[data-to]').forEach(b=> b.onclick = ()=>{ const el = c.querySelector('#'+b.dataset.to); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); });
  c.appendChild(nav);
  { const ex = examsForSubject(s.id);
    if(ex.length){
      const box = h(`<div class="pv-subj"><div class="pv-subj-h">🎓 Cai nas provas</div><div class="pv-subj-l">${ex.map(x=>`<button type="button" class="pv-chip ${x.lvl}" style="--c:${x.exam.color}" data-e="${x.exam.id}">${x.exam.ico} ${x.exam.name}<small>${x.lvl==='muito'?'🔥 cai muito':x.lvl==='bastante'?'⭐ cai bastante':'✓ às vezes'}</small></button>`).join('')}</div></div>`);
      box.querySelectorAll('[data-e]').forEach(b=> b.onclick = ()=> go('examDetail', {examId:b.dataset.e}));
      c.appendChild(box);
    } }
  // explicação, com botão de ouvir
  const explain = h(`<section class="lr-card" id="lr-explain"><div class="lr-sec-h"><span>📖</span><b>Explicação</b><button type="button" class="lr-listen">🔊 Ouvir</button></div><div class="explain-card lr-body"></div></section>`);
  explain.querySelector('.lr-body').innerHTML = s.learn;
  const listen = explain.querySelector('.lr-listen');
  if(!('speechSynthesis' in window)) listen.remove();
  else listen.onclick = ()=>{
    if(speechSynthesis.speaking){ speechSynthesis.cancel(); listen.textContent = '🔊 Ouvir'; return; }
    const txt = speechText({question: explain.querySelector('.lr-body').innerText});
    if(speak(txt)){
      listen.textContent = '⏹ Parar';
      const t = setInterval(()=>{ if(!speechSynthesis.speaking || !document.body.contains(listen)){ clearInterval(t); listen.textContent = '🔊 Ouvir'; } }, 500);
    }
  };
  c.appendChild(explain);
  // exemplos
  const exSec = h(`<section class="lr-examples" id="lr-examples"><div class="lr-sec-h"><span>🧩</span><b>Exemplos</b><small>Toque para abrir e veja um passo de cada vez.</small></div></section>`);
  examplesList.forEach((ex,i)=> exSec.appendChild(learnExampleEl(ex, i, i===0)));
  c.appendChild(exSec);
  if(hasQuick) c.appendChild(learnQuickCheck(s));
  // praticar e ferramentas
  const cta = h(`<section class="lr-practice" id="lr-practice">
    <button class="btn primary sd-practice lr-go-big">🚀 Praticar este assunto</button>
    <div class="lr-tools">
      <button type="button" class="lr-tool sd-step"><span>🪜</span><b>Exemplo guiado</b><small>Resolva com ajuda</small></button>
      <button type="button" class="lr-tool sd-cards"><span>🃏</span><b>Cartões</b><small>Revisão rápida</small></button>
      <button type="button" class="lr-tool sd-note"><span>✏️</span><b>Caderno</b><small>Anote do seu jeito</small></button>
    </div>
  </section>`);
  cta.querySelector('.sd-practice').onclick = ()=>go('exerciseDifficulty', {subjectId:s.id});
  cta.querySelector('.sd-cards').onclick = ()=> chooseCardsLevel(s.id);
  cta.querySelector('.sd-step').onclick = ()=> startStepGuide(s.id, adaptiveDifficultyFor(progressSync(), s.id) || 'medio', 'subjectDetail');
  if(s.id==='geometria'){
    const labBtn = h(`<button class="btn secondary sd-lab lr-lab">🔺 Abrir o Laboratório de Geometria</button>`);
    labBtn.onclick = ()=> go('geoLab', {geoBack:'subjectDetail'});
    cta.querySelector('.lr-tools').before(labBtn);
  }
  cta.querySelector('.sd-note').onclick = ()=>{
    const mine = notesIndex().filter(n=>n.subjectId===s.id);
    if(mine.length){ state.noteFilter = s.id; go('notebook'); } else chooseNewPage(s.id);
  };
  c.appendChild(cta);
  // próximo assunto do mesmo grupo
  const g = SUBJECT_GROUPS.find(x=>x.ids.includes(s.id));
  const nextId = g && g.ids[g.ids.indexOf(s.id)+1];
  const nextS = nextId && SUBJECTS.find(x=>x.id===nextId);
  if(nextS){
    const nb = h(`<button type="button" class="lr-nextsubj"><small>Próximo assunto</small><b>${nextS.sym} ${nextS.name} ›</b></button>`);
    nb.onclick = ()=> go('subjectDetail', {subjectId:nextS.id});
    c.appendChild(nb);
  }
  wrap.appendChild(c);
  return wrap;
}
