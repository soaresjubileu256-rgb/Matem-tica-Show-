/* =========================================================
   TABUADA — tela própria e o treino da tabuada
   ========================================================= */
/* ---------------- TABUADA (tela própria) ---------------- */
function tabuadaScreen(){
  const wrap = document.createElement('div');
  wrap.appendChild(topbar('Tabuada', true, ()=>go('exercisesSubjects')));
  wrap.appendChild(buildTabuadaSection());
  return wrap;
}

/* ---------------- TABUADA (tela inicial) ---------------- */
function buildTabuadaSection(){
  const section = h(`
    <section class="block tabuada-block">
      <h3>Tabuada</h3>
      <div class="card tabuada-card">
        <div class="tabuada-chips" id="tabuadaChips"></div>
        <div class="tabuada-list" id="tabuadaList"></div>
      </div>
    </section>`);
  const chipsWrap = section.querySelector('#tabuadaChips');
  const list = section.querySelector('#tabuadaList');
  let current = 1;

  for(let n=1;n<=10;n++){
    const chip = h(`<button class="tabuada-chip">${n}</button>`);
    chip.onclick = ()=> selectN(n);
    chipsWrap.appendChild(chip);
  }

  function selectN(n){
    current = n;
    chipsWrap.querySelectorAll('.tabuada-chip').forEach((c,idx)=>{
      c.classList.toggle('active', idx+1===n);
    });
    list.innerHTML = '';
    for(let k=1;k<=10;k++){
      list.appendChild(h(`
        <div class="tabuada-row">
          <span>${n} <span class="eq">×</span> ${k} <span class="eq">=</span></span>
          <span class="res">${n*k}</span>
        </div>`));
    }
  }

  selectN(1);
  return section;
}
