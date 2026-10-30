/* =========================================================
   RANKING DA SEMANA — sem servidor
   - Cada aluno tem um "código da semana": um texto curto com nome, XP da semana,
     nível, ofensiva, questões e os assuntos em que mais erra.
   - O aluno manda o código (WhatsApp, por exemplo) pros amigos.
   - Amigos colam o código e entram no ranking da semana (junto com as contas deste aparelho).
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
/* apelido = parte escolhida pela pessoa (até 7) + número fixo da conta (3 dígitos): assim cada pessoa tem um código diferente */
function myRankNumber(){ return 100 + (parseInt(rankHash('n' + currentUser.id), 36) % 900); }
function myRankBase(){ const g = loadGame(); return rankNickClean(g.rankNick || currentUser.name.split(' ')[0]).replace(/\d+$/,'').slice(0,7) || 'ALUNO'; }
function myRankNick(){ return myRankBase() + myRankNumber(); }

/* ---------- código curtinho (v3): #APELIDO-XXXXXXXXXXXXXXXXXXX ----------
   19 letras/números guardam 95 bits: quem é (10), semana (4), XP da semana (14), nível (6),
   ofensiva (7), questões (14), % de acerto (7), 2 assuntos mais fracos (6+4 cada) e um
   conferidor (10). A semana vai só "módulo 16": quem lê pega a semana mais recente que bate. */
