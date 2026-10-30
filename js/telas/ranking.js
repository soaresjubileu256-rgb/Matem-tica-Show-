/* =========================================================
   RANKING DA SEMANA e TURMA (modo professor) — sem servidor
   - Cada aluno tem um "código da semana": um texto curto com nome, XP da semana,
     nível, ofensiva, questões e os assuntos em que mais erra.
   - O aluno manda o código (WhatsApp, por exemplo) pros amigos ou pro professor.
   - Amigos colam o código e entram no ranking da semana (junto com as contas deste aparelho).
   - O professor cola os códigos da turma e vê o resumo de todos e os assuntos que a turma mais erra.
   O código tem um conferidor simples (pra não sair errado ao copiar); não é à prova de trapaça.
   ========================================================= */
const RANK_SALT = 'mat-show-rank-1';

/* semana começa na segunda: a chave é a data da segunda-feira */
function weekKey(d){
  d = d ? new Date(d) : new Date();
  const wd = (d.getDay()+6) % 7; d.setDate(d.getDate()-wd);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
/* XP desta semana de uma conta (os dados guardam {k, xp} da semana em que foi ganho) */
function weekXpOf(g){ return g && g.week && g.week.k===weekKey() ? g.week.xp : 0; }
function rankAddWeekXp(g, amount){
  if(!(amount > 0)) return;
  const k = weekKey();
  if(!g.week || g.week.k!==k) g.week = {k, xp:0};
  g.week.xp += amount;
}

function rankHash(s){ let x = 2166136261; for(let i=0;i<s.length;i++){ x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(36).slice(0,5).padStart(5,'0'); }
function b64uEnc(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64uDec(s){ s = s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s += '='; return decodeURIComponent(escape(atob(s))); }

/* monta o código da semana de quem está logado */
function myRankCode(){
  const g = loadGame(), pr = progressSync();
  let q = 0, c = 0; const subj = [];
  Object.entries(pr).forEach(([id,d])=>{
    if(!d || !d.attempted) return;
    q += d.attempted; c += d.correct||0;
    if(d.attempted >= 3) subj.push([id, Math.round((d.correct||0)/d.attempted*100), d.attempted]);
  });
  subj.sort((a,b)=> a[1]-b[1]);
  const p = {v:1, u: rankHash(String(currentUser.id)), n: currentUser.name.slice(0,30), w: weekKey(), x: weekXpOf(g), t: g.xp,
    l: levelInfo(g.xp).level, s: gameStreakNow(), q, c, f: subj.slice(0,5), d: g.lastDay || ''};
  const body = b64uEnc(JSON.stringify(p));
  return `MS-${body}-${rankHash(body + RANK_SALT)}`;
}
/* lê um código; devolve o objeto ou null */
function parseRankCode(code){
  const m = String(code||'').trim().match(/^MS-([A-Za-z0-9_-]+)-([0-9a-z]{5})$/);
  if(!m || rankHash(m[1] + RANK_SALT) !== m[2]) return null;
  try{
    const p = JSON.parse(b64uDec(m[1]));
    if(p.v!==1 || !p.n || !p.u) return null;
    return p;
  }catch(e){ return null; }
}
/* tira os códigos de um texto colado (pode vir com mensagem junto, vários de uma vez) */
function rankCodesIn(text){ return (String(text).match(/MS-[A-Za-z0-9_-]+-[0-9a-z]{5}/g) || []).map(parseRankCode).filter(Boolean); }

function rankStore(){ const g = loadGame(); g.friends = g.friends || {}; g.turma = g.turma || {}; return g; }

function daysLeftInWeek(){ const wd = (new Date().getDay()+6) % 7; return 6 - wd; }

async function rankingScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏆 Ranking', true, ()=>go('progress')));
  const c = h(`<div class="content rk"></div>`);
  wrap.appendChild(c);
  const view = state.rankView || 'semana';
  const seg = h(`<div class="st-seg rk-seg" role="radiogroup"></div>`);
  [['semana','🏆 Ranking da semana'],['turma','👩‍🏫 Turma (professor)']].forEach(([id,label])=>{
    const b = h(`<button type="button" role="radio" aria-checked="${id===view}">${label}</button>`);
    b.onclick = ()=>{ if(id!==view){ state.rankView = id; render(); } };
    seg.appendChild(b);
  });
  c.appendChild(seg);
  if(view==='turma') await rankTurmaView(c); else await rankWeekView(c);
  return wrap;
}

async function rankWeekView(c){
  const g = rankStore(), wk = weekKey(), myId = rankHash(String(currentUser.id));
  // quem entra: eu, as outras contas deste aparelho e os amigos com código desta semana
  const rows = [{me:true, n:currentUser.name, x:weekXpOf(g), l:levelInfo(g.xp).level, s:gameStreakNow(), src:'você'}];
  const users = await loadUsers();
  users.filter(u=> u.id!==currentUser.id).forEach(u=>{
    let og = {}; try{ og = JSON.parse(localStorage.getItem(`${GAME_KEY_BASE}:${u.id}`) || '{}'); }catch(e){}
    rows.push({n:u.name, x:weekXpOf(og), l:levelInfo(og.xp||0).level, s:streakFromData(og), src:'neste aparelho'});
  });
  Object.values(g.friends).forEach(p=>{
    if(p.u===myId) return;
    rows.push({n:p.n, x: p.w===wk ? p.x : 0, l:p.l, s:p.s, src: p.w===wk ? 'amigo' : 'amigo · código antigo', key:p.u});
  });
  rows.sort((a,b)=> b.x-a.x || (a.me?-1:b.me?1:0));
  const left = daysLeftInWeek();
  c.appendChild(h(`<div class="rk-head"><b>Semana de ${wk.split('-').reverse().slice(0,2).join('/')}</b><small>${left===0 ? 'Termina hoje à meia-noite!' : `Termina em ${left} dia${left===1?'':'s'} · zera toda segunda`}</small></div>`));
  const list = h(`<div class="rk-list"></div>`);
  rows.forEach((r,i)=>{
    const medal = r.x>0 ? (['🥇','🥈','🥉'][i] || '') : '';
    const row = h(`<div class="rk-row ${r.me?'me':''}"><span class="rk-pos">${medal || (i+1)+'º'}</span><span class="rk-name"><b></b><small>Nível ${r.l||1}${r.s ? ` · 🔥 ${r.s}` : ''} · ${r.src}</small></span><span class="rk-xp">${r.x}<small>XP</small></span></div>`);
    row.querySelector('b').textContent = r.me ? `${r.n} (você)` : r.n;
    if(r.key){
      const del = h(`<button type="button" class="rk-del" aria-label="Tirar ${escHTML(r.n)} do ranking">✕</button>`);
      del.onclick = ()=>{ delete g.friends[r.key]; saveGame(); render(); };
      row.appendChild(del);
    }
    list.appendChild(row);
  });
  c.appendChild(list);
  if(rows.length===1) c.appendChild(h(`<p class="rk-empty">Só você por enquanto! Mande seu código pros amigos e cole o código deles aqui embaixo pra disputar a semana.</p>`));

  // meu código
  const code = myRankCode();
  const mine = h(`<div class="card rk-card"><b>📤 Seu código da semana</b><small>Mande pros amigos ou pro professor. Mande de novo quando quiser atualizar seus pontos.</small>
    <div class="rk-code mono"></div><div class="rk-btns"><button type="button" class="btn secondary rk-copy">📋 Copiar</button><button type="button" class="btn primary rk-share">📲 Compartilhar</button></div></div>`);
  mine.querySelector('.rk-code').textContent = code;
  const msg = `Meu código do Matemática Show pra o ranking da semana 🏆 (cole no app em Progresso → Ranking):\n${code}`;
  mine.querySelector('.rk-copy').onclick = async ()=>{ try{ await navigator.clipboard.writeText(msg); showFloat('📋 Código copiado!'); }catch(e){ showFloat('Não deu pra copiar. Segure o código pra copiar.', true); } };
  const sh = mine.querySelector('.rk-share');
  if(!navigator.share) sh.remove(); else sh.onclick = async ()=>{ try{ await navigator.share({title:'Ranking — Matemática Show', text:msg}); }catch(e){} };
  c.appendChild(mine);

  // adicionar amigo
  const add = h(`<div class="card rk-card"><b>➕ Adicionar amigos</b><small>Cole aqui a mensagem com o código que seu amigo mandou (pode colar vários de uma vez).</small>
    <textarea class="rk-in" rows="3" placeholder="MS-..."></textarea><button type="button" class="btn primary rk-add">Adicionar ao ranking</button><div class="rk-msg"></div></div>`);
  add.querySelector('.rk-add').onclick = ()=>{
    const got = rankCodesIn(add.querySelector('.rk-in').value).filter(p=> p.u!==myId);
    if(!got.length){ add.querySelector('.rk-msg').innerHTML = `<div class="st-msg bad">⚠️ Não achei nenhum código válido. Confira se copiou ele inteiro (começa com MS-).</div>`; return; }
    got.forEach(p=>{ const old = g.friends[p.u]; if(!old || old.w < p.w || (old.w===p.w && p.x>=old.x)) g.friends[p.u] = p; });
    saveGame(); queueToast('🏆', got.length===1 ? `${got[0].n} entrou no ranking!` : `${got.length} amigos no ranking!`, 'Quem fizer mais XP até domingo ganha');
    render();
  };
  c.appendChild(add);
}

async function rankTurmaView(c){
  const g = rankStore(), wk = weekKey();
  const studs = Object.values(g.turma).sort((a,b)=> (b.w===wk?b.x:0) - (a.w===wk?a.x:0));
  c.appendChild(h(`<div class="card rk-card rk-help"><b>👩‍🏫 Como funciona</b><small>Cada aluno abre <b>Progresso → Ranking</b>, toca em <b>Copiar</b> e te manda o código (no WhatsApp da turma, por exemplo). Cole tudo aqui embaixo, até a conversa inteira: o app acha os códigos sozinho. Toda semana os alunos mandam de novo e o resumo atualiza.</small></div>`));
  const add = h(`<div class="card rk-card"><textarea class="rk-in" rows="4" placeholder="Cole os códigos dos alunos (MS-...)"></textarea><button type="button" class="btn primary rk-add">Adicionar à turma</button><div class="rk-msg"></div></div>`);
  add.querySelector('.rk-add').onclick = ()=>{
    const got = rankCodesIn(add.querySelector('.rk-in').value);
    if(!got.length){ add.querySelector('.rk-msg').innerHTML = `<div class="st-msg bad">⚠️ Não achei nenhum código válido (eles começam com MS-).</div>`; return; }
    got.forEach(p=>{ const old = g.turma[p.u]; if(!old || old.w < p.w || (old.w===p.w && p.q>=old.q)) g.turma[p.u] = p; });
    saveGame(); queueToast('👩‍🏫', `${got.length} código${got.length===1?'':'s'} lido${got.length===1?'':'s'}`, 'O resumo da turma foi atualizado');
    render();
  };
  c.appendChild(add);
  if(!studs.length){ c.appendChild(h(`<p class="rk-empty">Nenhum aluno ainda. Os códigos que você colar aparecem aqui.</p>`)); return; }

  // resumo
  const q = studs.reduce((t,p)=>t+(p.q||0),0), ok = studs.reduce((t,p)=>t+(p.c||0),0);
  const active = studs.filter(p=> p.w===wk && p.x>0).length;
  c.appendChild(h(`<div class="rk-stats"><div><b>${studs.length}</b><small>alunos</small></div><div><b>${active}</b><small>estudaram nesta semana</small></div><div><b>${q ? Math.round(ok/q*100) : 0}%</b><small>de acerto geral</small></div></div>`));

  // assuntos que a turma mais erra
  const agg = {};
  studs.forEach(p=> (p.f||[]).forEach(([id,acc])=>{ if(acc>=70) return; const a = agg[id] = agg[id] || {n:0, sum:0}; a.n++; a.sum += acc; }));
  const weak = Object.entries(agg).sort((a,b)=> b[1].n-a[1].n || a[1].sum/a[1].n - b[1].sum/b[1].n).slice(0,5);
  if(weak.length){
    const box = h(`<div class="card rk-card"><b>🎯 Onde a turma mais erra</b><small>Assuntos com menos de 70% de acerto, e quantos alunos estão com dificuldade.</small><div class="rk-weak"></div></div>`);
    weak.forEach(([id,a])=>{
      const s = SUBJECTS.find(x=>x.id===id); if(!s) return;
      const avg = Math.round(a.sum/a.n);
      const r = h(`<button type="button" class="rk-wrow"><span class="rk-wsym">${s.sym}</span><span class="rk-wn"><b>${escHTML(s.name)}</b><small>${a.n} aluno${a.n===1?'':'s'} · ${avg}% de acerto em média</small></span><span class="rk-wbar"><i style="width:${avg}%"></i></span></button>`);
      r.onclick = ()=> go('subjectDetail', {subjectId:id});
      box.querySelector('.rk-weak').appendChild(r);
    });
    c.appendChild(box);
  }

  // alunos
  const tb = h(`<div class="card rk-card"><b>📋 Alunos</b><div class="rk-tbl"></div><button type="button" class="st-mini rk-clear">🗑️ Limpar a turma</button></div>`);
  studs.forEach(p=>{
    const acc = p.q ? Math.round(p.c/p.q*100) : 0, cur = p.w===wk;
    const worst = (p.f||[]).find(([id,a])=> a<70 && SUBJECTS.some(x=>x.id===id));
    const ws = worst && SUBJECTS.find(x=>x.id===worst[0]);
    const r = h(`<div class="rk-st"><div class="rk-st-h"><b></b><span class="${cur?'':'old'}">${cur ? `${p.x} XP na semana` : 'código de outra semana'}</span><button type="button" class="rk-del" aria-label="Tirar da turma">✕</button></div>
      <small>Nível ${p.l} · ${p.q} questões · ${acc}% de acerto${p.s ? ` · 🔥 ${p.s} dias` : ''}${ws ? ` · precisa de ajuda em <b>${escHTML(ws.name)}</b>` : ''}</small></div>`);
    r.querySelector('b').textContent = p.n;
    r.querySelector('.rk-del').onclick = ()=>{ delete g.turma[p.u]; saveGame(); render(); };
    tb.querySelector('.rk-tbl').appendChild(r);
  });
  tb.querySelector('.rk-clear').onclick = async ()=>{
    if(await showConfirm({icon:'🗑️', title:'Limpar a turma?', message:'Os códigos dos alunos saem deste aparelho. Eles podem mandar de novo depois.', ok:'Limpar', cancel:'Cancelar', danger:true})){ g.turma = {}; saveGame(); render(); }
  };
  c.appendChild(tb);
}
