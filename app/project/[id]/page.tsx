"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ProjectWorkspace } from "@/components/project/project-workspace"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { GSAPProvider } from "@/components/animations/gsap-provider"
import { supabase } from "@/lib/supabase"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const [projectName, setProjectName] = useState<string>('')
  
  // Fetch project name
  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        // First ensure we have a valid session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          console.log('No active session found, skipping project fetch')
          return
        }

        // Then fetch the project data
        const { data, error } = await supabase
          .from('projects')
          .select('title')
          .eq('id', projectId)
          .single()
          
        if (error) {
          console.error('Error fetching project name:', error)
          return
        }
        
        if (data?.title) {
          setProjectName(data.title)
        } else {
          console.log('Project found but no name available')
        }
      } catch (error) {
        console.error('Error in project name fetch process:', error)
      }
    }
    
    fetchProjectName()
  }, [projectId])

  return (
    <GSAPProvider>
      <ProtectedRoute>
        <ProjectWorkspace projectId={projectId} projectName={projectName} />
      </ProtectedRoute>
    </GSAPProvider>
  )
}
