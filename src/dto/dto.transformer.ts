import { Constructor, Instance } from "../types";
import { reflectType } from "../utils/directory.loader";
import { DtoPropsTypes, getDtoProps } from "./dto.storage";

export function plainToClass<T>(target: Constructor<T>, object: any) {
    return processClass(target, object);
}

function processClass<T>(target: Constructor<T>, objectPart: any) {
    const instance = new target();
    const ptorotype = Object.getPrototypeOf(instance);

    /* Copy fields that not participate in schema definition */
    Object.keys(objectPart).forEach((key) => (instance as any)[key] = objectPart[key]);

    for (const property of getDtoProps(ptorotype)) {
        (instance as any)[property] = processProperty(instance, property, objectPart, ptorotype);
    }

    return instance;
}

function processProperty<T>(instance: Instance, propertyKey: string | symbol, objectPart: any, prototype: any) {
    const type = reflectType(instance, propertyKey);
    const sourceValue = objectPart[propertyKey];
    const isPrimitive = [ Number, String, Boolean, Object ].includes(type);

    let value;

    if (type === Array) {
        value = DtoPropsTypes.has(prototype) && DtoPropsTypes.get(prototype)![propertyKey] ? processArray(DtoPropsTypes.get(prototype)![propertyKey], sourceValue) : sourceValue;

    } else if (isPrimitive) {
        value = sourceValue;
    } else if (typeof type === "function") {
        value = processClass(type, sourceValue);
    }

    return value;
}

function processArray<T>(target: Constructor<T>, array: any[]) {
    return array.map((entry) => processClass(target, entry));
}
