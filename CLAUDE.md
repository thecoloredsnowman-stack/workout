# MyBar — Project Notes

## Live URL
https://thecoloredsnowman-stack.github.io/workout/

## Repo
https://github.com/thecoloredsnowman-stack/workout
- Branch: `main` (GitHub Pages serves from root of main)
- Repo must stay **public** for GitHub Pages to work (free plan)

## What this app is
A 60-day calisthenics tracker PWA (installable on iPhone via Safari → Add to Home Screen).
Full-screen, no browser bars once installed. Warm paper aesthetic.

## File structure (all files in repo root)
| File | Purpose |
|------|---------|
| `index.html` | Entry point — loads all scripts in order |
| `theme.css` | All CSS variables, layout, animations |
| `program.js` | **Workout plan data** — the only file to edit for plan changes |
| `icons.jsx` | SVG icon components → `window.Icon` |
| `home.jsx` | Home/calendar screen → `window.Home` |
| `dayview.jsx` | Day/exercise screen → `window.DayView`, `window.RestDay` |
| `app.jsx` | App root, state, routing → renders `<App />` to `#root` |
| `manifest.webmanifest` | PWA manifest (standalone display) |
| `sw.js` | Service worker (offline + caching) |
| `icon-180.png` | Apple touch icon |
| `icon-192.png` | PWA icon |
| `icon-512.png` | PWA icon large |
| `icon-512-maskable.png` | PWA maskable icon |

## Tech stack
- React 18.3.1 via CDN (unpkg) — no build step, no npm
- JSX transpiled at runtime by Babel standalone (also CDN)
- Plain static files — GitHub Pages serves as-is
- localStorage for persistence (keys: `mybar.ticks.v1`, `mybar.start.v1`)

## How to deploy a new version
1. Drop new files into `C:\Workout` (replace existing)
2. Tell Claude — it will verify + push

## The only file you need to change for workout plan updates
**`program.js`** — exports `window.MYBAR` with this shape:
```js
window.MYBAR = {
  DAYS,             // 60 day objects
  BLOCKS,           // [{n, name, from, to, tagline}]
  TYPE_INFO,        // {P:{name,short,focus}, L:{...}, H:{...}, R:{...}}
  WEEKDAY_INITIALS, // ['M','T','W','T','F','S','S']
  blockOf,          // fn(day) → block object
  totalSets,        // fn(day) → number
  isTimed,          // fn(reps) → bool (true if reps contains "s" e.g. "20s")
  targetSeconds,    // fn(reps) → number
};
```

Each DAYS entry:
```js
{ day, type, typeName, weekday, weekdayIdx, block, blockName,
  sections: [{ name, exercises: [{name, sets, reps, note, gloves?}] }] }
```
- `type`: 'P' Push / 'L' Pull / 'H' Legs / 'R' Rest
- `reps`: string — '12', '8 ea', '20s' (timed holds must end in 's')
- Rest days: `sections: []`

## Current plan (version 3)
- Cycle: Mon P · Tue L · Wed H · Thu P · Fri L · Sat H · Sun R
- Blocks: Foundation (1–12) → Build (13–24) → Strength (25–42) → Peak (43–60)
- Types: P = Push+Legs, L = Pull+Grip+Core, H = Legs+Core, R = Rest

## What to tell design Claude for future versions
> Output ALL files that index.html loads — that means every file listed in the `<script>` tags: `program.js`, `icons.jsx`, `home.jsx`, `dayview.jsx`, AND `app.jsx`. Don't skip any even if unchanged. Static files only, no build step, all paths relative with `./` prefix.

## iPhone install instructions (for user)
1. Open Safari → https://thecoloredsnowman-stack.github.io/workout/
2. Share button → Add to Home Screen
3. If old version shows: delete the icon, clear Safari cache (Settings → Safari → Clear History and Website Data), then re-add
