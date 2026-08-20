/* ============ Get Involved, two paths ============
   Panel A: students  → track matcher + analyst application
   Panel B: businesses → pilot client intake
   Both forms run on the same step engine (wireForm).
   Neither submits anywhere: they compose a mailto. See README.
   ================================================== */
(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CDSG_COLORS;

  const cta = $('#cta-net');
  if (cta) window.CDSG_network(cta, { density: 0.00007, max: 55, linkDist: 110, speed: .16 });

  /* =========================================================
     PATH SWITCHING
     ========================================================= */
  const paths = $$('.path[data-panel]');
  const panels = { students: $('#panel-students'), business: $('#panel-business') };

  function showPanel(key, scroll = false) {
    if (!panels[key]) key = 'students';
    paths.forEach(p => p.classList.toggle('on', p.dataset.panel === key));
    Object.entries(panels).forEach(([k, el]) => el.classList.toggle('on', k === key));
    if (history.replaceState) history.replaceState(null, '', '#' + key);
    if (scroll) {
      const target = $('#' + key);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  paths.forEach(p => p.addEventListener('click', () => showPanel(p.dataset.panel, true)));

  // in-page apply-menu links
  $$('[data-jump]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      $('.apply-menu')?.classList.remove('open');
      showPanel(a.dataset.jump, true);
    });
  });

  // deep link: join.html#business
  const initial = (location.hash || '').replace('#', '');
  showPanel(initial === 'business' ? 'business' : 'students', false);
  if (initial === 'business' || initial === 'students') {
    // let layout settle before scrolling to the panel
    setTimeout(() => {
      const t = $('#' + initial);
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }, 260);
  }
  addEventListener('hashchange', () => {
    const h = (location.hash || '').replace('#', '');
    if (h === 'business' || h === 'students') showPanel(h, true);
  });

  /* =========================================================
     TRACKS + INTERESTS  (students panel)
     Each interest carries a weight vector across the four tracks:
     [Engineering, Analytics, Strategy, Design]
     ========================================================= */
  /* The four teams.

     `key`       is what the site displays.
     `formValue` is sent to the Google Form as a pre-filled answer, so it must
                 match that question's option text character for character.
                 If you rename an option in the Form, rename it here too. */
  const TRACKS = [
    { key: 'Strategy & Client',
      formValue: 'Strategy & Client Team',
      blurb: 'Market research, outreach, and owning the client relationship.',
      detail: 'Conduct market research, network, and run outreach to bring clients on board. Work with the Data team to gather data from the client, shape the strategy, and deliver the recommendation. You are the client’s main point of contact.',
      practice: 'Investment banking, consulting, finance',
      learn: ['Market research', 'Outreach', 'Scoping', 'Financial modeling'] },

    { key: 'Data Engineering & Analysis',
      formValue: 'Data Engineering & Analysis Team',
      blurb: 'Collect, clean, organize, analyze, and turn it into insight.',
      detail: 'Collect, clean, organize and analyze client data, then turn it into something someone can act on. You may work directly with databases.',
      practice: 'Data analytics, data engineering, data science',
      learn: ['R', 'Python', 'SQL', 'Tableau', 'Power BI'] },

    { key: 'Marketing & Recruiting',
      formValue: 'Marketing & Recruiting Team',
      blurb: 'Grow the club on campus, and run everything we put on.',
      detail: 'Advertise the club through social media, outreach and graphic design. Run recruitment for each cohort, and produce the events: industry speaker webinars, info sessions, networking nights and hackathons.',
      practice: 'Marketing, communications, HR',
      learn: ['Social media', 'Graphic design', 'Event production', 'Recruitment'] },

    { key: 'Software Development & Cybersecurity',
      formValue: 'Software Development & Cybersecurity Team',
      blurb: 'Front-end, back-end, and keeping client data safe.',
      detail: 'Build front-end and back-end tools for clients as needed. Design the infrastructure behind our recruitment and client applications, and do the security work that keeps client data protected.',
      practice: 'Software engineering, tech, cybersecurity',
      learn: ['HTML / CSS / JS', 'Java', 'C++', 'Git'] }
  ];

  // Weight vectors line up with TRACKS above:
  // [Strategy & Client, Data Eng & Analytics, Marketing, Software Engineering]
  const INTERESTS = [
    ['Cold-emailing a local business owner',          [3, 0, 1, 0]],
    ['Untangling a messy spreadsheet',                [0, 3, 0, 1]],
    ['Finding out why a number moved',                [1, 3, 0, 0]],
    ['Running the booth at the activities fair',      [0, 0, 3, 0]],
    ['Writing code that runs on a schedule',          [0, 1, 0, 3]],
    ['Being in the room when a client decides',       [3, 0, 1, 0]],
    ['Sizing a market from scratch',                  [3, 1, 1, 0]],
    ['Shipping a website people actually use',        [0, 0, 0, 3]],
    ['Building a forecast',                           [0, 3, 0, 1]],
    ['Planning a networking night',                   [1, 0, 3, 0]],
    ['Explaining a chart to someone who hates charts',[3, 1, 2, 0]],
    ['Designing an interface someone gets in seconds',[0, 0, 1, 3]]
  ];

  const chosen = new Set();
  let bestTrack = null, pickedTrack = null;

  const igrid = $('#interests');
  if (igrid) {
    igrid.innerHTML = INTERESTS.map((it, i) =>
      `<button type="button" class="interest" data-i="${i}">${it[0]}</button>`).join('');
    igrid.addEventListener('click', e => {
      const b = e.target.closest('.interest'); if (!b) return;
      const i = +b.dataset.i;
      chosen.has(i) ? chosen.delete(i) : chosen.add(i);
      b.classList.toggle('on', chosen.has(i));
      score();
    });
  }

  const meters = $('#meters');
  if (meters) {
    meters.innerHTML = TRACKS.map(t => `
      <div class="match-row">
        <div class="mh"><span>${t.key}</span><b>0%</b></div>
        <div class="meter"><i></i></div>
      </div>`).join('');
  }

  function score() {
    const totals = [0, 0, 0, 0];
    chosen.forEach(i => INTERESTS[i][1].forEach((w, k) => totals[k] += w));
    const sum = totals.reduce((a, b) => a + b, 0) || 1;
    const pct = totals.map(v => Math.round((v / sum) * 100));
    bestTrack = chosen.size ? pct.indexOf(Math.max(...pct)) : null;

    $$('.match-row').forEach((row, i) => {
      row.querySelector('i').style.width = (chosen.size ? pct[i] : 0) + '%';
      row.querySelector('b').textContent = (chosen.size ? pct[i] : 0) + '%';
      row.classList.toggle('top', chosen.size > 0 && i === bestTrack);
    });
    const cnt = $('#sel-count');
    if (cnt) cnt.textContent = chosen.size;
    const tot = $('#sel-total');
    if (tot) tot.textContent = INTERESTS.length;

    const sum2 = $('#match-summary');
    if (sum2) {
      // stay silent until there's enough signal to say something
      if (chosen.size < 3) {
        sum2.innerHTML = '';
      } else {
        sum2.innerHTML = `<div class="card" style="padding:18px 20px">
          <div class="mono" style="font-size:10px;letter-spacing:.18em;color:var(--mint)">STRONGEST MATCH</div>
          <h3 style="font-size:1.24rem;margin:8px 0 6px">${TRACKS[bestTrack].key}</h3>
          <p class="muted" style="font-size:.88rem">${TRACKS[bestTrack].detail}</p>
        </div>`;
      }
    }
    syncTrackPicker();
    highlightTrackCard();
    paintApply();
  }

  const tcards = $('#track-cards');
  if (tcards) {
    tcards.classList.add('four');   // CSS handles the responsive collapse
    tcards.innerHTML = TRACKS.map((t, i) => `
      <div class="cap" data-track="${i}" data-reveal data-delay="${i * .06}">
        <div class="ico"><canvas data-glyph="${['funnel','pipe','broadcast','code'][i]}"></canvas></div>
        <div class="mono" style="font-size:10px;letter-spacing:.18em;color:var(--text-faint)">TEAM 0${i + 1}</div>
        <h3 style="margin-top:10px">${t.key}</h3>
        <p>${t.blurb}</p>
        <div class="chips mt-s">${t.learn.map(l => `<span class="chip">${l}</span>`).join('')}</div>
        <div class="practice">Practice for ${t.practice}</div>
      </div>`).join('');
    if (window.CDSG_glyphs) window.CDSG_glyphs(tcards);

    $$('[data-reveal]', tcards).forEach(el => {
      new IntersectionObserver((en, ob) => {
        if (en[0].isIntersecting) {
          setTimeout(() => el.classList.add('in'), (+el.dataset.delay || 0) * 1000);
          ob.disconnect();
        }
      }, { threshold: .15 }).observe(el);
    });
  }
  function highlightTrackCard() {
    $$('[data-track]').forEach(c => {
      const on = +c.dataset.track === bestTrack;
      c.style.borderColor = on ? 'rgba(58,232,200,.5)' : '';
      c.style.background  = on ? 'rgba(58,232,200,.06)' : '';
    });
  }

  const picker = $('#track-picker');
  if (picker) {
    picker.innerHTML = TRACKS.map((t, i) =>
      `<button type="button" class="interest" data-t="${i}">${t.key}</button>`).join('');
    picker.addEventListener('click', e => {
      const b = e.target.closest('.interest'); if (!b) return;
      pickedTrack = +b.dataset.t;
      $$('.interest', picker).forEach(x => x.classList.toggle('on', x === b));
    });
  }
  function syncTrackPicker() {
    if (!picker || pickedTrack !== null || bestTrack === null) return;
    $$('.interest', picker).forEach((x, i) => x.classList.toggle('on', i === bestTrack));
  }

  /* =========================================================
     SHARED MULTI-STEP FORM ENGINE
     ========================================================= */
  function wireForm(formId, opts) {
    const form = $('#' + formId);
    if (!form) return;
    const shell   = form.closest('.form-shell');
    const head    = $('.steps-head', shell);
    const success = $('.success', shell);
    const steps   = $$('.fstep', form);
    const pips    = $$('.step-pip', head);
    const back    = $('[data-back]', form);
    const next    = $('[data-next]', form);
    let step = 0;

    const show = s => {
      step = s;
      steps.forEach(el => el.classList.toggle('active', +el.dataset.step === s));
      pips.forEach((p, i) => {
        p.classList.toggle('active', i === s);
        p.classList.toggle('done', i < s);
        p.querySelector('i').textContent = i < s ? '✓' : String(i + 1);
      });
      back.style.visibility = s === 0 ? 'hidden' : 'visible';
      next.innerHTML = s === steps.length - 1
        ? `${opts.finalLabel} <span class="arrow">→</span>`
        : 'Continue <span class="arrow">→</span>';
      shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // NB: assigning `var(--danger)` to the borderColor shorthand via CSSOM is
    // dropped by the browser, use literal values here.
    const flag = el => {
      // a file input is visually hidden, mark its drop zone instead
      const zone = el.closest('.dropzone');
      if (zone) {
        zone.classList.add('err');
        el.addEventListener('change', () => zone.classList.remove('err'), { once: true });
        return;
      }
      el.style.setProperty('border-color', '#FF5C7A');
      el.style.setProperty('box-shadow', '0 0 0 3px rgba(255,92,122,.16)');
      el.addEventListener('input', () => {
        el.style.removeProperty('border-color');
        el.style.removeProperty('box-shadow');
      }, { once: true });
    };

    function validate(s) {
      let ok = true, first = null;
      $$('[required]', steps[s]).forEach(el => {
        const val = el.value.trim();
        const bad = !val || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
        if (bad) { flag(el); ok = false; first = first || el; }
      });
      if (first) {
        const target = first.closest('.dropzone') || first;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (target === first) first.focus();
      }
      return ok;
    }

    next.addEventListener('click', () => {
      if (!validate(step)) return;
      if (step < steps.length - 1) { show(step + 1); return; }
      finish();
    });
    back.addEventListener('click', () => show(step - 1));

    // live character counters
    $$('[data-count-for]', shell).forEach(span => {
      const field = $('#' + span.dataset.countFor);
      field?.addEventListener('input', () => { span.textContent = field.value.length; });
    });

    /* ---- file drop zones ----
       A mailto can't carry attachments, so these capture the filenames and the
       success screen tells the applicant to attach the files to the email. */
    $$('.dropzone', shell).forEach(zone => {
      const input = $('input[type=file]', zone);
      const nameEl = $('.dz-name', zone);
      if (!input) return;
      const paint = () => {
        const file = input.files && input.files[0];
        nameEl.textContent = file ? file.name : '';
        zone.classList.toggle('has', !!file);
        if (file) zone.classList.remove('err');
      };
      input.addEventListener('change', paint);
      ['dragenter', 'dragover'].forEach(ev =>
        zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('over'); }));
      ['dragleave', 'dragend'].forEach(ev =>
        zone.addEventListener(ev, () => zone.classList.remove('over')));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('over');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        paint();
      });
    });

    function finish() {
      const data = Object.fromEntries(new FormData(form).entries());
      const lines = opts.body(data, form);

      $('[data-dump]', success).textContent = lines;
      $('[data-mailto]', success).href =
        'mailto:cdsg.columbia@gmail.com' +
        '?subject=' + encodeURIComponent(opts.subject(data)) +
        '&body=' + encodeURIComponent(lines);

      form.style.display = 'none';
      head.style.display = 'none';
      success.classList.add('show');
      shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      burst(shell);
    }

    $('[data-restart]', success).addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      head.style.display = '';
      success.classList.remove('show');
      $$('[data-count-for]', shell).forEach(s => (s.textContent = '0'));
      show(0);
    });
  }

  /* Celebratory data burst */
  function burst(shell) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5';
    shell.appendChild(cv);
    const ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = shell.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    const cols = [C.blue, C.mint, C.violet, C.amber];
    const ps = Array.from({ length: 90 }, () => ({
      x: r.width / 2, y: r.height / 2,
      vx: (Math.random() - .5) * 11, vy: (Math.random() - .5) * 11 - 3,
      c: cols[(Math.random() * cols.length) | 0],
      s: 1.6 + Math.random() * 2.6, life: 1
    }));
    let f = 0;
    (function anim() {
      f++;
      ctx.clearRect(0, 0, r.width, r.height);
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .17; p.vx *= .99; p.life -= .0115;
        if (p.life <= 0) return;
        ctx.fillStyle = `rgba(${p.c},${Math.max(0, p.life)})`;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      if (f < 130) requestAnimationFrame(anim); else cv.remove();
    })();
  }

  /* =========================================================
     STUDENT APPLICATION -> GOOGLE FORM

     Paste the form's share link into `url`. To have the matcher's suggested
     team arrive pre-selected, open the form, pick "Get pre-filled link",
     choose any team, copy the generated URL, and read the `entry.NNNN`
     number out of it into `teamEntry`.

     The value sent is each track's `formValue`, which must match the Form
     option text exactly.

     Leave `url` empty and the button falls back to email, so the page is
     never broken while the form is still being built.
     ========================================================= */
  const APPLICATION = {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScz4wf3hdG0lP15b31Hs4LRRSD6aywFxheRJivpQ4uXFB2VlA/viewform',
    teamEntry: ''       // e.g. 'entry.1234567890'
  };

  const applyLink = $('#apply-link');
  const applyNote = $('#apply-note');
  const applyMatch = $('#apply-match');

  function suggestedTeam() {
    const i = pickedTrack !== null ? pickedTrack : bestTrack;
    if (i === null) return null;
    return TRACKS[i];
  }

  function paintApply() {
    if (!applyLink) return;
    const team = suggestedTeam();

    if (applyMatch) {
      applyMatch.textContent = team ? 'SUGGESTED TEAM \u00b7 ' + team.key.toUpperCase() : '';
    }

    if (!APPLICATION.url) {                       // form not built yet
      applyLink.href = 'mailto:cdsg.columbia@gmail.com?subject=' +
        encodeURIComponent('Analyst application, CDSG');
      applyLink.removeAttribute('target');
      applyLink.innerHTML = 'Email us to apply <span class="arrow">\u2192</span>';
      if (applyNote) applyNote.textContent =
        'The application form opens with recruitment. Email us and we will send it to you directly.';
      return;
    }

    let href = APPLICATION.url;
    if (team && APPLICATION.teamEntry) {
      href += (href.includes('?') ? '&' : '?') + 'usp=pp_url&' +
              APPLICATION.teamEntry + '=' + encodeURIComponent(team.formValue || team.key);
    }
    applyLink.href = href;
    applyLink.target = '_blank';
    applyLink.rel = 'noopener';
    applyLink.innerHTML = 'Open the application <span class="arrow">\u2192</span>';
  }

  /* ---------------- Business intake ---------------- */
  wireForm('business-form', {
    finalLabel: 'Review my brief',
    subject: d => `CDSG pilot client, ${d.organization || 'New enquiry'}`,
    body: (d) => [
      `PILOT CLIENT ENQUIRY`,
      ``,
      `Organization: ${d.organization || ''}`,
      `Contact:      ${d.name || ''}${d.role ? ' (' + d.role + ')' : ''}`,
      `Email:        ${d.email || ''}`,
      `Sector:       ${d.sector || ''}`,
      `Borough:      ${d.borough || ''}`,
      `Size:         ${d.size || ''}`,
      `Nonprofit:    ${d.nonprofit || ''}`,
      ``,
      `, Data ,`,
      `Systems:      ${d.systems || ','}`,
      `History:      ${d.history || ''}`,
      `Can share:    ${d.sharing || ''}`,
      `Prior work:   ${d.tried || ','}`,
      ``,
      `, The decision I'm trying to make ,`,
      d.question || '',
      ``,
      `, What it's costing right now ,`,
      d.cost || ',',
      ``,
      `Preferred start: ${d.timing || ''}`
    ].join('\n')
  });

  score();

  /* ---------------- Recruitment stepper ---------------- */
  const rec = $('#rec-steps');
  if (rec) {
    const steps = $$('.tl', rec);
    const fill = document.createElement('div');
    fill.className = 'tl-fill';
    rec.appendChild(fill);
    let auto = null, k = 0;
    const show = i => {
      steps.forEach((st, j) => st.classList.toggle('done', j <= i));
      fill.style.width = (i / (steps.length - 1)) * 88 + '%';
    };
    steps.forEach((st, i) => st.addEventListener('click', () => {
      if (auto) clearInterval(auto);
      auto = -1;
      show(i);
    }));
    new IntersectionObserver(en => {
      if (en[0].isIntersecting && auto === null) {
        show(0);
        auto = setInterval(() => { k = (k + 1) % steps.length; show(k); }, 1500);
      }
    }, { threshold: .4 }).observe(rec);
  }
})();
