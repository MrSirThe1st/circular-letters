# Sermon App Agent Rules

## Product Scope
Core entities: Sermon, Audio, Category, User (admin).
- User app → read-only (no auth for MVP).
- Admin dashboard → full CRUD on sermons.
- Reject features unrelated to sermon creation/consumption.

## Before Every Task
1. Read `project-updates.md` first.
2. If task touches schema, text processing pipeline, or large refactors → ask before proceeding.

## Standards (always enforced)
- TypeScript strict — `any` banned
- Validate all external input at API boundaries with Zod
- Auth check on every admin mutation
- Return `ApiResult<T>` — never raw DB errors
- No DB calls from client/UI code
- Reuse existing types, components, logic before creating new
```ts
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };
```

## Text Processing Rules (critical)
- PDF extraction → draft state only
- Never auto-publish extracted text
- Admin must review in Lexical editor before publish
- Clean text: fix line breaks, merge sentences, remove artifacts
- Structured output: Lexical JSON (paragraphs, quotes, headings)

## Workflow
1. Read `project-updates.md` + relevant files.
2. Implement smallest working slice.
3. Run: `pnpm lint && pnpm typecheck && pnpm build`
4. Append to `project-updates.md` if change is meaningful.

## PR blocked if
- Lint/typecheck/build fails
- Unvalidated external input exists
- Admin route lacks auth check
- `any` introduced
- Auto-publish of extracted text added

## Minimum Test Coverage
- API route: success, validation failure, auth failure
- Text processing: PDF extraction, cleaning, structuring
- Business logic: happy path + failure path

## Delivery Priority
1. Sermon CRUD (create, edit, publish)
2. PDF extraction + review workflow
3. Lexical editor integration
4. Audio upload/storage
5. Mobile reading UI
6. Audio playback (expo-av)
7. Search (title/date)

## project-updates.md Format
Append-only. Concise entries.
```
## YYYY-MM-DD
- Type: DB | API | Frontend | Mobile | Infra | Other
- Description: what changed
- Impact: tables, routes, files affected
- Tests: added | updated | deferred (reason)
```