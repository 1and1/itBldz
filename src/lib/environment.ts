export class Variables {
    public get() {
        var self = {};

        Object.keys(process.env).forEach(function (key) {
            self[key] = process.env[key];
        });

        return self;
    }
}

export enum ActionType {
    Build,
    Deploy,
    Ship
}

export class Action {    
    public static get(): ActionType {
        var _ = require('yargs').argv._;
        if (_.some((_) => _ == "build")) {
            return ActionType.Build;
        }
        else if (_.some((_) => _ == "deploy")) {
            return ActionType.Deploy;
        }
        else if (_.some((_) => _ == "ship")) {
            return ActionType.Ship;
        }
    }
}