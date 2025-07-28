import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { MockAuthProvider } from "@/components/auth/mock-auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIRO CREATE - Create Viral Videos",
  description:
    "Generate compelling titles, descriptions, stunning thumbnails, and viral social media content for YouTube and TikTok.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MockAuthProvider>{children}</MockAuthProvider>
      </body>
    </html>
  )
}
