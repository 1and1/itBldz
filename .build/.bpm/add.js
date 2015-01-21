var fs, logger;

/* injected args is for now required for unit test injection. Need to find a cleaner way, but rewire does not work for module scope */
module.exports = function (origArgs, injectedArgs) {
    'use strict';
    
    logger = logger || require('./bpm-log.js')("add");
    var string = require('string');
    var path = require('path');
    fs = fs || require('fs');
    var args = injectedArgs || require('./args.js').module(origArgs);
    
    var buildDirectory = __dirname + "/..";
    
    var me = {};
    
    me.setupModulePath = function (dir, tree, onDone) {
        if (!tree || tree.length < 1) return onDone(dir);
        var currentDir = dir + "/" + tree.shift();
        logger.verbose(origArgs, "task", "Checking for folder " + path.resolve(currentDir));
        fs.exists(currentDir, function (exists) {
            if (!exists) {
                logger.verbose(origArgs, "task", "Creating folder " + path.resolve(currentDir));
                
                fs.mkdir(currentDir, function () {
                    me.setupModulePath(currentDir, tree, onDone);
                });
            }
            else
                me.setupModulePath(currentDir, tree, onDone);
        });
    };
    
    me.parseTemplate = function (err, data) {
        if (err) throw err;
        data = data || "";
        var lines = string(data).lines();
        lines[0] = "var data = " + JSON.stringify(args) + ";";
        me.setupModulePath(buildDirectory, args.moduleTree, function (targetDir) {
            fs.writeFile(targetDir + "/" + args.name + ".js", lines.join('\n'), function (err) {
                if (err) throw err;
                logger.log("task", "Created Module " + args.module);
            });
        });

        return lines.join('\n');
    };
    
    me.do = function () {
        logger.verbose(origArgs, "task", "Adding module " + args.module + "...");    
        fs.readFile(__dirname + "/module_template.js", me.parseTemplate);
    };

    return me;
};