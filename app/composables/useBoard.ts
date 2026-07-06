import { ref, watch } from 'vue'

const STORAGE_KEY = 'wodbrodie:lastBoard'

export function useBoard() {
  const movements = ref<string[]>([])

  // Restore last board from localStorage
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) movements.value = JSON.parse(saved)
    } catch {}
  }

  watch(movements, (val) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }
  }, { deep: true })

  function addMovement(text: string) {
    if (text.trim()) movements.value.push(text.trim())
  }

  function removeMovement(index: number) {
    movements.value.splice(index, 1)
  }

  function clearAll() {
    movements.value = []
  }

  return { movements, addMovement, removeMovement, clearAll }
}
