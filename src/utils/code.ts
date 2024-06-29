import type { CodeController } from './code-controller';

import {
  createBubbleSortTaskQueue,
  getBubbleSortCodeTree,
  SortController,
  getQuickSortCodeTree,
  createQuickSortTaskQueue,
} from '../algorithm/sort.js';
import { createPrimTaskQueue, getPrimCodeTree, PrimController } from '../algorithm/minimum-spanning-tree';
import { createHuffmanTreeTaskQueue, HuffmanTreeController, getHuffmanTreeCodeTree } from '../algorithm/huffman-tree';
import { createGridCoverTaskQueue, GridCoverController, getGridCoverCodeTree } from '../algorithm/grid-cover';
import { getTSPcode, createTSP, TSPController } from '../algorithm/TSP';
import hljs from 'highlight.js';
import { throttle } from './throttle';
import { createDialog } from '../components/dialog/index.js';
import 'highlight.js/styles/atom-one-dark.css';
// @ts-ignore
import Msg from '../components/message/index.js';
// @ts-ignore
import Notify from '../components/notification/index.js';

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

let unbindControllerEvent: (() => void) | null = null;

let nowController: CodeController | null = null;

function controllerEvent(controller: CodeController) {
  const controllerSwitchHandler = () => {
    if (controller.isRun) {
      controller.pause();
    } else {
      controller.run();
    }
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

/** 是否正在切换算法 */
let isSwitch = false;

function isSwitchAlgorithm() {
  if (isSwitch) {
    Msg.message({
      message: '正在切换算法',
      type: 'warning',
      duration: 500,
    });
  }
  return isSwitch;
}

/**
 * 运行精确的算法
 * @param index 页面显示的按钮的索引
 * @param highlightCode 高亮的代码
 * @param createTaskQueue 创建任务队列的函数, 由算法运行部分提供
 * @param controller 动画控制器, 由算法运行部分提供
 * @returns
 */
export async function runExactAlgorithm(
  index: number,
  highlightCode: string,
  createTaskQueue: () => Promise<void>,
  controller: CodeController
) {
  if (isSwitchAlgorithm()) return;
  await new Promise(resolve => {
    isSwitch = true;
    back();
    resolve(void 0);
  });

  if (unbindControllerEvent) {
    unbindControllerEvent();
  }

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
      isSwitch = false;
      resolve(void 0);
    }, 1300);
  });
  preBlock.style.overflow = 'hidden';
  codeHighlightBar.style.opacity = '1';

  unbindControllerEvent = controllerEvent(controller);

  controller.stop = () => {
    preBlock.style.overflow = 'auto';
    codeHighlightBar.style.opacity = '0';
    codeBlock.style.top = '20px';
    setActiveMenuItem(index, true);
    controllerSwitch.innerHTML = '播放';
    controller.isRun = false;
  };

  controller.runFunc = async (_index, callback) => {
    preBlock.style.overflow = 'hidden';
    codeHighlightBar.style.opacity = '1';
    preBlock.scrollTop = 0;
    controllerProgressBar.style.setProperty(
      '--controller-progress-bar-width',
      `${((controller.index + 1) / controller.length) * 100}%`
    );
    setActiveMenuItem(index);
    const codeContainerHeight = parseFloat(getComputedStyle(codeContainer).height);
    codeBlock.style.top = `${-_index * 22 + codeContainerHeight / 2 - 10}px`;
    await callback();
    controllerSwitch.innerHTML = controller.isRun ? '暂停' : '播放';
    if (controller.index === controller.length - 1) {
      controllerProgressBar.style.setProperty('--controller-progress-bar-width', '0%');
      controller.index = 0;
      controller.stop();
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
export async function runMetaHeuristicAlgorithm(
  index: number,
  highlightCode: string,
  createTask: () => Promise<void>,
  controller: CodeController
) {
  if (isSwitchAlgorithm()) return;
  await new Promise(resolve => {
    isSwitch = true;
    back();
    resolve(void 0);
  });

  if (unbindControllerEvent) {
    unbindControllerEvent();
  }
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
      isSwitch = false;
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
    controllerSwitch.innerHTML = controller.isRun ? '暂停' : '播放';
  };

  controller.stop = () => {
    preBlock.style.overflow = 'auto';
    codeHighlightBar.style.opacity = '0';
    codeBlock.style.top = '20px';
    setActiveMenuItem(index, true);
    controllerSwitch.innerHTML = '播放';
    controller.isRun = false;
  };

  await controller.run();
}

const highlightQuickSort = highlight(getQuickSortCodeTree().join('\n'), {
  language: 'javascript',
}).value;

/**
 *  快速排序
 */
export async function runQuickSort() {
  if (isSwitchAlgorithm()) return;

  const dialog = createDialog(
    [
      {
        type: 'text',
        value: '6, 5, 4, 3, 2, 1',
        label: '数组值',
        placeholder: '例6, 5, 4, 3, 2, 1',
        min: 5,
        max: 15,
        pattern: '^\\d+(,\\s*\\d+)*$',
        check: (value: string | number) => {
          if (typeof value !== 'string') return false;
          const arr = value.split(',').map(Number);
          if (arr.length < 5) return '数组长度不能小于5';
          if (arr.length > 15) return '数组长度不能大于15';
          if (!arr.every(v => v >= 1)) return '数组任意值不能小于1';
          return true;
        },
      },
    ],
    props => {
      const arr = props[0].split(',').map(Number);
      return arr;
    },
    () => {
      const len = Math.floor(Math.random() * 10) + 5;
      const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1);
      Notify.notification({
        title: '已生成随机参数',
        message: `[${arr.join(', ')}]`,
        duration: 3000,
        type: 'info',
      });
      return arr;
    },
    () => {}
  );

  const arr = (await dialog) as number[];

  // const len = Math.floor(Math.random() * 10) + 5;
  // const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1);
  const controller = new SortController();

  await runExactAlgorithm(
    5,
    highlightQuickSort,
    createQuickSortTaskQueue.bind(null, arr, controller),
    controller as unknown as CodeController
  );
}

