import 'reflect-metadata';
import { AUTH, AUTH_MIDDLEWARE } from "../../definitions";

export interface AuthDefaults{
    secret? : string;
    expiration? : string | number;
    header?: string;
}

export function Authentication(options: AuthDefaults = {}): ClassDecorator{
    return (target: Function) => Reflect.defineMetadata(AUTH, options, target);
}

export function Auth(options?: unknown) {
    return (target: Function, propertyKey?: string | symbol ) => {
        if(propertyKey)
            return Reflect.defineMetadata(AUTH_MIDDLEWARE, options, target, propertyKey);

        Reflect.defineMetadata(AUTH_MIDDLEWARE, options, target);
    }; 
}