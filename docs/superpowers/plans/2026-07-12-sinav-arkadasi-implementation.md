# Sinav Arkadasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered study assistant app: Flutter mobile app + Next.js API backend with Supabase auth/storage and Gemini AI for extracting Q&A from study materials.

**Architecture:** Flutter handles UI/auth via Supabase SDK. Next.js API routes handle file upload to Supabase Storage and Gemini AI analysis. Results stored in Supabase PostgreSQL. Reuses existing `@/lib/supabase/server` and Gemini patterns from the codebase.

**Tech Stack:** Flutter (iOS+Android), Next.js 16, Supabase (Auth/Storage/PostgreSQL), Google Gemini Vision API, flutter_riverpod, go_router

## Global Constraints

- Flutter SDK >=3.0.0 <4.0.0
- All API routes validate Supabase auth session via `createClient()` pattern
- Gemini API key stays server-side only (never exposed to client)
- Follows existing codebase patterns: Next.js App Router route handlers, Supabase SSR, Riverpod state management
- RLS policies on all new tables restrict access to owning user
- Turkish UI language throughout
- File upload max 20MB, rate limit 5 analyze requests/min per user

---

### Task 1: Database Migration

**Files:**
- Create: `supabase-sinavarkadasi.sql`

**Produces:** Four tables (study_materials, questions, quiz_sessions, quiz_answers) with RLS policies.

- [ ] **Step 1: Create the migration file**

```sql
-- Sinav Arkadasi Database Schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STUDY MATERIALS
-- ============================================
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'ppt')),
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  page_count INTEGER DEFAULT 1,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_materials_user_id ON study_materials(user_id);
CREATE INDEX idx_study_materials_status ON study_materials(status);
CREATE INDEX idx_study_materials_created_at ON study_materials(created_at DESC);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_option SMALLINT NOT NULL CHECK (correct_option >= 0 AND correct_option <= 3),
  explanation TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_material_id ON questions(material_id);

-- ============================================
-- QUIZ SESSIONS
-- ============================================
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_material_id ON quiz_sessions(material_id);

-- ============================================
-- QUIZ ANSWERS
-- ============================================
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option SMALLINT,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_quiz_answers_session_id ON quiz_answers(session_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study materials" ON study_materials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions for own materials" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_materials
      WHERE study_materials.id = questions.material_id
      AND study_materials.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own quiz sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz answers" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_answers.session_id
      AND quiz_sessions.user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Manual action** — Run this SQL in Supabase SQL Editor. No automated step.

- [ ] **Step 3: Commit**

```bash
git add supabase-sinavarkadasi.sql
git commit -m "feat: add study_materials, questions, quiz_sessions, quiz_answers tables with RLS"
```

---

### Task 2: TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

**Produces:** `StudyMaterial`, `Question`, `QuizSession`, `QuizAnswer` interfaces and union types.

- [ ] **Step 1: Append new types to the existing types file**

Append to `src/types/index.ts`:

```typescript
// Study App Types
export type StudyMaterialStatus = "uploaded" | "processing" | "completed" | "failed"
export type FileType = "image" | "pdf" | "ppt"
export type QuestionDifficulty = "easy" | "medium" | "hard"
export type QuizSessionStatus = "in_progress" | "completed"

export interface StudyMaterial {
  id: string
  user_id: string
  title: string
  file_type: FileType
  storage_path: string
  status: StudyMaterialStatus
  page_count: number
  error_message: string | null
  created_at: string
  updated_at: string
  question_count?: number
}

export interface Question {
  id: string
  material_id: string
  question_text: string
  options: string[]
  correct_option: number
  explanation: string
  difficulty: QuestionDifficulty
  created_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  material_id: string
  score: number
  total: number
  status: QuizSessionStatus
  started_at: string
  completed_at: string | null
}

