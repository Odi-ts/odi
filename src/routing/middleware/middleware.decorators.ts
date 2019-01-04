import 'reflect-metadata';
import * as keys from '../../definitions';
import { Request, Response } from '../../aliases';
import { Propotype } from '../../types';

export type MiddlewareFunction = (req: Request, res: Response, next: () => void) => void;

export function Middleware(...functions: MiddlewareFunction[]) {
  return (target: Propotype, propertyKey?: string | symbol) => {
    if(propertyKey)
      return Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target, propertyKey);

    Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target);
  };
}