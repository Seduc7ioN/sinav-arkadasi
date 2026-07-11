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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"

const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`

const ANALYSIS_PROMPT = `Sen bir eğitim asistanısın. Yüklenen belge/fotoğraftaki tüm metni incele.
Ardından şu adımları uygula:

1. Metindeki en önemli kavramları, tanımları ve bilgileri belirle
2. Bu bilgilerden 10 adet çoktan seçmeli sınav sorusu oluştur
3. Her soru için 4 seçenek (A, B, C, D) hazırla
4. Doğru cevabı ve neden doğru olduğunu açıklayan kısa bir açıklama ekle
5. Her soruya kolay/orta/zor seviyesi ata

Yanıtını AŞAĞIDAKİ JSON formatında ver, başka hiçbir şey yazma:
{
  "questions": [
    {
      "question_text": "Soru metni",
      "options": ["A) Seçenek bir", "B) Seçenek iki", "C) Seçenek üç", "D) Seçenek dört"],
      "correct_option": 0,
      "explanation": "Doğru cevabın açıklaması",
      "difficulty": "medium"
    }
  ]
}`

async function imageToBase64(
  fileUrl: string
): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Dosya alınamadı: ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return {
    mimeType: response.headers.get("content-type") || "image/png",
    data: Buffer.from(bytes).toString("base64"),
  }
}

async function callGeminiVision(
  imageBase64: { mimeType: string; data: string },
  prompt: string
): Promise<string> {
  const response = await fetch(
    `${BASE_URL}:generateContent?key=${GEMINI_API_KEY}`,
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
    throw new Error(
      `Gemini metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`
    )
  }
  return text
}

async function callGeminiText(prompt: string): Promise<string> {
  const response = await fetch(
    `${BASE_URL}:generateContent?key=${GEMINI_API_KEY}`,
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
    throw new Error(
      `Gemini metin döndürmedi: ${JSON.stringify(data).slice(0, 300)}`
    )
  }
  return text
}

function parseGeminiResponse(text: string): AnalyzeResult {
  // Temizle: ```json blokları ve fazladan boşlukları kaldır
  let cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim()

  // Bazen JSON dışında açıklama da dönüyor, ilk { ile son } arasını al
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
      `Gemini JSON yanıtı parse edilemedi: ${error instanceof Error ? error.message : ""}. Ham yanıt: ${text.slice(0, 500)}`
    )
  }
}

async function analyzeImage(fileUrl: string): Promise<AnalyzeResult> {
  const img = await imageToBase64(fileUrl)
  const text = await callGeminiVision(img, ANALYSIS_PROMPT)
  return parseGeminiResponse(text)
}

async function analyzeTextFile(
  fileUrl: string,
  fileType: FileType
): Promise<AnalyzeResult> {
  // PDF ve PPT dosyalarını indir, metni çıkar
  let extractedText = ""

  if (fileType === "pdf") {
    const { default: pdfParse } = await import("pdf-parse")
    const response = await fetch(fileUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const data = await pdfParse(buffer)
    extractedText = data.text || ""
  } else if (fileType === "ppt") {
    const { default: officeParser } = await import("officeparser")
    const response = await fetch(fileUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    extractedText = await officeParser.parseOfficeAsync(buffer)
  }

  if (!extractedText || extractedText.trim().length < 10) {
    // Metin çıkarılamadıysa, görüntü olarak analiz et (taranmış PDF vb.)
    return analyzeImage(fileUrl)
  }

  const prompt = `Aşağıdaki metni incele ve sorular oluştur:\n\n${extractedText.slice(0, 15000)}\n\n---\n\n${ANALYSIS_PROMPT}`
  const text = await callGeminiText(prompt)
  return parseGeminiResponse(text)
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
