import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { membersService } from '@/services/members.service'
import { paymentsService } from '@/services/payments.service'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Trash2, RefreshCw, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/format'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [renewing, setRenewing] = useState(false)

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersService.get(id!),
    enabled: !!id,
  })

  const { data: payments } = useQuery({
    queryKey: ['member-payments', id],
    queryFn: () => paymentsService.getMemberPayments(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => membersService.delete(id!),
    onSuccess: () => {
      toast.success('Member deleted')
      navigate('/members')
    },
    onError: () => toast.error('Failed to delete member'),
  })

  const handleRenew = async () => {
    setRenewing(true)
    try {
      const result = await membersService.renew(id!)
      queryClient.invalidateQueries({ queryKey: ['member', id] })
      toast.success(`Membership renewed! New end date: ${result.membership_end_date}`)
    } catch {
      toast.error('Failed to renew membership')
    } finally {
      setRenewing(false)
    }
  }

  if (isLoading) return <PageSkeleton />
  if (!member) return <div className="page-container"><p>Member not found</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/members" className="btn-ghost p-2"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="page-title">{member.full_name}</h1>
            <p className="page-subtitle">{member.member_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => membersService.activate(id!).then(() => { queryClient.invalidateQueries(); toast.success('Member activated') }).catch(() => toast.error('Failed'))} className="btn-secondary">Activate</button>
          <button onClick={() => membersService.suspend(id!).then(() => { queryClient.invalidateQueries(); toast.success('Member suspended') }).catch(() => toast.error('Failed'))} className="btn-secondary">Suspend</button>
          <button onClick={handleRenew} disabled={renewing} className="btn-secondary">
            <RefreshCw size={16} className={renewing ? 'animate-spin' : ''} /> Renew
          </button>
          <Link to={`/members/${id}/edit`} className="btn-secondary"><Edit3 size={16} /> Edit</Link>
          <button onClick={() => { if (confirm('Delete this member?')) deleteMutation.mutate() }} className="btn-danger"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-dark-900 dark:text-white">Personal Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-dark-400" /> {member.phone_number}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-dark-400" /> {member.email || '-'}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-dark-400" /> {[member.city, member.state].filter(Boolean).join(', ') || '-'}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-dark-400" /> Joined {formatDate(member.join_date)}
            </div>
            <div className="pt-3 border-t border-dark-200 dark:border-dark-700">
              <span className="label">Gender</span>
              <p className="capitalize">{member.gender}</p>
            </div>
            <div>
              <span className="label">Status</span>
              <span className={getStatusColor(member.status)}>{member.status}</span>
            </div>
            {member.date_of_birth && (
              <div>
                <span className="label">Date of Birth</span>
                <p>{formatDate(member.date_of_birth)}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-dark-900 dark:text-white">Membership Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="label">Plan</span>
              <p className="font-medium">{member.plan_details?.name || member.plan_name || '-'}</p>
            </div>
            <div>
              <span className="label">Monthly Fee</span>
              <p className="font-medium">{formatCurrency(member.monthly_fee)}</p>
            </div>
            <div>
              <span className="label">Effective Fee</span>
              <p className="font-medium text-emerald-600">{formatCurrency(member.effective_fee)}</p>
            </div>
            <div>
              <span className="label">Discount</span>
              <p>{member.discount}{member.discount_type === 'percentage' ? '%' : '₹'}</p>
            </div>
            <div>
              <span className="label">Membership Start</span>
              <p>{formatDate(member.membership_start_date)}</p>
            </div>
            <div>
              <span className="label">Membership End</span>
              <p className={member.is_membership_expired ? 'text-red-600 font-medium' : ''}>
                {formatDate(member.membership_end_date)}
                {member.days_until_expiry !== null && member.days_until_expiry !== undefined && (
                  <span className="text-xs ml-2 text-dark-400">
                    ({member.days_until_expiry > 0 ? `${member.days_until_expiry} days left` : 'Expired'})
                  </span>
                )}
              </p>
            </div>
          </div>
          {member.notes && (
            <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
              <span className="label">Notes</span>
              <p className="text-sm text-dark-600 dark:text-dark-400">{member.notes}</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mt-6">
        <h3 className="text-lg font-semibold mb-4 text-dark-900 dark:text-white flex items-center gap-2">
          <CreditCard size={20} /> Payment History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="table-header">Receipt</th>
                <th className="table-header">Month</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {payments?.map((p) => (
                <tr key={p.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="table-cell font-mono text-xs">{p.receipt_number}</td>
                  <td className="table-cell">{p.month}/{p.year}</td>
                  <td className="table-cell">{formatCurrency(p.total_amount)}</td>
                  <td className="table-cell">{formatCurrency(p.amount_paid)}</td>
                  <td className="table-cell"><span className={getStatusColor(p.status)}>{p.status}</span></td>
                  <td className="table-cell">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && (
                <tr><td colSpan={6} className="text-center py-8 text-dark-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
