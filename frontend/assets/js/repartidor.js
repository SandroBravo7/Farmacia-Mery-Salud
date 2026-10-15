document.addEventListener('DOMContentLoaded', () => {
  if (!Mery.guard('REPARTIDOR')) return;
  const feed = document.getElementById('ordersFeed');
  const {esc, money} = Mery;
  let orders = [];
  let active = 'all';
  document.querySelector('.driver-name').textContent = Mery.user().nombre;

  function render() {
    document.getElementById('countAll').textContent = orders.length;
    document.getElementById('countRoute').textContent = orders.filter(o => o.estado === 'EN_RUTA').length;
    document.getElementById('countDone').textContent = orders.filter(o => o.estado === 'ENTREGADO').length;
    const items = orders.filter(o => active === 'all' || o.estado === active);
    feed.innerHTML = items.length ? items.map(o => `<article class="order-card">
      <div class="order-card-header"><strong>${esc(o.codigoOrden)}</strong><span class="badge-state ${o.estado === 'ENTREGADO' ? 'done' : 'route'}">${o.estado === 'ASIGNADO' ? 'Por recoger' : o.estado === 'EN_RUTA' ? 'En ruta' : 'Entregado'}</span></div>
      <div class="customer-info"><p><strong>${esc(o.clienteNombre)}</strong></p><p>${esc(o.direccionEntrega)}</p><small>${esc(o.referencia || '')}</small></div>
      <div class="order-items"><ul>${(o.items || []).map(i => `<li>${i.qty} × ${esc(i.name)}</li>`).join('')}</ul></div>
      <div class="order-total-row"><span>Pago al recibir</span><strong>${money(o.total)}</strong></div>
      <div class="actions-grid"><a href="tel:+51${esc(o.clienteTelefono)}" class="btn-action-driver btn-call">Llamar</a><a href="https://wa.me/51${esc(o.clienteTelefono)}?text=${encodeURIComponent(`Pedido ${o.codigoOrden}. Coordinación de entrega de Mery Salud.`)}" target="_blank" rel="noopener noreferrer" class="btn-action-driver btn-whatsapp">WhatsApp</a></div>
      ${['ASIGNADO', 'EN_RUTA'].includes(o.estado) ? `<button class="btn-status-change btn-start-route" data-order="${o.id}">${o.estado === 'ASIGNADO' ? 'Iniciar ruta' : 'Confirmar entrega'}</button>` : ''}
    </article>`).join('') : '<div class="empty-state"><h2>No tienes entregas en este estado</h2><p>Los pedidos aparecerán cuando el administrador te los asigne.</p></div>';
    feed.querySelectorAll('[data-order]').forEach(button => button.onclick = async () => {
      const order = orders.find(o => o.id === Number(button.dataset.order));
      if (!order || !['ASIGNADO', 'EN_RUTA'].includes(order.estado)) return;
      if (order.estado === 'EN_RUTA' && !confirm('¿Confirmas que entregaste el pedido?')) return;
      const estado = order.estado === 'ASIGNADO' ? 'EN_RUTA' : 'ENTREGADO';
      try {
        if (Mery.demo) await Mery.api('pedidos', {method:'POST', body:JSON.stringify({...order, estado})});
        else await Mery.api(`pedidos/${order.id}/estado`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({estado})});
        await load(); Mery.notify('Estado de entrega actualizado.');
      } catch (error) { Mery.notify(error.message); }
    });
  }

  async function load() {
    try {
      orders = Mery.demo ? Mery.list('pedidos').filter(o => o.repartidorId === Mery.user().id)
        : await Mery.api('pedidos/asignados');
      render();
    } catch (error) { feed.innerHTML = `<p role="alert">${esc(error.message)}</p>`; }
  }
  document.querySelectorAll('.tab-btn').forEach(button => button.onclick = () => {
    active = button.dataset.filter;
    document.querySelectorAll('.tab-btn').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button);
    });
    render();
  });
  window.addEventListener('storage', load);
  load();
});
