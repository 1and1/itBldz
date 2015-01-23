global.requireRoot = function (name) {
    return require(__dirname + '/' + name);
};

module.exports = function (grunt) {
    var conf = require('./conf');

    var log = conf.log(grunt);
    require('time-grunt')(grunt);

    var pathing = __dirname.indexOf('node_module') >= 0 ? "./../../../" : "./../";
    var build = grunt.file.readJSON(grunt.option('build') || pathing + "build.json");
    var config = grunt.file.readJSON(grunt.option('config') || pathing + "config.json");
    
    config.directories = config.directories || { root: "" };

    config.directories.root = config.directories.root || pathing;

    grunt.initConfig();
    var tasks = conf.getTasks(build);
    
    build = conf.prepareBuild(build);
    
    grunt.config.set("build", build);
    grunt.config.set("config", config);
    
    log.config();
    conf.loadConfig(config, grunt);
    conf.loadBuild(build, grunt);
    conf.loadTasks(tasks, grunt);
    
    grunt.registerTask('default', tasks);
};
