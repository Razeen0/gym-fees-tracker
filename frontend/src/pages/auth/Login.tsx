import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Dumbbell, Zap, ArrowRight, Shield, BarChart3, Users } from 'lucide-react'

const features = [
  { icon: BarChart3, text: 'Real-time revenue analytics' },
  { icon: Users,     text: 'Member lifecycle management' },
  { icon: Shield,    text: 'Role-based access control' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Left Panel: Brand ── */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #111 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow orb */}
        <div
          className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded"
            style={{ background: '#c8f135' }}
          >
            <Dumbbell size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#fff',
                letterSpacing: '0.06em',
              }}
            >
              GYM TRACKER
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.6rem',
                color: '#555',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              ENTERPRISE PRO
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#c8f135' }}
            >
              <Zap size={11} fill="#c8f135" /> Membership Management
            </p>
            <h1
              className="mb-6 leading-none"
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                color: '#fff',
                letterSpacing: '-0.03em',
              }}
            >
              Run Your Gym.<br />
              <span style={{ color: '#c8f135' }}>Not Spreadsheets.</span>
            </h1>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '28rem' }}>
              Track every member, payment, and plan from a single dashboard built for serious gym operators.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 space-y-3"
          >
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded"
                  style={{ background: 'rgba(200,241,53,0.1)' }}
                >
                  <Icon size={13} style={{ color: '#c8f135' }} />
                </div>
                <span style={{ color: '#999', fontSize: '0.8125rem' }}>{text}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Bottom bar */}
        <div
          className="relative flex items-center justify-between text-xs"
          style={{ color: '#444' }}
        >
          <span>© 2025 Gym Tracker Pro</span>
          <span className="flex items-center gap-1">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            All systems operational
          </span>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[22rem]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 flex items-center justify-center rounded" style={{ background: '#c8f135' }}>
              <Dumbbell size={16} color="#0a0a0a" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
              GYM TRACKER
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="mb-1"
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 800,
                fontSize: '1.625rem',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: '#666', fontSize: '0.8125rem' }}>
              Sign in to your workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-3 py-2.5 rounded text-xs font-medium"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@gymname.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }} htmlFor="login-password">Password</label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.7rem', color: '#666', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c8f135')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#666')}
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost"
                  style={{ padding: '0.25rem', color: '#555' }}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: '42px' }}
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <ArrowRight size={15} />
              }
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center" style={{ fontSize: '0.75rem', color: '#555' }}>
            No account?{' '}
            <Link
              to="/register"
              style={{ color: '#c8f135', textDecoration: 'none', fontWeight: 600 }}
            >
              Create workspace
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
