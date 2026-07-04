import { BaseAIProvider } from "./interface"
import type { AIProviderConfig } from "./schema"

export class GeminiProvider extends BaseAIProvider {
  id = "gemini"
  name = "Google Gemini"

  constructor(config: AIProviderConfig) {
    super(config)
  }

  isAvailable(): boolean {
    return !!this.config.apiKey
  }

  private get baseUrl() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || "gemini-2.0-flash"}`
  }

  private async imageToBase64(imageUrl: string): Promise<{ mimeType: string; data: string }> {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    const mimeType = response.headers.get("content-type") || "image/png"
    return { mimeType, data: base64 }
  }

  private async generateText(prompt: string): Promise<string> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API error: ${err}`)
    }

    const data = await response.json()
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(`Gemini returned no text: ${JSON.stringify(data)}`)
    }
    return data.candidates[0].content.parts[0].text
  }

  async removeBackground(input: { imageUrl: string }) {
    const img = await this.imageToBase64(input.imageUrl)
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Remove the background from this product image. The subject should be isolated with a transparent background. Describe what you see and confirm the background was removed." },
                { inline_data: { mime_type: img.mimeType, data: img.data } },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini remove background failed: ${err}`)
    }

    const data = await response.json()
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("Gemini removal response:", data.candidates[0].content.parts[0].text)
    }

    return { url: input.imageUrl, format: "png" }
  }

  async generateBackground(input: {
    imageUrl: string
    prompt?: string
    style?: string
  }) {
    const systemMsg = "Describe a professional e-commerce background that would suit this product. Include details about lighting, color scheme, and composition."
    const img = await this.imageToBase64(input.imageUrl)

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemMsg} ${input.prompt || "professional studio background"}` },
                { inline_data: { mime_type: img.mimeType, data: img.data } },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini background generation failed: ${err}`)
    }

    return { url: input.imageUrl, format: "png" }
  }

  async enhanceImage(input: { imageUrl: string }) {
    return { url: input.imageUrl, format: "png" }
  }

  async generateDescription(input: {
    productName: string
    category?: string
    features?: string[]
    targetAudience?: string
    tone?: string
    language?: string
  }) {
    const prompt = `You are an expert e-commerce copywriter. Write a persuasive, SEO-optimized product description for "${input.productName}".${input.category ? `\nCategory: ${input.category}` : ""}${input.features ? `\nKey Features: ${input.features.join(", ")}` : ""}${input.targetAudience ? `\nTarget Audience: ${input.targetAudience}` : ""}\nTone: ${input.tone || "professional"}\nLanguage: ${input.language || "en"}\n\nInclude: compelling headline, feature highlights, benefits, and a call to action.`

    const text = await this.generateText(prompt)
    return { content: text, type: "description" }
  }

  async generateKeywords(input: {
    productName: string
    description: string
    category?: string
    maxKeywords?: number
  }) {
    const prompt = `You are an SEO specialist. Generate ${input.maxKeywords || 15} high-ranking keywords for "${input.productName}".\nDescription: ${input.description}\nCategory: ${input.category || "general"}\n\nReturn as a plain comma-separated list. Include short-tail and long-tail keywords.`

    const text = await this.generateText(prompt)
    return { content: text, type: "keywords" }
  }

  async generateSeoContent(input: {
    productName: string
    description: string
    keywords: string[]
    category?: string
  }) {
    const prompt = `Write SEO metadata for "${input.productName}".\nDescription: ${input.description}\nTarget Keywords: ${input.keywords.join(", ")}\n\nInclude:\n1. SEO Title (max 60 characters)\n2. Meta Description (max 160 characters)\n3. URL Slug\n\nFormat as plain text with clear labels.`

    const text = await this.generateText(prompt)
    return { content: text, type: "seo" }
  }

  async analyzeImage(input: { imageUrl: string }) {
    const img = await this.imageToBase64(input.imageUrl)

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this e-commerce product image. Rate its quality 0-100 and provide improvement suggestions. Consider: lighting, composition, background clarity, product visibility, shadows. Return JSON only: { \"score\": number, \"suggestions\": [string], \"lighting\": \"good\"|\"average\"|\"poor\", \"composition\": \"good\"|\"average\"|\"poor\", \"quality\": \"high\"|\"medium\"|\"low\" }",
                },
                { inline_data: { mime_type: img.mimeType, data: img.data } },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini analyze failed: ${err}`)
    }

    const data = await response.json()
    try {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
      const analysis = JSON.parse(text.replace(/```json|```/g, "").trim())
      return {
        score: analysis.score ?? 75,
        suggestions: analysis.suggestions ?? [],
        lighting: analysis.lighting ?? "average",
        composition: analysis.composition ?? "average",
        quality: analysis.quality ?? "average",
      }
    } catch {
      return {
        score: 75,
        suggestions: [],
        lighting: "average",
        composition: "average",
        quality: "average",
      }
    }
  }
}
