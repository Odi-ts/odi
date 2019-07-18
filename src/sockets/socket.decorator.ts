import "reflect-metadata";

import { SOCKET, SOCKET_EVENT } from "../definitions";
import { normalizeRoutePath } from "../routing/controllers/controller.utils";
import { Propotype } from "../types";

export type Namespace = string;
export type Event = string;

export function Socket(path: Namespace = "/"): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(SOCKET, normalizeRoutePath(path), target);
    };
}

export function OnEvent<T>(name: Event): MethodDecorator {
    return (target: Propotype, propertyKey: string | symbol) => {
        Reflect.defineMetadata(SOCKET_EVENT, name, target, propertyKey);
    };
}
