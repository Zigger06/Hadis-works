'use strict';
const slides = [...document.querySelectorAll('.slide')];
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const counter = document.querySelector('#counter');
const autoplay = document.querySelector('#autoplay');
const outline = document.querySelector('#outline');
const outlineList = document.querySelector('#outline-list');
const fullButton = document.querySelector('#fullscreen');
let current = 0;
let timer = null;
let touchStart = null;
function fromHash() {
  const match = location.hash.match(/^#(\d+)$/);
  return match ? Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1)) : 0;
}
function stopAuto() {
  clearInterval(timer); timer = null;
  autoplay.setAttribute('aria-pressed', 'false');
  autoplay.innerHTML = '▷ <span>Худкор</span>';
  autoplay.setAttribute('aria-label', 'Намоиши худкор');
}
function showSlide(index, syncHash = true) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s, i) => { s.classList.toggle('active', i === current); s.setAttribute('aria-hidden', String(i !== current)); });
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + slides.length;
  document.querySelector('#slide-title').textContent = slides[current].dataset.title;
  document.querySelector('#progress-fill').style.width = ((current + 1) / slides.length * 100) + '%';
  [...outlineList.children].forEach((b, i) => b.setAttribute('aria-current', String(i === current)));
  document.title = slides[current].dataset.title + ' — Биржа';
  if (syncHash) history.replaceState(null, '', '#' + (current + 1));
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (current === slides.length - 1) stopAuto();
}
function navigate(delta) { stopAuto(); showSlide(current + delta); }
slides.forEach((slide, i) => {
  const button = document.createElement('button');
  const number = document.createElement('span'); number.textContent = String(i + 1).padStart(2, '0');
  button.append(number, document.createTextNode(slide.dataset.title));
  button.addEventListener('click', () => { stopAuto(); outline.close(); showSlide(i); });
  outlineList.append(button);
});
prev.addEventListener('click', () => navigate(-1));
next.addEventListener('click', () => navigate(1));
autoplay.addEventListener('click', () => {
  if (timer) { stopAuto(); return; }
  if (current === slides.length - 1) showSlide(0);
  autoplay.setAttribute('aria-pressed', 'true');
  autoplay.innerHTML = 'Ⅱ <span>Таваққуф</span>';
  autoplay.setAttribute('aria-label', 'Таваққуфи намоиши худкор');
  document.querySelector('#announcement').textContent = 'Намоиши худкор: ҳар 20 сония як слайд.';
  timer = setInterval(() => showSlide(current + 1), 20000);
});
function openOutline() { stopAuto(); outline.showModal(); outlineList.children[current]?.focus(); }
document.querySelector('#contents').addEventListener('click', openOutline);
document.querySelector('#close-outline').addEventListener('click', () => outline.close());
outline.addEventListener('click', e => { if (e.target === outline) { const r = outline.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) outline.close(); } });
async function fullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { document.querySelector('#announcement').textContent = 'Браузери шумо режими экрани пурраро дастгирӣ намекунад.'; }
}
if (!document.fullscreenEnabled) fullButton.hidden = true;
fullButton.addEventListener('click', fullscreen);
document.addEventListener('keydown', e => {
  if (outline.open || e.ctrlKey || e.altKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (['ArrowRight', 'PageDown'].includes(e.key) || (e.code === 'Space' && !e.target.closest('button,a'))) { e.preventDefault(); navigate(1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); navigate(-1); }
  if (e.key === 'Home') { e.preventDefault(); stopAuto(); showSlide(0); }
  if (e.key === 'End') { e.preventDefault(); stopAuto(); showSlide(slides.length - 1); }
  if (e.key.toLowerCase() === 'f') fullscreen();
  if (e.key.toLowerCase() === 'm') openOutline();
});
document.querySelector('#deck').addEventListener('touchstart', e => { touchStart = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null; }, {passive:true});
document.querySelector('#deck').addEventListener('touchend', e => {
  if (!touchStart || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('a,button')) navigate(dx < 0 ? 1 : -1);
  touchStart = null;
}, {passive:true});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); });
window.addEventListener('hashchange', () => { stopAuto(); showSlide(fromHash(), false); });
showSlide(fromHash());
document.documentElement.classList.add('js');
