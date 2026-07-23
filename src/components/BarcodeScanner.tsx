import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { parseRCode } from '../lib/barcode'

const DEBOUNCE_MS = 750
const NATIVE_DETECT_MS = 250

const HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
  [DecodeHintType.TRY_HARDER, true],
])

const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
  },
}

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
  getSupportedFormats?: () => Promise<string[]>
}

type Props = {
  open: boolean
  onClose: () => void
  onScan: (code: string) => void
  notFoundMessage?: string | null
}

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }
  return w.BarcodeDetector ?? null
}

async function createNativeDetector(): Promise<BarcodeDetectorInstance | null> {
  const Ctor = getBarcodeDetectorCtor()
  if (!Ctor) return null
  try {
    const supported = Ctor.getSupportedFormats
      ? await Ctor.getSupportedFormats()
      : ['code_128', 'code_39']
    const formats = ['code_128', 'code_39'].filter((f) => supported.includes(f))
    if (formats.length === 0) return null
    return new Ctor({ formats })
  } catch {
    return null
  }
}

export function BarcodeScanner({ open, onClose, onScan, notFoundMessage }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onScanRef = useRef(onScan)
  const lastScanRef = useRef<{ code: string; at: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unrecognized, setUnrecognized] = useState<string | null>(null)

  onScanRef.current = onScan

  useEffect(() => {
    if (!open) return

    setError(null)
    setUnrecognized(null)
    lastScanRef.current = null

    let active = true
    let stream: MediaStream | null = null
    let detectTimer: number | null = null
    let zxingControls: { stop: () => void } | null = null
    const reader = new BrowserMultiFormatReader(HINTS)

    function handleRaw(raw: string) {
      if (!active) return

      const code = parseRCode(raw)
      if (!code) {
        const display = raw.length > 40 ? `${raw.slice(0, 40)}…` : raw
        setUnrecognized(`Unrecognized barcode: "${display}"`)
        return
      }

      setUnrecognized(null)

      const now = Date.now()
      const last = lastScanRef.current
      if (last && last.code === code && now - last.at < DEBOUNCE_MS) {
        return
      }
      lastScanRef.current = { code, at: now }
      onScanRef.current(code)
    }

    async function startZxing() {
      zxingControls = await reader.decodeFromConstraints(
        VIDEO_CONSTRAINTS,
        videoRef.current!,
        (result) => {
          if (!active || !result) return
          handleRaw(result.getText())
        },
      )
    }

    async function startNative(detector: BarcodeDetectorInstance) {
      stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
      const video = videoRef.current
      if (!video || !active) {
        stream.getTracks().forEach((t) => t.stop())
        stream = null
        return
      }

      video.srcObject = stream
      await video.play()

      const tick = async () => {
        if (!active || !videoRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (!active) return
          if (codes.length > 0 && codes[0]?.rawValue) {
            handleRaw(codes[0].rawValue)
          }
        } catch {
          // ignore frame errors; keep looping
        }
        if (active) {
          detectTimer = window.setTimeout(() => {
            void tick()
          }, NATIVE_DETECT_MS)
        }
      }

      void tick()
    }

    async function start() {
      try {
        const detector = await createNativeDetector()
        if (!active) return

        if (detector) {
          try {
            await startNative(detector)
            return
          } catch (e) {
            if (!active) return
            if (e instanceof Error && e.name === 'NotAllowedError') {
              setError(
                'Camera permission denied. Allow camera access in your browser settings.',
              )
              return
            }
            // Fall through to ZXing
          }
        }

        await startZxing()
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
      if (detectTimer !== null) window.clearTimeout(detectTimer)
      zxingControls?.stop()
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
        stream = null
      }
      const video = videoRef.current
      if (video) video.srcObject = null
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rhf-ink">
      <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-sm font-medium text-rhf-mist">Scan R-number barcode</p>
        <button
          type="button"
          onClick={() => {
            setUnrecognized(null)
            onClose()
          }}
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
        ) : unrecognized ? (
          <p className="text-sm text-rhf-amber">{unrecognized}</p>
        ) : (
          <p className="text-sm text-rhf-mist/80">
            Point at an R-number label (e.g. R12595). Unrecognized scans show the raw value.
          </p>
        )}
      </div>
    </div>
  )
}
