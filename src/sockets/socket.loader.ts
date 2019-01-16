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

type HandlersMap = { [index: string]: string; };


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
            const nsp = this.options.socketio.of(base);

            instance['nsp'] = nsp;            
            instance['nsp'].on('connect', (socket: SocketIO.Socket) => {
                const isocketHandler: ISocket = this.bindController(instance); 
                isocketHandler['socket'] = socket;
                isocketHandler['onConnect']();

                socket.on('disconnect', reason => isocketHandler['onDisconnect'](reason));
                socket.on('error', error => isocketHandler['onError'](error));

                for(const [ eventName, method] of handlers) {
                    socket.on(eventName, (...args) => (isocketHandler as any)[method](...args));
                }
            });        

            container.put(classType, instance);
        }; 
    }

    private bindController(target: ISocket){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }

    private bindHandlers(instance : ISocket) {
        const map: HandlersMap = {};

        for(let method of reflectOwnProperties(instance)){
            let eventName: string = Reflect.getMetadata(SOCKET_EVENT, instance, method);

            if(eventName){
                map[eventName] = method;
            }
        }

        return Object.entries(map);
    }
}