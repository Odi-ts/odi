export function getModule(md: string) {
    const gl: any = global;

    if(!gl[md])
        gl[md] = require(md);

    return gl[md];
}