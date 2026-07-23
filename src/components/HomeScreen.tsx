import { useState, type FormEvent } from 'react'
import { APP_NAME, APP_VERSION } from '../lib/brand'
import { AppShell } from './AppShell'

type Props = {
  existing?: {
    member1: string
    member2: string
    countedItems: number
  } | null
  onStart: (member1: string, member2: string) => void
  onContinue: () => void
  onProgress: () => void
  onReset: () => void
}

export function HomeScreen({
  existing,
  onStart,
  onContinue,
  onProgress,
  onReset,
}: Props) {
  const [member1, setMember1] = useState('')
  const [member2, setMember2] = useState('')

  function handleStart(event: FormEvent) {
    event.preventDefault()
    const a = member1.trim()
    const b = member2.trim()
    if (!a || !b) return
    onStart(a, b)
  }

  if (existing) {
    return (
      <AppShell>
        <header className="bg-rhf-forest px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-rhf-mist lg:flex lg:items-end lg:justify-between lg:px-8 lg:pb-6 lg:pt-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-rhf-mist/70">
              {APP_NAME}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:mt-1 lg:text-2xl">
              Inventory Count{' '}
              <span className="text-lg font-normal text-rhf-mist/60 lg:text-base">
                {APP_VERSION}
              </span>
            </h1>
            <p className="mt-2 text-sm text-rhf-mist/85 lg:mt-1">
              Team session in progress
            </p>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6 lg:max-w-xl lg:px-8 lg:py-8">
          <section className="rounded-2xl border border-rhf-line bg-white p-5 shadow-sm lg:border-rhf-line">
            <p className="text-sm text-rhf-pine/80">Counting team</p>
            <p className="mt-2 text-xl font-semibold text-rhf-forest">
              {existing.member1}
              <span className="mx-2 font-normal text-rhf-pine/50">&</span>
              {existing.member2}
            </p>
            <p className="mt-4 text-sm text-rhf-pine/75">
              <span className="text-2xl font-semibold text-rhf-forest">
                {existing.countedItems}
              </span>{' '}
              {existing.countedItems === 1 ? 'part' : 'parts'} counted this session
            </p>
          </section>

          <button
            type="button"
            onClick={onContinue}
            className="min-h-14 rounded-2xl bg-rhf-forest px-4 py-4 text-lg font-semibold text-white active:bg-rhf-pine lg:hover:bg-rhf-pine"
          >
            Continue counting
          </button>

          <button
            type="button"
            onClick={onProgress}
            className="min-h-12 rounded-2xl border border-rhf-line bg-white px-4 py-3 font-medium text-rhf-forest active:bg-rhf-mist lg:hover:bg-rhf-mist"
          >
            View counted items
          </button>

          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-2xl px-4 py-3 text-sm font-medium text-red-700/80 active:bg-red-50 lg:hover:bg-red-50"
          >
            Start new session
          </button>
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <header className="bg-rhf-forest px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-rhf-mist lg:flex lg:items-end lg:justify-between lg:px-8 lg:pb-6 lg:pt-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-rhf-mist/70">
            {APP_NAME}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:mt-1 lg:text-2xl">
            Inventory Count{' '}
            <span className="text-lg font-normal text-rhf-mist/60 lg:text-base">
              {APP_VERSION}
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-rhf-mist/85 lg:mt-1">
            Enter both team members, then start counting.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleStart}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6 lg:max-w-xl lg:px-8 lg:py-8"
      >
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
          <label className="block rounded-2xl border border-rhf-line bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-rhf-pine">Team member 1</span>
            <input
              type="text"
              name="member1"
              autoComplete="name"
              value={member1}
              onChange={(e) => setMember1(e.target.value)}
              placeholder="Name"
              autoFocus
              className="mt-2 w-full rounded-xl border border-rhf-line bg-rhf-fog px-3 py-3 text-base outline-none focus:border-rhf-pine"
            />
          </label>

          <label className="block rounded-2xl border border-rhf-line bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-rhf-pine">Team member 2</span>
            <input
              type="text"
              name="member2"
              autoComplete="name"
              value={member2}
              onChange={(e) => setMember2(e.target.value)}
              placeholder="Name"
              className="mt-2 w-full rounded-xl border border-rhf-line bg-rhf-fog px-3 py-3 text-base outline-none focus:border-rhf-pine"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!member1.trim() || !member2.trim()}
          className="min-h-14 rounded-2xl bg-rhf-forest px-4 py-4 text-lg font-semibold text-white active:bg-rhf-pine disabled:opacity-40 lg:hover:bg-rhf-pine"
        >
          Start counting
        </button>
      </form>
    </AppShell>
  )
}
