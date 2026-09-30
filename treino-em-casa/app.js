/* =========================================================
   Treino em Casa — dados dos treinos, telas e lógica
   Tudo fica salvo no próprio aparelho (localStorage).
   ========================================================= */

/* ---------------- ícones (SVG em linha) ---------------- */
const I = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></svg>',
  google:'<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 010-4.2V7.1H2.2a11 11 0 000 9.8l3.6-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 002.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>',
  apple:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>',
  fire:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5 5 5.6 5 11a5 5 0 01-10 0c0-2.2 1-3.8 2-5 .2 1.7 1 2.8 2 3.2C10.6 8 11.5 5 12 2z"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2" /></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M14 10l6-6M17 4h3v3"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
  dumbbell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7v10M3.5 9.5v5M18 7v10M20.5 9.5v5M6 12h12"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="15" width="3.2" height="6" rx="1"/><rect x="8.3" y="11" width="3.2" height="10" rx="1"/><rect x="13.6" y="7" width="3.2" height="14" rx="1"/><rect x="18.9" y="3" width="3.2" height="18" rx="1"/></svg>',
  chartLine:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V14M9 20V10M14 20v-4M19 20V6"/></svg>',
  person:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  personFill:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.5" r="4.5"/><path d="M3 21c1.2-5 4.8-8 9-8s7.8 3 9 8z"/></svg>',
  bars:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4.5" height="8" rx="1.2"/><rect x="9.75" y="8" width="4.5" height="13" rx="1.2"/><rect x="16.5" y="3" width="4.5" height="18" rx="1.2"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 7l5 4 5-7 5 7 5-4-2 11H4z"/><rect x="4" y="19" width="16" height="2.5" rx="1"/></svg>',
  mountain:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 42L20 12l8 14 4-6 12 22z"/><path d="M14 30l6-4 6 5"/><path d="M20 12V4l8 3-8 3"/></svg>',
  trophy:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6h20v12a10 10 0 01-20 0z"/><path d="M14 10H7a6 6 0 006 8M34 10h7a6 6 0 01-6 8"/><path d="M24 28v7M16 42h16M19 35h10v7H19z"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  skip:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l10-7zM17 5h2.5v14H17z"/></svg>',
  logo:'<svg viewBox="0 0 110 92" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 44L55 6l49 38"/><path d="M18 36v50h74V36"/><g fill="currentColor" stroke="none"><rect x="30" y="46" width="9" height="32" rx="3"/><rect x="41" y="52" width="7" height="20" rx="2.5"/><rect x="71" y="46" width="9" height="32" rx="3"/><rect x="62" y="52" width="7" height="20" rx="2.5"/><rect x="48" y="59" width="14" height="6" rx="2"/></g></svg>',
};

/* ---------------- figuras dos exercícios (bonequinhos) ----------------
   Cada pose é um SVG 48×48: cabeça + linhas do corpo. */
const POSES = {
  squat:   { head:[17,9],  lines:['M18 13 L22 25','M22 25 L32 26 L32 38','M19 16 L33 17'], floor:true },
  pushup:  { head:[39,23], lines:['M36 26 L9 33','M33 27 L33 38','M9 33 L7 38'], floor:true },
  lunge:   { head:[24,7],  lines:['M24 11 L24 24','M24 24 L33 29 L33 39','M24 24 L16 33 L11 39','M24 15 L18 21','M24 15 L30 20'], floor:true },
  plank:   { head:[39,26], lines:['M36 29 L9 35','M33 30 L32 38 L39 38','M9 35 L7 38'], floor:true },
  bridge:  { head:[7,36],  lines:['M11 37 L26 28','M26 28 L34 30 L35 39','M13 37 L20 39'], floor:true },
  jack:    { head:[24,7],  lines:['M24 11 L24 26','M24 15 L14 5','M24 15 L34 5','M24 26 L16 40','M24 26 L32 40'], floor:true },
  crunch:  { head:[13,26], lines:['M15 29 L25 38','M25 38 L33 28 L40 38','M16 30 L22 24'], floor:true },
  burpee:  { head:[24,6],  lines:['M24 10 L24 24','M24 14 L16 4','M24 14 L32 4','M24 24 L19 34','M24 24 L29 34'], floor:false },
  climber: { head:[39,20], lines:['M36 23 L12 32','M34 24 L34 38','M12 32 L7 38','M22 29 L28 33 L25 38'], floor:true },
  dip:     { head:[24,11], lines:['M24 15 L22 27','M22 27 L32 28 L34 39','M23 17 L14 24 L14 31','M9 31 L19 31'], floor:true },
  superman:{ head:[37,30], lines:['M34 32 L12 33','M35 31 L44 27','M12 33 L4 30'], floor:true },
  stretch: { head:[24,7],  lines:['M24 11 L24 26','M24 15 L24 2','M24 15 L31 21','M24 26 L19 40','M24 26 L29 40'], floor:true },
};
function figure(pose, color='#FFD60A'){
  const p = POSES[pose] || POSES.stretch;
  return `<svg viewBox="0 0 48 48" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    ${p.floor ? '<path d="M3 42h42" stroke="#3A3A42" stroke-width="2"/>' : ''}
    <circle cx="${p.head[0]}" cy="${p.head[1]}" r="3.6" fill="${color}" stroke="none"/>
    ${p.lines.map(d=>`<path d="${d}"/>`).join('')}
  </svg>`;
}
/* figura grande da tela inicial: pessoa fazendo flexão num tapete */
function heroFigure(){
  return `<svg viewBox="0 0 330 230" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="165" cy="206" rx="150" ry="16" fill="#1B1B20"/>
    <path d="M28 200h274" stroke="#FFD60A" stroke-width="4" opacity=".35"/>
    <g stroke="#FFD60A" stroke-width="14">
      <path d="M232 112 L70 176"/>
      <path d="M218 118 L222 196"/>
      <path d="M70 176 L56 198"/>
    </g>
    <circle cx="256" cy="98" r="19" fill="#FFD60A"/>
    <g stroke="#0B0B0D" stroke-width="3" opacity=".5"><path d="M160 136 L150 160"/></g>
    <g fill="#FFD60A" opacity=".18"><circle cx="286" cy="40" r="4"/><circle cx="40" cy="70" r="3"/><circle cx="302" cy="150" r="3"/></g>
  </svg>`;
}

