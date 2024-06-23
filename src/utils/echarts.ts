import * as echarts from 'echarts';
import { throttle } from './throttle';

const chartDom = document.getElementById('canvas-container');
export const chart = echarts.init(chartDom);
const baseOption = {
  animationDuration: 500,
};
const option = {
  ...baseOption,
};

export const init = () => {
  chart.setOption({
    animationDuration: 0,
    xAxis: {
      data: [''],
    },
    yAxis: {},
    series: [
      {
        silent: true,
        name: '销量',
        type: 'bar',
        data: [0],
      },
    ],
  });
};

option && chart.setOption(option);

export const resize = throttle(() => {
  chart.resize();
}, 500);

export function createSort(arr: number[]) {
  init();
  resize();
  chart.setOption({
    ...baseOption,
    xAxis: {
      type: 'category',
      data: arr.map(v => v),
    },
    series: [
      {
        silent: true,
        data: arr,
        type: 'bar',
      },
    ],
  });
  return {
    setArr: (arr: number[]) => {
      chart.setOption({
        ...baseOption,
        xAxis: {
          type: 'category',
          data: arr.map(v => v),
        },
        series: [
          {
            silent: true,
            data: arr,
            type: 'bar',
          },
        ],
      });
    },
  };
}

export function createGraph(edges: [number, number, number][], vertices: string[]) {
  init();
  resize();
  const data = vertices.map((v, i) => ({
    name: v,
    x: ((v.charCodeAt(0) - 65) % 3) * 100,
    y: Math.floor((v.charCodeAt(0) - 65) / 3) * 50 + (i % 2 === 1 ? 17 : 0),
  }));
  chart.setOption({
    ...baseOption,
    xAxis: {
      type: 'category',
      show: false,
    },
    series: [
      {
        silent: true,
        type: 'graph',
        layout: 'none',
        symbolSize: 22,
        edgeSymbol: ['none', 'none'],
        edgeLabel: {
          fontSize: 14,
          formatter: function (params: any) {
            return params.data.weight;
          },
          color: '#ffffffcc',
        },
        label: {
          show: true,
          fontSize: 12,
        },
        data,
        links: edges.map(([source, target, weight]) => ({
          source: vertices[source],
          target: vertices[target],
          weight,
          label: {
            show: true,
          },
        })),
      },
    ],
  });

  return {
    setEdges: (edges: [number, number, number][]) => {
      chart.setOption({
        ...baseOption,
        series: [
          {
            data,
            silent: true,
            links: edges.map(([source, target, weight]) => ({
              source: vertices[source],
              target: vertices[target],
              weight,
              label: {
                show: true,
              },
            })),
          },
        ],
      });
    },
  };
}

type ObjType = { [key: string]: number | string | BinaryTree | null };

export interface BinaryTree extends ObjType {
  val: number;
  char: string;
  left: BinaryTree | null;
  right: BinaryTree | null;
}

type DataTree = {
  name: string;
  children: DataTree[];
};

function isBinaryTreeArray(val: unknown): val is BinaryTree[] {
  return Array.isArray(val);
}

export function createBinaryTree(tree: BinaryTree | BinaryTree[]) {
  init();
  resize();
  function createData<T extends BinaryTree | BinaryTree[]>(tree: T): DataTree | DataTree[] {
    if (isBinaryTreeArray(tree)) {
      const data: DataTree[] = [];
      tree.forEach(t => {
        data.push(createData(t) as DataTree);
      });
      return data as DataTree[];
    } else {
      const data: DataTree = {
        name: `权重: ${tree.val} ${tree.char === '' ? '' : `字符: ${tree.char}`}`,
        children: [],
      };
      if (tree.left) {
        data.children.push(createData(tree.left) as DataTree);
      }
      if (tree.right) {
        data.children.push(createData(tree.right) as DataTree);
      }
      return data;
    }
  }
  const _data = createData(tree);

  let data: DataTree | DataTree[] = _data;

  if (isBinaryTreeArray(data)) {
    data = {
      name: 'root',
      children: _data,
    } as DataTree;
  }

  const _option = {
    ...baseOption,
    series: [
      {
        silent: true,
        type: 'tree',
        initialTreeDepth: 5,
        data: [data],
        left: '2%',
        right: '2%',
        top: '20%',
        bottom: '20%',
        symbol: 'emptyCircle',
        symbolSize: 12,
        orient: 'vertical',
        expandAndCollapse: true,
        label: {
          position: 'bottom',
          verticalAlign: 'middle',
          rotate: -90,
          align: 'right',
          fontSize: 12,
        },
      },
    ],
  };

  chart.setOption(_option);

  return {
    setTree: (tree: BinaryTree | BinaryTree[]) => {
      if (!Array.isArray(tree) && tree.char === '__EMPTY_NODE__') return;
      const _data = createData(tree);

      let data: DataTree | DataTree[] = _data;

      if (isBinaryTreeArray(data)) {
        data = {
          name: 'root',
          children: _data,
        } as DataTree;
      }

      _option.series[0].data = [data];
      chart.setOption(_option);
    },
  };
}

type CoordinateMap = {
  name: string;
  x: number;
  y: number;
};

export function createCoordinateMap(map: CoordinateMap[]) {
  init();
  resize();
  // 运行次数, 每次加1
  let runCount = 0;
  const _option = {
    ...baseOption,
    animationDuration: 0,
    title: {
      text: `运行第${runCount}次`,
      x: 'left',
      y: 'top',
    },
    series: [
      {
        silent: true,
        type: 'graph',
        data: map,
        layout: 'none',
        symbolSize: 8,
        edgeSymbol: ['none', 'none'],
        label: {
          show: true,
          fontSize: 12,
          formatter: function (params: any) {
            return params.data.name.includes('起始点') ? '起始点' : '';
          },
        },
        links: [] as {
          source: string;
          target: string;
        }[],
      },
    ],
  };

  chart.setOption(_option);

  return {
    setLink: (
      links: [
        {
          name: string;
          x: number;
          y: number;
        },
        {
          name: string;
          x: number;
          y: number;
        }
      ][]
    ) => {
      runCount++;
      _option.title.text = `运行第${runCount}次`;
      _option.series[0].links = links.map(([source, target]) => ({
        source: source.name,
        target: target.name,
      }));
      chart.setOption(_option);
    },
  };
}

