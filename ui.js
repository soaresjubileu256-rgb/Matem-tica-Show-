/* =========================================================
   Matemática Show — CAMADA DE INTERFACE (acessibilidade das janelas)
   Toda janela do app usa o mesmo fundo (.gm-modal-bg). Em vez de repetir o mesmo cuidado em
   cada uma, esta camada observa quando uma janela aparece e:
   - marca a caixa como diálogo (role="dialog", aria-modal) com o título como nome
   - leva o foco para dentro (primeiro botão) e mantém o Tab dentro da janela
   - Esc fecha, apertando o botão de fechar/cancelar que a própria janela já tem
     (assim cada janela continua fazendo o que já fazia ao fechar)
   - quando a janela some, o foco volta para onde estava
   Só declara `uiDialogs`; é carregado antes do app.js.
   ========================================================= */
const uiDialogs = (()=>{
  const CLOSE_SEL = '.gm-confirm-cancel, .edu-close, .ar-close, .sk-close, .nh-close, [data-a=skip], [data-a=no], .net-x';
  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const stack = []; // {bg, returnTo}
  let seq = 0;
  // último elemento com foco FORA de qualquer janela (algumas janelas já movem o foco ao abrir)
  let lastOutside = null;
  document.addEventListener('focusin', e=>{ if(e.target && e.target.closest && !e.target.closest('.gm-modal-bg')) lastOutside = e.target; });

  function enhance(bg){
    if(bg.__uiDone) return; bg.__uiDone = true;
    const box = bg.firstElementChild || bg;
    if(!box.getAttribute('role')) box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    if(!box.getAttribute('aria-label') && !box.getAttribute('aria-labelledby')){
      const t = box.querySelector('h1, h2, h3');
      if(t){ if(!t.id) t.id = 'dlg-t' + (++seq); box.setAttribute('aria-labelledby', t.id); }
    }
    const active = document.activeElement;
    stack.push({bg, returnTo: (active && !bg.contains(active) && active !== document.body) ? active : lastOutside});
    // foco dentro da janela (depois que o conteúdo terminou de ser montado)
    setTimeout(()=>{
      if(!bg.isConnected || bg.contains(document.activeElement)) return;
      const first = box.querySelector('[autofocus]') || box.querySelector(FOCUSABLE);
      if(first) first.focus({preventScroll:true});
    }, 30);
  }
  function top(){ for(let i=stack.length-1;i>=0;i--){ if(stack[i].bg.isConnected) return stack[i]; } return null; }
  function cleanup(){
    for(let i=stack.length-1;i>=0;i--){
      const it = stack[i];
      if(it.bg.isConnected) continue;
      stack.splice(i, 1);
      const back = it.returnTo;
      if(back && back.isConnected && !top()) try{ back.focus({preventScroll:true}); }catch(e){ /* elemento não focável: segue */ }
    }
  }
  document.addEventListener('keydown', e=>{
    const t = top(); if(!t) return;
    if(e.key === 'Escape'){
      const close = t.bg.querySelector(CLOSE_SEL);
      if(close){ e.preventDefault(); close.click(); }
      return;
    }
    if(e.key === 'Tab'){
      const items = [...t.bg.querySelectorAll(FOCUSABLE)].filter(x=>x.offsetParent !== null || x === document.activeElement);
      if(!items.length) return;
      const first = items[0], last = items[items.length-1];
      if(!t.bg.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
      else if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  function start(){
    new MutationObserver(muts=>{
      muts.forEach(m=>{
        m.addedNodes.forEach(n=>{ if(n.nodeType===1 && n.classList && n.classList.contains('gm-modal-bg')) enhance(n); });
        if(m.removedNodes.length) cleanup();
      });
    }).observe(document.body, {childList:true});
  }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  return {top, count:()=>stack.filter(x=>x.bg.isConnected).length};
})();
