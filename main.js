/* ═══════════════════════════════════════════════════
   ELEMSOFT · main.js
   Animaciones profesionales y ligeras
   ═══════════════════════════════════════════════════ */

/* ── Configuración global del sitio ──────────────────
   Para deshabilitar el apartado de Ensamble:
   cambia  ensamble: true  →  ensamble: false
   ──────────────────────────────────────────────────── */
const ELEMSOFT_CONFIG = {
  ensamble: false   // ← pon false para ocultar el módulo de Ensamble
};

/* ── EmailJS ── */
const EMAILJS_PUBLIC_KEY = '0MsPuS4wESYBqzNOg';
const EMAILJS_SERVICE_ID = 'service_1zjy0vu';
const EMAILJS_TEMPLATE_ID = 'template_a4gkko6';

(function initEmailJS() {
  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
})();

function sendEmail(params, btn, originalText) {
  btn.textContent = 'ENVIANDO…';
  btn.style.background = '#cccccc';
  btn.disabled = true;

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(() => {
      btn.textContent = 'MENSAJE ENVIADO ✓';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    })
    .catch((err) => {
      console.error('Error al enviar correo:', err);
      btn.textContent = 'ERROR — intenta de nuevo';
      btn.style.background = '#e05050';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
}

/* ── Formulario de contacto → Gmail ── */
function handleContactSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('.form-submit');
  const original = btn.textContent;

  // Validación: ningún campo obligatorio puede estar vacío
  const nombre  = f.nombre.value.trim();
  const correo  = f.correo.value.trim();
  const mensaje = f.mensaje.value.trim();

  if (!nombre || !correo || !mensaje) {
    btn.textContent = 'Completa todos los campos →';
    btn.style.background = '#c0392b';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 2500);
    return;
  }

  const params = {
    nombre,
    correo,
    servicio:  f.servicio.value || 'No especificado',
    mensaje,
    telefono:  '—',
    prioridad: '—',
    entrega:   '—'
  };

  sendEmail(params, btn, original);
  setTimeout(() => f.reset(), 500);
}

/* ── Formulario de cotización rápida → Gmail ── */
function handleQuoteSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('.form-submit');
  const original = btn.textContent;

  const params = {
    nombre:    f.nombre.value.trim(),
    telefono:  f.telefono.value.trim(),
    servicio:  f.servicio.value || 'No especificado',
    prioridad: f.prioridad.value,
    entrega:   f.entrega.value,
    mensaje:   f.detalle.value.trim() || 'Sin detalles adicionales',
    correo:    '—'
  };

  sendEmail(params, btn, original);
  setTimeout(() => f.reset(), 500);
}

/* ── Select color ── */
document.querySelectorAll('select').forEach(sel => {
  sel.addEventListener('change', () => { sel.style.color = sel.value ? 'var(--white)' : ''; });
});

/* ── Nav scroll ── */
const nav = document.querySelector('nav');
if (nav && !nav.classList.contains('solid')) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ── Barra de progreso de lectura ── */
const progressBar = document.createElement('div');
progressBar.id = 'read-progress';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ── Scroll reveal mejorado con stagger ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.service-card, .stat-box, .c-item, .value-card, .space-step, .build-row, .faq-item, .quote-card, .proceso-card'
).forEach((el, i) => {
  el.classList.add('reveal');
  // stagger dentro del mismo contenedor
  const siblings = el.parentElement ? el.parentElement.querySelectorAll('.reveal') : [];
  const idx = Array.from(siblings).indexOf(el);
  el.dataset.delay = idx * 80;
  revealObserver.observe(el);
});

/* ── Contador animado para estadísticas ── */
function animateCount(el) {
  const text = el.textContent.trim();
  const numMatch = text.match(/[\d.]+/);
  if (!numMatch) return;
  const end = parseFloat(numMatch[0]);
  const suffix = text.replace(numMatch[0], '');
  const duration = 1200;
  const step = 16;
  const steps = duration / step;
  let current = 0;
  const inc = end / steps;
  const timer = setInterval(() => {
    current += inc;
    if (current >= end) { current = end; clearInterval(timer); }
    el.textContent = (Number.isInteger(end) ? Math.floor(current) : current.toFixed(0)) + suffix;
  }, step);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => countObserver.observe(el));

