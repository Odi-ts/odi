import { SOCKET, SOCKET_EVENT } from "../definitions";
import { Propotype } from "../types";

export type Namespace = string;
export type Event = string;

export function Socket(path: Namespace): ClassDecorator{
    return (target: Function) => {
        Reflect.defineMetadata(SOCKET, path, target);
    };
}

export function Event<T>(name: Event): MethodDecorator{
    return (target: Propotype, propertyKey: string | symbol) => {
        Reflect.defineMetadata(SOCKET_EVENT, name, target, propertyKey);
    };
}


