import type { CreateSermonRequest, UpdateSermonRequest } from '@sermon-app/api-contracts';
import type { ApiResult, Sermon } from '@sermon-app/shared';
import { createSupabaseAdminClient } from '../supabase/admin';

type SermonMetrics = {
  total: number;
  draft: number;
  published: number;
};

export type ListPublishedSermonsOptions = {
  search?: string;
  limit: number;
  offset: number;
};

type SermonRow = {
  id: string;
  title: string;
  sermon_date: string;
  content: unknown;
  audio_url: string | null;
  tts_audio_url: string | null;
  tts_audio_bucket: string | null;
  tts_audio_path: string | null;
  tts_voice_id: string | null;
  tts_model_id: string | null;
  tts_output_format: string | null;
  tts_alignment: unknown;
  tts_normalized_alignment: unknown;
  tts_duration_seconds: number | null;
  tts_generated_at: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

type TtsAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

export type SaveSermonTtsPayload = {
  sermonId: string;
  audioUrl: string;
  audioBucket: string;
  audioPath: string;
  voiceId: string;
  modelId: string;
  outputFormat: string;
  alignment: TtsAlignment | null;
  normalizedAlignment: TtsAlignment | null;
  durationSeconds: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

function coerceAlignment(value: unknown): TtsAlignment | null {
  if (!isRecord(value)) {
    return null;
  }

  const characters = value.characters;
  const startTimes = value.characterStartTimesSeconds;
  const endTimes = value.characterEndTimesSeconds;

  if (!isStringArray(characters) || !isNumberArray(startTimes) || !isNumberArray(endTimes)) {
    return null;
  }

  return {
    characters,
    characterStartTimesSeconds: startTimes,
    characterEndTimesSeconds: endTimes,
  };
}

function mapSermonSelectFields(): string {
  return [
    'id',
    'title',
    'sermon_date',
    'content',
    'audio_url',
    'tts_audio_url',
    'tts_audio_bucket',
    'tts_audio_path',
    'tts_voice_id',
    'tts_model_id',
    'tts_output_format',
    'tts_alignment',
    'tts_normalized_alignment',
    'tts_duration_seconds',
    'tts_generated_at',
    'status',
    'created_at',
    'updated_at',
  ].join(', ');
}

function mapSermonRow(row: SermonRow): Sermon {
  const hasTts = Boolean(
    row.tts_audio_url &&
      row.tts_audio_bucket &&
      row.tts_audio_path &&
      row.tts_voice_id &&
      row.tts_model_id &&
      row.tts_output_format &&
      row.tts_generated_at,
  );

  return {
    id: row.id,
    title: row.title,
    date: row.sermon_date,
    content: row.content,
    audioUrl: row.audio_url,
    tts: hasTts
      ? {
          audioUrl: row.tts_audio_url as string,
          audioBucket: row.tts_audio_bucket as string,
          audioPath: row.tts_audio_path as string,
          voiceId: row.tts_voice_id as string,
          modelId: row.tts_model_id as string,
          outputFormat: row.tts_output_format as string,
          alignment: coerceAlignment(row.tts_alignment),
          normalizedAlignment: coerceAlignment(row.tts_normalized_alignment),
          durationSeconds: row.tts_duration_seconds,
          generatedAt: row.tts_generated_at as string,
        }
      : null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSermons(): Promise<Sermon[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('sermons')
    .select(mapSermonSelectFields())
    .order('sermon_date', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapSermonRow(row as unknown as SermonRow));
}

export async function getSermonById(id: string): Promise<Sermon | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('sermons')
    .select(mapSermonSelectFields())
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapSermonRow(data as unknown as SermonRow);
}

function normalizeSearchTerm(value: string | undefined): string {
  if (!value) {
    return '';
  }

  return value.trim();
}

export async function listPublishedSermons(
  options: ListPublishedSermonsOptions,
): Promise<Sermon[]> {
  const supabase = createSupabaseAdminClient();
  const searchTerm = normalizeSearchTerm(options.search);
  const lastIndex = options.offset + options.limit - 1;

  let query = supabase
    .from('sermons')
    .select(mapSermonSelectFields())
    .eq('status', 'published')
    .order('sermon_date', { ascending: false })
    .range(options.offset, lastIndex);

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapSermonRow(row as unknown as SermonRow));
}

export async function getPublishedSermonById(id: string): Promise<Sermon | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('sermons')
    .select(mapSermonSelectFields())
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  return mapSermonRow(data as unknown as SermonRow);
}

export async function getSermonMetrics(): Promise<SermonMetrics> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('sermons').select('status');

  if (error || !data) {
    return {
      total: 0,
      draft: 0,
      published: 0,
    };
  }

  return {
    total: data.length,
    draft: data.filter((item) => item.status === 'draft').length,
    published: data.filter((item) => item.status === 'published').length,
  };
}

export async function saveSermon(payload: CreateSermonRequest, userId: string): Promise<ApiResult<Sermon>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('sermons')
      .insert({
        title: payload.title,
        sermon_date: payload.date,
        content: payload.content,
        audio_url: payload.audioUrl ?? null,
        status: payload.status,
        created_by: userId,
      })
      .select(mapSermonSelectFields())
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Impossible de creer le sermon pour le moment.',
      };
    }

    return {
      success: true,
      data: mapSermonRow(data as unknown as SermonRow),
    };
  } catch {
    return {
      success: false,
      error: 'Impossible de creer le sermon pour le moment.',
    };
  }
}

export async function updateSermon(payload: UpdateSermonRequest): Promise<ApiResult<Sermon>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('sermons')
      .update({
        title: payload.title,
        sermon_date: payload.date,
        content: payload.content,
        audio_url: payload.audioUrl ?? null,
        status: payload.status,
      })
      .eq('id', payload.id)
      .select(mapSermonSelectFields())
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Impossible de mettre a jour le sermon pour le moment.',
      };
    }

    return {
      success: true,
      data: mapSermonRow(data as unknown as SermonRow),
    };
  } catch {
    return {
      success: false,
      error: 'Impossible de mettre a jour le sermon pour le moment.',
    };
  }
}

export async function updateSermonStatus(id: string, status: Sermon['status']): Promise<ApiResult<Sermon>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('sermons')
      .update({ status })
      .eq('id', id)
      .select(mapSermonSelectFields())
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Impossible de changer le statut du sermon pour le moment.',
      };
    }

    return {
      success: true,
      data: mapSermonRow(data as unknown as SermonRow),
    };
  } catch {
    return {
      success: false,
      error: 'Impossible de changer le statut du sermon pour le moment.',
    };
  }
}

export async function saveSermonTts(payload: SaveSermonTtsPayload): Promise<ApiResult<Sermon>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('sermons')
      .update({
        tts_audio_url: payload.audioUrl,
        tts_audio_bucket: payload.audioBucket,
        tts_audio_path: payload.audioPath,
        tts_voice_id: payload.voiceId,
        tts_model_id: payload.modelId,
        tts_output_format: payload.outputFormat,
        tts_alignment: payload.alignment,
        tts_normalized_alignment: payload.normalizedAlignment,
        tts_duration_seconds: payload.durationSeconds,
        tts_generated_at: new Date().toISOString(),
      })
      .eq('id', payload.sermonId)
      .select(mapSermonSelectFields())
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Impossible d\'enregistrer les donnees TTS pour le moment.',
      };
    }

    return {
      success: true,
      data: mapSermonRow(data as unknown as SermonRow),
    };
  } catch {
    return {
      success: false,
      error: 'Impossible d\'enregistrer les donnees TTS pour le moment.',
    };
  }
}