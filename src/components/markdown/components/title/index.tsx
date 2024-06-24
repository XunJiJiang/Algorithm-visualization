import type { ContentNodeNullType, TitleProps } from '../../types/comp-markdown-comp-title';
import type { ContentType } from '../../types/comp-markdown.d.ts';

import { useId } from 'react';
import { createId } from '../../utils/index.ts';

export function H1({ className = '', children = '', setContents }: TitleProps) {
  const id = createId(children) + useId();
  const content: ContentNodeNullType = {
    id,
    label: children,
    level: 1,
    node: null,
  };
  return (
    <h1
      ref={node => {
        if (!node) return;
        content.node = node;
        setContents(content as ContentType);
      }}
      id={content.id}
      className={`markdown-h1 ${className ?? ''}`}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children = '', setContents }: TitleProps) {
  const id = createId(children) + useId();
  const content: ContentNodeNullType = {
    id,
    label: children,
    level: 2,
    node: null,
  };
  return (
    <h2
      ref={node => {
        if (!node) return;
        content.node = node;
        setContents(content as ContentType);
      }}
      id={content.id}
      className={`markdown-h2 ${className ?? ''}`}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children = '', setContents }: TitleProps) {
  const id = createId(children) + useId();
  const content: ContentNodeNullType = {
    id,
    label: children,
    level: 3,
    node: null,
  };
  return (
    <h3
      ref={node => {
        if (!node) return;
        content.node = node;
        setContents(content as ContentType);
      }}
      id={content.id}
      className={`markdown-h3 ${className ?? ''}`}
    >
      {children}
    </h3>
  );
}
