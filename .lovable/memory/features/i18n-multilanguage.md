---
name: Multi-language Support (i18n)
description: EN/FR translations using react-i18next with localStorage persistence and language switcher pill
type: feature
---
- Library: `react-i18next` + `i18next` + `i18next-browser-languagedetector`
- Config: `src/i18n/index.ts`, imported in `main.tsx`
- Translation files: `src/i18n/en.json`, `src/i18n/fr.json`
- Language switcher: `src/components/LanguageSwitcher.tsx` — EN|FR pill with teal highlight
- Persistence: localStorage key `vibehub-lang`
- Applied to: Navbar, Footer, Index (hero/stats/CTA), BentoGallery, Events page, AdminSidebar
- Use `useTranslation()` hook and `t("key")` pattern in all components
