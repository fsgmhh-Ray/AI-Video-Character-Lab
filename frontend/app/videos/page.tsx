'use client'

import { useState, useEffect } from 'react'
import { Play, Plus, Clock, CheckCircle, AlertCircle, Video, X } from 'lucide-react'
import Link from 'next/link'
import TaskProgress from '@/components/TaskProgress'

interface VideoTask {
  id: string
  status: string
  progress: number
  estimated_time: number
  created_at: string
  script: string
  character_name: string
}

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  status: string
  created_at: string
}

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'tasks' | 'videos'>('generate')
  const [characters, setCharacters] = useState<any[]>([])
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [currentTask, setCurrentTask] = useState<VideoTask | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 模拟数据
      const mockCharacters = [
        { id: '1', name: '示例角色', description: '这是一个示例角色' }
      ]
      const mockTasks = [
        {
          id: '1',
          status: 'processing',
          progress: 65,
          estimated_time: 180,
          created_at: new Date().toISOString(),
          script: '欢迎来到AI视频生成平台...',
          character_name: '示例角色'
        }
      ]
      const mockVideos = [
        {
          id: '1',
          title: '示例视频',
          description: '这是一个示例视频',
          video_url: '/sample-video.mp4',
          thumbnail_url: '/sample-thumbnail.jpg',
          duration: 30,
          status: 'completed',
          created_at: new Date().toISOString()
        }
      ]
      
      setCharacters(mockCharacters)
      setVideoTasks(mockTasks)
      setVideos(mockVideos)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVideo = () => {
    // 模拟创建任务
    const newTask: VideoTask = {
      id: `task_${Date.now()}`,
      status: 'processing',
      progress: 0,
      estimated_time: 300,
      created_at: new Date().toISOString(),
      script: '正在生成视频...',
      character_name: '示例角色'
    }
    
    setVideoTasks(prev => [newTask, ...prev])
    setCurrentTask(newTask)
    setShowProgressModal(true)
    setActiveTab('tasks')
  }

  const handleTaskComplete = (result: any) => {
    // 任务完成后的处理
    console.log('Task completed:', result)
    setShowProgressModal(false)
    setCurrentTask(null)
    
    // 更新任务状态
    setVideoTasks(prev => prev.map(task => 
      task.id === result.taskId 
        ? { ...task, status: 'completed', progress: 100 }
        : task
    ))
  }

  const handleTaskError = (error: string) => {
    // 任务失败后的处理
    console.error('Task failed:', error)
    setShowProgressModal(false)
    setCurrentTask(null)
    
    // 更新任务状态
    if (currentTask) {
      setVideoTasks(prev => prev.map(task => 
        task.id === currentTask.id 
          ? { ...task, status: 'failed', progress: 0 }
          : task
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">视频生成</h1>
          <p className="mt-2 text-gray-600">
            基于您的角色和脚本，生成高质量的AI视频内容
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              生成视频
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              生成任务 ({videoTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'videos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              我的视频 ({videos.length})
            </button>
          </nav>
        </div>

        {/* 标签页内容 */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* 快速生成卡片 */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">快速生成视频</h2>
                <Link href="/characters" className="text-primary-600 hover:text-primary-700 text-sm">
                  管理角色 →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 角色选择 */}
                <div>
                  <label className="form-label">选择角色</label>
                  <select className="input-field">
                    <option value="">选择要使用的角色</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                  {characters.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      还没有角色？<Link href="/characters" className="text-primary-600 hover:underline">立即创建</Link>
                    </p>
                  )}
                </div>
                
                {/* 视频时长 */}
                <div>
                  <label className="form-label">视频时长</label>
                  <select className="input-field">
                    <option value="15">15秒</option>
                    <option value="30" selected>30秒</option>
                    <option value="60">1分钟</option>
                    <option value="120">2分钟</option>
                  </select>
                </div>
              </div>
              
              {/* 脚本输入 */}
              <div className="mt-6">
                <label className="form-label">视频脚本</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="输入视频脚本内容，描述要生成的视频场景和对话..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  详细描述场景、角色动作和对话内容，AI将根据您的描述生成视频
                </p>
              </div>
              
              {/* 生成选项 */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">视频风格</label>
                  <select className="input-field">
                    <option value="realistic">写实风格</option>
                    <option value="cartoon">卡通风格</option>
                    <option value="artistic">艺术风格</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">视频质量</label>
                  <select className="input-field">
                    <option value="standard">标准质量</option>
                    <option value="high">高质量</option>
                    <option value="ultra">超高质量</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">背景音乐</label>
                  <select className="input-field">
                    <option value="">无背景音乐</option>
                    <option value="upbeat">轻快</option>
                    <option value="calm">平静</option>
                    <option value="dramatic">戏剧性</option>
                  </select>
                </div>
              </div>
              
              {/* 生成按钮 */}
              <div className="mt-8">
                <button 
                  onClick={handleGenerateVideo}
                  className="btn-primary w-full py-3 text-lg"
                >
                  <Video className="w-5 h-5 mr-2" />
                  开始生成视频
                </button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  预计生成时间：2-5分钟
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {videoTasks.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有生成任务</h3>
                <p className="text-gray-600 mb-6">
                  创建您的第一个视频生成任务
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="btn-primary"
                >
                  生成视频
                </button>
              </div>
            ) : (
              videoTasks.map(task => (
                <div key={task.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? '已完成' : 
                         task.status === 'processing' ? '生成中' : 
                         task.status === 'failed' ? '生成失败' : '等待中'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(task.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">角色：{task.character_name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{task.script}</p>
                  </div>
                  
                  {task.status === 'processing' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>生成进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        预计剩余时间：{Math.ceil(task.estimated_time / 60)}分钟
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    {task.status === 'completed' && (
                      <button className="btn-primary text-sm">
                        <Play className="w-4 h-4 mr-1" />
                        播放视频
                      </button>
                    )}
                    {task.status === 'failed' && (
                      <button className="btn-secondary text-sm">
                        重新生成
                      </button>
                    )}
                    {task.status === 'processing' && (
                      <button 
                        onClick={() => {
                          setCurrentTask(task)
                          setShowProgressModal(true)
                        }}
                        className="btn-secondary text-sm"
                      >
                        查看进度
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有生成的视频</h3>
                <p className="text-gray-600 mb-6">
                  开始生成您的第一个AI视频
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="btn-primary"
                >
                  生成视频
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div key={video.id} className="card">
                    {/* 视频缩略图 */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button className="bg-white bg-opacity-90 rounded-full p-3">
                          <Play className="w-6 h-6 text-gray-900" />
                        </button>
                      </div>
                    </div>
                    
                    {/* 视频信息 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{video.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>时长：{video.duration}秒</span>
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(video.status)}`}>
                          {video.status === 'completed' ? '已完成' : '处理中'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2 mt-4">
                      <button className="btn-secondary text-sm">
                        下载
                      </button>
                      <button className="btn-primary text-sm">
                        播放
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 实时进度模态框 */}
      {showProgressModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                任务进度跟踪
              </h2>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <TaskProgress
              taskId={currentTask.id}
              userId="user_123" // 这里应该使用实际的用户ID
              initialProgress={currentTask.progress}
              initialStatus={currentTask.status}
              onComplete={handleTaskComplete}
              onError={handleTaskError}
            />
          </div>
        </div>
      )}
    </div>
  )
} 