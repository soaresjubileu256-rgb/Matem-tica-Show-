/* =========================================================
   Matemática Show — TESTE MATEMÁTICO DOS GERADORES (P1.5)
   Como rodar:  node teste-geradores.js [quantidade por assunto e nível, padrão 1000]
   Para cada assunto e nível gera milhares de questões e, SEM usar a resposta do app,
   lê o enunciado, resolve a conta de novo e compara. Também confere:
   enunciado não vazio, resposta válida, nível válido, assunto válido e frações simplificadas.
   Um enunciado que o resolvedor não reconhece conta como falha (nada passa sem conferir).
   ========================================================= */
const path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = 'file://' + path.join(__dirname, 'index.html');
const N = +process.argv[2] || 1000;

/* resolvedor independente — roda dentro da página, só olha o texto da questão */
function solveAll(N){
  const DIFFS = ['facil','medio','dificil'];
  const num = t=> parseFloat(String(t).replace(/\./g,'').replace(',', '.'));
  const nums = q=> (q.match(/−?-?\d+(?:[.,]\d+)?/g)||[]).map(x=>num(x.replace('−','-')));
  const gcd = (a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; };
  const lcm = (a,b)=> a/gcd(a,b)*b;
  const r2 = v=> Math.round(v*100)/100;
  // expressão com os símbolos do app → JavaScript
  function evalExpr(t, vars){
    let e = String(t).replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/(\d),(\d)/g,'$1.$2')
      .replace(/√\s*(\d+(?:\.\d+)?)/g,'Math.sqrt($1)').replace(/²/g,'**2').replace(/³/g,'**3')
      .replace(/(\d)\s*([xy(])/g,'$1*$2').replace(/\)\s*\(/g,')*(');
    if(!/^[\d\s+\-*/().xyMathsqr]*$/.test(e)) throw new Error('expressão estranha: '+t);
    return Function('x','y', `return (${e});`)(vars ? vars.x : 0, vars ? vars.y : 0);
  }
  function linear2(side){ // coeficientes de a·x + b·y + c
    const f = (x,y)=> evalExpr(side, {x,y});
    const c = f(0,0); return {a:f(1,0)-c, b:f(0,1)-c, c};
  }
  const S = {
    arith(q){ const left = q.split('=')[0].replace(/\(arredonde.*$/i,''); const v = evalExpr(left); return /arredonde/i.test(q) ? r2(v) : v; },
    fracoes(q){ const m = /(\d+)\/(\d+)\s*([+−×÷-])\s*(\d+)\/(\d+)/.exec(q); if(!m) return undefined;
      const [a,b,op,c,d] = [+m[1],+m[2],m[3],+m[4],+m[5]];
      return op==='+' ? a/b + c/d : (op==='−'||op==='-') ? a/b - c/d : op==='×' ? a*c/(b*d) : (a*d)/(b*c); },
    porcentagem(q){
      let m = /^(\d+)% de (\d+(?:,\d+)?)/.exec(q); if(m) return r2(num(m[1])*num(m[2])/100);
      m = /R\$ ?([\d.,]+) teve aumento de (\d+)%/.exec(q); if(m) return r2(num(m[1])*(1+num(m[2])/100));
      m = /R\$ ?([\d.,]+) (?:teve|com) desconto de (\d+)%/.exec(q); if(m) return r2(num(m[1])*(1-num(m[2])/100));
      return undefined; },
    geometria(q){
      const n = nums(q), pi = /3,14/.test(q) ? 3.14 : Math.PI;
      if(/círculo/i.test(q)){ const r = n[0]; return /perímetro|comprimento/i.test(q) ? r2(2*pi*r) : r2(pi*r*r); }
      if(/área de \d+ cm² e base/i.test(q)) return n[0]/n[1];
      if(/área de \d+ cm² e altura/i.test(q)) return n[0]/n[1];
      if(/quadrado/i.test(q)) return /perímetro/i.test(q) ? 4*n[0] : n[0]*n[0];
      if(/trapézio/i.test(q)) return (n[0]+n[1])*n[2]/2;
      if(/losango/i.test(q)) return n[0]*n[1]/2;
      if(/triângulo/i.test(q)) return /perímetro/i.test(q) ? n[0]+n[1]+n[2] : n[0]*n[1]/2;
      if(/paralelogramo/i.test(q)) return n[0]*n[1];
      if(/ret[âa]ngul/i.test(q)) return /perímetro/i.test(q) ? 2*(n[0]+n[1]) : n[0]*n[1];
      return undefined; },
    mmcmdc(q){ const n = nums(q);
      if(/^MMC/.test(q)) return n.reduce(lcm); if(/^MDC/.test(q)) return n.reduce(gcd);
      if(/juntos|mesmo tempo|de novo|novamente/i.test(q) && /a cada/i.test(q)) return n.reduce(lcm);
      if(/maior número|sem sobrar|maior tamanho|o maior/i.test(q)) return n.reduce(gcd);
      return undefined; },
    estatistica(q){
      let m = /tirou ([\d, ]+?)\. Que nota .* média (\d+)/.exec(q);
      if(m){ const v = m[1].split(',').map(num), k = v.length + 1; return num(m[2])*k - v.reduce((a,b)=>a+b,0); }
      m = /de ([\d, ]+)\?/.exec(q); if(!m) return undefined;
      const v = m[1].split(',').map(num).filter(x=>!isNaN(x));
      if(/média/i.test(q)) return r2(v.reduce((a,b)=>a+b,0)/v.length);
      if(/mediana/i.test(q)){ const s = v.slice().sort((a,b)=>a-b), h = s.length>>1; return s.length%2 ? s[h] : (s[h-1]+s[h])/2; }
      if(/moda/i.test(q)){ const c = {}; v.forEach(x=>c[x]=(c[x]||0)+1); const mx = Math.max(...Object.values(c)); const modes = Object.keys(c).filter(k=>c[k]===mx); return modes.length===1 ? +modes[0] : NaN; }
      return undefined; },
    regra3(q){ const n = nums(q); if(n.length < 3) return undefined; const [a,b,c] = n; return /invers/i.test(q) ? a*b/c : b*c/a; },
    eq1(q){ const [L,R] = q.split('='); const f = x=> evalExpr(L,{x,y:0}) - evalExpr(R,{x,y:0}); const f0 = f(0), f1 = f(1); return -f0/(f1-f0); },
    sistemas(q){ const [l1,l2] = q.split('\n'); const e = l=>{ const [L,R] = l.split('='); const a = linear2(L), b = linear2(R); return {a:a.a-b.a, b:a.b-b.b, c:b.c-a.c}; };
      const A = e(l1), B = e(l2), det = A.a*B.b - A.b*B.a; return {x:(A.c*B.b - A.b*B.c)/det, y:(A.a*B.c - A.c*B.a)/det}; },
    eq2(q){ const L = q.split('=')[0]; const f = x=> evalExpr(L,{x,y:0}); const c = f(0), a = (f(1)+f(-1))/2 - c, b = (f(1)-f(-1))/2;
      const D = b*b - 4*a*c; if(D < 0) return NaN; return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)]; },
    func1grau(q){ const m = /f\(x\) = (.+?)\.\s/.exec(q); if(!m) return undefined; const g = x=> evalExpr(m[1],{x,y:0});
      const k = /Calcule f\((−?-?\d+)\)/.exec(q); if(k) return g(num(k[1].replace('−','-')));
      if(/raiz/i.test(q)){ const b = g(0), a = g(1)-b, x = -b/a; return /Arredonde/i.test(q) ? r2(x) : x; }
      return undefined; },
    dinheiro(q){ const reais = (q.match(/R\$ ?([\d.,]+)/g)||[]).map(x=>num(x.replace(/R\$ ?/,'')));
      let m = /comprou (\d+) .*? de R\$ ?([\d.,]+) cada e pagou com R\$ ?([\d.,]+)/.exec(q); if(m) return r2(num(m[3]) - num(m[1])*num(m[2]));
      if(/troco/i.test(q) && reais.length===2) return r2(reais[1]-reais[0]);
      m = /R\$ ?([\d.,]+) e vai ser dividida igualmente entre (\d+)/.exec(q); if(m) return r2(num(m[1])/num(m[2]));
      if(/juntos/i.test(q)) return r2(reais.reduce((a,b)=>a+b,0));
      return undefined; },
  };
  ['adicao','subtracao','multiplicacao','divisao','decimais','expressoes','potenciacao'].forEach(id=> S[id] = S.arith);

  const report = {total:0, byKey:{}, problems:[], unknown:[]};
  const close = (a,b,tol)=> Math.abs(a-b) <= (tol||1e-6) * Math.max(1, Math.abs(b));
  const subjectIds = SUBJECTS.map(s=>s.id);
  SUBJECTS.forEach(s=>{
    DIFFS.forEach(d=>{
      const key = s.id+'/'+d; report.byKey[key] = {n:0, ok:0};
      for(let i=0;i<N;i++){
        let ex;
        try{ ex = genQuestionAvoidingRepeat(s, d, null).ex; }catch(e){ report.problems.push(`${key}: gerador lançou erro ${e.message}`); continue; }
        report.total++; report.byKey[key].n++;
        const q = String(ex.question||'').trim();
        const bad = m=> { if(report.problems.length < 60) report.problems.push(`${key}: ${m} | "${q.replace(/\n/g,' / ')}" resposta=${JSON.stringify(ex.answer)}`); };
        if(!q){ bad('enunciado vazio'); continue; }
        if(!subjectIds.includes(s.id) || !DIFFS.includes(d)) { bad('assunto/nível inválido'); continue; }
        if(!['single','pair','xy'].includes(ex.type)){ bad('tipo de resposta desconhecido'); continue; }
        const ans = ex.answer;
        const validNum = v=> typeof v==='number' && isFinite(v);
        if(ex.type==='single' && !validNum(ans)){ bad('resposta não numérica'); continue; }
        if(ex.type==='pair' && !(Array.isArray(ans) && ans.length===2 && ans.every(validNum))){ bad('par de raízes inválido'); continue; }
        if(ex.type==='xy' && !(ans && validNum(ans.x) && validNum(ans.y))){ bad('x e y inválidos'); continue; }
        let exp;
        try{ exp = S[s.id](q); }catch(e){ bad('resolvedor falhou: '+e.message); continue; }
        if(exp === undefined){ if(report.unknown.length < 20) report.unknown.push(`${key}: ${q}`); bad('enunciado não reconhecido pelo resolvedor'); continue; }
        let good;
        if(ex.type==='pair') good = Array.isArray(exp) && ((close(ans[0],exp[0],1e-6)&&close(ans[1],exp[1],1e-6)) || (close(ans[0],exp[1],1e-6)&&close(ans[1],exp[0],1e-6)));
        else if(ex.type==='xy') good = close(ans.x, exp.x) && close(ans.y, exp.y);
        else good = close(ans, exp, /arredonde|3,14/i.test(q) ? 0.006 : 1e-6);
        if(!good){ bad('resposta diferente da conta refeita: '+JSON.stringify(exp)); continue; }
        // fração mostrada: tem que valer a resposta e estar simplificada
        if(ex.displayAnswer && /^-?\d+\/\d+$/.test(ex.displayAnswer)){
          const [nn, dd] = ex.displayAnswer.split('/').map(Number);
          if(!close(nn/dd, ans)){ bad('fração mostrada '+ex.displayAnswer+' não vale a resposta'); continue; }
          if(gcd(nn,dd) !== 1 || dd === 1){ bad('fração mostrada '+ex.displayAnswer+' não está simplificada'); continue; }
        }
        // questão sem sentido: divisão por zero, raiz de negativo, média com resposta impossível
        if(s.id==='estatistica' && /Que nota/.test(q) && (ans < 0 || ans > 10)){ bad('nota impossível (fora de 0 a 10)'); continue; }
        report.byKey[key].ok++;
      }
    });
  });
  return report;
}

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage();
  const jsErr = []; p.on('pageerror', e=>jsErr.push(e.message));
  await p.goto(URL); await p.waitForTimeout(700);
  const t0 = Date.now();
  const r = await p.evaluate(solveAll, N);
  const keys = Object.keys(r.byKey);
  keys.forEach(k=>{ const x = r.byKey[k]; if(x.ok !== x.n) console.log(`❌ ${k}: ${x.ok}/${x.n}`); });
  const subjects = [...new Set(keys.map(k=>k.split('/')[0]))];
  subjects.forEach(sid=>{ const tot = ['facil','medio','dificil'].reduce((a,d)=>a + r.byKey[sid+'/'+d].ok, 0), n = ['facil','medio','dificil'].reduce((a,d)=>a + r.byKey[sid+'/'+d].n, 0); console.log(`${tot===n ? '✅' : '❌'} ${sid.padEnd(14)} ${tot}/${n} conferidas`); });
  if(r.problems.length){ console.log('\nPROBLEMAS (até 60):'); r.problems.forEach(x=>console.log('  ' + x)); }
  if(r.unknown.length){ console.log('\nENUNCIADOS NÃO RECONHECIDOS:'); r.unknown.forEach(x=>console.log('  ' + x)); }
  const okAll = keys.every(k=> r.byKey[k].ok === r.byKey[k].n) && !r.problems.length;
  console.log(`\n${r.total} questões geradas e resolvidas de novo em ${((Date.now()-t0)/1000).toFixed(1)} s | ${okAll ? 'NENHUM PROBLEMA' : 'HÁ PROBLEMAS'} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close();
  process.exit(okAll && !jsErr.length ? 0 : 1);
})();
