'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { extractPlainTextContent, serializeLexicalContent } from '../lib/sermons/sermon-utils';
import type { LexicalRootNode } from '../lib/sermons/sermon-types';
import { SermonEditorToolbar } from './sermon-editor-toolbar';

type SermonEditorProps = {
  content: LexicalRootNode;
  inputName: string;
};

const theme: InitialConfigType['theme'] = {
  heading: {
    h2: 'editor-heading editor-heading-h2',
    h3: 'editor-heading editor-heading-h3',
  },
  list: {
    listitem: 'editor-list-item',
    nested: {
      listitem: 'editor-list-item',
    },
    ol: 'editor-list',
    ul: 'editor-list',
  },
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
  },
};

type InitialStatePluginProps = {
  content: LexicalRootNode;
};

function InitialStatePlugin({ content }: InitialStatePluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const serialized = serializeLexicalContent(content);

    try {
      const parsedState = editor.parseEditorState(serialized);
      editor.setEditorState(parsedState);
      return;
    } catch {
      const plainText = extractPlainTextContent(content);

      editor.update(() => {
        const root = $getRoot();
        root.clear();

        const paragraphs = plainText
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean);

        if (paragraphs.length === 0) {
          root.append($createParagraphNode());
          return;
        }

        paragraphs.forEach((paragraph) => {
          const paragraphNode = $createParagraphNode();
          paragraphNode.append($createTextNode(paragraph));
          root.append(paragraphNode);
        });
      });
    }
  }, [content, editor]);

  return null;
}

export function SermonEditor({ content, inputName }: SermonEditorProps): JSX.Element {
  const [serializedContent, setSerializedContent] = useState(() => serializeLexicalContent(content));

  useEffect(() => {
    setSerializedContent(serializeLexicalContent(content));
  }, [content]);

  const initialConfig: InitialConfigType = {
    editorState: null,
    namespace: 'sermon-review-editor',
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError(error: Error): void {
      throw error;
    },
    theme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-shell">
        <SermonEditorToolbar />
        <div className="editor-surface">
          <InitialStatePlugin content={content} />
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={<ContentEditable aria-label="Contenu du sermon" className="editor-input" id="content" />}
            placeholder={<div className="editor-placeholder">Saisis le sermon, ajoute des sections et marque les passages bibliques avec le bloc Ecriture.</div>}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={(editorState) => setSerializedContent(JSON.stringify(editorState.toJSON()))} />
        </div>
        <input name={inputName} type="hidden" value={serializedContent} />
      </div>
    </LexicalComposer>
  );
}