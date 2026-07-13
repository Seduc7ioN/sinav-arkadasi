import type { FileType } from "@/types"

interface QuestionInput {
  question_text: string
  options: string[]
  correct_option: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
}

interface AnalyzeResult {
  questions: QuestionInput[]
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct"
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`

const USE_GEMINI = !!GEMINI_API_KEY

const ANALYSIS_PROMPT = `Sen bir eğitim asistanısın. Yüklenen belge/fotoğraftaki metni hızlıca incele.

Görevin:
- En önemli 5 bilgi/kavramdan 5 adet çoktan seçmeli soru üret.
- Her soruda 4 seçenek (A, B, C, D) olsun.
- Doğru cevabı belirt ve 1-2 cümleyle kısa açıkla.
- Her soruya kolay/orta/zor seviyesi ata.

Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "questions": [
    {
      "question_text": "...",
      "options": ["...", "...", "...", "..."],
      "correct_option": 0,
      "explanation": "...",
      "difficulty": "medium"
    }
  ]
}`

async function fetchFileBuffer(fileUrl: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Dosya alınamadı: ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const mimeType = response.headers.get("content-type") || "application/octet-stream"
  return { buffer, mimeType }
}

async function callNvidiaVision(base64Image: string, prompt: string): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY ayarlanmamış")
  }

  const response = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: base64Image },
            },
          ],
        },
      ],
      max_tokens: 1200,
      temperature: 0.5,
      top_p: 0.9,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`NVIDIA API hatası: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error(`NVIDIA metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return text
}

async function callNvidiaText(prompt: string): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY ayarlanmamış")
  }

  const response = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.5,
      top_p: 0.9,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`NVIDIA API hatası: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error(`NVIDIA metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return text
}

async function callGeminiVision(
  imageBase64: { mimeType: string; data: string },
  prompt: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY ayarlanmamış")
  }

  const response = await fetch(
    `${GEMINI_BASE_URL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageBase64.mimeType,
                  data: imageBase64.data,
                },
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API hatası: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error(`Gemini metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return text
}

async function callGeminiText(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY ayarlanmamış")
  }

  const response = await fetch(
    `${GEMINI_BASE_URL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API hatası: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error(`Gemini metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return text
}

async function callVision(
  imageBase64: { mimeType: string; data: string },
  prompt: string
): Promise<string> {
  if (USE_GEMINI) {
    return callGeminiVision(imageBase64, prompt)
  }
  if (!NVIDIA_API_KEY) {
    throw new Error("GEMINI_API_KEY veya NVIDIA_API_KEY ayarlanmamış")
  }
  const dataUrl = `data:${imageBase64.mimeType};base64,${imageBase64.data}`
  return callNvidiaVision(dataUrl, prompt)
}

async function callText(prompt: string): Promise<string> {
  if (USE_GEMINI) {
    return callGeminiText(prompt)
  }
  if (!NVIDIA_API_KEY) {
    throw new Error("GEMINI_API_KEY veya NVIDIA_API_KEY ayarlanmamış")
  }
  return callNvidiaText(prompt)
}

function parseResponse(text: string): AnalyzeResult {
  let cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim()

  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  try {
    const parsed = JSON.parse(cleaned)
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Yanıtta 'questions' dizisi bulunamadı")
    }
    return {
      questions: parsed.questions.map((q: Record<string, unknown>) => ({
        question_text: String(q.question_text || ""),
        options: Array.isArray(q.options) ? q.options.map(String) : [],
        correct_option: Number(q.correct_option ?? 0),
        explanation: String(q.explanation || ""),
        difficulty: String(q.difficulty || "medium"),
      })),
    }
  } catch (error) {
    throw new Error(
      `AI yanıtı parse edilemedi: ${error instanceof Error ? error.message : ""}. Ham yanıt: ${text.slice(0, 500)}`
    )
  }
}

async function analyzeImage(fileUrl: string): Promise<AnalyzeResult> {
  const { buffer, mimeType } = await fetchFileBuffer(fileUrl)
  const base64 = buffer.toString("base64")
  const text = await callVision({ mimeType, data: base64 }, ANALYSIS_PROMPT)
  return parseResponse(text)
}

async function extractOfficeText(fileUrl: string): Promise<string> {
  const { buffer } = await fetchFileBuffer(fileUrl)
  const officeParser = await import("officeparser")
  const extractedText = (await officeParser.parseOffice(buffer)) as unknown as string
  return extractedText || ""
}

async function analyzeTextFile(fileUrl: string, fileType: FileType): Promise<AnalyzeResult> {
  // PDF ve PPT için metin çıkarımı yap
  const extractedText = await extractOfficeText(fileUrl)

  if (!extractedText || extractedText.trim().length < 10) {
    // Metin çıkamazsa görüntü olarak gönder (son çare)
    return analyzeImage(fileUrl)
  }

  const prompt = `Aşağıdaki metni incele ve sorular oluştur:\n\n${extractedText.slice(0, 15000)}\n\n---\n\n${ANALYSIS_PROMPT}`
  const text = await callText(prompt)
  return parseResponse(text)
}

export async function analyzeMaterial(
  fileUrl: string,
  fileType: FileType
): Promise<AnalyzeResult> {
  if (fileType === "image") {
    return analyzeImage(fileUrl)
  }
  return analyzeTextFile(fileUrl, fileType)
}
