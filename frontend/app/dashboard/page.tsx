'use client'

import { useState, useEffect } from 'react'
import { Users, Video, Image, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalCharacters: number
  totalVideos: number
  totalImages: number
  processingTasks: number
  completedTasks: number
  failedTasks: number
}

interface RecentActivity {
  id: string
  type: 'character' | 'video' | 'upload'
  action: string
  timestamp: string
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCharacters: 0,
    totalVideos: 0,
    totalImages: 0,
    processingTasks: 0,
    completedTasks: 0,
    failedTasks: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 模拟数据
      const mockStats = {
        totalCharacters: 3,
        totalVideos: 12,
        totalImages: 24,
        processingTasks: 2,
        completedTasks: 8,
        failedTasks: 1
      }
      
      const mockActivity = [
        {
          id: '1',
          type: 'video',
          action: '视频生成完成',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'character',
          action: '角色图片上传',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'video',
          action: '开始生成视频',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'processing'
        }
      ]
      
      setStats(mockStats)
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'character':
        return <Users className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'upload':
        return <Image className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
          <p className="mt-2 text-gray-600">
            查看您的AI视频创作进度和统计数据
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 角色统计 */}
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总角色数</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCharacters}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/characters" className="text-sm text-blue-600 hover:text-blue-700">
                管理角色 →
              </Link>
            </div>
          </div>

          {/* 视频统计 */}
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总视频数</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalVideos}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/videos" className="text-sm text-purple-600 hover:text-purple-700">
                查看视频 →
              </Link>
            </div>
          </div>

          {/* 图片统计 */}
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总图片数</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalImages}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/characters" className="text-sm text-green-600 hover:text-green-700">
                管理图片 →
              </Link>
            </div>
          </div>
        </div>

        {/* 任务状态 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 任务统计 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">任务状态</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">处理中</span>
                </div>
                <span className="text-lg font-semibold text-blue-600">{stats.processingTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">已完成</span>
                </div>
                <span className="text-lg font-semibold text-green-600">{stats.completedTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">失败</span>
                </div>
                <span className="text-lg font-semibold text-red-600">{stats.failedTasks}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/videos" className="btn-primary w-full">
                查看所有任务
              </Link>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
            <div className="space-y-3">
              <Link href="/characters" className="btn-secondary w-full justify-center">
                <Users className="w-4 h-4 mr-2" />
                创建新角色
              </Link>
              
              <Link href="/videos" className="btn-primary w-full justify-center">
                <Video className="w-4 h-4 mr-2" />
                生成新视频
              </Link>
              
              <Link href="/characters" className="btn-secondary w-full justify-center">
                <Image className="w-4 h-4 mr-2" />
                上传角色图片
              </Link>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最近活动</h2>
            <Link href="/videos" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">还没有活动记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 使用提示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium">角色管理：</p>
              <p>上传多张角色图片以获得更好的特征向量，确保角色形象一致性</p>
            </div>
            <div>
              <p className="font-medium">视频生成：</p>
              <p>详细描述场景和对话内容，AI将根据您的描述生成高质量视频</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 