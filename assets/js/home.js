/* ============ Homepage ============ */
(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CDSG_COLORS;
  const mk = window.CDSG_canvas;

  /* Hero + CTA node fields */
  const hero = $('#hero-net');
  if (hero) window.CDSG_network(hero, { density: 0.00009, max: 140, linkDist: 138 });
  const cta = $('#cta-net');
  if (cta) window.CDSG_network(cta, { density: 0.00007, max: 55, linkDist: 110, speed: .16 });

  /* Live clock (NYC) */
  const clock = $('#clock');
  if (clock) {
    const tick = () => {
      const t = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' });
      clock.textContent = t + ' EST';
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     Portal card mini-visualizations
     --------------------------------------------------------- */
  const vizzes = {
    /* 01 — pipeline: packets flowing through five gates */
    pipeline(cv) {
      const packets = Array.from({ length: 26 }, (_, i) => ({
        p: i / 26, lane: (i % 3), speed: 0.0025 + Math.random() * 0.0028
      }));
      mk(cv, (ctx, w, h, t) => {
        ctx.clearRect(0, 0, w, h);
        const gates = 5, gx = i => 16 + (i / (gates - 1)) * (w - 32);
        // rails
        for (let l = 0; l < 3; l++) {
          const y = h * (0.32 + l * 0.2);
          ctx.strokeStyle = `rgba(${C.blue},.13)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(w - 16, y); ctx.stroke();
        }
        // gates
        for (let i = 0; i < gates; i++) {
          const x = gx(i), a = .22 + Math.sin(t / 30 + i) * .18;
          ctx.strokeStyle = `rgba(${i === gates - 1 ? C.mint : C.blue},${a + .3})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(x, h * .22); ctx.lineTo(x, h * .8); ctx.stroke();
        }
        // packets
        packets.forEach(pk => {
          pk.p += pk.speed; if (pk.p > 1) pk.p = 0;
          const x = 16 + pk.p * (w - 32), y = h * (0.32 + pk.lane * 0.2);
          const late = pk.p > .62;
          ctx.fillStyle = `rgba(${late ? C.mint : C.blue},${.35 + pk.p * .6})`;
          ctx.fillRect(x, y - 1.6, 5 + pk.p * 7, 3.2);
        });
      });
    },

    /* 02 — network: a small org graph that breathes */
    network(cv) {
      let nodes = [];
      mk(cv, (ctx, w, h, t) => {
        ctx.clearRect(0, 0, w, h);
        nodes.forEach((n, i) => {
          n.a += n.sp;
          n.x = n.cx + Math.cos(n.a) * n.r;
          n.y = n.cy + Math.sin(n.a) * n.r * .55;
        });
        ctx.lineWidth = .7;
        nodes.forEach((n, i) => {
          nodes.slice(i + 1).forEach(m => {
            const d = Math.hypot(n.x - m.x, n.y - m.y);
            if (d > 78) return;
            ctx.strokeStyle = `rgba(${C.blue},${(1 - d / 78) * .4})`;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          });
        });
        nodes.forEach((n, i) => {
          ctx.fillStyle = `rgba(${i % 4 === 0 ? C.mint : C.blue},${.55 + Math.sin(t / 24 + i) * .35})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, i % 4 === 0 ? 3 : 2, 0, 7); ctx.fill();
        });
      }, {
        onResize(w, h) {
          nodes = Array.from({ length: 16 }, (_, i) => ({
            cx: 20 + Math.random() * (w - 40), cy: h * .25 + Math.random() * h * .55,
            r: 6 + Math.random() * 16, a: Math.random() * 7, sp: 0.004 + Math.random() * 0.009,
            x: 0, y: 0
          }));
        }
      });
    },

    /* 03 — bars: a small chart that keeps re-sampling */
    bars(cv) {
      const n = 22;
      let vals = Array.from({ length: n }, () => Math.random() * .7 + .15);
      let targets = [...vals];
      mk(cv, (ctx, w, h, t) => {
        if (t % 90 === 0) targets = targets.map(() => Math.random() * .78 + .14);
        ctx.clearRect(0, 0, w, h);
        const bw = (w - 32) / n;
        vals = vals.map((v, i) => v + (targets[i] - v) * .06);
        vals.forEach((v, i) => {
          const bh = v * (h - 26);
          const x = 16 + i * bw;
          const g = ctx.createLinearGradient(0, h - bh, 0, h);
          const hot = v > .68;
          g.addColorStop(0, `rgba(${hot ? C.mint : C.blue},.92)`);
          g.addColorStop(1, `rgba(${hot ? C.mint : C.blue},.06)`);
          ctx.fillStyle = g;
          ctx.fillRect(x, h - bh, bw - 2.4, bh);
        });
      });
    },

    /* 04 — scatter: points settling into a fitted trend */
    scatter(cv) {
      let pts = [];
      mk(cv, (ctx, w, h, t) => {
        ctx.clearRect(0, 0, w, h);
        // trend line
        ctx.strokeStyle = `rgba(${C.mint},.5)`; ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * .5;
        ctx.beginPath(); ctx.moveTo(14, h - 14); ctx.lineTo(w - 14, 16); ctx.stroke();
        ctx.setLineDash([]);
        pts.forEach((p, i) => {
          p.ph += .02;
          const y = p.y + Math.sin(p.ph) * 3;
          const out = p.out;
          ctx.fillStyle = `rgba(${out ? C.amber : C.blue},${out ? .9 : .68})`;
          ctx.beginPath(); ctx.arc(p.x, y, out ? 2.8 : 2, 0, 7); ctx.fill();
          if (out) {
            ctx.strokeStyle = `rgba(${C.amber},${.35 + Math.sin(t / 16) * .25})`; ctx.lineWidth = .8;
            ctx.beginPath(); ctx.arc(p.x, y, 7, 0, 7); ctx.stroke();
          }
        });
      }, {
        onResize(w, h) {
          pts = Array.from({ length: 34 }, () => {
            const x = 14 + Math.random() * (w - 28);
            const ideal = (h - 14) - ((x - 14) / (w - 28)) * (h - 30);
            const out = Math.random() < .12;
            return { x, y: ideal + (Math.random() - .5) * (out ? 46 : 17), out, ph: Math.random() * 7 };
          });
        }
      });
    }
  };

  $$('[data-viz]').forEach(cv => {
    const fn = vizzes[cv.dataset.viz];
    if (fn) fn(cv);
  });
})();
