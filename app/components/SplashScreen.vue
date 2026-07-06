<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

onMounted(() => {
  // Hold briefly, then fade out.
  setTimeout(() => {
    visible.value = false
  }, 1400)
})
</script>

<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="splash" aria-hidden="true">
      <div class="splash__inner">
        <span class="splash__brand">WOD<em>Brodie</em></span>
        <span class="splash__byline">by Eric Flores</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-floor);
}
.splash__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  text-align: center;
}
.splash__brand {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 12vw, 4rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-chalk);
  line-height: 1;
}
.splash__brand em {
  color: var(--color-orange);
  font-style: normal;
}
.splash__byline {
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.splash-fade-leave-active {
  transition: opacity 0.4s ease;
}
.splash-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .splash-fade-leave-active {
    transition: none;
  }
}
</style>
