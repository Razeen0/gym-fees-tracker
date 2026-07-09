export interface User {
  id: string
  email: string
  full_name: string
  phone_number: string
  role: 'admin' | 'owner' | 'receptionist'
  profile_photo: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  errors: ApiError[]
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  count: number
  total_pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
  data: T[]
  errors: ApiError[]
}

export interface ApiError {
  field: string | null
  message: string
}

export interface Member {
  id: string
  member_id: string
  full_name: string
  profile_photo: string | null
  gender: string
  date_of_birth: string | null
  age: number | null
  phone_number: string
  email: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  emergency_contact_name: string
  emergency_contact_phone: string
  join_date: string
  membership_plan: string | null
  plan_details: MembershipPlan | null
  membership_start_date: string | null
  membership_end_date: string | null
  monthly_fee: number
  discount: number
  discount_type: string
  effective_fee: number
  days_until_expiry: number | null
  is_membership_expired: boolean
  status: MemberStatus
  notes: string
  photo_id_proof: string | null
  plan_name?: string
  days_until_expiry?: number
  created_at: string
  updated_at: string
}

export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'expired'

export interface MembershipPlan {
  id: string
  name: string
  duration: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  duration_days: number
  price: number
  discounted_price: number | null
  effective_price: number
  benefits: string[]
  description: string
  is_popular: boolean
  is_active: boolean
  max_members: number
  sort_order: number
  member_count?: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  receipt_number: string
  member: string
  member_name: string
  member_id_display: string
  member_details?: Member
  amount: number
  due_amount: number
  late_fee: number
  discount_applied: number
  total_amount: number
  amount_paid: number
  balance: number
  payment_date: string
  due_date: string
  payment_method: PaymentMethod
  status: PaymentStatus
  month: number
  year: number
  remarks: string
  payment_reference: string
  is_partial_payment: boolean
  paid_by: string | null
  collected_by?: string
  history?: PaymentHistory[]
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentMethod = 'cash' | 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'wallet'

export interface PaymentHistory {
  id: string
  old_status: string
  new_status: string
  old_amount: number
  new_amount: number
  changed_by: string | null
  changed_by_name: string
  notes: string
  created_at: string
}

export interface DashboardStats {
  members: {
    total: number
    active: number
    expired: number
    suspended: number
    expiring_soon: number
  }
  payments: {
    total_amount: number
    total_collected: number
    pending_amount: number
    overdue_amount: number
    pending_count: number
  }
  today: {
    collections: number
    collection_count: number
    due_amount: number
  }
  monthly_revenue: number
  yearly_revenue: number
}

export interface RevenueChartData {
  month: number
  collected: number
  pending: number
}

export interface MemberStats {
  total: number
  active: number
  expired: number
  suspended: number
}

export interface Notification {
  id: string
  member: string | null
  member_name: string
  notification_type: string
  channel: string
  subject: string
  message: string
  status: string
  sent_at: string | null
  error_message: string
  created_at: string
}

export interface GymSettings {
  id: number
  gym_name: string
  gym_logo: string | null
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone_number: string
  email: string
  website: string
  currency: string
  currency_symbol: string
  timezone: string
  tax_percentage: number
  tax_name: string
  receipt_footer: string
  invoice_prefix: string
  late_fee_percentage: number
  due_reminder_days: number
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  user: string | null
  user_name: string
  action: string
  model_name: string
  object_id: string
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface ReportData {
  month: number
  year: number
  summary: {
    total_collected: number
    total_pending: number
    total_overdue: number
    paid_count: number
    pending_count: number
    overdue_count: number
    total_transactions: number
  }
  payment_methods: Array<{
    method: string
    total: number
    count: number
  }>
}

export interface PaymentMethodDistribution {
  method: string
  total: number
  count: number
}
