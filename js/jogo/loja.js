/* =========================================================
   LOJA DO PI e AJUDAS PAGAS COM MOEDAS 🪙
   - Loja: itens só de visual (não dão vantagem no estudo): chapéus e acessórios do Pi,
     molduras do avatar, fundo do cartão do jogador e efeito de comemoração.
     Fica em g.shop = {owned:{id:1}, equip:{hat, acc, frame, card, fx}}.
   - Ajudas: 50/50 e vida extra nas fases da Trilha e da Arena, com limite por dia
     (g.today.helps), pra não virar atalho no lugar de estudar.
   ========================================================= */
const SHOP_CATS = [
  {id:'hat',   ico:'🎩', name:'Chapéus do Pi'},
  {id:'acc',   ico:'🕶️', name:'Acessórios do Pi'},
  {id:'frame', ico:'⭕', name:'Molduras do avatar'},
  {id:'card',  ico:'🎴', name:'Fundo do cartão'},
  {id:'fx',    ico:'🎉', name:'Comemoração'},
];
const SHOP_ITEMS = [
  // chapéus do Pi (o desenho fica em mascotHatSVG)
  {id:'cartola',    cat:'hat', name:'Cartola do Show', price:0,    ico:'🎩'},
  {id:'festa',      cat:'hat', name:'Chapéu de festa', price:60,   ico:'🥳'},
  {id:'bone',       cat:'hat', name:'Boné',            price:80,   ico:'🧢'},
  {id:'coroa',      cat:'hat', name:'Coroa',           price:120,  ico:'👑'},
  {id:'capelo',     cat:'hat', name:'Capelo de formatura', price:150, ico:'🎓'},
  {id:'mago',       cat:'hat', name:'Chapéu de mago',  price:200,  ico:'🧙'},
  {id:'coroa_ouro', cat:'hat', name:'Coroa de ouro (rara)', price:1000, ico:'💎', rare:true},
  // acessórios
  {id:'acc_nenhum', cat:'acc', name:'Sem acessório',   price:0,   ico:'🚫'},
  {id:'oculos',     cat:'acc', name:'Óculos escuros',  price:70,  ico:'🕶️'},
  {id:'oculos_red', cat:'acc', name:'Óculos de nerd',  price:90,  ico:'🤓'},
  {id:'gravata',    cat:'acc', name:'Gravata borboleta dourada', price:60, ico:'🎀'},
  // molduras do avatar
  {id:'frame_nenhuma', cat:'frame', name:'Sem moldura', price:0,   ico:'⚪'},
  {id:'frame_ouro',    cat:'frame', name:'Ouro',        price:100, ico:'🟡'},
  {id:'frame_neon',    cat:'frame', name:'Neon',        price:120, ico:'💠'},
  {id:'frame_arco',    cat:'frame', name:'Arco-íris',   price:150, ico:'🌈'},
  {id:'frame_fogo',    cat:'frame', name:'Fogo',        price:180, ico:'🔥'},
  // fundo do cartão do jogador
  {id:'card_padrao',  cat:'card', name:'Show (padrão)', price:0,   ico:'🟣'},
  {id:'card_oceano',  cat:'card', name:'Oceano',        price:100, ico:'🌊'},
  {id:'card_sol',     cat:'card', name:'Pôr do sol',    price:100, ico:'🌅'},
  {id:'card_floresta',cat:'card', name:'Floresta',      price:100, ico:'🌲'},
  {id:'card_galaxia', cat:'card', name:'Galáxia',       price:200, ico:'🌌'},
  // efeito de comemoração (confete)
  {id:'fx_confete',  cat:'fx', name:'Confete',  price:0,   ico:'🎊'},
  {id:'fx_estrelas', cat:'fx', name:'Estrelas', price:80,  ico:'⭐', emo:['⭐','✨','🌟']},
  {id:'fx_coracoes', cat:'fx', name:'Corações', price:80,  ico:'💜', emo:['💜','💙','❤️','💛']},
  {id:'fx_emojis',   cat:'fx', name:'Festa',    price:120, ico:'🥳', emo:['🎉','🥳','👏','💯','🔥']},
];
const SHOP_DEFAULT = {hat:'cartola', acc:'acc_nenhum', frame:'frame_nenhuma', card:'card_padrao', fx:'fx_confete'};

