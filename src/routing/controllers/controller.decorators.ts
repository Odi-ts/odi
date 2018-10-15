import 'reflect-metadata';
import * as keys from '../../definitions'
import { IController } from './controller.interface';
import { ObjectType } from 'typeorm';
import { StrictObjectType } from '../../utils/object.reflection';

export type BasePath = string;
export type RouteHandler = (...args: any[]) => any | void;
export enum ControllerType{
    Rest,
    Render
} 
export interface ControllerMeta{
    path: string,  
    type? : ControllerType
}

export enum Returning{
    Void
}

export type RouteHandlerDecorator = PropertyDecorator;


export interface RouteMetadata {
    method: 'get' | 'post' | 'all' | 'delete' | 'put' | 'patch' | 'head' | 'options',
    path: string,
    args: string[]
}

export function isRouteHandler(target: any, propertyKey: string){
    return Reflect.hasMetadata(keys.ROUTE, target, propertyKey)
}

export function handlerFactory(method: string): PropertyDecorator{
    return (target: any, propertyKey: string | symbol) => {
        let path = propertyKey.toString();

        if(path.charAt(0) !== '/'){
            path = '/' + path;
        }    

        Reflect.defineMetadata(keys.ROUTE, { method, path }, target, propertyKey);
    };
}

function controllerFactory(path?: BasePath, options? : object){
    path = !path || path === '/' ? '' : path;

    if((path !== '') && path.charAt(0) !== '/'){
        throw new Error(`Controller Parsing Error : ${path}. '/' should be at the beginning of the path.`);
    }

    return <T extends IController>(target: StrictObjectType<T>) => Reflect.defineMetadata(keys.CONTROLLER, { path, ...options}, target);
}

export function Controller<T>(path? : BasePath){ 
    return controllerFactory(path, { type : ControllerType.Rest });    
}

export function RenderController<T>(path?: BasePath){
    return controllerFactory(path, { type: ControllerType.Render })
}


export const Get: RouteHandlerDecorator = handlerFactory('get');
export const Post: RouteHandlerDecorator = handlerFactory('post');
export const Any: RouteHandlerDecorator = handlerFactory('any');