document.addEventListener('DOMContentLoaded', () => {
  const {esc, money} = Mery;
  const list = document.getElementById('historyList');
  const filter = document.getElementById('historyFilter');
  const labels = {PENDIENTE:'En revisión', ASIGNADO:'Repartidor asignado', EN_RUTA:'En ruta',
    ENTREGADO:'Entregado', LISTO_RECOJO:'Listo para recoger', CANCELADO:'Cancelado'};
  let orders = [];

  function render() {
    const selected = orders.filter(o => filter.value === 'all'
      || (filter.value === 'active' && !['ENTREGADO', 'CANCELADO'].includes(o.estado))
      || (filter.value === 'done' && o.estado === 'ENTREGADO')
      || (filter.value === 'cancelled' && o.estado === 'CANCELADO'));
    selected.sort((a,b) => b.id - a.id);
    list.innerHTML = selected.length ? selected.map(o => {
      const steps = o.tipoEntrega === 'DELIVERY'
        ? ['PENDIENTE', 'ASIGNADO', 'EN_RUTA', 'ENTREGADO']
        : ['PENDIENTE', 'LISTO_RECOJO', 'ENTREGADO'];
      return `<article class="history-card"><div class="order-heading"><div><h2>${esc(o.codigoOrden)}</h2><small>${new Date(o.createdAt).toLocaleString('es-PE')}</small></div><span class="order-state">${labels[o.estado] || esc(o.estado)}</span></div>
      ${o.estado !== 'CANCELADO' ? `<ol class="order-timeline" aria-label="Progreso del pedido">${steps.map((step,i) => `<li class="${i <= steps.indexOf(o.estado) ? 'complete' : ''}" ${step === o.estado ? 'aria-current="step"' : ''}>${labels[step]}</li>`).join('')}</ol>` : '<p>El pedido fue cancelado.</p>'}
      <p><strong>${o.tipoEntrega === 'DELIVERY' ? 'Entrega a domicilio' : 'Recojo en tienda'}</strong> · ${esc(o.direccionEntrega)}</p><p>Total: <strong>${money(o.total)}</strong></p>
      <details><summary>Ver productos y datos de entrega</summary><ul>${(o.items || []).map(i => `<li>${i.qty} × ${esc(i.name)} — ${money(i.price * i.qty)}</li>`).join('')}</ul><p>${esc(o.clienteNombre)} · ${esc(o.clienteTelefono)}</p><p>${esc(o.referencia || '')}</p></details></article>`;
    }).join('') : '<div class="empty-state"><h2>Aún no hay pedidos aquí</h2><p>Los pedidos que realices aparecerán en esta sección.</p><a class="btn btn-blue" href="catalogo.html">Explorar catálogo</a></div>';
  }

  async function load() {
    if (!Mery.demo && !Mery.user()?.token) {
      list.innerHTML = '<div class="empty-state"><h2>Inicia sesión para ver tus pedidos</h2><a class="btn btn-blue" href="auth.html">Iniciar sesión</a></div>';
      return;
    }
    try {
      if (Mery.demo) {
        const user = Mery.user();
        const guestIds = Mery.read(Mery.key('guestOrders'), []);
        orders = Mery.list('pedidos').filter(o => user
          ? o.clienteEmail.toLowerCase() === user.email.toLowerCase()
          : guestIds.includes(o.codigoOrden));
      } else orders = await Mery.api('pedidos/mios');
      render();
    } catch (error) { list.innerHTML = `<p role="alert">${esc(error.message)}</p>`; }
  }
  filter.onchange = render;
  window.addEventListener('storage', load);
  load();
});
