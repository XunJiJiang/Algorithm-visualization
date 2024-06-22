import { createSort, createGraph } from '../utils/echarts';
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';
// @ts-ignore
import Msg from '../components/message/index.js';
// @ts-ignore
import Noty from '../components/notification/index.js';

type Edge = [number, number, number]; // [startVertexIndex, endVertexIndex, weight]
type Vertex = string;

function findMinEdge(edges: Edge[]): Edge | null {
  let min: Edge | null = null;
  for (const edge of edges) {
    if (min === null || edge[2] < min[2]) {
      min = edge;
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
        const objIndex = vertices.indexOf(obj);
        if ((edge[0] === srcIndex && edge[1] === objIndex) || (edge[0] === objIndex && edge[1] === srcIndex)) {
          // 无向
          edgesBetweenSrcObj.push(edge);
        }
      }
    }
  }
  return edgesBetweenSrcObj;
}

function prim(edges: Edge[], vertices: Vertex[], startVertex: Vertex): Edge[] {
  let infected: Vertex[] = []; // 顶点
  let remained: Vertex[] = vertices.slice(); // 顶点
  let mstree: Edge[] = []; // 边
  let cur: Vertex = startVertex;

  while (remained.length > 1) {
    infected.push(cur);
    remained.splice(remained.indexOf(cur), 1);
    let min: Edge | null = findMinEdge(findEdgesIn(infected, remained, edges, vertices));
    if (min === null) break; // 如果没有更多的边可以加入，退出循环
    mstree.push(min);
    cur = infected.indexOf(vertices[min[0]]) === -1 ? vertices[min[0]] : vertices[min[1]]; // 更新
  }

  return mstree;
}

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

export async function runPrimQueue(callback: (index: number, callback: () => Promise<void>) => Promise<void>) {
  for (let i = primController.index; i < taskQueue.length; i++) {
    if (!primController.isRun) return;
    await callback(taskQueue[i][0], async () => {
      primController.index = i;
      await taskQueue[i][2](taskQueue[i][1]);
    });
  }
}

export const primController = {
  pause: () => {
    primController.isRun = false;
  },
  run: async () => {
    if (primController.index < 0) {
      primController.index = 0;
    } else if (primController.index >= taskQueue.length) {
      primController.index = taskQueue.length - 1;
    }
    if (primController.isRun) return;
    primController.isRun = true;
    primController.runFunc && (await runPrimQueue(primController.runFunc));
  },
  prev: () => {
    if (primController.index <= 0) {
      primController.index = 0;
      Msg.message({
        message: '已经是第一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    primController.pause();
    primController.index -= 2;
    primController.runFunc &&
      (primController.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[primController.index][0],
        async () => {
          await taskQueue[primController.index][2](taskQueue[primController.index][1]);
          primController.index++;
        }
      );
  },
  next: () => {
    if (primController.index === taskQueue.length - 2) {
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    primController.pause();
    primController.runFunc &&
      (primController.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
        taskQueue[primController.index][0],
        async () => {
          await taskQueue[primController.index][2](taskQueue[primController.index][1]);
          primController.index++;
        }
      );
  },
  goto: (index: number) => {
    primController.index = index;
  },
  index: 0,
  isRun: false,
  length: taskQueue.length,
  runFunc: null,
};

export function getPrimCodeTree() {
  return code;
}

export async function createPrimRaskQueue(edges: Edge[], vertices: Vertex[], startVertex: Vertex) {
  taskQueue = [];
  primController.index = 0;
  primController.isRun = false;
  primController.length = taskQueue.length;
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

  primController.length = taskQueue.length;
}
