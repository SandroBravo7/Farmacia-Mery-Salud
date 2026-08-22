document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  let products = [];
  let orders = [];

  const tbody = document.getElementById('productsTbody');
  const filterInput = document.getElementById('filterInput');
  const modal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const openModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  // 1. Cargar Productos desde la Base de Datos
  async function fetchProducts() {
    try {
      const res = await fetch('http://localhost:8080/api/productos');
      if (!res.ok) throw new Error('Error al obtener productos');
      products = await res.json();
      renderProducts(products);
      const totalEl = document.getElementById('totalProducts');
      if (totalEl) totalEl.textContent = products.length;
    } catch (err) {
      console.error('Error al conectar con la API:', err);
    }
  }

  // 2. Renderizar Tabla
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
        <td><span class="badge-tag ${p.stock <= 5 ? 'gray' : 'green'}">${p.stock} unids</span></td>
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
    bindTableActions();
  }

  // 3. Filtrado
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

  // 4. Modal Handlers
  function openModal(editData = null) {
    productForm.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').textContent = editData ? 'Editar Producto' : 'Agregar Nuevo Producto';

    if (editData) {
      document.getElementById('prodId').value = editData.id;
      document.getElementById('prodName').value = editData.nombre;
      if (document.getElementById('prodActive')) document.getElementById('prodActive').value = editData.principioActivo || '';
      document.getElementById('prodPresentation').value = editData.presentacion;
      document.getElementById('prodPrice').value = editData.precio;
      document.getElementById('prodStock').value = editData.stock;
      if (document.getElementById('prodPrescription')) document.getElementById('prodPrescription').checked = editData.requiereReceta;
    }
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', () => openModal());
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  // 5. Guardar Producto en MySQL vía Spring Boot (POST)
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const priceValue = parseFloat(document.getElementById('prodPrice').value);
      const stockValue = parseInt(document.getElementById('prodStock').value, 10);

      if (isNaN(priceValue) || priceValue <= 0) {
        alert('El precio debe ser mayor a 0.');
        return;
      }

      if (isNaN(stockValue) || stockValue < 0) {
        alert('El stock no puede ser un número negativo.');
        return;
      }

      const id = document.getElementById('prodId').value;
      const productPayload = {
        id: id ? parseInt(id, 10) : null,
        nombre: document.getElementById('prodName').value.trim(),
        principioActivo: document.getElementById('prodActive')?.value.trim() || '',
        presentacion: document.getElementById('prodPresentation').value.trim(),
        precio: priceValue,
        stock: stockValue,
        categoriaId: 1,
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
          alert('¡Medicamento guardado con éxito en la base de datos!');
          closeModal();
          fetchProducts();
        } else {
          alert('Ocurrió un error al intentar guardar el producto.');
        }
      } catch (err) {
        console.error('Error al persistir producto:', err);
        alert('Error de conexión con el backend.');
      }
    });
  }

  // 6. Acciones de Tabla (Editar / Eliminar)
  function bindTableActions() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const item = products.find(p => p.id === id);
        if (item) openModal(item);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
          products = products.filter(p => p.id !== id);
          renderProducts(products);
        }
      });
    });
  }

  // 7. Navegación de Vistas (Productos vs Pedidos)
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
      const activeSec = document.getElementById(`view-${view}`);
      if (activeSec) activeSec.classList.add('active');

      const titleEl = document.getElementById('pageTitle');
      if (titleEl) {
        titleEl.textContent = (view === 'products') ? 'Inventario de Productos' : 'Gestión de Pedidos';
      }
    });
  });

  // 8. Menú Responsive
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Iniciar cargando la base de datos
  fetchProducts();
});