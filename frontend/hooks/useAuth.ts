import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/services/api'

interface User {
  id: string
  email: string
  username: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 检查用户是否已登录
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login({ email, password })
      
      // 存储token和用户信息
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.response?.data?.detail || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.register({ username, email, password })
      
      // 注册成功后自动登录
      await login(email, password)
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw new Error(error.response?.data?.detail || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      await logout()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 受保护的路由Hook
export function useProtectedRoute(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
} 