export interface QuizAnswer {
  id: string
  session_id: string
  question_id: string
  selected_option: number | null
  is_correct: boolean
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No new type errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add StudyMaterial, Question, QuizSession, QuizAnswer types"
```

---

### Task 3: Study Analyzer (Gemini Q&A Extraction)

**Files:**
- Create: `src/lib/ai/study-analyzer.ts`

**Consumes:** `GEMINI_API_KEY` env var, Gemini API endpoint
**Produces:** `analyzeMaterial(fileUrl: string, fileType: FileType): Promise<{ questions: QuestionInput[] }>`

- [ ] **Step 1: Create the study analyzer module**

```typescript
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

const ANALYSIS_PROMPT = `Sen bir egitim asistanisin. Yuklenen belge/fotograftaki tum metni incele.
Ardindan su adimlari uygula:

1. Metindeki en onemli kavramlari, tanimlari ve bilgileri belirle
2. Bu bilgilerden 10 adet coktan secmeli sinav sorusu olustur
3. Her soru icin 4 secenek (A, B, C, D) hazirla
4. Dogru cevabi ve neden dogru oldugunu aciklayan kisa bir aciklama ekle
5. Her soruya kolay/orta/zor seviyesi ata

Yanitini ASAGIDAKI JSON formatinda ver, baska hicbir sey yazma:
{
  "questions": [
    {
      "question_text": "Soru metni",
      "options": ["A) Secenek bir", "B) Secenek iki", "C) Secenek uc", "D) Secenek dort"],
      "correct_option": 0,
      "explanation": "Dogru cevabin aciklamasi",
      "difficulty": "medium"
    }
  ]
}`

async function imageToBase64(
  fileUrl: string
): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Dosya alinamadi: ${response.statusText}`)
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
    throw new Error(`Gemini API hatasi: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error(
      `Gemini metin dondurmedi: ${JSON.stringify(data).slice(0, 300)}`
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
    throw new Error(`Gemini API hatasi: ${await response.text()}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error(
      `Gemini metin dondurmedi: ${JSON.stringify(data).slice(0, 300)}`
    )
  }
  return text
}

function parseGeminiResponse(text: string): AnalyzeResult {
  // Temizle: ```json bloklari ve fazladan bosluklari kaldir
  let cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim()

  // Bazen JSON disinda aciklama da donuyor, ilk { ile son } arasini al
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  try {
    const parsed = JSON.parse(cleaned)
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Yanitta 'questions' dizisi bulunamadi")
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
      `Gemini JSON yaniti parse edilemedi: ${error instanceof Error ? error.message : ""}. Ham yanit: ${text.slice(0, 500)}`
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
  // PDF ve PPT dosyalarini indir, metni cikar
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
    // Metin cikarilamadiysa, goruntu olarak analiz et (taranmis PDF vb.)
    return analyzeImage(fileUrl)
  }

  const prompt = `Asagidaki metni incele ve sorular olustur:\n\n${extractedText.slice(0, 15000)}\n\n---\n\n${ANALYSIS_PROMPT}`
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
```

- [ ] **Step 2: Install required dependencies**

```bash
npm install pdf-parse officeparser
npm install -D @types/pdf-parse
```

- [ ] **Step 3: Verify the module compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/study-analyzer.ts package.json package-lock.json
git commit -m "feat: add study analyzer module for Gemini-based Q&A extraction"
```

---

### Task 4: POST /api/study/upload

**Files:**
- Create: `src/app/api/study/upload/route.ts`

**Consumes:** `createClient` from `@/lib/supabase/server`
**Produces:** Multipart file upload endpoint → Supabase Storage + DB record

- [ ] **Step 1: Create the upload route**

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const VALID_TYPES = new Map([
  ["image/jpeg", "image"],
  ["image/png", "image"],
  ["image/webp", "image"],
  ["application/pdf", "pdf"],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "ppt",
  ],
  ["application/vnd.ms-powerpoint", "ppt"],
])

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 20MB'dan buyuk olamaz" },
        { status: 400 }
      )
    }

    const fileType = VALID_TYPES.get(file.type)
    if (!fileType) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya formati. Lutfen JPEG, PNG, PDF veya PPT yukleyin" },
        { status: 400 }
      )
    }

    const title =
      (formData.get("title") as string) ||
      file.name.replace(/\.[^/.]+$/, "")

    // Storage bucket kontrolu ve yukleme
    const fileExt = file.name.split(".").pop() || "bin"
    const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Dosya yukleme hatasi: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("study-materials").getPublicUrl(storagePath)

    const { data: material, error: dbError } = await supabase
      .from("study_materials")
      .insert({
        user_id: user.id,
        title,
        file_type: fileType,
        storage_path: publicUrl,
        status: "uploaded",
      })
      .select("*")
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: `Veritabani hatasi: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ material })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Manual action** — Create `study-materials` bucket in Supabase Storage dashboard (public bucket)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/study/upload/route.ts
git commit -m "feat: add POST /api/study/upload endpoint"
```

---

### Task 5: POST /api/study/analyze

**Files:**
- Create: `src/app/api/study/analyze/route.ts`

**Consumes:** `createClient`, `analyzeMaterial` from study-analyzer
**Produces:** Triggers Gemini analysis for a study material

- [ ] **Step 1: Create the analyze route**

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeMaterial } from "@/lib/ai/study-analyzer"

