// @ts-check
import { sleep } from '../utils/sleep.ts';
/**
 * @typedef {{
 *   val: number;
 *   char: string;
 *   left: BinaryTree | null;
 *   right: BinaryTree | null;
 * }} BinaryTree
 */
// 用于在不需要设置新树的节点的时候，传递一个代替对象
const EMPTY_NODE = {
  val: 0,
  char: '__EMPTY_NODE__',
  left: null,
  right: null,
};
/**
 * @param {string} str
 * @param {(index: number, tree: BinaryTree | BinaryTree[], callback: (tree: BinaryTree | BinaryTree[]) => Promise<void>) => void} addTask
 * @param {{
 *  setTree: (tree: BinaryTree | BinaryTree[]) => void;
 * }} binaryTree
 * @returns {string}
 */
export function runHuffmanTreeCode(str, addTask, binaryTree) {
  /**
   * @type {BinaryTree}
   */
  class HuffmanNode {
    /**
     * @param {number} value
     * @param {string} char
     * @param {BinaryTree | null} left
     * @param {BinaryTree | null} right
     */
    constructor(value, char, left, right) {
      this.val = value; // 字符出现次数
      this.char = char; // 待编码字符
      this.left = left;
      this.right = right;
    }
  }

  class HuffmanTree {
    /**
     * @param {string} str
     */
    constructor(str) {
      // 第一步，统计字符出现频率
      let hash = {};
      for (let i = 0; i < str.length; i++) {
        hash[str[i]] = ~~hash[str[i]] + 1;
      }
      addTask(13, EMPTY_NODE, async () => {
        await sleep(1000);
      });
      this.hash = hash;

      // 第二步，构造哈夫曼树
      this.huffmanTree = this.getHuffmanTree();
      addTask(16, EMPTY_NODE, async () => {
        await sleep(100);
      });

      // 第三步，遍历哈夫曼树，得到编码表
      let map = this.getHuffmanCode(this.huffmanTree);
      addTask(17, EMPTY_NODE, async () => {
        await sleep(100);
      });
      // 查看编码表，即每个字符的二进制编码是什么

      // 第四部，根据编码对照表，返回最终的二进制编码
      this.binaryStr = this.getBinaryStr(map, str);
      addTask(18, EMPTY_NODE, async () => {
        await sleep(100);
      });
    }

    // 构造哈夫曼树
    getHuffmanTree() {
      // 以各个字符出现次数为node.val, 构造森林
      let forest = [];
      for (let char in this.hash) {
        addTask(23, EMPTY_NODE, async () => {
          await sleep(100);
        });
        let node = new HuffmanNode(this.hash[char], char, null, null);
        addTask(24, EMPTY_NODE, async () => {
          await sleep(100);
        });
        forest.push(node);
        addTask(25, forest, async node => {
          binaryTree.setTree(node);
          await sleep(800);
        });
      }

      let allNodes = []; // 存放被合并的节点，因为不能真的删除森林中任何一个节点，否则.left .right就找不到节点了
      // 等到森林只剩一个节点时，表示合并过程结束，树就生成了
      while (forest.length !== 1) {
        // 从森林中找到两个最小的树，合并之
        forest.sort((a, b) => {
          return a.val - b.val;
        });
        addTask(29, EMPTY_NODE, async () => {
          await sleep(100);
        });

        let node = new HuffmanNode(forest[0].val + forest[1].val, '', null, null);
        addTask(32, EMPTY_NODE, async () => {
          await sleep(100);
        });
        allNodes.push(forest[0]);
        allNodes.push(forest[1]);
        node.left = allNodes[allNodes.length - 2]; // 左子树放置词频低的
        node.right = allNodes[allNodes.length - 1]; // 右子树放置词频高的
        addTask(36, EMPTY_NODE, async () => {
          await sleep(100);
        });
        addTask(37, allNodes, async node => {
          binaryTree.setTree(node);
          await sleep(800);
        });

        // 删除最小的两棵树
        forest = forest.slice(2);
        addTask(38, EMPTY_NODE, async () => {
          await sleep(100);
        });
        // 新增的树加入
        forest.push(node);
      }

      // 生成的哈夫曼树，仅剩一个节点，即整棵树的根节点
      return forest[0];
    }

    // 遍历哈夫曼树，返回一个 原始字符 和 二进制编码 的对照表
    getHuffmanCode(tree) {
      let hash = {}; // 对照表
      let traversal = (node, curPath) => {
        addTask(45, node, async node => {
          binaryTree.setTree(node);
          await sleep(800);
        });
        addTask(46, EMPTY_NODE, async () => {
          await sleep(100);
        });
        if (!node.length && !node.right) return;
        addTask(47, EMPTY_NODE, async () => {
          await sleep(100);
        });
        if (node.left && !node.left.left && !node.left.right) {
          hash[node.left.char] = curPath + '0';
          addTask(48, EMPTY_NODE, async () => {
            await sleep(100);
          });
        }
        addTask(50, EMPTY_NODE, async () => {
          await sleep(100);
        });
        if (node.right && !node.right.left && !node.right.right) {
          hash[node.right.char] = curPath + '1';
          addTask(51, EMPTY_NODE, async () => {
            await sleep(100);
          });
        }
        // 往左遍历，路径加0
        addTask(53, EMPTY_NODE, async () => {
          await sleep(100);
        });
        if (node.left) {
          traversal(node.left, curPath + '0');
        }
        addTask(54, EMPTY_NODE, async () => {
          await sleep(100);
        });
        // 往右遍历，路径加1
        if (node.right) {
          traversal(node.right, curPath + '1');
        }
      };
      addTask(60, EMPTY_NODE, async () => {
        await sleep(100);
      });
      traversal(tree, '');
      addTask(61, tree, async tree => {
        binaryTree.setTree(tree);
        await sleep(800);
      });
      return hash;
    }

    // 返回最终的压缩后的二进制串
    /**
     *
     * @param {Object} map
     * @param {string} originStr
     * @returns {string}
     */
    getBinaryStr(map, originStr) {
      let result = '';
      for (let i = 0; i < originStr.length; i++) {
        result += map[originStr[i]];
      }
      return result;
    }
  }

  return new HuffmanTree(str).binaryStr;
}
