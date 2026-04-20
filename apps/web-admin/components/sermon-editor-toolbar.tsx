'use client';

import type { JSX } from 'react';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

export function SermonEditorToolbar(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  return (
    <div aria-label="Outils de mise en forme" className="editor-toolbar" role="toolbar">
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} type="button">
        Annuler
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} type="button">
        Retablir
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} type="button">
        Gras
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} type="button">
        Italique
      </button>
      <button
        className="button-secondary editor-tool"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        }}
        type="button"
      >
        Paragraphe
      </button>
      <button
        className="button-secondary editor-tool"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h2'));
            }
          });
        }}
        type="button"
      >
        Section
      </button>
      <button
        className="button-secondary editor-tool"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h3'));
            }
          });
        }}
        type="button"
      >
        Sous-section
      </button>
      <button
        className="button-secondary editor-tool"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          });
        }}
        type="button"
      >
        Bloc Ecriture
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} type="button">
        Liste
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} type="button">
        Numerotee
      </button>
      <button className="button-secondary editor-tool" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)} type="button">
        Retirer liste
      </button>
    </div>
  );
}