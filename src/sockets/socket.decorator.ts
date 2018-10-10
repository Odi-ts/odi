import { SOCKET, SOCKET_EVENT } from "../definitions";

export type Namespace = string;
export type Event = string;

export function Sockets(path: Namespace): ClassDecorator{
    return (target: any) => {
        target.prototype
        Reflect.defineMetadata(SOCKET, path, target)
    }
}

export function Event<T>(name: Event): MethodDecorator{
    return <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        Reflect.defineMetadata(SOCKET_EVENT, name, target, propertyKey)
    }
}

