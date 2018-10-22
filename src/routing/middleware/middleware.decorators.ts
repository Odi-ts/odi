import 'reflect-metadata'
import * as keys from '../../definitions'
import { IRouterContext } from '../../aliases';

export type MiddlewareFunction = (context: IRouterContext, next: () => Promise<any>) => void;

export function CMiddleware(...functions: MiddlewareFunction[]): ClassDecorator {
  return (target: any) => Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target);
}

export function Middleware(...functions: MiddlewareFunction[]) {
  return (target: any, propertyKey: string | symbol) => Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target, propertyKey);
}