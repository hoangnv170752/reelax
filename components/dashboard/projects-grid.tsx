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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
