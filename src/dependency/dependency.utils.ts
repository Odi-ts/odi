import { Constructor } from "../types";
import { ComponentEntry, TypelessComponentEntry } from "./dependency.decorators";
import { ComponentSettingsStorage } from "./dependency.store";

export const onInit = Symbol("onInit");

export const autowiredPropsStore = new WeakMap<object, Array<string | symbol>>();

function shortSet<T extends Constructor>(classType: T, id: string, type: "singleton" | "scoped", { props, constructorArgs }: TypelessComponentEntry<T>) {
     /* Get other component versions */
     const prevSettings = ComponentSettingsStorage.get(classType) || {};

     /* Already aliased like constructor */
     ComponentSettingsStorage.set(classType, {
         ...prevSettings, [id]: {
            type,
            props,
         },
     });
}

export function define<T>(classType: Constructor<T>) {
    const methods = {
        set(id: string, settings: ComponentEntry<Constructor<T>>) {
            /* Get other component versions */
            const prevSettings = ComponentSettingsStorage.get(classType) || {};

            /* Already aliased like constructor */
            ComponentSettingsStorage.set(classType, { ...prevSettings, [id]: settings });

            return methods;
        },
        setSingleton(id: string = "default", settings: TypelessComponentEntry<Constructor<T>> = {}) {
            shortSet(classType, id, "singleton", settings);
            return methods;
        },
        setScoped(id: string = "default", settings: TypelessComponentEntry<Constructor<T>> = {}) {
            shortSet(classType, id, "scoped", settings);
            return methods;
        },
    };

    return methods;
}

export function Hook() {
    return onInit;
}
