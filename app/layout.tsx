import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SupabaseAuthProvider } from "@/components/auth/supabase-auth-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reelax - Relax and Let AI Make You a Great Content Creator",
  description:
    "Generate compelling titles, descriptions, stunning thumbnails, and viral social media content for YouTube and TikTok with AI-powered tools.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} data-gptw="">
        <SupabaseAuthProvider>
          {children}
          <Toaster />
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
