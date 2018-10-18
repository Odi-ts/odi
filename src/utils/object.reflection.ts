export declare type ObjectType<T> = {
    new (): T;
} | Function;

export declare type StrictObjectType<T> = new () => T;

export declare type Class<T = any> = new (...args: any[]) => T