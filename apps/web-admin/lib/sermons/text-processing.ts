import type { LexicalRootNode, LexicalSerializedNode } from './sermon-types';

const PDF_ARTIFACT_PATTERNS = [/^page\s+\d+(?:\s+sur\s+\d+)?$/i, /^\d+\s*\/\s*\d+$/, /^\d+$/];

function createTextNode(text: string): LexicalSerializedNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  };
}

function createParagraphNode(text: string): LexicalSerializedNode {
  return {
    children: [createTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  };
}

function normalizeLine(line: string): string {
  return line.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function isPdfArtifact(line: string): boolean {
  return PDF_ARTIFACT_PATTERNS.some((pattern) => pattern.test(line));
}

function joinParagraphLines(lines: string[]): string {
  return lines
    .join(' ')
    .replace(/\s+([,;:.!?»])/g, '$1')
    .replace(/([«“])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanExtractedSermonText(rawText: string): string {
  const normalizedLines = rawText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => normalizeLine(line))
    .filter((line) => !isPdfArtifact(line));

  const blocks: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (): void => {
    if (currentParagraph.length === 0) {
      return;
    }

    const paragraph = joinParagraphLines(currentParagraph);

    if (paragraph) {
      blocks.push(paragraph);
    }

    currentParagraph = [];
  };

  normalizedLines.forEach((line) => {
    if (!line) {
      flushParagraph();
      return;
    }

    currentParagraph.push(line);
  });

  flushParagraph();

  return blocks.join('\n\n');
}

export function buildStructuredLexicalContent(rawText: string): LexicalRootNode {
  const cleanedText = cleanExtractedSermonText(rawText);
  const blocks = cleanedText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const children = blocks.map((block) => createParagraphNode(block));

  return {
    root: {
      children: children.length > 0 ? children : [createParagraphNode('')],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}