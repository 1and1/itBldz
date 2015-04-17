import logging = require('./logging');
import npm = require('./npm-package');
var log = new logging.Log();

export class Grunt {
    grunt;
    registeredTasks: string[] = [];

    public constructor(grunt) {
        this.grunt = grunt;
    }

    public registerExternalTask(name: string, callback) {
        new npm.Package().installIfFileNotExist(name, () => {
            process.chdir(global.relativeDir);
            this.grunt.loadNpmTasks(name);
            process.chdir(global.basedir);
            callback();
        });
    }

    public registerTask(name: string, description: string, onTaskStart: () => void) {
        if (this.registeredTasks.some((_) => _ === name)) { return; }
        this.registeredTasks.push(name);
        this.grunt.registerTask(name, description, onTaskStart);
        log.verbose.writeln("Grunt", "Loaded task " + name);
    }

    public initConfig(config : any) {
        this.grunt.initConfig(config);
    }

    public run(task : string) {
        this.grunt.task.run(task);
    }
}