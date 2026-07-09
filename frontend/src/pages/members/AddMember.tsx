import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { membersService } from '@/services/members.service'
import { plansService } from '@/services/plans.service'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AddMember() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    gender: 'male',
    date_of_birth: '',
    phone_number: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    membership_plan: '',
    membership_start_date: '',
    membership_end_date: '',
    monthly_fee: '',
    discount: '0',
    discount_type: 'percentage',
    notes: '',
    status: 'active',
  })

  const { data: plansData } = useQuery({
    queryKey: ['active-plans'],
    queryFn: plansService.listActive,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const plan = plansData?.find((p) => p.id === planId)
    setForm((prev) => ({
      ...prev,
      membership_plan: planId,
      monthly_fee: plan ? String(plan.effective_price) : prev.monthly_fee,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await membersService.create({
        ...form,
        monthly_fee: parseFloat(form.monthly_fee) || 0,
        discount: parseFloat(form.discount) || 0,
      })
      toast.success('Member added successfully')
      navigate('/members')
    } catch {
      toast.error('Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-4">
            <Link to="/members" className="btn-ghost p-2">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="page-title">Add New Member</h1>
              <p className="page-subtitle">Register a new gym member</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="card max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Personal Information</h3>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Emergency Contact Name</label>
              <input type="text" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Emergency Contact Phone</label>
              <input type="tel" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} className="input" />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 mt-4">Address</h3>
            </div>
            <div className="md:col-span-2">
              <label className="label">Address Line 1</label>
              <input type="text" name="address_line1" value={form.address_line1} onChange={handleChange} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address Line 2</label>
              <input type="text" name="address_line2" value={form.address_line2} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} className="input" />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 mt-4">Membership Details</h3>
            </div>
            <div>
              <label className="label">Membership Plan</label>
              <select name="membership_plan" value={form.membership_plan} onChange={handlePlanChange} className="input">
                <option value="">Select Plan</option>
                {plansData?.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ₹{plan.effective_price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Monthly Fee *</label>
              <input type="number" name="monthly_fee" value={form.monthly_fee} onChange={handleChange} className="input" required min="0" step="0.01" />
            </div>
            <div>
              <label className="label">Discount</label>
              <div className="flex gap-2">
                <input type="number" name="discount" value={form.discount} onChange={handleChange} className="input" min="0" step="0.01" />
                <select name="discount_type" value={form.discount_type} onChange={handleChange} className="input w-32">
                  <option value="percentage">%</option>
                  <option value="fixed">₹</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Membership Start Date</label>
              <input type="date" name="membership_start_date" value={form.membership_start_date} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Membership End Date</label>
              <input type="date" name="membership_end_date" value={form.membership_end_date} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-dark-200 dark:border-dark-700">
            <Link to="/members" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
