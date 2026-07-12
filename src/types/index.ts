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
