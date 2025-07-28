"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  imageUrl: string
}

interface AuthContextType {
  user: UserData | null
  session: Session | null
  isLoaded: boolean
  isSignedIn: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        
        if (currentSession?.user) {
          // Format user data to match our app's structure
          const userData: UserData = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: currentSession.user.user_metadata.first_name || 'User',
            lastName: currentSession.user.user_metadata.last_name || '',
            imageUrl: currentSession.user.user_metadata.avatar_url || '/placeholder.svg?height=32&width=32',
          }
          setUser(userData)
        } else {
          setUser(null)
        }
        
        setIsLoaded(true)
      }
    )

    // Initial session check
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      console.log(data)
      
      if (data.session?.user) {
        // Format user data to match our app's structure
        const userData: UserData = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          firstName: data.session.user.user_metadata.first_name || 'User',
          lastName: data.session.user.user_metadata.last_name || '',
          imageUrl: data.session.user.user_metadata.avatar_url || '/placeholder.svg?height=32&width=32',
        }
        setUser(userData)
      }
      
      setIsLoaded(true)
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: 'New',
          last_name: 'User',
        }
      }
    })

    if (error) {
      throw error
    }
    
    // Return void to match interface
  }

  const signIn = async (email: string, password: string) => {
    // Use signInWithPassword with explicit cookie setting
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
    
    // Save auth information to localStorage and ensure cookies are set
    if (data.session && data.user) {
      // Set localStorage for client-side components
      localStorage.setItem('supabase_auth_token', data.session.access_token)
      localStorage.setItem('supabase_refresh_token', data.session.refresh_token)
      localStorage.setItem('supabase_user', JSON.stringify(data.user))
      
      // Set cookies manually to ensure they're available to middleware
      document.cookie = `sb-auth-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      
      // Use window.location for a hard redirect instead of router.push
      window.location.href = '/dashboard'
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoaded,
        isSignedIn: !!user,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within SupabaseAuthProvider")
  }
  return context
}
