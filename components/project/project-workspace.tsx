"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Share2,
  Hash,
  FileText,
  ImageIcon,
  Zap,
  Sparkles,
  Eye,
  Mic,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  BarChart3,
  Brain,
  Wand2,
} from "lucide-react"
import Link from "next/link"
import { gsap } from "gsap"
import { VideoUpload } from "./video-upload"
import { AIAgentCard } from "./ai-agent-card"
import { WorkflowCanvas } from "./workflow-canvas"

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const [miniMapEnabled, setMiniMapEnabled] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const contentAgents = [
    {
      id: "title-generator",
      title: "Title Generator",
      description: "Create engaging video titles",
      icon: Hash,
      color: "bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
      category: "content",
    },
    {
      id: "description-writer",
      title: "Description Writer",
      description: "Write SEO-optimized descriptions",
      icon: FileText,
      color: "bg-green-100 border-green-200",
      iconColor: "text-green-600",
      category: "content",
    },
    {
      id: "thumbnail-designer",
      title: "Thumbnail Designer",
      description: "Design eye-catching thumbnails",
      icon: ImageIcon,
      color: "bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      category: "content",
    },
    {
      id: "social-media",
      title: "Social Media",
      description: "Create viral tweets & posts",
      icon: Zap,
      color: "bg-yellow-100 border-yellow-200",
      iconColor: "text-yellow-600",
      category: "content",
    },
    {
      id: "hashtag-generator",
      title: "Hashtag Generator",
      description: "Generate trending hashtags",
      icon: Hash,
      color: "bg-pink-100 border-pink-200",
      iconColor: "text-pink-600",
      category: "content",
    },
    {
      id: "script-writer",
      title: "Script Writer",
      description: "Write engaging video scripts",
      icon: FileText,
      color: "bg-indigo-100 border-indigo-200",
      iconColor: "text-indigo-600",
      category: "content",
    },
    {
      id: "qloo-quality",
      title: "Qloo Quality Judge",
      description: "Judge quality & enhance cultural parts",
      icon: Brain,
      color: "bg-amber-100 border-amber-200",
      iconColor: "text-amber-600",
      category: "content",
    },
    {
      id: "openai-generator",
      title: "OpenAI Generator",
      description: "Generate text & image content",
      icon: Wand2,
      color: "bg-emerald-100 border-emerald-200",
      iconColor: "text-emerald-600",
      category: "content",
    },
  ]

  const analysisAgents = [
    {
      id: "trend-analyzer",
      title: "Trend Analyzer",
      description: "Analyze current trends",
      icon: TrendingUp,
      color: "bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
      category: "analysis",
    },
    {
      id: "audience-insights",
      title: "Audience Insights",
      description: "Understand your audience",
      icon: Target,
      color: "bg-cyan-100 border-cyan-200",
      iconColor: "text-cyan-600",
      category: "analysis",
    },
    {
      id: "sentiment-analyzer",
      title: "Sentiment Analyzer",
      description: "Analyze content sentiment",
      icon: MessageSquare,
      color: "bg-teal-100 border-teal-200",
      iconColor: "text-teal-600",
      category: "analysis",
    },
    {
      id: "performance-tracker",
      title: "Performance Tracker",
      description: "Track content performance",
      icon: BarChart3,
      color: "bg-emerald-100 border-emerald-200",
      iconColor: "text-emerald-600",
      category: "analysis",
    },
  ]

  const automationAgents = [
    {
      id: "auto-scheduler",
      title: "Auto Scheduler",
      description: "Schedule content posting",
      icon: Calendar,
      color: "bg-violet-100 border-violet-200",
      iconColor: "text-violet-600",
      category: "automation",
    },
    {
      id: "voice-over",
      title: "Voice Over",
      description: "Generate AI voice narration",
      icon: Mic,
      color: "bg-rose-100 border-rose-200",
      iconColor: "text-rose-600",
      category: "automation",
    },
  ]

  const allAgents = [...contentAgents, ...analysisAgents, ...automationAgents]

  useEffect(() => {
    // Animate workspace entrance
    gsap.from(workspaceRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    })

    // Animate agent cards
    gsap.from(".agent-card", {
      x: -50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.3,
      ease: "power2.out",
    })
  }, [])

  return (
    <div ref={workspaceRef} className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">AI Agents</h1>
              <p className="text-sm text-gray-500">Drag to canvas</p>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Content Agents */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Content Agents</h3>
            <div className="space-y-3">
              {contentAgents.map((agent) => (
                <AIAgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                />
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Analysis Agents */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Analysis Agents</h3>
            <div className="space-y-3">
              {analysisAgents.map((agent) => (
                <AIAgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                />
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Automation Agents */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Automation Agents</h3>
            <div className="space-y-3">
              {automationAgents.map((agent) => (
                <AIAgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                />
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Transcription Tools */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Video Upload</h3>
            <VideoUpload />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate All Content
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              Preview Content
            </Button>
          </div>
        </div>

        {/* Canvas Settings */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Canvas Settings</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm">Mini-map</span>
            <Switch checked={miniMapEnabled} onCheckedChange={setMiniMapEnabled} />
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Share Canvas
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <WorkflowCanvas
          agents={allAgents}
          selectedAgent={selectedAgent}
          miniMapEnabled={miniMapEnabled}
          projectId={projectId}
        />
      </div>
    </div>
  )
}
