import { fal } from "@fal-ai/client"
import { BaseAIProvider } from "./interface"
import type { AIProviderConfig, BgGenInput, ImageInput, ImageOutput } from "./schema"

/**
 * fal.ai image provider.
 *
 * Model choices (see AI Commerce OS model map):
 *  - Background removal / transparent PNG : fal-ai/birefnet  (SOTA matting)
 *  - AI background / product photography  : fal-ai/bria/product-shot
 *      (purpose-built for e-commerce, trained on licensed data → commercially safe)
 *  - Enhancement / upscale                : fal-ai/clarity-upscaler
 *
 * fal.subscribe handles fal's queue + polling internally, so a single call
 * returns the finished result without us hand-rolling a poll loop.
 */
const MODELS = {
  removeBg: "fal-ai/birefnet",
  productShot: "fal-ai/bria/product-shot",
  upscale: "fal-ai/clarity-upscaler",
} as const

export class FalProvider extends BaseAIProvider {
  id = "fal"
  name = "fal.ai"

  constructor(config: AIProviderConfig) {
    super(config)
    fal.config({ credentials: config.apiKey })
  }

  isAvailable(): boolean {
    return !!this.config.apiKey
  }

  /** Pull the first image URL out of fal's various output shapes. */
  private extractUrl(data: unknown): string {
    const d = data as {
      image?: { url?: string }
      images?: Array<{ url?: string }>
      result?: { url?: string }
    }
    const url =
      d?.image?.url ??
      d?.images?.[0]?.url ??
      d?.result?.url
    if (!url) {
      throw new Error(`fal.ai beklenmeyen çıktı verdi: ${JSON.stringify(data).slice(0, 300)}`)
    }
    return url
  }

  async removeBackground(input: ImageInput): Promise<ImageOutput> {
    const { data } = await fal.subscribe(MODELS.removeBg, {
      input: { image_url: input.imageUrl },
    })
    return { url: this.extractUrl(data), format: "png" }
  }

  async generateBackground(input: BgGenInput): Promise<ImageOutput> {
    const { data } = await fal.subscribe(MODELS.productShot, {
      input: {
        image_url: input.imageUrl,
        scene_description:
          input.prompt ||
          "professional studio product photography, soft diffused lighting, clean minimal background, subtle natural shadow, e-commerce ready",
        placement_type: "automatic",
        num_results: 1,
      },
    })
    return { url: this.extractUrl(data), format: "png" }
  }

  async enhanceImage(input: ImageInput): Promise<ImageOutput> {
    const { data } = await fal.subscribe(MODELS.upscale, {
      input: {
        image_url: input.imageUrl,
        upscale_factor: 2,
      },
    })
    return { url: this.extractUrl(data), format: "png" }
  }
}
