module.exports = (function () {    
    this.createConfig = function (config, defaultTaskRunner, loadTaskPackage) {
        var result = {};
        config = config || {};
        if (typeof (config.task) === 'undefined' || config.task.length < 1) {
            config.task = defaultTaskRunner;
        } else if (typeof (config.task) !== 'string') {
            throw new Error('invalid task configuration for js runner');
        }
        
        var taskrunner = config.task;
        
        if (taskrunner.constructor !== Array) {
            taskrunner = [taskrunner];
        }

        
        if (typeof loadTaskPackage === "function") {
            loadTaskPackage(config.package);
        }
        
        taskrunner.forEach(function (task) {
            result[task] = config;
            delete result[task].task;
            delete result[task].package;
        });
        
        return result;
    };
    
    this.getConfig = function (grunt, currentTree) {
        if (!grunt) throw Error("Instance of grunt needed to get the current configuration");
        if (!grunt.config) throw Error("Grunt needs an initialized configuration");
        if (!currentTree) throw Error("A configuration tree is needed to get the current configuration");

        if (currentTree.constructor !== Array) {
            currentTree = [currentTree];
        }

        var current = grunt.config("build");
        
        do {
            var item = currentTree.shift();
            if (!current[item]) return null;
            current = current[item];
        } while(currentTree.length > 0);

        return current;
    };

    return this;
})();