import api from './api'
import type { ApiResponse, GymSettings } from '@/types'

export const settingsService = {
  async get(): Promise<GymSettings> {
    const { data } = await api.get<ApiResponse<GymSettings>>('/settings/gym/1/')
    return data.data
  },

  async update(payload: Partial<GymSettings>): Promise<GymSettings> {
    const { data } = await api.patch<ApiResponse<GymSettings>>('/settings/gym/1/', payload)
    return data.data
  },
}