function shopData(){
  const g = loadGame();
  if(!g.shop) g.shop = {owned:{}, equip:Object.assign({}, SHOP_DEFAULT)};
  SHOP_ITEMS.forEach(it=>{ if(!it.price) g.shop.owned[it.id] = 1; });
  g.shop.equip = Object.assign({}, SHOP_DEFAULT, g.shop.equip);
  return g.shop;
}
function shopEquipped(cat){ try{ return shopData().equip[cat]; }catch(e){ return SHOP_DEFAULT[cat]; } }
function shopItem(id){ return SHOP_ITEMS.find(i=>i.id===id); }
/* molduras e fundo do cartão viram atributos no <html>; o CSS faz o resto */
function applyShopLook(){
  try{
    const r = document.documentElement;
    r.dataset.frame = shopEquipped('frame'); r.dataset.card = shopEquipped('card');
  }catch(e){}
}
function shopBuy(id){
  const it = shopItem(id), sh = shopData(), g = loadGame();
  if(!it || sh.owned[id]) return false;
  if(gemsNow() < it.price) return false;
  g.gems -= it.price; sh.owned[id] = 1; sh.equip[it.cat] = id;
  saveGame(); applyShopLook();
  playComboSound(5);
  queueToast(it.ico, 'Comprado!', `${it.name} já está em uso`);
  if(it.cat==='fx') launchConfetti(90);
  return true;
}
function shopEquip(id){
  const it = shopItem(id), sh = shopData();
  if(!it || !sh.owned[id]) return;
  sh.equip[it.cat] = id; saveGame(); applyShopLook();
  if(it.cat==='fx') launchConfetti(70);
}

/* ---------- desenhos dos chapéus e acessórios do Pi ---------- */
function mascotHatSVG(gid, hat){
  hat = hat || shopEquipped('hat');
  if(hat==='festa') return `<g transform="rotate(-10 50 30)"><path d="M36 33 L50 2 L64 33 Z" fill="#FF5C7A"/><path d="M42 20 L58 20 M39 27 L61 27 M45 13 L55 13" stroke="#FFD45C" stroke-width="3"/><circle cx="50" cy="3" r="4.5" fill="#FFD45C"/></g>`;
  if(hat==='bone') return `<g transform="rotate(-6 50 30)"><path d="M28 32 q22 -30 44 0 Z" fill="#4C7DFF"/><path d="M60 31 q14 -2 24 4 q-12 3 -24 1 Z" fill="#2F55D4"/><circle cx="50" cy="12" r="3" fill="#2F55D4"/><path d="M37 26 q13 -8 26 0" stroke="#FFB800" stroke-width="2.5" fill="none"/></g>`;
  if(hat==='coroa' || hat==='coroa_ouro'){
    const gold = hat==='coroa_ouro';
    return `<g transform="rotate(-6 50 30)"><path d="M32 33 L30 12 L40 22 L50 6 L60 22 L70 12 L68 33 Z" fill="${gold?'#FFD45C':'#FFB800'}" stroke="${gold?'#B07800':'#E09A00'}" stroke-width="1.5"/>
      <rect x="32" y="29" width="36" height="5" rx="2" fill="${gold?'#E0A000':'#E09A00'}"/>${gold ? '<circle cx="50" cy="20" r="3.5" fill="#33D2E3"/><circle cx="39" cy="25" r="2.5" fill="#FF5C7A"/><circle cx="61" cy="25" r="2.5" fill="#7CFF6B"/><path d="M26 8 l2 4 l4 1 l-4 1 l-2 4 l-2 -4 l-4 -1 l4 -1 Z M74 6 l1.5 3 l3 1 l-3 1 l-1.5 3 l-1.5 -3 l-3 -1 l3 -1 Z" fill="#FFF3B0"/>' : '<circle cx="50" cy="21" r="3" fill="#FF5C7A"/>'}</g>`;
  }
  if(hat==='capelo') return `<g transform="rotate(-6 50 28)"><path d="M34 24 h32 v8 q-16 6 -32 0 Z" fill="#1B1E45"/><path d="M50 10 L80 21 L50 32 L20 21 Z" fill="#2A2F6B"/><path d="M50 21 L74 23 L74 36" stroke="#FFB800" stroke-width="2" fill="none"/><circle cx="74" cy="37" r="3" fill="#FFB800"/></g>`;
  if(hat==='mago') return `<g transform="rotate(-12 50 30)"><path d="M28 33 q22 6 44 0 L54 0 Z" fill="#6A3DD8"/><ellipse cx="50" cy="33" rx="25" ry="5" fill="#5A2FC0"/><path d="M45 14 l1.5 3 l3 1 l-3 1 l-1.5 3 l-1.5 -3 l-3 -1 l3 -1 Z M56 24 l1 2 l2 .7 l-2 .7 l-1 2 l-1 -2 l-2 -.7 l2 -.7 Z" fill="#FFD45C"/></g>`;
  // cartola do Show (padrão)
  return `<g transform="rotate(-8 50 30)">
      <ellipse cx="50" cy="32" rx="25" ry="5" fill="url(#${gid}h)"/>
      <rect x="36" y="6" width="28" height="26" rx="4" fill="url(#${gid}h)"/>
      <rect x="36" y="23" width="28" height="5" fill="#B23FE0"/>
      <image href="${LOGO_URI}" x="40.5" y="5" width="19" height="19" preserveAspectRatio="xMidYMid meet"/>
    </g>`;
}
function mascotAccSVG(acc){
  acc = acc || shopEquipped('acc');
  if(acc==='oculos') return `<g><rect x="29" y="48" width="19" height="13" rx="5" fill="#1B1E45"/><rect x="52" y="48" width="19" height="13" rx="5" fill="#1B1E45"/><path d="M48 53 h4" stroke="#1B1E45" stroke-width="3"/><path d="M32 51 l5 0" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"/><path d="M55 51 l5 0" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"/></g>`;
  if(acc==='oculos_red') return `<g fill="none" stroke="#1B1E45" stroke-width="2.6"><circle cx="39" cy="55" r="9.5"/><circle cx="61" cy="55" r="9.5"/><path d="M48.5 54 h3"/></g>`;
  if(acc==='gravata') return `<path d="M38 88 l12 6 l-12 6 Z M62 88 l-12 6 l12 6 Z" fill="#FFD45C"/><circle cx="50" cy="94" r="3.4" fill="#E09A00"/>`;
  return '';
}

