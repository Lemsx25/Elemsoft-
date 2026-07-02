/* ══════════════════════════════════════════════════════════════
   ELEMSOFT main.js v3
   Canvas vivo · Nav scroll · Reveal · Contador · Acordeón
══════════════════════════════════════════════════════════════ */

/* ── EmailJS ── */
const EMAILJS_PUBLIC_KEY  = 'GxcF_9qsS4m0blJv2';
const EMAILJS_SERVICE_ID  = 'service_r3kfvkj';
const EMAILJS_TEMPLATE_ID = 'template_j9pxsji';
const WORKER_EMAILS = ['emprendpc825@gmail.com'];

/* ══════════════════════════════════════════════════════════════
   1. CANVAS — Fondo vivo que respira y responde al scroll+cursor
══════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;
  let scrollY = 0, maxScroll = 1;
  let mouseX = 0.5, mouseY = 0.5;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => {
    scrollY   = window.scrollY;
    maxScroll = Math.max(1, document.body.scrollHeight - H);
  }, { passive: true });
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }, { passive: true });
  resize();

  function blob(cx, cy, r, brightness) {
    const b = Math.round(brightness);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,    `rgba(${b},${b},${b},0.92)`);
    g.addColorStop(0.42, `rgba(${Math.round(b*.5)},${Math.round(b*.5)},${Math.round(b*.5)},0.38)`);
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function draw() {
    const sp = scrollY / maxScroll;
    const s = Math.sin, c = Math.cos;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    blob(W*(0.15 + mouseX*.18 + s(t*.12)*.08),  H*(0.25 - sp*.35 + c(t*.09)*.08 + mouseY*.10), W*.55, 27);
    blob(W*(0.82 + c(t*.10)*.12),                H*(0.72 + sp*.22 + s(t*.07)*.10),              W*.50, 20);
    blob(W*(0.50 + s(t*.15)*.10 + (mouseX-.5)*.12), H*(0.48 + s(t*.08)*.07 - sp*.15),          W*.38, 16);
    blob(W*(0.78 + s(t*.18)*.08),                H*(0.18 + c(t*.14)*.06 + sp*.10),              W*.28, 23);
    blob(W*(0.14 + c(t*.11)*.07),                H*(0.82 - sp*.08 + s(t*.09)*.06),              W*.32, 18);

    t += 0.006;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   2. NAV — Se solidifica al hacer scroll
══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════════════════════════════
   3. MENÚ MÓVIL
══════════════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  const ham  = document.getElementById('ham');
  const menu = document.getElementById('mobileMenu');
  if (ham)  ham.classList.toggle('open');
  if (menu) menu.classList.toggle('open');
}

/* ══════════════════════════════════════════════════════════════
   4. SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════════════════════════════ */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   5. CONTADOR ANIMADO en estadísticas
