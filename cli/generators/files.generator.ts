import { sep } from 'path';

export function generatePackage(): any {
    return {
        name: process.cwd().split(sep).pop()!.toLowerCase(),
        version: "1.0.0",
        description: "",
        main: "index.js",
        scripts: {
            test: "echo \"Error: no test specified\" && exit 1",
            start: "tsc && node build/index"
        },
        dependencies: {
        },
        keywords: [],
        author: "",
        license: "ISC"
    };
}

export function generateTsConfig(): any {
    return {
        compilerOptions: {
        target: "ES2018",
        module: "commonjs",
        outDir: "./build",
        rootDirs: ["./src"],
        strict: true,
        strictPropertyInitialization: false,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: true
        }
    };
}