var runningBuild = function () {
    this.World = require("../support/World").World;
    require('chai').should();
    
    var setupFile;
    var config;
    var modules;
    
    this.Given(/^I have a src directory with a file "([^"]*)"$/, function (fileName, callback) {
        this.fileSystem.withEmptyDirectory(".", callback);
        this.fileSystem.withFileInDirectory(fileName, "src", callback);
    });
    
    this.Given(/^I have an empty target directory$/, function (callback) {
        this.fileSystem.withEmptyDirectory("target", callback);
    });
    
    this.Given(/^I have an empty build file$/, function (callback) {
        config = {};
        callback();
    });
    
    this.Given(/^I have an empty modules file$/, function (callback) {
        modules = [];
        callback();
    });
    
    this.Given("the build file is in the root of my application", function (callback) {
        this.fileSystem.withFileWithContentInDirectory("build.json", JSON.stringify(config), ".", callback);
    });
    
    this.Given("the modules file is in the root of my application", function (callback) {
        this.fileSystem.withFileWithContentInDirectory("modules.json", JSON.stringify(modules), ".", callback);
    });
    
    this.Given(/^the build file is in the root of my application with the name "([^"]*)"$/, function (name, callback) {
        this.fileSystem.withFileWithContentInDirectory(name, JSON.stringify(config), ".", callback);
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
                        "expand": true, "flatten": true,
                        "cwd": this.fileSystem.baseDirectory,
                        "src": ["src/*.js"],
                        "dest": "target/"
                    }
                ]
            }
        };
        callback();
    });
    
    this.Given(/^the module HelloWorld is defined and exists$/, function (callback) {
        modules.push(require('path').join(this.fileSystem.baseDirectory, "HelloWorld.js"));
        var helloWorld = "var HelloWorld = (function () { function HelloWorld() {}; HelloWorld.prototype.greet = function (name) { return \"Hello \" + name; }; return HelloWorld; })(); exports.HelloWorld = HelloWorld;";
       this.fileSystem.withFileWithContentInDirectory("HelloWorld.js", helloWorld, ".", callback);
    });

    this.Given(/^the build step "([^"]*)" has a exec task runner with the command "([^"]*)"$/, function (arg1, arg2,callback) {
      config = {
        "test-module": {
            "hello world" : {
                "task": "exec",
                "package": "grunt-exec",
                "echo-module" : {
                    "cmd" : "echo '<%= modules.HelloWorld.greet('me') %>'"
                }
            }
         }
      };
      callback();
    });
    
    this.When("I execute the build command", function (callback) {
        this.terminal.execute("../../../../build", callback);
    });
    
    this.When(/^I execute a custom build command with argument "([^"]*)"$/, function (arg, callback) {
        this.terminal.execute("../../../../build " + arg, callback);
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

    this.Then(/^the message "([^"]*)" should appear on the command line$/, function (arg1, callback) {
      var _ = this;
      _.terminal.output.should.contain("Hello me");
      callback();
    });
};

module.exports = runningBuild;