/* ---------- ajudas pagas (Trilha e Arena) ---------- */
const PAID_HELPS = {
  fifty: {ico:'✂️', name:'50/50',      cost:15, perDay:3, tip:'Tira duas alternativas erradas'},
  life:  {ico:'❤️', name:'+1 vida',    cost:20, perDay:2, tip:'Ganha uma vida extra'},
};
function helpsUsedToday(id){ const g = loadGame(); gameEnsureToday(); g.today.helps = g.today.helps || {}; return g.today.helps[id] || 0; }
/* onde as ajudas aparecem: fases da Trilha (fora do nivelamento) e da Arena (não no Desafio do Dia) */
function paidHelpsAllowed(sess){
  if(!sess || sess.checked) return false;
  if(sess.kind==='quiz') return sess.mode==='arena';
  return sess.kind==='lesson' && sess.jumpUnit===null && !sess.placement;
}
function canUseLife(sess){
  if(sess.kind==='quiz') return sess.lives !== undefined && sess.lives < ARENA_LIVES + 2;
  return sess.maxWrong===null && heartsNow() < HEARTS_MAX;
}
function paidHelpsBar(sess){
  const bar = h(`<div class="paid-helps" aria-label="Ajudas com moedas"></div>`);
  Object.entries(PAID_HELPS).forEach(([id, hp])=>{
    const used = helpsUsedToday(id), left = hp.perDay - used, q = sess.q;
    const done = id==='fifty' && (q.cut||[]).length;
    const blocked = left<=0 || done || (id==='life' && !canUseLife(sess)) || gemsNow() < hp.cost;
    const b = h(`<button type="button" class="ph ${blocked?'off':''}" title="${hp.tip}"><span>${hp.ico}</span><b>${hp.name}</b><small>${hp.cost} 🪙 · ${Math.max(0,left)}/${hp.perDay} hoje</small></button>`);
    b.onclick = ()=>{
      if(left<=0) return showFloat(`Limite de ${hp.name} por hoje`, true);
      if(done) return;
      if(id==='life' && !canUseLife(sess)) return showFloat(sess.kind==='quiz' ? 'Vidas no máximo' : 'Suas vidas já estão cheias', true);
      if(gemsNow() < hp.cost) return showFloat(`Faltam ${hp.cost - gemsNow()} 🪙`, true);
      usePaidHelp(sess, id);
    };
    bar.appendChild(b);
  });
  return bar;
}
function usePaidHelp(sess, id){
  const g = loadGame(), hp = PAID_HELPS[id], q = sess.q;
  g.gems -= hp.cost;
  g.today.helps = g.today.helps || {}; g.today.helps[id] = (g.today.helps[id]||0) + 1;
  if(id==='fifty'){
    const wrong = q.opts.map((o,i)=> o.ok || (q.out||[]).includes(i) ? -1 : i).filter(i=>i>=0).sort(()=>Math.random()-.5);
    q.cut = wrong.slice(0, Math.min(2, wrong.length - (wrong.length>2 ? 0 : 1)));
  } else if(id==='life'){
    if(sess.kind==='quiz') sess.lives++;
    else { heartsNow(); g.hearts = Math.min(HEARTS_MAX, g.hearts + 1); }
  }
  saveGame();
  playTones([523,784], 0.06, 'triangle', 0.07);
  showFloat(`${hp.ico} ${hp.name} · −${hp.cost} 🪙`);
  render();
}

