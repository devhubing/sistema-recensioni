'use strict';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector('.progress');
let scrollQueued = false;
function updateProgress() {
  const available = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${available > 0 ? scrollY / available : 0})`;
  scrollQueued = false;
}
function queueProgress() {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
}
addEventListener('scroll', queueProgress, { passive: true });
addEventListener('resize', queueProgress);
updateProgress();

// Footer: reuse the design-system composition, adapted to the dentist landing copy.
if (!document.querySelector('link[href="footer-design.css"]')) {
  const footerStyles = document.createElement('link');
  footerStyles.rel = 'stylesheet';
  footerStyles.href = 'footer-design.css';
  document.head.appendChild(footerStyles);
}
const landingFooter = document.querySelector('footer');
if (landingFooter) {
  landingFooter.className = 'design-footer';
  landingFooter.innerHTML = `
    <div class="footer-design-wrap">
      <div class="footer-design-top">
        <p>La reputazione del tuo studio può diventare una ragione in più per essere scelto.<br>Inizia dal Test di Preferibilità Locale™.</p>
        <a class="footer-design-cta" href="#richiedi">Richiedi il test gratuito <span aria-hidden="true">↑</span></a>
      </div>
      <div class="footer-design-word" aria-label="Sistema Recensioni">sistema-recensioni<span class="footer-design-star" aria-hidden="true">✳&#xFE0E;</span></div>
      <div class="footer-design-bottom">
        <span>SISTEMA RECENSIONI / 2026</span>
        <span>PREFERENZA LOCALE. REPUTAZIONE CHE LAVORA.</span>
        <a href="#inizio">Torna su ↑</a>
      </div>
    </div>`;
}

// Dashboard mockup: use the high-quality transparent WEBP and preserve its natural proportions.
const dashboardFigure = document.querySelector('.dashboard-media');
const dashboardImage = dashboardFigure?.querySelector('img');
if (dashboardFigure && dashboardImage) {
  dashboardFigure.classList.remove('media-slot');
  dashboardImage.src = 'assets/dashboard.webp';
  dashboardImage.removeAttribute('width');
  dashboardImage.removeAttribute('height');
  dashboardImage.style.width = '100%';
  dashboardImage.style.maxWidth = '100%';
  dashboardImage.style.height = 'auto';
  dashboardImage.style.aspectRatio = 'auto';
  dashboardImage.style.objectFit = 'contain';
  dashboardImage.style.borderRadius = '0';
}

// Contact form cleanup requested for the dentist landing.
const contactStar = document.querySelector('.contact-star');
if (contactStar) contactStar.remove();
const priorityFieldset = [...document.querySelectorAll('#studio-form fieldset')].find(fieldset =>
  fieldset.querySelector('legend')?.textContent.trim().toLowerCase().startsWith('priorità nei prossimi 12 mesi')
);
if (priorityFieldset) priorityFieldset.remove();

// Native sticky positioning with offsets measured from the actual title and navbar.
const receptionSection = document.querySelector('.reception-section');
const receptionHeading = document.querySelector('.reception-title-bar');
const receptionIntro = document.querySelector('.reception-intro');
const siteHeader = document.querySelector('.topbar');

// Keep both the section title and its explanatory copy visible while the cards stack.
// Moving the intro inside the sticky heading also lets the existing ResizeObserver
// measure the real combined height and keep the cards correctly offset at every width.
if (receptionHeading && receptionIntro && !receptionHeading.contains(receptionIntro)) {
  receptionHeading.appendChild(receptionIntro);
  receptionIntro.style.margin = '18px 0 0';
}

if (receptionSection && receptionHeading && siteHeader) {
  const updateReceptionOffsets = () => {
    receptionSection.style.setProperty('--reception-nav-height', `${Math.ceil(siteHeader.getBoundingClientRect().height)}px`);
    receptionSection.style.setProperty('--reception-heading-height', `${Math.ceil(receptionHeading.getBoundingClientRect().height)}px`);
  };
  updateReceptionOffsets();
  if ('ResizeObserver' in window) {
    const receptionResizeObserver = new ResizeObserver(updateReceptionOffsets);
    receptionResizeObserver.observe(receptionHeading);
    receptionResizeObserver.observe(siteHeader);
  } else {
    addEventListener('resize', updateReceptionOffsets, { passive: true });
  }
  if (document.fonts) document.fonts.ready.then(updateReceptionOffsets);
}

// Pinned, scroll-driven sequences. The wrapper pins under the navbar and vertical scroll advances
// through `count` states: each state holds still for `hold` screens, then eases to the next over `move`.
// The rendered position follows the scroll with a light inertia. With reduced motion nothing pins.
function createPinnedSequence({ wrap, count, pinnedClass, hold = 0.45, move = 0.85, tail = 0, smoothMs = 130, render, setMode }) {
  const header = document.querySelector('.topbar');
  const lastIndex = count - 1;
  const sequenceScreens = count * hold + lastIndex * move;
  // `tail` keeps the section pinned on the last state a little longer (e.g. while the next block slides over it).
  const travelScreens = sequenceScreens + tail;
  wrap.style.setProperty('--travel', travelScreens);

  const positionAt = progressValue => {
    const scrolled = progressValue * travelScreens;
    const cycle = hold + move;
    const index = Math.floor(scrolled / cycle);
    if (scrolled >= sequenceScreens || index >= lastIndex) return lastIndex;
    const within = scrolled - index * cycle;
    if (within <= hold) return index;
    const t = (within - hold) / move;
    return index + t * t * (3 - 2 * t);
  };

  let currentPosition = 0;
  let lastFrame = 0;
  let snapNextFrame = true;
  let frameRequest = 0;
  let listening = false;

  const targetPosition = () => {
    const navHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    wrap.style.setProperty('--nav-h', `${navHeight}px`);
    const rect = wrap.getBoundingClientRect();
    const travel = Math.max(1, rect.height - (innerHeight - navHeight));
    return positionAt(Math.min(1, Math.max(0, (navHeight - rect.top) / travel)));
  };

  const frame = now => {
    frameRequest = 0;
    if (!wrap.classList.contains(pinnedClass)) return;
    const target = targetPosition();
    const elapsed = lastFrame ? Math.min(64, now - lastFrame) : 16;
    if (snapNextFrame) {
      currentPosition = target;
      snapNextFrame = false;
    } else {
      currentPosition += (target - currentPosition) * (1 - Math.exp(-elapsed / smoothMs));
    }
    if (Math.abs(target - currentPosition) < 0.0005) currentPosition = target;
    render(currentPosition);
    if (currentPosition !== target) {
      lastFrame = now;
      frameRequest = requestAnimationFrame(frame);
    } else {
      lastFrame = 0;
    }
  };
  const queue = () => {
    if (!frameRequest) frameRequest = requestAnimationFrame(frame);
  };

  const applyMode = () => {
    const pinned = !motionPreference.matches;
    wrap.classList.toggle(pinnedClass, pinned);
    setMode(pinned);
    snapNextFrame = true;
    queue();
  };
  applyMode();
  motionPreference.addEventListener('change', applyMode);

  new IntersectionObserver(entries => {
    const inView = entries[0].isIntersecting;
    if (inView && !listening) {
      // Entering from above or below: start from the real position, not from the first state.
      snapNextFrame = true;
      addEventListener('scroll', queue, { passive: true });
      addEventListener('resize', queue);
      listening = true;
      queue();
    } else if (!inView && listening) {
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      listening = false;
    }
  }).observe(wrap);
}
const clamp01 = value => Math.min(1, Math.max(0, value));

// Section 02: Volano della Preferenza. Scroll walks steps 1 -> 6 around the wheel and then closes the loop
// back on step 1. While still pinned, the outro card slides up over the wheel.
const VOLANO_TAIL = 0.9; // screens; keep in sync with the outro's negative margin in styles.css (90svh)
const volano = document.querySelector('.volano');
const volanoOutro = document.querySelector('.volano-outro');
if (volano && 'IntersectionObserver' in window) {
  const volanoSteps = [...volano.querySelectorAll('.volano-step')];
  const volanoNodes = [...volano.querySelectorAll('.volano-node')];
  const volanoArrows = [...volano.querySelectorAll('.volano-arrow')];
  const volanoBars = [...volano.querySelectorAll('.volano-progress span')];
  const volanoArc = volano.querySelector('.volano-progress-arc');
  const stepCount = volanoSteps.length;
  const loopDistance = (index, position) => {
    // Step 1 is both the start (0) and the end of the loop (stepCount).
    const direct = index - position;
    return index === 0 && Math.abs(stepCount - position) < Math.abs(direct) ? stepCount - position : direct;
  };
  createPinnedSequence({
    wrap: volano,
    count: stepCount + 1,
    pinnedClass: 'is-pinned',
    hold: 0.4,
    move: 0.6,
    tail: VOLANO_TAIL,
    setMode: pinned => {
      if (pinned) return;
      volanoArc.style.strokeDashoffset = '';
      volano.style.removeProperty('--cover');
      volanoNodes.forEach(node => node.classList.remove('is-active', 'is-done'));
      volanoSteps.forEach(step => step.removeAttribute('aria-hidden'));
    },
    render: position => {
      volanoArc.style.strokeDashoffset = String(100 - (position / stepCount) * 100);
      const activeIndex = Math.round(position) % stepCount;
      volanoNodes.forEach((node, index) => {
        node.classList.toggle('is-active', index === activeIndex);
        node.classList.toggle('is-done', index <= position + 0.5);
      });
      volanoArrows.forEach((arrow, index) => arrow.classList.toggle('is-done', position >= index + 0.5));
      volanoSteps.forEach((step, index) => {
        const distance = loopDistance(index, position);
        step.style.setProperty('--d', Math.max(-1, Math.min(1, distance)).toFixed(4));
        // Sequential fade: the outgoing text is gone before the incoming one appears.
        step.style.setProperty('--fade', clamp01(1 - Math.abs(distance) * 2.4).toFixed(3));
        step.setAttribute('aria-hidden', String(index !== activeIndex));
      });
      volanoBars.forEach((bar, index) => bar.style.setProperty('--fill', clamp01(position - index + 1).toFixed(4)));
      // 0 -> 1 while the outro card rises over the pinned wheel.
      if (volanoOutro) {
        const cover = clamp01((innerHeight - volanoOutro.getBoundingClientRect().top) / (innerHeight * VOLANO_TAIL));
        volano.style.setProperty('--cover', cover.toFixed(3));
      }
    }
  });
}

// The outro then sticks and the "Il sistema" intro slides over it. It sticks under the navbar, or later
// if it is taller than the viewport, so its last line is always read before being covered.
const systemSection = document.querySelector('.system-section');
if (volano && volanoOutro && systemSection) {
  const header = document.querySelector('.topbar');
  let outroQueued = false;
  const updateOutro = () => {
    outroQueued = false;
    if (!volano.classList.contains('is-pinned')) return;
    const navHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    volanoOutro.style.setProperty('--stick-top', `${Math.min(navHeight, innerHeight - volanoOutro.offsetHeight)}px`);
    const cover = clamp01((innerHeight - systemSection.getBoundingClientRect().top) / (innerHeight * VOLANO_TAIL));
    volanoOutro.style.setProperty('--cover', cover.toFixed(3));
  };
  const queueOutro = () => {
    if (!outroQueued) { outroQueued = true; requestAnimationFrame(updateOutro); }
  };
  addEventListener('scroll', queueOutro, { passive: true });
  addEventListener('resize', queueOutro);
  queueOutro();
}

// Section 03: the steps pin under the navbar and vertical scroll slides them horizontally.
// With reduced motion (or without JS) they stay as stacked full-screen panels.
const systemWrap = document.querySelector('.system-steps-wrap');
const systemTrack = systemWrap?.querySelector('.system-steps');
if (systemWrap && systemTrack && 'IntersectionObserver' in window) {
  const systemSteps = [...systemTrack.querySelectorAll('.system-step')];
  const railItems = [...systemWrap.querySelectorAll('.system-rail-item')];
  systemWrap.style.setProperty('--steps', systemSteps.length);
  systemTrack.querySelectorAll('.step-icon *').forEach(shape => shape.setAttribute('pathLength', '1'));
  createPinnedSequence({
    wrap: systemWrap,
    count: systemSteps.length,
    pinnedClass: 'is-horizontal',
    setMode: pinned => {
      systemTrack.classList.toggle('is-enhanced', pinned);
      if (pinned) return;
      systemTrack.style.transform = '';
      systemSteps.forEach(step => step.classList.add('is-seen'));
    },
    render: position => {
      systemTrack.style.transform = `translate3d(${(-position * 100) / systemSteps.length}%,0,0)`;
      systemSteps.forEach((step, index) => {
        step.style.setProperty('--d', Math.max(-1, Math.min(1, index - position)).toFixed(4));
        // Light crossfade: full opacity when centred, fading as the panel slides away.
        step.style.setProperty('--fade', (1 - Math.min(1, Math.abs(index - position)) ** 1.6).toFixed(3));
        if (position > index - 0.55) step.classList.add('is-seen');
      });
      const activeIndex = Math.round(position);
      railItems.forEach((item, index) => {
        item.style.setProperty('--fill', clamp01(position - index + 1).toFixed(4));
        item.classList.toggle('is-active', index === activeIndex);
      });
    }
  });
}

if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!motionPreference.matches && entry.target.animate) {
        entry.target.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
      reveals.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
}

// Local validation only. No endpoint or Google Places credentials were supplied.
const form = document.querySelector('#studio-form');
const status = document.querySelector('#form-status');
const fields = ['studio', 'nome', 'email', 'telefono'].map(id => document.getElementById(id));
function fieldMessage(field) {
  const value = field.value.trim();
  if (!value) return 'Compila questo campo.';
  if ((field.id === 'studio' || field.id === 'nome') && value.length < 2) return 'Inserisci almeno 2 caratteri.';
  if (field.id === 'email' && !field.validity.valid) return 'Inserisci un indirizzo email valido.';
  if (field.id === 'telefono' && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) return 'Inserisci un numero di telefono valido.';
  return '';
}
form.addEventListener('submit', event => {
  event.preventDefault();
  let firstInvalid;
  fields.forEach(field => {
    const message = fieldMessage(field);
    document.getElementById(`${field.id}-error`).textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (message && !firstInvalid) firstInvalid = field;
  });
  const hasArea = Boolean(form.querySelector('input[name="zona"]:checked'));
  document.querySelector('#zona-error').textContent = hasArea ? '' : 'Scegli quartiere, città o provincia.';
  form.querySelectorAll('[name="zona"]').forEach(input => { input.setAttribute('aria-invalid', String(!hasArea)); input.setAttribute('aria-describedby', 'zona-error'); });
  if (!hasArea && !firstInvalid) firstInvalid = form.querySelector('[name="zona"]');
  if (firstInvalid) { status.textContent = ''; firstInvalid.focus(); return; }
  status.textContent = 'I campi sono compilati correttamente. Questa anteprima non invia richieste: il modulo deve essere collegato al servizio di ricezione prima della pubblicazione.';
});
form.addEventListener('input', event => {
  status.textContent = '';
  const field = event.target;
  if (fields.includes(field)) { field.removeAttribute('aria-invalid'); document.getElementById(`${field.id}-error`).textContent = ''; }
  if (field.name === 'zona') { document.querySelector('#zona-error').textContent = ''; form.querySelectorAll('[name="zona"]').forEach(input => input.removeAttribute('aria-invalid')); }
});
