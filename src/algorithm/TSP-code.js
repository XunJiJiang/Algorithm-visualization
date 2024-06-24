// @ts-check
/** 动态规划解决TSP */
import { sleep } from '../utils/sleep.ts';

/**
 * 洗牌算法
 * @param {number[]} arr
 * @returns
 */
function shuffle(arr) {
  let i = arr.length;
  while (i) {
    let j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }

  return arr;
}

class Life {
  constructor(gene = 100) {
    this.gene = Array.isArray(gene) ? gene.slice(0) : this.rndGene(gene);
    this.score = 0;
  }

  /**
   * @param {number} n
   * @returns
   */
  rndGene(n) {
    return shuffle(new Array(n).fill(0).map((_, idx) => idx));
  }

  /**
   * @param {number} v
   * @returns
   */
  setScore(v) {
    this.score = v;
  }

  toString() {
    return this.gene.join('-');
  }
}

class GA {
  constructor(options) {
    this.x_rate = options.x_rate || 0.7;
    this.mutation_rate = options.mutation_rate || 0.005;
    this.life_count = options.life_count || 50;
    this.gene_length = options.gene_length || 100;
    this.mutation_count = 0;
    this.generation = 0;
    this.lives = [];
    this.scores = 0; // 总得分
    this.best = null;

    this.rate = options.rate;
    this.xFunc = options.xFunc;
    this.mFunc = options.mFunc;

    for (let i = 0; i < this.life_count; i++) {
      this.lives.push(new Life(this.gene_length));
    }
  }

  /**
   * 根据传入的方法，计算每个个体的得分
   */
  doRate() {
    //let last_avg = this.scores / this.life_count
    this.scores = 0;
    let last_best_score = -1;

    this.lives.map(lf => {
      lf.setScore(this.rate(lf.gene));
      if (lf.score > last_best_score) {
        last_best_score = lf.score;
        this.best = lf;
      }
      this.scores += lf.score;
    });
  }

  bear(p1, p2) {
    // 根据父母 p1, p2 生成一个后代
    let gene;
    if (Math.random() < this.x_rate) {
      // 交叉
      gene = this.xFunc(p1, p2);
    } else {
      gene = p1.gene.slice(0);
    }

    if (Math.random() < this.mutation_rate) {
      // 突变
      gene = this.mFunc(gene);
      this.mutation_count++;
    }

    return new Life(gene);
  }

  getOne() {
    // 根据得分情况，随机取得一个个体，机率正比于个体的score属性
    let { scores, lives } = this;
    let r = Math.random() * scores;

    for (let i = 0, l = lives.length; i < l; i++) {
      let lf = lives[i];
      r -= lf.score;
      if (r <= 0) {
        return lf;
      }
    }
  }

  newChild() {
    return this.bear(this.getOne(), this.getOne());
  }

  next() {
    this.generation++;

    this.doRate();
    /**
     * @type {Life[]}
     */
    let new_lives = [];
    if (!this.best) {
      throw new Error('best is null');
    }
    new_lives.push(this.best); // 将最好的父代加入竞争
    new_lives.push(new Life(this.gene_length)); // 加入一个随机值
    while (new_lives.length < this.life_count) {
      new_lives.push(this.newChild());
    }
    this.lives = new_lives;

    return this.best?.gene.slice(0);
  }
}

/**
 * @typedef {{
 *  name: string,
 *  x: number,
 *  y: number
 * }} Node
 */

/**
 * @typedef {[Node, Node][]} PathList
 */

/**
 * 返回值为 TSP 实例
 * @param {Node[]} nodes
 * @param {(index: number, paths: PathList, callback: (paths: PathList) => Promise<void>) => Promise<void>} runTSPTask
 * @param {{
 *  setLink: (paths: PathList) => void;
 *  onStart?: () => void;
 *  onStop?: () => void;
 * }} tspDraw
 * @returns {TSP}
 */
