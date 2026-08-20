/* ============ What We Do — interactive pipeline ============ */
(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CDSG_COLORS;
  const lerp = (a, b, t) => a + (b - a) * t;

  const cta = $('#cta-net');
  if (cta) window.CDSG_network(cta, { density: 0.00007, max: 55, linkDist: 110, speed: .16 });

  /* =========================================================
     PIPELINE CANVAS
     ========================================================= */
  const cv = $('#pipeline-canvas');
  if (cv) {
    const N = 240;
    const PAD = 46;
    let W = 0, H = 0;
    let stage = 0, since = 0;

    // Each record: an index, a "category" (0-4), a quality flag.
    const pts = Array.from({ length: N }, (_, i) => {
      const bad = Math.random() < 0.22;                     // null / dupe / outlier
      const cat = Math.floor(Math.random() * 5);
      const u = Math.random();                              // the "driver" variable
      return {
        i, bad, cat, u,
        v: Math.min(1, Math.max(0, u * 0.72 + Math.random() * 0.3)), // correlated outcome
        x: 0, y: 0, tx: 0, ty: 0,
        a: 1, ta: 1, r: 1.9,
        jx: Math.random() * 7, jy: Math.random() * 7        // jitter phase
      };
    });

    const alive = () => pts.filter(p => !p.bad);

    /* ---- Stage target layouts ---- */
    function layout() {
      // Measure directly: the rAF loop is paused while the canvas is off-screen,
      // so W/H cannot be trusted to have been set yet.
      const r = cv.getBoundingClientRect();
      if (r.width > 0) { W = r.width; H = r.height; }
      if (!W || !H) return;
      const iw = W - PAD * 2, ih = H - PAD * 2;

      if (stage === 0) {                                    // COLLECT — chaos
        pts.forEach(p => {
          p.tx = PAD + Math.random() * iw;
          p.ty = PAD + Math.random() * ih;
          p.ta = p.bad ? .8 : .85;
          p.r = 1.9;
        });
      }

      else if (stage === 1) {                               // CLEAN — bad records ejected
        pts.forEach(p => {
          if (p.bad) {                                      // fly out to the edges and fade
            const ang = Math.atan2(p.y - H / 2, p.x - W / 2);
            p.tx = W / 2 + Math.cos(ang) * W * 0.85;
            p.ty = H / 2 + Math.sin(ang) * H * 0.85;
            p.ta = 0;
          } else {
            p.tx = W / 2 + (Math.random() - .5) * iw * .68;
            p.ty = H / 2 + (Math.random() - .5) * ih * .62;
            p.ta = .9; p.r = 2;
          }
        });
      }

      else if (stage === 2) {                               // ORGANIZE — grid / table
        const list = alive();
        const cols = 16;
        const rows = Math.ceil(list.length / cols);
        const cw = iw / cols, rh = Math.min(ih / rows, 24);
        const y0 = (H - rows * rh) / 2 + rh / 2;
        list.sort((a, b) => a.cat - b.cat || a.u - b.u);
        list.forEach((p, k) => {
          const c = k % cols, r = Math.floor(k / cols);
          p.tx = PAD + c * cw + cw / 2;
          p.ty = y0 + r * rh;
          p.ta = .95; p.r = 2.1;
        });
        pts.filter(p => p.bad).forEach(p => { p.ta = 0; });
      }

      else if (stage === 3) {                               // ANALYZE — scatter + fit
        pts.forEach(p => {
          if (p.bad) { p.ta = 0; return; }
          p.tx = PAD + p.u * iw;
          p.ty = H - PAD - p.v * ih;
          p.ta = .9; p.r = 2.2;
        });
      }

      else {                                                // OPTIMIZE — binned bars
        const list = alive();
        const bins = 12;
        const groups = Array.from({ length: bins }, () => []);
        list.forEach(p => groups[Math.min(bins - 1, Math.floor(p.u * bins))].push(p));
        const bw = iw / bins;
        // "return" curve: rises, peaks around bin 8, tapers
        const yieldOf = k => 0.25 + 0.75 * Math.sin((k / (bins - 1)) * 2.2) * (1 - k / (bins * 3));
        const peak = groups.map((g, k) => yieldOf(k)).reduce((best, v, k, arr) => v > arr[best] ? k : best, 0);
        cv._peak = peak; cv._bins = bins;
        groups.forEach((g, k) => {
          const cols = 4;
          g.forEach((p, j) => {
            const c = j % cols, r = Math.floor(j / cols);
            p.tx = PAD + k * bw + bw / 2 + (c - (cols - 1) / 2) * 5.4;
            p.ty = H - PAD - 8 - r * 6.2;
            p.ta = .92; p.r = 2;
            p.bin = k;
          });
        });
        cv._yield = groups.map((g, k) => yieldOf(k));
      }
    }

    /* ---- Drawing helpers ---- */
    function axes(ctx, alpha, xl, yl) {
      ctx.strokeStyle = `rgba(255,255,255,${0.11 * alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD - 12, PAD - 16); ctx.lineTo(PAD - 12, H - PAD + 12);
      ctx.lineTo(W - PAD + 14, H - PAD + 12);
      ctx.stroke();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(255,255,255,${0.3 * alpha})`;
      ctx.fillText(xl, W - PAD - ctx.measureText(xl).width + 10, H - PAD + 28);
      ctx.save();
      ctx.translate(PAD - 22, PAD - 4); ctx.rotate(-Math.PI / 2);
      ctx.fillText(yl, -ctx.measureText(yl).width, 0);
      ctx.restore();
    }

    let lastW = 0, lastH = 0, placed = false;
    window.CDSG_canvas(cv, (ctx, w, h, t) => {
      W = w; H = h;
      if (w !== lastW || h !== lastH) {          // first paint, or a resize
        lastW = w; lastH = h;
        layout();
        if (!placed) { pts.forEach(p => { p.x = p.tx; p.y = p.ty; }); placed = true; }
      }
      since++;
      const mix = Math.min(since / 55, 1);                  // overlay fade-in

      ctx.clearRect(0, 0, w, h);

      /* --- Stage-specific background overlays --- */
      if (stage === 0) {
        // "incoming files" streaming down
        ctx.font = '9px "JetBrains Mono", monospace';
        for (let i = 0; i < 9; i++) {
          const x = ((i * 137) % (w - 60)) + 20;
          const y = ((t * (1 + (i % 3) * .5) + i * 90) % (h + 60)) - 30;
          ctx.fillStyle = `rgba(${C.dim},.22)`;
          ctx.fillText(['pos_export.csv', 'hours.xlsx', 'invoices.pdf', 'traffic.json', 'inv_2024.csv'][i % 5], x, y);
        }
      }

      if (stage === 1) {
        // scanning sweep
        const sx = (t * 3.4) % (w + 200) - 100;
        const g = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
        g.addColorStop(0, `rgba(${C.mint},0)`);
        g.addColorStop(.5, `rgba(${C.mint},.10)`);
        g.addColorStop(1, `rgba(${C.mint},0)`);
        ctx.fillStyle = g; ctx.fillRect(sx - 70, 0, 140, h);
      }

      if (stage === 2) {
        // table rules
        ctx.strokeStyle = `rgba(255,255,255,${.05 * mix})`;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 16; i++) {
          const x = PAD + (i / 16) * (w - PAD * 2);
          ctx.beginPath(); ctx.moveTo(x, PAD - 10); ctx.lineTo(x, h - PAD + 10); ctx.stroke();
        }
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${C.blue},${.4 * mix})`;
        ['id', 'vendor', 'date', 'qty', 'unit_$', 'margin', 'channel', 'hour'].forEach((s, i) => {
          ctx.fillText(s, PAD + i * ((w - PAD * 2) / 8) + 2, PAD - 18);
        });
      }

      if (stage === 3) {
        axes(ctx, mix, 'STAFF HOURS →', 'REVENUE →');
        // regression line + band
        const x1 = PAD, x2 = w - PAD;
        const y1 = h - PAD - 0.22 * (h - PAD * 2);
        const y2 = h - PAD - 0.86 * (h - PAD * 2);
        ctx.save();
        ctx.globalAlpha = mix;
        ctx.fillStyle = `rgba(${C.mint},.07)`;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + 30); ctx.lineTo(x2, y2 + 22); ctx.lineTo(x2, y2 - 22); ctx.lineTo(x1, y1 - 30);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(${C.mint},.85)`; ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * .6;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${C.mint},.9)`;
        ctx.fillText('r = 0.81', x2 - 74, y2 - 30);
        ctx.restore();
      }

      if (stage === 4) {
        const bins = cv._bins || 12, ys = cv._yield || [];
        const bw = (w - PAD * 2) / bins;
        const peak = cv._peak || 0;
        ctx.save();
        ctx.globalAlpha = mix;
        ys.forEach((v, k) => {
          const bh = Math.max(0, v) * (h - PAD * 2) * .92;
          const x = PAD + k * bw;
          const isPeak = k === peak;
          const g = ctx.createLinearGradient(0, h - PAD - bh, 0, h - PAD);
          g.addColorStop(0, `rgba(${isPeak ? C.mint : C.blue},${isPeak ? .28 : .12})`);
          g.addColorStop(1, `rgba(${isPeak ? C.mint : C.blue},.01)`);
          ctx.fillStyle = g;
          ctx.fillRect(x + 2, h - PAD - bh, bw - 4, bh);
          ctx.strokeStyle = `rgba(${isPeak ? C.mint : C.blue},${isPeak ? .8 : .22})`;
          ctx.lineWidth = isPeak ? 1.4 : 1;
          ctx.beginPath(); ctx.moveTo(x + 2, h - PAD - bh); ctx.lineTo(x + bw - 2, h - PAD - bh); ctx.stroke();
          if (isPeak) {
            const pulse = .45 + Math.sin(t / 15) * .3;
            ctx.strokeStyle = `rgba(${C.mint},${pulse})`;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(x + 2, h - PAD - bh, bw - 4, bh);
            ctx.setLineDash([]);
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillStyle = `rgba(${C.mint},.95)`;
            ctx.fillText('OPTIMUM', x - 12, h - PAD - bh - 12);
            ctx.fillText('+31% margin', x - 16, h - PAD - bh - 26);
          }
        });
        axes(ctx, mix, 'PREP WINDOW →', 'MARGIN →');
        ctx.restore();
      }

      /* --- Points --- */
      pts.forEach(p => {
        p.x = lerp(p.x, p.tx, 0.062);
        p.y = lerp(p.y, p.ty, 0.062);
        p.a = lerp(p.a, p.ta, 0.05);
        if (p.a < 0.012) return;
        p.jx += .017; p.jy += .019;
        const dx = stage <= 1 ? Math.sin(p.jx) * 1.6 : Math.sin(p.jx) * .5;
        const dy = stage <= 1 ? Math.cos(p.jy) * 1.6 : Math.cos(p.jy) * .5;

        let col = C.blue;
        if (stage === 0) col = p.bad ? C.danger : (p.i % 3 ? C.dim : C.blue);
        else if (stage === 1) col = p.bad ? C.danger : C.blue;
        else if (stage === 2) col = [C.blue, C.mint, C.violet, C.blue, C.amber][p.cat];
        else if (stage === 3) col = p.v > p.u * .8 + .12 ? C.mint : C.blue;
        else col = p.bin === cv._peak ? C.mint : C.blue;

        ctx.fillStyle = `rgba(${col},${p.a})`;
        ctx.beginPath(); ctx.arc(p.x + dx, p.y + dy, p.r, 0, 7); ctx.fill();
      });

      /* trailing count */
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillText(`frame ${t}`, w - 74, h - 12);
    });

    /* ---- Stage switching ---- */
    const META = [
      { name: 'raw_intake.csv',   k: 'N = <b>240</b> · USABLE <b>31%</b>' },
      { name: 'cleaned_v2.csv',   k: 'N = <b>187</b> · USABLE <b>94%</b>' },
      { name: 'warehouse.schema', k: 'TABLES <b>6</b> · KEYS <b>JOINED</b>' },
      { name: 'model_fit.json',   k: 'r = <b>0.81</b> · p &lt; <b>0.01</b>' },
      { name: 'recommendation.md',k: 'MARGIN <b>+31%</b> · CONF <b>HIGH</b>' }
    ];
    const roName = $('#ro-name'), roK = $('#ro-n')?.parentElement, prog = $('#stage-prog');
    const readoutRight = document.querySelectorAll('.stage-readout span')[1];

    function setStage(s) {
      stage = s; since = 0;
      layout();
      $$('.stage-btn').forEach(b => b.classList.toggle('active', +b.dataset.stage === s));
      if (roName) roName.textContent = META[s].name;
      if (readoutRight) readoutRight.innerHTML = META[s].k;
      if (prog) prog.style.width = ((s + 1) / 5) * 100 + '%';
    }

    // Auto-tour, but only once the viz is actually on screen — and it stops
    // the moment someone takes over.
    let auto = null;
    new IntersectionObserver(en => {
      if (en[0].isIntersecting && auto === null) {
        auto = setInterval(() => setStage((stage + 1) % 5), 5200);
      }
    }, { threshold: .35 }).observe(cv);

    $$('.stage-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (auto) clearInterval(auto);
        auto = -1;                                  // -1 = user has taken over
        setStage(+b.dataset.stage);
      });
    });

    addEventListener('resize', () => layout());
  }

  /* =========================================================
     CLEANING TABLE DEMO
     ========================================================= */
  const before = [
    ['Hudson Sply', '03/14/24', '$1,240.00', true],
    ['HUDSON SUPPLY CO.', '2024-03-14', '1240', true],
    ['Bleecker Roasters', '14-Mar-2024', '$886.50', false],
    ['bleecker roasters ', 'Mar 14 2024', '886.5', true],
    ['Amsterdam Paper', '03/15/2024', '—', true],
    ['Amsterdam Paper Co', '2024-03-15', '$2,015.75', false]
  ];
  const after = [
    ['Hudson Supply Co.', '2024-03-14', '1240.00'],
    ['Bleecker Roasters', '2024-03-14', '886.50'],
    ['Amsterdam Paper Co.', '2024-03-15', '2015.75'],
    ['Amsterdam Paper Co.', '2024-03-15', '412.00*']
  ];

  const tb = $('#tbl-before'), ta = $('#tbl-after'), toggle = $('#clean-toggle');
  if (tb && ta) {
    before.forEach(r => {
      const d = document.createElement('div');
      d.className = 'row' + (r[3] ? ' bad' : '');
      d.innerHTML = `<span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span>`;
      tb.appendChild(d);
    });
    after.forEach(r => {
      const d = document.createElement('div');
      d.className = 'row';
      d.style.opacity = '0';
      d.style.transform = 'translateX(-10px)';
      d.innerHTML = `<span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span>`;
      ta.appendChild(d);
    });
    const note = document.createElement('div');
    note.className = 'row';
    note.style.cssText = 'opacity:0;color:var(--text-faint);font-size:10px;letter-spacing:.1em;grid-template-columns:1fr';
    note.innerHTML = `<span>* imputed from 30-day vendor median · flagged</span>`;
    ta.appendChild(note);

    let ran = false;
    const run = () => {
      ran = !ran;
      const rows = [...ta.querySelectorAll('.row')];
      rows.forEach((r, i) => {
        setTimeout(() => {
          r.style.transition = '.5s cubic-bezier(.16,1,.3,1)';
          r.style.opacity = ran ? '1' : '0';
          r.style.transform = ran ? 'none' : 'translateX(-10px)';
        }, ran ? i * 130 : 0);
      });
      [...tb.querySelectorAll('.row.bad')].forEach((r, i) => {
        setTimeout(() => {
          r.style.transition = '.45s ease';
          r.style.textDecoration = ran ? 'line-through' : 'none';
          r.style.opacity = ran ? '.42' : '1';
        }, ran ? i * 110 : 0);
      });
      toggle.innerHTML = ran ? 'Reset <span class="arrow">↺</span>' : 'Run cleaning pass <span class="arrow">→</span>';
    };
    toggle?.addEventListener('click', run);

    // auto-run once when scrolled into view
    new IntersectionObserver((en, ob) => {
      if (en[0].isIntersecting) { setTimeout(run, 500); ob.disconnect(); }
    }, { threshold: .45 }).observe(tb);
  }
})();
