export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string | null, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)

  if (format === 'relative') {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days === -1) return 'Yesterday'
    if (days > 0 && days <= 7) return `${days} days left`
    if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonth(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return months[month - 1] || ''
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'badge-success',
    active: 'badge-success',
    pending: 'badge-warning',
    overdue: 'badge-error',
    cancelled: 'badge-neutral',
    refunded: 'badge-info',
    expired: 'badge-error',
    suspended: 'badge-error',
    inactive: 'badge-neutral',
  }
  return colors[status] || 'badge-neutral'
}
