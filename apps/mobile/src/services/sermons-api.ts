import { MOCK_SERMONS } from '../data/mock-sermons';
import type { ListPublishedSermonsInput, MobileSermon } from '../types/sermons.types';

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

function getApiBaseUrl(): string {
  if (typeof process !== 'undefined') {
    const configuredValue = process.env.EXPO_PUBLIC_API_URL;

    if (typeof configuredValue === 'string' && configuredValue.trim().length > 0) {
      return configuredValue.trim();
    }
  }

  return DEFAULT_API_BASE_URL;
}

function buildApiUrl(path: string, query?: Record<string, string>): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = new URL(`${normalizedBase}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value.length > 0) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLocaleLowerCase('fr-FR');
}

function sortByNewest(a: MobileSermon, b: MobileSermon): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function listPublishedSermons(
  input: ListPublishedSermonsInput = {},
): Promise<MobileSermon[]> {
  const searchTerm = input.search?.trim() ?? '';

  try {
    const url = buildApiUrl('/public/sermons', searchTerm ? { search: searchTerm } : undefined);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const payload = (await response.json()) as ApiResult<MobileSermon[]>;

      if (payload.success) {
        return payload.data;
      }
    }
  } catch {
    // Fall back to local mock data when API is unavailable in local/dev runs.
  }

  const normalizedSearchTerm = searchTerm ? normalizeSearchTerm(searchTerm) : '';

  const filtered = MOCK_SERMONS.filter((sermon) => {
    if (sermon.status !== 'published') {
      return false;
    }

    if (!normalizedSearchTerm) {
      return true;
    }

    const title = sermon.title.toLocaleLowerCase('fr-FR');
    const dateLabel = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(sermon.date));

    return title.includes(normalizedSearchTerm) || dateLabel.includes(normalizedSearchTerm);
  }).sort(sortByNewest);

  return Promise.resolve(filtered);
}

export async function getPublishedSermonById(id: string): Promise<MobileSermon | null> {
  try {
    const url = buildApiUrl(`/public/sermons/${id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const payload = (await response.json()) as ApiResult<MobileSermon>;

      if (payload.success) {
        return payload.data;
      }
    }
  } catch {
    // Fall back to local mock data when API is unavailable in local/dev runs.
  }

  const sermon = MOCK_SERMONS.find((item) => item.id === id && item.status === 'published') ?? null;
  return Promise.resolve(sermon);
}