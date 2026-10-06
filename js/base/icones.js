/* =========================================================
   ÍCONES NO LUGAR DOS EMOJIS
   O app não mostra emojis: tudo que aparece na tela passa por aqui.
   - Emoji que serve de ícone vira um ícone desenhado (SVG de linha, na cor do texto,
     alguns com cor própria: chama laranja, estrela dourada, coração vermelho…).
   - Emoji que é só enfeite numa frase (🎉, 🚀, 😄…) é tirado.
   - Quadradinhos e bolinhas coloridas (🟩 🟥 🟢…) viram formas coloridas.
   Funciona sozinho: um MutationObserver olha tudo que entra na página (telas, janelas,
   avisos) e troca na hora. Teclas e símbolos de conta (⌫ ⇔ ↔ ⬆ ✓ ★ …) continuam.
   Pra trocar um ícone: mude o desenho em ICON_PATHS ou o nome em EMOJI_ICON.
   ========================================================= */
const ICON_PATHS = {
  flame:'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.5 2.5 2.5C12 8 12 5.5 12 3z',
  star:'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z',
  trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4',
  medal:'M8 3l2.5 5M16 3l-2.5 5M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 12.5v4',
  crown:'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 19h14',
  bolt:'M13 3L5 13.5h6L10 21l8-10.5h-6z',
  target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  book:'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  doc:'M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6',
  cap:'M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6',
  repeat:'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
  coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5',
  diamond:'M6 3h12l4 6-10 12L2 9zM2 9h20M12 21L8 9l4-6 4 6z',
  map:'M9 4L3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4zM9 4v14M15 6.5v14',
  pin:'M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  pencil:'M15 4l5 5L9 20H4v-5zM13 6l5 5',
  lock:'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  key:'M8 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM11.5 11.5L21 21M17 17l2-2M19.5 19.5l2-2',
  mic:'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7',
  sound:'M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  mute:'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
  sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  gift:'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 0 6-1.5S14 5 12 9',
  heart:'M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.5-7.5 10-7.5 10z',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  timer:'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 1.5M10 2h4M19 5l1.5 1.5',
  swords:'M4 4l10 10M4 4h4M4 4v4M20 4L10 14M20 4h-4M20 4v4M7 17l-3 3M17 17l3 3M8 13l3 3M16 13l-3 3',
  check:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.8 2.8L16.5 9.5',
  cross:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
  sprout:'M12 21v-9M12 12c0-4-3-7-8-7 0 4 3 7 8 7zM12 15c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z',
  rocket:'M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2M9 15l-2-2c1-5 5.5-9.5 13-10-.5 7.5-5 12-10 13zM14.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  film:'M3 9h18v11H3zM3 9l2.5-5L21 5.5 20 9M8.5 4.5L7 9M14.5 5L13 9',
  compass:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  chart:'M3.5 20.5h17M6.5 20.5v-6M11.5 20.5V6M16.5 20.5v-9.5',
  trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
  save:'M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7',
  upload:'M12 15V3M7 8l5-5 5 5M4 15v6h16v-6',
  download:'M12 3v12M7 10l5 5 5-5M4 15v6h16v-6',
  skip:'M5 5l7 7-7 7zM13 5l7 7-7 7',
  help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  shuffle:'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  alert:'M12 3l10 18H2zM12 10v5M12 18h.01',
  trash:'M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6.5 6.5 0 0 1 4 7',
  chat:'M4 5h16v11H9l-5 4z',
  gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  calc:'M5 3h14v18H5zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  keyboard:'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  dice:'M4 4h16v16H4zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01',
  cards:'M8 3h11v15H8zM5 6v15h11',
  triangle:'M12 4l9 16H3z',
  ruler:'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
  hash:'M5 9h15M4 15h15M10 3L8 21M16 3l-2 18',
  sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
  logout:'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  bell:'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  flag:'M5 21V4M5 4h11l-2 4 2 4H5',
  printer:'M7 9V3h10v6M7 17H4v-8h16v8h-3M7 14h10v7H7z',
  camera:'M4 7h4l2-3h4l2 3h4v13H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  image:'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  box:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  phone:'M7 2h10v20H7zM11 18h2',
  home:'M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  folder:'M3 6h6l2 2h10v11H3z',
  plus:'M12 5v14M5 12h14',
  divide:'M5 12h14M12 7h.01M12 17h.01',
  times:'M6 6l12 12M18 6L6 18',
  brush:'M14 4l6 6-8 8-6-6zM6 12l-3 6 6-3',
  ladder:'M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10',
  broom:'M14 3l-3 8M7 11h10l2 10H5z',
};
/* emoji → ícone (nome em ICON_PATHS) e cor opcional. Emoji que não está aqui é tirado. */
const IC_ORANGE = '#FF7A00', IC_GOLD = '#F2B200', IC_RED = '#FF5C7A', IC_GREEN = '#12B886', IC_CYAN = '#22B8CF';
const EMOJI_ICON = {
  '🔥':['flame',IC_ORANGE], '🌋':['flame',IC_ORANGE],
  '⭐':['star',IC_GOLD], '🌟':['star',IC_GOLD], '🧩':['star'], '🌌':['star'],
  '🏆':['trophy',IC_GOLD], '🎖️':['medal',IC_GOLD], '🏅':['medal',IC_GOLD], '🥇':['medal',IC_GOLD], '🥈':['medal','#9AA4B8'], '🥉':['medal','#C9844A'],
  '👑':['crown',IC_GOLD],
  '⚡':['bolt',IC_GOLD], '☄️':['bolt',IC_ORANGE], '🌩️':['bolt'], '🏃':['bolt'], '💪':['bolt'],
  '🎯':['target',IC_RED], '🏹':['target'],
  '💡':['bulb',IC_GOLD], '🧠':['bulb'], '💭':['bulb'], '🤔':['help'],
  '📖':['book'], '📘':['book'], '📗':['book'], '📚':['book'], '🎒':['book'],
  '📜':['doc'], '📄':['doc'], '📋':['doc'], '🗂️':['folder'],
  '🎓':['cap'], '🏫':['cap'], '🏛️':['cap'],
  '🔁':['repeat'], '↶':['repeat'],
  '🪙':['coin',IC_GOLD], '💎':['diamond',IC_CYAN],
  '🗺️':['map'], '📍':['pin'], '📌':['pin'],
  '📝':['pencil'], '✏️':['pencil'], '✍️':['pencil'], '✒️':['pencil'], '✎':['pencil'], '🖌️':['brush'],
  '🔒':['lock'], '🔐':['lock'], '🔑':['key'],
  '🎤':['mic'], '🔊':['sound'], '🔈':['sound'], '🔉':['sound'], '🎵':['sound'], '🗣️':['sound'], '🔇':['mute'],
  '🎉':['sparkle',IC_GOLD], '✨':['sparkle',IC_GOLD],
  '🎁':['gift',IC_RED],
  '❤️':['heart',IC_RED], '💔':['heart',IC_RED], '🩹':['heart'],
  '⏱':['timer'], '⏱️':['timer'], '⏰':['clock'], '⏳':['clock'], '🕘':['clock'],
  '⚔️':['swords'], '🤝':['users'],
  '✅':['check',IC_GREEN], '❌':['cross',IC_RED],
  '🌱':['sprout',IC_GREEN], '🐣':['sprout',IC_GREEN],
  '🚀':['rocket'],
  '🎬':['film'],
  '🧭':['compass'],
  '📊':['chart'], '📈':['trend'],
  '💾':['save'], '📤':['upload'], '📥':['download'], '📦':['box'],
  '⏩':['skip'], '⏭':['skip'],
  '👀':['eye'], '👁':['eye'], '🙈':['eye'], '👓':['eye'],
  '🔀':['shuffle'],
  '⚠️':['alert',IC_GOLD], '🆘':['alert',IC_RED], '🧨':['alert',IC_RED],
  '🗑️':['trash'], '🗑':['trash'], '🧹':['broom'],
  '👤':['user'], '👥':['users'],
  '💬':['chat'], '📣':['chat'],
  '⚙️':['gear'], '🔧':['gear'], '🧰':['gear'],
  '🧮':['calc'], '⌨️':['keyboard'], '⌨':['keyboard'],
  '🎲':['dice'], '🃏':['cards'],
  '🔺':['triangle'], '📐':['triangle'], '📏':['ruler'],
  '🔢':['hash'], '💯':['check',IC_GREEN],
  '☀️':['sun'], '🌙':['moon'], '🧊':['shield',IC_CYAN], '🛡️':['shield'],
  '🔍':['search'], '🔎':['search'], '🔬':['search'],
  '🌎':['globe'], '🚪':['logout'], '🔔':['bell'], '🏁':['flag'],
  '🖨️':['printer'], '📷':['camera'], '🖼️':['image'], '📱':['phone'], '📳':['phone'],
  '🏠':['home'], '🗓️':['clock'], '📅':['clock'],
  '➕':['plus'], '➗':['divide'], '✖️':['times'], '❓':['help'],
  '🪜':['ladder'], '🎮':['trophy'], '🍕':['star'], '🧙':['star'], '🔢':['hash'],
};
/* formas coloridas (resultado do Desafio do Dia, legendas) */
const EMOJI_SHAPE = {'🟩':['sq','#12B886'], '🟥':['sq','#FF5C7A'], '🟦':['sq','#4C7DFF'], '⬜':['sq','#C9CEDD'],
  '🟢':['dot','#12B886'], '🟡':['dot','#FFB800'], '🔴':['dot','#FF5C7A'], '⚪':['dot','#C9CEDD']};
