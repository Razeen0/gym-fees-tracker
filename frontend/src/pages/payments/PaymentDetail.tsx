import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { paymentsService } from '@/services/payments.service'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/format'
import { ArrowLeft, Printer } from 'lucide-react'

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsService.get(id!),
    enabled: !!id,
  })

  if (isLoading) return <PageSkeleton />
  if (!payment) return <div className="page-container"><p>Payment not found</p></div>

  return (
    <div className="page-container max-w-3xl">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/payments" className="btn-ghost p-2"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="page-title">Payment Detail</h1>
            <p className="page-subtitle font-mono">{payment.receipt_number}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-secondary"><Printer size={18} /> Print Receipt</button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <span className="stat-label">Total Amount</span>
            <p className="text-xl font-bold">{formatCurrency(payment.total_amount)}</p>
          </div>
          <div>
            <span className="stat-label">Amount Paid</span>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(payment.amount_paid)}</p>
          </div>
          <div>
            <span className="stat-label">Balance</span>
            <p className={`text-xl font-bold ${payment.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(payment.balance)}
            </p>
          </div>
          <div>
            <span className="stat-label">Status</span>
            <p><span className={getStatusColor(payment.status)}>{payment.status}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Member Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-dark-500">Name:</span> <Link to={`/members/${payment.member}`} className="text-primary-600 font-medium">{payment.member_name}</Link></p>
            <p><span className="text-dark-500">ID:</span> {payment.member_id_display}</p>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-dark-500">Period:</span> {payment.month}/{payment.year}</p>
            <p><span className="text-dark-500">Due Date:</span> {formatDate(payment.due_date)}</p>
            <p><span className="text-dark-500">Payment Date:</span> {formatDate(payment.payment_date)}</p>
            <p><span className="text-dark-500">Method:</span> <span className="capitalize">{payment.payment_method?.replace('_', ' ')}</span></p>
            <p><span className="text-dark-500">Late Fee:</span> {formatCurrency(payment.late_fee)}</p>
            {payment.collected_by && <p><span className="text-dark-500">Collected By:</span> {payment.collected_by}</p>}
            {payment.remarks && <p><span className="text-dark-500">Remarks:</span> {payment.remarks}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
