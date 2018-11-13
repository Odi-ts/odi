import 'reflect-metadata'
import * as keys from '../../definitions';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;

export function CMiddleware(...functions: MiddlewareFunction[]): ClassDecorator {
  return (target: any) => Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target);
}

export function Middleware(...functions: MiddlewareFunction[]) {
  return (target: any, propertyKey: string | symbol) => Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target, propertyKey);
}