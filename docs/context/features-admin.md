# Admin Dashboard Features

## Admin Screens

### Sermon List (Dashboard)
- Table: title, date, status (draft/published), actions
- Create new sermon button
- Edit/delete actions
- Publish/unpublish toggle

### Create/Edit Sermon
- Form fields:
  - Title (required)
  - Date (required)
  - Status (draft/published)
  - Audio file upload
  - PDF upload (optional)
  - Text editor (Lexical)

### PDF Import Flow
1. Admin uploads PDF
2. System extracts text (pdf-parse server-side)
3. Text cleaning/structuring
4. Lexical editor loads with extracted text
5. Admin reviews/edits
6. Save as draft or publish

### Lexical Editor
- Rich text editing
- Paragraph formatting
- Quote blocks (scripture)
- Headings (optional)
- Output: Lexical JSON → stored in DB
- Display: Convert Lexical JSON → readable format in mobile

## Auth
- Supabase Auth (email/password for MVP)
- Admin role required for all mutations
- Public routes: none (all admin-only)
