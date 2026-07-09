import api from './api'
import type { ApiResponse, Payment, PaginatedResponse } from '@/types'

export const paymentsService = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get<PaginatedResponse<Payment>>('/payments/', { params })
    return data
  },

  async get(id: string): Promise<Payment> {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}/`)
    return data.data
  },

  async create(payload: Partial<Payment>): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>('/payments/', payload)
    return data.data
  },

  async update(id: string, payload: Partial<Payment>): Promise<Payment> {
    const { data } = await api.patch<ApiResponse<Payment>>(`/payments/${id}/`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payments/${id}/`)
  },

  async bulkCreate(payload: {
    member_ids: string[]
    month: number
    year: number
    due_date: string
    remarks?: string
  }): Promise<void> {
    await api.post('/payments/bulk_create/', payload)
  },

  async getMemberPayments(memberId: string): Promise<Payment[]> {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments/member_payments/', {
      params: { member_id: memberId },
    })
    return data.data
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>(`/payments/${id}/update_status/`, { status, notes })
    return data.data
  },

  async getHistory(id: string): Promise<Payment[]> {
    const { data } = await api.get<ApiResponse<Payment[]>>(`/payments/${id}/history/`)
    return data.data
  },

  async getSummary(month?: number, year?: number): Promise<Payment> {
    const { data } = await api.get<ApiResponse<Payment>>('/payments/summary/', {
      params: { month, year },
    })
    return data.data
  },

  async markOverdue(): Promise<void> {
    await api.get('/payments/overdue/')
  },
}
