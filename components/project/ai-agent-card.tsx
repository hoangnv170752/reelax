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
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      } ${agent.color}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${agent.color}`}>
            <agent.icon className={`w-4 h-4 ${agent.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{agent.title}</h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{agent.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
