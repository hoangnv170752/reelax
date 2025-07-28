"use client"

// VideoDB Integration
const VIDEODB_API_KEY = process.env.NEXT_PUBLIC_VIDEODB_API_KEY || "your-videodb-api-key"
const VIDEODB_BASE_URL = "https://api.videodb.io"

export class VideoDBClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || VIDEODB_API_KEY
    this.baseUrl = VIDEODB_BASE_URL
  }

  async uploadVideo(file: File): Promise<{ videoId: string; status: string }> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${this.baseUrl}/videos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("VideoDB upload error:", error)
      throw error
    }
  }

  async getVideoTranscription(videoId: string): Promise<{ transcription: string; segments: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}/transcription`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("VideoDB transcription error:", error)
      throw error
    }
  }

  async generateThumbnail(videoId: string, timestamp?: number): Promise<{ thumbnailUrl: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}/thumbnail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timestamp: timestamp || 0 }),
      })

      if (!response.ok) {
        throw new Error(`Thumbnail generation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("VideoDB thumbnail error:", error)
      throw error
    }
  }

  async analyzeVideo(videoId: string): Promise<{
    duration: number
    resolution: string
    topics: string[]
    sentiment: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}/analyze`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Video analysis failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("VideoDB analysis error:", error)
      throw error
    }
  }
}

export const videoDB = new VideoDBClient()
