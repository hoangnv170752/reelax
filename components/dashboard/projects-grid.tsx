"use client"

import { ProjectCard } from "./project-card"

const projects = [
  {
    id: 1,
    title: "My Viral TikTok Series",
    description: "Dance challenge compilation for Gen Z audience",
    platform: "TikTok" as const,
    status: "In Progress" as const,
    lastUpdated: "2 hours ago",
    views: "1.2M",
    tags: ["Dance", "Viral", "Gen Z"],
  },
  {
    id: 2,
    title: "Tech Review Channel",
    description: "Latest smartphone reviews and comparisons",
    platform: "YouTube" as const,
    status: "Published" as const,
    lastUpdated: "1 day ago",
    views: "850K",
    tags: ["Tech", "Review", "Educational"],
  },
  {
    id: 3,
    title: "Cooking Shorts",
    description: "Quick recipe videos for busy professionals",
    platform: "YouTube" as const,
    status: "Draft" as const,
    lastUpdated: "3 days ago",
    views: "0",
    tags: ["Food", "Tutorial", "Lifestyle"],
  },
]

export function ProjectsGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
        <div className="text-sm text-gray-500">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
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
