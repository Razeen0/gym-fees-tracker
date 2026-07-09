import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onSort?: (key: string) => void
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  emptyMessage?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  searchable?: boolean
  onSearch?: (query: string) => void
  searchValue?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onSort,
  sortKey,
  sortOrder,
  emptyMessage = 'No data found',
  page = 1,
  totalPages = 1,
  onPageChange,
  totalCount,
  searchable,
  onSearch,
  searchValue = '',
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    onSearch?.(value)
  }

  return (
    <div className="card">
      {(searchable || totalCount !== undefined) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          )}
          {totalCount !== undefined && (
            <span className="text-sm text-dark-500 dark:text-dark-400">
              {totalCount} record{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200 dark:border-dark-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={cn(
                    'table-header',
                    col.sortable && 'cursor-pointer hover:text-dark-900 dark:hover:text-white',
                    col.className,
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      <div className="skeleton h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <p className="text-dark-500 dark:text-dark-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id as string || idx}
                  className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('table-cell', col.className)}>
                      {col.render
                        ? col.render(item)
                        : (item[col.key] as React.ReactNode) || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
          <span className="text-sm text-dark-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
              className="btn-ghost p-1.5 disabled:opacity-30"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="btn-ghost p-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-dark-900 dark:text-white">
              {page}
            </span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="btn-ghost p-1.5 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
              className="btn-ghost p-1.5 disabled:opacity-30"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
