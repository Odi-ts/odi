import *  as io from  "socket.io"

import { Server } from "http";
import { RFunction, inject, reflectProperties, ILoader } from "../utils/directory.loader";
import { Namespace, Event } from "./socket.decorator";
import { SOCKET, SOCKET_EVENT } from "../definitions";
import { ISocket } from "./socket.interfaces";


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
        return (classType: any) => {
            let instance = new classType();
            let base: Namespace = Reflect.getMetadata(SOCKET, instance['constructor']);      
      
            (<ISocket>instance)['nsp'] = this.options.socketServer.of(base);            
            (<ISocket>instance)['nsp'].on('connection', (socket: SocketIO.Socket): void => {
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