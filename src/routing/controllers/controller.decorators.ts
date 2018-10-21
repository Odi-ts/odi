import 'reflect-metadata';
import * as keys from '../../definitions'
import { IController } from './controller.interface';
import { ObjectType } from 'typeorm';
import { StrictObjectType } from '../../utils/object.reflection';
import { Method } from './controller.types';

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
    return Reflect.hasMetadata(keys.ROUTE, target, propertyKey) || Reflect.hasMetadata(keys.RAW_ROUTE, target, propertyKey);
}

export function handlerFactory(method: string): PropertyDecorator{
    return (target: any, propertyKey: string | symbol) => {
        let path = propertyKey.toString();

        if(path === 'index') 
            path = '/';

        if(path.charAt(0) !== '/')
            path = '/' + path;
        
        Reflect.defineMetadata(keys.ROUTE, { method, path }, target, propertyKey);
    };
}

function controllerFactory(path?: BasePath, options? : object) {
    let fmtdPath = !path || path === '/' ? '' : path;

    if((fmtdPath !== '') && fmtdPath.charAt(0) !== '/') {
        throw new Error(`Controller Parsing Error : ${path}. '/' should be at the beginning of the path.`);
    }

    if(fmtdPath.charAt(fmtdPath.length - 1) === '/')
        fmtdPath = fmtdPath.substring(0, fmtdPath.length - 1);
    
    return <T extends IController>(target: StrictObjectType<T>) => Reflect.defineMetadata(keys.CONTROLLER, { path: fmtdPath, ...options}, target);
}

export function Controller<T>(path? : BasePath){ 
    return controllerFactory(path, { type : ControllerType.Rest });    
}

export function RenderController<T>(path?: BasePath){
    return controllerFactory(path, { type: ControllerType.Render })
}

export function Data(): ClassDecorator {
    return (target: any) => Reflect.defineMetadata(keys.DATA_CLASS, true, target);
}

export function Route(method: Method, path: string = '/') {
    return (target: any, propertyKey: string | symbol) => Reflect.defineMetadata(keys.RAW_ROUTE, { method, path }, target, propertyKey);
}


/* Short bindings using method names */
export const All: RouteHandlerDecorator = handlerFactory('all');
export const Get: RouteHandlerDecorator = handlerFactory('get');
export const Put: RouteHandlerDecorator = handlerFactory('put');
export const Del: RouteHandlerDecorator = handlerFactory('delete');
export const Post: RouteHandlerDecorator = handlerFactory('post');
export const Patch: RouteHandlerDecorator = handlerFactory('patch');

/* Full route binding with alias to methods */
export const RouteAll = (path?: string) => Route(Method.ALL, path);
export const RouteGet = (path?: string) => Route(Method.GET, path);
export const RoutePut = (path?: string) => Route(Method.PUT, path);
export const RouteDel = (path?: string) => Route(Method.DELETE, path);
export const RoutePost = (path?: string) => Route(Method.POST, path);
export const RoutePatch = (path?: string) => Route(Method.PATCH, path);