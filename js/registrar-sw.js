// registra o service worker (funcionamento offline + instalação como app). Se o navegador
// não suportar, ou se estiver rodando fora de um servidor (ex: abrindo o arquivo direto),
// simplesmente não faz nada — o app continua funcionando normal, só sem o modo offline.
// (fica num arquivo próprio porque a política de segurança do index.html não permite <script> embutido)
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
