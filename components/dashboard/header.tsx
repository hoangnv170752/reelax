"use client"
import { useAuth } from "@/components/auth/mock-auth-provider"
import { NewProjectModal } from "./new-project-modal"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || "Creator"}!</h1>
          <p className="text-gray-500 mt-1">Create and manage your viral video projects</p>
        </div>
        <NewProjectModal onCreateProject={(project) => console.log("New project:", project)} />
      </div>
    </header>
  )
}
