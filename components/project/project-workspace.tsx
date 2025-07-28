"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Play,
  Pause,
  RotateCcw,
  Save,
  Share2,
  Download,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

import { AIAgentCard, contentAgents } from "./ai-agent-card"
import { WorkflowCanvas } from "./workflow-canvas"
import { VideoUpload } from "./video-upload"
import { supabase } from "@/lib/supabase"

interface ProjectWorkspaceProps {
  projectId: string
  projectName?: string
}

export function ProjectWorkspace({ projectId, projectName: initialProjectName }: ProjectWorkspaceProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [miniMapEnabled, setMiniMapEnabled] = useState(true)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [projectName, setProjectName] = useState<string>(initialProjectName || '')
  const [isLoadingProjectName, setIsLoadingProjectName] = useState<boolean>(!initialProjectName)
  
  // Fetch project name only if not provided
  useEffect(() => {
    if (initialProjectName) {
      setProjectName(initialProjectName)
      setIsLoadingProjectName(false)
      return;
    }
    
    const fetchProjectName = async () => {
      try {
        setIsLoadingProjectName(true)
        // First ensure we have a valid session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          console.log('No active session found in ProjectWorkspace, skipping project fetch')
          setIsLoadingProjectName(false)
          return
        }

        // Then fetch the project data
        const { data, error } = await supabase
          .from('projects')
          .select('title')
          .eq('id', projectId)
          .single()
          
        if (error) {
          console.error('Error fetching project name in ProjectWorkspace:', error)
          // Set a fallback name to avoid showing just the ID
          setProjectName(`Project ${projectId.substring(0, 8)}`)
          setIsLoadingProjectName(false)
          return
        }
        
        if (data?.title) {
          setProjectName(data.title)
        } else {
          console.log('Project found but no name available in ProjectWorkspace')
          // Set a fallback name to avoid showing just the ID
          setProjectName(`Project ${projectId.substring(0, 8)}`)
        }
      } catch (error) {
        console.error('Error in ProjectWorkspace project name fetch:', error)
        // Set a fallback name in case of error
        setProjectName(`Project ${projectId.substring(0, 8)}`)
      } finally {
        setIsLoadingProjectName(false)
      }
    }
    
    fetchProjectName()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, initialProjectName])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25))
  const handleResetZoom = () => setZoom(100)

  const handleVideoUploaded = (videoData: any) => {
    console.log("Video uploaded:", videoData)
    // Handle the uploaded video data
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Left Sidebar - AI Agents */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Reelax Mode
            </Badge>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
          <p className="text-sm text-gray-600">Drag agents to the canvas to build your workflow</p>
        </div>

        <Tabs defaultValue="agents" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="flex-1 mt-4">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2 pb-4">
                {contentAgents.map((agent) => (
                  <AIAgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent === agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 mt-4">
            <ScrollArea className="h-full px-4">
              <div className="pb-4">
                <VideoUpload 
                  onVideoUploaded={handleVideoUploaded} 
                  projectId={projectId} 
                  projectName={projectName} 
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isLoadingProjectName ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading project...
                  </span>
                ) : projectName}
              </h1>
              <Badge variant="secondary">Draft</Badge>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback Controls */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:bg-gray-100"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
                <Button variant="ghost" size="sm" onClick={handleZoomOut} className="hover:bg-gray-100">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} className="hover:bg-gray-100">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleResetZoom} className="hover:bg-gray-100">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className={`hover:bg-gray-100 ${gridEnabled ? "bg-gray-100" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMiniMapEnabled(!miniMapEnabled)}
                  className={`hover:bg-gray-100 ${miniMapEnabled ? "bg-gray-100" : ""}`}
                >
                  {miniMapEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hover:bg-gray-100"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas projectId={projectId} zoom={zoom} miniMapEnabled={miniMapEnabled} />

          {/* Grid Overlay */}
          {gridEnabled && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