const RANK_V3 = [['u',10],['w',4],['x',14],['l',6],['s',7],['q',14],['a',7],['f1',6],['a1',4],['f2',6],['a2',4]];
function rankSum10(n, nick){ let x = 2166136261; const t = n.toString(36) + nick + RANK_SALT; for(let i=0;i<t.length;i++){ x ^= t.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x & 1023; }

/* monta o código da semana de quem está logado */
function myRankCode(){
  const g = loadGame(), pr = progressSync();
  let q = 0, c = 0; const subj = [];
  Object.entries(pr).forEach(([id,d])=>{
    if(!d || !d.attempted) return;
    q += d.attempted; c += d.correct||0;
    const si = SUBJECTS.findIndex(x=>x.id===id);
    if(d.attempted >= 3 && si >= 0 && si < 63) subj.push([si, (d.correct||0)/d.attempted]);
  });
  subj.sort((a,b)=> a[1]-b[1]);
  const cap = (v,bits)=> Math.max(0, Math.min((1<<bits)-1, Math.round(v||0)));
  const val = {u: parseInt(rankHash(String(currentUser.id)), 36) & 1023, w: rankWeekIdx() & 15, x: weekXpOf(g), l: levelInfo(g.xp).level, s: gameStreakNow(),
    q, a: q ? c/q*100 : 0, f1: subj[0] ? subj[0][0] : 63, a1: subj[0] ? subj[0][1]*15 : 0, f2: subj[1] ? subj[1][0] : 63, a2: subj[1] ? subj[1][1]*15 : 0};
  let n = 0n;
  RANK_V3.forEach(([k,bits])=>{ n = (n << BigInt(bits)) | BigInt(cap(val[k], bits)); });
  const nick = myRankNick();
  n = (n << 10n) | BigInt(rankSum10(n, nick));
  let out = '';
  for(let k=0;k<19;k++){ out = RANK_B32[Number(n & 31n)] + out; n >>= 5n; }
  return `#${nick}-${out}`;
}
function parseRankCodeV3(nick, body){
  body = body.toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1');
  let n = 0n;
  for(const ch of body){ const v = RANK_B32.indexOf(ch); if(v<0) return null; n = (n << 5n) | BigInt(v); }
  const sum = Number(n & 1023n), data = n >> 10n;
  if(rankSum10(data, nick) !== sum) return null;
  const val = {}; let rest = data;
  [...RANK_V3].reverse().forEach(([k,bits])=>{ val[k] = Number(rest & BigInt((1<<bits)-1)); rest >>= BigInt(bits); });
  if(rest !== 0n) return null;
  const cur = rankWeekIdx(), wk = cur - ((cur - val.w) & 15);
  const f = [];
  [['f1','a1'],['f2','a2']].forEach(([fi,ai])=>{ if(val[fi] < 63 && SUBJECTS[val[fi]]) f.push([SUBJECTS[val[fi]].id, Math.round(val[ai]*100/15)]); });
  return {v:3, u:`${nick}:${val.u}`, n:nick, w:rankWeekFromIdx(wk), x:val.x, l:Math.max(1, val.l), s:val.s, q:val.q, c:Math.round(val.q*val.a/100), f};
}
/* lê um código #APELIDO123-XXXXXXXXXXXXXXXXXXX; devolve o objeto ou null */
function parseRankCode(code){
  const m = String(code||'').trim().match(/^#([A-Za-z0-9]{1,10})-([0-9A-Za-z]{19})$/);
  return m ? parseRankCodeV3(m[1].toUpperCase(), m[2]) : null;
}
/* tira os códigos de um texto colado (pode vir com mensagem junto, vários de uma vez) */
function rankCodesIn(text){ return (String(text).match(/#[A-Za-z0-9]{1,10}-[0-9A-Za-z]{19}(?![0-9A-Za-z-])/g) || []).map(parseRankCode).filter(Boolean); }
/* identidade de quem está logado, pra não entrar no próprio ranking */
function myRankIds(){ return [`${myRankNick()}:${parseInt(rankHash(String(currentUser.id)), 36) & 1023}`]; }

function rankStore(){
  const g = loadGame(); g.friends = g.friends || {}; delete g.turma; // a Turma (modo professor) saiu do app
  // só vale o código atual: amigos e alunos que vieram de códigos antigos saem da lista
  Object.keys(g.friends).forEach(id=>{ if(g.friends[id].v !== 3) delete g.friends[id]; });
  return g;
}

function daysLeftInWeek(){ const wd = (new Date().getDay()+6) % 7; return 6 - wd; }

async function rankingScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('🏆 Ranking', true, ()=>go('progress')));
  const c = h(`<div class="content rk"></div>`);
  wrap.appendChild(c);
  await rankWeekView(c);
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
  const code = myRankCode(), base = myRankBase(), num = myRankNumber();
  const mine = h(`<div class="card rk-card"><b>📤 Seu código da semana</b><small>Mande pros amigos. Mande de novo quando quiser atualizar seus pontos.</small>
    <div class="rk-nickrow"><span>Seu apelido no código:</span><b class="rk-nick"></b><button type="button" class="st-mini rk-nick-edit">✏️ Mudar</button><small class="rk-num-why">O número no fim é só seu: assim ninguém fica com um código igual ao seu.</small></div>
    <div class="rk-nickform" hidden><input class="rk-nick-in mono" maxlength="7" autocapitalize="characters" spellcheck="false" placeholder="Ex.: ANATURBO"><button type="button" class="btn primary rk-nick-save">Salvar</button><small class="rk-nick-msg">De 2 a 7 letras, sem espaço nem acento. O número ${num} continua no fim.</small></div>
    <div class="rk-code mono"></div><div class="rk-btns"><button type="button" class="btn secondary rk-copy">📋 Copiar</button><button type="button" class="btn primary rk-share">📲 Compartilhar</button></div></div>`);
  mine.querySelector('.rk-nick').innerHTML = `#<span></span><i class="rk-num">${num}</i>`; mine.querySelector('.rk-nick span').textContent = base;
  const codeEl = mine.querySelector('.rk-code');
  const [cNick, ...cRest] = code.split('-');
  codeEl.innerHTML = `<span class="rk-code-nick"></span>-<wbr><span class="rk-cg">${cRest.join('-')}</span>`;
  codeEl.querySelector('.rk-code-nick').textContent = cNick;
  const form = mine.querySelector('.rk-nickform'), inp = form.querySelector('.rk-nick-in');
  mine.querySelector('.rk-nick-edit').onclick = ()=>{ form.hidden = !form.hidden; if(!form.hidden){ inp.value = base; inp.focus(); inp.select(); } };
  inp.oninput = ()=>{ const v = rankNickClean(inp.value).slice(0,7); if(v !== inp.value) inp.value = v; };
  const saveNick = ()=>{
    const v = rankNickClean(inp.value).replace(/\d+$/,'').slice(0,7);
    if(v.length < 2){ form.querySelector('.rk-nick-msg').textContent = '⚠️ Use pelo menos 2 letras.'; return; }
    const g2 = loadGame(); g2.rankNick = v; saveGame();
    showFloat(`✨ Agora seu código começa com #${v}${num}`); render();
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
