(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- Mobile menu ----
  const burger = $('#burger'), navLinks = $('#navLinks');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); navLinks.classList.toggle('open'); });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); navLinks.classList.remove('open'); }));

  // ---- Scroll: nav border, active link, progress bar, timeline fill ----
  const nav = $('.nav'), progress = $('#progress'), timeline = $('#timeline');
  const sections = $$('main section[id]');
  const links = [...navLinks.querySelectorAll('a')];
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 10);
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    if (timeline && !reduce) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * .6 - r.top) / r.height, 0), 1);
      timeline.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Hero headline: words slide up one by one ----
  const title = $('.hero-title');
  title.querySelectorAll('.word').forEach((w, i) => w.style.setProperty('--i', i));
  requestAnimationFrame(() => setTimeout(() => title.classList.add('in'), 80));

  // ---- Rotating word in the intro ----
  const rot = $('#rotator');
  const words = ['utility networks', 'metro stations', 'rail corridors', 'hotel towers', 'World Cup sites', 'mixed-use communities'];
  let wi = 0;
  if (!reduce) setInterval(() => {
    rot.classList.add('swap');
    setTimeout(() => { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove('swap'); }, 260);
  }, 2400);

  // ---- Count-up numbers ----
  const animateCount = el => {
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target.toFixed(dec) + suffix; return; }
    const start = performance.now(), dur = 1600;
    const step = now => {
      const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---- Reveal on scroll (staggered per group) ----
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, n) => {
      const el = e.target;
      el.style.transitionDelay = (n * 90) + 'ms';
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(animateCount);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-anim]').forEach(el => io.observe(el));
  // service cards & project cards reveal too
  $$('.service, .project').forEach(el => { el.setAttribute('data-anim', 'rise'); io.observe(el); });

  // ---- Project filters ----
  const filters = $('#filters');
  filters.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    filters.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.f;
    $$('#projectGrid .project').forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('hide', !show);
      if (show && !reduce) p.animate([{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  });

  // ---- Pointer effects (desktop only): tilt cards, magnetic buttons, portrait parallax ----
  if (fine && !reduce) {
    $$('.tilt').forEach(card => {
      card.style.transition = 'opacity .8s ease, transform .25s ease-out, box-shadow .3s, border-color .3s';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    $$('.magnetic').forEach(b => {
      b.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .25s, background .25s';
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
    const hv = $('#heroVisual'), por = hv.querySelector('.portrait'), blob = hv.querySelector('.blob');
    $('.hero').addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      por.style.transform = `translate(${x * -14}px, ${y * -14}px)`;
      blob.style.transform = `translate(${x * 22}px, ${y * 22}px) rotate(${x * 10}deg)`;
    });
  }

  // ---- GSAP extras (optional; the page works without it) ----
  if (window.gsap && !reduce) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    // the yellow blob slowly breathes
    gsap.to('#blobPath', { scale: 1.05, rotation: 8, transformOrigin: '50% 50%', duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.fc-1', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.fc-2', { y: 8, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (window.ScrollTrigger) {
      gsap.to('.hero-visual', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('#steps', { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 85%', end: 'top 45%', scrub: .6 } });
      gsap.from('.letter blockquote p', { opacity: .15, y: 30, ease: 'none', scrollTrigger: { trigger: '.letter', start: 'top 90%', end: 'top 50%', scrub: true } });
      gsap.from('.signature', { opacity: 0, x: -30, rotation: -12, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.signature', start: 'top 92%' } });
    }
  }

  // ---- Project map ----
  const LOC = {
    riyadh: { v: 'gulf', p: 'Riyadh, Saudi Arabia', i: [['Diriyah Gate II: KSU Utilities & Facilities Relocation', 'USD 1.45B EPC · now']] },
    makkah: { v: 'gulf', p: 'Makkah, Saudi Arabia', i: [['Jabal Omar S7 Hotel & Serviced Apartments', '~116,600 m² BUA · now']] },
    doha: { v: 'gulf', p: 'Doha, Qatar', i: [['FIFA World Cup Qatar 2022 training sites', 'USD 80M · Supreme Committee'], ['Doha Metro stations & Umm Ghuwailina TOD', '7 stations · Qatar Rail'], ['Qatar Public Bus Infrastructure Programme', 'USD 120M'], ['Sofitel & Novotel hotels', 'USD 210M'], ['Ministry of Interior HQ & Officers’ Club', 'USD 180M']] },
    abudhabi: { v: 'gulf', p: 'Abu Dhabi, UAE', i: [['Danat Al Emarat Hospital', 'Structural design']] },
    cairo: { v: 'gulf', p: 'Cairo, Egypt', i: [['Barwa City, New Cairo', 'Structural design']] },
    damietta: { v: 'gulf', p: 'Damietta, Egypt', i: [['Damietta & El Shabab power plants', 'Structural engineering']] },
    lakeshore: { v: 'ontario', p: 'Etobicoke, Toronto', i: [['2150 Lakeshore Mixed-Use Development', 'USD ~5.8B (CAD 8B)'], ['Park Lawn GO Station', 'Planning & design']] },
    longbranch: { v: 'ontario', p: 'Long Branch, Toronto', i: [['Long Branch GO Station', 'Part of USD ~555M D&B']] },
    mimico: { v: 'ontario', p: 'Mimico, Toronto', i: [['Mimico Yard upgrade', 'USD ~39M (CAD 54M)']] },
    union: { v: 'ontario', p: 'Downtown Toronto', i: [['Union Station & Queens Quay LRT', 'USD ~44M (CAD 60M)']] },
    burloak: { v: 'ontario', p: 'Oakville / Burlington', i: [['Burloak Drive Grade Separation', 'Part of USD ~555M D&B']] },
    rutherford: { v: 'ontario', p: 'Vaughan', i: [['Rutherford GO Station Expansion', 'USD ~336M EPC (CAD 460M)']] },
    kingcity: { v: 'ontario', p: 'King City', i: [['Barrie Rail Corridor Widening', 'USD ~13M (CAD 18M)']] },
    niagara: { v: 'ontario', p: 'Niagara Falls', i: [['Niagara Falls Layover Expansion', 'USD ~16M (CAD 22M)']] },
    gta: { n: 8, v: 'world', p: 'Greater Toronto, Canada', i: [['8 rail, transit and development projects', 'USD 6.8B · 2020 – 2025']] },
    gcc: { n: 8, v: 'world', p: 'Qatar, Saudi Arabia & UAE', i: [['Utilities, metro, events and hospitality', 'USD 2.0B · 2008 – now']] },
    egypt: { n: 2, v: 'world', p: 'Egypt', i: [['Structural design and power plants', '2008 – 2013']] }
  };
  const ZOOM = { gta: 'ontario', gcc: 'gulf', egypt: 'gulf' };
  const HINT = { world: 'Overview · tap a cluster to zoom in', gulf: 'Middle East & Egypt · 6 locations', ontario: 'Greater Toronto · 8 locations' };
  const card = $('#mapcard'), tip = $('#mtip'), list = $('#loclist'), hint = $('#mhint');
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let view = 'world';
  const closeTip = () => { tip.hidden = true; $$('.pin.on').forEach(p => p.classList.remove('on')); $$('.loclist button.on').forEach(b => b.classList.remove('on')); };
  const openTip = id => {
    const L = LOC[id], pin = card.querySelector(`#mv-${L.v} .pin[data-id="${id}"]`); if (!pin) return;
    closeTip(); pin.classList.add('on');
    const lb = list.querySelector(`[data-id="${id}"]`); if (lb) lb.classList.add('on');
    tip.innerHTML = `<button class="x" type="button" aria-label="Close">×</button><h4>${esc(L.p)}</h4><ul>` +
      L.i.map(([n, val]) => `<li><b>${esc(n)}</b><span>${esc(val)}</span></li>`).join('') + '</ul>' +
      (ZOOM[id] ? `<button class="zoom" type="button" data-go="${ZOOM[id]}">Zoom in to ${ZOOM[id] === 'gulf' ? 'the Middle East' : 'Canada'}</button>` : '');
    tip.hidden = false;
    const cr = card.getBoundingClientRect(), pr = pin.querySelector('.dot').getBoundingClientRect();
    let x = pr.right - cr.left + 14, y = pr.top - cr.top - 24;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > cr.width - 12) x = pr.left - cr.left - tw - 14;
    x = Math.max(12, x); y = Math.min(Math.max(12, y), cr.height - th - 12);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    tip.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); closeTip(); });
    const z = tip.querySelector('.zoom'); if (z) z.addEventListener('click', e => { e.stopPropagation(); setView(z.dataset.go); });
  };
  const renderList = () => {
    list.innerHTML = Object.entries(LOC).filter(([, L]) => L.v === view).map(([id, L]) =>
      `<li><button type="button" data-id="${id}"><span class="bd" aria-hidden="true"></span><span><b>${esc(L.p)}</b><small>${esc(L.i[0][0])}${L.i.length > 1 ? ` +${L.i.length - 1} more` : ''}</small></span><span class="ct">${L.n || L.i.length}</span></button></li>`).join('');
    list.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => openTip(b.dataset.id));
      b.addEventListener('mouseenter', () => { const p = card.querySelector(`.pin[data-id="${b.dataset.id}"]`); if (p) p.classList.add('on'); });
      b.addEventListener('mouseleave', () => { if (tip.hidden) $$('.pin.on').forEach(p => p.classList.remove('on')); });
    });
    if (!reduce) list.querySelectorAll('li').forEach((li, i) => li.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 45, fill: 'backwards', easing: 'ease-out' }));
  };
  const setView = v => {
    if (v === view) return;
    closeTip();
    const from = $(`#mv-${view}`), to = $(`#mv-${v}`);
    view = v;
    $$('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === v)));
    hint.textContent = HINT[v]; renderList();
    from.setAttribute('hidden', ''); to.removeAttribute('hidden');
    if (!reduce) {
      to.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      to.querySelectorAll('.pin .dot').forEach((d, i) => d.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: .7 }, { transform: 'scale(1)' }], { duration: 500, delay: 250 + i * 50, fill: 'backwards' }));
    }
  };
  $$('.mtabs button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  card.querySelectorAll('.pin').forEach(p => {
    const go = () => openTip(p.dataset.id);
    p.addEventListener('click', e => { e.stopPropagation(); go(); });
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  card.addEventListener('click', e => { if (!tip.contains(e.target)) closeTip(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTip(); });
  renderList();

  // ---- Copy contact details ----
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById(btn.dataset.copy).textContent);
      btn.textContent = 'Copied!'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
    } catch { btn.textContent = 'Select it'; }
  }));

  $('#year').textContent = new Date().getFullYear();
})();
