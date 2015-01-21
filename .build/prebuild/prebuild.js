var conf = requireRoot('conf');

module.exports = function (grunt) {
    var log = conf.log(grunt);
    var currentSettings = grunt.config("build").prebuild;
    grunt.loadTasks('lib/packaging');
    
    grunt.registerTask('prebuild', 'Setting up the build.', function () {
        grunt.initConfig(currentSettings);
        
        log.config();

        Object.keys(currentSettings).forEach(function (task) {
            try {
                return conf.run("prebuild", task, grunt);
            } catch (_error) {
                return log.error("prebuild", _error);
            }
        });
    });
};
