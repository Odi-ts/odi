export declare type ObjectType<T> = {
    new (): T;
} | Function;

export declare type StrictObjectType<T> = new (...args: any[]) => T;

export declare type Class = new (...args: any[]) => any;