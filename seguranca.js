/* =========================================================
   Matemática Show — SENHAS
   As contas ficam só neste aparelho (não existe servidor). A senha nunca é guardada:
   guardamos um "resumo" dela feito com PBKDF2-SHA256 + salt aleatório de cada conta
   + 100.000 repetições, o que deixa bem mais lento testar senhas por força bruta.

   Limite importante (app 100% local): quem tem acesso ao aparelho e sabe mexer no
   navegador consegue apagar ou copiar os dados. A senha separa as contas de quem usa o
   mesmo aparelho; ela não é uma proteção contra alguém com acesso técnico ao aparelho.

   Formato de conta:
     novo:   {kdf:'pbkdf2-sha256', iter:100000, salt:'hex', passHash:'hex'}
     antigo: {passHash:'<sha-256 hex>'} ou {passHash:'fb…'} (versões anteriores)
   Contas antigas continuam entrando; no primeiro login certo, o resumo é refeito no formato novo.
   Se o navegador não tiver crypto.subtle (página aberta por http sem ser localhost), o mesmo
   PBKDF2 é calculado em JavaScript puro — o resultado é idêntico, só mais lento.
   ========================================================= */
const PASS_KDF = 'pbkdf2-sha256';
const PASS_ITER = 100000;

/* ---------- SHA-256 e HMAC em JavaScript puro (reserva quando não há crypto.subtle) ---------- */
const _K256 = new Uint32Array([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,
  0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,
  0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,
  0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
function sha256Bytes(msg){
  const l = msg.length, nBlocks = ((l + 9 + 63) >> 6), buf = new Uint8Array(nBlocks * 64);
  buf.set(msg); buf[l] = 0x80;
  const bits = l * 8, dv = new DataView(buf.buffer);
  dv.setUint32(buf.length - 4, bits >>> 0); dv.setUint32(buf.length - 8, Math.floor(bits / 0x100000000));
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const w = new Uint32Array(64);
  for(let off=0; off<buf.length; off+=64){
    for(let i=0;i<16;i++) w[i] = dv.getUint32(off + i*4);
    for(let i=16;i<64;i++){
      const a = w[i-15], b = w[i-2];
      const s0 = ((a>>>7)|(a<<25)) ^ ((a>>>18)|(a<<14)) ^ (a>>>3);
      const s1 = ((b>>>17)|(b<<15)) ^ ((b>>>19)|(b<<13)) ^ (b>>>10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,hh=h7;
    for(let i=0;i<64;i++){
      const S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
      const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + _K256[i] + w[i]) >>> 0;
      const S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh=g; g=f; f=e; e=(d + t1)>>>0; d=c; c=b; b=a; a=(t1 + t2)>>>0;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0; h4=(h4+e)>>>0; h5=(h5+f)>>>0; h6=(h6+g)>>>0; h7=(h7+hh)>>>0;
  }
  const out = new Uint8Array(32), odv = new DataView(out.buffer);
  [h0,h1,h2,h3,h4,h5,h6,h7].forEach((v,i)=> odv.setUint32(i*4, v));
  return out;
}
function hmacSha256Js(key, msg){
  if(key.length > 64) key = sha256Bytes(key);
  const k = new Uint8Array(64); k.set(key);
  const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(64 + 32);
  for(let i=0;i<64;i++){ ip[i] = k[i] ^ 0x36; op[i] = k[i] ^ 0x5c; }
  ip.set(msg, 64);
  op.set(sha256Bytes(ip), 64);
  return sha256Bytes(op);
}
function pbkdf2Sha256Js(pwBytes, salt, iter){
  const s1 = new Uint8Array(salt.length + 4); s1.set(salt); s1[salt.length + 3] = 1; // bloco 1 (32 bytes bastam)
  let u = hmacSha256Js(pwBytes, s1);
  const out = u.slice();
  for(let i=1;i<iter;i++){ u = hmacSha256Js(pwBytes, u); for(let j=0;j<32;j++) out[j] ^= u[j]; }
  return out;
}

const toHex = bytes=> Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
const fromHex = hex=> new Uint8Array((String(hex).match(/../g)||[]).map(x=>parseInt(x,16)));
function hasSubtle(){ try{ return !!(window.crypto && crypto.subtle && crypto.subtle.importKey); }catch(e){ return false; } }
function randomSaltHex(){
  const s = new Uint8Array(16);
  try{ crypto.getRandomValues(s); }
  catch(e){ for(let i=0;i<16;i++) s[i] = Math.floor(Math.random()*256); } // navegador sem crypto: ainda assim um salt por conta
  return toHex(s);
}
async function pbkdf2Hex(pw, saltHex, iter){
  const pwBytes = new TextEncoder().encode(pw), salt = fromHex(saltHex);
  if(hasSubtle()){
    try{
      const key = await crypto.subtle.importKey('raw', pwBytes, 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations:iter}, key, 256);
      return toHex(new Uint8Array(bits));
    }catch(e){ if(typeof storage!=='undefined' && storage.DEV) console.warn('[senha] crypto.subtle falhou, usando JS', e); }
  }
  return toHex(pbkdf2Sha256Js(pwBytes, salt, iter));
}
/* resumo de senha no formato novo, para criar conta ou trocar senha */
async function makePasswordRecord(pw){
  const salt = randomSaltHex();
  return {kdf:PASS_KDF, iter:PASS_ITER, salt, passHash: await pbkdf2Hex(pw, salt, PASS_ITER)};
}
/* confere a senha. {ok, upgrade}: upgrade=true quando a conta ainda usa o formato antigo */
async function verifyPassword(user, pw){
  if(!user || typeof pw !== 'string') return {ok:false};
  if(user.kdf === PASS_KDF && user.salt && user.iter){
    return {ok: (await pbkdf2Hex(pw, user.salt, user.iter)) === user.passHash, upgrade:false};
  }
  // formato antigo: SHA-256 sem salt (ou o resumo simples "fb…" de navegadores sem crypto)
  const stored = String(user.passHash||'');
  const legacy = stored.startsWith('fb') ? legacyFallbackHash(pw) : await legacyPasswordHash(pw);
  return {ok: !!stored && legacy === stored, upgrade:true};
}
/* resumo usado pelas versões anteriores do app (só para conferir contas antigas) */
async function legacyPasswordHash(pw){
  let hex;
  if(hasSubtle()){
    try{ hex = toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)))); }catch(e){ hex = null; }
  }
  if(!hex) hex = toHex(sha256Bytes(new TextEncoder().encode(pw)));
  return hex;
}
/* resumo "fb…" das versões antigas quando não havia crypto.subtle */
function legacyFallbackHash(pw){ let hh=0; for(let i=0;i<pw.length;i++){ hh = (hh*31 + pw.charCodeAt(i))|0; } return 'fb'+hh; }
