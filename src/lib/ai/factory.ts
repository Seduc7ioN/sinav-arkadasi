import type { AIProvider } from "./providers/schema"
import { OpenAIProvider } from "./providers/openai"
import { GeminiProvider } from "./providers/gemini"
import { ReplicateProvider } from "./providers/replicate"

export type Capability =
  | "remove_bg"
  | "gen_bg"
  | "enhance"
  | "gen_description"
  | "gen_keywords"
  | "gen_seo"
  | "analyze"

interface ProviderCapability {
  provider: AIProvider
  priority: number
  costPerCall: number
}

const providers: Map<string, AIProvider> = new Map()
let registryInitialized = false
let capabilityRegistry: Record<Capability, ProviderCapability[]> | null = null

export function initializeProviders() {
  if (providers.size > 0) return

  if (process.env.OPENAI_API_KEY) {
    providers.set(
      "openai",
      new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-4o",
      })
    )
  }

  if (process.env.GEMINI_API_KEY) {
    providers.set(
      "gemini",
      new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      })
    )
  }

  if (process.env.REPLICATE_API_KEY) {
    providers.set(
      "replicate",
      new ReplicateProvider({
        apiKey: process.env.REPLICATE_API_KEY,
      })
    )
  }

  buildRegistry()
}

function buildRegistry() {
  const registry: Record<Capability, ProviderCapability[]> = {
    remove_bg: [],
    gen_bg: [],
    enhance: [],
    gen_description: [],
    gen_keywords: [],
    gen_seo: [],
    analyze: [],
  }

  const capabilityMap: Record<string, (p: AIProvider) => boolean> = {
    remove_bg: (p) => typeof p.removeBackground === "function",
    gen_bg: (p) => typeof p.generateBackground === "function",
    enhance: (p) => typeof p.enhanceImage === "function",
    gen_description: (p) => typeof p.generateDescription === "function",
    gen_keywords: (p) => typeof p.generateKeywords === "function",
    gen_seo: (p) => typeof p.generateSeoContent === "function",
    analyze: (p) => typeof p.analyzeImage === "function",
  }

  const costEstimates: Record<string, number> = {
    openai: 0.01,
    gemini: 0.005,
    replicate: 0.02,
  }

  providers.forEach((provider, id) => {
    for (const [capability, check] of Object.entries(capabilityMap)) {
      if (check(provider)) {
        registry[capability as Capability].push({
          provider,
          priority: provider.isAvailable() ? 1 : 0,
          costPerCall: costEstimates[id] || 0.01,
        })
      }
    }
  })

  for (const cap of Object.keys(registry)) {
    registry[cap as Capability].sort(
      (a, b) => a.costPerCall - b.costPerCall || b.priority - a.priority
    )
  }

  capabilityRegistry = registry
  registryInitialized = true
}

export function getProviderForCapability(capability: Capability): AIProvider | null {
  if (!registryInitialized) initializeProviders()
  const available = capabilityRegistry?.[capability] ?? []
  if (available.length === 0) return null
  return available[0].provider
}

export async function executeWithFallback<T>(
  capability: Capability,
  execute: (provider: AIProvider) => Promise<T>
): Promise<T> {
  if (!registryInitialized) initializeProviders()
  const available = capabilityRegistry?.[capability] ?? []

  if (available.length === 0) {
    throw new Error(
      `Kullanılabilir AI sağlayıcı bulunamadı: ${capability}. Lütfen bir AI API anahtarı yapılandırın.`
    )
  }

  const errors: Error[] = []

  for (const { provider } of available) {
    try {
      return await execute(provider)
    } catch (error) {
      errors.push(error as Error)
      console.warn(`Provider ${provider.id} failed for ${capability}:`, error)
    }
  }

  throw new Error(
    `Tüm AI sağlayıcıları başarısız oldu: ${errors.map((e) => e.message).join(" | ")}`
  )
}

export function getAvailableProviders(): string[] {
  if (!registryInitialized) initializeProviders()
  return Array.from(providers.keys())
}

export { providers }
