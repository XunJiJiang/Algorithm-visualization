import React from 'react';

interface FencedCodeBlocksProps {
  children: string;
  match: RegExpExecArray;
}

interface ShortCodeBlocksProps {
  className: string | null;
  children: string | React.ReactNode;
}

interface CodeProps {
  className?: string | null;
  children?: string | React.ReactNode;
}

export type { FencedCodeBlocksProps, ShortCodeBlocksProps, CodeProps };
