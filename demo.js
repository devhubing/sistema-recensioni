'use strict';

// Standalone presentation: no dependency on the design system's documentation UI.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedPreference = matchMedia('(prefers-reduced-motion: reduce)');
const state = { reduced: reducedPreference.matches, paused: false, animations: new Set(), counter: null };

function enter(element, delay = 0) {
  if (state.reduced || !element.animate) return;
  const animation = element.animate([
    { opacity: 0, transform: 'translateY(45px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 950, delay, easing: 'cubic-bezier(.22,1,.36,1)' });
  state.animations.add(animation);
  if (state.paused) animation.pause();
  animation.onfinish = animation.oncancel = () => state.animations.delete(animation);
}

function applyMotion() {
  document.body.classList.toggle('motion-paused', state.paused);
  document.body.classList.toggle('reduced-motion', state.reduced);
  $('#demo-pause').disabled = state.reduced;
  $('#demo-pause').textContent = state.paused ? 'Riprendi' : 'Pausa';
  $('#demo-pause').setAttribute('aria-pressed', String(state.paused));
  $('#demo-status').textContent = state.reduced ? 'Movimento ridotto' : state.paused ? 'Animazioni in pausa' : 'Demo animata';
  $('#demo-reduced').checked = state.reduced;
  for (const animation of [...state.animations]) {
    if (state.reduced) animation.cancel();
    else if (state.paused) animation.pause();
    else animation.play();
  }
  if (state.reduced) {
    state.counter = null;
    $('#demo-counter').textContent = '98';
    $$('.magnetic').forEach(element => { element.style.transform = ''; });
  }
}

function startCounter() {
  if (state.reduced) return;
  state.counter = { elapsed: 0, previous: performance.now() };
}

let entranceObserver;
function startEntrances() {
  entranceObserver?.disconnect();
  $$('.hero-line > span').forEach((element, index) => enter(element, index * 140));
  if ('IntersectionObserver' in window) {
    entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        enter(entry.target);
        if (entry.target.id === 'reviews') startCounter();
        entranceObserver.unobserve(entry.target);
      });
    }, { threshold: .15 });
    $$('.reveal, #reviews').forEach(element => entranceObserver.observe(element));
  }
}

$('#demo-pause').addEventListener('click', () => {
  state.paused = !state.paused;
  applyMotion();
});
$('#demo-reduced').addEventListener('change', event => {
  state.reduced = event.target.checked || reducedPreference.matches;
  state.paused = false;
  applyMotion();
});
reducedPreference.addEventListener('change', event => {
  state.reduced = event.matches;
  state.paused = false;
  applyMotion();
});
$('#demo-replay').addEventListener('click', () => {
  for (const animation of [...state.animations]) animation.cancel();
  state.counter = null;
  state.paused = false;
  applyMotion();
  window.scrollTo({ top: 0, behavior: 'instant' });
  startEntrances();
});

$$('.service-trigger').forEach(trigger => trigger.addEventListener('click', () => {
  const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
  $$('.service-trigger').forEach(button => {
    const open = button === trigger && shouldOpen;
    button.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.classList.toggle('open', open);
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
  });
}));

$$('.magnetic').forEach(element => {
  element.addEventListener('pointermove', event => {
    if (state.reduced || state.paused || event.pointerType !== 'mouse') return;
    const rect = element.getBoundingClientRect();
    const x = Math.max(-14, Math.min(14, (event.clientX - rect.left - rect.width / 2) * .2));
    const y = Math.max(-14, Math.min(14, (event.clientY - rect.top - rect.height / 2) * .2));
    element.style.transform = `translate(${x}px, ${y}px)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});

function frame(now) {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#scroll-progress').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  if (state.counter) {
    const counter = state.counter;
    if (!state.paused && !document.hidden) counter.elapsed += Math.min(now - counter.previous, 80);
    counter.previous = now;
    const progress = Math.min(counter.elapsed / 1800, 1);
    $('#demo-counter').textContent = Math.round(98 * (1 - (1 - progress) ** 3));
    if (progress === 1) state.counter = null;
  }
  requestAnimationFrame(frame);
}

applyMotion();
startEntrances();
requestAnimationFrame(frame);
