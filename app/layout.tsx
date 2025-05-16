import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ReduxProvider from "@/app/reduxLayout"
import SessionTimer from "@/src/components/common/SessionTimer"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CinemagiX",
  description: "CinemagiX - 영화 예매 서비스",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>
            <SessionTimer timeoutMinutes={10}>{children}</SessionTimer> {/* 10분 후 세션 타임아웃 */ }
        </ReduxProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
