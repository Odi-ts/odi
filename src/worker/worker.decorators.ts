import { WORKER } from "../definitions";
import { Constructor } from "../types";
import { getModule } from "../utils/env.tools";
import { WorkerRequest } from "./worker.types";

export function Worker() {
    return (target: Constructor) => {
        const workerThreads: typeof import ("worker_threads")  = getModule("worker_threads");
        const { isMainThread, parentPort, threadId } = workerThreads;

        if (isMainThread) {
            Reflect.defineMetadata(WORKER, true, target);

        } else {
            const instance = new target();

            if (!parentPort) {
                throw Error("No message port is availble");
            }

            parentPort.once("message", (port: import ("worker_threads").MessagePort) => {

                port.on("message", async ({ id, args, method }: WorkerRequest) => {
                    try {
                        const result = await instance[method](...args);
                        port!.postMessage({ id, result, threadId });

                    } catch {
                        port!.postMessage({ id, threadId, error: "Error while processing worker method" });
                    }
                });

            });
        }
    };
}
