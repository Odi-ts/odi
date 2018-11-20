import { INJECT_ID, SERVICE, DB_CONNECTION, AUTOWIRED, INJECT } from "../definitions";
import { reflectParameters, reflectOwnProperties, reflectType } from "../utils/directory.loader";
import { autowiredPropsStore, onInit } from "./dependency.utils";
import { isObject } from "util";
import { defaultEntry, ComponentEntry } from "./dependency.decorators";

import { Class } from "../utils/object.reflection";
import { isNull } from "../utils/object.utils";
import { metadata } from "../utils/metadata.utils";
import { ComponentSettingsStorage } from "./dependency.manager";

export interface Implemenations{   
    [index: string]: Object
}

export default class DependencyComposer{
    private map: Map<Function, Implemenations>;
    private idMap: Map<string, Object>;

    constructor(){
        this.map = new Map();
        this.idMap = new Map();
    }

    public async instanciateClassType<T extends Class>(classType: T, { id, constructorArgs, props = {}, type = "singleton" }: ComponentEntry<T> & { id?: string } = defaultEntry){
        const target = new classType(...await this.injectByConstructor(classType, constructorArgs));  

        Object.keys(props).forEach(prop => target[prop] = props![prop]);

        if(target[onInit]){
           await target[onInit](); 
        }

        await this.injectByProperty(target, props);
        await this.injectByMethod(target);

        if(type === 'singleton')
            this.put(classType, target, id);

        return target;
    }

    private async injectByConstructor<T>(classType: T, ctrArgs: any = []): Promise<any[]>{
        const params = await this.injectByParams(classType);
        
        return params.map((param, i) => (isNull(ctrArgs[i])) ? ctrArgs[i] : param);
    }

    private async injectByProperty(target: any, predefined: any = {}){
        const prototype = Object.getPrototypeOf(target);
        const autowiredProps = this.getInjectableProps(prototype);

        if(!autowiredProps){
            return;
        }

        for(let propertyKey of autowiredProps){
            const dependency = reflectType(target, propertyKey);    

            target[propertyKey] = !isNull(predefined[propertyKey]) ? predefined[propertyKey] : await this.proccessDependency(target, dependency, "default", propertyKey);
        }

        return;
    }

    private async injectByMethod(target: any){

        for(let propertyKey of reflectOwnProperties(target)){
            
            if(!Reflect.hasMetadata(AUTOWIRED, target, propertyKey)){
                continue;
            }

            target[propertyKey](...( await this.injectByParams(target, propertyKey) ));
        }

    }

    private async injectByParams(target: any, propertyKey?: any){        
        const ids = metadata(target, propertyKey).getMetadata(INJECT) || [];
        const reflect = reflectParameters(target, propertyKey);

        if(!reflect){
            return [];
        }

        const dependencies = [];
        for(const [index, dependency] of reflect.entries()) {                       
            const processed = await this.proccessDependency(target, dependency, ids[index]);
            
            dependencies.push(processed);            
        }
        
        return dependencies;
    }
    

    /* By Type Methods */
    public put(classType: Function, instance: Object, id: string = 'default'): void{
        if(!instance){
            return;
        }

        const prev = this.map.has(instance.constructor || classType) || {};
        
        this.map.set(instance.constructor || classType, { ...prev, [id]: instance });    
    }

    public get(classType: Function, id: string = 'default'): any{
        const instance = this.map.get(classType);

        return instance ? instance[id] : null;
    }

    public contain(classType: Function, id: string = 'default'): boolean {
        const instance = this.map.get(classType);

        if(!instance){
            return false;
        }

        return (instance[id] !== undefined);
    }

   
    /* By Id methods */
    public putById(id: string, instance: Object): void{
       this.idMap.set(id, instance);
    }

    public getById(id: string): any{
        return this.idMap.get(id);
    }

    public containById(id: string): boolean{
        return this.idMap.has(id)
    }



    private async proccessDependency(parentObject: any, dependency: any, depId: string = 'default', propertyKey?: string) {    
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

    private proccessUnexpected(target: any, dependency: any): any{
        return new dependency;
    }

    private getInjectableProps(prototype: any): any[]{
        if(!prototype || !isObject(prototype)){
            return [];
        }

        return [
            ...(autowiredPropsStore.get(prototype) || []), 
            ...this.getInjectableProps(Object.getPrototypeOf(prototype))
        ]
    }
}