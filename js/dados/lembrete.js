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

function reminderOf(st){ return Object.assign({on:false, time:'19:00', days:'todos', rescue:true}, (st||{}).reminder || {}); }
function notifSupported(){ return 'Notification' in window && 'serviceWorker' in navigator; }
function notifAllowed(){ return notifSupported() && Notification.permission === 'granted'; }

/* resumo guardado no cache (o service worker lê o mesmo) — regras e textos em js/dados/lembrete-texto.js */
async function reminderMetaRead(){
  try{ const c = await caches.open(REMINDER_META_CACHE); const r = await c.match(REMINDER_META_URL); return r ? await r.json() : {}; }catch(e){ return {}; }
}
async function reminderMetaWrite(m){
  try{ const c = await caches.open(REMINDER_META_CACHE); await c.put(REMINDER_META_URL, new Response(JSON.stringify(m), {headers:{'Content-Type':'application/json'}})); }catch(e){}
}
/* atualiza a parte do resumo que vem do app (sem mexer no "já avisou" e no "daqui a 1 hora") */
let _reminderMetaLast = '';
async function reminderSyncMeta(){
  if(!('caches' in window) || !currentUser) return;
  try{
    const st = await loadSettings(), r = reminderOf(st), g = loadGame();
    const quotes = {};
    if(typeof dailyQuote === 'function') for(let k=0;k<14;k++){ const d = new Date(); d.setDate(d.getDate()+k); quotes[rmDayKey(d)] = dailyQuote(d); }
    const app = {on: r.on && notifAllowed(), time: r.time, days: r.days || 'todos', rescue: r.rescue !== false, lastDay: g.lastDay || null,
      name: currentUser.name.split(' ')[0], streak: gameStreakNow(), quotes, dailyTag: typeof dailyTag==='function' && typeof isoDay==='function' ? dailyTag(isoDay()) : ''};
    const key = JSON.stringify(app);
    if(key === _reminderMetaLast) return;
    _reminderMetaLast = key;
    await reminderMetaWrite(Object.assign(await reminderMetaRead(), app));
  }catch(e){}
}

async function reminderShow(kind){
  try{
    const m = await reminderMetaRead(), now = new Date();
    const n = reminderNotification(m, kind, now);
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(n.title, n.options);
    if(kind !== 'test') await reminderMetaWrite(reminderMarkShown(m, kind, now));
    return true;
  }catch(e){ return false; }
}

/* chamado a cada minuto (com o app aberto ou em segundo plano) */
async function reminderTick(){
  if(!currentUser || !notifAllowed()) return;
  await reminderSyncMeta();
  const kind = reminderDue(await reminderMetaRead(), new Date());
  if(kind) reminderShow(kind);
}
setInterval(reminderTick, 60000);
// tocou em "Jogar agora" na notificação com o app já aberto: o service worker pede pra abrir a Trilha
if('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e=>{
  if(e.data && e.data.type === 'go' && currentUser && state.screen !== e.data.screen) go(e.data.screen);
});

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

/* Google Agenda: abre o evento já pronto (repete todo dia, com aviso na hora) */
function reminderGoogleCalendar(time){
  const [hh, mm] = time.split(':'), d = new Date(), pad = n=> String(n).padStart(2,'0');
  const day = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const end = `${pad((+hh*60 + +mm + 15) / 60 | 0)}${pad((+mm + 15) % 60)}00`;
  const url = location.href.split('#')[0].split('?')[0];
  let tz = 'America/Sao_Paulo'; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; }catch(e){}
  const q = new URLSearchParams({action:'TEMPLATE', text:'⭐ Hora do Matemática Show!', details:`Jogue uma fase hoje pra manter sua ofensiva. ${url}`,
    dates:`${day}T${hh}${mm}00/${day}T${end}`, recur:'RRULE:FREQ=DAILY', ctz:tz});
  const link = `https://calendar.google.com/calendar/render?${q}`;
  const w = window.open(link, '_blank');
  if(!w){ const a = document.createElement('a'); a.href = link; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
}

