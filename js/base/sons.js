/* =========================================================
   SONS E VIBRAÇÃO — tudo gerado na hora com Web Audio (sem arquivos de áudio)
      playTones: o "motor" (volume, limitador, timbre suave, sem atropelo)
      playFeedbackSound / giveAnswerFeedback: acerto e erro
   ========================================================= */
/* som de acerto (duas notas subindo) e de erro (duas notas descendo, baixinho, sem susto) */
let _audioCtx = null;
function playFeedbackSound(correct){
  if(correct) playTones([784,1175], 0.07, 'triangle', 0.11);
  else playTones([330,247], 0.12, 'sine', 0.1);
}
function playFeedbackVibration(correct){
  if(!currentSettingsSync().vibration) return;
  try{ navigator.vibrate && navigator.vibrate(correct ? 40 : [40,60,40]); }catch(e){}
}
/* chamada única pra disparar som + vibração juntos, sempre que uma resposta é corrigida */
function giveAnswerFeedback(correct){
  playFeedbackSound(correct);
  playFeedbackVibration(correct);
}

/* ---------- sons (Web Audio, sem arquivos) ----------
   Tudo passa por um volume geral + limitador (não estoura quando vários sons tocam juntos)
   e um filtro que tira o chiado agudo. Cada nota é uma onda suave com um harmônico leve,
   parecido com um sininho. Pedidos de onda "quadrada"/"dente de serra" (ásperas) viram esse
   mesmo timbre suave, então nenhum som do app soa como alarme. */
const SOUND_VOLUMES = {baixo:0.45, medio:0.8, alto:1.15};
let _sfx = null;
const _sfxLast = {t:0, big:0, key:''};
function sfxOut(){
  _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const ctx = _audioCtx;
  if(ctx.state === 'suspended') ctx.resume().catch(()=>{}); // iPhone/Android começam com o áudio pausado
  if(!_sfx || _sfx.ctx !== ctx){
    const master = ctx.createGain(), lp = ctx.createBiquadFilter(), comp = ctx.createDynamicsCompressor();
    lp.type = 'lowpass'; lp.frequency.value = 5000;
    comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    _sfx = {ctx, master};
  }
  _sfx.master.gain.value = SOUND_VOLUMES[currentSettingsSync().volume] || SOUND_VOLUMES.medio;
  return _sfx;
}
function playTones(freqs, step, type, vol){
  if(!currentSettingsSync().sound || document.hidden) return;
  // sem atropelo: uma fanfarra (4+ notas) cala os bipes curtos que viriam logo depois,
  // o mesmo som repetido em seguida é ignorado e sons diferentes tocam um depois do outro
  const now = performance.now(), big = freqs.length >= 4, key = freqs.join(',');
  if(!big && now - _sfxLast.big < 400) return;
  if(key === _sfxLast.key && now - _sfxLast.t < 90) return;
  const delay = (!big && now - _sfxLast.t < 120) ? 0.13 : 0;
  _sfxLast.t = now; _sfxLast.key = key; if(big) _sfxLast.big = now;
  try{
    const {ctx, master} = sfxOut(), t0 = ctx.currentTime + 0.01 + delay;
    const peak = Math.min(0.16, vol || 0.12);
    freqs.forEach((f,i)=>{
      const s = t0 + i*step, dur = step + 0.24;
      const g = ctx.createGain(); g.connect(master);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(peak, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      const o = ctx.createOscillator(); o.type = type === 'sine' ? 'sine' : 'triangle'; o.frequency.value = f; o.connect(g);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain(); // harmônico leve: dá brilho sem ficar estridente
      o2.type = 'sine'; o2.frequency.value = f*2; g2.gain.value = 0.16; o2.connect(g2); g2.connect(g);
      o.start(s); o2.start(s); o.stop(s + dur + 0.02); o2.stop(s + dur + 0.02);
    });
  }catch(e){}
}
function playComboSound(combo){
  const up = Math.min(combo,10)*40;
  playTones([660+up, 880+up, 1100+up], 0.06, 'triangle', 0.08);
}
