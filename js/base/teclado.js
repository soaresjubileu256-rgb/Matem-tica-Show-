/* =========================================================
   ATALHOS DE TECLADO (computador)
   - Esc: fecha o que estiver por cima (correção animada, aviso, folha de opções)
   - Fase da Trilha / Arena: 1–4 (ou A–D) escolhe a alternativa, Enter confirma / vai pra próxima
   - Correção animada: ← e → passam os passos, espaço pausa
   Os modos que já têm teclas próprias (Relâmpago, Contra o relógio, Simulado, Tabuada) continuam iguais.
   ========================================================= */
function kbVisible(el){ return el && el.offsetParent !== null && !el.disabled; }
function kbClick(sel){ const el = [...document.querySelectorAll(sel)].reverse().find(kbVisible); if(el){ el.click(); return true; } return false; }

document.addEventListener('keydown', e=>{
  if(e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable);

  // Esc: o que estiver por cima fecha primeiro
  if(e.key === 'Escape'){
    if(kbClick('.sp-full .sp-x') || kbClick('.gm-modal-bg .gm-confirm-cancel')){ e.preventDefault(); return; }
    const bg = [...document.querySelectorAll('.gm-modal-bg')].pop();
    if(bg){ e.preventDefault(); bg.click(); return; } // folhas que fecham tocando fora
    return;
  }
  if(typing) return;
  // Enter/espaço num botão com foco: o navegador já clica nele (não clicar duas vezes)
  if((e.key === 'Enter' || e.key === ' ') && e.target && e.target.tagName === 'BUTTON') return;

  // correção animada aberta
  const sp = document.querySelector('.sp-full');
  if(sp){
    if(e.key === 'ArrowRight'){ e.preventDefault(); kbClick('.sp-full .sp-next'); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); kbClick('.sp-full .sp-prev'); }
    else if(e.key === ' '){ e.preventDefault(); kbClick('.sp-full .sp-play'); }
    else if(/^[1-4]$/.test(e.key)){ const o = [...sp.querySelectorAll('.sp-opt')].filter(kbVisible)[+e.key-1]; if(o){ e.preventDefault(); o.click(); } }
    return;
  }
  if(document.querySelector('.gm-modal-bg')){
    if(e.key === 'Enter' && kbClick('.gm-modal-bg .gm-confirm-ok, .gm-modal-bg .gm-modal button')) e.preventDefault();
    return;
  }

  // fase da Trilha, Desafio do Dia, Quiz e Arena (mesma tela de questão)
  if(state.screen === 'lesson'){
    const k = e.key.toLowerCase();
    const n = /^[1-4]$/.test(k) ? +k : 'abcd'.indexOf(k) + 1;
    if(n > 0){
      const opts = [...document.querySelectorAll('.mc-opts .mc-opt, .quiz-opts .quiz-opt')];
      const o = opts[n-1];
      if(o && kbVisible(o)){ e.preventDefault(); o.click(); }
      return;
    }
    if(e.key === 'Enter'){
      if(kbClick('.fb-sheet > .show-btn') || kbClick('.lesson-footer .show-btn')) e.preventDefault();
    }
  }
});
