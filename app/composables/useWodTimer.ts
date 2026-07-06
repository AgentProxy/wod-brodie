import { ref, computed, readonly } from 'vue'

export type TimerMode = 'forTime' | 'amrap' | 'emom' | 'tabata'
export type TimerPhase = 'idle' | 'countdown' | 'work' | 'rest' | 'paused' | 'done'

export interface TimerConfig {
  mode: TimerMode
  totalMin?: number
  capMin?: number | null
  intervalSec?: number
  workSec?: number
  restSec?: number
  rounds?: number
  movements: string[]
}

const COUNTDOWN_DURATION = 10

function deriveForTime(elapsed: number, config: TimerConfig) {
  const capSec = config.capMin ? config.capMin * 60 : null
  const done = capSec !== null && elapsed >= capSec
  return {
    phase: done ? 'done' as TimerPhase : 'work' as TimerPhase,
    displaySec: done ? capSec! : elapsed,
    round: 1,
    totalRounds: 1,
    toCapSec: capSec ? Math.max(0, capSec - elapsed) : null,
  }
}

export function useWodTimer() {
  const config = ref<TimerConfig>({ mode: 'forTime', movements: [] })
  const phase = ref<TimerPhase>('idle')

  let startTimestamp = 0
  let pausedTotal = 0
  let pauseStart = 0
  let prePausePhase: TimerPhase = 'work'
  let rafId = 0
  const firedCues = new Set<string>()

  // Display state
  const displaySec = ref(0)
  const currentRound = ref(1)
  const totalRounds = ref(1)
  const countdownSec = ref(COUNTDOWN_DURATION)
  const toCapSec = ref<number | null>(null)
  const activeMovementIndex = ref(0)

  function getElapsed() {
    return (performance.now() - startTimestamp - pausedTotal) / 1000
  }

  function tick() {
    const now = performance.now()

    if (phase.value === 'countdown') {
      const elapsed = (now - startTimestamp - pausedTotal) / 1000
      const remaining = Math.ceil(COUNTDOWN_DURATION - elapsed)
      countdownSec.value = Math.max(0, remaining)
      if (elapsed >= COUNTDOWN_DURATION) {
        // Transition to running: reset startTimestamp to mark run start
        startTimestamp = now - pausedTotal
        pausedTotal = 0
        firedCues.clear()
        phase.value = 'work'
      }
    } else if (phase.value === 'work' || phase.value === 'rest') {
      const elapsed = getElapsed()
      const derived = deriveState(elapsed)
      displaySec.value = derived.displaySec
      currentRound.value = derived.round
      totalRounds.value = derived.totalRounds
      toCapSec.value = derived.toCapSec
      activeMovementIndex.value = derived.activeMovementIndex

      if (derived.phase === 'done') {
        phase.value = 'done'
        cancelAnimationFrame(rafId)
        return
      }
      if (derived.phase !== phase.value) {
        phase.value = derived.phase
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function deriveState(elapsed: number) {
    const cfg = config.value
    let result = {
      phase: 'work' as TimerPhase,
      displaySec: elapsed,
      round: 1,
      totalRounds: 1,
      toCapSec: null as number | null,
      activeMovementIndex: 0,
    }

    if (cfg.mode === 'forTime') {
      const d = deriveForTime(elapsed, cfg)
      result = { ...result, ...d }
    } else if (cfg.mode === 'emom') {
      const intervalSec = cfg.intervalSec ?? 60
      const rounds = cfg.rounds ?? 8
      const round = Math.floor(elapsed / intervalSec) + 1
      const withinInterval = elapsed % intervalSec
      const remainingInInterval = intervalSec - withinInterval
      const done = elapsed >= rounds * intervalSec
      result = {
        phase: done ? 'done' : 'work',
        displaySec: done ? 0 : remainingInInterval,
        round: Math.min(round, rounds),
        totalRounds: rounds,
        toCapSec: null,
        activeMovementIndex: (round - 1) % Math.max(cfg.movements.length, 1),
      }
    }

    // amrap, tabata will be added in v0.2
    return result
  }

  function start(cfg: TimerConfig) {
    config.value = cfg
    phase.value = 'countdown'
    startTimestamp = performance.now()
    pausedTotal = 0
    firedCues.clear()
    countdownSec.value = COUNTDOWN_DURATION
    displaySec.value = 0
    currentRound.value = 1
    rafId = requestAnimationFrame(tick)
  }

  function pause() {
    if (phase.value !== 'work' && phase.value !== 'rest' && phase.value !== 'countdown') return
    prePausePhase = phase.value
    pauseStart = performance.now()
    cancelAnimationFrame(rafId)
    phase.value = 'paused'
  }

  function resume() {
    if (phase.value !== 'paused') return
    pausedTotal += performance.now() - pauseStart
    phase.value = prePausePhase
    rafId = requestAnimationFrame(tick)
  }

  function finish() {
    cancelAnimationFrame(rafId)
    phase.value = 'done'
  }

  function reset() {
    cancelAnimationFrame(rafId)
    phase.value = 'idle'
    displaySec.value = 0
    currentRound.value = 1
    countdownSec.value = COUNTDOWN_DURATION
    pausedTotal = 0
  }

  const displayTime = computed(() => {
    const s = Math.floor(displaySec.value)
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  })

  return {
    config: readonly(config),
    phase: readonly(phase),
    displaySec: readonly(displaySec),
    displayTime,
    currentRound: readonly(currentRound),
    totalRounds: readonly(totalRounds),
    countdownSec: readonly(countdownSec),
    toCapSec: readonly(toCapSec),
    activeMovementIndex: readonly(activeMovementIndex),
    start,
    pause,
    resume,
    finish,
    reset,
  }
}
