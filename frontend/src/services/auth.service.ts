import api from './api'
import type { ApiResponse, AuthResponse, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/accounts/auth/login/', { email, password })
    return data.data
  },

  async register(payload: {
    email: string
    full_name: string
    password: string
    confirm_password: string
    phone_number?: string
  }): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/accounts/auth/register/', payload)
    return data.data
  },

  async logout(refresh?: string): Promise<void> {
    await api.post('/accounts/auth/logout/', { refresh })
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/accounts/auth/profile/')
    return data.data
  },

  async updateProfile(payload: FormData | Partial<User>): Promise<User> {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    const { data } = await api.patch<ApiResponse<User>>('/accounts/auth/update_profile/', payload, { headers })
    return data.data
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.post('/accounts/auth/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/accounts/auth/forgot_password/', { email })
  },

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    await api.post('/accounts/auth/reset_password/', {
      token,
      password,
      confirm_password: confirmPassword,
    })
  },
}
