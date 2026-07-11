export type ProjectStatus = "draft" | "processing" | "completed" | "failed"

export type ImageType =
  | "original"
  | "white_bg"
  | "transparent"
  | "lifestyle"
  | "ai_background"
  | "shadow"
  | "enhanced"

export type ContentType = "description" | "seo_title" | "seo_description" | "keywords" | "marketing_copy"

export type Marketplace = "trendyol" | "amazon" | "etsy" | "shopify" | "hepsiburada"

export type ExportStatus = "pending" | "completed" | "failed"

export type JobType =
  | "remove_bg"
  | "gen_bg"
  | "enhance"
  | "gen_description"
  | "gen_keywords"
  | "gen_seo"

export type JobStatus = "queued" | "processing" | "completed" | "failed"

export interface Project {
  id: string
  user_id: string
  title: string
  status: ProjectStatus
  original_image: string | null
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  type: ImageType
  url: string
  prompt: string | null
  width: number | null
  height: number | null
  file_size: number | null
  created_at: string
}

export interface ProjectContent {
  id: string
  project_id: string
  type: ContentType
  content: string
  locale: string
  created_at: string
}

export interface MarketplaceExport {
  id: string
  project_id: string
  marketplace: Marketplace
  status: ExportStatus
  config: Record<string, unknown>
  exported_at: string | null
}

export interface AIJob {
  id: string
  project_id: string
  type: JobType
  provider: string
  status: JobStatus
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
  cost: number | null
  duration_ms: number | null
  created_at: string
  completed_at: string | null
}

export interface UserMetadata {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  credits: number
}

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
