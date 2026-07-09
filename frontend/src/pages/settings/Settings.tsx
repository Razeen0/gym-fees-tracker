import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { GymSettings } from '@/types'

export default function Settings() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<GymSettings>>({})

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  })

  useEffect(() => {
    if (settings) {
      const f: Record<string, unknown> = {}
      const fields: (keyof GymSettings)[] = [
        'gym_name', 'address_line1', 'address_line2', 'city', 'state',
        'postal_code', 'country', 'phone_number', 'email', 'website',
        'currency', 'currency_symbol', 'timezone',
        'tax_percentage', 'tax_name', 'receipt_footer', 'invoice_prefix',
        'late_fee_percentage', 'due_reminder_days',
        'enable_email_notifications', 'enable_sms_notifications',
      ]
      fields.forEach((field) => {
        f[field] = settings[field] ?? ''
      })
      setForm(f as Partial<GymSettings>)
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const mutation = useMutation({
    mutationFn: async () => {
      await settingsService.update(form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  if (isLoading) return <PageSkeleton />

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your gym business</p>
        </div>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="label">Gym Name</label><input type="text" name="gym_name" value={(form.gym_name as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Phone</label><input type="tel" name="phone_number" value={(form.phone_number as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Email</label><input type="email" name="email" value={(form.email as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Website</label><input type="url" name="website" value={(form.website as string) || ''} onChange={handleChange} className="input" /></div>
            <div className="md:col-span-2"><label className="label">Address</label><input type="text" name="address_line1" value={(form.address_line1 as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">City</label><input type="text" name="city" value={(form.city as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">State</label><input type="text" name="state" value={(form.state as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Postal Code</label><input type="text" name="postal_code" value={(form.postal_code as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Country</label><input type="text" name="country" value={(form.country as string) || ''} onChange={handleChange} className="input" /></div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Financial Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="label">Currency</label><input type="text" name="currency" value={(form.currency as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Currency Symbol</label><input type="text" name="currency_symbol" value={(form.currency_symbol as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Timezone</label><input type="text" name="timezone" value={(form.timezone as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Tax Name</label><input type="text" name="tax_name" value={(form.tax_name as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Tax Percentage (%)</label><input type="number" name="tax_percentage" value={(form.tax_percentage as number) || 0} onChange={handleChange} className="input" step="0.01" /></div>
            <div><label className="label">Late Fee (%)</label><input type="number" name="late_fee_percentage" value={(form.late_fee_percentage as number) || 0} onChange={handleChange} className="input" step="0.01" /></div>
            <div><label className="label">Invoice Prefix</label><input type="text" name="invoice_prefix" value={(form.invoice_prefix as string) || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Due Reminder (days)</label><input type="number" name="due_reminder_days" value={(form.due_reminder_days as number) || 3} onChange={handleChange} className="input" /></div>
          </div>
          <div className="mt-4">
            <label className="label">Receipt Footer</label>
            <textarea name="receipt_footer" value={(form.receipt_footer as string) || ''} onChange={handleChange} className="input" rows={3} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="enable_email_notifications" checked={(form.enable_email_notifications as boolean) || false} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="enable_sms_notifications" checked={(form.enable_sms_notifications as boolean) || false} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm">Enable SMS Notifications</span>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
