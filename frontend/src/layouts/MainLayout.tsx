import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export function MainLayout() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Sidebar />
      <div className="lg:pl-60">
        <Navbar />
        <main className="min-h-[calc(100vh-52px)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
