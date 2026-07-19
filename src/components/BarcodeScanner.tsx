import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { parseRCode } from '../lib/barcode'

const DEBOUNCE_MS = 1500

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
])

type Props = {
  open: boolean
  onClose: () => void
  onScan: (code: string) => void
  notFoundMessage?: string | null
}

export function BarcodeScanner({ open, onClose, onScan, notFoundMessage }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onScanRef = useRef(onScan)
  const lastScanRef = useRef<{ code: string; at: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  onScanRef.current = onScan

  useEffect(() => {
    if (!open) return

    setError(null)
    lastScanRef.current = null

    const reader = new BrowserMultiFormatReader(HINTS)
    let controls: { stop: () => void } | null = null
    let active = true

    async function start() {
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (!active || !result) return

            const code = parseRCode(result.getText())
            if (!code) return

            const now = Date.now()
            const last = lastScanRef.current
            if (last && last.code === code && now - last.at < DEBOUNCE_MS) {
              return
            }
            lastScanRef.current = { code, at: now }

            onScanRef.current(code)
          },
        )
      } catch (e) {
        if (!active) return
        const msg =
          e instanceof Error && e.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in your browser settings.'
            : 'Could not start camera.'
        setError(msg)
      }
    }

    start()

    return () => {
      active = false
      controls?.stop()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rhf-ink">
      <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-sm font-medium text-rhf-mist">Scan R-number barcode</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl px-4 text-sm font-medium text-rhf-mist active:bg-white/10"
        >
          Cancel
        </button>
      </header>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/60" />
      </div>

      <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : notFoundMessage ? (
          <p className="text-sm text-rhf-amber">{notFoundMessage}</p>
        ) : (
          <p className="text-sm text-rhf-mist/80">
            Point at an R-number barcode (e.g. R12595). QR and other barcodes are ignored.
          </p>
        )}
      </div>
    </div>
  )
}
