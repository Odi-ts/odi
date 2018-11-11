import * as Koa from 'koa';
import * as bodyparser from 'koa-bodyparser';


import { createServer, Server as HttpServer } from 'http';

/* Koa modules */
import { ConnectionOptions } from "typeorm";
import { CoreAuth } from '../auth/local/auth.interface';
import { DB_CONNECTION } from '../definitions';
import { DependencyClassifier } from '../dependency/dependency.processor';
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

    /* Treat like Connection */
    protected database: any;

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

        this.dependencyComposer.putById(DB_CONNECTION, this.database);
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = createServer(this.app.callback());
    }

    protected afterDependeciesLoad(){};
    
    protected setMiddleware(): void{
        this.app.use(bodyparser());
    }

    protected async setDatabase(): Promise<any> {
        try {
            const typeorm = await import("typeorm");
            
            return typeorm.createConnection(this.options.database!);
        } catch (error) {
            console.error(error);
            process.exit();
        }
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
