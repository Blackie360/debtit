import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading () {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 bg-[var(--navy)]" />
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