export const maxDuration = 60 // Gemini islemi uzun surebilir

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { materialId } = await request.json()

    if (!materialId) {
      return NextResponse.json(
        { error: "materialId gerekli" },
        { status: 400 }
      )
    }

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", materialId)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return NextResponse.json(
        { error: "Materyal bulunamadi" },
        { status: 404 }
      )
    }

    if (material.status === "completed") {
      // Zaten analiz edilmis, mevcut sorulari dondur
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: true })

      return NextResponse.json({ questions: existingQuestions, material })
    }

    // Status'u processing yap
    await supabase
      .from("study_materials")
      .update({ status: "processing" })
      .eq("id", materialId)

    try {
      const result = await analyzeMaterial(
        material.storage_path,
        material.file_type
      )

      const questions = result.questions.map((q) => ({
        material_id: materialId,
        question_text: q.question_text,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }))

      const { data: insertedQuestions, error: insertError } = await supabase
        .from("questions")
        .insert(questions)
        .select("*")

      if (insertError) {
        throw new Error(`Soru kaydetme hatasi: ${insertError.message}`)
      }

      await supabase
        .from("study_materials")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", materialId)

      return NextResponse.json({
        questions: insertedQuestions,
        material: { ...material, status: "completed" },
      })
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Analiz basarisiz"

      await supabase
        .from("study_materials")
        .update({ status: "failed", error_message: message })
        .eq("id", materialId)

      throw analysisError
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/study/analyze/route.ts
git commit -m "feat: add POST /api/study/analyze endpoint with Gemini integration"
```

---

### Task 6: GET /api/study/materials

**Files:**
- Create: `src/app/api/study/materials/route.ts`

**Consumes:** `createClient`
**Produces:** List of user's study materials with question counts

- [ ] **Step 1: Create the materials list route**

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: materials, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Veritabani hatasi: ${error.message}` },
        { status: 500 }
      )
    }

    // Her materyal icin soru sayisini al
    const materialIds = materials.map((m) => m.id)
    const { data: questionCounts } = await supabase
      .from("questions")
      .select("material_id")
      .in("material_id", materialIds)

    const countMap = new Map<string, number>()
    questionCounts?.forEach((q) => {
      countMap.set(q.material_id, (countMap.get(q.material_id) || 0) + 1)
    })

    const materialsWithCounts = materials.map((m) => ({
      ...m,
      question_count: countMap.get(m.id) || 0,
    }))

    return NextResponse.json({ materials: materialsWithCounts })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/study/materials/route.ts
git commit -m "feat: add GET /api/study/materials endpoint"
```

---

### Task 7: GET /api/study/[id]

**Files:**
- Create: `src/app/api/study/[id]/route.ts`

**Consumes:** `createClient`
**Produces:** Single study material with all its questions

- [ ] **Step 1: Create the material detail route**

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data: material } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!material) {
      return NextResponse.json(
        { error: "Materyal bulunamadi" },
        { status: 404 }
      )
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      material,
      questions: questions || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/study/[id]/route.ts
git commit -m "feat: add GET /api/study/[id] endpoint"
```

---

### Task 8: Create Flutter Project

**Files:**
- Create: `sinav-arkadasi/` (entire Flutter project scaffold)

**Produces:** New Flutter project skeleton

- [ ] **Step 1: Create Flutter project**

```bash
flutter create sinav-arkadasi --org com.zcode
```

- [ ] **Step 2: Verify project structure**

```bash
ls sinav-arkadasi/lib/
```

Expected: `main.dart` exists.

- [ ] **Step 3: Commit**

```bash
git add sinav-arkadasi/
git commit -m "feat: create Flutter project scaffold for Sinav Arkadasi"
```

---

### Task 9: Flutter Dependencies and Core Setup

**Files:**
- Modify: `sinav-arkadasi/pubspec.yaml`
- Create: `sinav-arkadasi/lib/core/theme.dart`
- Create: `sinav-arkadasi/lib/core/constants.dart`
- Modify: `sinav-arkadasi/lib/main.dart`

**Produces:** Configured dependencies, theme, and app entry point.

- [ ] **Step 1: Update pubspec.yaml**

Replace `sinav-arkadasi/pubspec.yaml`:

```yaml
name: sinav_arkadasi
description: AI destekli ogrenci calisma asistani
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.9
  go_router: ^14.0.0
  supabase_flutter: ^2.3.0
  image_picker: ^1.0.7
  file_picker: ^8.0.0
  http: ^1.2.0
  google_fonts: ^6.1.0
  intl: ^0.20.2
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
```

```bash
cd sinav-arkadasi && flutter pub get
```

- [ ] **Step 2: Create constants file**

Create `sinav-arkadasi/lib/core/constants.dart`:

```dart
class AppConstants {
  static const String appName = 'Sinav Arkadasi';
  static const String supabaseUrl = 'SUPABASE_URL_PLACEHOLDER';
  static const String supabaseAnonKey = 'SUPABASE_ANON_KEY_PLACEHOLDER';
  static const String apiBaseUrl = 'API_BASE_URL_PLACEHOLDER'; // Next.js URL
}
```

- [ ] **Step 3: Create theme file**

