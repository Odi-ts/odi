import *  as io from  "socket.io"

import { RFunction, inject, reflectProperties, ILoader } from "../utils/directory.loader";
import { Namespace, Event } from "./socket.decorator";
import { SOCKET, SOCKET_EVENT } from "../definitions";
import { ISocket } from "./socket.interfaces";
import { StrictObjectType } from "../utils/object.reflection";


export interface LoaderOptions{
    directory : string,
    socketServer : SocketIO.Server
}

export default class ScoketLoader implements ILoader{

    constructor(readonly options: LoaderOptions){
        this.load();
    }


    public load(){
        inject(this.options.directory, this.processBase());
    }

    public processBase(): RFunction{
        return (classType: StrictObjectType<ISocket>) => {
            const instance = new classType();
            const base: Namespace = Reflect.getMetadata(SOCKET, instance['constructor']);      
      
            instance['nsp'] = this.options.socketServer.of(base);            
            instance['nsp'].on('connection', (socket: SocketIO.Socket): void => {
                /* Events handlers should go there */
                
                
            });        
        } 
    }


    private mapHandlers(instance : any): Map<string, { handler: Function, userFor?: boolean }>{
        let map: Map<string, { handler: Function, userFor?: boolean }> = new Map();

        for(let method of reflectProperties(instance)){
            let eventName: string = Reflect.getMetadata(SOCKET_EVENT, instance, method);
            
            if(eventName){
                map.set(eventName, {
                    handler :  (<any>instance)[method]
                });
            }
        }

        return map;
    }
}