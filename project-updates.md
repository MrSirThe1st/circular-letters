# Project Updates

Append-only change log. Read this first before exploring codebase.

## 2026-04-20
- Type: Frontend | API
- Description: Added controllable ElevenLabs voice tuning (speed/settings) and paragraph pause controls
- Impact:
  - Extended TTS API payload in `apps/web-admin/app/api/sermons/tts/with-timestamps/route.ts` with `voiceSettings` and `paragraphPauseMs`
  - Extended ElevenLabs helper in `apps/web-admin/lib/sermons/elevenlabs.ts` to forward `voice_settings` including speed
  - Added review UI controls in `apps/web-admin/components/sermon-tts-preview.tsx` for speed (0.85-0.92), pause, stability, similarity boost, style, and speaker boost
- Tests: Pending web-admin validation

- Type: Frontend
- Description: Added dedicated draft review workflow separate from sermon editing
- Impact:
  - Added review route `apps/web-admin/app/sermons/[id]/review/page.tsx` with text/audio/TTS preview and publish action
  - Kept edit route focused on modifications in `apps/web-admin/app/sermons/[id]/page.tsx`, with link to review page
  - Added explicit `Revoir` action in `apps/web-admin/components/sermon-list.tsx`
  - Split sermon index into `Brouillons a revoir` and `Sermons publies` sections in `apps/web-admin/app/sermons/page.tsx`
  - Updated TTS preview component to preload previously saved sermon TTS data
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: API
- Description: Regenerate TTS now cleans previous persisted audio file
- Impact:
  - Updated `apps/web-admin/app/api/sermons/tts/with-timestamps/route.ts` to remove prior `tts_audio_path` from storage after a successful new TTS save
  - Prevents orphan accumulation when admins regenerate sermon voice multiple times
- Tests: Pending web-admin validation

- Type: DB | API
- Description: Persisted ElevenLabs TTS audio and alignment metadata for sermons
- Impact:
  - Added sermon TTS columns in `db/migrations/20260420183000_add_sermon_tts_columns.sql` and `supabase/migrations/20260420183000_add_sermon_tts_columns.sql`
  - Extended sermon repository mapping and added `saveSermonTts` mutation in `apps/web-admin/lib/sermons/sermon-repository.ts`
  - Updated `POST /api/sermons/tts/with-timestamps` to upload generated audio to Supabase storage and persist alignment metadata
  - Updated shared/mobile sermon types to carry optional persisted `tts` payload
  - Updated admin TTS preview UI to play saved audio URL instead of temporary base64 response
- Tests: Pending web-admin validation

- Type: Frontend | API
- Description: Added admin sermon-page TTS preview UI for ElevenLabs alignment validation
- Impact:
  - Added client component `apps/web-admin/components/sermon-tts-preview.tsx` to call `/api/sermons/tts/with-timestamps`
  - Wired the preview panel into `apps/web-admin/app/sermons/[id]/page.tsx` with voice/model/output controls
  - Added lightweight styles for the TTS preview panel in `apps/web-admin/app/globals.css`
- Tests: Pending web-admin validation

- Type: API | Mobile
- Description: Added ElevenLabs TTS with timestamps spike route for sermon text/audio sync validation
- Impact:
  - Added protected Node route `POST /api/sermons/tts/with-timestamps` in `apps/web-admin/app/api/sermons/tts/with-timestamps/route.ts`
  - Added server-only ElevenLabs client helper with response validation in `apps/web-admin/lib/sermons/elevenlabs.ts`
  - Reused existing Lexical plain-text extraction to generate TTS input from sermon content and return alignment metadata + audio base64
  - Documented required ElevenLabs env vars in `apps/web-admin/.env.example`
- Tests: Pending web-admin validation

- Type: Mobile | Other
- Description: Started MVP step 1 and 2 with sprint scope lock and mobile read-flow scaffold
- Impact:
  - Added two-sprint MVP execution scope and acceptance criteria in `docs/context/mvp-sprints.md`
  - Scaffolded Expo Router mobile read flow with sermon list and detail screens under `apps/mobile/app`
  - Added typed mock-backed data service, lexical text extraction fallback, and calm audio player shell in `apps/mobile/src`
- Tests: Deferred (mobile Expo dependencies are not installed in this workspace yet)

- Type: API | Mobile
- Description: Added public published-sermons API and switched mobile service to API-first reads
- Impact:
  - Added public list route `GET /api/public/sermons` with Zod query validation (`search`, `limit`, `offset`) and `ApiResult<Sermon[]>`
  - Added public detail route `GET /api/public/sermons/[id]` with UUID param validation and published-only visibility
  - Added repository helpers in `apps/web-admin/lib/sermons/sermon-repository.ts` for published-only list/detail reads
  - Updated `apps/mobile/src/services/sermons-api.ts` to fetch from public API first and fall back to local mocks if API is unavailable
