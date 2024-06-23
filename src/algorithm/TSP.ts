/** 旅行商(TSP)问题 */
import type { CodeController } from '../utils/code-controller';

import { createCoordinateMap } from '../utils/echarts';
// import { sleep } from '../utils/sleep';
// @ts-ignore
import Msg from '../components/message/index.js';
// @ts-ignore
import { runTspCode } from '../algorithm/TSP-code.js';

const tspCode = [
  'class TSP {',
  '  constructor() {',
  '    this.nodes = [];',
  '    this.orders = [];',
  '    this.r = 4;',
  '    this.lw = 2;',
  '    this.mutation_rate = 0.05;',
  '    this.is_running = false;',
  '  }',
  '',
  '  makeRandomNodes(nodes, life_count = 100) {',
  '    this.is_running = false;',
  '    this.n = nodes.length;',
  '    this.life_count = life_count;',
  '    this.nodes = nodes;',
  '    this.orders = [];',
  '',
  '    for (let i = 0; i < this.n; i++) {',
  '      this.orders.push(i);',
  '    }',
  '',
  '    shuffle(this.orders);',
  '    this.orders.push(this.orders[0]);',
  '',
  '    this.ga = new GA({',
  '      life_count: this.life_count,',
  '      mutation_rate: this.mutation_rate,',
  '      gene_length: this.n,',
  '      rate: this.rate.bind(this),',
  '      xFunc: this.xFunc.bind(this),',
  '      mFunc: this.mFunc.bind(this),',
  '    });',
  '  }',
  '',
  '  rate(gene) {',
  '    return 1 / this.getDistance(gene);',
  '  }',
  '',
  '  xFunc(lf1, lf2) {',
  '    let p1 = Math.floor(Math.random() * (this.n - 2)) + 1;',
  '    let p2 = Math.floor(Math.random() * (this.n - p1)) + p1;',
  '    let piece = lf2.gene.slice(p1, p2);',
  '    let new_gene = lf1.gene.slice(0, p1);',
  '    piece.concat(lf2.gene).map(i => {',
  '      if (!new_gene.includes(i)) {',
  '        new_gene.push(i);',
  '      }',
  '    });',
  '',
  '    return new_gene;',
  '  }',
  '',
  '  mFunc(gene) {',
  '    let p1 = 0;',
  '    let p2 = 0;',
  '    let n = gene.length;',
  '    while (p1 === p2) {',
  '      p1 = Math.floor(Math.random() * n);',
  '      p2 = Math.floor(Math.random() * n);',
  '    }',
  '    if (p1 > p2) {',
  '      [p1, p2] = [p2, p1];',
  '    }',
  '',
  '    let funcs = [',
  '      (g, p1, p2) => {',
  '        let t = g[p1];',
  '        g[p1] = g[p2];',
  '        g[p2] = t;',
  '      },',
  '      (g, p1, p2) => {',
  '        let t = g.slice(p1, p2).reverse();',
  '        g.splice(p1, p2 - p1, ...t);',
  '      },',
  '      (g, p1, p2) => {',
  '        let t = g.splice(p1, p2 - p1);',
  '        g.splice(Math.floor(Math.random() * g.length), 0, ...t);',
  '      },',
  '    ];',
  '',
  '    let r = Math.floor(Math.random() * funcs.length);',
  '    funcs[r](gene, p1, p2);',
  '',
  '    return gene;',
  '  }',
  '',
  '  getDistance(order) {',
  '    let d = 0;',
  '    let { nodes } = this;',
  '    order.concat(order[0]).reduce((a, b) => {',
  '      d += Math.sqrt(Math.pow(nodes[a].x - nodes[b].x, 2) + Math.pow(nodes[a].y - nodes[b].y, 2));',
  '      return b;',
  '    });',
  '    return d;',
  '  }',
  '',
  '  async run() {',
  '    let last_best_score = -1;',
  '    let last_best_gen = 0;',
  '',
  '    while (this.is_running) {',
  '      this.orders = this.ga?.next();',
  '      let { best, generation } = this.ga;',
  '',
  '      if (last_best_score !== best.score) {',
  '        last_best_score = best.score;',
  '        last_best_gen = generation;',
  '      } else if (generation - last_best_gen >= 5000) {',
  '        this.stop();',
  '        break;',
  '      }',
  '',
  '      await wait(10);  /* 防止栈溢出 */',
  '    }',
  '  }',
  '',
  '  start() {',
  '    this.is_running = true;',
  '    this.run();',
  '  }',
  '',
  '  stop() {',
  '    this.is_running = false;',
  '  }',
  '}',
  '',
];

export function getTSPcode() {
  return tspCode;
}

type Node = {
  name: string;
  x: number;
  y: number;
};

type PathList = [Node, Node][];

/**
 *
 * @param index code 行数
 * @param paths
 * @param callback
 */
async function runTSPTask(index: number, paths: PathList, callback: (paths: PathList) => Promise<void>) {
  await callback(paths);
}

export class TSPController implements CodeController {
  tspInstance: ReturnType<typeof runTspCode> = null;

  isRun = false;
  // 遗传算法不需要 index 和 length记录当前执行到的任务条数和总任务条数
  index = 0;
  length = 0;
  stop: (() => void) | null = null;
  runFunc: ((index: number, callback: () => Promise<void>) => Promise<void>) | null = null;
  run = async () => {
    if (this.isRun) return;
    if (!this.tspInstance) return;
    this.isRun = true;
    this.tspInstance.start();
  };
  pause = () => {
    if (!this.tspInstance) return;
    this.tspInstance.stop();
    this.stop && this.stop();
    this.isRun = false;
  };
  prev = () => {
    Msg.message({
      message: '遗传算法不支持回退操作',
      type: 'warning',
    });
  };
  next = () => {
    Msg.message({
      message: '遗传算法不支持前进操作',
      type: 'warning',
    });
  };
  goto = () => {
    Msg.message({
      message: '遗传算法不支持跳转操作',
      type: 'warning',
    });
  };
}

type TspSet = {
  setLink: (paths: PathList) => void;
  onStart?: () => void;
  onStop?: () => void;
};

export async function createTSP(nodes: Node[], controller: TSPController) {
  const tspDraw: TspSet = createCoordinateMap(nodes);
  const tspInstance = runTspCode(
    nodes,
    async (index: number, paths: PathList, callback: (paths: PathList) => Promise<void>) => {
      if (controller.runFunc)
        await controller.runFunc(index, async () => {
          await runTSPTask(index, paths, callback);
        });
      else {
        await runTSPTask(index, paths, callback);
      }
    },
    tspDraw
  );
  controller.tspInstance = tspInstance;
}
