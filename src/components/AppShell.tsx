import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/** Full-bleed on mobile; centered framed shell at lg+ */
export function AppShell({ children, className = '' }: Props) {
  return (
    <div className="min-h-full bg-rhf-fog lg:flex lg:justify-center lg:px-6 lg:py-6">
      <div
        className={`flex min-h-full w-full flex-col bg-rhf-fog lg:min-h-[calc(100vh-3rem)] lg:max-w-6xl lg:overflow-hidden lg:rounded-2xl lg:border lg:border-rhf-line lg:bg-white lg:shadow-lg ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
