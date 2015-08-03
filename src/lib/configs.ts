/// <reference path="../../Scripts/typings/node/node.d.ts" />
import models = require('./models');
import logging = require('./logging');
import environment = require('./environment');
import deserializer = require('./deserialization');
import modules = require('./modules');
var log = new logging.Log();
var path = require('path');
var merge = require('merge');
var args = require('nopt')({}, {}, process.argv, 2);

export class ConfigurationFileLoaderService {
    static loadFile(fileName) : any {
        var file = path.join(global.basedir, fileName);
        if (!environment.FileSystem.fileExists(file)) throw "You have to create a '" + fileName + "' file with your build-configuration first";
        return require(file);
    }

    public static load(grunt : any) : any {
        var steps: any;
        var stepsFile: string;
        
        var build = (args.with || "build") + ".json";
        var deploy = (args.to || "deploy") + ".json";
        var configFile = (args.as || "config") + ".json";
        var varsFile = (args.vars || "vars") + ".yml";
        var _modules = (args.modules || "modules") + ".json";
        _modules = new modules.ModuleService().load(path.join(global.basedir, _modules));
        
        var currentAction = environment.Action.get();
        switch (environment.Action.get()) {
            case environment.ActionType.Build:
                steps = ConfigurationFileLoaderService.loadFile(build);
                break;
            case environment.ActionType.Deploy:
                steps = ConfigurationFileLoaderService.loadFile(deploy);
                break;
            case environment.ActionType.Ship:
                var withBuild = ConfigurationFileLoaderService.loadFile(build);
                var withDeploy = ConfigurationFileLoaderService.loadFile(deploy);
                steps = {
                    "build": withBuild,
                    "deploy": withDeploy
                };
                break;
            case environment.ActionType.Init:
                steps = {
                    "initialize": {
                        "itbldz": {
                            "task": "init-itbldz",
                            "package": "grunt-itbldz-init"
                        }
                    }
                };
                break;
            default:
                throw "No configuration for this build";
        }

        grunt.initConfig();
        grunt.config.set("modules", _modules);
        
        grunt.config.set("steps", new deserializer.ConfigurationTypeDeserializer(steps, _modules).deserialize());
        var packageFile = path.join(global.basedir, 'package.json');
        if (environment.FileSystem.fileExists(packageFile)) {
            grunt.config.set("pck", require(packageFile));
        }

        configFile = path.join(global.basedir, configFile);
        if (environment.FileSystem.fileExists(configFile)) {
            var config = require(configFile);
            config.directories = config.directories || {};
            config.directories.root =  config.directories.root || global.basedir;
            config.directories.itbldz = global.relativeDir;
            grunt.config.set("config", config);
        }
        
        varsFile = path.join(global.basedir, varsFile);
        if (environment.FileSystem.fileExists(varsFile)) {
            grunt.config.set("vars", require(varsFile));
        }

        grunt.config.set("env", new environment.Variables().get());

        var result = grunt.config.get("steps");
        grunt.initConfig();
        return result;
    }
}

export interface ConfigurationService {
    load(config, callback: (models: models.Configuration) => void);
}

export class TaskRunnerConfigurationService {
    public get(task, parent, currentStep): models.TaskRunner {
        var result = new models.TaskRunner();
        result.parent = parent;
        result.name = task;
        result.config = {};
        result.config[currentStep.task] = currentStep;
        (<models.TaskRunner>result).task = currentStep.task;
        (<models.TaskRunner>result).package = currentStep.package;
        (<models.TaskRunner>result).dependencies = currentStep.dependencies;
        return result;
    }
}

export class BuildConfigurationService implements ConfigurationService {
    argv;

    public constructor(argv = require('yargs').argv) {
        this.argv = argv;
    }

    public loadTasks(parent: string, step: any): models.Task[]{

        log.verbose.writeln("Config", "Loading for step " + JSON.stringify(step, undefined, 2));
        if (!step) return [];
        var tasks = Object.keys(step);
        var result: models.Task[] = [];
        result = tasks.map((task) => {
            var result: models.Task;
            var currentStep = step[task];
            if (currentStep["task"]) {
                result = new TaskRunnerConfigurationService().get(task, parent, currentStep);
            }
            else {
                result = new models.TaskGroup();
                result.parent = parent;
                result.name = task;
                (<models.TaskGroup>result).tasks = this.loadTasks(result.qualifiedName, currentStep);
            }

            return result;
        });
        return result;
    }

    public load(build, callback: (models: models.Configuration) => void): void {
        var steps = Object.keys(build);

        var actions = ["build", "deploy", "ship", "init"];
        var selectedTasks = <string[]>this.argv._.filter((_) => (actions.every((action) => action != _)));
        log.verbose.writeln("config", "Tasks selected to run=" + JSON.stringify(selectedTasks));

        var result: models.BuildStep[] = steps.map((step) => {
            return {
                name: step,
                tasks: this.loadTasks(step, build[step])
            };
        });

        if (selectedTasks.length > 0) {
            var reduce = (current : models.Task[]) => {
                var result: models.Task[] = [];
                if (current.length < 1) return result;
                current.forEach((_) => {
                    if (selectedTasks.every((selected) => selected.indexOf(_.qualifiedName) !== 0 && _.qualifiedName.indexOf(selected) !== 0)) return;
                    result.push(_);
                    if (_._t === "TaskGroup") {
                        result = result.concat(reduce((<models.TaskGroup>_).tasks));
                    }
                });
                return result;
            }

            result = result.filter((step) => {
                return selectedTasks.some((_) => _ == step.name || (_.indexOf('/') >= 0 && _.split("/")[0] == step.name));
            });

            result.forEach((step) => {
                step.tasks = reduce(step.tasks);
            });
        }

        var buildConfiguration = {
            steps : result
        };

        callback(buildConfiguration);
    }
}