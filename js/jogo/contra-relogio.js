/* =========================================================
   Contra o relógio — treino cronometrado POR ASSUNTO.
   Escolhe um assunto (qualquer um de SUBJECTS) e a dificuldade e tem 60 segundos
   pra acertar o máximo de questões. Acerto: +1 ponto. Erro: −3 segundos e mostra a
   resposta certa por um instante. Recorde por assunto e dificuldade em
   g.speedBests['<assunto>:<dificuldade>']. A última escolha fica em
   localStorage 'mathstudy-speed-last'.
   ========================================================= */
const SPEED_SECONDS = 60;
const SPEED_PENALTY = 3;
const SPEED_DIFFS = [['facil','🟢','Fácil'], ['medio','🟡','Médio'], ['dificil','🔴','Difícil']];
const SPEED_LAST_KEY = 'mathstudy-speed-last';

function speedBests(g){ g.speedBests = g.speedBests || {}; return g.speedBests; }
const speedKey = (subj, diff)=> `${subj}:${diff}`;
const speedNorm = s=> String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const speedPlain = html=> String(html||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();

function speedLoadLast(){
  let last = {};
  try{ last = JSON.parse(localStorage.getItem(SPEED_LAST_KEY) || '{}') || {}; }catch(e){}
  const subj = SUBJECTS.some(s=>s.id===last.subj) ? last.subj : SUBJECTS[0].id;
  const diff = SPEED_DIFFS.some(d=>d[0]===last.diff) ? last.diff : 'facil';
  return {subj, diff};
}
function speedSaveLast(subj, diff){
  try{ localStorage.setItem(SPEED_LAST_KEY, JSON.stringify({subj, diff})); }catch(e){}
}
/* assuntos agrupados por nível (Fundamental / Médio); quem não tiver grupo vai pra "Outros" */
function speedSubjectSections(){
  const seen = new Set(), out = [];
  SUBJECT_LEVELS.forEach(lv=>{
    const groups = SUBJECT_GROUPS.filter(gr=>gr.level===lv.id).map(gr=>({name:gr.name,
      subjects: gr.ids.map(id=>SUBJECTS.find(s=>s.id===id)).filter(s=>s && s.gen && !seen.has(s.id) && seen.add(s.id))}))
      .filter(gr=>gr.subjects.length);
    if(groups.length) out.push({level:lv, groups});
  });
  const rest = SUBJECTS.filter(s=>s.gen && !seen.has(s.id));
  if(rest.length) out.push({level:{id:'outros', name:'Outros assuntos', ico:'🧩'}, groups:[{name:'', subjects:rest}]});
  return out;
}

function speedRunScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⏱️ Contra o relógio', true, ()=>go('arena')));
  const c = h(`<div class="content sr-wrap"></div>`);
  wrap.appendChild(c);
  let {subj, diff} = speedLoadLast();
  let search = '';
  const subjOf = id=> SUBJECTS.find(s=>s.id===id) || SUBJECTS[0];
  const diffOf = id=> SPEED_DIFFS.find(d=>d[0]===id) || SPEED_DIFFS[0];

  /* ---------------- introdução ---------------- */
  function intro(){
    const g = loadGame(), bests = speedBests(g);
    c.innerHTML = '';
    const box = h(`<div class="sr-intro">
        <div class="bi-hero sr-hero">
          <div class="bi-bolt sr-clock">⏱️</div>
          <div class="bi-txt"><h2>Contra o relógio</h2><p>Escolha um assunto e acerte o máximo que puder em ${SPEED_SECONDS} segundos!</p></div>
          <div class="bi-best"><small>Recorde</small><b class="sr-hero-best">${bests[speedKey(subj,diff)]||0}</b></div>
        </div>
        <div class="sr-rules">
          <span>✅ Acertou: <b>+1 ponto</b></span>
          <span>❌ Errou: <b>−${SPEED_PENALTY} s</b></span>
        </div>
        <div class="bi-lbl">Dificuldade</div>
        <div class="sr-diffs"></div>
        <div class="bi-lbl sr-lbl-subj">Assunto</div>
        <label class="sr-search"><span aria-hidden="true">🔎</span><input type="search" placeholder="Procurar assunto..." aria-label="Procurar assunto" autocomplete="off"></label>
        <div class="sr-list"></div>
        <p class="sr-empty" hidden>Nenhum assunto com esse nome. 🤔</p>
        <div class="sr-startbar">
          <div class="sr-sel"><span class="sr-sel-sym"></span><span class="sr-sel-txt"><small></small><b></b></span></div>
          <button class="btn primary sr-start">Começar! 🚀</button>
        </div>
      </div>`);
    const dbox = box.querySelector('.sr-diffs');
    SPEED_DIFFS.forEach(([id,ico,label])=>{
      const b = h(`<button type="button" class="sr-diff ${id===diff?'on':''}" aria-pressed="${id===diff}"><span>${ico}</span><b>${label}</b></button>`);
      b.onclick = ()=>{ diff = id; speedSaveLast(subj, diff); intro(); };
      dbox.appendChild(b);
    });
    const list = box.querySelector('.sr-list');
    speedSubjectSections().forEach(sec=>{
      const lv = h(`<div class="sr-level"><div class="sr-level-h">${sec.level.ico} ${escHTML(sec.level.name)}</div></div>`);
      sec.groups.forEach(gr=>{
        const grp = h(`<div class="sr-group">${gr.name?`<div class="sr-group-h">${escHTML(gr.name)}</div>`:''}<div class="sr-rows"></div></div>`);
        const rows = grp.querySelector('.sr-rows');
        gr.subjects.forEach(su=>{
          const best = bests[speedKey(su.id, diff)] || 0;
          const r = h(`<button type="button" class="sr-row ${su.id===subj?'on':''}" data-id="${su.id}" data-name="${escHTML(speedNorm(su.name))}">
              <span class="sr-sym">${su.sym||'•'}</span><span class="sr-name">${escHTML(su.name)}</span>
              <span class="sr-best ${best?'':'zero'}">🏆 ${best}</span></button>`);
          r.onclick = ()=>{
            subj = su.id; speedSaveLast(subj, diff);
            list.querySelectorAll('.sr-row.on').forEach(x=>x.classList.remove('on'));
            r.classList.add('on');
            paintSel();
          };
          rows.appendChild(r);
        });
        lv.appendChild(grp);
      });
      list.appendChild(lv);
    });
    function paintSel(){
      const cur = subjOf(subj), best = speedBests(loadGame())[speedKey(subj,diff)] || 0;
      box.querySelector('.sr-sel-sym').textContent = cur.sym || '•';
      box.querySelector('.sr-sel-txt small').textContent = `${diffOf(diff)[2]} · 🏆 ${best}`;
      box.querySelector('.sr-sel-txt b').textContent = cur.name;
      box.querySelector('.sr-hero-best').textContent = best;
    }
    function applySearch(){
      const q = speedNorm(search).trim();
      let any = false;
      list.querySelectorAll('.sr-group').forEach(gr=>{
        let n = 0;
        gr.querySelectorAll('.sr-row').forEach(r=>{ const ok = !q || r.dataset.name.includes(q); r.hidden = !ok; if(ok) n++; });
        gr.hidden = !n; if(n) any = true;
      });
      list.querySelectorAll('.sr-level').forEach(lv=>{ lv.hidden = !lv.querySelector('.sr-group:not([hidden])'); });
      box.querySelector('.sr-empty').hidden = any;
    }
    const inp = box.querySelector('.sr-search input');
    inp.value = search;
    inp.oninput = ()=>{ search = inp.value; applySearch(); };
    box.querySelector('.sr-start').onclick = countdown;
    c.appendChild(box);
    paintSel(); applySearch();
  }

  /* ---------------- contagem regressiva ---------------- */
  function countdown(){
    window.scrollTo(0, 0);
    let n = 3;
    const tick = ()=>{
      if(!wrap.isConnected) return;
      c.innerHTML = '';
      const s = subjOf(subj);
      c.appendChild(h(`<div class="sr-count-wrap"><div class="sr-count-subj">${s.sym||''} ${escHTML(s.name)} · ${diffOf(diff)[2]}</div><div class="lt-count ${n>0?'':'go'}">${n>0?n:'VAI!'}</div></div>`));
      playTones([n>0?440:880], 0.12, 'triangle', 0.06);
      if(n-- > 0) setTimeout(tick, 1000); else setTimeout(play, 500);
    };
    tick();
  }

  /* ---------------- partida ---------------- */
  function play(){
    if(!wrap.isConnected) return;
    const s = subjOf(subj);
    const t0 = Date.now();
    const st = {endAt: t0 + SPEED_SECONDS*1000, score:0, streak:0, best:0, right:0, wrong:0, mistakes:[], locked:false, over:false, sig:null, t0};
    let ex = null, opts = [];
    c.innerHTML = '';
    const ui = h(`<div class="sr-play">
        <div class="sr-hud">
          <div class="sr-chip sr-time"><small>tempo</small><b>${SPEED_SECONDS}</b><i class="sr-delta"></i></div>
          <div class="sr-mid"><div class="sr-subj">${s.sym||''} ${escHTML(s.name)}</div><div class="sr-streak"></div></div>
          <div class="sr-chip sr-score"><small>pontos</small><b>0</b><i class="sr-plus"></i></div>
        </div>
        <div class="sr-bar" role="progressbar" aria-label="Tempo restante" aria-valuemin="0" aria-valuemax="${SPEED_SECONDS}"><i></i></div>
        <div class="sr-card question-card"><div class="sr-q qtext mono"></div><div class="sr-fb" aria-live="polite"></div></div>
        <div class="sr-opts"></div>
      </div>`);
    c.appendChild(ui);
    const $ = sel=> ui.querySelector(sel);
    const optsEl = $('.sr-opts');
    const left = ()=> Math.max(0, (st.endAt - Date.now())/1000);
    function paintTime(){
      const t = left();
      $('.sr-time b').textContent = Math.ceil(t);
      $('.sr-bar i').style.width = (Math.min(1, t/SPEED_SECONDS)*100) + '%';
      $('.sr-bar').setAttribute('aria-valuenow', Math.ceil(t));
      ui.classList.toggle('low', t<=10);
    }
    function pop(sel, txt, good){
      const d = $(sel); d.textContent = txt; d.className = sel.slice(1) + ' ' + (good ? 'good' : 'bad');
      void d.offsetWidth; d.classList.add('show');
    }
    function paintHud(){
      $('.sr-score b').textContent = st.score;
      $('.sr-streak').textContent = st.streak>=2 ? `🔥 ${st.streak} seguidos` : '';
    }
    function newQ(){
      let tries = 0;
      while(true){
        try{
          const r = genQuestionAvoidingRepeat(s, diff, st.sig);
          ex = r.ex; st.sig = r.signature;
          opts = buildOptions(ex);
          break;
        }catch(e){ if(++tries>5) throw e; }
      }
      const qv = questionHTML(ex);
      const qEl = $('.sr-q');
      qEl.className = 'sr-q qtext mono' + (qv.stacked ? ' stacked' : '');
      const len = speedPlain(qv.html).length;
      if(!qv.stacked) qEl.classList.add(len>90 ? 'long' : len>30 ? 'mid' : 'short');
      qEl.innerHTML = qv.html;
      $('.sr-fb').innerHTML = '';
      const maxLen = Math.max(...opts.map(o=>o.label.length));
      optsEl.className = 'sr-opts' + (maxLen>9 ? ' one' : '');
      optsEl.innerHTML = '';
      opts.forEach((o,i)=>{
        const b = h(`<button type="button" class="lt-opt sr-opt"><small>${i+1}</small><span class="sr-opt-l"></span></button>`);
        b.querySelector('.sr-opt-l').textContent = o.label;
        if(o.label.length>18) b.classList.add('long');
        b.addEventListener('pointerdown', e=>{ e.preventDefault(); answer(i, b); });
        b.onclick = e=>{ e.preventDefault(); if(e.detail===0) answer(i, b); }; // teclado (Enter/Espaço)
        optsEl.appendChild(b);
      });
      const card = $('.sr-card'); card.scrollTop = 0;
    }
    function answer(i, btn){
      if(st.locked || st.over) return;
      const o = opts[i]; if(!o) return;
      const card = $('.sr-card');
      card.classList.remove('ok','bad'); void card.offsetWidth; card.classList.add(o.ok?'ok':'bad');
      if(o.ok){
        st.score++; st.streak++; st.right++; st.best = Math.max(st.best, st.streak);
        pop('.sr-plus', '+1', true);
        playTones([660+Math.min(st.streak,12)*30, 990+Math.min(st.streak,12)*30], 0.05, 'triangle', 0.07);
        playFeedbackVibration(true);
        paintHud(); paintTime(); newQ();
      } else {
        st.streak = 0; st.wrong++; st.endAt -= SPEED_PENALTY*1000;
        const right = answerLabel(ex);
        if(st.mistakes.length<6) st.mistakes.push({q: speedPlain(ex.question || questionHTML(ex).html), ans:right, got:o.label});
        pop('.sr-delta', `−${SPEED_PENALTY}s`, false);
        btn.classList.add('bad');
        optsEl.querySelectorAll('.sr-opt').forEach((b,k)=>{ if(opts[k].ok) b.classList.add('right'); else if(b!==btn) b.classList.add('dim'); });
        const fb = $('.sr-fb'); fb.innerHTML = '<span class="bad">A certa era: <b class="mono"></b></span>';
        fb.querySelector('b').textContent = right;
        playFeedbackSound(false); playFeedbackVibration(false);
        paintHud(); paintTime();
        st.locked = true;
        setTimeout(()=>{ st.locked = false; if(!st.over && left()>0 && wrap.isConnected) newQ(); }, 1100);
      }
    }
    const stop = ()=>{ clearInterval(timer); document.removeEventListener('keydown', onKey); };
    const onKey = e=>{
      if(!wrap.isConnected || st.over){ document.removeEventListener('keydown', onKey); return; }
      const n = Number(e.key);
      if(n>=1 && n<=4){ const b = optsEl.children[n-1]; if(b){ e.preventDefault(); b.classList.add('press'); setTimeout(()=>b.classList.remove('press'),120); answer(n-1, b); } }
    };
    document.addEventListener('keydown', onKey);
    paintTime(); paintHud(); newQ();
    const timer = setInterval(()=>{
      if(!wrap.isConnected){ stop(); return; }   // trocou de tela: para o relógio
      paintTime();
      if(left()<=0){ st.over = true; st.locked = true; stop(); finish(st); }
    }, 200);
  }

  /* ---------------- resultado ---------------- */
  function finish(st){
    if(!wrap.isConnected) return;
    const g = loadGame(), bests = speedBests(g), key = speedKey(subj, diff);
    const score = st.score, prev = bests[key] || 0;
    gameTouchDay();
    const record = score > prev;
    if(record) bests[key] = score;
    const gain = score*3 + (record && score>0 ? 20 : 0);
    if(gain) gameAddXP(gain);
    saveGame();
    if(record && score>0) launchConfetti(160);
    playTones(record && score>0 ? [523,659,784,1047,1319] : [523,659,784], 0.12, 'triangle', 0.09);
    const total = st.right + st.wrong, acc = total ? Math.round(st.right/total*100) : 0;
    const s = subjOf(subj);
    c.innerHTML = '';
    const end = h(`<div class="bolt-end sr-end">
        <div class="be-ico">${record && score>0 ? '🏆' : score>=10 ? '⏱️' : '⌛'}</div>
        <div class="be-title sr-end-title">${record && score>0 ? 'NOVO RECORDE!' : 'Tempo esgotado!'}</div>
        <div class="be-score"><b>${score}</b><span>${score===1?'ponto':'pontos'}</span></div>
        <div class="sr-end-subj">${s.sym||''} ${escHTML(s.name)} · ${diffOf(diff)[1]} ${diffOf(diff)[2]}</div>
        <div class="be-best">${record && score>0 ? (prev ? `Antes era <b>${prev}</b>. Você superou!` : 'Seu primeiro recorde neste assunto!') : `🏆 Seu recorde: <b>${bests[key]||0}</b>`} · ⭐ <b>+${gain} XP</b></div>
        <div class="be-stats">
          <div><b>${st.right}</b><span>acertos</span></div>
          <div><b>${acc}%</b><span>precisão</span></div>
          <div><b>${st.best}</b><span>maior sequência</span></div>
          <div><b>${st.wrong}</b><span>erros</span></div>
        </div>
        <div class="be-btns"><button class="btn primary" data-a="again">Jogar de novo</button><button class="btn secondary" data-a="change">Trocar assunto</button></div>
        ${st.mistakes.length ? `<div class="be-wrong sr-wrong"><div class="bi-lbl">Pra revisar</div>${st.mistakes.map(m=>`<div class="sr-wrow"><p>${escHTML(m.q.length>110 ? m.q.slice(0,107)+'...' : m.q)}</p><div><span>Certa: <b class="mono">${escHTML(m.ans)}</b></span><small>você marcou ${escHTML(m.got)}</small></div></div>`).join('')}</div>` : (total ? '<div class="be-perfect">✨ Nenhum erro! Mandou bem!</div>' : '')}
      </div>`);
    end.querySelector('[data-a=again]').onclick = countdown;
    end.querySelector('[data-a=change]').onclick = ()=>{ intro(); window.scrollTo(0,0); };
    c.appendChild(end);
    window.scrollTo(0, 0);
  }
  intro();
  return wrap;
}
