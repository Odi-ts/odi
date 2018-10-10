import 'reflect-metadata'
import { time } from 'uniqid'

import { CoreAuth } from "./auth.interface";
import { AUTH, AUTH_MIDDLEWARE, INJECT_ID } from "../../definitions";
import { ObjectType } from '../../utils/object.reflection';

export interface AuthDefaults<T>{
    secret : string,
    expiration : string | number,
    containerAlias : string
}

export function Authentication<T>(options: AuthDefaults<T>): ClassDecorator{
    return (target: any) => {
        Reflect.defineMetadata(AUTH, options, target)
    }
}

export function Auth(options?: any): PropertyDecorator{
    return (target: any, propertyKey: string | symbol ) => {
        Reflect.defineMetadata(AUTH_MIDDLEWARE, options, target, propertyKey);
    };
}