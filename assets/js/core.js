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


  /* =========================================================
     Micro-glyphs
     Small looping canvas animations that replace static icons.
     Each takes (ctx, w, h, frame) and draws inside ~42x42.
     Add data-glyph="name" to a <canvas> and it wires itself up.
     (GLYPH_FX, not GLYPHS -- that name is taken by the scramble alphabet.)
     ========================================================= */
  const GLYPH_FX = {
    table(ctx, w, h, t) {
      const rows = 4, cols = 3, pad = 5;
      const cw = (w - pad * 2) / cols, rh = (h - pad * 2) / rows;
      const cursor = ((t / 11) | 0) % (rows * cols + 5);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const on = r * cols + c <= cursor;
        ctx.fillStyle = `rgba(${on ? C.mint : C.blue},${on ? .5 : .13})`;
        ctx.fillRect(pad + c * cw + 1, pad + r * rh + 1, cw - 2, rh - 2);
      }
    },

    scan(ctx, w, h, t) {
      const y = 5 + ((t * .55) % (h - 10));
      for (let i = 0; i < 16; i++) {
        const x = 7 + (i % 4) * ((w - 14) / 3);
        const yy = 7 + ((i / 4) | 0) * ((h - 14) / 3);
        const near = Math.abs(yy - y) < 7;
        ctx.fillStyle = `rgba(${near ? C.mint : C.blue},${near ? .95 : .17})`;
        ctx.beginPath(); ctx.arc(x, yy, near ? 2.2 : 1.7, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = `rgba(${C.mint},.45)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(w - 4, y); ctx.stroke();
    },

    forecast(ctx, w, h, t) {
      const knee = w * .6, kneeY = h * .44;
      ctx.strokeStyle = `rgba(${C.blue},.8)`; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(6, h - 7); ctx.lineTo(w * .26, h * .64); ctx.lineTo(w * .44, h * .72); ctx.lineTo(knee, kneeY);
      ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.lineDashOffset = -t * .45;
      ctx.strokeStyle = `rgba(${C.mint},.85)`;
      ctx.beginPath(); ctx.moveTo(knee, kneeY); ctx.lineTo(w - 6, h * .15); ctx.stroke();
      ctx.setLineDash([]);
      const p = (t % 95) / 95;
      ctx.fillStyle = `rgba(${C.mint},1)`;
      ctx.beginPath();
      ctx.arc(knee + (w - 6 - knee) * p, kneeY + (h * .15 - kneeY) * p, 2.2, 0, 7);
      ctx.fill();
    },

    optimize(ctx, w, h, t) {
      const n = 5, bw = (w - 12) / n;
      for (let i = 0; i < n; i++) {
        const best = i === 2;
        const v = best ? .88 : .3 + Math.sin(t / 25 + i * .8) * .22;
        const bh = v * (h - 12);
        ctx.fillStyle = `rgba(${best ? C.mint : C.blue},${best ? .55 : .2})`;
        ctx.fillRect(6 + i * bw + 1, h - 6 - bh, bw - 2, bh);
        if (best) {
          ctx.strokeStyle = `rgba(${C.mint},${.5 + Math.sin(t / 14) * .35})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(6 + i * bw + 1, h - 6 - bh); ctx.lineTo(6 + i * bw + bw - 1, h - 6 - bh); ctx.stroke();
        }
      }
    },

    target(ctx, w, h, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h);
      [.4, .27, .14].forEach((f, i) => {
        ctx.strokeStyle = `rgba(${C.blue},${.18 + i * .14})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, 7); ctx.stroke();
      });
      const p = (t % 130) / 130, r = R * .4 * (1 - p), a = t * .075;
      ctx.fillStyle = `rgba(${C.mint},${.35 + p * .65})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.3, 0, 7); ctx.fill();
    },

    dashboard(ctx, w, h, t) {
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([qx, qy], i) => {
        const bw = (w - 12) / 2, bh = (h - 12) / 2;
        const a = .16 + Math.abs(Math.sin(t / 27 + i * 1.15)) * .5;
        ctx.fillStyle = `rgba(${i === 0 ? C.mint : C.blue},${a})`;
        ctx.fillRect(5 + qx * (bw + 2), 5 + qy * (bh + 2), bw, bh);
      });
    },

    funnel(ctx, w, h, t) {
      ctx.strokeStyle = `rgba(${C.blue},.35)`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(6, 7); ctx.lineTo(w / 2, h - 7); ctx.lineTo(w - 6, 7); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const p = ((t * .85 + i * 38) % 135) / 135;
        const spread = (1 - p) * (w / 2 - 9);
        ctx.fillStyle = `rgba(${p > .72 ? C.mint : C.blue},${.3 + p * .6})`;
        ctx.beginPath();
        ctx.arc(w / 2 + Math.sin(i * 2.3) * spread, 7 + p * (h - 14), 1.9, 0, 7);
        ctx.fill();
      }
    },

    pipe(ctx, w, h, t) {
      for (let l = 0; l < 2; l++) {
        const y = h * (.36 + l * .28);
        ctx.strokeStyle = `rgba(${C.blue},.15)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(w - 4, y); ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const p = ((t * 1.05 + i * 44 + l * 22) % 128) / 128;
          ctx.fillStyle = `rgba(${p > .7 ? C.mint : C.blue},${.32 + p * .55})`;
          ctx.fillRect(4 + p * (w - 8), y - 1.2, 4 + p * 3, 2.4);
        }
      }
    },

    broadcast(ctx, w, h, t) {
      const cx = w * .26, cy = h / 2;
      ctx.fillStyle = `rgba(${C.mint},.95)`;
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 7); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const p = ((t * .85 + i * 40) % 120) / 120;
        ctx.strokeStyle = `rgba(${C.blue},${(1 - p) * .75})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cx, cy, 5 + p * (w * .62), -.85, .85); ctx.stroke();
      }
    },

    code(ctx, w, h, t) {
      ctx.strokeStyle = `rgba(${C.blue},.8)`; ctx.lineWidth = 1.7; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(w * .37, h * .28); ctx.lineTo(w * .21, h * .5); ctx.lineTo(w * .37, h * .72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * .63, h * .28); ctx.lineTo(w * .79, h * .5); ctx.lineTo(w * .63, h * .72); ctx.stroke();
      if (((t / 24) | 0) % 2 === 0) {
        ctx.fillStyle = `rgba(${C.mint},.95)`;
        ctx.fillRect(w * .47, h * .36, 2.2, h * .28);
      }
    },

    lock(ctx, w, h, t) {
      ctx.strokeStyle = `rgba(${C.blue},.7)`; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(w / 2, h * .42, w * .15, Math.PI, 0); ctx.stroke();
      const a = .45 + Math.abs(Math.sin(t / 32)) * .45;
      ctx.fillStyle = `rgba(${C.mint},${a * .35})`;
      ctx.fillRect(w / 2 - w * .21, h * .44, w * .42, h * .3);
      ctx.strokeStyle = `rgba(${C.mint},${a})`; ctx.lineWidth = 1.2;
      ctx.strokeRect(w / 2 - w * .21, h * .44, w * .42, h * .3);
    },

    doc(ctx, w, h, t) {
      ctx.strokeStyle = `rgba(${C.blue},.45)`; ctx.lineWidth = 1.2;
      ctx.strokeRect(w * .24, h * .16, w * .52, h * .68);
      for (let i = 0; i < 4; i++) {
        const grow = Math.max(0, Math.min(1, (((t / 14) % 30) - i * 3) / 3));
        ctx.strokeStyle = `rgba(${i === 0 ? C.mint : C.blue},${.22 + grow * .6})`;
        ctx.lineWidth = 1.4;
        const y = h * .3 + i * (h * .13);
        ctx.beginPath(); ctx.moveTo(w * .32, y); ctx.lineTo(w * .32 + grow * (w * .36), y); ctx.stroke();
      }
    },

    zero(ctx, w, h, t) {
      const r = Math.min(w, h) * .23;
      ctx.strokeStyle = `rgba(${C.mint},.9)`; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2, r * .7, r, 0, 0, 7); ctx.stroke();
      const p = (t % 105) / 105;
      ctx.strokeStyle = `rgba(${C.mint},${(1 - p) * .5})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r + p * (w * .3), 0, 7); ctx.stroke();
    },

    people(ctx, w, h, t) {
      const pts = [[w * .5, h * .27], [w * .25, h * .71], [w * .75, h * .71]];
      ctx.strokeStyle = `rgba(${C.blue},.3)`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.closePath(); ctx.stroke();
      pts.forEach((pt, i) => {
        const a = .4 + Math.abs(Math.sin(t / 25 + i * 2.1)) * .55;
        ctx.fillStyle = `rgba(${i === 0 ? C.mint : C.blue},${a})`;
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 2.6, 0, 7); ctx.fill();
      });
    },

    clock(ctx, w, h, t) {
      const r = Math.min(w, h) * .3;
      ctx.strokeStyle = `rgba(${C.blue},.4)`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = `rgba(${C.mint},.3)`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r, -Math.PI / 2, -Math.PI / 2 + 1.15); ctx.stroke();
      const a = -Math.PI / 2 + t / 48;
      ctx.strokeStyle = `rgba(${C.mint},.9)`; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * r * .78, h / 2 + Math.sin(a) * r * .78);
      ctx.stroke();
    }
  };

  function wireGlyphs(root = document) {
    $$('[data-glyph]', root).forEach(cv => {
      if (cv.dataset.wired) return;
      const fn = GLYPH_FX[cv.dataset.glyph];
      if (!fn) return;
      cv.dataset.wired = '1';
      makeCanvas(cv, (ctx, w, h, t) => { ctx.clearRect(0, 0, w, h); fn(ctx, w, h, t); });
    });
  }
  window.CDSG_glyphs = wireGlyphs;
  window.CDSG_GLYPH_FX = GLYPH_FX;   // exposed so individual glyphs can be tested/extended
  wireGlyphs();

  /* =========================================================
     Cell strips — a number shown as lit cells instead of prose
     <div class="cells" data-cells="12" data-lit="2" [data-sweep]>
     ========================================================= */
  function wireCells(root = document) {
    $$('[data-cells]', root).forEach(el => {
      if (el.dataset.wired) return;
      el.dataset.wired = '1';
      const n = +el.dataset.cells || 8;
      const lit = +el.dataset.lit || 0;
      el.innerHTML = Array.from({ length: n }, (_, i) => `<i${i < lit ? ' class="on"' : ''}></i>`).join('');
      if (!el.hasAttribute('data-sweep') || reduced) return;
      const cells = [...el.children];
      let k = 0, timer = null;
      new IntersectionObserver(en => {
        if (en[0].isIntersecting && !timer) {
          timer = setInterval(() => {
            cells.forEach((c, i) => c.classList.toggle('on', i <= k));
            k = (k + 1) % (n + 4);
          }, 180);
        } else if (!en[0].isIntersecting && timer) {
          clearInterval(timer); timer = null;
        }
      }, { threshold: 0 }).observe(el);
    });
  }
  window.CDSG_cells = wireCells;
  wireCells();

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
