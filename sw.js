/* Service worker do Matemática Show: deixa o app abrir e funcionar sem internet.
   Estratégias:
   - páginas (HTML): rede primeiro (pega a versão mais nova), cópia guardada se estiver sem internet
   - arquivos do app (JS, CSS, imagens, fontes, manifest): cache primeiro — já vêm todos guardados
     na instalação desta versão, então abrem instantâneos e sem internet
   - dados do aluno NUNCA passam por aqui: ficam no armazenamento do navegador (localStorage)
   Atualização segura:
   - a versão nova baixa TODOS os arquivos (sem usar o cache HTTP) antes de ser instalada;
     se algum download falhar, a instalação falha e a versão antiga continua funcionando
   - o cache antigo só é apagado quando a versão nova assume (activate), com o cache novo pronto
   REGRA: a cada versão publicada, mude APP_VERSION aqui e o ?v= no index.html (senão quem já tem o app continua com os arquivos antigos). */
const APP_VERSION = '23';            // o mesmo número vai no index.html (?v=23) — o teste confere
const CACHE_VERSION = 'mat-show-v' + APP_VERSION;
// JS e CSS levam a versão no endereço: um index.html novo nunca usa um script velho do cache
const VERSIONED = ['style.css', 'storage.js', 'seguranca.js', 'arena.js', 'estudo.js', 'ensino.js', 'aprendizagem.js', 'app.js'].map(f=> `./${f}?v=${APP_VERSION}`);
const APP_SHELL = [
  './', './index.html', ...VERSIONED,
  './manifest.json', './logo.png', './favicon-48.png', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './maskable-512.png',
  './inter-latin.woff2', './inter-latin-ext.woff2', './jetbrains-mono-latin.woff2', './jetbrains-mono-latin-ext.woff2',
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c=> c.addAll(APP_SHELL.map(u=> new Request(u, {cache:'reload'}))))
      .then(()=> self.skipWaiting())
  );
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c=> c.match('./index.html'))
      .then(ok=> ok ? caches.keys() : [])   // só limpa se o cache novo está mesmo pronto
      .then(keys=> Promise.all(keys.filter(k=> k.startsWith('mat-show-') && k!==CACHE_VERSION).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});
function saveCopy(req, res){
  if(res && res.ok && res.type==='basic'){ const copy = res.clone(); caches.open(CACHE_VERSION).then(c=>c.put(req, copy)); }
  return res;
}
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return; // o app não depende de nada de fora
  const isPage = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isPage){
    // rede primeiro; sem internet, a página guardada
    e.respondWith(
      fetch(req).then(res=> saveCopy(req, res))
        .catch(()=> caches.match(req, {ignoreSearch:true}).then(hit=> hit || caches.match('./index.html')))
    );
    return;
  }
  // arquivos do app: cache primeiro; se não estiver guardado, busca na rede e guarda
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=> saveCopy(req, res)))
  );
});
