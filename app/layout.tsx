import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ReduxProvider from "@/app/reduxLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hansung Movie Site",
  description: "HANSUNG MOVIE SITE",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