/* cartão das Configurações */
function reminderCard(settings, saveNow){
  const card = stCard('⏰', 'Lembrete diário', 'Um aviso na hora que você escolher, pra não esquecer de estudar');
  const r = reminderOf(settings);
  const msg = h(`<div></div>`);
  const canNotify = notifSupported() && Notification.permission !== 'denied';
  const timesWrap = h(`<div class="st-sub"></div>`);
  const paint = ()=> timesWrap.classList.toggle('off', canNotify && !reminderOf(settings).on);
  if(canNotify){
    const sw = stSwitch(r.on, 'Lembrete diário', async v=>{
      if(v){
        const res = await reminderEnable();
        if(res !== 'ok'){
          sw.setAttribute('aria-checked', false);
          stMsg(msg, false, res === 'denied'
            ? 'O celular bloqueou as notificações deste app. Use o alarme na agenda aqui embaixo: ele toca todo dia.'
            : 'Este aparelho não deixa o app mostrar notificações. Use o alarme na agenda aqui embaixo: ele toca todo dia.');
          return;
        }
        stMsg(msg, true, `Pronto! Se você não estudar até as ${reminderOf(settings).time}, o Pi te lembra.`);
      } else msg.innerHTML = '';
      settings.reminder = Object.assign(reminderOf(settings), {on:v});
      await saveNow(); paint(); reminderSyncMeta();
    });
    card.appendChild(stRow('🔔', '#7C5CFF', 'Notificação do app', 'Só avisa se você ainda não tiver jogado', sw));
  } else {
    // APK e celulares que não deixam o app notificar: o caminho é o alarme na agenda
    card.appendChild(h(`<div class="rm-note">📲 Neste aparelho o app não consegue mandar notificação. Escolha o horário e crie um <b>alarme diário na agenda</b> do celular: ele toca todo dia, mesmo com o app fechado.</div>`));
  }
  timesWrap.appendChild(h(`<div class="st-lbl">Horário</div>`));
  timesWrap.appendChild(stSeg(REMINDER_TIMES.map(t=>[t, t.replace(':00','h')]), r.time, async t=>{
    settings.reminder = Object.assign(reminderOf(settings), {time:t});
    await saveNow(); reminderSyncMeta();
  }, 'wrap'));
  if(canNotify){
    timesWrap.appendChild(h(`<div class="st-lbl">Dias</div>`));
    timesWrap.appendChild(stSeg([['todos','📅 Todo dia'],['semana','🏫 Seg a sex']], r.days || 'todos', async d=>{
      settings.reminder = Object.assign(reminderOf(settings), {days:d}); await saveNow(); reminderSyncMeta();
    }));
    timesWrap.appendChild(stRow('🔥', '#FF8A3D', 'Último aviso às 21h', 'Se a ofensiva estiver em risco', stSwitch(r.rescue !== false, 'Último aviso às 21h', async v=>{
      settings.reminder = Object.assign(reminderOf(settings), {rescue:v}); await saveNow(); reminderSyncMeta();
    })));
    const test = h(`<button type="button" class="st-mini">🔔 Testar notificação</button>`);
    test.onclick = async ()=>{
      if(!notifAllowed() && await reminderEnable() !== 'ok'){ stMsg(msg, false, 'O celular não deixou mostrar notificação. Use o alarme na agenda aqui embaixo.'); return; }
      await reminderSyncMeta();
      const ok = await reminderShow('test');
      stMsg(msg, ok, ok ? 'Notificação de teste enviada! Olhe na barra do celular.' : 'Não deu pra mostrar a notificação neste aparelho.');
    };
    timesWrap.appendChild(test);
  }
  card.appendChild(timesWrap); paint();
  card.appendChild(msg);
  card.appendChild(h(`<div class="st-lbl">${canNotify ? 'Ou crie um alarme na agenda' : 'Criar o alarme'}</div>`));
  const acts = h(`<div class="st-acts"></div>`);
  const gcal = h(`<button type="button" class="st-act"><span>📅</span><b>Google Agenda</b><small>Abre o evento pronto, repetindo todo dia. É só tocar em Salvar.</small></button>`);
  gcal.onclick = ()=> reminderGoogleCalendar(reminderOf(settings).time);
  const ics = h(`<button type="button" class="st-act"><span>📥</span><b>Arquivo de agenda</b><small>Baixa um arquivo .ics: abra ele e escolha a agenda do celular.</small></button>`);
  ics.onclick = ()=> reminderCalendarFile(reminderOf(settings).time);
  acts.appendChild(gcal); acts.appendChild(ics);
  card.appendChild(acts);
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
