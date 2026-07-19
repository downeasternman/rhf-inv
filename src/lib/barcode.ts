/** R-number product codes (e.g. R12595). Case-insensitive. */
const R_CODE = /^R\d+$/i

export function parseRCode(raw: string): string | null {
  const trimmed = raw.trim()
  if (!R_CODE.test(trimmed)) return null
  return trimmed.toUpperCase()
}
