import type { CountEntry, CountSession } from '../types'

const STORAGE_KEY = 'rhf-inv-session-v2'

function createSession(member1 = '', member2 = ''): CountSession {
  return {
    id: `session-${Date.now()}`,
    startedAt: new Date().toISOString(),
    member1,
    member2,
    counts: {},
  }
}

export function loadSession(): CountSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CountSession
    if (!parsed?.id || !parsed?.counts) return null
    if (!parsed.member1 || !parsed.member2) return null
    return {
      ...parsed,
      member1: parsed.member1,
      member2: parsed.member2,
    }
  } catch {
    return null
  }
}

export function saveSession(session: CountSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function startNewSession(member1: string, member2: string): CountSession {
  const session = createSession(member1.trim(), member2.trim())
  saveSession(session)
  return session
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function setCount(
  session: CountSession,
  itemId: string,
  qty: number,
): CountSession {
  const next: CountSession = {
    ...session,
    counts: {
      ...session.counts,
      [itemId]: {
        qty,
        updatedAt: new Date().toISOString(),
      },
    },
  }
  saveSession(next)
  return next
}

export function removeCount(session: CountSession, itemId: string): CountSession {
  const counts = { ...session.counts }
  delete counts[itemId]
  const next = { ...session, counts }
  saveSession(next)
  return next
}

export function getCountedIds(session: CountSession): Set<string> {
  return new Set(Object.keys(session.counts))
}

export function getCount(session: CountSession, itemId: string): CountEntry | undefined {
  return session.counts[itemId]
}

export function exportCountsCsv(
  session: CountSession,
  itemsById: Map<string, { code: string; name: string; category: string }>,
): string {
  const lines = [
    `Team,${csvEscape(session.member1)},${csvEscape(session.member2)}`,
    'Product Code,Name,Category,Quantity,Updated At',
  ]
  for (const [id, entry] of Object.entries(session.counts)) {
    const item = itemsById.get(id)
    if (!item) continue
    const cells = [
      item.code,
      item.name,
      item.category,
      String(entry.qty),
      entry.updatedAt,
    ].map(csvEscape)
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

export function exportCountsJson(session: CountSession): string {
  return JSON.stringify(session, null, 2)
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
