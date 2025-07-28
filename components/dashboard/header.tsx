"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/supabase-auth-provider"
import { NewProjectModal } from "./new-project-modal"
import { useState } from "react"

// Create a context to manage modal state globally
import { createContext, useContext } from "react"

// Create context for managing modals
export const ModalContext = createContext({
  showNewProject: false,
  setShowNewProject: (show: boolean) => {},
  isSettingsOrLogoutClicked: false,
  setIsSettingsOrLogoutClicked: (clicked: boolean) => {}
})

export function useModalContext() {
  return useContext(ModalContext)
}

export function DashboardHeader() {
  const { user } = useAuth()
  const [showNewProject, setShowNewProject] = useState(false)
  const [isSettingsOrLogoutClicked, setIsSettingsOrLogoutClicked] = useState(false)
  
  // Provide modal context to children
  const modalContextValue = {
    showNewProject,
    setShowNewProject,
    isSettingsOrLogoutClicked,
    setIsSettingsOrLogoutClicked
  }

  return (
    <ModalContext.Provider value={modalContextValue}>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || "Creator"}!</h1>
            <p className="text-gray-500 mt-1">Reelax and let AI create amazing content for you</p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-blue-700" 
            onClick={() => {
              if (!isSettingsOrLogoutClicked) {
                setShowNewProject(true);
              } else {
                setIsSettingsOrLogoutClicked(false);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <NewProjectModal open={showNewProject} onOpenChange={setShowNewProject} />
    </ModalContext.Provider>
  )
}
