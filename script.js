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

// Native sticky positioning with offsets measured from the actual title and navbar.
const receptionSection = document.querySelector('.reception-section');
const receptionHeading = document.querySelector('.reception-title-bar');
const siteHeader = document.querySelector('.topbar');
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

// The original six descriptions are also available without JavaScript in the transcript.
const phases = [...document.querySelectorAll('#phase-list li')].map(item => ({
  title: item.querySelector('h3').textContent,
  description: item.querySelector('p').textContent
}));
const nodes = [...document.querySelectorAll('.phase-node')];
const phaseContent = document.querySelector('#phase-content');
const pauseButton = document.querySelector('#wheel-toggle');
let activePhase = 0;
let paused = motionPreference.matches;
let wheelVisible = false;
let timer;
function renderPhase(index, manual = false) {
  activePhase = index;
  document.querySelector('#phase-count').textContent = `Fase 0${index + 1} / 06`;
  phaseContent.querySelector('h3').textContent = phases[index].title;
  phaseContent.querySelector('p').textContent = phases[index].description;
  nodes.forEach((node, n) => {
    node.classList.toggle('active', n === index);
    node.setAttribute('aria-pressed', String(n === index));
  });
  if (manual) phaseContent.setAttribute('aria-live', 'polite');
  else phaseContent.removeAttribute('aria-live');
  if (!motionPreference.matches && phaseContent.animate) {
    phaseContent.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
  }
}
function syncPlayback() {
  clearInterval(timer);
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.innerHTML = paused ? 'Riprendi <span aria-hidden="true">▷</span>' : 'Pausa <span aria-hidden="true">Ⅱ</span>';
  document.querySelector('.wheel-ring').style.setProperty('--play-state', paused ? 'paused' : 'running');
  if (!paused && wheelVisible && !document.hidden) timer = setInterval(() => renderPhase((activePhase + 1) % phases.length), 8500);
}
nodes.forEach((node, index) => {
  node.addEventListener('click', () => { paused = true; renderPhase(index, true); syncPlayback(); });
  node.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % nodes.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + nodes.length - 1) % nodes.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = nodes.length - 1;
    if (next === undefined) return;
    event.preventDefault(); nodes[next].focus(); nodes[next].click();
  });
});
pauseButton.addEventListener('click', () => { paused = !paused; syncPlayback(); });
document.addEventListener('visibilitychange', syncPlayback);
motionPreference.addEventListener('change', event => { paused = event.matches; syncPlayback(); });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { wheelVisible = entries[0].isIntersecting; syncPlayback(); }, { threshold: 0.2 }).observe(document.querySelector('.wheel'));
} else { wheelVisible = true; }
syncPlayback();

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
