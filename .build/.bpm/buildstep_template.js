module.exports = function (grunt) {
    var taskengine = requireRoot('taskengine');
    
    var taskContext = taskengine.startup({
        "grunt" : grunt, 
        "buildStep" : require("path").basename(__filename, ".js"), 
        "path" : __dirname
    });
    
    taskContext.run();
};
