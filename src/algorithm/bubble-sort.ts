/** 冒泡排序 */
import { createSort } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';

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

export async function runBubbleSortQueue(callback: (index: number, callback: () => Promise<void>) => Promise<void>) {
  for (let i = bubbleSortQueueControl.index; i < taskQueue.length; i++) {
    if (!bubbleSortQueueControl.isRun) return;
    await callback(taskQueue[i][0], async () => {
      bubbleSortQueueControl.index = i;
      await taskQueue[i][2](taskQueue[i][1]);
    });
  }
}

export const bubbleSortQueueControl = {
  pause: () => {
    bubbleSortQueueControl.isRun = false;
  },
  run: async () => {
    if (bubbleSortQueueControl.isRun) return;
    bubbleSortQueueControl.isRun = true;
    bubbleSortQueueControl.runFunc && (await runBubbleSortQueue(bubbleSortQueueControl.runFunc));
  },
  goto: (index: number) => {
    bubbleSortQueueControl.index = index;
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
  const sort = createSort(arr);
  await sleep(500);

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
