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

/* ---------- código curto (v2) ----------
   Formato: #APELIDO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXX
   O apelido é escolhido pela pessoa; o resto são 24 bytes em base32 (só letras maiúsculas
   e números, sem I, L, O e U pra não confundir): versão, quem é, semana, XP da semana,
   XP total, ofensiva, questões, acertos, 3 assuntos mais fracos e um conferidor. */
const RANK_B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const RANK_WEEK0 = Date.UTC(2024, 0, 1); // uma segunda-feira
function rankWeekIdx(){ const [y,m,d] = weekKey().split('-').map(Number); return Math.round((Date.UTC(y,m-1,d) - RANK_WEEK0) / (7*864e5)); }
function rankWeekFromIdx(i){ const d = new Date(RANK_WEEK0 + i*7*864e5); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
function rankNickClean(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10); }
function myRankNick(){ const g = loadGame(); return g.rankNick || rankNickClean(currentUser.name.split(' ')[0]) || 'ALUNO'; }
function rankSum16(bytes, nick){ let x = 2166136261; const t = String.fromCharCode(...bytes) + nick + RANK_SALT; for(let i=0;i<t.length;i++){ x ^= t.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x & 0xffff; }
function b32Enc(bytes){ let bits = 0, val = 0, out = ''; bytes.forEach(b=>{ val = (val<<8)|b; bits += 8; while(bits>=5){ out += RANK_B32[(val>>>(bits-5))&31]; bits -= 5; } }); if(bits>0) out += RANK_B32[(val<<(5-bits))&31]; return out; }
function b32Dec(str){ let bits = 0, val = 0; const out = []; for(const ch of str){ const v = RANK_B32.indexOf(ch); if(v<0) return null; val = ((val<<5)|v) & 0xfffff; bits += 5; if(bits>=8){ out.push((val>>>(bits-8))&255); bits -= 8; } } return out; }

/* monta o código da semana de quem está logado */
function myRankCode(){
  const g = loadGame(), pr = progressSync();
  let q = 0, c = 0; const subj = [];
  Object.entries(pr).forEach(([id,d])=>{
    if(!d || !d.attempted) return;
    q += d.attempted; c += d.correct||0;
    const si = SUBJECTS.findIndex(x=>x.id===id);
    if(d.attempted >= 3 && si >= 0 && si < 255) subj.push([si, Math.round((d.correct||0)/d.attempted*100)]);
  });
  subj.sort((a,b)=> a[1]-b[1]);
  const cap = (v,max)=> Math.max(0, Math.min(max, Math.round(v||0)));
  const u = parseInt(rankHash(String(currentUser.id)), 36) & 0xffff;
  const wx = cap(weekXpOf(g), 0xffffff), tx = cap(g.xp, 0xffffff), wk = cap(rankWeekIdx(), 0xffff);
  const qq = cap(q, 0xffff), cc = cap(Math.min(c, q), 0xffff);
  const bytes = [2, u>>8, u&255, wk>>8, wk&255, wx>>16, (wx>>8)&255, wx&255, tx>>16, (tx>>8)&255, tx&255, cap(gameStreakNow(),255), qq>>8, qq&255, cc>>8, cc&255];
  for(let k=0;k<3;k++){ const f = subj[k]; bytes.push(f ? f[0] : 255, f ? f[1] : 0); }
  const nick = myRankNick(), sum = rankSum16(bytes, nick);
  bytes.push(sum>>8, sum&255);
  return `#${nick}-` + b32Enc(bytes).match(/.{1,5}/g).join('-');
}
/* lê um código (curto ou o antigo MS-...); devolve o objeto ou null */
function parseRankCode(code){
  code = String(code||'').trim();
  const m2 = code.match(/^#([A-Za-z0-9]{1,10})((?:[-\s][0-9A-Za-z]{1,5}){6,10})$/);
  if(m2){
    const nick = m2[1].toUpperCase();
    const body = m2[2].replace(/[-\s]/g,'').toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1');
    const b = b32Dec(body);
    if(!b || b.length < 24 || b[0] !== 2) return null;
    const bytes = b.slice(0,22), sum = (b[22]<<8)|b[23];
    if(rankSum16(bytes, nick) !== sum) return null;
    const n3 = i=> (b[i]<<16)|(b[i+1]<<8)|b[i+2], n2 = i=> (b[i]<<8)|b[i+1];
    const tx = n3(8), f = [];
    for(let k=0;k<3;k++){ const si = b[16+k*2]; if(si!==255 && SUBJECTS[si]) f.push([SUBJECTS[si].id, b[17+k*2]]); }
    return {v:2, u:'c'+n2(1).toString(36), n:nick, w:rankWeekFromIdx(n2(3)), x:n3(5), t:tx, l:levelInfo(tx).level, s:b[11], q:n2(12), c:n2(14), f};
  }
  const m = code.match(/^MS-([A-Za-z0-9_-]+)-([0-9a-z]{5})$/);
  if(!m || rankHash(m[1] + RANK_SALT) !== m[2]) return null;
  try{
    const p = JSON.parse(b64uDec(m[1]));
    if(p.v!==1 || !p.n || !p.u) return null;
    return p;
  }catch(e){ return null; }
}
/* tira os códigos de um texto colado (pode vir com mensagem junto, vários de uma vez) */
function rankCodesIn(text){
  const t = String(text);
  const found = [...(t.match(/#[A-Za-z0-9]{1,10}(?:-[0-9A-Za-z]{1,5}){6,10}/g) || []), ...(t.match(/MS-[A-Za-z0-9_-]+-[0-9a-z]{5}/g) || [])];
  return found.map(parseRankCode).filter(Boolean);
}
/* identidade de quem está logado, pra não entrar no próprio ranking */
function myRankIds(){ return [rankHash(String(currentUser.id)), 'c'+(parseInt(rankHash(String(currentUser.id)), 36) & 0xffff).toString(36)]; }

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
  const g = rankStore(), wk = weekKey(), myIds = myRankIds();
  // quem entra: eu, as outras contas deste aparelho e os amigos com código desta semana
  const rows = [{me:true, n:currentUser.name, x:weekXpOf(g), l:levelInfo(g.xp).level, s:gameStreakNow(), src:'você'}];
  const users = await loadUsers();
  users.filter(u=> u.id!==currentUser.id).forEach(u=>{
    let og = {}; try{ og = JSON.parse(localStorage.getItem(`${GAME_KEY_BASE}:${u.id}`) || '{}'); }catch(e){}
    rows.push({n:u.name, x:weekXpOf(og), l:levelInfo(og.xp||0).level, s:streakFromData(og), src:'neste aparelho'});
  });
  Object.values(g.friends).forEach(p=>{
    if(myIds.includes(p.u)) return;
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

  // meu código (curto, começa com o apelido que a pessoa escolhe)
  const code = myRankCode(), nick = myRankNick();
  const mine = h(`<div class="card rk-card"><b>📤 Seu código da semana</b><small>Mande pros amigos ou pro professor. Mande de novo quando quiser atualizar seus pontos.</small>
    <div class="rk-nickrow"><span>Seu apelido no código:</span><b class="rk-nick"></b><button type="button" class="st-mini rk-nick-edit">✏️ Mudar</button></div>
    <div class="rk-nickform" hidden><input class="rk-nick-in mono" maxlength="10" autocapitalize="characters" spellcheck="false" placeholder="Ex.: ANATURBO"><button type="button" class="btn primary rk-nick-save">Salvar</button><small class="rk-nick-msg">De 2 a 10 letras ou números, sem espaço nem acento.</small></div>
    <div class="rk-code mono"></div><div class="rk-btns"><button type="button" class="btn secondary rk-copy">📋 Copiar</button><button type="button" class="btn primary rk-share">📲 Compartilhar</button></div></div>`);
  mine.querySelector('.rk-nick').textContent = '#' + nick;
  const codeEl = mine.querySelector('.rk-code');
  const [cNick, ...cRest] = code.split('-');
  codeEl.innerHTML = `<span class="rk-code-nick"></span>-<wbr>${cRest.map(g=>`<span class="rk-cg">${g}</span>`).join('-<wbr>')}`; // quebra a linha só nos tracinhos
  codeEl.querySelector('.rk-code-nick').textContent = cNick;
  const form = mine.querySelector('.rk-nickform'), inp = form.querySelector('.rk-nick-in');
  mine.querySelector('.rk-nick-edit').onclick = ()=>{ form.hidden = !form.hidden; if(!form.hidden){ inp.value = nick; inp.focus(); inp.select(); } };
  inp.oninput = ()=>{ const v = rankNickClean(inp.value); if(v !== inp.value) inp.value = v; };
  const saveNick = ()=>{
    const v = rankNickClean(inp.value);
    if(v.length < 2){ form.querySelector('.rk-nick-msg').textContent = '⚠️ Use pelo menos 2 letras ou números.'; return; }
    const g2 = loadGame(); g2.rankNick = v; saveGame();
    showFloat(`✨ Agora seu código começa com #${v}`); render();
  };
  form.querySelector('.rk-nick-save').onclick = saveNick;
  inp.onkeydown = e=>{ if(e.key==='Enter'){ e.preventDefault(); saveNick(); } };
  const msg = `Meu código do Matemática Show pra o ranking da semana 🏆 (cole no app em Progresso → Ranking):\n${code}`;
  mine.querySelector('.rk-copy').onclick = async ()=>{ try{ await navigator.clipboard.writeText(msg); showFloat('📋 Código copiado!'); }catch(e){ showFloat('Não deu pra copiar. Segure o código pra copiar.', true); } };
  const sh = mine.querySelector('.rk-share');
  if(!navigator.share) sh.remove(); else sh.onclick = async ()=>{ try{ await navigator.share({title:'Ranking — Matemática Show', text:msg}); }catch(e){} };
  c.appendChild(mine);

  // adicionar amigo
  const add = h(`<div class="card rk-card"><b>➕ Adicionar amigos</b><small>Cole aqui a mensagem com o código que seu amigo mandou (pode colar vários de uma vez).</small>
    <textarea class="rk-in" rows="3" placeholder="#APELIDO-…"></textarea><button type="button" class="btn primary rk-add">Adicionar ao ranking</button><div class="rk-msg"></div></div>`);
  add.querySelector('.rk-add').onclick = ()=>{
    const got = rankCodesIn(add.querySelector('.rk-in').value).filter(p=> !myIds.includes(p.u));
    if(!got.length){ add.querySelector('.rk-msg').innerHTML = `<div class="st-msg bad">⚠️ Não achei nenhum código válido. Confira se copiou ele inteiro (começa com #).</div>`; return; }
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
  const add = h(`<div class="card rk-card"><textarea class="rk-in" rows="4" placeholder="Cole os códigos dos alunos (#APELIDO-…)"></textarea><button type="button" class="btn primary rk-add">Adicionar à turma</button><div class="rk-msg"></div></div>`);
  add.querySelector('.rk-add').onclick = ()=>{
    const got = rankCodesIn(add.querySelector('.rk-in').value);
    if(!got.length){ add.querySelector('.rk-msg').innerHTML = `<div class="st-msg bad">⚠️ Não achei nenhum código válido (eles começam com #, por exemplo #ANA-…).</div>`; return; }
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
