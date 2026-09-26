/* Service worker do Matemática Show: deixa o app abrir sem internet.
   - páginas: tenta a rede primeiro (pra pegar atualizações) e cai pro cache se estiver offline
   - resto (ícones, fontes): usa o cache e atualiza em segundo plano
   Mude CACHE_VERSION quando quiser forçar todo mundo a baixar tudo de novo. */
const CACHE_VERSION = 'mat-show-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icons/favicon-48.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!sameOrigin && !isFont) return;

  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c=>c.put('./index.html', copy));
        return res;
      }).catch(()=> caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit=>{
      const net = fetch(req).then(res=>{
        if(res && (res.ok || res.type==='opaque')){ const copy = res.clone(); caches.open(CACHE_VERSION).then(c=>c.put(req, copy)); }
        return res;
      }).catch(()=> hit);
      return hit || net;
    })
  );
});
