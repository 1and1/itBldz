global.requireRoot = function (name) {
    return require(__dirname + '/' + name);
};

module.exports = function (grunt) {
    var conf = require('./conf');
    var itbldzConfig = require('./lib/json/configuration.js')(grunt, __dirname);

    var log = conf.log(grunt);
    require('time-grunt')(grunt);
    
    var itbldz = itbldzConfig.createConfigs();

    grunt.initConfig();
    var tasks = conf.getTasks(itbldz.build);
    
    itbldz.build = conf.prepareBuild(itbldz.build);
    
    grunt.config.set("build", itbldz.build);
    grunt.config.set("config", itbldz.config);
    grunt.config.set("env", itbldz.env);
    
    log.config();
    
    conf.loadConfig(itbldz.config, grunt);
    conf.loadBuild(itbldz.build, grunt);
    conf.loadTasks(tasks, grunt);
    
    grunt.registerTask('default', tasks);
};
