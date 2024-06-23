/** 最小生成树 */
import type { CodeController } from '../utils/code-controller';

import { createGraph } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';
// @ts-ignore
import Msg from '../components/message/index.js';
// @ts-ignore
import Noty from '../components/notification/index.js';

type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]
type Vertex = string;

const code = [
  'type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]',
  'type Vertex = string;',
  'function findMinEdge(edges: Edge[]): Edge | null {',
  '  let min: Edge | null = null;',
  '  for (const edge of edges) {',
  '    if (min === null || edge[2] < min[2]) {',
  '      min = edge;',
  '    }',
  '  }',
  '  return min;',
  '}',
  'function findEdgesIn(srcs: Vertex[], objs: Vertex[], edges: Edge[], vertices: Vertex[]): Edge[] {',
  '  let edgesBetweenSrcObj: Edge[] = [];',
  '  for (const edge of edges) {',
  '    for (const src of srcs) {',
  '      const srcIndex = vertices.indexOf(src);',
  '      for (const obj of objs) {',
  '        const objIndex = vertices.indexOf(obj);',
  '        if ((edge[0] === srcIndex && edge[1] === objIndex) || (edge[0] === objIndex && edge[1] === srcIndex)) {',
  '          edgesBetweenSrcObj.push(edge);',
  '        }',
  '      }',
  '    }',
  '  }',
  '  return edgesBetweenSrcObj;',
  '}',
  'function prim(edges: Edge[], vertices: Vertex[], startVertex: Vertex): Edge[] {',
  '  let infected: Vertex[] = [];',
  '  let remained: Vertex[] = vertices.slice();',
  '  let mstree: Edge[] = [];',
  '  let cur: Vertex = startVertex;',
  '  while (remained.length > 1) {',
  '    infected.push(cur);',
  '    remained.splice(remained.indexOf(cur), 1);',
  '    let min: Edge | null = findMinEdge(findEdgesIn(infected, remained, edges, vertices));',
  '    if (min === null) break;',
  '    mstree.push(min);',
  '    cur = infected.indexOf(vertices[min[0]]) === -1 ? vertices[min[0]] : vertices[min[1]];',
  '  }',
  '  return mstree;',
  '}',
];

let taskQueue: [number, [Edge[], Vertex[], Vertex], (prop: [Edge[], Vertex[], Vertex]) => Promise<void>][] = [];

