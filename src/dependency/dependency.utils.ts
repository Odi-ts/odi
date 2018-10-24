
import { Class } from "../utils/object.reflection";
import { ComponentEntry } from "./dependency.decorators";
import { ComponentSettingsStorage } from "./dependency.manager";

export const onInit = Symbol('onInit');

export const autowiredPropsStore = new WeakMap<object, (string | symbol)[]>();

export function define<T extends Class> (classType: T) {
    const methods = {
        set(id: string, settings: ComponentEntry<T>) {
            /* Get other component versions */
            const prevSettings = ComponentSettingsStorage.get(classType) || {};
        
            /* Already aliased like constructor */
            ComponentSettingsStorage.set(classType, { ...prevSettings, [id]: settings });

            return methods;
        }
    }

    return methods;
}