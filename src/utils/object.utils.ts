import { Instance } from "../types";

export function isNull(object: unknown) {
    return (object === null || object === undefined);
}

export interface KeyMap<V> {
    [index: string]: V
}
