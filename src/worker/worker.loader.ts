import DependencyComposer from '../dependency/dependency.composer';
import DependencyContainer from '../dependency/dependency.container';

import { ILoader } from '../utils/directory.loader';
import { Constructor } from '../types';
import { WorkerHandlers, WorkerResposne } from './worker.types';
import { CustomLoader } from '../utils/loaders/custom.loader';


export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}


export class WorkerLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions) {}
    
    public async processBase() {
        let workerThreads: typeof import("worker_threads") | null ;

        try {
            workerThreads = await import('worker_threads');
        } catch (error) {
            workerThreads = null;
            
            console.error(`Worker threads is not supported in ${process.version} Node.Js version. Try to provide a flag, or update Node.js. Workers will be treated like custom components.`);
        }

        if(!workerThreads)
            return new CustomLoader().processBase();

        return async (classType: Constructor, filePath?: string) => {
            const predefined = DependencyContainer.getContainer().get(classType);

            if(predefined)
                return predefined;
           

            const worker = this.bindWorker(classType, filePath!, workerThreads!);
            DependencyContainer.getContainer().put(classType, worker);

            return worker;
        }; 
    }

    private bindWorker(classType: Constructor, filePath: string, workerThreads: typeof import("worker_threads")) {
     
        const instance = new classType();
           
        const storage: WorkerHandlers = [];
        const worker = new workerThreads.Worker(filePath!);
        const { port1, port2 } = new workerThreads.MessageChannel();

        worker.postMessage(port1, [ port1 ]);

        port2.on('message', (message: WorkerResposne) => {
            const handler = storage[message.id];

            if(!handler)
                throw Error('No handler specified');

            if(message.error)
                handler.reject(message.error);
            else 
                handler.resolve(message.result);
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
                    
                        port2.postMessage({ id, args, method });
                    });      
                else
                    return targetValue;
                                               
            }
        };
    
        return new Proxy(instance, handler);
    }
    
}