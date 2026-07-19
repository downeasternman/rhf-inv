import { useCallback, useEffect, useMemo, useState } from 'react'
import type Fuse from 'fuse.js'
import type { InventoryItem } from '../types'
import { searchInventory, type SearchableItem } from '../lib/search'
import { AppShell } from './AppShell'
import { BarcodeScanner } from './BarcodeScanner'
import { CategoryDrawer } from './CategoryDrawer'
import { CategoryPanel } from './CategoryPanel'
import { VirtualItemList } from './VirtualItemList'

type Props = {
  items: SearchableItem[]
  fuse: Fuse<SearchableItem>
  categories: string[]
  countedIds: Set<string>
  counts: Record<string, { qty: number }>
  teamLabel: string
  initialQuery: string
  selectedCategories: Set<string>
  onQueryChange: (query: string) => void
  onCategoriesChange: (next: Set<string>) => void
  onSelect: (item: InventoryItem) => void
  onBack: () => void
  onProgress: () => void
}

export function SearchScreen({
  items,
  fuse,
  categories,
  countedIds,
  counts,
  teamLabel,
  initialQuery,
  selectedCategories,
  onQueryChange,
  onCategoriesChange,
  onSelect,
  onBack,
  onProgress,
}: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanNotFound, setScanNotFound] = useState<string | null>(null)

  const itemsByCode = useMemo(() => {
    const map = new Map<string, InventoryItem>()
    for (const item of items) map.set(item.id, item)
    return map
  }, [items])

  const handleScan = useCallback(
    (code: string) => {
      const item = itemsByCode.get(code)
      if (item) {
        setScannerOpen(false)
        setScanNotFound(null)
        onSelect(item)
        return
      }
      setScanNotFound(`No part for ${code}`)
    },
    [itemsByCode, onSelect],
  )

  const closeScanner = useCallback(() => {
    setScannerOpen(false)
    setScanNotFound(null)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(query)
      onQueryChange(query)
    }, 120)
    return () => window.clearTimeout(timer)
  }, [query, onQueryChange])

  const results = useMemo(
    () => searchInventory(fuse, items, debounced, selectedCategories),
    [fuse, items, debounced, selectedCategories],
  )

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 shrink-0 border-b border-rhf-line bg-white pt-[env(safe-area-inset-top)] shadow-sm lg:static lg:shadow-none">
          <div className="flex items-center gap-2 px-3 py-2 lg:px-5 lg:py-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 min-w-11 rounded-xl px-2 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:hover:bg-rhf-mist"
            >
              Home
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-rhf-forest lg:text-lg">
                Find a part
              </h1>
              <p className="truncate text-xs text-rhf-pine/70">
                {teamLabel} · {results.length.toLocaleString()} shown
              </p>
            </div>
            <button
              type="button"
              onClick={onProgress}
              className="min-h-11 rounded-xl px-3 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:hover:bg-rhf-mist"
            >
              Progress
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[280px] shrink-0 flex-col border-r border-rhf-line bg-rhf-fog/50 lg:flex">
            <CategoryPanel
              categories={categories}
              selected={selectedCategories}
              onChange={onCategoriesChange}
              compact
            />
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-rhf-line bg-white px-3 py-3 lg:px-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 3/4 press 90"
                  autoFocus
                  enterKeyHint="search"
                  className="min-h-12 w-full min-w-0 flex-1 rounded-xl border border-rhf-line bg-rhf-fog px-3 text-base outline-none focus:border-rhf-pine lg:px-4"
                />
                <div className="flex gap-2 lg:contents">
                  <button
                    type="button"
                    onClick={() => {
                      setScanNotFound(null)
                      setScannerOpen(true)
                    }}
                    className="min-h-12 flex-1 rounded-xl border border-rhf-line bg-white px-3 text-sm font-medium text-rhf-pine active:bg-rhf-mist lg:flex-none lg:hover:bg-rhf-mist"
                  >
                    Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className={`min-h-12 flex-1 rounded-xl border px-3 text-sm font-medium lg:hidden ${
                      selectedCategories.size > 0
                        ? 'border-rhf-forest bg-rhf-mist text-rhf-forest'
                        : 'border-rhf-line bg-white text-rhf-pine'
                    }`}
                  >
                    Filter
                    {selectedCategories.size > 0
                      ? ` (${selectedCategories.size})`
                      : ''}
                  </button>
                </div>
              </div>

              {selectedCategories.size > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...selectedCategories].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedCategories)
                        next.delete(category)
                        onCategoriesChange(next)
                      }}
                      className="rounded-full bg-rhf-amber-soft px-3 py-1.5 text-xs font-medium text-rhf-amber lg:hover:opacity-80"
                    >
                      {category} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <VirtualItemList
              items={results}
              countedIds={countedIds}
              counts={counts}
              onSelect={onSelect}
            />
          </div>
        </div>

        <CategoryDrawer
          open={drawerOpen}
          categories={categories}
          selected={selectedCategories}
          onClose={() => setDrawerOpen(false)}
          onChange={onCategoriesChange}
        />

        <BarcodeScanner
          open={scannerOpen}
          onClose={closeScanner}
          onScan={handleScan}
          notFoundMessage={scanNotFound}
        />
      </div>
    </AppShell>
  )
}
