var data;
module.exports = function (grunt) {
    var taskengine = requireRoot('lib/taskengine/te.js');
    var configuration = requireRoot('lib/taskengine/configuration.js');   
    var environment = requireRoot('lib/taskengine/environment.js');    

    taskengine = new taskengine({
        "parent" : data.parent,
        "options" : {
            "task" : data.task,
            "package" : data.package
        }
    });
    
    var config = configuration.getConfig(grunt, data.moduleTree);
    taskengine.runSubtask(data.name, data.description, grunt, config);
    environment.loadTaskDirectories(grunt, __dirname, data.module);
};
