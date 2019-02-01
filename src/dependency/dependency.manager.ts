import { FastifyInstance } from "fastify";
import { AuthLoader } from "../auth/local/auth.loader";

import { AUTH, CONTROLLER, REPOSITORY, SERVICE, SOCKET, WORKER, MAIN_COMPONENTS } from "../definitions";
import { ControllersLoader } from "../routing/controllers/controller.loader";
import { RepositoryLoader } from "../respositories/repository.loader";
import { ServicesLoader } from "../services/services.loader";
import { ILoader, inject } from "../utils/directory.loader";
import DependencyComposer from "./dependency.composer";
import SocketLoader from "../sockets/socket.loader";
import { Instance, Constructor } from "../types";
import { getType } from "mime";
import { WorkerLoader } from "../worker/worker.loader";

export enum DepType { 
    Controller,
    Service,
    Repository,
    Socket,   
    Auth,
    Worker,
    Custom
}

export const DepMap = {
    [CONTROLLER]: DepType.Controller,
    [REPOSITORY]: DepType.Repository,
    [SERVICE]: DepType.Service,
    [WORKER]: DepType.Worker,
    [SOCKET]: DepType.Socket,
    [AUTH]: DepType.Auth
};


export interface Options{
    sources : string | string[];
}

interface RootDeps {
    app: FastifyInstance;
    socketio?: SocketIO.Server;
}

interface Loaders{
    [index: string] : ILoader;
}

interface Queues{
    [index: string] : [Constructor, string][];
}

export class DependencyManager {
    private static manager: DependencyManager;

    private loaders: Loaders;
    private queues: Queues;
    private roots: RootDeps;

    private constructor() {
        this.queues = this.instansiateQueues();        
    }

    public static getManager() {
        if(!this.manager)
            this.manager = new DependencyManager();

        return this.manager;
    }
         

    public classify(sources: string | string[]): void{
        inject(sources, (target, path) => this.queues[this.getType(target)].push([ target, path ]));    
    }

    public getDeps(type: DepType) {
        return this.queues[type];
    }
    
    public applyRoots(rootDeps: RootDeps) {
        this.roots = rootDeps;
    }

    public async compose(): Promise<void>{
        this.loaders = this.instansiateLoaders();

        await this.processPart(DepType.Repository);
        // Log.completion(`${this.queues[DepType.Auth].length} Repositories was successfully loaded`);
        
        await this.processPart(DepType.Service);
        // Log.completion(`${this.queues[DepType.Service].length} Services were successfully loaded`);
        
        await this.processPart(DepType.Worker);
        // Log.completion(`${this.queues[DepType.Worker].length} Workers were successfully loaded`);

        await this.processPart(DepType.Auth);
        // Log.completion(`${this.queues[DepType.Auth].length} Auth was successfully loaded`);

        await this.processPart(DepType.Socket);
        // Log.completion(`${this.queues[DepType.Socket].length} Sockets was successfully loaded`);

        await this.processPart(DepType.Controller);       
        // Log.completion(`${this.queues[DepType.Controller].length} Controllers were successfully loaded`);       
    }

    public async processDep(dep: Constructor): Promise<Instance> {
        const type = this.getType(dep);
        const processor = await this.loaders[type].processBase();

        return processor(dep);
    }


    private async processPart(key: DepType): Promise<void>{
        if(!this.loaders[key] && this.queues[key].length > 0)
            throw Error(`${DepType[key]} processor doesn't exist. Install all required dependencies and fill configuration`);
        
        else if(!this.loaders[key])
            return;

        const processor = await this.loaders[key].processBase();

        for(const [ classType, filePath ] of this.queues[key])
            await processor(classType, filePath);
    }

    private instansiateLoaders(): Loaders{
        const dependencyComposer = DependencyComposer.getComposer();
        const { app, socketio } = this.roots;
        
        const loaders: Loaders =  ({
            [DepType.Auth]: new AuthLoader({ dependencyComposer }),
            [DepType.Service]: new ServicesLoader({ dependencyComposer }),
            [DepType.Controller]: new ControllersLoader({ dependencyComposer, app }),
            [DepType.Worker]: new WorkerLoader({ dependencyComposer}),
            [DepType.Repository]: new RepositoryLoader({ dependencyComposer }),
        });

        if(socketio)
            loaders[DepType.Socket] = new SocketLoader({ dependencyComposer, socketio });
    
        return loaders;
    }

    private instansiateQueues(): Queues{
        return {
            [DepType.Auth]: [],
            [DepType.Service]: [],
            [DepType.Controller]: [],
            [DepType.Repository]: [],
            [DepType.Worker]: [],
            [DepType.Socket]: []
        };
    }

    private getType(target: Instance | Function): DepType{
        let belongsTo = this.getRefer(target);

        for(const type of MAIN_COMPONENTS) 
            if(belongsTo(type))
                return DepMap[type];

        return DepType.Custom;
    }

    private getRefer(target: Instance | Function): (key: string) => boolean {
        return (identifier: string) => Reflect.hasMetadata(identifier, target);
    }

}