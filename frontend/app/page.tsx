import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                AI Video Character Lab
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                仪表板
              </Link>
              <Link href="/characters" className="text-gray-600 hover:text-gray-900 transition-colors">
                角色管理
              </Link>
              <Link href="/videos" className="text-gray-600 hover:text-gray-900 transition-colors">
                视频生成
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                功能特性
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                价格方案
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                开发文档
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                登录
              </Link>
              <Link href="/register" className="btn-primary">
                免费开始
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            一站式生成
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              AI视频
            </span>
            <br />
            保证角色形象一致性
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            为内容创作者提供专业的AI视频生成平台，通过先进的角色Embedding技术，
            确保每个视频中角色形象始终保持一致，提升内容质量和品牌价值。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/videos" className="btn-primary text-lg px-8 py-3">
              开始生成视频
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
              查看仪表板
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">角色管理</h3>
            <p className="text-gray-600">
              上传角色图片，系统自动生成特征向量，确保角色形象的一致性
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI视频生成</h3>
            <p className="text-gray-600">
              基于脚本和角色特征，自动生成高质量视频内容
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">质量保证</h3>
            <p className="text-gray-600">
              通过AI测试和质量控制，确保每个视频都达到专业标准
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              开始你的AI视频创作之旅
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              加入数千名内容创作者的行列，使用AI技术提升你的内容质量
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/videos" className="btn-primary text-lg px-8 py-3">
                立即生成视频
              </Link>
              <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
                查看仪表板
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Video Character Lab</h3>
              <p className="text-gray-400">
                专业的AI视频生成平台，为内容创作者提供一站式解决方案
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">仪表板</Link></li>
                <li><Link href="/characters" className="hover:text-white transition-colors">角色管理</Link></li>
                <li><Link href="/videos" className="hover:text-white transition-colors">视频生成</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">功能特性</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">价格方案</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API文档</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">使用文档</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">技术支持</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">用户社区</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li>邮箱: support@aivideo.com</li>
                <li>微信: AIVideoLab</li>
                <li>QQ群: 123456789</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Video Character Lab. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 