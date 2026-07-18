import { CategoryPanel } from './CategoryPanel'

type Props = {
  open: boolean
  categories: string[]
  selected: Set<string>
  onClose: () => void
  onChange: (next: Set<string>) => void
}

export function CategoryDrawer({
  open,
  categories,
  selected,
  onClose,
  onChange,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-rhf-ink/40 lg:hidden">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="flex max-h-[85vh] flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl">
        <div className="flex items-center justify-end border-b border-rhf-line px-4 py-3">
          <button
            type="button"
            className="rounded-lg bg-rhf-forest px-3 py-2 text-sm font-medium text-white"
            onClick={onClose}
          >
            Done
          </button>
        </div>
        <CategoryPanel
          categories={categories}
          selected={selected}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
