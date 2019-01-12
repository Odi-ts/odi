import { CommanderStatic } from 'commander';
import { prompt, Questions } from 'inquirer';
import { generateOpenAPI } from '../generators/openapi.generator';
import { join, resolve } from 'path';
import { writeFileSync } from 'fs';

const questions: Questions = [{
    message: 'Sources directory: ',
    name: 'sources',
    type: 'input'
}, {
    message: 'Entry (main) file: ',
    name: 'entry',
    type: 'input',
    default: ''
}, {
    message: 'Output file: ',
    name: 'output',
    type: 'input',
    default: './swagger.json'
}];

export default function (program: CommanderStatic) {
    program
        .command('docs')
        .option('-r, --raw', 'skip prompts')
        .option('-s, --sources <path>', 'set sources path', )
        .option('-e, --entry <path>', 'set entry file path')
        .option('-o, --output <path>', 'set output path ')
        .description('Generate API docs')
        .action(({ raw, sources, entry, output }) => {
            if(raw) {
                if(!sources) 
                    return console.log('Sources must be specified');      

                action({ sources, output, entry: entry || join(sources, './index.ts') });
            } else {
                prompt(questions).then(action);
            }
        });
}

function action({ sources, entry, output }: any) {
    const doc = generateOpenAPI(process.cwd(), sources, entry);
    
    return writeFileSync(resolve(process.cwd(), output), JSON.stringify(doc, null, 4));    
}