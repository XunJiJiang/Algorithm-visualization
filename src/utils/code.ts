import type { CodeController } from './code-controller';

import { createBubbleSortTaskQueue, getBubbleSortCodeTree, BubbleSortController } from '../algorithm/bubble-sort';
import { createPrimTaskQueue, getPrimCodeTree, PrimController } from '../algorithm/minimum-spanning-tree';
import { createHuffmanTreeTaskQueue, HuffmanTreeController, getHuffmanTreeCodeTree } from '../algorithm/huffman-tree';
import { createGridCoverTaskQueue, GridCoverController, getGridCoverCodeTree } from '../algorithm/grid-cover';
import { getTSPcode, createTSP, TSPController } from '../algorithm/TSP';
import hljs from 'highlight.js';
import { throttle } from './throttle';
import 'highlight.js/styles/atom-one-dark.css';
// @ts-ignore
import Msg from '../components/message/index.js';

const codeContainer = document.querySelector('#code-container') as HTMLElement;
const preBlock = document.querySelector('#pre-block') as HTMLElement;
const codeBlock = document.querySelector('#code-block') as HTMLElement;
const codeHighlightBar = document.querySelector('#code-highlight-bar') as HTMLElement;
const canvasContainer = document.querySelector('#canvas-container') as HTMLElement;
const codeMenuItem = document.getElementsByClassName('code-menu-item') as unknown as HTMLDivElement[];

const controllerNode = document.querySelector('#controller') as HTMLElement;
const controllerPrev = document.querySelector('#controller-prev') as HTMLElement;
const controllerNext = document.querySelector('#controller-next') as HTMLElement;
const controllerSwitch = document.querySelector('#controller-switch') as HTMLElement;
const controllerProgressBar = document.querySelector('#controller-progress-bar') as HTMLElement;

export function back() {
  codeContainer.style.setProperty('--beforeHeight', '100%');
  canvasContainer.style.setProperty('--beforeTop', '0');
  if (unbindControllerEvent) {
    unbindControllerEvent();
  }
  if (nowController) {
    nowController.pause();
    isSomeRun = false;
    controllerSwitch.innerHTML = '播放';
  }
  setActiveMenuItem(0, true);
  unbindControllerEvent = null;
  nowController = null;
}

controllerNode.addEventListener('click', () => {
  if (nowController) return;
  Msg.message({
    message: '请先选择一个算法',
    type: 'warning',
    duration: 500,
  });
});

function setActiveMenuItem(index: number, close = false) {
  for (let i = 0; i < codeMenuItem.length; i++) {
    codeMenuItem[i].setAttribute('status', 'false');
  }
  if (!close) {
    codeMenuItem[index].setAttribute('status', 'active');
  }
}

const { highlight } = hljs;

let isSomeRun = false;

let unbindControllerEvent: (() => void) | null = null;

let nowController: CodeController | null = null;

function controllerEvent(controller: CodeController) {
  const controllerSwitchHandler = () => {
    if (controller.isRun) {
      controller.pause();
    } else {
      controller.run();
    }
    isSomeRun = controller.isRun;
    controllerSwitch.innerHTML = controller.isRun ? '暂停' : '播放';
  };

  const controllerProgressBarHandler = (e: MouseEvent) => {
    // 记录点击位置距离进度条左边的距离
    const x = e.clientX;
    const rect = controllerProgressBar.getBoundingClientRect();
    const width = rect.width;
    const left = rect.left;
    const percent = (x - left) / width;
    controller.goto(Math.floor(percent * controller.length));
  };

  controllerPrev.addEventListener('click', controller.prev);
  controllerNext.addEventListener('click', controller.next);
  controllerSwitch.addEventListener('click', controllerSwitchHandler);
  controllerProgressBar.addEventListener('click', controllerProgressBarHandler);

  return () => {
    controllerPrev.removeEventListener('click', controller.prev);
    controllerNext.removeEventListener('click', controller.next);
    controllerSwitch.removeEventListener('click', controllerSwitchHandler);
    controllerProgressBar.removeEventListener('click', controllerProgressBarHandler);
  };
}

window.addEventListener(
  'resize',
  throttle(() => {
    const codeContainerWidth = parseFloat(getComputedStyle(codeContainer).width);
    codeBlock.style.position = 'absolute';
    const codeBlockWidth = parseFloat(getComputedStyle(codeBlock).width);
    codeBlock.style.paddingLeft = `${codeContainerWidth / 2 - codeBlockWidth / 2}px`;
    codeBlock.style.position = 'relative';
  }, 500)
);

/**
 * 运行精确的算法
 * @param index 页面显示的按钮的索引
 * @param highlightCode 高亮的代码
 * @param createTaskQueue 创建任务队列的函数, 由算法运行部分提供
 * @param controller 动画控制器, 由算法运行部分提供
 * @returns
 */
