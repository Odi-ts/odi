import { RFunction, reflectProperties, ILoader, reflectOwnProperties } from "../utils/directory.loader";
import { Namespace } from "./socket.decorator";
import { SOCKET, SOCKET_EVENT } from "../definitions";
import { ISocket } from "./socket.interfaces";
import { Constructor } from "../types";
import DependencyComposer from "../dependency/dependency.composer";
import { metadata } from "../utils/metadata.utils";
import DependencyContainer from "../dependency/dependency.container";


export interface LoaderOptions{
    socketio : SocketIO.Server;
    dependencyComposer: DependencyComposer;
}

export default class SocketLoader implements ILoader{

    constructor(readonly options: LoaderOptions) {}

    public processBase() {
        const container = DependencyContainer.getContainer();

        return async (classType: Constructor) => {
            if(container.contain(classType))
                return;

            const sckMeta = metadata(classType);  
            const base: Namespace = sckMeta.getMetadata(SOCKET);      

            const instance: ISocket = await this.options.dependencyComposer.instanciateClassType(classType);
            const handlers = this.bindHandlers(instance);

            instance['nsp'] = this.options.socketio.of(base);            
            instance['nsp'].on('connect', (socket: SocketIO.Socket) => {
                const isocketHandler: ISocket = this.bindController(instance); 
                isocketHandler['socket'] = socket;

                socket.on('disconnect', reason => isocketHandler['onDisconnect'](reason));
                socket.on('error', error => isocketHandler['onError'](error));

                for(const [ event, { handler }] of handlers) {
                    socket.on(event, () => handler.call(isocketHandler));
                }
            });        

            container.put(classType, instance);
        }; 
    }

    private bindController(target: ISocket){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }

    private bindHandlers(instance : ISocket) {
        let map: Map<string, { handler: Function, userFor?: boolean }> = new Map();

        for(let method of reflectOwnProperties(instance)){
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