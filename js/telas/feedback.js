/* =========================================================
   FEEDBACK — "Fale com a gente"
   As mensagens vão para um Formulário Google (as respostas caem numa planilha).
   - Perfil: item "💬 Fale com a gente" abre uma janelinha com a nota (1 a 5 ⭐)
     e o botão que abre o formulário.
   - Uma única vez por conta, depois de FEEDBACK_ASK_AFTER questões respondidas,
     o Início pergunta "Está gostando do app?".
   Pra trocar o formulário: mude FEEDBACK_FORM_URL. Se ficar vazio, nada aparece.
   ========================================================= */
const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSevMpKfBep9PMkn35I9HcUW9ufkImnhR7R9UhnabS09cmyoEQ/viewform';
const FEEDBACK_ASK_AFTER = 50;
const feedbackKey = ()=> `mathstudy-feedback:${currentUserId()}`;
function feedbackData(){ try{ return JSON.parse(localStorage.getItem(feedbackKey())||'{}'); }catch(e){ return {}; } }
function saveFeedbackData(d){ try{ localStorage.setItem(feedbackKey(), JSON.stringify(d)); }catch(e){} }
function feedbackEnabled(){ return /^https:\/\//.test(FEEDBACK_FORM_URL); }
function openFeedbackForm(){ if(feedbackEnabled()) window.open(FEEDBACK_FORM_URL, '_blank', 'noopener'); }

/* janelinha com as estrelas e o botão pro formulário */
function showFeedbackSheet(fromPrompt){
  if(!feedbackEnabled()) return;
  const d = feedbackData();
  const bg = document.createElement('div');
  bg.className = 'gm-modal-bg sheet';
  bg.innerHTML = `<div class="gm-modal fb-box" role="dialog" aria-label="Fale com a gente">
      <div class="fbx-hero">${mascotSVG('joy', 70)}<div><h2>${fromPrompt ? 'Está gostando do app?' : 'Fale com a gente!'}</h2><p>Sua opinião ajuda a deixar o Matemática Show ainda melhor.</p></div></div>
      <div class="fbx-lbl">Que nota você dá pro app?</div>
      <div class="fbx-stars" role="radiogroup" aria-label="Nota de 1 a 5">${[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" aria-label="${n} estrela${n>1?'s':''}">★</button>`).join('')}</div>
      <div class="fbx-msg"></div>
      <button type="button" class="fbx-go">💬 Escrever uma mensagem</button>
      <p class="fbx-note">Abre um formulário rapidinho. Conte o que gostou, o que pode melhorar ou se achou algum erro.</p>
      <button type="button" class="nb-cancel" style="margin-top:6px;background:rgba(255,255,255,.08);color:#fff">${fromPrompt ? 'Agora não' : 'Fechar'}</button>
    </div>`;
  const msg = bg.querySelector('.fbx-msg');
  const paint = n=>{
    bg.querySelectorAll('.fbx-stars button').forEach(b=> b.classList.toggle('on', +b.dataset.n <= n));
    msg.textContent = !n ? '' : n>=4 ? 'Que bom! 🎉 Conta pra gente o que você mais gosta.' : n===3 ? 'Valeu! O que faria o app ficar nota 5?' : 'Poxa! 😕 Conta o que podemos melhorar, a gente lê tudo.';
  };
  paint(d.stars||0);
  bg.querySelectorAll('.fbx-stars button').forEach(b=> b.onclick = ()=>{
    const n = +b.dataset.n; d.stars = n; d.ts = Date.now(); saveFeedbackData(d); paint(n);
    playTones([523 + n*60], 0.06, 'triangle', 0.05);
  });
  bg.querySelector('.fbx-go').onclick = ()=>{ d.sent = Date.now(); saveFeedbackData(d); openFeedbackForm(); bg.remove(); queueToast('💬', 'Obrigado!', 'Sua opinião faz o show ficar melhor'); };
  bg.querySelector('.nb-cancel').onclick = ()=> bg.remove();
  bg.addEventListener('click', e=>{ if(e.target===bg) bg.remove(); });
  document.body.appendChild(bg);
}

/* pergunta uma vez só, depois que a pessoa já usou bastante o app */
async function maybeAskFeedback(){
  if(!feedbackEnabled() || !currentUser) return false;
  const d = feedbackData();
  if(d.asked) return false;
  const progress = await loadProgress();
  const total = Object.values(progress).reduce((a,x)=>a+(x.attempted||0), 0);
  if(total < FEEDBACK_ASK_AFTER) return false;
  d.asked = Date.now(); saveFeedbackData(d);
  showFeedbackSheet(true);
  return true;
}
