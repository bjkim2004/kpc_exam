import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '생성형 AI 활용 역량평가 시스템',
  description: 'AI Assessment Platform - Generative AI Competency Assessment',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}


