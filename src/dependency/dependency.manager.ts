import { AuthLoader } from "../auth/local/auth.loader";
import { AUTH, CONTROLLER, REPOSITORY, SERVICE, SOCKET } from "../definitions";
import { RepositoryLoader } from "../respositories/repository.loader";
import { ControllersLoader } from "../routing/controllers/controller.loader";
import { ServicesLoader } from "../services/services.loader";
import { ILoader, inject } from "../utils/directory.loader";
import DependencyComposer from "./dependency.composer";
import { FastifyInstance } from "fastify";

export enum DepType{ 
    Controller = 1,
    Service = 2,
    Repository = 3,
    Socket = 4,   
    Auth = 5,
    Custom = 6
}

export interface Options{
    sources : string
}

interface RootDeps {
    app: FastifyInstance;
}

interface Loaders{
    [index: string] : ILoader
}

interface Queues{
    [index: string] : any[];
}

export class DependencyManager {
    private loaders: Loaders;
    private queues: Queues;

    constructor(readonly options: Options) {
        this.queues = this.instansiateQueues();        
    }
        

    public classify(): void{
        inject(this.options.sources, target => this.queues[this.getType(target)].push(target));    
    }

    public getDeps(type: DepType) {
        return this.queues[type];
    }

    public async compose(dependencyComposer: DependencyComposer, deps: RootDeps): Promise<void>{
        this.loaders = this.instansiateLoaders(dependencyComposer, deps);

        await this.processPart(DepType.Repository);
        // Log.completion(`${this.queues[DepType.Auth].length} Repositories was successfully loaded`);
        
        await this.processPart(DepType.Service);
        // Log.completion(`${this.queues[DepType.Service].length} Services were successfully loaded`);
        
        await this.processPart(DepType.Auth);
        // Log.completion(`${this.queues[DepType.Auth].length} Auth was successfully loaded`);

        await this.processPart(DepType.Controller);       
        // Log.completion(`${this.queues[DepType.Controller].length} Controllers were successfully loaded`);       
    }


    private async processPart(key: DepType): Promise<void>{
        let processor = this.loaders[key].processBase();

        for(const classType of this.queues[key])
            await processor(classType);
    }

    private instansiateLoaders(dependencyComposer: DependencyComposer, { app }: RootDeps): Loaders{
        return ({
            [DepType.Auth]: new AuthLoader({ dependencyComposer }),
            [DepType.Service]: new ServicesLoader({ dependencyComposer }),
            [DepType.Repository]: new RepositoryLoader({ dependencyComposer }),
            [DepType.Controller]: new ControllersLoader({  dependencyComposer, app })
        });
    }

    private instansiateQueues(): Queues{
        return {
            [DepType.Auth]: [],
            [DepType.Service]: [],
            [DepType.Controller]: [],
            [DepType.Repository]: [],
            [DepType.Socket]: []
        }
    }

    private getType(target: any): DepType{
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

    private getRefer(target: any): (key: string) => boolean {
        return (identifier: string) => Reflect.hasMetadata(identifier, target)
    }

}