# RHF Inventory Demo

Mobile-friendly front-end demo for annual inventory counting. Search and filter ~12.8k stock parts, enter counts on a phone, and keep session progress in the browser.

## Quick start

```bash
npm install
$env:INVENTORY_XLSX="path\to\your-spreadsheet.xlsx"; npm run import-data
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### Try on a phone

1. Run `npm run dev:host`
2. On the same Wi‑Fi, open the **Network** URL shown in the terminal (e.g. `http://192.168.x.x:5173`)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run import-data` | Regenerate `src/data/inventory.json` from a local spreadsheet (`INVENTORY_XLSX`) |
| `npm run dev` | Start the demo |
| `npm run build` | Production build |

## Demo flow

1. **Home** — enter team member 1 & 2 (or resume an existing team session)
2. **Search** — trade-speak search (e.g. `3/4 press 90` → `PRESS ELB 90D 3/4`); category filter drawer
3. **Part detail** — enter quantity (saved to `localStorage`)
4. **Progress** — review counted items for this team; export CSV or JSON

Blank Excel categories become `Uncategorized`. Only **R-number** stock parts (e.g. `R14037`) are included — fuels, labor, fees, and other non-R codes are excluded from search and category filters. Search matches how techs talk (sizes, “press 90”, elbow aliases), not only exact catalog wording.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Use these settings (Vite defaults usually match):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy

Re-run `npm run import-data` locally before pushing if you updated the source spreadsheet.

## Notes

- No backend yet — counts stay on the device
- Re-run `npm run import-data` after updating the spreadsheet
