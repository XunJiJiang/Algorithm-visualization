import type { ExtraProps } from 'react-markdown';

type NodeType =
  | {
      value?: string;
    }
  | {
      children?: Array<{
        value: string;
      }>;
    };

interface GetBlockquoteConfigFunc {
  (node: NodeType): [string | null, boolean, string, object];
}

interface CreateChildrenFunc {
  (
    children: Array<React.ReactNode | string>,
    tag: string,
    hasTitle: boolean,
    title?: string,
    attributes?: {
      icon?: {
        value: string;
      };
    }
  ): React.ReactNode;
}

interface BlockquoteProps extends ExtraProps {
  className?: string;
  children?: Array<React.ReactNode | string> | React.ReactNode | null;
}

export type {
  NodeType,
  GetBlockquoteConfigFunc,
  CreateChildrenFunc,
  BlockquoteProps
};
