import { INJECT_ID, AUTOWIRED, INJECT } from "../definitions";
import { reflectParameters, reflectOwnProperties, reflectType } from "../utils/directory.loader";
import { autowiredPropsStore, onInit } from "./dependency.utils";
import { isObject } from "util";
import { defaultEntry, ComponentEntry } from "./dependency.decorators";
import { isNull } from "../utils/object.utils";
import { metadata } from "../utils/metadata.utils";
import { ComponentSettingsStorage } from "./dependency.store";
import { Constructor, Instance } from "../types";

export interface Implemenations{   
    [index: string]: Instance;
}

export default class DependencyComposer{
    private map: Map<Constructor, Implemenations>;
    private idMap: Map<string, Instance>;

    constructor(){
        this.map = new Map();
        this.idMap = new Map();
    }

    public async instanciateClassType<T>(classType: Constructor<T>, { id, constructorArgs, props = {}, type = "singleton" }: ComponentEntry<Constructor<T>> & { id?: string } = defaultEntry){
        const instance = new classType(...await this.injectByConstructor(classType, constructorArgs as any[]));  

        // Use it for handling not DI props
        Object.keys(props).forEach(prop => (instance as any)[prop] = (props as any)![prop]);

        if((instance as any)[onInit]){
           await (instance as any)[onInit](); 
        }

        await this.injectByProperty(instance, props);
        await this.injectByMethod(instance);

        if(type === 'singleton')
            this.put(classType, instance, id);

        return instance;
    }

    private async injectByConstructor<T>(classType: Constructor<T>, ctrArgs: any[] = []): Promise<unknown[]>{
        const params = await this.injectByParams(classType);
        
        return params.map((param, i) => (isNull(ctrArgs[i])) ? ctrArgs[i] : param);
    }

    private async injectByProperty(instance: Instance, predefined: any = {}){
        const prototype = Object.getPrototypeOf(instance);
        const autowiredProps = this.getInjectableProps(prototype);

        if(!autowiredProps)
            return;

        for(let propertyKey of autowiredProps){
            const dependency = reflectType(instance, propertyKey);    

            (instance as any)[propertyKey] = !isNull(predefined[propertyKey]) ? predefined[propertyKey] : await this.proccessDependency(instance, dependency, "default", propertyKey);
        }

        return;
    }

    private async injectByMethod(instance: Instance){
        for(let propertyKey of reflectOwnProperties(instance)){
            
            if(!Reflect.hasMetadata(AUTOWIRED, instance, propertyKey)){
                continue;
            }

           (instance as any)[propertyKey](...( await this.injectByParams(instance, propertyKey) ));
        }

    }

    private async injectByParams(target: Instance, propertyKey?: string | symbol){        
        const ids = metadata(target, propertyKey).getMetadata(INJECT) || [];
        const reflect = reflectParameters(target, propertyKey);

        if(!reflect)
            return [];

        const dependencies = [];
        for(const [index, dependency] of reflect.entries()) {        
            const processed = await this.proccessDependency(target, dependency as Constructor, ids[index]);
            
            dependencies.push(processed);            
        }
        
        return dependencies;
    }
    

    /* By Type Methods */
    public put(classType: Constructor, instance: Instance, id: string = 'default'): void{
        if(!instance)
            return;

        const prev = this.map.has((instance.constructor as Constructor) || classType) || {};
        
        this.map.set((instance.constructor as Constructor)|| classType, { ...prev, [id]: instance });    
    }

    public get(classType: Constructor, id: string = 'default') {
        const instance = this.map.get(classType);

        return instance ? instance[id] : null;
    }

    public contain(classType: Constructor, id: string = 'default'): boolean {
        const instance = this.map.get(classType);

        if(!instance){
            return false;
        }

        return (instance[id] !== undefined);
    }

   
    /* By Id methods */
    public putById(id: string, instance: Instance): void{
       this.idMap.set(id, instance);
    }

    public getById(id: string) {
        return this.idMap.get(id);
    }

    public containById(id: string): boolean{
        return this.idMap.has(id);
    }



    private async proccessDependency(parentObject: Instance, dependency: Constructor, depId: string = 'default', propertyKey?: string | symbol) {    
        if(metadata(dependency).hasMetadata(INJECT_ID) || ComponentSettingsStorage.get(dependency)){
            
            const id = metadata(Object.getPrototypeOf(parentObject), propertyKey).getMetadata(AUTOWIRED) || 
                       metadata(dependency).getMetadata(INJECT_ID) || 
                       depId;
            
            const depSettings = ComponentSettingsStorage.get(dependency);
            const settings = depSettings ? depSettings[id] || {} : {};

            if(!this.contain(dependency, id)){
                await this.instanciateClassType(dependency, { id, ...settings });
            }

            return this.get(dependency, id);
        } else {                         
            return this.proccessUnexpected(parentObject, dependency);
        }
    }

    private proccessUnexpected<T>(instance: Instance, dependency: Constructor<T>): T{
        return new dependency;
    }

    private getInjectableProps(prototype: Constructor): (string | symbol)[]{
        if(!prototype || !isObject(prototype)){
            return [];
        }

        return [
            ...(autowiredPropsStore.get(prototype) || []), 
            ...this.getInjectableProps(Object.getPrototypeOf(prototype))
        ];
    }
}