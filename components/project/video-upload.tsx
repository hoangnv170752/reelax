"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Play, FileVideo } from "lucide-react"
import { uploadToVideoDB } from "@/lib/videodb"

interface UploadedVideo {
  id: string
  name: string
  size: number
  duration?: number
  thumbnail?: string
  status: "uploading" | "processing" | "ready" | "error"
  progress: number
}

export function VideoUpload() {
  const [videos, setVideos] = useState<UploadedVideo[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("video/"))

    for (const file of files) {
      const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const newVideo: UploadedVideo = {
        id: videoId,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      }

      setVideos((prev) => [...prev, newVideo])

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setVideos((prev) =>
            prev.map((v) => (v.id === videoId && v.progress < 90 ? { ...v, progress: v.progress + 10 } : v)),
          )
        }, 200)

        // Upload to VideoDB
        const result = await uploadToVideoDB(file)

        clearInterval(progressInterval)

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? {
                  ...v,
                  status: "ready",
                  progress: 100,
                  duration: result.duration,
                  thumbnail: result.thumbnail,
                }
              : v,
          ),
        )
      } catch (error) {
        setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, status: "error", progress: 0 } : v)))
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileVideo className="w-4 h-4 mr-2" />
          Video Library
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Drop Zone */}
        <div
          className={`m-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Drop video files here</p>
            <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI, MKV supported</p>
          </div>
        </div>

        {/* Video List */}
        {videos.length > 0 && (
          <div className="max-h-48 overflow-y-auto border-t border-gray-200">
            {videos.map((video) => (
              <div key={video.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Play className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{video.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(video.size)} • {formatDuration(video.duration)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {video.status === "uploading" && (
                  <div className="space-y-1">
                    <Progress value={video.progress} className="h-1" />
                    <p className="text-xs text-blue-600">Uploading... {video.progress}%</p>
                  </div>
                )}

                {video.status === "processing" && <p className="text-xs text-yellow-600">Processing...</p>}

                {video.status === "ready" && <p className="text-xs text-green-600">Ready to use</p>}

                {video.status === "error" && <p className="text-xs text-red-600">Upload failed</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}
