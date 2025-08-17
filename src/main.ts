import { WorkerPool } from "./WorkerPool";

const additionWorkerPool = new WorkerPool({
  size: 3,
  workerPath: "./build/AdditionWorker.js",
});

const start = async () => {
  for (let i = 0; i < 5; i++) {
    additionWorkerPool
      .runTask({ a: 100, b: i })
      .then((ans) => console.log(ans))
      .catch((err) => console.log(err));
  }
};

start();
