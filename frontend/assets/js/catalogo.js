document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  let products = [];
  let cart = JSON.parse(localStorage.getItem('merysalud_cart')) || [];

  const grid = document.getElementById('catalogProductsGrid');
  const countLabel = document.getElementById('catalogCount');
  const searchInput = document.getElementById('catalogSearchInput');
  const sortSelect = document.getElementById('sortBy');
  const priceRange = document.getElementById('priceRange');
  const priceRangeValue = document.getElementById('priceRangeValue');
  const filterPrescription = document.getElementById('filterPrescription');
  const btnReset = document.getElementById('btnResetFilters');

  // Carrito UI elements
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.getElementById('cartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const btnGoToCheckout = document.getElementById('btnGoToCheckout');
  const btnBackToCart = document.getElementById('btnBackToCart');
  const checkoutForm = document.getElementById('checkoutForm');
  const cartViewItems = document.getElementById('cartViewItems');
  const orderSuccessView = document.getElementById('orderSuccessView');
  const btnFinishOrder = document.getElementById('btnFinishOrder');

  // Cargar productos de Spring Boot
  async function fetchCatalog() {
    try {
      const res = await fetch('http://localhost:8080/api/productos');
      if (!res.ok) throw new Error('Error al conectar con la API');
      products = await res.json();
      applyFilters();
    } catch (err) {
      console.error(err);
      if (grid) grid.innerHTML = '<p class="text-hint" style="grid-column: 1/-1; text-align:center; padding: 40px; color:#ef4444;">No se pudo conectar con el servidor.</p>';
    }
  }

  // Filtrado y Ordenamiento
  function applyFilters() {
    let result = [...products];

    // Búsqueda
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(query) || 
        (p.principioActivo && p.principioActivo.toLowerCase().includes(query))
      );
    }

    // Categoría seleccionada
    const activeCat = document.querySelector('input[name="filterCat"]:checked')?.value || 'ALL';
    if (activeCat !== 'ALL') {
      result = result.filter(p => p.categoriaId == activeCat);
    }

    // Receta médica
    if (filterPrescription && filterPrescription.checked) {
      result = result.filter(p => p.requiereReceta);
    }

    // Precio máximo
    const maxPrice = parseFloat(priceRange.value);
    result = result.filter(p => parseFloat(p.precio) <= maxPrice);

    // Ordenamiento
    const sortBy = sortSelect.value;
    if (sortBy === 'price-asc') result.sort((a, b) => a.precio - b.precio);
    if (sortBy === 'price-desc') result.sort((a, b) => b.precio - a.precio);
    if (sortBy === 'name-asc') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortBy === 'featured') result.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

    renderProducts(result);
  }

  function renderProducts(items) {
    if (!grid) return;
    grid.innerHTML = '';
    if (countLabel) countLabel.textContent = `${items.length} medicamento(s) encontrado(s)`;

    if (items.length === 0) {
      grid.innerHTML = '<p class="text-hint" style="grid-column: 1/-1; text-align:center; padding: 60px 0;">No se encontraron productos con estos filtros.</p>';
      return;
    }

    items.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-box">
          <img src="${prod.imagenUrl}" alt="${prod.nombre}" loading="lazy" />
        </div>
        <span class="stock-badge">${prod.destacado ? '⭐ Destacado' : 'En Stock'}</span>
        <h3 class="product-name">${prod.nombre}</h3>
        <p class="product-detail">${prod.presentacion}</p>
        <div class="product-price">S/ ${parseFloat(prod.precio).toFixed(2)}</div>
        <button type="button" class="btn btn-add-cart" data-name="${prod.nombre}" data-price="${prod.precio}">
          <i data-lucide="shopping-cart"></i> Agregar al carrito
        </button>
      `;
      grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
    bindAddToCart();
  }

  // Carrito Handlers
  function saveCart() {
    localStorage.setItem('merysalud_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((acc, it) => acc + it.qty, 0);
    if (cartBadge) cartBadge.textContent = totalCount;

    if (!cartItemsList) return;
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="text-hint" style="text-align:center; padding: 20px 0;">Tu carrito está vacío.</p>';
      if (cartSubtotal) cartSubtotal.textContent = 'S/ 0.00';
      if (cartTotal) cartTotal.textContent = 'S/ 0.00';
      if (btnGoToCheckout) btnGoToCheckout.disabled = true;
      return;
    }

    if (btnGoToCheckout) btnGoToCheckout.disabled = false;
    cartItemsList.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;
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

    if (cartSubtotal) cartSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `S/ ${(subtotal + 5.00).toFixed(2)}`;
  }

  window.changeQty = function(name, delta) {
    const idx = cart.findIndex(it => it.name === name);
    if (idx !== -1) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      saveCart();
    }
  };

  function bindAddToCart() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        const existing = cart.find(it => it.name === name);
        if (existing) existing.qty += 1;
        else cart.push({ name, price, qty: 1 });
        saveCart();

        btn.innerHTML = '¡Agregado!';
        btn.style.backgroundColor = '#10B981';
        setTimeout(() => {
          btn.innerHTML = '<i data-lucide="shopping-cart"></i> Agregar al carrito';
          btn.style.backgroundColor = '';
          if (window.lucide) lucide.createIcons();
        }, 600);
      };
    });
  }

  // Event Listeners de Filtros
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (filterPrescription) filterPrescription.addEventListener('change', applyFilters);
  
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      if (priceRangeValue) priceRangeValue.textContent = `Hasta S/ ${parseFloat(e.target.value).toFixed(2)}`;
      applyFilters();
    });
  }

  document.querySelectorAll('input[name="filterCat"]').forEach(r => r.addEventListener('change', applyFilters));

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (filterPrescription) filterPrescription.checked = false;
      if (priceRange) {
        priceRange.value = 100;
        if (priceRangeValue) priceRangeValue.textContent = 'Hasta S/ 100.00';
      }
      const firstRadio = document.querySelector('input[name="filterCat"][value="ALL"]');
      if (firstRadio) firstRadio.checked = true;
      applyFilters();
    });
  }

  // Modal Carrito
  if (cartBtn) cartBtn.addEventListener('click', () => cartModal.classList.add('open'));
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('open'));
  if (btnGoToCheckout) btnGoToCheckout.addEventListener('click', () => {
    cartViewItems.style.display = 'none';
    checkoutForm.style.display = 'block';
  });
  if (btnBackToCart) btnBackToCart.addEventListener('click', () => {
    checkoutForm.style.display = 'none';
    cartViewItems.style.display = 'block';
  });
  if (btnFinishOrder) btnFinishOrder.addEventListener('click', () => cartModal.classList.remove('open'));

  // Manejo de Sesión de Usuario en Navbar para Catálogo
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

  updateCartUI();
  fetchCatalog();
});