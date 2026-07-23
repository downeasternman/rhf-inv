/** R-number product codes (e.g. R12595). Case-insensitive. */
const R_CODE = /^R\d+$/i
const R_CODE_EXTRACT = /R\d+/i

export function parseRCode(raw: string): string | null {
  const trimmed = raw.trim()
  if (R_CODE.test(trimmed)) return trimmed.toUpperCase()

  const match = trimmed.match(R_CODE_EXTRACT)
  if (!match) return null
  return match[0].toUpperCase()
}
