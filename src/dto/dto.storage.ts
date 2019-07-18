import * as ajv from "ajv";

import { isObject } from "util";
import { Constructor, Propotype } from "../types";

export const GAJV: ajv.Ajv = ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
});

(global as any).DtoSchemaStorage = new WeakMap<Constructor, object>();
(global as any).DtoPropsStorage = new WeakMap<Constructor, Array<string | symbol>>();
(global as any).DtoPropsTypes = new WeakMap<Constructor, { [key: string]: any }>();

export const DtoSchemaStorage = (global as any).DtoSchemaStorage ;
export const DtoPropsStorage = (global as any).DtoPropsStorage;

// Perfably
export const DtoPropsTypes = (global as any).DtoPropsTypes ;

export const getSchema = (target: Constructor | Propotype) => DtoSchemaStorage.has(target) ? DtoSchemaStorage.get(target)! : {};

export function getDtoProps(prototype: Constructor | Propotype): Array<string | symbol> {
    if (!prototype || !isObject(prototype)) {
        return [];
    }

    return [
        ...(DtoPropsStorage.get(prototype) || []),
        ...getDtoProps(Object.getPrototypeOf(prototype)),
    ];
}
