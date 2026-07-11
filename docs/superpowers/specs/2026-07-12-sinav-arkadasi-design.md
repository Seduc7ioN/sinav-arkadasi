# Sinav Arkadasi — Design Spec

## Overview

AI destekli ogrenci calisma asistani mobil uygulamasi. Ogrenci ders notlarinin fotograflarini ceker, PDF/PPT yukler; sistem Gemini AI ile icerigi analiz eder, onemli noktalari belirler ve coktan secmeli sorular uretir. Kullanici bu sorularla quiz yaparak sinava hazirlanir.

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Mobile      | Flutter (iOS + Android)                         |
| Backend     | Next.js 16 (existing project, `/api/study/*`)   |
| Auth        | Supabase Auth (existing)                        |
| Storage     | Supabase Storage (existing)                     |
| Database    | Supabase PostgreSQL (existing)                  |
| AI          | Google Gemini Vision API (OCR + Q&A generation) |
| State Mgmt  | flutter_riverpod                                |
| Routing     | GoRouter                                        |

## System Architecture

```
Flutter App (iOS/Android)
    │
    ├── Supabase SDK ────── Supabase Auth
    │
    └── HTTP ─────────────── Next.js API (/api/study/*)
                                  │
                                  ├── Supabase Storage
                                  ├── Supabase PostgreSQL
                                  └── Google Gemini API
```

Flutter tarafinda Supabase SDK sadece auth icin kullanilir. Dosya yukleme, analiz ve quiz islemleri Next.js API uzerinden gider. Gemini API key sadece server tarafinda bulunur.

## Data Flow

1. Kullanici kameradan fotograf ceker veya galeriden PDF/PPT secer
2. Flutter, dosyayi `POST /api/study/upload` endpoint'ine gonderir
3. API dosyayi Supabase Storage'a yukler, `study_materials` tablosuna `status=uploaded` kaydi atar
4. Flutter, `POST /api/study/analyze` endpoint'ini cagirir
5. API, Gemini Vision API'ye dosyayi gonderir:
   - OCR ile metin cikarimi
   - Onemli kavram ve noktalarin belirlenmesi
   - Coktan secmeli soru ve cevap uretimi (4 secenekli)
6. Uretilen sorular `questions` tablosuna kaydedilir, material status'u `completed` olur
7. Kullanici quiz ekraninda sorulari cevaplar
8. Cevaplar `POST /api/study/quiz/submit` ile gonderilir, sonuc hesaplanir

## Database Schema

### study_materials

| Column       | Type        | Description                                |
| ------------ | ----------- | ------------------------------------------ |
| id           | uuid        | PK, default gen_random_uuid()              |
| user_id      | uuid        | FK → auth.users, NOT NULL                  |
| title        | text        | User-given name for the material           |
| file_type    | text        | 'image', 'pdf', 'ppt'                      |
| storage_path | text        | Path in Supabase Storage                   |
| status       | text        | 'uploaded', 'processing', 'completed', 'failed' |
| page_count   | int4        | Number of pages (PDF/PPT)                  |
| error_message| text        | Error description if status='failed'       |
| created_at   | timestamptz | DEFAULT now()                              |
| updated_at   | timestamptz | DEFAULT now()                              |

RLS: Users can only access their own materials.

### questions

| Column        | Type        | Description                                |
| ------------- | ----------- | ------------------------------------------ |
| id            | uuid        | PK, default gen_random_uuid()              |
| material_id   | uuid        | FK → study_materials, ON DELETE CASCADE    |
| question_text | text        | The question                               |
| options       | jsonb       | ["A) ...", "B) ...", "C) ...", "D) ..."]   |
| correct_option| int2        | Index of correct answer (0-3)              |
| explanation   | text        | Why this answer is correct                 |
| difficulty    | text        | 'easy', 'medium', 'hard'                   |
| created_at    | timestamptz | DEFAULT now()                              |

RLS: Users can read questions for their own materials.

### quiz_sessions

| Column       | Type        | Description                                |
| ------------ | ----------- | ------------------------------------------ |
| id           | uuid        | PK, default gen_random_uuid()              |
| user_id      | uuid        | FK → auth.users, NOT NULL                  |
| material_id  | uuid        | FK → study_materials                       |
| score        | int4        | Correct answers count                      |
| total        | int4        | Total questions                            |
| status       | text        | 'in_progress', 'completed'                 |
| started_at   | timestamptz | DEFAULT now()                              |
| completed_at | timestamptz | NULL until completed                       |

