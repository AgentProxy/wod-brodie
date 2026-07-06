<script setup lang="ts">
import { ref } from 'vue'
import type { TimerConfig } from '~/composables/useWodTimer'
import { useWodTimer } from '~/composables/useWodTimer'
import { useBeeper } from '~/composables/useBeeper'

const screen = ref<'setup' | 'timer'>('setup')
const timer = useWodTimer()
const beeper = useBeeper()

function handleStart(cfg: TimerConfig) {
  beeper.unlock()
  timer.start(cfg)
  screen.value = 'timer'
}

function handleNewWorkout() {
  timer.reset()
  screen.value = 'setup'
}
</script>

<template>
  <div>
    <SetupScreen
      v-if="screen === 'setup'"
      @start="handleStart"
    />
    <TimerScreen
      v-else
      :phase="timer.phase.value"
      :display-time="timer.displayTime.value"
      :countdown-sec="timer.countdownSec.value"
      :current-round="timer.currentRound.value"
      :total-rounds="timer.totalRounds.value"
      :to-cap-sec="timer.toCapSec.value"
      :active-movement-index="timer.activeMovementIndex.value"
      :config="timer.config.value"
      @pause="timer.pause()"
      @resume="timer.resume()"
      @finish="timer.finish()"
      @new-workout="handleNewWorkout"
    />
  </div>
</template>
