var runningBuild = function () {
    this.World = require("../support/World").World;
    require('chai').should();

    var fs = require('fs');

    var setupFile;
    var config;
    var modules;
    var vars;
    var scenarios = {};

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

    this.Given(/^I have an empty vars file$/, function (callback) {
        vars = "";
        callback();
    });

    this.Given(/^I have a build scenario file "([^"]*)"$/, function (name, callback) {
        scenarios[name] = "steps:";
        callback();
    });

    this.Given(/^the scenario "([^"]*)" executes the step "([^"]*)"$/, function (name, step, callback) {
        scenarios[name] += "\n- \"" + step + "\"";
        callback();
    });

    this.Given("the build file is in the root of my application", function (callback) {
        this.fileSystem.withFileWithContentInDirectory("build.json", JSON.stringify(config), ".", callback);
    });

    this.Given(/the scenario file "([^"]*)" is in the root of my application$/, function (name, callback) {
        this.fileSystem.withFileWithContentInDirectory(name + ".yml", scenarios[name], ".", callback);
    });

    this.Given("the modules file is in the root of my application", function (callback) {
        this.fileSystem.withFileWithContentInDirectory("modules.json", JSON.stringify(modules), ".", callback);
    });

    this.Given(/^the build file is in the root of my application with the name "([^"]*)"$/, function (name, callback) {
        this.fileSystem.withFileWithContentInDirectory(name, JSON.stringify(config), ".", callback);
    });

    this.Given(/^I have a file "([^"]*)" with the following content$/, function (name, content, callback) {
        this.fileSystem.withFileWithContentInDirectory(name, content, ".", callback);
    });

    this.Given(/^the build has the build steps "([^"]*)"$/, function (stepName, callback) {
        config[stepName] = {};
        callback();
    });

    this.Given(/^the build step "([^"]*)" has a task runner that cleans the target folder$/, function (stepName, callback) {
        var targetFolder = this.fileSystem.getFullDirectory("target");
        config[stepName]["clean"] = {
            "task": "clean",
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
    
    

    this.Given(/^the task group "([^"]*)" in the build step "([^"]*)" has a task runner that copies the src directory to the target directory and calls the function "([^"]*)" from script "([^"]*)"$/, function (groupName, stepName, funct, script, callback) {
        config[stepName][groupName]["copy"] = {
            "task": "copy",
            "package": "grunt-contrib-copy",
            "deployables": {
                "files": [
                    {
                        "expand": true, "flatten": true,
                        "cwd": this.fileSystem.baseDirectory,
                        "src": ["src/*.js"],
                        "dest": "target/",
                        "rename" : { 
                            "serialized:type" : "Function",
                            "serialized:object" : { "src": script },
                            "serialized:call" : funct
                        }
                    }
                ]
            }
        };
        callback();
    });

    this.Given(/^the module HelloWorld is defined and exists$/, function (callback) {
        modules.push("HelloWorld.js");
        var self = this;
        this.fileSystem.readFile("../../support/HelloWorld.js", function (moduleContent) {
            self.fileSystem.withFileWithContentInDirectory("HelloWorld.js", moduleContent, ".", callback);
        });
    });

    this.Given(/^the build step "([^"]*)" has a exec task runner with the command "([^"]*)"$/, function (buildStepName, command, callback) {
        config = {
            buildStepName: {
                "hello world": {
                    "task": "exec",
                    "package": "grunt-exec",
                    "echo-module": {
                        "cmd": command
                    }
                }
            }
        };
        callback();
    });

    this.Given(/^the build step echo has a exec task runner with a type discriminator for the HelloWorld Module with "(.*)" as actor$/, function (arg1, callback) {
        config = {
            "test-module": {
                "hello world": {
                    "task": "exec",
                    "package": "grunt-exec",
                    "echo-module": {
                        "cmd": {
                            "serialized:type": "modules.HelloWorld",
                            "serialized:object": "{ \"defaultPersonToGreet\" : \"" + arg1 + "\"  }",
                            "serialized:call": "greet"
                        }
                    }
                }
            }
        };
        callback();
    });

    this.Given(/^the variable "([^"]*)" exists under "([^"]*)"$/, function (innerVariable, outerVariable, callback) {
        vars += outerVariable + ":\n  " + innerVariable + ": Hello world"
        callback();
    });

    this.Given(/^the vars file is in the root of my application$/, function (callback) {
        this.fileSystem.withFileWithContentInDirectory("vars.yml", vars, ".", callback);
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
        steps.forEach(function (step) {
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
        _.terminal.output.should.contain(arg1);
        callback();
    });

    this.Then(/^the step "([^"]*)" should have been executed$/, function (task, callback) {
        var expected = "Running \"" + task + "\" task";
        var _ = this;
        _.terminal.output.should.contain(expected);
        callback();
    });

    this.Then(/^the step "([^"]*)" should not have been executed$/, function (task, callback) {
        var not_expected = "Running \"" + task + "\" task";
        var _ = this;
        _.terminal.output.should.not.contain(not_expected);
        callback();
    });
};

module.exports = runningBuild;