async function runPrimQueue(
  callback: (index: number, callback: () => Promise<void>) => Promise<void>,
  controller: PrimController
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

export class PrimController implements CodeController {
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
    this.runFunc && (await runPrimQueue(this.runFunc, this));
  };

  pause = () => {
    this.isRun = false;
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

    this.pause();
    this.index -= 2;
    this.index = this.index < 0 ? 0 : this.index;
    this.runFunc &&
      (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[this.index][0],
        async () => {
          await taskQueue[this.index][2](taskQueue[this.index][1]);
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

    this.pause();
    this.runFunc &&
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
  runFunc = null;
}

export function getPrimCodeTree() {
  return code;
}

export async function createPrimRaskQueue(
  edges: Edge[],
  vertices: Vertex[],
  startVertex: Vertex,
  controller: PrimController
) {
  taskQueue = [];
  controller.index = 0;
  controller.isRun = false;
  controller.length = taskQueue.length;
  const graph = createGraph(deepClone(edges), deepClone(vertices));
  await sleep(500);

  taskQueue.push([
    0,
    [deepClone(edges), deepClone(vertices), 'A'],
    async ([nowEdges]) => {
      graph.setEdges(nowEdges);
      await sleep(100);
    },
  ]);

  let nowEdges: Edge[] = [];

  function findMinEdge(edges: Edge[]): Edge | null {
    let min: Edge | null = null;
    for (const edge of edges) {
      if (min === null || edge[2] < min[2]) {
        taskQueue.push([
          5,
          [deepClone(nowEdges), deepClone(vertices), 'A'],
          async ([nowEdges]) => {
            graph.setEdges(nowEdges);
            await sleep(100);
          },
        ]);
        min = edge;
        taskQueue.push([
          5,
          [deepClone(nowEdges), deepClone(vertices), 'A'],
          async ([nowEdges]) => {
            graph.setEdges(nowEdges);
            await sleep(100);
          },
        ]);
      }
    }
    return min;
  }

  function findEdgesIn(srcs: Vertex[], objs: Vertex[], edges: Edge[], vertices: Vertex[]): Edge[] {
    let edgesBetweenSrcObj: Edge[] = [];
    for (const edge of edges) {
      for (const src of srcs) {
        const srcIndex = vertices.indexOf(src);
        for (const obj of objs) {
          taskQueue.push([
            16,
            [deepClone(edgesBetweenSrcObj), deepClone(vertices), src],
            async ([edgesBetweenSrcObj]) => {
              graph.setEdges(edgesBetweenSrcObj);
              await sleep(100);
            },
          ]);
          const objIndex = vertices.indexOf(obj);
          taskQueue.push([
            18,
            [deepClone(edgesBetweenSrcObj), deepClone(vertices), src],
            async ([edgesBetweenSrcObj]) => {
              graph.setEdges(edgesBetweenSrcObj);
              await sleep(100);
            },
          ]);
          if ((edge[0] === srcIndex && edge[1] === objIndex) || (edge[0] === objIndex && edge[1] === srcIndex)) {
            edgesBetweenSrcObj.push(edge);
            nowEdges = edgesBetweenSrcObj;
            taskQueue.push([
              19,
              [deepClone(edgesBetweenSrcObj), deepClone(vertices), src],
              async ([edgesBetweenSrcObj]) => {
                graph.setEdges(edgesBetweenSrcObj);
                await sleep(1000);
              },
            ]);
          }
        }
      }
    }
    return edgesBetweenSrcObj;
  }

  function prim(edges: Edge[], vertices: Vertex[], startVertex: Vertex): Edge[] {
    let infected: Vertex[] = [];
    let remained: Vertex[] = vertices.slice();
    let mstree: Edge[] = [];
    let cur: Vertex = startVertex;
    taskQueue.push([
      27,
      [deepClone(mstree), deepClone(vertices), startVertex],
      async ([mstree]) => {
        graph.setEdges(mstree);
        await sleep(100);
      },
    ]);
    taskQueue.push([
      29,
      [deepClone(mstree), deepClone(vertices), startVertex],
      async ([mstree]) => {
        graph.setEdges(mstree);
        await sleep(100);
      },
    ]);
    taskQueue.push([
      29,
      [deepClone(mstree), deepClone(vertices), startVertex],
      async ([mstree]) => {
        graph.setEdges(mstree);
        await sleep(100);
      },
    ]);
    taskQueue.push([
      30,
      [deepClone(mstree), deepClone(vertices), startVertex],
      async ([mstree]) => {
        graph.setEdges(mstree);
        await sleep(100);
      },
    ]);

    while (remained.length > 1) {
      taskQueue.push([
        31,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(100);
        },
      ]);
      infected.push(cur);
      taskQueue.push([
        32,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(100);
        },
      ]);
      remained.splice(remained.indexOf(cur), 1);
      taskQueue.push([
        33,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(100);
        },
      ]);
      let min: Edge | null = findMinEdge(findEdgesIn(infected, remained, edges, vertices));
      taskQueue.push([
        34,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(100);
        },
      ]);
      taskQueue.push([
        35,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(100);
        },
      ]);
      if (min === null) break;
      mstree.push(min);
      nowEdges = mstree;
      taskQueue.push([
        36,
        [deepClone(mstree), deepClone(vertices), startVertex],
        async ([mstree]) => {
          graph.setEdges(mstree);
          await sleep(1000);
        },
      ]);
      cur = infected.indexOf(vertices[min[0]]) === -1 ? vertices[min[0]] : vertices[min[1]]; // 更新
    }

    taskQueue.push([
      39,
      [deepClone(mstree), deepClone(vertices), startVertex],
      async ([mstree]) => {
        graph.setEdges(mstree);
        await sleep(1000);
      },
    ]);

    return mstree;
  }

  prim(edges, vertices, startVertex);

  controller.length = taskQueue.length;
}