/* ---------------- níveis ---------------- */
const LEVELS = {
  amador:{ name:'Amador', short:'Amador', icon:'personFill', pose:'squat',
    desc:'Exercícios simples para começar e criar o hábito.',
    more:'Para quem está começando ou voltando a treinar. Treinos de 15 a 25 minutos, com descansos maiores e movimentos básicos.' },
  intermediario:{ name:'Intermediário', short:'Intermediário', icon:'bars', pose:'pushup',
    desc:'Treinos mais intensos para evoluir o condicionamento.',
    more:'Para quem já treina há alguns meses. Mais séries, menos descanso e exercícios combinados.' },
  profissional:{ name:'Profissional / Avançado', short:'Profissional', icon:'crown', pose:'burpee',
    desc:'Treinos desafiadores para quem já possui experiência.',
    more:'Para quem já tem boa base. Alta intensidade, exercícios explosivos e pouco descanso entre as séries.' },
};

/* ---------------- exercícios ----------------
   reps: repetições por série | secs: tempo por série (exercício de tempo) */
const EX = {
  agachamento:{ name:'Agachamento livre', pose:'squat', tip:'Pés na largura dos ombros, desça como se fosse sentar numa cadeira, mantendo o peito aberto.' },
  flexao:{ name:'Flexão de braço', pose:'pushup', tip:'Mãos um pouco mais abertas que os ombros. Se precisar, apoie os joelhos no chão.' },
  afundo:{ name:'Afundo alternado', pose:'lunge', tip:'Dê um passo à frente e desça até os dois joelhos formarem 90°. Alterne as pernas.', each:true },
  prancha:{ name:'Prancha', pose:'plank', tip:'Apoie os antebraços, contraia o abdômen e mantenha o corpo reto da cabeça aos pés.' },
  quadril:{ name:'Elevação de quadril', pose:'bridge', tip:'Deitado, joelhos dobrados. Suba o quadril apertando os glúteos e desça devagar.' },
  polichinelo:{ name:'Polichinelo', pose:'jack', tip:'Abra pernas e braços ao mesmo tempo, num ritmo constante.' },
  abdominal:{ name:'Abdominal', pose:'crunch', tip:'Tire só os ombros do chão, sem puxar o pescoço. Solte o ar ao subir.' },
  burpee:{ name:'Burpee', pose:'burpee', tip:'Agache, jogue as pernas para trás, faça uma flexão, volte e salte.' },
  escalador:{ name:'Mountain climber', pose:'climber', tip:'Em posição de prancha alta, puxe os joelhos em direção ao peito alternadamente, rápido.' },
  triceps:{ name:'Tríceps no banco', pose:'dip', tip:'Use uma cadeira firme. Dobre os cotovelos para trás e suba empurrando com os braços.' },
  superman:{ name:'Superman', pose:'superman', tip:'Deitado de barriga para baixo, levante braços e pernas ao mesmo tempo e segure.' },
  agachSalto:{ name:'Agachamento com salto', pose:'squat', tip:'Agache e suba explodindo num salto. Aterrisse com os joelhos levemente dobrados.' },
  flexaoDiamante:{ name:'Flexão diamante', pose:'pushup', tip:'Mãos juntas formando um losango embaixo do peito. Cotovelos junto ao corpo.' },
  alongamento:{ name:'Alongamento geral', pose:'stretch', tip:'Estique braços para cima, depois alongue pernas e costas. Respire fundo.' },
};

