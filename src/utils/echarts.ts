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
    y: Math.floor((v.charCodeAt(0) - 65) / 3) * 50 + (i % 2 === 1 ? 25 : 0),
  }));
  chart.setOption({
    ...baseOption,
    xAxis: {
      type: 'category',
      show: false,
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        edgeSymbol: ['none', 'none'],
        edgeLabel: {
          fontSize: 18,
          formatter: function (params: any) {
            return params.data.weight;
          },
          color: '#ffffffcc',
        },
        label: {
          show: true,
          fontSize: 20,
          position: 'inside',
          formatter: '{b}',
        },
        data,
        links: edges.map(([source, target, weight]) => ({
          source: vertices[source],
          target: vertices[target],
          weight,
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
            type: 'graph',
            layout: 'none',
            symbolSize: 50,
            symbolFontSize: 20,
            font: 'bold 20px Microsoft YaHei',
            edgeSymbol: ['none', 'none'],
            edgeLabel: {
              fontSize: 18,
              formatter: function (params: any) {
                console.log(params);
                return params.data.weight;
              },
              color: '#ffffffcc',
            },
            label: {
              show: true,
              fontSize: 20,
              position: 'inside',
              formatter: '{b}',
            },
            data,
            links: edges.map(([source, target, weight]) => ({
              source: vertices[source],
              target: vertices[target],
              weight,
            })),
          },
        ],
      });
    },
  };
}