Create `sinav-arkadasi/lib/core/theme.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF6C63FF);
  static const Color primaryLight = Color(0xFF9D97FF);
  static const Color accent = Color(0xFFFF6584);
  static const Color background = Color(0xFFF8F9FD);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);

  static ThemeData theme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.light(
      primary: primary,
      secondary: accent,
      surface: surface,
      error: error,
    ),
    scaffoldBackgroundColor: background,
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      foregroundColor: textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.notoSans(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: textPrimary,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        textStyle: GoogleFonts.notoSans(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: primary, width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      hintStyle: GoogleFonts.notoSans(color: textSecondary, fontSize: 15),
    ),
    cardTheme: CardThemeData(
      color: surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade100),
      ),
      margin: EdgeInsets.zero,
    ),
    textTheme: GoogleFonts.notoSansTextTheme().copyWith(
      headlineLarge: GoogleFonts.notoSans(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: textPrimary,
      ),
      headlineMedium: GoogleFonts.notoSans(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      titleLarge: GoogleFonts.notoSans(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      bodyLarge: GoogleFonts.notoSans(
        fontSize: 16,
        color: textPrimary,
      ),
      bodyMedium: GoogleFonts.notoSans(
        fontSize: 14,
        color: textPrimary,
      ),
      bodySmall: GoogleFonts.notoSans(
        fontSize: 12,
        color: textSecondary,
      ),
    ),
  );
}
```

- [ ] **Step 4: Update main.dart**

Replace `sinav-arkadasi/lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'presentation/router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  runApp(const ProviderScope(child: SinavArkadasiApp()));
}

class SinavArkadasiApp extends StatelessWidget {
  const SinavArkadasiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      routerConfig: router,
    );
  }
}
```

- [ ] **Step 5: Commit**

```bash
cd sinav-arkadasi && git add pubspec.yaml lib/ && git commit -m "feat: add dependencies, theme, constants, and main entry point"
```

---

### Task 10: Flutter Data Models

**Files:**
- Create: `sinav-arkadasi/lib/data/models/study_material.dart`
- Create: `sinav-arkadasi/lib/data/models/question.dart`

**Produces:** Dart model classes with `fromJson` / `toJson`.

- [ ] **Step 1: Create study material model**

```dart
class StudyMaterial {
  final String id;
  final String userId;
  final String title;
  final String fileType;
  final String storagePath;
  final String status;
  final int pageCount;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int questionCount;

  StudyMaterial({
    required this.id,
    required this.userId,
    required this.title,
    required this.fileType,
    required this.storagePath,
    required this.status,
    required this.pageCount,
    this.errorMessage,
    required this.createdAt,
    required this.updatedAt,
    this.questionCount = 0,
  });

  factory StudyMaterial.fromJson(Map<String, dynamic> json) {
    return StudyMaterial(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      title: json['title'] ?? '',
      fileType: json['file_type'] ?? 'image',
      storagePath: json['storage_path'] ?? '',
      status: json['status'] ?? 'uploaded',
      pageCount: json['page_count'] ?? 1,
      errorMessage: json['error_message'],
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      questionCount: json['question_count'] ?? 0,
    );
  }

  StudyMaterial copyWith({String? status, String? errorMessage}) {
    return StudyMaterial(
      id: id,
      userId: userId,
      title: title,
      fileType: fileType,
      storagePath: storagePath,
      status: status ?? this.status,
      pageCount: pageCount,
      errorMessage: errorMessage,
      createdAt: createdAt,
      updatedAt: updatedAt,
      questionCount: questionCount,
    );
  }
}
```

- [ ] **Step 2: Create question model**

```dart
class Question {
  final String id;
  final String materialId;
  final String questionText;
  final List<String> options;
  final int correctOption;
  final String explanation;
  final String difficulty;

  Question({
    required this.id,
    required this.materialId,
    required this.questionText,
    required this.options,
    required this.correctOption,
    required this.explanation,
    required this.difficulty,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? '',
      materialId: json['material_id'] ?? '',
      questionText: json['question_text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctOption: json['correct_option'] ?? 0,
      explanation: json['explanation'] ?? '',
      difficulty: json['difficulty'] ?? 'medium',
    );
  }

  String get correctAnswerLabel {
    if (correctOption >= 0 && correctOption < options.length) {
      final opt = options[correctOption];
      return opt.replaceFirst(RegExp(r'^[A-D]\)\s*'), '');
    }
    return '';
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/data/
git commit -m "feat: add StudyMaterial and Question data models"
```

---

### Task 11: Flutter Auth Repository and Provider

**Files:**
- Create: `sinav-arkadasi/lib/data/repositories/auth_repo.dart`
- Create: `sinav-arkadasi/lib/data/providers/auth_provider.dart`

**Produces:** Supabase auth integration with login, register, logout, session stream.

