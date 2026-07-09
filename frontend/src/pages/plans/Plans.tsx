import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansService } from '@/services/plans.service'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, Loader2, Check, X } from 'lucide-react'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'
import type { MembershipPlan } from '@/types'
import { formatCurrency } from '@/utils/format'

export default function Plans() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MembershipPlan | null>(null)
  const [form, setForm] = useState({
    name: '', duration: 'monthly', price: '', discounted_price: '',
    description: '', benefits: '', is_popular: false,
  })
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.list({ page_size: 50 }),
  })

  const resetForm = () => {
    setForm({ name: '', duration: 'monthly', price: '', discounted_price: '', description: '', benefits: '', is_popular: false })
    setEditing(null)
  }

  const openEdit = (plan: MembershipPlan) => {
    setEditing(plan)
    setForm({
      name: plan.name,
      duration: plan.duration,
      price: String(plan.price),
      discounted_price: plan.discounted_price ? String(plan.discounted_price) : '',
      description: plan.description,
      benefits: plan.benefits?.join(', ') || '',
      is_popular: plan.is_popular,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        duration: form.duration,
        price: parseFloat(form.price),
        discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : null,
        description: form.description,
        benefits: form.benefits.split(',').map((b: string) => b.trim()).filter(Boolean),
        is_popular: form.is_popular,
      }
      if (editing) {
        await plansService.update(editing.id, payload)
        toast.success('Plan updated')
      } else {
        await plansService.create(payload)
        toast.success('Plan created')
      }
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setShowModal(false)
      resetForm()
    } catch {
      toast.error('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">Manage subscription plans</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary">
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`card relative ${plan.is_popular ? 'ring-2 ring-primary-500' : ''}`}
          >
            {plan.is_popular && (
              <span className="absolute -top-2 -right-2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                Popular
              </span>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">{plan.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(plan)} className="btn-ghost p-1.5"><Edit3 size={15} /></button>
                <button onClick={() => plansService.toggleStatus(plan.id).then(() => { queryClient.invalidateQueries(); toast.success('Plan toggled') }).catch(() => toast.error('Failed'))} className="btn-ghost p-1.5">
                  {plan.is_active ? <X size={15} className="text-red-500" /> : <Check size={15} className="text-emerald-500" />}
                </button>
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
              {formatCurrency(plan.effective_price)}
              {plan.discounted_price && (
                <span className="text-lg line-through text-dark-400 ml-2">{formatCurrency(plan.price)}</span>
              )}
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-400 capitalize mb-4">{plan.duration.replace('_', ' ')} &bull; {plan.duration_days} days</p>
            {plan.benefits?.length > 0 && (
              <ul className="space-y-2 mb-4">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            )}
            {plan.description && (
              <p className="text-sm text-dark-500 dark:text-dark-400">{plan.description}</p>
            )}
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
              {editing ? 'Edit Plan' : 'Add Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Plan Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Duration</label>
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half Yearly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required min="0" step="0.01" />
                </div>
                <div>
                  <label className="label">Discounted Price</label>
                  <input type="number" value={form.discounted_price} onChange={(e) => setForm({ ...form, discounted_price: e.target.value })} className="input" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="label">Benefits (comma separated)</label>
                <input type="text" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="input" placeholder="Free trainer, Towel service, etc." />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_popular" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="is_popular" className="text-sm">Mark as popular</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                  {editing ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
