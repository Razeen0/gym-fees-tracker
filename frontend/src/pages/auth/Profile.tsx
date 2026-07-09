import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth.service'
import { motion } from 'framer-motion'
import { User, Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
  })
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await authService.updateProfile(form)
      updateUser(updated)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await authService.changePassword(
        passwordForm.old_password,
        passwordForm.new_password,
        passwordForm.confirm_new_password,
      )
      toast.success('Password changed')
      setPasswordForm({ old_password: '', new_password: '', confirm_new_password: '' })
    } catch {
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User size={40} className="text-primary-600" />
              )}
            </div>
            <button className="btn-ghost text-sm mx-auto">
              <Camera size={16} /> Change Photo
            </button>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mt-4">{user?.full_name}</h2>
            <p className="text-sm text-dark-500 dark:text-dark-400 capitalize">{user?.role}</p>
            <p className="text-sm text-dark-500 dark:text-dark-400">{user?.email}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={user?.email} className="input" disabled />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="input"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                  className="input"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" disabled={changingPassword} className="btn-primary">
                {changingPassword ? <Loader2 size={18} className="animate-spin" /> : null}
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
