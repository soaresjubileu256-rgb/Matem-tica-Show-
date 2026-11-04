/* =========================================================
   LEMBRETE DIÁRIO (pela agenda do celular)
   O app não manda notificação: no APK ela só chegava com o app aberto. O lembrete é um
   alarme que se repete todo dia na agenda do celular (Google Agenda ou arquivo .ics),
   e funciona mesmo com o app fechado.
   ========================================================= */
const REMINDER_TIMES = ['07:00','12:00','15:00','18:00','19:00','20:00','21:00'];
function reminderOf(st){ return Object.assign({time:'19:00'}, (st||{}).reminder || {}); }

/* quem tinha ligado a notificação nas versões antigas: desliga a conferência em segundo plano */
try{
  if('serviceWorker' in navigator) navigator.serviceWorker.ready.then(reg=>{ if(reg.periodicSync) reg.periodicSync.unregister('lembrete').catch(()=>{}); }).catch(()=>{});
  localStorage.removeItem('mat-show-lembrete-meta');
}catch(e){}

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
  const card = stCard('⏰', 'Lembrete diário', 'Um alarme todo dia na agenda do celular, pra não esquecer de estudar');
  const r = reminderOf(settings);
  card.appendChild(h(`<div class="rm-note">📅 Escolha o horário e crie o alarme na agenda do celular: ele toca todo dia, mesmo com o app fechado.</div>`));
  const timesWrap = h(`<div class="st-sub"></div>`);
  timesWrap.appendChild(h(`<div class="st-lbl">Horário</div>`));
  timesWrap.appendChild(stSeg(REMINDER_TIMES.map(t=>[t, t.replace(':00','h')]), r.time, async t=>{
    settings.reminder = Object.assign(reminderOf(settings), {time:t}); await saveNow();
  }, 'wrap'));
  card.appendChild(timesWrap);
  card.appendChild(h(`<div class="st-lbl">Criar o alarme</div>`));
  const acts = h(`<div class="st-acts"></div>`);
  const gcal = h(`<button type="button" class="st-act"><span>📅</span><b>Google Agenda</b><small>Abre o evento pronto, repetindo todo dia. É só tocar em Salvar.</small></button>`);
  gcal.onclick = ()=> reminderGoogleCalendar(reminderOf(settings).time);
  const ics = h(`<button type="button" class="st-act"><span>📥</span><b>Arquivo de agenda</b><small>Baixa um arquivo .ics: abra ele e escolha a agenda do celular.</small></button>`);
  ics.onclick = ()=> reminderCalendarFile(reminderOf(settings).time);
  acts.appendChild(gcal); acts.appendChild(ics);
  card.appendChild(acts);
  return card;
}
