import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency, formatMonth } from '@/utils/format'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { Download } from 'lucide-react'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Reports() {
  const { isDark } = useTheme()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-chart', year],
    queryFn: () => dashboardService.getRevenueChart(year),
  })

  const { data: growthData } = useQuery({
    queryKey: ['membership-growth', year],
    queryFn: () => dashboardService.getMembershipGrowth(year),
  })

  const { data: methodData } = useQuery({
    queryKey: ['payment-methods', month, year],
    queryFn: () => dashboardService.getPaymentMethodDistribution(month, year),
  })

  const monthlyRevenue = revenueData?.find((d) => d.month === month)
  const totalYearlyRevenue = revenueData?.reduce((sum, d) => sum + d.collected, 0) || 0

  if (isLoading) return <PageSkeleton />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analytics and business insights</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input w-32">
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{formatMonth(i + 1)}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input w-28">
            {[2024, 2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/reports/export/?type=payment&format=excel&month=${month}&year=${year}`}
             className="btn-secondary" target="_blank" rel="noopener noreferrer">
            <Download size={16} /> Export
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <span className="stat-label">Monthly Collected</span>
          <p className="stat-value text-emerald-600">{formatCurrency(monthlyRevenue?.collected || 0)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <span className="stat-label">Monthly Pending</span>
          <p className="stat-value text-amber-600">{formatCurrency(monthlyRevenue?.pending || 0)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <span className="stat-label">Yearly Revenue</span>
          <p className="stat-value">{formatCurrency(totalYearlyRevenue)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue ({year})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tickFormatter={(m) => formatMonth(m)} stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h3 className="text-lg font-semibold mb-4">Membership Growth ({year})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tickFormatter={(m) => formatMonth(m)} stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="new_members" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card max-w-lg mx-auto">
        <h3 className="text-lg font-semibold mb-4">Payment Methods ({formatMonth(month)} {year})</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={methodData} dataKey="total" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {methodData?.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {methodData?.map((p, idx) => (
            <div key={p.method} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="capitalize">{p.method.replace('_', ' ')}</span>
              </div>
              <span className="font-medium">{formatCurrency(p.total)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
