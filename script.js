const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Theme (dark by default, remembered)
const root = document.documentElement;
try { root.dataset.theme = localStorage.getItem('theme') || 'dark'; } catch { root.dataset.theme = 'dark'; }
$('#theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
});

// Mobile menu
const menu = $('#menu'), burger = $('#burger');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}));

// Active link on scroll
const links = $$('#menu a');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section').forEach(s => io.observe(s));

// Project filters
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
  $$('.proj').forEach(p => {
    p.hidden = b.dataset.f !== 'all' && !p.dataset.c.split(' ').includes(b.dataset.f);
  });
});

// Contact form (opens the visitor's mail app)
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, msg = $('#formMsg');
  const name = f.name.value.trim(), email = f.email.value.trim(), text = f.msg.value.trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !text) {
    msg.textContent = 'Enter your name, a valid email and a message.';
    return;
  }
  const subject = encodeURIComponent('Portfolio contact from ' + name);
  const body = encodeURIComponent(text + '\n\n' + name + '\n' + email);
  msg.textContent = 'Opening your email app…';
  location.href = `mailto:salaheddine.khamraoui@etu.uae.ac.ma?subject=${subject}&body=${body}`;
});

$('#year').textContent = new Date().getFullYear();

// Hero background: drifting network nodes (security / networking theme)
(() => {
  const cv = $('#net'); if (!cv) return;
  const ctx = cv.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, nodes = [];
  const color = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#1a8cff';
  const size = () => {
    const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1;
    w = cv.width = r.width * d; h = cv.height = r.height * d;
    const n = Math.min(70, Math.round(r.width / 22));
    nodes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * d, vy: (Math.random() - .5) * .25 * d }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h); const c = color(), max = 150 * (devicePixelRatio || 1);
    nodes.forEach((a, i) => {
      if (!still) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1; }
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, 7); ctx.fill();
      for (let k = i + 1; k < nodes.length; k++) {
        const b = nodes[k], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) { ctx.strokeStyle = c; ctx.globalAlpha = (1 - d / max) * .5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.globalAlpha = 1; }
      }
    });
    if (!still) requestAnimationFrame(draw);
  };
  size(); draw(); addEventListener('resize', () => { size(); if (still) draw(); });
})();
