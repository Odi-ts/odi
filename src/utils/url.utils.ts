
export function concatinateBase(base: string, path: string) {
    
    if(path === '/')
        path = '';

    return base + path;
}