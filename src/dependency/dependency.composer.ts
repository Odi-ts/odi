import { isObject } from "util";
import { AUTOWIRED, INJECT, INJECT_ID } from "../definitions";
import { Constructor, Instance } from "../types";
import { reflectOwnProperties, reflectParameters, reflectType } from "../utils/directory.loader";
import { metadata } from "../utils/metadata.utils";
import { isNull } from "../utils/object.utils";
import DependencyContainer from "./dependency.container";
import { ComponentEntry, defaultEntry } from "./dependency.decorators";
import { DependencyManager } from "./dependency.manager";
import { ComponentSettingsStorage } from "./dependency.store";
import { autowiredPropsStore, onInit } from "./dependency.utils";

export default class DependencyComposer {

    public static getComposer() {
        if (!this.composer) {
            this.composer = new DependencyComposer();
        }

        return this.composer;
    }
    private static composer: DependencyComposer;
    private container: DependencyContainer;

    private constructor() {
        this.container = DependencyContainer.getContainer();
    }

    public async instanciateClassType<T>(classType: Constructor<T>, { id, constructorArgs, props = {}, type }: ComponentEntry<Constructor<T>> & { id?: string } = defaultEntry) {
        const instance = new classType(...await this.injectByConstructor(classType, constructorArgs as any[]));

        // Use it for handling not DI props
        Object.keys(props).forEach((prop) => (instance as any)[prop] = (props as any)![prop]);

        if ((instance as any)[onInit]) {
           await (instance as any)[onInit]();
        }

        await this.injectByProperty(instance, props);
        await this.injectByMethod(instance);

        if (type === "singleton") {
            this.container.put(classType, instance, id);
        }

        return instance;
    }

    // * Injectors
    private async injectByConstructor<T>(classType: Constructor<T>, ctrArgs: any[] = []): Promise<Array<unknown>> {
        const params = await this.injectByParams(classType);

        return params.map((param, i) => (isNull(ctrArgs[i])) ? ctrArgs[i] : param);
    }

    private async injectByProperty(instance: Instance, predefined: any = {}) {
        const prototype = Object.getPrototypeOf(instance);
        const autowiredProps = this.getInjectableProps(prototype);

        if (!autowiredProps) {
            return;
        }

        for (const propertyKey of autowiredProps) {
            const dependency = reflectType(instance, propertyKey);

            (instance as any)[propertyKey] = !isNull(predefined[propertyKey]) ? predefined[propertyKey] : await this.proccessDependency(instance, dependency, "default", propertyKey);
        }

        return;
    }

    private async injectByMethod(instance: Instance) {
        for (const propertyKey of reflectOwnProperties(instance)) {

            if (!Reflect.hasMetadata(AUTOWIRED, instance, propertyKey)) {
                continue;
            }

            (instance as any)[propertyKey](...( await this.injectByParams(instance, propertyKey) ));
        }

    }

    private async injectByParams(target: Instance, propertyKey?: string | symbol) {
        const ids = metadata(target, propertyKey).getMetadata(INJECT) || [];
        const reflect = reflectParameters(target, propertyKey);

        if (!reflect) {
            return [];
        }

        const dependencies = [];
        for (const [index, dependency] of reflect.entries()) {
            const processed = await this.proccessDependency(target, dependency as Constructor, ids[index]);

            dependencies.push(processed);
        }

        return dependencies;
    }

    // * Deps processors
    private async proccessDependency(parentObject: Instance, dependency: Constructor, depId?: string, propertyKey?: string | symbol) {
        // Check if there are any predefined/instantiated components of this type
        const predefined = ComponentSettingsStorage.has(dependency) || this.container.contain(dependency);

        if (metadata(dependency).hasMetadata(INJECT_ID) || predefined) {

            const id = depId ||
                       metadata(Object.getPrototypeOf(parentObject), propertyKey).getMetadata(AUTOWIRED) ||
                       metadata(dependency).getMetadata(INJECT_ID) ||
                       "default";

            const depSettings = ComponentSettingsStorage.get(dependency);
            const settings = depSettings ? depSettings[id] || {} : {};

            if (!this.container.contain(dependency, id)) {
                return this.instanciateClassType(dependency, { id, ...settings });
            }

            return this.container.get(dependency, id);
        } else {
            console.log(`Unexpected dependency {${dependency}}`);
            return this.proccessUnexpected(parentObject, dependency);
        }
    }

    private async proccessUnexpected<T>(instance: Instance, dependency: Constructor<T>): Promise<Instance<T>> {
        return DependencyManager.getManager().processDep(dependency);
    }

    // * Helper function
    private getInjectableProps(prototype: Constructor): Array<string | symbol> {
        if (!prototype || !isObject(prototype)) {
            return [];
        }

        return [
            ...(autowiredPropsStore.get(prototype) || []),
            ...this.getInjectableProps(Object.getPrototypeOf(prototype)),
        ];
    }

}
