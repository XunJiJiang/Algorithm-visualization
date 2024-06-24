export interface CodeController {
  run: () => Promise<void>;
  pause: () => void;
  prev: () => void;
  next: () => void;
  goto: (index: number) => void;
  index: number;
  isRun: boolean;
  length: number;
  runFunc: ((index: number, callback: () => Promise<void>) => Promise<void>) | null;
  stop: () => void;
}
