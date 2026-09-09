document.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id);
  let mode='login';
  const error=$('authError');
  function render(next) {
    mode=next;error.textContent='';
    for(const [id,active] of [['tabLogin',mode==='login'],['tabRegister',mode==='register']]) {$(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',active);}
    for(const id of ['groupFullname','groupPhone','groupConfirmPassword']) {$(id).hidden=mode==='login';$(id).querySelector('input').required=mode==='register';}
    $('password').minLength=mode==='register'?8:1;$('password').autocomplete=mode==='register'?'new-password':'current-password';
    document.querySelector('.form-title').textContent=mode==='login'?'Bienvenido de nuevo':'Crea tu cuenta';
    document.querySelector('.form-subtitle').textContent=mode==='login'?'Ingresa para consultar y gestionar tus pedidos.':'Completa tus datos para empezar.';
    $('btnSubmit').textContent=mode==='login'?'Iniciar sesión':'Crear cuenta';
    $('footerText').innerHTML=mode==='login'?'¿Aún no tienes cuenta? <a href="#" id="linkToggleAuth">Regístrate</a>':'¿Ya tienes cuenta? <a href="#" id="linkToggleAuth">Inicia sesión</a>';
    $('linkToggleAuth').onclick=e=>{e.preventDefault();render(mode==='login'?'register':'login');};
  }
  $('tabLogin').onclick=()=>render('login');$('tabRegister').onclick=()=>render('register');
  document.querySelectorAll('.toggle-password').forEach(btn=>btn.onclick=()=>{const input=btn.parentElement.querySelector('input');input.type=input.type==='password'?'text':'password';btn.setAttribute('aria-label',input.type==='password'?'Mostrar contraseña':'Ocultar contraseña');btn.setAttribute('aria-pressed',input.type==='text');});
  function enter(user) {Mery.write(Mery.key('user'),user);location.href=user.rol==='ADMIN'?'admin.html':user.rol==='REPARTIDOR'?'repartidor.html':'pedidos.html';}
  $('authForm').onsubmit=async e=>{
    e.preventDefault();error.textContent='';
    if(mode==='register'&&$('password').value!==$('confirmPassword').value) {error.textContent='Las contraseñas no coinciden.';$('confirmPassword').focus();return;}
    if(!e.target.reportValidity()) return;
    if(Mery.demo&&mode==='login') {error.textContent='Usa los perfiles de demostración de abajo. No necesitas una contraseña real.';return;}
    const button=$('btnSubmit');button.disabled=true;button.textContent='Procesando…';
    try {
      const payload={nombre:$('fullname').value.trim(),email:$('email').value.trim(),telefono:$('phone').value,password:$('password').value};
      if(Mery.demo) {
        if(Mery.list('usuarios').some(u=>u.email.toLowerCase()===payload.email.toLowerCase())) throw new Error('Este correo ya existe en la demostración.');
        const user=await Mery.api('usuarios',{method:'POST',body:JSON.stringify({...payload,rolId:3,activo:true})});enter({...user,rol:'CLIENTE'});
      } else enter(await Mery.api(`auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}));
    } catch(err) {error.textContent=err.message;}
    finally {button.disabled=false;button.textContent=mode==='login'?'Iniciar sesión':'Crear cuenta';}
  };
  if(Mery.demo) {
    const panel=document.createElement('section');panel.className='demo-access';panel.innerHTML='<h3>Explora los tres perfiles</h3><p>Accesos ficticios, sin contraseña. Puedes cambiar de perfil para recorrer un pedido completo.</p><div></div>';
    for(const [rol,label] of [['CLIENTE','Cliente'],['ADMIN','Administrador'],['REPARTIDOR','Repartidor']]) {
      const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{const rolId=rol==='ADMIN'?1:rol==='REPARTIDOR'?2:3;const u=Mery.list('usuarios').find(u=>u.rolId===rolId&&u.activo);if(u)enter({...u,rol});else error.textContent='No hay un usuario activo para este perfil.';};panel.querySelector('div').append(button);
    }
    document.querySelector('.auth-card').append(panel);
  }
  render('login');
});
