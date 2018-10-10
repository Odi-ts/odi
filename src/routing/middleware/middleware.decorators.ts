import 'reflect-metadata'
import * as keys from '../../definitions'

import { NextFunction, Response, Request } from 'express';

export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void

export function Middleware(...functions: MiddlewareFunction[]): PropertyDecorator{
    return (target: any, propertyKey: string | symbol) => {
      Reflect.defineMetadata(keys.ROUTE_MIDDLEWARE, functions, target, propertyKey)       
    };
}

