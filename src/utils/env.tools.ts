export function getModule<T = any>(md: string): T {
    const gl: any = global;

    if (!gl[md]) {
        gl[md] = require(md);
    }

    return gl[md];
}
