import { useCallback, useMemo, useState } from 'react'
import inventoryData from './data/inventory.json'
import { HomeScreen } from './components/HomeScreen'
import { SearchScreen } from './components/SearchScreen'
import { DetailScreen } from './components/DetailScreen'
import { ProgressScreen } from './components/ProgressScreen'
import {
  createSearchIndex,
  getUniqueCategories,
  prepareInventory,
} from './lib/search'
import {
  clearSession,
  getCount,
  getCountedIds,
  loadSession,
  removeCount,
  setCount,
  startNewSession,
} from './lib/session'
import type { CountSession, InventoryItem, Screen } from './types'

const inventory = prepareInventory(inventoryData as InventoryItem[])

export default function App() {
  const [session, setSession] = useState<CountSession | null>(() => loadSession())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  )

  const fuse = useMemo(() => createSearchIndex(inventory), [])
  const categories = useMemo(() => getUniqueCategories(inventory), [])
  const itemsById = useMemo(() => {
    const map = new Map<string, InventoryItem>()
    for (const item of inventory) map.set(item.id, item)
    return map
  }, [])

  const countedIds = useMemo(
    () => (session ? getCountedIds(session) : new Set<string>()),
    [session],
  )
  const countedItems = countedIds.size

  const handleQueryChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategoriesChange = useCallback((next: Set<string>) => {
    setSelectedCategories(next)
  }, [])

  function handleStart(member1: string, member2: string) {
    const next = startNewSession(member1, member2)
    setSession(next)
    setSearchQuery('')
    setSelectedCategories(new Set())
    setScreen({ name: 'search' })
  }

  function handleReset() {
    if (
      !window.confirm(
        'Start a new session? Current counts on this device will be cleared.',
      )
    ) {
      return
    }
    clearSession()
    setSession(null)
    setSearchQuery('')
    setSelectedCategories(new Set())
    setScreen({ name: 'home' })
  }

  if (screen.name === 'home') {
    return (
      <HomeScreen
        existing={
          session
            ? {
                member1: session.member1,
                member2: session.member2,
                countedItems,
              }
            : null
        }
        onStart={handleStart}
        onContinue={() => setScreen({ name: 'search' })}
        onProgress={() => setScreen({ name: 'progress' })}
        onReset={handleReset}
      />
    )
  }

  if (!session) {
    return (
      <HomeScreen
        existing={null}
        onStart={handleStart}
        onContinue={() => setScreen({ name: 'search' })}
        onProgress={() => setScreen({ name: 'progress' })}
        onReset={handleReset}
      />
    )
  }

  if (screen.name === 'search') {
    return (
      <SearchScreen
        items={inventory}
        fuse={fuse}
        categories={categories}
        countedIds={countedIds}
        counts={session.counts}
        teamLabel={`${session.member1} & ${session.member2}`}
        initialQuery={searchQuery}
        selectedCategories={selectedCategories}
        resumeScanner={screen.resumeScanner}
        onQueryChange={handleQueryChange}
        onCategoriesChange={handleCategoriesChange}
        onSelect={(item, source) =>
          setScreen({ name: 'detail', itemId: item.id, source })
        }
        onBack={() => setScreen({ name: 'home' })}
        onProgress={() => setScreen({ name: 'progress' })}
      />
    )
  }

  if (screen.name === 'detail') {
    const item = itemsById.get(screen.itemId)
    if (!item) {
      return (
        <div className="flex min-h-full items-center justify-center p-6">
          <button
            type="button"
            className="rounded-xl bg-rhf-forest px-4 py-3 text-white"
            onClick={() => setScreen({ name: 'search' })}
          >
            Part not found — back to search
          </button>
        </div>
      )
    }
    const existing = getCount(session, item.id)
    const detailSource = screen.source

    return (
      <DetailScreen
        item={item}
        existingQty={existing?.qty}
        onBack={() => setScreen({ name: 'search' })}
        onSave={(qty) => {
          setSession(setCount(session, item.id, qty))
          setScreen(
            detailSource === 'scan'
              ? { name: 'search', resumeScanner: true }
              : { name: 'search' },
          )
        }}
        onClear={
          existing
            ? () => {
                setSession(removeCount(session, item.id))
                setScreen({ name: 'search' })
              }
            : undefined
        }
      />
    )
  }

  return (
    <ProgressScreen
      session={session}
      itemsById={itemsById}
      onBack={() => setScreen({ name: 'search' })}
      onHome={() => setScreen({ name: 'home' })}
      onOpenItem={(itemId) =>
        setScreen({ name: 'detail', itemId, source: 'search' })
      }
    />
  )
}
