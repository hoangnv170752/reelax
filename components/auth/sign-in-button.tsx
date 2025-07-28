"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./supabase-auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthButton() {
  const { user, isSignedIn, signIn, signUp, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sign-in")
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  
  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)
    setSignInError(null)
    
    try {
      await signIn(signInEmail, signInPassword)
      setIsOpen(false)
      resetForms()
    } catch (error: any) {
      setSignInError(error.message || "Failed to sign in")
      console.error("Sign in error:", error)
    } finally {
      setSignInLoading(false)
    }
  }
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpLoading(true)
    setSignUpError(null)
    
    // Check if passwords match
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match")
      setSignUpLoading(false)
      return
    }
    
    try {
      await signUp(signUpEmail, signUpPassword)
      setSignUpSuccess(true)
    } catch (error: any) {
      setSignUpError(error.message || "Failed to sign up")
      console.error("Sign up error:", error)
    } finally {
      setSignUpLoading(false)
    }
  }
  
  const resetForms = () => {
    // Reset sign in form
    setSignInEmail("")
    setSignInPassword("")
    setSignInError(null)
    
    // Reset sign up form
    setSignUpEmail("")
    setSignUpPassword("")
    setSignUpConfirmPassword("")
    setSignUpError(null)
    setSignUpSuccess(false)
  }
  
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForms()
      setActiveTab("sign-in")
    }
  }

  if (isSignedIn && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.firstName} />
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-gray-900 hover:bg-gray-100">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Reelax!</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Sign In Tab */}
          <TabsContent value="sign-in" className="mt-4">
            {signInError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{signInError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sign-in-email">Email</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sign-in-password">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs" onClick={() => alert("Password reset feature coming soon")}>
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="sign-in-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                disabled={signInLoading}
              >
                {signInLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          {/* Sign Up Tab */}
          <TabsContent value="sign-up" className="mt-4">
            {signUpSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Check your email</h3>
                <p className="text-sm text-gray-500">
                  We've sent a confirmation email to <strong>{signUpEmail}</strong>.<br />
                  Please check your inbox and follow the instructions to complete your registration.
                </p>
                <Button 
                  onClick={() => setActiveTab("sign-in")} 
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <>
                {signUpError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signUpError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-email">Email</Label>
                    <Input
                      id="sign-up-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-password">Password</Label>
                    <Input
                      id="sign-up-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-confirm-password">Confirm Password</Label>
                    <Input
                      id="sign-up-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
