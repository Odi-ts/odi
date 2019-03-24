import { Constructor, Instance } from "../types";
export interface Implemenations{   
    [index: string]: Instance;
}

export default class DependencyContainer {
    private static container: DependencyContainer;

    private map: Map<Constructor, Implemenations>;
    private idMap: Map<string, Instance>;

    private constructor(){
        this.map = new Map();
        this.idMap = new Map();
    }

    public static getContainer() {
        if(!this.container)
            this.container = new DependencyContainer();

        return this.container;
    }


    //* By Type Methods
    public put(classType: Constructor, instance: Instance, id: string = 'default'): void{
        if(!instance)
            return;

        const constructor = classType || (instance.constructor as Constructor);
        const prev = this.map.get(constructor) || {};
        
        this.map.set(constructor, { ...prev, [id]: instance });
    }

    public get(classType: Constructor, id: string = 'default') {
        const implemenations = this.map.get(classType);

        return implemenations ? implemenations[id] : null;
    }

    public contain(classType: Constructor, id: string = 'default'): boolean {
        const instance = this.map.get(classType);

        if(!instance){
            return false;
        }

        return (instance[id] !== undefined);
    }

   
    //* By Id methods
    public putById(id: string, instance: Instance): void{
       this.idMap.set(id, instance);
    }

    public getById(id: string) {
        return this.idMap.get(id);
    }

    public containById(id: string): boolean{
        return this.idMap.has(id);
    }
}

export function getContainer() {
    return DependencyContainer.getContainer();
}