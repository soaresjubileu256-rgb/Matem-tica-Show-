/* =========================================================
   Tela de entrada — "Quem vai jogar hoje?"
   Cartões das contas do aparelho (inicial, nível, ofensiva), senha só
   depois de escolher a conta, dica de senha no cadastro,
   "Esqueci minha senha" e espera após várias tentativas erradas.
   ========================================================= */
const LOGIN_MAX_TRIES = 5, LOGIN_WAIT_MS = 30000;
const _loginFails = {}; // {userId: {n, until}}
/* cada conta ganha uma cor pela posição na lista do aparelho (até 8 contas, todas diferentes),
   pra ficar fácil de achar a sua; sem posição, a cor sai do nome */
const AV_GRADS = [
  ['#4C7DFF','#B23FE0'], ['#FF6B6B','#FFB800'], ['#12B886','#33D2E3'], ['#F06595','#A77BFF'],
  ['#FF922B','#F03E3E'], ['#3BC9DB','#4C6EF5'], ['#94D82D','#12B886'], ['#CC5DE8','#F783AC'],
];
/* avatar escolhido no Perfil (emoji e cor), guardado no jogo da conta: {emo:'🦊', c:3} */
const AV_EMOJIS = ['🦊','🐼','🐯','🦁','🐸','🐵','🦄','🐙','🐧','🦉','🐨','🐶','🐱','🐲','🦖','🐢','🚀','⭐','🧠','🤖','👾','🎩','⚽','🎮'];
function avatarOf(u){
  const uid = u && u.id; if(!uid) return null;
  try{
    if(currentUser && currentUser.id===uid) return loadGame().avatar || null;
    const g = JSON.parse(localStorage.getItem(`${GAME_KEY_BASE}:${uid}`) || '{}');
    return g.avatar || null;
  }catch(e){ return null; }
}
function avatarColor(u, idx){
  const av = avatarOf(u);
  let n = av && av.c >= 0 ? av.c : idx;
  if(!(n >= 0)){
    const id = (u && (u.id||u.name)) || '';
    n = 2166136261; for(const ch of id){ n ^= ch.codePointAt(0); n = Math.imul(n, 16777619) >>> 0; }
  }
  const [a,b] = AV_GRADS[n % AV_GRADS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
/* foto do avatar: só aceita imagem embutida (data:image/...;base64), que é como o Perfil salva */
function avatarImg(av){ return av && typeof av.img==='string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(av.img) ? av.img : ''; }
/* o que vai dentro da bolinha: a foto, o emoji escolhido ou a inicial do nome */
function avatarFace(u){
  const av = avatarOf(u);
  if(avatarImg(av)) return `<img class="av-img" src="${avatarImg(av)}" alt="">`;
  if(av && av.emo) return av.emo;
  return u && u.name ? escHTML(u.name.trim().charAt(0).toUpperCase()) : '?';
}
function avatarHTML(u, cls, idx){
  const av = avatarOf(u);
  const k = avatarImg(av) ? 'is-img' : av && av.emo ? 'is-emo' : '';
  return `<span class="${cls||'av'} ${k}" style="background:${avatarColor(u, idx)}">${avatarFace(u)}</span>`;
}
/* lê o XP/ofensiva de uma conta sem precisar estar logado nela */
function peekGame(uid){
  try{
    const g = JSON.parse(localStorage.getItem(`${GAME_KEY_BASE}:${uid}`) || '{}');
    return {level: levelInfo(g.xp||0).level, streak: streakFromData(g)};
  }catch(e){ return {level:1, streak:0}; }
}
function authStageBg(){
  const syms = ['+','−','×','÷','π','√','%','=','x²','½','∑','∞'];
  return `<div class="auth-stage" aria-hidden="true"><span class="beam l"></span><span class="beam r"></span>${
    syms.map((s,i)=>`<span class="fsym" style="left:${(i*83)%100}%;animation-delay:${-(i*1.7)}s;animation-duration:${12+(i%5)*3}s;font-size:${18+(i%4)*8}px">${s}</span>`).join('')
  }</div>`;
}

function authScreen(mode, users){
  users = users || [];
  const wrap = h(`<div class="auth-wrap"></div>`);
  wrap.appendChild(h(authStageBg()));
  let selected = null;      // conta escolhida no modo login
  let typedName = false;    // login digitando o nome (conta não listada)

  const card = h(`<div class="auth-card"></div>`);
  wrap.appendChild(card);

  function header(bubble, mood){
    return `<div class="auth-brand"><img src="${LOGO_URI}" alt=""><div><b>Matemática Show</b><small>Seu professor de matemática digital</small></div></div>
      <div class="auth-hero">${mascotSVG(mood||'happy', 64)}<div class="auth-bubble">${bubble}</div></div>`;
  }
  function showError(msg){
    const box = card.querySelector('.authErrorBox');
    if(box) box.innerHTML = `<div class="auth-error">${msg}</div>`;
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
  }
  function wirePassToggles(){
    card.querySelectorAll('.pass-toggle').forEach(btn=>{
      btn.onclick = ()=>{
        const input = btn.previousElementSibling;
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.textContent = showing ? '👁' : '🙈';
      };
    });
  }
  function wireEnter(fn){
    card.querySelectorAll('input').forEach(inp=> inp.addEventListener('keydown', e=>{ if(e.key==='Enter') fn(); }));
  }
  const passField = (cls, label, ac, ph)=> `<div class="auth-field"><label>${label}</label><div class="pass-wrap"><input type="password" class="${cls}" placeholder="${ph}" autocomplete="${ac}"><button type="button" class="pass-toggle" aria-label="Mostrar senha">👁</button></div><div class="caps-note" hidden>⇪ O Caps Lock está ligado</div></div>`;
  /* avisa quando o Caps Lock está ligado (causa comum de "senha incorreta") */
  function wireCaps(){
    card.querySelectorAll('.pass-wrap input').forEach(inp=>{
      const note = inp.closest('.auth-field').querySelector('.caps-note');
      const check = e=>{ if(e.getModifierState) note.hidden = !e.getModifierState('CapsLock'); };
      inp.addEventListener('keydown', check); inp.addEventListener('keyup', check);
      inp.addEventListener('blur', ()=>{ note.hidden = true; });
    });
  }

  /* ---- escolher conta ---- */
  function paintPicker(){
    card.innerHTML = header('Oi! Quem vai jogar hoje? 🎬') + `<div class="auth-label">Toque na sua conta</div><div class="acc-list"></div>
      <button type="button" class="show-btn ghost new-acc">＋ Criar nova conta</button>
      <div class="auth-row center"><button type="button" class="auth-link other-acc">Minha conta não está aqui</button></div>`;
    const grid = card.querySelector('.acc-list');
    users.forEach((u,i)=>{
      const info = peekGame(u.id);
      const b = h(`<button type="button" class="acc-card">${avatarHTML(u,'acc-av',i)}<span class="acc-txt"><span class="acc-name"></span><span class="acc-meta">⭐ Nível ${info.level}${info.streak?` · 🔥 ${info.streak} dia${info.streak===1?'':'s'}`:''}</span></span><span class="acc-chev" aria-hidden="true">›</span></button>`);
      b.querySelector('.acc-name').textContent = u.name;
      b.onclick = ()=>{ selected = u; typedName = false; paintLogin(); };
      grid.appendChild(b);
    });
    card.querySelector('.other-acc').onclick = ()=>{ selected = null; typedName = true; paintLogin(); };
    card.querySelector('.new-acc').onclick = ()=> paintRegister();
  }

  /* ---- digitar senha ---- */
  function paintLogin(){
    const who = selected;
    card.innerHTML = header(who ? `Que bom te ver de novo, <b>${escHTML(who.name.split(' ')[0])}</b>! 👋` : 'Digite seu nome e sua senha pra entrar.') + `
      ${who ? `<div class="login-who">${avatarHTML(who,'who-av',users.findIndex(x=>x.id===who.id))}<div class="who-txt"><div class="who-name"></div><div class="who-meta">⭐ Nível ${peekGame(who.id).level}</div></div><button type="button" class="who-switch back">Trocar</button></div>` : `<div class="auth-field"><label>Nome</label><input type="text" class="authName" placeholder="Seu nome" autocomplete="username"></div>`}
      <div class="authErrorBox"></div>
      ${passField('authPass','Senha','current-password','Digite sua senha')}
      <button type="button" class="show-btn auth-go">Entrar ▶</button>
      <div class="auth-row${who ? ' center' : ''}"><button type="button" class="auth-link forgot">Esqueci minha senha</button>${who ? '' : users.length ? `<button type="button" class="auth-link back">‹ Voltar</button>` : `<button type="button" class="auth-link new-acc">Criar conta</button>`}</div>`;
    if(who) card.querySelector('.who-name').textContent = who.name;
    wirePassToggles(); wireCaps();
    const back = card.querySelector('.back'); if(back) back.onclick = paintPicker;
    const na = card.querySelector('.new-acc'); if(na) na.onclick = paintRegister;
    card.querySelector('.forgot').onclick = forgot;
    card.querySelector('.auth-go').onclick = doLogin;
    wireEnter(doLogin);
    setTimeout(()=>{ const f = card.querySelector(who ? '.authPass' : '.authName'); if(f) f.focus(); }, 60);
  }
  function findAccount(){
    if(selected) return selected;
    const nm = (card.querySelector('.authName')||{}).value || '';
    return users.find(u=>u.id===userIdFromName(nm)) || null;
  }
  function forgot(){
    const acc = findAccount();
    const hint = acc && acc.hint;
    showConfirm({
      icon:'🔑', title: hint ? 'Sua dica de senha' : 'Esqueceu a senha?',
      message: hint
        ? `💡 "${hint}"`
        : (acc ? 'Essa conta não tem dica de senha. ' : '') + 'A senha fica guardada só neste aparelho, então não dá pra recuperar pela internet. Tente lembrar com calma, ou peça ajuda a quem criou a conta. Se não tiver jeito, crie uma conta nova.',
      ok:'Tentar de novo', cancel: hint ? 'Fechar' : 'Criar conta nova',
    }).then(ok=>{ if(!ok && !hint) paintRegister(); else { const f = card.querySelector('.authPass'); if(f) f.focus(); } });
  }
  async function doLogin(){
    const name = selected ? selected.name : (card.querySelector('.authName').value||'').trim();
    const pass = card.querySelector('.authPass').value;
    if(!name){ showError('Digite seu nome.'); return; }
    if(!pass){ showError('Digite sua senha.'); return; }
    const list = await loadUsers();
    const id = userIdFromName(name);
    const f = _loginFails[id];
    if(f && f.until > Date.now()){ showError(`Muitas tentativas. Espere ${Math.ceil((f.until-Date.now())/1000)} segundos e tente de novo.`); return; }
    const acc = list.find(u=>u.id===id);
    const btn = card.querySelector('.auth-go'); btn.disabled = true; btn.textContent = 'Entrando…';
    const passHash = await hashPassword(pass);
    if(!acc || acc.passHash!==passHash){
      btn.disabled = false; btn.textContent = 'Entrar ▶';
      const rec = _loginFails[id] = _loginFails[id] || {n:0, until:0};
      rec.n++;
      if(rec.n >= LOGIN_MAX_TRIES){ rec.n = 0; rec.until = Date.now() + LOGIN_WAIT_MS; showError('Senha errada muitas vezes. Espere 30 segundos. 💡 Toque em "Esqueci minha senha" pra ver sua dica.'); }
      else showError(acc ? `Senha incorreta. Tente de novo${rec.n>=2 ? ' — ou veja sua dica em "Esqueci minha senha"' : ''}.` : 'Não achei nenhuma conta com esse nome neste aparelho.');
      const pf = card.querySelector('.authPass'); pf.value = ''; pf.focus();
      return;
    }
    delete _loginFails[id];
    currentUser = {id: acc.id, name: acc.name};
    await setCurrentUserId(acc.id);
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
    const st = gameStreakNow();
    queueToast('👋', 'Bem-vindo de volta!', `${acc.name}${st?` · 🔥 ${st} dia${st===1?'':'s'}`:''}`);
    if(passwordProblem(pass, acc.name)){
      setTimeout(()=> showConfirm({icon:'🔐', title:'Sua senha está fraca',
        message:'Ela é fácil de adivinhar. Que tal trocar por uma mais forte? Leva 1 minutinho.',
        ok:'Trocar agora', cancel:'Depois'}).then(ok=>{ if(ok) go('settings'); }), 900);
    }
  }

  /* ---- criar conta ---- */
  function paintRegister(){
    card.innerHTML = header(users.length ? 'Uma conta nova? Bora! 😄 Leva 1 minutinho.' : 'Bem-vindo! Vamos criar sua conta? Leva 1 minutinho. 🎤', 'joy') + `
      <div class="authErrorBox"></div>
      <div class="auth-field"><label>Seu nome</label><input type="text" class="authName" placeholder="Como quer ser chamado?" autocomplete="username" maxlength="30"></div>
      ${passField('authPass','Crie uma senha','new-password','Pelo menos 6 letras e números')}
      ${passField('authPass2','Repita a senha','new-password','Digite a senha de novo')}
      <button type="button" class="auth-link hint-toggle">＋ Adicionar uma dica de senha (opcional)</button>
      <div class="auth-field hint-field" style="display:none"><label>Dica da senha <small>(ajuda se você esquecer)</small></label><input type="text" class="authHint" placeholder="Ex.: meu bicho favorito + número da camisa" maxlength="60"></div>
      <button type="button" class="show-btn auth-go">Criar conta e começar ▶</button>
      <p class="auth-note">🔒 Tudo fica salvo só neste aparelho. Cada conta tem seu próprio progresso.</p>
      ${users.length ? `<div class="auth-row center"><button type="button" class="auth-link back">‹ Já tenho conta</button></div>` : ''}`;
    const passInput = card.querySelector('.authPass');
    passInput.closest('.auth-field').appendChild(attachStrengthMeter(passInput, ()=> card.querySelector('.authName').value));
    card.querySelector('.authName').addEventListener('input', ()=>{ const m = card.querySelector('.pw-meter'); if(m && m.refresh) m.refresh(); });
    wirePassToggles(); wireCaps();
    // mostra na hora se a senha repetida bate com a primeira
    const pass2 = card.querySelector('.authPass2');
    const match = h(`<div class="pw-match" hidden></div>`);
    pass2.closest('.auth-field').appendChild(match);
    const checkMatch = ()=>{
      const a = passInput.value, b = pass2.value;
      match.hidden = !b;
      const ok = a === b;
      match.className = 'pw-match ' + (ok ? 'ok' : 'no');
      match.textContent = ok ? '✓ As senhas são iguais' : (a.startsWith(b) ? 'Continue digitando…' : '✗ As senhas ainda não são iguais');
    };
    pass2.addEventListener('input', checkMatch); passInput.addEventListener('input', ()=>{ if(pass2.value) checkMatch(); });
    // a dica é opcional: fica escondida atrás de um link pra deixar o formulário mais curto
    card.querySelector('.hint-toggle').onclick = e=>{ e.currentTarget.remove(); const f = card.querySelector('.hint-field'); f.style.display = ''; f.querySelector('input').focus(); };
    const back = card.querySelector('.back'); if(back) back.onclick = paintPicker;
    card.querySelector('.auth-go').onclick = doRegister;
    wireEnter(doRegister);
  }
  async function doRegister(){
    const name = card.querySelector('.authName').value.trim().replace(/\s+/g,' ');
    const pass = card.querySelector('.authPass').value;
    const pass2 = card.querySelector('.authPass2').value;
    const hint = card.querySelector('.authHint').value.trim();
    if(!name){ showError('Digite seu nome.'); return; }
    if(name.length < 2){ showError('O nome precisa ter pelo menos 2 letras.'); return; }
    if(!pass){ showError('Crie uma senha.'); return; }
    const weak = passwordProblem(pass, name);
    if(weak){ showError(weak); return; }
    if(pass!==pass2){ showError('As senhas não são iguais. Digite de novo.'); return; }
    if(hint && hint.toLowerCase().includes(pass.toLowerCase())){ showError('A dica não pode conter a própria senha! 😅'); return; }
    const id = userIdFromName(name);
    const list = await loadUsers();
    if(list.some(u=>u.id===id)){ showError('Já existe uma conta com esse nome neste aparelho. Escolha outro nome ou entre na conta.'); return; }
    const btn = card.querySelector('.auth-go'); btn.disabled = true; btn.textContent = 'Criando…';
    const passHash = await hashPassword(pass);
    const newUser = {id, name, passHash};
    if(hint) newUser.hint = hint;
    list.push(newUser);
    await saveUsers(list);
    currentUser = {id, name};
    await setCurrentUserId(id);
    markNewsSeen(); // conta nova: as novidades antigas não fazem sentido pra ela
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
  }

  if(mode==='register' || !users.length) paintRegister();
  else paintPicker();
  return wrap;
}


function renderAuth(mode, users){
  app.innerHTML='';
  app.appendChild(authScreen(mode, users));
}

async function boot(){
  app.innerHTML = '<div class="content" style="padding-top:60px;text-align:center;color:var(--ink-soft)">Carregando…</div>';
  const users = await loadUsers();
  const savedId = await getSavedCurrentUserId();
  const saved = savedId ? users.find(u=>u.id===savedId) : null;
  if(saved){
    currentUser = {id: saved.id, name: saved.name};
    await loadSettings();
    applyTheme(settingsCache.theme);
    applyTextScale(settingsCache.textScale);
    enterApp();
  } else if(users.length){
    renderAuth('login', users);
  } else {
    renderAuth('register', []);
  }
}
