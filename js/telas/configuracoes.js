/* =========================================================
   TELA CONFIGURAÇÕES
      Cartões em ordem: Conta → Estudo → Som e vibração → Aparência → Leitura → Dados.
      Tudo é salvo na hora (por conta), sem botão de "salvar" geral.
   ========================================================= */
/* peças da tela: cartão de seção, linha com ícone, chave liga/desliga e botões segmentados */
function stCard(ico, title, sub){
  return h(`<section class="st-card"><div class="st-card-h"><span class="st-card-ico">${ico}</span><div><b>${title}</b>${sub?`<small>${sub}</small>`:''}</div></div></section>`);
}
function stRow(ico, tint, label, sub, right){
  const r = h(`<div class="st-row"><span class="st-ico" style="--t:${tint}">${ico}</span><span class="st-txt"><b></b>${sub!=null?'<small></small>':''}</span><span class="st-right"></span></div>`);
  r.querySelector('b').textContent = label;
  if(sub!=null) r.querySelector('small').textContent = sub;
  if(right) r.querySelector('.st-right').appendChild(right);
  return r;
}
function stSwitch(on, label, onChange){
  const b = h(`<button type="button" class="st-switch" role="switch" aria-checked="${!!on}" aria-label="${label}"><i></i></button>`);
  b.onclick = ()=>{ const v = b.getAttribute('aria-checked')!=='true'; b.setAttribute('aria-checked', v); onChange(v); };
  return b;
}
function stSeg(opts, cur, onPick, cls){
  const s = h(`<div class="st-seg ${cls||''}" role="radiogroup"></div>`);
  opts.forEach(([id, label, extra])=>{
    const b = h(`<button type="button" role="radio" aria-checked="${id===cur}" ${extra||''}>${label}</button>`);
    b.onclick = ()=>{ s.querySelectorAll('button').forEach(x=> x.setAttribute('aria-checked', x===b)); onPick(id); };
    s.appendChild(b);
  });
  return s;
}
function stMsg(box, ok, txt){ box.innerHTML = `<div class="st-msg ${ok?'ok':'bad'}">${ok?'✓':'⚠️'} ${txt}</div>`; }