const highlightBubbleSort = highlight(getBubbleSortCodeTree().join('\n'), {
  language: 'javascript',
}).value;

/**
 *  冒泡排序
 */
export async function runBubbleSort() {
  if (isSwitchAlgorithm()) return;
  const dialog = createDialog(
    [
      {
        type: 'text',
        value: '6, 5, 4, 3, 2, 1',
        label: '数组值',
        placeholder: '例6, 5, 4, 3, 2, 1',
        min: 5,
        max: 15,
        pattern: '^\\d+(,\\s*\\d+)*$',
        check: (value: string | number) => {
          if (typeof value !== 'string') return false;
          const arr = value.split(',').map(Number);
          if (arr.length < 5) return '数组长度不能小于5';
          if (arr.length > 15) return '数组长度不能大于15';
          if (!arr.every(v => v >= 1)) return '数组任意值不能小于1';
          return true;
        },
      },
    ],
    props => {
      const arr = props[0].split(',').map(Number);
      return arr;
    },
    () => {
      const len = Math.floor(Math.random() * 10) + 5;
      const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1);
      Notify.notification({
        title: '已生成随机参数',
        message: `[${arr.join(', ')}]`,
        duration: 3000,
        type: 'info',
      });
      return arr;
    },
    () => {}
  );

  const arr = (await dialog) as number[];
  const controller = new SortController();

  await runExactAlgorithm(
    6,
    highlightBubbleSort,
    createBubbleSortTaskQueue.bind(null, arr, controller),
    controller as unknown as CodeController
  );
}

type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]

const highlightPrim = highlight(getPrimCodeTree().join('\n'), {
  language: 'typescript',
}).value;

/**
 * 最小生成树
 */
