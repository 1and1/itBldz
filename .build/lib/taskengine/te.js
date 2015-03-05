var taskengine = {
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
            var alias = self.getTaskAlias(taskName);
            grunt.registerTask(alias, description, function () {

                var taskSetting = currentSettings;
                var keysToOmnit = {};
                Object.keys(taskSetting).forEach(function (key) {
                    if (taskSetting[key] && taskSetting[key][".."]) {
                        taskSetting[key][".."].forEach(function (item) {
                            Object.keys(item).forEach(function (key) {
                                keysToOmnit[key] = true;
                                taskSetting[key] = item[key];
                            });
                        });

                        delete taskSetting[key][".."];
                    }
                });
                grunt.initConfig(taskSetting);

                log.config();

                Object.keys(currentSettings).forEach(function (task) {
                    try {
                        if (keysToOmnit[task]) return;
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
