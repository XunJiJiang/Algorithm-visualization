import type { ContentType, ContentsType } from './comp-markdown.d.ts';
import React from 'react';

interface ChangeLocationFunc {
  (content: ContentType): void;
}

interface ContentsINPageRef {
  changeLocation: ChangeLocationFunc;
}

interface ContentsINPageProps {
  contents: ContentsType;
}

type ContentLabelType =
  | string
  | React.ReactNode
  | Array<string | React.ReactNode>;

export type {
  ChangeLocationFunc,
  ContentsINPageRef,
  ContentsINPageProps,
  ContentLabelType
};
