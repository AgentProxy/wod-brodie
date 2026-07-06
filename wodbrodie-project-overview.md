# WODBrodie — Project Overview

> **Status:** Design finalized (direction 1a) / Ready for build
> **Last updated:** July 2026

---

## 1. Problem & Core Idea

CrossFit-style training runs on timed formats — EMOMs, AMRAPs, Tabatas, "for time" workouts. Generic phone timers can't handle intervals or rounds, and most dedicated interval apps are cluttered, ad-heavy, and forget the one thing every gym has: the whiteboard where the workout is written.

**WODBrodie** is a workout timer PWA with a built-in "board." Pick a format, jot your movements, prop the phone against a plate, and go. Giant glanceable digits, bumper-plate phase colors, and audio cues do the communicating — because mid-workout, nobody reads UI.

It's the second app in the **Brodie suite** (sibling to CashBrodie): a free portfolio piece and a daily-use tool for the owner's own training.

It's designed as a **PWA** so it installs on the phone without an app store and works fully offline — no backend, no accounts, everything local.

**Tagline candidate:** _"A gym whiteboard and a competition clock in your pocket."_

---

## 2. Target Users

| Segment                | Need                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| **Garage-gym athletes** | A clock readable from 2–4 m away, in variable lighting, hands-free.    |
| **CrossFit-style trainees** | Real WOD formats (EMOM/E2MOM, AMRAP, Tabata, For Time), not a stopwatch. |
| **The owner**          | Personal daily driver; second showcase app for the Brodie portfolio.    |

The unifying thread: **zero interaction once the timer starts.** Size, color, and sound carry all information.

**Context of use (drives every design decision):** phone propped on a bench or box, 2–4 meters away; sweaty hands, elevated heart rate; garage lighting. Landscape orientation is common.

---

## 3. Features

### A. Timer Presets (v1 — all four confirmed)

| Mode         | Behavior                                                                  | Key display need                                        |
| ------------ | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| **For Time** | Counts up from 0. Optional time cap. Manual "Finish" button.              | Count-up digits, subtle "time to cap" secondary readout  |
| **AMRAP**    | Counts down from a set duration (e.g., 12 min).                           | Countdown digits                                          |
| **EMOM**     | Repeating intervals. Preset pills (1 / 2 / 3 min) **plus custom "every X min" input**. Set rounds. E2MOM = interval of 2. | Interval countdown + round counter (RD 3/8)              |
| **Tabata**   | Alternating work/rest (default 20s/10s × 8), all three values adjustable. | WORK/REST phase readable instantly; round counter        |

### B. The Board (signature feature)

A temporary workout list, styled like a gym whiteboard.

- Before starting, the user adds free-text movements (e.g., "10 Burpees", "15 KB Swings"), each labeled as a station.
- **EMOM auto-rotation:** the current movement is highlighted with a **NOW** tag each round, cycling through the list — two movements in an E2MOM alternate automatically.
- In other modes, the board is a passive reference list on the timer screen.
- **Last workout auto-restores** on return (localStorage). No saved-board library in v1 — just the most recent, pre-filled and editable.

### C. Timer Engine Behaviors

- **Fixed 10-second pre-start countdown** — beeps at 3-2-1, long "GO" tone. Its own visual state.
- **Audio cues (beeps only, no vibration):** short beeps in the last 3 s of every interval, long buzzer at transitions and finish. Generated with Web Audio oscillators — no sound assets, zero latency.
- Pause / Resume at any point. **Pause = full-screen overlay** with a large Resume as the primary action.
- **Screen wake lock** — display stays on for the whole workout.
- "DONE" end state with a single clear path to start a new workout.
- Timestamp-based engine: all display values (round, phase, remaining) are **derived from elapsed time**, never accumulated — drift-free and survives backgrounding.

### D. v2 Candidates (out of scope, leave room)

Custom mixed-interval builder · saved preset library · workout history/log · voice announcements · vibration toggle.

---

## 4. Data & State

> No backend, no database. All state is in-memory during a session; the only persisted data is the last board, in `localStorage`.

### Timer configuration (in-memory)

```ts
interface TimerConfig {
  mode: "forTime" | "amrap" | "emom" | "tabata";
  totalMin?: number;      // AMRAP duration
  capMin?: number | null; // For Time cap; null = no cap
  intervalSec?: number;   // EMOM: 60 | 120 | 180 | custom (any X min)
  workSec?: number;       // Tabata
  restSec?: number;       // Tabata
  rounds?: number;        // EMOM / Tabata
  movements: string[];    // the Board
}
```

