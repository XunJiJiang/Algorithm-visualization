/** 棋盘覆盖问题 */
import type { CodeController } from '../utils/code-controller';

import { createGrip } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';
// @ts-ignore
import Msg from '../components/message/index.js';
// @ts-ignore
import { runGridCoverCode } from './grid-cover-code.js';

const gridCoverCode = [
  'function gridCover(k, row, col) {',
  '  let tile = 1;',
  '  let size = 1 << k;',
  '  const grid = createGrid(size, size);',
  '  grid[row - 1][col - 1] = 0;',
  '  function chessBoard(tr, tc, dr, dc, size) {',
  '    if (size === 1) return;',
  '    let t = tile++;',
  '    let s = size / 2;',
  '    if (dr < tr + s && dc < tc + s) {',
  '      chessBoard(tr, tc, dr, dc, s);',
  '    } else {',
  '      grid[tr + s - 1][tc + s - 1] = t;',
  '      chessBoard(tr, tc, tr + s - 1, tc + s - 1, s);',
  '    }',
  '    if (dr < tr + s && dc >= tc + s) {',
  '      chessBoard(tr, tc + s, dr, dc, s);',
  '    } else {',
  '      grid[tr + s - 1][tc + s] = t;',
  '      chessBoard(tr, tc + s, tr + s - 1, tc + s, s);',
  '    }',
  '    if (dr >= tr + s && dc < tc + s) {',
  '      chessBoard(tr + s, tc, dr, dc, s);',
  '    } else {',
  '      grid[tr + s][tc + s - 1] = t;',
  '      chessBoard(tr + s, tc, tr + s, tc + s - 1, s);',
  '    }',
  '    if (dr >= tr + s && dc >= tc + s) {',
  '      chessBoard(tr + s, tc + s, dr, dc, s);',
  '    } else {',
  '      grid[tr + s][tc + s] = t;',
  '      chessBoard(tr + s, tc + s, tr + s, tc + s, s);',
  '    }',
  '  }',
  '  chessBoard(0, 0, row - 1, col - 1, size);',
  '  return grid;',
  '}',
  '',
  'function createGrid(row, col) {',
  '  const grid = new Array(row);',
  '  for (let i = 0; i < row; i++) {',
  '    grid[i] = new Array(col);',
  '  }',
  '  return grid;',
  '}',
];

type GripType = number[][];

let taskQueue: [number, GripType, (grip: GripType) => Promise<void>][] = [];

function addTask(index: number, grip: GripType, callback: (grip: GripType) => Promise<void>) {
  taskQueue.push([index, deepClone(grip), callback]);
}

async function runGridCoverQueue(
  callback: (index: number, callback: () => Promise<void>) => Promise<void>,
  controller: GridCoverController
) {
  for (let i = controller.index; i < taskQueue.length; i++) {
    if (!controller.isRun) return;
    await callback(taskQueue[i][0], async () => {
      controller.index = i;
      await taskQueue[i][2](taskQueue[i][1]);
      if (gotoTask) {
        i = gotoTask();
      }
    });
  }
}

let gotoTask: (() => number) | null = null;

export class GridCoverController implements CodeController {
  index = 0;
  isRun = false;

  run = async () => {
    if (this.index < 0) {
      this.index = 0;
    } else if (this.index >= taskQueue.length) {
      this.index = taskQueue.length - 1;
    }
    if (this.isRun) return;
    this.isRun = true;
    this.runFunc && (await runGridCoverQueue(this.runFunc, this));
  };

  pause = () => {
    this.isRun = false;
  };

  prev = () => {
    if (this.index <= 0) {
      this.index = 0;
      Msg.message({
        message: '已经是第一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    this.pause();
    this.index -= 2;

    this.runFunc &&
      (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[this.index < 0 ? 0 : this.index][0],
        async () => {
          await taskQueue[this.index < 0 ? 0 : this.index][2](taskQueue[this.index][1]);
          this.index++;
        }
      );
  };

  next = () => {
    if (this.index >= taskQueue.length) {
      this.index = taskQueue.length - 1;
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    this.pause();
    this.runFunc &&
      (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[this.index][0],
        async () => {
          await taskQueue[this.index][2](taskQueue[this.index][1]);
          this.index++;
        }
      );
  };

  runFunc: ((index: number, callback: () => Promise<void>) => Promise<void>) | null = null;

  goto = (index: number) => {
    this.run();
    gotoTask = () => {
      gotoTask = null;
      return index;
    };
  };

  length = taskQueue.length;
}

export function getGridCoverCodeTree() {
  return gridCoverCode;
}

export async function createGridCoverTaskQueue(
  [k, row, col]: [number, number, number],
  controller: GridCoverController
) {
  taskQueue = [];
  controller.index = 0;
  controller.isRun = false;
  controller.length = taskQueue.length;
  const gripDraw = createGrip(k);

  await sleep(500);

  runGridCoverCode([k, row, col], addTask, gripDraw);

  controller.length = taskQueue.length;
}
