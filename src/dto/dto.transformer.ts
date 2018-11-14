import { StrictObjectType } from "../utils/reflection/object.reflection";
import { getDtoProps, DtoPropsTypes } from "./dto.storage";
import { reflectType } from "../utils/directory.loader";

export function plainToClass<T>(target: StrictObjectType<T>, object: any) {
    return processClass(target, object);
}

function processClass<T extends any>(target: StrictObjectType<T>, objectPart: any) {
    const instance = new target();
    const ptorotype = Object.getPrototypeOf(instance);

    /* Copy fields that not participate in schema definition */
    Object.keys(objectPart).forEach(key => instance[key] = objectPart[key]);

    for(const property of getDtoProps(ptorotype))
       instance[property] = processProperty(instance, property, objectPart, ptorotype);

    return instance;
}

function processProperty<T>(instance: T, propertyKey: string, objectPart: any, prototype: any) {
    const type = reflectType(instance, propertyKey);
    const sourceValue = objectPart[propertyKey];
    const isPrimitive = [ Number, String, Boolean, Object ].includes(type);

    let value = undefined;
    
    if(type === Array) {
        value = DtoPropsTypes.has(prototype) && DtoPropsTypes.get(prototype)![propertyKey] ? processArray(DtoPropsTypes.get(prototype)![propertyKey], sourceValue) : sourceValue;

    } else if (isPrimitive)
        value = sourceValue;

    else if(typeof type === "function")
        value = processClass(type, sourceValue);

    return value;
}

function processArray<T>(target: StrictObjectType<T>, array: any[]) {
    return array.map(entry => processClass(target, entry));
}