// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  navLinks.classList.remove('open');
}));

// Nav border on scroll + active link
const nav = document.querySelector('.nav');
const sections = [...document.querySelectorAll('main section[id]')];
const links = [...navLinks.querySelectorAll('a')];
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Count-up numbers
const animateCount = el => {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || '0', 10);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1400;
  const step = now => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(dec) + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(animateCount);
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Project filters
const filters = document.getElementById('filters');
filters.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  filters.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.f;
  document.querySelectorAll('#projectGrid .project').forEach(p => {
    p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f);
  });
});

// Copy contact details
document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById(btn.dataset.copy).textContent);
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
  } catch { btn.textContent = 'Select it'; }
}));

document.getElementById('year').textContent = new Date().getFullYear();
