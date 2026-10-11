// Carrega os scripts REAIS do app num sandbox do Node (vm), com um localStorage em memória
// e um "document" mínimo. Assim os testes usam exatamente o código que vai pro navegador.
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function memoriaLocal(limite=Infinity){
  const m = new Map();
  return {
    _m: m,
    get length(){ return m.size; },
    key(i){ return [...m.keys()][i] ?? null; },
    getItem(k){ return m.has(k) ? m.get(k) : null; },
    setItem(k, v){
      v = String(v);
      const tam = [...m].reduce((a,[kk,vv])=> a + (kk===k ? 0 : kk.length + vv.length), 0) + k.length + v.length;
      if(tam > limite){ const e = new Error('cheio'); e.name = 'QuotaExceededError'; throw e; }
      m.set(k, v);
    },
    removeItem(k){ m.delete(k); },
    clear(){ m.clear(); },
  };
}
function elementoFalso(){
  const el = {children:[], style:{setProperty(){}}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, dataset:{},
    appendChild(c){ this.children.push(c); return c; }, append(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; },
    addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; },
    insertAdjacentHTML(){}, closest(){ return null; }, focus(){}, click(){}};
  let html = ''; Object.defineProperty(el, 'innerHTML', {get(){ return html; }, set(v){ html = String(v); }});
  Object.defineProperty(el, 'firstElementChild', {get(){ return el; }});
  return el;
}
/* arquivos: lista em ordem (a mesma do index.html); por padrão, os que não desenham telas */
export const TODOS = [...fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1])
  .filter(f=> !['js/iniciar.js','js/registrar-sw.js'].includes(f)); // iniciar.js dá boot() na tela; os testes chamam as funções direto
export const BASICOS = TODOS;
export function carregarApp(arquivos=BASICOS, opts={}){
  const localStorage = opts.localStorage || memoriaLocal(opts.limite);
  const document = {createElement: elementoFalso, createElementNS: elementoFalso, documentElement: elementoFalso(), body: elementoFalso(), head: elementoFalso(),
    querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementById(){ return null; }, addEventListener(){}, removeEventListener(){}};
  const ctx = {console, localStorage, document, crypto: opts.semCrypto ? undefined : webcrypto, TextEncoder, TextDecoder, clearTimeout, clearInterval,
    // timers que não seguram o Node aberto (o app tem um setInterval de 30 s)
    setTimeout: (f, ms, ...a)=>{ const t = setTimeout(f, ms, ...a); t.unref?.(); return t; },
    setInterval: (f, ms, ...a)=>{ const t = setInterval(f, ms, ...a); t.unref?.(); return t; },
    navigator:{userAgent:'node', storage: opts.storage}, location:{origin:'http://x', hash:'', href:'http://x/'}, history:{pushState(){}, replaceState(){}},
    matchMedia: ()=>({matches:false, addEventListener(){}}), requestAnimationFrame: f=>setTimeout(f,0), performance, Blob: globalThis.Blob, URL,
    alert(){}, confirm(){ return true; }, Intl, structuredClone};
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  ctx.addEventListener = ()=>{}; ctx.removeEventListener = ()=>{};
  vm.createContext(ctx);
  // os scripts usam const/let no escopo global: junta tudo num script só para dividirem o mesmo escopo
  const codigo = arquivos.map(f=> `\n/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n')
    + '\n;globalThis.__expor = (expr)=> eval(expr);';
  vm.runInContext(codigo, ctx, {filename: 'app-bundle.js'});
  ctx.$ = expr => ctx.__expor(expr); // avalia um nome do escopo do app (const/let/function)
  return ctx;
}