══════════════════════════════════════════════════════════════ */
(function initCounters() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      if (isNaN(end)) return;
      let cur = 0; const dur = 1400, step = 16, inc = end / (dur / step);
      clearInterval(el._t);
      el._t = setInterval(() => {
        cur += inc;
        if (cur >= end) { cur = end; clearInterval(el._t); }
        el.textContent = Math.floor(cur) + sfx;
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   6. ACORDEÓN DE SERVICIOS
══════════════════════════════════════════════════════════════ */
(function initServiceAccordion() {
  document.querySelectorAll('.svc-row').forEach(row => {
    row.addEventListener('click', () => {
      const detail = row.nextElementSibling;
      if (!detail || !detail.classList.contains('svc-detail')) return;
      const isOpen = detail.classList.contains('open');
      // Cerrar todos
      document.querySelectorAll('.svc-detail.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.svc-row.active').forEach(r => r.classList.remove('active'));
      if (!isOpen) {
        detail.classList.add('open');
        row.classList.add('active');
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   7. FIREBASE AUTH — actualizar nav con sesión activa
   (Solo en páginas que NO sean login/dashboard/worker)
══════════════════════════════════════════════════════════════ */
(function initNavAuth() {
  const page = window.location.pathname;
  if (page.endsWith('login.html') || page.endsWith('dashboard.html') || page.endsWith('worker.html') || page.endsWith('admin.html')) return;

  const VER = '9.22.2';
  const FB_CONFIG = {
    apiKey:'AIzaSyAYUz0m5R_ncBFCMFXCOzcArEkQnbVYWGo',
    authDomain:'elemsoftgt.firebaseapp.com',
    projectId:'elemsoftgt',
    storageBucket:'elemsoftgt.firebasestorage.app',
    messagingSenderId:'482757350889',
    appId:'1:482757350889:web:3c45a31d75f6b319562778'
  };
  function loadScript(src, cb) {
    const s = document.createElement('script'); s.src = src; s.onload = cb; document.head.appendChild(s);
  }
  loadScript('https://www.gstatic.com/firebasejs/'+VER+'/firebase-app-compat.js', () => {
    loadScript('https://www.gstatic.com/firebasejs/'+VER+'/firebase-auth-compat.js', () => {
      if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
      firebase.auth().onAuthStateChanged(user => {
        if (!user) return;
        const nombre  = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';
        const inicial = nombre.charAt(0).toUpperCase();
        document.querySelectorAll('a[href="login.html"]').forEach(el => {
          el.href      = WORKER_EMAILS.includes(user.email) ? 'worker.html' : 'dashboard.html';
          el.innerHTML = '<span class="nav-user-initial">'+inicial+'</span>'+nombre;
          el.classList.add('nav-user-link');
        });
      });
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   8. EMAILJS — envío de formularios
══════════════════════════════════════════════════════════════ */
function sendEmail(params, btn, original) {
  btn.textContent = 'ENVIANDO…'; btn.disabled = true;
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(() => {
      btn.textContent = 'ENVIADO ✓';
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3000);
    })
    .catch(err => {
      console.error(err);
      btn.textContent = 'ERROR — intenta de nuevo';
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3000);
    });
}

/* Formulario de contacto */
function handleContactSubmit(e) {
  e.preventDefault();
  const f   = e.target;
  const btn = f.querySelector('.form-submit');
  const nombre  = f.nombre.value.trim();
  const correo  = f.correo.value.trim();
  const mensaje = f.mensaje.value.trim();
  if (!nombre || !correo || !mensaje) {
    btn.textContent = 'Completa todos los campos →';
    btn.style.background = '#c0392b';
    setTimeout(() => { btn.textContent = 'Enviar mensaje →'; btn.style.background = ''; }, 2500);
    return;
  }
  const cupon = f.cupon ? f.cupon.value.trim().toUpperCase() : '';
  sendEmail({
    nombre, correo,
    servicio: f.servicio?.value || 'No especificado',
    mensaje:  cupon ? mensaje + '\n\n— Cupón: ' + cupon : mensaje,
    telefono: '—', prioridad: '—', entrega: '—'
  }, btn, 'Enviar mensaje →');
  setTimeout(() => f.reset(), 500);
}

/* Formulario de cotización rápida */
function handleQuoteSubmit(e) {
  e.preventDefault();
  const f   = e.target;
  const btn = f.querySelector('.form-submit');
  const detalle = f.detalle ? f.detalle.value.trim() : (f.querySelector('textarea') ? f.querySelector('textarea').value.trim() : '');
  const cupon   = f.cupon ? f.cupon.value.trim().toUpperCase() : '';
  sendEmail({
    nombre:    f.nombre?.value.trim() || '—',
    telefono:  f.telefono?.value.trim() || '—',
    correo:    '—',
    servicio:  f.servicio?.value || 'No especificado',
    prioridad: f.prioridad?.value || '—',
    entrega:   f.entrega?.value  || '—',
    mensaje:   (detalle || 'Sin detalles') + (cupon ? '\n\n— Cupón: ' + cupon : ''),
  }, btn, 'Solicitar cotización →');
  setTimeout(() => f.reset(), 500);
}
