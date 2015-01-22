﻿var taskengine = {
    conf : null,
    alias : null,
    pck : null,
};
var conf = requireRoot('conf');

module.exports = function (context) {
    this.context = context;
    this.__underlyingEngine = taskengine;

    this.runSubtask = function (taskNames, description, grunt, config) {
        // do not throw exceptions. This is mainly called automatically, and
        //  may be undefined for existing tasks not configured to run
        if (!taskNames) return;
        if (!config) return;
        
        if (taskNames.constructor !== Array) {
            taskNames = [taskNames];
        }

        var log = conf.log(grunt), self = this;
        var currentSettings = this.createTaskConfig(grunt, config);
        
        taskNames.forEach(function (taskName) {
            grunt.registerTask(self.getTaskAlias(taskName), description, function () {
                grunt.initConfig(currentSettings);
                
                log.config();
                
                Object.keys(currentSettings).forEach(function (task) {
                    try {
                        return conf.run(context.parent, task, grunt);
                    } catch (_error) {
                        return log.error(context.parent, _error);
                    }
                });
            });
        });
    };

    this.createTaskConfig = function (grunt, config) {
        if (!grunt) throw "Instance of grunt needed to create a grunt task configuration";
        if (!config) throw "A config is needed to create a task configuration of";

        taskengine.conf = taskengine.conf || requireRoot('lib/taskengine/configuration.js');
        taskengine.pck = taskengine.pck || requireRoot('lib/taskengine/packaging.js');
        return taskengine.conf.createConfig(config, context.options.task, function (_package) {
            taskengine.pck.loadPackage(grunt, _package || context.options.package);
        });
    };
    
    this.getTaskAlias = function (task) {
        taskengine.alias = taskengine.alias || requireRoot('lib/taskengine/aliasing.js');
        return taskengine.alias.getAlias(context.parent, task);
    };

    return this;
};