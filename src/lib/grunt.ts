export class Grunt {
    grunt;

    public constructor(grunt) {
        this.grunt = grunt;
    }

    public registerTask(name: string, description: string, callback: () => void) {
        this.grunt.registerTask(name, description, callback);
    }

    public initConfig(config : any) {
        this.grunt.initConfig(config);
    }

    public run(task : string) {
        this.grunt.task.run(task);
    }
}