/* ── Íconos SVG animados en tarjetas de servicios ── */
const SERVICE_ICONS = {
  'Mantenimiento preventivo': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="1.5"/>
    <g class="fan-blade">
      <path d="M24 16C24 16 20 8 14 10C14 10 16 18 24 16Z" fill="currentColor" opacity=".6"/>
      <path d="M24 32C24 32 28 40 34 38C34 38 32 30 24 32Z" fill="currentColor" opacity=".6"/>
      <path d="M16 24C16 24 8 20 10 14C10 14 18 16 16 24Z" fill="currentColor" opacity=".6"/>
      <path d="M32 24C32 24 40 28 38 34C38 34 30 32 32 24Z" fill="currentColor" opacity=".6"/>
    </g>
    <circle cx="24" cy="24" r="3" fill="currentColor"/>
  </svg>`,

  'Mantenimiento correctivo': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="14" width="32" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1.5"/>
    <rect class="scan-bar" x="8" y="20" width="0" height="14" fill="currentColor" opacity=".08"/>
    <circle cx="13" cy="17" r="1.5" fill="currentColor" opacity=".5"/>
    <circle cx="18" cy="17" r="1.5" fill="currentColor" opacity=".5"/>
    <circle cx="23" cy="17" r="1.5" fill="currentColor" opacity=".5"/>
    <path class="alert-blink" d="M24 26L27 31H21L24 26Z" fill="currentColor"/>
    <line x1="24" y1="27.5" x2="24" y2="29" stroke="#0a0a0a" stroke-width="1"/>
    <circle cx="24" cy="30" r=".5" fill="#0a0a0a"/>
  </svg>`,

  'Actualización de hardware': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="20" width="20" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <rect x="17" y="23" width="4" height="6" stroke="currentColor" stroke-width="1"/>
    <rect x="23" y="23" width="4" height="6" stroke="currentColor" stroke-width="1"/>
    <line x1="22" y1="20" x2="22" y2="17" stroke="currentColor" stroke-width="1.5"/>
    <line x1="26" y1="20" x2="26" y2="17" stroke="currentColor" stroke-width="1.5"/>
    <path class="arrow-up" d="M24 10L28 15H20L24 10Z" fill="currentColor"/>
    <line x1="24" y1="11" x2="24" y2="17" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  'Ensamble de PC': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="12" width="28" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <rect class="chip-block" x="18" y="19" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <line x1="10" y1="19" x2="18" y2="19" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="10" y1="24" x2="18" y2="24" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="10" y1="29" x2="18" y2="29" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="30" y1="19" x2="38" y2="19" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="30" y1="24" x2="38" y2="24" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="30" y1="29" x2="38" y2="29" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <circle class="chip-pulse" cx="24" cy="24" r="3" fill="currentColor" opacity=".4"/>
  </svg>`,

  'Instalación de software': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <line x1="10" y1="17" x2="38" y2="17" stroke="currentColor" stroke-width="1.5"/>
    <path class="code-line" d="M16 24L20 28L16 32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line class="code-dash" x1="22" y1="32" x2="32" y2="32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  'Optimización de software': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="12" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="24" cy="24" r="7" stroke="currentColor" stroke-width="1" opacity=".4"/>
    <g class="gear-inner">
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
      <line x1="24" y1="12" x2="24" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="32" x2="24" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="24" x2="16" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="15.5" y1="15.5" x2="18.3" y2="18.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="29.7" y1="29.7" x2="32.5" y2="32.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="32.5" y1="15.5" x2="29.7" y2="18.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18.3" y1="29.7" x2="15.5" y2="32.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>
  </svg>`
};

