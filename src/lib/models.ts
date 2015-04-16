export interface BuildStep {
    name: string;
    tasks: Task[];
}

export class Task {
    _t: string;
    parent: string;
    name: string;
    config: any;
    execute: string;

    get qualifiedName(): string {
        return this.parent + "/" + this.name;
    }
}

export class TaskGroup extends Task implements BuildStep {
    _t: string = "TaskGroup";
    tasks: Task[];
}

export class TaskRunner extends Task {
    _t: string = "TaskRunner";
    task: string;
    package: string;
}

export interface Configuration {
    steps: BuildStep[];
}

export interface Build extends Configuration {
}

export interface Deploy extends Configuration {
}