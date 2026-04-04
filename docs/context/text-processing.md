# Text Processing Pipeline

## Pipeline Steps

### 1. Upload / Input
- Admin provides: PDF file or pasted text
- Nothing trusted at this stage

### 2. Text Extraction (if PDF)
- Use pdf-parse (server-side)
- Extract raw text from PDF
- Output: raw unprocessed text string

### 3. Cleaning / Normalization
**Critical step for usability**
- Fix broken line breaks
- Merge split sentences
- Detect paragraphs
- Keep quotes intact
- Remove PDF artifacts:
  - Headers/footers
  - Page numbers
  - Formatting junk
- Output: clean raw text

### 4. Structured Formatting
- Convert clean text to Lexical JSON:
  - Detect paragraphs
  - Identify scripture quotes
  - Optional headings
- Output: Lexical JSON structure

### 5. Review (Lexical Editor)
**Human validation - mandatory**
- Church admin sees sermon in Lexical editor
- Fix mistakes
- Adjust formatting
- Confirm accuracy
- Output: reviewed Lexical JSON

### 6. Publish
- Save to Supabase
- Link audio (if uploaded)
- Create search index
- Mark as published → visible in mobile app

## Important Rules
- Steps 3-4 are automatic
- Step 5 is human confirmation (guarantees accuracy)
- Never auto-publish extracted text
- Extracted text = draft state only

## Example Flow
```
PDF upload → extract → clean → structure → Lexical editor (admin reviews) → publish
```

## Text Storage Format
- DB: Lexical JSON (structured)
- Mobile display: Convert Lexical JSON → clean HTML or native components
