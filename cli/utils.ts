import { writeFileSync } from "fs";
import { join, normalize } from "path";
import { isArray } from "util";

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

export function urlMapper(rawTs: string, rawBasePath: string, outDir: string, rootDirs: string | string[]) {
    const [ ts, basePath ] = [ normalize(rawTs), normalize(rawBasePath) ];
    
    let confirmedRoot= ''; 
    let prefix = '';

    if(isArray(rootDirs)) {
        for(const rootDir of rootDirs) {
            const possiblePrefix = join(basePath, rootDir);
            
            if(ts.startsWith(possiblePrefix)) {
                confirmedRoot = rootDir;
                prefix = possiblePrefix;

                break;
            }
        }

    } else {
        prefix = join(basePath, rootDirs);
    }

    if(!prefix)
        throw new Error("Can't find path alias");


    const suffix = ts.replace(prefix, '');
    
    return join(basePath, outDir, isArray(rootDirs) ? (join(confirmedRoot, suffix)) : suffix);
}

console.log(urlMapper('C:/Projects/VSCode/WebFramework/core/cli/index.ts', 'C:/Projects/VSCode/WebFramework/core', './lib', ['./src', './cli', './test']));




