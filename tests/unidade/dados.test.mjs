// Contas, armazenamento, backup e senhas — usando o código real do app num localStorage em memória.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { carregarApp, memoriaLocal, RAIZ, TODOS } from './carregar.mjs';

// objetos do sandbox têm outro protótipo: compara pelo conteúdo
const puro = x => JSON.parse(JSON.stringify(x));
function novoApp(opts){ const a = carregarApp(undefined, opts); a.avisos = []; a.$('showConfirm = (o)=>{ globalThis.__aviso && globalThis.__aviso(o); return Promise.resolve(false); }'); a.__aviso = o=> a.avisos.push(o.title); return a; }
async function criar(a, nome, senha='gato7lua9'){
  const id = a.$('userIdFromName')(nome);
  const list = await a.$('loadUsers')();
  list.push({id, name:nome, pw: await a.$('makePasswordRecord')(senha)});
  assert.ok(await a.$('saveUsers')(list));
  a.$(`currentUser = {id:${JSON.stringify(id)}, name:${JSON.stringify(nome)}}`);
  a.$('invalidateUserCaches()');
  return id;
}
/* coloca um pouco de cada tipo de dado na conta logada */
async function encher(a){
  const uid = a.$('currentUserId()');
  await a.$('recordAnswer')('fracoes', true, {difficulty:'medio'});
  await a.$('recordAnswer')('fracoes', false, {difficulty:'medio', ex:{type:'single', question:'1/2 + 1/4', answer:0.75, steps:['x']}});
  a.$('saveLearnData')({read:{fracoes:true}});
  a.$('saveTabData')({facts:{'7x8':{ok:3}}, best:{}});
  a.$('saveExb')({best:{fracoes:9}});
  a.$('saveChData')({best:{medio:120}, cfg:{}});
  const g = a.$('loadGame()'); g.xp = 345; a.$('saveGame()');
  a.$('newNotePage')({title:'Minha página', strokes:[[1,2,3]]});
  return uid;
}

