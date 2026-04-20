'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSermonSchema, updateSermonSchema } from '@sermon-app/api-contracts';
import { requireAdminUser } from '../auth/auth';
import { saveSermon, updateSermon, updateSermonStatus } from './sermon-repository';
import { isLexicalContentEmpty, normalizeDateInput, parseLexicalContent } from './sermon-utils';

type FieldErrors = Partial<Record<'title' | 'date' | 'content', string>>;

export type SermonFormState = {
  success: boolean;
  error: string;
  fieldErrors: FieldErrors;
};

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalUrlValue(formData: FormData, key: string): string | null {
  const value = getFormValue(formData, key);
  return value ? value : null;
}

function buildValidationErrorState(fieldErrors: FieldErrors): SermonFormState {
  return {
    success: false,
    error: 'Le formulaire contient des erreurs. Corrige puis reessaie.',
    fieldErrors,
  };
}

function buildAuthErrorState(): SermonFormState {
  return {
    success: false,
    error: 'Session admin invalide. Reconnecte-toi avec un compte autorise.',
    fieldErrors: {},
  };
}

function parseContentField(value: string): { content: ReturnType<typeof parseLexicalContent>; error?: string } {
  const content = parseLexicalContent(value);

  if (!content) {
    return {
      content: null,
      error: 'Le contenu du sermon est invalide. Recharge la page puis reessaie.',
    };
  }

  if (isLexicalContentEmpty(content)) {
    return {
      content,
      error: 'Ajoute au moins un paragraphe avant d\'enregistrer.',
    };
  }

  return { content };
}

export async function createSermonAction(
  _previousState: SermonFormState,
  formData: FormData,
): Promise<SermonFormState> {
  let userId = '';

  try {
    const user = await requireAdminUser();
    userId = user.id;
  } catch {
    return buildAuthErrorState();
  }

  const title = getFormValue(formData, 'title');
  const date = getFormValue(formData, 'date');
  const statusValue = getFormValue(formData, 'status');
  const audioUrl = getOptionalUrlValue(formData, 'audioUrl');
  const contentValue = getFormValue(formData, 'content');
  const parsedContent = parseContentField(contentValue);

  if (parsedContent.error || !parsedContent.content) {
    return buildValidationErrorState({ content: parsedContent.error });
  }

  const parsed = createSermonSchema.safeParse({
    title,
    date: normalizeDateInput(date),
    content: parsedContent.content,
    audioUrl,
    status: statusValue,
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return buildValidationErrorState({
      title: flattened.fieldErrors.title?.[0],
      date: flattened.fieldErrors.date?.[0],
      content: flattened.fieldErrors.content?.[0],
    });
  }

  const result = await saveSermon(parsed.data, userId);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      fieldErrors: {},
    };
  }

  redirect('/sermons?created=1');
}

export async function updateSermonAction(
  _previousState: SermonFormState,
  formData: FormData,
): Promise<SermonFormState> {
  try {
    await requireAdminUser();
  } catch {
    return buildAuthErrorState();
  }

  const id = getFormValue(formData, 'id');
  const title = getFormValue(formData, 'title');
  const date = getFormValue(formData, 'date');
  const statusValue = getFormValue(formData, 'status');
  const audioUrl = getOptionalUrlValue(formData, 'audioUrl');
  const contentValue = getFormValue(formData, 'content');
  const parsedContent = parseContentField(contentValue);

  if (parsedContent.error || !parsedContent.content) {
    return buildValidationErrorState({ content: parsedContent.error });
  }

  const parsed = updateSermonSchema.safeParse({
    id,
    title,
    date: normalizeDateInput(date),
    content: parsedContent.content,
    audioUrl,
    status: statusValue,
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return buildValidationErrorState({
      title: flattened.fieldErrors.title?.[0],
      date: flattened.fieldErrors.date?.[0],
      content: flattened.fieldErrors.content?.[0],
    });
  }

  const result = await updateSermon(parsed.data);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      fieldErrors: {},
    };
  }

  revalidatePath('/sermons');
  revalidatePath(`/sermons/${id}`);
  redirect('/sermons?updated=1');
}

export async function setSermonStatusAction(formData: FormData): Promise<void> {
  try {
    await requireAdminUser();
  } catch {
    redirect('/login');
  }

  const id = getFormValue(formData, 'id');
  const status = getFormValue(formData, 'status');

  const parsed = updateSermonSchema.safeParse({ id, status });

  if (!parsed.success || !parsed.data.status) {
    return;
  }

  const result = await updateSermonStatus(parsed.data.id, parsed.data.status);

  if (!result.success) {
    return;
  }

  revalidatePath('/sermons');
}