- Tests: `pnpm --filter web-admin typecheck` (pass) ; `pnpm --filter mobile typecheck` (blocked: Expo/React modules missing in mobile workspace dependencies)

## 2026-04-04
- Type: Frontend | API
- Description: Added Supabase Storage audio upload to the sermon admin flow
- Impact:
  - Added an admin-only audio upload route that validates file size and MIME type, auto-creates the configured storage bucket if needed, and returns a public audio URL
  - Wired sermon create/edit forms to upload audio before save and persist the resulting `audio_url` through the existing sermon contracts and repository layer
  - Added inline audio preview in the form, sermon list, and sermon detail preview so editors can confirm the linked file before publishing
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Frontend | API
- Description: Made PDF import formatting conservative by removing automatic scripture and heading detection
- Impact:
  - PDF import now keeps text cleanup and paragraph splitting only, without auto-promoting blocks to headings or scripture quotes
  - Manual Lexical formatting controls remain available, but imported sermons start as plain paragraphs for safer review
  - Reduced false positives where ordinary sermon text was being highlighted or rendered as heading-like content
- Tests: Pending web-admin validation

- Type: API | Infra
- Description: Fixed dev-time PDF import route failure caused by bundled `pdf-parse` module loading
- Impact:
  - Moved the PDF parser load in the admin import route to a lazy runtime import instead of an eager top-level import
  - Marked `pdf-parse` as a server external package in Next config so the Node route stops executing the problematic bundled ESM entry during dev
  - Restarted the web-admin dev server so `/api/sermons/import-pdf` picks up the corrected runtime behavior
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Frontend | API
- Description: Added sermon PDF import, richer review formatting, and read-only Lexical rendering in admin
- Impact:
  - Added explicit section and scripture block formatting in the Lexical toolbar with stronger editor and read-only styling
  - Added admin-only PDF extraction route using `pdf-parse`, with cleaned text structured into Lexical JSON and injected into the editor for human review
  - Added a shared read-only sermon renderer so list cards and sermon detail preview the saved Lexical content using the same block rules
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Frontend | API
- Description: Made admin login persistence explicit with remember-me cookie policy
- Impact:
  - Added a shared Supabase cookie policy so middleware and server actions use the same session lifetime rules
  - Added a remember-me checkbox on the admin login form and stored the preference in a small server-only cookie
  - Kept sign-out clearing both the Supabase session and the remember-me preference so shared devices can opt out cleanly
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Infra | Other
- Description: Initial monorepo setup for sermon app
- Impact: 
  - Created workspace structure: apps/mobile, apps/web-admin, packages/{shared,api-contracts,ui,config}, db/migrations
  - Added root package.json with pnpm workspaces
  - Created placeholder package.json for all workspaces
  - Updated project-context.md with sermon app entities and workflows
  - Updated AGENT_RULES.md with sermon app constraints
  - Created feature context docs: features-mobile.md, features-admin.md, text-processing.md
  - Added shared types (Sermon, Audio, ApiResult) in packages/shared
  - Added API contracts with Zod schemas (sermons) in packages/api-contracts
  - Created .gitignore for Node/Expo/Next.js/Supabase
- Tests: N/A (no code yet)

- Type: Infra
- Description: Added environment file templates
- Impact:
  - Created .env.example (root, shared defaults)
  - Created apps/mobile/.env.example (Expo env vars with EXPO_PUBLIC_ prefix)
  - Created apps/web-admin/.env.example (Next.js env vars, client + server-side)
  - Updated README.md with setup instructions
- Tests: N/A

