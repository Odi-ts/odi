import { ValidateFunction } from "ajv";
import { isFunction, isObject } from "util";
import { BODY_DTO, DATA_CLASS, DATA_CLASS_SCHEMA, DATA_VALIDATION_PROP, QUERY_DTO } from "../definitions";
import { Constructor, Propotype } from "../types";
import { DtoPropsStorage, DtoPropsTypes, DtoSchemaStorage, GAJV, getSchema } from "./dto.storage";
import { ValidatorFormat } from "./dto.type";
import { buildSchema } from "./dto.validator";

function dtoFactory(value: string): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(DATA_CLASS, value, target);

        // Build schema and write to global DTO
        Reflect.defineMetadata(DATA_CLASS_SCHEMA, buildSchema(target as Constructor), target);
    };
}

export function Data(): ClassDecorator {
    return dtoFactory(BODY_DTO);
}

export function Query(): ClassDecorator {
    return dtoFactory(QUERY_DTO);
}

export function validationFactory(object: object): PropertyDecorator {
    return (target: Propotype, propertyKey: string | symbol) => {
        const prev = Reflect.getMetadata(DATA_VALIDATION_PROP, target, propertyKey) || {};
        Reflect.defineMetadata(DATA_VALIDATION_PROP, { ...prev, ...object }, target, propertyKey);

        if (DtoPropsStorage.has(target)) {
            const props = DtoPropsStorage.get(target)!;

            if (!props.includes(propertyKey)) {
                props.push(propertyKey);
            }

        } else {
            DtoPropsStorage.set(target, [propertyKey]);
        }
    };
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
export const ArrayOf = (targetClass: any ) => (target: Propotype, propertyKey: string | symbol) => {
    const items =
            isObject(targetClass) ? targetClass :
            isFunction(targetClass) ? DtoSchemaStorage.get(targetClass) :
            { type: targetClass.name.toLoweCase() };

    validationFactory({ items })(target, propertyKey);

    /* Set array value */
    const prevTypes = DtoPropsTypes.get(target) || {};

    DtoPropsTypes.set(target, { ...prevTypes, [propertyKey]: targetClass });
};

export const UniqueItems = () => validationFactory({ uniqueItems: true });
export const MaxItems = (maxItems: number) => validationFactory({ maxItems });
export const MinItems = (minItems: number) => validationFactory({ minItems });

/* Nesting validations */
export const Nested = () => validationFactory({});

export const CustomValidation = (validate: ValidateFunction, params: any = true) => {
    const keyword = `odi_${new Date().getTime()}`;
    GAJV.addKeyword(keyword, {
        async: true,
        validate,
    });

    return validationFactory({ [keyword]: true });
};