/* ---------------- treinos por nível ---------------- */
const WORKOUTS = {
  amador:[
    { id:'am-full', name:'Full Body em Casa', min:25, kcal:220, rest:40,
      desc:'Treino completo para ativar o corpo, melhorar o condicionamento e criar o hábito.',
      ex:[ ['agachamento',3,{reps:12}], ['flexao',3,{reps:10}], ['afundo',3,{reps:12}], ['prancha',3,{secs:30}], ['quadril',3,{reps:15}] ] },
    { id:'am-cardio', name:'Cardio Leve', min:20, kcal:180, rest:40,
      desc:'Coração acelerado sem exagero: ótimo para começar o dia com energia.',
      ex:[ ['polichinelo',3,{secs:30}], ['agachamento',3,{reps:15}], ['abdominal',3,{reps:12}], ['prancha',2,{secs:20}], ['alongamento',1,{secs:60}] ] },
    { id:'am-core', name:'Core e Postura', min:18, kcal:140, rest:35,
      desc:'Fortalece abdômen, lombar e glúteos para uma postura melhor no dia a dia.',
      ex:[ ['prancha',3,{secs:25}], ['abdominal',3,{reps:15}], ['quadril',3,{reps:15}], ['superman',3,{secs:20}], ['alongamento',1,{secs:60}] ] },
  ],
  intermediario:[
    { id:'in-full', name:'Full Body Intenso', min:30, kcal:320, rest:30,
      desc:'Mais séries e menos descanso para evoluir força e resistência.',
      ex:[ ['agachamento',4,{reps:15}], ['flexao',4,{reps:12}], ['afundo',4,{reps:14}], ['triceps',3,{reps:12}], ['prancha',3,{secs:45}], ['quadril',3,{reps:20}] ] },
    { id:'in-hiit', name:'HIIT 20', min:20, kcal:280, rest:20,
      desc:'Tiros curtos e intensos para queimar calorias e ganhar fôlego.',
      ex:[ ['polichinelo',4,{secs:40}], ['escalador',4,{secs:30}], ['agachSalto',4,{reps:12}], ['burpee',3,{reps:8}], ['prancha',3,{secs:40}] ] },
    { id:'in-legs', name:'Pernas e Glúteos', min:25, kcal:260, rest:30,
      desc:'Foco total na parte inferior do corpo, com volume maior.',
      ex:[ ['agachamento',4,{reps:20}], ['afundo',4,{reps:16}], ['quadril',4,{reps:20}], ['agachSalto',3,{reps:10}], ['alongamento',1,{secs:60}] ] },
  ],
  profissional:[
    { id:'pr-total', name:'Desafio Total', min:40, kcal:450, rest:20,
      desc:'Treino completo e pesado para quem já tem base e quer se desafiar.',
      ex:[ ['burpee',5,{reps:12}], ['flexaoDiamante',4,{reps:15}], ['agachSalto',5,{reps:15}], ['afundo',4,{reps:20}], ['escalador',4,{secs:45}], ['prancha',3,{secs:60}] ] },
    { id:'pr-hiit', name:'HIIT Avançado', min:30, kcal:400, rest:15,
      desc:'Intervalos de alta intensidade com pouquíssimo descanso.',
      ex:[ ['burpee',5,{reps:15}], ['escalador',5,{secs:45}], ['agachSalto',5,{reps:18}], ['polichinelo',4,{secs:60}], ['abdominal',4,{reps:25}] ] },
    { id:'pr-forca', name:'Força com Peso Corporal', min:35, kcal:380, rest:25,
      desc:'Movimentos lentos e controlados para ganhar força de verdade.',
      ex:[ ['flexaoDiamante',5,{reps:15}], ['triceps',4,{reps:20}], ['agachamento',5,{reps:25}], ['superman',4,{secs:40}], ['prancha',4,{secs:75}] ] },
  ],
};
function allWorkouts(){ return Object.values(WORKOUTS).flat(); }
function findWorkout(id){ return allWorkouts().find(w=>w.id===id); }
/* o treino do dia gira entre os treinos do nível conforme o dia do ano */
function todayWorkout(level){
  const list = WORKOUTS[level] || WORKOUTS.amador;
  const start = new Date(new Date().getFullYear(),0,0);
  const day = Math.floor((Date.now()-start)/864e5);
  return list[day % list.length];
}
function exLabel(e){
  const [key, sets, cfg] = e; const ex = EX[key];
  const amount = cfg.reps ? `${cfg.reps} repetições` : `${cfg.secs} segundos`;
  return `${sets} ${sets>1?'séries':'série'} • ${amount}${ex.each ? ' (cada perna)' : ''}`;
}

/* ---------------- armazenamento ---------------- */
const STORE_KEY = 'treino-em-casa-v1';
function loadDB(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }catch(e){ return {}; }
}
let db = Object.assign({ accounts:{}, session:null }, loadDB());
function saveDB(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(db)); }catch(e){} }
function me(){ return db.session ? db.accounts[db.session] : null; }