- Type: Frontend | Other
- Description: Updated brand design system for reading-optimized dark mode
- Impact:
  - Replaced blue accent (#0063FE) with deep purple (#6D5EF6) for spiritual/reflective tone
  - Updated base colors: #0B0F14 (primary bg), #F4F6F8 (soft reading bg), dark surface hierarchy
  - Added reading experience rules: line height 1.7-1.9, narrow column max width, generous paragraph spacing
  - Created packages/shared/src/theme.ts — centralized theme constants (colors, typography, spacing, audio UI)
  - Updated docs/context/brand.md with dark mode palette and design philosophy
  - Exported theme from packages/shared/src/index.ts
- Tests: N/A (design constants only)

- Type: Infra
- Description: Updated env files to use Supabase publishable keys and created .env.local files
- Impact:
  - Changed SUPABASE_ANON_KEY → SUPABASE_PUBLISHABLE_KEY in all .env.example files
  - Created .env.local (root), apps/mobile/.env.local, apps/web-admin/.env.local with placeholder values
  - Updated README.md setup instructions (no need to copy files, just fill in credentials)
- Tests: N/A

- Type: Infra
- Description: Linked Supabase CLI to cloud project (no Docker)
- Impact:
  - Linked to Supabase project "Circular-letter" (ref: ohqkzuzqiboutpiediyb, West Europe London)
  - Added Supabase section to README.md with type generation command
  - Project uses cloud Supabase, not local Docker instance
- Tests: N/A

- Type: Frontend
- Description: Scaffolded initial web-admin Next.js app with sermon list and create-draft flow
- Impact:
  - Added App Router shell, global styling, dashboard routes and French-first admin copy in apps/web-admin
  - Added server action + Zod validation using shared sermon contracts
  - Added temporary server-side repository abstraction for draft creation until DB schema is approved
- Tests: Deferred (dependencies not installed yet)

- Type: API | Frontend
- Description: Added admin auth foundation for web dashboard with Supabase server-side sessions
- Impact:
  - Added Supabase server helpers, middleware route protection, login page, and sign-out flow in apps/web-admin
  - Protected sermon creation action with server-side auth check
  - Kept auth cookie-based and middleware-safe for Edge runtime
- Tests: Pending lint/typecheck/build after dependency refresh

- Type: API | Infra
- Description: Added admin account seed flow for web auth
- Impact:
  - Added `pnpm --filter web-admin seed:admins` script backed by Supabase admin API
  - Documented seeded admin login workflow in README and env example
  - Preserved sign-in only UI while shifting account creation out of the app
- Tests: Pending script syntax check and web-admin validation

- Type: DB | API
- Description: Enforced admin-role access and switched sermon CRUD to Supabase-backed persistence
- Impact:
  - Locked web admin access to users whose `app_metadata.role` is `admin`
  - Added `sermons` SQL migration under db and supabase migration folders for remote apply
  - Replaced temporary in-memory sermon repository with server-only Supabase admin client writes and reads
- Tests: Pending remote migration apply and web-admin lint/typecheck/build

- Type: Infra
- Description: Fixed web-admin production build failure caused by non-standard NODE_ENV in env files
- Impact:
  - Removed `NODE_ENV=development` from web-admin env files
  - Forced correct runtime mode in web-admin package scripts so parent shell env does not poison `next dev` or `next build`
  - Documented that Next.js runtime mode must come from the command, not `.env.local`
  - Confirmed `pnpm --filter web-admin build` succeeds once NODE_ENV is not overridden
- Tests: `NODE_ENV=production pnpm --filter web-admin build`

- Type: Frontend | API
- Description: Converted root route into a public landing page and kept dashboard access behind login
- Impact:
  - Replaced `/` redirect with a real landing page and CTA to `/login` or `/sermons` for active admins
  - Removed root path from middleware protection so unauthenticated visitors can view the homepage
  - Redirected sign-out back to the public landing page instead of the login form
- Tests: Pending web-admin build

- Type: Frontend
- Description: Strengthened the public landing page so localhost root reads like a real website on first paint
- Impact:
  - Added a visible top navigation, stronger hero content, and secondary explainer panels on `/`
  - Extended landing-page-only styling so the homepage has clearer structure and background treatment
  - Kept the same auth flow: public root, login CTA, admin redirect to `/sermons`
- Tests: Pending web-admin validation

- Type: Frontend | API
- Description: Decoupled public landing page from Supabase session handling to avoid Safari blank page on `/`
- Impact:
  - Removed auth lookup from `apps/web-admin/app/page.tsx` so the homepage renders as public content without session-dependent server work
  - Removed `/` and `/login` from `apps/web-admin/middleware.ts` matcher so public pages no longer depend on Supabase middleware just to paint
  - Kept `/login` and `/sermons` protected behavior unchanged
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Frontend | API
- Description: Added sermon edit plus publish/unpublish flow in web admin
- Impact:
  - Added edit route under `apps/web-admin/app/sermons/[id]/page.tsx` with prefilled sermon form data from Supabase
  - Reused the sermon form for both create and update flows and added server actions for update plus status toggle
  - Extended the sermon list with edit and publish/unpublish controls and added the supporting admin UI styles
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`

- Type: Frontend
- Description: Replaced sermon textarea with Lexical review editor in web admin
- Impact:
  - Added Lexical editor dependencies and mounted a client-side review editor with toolbar for headings, quotes, lists, bold, and italic
  - Switched sermon create/edit submission from plain text to serialized Lexical JSON through the existing server actions
  - Added parsing and empty-content validation so invalid editor payloads fail before hitting Supabase
- Tests: `pnpm --filter web-admin lint` ; `pnpm --filter web-admin typecheck` ; `pnpm --filter web-admin build`
