import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/** Full-bleed on mobile; centered framed shell at lg+ */
export function AppShell({ children, className = '' }: Props) {
  return (
    <div className="h-dvh min-h-0 bg-rhf-fog lg:min-h-full lg:flex lg:justify-center lg:px-6 lg:py-6">
      <div
        className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-rhf-fog lg:min-h-[calc(100vh-3rem)] lg:max-w-6xl lg:rounded-2xl lg:border lg:border-rhf-line lg:bg-white lg:shadow-lg ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
