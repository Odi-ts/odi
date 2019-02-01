import DependencyComposer from '../dependency/dependency.composer';
import DependencyContainer from '../dependency/dependency.container';

import { ILoader } from '../utils/directory.loader';
import { Constructor } from '../types';
import { WorkerHandlers, WorkerResposne } from './worker.types';
import { getModule } from '../utils/env.tools';


export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}


export class WorkerLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions) {}
    
    public async processBase() {
        const workerThreads = await import('worker_threads');

        return async (classType: Constructor, filePath?: string) => {
            const predefined = DependencyContainer.getContainer().get(classType);

            if(predefined)
                return predefined;
           

            const worker = this.bindWorker(classType, filePath!, workerThreads);
            DependencyContainer.getContainer().put(classType, worker);

            return worker;
        }; 
    }

    private bindWorker(classType: Constructor, filePath: string, workerThreads: any) {
     
        const instance = new classType();
           
        const storage: WorkerHandlers = [];
        const worker = new workerThreads.Worker(filePath!);
    
        worker.on('message', (message: WorkerResposne) => {

            if(!storage[message.id])
                throw Error('No handler specified');

            storage[message.id].resolve(message.result);
        });

        const handler: ProxyHandler<any> = {
            get(target, method, receiver) {    
                const targetValue = Reflect.get(target, method, receiver);

                if (typeof targetValue === 'function')                         
                    return (...args: any[]) => new Promise((resolve, reject) => {
                        const id = Date.now();
                        
                        storage[id] = {
                            resolve,
                            reject
                        };
                    
                        worker.postMessage({ id, args, method });
                    });      
                else
                    return targetValue;
                                               
            }
        };
    
        return new Proxy(instance, handler);
    }
    
}