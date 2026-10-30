/* =========================================================
   LEMBRETE DIÁRIO
   - settings.reminder = {on, time:'19:00'}
   - Com o app aberto (ou em segundo plano), confere a cada minuto: passou da hora e a
     pessoa ainda não jogou hoje → mostra a notificação (uma vez por dia).
   - Com o app fechado: onde o navegador deixa (app instalado no Chrome), o service worker
     acorda de tempos em tempos (periodicSync) e faz a mesma conferência. Pra isso ele lê
     um resuminho guardado no cache "mat-show-meta" (o service worker não lê o localStorage).
   - Onde não dá pra notificar (alguns APKs não deixam), dá pra pôr o lembrete na agenda
     do celular (arquivo .ics com alarme todo dia).
   ========================================================= */
const REMINDER_META_CACHE = 'mat-show-meta';
const REMINDER_META_URL = './__lembrete.json';
const REMINDER_TIMES = ['07:00','12:00','15:00','18:00','19:00','20:00','21:00'];

function reminderOf(st){ return Object.assign({on:false, time:'19:00'}, (st||{}).reminder || {}); }
function notifSupported(){ return 'Notification' in window && 'serviceWorker' in navigator; }
function notifAllowed(){ return notifSupported() && Notification.permission === 'granted'; }

/* texto da notificação (o mesmo no app e no service worker) */
function reminderText(name, streak){
  return streak > 0
    ? {title:`🔥 Sua ofensiva de ${streak} dia${streak===1?'':'s'} está esperando!`, body:`${name ? name + ', ' : ''}jogue uma fase hoje pra não perder. O Pi está te esperando!`}
    : {title:'⭐ Hora do Matemática Show!', body:`${name ? name + ', ' : ''}bora treinar um pouquinho? O Desafio do Dia já está pronto.`};
}

/* guarda o resumo que o service worker usa quando o app está fechado */
let _reminderMetaLast = '';
async function reminderSyncMeta(){
  if(!('caches' in window) || !currentUser) return;
  try{
    const st = await loadSettings(), r = reminderOf(st), g = loadGame();
    const meta = {on: r.on && notifAllowed(), time: r.time, lastDay: g.lastDay || null, notified: g.reminderDay || null,
      name: currentUser.name.split(' ')[0], streak: gameStreakNow()};
    const txt = JSON.stringify(meta);
    if(txt === _reminderMetaLast) return;
    _reminderMetaLast = txt;
    const c = await caches.open(REMINDER_META_CACHE);
    await c.put(REMINDER_META_URL, new Response(txt, {headers:{'Content-Type':'application/json'}}));
  }catch(e){}
}

async function reminderShow(){
  const g = loadGame(), name = currentUser ? currentUser.name.split(' ')[0] : '';
  const t = reminderText(name, gameStreakNow());
  try{
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(t.title, {body:t.body, icon:'img/icon-192.png', badge:'img/favicon-48.png', tag:'lembrete', data:{url:'./'}});
    g.reminderDay = dayKey(); saveGame(); reminderSyncMeta();
  }catch(e){}
}

/* chamado a cada minuto */
async function reminderTick(){
  if(!currentUser || !notifAllowed()) return;
  const st = await loadSettings(), r = reminderOf(st);
  if(!r.on) return;
  const g = loadGame(), today = dayKey();
  if(g.lastDay === today || g.reminderDay === today) return; // já jogou ou já avisou hoje
  const [hh, mm] = r.time.split(':').map(Number), now = new Date();
  if(now.getHours()*60 + now.getMinutes() >= hh*60 + mm) reminderShow();
}
setInterval(reminderTick, 60000);

/* liga o lembrete: pede permissão e, se der, registra a conferência em segundo plano */
async function reminderEnable(){
  if(!notifSupported()) return 'unsupported';
  let perm = Notification.permission;
  if(perm === 'default'){ try{ perm = await Notification.requestPermission(); }catch(e){ perm = 'denied'; } }
  if(perm !== 'granted') return perm === 'denied' ? 'denied' : 'unsupported';
  try{
    const reg = await navigator.serviceWorker.ready;
    if('periodicSync' in reg) await reg.periodicSync.register('lembrete', {minInterval: 60*60*1000});
  }catch(e){} // sem periodicSync: o lembrete funciona enquanto o app estiver aberto ou em segundo plano
  return 'ok';
}

