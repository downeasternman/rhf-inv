import { useMemo, useState } from 'react'
import { buildCategoryGroups } from '../lib/search'

type Props = {
  categories: string[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** Compact padding for sidebar vs drawer */
  compact?: boolean
}

export function CategoryPanel({
  categories,
  selected,
  onChange,
  compact = false,
}: Props) {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => buildCategoryGroups(categories), [categories])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((group) => ({
        ...group,
        categories: group.categories.filter((c) => c.toLowerCase().includes(q)),
      }))
      .filter((group) => group.categories.length > 0)
  }, [groups, query])

  function toggle(category: string) {
    const next = new Set(selected)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    onChange(next)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`border-b border-rhf-line ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-rhf-pine/70">
            Categories
          </p>
          {selected.size > 0 && (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-medium text-rhf-pine lg:hover:bg-rhf-mist"
              onClick={() => onChange(new Set())}
            >
              Clear
            </button>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-xl border border-rhf-line bg-rhf-fog px-3 py-2.5 text-sm outline-none focus:border-rhf-pine"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {group.label ? (
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-rhf-pine/70">
                {group.label}
              </p>
            ) : null}
            {group.categories.map((category) => {
              const active = selected.has(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggle(category)}
                  className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm lg:hover:bg-rhf-fog ${
                    active
                      ? 'bg-rhf-mist font-medium text-rhf-forest'
                      : 'text-rhf-ink active:bg-rhf-fog'
                  }`}
                >
                  <span className="pr-2">{category}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      active
                        ? 'border-rhf-forest bg-rhf-forest text-white'
                        : 'border-rhf-line'
                    }`}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
