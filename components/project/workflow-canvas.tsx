"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Sparkles, Play, Settings, X, Brain, Wand2, FileText, ImageIcon, Hash, TrendingUp, Save, ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff, Link, Loader2, Upload } from "lucide-react"
import { gsap } from "gsap"
import type { LucideIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { VideoUpload } from "./video-upload"

// Add this function at the top level
const initializeGSAP = async () => {
  if (typeof window !== "undefined") {
    const { Draggable } = await import("gsap/Draggable")
    gsap.registerPlugin(Draggable)
    return Draggable
  }
  return null
}

// Icon mapping function to resolve icon components by name
const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Brain: Brain,
    Wand2: Wand2,
    FileText: FileText,
    ImageIcon: ImageIcon,
    Hash: Hash,
    TrendingUp: TrendingUp,
    MessageCircle: MessageCircle,
    Sparkles: Sparkles,
    Play: Play,
    Settings: Settings,
  }
  
  return iconMap[iconName] || Brain // Default to Brain if icon not found
}

interface Agent {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
  iconColor: string
  category: string
}

interface WorkflowNode {
  id: string
  type: "source" | "agent"
  title: string
  position: { x: number; y: number }
  status: "idle" | "ready" | "processing" | "completed" | "error"
  agentId?: string
  agent?: Agent
  output?: string
}

interface Connection {
  id: string
  fromNodeId: string
  toNodeId: string
}

interface WorkflowCanvasProps {
  projectId: string
  zoom?: number
  miniMapEnabled?: boolean
}

