import { AUTOWIRED, AUTOWIRED_PROPS, COMPONENT } from "../definitions";

import { Class } from "../utils/object.reflection";
import { isFunction } from "../utils/directory.loader";
import { autowiredPropsStore } from "./dependency.utils";
import { ValuedProps, ConstructorParameters } from "./dependency.manager";



export interface ComponentEntry<T extends Class> {
    id?: string
    type?: 'singleton' | 'pool',
    constructorArgs?: Partial<ConstructorParameters<T>>,
    props?: Partial<ValuedProps<InstanceType<T>>>
}

export interface ComponentSettings<T extends Class> {
    [index: string]: ComponentEntry<T>;
}

export const defaultEntry: ComponentEntry<any> = {
    id: 'default',
    type: 'singleton',
    constructorArgs: [],
    props: {}
}

export const defaultSettings: ComponentSettings<any> = {
    'default': defaultEntry
};

export const Autowired = (id?: string) => (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata(AUTOWIRED, id || true, target, propertyKey);

    if(isFunction(target,propertyKey)){
        return;
    }

    if(autowiredPropsStore.has(target))
        autowiredPropsStore.get(target)!.push(propertyKey);
    else
        autowiredPropsStore.set(target, [propertyKey]);
}

export const Component = () => (target: any) => Reflect.defineMetadata(COMPONENT, true, target);