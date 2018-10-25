import 'reflect-metadata'

import { INJECT_ID, SERVICE } from '../definitions';
import { ObjectType } from '../utils/object.reflection';

export function Service<T>(model?: ObjectType<T>): ClassDecorator{
    return (target: any) => {
       Reflect.defineMetadata(SERVICE, model, target);
       Reflect.defineMetadata(INJECT_ID, 'default', target);
    }
}