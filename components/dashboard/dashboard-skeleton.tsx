/**
 * Rendered during the static prerender and until `useToday` resolves the local
 * day. Nothing date-dependent may appear here, or the build date would be baked
 * into the HTML the way it was in 0.1.
 */
export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-8"
      aria-busy="true"
      aria-label="Loading today"
    >
      <div className="flex flex-col gap-5">
        <div className="h-56 rounded-lg border border-hairline bg-panel shadow-sm" />
        <div className="h-40 rounded-lg border border-hairline bg-panel shadow-sm" />
        <div className="h-80 rounded-lg border border-hairline bg-panel shadow-sm" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-64 rounded-lg border border-hairline bg-panel shadow-sm" />
        <div className="h-56 rounded-lg border border-hairline bg-panel shadow-sm" />
        <div className="h-48 rounded-lg border border-hairline bg-panel shadow-sm" />
      </div>
    </div>
  )
}
