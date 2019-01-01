#!/usr/bin/env node
import * as program from 'commander';
import controllerCommand from './commands/controller.generate';
import openapiCommand from './commands/openapi.generate';

import { loadSync } from "tsconfig";

console.log(loadSync(process.cwd()));

controllerCommand(program);
openapiCommand(program);

program.parse(process.argv);