/* lembrete na agenda do celular (funciona mesmo sem notificação do app) */
function reminderCalendarFile(time){
  const [hh, mm] = time.split(':');
  const d = new Date(), pad = n=> String(n).padStart(2,'0');
  const start = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${hh}${mm}00`;
  const url = location.href.split('#')[0].split('?')[0];
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Matematica Show//Lembrete//PT','BEGIN:VEVENT',
    `UID:lembrete-${Date.now()}@matematica-show`, `DTSTAMP:${start}`, `DTSTART:${start}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
    'SUMMARY:⭐ Hora do Matemática Show!', `DESCRIPTION:Jogue uma fase hoje pra manter sua ofensiva. ${url}`, `URL:${url}`,
    'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Hora do Matemática Show!','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'}));
  a.download = 'lembrete-matematica-show.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(a.href), 4000);
}

/* cartão das Configurações */
function reminderCard(settings, saveNow){
  const card = stCard('⏰', 'Lembrete diário', 'Um aviso na hora que você escolher, se ainda não tiver estudado no dia');
  const r = reminderOf(settings);
  const msg = h(`<div></div>`);
  const timesWrap = h(`<div class="st-sub"></div>`);
  const paint = ()=> timesWrap.classList.toggle('off', !reminderOf(settings).on);
  const sw = stSwitch(r.on, 'Lembrete diário', async v=>{
    if(v){
      const res = await reminderEnable();
      if(res !== 'ok'){
        sw.setAttribute('aria-checked', false);
        stMsg(msg, false, res === 'denied'
          ? 'O celular bloqueou as notificações deste app. Libere em Configurações do celular → Apps → Notificações, ou use "Pôr na agenda" abaixo.'
          : 'Este aparelho não deixa o app mostrar notificações. Use "Pôr na agenda do celular" abaixo: o alarme toca todo dia.');
        return;
      }
      stMsg(msg, true, `Pronto! Se você não estudar até as ${reminderOf(settings).time}, o Pi te lembra.`);
    } else msg.innerHTML = '';
    settings.reminder = Object.assign(reminderOf(settings), {on:v});
    await saveNow(); paint(); reminderSyncMeta();
  });
  card.appendChild(stRow('🔔', '#7C5CFF', 'Me lembrar todo dia', 'Só avisa se você ainda não tiver jogado', sw));
  timesWrap.appendChild(h(`<div class="st-lbl">Horário</div>`));
  timesWrap.appendChild(stSeg(REMINDER_TIMES.map(t=>[t, t.replace(':00','h')]), r.time, async t=>{
    settings.reminder = Object.assign(reminderOf(settings), {time:t});
    await saveNow(); reminderSyncMeta();
  }, 'wrap'));
  card.appendChild(timesWrap); paint();
  const cal = h(`<button type="button" class="st-act st-act-wide"><span>📅</span><b>Pôr na agenda do celular</b><small>Cria um alarme diário na agenda, no horário escolhido. Funciona mesmo com o app fechado.</small></button>`);
  cal.onclick = ()=> reminderCalendarFile(reminderOf(settings).time);
  card.appendChild(cal);
  card.appendChild(msg);
  return card;
}

/* convite no Início: aparece uma vez, depois do 1º dia jogado */
function reminderInviteCard(){
  const g = loadGame();
  if(g.reminderAsked || !g.lastDay) return null;
  const card = h(`<div class="card rm-invite"><span class="rm-ico">⏰</span><div><b>Quer um lembrete diário?</b><small>O Pi avisa na hora que você escolher, pra não perder a ofensiva.</small></div>
    <div class="rm-btns"><button type="button" class="rm-no">Agora não</button><button type="button" class="rm-yes">Escolher horário</button></div></div>`);
  const done = ()=>{ g.reminderAsked = true; saveGame(); card.remove(); };
  card.querySelector('.rm-no').onclick = done;
  card.querySelector('.rm-yes').onclick = ()=>{ done(); go('settings', {scrollTo:'reminder'}); };
  return card;
}
