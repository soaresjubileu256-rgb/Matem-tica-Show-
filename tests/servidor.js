/* Servidor simples pra testar o app localmente (sem instalar nada além do Node).
   Uso: node tests/servidor.js [porta]   → http://localhost:8790 */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const TYPES = {'.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
function start(port){
  const server = http.createServer((req, res)=>{
    let p = decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end(); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control':'no-store'});
    fs.createReadStream(f).pipe(res);
  });
  server.listen(port, ()=> console.log(`Servidor do Matemática Show em http://localhost:${port}`));
  return server;
}
if(require.main === module) start(+process.argv[2] || 8790);
module.exports = {start};
