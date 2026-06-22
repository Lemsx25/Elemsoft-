/* ═══════════════════════════════════════════════════════════════
   ELEMSOFT · animations.js
   Basado en el estilo de Gcore — GSAP + ScrollTrigger + Three.js
   ═══════════════════════════════════════════════════════════════ */

/* ── Esperar a que GSAP cargue ── */
function waitForGSAP(cb) {
  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); cb(); }
  else setTimeout(() => waitForGSAP(cb), 50);
}

/* ════════════════════════════════════════
   1. PRELOADER CIRCULAR (como Gcore)
   ════════════════════════════════════════ */
(function initPreloader() {
  const pl = document.createElement('div');
  pl.id = 'preloader';
  pl.innerHTML = `
    <div class="pl-inner">
      <svg class="pl-circle" viewBox="0 0 100 100">
        <circle class="pl-track" cx="50" cy="50" r="40"/>
        <circle class="pl-progress" cx="50" cy="50" r="40"/>
      </svg>
      <div class="pl-logo-wrap">
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:22px">
          <g stroke="white" stroke-width="2.5" stroke-linejoin="round"><path d="M48 30 L74 16 L112 36 L86 50 Z"/></g>
          <path d="M8 50 L34 36 L72 56 L46 70 Z" fill="white" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>`;
  document.body.appendChild(pl);
  document.body.style.overflow = 'hidden';

  // Animar el círculo de progreso
  const prog = pl.querySelector('.pl-progress');
  const circ = 2 * Math.PI * 40;
  prog.style.strokeDasharray = circ;
  prog.style.strokeDashoffset = circ;

  let start = null;
  const duration = 1200;
  function animCircle(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    prog.style.strokeDashoffset = circ * (1 - p);
    if (p < 1) requestAnimationFrame(animCircle);
    else {
      // Fade out preloader
      pl.style.transition = 'opacity .6s ease';
      pl.style.opacity = '0';
      document.body.style.overflow = '';
      setTimeout(() => { pl.remove(); startAnimations(); }, 650);
    }
  }
  requestAnimationFrame(animCircle);
})();

/* ════════════════════════════════════════
   2. TODAS LAS ANIMACIONES (post-preloader)
   ════════════════════════════════════════ */
function startAnimations() {
  waitForGSAP(() => {
    initCursor();
    initHeroCanvas();
    initHeroEntrance();
    initScrollAnimations();
    initBentoCards();
    initGlobe();
    initTypewriter();
    initNavScroll();
    initServiceTabs();
    initCounters();
    initMiscUI();
  });
}

/* ════════════════════════════════════════
   3. CURSOR PERSONALIZADO
   ════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const dot  = document.createElement('div'); dot.id  = 'cur-dot';
  const ring = document.createElement('div'); ring.id = 'cur-ring';
  document.body.append(dot, ring);

  let mx = -200, my = -200;
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0, overwrite: true });
    gsap.to(ring, { x: mx, y: my, duration: 0.18, ease: 'power2.out', overwrite: true });
  });

  const grow = el => {
    el.addEventListener('mouseenter', () => gsap.to(ring, { scale: 1.8, opacity: .5, duration: .3 }));
    el.addEventListener('mouseleave', () => gsap.to(ring, { scale: 1, opacity: 1, duration: .3 }));
  };
  document.querySelectorAll('a,button,.service-card,.value-card,.proceso-card,.stat-box,.nav-cta').forEach(grow);
  document.addEventListener('mousedown', () => gsap.to(ring, { scale: 0.7, duration: .1 }));
  document.addEventListener('mouseup',   () => gsap.to(ring, { scale: 1,   duration: .2 }));
}

/* ════════════════════════════════════════
   4. HERO CANVAS — rayo de luz + circuito
   ════════════════════════════════════════ */
