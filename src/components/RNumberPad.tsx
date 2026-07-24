import { useEffect, useState } from 'react'
import { parseRCode } from '../lib/barcode'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (code: string) => 'ok' | 'not-found'
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const

export function RNumberPad({ open, onClose, onSubmit }: Props) {
  const [digits, setDigits] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDigits('')
    setMessage(null)
  }, [open])

  if (!open) return null

  function press(key: (typeof KEYS)[number]) {
    setMessage(null)
    if (key === 'clear') {
      setDigits('')
      return
    }
    if (key === 'back') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    setDigits((d) => (d.length >= 8 ? d : d + key))
  }

  function go() {
    const code = parseRCode(`R${digits}`)
    if (!code) {
      setMessage('Enter the digits after R')
      return
    }
    const result = onSubmit(code)
    if (result === 'not-found') {
      setMessage(`No part for ${code}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rhf-ink">
      <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-sm font-medium text-rhf-mist">Enter R-number</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl px-4 text-sm font-medium text-rhf-mist active:bg-white/10"
        >
          Cancel
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="mt-4 text-center font-mono text-4xl font-semibold tracking-wide text-rhf-mist">
          R
          {digits.length > 0 ? (
            digits
          ) : (
            <span className="text-rhf-mist/35">•••••</span>
          )}
        </p>
        <p className="mt-3 min-h-5 text-center text-sm text-rhf-amber">
          {message ?? '\u00a0'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className="min-h-14 rounded-2xl bg-white/10 text-lg font-semibold text-rhf-mist active:bg-white/20"
            >
              {key === 'clear' ? 'Clear' : key === 'back' ? '⌫' : key}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={go}
          className="mt-4 min-h-14 rounded-2xl bg-rhf-forest text-lg font-semibold text-white active:bg-rhf-pine"
        >
          Go
        </button>
      </div>
    </div>
  )
}
