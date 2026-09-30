/* Service worker do Treino em Casa: deixa o app abrir sem internet.
   - arquivos do app (html, css, js, ícones): tenta a rede primeiro, pra sempre pegar a
     versão mais nova, e usa a cópia guardada quando estiver offline
   - fontes do Google: usa a cópia guardada (elas não mudam)
   Mude CACHE_VERSION quando quiser forçar todo mundo a baixar tudo de novo. */
const CACHE_VERSION = 'treino-casa-v1';
const APP_SHELL = [
  './', './index.html', './style.css', './app.js', './manifest.json',
  './icon.svg', './apple-touch-icon.png', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k.startsWith('treino-casa-') && k!==CACHE_VERSION).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
function saveCopy(req, res){
  if(res && (res.ok || res.type==='opaque')){ const copy = res.clone(); caches.open(CACHE_VERSION).then(c=>c.put(req, copy)); }
  return res;
}
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
    fetch(req).then(res=>saveCopy(req, res))
      .catch(()=> caches.match(req, {ignoreSearch:true}).then(hit=> hit || (req.mode==='navigate' ? caches.match('./index.html') : undefined)))
  );
});
