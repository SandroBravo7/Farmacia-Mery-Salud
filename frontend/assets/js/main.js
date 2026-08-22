document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Carrito Persistente con LocalStorage (RF04)
  let cart = JSON.parse(localStorage.getItem('merysalud_cart')) || [];
  let currentShippingCost = 5.00;
  let deliveryMethod = 'DELIVERY'; // 'DELIVERY' o 'RECOJO'
  let allProducts = [];

  const productsGrid = document.querySelector('.products-grid');
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.getElementById('cartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const btnGoToCheckout = document.getElementById('btnGoToCheckout');

  const cartViewItems = document.getElementById('cartViewItems');
  const checkoutForm = document.getElementById('checkoutForm');
  const btnBackToCart = document.getElementById('btnBackToCart');
  const orderSuccessView = document.getElementById('orderSuccessView');
  const btnFinishOrder = document.getElementById('btnFinishOrder');

  // Inputs del Formulario
  const inputName = document.getElementById('orderName');
  const inputPhone = document.getElementById('orderPhone');
  const inputEmail = document.getElementById('orderEmail');
  const inputAddress = document.getElementById('orderAddress');
  const inputCardNumber = document.getElementById('cardNumber');
  const inputCardExp = document.getElementById('cardExp');
  const inputCardCvv = document.getElementById('cardCvv');
  const deliveryFieldsGroup = document.getElementById('deliveryFieldsGroup');
  const optDelivery = document.getElementById('optDelivery');
  const optPickup = document.getElementById('optPickup');

  // 2. Cargar Productos desde Spring Boot (API REST)
  async function loadProductsFromBackend() {
    try {
      const res = await fetch('http://localhost:8080/api/productos');
      if (!res.ok) throw new Error('Error al conectar con la API');
      const data = await res.json();
      allProducts = Array.isArray(data) ? data : [];
      renderFeaturedProducts(allProducts);
    } catch (err) {
      console.warn('Backend no detectado o error de conexión:', err);
    }
  }

  // 3. Renderizar únicamente Productos Destacados en el Home (index.html)
  function renderFeaturedProducts(items) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    // Filtrar solo productos destacados
    const featured = items.filter(p => p.destacado);
    const displayList = featured.length > 0 ? featured : items;

    displayList.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-box">
          <img src="${prod.imagenUrl}" alt="${prod.nombre}" loading="lazy" />
        </div>
        <span class="stock-badge">⭐ Destacado</span>
        <h3 class="product-name">${prod.nombre}</h3>
        <p class="product-detail">${prod.presentacion}</p>
        <div class="product-price">S/ ${parseFloat(prod.precio).toFixed(2)}</div>
        <button type="button" class="btn btn-add-cart" data-name="${prod.nombre}" data-price="${prod.precio}">
          <i data-lucide="shopping-cart"></i> Agregar al carrito
        </button>
      `;
      productsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
    bindAddToCartButtons();
  }

  // 4. Manejo de Carrito
  function saveCart() {
    localStorage.setItem('merysalud_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((acc, it) => acc + it.qty, 0);
    if (cartBadge) cartBadge.textContent = totalCount;

    if (cart.length === 0) {
      if (cartItemsList) cartItemsList.innerHTML = '<p class="text-hint" style="text-align:center; padding: 20px 0;">Tu carrito está vacío.</p>';
      if (cartSubtotal) cartSubtotal.textContent = 'S/ 0.00';
      if (cartShipping) cartShipping.textContent = 'S/ 0.00';
      if (cartTotal) cartTotal.textContent = 'S/ 0.00';
      if (btnGoToCheckout) btnGoToCheckout.disabled = true;
      return;
    }

    if (btnGoToCheckout) btnGoToCheckout.disabled = false;
    if (cartItemsList) {
      cartItemsList.innerHTML = '';
      let subtotal = 0;

      cart.forEach(item => {
        const itemSubtotal = item.price * item.qty;
        subtotal += itemSubtotal;

        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <span>S/ ${item.price.toFixed(2)} c/u</span>
          </div>
          <div class="cart-item-actions">
            <button type="button" class="btn-qty" onclick="changeQty('${item.name}', -1)">-</button>
            <span>${item.qty}</span>
            <button type="button" class="btn-qty" onclick="changeQty('${item.name}', 1)">+</button>
          </div>
        `;
        cartItemsList.appendChild(div);
      });

      const activeShipping = (deliveryMethod === 'DELIVERY') ? currentShippingCost : 0.00;
      if (cartSubtotal) cartSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
      if (cartShipping) cartShipping.textContent = activeShipping === 0 ? 'Gratis' : `S/ ${activeShipping.toFixed(2)}`;
      if (cartTotal) cartTotal.textContent = `S/ ${(subtotal + activeShipping).toFixed(2)}`;
    }
  }

  window.changeQty = function(name, delta) {
    const idx = cart.findIndex(it => it.name === name);
    if (idx !== -1) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      saveCart();
    }
  };

  function bindAddToCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(button => {
      button.onclick = () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));

        const existing = cart.find(it => it.name === name);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({ name, price, qty: 1 });
        }

        saveCart();

        const originalHtml = button.innerHTML;
        button.innerHTML = '¡Agregado!';
        button.style.backgroundColor = '#10B981';

        setTimeout(() => {
          button.innerHTML = originalHtml;
          button.style.backgroundColor = '';
          if (window.lucide) lucide.createIcons();
        }, 800);
      };
    });
  }

  // Modal Abrir / Cerrar
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartModal.classList.add('open');
      showView('items');
    });
  }

  if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('open'));
  if (btnGoToCheckout) btnGoToCheckout.addEventListener('click', () => showView('checkout'));
  if (btnBackToCart) btnBackToCart.addEventListener('click', () => showView('items'));

  function showView(view) {
    if (cartViewItems) cartViewItems.style.display = view === 'items' ? 'block' : 'none';
    if (checkoutForm) checkoutForm.style.display = view === 'checkout' ? 'block' : 'none';
    if (orderSuccessView) orderSuccessView.style.display = view === 'success' ? 'block' : 'none';
    if (view === 'checkout') updateCartUI();
  }

  // 5. Alternar Método de Entrega
  function setDeliveryMethod(method) {
    deliveryMethod = method;
    if (method === 'DELIVERY') {
      if (optDelivery) optDelivery.classList.add('active');
      if (optPickup) optPickup.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'block';
    } else {
      if (optPickup) optPickup.classList.add('active');
      if (optDelivery) optDelivery.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'none';
      clearError(inputAddress, 'errOrderAddress');
    }
    updateCartUI();
  }

  if (optDelivery && optPickup) {
    optDelivery.addEventListener('click', () => setDeliveryMethod('DELIVERY'));
    optPickup.addEventListener('click', () => setDeliveryMethod('RECOJO'));
  }

  // 6. Formateo y Validaciones
  if (inputName) {
    inputName.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      clearError(inputName, 'errOrderName');
    });
  }

  if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
      clearError(inputPhone, 'errOrderPhone');
    });
  }

  if (inputCardNumber) {
    inputCardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
      e.target.value = formatted;
      clearError(inputCardNumber, 'errCardNumber');
    });
  }

  if (inputCardExp) {
    inputCardExp.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
      e.target.value = val;
      clearError(inputCardExp, 'errCardExp');
    });
  }

  if (inputCardCvv) {
    inputCardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
      clearError(inputCardCvv, 'errCardCvv');
    });
  }

  function setError(inputEl, errorElId, message) {
    if (inputEl) inputEl.classList.add('input-error');
    const errEl = document.getElementById(errorElId);
    if (errEl) errEl.textContent = message;
  }

  function clearError(inputEl, errorElId) {
    if (inputEl) inputEl.classList.remove('input-error');
    const errEl = document.getElementById(errorElId);
    if (errEl) errEl.textContent = '';
  }

  // 7. Checkout Submit y Envío a Spring Boot
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      const nameVal = inputName.value.trim();
      if (nameVal.length < 3) {
        setError(inputName, 'errOrderName', 'Ingresa tu nombre y apellido.');
        isValid = false;
      }

      const phoneVal = inputPhone.value.trim();
      if (!/^9\d{8}$/.test(phoneVal)) {
        setError(inputPhone, 'errOrderPhone', 'Debe empezar con 9 y tener 9 dígitos.');
        isValid = false;
      }

      const emailVal = inputEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError(inputEmail, 'errOrderEmail', 'Correo electrónico inválido.');
        isValid = false;
      }

      let addressVal = 'Recojo en Farmacia Principal';
      if (deliveryMethod === 'DELIVERY') {
        const dirVal = inputAddress.value.trim();
        if (dirVal.length < 6) {
          setError(inputAddress, 'errOrderAddress', 'Ingresa dirección completa.');
          isValid = false;
        } else {
          addressVal = dirVal;
        }
      }

      const rawCard = inputCardNumber.value.replace(/\s/g, '');
      if (rawCard.length !== 16) {
        setError(inputCardNumber, 'errCardNumber', 'Requiere 16 dígitos.');
        isValid = false;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(inputCardExp.value.trim())) {
        setError(inputCardExp, 'errCardExp', 'Formato MM/AA inválido.');
        isValid = false;
      }

      if (inputCardCvv.value.trim().length !== 3) {
        setError(inputCardCvv, 'errCardCvv', 'Requiere 3 dígitos.');
        isValid = false;
      }

      if (!isValid) return;

      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const rawTotalNum = parseFloat(cartTotal.textContent.replace('S/', '').trim());
      const totalAmount = cartTotal.textContent;
      const itemsText = cart.map(i => `${i.qty}x ${i.name}`).join(', ');

      try {
        await fetch('http://localhost:8080/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codigoOrden: orderId,
            clienteNombre: nameVal,
            clienteTelefono: phoneVal,
            clienteEmail: emailVal,
            direccionEntrega: addressVal,
            tipoEntrega: deliveryMethod,
            total: rawTotalNum
          })
        });
      } catch (error) {
        console.warn('No se pudo guardar la orden en la BD:', error);
      }

      const waText = encodeURIComponent(
        `Hola Farmacia Mery Salud, mi orden es ${orderId}.\nTipo: ${deliveryMethod}\nCliente: ${nameVal}\nTel: ${phoneVal}\nDestino: ${addressVal}\nProductos: ${itemsText}\nTotal: ${totalAmount}`
      );
      
      const waBtn = document.getElementById('btnWhatsAppNotify');
      if (waBtn) waBtn.href = `https://wa.me/51987654321?text=${waText}`;

      const codeEl = document.getElementById('successOrderCode');
      if (codeEl) codeEl.textContent = orderId;

      cart = [];
      saveCart();
      checkoutForm.reset();
      setDeliveryMethod('DELIVERY');
      showView('success');
      if (window.lucide) lucide.createIcons();
    });
  }

  if (btnFinishOrder) {
    btnFinishOrder.addEventListener('click', () => {
      cartModal.classList.remove('open');
      showView('items');
    });
  }

  // 8. Búsqueda desde el Navbar (redirige a catalogo.html)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        window.location.href = `catalogo.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  // 9. Manejo de Sesión de Usuario en Navbar
  function renderUserSessionNavbar() {
    const navActions = document.querySelector('.nav-actions');
    const userSession = JSON.parse(localStorage.getItem('merysalud_user'));

    if (!navActions || !userSession || !userSession.nombre) return;

    const existingUserLink = navActions.querySelector('.nav-user') || navActions.querySelector('.user-menu-wrapper');
    const initial = userSession.nombre.charAt(0).toUpperCase();
    const firstName = userSession.nombre.split(' ')[0];

    const userHtml = `
      <div class="user-menu-wrapper">
        <button type="button" class="user-profile-btn" id="userMenuBtn">
          <div class="user-avatar-circle">${initial}</div>
          <span>${firstName}</span>
          <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
        </button>
        
        <div class="user-dropdown-card" id="userDropdown">
          <div class="user-info-head">
            <strong>${userSession.nombre}</strong>
            <span>${userSession.email}</span>
            <span class="user-role-tag">${userSession.rol}</span>
          </div>
          ${userSession.rol === 'ADMIN' ? '<a href="admin.html" class="btn btn-secondary w-100 mb-2" style="font-size:0.8rem; margin-bottom:8px; display:block; text-align:center;">Panel Admin</a>' : ''}
          <button type="button" class="btn-logout" id="btnLogoutSession">
            <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    `;

    if (existingUserLink) {
      existingUserLink.outerHTML = userHtml;
    } else {
      navActions.insertAdjacentHTML('beforeend', userHtml);
    }

    const btnMenu = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    const btnLogout = document.getElementById('btnLogoutSession');

    if (btnMenu && dropdown) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      document.addEventListener('click', () => dropdown.classList.remove('open'));
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('merysalud_user');
        window.location.reload();
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  renderUserSessionNavbar();

  loadProductsFromBackend();
  updateCartUI();
});