/* ---------- tela da loja ---------- */
/* raridade pelo preço (só muda a cor e o selo do card) */
const SHOP_TIERS = [
  {id:'free',  name:'Grátis',   max:0},
  {id:'comum', name:'Comum',    max:90},
  {id:'raro',  name:'Raro',     max:150},
  {id:'epico', name:'Épico',    max:400},
  {id:'lenda', name:'Lendário', max:Infinity},
];
function shopTier(it){ return it.rare ? SHOP_TIERS[4] : SHOP_TIERS.find(t=> it.price <= t.max); }
/* fx de comemoração parado, pra prévia do card */
function shopFxPreview(it){
  const emo = it.emo || null, cols = ['#FFB800','#FF5C7A','#33D2E3','#4C7DFF','#B23FE0','#7CFF6B'];
  const spots = [[18,22,-20],[50,12,10],[80,24,25],[28,52,35],[72,54,-15],[50,40,0],[14,78,15],[46,74,-30],[84,80,20]];
  return `<span class="lp-fx">${spots.map(([x,y,r],i)=> emo
    ? `<i style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${r}deg);font-size:${i===5?30:18}px">${emo[i%emo.length]}</i>`
    : `<i class="cf" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${r*2}deg);background:${cols[i%cols.length]}"></i>`).join('')}</span>`;
}
/* a prévia de cada item: o Pi usando, o avatar com a moldura, o cartão ou a comemoração */
function shopPreview(it, big){
  if(it.cat==='hat') return mascotSVG(big?'joy':'happy', big?150:92, {hat:it.id});
  if(it.cat==='acc') return mascotSVG(big?'joy':'happy', big?150:92, {acc:it.id});
  if(it.cat==='frame') return `<span class="lp-av-wrap">${avatarHTML(currentUser, `lp-av ${big?'big':''} fr-${it.id}`)}</span>`;
  if(it.cat==='card'){
    const lv = levelInfo(loadGame().xp);
    return `<span class="lp-card cd-${it.id} ${big?'big':''}"><span class="lp-card-lv">${lv.level}</span><span class="lp-card-l"><b>${escHTML(currentUser ? currentUser.name : '')}</b><i><u style="width:${Math.max(12, lv.pct)}%"></u></i></span><span class="lp-card-s"><em></em><em></em><em></em></span></span>`;
  }
  return shopFxPreview(it);
}
function lojaScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Loja do Pi', true, ()=> history.length > 1 ? history.back() : go('home')));
  const c = h(`<div class="content loja"></div>`);
  wrap.appendChild(c);
  const sh = shopData();
  const cat = state.lojaCat || 'hat';
  const items = SHOP_ITEMS.filter(it=>it.cat===cat);
  // provador: o item tocado aparece no palco antes de comprar
  let tryId = state.lojaTry && items.some(it=>it.id===state.lojaTry) ? state.lojaTry : sh.equip[cat];

  const stage = h(`<section class="lj-stage" aria-live="polite"></section>`);
  c.appendChild(stage);
  function paintStage(){
    const it = shopItem(tryId), tier = shopTier(it);
    const own = !!sh.owned[it.id], on = sh.equip[it.cat]===it.id, can = gemsNow() >= it.price;
    stage.className = `lj-stage t-${tier.id}`;
    stage.innerHTML = `
      <div class="lj-top"><span class="lj-coins"><span class="lj-coin">🪙</span><b>${gemsNow()}</b><small>moedas</small></span><span class="lj-tier">${tier.name}</span></div>
      <div class="lj-spot"></div>
      <div class="lj-show lj-show-${it.cat}">${shopPreview(it, true)}</div>
      <div class="lj-floor"></div>
      <div class="lj-info"><h2></h2><p></p></div>
      <div class="lj-act"></div>`;
    stage.querySelector('h2').textContent = it.name;
    stage.querySelector('p').textContent = on ? 'Em uso agora' : own ? 'Já é seu: toque pra usar' : can ? 'Experimente à vontade antes de comprar' : `Faltam ${it.price - gemsNow()} moedas`;
    const act = stage.querySelector('.lj-act');
    const btn = h(`<button type="button" class="lj-btn"></button>`);
    if(on){ btn.className += ' on'; btn.innerHTML = '✓ Em uso'; btn.disabled = true; }
    else if(own){ btn.innerHTML = 'Usar este'; btn.onclick = ()=>{ shopEquip(it.id); state.lojaTry = null; render(); }; }
    else {
      btn.className += can ? ' buy' : ' poor';
      btn.innerHTML = `Comprar <span class="lj-price">🪙 ${it.price}</span>`;
      btn.onclick = ()=>{
        if(!can){ showFloat(`Faltam ${it.price - gemsNow()} 🪙`, true); return; }
        showConfirm({icon:it.ico, title:`Comprar ${it.name}?`, message:`Custa ${it.price} moedas. Você tem ${gemsNow()}.`, ok:`Comprar por ${it.price} 🪙`, cancel:'Agora não'})
          .then(ok=>{ if(ok && shopBuy(it.id)){ state.lojaTry = null; render(); } });
      };
    }
    act.appendChild(btn);
    if(it.cat==='fx'){
      const fx = h(`<button type="button" class="lj-btn ghost">▶ Ver efeito</button>`);
      fx.onclick = ()=> launchConfetti(90, it.id);
      act.appendChild(fx);
    }
  }
  paintStage();

  const tabs = h(`<div class="lj-tabs" role="tablist"></div>`);
  SHOP_CATS.forEach(ct=>{
    const n = SHOP_ITEMS.filter(it=>it.cat===ct.id && it.price && sh.owned[it.id]).length, tot = SHOP_ITEMS.filter(it=>it.cat===ct.id && it.price).length;
    const b = h(`<button type="button" role="tab" class="lj-tab ${ct.id===cat?'on':''}" aria-selected="${ct.id===cat}"><span class="lj-tab-i">${ct.ico}</span><span class="lj-tab-l">${ct.name.replace(' do Pi','').replace(' do avatar','').replace(' do cartão','')}</span><small>${n}/${tot}</small></button>`);
    b.onclick = ()=>{ if(ct.id===cat) return; state.lojaCat = ct.id; state.lojaTry = null; render(); };
    tabs.appendChild(b);
  });
  c.appendChild(tabs);

  const grid = h(`<div class="lj-grid"></div>`);
  items.forEach(it=>{
    const own = !!sh.owned[it.id], on = sh.equip[it.cat]===it.id, can = gemsNow() >= it.price, tier = shopTier(it);
    const card = h(`<button type="button" class="lj-item t-${tier.id} ${on?'on':''} ${it.id===tryId?'try':''} ${!own && !can?'poor':''}" aria-label="${it.name}">
        <span class="lj-prev lj-prev-${it.cat}">${shopPreview(it, false)}</span>
        ${on ? '<span class="lj-badge on">✓</span>' : own ? '<span class="lj-badge own">Seu</span>' : `<span class="lj-badge tier">${tier.name}</span>`}
        <span class="lj-name"></span>
        <span class="lj-foot">${on ? 'Em uso' : own ? 'Usar' : `<span class="lj-price">🪙 ${it.price}</span>`}</span></button>`);
    card.querySelector('.lj-name').textContent = it.name;
    card.onclick = ()=>{
      tryId = it.id; state.lojaTry = it.id;
      grid.querySelectorAll('.lj-item').forEach(el=> el.classList.toggle('try', el===card));
      playTones([660], 0.03, 'sine', 0.05);
      paintStage();
      void stage.offsetWidth; stage.classList.add('pop');
      if(stage.getBoundingClientRect().bottom < 120) stage.scrollIntoView({behavior:'smooth', block:'start'});
    };
    grid.appendChild(card);
  });
  c.appendChild(grid);

  c.appendChild(h(`<div class="lj-helps">
      <div class="lj-helps-h">💡 Ajudas com moedas <small>nas fases da Trilha e da Arena</small></div>
      <div class="lj-help"><span>✂️</span><div><b>50/50</b><small>Tira duas alternativas erradas</small></div><em>🪙 ${PAID_HELPS.fifty.cost}<small>${PAID_HELPS.fifty.perDay}x por dia</small></em></div>
      <div class="lj-help"><span>❤️</span><div><b>+1 vida</b><small>Uma vida extra na hora do aperto</small></div><em>🪙 ${PAID_HELPS.life.cost}<small>${PAID_HELPS.life.perDay}x por dia</small></em></div>
      <p class="lj-earn">Ganhe moedas nas fases da Trilha, nos baús, na Arena e mantendo a ofensiva. Os itens da loja são só de visual.</p>
    </div>`));
  return wrap;
}
