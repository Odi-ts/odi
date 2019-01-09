import { CommanderStatic } from 'commander';
import { prompt, Questions } from 'inquirer';
import { generateOpenAPI } from '../generators/openapi.generator';

const questions: Questions = [{
    message: 'Sources directory: ',
    name: 'sources',
    type: 'input'
}, {
    message: 'Entry (main) file: ',
    name: 'entry',
    type: 'input'
}];

export default function (program: CommanderStatic) {
    program
        .command('docs')
        .option('-r, --raw', 'skip prompts')
        .option('-s, --sources <path>', 'set sources path', )
        .option('-e, --entry <path>', 'set entry file path')
        .description('Generate API docs')
        .action(({ raw, sources, entry }) => {
            if(raw) {
                if(!sources) 
                    return console.log('Sources must be specified');

                if(!entry) 
                    return console.log('Entry file must be specified');

                action({ sources, entry });

            } else {
                prompt(questions).then(action);
            }
        });
}

function action({ sources, entry }: any) {
    console.log(process.cwd());
    const text = generateOpenAPI(process.cwd(), sources, entry);
    console.log(text);
}