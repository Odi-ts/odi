export declare interface ObjectType<T> {
    new (): T;
}

export declare type Constructor<T = any> = (new (...args: any[]) => T);

// tslint:disable-next-line:ban-types
export type Instance<T extends Object = Object> = T;

// tslint:disable-next-line:ban-types
export type Propotype = Object;
