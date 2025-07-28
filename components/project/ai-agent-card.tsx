"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface Agent {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
  iconColor: string
  category: string
}

interface AIAgentCardProps {
  agent: Agent
  isSelected: boolean
  onClick: () => void
}

export function AIAgentCard({ agent, isSelected, onClick }: AIAgentCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(agent))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card
      className={`agent-card cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${agent.color} ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      }`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg bg-white flex-shrink-0`}>
            <agent.icon className={`w-5 h-5 ${agent.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 mb-1">{agent.title}</h4>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
