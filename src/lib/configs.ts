/// <reference path="../../Scripts/typings/node/node.d.ts" />
import models = require('./models');
import logging = require('./logging');
import environment = require('./environment');
var log = new logging.Log();
var path = require('path');
var merge = require('merge');
var args = require('nopt')({}, {}, process.argv, 2);

interface IDeserializeAType {
    type : RegExp;
    deserialize(type, value, call) : any;
}

class DeserializationHelper {
    public static toObject(value) {
        var data = value;
        if (Object.prototype.toString.call(value) === "[object String]") {
            data = JSON.parse(value);
        }
        
        return data;
    }
}

class DeserializeRegex implements IDeserializeAType {
    type : RegExp = /^RegExp$/gi;
    public deserialize(type, value, call) {
        try {
            var data = DeserializationHelper.toObject(value);                
            return new RegExp(data.pattern, data.flags);
        }
        catch(err) {
            return new RegExp(value);
        }
    }
}

export class ModuleService {
    static modules;
    
    public load(modulesDefinition) : any {
        log.verbose.writeln("Config", "modulesDefinition: " + modulesDefinition);
        if (!environment.FileSystem.fileExists(modulesDefinition)) return {};
        
        if (ModuleService.modules) return ModuleService.modules;
        
        var modules : any = {};
        var loadedModules = require(modulesDefinition);
        
        loadedModules.forEach((module) => {
            var requiredModule = require(module);
            log.verbose.writeln("ModuleService", "Loaded " + Object.keys(requiredModule) + " modules from file " + module);
            Object.keys(requiredModule).forEach((exportedClass) => {
                modules[exportedClass] = new (requiredModule[exportedClass])();
            });
        });
        
        log.verbose.writeln("ModuleService", Object.keys(modules).length + " modules loaded");
        log.verbose.writeln("ModuleService", JSON.stringify(modules));
        ModuleService.modules = modules;
        return modules;
    }
}

class DeserializeModule implements IDeserializeAType {
    type : RegExp = /^modules\./gi;
    modules;
    
    constructor(modules) {
        this.modules = modules;
    }
    
    public deserialize(type : string, value : string, call : string) {
        type = type.replace(this.type, "");
        log.verbose.writeln("DeserializeModule", "Deserializing module " + type + "...");
        var currentModule = this.modules[type];
        var self = this;
        
        if (!currentModule) throw new Error("A module that was specified could not be loaded. Module: " + type);
        if (currentModule.deserialize) {
            return function() { currentModule.deserialize(value); return currentModule[call].apply(currentModule, arguments); };
        }
        
        try {
            var valueAsObject = DeserializationHelper.toObject(value);
            log.verbose.writeln("DeserializeModule", "Applying " + JSON.stringify(value) + " to " + JSON.stringify(currentModule));
            Object.keys(valueAsObject).forEach((key) => {
               currentModule[key] = valueAsObject[key];
            });
            log.verbose.writeln("DeserializeModule", "Result: " + JSON.stringify(currentModule));
            
            return function () { return currentModule[call].apply(currentModule, arguments); };
        } catch (err) {}
        
        return function () { return currentModule[call].apply(currentModule, arguments); };
    }
}

class EmptyDeserializer implements IDeserializeAType {
    type;
    public deserialize(type, value, call) {
        return value;
    }
}

class DeserializerFactory {
    deserializers : IDeserializeAType[] = [new DeserializeRegex()];
        
    public constructor(modules) {
        this.deserializers.push(new DeserializeModule(modules));
    }
        
    public get(type : string) : IDeserializeAType {
        log.verbose.writeln("DeserializerFactory", "Testing type " + type);
        return this.deserializers.filter((item) => item.type.test(type))[0] || 
            new EmptyDeserializer();
    }
}

class ConfigurationTypeDeserializer {
    config : any;
    deserializerFactory : DeserializerFactory;
    
    public constructor(config, modules) { 
        this.config = config; 
        this.deserializerFactory = new DeserializerFactory(modules);
    }
    
    private serializeByDisriminator(type, value, call) : any {
        return this.deserializerFactory.get(type).deserialize(type, value, call);
    }
    
    private forEachKeyIn(object) : any {
        if (Array.isArray(object)){
            for (var index = 0; index < object.length; index++) {
                object[index] = this.forEachKeyIn(object[index]);
            }
            
            return object;
        }
        
        if (object !== Object(object)) return object;
        log.verbose.writeln("ConfigurationTypeDeserializer", "Current object: " + JSON.stringify(object));
        if (object["serialized:type"]) {
            var serialized = this.serializeByDisriminator(object["serialized:type"], object["serialized:object"], object["serialized:call"]);
            log.verbose.writeln("ConfigurationTypeDeserializer", "Serialized " + object["serialized:type"] + " to " + JSON.stringify(serialized));
            return serialized;
        }
        
        var result = {};
        
        Object.keys(object).forEach((key) => {
            result[key] = this.forEachKeyIn(object[key]);
        });
        
        return result;
    }
    
    public deserialize() : any {
        return this.forEachKeyIn(this.config);
    }
}

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
        var modules = (args.modules || "modules") + ".json";
        modules = new ModuleService().load(path.join(global.basedir, modules));
        
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
        grunt.config.set("modules", modules);
        
        grunt.config.set("steps", new ConfigurationTypeDeserializer(steps, modules).deserialize());
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