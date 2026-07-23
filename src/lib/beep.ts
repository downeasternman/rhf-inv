/** Short confirmation tone for a successful barcode scan. No-ops if audio is unavailable. */
export function playScanBeep(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
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

    void ctx.resume().catch(() => {})
    window.setTimeout(() => {
      void ctx.close().catch(() => {})
    }, 150)
  } catch {
    // ignore
  }
}
