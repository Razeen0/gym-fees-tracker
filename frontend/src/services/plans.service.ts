import api from './api'
import type { ApiResponse, MembershipPlan, PaginatedResponse } from '@/types'

export const plansService = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<MembershipPlan>> {
    const { data } = await api.get<PaginatedResponse<MembershipPlan>>('/plans/', { params })
    return data
  },

  async get(id: string): Promise<MembershipPlan> {
    const { data } = await api.get<ApiResponse<MembershipPlan>>(`/plans/${id}/`)
    return data.data
  },

  async create(payload: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const { data } = await api.post<ApiResponse<MembershipPlan>>('/plans/', payload)
    return data.data
  },

  async update(id: string, payload: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const { data } = await api.patch<ApiResponse<MembershipPlan>>(`/plans/${id}/`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/plans/${id}/`)
  },

  async toggleStatus(id: string): Promise<MembershipPlan> {
    const { data } = await api.post<ApiResponse<MembershipPlan>>(`/plans/${id}/toggle_status/`)
    return data.data
  },

  async listActive(): Promise<MembershipPlan[]> {
    const { data } = await api.get<ApiResponse<MembershipPlan[]>>('/plans/active/')
    return data.data
  },
}
