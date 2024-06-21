import * as echarts from 'echarts';
import { throttle } from './throttle';

const chartDom = document.getElementById('canvas-container');
export const chart = echarts.init(chartDom);
const baseOption = {
  animationDuration: 500,
};
const option = {
  ...baseOption,
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
    },
  ],
};

option && chart.setOption(option);

export const resize = throttle(() => {
  chart.resize();
}, 500);

export function createSort(arr: number[]) {
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

