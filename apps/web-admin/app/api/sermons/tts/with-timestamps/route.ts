import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResult } from '@sermon-app/shared';
import { requireAdminUser } from '../../../../../lib/auth/auth';
import {
  ElevenLabsRequestError,
  convertTextWithTimestamps,
  parseElevenLabsOutputFormat,
} from '../../../../../lib/sermons/elevenlabs';
import { getSermonById, saveSermonTts } from '../../../../../lib/sermons/sermon-repository';
import { extractPlainTextContent } from '../../../../../lib/sermons/sermon-utils';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';

export const runtime = 'nodejs';

const generateTtsSchema = z.object({
  sermonId: z.string().uuid(),
  voiceId: z.string().min(1).max(128),
  modelId: z.string().min(1).max(128).default('eleven_multilingual_v2'),
  outputFormat: z.string().optional(),
  paragraphPauseMs: z.number().int().min(0).max(1200).default(220),
  voiceSettings: z
    .object({
      stability: z.number().min(0).max(1).default(0.65),
      similarityBoost: z.number().min(0).max(1).default(0.85),
      style: z.number().min(0).max(1).default(0.15),
      useSpeakerBoost: z.boolean().default(true),
      speed: z.number().min(0.7).max(1.2).default(0.9),
    })
    .default({
      stability: 0.65,
      similarityBoost: 0.85,
      style: 0.15,
      useSpeakerBoost: true,
      speed: 0.9,
    }),
});

type CharacterAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

type GenerateSermonTtsData = {
  sermonId: string;
  title: string;
  textLength: number;
  audioUrl: string;
  audioBucket: string;
  audioPath: string;
  outputFormat: string;
  alignment: CharacterAlignment | null;
  normalizedAlignment: CharacterAlignment | null;
  estimatedDurationSeconds: number | null;
  generatedAt: string;
};

const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';
const DEFAULT_TTS_AUDIO_BUCKET = 'sermon-audio';

function readTtsAudioBucket(): string {
  return process.env.SUPABASE_TTS_AUDIO_BUCKET?.trim() || DEFAULT_TTS_AUDIO_BUCKET;
}

function outputFormatToFileInfo(outputFormat: string): { extension: string; contentType: string } {
  if (outputFormat.startsWith('wav_')) {
    return { extension: 'wav', contentType: 'audio/wav' };
  }

  if (outputFormat.startsWith('opus_')) {
    return { extension: 'opus', contentType: 'audio/ogg' };
  }

  if (outputFormat.startsWith('pcm_')) {
    return { extension: 'pcm', contentType: 'audio/wav' };
  }

  if (outputFormat.startsWith('alaw_') || outputFormat.startsWith('ulaw_')) {
    return { extension: 'wav', contentType: 'audio/wav' };
  }

  return { extension: 'mp3', contentType: 'audio/mpeg' };
}

function buildTtsAudioPath(sermonId: string, outputFormat: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const { extension } = outputFormatToFileInfo(outputFormat);
  return `tts/${sermonId}/${day}/${randomUUID()}.${extension}`;
}

function withParagraphPause(text: string, paragraphPauseMs: number): string {
  if (paragraphPauseMs <= 0) {
    return text;
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (paragraphs.length < 2) {
    return text;
  }

  const breakTag = `<break time="${paragraphPauseMs}ms" />`;
  return paragraphs.join(` ${breakTag} `);
}

async function removePreviousTtsAudio(bucket: string, path: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(bucket).remove([path]);
}

async function ensureBucketExists(bucket: string): Promise<boolean> {
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
  });

  return !createError;
}

function jsonResponse<T>(body: ApiResult<T>, status: number): NextResponse<ApiResult<T>> {
  return NextResponse.json(body, { status });
}

function mapAlignment(
  alignment:
    | {
        characters: string[];
        character_start_times_seconds: number[];
        character_end_times_seconds: number[];
      }
    | null
    | undefined,
): CharacterAlignment | null {
  if (!alignment) {
    return null;
  }

  return {
    characters: alignment.characters,
    characterStartTimesSeconds: alignment.character_start_times_seconds,
    characterEndTimesSeconds: alignment.character_end_times_seconds,
  };
}

function estimateDurationSeconds(alignment: CharacterAlignment | null): number | null {
  if (!alignment || alignment.characterEndTimesSeconds.length === 0) {
    return null;
  }

  const last = alignment.characterEndTimesSeconds[alignment.characterEndTimesSeconds.length - 1];
  return Number.isFinite(last) ? last : null;
}

function toSafeStatusCode(value: number): number {
  if (!Number.isInteger(value) || value < 400 || value > 599) {
    return 502;
  }

  return value;
}

