import type { LexicalRootNode } from './sermon-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isLexicalRootNode(value: unknown): value is LexicalRootNode {
  if (!isRecord(value)) {
    return false;
  }

  const root = value.root;
  return isRecord(root) && root.type === 'root' && Array.isArray(root.children);
}

function readNodeText(node: unknown): string {
  if (!isRecord(node)) {
    return '';
  }

  const directText = typeof node.text === 'string' ? node.text : '';
  const children = Array.isArray(node.children) ? node.children : [];
  const childText = children.map((child) => readNodeText(child)).join('');
  return `${directText}${childText}`.trim();
}

export function normalizeDateInput(value: string): string {
  if (!value) {
    return value;
  }

  const normalized = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(normalized.getTime()) ? value : normalized.toISOString();
}

export function buildLexicalContent(value: string): LexicalRootNode {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: paragraph,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    }));

  return {
    root: {
      children: paragraphs,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

export function serializeLexicalContent(value: LexicalRootNode): string {
  return JSON.stringify(value);
}

export function parseLexicalContent(value: string): LexicalRootNode | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isLexicalRootNode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function coerceLexicalContent(value: unknown): LexicalRootNode {
  if (isLexicalRootNode(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseLexicalContent(value);

    if (parsed) {
      return parsed;
    }

    return buildLexicalContent(value);
  }

  return buildLexicalContent('');
}

export function extractPlainTextContent(value: unknown): string {
  if (!isLexicalRootNode(value)) {
    return '';
  }

  return value.root.children
    .map((child) => readNodeText(child))
    .filter(Boolean)
    .join('\n\n');
}

export function isLexicalContentEmpty(value: LexicalRootNode): boolean {
  return extractPlainTextContent(value).trim().length === 0;
}

export function formatDateLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}