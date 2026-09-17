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
      <div class="footer-design-word" aria-label="Sistema Recensioni">Sistema Recensioni<span class="footer-design-star" aria-hidden="true">✳&#xFE0E;</span></div>
      <div class="footer-design-bottom">
        <span>SISTEMA RECENSIONI / 2026</span>
        <span>PREFERENZA LOCALE. REPUTAZIONE CHE LAVORA.</span>
        <a href="#inizio">Torna su ↑</a>
      </div>
    </div>`;
}

// Dashboard mockup: use the high-quality transparent WEBP. Its 3:2 space (width/height attributes and CSS
// aspect-ratio) is reserved before it loads, so the lazy image never shifts the sections below it.
const dashboardFigure = document.querySelector('.dashboard-media');
const dashboardImage = dashboardFigure?.querySelector('img');
if (dashboardFigure && dashboardImage) {
  dashboardFigure.classList.remove('media-slot');
  dashboardImage.src = 'assets/dashboard.webp';
  dashboardImage.style.width = '100%';
  dashboardImage.style.maxWidth = '100%';
  dashboardImage.style.height = 'auto';
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
// back on step 1. While still pinned, the "Il sistema" intro slides up over the wheel like a card.
const VOLANO_TAIL = 0.9; // screens; keep in sync with the 90svh card overlaps in styles.css
const volano = document.querySelector('.volano');
const systemSection = document.querySelector('.system-section');
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
      // 0 -> 1 while the "Il sistema" card rises over the pinned wheel.
      if (systemSection) {
        const cover = clamp01((innerHeight - systemSection.getBoundingClientRect().top) / (innerHeight * VOLANO_TAIL));
        volano.style.setProperty('--cover', cover.toFixed(3));
      }
    }
  });
}

// A block sticks while the next section slides over it like a card. It sticks under the navbar, or later
// if it is taller than the viewport, so its last line is always read before being covered.
function stickWhileCovered(stuck, coveringSection) {
  const header = document.querySelector('.topbar');
  let queued = false;
  const update = () => {
    queued = false;
    if (!volano.classList.contains('is-pinned')) return;
    const navHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    stuck.style.setProperty('--stick-top', `${Math.min(navHeight, innerHeight - stuck.offsetHeight)}px`);
    const cover = clamp01((innerHeight - coveringSection.getBoundingClientRect().top) / (innerHeight * VOLANO_TAIL));
    stuck.style.setProperty('--cover', cover.toFixed(3));
  };
  const queue = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  queue();
}
// The dark intro sticks and the pinned wheel slides over it.
const volanoIntro = document.querySelector('.flywheel-intro');
if (volano && volanoIntro) stickWhileCovered(volanoIntro, volano);

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

// Links to the final box (#richiedi): frame the whole box under the navbar on every screen. Centered in the
// space below the navbar when it fits, otherwise aligned just under it (e.g. stacked on mobile).
const contactBox = document.querySelector('.contact-grid');
function contactBoxScrollTop() {
  const navHeight = siteHeader?.getBoundingClientRect().height || 0;
  const box = contactBox.getBoundingClientRect();
  const available = innerHeight - navHeight;
  const gap = box.height <= available - 32 ? (available - box.height) / 2 : 16;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  return Math.round(Math.max(0, Math.min(maxScroll, scrollY + box.top - navHeight - gap)));
}
function frameContactBox(smooth) {
  scrollTo({ top: contactBoxScrollTop(), behavior: smooth && !motionPreference.matches ? 'smooth' : 'instant' });
  // Once the scroll settles, correct any small layout shift that happened on the way (fonts, late images).
  let lastY = scrollY;
  let stillFrames = 0;
  let moved = false;
  const started = performance.now();
  const settle = () => {
    if (Math.abs(scrollY - lastY) >= 1) { moved = true; stillFrames = 0; } else { stillFrames++; }
    lastY = scrollY;
    const waiting = (!moved && performance.now() - started < 400) || stillFrames < 6;
    if (waiting && performance.now() - started < 4000) { requestAnimationFrame(settle); return; }
    const target = contactBoxScrollTop();
    if (Math.abs(target - scrollY) > 2 && Math.abs(target - scrollY) < 400) scrollTo({ top: target, behavior: 'instant' });
  };
  requestAnimationFrame(settle);
}
if (contactBox) {
  document.querySelectorAll('a[href="#richiedi"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (location.hash !== '#richiedi') history.pushState(null, '', '#richiedi');
    frameContactBox(true);
  }));
  if (location.hash === '#richiedi') addEventListener('load', () => frameContactBox(false));
}

// Lead form: Google autosuggest and submission go through the Prospect landing API, with no token in the page.
const form = document.querySelector('#studio-form');
const status = document.querySelector('#form-status');
const api = form.dataset.api.replace(/\/$/, '');
const submitButton = form.querySelector('button[type="submit"]');
const studioInput = document.getElementById('studio');
const placeIdInput = document.getElementById('place-id');
const suggestionList = document.getElementById('studio-suggerimenti');
const fields = ['studio', 'nome', 'cognome', 'email', 'telefono'].map(id => document.getElementById(id));
const serverFields = { place_id: 'studio', studio: 'studio', nome: 'nome', cognome: 'cognome', email: 'email', telefono: 'telefono', privacy: 'privacy' };
let suggestions = [];
let activeSuggestion = -1;
let suggestTimer;
let suggestRequest;

// Error text for the API refusals that are not field validation.
function apiProblem(statusCode, fallback) {
  if (statusCode === 403) return 'Questo sito non è autorizzato a inviare richieste. Contattaci direttamente.';
  if (statusCode === 404) return 'Il modulo non è attivo in questo momento. Riprova più tardi.';
  if (statusCode === 429) return 'Troppe richieste ravvicinate: riprova tra un minuto.';
  return fallback;
}

// Cloudflare Turnstile: loaded only when the form carries a site key. Tokens are single use.
const turnstileSiteKey = (form.dataset.turnstileSitekey || '').trim();
const turnstileSlot = document.getElementById('turnstile-slot');
let turnstileWidget = null;
let turnstileToken = '';
let turnstileWaiters = [];
if (turnstileSiteKey && turnstileSlot) {
  window.onSistemaRecensioniTurnstile = () => {
    turnstileWidget = window.turnstile.render(turnstileSlot, {
      sitekey: turnstileSiteKey,
      action: 'landing-lead',
      language: 'it',
      theme: 'light',
      appearance: 'interaction-only',
      callback: token => { turnstileToken = token; turnstileWaiters.splice(0).forEach(resolve => resolve(token)); },
      'expired-callback': () => { turnstileToken = ''; },
      'error-callback': () => { turnstileToken = ''; },
    });
  };
  const turnstileScript = document.createElement('script');
  turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onSistemaRecensioniTurnstile';
  turnstileScript.async = true;
  document.head.append(turnstileScript);
}
function turnstileReady(timeout = 10000) {
  if (!turnstileSiteKey || turnstileToken) return Promise.resolve(turnstileToken);
  return new Promise(resolve => { turnstileWaiters.push(resolve); setTimeout(() => resolve(turnstileToken), timeout); });
}
function resetTurnstile() {
  turnstileToken = '';
  if (turnstileWidget !== null) window.turnstile?.reset(turnstileWidget);
}

function setFieldError(id, message) {
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = message;
  const field = document.getElementById(id);
  if (message) field?.setAttribute('aria-invalid', 'true'); else field?.removeAttribute('aria-invalid');
}

function closeSuggestions() {
  suggestionList.hidden = true;
  studioInput.setAttribute('aria-expanded', 'false');
  studioInput.removeAttribute('aria-activedescendant');
  activeSuggestion = -1;
}

function renderSuggestions(note = '') {
  suggestionList.replaceChildren();
  if (note) {
    const item = document.createElement('li');
    item.className = 'suggestion-note';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-disabled', 'true');
    item.textContent = note;
    suggestionList.append(item);
  }
  suggestions.forEach((suggestion, index) => {
    const item = document.createElement('li');
    item.id = `studio-suggerimento-${index}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(index === activeSuggestion));
    const name = document.createElement('strong');
    name.textContent = suggestion.nome;
    item.append(name);
    if (suggestion.indirizzo) {
      const address = document.createElement('span');
      address.textContent = suggestion.indirizzo;
      item.append(address);
    }
    item.addEventListener('mousedown', event => event.preventDefault());
    item.addEventListener('click', () => chooseSuggestion(index));
    suggestionList.append(item);
  });
  const open = suggestions.length > 0 || Boolean(note);
  suggestionList.hidden = !open;
  studioInput.setAttribute('aria-expanded', String(open));
  if (activeSuggestion >= 0) studioInput.setAttribute('aria-activedescendant', `studio-suggerimento-${activeSuggestion}`);
  else studioInput.removeAttribute('aria-activedescendant');
}

