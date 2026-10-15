document.addEventListener('DOMContentLoaded',async()=>{
  if(!Mery.guard('ADMIN')) return;
  const {esc,money}=Mery;
  const states={PENDIENTE:'En revisión',ASIGNADO:'Asignado',EN_RUTA:'En ruta',ENTREGADO:'Entregado',LISTO_RECOJO:'Listo para recoger',CANCELADO:'Cancelado'};const $=id=>document.getElementById(id);
  let products=[],users=[],orders=[];
  const titles={products:['Inventario de productos','Administra precios, existencias y requisitos de receta.'],orders:['Gestión de pedidos','Asigna repartidores y controla el despacho de los pedidos.'],users:['Usuarios y personal','Consulta clientes y administra los perfiles del equipo.'],categories:['Categorías','Organiza los productos para facilitar su búsqueda.']};
  function tab() {
    const name=location.hash.slice(1) in titles?location.hash.slice(1):'products';
    document.querySelectorAll('.admin-section').forEach(el=>el.classList.toggle('active',el.id===`view-${name}`));
    document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===name);el.setAttribute('aria-current',el.dataset.view===name?'page':'false');});
    $('pageTitle').textContent=titles[name][0];$('pageSubtitle').textContent=titles[name][1];$('sidebar').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');
  }
  document.querySelectorAll('[data-view]').forEach(el=>el.onclick=()=>{location.hash=el.dataset.view;});window.addEventListener('hashchange',tab);tab();
  $('menuToggle').onclick=()=>{$('sidebar').classList.toggle('open');if($('sidebar').classList.contains('open'))$('sidebar').querySelector('.nav-btn').focus();$('menuToggle').setAttribute('aria-expanded',$('sidebar').classList.contains('open'));};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('sidebar').classList.contains('open')){$('sidebar').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');$('menuToggle').focus();}});
  const demoOnly=()=>{if(Mery.demo)return true;Mery.notify('La gestión de categorías aún está disponible solo en la demostración.');return false;};
  async function save(name,payload) {return Mery.api(name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}
  async function load(name) {
    const body=$(name==='productos'?'productsTbody':name==='usuarios'?'usersTbody':'ordersTbody');body.innerHTML='<tr><td colspan="7">Cargando…</td></tr>';
    try { const data=await Mery.api(name==='productos'&&!Mery.demo?'productos/admin':name);if(name==='productos'){products=data;renderProducts();}else if(name==='usuarios'){users=data;renderUsers();}else{orders=data;renderOrders();} }
    catch(err){body.innerHTML=`<tr><td colspan="7"><p role="alert">${esc(err.message)}</p><button class="btn btn-secondary">Reintentar</button></td></tr>`;body.querySelector('button').onclick=()=>load(name);}
  }
  function renderProducts() {
    const q=$('filterInput').value.toLowerCase();const visible=products.filter(p=>p.activo!==false);const items=visible.filter(p=>`${p.nombre} ${p.principioActivo}`.toLowerCase().includes(q));
    $('totalProducts').textContent=visible.length;$('inStockProducts').textContent=visible.filter(p=>p.stock>0).length;$('lowStockProducts').textContent=visible.filter(p=>p.stock<=5).length;
    $('productsTbody').innerHTML=items.length?items.map(p=>`<tr><td><div class="admin-prod-cell">${p.imagenUrl?`<img src="${esc(p.imagenUrl)}" alt="${esc(p.nombre)}" class="admin-prod-thumb" onerror="this.remove()">`:`<div class="admin-prod-thumb">${p.categoriaId===1?'✚':p.categoriaId===2?'◈':'✦'}</div>`}<div><strong>${esc(p.nombre)}</strong><br><small>${esc(p.presentacion)}</small></div></div></td><td>${esc(p.principioActivo||'—')}</td><td>${esc(Mery.categories().find(c=>c.id===p.categoriaId)?.nombre||'Sin categoría')}</td><td>${money(p.precio)}</td><td><span class="badge-tag ${p.stock<=5?'amber':'green'}">${p.stock} unidades</span></td><td>${p.requiereReceta?'Requiere receta':'Sin receta'}</td><td><button class="btn-action" data-edit="${p.id}" aria-label="Editar ${esc(p.nombre)}">✎</button><button class="btn-action" data-delete="${p.id}" aria-label="Eliminar ${esc(p.nombre)}">×</button></td></tr>`).join(''):'<tr><td colspan="7">No hay productos con esta búsqueda.</td></tr>';
    $('productsTbody').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openProduct(products.find(p=>p.id===Number(b.dataset.edit))));
    $('productsTbody').querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar este producto del catálogo? El historial de pedidos se conserva.'))return;try{await save('productos',{...products.find(p=>p.id===Number(b.dataset.delete)),activo:false});await load('productos');}catch(err){Mery.notify(err.message);}});
  }
  $('filterInput').oninput=renderProducts;
  function openProduct(p={}) {
    $('productForm').reset();$('modalTitle').textContent=p.id?'Editar producto':'Nuevo producto';
    $('prodCategory').innerHTML=Mery.categories().map(c=>`<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
    for(const [id,name] of Object.entries({prodId:'id',prodName:'nombre',prodActive:'principioActivo',prodPresentation:'presentacion',prodPrice:'precio',prodStock:'stock',prodCategory:'categoriaId',prodImage:'imagenUrl'})) $(id).value=p[name]??(id==='prodCategory'?1:'');
    $('prodPrescription').checked=!!p.requiereReceta;Mery.dialog('productModal',true);
  }
  $('openAddModalBtn').onclick=()=>openProduct();
  for(const id of ['closeModalBtn','cancelModalBtn'])$(id).onclick=()=>Mery.dialog('productModal',false);
  $('productForm').onsubmit=async e=>{
    e.preventDefault();const button=e.submitter;button.disabled=true;
    try {
      const p={...products.find(p=>p.id===Number($('prodId').value)),id:Number($('prodId').value)||null,nombre:$('prodName').value.trim(),principioActivo:$('prodActive').value.trim(),presentacion:$('prodPresentation').value.trim(),precio:Number($('prodPrice').value),stock:Number($('prodStock').value),categoriaId:Number($('prodCategory').value),imagenUrl:$('prodImage').value.trim(),requiereReceta:$('prodPrescription').checked,activo:true};
      if(!p.nombre||!p.presentacion||p.precio<=0||!Number.isInteger(p.stock)||p.stock<0)throw new Error('Revisa nombre, presentación, precio y stock.');
      await save('productos',p);Mery.dialog('productModal',false);await load('productos');Mery.notify('Producto guardado.');
    }catch(err){Mery.notify(err.message);}finally{button.disabled=false;}
  };
  function renderUsers() {
    const q=$('filterUsersInput').value.toLowerCase();const items=users.filter(u=>`${u.nombre} ${u.email}`.toLowerCase().includes(q));
    $('usersTbody').innerHTML=items.length?items.map(u=>`<tr><td>${u.id}</td><td>${esc(u.nombre)}</td><td>${esc(u.email)}</td><td>${esc(u.telefono||'—')}</td><td>${u.rolId===1?'Administrador':u.rolId===2?'Repartidor':'Cliente'}</td><td>${u.activo?'Activo':'Inactivo'}<br><button class="btn btn-secondary" data-user="${u.id}">Editar</button><button class="btn btn-secondary" data-toggle="${u.id}">${u.activo?'Desactivar':'Activar'}</button></td></tr>`).join(''):'<tr><td colspan="6">No hay usuarios con esta búsqueda.</td></tr>';
    $('usersTbody').querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>openUser(users.find(u=>u.id===Number(b.dataset.user))));
    $('usersTbody').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{
      const u=users.find(u=>u.id===Number(b.dataset.toggle));if(u.id===Mery.user().id)return Mery.notify('No puedes desactivar tu propia cuenta.');
      if(!confirm(`¿${u.activo?'Desactivar':'Activar'} a ${u.nombre}?`))return;
      try{await save('usuarios',{...u,activo:!u.activo});await load('usuarios');}catch(err){Mery.notify(err.message);}
    });
  }
  $('filterUsersInput').oninput=renderUsers;
  function openUser(u={}) {
    $('userAdminForm').reset();$('editUserId').value=u.id||'';
    for(const [id,name] of Object.entries({newUserName:'nombre',newUserEmail:'email',newUserPhone:'telefono',newUserRole:'rolId'}))$(id).value=u[name]??(id==='newUserRole'?2:'');
    $('newUserPassword').required=!u.id&&!Mery.demo;$('newUserPassword').parentElement.hidden=Mery.demo||!!u.id;Mery.dialog('userModal',true);
  }
  $('openAddUserModalBtn').onclick=()=>openUser();for(const id of ['closeUserModalBtn','cancelUserModalBtn'])$(id).onclick=()=>Mery.dialog('userModal',false);
  $('userAdminForm').onsubmit=async e=>{
    e.preventDefault();e.submitter.disabled=true;
    try {
      const id=Number($('editUserId').value)||null;const email=$('newUserEmail').value.trim();
      if(users.some(u=>u.id!==id&&u.email.toLowerCase()===email.toLowerCase()))throw new Error('Este correo ya está registrado.');
      const rolId=Number($('newUserRole').value);if(id===Mery.user().id&&rolId!==1)throw new Error('No puedes quitar el rol de tu propia cuenta.');
      await save('usuarios',{...users.find(u=>u.id===id),id,nombre:$('newUserName').value.trim(),email,telefono:$('newUserPhone').value,rolId,password:$('newUserPassword').value,activo:users.find(u=>u.id===id)?.activo??true});Mery.dialog('userModal',false);await load('usuarios');Mery.notify('Usuario guardado.');
    }catch(err){Mery.notify(err.message);}finally{e.submitter.disabled=false;}
  };
  function renderOrders() {
    const items=orders.filter(o=>!$('orderFilter').value||o.estado===$('orderFilter').value).sort((a,b)=>b.id-a.id);
    $('orderSummary').textContent=`${items.length} pedidos · ${money(items.filter(o=>o.estado!=='CANCELADO').reduce((s,o)=>s+Number(o.total),0))}`;
    $('ordersTbody').innerHTML=items.length?items.map(o=>`<tr><td><strong>${esc(o.codigoOrden)}</strong><details><summary>Ver detalle</summary>${(o.items||[]).map(i=>`<p>${i.qty} × ${esc(i.name)}</p>`).join('')||'Detalle no disponible en el servicio.'}${o.recetaNombre?`<p>Receta: ${esc(o.recetaNombre)}</p><button data-recipe="${o.id}">Ver receta</button>`:''}</details></td><td>${esc(o.clienteNombre)}<br>${esc(o.clienteTelefono)}</td><td>${esc(o.direccionEntrega)}</td><td>${money(o.total)}</td><td>${esc(o.tipoEntrega)}</td><td><span class="badge-tag green">${esc(states[o.estado]||o.estado)}</span><div class="order-controls">${o.recetaEstado==='PENDIENTE'?`<button data-approve="${o.id}">Aprobar receta</button><button data-reject="${o.id}">Rechazar receta</button>`:o.recetaEstado==='APROBADA'?'Receta aprobada':''}${o.estado==='PENDIENTE'&&o.recetaEstado!=='PENDIENTE'?(o.tipoEntrega==='DELIVERY'?`<select aria-label="Repartidor para ${esc(o.codigoOrden)}" data-driver="${o.id}"><option value="">Asignar repartidor…</option>${users.filter(u=>u.rolId===2&&u.activo).map(u=>`<option value="${u.id}">${esc(u.nombre)}</option>`).join('')}</select>`:`<button data-ready="${o.id}">Listo para recojo</button>`):''}${o.estado==='LISTO_RECOJO'?`<button data-delivered="${o.id}">Confirmar recojo</button>`:''}${o.estado==='PENDIENTE'?`<button data-cancel="${o.id}">Cancelar pedido</button>`:''}</div></td></tr>`).join(''):'<tr><td colspan="6">No hay pedidos en este estado.</td></tr>';
    for(const [attr,patch] of [['approve',{recetaEstado:'APROBADA'}],['reject',{recetaEstado:'RECHAZADA',estado:'CANCELADO'}],['ready',{estado:'LISTO_RECOJO'}],['delivered',{estado:'ENTREGADO'}],['cancel',{estado:'CANCELADO'}]]) $('ordersTbody').querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>updateOrder(Number(b.dataset[attr]),patch));
    $('ordersTbody').querySelectorAll('[data-driver]').forEach(el=>el.onchange=()=>{if(el.value)updateOrder(Number(el.dataset.driver),{repartidorId:Number(el.value),estado:'ASIGNADO'});});
    $('ordersTbody').querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{
      const o=orders.find(o=>o.id===Number(b.dataset.recipe));if(!o.receta)return Mery.notify('Archivo no disponible.');
      const bytes=atob(o.receta.split(',')[1]);const data=Uint8Array.from(bytes,c=>c.charCodeAt(0));const type=o.receta.startsWith('data:application/pdf')?'application/pdf':'image/png';const url=URL.createObjectURL(new Blob([data],{type}));window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);
    });
  }
  async function updateOrder(id,patch) {
    if(!confirm('¿Confirmar este cambio en el pedido?')){renderOrders();return;}
    try {const o=orders.find(o=>o.id===id);if(Mery.demo)await save('pedidos',{...o,...patch});else await Mery.api(`pedidos/${id}/estado`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});if(Mery.demo&&patch.estado==='CANCELADO') {const current=Mery.list('productos');Mery.write(Mery.key('productos'),current.map(p=>({...p,stock:p.stock+(o.items.find(i=>i.id===p.id)?.qty||0)})));}if(patch.estado==='CANCELADO')await load('productos');await load('pedidos');Mery.notify('Pedido actualizado.');}catch(err){Mery.notify(err.message);}
  }
  $('orderFilter').onchange=renderOrders;
  function renderCategories() {
    $('categoryList').innerHTML=Mery.categories().map(c=>`<div class="category-row"><input aria-label="Nombre de categoría ${c.id}" value="${esc(c.nombre)}" data-category="${c.id}" minlength="3"><button data-save-category="${c.id}">Guardar</button><button data-delete-category="${c.id}">Eliminar</button></div>`).join('');
    $('categoryList').querySelectorAll('[data-save-category]').forEach(b=>b.onclick=()=>{if(!demoOnly())return;const id=Number(b.dataset.saveCategory);const name=$('categoryList').querySelector(`[data-category="${id}"]`).value.trim();if(name.length<3)return Mery.notify('Usa al menos 3 caracteres.');if(Mery.categories().some(c=>c.id!==id&&c.nombre.toLowerCase()===name.toLowerCase()))return Mery.notify('Ya existe esta categoría.');Mery.write(Mery.key('categories'),Mery.categories().map(c=>c.id===id?{...c,nombre:name}:c));renderProducts();Mery.notify('Categoría actualizada.');});
    $('categoryList').querySelectorAll('[data-delete-category]').forEach(b=>b.onclick=()=>{if(!demoOnly())return;const id=Number(b.dataset.deleteCategory);if(products.some(p=>p.categoriaId===id))return Mery.notify('Esta categoría tiene productos. Reasígnalos antes de eliminarla.');if(confirm('¿Eliminar categoría?')){Mery.write(Mery.key('categories'),Mery.categories().filter(c=>c.id!==id));renderCategories();}});
  }
  $('categoryForm').onsubmit=e=>{e.preventDefault();if(!demoOnly())return;const name=$('categoryName').value.trim();const categories=Mery.categories();if(name.length<3||categories.some(c=>c.nombre.toLowerCase()===name.toLowerCase()))return Mery.notify('Escribe un nombre único de al menos 3 caracteres.');Mery.write(Mery.key('categories'),[...categories,{id:Math.max(0,...categories.map(c=>c.id))+1,nombre:name}]);e.target.reset();renderCategories();};
  renderCategories();await Promise.all([load('productos'),load('usuarios')]);await load('pedidos');
  window.addEventListener('storage',e=>{if(e.key===Mery.key('pedidos'))load('pedidos');});
});
