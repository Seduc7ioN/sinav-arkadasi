# PWA + Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design and apply a unified minimalist logo/icon set, and make both the Flutter web app and the Next.js backend installable as PWA.

**Architecture:** A single SVG source drives all icon assets. Flutter web uses a static `manifest.json` and `index.html` updates. iOS/Android native icons are generated via `flutter_launcher_icons`. Next.js uses `src/app/manifest.ts` and metadata in `src/app/layout.tsx`.

**Tech Stack:** Flutter 3.x, Next.js 14/15, SVG, `sips` (macOS) for PNG conversion, `flutter_launcher_icons` Dart package.

## Global Constraints

- Logo must use indigo-to-violet gradient (`#6366F1` → `#8B5CF6`) with yellow/gold sparkle (`#FCD34D`).
- All PWA manifests must set `display: standalone`, `theme_color: #6366F1`, `background_color: #6366F1`.
- Flutter web manifest must reference `icons/icon-192.png`, `icons/icon-512.png`, and maskable variants.
- Next.js manifest and icons must live under `public/`.
- No environment secrets or `.env` values in committed files.
- After each task, commit before proceeding.

---

## Task 1: Create SVG Logo Source

**Files:**
- Create: `sinav_arkadasi/assets/logo.svg`
- Create: `public/logo.svg`

**Interfaces:**
- Produces: `logo.svg` used as the single source for all PNG icon exports.

- [ ] **Step 1: Write the SVG logo file**

Create `sinav_arkadasi/assets/logo.svg`:

```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="url(#brandGradient)"/>
  <rect x="296" y="336" width="432" height="48" rx="24" fill="white" fill-opacity="0.95"/>
  <rect x="296" y="456" width="336" height="48" rx="24" fill="white" fill-opacity="0.75"/>
  <rect x="296" y="576" width="384" height="48" rx="24" fill="white" fill-opacity="0.75"/>
  <path d="M760 304L786.5 370.5L853 397L786.5 423.5L760 490L733.5 423.5L667 397L733.5 370.5L760 304Z" fill="#FCD34D"/>
  <defs>
    <linearGradient id="brandGradient" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366F1"/>
      <stop offset="1" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
</svg>
```

- [ ] **Step 2: Copy the same SVG to the Next.js public folder**

Run:

```bash
cp sinav_arkadasi/assets/logo.svg public/logo.svg
```

- [ ] **Step 3: Commit**

```bash
git add sinav_arkadasi/assets/logo.svg public/logo.svg
git commit -m "assets: add brand logo SVG source"
```

---

## Task 2: Generate PNG Icons from SVG

**Files:**
- Create: `sinav_arkadasi/web/icons/icon-192.png`
- Create: `sinav_arkadasi/web/icons/icon-512.png`
- Create: `sinav_arkadasi/web/icons/icon-maskable-512.png`
- Create: `sinav_arkadasi/web/favicon.png`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `public/icons/icon-180.png`
- Create: `public/icons/icon-32.png`

**Interfaces:**
- Consumes: `sinav_arkadasi/assets/logo.svg`
- Produces: PNG icon set consumed by Flutter web, Next.js, and favicon.

- [ ] **Step 1: Generate standard icons using sips (macOS)**

Run from repo root:

```bash
mkdir -p sinav_arkadasi/web/icons public/icons
sips -z 192 192 sinav_arkadasi/assets/logo.svg --out sinav_arkadasi/web/icons/icon-192.png
sips -z 512 512 sinav_arkadasi/assets/logo.svg --out sinav_arkadasi/web/icons/icon-512.png
sips -z 512 512 sinav_arkadasi/assets/logo.svg --out sinav_arkadasi/web/icons/icon-maskable-512.png
sips -z 192 192 sinav_arkadasi/assets/logo.svg --out sinav_arkadasi/web/favicon.png
sips -z 192 192 sinav_arkadasi/assets/logo.svg --out public/icons/icon-192.png
sips -z 512 512 sinav_arkadasi/assets/logo.svg --out public/icons/icon-512.png
sips -z 180 180 sinav_arkadasi/assets/logo.svg --out public/icons/icon-180.png
sips -z 32 32 sinav_arkadasi/assets/logo.svg --out public/icons/icon-32.png
```

- [ ] **Step 2: Verify files were created**

Run:

```bash
ls -la sinav_arkadasi/web/icons/ public/icons/
```

Expected: each file listed above has non-zero size.

- [ ] **Step 3: Commit**

```bash
git add sinav_arkadasi/web/icons/ sinav_arkadasi/web/favicon.png public/icons/
git commit -m "assets: generate PNG icon set from logo SVG"
```

---

## Task 3: Update Flutter Web PWA Manifest and Index

**Files:**
- Modify: `sinav_arkadasi/web/manifest.json`
- Modify: `sinav_arkadasi/web/index.html`

**Interfaces:**
- Consumes: `sinav_arkadasi/web/icons/icon-*.png`, `sinav_arkadasi/web/favicon.png`

- [ ] **Step 1: Replace Flutter web manifest**

Update `sinav_arkadasi/web/manifest.json` to:

```json
{
  "name": "Sınav Arkadaşı",
  "short_name": "SınavArkadaşı",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#6366F1",
  "theme_color": "#6366F1",
  "description": "AI destekli öğrenci çalışma asistanı. Notlarını çek, soru üretsin.",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 2: Update index.html meta tags**

Modify `sinav_arkadasi/web/index.html` inside `<head>`:

```html
<meta charset="UTF-8">
<meta content="IE=Edge" http-equiv="X-UA-Compatible">
<meta name="description" content="AI destekli öğrenci çalışma asistanı. Notlarını çek, soru üretsin.">

