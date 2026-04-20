import { Fragment } from 'react';
import type { JSX, ReactNode } from 'react';
import { coerceLexicalContent } from '../lib/sermons/sermon-utils';
import type { LexicalSerializedNode } from '../lib/sermons/sermon-types';

type SermonContentProps = {
  content: unknown;
  previewBlocks?: number;
};

function isTextNode(node: LexicalSerializedNode): boolean {
  return node.type === 'text' && typeof node.text === 'string';
}

function isFormatEnabled(node: LexicalSerializedNode, flag: number): boolean {
  return typeof node.format === 'number' && (node.format & flag) === flag;
}

function renderTextNode(node: LexicalSerializedNode, key: string): ReactNode {
  if (!isTextNode(node)) {
    return null;
  }

  let content: ReactNode = node.text;

  if (isFormatEnabled(node, 1)) {
    content = <strong className="sermon-content-strong">{content}</strong>;
  }

  if (isFormatEnabled(node, 2)) {
    content = <em className="sermon-content-emphasis">{content}</em>;
  }

  return <Fragment key={key}>{content}</Fragment>;
}

function renderInlineNodes(nodes: LexicalSerializedNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === 'linebreak') {
      return <br key={key} />;
    }

    if (isTextNode(node)) {
      return renderTextNode(node, key);
    }

    if (Array.isArray(node.children)) {
      return <Fragment key={key}>{renderInlineNodes(node.children, key)}</Fragment>;
    }

    return null;
  });
}

function renderListItem(node: LexicalSerializedNode, key: string): JSX.Element {
  const children = Array.isArray(node.children) ? node.children : [];
  const nestedLists = children.filter((child) => child.type === 'list');
  const inlineChildren = children.filter((child) => child.type !== 'list');

  return (
    <li className="sermon-content-list-item" key={key}>
      {inlineChildren.length > 0 ? renderInlineNodes(inlineChildren, `${key}-content`) : null}
      {nestedLists.length > 0 ? nestedLists.map((child, index) => renderBlockNode(child, `${key}-nested-${index}`)) : null}
    </li>
  );
}

function renderBlockNode(node: LexicalSerializedNode, key: string): JSX.Element | null {
  const children = Array.isArray(node.children) ? node.children : [];

  switch (node.type) {
    case 'heading': {
      const tag = node.tag === 'h3' ? 'h3' : 'h2';
      const className = tag === 'h3' ? 'sermon-content-heading sermon-content-heading-h3' : 'sermon-content-heading sermon-content-heading-h2';

      if (tag === 'h3') {
        return <h3 className={className} key={key}>{renderInlineNodes(children, key)}</h3>;
      }

      return <h2 className={className} key={key}>{renderInlineNodes(children, key)}</h2>;
    }
    case 'quote':
      return (
        <blockquote className="sermon-content-scripture" key={key}>
          <span className="sermon-content-scripture-label">Ecriture</span>
          <div>{renderInlineNodes(children, key)}</div>
        </blockquote>
      );
    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul';

      return (
        <ListTag className="sermon-content-list" key={key}>
          {children.map((child, index) => renderListItem(child, `${key}-${index}`))}
        </ListTag>
      );
    }
    case 'paragraph':
      return <p className="sermon-content-paragraph" key={key}>{renderInlineNodes(children, key)}</p>;
    default:
      if (children.length === 0) {
        return null;
      }

      return <div className="sermon-content-paragraph" key={key}>{renderInlineNodes(children, key)}</div>;
  }
}

export function SermonContent({ content, previewBlocks }: SermonContentProps): JSX.Element {
  const lexicalContent = coerceLexicalContent(content);
  const blocks = previewBlocks
    ? lexicalContent.root.children.slice(0, previewBlocks)
    : lexicalContent.root.children;
  const className = previewBlocks ? 'sermon-content sermon-content-preview' : 'sermon-content';

  return <div className={className}>{blocks.map((node, index) => renderBlockNode(node, `block-${index}`))}</div>;
}