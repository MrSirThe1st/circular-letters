import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResult } from '@sermon-app/shared';
import { requireAdminUser } from '../../../../lib/auth/auth';
import { buildStructuredLexicalContent } from '../../../../lib/sermons/text-processing';

export const runtime = 'nodejs';

const DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const DEFAULT_ALLOWED_PDF_TYPES = ['application/pdf'];

const pdfFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().positive(),
  type: z.string(),
});

function readMaxUploadSize(): number {
  const rawValue = process.env.UPLOAD_MAX_SIZE;
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_MAX_UPLOAD_SIZE;
}

function readAllowedPdfTypes(): string[] {
  const rawValue = process.env.ALLOWED_PDF_TYPES;

  if (!rawValue) {
    return DEFAULT_ALLOWED_PDF_TYPES;
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function jsonResponse<T>(body: ApiResult<T>, status: number): NextResponse<ApiResult<T>> {
  return NextResponse.json(body, { status });
}

function isAllowedPdfFile(file: File, allowedTypes: string[]): boolean {
  if (file.type) {
    return allowedTypes.includes(file.type);
  }

  return file.name.toLowerCase().endsWith('.pdf');
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdminUser();
  } catch {
    return jsonResponse({ success: false, error: 'Session admin invalide. Reconnecte-toi avant d\'importer un PDF.' }, 401);
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return jsonResponse({ success: false, error: 'Ajoute un PDF valide avant de lancer l\'import.' }, 400);
  }

  const validatedFile = pdfFileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validatedFile.success) {
    return jsonResponse({ success: false, error: 'Le fichier PDF est invalide.' }, 400);
  }

  const maxUploadSize = readMaxUploadSize();
  const allowedPdfTypes = readAllowedPdfTypes();

  if (validatedFile.data.size > maxUploadSize) {
    return jsonResponse({ success: false, error: 'Le PDF depasse la taille autorisee pour l\'import.' }, 400);
  }

  if (!isAllowedPdfFile(file, allowedPdfTypes)) {
    return jsonResponse({ success: false, error: 'Seuls les fichiers PDF sont acceptes.' }, 400);
  }

  let parser: { destroy(): Promise<void>; getText(): Promise<{ text: string }> } | null = null;

  try {
    const { PDFParse } = await import('pdf-parse');
    const buffer = Buffer.from(await file.arrayBuffer());
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const content = buildStructuredLexicalContent(result.text);

    return jsonResponse(
      {
        success: true,
        data: {
          blockCount: content.root.children.length,
          content,
        },
      },
      200,
    );
  } catch {
    return jsonResponse({ success: false, error: 'Extraction PDF impossible. Verifie que le fichier contient du texte exploitable.' }, 500);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}