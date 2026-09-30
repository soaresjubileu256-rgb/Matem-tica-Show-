/* =========================================================
   TELAS: PERFIL, CONFIGURAÇÕES E HISTÓRICO
   ========================================================= */
/* ---------------- PROGRESS ---------------- */
/* ---------------- PROFILE ---------------- */
async function profileScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Perfil', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);

  const name = (currentUser && currentUser.name) ? currentUser.name : '';
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  c.appendChild(h(`
    <div class="profile-card">
      <div class="profile-avatar">${escHTML(initial)}</div>
      <div class="profile-name">${escHTML(name)}</div>
      <div class="profile-sub">Nível ${levelInfo(loadGame().xp).level} · ${levelInfo(loadGame().xp).title}</div>
    </div>`));

  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0, mastered=0;
  ids.forEach(id=>{
    totalAttempted += p[id].attempted; totalCorrect += p[id].correct;
    const acc = p[id].attempted? (p[id].correct/p[id].attempted*100) : 0;
    if(masteryOf(p[id]).lvl>=3) mastered++;
  });
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;
  const errs = await loadErrors();

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${mastered}</div><div class="lbl">Assuntos proficientes ou dominados</div></div>`));
  c.appendChild(grid);

  // menu em lista (antes era uma fileira de botões que ficava mais larga que a tela
  // e deixava a página dar zoom / arrastar pro lado)
  const menu = h(`<div class="profile-menu"></div>`);
  const item = (ico, label, sub, fn, cls)=>{
    const b = h(`<button type="button" class="pm-item ${cls||''}"><span class="pm-ico">${ico}</span><span class="pm-txt"><span class="pm-l"></span>${sub?`<span class="pm-s"></span>`:''}</span><span class="pm-chev">›</span></button>`);
    b.querySelector('.pm-l').textContent = label;
    if(sub) b.querySelector('.pm-s').textContent = sub;
    b.onclick = fn;
    menu.appendChild(b);
  };
  const group = t=> menu.appendChild(h(`<div class="pm-group">${t}</div>`));
  group('Seu progresso');
  item('📊', 'Ver progresso detalhado', 'Acertos por assunto e histórico', ()=> go('progress'));
  item('🔁', 'Caderno de erros', errs.length ? `${errs.length} questão(ões) guardada(s) · ${errs.filter(e=>errorIsDue(e)).length} pra hoje` : 'As questões que você errar aparecem aqui', ()=> go('errors'));
  item('⚔️', 'Arena', `⭐ ${arenaTotalStars()} estrelas · Desafio do Dia, simulados e fases`, ()=> go('arena'));
  item('🧭', 'Teste de nivelamento', studyData().placement ? `Último: ${studyData().placement.ok}/${studyData().placement.n}` : 'Descubra por onde começar', ()=> startPlacement());
  item('🗺️', 'Plano de estudos', studyData().plan ? `Prova em ${studyData().plan.examDate.split('-').reverse().join('/')}` : 'Monte um plano até o dia da prova', ()=> go('plan'));
  item('🏅', 'Conquistas', 'Suas medalhas e títulos', ()=> go('achievements'));
  item('📜', 'Certificados', 'Episódios da trilha concluídos', ()=> go('certificates'));
  item('📝', 'Relatório semanal', 'Resumo pra pais e professores', ()=> go('report'));
  group('Ferramentas');
  item('✏️', 'Caderno', 'Suas anotações escritas à mão', ()=> go('notebook'));
  group('Ajuda e conta');
  item('📘', 'Como usar o app', 'Guia e tour guiado', ()=> go('help'));
  item('⚙️', 'Configurações', 'Tema, som, meta, senha e backup', ()=> go('settings'));
  item('🚪', 'Sair da conta', '', ()=> showConfirm({
    icon:'🚪', title:'Sair da conta?', message:'Seu progresso continua salvo neste aparelho. É só entrar de novo com seu nome e senha.',
    ok:'Sair da conta', cancel:'Cancelar', danger:true,
  }).then(ok=>{ if(ok) doLogout(); }), 'danger');
  c.appendChild(menu);

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- CONFIGURAÇÕES ---------------- */
async function settingsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Configurações', true, ()=>go('profile')));
  const c = h(`<div class="content"></div>`);

  const settings = await loadSettings();

  // --- Aparência ---
  c.appendChild(h(`<section class="block"><h3>Aparência</h3></section>`));
  const themeRow = h(`<div class="diff-row"></div>`);
  [['dark','🌙 Escuro'],['light','☀️ Claro']].forEach(([id,label])=>{
    const chip = h(`<button type="button" class="diff-chip">${label}</button>`);
    if(settings.theme===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.theme = id;
      await saveSettings();
      applyTheme(id);
      themeRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    themeRow.appendChild(chip);
  });
  c.appendChild(themeRow);

  // --- Acessibilidade ---
  c.appendChild(h(`<section class="block"><h3>Leitura e acessibilidade</h3></section>`));
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:-6px 0 8px;">Tamanho do texto das questões e explicações</p>`));
  const scaleRow = h(`<div class="diff-row"></div>`);
  [['normal','A'],['grande','A+'],['enorme','A++']].forEach(([id,label],i)=>{
    const chip = h(`<button type="button" class="diff-chip" style="font-size:${13+i*3}px" aria-label="Texto ${id}">${label}</button>`);
    if((settings.textScale||'normal')===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.textScale = id; await saveSettings(); applyTextScale(id);
      scaleRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active')); chip.classList.add('active');
    };
    scaleRow.appendChild(chip);
  });
  c.appendChild(scaleRow);
  if('speechSynthesis' in window){
    const ttsToggle = h(`<button type="button" class="weak-toggle ${settings.tts!==false?'active':''}"><span class="check">✓</span><span>🔊 Botão de ouvir as questões em voz alta</span></button>`);
    ttsToggle.onclick = async ()=>{
      settings.tts = settings.tts===false; await saveSettings();
      ttsToggle.classList.toggle('active', settings.tts);
      if(settings.tts) speak('Pronto! Agora você pode ouvir as questões.');
    };
    c.appendChild(ttsToggle);
  }

  // --- Som e vibração ---
  c.appendChild(h(`<section class="block"><h3>Som e vibração</h3></section>`));
  const soundToggle = h(`<button type="button" class="weak-toggle"><span class="check">✓</span><span>Sons ao responder</span></button>`);
  if(settings.sound) soundToggle.classList.add('active');
  soundToggle.onclick = async ()=>{
    settings.sound = !settings.sound;
    await saveSettings();
    soundToggle.classList.toggle('active', settings.sound);
    if(settings.sound) playFeedbackSound(true);
  };
  c.appendChild(soundToggle);

  const vibToggle = h(`<button type="button" class="weak-toggle"><span class="check">✓</span><span>Vibração ao responder</span></button>`);
  if(settings.vibration) vibToggle.classList.add('active');
  vibToggle.onclick = async ()=>{
    settings.vibration = !settings.vibration;
    await saveSettings();
    vibToggle.classList.toggle('active', settings.vibration);
    if(settings.vibration) playFeedbackVibration(true);
  };
  c.appendChild(vibToggle);

  // --- Estudo ---
  c.appendChild(h(`<section class="block"><h3>Estudo</h3></section>`));
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:-6px 0 8px;">Meta diária de questões</p>`));
  const goalRow = h(`<div class="diff-row"></div>`);
  [5,10,15,20,30].forEach(n=>{
    const chip = h(`<button type="button" class="diff-chip">${n}</button>`);
    if(settings.dailyGoal===n) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.dailyGoal = n;
      await saveSettings();
      goalRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    goalRow.appendChild(chip);
  });
  c.appendChild(goalRow);

  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:12.5px; margin:14px 0 8px;">Nível escolar</p>`));
  const levelRow = h(`<div class="diff-row" style="flex-wrap:wrap;"></div>`);
  [['fund1','Fundamental 1'],['fund2','Fundamental 2'],['medio','Ensino Médio']].forEach(([id,label])=>{
    const chip = h(`<button type="button" class="diff-chip" style="flex:1 1 30%;">${label}</button>`);
    if(settings.schoolLevel===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.schoolLevel = id;
      await saveSettings();
      levelRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
    };
    levelRow.appendChild(chip);
  });
  c.appendChild(levelRow);

  // --- Conta ---
  c.appendChild(h(`<section class="block" style="margin-top:22px"><h3>Conta</h3></section>`));
  const nameBox = h(`<div class="auth-field"><label>Nome</label><input type="text" class="settingsNameInput" aria-label="Nome" value="${escHTML((currentUser&&currentUser.name)||'')}"></div>`);
  c.appendChild(nameBox);
  const nameErrBox = h(`<div class="authErrorBox"></div>`);
  c.appendChild(nameErrBox);
  const saveNameBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:20px;">Salvar nome</button>`);
  saveNameBtn.onclick = async ()=>{
    const newName = nameBox.querySelector('.settingsNameInput').value;
    const res = await renameCurrentUser(newName);
    if(!res.ok){ nameErrBox.innerHTML = `<div class="auth-error">${res.error}</div>`; return; }
    nameErrBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Nome atualizado!</div>`;
  };
  c.appendChild(saveNameBtn);

  c.appendChild(h(`<div class="auth-field"><label>Senha atual</label><input type="password" class="settingsCurPass" aria-label="Senha atual"></div>`));
  const newPassField = h(`<div class="auth-field"><label>Nova senha</label><input type="password" class="settingsNewPass" autocomplete="new-password" aria-label="Nova senha"></div>`);
  const newPassMeter = attachStrengthMeter(newPassField.querySelector('input'), ()=> currentUser ? currentUser.name : '');
  newPassField.appendChild(newPassMeter);
  c.appendChild(newPassField);
  c.appendChild(h(`<div class="auth-field"><label>Confirmar nova senha</label><input type="password" class="settingsNewPass2" aria-label="Confirmar nova senha"></div>`));
  const passErrBox = h(`<div class="authErrorBox"></div>`);
  c.appendChild(passErrBox);
  const savePassBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:20px;">Alterar senha</button>`);
  savePassBtn.onclick = async ()=>{
    const cur = c.querySelector('.settingsCurPass').value;
    const n1 = c.querySelector('.settingsNewPass').value;
    const n2 = c.querySelector('.settingsNewPass2').value;
    if(!cur || !n1){ passErrBox.innerHTML = `<div class="auth-error">Preencha todos os campos.</div>`; return; }
    if(n1 !== n2){ passErrBox.innerHTML = `<div class="auth-error">As novas senhas não coincidem.</div>`; return; }
    const res = await changeCurrentUserPassword(cur, n1);
    if(!res.ok){ passErrBox.innerHTML = `<div class="auth-error">${res.error}</div>`; return; }
    c.querySelector('.settingsCurPass').value = '';
    c.querySelector('.settingsNewPass').value = '';
    c.querySelector('.settingsNewPass2').value = '';
    newPassMeter.refresh();
    passErrBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Senha alterada!</div>`;
  };
  c.appendChild(savePassBtn);

  // --- Dados ---
  c.appendChild(h(`<section class="block"><h3>Dados</h3></section>`));
  const exportBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:10px;">Exportar progresso</button>`);
  exportBtn.onclick = async ()=>{
    const ok = await exportProgressData();
    exportBtn.textContent = ok ? 'Exportado! ✓' : 'Não foi possível exportar';
    setTimeout(()=>{ exportBtn.textContent = 'Exportar progresso'; }, 2500);
  };
  c.appendChild(exportBtn);

  const importInput = h(`<input type="file" accept="application/json,.json" style="display:none">`);
  c.appendChild(importInput);
  const importBtn = h(`<button class="btn secondary" style="width:100%;margin-bottom:10px;">Importar progresso</button>`);
  const importMsgBox = h(`<div class="authErrorBox"></div>`);
  importBtn.onclick = ()=> importInput.click();
  importInput.onchange = async ()=>{
    const file = importInput.files[0];
    importInput.value = '';
    if(!file) return;
    const ok = await showConfirm({icon:'📥', title:'Importar progresso?', message:'Isso vai substituir seu progresso, histórico e configurações atuais pelos dados desse arquivo.', ok:'Importar', cancel:'Cancelar', danger:true});
    if(!ok) return;
    const res = await importProgressData(file);
    if(!res.ok){
      importMsgBox.innerHTML = `<div class="auth-error">${res.error}</div>`;
    } else {
      importMsgBox.innerHTML = `<div class="auth-error" style="color:var(--pine);border-color:rgba(51,210,227,.3);background:rgba(51,210,227,.08);">Progresso importado! Atualizando…</div>`;
      setTimeout(()=>{ if(state.screen==='settings') go('profile'); }, 900); // só se a pessoa ainda estiver aqui
    }
  };
  c.appendChild(importBtn);
  c.appendChild(importMsgBox);

  const resetBtn = h(`<button class="btn secondary" style="width:100%; border-color:rgba(255,92,122,.3); color:var(--coral-deep, #FF5C7A);">Resetar progresso</button>`);
  let confirmingReset = false;
  resetBtn.onclick = async ()=>{
    if(!confirmingReset){
      confirmingReset = true;
      resetBtn.textContent = 'Tem certeza? Toque de novo pra confirmar';
      return;
    }
    await resetCurrentUserProgress();
    resetBtn.textContent = 'Progresso resetado ✓';
    resetBtn.disabled = true;
  };
  c.appendChild(resetBtn);

  wrap.appendChild(c);
  return wrap;
}

