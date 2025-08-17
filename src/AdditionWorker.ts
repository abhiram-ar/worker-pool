import { parentPort } from "worker_threads";

parentPort?.on("message", (ops: { a: number; b: number }) => {
  const errChance = Math.random();
  if (errChance > 0.5) throw new Error("Error while finding sum");

  const res = ops.a + ops.b;
  parentPort?.postMessage(res);
});
