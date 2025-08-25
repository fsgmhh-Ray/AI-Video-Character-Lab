'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageUploadProps {
  characterId: string
  onUploadComplete: (images: any[]) => void
  maxFiles?: number
}

interface UploadedImage {
  id: string
  filename: string
  url: string
  file_size: number
  quality_score: number
  recommendations: string[]
}

export default function ImageUpload({ characterId, onUploadComplete, maxFiles = 10 }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    const newImages: UploadedImage[] = []

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // 更新进度
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }))

        // 模拟上传进度
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }))
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // 模拟上传成功
        const uploadedImage: UploadedImage = {
          id: `img_${Date.now()}_${i}`,
          filename: file.name,
          url: URL.createObjectURL(file),
          file_size: file.size,
          quality_score: Math.random() * 40 + 60, // 60-100的随机分数
          recommendations: []
        }

        // 根据质量分数生成建议
        if (uploadedImage.quality_score < 80) {
          uploadedImage.recommendations.push('建议使用更高分辨率的图片')
        }
        if (file.size > 5 * 1024 * 1024) {
          uploadedImage.recommendations.push('图片文件较大，建议压缩')
        }

        newImages.push(uploadedImage)
      }

      setUploadedImages(prev => [...prev, ...newImages])
      onUploadComplete(newImages)

    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }, [characterId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles,
    disabled: uploading
  })

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-primary-600 font-medium">将图片拖放到这里...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              拖放图片到这里，或点击选择文件
            </p>
            <p className="text-gray-500">
              支持 JPG, PNG, WebP 格式，最多 {maxFiles} 张图片
            </p>
          </div>
        )}
      </div>

      {/* 上传进度 */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">上传进度</h3>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{filename}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 已上传的图片 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            已上传的图片 ({uploadedImages.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* 图片信息 */}
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.filename}
                  </p>
                  
                  {/* 质量分数 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">质量:</span>
                    <div className="flex items-center space-x-1">
                      {image.quality_score >= 80 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-xs font-medium ${
                        image.quality_score >= 80 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {image.quality_score.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* 建议 */}
                  {image.recommendations.length > 0 && (
                    <div className="text-xs text-yellow-600">
                      {image.recommendations[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 