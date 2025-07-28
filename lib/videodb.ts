// VideoDB API client with mock fallbacks
interface VideoDBConfig {
  baseUrl: string
  apiKey?: string
}

interface UploadResponse {
  id: string
  url: string
  status: "uploading" | "processing" | "completed" | "error"
  metadata?: {
    duration?: number
    size?: number
    format?: string
  }
}

interface TranscriptionResponse {
  id: string
  text: string
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

interface ThumbnailResponse {
  id: string
  url: string
  timestamp: number
}

interface AnalysisResponse {
  id: string
  sentiment: "positive" | "negative" | "neutral"
  topics: string[]
  keywords: string[]
  engagement_score: number
}

class VideoDBClient {
  private config: VideoDBConfig
  private mockMode: boolean

  constructor(config: VideoDBConfig) {
    this.config = config
    this.mockMode = !config.apiKey || config.baseUrl.includes("mock")
  }

  async uploadVideo(file: File, projectId?: string): Promise<UploadResponse> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        id: `video_${Date.now()}`,
        url: URL.createObjectURL(file),
        status: "completed",
        metadata: {
          duration: 120,
          size: file.size,
          format: file.type,
        },
      }
    }

    const formData = new FormData()
    formData.append("file", file)
    if (projectId) formData.append("project_id", projectId)

    const response = await fetch(`${this.config.baseUrl}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getTranscription(videoId: string): Promise<TranscriptionResponse> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return {
        id: videoId,
        text: "This is a mock transcription of the video content. It contains sample text to demonstrate the transcription functionality.",
        segments: [
          { start: 0, end: 5, text: "This is a mock transcription" },
          { start: 5, end: 10, text: "of the video content." },
          { start: 10, end: 15, text: "It contains sample text" },
          { start: 15, end: 20, text: "to demonstrate the functionality." },
        ],
      }
    }

    const response = await fetch(`${this.config.baseUrl}/transcribe/${videoId}`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    return response.json()
  }

  async generateThumbnail(videoId: string, timestamp = 0): Promise<ThumbnailResponse> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return {
        id: `thumb_${videoId}_${timestamp}`,
        url: `/placeholder.svg?height=180&width=320&text=Thumbnail`,
        timestamp,
      }
    }

    const response = await fetch(`${this.config.baseUrl}/thumbnail/${videoId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp }),
    })

    if (!response.ok) {
      throw new Error(`Thumbnail generation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async analyzeContent(videoId: string): Promise<AnalysisResponse> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return {
        id: videoId,
        sentiment: "positive",
        topics: ["technology", "innovation", "tutorial"],
        keywords: ["AI", "machine learning", "automation", "productivity"],
        engagement_score: 8.5,
      }
    }

    const response = await fetch(`${this.config.baseUrl}/analyze/${videoId}`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Content analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteVideo(videoId: string): Promise<void> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }

    const response = await fetch(`${this.config.baseUrl}/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`)
    }
  }

  async getVideoStatus(videoId: string): Promise<{ status: string; progress?: number }> {
    if (this.mockMode) {
      return { status: "completed", progress: 100 }
    }

    const response = await fetch(`${this.config.baseUrl}/videos/${videoId}/status`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`)
    }

    return response.json()
  }
}

// Create and export the client instance
const videoDBClient = new VideoDBClient({
  baseUrl: process.env.NEXT_PUBLIC_VIDEODB_BASE_URL || "https://mock-videodb-api.com",
  apiKey: process.env.NEXT_PUBLIC_VIDEODB_API_KEY,
})

export { videoDBClient, VideoDBClient }
export type { UploadResponse, TranscriptionResponse, ThumbnailResponse, AnalysisResponse }

// Helper functions for common operations
export const uploadToVideoDB = async (file: File, projectId?: string) => {
  return videoDBClient.uploadVideo(file, projectId)
}

export const getVideoTranscription = async (videoId: string) => {
  return videoDBClient.getTranscription(videoId)
}

export const generateVideoThumbnail = async (videoId: string, timestamp?: number) => {
  return videoDBClient.generateThumbnail(videoId, timestamp)
}

export const analyzeVideoContent = async (videoId: string) => {
  return videoDBClient.analyzeContent(videoId)
}
