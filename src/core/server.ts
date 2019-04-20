import * as fastify from 'fastify';
import * as cookie from 'fastify-cookie';
import * as fstatic from 'fastify-static';

import { Server as HttpServer } from 'http';

import { CoreAuth } from '../auth/auth.interface';
import { DB_CONNECTION, REQ_CONTEXT, REQ_LOCALS } from '../definitions';
import { DependencyManager } from '../dependency/dependency.manager';
import DependencyComposer from '../dependency/dependency.composer';
import { GAJV } from '../dto/dto.storage';
import DependencyContainer from '../dependency/dependency.container';
import { ParcelOptions } from 'parcel-bundler';


export interface CoreOptions{
    server : {
        port: number,
        socket?: boolean | import('socket.io').ServerOptions,
        https?: boolean | {
            keyFile: string,
            certFile: string
        },
        proxy?: boolean,
        static?: {
            root: string;
            prefix?: string;
            serve?: boolean;
            decorateReply?: boolean;
            schemaHide?: boolean;
            setHeaders?: (...args: any[]) => void;
            redirect?: boolean;
            wildcard?: boolean;
        
            // Passed on to `send`
            acceptRanges?: boolean;
            cacheControl?: boolean;
            dotfiles?: boolean;
            etag?: boolean;
            extensions?: string[];
            immutable?: boolean;
            index?: string[];
            lastModified?: boolean;
            maxAge?: string | number;
        }
    };
    sources: string;
    database?: any | 'ormconfig';
    bundler?: ParcelOptions & {
        entryFile: string,
        containerId: string
    };
    /*
        dependencies  : {
            controllers: string,
            services: string,
            sockets: string
        }
    */
}

export class Core{
    private dependencyContainer: DependencyContainer;
    private dependencyComposer: DependencyComposer;
    private dependencyManager: DependencyManager;

    /* Treat like Connection */
    protected database?: any;
    protected socketio: SocketIO.Server;

    protected options: CoreOptions;
    protected server: HttpServer;
    protected app: fastify.FastifyInstance;


    protected auth: typeof CoreAuth;


    constructor(options: CoreOptions){
        this.options = options;

        this.dependencyContainer = DependencyContainer.getContainer();
        this.dependencyComposer = DependencyComposer.getComposer();
        this.dependencyManager = DependencyManager.getManager();
        
        this.app = fastify();  
        this.app.decorateRequest(REQ_CONTEXT, {}); 
        this.app.decorateRequest(REQ_LOCALS, { user: null });
        
        // Explicitly set AJV as schema compiler 
        this.app.setSchemaCompiler(shema => GAJV.compile(shema));
    }   

    private async setUp(): Promise<void>{

        if(this.options.bundler)
            await this.setBundler();

        if(this.options.server.static)
            this.app.register(fstatic, this.options.server.static);

        if(this.options.server.socket)
            this.socketio = await this.setSocketio();

        if(this.options.database)
            this.database = await this.setDatabase();
        

        this.dependencyContainer.putById(DB_CONNECTION, this.database);
        

        this.setMiddleware();
        await this.loadDependencies();        
        this.afterDependeciesLoad();

        this.server = this.app.server;       
    }

    protected afterDependeciesLoad(){}
    
    protected setMiddleware(): void{
        this.app.register(cookie);
    }

    protected async setDatabase(): Promise<any> {
        const typeorm = await import("typeorm");
        const config = this.options.database === 'ormconfig' ? await typeorm.getConnectionOptions() : this.options.database!;    

        return typeorm.createConnection(config);        
    }

    protected async setSocketio(): Promise<any> {
        const options = this.options.server.socket!;
        
        const socketio = await import("socket.io");
        return socketio(this.app.server as any,  typeof options === 'boolean' ? {} : options);
    }

    protected async setBundler(): Promise<any> {
        const ParcelBundler = await import('parcel-bundler');
        const { entryFile, containerId, ...options } = this.options.bundler!;
        
        const bundler = new ParcelBundler(entryFile, options);
        const bundle = await bundler.bundle();
    }

    private async loadDependencies(): Promise<void>{
        const { sources } = this.options;
        const { app, socketio } = this;

        this.dependencyManager.applyRoots({ app, socketio });
        this.dependencyManager.classify(sources);        
    
        await this.dependencyManager.compose();
    }

    public async listen(fnc?: (err: Error, address: string) => void){
        await this.setUp();
        this.app.listen(this.options.server.port, (err, address) => fnc ? fnc(err, address) : null);
    }
    
}
