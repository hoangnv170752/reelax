"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Settings, Play, Save } from "lucide-react"
import Link from "next/link"
import { AIAgentCard } from "./ai-agent-card"
import { VideoUpload } from "./video-upload"
import { WorkflowCanvas } from "./workflow-canvas"
import { contentAgents } from "./ai-agent-card"

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [canvasNodes, setCanvasNodes] = useState<any[]>([])
  const workspaceRef = useRef<HTMLDivElement>(null)

  // Prevent scrolling and enable zoom-only functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -10 : 10
        setZoomLevel((prev) => Math.max(50, Math.min(200, prev + delta)))
      } else {
        e.preventDefault() // Prevent normal scrolling
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent arrow keys, page up/down, home/end
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
        e.preventDefault()
      }

      // Handle zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "0") {
          e.preventDefault()
          setZoomLevel(100)
        } else if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          setZoomLevel((prev) => Math.min(200, prev + 10))
        } else if (e.key === "-") {
          e.preventDefault()
          setZoomLevel((prev) => Math.max(50, prev - 10))
        }
      }
    }

    // Apply styles to prevent scrolling
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    document.addEventListener("wheel", handleWheel, { passive: false })
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = "auto"
      document.documentElement.style.overflow = "auto"
      document.removeEventListener("wheel", handleWheel)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(200, prev + 10))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(50, prev - 10))
  }

  const handleZoomReset = () => {
    setZoomLevel(100)
  }

  const handleAgentDrop = (agent: any, position: { x: number; y: number }) => {
    const newNode = {
      id: `${agent.id}-${Date.now()}`,
      agent,
      position,
      status: "idle" as const,
      output: null,
    }
    setCanvasNodes((prev) => [...prev, newNode])
  }

  const handleNodeRemove = (nodeId: string) => {
    setCanvasNodes((prev) => prev.filter((node) => node.id !== nodeId))
  }

  const handleNodeProcess = (nodeId: string) => {
    setCanvasNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, status: "processing" as const } : node)),
    )

    // Simulate processing
    setTimeout(() => {
      setCanvasNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                status: "completed" as const,
                output: `Generated content from ${node.agent.name}`,
              }
            : node,
        ),
      )
    }, 2000)
  }

  return (
    <div ref={workspaceRef} className="h-screen max-h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Project Workspace</h1>
            <p className="text-sm text-gray-500">Relax while AI creates your content</p>
          </div>
        </div>

        {/* Video Upload */}
        <div className="p-4 border-b border-gray-200">
          <VideoUpload onVideoUpload={(file) => console.log("Video uploaded:", file)} />
        </div>

        {/* AI Agents */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-4">AI Content Agents</h2>
            <div className="space-y-3">
              {contentAgents.map((agent) => (
                <AIAgentCard
                  key={agent.id}
                  agent={agent}
                  onDragStart={(agent) => console.log("Drag started:", agent)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Play className="w-4 h-4 mr-2" />
            Generate All Content
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">AI Workflow Canvas</h2>
              <Badge variant="secondary">Reelax Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="w-full h-full origin-top-left transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              width: `${10000 / (zoomLevel / 100)}px`,
              height: `${10000 / (zoomLevel / 100)}px`,
            }}
          >
            <WorkflowCanvas
              nodes={canvasNodes}
              onAgentDrop={handleAgentDrop}
              onNodeRemove={handleNodeRemove}
              onNodeProcess={handleNodeProcess}
              zoomLevel={zoomLevel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
