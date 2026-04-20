# Sermon App
Digital library for church sermons (text + audio).

## Setup

1. Fill in Supabase credentials in:
   - `.env.local` (root shared defaults)
   - `apps/mobile/.env.local` (mobile app)
   - `apps/web-admin/.env.local` (admin dashboard)
2. Install dependencies: `pnpm install`
3. Seed admin web users in `apps/web-admin/.env.local` via `ADMIN_SEED_USERS`, then run `pnpm --filter web-admin seed:admins`
4. Run dev: `pnpm dev:mobile` or `pnpm dev:admin`

**Note:** `.env.local` files are already created. Just add your Supabase URL and publishable key.
Do not set `NODE_ENV` inside `.env.local`; Next.js expects that value to come from the runtime command.
Audio upload uses Supabase Storage and defaults to the bucket `sermon-audio` unless `SUPABASE_AUDIO_BUCKET` is set.

Web admin auth is sign-in only. Admin accounts are pre-created through the seed command and are not self-registered from the UI.

## Supabase

Project is linked to Supabase cloud (not local Docker):
- Project: `Circular-letter` (ref: `ohqkzuzqiboutpiediyb`)
- Region: West Europe (London)
- Link status: Connected via Supabase CLI

Generate types: `supabase gen types typescript --linked > packages/shared/src/database.types.ts`

## Workspace Structure
- `apps/mobile` — Expo (users read/listen to sermons)
- `apps/web-admin` — Next.js (church manages sermons)
- `packages/shared` — types, utils, constants
- `packages/api-contracts` — API schemas (Zod)
- `packages/ui` — shared components
- `packages/config` — ESLint/TS configs
- `db/migrations` — Supabase migrations

## Agent Rules
- `docs/blueprint/ai/AGENT_RULES.md` — Agent constraints and standards

## Project Source of Truth
- `project-context.md` — Product definition, entities, tech stack
- `project-updates.md` — Append-only change log

## Architectural Decisions
- `docs/decisions/ADR-*.md` — Reference only