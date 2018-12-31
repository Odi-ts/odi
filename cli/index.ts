#!/usr/bin/env node

import * as program from 'commander';
import controllerCommand from './coomands/controller.generate';

controllerCommand(program);

program.parse(process.argv);