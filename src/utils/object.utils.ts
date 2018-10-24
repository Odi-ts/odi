export function isNull(object: any) {
    return (object === null || object === undefined);
}

export type KeyMap<V> = { 
    [index: string]: V
}