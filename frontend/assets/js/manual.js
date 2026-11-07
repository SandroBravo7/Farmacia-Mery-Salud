const roleLinks = [...document.querySelectorAll('.manual-roles a')];
const guides = [...document.querySelectorAll('.manual-guide')];

function showGuide() {
  const requested = location.hash.slice(1);
  const active = guides.some(guide => guide.id === requested) ? requested : 'clientes';
  guides.forEach(guide => { guide.hidden = guide.id !== active; });
  roleLinks.forEach(link => {
    if (link.hash === '#' + active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

roleLinks.forEach(link => {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showGuide();
  });
});
window.addEventListener('hashchange', showGuide);
window.addEventListener('popstate', showGuide);
showGuide();

const track = document.getElementById('manual-track');
const steps = [...document.querySelectorAll('[data-step]')];
const accountStep = steps.find(step => step.dataset.step === 'cuenta');
const storageKey = 'merysalud_manual_progreso';

function saveProgress() {
  const completed = steps.filter(step => step.querySelector('input').checked).map(step => step.dataset.step);
  const route = track.querySelector('input:checked').value;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ completed, route }));
  } catch {
    // La guía sigue funcionando si el navegador no permite guardar el avance.
  }
}

function updateRoute() {
  accountStep.hidden = track.querySelector('input:checked').value !== 'cuenta';
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved?.route === 'cuenta') track.querySelector('[value="cuenta"]').checked = true;
  if (Array.isArray(saved?.completed)) {
    steps.forEach(step => {
      step.querySelector('input').checked = saved.completed.includes(step.dataset.step);
    });
  }
} catch {
  // Si hay datos previos inválidos, se comienza con el recorrido de invitado.
}

steps.forEach(step => {
  const label = step.querySelector('.manual-check');
  label.hidden = false;
  label.addEventListener('change', saveProgress);
});

track.addEventListener('change', () => {
  updateRoute();
  saveProgress();
});
track.hidden = false;
updateRoute();
