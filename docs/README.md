# Site build

This folder is what GitHub Pages serves (Settings → Pages → `main` / `docs`).

- `index.html` — page shell (top bar, sidebar, article, quiz host)
- `styles.css` — theme (dark by default, light toggle), YouTube-red accent
- `app.js` — navigation, search, theme, quiz engine, progress store
- `timer.js` — the **20-minute pace timer** widget (self-contained; looks for
  `#paceTimer` inside the rendered section and builds itself there)
- `content.js` — **generated** by `build.py`; every step pre-rendered to HTML
- `build.py` — reads `../course/*.md` and `../course/quizzes.json`

## Rebuild after editing the lessons

```bash
cd docs && python3 build.py
```

Requires the `markdown` Python package.

## Adding a quiz

Add an entry to `../course/quizzes.json` keyed by the section id
(`step-01` … `step-05`):

```json
{
  "title": "Step 1 — Understand the Job",
  "questions": [
    { "q": "What does the algorithm reward first?", "options": ["Talent", "Consistency"], "answer": 1, "why": "Reliability first." }
  ]
}
```

`answer` is a **0-based** index into `options`. `why` is shown after answering.

## The pace timer

Any section can host the timer by including `<div id="paceTimer"></div>`.
`timer.js` builds a 20-minute countdown across the five steps
(2 / 4 / 6 / 4 / 4 minutes — edit the `STEPS` array in `timer.js` to change).
Clicking a step jumps the timer to that step's start.

## Progress store

Saved in `localStorage` under `jeffrey-yt.progress.v2`:

```js
{ v:2, name, done:{sid:true}, doneAt:{sid:iso}, updated,
  quiz:{ sid:{ answers:{qi:optionIndex}, best, last, total, attempts, sig, lastAt } } }
```

Imported files are validated and normalised, so a wrong file can never wipe progress.

## Audit test

`tests/progress-audit.mjs` drives a real headless Chrome over the DevTools Protocol
using real user paths (button clicks, `DOM.setFileInputFiles`). It checks the
dashboard maths against the raw store, export/import round-tripping, reload
persistence, bad-file rejection, reset behaviour, page responsiveness **and the
pace timer** (builds, counts down, pauses, jumps to a step).

```bash
node tests/progress-audit.mjs                                     # live site
node tests/progress-audit.mjs http://127.0.0.1:8933/index.html    # local server
```

Exits non-zero on any failure. Needs Chrome (`CHROME_BIN` to override).
