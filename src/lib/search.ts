import Fuse from 'fuse.js'
import type { InventoryItem } from '../types'

/** Stock parts use R-number product codes (e.g. R14037). Fuels, labor, fees are excluded. */
const R_NUMBER_CODE = /^R\d+$/i

export function isCountablePartCode(code: string): boolean {
  return R_NUMBER_CODE.test(code.trim())
}

/** Trade / catalog abbreviation expansions used by plumbers & techs */
const ALIASES: Record<string, string[]> = {
  elb: ['elbow', 'ell'],
  elbow: ['elb', 'ell'],
  ell: ['elb', 'elbow'],
  coup: ['coupling', 'coupler'],
  coupling: ['coup', 'coupler'],
  adapt: ['adapter', 'adaptor'],
  adapter: ['adapt', 'adaptor'],
  adaptor: ['adapt', 'adapter'],
  press: ['propress', 'pressfit'],
  propress: ['press'],
  tee: ['t'],
  red: ['reducer', 'reducing'],
  reducer: ['red'],
  bush: ['bushing'],
  bushing: ['bush'],
  valv: ['valve'],
  valve: ['valv'],
  circ: ['circulator'],
  circulator: ['circ'],
  nozz: ['nozzle'],
  nozzle: ['nozz'],
  therm: ['thermostat'],
  thermostat: ['therm'],
  gask: ['gasket'],
  gasket: ['gask'],
  flt: ['filter'],
  filter: ['flt'],
  fpt: ['female'],
  mpt: ['male'],
  stl: ['steel'],
  steel: ['stl'],
  cop: ['copper'],
  copper: ['cop'],
  pvc: ['plastic'],
  pex: ['wirsbo'],
  wirsbo: ['pex'],
  st: ['street'],
  street: ['st'],
  deg: ['degree', 'd'],
  degree: ['deg', 'd'],
  '90d': ['90'],
  '45d': ['45'],
  '90': ['90d'],
  '45': ['45d'],
}

export type CategoryGroup = {
  label: string
  categories: string[]
}

export type SearchableItem = InventoryItem & {
  searchText: string
  searchTokens: string[]
}

export function buildCategoryGroups(categories: string[]): CategoryGroup[] {
  return [
    {
      label: '',
      categories: [...categories].sort((a, b) => a.localeCompare(b)),
    },
  ]
}

