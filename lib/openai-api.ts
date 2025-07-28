interface OpenAITextResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface OpenAIImageResult {
  imageUrl: string
  revisedPrompt?: string
}

interface OpenAIGenerationOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

class OpenAIAPI {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1"

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
  }

  async generateText(prompt: string, options: OpenAIGenerationOptions = {}): Promise<OpenAITextResult> {
    if (!this.apiKey) {
      // Return mock data for development
      return {
        content: `Generated content for: "${prompt}". This is a high-quality, engaging piece of content optimized for viral potential and audience engagement.`,
        usage: {
          promptTokens: 50,
          completionTokens: 100,
          totalTokens: 150,
        },
      }
    }

    const {
      model = "gpt-4",
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = "You are a creative content generator focused on creating viral, engaging content.",
    } = options

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        content: data.choices[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      console.error("OpenAI API Error:", error)
      throw error
    }
  }

  async generateImage(
    prompt: string,
    size: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024",
    quality: "standard" | "hd" = "standard",
  ): Promise<OpenAIImageResult> {
    if (!this.apiKey) {
      // Return mock data for development
      return {
        imageUrl: `/placeholder.svg?height=1024&width=1024&text=Generated+Image+for+${encodeURIComponent(prompt)}`,
        revisedPrompt: `Enhanced version of: ${prompt}`,
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          size,
          quality,
          n: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        imageUrl: data.data[0]?.url || "",
        revisedPrompt: data.data[0]?.revised_prompt,
      }
    } catch (error) {
      console.error("OpenAI API Error:", error)
      throw error
    }
  }

  async generateTitle(topic: string, platform = "youtube"): Promise<string> {
    const prompt = `Generate a viral, engaging title for a ${platform} video about: ${topic}. 
    Make it attention-grabbing, clickable, and optimized for the platform's algorithm.`

    const result = await this.generateText(prompt, {
      maxTokens: 100,
      temperature: 0.8,
      systemPrompt: "You are an expert at creating viral video titles that maximize click-through rates.",
    })

    return result.content.trim()
  }

  async generateDescription(title: string, platform = "youtube"): Promise<string> {
    const prompt = `Write an SEO-optimized description for a ${platform} video with the title: "${title}". 
    Include relevant keywords, call-to-actions, and platform-specific optimization.`

    const result = await this.generateText(prompt, {
      maxTokens: 500,
      temperature: 0.6,
      systemPrompt: "You are an expert at writing SEO-optimized video descriptions that drive engagement.",
    })

    return result.content.trim()
  }

  async generateThumbnail(title: string, style = "vibrant and eye-catching"): Promise<OpenAIImageResult> {
    const prompt = `Create a ${style} thumbnail image for a video titled: "${title}". 
    The image should be attention-grabbing, high-contrast, and optimized for small display sizes. 
    Include bold text elements and vibrant colors that stand out in a feed.`

    return this.generateImage(prompt, "1792x1024", "hd")
  }

  async generateScript(title: string, duration = 60): Promise<string> {
    const prompt = `Write a ${duration}-second video script for: "${title}". 
    Include hook, main content, and call-to-action. Make it engaging and suitable for social media.`

    const result = await this.generateText(prompt, {
      maxTokens: 800,
      temperature: 0.7,
      systemPrompt: "You are an expert scriptwriter for viral social media content.",
    })

    return result.content.trim()
  }
}

export const openaiAPI = new OpenAIAPI()
export type { OpenAITextResult, OpenAIImageResult, OpenAIGenerationOptions }
