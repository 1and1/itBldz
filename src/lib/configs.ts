import models = require('./models');

export interface ConfigurationService {
    load(config, callback: (models: models.Configuration[]) => void);
}

export class BuildConfigurationService {

    public loadTasks(parent: string, step: any): models.Task[]{

        if (!step) return [];
        var tasks = Object.keys(step);
        var result: models.Task[] = [];
        result = tasks.map((task) => {
            var result: models.Task;
            if (step[task]["task"]) {
                result = new models.TaskRunner();
                result.parent = parent;
                result.name = task;
                (<models.TaskRunner>result).task = step[task].task;
                (<models.TaskRunner>result).package = step[task].package;
            }
            else {
                result = new models.TaskGroup();
                result.parent = parent;
                result.name = task;
                (<models.TaskGroup>result).tasks = this.loadTasks(result.qualifiedName, step[task]);
            }

            return result;
        });
        return result;
    }

    public load(build): models.BuildStep[] {
        var steps = Object.keys(build);
        var result: models.BuildStep[] = steps.map((step) => {
            return {
                name: step,
                tasks: this.loadTasks(step, steps[step])
            };
        });

        return result;
    }
}