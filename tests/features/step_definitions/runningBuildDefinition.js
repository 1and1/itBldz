var runningBuild = function () {
    this.World = require("../support/World").World;
    require('chai').should();
    require('hide-stack-frames-from')('cucumber');
    
    var setupFile;
    var config;
    
    this.Given(/^I have a src directory with a file "([^"]*)"$/, function (fileName, callback) {
        this.fileSystem.withFileInDirectory(fileName, "src", callback);
    });
    
    this.Given(/^I have an empty target directory$/, function (callback) {
        this.fileSystem.withEmptyDirectory("target", callback);
    });
    
    this.Given(/^I have an empty build file$/, function (callback) {
        config = {};
        callback();
    });
    
    this.Given(/^the build file is in the root of my application$/, function (callback) {
        this.fileSystem.withFileWithContentInDirectory("build.json", JSON.stringify(config), ".", callback);
    });
    
    this.Given(/^the build has the build steps "([^"]*)"$/, function (stepName, callback) {
        config[stepName] = {};
        callback();
    });
    
    this.Given(/^the build step "([^"]*)" has a task runner that cleans the target folder$/, function (stepName, callback) {
        var targetFolder = this.fileSystem.getFullDirectory("target");
        config[stepName]["clean"] = {
            "task" : "clean",
            "package": "grunt-contrib-clean",
            "options": {
                "force": true
            },
            "target": [targetFolder]
        };
        callback();
    });
    
    this.Given(/^the build step "([^"]*)" has a task group "([^"]*)"$/, function (stepName, groupName, callback) {
        config[stepName][groupName] = {};
        callback();
    });
    
    this.Given(/^the task group "([^"]*)" in the build step "([^"]*)" has a task runner that copies the src directory to the target directory$/, function (groupName, stepName, callback) {
        config[stepName][groupName]["copy"] = {
            "task": "copy",
            "package": "grunt-contrib-copy",
            "deployables": {
                "files": [
                    {
                        "expand": true,
                        "cwd": this.fileSystem.baseDirectory,
                        "src": "src/*.js",
                        "dest": "target/"
                    }
                ]
            }
        };
        callback();
    });
    
    this.When(/^I execute the build command$/, function (callback) {
        this.terminal.execute("../../../build --verbose", callback);
    });
    
    this.Then(/^all the steps should be executed in the precise order$/, function (callback) {
        var template = 'Running "{what}" task';
        var _ = this;
        var tasks = [];
        var steps = Object.keys(config);
        var traverse = function (config, item, parents) {
            var node = config[item];
            if (!node) return;
            var name = (parents) ? parents + "/" + item : item;
            tasks.push(template.replace("{what}", name));
            if (node["task"]) return;
            
            var children = Object.keys(node);
            children.forEach(function (child) {
                traverse(node, child, name);
            });
        };      
        steps.forEach(function(step) {  
            traverse(config, step);
        });
        
        var lastIndex = -1;
        tasks.forEach(function (task) {
            _.terminal.output.should.contain(task);
            var index = _.terminal.output.indexOf(task);
            index.should.be.gt(lastIndex);
            lastIndex = index;
        });

        callback();
    });
    
    this.Then(/^the file "([^"]*)" should exist in folder "([^"]*)"$/, function (fileName, folder, callback) {
        this.fileSystem.isFileInDirectory(fileName, folder).should.be.true;
        callback();
    });
};

module.exports = runningBuild;