"use client"

import type React from "react"

import { useAuth } from "./supabase-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/'
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return (
      <>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
        <div className="opacity-50">{children}</div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Redirecting to home page...</p>
      </div>
    )
  }

  return <>{children}</>
}