export async function POST(request: Request): Promise<NextResponse<ApiResult<GenerateSermonTtsData>>> {
  try {
    await requireAdminUser();
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Session admin invalide. Reconnecte-toi avant de generer un audio TTS.',
      },
      401,
    );
  }

  const requestBody = (await request.json().catch(() => null)) as unknown;
  const parsed = generateTtsSchema.safeParse(requestBody);

  if (!parsed.success) {
    return jsonResponse(
      {
        success: false,
        error: 'Parametres invalides pour la generation TTS.',
      },
      400,
    );
  }

  const sermon = await getSermonById(parsed.data.sermonId);

  if (!sermon) {
    return jsonResponse(
      {
        success: false,
        error: 'Predication introuvable.',
      },
      404,
    );
  }

  const plainText = extractPlainTextContent(sermon.content).trim();

  if (!plainText) {
    return jsonResponse(
      {
        success: false,
        error: 'Le contenu de la predication est vide, impossible de generer le TTS.',
      },
      400,
    );
  }

  const outputFormat = parseElevenLabsOutputFormat(parsed.data.outputFormat);
  const resolvedOutputFormat = outputFormat ?? DEFAULT_OUTPUT_FORMAT;
  const targetBucket = readTtsAudioBucket();
  const previousTts = sermon.tts;

  const bucketReady = await ensureBucketExists(targetBucket);

  if (!bucketReady) {
    return jsonResponse(
      {
        success: false,
        error: 'Le bucket audio TTS Supabase est indisponible pour le moment.',
      },
      500,
    );
  }

  try {
    const tts = await convertTextWithTimestamps({
      text: withParagraphPause(plainText, parsed.data.paragraphPauseMs),
      voiceId: parsed.data.voiceId,
      modelId: parsed.data.modelId,
      outputFormat,
      voiceSettings: parsed.data.voiceSettings,
    });

    const supabase = createSupabaseAdminClient();
    const audioPath = buildTtsAudioPath(sermon.id, resolvedOutputFormat);
    const audioBuffer = Buffer.from(tts.audio_base64, 'base64');
    const fileInfo = outputFormatToFileInfo(resolvedOutputFormat);
    const { error: uploadError } = await supabase.storage.from(targetBucket).upload(audioPath, audioBuffer, {
      contentType: fileInfo.contentType,
      upsert: true,
    });

    if (uploadError) {
      return jsonResponse(
        {
          success: false,
          error: 'Upload du rendu TTS impossible pour le moment.',
        },
        500,
      );
    }

    const { data: publicData } = supabase.storage.from(targetBucket).getPublicUrl(audioPath);
    const alignment = mapAlignment(tts.alignment);
    const normalizedAlignment = mapAlignment(tts.normalized_alignment);
    const estimatedDurationSeconds = estimateDurationSeconds(normalizedAlignment ?? alignment);

    const persisted = await saveSermonTts({
      sermonId: sermon.id,
      audioUrl: publicData.publicUrl,
      audioBucket: targetBucket,
      audioPath,
      voiceId: parsed.data.voiceId,
      modelId: parsed.data.modelId,
      outputFormat: resolvedOutputFormat,
      alignment,
      normalizedAlignment,
      durationSeconds: estimatedDurationSeconds,
    });

    if (!persisted.success || !persisted.data.tts) {
      return jsonResponse(
        {
          success: false,
          error: persisted.success
            ? 'Les donnees TTS ont ete generees mais pas enregistrees en base.'
            : persisted.error,
        },
        500,
      );
    }

    if (
      previousTts &&
      previousTts.audioPath !== persisted.data.tts.audioPath &&
      previousTts.audioBucket.length > 0 &&
      previousTts.audioPath.length > 0
    ) {
      void removePreviousTtsAudio(previousTts.audioBucket, previousTts.audioPath);
    }

    return jsonResponse(
      {
        success: true,
        data: {
          sermonId: sermon.id,
          title: sermon.title,
          textLength: plainText.length,
          audioUrl: persisted.data.tts.audioUrl,
          audioBucket: persisted.data.tts.audioBucket,
          audioPath: persisted.data.tts.audioPath,
          outputFormat: persisted.data.tts.outputFormat,
          alignment,
          normalizedAlignment,
          estimatedDurationSeconds,
          generatedAt: persisted.data.tts.generatedAt,
        },
      },
      200,
    );
  } catch (error: unknown) {
    if (error instanceof ElevenLabsRequestError) {
      return jsonResponse(
        {
          success: false,
          error: error.message,
        },
        toSafeStatusCode(error.statusCode),
      );
    }

    if (error instanceof Error) {
      return jsonResponse(
        {
          success: false,
          error: error.message,
        },
        500,
      );
    }

    return jsonResponse(
      {
        success: false,
        error: 'Generation ElevenLabs impossible pour le moment.',
      },
      502,
    );
  }
}
