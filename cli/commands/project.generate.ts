import { CommanderStatic } from 'commander';
import { generatePackage, generateTsConfig } from '../generators/files.generator';
import { writeFile, writeJsonFile, execCommands } from '../utils';

import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { generateStarter, generateView } from '../generators/starter.generator';
import { generateController } from '../generators/controller.generator';


export default function (program: CommanderStatic) {
    program
        .command('init')
        .option('-j, --jsx-templating', 'add jsx templates in project')
        .option('-d, --database', 'add typeorm integration')
        .description('Generate Odi porject')
        .action(action);
}

function action({ templating, database }: any) {
    const packageFile = generatePackage();
    const tsconfigFile = generateTsConfig();
    
    // Init package files
    let depCommand = 'npm i odi ';

    if(database)
        depCommand += 'typeorm ';

    if(templating) {
        tsconfigFile.compilerOptions['jsx'] = 'react';
        tsconfigFile.compilerOptions['rootDirs'].push('./views');

        packageFile.scripts.start = 'tsc && node build/src/index';

        depCommand += 'react react-dom @types/react ';
    }

    // Config files
    writeJsonFile('package.json', packageFile);
    writeJsonFile('tsconfig.json', tsconfigFile);
    
    // Sources dir
    mkdirSync(resolve(process.cwd(), './src'));
    mkdirSync(resolve(process.cwd(), './src/controllers'));
    
    if(templating) {        
        mkdirSync(resolve(process.cwd(), './views'));
        writeFile('./views/home.view.tsx', generateView());
    } 

    // Basic sources
    writeFile('./src/index.ts', generateStarter());
    writeFile(`./src/controllers/home.controller.${templating ? 'tsx' : 'ts'}`, generateController({ name: 'Home', type: templating ? "JSX" : 'empty' }));
    
    // Install deps
    execCommands([ depCommand ]);
}