import 'reflect-metadata'
import * as keys from '../../definitions';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;

export function Middleware(...functions: MiddlewareFunction[]) {
  return (target: any, propertyKey?: string | symbol) => {
    if(propertyKey)
      return Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target, propertyKey);

    Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target);
  };
}