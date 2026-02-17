import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ManyConnection Dashboard',
  description: 'アプリ管理ダッシュボード',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