function chooseSuggestion(index) {
  const suggestion = suggestions[index];
  if (!suggestion) return;
  studioInput.value = suggestion.nome;
  placeIdInput.value = suggestion.place_id;
  setFieldError('studio', '');
  closeSuggestions();
}

async function loadSuggestions(query) {
  suggestRequest?.abort();
  suggestRequest = new AbortController();
  try {
    const response = await fetch(`${api}/suggerimenti?q=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' }, signal: suggestRequest.signal });
    const body = await response.json().catch(() => ({}));
    if (studioInput.value.trim() !== query || placeIdInput.value) return;
    activeSuggestion = -1;
    if (!response.ok) {
      suggestions = [];
      renderSuggestions(apiProblem(response.status, 'Ricerca non disponibile al momento. Riprova tra poco.'));
      return;
    }
    suggestions = Array.isArray(body.data) ? body.data : [];
    renderSuggestions(suggestions.length ? '' : 'Nessuno studio trovato: prova ad aggiungere la città.');
  } catch (error) {
    if (error.name === 'AbortError') return;
    suggestions = [];
    renderSuggestions('Ricerca non disponibile al momento. Riprova tra poco.');
  }
}

studioInput.addEventListener('input', () => {
  placeIdInput.value = '';
  clearTimeout(suggestTimer);
  const query = studioInput.value.trim();
  if (query.length < 3) { suggestRequest?.abort(); suggestions = []; closeSuggestions(); return; }
  suggestTimer = setTimeout(() => loadSuggestions(query), 300);
});
studioInput.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeSuggestions(); return; }
  if (suggestionList.hidden || !suggestions.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    activeSuggestion = activeSuggestion < 0 ? (step > 0 ? 0 : suggestions.length - 1) : (activeSuggestion + step + suggestions.length) % suggestions.length;
    renderSuggestions();
    document.getElementById(`studio-suggerimento-${activeSuggestion}`)?.scrollIntoView({ block: 'nearest' });
  } else if (event.key === 'Enter' && activeSuggestion >= 0) {
    event.preventDefault();
    chooseSuggestion(activeSuggestion);
  }
});
studioInput.addEventListener('blur', closeSuggestions);
studioInput.addEventListener('focus', () => { if (!placeIdInput.value && suggestions.length) renderSuggestions(); });

function fieldMessage(field) {
  const value = field.value.trim();
  if (field.id === 'studio') {
    if (!value) return 'Cerca il tuo studio e sceglilo dall’elenco.';
    if (!placeIdInput.value) return 'Scegli il tuo studio dall’elenco dei risultati di Google.';
    return '';
  }
  if (!value) return 'Compila questo campo.';
  if (field.id === 'email' && !field.validity.valid) return 'Inserisci un indirizzo email valido.';
  if (field.id === 'telefono' && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) return 'Inserisci un numero di telefono valido.';
  return '';
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (form.dataset.sending) return;
  let firstInvalid;
  fields.forEach(field => {
    const message = fieldMessage(field);
    setFieldError(field.id, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  // GDPR: the privacy notice must be acknowledged; marketing consent stays optional.
  const privacyInput = document.getElementById('privacy');
  setFieldError('privacy', privacyInput.checked ? '' : 'Per inviare la richiesta conferma di aver letto l’informativa privacy.');
  if (!privacyInput.checked && !firstInvalid) firstInvalid = privacyInput;
  if (firstInvalid) { status.textContent = ''; firstInvalid.focus(); return; }

  form.dataset.sending = 'true';
  submitButton.disabled = true;
  status.textContent = 'Invio della richiesta in corso…';
  let tokenSent = false;
  try {
    const turnstileTokenValue = await turnstileReady();
    if (turnstileSiteKey && !turnstileTokenValue) {
      status.textContent = 'Verifica anti-spam non completata: attendi qualche secondo e riprova.';
      return;
    }
    const payload = {
      place_id: placeIdInput.value,
      studio: studioInput.value.trim(),
      nome: document.getElementById('nome').value.trim(),
      cognome: document.getElementById('cognome').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      priorita: [...form.querySelectorAll('input[name="priorita"]:checked')].map(input => input.value),
      fonte: form.dataset.fonte || '',
      nota_interna: document.getElementById('nota-interna').value,
      turnstile_token: turnstileTokenValue,
      privacy: document.getElementById('privacy').checked,
      privacy_url: document.getElementById('privacy-link').href,
      marketing: document.getElementById('marketing').checked,
    };
    tokenSent = Boolean(turnstileTokenValue);
    const response = await fetch(`${api}/richieste`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    if (response.ok) {
      form.reset();
      placeIdInput.value = '';
      suggestions = [];
      status.textContent = 'Richiesta ricevuta. Analizziamo il tuo studio e ti inviamo le due analisi all’email indicata.';
      return;
    }
    if (response.status === 422 && body.errors) {
      if (body.errors.turnstile_token) {
        status.textContent = 'Verifica anti-spam non riuscita: riprova tra qualche secondo.';
        return;
      }
      let firstError;
      Object.entries(body.errors).forEach(([key, messages]) => {
        const id = serverFields[key.split('.')[0]];
        if (!id) return;
        setFieldError(id, messages[0]);
        firstError ??= document.getElementById(id);
      });
      status.textContent = 'Controlla i campi evidenziati.';
      firstError?.focus();
      return;
    }
    status.textContent = apiProblem(response.status, 'Non siamo riusciti a inviare la richiesta. Riprova tra poco.');
  } catch {
    status.textContent = 'Connessione non disponibile: controlla la rete e riprova.';
  } finally {
    if (tokenSent) resetTurnstile();
    delete form.dataset.sending;
    submitButton.disabled = false;
  }
});
form.addEventListener('input', event => {
  if (!form.dataset.sending) status.textContent = '';
  const field = event.target;
  if (fields.includes(field) || field.id === 'privacy') setFieldError(field.id, '');
});
