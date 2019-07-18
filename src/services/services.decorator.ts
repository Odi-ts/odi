import "reflect-metadata";

import { INJECT_ID, SERVICE } from "../definitions";

export function Service<T>(): ClassDecorator {
    return (target: Function) => {
       Reflect.defineMetadata(SERVICE, true, target);
       Reflect.defineMetadata(INJECT_ID, "default", target);
    };
}
