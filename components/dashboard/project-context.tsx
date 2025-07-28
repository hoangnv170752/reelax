"use client"

import React, { createContext, useContext, useState } from 'react'

interface ProjectContextType {
  refreshProjects: () => void
  refreshTrigger: number
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshProjects = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ProjectContext.Provider value={{ refreshProjects, refreshTrigger }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider')
  }
  return context
}
