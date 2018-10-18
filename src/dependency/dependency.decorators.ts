import { AUTOWIRED, AUTOWIRED_PROPS, COMPONENT } from "../definitions";

import { Class } from "../utils/object.reflection";
import { isFunction } from "../utils/directory.loader";
import { autowiredPropsStore } from "./dependency.utils";

export interface ComponentEntry<T extends Class> {
    type?: 'singleton' | 'pool',
    constructorArgs: ConstructorParameters<T>,
    props: Partial<T>
}

export interface ComponentSettings<T extends Class> {
    [index: string]: ComponentEntry<T>;
}


const defaultSettings: ComponentSettings<any> = {
    'default': {
        type: 'singleton',
        constructorArgs: [],
        props: {}
    } 
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

export const Component = <T extends Class>(settings: ComponentSettings<T> = defaultSettings) => (target: any) => Reflect.defineMetadata(COMPONENT, settings, target);