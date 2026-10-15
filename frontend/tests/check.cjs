// Ejecutar: node frontend/tests/check.cjs (sin dependencias).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const memory=new Map();
const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const context=vm.createContext({localStorage:storage,sessionStorage:storage,location:{search:'?demo=1'},URLSearchParams,document:{addEventListener(){}},setTimeout});
vm.runInContext(fs.readFileSync('frontend/assets/js/shared.js','utf8')+'\nthis.app=Mery;',context);
const app=context.app;
assert.equal(app.totals([{price:0.1,qty:3},{price:0.2,qty:1}],'DELIVERY').total,5.5);
assert.equal(app.totals([{price:12.9,qty:2}],'RECOJO').total,25.8);
assert.equal(app.totals([],'DELIVERY').total,0);
assert.equal(app.fileError({type:'image/png',size:1024}),'');
assert.ok(app.fileError({type:'text/html',size:20}));
assert.ok(app.fileError({type:'application/pdf',size:5242881}));
assert.ok(app.fileError(null));
assert.equal(app.esc('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
memory.set('broken','not JSON');assert.equal(app.read('broken',42),42);
(async()=>{
 const u=await app.api('usuarios',{method:'POST',body:JSON.stringify({nombre:'Prueba',password:'never persist',rolId:3})});
 assert.equal(u.password,undefined);
 assert.ok(!storage.getItem(app.key('usuarios')).includes('never persist'));
  const before=await app.api('productos');
  assert.equal(before.length,20);
  assert.equal(new Set(before.map(p=>p.id)).size,20);
  assert.ok(before.every(p=>typeof p.imagenUrl==='string'&&p.imagenUrl.startsWith('https://')),'Todos los productos deben tener imagenUrl');
  storage.setItem(app.key('productos'),JSON.stringify([{id:1,nombre:'Paracetamol 500 mg',stock:7}]));
  const hydrated=await app.api('productos');
  assert.ok(hydrated.find(p=>p.id===1).imagenUrl.startsWith('https://'),'La hidratación automática de imágenes debe asignar imagenUrl');
  storage.setItem(app.key('productos'),JSON.stringify([{...before[0],stock:7},{...before.find(p=>p.id===1001),activo:false}]));
 const expanded=await app.api('productos');
 assert.equal(expanded.find(p=>p.id===1).stock,7);
 assert.equal(expanded.find(p=>p.id===1001).activo,false);
 assert.ok(expanded.some(p=>p.id===1012));
 storage.setItem(app.key('productos'),JSON.stringify(before));
 await app.api('productos',{method:'POST',body:JSON.stringify({...before[0],stock:2})});
 assert.equal((await app.api('productos')).find(p=>p.id===1).stock,2);
 assert.equal((await app.api('productos')).length,before.length);
 assert.equal(storage.getItem('mery_live_productos'),null);
 for(const file of fs.readdirSync('frontend').filter(f=>f.endsWith('.html'))) {
  const html=fs.readFileSync('frontend/'+file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`IDs duplicados en ${file}`);
  for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)"/g))assert.ok(fs.existsSync('frontend/'+match[1]),`${file}: ${match[1]}`);
 }
 console.log('OK: totales, recetas, escape, almacenamiento, aislamiento demo e integridad HTML.');
})().catch(e=>{console.error(e);process.exitCode=1;});
