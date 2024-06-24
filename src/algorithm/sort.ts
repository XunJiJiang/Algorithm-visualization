/** 冒泡排序 */
import type { CodeController } from '../utils/code-controller.js';

import { createSort } from '../utils/echarts.js';
import { sleep } from '../utils/sleep.js';
import { deepClone } from '../utils/deepClone.js';
// @ts-ignore
import Msg from '../components/message/index.js';

const bubbleSortCode = [
  'function bubbleSort(arr) {',
  '    for (let j = 0; j < arr.length - 1; j++) {',
  '        for (let i = 0; i < arr.length - 1 - j; i++) {',
  '            if (arr[i] > arr[i + 1]) {',
  '                let temp = arr[i];',
  '                arr[i] = arr[i + 1];',
  '                arr[i + 1] = temp;',
  '            }',
  '        }',
  '    }',
  '    return arr;',
  '}',
];

export function getBubbleSortCodeTree() {
  return bubbleSortCode;
}

const quickSortCode = [
  'function partition(arr, low, high) {',
  '    let pivot = arr[low];',
  '    while (low < high) {',
  '        while (low < high && arr[high] > pivot) {',
  '            --high;',
  '        }',
  '        arr[low] = arr[high];',
  '        while (low < high && arr[low] <= pivot) {',
  '            ++low;',
  '        }',
  '        arr[high] = arr[low];',
  '    }',
  '    arr[low] = pivot;',
  '    return low;',
  '}',
  '',
  'function quickSort(arr, low, high) {',
  '    if (low < high) {',
  '        let pivot = partition(arr, low, high);',
  '        quickSort(arr, low, pivot - 1);',
  '        quickSort(arr, pivot + 1, high);',
  '    }',
  '    return arr;',
  '}',
];

export function getQuickSortCodeTree() {
  return quickSortCode;
}

// number[] 是传入算法的参数的类型

let taskQueue: [number, number[], (arr: number[]) => Promise<void>][] = [];

async function runBubbleSortQueue(
  /**
   * @param index 当前执行到code的行位置
   * @param callback 回调函数，任务包括数据任务队列下标指针的移动和执行任务队列中的任务
   */
  callback: (index: number, callback: () => Promise<void>) => Promise<void>,
  controller: SortController
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

export class SortController implements CodeController {
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
    await runBubbleSortQueue(this.runFunc, this);
  };

  pause = (runStop = true) => {
    this.isRun = false;

    if (runStop) {
      this.stop();
    }
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

    this.pause(false);
    this.index -= 2;

    (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
      taskQueue[this.index < 0 ? 0 : this.index][0],
      async () => {
        await taskQueue[this.index < 0 ? 0 : this.index][2](taskQueue[this.index < 0 ? 0 : this.index][1]);
        this.index++;
      }
    );
  };

  next = () => {
    if (this.index === taskQueue.length - 2) {
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    this.pause(false);
    (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
      taskQueue[this.index][0],
      async () => {
        await taskQueue[this.index][2](taskQueue[this.index][1]);
        this.index++;
      }
    );
  };

  goto = (index: number) => {
    this.run();
    gotoTask = () => {
      gotoTask = null;
      return index;
    };
  };
  length = taskQueue.length;
  runFunc = async () => {};
  stop = () => {};
}

export async function createBubbleSortTaskQueue(_arr: number[], controller: SortController) {
  taskQueue = [];
  controller.index = 0;
  controller.length = taskQueue.length;
  controller.isRun = false;
  const arr = deepClone(_arr);
  const sort = createSort(deepClone(arr));
  await sleep(500);

  taskQueue.push([
    0,
    deepClone(arr),
    async arr => {
      sort.setArr(arr);
      await sleep(100);
    },
  ]);

  function bubbleSort(arr: number[]) {
    for (let j = 0; j < arr.length - 1; j++) {
      taskQueue.push([
        1,
        [],
        async () => {
          await sleep(100);
        },
      ]);
      for (let i = 0; i < arr.length - 1 - j; i++) {
        taskQueue.push([
          2,
          [],
          async () => {
            await sleep(100);
          },
        ]);
        if (arr[i] > arr[i + 1]) {
          taskQueue.push([
            3,
            [],
            async () => {
              await sleep(100);
            },
          ]);
          let temp = arr[i];
          taskQueue.push([
            4,
            [],
            async () => {
              await sleep(100);
            },
          ]);
          arr[i] = arr[i + 1];
          taskQueue.push([
            5,
            [],
            async () => {
              await sleep(100);
            },
          ]);
          arr[i + 1] = temp;
          taskQueue.push([
            6,
            deepClone(arr),
            async (arr: number[]) => {
              sort.setArr(arr);
              await sleep(500);
            },
          ]);
        }
      }
    }
    return arr;
  }

  bubbleSort(arr);

  controller.length = taskQueue.length;
}

export async function createQuickSortTaskQueue(_arr: number[], controller: SortController) {
  taskQueue = [];
  controller.index = 0;
  controller.length = taskQueue.length;
  controller.isRun = false;
  const arr = deepClone(_arr);
  const sort = createSort(deepClone(arr));
  await sleep(500);

  taskQueue.push([
    0,
    deepClone(arr),
    async arr => {
      sort.setArr(arr);
      await sleep(100);
    },
  ]);

  function partition(arr: number[], low: number, high: number) {
    let pivot = arr[low];
    taskQueue.push([
      1,
      [],
      async () => {
        await sleep(100);
      },
    ]);
    while (low < high) {
      taskQueue.push([
        2,
        [],
        async () => {
          await sleep(100);
        },
      ]);
      while (low < high && arr[high] > pivot) {
        taskQueue.push([
          3,
          [],
          async () => {
            await sleep(100);
          },
        ]);
        --high;
        taskQueue.push([
          4,
          [],
          async () => {
            await sleep(100);
          },
        ]);
      }
      arr[low] = arr[high];
      taskQueue.push([
        6,
        [],
        async () => {
          await sleep(100);
        },
      ]);
      while (low < high && arr[low] <= pivot) {
        taskQueue.push([
          7,
          [],
          async () => {
            await sleep(100);
          },
        ]);
        ++low;
        taskQueue.push([
          8,
          [],
          async () => {
            await sleep(100);
          },
        ]);
      }
      arr[high] = arr[low];
      taskQueue.push([
        10,
        deepClone(arr),
        async arr => {
          sort.setArr(arr);
          await sleep(500);
        },
      ]);
    }
    arr[low] = pivot;
    taskQueue.push([
      12,
      deepClone(arr),
      async arr => {
        sort.setArr(arr);
        await sleep(500);
      },
    ]);
    taskQueue.push([
      13,
      [],
      async () => {
        await sleep(100);
      },
    ]);
    return low;
  }

  function quickSort(arr: number[], low: number, high: number) {
    if (low < high) {
      let pivot = partition(arr, low, high);
      quickSort(arr, low, pivot - 1);
      quickSort(arr, pivot + 1, high);
    }
    return arr;
  }

  quickSort(arr, 0, arr.length - 1);

  controller.length = taskQueue.length;
}
