import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResult, Sermon } from '@sermon-app/shared';
import { listPublishedSermons } from '../../../../lib/sermons/sermon-repository';

const listPublishedSermonsQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

function jsonResponse<T>(body: ApiResult<T>, status: number): NextResponse<ApiResult<T>> {
  return NextResponse.json(body, { status });
}

export async function GET(request: Request): Promise<NextResponse<ApiResult<Sermon[]>>> {
  const url = new URL(request.url);
  const parsedQuery = listPublishedSermonsQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonResponse(
      {
        success: false,
        error: 'Parametres de requete invalides.',
      },
      400,
    );
  }

  const sermons = await listPublishedSermons(parsedQuery.data);

  return jsonResponse(
    {
      success: true,
      data: sermons,
    },
    200,
  );
}