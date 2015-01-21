global.requireRoot = function (name) {
    return require(__dirname + '/' + name);
};

module.exports = function (grunt) {
    var conf = require('./conf');

    var log = conf.log(grunt);
    require('time-grunt')(grunt);
    
    var build = grunt.file.readJSON(grunt.option('build') || "./../build.json");
    var config = grunt.file.readJSON(grunt.option('config') || "./../config.json");
    
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