### Engine state machine

```
idle → countdown(10s) → running(work ⇄ rest) → finished
                 ↑ paused ⇄ running (pausedTotal accumulates)
```

- Source of truth: `startTimestamp` (`performance.now()`) + `pausedTotal`.
- Every tick computes `elapsed = now − startTimestamp − pausedTotal`; round, phase, and remaining time are pure functions of `elapsed` and the config (e.g., `round = floor(elapsed / intervalSec) + 1`).
- Audio cues fire once per marker via a fired-set keyed on `{round, phase, second}` — no double beeps after pause/resume.

### `localStorage` keys

```ts
"wodbrodie:lastBoard"  // string[] — movements from the most recent session
"wodbrodie:lastConfig" // TimerConfig minus movements — restores last-used mode/settings
```

---

## 5. Tech Stack (Finalized — frontend only, no backend)

| Layer          | Choice                                        | Reasoning                                                                                  |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Framework**  | Nuxt 4 + TypeScript                           | Matches CashBrodie — one mental model across the Brodie suite.                             |
| **Rendering**  | SPA / static (`ssr: false` or full static gen) | No auth, no dynamic data; SSR adds nothing for a timer.                                    |
| **Styling**    | Custom CSS (design tokens as CSS variables)   | Matches the prototype; the visual identity is bespoke — a component library would fight it. |
| **State**      | Vue composables (`useWodTimer`, `useBoard`)   | App is small; Pinia is unnecessary overhead.                                               |
| **Audio**      | Web Audio API (oscillators)                   | No assets, zero latency. iOS requires unlock on first user tap — the Start button handles it. |
| **Wake lock**  | Screen Wake Lock API                          | Best-effort; re-request on visibility change.                                              |
| **Fonts**      | Anton · Space Grotesk · Chivo Mono (Google Fonts) | Display / body / tabular timer digits.                                                  |
| **PWA**        | `@vite-pwa/nuxt`                              | Manifest + service worker; installable, offline-first.                                     |
| **Hosting**    | Vercel or Firebase Hosting                    | Static deploy either way; whichever is more convenient at ship time.                       |

---

## 6. UI / UX

### Aesthetic — "Rubber Floor & Bumper Plates" (finalized per design file, direction 1a)

The app should feel like it belongs in a gym, not a wellness app. **Dark-only** (no light theme in v1).

- **Black / orange / white system:** floor-black background, chalk-white type, **brand orange for all actions and Board highlights**.
- **Plate colors (green/blue/yellow/red) are reserved strictly for phase meaning** — work, rest, countdown, done. They never appear on buttons or navigation. This separation is a hard rule.
- Phase color appears as a soft radial glow behind the timer digits and in the phase label — not a full background flood.
- Anton for loud display moments, Space Grotesk for UI, Chivo Mono (light, tabular) for digits.

### Color System

Two layers: **brand orange** (actions + Board highlights) and **semantic phase colors** (always mean the same thing, never used for UI chrome). The active phase color is a single CSS variable (`--phase`) driving the phase label, round chip, and the glow behind the digits. Phase changes must be perceivable in peripheral vision.

| Token           | Hex       | Role                                        |
| --------------- | --------- | -------------------------------------------- |
| Floor black     | `#111315` | App background (rubber gym flooring)         |
| Chalk white     | `#F2F0EB` | Primary text, timer digits                   |
| **Brand orange** | _extract exact hex from design source file_ | **All actions (Start, Resume, New Workout, steppers/pills active state) + Board NOW highlight + brand mark** |
| Plate green     | `#2BB673` | Work phase only                              |
| Plate blue      | `#3B79E6` | Rest phase only (Tabata)                     |
| Plate yellow    | `#F2B21B` | Pre-start countdown only                     |
| Plate red       | `#E24545` | Finished ("DONE") state only                 |
| Steel surfaces  | `#191C1F` surfaces · `#2C3136` borders · `#8B9199` secondary text | Supporting UI |

> **Hard rule:** phase colors never appear on interactive elements; brand orange never indicates phase. If a color is tappable, it's orange; if it's informational about time, it's a plate color.

> **Implementation note:** define these as CSS variables on `:root`; the timer screen sets `--phase` per state and every phase-aware element consumes it. Theme logic stays a one-variable swap.

### Type

- **Display:** Anton — condensed gym-poster energy. Used sparingly (brand, mode names, Start).
- **Body/UI:** Space Grotesk.
- **Timer digits:** Chivo Mono, light weight, `font-variant-numeric: tabular-nums`, sized ~26vw — fills the screen, readable at 3 m+.

