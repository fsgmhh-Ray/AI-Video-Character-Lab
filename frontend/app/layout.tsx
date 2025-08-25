import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Video Character Lab',
  description: '专业的AI视频生成平台，为内容创作者提供一站式解决方案',
  keywords: 'AI视频,角色管理,视频生成,内容创作',
  authors: [{ name: 'AI Video Character Lab Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AI Video Character Lab',
    description: '专业的AI视频生成平台，为内容创作者提供一站式解决方案',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 