/* Service worker do Matemática Show: abre rápido e funciona sem internet.
   - arquivos do app (html, css, js, ícones): abrem direto da cópia guardada neste aparelho
     (antes cada abertura conferia ~60 arquivos na internet; com sinal fraco o app nem abria)
   - versão nova: toda mudança no app muda CACHE_VERSION, então o navegador percebe que este
     arquivo mudou, baixa tudo de novo em segundo plano e troca a versão; a página recarrega
     sozinha num momento seguro (veja o index.html)
   - fontes do Google: usa a cópia guardada (elas não mudam)
   Mude CACHE_VERSION a cada mudança no app. */
const CACHE_VERSION = 'mat-show-v169';
const APP_SHELL = [
  './', './index.html', './manifest.json', './css/style.css', './js/base/ferramentas.js', './js/base/sons.js',
  './js/base/geometria.js', './js/assuntos/ensino-medio-visual.js', './js/assuntos/fundamental.js',
  './js/assuntos/ensino-medio.js', './js/assuntos/complementares-visual.js', './js/assuntos/complementares.js', './js/assuntos/interpretacao.js', './js/assuntos/interpretacao-enem.js', './js/assuntos/interpretacao-etec.js', './js/assuntos/interpretacao-fuvest.js', './js/assuntos/interpretacao-unicamp.js', './js/assuntos/interpretacao-unesp.js', './js/assuntos/interpretacao-obmep.js', './js/assuntos/catalogo.js', './js/assuntos/contexto.js', './js/assuntos/mais-questoes.js', './js/base/resolvedor.js',
  './js/dados/progresso.js', './js/dados/configuracoes.js', './js/dados/contas.js', './js/dados/backup-auto.js', './js/dados/transferir.js', './js/dados/frases.js', './js/base/navegacao.js', './js/base/teclado.js',
  './js/jogo/xp-e-conquistas.js', './js/jogo/trilha.js', './js/jogo/liberar.js', './js/jogo/loja.js', './js/jogo/arena.js', './js/jogo/relampago.js', './js/jogo/contra-relogio.js',
  './js/jogo/duelo.js', './js/telas/entrada.js', './js/telas/hubs.js', './js/telas/inicio.js', './js/telas/animacoes.js', './js/telas/aprender.js',
  './js/telas/exercicios.js', './js/telas/modos-estudo.js', './js/telas/provas.js', './js/telas/simulado-provas.js', './js/telas/tabuada.js', './js/telas/estudo.js', './js/telas/ferramentas.js',
  './js/telas/caderno.js', './js/telas/progresso.js', './js/telas/relatorio.js', './js/telas/ranking.js', './js/telas/certificados.js',
  './js/telas/perfil.js', './js/telas/configuracoes.js', './js/telas/ajuda.js', './js/telas/novidades.js', './js/telas/feedback.js', './js/iniciar.js',
  './img/logo.png', './img/favicon-48.png', './img/apple-touch-icon.png', './img/icon-192.png',
  './img/icon-512.png', './img/maskable-512.png',
];

self.addEventListener('install', e=>{
  // cache:'reload' pula a cópia do navegador (o GitHub Pages guarda arquivos por 10 min),
  // pra versão nova não nascer com algum arquivo velho misturado
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL.map(u=> new Request(u, {cache:'reload'})))).then(()=>self.skipWaiting()));
});
// quando esta versão começou a valer (a página usa pra saber se abriu com a versão velha)
let ACTIVATED_AT = 0;
self.addEventListener('message', e=>{
  if(e.data === 'activated-at' && e.source) e.source.postMessage({activatedAt: ACTIVATED_AT});
});
self.addEventListener('activate', e=>{
  ACTIVATED_AT = Date.now();
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
  // abrir o app (com ou sem ?parâmetros) = index.html guardado desta versão
  const key = req.mode==='navigate' ? './index.html' : req;
  e.respondWith(
    caches.open(CACHE_VERSION).then(c=> c.match(key, {ignoreSearch:true})).then(hit=>{
      if(hit) return hit;
      // não está guardado: busca na internet e guarda (e, sem internet, tenta qualquer cópia antiga)
      return fetch(req, {cache:'no-cache'}).then(res=>saveCopy(req, res))
        .catch(()=> caches.match(key, {ignoreSearch:true}));
    })
  );
});
