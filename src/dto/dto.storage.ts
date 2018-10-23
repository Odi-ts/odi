import { ValidateFunction } from 'ajv';
import ajv = require('ajv');

export const GAJV = ajv({ allErrors: true });

export const DtoSchemaStorage = new WeakMap<object, ValidateFunction>();
export const DtoPropsStorage = new WeakMap<object, (string | symbol)[]>();

export const getSchema = (target: any) => DtoSchemaStorage.has(target) ? DtoSchemaStorage.get(target)!.schema : {};