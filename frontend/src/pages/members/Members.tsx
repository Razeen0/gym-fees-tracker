import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { membersService } from '@/services/members.service'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { motion } from 'framer-motion'
import { Plus, UserCheck, UserX, Users } from 'lucide-react'
import { formatDate, getStatusColor } from '@/utils/format'
import type { Member } from '@/types'

export default function Members() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter],
    queryFn: () =>
      membersService.list({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        page_size: 20,
      }),
  })

  const { data: stats } = useQuery({
    queryKey: ['member-stats'],
    queryFn: membersService.getStats,
  })

  const columns: Column<Member>[] = [
    {
      key: 'member_id',
      header: 'Member ID',
      render: (m) => (
        <Link to={`/members/${m.id}`} className="font-mono text-xs text-primary-600 hover:text-primary-700">
          {m.member_id}
        </Link>
      ),
    },
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      render: (m) => (
        <Link to={`/members/${m.id}`} className="font-medium text-dark-900 dark:text-white hover:text-primary-600">
          {m.full_name}
        </Link>
      ),
    },
    { key: 'gender', header: 'Gender', render: (m) => <span className="capitalize">{m.gender}</span> },
    { key: 'phone_number', header: 'Phone' },
    { key: 'plan_name', header: 'Plan' },
    {
      key: 'monthly_fee',
      header: 'Fee',
      render: (m) => `₹${m.monthly_fee?.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <span className={getStatusColor(m.status)}>{m.status}</span>,
    },
    {
      key: 'join_date',
      header: 'Joined',
      render: (m) => formatDate(m.join_date),
    },
  ]

  const statCards = [
    { label: 'Total', value: stats?.total || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Active', value: stats?.active || 0, icon: UserCheck, color: 'text-emerald-600' },
    { label: 'Expired', value: stats?.expired || 0, icon: UserX, color: 'text-red-600' },
    { label: 'Suspended', value: stats?.suspended || 0, icon: UserX, color: 'text-amber-600' },
  ]

  if (isLoading) return <PageSkeleton />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage all gym members</p>
        </div>
        <Link to="/members/add" className="btn-primary">
          <Plus size={18} /> Add Member
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{s.label}</span>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'active', 'inactive', 'suspended', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        searchable
        onSearch={setSearch}
        searchValue={search}
        totalCount={data?.count}
        onSort={() => {}}
      />
    </div>
  )
}
