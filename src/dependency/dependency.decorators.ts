import 'reflect-metadata';

import { AUTOWIRED, INJECT } from "../definitions";

import { Class } from "../utils/reflection/object.reflection";
import { isFunction } from "../utils/directory.loader";
import { autowiredPropsStore } from "./dependency.utils";
import { ValuedProps, ConstructorParameters } from "./dependency.store";

export interface ComponentEntry<T extends Class> {
    type?: 'singleton' | 'scoped',
    constructorArgs?: Partial<ConstructorParameters<T>>,
    props?: Partial<ValuedProps<InstanceType<T>>>
}

export interface TypelessComponentEntry<T extends Class> {
    constructorArgs?: Partial<ConstructorParameters<T>>,
    props?: Partial<ValuedProps<InstanceType<T>>>
}

export interface ComponentSettings<T extends Class> {
    [index: string]: ComponentEntry<T>;
}

export const defaultEntry: ComponentEntry<any> = {
    type: 'singleton',
    constructorArgs: [],
    props: {}
}

export const defaultSettings: ComponentSettings<any> = {
    'default': defaultEntry
};


export const Autowired = (id?: string) => (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(AUTOWIRED, id || "default", target, propertyKey);

    if(descriptor) {
        return;
    }

    if(autowiredPropsStore.has(target))
        autowiredPropsStore.get(target)!.push(propertyKey);
    else
        autowiredPropsStore.set(target, [propertyKey]);
}

export const Inject = (id: string = 'default') => (target: any, propertyKey: string | symbol, index: number) => {
    const prev = Reflect.getMetadata(INJECT, target, propertyKey) || {};
    
    Reflect.defineMetadata(INJECT, { ...prev, [index]: id }, target, propertyKey);
}