- [ ] **Step 1: Create auth repository**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  final SupabaseClient _client = Supabase.instance.client;

  Stream<AuthState> get authState => _client.auth.onAuthStateChange;

  User? get currentUser => _client.auth.currentUser;
  Session? get currentSession => _client.auth.currentSession;

  Future<void> signUp(String email, String password) async {
    await _client.auth.signUp(email: email, password: password);
  }

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
```

- [ ] **Step 2: Create auth providers**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../repositories/auth_repo.dart';

final authRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(authRepoProvider).authState;
});

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).valueOrNull;
  return authState?.session?.user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});

enum AuthStatus { idle, loading, success, error }

class AuthNotifier extends StateNotifier<AuthStatus> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(AuthStatus.idle);

  Future<void> signUp(String email, String password) async {
    state = AuthStatus.loading;
    try {
      await _repo.signUp(email, password);
      state = AuthStatus.success;
    } catch (e) {
      state = AuthStatus.error;
      rethrow;
    }
  }

  Future<void> signIn(String email, String password) async {
    state = AuthStatus.loading;
    try {
      await _repo.signIn(email, password);
      state = AuthStatus.success;
    } catch (e) {
      state = AuthStatus.error;
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _repo.signOut();
    state = AuthStatus.idle;
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthStatus>((ref) {
  return AuthNotifier(ref.watch(authRepoProvider));
});
```

- [ ] **Step 3: Commit**

```bash
git add lib/data/
git commit -m "feat: add auth repository and Riverpod providers"
```

---

### Task 12: Flutter Study Repository and Provider

**Files:**
- Create: `sinav-arkadasi/lib/data/repositories/study_repo.dart`
- Create: `sinav-arkadasi/lib/data/providers/materials_provider.dart`

**Produces:** API client for study materials, materials list state management.

- [ ] **Step 1: Create study repository**

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';
import '../models/study_material.dart';
import '../models/question.dart';

class StudyRepository {
  final SupabaseClient _client = Supabase.instance.client;

