<script setup lang="ts">
import { computed } from 'vue'
import type { TimerConfig } from '~/composables/useWodTimer'

const props = defineProps<{
  phase: string
  displayTime: string
  countdownSec: number
  currentRound: number
  totalRounds: number
  toCapSec: number | null
  activeMovementIndex: number
  config: TimerConfig
}>()

const emit = defineEmits<{
  pause: []
  resume: []
  finish: []
  newWorkout: []
}>()

const phaseColor = computed(() => {
  switch (props.phase) {
    case 'countdown': return 'var(--color-countdown)'
    case 'work': return 'var(--color-work)'
    case 'rest': return 'var(--color-rest)'
    case 'done': return 'var(--color-done)'
    default: return 'var(--color-work)'
  }
})

const phaseLabel = computed(() => {
  switch (props.phase) {
    case 'countdown': return 'GET READY'
    case 'work': return props.config.mode === 'tabata' ? 'WORK' : ''
    case 'rest': return 'REST'
    case 'done': return 'DONE'
    default: return ''
  }
})

const showRoundChip = computed(() =>
  props.config.mode === 'emom' && (props.phase === 'work' || props.phase === 'rest')
)

const toCapDisplay = computed(() => {
  if (props.toCapSec === null) return null
  const s = Math.floor(props.toCapSec)
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss} to cap`
})
</script>

<template>
  <div class="timer" :style="{ '--phase': phaseColor }">
    <!-- Countdown state -->
    <template v-if="phase === 'countdown'">
      <div class="timer__glow" />
      <div class="timer__countdown-digit">{{ countdownSec }}</div>
      <div class="timer__phase-label">GET READY</div>
    </template>

    <!-- Running / work / rest -->
    <template v-else-if="phase === 'work' || phase === 'rest'">
      <div class="timer__glow" />
      <div v-if="showRoundChip" class="timer__round-chip">RD {{ currentRound }}/{{ totalRounds }}</div>
      <div v-if="phaseLabel" class="timer__phase-label">{{ phaseLabel }}</div>
      <div class="timer__digits">{{ displayTime }}</div>
      <div v-if="toCapDisplay" class="timer__secondary">{{ toCapDisplay }}</div>

      <!-- The Board (passive reference) -->
      <ul v-if="config.movements.length" class="timer__board">
        <li
          v-for="(mv, i) in config.movements"
          :key="i"
          class="timer__board-item"
          :class="{ 'timer__board-item--active': i === activeMovementIndex && config.mode === 'emom' }"
        >
          <span class="board-station">{{ i + 1 }}</span>
          <span>{{ mv }}</span>
          <span v-if="i === activeMovementIndex && config.mode === 'emom'" class="now-tag">NOW</span>
        </li>
      </ul>

      <!-- For Time: Finish button -->
      <button v-if="config.mode === 'forTime'" class="finish-btn" @click="emit('finish')">
        Finish
      </button>

      <button class="pause-btn" @click="emit('pause')">Pause</button>
    </template>

    <!-- Paused overlay -->
    <template v-else-if="phase === 'paused'">
      <div class="timer__pause-overlay">
        <div class="pause__headline">PAUSED</div>
        <div class="pause__hint">tap resume to continue the clock</div>
        <button class="resume-btn" @click="emit('resume')">Resume</button>
        <button class="exit-btn" @click="emit('newWorkout')">Exit workout</button>
      </div>
    </template>

    <!-- Done state -->
    <template v-else-if="phase === 'done'">
      <div class="timer__glow" />
      <div class="timer__done-label">DONE</div>
      <div class="timer__total-time">TOTAL TIME {{ displayTime }}</div>
      <button class="new-workout-btn" @click="emit('newWorkout')">New Workout</button>
    </template>
  </div>
</template>

<style scoped>
.timer {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-8) var(--sp-4);
  overflow: hidden;
  background: var(--color-floor);
}

.timer__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 40% at 50% 40%, color-mix(in srgb, var(--phase) 18%, transparent), transparent 70%);
  pointer-events: none;
  transition: background 0.4s;
}

.timer__countdown-digit {
  font-family: var(--font-display);
  font-size: min(50vw, 40vh);
  color: var(--color-chalk);
  line-height: 1;
  position: relative;
}

.timer__round-chip {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: var(--color-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: var(--sp-1) var(--sp-3);
  margin-bottom: var(--sp-3);
  position: relative;
}

.timer__phase-label {
  font-family: var(--font-display);
  font-size: 1.2rem;
  letter-spacing: 0.12em;
  color: var(--phase);
  text-transform: uppercase;
  margin-bottom: var(--sp-3);
  position: relative;
}

.now-tag {
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  background: var(--color-orange);
  color: #fff;
  border-radius: var(--radius-pill);
  padding: 2px 7px;
  margin-left: auto;
}

.timer__digits {
  font-family: var(--font-mono);
  font-size: min(26vw, 22vh);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  color: var(--color-chalk);
  line-height: 1;
  position: relative;
}

.timer__secondary {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--color-secondary);
  margin-top: var(--sp-3);
}

.timer__board {
  list-style: none;
  margin-top: var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  width: 100%;
  max-width: 400px;
}
.timer__board-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-secondary);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  transition: color 0.2s;
}
.timer__board-item--active {
  color: var(--color-orange);
  font-weight: 600;
}

.board-station {
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.7rem;
  min-width: 22px;
  padding: 2px 5px;
  text-align: center;
  color: var(--color-secondary);
}

.finish-btn {
  margin-top: var(--sp-4);
  background: transparent;
  border: 2px solid var(--color-orange);
  border-radius: var(--radius-pill);
  color: var(--color-orange);
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.06em;
  padding: var(--sp-3) var(--sp-6);
  text-transform: uppercase;
  min-height: 48px;
}

.pause-btn {
  position: fixed;
  bottom: calc(var(--sp-6) + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-chalk);
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.06em;
  padding: var(--sp-3) var(--sp-8);
  text-transform: uppercase;
  min-height: 48px;
  z-index: 10;
}

.timer__pause-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
}
.pause__headline {
  font-family: var(--font-display);
  font-size: 3rem;
  letter-spacing: 0.1em;
  color: var(--color-chalk);
}
.pause__hint {
  color: var(--color-secondary);
  font-size: 0.9rem;
}
.resume-btn {
  background: var(--color-orange);
  border: none;
  border-radius: var(--radius-pill);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  padding: var(--sp-4) var(--sp-8);
  text-transform: uppercase;
  min-height: 56px;
  min-width: 200px;
}
.exit-btn {
  background: none;
  border: none;
  color: var(--color-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  text-decoration: underline;
  min-height: 44px;
}

.timer__done-label {
  font-family: var(--font-display);
  font-size: min(30vw, 24vh);
  color: var(--phase);
  line-height: 1;
  position: relative;
}
.timer__total-time {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  color: var(--color-chalk);
  letter-spacing: 0.08em;
  margin-top: var(--sp-3);
  position: relative;
}
.new-workout-btn {
  margin-top: var(--sp-8);
  background: var(--color-orange);
  border: none;
  border-radius: var(--radius-pill);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  padding: var(--sp-4) var(--sp-8);
  text-transform: uppercase;
  min-height: 56px;
  min-width: 220px;
  position: relative;
}

@media (orientation: landscape) {
  .timer {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: var(--sp-8);
    padding-top: var(--sp-4);
  }
  .timer__digits {
    font-size: min(18vw, 28vh);
  }
  .timer__board {
    margin-top: 0;
    max-width: 280px;
    align-self: center;
  }
}
</style>
