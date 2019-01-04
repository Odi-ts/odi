import * as fastify from 'fastify';
import * as cookie from 'fastify-cookie';

import { createServer, Server as HttpServer } from 'http';

import { ConnectionOptions, Connection } from "typeorm";
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
    };
    sources: string;
    database?: ConnectionOptions | 'ormconfig';
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
    protected database: Connection;

    protected options: CoreOptions;
    protected server: HttpServer;
    protected app: fastify.FastifyInstance;


    protected auth: typeof CoreAuth;


    constructor(options: CoreOptions){
        this.options = options;
        this.dependencyComposer = new DependencyComposer();
        
        this.app = fastify();   
        
        // Explicitly set AJV as schema compiler 
        this.app.setSchemaCompiler(shema => GAJV.compile(shema));
    }   

    private async setUp(): Promise<void>{
        if(this.options.database){
            this.database = await this.setDatabase();
        }

        this.dependencyComposer.putById(DB_CONNECTION, this.database);
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = this.app.server;
    }

    protected afterDependeciesLoad(){}
    
    protected setMiddleware(): void{
        this.app.register(cookie);
    }

    protected async setDatabase(): Promise<Connection> {
        const typeorm = await import("typeorm");
        const config = this.options.database === 'ormconfig' ? await typeorm.getConnectionOptions() : this.options.database!;    

        return typeorm.createConnection(config);        
    }

    private async loadDependencies(): Promise<void>{
        const { sources } = this.options;

        this.dependencyLoader = new DependencyManager({ sources });
        this.dependencyLoader.classify();        

        await this.dependencyLoader.compose(this.dependencyComposer, { app: this.app });
    }

    public async listen(fnc?: (err: Error, address: string) => void){
        await this.setUp();
        this.app.listen(this.options.server.port, (err, address) => fnc ? fnc(err, address) : null);
    }
    
}
