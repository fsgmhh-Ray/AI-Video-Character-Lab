'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react'
import { useTaskProgress } from '@/hooks/useWebSocket'

interface TaskProgressProps {
  taskId: string
  userId: string
  initialProgress?: number
  initialStatus?: string
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

export default function TaskProgress({
  taskId,
  userId,
  initialProgress = 0,
  initialStatus = 'pending',
  onComplete,
  onError
}: TaskProgressProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [localProgress, setLocalProgress] = useState(initialProgress)
  const [localStatus, setLocalStatus] = useState(initialStatus)
  
  const { progress, status, message, error, isConnected } = useTaskProgress(taskId, userId)

  // 同步WebSocket状态到本地状态
  useEffect(() => {
    if (progress !== undefined) {
      setLocalProgress(progress)
    }
    if (status) {
      setLocalStatus(status)
    }
  }, [progress, status])

  // 处理任务完成
  useEffect(() => {
    if (status === 'completed' && onComplete) {
      onComplete({ taskId, progress: localProgress })
    }
  }, [status, onComplete, taskId, localProgress])

  // 处理任务失败
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // 模拟进度更新（当WebSocket未连接时）
  useEffect(() => {
    if (!isConnected && localStatus === 'processing' && !isPaused) {
      const interval = setInterval(() => {
        setLocalProgress(prev => {
          if (prev < 95) {
            return prev + Math.random() * 5
          }
          return prev
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isConnected, localStatus, isPaused])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'paused':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'processing':
        return <Clock className="w-5 h-5" />
      case 'failed':
        return <AlertCircle className="w-5 h-5" />
      case 'paused':
        return <Pause className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'processing':
        return '处理中'
      case 'failed':
        return '失败'
      case 'paused':
        return '已暂停'
      default:
        return '等待中'
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      setLocalStatus('paused')
    } else {
      setLocalStatus('processing')
    }
  }

  const estimatedTime = localStatus === 'processing' && !isPaused 
    ? Math.max(0, Math.ceil((100 - localProgress) / 2)) // 简单估算
    : 0

  return (
    <div className="space-y-4">
      {/* 状态指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(localStatus)}
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(localStatus)}`}>
            {getStatusText(localStatus)}
          </span>
          
          {/* WebSocket连接状态 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? '实时连接' : '离线模式'}
            </span>
          </div>
        </div>
        
        {/* 操作按钮 */}
        {localStatus === 'processing' && (
          <button
            onClick={togglePause}
            className="btn-secondary text-sm"
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? '继续' : '暂停'}
          </button>
        )}
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">生成进度</span>
          <span className="text-gray-900 font-medium">{Math.round(localProgress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              localStatus === 'completed' ? 'bg-green-500' :
              localStatus === 'failed' ? 'bg-red-500' :
              localStatus === 'paused' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${localProgress}%` }}
          />
        </div>
      </div>

      {/* 状态消息 */}
      {message && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {message}
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* 预计时间 */}
      {estimatedTime > 0 && (
        <div className="text-sm text-gray-500">
          预计剩余时间：约 {estimatedTime} 分钟
        </div>
      )}

      {/* 任务ID */}
      <div className="text-xs text-gray-400">
        任务ID: {taskId}
      </div>
    </div>
  )
} 