
export function concatinateBase(base: string, path: string) {

    if(base === '/' && path === '/')
        return base;

    if(base === '/')
        return path;

    return base + path;
}