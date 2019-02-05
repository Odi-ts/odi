import { MessagePort } from 'worker_threads';

export interface WorkerRequest {
    id: number;
    messagePort: MessagePort;
    method: string;
    args: any[];
}

export interface WorkerResposne {
    id: number;
    threadId: number;
    result: any;
    error?: Error;
}

export interface WorkerHandlers {
    [index: number]: {
        reject: (reason?: any) => void;
        resolve: (value?: {} | PromiseLike<{}> | undefined) => void;
    };
}