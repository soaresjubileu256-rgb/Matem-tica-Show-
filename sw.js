/* Service worker do Matemática Show: deixa o app abrir sem internet.
   - arquivos do app (html, css, js, ícones): tenta a rede primeiro, pra sempre pegar a
     versão mais nova, e usa a cópia guardada quando estiver offline
   - fontes do Google: usa a cópia guardada (elas não mudam)
   Mude CACHE_VERSION quando quiser forçar todo mundo a baixar tudo de novo. */
const CACHE_VERSION = 'mat-show-v52';
const APP_SHELL = [
  './', './index.html', './manifest.json', './css/style.css', './js/base/ferramentas.js', './js/base/sons.js',
  './js/base/geometria.js', './js/assuntos/ensino-medio-visual.js', './js/assuntos/fundamental.js',
  './js/assuntos/ensino-medio.js', './js/assuntos/catalogo.js', './js/base/resolvedor.js',
  './js/dados/progresso.js', './js/dados/configuracoes.js', './js/dados/contas.js', './js/base/navegacao.js',
  './js/jogo/xp-e-conquistas.js', './js/jogo/trilha.js', './js/jogo/arena.js', './js/jogo/relampago.js',
  './js/jogo/duelo.js', './js/telas/entrada.js', './js/telas/inicio.js', './js/telas/aprender.js',
  './js/telas/exercicios.js', './js/telas/tabuada.js', './js/telas/estudo.js', './js/telas/ferramentas.js',
  './js/telas/caderno.js', './js/telas/progresso.js', './js/telas/relatorio.js', './js/telas/certificados.js',
  './js/telas/perfil.js', './js/telas/configuracoes.js', './js/telas/ajuda.js', './js/telas/novidades.js', './js/iniciar.js',
  './img/logo.png', './img/favicon-48.png', './img/apple-touch-icon.png', './img/icon-192.png',
  './img/icon-512.png', './img/maskable-512.png',
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k))))
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
