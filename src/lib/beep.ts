/** Shared AudioContext primed on a user gesture (e.g. Scan tap). */
let sharedCtx: AudioContext | null = null

function getAudioContextConstructor(): (typeof AudioContext) | null {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ||
    null
  )
}

/** Resume/create AudioContext during a user gesture so later beeps can play. */
export function primeScanBeep(): void {
  try {
    const AudioCtx = getAudioContextConstructor()
    if (!AudioCtx) return
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioCtx()
    }
    void sharedCtx.resume().catch(() => {})
  } catch {
    // ignore
  }
}

/** Short confirmation tone for a successful barcode scan. No-ops if audio is unavailable. */
export function playScanBeep(): void {
  try {
    const AudioCtx = getAudioContextConstructor()
    if (!AudioCtx) return

    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioCtx()
    }
    const ctx = sharedCtx
    void ctx.resume().catch(() => {})

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)

    const start = ctx.currentTime
    gain.gain.setValueAtTime(0.15, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1)
    osc.start(start)
    osc.stop(start + 0.1)
  } catch {
    // ignore
  }
}
