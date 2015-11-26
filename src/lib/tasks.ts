import models = require('./models');
import grunt = require('./grunt');
import logging = require('./logging');
var log = new logging.Log();
var async = require('async');

export class TaskExecutionPrepareService {
        
    private static gruntifyItem(task) {
        delete task.task;
        delete task.package;
        delete task.dependencies;
        return task;
    }
    
    private static gruntifyPart(task, config, result) {
         if (!config) return config;
         if (task == "watch") {
             log.verbose.writeln("gruntifyPart", "Gruntifing Watch Task");
             return { "watch" : config };
         }
         else if (!config["task"]) {
             log.verbose.writeln("gruntifyPart", "Gruntifing Task Group " + task);
             try {
                Object.keys(config).forEach((item) => {
                    result = this.gruntifyPart(item, config[item], result);
                });
             } catch (error) {
                 log.error("gruntifyPart", error);
             }
             
             return result;
        }
        else {
            log.verbose.writeln("gruntifyPart", "Gruntifing Task Runner " + task);
            var name = config.task;
            result[name] = this.gruntifyItem(config);
        }
        
        return result;
    }
    
    public static gruntifyTask(config, task): any {
        if (!config) throw "A task requires a configuration to run";
        task = task.split(":")[0];
        delete config[task].task;
        delete config[task].package;
        delete config[task].dependencies;
    }
    
    public static gruntifyConfig(config: any) :any {
        var gruntConfig = {};
        Object.keys(config).forEach((step) => {
            gruntConfig = this.gruntifyPart(step, config[step], gruntConfig);
        });
        
        return gruntConfig;
    }
    
    public static initTaskConfig(grunt, task, config): any {
        if (!config) throw "A task requires a configuration to run";
        TaskExecutionPrepareService.gruntifyTask(config, task);
        grunt.initConfig(config);
    }
}

export class TaskRegisterService {
    grunt: grunt.Grunt;

    public constructor(grunt: grunt.Grunt) {
        this.grunt = grunt;
    }

    registerTaskGroup(task: models.TaskGroup) {
        log.verbose.writeln("Tasks", "Register task group " + task.qualifiedName + " with " + task.tasks.length + " subtasks");
        this.grunt.registerTask(task.qualifiedName, "Automated Task Group", function () {});
        task.tasks.forEach((_) => this.registerTask(_));
    }

    registerTaskRunner(task: models.TaskRunner) {
        log.verbose.writeln("Tasks", "Register task runner " + task.qualifiedName + " with task " + task.task + "@" + task.package);

        var _ = this;
        this.grunt.registerTask(task.qualifiedName, "Automated Task Runner", function () {
            var done = this.async();
            _.grunt.registerExternalTask(task.package, task.dependencies, () => {
                TaskExecutionPrepareService.initTaskConfig(_.grunt, task.task, task.config);
                log.verbose.writeln("Tasks", 'Current Config:' + JSON.stringify(_.grunt.grunt.config()));
                _.grunt.run(task.task);
                log.verbose.writeln("Tasks", "Running task " + task.task + "... ");
                done();
            });
        });
    }

    public registerTask(task: models.Task) {
        if (task instanceof models.TaskGroup) {
            this.registerTaskGroup(<models.TaskGroup>task);
        }
        else if (task instanceof models.TaskRunner) {
            this.registerTaskRunner(<models.TaskRunner>task);
        }
    }
}

export interface IRegisterTasksService {
    register(config: models.Configuration, callback : () => void);
}

export class ConfigTaskRegistrationService implements IRegisterTasksService {
    grunt: grunt.Grunt;
    taskRegisterService: TaskRegisterService;

    public constructor(grunt: grunt.Grunt,
        taskRegisterService = new TaskRegisterService(grunt)) {
        this.taskRegisterService = taskRegisterService;
        this.grunt = grunt;
    }

    public register(config: models.Configuration, callback) {
        var result: string[] = [];
        config.steps.forEach((step) => {
            this.grunt.registerTask(step.name, "Build Step for " + step.name, () => { });

            step.tasks.forEach((_) => this.taskRegisterService.registerTask(_));
            callback();
        });
    }
}

export class GruntWatchRegistrationService implements IRegisterTasksService {
    grunt: grunt.Grunt;
    taskRegisterService: TaskRegisterService;

    public constructor(grunt: grunt.Grunt,
        taskRegisterService = new TaskRegisterService(grunt)) {
        this.taskRegisterService = taskRegisterService;
        this.grunt = grunt;
    }

    public register(config: models.Configuration, callback : () => void) {
        var result: string[] = [];
        var storedConfig = this.grunt.grunt.config();
        this.grunt.registerExternalTask("grunt-contrib-watch", ["glob", "minimatch"], () => {
            log.verbose.writeln("GruntWatchRegistrationService", "grunt-contrib-watch loaded");
            
            log.verbose.writeln("GruntWatchRegistrationService", "loading " + config.steps.length + " steps...");
                        
            var steps = config.steps.map((step) => {
                return (callback) => {
                    log.verbose.writeln("GruntWatchRegistrationService", "registering step " + step.name);
                    var tasks = step.tasks.map((_) => {
                        return (callback) => {
                            log.verbose.writeln("GruntWatchRegistrationService", "registering external task " + _.name);
                            this.grunt.registerExternalTask((<any>_).package, [], callback);
                        };
                    });
                    async.parallel(tasks, callback);
                };
            });
            
            async.parallel(steps, () => {
                var gruntifiedConfig = TaskExecutionPrepareService.gruntifyConfig(storedConfig);
                this.grunt.initConfig(gruntifiedConfig);
                this.grunt.grunt.task.run("watch");
                callback();
            });         
        })
    }
}