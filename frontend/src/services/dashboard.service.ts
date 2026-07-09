import api from './api'
import type {
  ApiResponse,
  DashboardStats,
  Member,
  PaymentMethodDistribution,
  RevenueChartData,
} from '@/types'

export const dashboardService = {
  async getOverview(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/overview/')
    return data.data
  },

  async getRevenueChart(year?: number): Promise<RevenueChartData[]> {
    const { data } = await api.get<ApiResponse<RevenueChartData[]>>('/dashboard/revenue_chart/', {
      params: { year },
    })
    return data.data
  },

  async getRecentPayments(): Promise<Partial<Payment>[]> {
    const { data } = await api.get<ApiResponse<Partial<Payment>[]>>('/dashboard/recent_payments/')
    return data.data
  },

  async getMembershipGrowth(year?: number): Promise<{ month: number; new_members: number }[]> {
    const { data } = await api.get<ApiResponse<{ month: number; new_members: number }[]>>(
      '/dashboard/membership_growth/',
      { params: { year } },
    )
    return data.data
  },

  async getPaymentMethodDistribution(month?: number, year?: number): Promise<PaymentMethodDistribution[]> {
    const { data } = await api.get<ApiResponse<PaymentMethodDistribution[]>>(
      '/dashboard/payment_method_distribution/',
      { params: { month, year } },
    )
    return data.data
  },

  async getUpcomingRenewals(): Promise<Partial<Member>[]> {
    const { data } = await api.get<ApiResponse<Partial<Member>[]>>('/dashboard/upcoming_renewals/')
    return data.data
  },
}
