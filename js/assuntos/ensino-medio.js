/* =========================================================
   ASSUNTOS DO ENSINO MÉDIO (23)
   Acrescentados à lista SUBJECTS criada em fundamental.js. Cada assunto tem
   explicação (learn), exemplos e gerador de questões fácil/médio/difícil (gen).
   ========================================================= */
SUBJECTS.push(
  /* =================== ENSINO MÉDIO — Álgebra e Funções =================== */
  {
    id:'conjuntos', name:'Conjuntos numéricos', sym:'ℝ',
    learn:`<p>Os números foram "inventados" aos poucos: cada vez que aparecia uma conta sem resposta, surgia um conjunto novo que resolvia o problema. Por isso um conjunto fica <b>dentro</b> do outro.</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Naturais (ℕ):</b> 0, 1, 2, 3, … — os números de contar.</li>
      <li><b>Inteiros (ℤ):</b> …, −2, −1, 0, 1, 2, … — os naturais mais os negativos.</li>
      <li><b>Racionais (ℚ):</b> tudo que pode ser escrito como fração a/b (com b ≠ 0): inteiros, decimais que terminam (0,25) e dízimas periódicas (0,333…).</li>
      <li><b>Irracionais (𝕀):</b> decimais infinitos que <b>nunca</b> se repetem, como √2 = 1,4142… e π = 3,1415…</li>
      <li><b>Reais (ℝ):</b> todos juntos — racionais + irracionais.</li>
    </ol>
    <div class="example-box mono" style="margin-top:8px">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</div>
    <div class="section-title">Dica — raízes</div>
    <p>Raiz de um quadrado perfeito é racional (√9 = 3). Raiz de um número que <b>não</b> é quadrado perfeito é irracional (√7).</p>
    <div class="section-title">Dízima periódica vira fração</div>
    <p>Quando o período tem 1 algarismo, ele fica sobre <b>9</b>; com 2 algarismos, sobre <b>99</b>: 0,454545… = 45/99 = 5/11.</p>`,
    examples:[
      {title:'Exemplo 1 (um dentro do outro)', text:'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ', qVisual: numberSetsSVG(), steps:['Todo natural também é inteiro, todo inteiro também é racional…', 'Racionais e irracionais juntos formam os reais (ℝ).']},
      {title:'Exemplo 2 (classificar)', text:'−4 → inteiro · 0,75 → racional · √5 → irracional', qVisual: stepChain(['−4 → inteiro (ℤ)', `0,75 = ${fracRow([{n:3,d:4}])} → racional (ℚ)`, '√5 = 2,2360… → irracional (𝕀)']), steps:['−4 é inteiro (e também racional e real).', '0,75 = 3/4, então é racional.', '5 não é quadrado perfeito, então √5 é irracional.']},
      {title:'Exemplo 3 (dízima vira fração)', text:'0,272727… = 27/99 = 3/11', qVisual: fracRow(['0,2727… =', {n:27,d:99}, '=', {n:3,d:11}]), steps:['O período (27) tem 2 algarismos → fica sobre 99.', '27/99, simplificando por 9 = 3/11']},
    ],
    gen:{
      facil:()=>{ const a=randInt(-9,-1), b=randInt(1,9), n=b-a+1;
        return mkSingle(`Quantos números inteiros existem de ${nm(a)} até ${b}, contando os dois?`, n, [`Atalho: último − primeiro + 1`, `${b} − ${np(a)} + 1 = ${n}`]); },
      medio:()=>{
        const pool = [['√2',1],['√3',1],['√5',1],['√7',1],['π',1],['√10',1],['√4',0],['√9',0],['√16',0],['0,5',0],['−3',0],['2/7',0],['1,333…',0],['0',0]];
        const list = shuffle([...pool]).slice(0,6), n = list.filter(x=>x[1]).length;
        return mkSingle(`Quantos destes números são irracionais? ${list.map(x=>x[0]).join('  ·  ')}`, n,
          [`Irracionais: raízes de números que não são quadrados perfeitos, e o π.`, `Irracionais da lista: ${list.filter(x=>x[1]).map(x=>x[0]).join(', ') || 'nenhum'}`, `Total: ${n}`]); },
      dificil:()=>{ let n; do{ n=randInt(10,98); }while(n%11===0);
        const [p,q] = simplifyFrac(n,99);
        return mkFrac(`Escreva a dízima 0,${n}${n}${n}… como fração.`, n, 99, [`O período (${n}) tem 2 algarismos → fica sobre 99: ${n}/99`, q!==99 ? `Simplificando: ${p}/${q}` : `A fração ${n}/99 já está simplificada.`]); },
    }
  },
  {
    id:'funcquad', name:'Função quadrática', sym:'ax²',
    learn:`<p>A <b>função quadrática</b> (ou do 2º grau) tem o x elevado ao quadrado. O gráfico dela não é uma reta, é uma curva chamada <b>parábola</b>.</p>
    <div class="example-box mono" style="margin-top:8px">f(x) = ax² + bx + c   (a ≠ 0)</div>
    <div class="section-title">Passo 1 — pra que lado a parábola abre</div>
    <p>Se <b>a > 0</b>, ela abre pra cima (formato de ∪) e tem um ponto <b>mínimo</b>. Se <b>a < 0</b>, abre pra baixo (∩) e tem um ponto <b>máximo</b>.</p>
    <div class="section-title">Passo 2 — as raízes</div>
    <p>São os pontos onde a parábola corta o eixo x. Ache resolvendo ax² + bx + c = 0 com Bhaskara: Δ = b² − 4ac e x = (−b ± √Δ) / 2a.</p>
    <div class="section-title">Passo 3 — o vértice (a "ponta" da parábola)</div>
    <div class="example-box mono" style="margin-top:8px">xᵥ = −b / 2a      yᵥ = f(xᵥ)</div>
    <p>O yᵥ é o <b>valor mínimo</b> (se a > 0) ou o <b>valor máximo</b> (se a < 0) da função. Também dá pra calcular por yᵥ = −Δ / 4a.</p>`,
    examples:[
      {title:'Exemplo 1 (calcular f(x))', text:'f(x) = x² − 3x + 2 → f(4) = 6', qVisual: stepChain(['f(x) = x² − 3x + 2', 'f(4) = 4² − 3×4 + 2', 'f(4) = 16 − 12 + 2', 'f(4) = 6']), steps:['Troque x por 4 na fórmula: 4² − 3×4 + 2', 'Resolva a potência e a multiplicação: 16 − 12 + 2', 'Some e subtraia: 6']},
      {title:'Exemplo 2 (o gráfico: parábola)', text:'f(x) = x² − 6x + 5 → raízes 1 e 5, vértice (3, −4)', qVisual: funcGraph({f:x=>x*x-6*x+5, xmin:-1, xmax:7, ymin:-5, ymax:8, label:'f(x) = x² − 6x + 5', pts:[{x:1,y:0,t:'raiz',c:'var(--coral)',dx:-6,anchor:'end'},{x:5,y:0,t:'raiz',c:'var(--coral)'},{x:3,y:-4,t:'vértice (3, −4)',c:'var(--amber)',dy:14}]}), steps:['a = 1 > 0: a parábola abre pra cima e tem ponto mínimo.', 'As raízes (x² − 6x + 5 = 0) são 1 e 5: é onde ela corta o eixo x.', 'O vértice fica bem no meio das raízes.']},
      {title:'Exemplo 3 (vértice e valor mínimo)', text:'f(x) = x² − 6x + 5 → xᵥ = 3, mínimo −4', qVisual: stepChain([`xᵥ = ${fracRow([{n:'−b', d:'2a'}])}`, `xᵥ = ${fracRow([{n:'6', d:'2'}])} = 3`, 'yᵥ = f(3) = 9 − 18 + 5', 'yᵥ = −4']), steps:['a = 1, b = −6', 'xᵥ = −b / 2a = 6 / 2 = 3', 'yᵥ = f(3) = 9 − 18 + 5 = −4 → é o valor mínimo']},
    ],
    gen:{
      facil:()=>{ const a=pick([1,1,2,-1]), b=randInt(-5,5), c=randInt(-9,9), x=randInt(-3,4), r=a*x*x+b*x+c;
        return mkSingle(`f(x) = ${quadStr(a,b,c)}. Calcule f(${nm(x)}).`, r, [`Troque x por ${np(x)} na fórmula.`, `x² = ${np(x)}² = ${x*x}`, `f(${nm(x)}) = ${a===1?'':a===-1?'−':a+' × '}${x*x}${b?` ${b*x>=0?'+':'−'} ${Math.abs(b*x)}`:''}${c?` ${c>0?'+':'−'} ${Math.abs(c)}`:''} = ${nm(r)}`]); },
      medio:()=>{ const a=pick([1,2,-1,-2]); let xv=randInt(-5,5); if(!xv) xv=2; const b=-2*a*xv, c=randInt(-9,9);
        return mkSingle(`f(x) = ${quadStr(a,b,c)}. Qual é o x do vértice?`, xv, [`a = ${nm(a)} e b = ${nm(b)}`, `xᵥ = −b / 2a = ${nm(-b)} / ${nm(2*a)} = ${nm(xv)}`]); },
      dificil:()=>{ const a=pick([1,2,-1,-2]); let xv=randInt(-4,4); if(!xv) xv=-2; const b=-2*a*xv, c=randInt(-9,9), yv=a*xv*xv+b*xv+c, kind=a>0?'mínimo':'máximo';
        return mkSingle(`f(x) = ${quadStr(a,b,c)}. Qual é o valor ${kind} da função?`, yv, [`a ${a>0?'> 0: a parábola abre pra cima, tem mínimo':'< 0: a parábola abre pra baixo, tem máximo'} no vértice.`, `xᵥ = −b / 2a = ${nm(-b)} / ${nm(2*a)} = ${nm(xv)}`, `yᵥ = f(${nm(xv)}) = ${nm(yv)}`]); },
    }
  },
  {
    id:'modular', name:'Função modular', sym:'|x|',
    learn:`<p>O <b>módulo</b> de um número é a distância dele até o zero na reta numérica. Distância nunca é negativa, então o módulo tira o sinal de menos: |−5| = 5 e |5| = 5.</p>
    <div class="example-box mono" style="margin-top:8px">|x| = x, se x ≥ 0<br>|x| = −x, se x < 0</div>
    <div class="section-title">A função f(x) = |x|</div>
    <p>O gráfico tem formato de <b>V</b>, com a ponta na origem. Toda a parte que estaria abaixo do eixo x é "rebatida" pra cima.</p>
    <div class="section-title">Equações modulares</div>
    <p>Se |x − a| = k (com k > 0), existem <b>duas</b> possibilidades: o que está dentro vale <b>k</b> ou vale <b>−k</b>.</p>
    <div class="example-box mono" style="margin-top:8px">|x − a| = k  →  x = a + k  ou  x = a − k</div>`,
    examples:[
      {title:'Exemplo 1 (módulo = distância até o zero)', text:'|−7| + |3| = 10', qVisual: stepChain(['|−7| + |3|', '7 + 3', '10']), steps:['|−7| = 7 (o −7 está a 7 passos do zero)', '|3| = 3', '7 + 3 = 10']},
      {title:'Exemplo 2 (o gráfico em V)', text:'f(x) = |x − 2| → ponta do V em x = 2', qVisual: funcGraph({f:x=>Math.abs(x-2), xmin:-2, xmax:6, ymin:-1, ymax:5, label:'f(x) = |x − 2|', pts:[{x:2,y:0,t:'(2, 0)',c:'var(--amber)',dy:16}]}), steps:['Dentro do módulo, x − 2 vira zero quando x = 2: é a ponta do V.', 'Pros dois lados, o gráfico sobe: o módulo nunca é negativo.']},
      {title:'Exemplo 3 (equação modular)', text:'|x − 3| = 5 → x = 8 ou x = −2', qVisual: stepChain(['|x − 3| = 5', 'x − 3 = 5   ou   x − 3 = −5', 'x = 8   ou   x = −2']), steps:['O que está dentro do módulo vale 5 ou −5.', 'x − 3 = 5 → x = 8', 'x − 3 = −5 → x = −2']},
    ],
    gen:{
      facil:()=>{ const a=-randInt(1,15), b=randInt(-12,12), r=Math.abs(a)+Math.abs(b);
        return mkSingle(`Quanto vale |${nm(a)}| + |${nm(b)}|?`, r, [`|${nm(a)}| = ${Math.abs(a)} e |${nm(b)}| = ${Math.abs(b)}`, `${Math.abs(a)} + ${Math.abs(b)} = ${r}`]); },
      medio:()=>{ const k=randInt(2,5), m=randInt(10,25), x=randInt(0,Math.floor(m/k)), v=k*x-m;
        return mkSingle(`f(x) = |${k}x − ${m}|. Calcule f(${x}).`, Math.abs(v), [`Dentro do módulo: ${k}×${x} − ${m} = ${nm(v)}`, `|${nm(v)}| = ${Math.abs(v)}`]); },
      dificil:()=>{ const a=randInt(-6,8), k=randInt(2,9), big=Math.random()<0.5, r=big?a+k:a-k, inner=a>=0?`x − ${a}`:`x + ${-a}`;
        return mkSingle(`Resolva |${a===0?'x':inner}| = ${k}. Qual é a ${big?'maior':'menor'} solução?`, r, [`O que está dentro vale ${k} ou −${k}.`, `${a===0?'x':inner} = ${k} → x = ${nm(a+k)}`, `${a===0?'x':inner} = −${k} → x = ${nm(a-k)}`, `A ${big?'maior':'menor'} é ${nm(r)}.`]); },
    }
  },
  {
    id:'exponencial', name:'Função exponencial', sym:'aˣ',
    learn:`<p>Na <b>função exponencial</b> o x fica no <b>expoente</b>. Ela descreve coisas que crescem (ou diminuem) multiplicando sempre pelo mesmo número: bactérias que dobram, dinheiro com juros compostos, remédio saindo do corpo.</p>
    <div class="example-box mono" style="margin-top:8px">f(x) = aˣ   (a > 0 e a ≠ 1)</div>
    <p>Se <b>a > 1</b>, ela é crescente; se <b>0 < a < 1</b>, é decrescente. O gráfico sempre passa pelo ponto (0, 1), porque a⁰ = 1, e nunca toca o eixo x.</p>
    <div class="section-title">Equação exponencial — o truque</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Escreva os dois lados como potências <b>da mesma base</b> (fatore o número).</li>
      <li>Com as bases iguais, iguale os expoentes: aᵐ = aⁿ → m = n.</li>
      <li>Resolva a equação que sobrou.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (mesma base)', text:'2ˣ = 32 → x = 5', qVisual: stepChain(['2ˣ = 32', '2ˣ = 2⁵', 'x = 5']), steps:['Fatore o 32: 32 = 2 × 2 × 2 × 2 × 2 = 2⁵', 'Bases iguais → iguale os expoentes: x = 5']},
      {title:'Exemplo 2 (o gráfico)', text:'f(x) = 2ˣ: crescente, passa por (0, 1)', qVisual: funcGraph({f:x=>Math.pow(2,x), xmin:-3, xmax:3.2, ymin:-0.8, ymax:8.5, label:'f(x) = 2ˣ', pts:[{x:0,y:1,t:'(0, 1)',c:'var(--amber)'},{x:2,y:4,t:'(2, 4)',c:'var(--coral)',dx:-8,anchor:'end'}]}), steps:['A base 2 é maior que 1: a função é crescente.', '2⁰ = 1, então o gráfico passa por (0, 1).', 'Pra esquerda ela chega perto do eixo x, mas nunca encosta.']},
      {title:'Exemplo 3 (bases diferentes)', text:'4ˣ = 8 → x = 3/2', qVisual: stepChain(['4ˣ = 8', '(2²)ˣ = 2³', '2x = 3', `x = ${fracRow([{n:3,d:2}])}`]), steps:['Escreva tudo na base 2: 4 = 2² e 8 = 2³', 'Potência de potência: (2²)ˣ = 2²ˣ → 2x = 3', 'x = 3/2 = 1,5']},
    ],
    gen:{
      facil:()=>{ const b=pick([2,3,5]), n=randInt(2, b===2?7:b===3?5:4), N=Math.pow(b,n);
        return mkSingle(`Resolva: ${b}ˣ = ${N}`, n, [`Escreva ${N} como potência de ${b}: ${N} = ${b}<sup>${n}</sup>`, `${b}<sup>x</sup> = ${b}<sup>${n}</sup> → x = ${n}`]); },
      medio:()=>{ const b=pick([2,3]), n=randInt(3, b===2?8:5), k=randInt(1,n-1), sgn=Math.random()<0.6, N=Math.pow(b,n), x=sgn?n-k:n+k;
        return mkSingle(`Resolva: ${b}ˣ${sgn?'⁺':'⁻'}${supN(k)} = ${N}`, x, [`${N} = ${b}<sup>${n}</sup>`, `Iguale os expoentes: x ${sgn?'+':'−'} ${k} = ${n}`, `x = ${x}`]); },
      dificil:()=>{ const [p,m] = pick([[2,2],[2,3],[3,2],[3,3],[5,2]]), a=Math.pow(p,m); let n; do{ n=randInt(1, p===2?7:4); }while(n%m===0);
        const N=Math.pow(p,n);
        return mkFrac(`Resolva: ${a}ˣ = ${N}`, n, m, [`Escreva tudo na base ${p}: ${a} = ${p}<sup>${m}</sup> e ${N} = ${p}<sup>${n}</sup>`, `(${p}<sup>${m}</sup>)<sup>x</sup> = ${p}<sup>${n}</sup> → ${m}x = ${n}`, `x = ${fracStr(n,m)}`]); },
    }
  },
  {
    id:'logaritmo', name:'Logaritmo', sym:'log',
    learn:`<p>O <b>logaritmo</b> responde uma pergunta: "a que expoente eu elevo a base pra chegar nesse número?". Ele é a operação inversa da potência.</p>
    <div class="example-box mono" style="margin-top:8px">logₐ b = x  ⇔  aˣ = b</div>
    <p>Exemplo: log₂ 8 = 3, porque 2³ = 8. Quando a base não aparece (log 100), ela é <b>10</b>.</p>
    <div class="section-title">Propriedades (as que mais caem)</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Produto:</b> log(m·n) = log m + log n</li>
      <li><b>Divisão:</b> log(m/n) = log m − log n</li>
      <li><b>Potência:</b> log mᵏ = k · log m</li>
      <li><b>Mudança de base:</b> logₐ b = log b / log a</li>
    </ol>
    <p>Valores úteis: <b>log 2 ≈ 0,30</b> · <b>log 3 ≈ 0,48</b> · log 5 = log(10/2) ≈ 0,70.</p>`,
    examples:[
      {title:'Exemplo 1 (o que é o log)', text:'log₃ 81 = 4', qVisual: stepChain(['log₃ 81 = x', '3ˣ = 81', '3ˣ = 3⁴', 'x = 4']), steps:['Transforme em potência: log₃ 81 = x ⇔ 3ˣ = 81', 'Fatore: 81 = 3⁴', 'Então x = 4']},
      {title:'Exemplo 2 (propriedade do produto)', text:'log₆ 4 + log₆ 9 = 2', qVisual: stepChain(['log₆ 4 + log₆ 9', 'log₆ (4 × 9)', 'log₆ 36', '2']), steps:['Soma de logs de mesma base = log do produto', '4 × 9 = 36', '6² = 36, então vale 2']},
      {title:'Exemplo 3 (usando log 2 e log 3)', text:'log 6 ≈ 0,78', qVisual: stepChain(['log 6 = log (2 × 3)', 'log 6 = log 2 + log 3', 'log 6 ≈ 0,30 + 0,48', 'log 6 ≈ 0,78']), steps:['Fatore: 6 = 2 × 3', 'Log do produto = soma dos logs', '0,30 + 0,48 = 0,78']},
    ],
    gen:{
      facil:()=>{ const b=pick([2,3,5,10]), n=randInt(1, b===2?7:b===10?4:4), N=Math.pow(b,n), bs=subN(b);
        return mkSingle(`Quanto vale log${bs} ${N}?`, n, [`Pergunta: ${b} elevado a quanto dá ${N}?`, `${b}<sup>${n}</sup> = ${N}, então log${bs} ${N} = ${n}`]); },
      medio:()=>{ const [b,x,op,y] = pick([[6,4,'+',9],[2,12,'−',3],[3,18,'−',2],[10,25,'+',4],[10,5,'+',2],[2,40,'−',5],[12,3,'+',4],[10,50,'+',20],[4,32,'+',2],[2,24,'−',3],[3,54,'−',2],[10,200,'+',5]]);
        const arg = op==='+' ? x*y : x/y, r = Math.round(Math.log(arg)/Math.log(b)), bs=subN(b);
        return mkSingle(`Quanto vale log${bs} ${x} ${op} log${bs} ${y}?`, r, [op==='+' ? `Soma de logs de mesma base = log do produto: log${bs} (${x} × ${y}) = log${bs} ${arg}` : `Diferença de logs = log da divisão: log${bs} (${x} ÷ ${y}) = log${bs} ${arg}`, `${b}<sup>${r}</sup> = ${arg}, então vale ${r}`]); },
      dificil:()=>{ let i, j; do{ i=randInt(0,3); j=randInt(0,2); }while(i+j===0 || (i===1&&j===0) || (i===0&&j===1)); const N=Math.pow(2,i)*Math.pow(3,j), r=round2(i*0.30+j*0.48);
        const parts=[...Array(i).fill('2'), ...Array(j).fill('3')];
        return mkSingle(`Use log 2 = 0,30 e log 3 = 0,48. Quanto vale log ${N}?`, r, [`Fatore: ${N} = ${parts.join(' × ')}`, `log do produto = soma dos logs: ${[i?`${i} × 0,30`:'', j?`${j} × 0,48`:''].filter(Boolean).join(' + ')}`, `log ${N} = ${fmt(r)}`]); },
    }
  },
  {
    id:'functrig', name:'Funções trigonométricas', sym:'sen',
    learn:`<p>As funções <b>seno</b> e <b>cosseno</b> são <b>periódicas</b>: o gráfico é uma onda que se repete sempre do mesmo jeito. Por isso elas descrevem marés, som, batimentos do coração e tudo que "vai e volta".</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>sen x e cos x sempre ficam entre <b>−1 e 1</b>.</li>
      <li>O <b>período</b> (tamanho de uma onda completa) é 360°, ou 2π rad.</li>
      <li>A tangente tem período de 180° (π rad).</li>
    </ol>
    <div class="section-title">A forma geral</div>
    <div class="example-box mono" style="margin-top:8px">f(x) = a + b · sen(cx)</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>a</b> sobe ou desce a onda inteira.</li>
      <li><b>b</b> estica a onda na vertical: máximo = a + |b| e mínimo = a − |b|.</li>
      <li><b>c</b> encolhe a onda na horizontal: período = 360° / |c|.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (a onda do seno)', text:'f(x) = sen x: vai de −1 a 1, período 360°', qVisual: funcGraph({f:x=>Math.sin(x*Math.PI/180), xmin:-20, xmax:380, ymin:-1.4, ymax:1.5, label:'f(x) = sen x', pts:[{x:90,y:1,t:'máx 1',c:'var(--amber)'},{x:270,y:-1,t:'mín −1',c:'var(--coral)',dy:16},{x:360,y:0,t:'360°',c:'var(--pine)',dy:-8,anchor:'end',dx:-4}]}), steps:['O seno sobe até 1 (em 90°), desce até −1 (em 270°) e volta.', 'Uma onda completa leva 360°: esse é o período.']},
      {title:'Exemplo 2 (máximo e mínimo)', text:'f(x) = 3 + 2·sen x → varia de 1 a 5', qVisual: stepChain(['−1 ≤ sen x ≤ 1', 'máx: 3 + 2 × 1 = 5', 'mín: 3 + 2 × (−1) = 1']), steps:['sen x vai de −1 a 1', 'Máximo: 3 + 2×1 = 5', 'Mínimo: 3 + 2×(−1) = 1']},
      {title:'Exemplo 3 (período)', text:'f(x) = sen(4x) → período 90°', qVisual: stepChain([`período = ${fracRow([{n:'360°', d:'c'}])}`, `período = ${fracRow([{n:'360°', d:'4'}])}`, 'período = 90°']), steps:['Com 4x, a onda anda 4 vezes mais rápido.', 'Período = 360° ÷ 4 = 90°']},
    ],
    gen:{
      facil:()=>{ const a=randInt(0,6), b=randInt(1,5)*pick([1,-1]), fn=pick(['sen','cos']);
        return mkSingle(`f(x) = ${a?a+' ':''}${b>0?(a?'+ ':''):'− '}${Math.abs(b)===1?'':Math.abs(b)+'·'}${fn} x. Qual é o valor máximo de f?`, a+Math.abs(b), [`${fn} x varia de −1 a 1.`, `O máximo acontece quando ${Math.abs(b)}·${fn} x "soma" o mais possível: ${a} + ${Math.abs(b)} = ${a+Math.abs(b)}`]); },
      medio:()=>{ const a=randInt(-3,6), b=randInt(1,5)*pick([1,-1]), fn=pick(['sen','cos']);
        return mkSingle(`f(x) = ${a?nm(a)+' ':''}${b>0?(a?'+ ':''):'− '}${Math.abs(b)===1?'':Math.abs(b)+'·'}${fn} x. Qual é o valor mínimo de f?`, a-Math.abs(b), [`${fn} x varia de −1 a 1.`, `Mínimo = a − |b| = ${nm(a)} − ${Math.abs(b)} = ${nm(a-Math.abs(b))}`]); },
      dificil:()=>{ const c=pick([2,3,4,5,6,8,9,10,12]), fn=pick(['sen','cos']);
        return mkSingle(`Qual é o período, em graus, de f(x) = ${fn}(${c}x)?`, 360/c, [`O período de ${fn} x é 360°.`, `Com ${c}x, a onda anda ${c} vezes mais rápido: 360° ÷ ${c} = ${360/c}°`]); },
    }
  },
  /* =================== ENSINO MÉDIO — Progressões =================== */
  {
    id:'pa', name:'Progressão aritmética (PA)', sym:'PA',
    learn:`<p>Uma <b>PA</b> é uma sequência em que cada termo é o anterior <b>mais</b> um número fixo, chamado <b>razão (r)</b>. Exemplo: 3, 7, 11, 15, … tem razão 4.</p>
    <p>Pra achar a razão, faça qualquer termo menos o anterior: r = a₂ − a₁.</p>
    <div class="section-title">Termo geral (achar qualquer termo)</div>
    <div class="example-box mono" style="margin-top:8px">aₙ = a₁ + (n − 1) · r</div>
    <div class="section-title">Soma dos n primeiros termos</div>
    <div class="example-box mono" style="margin-top:8px">Sₙ = (a₁ + aₙ) · n / 2</div>
    <p>A ideia (de Gauss): somar o primeiro com o último dá o mesmo que o segundo com o penúltimo, e assim por diante.</p>`,
    examples:[
      {title:'Exemplo 1 (razão)', text:'(5, 8, 11, 14, …) → r = 3', qVisual: seqRow(['5','8','11','14','…'], '+3'), steps:['Cada termo é o anterior + 3.', 'r = 8 − 5 = 3']},
      {title:'Exemplo 2 (termo geral)', text:'a₁ = 3, r = 4 → a₁₀ = 39', qVisual: stepChain(['aₙ = a₁ + (n − 1) · r', 'a₁₀ = 3 + (10 − 1) × 4', 'a₁₀ = 3 + 36', 'a₁₀ = 39']), steps:['Use o termo geral com a₁ = 3, r = 4 e n = 10', '(10 − 1) × 4 = 36', '3 + 36 = 39']},
      {title:'Exemplo 3 (soma de Gauss)', text:'1 + 2 + … + 100 = 5050', qVisual: stepChain([`S = ${fracRow([{n:'(a₁ + aₙ) · n', d:'2'}])}`, `S = ${fracRow([{n:'(1 + 100) × 100', d:'2'}])}`, 'S = 5050']), steps:['a₁ = 1, a₁₀₀ = 100, n = 100', '1 + 100 = 101 → 101 × 100 = 10100', '10100 ÷ 2 = 5050']},
    ],
    gen:{
      facil:()=>{ const a=randInt(-5,15), r=randInt(-6,9)||3, seq=[0,1,2,3].map(i=>a+i*r);
        return mkSingle(`Qual é o próximo termo da PA (${seq.map(nm).join(', ')}, …)?`, a+4*r, [`Razão: ${nm(seq[1])} − ${np(seq[0])} = ${nm(r)}`, `Próximo: ${nm(seq[3])} ${r>=0?'+':'−'} ${Math.abs(r)} = ${nm(a+4*r)}`]); },
      medio:()=>{ const a=randInt(-10,20), r=randInt(2,9), n=randInt(10,40), an=a+(n-1)*r;
        return mkSingle(`Numa PA, a₁ = ${nm(a)} e a razão é ${r}. Qual é o ${n}º termo?`, an, [`aₙ = a₁ + (n − 1)·r`, `a${subN(n)} = ${nm(a)} + (${n} − 1) × ${r} = ${nm(a)} + ${(n-1)*r}`, `= ${nm(an)}`]); },
      dificil:()=>{ const a=randInt(1,10), r=randInt(1,6), n=randInt(8,20), an=a+(n-1)*r, S=(a+an)*n/2;
        return mkSingle(`Qual é a soma dos ${n} primeiros termos da PA (${a}, ${a+r}, ${a+2*r}, …)?`, S, [`Razão r = ${r}. Último termo: a${subN(n)} = ${a} + ${n-1} × ${r} = ${an}`, `S = (a₁ + aₙ) · n / 2 = (${a} + ${an}) × ${n} / 2`, `S = ${S}`]); },
    }
  },
  {
    id:'pg', name:'Progressão geométrica (PG)', sym:'PG',
    learn:`<p>Uma <b>PG</b> é uma sequência em que cada termo é o anterior <b>vezes</b> um número fixo, chamado <b>razão (q)</b>. Exemplo: 2, 6, 18, 54, … tem razão 3.</p>
    <p>Pra achar a razão, divida um termo pelo anterior: q = a₂ ÷ a₁.</p>
    <div class="section-title">Termo geral</div>
    <div class="example-box mono" style="margin-top:8px">aₙ = a₁ · qⁿ⁻¹</div>
    <div class="section-title">Soma dos n primeiros termos</div>
    <div class="example-box mono" style="margin-top:8px">Sₙ = a₁ · (qⁿ − 1) / (q − 1)</div>
    <p><b>PG infinita:</b> se a razão está entre −1 e 1, os termos vão ficando minúsculos e a soma de todos eles dá S = a₁ / (1 − q).</p>`,
    examples:[
      {title:'Exemplo 1 (razão)', text:'(3, 12, 48, 192, …) → q = 4', qVisual: seqRow(['3','12','48','192','…'], '×4'), steps:['Cada termo é o anterior × 4.', 'q = 12 ÷ 3 = 4']},
      {title:'Exemplo 2 (termo geral)', text:'a₁ = 2, q = 3 → a₅ = 162', qVisual: stepChain(['aₙ = a₁ · qⁿ⁻¹', 'a₅ = 2 × 3⁴', 'a₅ = 2 × 81', 'a₅ = 162']), steps:['Use o termo geral com a₁ = 2, q = 3 e n = 5', '3⁴ = 81', '2 × 81 = 162']},
      {title:'Exemplo 3 (soma)', text:'1 + 2 + 4 + 8 + 16 = 31', qVisual: stepChain([`S = ${fracRow([{n:'a₁ · (qⁿ − 1)', d:'q − 1'}])}`, `S = ${fracRow([{n:'1 × (2⁵ − 1)', d:'2 − 1'}])}`, 'S = 31']), steps:['a₁ = 1, q = 2, n = 5', '2⁵ − 1 = 32 − 1 = 31', '31 ÷ 1 = 31']},
    ],
    gen:{
      facil:()=>{ const a=randInt(1,6), q=pick([2,3,4,-2]), seq=[0,1,2].map(i=>a*Math.pow(q,i));
        return mkSingle(`Qual é o próximo termo da PG (${seq.map(nm).join(', ')}, …)?`, a*Math.pow(q,3), [`Razão: ${nm(seq[1])} ÷ ${nm(seq[0])} = ${nm(q)}`, `Próximo: ${nm(seq[2])} × ${np(q)} = ${nm(a*Math.pow(q,3))}`]); },
      medio:()=>{ const a=randInt(1,5), q=pick([2,3]), n=randInt(5, q===2?9:6), an=a*Math.pow(q,n-1);
        return mkSingle(`Numa PG, a₁ = ${a} e a razão é ${q}. Qual é o ${n}º termo?`, an, [`aₙ = a₁ · qⁿ⁻¹`, `= ${a} × ${q}<sup>${n-1}</sup> = ${a} × ${Math.pow(q,n-1)}`, `= ${an}`]); },
      dificil:()=>{ const a=randInt(1,5), q=pick([2,3]), n=randInt(4, q===2?8:5), S=a*(Math.pow(q,n)-1)/(q-1);
        return mkSingle(`Qual é a soma dos ${n} primeiros termos da PG (${a}, ${a*q}, ${a*q*q}, …)?`, S, [`a₁ = ${a}, q = ${q}, n = ${n}`, `S = ${a} × (${q}<sup>${n}</sup> − 1) / (${q} − 1) = ${a} × ${Math.pow(q,n)-1} / ${q-1}`, `S = ${S}`]); },
    }
  },
  /* =================== ENSINO MÉDIO — Geometria =================== */
  {
    id:'espacial', name:'Geometria espacial', sym:'V',
    learn:`<p>Na geometria espacial as figuras têm 3 dimensões: comprimento, largura e altura. O <b>volume</b> mede quanto cabe dentro do sólido (em cm³, m³…). 1 dm³ = 1 litro.</p>
    <div class="section-title">Prismas e cilindros ("retos até em cima")</div>
    <div class="example-box mono" style="margin-top:8px">V = área da base × altura</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Cubo:</b> V = a³</li>
      <li><b>Paralelepípedo (caixa):</b> V = comprimento × largura × altura</li>
      <li><b>Cilindro:</b> V = π · r² · h</li>
    </ol>
    <div class="section-title">Pirâmides e cones ("terminam em ponta")</div>
    <div class="example-box mono" style="margin-top:8px">V = área da base × altura ÷ 3</div>
    <p>Um cone cabe exatamente 3 vezes dentro do cilindro de mesma base e altura!</p>
    <div class="section-title">Esfera</div>
    <div class="example-box mono" style="margin-top:8px">V = 4 · π · r³ ÷ 3      Área = 4 · π · r²</div>`,
    examples:[
      {title:'Exemplo 1 (paralelepípedo)', text:'5 cm × 4 cm × 3 cm → 60 cm³', qVisual: geoSolid('box',{c:5,l:4,h:3}), steps:['V = comprimento × largura × altura', '5 × 4 × 3 = 60 cm³']},
      {title:'Exemplo 2 (cilindro)', text:'r = 2 cm, h = 10 cm → 125,6 cm³', qVisual: geoSolid('cylinder',{r:2,h:10}), steps:['Área da base: π × r² = 3,14 × 4 = 12,56', 'V = base × altura = 12,56 × 10 = 125,6 cm³']},
      {title:'Exemplo 3 (pirâmide)', text:'Base quadrada de lado 6 cm, altura 5 cm → 60 cm³', qVisual: pyramidSVG(6,5), steps:['Área da base: 6 × 6 = 36', 'Pirâmide termina em ponta: divide por 3', 'V = 36 × 5 ÷ 3 = 60 cm³']},
    ],
    gen:{
      facil:()=>{
        if(Math.random()<0.4){ const a=randInt(2,10); return mkSingle(`Qual é o volume (em cm³) de um cubo de aresta ${a} cm?`, a*a*a, [`V = a³ = ${a} × ${a} × ${a}`, `V = ${a*a*a} cm³`]); }
        const c=randInt(2,12), l=randInt(2,10), h=randInt(2,10);
        return mkSingle(`Uma caixa tem ${c} cm de comprimento, ${l} cm de largura e ${h} cm de altura. Qual é o volume (em cm³)?`, c*l*h, [`V = comprimento × largura × altura`, `${c} × ${l} × ${h} = ${c*l*h} cm³`]); },
      medio:()=>{
        if(Math.random()<0.5){ const r=randInt(1,5), h=randInt(2,10), B=round2(3.14*r*r), V=round2(B*h);
          return mkSingle(`Qual é o volume (em cm³) de um cilindro de raio ${r} cm e altura ${h} cm? Use π = 3,14.`, V, [`Área da base: π × r² = 3,14 × ${r*r} = ${fmt(B)}`, `V = ${fmt(B)} × ${h} = ${fmt(V)} cm³`]); }
        const l=randInt(2,10), h=3*randInt(1,5), V=l*l*h/3;
        return mkSingle(`Uma pirâmide tem base quadrada de lado ${l} cm e altura ${h} cm. Qual é o volume (em cm³)?`, V, [`Área da base: ${l} × ${l} = ${l*l}`, `V = base × altura ÷ 3 = ${l*l} × ${h} ÷ 3`, `V = ${V} cm³`]); },
      dificil:()=>{ const t=Math.random();
        if(t<0.4){ const r=randInt(1,5), h=3*randInt(1,4), V=round2(3.14*r*r*h/3);
          return mkSingle(`Qual é o volume (em cm³) de um cone de raio ${r} cm e altura ${h} cm? Use π = 3,14.`, V, [`V = π × r² × h ÷ 3`, `= 3,14 × ${r*r} × ${h} ÷ 3`, `V = ${fmt(V)} cm³`]); }
        if(t<0.7){ const r=pick([3,6]), V=round2(4*3.14*r*r*r/3);
          return mkSingle(`Qual é o volume (em cm³) de uma esfera de raio ${r} cm? Use π = 3,14.`, V, [`V = 4 × π × r³ ÷ 3`, `r³ = ${r*r*r}`, `4 × 3,14 × ${r*r*r} ÷ 3 = ${fmt(V)} cm³`]); }
        const r=randInt(1,10), A=round2(4*3.14*r*r);
        return mkSingle(`Qual é a área da superfície (em cm²) de uma esfera de raio ${r} cm? Use π = 3,14.`, A, [`A = 4 × π × r²`, `= 4 × 3,14 × ${r*r}`, `A = ${fmt(A)} cm²`]); },
    }
  },
  {
    id:'analitica', name:'Geometria analítica', sym:'(x,y)',
    learn:`<p>A geometria analítica junta geometria e álgebra: os pontos viram <b>coordenadas (x, y)</b> no plano cartesiano, e as figuras viram <b>equações</b>.</p>
    <div class="section-title">Distância entre dois pontos</div>
    <p>É o Teorema de Pitágoras disfarçado: a diferença dos x e a diferença dos y são os catetos.</p>
    <div class="example-box mono" style="margin-top:8px">d = √[(x₂ − x₁)² + (y₂ − y₁)²]</div>
    <div class="section-title">Ponto médio</div>
    <div class="example-box mono" style="margin-top:8px">M = ((x₁ + x₂)/2 , (y₁ + y₂)/2)</div>
    <div class="section-title">Reta</div>
    <p>O <b>coeficiente angular</b> diz a inclinação: m = (y₂ − y₁) / (x₂ − x₁). A equação da reta é y = mx + n.</p>
    <div class="section-title">Circunferência</div>
    <div class="example-box mono" style="margin-top:8px">(x − a)² + (y − b)² = r²</div>
    <p>(a, b) é o centro e r é o raio. Se a equação vier "aberta" (x² + y² − 2ax − 2by + c = 0), o centro é (a, b) e r² = a² + b² − c.</p>`,
    examples:[
      {title:'Exemplo 1 (distância)', text:'A(1, 2) e B(4, 6) → d = 5', qVisual: funcGraph({xmin:-0.5, xmax:5.5, ymin:-0.5, ymax:7, grid:true, square:true, label:'d = √(3² + 4²) = 5', segs:[[1,2,4,6]], dash:[[1,2,4,2],[4,2,4,6]], pts:[{x:1,y:2,t:'A',c:'var(--amber)',dx:-8,anchor:'end'},{x:4,y:6,t:'B',c:'var(--coral)'}]}), steps:['Δx = 4 − 1 = 3 · Δy = 6 − 2 = 4 (os catetos pontilhados)', 'd = √(3² + 4²) = √(9 + 16) = √25 = 5']},
      {title:'Exemplo 2 (coeficiente angular)', text:'A(1, 3) e B(3, 11) → m = 4', qVisual: stepChain([`m = ${fracRow([{n:'y₂ − y₁', d:'x₂ − x₁'}])}`, `m = ${fracRow([{n:'11 − 3', d:'3 − 1'}])}`, `m = ${fracRow([{n:8, d:2}])} = 4`]), steps:['Quanto subiu: 11 − 3 = 8', 'Quanto andou pro lado: 3 − 1 = 2', 'm = 8 ÷ 2 = 4']},
      {title:'Exemplo 3 (circunferência)', text:'(x − 2)² + (y − 1)² = 9 → centro (2, 1), raio 3', qVisual: funcGraph({xmin:-2, xmax:6, ymin:-3, ymax:5, grid:true, square:true, label:'(x − 2)² + (y − 1)² = 9', segs:Array.from({length:48},(_,i)=>{ const a=i/48*2*Math.PI, b=(i+1)/48*2*Math.PI; return [2+3*Math.cos(a),1+3*Math.sin(a),2+3*Math.cos(b),1+3*Math.sin(b)]; }), dash:[[2,1,5,1]], pts:[{x:2,y:1,t:'C(2, 1)',c:'var(--amber)',dy:16,dx:4}]}), steps:['Compare com (x − a)² + (y − b)² = r²', 'Centro (a, b) = (2, 1)', 'r² = 9 → r = 3']},
    ],
    gen:{
      facil:()=>{ const [dx,dy,d]=pick([[3,4,5],[4,3,5],[6,8,10],[8,6,10],[5,12,13],[12,5,13],[9,12,15]]), x1=randInt(-5,5), y1=randInt(-5,5), x2=x1+dx*pick([1,-1]), y2=y1+dy*pick([1,-1]);
        return mkSingle(`Qual é a distância entre A(${nm(x1)}, ${nm(y1)}) e B(${nm(x2)}, ${nm(y2)})?`, d, [`Δx = ${nm(x2)} − ${np(x1)} = ${nm(x2-x1)} · Δy = ${nm(y2)} − ${np(y1)} = ${nm(y2-y1)}`, `d = √(${dx*dx} + ${dy*dy}) = √${d*d}`, `d = ${d}`]); },
      medio:()=>{ let m=randInt(-4,4); if(!m) m=2; const dx=randInt(1,4), x1=randInt(-5,5), y1=randInt(-6,6), x2=x1+dx, y2=y1+m*dx;
        return mkSingle(`Qual é o coeficiente angular da reta que passa por A(${nm(x1)}, ${nm(y1)}) e B(${nm(x2)}, ${nm(y2)})?`, m, [`m = (y₂ − y₁) / (x₂ − x₁)`, `= (${nm(y2)} − ${np(y1)}) / (${nm(x2)} − ${np(x1)}) = ${nm(y2-y1)} / ${dx}`, `m = ${nm(m)}`]); },
      dificil:()=>{ let a=randInt(-5,5)||2, b=randInt(-5,5)||-3; const r=randInt(1,6), c=a*a+b*b-r*r;
        const eq = `x² + y² ${-2*a>0?'+':'−'} ${Math.abs(2*a)}x ${-2*b>0?'+':'−'} ${Math.abs(2*b)}y${c?` ${c>0?'+':'−'} ${Math.abs(c)}`:''} = 0`;
        return mkSingle(`Qual é o raio da circunferência ${eq}?`, r, [`Compare com x² + y² − 2ax − 2by + c = 0: a = ${nm(a)}, b = ${nm(b)}, c = ${nm(c)}`, `r² = a² + b² − c = ${a*a} + ${b*b} ${c>=0?'−':'+'} ${Math.abs(c)} = ${r*r}`, `r = ${r}`]); },
    }
  },
  /* =================== ENSINO MÉDIO — Trigonometria =================== */
  {
    id:'trigret', name:'Triângulo retângulo', sym:'θ',
    learn:`<p>Um triângulo retângulo tem um ângulo de <b>90°</b>. O lado maior, oposto ao ângulo reto, é a <b>hipotenusa</b>; os outros dois são os <b>catetos</b>.</p>
    <div class="section-title">Teorema de Pitágoras</div>
    <div class="example-box mono" style="margin-top:8px">hipotenusa² = cateto² + cateto²</div>
    <div class="section-title">Seno, cosseno e tangente</div>
    <p>Olhando para um ângulo θ (que não seja o reto):</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>sen θ</b> = cateto oposto ÷ hipotenusa</li>
      <li><b>cos θ</b> = cateto adjacente ÷ hipotenusa</li>
      <li><b>tg θ</b> = cateto oposto ÷ cateto adjacente</li>
    </ol>
    <p>Pra decorar: <b>"SOH-CAH-TOA"</b> ou "seno é oposto, cosseno é colado".</p>
    <div class="section-title">Ângulos notáveis</div>
    <div class="example-box mono" style="margin-top:8px">30°: sen = 1/2 · cos = √3/2 · tg = √3/3<br>45°: sen = cos = √2/2 · tg = 1<br>60°: sen = √3/2 · cos = 1/2 · tg = √3</div>`,
    examples:[
      {title:'Exemplo 1 (Pitágoras)', text:'Catetos 6 e 8 → hipotenusa 10', qVisual: rightTriSVG({bw:8, bh:6, base:'8 cm', alt:'6 cm', hip:'? cm', ask:'hip'}), steps:['h² = 6² + 8² = 36 + 64 = 100', 'h = √100 = 10 cm']},
      {title:'Exemplo 2 (cateto que falta)', text:'Hipotenusa 13, cateto 5 → outro cateto 12', qVisual: rightTriSVG({bw:12, bh:5, base:'? cm', alt:'5 cm', hip:'13 cm', ask:'base'}), steps:['13² = 5² + x² → 169 = 25 + x²', 'x² = 144 → x = 12 cm']},
      {title:'Exemplo 3 (seno)', text:'Hipotenusa 20, ângulo 30° → cateto oposto 10', qVisual: rightTriSVG({bw:17.3, bh:10, base:'', alt:'? cm', hip:'20 cm', ang:'30°', ask:'alt'}), steps:['O lado que falta é o oposto ao ângulo de 30°: use o seno.', 'sen 30° = oposto ÷ hipotenusa → 1/2 = x ÷ 20', 'x = 10 cm']},
    ],
    gen:{
      facil:()=>{ const [a,b,c]=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20],[7,24,25]]);
        return mkSingle(`Um triângulo retângulo tem catetos ${a} cm e ${b} cm. Quanto mede a hipotenusa (em cm)?`, c, [`h² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}`, `h = √${c*c} = ${c} cm`]); },
      medio:()=>{ const [a,b,c]=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20],[7,24,25]]), sw=Math.random()<0.5, k=sw?a:b, ans=sw?b:a;
        return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${c} cm e um cateto mede ${k} cm. Quanto mede o outro cateto (em cm)?`, ans, [`${c}² = ${k}² + x² → ${c*c} = ${k*k} + x²`, `x² = ${c*c-k*k}`, `x = ${ans} cm`]); },
      dificil:()=>{ const t=Math.random();
        if(t<0.4){ const h=2*randInt(3,15); return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${h} cm. Quanto mede o cateto oposto ao ângulo de 30° (em cm)?`, h/2, ['sen 30° = cateto oposto ÷ hipotenusa', `1/2 = x ÷ ${h}`, `x = ${h/2} cm`]); }
        if(t<0.7){ const h=2*randInt(3,15); return mkSingle(`Num triângulo retângulo, a hipotenusa mede ${h} cm. Quanto mede o cateto adjacente ao ângulo de 60° (em cm)?`, h/2, ['cos 60° = cateto adjacente ÷ hipotenusa', `1/2 = x ÷ ${h}`, `x = ${h/2} cm`]); }
        const a=randInt(3,40); return mkSingle(`Uma escada forma 45° com o chão, e o pé dela está a ${a} m da parede. A que altura (em m) ela toca a parede?`, a, ['tg 45° = cateto oposto ÷ cateto adjacente = 1', `x ÷ ${a} = 1`, `x = ${a} m`]); },
    }
  },
  {
    id:'ciclo', name:'Ciclo trigonométrico', sym:'π',
    learn:`<p>O <b>ciclo trigonométrico</b> é uma circunferência de raio 1, com centro na origem. Cada ângulo marca um ponto nela: a coordenada <b>x</b> desse ponto é o <b>cosseno</b> e a coordenada <b>y</b> é o <b>seno</b>.</p>
    <div class="section-title">Graus e radianos</div>
    <div class="example-box mono" style="margin-top:8px">π rad = 180°</div>
    <p>Pra passar de radianos pra graus, troque π por 180°: 2π/3 = 2 × 180° ÷ 3 = 120°.</p>
    <div class="section-title">Os quadrantes</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>1º (0° a 90°): seno +, cosseno +</li>
      <li>2º (90° a 180°): seno +, cosseno −</li>
      <li>3º (180° a 270°): seno −, cosseno −</li>
      <li>4º (270° a 360°): seno −, cosseno +</li>
    </ol>
    <div class="section-title">Voltas completas</div>
    <p>Dar uma volta inteira (360°) cai no mesmo ponto. Então 390° é o mesmo lugar que 30°. Pra achar a <b>menor determinação positiva</b>, tire 360° quantas vezes precisar.</p>`,
    examples:[
      {title:'Exemplo 1 (radianos → graus)', text:'π/4 rad = 45°', qVisual: unitCircleSVG(45, 'π/4 = 45°'), steps:['π rad = 180°', 'π/4 = 180° ÷ 4 = 45°']},
      {title:'Exemplo 2 (2º quadrante)', text:'5π/6 rad = 150°', qVisual: unitCircleSVG(150, '5π/6 = 150°'), steps:['Troque π por 180°: 5 × 180° ÷ 6 = 900° ÷ 6 = 150°', 'Está no 2º quadrante: seno positivo, cosseno negativo.']},
      {title:'Exemplo 3 (voltas completas)', text:'780° → 60°', qVisual: stepChain(['780°', '780° − 360° = 420°', '420° − 360° = 60°']), steps:['Cada volta completa (360°) cai no mesmo lugar.', 'Tire 360° até ficar entre 0° e 360°: 60°']},
    ],
    gen:{
      facil:()=>{ const k=pick([2,3,4,5,6,9,10,12,18]);
        return mkSingle(`Quantos graus são π/${k} rad?`, 180/k, ['π rad = 180°', `180° ÷ ${k} = ${180/k}°`]); },
      medio:()=>{ const [m,k]=pick([[2,3],[3,4],[5,6],[7,6],[5,4],[4,3],[3,2],[5,3],[7,4],[11,6]]);
        return mkSingle(`Quantos graus são ${m}π/${k} rad?`, m*180/k, ['Troque π por 180°', `${m} × 180° ÷ ${k} = ${m*180}° ÷ ${k} = ${m*180/k}°`]); },
      dificil:()=>{ const base=randInt(1,359);
        if(Math.random()<0.35) return mkSingle(`Qual é a menor determinação positiva (entre 0° e 360°) do ângulo de −${base}°?`, 360-base, ['Ângulo negativo: é só andar no sentido contrário.', `Some uma volta: −${base}° + 360° = ${360-base}°`]);
        const k=randInt(1,3), X=base+360*k;
        return mkSingle(`Qual é a menor determinação positiva (entre 0° e 360°) do ângulo de ${X}°?`, base, [`Tire as voltas completas: ${X}° − ${k} × 360° = ${X} − ${360*k}`, `= ${base}°`]); },
    }
  },
  {
    id:'identidades', name:'Identidades trigonométricas', sym:'≡',
    learn:`<p>Identidades são igualdades que valem <b>pra qualquer ângulo</b>. Elas servem pra descobrir um valor a partir de outro e pra simplificar expressões.</p>
    <div class="section-title">A relação fundamental</div>
    <div class="example-box mono" style="margin-top:8px">sen²x + cos²x = 1</div>
    <p>Ela vem do Pitágoras no ciclo de raio 1. Sabendo o seno, você acha o cosseno (e vice-versa). Cuidado com o sinal, que depende do quadrante!</p>
    <div class="section-title">Outras que caem muito</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>tg x = sen x ÷ cos x</li>
      <li>sen 2x = 2 · sen x · cos x</li>
      <li>cos 2x = cos²x − sen²x</li>
      <li>sen(a + b) = sen a · cos b + sen b · cos a</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (achar o cosseno)', text:'sen x = 3/5 (1º quadrante) → cos x = 4/5', qVisual: stepChain(['sen²x + cos²x = 1', `cos²x = 1 − ${fracRow([{n:9,d:25}])} = ${fracRow([{n:16,d:25}])}`, `cos x = ${fracRow([{n:4,d:5}])}`]), steps:['Relação fundamental: cos²x = 1 − sen²x', '(3/5)² = 9/25 → 1 − 9/25 = 16/25', 'cos x = √(16/25) = 4/5 (positivo no 1º quadrante)']},
      {title:'Exemplo 2 (tangente)', text:'sen x = 3/5 e cos x = 4/5 → tg x = 3/4', qVisual: fracRow(['tg x =', {n:'3/5', d:'4/5'}, '=', {n:3, d:4}]), steps:['tg x = sen x ÷ cos x', '(3/5) ÷ (4/5) = 3/4']},
      {title:'Exemplo 3 (arco duplo)', text:'sen 2x = 2 × 3/5 × 4/5 = 24/25', qVisual: fracRow(['sen 2x = 2 ×', {n:3,d:5}, '×', {n:4,d:5}, '=', {n:24,d:25}]), steps:['sen 2x = 2 · sen x · cos x', '2 × 3/5 × 4/5 = 24/25']},
    ],
    gen:{
      facil:()=>{ const [p,q,h]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[15,8,17],[7,24,25]]), useSen=Math.random()<0.5;
        const [g,w,gn,wn]= useSen ? [p,q,'sen','cos'] : [q,p,'cos','sen'];
        return mkFrac(`Se ${gn} x = ${g}/${h} e x está no 1º quadrante, quanto vale ${wn} x?`, w, h, [`${wn}²x = 1 − ${gn}²x = 1 − ${g*g}/${h*h} = ${h*h-g*g}/${h*h}`, `${wn} x = √(${w*w}/${h*h}) = ${w}/${h} (positivo no 1º quadrante)`]); },
      medio:()=>{ const [p,q,h]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[15,8,17],[7,24,25]]);
        return mkFrac(`Se sen x = ${p}/${h} e cos x = ${q}/${h}, quanto vale tg x?`, p, q, ['tg x = sen x ÷ cos x', `(${p}/${h}) ÷ (${q}/${h}) = ${p}/${q}`]); },
      dificil:()=>{ const [p,q,h]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[7,24,25]]);
        return mkFrac(`Se sen x = ${p}/${h} e cos x = ${q}/${h}, quanto vale sen 2x?`, 2*p*q, h*h, ['sen 2x = 2 · sen x · cos x', `2 × ${p}/${h} × ${q}/${h} = ${2*p*q}/${h*h}`]); },
    }
  },
  {
    id:'leis', name:'Leis dos senos e cossenos', sym:'△',
    learn:`<p>Pitágoras e SOH-CAH-TOA só funcionam no triângulo retângulo. Pra <b>qualquer</b> triângulo, usamos estas duas leis. Os lados são a, b, c e os ângulos opostos a eles são A, B, C.</p>
    <div class="section-title">Lei dos senos</div>
    <div class="example-box mono" style="margin-top:8px">a / sen A = b / sen B = c / sen C = 2R</div>
    <p>Use quando conhece <b>dois ângulos e um lado</b>. R é o raio da circunferência que passa pelos três vértices.</p>
    <div class="section-title">Lei dos cossenos</div>
    <div class="example-box mono" style="margin-top:8px">a² = b² + c² − 2·b·c·cos A</div>
    <p>Use quando conhece <b>dois lados e o ângulo entre eles</b>. Lembre: cos 60° = 1/2 e cos 120° = −1/2.</p>`,
    examples:[
      {title:'Exemplo 1 (lei dos senos)', text:'a = 5 oposto a 30°, B = 90° → b = 10', qVisual: stepChain([`${fracRow([{n:'a', d:'sen A'}])} = ${fracRow([{n:'b', d:'sen B'}])}`, `${fracRow([{n:'5', d:'0,5'}])} = ${fracRow([{n:'b', d:'1'}])}`, 'b = 10']), steps:['a / sen 30° = b / sen 90°', 'sen 30° = 0,5 e sen 90° = 1', '5 ÷ 0,5 = 10 → b = 10']},
      {title:'Exemplo 2 (lei dos cossenos, 60°)', text:'b = 3, c = 8, A = 60° → a = 7', qVisual: triAngleSVG({b:3, c:8, A:60, bl:'3', cl:'8', al:'a = ?', ask:'a'}), steps:['a² = b² + c² − 2bc · cos 60°', 'a² = 9 + 64 − 2 × 3 × 8 × 1/2 = 73 − 24 = 49', 'a = 7']},
      {title:'Exemplo 3 (lei dos cossenos, 120°)', text:'b = 3, c = 5, A = 120° → a = 7', qVisual: triAngleSVG({b:3, c:5, A:120, bl:'3', cl:'5', al:'a = ?', ask:'a'}), steps:['cos 120° = −1/2, então o "−" da fórmula vira "+"', 'a² = 9 + 25 + 15 = 49', 'a = 7']},
    ],
    gen:{
      facil:()=>{ const a=randInt(2,20);
        if(Math.random()<0.5) return mkSingle(`Num triângulo, o lado a mede ${a} cm e o ângulo oposto a ele mede 30°. O ângulo B mede 90°. Quanto mede o lado b (em cm)?`, 2*a, ['Lei dos senos: a / sen A = b / sen B', `${a} / 0,5 = b / 1`, `b = ${2*a} cm`]);
        return mkSingle(`Num triângulo, o lado a mede ${a} cm e o ângulo oposto a ele mede 30°. Qual é o raio R da circunferência circunscrita (em cm)?`, a, ['Lei dos senos: a / sen A = 2R', `${a} / 0,5 = 2R → 2R = ${2*a}`, `R = ${a} cm`]); },
      medio:()=>{ const [b,c,a]=pick([[3,8,7],[5,8,7],[7,15,13],[8,15,13],[5,21,19],[16,21,19],[6,16,14],[10,16,14]]);
        return mkSingle(`Num triângulo, dois lados medem ${b} cm e ${c} cm e o ângulo entre eles é 60°. Quanto mede o terceiro lado (em cm)?`, a, ['Lei dos cossenos: a² = b² + c² − 2bc · cos 60°', `a² = ${b*b} + ${c*c} − 2 × ${b} × ${c} × 1/2 = ${b*b+c*c} − ${b*c}`, `a² = ${a*a} → a = ${a} cm`]); },
      dificil:()=>{ const [b,c,a]=pick([[3,5,7],[7,8,13],[5,16,19],[6,10,14],[9,15,21]]);
        return mkSingle(`Num triângulo, dois lados medem ${b} cm e ${c} cm e o ângulo entre eles é 120°. Quanto mede o terceiro lado (em cm)?`, a, ['Lei dos cossenos com cos 120° = −1/2: a² = b² + c² + bc', `a² = ${b*b} + ${c*c} + ${b*c} = ${a*a}`, `a = ${a} cm`]); },
    }
  },
  /* =================== ENSINO MÉDIO — Estatística e Probabilidade =================== */
  {
    id:'combinatoria', name:'Análise combinatória', sym:'n!',
    learn:`<p>A análise combinatória conta <b>quantas possibilidades</b> existem, sem precisar listar uma por uma.</p>
    <div class="section-title">Princípio multiplicativo</div>
    <p>Se uma escolha tem m opções e outra tem n opções, juntas elas têm <b>m × n</b> possibilidades. 3 camisas e 4 calças = 12 roupas diferentes.</p>
    <div class="section-title">Fatorial</div>
    <div class="example-box mono" style="margin-top:8px">n! = n × (n − 1) × … × 2 × 1      (0! = 1)</div>
    <div class="section-title">A ordem importa?</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Permutação</b> (organizar todos): Pₙ = n! — ex.: anagramas.</li>
      <li><b>Arranjo</b> (escolher p e a ordem importa): A = n! / (n − p)! — ex.: pódio, senha.</li>
      <li><b>Combinação</b> (escolher p e a ordem <b>não</b> importa): C = n! / [p! (n − p)!] — ex.: comissão, grupo.</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (princípio multiplicativo)', text:'3 camisas × 4 calças = 12', qVisual: chainRow(['3','×','4','=','12']), steps:['Para cada uma das 3 camisas há 4 calças.', '3 × 4 = 12 roupas']},
      {title:'Exemplo 2 (anagramas)', text:'AMOR → 4! = 24 anagramas', qVisual: chainRow(['4','×','3','×','2','×','1','=','24']), steps:['1ª letra: 4 opções, 2ª: 3, 3ª: 2, última: 1', '4! = 24']},
      {title:'Exemplo 3 (combinação)', text:'Comissão de 2 entre 5 pessoas → 10', qVisual: fracRow(['C(5,2) =', {n:'5 × 4', d:'2 × 1'}, '=', {n:20,d:2}, '= 10']), steps:['A ordem não importa (Ana e Bia = Bia e Ana).', 'Conte como se importasse (5 × 4 = 20) e divida pelas trocas de lugar (2! = 2).', '20 ÷ 2 = 10']},
    ],
    gen:{
      facil:()=>{ const m=randInt(2,8), n=randInt(2,7);
        if(Math.random()<0.5) return mkSingle(`Uma lanchonete tem ${m} tipos de sanduíche e ${n} tipos de suco. De quantas formas dá pra montar um combo (1 sanduíche + 1 suco)?`, m*n, ['Princípio multiplicativo: multiplique as opções.', `${m} × ${n} = ${m*n}`]);
        const k=randInt(2,4); return mkSingle(`Você tem ${m} camisas, ${n} calças e ${k} pares de tênis. Quantas roupas diferentes dá pra montar?`, m*n*k, ['Princípio multiplicativo', `${m} × ${n} × ${k} = ${m*n*k}`]); },
      medio:()=>{ const w=pick(['SOL','AMOR','GATO','LIVRO','PRATO','CINEMA','BRASIL']), n=w.length, f=[...Array(n).keys()].reduce((a,i)=>a*(i+1),1);
        return mkSingle(`Quantos anagramas tem a palavra ${w}?`, f, [`${n} letras, todas diferentes: permutação P = ${n}!`, `${[...Array(n).keys()].map(i=>n-i).join(' × ')} = ${f}`]); },
      dificil:()=>{
        if(Math.random()<0.5){ const n=randInt(5,12), p=pick([2,3]), C=p===2?n*(n-1)/2:n*(n-1)*(n-2)/6;
          return mkSingle(`De um grupo de ${n} pessoas, quantas comissões diferentes de ${p} pessoas podem ser formadas?`, C, ['A ordem não importa: é combinação.', `C(${n},${p}) = ${p===2?`${n} × ${n-1} ÷ 2`:`${n} × ${n-1} × ${n-2} ÷ 6`}`, `= ${C}`]); }
        const n=randInt(5,12), A=n*(n-1)*(n-2);
        return mkSingle(`Numa corrida com ${n} atletas, de quantas formas diferentes pode ficar o pódio (1º, 2º e 3º lugares)?`, A, ['A ordem importa: é arranjo.', `${n} opções pro 1º × ${n-1} pro 2º × ${n-2} pro 3º`, `= ${A}`]); },
    }
  },
  {
    id:'probabilidade', name:'Probabilidade', sym:'P(A)',
    learn:`<p>Probabilidade mede a <b>chance</b> de algo acontecer. Vai de 0 (impossível) a 1 (certeza), ou de 0% a 100%.</p>
    <div class="example-box mono" style="margin-top:8px">P = casos favoráveis ÷ casos possíveis</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Complementar:</b> P(não acontecer) = 1 − P(acontecer).</li>
      <li><b>"E" (eventos independentes):</b> multiplique as probabilidades.</li>
      <li><b>"OU" (sem nada em comum):</b> some as probabilidades.</li>
    </ol>
    <p><b>Dois dados:</b> são 6 × 6 = <b>36</b> resultados possíveis. A soma mais comum é 7 (6 jeitos).</p>`,
    examples:[
      {title:'Exemplo 1 (dado)', text:'Sair número par → 3/6 = 1/2', qVisual: fracRow(['P =', {n:'favoráveis', d:'possíveis'}, '=', {n:3, d:6}, '=', {n:1, d:2}]), steps:['Pares: 2, 4, 6 → 3 casos favoráveis', 'Um dado tem 6 resultados possíveis', 'P = 3/6 = 1/2 = 50%']},
      {title:'Exemplo 2 (urna)', text:'3 bolas vermelhas e 5 azuis → P(vermelha) = 3/8', qVisual: fracRow(['P(vermelha) =', {n:3, d:'3 + 5'}, '=', {n:3, d:8}]), steps:['Total: 3 + 5 = 8 bolas', 'P = 3/8']},
      {title:'Exemplo 3 (dois dados)', text:'Soma 5 → 4/36 = 1/9', qVisual: diceGrid(5), steps:['A tabela mostra os 36 resultados possíveis.', 'Soma 5 aparece 4 vezes: (1,4), (2,3), (3,2), (4,1)', 'P = 4/36 = 1/9']},
    ],
    gen:{
      facil:()=>{ const opts=[['um número par',[2,4,6]],['um número ímpar',[1,3,5]],['um múltiplo de 3',[3,6]],['um número maior que 4',[5,6]],['um número menor que 3',[1,2]],['um número primo',[2,3,5]],['o número 6',[6]],['um número maior que 1',[2,3,4,5,6]]];
        const [t,list]=pick(opts);
        return mkFrac(`Ao jogar um dado comum, qual é a probabilidade de sair ${t}?`, list.length, 6, [`Casos favoráveis: ${list.join(', ')} → ${list.length}`, `P = ${list.length}/6${fracStr(list.length,6)!==list.length+'/6'?` = ${fracStr(list.length,6)}`:''}`]); },
      medio:()=>{ const r=randInt(1,8), a=randInt(1,8), v=randInt(1,8), tot=r+a+v, [nome,k]=pick([['vermelha',r],['azul',a],['verde',v]]);
        return mkFrac(`Uma urna tem ${r} bola${r>1?'s':''} vermelha${r>1?'s':''}, ${a} azu${a>1?'is':'l'} e ${v} verde${v>1?'s':''}. Tirando uma ao acaso, qual é a probabilidade de ela ser ${nome}?`, k, tot, [`Total de bolas: ${r} + ${a} + ${v} = ${tot}`, `P = ${k}/${tot}${fracStr(k,tot)!==k+'/'+tot?` = ${fracStr(k,tot)}`:''}`]); },
      dificil:()=>{
        if(Math.random()<0.7){ const s=randInt(3,11), n=6-Math.abs(s-7), pairs=[]; for(let i=1;i<=6;i++){ const j=s-i; if(j>=1&&j<=6) pairs.push(`(${i},${j})`); }
          return mkFrac(`Jogando dois dados, qual é a probabilidade de a soma dar ${s}?`, n, 36, ['São 6 × 6 = 36 resultados possíveis.', `Soma ${s}: ${pairs.join(', ')} → ${n} casos`, `P = ${n}/36 = ${fracStr(n,36)}`]); }
        const k=randInt(2,4);
        return mkFrac(`Jogando uma moeda ${k} vezes, qual é a probabilidade de sair cara em todas?`, 1, Math.pow(2,k), ['Cada jogada: P(cara) = 1/2, e as jogadas são independentes.', `Multiplique: (1/2)<sup>${k}</sup> = 1/${Math.pow(2,k)}`]); },
    }
  },
  {
    id:'dispersao', name:'Desvio padrão', sym:'σ',
    learn:`<p>A média diz onde os dados estão "no meio". Mas dois grupos podem ter a mesma média e ser bem diferentes: notas 5, 5, 5 e notas 0, 5, 10 têm média 5! As medidas de <b>dispersão</b> dizem o quanto os dados se <b>espalham</b>.</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Amplitude:</b> maior valor − menor valor.</li>
      <li><b>Variância (σ²):</b> a média dos quadrados das distâncias até a média.</li>
      <li><b>Desvio padrão (σ):</b> a raiz quadrada da variância.</li>
    </ol>
    <div class="section-title">Passo a passo</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Calcule a média.</li>
      <li>Subtraia a média de cada valor (o desvio).</li>
      <li>Eleve cada desvio ao quadrado e tire a média deles → variância.</li>
      <li>Tire a raiz → desvio padrão.</li>
    </ol>
    <p>Desvio padrão <b>pequeno</b>: dados parecidos, grupo regular. <b>Grande</b>: dados espalhados.</p>`,
    examples:[
      {title:'Exemplo 1 (amplitude)', text:'3, 9, 5, 12 → amplitude 9', qVisual: stepChain(['3, 9, 5, 12', 'maior: 12 · menor: 3', '12 − 3 = 9']), steps:['Maior valor: 12 · menor: 3', 'Amplitude = 12 − 3 = 9']},
      {title:'Exemplo 2 (variância e desvio padrão)', text:'2, 4, 4, 6 → σ² = 2, σ ≈ 1,41', qVisual: miniTable(['valor','− média (4)','desvio²'], [['2','−2','4'],['4','0','0'],['4','0','0'],['6','2','4']], ['','soma','8']), steps:['Média = 16 ÷ 4 = 4', 'Some os desvios ao quadrado: 4 + 0 + 0 + 4 = 8', 'Variância = 8 ÷ 4 = 2 → desvio padrão σ = √2 ≈ 1,41']},
      {title:'Exemplo 3 (comparando grupos)', text:'5, 5, 5 → σ = 0 · 0, 5, 10 → σ ≈ 4,08', qVisual: stepChain(['Turma A: 5, 5, 5 → σ = 0', 'Turma B: 0, 5, 10 → σ ≈ 4,08']), steps:['As duas turmas têm média 5.', 'Na turma A todo mundo tirou igual: desvio 0.', 'Na turma B as notas se espalham: desvio grande.']},
    ],
    gen:{
      facil:()=>{ const nums=Array.from({length:6},()=>randInt(1,40)), mx=Math.max(...nums), mn=Math.min(...nums);
        return mkSingle(`Qual é a amplitude dos dados ${nums.join(', ')}?`, mx-mn, ['Amplitude = maior − menor', `${mx} − ${mn} = ${mx-mn}`]); },
      medio:()=>{ const devs=pick([[-2,-1,0,1,2],[-3,-1,1,3],[-2,0,0,2],[-4,-2,2,4],[-1,-1,1,1],[-3,0,3],[-2,-2,2,2],[-6,0,0,6]]), m=randInt(5,20), nums=shuffle(devs.map(d=>m+d)), v=devs.reduce((a,d)=>a+d*d,0)/devs.length;
        return mkSingle(`Qual é a variância dos dados ${nums.join(', ')}?`, v, [`Média: ${nums.reduce((a,b)=>a+b,0)} ÷ ${nums.length} = ${m}`, `Desvios ao quadrado: ${devs.map(d=>d*d).join(', ')}`, `Variância = ${devs.reduce((a,d)=>a+d*d,0)} ÷ ${devs.length} = ${fmt(v)}`]); },
      dificil:()=>{ const devs=pick([[-2,-2,2,2],[-3,-3,3,3],[-1,-1,1,1],[-4,-4,4,4],[-3,-1,1,3],[-2,-1,0,1,2],[-5,-5,5,5]]), m=randInt(6,20), nums=shuffle(devs.map(d=>m+d)), v=devs.reduce((a,d)=>a+d*d,0)/devs.length, s=round2(Math.sqrt(v));
        return mkSingle(`Qual é o desvio padrão dos dados ${nums.join(', ')}? (se precisar, arredonde para 2 casas)`, s, [`Média = ${m}`, `Desvios ao quadrado: ${devs.map(d=>d*d).join(', ')} → variância = ${fmt(v)}`, `σ = √${fmt(v)} ${Number.isInteger(s)?'=':'≈'} ${fmt(s)}`]); },
    }
  },
  {
    id:'graficos', name:'Análise de gráficos', sym:'▥',
    learn:`<p>Gráficos aparecem em quase toda prova do ENEM. Antes de fazer qualquer conta, <b>leia com calma</b>:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Título:</b> do que o gráfico fala?</li>
      <li><b>Eixos e unidades:</b> é em reais, em mil, em %?</li>
      <li><b>Legenda:</b> o que cada cor representa?</li>
    </ol>
    <div class="section-title">Qual gráfico serve pra quê</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Colunas/barras:</b> comparar quantidades.</li>
      <li><b>Linhas:</b> ver como algo muda com o tempo.</li>
      <li><b>Setores (pizza):</b> partes de um todo. O círculo inteiro (360°) é 100%, então 1% = 3,6°.</li>
    </ol>
    <div class="section-title">Variação percentual</div>
    <div class="example-box mono" style="margin-top:8px">variação = (novo − antigo) ÷ antigo × 100</div>`,
    examples:[
      {title:'Exemplo 1 (ler o gráfico)', text:'Vendas: Jan 40, Fev 60 → aumento de 20', qVisual: barChartSVG('Vendas (unidades)', ['Jan','Fev','Mar'], [40,60,50]), steps:['Leia no topo de cada coluna: Jan = 40, Fev = 60', 'Aumento: 60 − 40 = 20 unidades']},
      {title:'Exemplo 2 (variação percentual)', text:'De 40 para 60 → aumento de 50%', qVisual: fracRow([{n:'60 − 40', d:'40'}, '=', {n:20, d:40}, '= 0,5 = 50%']), steps:['Variação = (novo − antigo) ÷ antigo', '20 ÷ 40 = 0,5', '0,5 × 100 = 50%']},
      {title:'Exemplo 3 (setores)', text:'Setor de 90° → 25% do total', qVisual: pieSVG(90, '90°'), steps:['O círculo todo tem 360° = 100%.', '90° ÷ 360° = 0,25 = 25%']},
    ],
    gen:{
      facil:()=>{ const meses=['Jan','Fev','Mar','Abr','Mai'], vals=meses.map(()=>randInt(2,12)*10), i=randInt(0,4), svg=barChartSVG('Vendas de sorvete (unidades)', meses, vals), q=`Quantos sorvetes foram vendidos em ${['janeiro','fevereiro','março','abril','maio'][i]}?`;
        return mkSingle(q, vals[i], [`Procure a coluna "${meses[i]}" e leia o número em cima dela: ${vals[i]}`], null, geoQ(q, svg), svg); },
      medio:()=>{ const meses=['Jan','Fev','Mar','Abr','Mai'], vals=meses.map(()=>randInt(2,12)*10), svg=barChartSVG('Vendas de sorvete (unidades)', meses, vals);
        if(Math.random()<0.5){ const mx=Math.max(...vals), mn=Math.min(...vals), q='Qual é a diferença entre o mês que mais vendeu e o que menos vendeu?';
          return mkSingle(q, mx-mn, [`Maior: ${mx} · Menor: ${mn}`, `${mx} − ${mn} = ${mx-mn}`], null, geoQ(q, svg), svg); }
        const tot=vals.reduce((a,b)=>a+b,0), q='Quantos sorvetes foram vendidos no total, nos 5 meses?';
        return mkSingle(q, tot, [`Some todas as colunas: ${vals.join(' + ')}`, `= ${tot}`], null, geoQ(q, svg), svg); },
      dificil:()=>{
        if(Math.random()<0.3){ const p=pick([10,15,20,25,30,40,45,50]), ang=p*3.6, q=`Num gráfico de setores (pizza), uma fatia tem ${fmt(ang)}°. Que porcentagem do total ela representa?`;
          return mkSingle(q, p, ['O círculo todo tem 360° = 100%.', `${fmt(ang)} ÷ 360 = ${fmt(p/100)}`, `= ${p}%`]); }
        let v1, p; do{ v1=pick([20,40,50,60,80,100]); p=pick([10,20,25,50,75]); }while((v1*p)%100);
        const v2=v1*(1+p/100), meses=['Jan','Fev','Mar','Abr'], j=randInt(0,2), vals=meses.map(()=>randInt(2,12)*10); vals[j]=v1; vals[j+1]=v2;
        const svg=barChartSVG('Clientes atendidos', meses, vals), q=`Qual foi o aumento percentual de clientes de ${meses[j]} para ${meses[j+1]}?`;
        return mkSingle(q, p, [`${meses[j]} = ${v1} · ${meses[j+1]} = ${v2}`, `(${v2} − ${v1}) ÷ ${v1} = ${v2-v1} ÷ ${v1} = ${fmt(p/100)}`, `= ${p}%`], null, geoQ(q, svg), svg); },
    }
  },
  /* =================== ENSINO MÉDIO — Matemática Financeira =================== */
  {
    id:'juros', name:'Juros simples e compostos', sym:'J',
    learn:`<p><b>Juros</b> são o "aluguel" do dinheiro: quem empresta recebe a mais, quem pega emprestado paga a mais. Os nomes: <b>C</b> = capital (valor inicial), <b>i</b> = taxa, <b>t</b> = tempo, <b>J</b> = juros e <b>M</b> = montante (total no fim).</p>
    <div class="section-title">Juros simples</div>
    <p>Os juros são calculados <b>sempre sobre o valor inicial</b>, e são iguais todo mês.</p>
    <div class="example-box mono" style="margin-top:8px">J = C · i · t      M = C + J</div>
    <div class="section-title">Juros compostos ("juros sobre juros")</div>
    <p>Cada mês, os juros entram no valor e o mês seguinte rende em cima de tudo. É assim que funcionam a poupança e o cartão de crédito.</p>
    <div class="example-box mono" style="margin-top:8px">M = C · (1 + i)ᵗ</div>
    <p><b>Atenção:</b> a taxa e o tempo precisam estar na mesma unidade (ao mês com meses, ao ano com anos), e a taxa entra como decimal: 5% = 0,05.</p>`,
    examples:[
      {title:'Exemplo 1 (juros simples)', text:'R$ 1.000 a 2% ao mês por 5 meses → J = R$ 100', qVisual: stepChain(['J = C · i · t', 'J = 1000 × 0,02 × 5', 'J = R$ 100']), steps:['C = 1000, i = 2% = 0,02, t = 5', '1000 × 0,02 = 20 por mês', '20 × 5 = R$ 100']},
      {title:'Exemplo 2 (juros compostos)', text:'R$ 1.000 a 10% ao mês por 2 meses → M = R$ 1.210', qVisual: stepChain(['M = C · (1 + i)ᵗ', 'M = 1000 × 1,1²', 'M = 1000 × 1,21', 'M = R$ 1.210']), steps:['C = 1000, i = 10% = 0,1, t = 2', '1,1² = 1,21', '1000 × 1,21 = R$ 1.210']},
      {title:'Exemplo 3 (comparando mês a mês)', text:'Simples: R$ 1.200 · Composto: R$ 1.210', qVisual: miniTable(['mês','simples','composto'], [['0','1.000','1.000'],['1','1.100','1.100'],['2','1.200','1.210']]), steps:['No simples, rende sempre 10% de 1.000 = R$ 100 por mês.', 'No composto, o 2º mês rende 10% de 1.100 = R$ 110.', 'O composto rende R$ 10 a mais.']},
    ],
    gen:{
      facil:()=>{ const C=randInt(2,30)*100, i=randInt(1,10), t=randInt(2,12), J=C*i*t/100;
        return mkSingle(`Quanto rende (em juros) um capital de ${reais(C)} aplicado a juros simples de ${i}% ao mês durante ${t} meses?`, J, ['J = C · i · t', `J = ${C} × ${fmt(i/100)} × ${t}`, `J = ${reais(J)}`]); },
      medio:()=>{ const C=randInt(2,30)*100, i=randInt(1,10), t=randInt(2,12), J=C*i*t/100;
        return mkSingle(`Qual é o montante (em reais) de ${reais(C)} aplicados a juros simples de ${i}% ao mês durante ${t} meses?`, C+J, [`J = ${C} × ${fmt(i/100)} × ${t} = ${fmt(J)}`, `M = C + J = ${C} + ${fmt(J)} = ${reais(C+J)}`]); },
      dificil:()=>{ const C=randInt(1,20)*100, i=pick([5,10,20]), t=pick([2,3]), f=Math.pow(1+i/100,t), M=round2(C*f);
        return mkSingle(`Qual é o montante (em reais) de ${reais(C)} aplicados a juros compostos de ${i}% ao mês durante ${t} meses?`, M, ['M = C · (1 + i)ᵗ', `M = ${C} × ${fmt(1+i/100)}<sup>${t}</sup> = ${C} × ${fmt(round2(f*10000)/10000)}`, `M = ${reais(M)}`]); },
    }
  },
  {
    id:'descontos', name:'Descontos e aumentos', sym:'−%',
    learn:`<p>O jeito mais rápido de calcular descontos e aumentos é usar um <b>fator</b> e fazer uma multiplicação só:</p>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Desconto de d%:</b> multiplique por (1 − d). 20% de desconto → × 0,80.</li>
      <li><b>Aumento de a%:</b> multiplique por (1 + a). 15% de aumento → × 1,15.</li>
    </ol>
    <div class="section-title">Descontos sucessivos — a pegadinha</div>
    <p>Descontos seguidos <b>não se somam</b>! Cada desconto é aplicado sobre o preço que já foi descontado. Multiplique os fatores:</p>
    <div class="example-box mono" style="margin-top:8px">10% e depois 20%: 0,90 × 0,80 = 0,72</div>
    <p>Pagar 72% do preço = desconto total de <b>28%</b>, e não de 30%.</p>`,
    examples:[
      {title:'Exemplo 1 (desconto)', text:'R$ 250 com 20% de desconto → R$ 200', qVisual: seqRow(['R$ 250','R$ 200'], '× 0,80'), steps:['Fator: 1 − 0,20 = 0,80', '250 × 0,80 = R$ 200']},
      {title:'Exemplo 2 (descontos sucessivos)', text:'R$ 200 com 10% e depois 20% → R$ 144', qVisual: seqRow(['R$ 200','R$ 180','R$ 144'], ['× 0,90','× 0,80']), steps:['1º desconto: 200 × 0,90 = 180', '2º desconto (sobre 180!): 180 × 0,80 = R$ 144']},
      {title:'Exemplo 3 (desconto único equivalente)', text:'10% + 20% sucessivos = 28%', qVisual: stepChain(['0,90 × 0,80 = 0,72', 'paga 72% do preço', '100% − 72% = 28% de desconto']), steps:['Multiplique os fatores: 0,90 × 0,80 = 0,72', 'Desconto total: 1 − 0,72 = 0,28 = 28% (e não 30%)']},
    ],
    gen:{
      facil:()=>{ const P=randInt(2,50)*10, d=pick([10,20,25,30,40,50]), V=round2(P*(1-d/100));
        return mkSingle(`Um produto de ${reais(P)} está com ${d}% de desconto. Quanto ele custa agora (em reais)?`, V, [`Fator: 1 − ${fmt(d/100)} = ${fmt(1-d/100)}`, `${P} × ${fmt(1-d/100)} = ${reais(V)}`]); },
      medio:()=>{ const P=randInt(2,50)*20, d1=pick([10,20,25,50]), d2=pick([10,20,25,50]), V=round2(P*(1-d1/100)*(1-d2/100));
        return mkSingle(`Um produto de ${reais(P)} teve um desconto de ${d1}% e, depois, mais ${d2}% sobre o novo preço. Quanto custa agora (em reais)?`, V, [`Depois do 1º desconto: ${P} × ${fmt(1-d1/100)} = ${fmt(round2(P*(1-d1/100)))}`, `Depois do 2º: ${fmt(round2(P*(1-d1/100)))} × ${fmt(1-d2/100)} = ${reais(V)}`]); },
      dificil:()=>{ const d1=pick([10,20,25,30,50]), d2=pick([10,20,25,40,50]), f=(1-d1/100)*(1-d2/100), D=round2((1-f)*100);
        return mkSingle(`Dois descontos sucessivos de ${d1}% e ${d2}% equivalem a um único desconto de quantos por cento?`, D, [`Multiplique os fatores: ${fmt(1-d1/100)} × ${fmt(1-d2/100)} = ${fmt(round2(f*10000)/10000)}`, `Você paga ${fmt(round2(f*100))}% do preço`, `Desconto único: 100% − ${fmt(round2(f*100))}% = ${fmt(D)}%`]); },
    }
  },
  {
    id:'inflacao', name:'Taxas de inflação', sym:'↑%',
    learn:`<p><b>Inflação</b> é o aumento geral dos preços. Se a inflação do ano foi 5%, o que custava R$ 100 passa a custar R$ 105: seu dinheiro compra menos.</p>
    <div class="section-title">Inflação acumulada</div>
    <p>Taxas de meses (ou anos) seguidos <b>não se somam</b>, se multiplicam, igual aos juros compostos:</p>
    <div class="example-box mono" style="margin-top:8px">acumulada = (1 + i₁) · (1 + i₂) − 1</div>
    <p>10% num ano e 10% no outro = 1,1 × 1,1 − 1 = 0,21 = <b>21%</b> (e não 20%).</p>
    <div class="section-title">Ganho real</div>
    <p>Se um investimento rendeu 10% mas a inflação foi 4%, você não ganhou 6%. O <b>ganho real</b> desconta a inflação dividindo os fatores:</p>
    <div class="example-box mono" style="margin-top:8px">1 + real = (1 + rendimento) ÷ (1 + inflação)</div>`,
    examples:[
      {title:'Exemplo 1 (preço corrigido)', text:'R$ 80 com inflação de 5% → R$ 84', qVisual: seqRow(['R$ 80','R$ 84'], '× 1,05'), steps:['Fator: 1 + 0,05 = 1,05', '80 × 1,05 = R$ 84']},
      {title:'Exemplo 2 (inflação acumulada)', text:'5% e depois 10% → 15,5%', qVisual: seqRow(['100','105','115,5'], ['× 1,05','× 1,10']), steps:['Pense num preço de 100: depois de 5% vira 105.', 'Depois de mais 10%: 105 × 1,10 = 115,5', 'Acumulada: 15,5% (e não 15%)']},
      {title:'Exemplo 3 (ganho real)', text:'Rendeu 32%, inflação 10% → real 20%', qVisual: fracRow(['1 + real =', {n:'1,32', d:'1,10'}, '= 1,20']), steps:['Divida os fatores: 1,32 ÷ 1,10 = 1,20', 'Ganho real: 20%']},
    ],
    gen:{
      facil:()=>{ const P=randInt(2,40)*10, i=randInt(2,12), V=round2(P*(1+i/100));
        return mkSingle(`Um produto custava ${reais(P)}. Com uma inflação de ${i}% no ano, quanto ele passa a custar (em reais)?`, V, [`Fator: 1 + ${fmt(i/100)} = ${fmt(1+i/100)}`, `${P} × ${fmt(1+i/100)} = ${reais(V)}`]); },
      medio:()=>{ const a=pick([2,4,5,10,20]), b=pick([5,10,20,50]), ac=round2(((1+a/100)*(1+b/100)-1)*100);
        return mkSingle(`A inflação foi de ${a}% num ano e de ${b}% no ano seguinte. Qual foi a inflação acumulada nos dois anos (em %)?`, ac, ['Multiplique os fatores (não some!)', `${fmt(1+a/100)} × ${fmt(1+b/100)} = ${fmt(round2((1+a/100)*(1+b/100)*10000)/10000)}`, `Acumulada: ${fmt(ac)}%`]); },
      dificil:()=>{ const inf=pick([10,20,25,50]), r=pick([4,5,10,20]), ap=round2(((1+inf/100)*(1+r/100)-1)*100);
        return mkSingle(`Um investimento rendeu ${fmt(ap)}% num ano em que a inflação foi de ${inf}%. Qual foi o ganho real (em %)?`, r, ['1 + real = (1 + rendimento) ÷ (1 + inflação)', `${fmt(1+ap/100)} ÷ ${fmt(1+inf/100)} = ${fmt(1+r/100)}`, `Ganho real: ${r}%`]); },
    }
  },
  /* =================== ENSINO MÉDIO — Matrizes e Sistemas =================== */
  {
    id:'matrizes', name:'Matrizes', sym:'[ ]',
    learn:`<p>Uma <b>matriz</b> é uma tabela de números organizada em <b>linhas</b> (deitadas) e <b>colunas</b> (em pé). Uma matriz 2×3 tem 2 linhas e 3 colunas.</p>
    <p>O elemento <b>aᵢⱼ</b> fica na <b>linha i</b> e na <b>coluna j</b>: a₂₁ é o da 2ª linha, 1ª coluna.</p>
    <div class="section-title">Operações</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li><b>Soma:</b> some elemento com elemento na mesma posição (as matrizes precisam ter o mesmo tamanho).</li>
      <li><b>Número × matriz:</b> multiplique todos os elementos pelo número.</li>
      <li><b>Produto A·B:</b> só existe se o nº de colunas de A = nº de linhas de B. O elemento cᵢⱼ é a <b>linha i de A "vezes" a coluna j de B</b>: multiplique termo a termo e some.</li>
    </ol>
    <p><b>Matriz identidade (I):</b> 1 na diagonal e 0 no resto. A · I = A.</p>`,
    examples:[
      {title:'Exemplo 1 (localizar a₂₃)', text:'Na matriz abaixo, a₂₃ = 6', qVisual: matHTML([[1,2,3],[4,5,6]], 'A', (i,j)=> i===1&&j===2 ? 'hl-a' : (i===1||j===2) ? 'hl-soft' : ''), steps:['a₂₃ = linha 2, coluna 3', 'Linha 2: 4, 5, 6 → na coluna 3 está o 6']},
      {title:'Exemplo 2 (soma)', text:'A + B: some posição com posição', qVisual: `<div class="mat-row">${matHTML([[1,2],[3,4]], 'A')}<span class="mat-op">+</span>${matHTML([[5,0],[1,2]], 'B')}<span class="mat-op">=</span>${matHTML([[6,2],[4,6]])}</div>`, steps:['c₁₁ = 1 + 5 = 6 · c₁₂ = 2 + 0 = 2', 'c₂₁ = 3 + 1 = 4 · c₂₂ = 4 + 2 = 6']},
      {title:'Exemplo 3 (produto)', text:'c₁₁ = 1·5 + 2·7 = 19', qVisual: `<div class="mat-row">${matHTML([[1,2],[3,4]], 'A', (i)=> i===0 ? 'hl-a' : '')}${matHTML([[5,6],[7,8]], 'B', (i,j)=> j===0 ? 'hl-b' : '')}</div>`, steps:['c₁₁ = linha 1 de A × coluna 1 de B', '1×5 + 2×7 = 5 + 14 = 19']},
    ],
    gen:{
      facil:()=>{ const r=pick([2,3]), c=3, M=Array.from({length:r},()=>Array.from({length:c},()=>randInt(-9,9))), i=randInt(1,r), j=randInt(1,c), q=`Na matriz A, qual é o elemento a${SUBD[i]}${SUBD[j]}?`;
        return mkSingle(q, M[i-1][j-1], [`Vá até a linha ${i}: ${M[i-1].map(nm).join(', ')}`, `Pegue a coluna ${j}: ${nm(M[i-1][j-1])}`], null, matQ(q, [matHTML(M,'A')]), matHTML(M,'A')); },
      medio:()=>{ const A=[[randInt(-6,9),randInt(-6,9)],[randInt(-6,9),randInt(-6,9)]], B=[[randInt(-6,9),randInt(-6,9)],[randInt(-6,9),randInt(-6,9)]], k=pick([1,2,3]), i=randInt(1,2), j=randInt(1,2), v=k*A[i-1][j-1]+B[i-1][j-1];
        const q=`Sendo C = ${k===1?'':k}A + B, qual é o elemento c${SUBD[i]}${SUBD[j]}?`;
        return mkSingle(q, v, [`c${SUBD[i]}${SUBD[j]} = ${k===1?'':k+' × '}a${SUBD[i]}${SUBD[j]} + b${SUBD[i]}${SUBD[j]}`, `= ${k===1?'':k+' × '}${np(A[i-1][j-1])} + ${np(B[i-1][j-1])} = ${nm(v)}`], null, matQ(q, [matHTML(A,'A'), matHTML(B,'B')])); },
      dificil:()=>{ const A=[[randInt(-3,5),randInt(-3,5)],[randInt(-3,5),randInt(-3,5)]], B=[[randInt(-3,5),randInt(-3,5)],[randInt(-3,5),randInt(-3,5)]], i=randInt(1,2), j=randInt(1,2);
        const v=A[i-1][0]*B[0][j-1]+A[i-1][1]*B[1][j-1], q=`Sendo C = A · B, qual é o elemento c${SUBD[i]}${SUBD[j]}?`;
        return mkSingle(q, v, [`Linha ${i} de A: (${A[i-1].map(nm).join(', ')}) · Coluna ${j} de B: (${nm(B[0][j-1])}, ${nm(B[1][j-1])})`, `${np(A[i-1][0])}×${np(B[0][j-1])} + ${np(A[i-1][1])}×${np(B[1][j-1])} = ${nm(A[i-1][0]*B[0][j-1])} + ${np(A[i-1][1]*B[1][j-1])}`, `= ${nm(v)}`], null, matQ(q, [matHTML(A,'A'), matHTML(B,'B')])); },
    }
  },
  {
    id:'determinantes', name:'Determinantes', sym:'det',
    learn:`<p>O <b>determinante</b> é um número calculado a partir de uma matriz <b>quadrada</b> (mesmo número de linhas e colunas). Ele diz, por exemplo, se a matriz tem inversa (só tem se det ≠ 0) e se um sistema linear tem solução única.</p>
    <div class="section-title">Matriz 2×2</div>
    <p>Diagonal principal menos diagonal secundária:</p>
    <div class="example-box mono" style="margin-top:8px">| a  b |<br>| c  d |  = a·d − b·c</div>
    <div class="section-title">Matriz 3×3 — Regra de Sarrus</div>
    <ol style="margin:0 0 10px; padding-left:20px; line-height:1.7;">
      <li>Repita as duas primeiras colunas à direita da matriz.</li>
      <li>Multiplique as 3 diagonais que descem pra direita e some.</li>
      <li>Multiplique as 3 diagonais que sobem pra direita e some.</li>
      <li>det = (1ª soma) − (2ª soma).</li>
    </ol>`,
    examples:[
      {title:'Exemplo 1 (2×2)', text:'det = 3·4 − 1·2 = 10', qVisual: `<div class="mat-row">${matHTML([[3,1],[2,4]], 'det', (i,j)=> i===j ? 'hl-a' : 'hl-b')}</div>`, steps:['Diagonal principal (azul): 3 × 4 = 12', 'Diagonal secundária (laranja): 1 × 2 = 2', 'det = 12 − 2 = 10']},
      {title:'Exemplo 2 (2×2 com negativos)', text:'det = 5·(−2) − 3·(−4) = 2', qVisual: `<div class="mat-row">${matHTML([[5,3],[-4,-2]], 'det', (i,j)=> i===j ? 'hl-a' : 'hl-b')}</div>`, steps:['Principal: 5 × (−2) = −10', 'Secundária: 3 × (−4) = −12', 'det = −10 − (−12) = −10 + 12 = 2']},
      {title:'Exemplo 3 (3×3 — Sarrus)', text:'det = −17', qVisual: `<div class="mat-row">${matHTML([[1,2,0,1,2],[3,1,2,3,1],[0,1,3,0,1]], '', (i,j)=> j>2 ? 'dim' : '')}</div>`, steps:['Repita as 2 primeiras colunas (em cinza) do lado direito.', 'Descendo: 1·1·3 + 2·2·0 + 0·3·1 = 3', 'Subindo: 0·1·0 + 1·2·1 + 2·3·3 = 20', 'det = 3 − 20 = −17']},
    ],
    gen:{
      facil:()=>{ const M=[[randInt(1,9),randInt(1,9)],[randInt(1,9),randInt(1,9)]], d=M[0][0]*M[1][1]-M[0][1]*M[1][0], q='Qual é o determinante da matriz?';
        return mkSingle(q, d, [`Diagonal principal: ${M[0][0]} × ${M[1][1]} = ${M[0][0]*M[1][1]}`, `Diagonal secundária: ${M[0][1]} × ${M[1][0]} = ${M[0][1]*M[1][0]}`, `det = ${M[0][0]*M[1][1]} − ${M[0][1]*M[1][0]} = ${nm(d)}`], null, matQ(q, [matHTML(M)]), matHTML(M)); },
      medio:()=>{ const M=[[randInt(-8,9),randInt(-8,9)],[randInt(-8,9),randInt(-8,9)]], p=M[0][0]*M[1][1], s=M[0][1]*M[1][0], d=p-s, q='Qual é o determinante da matriz?';
        return mkSingle(q, d, [`Diagonal principal: ${np(M[0][0])} × ${np(M[1][1])} = ${nm(p)}`, `Diagonal secundária: ${np(M[0][1])} × ${np(M[1][0])} = ${nm(s)}`, `det = ${nm(p)} − ${np(s)} = ${nm(d)}`], null, matQ(q, [matHTML(M)]), matHTML(M)); },
      dificil:()=>{ const M=Array.from({length:3},()=>Array.from({length:3},()=>randInt(-3,4)));
        const [[a,b,c],[d,e,f],[g,h,i]]=M, down=a*e*i+b*f*g+c*d*h, up=c*e*g+a*f*h+b*d*i, det=down-up, q='Qual é o determinante da matriz 3×3? (use a regra de Sarrus)';
        return mkSingle(q, det, [`Descendo: ${np(a)}·${np(e)}·${np(i)} + ${np(b)}·${np(f)}·${np(g)} + ${np(c)}·${np(d)}·${np(h)} = ${nm(down)}`, `Subindo: ${np(c)}·${np(e)}·${np(g)} + ${np(a)}·${np(f)}·${np(h)} + ${np(b)}·${np(d)}·${np(i)} = ${nm(up)}`, `det = ${nm(down)} − ${np(up)} = ${nm(det)}`], null, matQ(q, [matHTML(M)]), matHTML(M)); },
    }
  },
);
