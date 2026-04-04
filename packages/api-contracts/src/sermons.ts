import { z } from 'zod';

// Create sermon request
export const createSermonSchema = z.object({
  title: z.string().min(1, 'Title required'),
  date: z.string().datetime(),
  content: z.unknown(), // Lexical JSON
  audioUrl: z.string().url().nullable().optional(),
  status: z.enum(['draft', 'published']),
});

export type CreateSermonRequest = z.infer<typeof createSermonSchema>;

// Update sermon request
export const updateSermonSchema = createSermonSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateSermonRequest = z.infer<typeof updateSermonSchema>;

// Get sermons query params
export const getSermonsQuerySchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type GetSermonsQuery = z.infer<typeof getSermonsQuerySchema>;
