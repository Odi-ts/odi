import "reflect-metadata";

import { DATA_CLASS, DATA_VALIDATION_PROP } from "../definitions";
import { Constructor, Instance } from "../types";
import { reflectType } from "../utils/directory.loader";
import { metadata } from "../utils/metadata.utils";
import { DtoSchemaStorage, getDtoProps, getSchema } from "./dto.storage";

function extractBase(type: Constructor) {
    let base: any = { type: null };

    if (type === String) {
        base.type = "string";
    }

    else if (type === Number) {
        base.type = "number";
         }

    else if (type === Boolean) {
        base.type = "boolean";
         }

    else if (type === Array) {
        base.type = "array";
         }

    else if (type === Date) {
        base.type = "string";
        base.format = "date-time";

    } else {
        if (Reflect.hasMetadata(DATA_CLASS, type)) {
            const nestedSchema = getSchema(type);

            base = {
                type: "object",
                ...(nestedSchema as object),
            };
        } else {
            base = { type: "object" };
        }
    }

    return base;
}

export function buildSchema(target: Constructor) {
    const instance = new target();
    const reflectedProperties = (getDtoProps(Object.getPrototypeOf(instance)));

    let requiredProperties = [...reflectedProperties];
    let properties = {};

    for (const propertyKey of reflectedProperties) {
        const type = reflectType(instance, propertyKey);
        const schema = metadata(instance, propertyKey).getMetadata(DATA_VALIDATION_PROP);

        if (schema.isOptional === true) {
            requiredProperties = requiredProperties.filter((elem) => elem !== propertyKey);
            delete schema.isOptional;
        }

        properties = {
            ...properties,
            [propertyKey]: {
                ...extractBase(type),
                ...schema,
            },
        };
    }

    const schema: object  = {
        type: "object",
        properties,
        required: requiredProperties,
    };

    DtoSchemaStorage.set(target, schema);
    return schema;
}
