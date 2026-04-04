# Project Updates

Append-only change log. Read this first before exploring codebase.

## 2026-04-04
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
