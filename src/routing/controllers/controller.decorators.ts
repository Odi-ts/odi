import "reflect-metadata";
import * as keys from "../../definitions";

import { Constructor, Instance, Propotype } from "../../types";
import { IController } from "./controller.interface";
import { Method } from "./controller.types";
import { normalizeRoutePath } from "./controller.utils";

export type BasePath = string;
export type RouteHandler = (...args: any[]) => any | void;

export enum ControllerType {
    Rest,
    Render,
}
export interface ControllerMeta {
    path: string;
    type?: ControllerType;
}

export enum Returning {
    Void,
}

export type RouteHandlerDecorator = PropertyDecorator;

export interface RouteMetadata {
    method: "get" | "post" | "all" | "delete" | "put" | "patch" | "head" | "options";
    path: string;
    args: string[];
}

export function isRouteHandler(target: Instance, propertyKey: string) {
    return Reflect.hasMetadata(keys.ROUTE, target, propertyKey) || Reflect.hasMetadata(keys.RAW_ROUTE, target, propertyKey);
}

// Factories
export function controllerFactory(route?: BasePath, options?: object) {
    const path = normalizeRoutePath(route || "/");

    return <T extends IController>(target: Constructor<T>) => Reflect.defineMetadata(keys.CONTROLLER, { path, ...options }, target);
}

export function handlerFactory(method: string): PropertyDecorator {
    return (target: Propotype, propertyKey: string | symbol) => {
        const path = normalizeRoutePath(propertyKey.toString());

        Reflect.defineMetadata(keys.ROUTE, { method, path }, target, propertyKey);
    };
}

// Decorators
export function Route(method: Method, route: string = "/"): PropertyDecorator {
    const path = normalizeRoutePath(route);

    return (target: Propotype, propertyKey: string | symbol) => Reflect.defineMetadata(keys.RAW_ROUTE, { method, path }, target, propertyKey);
}

export function Controller(path?: BasePath ) {
    return controllerFactory(path, { type : ControllerType.Rest });
}

/* Short bindings using method names */
export const All: RouteHandlerDecorator = handlerFactory("all");
export const Get: RouteHandlerDecorator = handlerFactory("get");
export const Put: RouteHandlerDecorator = handlerFactory("put");
export const Del: RouteHandlerDecorator = handlerFactory("delete");
export const Post: RouteHandlerDecorator = handlerFactory("post");
export const Patch: RouteHandlerDecorator = handlerFactory("patch");

/* Full route binding with alias to methods */
export const RouteAll = (path?: string) => Route(Method.ALL, path);
export const RouteGet = (path?: string) => Route(Method.GET, path);
export const RoutePut = (path?: string) => Route(Method.PUT, path);
export const RouteDel = (path?: string) => Route(Method.DELETE, path);
export const RoutePost = (path?: string) => Route(Method.POST, path);
export const RoutePatch = (path?: string) => Route(Method.PATCH, path);
