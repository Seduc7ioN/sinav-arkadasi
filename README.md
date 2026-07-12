# Sınav Arkadaşı

AI destekli öğrenci çalışma asistanı. Ders notlarını, kitap sayfalarını veya slaytlarını yükle; yapay zekâ sana özel çoktan seçmeli sorular ve açıklamalı cevaplar oluştursun.

## Proje Yapısı

- `sinav_arkadasi/` — Flutter mobil ve web uygulaması (iOS, Android, Web)
- `src/app/api/study/` — Next.js backend API'leri
  - `upload` — dosya yükleme (Supabase Storage)
  - `analyze` — AI ile soru analizi (Gemini)
  - `materials` — kullanıcı materyallerini listele
  - `[id]` — materyal ve sorularını getir
- `src/lib/ai/study-analyzer.ts` — Gemini Vision ile soru üretimi
- `src/lib/supabase/` — Supabase istemci ve auth yardımcıları

## Teknolojiler

- **Frontend:** Flutter, Riverpod, Go Router
- **Backend:** Next.js 16, TypeScript
- **Veritabanı & Auth:** Supabase
- **AI:** Google Gemini API
- **Deploy:** Vercel (Next.js), App Stores / Web (Flutter)

## Geliştirme

### Backend

```bash
npm install
npm run dev
```

`.env.local` dosyasına şunları ekle:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

### Flutter

```bash
cd sinav_arkadasi
flutter pub get
flutter run
```

## Deploy

Next.js backend otomatik olarak Vercel'e deploy edilir. Flutter web için `flutter build web` komutuyla statik dosyalar üretilir.

## Lisans

Tüm hakları saklıdır.
