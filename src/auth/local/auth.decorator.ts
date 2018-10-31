import 'reflect-metadata'
import { AUTH, AUTH_MIDDLEWARE } from "../../definitions";

export interface AuthDefaults<T>{
    secret : string,
    expiration : string | number,
    header?: string
}

export function Authentication<T>(options?: AuthDefaults<T>): ClassDecorator{
    return (target: any) => Reflect.defineMetadata(AUTH, options, target)
}

export function Auth(options?: any): PropertyDecorator{
    return (target: any, propertyKey: string | symbol ) => Reflect.defineMetadata(AUTH_MIDDLEWARE, options, target, propertyKey);
}