export function runTspCode(nodes, runTSPTask, tspDraw) {
  // TODO: 此处断点可能需要继续添加
  class TSP {
    n = 0;
    life_count = 0;
    // 表示每个节点的坐标
    nodes = [];
    orders = [];
    /**
     * @type {GA | null}
     */
    ga = null;
    is_running = false;
    r = 4;
    lw = 2;
    mutation_rate = 0.05;
    onStart = () => {};
    onStop = () => {};

    constructor(onStart = () => {}, onStop = () => {}) {
      this.nodes = [];
      this.orders = [];
      this.r = 4;
      this.lw = 2;
      this.mutation_rate = 0.05;
      this.is_running = false;
      this.onStart = onStart;
      this.onStop = onStop;
    }

    /**
     *
     * @param {Node[]} nodes
     * @param {number} life_count 个体数量
     */
    makeRandomNodes(nodes, life_count = 100) {
      this.is_running = false;
      this.n = nodes.length;
      this.life_count = life_count;
      this.nodes = nodes;
      this.orders = [];

      for (let i = 0; i < this.n; i++) {
        // this.nodes.push({
        //   name: `${i}`,
        //   x: Math.floor(Math.random() * 300),
        //   y: Math.floor(Math.random() * 300),
        // });
        this.orders.push(i);
      }

      shuffle(this.orders);
      this.orders.push(this.orders[0]);

      this.ga = new GA({
        life_count: this.life_count,
        mutation_rate: this.mutation_rate,
        gene_length: this.n,
        rate: this.rate.bind(this),
        xFunc: this.xFunc.bind(this),
        mFunc: this.mFunc.bind(this),
      });
    }

    rate(gene) {
      return 1 / this.getDistance(gene);
    }

    xFunc(lf1, lf2) {
      let p1 = Math.floor(Math.random() * (this.n - 2)) + 1;
      let p2 = Math.floor(Math.random() * (this.n - p1)) + p1;
      let piece = lf2.gene.slice(p1, p2);
      let new_gene = lf1.gene.slice(0, p1);
      piece.concat(lf2.gene).map(i => {
        if (!new_gene.includes(i)) {
          new_gene.push(i);
        }
      });

      return new_gene;
    }

    mFunc(gene) {
      let p1 = 0;
      let p2 = 0;
      let n = gene.length;
      while (p1 === p2) {
        p1 = Math.floor(Math.random() * n);
        p2 = Math.floor(Math.random() * n);
      }
      if (p1 > p2) {
        [p1, p2] = [p2, p1];
      }

      let funcs = [
        (g, p1, p2) => {
          // 交换
          let t = g[p1];
          g[p1] = g[p2];
          g[p2] = t;
        },
        (g, p1, p2) => {
          // 倒序
          let t = g.slice(p1, p2).reverse();
          g.splice(p1, p2 - p1, ...t);
        },
        (g, p1, p2) => {
          // 移动
          let t = g.splice(p1, p2 - p1);
          g.splice(Math.floor(Math.random() * g.length), 0, ...t);
        },
      ];

      let r = Math.floor(Math.random() * funcs.length);
      funcs[r](gene, p1, p2);

      return gene;
    }

    /**
     * 得到当前顺序下连线的总长度
     */
    getDistance(order) {
      let d = 0;
      let { nodes } = this;
      order.concat(order[0]).reduce((a, b) => {
        d += Math.sqrt(Math.pow(nodes[a].x - nodes[b].x, 2) + Math.pow(nodes[a].y - nodes[b].y, 2));
        return b;
      });
      return d;
    }

    async render() {
      let { r, nodes } = this;
      const pathList = [];

      // lines
      this.orders.concat(this.orders[0]).reduce((a, b) => {
        let na = nodes[a];
        let nb = nodes[b];
        pathList.push([na, nb]);
        return b;
      });

      await runTSPTask(101, pathList, async paths => {
        tspDraw.setLink(paths);
        await sleep(50);
      });
    }

    async run() {
      let last_best_score = -1;
      let last_best_gen = 0;

      while (this.is_running) {
        // @ts-ignore
        this.orders = this.ga?.next();
        // @ts-ignore
        let { best, generation } = this.ga;

        if (last_best_score !== best.score) {
          last_best_score = best.score;
          last_best_gen = generation;
          await runTSPTask(106, [], async () => {
            await sleep(50);
          });
        } else if (generation - last_best_gen >= 5000) {
          // 超过 n 代没有更好的结果，自动结束
          this.stop();
          break;
        }

        // @ts-ignore
        if (this.ga.generation % 10 === 0) {
          await this.render();
        }
        await sleep(1);
      }
    }

    start() {
      this.is_running = true;
      this.run();
      this.onStart();
    }

    stop() {
      this.is_running = false;
      this.onStop();
    }
  }

  let tsp = new TSP(
    () => {
      tspDraw.onStart?.();
    },
    () => {
      tspDraw.onStop?.();
    }
  );

  // 这里的 100 是指个体数量
  tsp.makeRandomNodes(nodes, 100);

  return tsp;
}