async function hashPass(p){
  if(window.crypto && crypto.subtle){
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tec:'+p));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  let h = 0; for(const c of 'tec:'+p){ h = (h*31 + c.charCodeAt(0))|0; } return 'x'+h;
}

/* ---------------- datas / estatísticas ---------------- */
const DOW = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function dayKey(d){ const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; }
function startOfWeek(d){ const x = new Date(d); x.setHours(0,0,0,0); const dow = (x.getDay()+6)%7; x.setDate(x.getDate()-dow); return x; }
function fmtNum(n){ return Math.round(n).toLocaleString('pt-BR'); }
function fmtHours(min){ if(min < 60) return `${Math.round(min)}min`; const h = Math.floor(min/60), m = Math.round(min%60); return m ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`; }
function weeksSince(ts){ const w = Math.max(1, Math.ceil((Date.now()-ts)/(7*864e5))); return `${w} ${w>1?'semanas':'semana'}`; }

function stats(u){
  const h = u.history || [];
  const totalMin = h.reduce((s,x)=>s+x.min,0);
  const totalKcal = h.reduce((s,x)=>s+x.kcal,0);
  /* minutos por dia nos últimos 7 dias */
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const k = dayKey(d);
    days.push({ label:DOW[d.getDay()], min:h.filter(x=>dayKey(x.at)===k).reduce((s,x)=>s+x.min,0) });
  }
  /* sequência de dias seguidos treinando (conta hoje ou ontem como ponto de partida) */
  const set = new Set(h.map(x=>dayKey(x.at)));
  let streak = 0; const c = new Date();
  if(!set.has(dayKey(c))) c.setDate(c.getDate()-1);
  while(set.has(dayKey(c))){ streak++; c.setDate(c.getDate()-1); }
  /* meta: 3 treinos por semana, nas últimas 4 semanas */
  let goalWeeks = 0; const wk0 = startOfWeek(new Date());
  for(let i=0;i<4;i++){
    const a = new Date(wk0); a.setDate(a.getDate()-7*i);
    const b = new Date(a); b.setDate(b.getDate()+7);
    if(h.filter(x=>x.at>=a.getTime() && x.at<b.getTime()).length >= 3) goalWeeks++;
  }
  /* dias treinados nesta semana (seg→dom) */
  const week = [];
  for(let i=0;i<7;i++){ const d = new Date(wk0); d.setDate(d.getDate()+i); week.push({ label:DOW[d.getDay()][0], day:d.getDate(), on:set.has(dayKey(d)), today:dayKey(d)===dayKey(new Date()) }); }
  return { count:h.length, totalMin, totalKcal, days, streak, goalWeeks, week };
}

/* ---------------- estado da tela ---------------- */
let state = { screen: me() ? (me().level ? 'home' : 'level') : 'welcome' };
let pendingLevel = null;
let timer = null;     // setInterval do cronômetro
let wakeLock = null;

function go(screen, extra={}){
  stopTimer();
  state = Object.assign({ screen }, extra);
  render();
  window.scrollTo(0,0);
}
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), 2600);
}
function initials(name){ return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('') || '?'; }

/* ---------------- telas ---------------- */
function topbar(title, back, right=''){
  return `<div class="topbar">
    ${back ? `<button class="icon-btn" data-go="${back}" aria-label="Voltar">${I.back}</button>` : ''}
    ${title ? `<h1>${title}</h1>` : '<div style="flex:1"></div>'}
    ${right}
  </div>`;
}
function nav(active){
  const items = [ ['home','Início',I.home], ['workout','Treino',I.dumbbell], ['progress','Progresso',I.chart], ['profile','Perfil',I.person] ];
  return `<nav class="bottom-nav">${items.map(([k,l,ic])=>`<button class="${k===active?'active':''}" data-go="${k}">${ic}<span>${l}</span></button>`).join('')}</nav>`;
}

const SCREENS = {
  welcome(){
    return `<div class="screen welcome">
      <div class="welcome-inner">
        <div class="brand">
          <div class="brand-logo">${I.logo}</div>
          <h1 class="brand-title"><span>Treino</span><span class="y">em casa</span></h1>
          <p class="brand-tag">Sua academia,<br>onde você estiver.</p>
        </div>
        <div class="hero-figure">${heroFigure()}</div>
        <p class="slogan"><b>Não há desculpa.</b>Você pode treinar em casa.</p>
        <button class="btn btn-primary" data-go="signup">Começar agora ${I.arrow}</button>
        <button class="btn btn-outline" data-go="login">Já tenho uma conta</button>
      </div>
    </div>`;
  },

  signup(){
    return `<div class="screen">
      ${topbar('', 'welcome')}
      <h1 class="title-xl">Vamos começar?</h1>
      <p class="subtitle">Crie sua conta para personalizar seu treino e acompanhar sua evolução.</p>
      <form id="signup-form" novalidate>
        <label class="field">${I.user}<input name="name" placeholder="Nome completo" autocomplete="name" required></label>
        <label class="field">${I.mail}<input name="email" type="email" placeholder="E-mail" autocomplete="email" required></label>
        <label class="field">${I.lock}<input name="pass" type="password" placeholder="Senha (mín. 6 caracteres)" autocomplete="new-password" required><button type="button" class="eye" data-eye aria-label="Mostrar senha">${I.eye}</button></label>
        <label class="field">${I.lock}<input name="pass2" type="password" placeholder="Confirmar senha" autocomplete="new-password" required><button type="button" class="eye" data-eye aria-label="Mostrar senha">${I.eye}</button></label>
        <div class="form-error" id="form-error"></div>
        <button class="btn btn-primary" type="submit">Criar conta</button>
      </form>
      <div class="divider">ou</div>
      <button class="btn btn-ghost social" data-action="social" data-provider="Google">${I.google} Continuar com o Google</button>
      <button class="btn btn-ghost social" data-action="social" data-provider="Apple">${I.apple} Continuar com a Apple</button>
      <p class="foot-note">Já tem uma conta? <button class="link-btn" data-go="login">Entrar</button></p>
    </div>`;
  },

  login(){
    return `<div class="screen">
      ${topbar('', 'welcome')}
      <h1 class="title-xl">Bem-vindo de volta!</h1>
      <p class="subtitle">Entre para continuar seus treinos de onde parou.</p>
      <form id="login-form" novalidate>
        <label class="field">${I.mail}<input name="email" type="email" placeholder="E-mail" autocomplete="email" required></label>
        <label class="field">${I.lock}<input name="pass" type="password" placeholder="Senha" autocomplete="current-password" required><button type="button" class="eye" data-eye aria-label="Mostrar senha">${I.eye}</button></label>
        <div class="form-error" id="form-error"></div>
        <button class="btn btn-primary" type="submit">Entrar</button>
      </form>
      <p class="foot-note">Ainda não tem conta? <button class="link-btn" data-go="signup">Criar conta</button></p>
    </div>`;
  },

  level(){
    const u = me(); const current = pendingLevel || (u && u.level) || 'amador';
    pendingLevel = current;
    const back = u && u.level ? 'profile' : '';
    return `<div class="screen">
      ${topbar('', back)}
      <h1 class="title-xl">Qual é o seu nível?</h1>
      <p class="subtitle">Escolha o nível que mais combina com você. Depois, podemos personalizar seus treinos.</p>
      <div class="level-list">
        ${Object.entries(LEVELS).map(([k,l])=>`
          <button class="level-card ${k===current?'selected':''}" data-action="pick-level" data-level="${k}">
            <span class="lv-icon">${I[l.icon]}</span>
            <span class="lv-body"><h3>${l.name}</h3><p>${l.desc}</p></span>
            <span class="lv-fig">${figure(l.pose,'#8A8A94')}</span>
            <span class="check">${I.check}</span>
          </button>`).join('')}
      </div>
      <button class="btn btn-primary" data-action="save-level">Continuar</button>
      <p style="text-align:center;margin-top:18px"><button class="link-underline" data-action="levels-info">Quero saber mais sobre os níveis</button></p>
    </div>`;
  },

  home(){
    const u = me(); const s = stats(u); const w = todayWorkout(u.level);
    const first = u.name.split(' ')[0];
    const doneToday = (u.history||[]).some(x=>dayKey(x.at)===dayKey(Date.now()));
    return `<div class="screen has-nav">
      <div class="greet"><small>${greeting()},</small><h1>${esc(first)} 💪</h1></div>
      <div class="streak">
        ${I.fire}
        <div style="flex:1">
          <b>${s.streak ? `${s.streak} ${s.streak>1?'dias seguidos':'dia seguido'}` : 'Comece sua sequência hoje'}</b>
          <small>${doneToday ? 'Treino de hoje concluído. Mandou bem!' : 'Pequenos passos geram grandes resultados.'}</small>
          <div class="week-dots">${s.week.map(d=>`<div class="${d.on?'on':''} ${d.today?'today':''}"><i>${d.on?'✓':d.day}</i>${d.label}</div>`).join('')}</div>
        </div>
      </div>
      <div class="hero-card">
        <span class="hc-fig">${figure(w.ex[0] ? EX[w.ex[0][0]].pose : 'squat')}</span>
        <span class="chip">${LEVELS[u.level].short}</span>
        <h2>${w.name}</h2>
        <div class="meta"><span>${I.clock} ${w.min} minutos</span><span>${I.fire} ${w.kcal} kcal</span></div>
        <p>${w.desc}</p>
      </div>
      <button class="btn btn-primary" data-go="workout">${I.play} Ver treino de hoje</button>
      <div class="features">
        <div class="feature">${I.clock}Treinos rápidos e práticos</div>
        <div class="feature">${I.home}Sem precisar de academia</div>
        <div class="feature">${I.target}Para todos os níveis</div>
        <div class="feature">${I.phone}No seu ritmo, no seu tempo</div>
      </div>
    </div>${nav('home')}`;
  },

  workout(){
    const u = me(); const w = state.id ? findWorkout(state.id) : todayWorkout(u.level);
    const isToday = w.id === todayWorkout(u.level).id;
    const lvKey = Object.keys(WORKOUTS).find(k=>WORKOUTS[k].includes(w));
    const others = WORKOUTS[u.level].filter(x=>x.id!==w.id);
    return `<div class="screen has-nav">
      ${topbar(isToday ? 'Treino de hoje' : 'Treino', state.id ? 'workout' : '', `<button class="icon-btn yellow" data-go="progress" aria-label="Histórico">${I.calendar}</button>`)}
      <div class="hero-card">
        <span class="hc-fig">${figure(EX[w.ex[0][0]].pose)}</span>
        <span class="chip">${LEVELS[lvKey].short}</span>
        <h2>${w.name}</h2>
        <div class="meta"><span>${I.clock} ${w.min} minutos</span><span>${I.fire} ${w.kcal} kcal</span></div>
        <p>${w.desc}</p>
      </div>
      <div class="ex-list">
        ${w.ex.map((e,i)=>`
          <button class="ex-item" data-action="ex-info" data-i="${i}">
            <span class="ex-thumb"><span class="num">${i+1}</span>${figure(EX[e[0]].pose)}</span>
            <span class="ex-body"><h4>${EX[e[0]].name}</h4><small>${exLabel(e)}</small></span>
            <span class="chev">${I.chev}</span>
          </button>`).join('')}
      </div>
      <div class="sticky-cta"><button class="btn btn-primary" data-action="start" data-id="${w.id}">${I.play} Iniciar treino</button></div>
      ${others.length ? `<div class="section-title">${I.dumbbell} Outros treinos do seu nível</div>
      <div class="wk-list">${others.map(o=>`
        <button class="wk-item" data-go="workout" data-id="${o.id}">
          <span class="wk-ic">${figure(EX[o.ex[0][0]].pose)}</span>
          <span class="ex-body"><h4>${o.name}</h4><small>${o.min} min • ${o.kcal} kcal • ${o.ex.length} exercícios</small></span>
          <span class="chev">${I.chev}</span>
        </button>`).join('')}</div>` : ''}
    </div>${nav('workout')}`;
  },

  /* player: state = { id, i (exercício), set (série, começa em 1), phase:'work'|'rest', left (s), running, startedAt } */
  player(){
    const w = findWorkout(state.id); const e = w.ex[state.i]; const ex = EX[e[0]]; const cfg = e[2];
    const totalSets = w.ex.reduce((s,x)=>s+x[1],0);
    const doneSets = w.ex.slice(0,state.i).reduce((s,x)=>s+x[1],0) + state.set - 1 + (state.phase==='rest'?1:0);
    const pct = Math.round(doneSets/totalSets*100);
    const head = `<div class="topbar">
        <button class="icon-btn" data-action="quit" aria-label="Sair do treino">${I.back}</button>
        <h1 style="font-size:16px;text-align:center">${w.name}</h1>
        <span style="width:40px;text-align:right;color:var(--muted);font-size:13px">${pct}%</span>
      </div>
      <div class="progress-bar"><i style="width:${pct}%"></i></div>`;

    if(state.phase === 'rest'){
      const nx = nextStep(w); const nEx = nx ? EX[w.ex[nx.i][0]] : null;
      const R = 84, C = 2*Math.PI*R, frac = state.left / state.restTotal;
      return `<div class="screen player rest">
        ${head}
        <p class="chip dark" style="margin:6px auto 0">Descanso</p>
        <div class="ring">
          <svg viewBox="0 0 190 190"><circle cx="95" cy="95" r="${R}" stroke="#26262C" stroke-width="10" fill="none"/>
          <circle id="ring-arc" cx="95" cy="95" r="${R}" stroke="#FFD60A" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}"/></svg>
          <div class="ring-txt"><div class="big-number" id="clock">${state.left}</div></div>
        </div>
        <p class="big-label">Respire fundo e beba água.</p>
        ${nEx ? `<div class="next-up"><span class="ex-thumb">${figure(nEx.pose)}</span><div><small>A seguir • série ${nx.set} de ${w.ex[nx.i][1]}</small><b>${nEx.name}</b></div></div>` : ''}
        <div class="actions">
          <button class="btn btn-ghost" data-action="add-rest">+15 segundos</button>
          <button class="btn btn-primary" data-action="skip-rest">${I.skip} Pular descanso</button>
        </div>
      </div>`;
    }
    const timed = !!cfg.secs;
    return `<div class="screen player">
      ${head}
      <div class="player-fig ${state.running || !timed ? 'anim' : ''}">${figure(ex.pose)}</div>
      <h2>${ex.name}</h2>
      <p class="tip">${ex.tip}</p>
      <div class="set-info"><span class="chip dark">Exercício ${state.i+1} de ${w.ex.length}</span><span class="chip dark">Série ${state.set} de ${e[1]}</span></div>
      ${timed
        ? `<div class="big-number" id="clock">${state.left}</div><div class="big-label">segundos</div>`
        : `<div class="big-number">${cfg.reps}</div><div class="big-label">repetições${ex.each?' (cada perna)':''}</div>`}
      <div class="actions">
        ${timed
          ? (state.left === 0
              ? `<button class="btn btn-primary" data-action="set-done">${I.check} Próximo</button>`
              : `<button class="btn btn-primary" data-action="toggle-timer">${state.running ? I.pause+' Pausar' : I.play+(state.left<cfg.secs?' Continuar':' Começar')}</button>
                 <button class="btn btn-ghost" data-action="set-done">Pular série</button>`)
          : `<button class="btn btn-primary" data-action="set-done">${I.check} Concluí a série</button>`}
      </div>
    </div>`;
  },

  done(){
    const r = state.result;
    return `<div class="screen done-screen">
      <div class="trophy">${I.trophy}</div>
      <h1 class="title-xl" style="margin-top:0">Treino concluído!</h1>
      <p class="subtitle" style="margin:0">${esc(r.name)}<br>Não há desculpa — e você provou isso hoje.</p>
      <div class="done-stats">
        <div><b>${r.min}</b><small>minutos</small></div>
        <div><b>${r.kcal}</b><small>kcal</small></div>
        <div><b>${r.sets}</b><small>séries</small></div>
      </div>
      <button class="btn btn-primary" data-go="progress">Ver meu progresso</button>
      <button class="btn btn-ghost" data-go="home">Voltar ao início</button>
    </div>`;
  },

  progress(){
    const u = me(); const s = stats(u);
    const goalPct = Math.round(s.goalWeeks/4*100);
    const recent = (u.history||[]).slice(-5).reverse();
    return `<div class="screen has-nav">
      ${topbar('Meu progresso', '', `<button class="icon-btn" data-go="profile" aria-label="Configurações">${I.gear}</button>`)}
      <button class="profile-card" data-go="profile">
        <span class="avatar">${esc(initials(u.name))}</span>
        <span class="ex-body"><h3>${esc(u.name)}</h3><small>${LEVELS[u.level].short} • ${weeksSince(u.createdAt)}</small></span>
        <span class="chev">${I.chev}</span>
      </button>
      <div class="stats">
        <div class="stat">${I.calendar}<b>${s.count}</b><small>Treinos feitos</small></div>
        <div class="stat">${I.fire}<b>${fmtNum(s.totalKcal)}</b><small>Calorias gastas</small></div>
        <div class="stat">${I.clock}<b>${fmtHours(s.totalMin)}</b><small>Tempo total</small></div>
      </div>
      <div class="section-title">Evolução</div>
      <div class="panel chart">
        <div class="panel-head"><b>Minutos de treino</b><small>Últimos 7 dias</small></div>
        ${lineChart(s.days)}
      </div>
      <div class="section-title">${I.target} Objetivos</div>
      <div class="panel goal">
        ${I.target}
        <div class="ex-body">
          <b>Treinar 3x por semana</b>
          <div class="bar"><i style="width:${goalPct}%"></i></div>
          <small>${s.goalWeeks}/4 semanas</small>
        </div>
      </div>
      <div class="section-title">Últimos treinos</div>
      ${recent.length ? `<div class="history">${recent.map(h=>`<div class="h-row"><div>${esc(h.name)}<br><small>${new Date(h.at).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'})}</small></div><div style="text-align:right">${h.min} min<br><small>${h.kcal} kcal</small></div></div>`).join('')}</div>`
        : `<div class="panel empty">Nenhum treino ainda. Que tal começar hoje?</div>`}
      <div class="section-title">Seu corpo em movimento</div>
      <div class="panel quote">${I.mountain}<p>Pequenos passos também geram grandes resultados.</p></div>
    </div>${nav('progress')}`;
  },

  profile(){
    const u = me();
    return `<div class="screen has-nav">
      ${topbar('Perfil', '')}
      <div style="text-align:center;margin:10px 0 22px">
        <div class="avatar lg">${esc(initials(u.name))}</div>
        <h2 style="margin:0;font-size:22px">${esc(u.name)}</h2>
        <small style="color:var(--muted)">${esc(u.email)}</small>
      </div>
      <div class="menu">
        <button data-action="rename">${I.edit}<span>Alterar nome</span></button>
        <button data-go="level">${I[LEVELS[u.level].icon]}<span>Nível</span><small>${LEVELS[u.level].short}</small></button>
        <button data-action="levels-info">${I.target}<span>Sobre os níveis</span></button>
      </div>
      <div class="menu" style="margin-top:14px">
        <button data-action="logout">${I.logout}<span>Sair da conta</span></button>
        <button class="danger" data-action="reset">${I.trash}<span>Apagar meu histórico</span></button>
      </div>
      <p style="text-align:center;color:var(--muted-2);font-size:12px;margin-top:24px">Treino em Casa • seus dados ficam salvos só neste aparelho.</p>
    </div>${nav('profile')}`;
  },
};

function greeting(){ const h = new Date().getHours(); return h<12 ? 'Bom dia' : h<18 ? 'Boa tarde' : 'Boa noite'; }

function lineChart(days){
  const W = 300, H = 120, pl = 8, pr = 8, pt = 18, pb = 22;
  const max = Math.max(10, ...days.map(d=>d.min));
  const pts = days.map((d,i)=>[ pl + i*(W-pl-pr)/(days.length-1), pt + (1 - d.min/max)*(H-pt-pb) ]);
  const line = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area = `${line} L${pts[pts.length-1][0]} ${H-pb} L${pts[0][0]} ${H-pb} Z`;
  return `<svg viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD60A" stop-opacity=".45"/><stop offset="1" stop-color="#FFD60A" stop-opacity="0"/></linearGradient></defs>
    ${[0,.5,1].map(f=>`<line x1="${pl}" x2="${W-pr}" y1="${pt+f*(H-pt-pb)}" y2="${pt+f*(H-pt-pb)}" stroke="#2A2A31" stroke-dasharray="3 4"/>`).join('')}
    <path d="${area}" fill="url(#g)"/>
    <path d="${line}" fill="none" stroke="#FFD60A" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#FFD60A"/>${days[i].min?`<text class="val" x="${p[0]}" y="${p[1]-8}" text-anchor="middle">${days[i].min}</text>`:''}<text x="${p[0]}" y="${H-4}" text-anchor="middle">${days[i].label}</text>`).join('')}
  </svg>`;
}

/* ---------------- player: lógica ---------------- */
function nextStep(w){
  const e = w.ex[state.i];
  if(state.set < e[1]) return { i:state.i, set:state.set+1 };
  if(state.i+1 < w.ex.length) return { i:state.i+1, set:1 };
  return null;
}
function startWorkout(id){
  const w = findWorkout(id);
  go('player', { id, i:0, set:1, phase:'work', left:w.ex[0][2].secs||0, running:false, startedAt:Date.now() });
  keepAwake(true);
}
function setDone(){
  const w = findWorkout(state.id);
  stopTimer();
  const nx = nextStep(w);
  if(!nx) return finishWorkout(w);
  state.pending = nx;
  state.phase = 'rest'; state.restTotal = w.rest; state.left = w.rest;
  render(); runTimer();
}
function afterRest(){
  const w = findWorkout(state.id);
  stopTimer();
  const nx = state.pending;
  Object.assign(state, { i:nx.i, set:nx.set, phase:'work', running:false, left:w.ex[nx.i][2].secs||0 });
  render();
}
function runTimer(){
  stopTimer();
  state.running = true;
  timer = setInterval(()=>{
    state.left = Math.max(0, state.left-1);
    const clock = document.getElementById('clock'); if(clock) clock.textContent = state.left;
    const arc = document.getElementById('ring-arc');
    if(arc){ const C = 2*Math.PI*84; arc.setAttribute('stroke-dashoffset', C*(1-state.left/state.restTotal)); }
    if(state.left <= 3 && state.left > 0) beep(660, .08);
    if(state.left === 0){
      stopTimer(); beep(990, .25); try{ navigator.vibrate && navigator.vibrate([200,80,200]); }catch(e){}
      if(state.phase === 'rest') afterRest(); else render();
    }
  }, 1000);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } if(state) state.running = false; }
function finishWorkout(w){
  const u = me();
  const min = Math.max(1, Math.round((Date.now()-state.startedAt)/60000));
  const entry = { id:w.id, name:w.name, at:Date.now(), min, kcal:w.kcal };
  u.history = (u.history||[]).concat(entry); saveDB();
  keepAwake(false);
  go('done', { result:{ name:w.name, min, kcal:w.kcal, sets:w.ex.reduce((s,x)=>s+x[1],0) } });
}

let audioCtx = null;
function beep(freq, dur){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(.15, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime+dur);
    o.start(); o.stop(audioCtx.currentTime+dur);
  }catch(e){}
}
/* mantém a tela do celular acesa durante o treino (quando o navegador suporta) */
async function keepAwake(on){
  try{
    if(on && 'wakeLock' in navigator){ wakeLock = await navigator.wakeLock.request('screen'); }
    else if(!on && wakeLock){ await wakeLock.release(); wakeLock = null; }
  }catch(e){}
}

/* ---------------- modal ---------------- */
function modal(html){
  const back = document.createElement('div'); back.className = 'modal-back';
  back.innerHTML = `<div class="modal">${html}<button class="btn btn-primary" data-close style="margin-top:8px">Entendi</button></div>`;
  back.addEventListener('click', ev=>{ if(ev.target===back || ev.target.closest('[data-close]')) back.remove(); });
  document.body.appendChild(back);
}

/* ---------------- render + eventos ---------------- */
const app = document.getElementById('app');
function render(){
  const needsUser = !['welcome','signup','login'].includes(state.screen);
  if(needsUser && !me()){ state = { screen:'welcome' }; }
  if(needsUser && me() && !me().level && state.screen!=='level'){ state = { screen:'level' }; }
  app.innerHTML = SCREENS[state.screen]();
  bindForms();
}

function bindForms(){
  const su = document.getElementById('signup-form');
  if(su) su.addEventListener('submit', async ev=>{
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(su));
    const err = document.getElementById('form-error');
    const bad = (name, msg)=>{ su.querySelectorAll('.field').forEach(x=>x.classList.remove('invalid')); if(name) su.elements[name].closest('.field').classList.add('invalid'); err.textContent = msg; };
    const email = f.email.trim().toLowerCase();
    if(f.name.trim().length < 2) return bad('name','Digite seu nome.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('email','Digite um e-mail válido.');
    if(db.accounts[email]) return bad('email','Já existe uma conta com esse e-mail. Toque em "Entrar".');
    if(f.pass.length < 6) return bad('pass','A senha precisa ter pelo menos 6 caracteres.');
    if(f.pass !== f.pass2) return bad('pass2','As senhas não são iguais.');
    db.accounts[email] = { name:f.name.trim(), email, pass:await hashPass(f.pass), level:null, history:[], createdAt:Date.now() };
    db.session = email; saveDB();
    pendingLevel = null; go('level', { from:'signup' });
  });
  const li = document.getElementById('login-form');
  if(li) li.addEventListener('submit', async ev=>{
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(li));
    const email = f.email.trim().toLowerCase(); const acc = db.accounts[email];
    if(!acc || acc.pass !== await hashPass(f.pass)){ document.getElementById('form-error').textContent = 'E-mail ou senha incorretos.'; return; }
    db.session = email; saveDB();
    go(acc.level ? 'home' : 'level');
  });
}

app.addEventListener('click', ev=>{
  const eye = ev.target.closest('[data-eye]');
  if(eye){
    const inp = eye.parentElement.querySelector('input');
    inp.type = inp.type==='password' ? 'text' : 'password';
    eye.innerHTML = inp.type==='password' ? I.eye : I.eyeOff; return;
  }
  const g = ev.target.closest('[data-go]');
  if(g){
    if(state.screen==='player' && !confirmQuit()) return;
    return go(g.dataset.go, g.dataset.id ? { id:g.dataset.id } : {});
  }
  const a = ev.target.closest('[data-action]'); if(!a) return;
  const act = a.dataset.action;
  if(act==='social'){
    toast(`Login com ${a.dataset.provider} estará disponível em breve. Por enquanto, crie sua conta com e-mail.`);
  } else if(act==='pick-level'){
    pendingLevel = a.dataset.level;
    document.querySelectorAll('.level-card').forEach(c=>c.classList.toggle('selected', c.dataset.level===pendingLevel));
  } else if(act==='save-level'){
    const u = me(); const changed = u.level && u.level !== pendingLevel;
    u.level = pendingLevel; saveDB(); pendingLevel = null;
    if(changed) toast(`Nível alterado para ${LEVELS[u.level].short}.`);
    go('home');
  } else if(act==='levels-info'){
    modal(`<h2>Sobre os níveis</h2>${Object.values(LEVELS).map(l=>`<div class="lv-info">${I[l.icon]}<div><b>${l.name}</b><p>${l.more}</p></div></div>`).join('')}<p style="color:var(--muted);font-size:13px">Você pode trocar de nível quando quiser, no seu Perfil.</p>`);
  } else if(act==='ex-info'){
    const w = state.id ? findWorkout(state.id) : todayWorkout(me().level);
    const e = w.ex[+a.dataset.i]; const ex = EX[e[0]];
    modal(`<div class="player-fig anim" style="aspect-ratio:1.6">${figure(ex.pose)}</div><h2>${ex.name}</h2><p class="chip dark" style="margin:0 0 12px">${exLabel(e)}</p><p style="color:#D6D6DC;margin:0 0 16px">${ex.tip}</p>`);
  } else if(act==='start'){
    startWorkout(a.dataset.id);
  } else if(act==='toggle-timer'){
    if(state.running){ stopTimer(); render(); } else { beep(880,.05); runTimer(); render(); }
  } else if(act==='set-done'){
    setDone();
  } else if(act==='skip-rest'){
    afterRest();
  } else if(act==='add-rest'){
    state.left += 15; state.restTotal = Math.max(state.restTotal, state.left);
    const c = document.getElementById('clock'); if(c) c.textContent = state.left;
  } else if(act==='quit'){
    if(confirmQuit()) go('workout', { id:state.id });
  } else if(act==='rename'){
    const u = me(); const n = prompt('Seu nome:', u.name);
    if(n && n.trim().length >= 2){ u.name = n.trim(); saveDB(); render(); }
  } else if(act==='logout'){
    db.session = null; saveDB(); go('welcome');
  } else if(act==='reset'){
    if(confirm('Apagar todo o seu histórico de treinos? Isso não pode ser desfeito.')){ me().history = []; saveDB(); toast('Histórico apagado.'); render(); }
  }
});
function confirmQuit(){
  const ok = confirm('Sair do treino? O progresso deste treino não será salvo.');
  if(ok) keepAwake(false);
  return ok;
}
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && state.screen==='player' && state.running) keepAwake(true); });

render();