async function settingsScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('⚙️ Configurações', true, ()=>go('profile')));
  const c = h(`<div class="content st-screen"></div>`);
  const settings = await loadSettings();
  const saveNow = async ()=>{ await saveSettings(); };

  // topo: quem está usando e um resumo das escolhas
  const sum = ()=> `${settings.theme==='light'?'☀️ Claro':'🌙 Escuro'} · ${settings.sound?'🔊 Som ligado':'🔇 Sem som'} · 🎯 Meta ${settings.dailyGoal}`;
  const hero = h(`<div class="st-hero"><span class="st-av">${avatarFace(currentUser)}</span><div><b></b><small class="st-sum">${sum()}</small></div></div>`);
  const av = avatarOf(currentUser);
  hero.querySelector('.st-av').style.background = avatarColor(currentUser);
  hero.querySelector('.st-av').classList.add(avatarImg(av) ? 'is-img' : 'x');
  hero.querySelector('b').textContent = (currentUser && currentUser.name) || '';
  const refreshSum = ()=>{ hero.querySelector('.st-sum').textContent = sum(); };
  c.appendChild(hero);

  // ---------- Conta ----------
  const acc = stCard('👤', 'Conta', 'Nome e senha');
  const nameRow = stRow('✏️', '#4C7DFF', 'Nome', (currentUser&&currentUser.name)||'', h(`<button type="button" class="st-link">Editar</button>`));
  const namePanel = h(`<div class="st-panel" hidden>
      <div class="auth-field"><label>Novo nome</label><input type="text" class="settingsNameInput" aria-label="Nome" maxlength="40"></div>
      <div class="authErrorBox"></div>
      <button type="button" class="st-btn">Salvar nome</button></div>`);
  namePanel.querySelector('input').value = (currentUser&&currentUser.name)||'';
  nameRow.querySelector('.st-link').onclick = ()=>{ namePanel.hidden = !namePanel.hidden; if(!namePanel.hidden) namePanel.querySelector('input').focus(); };
  namePanel.querySelector('.st-btn').onclick = async ()=>{
    const box = namePanel.querySelector('.authErrorBox');
    const res = await renameCurrentUser(namePanel.querySelector('input').value);
    if(!res.ok){ stMsg(box, false, res.error); return; }
    stMsg(box, true, 'Nome atualizado!');
    nameRow.querySelector('small').textContent = currentUser.name;
    hero.querySelector('b').textContent = currentUser.name;
  };
  acc.appendChild(nameRow); acc.appendChild(namePanel);

  const passRow = stRow('🔑', '#12B886', 'Senha', 'Troque quando quiser', h(`<button type="button" class="st-link">Alterar</button>`));
  const passPanel = h(`<div class="st-panel" hidden>
      <div class="auth-field"><label>Senha atual</label><input type="password" class="settingsCurPass" aria-label="Senha atual" autocomplete="current-password"></div>
      <div class="auth-field st-newpass"><label>Nova senha</label><input type="password" class="settingsNewPass" autocomplete="new-password" aria-label="Nova senha"></div>
      <div class="auth-field"><label>Confirmar nova senha</label><input type="password" class="settingsNewPass2" aria-label="Confirmar nova senha" autocomplete="new-password"></div>
      <div class="authErrorBox"></div>
      <button type="button" class="st-btn">Alterar senha</button></div>`);
  const newPassMeter = attachStrengthMeter(passPanel.querySelector('.settingsNewPass'), ()=> currentUser ? currentUser.name : '');
  passPanel.querySelector('.st-newpass').appendChild(newPassMeter);
  passRow.querySelector('.st-link').onclick = ()=>{ passPanel.hidden = !passPanel.hidden; if(!passPanel.hidden) passPanel.querySelector('input').focus(); };
  passPanel.querySelector('.st-btn').onclick = async ()=>{
    const box = passPanel.querySelector('.authErrorBox');
    const cur = passPanel.querySelector('.settingsCurPass').value;
    const n1 = passPanel.querySelector('.settingsNewPass').value;
    const n2 = passPanel.querySelector('.settingsNewPass2').value;
    if(!cur || !n1){ stMsg(box, false, 'Preencha todos os campos.'); return; }
    if(n1 !== n2){ stMsg(box, false, 'As novas senhas não coincidem.'); return; }
    const res = await changeCurrentUserPassword(cur, n1);
    if(!res.ok){ stMsg(box, false, res.error); return; }
    passPanel.querySelectorAll('input').forEach(i=> i.value='');
    newPassMeter.refresh();
    stMsg(box, true, 'Senha alterada!');
  };
  acc.appendChild(passRow); acc.appendChild(passPanel);
  c.appendChild(acc);

  // ---------- Estudo ----------
  const st = stCard('🎯', 'Estudo', 'Sua meta e o seu nível na escola');
  const goalInfo = h(`<small class="st-hint"></small>`);
  const paintGoal = ()=>{ goalInfo.textContent = `≈ ${Math.max(3, Math.round(settings.dailyGoal*0.6))} minutos por dia · ${settings.dailyGoal} questões`; };
  st.appendChild(h(`<div class="st-lbl">Meta diária de questões</div>`));
  st.appendChild(stSeg([5,10,15,20,30].map(n=>[n, String(n)]), settings.dailyGoal, async n=>{ settings.dailyGoal = n; await saveNow(); paintGoal(); refreshSum(); }));
  paintGoal(); st.appendChild(goalInfo);
  st.appendChild(h(`<div class="st-lbl">Nível escolar</div>`));
  const lv = h(`<div class="st-levels" role="radiogroup"></div>`);
  [['fund1','📗','Fundamental 1','1º ao 5º ano'],['fund2','📘','Fundamental 2','6º ao 9º ano'],['medio','🎓','Ensino Médio','1ª à 3ª série']].forEach(([id,ico,name,sub])=>{
    const b = h(`<button type="button" role="radio" aria-checked="${settings.schoolLevel===id}"><span>${ico}</span><b>${name}</b><small>${sub}</small></button>`);
    b.onclick = async ()=>{ settings.schoolLevel = id; await saveNow(); lv.querySelectorAll('button').forEach(x=> x.setAttribute('aria-checked', x===b)); };
    lv.appendChild(b);
  });
  st.appendChild(lv);
  st.appendChild(h(`<small class="st-hint">Usado pra sugerir assuntos e o Desafio do Dia. Você pode estudar qualquer assunto.</small>`));
  c.appendChild(st);

  // ---------- Som e vibração ----------
  const snd = stCard('🔊', 'Som e vibração');
  const volWrap = h(`<div class="st-sub"></div>`);
  const paintVol = ()=> volWrap.classList.toggle('off', !settings.sound);
  const soundSw = stSwitch(settings.sound, 'Sons ao responder', async v=>{ settings.sound = v; await saveNow(); paintVol(); refreshSum(); if(v) playFeedbackSound(true); });
  snd.appendChild(stRow('🎵', '#FFB800', 'Sons ao responder', 'Acerto, erro, combos e conquistas', soundSw));
  volWrap.appendChild(h(`<div class="st-lbl">Volume</div>`));
  volWrap.appendChild(stSeg([['baixo','🔈 Baixo'],['medio','🔉 Médio'],['alto','🔊 Alto']], settings.volume||'medio', async id=>{
    settings.volume = id;
    if(!settings.sound){ settings.sound = true; soundSw.setAttribute('aria-checked', true); paintVol(); refreshSum(); }
    await saveNow(); playFeedbackSound(true);
  }));
  const test = h(`<button type="button" class="st-mini">▶ Testar som</button>`);
  test.onclick = ()=> playFeedbackSound(true);
  volWrap.appendChild(test);
  snd.appendChild(volWrap); paintVol();
  snd.appendChild(stRow('📳', '#F06595', 'Vibração ao responder', 'Funciona em celulares com vibração', stSwitch(settings.vibration, 'Vibração ao responder', async v=>{ settings.vibration = v; await saveNow(); if(v) playFeedbackVibration(true); })));
  c.appendChild(snd);

  // ---------- Aparência ----------
  const ap = stCard('🖌️', 'Aparência');
  const th = h(`<div class="st-themes" role="radiogroup"></div>`);
  [['dark','🌙 Escuro'],['light','☀️ Claro']].forEach(([id,label])=>{
    const b = h(`<button type="button" role="radio" class="st-theme t-${id}" aria-checked="${settings.theme===id}">
      <span class="st-mock"><i class="m-bar"></i><i class="m-card"></i><i class="m-row"></i><i class="m-row s"></i><i class="m-btn"></i></span><b>${label}</b></button>`);
    b.onclick = async ()=>{ settings.theme = id; await saveNow(); applyTheme(id); th.querySelectorAll('button').forEach(x=> x.setAttribute('aria-checked', x===b)); refreshSum(); };
    th.appendChild(b);
  });
  ap.appendChild(th);
  c.appendChild(ap);

  // ---------- Leitura e acessibilidade ----------
  const rd = stCard('👓', 'Leitura e acessibilidade');
  rd.appendChild(h(`<div class="st-lbl">Tamanho do texto das questões e explicações</div>`));
  const sample = h(`<div class="st-sample"><small>Exemplo</small><p>Quanto é <b>3/4 + 1/8</b>? Some as frações com o mesmo denominador.</p></div>`);
  const paintSample = ()=>{ sample.querySelector('p').style.fontSize = `${15*(TEXT_SCALES[settings.textScale||'normal']||1)}px`; };
  rd.appendChild(stSeg([['normal','A','style="font-size:14px"'],['grande','A+','style="font-size:17px"'],['enorme','A++','style="font-size:20px"']], settings.textScale||'normal', async id=>{
    settings.textScale = id; await saveNow(); applyTextScale(id); paintSample();
  }, 'big'));
  rd.appendChild(sample); paintSample();
  if('speechSynthesis' in window){
    rd.appendChild(stRow('🗣️', '#33D2E3', 'Ouvir as questões', 'Mostra o botão 🔊 pra ler em voz alta', stSwitch(settings.tts!==false, 'Ouvir as questões em voz alta', async v=>{
      settings.tts = v; await saveNow();
      if(v) speak('Pronto! Agora você pode ouvir as questões.');
    })));
  }
  c.appendChild(rd);

  // ---------- Dados ----------
  const dt = stCard('💾', 'Seus dados', 'Tudo fica salvo só neste aparelho');
  const bi = backupInfo();
  const lastTxt = ()=>{ const l = backupInfo().last; return l ? `Última cópia: ${new Date(l).toLocaleDateString('pt-BR')}` : 'Você ainda não salvou nenhuma cópia'; };
  const bkInfo = h(`<div class="st-backup ${bi.last && Date.now()-bi.last < 14*864e5 ? 'ok' : 'warn'}"><span>${bi.last ? '✅' : '⚠️'}</span><small>${lastTxt()}. Se limpar o navegador ou trocar de celular, só a cópia traz o progresso de volta.</small></div>`);
  dt.appendChild(bkInfo);
  const exportBtn = h(`<button type="button" class="st-act"><span>📤</span><b>Salvar uma cópia</b><small>Baixa um arquivo com todo o seu progresso</small></button>`);
  exportBtn.onclick = async ()=>{
    const ok = await exportProgressData();
    exportBtn.querySelector('b').textContent = ok ? 'Cópia salva! ✓' : 'Não foi possível salvar';
    if(ok){ bkInfo.className = 'st-backup ok'; bkInfo.querySelector('span').textContent = '✅'; bkInfo.querySelector('small').textContent = `${lastTxt()}. Guarde o arquivo num lugar seguro.`; }
    setTimeout(()=>{ exportBtn.querySelector('b').textContent = 'Salvar uma cópia'; }, 2500);
  };
  const importInput = h(`<input type="file" accept="application/json,.json" hidden>`);
  const importBtn = h(`<button type="button" class="st-act"><span>📥</span><b>Restaurar uma cópia</b><small>Abre um arquivo salvo antes</small></button>`);
  const importMsgBox = h(`<div class="authErrorBox"></div>`);
  importBtn.onclick = ()=> importInput.click();
  importInput.onchange = async ()=>{
    const file = importInput.files[0];
    importInput.value = '';
    if(!file) return;
    const ok = await showConfirm({icon:'📥', title:'Restaurar a cópia?', message:'Isso vai substituir seu progresso, histórico e configurações atuais pelos dados desse arquivo.', ok:'Restaurar', cancel:'Cancelar', danger:true});
    if(!ok) return;
    const res = await importProgressData(file);
    if(!res.ok){ stMsg(importMsgBox, false, res.error); }
    else {
      stMsg(importMsgBox, true, 'Progresso restaurado! Atualizando…');
      setTimeout(()=>{ if(state.screen==='settings') go('profile'); }, 900); // só se a pessoa ainda estiver aqui
    }
  };
  const acts = h(`<div class="st-acts"></div>`);
  acts.appendChild(exportBtn); acts.appendChild(importBtn);
  dt.appendChild(acts); dt.appendChild(importInput); dt.appendChild(importMsgBox);
  c.appendChild(dt);

  // ---------- Zona de perigo ----------
  const dz = h(`<section class="st-card st-danger"><div class="st-card-h"><span class="st-card-ico">🧨</span><div><b>Começar do zero</b><small>Apaga questões, histórico, XP, conquistas e trilha desta conta. Seu nome, senha, avatar e configurações continuam.</small></div></div></section>`);
  const resetBtn = h(`<button type="button" class="st-reset">Apagar meu progresso</button>`);
  resetBtn.onclick = async ()=>{
    const ok = await showConfirm({icon:'🧨', title:'Apagar todo o progresso?', message:'Isso não dá pra desfazer. Se quiser guardar, salve uma cópia antes.', ok:'Apagar tudo', cancel:'Cancelar', danger:true});
    if(!ok) return;
    await resetCurrentUserProgress();
    resetBtn.textContent = 'Progresso apagado ✓';
    resetBtn.disabled = true;
  };
  dz.appendChild(resetBtn);
  c.appendChild(dz);
  c.appendChild(h(`<p class="pf-foot">🎬 Matemática Show · as mudanças são salvas na hora</p>`));

  wrap.appendChild(c);
  return wrap;
}
