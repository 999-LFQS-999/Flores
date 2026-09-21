/**
 * FLORALIA STUDIO - UTILITIES & HELPERS
 */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export function showToast(message, icon = '✨', duration = 3200) {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(80px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    para: params.get('para') || '',
    de: params.get('de') || '',
    mensaje: params.get('mensaje') || '',
    mundo: params.get('mundo') || 'sunflower',
    regalo: params.get('regalo') === '1' || params.get('sorpresa') === '1'
  };
}

export function buildShareUrl(options = {}) {
  const url = new URL(window.location.origin + window.location.pathname);
  if (options.para) url.searchParams.set('para', options.para);
  if (options.de) url.searchParams.set('de', options.de);
  if (options.mensaje) url.searchParams.set('mensaje', options.mensaje);
  if (options.mundo) url.searchParams.set('mundo', options.mundo);
  if (options.regalo) url.searchParams.set('regalo', '1');
  return url.toString();
}