document.querySelectorAll('.service-card').forEach(card => {
  const name = card.dataset.name;
  if (!name || !SERVICE_ICONS[name]) return;
  const main = card.querySelector('.service-main');
  if (!main) return;
  const iconWrap = document.createElement('div');
  iconWrap.className = 'svc-icon-wrap';
  iconWrap.innerHTML = SERVICE_ICONS[name];
  main.insertBefore(iconWrap, main.firstChild);
});

/* ── Typewriter en build-rows (ensamble) ── */
const buildRows = document.querySelectorAll('.build-row');
if (buildRows.length) {
  buildRows.forEach((row, i) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-12px)';
    row.style.transition = 'opacity .4s ease, transform .4s ease';
  });
  const buildObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      buildRows.forEach((row, i) => {
        setTimeout(() => {
          row.style.opacity = '1';
          row.style.transform = 'translateX(0)';
        }, i * 180);
      });
      buildObserver.disconnect();
    }
  }, { threshold: 0.3 });
  if (buildRows[0]) buildObserver.observe(buildRows[0].closest('.build-visual') || buildRows[0]);
}

/* ── Services tabs ── */
(function initServiceTabs(){
  const grid = document.querySelector('.services-grid--expand');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.service-card'));
  const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

  function buildTabs(activeCard) {
    const tabsEl = activeCard.querySelector('.service-tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    cards.forEach(other => {
      if (other === activeCard) return;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'service-tab';
      btn.textContent = other.dataset.name || '';
      btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setActive(other); });
      tabsEl.appendChild(btn);
    });
  }

  function setActive(card) {
    cards.forEach(c => { c.classList.remove('is-active'); const t = c.querySelector('.service-tabs'); if (t) t.innerHTML = ''; });
    card.classList.add('is-active');
    grid.classList.add('has-active');
    buildTabs(card);
  }

  function clearActive() {
    cards.forEach(c => { c.classList.remove('is-active'); const t = c.querySelector('.service-tabs'); if (t) t.innerHTML = ''; });
    grid.classList.remove('has-active');
  }

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => { if (!isDesktop()) return; setActive(card); });
    card.addEventListener('click', (e) => {
      if (isDesktop()) return;
      if (e.target.closest('.service-tab, a, button')) return;
      card.classList.contains('is-active') ? clearActive() : setActive(card);
    });
  });
  grid.addEventListener('mouseleave', () => { if (!isDesktop()) return; clearActive(); });
})();

/* ── Control de módulo Ensamble ────────────────────────
   Si ELEMSOFT_CONFIG.ensamble === false:
   - Oculta los links de "Ensamble" en el nav de todas las páginas
   - En ensamble.html, reemplaza el contenido con una pantalla "Próximamente"
   ──────────────────────────────────────────────────── */
