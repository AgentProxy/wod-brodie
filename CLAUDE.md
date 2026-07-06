# WODBrodie

CrossFit-style WOD timer PWA. Second app in the "Brodie" suite (sibling to CashBrodie). Free portfolio piece + personal daily-use tool.

**Stack:** Nuxt 4 + TypeScript · custom CSS (design tokens as CSS variables) · Vue composables for state (no Pinia) · `@vite-pwa/nuxt` · deploys as static/SPA to Vercel or Firebase Hosting.

**Hard constraints:** No backend. No auth. No accounts. No component libraries. Dark-only. Fully offline. Only persistence is `localStorage` (last board + last config).

## Before doing anything

Read `docs/project-overview.md` — it contains all locked decisions, the feature spec, the data/state model, the design token system, screen-by-screen states, and the roadmap.

Do **not** re-litigate anything in its "Decisions Made" table (§7). If something seems wrong or ambiguous, flag it and ask — don't silently choose differently.

## Key rules

- **Timer engine is timestamp-based.** Source of truth is `startTimestamp` (`performance.now()`) + accumulated `pausedTotal`. Every displayed value — current round, phase, time remaining — is a pure function of `elapsed` and the config. Never accumulate state with `setInterval` ticks. Full spec in overview §4.
- **Color roles are strict.** Brand orange = all interactive elements + Board NOW highlight. Plate colors (green work / blue rest / yellow countdown / red done) = phase meaning only, driven by a single `--phase` CSS variable. Never mix these roles. Token table in overview §6.
- **Audio:** Web Audio oscillators, no sound assets. The `AudioContext` must be created/resumed on the Start button tap (iOS unlock). Start must always be a real user tap — never auto-triggered.
- **Wake lock:** request on timer start, release on exit, re-request on `visibilitychange`.
- **Design reference:** `docs/design/WODBrodie_UI.pdf` is the visual source of truth (direction 1a "Stacked Board"). `docs/design/wod-timer.jsx` is a React reference prototype — port the logic and visual intent, do not copy React patterns into Vue.
- **Landscape timer layout is a v1 requirement:** digits left, Board as side column.
- Respect `prefers-reduced-motion`. Tap targets ≥ 48px.

## Current phase

**v0.1 — Engine.** `useWodTimer` composable (timestamp-based state machine) + For Time mode + basic timer screen.

Roadmap (overview §8): v0.1 engine → v0.2 all modes + Board → v0.3 gym-proofing (audio, wake lock, countdown, pause overlay, landscape) → v1.0 design pass + PWA + deploy.

Don't build ahead of the current phase. Update this section when a phase completes.

## Project structure (intended)

```
app/
├── components/        # SetupScreen, TimerScreen, TheBoard, ModeCard, ...
├── composables/
│   ├── useWodTimer.ts # engine — state machine, derived values, cues
│   ├── useBoard.ts    # movement list + localStorage restore
│   ├── useBeeper.ts   # Web Audio oscillator cues
│   └── useWakeLock.ts
├── assets/css/
│   └── tokens.css     # all design tokens as CSS variables on :root
└── pages/
    └── index.vue      # single-page app: setup ⇄ timer
```

## localStorage keys

```
wodbrodie:lastBoard   — string[] (movements from most recent session)
wodbrodie:lastConfig  — TimerConfig minus movements
```

## Commands

```
npm run dev        # local dev
npm run build      # production build
npm run generate   # static generation (if using SSG deploy)
```

## Conventions

- TypeScript strict. `<script setup lang="ts">` SFCs.
- Composables return plain refs/computeds; components stay thin.
- Commit style: conventional commits (feat:, fix:, chore:, docs:).
- Small, reviewable changes — the owner reads every diff.
