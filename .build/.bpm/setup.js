﻿ var fs, decorate, args, log, addModule;

module.exports = function (origArgs) {
    'use strict';
    args = args || require('./args.js');
    fs = fs || require('fs');
    decorate = decorate || requireRoot('lib/json/decorate.js');
    log = log || require('./bpm-log.js')("setup").log;
    addModule = addModule || require('./add.js');
    
    var argsConfig = args.setup(origArgs);
    
    var string = require('string');
    var isTask = "__isTask";
    
    var buildDir = __dirname + "/../";
    var baseDir = require('path').join(__dirname, __dirname.indexOf('node_module') >= 0 ? "./../../../../" : "./../../");
    
    // create argument string
    var argumentTemplate = "add --m {{module}} --t {{task}} --p {{package}}";
    
    var me = {};
    
    me.decorationStrategy = function (data) {
        var config = JSON.parse(data);
        var standard = {
            prepare : 1,
            validate : 2,
            test : 2,
            "create-deployable" : 1
        };
        Object.keys(config).forEach(function (key) {
            if (!standard[key]) {
                standard[key] = config[key].depth || 1
            }
        });
        config = decorate(config).withPropertyForSpecifiedLevels(standard, isTask).create();
        
        return config;
    };
    
    me.getSubtasks = function (task, config) {
        var subtasks = [];
        Object.keys(config).forEach(function (key) {
            if (key !== "__isTask") subtasks.push(task + "->" + key);
        });
        
        return subtasks;
    };
    
    me.loadTask = function (dir, config, key) {
        if (!config[key][isTask]) return;
        var currentDir = dir + "/" + key;
        log("task", "Registering " + currentDir + " on " + key + " with " + JSON.stringify(config[key]));
        var currentTask = config[key]["task"] || me.getSubtasks(key, config[key]);
        
        var module = { module : currentDir, task : currentTask, "package" : config[key]["package"] };
        var moduleArguments = string(argumentTemplate).template(module).s.split(" ");
        if (origArgs.verbose) { moduleArguments.push("--verbose"); }
        
        log("task", "Adding module with " + JSON.stringify(moduleArguments));
        addModule(args.parse(moduleArguments)).do();
        setTimeout(function () { me.loadTasks(currentDir, config[key]) }, 1);
    };
    
    me.loadTasks = function (dir, config) {
        Object.keys(config).forEach(function (key) {
            log("build-step", "Load task " + key);
            me.loadTask(dir, config, key);
        });
    };
    
    me.addBuildStepTemplate = function (currentDir, key) {
        log("build-step", "Writing template for " + key);
        fs.readFile(__dirname + "/buildstep_template.js", function (err, data) {
            if (err) throw err;
            var lines = string(data).lines();
            fs.writeFile(currentDir + "/" + key + ".js", lines.join('\n'), function (err) {
                if (err) throw err;
            });
        });
    };
    
    me.parseBuildConfig = function (err, data) {
        if (err) throw err;
        
        var config = me.decorationStrategy(data);
        
        Object.keys(config).forEach(function (key) {
            log("build-step", "Created BuildStep " + key);
            
            // for each build-step
            var currentDir = buildDir + key;
            fs.mkdir(currentDir, function () {
                me.addBuildStepTemplate(currentDir, key);
                me.loadTasks(key, config[key]);
            });
        });
    };
    
    me.do = function () {
        // load build
        fs.readFile(baseDir + argsConfig.config, me.parseBuildConfig);
    }
    
    return me;
};
