/* =========================================================
   Projects — founding stage

   These are HYPOTHETICAL BRIEFS, not past engagements. They
   describe work we could deliver, written in the conditional
   throughout ("we'd", "you'd") so nothing here can be mistaken
   for a track record. Deliberately: no outcome metrics, no
   client names, no results charts.

   As real engagements finish, replace this array with actual
   case studies — and at that point add back the metrics.
   ========================================================= */
const BRIEFS = [
  {
    title: 'Prep-Window Optimization',
    sector: 'Food & Beverage',
    who: 'A café or bakery whose POS exports nobody has opened in two years',
    question: 'When should we prep, and how much of it?',
    summary: 'Rebuild years of POS exports into an hourly demand curve, then find the prep schedule that stops both the 9am shortfall and the 4pm waste.',
    problem: 'Prep volume gets set from memory. That usually means over-producing on quiet weekdays and running out mid-morning on busy weekends — and because waste is never logged, nobody can see the cost.',
    approach: [
      'Consolidate every POS export into one table, reconciling schema changes along the way',
      'Reconstruct hourly demand from timestamped line items',
      'Model waste as a function of prep timing and batch size',
      'Simulate alternative prep schedules against real historical demand'
    ],
    deliver: 'A revised prep schedule, a simple reorder rule, and a one-page weekly sheet the owner can actually keep using.',
    needs: ['12+ months of POS exports', 'Rough waste estimates, even if guessed', 'Two hours of the owner’s time'],
    tools: ['Python', 'pandas', 'SQL', 'Tableau']
  },
  {
    title: 'Staffing to Real Demand',
    sector: 'Food & Beverage',
    who: 'A restaurant or small group running one staffing template across every day of the week',
    question: 'How many people do we actually need on a Tuesday?',
    summary: 'Build a short-horizon cover forecast from the business’s own seasonality instead of a template that hasn’t changed in years.',
    problem: 'Locations get staffed identically despite very different weekday patterns, which produces overstaffing and understaffing on the same night. Nobody has time to sit with a year of data to find out where.',
    approach: [
      'Merge reservation, POS, and labor scheduling systems on a shared time key',
      'Build a per-location seasonal model with weather and local-event features',
      'Backtest against held-out weeks so the forecast is honestly evaluated',
      'Hand over a weekly forecast sheet a manager can fill in ten minutes'
    ],
    deliver: 'A seven-day cover forecast, a staffing template per location, and an honest write-up of how accurate it is.',
    needs: ['Reservation or cover counts', 'Labor schedules', 'POS sales by hour'],
    tools: ['R', 'Prophet', 'Google Sheets']
  },
  {
    title: 'Reorder Points & Dead Stock',
    sector: 'Retail',
    who: 'An independent retailer reordering by walking the aisles',
    question: 'What is sitting on our shelves doing nothing?',
    summary: 'Classify the full catalogue by velocity and margin, surface the capital trapped in slow movers, and set a reorder point for everything that matters.',
    problem: 'Without a velocity view, capital gets tied up in stock that hasn’t moved in a year while the fast movers go out of stock weekly. Both problems are invisible from the floor.',
    approach: [
      'Clean and deduplicate the catalogue — inconsistent SKU naming is usually the first wall',
      'Classify items by velocity and margin into an ABC-XYZ matrix',
      'Compute reorder points and safety stock per class',
      'Build a one-page weekly reorder report'
    ],
    deliver: 'A dead-stock list ranked by trapped capital, per-SKU reorder points, and a weekly report that replaces the aisle walk.',
    needs: ['Sales history by SKU', 'Current inventory counts', 'Cost and price per item'],
    tools: ['Python', 'Postgres', 'Excel']
  },
  {
    title: 'Appointment No-Show Risk',
    sector: 'Healthcare',
    who: 'A community clinic losing clinician hours to empty slots',
    question: 'Which appointments should we call to confirm?',
    summary: 'Rank each upcoming appointment by no-show risk so a front desk with limited time calls the ones that matter.',
    problem: 'Reminder calls go to everyone, which in practice means to no one. Meanwhile a predictable subset of appointments — long lead times, certain types, certain histories — drives most of the loss.',
    approach: [
      'De-identify and clean the scheduling records before anything else',
      'Engineer features from lead time, appointment type, and prior history',
      'Fit and calibrate a model, with fairness checks across zip codes',
      'Deliver a daily ranked call list, not a black box'
    ],
    deliver: 'A daily ranked call list, a plain-English explanation of what drives the score, and the fairness audit that goes with it.',
    needs: ['2+ years of scheduling records', 'A data-sharing agreement', 'A clinical contact for review'],
    tools: ['Python', 'scikit-learn', 'Metabase']
  },
  {
    title: 'Donor Segmentation & Lapse Risk',
    sector: 'Nonprofit',
    who: 'A small nonprofit emailing its whole list at the same cadence',
    question: 'Who is about to stop giving, and when do we reach them?',
    summary: 'Segment the donor file and find the window after a last gift where one well-timed touch still brings someone back.',
    problem: 'Major donors get the same email as a one-time $10 giver, and lapsed donors get contacted long after the window has closed. The CRM has the answer; nobody has had a spare month to look.',
    approach: [
      'Merge CRM, event attendance, and email engagement records',
      'Build RFM segments plus a survival model of time-to-lapse',
      'Identify the re-engagement window where outreach still works',
      'Write a segment-specific appeal calendar'
    ],
    deliver: 'A segmented donor file, a lapse-risk score, and an appeal calendar the development lead can run without us.',
    needs: ['A CRM export', 'Email engagement history', 'Event attendance if you have it'],
    tools: ['R', 'Salesforce export', 'Tableau']
  },
  {
    title: 'Route & Zone Consolidation',
    sector: 'Logistics',
    who: 'A small courier or delivery operation drawing routes by neighborhood name',
    question: 'Are our vans crossing each other?',
    summary: 'Re-cluster delivery zones around actual stop density and time windows rather than around neighborhood boundaries drawn years ago.',
    problem: 'Zones inherited from a map look tidy and route badly. Two vans end up on the same block within an hour of each other and nobody notices because nobody has plotted it.',
    approach: [
      'Geocode the full historical stop set',
      'Cluster by density and time-window constraints',
      'Run a capacitated routing heuristic against real order volume',
      'Validate the proposed zones against several weeks of live dispatch'
    ],
    deliver: 'Redrawn zones, a routing rule for dispatch, and a before/after mileage comparison on your own historical orders.',
    needs: ['12 months of delivery addresses and timestamps', 'Vehicle capacity and shift constraints'],
    tools: ['Python', 'OR-Tools', 'PostGIS', 'Leaflet']
  },
  {
    title: 'Membership Churn Drivers',
    sector: 'Fitness & Wellness',
    who: 'A studio or gym discounting to fix retention',
    question: 'When do members actually decide to leave?',
    summary: 'Run cohort survival analysis on check-in data to find the point in a membership where churn is really decided.',
    problem: 'Price gets blamed because it’s the visible lever, so discounting starts — and retention doesn’t move. The signal is usually in early attendance behaviour, weeks before the cancellation.',
    approach: [
      'Join check-in logs, billing records, and class bookings',
      'Run cohort survival analysis by acquisition channel',
      'Isolate the earliest behaviour that predicts cancellation',
      'Design and instrument an onboarding intervention to test it'
    ],
    deliver: 'A churn-driver analysis, the decision window, and a specific onboarding change with a way to measure whether it worked.',
    needs: ['Check-in logs', 'Billing and cancellation history', 'Class booking data'],
    tools: ['Python', 'lifelines', 'Looker Studio']
  },
  {
    title: 'Foot Traffic vs. Staffing',
    sector: 'Retail',
    who: 'A shop staffing every open hour the same way',
    question: 'Are we standing around at 2pm and drowning at 11am?',
    summary: 'Measure real foot traffic with cheap hardware, join it to weather and local events, and redistribute the same labor hours to where they convert.',
    problem: 'Staffing follows habit rather than traffic. Peak hours get overwhelmed while quiet stretches carry three people on the floor — and without a counter there’s no evidence either way.',
    approach: [
      'Install and validate a low-cost door counter',
      'Join traffic counts with weather and local event calendars',
      'Model conversion rate by staffing level and hour',
      'Produce a seasonal staffing template'
    ],
    deliver: 'A traffic baseline you keep measuring, plus a staffing template that moves hours without adding them.',
    needs: ['Willingness to install a counter', 'Sales by hour', 'Current staff schedules'],
    tools: ['Python', 'NOAA API', 'Excel']
  },
  {
    title: 'Pricing & Tier Structure',
    sector: 'Arts & Culture',
    who: 'A venue or class program whose prices were set by tradition',
    question: 'Which tier is actually leaving money on the table?',
    summary: 'Estimate demand sensitivity by tier and show what a restructured price ladder would have done to the last few seasons.',
    problem: 'The cheap tier sells out instantly and the middle tier sits empty at every event. That pattern is a pricing signal, but reading it takes ticket-level data nobody has assembled.',
    approach: [
      'Assemble several seasons of ticket-level sales data',
      'Estimate sensitivity per tier, controlling for event type and lead time',
      'Simulate revenue under alternative price ladders',
      'Design a live test across a handful of events'
    ],
    deliver: 'A proposed price ladder, the simulation behind it, and a test design so you can prove it before committing.',
    needs: ['Ticket-level sales history', 'Seating or capacity map', 'Event calendar'],
    tools: ['R', 'Stan', 'Tableau']
  }
];

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CDSG_COLORS;

  const cta = $('#cta-net');
  if (cta) window.CDSG_network(cta, { density: 0.00007, max: 55, linkDist: 110, speed: .16 });

  const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  /* =========================================================
     BRIEF GRID
     ========================================================= */
  const grid = $('#proj-grid');
  const sectors = ['All', ...new Set(BRIEFS.map(p => p.sector))];
  let active = 'All';

  $('#proj-filters').innerHTML = sectors.map((s, i) =>
    `<button class="filter${i === 0 ? ' active' : ''}" data-sector="${s}">${s}
      <span class="n">${s === 'All' ? BRIEFS.length : BRIEFS.filter(p => p.sector === s).length}</span>
     </button>`).join('');

  grid.innerHTML = BRIEFS.map((p, i) => `
    <article class="card proj" data-i="${i}" data-sector="${p.sector}"
             data-reveal data-dir="scale" data-delay="${(i % 3) * .07}">
      <div class="flex" style="justify-content:space-between;align-items:center;gap:10px">
        <span class="sector">${p.sector}</span>
        <span class="illus">Illustrative</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.summary}</p>
      <canvas class="flow"></canvas>
      <div class="brief-row">
        <div class="k">The question we'd answer</div>
        <div class="v">“${p.question}”</div>
      </div>
    </article>`).join('');

  /* A neutral flowing-pipeline ornament. Deliberately NOT a results chart —
     an upward trend line here would read as an outcome we haven't earned. */
  function flowViz(cv, seed) {
    const dots = Array.from({ length: 14 }, (_, i) => ({
      p: ((i * 37 + seed * 13) % 100) / 100,
      lane: i % 2,
      sp: 0.0022 + ((seed + i) % 5) * 0.0006
    }));
    window.CDSG_canvas(cv, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      for (let l = 0; l < 2; l++) {
        const y = h * (0.34 + l * 0.34);
        ctx.strokeStyle = `rgba(${C.blue},.12)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let g = 0; g < 4; g++) {
        const x = (g / 3) * (w - 6) + 3;
        ctx.strokeStyle = `rgba(${C.blue},${.1 + Math.sin(t / 34 + g) * .07})`;
        ctx.beginPath(); ctx.moveTo(x, h * .18); ctx.lineTo(x, h * .86); ctx.stroke();
      }
      dots.forEach(d => {
        d.p += d.sp; if (d.p > 1) d.p = 0;
        const x = d.p * w, y = h * (0.34 + d.lane * 0.34);
        ctx.fillStyle = `rgba(${d.p > .72 ? C.mint : C.blue},${.3 + d.p * .5})`;
        ctx.fillRect(x, y - 1.3, 4 + d.p * 5, 2.6);
      });
    });
  }

  $$('.proj', grid).forEach((el, i) => {
    flowViz(el.querySelector('.flow'), i + 1);
    el.addEventListener('click', () => openModal(i));
    new IntersectionObserver((en, ob) => {
      if (en[0].isIntersecting) { setTimeout(() => el.classList.add('in'), (i % 3) * 80); ob.disconnect(); }
    }, { threshold: .12 }).observe(el);
  });

  function applyFilters() {
    let shown = 0;
    $$('.proj', grid).forEach(el => {
      const show = active === 'All' || el.dataset.sector === active;
      el.style.display = show ? '' : 'none';
      if (show) { shown++; el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); }
    });
    $('#count-shown').textContent = shown;
    $('#empty-state').style.display = shown ? 'none' : 'block';
  }

  $('#proj-filters').addEventListener('click', e => {
    const b = e.target.closest('.filter'); if (!b) return;
    $$('#proj-filters .filter').forEach(f => f.classList.toggle('active', f === b));
    active = b.dataset.sector;
    applyFilters();
  });
  $('#count-total').textContent = BRIEFS.length;

  /* =========================================================
     MODAL
     ========================================================= */
  const mscrim = $('#modal-scrim'), mbody = $('#modal-body');
  function openModal(i) {
    const p = BRIEFS[i];
    mbody.innerHTML = `
      <div class="flex gap-m" style="align-items:center;flex-wrap:wrap">
        <span style="color:var(--mint);font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase">${p.sector}</span>
        <span class="illus">Illustrative brief — not a past engagement</span>
      </div>
      <h2 style="margin:14px 0 10px">${p.title}</h2>
      <p class="muted" style="font-size:.95rem">${p.who}</p>

      <div class="card mt-m" style="padding:22px 24px;background:rgba(56,205,255,.05)">
        <div class="mono" style="font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-faint)">The question we'd answer</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;margin-top:8px">“${p.question}”</div>
      </div>

      <div class="d-sub">Why it's hard</div>
      <p class="muted" style="font-size:.94rem">${p.problem}</p>

      <div class="d-sub">What we'd do</div>
      <ol class="muted" style="font-size:.94rem;padding-left:20px;margin:0">
        ${p.approach.map(a => `<li style="margin-bottom:8px">${a}</li>`).join('')}
      </ol>

      <div class="d-sub">What you'd walk away with</div>
      <p class="muted" style="font-size:.94rem">${p.deliver}</p>

      <div class="d-sub">What we'd need from you</div>
      <ul class="muted" style="font-size:.94rem;padding-left:20px;margin:0">
        ${p.needs.map(n => `<li style="margin-bottom:6px">${n}</li>`).join('')}
      </ul>

      <div class="d-sub">Likely stack</div>
      <div class="chips">${p.tools.map(t => `<span class="chip">${t}</span>`).join('')}</div>

      <div class="mt-m flex gap-s wrapf">
        <a class="btn btn-sm btn-primary" href="join.html#business">This is my problem — get in touch <span class="arrow">→</span></a>
      </div>
    `;
    mscrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  const closeModal = () => { mscrim.classList.remove('open'); document.body.style.overflow = ''; };
  $('#modal-close').addEventListener('click', closeModal);
  mscrim.addEventListener('click', e => { if (e.target === mscrim) closeModal(); });

  /* =========================================================
     HEX CARTOGRAM — every cell unclaimed
     Cell coordinates are [col, row] on an odd-row offset grid,
     laid out to loosely echo the geography of the five boroughs.
     ========================================================= */
  const CELLS = {
    'Bronx':        [[7,0],[8,0],[9,0],[7,1],[8,1],[9,1],[10,1],[8,2],[9,2]],
    'Manhattan':    [[6,1],[6,2],[6,3],[5,4],[6,4],[5,5],[5,6]],
    'Queens':       [[10,2],[11,2],[12,2],[10,3],[11,3],[12,3],[13,3],[10,4],[11,4],[12,4],[13,4],[11,5],[12,5]],
    'Brooklyn':     [[8,5],[9,5],[8,6],[9,6],[10,6],[8,7],[9,7],[10,7],[11,7],[9,8],[10,8]],
    'Staten Island':[[3,8],[4,8],[2,9],[3,9],[4,9],[3,10]]
  };
  const BCOLOR = {
    'Manhattan': C.blue, 'Brooklyn': C.mint, 'Queens': C.violet,
    'Bronx': C.amber, 'Staten Island': C.blue
  };

  const carto = $('#carto'), tip = $('#carto-tip');
  if (carto) {
    let hovered = null, legendHover = null, picked = null, cells = [], size = 12;
    const LABEL_BAND = 34;
    const mouse = { x: -999, y: -999 };

    function build(w, h) {
      const raw = [];
      BOROUGHS.forEach(b => {
        CELLS[b].forEach(([col, row], k) => {
          raw.push({
            b, k,
            rx: Math.sqrt(3) * (col + .5 * (row & 1)),
            ry: 1.5 * row
          });
        });
      });
      const xs = raw.map(c => c.rx), ys = raw.map(c => c.ry);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const pad = 16;
      const spanX = (maxX - minX) + 1.9;
      const spanY = (maxY - minY) + 2.3;
      size = Math.max(4, Math.min((w - pad * 2) / spanX, (h - pad * 2 - LABEL_BAND) / spanY));
      const ox = (w - spanX * size) / 2 + .95 * size - minX * size;
      const oy = (h - LABEL_BAND - spanY * size) / 2 + 1.15 * size - minY * size;
      cells = raw.map(c => Object.assign(c, { x: ox + c.rx * size, y: oy + c.ry * size }));
    }

    function hex(ctx, x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 180 * (60 * i - 90);
        const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
    }

    window.CDSG_canvas(carto, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      let near = null, nd = 1e9;
      cells.forEach(c => {
        const d = Math.hypot(c.x - mouse.x, c.y - mouse.y);
        if (d < nd) { nd = d; near = c; }
      });
      hovered = (nd < size * 1.3 && near) ? near.b : (legendHover || picked || null);

      cells.forEach(c => {
        const on = hovered === c.b;
        const col = BCOLOR[c.b];
        // a slow wave sweeping the city — "everything here is available"
        const wave = .5 + .5 * Math.sin(t / 30 - (c.x + c.y * .6) / 46);
        const a = on ? .34 : .07 + wave * .13;
        hex(ctx, c.x, c.y, size * .92);
        ctx.fillStyle = `rgba(${col},${a})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${col},${on ? .9 : .2 + wave * .3})`;
        ctx.lineWidth = on ? 1.5 : 1;
        ctx.stroke();
        if (on) {
          hex(ctx, c.x, c.y, size * 1.25);
          ctx.strokeStyle = `rgba(${col},${.16 + Math.sin(t / 12) * .12})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      });

      ctx.font = '9px "JetBrains Mono", monospace';
      BOROUGHS.forEach(b => {
        const list = cells.filter(c => c.b === b);
        const cx = list.reduce((s, c) => s + c.x, 0) / list.length;
        const cy = Math.min(Math.max(...list.map(c => c.y)) + size * 1.9, h - 8);
        const on = hovered === b;
        ctx.fillStyle = on ? `rgba(${BCOLOR[b]},.95)` : 'rgba(255,255,255,.26)';
        const label = b.toUpperCase();
        ctx.fillText(label, cx - ctx.measureText(label).width / 2, cy);
      });
    }, { onResize: build });

    carto.parentElement.addEventListener('mousemove', e => {
      const r = carto.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      const hit = cells.find(c => Math.hypot(c.x - mouse.x, c.y - mouse.y) < size * 1.2);
      if (hit) {
        tip.style.opacity = '1';
        tip.style.left = Math.min(mouse.x + 16, r.width - 178) + 'px';
        tip.style.top = (mouse.y - 8) + 'px';
        tip.innerHTML = `<b style="color:rgb(${BCOLOR[hit.b]})">${hit.b.toUpperCase()}</b> · UNCLAIMED<br>
          <span style="color:var(--text-faint)">click to start a proposal here</span>`;
        carto.style.cursor = 'pointer';
      } else { tip.style.opacity = '0'; carto.style.cursor = 'default'; }
    });
    carto.parentElement.addEventListener('mouseleave', () => {
      mouse.x = mouse.y = -999; tip.style.opacity = '0';
    });
    carto.addEventListener('click', e => {
      // read straight off the event — don't assume a mousemove landed first
      const r = carto.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const hit = cells.find(c => Math.hypot(c.x - mx, c.y - my) < size * 1.2);
      if (!hit) return;
      picked = picked === hit.b ? null : hit.b;
      renderLegend();
    });

    /* Legend */
    function renderLegend() {
      $('#carto-legend').innerHTML =
        `<div class="mono faint" style="font-size:10px;letter-spacing:.2em;margin-bottom:10px">ENGAGEMENTS BY BOROUGH</div>` +
        BOROUGHS.map(b => `
          <div class="li" data-b="${b}" style="cursor:pointer;${picked === b ? 'color:#fff' : ''}">
            <span><span class="sw" style="background:rgba(${BCOLOR[b]},${picked === b ? 1 : .55})"></span>${b}</span>
            <b style="color:${picked === b ? 'var(--mint)' : 'var(--text-faint)'}">0 · OPEN</b>
          </div>`).join('') +
        `<div class="mt-s">
           <a class="btn btn-sm ${picked ? 'btn-primary' : 'btn-ghost'}" href="join.html#business" style="width:100%;justify-content:center">
             ${picked ? `Propose a project in ${picked}` : 'Propose a project'} <span class="arrow">→</span>
           </a>
         </div>`;

      $$('#carto-legend .li').forEach(li => {
        li.addEventListener('mouseenter', () => { legendHover = li.dataset.b; });
        li.addEventListener('mouseleave', () => { legendHover = null; });
        li.addEventListener('click', () => {
          picked = picked === li.dataset.b ? null : li.dataset.b;
          renderLegend();
        });
      });
    }
    renderLegend();
  }
})();
