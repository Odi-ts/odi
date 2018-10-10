export declare type ObjectType<T> = {
    new (): T;
} | Function;

export declare type StrictObjectType<T> = new () => T;