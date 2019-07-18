import { Instance } from "../types";

export function metadata(target: Instance | Function, properyKey?: string | symbol) {
    return {
        getMetadata: (metadataKey: string) => properyKey ? Reflect.getMetadata(metadataKey, target, properyKey) : Reflect.getMetadata(metadataKey, target),

        hasMetadata: (metadataKey: string) => properyKey ? Reflect.hasMetadata(metadataKey, target, properyKey) : Reflect.getMetadata(metadataKey, target),
    };
}
