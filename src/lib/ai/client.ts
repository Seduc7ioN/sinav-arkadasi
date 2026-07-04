import { executeWithFallback, getAvailableProviders } from "./factory"
import type { AIProvider } from "./providers/schema"

export type { AIProvider }

export const ai = {
  async removeBackground(imageUrl: string) {
    return executeWithFallback("remove_bg", (provider) =>
      provider.removeBackground({ imageUrl })
    )
  },

  async generateBackground(imageUrl: string, prompt?: string) {
    return executeWithFallback("gen_bg", (provider) =>
      provider.generateBackground({ imageUrl, prompt })
    )
  },

  async enhanceImage(imageUrl: string) {
    return executeWithFallback("enhance", (provider) =>
      provider.enhanceImage({ imageUrl })
    )
  },

  async generateDescription(input: {
    productName: string
    category?: string
    features?: string[]
    targetAudience?: string
    tone?: string
    language?: string
  }) {
    return executeWithFallback("gen_description", (provider) =>
      provider.generateDescription(input)
    )
  },

  async generateKeywords(input: {
    productName: string
    description: string
    category?: string
    maxKeywords?: number
  }) {
    return executeWithFallback("gen_keywords", (provider) =>
      provider.generateKeywords(input)
    )
  },

  async generateSeoContent(input: {
    productName: string
    description: string
    keywords: string[]
    category?: string
  }) {
    return executeWithFallback("gen_seo", (provider) =>
      provider.generateSeoContent(input)
    )
  },

  async analyzeImage(imageUrl: string) {
    return executeWithFallback("analyze", (provider) =>
      provider.analyzeImage({ imageUrl })
    )
  },

  getProviders() {
    return getAvailableProviders()
  },
}
