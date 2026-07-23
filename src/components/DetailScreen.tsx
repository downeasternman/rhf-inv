import { useRef, useState, type FormEvent } from 'react'
import type { InventoryItem } from '../types'
import { AppShell } from './AppShell'

type Props = {
  item: InventoryItem
  existingQty?: number
  onSave: (qty: number) => void
  onClear?: () => void
  onBack: () => void
}

export function DetailScreen({
  item,
  existingQty,
  onSave,
  onClear,
  onBack,
}: Props) {
  const qtyInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(
    existingQty !== undefined ? String(existingQty) : '',
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    const qty = Number(value)
    if (!Number.isFinite(qty) || qty < 0) return
    qtyInputRef.current?.blur()
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    onSave(Math.floor(qty))
  }

  return (
    <AppShell>
      <header className="border-b border-rhf-line bg-white px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] lg:px-6 lg:py-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 rounded-xl px-2 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:hover:bg-rhf-mist"
        >
          ← Back to search
        </button>
        <div className="lg:hidden">
          <p className="mt-3 text-sm font-medium uppercase tracking-wide text-rhf-pine/70">
            {item.category}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-wide text-rhf-forest">
            {item.code}
          </h1>
          <p className="mt-2 text-base leading-snug text-rhf-ink/85">{item.name}</p>
        </div>
      </header>

      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6 lg:max-w-4xl lg:px-8 lg:py-8"
      >
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:rounded-2xl lg:border lg:border-rhf-line lg:bg-white lg:p-8 lg:shadow-sm">
          <div className="hidden lg:block">
            <p className="text-sm font-medium uppercase tracking-wide text-rhf-pine/70">
              {item.category}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-wide text-rhf-forest">
              {item.code}
            </h1>
            <p className="mt-3 text-lg leading-snug text-rhf-ink/85">{item.name}</p>
          </div>

          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="text-sm font-medium text-rhf-pine">Count quantity</span>
              <input
                ref={qtyInputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                step={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                className="mt-2 w-full rounded-2xl border border-rhf-line bg-white px-4 py-5 text-center text-4xl font-semibold tracking-wide text-rhf-forest outline-none focus:border-rhf-pine lg:bg-rhf-fog"
                placeholder="0"
              />
            </label>

            <button
              type="submit"
              className="min-h-14 rounded-2xl bg-rhf-forest px-4 py-4 text-lg font-semibold text-white active:bg-rhf-pine lg:hover:bg-rhf-pine"
            >
              Save count
            </button>

            {existingQty !== undefined && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="min-h-11 rounded-2xl px-4 py-3 text-sm font-medium text-red-700/80 active:bg-red-50 lg:hover:bg-red-50"
              >
                Remove count
              </button>
            )}
          </div>
        </div>
      </form>
    </AppShell>
  )
}
