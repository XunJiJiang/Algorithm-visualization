// @ts-check
import { sleep } from '../utils/sleep.ts';

/**
 * @param {[number, number, number]} args [棋盘大小(2^k x 2^k)，特殊方格的行号，特殊方格的列号]
 * @param {(index: number, grip: number[][], callback: (grip: number[][]) => Promise<void>) => void} addTask
 * @param {{
 *  setGrip: (grip: number[][]) => void;
 * }} gripControl
 */
export function runGridCoverCode([k, row, col], addTask, gripControl) {
  /** 棋盘覆盖
   * @param {number} k 棋盘大小为2^k x 2^k
   * @param {number} row 特殊方格的行号
   * @param {number} col 特殊方格的列号
   * @returns
   */
  function gridCover(k, row, col) {
    // tile是L型骨牌的编号
    let tile = 1;
    // 棋盘大小 size x size，而size = 2^k
    let size = 1 << k;

    // 创建一个size x size大小的二维数组作为棋盘
    const grid = createGrid(size, size);
    // 标记出特殊方格的位置
    grid[row - 1][col - 1] = 0;

    addTask(4, grid, async grid => {
      gripControl.setGrip(grid);
      await sleep(200);
    });

    // tr表示棋盘左上角的行号，tc表示棋盘左上角的列号，dr表示特殊方格的行号，dc表示特殊方格的列好，size表示棋盘的大小
    function chessBoard(tr, tc, dr, dc, size) {
      if (size === 1) return;

      let t = tile++;
      let s = size / 2;

      // 如果特殊方格0位于左上角子棋盘中，则左上角子棋盘为特殊棋盘
      if (dr < tr + s && dc < tc + s) {
        // 分解特殊棋盘
        chessBoard(tr, tc, dr, dc, s);
      } else {
        // 否则，左上角子棋盘不是特殊棋盘，我们可以将其空闲方格位置（右下角）定义为特殊方格，让其变为一个特殊棋盘
        grid[tr + s - 1][tc + s - 1] = t;
        addTask(12, grid, async grid => {
          gripControl.setGrip(grid);
          await sleep(200);
        });
        // 分解特殊棋盘
        chessBoard(tr, tc, tr + s - 1, tc + s - 1, s);
      }

      // 如果特殊方格0位于右上角子棋盘中，则右上角子棋盘为特殊棋盘
      if (dr < tr + s && dc >= tc + s) {
        // 分解特殊棋盘
        chessBoard(tr, tc + s, dr, dc, s);
      } else {
        // 否则，右上角子棋盘不是特殊棋盘，我们可以将其空闲方格位置（左下角）定义为特殊方格，让其变为一个特殊棋盘
        grid[tr + s - 1][tc + s] = t;
        addTask(18, grid, async grid => {
          gripControl.setGrip(grid);
          await sleep(200);
        });
        chessBoard(tr, tc + s, tr + s - 1, tc + s, s);
      }

      // 如果特殊方格0位于左下角子棋盘中，则左下角子棋盘为特殊棋盘
      if (dr >= tr + s && dc < tc + s) {
        // 分解特殊棋盘
        chessBoard(tr + s, tc, dr, dc, s);
      } else {
        // 否则，左下角子棋盘不是特殊棋盘，我们可以将其空闲方格位置（右上角）定义为特殊方格，让其变为一个特殊棋盘
        grid[tr + s][tc + s - 1] = t;
        addTask(24, grid, async grid => {
          gripControl.setGrip(grid);
          await sleep(200);
        });
        chessBoard(tr + s, tc, tr + s, tc + s - 1, s);
      }

      // 如果特殊方格0位于右下角子棋盘中，则右下角子棋盘为特殊棋盘
      if (dr >= tr + s && dc >= tc + s) {
        // 分解特殊棋盘
        chessBoard(tr + s, tc + s, dr, dc, s);
      } else {
        // 否则，右下角子棋盘不是特殊棋盘，我们可以将其空闲方格位置（左上角）定义为特殊方格，让其变为一个特殊棋盘
        grid[tr + s][tc + s] = t;
        addTask(30, grid, async grid => {
          gripControl.setGrip(grid);
          await sleep(200);
        });
        chessBoard(tr + s, tc + s, tr + s, tc + s, s);
      }
    }

    chessBoard(0, 0, row - 1, col - 1, size);
    addTask(35, grid, async grid => {
      gripControl.setGrip(grid);
      await sleep(200);
    });
    return grid;
  }

  /* 创建二维数组 */
  function createGrid(row, col) {
    const grid = new Array(row);
    for (let i = 0; i < row; i++) {
      grid[i] = new Array(col);
    }
    return grid;
  }

  return gridCover(k, row, col);
}
