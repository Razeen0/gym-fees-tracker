import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Dumbbell,
  X,
  Menu,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members',       icon: Users,           label: 'Members'   },
  { to: '/plans',         icon: Dumbbell,        label: 'Plans'     },
  { to: '/payments',      icon: CreditCard,      label: 'Payments'  },
  { to: '/reports',       icon: BarChart3,       label: 'Reports'   },
  { to: '/notifications', icon: Bell,            label: 'Alerts'    },
  { to: '/settings',      icon: Settings,        label: 'Settings'  },
]

export function Sidebar() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden btn-ghost p-2"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-60',
          'transform transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{
          background: '#0d0d0d',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center rounded"
            style={{ background: '#c8f135' }}
          >
            <Dumbbell size={16} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span
              className="block text-sm font-display font-800 tracking-wider"
              style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, color: '#ffffff', letterSpacing: '0.06em' }}
            >
              GYM
            </span>
            <span
              className="block text-xs tracking-widest"
              style={{ color: '#555', letterSpacing: '0.14em', fontSize: '0.6rem' }}
            >
              TRACKER PRO
            </span>
          </div>
        </div>

        {/* Nav Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3">
          <p className="section-title px-2 mb-2" style={{ fontSize: '0.6rem', letterSpacing: '0.12em' }}>
            Navigation
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn('sidebar-link', isActive && 'sidebar-link-active')
                }
              >
                <item.icon size={15} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User footer */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: 'rgba(200,241,53,0.12)', color: '#c8f135', fontFamily: 'Barlow, sans-serif' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#e0e0e0' }}>
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs capitalize" style={{ color: '#555', fontSize: '0.65rem' }}>
                {user?.role || 'member'}
              </p>
            </div>
            <Zap size={12} style={{ color: '#c8f135', opacity: 0.6 }} />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
