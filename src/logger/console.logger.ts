import chalk from 'chalk';

export class Logger{

    public completion(text: string): void{
        console.log(chalk.green('\u2714 ')+text);
    }

    public warning(text: string): void{
        console.log(chalk.yellow(`⚠ ${text}`));
    }
}


export const Log = new Logger();