document.addEventListener('DOMContentLoaded', async () => {
  const {esc,money,key,read,write} = Mery;
  const $ = id => document.getElementById(id);
  let products=[];
  let cart=read(key('cart'),[]).filter(i=>Number.isInteger(i.qty)&&i.qty>0&&Number.isFinite(i.price)&&i.price>0);
  let delivery='DELIVERY';
  const catalog=Boolean($('catalogProductsGrid'));
  const grid=catalog?$('catalogProductsGrid'):document.querySelector('.products-grid');
  const search=$(catalog?'catalogSearchInput':'searchInput');
  const params=new URLSearchParams(location.search);
  if (catalog) {
    const desktop=matchMedia('(min-width: 769px)');
    const adaptFilters=()=>{$('catalogFilters').open=desktop.matches;};adaptFilters();desktop.addEventListener('change',adaptFilters);
    const group=document.querySelector('[name="filterCat"]').closest('.filter-group');
    group.innerHTML='<h4>Categorías</h4><label class="filter-checkbox"><input type="radio" name="filterCat" value="ALL" checked> Todas las categorías</label>'+Mery.categories().map(c=>`<label class="filter-checkbox"><input type="radio" name="filterCat" value="${c.id}"> ${esc(c.nombre)}</label>`).join('');
    search.value=params.get('q')||'';
    const radio=[...document.querySelectorAll('[name="filterCat"]')].find(el=>el.value===params.get('cat'));
    if(radio) radio.checked=true;
  }
  function renderProducts() {
    if(!grid) return;
    const q=(catalog?search.value:'').trim().toLocaleLowerCase('es');
    const category=document.querySelector('[name="filterCat"]:checked')?.value||'ALL';
    let items=products.filter(p=>p.activo!==false);
    if(catalog) {
      items=items.filter(p=>(`${p.nombre} ${p.principioActivo}`.toLocaleLowerCase('es').includes(q))&&(category==='ALL'||String(p.categoriaId)===category)&&(!$('filterPrescription').checked||p.requiereReceta)&&Number(p.precio)<=Number($('priceRange').value));
      const sort=$('sortBy').value;
      items.sort((a,b)=>sort==='price-asc'?a.precio-b.precio:sort==='price-desc'?b.precio-a.precio:sort==='name-asc'?a.nombre.localeCompare(b.nombre):Number(b.destacado)-Number(a.destacado));
      $('catalogCount').textContent=`${items.length} producto${items.length===1?'':'s'} encontrado${items.length===1?'':'s'}`;
      const url=new URL(location); q?url.searchParams.set('q',search.value):url.searchParams.delete('q');category!=='ALL'?url.searchParams.set('cat',category):url.searchParams.delete('cat');history.replaceState(null,'',url);
    } else {const featured=items.filter(p=>p.destacado);items=(featured.length?featured:items).slice(0,4);}
    grid.innerHTML=items.length?items.map(p=>{
      const cartItem=cart.find(i=>i.id===p.id);
      const inCartQty=cartItem?cartItem.qty:0;
      return `<article class="product-card">
        <div class="product-img-box">${p.imagenUrl?`<img src="${esc(p.imagenUrl)}" alt="${esc(p.nombre)}" loading="lazy">`:''}<span class="product-symbol" aria-hidden="true">${p.categoriaId===1?'✚':p.categoriaId===2?'◈':'✦'}</span><span class="product-pack">${esc(p.presentacion)}</span></div>
        <span class="stock-badge ${p.stock<=0?'stock-empty':''}">${p.stock>0?`${p.stock} disponibles`:'Agotado'}</span>
        <h3 class="product-name">${esc(p.nombre)}</h3><p class="product-detail">${esc(p.principioActivo||'')}<br>${esc(p.presentacion)}</p>
        <span class="prescription-label">${p.requiereReceta?'Requiere receta médica':'Sin receta'}</span><div class="product-price">${money(p.precio)}</div>
        ${p.stock<=0
          ? `<button class="btn btn-add-cart" disabled>No disponible</button>`
          : inCartQty>0
            ? `<div class="product-qty-stepper" data-product="${Number(p.id)}">
                <button type="button" class="btn-stepper btn-stepper-minus" data-delta="-1" aria-label="Reducir una unidad de ${esc(p.nombre)}">−</button>
                <span class="stepper-val" aria-label="${inCartQty} en el carrito">${inCartQty} en carrito</span>
                <button type="button" class="btn-stepper btn-stepper-plus" data-delta="1" aria-label="Aumentar una unidad de ${esc(p.nombre)}" ${inCartQty>=p.stock?'disabled':''}>+</button>
               </div>`
            : `<button class="btn btn-add-cart" data-product="${Number(p.id)}">Agregar al carrito</button>`
        }
      </article>`;
    }).join(''):'<div class="empty-state"><h3>No encontramos productos</h3><p>Prueba otro nombre o limpia los filtros.</p></div>';
    grid.querySelectorAll('img').forEach(img=>{img.onerror=()=>img.remove();});
    grid.querySelectorAll('.btn-add-cart[data-product]').forEach(btn=>{
      btn.onclick=()=>{
        const p=products.find(p=>p.id===Number(btn.dataset.product));
        if(!p||p.stock<=0) return;
        const item=cart.find(i=>i.id===p.id);
        if((item?.qty||0)>=p.stock) return Mery.notify('Ya agregaste todas las unidades disponibles.');
        if(item) { item.qty++; item.image=item.image||p.imagenUrl||''; }
        else cart.push({id:p.id,name:p.nombre,price:Number(p.precio),qty:1,stock:p.stock,requiresPrescription:p.requiereReceta,image:p.imagenUrl||''});
        saveCart();
        Mery.notify(`${p.nombre} agregado al carrito.`);
      };
    });
    grid.querySelectorAll('.product-qty-stepper').forEach(stepper=>{
      const pid=Number(stepper.dataset.product);
      const p=products.find(p=>p.id===pid);
      if(!p) return;
      stepper.querySelectorAll('[data-delta]').forEach(btn=>{
        btn.onclick=()=>{
          const delta=Number(btn.dataset.delta);
          const item=cart.find(i=>i.id===p.id);
          if(!item&&delta>0){
            cart.push({id:p.id,name:p.nombre,price:Number(p.precio),qty:1,stock:p.stock,requiresPrescription:p.requiereReceta,image:p.imagenUrl||''});
            saveCart();
            return;
          }
          if(!item) return;
          const next=item.qty+delta;
          if(next>p.stock) return Mery.notify('Ya alcanzaste el límite de existencias disponibles.');
          if(next<=0){
            cart=cart.filter(i=>i.id!==p.id);
            saveCart();
            Mery.notify(`${p.nombre} eliminado del carrito.`);
          } else {
            item.qty=next;
            saveCart();
          }
        };
      });
    });
  }
  async function load() {
    grid.innerHTML='<p class="empty-state" role="status">Cargando productos…</p>';
    try { products=await Mery.api('productos');renderProducts(); }
    catch(error) {grid.innerHTML=`<div class="empty-state" role="alert"><h3>No pudimos cargar el catálogo</h3><p>${esc(error.message)}</p><button class="btn btn-blue" id="retryProducts">Reintentar</button></div>`;$('retryProducts').onclick=load;}
  }
  function saveCart() {write(key('cart'),cart);renderCart();renderProducts();}
  function renderCart() {
    $('cartCount').textContent=cart.reduce((s,i)=>s+i.qty,0);
    $('cartItemsList').innerHTML=cart.length?cart.map((i,index)=>`<div class="cart-item-row">${i.image?`<div class="cart-item-thumb"><img src="${esc(i.image)}" alt="${esc(i.name)}" loading="lazy"></div>`:''}<div class="cart-item-info"><strong>${esc(i.name)}</strong><span>${money(i.price)} c/u ${i.requiresPrescription?'· Con receta':''}</span></div><div class="cart-item-actions"><button type="button" class="btn-qty" data-index="${index}" data-delta="-1" aria-label="Reducir ${esc(i.name)}">−</button><span>${i.qty}</span><button type="button" class="btn-qty" data-index="${index}" data-delta="1" aria-label="Aumentar ${esc(i.name)}" ${i.qty>=i.stock?'disabled':''}>+</button><button type="button" class="remove-item" data-remove="${index}" aria-label="Eliminar ${esc(i.name)}">Eliminar</button></div></div>`).join(''):'<div class="empty-state"><h3>Tu carrito está vacío</h3><p>Agrega productos del catálogo para empezar.</p><a href="catalogo.html">Explorar productos</a></div>';
    $('cartItemsList').querySelectorAll('img').forEach(img=>{img.onerror=()=>img.closest('.cart-item-thumb')?.remove();});
    $('cartItemsList').querySelectorAll('[data-delta]').forEach(btn=>btn.onclick=()=>{
      const i=cart[btn.dataset.index];const next=i.qty+Number(btn.dataset.delta);
      if(next>i.stock) return Mery.notify('No hay más unidades disponibles.');
      i.qty=next;cart=cart.filter(i=>i.qty>0);saveCart();
    });
    $('cartItemsList').querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>{cart.splice(Number(btn.dataset.remove),1);saveCart();});
    const total=Mery.totals(cart,delivery);
    $('cartSubtotal').textContent=money(total.subtotal);$('cartShipping').textContent=money(total.shipping);$('cartTotal').textContent=money(total.total);$('checkoutTotal').textContent=money(total.total);
    $('btnGoToCheckout').disabled=!cart.length;
    $('orderPrescriptionFile').required=cart.some(i=>i.requiresPrescription);
    $('prescriptionHint').textContent=$('orderPrescriptionFile').required?'Este pedido requiere una receta. JPG, PNG o PDF, hasta 5 MB.':'Opcional. JPG, PNG o PDF, hasta 5 MB.';
  }
  function view(name) {for(const [id,v] of [['cartViewItems','cart'],['checkoutForm','checkout'],['orderSuccessView','success']]) $(id).hidden=v!==name;$('cartTitle').textContent=name==='cart'?'Tu carrito':name==='checkout'?'Completa tu pedido':'Pedido de demostración';}
  $('cartBtn').onclick=e=>{e.preventDefault();view('cart');Mery.dialog('cartModal',true);};
  $('closeCartBtn').onclick=()=>Mery.dialog('cartModal',false);
  $('btnFinishOrder').onclick=()=>Mery.dialog('cartModal',false);
  $('btnGoToCheckout').onclick=()=>{
    view('checkout');const u=Mery.user();
    if(u){$('orderName').value=u.nombre;$('orderEmail').value=u.email;$('orderPhone').value=u.telefono||'';$('orderAddress').value=read(key(`address_${u.id}`),'');}
    $('orderName').focus();
  };
  $('btnBackToCart').onclick=()=>view('cart');
  document.querySelectorAll('[name="deliveryMethod"]').forEach(el=>el.onchange=()=>{
    delivery=el.value;$('deliveryFieldsGroup').hidden=delivery==='RECOJO';$('orderAddress').required=delivery==='DELIVERY';renderCart();
  });
  $('orderPrescriptionFile').onchange=()=>{
    const file=$('orderPrescriptionFile').files[0];
    const error=file?Mery.fileError(file):'';$('orderPrescriptionFile').setCustomValidity(error);
    $('prescriptionPreview').textContent=error|| (file?`Archivo seleccionado: ${file.name} (${Math.ceil(file.size/1024)} KB)`:'');
  };
  $('checkoutForm').onsubmit=async e=>{
    e.preventDefault();const file=$('orderPrescriptionFile').files[0];
    if((cart.some(i=>i.requiresPrescription)||file)&&Mery.fileError(file)) { $('orderPrescriptionFile').setCustomValidity(Mery.fileError(file));$('orderPrescriptionFile').reportValidity();return; }
    if(!cart.length||!e.target.reportValidity()) return;
    const error=$('checkoutError');error.textContent='';
    if(!Mery.demo) {error.textContent='La confirmación con detalle de productos y recetas aún no está disponible en el servicio. Tu carrito se conserva. Puedes probar el recorrido en la demostración.';return;}
    const button=$('btnConfirmOrder');button.disabled=true;
    try {
      const current=await Mery.api('productos');
      if(cart.some(i=>!current.some(p=>p.id===i.id&&p.activo!==false&&p.stock>=i.qty&&Number(p.precio)===i.price))) throw new Error('Cambió el stock o precio de un producto. Revisa el catálogo antes de continuar.');
      const order={codigoOrden:`DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}`,clienteNombre:$('orderName').value.trim(),clienteTelefono:$('orderPhone').value,clienteEmail:$('orderEmail').value.trim(),direccionEntrega:delivery==='DELIVERY'?$('orderAddress').value.trim():'Recojo en tienda',referencia:$('orderReference').value.trim(),tipoEntrega:delivery,...Mery.totals(cart,delivery),items:cart.map(i=>({...i})),estado:'PENDIENTE',recetaEstado:file?'PENDIENTE':'NO_REQUIERE',recetaNombre:file?.name||'',createdAt:new Date().toISOString()};
      if(file) order.receta=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('No se pudo leer el archivo.'));r.readAsDataURL(file);});
      await Mery.api('pedidos',{method:'POST',body:JSON.stringify(order)});
      if(!Mery.user()) write(key('guestOrders'),[...read(key('guestOrders'),[]),order.codigoOrden]);
      write(key('productos'),current.map(p=>({...p,stock:p.stock-(cart.find(i=>i.id===p.id)?.qty||0)})));
      if(Mery.user()) write(key(`address_${Mery.user().id}`),$('orderAddress').value.trim());
      const message=`DEMOSTRACIÓN, no es una compra real. Pedido ${order.codigoOrden}. ${order.items.map(i=>`${i.qty} × ${i.name}`).join(', ')}. Total ${money(order.total)}.`;
      $('btnWhatsAppNotify').href=`https://wa.me/?text=${encodeURIComponent(message)}`;
      $('successOrderCode').textContent=order.codigoOrden;cart=[];saveCart();e.target.reset();delivery='DELIVERY';$('deliveryFieldsGroup').hidden=false;$('orderAddress').required=true;$('prescriptionPreview').textContent='';view('success');await load();
    } catch(err) {error.textContent=err.message.includes('quota')?'No hay espacio para guardar el pedido. Prueba una receta más pequeña.':err.message;}
    finally {button.disabled=false;}
  };
  if(catalog) {
    search.oninput=renderProducts;
    document.querySelectorAll('[name="filterCat"],#sortBy,#filterPrescription').forEach(el=>el.onchange=renderProducts);
    $('priceRange').oninput=()=>{$('priceRangeValue').textContent=`Hasta ${money($('priceRange').value)}`;renderProducts();};
    $('btnResetFilters').onclick=()=>{search.value='';$('filterPrescription').checked=false;$('priceRange').value=100;$('priceRangeValue').textContent='Hasta S/ 100.00';$('sortBy').value='featured';document.querySelector('[name="filterCat"][value="ALL"]').checked=true;renderProducts();};
  } else search.onkeydown=e=>{if(e.key==='Enter')location.href=`catalogo.html?q=${encodeURIComponent(search.value.trim())}`;};
  renderCart();await load();
});
