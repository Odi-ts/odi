#!/usr/bin/env node
import * as program from 'commander';
import controllerCommand from './commands/controller.generate';
import openapiCommand from './commands/openapi.generate';
import initCommand from './commands/project.generate';

controllerCommand(program);
openapiCommand(program);
initCommand(program);

program.parse(process.argv);