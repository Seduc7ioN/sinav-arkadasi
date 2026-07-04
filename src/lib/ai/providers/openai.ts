import { BaseAIProvider } from "./interface"
import type { AIProviderConfig } from "./schema"

export class OpenAIProvider extends BaseAIProvider {
  id = "openai"
  name = "OpenAI"

  constructor(config: AIProviderConfig) {
    super(config)
  }

  isAvailable(): boolean {
    return !!this.config.apiKey
  }

  async removeBackground(input: { imageUrl: string }) {
    const imageBuffer = await this.downloadImage(input.imageUrl)
    const formData = new FormData()
    formData.append("image", new Blob([imageBuffer], { type: "image/png" }), "product.png")
    formData.append("prompt", "")
    formData.append("mask", new Blob([imageBuffer], { type: "image/png" }),)

    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      },
      60000
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI remove background failed: ${err}`)
    }

    const data = await response.json()
    return { url: data.data[0].url, format: "png" }
  }

  async generateBackground(input: {
    imageUrl: string
    prompt?: string
    style?: string
  }) {
    const imageBuffer = await this.downloadImage(input.imageUrl)
    const formData = new FormData()
    formData.append("image", new Blob([imageBuffer], { type: "image/png" }), "product.png")
    formData.append("mask", new Blob([imageBuffer], { type: "image/png" }), "mask.png")
    formData.append("prompt", input.prompt || "professional studio background, soft lighting, clean")
    formData.append("n", "1")
    formData.append("size", "1024x1024")

    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      },
      60000
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI generate background failed: ${err}`)
    }

    const data = await response.json()
    return { url: data.data[0].url, format: "png" }
  }

  async enhanceImage(input: { imageUrl: string }) {
    const imageBuffer = await this.downloadImage(input.imageUrl)
    const formData = new FormData()
    formData.append("image", new Blob([imageBuffer], { type: "image/png" }), "product.png")
    formData.append("prompt", "Enhance this product photo, improve lighting, sharpness, and color accuracy. Make it look professional for e-commerce.")

    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      },
      60000
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI enhance image failed: ${err}`)
    }

    const data = await response.json()
    return { url: data.data[0].url, format: "png" }
  }

  async generateDescription(input: {
    productName: string
    category?: string
    features?: string[]
    targetAudience?: string
    tone?: string
    language?: string
  }) {
    const systemPrompt = "You are an expert e-commerce copywriter. Write compelling, SEO-optimized product descriptions that drive sales."
    const userPrompt = `Write a product description for "${input.productName}"${input.category ? ` in ${input.category}` : ""}.${input.features ? `\nFeatures: ${input.features.join(", ")}` : ""}${input.targetAudience ? `\nTarget audience: ${input.targetAudience}` : ""}\nTone: ${input.tone || "professional"}\nLanguage: ${input.language || "en"}`

    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 500,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI description failed: ${err}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      type: "description",
    }
  }

  async generateKeywords(input: {
    productName: string
    description: string
    category?: string
    maxKeywords?: number
  }) {
    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an SEO specialist. Generate high-ranking keywords for e-commerce products.",
            },
            {
              role: "user",
              content: `Generate ${input.maxKeywords || 15} SEO keywords for "${input.productName}". Product description: ${input.description}. Category: ${input.category || "general"}. Return as a comma-separated list. Include long-tail keywords.`,
            },
          ],
          max_tokens: 300,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI keywords failed: ${err}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      type: "keywords",
    }
  }

  async generateSeoContent(input: {
    productName: string
    description: string
    keywords: string[]
    category?: string
  }) {
    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an SEO expert. Write optimized metadata for e-commerce product pages.",
            },
            {
              role: "user",
              content: `Write SEO metadata for "${input.productName}". Description: ${input.description}. Target keywords: ${input.keywords.join(", ")}. Include:\n1. SEO title (max 60 chars)\n2. Meta description (max 160 chars)\n3. URL slug`,
            },
          ],
          max_tokens: 300,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI SEO failed: ${err}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      type: "seo",
    }
  }

  async analyzeImage(input: { imageUrl: string }) {
    const imageBuffer = await this.downloadImage(input.imageUrl)
    const bytes = new Uint8Array(imageBuffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)

    const response = await this.fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this product image for e-commerce quality. Rate it 0-100 and provide specific suggestions for improvement. Consider: lighting, composition, background, product visibility, shadows, color accuracy. Return JSON with: score (number), suggestions (array of strings), lighting (string), composition (string), quality (string).",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:image/png;base64,${base64}` },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      },
      30000
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI analyze failed: ${err}`)
    }

    const data = await response.json()
    try {
      const analysis = JSON.parse(data.choices[0].message.content.replace(/```json|```/g, "").trim())
      return {
        score: analysis.score || 75,
        suggestions: analysis.suggestions || [],
        lighting: analysis.lighting || "average",
        composition: analysis.composition || "average",
        quality: analysis.quality || "average",
      }
    } catch {
      return {
        score: 75,
        suggestions: ["Could not parse AI analysis"],
        lighting: "unknown",
        composition: "unknown",
        quality: "unknown",
      }
    }
  }

  private async downloadImage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)
    return await response.arrayBuffer()
  }
}
