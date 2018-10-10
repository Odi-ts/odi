import { INJECT_ID, SERVICE, DB_CONNECTION, AUTOWIRED, AUTOWIRED_PROPS } from "../definitions";
import { reflectParameters, reflectOwnProperties } from "../utils/directory.loader";
import { Connection } from "typeorm";
import { isServiceRepo } from "./dependency.classifier";
import { autowiredPropsStore, onInit } from "./dependency.utils";
import { isObject } from "util";

export interface Implemenations{   
    [index: string]: Object
}

export class DependencyReserver{}

export default class DependencyComposer{
    private map: Map<Function, Implemenations>;
    private idMap: Map<string, Object>;

    constructor(){
        this.map = new Map();
        this.idMap = new Map();
    }


    public async instanciateClassType(classType: any){
        const target = new classType(...( await this.injectByConstructor(classType) ));  
      
        if(target[onInit]){
           await target[onInit](); 
        }

        await this.injectByProperty(target);
        await this.injectByMethod(target);

        return target;
    }

    private async injectByConstructor(classType: any): Promise<any[]>{
        return this.injectByParams(classType);
    }

    private async injectByProperty(target: any){
        const prototype = Object.getPrototypeOf(target);
        const autowiredProps = this.getInjectableProps(prototype);

        if(!autowiredProps){
            return;
        }

        for(let propertyKey of autowiredProps){
            const dependency = Reflect.getMetadata("design:type", target, propertyKey);                    
            target[propertyKey] = await this.proccessDependency(target, dependency) || 'kek';
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
        const reflect = reflectParameters(target, propertyKey);

        if(!reflect){
            return [];
        }

        const dependencies = [];
        for(const dependency of reflect){
            if(!dependency){
                throw Error(`DI points to undefined reference into "${target.name}" constructor.`)
            }
            
            const processed = await this.proccessDependency(target, dependency);
            dependencies.push(processed);
            
        }
        
        return dependencies;
    }
    

    /* By Type Methods */
    public put(classType: Function, instance: Object, id: string = 'default'): void{
        if(!instance){
            return;
        }

        if(!this.map.has(instance.constructor || classType)){
            this.map.set(instance.constructor || classType, { [id]: instance })
            return;
        }

    }

    public get(classType: Function, id: string = 'default'): any{
        const instance = this.map.get(classType);

        return instance ? instance[id] : null;
    }

    public contain(classType: Function, id: string = 'default'): boolean{
        const instance = this.map.get(classType);

        if(!instance){
            return false;
        }

        return (instance[id] !== undefined || instance[id] !== null);
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



    private async proccessDependency(parentObject: any, dependency: any){       
        if(Reflect.hasMetadata(INJECT_ID, dependency)){
            const typeId = Reflect.getMetadata(INJECT_ID, dependency) || 'default';

            if(!this.contain(dependency, typeId)){
                const instance = await this.instanciateClassType(dependency);
            
                this.put(dependency, instance, typeId);
            }

            return this.get(dependency);
        }else{                         
            return this.proccessUnexpected(parentObject, dependency);
        }
    }

    private proccessUnexpected(target: any, dependency: any): any{
        if(isServiceRepo(target, dependency)){
            return this.serviceRepository(target, dependency);
        }
        
        return new dependency;
    }

    private serviceRepository(target: any, depency: any): any{
        if(this.get(DB_CONNECTION)){
            return (<Connection>this.get(DB_CONNECTION)).getRepository(Reflect.getMetadata(SERVICE, target));
        }

        return null;
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