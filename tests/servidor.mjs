// Servidor estático mínimo para os testes de navegador (sem dependências).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const TIPOS = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
export function iniciarServidor(raiz, porta=0){
  return new Promise(ok=>{
    const srv = http.createServer((req, res)=>{
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if(p.endsWith('/')) p += 'index.html';
      const arq = path.join(raiz, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
      if(!arq.startsWith(raiz) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()){ res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, {'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream'});
      fs.createReadStream(arq).pipe(res);
    });
    srv.listen(porta, '127.0.0.1', ()=> ok({srv, url:`http://127.0.0.1:${srv.address().port}/`}));
  });
}