RLS: Users can only access their own sessions.

### quiz_answers

| Column         | Type        | Description                                |
| -------------- | ----------- | ------------------------------------------ |
| id             | uuid        | PK, default gen_random_uuid()              |
| session_id     | uuid        | FK → quiz_sessions, ON DELETE CASCADE      |
| question_id    | uuid        | FK → questions                             |
| selected_option| int2        | User's selected option index (0-3) or NULL |
| is_correct     | bool        | Whether the answer was correct             |

RLS: Users can read answers for their own sessions.

## API Endpoints

### POST /api/study/upload
Accepts multipart form data with a file. Validates file type (image/jpeg, image/png, application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation). Uploads to Supabase Storage under `{user_id}/{material_id}.{ext}`. Creates study_material record with status `uploaded`. Returns material object.

### POST /api/study/analyze
Body: `{ materialId: string }`. Fetches the file from Supabase Storage. Sends to Gemini Vision API with a structured prompt to:
1. Extract all text via OCR
2. Identify key concepts and important points
3. Generate 10 multiple-choice questions with 4 options each
4. Mark the correct option index
5. Provide a brief explanation for each answer

Parses Gemini's JSON response, inserts questions into `questions` table, updates material status to `completed`. Returns array of questions.

### GET /api/study/materials
Returns all study_materials for the authenticated user, ordered by created_at DESC. Includes question count for each material.

### GET /api/study/[id]
Returns a single study_material with all its questions. Requires that the material belongs to the authenticated user.

### POST /api/study/quiz
Body: `{ materialId: string }`. Creates a new quiz_session with status `in_progress`. Returns session with shuffled questions.

### POST /api/study/quiz/submit
Body: `{ sessionId: string, answers: [{ questionId: string, selectedOption: number }] }`. Evaluates answers against correct options. Inserts quiz_answers records. Updates quiz_session with score and status `completed`. Returns result with per-question feedback.

## Flutter App Structure

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── theme.dart
│   ├── router.dart
│   └── constants.dart
├── data/
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── materials_provider.dart
│   │   └── quiz_provider.dart
│   ├── repositories/
│   │   ├── auth_repo.dart
│   │   ├── study_repo.dart
│   │   └── quiz_repo.dart
│   └── models/
│       ├── study_material.dart
│       ├── question.dart
│       └── quiz_session.dart
└── presentation/
    ├── screens/
    │   ├── login_screen.dart
    │   ├── register_screen.dart
    │   ├── home_screen.dart
    │   ├── upload_screen.dart
    │   ├── material_detail.dart
    │   ├── quiz_screen.dart
    │   └── quiz_result_screen.dart
    └── widgets/
        ├── material_card.dart
        ├── question_card.dart
        ├── upload_bottom_sheet.dart
        └── quiz_progress.dart
```

## Screen Flow

```
Login / Register ──▶ Home (material list)
                        │
                        ├──▶ Upload (camera / gallery / file picker)
                        │       │
                        │       └──▶ MaterialDetail (loading → questions)
                        │
                        └──▶ MaterialDetail (tap existing)
                                │
                                └──▶ QuizScreen ──▶ QuizResult
```

## MVP Scope

- [x] Supabase Auth (email/password login + register)
- [x] Camera capture (take photo of notes)
- [x] PDF & PPT upload from device
- [x] AI analysis (Gemini Vision → OCR + Q&A extraction)
- [ ] Quiz mode (multiple choice quiz) — Phase 2

## Gemini Prompt Strategy

The prompt sent to Gemini will be in Turkish:

```
Sen bir egitim asistanisin. Yuklenen belge/fotograftaki tum metni OCR ile cikar.
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
      "question": "Soru metni",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "Aciklama",
      "difficulty": "medium"
    }
  ]
}
```

## Security

- Gemini API key stored in `.env.local`, never exposed to client
- All API routes check Supabase auth session via `createClient` with cookies
- RLS policies on all tables restrict access to owning user
- File uploads validated for type and size (max 20MB)
- Rate limiting on analyze endpoint (5 requests per minute per user)

## Error Handling

- Upload failures: show snackbar, retry button
- AI analysis timeout (30s): set status to `failed`, offer retry
- Network errors: offline detection, cached materials list
- Empty/unreadable content: return user-friendly message
