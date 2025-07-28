"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Youtube, Music, Clock } from "lucide-react"
import Link from "next/link"

interface Project {
  id: number
  title: string
  description: string
  platform: "YouTube" | "TikTok"
  status: "Published" | "In Progress" | "Draft"
  lastUpdated: string
  views: string
  tags: string[]
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="project-card bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {project.platform === "YouTube" ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Music className="w-5 h-5 text-pink-500" />
              )}
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{project.views} views</p>
            </div>
          </div>
          <CardTitle className="text-gray-900">{project.title}</CardTitle>
          <CardDescription className="text-gray-600">{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Clock className="w-4 h-4 mr-1" />
            {project.lastUpdated}
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
