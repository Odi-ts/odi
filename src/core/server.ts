import * as Koa from 'koa';
import * as bodyparser from 'koa-bodyparser';
import * as compress from 'koa-compress';


import { createServer, Server as HttpServer } from 'http';

/* Koa modules */
import { Connection, ConnectionOptions, createConnection } from "typeorm";
import { CoreAuth } from '../auth/local/auth.interface';
import { DB_CONNECTION } from '../definitions';
import { DependencyClassifier } from '../dependency/dependency.classifier';
import DependencyComposer from '../dependency/dependency.composer';


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
    database?: ConnectionOptions
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
    private dependencyLoader: DependencyClassifier;


    protected database: Connection;
    protected options: CoreOptions;
    protected server: HttpServer;
    protected app: Koa;


    protected auth: typeof CoreAuth;


    constructor(options: CoreOptions){
        this.options = options;
        this.dependencyComposer = new DependencyComposer();
        
        this.app = new Koa();      
    }   

    private async setUp(): Promise<any>{
        if(this.options.database){
            this.database = await this.setDatabase();
        }

        this.dependencyComposer.put(DB_CONNECTION, this.database, 'default');
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = createServer(this.app.callback());
    }

    protected afterDependeciesLoad(){};
    
    protected setMiddleware(): void{
        this.app.use(compress());
        this.app.use(bodyparser());
    }

    protected setDatabase(): Promise<Connection> {
        return createConnection(this.options.database);
    }

    private async loadDependencies(): Promise<void>{
        this.dependencyLoader = new DependencyClassifier({
            dependencyComposer: this.dependencyComposer,
            rootPath: this.options.sources,
            app: this.app            
        });

        this.dependencyLoader.classify();        
        await this.dependencyLoader.compose();
    }

    public async listen(){
        await this.setUp();

        this.server.listen(this.options.server.port, (port: any) => console.log(`Server was successfully started on - ${this.options.server.port} port`));
    }
    
}
