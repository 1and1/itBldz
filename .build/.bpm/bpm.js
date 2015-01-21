#!/usr/bin/env node
'use strict';

global.requireRoot = function (name) {
    return require(__dirname + '/../' + name);
};

var args = require('./args.js').parse();

require('./' + args["action"] + ".js")(args).do();
