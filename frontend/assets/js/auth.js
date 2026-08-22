document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  let currentMode = 'login'; // Iniciamos por defecto en modo Login

  // 1. Mostrar / Ocultar contraseñas
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const isPassword = input.type === 'password';

      input.type = isPassword ? 'text' : 'password';
      button.innerHTML = isPassword
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';

      if (window.lucide) lucide.createIcons();
    });
  });

  // 2. Elementos del DOM
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formTitle = document.querySelector('.form-title');
  const formSubtitle = document.querySelector('.form-subtitle');
  const btnSubmit = document.getElementById('btnSubmit');
  const footerText = document.getElementById('footerText');
  const groupFullname = document.getElementById('groupFullname');
  const groupPhone = document.getElementById('groupPhone');
  const groupConfirmPassword = document.getElementById('groupConfirmPassword');
  const loginOptions = document.getElementById('loginOptions');
  const authForm = document.getElementById('authForm');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  function renderView(mode) {
    currentMode = mode;
    if (mode === 'register') {
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');

      if (formTitle) formTitle.textContent = 'Crea tu cuenta';
      if (formSubtitle) formSubtitle.textContent = 'Únete a Mery Salud y gestiona tu salud inteligentemente.';
      if (btnSubmit) btnSubmit.textContent = 'Crear Cuenta';

      if (groupFullname) groupFullname.style.display = 'flex';
      if (groupPhone) groupPhone.style.display = 'flex';
      if (groupConfirmPassword) groupConfirmPassword.style.display = 'flex';
      if (loginOptions) loginOptions.style.display = 'none';

      if (footerText) footerText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="linkToggleAuth">Inicia sesión</a>';
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');

      if (formTitle) formTitle.textContent = 'Bienvenido de nuevo';
      if (formSubtitle) formSubtitle.textContent = 'Ingresa tus credenciales para acceder a tu panel.';
      if (btnSubmit) btnSubmit.textContent = 'Iniciar Sesión';

      if (groupFullname) groupFullname.style.display = 'none';
      if (groupPhone) groupPhone.style.display = 'none';
      if (groupConfirmPassword) groupConfirmPassword.style.display = 'none';
      if (loginOptions) loginOptions.style.display = 'flex';

      if (footerText) footerText.innerHTML = '¿No tienes una cuenta? <a href="#" id="linkToggleAuth">Regístrate gratis</a>';
    }

    const newLink = document.getElementById('linkToggleAuth');
    if (newLink) {
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderView(currentMode === 'register' ? 'login' : 'register');
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  if (tabLogin) tabLogin.addEventListener('click', () => renderView('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => renderView('register'));

  // Iniciar por defecto en la vista de Login
  renderView('login');

  // 3. Envío y Conexión con Spring Boot (/api/auth/login y /api/auth/register)
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email || !password) {
        alert('Por favor ingresa tu correo y contraseña.');
        return;
      }

      if (currentMode === 'login') {
        try {
          const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (!res.ok) {
            const errorMsg = await res.text();
            alert(errorMsg || 'Credenciales incorrectas.');
            return;
          }

          const userData = await res.json();
          localStorage.setItem('merysalud_user', JSON.stringify(userData));

          // Redirección condicional según el rol
          if (userData.rol === 'ADMIN') {
            window.location.href = 'admin.html';
          } else if (userData.rol === 'REPARTIDOR') {
            window.location.href = 'repartidor.html';
          } else {
            window.location.href = 'index.html';
          }

        } catch (err) {
          console.error('Error de conexión:', err);
          alert('No se pudo conectar con el servidor en el puerto 8080.');
        }
      } else {
        // Modo Registro de Clientes
        const nombre = groupFullname ? groupFullname.querySelector('input')?.value.trim() : '';
        const telefono = groupPhone ? groupPhone.querySelector('input')?.value.trim() : '';
        const confirmPassword = groupConfirmPassword ? groupConfirmPassword.querySelector('input')?.value : '';

        if (!nombre || nombre.length < 3) {
          alert('Por favor ingresa tu nombre completo.');
          return;
        }

        if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden.');
          return;
        }

        try {
          const res = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre,
              email,
              password,
              telefono
            })
          });

          if (res.ok) {
            const userData = await res.json();
            localStorage.setItem('merysalud_user', JSON.stringify(userData));
            alert('¡Cuenta creada exitosamente! Bienvenido a Mery Salud.');
            window.location.href = 'index.html';
          } else {
            const errorMsg = await res.text();
            alert(`Error al registrarse: ${errorMsg}`);
          }
        } catch (err) {
          console.error('Error al registrar usuario:', err);
          alert('No se pudo conectar con el servidor para registrar la cuenta.');
        }
      }
    });
  }
});