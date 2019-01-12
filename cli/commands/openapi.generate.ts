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
        .option('-l, --links [urls...]', 'set server links', (val, memo) => [...memo, val], [])
        .option('-t, --title <title>', 'set app titile', 'Docs')
        .description('Generate API docs')
        .action(({ raw, sources, entry, output, title, links }) => {
            console.log(links);
            if(!sources) 
                return console.log('Sources must be specified');      

            action({ sources, output, entry: entry || join(sources, './index.ts'), title, links });
        });
}

function action({ sources, entry, output, links, title }: any) {
    const doc = generateOpenAPI(process.cwd(), sources, entry);

    doc.info.title = title;
    doc.servers = links.map((link: string) => ({ url: link }));

    return writeFileSync(resolve(process.cwd(), output || `./swagger-${doc.info.version}.json`), JSON.stringify(doc, null, 4));    
}