(function controlEnsamble() {
  if (ELEMSOFT_CONFIG.ensamble) return; // habilitado → no hacer nada

  // Reemplazar los links dentro de la service-card de Ensamble de PC
  // con un botón de WhatsApp para cotizar
  const WA_URL = 'https://wa.me/message/J3GODZO6I6XGD1';
  const WA_MSG = encodeURIComponent('Hola, me interesa cotizar un ensamble de PC personalizado.');
  const WA_FULL = `${WA_URL}?text=${WA_MSG}`;

  // Botón estilo consistente con el resto del sitio
  function waBtnHTML(label, cssClass) {
    return `<a href="${WA_FULL}" target="_blank" rel="noopener" class="${cssClass}"
      style="display:inline-flex;align-items:center;gap:0.5rem;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.121 1.522 5.856L.044 23.45a.75.75 0 0 0 .918.918l5.594-1.478A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.503-5.234-1.381l-.374-.214-3.877 1.024 1.024-3.877-.214-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      ${label}
    </a>`;
  }

  // Reemplazar link "Ver más →" en la vista compacta de la card
  document.querySelectorAll('.service-card[data-name="Ensamble de PC"] .service-arrow').forEach(el => {
    el.outerHTML = waBtnHTML('Cotizar por WhatsApp →', 'service-arrow');
  });

  // Reemplazar botón "Ver página de ensamble" en la vista expandida
  document.querySelectorAll('.service-card[data-name="Ensamble de PC"] .btn-dark').forEach(el => {
    el.outerHTML = waBtnHTML('Cotizar ensamble por WhatsApp', 'btn-dark');
  });

  // Ocultar links de nav que apunten a ensamble.html
  document.querySelectorAll('a[href="ensamble.html"]').forEach(el => {
    const li = el.closest('li');
    if (li) li.style.display = 'none';
    else el.style.display = 'none';
  });

  // Si estamos en ensamble.html → mostrar pantalla "Próximamente"
  if (window.location.pathname.endsWith('ensamble.html')) {
    document.addEventListener('DOMContentLoaded', () => {
      // Ocultar todo el body excepto nav y footer
      document.querySelectorAll('body > *:not(nav):not(footer):not(.footer-bottom):not(script)').forEach(el => {
        el.style.display = 'none';
      });

      // Insertar pantalla de próximamente
      const coming = document.createElement('div');
      coming.style.cssText = `
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 4rem 2rem;
        font-family: 'Space Grotesk', sans-serif;
      `;
      coming.innerHTML = `
        <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#555;margin-bottom:1rem;">Ensamble personalizado</p>
        <h1 style="font-size:clamp(2rem,6vw,4rem);font-weight:700;margin:0 0 1.5rem;color:#fff;line-height:1.1;">Próximamente.</h1>
        <p style="font-size:1rem;color:#666;max-width:420px;line-height:1.7;margin-bottom:2.5rem;">
          Estamos trabajando en algo grande. Pronto podrás configurar tu PC ideal desde aquí, pieza por pieza.
        </p>
        <a href="contacto.html" style="display:inline-block;padding:0.75rem 2rem;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#ccc;text-decoration:none;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.2s;"
          onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fff'"
          onmouseout="this.style.background='';this.style.color='#ccc'">
          Cotizar por ahora →
        </a>
      `;
      document.querySelector('nav').insertAdjacentElement('afterend', coming);
    });
  }
})();

/* ── Firebase Auth — indicador de sesión en el nav ────────────
   Carga Firebase dinámicamente en las páginas que no son login
   ni dashboard, y actualiza el link "Iniciar sesión" por el
   nombre del usuario cuando hay sesión activa. Esto hace que
   la sesión persista visualmente al navegar entre páginas.
   ──────────────────────────────────────────────────────────── */
(function initNavAuth() {
  const page = window.location.pathname;
  // login.html y dashboard.html manejan Firebase por sí solos
  if (page.endsWith('login.html') || page.endsWith('dashboard.html')) return;

  const VER = '9.22.2';
  const FB_CONFIG = {
    apiKey:            'AIzaSyAYUz0m5R_ncBFCMFXCOzcArEkQnbVYWGo',
    authDomain:        'elemsoftgt.firebaseapp.com',
    projectId:         'elemsoftgt',
    storageBucket:     'elemsoftgt.firebasestorage.app',
    messagingSenderId: '482757350889',
    appId:             '1:482757350889:web:3c45a31d75f6b319562778'
  };

  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src; s.onload = cb;
    document.head.appendChild(s);
  }

  loadScript(
    'https://www.gstatic.com/firebasejs/' + VER + '/firebase-app-compat.js',
    function() {
      loadScript(
        'https://www.gstatic.com/firebasejs/' + VER + '/firebase-auth-compat.js',
        function() {
          if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
          firebase.auth().onAuthStateChanged(function(user) {
            actualizarNavSesion(user);
          });
        }
      );
    }
  );
})();

function actualizarNavSesion(user) {
  if (!user) return;
  const nombre  = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';
  const inicial = nombre.charAt(0).toUpperCase();

  // Reemplazar todos los links "Iniciar sesión" por el indicador de cuenta
  document.querySelectorAll('a[href="login.html"]').forEach(function(el) {
    el.href      = 'dashboard.html';
    el.innerHTML = '<span class="nav-user-initial">' + inicial + '</span>' + nombre;
    el.classList.add('nav-user-link');
    el.classList.remove('active');
  });
}
