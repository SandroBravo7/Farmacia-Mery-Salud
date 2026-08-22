document.addEventListener('DOMContentLoaded', () => {
  // Inicializar íconos Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Mostrar / Ocultar contraseñas cambiando el ícono
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

  // 2. Conmutación dinámica entre Login y Register
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

  function renderView(mode) {
    if (mode === 'register') {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');

      formTitle.textContent = 'Crea tu cuenta';
      formSubtitle.textContent = 'Únete a Mery Salud y gestiona tu salud inteligentemente.';
      btnSubmit.textContent = 'Crear Cuenta';

      groupFullname.style.display = 'flex';
      groupPhone.style.display = 'flex';
      groupConfirmPassword.style.display = 'flex';
      loginOptions.style.display = 'none';

      footerText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="linkToggleAuth">Inicia sesión</a>';
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');

      formTitle.textContent = 'Bienvenido de nuevo';
      formSubtitle.textContent = 'Ingresa tus credenciales para acceder a tu panel.';
      btnSubmit.textContent = 'Iniciar Sesión';

      groupFullname.style.display = 'none';
      groupPhone.style.display = 'none';
      groupConfirmPassword.style.display = 'none';
      loginOptions.style.display = 'flex';

      footerText.innerHTML = '¿No tienes una cuenta? <a href="#" id="linkToggleAuth">Regístrate gratis</a>';
    }

    // Reasignar evento al link del footer
    document.getElementById('linkToggleAuth').addEventListener('click', (e) => {
      e.preventDefault();
      renderView(mode === 'register' ? 'login' : 'register');
    });

    if (window.lucide) lucide.createIcons();
  }

  tabLogin.addEventListener('click', () => renderView('login'));
  tabRegister.addEventListener('click', () => renderView('register'));

  const linkToggle = document.getElementById('linkToggleAuth');
  if (linkToggle) {
    linkToggle.addEventListener('click', (e) => {
      e.preventDefault();
      renderView('login');
    });
  }
});