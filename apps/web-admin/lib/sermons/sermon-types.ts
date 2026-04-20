export type LexicalSerializedNode = {
  children?: LexicalSerializedNode[];
  text?: string;
  type: string;
  [key: string]: unknown;
};

export type LexicalRootNode = {
  root: LexicalSerializedNode & {
    children: LexicalSerializedNode[];
    type: 'root';
  };
};