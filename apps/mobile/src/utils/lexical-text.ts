import type { LexicalRootNode } from '../types/sermons.types';

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

function collectNodeText(node: unknown): string {
  if (!isRecord(node)) {
    return '';
  }

  const ownText = typeof node.text === 'string' ? node.text : '';
  const children = Array.isArray(node.children) ? node.children : [];
  const childText = children.map((child) => collectNodeText(child)).join('');

  return `${ownText}${childText}`.trim();
}

export function extractSermonText(content: unknown): string {
  if (!isLexicalRootNode(content)) {
    return '';
  }

  return content.root.children
    .map((node) => collectNodeText(node))
    .filter((block) => block.length > 0)
    .join('\n\n');
}