export async function runMinimumSpanningTree() {
  if (isSwitchAlgorithm()) return;
  const dialog = createDialog(
    [
      {
        type: 'number',
        value: 6,
        label: '顶点数量',
        placeholder: '顶点数量',
        min: 4,
        max: 6,
        check: (value: string | number) => {
          const _val = Number(value);
          if (typeof _val !== 'number') return '请输入数字';
          if (_val < 4) return '顶点数量不能小于4';
          if (_val > 6) return '顶点数量不能大于6';
          return true;
        },
      },
      {
        type: 'text',
        value: '',
        label: '边值',
        placeholder: '例2, 5, 4, 7, 3, 4, 2...',
        pattern: '^\\d+(,\\s*\\d+)*$',
        check: (value: string | number, ...args) => {
          if (typeof value !== 'string') return false;
          const verticesNum = args[0] as number;
          const arr = value.split(',').map(Number);
          console.log(verticesNum, (verticesNum ** 2 - verticesNum) / 2);
          if (arr.length !== (verticesNum ** 2 - verticesNum) / 2)
            return `边的数量不正确, 应该为 ${
              isNaN((verticesNum ** 2 - verticesNum) / 2) ? 0 : (verticesNum ** 2 - verticesNum) / 2
            } 条边`;
          if (!arr.every(v => v >= 1)) return '边的权值不能小于1';
          return true;
        },
      },
    ],
    props => {
      const verticesNum = Number(props[0]);
      const vertices = Array.from({ length: verticesNum }, (_, i) => String.fromCharCode(i + 65));
      const edges: Edge[] = [];
      const valArr = props[1].split(',').map(Number);
      let valIndex = 0;
      // 生成全连接的图
      Array.from({ length: verticesNum ** 2 }, (_, i) => {
        const from = Math.floor(i / verticesNum);
        const to = i % verticesNum;
        if (from >= to) return null;
        console.log(i);
        edges.push([from, to, valArr[valIndex++]]);
      });
      Notify.notification({
        title: '已生成随机参数',
        message: `顶点: [${vertices.join(', ')}], 边: [${edges
          .map(edge => `[${vertices[edge[0]]}-${edge[2]}-${vertices[edge[1]]}]`)
          .join(', ')}]`,
        duration: 3000,
        type: 'info',
      });
      return [edges, vertices];
    },
    () => {
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
      Notify.notification({
        title: '已生成随机参数',
        message: `顶点: [${vertices.join(', ')}], 边: [${edges
          .map(edge => `[${vertices[edge[0]]}-${edge[2]}-${vertices[edge[1]]}]`)
          .join(', ')}]`,
        duration: 3000,
        type: 'info',
      });
      return [edges, vertices];
    },
    () => {}
  );

  const [edges, vertices] = (await dialog) as [Edge[], string[]];
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

/**
 * 哈夫曼树构造问题
 */
export async function runHuffmanTree() {
  if (isSwitchAlgorithm()) return;
  const dialog = createDialog(
    [
      {
        type: 'text',
        value: 'AAABBBCCCDDDEEEFFFGGGHHH',
        label: '字符串\n(A-H, 长度22-31)',
        placeholder: '字符串',
        pattern: '^[A-H]+$',
        check: (value: string | number) => {
          if (typeof value !== 'string') return false;
          if (value.length < 22) return '字符串长度不能小于22';
          if (value.length > 31) return '字符串长度不能大于31';
          if (!/^[A-H]+$/.test(value)) return '字符串只能包含A-H';
          return true;
        },
      },
    ],
    props => {
      return props[0];
    },
    () => {
      const len = Math.floor(Math.random() * 10) + 22;
      // 只生成A-H的字符串
      const str = Array.from({ length: len }, () => String.fromCharCode(Math.floor(Math.random() * 8) + 65)).join('');
      Notify.notification({
        title: '已生成随机参数',
        message: str,
        duration: 3000,
        type: 'info',
      });
      return str;
    },
    () => {}
  );
  const str = (await dialog) as string;
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

/**
 * 旅行商(TSP)问题
 */
export async function runTSP() {
  if (isSwitchAlgorithm()) return;
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
  Msg.message({
    message: '参数较多, 暂不提供输入指定参数',
    type: 'info',
    duration: 1500,
  });
  Notify.notification({
    title: '已生成随机参数',
    message: `[${cities.map(city => `${city.name}(${city.x}, ${city.y})`).join(', ')}]`,
    duration: 3000,
    type: 'info',
  });
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

/**
 * 棋盘覆盖问题
 */
export async function runGridCover() {
  if (isSwitchAlgorithm()) return;
  const dialog = createDialog(
    [
      {
        type: 'number',
        value: 3,
        label: 'k值',
        placeholder: 'k值',
        min: 2,
        max: 5,
      },
      {
        type: 'number',
        value: 1,
        label: '特殊点y',
        placeholder: '特殊点y',
        check: (value: string | number, ...args) => {
          const k = args[0];
          const _val = Number(value);
          if (typeof _val !== 'number') return '请输入数字';
          if (_val < 1) return '特殊点y不能小于1';
          if (_val > 2 ** k) return `特殊点y不能大于2^${k}`;
          return true;
        },
      },
      {
        type: 'number',
        value: 1,
        label: '特殊点x',
        placeholder: '特殊点x',
        check: (value: string | number, ...args) => {
          const k = args[0];
          const _val = Number(value);
          if (typeof _val !== 'number') return '请输入数字';
          if (_val < 1) return '特殊点x不能小于1';
          if (_val > 2 ** k) return `特殊点x不能大于2^${k}`;
          return true;
        },
      },
    ],
    props => {
      return props.map(Number);
    },
    () => {
      const k = Math.floor(Math.random() * 4) + 2;
      const row = Math.floor(Math.random() * 2 ** k) + 1;
      const col = Math.floor(Math.random() * 2 ** k) + 1;

      Notify.notification({
        title: '已生成随机参数',
        message: `k: ${k}, 特殊点: [${col}, ${row}]`,
        duration: 3000,
        type: 'info',
      });
      return [k, row, col];
    },
    () => {}
  );
  const [k, row, col] = (await dialog) as [number, number, number];
  const controller = new GridCoverController();
  await runExactAlgorithm(
    7,
    highlightGridCover,
    createGridCoverTaskQueue.bind(null, [k, row, col], controller),
    controller as unknown as CodeController
  );
}
