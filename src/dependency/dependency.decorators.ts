import { AUTOWIRED, AUTOWIRED_PROPS, COMPONENT } from "../definitions";
import { isFunction } from "../utils/directory.loader";
import { autowiredPropsStore } from "./dependency.utils";

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