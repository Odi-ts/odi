import * as shortid from 'shortid';

import { ValidateFunction } from 'ajv';
import { DATA_CLASS, DATA_VALIDATION_PROP, BODY_DTO, QUERY_DTO, DATA_CLASS_SCHEMA } from "../definitions";
import { ValidatorFormat } from "./dto.type";
import { buildSchema } from "./dto.validator";
import { DtoPropsStorage, getSchema, GAJV, DtoPropsTypes } from "./dto.storage";

function dtoFactory(value: string) {
    return (target: any) => {
        Reflect.defineMetadata(DATA_CLASS, value, target);

        // Build schema and write to global DTO
        Reflect.defineMetadata(DATA_CLASS_SCHEMA, buildSchema(target), target)
    };
}

export function Data(): ClassDecorator {
    return dtoFactory(BODY_DTO);
}

export function Query(): ClassDecorator {
    return dtoFactory(QUERY_DTO);
}

export function validationFactory(object: any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const prev = Reflect.getMetadata(DATA_VALIDATION_PROP, target, propertyKey) || {};
        Reflect.defineMetadata(DATA_VALIDATION_PROP, { ...prev, ...object }, target, propertyKey);
        
        if(DtoPropsStorage.has(target)) {
            const props = DtoPropsStorage.get(target)!;
           
            if(!props.includes(propertyKey))
                props.push(propertyKey);
                
        } else {
            DtoPropsStorage.set(target, [propertyKey]);
        }
    }
}

/* Number validations */
export const Maximum = (maximum: number) => validationFactory({ maximum });
export const Minimum = (minimum: number) => validationFactory({ minimum });

export const ExclusiveMinimum = (exclusiveMinimum: number) => validationFactory({ exclusiveMinimum });
export const ExclusiveMaximum  = (exclusiveMaximum: number) => validationFactory({ exclusiveMaximum });

export const MultipleOf = (multipleOf: number) => validationFactory({ multipleOf });

/* String validations */
export const MaxLength = (maxLength: number) => validationFactory({ maxLength });
export const MinLength = (minLength: number) => validationFactory({ minLength });

export const Pattern = (pattern: string) => validationFactory({ pattern });
export const Format = (format: ValidatorFormat) => validationFactory({ format });

export const IsEmail = () => validationFactory({ format: "email" });
export const IsUrl = () => validationFactory({ format: "url" });

/* General validations */
export const Enum = (enumrable: any[]) => validationFactory({ enum: enumrable });
export const Const = (val: any) => validationFactory({ const: val });
export const IsOptional = () => validationFactory({ isOptional: true });
export const IsRequired = () => validationFactory({});
export const Deafault = <T>(def: T) => validationFactory({ default: def });

/* Array validaitons */
export const ArrayOf = (targetClass: any) => (target: any, propertyKey: string | symbol) => {
    const items = getSchema(target);

    validationFactory({ items })(target, propertyKey);
   
    /* Set array value */
    const prevTypes = DtoPropsTypes.get(target) || {};

    DtoPropsTypes.set(target, { ...prevTypes, [propertyKey]: targetClass });
}

export const UniqueItems = () => validationFactory({ uniqueItems: true });
export const MaxItems = (maxItems: number) => validationFactory({ maxItems });
export const MinItems = (minItems: number) => validationFactory({ minItems });

/* Nesting validations */
export const Nested = () => validationFactory({});

export const CustomValidation = (validate: ValidateFunction, params: any = true) => {
    const keyword = `odi_${shortid().toLowerCase()}`;
    GAJV.addKeyword(keyword, {
        async: true,
        validate
    });

    return validationFactory({ [keyword]: true })
};
