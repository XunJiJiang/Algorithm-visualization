interface Task {
  id?: string;
  delay?: number;
  callback: () => void | Promise<void>;
}

function isAsyncFunction<T>(value: unknown): value is (...args: unknown[]) => Promise<T> {
  return typeof value === 'function' && value.constructor.name === 'AsyncFunction';
}

/**
 * 创建延时任务队列，按照添加任务的顺序执行
 */
export class TimeoutTaskQueue {
  /**
   * 运行下次任务的promise
   */
  private _promise: [Promise<void>, () => void] | [null, null] = [null, null];

  /**
   * 任务完成后执行的回调
   */
  private _finallyCallback: (() => void)[] = [];

  /**
   * 任务队列
   */
  private _taskQueue: Task[] = [];

  /**
   * 任务队列需要运行的次数
   */
  private _queuedNumber = 0;

  /**
   * 当前的状态, 可以决定下一次任务是否运行
   */
  private _state: 'pending' | 'complete' | 'running' = 'complete';

  /**
   * 是否有任务正在运行
   */
  private _isRunning = false;

  /**
   * 向任务队列中添加任务
   * @param delay 延时长度(ms)
   * @param callback 任务
   */
  private _addTask({ delay, callback }: Task) {
    this._promise[0] = this._promise[0]!.then(() => {
      if (isAsyncFunction<void>(callback)) {
        if (typeof delay === 'number') {
          return new Promise(resolve => {
            setTimeout(() => {
              callback().then(resolve);
            }, delay);
          });
        }
        return callback();
      }

      if (typeof delay === 'number') {
        return new Promise(resolve => {
          setTimeout(() => {
            callback();
            resolve();
          }, delay);
        });
      }

      callback();
      return Promise.resolve();
    });
  }

  /**
   * 添加一个任务
   */
  public addTask(task: Task): TimeoutTaskQueue {
    this._taskQueue.push(task);
    return this;
  }

  /**
   * 删除指定id的任务
   */
  public deleteTask(id: string): TimeoutTaskQueue {
    const index = this._taskQueue.findIndex(task => {
      if (typeof task.id === 'string' && id === task.id) {
        return true;
      } else {
        return false;
      }
    });
    if (index !== -1) {
      this._taskQueue.splice(index, 1);
    }
    return this;
  }

  /**
   * 创建一条待执行任务队列
   * @param once 是否在运行本次队列后自动运行下一条任务
   */
  private _createTaskQueue(once: boolean): TimeoutTaskQueue {
    this._promise[0] = new Promise(resolve => {
      this._promise[1] = resolve;
    });
    this._taskQueue.forEach(task => {
      this._addTask(task);
    });
    this._promise[0]!.finally(() => {
      this._finallyCallback.forEach(callback => callback());
      this._isRunning = false;
      if (!once) {
        this._run();
      } else {
        if (this._queuedNumber === 0) {
          this._state = 'complete';
        } else {
          this._state = 'pending';
        }
      }
    });
    return this;
  }

  /**
   * 添加一个 finally 回调，当队列中的任务全部执行完毕后执行
   */
  public finally(callback: () => void): TimeoutTaskQueue {
    this._finallyCallback.push(callback);
    return this;
  }

  /**
   * 运行一次任务队列(根据_state和_isRunning判断是否运行)
   */
  private _run(once = false): void {
    if (this._isRunning) {
      return;
    }
    if (this._queuedNumber === 0) {
      this._state = 'complete';
      return;
    }
    if (this._state === 'pending') {
      return;
    }
    this._isRunning = true;
    this._queuedNumber -= 1;
    this._createTaskQueue(once);
    this._promise[1]!();
  }

  /**
   * 执行一次任务
   */
  public runOnce(
    callback: (() => void) | false = () => {
      console.warn('TimeoutTaskQueue: This operation "runOnce" is invalid when the task is running');
    }
  ) {
    if (this._state === 'running' || this._isRunning) {
      callback && callback();
      return;
    }
    this._queuedNumber += 1;
    this._state = 'running';
    this._run(true);
  }

  /**
   * 添加运行任务到队列中
   * @param times 添加任务的次数
   */
  public addRunQueue(times = 1) {
    this._queuedNumber += times;
    this._state = 'pending';
  }

  /**
   * 开始执行任务
   */
  public start(): void {
    if (this._state === 'running') {
      console.warn('TimeoutTaskQueue: This operation "start" is invalid when the task is running');
      return;
    }
    if (this._state === 'complete') {
      return;
    }
    this._state = 'running';
    this._run();
  }

  /**
   * 暂停任务(正在运行的任务将继续运行至结束)
   */
  public pause(): void {
    if (this._state !== 'complete') this._state = 'pending';
  }

  /**
   * 任务状态
   * @returns {'pending' | 'complete' | 'running'}
   * @return pending: 运行队列有未完成任务, 当前已暂停(正在运行的任务将继续运行至结束)
   * @return complete: 运行队列没有未完成任务
   * @return running: 正在运行任务
   */
  public get state(): 'pending' | 'complete' | 'running' {
    return this._state;
  }

  /**
   * 运行队列中剩余的运行次数
   */
  public get remainingTimes(): number {
    return this._queuedNumber;
  }
}
