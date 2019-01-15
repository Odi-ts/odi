import { RFunction, reflectProperties, ILoader } from "../utils/directory.loader";
import { Namespace } from "./socket.decorator";
import { SOCKET, SOCKET_EVENT } from "../definitions";
import { ISocket } from "./socket.interfaces";
import { Constructor } from "../types";
import DependencyComposer from "../dependency/dependency.composer";
import { metadata } from "../utils/metadata.utils";


export interface LoaderOptions{
    directory : string;
    socketServer : SocketIO.Server;
    dependencyComposer: DependencyComposer;
}

export default class ScoketLoader implements ILoader{

    constructor(readonly options: LoaderOptions) {}

    public processBase(): RFunction {
        return async (classType: Constructor) => {
            const sckMeta = metadata(classType);  
            const base: Namespace = sckMeta.getMetadata(SOCKET);      

            const instance: ISocket = await this.options.dependencyComposer.instanciateClassType(classType);
            const handlers = this.bindHandlers(instance);

            instance['nsp'] = this.options.socketServer.of(base);            
            instance['nsp'].on('connection', (socket: SocketIO.Socket) => {
                const isocketHandler: ISocket = this.bindController(instance); 
                isocketHandler['socket'] = socket;

                socket.on('disconnect', reason => isocketHandler['onDisconnect'](reason));
                socket.on('error', error => isocketHandler['onError'](error));

                for(const [ event, { handler }] of handlers)
                    socket.on(event, () => handler.call(isocketHandler));

                
            });        
        }; 
    }

    private bindController(target: ISocket){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }


    private bindHandlers(instance : ISocket) {
        let map: Map<string, { handler: Function, userFor?: boolean }> = new Map();

        for(let method of reflectProperties(instance)){
            let eventName: string = Reflect.getMetadata(SOCKET_EVENT, instance, method);
            
            if(eventName){
                map.set(eventName, {
                    handler :  (<any>instance)[method]
                });
            }
        }

        return map.entries();
    }
}