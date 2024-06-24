import type { ContentType } from './comp-markdown.d.ts';
import React from 'react';

interface ContentNodeNullType extends ContentType {
  node: null | HTMLElement;
  offsetTop?: number;
}

interface TitleProps {
  className?: string;
  children?: React.ReactNode | string | null;
  setContents: (content: ContentType) => void;
}

export type { ContentNodeNullType, TitleProps };
