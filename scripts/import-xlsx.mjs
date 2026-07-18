import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const inputPath = join(root, '')
const outputPath = join(root, 'src', 'data', 'inventory.json')

const workbook = XLSX.read(readFileSync(inputPath), { type: 'buffer' })
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

const inventory = rows
  .map((row, index) => {
    const record = /** @type {Record<string, unknown>} */ (row)
    const code = String(record['Product Code'] ?? '').trim()
    const name = String(record['Name'] ?? '').trim()
    const rawCategory = String(record['Category'] ?? '').trim()
    const category = rawCategory || 'Uncategorized'

    if (!code || !name) {
      throw new Error(`Row ${index + 2} is missing Product Code or Name`)
    }

    return {
      id: code,
      code,
      name,
      category,
    }
  })
  // Annual inventory counts stock parts only (R-number SKUs), not fuels/labor/fees
  .filter((item) => /^R\d+$/i.test(item.code))

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(inventory))

const categories = new Set(inventory.map((item) => item.category))
const skipped = rows.length - inventory.length
console.log(`Wrote ${inventory.length} R-number items to ${outputPath}`)
console.log(`Skipped ${skipped} non-stock codes (fuels, labor, fees, etc.)`)
console.log(`Categories: ${categories.size}`)