async function progressScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Meu progresso', true, ()=>go('home')));
  const c = h(`<div class="content"></div>`);
  const p = await loadProgress();
  const ids = Object.keys(p);
  let totalAttempted=0, totalCorrect=0;
  ids.forEach(id=>{ totalAttempted += p[id].attempted; totalCorrect += p[id].correct; });
  const totalWrong = totalAttempted-totalCorrect;
  const pct = totalAttempted? Math.round(totalCorrect/totalAttempted*100) : 0;

  const grid = h(`<div class="stat-grid"></div>`);
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalAttempted}</div><div class="lbl">Questões resolvidas</div></div>`));
  grid.appendChild(h(`<div class="stat-card acc"><div class="num">${pct}%</div><div class="lbl">Acerto geral</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalCorrect}</div><div class="lbl">Acertos</div></div>`));
  grid.appendChild(h(`<div class="stat-card"><div class="num">${totalWrong}</div><div class="lbl">Erros</div></div>`));
  c.appendChild(grid);
  const reportBtn = h(`<button type="button" class="alert-banner" style="margin:0 0 16px"><span class="sym">📝</span><span class="txt"><span class="title">Relatório semanal</span><span class="sub">Resumo dos últimos 7 dias pra pais e professores</span></span><span class="chev">›</span></button>`);
  reportBtn.onclick = ()=> go('report');
  c.appendChild(reportBtn);

  c.appendChild(h(`<section class="block"><h3>Assuntos praticados</h3></section>`));
  if(ids.length===0){
    c.appendChild(h(`<div class="empty-note">Você ainda não praticou nenhum exercício.<br>Vá em "Exercícios" para começar! 🚀</div>`));
  } else {
    ids.forEach(id=>{
      const s = SUBJECTS.find(x=>x.id===id);
      if(!s) return;
      const d = p[id];
      const acc = d.attempted? Math.round(d.correct/d.attempted*100) : 0;
      const mst = masteryOf(d);
      const barCls = acc>=80? '' : acc>=50? 'mid':'low';
      const row = h(`
        <div class="mastery-row">
          <div class="top">
            <span class="name">${s.sym} &nbsp;${s.name} ${masteryChip(mst)}</span>
            <span class="pct">${acc}%</span>
          </div>
          <div class="bar-track"><div class="bar-fill ${barCls}" style="width:${acc}%"></div></div>
        </div>`);
      c.appendChild(row);
    });
  }

  if(totalAttempted>0){
    const histBtn = h(`<button class="btn secondary" style="margin-top:6px;width:100%;">Ver histórico de questões respondidas</button>`);
    histBtn.onclick = ()=> go('history');
    c.appendChild(histBtn);
  }

  wrap.appendChild(c);
  return wrap;
}

/* ---------------- HISTÓRICO DE QUESTÕES RESPONDIDAS ---------------- */
function formatHistoryDate(ts){
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const sameDay = d.toDateString() === now.toDateString();
  if(sameDay) return `Hoje, ${time}`;
  const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
  if(d.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
  return `${d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}, ${time}`;
}
function historyQuestionText(ex){
  if(!ex) return '';
  if(ex.question) return ex.question.replace(/\n/g,' ');
  return ''; // questões em formato visual (conta armada, fração, etc.) não têm um texto plano curto
}
async function historyScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Histórico', true, ()=>go('progress')));
  const c = h(`<div class="content"></div>`);

  const hist = await loadHistory();
  if(!hist.length){
    c.appendChild(h(`<div class="empty-note">Você ainda não respondeu nenhuma questão.<br>Assim que praticar, suas respostas aparecem aqui. 📝</div>`));
    wrap.appendChild(c);
    return wrap;
  }

  const totalCorrect = hist.filter(e=>e.correct).length;
  const pct = Math.round(totalCorrect/hist.length*100);
  c.appendChild(h(`<p style="color:var(--ink-soft); font-size:13.5px; margin:2px 0 16px;">${hist.length} questões respondidas (últimas ${HISTORY_LIMIT}) · ${pct}% de acerto</p>`));

  const list = h(`<div class="history-list"></div>`);
  c.appendChild(list);
  const moreBtn = h(`<button class="btn secondary" style="margin-top:4px;width:100%;">Ver mais</button>`);
  c.appendChild(moreBtn);

  const PAGE = 30;
  let shown = 0;
  const diffLabels = {facil:'Fácil', medio:'Médio', dificil:'Difícil'};
  function renderPage(){
    hist.slice(shown, shown+PAGE).forEach(entry=>{
      const qtxt = historyQuestionText(entry.ex);
      const row = h(`
        <div class="history-row ${entry.correct?'ok':'bad'}">
          <div class="history-icon">${entry.correct? '✓':'✕'}</div>
          <div class="history-info">
            <div class="history-top">
              <span class="subj">${entry.subjectName}</span>
              ${entry.difficulty? `<span class="diff">${diffLabels[entry.difficulty]||entry.difficulty}</span>`:''}
              ${entry.review? `<span class="diff">Revisão</span>`:''}
            </div>
            ${qtxt? `<div class="history-q">${qtxt}</div>` : ''}
            <div class="history-date">${formatHistoryDate(entry.ts)}</div>
          </div>
        </div>`);
      list.appendChild(row);
    });
    shown += Math.min(PAGE, hist.length-shown);
    moreBtn.style.display = shown < hist.length ? '' : 'none';
  }
  moreBtn.onclick = renderPage;
  renderPage();

  wrap.appendChild(c);
  return wrap;
}
