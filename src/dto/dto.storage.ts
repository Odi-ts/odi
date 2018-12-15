import { ValidateFunction } from 'ajv';
import { isObject } from 'util';


export const GAJV = require('ajv')({ allErrors: true });

export const DtoSchemaStorage = new WeakMap<object, object>();
export const DtoPropsStorage = new WeakMap<object, (string | symbol)[]>();

/* Perfably  */
export const DtoPropsTypes = new WeakMap<object, { [key: string]: any }>();


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