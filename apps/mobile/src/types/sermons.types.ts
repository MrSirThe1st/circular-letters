export type LexicalSerializedNode = {
  children?: LexicalSerializedNode[];
  text?: string;
  type: string;
  [key: string]: unknown;
};

export type LexicalRootNode = {
  root: LexicalSerializedNode & {
    children: LexicalSerializedNode[];
    type: 'root';
  };
};

export type SermonStatus = 'draft' | 'published';

export type CharacterAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

export type SermonTts = {
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
};

export type MobileSermon = {
  id: string;
  title: string;
  date: string;
  content: unknown;
  audioUrl: string | null;
  tts: SermonTts | null;
  status: SermonStatus;
};

export type ListPublishedSermonsInput = {
  search?: string;
};