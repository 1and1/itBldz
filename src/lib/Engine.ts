import config = require('./configs');
import tasks = require('./tasks');
import grunt = require('./grunt');
import environment = require('./environment');

import logging = require('./logging');
var log = new logging.Log();

export class Engine {
    currentEngine;
    grunt: grunt.Grunt;
    configuration: config.ConfigurationService;
    taskService: tasks.ConfigTaskRegistrationService;

    public constructor(grunt: grunt.Grunt, configuration, taskService) {
        this.grunt = grunt;
        this.configuration = configuration;
        this.taskService = taskService;
    }

    public startUp(configuration, callback: (tasks: string[]) => void) {
        log.verbose.writeln(this.currentEngine, "Loading configuration...");
        this.configuration.load(configuration, (config) => {
            log.verbose.writeln(this.currentEngine, "Configuration loaded!");
            log.verbose.writeln(this.currentEngine, "\tSteps:\t\t" + (config.steps ? config.steps.length : 0));
            log.verbose.writeln(this.currentEngine, "\tBuildTasks:\t" + (config.steps ? config.steps.reduce((_: any, current) => _ + (current.tasks ? current.tasks.length : 0), 0) : 0));
            this.taskService.register(config);
            callback(this.grunt.registeredTasks);
        });
    }

    public static get(g): Engine {
        var currentAction = environment.Action.get();
        switch (environment.Action.get()) {
            case environment.ActionType.Build:
                var engine = new BuildEngine(new grunt.Grunt(g));
                log.writeln("itbldz", "Build engine loaded!");
                return engine;
            case environment.ActionType.Deploy:
                var engine = new DeployEngine(new grunt.Grunt(g));
                log.writeln("itbldz", "Deploy engine loaded!");
                return engine;
            case environment.ActionType.Ship:
                var engine = new ShipEngine(new grunt.Grunt(g));
                log.writeln("itbldz", "Ship engine loaded!");
                return engine;
            case environment.ActionType.Init:
                var engine = new InitializeEngine(new grunt.Grunt(g));
                log.writeln("itbldz", "Initialzation engine loaded!");
                return engine;
            case environment.ActionType.Watch:
                var engine = new WatchEngine(new grunt.Grunt(g));
                log.writeln("itbldz", "Watch engine loaded!");
                return engine;

        }

        throw Error("No engine available");
    }
}

export class BuildEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
        this.currentEngine = "BuildEngine";
    }
}

export class DeployEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
        this.currentEngine = "DeployEngine";
    }
}

export class ShipEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
        this.currentEngine = "ShipEngine";
    }
}

export class InitializeEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
        this.currentEngine = "InitializationEngine";
    }
}

export class WatchEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
        this.currentEngine = "WatchEngine";
    }
}