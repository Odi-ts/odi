import { FastifyInstance } from "fastify";
import { AuthLoader } from "../auth/local/auth.loader";

import { AUTH, CONTROLLER, REPOSITORY, SERVICE, SOCKET } from "../definitions";
import { ControllersLoader } from "../routing/controllers/controller.loader";
import { RepositoryLoader } from "../respositories/repository.loader";
import { ServicesLoader } from "../services/services.loader";
import { ILoader, inject } from "../utils/directory.loader";
import DependencyComposer from "./dependency.composer";
import SocketLoader from "../sockets/socket.loader";
import { Instance, Constructor } from "../types";

export enum DepType{ 
    Controller = 1,
    Service = 2,
    Repository = 3,
    Socket = 4,   
    Auth = 5,
    Custom = 6
}

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
    [index: string] : Constructor[];
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
        inject(sources, target => this.queues[this.getType(target)].push(target));    
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
        
        await this.processPart(DepType.Auth);
        // Log.completion(`${this.queues[DepType.Auth].length} Auth was successfully loaded`);

        await this.processPart(DepType.Socket);
        // Log.completion(`${this.queues[DepType.Socket].length} Sockets was successfully loaded`);

        await this.processPart(DepType.Controller);       
        // Log.completion(`${this.queues[DepType.Controller].length} Controllers were successfully loaded`);       
    }


    private async processPart(key: DepType): Promise<void>{
        if(!this.loaders[key] && this.queues[key].length > 0)
            throw Error(`${DepType[key]} processor doesn't exist. Install all required dependencies and fill configuration`);
        
        else if(!this.loaders[key])
            return;

        const processor = this.loaders[key].processBase();

        for(const classType of this.queues[key])
            await processor(classType);
    }

    private instansiateLoaders(): Loaders{
        const dependencyComposer = DependencyComposer.getComposer();
        const { app, socketio } = this.roots;
        
        const loaders: Loaders =  ({
            [DepType.Auth]: new AuthLoader({ dependencyComposer }),
            [DepType.Service]: new ServicesLoader({ dependencyComposer }),
            [DepType.Controller]: new ControllersLoader({ dependencyComposer, app }),

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
            [DepType.Socket]: []
        };
    }

    private getType(target: Instance | Function): DepType{
        let belongsTo = this.getRefer(target);
        let result = DepType.Custom;

        if(belongsTo(REPOSITORY))
            result = DepType.Repository;

        else if(belongsTo(SERVICE))
            result = DepType.Service;
            
        else if(belongsTo(CONTROLLER))
            result = DepType.Controller;    
        
        else if(belongsTo(SOCKET))
            result = DepType.Socket;

        else if(belongsTo(AUTH))
            result = DepType.Auth;

        return result;
    }

    private getRefer(target: Instance | Function): (key: string) => boolean {
        return (identifier: string) => Reflect.hasMetadata(identifier, target);
    }

}