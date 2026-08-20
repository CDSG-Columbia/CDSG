/* =========================================================
   Executive Board — founding stage

   Three states per seat:

     open: true                     -> "Recruiting", mint flag, apply button
     open: false, name: null        -> "Filled", grey flag, no apply button
     open: false, name: 'Real Name' -> the person, plus year / major / bio

   So a filled seat can go up before you decide to publish a name.
   To publish one, add:

       name:  'Their Real Name'
       year:  'CC ’28'
       major: 'Statistics'
       bio:   'One or two sentences about them.'

   Leave `role`, `div`, `owns`, `skills` and `radar` alone unless
   the seat itself changes — those describe the SEAT, not the person,
   which is why they can be truthful before anyone fills it.

   radar axes (0–100) = the competency mix this seat is staffed for:
   [Engineering, Analytics, Strategy, Marketing, Client]

   `div` doubles as the filter chip on the page, and maps onto the four
   member tracks (plus Leadership and Operations, which sit above them).
   ========================================================= */
const BOARD = [
  {
    role: 'President', div: 'Leadership', open: false,
    name: null, year: null, major: null, bio: null,
    owns: 'Sets the agenda, holds final say on which engagements we take, and runs the weekly scoping review.',
    skills: ['Client Strategy', 'Scoping', 'SQL', 'Financial Modeling'],
    radar: [45, 72, 95, 66, 92]
  },
  {
    role: 'Vice President', div: 'Leadership', open: true,
    name: null, year: null, major: null, bio: null,
    owns: 'Runs staffing, timelines, and the quality bar across every project committee.',
    skills: ['Staffing', 'Process Design', 'Project Management', 'Python'],
    radar: [60, 74, 86, 62, 74]
  },
  {
    role: 'Director of Strategy & Client', div: 'Strategy & Client', open: false,
    name: null, year: null, major: null, bio: null,
    owns: 'Sources the deals. Runs intake and market research, and stays the client’s single point of contact.',
    skills: ['Client Sourcing', 'Pitching', 'Market Research', 'Scoping'],
    radar: [30, 58, 96, 72, 98]
  },
  {
    role: 'Director of Data Engineering & Analytics', div: 'Data Engineering & Analytics', open: true,
    name: null, year: null, major: null, bio: null,
    owns: 'Owns the work end to end — cleaning, pipeline, analysis, recommendation. Staffs every project committee.',
    skills: ['Python', 'SQL', 'Forecasting', 'Causal Inference'],
    radar: [92, 95, 48, 28, 44]
  },
  {
    role: 'Director of Marketing', div: 'Marketing', open: false,
    name: null, year: null, major: null, bio: null,
    owns: 'Campus and city presence, analyst recruitment, and networking events.',
    skills: ['Brand & Social', 'Recruitment', 'Events', 'Copywriting'],
    radar: [26, 46, 62, 97, 80]
  },
  {
    role: 'Director of Software Engineering', div: 'Software Engineering', open: true,
    name: null, year: null, major: null, bio: null,
    owns: 'This website, internal tooling, and anything client-facing a committee needs built.',
    skills: ['JavaScript', 'Git & Deployment', 'APIs', 'UI Design'],
    radar: [93, 56, 40, 48, 36]
  }
];

