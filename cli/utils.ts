import { writeFileSync, readFileSync } from "fs";

// Functions
export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function writeFile(filename: string, path: string, content: string) {
    return writeFileSync(path, content, { encoding: 'UTF-8' });
}
