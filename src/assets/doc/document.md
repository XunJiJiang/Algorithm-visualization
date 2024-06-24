# 算法可视化

## 使用手册

**1. 在首页点击开始选项，进入算法展示页**

**2. 选择一个可用的算法，欣赏她**

## 开发手册

> <warn icon='info-circle'/>
>
> 在下面的内容中，`[算法]`表示你的算法中文名，`[aL]`表示使用小驼峰命名法的英文名，`[AL]`表示使用大驼峰命名法的英文名，`[a-l]`表示使用 kebab-case 命名法的英文名。

### 将算法添加到 html

在 `root\index.html` 文件中，找到 `id`为 `code-menu`的`nav`标签。这很容易，因为标签结构并不复杂。

在`nav > ul` 中添加元素`<li><a class="block code-menu-item">[算法]</a></li>`。

在`root\src\utils\root-menu.ts`文件中，找到函数`codePageButton`。这个函数用于处理`code-menu-item`元素的点击事件。

在`codePageButton`函数内的循环中，添加一个`if else`节点，添加如下内容

```ts
else if (codeMenuItem[i].innerHTML === '[你的算法名称]') {
  run[AL]();
}
```

并在文件头部引入

```ts
import { run[AL] } from '[路径]/[a-l].ts'
```

现在创建好`[任意不冲突路径]\[a-l].ts`文件（下称算法执行文件），导出函数`run[AL]`备用

```ts
export async function run[AL]() {}
```

### 算法控制程序

现在开发算法控制程序

创建好`root\algorithm\[a-l].ts`文件

```ts
// 导入接口 CodeController
import type { CodeController } from '../utils/code-controller';
// 导入封装好的canvas渲染器 (稍后实现)
import { create[渲染器名称] } from '../utils/echarts';
// 导入工具函数
import { sleep } from '../utils/sleep';
import { deepClone } from '../utils/deepClone';
// 导入信息弹窗函数。这个函数使用js实现，如果发生ts类型错误，可以添加 // @ts-ignore 注释
// @ts-ignore
import Msg from '../components/message/index.js';

// 算法的显示内容，将在代码窗口展示
const [aL]Code = [
  'function [aL](,,,args) {',
  // ...
  '}'
];

// 导出获取算法代码的函数
export function get[AL]Code() {
  return [aL]Code;
}

/**
 * 任务队列。如果是启发式函数，则不需要任务队列
 * 数组第一项number用于记录算法执行对应的行数，行数则对应上面算法内容数组的下标
 * 第二项为你的算法参数类型
 * 第三项为一个异步函数，之后在执行时会传入第二项
 */
let taskQueue: [number, [你的算法的数据类型], (props: [你的算法的数据类型]) => Promise<void>][] = [];

// 添加任务队列，此处是精确的算法的实现
function addTask(index: number, props: [你的算法的数据类型], callback: (props: [你的算法的数据类型]) => Promise<void>) {
  addTask([index, deepClone(props), callback]);
}

// 添加任务队列，此处是启发式算法的实现
async function runTSPTask(_: number, props: [你的算法的数据类型], callback: (props: [你的算法的数据类型]) => Promise<void>) {
  await callback(props);
}

// goto任务保存位置，启发式算法不需要实现
let gotoTask: (() => number) | null = null;

// 创建控制器类，实现CodeController 并导出
export class [AL]Controller implements CodeController {
  // 启发式算法的实例
  [al]Instance: [AL]Type | null = null;

  // 启发式算法不需要 index 和 length记录当前执行到的任务条数和总任务条数，初始化为0即可
  // 记录任务队列执行下标
  index = 0;
  // 记录任务队列长度
  length = taskQueue.length;
  // 用于中断运行
  isRun = false;
  // 由算法执行函数重写，此处仅声明即可
  runFunc = async () => {};
  // 由算法执行函数重写，此处仅声明即可
  stop = () => {};

  run = async () => {
    if (是否越界[(启发式算法不需要判断)(0 > this.index || this.index >= taskQueue.length)]) {
      // 将this.index置于合法位置
      // 通常，超下界则置0，超上界置最大值taskQueue.length - 1;
    }
    if (this.isRun) return;
    this.isRun = true;
    // 精确算法执行
    await run[AL]Queue(this.runFunc, this);
    // 启发式算法执行，运行算法实例的开始操作
    this.[al]Instance.start();
  };

  pause = (runStop = true) => {
    this.isRun = false;

    if (runStop) this.stop();

    // 对于启发式算法，需要运行算法实例的停止操作
    if (!this.[al]Instance) return;
    this.[al]Instance.stop();
  };

  prev = () => {
    // 启发式算法不支持回退
    Msg.message({
      message: '不支持回退操作',
      type: 'warning',
    });

    if (this.index <= 0) {
      this.index = 0;
      Msg.message({
        message: '已经是第一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    this.pause(false);
    this.index -= 2;

    (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
      taskQueue[this.index < 0 ? 0 : this.index][0],
      async () => {
        await taskQueue[this.index < 0 ? 0 : this.index][2](taskQueue[this.index][1]);
        this.index++;
      }
    );
  };

  next = () => {
    // 启发式算法不支持进步
    Msg.message({
      message: '不支持进步操作',
      type: 'warning',
    });

    if (this.index >= taskQueue.length) {
      this.index = taskQueue.length - 1;
      Msg.message({
        message: '已经是最后一步了',
        type: 'warning',
        duration: 500,
      });
      return;
    }

    this.pause(false);

    (this.runFunc as (index: number, callback: () => Promise<void>) => Promise<void>)(
      taskQueue[this.index][0],
      async () => {
        await taskQueue[this.index][2](taskQueue[this.index][1]);
        this.index++;
      }
    );
  };


  goto = (index: number) => {
    // 启发式算法不支持跳转
    Msg.message({
      message: '不支持跳转操作',
      type: 'warning',
    });

    this.run();
    gotoTask = () => {
      gotoTask = null;
      return index;
    };
  };
}

// 创建算法运行任务
export async function create[AL]TaskQueue(
  props: [你的算法的数据类型],
  controller: [AL]Controller
) {
  // 初始化
  taskQueue = [];
  controller.index = 0;
  controller.isRun = false;
  // 创建canvas画布操作器
  // 算法数据类型可能和画布操作类型有差别，需要自行转换
  const draw = [AL]Controller(props);

  await sleep(500);

  // 下面是一个精确算法添加运行点的示例
  function bubbleSort(arr: number[]) {
    for (let j = 0; j < arr.length - 1; j++) {
      // 对于不需要重绘canvas的节点，仅需要满足类型限制，并等待100ms
      addTask(
        1,
        [],
        async () => {
          await sleep(100);
        },
      );
      for (let i = 0; i < arr.length - 1 - j; i++) {
        addTask(
          2,
          [],
          async () => {
            await sleep(100);
          },
        );
        if (arr[i] > arr[i + 1]) {
          addTask(
            3,
            [],
            async () => {
              await sleep(100);
            },
          );
          let temp = arr[i];
          addTask(
            4,
            [],
            async () => {
              await sleep(100);
            },
          );
          arr[i] = arr[i + 1];
          addTask(
            5,
            [],
            async () => {
              await sleep(100);
            },
          );
          arr[i + 1] = temp;
          // 对于需要重绘canvas的节点，需要传入当前数据，并重绘
          addTask(
            6,
            arr,
            async (arr: number[]) => {
              draw.set(arr);
              await sleep(500);
            },
          );
        }
      }
    }
    return arr;
  }

  bubbleSort(arr);

  // 对于启发式算法，请参考应用中已实现的TSP算法

  controller.length = taskQueue.length;
}

```

