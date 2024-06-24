import React from 'react';

interface CreateIdSlicesFunc {
  (children: React.ReactNode | string): string[];
}

interface CreateIdFunc {
  (children: React.ReactNode | string): string;
}

export type { CreateIdSlicesFunc, CreateIdFunc };
