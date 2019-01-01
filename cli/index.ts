#!/usr/bin/env node

import * as program from 'commander';
import controllerCommand from './commands/controller.generate';

controllerCommand(program);

program.parse(process.argv);