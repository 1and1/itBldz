module.exports = function (action) {
    'use strict';
    
    var util = require('util');
    var chalk = require('chalk');

    var log = function (target, message) {        
        console.log(chalk.blue("[bpm] " + action), chalk.green(target), chalk.gray(message));
    };
    
    var verbose = function (args, target, message) {
        if (args && args.verbose) {
            log(target, message);
        }
    };

    return {
        log : log,
        verbose : verbose
    };
};