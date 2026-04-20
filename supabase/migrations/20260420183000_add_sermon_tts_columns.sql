alter table public.sermons
  add column if not exists tts_audio_url text,
  add column if not exists tts_audio_bucket text,
  add column if not exists tts_audio_path text,
  add column if not exists tts_voice_id text,
  add column if not exists tts_model_id text,
  add column if not exists tts_output_format text,
  add column if not exists tts_alignment jsonb,
  add column if not exists tts_normalized_alignment jsonb,
  add column if not exists tts_duration_seconds double precision,
  add column if not exists tts_generated_at timestamptz;
