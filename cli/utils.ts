import { writeFileSync, readFileSync } from "fs";
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

function writeFile(filename: string, path: string, content: string) {
    return writeFileSync(path, content, { encoding: 'UTF-8' });
}