// Screen Wake Lock — wired up in v0.3
export function useWakeLock() {
  let lock: WakeLockSentinel | null = null

  async function request() {
    if (!('wakeLock' in navigator)) return
    try {
      lock = await navigator.wakeLock.request('screen')
    } catch {}
  }

  async function release() {
    await lock?.release()
    lock = null
  }

  return { request, release }
}
