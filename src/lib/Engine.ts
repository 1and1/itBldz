import config = require('./configs');
import tasks = require('./tasks');
import grunt = require('./grunt');

import logging = require('./logging');
var log = new logging.Log();

export class Engine {
    grunt: grunt.Grunt;
    configuration: config.ConfigurationService;
    taskService: tasks.ConfigTaskRegistrationService;

    public constructor(grunt: grunt.Grunt, configuration, taskService) {
        this.grunt = grunt;
        this.configuration = configuration;
        this.taskService = taskService;
    }

    public startUp(configuration, callback: (tasks: string[]) => void) {
        callback([]);
    }

    public static get(g): Engine {
        if (require('yargs').argv._.some((_) => _ == "build")) {
            var engine = new BuildEngine(new grunt.Grunt(g));
            log.writeln("itbldz", "Build engine loaded!");
            return engine;
        }

        throw Error("No engine available");
    }
}

export class BuildEngine extends Engine {
    public constructor(grunt: grunt.Grunt, configuration = new config.BuildConfigurationService(), taskService = new tasks.ConfigTaskRegistrationService(grunt)) {
        super(grunt, configuration, taskService);
    }

    public startUp(configuration, callback : (tasks : string[]) => void): void{
        log.verbose.writeln("BuildEngine", "Loading configuration...");
        this.configuration.load(configuration, (config) => {
            log.verbose.writeln("BuildEngine", "Configuration loaded!");
            log.verbose.writeln("BuildEngine", "\tSteps:\t\t" + (config.steps ? config.steps.length : 0));
            log.verbose.writeln("BuildEngine", "\tBuildTasks:\t" + (config.steps ? config.steps.reduce((_: any, current) => _ + (current.tasks ? current.tasks.length : 0), 0) : 0));
            this.taskService.register(config);
            callback(this.grunt.registeredTasks);
        });
    }
}