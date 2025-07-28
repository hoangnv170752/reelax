"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ProjectCard } from "./project-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { useProjectContext } from "./project-context"

// Define the Project interface to match Supabase schema
interface Project {
  id: string
  title: string
  description: string
  platform: string
  status: string
  updated_at: string
  views_count: number
  tags?: string[]
}

export function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Import the project context hook
  const { refreshTrigger } = useProjectContext()

  // Fetch projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) {
          throw error
        }

        // Fetch tags for each project
        const projectsWithTags = await Promise.all(
          (data || []).map(async (project) => {
            const { data: tagData } = await supabase
              .from('project_tag_relations')
              .select('project_tags(name)')
              .eq('project_id', project.id)
            
            const tags = tagData?.map((item: any) => item.project_tags.name) || []
            
            return {
              ...project,
              tags
            }
          })
        )

        setProjects(projectsWithTags)
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast({
          title: "Error fetching projects",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [refreshTrigger, toast])

  // Create a new project
  const createNewProject = async () => {
    try {
      // Check if user already has 3 projects
      if (projects.length >= 3) {
        toast({
          title: "Project limit reached",
          description: "You can have a maximum of 3 projects. Please delete an existing project to create a new one.",
          variant: "destructive",
        })
        return
      }
      
      const newProject = {
        title: "New Project",
        description: "Start creating your content",
        platform: "YouTube",
        status: "Draft",
        views_count: 0,
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()

      if (error) {
        throw error
      }

      if (data) {
        // Add the new project to the list with empty tags array
        setProjects([{ ...data[0], tags: [] }, ...projects])
        toast({
          title: "Project created",
          description: "Your new project has been created successfully",
        })
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Error creating project",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  // Format the project data for display
  const formattedProjects = projects.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description,
    platform: project.platform,
    status: project.status,
    lastUpdated: formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }),
    views: project.views_count.toLocaleString(),
    tags: project.tags || [],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
            {projects.length >= 3 && <span className="ml-1 text-amber-600">(limit reached)</span>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-md bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project</p>
        </div>
      )}
    </div>
  )
}
