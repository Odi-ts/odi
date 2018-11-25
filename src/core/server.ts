import * as express from 'express';

import * as bodyparser from 'body-parser';
import * as cookieparser from 'cookie-parser';

import { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';

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
    protected app: Application;


    protected auth: typeof CoreAuth;


    constructor(options: CoreOptions){
        this.options = options;
        this.dependencyComposer = new DependencyComposer();
        
        this.app = express();      
    }   

    private async setUp(): Promise<any>{
        if(this.options.database){
            this.database = await this.setDatabase();
        }

        this.dependencyComposer.putById(DB_CONNECTION, this.database);
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = createServer(this.app);
    }

    protected afterDependeciesLoad(){};
    
    protected setMiddleware(): void{
        this.app.use(bodyparser.json(), bodyparser.urlencoded({ extended: true }));
        this.app.use(cookieparser());
    }

    protected async setDatabase(): Promise<any> {
        const typeorm = await import("typeorm");
            
        return typeorm.createConnection(this.options.database!);        
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

    public async listen(fnc?: any){
        await this.setUp();
        this.server.listen(this.options.server.port, fnc);
    }
    
}
