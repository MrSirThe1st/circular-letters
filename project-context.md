# Project Context - Sermon App

## Product Direction

Digital library for church sermons. Users read/listen to teachings. Church manages content via admin dashboard.

## Product Sides

1. **User side (mobile app)**
   - Public or member access
   - Browse sermons by date
   - Read sermon text (clean, structured)
   - Listen to audio (background playback via expo-av)
   - Search by title/date (later: search within content)
   - Offline access (later phase)

2. **Admin side (web dashboard)**
   - Church uploads/manages sermons
   - Create sermon: title, date, text, audio file, optional PDF
   - PDF text extraction (draft → review → publish)
   - Lexical editor for text review/formatting
   - Publish/unpublish sermons

## Core Data Backbone

All features map to these entities:
- Sermon (title, date, text, status)
- Audio (file, duration, linked to sermon)
- Category/Tag (later phase)
- User (admin only for MVP; public access no auth)

If a feature doesn't strengthen these entities or their workflows, it's not a priority.

## Core Workflows

1. **Content creation flow:**
   - Admin uploads PDF or pastes text
   - System extracts/cleans text (if PDF)
   - Text loaded into Lexical editor
   - Admin reviews/corrects formatting
   - Admin uploads audio file
   - Publish sermon → appears in mobile app

2. **User consumption flow:**
   - User opens app → sees sermon list (newest first)
   - User taps sermon → reads text
   - User plays audio → listens (background playback)
   - User searches for specific teaching

## Product Priorities and Non-Goals

Priority now:
- Sermon CRUD (upload, edit, publish)
- PDF text extraction + review workflow
- Lexical editor for text formatting
- Audio upload/playback (expo-av)
- Mobile reading experience
- Basic search (title/date)

Not current priority:
- User accounts (later: favorites, notes)
- Advanced search (semantic, within content)
- Video sermons
- Comments/community features
- Analytics/tracking

## Fixed Technical Decisions

| Concern | Decision |
|---|---|
| Web | Next.js App Router (admin dashboard only) |
| Mobile | Expo (user-facing app) |
| Language | TypeScript strict, no `any` |
| Auth | Supabase Auth (admin only for MVP) |
| Data | PostgreSQL (Supabase) |
| Audio | expo-av (mobile playback) |
| PDF | pdf-parse (server-side extraction) |
| Editor | Lexical (rich text editing) |
| Validation | Zod at API boundaries |
| API shape | `{ success: true; data: T }` or `{ success: false; error: string }` |
| Authorization | Server-side checks; admin role required for mutations |
| Shared logic | Keep in packages/shared, no duplication |

## Text Processing Pipeline

Critical flow for sermon quality:
1. **Upload:** PDF or pasted text
2. **Extract:** (if PDF) raw text extraction via pdf-parse
3. **Clean:** fix line breaks, merge sentences, remove artifacts
4. **Structure:** convert to Lexical JSON (paragraphs, quotes, headings)
5. **Review:** admin edits in Lexical editor (human validation)
6. **Publish:** save to DB, index for search

**Rule:** Step 5 is mandatory human confirmation. Never auto-publish extracted text.

## Domain Glossary

| Term | Definition |
|---|---|
| Sermon | Teaching record (title, date, text, audio) |
| Audio | MP3/audio file linked to sermon |
| Draft | Extracted text awaiting admin review |
| Published | Sermon visible in mobile app |
| Category | Topical grouping (deferred) |

## Detailed Context Modules (Load On Demand)

Use these docs only when task needs them:
- `docs/context/features-mobile.md` — mobile app screens and features
- `docs/context/features-admin.md` — admin dashboard screens
- `docs/context/text-processing.md` — PDF extraction and cleaning logic
