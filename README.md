# Columbia Data & Strategy Group — website

Static site. No build step, no dependencies, no framework. Open `index.html` in a browser
and it works.

```
cdsg-site/
├── index.html          Homepage — minimal, routes into the other four pages
├── about.html          What We Do — the five-stage pipeline
├── team.html           Executive Board — the eight seats and what each owns
├── projects.html       Projects — honest empty state + example briefs
├── join.html           Get Involved — TWO PATHS (students / businesses)
└── assets/
    ├── css/main.css    All styling + the design tokens
    └── js/
        ├── core.js     Shared: nav, apply menu, cursor, reveals, canvas engine
        ├── home.js     Hero field + portal-card mini-visualizations
        ├── about.js    Interactive pipeline canvas + cleaning-table demo
        ├── team.js     ← BOARD SEATS LIVE HERE
        ├── projects.js ← EXAMPLE BRIEFS LIVE HERE
        └── join.js     Path switching + both multi-step forms
```

## Run it locally

```bash
python -m http.server 8787 --directory cdsg-site
```

Then open <http://localhost:8787>.

---

## The honesty rule this site is built on

The club has not launched. Every page is written so that **nothing claims work that
hasn't happened**. Specifically:

- The homepage status board reads `2026 founded / 0 engagements completed / Fall ’26 first cohort / Open`.
- The Projects page opens with "Nothing here yet. That's the honest answer."
- All nine project cards are labelled **Illustrative** and written entirely in the
  conditional ("we'd", "you'd"). They carry no outcome metrics — deliberately, because a
  "−22% waste" figure reads as a result even next to a disclaimer.
- All eight board seats show as **open**, because they are.
- The pipeline animation and the cleaning table are labelled as synthetic demos.
- The numbers on the Join page (6–8 hrs/week, 12 weeks, 4–6 person teams, $0 dues) sit
  under a heading that says *"How it's designed to run"* — they're stated intent, not
  history.

**If you edit copy, keep this rule.** The credibility of a brand-new group comes from
being conspicuously straight about being new. Once you finish a real engagement, replace
the illustrative briefs with case studies and add the metrics back then.

---

## Two application paths

`join.html` has two panels driven by a path chooser at the top:

| Path | Anchor | Form | Goes to |
| --- | --- | --- | --- |
| Students | `join.html#students` | `#student-form` | Track matcher → analyst application |
| Businesses | `join.html#business` | `#business-form` | Pilot client intake |

Both are reachable from:
- the **Apply ▾** dropdown in the nav (hover on desktop, tap on touch),
- the two "doors" on the homepage,
- the mobile menu, which lists them as separate entries,
- direct links — `join.html#business` deep-links straight to the business panel.

Both forms run on the same engine (`wireForm` in `join.js`). Neither submits anywhere:
they compose a `mailto:` with the answers formatted as plain text. To make them really
submit, the least-effort options are Formspree, Netlify Forms, or a Google Form endpoint —
add an `action` to the `<form>` and call `form.submit()` inside `finish()`.

---

## What to edit before publishing

**1. Board seats** — `assets/js/team.js`. Each seat ships as `open: true`. As you fill one:

```js
open:  false,
name:  'Their Real Name',
year:  'CC ’28',
major: 'Statistics',
bio:   'One or two sentences about them.',
```

Leave `role`, `div`, `owns`, `skills` and `radar` alone — those describe the *seat*, not
the person, which is why they're truthful before anyone fills it. The card, drawer,
filters, seat counter, and both radar charts all regenerate automatically.

**2. Example briefs** — `assets/js/projects.js`. Add, remove, or rewrite freely; the
sector filters and counters derive from the array. Keep the conditional voice until the
work is real.

**3. Contact details** — `datastrategy@columbia.edu` appears in the footer of all five
pages and in both form handlers. The LinkedIn / Instagram / GitHub links are `href="#"`.

**4. Dates** — "Fall 2026" and "founding cohort" appear across all pages. The student
recruitment timeline uses relative weeks (Week 1, Week 2, Week 3) with a note saying exact
dates lock in after student-group recognition — swap in real dates once you have them.

**5. Address** — the footer says just "Columbia University, New York, NY 10027". Add a
room or meeting location once you have one.

---

## Deploying

Any static host. Drag `cdsg-site` into Netlify or Vercel, or push to a repo and turn on
GitHub Pages. Nothing to build.

---

## Design notes

Tokens are at the top of `main.css`:

| Token | Current | Used for |
| --- | --- | --- |
| `--neon` | `#38CDFF` | **primary accent** — neon blue. Most UI colour comes from here |
| `--neon-deep` | `#2563FF` | electric blue for glows, shadows, ambient gradients |
| `--columbia` | `#A9D8F2` | the pale school blue, kept as a stop in display gradients |
| `--mint` | `#3AE8C8` | secondary — "good data" / open / highlight state |
| `--violet` | `#A67CFF` | tertiary accent |
| `--amber` | `#FFC46B` | honesty notes, "illustrative" badges, Bronx on the map |
| `--danger` | `#FF5C7A` | dirty records, form errors |
| `--bg` | `#03050c` | page background |

The palette is deliberately **four hues, not one**: neon blue carries the interface, mint
marks anything open or clean, violet adds depth in the ambient field, and amber is the warm
counterweight on the honesty notes and "illustrative" badges. If you push the neon further,
keep amber — it's the only thing stopping the whole page reading as a single colour.

Canvas colours are a **separate** copy of the palette in `core.js` (`CDSG_COLORS`), as RGB
triplet strings because canvas needs `rgba(r,g,b,a)`. Change a hue and you must change it in
both places.

Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (data labels), via Google Fonts.

### Where the interactive pieces live

| Feature | File |
| --- | --- |
| Hero node network (reacts to cursor) | `core.js` → `nodeNetwork()` |
| Apply ▾ dropdown | `core.js` → apply menu block |
| Portal + door card mini-charts | `home.js` → `vizzes` |
| Five-stage pipeline morph | `about.js` → `layout()` per stage |
| Before/after cleaning table | `about.js`, bottom |
| Seat competency radars | `team.js` → `radar()` |
| NYC hex cartogram (all boroughs open) | `projects.js` → `CELLS` + `build()` |
| Brief flow ornament | `projects.js` → `flowViz()` |
| Track matcher scoring | `join.js` → `INTERESTS` weight vectors |
| Path switching + both forms | `join.js` → `showPanel()`, `wireForm()` |

Every canvas animation pauses when it scrolls off screen and when the tab is hidden.
`prefers-reduced-motion` is respected throughout.

### Two implementation notes worth knowing

- **Canvas sizing.** `CDSG_canvas` measures from `getBoundingClientRect`, and the rAF loop
  is paused while a canvas is off-screen — so any layout code must measure directly rather
  than trust a cached width. `about.js` re-runs its layout on the first paint for this reason.
- **CSS variables in the CSSOM.** Assigning `var(--danger)` to the `borderColor` shorthand
  via JS is silently dropped by browsers. Form error styling uses literal hex values.
