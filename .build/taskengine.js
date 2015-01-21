var env, alias;
var conf = requireRoot('conf');

module.exports = {    
    startup : function (startupContext) {
        if (!startupContext) throw "A startup context is required";
        if (!startupContext.grunt) throw "An instance grunt required for startup context";
        if (!startupContext.buildStep) throw "A buildstep is required for the startup context";
        if (!startupContext.path) throw "A path is required for the startup context";
        
        env = env || requireRoot('lib/taskengine/environment.js');
        alias = alias || requireRoot('lib/taskengine/aliasing.js');
        var self = this;
        var availableTasks = env.loadTaskDirectories(startupContext.grunt, startupContext.path, startupContext.buildStep);
        return {
            name : startupContext.buildStep,
            config : alias.setupTaskAlias(startupContext.grunt.config("build")[startupContext.buildStep], startupContext.buildStep, availableTasks), 
            tasks : availableTasks,
            grunt : startupContext.grunt,
            run : function (description) {
                self.run(this, description);
            }
        };
    },
    
    run : function (context, description) {
        if (!context) throw "A run context is required. Call startup first and get the context.";
        if (!context.grunt) throw "An instance grunt required for run context. Call startup first and get the context.";
        if (!context.name) throw "A name for the run context is required. Call startup first and get the context.";

        var log = conf.log(context.grunt);
        context.grunt.registerTask(context.name, description || 'Task for ' + context.name, function () {
            context.grunt.initConfig(context.config);
            
            log.config();
            Object.keys(context.config).forEach(function (task) {
                try {
                    if (context.config[task])
                        return conf.run(context.name, task, context.grunt);
                } catch (_error) {
                    return log.error(context.name, _error);
                }
            });
        });
    }
};