const EMOJI_RE = /(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{2300}-\u{23FF}\u{2934}\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}](?:\u{FE0F}|\u{200D}[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}](?:\u{FE0F})?|[\u{1F3FB}-\u{1F3FF}])*|[0-9#*]\u{FE0F}?\u{20E3})/gu;
const EMOJI_KEEP = new Set(['⌫','✓','✗','✕','★','☆','✔','⇔','↔','⇅','⬆','⬇','⇪','⌂','☐','☑','⚬']);
function iconSVG(name, color){
  const d = ICON_PATHS[name];
  if(!d) return '';
  return `<svg class="ei" viewBox="0 0 24 24" aria-hidden="true"${color?` style="color:${color}"`:''}><path d="${d}"/></svg>`;
}
function emojiKey(e){ return EMOJI_ICON[e] || EMOJI_ICON[e.replace(/\u{FE0F}/gu,'')] || EMOJI_ICON[e+'\u{FE0F}'] || null; }
/* tira os emojis de um texto simples (pra atributos e textos que não são HTML) */
function stripEmoji(s){
  return String(s).replace(EMOJI_RE, m=> EMOJI_KEEP.has(m.replace(/\u{FE0F}/gu,'')) ? m : '').replace(/ {2,}/g,' ').replace(/^ | $/g,'');
}
/* troca os emojis de um nó de texto por ícones/formas (ou tira) */
function replaceEmojiInTextNode(node){
  const txt = node.nodeValue;
  EMOJI_RE.lastIndex = 0;
  if(!txt || !EMOJI_RE.test(txt)) return;
  EMOJI_RE.lastIndex = 0;
  const parent = node.parentNode;
  if(!parent) return;
  // dentro de SVG (selo do certificado etc.) só dá pra tirar
  // dentro de SVG (selo do certificado etc.) só dá pra tirar. Só regrava se mudou:
  // regravar o mesmo texto dispara o observador de novo e trava a página num laço sem fim
  if(parent.namespaceURI === 'http://www.w3.org/2000/svg'){ const nv = stripEmoji(txt); if(nv !== txt) node.nodeValue = nv; return; }
  const frag = document.createDocumentFragment();
  let last = 0, m, changed = false;
  while((m = EMOJI_RE.exec(txt))){
    const e = m[0], bare = e.replace(/\u{FE0F}/gu,'');
    if(EMOJI_KEEP.has(bare)) continue;
    changed = true;
    let before = txt.slice(last, m.index);
    const ic = emojiKey(e), sh = EMOJI_SHAPE[bare];
    if(!ic && !sh){
      // enfeite: tira o emoji e um espaço sobrando
      if(before.endsWith(' ') && (txt[m.index+e.length]===' ' || m.index+e.length>=txt.length)) before = before.slice(0,-1);
      if(before) frag.appendChild(document.createTextNode(before));
      last = m.index + e.length;
      if(!before && txt[last]===' ') last++;
      continue;
    }
    if(before) frag.appendChild(document.createTextNode(before));
    const span = document.createElement('span');
    span.className = sh ? `es es-${sh[0]}` : 'ei-w';
    if(sh) span.style.background = sh[1];
    else span.innerHTML = iconSVG(ic[0], ic[1]);
    frag.appendChild(span);
    last = m.index + e.length;
  }
  if(!changed) return;
  const rest = txt.slice(last);
  if(rest) frag.appendChild(document.createTextNode(rest));
  parent.replaceChild(frag, node);
}
const EMOJI_ATTRS = ['title','aria-label','placeholder','alt'];
function replaceEmojiIn(root){
  if(!root) return;
  if(root.nodeType===3){ if(!/^(SCRIPT|STYLE|TEXTAREA)$/.test((root.parentNode||{}).nodeName||'')) replaceEmojiInTextNode(root); return; }
  if(root.nodeType!==1) return;
  if(/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(root.nodeName)) return;
  EMOJI_ATTRS.forEach(a=>{ if(root.hasAttribute && root.hasAttribute(a)){ const v = root.getAttribute(a); const nv = stripEmoji(v); if(nv!==v) root.setAttribute(a, nv); } });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: n=> n.nodeType===1 && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const texts = [], els = [];
  while(walker.nextNode()){ const n = walker.currentNode; if(n.nodeType===3) texts.push(n); else els.push(n); }
  els.forEach(el=> EMOJI_ATTRS.forEach(a=>{ if(el.hasAttribute(a)){ const v = el.getAttribute(a); const nv = stripEmoji(v); if(nv!==v) el.setAttribute(a, nv); } }));
  texts.forEach(replaceEmojiInTextNode);
}
(function watchEmojis(){
  if(typeof MutationObserver==='undefined') return;
  const obs = new MutationObserver(list=>{
    list.forEach(m=>{
      if(m.type==='characterData') replaceEmojiIn(m.target);
      else m.addedNodes.forEach(n=> replaceEmojiIn(n));
    });
  });
  const start = ()=>{ replaceEmojiIn(document.body); obs.observe(document.body, {childList:true, subtree:true, characterData:true}); };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
