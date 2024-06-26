import * as echarts from 'echarts';
import { throttle } from './throttle';
import { randomColor } from './random-color';

const chartDom = document.getElementById('canvas-container');
let chart = echarts.init(chartDom);

const baseOption = {
  animationDuration: 500,
};
const option = {
  ...baseOption,
};

export const init = () => {
  // chart = echarts.init(chartDom);
  chart.clear();
  chart.setOption({
    animationDuration: 0,
    title: {
      text: '',
    },
    xAxis: {
      show: false,
    },
    yAxis: {
      show: false,
    },
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
    value: 0,
  }));
  const _opt = {
    ...baseOption,
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      calculable: false,
      inRange: {
        color: ['#ffffff77', '#5470c6'],
      },
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
          color: '#ffffff88',
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
          lineStyle: {
            color: '#ffffff88',
            width: 1,
            shadowColor: '#ffffff00',
          },
        })),
      },
    ],
  };

  chart.setOption(_opt);

  return {
    setEdges: (_edges: [number, number, number][]) => {
      const targetSet = new Set();
      _edges.forEach(([source, target]) => {
        targetSet.add(source);
        targetSet.add(target);
      });
      const links = edges.map(([source, target, weight]) => {
        const isTarget = _edges.findIndex(([s, t]) => s === source && t === target) !== -1;
        return {
          source: vertices[source],
          target: vertices[target],
          weight,
          label: {
            show: true,
          },
          lineStyle: {
            color: isTarget ? '#ffffff' : '#ffffff88',
            width: isTarget ? 3 : 1,
            shadowColor: isTarget ? '#ffffffcc' : '#ffffff00',
          },
        };
      });
      chart.setOption({
        ...baseOption,
        series: [
          {
            data: vertices.map((v, i) => {
              const value = targetSet.has(i) ? 1 : 0;
              return {
                name: v,
                x: ((v.charCodeAt(0) - 65) % 3) * 100,
                y: Math.floor((v.charCodeAt(0) - 65) / 3) * 50 + (i % 2 === 1 ? 17 : 0),
                value,
              };
            }),
            silent: true,
            links,
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

// 为了可视化棋盘覆盖问题，为echarts注册2^2-2^6(边长)的自定义地图
for (let power = 2; power <= 6; power++) {
  const len = 2 ** power;
  echarts.registerMap(
    `grid-cover-2^${power}`,
    {
      type: 'FeatureCollection',
      features: Array.from({ length: len * len }, (_, i) => {
        // 当前点在整个棋盘中的位置
        const x = i % len;
        const y = Math.floor(i / len);

        // 生成正方形，左上角为原点，顺时针生成五个点
        const spots = [
          [x, y],
          [x + 1, y],
          [x + 1, y + 1],
          [x, y + 1],
          [x, y],
        ];

        return {
          type: 'Feature',
          properties: {
            name: `grid-cover-2^${power}-${x}-${y}`,
          },
          geometry: {
            coordinates: [spots],
            type: 'Polygon',
          },
        };
      }),
    },
    {}
  );
}

export function createGrip(power: number) {
  init();
  resize();
  const len = 2 ** power;
  // 总颜色数, 其中最后一项用于空位颜色, 第一项为特殊位置颜色
  const colorNum = (len * len - 1) / 3 + 1 + 1;
  const colors = Array.from({ length: colorNum }, () => randomColor(0x339999, 0xbbffff));
  colors[0] = '#000000';
  colors[colorNum - 1] = '#ffffff';
  chart.setOption({
    ...baseOption,
    visualMap: {
      show: false,
      min: 0,
      max: colorNum - 1,
      calculable: false,
      inRange: {
        color: colors,
      },
    },
    series: [
      {
        silent: true,
        type: 'map',
        map: `grid-cover-2^${power}`,
        data: Array.from({ length: len * len }, (_, i) => ({
          name: `grid-cover-2^${power}-${i % len}-${Math.floor(i / len)}`,
          value: colorNum - 1,
        })),
      },
    ],
  });

  return {
    setGrip: (grip: number[][]) => {
      chart.setOption({
        series: [
          {
            silent: true,
            type: 'map',
            map: `grid-cover-2^${power}`,
            mapType: `grid-cover-2^${power}`,
            data: Array.from({ length: len * len }, (_, i) => {
              return {
                name: `grid-cover-2^${power}-${i % len}-${Math.floor(i / len)}`,
                value: grip[Math.floor(i / len)][i % len] ?? colorNum - 1,
              };
            }),
          },
        ],
      });
    },
  };
}
