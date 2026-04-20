'use client';

import { useMemo, useState } from 'react';
import type { JSX } from 'react';
import type { SermonTts } from '@sermon-app/shared';

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

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

type SermonTtsPreviewProps = {
  sermonId: string;
  initialTts?: SermonTts | null;
};

function formatSeconds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '-';
  }

  return `${value.toFixed(2)}s`;
}

function mapInitialTts(sermonId: string, tts: SermonTts | null | undefined): GenerateSermonTtsData | null {
  if (!tts) {
    return null;
  }

  const textLength = tts.normalizedAlignment?.characters.length ?? tts.alignment?.characters.length ?? 0;

  return {
    sermonId,
    title: '',
    textLength,
    audioUrl: tts.audioUrl,
    audioBucket: tts.audioBucket,
    audioPath: tts.audioPath,
    outputFormat: tts.outputFormat,
    alignment: tts.alignment,
    normalizedAlignment: tts.normalizedAlignment,
    estimatedDurationSeconds: tts.durationSeconds,
    generatedAt: tts.generatedAt,
  };
}

export function SermonTtsPreview({ sermonId, initialTts }: SermonTtsPreviewProps): JSX.Element {
  const [voiceId, setVoiceId] = useState<string>('');
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [outputFormat, setOutputFormat] = useState<string>(DEFAULT_OUTPUT_FORMAT);
  const [speed, setSpeed] = useState<number>(0.9);
  const [paragraphPauseMs, setParagraphPauseMs] = useState<number>(220);
  const [stability, setStability] = useState<number>(0.65);
  const [similarityBoost, setSimilarityBoost] = useState<number>(0.85);
  const [style, setStyle] = useState<number>(0.15);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<GenerateSermonTtsData | null>(() => mapInitialTts(sermonId, initialTts));

  const alignmentChars = useMemo(() => {
    const normalizedLength = result?.normalizedAlignment?.characters.length ?? 0;

    if (normalizedLength > 0) {
      return normalizedLength;
    }

    return result?.alignment?.characters.length ?? 0;
  }, [result]);

  async function handleGenerate(): Promise<void> {
    if (!voiceId.trim()) {
      setError('Ajoute un voice id ElevenLabs avant de lancer la generation.');
      return;
    }

    setPending(true);
    setError('');

    try {
      const response = await fetch('/api/sermons/tts/with-timestamps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sermonId,
          voiceId: voiceId.trim(),
          modelId: modelId.trim() || DEFAULT_MODEL_ID,
          outputFormat: outputFormat.trim() || DEFAULT_OUTPUT_FORMAT,
          paragraphPauseMs,
          voiceSettings: {
            stability,
            similarityBoost,
            style,
            useSpeakerBoost,
            speed,
          },
        }),
      });

      const payload = (await response.json()) as ApiResult<GenerateSermonTtsData>;

      if (!response.ok || !payload.success) {
        setResult(null);
        setError(payload.success ? 'Generation TTS impossible.' : payload.error);
        return;
      }

      setResult(payload.data);
    } catch {
      setResult(null);
      setError('Erreur reseau pendant la generation TTS.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="tts-preview-grid">
      <div className="field">
        <label htmlFor="tts-voice-id">Voice ID ElevenLabs</label>
        <input
          id="tts-voice-id"
          onChange={(event) => setVoiceId(event.target.value)}
          placeholder="EXAVITQu4vr4xnSDxMaL"
          value={voiceId}
        />
      </div>

      <div className="field field-inline">
        <div className="tts-inline-field">
          <label htmlFor="tts-model-id">Model ID</label>
          <input
            id="tts-model-id"
            onChange={(event) => setModelId(event.target.value)}
            placeholder={DEFAULT_MODEL_ID}
            value={modelId}
          />
        </div>
        <div className="tts-inline-field">
          <label htmlFor="tts-output-format">Output format</label>
          <input
            id="tts-output-format"
            onChange={(event) => setOutputFormat(event.target.value)}
            placeholder={DEFAULT_OUTPUT_FORMAT}
            value={outputFormat}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="tts-speed">Vitesse ({speed.toFixed(2)})</label>
        <input
          id="tts-speed"
          max={0.92}
          min={0.85}
          onChange={(event) => setSpeed(Number(event.target.value))}
          step={0.01}
          type="range"
          value={speed}
        />
        <div className="field-hint">Plage recommandee: 0.85 - 0.92</div>
      </div>

      <div className="field field-inline">
        <div className="tts-inline-field">
          <label htmlFor="tts-paragraph-pause">Pause entre paragraphes (ms)</label>
          <input
            id="tts-paragraph-pause"
            max={1200}
            min={0}
            onChange={(event) => setParagraphPauseMs(Number(event.target.value))}
            step={10}
            type="number"
            value={paragraphPauseMs}
          />
        </div>
        <div className="tts-inline-field">
          <label htmlFor="tts-stability">Stability</label>
          <input
            id="tts-stability"
            max={1}
            min={0}
            onChange={(event) => setStability(Number(event.target.value))}
            step={0.01}
            type="number"
            value={stability}
          />
        </div>
      </div>

      <div className="field field-inline">
        <div className="tts-inline-field">
          <label htmlFor="tts-similarity">Similarity boost</label>
          <input
            id="tts-similarity"
            max={1}
            min={0}
            onChange={(event) => setSimilarityBoost(Number(event.target.value))}
            step={0.01}
            type="number"
            value={similarityBoost}
          />
        </div>
        <div className="tts-inline-field">
          <label htmlFor="tts-style">Style</label>
          <input
            id="tts-style"
            max={1}
            min={0}
            onChange={(event) => setStyle(Number(event.target.value))}
            step={0.01}
            type="number"
            value={style}
          />
        </div>
      </div>

      <div className="checkbox-field">
        <label className="checkbox-label" htmlFor="tts-speaker-boost">
          <input
            checked={useSpeakerBoost}
            id="tts-speaker-boost"
            onChange={(event) => setUseSpeakerBoost(event.target.checked)}
            type="checkbox"
          />
          Speaker boost active
        </label>
      </div>

      <div className="action-row">
        <button className="button" disabled={pending} onClick={() => void handleGenerate()} type="button">
          {pending ? 'Generation...' : 'Generer audio + timings'}
        </button>
      </div>

      {error ? <div className="warning-banner">{error}</div> : null}

      {result ? (
        <div className="tts-result-grid">
          <div className="metric-row">
            <div className="metric-card">
              <div className="metric-label">Caracteres texte</div>
              <div className="metric-value">{result.textLength}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Caracteres alignes</div>
              <div className="metric-value">{alignmentChars}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Duree estimee</div>
              <div className="metric-value">{formatSeconds(result.estimatedDurationSeconds)}</div>
            </div>
          </div>

          <div className="field-hint">Format: {result.outputFormat}</div>
          <div className="field-hint">Genere le: {new Date(result.generatedAt).toLocaleString('fr-FR')}</div>
          <audio className="audio-preview" controls preload="none" src={result.audioUrl} />
        </div>
      ) : null}
    </div>
  );
}
