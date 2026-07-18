import type { CountSession, InventoryItem } from '../types'
import {
  downloadText,
  exportCountsCsv,
  exportCountsJson,
} from '../lib/session'
import { AppShell } from './AppShell'

type Props = {
  session: CountSession
  itemsById: Map<string, InventoryItem>
  onBack: () => void
  onOpenItem: (itemId: string) => void
  onHome: () => void
}

export function ProgressScreen({
  session,
  itemsById,
  onBack,
  onOpenItem,
  onHome,
}: Props) {
  const entries = Object.entries(session.counts).sort((a, b) =>
    b[1].updatedAt.localeCompare(a[1].updatedAt),
  )

  function handleCsv() {
    downloadText(
      `rhf-inventory-counts-${session.id}.csv`,
      exportCountsCsv(session, itemsById),
      'text/csv;charset=utf-8',
    )
  }

  function handleJson() {
    downloadText(
      `rhf-inventory-counts-${session.id}.json`,
      exportCountsJson(session),
      'application/json',
    )
  }

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-rhf-line bg-white px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] lg:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-xl px-2 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:hover:bg-rhf-mist"
          >
            ← Search
          </button>
          <div className="hidden min-w-0 flex-1 lg:block">
            <h1 className="truncate text-xl font-semibold text-rhf-forest">
              Counted items
            </h1>
            <p className="truncate text-sm text-rhf-pine/75">
              {session.member1} & {session.member2} ·{' '}
              {entries.length.toLocaleString()}{' '}
              {entries.length === 1 ? 'part' : 'parts'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCsv}
              disabled={entries.length === 0}
              className="hidden min-h-10 rounded-xl border border-rhf-line bg-white px-3 text-sm font-medium text-rhf-forest disabled:opacity-40 lg:inline-flex lg:items-center lg:hover:bg-rhf-mist"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleJson}
              disabled={entries.length === 0}
              className="hidden min-h-10 rounded-xl border border-rhf-line bg-white px-3 text-sm font-medium text-rhf-forest disabled:opacity-40 lg:inline-flex lg:items-center lg:hover:bg-rhf-mist"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={onHome}
              className="min-h-11 rounded-xl px-2 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:hover:bg-rhf-mist"
            >
              Home
            </button>
          </div>
        </div>

        <div className="lg:hidden">
          <h1 className="mt-2 text-2xl font-semibold text-rhf-forest">Counted items</h1>
          <p className="mt-1 text-sm text-rhf-pine/75">
            {session.member1} & {session.member2} · {entries.length.toLocaleString()}{' '}
            {entries.length === 1 ? 'part' : 'parts'}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCsv}
              disabled={entries.length === 0}
              className="min-h-11 flex-1 rounded-xl border border-rhf-line bg-white px-3 text-sm font-medium text-rhf-forest disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleJson}
              disabled={entries.length === 0}
              className="min-h-11 flex-1 rounded-xl border border-rhf-line bg-white px-3 text-sm font-medium text-rhf-forest disabled:opacity-40"
            >
              Export JSON
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {entries.length === 0 ? (
          <p className="px-6 py-12 text-center text-rhf-pine/70">
            No counts yet. Search for a part and enter a quantity.
          </p>
        ) : (
          <ul className="lg:px-2">
            {entries.map(([id, entry]) => {
              const item = itemsById.get(id)
              if (!item) return null
              return (
                <li key={id} className="border-b border-rhf-line/70">
                  <button
                    type="button"
                    onClick={() => onOpenItem(id)}
                    className="flex w-full items-start gap-3 bg-white px-4 py-3 text-left active:bg-rhf-mist lg:rounded-lg lg:px-4 lg:hover:bg-rhf-mist"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-rhf-forest">{item.code}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-rhf-ink/80">
                        {item.name}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-rhf-amber-soft px-2.5 py-1 text-sm font-semibold text-rhf-amber">
                      {entry.qty}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      </div>
    </AppShell>
  )
}