async function runExactAlgorithm(
  index: number,
  highlightCode: string,
  createTaskQueue: () => Promise<void>,
  controller: CodeController
) {
  if (isSomeRun) {
    Msg.message({
      message: '算法正在播放, 请先暂停',
      type: 'warning',
      duration: 500,
    });
    return;
  }
  if (unbindControllerEvent) {
    unbindControllerEvent();
  }
  isSomeRun = true;
  controllerSwitch.innerHTML = '暂停';
  nowController = controller;
  setActiveMenuItem(index);
  const codeContainerWidth = parseFloat(getComputedStyle(codeContainer).width);
  await new Promise(resolve => {
    codeContainer.style.setProperty('--beforeHeight', '100%');
    canvasContainer.style.setProperty('--beforeTop', '0');
    setTimeout(async () => {
      codeBlock.innerHTML = highlightCode;
      codeBlock.style.top = `${parseFloat(getComputedStyle(codeContainer).height) / 2 - 10}px`;
      createTaskQueue();
    }, 300);
    setTimeout(() => {
      controllerProgressBar.style.setProperty('--controller-progress-bar-width', '0%');
      codeBlock.style.position = 'absolute';
      const codeBlockWidth = parseFloat(getComputedStyle(codeBlock).width);
      codeBlock.style.paddingLeft = `${codeContainerWidth / 2 - codeBlockWidth / 2}px`;
      codeBlock.style.position = 'relative';
      codeContainer.style.setProperty('--beforeHeight', '0%');
      canvasContainer.style.setProperty('--beforeTop', '100%');
    }, 700);
    setTimeout(() => {
      resolve(void 0);
    }, 1300);
  });
  preBlock.style.overflow = 'hidden';
  codeHighlightBar.style.opacity = '1';

  unbindControllerEvent = controllerEvent(controller);

  controller.runFunc = async (_index, callback) => {
    preBlock.style.overflow = 'hidden';
    codeHighlightBar.style.opacity = '1';
    controllerProgressBar.style.setProperty(
      '--controller-progress-bar-width',
      `${((controller.index + 1) / controller.length) * 100}%`
    );
    setActiveMenuItem(index);
    const codeContainerHeight = parseFloat(getComputedStyle(codeContainer).height);
    codeBlock.style.top = `${-_index * 22 + codeContainerHeight / 2 - 10}px`;
    await callback();
    isSomeRun = controller.isRun;
    controllerSwitch.innerHTML = controller.isRun ? '暂停' : '播放';
    if (controller.index === controller.length - 1) {
      controllerProgressBar.style.setProperty('--controller-progress-bar-width', '0%');
      preBlock.style.overflow = 'auto';
      codeHighlightBar.style.opacity = '0';
      codeBlock.style.top = '20px';
      setActiveMenuItem(index, true);
      isSomeRun = false;
      controllerSwitch.innerHTML = '播放';
      controller.index = 0;
      controller.isRun = false;
    }
  };

  await controller.run();
}

/**
 * 运行启发式算法
 * @param index 页面显示的按钮的索引
 * @param highlightCode 高亮的代码
 * @param createTaskQueue 创建任务队列的函数, 由算法运行部分提供
 * @param controller 动画控制器, 由算法运行部分提供. 由于启发式算法的特殊性，不需要实现prev, next和 goto方法
 * @returns
 */
async function runMetaHeuristicAlgorithm(
  index: number,
  highlightCode: string,
  createTask: () => Promise<void>,
  controller: CodeController
) {
  if (isSomeRun) {
    Msg.message({
      message: '算法正在播放, 请先暂停',
      type: 'warning',
      duration: 500,
    });
    return;
  }
  if (unbindControllerEvent) {
    unbindControllerEvent();
  }
  isSomeRun = true;
  controllerSwitch.innerHTML = '暂停';
  nowController = controller;
  setActiveMenuItem(index);
  const codeContainerWidth = parseFloat(getComputedStyle(codeContainer).width);
  await new Promise(resolve => {
    codeContainer.style.setProperty('--beforeHeight', '100%');
    canvasContainer.style.setProperty('--beforeTop', '0');
    setTimeout(async () => {
      codeBlock.innerHTML = highlightCode;
      codeBlock.style.top = `${parseFloat(getComputedStyle(codeContainer).height) / 2 - 10}px`;
      createTask();
    }, 300);
    setTimeout(() => {
      controllerProgressBar.style.setProperty('--controller-progress-bar-width', '0%');
      codeBlock.style.position = 'absolute';
      const codeBlockWidth = parseFloat(getComputedStyle(codeBlock).width);
      codeBlock.style.paddingLeft = `${codeContainerWidth / 2 - codeBlockWidth / 2}px`;
      codeBlock.style.position = 'relative';
      codeContainer.style.setProperty('--beforeHeight', '0%');
      canvasContainer.style.setProperty('--beforeTop', '100%');
    }, 700);
    setTimeout(() => {
      resolve(void 0);
    }, 1300);
  });
  preBlock.style.overflow = 'hidden';
  codeHighlightBar.style.opacity = '1';

  unbindControllerEvent = controllerEvent(controller);

  controller.runFunc = async (_index, callback) => {
    preBlock.style.overflow = 'hidden';
    preBlock.scrollTop = 0;
    codeHighlightBar.style.opacity = '1';
    setActiveMenuItem(index);
    const codeContainerHeight = parseFloat(getComputedStyle(codeContainer).height);
    codeBlock.style.top = `${-_index * 22 + codeContainerHeight / 2 - 10}px`;
    await callback();
    isSomeRun = controller.isRun;
    controllerSwitch.innerHTML = controller.isRun ? '暂停' : '播放';
  };

  controller.stop = () => {
    preBlock.style.overflow = 'auto';
    codeHighlightBar.style.opacity = '0';
    codeBlock.style.top = '20px';
    setActiveMenuItem(index, true);
    isSomeRun = false;
    controllerSwitch.innerHTML = '播放';
    controller.isRun = false;
  };

  await controller.run();
}

