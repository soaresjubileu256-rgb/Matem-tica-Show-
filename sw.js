/* Service worker do Matemática Show: deixa o app abrir sem internet.
   - arquivos do app (html, css, js, ícones): tenta a rede primeiro, pra sempre pegar a
     versão mais nova, e usa a cópia guardada quando estiver offline
   - fontes do Google: usa a cópia guardada (elas não mudam)
   Mude CACHE_VERSION quando quiser forçar todo mundo a baixar tudo de novo. */
const CACHE_VERSION = 'mat-show-v142';
const APP_SHELL = [
  './', './index.html', './manifest.json', './css/style.css', './js/base/ferramentas.js', './js/base/sons.js',
  './js/base/geometria.js', './js/assuntos/ensino-medio-visual.js', './js/assuntos/fundamental.js',
  './js/assuntos/ensino-medio.js', './js/assuntos/complementares-visual.js', './js/assuntos/complementares.js', './js/assuntos/interpretacao.js', './js/assuntos/interpretacao-enem.js', './js/assuntos/interpretacao-etec.js', './js/assuntos/interpretacao-fuvest.js', './js/assuntos/interpretacao-unicamp.js', './js/assuntos/interpretacao-unesp.js', './js/assuntos/interpretacao-obmep.js', './js/assuntos/catalogo.js', './js/assuntos/contexto.js', './js/base/resolvedor.js',
  './js/dados/progresso.js', './js/dados/configuracoes.js', './js/dados/contas.js', './js/dados/backup-auto.js', './js/dados/frases.js', './js/dados/lembrete.js', './js/base/navegacao.js', './js/base/teclado.js',
  './js/jogo/xp-e-conquistas.js', './js/jogo/trilha.js', './js/jogo/liberar.js', './js/jogo/loja.js', './js/jogo/arena.js', './js/jogo/relampago.js', './js/jogo/contra-relogio.js',
  './js/jogo/duelo.js', './js/telas/entrada.js', './js/telas/inicio.js', './js/telas/animacoes.js', './js/telas/aprender.js',
  './js/telas/exercicios.js', './js/telas/modos-estudo.js', './js/telas/provas.js', './js/telas/simulado-provas.js', './js/telas/tabuada.js', './js/telas/estudo.js', './js/telas/ferramentas.js',
  './js/telas/caderno.js', './js/telas/progresso.js', './js/telas/relatorio.js', './js/telas/ranking.js', './js/telas/certificados.js',
  './js/telas/perfil.js', './js/telas/configuracoes.js', './js/telas/ajuda.js', './js/telas/novidades.js', './js/telas/feedback.js', './js/iniciar.js',
  './img/logo.png', './img/favicon-48.png', './img/apple-touch-icon.png', './img/icon-192.png',
  './img/icon-512.png', './img/maskable-512.png',
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION && k!=='mat-show-meta').map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
function saveCopy(req, res){
  if(res && (res.ok || res.type==='opaque')){ const copy = res.clone(); caches.open(CACHE_VERSION).then(c=>c.put(req, copy)); }
  return res;
}
/* ---------- lembrete diário com o app fechado (js/dados/lembrete.js) ---------- */
const REMINDER_META_URL = './__lembrete.json';
function swDayKey(d){ return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
async function reminderCheck(){
  const c = await caches.open('mat-show-meta');
  const res = await c.match(REMINDER_META_URL); if(!res) return;
  const m = await res.json();
  const now = new Date(), today = swDayKey(now);
  if(!m.on || m.lastDay===today || m.notified===today) return;
  const [hh, mm] = String(m.time||'19:00').split(':').map(Number);
  if(now.getHours()*60 + now.getMinutes() < hh*60 + mm) return;
  const name = m.name ? m.name + ', ' : '';
  const title = m.streak > 0 ? `🔥 Sua ofensiva de ${m.streak} dia${m.streak===1?'':'s'} está esperando!` : '⭐ Hora do Matemática Show!';
  const body = m.streak > 0 ? `${name}jogue uma fase hoje pra não perder. O Pi está te esperando!` : `${name}bora treinar um pouquinho? O Desafio do Dia já está pronto.`;
  await self.registration.showNotification(title, {body, icon:'img/icon-192.png', badge:'img/favicon-48.png', tag:'lembrete', data:{url:'./'}});
  m.notified = today;
  await c.put(REMINDER_META_URL, new Response(JSON.stringify(m), {headers:{'Content-Type':'application/json'}}));
}
self.addEventListener('periodicsync', e=>{ if(e.tag==='lembrete') e.waitUntil(reminderCheck().catch(()=>{})); });
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list=>{
    const w = list.find(c=> 'focus' in c);
    return w ? w.focus() : self.clients.openWindow('./');
  }));
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=> hit || fetch(req).then(res=>saveCopy(req, res))));
    return;
  }
  if(url.origin !== location.origin) return;
  e.respondWith(
    // cache:'no-cache' confere com o servidor em vez de usar a cópia do navegador
    // (o GitHub Pages deixa os arquivos guardados por 10 minutos e a versão nova demorava a chegar)
    fetch(req, {cache:'no-cache'}).then(res=>saveCopy(req, res))
      .catch(()=> caches.match(req, {ignoreSearch:true}).then(hit=> hit || (req.mode==='navigate' ? caches.match('./index.html') : undefined)))
  );
});
