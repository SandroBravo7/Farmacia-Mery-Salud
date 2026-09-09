document.addEventListener('DOMContentLoaded',()=>{
  if(!Mery.guard('REPARTIDOR'))return;
  const {esc,money}=Mery;const feed=document.getElementById('ordersFeed');let active='all';
  document.querySelector('.driver-name').textContent=Mery.user().nombre;
  function render() {
    if(!Mery.demo){feed.innerHTML='<div class="empty-state"><h2>Entregas aún no disponibles</h2><p>La API actual no dispone de asignación de repartidores. Puedes probar el recorrido en la demostración.</p></div>';return;}
    const orders=Mery.list('pedidos').filter(o=>o.repartidorId===Mery.user().id);
    document.getElementById('countAll').textContent=orders.length;document.getElementById('countRoute').textContent=orders.filter(o=>o.estado==='EN_RUTA').length;document.getElementById('countDone').textContent=orders.filter(o=>o.estado==='ENTREGADO').length;
    const items=orders.filter(o=>active==='all'||o.estado===active);
    feed.innerHTML=items.length?items.map(o=>`<article class="order-card"><div class="order-card-header"><strong>${esc(o.codigoOrden)}</strong><span class="badge-state ${o.estado==='ENTREGADO'?'done':'route'}">${o.estado==='ASIGNADO'?'Por recoger':o.estado==='EN_RUTA'?'En ruta':'Entregado'}</span></div><div class="customer-info"><p><strong>${esc(o.clienteNombre)}</strong></p><p>${esc(o.direccionEntrega)}</p><small>${esc(o.referencia)}</small></div><div class="order-items"><ul>${o.items.map(i=>`<li>${i.qty} × ${esc(i.name)}</li>`).join('')}</ul></div><div class="order-total-row"><span>Pago al recibir (demo)</span><strong>${money(o.total)}</strong></div><div class="actions-grid"><a href="tel:+51${esc(o.clienteTelefono)}" class="btn-action-driver btn-call">Llamar</a><a href="https://wa.me/51${esc(o.clienteTelefono)}?text=${encodeURIComponent(`Pedido de demostración ${o.codigoOrden}. Coordinación de entrega de Mery Salud.`)}" target="_blank" rel="noopener noreferrer" class="btn-action-driver btn-whatsapp">WhatsApp</a></div>${['ASIGNADO','EN_RUTA'].includes(o.estado)?`<button class="btn-status-change btn-start-route" data-order="${o.id}">${o.estado==='ASIGNADO'?'Iniciar ruta':'Confirmar entrega'}</button>`:''}</article>`).join(''):'<div class="empty-state"><h2>No tienes entregas en este estado</h2><p>Los pedidos aparecerán cuando el administrador te los asigne.</p></div>';
    feed.querySelectorAll('[data-order]').forEach(btn=>btn.onclick=async()=>{
      const o=Mery.list('pedidos').find(o=>o.id===Number(btn.dataset.order));if(!o||!['ASIGNADO','EN_RUTA'].includes(o.estado))return;
      if(o.estado==='EN_RUTA'&&!confirm('¿Confirmas que entregaste el pedido al cliente?'))return;
      try{await Mery.api('pedidos',{method:'POST',body:JSON.stringify({...o,estado:o.estado==='ASIGNADO'?'EN_RUTA':'ENTREGADO'})});render();Mery.notify('Estado de entrega actualizado.');}catch(err){Mery.notify(err.message);}
    });
  }
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.onclick=()=>{active=btn.dataset.filter;document.querySelectorAll('.tab-btn').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',b===btn);});render();});
  window.addEventListener('storage',render);render();
});
