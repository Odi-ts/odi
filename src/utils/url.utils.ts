export function concatinateBase(base: string, path: string) {
    if (!base || base === "/") {
        return path;
    }

    if (path === "/" && base) {
        return base;
    }

    return base + path;
}
