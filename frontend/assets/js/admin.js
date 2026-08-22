document.addEventListener('DOMContentLoaded', () => {
  // 1. DEFINICIÓN INMEDIATA DE NAVEGACIÓN ENTRE PESTAÑAS
  function switchTab(view) {
    document.querySelectorAll('.nav-btn').forEach(b => {
      if (b.getAttribute('data-view') === view) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${view}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');
    if (titleEl) {
      if (view === 'products') {
        titleEl.textContent = 'Inventario de Productos';
        if (subEl) subEl.textContent = 'Administra medicamentos, precios, recetas y disponibilidad.';
      } else if (view === 'orders') {
        titleEl.textContent = 'Gestión de Pedidos';
        if (subEl) subEl.textContent = 'Monitorea y despacha las compras entrantes.';
      } else if (view === 'users') {
        titleEl.textContent = 'Usuarios & Personal';
        if (subEl) subEl.textContent = 'Visualiza clientes registrados y administra cuentas de repartidores/admins.';
        fetchUsers();
      }
    }

    window.location.hash = view;
  }

  // 2. ACTIVAR PESTAÑA INMEDIATAMENTE (Evita parpadeos al recargar)
  const currentHash = window.location.hash.replace('#', '');
  if (['products', 'orders', 'users'].includes(currentHash)) {
    switchTab(currentHash);
  } else {
    switchTab('products');
  }

  // Asignar clics a los botones de navegación
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchTab(view);
    });
  });

  if (window.lucide) lucide.createIcons();

  let products = [];
  let users = [];

  // DOM Productos
  const tbody = document.getElementById('productsTbody');
  const filterInput = document.getElementById('filterInput');
  const modal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const openModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  // DOM Usuarios
  const usersTbody = document.getElementById('usersTbody');
  const filterUsersInput = document.getElementById('filterUsersInput');
  const userModal = document.getElementById('userModal');
  const userAdminForm = document.getElementById('userAdminForm');
  const openAddUserModalBtn = document.getElementById('openAddUserModalBtn');
  const closeUserModalBtn = document.getElementById('closeUserModalBtn');
  const cancelUserModalBtn = document.getElementById('cancelUserModalBtn');

  // 3. PRODUCTOS: Fetch & Render
  async function fetchProducts() {
    try {
      const res = await fetch('http://localhost:8080/api/productos');
      if (!res.ok) throw new Error('Error al obtener productos');
      products = await res.json();
      renderProducts(products);

      const totalEl = document.getElementById('totalProducts');
      const inStockEl = document.getElementById('inStockProducts');
      const lowStockEl = document.getElementById('lowStockProducts');

      if (totalEl) totalEl.textContent = products.length;
      if (inStockEl) inStockEl.textContent = products.filter(p => p.stock > 5).length;
      if (lowStockEl) lowStockEl.textContent = products.filter(p => p.stock <= 5).length;
    } catch (err) {
      console.error('Error al conectar con la API de productos:', err);
    }
  }

  function renderProducts(items) {
    if (!tbody) return;
    tbody.innerHTML = '';
    items.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.nombre}</strong><br><small class="text-muted">${p.presentacion}</small></td>
        <td>${p.principioActivo || '-'}</td>
        <td>${p.categoriaId === 1 ? 'Medicamentos' : p.categoriaId === 2 ? 'Cuidado Personal' : 'Bienestar'}</td>
        <td><strong>S/ ${parseFloat(p.precio).toFixed(2)}</strong></td>
        <td><span class="badge-tag ${p.stock <= 5 ? 'amber' : 'green'}">${p.stock} unids</span></td>
        <td>${p.requiereReceta ? '<span class="badge-tag green">Requiere</span>' : '<span class="badge-tag gray">Libre</span>'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action edit-btn" data-id="${p.id}" title="Editar"><i data-lucide="edit-3"></i></button>
            <button class="btn-action delete-btn" data-id="${p.id}" title="Eliminar"><i data-lucide="trash-2"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
    bindProductActions();
  }

  // 4. PRODUCTOS: Filtrado y Modal
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = products.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        (p.principioActivo && p.principioActivo.toLowerCase().includes(q))
      );
      renderProducts(filtered);
    });
  }

  function openProductModal(editData = null) {
    productForm.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').textContent = editData ? 'Editar Producto' : 'Agregar Nuevo Producto';

    if (editData) {
      document.getElementById('prodId').value = editData.id;
      document.getElementById('prodName').value = editData.nombre;
      if (document.getElementById('prodActive')) document.getElementById('prodActive').value = editData.principioActivo || '';
      document.getElementById('prodCategory').value = editData.categoriaId || 1;
      document.getElementById('prodPresentation').value = editData.presentacion;
      document.getElementById('prodPrice').value = editData.precio;
      document.getElementById('prodStock').value = editData.stock;
      if (document.getElementById('prodPrescription')) document.getElementById('prodPrescription').checked = editData.requiereReceta;
    }
    modal.classList.add('open');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', () => openProductModal());
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => modal.classList.remove('open'));

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const priceVal = parseFloat(document.getElementById('prodPrice').value);
      const stockVal = parseInt(document.getElementById('prodStock').value, 10);
      const idVal = document.getElementById('prodId').value;

      const productPayload = {
        id: idVal ? parseInt(idVal, 10) : null,
        nombre: document.getElementById('prodName').value.trim(),
        principioActivo: document.getElementById('prodActive')?.value.trim() || '',
        presentacion: document.getElementById('prodPresentation').value.trim(),
        precio: priceVal,
        stock: stockVal,
        categoriaId: parseInt(document.getElementById('prodCategory').value, 10),
        imagenUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        requiereReceta: document.getElementById('prodPrescription')?.checked || false,
        destacado: true,
        activo: true
      };

      try {
        const res = await fetch('http://localhost:8080/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload)
        });

        if (res.ok) {
          alert('¡Medicamento guardado con éxito!');
          modal.classList.remove('open');
          fetchProducts();
        } else {
          alert('Error al guardar medicamento.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión con el backend.');
      }
    });
  }

  function bindProductActions() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const item = products.find(p => p.id === id);
        if (item) openProductModal(item);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('¿Deseas eliminar este producto del inventario?')) {
          products = products.filter(p => p.id !== id);
          renderProducts(products);
        }
      });
    });
  }

  // 5. USUARIOS: Fetch & Render
  async function fetchUsers() {
    try {
      const res = await fetch('http://localhost:8080/api/usuarios');
      if (!res.ok) throw new Error('Error al listar usuarios');
      users = await res.json();
      renderUsers(users);
    } catch (err) {
      console.error('Error al conectar con la API de usuarios:', err);
    }
  }

  function renderUsers(items) {
    if (!usersTbody) return;
    usersTbody.innerHTML = '';
    items.forEach(u => {
      const tr = document.createElement('tr');
      const rolName = u.rolId === 1 ? 'ADMIN' : (u.rolId === 2 ? 'REPARTIDOR' : 'CLIENTE');
      const rolTagClass = u.rolId === 1 ? 'amber' : (u.rolId === 2 ? 'green' : 'gray');

      tr.innerHTML = `
        <td><strong>#${u.id}</strong></td>
        <td><strong>${u.nombre}</strong></td>
        <td>${u.email}</td>
        <td>${u.telefono || '-'}</td>
        <td><span class="badge-tag ${rolTagClass}">${rolName}</span></td>
        <td><span class="badge-tag ${u.activo ? 'green' : 'gray'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      `;
      usersTbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  }

  // 6. USUARIOS: Filtrado y Modal
  if (filterUsersInput) {
    filterUsersInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = users.filter(u => 
        u.nombre.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
      renderUsers(filtered);
    });
  }

  if (openAddUserModalBtn) openAddUserModalBtn.addEventListener('click', () => {
    userAdminForm.reset();
    userModal.classList.add('open');
  });
  if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', () => userModal.classList.remove('open'));
  if (cancelUserModalBtn) cancelUserModalBtn.addEventListener('click', () => userModal.classList.remove('open'));

  if (userAdminForm) {
    userAdminForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        nombre: document.getElementById('newUserName')?.value.trim(),
        email: document.getElementById('newUserEmail')?.value.trim(),
        telefono: document.getElementById('newUserPhone')?.value.trim(),
        rolId: parseInt(document.getElementById('newUserRole')?.value, 10),
        password: document.getElementById('newUserPassword')?.value
      };

      try {
        const res = await fetch('http://localhost:8080/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert('¡Usuario registrado con éxito en MySQL!');
          userModal.classList.remove('open');
          fetchUsers();
        } else {
          const errText = await res.text();
          alert(`Error: ${errText}`);
        }
      } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor.');
      }
    });
  }

  // Menú Mobile
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Cargas de datos iniciales
  fetchProducts();
  fetchUsers();
});