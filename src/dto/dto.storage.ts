import * as ajv from 'ajv';

import { Ajv } from 'ajv';
import { isObject } from 'util';


export const GAJV: Ajv = ajv({
    removeAdditional: true,
    useDefaults: true, 
    coerceTypes: true
});


(global as any).DtoSchemaStorage = new WeakMap<object, object>();
(global as any).DtoPropsStorage = new WeakMap<object, (string | symbol)[]>();
(global as any).DtoPropsTypes = new WeakMap<object, { [key: string]: any }>();


export const DtoSchemaStorage = (global as any).DtoSchemaStorage ;
export const DtoPropsStorage = (global as any).DtoPropsStorage;

// Perfably
export const DtoPropsTypes = (global as any).DtoPropsTypes ;

export const getSchema = (target: any) => DtoSchemaStorage.has(target) ? DtoSchemaStorage.get(target)! : {};

export function getDtoProps(prototype: any): any[]{
    if(!prototype || !isObject(prototype)){
        return [];
    }

    return [
        ...(DtoPropsStorage.get(prototype) || []), 
        ...getDtoProps(Object.getPrototypeOf(prototype))
    ]
}