function initHeroCanvas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  /* Canvas de partículas + circuito */
  const cvs = document.createElement('canvas');
  cvs.id = 'hero-canvas';
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  hero.insertBefore(cvs, hero.firstChild);
  const ctx = cvs.getContext('2d');

  let W, H, pts, lines, raf;
  function resize() { W = cvs.width = hero.offsetWidth; H = cvs.height = hero.offsetHeight; buildGrid(); }

  function buildGrid() {
    pts = []; lines = [];
    const cols = 14, rows = 8;
    const cx = W / cols, cy = H / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (Math.random() > .45) pts.push({ x: c*cx + Math.random()*cx*.5, y: r*cy + Math.random()*cy*.5, a: Math.random(), da: (Math.random()-.5)*.015 });
    }
    // Líneas de circuito horizontales/verticales
    for (let i = 0; i < 22; i++) {
      const x = Math.random()*W, y = Math.random()*H;
      const horiz = Math.random() > .5;
      lines.push({ x, y, horiz, len: 40 + Math.random()*120, progress: 0, speed: .003 + Math.random()*.006, alpha: 0, fade: 0 });
    }
  }

  // Rayo diagonal animado (como Gcore)
  let beamProgress = 0;
  gsap.to({}, { duration: 3, repeat: -1, repeatDelay: 2,
    onStart: () => { beamProgress = 0; },
    onUpdate: function() { beamProgress = this.progress(); }
  });

  function draw() {
    ctx.clearRect(0,0,W,H);

    // Rayo de luz diagonal naranja → blanco
    const bx = -200 + beamProgress * (W + 600);
    const grad = ctx.createLinearGradient(bx - 300, 0, bx + 100, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(.4, 'rgba(255,140,30,.025)');
    grad.addColorStop(.55, 'rgba(255,200,100,.06)');
    grad.addColorStop(.7, 'rgba(255,140,30,.025)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.transform(1, 0, -.5, 1, 0, 0); // skew diagonal
    ctx.fillStyle = grad;
    ctx.fillRect(bx - 300, 0, 600, H);
    ctx.restore();

    // Líneas de circuito
    lines.forEach(l => {
      l.progress = Math.min(l.progress + l.speed, 1);
      if (l.progress >= 1) { l.x = Math.random()*W; l.y = Math.random()*H; l.progress = 0; l.len = 40+Math.random()*120; }
      const drawn = l.len * l.progress;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(220,220,220,${.12 * l.progress * (1 - l.progress * .5)})`;
      ctx.lineWidth = .8;
      if (l.horiz) { ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + drawn, l.y); }
      else          { ctx.moveTo(l.x, l.y); ctx.lineTo(l.x, l.y + drawn); }
      ctx.stroke();
      // Punto brillante en el frente
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${.6 * l.progress})`;
      const ex = l.horiz ? l.x + drawn : l.x;
      const ey = l.horiz ? l.y : l.y + drawn;
      ctx.arc(ex, ey, 1, 0, Math.PI*2);
      ctx.fill();
    });

    // Puntos flotantes
    ctx.fillStyle = 'rgba(200,200,200,.6)';
    pts.forEach(p => {
      p.a += p.da;
      if (p.a > 1 || p.a < 0) p.da *= -1;
      ctx.globalAlpha = p.a * .4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); }, { passive: true });

  // Chips flotantes alrededor del hero (como Gcore)
  const chipData = [
    { icon:'⚙', label:'Mantenimiento', x:'8%',  y:'42%' },
    { icon:'💾', label:'Hardware',      x:'6%',  y:'60%' },
    { icon:'🔧', label:'Reparación',   x:'7%',  y:'78%' },
    { icon:'🖥', label:'Ensamble',     x:'82%', y:'42%' },
    { icon:'⚡', label:'Software',     x:'85%', y:'58%' },
    { icon:'🔒', label:'Seguridad',    x:'83%', y:'74%' },
  ];
  chipData.forEach((c, i) => {
    const chip = document.createElement('div');
    chip.className = 'hero-chip';
    chip.innerHTML = `<span class="chip-icon">${c.icon}</span><span class="chip-label">${c.label}</span>`;
    chip.style.cssText = `position:absolute;left:${c.x};top:${c.y};z-index:3;`;
    hero.appendChild(chip);
    gsap.from(chip, { opacity: 0, scale: .6, x: i < 3 ? -20 : 20, duration: .8, delay: 1 + i * .15, ease: 'back.out(1.7)' });
    gsap.to(chip, { y: i%2===0 ? -10 : 10, duration: 2 + i*.3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i*.2 });
  });
}

/* ════════════════════════════════════════
   5. HERO ENTRANCE — texto con GSAP
   ════════════════════════════════════════ */
function initHeroEntrance() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const tl = gsap.timeline({ delay: .1 });
  tl.from('.hero-badge', { opacity: 0, y: -20, duration: .7, ease: 'power3.out' })
    .from('.hero h1', { opacity: 0, y: 40, duration: .9, ease: 'power3.out' }, '-=.3')
    .from('.hero .btn-explore', { opacity: 0, y: 20, duration: .6, ease: 'power3.out' }, '-=.4')
    .from('.hero-scroll', { opacity: 0, duration: .5 }, '-=.2')
    .from('.hero-chip', { opacity: 0, stagger: .1, duration: .5 }, '-=.3');
}