### 算法执行文件

现在开发算法执行文件

```ts
import type { CodeController } from './code-controller';
// 导入总执行函数
// runExactAlgorithm 运行精确的算法
// runMetaHeuristicAlgorithm 运行启发式算法
import { runExactAlgorithm, runMetaHeuristicAlgorithm } from 'root\src\utils\code.ts'
// 导入代码，控制器和任务创建函数
import { get[AL]Code, create[AL], [AL]Controller } from '../algorithm/[AL]';
// 导入代码高亮
import hljs from 'highlight.js';
const { highlight } = hljs;

// 创建高亮代码块
const highlightCode = highlight(get[AL]Code().join('\n'), {
  language: '[代码使用的语言]',
}).value;

export async function run[AL]() {
  // 根据算法创建随机数据
  const data = '// ...';

  // 实例化控制器
  const controller = new [AL]Controller();

  // 两个总执行函数使用方法是一样的
  await runExactAlgorithm(
    // html中，对应的 nav > ul > li 的下标
    6,
    highlightCode,
    create[AL].bind(null, data, controller),
    controller as unknown as CodeController
  );
}
```

### 绘制程序

现在开发绘制程序

> <info/>
>
> 关于具体的绘制配置
>
> 参见[`Echarts`使用文档](https://echarts.apache.org/zh/api.html#echarts)

`echarts.ts`种已有五种绘制程序，可供直接选用

如果没有需要的绘制程序，可以直接在`root\src\utils\echarts.ts`种添加新的绘制函数

```ts
export function create[绘制类型](props: [绘制的数据类型]) {
  // 初始化
  init();
  // 匹配页面尺寸
  resize();
  // 首次绘制
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
  // 返回set函数，用于数据重绘
  return {
    set: (arr: number[]) => {
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
```

> <success/>
>
> **现在，你的算法应该已经成功添加到应用。**
