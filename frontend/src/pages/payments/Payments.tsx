import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '@/services/payments.service'
import { membersService } from '@/services/members.service'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { motion } from 'framer-motion'
import { Plus, Loader2, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, formatMonth } from '@/utils/format'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Payment } from '@/types'

export default function Payments() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'paid',
    remarks: '',
  })

  const [bulkForm, setBulkForm] = useState({
    month: monthFilter,
    year: yearFilter,
    due_date: new Date().toISOString().split('T')[0],
    remarks: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search, statusFilter, monthFilter, yearFilter],
    queryFn: () =>
      paymentsService.list({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        month: monthFilter,
        year: yearFilter,
        page_size: 20,
      }),
  })

  const { data: summary } = useQuery({
    queryKey: ['payment-summary', monthFilter, yearFilter],
    queryFn: () => paymentsService.getSummary(monthFilter, yearFilter),
  })

  const { data: membersData } = useQuery({
    queryKey: ['members-basic'],
    queryFn: () => membersService.list({ page_size: 500, status: 'active' }),
  })

  const makePayment = useMutation({
    mutationFn: async () => {
      if (!selectedPayment) return
      await paymentsService.update(selectedPayment.id, {
        amount_paid: parseFloat(paymentForm.amount_paid) || 0,
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        status: paymentForm.status,
        remarks: paymentForm.remarks,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment recorded')
      setShowPaymentModal(false)
    },
    onError: () => toast.error('Failed to record payment'),
  })

  const handleBulkCreate = async () => {
    if (!membersData?.data || membersData.data.length === 0) {
      toast.error('No active members found')
      return
    }
    try {
      await paymentsService.bulkCreate({
        member_ids: membersData.data.map((m) => m.id),
        month: bulkForm.month,
        year: bulkForm.year,
        due_date: bulkForm.due_date,
        remarks: bulkForm.remarks,
      })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payments generated for all active members')
      setShowCreateModal(false)
    } catch {
      toast.error('Failed to generate payments')
    }
  }

  const columns: Column<Payment>[] = [
    {
      key: 'receipt_number',
      header: 'Receipt',
      render: (p) => (
        <Link to={`/payments/${p.id}`} className="font-mono text-xs text-primary-600 hover:text-primary-700">{p.receipt_number}</Link>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      sortable: true,
      render: (p) => (
        <Link to={`/members/${p.member}`} className="font-medium hover:text-primary-600">{p.member_name}</Link>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (p) => formatCurrency(p.total_amount),
    },
    {
      key: 'amount_paid',
      header: 'Paid',
      render: (p) => (
        <span className={p.amount_paid >= p.total_amount ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
          {formatCurrency(p.amount_paid)}
        </span>
      ),
    },
    {
      key: 'month',
      header: 'Month',
      render: (p) => `${formatMonth(p.month)} ${p.year}`,
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (p) => <span className="capitalize">{p.payment_method?.replace('_', ' ') || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <span className={getStatusColor(p.status)}>{p.status}</span>,
    },
    {
      key: 'payment_date',
      header: 'Date',
      render: (p) => formatDate(p.payment_date),
    },
    {
      key: 'actions',
      header: '',
      render: (p) =>
        p.status !== 'paid' && (
          <button
            onClick={() => { setSelectedPayment(p); setPaymentForm({ ...paymentForm, amount_paid: String(p.total_amount) }); setShowPaymentModal(true) }}
            className="btn-ghost p-1.5 text-primary-600"
          >
            <DollarSign size={16} />
          </button>
        ),
    },
  ]

  if (isLoading) return <PageSkeleton />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Manage monthly fee collections</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-secondary">
            <Plus size={18} /> Generate
          </button>
          <button onClick={() => paymentsService.markOverdue().then(() => { queryClient.invalidateQueries(); toast.success('Overdue updated') }).catch(() => {})} className="btn-secondary">
            Mark Overdue
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card"><span className="stat-label">Collected</span><p className="stat-value text-emerald-600">{formatCurrency(summary?.total_collected || 0)}</p></div>
        <div className="card"><span className="stat-label">Pending</span><p className="stat-value text-amber-600">{formatCurrency(summary?.total_pending || 0)}</p></div>
        <div className="card"><span className="stat-label">Overdue</span><p className="stat-value text-red-600">{formatCurrency(summary?.total_overdue || 0)}</p></div>
        <div className="card"><span className="stat-label">Total</span><p className="stat-value">{formatCurrency((summary?.total_collected || 0) + (summary?.total_pending || 0) + (summary?.total_overdue || 0))}</p></div>
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select value={monthFilter} onChange={(e) => { setMonthFilter(Number(e.target.value)); setPage(1) }} className="input w-32">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{formatMonth(i + 1)}</option>
          ))}
        </select>
        <select value={yearFilter} onChange={(e) => { setYearFilter(Number(e.target.value)); setPage(1) }} className="input w-28">
          {[2024, 2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {['', 'paid', 'pending', 'overdue', 'cancelled', 'refunded'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200'
            }`}
          >{s || 'All'}</button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        searchable
        onSearch={setSearch}
        searchValue={search}
        totalCount={data?.count}
        onSort={() => {}}
      />

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Generate Monthly Payments</h2>
            <p className="text-sm text-dark-500 mb-4">
              This will create payment records for all {membersData?.data?.length || 0} active members.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Month</label>
                  <select value={bulkForm.month} onChange={(e) => setBulkForm({ ...bulkForm, month: Number(e.target.value) })} className="input">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{formatMonth(i + 1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <select value={bulkForm.year} onChange={(e) => setBulkForm({ ...bulkForm, year: Number(e.target.value) })} className="input">
                    {[2024, 2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" value={bulkForm.due_date} onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Remarks (optional)</label>
                <input type="text" value={bulkForm.remarks} onChange={(e) => setBulkForm({ ...bulkForm, remarks: e.target.value })} className="input" placeholder="Monthly fee" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleBulkCreate} className="btn-primary"><Plus size={18} /> Generate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Record Payment</h2>
            <p className="text-sm text-dark-500 mb-6">
              {selectedPayment.member_name} - {formatMonth(selectedPayment.month)} {selectedPayment.year}
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="label">Total Amount</span><p className="text-lg font-bold">{formatCurrency(selectedPayment.total_amount)}</p></div>
                <div><span className="label">Balance</span><p className="text-lg font-bold text-red-600">{formatCurrency(selectedPayment.balance || selectedPayment.total_amount)}</p></div>
              </div>
              <div>
                <label className="label">Amount Paying</label>
                <input type="number" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })} className="input" step="0.01" min="0" />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} className="input">
                  <option value="cash">Cash</option><option value="upi">UPI</option><option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option><option value="net_banking">Net Banking</option><option value="wallet">Wallet</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input type="text" value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} className="input" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => makePayment.mutate()} disabled={makePayment.isPending} className="btn-primary">
                  {makePayment.isPending ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
