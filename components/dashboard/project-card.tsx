"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Youtube, Music, Edit } from "lucide-react"
import Link from "next/link"
import { MouseEvent } from "react"

interface Project {
  id: string
  title: string
  description: string
  platform: string
  status: string
  lastUpdated: string
  views: string
  tags: string[]
}

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project, e: MouseEvent<HTMLButtonElement>) => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700 border-green-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Draft":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(project, e)
    }
  }

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="project-card bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {project.platform === "YouTube" ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Music className="w-5 h-5 text-pink-500" />
              )}
              <Badge className={`text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right text-sm text-gray-600">
                <p className="font-medium">{project.views} views</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={handleEdit}
                title="Edit project"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</CardTitle>
          <CardDescription className="text-gray-600 line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Last Updated */}
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {project.lastUpdated}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
