import { Constructor } from "../types";
import { WORKER_CLASS } from '../definitions';
import { WorkerRequest } from './worker.types';
import { getModule } from "../utils/env.tools";


export function Worker() {
    return (target: Constructor) => {
        const workerThreads:  typeof import('worker_threads')  = getModule('worker_threads');
        const { isMainThread, parentPort, threadId } = workerThreads; 

        if(isMainThread) {
            Reflect.defineMetadata(WORKER_CLASS, true, target);

        } else {
            const instance = new target();
            
            if(!parentPort)
                throw Error("No message port is availble");

            parentPort.on('message', async ({ id, args, method }: WorkerRequest) => {
                const result = await instance[method](...args);

                parentPort!.postMessage({ id, result, threadId });
            });
        }
    };
}