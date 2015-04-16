import models = require('./models');
import grunt = require('./grunt');

export class TaskRegisterService {
    grunt: grunt.Grunt;

    public constructor(grunt: grunt.Grunt) {
        this.grunt = grunt;
    }

    registerTaskGroup(task: models.TaskGroup) {
        task.tasks.forEach((_) => this.registerTask(_));
    }

    registerTaskRunner(task: models.TaskRunner) {
        this.grunt.registerTask(task.qualifiedName, "Automated Build Step", () => {
            this.grunt.initConfig(task.config);
            this.grunt.run(task.execute);
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

export class ConfigTaskRegistrationService {
    grunt: grunt.Grunt;
    taskRegisterService: TaskRegisterService;

    public constructor(grunt: grunt.Grunt,
        taskRegisterService = new TaskRegisterService(grunt)) {
        this.taskRegisterService = taskRegisterService;
        this.grunt = grunt;
    }

    public register(config: models.Configuration) {
        var result : string[] = [];
        config.steps.forEach((step) => {
            this.grunt.registerTask(step.name, "Build Step for " + step.name, () => {
                step.tasks.map((_) => _.qualifiedName).forEach(this.grunt.run);
            });

            step.tasks.forEach(this.taskRegisterService.registerTask);
        });
    }
}