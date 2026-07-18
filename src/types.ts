export type InventoryItem = {
  id: string
  code: string
  name: string
  category: string
}

export type CountEntry = {
  qty: number
  updatedAt: string
}

export type CountSession = {
  id: string
  startedAt: string
  member1: string
  member2: string
  counts: Record<string, CountEntry>
}

export type Screen =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'detail'; itemId: string }
  | { name: 'progress' }