/* ════════════════════════════════════════
   6. SCROLL ANIMATIONS — el efecto principal
      Secciones que emergen con scroll (como Gcore)
   ════════════════════════════════════════ */
function initScrollAnimations() {

  /* Texto que se revela palabra por palabra con ScrollTrigger */
  document.querySelectorAll('.section-title, .cta-content h2, .page-header h1').forEach(el => {
    // Split en spans por palabra
    const html = el.innerHTML;
    el.innerHTML = html.replace(/(<[^>]+>)|(\S+)/g, (m, tag, word) => {
      if (tag) return tag;
      return `<span class="gsap-word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="gsap-word-inner" style="display:inline-block">${word}&nbsp;</span></span>`;
    });

    gsap.from(el.querySelectorAll('.gsap-word-inner'), {
      y: '110%', opacity: 0, stagger: .06, duration: .75,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* Section eyebrow — línea + texto */
  gsap.utils.toArray('.section-eyebrow').forEach(el => {
    gsap.from(el, { opacity: 0, x: -20, duration: .6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* Section sub — fade in */
  gsap.utils.toArray('.section-sub').forEach(el => {
    gsap.from(el, { opacity: 0, y: 18, duration: .7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* Cards de servicios — stagger */
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 40, scale: .96, duration: .7,
      ease: 'power3.out', delay: i % 3 * .1,
      scrollTrigger: { trigger: card, start: 'top 88%', once: true }
    });
  });

  /* Value cards y proceso cards */
  gsap.utils.toArray('.value-card, .proceso-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 50, duration: .7, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: i * .12
    });
  });

  /* Stats — escala desde 0.8 */
  gsap.utils.toArray('.stat-box').forEach((box, i) => {
    gsap.from(box, {
      opacity: 0, scale: .8, duration: .6, ease: 'back.out(1.5)',
      delay: i * .1,
      scrollTrigger: { trigger: box, start: 'top 85%', once: true }
    });
  });

  /* Space-steps — deslizamiento */
  gsap.utils.toArray('.space-step').forEach((step, i) => {
    gsap.from(step, {
      opacity: 0, x: -30, duration: .6, ease: 'power2.out',
      delay: i * .15,
      scrollTrigger: { trigger: step, start: 'top 85%', once: true }
    });
  });

  /* CTA banner — zoom sutil */
  const cta = document.querySelector('.cta-content');
  if (cta) {
    gsap.from(cta.children, {
      opacity: 0, y: 30, stagger: .15, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: cta, start: 'top 80%', once: true }
    });
  }

  /* Scroll parallax en hero-bg */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* Proceso line que crece */
  gsap.utils.toArray('.proceso-line').forEach(line => {
    gsap.from(line, {
      scaleY: 0, transformOrigin: 'top center', duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: line, start: 'top 85%', once: true }
    });
  });

  /* C-items de contacto */
  gsap.utils.toArray('.c-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0, x: -20, duration: .5, ease: 'power2.out', delay: i * .1,
      scrollTrigger: { trigger: item, start: 'top 88%', once: true }
    });
  });
}

/* ════════════════════════════════════════
   7. BENTO CARDS — hover 3D + glow
   ════════════════════════════════════════ */
function initBentoCards() {
  document.querySelectorAll('.service-card, .value-card, .proceso-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(card, { rotateY: x*10, rotateX: -y*10, transformPerspective: 800,
        scale: 1.02, duration: .3, ease: 'power2.out', overwrite: true });
      // Glow que sigue el mouse
      card.style.setProperty('--mx', `${(x+.5)*100}%`);
      card.style.setProperty('--my', `${(y+.5)*100}%`);
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: .5,
        ease: 'power2.out', overwrite: true });
    });
  });
}