  String get _token => _client.auth.currentSession?.accessToken ?? '';

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      };

  Future<List<StudyMaterial>> getMaterials() async {
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/materials'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Materyaller alinamadi: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return (data['materials'] as List)
        .map((m) => StudyMaterial.fromJson(m))
        .toList();
  }

  Future<StudyMaterial> uploadFile(
    String filePath,
    String title,
  ) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/upload'),
    );

    request.headers['Authorization'] = 'Bearer $_token';
    request.fields['title'] = title;
    request.files.add(await http.MultipartFile.fromPath('file', filePath));

    final response = await request.send();
    final body = await response.stream.bytesToString();

    if (response.statusCode != 200) {
      throw Exception('Dosya yuklenemedi: $body');
    }

    final data = jsonDecode(body);
    return StudyMaterial.fromJson(data['material']);
  }

  Future<Map<String, dynamic>> getMaterialDetail(String materialId) async {
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/$materialId'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Materyal detayi alinamadi: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return {
      'material': StudyMaterial.fromJson(data['material']),
      'questions':
          (data['questions'] as List).map((q) => Question.fromJson(q)).toList(),
    };
  }

  Future<List<Question>> analyzeMaterial(String materialId) async {
    final response = await http.post(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/analyze'),
      headers: _headers,
      body: jsonEncode({'materialId': materialId}),
    );

    if (response.statusCode != 200) {
      throw Exception('Analiz basarisiz: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return (data['questions'] as List)
        .map((q) => Question.fromJson(q))
        .toList();
  }
}
```

- [ ] **Step 2: Create materials provider**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/study_material.dart';
import '../repositories/study_repo.dart';

final studyRepoProvider = Provider<StudyRepository>((ref) => StudyRepository());

final materialsProvider =
    AsyncNotifierProvider<MaterialsNotifier, List<StudyMaterial>>(
        MaterialsNotifier.new);

class MaterialsNotifier extends AsyncNotifier<List<StudyMaterial>> {
  @override
  Future<List<StudyMaterial>> build() async {
    return ref.watch(studyRepoProvider).getMaterials();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(studyRepoProvider).getMaterials(),
    );
  }

  Future<StudyMaterial> upload(String filePath, String title) async {
    final material =
        await ref.read(studyRepoProvider).uploadFile(filePath, title);
    await refresh();
    return material;
  }
}

class MaterialDetailNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final StudyRepository _repo;

  MaterialDetailNotifier(this._repo) : super(const AsyncLoading()) {}

  Future<void> load(String materialId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _repo.getMaterialDetail(materialId));
  }

  Future<List<Question>> analyze(String materialId) async {
    final questions = await _repo.analyzeMaterial(materialId);
    await load(materialId);
    return questions;
  }
}

final materialDetailProvider = StateNotifierProvider.family<
    MaterialDetailNotifier,
    AsyncValue<Map<String, dynamic>>,
    String>((ref, materialId) {
  final notifier = MaterialDetailNotifier(ref.watch(studyRepoProvider));
  notifier.load(materialId);
  return notifier;
});
```

- [ ] **Step 3: Commit**

```bash
git add lib/data/
git commit -m "feat: add study repository and materials provider"
```

---

### Task 13: Flutter Login/Register Screens

**Files:**
- Create: `sinav-arkadasi/lib/presentation/screens/login_screen.dart`

**Consumes:** `authNotifierProvider`, `currentUserProvider`

- [ ] **Step 1: Create login/register screen**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _isLogin = true;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (email.isEmpty || password.isEmpty) return;

    setState(() => _error = null);

    try {
      if (_isLogin) {
        await ref.read(authNotifierProvider.notifier).signIn(email, password);
      } else {
        await ref.read(authNotifierProvider.notifier).signUp(email, password);
      }
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = ref.watch(authNotifierProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.school, size: 56, color: AppTheme.primary),
                  const SizedBox(height: 18),
                  Text(
                    'Sinav Arkadasi',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ders notlarini yukle, AI soru cikarsin, sinava hazirlan',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 32),
                  TextField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'E-posta',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordCtrl,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: 'Sifre',
                      prefixIcon: const Icon(Icons.lock_outlined),
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: const TextStyle(color: AppTheme.error, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: status == AuthStatus.loading ? null : _submit,
                    child: status == AuthStatus.loading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child:
                                CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(_isLogin ? 'Giris Yap' : 'Kayit Ol'),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => setState(() {
                      _isLogin = !_isLogin;
                      _error = null;
                    }),
                    child: Text(
                      _isLogin
                          ? 'Hesabin yok mu? Kayit ol'
                          : 'Zaten hesabin var mi? Giris yap',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/presentation/screens/login_screen.dart
git commit -m "feat: add login/register screen with Supabase auth"
```

---

### Task 14: Flutter Home Screen

**Files:**
- Create: `sinav-arkadasi/lib/presentation/widgets/material_card.dart`
- Create: `sinav-arkadasi/lib/presentation/screens/home_screen.dart`

**Consumes:** `materialsProvider`, `authNotifierProvider`

- [ ] **Step 1: Create material card widget**

```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../data/models/study_material.dart';

class MaterialCard extends StatelessWidget {
  final StudyMaterial material;
  final VoidCallback onTap;

  const MaterialCard({
    super.key,
    required this.material,
    required this.onTap,
  });

  IconData get _fileIcon {
    switch (material.fileType) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'ppt':
        return Icons.slideshow;
      default:
        return Icons.image;
    }
  }

  Color get _statusColor {
    switch (material.status) {
      case 'completed':
        return AppTheme.success;
      case 'processing':
        return AppTheme.warning;
      case 'failed':
        return AppTheme.error;
      default:
        return AppTheme.textSecondary;
    }
  }

  String get _statusText {
    switch (material.status) {
      case 'uploaded':
        return 'Analize hazir';
      case 'processing':
        return 'Analiz ediliyor...';
      case 'completed':
        return '${material.questionCount} soru hazir';
      case 'failed':
        return 'Hata olustu';
      default:
        return material.status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_fileIcon, color: AppTheme.primary, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      material.title,
                      style: Theme.of(context).textTheme.titleLarge,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _statusText,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                children: [
                  Text(
                    DateFormat('dd MMM', 'tr').format(material.createdAt),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    material.fileType.toUpperCase(),
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Create home screen**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/materials_provider.dart';
import '../widgets/material_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final materials = ref.watch(materialsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sinav Arkadasi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authNotifierProvider.notifier).signOut(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/upload'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Yeni Yukle'),
      ),
      body: materials.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
              const SizedBox(height: 12),
              Text('Bir hata olustu', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(err.toString(), style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(materialsProvider.notifier).refresh(),
                child: const Text('Tekrar Dene'),
              ),
            ],
          ),
        ),
        data: (list) {
          if (list.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.upload_file,
                      size: 64, color: AppTheme.primary.withOpacity(0.3)),
                  const SizedBox(height: 16),
                  Text(
                    'Henuz materyal yok',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ders notlarinin fotograflarini cek\nveya PDF/PPT yukle',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(materialsProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                return MaterialCard(
                  material: list[index],
                  onTap: () => context.push('/material/${list[index].id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/presentation/screens/home_screen.dart lib/presentation/widgets/material_card.dart
git commit -m "feat: add home screen with materials list and empty state"
```

---

### Task 15: Flutter Upload Screen

**Files:**
- Create: `sinav-arkadasi/lib/presentation/screens/upload_screen.dart`

**Consumes:** `materialsProvider`, `image_picker`, `file_picker`

- [ ] **Step 1: Create upload screen**

```dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme.dart';
import '../../data/providers/materials_provider.dart';

class UploadScreen extends ConsumerStatefulWidget {
  const UploadScreen({super.key});

  @override
  ConsumerState<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends ConsumerState<UploadScreen> {
  final _picker = ImagePicker();
  final _titleCtrl = TextEditingController();
  String? _filePath;
  String? _fileName;
  bool _uploading = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickFromCamera() async {
    final file = await _picker.pickImage(source: ImageSource.camera);
    if (file != null) {
      setState(() {
        _filePath = file.path;
        _fileName = file.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text = file.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _pickFromGallery() async {
    final file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null) {
      setState(() {
        _filePath = file.path;
        _fileName = file.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text = file.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'ppt', 'pptx'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _filePath = result.files.single.path;
        _fileName = result.files.single.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text = result.files.single.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _upload() async {
    if (_filePath == null) return;
    setState(() => _uploading = true);

    try {
      final title =
          _titleCtrl.text.trim().isEmpty ? 'Isimsiz Materyal' : _titleCtrl.text.trim();
      final material = await ref.read(materialsProvider.notifier).upload(
            _filePath!,
            title,
          );
      if (material.status == 'uploaded' && mounted) {
        context.push('/material/${material.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Materyal Yukle')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_filePath != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _fileName?.endsWith('.pdf') == true ||
                        _fileName?.endsWith('.ppt') == true ||
                        _fileName?.endsWith('.pptx') == true
                    ? Container(
                        height: 200,
                        color: AppTheme.primary.withOpacity(0.05),
                        child: Icon(
                          _fileName!.endsWith('.pdf')
                              ? Icons.picture_as_pdf
                              : Icons.slideshow,
                          size: 64,
                          color: AppTheme.primary,
                        ),
                      )
                    : Image.file(
                        File(_filePath!),
                        height: 250,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Materyal Adi',
                  prefixIcon: Icon(Icons.label_outline),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _uploading ? null : _upload,
                child: _uploading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Yukle ve Analiz Et'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() {
                  _filePath = null;
                  _fileName = null;
                }),
                child: const Text('Dosyayi Degistir'),
              ),
            ] else ...[
              const SizedBox(height: 40),
              Text(
                'Materyal ekle',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Ders notlarinin fotograflarini cek veya\ngaleriden dosya yukle',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ),
              const SizedBox(height: 32),
              _OptionCard(
                icon: Icons.camera_alt,
                title: 'Fotograf Cek',
                subtitle: 'Kamerayi ac, notlarini cek',
                onTap: _pickFromCamera,
              ),
              const SizedBox(height: 12),
              _OptionCard(
                icon: Icons.photo_library,
                title: 'Galeriden Sec',
                subtitle: 'Telefonundaki fotografi yukle',
                onTap: _pickFromGallery,
              ),
              const SizedBox(height: 12),
              _OptionCard(
                icon: Icons.insert_drive_file,
                title: 'PDF / PPT Yukle',
                subtitle: 'Dosya yoneticisinden sec',
                onTap: _pickFile,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OptionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: AppTheme.primary, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppTheme.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/presentation/screens/upload_screen.dart
git commit -m "feat: add upload screen with camera, gallery, and file picker"
```

---

### Task 16: Flutter Material Detail Screen

**Files:**
- Create: `sinav-arkadasi/lib/presentation/widgets/question_card.dart`
- Create: `sinav-arkadasi/lib/presentation/screens/material_detail_screen.dart`

**Consumes:** `materialDetailProvider(id)`

- [ ] **Step 1: Create question card widget**

```dart
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../data/models/question.dart';

class QuestionCard extends StatelessWidget {
  final Question question;
  final int index;

  const QuestionCard({super.key, required this.question, required this.index});

  Color? get _difficultyColor {
    switch (question.difficulty) {
      case 'easy':
        return AppTheme.success;
      case 'hard':
        return AppTheme.error;
      default:
        return AppTheme.warning;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Soru ${index + 1}',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: AppTheme.primary,
                        ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _difficultyColor?.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    question.difficulty == 'easy'
                        ? 'Kolay'
                        : question.difficulty == 'hard'
                            ? 'Zor'
                            : 'Orta',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: _difficultyColor,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              question.questionText,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 14),
            ...List.generate(question.options.length, (i) {
              final isCorrect = i == question.correctOption;
              return Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isCorrect
                      ? AppTheme.success.withOpacity(0.08)
                      : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isCorrect
                        ? AppTheme.success.withOpacity(0.3)
                        : Colors.grey.shade200,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      isCorrect ? Icons.check_circle : Icons.circle_outlined,
                      size: 20,
                      color: isCorrect ? AppTheme.success : AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        question.options[i],
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight:
                                  isCorrect ? FontWeight.w600 : FontWeight.normal,
                              color: isCorrect
                                  ? AppTheme.textPrimary
                                  : AppTheme.textSecondary,
                            ),
                      ),
                    ),
                  ],
                ),
              );
            }),
            if (question.explanation.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.lightbulb_outline,
                        size: 18, color: AppTheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        question.explanation,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textSecondary,
                              fontStyle: FontStyle.italic,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Create material detail screen**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/models/question.dart';
import '../../data/models/study_material.dart';
import '../../data/providers/materials_provider.dart';
import '../widgets/question_card.dart';

class MaterialDetailScreen extends ConsumerStatefulWidget {
  final String materialId;
  const MaterialDetailScreen({super.key, required this.materialId});

  @override
  ConsumerState<MaterialDetailScreen> createState() => _MaterialDetailScreenState();
}

class _MaterialDetailScreenState extends ConsumerState<MaterialDetailScreen> {
  bool _analyzing = false;

  Future<void> _startAnalysis() async {
    setState(() => _analyzing = true);
    try {
      final notifier =
          ref.read(materialDetailProvider(widget.materialId).notifier);
      await notifier.analyze(widget.materialId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Analiz hatasi: $e'),
              backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _analyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(materialDetailProvider(widget.materialId));

    return Scaffold(
      appBar: AppBar(title: const Text('Materyal Detayi')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
              const SizedBox(height: 12),
              Text('Bir hata olustu', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(err.toString(), style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        data: (data) {
          final material = data['material'] as StudyMaterial;
          final questions = data['questions'] as List<Question>;

          if (material.status == 'uploaded') {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.psychology,
                        size: 64, color: AppTheme.primary.withOpacity(0.3)),
                    const SizedBox(height: 16),
                    Text(
                      'Analize hazir',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'AI, bu materyaldeki onemli noktalari\ntespit edip soru cikaracak',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _analyzing ? null : _startAnalysis,
                      child: _analyzing
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Analiz Et'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (material.status == 'processing') {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('AI analiz ediyor...'),
                  SizedBox(height: 4),
                  Text('Bu islem birkac saniye surebilir',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }

          if (material.status == 'failed') {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                    const SizedBox(height: 12),
                    Text('Analiz basarisiz',
                        style: Theme.of(context).textTheme.titleLarge),
                    if (material.errorMessage != null) ...[
                      const SizedBox(height: 4),
                      Text(material.errorMessage!,
                          style: Theme.of(context).textTheme.bodySmall,
                          textAlign: TextAlign.center),
                    ],
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _analyzing ? null : _startAnalysis,
                      child: const Text('Tekrar Dene'),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return QuestionCard(
                question: questions[index],
                index: index,
              );
            },
          );
        },
      ),
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/presentation/screens/material_detail_screen.dart lib/presentation/widgets/question_card.dart
git commit -m "feat: add material detail screen with question display and analysis trigger"
```

---

### Task 17: Flutter Router and App Wiring

**Files:**
- Create: `sinav-arkadasi/lib/presentation/router.dart`

**Produces:** GoRouter configuration with auth guard via direct Supabase session check.

- [ ] **Step 1: Create router**

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/upload_screen.dart';
import 'screens/material_detail_screen.dart';

final _shellKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn =
        Supabase.instance.client.auth.currentSession != null;
    final isOnLogin = state.matchedLocation == '/login';
    if (!isLoggedIn && !isOnLogin) return '/login';
    if (isLoggedIn && isOnLogin) return '/';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (_, __) => const LoginScreen(),
    ),
    ShellRoute(
      navigatorKey: _shellKey,
      builder: (_, __, child) => child,
      routes: [
        GoRoute(
          path: '/',
          builder: (_, __) => const HomeScreen(),
        ),
        GoRoute(
          path: '/upload',
          builder: (_, __) => const UploadScreen(),
        ),
        GoRoute(
          path: '/material/:id',
          builder: (_, state) => MaterialDetailScreen(
            materialId: state.pathParameters['id']!,
          ),
        ),
      ],
    ),
  ],
);
```

- [ ] **Step 2: Verify router import in main.dart**

Confirm `sinav-arkadasi/lib/main.dart` imports `presentation/router.dart` and uses `routerConfig: router`.

- [ ] **Step 3: Add iOS camera/mic permissions**

Create `sinav-arkadasi/ios/Runner/Info.plist` additions (manual step — add these keys):

```xml
<key>NSCameraUsageDescription</key>
<string>Ders notlarinin fotograflarini cekmek icin kamera kullanimi gereklidir</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Ders notlarini yuklemek icin galeri erisimi gereklidir</string>
```

Android permissions already in `AndroidManifest.xml` via flutter create.

- [ ] **Step 4: Commit**

```bash
git add lib/presentation/router.dart ios/
git commit -m "feat: wire up GoRouter with auth guard and all screen routes"
```

---

### Task 18: Final Integration Check

**Files:**
- Modify: `sinav-arkadasi/lib/core/constants.dart`

**Produces:** Updated placeholder values with actual config.

- [ ] **Step 1: Update placeholder constants**

The developer must replace placeholders in `sinav-arkadasi/lib/core/constants.dart`:
- `SUPABASE_URL_PLACEHOLDER` → actual Supabase project URL
- `SUPABASE_ANON_KEY_PLACEHOLDER` → actual Supabase anon key
- `API_BASE_URL_PLACEHOLDER` → Next.js API base URL (e.g. `https://your-app.vercel.app`)

- [ ] **Step 2: Create Supabase storage bucket**

Run in Supabase SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true);

CREATE POLICY "Public read study materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Users can upload study materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-materials' AND auth.uid() = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own study materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-materials' AND auth.uid() = (storage.foldername(name))[1]);
```

- [ ] **Step 3: Verify backend compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Verify Flutter analyzes clean**

```bash
cd sinav-arkadasi && flutter analyze
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add sinav-arkadasi/lib/core/constants.dart
git commit -m "chore: final integration notes and configuration placeholders"
```
