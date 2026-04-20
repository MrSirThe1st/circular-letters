import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResult, Sermon } from '@sermon-app/shared';
import { getPublishedSermonById } from '../../../../../lib/sermons/sermon-repository';

const sermonIdParamsSchema = z.object({
  id: z.string().uuid(),
});

function jsonResponse<T>(body: ApiResult<T>, status: number): NextResponse<ApiResult<T>> {
  return NextResponse.json(body, { status });
}

type SermonDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: SermonDetailRouteProps,
): Promise<NextResponse<ApiResult<Sermon>>> {
  const parsedParams = sermonIdParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return jsonResponse(
      {
        success: false,
        error: 'Identifiant de predication invalide.',
      },
      400,
    );
  }

  const sermon = await getPublishedSermonById(parsedParams.data.id);

  if (!sermon) {
    return jsonResponse(
      {
        success: false,
        error: 'Predication introuvable.',
      },
      404,
    );
  }

  return jsonResponse(
    {
      success: true,
      data: sermon,
    },
    200,
  );
}