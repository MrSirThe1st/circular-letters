import 'server-only';

import { z } from 'zod';

const outputFormatSchema = z.enum([
  'alaw_8000',
  'mp3_22050_32',
  'mp3_24000_48',
  'mp3_44100_128',
  'mp3_44100_192',
  'mp3_44100_32',
  'mp3_44100_64',
  'mp3_44100_96',
  'opus_48000_128',
  'opus_48000_192',
  'opus_48000_32',
  'opus_48000_64',
  'opus_48000_96',
  'pcm_16000',
  'pcm_22050',
  'pcm_24000',
  'pcm_32000',
  'pcm_44100',
  'pcm_48000',
  'pcm_8000',
  'ulaw_8000',
  'wav_16000',
  'wav_22050',
  'wav_24000',
  'wav_32000',
  'wav_44100',
  'wav_48000',
  'wav_8000',
]);

const characterAlignmentSchema = z.object({
  characters: z.array(z.string()),
  character_start_times_seconds: z.array(z.number()),
  character_end_times_seconds: z.array(z.number()),
});

const convertWithTimestampsResponseSchema = z.object({
  audio_base64: z.string().min(1),
  alignment: characterAlignmentSchema.nullish(),
  normalized_alignment: characterAlignmentSchema.nullish(),
});

export type ElevenLabsOutputFormat = z.infer<typeof outputFormatSchema>;

export type ElevenLabsCharacterAlignment = z.infer<typeof characterAlignmentSchema>;

export type ConvertWithTimestampsInput = {
  text: string;
  voiceId: string;
  modelId: string;
  outputFormat?: ElevenLabsOutputFormat;
  voiceSettings?: ElevenLabsVoiceSettings;
};

export type ElevenLabsVoiceSettings = {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  speed: number;
};

export type ConvertWithTimestampsOutput = z.infer<typeof convertWithTimestampsResponseSchema>;

export class ElevenLabsRequestError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ElevenLabsRequestError';
    this.statusCode = statusCode;
  }
}

const DEFAULT_BASE_URL = 'https://api.elevenlabs.io';

function readElevenLabsApiKey(): string {
  const value = process.env.ELEVENLABS_API_KEY?.trim();

  if (!value) {
    throw new Error('ELEVENLABS_KEY_MISSING');
  }

  return value;
}

function getElevenLabsBaseUrl(): string {
  const value = process.env.ELEVENLABS_BASE_URL?.trim();
  return value && value.length > 0 ? value : DEFAULT_BASE_URL;
}

function buildConvertWithTimestampsUrl(voiceId: string, outputFormat?: ElevenLabsOutputFormat): string {
  const base = getElevenLabsBaseUrl().replace(/\/$/, '');
  const url = new URL(`${base}/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`);

  if (outputFormat) {
    url.searchParams.set('output_format', outputFormat);
  }

  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const detail = payload.detail;

  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail.trim();
  }

  const message = payload.message;

  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim();
  }

  return null;
}

function extractValidationDetail(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.detail) || payload.detail.length === 0) {
    return null;
  }

  const firstDetail = payload.detail[0];

  if (!isRecord(firstDetail)) {
    return null;
  }

  const message = firstDetail.msg;
  return typeof message === 'string' && message.trim().length > 0 ? message.trim() : null;
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 240);
}

export function parseElevenLabsOutputFormat(value: string | undefined): ElevenLabsOutputFormat | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = outputFormatSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export async function convertTextWithTimestamps(
  input: ConvertWithTimestampsInput,
): Promise<ConvertWithTimestampsOutput> {
  let apiKey = '';

  try {
    apiKey = readElevenLabsApiKey();
  } catch {
    throw new ElevenLabsRequestError('ELEVENLABS_API_KEY manquant.', 500);
  }

  const url = buildConvertWithTimestampsUrl(input.voiceId, input.outputFormat);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: input.text,
      model_id: input.modelId,
      voice_settings: input.voiceSettings
        ? {
            stability: input.voiceSettings.stability,
            similarity_boost: input.voiceSettings.similarityBoost,
            style: input.voiceSettings.style,
            use_speaker_boost: input.voiceSettings.useSpeakerBoost,
            speed: input.voiceSettings.speed,
          }
        : undefined,
    }),
    cache: 'no-store',
  });

  let payload: unknown = null;

  try {
    payload = (await response.json()) as unknown;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      extractErrorMessage(payload) ??
      extractValidationDetail(payload) ??
      `ElevenLabs request failed (${response.status}).`;

    throw new ElevenLabsRequestError(sanitizeErrorMessage(message), response.status);
  }

  const parsed = convertWithTimestampsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ElevenLabsRequestError('Reponse ElevenLabs invalide.', 502);
  }

  return parsed.data;
}
