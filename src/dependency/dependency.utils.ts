
import { Class } from "../utils/object.reflection";
import { ComponentEntry, TypelessComponentEntry } from "./dependency.decorators";
import { ComponentSettingsStorage } from "./dependency.manager";

export const onInit = Symbol('onInit');

export const autowiredPropsStore = new WeakMap<object, (string | symbol)[]>();


function shortSet<T extends Class>(classType: T, id: string, type: "singleton" | "scoped", { props, constructorArgs }: TypelessComponentEntry<T>) {
     /* Get other component versions */
     const prevSettings = ComponentSettingsStorage.get(classType) || {};
        
     /* Already aliased like constructor */
     ComponentSettingsStorage.set(classType, {
         ...prevSettings, [id]: {  
            type,
            props,
            constructorArgs: (constructorArgs as any)
         } 
     });
}

export function define<T extends Class> (classType: T) {
    const methods = {
        set(id: string, settings: ComponentEntry<T>) {
            /* Get other component versions */
            const prevSettings = ComponentSettingsStorage.get(classType) || {};
        
            /* Already aliased like constructor */
            ComponentSettingsStorage.set(classType, { ...prevSettings, [id]: settings });

            return methods;
        },
        setSingleton(id: string = 'default', settings: TypelessComponentEntry<T> = {}) {
            shortSet(classType, id, "singleton", settings);
            return methods;
        },
        setScoped(id: string = 'default', settings: TypelessComponentEntry<T> = {}) {
            shortSet(classType, id, "scoped", settings);
            return methods;
        }
    }

    return methods;
}

export function Hook() {
    return onInit;
}