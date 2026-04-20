import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResult } from '@sermon-app/shared';
import { requireAdminUser } from '../../../../lib/auth/auth';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';

export const runtime = 'nodejs';

const DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const DEFAULT_ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
const DEFAULT_AUDIO_BUCKET = 'sermon-audio';

const audioFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().positive(),
  type: z.string(),
});

function readMaxUploadSize(): number {
  const rawValue = process.env.UPLOAD_MAX_SIZE;
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_MAX_UPLOAD_SIZE;
}

function readAllowedAudioTypes(): string[] {
  const rawValue = process.env.ALLOWED_AUDIO_TYPES;

  if (!rawValue) {
    return DEFAULT_ALLOWED_AUDIO_TYPES;
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function readAudioBucket(): string {
  return process.env.SUPABASE_AUDIO_BUCKET?.trim() || DEFAULT_AUDIO_BUCKET;
}

function jsonResponse<T>(body: ApiResult<T>, status: number): NextResponse<ApiResult<T>> {
  return NextResponse.json(body, { status });
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function buildAudioPath(userId: string, fileName: string): string {
  const datePrefix = new Date().toISOString().slice(0, 10);
  const safeName = sanitizeFileName(fileName) || `audio-${randomUUID()}.bin`;
  return `${userId}/${datePrefix}/${randomUUID()}-${safeName}`;
}

async function ensureAudioBucketExists(bucket: string, fileSizeLimit: number, allowedMimeTypes: string[]): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    return false;
  }

  const existingBucket = buckets.find((item) => item.name === bucket || item.id === bucket);

  if (existingBucket) {
    return true;
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit,
    allowedMimeTypes,
  });

  return !createError;
}

export async function POST(request: Request): Promise<NextResponse> {
  let userId = '';

  try {
    const user = await requireAdminUser();
    userId = user.id;
  } catch {
    return jsonResponse({ success: false, error: 'Session admin invalide. Reconnecte-toi avant d\'envoyer un audio.' }, 401);
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return jsonResponse({ success: false, error: 'Ajoute un fichier audio valide avant de lancer l\'upload.' }, 400);
  }

  const validatedFile = audioFileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validatedFile.success) {
    return jsonResponse({ success: false, error: 'Le fichier audio est invalide.' }, 400);
  }

  const maxUploadSize = readMaxUploadSize();
  const allowedAudioTypes = readAllowedAudioTypes();
  const bucket = readAudioBucket();

  if (validatedFile.data.size > maxUploadSize) {
    return jsonResponse({ success: false, error: 'Le fichier audio depasse la taille autorisee.' }, 400);
  }

  if (!allowedAudioTypes.includes(validatedFile.data.type)) {
    return jsonResponse({ success: false, error: 'Format audio non autorise.' }, 400);
  }

  const bucketReady = await ensureAudioBucketExists(bucket, maxUploadSize, allowedAudioTypes);

  if (!bucketReady) {
    return jsonResponse({ success: false, error: 'Le bucket audio Supabase est indisponible pour le moment.' }, 500);
  }

  try {
    const supabase = createSupabaseAdminClient();
    const path = buildAudioPath(userId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: validatedFile.data.type,
      upsert: false,
    });

    if (uploadError) {
      return jsonResponse({ success: false, error: 'Upload audio impossible pour le moment.' }, 500);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return jsonResponse(
      {
        success: true,
        data: {
          audioUrl: data.publicUrl,
          bucket,
          path,
        },
      },
      200,
    );
  } catch {
    return jsonResponse({ success: false, error: 'Upload audio impossible pour le moment.' }, 500);
  }
}