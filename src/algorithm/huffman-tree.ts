/** 哈夫曼树编码 */
// @ts-ignore
import { runHuffmanTreeCode } from './huffman-tree-code.js';
// @ts-ignore
import Msg from '../components/message/index.js';
import { type BinaryTree, createBinaryTree } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';

const huffmanTreeCode = `class HuffmanNode {
  constructor(value, char, left, right) {
    this.val = value;
    this.char = char;
    this.left = left;
    this.right = right;
  }
}

class HuffmanTree {
  constructor(str) {
    let hash = {};
    for (let i = 0; i < str.length; i++) {
      hash[str[i]] = ~~hash[str[i]] + 1; /* 统计字符出现频率 */
    }
    this.hash = hash;
    this.huffmanTree = this.getHuffmanTree(); /* 构造哈夫曼树 */
    let map = this.getHuffmanCode(this.huffmanTree); /* 遍历哈夫曼树，得到编码表 */
    this.binaryStr = this.getBinaryStr(map, str); /* 根据编码对照表，返回最终的二进制编码 */
  }

  getHuffmanTree() {
    let forest = [];
    for (let char in this.hash) {
      let node = new HuffmanNode(this.hash[char], char);
      forest.push(node); /* 构造森林 */
    }
    let allNodes = [];
    while (forest.length !== 1) {
      forest.sort((a, b) => {
        return a.val - b.val;
      });
      let node = new HuffmanNode(forest[0].val + forest[1].val, '');
      allNodes.push(forest[0]);
      allNodes.push(forest[1]);
      node.left = allNodes[allNodes.length - 2];
      node.right = allNodes[allNodes.length - 1];
      forest = forest.slice(2);
      forest.push(node);
    }
    return forest[0];
  }

  getHuffmanCode(tree) {
    let hash = {};
    let traversal = (node, curPath) => {
      if (!node.length && !node.right) return;
      if (node.left && !node.left.left && !node.left.right) {
        hash[node.left.char] = curPath + '0'; /* 左子树编码为0 */
      }
      if (node.right && !node.right.left && !node.right.right) {
        hash[node.right.char] = curPath + '1'; /* 右子树编码为1 */
      }
      if (node.left) {
        traversal(node.left, curPath + '0'); /* 递归遍历左子树 */
      }
      if (node.right) {
        traversal(node.right, curPath + '1'); /* 递归遍历右子树 */
      }
    };
    traversal(tree, '');
    return hash;
  }

  getBinaryStr(map, originStr) {
    let result = '';
    for (let i = 0; i < originStr.length; i++) {
      result += map[originStr[i]];
    }
    return result;
  }
}
`;

let taskQueue: [number, BinaryTree | BinaryTree[], (tree: BinaryTree | BinaryTree[]) => Promise<void>][] = [];

function addTask(
  index: number,
  tree: BinaryTree | BinaryTree[],
  callback: (tree: BinaryTree | BinaryTree[]) => Promise<void>
) {
  taskQueue.push([index, deepClone(tree), callback]);
}

export async function runHuffmanTreeQueue(callback: (index: number, callback: () => Promise<void>) => Promise<void>) {
  for (let i = huffmanTreeController.index; i < taskQueue.length; i++) {
    if (!huffmanTreeController.isRun) return;
    await callback(taskQueue[i][0], async () => {
      huffmanTreeController.index = i;
      await taskQueue[i][2](taskQueue[i][1]);
      if (gotoTask) {
        i = gotoTask();
      }
    });
  }
}

let gotoTask: (() => number) | null = null;

export const huffmanTreeController = {
  pause: () => {
    huffmanTreeController.isRun = false;
  },
  run: async () => {
    console.log(huffmanTreeController.index, taskQueue.length);
    if (huffmanTreeController.index < 0) {
      huffmanTreeController.index = 0;
    } else if (huffmanTreeController.index >= taskQueue.length) {
      huffmanTreeController.index = taskQueue.length - 1;
    }
    if (huffmanTreeController.isRun) return;
    huffmanTreeController.isRun = true;
    huffmanTreeController.runFunc && (await runHuffmanTreeQueue(huffmanTreeController.runFunc));
  },
  prev: () => {
    if (huffmanTreeController.index <= 0) {
      huffmanTreeController.index = 0;
      Msg.message({
        message: '已经是第一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    huffmanTreeController.pause();
    huffmanTreeController.index -= 2;
    huffmanTreeController.index = huffmanTreeController.index < 0 ? 0 : huffmanTreeController.index;
    huffmanTreeController.runFunc &&
      (huffmanTreeController.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[huffmanTreeController.index][0],
        async () => {
          await taskQueue[huffmanTreeController.index][2](taskQueue[huffmanTreeController.index][1]);
          huffmanTreeController.index++;
        }
      );
  },
  next: () => {
    if (huffmanTreeController.index === taskQueue.length - 2) {
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    huffmanTreeController.pause();
    huffmanTreeController.runFunc &&
      (huffmanTreeController.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[huffmanTreeController.index][0],
        async () => {
          await taskQueue[huffmanTreeController.index][2](taskQueue[huffmanTreeController.index][1]);
          huffmanTreeController.index++;
        }
      );
  },
  goto: (index: number) => {
    huffmanTreeController.run();
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

export function getHuffmanTreeCodeTree() {
  return huffmanTreeCode;
}

export async function createHuffmanTreeRaskQueue(str: string) {
  taskQueue = [];
  huffmanTreeController.index = 0;
  huffmanTreeController.isRun = false;
  huffmanTreeController.length = taskQueue.length;

  const binaryTree = createBinaryTree({
    val: 0,
    char: '',
    left: null,
    right: null,
  });
  await sleep(500);

  runHuffmanTreeCode(str, addTask, binaryTree);

  huffmanTreeController.length = taskQueue.length;
}
