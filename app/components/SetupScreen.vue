<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TimerMode, TimerConfig } from '~/composables/useWodTimer'
import { useBoard } from '~/composables/useBoard'

const emit = defineEmits<{ start: [config: TimerConfig] }>()

const { movements, addMovement, removeMovement } = useBoard()
const selectedMode = ref<TimerMode>('forTime')
const capMin = ref<number | null>(null)
const newMovement = ref('')

// EMOM config
const EMOM_PRESETS = [1, 2, 3]
const emomPresetMin = ref(1)
const emomCustomMin = ref<number | null>(null)
const emomRounds = ref(8)
const emomIntervalSec = computed(() =>
  emomCustomMin.value ? emomCustomMin.value * 60 : emomPresetMin.value * 60
)

function selectEmomPreset(min: number) {
  emomPresetMin.value = min
  emomCustomMin.value = null
}

const modes: { mode: TimerMode; label: string }[] = [
  { mode: 'forTime', label: 'For Time' },
  { mode: 'amrap', label: 'AMRAP' },
  { mode: 'emom', label: 'EMOM' },
  { mode: 'tabata', label: 'Tabata' },
]

function handleAddMovement() {
  if (newMovement.value.trim()) {
    addMovement(newMovement.value)
    newMovement.value = ''
  }
}

function handleStart() {
  const cfg: TimerConfig = {
    mode: selectedMode.value,
    capMin: selectedMode.value === 'forTime' ? capMin.value : undefined,
    intervalSec: selectedMode.value === 'emom' ? emomIntervalSec.value : undefined,
    rounds: selectedMode.value === 'emom' ? emomRounds.value : undefined,
    movements: [...movements.value],
  }
  emit('start', cfg)
}
</script>

<template>
  <div class="setup">
    <header class="setup__header">
      <span class="setup__brand">WOD<em>Brodie</em></span>
    </header>

    <section class="setup__modes">
      <div class="mode-grid">
        <ModeCard
          v-for="m in modes"
          :key="m.mode"
          :mode="m.mode"
          :label="m.label"
          :active="selectedMode === m.mode"
          @select="selectedMode = $event"
        />
      </div>
    </section>

    <section v-if="selectedMode === 'forTime'" class="setup__config">
      <label class="config-label">
        Time Cap (min) — optional
        <input
          v-model.number="capMin"
          type="number"
          min="1"
          max="60"
          placeholder="none"
          class="config-input"
        />
      </label>
    </section>

    <section v-if="selectedMode === 'emom'" class="setup__config">
      <div class="config-label">Every</div>
      <div class="emom-interval-row">
        <button
          v-for="p in EMOM_PRESETS"
          :key="p"
          class="interval-pill"
          :class="{ 'interval-pill--active': emomCustomMin === null && emomPresetMin === p }"
          @click="selectEmomPreset(p)"
        >{{ p }} min</button>
        <input
          v-model.number="emomCustomMin"
          type="number"
          min="1"
          max="60"
          placeholder="Custom"
          class="config-input emom-custom"
          @focus="emomPresetMin = 0"
        />
      </div>

      <div class="config-label rounds-label">Rounds</div>
      <div class="stepper">
        <button class="stepper-btn" @click="emomRounds = Math.max(1, emomRounds - 1)">−</button>
        <span class="stepper-value">{{ emomRounds }}</span>
        <button class="stepper-btn" @click="emomRounds = Math.min(60, emomRounds + 1)">+</button>
      </div>
    </section>

    <section class="setup__board">
      <h2 class="board-title">The Board</h2>
      <ul class="board-list">
        <li v-for="(mv, i) in movements" :key="i" class="board-item">
          <span class="board-station">{{ i + 1 }}</span>
          <span class="board-text">{{ mv }}</span>
          <button class="board-remove" @click="removeMovement(i)" aria-label="Remove">×</button>
        </li>
      </ul>
      <form class="board-add" @submit.prevent="handleAddMovement">
        <input
          v-model="newMovement"
          type="text"
          placeholder="+ Add movement (e.g. 10 Burpees)"
          class="board-input"
        />
        <button type="submit" class="board-add-btn" aria-label="Add">+</button>
      </form>
    </section>

    <button class="start-btn" @click="handleStart">
      Start · 10s countdown
    </button>
  </div>
</template>

<style scoped>
.setup {
  max-width: 560px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-4) calc(var(--sp-8) + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.setup__brand {
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-chalk);
}
.setup__brand em {
  color: var(--color-orange);
  font-style: normal;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.config-label {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  font-size: 0.85rem;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.config-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-chalk);
  font-family: var(--font-body);
  font-size: 1rem;
  padding: var(--sp-3) var(--sp-4);
  width: 100%;
}

.emom-interval-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  flex-wrap: wrap;
}

.interval-pill {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  padding: var(--sp-2) var(--sp-4);
  min-height: 44px;
  min-width: 72px;
  transition: border-color 0.15s, color 0.15s;
}
.interval-pill--active {
  border-color: var(--color-orange);
  color: var(--color-chalk);
}

.emom-custom {
  flex: 1;
  min-width: 90px;
  max-width: 120px;
}

.rounds-label {
  margin-top: var(--sp-4);
}

.stepper {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-2);
}
.stepper-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-chalk);
  font-size: 1.4rem;
  line-height: 1;
  min-width: 48px;
  min-height: 48px;
}
.stepper-value {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  color: var(--color-chalk);
  min-width: 40px;
  text-align: center;
}

.board-title {
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: var(--sp-3);
}
.board-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.board-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-3) var(--sp-4);
}
.board-station {
  background: var(--color-orange);
  border-radius: var(--radius-sm);
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.75rem;
  min-width: 24px;
  padding: 2px 6px;
  text-align: center;
}
.board-text {
  flex: 1;
  font-size: 0.95rem;
}
.board-remove {
  background: none;
  border: none;
  color: var(--color-secondary);
  font-size: 1.2rem;
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
  padding: 0;
}
.board-add {
  display: flex;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
}
.board-input {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-chalk);
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: var(--sp-3) var(--sp-4);
  min-height: 48px;
}
.board-input::placeholder {
  color: var(--color-secondary);
}
.board-add-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-chalk);
  font-size: 1.4rem;
  min-width: 48px;
  min-height: 48px;
}

.start-btn {
  background: var(--color-orange);
  border: none;
  border-radius: var(--radius-pill);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  padding: var(--sp-4) var(--sp-8);
  text-transform: uppercase;
  width: 100%;
  min-height: 56px;
  margin-top: var(--sp-4);
}
</style>