### Screens & Flow

```
Setup → (Start) → 10s Countdown → Running → Done → back to Setup
```

**Setup screen:** brand header · 4 mode cards in a 2×2 grid (one active, orange-outlined) · contextual config for the selected mode only (interval pills + custom "every X min" stepper, rounds stepper) · **"The Board"** as a stacked vertical whiteboard list with station badges and per-item remove, plus an "+ Add movement" row (last board pre-filled) · full-width orange Start button ("Start · 10s countdown").

**Board layout — direction 1a "Stacked Board" (chosen):** the Board is a vertical whiteboard list **docked under the timer**, reading like a real gym whiteboard. In **landscape**, the layout splits — timer digits left, Board as a side column right.

**Timer screen — four visual states:**

1. **Countdown:** giant single digit with plate-yellow glow, "GET READY" label, mode + round context beneath.
2. **Running:** giant digits with phase-colored glow, phase label (WORK/REST), round chip (interval modes), stacked Board below with the current station highlighted in **brand orange + NOW tag** (EMOM), pill Pause control at the bottom.
3. **Paused:** full-screen overlay — "PAUSED" headline, "tap resume to continue the clock" hint, large orange **Resume** pill, secondary "Exit workout" text link.
4. **Done:** "DONE" in plate red with glow, **total time readout** beneath (e.g., "TOTAL TIME 18:42"), full-width orange "New Workout" action.

Top bar: Exit · mode name · round chip.

### Responsive & Interaction Rules

- Mobile-first single column, max content width ~560px portrait.
- **Landscape timer layout is a v1 requirement** — phone propped sideways is common.
- Tap targets ≥ 48px; zero required interaction while running.
- Start must always be a real user tap (unlocks iOS audio) — never auto-triggered.
- Purposeful state-transition motion only; respect `prefers-reduced-motion`.

### Resolved by design (was open)

- **Tabata phase color:** soft radial glow behind the digits per phase — not a full background flood.
- **Board station labels:** small station badges per the design file (see design source for exact treatment).
- Note for For Time / AMRAP: the design file shows Tabata and EMOM running states; For Time ("Finish" button + to-cap readout) and AMRAP follow the same running-state layout.

---

## 7. Decisions Made

| Question                        | Decision                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **Board layout**                | **Direction 1a "Stacked Board"** — vertical whiteboard docked under the timer; side column in landscape. |
| **Color roles**                 | **Brand orange = actions + Board highlights. Plate colors = phase meaning only.** Never mixed. |
| **Name**                        | WODBrodie — second app in the Brodie suite.                                    |
| **Purpose**                     | Free portfolio piece + personal daily use. No monetization.                    |
| **Backend / accounts**          | **None.** Fully local; only persistence is last board + config in localStorage. |
| **Mode lineup**                 | All four: For Time, AMRAP, EMOM, Tabata.                                       |
| **EMOM intervals**              | Preset pills (1/2/3 min) **plus** custom "every X min" input.                  |
| **EMOM board rotation**         | Auto-rotate with NOW tag each round.                                           |
| **Pre-start countdown**         | Fixed 10 s (not configurable).                                                 |
| **Cues**                        | Beeps only — no vibration in v1.                                               |
| **Visual identity**             | Gym concept ("rubber floor & bumper plates"), distinct from CashBrodie's Bento aesthetic. |
| **Theme**                       | Dark-only.                                                                     |
| **Landscape**                   | v1 requirement for the timer screen.                                           |
| **Pause treatment**             | Full-screen overlay.                                                           |
| **Framework / styling / state** | Nuxt 4 + TS · custom CSS with token variables · composables only (no Pinia).   |

---

## 8. Suggested Roadmap

| Phase                    | Scope                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **v0.1 — Engine**        | `useWodTimer` composable (timestamp-based state machine) + For Time mode + basic timer screen. Manual testing of drift/pause. |
| **v0.2 — All modes**     | AMRAP, EMOM (pills + custom interval), Tabata. The Board with EMOM auto-rotation and localStorage restore.                    |
| **v0.3 — Gym-proofing**  | Web Audio cues, wake lock, 10 s countdown state, pause overlay, landscape layout, Done state.                                 |
| **v1.0 — Ship**          | Design pass applied, PWA manifest + service worker (`@vite-pwa/nuxt`), app icon/splash, deploy to Vercel or Firebase Hosting. |
| **v2.0 — Nice-to-haves** | Mixed-interval builder, saved presets, workout history, voice announcements, vibration toggle.                                |
