document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // Pedidos simulados asignados al repartidor (RF06, RF09)
  let orders = [
    {
      id: 'ORD-2026-001',
      time: 'Hace 15 min',
      customer: 'Juan Pérez',
      phone: '51912345678',
      address: 'Av. Universitaria 450, Urb. Palao, SMP',
      reference: 'Frente al parque, portón blanco',
      items: ['2x Paracetamol 500mg', '1x Ibuprofeno 400mg'],
      total: 44.30,
      payment: 'Tarjeta Similada',
      status: 'EN_CAMINO'
    },
    {
      id: 'ORD-2026-002',
      time: 'Hace 30 min',
      customer: 'Rosa Gutiérrez',
      phone: '51987112233',
      address: 'Jr. Huandoy 120, SMP',
      reference: 'Segundo piso timbre 2',
      items: ['1x Omeprazol 20mg', '1x Vitamina C 1000mg'],
      total: 40.80,
      payment: 'Contra Entrega',
      status: 'LISTO_PARA_RUTA'
    },
    {
      id: 'ORD-2026-000',
      time: 'Hace 2 horas',
      customer: 'Marcos Rivas',
      phone: '51944556677',
      address: 'Av. Perú 2200, SMP',
      reference: 'Local comercial',
      items: ['1x Paracetamol 500mg'],
      total: 12.90,
      payment: 'Tarjeta Similada',
      status: 'ENTREGADO'
    }
  ];

  const feed = document.getElementById('ordersFeed');

  function getStatusBadge(status) {
    if (status === 'EN_CAMINO') return '<span class="badge-state route">En Camino</span>';
    if (status === 'LISTO_PARA_RUTA') return '<span class="badge-state ready">Por Recoger</span>';
    return '<span class="badge-state done">Entregado</span>';
  }

  function renderOrders(filter = 'all') {
    feed.innerHTML = '';
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    filtered.forEach(order => {
      // Generar mensaje predeterminado de WhatsApp (RF07)
      const waMessage = encodeURIComponent(
        `Hola ${order.customer}, soy Carlos de Farmacia Mery Salud. Estoy en camino con tu pedido ${order.id} hacia: ${order.address}. Total a pagar: S/ ${order.total.toFixed(2)}.`
      );
      const waUrl = `https://wa.me/${order.phone}?text=${waMessage}`;

      const card = document.createElement('article');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <span class="order-id">${order.id}</span>
            <div class="order-time">${order.time}</div>
          </div>
          ${getStatusBadge(order.status)}
        </div>

        <div class="customer-info">
          <div class="info-row"><i data-lucide="user"></i> <strong>${order.customer}</strong></div>
          <div class="info-row"><i data-lucide="map-pin"></i> <span>${order.address}</span></div>
          <div class="info-row"><i data-lucide="info"></i> <small>${order.reference}</small></div>
        </div>

        <div class="order-items">
          <strong>Productos:</strong>
          <ul>
            ${order.items.map(it => `<li>• ${it}</li>`).join('')}
          </ul>
        </div>

        <div class="order-total-row">
          <span>Pago (${order.payment}):</span>
          <strong>S/ ${order.total.toFixed(2)}</strong>
        </div>

        <!-- Botones de Coordinación -->
        <div class="actions-grid">
          <a href="${waUrl}" target="_blank" class="btn-action-driver btn-whatsapp">
            <i data-lucide="message-circle"></i> WhatsApp
          </a>
          <a href="tel:${order.phone}" class="btn-action-driver btn-call">
            <i data-lucide="phone"></i> Llamar
          </a>
        </div>

        <!-- Botón de Estado -->
        ${order.status === 'LISTO_PARA_RUTA' ? `
          <button class="btn-status-change btn-start-route" onclick="updateOrderStatus('${order.id}', 'EN_CAMINO')">
            Iniciar Ruta de Entrega
          </button>
        ` : ''}

        ${order.status === 'EN_CAMINO' ? `
          <button class="btn-status-change btn-finish-delivery" onclick="updateOrderStatus('${order.id}', 'ENTREGADO')">
            Marcar como Entregado
          </button>
        ` : ''}
      `;
      feed.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
    updateCounts();
  }

  window.updateOrderStatus = function(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      renderOrders();
    }
  };

  function updateCounts() {
    document.getElementById('countAll').textContent = orders.length;
    document.getElementById('countRoute').textContent = orders.filter(o => o.status === 'EN_CAMINO').length;
    document.getElementById('countDone').textContent = orders.filter(o => o.status === 'ENTREGADO').length;
  }

  // Filtros
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderOrders(btn.getAttribute('data-filter'));
    });
  });

  renderOrders();
});