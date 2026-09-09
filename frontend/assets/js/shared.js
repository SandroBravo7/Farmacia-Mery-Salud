/* Servicios compartidos de interfaz. La demostración nunca escribe en la API. */
const Mery = (() => {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const params = new URLSearchParams(location.search);
  if (params.has('demo')) sessionStorage.setItem('mery_demo', params.get('demo') === '1' ? '1' : '0');
  const demo = sessionStorage.getItem('mery_demo') === '1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => `S/ ${Number(value || 0).toFixed(2)}`;
  const key = name => `mery_${demo ? 'demo' : 'live'}_${name}`;
  const user = () => read(key('user'), null);
  const seedProducts = [
    [1,'Paracetamol 500 mg','Paracetamol','Caja × 20 tabletas',12.9,24,1,false,'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'],
    [2,'Ibuprofeno 400 mg','Ibuprofeno','Caja × 30 tabletas',18.5,15,1,true,'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80'],
    [3,'Vitamina C 1000 mg','Ácido ascórbico','Tubo × 20 tabletas',24.9,18,3,false,'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80'],
    [4,'Omeprazol 20 mg','Omeprazol','Caja × 30 cápsulas',15.9,4,1,true,'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80'],
    [5,'Alcohol medicinal 70°','Alcohol etílico','Frasco × 250 ml',8.5,30,2,false,'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80'],
    [6,'Gasas estériles','Material de curación','Paquete × 10 unidades',6,12,2,false,'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80'],
    [7,'Protector solar SPF 50','Cuidado de la piel','Tubo × 50 ml',49.9,0,2,false,'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80'],
    [8,'Multivitamínico','Vitaminas y minerales','Frasco × 30 tabletas',35,10,3,false,'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80'],
    [1001,'Termómetro digital','Accesorio de medición','Unidad con estuche',19.9,16,2,false,'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80'],
    [1002,'Mascarillas descartables','Protección personal','Caja × 50 unidades',15,40,2,false,'https://images.unsplash.com/photo-1586942593568-29361efcd571?w=500&auto=format&fit=crop&q=80'],
    [1003,'Vendas elásticas','Material de curación','Venda de 10 cm × 5 m',9.5,25,2,false,'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80'],
    [1004,'Algodón hidrófilo','Material de curación','Bolsa × 100 g',7.9,32,2,false,'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=80'],
    [1005,'Apósitos adhesivos','Material de curación','Caja × 20 unidades',6.9,35,2,false,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80'],
    [1006,'Gel antibacterial','Higiene de manos','Frasco × 250 ml',10.9,28,2,false,'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop&q=80'],
    [1007,'Jabón líquido neutro','Higiene personal','Frasco × 400 ml',14.9,22,2,false,'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&auto=format&fit=crop&q=80'],
    [1008,'Cepillo dental suave','Higiene bucal','Unidad',8.9,30,2,false,'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80'],
    [1009,'Pasta dental','Higiene bucal','Tubo × 90 g',11.9,24,2,false,'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=500&auto=format&fit=crop&q=80'],
    [1010,'Pañales para adulto talla M','Cuidado del adulto','Paquete × 10 unidades',32.9,14,2,false,'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80'],
    [1011,'Bebida nutricional de vainilla','Complemento nutricional','Botella × 237 ml',12.5,20,3,false,'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80'],
    [1012,'Barra de avena y frutos secos','Alimento envasado','Caja × 6 barras',18.9,18,3,false,'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80']
  ].map(([id,nombre,principioActivo,presentacion,precio,stock,categoriaId,requiereReceta,imagenUrl]) => ({id,nombre,principioActivo,presentacion,precio,stock,categoriaId,requiereReceta,activo:true,destacado:id<5,imagenUrl:imagenUrl||''}));
  const seedUsers = [
    {id:1,nombre:'Administración de prueba',email:'admin@demo.local',rolId:1,activo:true},
    {id:2,nombre:'Repartidor de prueba',email:'repartidor@demo.local',rolId:2,activo:true},
    {id:3,nombre:'Cliente de prueba',email:'cliente@demo.local',rolId:3,activo:true}
  ];
  const categories = () => read(key('categories'), [{id:1,nombre:'Medicamentos y recetas'},{id:2,nombre:'Cuidado personal y primeros auxilios'},{id:3,nombre:'Bienestar y nutrición'}]);
  // ponytail: persistencia local para una demostración; las transacciones concurrentes corresponden a la API.
  function list(name) {
    const raw = read(key(name), name === 'productos' ? seedProducts : name === 'usuarios' ? seedUsers : []);
    if (name === 'productos') {
      const seedMap = new Map(seedProducts.map(p => [p.id, p.imagenUrl]));
      const items = raw.map(p => (!p.imagenUrl && seedMap.has(p.id)) ? { ...p, imagenUrl: seedMap.get(p.id) } : p);
      return items.concat(seedProducts.filter(p => p.id >= 1001 && !items.some(item => item.id === p.id)));
    }
    return raw;
  }
  async function api(path, options = {}) {
    if (demo) {
      const name = path.split('/')[0];
      if (!['productos','usuarios','pedidos'].includes(name)) throw new Error('Operación no disponible en demostración.');
      let items = list(name);
      if (options.method === 'POST') {
        const item = JSON.parse(options.body);
        delete item.password;
        if (!item.id) item.id = Math.max(0,...items.map(i => Number(i.id)||0)) + 1;
        items = items.filter(i => i.id !== item.id).concat(item);
        write(key(name), items);
        return item;
      }
      return items;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/${path}`, {...options, signal:AbortSignal.timeout(10000)});
      if (!res.ok) throw new Error(res.status === 401 ? 'Correo o contraseña incorrectos.' : `No se pudo completar la operación (${res.status}).`);
      return await res.json();
    } catch (error) {
      if (error instanceof TypeError || error.name === 'TimeoutError') throw new Error('No hay conexión con el servicio. Reintenta; tus datos no se han descartado.');
      throw error;
    }
  }
  function notify(message) {
    const el = document.getElementById('uiNotice');
    if (el) { (document.querySelector('dialog[open]') || document.body).append(el); el.textContent = message; el.hidden = false; clearTimeout(notify.timer); notify.timer=setTimeout(()=>{el.hidden=true;},7000); }
  }
  function guard(role) {
    if (user()?.rol !== role) { location.replace(`auth.html?next=${role === 'ADMIN' ? 'admin' : 'repartidor'}`); return false; }
    return true;
  }
  const totals = (cart, delivery) => {
    const cents = cart.reduce((n,i) => n + Math.round(i.price*100)*i.qty,0);
    const shipping = cart.length && delivery === 'DELIVERY' ? 500 : 0;
    return {subtotal:cents/100,shipping:shipping/100,total:(cents+shipping)/100};
  };
  const fileError = file => !file ? 'Adjunta la receta para continuar.' : !['image/jpeg','image/png','application/pdf'].includes(file.type) ? 'Usa una imagen JPG, PNG o un PDF.' : file.size > 5*1024*1024 ? 'El archivo debe pesar como máximo 5 MB.' : '';
  function dialog(id, open) {
    const el = document.getElementById(id);
    if (!el) return;
    if (open) { el._trigger = document.activeElement; el.showModal(); }
    else { el.close(); el._trigger?.focus(); }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const strip = document.createElement('div'); strip.className='mode-strip';
    strip.innerHTML = demo ? '<span><strong>Demostración</strong> · Datos ficticios guardados en este navegador. Sin compras ni pagos reales.</span><a href="?demo=0">Salir de la demo</a>' : '<span>Farmacia Mery Salud · Cuidamos de ti y de tu familia</span><a href="?demo=1">Explorar demostración</a>';
    document.body.prepend(strip);
    const notice = document.createElement('div'); notice.id='uiNotice'; notice.className='ui-notice'; notice.role='status'; notice.hidden=true; document.body.append(notice);
    const main = document.querySelector('main');
    if (main) { main.id ||= 'contenido'; const skip=document.createElement('a');skip.href=`#${main.id}`;skip.className='skip-link';skip.textContent='Saltar al contenido';document.body.prepend(skip); }
    document.querySelectorAll('input[placeholder]').forEach(el => { if (!el.labels?.length) el.setAttribute('aria-label',el.placeholder); });
    document.querySelectorAll('a[target="_blank"]').forEach(el => el.rel='noopener noreferrer');
    document.querySelectorAll('dialog').forEach(el => el.addEventListener('click',e => {if(e.target===el) dialog(el.id,false);}));
    const nav = document.querySelector('.nav-actions');
    if (nav) {
      const link = document.createElement('a');link.href='pedidos.html';link.className='nav-orders';link.textContent='Mis pedidos';nav.append(link);
      const session = user();
      const account = nav.querySelector('.nav-user');
      if (session) {
        if(account) account.remove();
        const menu=document.createElement('details');menu.className='account-menu';
        menu.innerHTML=`<summary>${esc(session.nombre.split(' ')[0])}</summary><div><strong>${esc(session.nombre)}</strong><a href="${session.rol==='ADMIN'?'admin.html':session.rol==='REPARTIDOR'?'repartidor.html':'pedidos.html'}">Mi espacio</a><button type="button">Cerrar sesión</button></div>`;
        menu.querySelector('button').onclick=()=>{localStorage.removeItem(key('user'));location.href='index.html';};nav.append(menu);
      } else if(!account) { const a=document.createElement('a');a.href='auth.html';a.textContent='Ingresar';nav.append(a); }
    }
    document.querySelectorAll('[data-logout]').forEach(el => el.onclick=e=>{e.preventDefault();localStorage.removeItem(key('user'));location.href='auth.html';});
    if (window.lucide) lucide.createIcons();
  });
  return {read,write,key,demo,esc,money,user,api,list,categories,notify,guard,totals,fileError,dialog};
})();
