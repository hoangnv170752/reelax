"use client"

import { ProjectCard } from "./project-card"

const projects = [
  {
    id: 1,
    title: "My Viral TikTok Series",
    description: "Dance challenge compilation for Gen Z audience",
    platform: "TikTok",
    status: "In Progress",
    lastUpdated: "2 hours ago",
    views: "1.2M",
    tags: ["Dance", "Viral", "Gen Z"],
  },
  {
    id: 2,
    title: "Tech Review Channel",
    description: "Latest smartphone reviews and comparisons",
    platform: "YouTube",
    status: "Published",
    lastUpdated: "1 day ago",
    views: "850K",
    tags: ["Tech", "Review", "Educational"],
  },
  {
    id: 3,
    title: "Cooking Shorts",
    description: "Quick recipe videos for busy professionals",
    platform: "YouTube",
    status: "Draft",
    lastUpdated: "3 days ago",
    views: "0",
    tags: ["Food", "Tutorial", "Lifestyle"],
  },
]

export function ProjectsGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
        <p className="text-sm text-gray-500">{projects.length} projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
