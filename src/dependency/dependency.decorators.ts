import "reflect-metadata";

import { AUTOWIRED, INJECT } from "../definitions";

import { isObject } from "util";
import { Constructor, Instance, Propotype } from "../types";
import { ConstructorParameters, ValuedProps } from "./dependency.store";
import { autowiredPropsStore } from "./dependency.utils";

export interface ComponentEntry<T extends Constructor> {
    type?: "singleton" | "scoped";
    constructorArgs?: Partial<ConstructorParameters<T>>;
    props?: Partial<ValuedProps<InstanceType<T>>>;
}

export interface TypelessComponentEntry<T extends Constructor> {
    constructorArgs?: Partial<ConstructorParameters<T>>;
    props?: Partial<ValuedProps<InstanceType<T>>>;
}

export interface ComponentSettings<T extends Constructor> {
    [index: string]: ComponentEntry<T>;
}

export const defaultEntry: ComponentEntry<Constructor> = {
    type: "singleton",
    constructorArgs: [],
    props: {},
};

export const defaultSettings: ComponentSettings<Constructor> = {
    default: defaultEntry,
};

export const Autowired = (id: string = "default") => (target: Propotype, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(AUTOWIRED, id, target, propertyKey);

    if (descriptor) {
        return;
    }

    if (autowiredPropsStore.has(target)) {
        autowiredPropsStore.get(target)!.push(propertyKey);
    }
    else {
        autowiredPropsStore.set(target, [propertyKey]);
    }
};

export const Inject = (id: string = "default") => (target: Propotype, propertyKey: string | symbol, descriptor?: PropertyDescriptor | number) => {
    if (isObject(descriptor) || descriptor) {
        return Autowired(id)(target, propertyKey, descriptor as PropertyDescriptor);
    }

    const prev = Reflect.getMetadata(INJECT, target, propertyKey) || {};

    Reflect.defineMetadata(INJECT, { ...prev, [descriptor as number]: id }, target, propertyKey);
};