test('registro de chaves: toda chave "por conta" usada no código está em USER_KEY_BASES', ()=>{
  const a = novoApp();
  const conhecidas = new Set([...a.$('ALL_USER_BASES'), a.$('NOTE_PAGE_BASE'), a.$('RESTORE_POINT_BASE')]);
  const src = TODOS.map(f=> fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n');
  const usadas = new Set();
  // constantes XXX_KEY_BASE = 'mathstudy-…' e chaves montadas como `mathstudy-…:${currentUserId()}`
  for(const m of src.matchAll(/_KEY_BASE\s*=\s*'(mathstudy-[\w-]+)'/g)) usadas.add(m[1]);
  for(const m of src.matchAll(/`(mathstudy-[\w-]+):\$\{currentUserId\(\)\}/g)) usadas.add(m[1]);
  const faltando = [...usadas].filter(b=> !conhecidas.has(b));
  assert.deepEqual(faltando, [], 'acrescente em USER_KEY_BASES (js/dados/armazenamento.js)');
});

test('renomear leva TODOS os dados da conta (antes ficavam caderno, tabuada, desafios…)', async ()=>{
  const a = novoApp();
  await criar(a, 'Ana');
  await encher(a);
  const antes = a.$('snapshotUser')('ana');
  const r = await a.$('renameCurrentUser')('Ana Paula');
  assert.ok(r.ok, r.error);
  assert.equal(a.$('userStorageKeys')('ana').length, 0, 'nada deve ficar no id antigo');
  const depois = a.$('snapshotUser')('ana paula');
  assert.deepEqual(depois, antes);
  assert.equal(a.$('loadGame()').xp, 345);
  assert.equal((await a.$('loadProgress')()).fracoes.attempted, 2);
});

test('nome com ":" é recusado (separa as chaves do armazenamento)', async ()=>{
  const a = novoApp();
  await criar(a, 'Bia');
  assert.equal((await a.$('renameCurrentUser')('bia:x')).ok, false);
  assert.ok(a.$('accountNameProblem')('ana:1'));
  assert.equal(a.$('accountNameProblem')('Ana Clara'), null);
});

test('backup formato 2: exporta e restaura TUDO; formato 1 (antigo) ainda é aceito', async ()=>{
  const a = novoApp();
  await criar(a, 'Caio'); await encher(a);
  const backup = {app:'matematica-show', formato:2, account:'Caio', conta: a.$('snapshotUser')('caio')};
  await a.$('resetCurrentUserProgress')();
  a.$('saveTabData')({facts:{}, best:{}});
  const r = await a.$('importProgressData')(JSON.parse(JSON.stringify(backup)));
  assert.ok(r.ok, r.error);
  assert.deepEqual(a.$('snapshotUser')('caio'), backup.conta);
  assert.equal(a.$('loadGame()').xp, 345);
  // formato 1 (sem "conta"): progresso e caderno vêm do arquivo; o resto que existe continua
  const v1 = {progress:{eq1:{attempted:4, correct:4}}, history:[], errors:[], settings:{theme:'light'}, game:{xp:10}, notes:{index:[{id:'p1', title:'Velha'}], pages:{p1:[[9]]}}};
  const r1 = await a.$('importProgressData')(v1);
  assert.ok(r1.ok, r1.error);
  assert.equal((await a.$('loadProgress')()).eq1.attempted, 4);
  assert.equal(a.$('loadGame()').xp, 10);
  assert.equal(a.$('settingsCache').theme, 'light');
  assert.deepEqual(puro(a.$('notesIndex()').map(n=>n.id)), ['p1']);
  assert.deepEqual(Object.keys(JSON.parse(a.localStorage.getItem('mathstudy-tabuada-v1:caio')).facts), ['7x8'], 'formato 1 mantém a tabuada atual');
});

test('restaurar guarda um ponto de restauração e dá para desfazer', async ()=>{
  const a = novoApp();
  await criar(a, 'Duda'); await encher(a);
  const original = a.$('snapshotUser')('duda');
  const r = await a.$('importProgressData')({formato:2, conta:{chaves:{'mathstudy-game-v1': JSON.stringify({xp:1})}, paginas:{}}});
  assert.ok(r.ok);
  assert.equal(a.$('loadGame()').xp, 1);
  assert.ok(a.$('restorePointInfo')('duda'));
  const u = await a.$('undoLastRestoreForCurrentUser')();
  assert.ok(u.ok, u.error);
  assert.deepEqual(a.$('snapshotUser')('duda'), original);
  assert.equal(a.$('loadGame()').xp, 345);
  assert.equal(a.$('restorePointInfo')('duda'), null);
});

test('arquivo de backup com chave desconhecida ou JSON quebrado não altera nada', async ()=>{
  const a = novoApp();
  await criar(a, 'Eva'); await encher(a);
  const antes = a.$('snapshotUser')('eva');
  const r = await a.$('importProgressData')({formato:2, conta:{chaves:{'mathstudy-progress-v2':'{quebrado', 'mathstudy-users-v1':'[]'}, paginas:{}}});
  assert.equal(r.ok, false);
  assert.deepEqual(a.$('snapshotUser')('eva'), antes);
  assert.ok(a.localStorage.getItem('mathstudy-users-v1').includes('eva'), 'a lista de contas não pode ser trocada por um backup');
});

test('armazenamento cheio: avisa a pessoa e a restauração não deixa a conta pela metade', async ()=>{
  const ls = memoriaLocal(Infinity);
  const a = novoApp({localStorage: ls});
  await criar(a, 'Gil'); await encher(a);
  const antes = a.$('snapshotUser')('gil');
  const grande = {formato:2, conta:{chaves:{'mathstudy-history-v1': JSON.stringify(new Array(5000).fill({q:'x'.repeat(50)}))}, paginas:{}}};
  // limite logo acima do uso atual + ponto de restauração
  ls.setItem = ((orig)=> function(k, v){ if(String(v).length > 100000){ const e = new Error('cheio'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); })(ls.setItem);
  const r = await a.$('importProgressData')(grande);
  assert.equal(r.ok, false);
  assert.match(r.error, /espaço/);
  assert.deepEqual(a.$('snapshotUser')('gil'), antes, 'nada pode mudar quando falta espaço');
  // gravação comum que não cabe: devolve false e avisa
  assert.equal(a.$('storeSet')('mathstudy-x', 'y'.repeat(200000)), false);
  await new Promise(r=>setTimeout(r, 10));
  assert.ok(a.avisos.includes('Armazenamento cheio'));
});

test('dado corrompido é guardado em "::corrompido" antes de ser substituído', async ()=>{
  const a = novoApp();
  await criar(a, 'Hugo');
  a.localStorage.setItem('mathstudy-progress-v2:hugo', '{"fracoes":{"attempted":3,');
  const p = await a.$('loadProgress')();
  assert.deepEqual(puro(p), {});
  assert.equal(a.localStorage.getItem('mathstudy-progress-v2:hugo::corrompido'), '{"fracoes":{"attempted":3,');
});

test('excluir conta apaga só os dados dela (perfis isolados: "ana" × "anabela")', async ()=>{
  const a = novoApp();
  await criar(a, 'Anabela'); await encher(a);
  const outra = a.$('snapshotUser')('anabela');
  await criar(a, 'Ana'); await encher(a);
  assert.equal((await a.$('deleteCurrentUser')('senha-errada1')).ok, false);
  const r = await a.$('deleteCurrentUser')('gato7lua9');
  assert.ok(r.ok, r.error);
  assert.equal(a.$('userStorageKeys')('ana').length, 0);
  assert.deepEqual(a.$('snapshotUser')('anabela'), outra);
  assert.deepEqual(puro((await a.$('loadUsers')()).map(u=>u.id)), ['anabela']);
});

test('"Começar do zero" apaga todo o progresso e mantém caderno e configurações', async ()=>{
  const a = novoApp();
  const uid = await criar(a, 'Ivo'); await encher(a);
  await a.$('resetCurrentUserProgress')();
  for(const b of ['mathstudy-learn-v1','mathstudy-tabuada-v1','mathstudy-exbest-v1','mathstudy-challenge-v1'])
    assert.equal(a.localStorage.getItem(`${b}:${uid}`), null, b);
  assert.equal(a.$('notesIndex()').length, 1);
});

test('senhas: PBKDF2 com sal; conta antiga (SHA-256) entra e é convertida', async ()=>{
  const a = novoApp();
  const rec = await a.$('makePasswordRecord')('gato7lua9');
  assert.equal(rec.alg, 'pbkdf2-sha256'); assert.equal(rec.iter, 310000); assert.equal(rec.salt.length, 32);
  const rec2 = await a.$('makePasswordRecord')('gato7lua9');
  assert.notEqual(rec.hash, rec2.hash, 'mesma senha, sal diferente → hash diferente');
  assert.ok(await a.$('verifyPassword')({pw:rec}, 'gato7lua9'));
  assert.equal(await a.$('verifyPassword')({pw:rec}, 'gato7lua8'), false);
  // conta do formato antigo
  const legado = await a.$('hashPasswordLegacy')('pizza42azul');
  await a.$('saveUsers')([{id:'velho', name:'Velho', passHash:legado}]);
  const u = (await a.$('loadUsers')())[0];
  assert.equal(await a.$('verifyPassword')(u, 'errada123'), false);
  assert.ok(await a.$('verifyPassword')(u, 'pizza42azul'));
  const conv = JSON.parse(a.localStorage.getItem('mathstudy-users-v1'))[0];
  assert.equal(conv.passHash, undefined); assert.equal(conv.pw.alg, 'pbkdf2-sha256');
  assert.ok(await a.$('verifyPassword')(conv, 'pizza42azul'));
});

test('PBKDF2 em JS (sem WebCrypto) dá o mesmo resultado do navegador', async ()=>{
  const a = novoApp();
  const salt = new Uint8Array(16).map((_, i)=> i*7);
  const web = a.$('bytesToHex')(await a.$('pbkdf2')('Pizza42azul', salt, 1000));
  const js = a.$('bytesToHex')(a.$('pbkdf2Js')(new TextEncoder().encode('Pizza42azul'), salt, 1000));
  assert.equal(js, web);
  // vetor conhecido de SHA-256("abc")
  assert.equal(a.$('bytesToHex')(a.$('sha256Js')(new TextEncoder().encode('abc'))), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const sem = novoApp({semCrypto:true});
  const rec = await sem.$('makePasswordRecord')('gato7lua9');
  assert.equal(rec.iter, 20000);
  assert.ok(await sem.$('verifyPassword')({pw:rec}, 'gato7lua9'));
});
