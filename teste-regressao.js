/* =========================================================
   Matemática Show — TESTE DE REGRESSÃO: contas e dados (P0 e P1)
   Como rodar (precisa do Playwright com Chromium):
     node teste-regressao.js
   Abre o app de verdade no navegador (sem servidor) e confere contas, renomeação,
   isolamento entre contas, fluxo de resposta, transações, backup e caderno de erros.
   Usa só contas de teste ("Teste 1", "Teste 2"...).
   ========================================================= */
const path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = 'file://' + path.join(__dirname, 'index.html');

(async()=>{
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390, height:844}});
  const p = await ctx.newPage();
  const jsErr = []; p.on('pageerror', e=>jsErr.push(e.message));
  let fails = 0, n = 0;
  const ok = (c, m)=>{ n++; console.log((c ? '✅' : '❌') + ' ' + m); if(!c) fails++; };
  const W = ms=>p.waitForTimeout(ms);
  const clean = ()=>p.evaluate(()=>document.querySelectorAll('.gm-modal-bg,.tour-root,.gm-toast,#gm-confetti').forEach(x=>x.remove()));
  const PASS = 'Girafa7Azul';

  async function signup(name){
    await p.evaluate(()=>{ if(currentUser) doLogout(); }); await W(400);
    const nb = await p.$('.new-acc'); if(nb) await nb.click(); await W(150);
    await p.fill('.authName', name); await p.fill('.authPass', PASS); await p.fill('.authPass2', PASS);
    await p.click('.auth-go'); await W(900);
    await p.evaluate(()=>{ if(_tourClose) _tourClose(); markTutorialDone(); }); await clean();
  }
  async function login(name, pass){
    await p.evaluate(()=>{ if(currentUser) doLogout(); }); await W(400);
    await p.evaluate(nm=>{ const c = [...document.querySelectorAll('.acc-card')].find(x=>x.querySelector('.acc-name').textContent===nm); if(c) c.click(); }, name); await W(150);
    await p.fill('.authPass', pass || PASS); await p.click('.auth-go'); await W(700); await clean();
    return p.evaluate(()=>currentUser && currentUser.name);
  }
  // cria dados em TODOS os módulos da conta logada
  async function fillAllModules(tag){
    await p.evaluate(async tag=>{
      const s = SUBJECTS.find(x=>x.id==='fracoes');
      for(let i=0;i<6;i++){ const g = genQuestionAvoidingRepeat(s,'facil',null); await recordAnswer('fracoes', i%2===0, {difficulty:'facil', ex:g.ex}); }
      newNotePage({title:'Página '+tag, subjectId:'fracoes', strokes:[[{x:1,y:2,p:.5},{x:3,y:4,p:.5}]]});
      newNotePage({title:'Outra '+tag});
      const st = await loadSettings(); st.dailyGoal = 20; st.theme = 'dark'; await saveSettings();
      saveLastTraining({subjectIds:['fracoes','eq1'], difficultyMode:'adaptativa', qty:10, focusWeak:true});
      saveBackupInfo({last: 1700000000000});
      storage.set(`${DUEL_NAMES_KEY_BASE}:${currentUserId()}`, ['Ana '+tag, 'Bia '+tag]);
      const g = loadGame(); g.gems = 77; studyData().grade = 'f2'; markTopicRead('fracoes','c0'); arenaData().phases.adicao = {facil:3}; saveGame();
    }, tag);
  }
  async function snapshot(){
    return p.evaluate(async()=>{
      dropUserCaches();
      const uid = currentUserId(), k = getUserStorageKeys(uid);
      const notes = notesIndex();
      return {
        uid,
        progress: (progressSync().fracoes||{}).attempted || 0,
        history: (await loadHistory()).length,
        errors: (await loadErrors()).length,
        notes: notes.length,
        pagesOk: notes.every(x=> Array.isArray(loadNotePage(x.id).strokes)),
        strokes: notes.reduce((a,x)=>a + loadNotePage(x.id).strokes.length, 0),
        goal: (await loadSettings()).dailyGoal,
        theme: settingsCache.theme,
        ptrain: (loadLastTraining()||{}).qty || 0,
        backup: backupInfo().last || 0,
        duel: (storage.get(k.fixed.duel, [])||[])[0] || '',
        xp: loadGame().xp, gems: loadGame().gems, grade: studyData().grade, read: (studyRead().fracoes||[]).length, stars: (arenaData().phases.adicao||{}).facil||0,
        keysPresent: k.all.filter(x=>storage.has(x)).length, keysTotal: k.all.length,
      };
    });
  }

  await p.goto(URL); await W(800);

  // ---------- CONTA: criação, login, troca ----------
  await signup('Teste 1');
  ok(await p.evaluate(()=>currentUser && currentUser.name==='Teste 1' && state.screen==='home'), 'criação de conta (Teste 1) abre o Início');
  await fillAllModules('A');
  const a0 = await snapshot();
  ok(a0.progress===6 && a0.history===6 && a0.errors===3 && a0.notes===2 && a0.goal===20 && a0.ptrain===10 && a0.backup && a0.duel==='Ana A' && a0.xp>0 && a0.gems===77 && a0.grade==='f2' && a0.read===1 && a0.stars===3,
     'dados criados em todos os módulos: '+JSON.stringify(a0));
  ok(a0.keysPresent===a0.keysTotal, `getUserStorageKeys cobre todas as chaves da conta (${a0.keysPresent}/${a0.keysTotal})`);
  // nenhuma chave com o id da conta fica fora do mapa
  const orphan = await p.evaluate(()=>{ const uid = currentUserId(), all = getUserStorageKeys(uid).all; return storage.keys().filter(k=> (k.endsWith(':'+uid) || k.includes(':'+uid+':')) && !all.includes(k) && !k.startsWith('mathstudy-current')); });
  ok(!orphan.length, 'nenhuma chave da conta fora de getUserStorageKeys '+orphan.join(','));

  await signup('Teste 2');
  const b0 = await snapshot();
  ok(b0.progress===0 && b0.history===0 && b0.errors===0 && b0.notes===0 && b0.xp===0 && b0.goal!==20 && !b0.duel, 'conta nova (Teste 2) começa vazia — não vê nada do Teste 1');
  await fillAllModules('B');
  await p.evaluate(async()=>{ const g = loadGame(); g.gems = 5; saveGame(); });

  ok(await login('Teste 1')==='Teste 1', 'login no Teste 1 pela lista de contas');
  const a1 = await snapshot();
  ok(a1.notes===2 && a1.duel==='Ana A' && a1.gems===77 && a1.progress===6, 'voltando ao Teste 1: só os dados do Teste 1 (anotações, duelo, moedas, progresso)');
  ok(await p.evaluate(()=>notesIndex().every(n=>/A$/.test(n.title))), 'anotações do Teste 1 não misturam com as do Teste 2');
  ok(await login('Teste 2')==='Teste 2' && (await snapshot()).gems===5, 'e o Teste 2 continua com os dados dele');

  // "voltar" do navegador não restaura tela de outra conta
  await p.evaluate(()=>go('subjectDetail',{subjectId:'eq2'}));
  await login('Teste 1');
  await p.goBack(); await W(400);
  ok(await p.evaluate(()=>!(state.screen==='subjectDetail' && state.subjectId==='eq2')), '"voltar" do navegador não abre a tela que a outra conta estava usando');
  await p.goto(URL); await W(800); await clean();

  // ---------- RENOMEAÇÃO: tudo vai junto ----------
  ok(await p.evaluate(()=>currentUser.name)==='Teste 1', 'recarregar mantém a conta logada');
  await p.evaluate(()=>go('settings')); await W(600);
  await p.fill('.settingsNameInput', 'Teste 3');
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(x=>x.textContent==='Salvar nome').click()); await W(500);
  const r = await snapshot();
  ok(r.uid==='teste 3', 'renomear pela tela de Configurações troca o id da conta');
  ok(r.progress===a0.progress && r.history===a0.history && r.errors===a0.errors, 'renomear: progresso, histórico e erros continuam');
  ok(r.notes===2 && r.pagesOk && r.strokes===a0.strokes, 'renomear: anotações e traços de cada página continuam');
  ok(r.goal===20 && r.theme==='dark' && r.ptrain===10 && r.backup===a0.backup && r.duel==='Ana A', 'renomear: configurações, treino, backup e nomes do duelo continuam');
  ok(r.xp===a0.xp && r.gems===77 && r.grade==='f2' && r.read===1 && r.stars===3, 'renomear: XP, moedas, ano escolar, lições lidas e estrelas da Arena continuam');
  ok(await p.evaluate(()=>{ const old = getUserStorageKeys('teste 1'); return old.all.every(k=>!storage.has(k)) && !storage.keys().some(k=>k.startsWith('mathstudy-note-v1:teste 1:')); }), 'renomear: nada fica esquecido no id antigo');
  await p.evaluate(async()=>{ await recordAnswer('eq1', true, {difficulty:'facil', ex:{question:'x + 1 = 2', answer:1, type:'single'}}); });
  ok(await p.evaluate(()=>storage.get(getUserStorageKeys('teste 3').fixed.game,{}).xp > 0 && !storage.has(getUserStorageKeys('teste 1').fixed.game)), 'depois de renomear, o XP novo é gravado na conta nova (não no id antigo)');
  await p.reload(); await W(900); await clean();
  const r2 = await snapshot();
  ok(r2.uid==='teste 3' && r2.notes===2 && r2.progress===6 && r2.gems===77, 'recarregar depois de renomear: continua tudo lá');
  ok(await login('Teste 3')==='Teste 3', 'login com o nome novo e a mesma senha');
  ok(await p.evaluate(async()=>(await renameCurrentUser('Teste 2')).ok===false), 'não deixa renomear para o nome de outra conta');
  ok(await p.evaluate(async()=>(await renameCurrentUser('   ')).ok===false), 'não deixa nome vazio');

  // ---------- FLUXO PRINCIPAL: resposta → progresso, XP, histórico, erro ----------
  const f0 = await p.evaluate(async()=>({xp:loadGame().xp, att:(progressSync().eq1||{attempted:0}).attempted, h:(await loadHistory()).length, e:(await loadErrors()).length}));
  await p.evaluate(()=>startSession('eq1','facil')); await W(300);
  await p.evaluate(()=>{ document.querySelector('#ans1').value='99999'; }); await p.click('.check-btn'); await W(500);
  const f1 = await p.evaluate(async()=>({xp:loadGame().xp, att:progressSync().eq1.attempted, h:(await loadHistory()).length, e:(await loadErrors()).length}));
  ok(f1.att===f0.att+1 && f1.h===f0.h+1 && f1.e===f0.e+1 && f1.xp===f0.xp, 'errar: +1 no progresso, +1 no histórico, +1 erro, sem XP');
  await clean(); await p.click('.next-btn'); await W(300);
  await p.evaluate(()=>{ const ex = state.session.current; document.querySelector('#ans1').value = ex.displayAnswer || String(ex.answer); });
  await p.evaluate(()=>{ const b = document.querySelector('.check-btn'); b.click(); b.click(); b.click(); }); await W(600);
  const f2 = await p.evaluate(async()=>({xp:loadGame().xp, att:progressSync().eq1.attempted, h:(await loadHistory()).length, res:state.session.results.length}));
  ok(f2.att===f1.att+1 && f2.h===f1.h+1 && f2.res===2 && f2.xp>f1.xp, 'acertar com clique triplo: conta uma vez só (progresso, histórico e XP)');
  const xpOnce = f2.xp;
  await p.goBack(); await W(300); await p.goForward(); await W(400); await clean();
  ok(await p.evaluate(()=>loadGame().xp)===xpOnce, 'voltar/avançar no navegador não dá XP de novo');
  await p.reload(); await W(900); await clean();
  ok(await p.evaluate(()=>loadGame().xp)===xpOnce, 'recarregar a página não dá XP de novo');
  ok(await p.evaluate(async()=>{ const ex = {question:'2 + 2 = ?', answer:4, type:'single'}; await recordAnswer('adicao', true, {difficulty:'facil', ex}); const x1 = loadGame().xp; await recordAnswer('adicao', true, {difficulty:'facil', ex}); return loadGame().xp===x1; }), 'mesma questão reenviada logo em seguida: não duplica');

  // ---------- TRANSAÇÃO: falha de gravação não deixa nada pela metade ----------
  const t = await p.evaluate(async()=>{
    const uid = currentUserId(), K = getUserStorageKeys(uid).fixed;
    const before = {p:storage.getRaw(K.progress), g:storage.getRaw(K.game), h:storage.getRaw(K.history), e:storage.getRaw(K.errors)};
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v){ if(k===K.history) throw new DOMException('cheio', 'QuotaExceededError'); return real.call(this, k, v); };
    const res = await recordAnswer('adicao', false, {difficulty:'facil', ex:{question:'5 + 5 = ?', answer:10, type:'single'}});
    Storage.prototype.setItem = real;
    const after = {p:storage.getRaw(K.progress), g:storage.getRaw(K.game), h:storage.getRaw(K.history), e:storage.getRaw(K.errors)};
    const notice = document.getElementById('store-fail');
    return {ok:res.ok, same: JSON.stringify(before)===JSON.stringify(after), notice: notice ? notice.textContent : '', memAtt: progressSync().adicao.attempted, diskAtt: JSON.parse(after.p).adicao.attempted};
  });
  ok(t.ok===false && t.same, 'aparelho sem espaço no meio de uma resposta: nada é gravado pela metade (progresso, XP, histórico e erros iguais a antes)');
  ok(/Não conseguimos salvar seu progresso/.test(t.notice), 'e aparece o aviso amigável: "'+t.notice.replace('✕','').trim()+'"');
  ok(t.memAtt===t.diskAtt, 'a memória do app volta a bater com o que está gravado');
  await p.evaluate(()=>{ const n = document.getElementById('store-fail'); if(n) n.remove(); });

  // ---------- CADERNO DE ERROS ----------
  const e = await p.evaluate(async()=>{
    const ex = {question:'7 × 8 = ?', answer:56, type:'single'};
    for(let i=0;i<3;i++) await recordAnswer('multiplicacao', false, {difficulty:'facil', ex:JSON.parse(JSON.stringify(ex))});
    const list = (await loadErrors()).filter(x=>x.ex && x.ex.question==='7 × 8 = ?');
    return {n:list.length, count:list[0].count, first:list[0].firstTs, box:list[0].box, id:list[0].id};
  });
  ok(e.n===1 && e.count===3 && e.first && e.box===1, 'mesmo erro 3 vezes: 1 registro, contador 3, data guardada, caixa 1');
  const boxes = await p.evaluate(async id=>{
    const out = [];
    for(let i=0;i<3;i++){ out.push(await reviewErrorResult(id, true)); const x = (await loadErrors()).find(y=>y.id===id); out.push(x ? x.box + ':' + Math.round((x.due-Date.now())/864e5) : 'saiu'); }
    return out.join(' ');
  }, e.id);
  ok(boxes==='up 2:3 up 3:7 learned saiu', 'revisão: acerto → caixa 2 (3 dias) → caixa 3 (7 dias) → sai do caderno: '+boxes);
  ok(await p.evaluate(()=>loadGame().recovered[0].q==='7 × 8 = ?'), 'questão que saiu vira "conteúdo recuperado"');
  await p.evaluate(async()=>{ await recordAnswer('divisao', false, {difficulty:'facil', ex:{question:'9 ÷ 3 = ?', answer:3, type:'single'}}); const x = (await loadErrors())[0]; await reviewErrorResult(x.id, false); });
  await p.reload(); await W(900); await clean();
  ok(await p.evaluate(async()=>{ const x = (await loadErrors()).find(y=>y.ex.question==='9 ÷ 3 = ?'); return x && x.box===1 && x.count===2 && x.due > Date.now(); }), 'errou na revisão: volta para a caixa 1 (amanhã) e o estado sobrevive ao recarregar');

  // ---------- BACKUP ----------
  const bk = await p.evaluate(async()=>{
    const payload = await buildBackupPayload();
    const snap = JSON.stringify({p:progressSync(), n:notesIndex().length, xp:loadGame().xp});
    // backups inválidos: nenhum pode mudar nada
    const bad = [
      {progress:{fracoes:{attempted:'muito', correct:1}}},
      {history:[{sem:'assunto'}]},
      {errors:'isso não é lista'},
      {backupVersion:99, progress:{}},
      {notes:{index:[{id:1}]}, game:{xp:5}},
      {game:{xp:-3}},
      {qualquer:'coisa'},
      null,
    ];
    const results = [];
    for(const d of bad) results.push(await restoreBackupData(d));
    const unchanged = JSON.stringify({p:progressSync(), n:notesIndex().length, xp:loadGame().xp})===snap;
    // restauração válida: apaga e restaura
    await resetCurrentUserProgress();
    const zero = (await loadHistory()).length;
    const good = await restoreBackupData(JSON.parse(JSON.stringify(payload)));
    const back = JSON.stringify({p:progressSync(), n:notesIndex().length, xp:loadGame().xp})===snap;
    // backup antigo (sem backupVersion, sem ptrain) continua aceito
    const old = JSON.parse(JSON.stringify(payload)); delete old.backupVersion; delete old.ptrain;
    const oldRes = await restoreBackupData(old);
    // falha de gravação no meio da restauração: dados continuam os de antes
    const K = getUserStorageKeys(currentUserId()).fixed, real = Storage.prototype.setItem;
    const before = storage.getRaw(K.progress);
    Storage.prototype.setItem = function(k, v){ if(k===K.game) throw new DOMException('cheio', 'QuotaExceededError'); return real.call(this, k, v); };
    const mod = JSON.parse(JSON.stringify(payload)); mod.progress = {adicao:{attempted:1, correct:1}};
    const failRes = await restoreBackupData(mod);
    Storage.prototype.setItem = real;
    return {version:payload.backupVersion, allRejected:results.every(r=>!r.ok), msgs:results.map(r=>r.error), unchanged, zero, good:good.ok, back, old:oldRes.ok, failRes:failRes.ok, stillBefore: storage.getRaw(K.progress)===before};
  });
  ok(bk.version===1, 'backup exportado tem backupVersion: 1');
  ok(bk.allRejected && bk.unchanged, '8 backups inválidos recusados sem mudar nada (números errados, sem assunto, versão futura, notas estragadas, XP negativo, arquivo vazio)');
  ok(bk.msgs.every(m=>/Seus dados atuais não foram alterados/.test(m)), 'mensagem clara ao recusar: "'+bk.msgs[0]+'"');
  ok(bk.zero===0 && bk.good && bk.back, 'resetar e restaurar o backup traz tudo de volta (progresso, anotações, XP)');
  ok(bk.old, 'backup de versão anterior (sem backupVersion) continua aceito');
  ok(bk.failRes===false && bk.stillBefore, 'falha de gravação no meio da restauração: os dados atuais continuam intactos');
  await p.evaluate(()=>{ const n = document.getElementById('store-fail'); if(n) n.remove(); });

  // ---------- RESET ----------
  const rs = await p.evaluate(async()=>{ const notes = notesIndex().length; const ok = await resetCurrentUserProgress(); return {ok, h:(await loadHistory()).length, e:(await loadErrors()).length, xp:loadGame().xp, notes:notesIndex().length, notesBefore:notes, name:currentUser.name}; });
  ok(rs.ok && rs.h===0 && rs.e===0 && rs.xp===0 && rs.notes===rs.notesBefore && rs.name==='Teste 3', 'resetar progresso zera histórico, erros e XP, mas mantém conta e anotações');

  // ---------- DADO CORROMPIDO ----------
  const cr = await p.evaluate(async()=>{
    const K = getUserStorageKeys(currentUserId()).fixed;
    localStorage.setItem(K.history, '{isso não é json');
    dropUserCaches();
    const h = await loadHistory();
    return {len:h.length, copy: localStorage.getItem(K.history+':corrompido')};
  });
  ok(cr.len===0 && cr.copy==='{isso não é json', 'dado corrompido: o app abre e guarda uma cópia do original antes de qualquer gravação');
  await p.evaluate(()=>{ const n = document.getElementById('store-fail'); if(n) n.remove(); });

  console.log(`\n${n - fails}/${n} verificações OK | FALHAS: ${fails} | ERROS JS: ${jsErr.length ? jsErr.join(' / ') : 'nenhum'}`);
  await b.close();
  process.exit(fails || jsErr.length ? 1 : 0);
})();