const AXES = ['Engineering', 'Analytics', 'Strategy', 'Marketing', 'Client'];

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CDSG_COLORS;

  const cta = $('#cta-net');
  if (cta) window.CDSG_network(cta, { density: 0.00007, max: 55, linkDist: 110, speed: .16 });

  const initials = n => n ? n.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() : null;
  const openCount = BOARD.filter(m => m.open).length;
  // a seat is open, filled with a published name, or filled with the name not up yet
  const face  = (m, i) => initials(m.name) || String(i + 1).padStart(2, '0');
  const title = m => m.open ? 'Recruiting' : (m.name || 'Filled');

  /* ---------------- Radar chart (SVG) ---------------- */
  function radar(values, size = 250, color = C.blue, interactive = false) {
    const cx = size / 2, cy = size / 2, R = size * 0.36;
    const n = values.length;
    const pt = (i, r) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    let rings = '';
    [0.25, 0.5, 0.75, 1].forEach(f => {
      const p = Array.from({ length: n }, (_, i) => pt(i, R * f).join(',')).join(' ');
      rings += `<polygon points="${p}" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1"/>`;
    });
    let spokes = '', labels = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, R);
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.08)"/>`;
      const [lx, ly] = pt(i, R + 22);
      labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
        font-family="JetBrains Mono, monospace" font-size="8.5" letter-spacing="1"
        fill="${interactive ? 'rgba(56,205,255,.85)' : 'rgba(255,255,255,.42)'}"
        ${interactive ? `class="radar-lbl" data-axis="${i}" style="cursor:pointer"` : ''}
        >${AXES[i].toUpperCase()}</text>`;
    }
    const poly = values.map((v, i) => pt(i, R * (v / 100)).join(',')).join(' ');
    const dots = values.map((v, i) => {
      const [x, y] = pt(i, R * (v / 100));
      return `<circle cx="${x}" cy="${y}" r="3" fill="rgb(${color})"/>`;
    }).join('');
    // Pad the viewBox so the axis labels sit inside the box — parent cards
    // use overflow:hidden and would otherwise clip them.
    const vp = 34;
    return `<svg viewBox="${-vp} ${-vp} ${size + vp * 2} ${size + vp * 2}"
      width="${size}" height="${size}" style="max-width:100%;height:auto">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(${C.blue},.5)"/>
          <stop offset="100%" stop-color="rgba(${C.mint},.28)"/>
        </linearGradient>
      </defs>
      ${rings}${spokes}
      <polygon points="${poly}" fill="url(#rg)" stroke="rgb(${color})" stroke-width="1.6"
        style="transform-origin:center; animation:radarIn .9s cubic-bezier(.16,1,.3,1) both"/>
      ${dots}${labels}
    </svg>`;
  }

  const st = document.createElement('style');
  st.textContent = '@keyframes radarIn{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}';
  document.head.appendChild(st);

  /* ---------------- Target coverage radar ---------------- */
  const boardRadar = $('#board-radar');
  if (boardRadar) {
    const avg = AXES.map((_, i) =>
      Math.round(BOARD.reduce((s, m) => s + m.radar[i], 0) / BOARD.length));
    const chips = $('#coverage-chips');

    function bindAxes() {
      $$('.radar-lbl', boardRadar).forEach(t => {
        t.addEventListener('mouseenter', () => showAxis(+t.dataset.axis));
        t.addEventListener('click', () => showAxis(+t.dataset.axis));
      });
    }
    function showAxis(i) {
      const ranked = [...BOARD].sort((a, b) => b.radar[i] - a.radar[i]).slice(0, 3);
      chips.innerHTML = `<span class="chip" style="border-color:rgba(58,232,200,.45);color:#fff">${AXES[i]}</span>` +
        ranked.map(m => `<span class="chip">${m.role}</span>`).join('');
    }
    new IntersectionObserver((en, ob) => {
      if (en[0].isIntersecting) {
        boardRadar.innerHTML = radar(avg, 268, C.mint, true);
        bindAxes(); showAxis(2); ob.disconnect();
      }
    }, { threshold: .3 }).observe(boardRadar);
  }

  /* ---------------- Avatar particle field ---------------- */
  function avatarField(cv, seed) {
    let pts = [];
    window.CDSG_canvas(cv, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = .6;
      pts.forEach(p => {
        p.a += p.sp;
        p.x = p.cx + Math.cos(p.a) * p.r;
        p.y = p.cy + Math.sin(p.a * 1.3) * p.r * .7;
      });
      pts.forEach((p, i) => {
        pts.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d > 62) return;
          ctx.strokeStyle = `rgba(${C.blue},${(1 - d / 62) * .32})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        });
      });
      pts.forEach((p, i) => {
        ctx.fillStyle = `rgba(${i % 3 === 0 ? C.mint : C.blue},${.4 + Math.sin(t / 30 + i) * .35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 7); ctx.fill();
      });
    }, {
      onResize(w, h) {
        let s = seed;
        const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
        pts = Array.from({ length: 14 }, () => ({
          cx: rnd() * w, cy: rnd() * h, r: 8 + rnd() * 24,
          a: rnd() * 7, sp: .004 + rnd() * .01, x: 0, y: 0
        }));
      }
    });
  }

  /* ---------------- Seat counter ---------------- */
  const counter = $('#seat-count');
  if (counter) counter.innerHTML =
    `<span class="pill">${openCount} of ${BOARD.length} seats open</span>`;

  /* ---------------- Grid ---------------- */
  const grid = $('#team-grid');
  const filterBar = $('#div-filters');
  const divisions = ['All', ...new Set(BOARD.map(m => m.div))];

  if (filterBar) {
    filterBar.innerHTML = divisions.map((d, i) =>
      `<button class="filter${i === 0 ? ' active' : ''}" data-div="${d}">${d}
        <span class="n">${d === 'All' ? BOARD.length : BOARD.filter(m => m.div === d).length}</span>
       </button>`).join('');
    filterBar.addEventListener('click', e => {
      const b = e.target.closest('.filter'); if (!b) return;
      $$('.filter', filterBar).forEach(f => f.classList.toggle('active', f === b));
      const d = b.dataset.div;
      $$('.member', grid).forEach(card => {
        const show = d === 'All' || card.dataset.div === d;
        card.style.display = show ? '' : 'none';
        if (show) { card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter'); }
      });
    });
  }

  if (grid) {
    grid.innerHTML = BOARD.map((m, i) => `
      <article class="member${m.open ? ' open-role' : ''}" data-i="${i}" data-div="${m.div}"
               data-reveal data-dir="scale" data-delay="${(i % 3) * .07}">
        ${m.open ? '<span class="flag">Seat open</span>' : '<span class="flag filled">Filled</span>'}
        <span class="plus">+</span>
        <div class="avatar">
          <canvas></canvas>
          <span class="initials">${face(m, i)}</span>
        </div>
        <div class="member-body">
          <div class="role">${m.role}</div>
          <h3>${title(m)}</h3>
          <div class="yr">${m.open ? 'Apply now' : (m.name ? `${m.year} · ${m.major}` : 'Seat filled')}</div>
        </div>
      </article>`).join('');

    $$('.member', grid).forEach((el, i) => {
      avatarField(el.querySelector('canvas'), (i + 3) * 7919);
      el.addEventListener('click', () => openDrawer(i));
      new IntersectionObserver((en, ob) => {
        if (en[0].isIntersecting) {
          setTimeout(() => el.classList.add('in'), (i % 3) * 80);
          ob.disconnect();
        }
      }, { threshold: .15 }).observe(el);
    });
  }

  /* ---------------- Drawer ---------------- */
  const drawer = $('#drawer'), scrim = $('#scrim'), body = $('#drawer-body');
  function openDrawer(i) {
    const m = BOARD[i];
    body.innerHTML = `
      <div class="d-avatar">${face(m, i)}</div>
      <div class="mono faint" style="font-size:10px;letter-spacing:.2em">SEAT ${String(i + 1).padStart(2, '0')} / ${BOARD.length}</div>
      <h2 style="margin-top:6px">${m.name || m.role}</h2>
      <div class="d-role">${m.name ? `${m.role} · ${m.div}` : `${m.div} · seat ${m.open ? 'open' : 'filled'}`}</div>
      ${m.open
        ? `<div class="mt-s"><span class="pill">Accepting applications</span></div>`
        : m.name
          ? `<p class="d-bio">${m.bio || ''}</p>
             <div class="d-sub">Year &amp; Field</div>
             <p class="muted" style="font-size:.92rem">${m.year} &nbsp;·&nbsp; ${m.major}</p>`
          : `<div class="mt-s"><span class="pill grey">Seat filled</span></div>`}

      <div class="d-sub">What this seat owns</div>
      <p class="d-bio">${m.owns}</p>

      <div class="d-sub">Competency profile of the seat</div>
      <div class="radar-wrap">${radar(m.radar, 260, C.blue)}</div>

      <div class="d-sub">Toolkit</div>
      <div class="chips">${m.skills.map(s => `<span class="chip">${s}</span>`).join('')}</div>

      ${m.open
        ? `<div class="d-sub">Want this seat?</div>
           <a class="btn btn-sm btn-primary" href="join.html#students">Apply <span class="arrow">→</span></a>`
        : `<div class="d-sub">Reach out</div>
           <a class="btn btn-sm" href="mailto:cdsg.columbia@gmail.com?subject=For%20${encodeURIComponent(m.role)}">Email the group <span class="arrow">→</span></a>`}
    `;
    drawer.classList.add('open'); scrim.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  const close = () => {
    drawer.classList.remove('open'); scrim.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  scrim?.addEventListener('click', close);
  $('#drawer-close')?.addEventListener('click', close);
})();
