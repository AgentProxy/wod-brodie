// Web Audio oscillator cues — implemented in v0.3
export function useBeeper() {
  let ctx: AudioContext | null = null

  function unlock() {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
  }

  function beep(freq = 880, durationSec = 0.1) {
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec)
    osc.start()
    osc.stop(ctx.currentTime + durationSec)
  }

  return { unlock, beep }
}
