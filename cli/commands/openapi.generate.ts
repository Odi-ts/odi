import { CommanderStatic } from 'commander';
import { prompt, Questions } from 'inquirer';
import { generateOpenAPI } from '../generators/openapi.generator';

const questions: Questions = []

export default function (program: CommanderStatic) {
    program
        .command('docs')
        .description('Generate API docs')
        .action(() => prompt(questions).then(action))
}

function action() {
    const text = generateOpenAPI();
}