// Shared types

export interface Sermon {
  id: string;
  title: string;
  date: string;
  content: unknown; // Lexical JSON
  audioUrl: string | null;
  tts: SermonTts | null;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CharacterAlignment {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

export interface SermonTts {
  audioUrl: string;
  audioBucket: string;
  audioPath: string;
  voiceId: string;
  modelId: string;
  outputFormat: string;
  alignment: CharacterAlignment | null;
  normalizedAlignment: CharacterAlignment | null;
  durationSeconds: number | null;
  generatedAt: string;
}

export interface Audio {
  id: string;
  sermonId: string;
  fileUrl: string;
  duration: number;
  fileSize: number;
  createdAt: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
