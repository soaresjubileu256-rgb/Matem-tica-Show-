/* =========================================================
   TELA CONFIGURAÇÕES
      Em ordem: Conta → Estudo → Som e vibração → Aparência → Leitura → Dados.
   ========================================================= */
async function settingsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Configurações', true, ()=>go('profile')));
  const c = h(`<div class="content"></div>`);

  const settings = await loadSettings();

  // ---- ordem: Conta → Estudo → Som e vibração → Aparência → Leitura → Dados ----
  // --- Conta ---
  c.appendChild(h(`<section class="block"><h3>Conta</h3></section>`));
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
  // volume dos sons (só faz diferença com os sons ligados)
  const volRow = h(`<div class="diff-row vol-row"><span class="vol-l">🔈 Volume</span></div>`);
  [['baixo','Baixo'],['medio','Médio'],['alto','Alto']].forEach(([id,label])=>{
    const chip = h(`<button type="button" class="diff-chip">${label}</button>`);
    if((settings.volume||'medio')===id) chip.classList.add('active');
    chip.onclick = async ()=>{
      settings.volume = id; if(!settings.sound){ settings.sound = true; soundToggle.classList.add('active'); }
      await saveSettings();
      volRow.querySelectorAll('.diff-chip').forEach(ch=>ch.classList.remove('active')); chip.classList.add('active');
      playFeedbackSound(true);
    };
    volRow.appendChild(chip);
  });
  c.appendChild(volRow);

  const vibToggle = h(`<button type="button" class="weak-toggle"><span class="check">✓</span><span>Vibração ao responder</span></button>`);
  if(settings.vibration) vibToggle.classList.add('active');
  vibToggle.onclick = async ()=>{
    settings.vibration = !settings.vibration;
    await saveSettings();
    vibToggle.classList.toggle('active', settings.vibration);
    if(settings.vibration) playFeedbackVibration(true);
  };
  c.appendChild(vibToggle);

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
