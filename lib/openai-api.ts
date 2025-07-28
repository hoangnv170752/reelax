// OpenAI API integration for content generation
export interface OpenAIGenerationRequest {
  prompt: string
  type: "text" | "image" | "both"
  maxTokens?: number
  temperature?: number
  model?: string
}

export interface OpenAIGenerationResponse {
  textContent?: string
  imageUrl?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class OpenAIAPI {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateContent(request: OpenAIGenerationRequest): Promise<OpenAIGenerationResponse> {
    const response: OpenAIGenerationResponse = {}

    try {
      // Generate text content
      if (request.type === "text" || request.type === "both") {
        const textResponse = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: request.model || "gpt-4",
            messages: [
              {
                role: "user",
                content: request.prompt,
              },
            ],
            max_tokens: request.maxTokens || 1000,
            temperature: request.temperature || 0.7,
          }),
        })

        if (textResponse.ok) {
          const textData = await textResponse.json()
          response.textContent = textData.choices[0]?.message?.content
          response.usage = textData.usage
        }
      }

      // Generate image content
      if (request.type === "image" || request.type === "both") {
        const imageResponse = await fetch(`${this.baseUrl}/images/generations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: request.prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          response.imageUrl = imageData.data[0]?.url
        }
      }

      return response
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Return mock data for development
      return {
        textContent: request.type !== "image" ? `Generated text content for: ${request.prompt}` : undefined,
        imageUrl: request.type !== "text" ? "/placeholder.svg?height=400&width=400&text=Generated+Image" : undefined,
        usage: {
          promptTokens: 50,
          completionTokens: 100,
          totalTokens: 150,
        },
      }
    }
  }

  async generateTitle(context: string, platform = "youtube"): Promise<string> {
    const prompt = `Generate a viral, engaging title for a ${platform} video about: ${context}. Make it attention-grabbing and optimized for clicks.`

    const response = await this.generateContent({
      prompt,
      type: "text",
      maxTokens: 100,
      temperature: 0.8,
    })

    return response.textContent || `Viral ${platform} Title: ${context}`
  }

  async generateDescription(title: string, platform = "youtube"): Promise<string> {
    const prompt = `Write a compelling ${platform} description for a video titled "${title}". Include relevant hashtags and call-to-action.`

    const response = await this.generateContent({
      prompt,
      type: "text",
      maxTokens: 300,
      temperature: 0.7,
    })

    return response.textContent || `Engaging description for: ${title}`
  }

  async generateThumbnail(title: string): Promise<string> {
    const prompt = `Create a vibrant, eye-catching YouTube thumbnail for a video titled "${title}". Include bold text, bright colors, and engaging visual elements.`

    const response = await this.generateContent({
      prompt,
      type: "image",
    })

    return response.imageUrl || "/placeholder.svg?height=720&width=1280&text=Generated+Thumbnail"
  }
}

// Export singleton instance
export const openaiAPI = new OpenAIAPI(process.env.NEXT_PUBLIC_OPENAI_API_KEY || "")
