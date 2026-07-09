import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: '#0d0d0d',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: '52px',
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <span
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 800,
              fontSize: '0.875rem',
              letterSpacing: '0.08em',
              color: '#c8f135',
            }}
          >
            GYM TRACKER
          </span>
        </div>

        {/* Left spacer on desktop */}
        <div className="hidden lg:block" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggle}
            className="btn-ghost"
            style={{ padding: '0.375rem' }}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark
              ? <Sun size={15} strokeWidth={1.75} />
              : <Moon size={15} strokeWidth={1.75} />
            }
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* User */}
          <button
            id="user-menu-btn"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 rounded px-2 py-1 transition-colors"
            style={{ color: '#888' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(200,241,53,0.12)', color: '#c8f135', fontFamily: 'Barlow, sans-serif' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-xs font-medium" style={{ color: '#ccc' }}>
              {user?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown size={12} />
          </button>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '0.375rem', color: '#555' }}
            title="Logout"
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
