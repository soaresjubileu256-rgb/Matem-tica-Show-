/* =========================================================
   LEMBRETE — quando avisar e o que escrever
   Usado pelo app (js/dados/lembrete.js) e pelo service worker (sw.js, via importScripts),
   pra notificação ser igual com o app aberto ou fechado.
   O "resumo" (meta) fica no cache "mat-show-meta":
     do app:      on, time, days ('todos'|'semana'), rescue, lastDay, name, streak, quotes{dia:frase}, dailyTag
     do aviso:    notified (dia do aviso principal), notified2 (dia do último aviso), snooze (hora do "daqui a 1 hora")
   ========================================================= */
const REMINDER_RESCUE_MIN = 21*60; // último aviso pra salvar a ofensiva: 21h

function rmDayKey(d){ return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function rmYesterday(d){ const y = new Date(d); y.setDate(y.getDate()-1); return rmDayKey(y); }

/* devolve 'main', 'rescue', 'snooze' ou null */
function reminderDue(m, now){
  if(!m || !m.on) return null;
  const today = rmDayKey(now);
  if(m.lastDay === today) return null;                       // já estudou hoje
  if(m.days === 'semana' && (now.getDay()===0 || now.getDay()===6)) return null;
  const min = now.getHours()*60 + now.getMinutes();
  if(m.snooze && now.getTime() >= m.snooze) return 'snooze';
  if(m.snooze) return null;                                   // esperando o "daqui a 1 hora"
  const [hh, mm] = String(m.time || '19:00').split(':').map(Number);
  if(m.notified !== today && min >= hh*60 + mm) return 'main';
  const alive = m.streak > 0 && m.lastDay === rmYesterday(now);
  if(m.rescue !== false && alive && m.notified2 !== today && min >= REMINDER_RESCUE_MIN && hh*60 + mm < REMINDER_RESCUE_MIN) return 'rescue';
  return null;
}

/* título e texto, variando conforme o dia e a situação */
function reminderMessage(m, kind, now){
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const pickD = arr=> arr[day % arr.length];
  const nm = m.name || '', n = nm ? nm + ', ' : '';
  const s = m.streak || 0, alive = s > 0 && m.lastDay === rmYesterday(now);
  const lost = s > 0 && !alive;
  if(kind === 'rescue') return {title:`⏰ Última chance pra salvar ${s} dia${s===1?'':'s'}!`, body:`${n}a ofensiva zera à meia-noite. Uma fase rapidinha resolve! 🔥`};
  if(alive) return {
    title: pickD([`🔥 ${s} dia${s===1?'':'s'} de ofensiva em jogo!`, '🔥 Não deixa a chama apagar!', `🔥 Ofensiva de ${s} dia${s===1?'':'s'}: bora manter?`]),
    body: pickD([`${n}uma fase rapidinha já salva sua ofensiva. Bora?`, `${n}o Pi guardou seu lugar na Trilha. 2 minutinhos e a chama continua acesa!`, `${n}hoje ainda falta a sua fase. Vamos juntos? ⭐`]),
  };
  if(lost) return {title:'🌱 Bora começar uma nova ofensiva?', body:`${n}todo campeão recomeça. Uma fase hoje e a chama volta a acender!`};
  const quote = m.quotes && m.quotes[rmDayKey(now)];
  return {
    title: pickD(['⭐ Hora do Matemática Show!', nm ? `🎤 O palco é seu, ${nm}!` : '🎤 O palco é seu!', '🧠 Seu cérebro pediu um desafio', '🚀 Bora subir de nível hoje?']),
    body: quote ? `💬 ${quote}` : `${n}o Desafio do Dia${m.dailyTag ? ' ' + m.dailyTag : ''} já está pronto. Vem!`,
  };
}

/* opções completas da notificação */
function reminderNotification(m, kind, now){
  const t = reminderMessage(m, kind, now);
  return {title: t.title, options:{
    body: t.body, icon:'img/icon-192.png', badge:'img/badge-96.png', tag:'lembrete', renotify:true,
    vibrate:[120, 60, 120], timestamp: now.getTime(), data:{url:'./?go=path'},
    actions:[{action:'jogar', title:'▶ Jogar agora'}, {action:'depois', title:'⏰ Daqui a 1 hora'}],
  }};
}
/* marca no resumo que avisou */
function reminderMarkShown(m, kind, now){
  const today = rmDayKey(now);
  if(kind === 'rescue') m.notified2 = today; else m.notified = today;
  if(kind === 'snooze'){ m.snooze = null; m.notified = today; }
  return m;
}