/* ════════════════════════════════════════
   8. GLOBO DE PUNTOS — THREE.JS
      (sección nosotros / espacio)
   ════════════════════════════════════════ */
function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container || !window.THREE) return;

  const W = container.offsetWidth, H = container.offsetHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W/H, .1, 100);
  camera.position.z = 2.8;

  // Puntos del globo
  const geo = new THREE.BufferGeometry();
  const count = 3000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    pos[i*3]   = Math.cos(theta) * Math.sin(phi);
    pos[i*3+1] = Math.sin(theta) * Math.sin(phi);
    pos[i*3+2] = Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: .012, transparent: true, opacity: .7 });
  const globe = new THREE.Points(geo, mat);
  scene.add(globe);

  // Halo naranja
  const haloGeo = new THREE.SphereGeometry(1.05, 32, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff6600, transparent: true, opacity: .08, side: THREE.BackSide
  });
  scene.add(new THREE.Mesh(haloGeo, haloMat));

  // Animación con ScrollTrigger
  gsap.to(globe.rotation, {
    y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none'
  });
  gsap.from(globe.material, {
    opacity: 0, duration: 1.5,
    scrollTrigger: { trigger: container, start: 'top 80%', once: true }
  });

  function render() { requestAnimationFrame(render); renderer.render(scene, camera); }
  render();
  window.addEventListener('resize', () => {
    const w2 = container.offsetWidth, h2 = container.offsetHeight;
    camera.aspect = w2/h2; camera.updateProjectionMatrix();
    renderer.setSize(w2, h2);
  }, { passive: true });
}

/* ════════════════════════════════════════
   9. TYPEWRITER ROTATIVO — scramble effect
   ════════════════════════════════════════ */
function initTypewriter() {
  const el = document.querySelector('.hero h1 .outline');
  if (!el) return;
  const words = ['Al límite.', 'Sin rival.', 'Con garantía.', 'Por expertos.'];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let idx = 0, timer;

  function scrambleTo(target) {
    const len = target.length;
    let iter = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      el.textContent = target.split('').map((c, i) => {
        if (i < iter) return target[i];
        return c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      iter += .5;
      if (iter >= len) { el.textContent = target; clearInterval(timer); setTimeout(next, 2200); }
    }, 35);
  }

  function next() { idx = (idx + 1) % words.length; scrambleTo(words[idx]); }
  setTimeout(() => scrambleTo(words[0]), 1500);
}

/* ════════════════════════════════════════
   10. NAV SCROLL
   ════════════════════════════════════════ */
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav || nav.classList.contains('solid')) return;
  ScrollTrigger.create({
    start: 'top -40',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });
}

/* ════════════════════════════════════════
   11. SERVICES TABS
   ════════════════════════════════════════ */
function initServiceTabs() {
  const grid = document.querySelector('.services-grid--expand'); if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.service-card'));
  const isDesktop = () => window.matchMedia('(min-width:769px)').matches;

  function buildTabs(active) {
    const t = active.querySelector('.service-tabs'); if (!t) return; t.innerHTML = '';
    cards.forEach(other => {
      if (other === active) return;
      const btn = document.createElement('button'); btn.type='button'; btn.className='service-tab';
      btn.textContent = other.dataset.name || '';
      btn.onclick = e => { e.preventDefault(); e.stopPropagation(); setActive(other); };
      t.appendChild(btn);
    });
  }
  function setActive(card) {
    cards.forEach(c => { c.classList.remove('is-active'); const t = c.querySelector('.service-tabs'); if (t) t.innerHTML=''; });
    card.classList.add('is-active'); grid.classList.add('has-active'); buildTabs(card);
    gsap.from(card.querySelector('.service-expand-content'), { opacity: 0, x: 20, duration: .4, ease: 'power2.out' });
  }
  function clearActive() {
    cards.forEach(c => { c.classList.remove('is-active'); const t = c.querySelector('.service-tabs'); if (t) t.innerHTML=''; });
    grid.classList.remove('has-active');
  }
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => { if (!isDesktop()) return; setActive(card); });
    card.addEventListener('click', e => {
      if (isDesktop()) return;
      if (e.target.closest('.service-tab,a,button')) return;
      card.classList.contains('is-active') ? clearActive() : setActive(card);
    });
  });
  grid.addEventListener('mouseleave', () => { if (!isDesktop()) return; clearActive(); });
}

