'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Upload, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

interface Character {
  id: string
  name: string
  description: string
  is_public: boolean
  created_at: string
  images?: any[]
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  useEffect(() => {
    // TODO: 从API获取角色列表
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      // 模拟API调用
      const mockCharacters: Character[] = [
        {
          id: '1',
          name: '示例角色',
          description: '这是一个示例角色描述',
          is_public: false,
          created_at: new Date().toISOString(),
          images: []
        }
      ]
      setCharacters(mockCharacters)
    } catch (error) {
      console.error('Failed to fetch characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      try {
        // TODO: 调用删除API
        setCharacters(characters.filter(char => char.id !== id))
      } catch (error) {
        console.error('Failed to delete character:', error)
      }
    }
  }

  const handleUploadComplete = (images: any[]) => {
    if (selectedCharacter) {
      // 更新角色的图片列表
      setCharacters(prev => prev.map(char => 
        char.id === selectedCharacter.id 
          ? { ...char, images: [...(char.images || []), ...images] }
          : char
      ))
      
      // 关闭上传模态框
      setShowUploadModal(false)
      setSelectedCharacter(null)
    }
  }

  const openUploadModal = (character: Character) => {
    setSelectedCharacter(character)
    setShowUploadModal(true)
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
          <h1 className="text-3xl font-bold text-gray-900">角色管理</h1>
          <p className="mt-2 text-gray-600">
            管理您的AI角色，上传图片并生成特征向量
          </p>
        </div>

        {/* 操作栏 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>创建角色</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            共 {characters.length} 个角色
          </div>
        </div>

        {/* 角色列表 */}
        {characters.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有角色</h3>
            <p className="text-gray-600 mb-6">
              创建您的第一个AI角色，开始生成视频内容
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              创建角色
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {character.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openUploadModal(character)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="上传图片"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: 编辑角色 */}}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="编辑角色"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="删除角色"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {character.description || '暂无描述'}
                </p>
                
                {/* 角色图片预览 */}
                {character.images && character.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {character.images.slice(0, 3).map((image, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {character.images.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                          +{character.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      character.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {character.is_public ? '公开' : '私有'}
                    </span>
                    
                    {/* 特征向量状态 */}
                    {character.images && character.images.length > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>已生成特征</span>
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/characters/${character.id}`}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查看</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建角色模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">创建新角色</h2>
            
            <form className="space-y-4">
              <div>
                <label className="form-label">角色名称</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="输入角色名称"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">描述</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="描述这个角色的特点"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  设为公开角色
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {/* TODO: 提交创建 */}}
                className="btn-primary"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片上传模态框 */}
      {showUploadModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                为角色 "{selectedCharacter.name}" 上传图片
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <ImageUpload
              characterId={selectedCharacter.id}
              onUploadComplete={handleUploadComplete}
              maxFiles={10}
            />
          </div>
        </div>
      )}
    </div>
  )
} 