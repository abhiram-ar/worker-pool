import { Worker } from "node:worker_threads";

type TaskCallbacks = { resolve: (ops: any) => any; reject: (ops: any) => any };

interface ParameterizedWorker extends Worker {
  callback: TaskCallbacks | null;
}

export class WorkerPool {
  private _idleWorkers: ParameterizedWorker[] = [];
  private _workers: ParameterizedWorker[] = [];
  private readonly _taskQueue: (TaskCallbacks & { task: any })[] = []; // temp storage for a task while it is picked up by a worker
  private readonly _size: number;
  private readonly _workerPath: string;
  constructor(config: { size: number; workerPath: string }) {
    this._size = config.size;
    this._workerPath = config.workerPath;

    for (let i = 0; i < this._size; i++) {
      this._createWorker(this._workerPath);
    }
  }

  private readonly _createWorker = (workerPath: string) => {
    const worker = new Worker(workerPath) as ParameterizedWorker;

    worker.on("message", (result: any) => {
      if (!worker.callback) return;

      const { resolve } = worker.callback;

      worker.callback = null;
      this._idleWorkers.push(worker);
      resolve(result);

      this._runNextTask();
    });

    worker.on("error", (err) => {
      if (!worker.callback) return;
      const { reject } = worker.callback;

      worker.callback = null;
      this._idleWorkers.push(worker);
      reject(err);

      this._repawnWorker(worker); // replace the crashed worker
      this._runNextTask();
    });

    this._workers.push(worker);
    this._idleWorkers.push(worker);
  };

  public readonly runTask = (task: any) => {
    return new Promise((resolve, reject) => {
      if (this._idleWorkers.length > 0) {
        const worker = this._idleWorkers.pop();
        if (!worker) return;

        worker.callback = { reject, resolve };
        worker.postMessage(task);
      } else {
        this._taskQueue.push({ task, reject, resolve });
      }
    });
  };

  private readonly _runNextTask = () => {
    if (this._idleWorkers.length === 0 || this._taskQueue.length === 0) return;
    const task = this._taskQueue.shift();

    // satisfying the ts compiler
    if (!task) return;
    this.runTask(task.task).then(task.resolve).catch(task.reject);
  };

  private readonly _repawnWorker = (workerToReplace: ParameterizedWorker) => {
    this._workers = this._workers.filter(
      (worker) => worker !== workerToReplace
    );
    this._createWorker(this._workerPath);
    console.log("spawned replacement worker");
  };
}
