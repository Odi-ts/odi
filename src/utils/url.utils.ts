
export function concatinateBase(base: string, path: string) {
    
    if(base !== '' && path === '/')
        path = '';

    return base + path;
}