#!/usr/bin/env node

process.argv.splice(2, 0, "deploy");

require('../itbldz');