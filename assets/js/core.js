/* =========================================================
   CDSG — core interactions
   Shared across all pages. Vanilla JS, no dependencies.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse  = window.matchMedia('(pointer: coarse)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------------- Palette ---------------- */
  const C = {
    blue:   '56,205,255',    // neon blue — the primary accent everywhere
    deep:   '37,99,255',     // electric blue, for depth in gradients
    pale:   '169,216,242',   // the pale school blue
    mint:   '58,232,200',
    violet: '166,124,255',
    amber:  '255,196,107',
    danger: '255,92,122',
    dim:    '104,124,158'
  };
  window.CDSG_COLORS = C;

  /* ---------------- Page veil (transitions) ---------------- */
  const veil = document.createElement('div');
  veil.className = 'page-veil';
  document.body.appendChild(veil);
  requestAnimationFrame(() => veil.classList.add('lift'));

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') ||
        a.target === '_blank' || e.metaKey || e.ctrlKey || reduced) return;
    e.preventDefault();
    veil.classList.remove('lift');
    veil.classList.add('drop');
    setTimeout(() => (location.href = href), 420);
  });

  /* ---------------- Nav ---------------- */
  const nav = $('.nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
    const bar = $('.scroll-bar');
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.burger'), mmenu = $('.mobile-menu');
  if (burger && mmenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mmenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------------- Apply menu (two paths) ---------------- */
  const applyMenu = $('.apply-menu');
  if (applyMenu) {
    const toggle = $('.btn', applyMenu);
    let hoverTimer = null;
    const open  = () => { clearTimeout(hoverTimer); applyMenu.classList.add('open'); };
    const close = () => { hoverTimer = setTimeout(() => applyMenu.classList.remove('open'), 180); };

    if (coarse) {
      // touch: first tap reveals the two paths, second tap follows the button
      toggle.addEventListener('click', e => {
        if (!applyMenu.classList.contains('open')) {
          e.preventDefault(); e.stopPropagation();
          applyMenu.classList.add('open');
        }
      });
    } else {
      // pointer: hover reveals the shortcuts, clicking through goes to the full page
      applyMenu.addEventListener('mouseenter', open);
      applyMenu.addEventListener('mouseleave', close);
    }
    // keyboard
    applyMenu.addEventListener('focusin', open);
    applyMenu.addEventListener('focusout', close);
    document.addEventListener('click', e => {
      if (!applyMenu.contains(e.target)) applyMenu.classList.remove('open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') applyMenu.classList.remove('open');
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const delay = parseFloat(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('in'), delay * 1000);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ---------------- Count-up ---------------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || 0, 10);
      const pre = el.dataset.pre || '';
      const suf = el.dataset.suf || '';
      const dur = 1500;
      let t0 = null;
      const tick = ts => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = pre + (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------------- Custom cursor ---------------- */
  if (!coarse && !reduced) {
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    }, { passive: true });
    (function loop() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const hot = 'a,button,.portal,.member,.proj,.interest,.stage-btn,.filter,input,textarea,select,.faq-q';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hot)) ring.classList.add('hot');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hot)) ring.classList.remove('hot');
    });
  }

  /* ---------------- Card spotlight ---------------- */
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.card,.portal,.member,.proj');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------------- 3D tilt ---------------- */
  if (!coarse && !reduced) {
    $$('[data-tilt]').forEach(el => {
      const max = parseFloat(el.dataset.tilt) || 7;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-5px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- Magnetic ---------------- */
  if (!coarse && !reduced) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- Scramble text ---------------- */
  const GLYPHS = '01</>{}[]#%$&*+=~^ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el, final, dur = 900) {
    let start = null;
    const n = final.length;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const shown = Math.floor(p * n);
      let out = final.slice(0, shown);
      for (let i = shown; i < n; i++) {
        out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  window.CDSG_scramble = scramble;
  $$('[data-scramble]').forEach(el => {
    const final = el.textContent;
    const ob = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { scramble(el, final, 1000); ob.disconnect(); }
    }, { threshold: .6 });
    ob.observe(el);
  });

  /* =========================================================
     Canvas helper — retina sizing + rAF lifecycle
     ========================================================= */
  function makeCanvas(cv, draw, opts = {}) {
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, raf = null, running = false, t = 0;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      // clamp: a canvas sized from its own parent can otherwise feedback-loop
      w = Math.min(Math.max(r.width, 1), 3000);
      h = Math.min(Math.max(r.height, 1), 3000);
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (opts.onResize) opts.onResize(w, h, ctx);
    }
    function frame() {
      if (!running) return;
      t += 1;
      draw(ctx, w, h, t);
      raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!running) { running = true; frame(); } };
    const stop  = () => { running = false; if (raf) cancelAnimationFrame(raf); };
    size();
    addEventListener('resize', () => { size(); if (!running) draw(ctx, w, h, t); });
    // only animate while on screen
    new IntersectionObserver(en => { en[0].isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(cv);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    return { start, stop, size, get w() { return w; }, get h() { return h; }, ctx };
  }
  window.CDSG_canvas = makeCanvas;

  /* =========================================================
     Node network — hero / CTA background
     ========================================================= */
  function nodeNetwork(cv, cfg = {}) {
    const density = cfg.density || 0.000085;
    const linkDist = cfg.linkDist || 132;
    const speed = cfg.speed || 0.22;
    const mouseR = cfg.mouseR || 155;
    let pts = [];
    let mouse = { x: -9999, y: -9999 };

    const build = (w, h) => {
      const n = Math.min(Math.round(w * h * density), cfg.max || 130);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: rand(-speed, speed), vy: rand(-speed, speed),
        r: rand(.9, 2.3),
        hue: Math.random() < .14 ? C.mint : (Math.random() < .12 ? C.violet : C.blue),
        pulse: Math.random() * Math.PI * 2
      }));
    };

    const api = makeCanvas(cv, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // gentle mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < mouseR && d > 0.1) {
          const f = (1 - d / mouseR) * 1.4;
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
      }
      // links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist * linkDist) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / linkDist) * .3;
          const near = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < mouseR;
          ctx.strokeStyle = `rgba(${near ? C.mint : C.blue},${near ? alpha * 2.1 : alpha})`;
          ctx.lineWidth = near ? .9 : .55;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // nodes
      for (const p of pts) {
        p.pulse += .026;
        const g = .55 + Math.sin(p.pulse) * .3;
        const near = Math.hypot(p.x - mouse.x, p.y - mouse.y) < mouseR;
        ctx.fillStyle = `rgba(${near ? C.mint : p.hue},${near ? .95 : g})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (near ? 1.7 : 1), 0, 7); ctx.fill();
        if (near) {
          ctx.strokeStyle = `rgba(${C.mint},.28)`; ctx.lineWidth = .7;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 7); ctx.stroke();
        }
      }
    }, { onResize: build });

    const host = cv.parentElement || cv;
    host.addEventListener('mousemove', e => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    return api;
  }
  window.CDSG_network = nodeNetwork;

  /* =========================================================
     Sparkline / mini-viz used on cards
     ========================================================= */
  function sparkline(cv, data, color = C.blue, fill = true) {
    return makeCanvas(cv, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      const pad = 4;
      const max = Math.max(...data), min = Math.min(...data);
      const span = max - min || 1;
      const pt = i => [pad + (i / (data.length - 1)) * (w - pad * 2),
                       h - pad - ((data[i] - min) / span) * (h - pad * 2)];
      // progressive draw
      const prog = Math.min(t / 60, 1);
      const count = Math.max(2, Math.floor(data.length * prog));
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const [x, y] = pt(i);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      if (fill) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgba(${color},.28)`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx.save();
        ctx.lineTo(pt(count - 1)[0], h); ctx.lineTo(pad, h); ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const [x, y] = pt(i);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${color},.95)`; ctx.lineWidth = 1.7;
      ctx.lineJoin = 'round'; ctx.stroke();
      const [lx, ly] = pt(count - 1);
      ctx.fillStyle = `rgba(${color},1)`;
      ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(${color},${.3 + Math.sin(t / 14) * .22})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(lx, ly, 6 + Math.sin(t / 14) * 2, 0, 7); ctx.stroke();
    });
  }
  window.CDSG_sparkline = sparkline;

  /* =========================================================
     Brand mark — tiny live node cluster in the logo
     ========================================================= */
  $$('.brand-mark canvas').forEach(cv => {
    const nodes = [[.5, .18], [.2, .5], [.8, .46], [.36, .82], [.72, .8]];
    makeCanvas(cv, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(${C.blue},.5)`; ctx.lineWidth = .8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i][0] * w, nodes[i][1] * h);
          ctx.lineTo(nodes[j][0] * w, nodes[j][1] * h);
          ctx.stroke();
        }
      }
      nodes.forEach((n, i) => {
        const a = .5 + Math.sin(t / 26 + i * 1.3) * .45;
        ctx.fillStyle = i % 2 ? `rgba(${C.mint},${a})` : `rgba(${C.blue},${a})`;
        ctx.beginPath(); ctx.arc(n[0] * w, n[1] * h, 1.9, 0, 7); ctx.fill();
      });
    });
  });

  /* ---------------- Footer year ---------------- */
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------------- Ticker duplication (seamless loop) ---------------- */
  $$('.ticker-track').forEach(tr => { tr.innerHTML += tr.innerHTML; });

  /* ---------------- FAQ ---------------- */
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const open = item.classList.contains('open');
      $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-a', i).style.maxHeight = null; });
      if (!open) {
        item.classList.add('open');
        const a = $('.faq-a', item);
        a.style.maxHeight = a.scrollHeight + 40 + 'px';
      }
    });
  });

  /* ---------------- Esc closes overlays ---------------- */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    $$('.drawer.open,.drawer-scrim.open,.modal-scrim.open').forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  });
})();
