import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { InventoryItem } from '../types'

type Props = {
  items: InventoryItem[]
  countedIds: Set<string>
  counts: Record<string, { qty: number }>
  onSelect: (item: InventoryItem) => void
}

export function VirtualItemList({ items, countedIds, counts, onSelect }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 12,
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-rhf-pine/70">
        No parts match. Try a different search or clear filters.
      </div>
    )
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const item = items[row.index]
          const counted = countedIds.has(item.id)
          const qty = counts[item.id]?.qty

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="absolute left-0 top-0 flex w-full items-start gap-3 border-b border-rhf-line/70 bg-white px-4 py-3 text-left active:bg-rhf-mist lg:px-5 lg:py-2.5 lg:hover:bg-rhf-mist"
              style={{
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-wide text-rhf-forest">
                    {item.code}
                  </span>
                  {counted && (
                    <span className="rounded bg-rhf-amber-soft px-1.5 py-0.5 text-xs font-medium text-rhf-amber">
                      Qty {qty}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-rhf-ink/80">
                  {item.name}
                </p>
              </div>
              <span className="shrink-0 self-center text-xs text-rhf-pine/60">
                {item.category}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