<!-- iOS meta tags & icons -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Sınav Arkadaşı">
<link rel="apple-touch-icon" href="icons/icon-192.png">

<!-- Favicon -->
<link rel="icon" type="image/png" href="favicon.png"/>

<title>Sınav Arkadaşı</title>
<link rel="manifest" href="manifest.json">
```

- [ ] **Step 3: Remove old default Flutter icons if present**

Run:

```bash
rm -f sinav_arkadasi/web/icons/Icon-192.png sinav_arkadasi/web/icons/Icon-512.png sinav_arkadasi/web/icons/Icon-maskable-192.png sinav_arkadasi/web/icons/Icon-maskable-512.png
```

- [ ] **Step 4: Commit**

```bash
git add sinav_arkadasi/web/manifest.json sinav_arkadasi/web/index.html
git commit -m "feat(flutter): update PWA manifest and meta tags for Sınav Arkadaşı branding"
```

---

## Task 4: Add Flutter Launcher Icons for iOS/Android

**Files:**
- Modify: `sinav_arkadasi/pubspec.yaml`
- Create: `sinav_arkadasi/flutter_launcher_icons.yaml`
- Modify: generated `sinav_arkadasi/android/app/src/main/res/**` and `sinav_arkadasi/ios/Runner/Assets.xcassets/**` after generation.

**Interfaces:**
- Consumes: `sinav_arkadasi/assets/logo.svg` (converted to 1024x1024 PNG first)

- [ ] **Step 1: Generate 1024x1024 PNG for launcher icon source**

Run:

```bash
sips -z 1024 1024 sinav_arkadasi/assets/logo.svg --out sinav_arkadasi/assets/logo-1024.png
```

- [ ] **Step 2: Add dev dependency and config**

Add to `sinav_arkadasi/pubspec.yaml` under `dev_dependencies`:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  flutter_launcher_icons: ^0.14.0
```

Create `sinav_arkadasi/flutter_launcher_icons.yaml`:

```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/logo-1024.png"
  adaptive_icon_background: "#6366F1"
  adaptive_icon_foreground: "assets/logo-1024.png"
  min_sdk_android: 21
  remove_alpha_ios: true
```

- [ ] **Step 3: Run the generator**

Run:

```bash
cd sinav_arkadasi && flutter pub get && flutter pub run flutter_launcher_icons
```

- [ ] **Step 4: Commit generated assets**

```bash
git add sinav_arkadasi/pubspec.yaml sinav_arkadasi/flutter_launcher_icons.yaml sinav_arkadasi/assets/logo-1024.png sinav_arkadasi/android/app/src/main/res/ sinav_arkadasi/ios/Runner/Assets.xcassets/
git commit -m "feat(flutter): generate iOS/Android launcher icons from brand logo"
```

---

## Task 5: Update Next.js PWA Manifest and Layout

**Files:**
- Create: `src/app/manifest.ts`
- Modify: `src/app/layout.tsx`
- Create: `public/icons/icon-maskable-512.png`

**Interfaces:**
- Consumes: `public/icons/icon-*.png`, `public/logo.svg`

- [ ] **Step 1: Create Next.js manifest**

Create `src/app/manifest.ts`:

```typescript
import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sınav Arkadaşı",
    short_name: "SınavArkadaşı",
    description: "AI destekli öğrenci çalışma asistanı.",
    start_url: "/",
    display: "standalone",
    background_color: "#6366F1",
    theme_color: "#6366F1",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
```

- [ ] **Step 2: Generate maskable icon for Next.js**

Run:

```bash
sips -z 512 512 sinav_arkadasi/assets/logo.svg --out public/icons/icon-maskable-512.png
```

- [ ] **Step 3: Update layout metadata**

Modify `src/app/layout.tsx` to include PWA metadata. In the `metadata` export add:

```typescript
export const metadata = {
  title: "Sınav Arkadaşı",
  description: "AI destekli öğrenci çalışma asistanı.",
  icons: {
    icon: "/icons/icon-32.png",
    apple: "/icons/icon-180.png",
  },
  themeColor: "#6366F1",
  appleWebApp: {
    capable: true,
    title: "Sınav Arkadaşı",
    statusBarStyle: "black-translucent",
  },
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/manifest.ts src/app/layout.tsx public/icons/icon-maskable-512.png
git commit -m "feat(nextjs): add PWA manifest and layout metadata"
```

---

## Task 6: Verify PWA Installability

**Files:**
- N/A (verification only)

- [ ] **Step 1: Build Flutter web and check manifest**

Run:

```bash
cd sinav_arkadasi && flutter build web
```

Then verify `build/web/manifest.json` exists and references the new icons.

- [ ] **Step 2: Run Next.js and check Lighthouse**

Run:

```bash
npm run dev
```

Open `http://localhost:3000` in Chrome. In DevTools > Lighthouse, run a PWA audit. Expected: manifest and icons are detected; installability depends on service worker (optional).

- [ ] **Step 3: Commit any fixes if needed**

If any path or size issue is found, fix and commit with message `fix: correct PWA icon paths`.

---

## Self-Review

**Spec coverage:**
- Logo concept and color palette → Tasks 1 and 2.
- Flutter web PWA → Task 3.
- Flutter iOS/Android launcher icons → Task 4.
- Next.js PWA → Task 5.
- Verification → Task 6.

**Placeholder scan:**
- All steps include exact file paths, exact code, and exact commands.
- No TBD/TODO/filler phrases.

**Type consistency:**
- Manifest keys match between Flutter JSON and Next.js `MetadataRoute.Manifest`.
- Icon paths are consistent within each app (`sinav_arkadasi/web/icons/` vs `public/icons/`).
