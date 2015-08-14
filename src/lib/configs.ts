/// <reference path="../../Scripts/typings/node/node.d.ts" />

import models = require('./models');
import logging = require('./logging');
import environment = require('./environment');
import deserializer = require('./deserialization');
import modules = require('./modules');import tasks = require('./tasks');var log = new logging.Log();
var path = require('path');
var merge = require('merge');
var args = require('nopt')({}, {}, process.argv, 2);

export class ConfigurationLoaderServiceFactory {
    public static get() {
        var currentAction = environment.Action.get();
        switch (environment.Action.get()) {
            case environment.ActionType.Watch:
                return new WatchConfigurationService();
            default: 
                return new ConfigurationFileLoaderService();
        }
    }
}

export interface ConfigurationLoaderService {
    load(grunt : any) : any;
}

export class ConfigurationFileLoaderService implements ConfigurationLoaderService {
    static loadFile(fileName) : any {
        var file = path.join(global.basedir, fileName);
        if (!environment.FileSystem.fileExists(file)) throw "You have to create a '" + fileName + "' file with your build-configuration first";
        return require(file);
    }

    public load(grunt : any) : any {
        var steps: any;
        var stepsFile: string;
        
        var build = (args.with || "build") + ".json";
        var deploy = (args.to || "deploy") + ".json";
        var watch = (args.watch || "watch") + ".json";
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
            grunt.config.set("pkg", require(packageFile));
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

export class WatchConfigurationService implements ConfigurationLoaderService {
    public load(grunt : any) : any {
        
        var steps: any;
        var stepsFile: string;
        var build = ConfigurationFileLoaderService.loadFile('build.json');
        var watch = ConfigurationFileLoaderService.loadFile('watch.json');
        var run = {
            watch: {
                options: watch.options
            },
            steps : {}
        };
        
        Object.keys(watch).filter((target) => target !== "options").forEach((target) => {
            var watchedTasks = watch[target].tasks;
            if (!watchedTasks) return;
            var newWatchTargets = [];
            watchedTasks.forEach((task: string) => {
                var taskSet = task.split('/').reverse();
                var step = (set: string[], result) => {
                    var current = set.pop();
                    result = result[current];
                    if (set.length <= 0) return result;
                    return step(set, result);
                };

                var tasksToRun = step(taskSet, build);
                if (!tasksToRun.task) throw new Error("Only build-steps can be set as target");
                
                run.steps[tasksToRun.task] = tasksToRun;
                newWatchTargets.push(tasksToRun.task);
            });

            watch[target].tasks = newWatchTargets;
            run.watch[target] = watch[target];
        });

        grunt.initConfig();
        grunt.config.set("steps", run);
        var packageFile = path.join(global.basedir, 'package.json');
        if (environment.FileSystem.fileExists(packageFile)) {
            grunt.config.set("pck", require(packageFile));
        }

        var configFile = path.join(global.basedir, 'config.json');
        if (environment.FileSystem.fileExists(configFile)) {
            var config = require(configFile);
            config.directories = config.directories || {};
            config.directories.root =  config.directories.root || global.basedir;
            config.directories.itbldz = global.relativeDir;
            grunt.config.set("config", config);
        }

        grunt.config.set("env", new environment.Variables().get());

        var result = grunt.config.get("steps");
        grunt.initConfig(result);
        return result;
    }
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

class FilterBySelectedTasks {
    selectedTasks : string[];
    
    protected isParent(task, step) {
        return task.split("/")[0] == step.name
    }
    
    protected reduce(current: models.Task[]) {
        var result: models.Task[] = [];
        if (current.length < 1) return result;
        current.forEach((_) => {
            if (this.selectedTasks.every((selected) => 
                selected.indexOf(_.qualifiedName) !== 0 && _.qualifiedName.indexOf(selected) !== 0)) 
                return;
            
            if (_._t === "TaskGroup") {
                result = result.concat(this.reduce((<models.TaskGroup>_).tasks));
            } else {
                result.push(_);
            }
        });
        return result;
    }
    
}

class FilterTasksByArgumentsSelectionService extends FilterBySelectedTasks implements IFilterTasksBySelections {
    argv;
    
    public constructor(argv = require('yargs').argv) {
        this.argv = argv;
        super();
    }    
    
    public filter(allSteps : models.BuildStep[]) : models.BuildStep[] {
        var actions = ["build", "deploy", "ship", "init"];
        this.selectedTasks = <string[]>this.argv._.filter((_) => (actions.every((action) => action != _)));
        
        if (this.selectedTasks.length > 0) {
            log.verbose.writeln("filterByArgs", "Tasks selected to run=" + JSON.stringify(this.selectedTasks));
            allSteps = allSteps.filter((step) => {
                return this.selectedTasks.some((_) => _ == step.name || 
                    (_.indexOf('/') >= 0 && _.split("/")[0] == step.name));
            });

            allSteps.forEach((step) => {
                step.tasks = this.reduce(step.tasks);
            });
        }
        
        return allSteps;
    }
}

class FilterTaskByScenarioContext extends FilterBySelectedTasks implements IFilterTasksBySelections {
    argv;
    
    public constructor(argv = require('yargs').argv) {
        this.argv = argv;
        super();
    }
    
    public filter(allSteps : models.BuildStep[]) : models.BuildStep[] {
        if (!this.argv.scenario) return allSteps;
        log.verbose.writeln("filterByScenario", "Running scenario " + this.argv.scenario);
 
        var scenario = require(path.join(global.basedir, this.argv["scenario"] + ".yml"));
        if (!scenario) throw new Error("The specified scenario does not exist.");
        if (!scenario.steps) throw new Error("The scenario does not contain any steps");
        this.selectedTasks = scenario.steps;
        log.verbose.writeln("filterByScenario", "Tasks selected to run=" + JSON.stringify(this.selectedTasks));
 
        allSteps = allSteps.filter((step) => {
            return this.selectedTasks.some((_) => _ == step.name || 
                (_.indexOf('/') >= 0 && _.split("/")[0] == step.name));
        });

        allSteps.forEach((step) => {
            step.tasks = this.reduce(step.tasks);
        });
        
        return allSteps;
    }
}

interface IFilterTasksBySelections {
    filter(allSteps : models.BuildStep[]) : models.BuildStep[];
}

class FilterTaskSelectionFactory {
    filters : IFilterTasksBySelections[];
    
    public constructor(argv = require('yargs').argv) {
        this.filters = [
            new FilterTasksByArgumentsSelectionService(argv),
            new FilterTaskByScenarioContext(argv)
        ];
    }
    
    public applyTo(steps : models.BuildStep[]) {
        log.verbose.writeln("config", "Filtering tasks...");
        this.filters.forEach((_) => {
            steps = _.filter(steps);
        });
        
        return steps;
    }
}

export interface ConfigurationService {
    load(config, callback: (models: models.Configuration) => void);
}

export class BuildConfigurationService implements ConfigurationService {
    argv;

    public constructor(argv = require('yargs').argv) {
        this.argv = argv;
    }

    public loadTasks(parent: string, step: any): models.Task[] {
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

        var result: models.BuildStep[] = steps.map((step) => {
            return {
                name: step,
                tasks: this.loadTasks(step, build[step])
            };
        });
        
        result = new FilterTaskSelectionFactory(this.argv).applyTo(result);

        var buildConfiguration = {
            steps : result
        };

        callback(buildConfiguration);
    }
}

export class GruntConfigurationService extends BuildConfigurationService {
    public load(build, callback: (models: models.Configuration) => void): void {
        var steps = Object.keys(build);
        var result: models.BuildStep[] = steps
            .filter((step) => step != "watch")
            .map((step) => {
                return {
                    name: step,
                    tasks: this.loadTasks(step, build[step])
                };
            });

        // TODO: Add filter task selection
        //          right now all args are replaced
        // result = new FilterTaskSelectionFactory(this.argv).applyTo(result);
        var buildConfiguration = {
            steps : result
        };
                
        callback(buildConfiguration);
    }
}