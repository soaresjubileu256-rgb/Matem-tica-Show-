/* Abre todas as telas do app (tema escuro e claro, celular e computador) e confere:
   sem erro de JavaScript, tela com conteúdo e nada saindo pra fora na horizontal. */
const {T, newPage, register, goScreen, run} = require('./lib.js');
const TELAS = [['home'],['path'],['content'],['subjectDetail',{subjectId:'fracoes'}],['practice'],['exercisesSubjects'],['personalizedSetup'],
  ['challengeDifficulty'],['stepSetup'],['tabuada'],['exams'],['errors'],['arena'],['dailyIntro'],['games'],['examSetup'],['lightning'],
  ['speedRun'],['quizSetup'],['duel'],['friendChallenge'],['solve'],['calculator'],['notebook'],['geoLab'],['progress'],['ranking'],
  ['report'],['history'],['achievements'],['certificates'],['profile'],['loja'],['settings'],['news'],['help']];

run(async b=>{
  for(const [modo, viewport] of [['celular', null], ['computador', {viewport:{width:1280, height:860}, isMobile:false, hasTouch:false, deviceScaleFactor:1}]]){
    const {p} = await newPage(b, viewport || {});
    await register(p, 'Tela Teste');
    await p.evaluate(()=>{ const g = loadGame(); g.unlocks = 'all'; saveGame(); });
    for(const tema of (modo==='celular' ? ['dark','light'] : ['dark'])){
      await p.evaluate(t=> applyTheme(t), tema);
      const ruins = [];
      for(const [tela, extra] of TELAS){
        const antes = p._errs.length;
        await goScreen(p, tela, extra);
        const r = await p.evaluate(()=>({scr: state.screen, len: (document.getElementById('app')||document.body).innerText.length,
          largo: document.documentElement.scrollWidth - innerWidth}));
        if(r.scr !== tela) ruins.push(`${tela}: abriu "${r.scr}"`);
        else if(r.len < 40) ruins.push(`${tela}: tela vazia`);
        else if(r.largo > 2) ruins.push(`${tela}: sai ${r.largo}px pra fora`);
        if(p._errs.length > antes) ruins.push(`${tela}: erro JS ${p._errs.slice(antes).join(' | ')}`);
      }
      T('Telas', `${modo}, tema ${tema==='dark'?'escuro':'claro'}: as ${TELAS.length} telas abrem sem problema`, ruins.length===0, ruins.join(' ; '));
    }
  }
});
