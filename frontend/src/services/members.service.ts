import api from './api'
import type { ApiResponse, Member, MemberStats, PaginatedResponse } from '@/types'

export const membersService = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Member>> {
    const { data } = await api.get<PaginatedResponse<Member>>('/members/', { params })
    return data
  },

  async get(id: string): Promise<Member> {
    const { data } = await api.get<ApiResponse<Member>>(`/members/${id}/`)
    return data.data
  },

  async create(payload: FormData | Record<string, unknown>): Promise<Member> {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    const { data } = await api.post<ApiResponse<Member>>('/members/', payload, { headers })
    return data.data
  },

  async update(id: string, payload: FormData | Record<string, unknown>): Promise<Member> {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    const { data } = await api.patch<ApiResponse<Member>>(`/members/${id}/`, payload, { headers })
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/members/${id}/`)
  },

  async updateStatus(id: string, status: string): Promise<Member> {
    const { data } = await api.patch<ApiResponse<Member>>(`/members/${id}/status/`, { status })
    return data.data
  },

  async suspend(id: string): Promise<Member> {
    const { data } = await api.post<ApiResponse<Member>>(`/members/${id}/suspend/`)
    return data.data
  },

  async activate(id: string): Promise<Member> {
    const { data } = await api.post<ApiResponse<Member>>(`/members/${id}/activate/`)
    return data.data
  },

  async renew(id: string, planId?: string): Promise<Member> {
    const { data } = await api.post<ApiResponse<Member>>(`/members/${id}/renew/`, {
      membership_plan_id: planId,
    })
    return data.data
  },

  async bulkAction(memberIds: string[], action: string): Promise<void> {
    await api.post('/members/bulk_action/', { member_ids: memberIds, action })
  },

  async getStats(): Promise<MemberStats> {
    const { data } = await api.get<ApiResponse<MemberStats>>('/members/stats/')
    return data.data
  },
}
