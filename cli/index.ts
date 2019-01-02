#!/usr/bin/env node
import * as program from 'commander';
import controllerCommand from './commands/controller.generate';
import openapiCommand from './commands/openapi.generate';

controllerCommand(program);
openapiCommand(program);

program.parse(process.argv);