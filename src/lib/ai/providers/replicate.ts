import { BaseAIProvider } from "./interface"
import type { AIProviderConfig } from "./schema"

const REPLICATE_MODELS = {
  removeBg: "cb321abf41b7f5e27cb5a5f0e2d7f7d3f",
  generateBg: "39ed52f2a78e934b3ba5e2a89f5f1c8b",
  enhance: "ef1e5d5c5b5a5f5e5d5c5b5a5f5e5d5c",
}

export class ReplicateProvider extends BaseAIProvider {
  id = "replicate"
  name = "Replicate"

  constructor(config: AIProviderConfig) {
    super(config)
  }

  isAvailable(): boolean {
    return !!this.config.apiKey
  }

  private async runModel(model: string, input: Record<string, unknown>): Promise<string> {
    const response = await this.fetchWithTimeout(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          version: model,
          input,
        }),
      },
      60000
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Replicate API error: ${err}`)
    }

    const prediction = await response.json()

    if (prediction.status === "succeeded") {
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output
      return String(outputUrl)
    }

    if (prediction.status === "processing" || prediction.status === "starting") {
      return await this.pollPrediction(prediction.id)
    }

    throw new Error(`Replicate prediction failed: ${prediction.error || prediction.status}`)
  }

  private async pollPrediction(id: string): Promise<string> {
    const maxAttempts = 30
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const response = await this.fetchWithTimeout(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
        }
      )

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Replicate poll failed: ${err}`)
      }

      const prediction = await response.json()

      if (prediction.status === "succeeded") {
        const outputUrl = Array.isArray(prediction.output)
          ? prediction.output[0]
          : prediction.output
        return String(outputUrl)
      }
      if (prediction.status === "failed") {
        throw new Error(`Replicate prediction failed: ${prediction.error}`)
      }
    }
    throw new Error("Replicate prediction timed out after 60s")
  }

  async removeBackground(input: { imageUrl: string }) {
    const url = await this.runModel(REPLICATE_MODELS.removeBg, {
      image: input.imageUrl,
    })
    return { url, format: "png" }
  }

  async generateBackground(input: {
    imageUrl: string
    prompt?: string
    style?: string
  }) {
    const url = await this.runModel(REPLICATE_MODELS.generateBg, {
      image: input.imageUrl,
      prompt: input.prompt || "professional studio background, soft lighting",
    })
    return { url, format: "png" }
  }

  async enhanceImage(input: { imageUrl: string }) {
    const url = await this.runModel(REPLICATE_MODELS.enhance, {
      image: input.imageUrl,
      scale: 2,
    })
    return { url, format: "png" }
  }

  async generateDescription(input: {
    productName: string
    category?: string
    features?: string[]
    targetAudience?: string
    tone?: string
    language?: string
  }) {
    return {
      content: `Professional product description for ${input.productName}`,
      type: "description",
    }
  }

  async generateKeywords(input: {
    productName: string
    description: string
    category?: string
    maxKeywords?: number
  }) {
    return {
      content: `${input.productName}, ${input.category || "product"}, e-commerce`,
      type: "keywords",
    }
  }

  async generateSeoContent(input: {
    productName: string
    description: string
    keywords: string[]
    category?: string
  }) {
    return {
      content: `SEO content for ${input.productName}`,
      type: "seo",
    }
  }

  async analyzeImage(input: { imageUrl: string }) {
    return {
      score: 75,
      suggestions: [],
      lighting: "average",
      composition: "average",
      quality: "average",
    }
  }
}
