<script setup lang="ts">
import type { TimerMode } from '~/composables/useWodTimer'

const props = defineProps<{
  mode: TimerMode
  label: string
  active: boolean
}>()

const emit = defineEmits<{ select: [mode: TimerMode] }>()
</script>

<template>
  <button
    class="mode-card"
    :class="{ 'mode-card--active': active }"
    @click="emit('select', mode)"
  >
    <span class="mode-card__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.mode-card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-secondary);
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  padding: var(--sp-6) var(--sp-4);
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s;
  min-height: 72px;
  width: 100%;
}

.mode-card--active {
  border-color: var(--color-orange);
  color: var(--color-chalk);
}

.mode-card:hover:not(.mode-card--active) {
  border-color: var(--color-secondary);
  color: var(--color-chalk);
}
</style>
