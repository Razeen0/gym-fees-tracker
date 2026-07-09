import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    full_name: string
    password: string
    confirm_password: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authService
        .getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.clear()
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password)
    localStorage.setItem('access_token', response.access)
    localStorage.setItem('refresh_token', response.refresh)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: {
    email: string
    full_name: string
    password: string
    confirm_password: string
  }) => {
    const response = await authService.register(payload)
    localStorage.setItem('access_token', response.access)
    localStorage.setItem('refresh_token', response.refresh)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await authService.logout(refresh || undefined)
    } catch {
      // ignore logout errors
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
