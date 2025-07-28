"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/supabase-auth-provider"
import { NewProjectModal } from "./new-project-modal"
import { useState } from "react"

export function DashboardHeader() {
  const { user } = useAuth()
  const [showNewProject, setShowNewProject] = useState(false)

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || "Creator"}!</h1>
            <p className="text-gray-500 mt-1">Reelax and let AI create amazing content for you</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <NewProjectModal open={showNewProject} onOpenChange={setShowNewProject} />
    </>
  )
}
