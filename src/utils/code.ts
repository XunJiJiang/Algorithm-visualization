import {
  createBubbleSortRaskQueue,
  getBubbleSortCodeTree,
  runBubbleSortQueue,
  bubbleSortQueueControl,
} from '../algorithm/bubble-sort';
import { createPrimRaskQueue, getPrimCodeTree, primController } from '../algorithm/minimum-spanning-tree';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const codeContainer = document.querySelector('#code-container') as HTMLElement;
const preBlock = document.querySelector('#pre-block') as HTMLElement;
const codeBlock = document.querySelector('#code-block') as HTMLElement;
const codeHighlightBar = document.querySelector('#code-highlight-bar') as HTMLElement;
const canvasContainer = document.querySelector('#canvas-container') as HTMLElement;
const codeMenuItem = document.getElementsByClassName('code-menu-item') as unknown as HTMLDivElement[];

type Controller = {
  run: () => Promise<void>;
  pause: () => void;
  goto: (index: number) => void;
  index: number;
  isRun: boolean;
  length: number;
  runFunc: ((index: number, callback: () => Promise<void>) => Promise<void>) | null;
};

function setActiveMenuItem(index: number, close = false) {
  for (let i = 0; i < codeMenuItem.length; i++) {
    codeMenuItem[i].setAttribute('status', 'false');
  }
  if (!close) {
    codeMenuItem[index].setAttribute('status', 'active');
  }
}

const { highlight } = hljs;

const highlightBubbleSort = highlight(getBubbleSortCodeTree().join('\n'), {
  language: 'javascript',
}).value;

let isSomeRun = false;

let unbindControllerEvent: (() => void) | null = null;

const controllerNode = document.querySelector('#controller') as HTMLElement;
const controllerSwitch = document.querySelector('#controller-switch') as HTMLElement;

function controllerEvent(controller: Controller) {
  const controllerSwitchHandler = () => {
    if (controller.isRun) {
      controller.pause();
    } else {
      controller.run();
    }
    isSomeRun = controller.isRun;
  };

  controllerSwitch.addEventListener('click', controllerSwitchHandler);

  return () => {
    controllerSwitch.removeEventListener('click', controllerSwitchHandler);
  };
}

async function run(index: number, highlightCode: string, createRaskQueue: () => Promise<void>, controller: Controller) {
  if (isSomeRun) return;
  if (unbindControllerEvent) {
    unbindControllerEvent();
  }
  isSomeRun = true;
  setActiveMenuItem(index);
  const codeContainerWidth = parseFloat(getComputedStyle(codeContainer).width);
  await new Promise(resolve => {
    codeContainer.style.setProperty('--beforeHeight', '100%');
    canvasContainer.style.setProperty('--beforeTop', '0');
    setTimeout(async () => {
      codeBlock.innerHTML = highlightCode;
      codeBlock.style.top = `${parseFloat(getComputedStyle(codeContainer).height) / 2 - 15}px`;
      createRaskQueue();
    }, 300);
    setTimeout(() => {
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
    setActiveMenuItem(index);
    const codeContainerHeight = parseFloat(getComputedStyle(codeContainer).height);
    codeBlock.style.top = `${-_index * 29.1 + codeContainerHeight / 2 - 16}px`;
    await callback();
    if (controller.index === controller.length - 1) {
      console.log('end');
      preBlock.style.overflow = 'auto';
      codeHighlightBar.style.opacity = '0';
      codeBlock.style.top = '20px';
      setActiveMenuItem(index, true);
      isSomeRun = false;
      controller.index = 0;
      controller.isRun = false;
    }
  };

  await controller.run();
}

export async function runBubbleSort() {
  const len = Math.floor(Math.random() * 10) + 5;
  const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1);
  await run(
    6,
    highlightBubbleSort,
    createBubbleSortRaskQueue.bind(null, arr),
    bubbleSortQueueControl as unknown as Controller
  );
}

type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]

const highlightPrim = highlight(getPrimCodeTree().join('\n'), {
  language: 'javascript',
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
    edges.push([from, to, Math.floor(Math.random() * 10)]);
  });
  // 在确保连通的情况下，随机删除一些边
  const deleteNum = Math.floor(Math.random() * 3);
  Array.from({ length: deleteNum }, () => {
    const index = Math.floor(Math.random() * edges.length);
    edges.splice(index, 1);
  });

  await run(
    1,
    highlightPrim,
    createPrimRaskQueue.bind(null, edges, vertices, vertices[0]),
    primController as unknown as Controller
  );
}
