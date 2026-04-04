// Shared types

export interface Sermon {
  id: string;
  title: string;
  date: string;
  content: unknown; // Lexical JSON
  audioUrl: string | null;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
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
