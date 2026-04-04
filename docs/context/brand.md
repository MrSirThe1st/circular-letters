# Brand and Localization

## Design Philosophy

**Intent:** "A quiet night reading space for reflection and listening"

This app should feel like a calm, book-like reading experience optimized for sermons (text + audio). Not a gaming UI, social media dark mode, or high-tech dashboard.

## Color Palette

### Base Colors (Comfortable Reading)
- `#0B0F14` — Deep ink (primary dark background)
- `#FFFFFF` — Pure text / light mode background
- `#F4F6F8` — Soft reading background (reduces eye strain)
- `#111826` — Card / elevated surfaces
- `#1A2332` — Secondary panels (modals, drawers)
- `#243044` — Borders / separators

**Rationale:** Avoids pure black/white contrast for calm reading feel and less eye strain.

### Accent Colors
- `#6D5EF6` — Primary accent (deep purple, spiritual/reflective tone)
  - Use for: CTA buttons, active states, key highlights, audio progress
- `#22C55E` — Success (saved highlights, downloads complete)
- `#F59E0B` — Warning (offline mode, pending sync)
- `#EF4444` — Error

**Why purple instead of blue:**
- Feels spiritual/reflective (fits sermon context)
- Less aggressive than blue
- Modern and clear for UI actions

### Text Colors (Dark Mode)
- `#FFFFFF` — Primary text (sermon titles, body)
- `#CBD5E1` — Secondary text (notes, metadata)
- `#94A3B8` — Muted text (timestamps, less important info)

## Typography

### Font Family
- **GALANO GROTESQUE** (brand font)

### Weights and Usage
- **Semi Bold:** logo wordmark and strong headings
- **Regular:** body copy and standard UI text

### Reading Experience Rules (Critical for Sermons)
- **Line height:** 1.7 – 1.9 (reading rhythm)
- **Max text width:** narrow column (not full screen stretch)
- **Paragraph spacing:** generous (aids comprehension)
- **Line background:** slightly lifted (`#111826` on dark sections)

**Design direction:** Contemporary, strong sans-serif aligned with brand identity.

## Audio UI Guidelines

Audio player should feel **visually calm:**
- Background: `#111826`
- Active progress: `#6D5EF6`
- Inactive progress: `#243044`
- No flashy gradients or animations

## Theme Reference

All values centralized in: `packages/shared/src/theme.ts`

## Localization and Market

- Primary market: Republique Democratique du Congo.
- Primary product language: French.
- Product copy, labels, and workflows should be written French-first by default.
- Support local formatting for date, currency, and number display in DRC context.