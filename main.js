/* ═══════════════════════════════════════════════════
   ELEMSOFT · main.js
   Animaciones profesionales y ligeras
   ═══════════════════════════════════════════════════ */

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

  const params = {
    nombre:    f.nombre.value.trim(),
    correo:    f.correo.value.trim(),
    servicio:  f.servicio.value || 'No especificado',
    mensaje:   f.mensaje.value.trim() || 'Sin detalles adicionales',
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