export function WorkflowCanvas({ projectId, zoom: initialZoom = 100, miniMapEnabled: initialMiniMapEnabled = true }: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionMode, setConnectionMode] = useState<boolean>(false)
  const [uploadMode, setUploadMode] = useState<boolean>(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  console.log(workflowNodes)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  // Canvas control states
  const [zoom, setZoom] = useState(initialZoom)
  const [miniMapEnabled, setMiniMapEnabled] = useState(initialMiniMapEnabled)
  const [gridEnabled, setGridEnabled] = useState(true)
  
  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25))
  const handleResetZoom = () => setZoom(100)

  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const draggableInstances = useRef<any[]>([])
  
  const loadWorkflowState = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('workflow_state')
        .eq('id', projectId)
        .single()

      if (error) {
        throw error
      }

      if (data?.workflow_state) {
        setWorkflowNodes(data.workflow_state.nodes || [])
        setConnections(data.workflow_state.connections || [])
      }
    } catch (error) {
      console.error('Error loading workflow state:', error)
      toast({
        title: 'Error loading workflow',
        description: 'There was a problem loading your workflow state.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, toast])

  // Save workflow state to Supabase
  const saveWorkflowState = useCallback(async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('projects')
        .update({
          workflow_state: {
            nodes: workflowNodes,
            connections: connections
          }
        })
        .eq('id', projectId)

      if (error) {
        throw error
      }

      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully.'
      })
    } catch (error) {
      console.error('Error saving workflow state:', error)
      toast({
        title: 'Error saving workflow',
        description: 'There was a problem saving your workflow state.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }, [projectId, workflowNodes, connections, toast])

  // Load workflow state on component mount
  useEffect(() => {
    loadWorkflowState()
  }, [loadWorkflowState])

  // Auto-save workflow state when nodes or connections change (debounced)
  useEffect(() => {
    if ((workflowNodes.length > 0 || connections.length > 0) && !isLoading) {
      const saveTimeout = setTimeout(() => {
        saveWorkflowState()
      }, 2000) // Debounce save for 2 seconds

      return () => clearTimeout(saveTimeout)
    }
  }, [workflowNodes, connections, isLoading, saveWorkflowState])

  useEffect(() => {
    let draggableClass: any = null

    const setupDraggable = async () => {
      draggableClass = await initializeGSAP()

      // Clean up previous draggable instances
      draggableInstances.current.forEach((instance) => {
        if (instance && instance.kill) {
          instance.kill()
        }
      })
      draggableInstances.current = []

      // Animate canvas nodes
      gsap.from(".workflow-node", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.5,
        ease: "back.out(1.7)",
      })

      // Make nodes draggable after animation completes
      setTimeout(() => {
        if (!draggableClass) return

        workflowNodes.forEach((node) => {
          const element = document.getElementById(`node-${node.id}`)
          if (element && canvasRef.current) {
            const draggableInstance = draggableClass.create(element, {
              type: "x,y",
              bounds: canvasRef.current,
              cursor: "grab",
              activeCursor: "grabbing",
              onDrag: function () {
                setWorkflowNodes((prev) =>
                  prev.map((n) => (n.id === node.id ? { ...n, position: { x: this.x, y: this.y } } : n)),
                )
              },
              onDragStart: () => {
                setDraggedNode(node.id)
                gsap.to(element, { scale: 1.05, duration: 0.2, zIndex: 1000 })
              },
              onDragEnd: () => {
                setDraggedNode(null)
                gsap.to(element, { scale: 1, duration: 0.2, zIndex: 10 })
              },
            })[0]

            draggableInstances.current.push(draggableInstance)
          }
        })
      }, 1000)
    }

    setupDraggable()

    // Cleanup function
    return () => {
      draggableInstances.current.forEach((instance) => {
        if (instance && instance.kill) {
          instance.kill()
        }
      })
    }
  }, [workflowNodes.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    try {
      const agentData = JSON.parse(e.dataTransfer.getData("application/json"))
      const rect = canvasRef.current?.getBoundingClientRect()

      if (rect) {
        const x = e.clientX - rect.left - 128 // Center the node
        const y = e.clientY - rect.top - 100
        
        // Store the icon name as a string if it exists
        if (agentData.icon && typeof agentData.icon === 'object') {
          // Extract the name of the icon component from its display name or constructor name
          const iconName = agentData.icon.displayName || 
                          (agentData.icon.name ? agentData.icon.name : 'Brain')
          agentData.icon = iconName
        }

        const newNode: WorkflowNode = {
          id: `${agentData.id}-${Date.now()}`,
          type: "agent",
          title: agentData.title,
          position: { x, y },
          status: "idle",
          agentId: agentData.id,
          agent: agentData,
        }

        setWorkflowNodes((prev) => [...prev, newNode])

        // Animate new node
        setTimeout(() => {
          const element = document.getElementById(`node-${newNode.id}`)
          if (element) {
            gsap.from(element, {
              scale: 0,
              rotation: 180,
              duration: 0.5,
              ease: "back.out(1.7)",
            })
          }
        }, 50)
      }
    } catch (error) {
      console.error("Error dropping agent:", error)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const removeNode = (nodeId: string) => {
    // Remove the node
    setWorkflowNodes((prev) => prev.filter((node) => node.id !== nodeId))
    
    // Remove any connections involving this node
    setConnections((prev) => prev.filter(
      (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    ))
  }

  const processNode = async (nodeId: string) => {
    setWorkflowNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, status: "processing" } : node)))

    const node = workflowNodes.find((n) => n.id === nodeId)

    // Simulate different processing times and outputs based on agent type
    const processingTime = node?.agentId === "qloo-quality" ? 3000 : node?.agentId === "openai-generator" ? 4000 : 2000

    setTimeout(() => {
      let output = `Generated content for ${node?.title}`

      // Customize output based on agent type
      if (node?.agentId === "qloo-quality") {
        output = "Quality Score: 8.5/10 - Enhanced cultural relevance and engagement potential"
      } else if (node?.agentId === "openai-generator") {
        output = "Generated: High-quality text content and thumbnail image optimized for viral potential"
      }

      setWorkflowNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: "completed",
                output,
              }
            : n,
        ),
      )
    }, processingTime)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-700 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "error":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getAgentSpecificContent = (node: WorkflowNode) => {
    if (node.agentId === "qloo-quality") {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium">Qloo Analysis</span>
          </div>
          <div className="text-xs text-gray-600">
            • Cultural relevance check • Quality assessment • Engagement prediction
          </div>
        </div>
      )
    } else if (node.agentId === "openai-generator") {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium">OpenAI Generation</span>
          </div>
          <div className="text-xs text-gray-600">• Text content creation • Image generation • Multi-modal output</div>
        </div>
      )
    }
    return null
  }

  // Handle node click for creating connections
  const handleNodeClick = (nodeId: string) => {
    if (connectionMode) {
      if (selectedNodeId === null) {
        // First node selection
        setSelectedNodeId(nodeId)
        toast({
          title: 'Node selected',
          description: 'Now select a destination node to connect to.'
        })
      } else if (selectedNodeId !== nodeId) {
        // Second node selection - create connection
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromNodeId: selectedNodeId,
          toNodeId: nodeId
        }
        
        // Check if this connection already exists
        const connectionExists = connections.some(
          conn => (conn.fromNodeId === selectedNodeId && conn.toNodeId === nodeId) ||
                 (conn.fromNodeId === nodeId && conn.toNodeId === selectedNodeId)
        )
        
        if (!connectionExists) {
          setConnections(prev => [...prev, newConnection])
          toast({
            title: 'Connection created',
            description: 'Nodes have been connected successfully.'
          })
        } else {
          toast({
            title: 'Connection exists',
            description: 'These nodes are already connected.',
            variant: 'destructive'
          })
        }
        
        // Reset selection
        setSelectedNodeId(null)
        setConnectionMode(false)
      }
    }
  }
  
  // Toggle connection mode
  const toggleConnectionMode = () => {
    setConnectionMode(!connectionMode)
    setUploadMode(false) // Turn off upload mode when connection mode is toggled
    setSelectedNodeId(null)
    
    if (!connectionMode) {
      toast({
        title: 'Connection mode activated',
        description: 'Click on the connection dots to connect nodes.'
      })
    } else {
      toast({
        title: 'Connection mode deactivated',
        description: 'Exited connection mode.'
      })
    }
  }
  
  // Toggle upload mode
  const toggleUploadMode = () => {
    setUploadMode(!uploadMode)
    setConnectionMode(false) // Turn off connection mode when upload mode is toggled
    
    if (!uploadMode) {
      toast({
        title: 'Video upload mode activated',
        description: 'Drag and drop your video files to upload them to this project.'
      })
    } else {
      toast({
        title: 'Video upload mode deactivated',
        description: 'Exited video upload mode.'
      })
    }
  }
  
  // Handle video upload completion
  const handleVideoUploaded = (videoData: any) => {
    toast({
      title: 'Video uploaded',
      description: `${videoData.name} has been uploaded successfully.`
    })
  }
  
  // Remove a connection
  const removeConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  // Calculate position for SVG lines between nodes
  const calculateLinePosition = (fromNodeId: string, toNodeId: string) => {
    const fromNode = workflowNodes.find(node => node.id === fromNodeId)
    const toNode = workflowNodes.find(node => node.id === toNodeId)
    
    if (!fromNode || !toNode) return null
    
    // Add offsets to center the line on the nodes
    const nodeWidth = 240 // Approximate width of node
    const nodeHeight = 140 // Approximate height of node
    
    return {
      x1: fromNode.position.x + nodeWidth / 2,
      y1: fromNode.position.y + nodeHeight / 2,
      x2: toNode.position.x + nodeWidth / 2,
      y2: toNode.position.y + nodeHeight / 2
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-auto bg-white"
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Drop Zone Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-gray-400 text-lg font-medium">
          {uploadMode ? "Drag and drop your video files here" : "Drag agents here to create your workflow"}
        </div>
      </div>
      
      {/* Video Upload Component */}
      {uploadMode && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80">
          <div className="w-full max-w-lg p-6">
            <VideoUpload 
              projectId={projectId} 
              onVideoUploaded={handleVideoUploaded} 
            />
          </div>
        </div>
      )}

      {/* Canvas Content */}
      <div className="absolute inset-0 p-8">
        {workflowNodes.map((node) => (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`workflow-node absolute select-none ${draggedNode === node.id ? "z-50" : "z-10"}`}
            style={{
              left: node.position.x,
              top: node.position.y,
              transform: "translate3d(0, 0, 0)", // Enable hardware acceleration
            }}
          >
            <Card
              className={`w-64 shadow-sm hover:shadow-md transition-shadow ${
                node.agent ? node.agent.color : "bg-white border-gray-200"
              }`}
            >
              <CardHeader className="pb-3 cursor-grab active:cursor-grabbing">
                <div className="flex items-center justify-between relative">
                  {connectionMode && (
                    <div 
                      className={`absolute w-3 h-3 bg-indigo-500 rounded-full top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${selectedNodeId === node.id ? 'ring-2 ring-indigo-300 ring-opacity-75' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNodeClick(node.id)
                      }}
                    />
                  )}
                  <div className="flex items-center space-x-2">
                    {node.agent && node.agent.icon && (
                      typeof node.agent.icon === 'string' ? 
                        React.createElement(getIconComponent(node.agent.icon), {
                          className: `w-4 h-4 ${node.agent.iconColor}`,
                        }) :
                        React.createElement(node.agent.icon, {
                          className: `w-4 h-4 ${node.agent.iconColor}`,
                        })
                    )}
                    <CardTitle className="text-sm font-medium pointer-events-none">{node.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className={`${getStatusColor(node.status)} pointer-events-none`}>
                      {node.status}
                    </Badge>
                    {node.type === "agent" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNode(node.id)
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 cursor-pointer"
                        style={{ pointerEvents: "auto" }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {node.type === "source" ? (
                  <div className="space-y-3">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center pointer-events-none">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent cursor-pointer"
                        style={{ pointerEvents: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent cursor-pointer"
                        style={{ pointerEvents: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      {node.status === "completed" && node.output ? (
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 mb-1 pointer-events-none">
                            Generated Content:
                          </p>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded pointer-events-none">
                            {node.output}
                          </p>
                        </div>
                      ) : node.status === "processing" ? (
                        <div className="flex items-center justify-center space-x-2 pointer-events-none">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-blue-600">Processing...</p>
                        </div>
                      ) : (
                        <>
                          {getAgentSpecificContent(node) || (
                            <>
                              <p className="text-sm text-gray-500 mb-2 pointer-events-none">No content generated yet</p>
                              <p className="text-xs text-gray-400 pointer-events-none">Click Generate to create</p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent cursor-pointer"
                        style={{ pointerEvents: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (connectionMode) {
                            handleNodeClick(node.id)
                          } else {
                            processNode(node.id)
                          }
                        }}
                        disabled={node.status === "processing"}
                        style={{ pointerEvents: "auto" }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Connection Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
          </defs>
          {connections.map(connection => {
            const pos = calculateLinePosition(connection.fromNodeId, connection.toNodeId)
            if (!pos) return null
            
            return (
              <g key={connection.id}>
                <line
                  x1={pos.x1}
                  y1={pos.y1}
                  x2={pos.x2}
                  y2={pos.y2}
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeDasharray={connectionMode ? "5,5" : ""}
                  markerEnd="url(#arrowhead)"
                />
                {/* Arrow head */}
                <polygon 
                  points={`${pos.x2},${pos.y2} ${pos.x2-10},${pos.y2-5} ${pos.x2-10},${pos.y2+5}`}
                  transform={`rotate(${Math.atan2(pos.y2 - pos.y1, pos.x2 - pos.x1) * 180 / Math.PI}, ${pos.x2}, ${pos.y2})`}
                  fill="#6366F1" 
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 bg-white rounded-lg shadow-lg p-2 z-10">
        <Button size="icon" variant="outline" onClick={saveWorkflowState} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </Button>
        <Button 
          size="icon" 
          variant={connectionMode ? "default" : "outline"} 
          onClick={toggleConnectionMode}
          className={connectionMode ? "bg-indigo-600" : ""}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant={uploadMode ? "default" : "outline"} 
          onClick={toggleUploadMode}
          className={uploadMode ? "bg-indigo-600" : ""}
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setGridEnabled(!gridEnabled)}
          className={`h-8 w-8 ${gridEnabled ? "bg-gray-100" : ""}`}
          title="Toggle Grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMiniMapEnabled(!miniMapEnabled)}
          className={`h-8 w-8 ${miniMapEnabled ? "bg-gray-100" : ""}`}
          title="Toggle Mini Map"
        >
          {miniMapEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Mini Map */}
      {miniMapEnabled && (
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-white border border-gray-200 rounded-lg shadow-sm pointer-events-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2">Canvas Overview</div>
            <div className="relative w-full h-20 bg-gray-50 rounded">
              {workflowNodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute w-3 h-3 rounded-sm ${node.type === "source" ? "bg-green-500" : "bg-blue-500"}`}
                  style={{
                    left: `${(node.position.x / 800) * 100}%`,
                    top: `${(node.position.y / 600) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
