import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  // 用户登录
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials)
    return response.data
  },

  // 用户注册
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await apiClient.post('/api/v1/auth/register', userData)
    return response.data
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/auth/me')
    return response.data
  },

  // 刷新token
  refreshToken: async () => {
    const response = await apiClient.post('/api/v1/auth/refresh')
    return response.data
  },

  // 用户登出
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout')
    return response.data
  },
}

// 角色管理API
export const characterAPI = {
  // 获取角色列表
  getCharacters: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/api/v1/characters', { params })
    return response.data
  },

  // 获取单个角色
  getCharacter: async (id: string) => {
    const response = await apiClient.get(`/api/v1/characters/${id}`)
    return response.data
  },

  // 创建角色
  createCharacter: async (characterData: { name: string; description?: string; metadata?: any }) => {
    const response = await apiClient.post('/api/v1/characters', characterData)
    return response.data
  },

  // 更新角色
  updateCharacter: async (id: string, characterData: { name?: string; description?: string; metadata?: any }) => {
    const response = await apiClient.put(`/api/v1/characters/${id}`, characterData)
    return response.data
  },

  // 删除角色
  deleteCharacter: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/characters/${id}`)
    return response.data
  },
}

// 文件上传API
export const uploadAPI = {
  // 上传角色图片
  uploadCharacterImages: async (characterId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await apiClient.post(
      `/api/v1/upload/character/${characterId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log('Upload progress:', percentCompleted)
        },
      }
    )
    return response.data
  },

  // 删除角色图片
  deleteCharacterImage: async (characterId: string, imageId: string) => {
    const response = await apiClient.delete(`/api/v1/upload/character/${characterId}/images/${imageId}`)
    return response.data
  },

  // 增强角色一致性
  enhanceCharacterConsistency: async (characterId: string) => {
    const response = await apiClient.post(`/api/v1/upload/character/${characterId}/enhance`)
    return response.data
  },
}

// 视频生成API
export const videoAPI = {
  // 创建视频生成任务
  createVideoTask: async (taskData: {
    character_id: string
    script: string
    duration: number
    style: string
    quality: string
  }) => {
    const response = await apiClient.post('/api/v1/videos/generate', taskData)
    return response.data
  },

  // 获取视频任务列表
  getVideoTasks: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/api/v1/videos/tasks', { params })
    return response.data
  },

  // 获取单个视频任务
  getVideoTask: async (taskId: string) => {
    const response = await apiClient.get(`/api/v1/videos/tasks/${taskId}`)
    return response.data
  },

  // 获取生成的视频列表
  getVideos: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/api/v1/videos', { params })
    return response.data
  },

  // 下载视频
  downloadVideo: async (videoId: string) => {
    const response = await apiClient.get(`/api/v1/videos/${videoId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}

// 用户管理API
export const userAPI = {
  // 获取用户统计信息
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/v1/users/dashboard/stats')
    return response.data
  },

  // 获取用户活动记录
  getRecentActivity: async (params?: { limit?: number }) => {
    const response = await apiClient.get('/api/v1/users/dashboard/activity', { params })
    return response.data
  },

  // 更新用户资料
  updateProfile: async (profileData: { username?: string; email?: string }) => {
    const response = await apiClient.put('/api/v1/users/profile', profileData)
    return response.data
  },

  // 更改密码
  changePassword: async (passwordData: { current_password: string; new_password: string }) => {
    const response = await apiClient.put('/api/v1/users/password', passwordData)
    return response.data
  },
}

// 错误处理工具
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '发生未知错误，请重试'
}

// 导出默认实例
export default apiClient 