import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'

/* ── Color palette ─────────────────────────── */
const ACCENT      = '#c8f135'
const MUTED_BAR   = '#2a2a2a'
const GRID_COLOR  = 'rgba(255,255,255,0.04)'
const AXIS_COLOR  = '#444'
const TOOLTIP_STYLE = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '4px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  fontSize: '12px',
  color: '#e0e0e0',
}
const PIE_COLORS  = [ACCENT, '#60a5fa', '#f59e0b', '#f87171', '#a78bfa']

/* ── Motion variants ───────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

/* ── Stat card config ──────────────────────── */
const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']

function StatCard({
  label, value, icon: Icon, accent, delta,
}: {
  label: string; value: string | number; icon: React.ElementType; accent: string; delta?: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="card"
      style={{ padding: '1.25rem' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="stat-label">{label}</p>
        <div
          className="w-7 h-7 flex items-center justify-center rounded"
          style={{ background: `${accent}18` }}
        >
          <Icon size={13} style={{ color: accent }} strokeWidth={2} />
        </div>
      </div>
      <p className="stat-value">{value}</p>
      {delta && (
        <p className="stat-change flex items-center gap-1 mt-2" style={{ color: '#c8f135' }}>
          <ArrowUpRight size={11} />
          {delta}
        </p>
      )}
    </motion.div>
  )
}

/* ── Section header ────────────────────────── */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3
        style={{
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          fontSize: '0.9375rem',
          color: '#ffffff',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      {subtitle && <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>{subtitle}</p>}
    </div>
  )
}

/* ── Dashboard ─────────────────────────────── */
export default function Dashboard() {
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const { data: overview,         isLoading: loadingOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn:  dashboardService.getOverview,
  })
  const { data: revenueChart }    = useQuery({
    queryKey: ['revenue-chart', currentYear],
    queryFn:  () => dashboardService.getRevenueChart(currentYear),
  })
  const { data: recentPayments }  = useQuery({
    queryKey: ['recent-payments'],
    queryFn:  dashboardService.getRecentPayments,
  })
  const { data: paymentMethods }  = useQuery({
    queryKey: ['payment-methods', currentMonth, currentYear],
    queryFn:  () => dashboardService.getPaymentMethodDistribution(currentMonth, currentYear),
  })
  const { data: membershipGrowth } = useQuery({
    queryKey: ['membership-growth', currentYear],
    queryFn:  () => dashboardService.getMembershipGrowth(currentYear),
  })

  const stats = [
    { label: 'Total Members',     value: overview?.members.total        || 0,                           icon: Users,         accent: '#60a5fa' },
    { label: 'Active Members',    value: overview?.members.active       || 0,                           icon: UserCheck,     accent: '#4ade80' },
    { label: 'Monthly Revenue',   value: formatCurrency(overview?.monthly_revenue || 0),                icon: TrendingUp,    accent: ACCENT    },
    { label: 'Pending Payments',  value: overview?.payments.pending_count || 0,                         icon: AlertTriangle, accent: '#fbbf24' },
    { label: "Today's Collection",value: formatCurrency(overview?.today?.collections || 0),             icon: CreditCard,    accent: '#a78bfa' },
    { label: 'Expired Members',   value: overview?.members.expired      || 0,                           icon: UserX,         accent: '#f87171' },
  ]

  return (
    <div className="page-container animate-fade-in">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6"
      >
        {loadingOverview
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map(s => <StatCard key={s.label} {...s} />)
        }
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Revenue bar chart — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card lg:col-span-3"
        >
          <SectionHeader title="Revenue Overview" subtitle={`${currentYear} monthly breakdown`} />
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} barGap={3}>
                <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={m => MONTHS[m - 1]}
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 11, fill: '#555' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 11, fill: '#555' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="collected" fill={ACCENT}    radius={[3,3,0,0]} maxBarSize={20} name="Collected" />
                <Bar dataKey="pending"   fill={MUTED_BAR} radius={[3,3,0,0]} maxBarSize={20} name="Pending"   />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: 2, background: ACCENT }} />
              <span style={{ fontSize: '0.7rem', color: '#666' }}>Collected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: 2, background: MUTED_BAR }} />
              <span style={{ fontSize: '0.7rem', color: '#666' }}>Pending</span>
            </div>
          </div>
        </motion.div>

        {/* Payment methods donut — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2"
        >
          <SectionHeader title="Payment Methods" subtitle={`Month ${currentMonth}`} />
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {paymentMethods?.map((_: unknown, idx: number) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {paymentMethods?.map((p: { method: string; total: number }, idx: number) => (
              <div key={p.method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#777', textTransform: 'capitalize' }}>
                    {p.method.replace('_', ' ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#ccc', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatCurrency(p.total)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent payments table — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card lg:col-span-3"
          style={{ padding: '1.25rem' }}
        >
          <SectionHeader title="Recent Payments" subtitle="Latest 10 transactions" />
          <div className="overflow-x-auto -mx-1">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Receipt</th>
                  <th className="table-header">Member</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments?.map((p: Record<string, unknown>) => (
                  <tr
                    key={p.id as string}
                    className="group transition-colors"
                    style={{ cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td
                      className="table-cell"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        color: '#555',
                      }}
                    >
                      {p.receipt_number as string}
                    </td>
                    <td className="table-cell" style={{ color: '#e0e0e0', fontWeight: 500 }}>
                      {p.member_name as string}
                    </td>
                    <td
                      className="table-cell"
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#ccc' }}
                    >
                      {formatCurrency(p.amount as number)}
                    </td>
                    <td className="table-cell" style={{ textTransform: 'capitalize' }}>
                      {p.payment_method as string}
                    </td>
                    <td className="table-cell">
                      <span className={p.status === 'paid' ? 'badge badge-success' : 'badge badge-warning'}>
                        {p.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentPayments?.length && (
                  <tr>
                    <td colSpan={5} className="table-cell text-center" style={{ color: '#444', padding: '2rem' }}>
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Membership growth area chart — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2"
        >
          <SectionHeader title="Member Growth" subtitle={`${currentYear} new registrations`} />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membershipGrowth}>
                <defs>
                  <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={ACCENT} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} strokeDasharray="0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={m => MONTHS[m - 1]}
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 11, fill: '#555' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 11, fill: '#555' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area
                  type="monotone"
                  dataKey="new_members"
                  stroke={ACCENT}
                  strokeWidth={1.5}
                  fill="url(#accentGrad)"
                  dot={{ fill: ACCENT, r: 3, strokeWidth: 0 }}
                  name="New Members"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
