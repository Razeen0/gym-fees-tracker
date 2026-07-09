import { cn } from '@/utils/cn'

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card animate-pulse', className)}>
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-10 w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-dark-100 dark:border-dark-800">
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-4 w-1/6" />
          <div className="skeleton h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="page-container animate-pulse">
      <div className="flex justify-between mb-8">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="skeleton h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </div>
  )
}