const highlightBubbleSort = highlight(getBubbleSortCodeTree().join('\n'), {
  language: 'javascript',
}).value;

export async function runBubbleSort() {
  const len = Math.floor(Math.random() * 10) + 5;
  const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1);
  const controller = new BubbleSortController();
  await runExactAlgorithm(
    0,
    highlightBubbleSort,
    createBubbleSortTaskQueue.bind(null, arr, controller),
    controller as unknown as CodeController
  );
}

type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]

const highlightPrim = highlight(getPrimCodeTree().join('\n'), {
  language: 'typescript',
}).value;

export async function runMinimumSpanningTree() {
  const verticesNum = Math.floor(Math.random() * 3) + 4;
  // 通过asc2 码转换为字母，A-Z
  const vertices = Array.from({ length: verticesNum }, (_, i) => String.fromCharCode(i + 65));
  const edges: Edge[] = [];
  // 生成全连接的图
  Array.from({ length: verticesNum ** 2 }, (_, i) => {
    const from = Math.floor(i / verticesNum);
    const to = i % verticesNum;
    if (from >= to) return null;
    edges.push([from, to, Math.floor(Math.random() * 8) + 1]);
  });
  // 在确保连通的情况下，随机删除一些边
  // const deleteNum = Math.floor(Math.random() * 3);
  // Array.from({ length: deleteNum }, () => {
  //   const index = Math.floor(Math.random() * edges.length);
  //   edges.splice(index, 1);
  // });
  const controller = new PrimController();
  await runExactAlgorithm(
    1,
    highlightPrim,
    createPrimTaskQueue.bind(null, edges, vertices, vertices[0], controller),
    controller as unknown as CodeController
  );
}

const highlightHuffmanTree = highlight(getHuffmanTreeCodeTree().join('\n'), {
  language: 'javascript',
}).value;

export async function runHuffmanTree() {
  const len = Math.floor(Math.random() * 10) + 22;
  // 只生成A-H的字符串
  const str = Array.from({ length: len }, () => String.fromCharCode(Math.floor(Math.random() * 8) + 65)).join('');

  const controller = new HuffmanTreeController();
  await runExactAlgorithm(
    2,
    highlightHuffmanTree,
    createHuffmanTreeTaskQueue.bind(null, str, controller),
    controller as unknown as CodeController
  );
}

const highlightTSP = highlight(getTSPcode().join('\n'), {
  language: 'javascript',
}).value;

export async function runTSP() {
  // 城市数量
  const len = Math.floor(Math.random() * 15) + 25;
  // 城市编码 城市01-20
  const cities: {
    name: string;
    x: number;
    y: number;
  }[] = Array.from({ length: len }, (_, i) => ({
    name: `${i === 0 ? '起始点' : ''}城市${i + 1}`,
    x: Math.floor(Math.random() * 600),
    y: Math.floor(Math.random() * 200),
  }));

  const controller = new TSPController();

  await runMetaHeuristicAlgorithm(
    3,
    highlightTSP,
    createTSP.bind(null, cities, controller),
    controller as unknown as CodeController
  );
}

const highlightGridCover = highlight(getGridCoverCodeTree().join('\n'), {
  language: 'javascript',
}).value;

export function runGridCover() {
  const k = Math.floor(Math.random() * 4) + 2;
  const row = Math.floor(Math.random() * 2 ** k) + 1;
  const col = Math.floor(Math.random() * 2 ** k) + 1;
  const controller = new GridCoverController();
  runExactAlgorithm(
    4,
    highlightGridCover,
    createGridCoverTaskQueue.bind(null, [k, row, col], controller),
    controller as unknown as CodeController
  );
}
