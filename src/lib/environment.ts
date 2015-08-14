var fs = require('fs');
var _ = require('yargs').argv;

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
    Ship,
    Init,
    Watch
}

export class FileSystem {
    public static fileExists(filePath) {
        try {
            fs.statSync(filePath);
        } catch (err) {
            if (err.code == 'ENOENT') return false;
        }
        return true;
    }
}

export class Action {    
    public static get(): ActionType {
        if (_._.some((_) => _ == "build")) {
            return ActionType.Build;
        }
        else if (_._.some((_) => _ == "deploy")) {
            return ActionType.Deploy;
        }
        else if (_._.some((_) => _ == "ship")) {
            return ActionType.Ship;
        }
        else if (_._.some((_) => _ == "init")) {
            return ActionType.Init;
        }
        else if (_._.some((_) => _ == "watch")) {
            return ActionType.Watch;
        }
        else {
            throw new Error(`No action specified to run.

Syntax: 
    node itbldz.tz build|deploy|ship|init|watch`);
        }
    }
}

export class Settings {
    public static isVerbose() : boolean {
        return _.verbose || false;
    }
    
    public static showStack() : boolean {
        return _.stack || false;
    }
}