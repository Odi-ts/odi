import { command, CommanderStatic } from 'commander';
import { prompt, Questions } from 'inquirer';
import { generateController } from '../generators/controller.generator';

const questions: Questions = [
    {
        name: 'name',
        message: "Name of the controller: "
    },
    {
        name: 'type',
        message: 'Type of the controller: ',
        default: 'empty',
        type: 'list',
        choices: [{ 
            name: 'REST', 
            value: 'rest'
        }]
    }
]

export default function (program: CommanderStatic) {
    program
        .command('controller')
        .description('Generate controller')
        .action(() => prompt(questions).then(action))
}

function action({ name, type }: any) {
    const text = generateController({ name, type });
}