/* ════════════════════════════════════════
   12. CONTADORES ANIMADOS
   ════════════════════════════════════════ */
function initCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const text = el.textContent.trim();
    const m = text.match(/[\d.]+/); if (!m) return;
    const end = parseFloat(m[0]), suffix = text.replace(m[0], '');
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(obj, {
        val: end, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { el.textContent = (Number.isInteger(end) ? Math.floor(obj.val) : obj.val.toFixed(0)) + suffix; }
      })
    });
  });
}

/* ════════════════════════════════════════
   13. MISC UI
   ════════════════════════════════════════ */
function initMiscUI() {
  // Íconos animados en tarjetas
  const SERVICE_ICONS = {
    'Mantenimiento preventivo': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="1.5"/><g class="fan-blade"><path d="M24 16C24 16 20 8 14 10C14 10 16 18 24 16Z" fill="currentColor" opacity=".6"/><path d="M24 32C24 32 28 40 34 38C34 38 32 30 24 32Z" fill="currentColor" opacity=".6"/><path d="M16 24C16 24 8 20 10 14C10 14 18 16 16 24Z" fill="currentColor" opacity=".6"/><path d="M32 24C32 24 40 28 38 34C38 34 30 32 32 24Z" fill="currentColor" opacity=".6"/></g><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`,
    'Mantenimiento correctivo': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><rect x="8" y="14" width="32" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1.5"/><path class="alert-blink" d="M24 26L27 31H21L24 26Z" fill="currentColor"/></svg>`,
    'Actualización de hardware': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><rect x="14" y="20" width="20" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path class="arrow-up" d="M24 10L28 15H20L24 10Z" fill="currentColor"/><line x1="24" y1="11" x2="24" y2="20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'Ensamble de PC': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><rect x="10" y="12" width="28" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="18" y="19" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/><circle class="chip-pulse" cx="24" cy="24" r="3" fill="currentColor" opacity=".4"/></svg>`,
    'Instalación de software': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="17" x2="38" y2="17" stroke="currentColor" stroke-width="1.5"/><path class="code-line" d="M16 24L20 28L16 32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    'Optimización de software': `<svg class="svc-icon" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="12" stroke="currentColor" stroke-width="1.5"/><g class="gear-inner"><circle cx="24" cy="24" r="3" fill="currentColor"/><line x1="24" y1="12" x2="24" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="32" x2="24" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="24" x2="16" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>`
  };
  document.querySelectorAll('.service-card').forEach(card => {
    const name = card.dataset.name; if (!name || !SERVICE_ICONS[name]) return;
    const main = card.querySelector('.service-main'); if (!main) return;
    const wrap = document.createElement('div'); wrap.className = 'svc-icon-wrap';
    wrap.innerHTML = SERVICE_ICONS[name]; main.insertBefore(wrap, main.firstChild);
  });

  // Formularios
  window.handleSubmit = function(e) {
    e.preventDefault(); const btn = e.target.querySelector('.form-submit');
    btn.textContent='MENSAJE ENVIADO'; btn.style.background='#555';
    setTimeout(()=>{btn.textContent='Enviar mensaje →';btn.style.background='';e.target.reset();},3000);
  };
  window.handleQuoteSubmit = function(e) {
    e.preventDefault(); const btn = e.target.querySelector('.form-submit'), orig=btn.textContent;
    btn.textContent='SOLICITUD ENVIADA'; btn.style.background='#555';
    setTimeout(()=>{btn.textContent=orig;btn.style.background='';e.target.reset();},3000);
  };
  document.querySelectorAll('select').forEach(s => {
    s.addEventListener('change', () => { s.style.color = s.value ? 'var(--white)' : ''; });
  });

  // Ticker pausa
  const ticker = document.querySelector('.ticker');
  if (ticker) {
    ticker.addEventListener('mouseenter', () => ticker.querySelector('.ticker-inner').style.animationPlayState='paused');
    ticker.addEventListener('mouseleave', () => ticker.querySelector('.ticker-inner').style.animationPlayState='running');
  }
}
