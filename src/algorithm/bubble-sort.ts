/** 冒泡排序 */
import { createSort } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';
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

// number[] 是传入算法的参数的类型

let taskQueue: [number, number[], (arr: number[]) => Promise<void>][] = [];

export async function runBubbleSortQueue(
  /**
   * @param index 当前执行到code的行位置
   * @param callback 回调函数，任务包括数据任务队列下标指针的移动和执行任务队列中的任务
   */
  callback: (index: number, callback: () => Promise<void>) => Promise<void>
) {
  for (let i = bubbleSortQueueControl.index; i < taskQueue.length; i++) {
    if (!bubbleSortQueueControl.isRun) return;
    await callback(taskQueue[i][0], async () => {
      bubbleSortQueueControl.index = i;
      await taskQueue[i][2](taskQueue[i][1]);
      if (gotoTask) {
        i = gotoTask();
      }
    });
  }
}

let gotoTask: (() => number) | null = null;

export const bubbleSortQueueControl = {
  pause: () => {
    bubbleSortQueueControl.isRun = false;
  },
  run: async () => {
    if (bubbleSortQueueControl.index < 0) {
      bubbleSortQueueControl.index = 0;
    } else if (bubbleSortQueueControl.index >= taskQueue.length) {
      bubbleSortQueueControl.index = taskQueue.length - 1;
    }
    if (bubbleSortQueueControl.isRun) return;
    bubbleSortQueueControl.isRun = true;
    bubbleSortQueueControl.runFunc && (await runBubbleSortQueue(bubbleSortQueueControl.runFunc));
  },
  prev: () => {
    if (bubbleSortQueueControl.index <= 0) {
      bubbleSortQueueControl.index = 0;
      Msg.message({
        message: '已经是第一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    bubbleSortQueueControl.pause();
    bubbleSortQueueControl.index -= 2;
    bubbleSortQueueControl.index = bubbleSortQueueControl.index < 0 ? 0 : bubbleSortQueueControl.index;
    bubbleSortQueueControl.runFunc &&
      (bubbleSortQueueControl.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[bubbleSortQueueControl.index][0],
        async () => {
          await taskQueue[bubbleSortQueueControl.index][2](taskQueue[bubbleSortQueueControl.index][1]);
          bubbleSortQueueControl.index++;
        }
      );
  },
  next: () => {
    if (bubbleSortQueueControl.index === taskQueue.length - 2) {
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    bubbleSortQueueControl.pause();
    bubbleSortQueueControl.runFunc &&
      (bubbleSortQueueControl.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[bubbleSortQueueControl.index][0],
        async () => {
          await taskQueue[bubbleSortQueueControl.index][2](taskQueue[bubbleSortQueueControl.index][1]);
          bubbleSortQueueControl.index++;
        }
      );
  },
  goto: (index: number) => {
    bubbleSortQueueControl.run();
    gotoTask = () => {
      gotoTask = null;
      return index;
    };
  },
  index: 0,
  isRun: false,
  length: taskQueue.length,
  runFunc: null,
};

export function getBubbleSortCodeTree() {
  return bubbleSortCode;
}

export async function createBubbleSortRaskQueue(_arr: number[]) {
  taskQueue = [];
  bubbleSortQueueControl.index = 0;
  bubbleSortQueueControl.isRun = false;
  bubbleSortQueueControl.length = taskQueue.length;
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
        deepClone(arr),
        async () => {
          await sleep(100);
        },
      ]);
      for (let i = 0; i < arr.length - 1 - j; i++) {
        taskQueue.push([
          2,
          deepClone(arr),
          async () => {
            await sleep(100);
          },
        ]);
        if (arr[i] > arr[i + 1]) {
          taskQueue.push([
            3,
            deepClone(arr),
            async () => {
              await sleep(100);
            },
          ]);
          let temp = arr[i];
          taskQueue.push([
            4,
            deepClone(arr),
            async () => {
              await sleep(100);
            },
          ]);
          arr[i] = arr[i + 1];
          taskQueue.push([
            5,
            deepClone(arr),
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

  bubbleSortQueueControl.length = taskQueue.length;
}
