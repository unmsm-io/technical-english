type PageShellProps = {
  actions?: React.ReactNode
  children: React.ReactNode
  subtitle?: string
  title: string
}

export function PageShell({ actions, children, subtitle, title }: PageShellProps) {
  return (
    <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <main className="space-y-8">{children}</main>
    </div>
  )
}
