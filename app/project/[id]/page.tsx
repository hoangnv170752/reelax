"use client"

import { useParams } from "next/navigation"
import { ProjectWorkspace } from "@/components/project/project-workspace"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { GSAPProvider } from "@/components/animations/gsap-provider"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <GSAPProvider>
      <ProtectedRoute>
        <ProjectWorkspace projectId={projectId} />
      </ProtectedRoute>
    </GSAPProvider>
  )
}
