import * as fastify from 'fastify';
import * as cookie from 'fastify-cookie'

import { FastifyInstance } from 'fastify';
import { createServer, Server as HttpServer } from 'http';

import { ConnectionOptions } from "typeorm";
import { CoreAuth } from '../auth/local/auth.interface';
import { DB_CONNECTION } from '../definitions';
import { DependencyManager } from '../dependency/dependency.manager';
import DependencyComposer from '../dependency/dependency.composer';
import { GAJV } from '../dto/dto.storage';


export interface CoreOptions{
    server : {
        port: number,
        https?: boolean | {
            keyFile: string,
            certFile: string
        },
        proxy?: boolean
    },
    sources: string,
    database?: ConnectionOptions | 'ormconfig'
    /*
        dependencies  : {
            controllers: string,
            services: string,
            sockets: string
        }
    */
}

export class Core{
    private dependencyComposer: DependencyComposer;
    private dependencyLoader: DependencyManager;

    /* Treat like Connection */
    protected database: any;

    protected options: CoreOptions;
    protected server: HttpServer;
    protected app: FastifyInstance;


    protected auth: typeof CoreAuth;


    constructor(options: CoreOptions){
        this.options = options;
        this.dependencyComposer = new DependencyComposer();
        
        this.app = fastify();   
        
        // Explicitly set AJV as schema compiler 
        this.app.setSchemaCompiler(shema => GAJV.compile(shema))
    }   

    private async setUp(): Promise<any>{
        if(this.options.database){
            this.database = await this.setDatabase();
        }

        this.dependencyComposer.putById(DB_CONNECTION, this.database);
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = this.app.server;
    }

    protected afterDependeciesLoad(){};
    
    protected setMiddleware(): void{
        this.app.register(cookie);
    }

    protected async setDatabase(): Promise<any> {
        const typeorm = await import("typeorm");
        const config = this.options.database === 'ormconfig' ? await typeorm.getConnectionOptions() : this.options.database!;    

        return typeorm.createConnection(config);        
    }

    private async loadDependencies(): Promise<void>{
        this.dependencyLoader = new DependencyManager({
            dependencyComposer: this.dependencyComposer,
            rootPath: this.options.sources,
            app: this.app            
        });

        this.dependencyLoader.classify();        
        await this.dependencyLoader.compose();
    }

    public async listen(fnc?: any){
        await this.setUp();
        this.server.listen(this.options.server.port, fnc);
    }
    
}
