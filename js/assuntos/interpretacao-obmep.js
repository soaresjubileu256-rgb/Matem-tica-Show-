/* =========================================================
   MAIS QUESTÕES DE INTERPRETAÇÃO — OBMEP
   Modelos novos do simulado (mesmo formato de js/assuntos/interpretacao.js).
   Questões ORIGINAIS no estilo da prova, com números e situações sorteados.
   ========================================================= */
IQ_OBMEP.push(
  // quadrado mágico: descobrir a casa que falta
  ()=>{
    const a = randInt(1,12), d = pick([1,2,3,5]);
    let M = [[2,7,6],[9,5,1],[4,3,8]];
    for(let t=randInt(0,3); t>0; t--) M = M[0].map((_,j)=> M.map(r=>r[j]).reverse());
    if(Math.random()<0.5) M = M.map(r=>r.slice().reverse());
    M = M.map(r=>r.map(v=> a + (v-1)*d));
    const nums = [...Array(9)].map((_,i)=> a + i*d), tot = nums.reduce((x,y)=>x+y,0), S = tot/3;
    const xi = randInt(0,2), xj = randInt(0,2), byRow = Math.random()<0.5, x = M[xi][xj];
    const line = byRow ? [0,1,2].filter(j=>j!==xj).map(j=>[xi,j]) : [0,1,2].filter(i=>i!==xi).map(i=>[i,xj]);
    const show = new Set(line.map(([i,j])=>i*3+j));
    // mais uma casa à mostra, fora da linha da casa x (só para a figura não ficar vazia)
    const extra = shuffle([...Array(9)].map((_,k)=>k).filter(k=> k!==xi*3+xj && !show.has(k) && (byRow ? Math.floor(k/3)!==xi : k%3!==xj)))[0];
    show.add(extra);
    const [p, q] = line.map(([i,j])=>M[i][j]);
    const u = 56, x0 = 160 - 1.5*u, y0 = 8;
    let s = '';
    for(let i=0;i<3;i++) for(let j=0;j<3;j++){
      const k = i*3+j, cx = x0 + j*u + u/2, cy = y0 + i*u + u/2 + 7;
      s += `<rect x="${x0+j*u}" y="${y0+i*u}" width="${u}" height="${u}" class="geo-face ${k===xi*3+xj ? 'front' : 'side'}"/>`;
      if(k===xi*3+xj) s += iqT(cx, cy, 'x', 20, 'geo-lbl-h');
      else if(show.has(k)) s += iqT(cx, cy, M[i][j], 20);
    }
    const lista = d===1 ? `${nums[0]}, ${nums[1]}, ${nums[2]}, …, ${nums[8]}` : `${nums[0]}, ${nums[1]}, ${nums[2]}, …, ${nums[8]} (de ${d} em ${d})`;
    return {subj:'expressoes', topic:'Quadrado mágico', text:`<p>Os nove números ${lista} serão escritos no quadriculado, um em cada casa, de modo que as somas dos três números de cada linha, de cada coluna e de cada diagonal sejam todas iguais. Alguns números já foram colocados.</p>`,
      visual: cvSVG(320, 3*u + 16, s, 'Quadrado mágico'),
      ask:'Qual número deve ser escrito na casa marcada com x?',
      opts: iqMC(x, [[S,'Essa é a soma de cada linha (a soma mágica), não o número que falta.'],[S - p,`Faltou descontar o ${q}, que está na mesma ${byRow?'linha':'coluna'}.`],[S - q,`Faltou descontar o ${p}, que está na mesma ${byRow?'linha':'coluna'}.`],[tot - p - q,'Descontou da soma dos nove números; cada linha soma só um terço disso.'],[M[1][1],'Esse é o número do centro (a média dos nove números), que não é o da casa x.']], {fmt:v=>String(v)}),
      steps:[`Soma dos nove números: ${nums.join(' + ')} = ${tot}`, `As 3 linhas juntas usam todos os números e têm a mesma soma: cada uma soma ${tot} ÷ 3 = ${S}`, `Na ${byRow?'linha':'coluna'} da casa x já estão ${p} e ${q}: x = ${S} − ${p} − ${q} = ${x}`]};
  },
  // relógio: ângulo entre os ponteiros
  ()=>{
    let h, m, hh, mm, dif, ang;
    do{ h = randInt(1,11); m = pick([10,20,30,40,50]); hh = 30*h + m/2; mm = 6*m; dif = Math.abs(hh-mm); ang = dif>180 ? 360-dif : dif; } while(ang===0 || ang===180);
    const norm = v=>{ v = Math.abs(v) % 360; return v>180 ? 360-v : v; };
    const cx = 160, cy = 100, R = 82, P = (deg, L)=> [cx + L*Math.sin(deg*Math.PI/180), cy - L*Math.cos(deg*Math.PI/180)];
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="geo-face side"/>`;
    for(let k=1;k<=12;k++){ const [tx,ty] = P(30*k, R-15), [a1,b1] = P(30*k, R-4), [a2,b2] = P(30*k, R); s += cvL(a1,b1,a2,b2,'geo-face') + iqT(tx, ty+4.5, k, 12.5); }
    const [hx,hy] = P(hh, 46), [mx,my] = P(mm, 66);
    s += `<line x1="${cx}" y1="${cy}" x2="${_f(hx)}" y2="${_f(hy)}" stroke="#FF8A4C" stroke-width="5" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${_f(mx)}" y2="${_f(my)}" stroke="#6B8CFF" stroke-width="3" stroke-linecap="round"/>` + cvDot(cx, cy, 4);
    const hora = `${h}h${String(m).padStart(2,'0')}`;
    return {subj:'angulos', topic:'Ângulos no relógio', text:`<p>O relógio de ponteiros da sala de aula está marcando exatamente ${hora}, como na figura.</p>`,
      visual: cvSVG(320, 200, s, 'Relógio de ponteiros'),
      ask:'Qual é a medida do menor ângulo formado pelos dois ponteiros nesse instante?',
      opts: iqMC(ang, [[norm(30*h - mm),`Esqueceu que o ponteiro das horas também anda: em ${m} minutos ele avança ${m} × 0,5° = ${m/2}°.`],[360-ang,'Esse é o ângulo maior; a pergunta pede o menor.'],[norm(30*h - m/2 - mm),'O ponteiro das horas anda para a frente (no sentido horário), não para trás.'],[norm(30*h + m - mm),'O ponteiro das horas anda 0,5° por minuto (30° em 60 minutos), não 1°.']], {fmt:v=>v+'°'}),
      steps:[`Ponteiro dos minutos: anda 6° por minuto → ${m} × 6° = ${mm}° a partir do 12`, `Ponteiro das horas: 30° por hora mais 0,5° por minuto → ${h} × 30° + ${m} × 0,5° = ${hh}°`, `Diferença: |${hh}° − ${mm}°| = ${dif}°${dif>180 ? ` → o menor ângulo é 360° − ${dif}° = ${ang}°` : ''}`]};
  },
  // algarismo das unidades de uma potência
  ()=>{
    const b = pick([2,3,7,8,4,9,12,13,17,18]), n = randInt(41,2030), u = b%10;
    const cyc = []; let v = u; do{ cyc.push(v); v = v*u%10; } while(v!==cyc[0]);
    const L = cyc.length, r = n % L, qq = Math.floor(n/L), ans = cyc[(n-1)%L];
    const wr = [[cyc[n%L],`Errou a posição no ciclo por uma casa: com resto ${r}, vale a ${r===0?'última':r+'ª'} potência do ciclo.`],
      [cyc[(n-2+L)%L],`Errou a posição no ciclo por uma casa: com resto ${r}, vale a ${r===0?'última':r+'ª'} potência do ciclo.`],
      [(u*n)%10,'Multiplicou a base pelo expoente; a potência multiplica a base por ela mesma várias vezes.'],
      [r===0 ? 1 : null,'Resto 0 não quer dizer expoente 0: ele corresponde à última potência do ciclo.'],
      [u,'Esse é o algarismo das unidades da própria base (expoente 1).']];
    shuffle([1,2,3,4,5,6,7,8,9]).forEach(dg=> wr.push([dg, cyc.includes(dg) ? `As unidades das potências de ${b} repetem ${cyc.join(', ')}; pelo resto de ${n} por ${L}, cai no ${ans}, não no ${dg}.` : `Nenhuma potência de ${b} termina em ${dg}: as unidades só podem ser ${cyc.join(', ')}.`]));
    return {subj:'potenciacao', topic:'Potências e ciclos', text:`<p>${iqName()} quer descobrir em que algarismo termina o número ${b}<sup>${n}</sup>, sem fazer a conta inteira (o número tem centenas de algarismos!).</p>`, visual:'',
      ask:`Qual é o algarismo das unidades de ${b}<sup>${n}</sup>?`,
      opts: iqMC(ans, wr, {fmt:v=>String(v)}),
      steps:[`Só o algarismo das unidades importa: ${[...Array(L+1)].map((_,k)=>`${b}<sup>${k+1}</sup> termina em ${cyc[k%L]}`).join(' · ')}`, `As unidades repetem um ciclo de ${L}: ${cyc.join(', ')}, ${cyc.join(', ')}, …`, `${n} = ${L} × ${qq} + ${r} → ${r===0 ? 'resto 0: última posição do ciclo' : `resto ${r}: ${r}ª posição do ciclo`} → termina em ${ans}`]};
  },
  // quantos números de 3 algarismos com soma dos algarismos fixa
  ()=>{
    const s = randInt(5,9);
    let ans = 0, zeroLead = 0, noZero = 0; const groups = new Set(), ex = [];
    for(let n=0;n<1000;n++){ const a = Math.floor(n/100), b = Math.floor(n/10)%10, c = n%10; if(a+b+c!==s) continue;
      zeroLead++; if(a===0) continue; ans++; if(b && c) noZero++; groups.add([a,b,c].sort().join('')); ex.push(n); }
    const e = shuffle(ex.filter(n=>n!==s*100)).slice(0,2);
    return {subj:'combinatoria', topic:'Contagem', text:`<p>Para ${iqName()}, um número de três algarismos é "da sorte" quando a soma dos seus algarismos é ${s}. Por exemplo, ${s*100}, ${e[0]} e ${e[1]} são números da sorte.</p>`, visual:'',
      ask:`Quantos números de três algarismos são da sorte?`,
      opts: iqMC(ans, [[zeroLead,`Contou também "números" que começam com 0, como 0${s-1}1; eles não têm três algarismos.`],[groups.size,'Contou só os grupos de algarismos; trocar a ordem dá números diferentes (como 123 e 321).'],[noZero,`Esqueceu os números que têm o algarismo 0, como ${s*100}.`],[s*s,'As casas não têm escolhas independentes: a centena escolhida limita a dezena e a unidade.']], {fmt:v=>String(v)}),
      steps:[`Fixe a centena c (de 1 a ${s}); a dezena e a unidade somam ${s} − c, e há (${s} − c) + 1 jeitos de escolhê-las.`, `${[...Array(s)].map((_,i)=>`centena ${i+1}: ${s-i}`).join(' · ')}`, `Total: ${[...Array(s)].map((_,i)=>s-i).join(' + ')} = ${ans}`]};
  },
  // idades de pai e filho
  ()=>{
    let f, k, n, mlt, P;
    for(let t=0; t<2000; t++){ f = randInt(4,14); k = randInt(3,8); n = randInt(2,20); P = k*f;
      if(P - f < 20 || P > 60) continue; mlt = (P+n)/(f+n); if(mlt===Math.round(mlt) && mlt>=2 && mlt<k) break; mlt = 0; }
    if(!mlt){ f = 5; k = 7; n = 5; P = 35; mlt = 4; }
    const pai = pick(['Seu Antônio','Seu Jorge','Seu Carlos','Seu Raimundo']), filho = pick(['Caio','Davi','Enzo','Luan','Pedro']);
    return {subj:'eq1', topic:'Equação do 1º grau', text:`<p>Hoje, a idade de ${pai} é ${k} vezes a idade do seu filho ${filho}. Daqui a ${n} anos, a idade de ${pai} será apenas ${mlt} vezes a idade de ${filho}.</p>`, visual:'',
      ask:`Quantos anos ${pai} tem hoje?`,
      opts: iqMC(P, [[f,`Essa é a idade de ${filho} hoje.`],[P+n,`Essa é a idade de ${pai} daqui a ${n} anos.`],[f+n,`Essa é a idade de ${filho} daqui a ${n} anos.`],[P-n,`Essa seria a idade de ${pai} há ${n} anos.`],[mlt*f,`Usou a razão ${mlt} para as idades de hoje; hoje a razão é ${k}.`]], {fmt:v=>v+' anos'}),
      steps:[`Seja x a idade de ${filho} hoje; ${pai} tem ${k}x.`, `Daqui a ${n} anos os dois ficam ${n} anos mais velhos: ${k}x + ${n} = ${mlt}(x + ${n})`, `${k}x + ${n} = ${mlt}x + ${mlt*n} → ${k-mlt}x = ${(mlt-1)*n} → x = ${f}`, `${pai}: ${k} × ${f} = ${P} anos (confira: ${P+n} = ${mlt} × ${f+n})`]};
  },
  // quem está mentindo: descobrir o culpado
  ()=>{
    const kids = shuffle(IQ_NAMES.slice()).slice(0,5), T = pick([1,4]);
    let st, culprit;
    while(culprit===undefined){
      st = kids.map((_,i)=>{ const ty = randInt(0,3), o = pick([0,1,2,3,4].filter(j=>j!==i)); return ty<2 ? {ty, who:i} : {ty, who:o}; });
      const ok = [0,1,2,3,4].filter(c=> st.filter(x=> (x.ty===0||x.ty===2) ? c===x.who : c!==x.who).length===T);
      if(ok.length===1) culprit = ok[0];
    }
    const say = (x)=> x.ty===0 ? 'Fui eu.' : x.ty===1 ? 'Não fui eu.' : x.ty===2 ? `Foi ${kids[x.who]}.` : `Não foi ${kids[x.who]}.`;
    const count = c=> st.filter(x=> (x.ty===0||x.ty===2) ? c===x.who : c!==x.who).length;
    const obj = pick(['o vaso de planta','a janela da cozinha','o porta-retratos','o pote de biscoitos']);
    const regra = T===1 ? 'exatamente uma delas disse a verdade' : 'exatamente uma delas mentiu';
    const opts = shuffle(kids.map((k,c)=>({label:k, ok:c===culprit, why: c===culprit ? undefined : `Se ${k} fosse o culpado, ${count(c)} das cinco frases seriam verdadeiras, e não ${T}.`})));
    return {subj:'logica', topic:'Lógica: verdades e mentiras', text:`<p>Alguém quebrou ${obj}, e só uma das cinco crianças da casa foi a culpada. Cada uma disse uma frase:</p>`,
      visual: iqCards(kids.map((k,i)=>({t:k, lines:[`"${say(st[i])}"`]}))),
      ask:`Sabendo que ${regra}, quem quebrou ${obj}?`, opts,
      steps:['Teste cada criança como culpada e conte quantas frases ficariam verdadeiras:', kids.map((k,c)=>`${k}: ${count(c)} verdadeira${count(c)===1?'':'s'}`).join(' · '), `Só com ${kids[culprit]} como culpado há ${T===1?'exatamente 1 frase verdadeira':'exatamente 4 frases verdadeiras (1 mentira)'}.`]};
  },
  // contagem de quadrados num tabuleiro
  ()=>{
    const n = randInt(3,5), m = randInt(n,7), mn = Math.min(n,m);
    const per = [...Array(mn)].map((_,i)=> (n-i)*(m-i)), ans = per.reduce((a,b)=>a+b,0);
    const rect = n*(n+1)/2 * m*(m+1)/2, off = [...Array(mn)].map((_,i)=> (n-i-1)*(m-i-1)).reduce((a,b)=>a+b,0);
    const c = Math.min(30, Math.floor(260/m)), W = 320, x0 = (W - m*c)/2, y0 = 8;
    let s = `<rect x="${_f(x0)}" y="${y0}" width="${m*c}" height="${n*c}" class="geo-face front"/>`;
    for(let j=1;j<m;j++) s += cvL(x0+j*c, y0, x0+j*c, y0+n*c, 'geo-face');
    for(let i=1;i<n;i++) s += cvL(x0, y0+i*c, x0+m*c, y0+i*c, 'geo-face');
    s += `<rect x="${_f(x0+c)}" y="${y0+c}" width="${2*c}" height="${2*c}" fill="none" stroke="#FF8A4C" stroke-width="3"/>`;
    return {subj:'padroes', topic:'Contagem de figuras', text:`<p>${iqName()} desenhou um tabuleiro com ${n} linhas e ${m} colunas de quadradinhos iguais. Ela quer contar todos os quadrados formados pelas linhas do desenho, de qualquer tamanho. Um deles, de tamanho 2 × 2, está destacado.</p>`,
      visual: cvSVG(W, n*c + 16, s, 'Tabuleiro quadriculado'),
      ask:'Quantos quadrados, de todos os tamanhos, há no tabuleiro?',
      opts: iqMC(ans, [[n*m,'Contou só os quadradinhos 1 × 1.'],[n*m + (n-1)*(m-1),'Contou só os quadrados 1 × 1 e 2 × 2; há maiores também.'],[rect,'Contou todos os retângulos, não só os quadrados.'],[off,'Errou as posições: um quadrado k × k cabe em (linhas − k + 1) × (colunas − k + 1) lugares.']], {fmt:v=>String(v)}),
      steps:[...per.map((v,i)=>`Quadrados ${i+1} × ${i+1}: ${n-i} × ${m-i} = ${v}`), `Total: ${per.join(' + ')} = ${ans}`]};
  },
  // caminhos mais curtos numa malha
  ()=>{
    const C = (a,b)=>{ let r = 1; for(let i=1;i<=b;i++) r = r*(a-b+i)/i; return Math.round(r); };
    const a = randInt(2,4), b = randInt(2,4), viaP = Math.random()<0.5;
    const px = viaP ? randInt(1,a-1) : 0, py = viaP ? randInt(1,b-1) : 0;
    const tot = C(a+b,a), c1 = C(px+py,px), c2 = C(a-px+b-py, a-px), ans = viaP ? c1*c2 : tot;
    const u = Math.min(52, Math.floor(220/a)), X = i=> 160 - a*u/2 + i*u, Y = j=> 18 + b*u - j*u;
    let s = '';
    for(let i=0;i<=a;i++) s += cvL(X(i), Y(0), X(i), Y(b), 'geo-face');
    for(let j=0;j<=b;j++) s += cvL(X(0), Y(j), X(a), Y(j), 'geo-face');
    s += cvDot(X(0), Y(0), 5) + iqT(X(0)-10, Y(0)+16, 'A', 14, 'geo-lbl-h') + cvDot(X(a), Y(b), 5) + iqT(X(a)+12, Y(b)-6, 'B', 14, 'geo-lbl-h');
    if(viaP) s += `<circle cx="${_f(X(px))}" cy="${_f(Y(py))}" r="6" fill="#FF8A4C"/>` + iqT(X(px)+12, Y(py)-8, 'P', 14, 'geo-lbl-h');
    const wr = viaP ? [[tot,'Esse é o total de caminhos de A até B, sem a obrigação de passar por P.'],[c1+c2,'Cada caminho de A até P pode continuar por qualquer caminho de P até B: multiplique, não some.'],[c1,'Contou só os caminhos de A até P.'],[c2,'Contou só os caminhos de P até B.'],[(px+py)*(a-px+b-py),'Multiplicou os números de passos de cada trecho, não os números de caminhos.']]
      : [[a*b,'Esse é o número de quadradinhos da malha, não de caminhos.'],[a+b,'Esse é o número de passos de cada caminho, não o número de caminhos.'],[Math.pow(2,a+b),`Nem toda sequência de passos serve: são exatamente ${a} para a direita e ${b} para cima.`],[(a+1)*(b+1),'Esse é o número de pontos da malha.']];
    return {subj:'combinatoria', topic:'Caminhos na malha', text:`<p>Uma formiga anda pelas linhas da malha, de A até B, dando sempre passos de um lado de quadradinho para a direita (→) ou para cima (↑).${viaP ? ' No caminho, ela quer passar obrigatoriamente pelo ponto P, onde há um grão de açúcar.' : ''}</p>`,
      visual: cvSVG(320, b*u + 40, s, 'Malha quadriculada'),
      ask: viaP ? 'Quantos caminhos diferentes a formiga pode fazer de A até B passando por P?' : 'Quantos caminhos diferentes a formiga pode fazer de A até B?',
      opts: iqMC(ans, wr, {fmt:v=>String(v)}),
      steps: viaP ? [`De A até P: ${px} passo${px>1?'s':''} → e ${py} ↑; escolhendo a posição dos passos →: ${c1} caminhos`, `De P até B: ${a-px} → e ${b-py} ↑: ${c2} caminhos`, `Cada caminho do 1º trecho combina com cada um do 2º: ${c1} × ${c2} = ${ans}`]
        : [`Todo caminho tem ${a} passos → e ${b} passos ↑, ou seja, ${a+b} passos.`, `Basta escolher quais dos ${a+b} passos são →: (${a+b}!) ÷ (${a}! × ${b}!) = ${ans}`, 'Outra forma: escreva em cada ponto a soma dos números do ponto de baixo e do ponto à esquerda (começando com 1 em A).']};
  },
  // calendário: dia da semana
  ()=>{
    const W = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
    const MES = [['janeiro',31],['fevereiro',28],['março',31],['abril',30],['maio',31],['junho',30],['julho',31],['agosto',31],['setembro',30],['outubro',31],['novembro',30],['dezembro',31]];
    const nome = iqName(), w0 = randInt(0,6), mi = randInt(2,11), d = randInt(1, MES[mi][1]);
    const antes = MES.slice(0,mi).reduce((x,y)=>x+y[1],0), dif = antes + d - 1, r = dif % 7, ans = W[(w0 + r) % 7];
    const D = k=> W[((w0 + k) % 7 + 7) % 7];
    const wr = [[D(dif+1),`Contou o próprio dia 1º de janeiro: do dia 1º até o dia ${d} de ${MES[mi][0]} passam ${dif} dias, não ${dif+1}.`],[D(30*mi + d - 1),'Nem todo mês tem 30 dias: some os dias de cada mês do calendário.'],[D(-dif),'Contou os dias para trás; o dia pedido vem depois de 1º de janeiro.'],[D(dif-1),'Errou a contagem por um dia: confira a soma dos dias de cada mês.']];
    W.forEach(x=> wr.push([x, `Do dia 1º de janeiro passam ${dif} dias = ${Math.floor(dif/7)} semanas e ${r} dia${r===1?'':'s'}; isso leva a ${ans}, não a ${x}.`]));
    return {subj:'divisao', topic:'Calendário e restos', text:`<p>Num certo ano, que não é bissexto, o dia 1º de janeiro caiu num${W[w0]==='sábado'||W[w0]==='domingo'?'':'a'} ${W[w0]}. ${nome} faz aniversário no dia ${d} de ${MES[mi][0]}.</p>`, visual:'',
      ask:`Em que dia da semana caiu o aniversário de ${nome} nesse ano?`,
      opts: iqMC(ans, wr, {sort:false}),
      steps:[`Dias de ${MES.slice(0,mi).map(x=>x[0]).join(', ')}: ${MES.slice(0,mi).map(x=>x[1]).join(' + ')} = ${antes}`, `Do dia 1º de janeiro até ${d} de ${MES[mi][0]} passam ${antes} + ${d} − 1 = ${dif} dias`, `${dif} = 7 × ${Math.floor(dif/7)} + ${r}: semanas inteiras não mudam o dia; andar ${r} dia${r===1?'':'s'} a partir de ${W[w0]} dá ${ans}`]};
  },
  // resto de uma divisão (figurinhas em pacotes)
  ()=>{
    let dv, r, k, c;
    do{ dv = pick([7,8,9,11,13]); r = randInt(2,dv-1); k = randInt(2,5); c = randInt(1,9); } while(k*r + c < dv);
    const ans = (k*r + c) % dv;
    const wr = [[k*r + c,`${k*r+c} não pode ser resto: o resto tem que ser menor que ${dv}. Ainda dá para formar pacotes com essas figurinhas.`],[(k*r)%dv,`Esqueceu de somar as ${c} figurinhas extras.`],[(r+c)%dv,`Esqueceu de multiplicar o resto por ${k}: cada coleção de Cléo deixa ${r} sobrando.`],[r,'Esse é o resto das figurinhas de Cléo, não o da prima.'],[(k*(r+c))%dv,`Somou ${c} antes de multiplicar; as ${c} figurinhas são somadas uma vez só.`]];
    shuffle([...Array(dv)].map((_,i)=>i)).forEach(v=> wr.push([v, `Escreva a quantidade de Cléo como ${dv}q + ${r}: a prima tem ${k}·(${dv}q + ${r}) + ${c}, e o que sobra vem de ${k*r} + ${c} = ${k*r+c}, que deixa resto ${ans}.`]));
    return {subj:'divisao', topic:'Divisão com resto', text:`<p>Quando Cléo arruma todas as suas figurinhas em pacotes de ${dv}, sempre sobram ${r}. A prima dela tem ${c} figurinha${c>1?'s':''} a mais que o ${['','','dobro','triplo','quádruplo','quíntuplo'][k]} das figurinhas de Cléo.</p>`, visual:'',
      ask:`Se a prima arrumar todas as figurinhas dela em pacotes de ${dv}, quantas sobrarão?`,
      opts: iqMC(ans, wr, {fmt:v=>String(v), positive:false}),
      steps:[`Cléo tem ${dv}q + ${r} figurinhas (q pacotes completos e ${r} sobrando).`, `A prima tem ${k}·(${dv}q + ${r}) + ${c} = ${dv}·(${k}q) + ${k*r+c}`, `Os ${dv}·(${k}q) formam pacotes completos; sobra o resto de ${k*r+c} por ${dv}: ${k*r+c} = ${dv} × ${Math.floor((k*r+c)/dv)} + ${ans} → sobram ${ans}`]};
  },
  // sequência "soma dos dois anteriores": voltar até o 1º termo
  ()=>{
    let t; do{ t = [randInt(1,9), randInt(1,9)]; while(t.length<8) t.push(t[t.length-1] + t[t.length-2]); } while(t[0]===t[1]);
    const box = 36, gap = 3, x0 = (320 - 8*box - 7*gap)/2;
    let s = '';
    t.forEach((v,i)=>{ const x = x0 + i*(box+gap), show = i===5 || i===7, q = i===0;
      s += `<rect x="${_f(x)}" y="10" width="${box}" height="${box}" rx="5" class="geo-face ${q?'front':'side'}"/>` + (show ? iqT(x+box/2, 34, v, 15) : q ? iqT(x+box/2, 34, '?', 17, 'geo-lbl-h') : '') + iqT(x+box/2, 62, `${i+1}º`, 10.5, 'iq-tick'); });
    return {subj:'padroes', topic:'Sequências e padrões', text:`<p>${iqName()} escreveu uma sequência de oito números inteiros positivos. A partir do terceiro, cada número é a soma dos dois anteriores. Depois, apagou quase todos: sobraram só o 6º número, ${t[5]}, e o 8º, ${t[7]}.</p>`,
      visual: cvSVG(320, 70, s, 'Sequência com números apagados'),
      ask:'Qual era o primeiro número da sequência?',
      opts: iqMC(t[0], [[t[1],'Esse é o 2º número; falta voltar mais um passo.'],[t[2],'Esse é o 3º número; continue voltando até o 1º.'],[t[3],'Esse é o 4º número; continue voltando até o 1º.'],[t[6],`Esse é o 7º número (${t[7]} − ${t[5]}); continue voltando até o 1º.`],[t[4],'Esse é o 5º número; continue voltando até o 1º.']], {fmt:v=>String(v)}),
      steps:[`Como 8º = 6º + 7º: 7º = ${t[7]} − ${t[5]} = ${t[6]}`, `Cada número é o seguinte menos o anterior a ele: 5º = ${t[6]} − ${t[5]} = ${t[4]}; 4º = ${t[5]} − ${t[4]} = ${t[3]}; 3º = ${t[4]} − ${t[3]} = ${t[2]}`, `2º = ${t[3]} − ${t[2]} = ${t[1]}; 1º = ${t[2]} − ${t[1]} = ${t[0]}`, `Confira: ${t.join(', ')}`]};
  },
  // balanças em equilíbrio
  ()=>{
    let a, b, c, d, n, sq, ans;
    for(let t=0; t<500; t++){ a = randInt(2,4); b = randInt(a+1,6); c = randInt(2,4); d = randInt(c+1,6); n = randInt(2,6);
      sq = n*b/a; ans = sq*d/c; if(n!==a && sq===Math.round(sq) && ans===Math.round(ans) && ans<=30 && sq<=12) break; ans = 0; }
    if(!ans){ a = 2; b = 3; c = 3; d = 4; n = 4; sq = 6; ans = 8; }
    const sh = (kind, x, y)=> kind==='c' ? `<circle cx="${_f(x)}" cy="${_f(y-6)}" r="6" fill="#FF8A4C" stroke="#E06A2C" stroke-width="1.2"/>`
      : kind==='q' ? `<rect x="${_f(x-6)}" y="${_f(y-12)}" width="12" height="12" class="geo-face top" style="stroke-width:1.2"/>`
      : `<polygon points="${_f(x-6.5)},${_f(y)} ${_f(x+6.5)},${_f(y)} ${_f(x)},${_f(y-12)}" fill="#12B886" stroke="#0E9970" stroke-width="1.2"/>`;
    const pile = (kind, cnt, cx, yb)=>{ let g = ''; for(let i=0;i<cnt;i++){ const row = Math.floor(i/3), inRow = Math.min(3, cnt - row*3), col = i%3; g += sh(kind, cx + (col - (inRow-1)/2)*14, yb - row*13); } return g; };
    const bal = (cx, k1, n1, k2, n2)=> cvL(cx, 128, cx, 66, 'geo-face') + `<polygon points="${cx-14},136 ${cx+14},136 ${cx},124" class="geo-face side"/>` + cvL(cx-56, 66, cx+56, 66, 'geo-face')
      + cvL(cx-56, 66, cx-56, 100, 'iq-grid') + cvL(cx+56, 66, cx+56, 100, 'iq-grid') + cvL(cx-78, 100, cx-34, 100, 'geo-face') + cvL(cx+34, 100, cx+78, 100, 'geo-face')
      + pile(k1, n1, cx-56, 98) + pile(k2, n2, cx+56, 98);
    const s = bal(80, 'c', a, 'q', b) + bal(240, 'q', c, 't', d) + iqT(80, 154, 'Balança 1', 11, 'iq-tick') + iqT(240, 154, 'Balança 2', 11, 'iq-tick');
    return {subj:'regra3', topic:'Balanças e proporção', text:`<p>As duas balanças da figura estão em equilíbrio. Na primeira, ${a} bolas equilibram ${b} cubos; na segunda, ${c} cubos equilibram ${d} pirâmides. Objetos de mesma forma têm o mesmo peso.</p>`,
      visual: cvSVG(320, 160, s, 'Duas balanças em equilíbrio'),
      ask:`Quantas pirâmides equilibram ${n} bolas?`,
      opts: iqMC(ans, [[sq,`Esse é o número de cubos que equilibram ${n} bolas; falta trocar os cubos por pirâmides.`],[n*d/c===Math.round(n*d/c) ? n*d/c : null,'Pulou a primeira balança: uma bola não pesa o mesmo que um cubo.'],[n + (b-a) + (d-c),'A troca é proporcional; não basta somar as diferenças entre os pratos.'],[b*d,`Essa é a quantidade de pirâmides para ${a*c} bolas, não para ${n}.`],[n*b*d/c===Math.round(n*b*d/c) ? n*b*d/c : null,`Esqueceu de dividir por ${a}: são ${a} bolas que equilibram ${b} cubos.`]], {fmt:v=>String(v)}),
      steps:[`Balança 1: ${a} bolas = ${b} cubos → ${n} bolas = ${n} × ${b} ÷ ${a} = ${sq} cubos`, `Balança 2: ${c} cubos = ${d} pirâmides → ${sq} cubos = ${sq} × ${d} ÷ ${c} = ${ans} pirâmides`]};
  },
  // apertos de mão
  ()=>{
    if(Math.random()<0.5){
      const n = randInt(8,25), H = n*(n-1)/2, sq = Math.round(Math.sqrt(H));
      return {subj:'combinatoria', topic:'Contagem', text:`<p>No fim de um torneio, cada participante apertou a mão de cada um dos outros participantes exatamente uma vez. Ao todo, aconteceram ${H} apertos de mão.</p>`, visual:'',
        ask:'Quantos participantes havia no torneio?',
        opts: iqMC(n, [[n+1,`Com ${n+1} participantes seriam ${(n+1)*n/2} apertos.`],[n-1,`Com ${n-1} participantes seriam ${(n-1)*(n-2)/2} apertos.`],[sq===n ? null : sq,'Tirar a raiz quadrada dos apertos não dá o número de pessoas: são n(n − 1) ÷ 2 apertos.'],[n+2,`Com ${n+2} participantes seriam ${(n+2)*(n+1)/2} apertos.`],[2*H % n === 0 && 2*H/n !== n-1 ? 2*H/n : null,'Confira a fórmula: n(n − 1) ÷ 2.']], {fmt:v=>String(v)}),
        steps:['Cada uma das n pessoas aperta a mão das outras n − 1; assim cada aperto é contado duas vezes (uma para cada mão).', `Apertos = n(n − 1) ÷ 2 = ${H} → n(n − 1) = ${2*H}`, `Dois números seguidos com produto ${2*H}: ${n} × ${n-1} → n = ${n}`]};
    }
    const n = randInt(3,8), ans = 2*n*(n-1);
    return {subj:'combinatoria', topic:'Contagem', text:`<p>${n} casais foram a uma festa. Ao chegar, cada pessoa cumprimentou com um aperto de mão todas as outras, menos o seu próprio par (com quem já tinha chegado).</p>`, visual:'',
      ask:'Quantos apertos de mão aconteceram ao todo?',
      opts: iqMC(ans, [[n*(2*n-1),'Incluiu o aperto de cada pessoa com o próprio par.'],[2*n*(2*n-2),'Contou cada aperto duas vezes: o de Ana com Bruno é o mesmo de Bruno com Ana.'],[n*(n-1)/2,'Contou como se cada casal cumprimentasse cada outro casal com um aperto só; são duas pessoas de cada lado.'],[2*n*(2*n-1),'Contou cada aperto duas vezes e ainda incluiu o próprio par.']], {fmt:v=>String(v)}),
      steps:[`São ${2*n} pessoas; cada uma aperta a mão de ${2*n} − 2 = ${2*n-2} pessoas (não conta ela mesma nem o par).`, `${2*n} × ${2*n-2} = ${2*n*(2*n-2)} conta cada aperto duas vezes.`, `Apertos: ${2*n*(2*n-2)} ÷ 2 = ${ans}`]};
  },
  // área sombreada: quadrados encaixados pelos pontos médios
  ()=>{
    let L, k; do{ L = pick([6,8,10,12,16,20,24]); k = pick([1,2,3]); } while((L*L) % Math.pow(2,k) !== 0);
    const A = L*L, ans = A/Math.pow(2,k);
    let P = [[60,10],[260,10],[260,210],[60,210]], s = '';
    s += `<polygon points="${P.map(p=>p.map(_f).join(',')).join(' ')}" class="geo-face side"/>`;
    for(let i=1;i<=k;i++){ P = P.map((p,j)=>{ const q = P[(j+1)%4]; return [(p[0]+q[0])/2, (p[1]+q[1])/2]; });
      s += `<polygon points="${P.map(p=>p.map(_f).join(',')).join(' ')}" ${i===k ? 'fill="#FF8A4C" fill-opacity=".55" stroke="#E06A2C" stroke-width="2"' : 'class="geo-face side"'}/>`; }
    s += iqT(160, 232, `${L} cm`, 12);
    const wr = [[A/Math.pow(4,k),'Ligar os pontos médios não divide o lado ao meio: o quadrado novo tem metade da área, não um quarto.'],[k>1 ? A/Math.pow(2,k-1) : A,k>1 ? 'Fez uma etapa a menos: conte quantas vezes o processo foi feito.' : 'Essa é a área do quadrado maior.'],[A/Math.pow(2,k+1),'Fez uma etapa a mais: conte quantas vezes o processo foi feito.'],[A - ans,'Essa é a área da parte não pintada.'],[A/(2*k),'A área não diminui somando metades: ela cai pela metade a cada etapa.']];
    const vezes = ['','uma vez','duas vezes','três vezes'][k];
    return {subj:'geometria', topic:'Área de figuras', text:`<p>Num quadrado de lado ${L} cm, ligamos os pontos médios dos lados vizinhos e obtemos um quadrado menor dentro dele.${k>1 ? ' Depois, repetimos a mesma coisa no quadrado menor, sempre com o último quadrado desenhado.' : ''} O processo foi feito ${vezes} e o último quadrado foi pintado.</p>`,
      visual: cvSVG(320, 240, s, 'Quadrados encaixados'),
      ask:'Qual é a área da região pintada?',
      opts: iqMC(ans, wr, {fmt:v=>iqNum(v)+' cm²'}),
      steps:['Os quatro triângulos dos cantos, dobrados para dentro, cobrem exatamente o quadrado novo: ele tem metade da área do anterior.', `Área inicial: ${L} × ${L} = ${A} cm²`, `${[...Array(k)].map((_,i)=>iqNum(A/Math.pow(2,i+1))).join(' → ')} → área pintada: ${iqNum(ans)} cm²`]};
  }
);