export function normalizeSearchText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/°/g, ' ')
    .replace(/(\d)\s*d\b/g, '$1 ') // 90d / 45D → 90 / 45
    .replace(/(\d)d\b/g, '$1 ')
    .replace(/[#]/g, ' ')
    .replace(/[/_.-]+/g, ' ') // 3/4 → 3 4 so both "3/4" and "3 4" work via dual tokens
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandToken(token: string): string[] {
  const extras = ALIASES[token] ?? []
  return [token, ...extras]
}

/** Keep original fraction form plus split parts for flexible matching */
function fractionVariants(raw: string): string[] {
  const variants = new Set<string>()
  const lower = raw.toLowerCase()
  variants.add(lower)

  // Capture sizes like 3/4, 1-1/4, 1/2
  for (const match of lower.matchAll(/\d+(?:\s*-\s*)?\d*\s*\/\s*\d+/g)) {
    const compact = match[0].replace(/\s+/g, '')
    variants.add(compact)
    variants.add(compact.replace(/-/g, ' '))
    // 3/4 → also index as "3 4" tokens via normalize
    variants.add(compact.replace(/\//g, ' '))
  }

  return [...variants]
}

export function buildSearchableItem(item: InventoryItem): SearchableItem {
  const base = `${item.code} ${item.name} ${item.category}`
  const variants = fractionVariants(base)
  const normalizedParts = variants.map(normalizeSearchText)

  const tokenSet = new Set<string>()
  for (const part of normalizedParts) {
    for (const token of part.split(' ').filter(Boolean)) {
      for (const expanded of expandToken(token)) {
        tokenSet.add(expanded)
      }
    }
  }

  // Also keep compact fractions as single tokens (3/4) for queries typed with slash
  for (const match of item.name.toLowerCase().matchAll(/\d+(?:-\d+)?\/\d+/g)) {
    tokenSet.add(match[0])
    tokenSet.add(match[0].replace(/-/g, ''))
  }

  const searchTokens = [...tokenSet]
  return {
    ...item,
    searchTokens,
    searchText: searchTokens.join(' '),
  }
}

export function prepareInventory(items: InventoryItem[]): SearchableItem[] {
  return items.filter((item) => isCountablePartCode(item.code)).map(buildSearchableItem)
}

export function createSearchIndex(items: SearchableItem[]) {
  return new Fuse(items, {
    keys: [
      { name: 'code', weight: 0.4 },
      { name: 'name', weight: 0.25 },
      { name: 'searchText', weight: 0.35 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 1,
  })
}

function queryTokens(query: string): string[] {
  const raw = query.trim().toLowerCase()
  if (!raw) return []

  const tokens = new Set<string>()

  // Prefer keeping size fractions intact
  const withoutFractions = raw.replace(/\d+(?:-\d+)?\/\d+/g, (frac) => {
    tokens.add(frac)
    tokens.add(frac.replace(/-/g, ''))
    return ' '
  })

  for (const token of normalizeSearchText(withoutFractions).split(' ').filter(Boolean)) {
    tokens.add(token)
  }

  return [...tokens]
}

function tokenMatches(itemTokens: Set<string>, queryToken: string): boolean {
  if (itemTokens.has(queryToken)) return true

  for (const alias of expandToken(queryToken)) {
    if (itemTokens.has(alias)) return true
  }

  return false
}

function scoreItem(
  item: SearchableItem,
  tokens: string[],
  itemTokenSet: Set<string>,
): number {
  let score = 0
  for (const token of tokens) {
    if (itemTokenSet.has(token)) score += 3
    else if (expandToken(token).some((a) => itemTokenSet.has(a))) score += 2
    else score += 1
  }
  // Prefer shorter catalog names (exact fittings over long assemblies)
  score += Math.max(0, 40 - item.name.length) / 40
  // Slight boost when all query tokens appear as contiguous-ish in name
  const nameNorm = normalizeSearchText(item.name)
  if (tokens.every((t) => nameNorm.includes(t) || item.name.toLowerCase().includes(t))) {
    score += 2
  }
  return score
}

export function searchInventory(
  fuse: Fuse<SearchableItem>,
  items: SearchableItem[],
  query: string,
  selectedCategories: Set<string>,
): InventoryItem[] {
  const trimmed = query.trim()
  let pool = items

  if (selectedCategories.size > 0) {
    pool = pool.filter((item) => selectedCategories.has(item.category))
  }

  if (!trimmed) {
    return pool
  }

  const tokens = queryTokens(trimmed)
  if (tokens.length === 0) return pool

  // Exact code shortcut
  const codeExact = pool.filter(
    (item) => item.code.toLowerCase() === trimmed.toLowerCase(),
  )
  if (codeExact.length > 0) return codeExact

  const codePrefix = pool.filter((item) =>
    item.code.toLowerCase().startsWith(trimmed.toLowerCase()),
  )
  if (codePrefix.length > 0 && !trimmed.includes(' ')) {
    return codePrefix.slice(0, 100)
  }

  // Primary: every query token must match (trade-speak friendly AND)
  const tokenHits: { item: SearchableItem; score: number }[] = []
  for (const item of pool) {
    const set = new Set(item.searchTokens)
    if (tokens.every((t) => tokenMatches(set, t))) {
      tokenHits.push({ item, score: scoreItem(item, tokens, set) })
    }
  }

  if (tokenHits.length > 0) {
    tokenHits.sort((a, b) => b.score - a.score)
    return tokenHits.map((h) => h.item)
  }

  // Fallback: Fuse fuzzy when AND matching finds nothing (typos)
  return fuse
    .search(trimmed)
    .map((hit) => hit.item)
    .filter((item) =>
      selectedCategories.size === 0
        ? true
        : selectedCategories.has(item.category),
    )
}

export function getUniqueCategories(items: InventoryItem[]): string[] {
  return [...new Set(items.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b),
  )
}
