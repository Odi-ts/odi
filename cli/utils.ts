import { writeFileSync } from "fs";
import { join } from "path";
import { parse } from 'doctrine';

// Functions
export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function remapPath(route: string) {  
    const params = route.match(/:[a-zA-Z0-9]+/gi) || [];

    return params.reduce((prev, rawParam) => {
        const param = `{${rawParam.substring(1, rawParam.length)}}`;
        return prev.replace(rawParam, param);
    }, route);
}

export function writeFile(filename: string, path: string, content: string) {
    return writeFileSync(join(path, filename), content, { encoding: 'UTF-8' });
}