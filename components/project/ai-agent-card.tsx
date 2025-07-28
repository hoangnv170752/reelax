"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, Hash, MessageSquare, TrendingUp, Brain, Wand2 } from "lucide-react"
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
  agent?: Agent
  isSelected?: boolean
  onClick?: () => void
  onDragStart?: (agent: Agent) => void
}

// Reduced content agents data - only core agents
export const contentAgents: Agent[] = [
  {
    id: "qloo-quality",
    title: "Qloo Quality Judge",
    description: "Judges content quality and enhances cultural relevance for maximum engagement",
    icon: Brain,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    category: "AI-Powered",
  },
  {
    id: "openai-generator",
    title: "OpenAI Generator",
    description: "Generates high-quality text content and images using advanced AI models",
    icon: Wand2,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    category: "AI-Powered",
  },
  {
    id: "title-generator",
    title: "Title Generator",
    description: "Create engaging video titles that capture attention and drive clicks",
    icon: FileText,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    category: "Content",
  },
  {
    id: "description-writer",
    title: "Description Writer",
    description: "Write SEO-optimized descriptions that boost discoverability",
    icon: MessageSquare,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    category: "Content",
  },
  {
    id: "thumbnail-designer",
    title: "Thumbnail Designer",
    description: "Design eye-catching thumbnails that increase click-through rates",
    icon: ImageIcon,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    category: "Content",
  },
  {
    id: "hashtag-generator",
    title: "Hashtag Generator",
    description: "Generate trending hashtags to maximize reach and engagement",
    icon: Hash,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-600",
    category: "Content",
  },
  {
    id: "trend-analyzer",
    title: "Trend Analyzer",
    description: "Analyze current trends and viral content patterns",
    icon: TrendingUp,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    category: "Analysis",
  },
]

// Group agents by category
const agentsByCategory = contentAgents.reduce(
  (acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = []
    }
    acc[agent.category].push(agent)
    return acc
  },
  {} as Record<string, Agent[]>,
)

export function AIAgentCard({ agent, isSelected = false, onClick, onDragStart }: AIAgentCardProps) {
  // If no specific agent is provided, render all agents grouped by category
  if (!agent) {
    return (
      <div className="space-y-6">
        {Object.entries(agentsByCategory).map(([category, agents]) => (
          <div key={category}>
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-sm font-medium text-gray-900">{category}</h3>
              <Badge variant="secondary" className="text-xs">
                {agents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {agents.map((agentItem) => (
                <AIAgentCard
                  key={agentItem.id}
                  agent={agentItem}
                  isSelected={isSelected}
                  onClick={onClick}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(agent))
    e.dataTransfer.effectAllowed = "copy"
    onDragStart?.(agent)
  }

  const handleClick = () => {
    onClick?.()
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      } ${agent.color || "bg-white border-gray-200"}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${agent.color || "bg-gray-100"}`}>
            <agent.icon className={`w-4 h-4 ${agent.iconColor || "text-gray-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{agent.title}</h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{agent.description}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              {agent.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
