# Sınav Arkadaşı — PWA + Logo Design Spec

**Date:** 2026-07-12  
**Scope:** Make both the Flutter web app and the Next.js backend PWA-compatible, and design/apply a unified logo/icon set.

---

## 1. Logo & Brand

### Concept
"Akıllı Not" — a friendly, modern app icon showing a rounded-square note with AI sparkle.

### Final Direction
- **Shape:** Rounded square (suitable for iOS, Android adaptive icons, and maskable PWA icons)
- **Background:** Indigo-to-violet gradient (`#6366F1` → `#8B5CF6`)
- **Foreground:** White note lines + yellow/gold sparkle
- **Style:** Flat, minimalist, app-store ready

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#6366F1` | Brand color, theme color, buttons |
| Secondary | `#8B5CF6` | Gradient end, accents |
| Accent | `#F59E0B` / `#FCD34D` | Sparkle, highlights, success states |
| Background | `#FFFFFF` | App screens |
| Surface | `#F8FAFC` | Cards, empty states |

### Asset Deliverables
- `logo.svg` — source vector
- `logo-1024.png` — app store source
- `icon-512.png` — PWA / Android adaptive
- `icon-192.png` — PWA
- `icon-180.png` — Apple touch icon
- `icon-32.png` — favicon
- `icon-maskable-512.png` — maskable PWA icon with safe zone

---

## 2. Flutter Web PWA

### Files to Create/Modify
- `sinav_arkadasi/web/manifest.json`
- `sinav_arkadasi/web/index.html`
- `sinav_arkadasi/web/icons/` (all PNG assets)
- `sinav_arkadasi/pubspec.yaml` — add `flutter_launcher_icons` and `flutter_native_splash`
- `sinav_arkadasi/flutter_launcher_icons.yaml` — config for iOS/Android icons

### Manifest
```json
{
  "name": "Sınav Arkadaşı",
  "short_name": "SınavArkadaşı",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#6366F1",
  "theme_color": "#6366F1",
  "orientation": "portrait",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Behavior
- App installs to home screen on supported mobile browsers
- Launches in standalone mode (no browser chrome)
- Theme color matches brand indigo

---

## 3. Next.js PWA

### Files to Create/Modify
- `src/app/manifest.ts` (or `public/manifest.json`)
- `public/icons/` (reuse Flutter icon set or generate separate sizes)
- `src/app/layout.tsx` — add metadata for PWA, apple-touch-icon, theme-color

### Manifest
Same manifest fields as Flutter, adapted for Next.js:
- `name`: "Sınav Arkadaşı Admin"
- `short_name`: "SınavArkadası"
- `start_url`: "/"
- `display`: "standalone"
- `theme_color`: `#6366F1`
- `background_color`: `#6366F1`

### Optional Enhancement
- Install `next-pwa` to add a service worker and offline caching
- Scope limited to static assets and API fallback pages

---

## 4. Icon Generation Workflow

1. Design final logo in SVG
2. Export PNGs at required sizes
3. Place Flutter icons in `sinav_arkadasi/web/icons/`
4. Place Next.js icons in `public/icons/`
5. Run `flutter_launcher_icons` to generate Android/iOS native icons
6. Verify maskable icon using Chrome DevTools "Manifest" panel

---

## 5. Success Criteria

- [ ] Logo exists as SVG and PNG in all required sizes
- [ ] Flutter web PWA passes Chrome Lighthouse PWA audit (at least installable)
- [ ] Next.js site has a valid manifest and icons
- [ ] Both apps share the same brand colors and iconography
- [ ] No secrets or environment-specific URLs committed in new files

---

## 6. Out of Scope

- Splash screen animation
- Push notifications
- Offline data sync (beyond static asset caching)
- Separate admin branding
