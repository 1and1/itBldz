var glob = require('glob');
var properties = requireRoot('lib/typing/properties')();

var loadConfig = function (path) {
    var object = {};
    
    glob.sync('config.json', { cwd: './' + path }).forEach(function (option) {
        var key = option.replace(/\.json$/, '');
        object[key] = require(path + option);
    });
    
    return object;
};

module.exports.log = function (grunt) {
    this.config = function () {
        grunt.verbose.writeln();
        grunt.verbose.writeln('Current Config:');
        grunt.verbose.writeln(JSON.stringify(grunt.config(), undefined, 2));
        grunt.verbose.writeln();
    };
    this.error = function (operation, _error) {
        grunt.log.error();
        grunt.verbose.error(_error);
        return grunt.fail.warn(operation + ' operation failed.');
    };
    return this;
};

module.exports.getTasks = function (build) {
    var tasks = ["prebuild"];
    tasks = tasks.concat(Object.keys(build));
    return tasks;
};

module.exports.prepareBuild = function (build, grunt) {
    var dependencies = [];
    
    properties.find(build, ["task", "package"], function (result) {
        dependencies.push(result.package);
    });
    
    var finalobj = {};
    finalobj.prebuild = {
        "npm-install" : {
            options: {
                packages: dependencies
            }
        }
    };
    
    Object.keys(build).forEach(function (prop) {
        finalobj[prop] = build[prop];
    });
    
    return finalobj;
};

module.exports.loadConfig = function (config, grunt) {
    grunt.verbose.write("Loading config module... ");
    grunt.config.set('config', config);
    grunt.verbose.ok();
};

module.exports.loadBuild = function (build, grunt) {
    grunt.verbose.write("Loading config module... ");
    grunt.config.set('build', build);
    grunt.verbose.ok();
};

module.exports.loadTasks = function (tasks, grunt) {
    tasks.forEach(function (step) {
        grunt.verbose.write("Loading task " + step + "... ");
        grunt.loadTasks(step);
        grunt.verbose.ok();
    });
};

module.exports.run = function (parent, task, grunt) {
    grunt.verbose.write(parent + ": delegating task " + task + "... ");
    grunt.task.run(task);
    grunt.verbose.ok();
};
