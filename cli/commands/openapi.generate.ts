import { CommanderStatic } from 'commander';
import { prompt, Questions } from 'inquirer';
import { generateOpenAPI } from '../generators/openapi.generator';
import { join, resolve } from 'path';
import { writeFileSync } from 'fs';

export default function (program: CommanderStatic) {
    program
        .command('docs')
        .option('-s, --sources <path>', 'set sources path', )
        .option('-e, --entry <path>', 'set entry file path')
        .option('-o, --output <path>', 'set output path ')
        .description('Generate API docs')
        .action(({ raw, sources, entry, output }) => {
            if(!sources) 
                return console.log('Sources must be specified');      

            action({ sources, output, entry: entry || join(sources, './index.ts') });
        });
}

function action({ sources, entry, output }: any) {
    const doc = generateOpenAPI(process.cwd(), sources, entry);

    return writeFileSync(resolve(process.cwd(), output || `./swagger-${doc.info.version}.json`), JSON.stringify(doc, null, 4));    
}